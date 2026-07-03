import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { usePreferences } from '../context/PreferencesContext'

export default function Settings() {
  const { preferences, savePreferences, loaded } = usePreferences()
  const [form, setForm] = useState(preferences)
  const [saved, setSaved] = useState(false)

  // Keep local form in sync once preferences finish loading from the server
  React.useEffect(() => { setForm(preferences) }, [preferences])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaved(false)
    await savePreferences(form)
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

        {!loaded && <p>Loading…</p>}

        {loaded && (
          <div className="card" style={{ maxWidth: 420 }}>
            <div className="card-body">
              {saved && <div style={{ color: 'var(--income)', fontSize: 13, marginBottom: 12 }}>Preferences saved.</div>}
              <form onSubmit={handleSave}>
                <div className="field">
                  <label>Theme</label>
                  <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div className="field">
                  <label>Currency</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
                <div className="field">
                  <label>Default dashboard view</label>
                  <select value={form.defaultDashboardView} onChange={(e) => setForm({ ...form, defaultDashboardView: e.target.value })}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    id="emailNotif"
                    checked={form.emailNotifications}
                    onChange={(e) => setForm({ ...form, emailNotifications: e.target.checked })}
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

