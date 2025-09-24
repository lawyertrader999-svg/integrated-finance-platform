import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { AuthProvider } from './contexts/AuthContext'
import Login from './components/Login'
import MainDashboard from './components/MainDashboard'
import PortfolioDashboard from './components/PortfolioDashboard'
import PersonalFinance from './components/PersonalFinance'
import TradingJournal from './components/TradingJournal'
import Loading from './components/Loading'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentApp, setCurrentApp] = useState('main') // main, portfolio, finance, trading

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
    return <Loading />
  }

  if (!user) {
    return (
      <AuthProvider>
        <Login />
      </AuthProvider>
    )
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
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {renderCurrentApp()}
      </div>
    </AuthProvider>
  )
}

export default App
