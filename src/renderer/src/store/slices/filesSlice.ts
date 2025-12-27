import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type FileItem = { name: string, path: string }

const filesSlice = createSlice({
  name: 'files',
  initialState: { files: [] as FileItem[], currentFile: '' as string },
  reducers: {
    setFiles(state, action: PayloadAction<FileItem[]>) { state.files = action.payload },
    setCurrentFile(state, action: PayloadAction<string>) { state.currentFile = action.payload }
  }
})

export const { setFiles, setCurrentFile } = filesSlice.actions
export default filesSlice.reducer
