import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FileNode } from '../../global'

const filesSlice = createSlice({
  name: 'files',
  initialState: { 
    fileTree: [] as FileNode[], 
    currentFile: null as string | null,
    folderPath: null as string | null
  },
  reducers: {
    setFileTree(state, action: PayloadAction<{ tree: FileNode[], folderPath: string }>) { 
      state.fileTree = action.payload.tree
      state.folderPath = action.payload.folderPath
    },
    setCurrentFile(state, action: PayloadAction<string | null>) { 
      state.currentFile = action.payload 
    }
  }
})

export const { setFileTree, setCurrentFile } = filesSlice.actions
export default filesSlice.reducer
