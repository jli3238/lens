import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

// import { Spinner } from '../../components/Spinner'
// import { selectAllSessions, fetchSessions } from './sessionsSlice'

const SessionExcerpt = ({ session }) => {
  return (
    <div className="dashboard-sessionList">
        <div>{session.title}</div>
        <div>{session.progress}</div>
    </div>
  )
}

export const Dashboard = () => {
  const dispatch = useDispatch()
  const sessions = [
    {
      id: 1,
      title: 'Session 1',
      progress: '20/30',
    },
    {
      id: 2,
      title: 'Session 2',
      progress: '0/30',
    },
    {
      id: 3,
      title: 'Session 3',
      progress: '0/30',
    },
  ]; //useSelector(selectAllSessions)

  const sessionStatus = useSelector((state) => state.status)
  const error = useSelector((state) => state.error)

  useEffect(() => {
    // if (sessionStatus === 'idle') {
    //   dispatch(fetchSessions())
    // }
  }, [sessionStatus, dispatch])

  let content

  // if (sessionStatus === 'loading') {
  //   content = <Spinner text="Loading..." />
  // } else if (sessionStatus === 'succeeded') {
    content = <div><div className="dashboard-sessionList"><div>Session</div><div>Progress</div></div>
      {sessions.map((session) => (<div>
        <SessionExcerpt key={session.id} session={session} />
      </div>))}
    </div>
  // } else if (sessionStatus === 'failed') {
  //   content = <div>{error}</div>
  // }

  return (<>
    <h2>Sessions</h2>
    <section className="sessions-list">
      {content}
    </section>
  </>)
}