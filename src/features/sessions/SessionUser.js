import React from 'react'
import { useSelector } from 'react-redux'

export const SessionUser = ({ userId }) => {
  const user = useSelector((state) =>
    state.users.find((user) => user.id === userId)
  )

  return <span>by {user ? user.name : 'Anonymous user'}</span>
}