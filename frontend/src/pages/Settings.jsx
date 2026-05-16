import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { getPreferences, updatePreferences } from '../api/preferenceApi'

export default function Settings() {
  const [prefs, setPrefs] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPreferences().then(setPrefs).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaved(false)
    const updated = await updatePreferences(prefs)
    setPrefs(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Preferences are stored per-account and sync across devices.</p>
        </div>

        {loading && <p>Loading…</p>}

        {prefs && (
          <div className="card" style={{ maxWidth: 420 }}>
            <div className="card-body">
              {saved && <div style={{ color: 'var(--income)', fontSize: 13, marginBottom: 12 }}>Preferences saved.</div>}
              <form onSubmit={handleSave}>
                <div className="field">
                  <label>Theme</label>
                  <select value={prefs.theme} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div className="field">
                  <label>Currency</label>
                  <select value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
                <div className="field">
                  <label>Default dashboard view</label>
                  <select value={prefs.defaultDashboardView} onChange={(e) => setPrefs({ ...prefs, defaultDashboardView: e.target.value })}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    id="emailNotif"
                    checked={prefs.emailNotifications}
                    onChange={(e) => setPrefs({ ...prefs, emailNotifications: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="emailNotif" style={{ marginBottom: 0 }}>Email me monthly summaries</label>
                </div>
                <button className="btn btn-primary" type="submit">Save preferences</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
