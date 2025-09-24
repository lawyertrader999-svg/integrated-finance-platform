import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  PieChart, 
  Users, 
  FileText,
  LogOut,
  Settings,
  Bell,
  Search
} from 'lucide-react'

export default function MainDashboard({ user, onNavigate }) {
  const [stats, setStats] = useState({
    portfolioValue: 0,
    personalBalance: 0,
    tradingProfit: 0,
    totalTransactions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch portfolio stats
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('total_value')
      
      const portfolioValue = portfolios?.reduce((sum, p) => sum + (p.total_value || 0), 0) || 0

      // Fetch personal finance stats (mock for now)
      const personalBalance = 150000 // This would come from personal finance tables
      const tradingProfit = 25000 // This would come from trading journal
      const totalTransactions = 45 // This would come from all transaction tables

      setStats({
        portfolioValue,
        personalBalance,
        tradingProfit,
        totalTransactions
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const apps = [
    {
      id: 'portfolio',
      title: 'Portfolio Dashboard',
      description: 'จัดการพอร์ตโฟลิโอลงทุน สำหรับ IC และลูกค้า',
      icon: TrendingUp,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      stats: `฿${stats.portfolioValue.toLocaleString()}`,
      statsLabel: 'มูลค่าพอร์ตโฟลิโอรวม'
    },
    {
      id: 'finance',
      title: 'Personal Finance',
      description: 'จัดการการเงินส่วนตัว รายรับ-รายจ่าย งบประมาณ',
      icon: Wallet,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      stats: `฿${stats.personalBalance.toLocaleString()}`,
      statsLabel: 'ยอดคงเหลือ'
    },
    {
      id: 'trading',
      title: 'Trading Journal',
      description: 'บันทึกการเทรด วิเคราะห์ผลกำไร-ขาดทุน',
      icon: BarChart3,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      stats: `฿${stats.tradingProfit.toLocaleString()}`,
      statsLabel: 'กำไรจากการเทรด'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PieChart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  Integrated Finance Platform
                </h1>
                <p className="text-sm text-gray-500">
                  แพลตฟอร์มการเงินครบวงจร
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">ผู้ใช้งาน</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ยินดีต้อนรับ! 👋
          </h2>
          <p className="text-lg text-gray-600">
            เลือกระบบที่ต้องการใช้งาน เพื่อจัดการการเงินของคุณอย่างครบวงจร
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">พอร์ตโฟลิโอ</p>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{stats.portfolioValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ยอดคงเหลือ</p>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{stats.personalBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">กำไรเทรด</p>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{stats.tradingProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ธุรกรรม</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTransactions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* App Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apps.map((app) => {
            const IconComponent = app.icon
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className={`p-4 rounded-xl ${app.color} shadow-lg`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">{app.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {app.description}
                  </p>
                  
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {app.stats}
                    </p>
                    <p className="text-sm text-gray-600">{app.statsLabel}</p>
                  </div>
                  
                  <button
                    onClick={() => onNavigate(app.id)}
                    className={`w-full py-3 px-6 rounded-xl text-white font-semibold ${app.color} ${app.hoverColor} transition-colors duration-200 shadow-md hover:shadow-lg`}
                  >
                    เข้าใช้งาน
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    เพิ่มลูกค้าใหม่ในระบบ Portfolio
                  </p>
                  <p className="text-xs text-gray-500">2 ชั่วโมงที่แล้ว</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    บันทึกรายรับ ฿5,000 ในระบบ Personal Finance
                  </p>
                  <p className="text-xs text-gray-500">5 ชั่วโมงที่แล้ว</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    บันทึกการเทรด SET50 กำไร ฿1,200
                  </p>
                  <p className="text-xs text-gray-500">1 วันที่แล้ว</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
