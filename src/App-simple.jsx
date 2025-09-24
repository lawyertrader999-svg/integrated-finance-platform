import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import MainDashboard from './components/MainDashboard'
import PortfolioDashboard from './components/PortfolioDashboard'
import PersonalFinance from './components/PersonalFinance'
import TradingJournal from './components/TradingJournal'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentApp, setCurrentApp] = useState('main')

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const renderCurrentApp = () => {
    switch (currentApp) {
      case 'portfolio':
        return <PortfolioDashboard user={user} onBack={() => setCurrentApp('main')} />
      case 'finance':
        return <PersonalFinance user={user} onBack={() => setCurrentApp('main')} />
      case 'trading':
        return <TradingJournal user={user} onBack={() => setCurrentApp('main')} />
      default:
        return <MainDashboard user={user} onNavigate={setCurrentApp} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentApp()}
    </div>
  )
}

export default App
