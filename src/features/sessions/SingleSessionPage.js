import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { SessionUser } from './SessionUser'
import { TimeAgo } from './TimeAgo'
import { selectSessionById } from './sessionsSlice'

export const SingleSessionPage = ({ match }) => {
  const { sessionId } = match.params

  const session = useSelector((state) => selectSessionById(state, sessionId))

  if (!session) {
    return (
      <section>
        <h2>Session not found!</h2>
      </section>
    )
  }

  return (
    <section>
      <article className="post">
        <h2>{session.title}</h2>
        <div>
          <SessionUser userId={session.user} />
          <TimeAgo timestamp={session.date} />
        </div>
        <p className="post-content">{session.content}</p>
        <Link to={`/editPost/${session.id}`} className="button">
          Edit Post
        </Link>
      </article>
    </section>
  )
}