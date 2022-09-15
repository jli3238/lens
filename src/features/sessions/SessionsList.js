import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { Spinner } from '../../components/Spinner'
import { SessionUser } from './SessionUser'
import { TimeAgo } from './TimeAgo'
import { selectAllSessions, fetchSessions } from './sessionsSlice'

const SessionExcerpt = ({ session }) => {
  return (
    <article className="post-excerpt" key={session.id}>
      <h3>{session.title}</h3>
      <div>
        <SessionUser userId={session.user} />
        <TimeAgo timestamp={session.date} />
      </div>
      <Link to={`/sessions/${session.id}`} className="button muted-button">
        View Session
      </Link>
    </article>
  )
}

export const SessionsList = () => {
  const dispatch = useDispatch()
  const sessions = useSelector(selectAllSessions)

  const sessionStatus = useSelector((state) => state.status)
  const error = useSelector((state) => state.error)

  useEffect(() => {
    if (sessionStatus === 'idle') {
      dispatch(fetchSessions())
    }
  }, [sessionStatus, dispatch])

  let content

  if (sessionStatus === 'loading') {
    content = <Spinner text="Loading..." />
  } else if (sessionStatus === 'succeeded') {
    content = sessions.map((session) => (
      <SessionExcerpt key={session.id} session={session} />
    ))
  } else if (sessionStatus === 'failed') {
    content = <div>{error}</div>
  }

  return (
    <section className="sessions-list">
      {content}
    </section>
  )
}