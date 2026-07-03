import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import * as preferenceApi from '../api/preferenceApi'

const PreferencesContext = createContext(null)

const defaults = {
  theme: 'light',
  currency: 'USD',
  dateFormat: 'MM/dd/yyyy',
  emailNotifications: true,
  defaultDashboardView: 'monthly',
}

export function PreferencesProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [preferences, setPreferences] = useState(defaults)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setPreferences(defaults)
      setLoaded(false)
      return
    }
    preferenceApi.getPreferences()
      .then(setPreferences)
      .catch(() => setPreferences(defaults))
      .finally(() => setLoaded(true))
  }, [isAuthenticated])

  // Apply theme to the document root so CSS variables can react to it
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme)
  }, [preferences.theme])

  const savePreferences = useCallback(async (updated) => {
    const saved = await preferenceApi.updatePreferences(updated)
    setPreferences(saved)
    return saved
  }, [])

  return (
    <PreferencesContext.Provider value={{ preferences, savePreferences, loaded }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}

const currencySymbols = { USD: 'USD', EUR: 'EUR', GBP: 'GBP', JPY: 'JPY' }

export function useCurrencyFormatter() {
  const { preferences } = usePreferences()
  return (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencySymbols[preferences.currency] || 'USD',
  }).format(amount)
}
