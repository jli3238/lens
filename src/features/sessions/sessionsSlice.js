import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../../api/client'

const initialState = {
  sessions: [],
  status: 'idle',
  error: null,
}

export const fetchSessions = createAsyncThunk('sessions/fetchSessions', async () => {
  const response = await client.get('/fakeApi/sessions')
  return response.data
})

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    sessionUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.posts.find((post) => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSessions.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { sessionUpdated } = sessionsSlice.actions

export default sessionsSlice.reducer

export const selectAllSessions = (state) => state.sessions

export const selectSessionById = (state, sessionId) =>
  state.sessions.find((session) => session.id === sessionId)