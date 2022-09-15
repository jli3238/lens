import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'

import { Navbar } from './app/Navbar'

import { SessionsList } from './features/sessions/SessionsList'
import { Dashboard } from './features/sessions/Dashboard'
import { SingleSessionPage } from './features/sessions/SingleSessionPage'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <React.Fragment>
                <Dashboard />
                <SessionsList />
              </React.Fragment>
            )}
          />
          <Route exact path="/sessions/:sessionId" component={SingleSessionPage} />
          <Redirect to="/" />
        </Switch>
      </div>
    </Router>
  )
}

export default App
