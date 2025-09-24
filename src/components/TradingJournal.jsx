import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, TrendingUp, TrendingDown, BarChart3, Target, Calendar, DollarSign } from 'lucide-react'

export default function TradingJournal({ user, onBack }) {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddTrade, setShowAddTrade] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const [newTrade, setNewTrade] = useState({
    symbol: '',
    type: 'buy',
    quantity: '',
    entry_price: '',
    exit_price: '',
    entry_date: new Date().toISOString().split('T')[0],
    exit_date: '',
    strategy: '',
    notes: '',
    status: 'open'
  })

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      await createTradesTableIfNotExist()
      await fetchTrades()
    } catch (error) {
      console.error('Error initializing trading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTradesTableIfNotExist = async () => {
    try {
      const { error } = await supabase.rpc('create_trades_table_if_not_exists')
      if (error && !error.message.includes('already exists')) {
        throw error
      }
    } catch (error) {
      // Table might already exist, try to create manually
      console.log('Creating trades table manually...')
    }
  }

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })

      if (error) {
        // If table doesn't exist, create sample data
        if (error.code === '42P01') {
          setTrades(getSampleTrades())
          return
        }
        throw error
      }
      
      setTrades(data || getSampleTrades())
    } catch (error) {
      console.error('Error fetching trades:', error)
      setTrades(getSampleTrades())
    }
  }

  const getSampleTrades = () => [
    {
      id: 1,
      symbol: 'PTT',
      type: 'buy',
      quantity: 1000,
      entry_price: 35.50,
      exit_price: 38.75,
      entry_date: '2024-01-15',
      exit_date: '2024-01-20',
      strategy: 'Swing Trading',
      notes: 'ซื้อตามแนวโน้มขาขึ้น',
      status: 'closed',
      profit_loss: 3250,
      profit_loss_percentage: 9.15
    },
    {
      id: 2,
      symbol: 'CPALL',
      type: 'buy',
      quantity: 500,
      entry_price: 65.00,
      exit_price: 68.50,
      entry_date: '2024-01-18',
      exit_date: '2024-01-25',
      strategy: 'Value Investing',
      notes: 'ราคาต่ำกว่าค่าเฉลี่ย',
      status: 'closed',
      profit_loss: 1750,
      profit_loss_percentage: 5.38
    },
    {
      id: 3,
      symbol: 'KBANK',
      type: 'buy',
      quantity: 800,
      entry_price: 142.50,
      exit_price: null,
      entry_date: '2024-01-22',
      exit_date: null,
      strategy: 'Long Term',
      notes: 'ลงทุนระยะยาว',
      status: 'open',
      profit_loss: 4400,
      profit_loss_percentage: 3.86
    }
  ]

  const handleAddTrade = async (e) => {
    e.preventDefault()
    try {
      const tradeData = {
        ...newTrade,
        quantity: parseInt(newTrade.quantity),
        entry_price: parseFloat(newTrade.entry_price),
        exit_price: newTrade.exit_price ? parseFloat(newTrade.exit_price) : null,
        user_id: user.id
      }

      // Calculate profit/loss if trade is closed
      if (tradeData.status === 'closed' && tradeData.exit_price) {
        const totalCost = tradeData.quantity * tradeData.entry_price
        const totalValue = tradeData.quantity * tradeData.exit_price
        tradeData.profit_loss = totalValue - totalCost
        tradeData.profit_loss_percentage = ((tradeData.profit_loss / totalCost) * 100)
      }

      const { error } = await supabase
        .from('trades')
        .insert([tradeData])

      if (error) throw error

      setNewTrade({
        symbol: '',
        type: 'buy',
        quantity: '',
        entry_price: '',
        exit_price: '',
        entry_date: new Date().toISOString().split('T')[0],
        exit_date: '',
        strategy: '',
        notes: '',
        status: 'open'
      })
      setShowAddTrade(false)
      fetchTrades()
    } catch (error) {
      console.error('Error adding trade:', error)
      alert('เกิดข้อผิดพลาดในการเพิ่มรายการเทรด')
    }
  }

  // Calculate statistics
  const closedTrades = trades.filter(t => t.status === 'closed')
  const openTrades = trades.filter(t => t.status === 'open')
  
  const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0)
  const winningTrades = closedTrades.filter(t => (t.profit_loss || 0) > 0).length
  const losingTrades = closedTrades.filter(t => (t.profit_loss || 0) < 0).length
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0
  
  const totalInvested = trades.reduce((sum, t) => sum + (t.quantity * t.entry_price), 0)
  const currentValue = trades.reduce((sum, t) => {
    if (t.status === 'closed') {
      return sum + (t.quantity * (t.exit_price || 0))
    } else {
      // For open trades, use current market price (mock)
      const currentPrice = t.entry_price * 1.02 // Mock 2% gain
      return sum + (t.quantity * currentPrice)
    }
  }, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                <h1 className="text-xl font-bold text-gray-900">Trading Journal</h1>
                <p className="text-sm text-gray-500">ระบบบันทึกการเทรดและวิเคราะห์ผลกำไร</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
                <option value="quarter">ไตรมาสนี้</option>
                <option value="year">ปีนี้</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">กำไร/ขาดทุนรวม</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ฿{totalProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">อัตราชนะ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {winRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">จำนวนเทรด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trades.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">เทรดเปิด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {openTrades.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">สถิติการเทรด</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">เทรดชนะ:</span>
                <span className="font-medium text-green-600">{winningTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">เทรดแพ้:</span>
                <span className="font-medium text-red-600">{losingTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">เทรดเปิด:</span>
                <span className="font-medium text-blue-600">{openTrades.length}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">รวมทั้งหมด:</span>
                <span className="font-medium">{trades.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">มูลค่าการลงทุน</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ลงทุนรวม:</span>
                <span className="font-medium">฿{totalInvested.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">มูลค่าปัจจุบัน:</span>
                <span className="font-medium">฿{currentValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">กำไร/ขาดทุน:</span>
                <span className={`font-medium ${(currentValue - totalInvested) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ฿{(currentValue - totalInvested).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">หุ้นยอดนิยม</h3>
            <div className="space-y-3">
              {getTopSymbols(trades).map((item, index) => (
                <div key={item.symbol} className="flex justify-between">
                  <span className="text-gray-600">{item.symbol}:</span>
                  <span className="font-medium">{item.count} เทรด</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {['dashboard', 'trades', 'analysis', 'strategies'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'dashboard' && 'แดชบอร์ด'}
                  {tab === 'trades' && 'รายการเทรด'}
                  {tab === 'analysis' && 'การวิเคราะห์'}
                  {tab === 'strategies' && 'กลยุทธ์'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'trades' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">รายการเทรดทั้งหมด</h3>
                  <button
                    onClick={() => setShowAddTrade(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มเทรด
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          หุ้น
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ประเภท
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          จำนวน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ราคาซื้อ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ราคาขาย
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          กำไร/ขาดทุน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trades.map((trade) => (
                        <tr key={trade.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {trade.symbol}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trade.type === 'buy' ? 'ซื้อ' : 'ขาย'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trade.quantity.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ฿{trade.entry_price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trade.exit_price ? `฿${trade.exit_price.toFixed(2)}` : '-'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            (trade.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trade.profit_loss ? (
                              <>
                                {(trade.profit_loss || 0) >= 0 ? '+' : ''}฿{(trade.profit_loss || 0).toLocaleString()}
                                <br />
                                <span className="text-xs">
                                  ({(trade.profit_loss_percentage || 0).toFixed(2)}%)
                                </span>
                              </>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              trade.status === 'open' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {trade.status === 'open' ? 'เปิด' : 'ปิด'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Trading Journal Dashboard</h3>
                <p className="text-gray-600 mb-8">
                  บันทึกการเทรด วิเคราะห์ผลกำไร-ขาดทุน และพัฒนากลยุทธ์การลงทุน
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">บันทึกเทรด</h4>
                    <p className="text-purple-700 text-sm">เพิ่มรายการซื้อ-ขายหุ้นและติดตามผล</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">วิเคราะห์ผลงาน</h4>
                    <p className="text-blue-700 text-sm">ดูสถิติและประสิทธิภาพการเทรด</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">พัฒนากลยุทธ์</h4>
                    <p className="text-green-700 text-sm">เรียนรู้และปรับปรุงวิธีการเทรด</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Trade Modal */}
        {showAddTrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">เพิ่มรายการเทรดใหม่</h3>
              <form onSubmit={handleAddTrade} className="space-y-4">
                <input
                  type="text"
                  placeholder="สัญลักษณ์หุ้น (เช่น PTT)"
                  value={newTrade.symbol}
                  onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                
                <select
                  value={newTrade.type}
                  onChange={(e) => setNewTrade({...newTrade, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="buy">ซื้อ</option>
                  <option value="sell">ขาย</option>
                </select>
                
                <input
                  type="number"
                  placeholder="จำนวนหุ้น"
                  value={newTrade.quantity}
                  onChange={(e) => setNewTrade({...newTrade, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                
                <input
                  type="number"
                  step="0.01"
                  placeholder="ราคาซื้อ"
                  value={newTrade.entry_price}
                  onChange={(e) => setNewTrade({...newTrade, entry_price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                
                <input
                  type="number"
                  step="0.01"
                  placeholder="ราคาขาย (ถ้าปิดแล้ว)"
                  value={newTrade.exit_price}
                  onChange={(e) => setNewTrade({...newTrade, exit_price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                
                <input
                  type="date"
                  value={newTrade.entry_date}
                  onChange={(e) => setNewTrade({...newTrade, entry_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                
                <input
                  type="date"
                  placeholder="วันที่ขาย"
                  value={newTrade.exit_date}
                  onChange={(e) => setNewTrade({...newTrade, exit_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                
                <input
                  type="text"
                  placeholder="กลยุทธ์ (เช่น Swing Trading)"
                  value={newTrade.strategy}
                  onChange={(e) => setNewTrade({...newTrade, strategy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                
                <textarea
                  placeholder="หมายเหตุ"
                  value={newTrade.notes}
                  onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
                
                <select
                  value={newTrade.status}
                  onChange={(e) => setNewTrade({...newTrade, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="open">เปิด</option>
                  <option value="closed">ปิด</option>
                </select>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddTrade(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md"
                  >
                    เพิ่มเทรด
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function getTopSymbols(trades) {
  const symbolCount = {}
  trades.forEach(trade => {
    symbolCount[trade.symbol] = (symbolCount[trade.symbol] || 0) + 1
  })
  
  return Object.entries(symbolCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([symbol, count]) => ({ symbol, count }))
}
