import fetch from 'node-fetch'

export async function askLocalOllama(prompt: string, model = 'llama2') {
  // Example: Ollama local REST API (adjust per your Ollama installation)
  const url = 'http://127.0.0.1:11434/complete'
  const body = { model, prompt }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
  const json: any = await res.json()
  // Response shape may vary - adapt to your Ollama version
  // Accept either { text: string } or other shapes
  if (json && typeof json.text === 'string') return json.text
  if (json && typeof json?.result === 'string') return json.result
  return JSON.stringify(json)
}

export async function askOpenAI(prompt: string) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY not set')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 800 })
  })
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`)
  const json: any = await res.json()
  // Common shape: { choices: [{ message: { content } }] }
  return json?.choices?.[0]?.message?.content ?? JSON.stringify(json)
}
