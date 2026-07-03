import React, { useEffect, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import TransactionModal from '../components/TransactionModal'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactionApi'
import { getCategories } from '../api/categoryApi'
import { useCurrencyFormatter } from '../context/PreferencesContext'

export default function Transactions() {
  const currencyFmt = useCurrencyFormatter()
  const [data, setData] = useState({ content: [], totalPages: 0, number: 0 })
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ categoryId: '', type: '', startDate: '', endDate: '' })
  const [page, setPage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, size: 15 }
    if (filters.categoryId) params.categoryId = filters.categoryId
    if (filters.type) params.type = filters.type
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate

    getTransactions(params)
      .then(setData)
      .catch(() => setError('Could not load transactions.'))
      .finally(() => setLoading(false))
  }, [page, filters])

  useEffect(() => { load() }, [load])
  useEffect(() => { getCategories().then(setCategories) }, [])

  const handleSave = async (payload) => {
    if (editing) {
      await updateTransaction(editing.id, payload)
    } else {
      await createTransaction(payload)
    }
    setModalOpen(false)
    setEditing(null)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
    load()
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">Filter, search, and manage every entry in your register.</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}>
            + Add transaction
          </button>
        </div>

        <div className="filter-bar">
          <div className="field">
            <label>Category</label>
            <select value={filters.categoryId} onChange={(e) => { setPage(0); setFilters({ ...filters, categoryId: e.target.value }) }}>
              <option value="">All</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Type</label>
            <select value={filters.type} onChange={(e) => { setPage(0); setFilters({ ...filters, type: e.target.value }) }}>
              <option value="">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div className="field">
            <label>From</label>
            <input type="date" value={filters.startDate} onChange={(e) => { setPage(0); setFilters({ ...filters, startDate: e.target.value }) }} />
          </div>
          <div className="field">
            <label>To</label>
            <input type="date" value={filters.endDate} onChange={(e) => { setPage(0); setFilters({ ...filters, endDate: e.target.value }) }} />
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="card">
          <div className="card-body">
            <div className="ledger-row ledger-header">
              <div>Date</div>
              <div>Description</div>
              <div>Category</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
              <div></div>
            </div>

            {loading && <p style={{ padding: '16px 0' }}>Loading…</p>}

            {!loading && data.content.length === 0 && (
              <div className="empty-state">No transactions match these filters yet.</div>
            )}

            {!loading && data.content.map(t => (
              <div className="ledger-row" key={t.id}>
                <div className="ledger-date">{t.transactionDate}</div>
                <div className="ledger-desc">
                  <span className="ledger-desc-text">{t.description || '—'}</span>
                </div>
                <div className="category-tag">
                  <span className="dot" style={{ background: t.categoryColor }} />
                  {t.categoryName}
                </div>
                <div className={`ledger-amount ${t.type === 'INCOME' ? 'income' : 'expense'}`}>
                  {t.type === 'INCOME' ? '+' : '−'}{currencyFmt(t.amount)}
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button className="icon-btn" title="Edit" onClick={() => { setEditing(t); setModalOpen(true) }}>✎</button>
                  <button className="icon-btn" title="Delete" onClick={() => handleDelete(t.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
              Page {page + 1} of {data.totalPages}
            </span>
            <button className="btn btn-secondary" disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}

        {modalOpen && (
          <TransactionModal
            categories={categories}
            initial={editing}
            onClose={() => { setModalOpen(false); setEditing(null) }}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  )
}
