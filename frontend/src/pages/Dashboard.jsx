import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import Sidebar from '../components/Sidebar'
import { getDashboardSummary } from '../api/reportApi'
import { useCurrencyFormatter } from '../context/PreferencesContext'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const currencyFmt = useCurrencyFormatter()

  useEffect(() => {
    getDashboardSummary({})
      .then(setSummary)
      .catch(() => setError('Could not load your dashboard right now.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">This month at a glance</h1>
          <p className="page-subtitle">Income, spending, and where it all went.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <p>Loading…</p>}

        {summary && (
          <>
            <div className="summary-grid">
              <div className="card summary-card">
                <div className="summary-label">Income</div>
                <div className="summary-value income tabular">{currencyFmt(summary.totalIncome)}</div>
              </div>
              <div className="card summary-card">
                <div className="summary-label">Expenses</div>
                <div className="summary-value expense tabular">{currencyFmt(summary.totalExpense)}</div>
              </div>
              <div className="card summary-card">
                <div className="summary-label">Net balance</div>
                <div className={`summary-value tabular ${summary.netBalance >= 0 ? 'income' : 'expense'}`}>
                  {currencyFmt(summary.netBalance)}
                </div>
              </div>
            </div>

            <div className="content-grid">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Income vs. expenses, last 6 months</h2>
                </div>
                <div className="card-body" style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2DFD3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5B6259' }} axisLine={{ stroke: '#E2DFD3' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#5B6259' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => currencyFmt(v)} contentStyle={{ borderRadius: 8, borderColor: '#E2DFD3', fontSize: 13 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="income" name="Income" fill="#2F7A54" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#B1512F" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Top spending categories</h2>
                </div>
                <div className="card-body" style={{ height: 260 }}>
                  {summary.topExpenseCategories.length === 0 ? (
                    <div className="empty-state">No expenses logged this period yet.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.topExpenseCategories}
                          dataKey="total"
                          nameKey="categoryName"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {summary.topExpenseCategories.map((entry, i) => (
                            <Cell key={i} fill={entry.categoryColor || '#B1512F'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => currencyFmt(v)} contentStyle={{ borderRadius: 8, borderColor: '#E2DFD3', fontSize: 13 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
