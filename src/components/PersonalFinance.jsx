import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Wallet, Target, Calendar, Filter } from 'lucide-react'

export default function PersonalFinance({ user, onBack }) {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddBudget, setShowAddBudget] = useState(false)

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    month: getCurrentMonth()
  })

  useEffect(() => {
    initializeData()
  }, [selectedMonth])

  const initializeData = async () => {
    try {
      // Create tables if they don't exist
      await createTablesIfNotExist()
      
      // Fetch data
      await Promise.all([
        fetchTransactions(),
        fetchBudgets(),
        fetchCategories()
      ])
    } catch (error) {
      console.error('Error initializing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTablesIfNotExist = async () => {
    try {
      // Create categories table
      await supabase.rpc('create_categories_table', {})
      
      // Create transactions table
      await supabase.rpc('create_transactions_table', {})
      
      // Create budgets table
      await supabase.rpc('create_budgets_table', {})
      
      // Insert default categories
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .limit(1)
      
      if (!existingCategories || existingCategories.length === 0) {
        await supabase
          .from('categories')
          .insert([
            { name: 'อาหาร', type: 'expense', color: '#ef4444' },
            { name: 'ค่าเดินทาง', type: 'expense', color: '#f97316' },
            { name: 'ช้อปปิ้ง', type: 'expense', color: '#eab308' },
            { name: 'ค่าบ้าน', type: 'expense', color: '#22c55e' },
            { name: 'สุขภาพ', type: 'expense', color: '#06b6d4' },
            { name: 'บันเทิง', type: 'expense', color: '#8b5cf6' },
            { name: 'เงินเดือน', type: 'income', color: '#10b981' },
            { name: 'ธุรกิจ', type: 'income', color: '#3b82f6' },
            { name: 'การลงทุน', type: 'income', color: '#6366f1' },
            { name: 'อื่นๆ', type: 'both', color: '#6b7280' }
          ])
      }
    } catch (error) {
      console.error('Error creating tables:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (name, color)
        `)
        .eq('user_id', user.id)
        .gte('date', `${selectedMonth}-01`)
        .lt('date', getNextMonth(selectedMonth))
        .order('date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    }
  }

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories (name, color)
        `)
        .eq('user_id', user.id)
        .eq('month', selectedMonth)

      if (error) throw error
      setBudgets(data || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
      setBudgets([])
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          ...newTransaction,
          amount: parseFloat(newTransaction.amount),
          user_id: user.id
        }])

      if (error) throw error

      setNewTransaction({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddTransaction(false)
      fetchTransactions()
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('เกิดข้อผิดพลาดในการเพิ่มรายการ')
    }
  }

  const handleAddBudget = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('budgets')
        .insert([{
          ...newBudget,
          amount: parseFloat(newBudget.amount),
          user_id: user.id
        }])

      if (error) throw error

      setNewBudget({
        category: '',
        amount: '',
        month: getCurrentMonth()
      })
      setShowAddBudget(false)
      fetchBudgets()
    } catch (error) {
      console.error('Error adding budget:', error)
      alert('เกิดข้อผิดพลาดในการเพิ่มงบประมาณ')
    }
  }

  // Calculate summary
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const balance = income - expenses

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                <h1 className="text-xl font-bold text-gray-900">Personal Finance</h1>
                <p className="text-sm text-gray-500">ระบบจัดการการเงินส่วนตัว</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                {getMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">รายรับเดือนนี้</p>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{income.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">รายจ่ายเดือนนี้</p>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{expenses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">คงเหลือ</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ฿{balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">งบประมาณ</p>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{totalBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {['dashboard', 'transactions', 'budgets', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'dashboard' && 'แดชบอร์ด'}
                  {tab === 'transactions' && 'รายการ'}
                  {tab === 'budgets' && 'งบประมาณ'}
                  {tab === 'reports' && 'รายงาน'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'transactions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">รายการรายรับ-รายจ่าย</h3>
                  <button
                    onClick={() => setShowAddTransaction(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มรายการ
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          รายการ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          หมวดหมู่
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          จำนวนเงิน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ประเภท
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: transaction.categories?.color || '#6b7280' }}
                            >
                              {transaction.categories?.name || 'ไม่ระบุ'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">แดชบอร์ดการเงินส่วนตัว</h3>
                <p className="text-gray-600 mb-8">
                  จัดการรายรับ-รายจ่าย ติดตามงบประมาณ และวิเคราะห์การใช้จ่าย
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">บันทึกรายการ</h4>
                    <p className="text-green-700 text-sm">เพิ่มรายรับและรายจ่ายประจำวัน</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">ตั้งงบประมาณ</h4>
                    <p className="text-blue-700 text-sm">กำหนดงบประมาณรายหมวดหมู่</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">วิเคราะห์รายงาน</h4>
                    <p className="text-purple-700 text-sm">ดูสถิติและแนวโน้มการใช้จ่าย</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-medium mb-4">เพิ่มรายการใหม่</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="expense">รายจ่าย</option>
                  <option value="income">รายรับ</option>
                </select>
                
                <input
                  type="number"
                  placeholder="จำนวนเงิน"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                
                <input
                  type="text"
                  placeholder="รายละเอียด"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories
                    .filter(cat => cat.type === newTransaction.type || cat.type === 'both')
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
                
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddTransaction(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md"
                  >
                    เพิ่มรายการ
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

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getNextMonth(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
}

function getMonthOptions() {
  const options = []
  for (let i = 0; i < 12; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
    options.push({ value: monthValue, label: monthLabel })
  }
  return options
}
