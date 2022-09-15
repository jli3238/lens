import React from 'react'
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav>
      <section>
        <div className="menu">
          <div>Welcome back, Hannah! |</div>
          <div>Resources |</div>
          <div>FAQ |</div>
          <div className="logoutContainer">Log Out</div>
        </div>
        <h1>LENS</h1>
        <div className="navContent">
          <div className="navLinks">
            <Link to="/">Dashboard</Link>
          </div>
        </div>
      </section>
    </nav>
  )
}
