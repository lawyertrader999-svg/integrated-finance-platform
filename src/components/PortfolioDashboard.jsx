import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Users, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'

export default function PortfolioDashboard({ user, onBack }) {
  const [userRole, setUserRole] = useState('ic') // ic or client
  const [clients, setClients] = useState([])
  const [portfolios, setPortfolios] = useState([])
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientsRes, portfoliosRes, holdingsRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('portfolios').select('*'),
        supabase.from('holdings').select('*')
      ])

      setClients(clientsRes.data || [])
      setPortfolios(portfoliosRes.data || [])
      setHoldings(holdingsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPortfolioValue = portfolios.reduce((sum, p) => sum + (p.total_value || 0), 0)
  const totalReturns = portfolios.reduce((sum, p) => sum + (p.total_return || 0), 0)
  const avgReturnPercentage = portfolios.length > 0 
    ? portfolios.reduce((sum, p) => sum + (p.return_percentage || 0), 0) / portfolios.length 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portfolio Dashboard</h1>
                <p className="text-sm text-gray-500">ระบบจัดการพอร์ตโฟลิโอลงทุน</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="ic">Investment Consultant (IC)</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === 'ic' ? (
          <ICDashboardView 
            clients={clients}
            portfolios={portfolios}
            holdings={holdings}
            totalPortfolioValue={totalPortfolioValue}
            totalReturns={totalReturns}
            avgReturnPercentage={avgReturnPercentage}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRefresh={fetchData}
          />
        ) : (
          <ClientDashboardView 
            portfolios={portfolios}
            holdings={holdings}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
    </div>
  )
}

function ICDashboardView({ 
  clients, 
  portfolios, 
  holdings, 
  totalPortfolioValue, 
  totalReturns, 
  avgReturnPercentage,
  activeTab,
  setActiveTab,
  onRefresh 
}) {
  const [showAddClient, setShowAddClient] = useState(false)
  const [newClient, setNewClient] = useState({
    full_name: '',
    email: '',
    phone: '',
    risk_profile: 'moderate',
    initial_capital: ''
  })

  const handleAddClient = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...newClient,
          initial_capital: parseFloat(newClient.initial_capital)
        }])

      if (error) throw error

      // Create initial portfolio for the client
      if (data && data[0]) {
        await supabase
          .from('portfolios')
          .insert([{
            client_id: data[0].id,
            total_value: parseFloat(newClient.initial_capital),
            total_return: 0,
            return_percentage: 0
          }])
      }

      setNewClient({
        full_name: '',
        email: '',
        phone: '',
        risk_profile: 'moderate',
        initial_capital: ''
      })
      setShowAddClient(false)
      onRefresh()
    } catch (error) {
      console.error('Error adding client:', error)
      alert('เกิดข้อผิดพลาดในการเพิ่มลูกค้า')
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">จำนวนลูกค้า</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">มูลค่ารวม</p>
              <p className="text-2xl font-bold text-gray-900">
                ฿{totalPortfolioValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">กำไรรวม</p>
              <p className="text-2xl font-bold text-gray-900">
                ฿{totalReturns.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">% ผลตอบแทนเฉลี่ย</p>
              <p className="text-2xl font-bold text-gray-900">
                {avgReturnPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {['overview', 'clients', 'portfolios', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && 'ภาพรวม'}
                {tab === 'clients' && 'ลูกค้า'}
                {tab === 'portfolios' && 'พอร์ตโฟลิโอ'}
                {tab === 'reports' && 'รายงาน'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'clients' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">รายการลูกค้า</h3>
                <button
                  onClick={() => setShowAddClient(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  เพิ่มลูกค้าใหม่
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อ-นามสกุล
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        อีเมล
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ระดับความเสี่ยง
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ทุนเริ่มต้น
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {client.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.risk_profile === 'conservative' && 'อนุรักษ์นิยม'}
                          {client.risk_profile === 'moderate' && 'ปานกลาง'}
                          {client.risk_profile === 'aggressive' && 'ก้าวร้าว'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ฿{(client.initial_capital || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-4">ภาพรวมระบบ Portfolio</h3>
              <p className="text-gray-600">
                ระบบจัดการพอร์ตโฟลิโอสำหรับ Investment Consultant และลูกค้า
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">จัดการลูกค้า</h4>
                  <p className="text-blue-700 text-sm">เพิ่ม แก้ไข และติดตามข้อมูลลูกค้า</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">วิเคราะห์พอร์ตโฟลิโอ</h4>
                  <p className="text-green-700 text-sm">ดูผลการดำเนินงานและแนวโน้ม</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">สร้างรายงาน</h4>
                  <p className="text-purple-700 text-sm">สร้าง PowerPoint สำหรับลูกค้า</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">เพิ่มลูกค้าใหม่</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล"
                value={newClient.full_name}
                onChange={(e) => setNewClient({...newClient, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="email"
                placeholder="อีเมล"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="tel"
                placeholder="เบอร์โทร"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <select
                value={newClient.risk_profile}
                onChange={(e) => setNewClient({...newClient, risk_profile: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="conservative">อนุรักษ์นิยม</option>
                <option value="moderate">ปานกลาง</option>
                <option value="aggressive">ก้าวร้าว</option>
              </select>
              <input
                type="number"
                placeholder="ทุนเริ่มต้น (บาท)"
                value={newClient.initial_capital}
                onChange={(e) => setNewClient({...newClient, initial_capital: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md"
                >
                  เพิ่มลูกค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ClientDashboardView({ portfolios, holdings, activeTab, setActiveTab }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Dashboard</h3>
        <p className="text-gray-600">
          ดูข้อมูลพอร์ตโฟลิโอและผลการดำเนินงานของคุณ
        </p>
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <p className="text-blue-900 font-semibold">
            ระบบ Client Dashboard จะแสดงข้อมูลพอร์ตโฟลิโอส่วนตัวของลูกค้า
          </p>
          <p className="text-blue-700 text-sm mt-2">
            รวมถึงการถือครอง ผลตอบแทน และการวิเคราะห์ต่างๆ
          </p>
        </div>
      </div>
    </div>
  )
}
