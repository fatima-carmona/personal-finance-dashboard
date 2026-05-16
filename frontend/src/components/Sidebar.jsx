import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">◆</span> Ledger
      </div>
      <ul className="nav-list">
        <li>
          <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/transactions" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            Transactions
          </NavLink>
        </li>
        <li>
          <NavLink to="/categories" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            Categories
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            Settings
          </NavLink>
        </li>
      </ul>
      <div className="sidebar-footer">
        Signed in as <strong>{user?.username}</strong>
        <div>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </div>
    </aside>
  )
}
