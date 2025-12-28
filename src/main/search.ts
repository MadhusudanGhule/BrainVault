import fs from 'fs'
import path from 'path'

export type FileNode = {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

/**
 * Extract text from PDF (basic implementation - can be enhanced with pdf-parse library)
 */
async function extractPDFText(filePath: string): Promise<string | null> {
  try {
    // For now, return null - PDF text extraction requires pdf-parse or similar library
    // Users can install: npm install pdf-parse
    // Then uncomment and use:
    /*
    const pdfParse = require('pdf-parse')
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text
    */
    return null
  } catch (err) {
    console.error(`Error extracting PDF text from ${filePath}:`, err)
    return null
  }
}

/**
 * Get all searchable files from a file tree (text files and PDFs)
 */
function getAllSearchableFiles(tree: FileNode[]): Array<{ path: string; type: 'text' | 'pdf' }> {
  const files: Array<{ path: string; type: 'text' | 'pdf' }> = []
  
  function traverse(nodes: FileNode[]) {
    for (const node of nodes) {
      if (!node.isDirectory) {
        const ext = path.extname(node.name).toLowerCase()
        // PDFs
        if (ext === '.pdf') {
          files.push({ path: node.path, type: 'pdf' })
        }
        // Text files
        const textExts = ['.md', '.txt', '.json', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.sh', '.yaml', '.yml', '.xml', '.html', '.css', '.scss', '.sass', '.less', '.log', '.csv', '.doc', '.docx', '.rtf']
        if (textExts.includes(ext) || ext === '') {
          files.push({ path: node.path, type: 'text' })
        }
      } else if (node.children) {
        traverse(node.children)
      }
    }
  }
  
  traverse(tree)
  return files
}

/**
 * Search for relevant content in files based on query keywords
 */
export async function searchFiles(
  tree: FileNode[],
  query: string,
  maxFiles: number = 5,
  maxCharsPerFile: number = 2000
): Promise<Array<{ file: string; content: string; relevance: number }>> {
  const files = getAllSearchableFiles(tree)
  if (files.length === 0) return []
  
  const queryLower = query.toLowerCase().trim()
  if (!queryLower) return []
  
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)
  // If no words are long enough, use the whole query
  const searchTerms = queryWords.length > 0 ? queryWords : [queryLower]
  
  const results: Array<{ file: string; content: string; relevance: number }> = []
  
  for (const fileInfo of files) {
    const filePath = fileInfo.path
    try {
      let content: string | null = null
      
      if (fileInfo.type === 'pdf') {
        // Try to extract text from PDF
        content = await extractPDFText(filePath)
        if (!content) {
          // If PDF extraction fails, still include it with filename match
          const fileName = path.basename(filePath).toLowerCase()
          if (fileName.includes(queryLower)) {
            results.push({
              file: path.basename(filePath),
              content: '[PDF file - text extraction not available. Install pdf-parse for full text search.]',
              relevance: 5
            })
          }
          continue
        }
      } else {
        // Read text file
        try {
          content = fs.readFileSync(filePath, 'utf8')
          // Skip if file appears to be binary (contains null bytes or too many non-printable chars)
          if (content.includes('\0') || (content.length > 0 && (content.match(/[\x00-\x08\x0E-\x1F]/g) || []).length / content.length > 0.1)) {
            continue
          }
        } catch {
          continue // Skip files that can't be read as text
        }
      }
      
      if (!content) continue
      
      const contentLower = content.toLowerCase()
      
      // Calculate relevance score
      let relevance = 0
      
      // Check for exact phrase match (highest priority)
      if (contentLower.includes(queryLower)) {
        relevance += 20
      }
      
      // Check for individual word matches
      for (const word of searchTerms) {
        const wordCount = (contentLower.match(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')) || []).length
        if (wordCount > 0) {
          relevance += wordCount * 2
        }
      }
      
      // Bonus for filename match
      const fileName = path.basename(filePath).toLowerCase()
      if (fileName.includes(queryLower)) {
        relevance += 10
      }
      
      // Only include files with some relevance
      if (relevance > 0) {
        // Extract relevant snippet around matches
        let snippet = content
        if (content.length > maxCharsPerFile) {
          // Find first match position
          const firstMatch = contentLower.indexOf(searchTerms[0] || queryLower)
          if (firstMatch >= 0) {
            const start = Math.max(0, firstMatch - 500)
            const end = Math.min(content.length, firstMatch + maxCharsPerFile - 500)
            snippet = content.substring(start, end)
            if (start > 0) snippet = '...' + snippet
            if (end < content.length) snippet = snippet + '...'
          } else {
            snippet = content.substring(0, maxCharsPerFile) + '...'
          }
        }
        
        results.push({
          file: path.basename(filePath),
          content: snippet,
          relevance
        })
      }
    } catch (err) {
      // Skip files that can't be read
      console.error(`Error reading file ${filePath}:`, err)
    }
  }
  
  // Sort by relevance and return top results
  results.sort((a, b) => b.relevance - a.relevance)
  return results.slice(0, maxFiles)
}

/**
 * Build context prompt with relevant file content
 */
export async function buildContextPrompt(
  tree: FileNode[],
  userQuery: string
): Promise<string> {
  const searchResults = await searchFiles(tree, userQuery, 5, 2000)
  
  if (searchResults.length === 0) {
    return `You are a helpful AI assistant. The user has asked: "${userQuery}"

Note: I couldn't find relevant content in the user's files to answer this question. Please provide a helpful response based on your general knowledge.`
  }
  
  let context = `You are a helpful AI assistant helping the user with their personal notes and documents. The user has asked: "${userQuery}"\n\n`
  context += `Here is relevant content from the user's files:\n\n`
  
  for (const result of searchResults) {
    context += `--- File: ${result.file} ---\n`
    context += `${result.content}\n\n`
  }
  
  context += `\nPlease answer the user's question based on the context provided above. If the answer isn't in the provided context, you can use your general knowledge, but prioritize the user's own notes.`
  
  return context
}

