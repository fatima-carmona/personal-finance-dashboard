import React, { useEffect, useState } from 'react'

const empty = { categoryId: '', amount: '', type: 'EXPENSE', description: '', transactionDate: new Date().toISOString().slice(0, 10) }

export default function TransactionModal({ categories, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || empty)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(initial ? {
      ...initial,
      categoryId: initial.categoryId,
      amount: initial.amount,
      transactionDate: initial.transactionDate,
    } : empty)
  }, [initial])

  const filteredCategories = categories.filter(c => c.type === form.type)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.categoryId) { setError('Choose a category'); return }
    setSaving(true)
    try {
      await onSave({ ...form, amount: parseFloat(form.amount), categoryId: Number(form.categoryId) })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this transaction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{initial ? 'Edit transaction' : 'New transaction'}</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: '' })}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div className="field">
              <label>Amount</label>
              <input
                type="number" step="0.01" min="0.01" required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date</label>
            <input
              type="date" required
              value={form.transactionDate}
              onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Description (optional)</label>
            <input
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Weekly grocery run"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
