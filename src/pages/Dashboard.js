import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext'; // ✅ Import at top of file

import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DollarSign, Tag, Calendar, TrendingUp, AlertCircle, Search, Filter, Download, Eye, EyeOff, Wallet, Smartphone, Building2, CreditCard, PiggyBank, TrendingDown } from 'lucide-react';

// Helper function from AddExpense.js to format currency
const formatIndianCurrency = (amount) => {
  if (isNaN(amount) || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper to get source type info (icon, color etc.)
const sourceTypes = [
    { id: 'UPI', name: 'UPI Account', icon: Smartphone },
    { id: 'BANK', name: 'Bank Account', icon: Building2 },
    { id: 'CASH', name: 'Cash', icon: Wallet },
    { id: 'CARD', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'INVESTMENT', name: 'Investment Account', icon: TrendingUp },
    { id: 'SAVINGS', name: 'Savings & Goals', icon: PiggyBank }
];

const getSourceTypeInfo = (type) => {
    return sourceTypes.find(st => st.id === type) || sourceTypes[2]; // Default to Cash
};


// Main Enhanced Dashboard Component
const ExpenseDashboard = ({ expenses, sources, sourceBalances }) => {
  const [dateRange, setDateRange] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { isDarkMode } = useTheme();

  // State for multi-source filtering
  const [selectedSources, setSelectedSources] = useState(['all']);

  // Memoized helper to find a source by its ID
  const getSourceById = useMemo(() => (id) => {
    return sources.find(source => source.id === id);
  }, [sources]);

  // Enhanced filtering with multi-source, category, and search
  const filteredExpenses = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - dateRange);

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const matchesDate = expenseDate >= startDate && expenseDate <= endDate;
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      const matchesSearch = expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSource = selectedSources.includes('all') || selectedSources.includes(expense.sourceId);

      return matchesDate && matchesCategory && matchesSearch && matchesSource;
    });
  }, [expenses, dateRange, selectedCategory, searchTerm, selectedSources]);

  // Enhanced data processing based on filtered data
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageTransaction = totalExpenses / (filteredExpenses.length || 1);
  const transactionCount = filteredExpenses.length;

  const totalBalance = useMemo(() => {
    return Object.values(sourceBalances).reduce((sum, balance) => sum + balance, 0);
  }, [sourceBalances]);
  
  const previousPeriodExpenses = useMemo(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - dateRange);
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - dateRange);
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const matchesSource = selectedSources.includes('all') || selectedSources.includes(expense.sourceId);
      return expenseDate >= startDate && expenseDate <= endDate && matchesSource;
    });
  }, [expenses, dateRange, selectedSources]);

  const previousTotal = previousPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const changePercentage = previousTotal ? ((totalExpenses - previousTotal) / previousTotal * 100) : (totalExpenses > 0 ? 100 : 0);

  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ 
      name, 
      value, 
      percentage: totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.value - a.value);

  const topCategory = categoryData.length > 0 ? categoryData[0].name : 'N/A';
  const categories = ['all', ...new Set(expenses.map(e => e.category))];

  const expensesByDate = filteredExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toLocaleDateString('en-CA');
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {});
  
  const dateChartData = Object.entries(expensesByDate)
    .map(([date, amount]) => ({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const recentTransactions = filteredExpenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

const PIE_CHART_COLORS = isDarkMode 
    ? ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#38BDF8', '#FB7185', '#EC4899']
    : ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#38BDF8', '#F97316', '#EC4899'];
  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Vendor,Category,Amount,Source,Description\n" +
      filteredExpenses.map(e => {
        const sourceName = getSourceById(e.sourceId)?.name || 'Unknown';
        return `${e.date},"${e.vendor}","${e.category}",${e.amount},"${sourceName}","${e.description || ''}"`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expense_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSourceSelection = (sourceId) => {
      if (sourceId === 'all') {
          setSelectedSources(['all']);
          return;
      }
      const currentIndex = selectedSources.indexOf(sourceId);
      let newSelectedSources = [...selectedSources].filter(id => id !== 'all');
      if (currentIndex === -1) {
          newSelectedSources.push(sourceId);
      } else {
          newSelectedSources.splice(currentIndex, 1);
      }
      if (newSelectedSources.length === 0) {
          setSelectedSources(['all']);
      } else {
          setSelectedSources(newSelectedSources);
      }
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    const radius = outerRadius + 25; // Distance of label from the chart
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ExpenseFlow - AI Powered Expense Tracker
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mt-2">
            Smart insights into your spending patterns across all accounts.
          </p>
        </div>

        {/* Source Selection Filter */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Filter size={20} />
                Filter by Payment Source
            </h3>
            <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSourceSelection('all')}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    selectedSources.includes('all')
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  All Sources ({sources.length})
                </button>
                {sources.map(source => {
                  const typeInfo = getSourceTypeInfo(source.type);
                  const Icon = typeInfo.icon;
                  return (
                    <button
                      key={source.id}
                      onClick={() => handleSourceSelection(source.id)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 ${
                        selectedSources.includes(source.id)
                          ? 'text-white'
                          : 'bg-white text-gray-700 hover:border-gray-500'
                      }`}
                      style={{
                        backgroundColor: selectedSources.includes(source.id) ? source.color : 'white',
                        borderColor: selectedSources.includes(source.id) ? source.color : '#D1D5DB'
                      }}
                    >
                      <Icon size={16} />
                      <span>{source.name}</span>
                    </button>
                  );
                })}
            </div>
        </div>

        {/* Enhanced Controls */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select onChange={(e) => setDateRange(Number(e.target.value))} value={dateRange} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
                <option value={365}>Last Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search vendors, notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <button onClick={exportData} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <AlertCircle size={60} className="mx-auto text-gray-400" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-700">No Expenses Found</h2>
            <p className="mt-2 text-gray-500">Try adjusting your filters or adding a new expense.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SummaryCard icon={DollarSign} title="Total Balance" value={formatIndianCurrency(totalBalance)} color="blue" subtitle={`Across ${sources.length} sources`} />
              <SummaryCard icon={TrendingDown} title="Total Spent" value={formatIndianCurrency(totalExpenses)} change={changePercentage} color="red" />
              <SummaryCard icon={Tag} title="Top Category" value={topCategory} color="purple" subtitle={`${categoryData.length} categories`} />
              <SummaryCard icon={Calendar} title="Transactions" value={transactionCount.toString()} color="amber" subtitle={`Avg ${formatIndianCurrency(averageTransaction)}`} />
            </div>

            {/* Main Charts - Modified Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Line Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dateChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="date" stroke="#4B5563" fontSize={12} />
                    <YAxis stroke="#4B5563" fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} name="Expenses" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart with more space */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Category Breakdown</h3>
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={categoryData}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={renderCustomizedLabel}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {categoryData.map((entry, index) => (
        <Cell 
          key={`cell-${index}`} 
          fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} 
        />
      ))}
    </Pie>
    <Tooltip 
      contentStyle={{
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
        borderRadius: '6px',
        color: isDarkMode ? '#f8fafc' : '#1e293b',
        boxShadow: isDarkMode 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
      itemStyle={{
        color: isDarkMode ? '#f8fafc' : '#1e293b',
        fontSize: '14px',
        fontWeight: '500'
      }}
      labelStyle={{
        color: isDarkMode ? '#cbd5e1' : '#64748b',
        fontSize: '12px',
        fontWeight: '400'
      }}
      wrapperStyle={{
        outline: 'none'
      }}
    />
  </PieChart>
</ResponsiveContainer>


              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Recent Transactions</h3>
                  <button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                    {showDetails ? <EyeOff size={16} /> : <Eye size={16} />} {showDetails ? 'Hide' : 'Show'} Details
                  </button>
                </div>
                <div className="space-y-3">
                  {recentTransactions.map((expense) => {
                    const source = getSourceById(expense.sourceId);
                    const typeInfo = source ? getSourceTypeInfo(source.type) : null;
                    const Icon = typeInfo?.icon;
                    return (
                      <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{expense.vendor}</p>
                          {showDetails && (
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span>{expense.category} • {expense.date}</span>
                                {source && (
                                    <span className="flex items-center gap-1.5" style={{color: source.color}}>
                                        {Icon && <Icon size={14} />} {source.name}
                                    </span>
                                )}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-gray-800">{formatIndianCurrency(expense.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Spending by Category</h3>
                <div className="space-y-4">
                  {categoryData.map((cat, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium text-gray-700">{cat.name}</span>
                        <div className="text-right">
                          <span className="font-semibold text-gray-800">{formatIndianCurrency(cat.value)}</span>
                          <span className="text-gray-500 ml-2">({cat.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full transition-all duration-300" style={{ width: `${cat.percentage}%`, backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Enhanced Summary Card with subtitle
const SummaryCard = ({ icon: Icon, title, value, change, color, subtitle }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        {change !== undefined && (
          <div className={`text-sm font-semibold flex items-center px-2 py-1 rounded-full ${change > 0 ? 'bg-red-100 text-red-600' : change < 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
            {change > 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

// Enhanced Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-gray-600" style={{ color: entry.color || entry.payload.fill }}>
            {entry.name}: {formatIndianCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Main App component to manage global state
const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [sources, setSources] = useState([]);
  const [sourceBalances, setSourceBalances] = useState({});

  // Load all data from localStorage and set up listeners
useEffect(() => {
  const loadAllData = () => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedSources = localStorage.getItem('expenseSources');
    const savedSourceBalances = localStorage.getItem('sourceBalances');

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    // Sample data block removed - app will start with empty expenses array

    if (savedSources) {
        setSources(JSON.parse(savedSources));
    }

    if (savedSourceBalances) {
        setSourceBalances(JSON.parse(savedSourceBalances));
    }
  };

  loadAllData();

  const handleExpensesUpdate = () => {
      loadAllData();
  };

  const handleStorageChange = (event) => {
    if (event.key === 'expenses' || event.key === 'expenseSources' || event.key === 'sourceBalances') {
      loadAllData();
    }
  };

  window.addEventListener('expensesUpdated', handleExpensesUpdate);
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('focus', loadAllData);

  return () => {
    window.removeEventListener('expensesUpdated', handleExpensesUpdate);
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('focus', loadAllData);
  };
}, [])


  return <ExpenseDashboard expenses={expenses} sources={sources} sourceBalances={sourceBalances} />;
};

export default Dashboard;