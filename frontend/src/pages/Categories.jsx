import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { getCategories, createCategory, deleteCategory } from '../api/categoryApi'

const swatches = ['#2F7A54', '#B1512F', '#B08A2E', '#3D5A80', '#8B5CF6', '#0EA5E9', '#DB2777', '#65A30D']

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', color: swatches[0] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getCategories().then(setCategories).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createCategory(form)
      setForm({ name: '', type: 'EXPENSE', color: swatches[0] })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create category')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Transactions using it will keep the reference.')) return
    try {
      await deleteCategory(id)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete category')
    }
  }

  const income = categories.filter(c => c.type === 'INCOME')
  const expense = categories.filter(c => c.type === 'EXPENSE')

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize how income and spending get labeled.</p>
        </div>

        <div className="content-grid">
          <div className="card">
            <div className="card-header"><h2 className="card-title">Expense categories</h2></div>
            <div className="card-body">
              {expense.map(c => (
                <div className="ledger-row" style={{ gridTemplateColumns: '1fr 32px' }} key={c.id}>
                  <div className="category-tag"><span className="dot" style={{ background: c.color }} />{c.name}</div>
                  <button className="icon-btn" onClick={() => handleDelete(c.id)}>✕</button>
                </div>
              ))}
              {!loading && expense.length === 0 && <div className="empty-state">No expense categories yet.</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2 className="card-title">Income categories</h2></div>
            <div className="card-body">
              {income.map(c => (
                <div className="ledger-row" style={{ gridTemplateColumns: '1fr 32px' }} key={c.id}>
                  <div className="category-tag"><span className="dot" style={{ background: c.color }} />{c.name}</div>
                  <button className="icon-btn" onClick={() => handleDelete(c.id)}>✕</button>
                </div>
              ))}
              {!loading && income.length === 0 && <div className="empty-state">No income categories yet.</div>}
            </div>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 420 }}>
          <div className="card-header"><h2 className="card-title">Add a category</h2></div>
          <div className="card-body">
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div className="field">
                <label>Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {swatches.map(s => (
                    <button
                      type="button" key={s}
                      onClick={() => setForm({ ...form, color: s })}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', background: s, cursor: 'pointer',
                        border: form.color === s ? '2px solid var(--ink)' : '2px solid transparent'
                      }}
                    />
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" type="submit">Add category</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
