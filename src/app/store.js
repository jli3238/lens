import { configureStore } from '@reduxjs/toolkit'

import sessionsReducer from '../features/sessions/sessionsSlice'
import usersReducer from '../features/users/usersSlice'

export default configureStore({
  reducer: {
    posts: sessionsReducer,
    users: usersReducer,
  },
})