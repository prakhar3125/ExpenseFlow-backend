import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext'; // Import the useData hook
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { DollarSign, Tag, Calendar, TrendingUp, AlertCircle, Search, Filter, Download, Eye, EyeOff, Wallet, Smartphone, Building2, CreditCard, PiggyBank, TrendingDown, Loader2 } from 'lucide-react';

// Helper Components and Functions
const RupeeIcon = ({ size = 20, className = "" }) => (
  <div 
    className={`inline-flex items-center justify-center font-bold text-blue-600 ${className}`}
    style={{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px` }}
  >
    ₹
  </div>
);

// Helper function to format currency
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

// Enhanced Summary Card Component
const SummaryCard = ({ icon: Icon, title, value, change, color, subtitle }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        {change !== undefined && (
          <div className={`text-sm font-semibold flex items-center px-2 py-1 rounded-full ${change > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : change < 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'}`}>
            {change > 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-slate-200 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

// Enhanced Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg">
        <p className="font-semibold text-gray-700 dark:text-slate-300 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-gray-600 dark:text-slate-400" style={{ color: entry.color || entry.payload.fill }}>
            {entry.name}: {formatIndianCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- ExpenseDashboard Presentational Component ---
const ExpenseDashboard = ({ expenses, sources, filters, onDateRangeChange, onCategoryChange, onSourcesChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Client-side search filtering
  const filteredBySearch = useMemo(() => {
    if (!searchTerm) return expenses;
    return expenses.filter(expense =>
      expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [expenses, searchTerm]);

  // Data processing
  const totalExpenses = filteredBySearch.reduce((sum, expense) => sum + expense.amount, 0);
  const transactionCount = filteredBySearch.length;
  const averageTransaction = totalExpenses / (transactionCount || 1);

  // Total balance calculation
  const totalBalance = useMemo(() => {
    return sources.reduce((sum, source) => sum + (source.currentBalance || 0), 0);
  }, [sources]);
  
  const expensesByCategory = filteredBySearch.reduce((acc, expense) => {
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

  // All possible categories for dropdown - check if expenses exists first
  const allCategories = ['all', ...new Set((expenses || []).map(e => e.category))];

  const expensesByDate = filteredBySearch.reduce((acc, expense) => {
    const date = new Date(expense.transactionDate).toLocaleDateString('en-CA');
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {});
  
  const dateChartData = Object.entries(expensesByDate)
    .map(([date, amount]) => ({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const recentTransactions = filteredBySearch
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
    .slice(0, 5);

  const PIE_CHART_COLORS = isDarkMode 
    ? ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#38BDF8', '#FB7185', '#EC4899']
    : ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#38BDF8', '#F97316', '#EC4899'];

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Vendor,Category,Amount,Source,Description\n" +
      filteredBySearch.map(e => {
        const sourceName = e.sourceName || 'Unknown';
        return `${e.transactionDate},"${e.vendor}","${e.category}",${e.amount},"${sourceName}","${e.description || ''}"`;
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
    const { selectedSources } = filters;
    if (sourceId === 'all') {
        onSourcesChange(['all']);
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
        onSourcesChange(['all']);
    } else {
        onSourcesChange(newSelectedSources);
    }
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill={isDarkMode ? "#f8fafc" : "#1e293b"} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-slate-100">
            ExpenseFlow - AI Powered Expense Tracker
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-slate-400 mt-2">
            Smart insights into your spending patterns across all accounts.
          </p>
        </div>

        {/* Source Selection Filter */}
        <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Filter size={20} />
                Filter by Payment Source
            </h3>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => handleSourceSelection('all')}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      filters.selectedSources.includes('all')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
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
                              !filters.selectedSources.includes(source.id) && 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:border-gray-500 dark:hover:border-slate-400'
                            }`}
                            style={{
                              backgroundColor: filters.selectedSources.includes(source.id) ? source.color : '',
                              borderColor: filters.selectedSources.includes(source.id) ? source.color : '',
                              color: filters.selectedSources.includes(source.id) ? 'white' : ''
                            }}
                        >
                            <Icon size={16} />
                            <span>{source.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
        
        {/* Control Filters */}
        <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Time Period</label>
                  <select onChange={(e) => onDateRangeChange(Number(e.target.value))} value={filters.dateRange} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100">
                      <option value={7}>Last 7 Days</option>
                      <option value={30}>Last 30 Days</option>
                      <option value={90}>Last 90 Days</option>
                      <option value={365}>Last Year</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Category</label>
                  <select onChange={(e) => onCategoryChange(e.target.value)} value={filters.selectedCategory} className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100">
                      {allCategories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Search</label>
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                      <input type="text" placeholder="Search vendors, notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100" />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Actions</label>
                  <button onClick={exportData} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2">
                      <Download size={16} /> Export CSV
                  </button>
              </div>
          </div>
        </div>

        {filteredBySearch.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
                <AlertCircle size={60} className="mx-auto text-gray-400 dark:text-slate-500" />
                <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-slate-200">No Expenses Found</h2>
                <p className="mt-2 text-gray-500 dark:text-slate-400">Try adjusting your filters or adding a new expense.</p>
            </div>
        ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <SummaryCard icon={RupeeIcon} title="Total Balance" value={formatIndianCurrency(totalBalance)} color="blue" subtitle={`Across ${sources.length} sources`} />
                  <SummaryCard icon={TrendingDown} title="Total Spent" value={formatIndianCurrency(totalExpenses)} color="red" />
                  <SummaryCard icon={Tag} title="Top Category" value={topCategory} color="purple" subtitle={`${categoryData.length} categories`} />
                  <SummaryCard icon={Calendar} title="Transactions" value={transactionCount.toString()} color="amber" subtitle={`Avg ${formatIndianCurrency(averageTransaction)}`} />
              </div>

              {/* Main Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Line Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-4">Daily Spending Trend</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={dateChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="date" stroke={isDarkMode ? "#94a3b8" : "#4B5563"} fontSize={12} />
                      <YAxis stroke={isDarkMode ? "#94a3b8" : "#4B5563"} fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} name="Expenses" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-4 text-center">Category Breakdown</h3>
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
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-200">Recent Transactions</h3>
                    <button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">
                      {showDetails ? <EyeOff size={16} /> : <Eye size={16} />} {showDetails ? 'Hide' : 'Show'} Details
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentTransactions.map((expense) => {
                      const typeInfo = getSourceTypeInfo(expense.sourceType);
                      const Icon = typeInfo?.icon;
                      return (
                        <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-slate-200">{expense.vendor}</p>
                            {showDetails && (
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mt-1">
                                  <span>{expense.category} • {expense.transactionDate}</span>
                                  {expense.sourceName && (
                                      <span className="flex items-center gap-1.5" style={{color: expense.sourceColor}}>
                                          {Icon && <Icon size={14} />} {expense.sourceName}
                                      </span>
                                  )}
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-gray-800 dark:text-slate-200">{formatIndianCurrency(expense.amount)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-4">Spending by Category</h3>
                  <div className="space-y-4">
                    {categoryData.map((cat, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="font-medium text-gray-700 dark:text-slate-300">{cat.name}</span>
                          <div className="text-right">
                            <span className="font-semibold text-gray-800 dark:text-slate-200">{formatIndianCurrency(cat.value)}</span>
                            <span className="text-gray-500 dark:text-slate-400 ml-2">({cat.percentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2.5">
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

// --- The Main Dashboard Container Component ---
const Dashboard = () => {
    // 1. Get all shared data from our new central DataContext.
    const { sources, expenses, loading, error } = useData();

    // 2. Keep state for filters that are specific to the Dashboard page.
    const [dateRange, setDateRange] = useState(30);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSources, setSelectedSources] = useState(['all']);

    // 3. Memoized filtering logic remains here. It now acts on the GLOBAL `expenses` state.
    const filteredExpenses = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - dateRange);

        // This check is important because `expenses` might be empty on the first render.
        if (!expenses || expenses.length === 0) {
            return [];
        }

        return expenses.filter(expense => {
            const expenseDate = new Date(expense.transactionDate);
            const matchesDate = expenseDate >= startDate && expenseDate <= endDate;
            const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
            const matchesSource = selectedSources.includes('all') || selectedSources.includes(expense.sourceId.toString());
            return matchesDate && matchesCategory && matchesSource;
        });
    }, [expenses, dateRange, selectedCategory, selectedSources]);

    // 4. Handle global loading and error states for the initial page load.
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-900">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gray-50 dark:bg-slate-900">
                <AlertCircle size={60} className="mx-auto text-red-500" />
                <h2 className="mt-4 text-2xl font-semibold text-red-700 dark:text-red-400">Failed to Load Dashboard</h2>
                <p className="mt-2 text-gray-500 dark:text-slate-400">{error}</p>
            </div>
        );
    }

    // 5. Pass the global sources and the locally filtered expenses to the display component.
    return (
        <ExpenseDashboard
            expenses={filteredExpenses}
            sources={sources || []} // Provide fallback empty array
            filters={{ dateRange, selectedCategory, selectedSources }}
            onDateRangeChange={setDateRange}
            onCategoryChange={setSelectedCategory}
            onSourcesChange={setSelectedSources}
        />
    );
};

export default Dashboard;
