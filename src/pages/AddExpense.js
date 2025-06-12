import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Camera, Upload, Plus, Edit2, Trash2, Eye, DollarSign, Calendar, Building, Tag, Loader2, Check, AlertCircle, Brain, CreditCard, Wallet, Building2, Smartphone, PiggyBank, Settings, TrendingUp, TrendingDown, BarChart3, PieChart, Filter, Search, Bell, MoreVertical } from 'lucide-react';
import Tesseract from 'tesseract.js';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState(['all']);
  const [showSourceManager, setShowSourceManager] = useState(false);
  const [activeSourceView, setActiveSourceView] = useState('all');
  const [sourceBalances, setSourceBalances] = useState({});
  
  // Existing state variables
  const [currentExpense, setCurrentExpense] = useState({
    amount: '',
    vendor: '',
    date: '',
    category: '',
    description: '',
    receiptImage: null,
    sourceId: '' // Added source selection
  });
  
  const [currentSource, setCurrentSource] = useState({
    id: '',
    type: '',
    name: '',
    balance: '',
    initialBalance: '',
    isActive: true,
    alertThreshold: '',
    preferredCategories: [],
    color: '#3B82F6',
    description: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccess, setAiSuccess] = useState(false);
  const [imageQualityWarning, setImageQualityWarning] = useState('');
  const [lastApiCall, setLastApiCall] = useState(0);
  const [apiCallCount, setApiCallCount] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [aiCategorizedData, setAiCategorizedData] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [isEditingSource, setIsEditingSource] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState(null);
  const [showSourceDetails, setShowSourceDetails] = useState({});

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  // Perplexity API key
  const PERPLEXITY_API_KEY = process.env.REACT_APP_PERPLEXITY_API_KEY;
  
  const categories = [
    'Food & Drink',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Travel',
    'Education',
    'Business',
    'Other'
  ];

  // Source types and their properties
  const sourceTypes = [
    { id: 'UPI', name: 'UPI Account', icon: Smartphone, color: '#10B981', description: 'PhonePe, Google Pay, Paytm, etc.' },
    { id: 'BANK', name: 'Bank Account', icon: Building2, color: '#3B82F6', description: 'Savings, Current, Salary accounts' },
    { id: 'CASH', name: 'Cash', icon: Wallet, color: '#F59E0B', description: 'Physical cash, wallet money' },
    { id: 'CARD', name: 'Credit/Debit Card', icon: CreditCard, color: '#8B5CF6', description: 'Card payments and transactions' },
    { id: 'INVESTMENT', name: 'Investment Account', icon: TrendingUp, color: '#EF4444', description: 'Stocks, mutual funds, etc.' },
    { id: 'SAVINGS', name: 'Savings & Goals', icon: PiggyBank, color: '#06B6D4', description: 'Emergency fund, goal-based savings' }
  ];

  const sourceColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4',
    '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedSources = localStorage.getItem('expenseSources');
    const savedSourceBalances = localStorage.getItem('sourceBalances');
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    
    if (savedSources) {
      const loadedSources = JSON.parse(savedSources);
      setSources(loadedSources);
      
      // Initialize default sources if none exist
      if (loadedSources.length === 0) {
        initializeDefaultSources();
      }
    } else {
      initializeDefaultSources();
    }
    
    if (savedSourceBalances) {
      setSourceBalances(JSON.parse(savedSourceBalances));
    }
  }, []);

  // Initialize default sources
  const initializeDefaultSources = () => {
    const defaultSources = [
      {
        id: 'cash_wallet_001',
        type: 'CASH',
        name: 'Wallet Cash',
        balance: 0,
        initialBalance: 0,
        isActive: true,
        alertThreshold: 100,
        preferredCategories: ['Food & Drink', 'Transportation'],
        color: '#F59E0B',
        description: 'Daily spending cash'
      },
      {
        id: 'upi_primary_001',
        type: 'UPI',
        name: 'Primary UPI',
        balance: 0,
        initialBalance: 0,
        isActive: true,
        alertThreshold: 500,
        preferredCategories: ['Shopping', 'Food & Drink'],
        color: '#10B981',
        description: 'Main UPI account'
      }
    ];
    
    setSources(defaultSources);
    localStorage.setItem('expenseSources', JSON.stringify(defaultSources));
  };

  // Calculate source balances from transactions
  const calculateSourceBalances = () => {
    const balances = {};
    
    sources.forEach(source => {
      balances[source.id] = source.initialBalance;
    });
    
    expenses.forEach(expense => {
      if (expense.sourceId && balances[expense.sourceId] !== undefined) {
        balances[expense.sourceId] -= expense.amount;
      }
    });
    
    return balances;
  };

  // Update source balance calculations whenever expenses or sources change
  useEffect(() => {
    const newBalances = calculateSourceBalances();
    setSourceBalances(newBalances);
    localStorage.setItem('sourceBalances', JSON.stringify(newBalances));
  }, [expenses, sources]);

  // Filter expenses based on selected sources
  const getFilteredExpenses = () => {
    if (selectedSources.includes('all')) {
      return expenses;
    }
    return expenses.filter(expense => selectedSources.includes(expense.sourceId));
  };

  // Get source-specific statistics
  const getSourceStats = (sourceId) => {
    const sourceExpenses = expenses.filter(expense => expense.sourceId === sourceId);
    const totalSpent = sourceExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const thisMonth = sourceExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    });
    const monthlySpent = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
    
    const categoryBreakdown = sourceExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    return {
      totalTransactions: sourceExpenses.length,
      totalSpent,
      monthlySpent,
      categoryBreakdown,
      recentTransactions: sourceExpenses.slice(0, 5)
    };
  };

  // Get balance status for UI styling
  const getBalanceStatus = (balance, threshold) => {
    if (balance > threshold * 2) return { status: 'high', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (balance > threshold) return { status: 'medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'low', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  // All existing OCR and AI processing functions remain unchanged
  const preprocessImage = (canvas, file) => {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const scaleFactor = Math.max(1, 300 / 72);
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
          
          ctx.imageSmoothingEnabled = false;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128 + 10));
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128 + 10));
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128 + 10));
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to process image'));
            }
          }, 'image/png', 0.95);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const validateImageQuality = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;
        
        let brightness = 0;
        let pixelCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          brightness += (r + g + b) / 3;
          pixelCount++;
        }
        
        brightness = brightness / pixelCount;
        const minResolution = 300;
        const actualResolution = Math.min(img.width, img.height);
        
        let warnings = [];
        
        if (brightness < 80) {
          warnings.push('Image appears too dark - try better lighting');
        } else if (brightness > 180) {
          warnings.push('Image appears overexposed - reduce lighting or avoid glare');
        }
        
        if (actualResolution < minResolution) {
          warnings.push('Image resolution is low - try taking a closer photo');
        }
        
        if (warnings.length > 0) {
          setImageQualityWarning(warnings.join('. '));
          setTimeout(() => setImageQualityWarning(''), 8000);
        } else {
          setImageQualityWarning('');
        }
        
        resolve(true);
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = URL.createObjectURL(file);
    });
  };

  const correctOCRErrors = (text) => {
    let correctedText = text;
    
    const corrections = {
      'Rs\\s': 'Rs ',
      'R5\\s': 'Rs ',
      'R8\\s': 'Rs ',
      'FB\\s': 'Rs ',
      'Fs\\s': 'Rs ',
      'INR\\s': 'Rs ',
      '₹\\s': '₹ ',
      'S\\$': '$',
      '8\\$': '$',
      'B\\$': '$',
      '§': '$',
      '5\\$': '$',
      'O': '0',
      'o': '0',
      'I': '1',
      'l': '1',
      'Z': '2',
      'S': '5',
      'G': '6',
      'T': '7',
      'B': '8',
      'g': '9',
      ',': '.',
      ';': '.',
      ':': '.',
      'TOTAI': 'TOTAL',
      'TOTA': 'TOTAL',
      'TOTAl': 'TOTAL',
      'TOIAI': 'TOTAL',
      'SUBTOTAI': 'SUBTOTAL',
      'SUBTOTA': 'SUBTOTAL',
      'AMOUN': 'AMOUNT',
      'AMOUN7': 'AMOUNT',
      'BAIANCE': 'BALANCE',
      'BAIANCE': 'BALANCE'
    };
    
    Object.entries(corrections).forEach(([wrong, right]) => {
      const regex = new RegExp(wrong, 'gi');
      correctedText = correctedText.replace(regex, right);
    });
    
    return correctedText;
  };

  const formatIndianCurrency = (amount) => {
    if (isNaN(amount) || amount === 0) return '₹0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const extractAmountBasic = (text) => {
    const correctedText = correctOCRErrors(text);
    const lines = correctedText.split('\n');
    
    const amountPatterns = [
      /(?:TOTAL|AMOUNT|BALANCE|GRAND\s*TOTAL|SUBTOTAL|AMOUNT\s*DUE|PAYABLE)[:\s]*[Rs₹INR]*\s*(\d+[.,]\d{2})/i,
      /[Rs₹]\s*(\d+[.,]\d{2})\s*(?:TOTAL|$|AMOUNT|BALANCE)?/i,
      /(\d+[.,]\d{2})\s*[Rs₹INR]?\s*(?:TOTAL|AMOUNT|BALANCE|$)/i,
      /[FfRr][s5]\s*(\d+[.,]\d{2})/g,
      /R[s58]\s*(\d+[.,]\d{2})/g,
      /INR\s*(\d+[.,]\d{2})/g,
      /(?:TOTAL|AMOUNT|BALANCE|GRAND\s*TOTAL|SUBTOTAL|AMOUNT\s*DUE|PAYABLE)[:\s]*[$£€¥₹₨₽¢₡֏₱₩₪₫₦₨﷼]*\s*(\d+[.,]\d{2})/i,
      /[$£€¥₹₨₽¢₡֏₱₩₪₫₦₨﷼]\s*(\d+[.,]\d{2})\s*(?:TOTAL|$|AMOUNT|BALANCE)?/i,
      /(\d+[.,]\d{2})\s*[$£€¥₹₨₽¢₡֏₱₩₪₫₦₨﷼]?\s*(?:TOTAL|AMOUNT|BALANCE|$)/i,
      /[S8B§5]\s*(\d+[.,]\d{2})/g,
      /(?:TOTAL|AMOUNT|BALANCE)[:\s]*(\d+[,]\d{2})/i,
      /(?:TOTAL|AMOUNT|BALANCE)[:\s]*(\d+[.]\d{2})/i,
      /\$\s*(\d+[.,]\d{2})/g,
      /(\d+[.,]\d{2})/g
    ];
    
    let amounts = [];
    const processedLines = new Set();
    
    for (const line of lines) {
      if (processedLines.has(line.trim().toLowerCase())) continue;
      processedLines.add(line.trim().toLowerCase());
      
      for (const pattern of amountPatterns) {
        if (pattern.global) {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            let value = match[1].replace(/,/g, '.');
            value = parseFloat(value);
            
            if (value > 0 && value < 999999) {
              amounts.push({
                value: value,
                context: line.trim(),
                priority: getPriorityScore(line, pattern)
              });
            }
          }
          pattern.lastIndex = 0;
        } else {
          const match = line.match(pattern);
          if (match) {
            let value = match[1].replace(/,/g, '.');
            value = parseFloat(value);
            
            if (value > 0 && value < 999999) {
              amounts.push({
                value: value,
                context: line.trim(),
                priority: getPriorityScore(line, pattern)
              });
            }
          }
        }
      }
    }
    
    if (amounts.length > 0) {
      amounts.sort((a, b) => b.priority - a.priority);
      return amounts[0].value;
    }
    
    return 0;
  };

  const getPriorityScore = (line, pattern) => {
    let score = 0;
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('total')) score += 10;
    if (lowerLine.includes('amount due')) score += 9;
    if (lowerLine.includes('balance')) score += 8;
    if (lowerLine.includes('subtotal')) score += 7;
    if (lowerLine.includes('amount')) score += 6;
    
    if (lowerLine.includes('tax')) score -= 3;
    if (lowerLine.includes('tip')) score -= 3;
    if (lowerLine.includes('change')) score -= 5;
    
    return score;
  };

  const extractVendorBasic = (text) => {
    const correctedText = correctOCRErrors(text);
    const lines = correctedText.split('\n').map(line => line.trim()).filter(line => line);
    
    const vendorPatterns = [
      /(WALMART|TARGET|STARBUCKS|DOMINO'S|MCDONALD'S|SUBWAY|AMAZON|COSTCO|HOME DEPOT|SHELL|EXXON|BP|CVS|WALGREENS|KROGER|SAFEWAY)/i,
      /^([A-Z][A-Z\s&'.-]+[A-Z])$/,
      /^([A-Z][A-Za-z\s&'.-]{2,30})$/,
      /^([A-Za-z\s&'.-]+(?:LLC|INC|CORP|CO|LTD))$/i,
      /^([A-Za-z\s&'.-]+)\s*#?\d+$/
    ];
    
    for (let i = 0; i < Math.min(8, lines.length); i++) {
      const line = lines[i];
      
      if (line.match(/^\d+$|^[\d\s\-\.]+$|^(RECEIPT|INVOICE|BILL|THANK YOU)/i)) {
        continue;
      }
      
      for (const pattern of vendorPatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].length > 2) {
          let vendor = match[1].trim();
          
          vendor = vendor.replace(/[^\w\s&'.-]/g, '').trim();
          vendor = vendor.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
          
          return vendor;
        }
      }
    }
    
    return '';
  };

  const extractDateBasic = (text) => {
    const correctedText = correctOCRErrors(text);
    const lines = correctedText.split('\n');
    
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /(\d{1,2}\s+\w{3,9}\s+\d{4})/i,
      /(\w{3,9}\s+\d{1,2},?\s+\d{4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})/,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+\d{1,2}:\d{2}/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\s+\d{1,2}:\d{2}/
    ];
    
    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          const dateStr = match[1];
          let parsedDate;
          
          try {
            if (dateStr.includes('/') || dateStr.includes('-')) {
              const parts = dateStr.split(/[\/\-]/);
              if (parts.length === 3) {
                if (parseInt(parts[0]) > 12) {
                  if (parseInt(parts[0]) > 31) {
                    parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
                  } else {
                    parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
                  }
                } else {
                  parsedDate = new Date(parts[2], parts[0] - 1, parts[1]);
                }
              }
            } else {
              parsedDate = new Date(dateStr);
            }
            
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toISOString().split('T')[0];
            }
          } catch (error) {
            continue;
          }
        }
      }
    }
    
    return new Date().toISOString().split('T')[0];
  };

  const canMakeApiCall = () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    
    if (timeSinceLastCall > 60000) {
      setApiCallCount(1);
      setLastApiCall(now);
      return true;
    }
    
    if (apiCallCount < 15) {
      setApiCallCount(prev => prev + 1);
      setLastApiCall(now);
      return true;
    }
    
    return false;
  };

  const extractDataWithPerplexity = async (ocrText, retryCount = 0) => {
    if (!PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key not configured');
    }
    
    const maxRetries = 3;
    const baseDelay = 1000;
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content: `You are an expert financial document analysis assistant powered by real-time search capabilities. You specialize in correcting OCR errors and extracting structured expense data from receipts, invoices, and financial documents.

CORE CAPABILITIES:
- OCR error correction and text normalization
- Real-time business verification using current data
- Intelligent categorization based on current business information
- Accurate amount and date extraction with validation

INDIAN MARKET FOCUS:
- Primary currency: Indian Rupee (₹, Rs, INR)
- Indian number format: 1,00,000 (lakhs), 10,00,000 (10 lakhs)
- Common Indian businesses and chains
- Indian date formats and regional variations

EXTRACTION RULES:
Amount: 
- Look for TOTAL, AMOUNT DUE, BALANCE, GRAND TOTAL keywords
- Indian currency symbols: Rs, ₹, INR
- Support Indian number format: 1,00,000 (lakhs), 10,00,000 (10 lakhs)
- Ensure proper decimal format (XX.XX)
- Common Indian amount terms: "Rupees", "Rs.", "INR"

Vendor:
- Extract the main business or merchant name from the top of the receipt
- Use real-time search to verify and standardize business names when possible
- Clean business names, remove addresses/phone numbers
- Handle common business abbreviations and variations

Date:
- Support formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
- Convert to YYYY-MM-DD format
- Use current date (2025-06-12) if unclear or missing

Category (use exactly one from this list):
Food & Drink, Transportation, Shopping, Entertainment, Healthcare, Utilities, Travel, Education, Business, Other

Special Classification Rules:
- Certifications, courses, training → Education
- Business cards, professional services → Business
- Medical documents, prescriptions, pharmacies → Healthcare
- Travel bookings, hotels, airlines → Travel
- Gas stations, rideshare, parking → Transportation
- Restaurants, coffee shops, groceries → Food & Drink

RESPONSE FORMAT: Return ONLY valid JSON:
{
  "vendor": "Standardized Business Name",
  "amount": 25.99,
  "date": "2025-06-12", 
  "category": "Food & Drink",
  "description": "Brief description of purchase (Items in purchase) (max 50 chars)",
  "confidence": 85,
  "reasoning": "Explanation of categorization and any real-time verification used"
}

CONFIDENCE SCORING:
90-100: All fields clearly found, verified with real-time data, minimal OCR errors
80-89: Most fields found, some real-time verification, minor corrections needed
70-79: Good extraction, basic verification, some fields may need inference
60-69: Fair extraction, limited verification, moderate OCR issues
50-59: Poor OCR quality, significant guessing required
0-49: Very poor quality, highly uncertain extraction

Use your real-time search capabilities to verify business names and enhance categorization accuracy when possible.`
            },
            {
              role: "user", 
              content: `Analyze this OCR text from a financial document. Correct any OCR errors, verify business information if possible, and extract structured expense data:\n\n${ocrText}`
            }
          ],
          temperature: 0.2,
          max_tokens: 400,
          stream: false
        })
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000;
            console.log(`Rate limit hit, retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return extractDataWithPerplexity(ocrText, retryCount + 1);
          } else {
            throw new Error('Rate limit exceeded after maximum retries. Please wait a few minutes and try again.');
          }
        }
        
        if (response.status === 401) {
          throw new Error('Invalid Perplexity API key. Please check your configuration.');
        }
        
        if (response.status === 403) {
          throw new Error('Access forbidden. Check your API key permissions or account credits.');
        }
        
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from Perplexity API');
      }
      
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      if (error.message.includes('Rate limit') || error.message.includes('API error')) {
        throw error;
      }
      console.error('Perplexity API Error Details:', error);
      throw new Error(`API call failed: ${error.message}`);
    }
  };

  const extractBasicData = (text) => {
    const vendor = extractVendorBasic(text);
    const amount = extractAmountBasic(text);
    const date = extractDateBasic(text);
    
    return {
      vendor: vendor || '',
      amount: amount || 0,
      date: date
    };
  };

  const parseReceiptText = async (text) => {
    const basicResult = extractBasicData(text);
    
    const hasBasicVendor = basicResult.vendor && basicResult.vendor !== 'Unknown Vendor';
    const hasBasicAmount = basicResult.amount > 0;
    
    if (!hasBasicVendor || !hasBasicAmount) {
      if (!canMakeApiCall()) {
        console.log('Rate limit prevention: too many API calls, using basic parsing');
        setAiError('Rate limit prevention active. Using basic parsing to avoid API limits.');
        setTimeout(() => setAiError(''), 5000);
        
        const fallbackResult = {
          ...basicResult,
          vendor: basicResult.vendor || 'Unknown Vendor',
          amount: basicResult.amount || 0,
          date: basicResult.date || new Date().toISOString().split('T')[0],
          category: categorizeExpense(basicResult.vendor),
          description: '',
          text: text,
          parsedBy: 'Basic (Rate Limited)',
          confidence: 40,
          reasoning: 'Basic parsing due to rate limit prevention'
        };
        
        setAiCategorizedData(fallbackResult);
        return fallbackResult;
      }
      
      try {
        setIsProcessingAI(true);
        console.log('Basic parsing insufficient, using Perplexity AI for enhanced parsing...');
        
        const aiResult = await extractDataWithPerplexity(text);
        
        const enhancedResult = {
          vendor: aiResult.vendor || basicResult.vendor || 'Unknown Vendor',
          amount: parseFloat(aiResult.amount) || basicResult.amount || 0,
          date: aiResult.date || basicResult.date || new Date().toISOString().split('T')[0],
          category: aiResult.category || 'Other',
          description: aiResult.description || '',
          text: text,
          parsedBy: 'Perplexity AI',
          confidence: aiResult.confidence || 0,
          reasoning: aiResult.reasoning || 'Perplexity AI-based categorization with real-time verification'
        };
        
        setAiCategorizedData(enhancedResult);
        setAiSuccess(true);
        setTimeout(() => setAiSuccess(false), 5000);
        
        return enhancedResult;
      } catch (error) {
        console.error('Perplexity AI parsing failed:', error);
        setAiError(`AI parsing failed: ${error.message}`);
        setTimeout(() => setAiError(''), 5000);
        
        const fallbackResult = {
          ...basicResult,
          vendor: basicResult.vendor || 'Unknown Vendor',
          amount: basicResult.amount || 0,
          date: basicResult.date || new Date().toISOString().split('T')[0],
          category: categorizeExpense(basicResult.vendor),
          description: '',
          text: text,
          parsedBy: 'Basic (AI Failed)',
          confidence: 30,
          reasoning: 'Basic regex parsing due to AI failure'
        };
        
        setAiCategorizedData(fallbackResult);
        return fallbackResult;
      } finally {
        setIsProcessingAI(false);
      }
    }
    
    const basicCategory = categorizeExpense(basicResult.vendor);
    const finalResult = {
      ...basicResult,
      category: basicCategory,
      description: '',
      text: text,
      parsedBy: 'Basic',
      confidence: 70,
      reasoning: 'Basic regex pattern matching'
    };
    
    setAiCategorizedData(finalResult);
    return finalResult;
  };

  const processOCR = async (imageFile) => {
    return new Promise(async (resolve, reject) => {
      try {
        await validateImageQuality(imageFile);
        
        const canvas = document.createElement('canvas');
        const preprocessedBlob = await preprocessImage(canvas, imageFile);
        
        const { data: { text } } = await Tesseract.recognize(
          preprocessedBlob,
          'eng',
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                setOcrProgress(Math.round(m.progress * 100));
              }
            },
            tessedit_pageseg_mode: '6',
            tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$.,/-:()& ',
            tessedit_ocr_engine_mode: '1',
            preserve_interword_spaces: '1'
          }
        );
        
        console.log('OCR Text:', text);
        const parsedData = await parseReceiptText(text);
        resolve(parsedData);
      } catch (err) {
        console.error('OCR Error:', err);
        reject(err);
      }
    });
  };
  
  const categorizeExpense = (vendor, description = '') => {
    const text = (vendor + ' ' + description).toLowerCase();
    
    if (text.includes('domino') || text.includes('pizza') || text.includes('starbucks') || 
        text.includes('restaurant') || text.includes('coffee') || text.includes('food') ||
        text.includes('mcdonald') || text.includes('subway') || text.includes('cafe') ||
        text.includes('burger') || text.includes('kfc') || text.includes('taco')) {
      return 'Food & Drink';
    }
    if (text.includes('gas') || text.includes('shell') || text.includes('exxon') || 
        text.includes('uber') || text.includes('lyft') || text.includes('taxi') ||
        text.includes('chevron') || text.includes('bp') || text.includes('fuel')) {
      return 'Transportation';
    }
    if (text.includes('walmart') || text.includes('target') || text.includes('amazon') || 
        text.includes('store') || text.includes('shop') || text.includes('market') ||
        text.includes('costco') || text.includes('kroger')) {
      return 'Shopping';
    }
    if (text.includes('movie') || text.includes('netflix') || text.includes('spotify') || 
        text.includes('game') || text.includes('entertainment') || text.includes('cinema')) {
      return 'Entertainment';
    }
    if (text.includes('hospital') || text.includes('doctor') || text.includes('pharmacy') || 
        text.includes('health') || text.includes('medical') || text.includes('cvs') ||
        text.includes('walgreens')) {
      return 'Healthcare';
    }
    if (text.includes('electric') || text.includes('water') || text.includes('internet') || 
        text.includes('phone') || text.includes('utility') || text.includes('cable')) {
      return 'Utilities';
    }
    if (text.includes('hotel') || text.includes('airline') || text.includes('flight') ||
        text.includes('travel') || text.includes('booking')) {
      return 'Travel';
    }
    if (text.includes('aws') || text.includes('certified') || text.includes('course') ||
        text.includes('education') || text.includes('university') || text.includes('school')) {
      return 'Education';
    }
    if (text.includes('office') || text.includes('business') || text.includes('corp') ||
        text.includes('llc') || text.includes('inc')) {
      return 'Business';
    }
    
    return 'Other';
  };
  
  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setIsProcessingOCR(true);
    setOcrSuccess(false);
    setOcrError('');
    setOcrProgress(0);
    setSelectedImage(URL.createObjectURL(file));
    setExtractedText('');
    setAiCategorizedData(null);
    setAiError('');
    setAiSuccess(false);
    setImageQualityWarning('');
    
    try {
      const ocrResult = await processOCR(file);
      
      setCurrentExpense(prev => ({
        ...prev,
        amount: ocrResult.amount > 0 ? ocrResult.amount.toFixed(2) : '',
        vendor: ocrResult.vendor || '',
        date: ocrResult.date || new Date().toISOString().split('T')[0],
        category: ocrResult.category || 'Other',
        description: ocrResult.description || '',
        receiptImage: file
      }));
      
      setExtractedText(ocrResult.text);
      setOcrSuccess(true);
      setTimeout(() => setOcrSuccess(false), 5000);
    } catch (error) {
      console.error('OCR processing failed:', error);
      setOcrError('Failed to process receipt. Please try again or enter details manually.');
      setTimeout(() => setOcrError(''), 5000);
    } finally {
      setIsProcessingOCR(false);
      setOcrProgress(0);
    }
  };
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  // Source Management Functions
  const handleSourceSubmit = () => {
    if (!currentSource.name || !currentSource.type || currentSource.initialBalance === '') {
      alert('Please fill in all required fields');
      return;
    }

    let updatedSources;
    
    if (isEditingSource) {
      updatedSources = sources.map(source => 
        source.id === editingSourceId 
          ? { ...currentSource, initialBalance: parseFloat(currentSource.initialBalance) }
          : source
      );
      setIsEditingSource(false);
      setEditingSourceId(null);
    } else {
      const newSource = {
        ...currentSource,
        id: `${currentSource.type.toLowerCase()}_${Date.now()}`,
        initialBalance: parseFloat(currentSource.initialBalance),
        balance: parseFloat(currentSource.initialBalance)
      };
      updatedSources = [...sources, newSource];
    }
    
    setSources(updatedSources);
    localStorage.setItem('expenseSources', JSON.stringify(updatedSources));
    
    resetSourceForm();
  };

  const resetSourceForm = () => {
    setCurrentSource({
      id: '',
      type: '',
      name: '',
      balance: '',
      initialBalance: '',
      isActive: true,
      alertThreshold: '',
      preferredCategories: [],
      color: sourceColors[Math.floor(Math.random() * sourceColors.length)],
      description: ''
    });
    setShowSourceForm(false);
  };

  const editSource = (source) => {
    setCurrentSource({
      ...source,
      initialBalance: source.initialBalance.toString(),
      alertThreshold: source.alertThreshold.toString()
    });
    setIsEditingSource(true);
    setEditingSourceId(source.id);
    setShowSourceForm(true);
  };

  const deleteSource = (id) => {
    if (sources.length <= 1) {
      alert('You must have at least one source');
      return;
    }
    
    const updatedSources = sources.filter(source => source.id !== id);
    setSources(updatedSources);
    localStorage.setItem('expenseSources', JSON.stringify(updatedSources));
    
    // Remove expenses associated with this source
    const updatedExpenses = expenses.filter(expense => expense.sourceId !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const handleSubmit = () => {
    if (!currentExpense.amount || !currentExpense.vendor || !currentExpense.date || !currentExpense.category || !currentExpense.sourceId) {
      alert('Please fill in all required fields including payment source');
      return;
    }
    
    let updatedExpenses;
    
    if (isEditing) {
      updatedExpenses = expenses.map(expense => 
        expense.id === editingId 
          ? { ...currentExpense, id: editingId, amount: parseFloat(currentExpense.amount) }
          : expense
      );
      setIsEditing(false);
      setEditingId(null);
    } else {
      const newExpense = {
        ...currentExpense,
        id: Date.now(),
        amount: parseFloat(currentExpense.amount)
      };
      updatedExpenses = [newExpense, ...expenses];
    }
    
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
    
    window.dispatchEvent(new CustomEvent('expensesUpdated', { 
      detail: updatedExpenses 
    }));
    
    resetForm();
  };
  
  const resetForm = () => {
    setCurrentExpense({
      amount: '',
      vendor: '',
      date: '',
      category: '',
      description: '',
      receiptImage: null,
      sourceId: ''
    });
    setShowForm(false);
    setSelectedImage(null);
    setExtractedText('');
    setAiCategorizedData(null);
    setAiError('');
    setAiSuccess(false);
    setImageQualityWarning('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };
  
  const editExpense = (expense) => {
    setCurrentExpense({
      ...expense,
      amount: expense.amount.toString()
    });
    setIsEditing(true);
    setEditingId(expense.id);
    setShowForm(true);
  };
  
  const deleteExpense = (id) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };
  
  const filteredExpenses = getFilteredExpenses();
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const totalSourceBalance = Object.values(sourceBalances).reduce((sum, balance) => sum + balance, 0);
  const totalInitialBalance = sources.reduce((sum, source) => sum + source.initialBalance, 0);

  const getSourceTypeInfo = (type) => {
    return sourceTypes.find(st => st.id === type) || sourceTypes[0];
  };

  const getSourceById = (id) => {
    return sources.find(source => source.id === id);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <main className="max-w-6xl mx-auto space-y-8">
          {/* ======================================================================= */}
          {/* ENHANCED HEADER WITH MULTI-SOURCE OVERVIEW                            */}
          {/* ======================================================================= */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Multi-Source Expense Tracker
                    </h1>
                    <p className="text-gray-500 mt-1">
                      Enhanced OCR + Perplexity AI with source-based management
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center min-w-[140px]">
                    <p className="text-sm font-medium text-blue-800">Total Balance</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatIndianCurrency(totalSourceBalance)}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Across {sources.length} sources
                    </p>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center min-w-[140px]">
                    <p className="text-sm font-medium text-red-800">Total Spent</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatIndianCurrency(totalExpenses)}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      From selected sources
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================================= */}
          {/* SOURCE SELECTION TOGGLE BAR                                            */}
          {/* ======================================================================= */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Filter size={20} />
                  Payment Sources
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSourceManager(!showSourceManager)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    <Settings size={16} />
                    Manage Sources
                  </button>
                </div>
              </div>
              
              {/* Source Toggle Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSelectedSources(['all'])}
                  className={`px-4 py-2 rounded-full border transition-all ${
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
                  const balance = sourceBalances[source.id] || 0;
                  const balanceStatus = getBalanceStatus(balance, source.alertThreshold);
                  
                  return (
                    <button
                      key={source.id}
                      onClick={() => {
                        if (selectedSources.includes(source.id)) {
                          setSelectedSources(selectedSources.filter(id => id !== source.id));
                        } else {
                          setSelectedSources([...selectedSources.filter(id => id !== 'all'), source.id]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                        selectedSources.includes(source.id)
                          ? 'border-gray-600 text-white'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                      style={{
                        backgroundColor: selectedSources.includes(source.id) ? source.color : 'white',
                        borderColor: selectedSources.includes(source.id) ? source.color : undefined
                      }}
                    >
                      <Icon size={16} />
                      <span className="font-medium">{source.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedSources.includes(source.id) 
                          ? 'bg-white bg-opacity-20 text-white' 
                          : balanceStatus.bgColor + ' ' + balanceStatus.color
                      }`}>
                        {formatIndianCurrency(balance)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Source Quick Stats */}
              {!selectedSources.includes('all') && selectedSources.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Selected Sources Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedSources.map(sourceId => {
                      const source = getSourceById(sourceId);
                      const stats = getSourceStats(sourceId);
                      const balance = sourceBalances[sourceId] || 0;
                      const balanceStatus = getBalanceStatus(balance, source.alertThreshold);
                      
                      return (
                        <div key={sourceId} className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-800 truncate">{source.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${balanceStatus.bgColor} ${balanceStatus.color}`}>
                              {formatIndianCurrency(balance)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Transactions: {stats.totalTransactions}</p>
                            <p>This Month: {formatIndianCurrency(stats.monthlySpent)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ======================================================================= */}
          {/* SOURCE MANAGER (Conditional)                                           */}
          {/* ======================================================================= */}
          {showSourceManager && (
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
    <Settings size={20} />
    Payment Methods
  </h2>
  <div className="flex items-center gap-3">
    <button
      onClick={() => setShowSourceForm(true)}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus size={16} />
      Add Source
    </button>
    <button
      onClick={() => setShowSourceManager(false)}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
    >
      Done
    </button>
  </div>
</div>


                {/* Source Form */}
                {showSourceForm && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {isEditingSource ? 'Edit Source' : 'Add New Source'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Source Type *</label>
                        <select
                          value={currentSource.type}
                          onChange={(e) => setCurrentSource({...currentSource, type: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select type</option>
                          {sourceTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                        {currentSource.type && (
                          <p className="text-sm text-gray-500 mt-1">
                            {getSourceTypeInfo(currentSource.type).description}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Source Name *</label>
                        <input
                          type="text"
                          value={currentSource.name}
                          onChange={(e) => setCurrentSource({...currentSource, name: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., PhonePe - Personal, SBI Savings"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Initial Balance *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={currentSource.initialBalance}
                          onChange={(e) => setCurrentSource({...currentSource, initialBalance: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Low Balance Alert Threshold</label>
                        <input
                          type="number"
                          step="0.01"
                          value={currentSource.alertThreshold}
                          onChange={(e) => setCurrentSource({...currentSource, alertThreshold: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="100.00"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                          type="text"
                          value={currentSource.description}
                          onChange={(e) => setCurrentSource({...currentSource, description: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Optional description"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                        <div className="flex flex-wrap gap-2">
                          {sourceColors.map(color => (
                            <button
                              key={color}
                              onClick={() => setCurrentSource({...currentSource, color})}
                              className={`w-8 h-8 rounded-full border-2 ${
                                currentSource.color === color ? 'border-gray-800' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSourceSubmit}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {isEditingSource ? 'Update Source' : 'Add Source'}
                      </button>
                      <button
                        onClick={resetSourceForm}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Sources List */}
                <div className="space-y-4">
                  {sources.map(source => {
                    const typeInfo = getSourceTypeInfo(source.type);
                    const Icon = typeInfo.icon;
                    const balance = sourceBalances[source.id] || 0;
                    const stats = getSourceStats(source.id);
                    const balanceStatus = getBalanceStatus(balance, source.alertThreshold);
                    
                    return (
                      <div key={source.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: source.color }}
                            >
                              <Icon size={20} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-gray-800">{source.name}</h3>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  {typeInfo.name}
                                </span>
                                {!source.isActive && (
                                  <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Current Balance</p>
                                  <p className={`font-semibold ${balanceStatus.color}`}>
                                    {formatIndianCurrency(balance)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Initial Balance</p>
                                  <p className="font-medium text-gray-700">
                                    {formatIndianCurrency(source.initialBalance)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Transactions</p>
                                  <p className="font-medium text-gray-700">{stats.totalTransactions}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Monthly Spent</p>
                                  <p className="font-medium text-gray-700">
                                    {formatIndianCurrency(stats.monthlySpent)}
                                  </p>
                                </div>
                              </div>
                              
                              {source.description && (
                                <p className="text-sm text-gray-600 mt-2">{source.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => editSource(source)}
                              className="p-2 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                              title="Edit source"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteSource(source.id)}
                              className="p-2 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                              title="Delete source"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Low Balance Warning */}
                        {balance < source.alertThreshold && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-700">
                              <AlertCircle size={16} />
                              <span className="text-sm font-medium">
                                Low balance warning: Below ₹{source.alertThreshold} threshold
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ======================================================================= */}
          {/* ADD NEW EXPENSE BUTTON (Conditional)                                  */}
          {/* ======================================================================= */}
          {!showForm && (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                <Plus size={20} />
                Add New Expense
              </button>
            </div>
          )}

          {/* ======================================================================= */}
          {/* ADD/EDIT EXPENSE FORM (Enhanced with Source Selection)                */}
          {/* ======================================================================= */}
          {showForm && (
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {isEditing ? 'Edit Expense' : 'Add New Expense'}
                </h2>
                
                {/* OCR & AI Processing Sub-Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-3">
                    <Camera size={22} className="text-blue-600"/>
                    Enhanced Receipt Processing
                  </h3>

                  {/* Perplexity AI Features Box */}
                  <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400">
                    <p className="font-semibold text-blue-800">
                      Perplexity AI Enhanced Features:
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                      <li>Real-time business verification and standardization</li>
                      <li>Advanced OCR error correction with AI intelligence</li>
                      <li>Context-aware categorization using current data</li>
                      <li>Smart amount detection with decimal correction</li>
                      <li>Automatic form filling with verified information</li>
                      <li>Image quality validation and enhancement</li>
                    </ul>
                  </div>

                  {/* Image Quality Tips Box */}
                  <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="font-semibold text-yellow-800">
                      For Best Results:                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                      <li>Ensure good lighting without shadows or glare</li>
                      <li>Keep receipt flat and aligned, covering the frame</li>
                      <li>Clean the receipt surface (remove wrinkles/stains)</li>
                      <li>Focus on the total amount area if possible</li>
                      <li>Use high resolution (300+ DPI when scanning)</li>
                      <li>Avoid blurry or tilted images</li>
                    </ul>
                  </div>
                  
                  {/* Rate Limit Warning */}
                  {apiCallCount > 10 && (
                    <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                      <div className="flex items-center gap-3 text-sm text-orange-700">
                        <AlertCircle size={20} />
                        <span>Approaching API rate limit ({apiCallCount}/15 calls this minute). Basic parsing will be used if limit is reached.</span>
                      </div>
                    </div>
                  )}

                  {/* File Input Buttons */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingOCR || isProcessingAI}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={18} />
                      Choose File
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isProcessingOCR || isProcessingAI}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Camera size={18} />
                      Take Photo
                    </button>
                  </div>

                  {/* Hidden Inputs */}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />

                  {/* Status & Error Messages */}
                  <div className="space-y-3">
                    {imageQualityWarning && (
                      <div className="flex items-center gap-2 text-orange-600 font-medium text-sm">
                        <AlertCircle size={16} />
                        {imageQualityWarning}
                      </div>
                    )}
                    {isProcessingOCR && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <Loader2 size={16} className="animate-spin" />
                          Processing with enhanced OCR... {ocrProgress > 0 && `${ocrProgress}%`}
                        </div>
                        {ocrProgress > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }}></div>
                          </div>
                        )}
                      </div>
                    )}
                    {isProcessingAI && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-600 font-medium">
                          <Brain size={16} className="animate-pulse" />
                          Perplexity AI analyzing with real-time verification...
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-purple-600 h-2.5 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    )}
                    {ocrSuccess && (
                      <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                        <Check size={16} />
                        Receipt processed successfully! Form auto-filled with extracted data.
                      </div>
                    )}
                    {aiSuccess && (
                      <div className="flex items-center gap-2 text-purple-600 font-medium text-sm">
                        <Brain size={16} />
                        Perplexity AI enhancement completed! Data verified and categorized.
                      </div>
                    )}
                    {ocrError && (
                      <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                        <AlertCircle size={16} />
                        {ocrError}
                      </div>
                    )}
                    {aiError && (
                      <div className="flex items-center gap-2 text-orange-600 font-medium text-sm">
                        <AlertCircle size={16} />
                        {aiError}
                      </div>
                    )}
                  </div>
                  
                  {/* Image Preview */}
                  {selectedImage && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Receipt Preview:</h4>
                      <img 
                        src={selectedImage} 
                        alt="Receipt preview" 
                        className="max-w-full sm:max-w-sm max-h-56 object-contain rounded-lg border border-gray-300 p-1"
                      />
                    </div>
                  )}

                  {/* AI Analysis Results */}
                  {aiCategorizedData && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Brain size={16} />
                        AI Analysis Results (Confidence: {aiCategorizedData.confidence}%)
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-purple-600 font-medium">Vendor:</span>
                          <span className="ml-2 text-gray-700">{aiCategorizedData.vendor}</span>
                        </div>
                        <div>
                          <span className="text-purple-600 font-medium">Amount:</span>
                          <span className="ml-2 text-gray-700">{formatIndianCurrency(aiCategorizedData.amount)}</span>
                        </div>
                        <div>
                          <span className="text-purple-600 font-medium">Category:</span>
                          <span className="ml-2 text-gray-700">{aiCategorizedData.category}</span>
                        </div>
                        <div>
                          <span className="text-purple-600 font-medium">Parsed by:</span>
                          <span className="ml-2 text-gray-700">{aiCategorizedData.parsedBy}</span>
                        </div>
                      </div>
                      {aiCategorizedData.reasoning && (
                        <div className="mt-2">
                          <span className="text-purple-600 font-medium text-sm">Reasoning:</span>
                          <p className="text-xs text-gray-600 mt-1">{aiCategorizedData.reasoning}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Enhanced Manual Entry Form Fields with Source Selection */}
                <div className="space-y-5">
                  {/* Payment Source Selection - Prominent Placement */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label htmlFor="source" className="block text-sm font-medium text-blue-800 mb-3">
                      Payment Source * (Select where this expense was paid from)
                    </label>
                    <select
                      id="source"
                      value={currentExpense.sourceId}
                      onChange={(e) => setCurrentExpense({...currentExpense, sourceId: e.target.value})}
                      className="w-full p-3 border border-blue-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                      required
                    >
                      <option value="">Select payment source</option>
                      {sources.filter(source => source.isActive).map(source => {
                        const typeInfo = getSourceTypeInfo(source.type);
                        const Icon = typeInfo.icon;
                        const balance = sourceBalances[source.id] || 0;
                        const balanceStatus = getBalanceStatus(balance, source.alertThreshold);
                        
                        return (
                          <option key={source.id} value={source.id}>
                            {source.name} - {formatIndianCurrency(balance)} 
                            {balance < source.alertThreshold ? ' (Low Balance!)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    
                    {/* Source Balance Preview */}
                    {currentExpense.sourceId && (
                      <div className="mt-3 p-3 bg-white rounded-lg border">
                        {(() => {
                          const selectedSource = getSourceById(currentExpense.sourceId);
                          const balance = sourceBalances[currentExpense.sourceId] || 0;
                          const balanceStatus = getBalanceStatus(balance, selectedSource?.alertThreshold || 0);
                          const newBalance = balance - (parseFloat(currentExpense.amount) || 0);
                          
                          return (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Current Balance:</p>
                                <p className={`text-lg font-bold ${balanceStatus.color}`}>
                                  {formatIndianCurrency(balance)}
                                </p>
                              </div>
                              {currentExpense.amount && (
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-700">After Transaction:</p>
                                  <p className={`text-lg font-bold ${newBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatIndianCurrency(newBalance)}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Low Balance Warnings */}
                    {currentExpense.sourceId && (() => {
                      const selectedSource = getSourceById(currentExpense.sourceId);
                      const balance = sourceBalances[currentExpense.sourceId] || 0;
                      const amount = parseFloat(currentExpense.amount) || 0;
                      const newBalance = balance - amount;
                      
                      if (amount > balance) {
                        return (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertCircle size={16} />
                              <span className="text-sm font-medium">
                                Insufficient balance! This transaction exceeds available funds by {formatIndianCurrency(amount - balance)}
                              </span>
                            </div>
                          </div>
                        );
                      } else if (newBalance < selectedSource?.alertThreshold) {
                        return (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 text-orange-700">
                              <AlertCircle size={16} />
                              <span className="text-sm font-medium">
                                Warning: This transaction will bring your balance below the alert threshold of {formatIndianCurrency(selectedSource.alertThreshold)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={currentExpense.amount}
                        onChange={(e) => setCurrentExpense({...currentExpense, amount: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                      <input
                        id="vendor"
                        type="text"
                        value={currentExpense.vendor}
                        onChange={(e) => setCurrentExpense({...currentExpense, vendor: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Starbucks, Amazon"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        id="date"
                        type="date"
                        value={currentExpense.date}
                        onChange={(e) => setCurrentExpense({...currentExpense, date: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        id="category"
                        value={currentExpense.category}
                        onChange={(e) => setCurrentExpense({...currentExpense, category: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      id="description"
                      type="text"
                      value={currentExpense.description}
                      onChange={(e) => setCurrentExpense({...currentExpense, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Optional notes, e.g., 'Lunch with client'"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 mt-6">
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                    >
                      {isEditing ? 'Update Expense' : 'Add Expense'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-6 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ======================================================================= */}
          {/* SOURCE-SPECIFIC DASHBOARD (Individual View)                           */}
          {/* ======================================================================= */}
          {!selectedSources.includes('all') && selectedSources.length === 1 && (
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="p-6">
                {(() => {
                  const sourceId = selectedSources[0];
                  const source = getSourceById(sourceId);
                  const stats = getSourceStats(sourceId);
                  const balance = sourceBalances[sourceId] || 0;
                  const balanceStatus = getBalanceStatus(balance, source.alertThreshold);
                  const typeInfo = getSourceTypeInfo(source.type);
                  const Icon = typeInfo.icon;
                  
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-white"
                            style={{ backgroundColor: source.color }}
                          >
                            <Icon size={28} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{source.name}</h2>
                            <p className="text-gray-600">{typeInfo.name}</p>
                            {source.description && (
                              <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-600">Current Balance</p>
                          <p className={`text-3xl font-bold ${balanceStatus.color}`}>
                            {formatIndianCurrency(balance)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Started with {formatIndianCurrency(source.initialBalance)}
                          </p>
                        </div>
                      </div>

                      {/* Source Statistics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-800">Monthly Spent</p>
                              <p className="text-xl font-bold text-blue-600">
                                {formatIndianCurrency(stats.monthlySpent)}
                              </p>
                            </div>
                            <TrendingDown className="text-blue-500" size={24} />
                          </div>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-800">Total Transactions</p>
                              <p className="text-xl font-bold text-green-600">{stats.totalTransactions}</p>
                            </div>
                            <BarChart3 className="text-green-500" size={24} />
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-800">Alert Threshold</p>
                              <p className="text-xl font-bold text-purple-600">
                                {formatIndianCurrency(source.alertThreshold)}
                              </p>
                            </div>
                            <Bell className="text-purple-500" size={24} />
                          </div>
                        </div>
                        
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-800">Avg. Transaction</p>
                              <p className="text-xl font-bold text-orange-600">
                                {formatIndianCurrency(stats.totalTransactions > 0 ? stats.totalSpent / stats.totalTransactions : 0)}
                              </p>
                            </div>
                            <PieChart className="text-orange-500" size={24} />
                          </div>
                        </div>
                      </div>

                      {/* Category Breakdown */}
                      {Object.keys(stats.categoryBreakdown).length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
                          <div className="space-y-3">
                            {Object.entries(stats.categoryBreakdown)
                              .sort(([,a], [,b]) => b - a)
                              .map(([category, amount]) => {
                                const percentage = ((amount / stats.totalSpent) * 100).toFixed(1);
                                return (
                                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="text-lg">{getCategoryIcon(category)}</div>
                                      <span className="font-medium text-gray-700">{category}</span>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900">{formatIndianCurrency(amount)}</p>
                                      <p className="text-sm text-gray-500">{percentage}%</p>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Recent Transactions for this Source */}
                      {stats.recentTransactions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                          <div className="space-y-2">
                            {stats.recentTransactions.map(transaction => (
                              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div>
                                  <p className="font-medium text-gray-800">{transaction.vendor}</p>
                                  <p className="text-sm text-gray-600">{transaction.date} • {transaction.category}</p>
                                </div>
                                <p className="font-semibold text-gray-900">{formatIndianCurrency(transaction.amount)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </section>
          )}

 
{Object.keys(expensesByCategory).length > 0 && (
  <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
    <div className="p-6">
      <button
        onClick={() => setShowCategories(!showCategories)}
        className="w-full flex items-center justify-between text-left text-gray-900 focus:outline-none"
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tag size={20} />
          Expense Categories {!selectedSources.includes('all') && `(${selectedSources.length} sources)`}
        </h2>
        <ChevronDown
          size={24}
          className={`text-gray-500 transition-transform duration-300 ease-in-out ${
            showCategories ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      {showCategories && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            {Object.entries(expensesByCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => {
                const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                const transactionCount = filteredExpenses.filter(e => e.category === category).length;
                return (
                  <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{getCategoryIcon(category)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{category}</h3>
                        <p className="text-sm text-gray-600">{transactionCount} transaction{transactionCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatIndianCurrency(amount)}
                      </p>
                      <p className="text-sm text-gray-600">{percentage}% of total</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  </section>
)}


          {/* ======================================================================= */}
          {/* ENHANCED EXPENSES LIST (with Source Information)                      */}
          {/* ======================================================================= */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Eye size={20} />
                  Recent Expenses
                  {!selectedSources.includes('all') && (
                    <span className="text-sm font-normal text-gray-600">
                      ({filteredExpenses.length} from selected sources)
                    </span>
                  )}
                </h2>
                
                {/* Quick Filter for Source View */}
                {selectedSources.includes('all') && sources.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-gray-400" />
                    <select
                      onChange={(e) => {
                        if (e.target.value === 'all') {
                          setSelectedSources(['all']);
                        } else {
                          setSelectedSources([e.target.value]);
                        }
                      }}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Sources</option>
                      {sources.map(source => (
                        <option key={source.id} value={source.id}>{source.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                  <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-semibold">
                    {selectedSources.includes('all') 
                      ? 'No expenses recorded yet' 
                      : 'No expenses from selected sources'
                    }
                  </p>
                  <p className="text-gray-500 mt-1">
                    {selectedSources.includes('all') 
                      ? 'Upload a receipt or add an expense manually to get started.'
                      : 'Try selecting different sources or add new expenses.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExpenses.map(expense => {
                    const source = getSourceById(expense.sourceId);
                    const typeInfo = source ? getSourceTypeInfo(source.type) : null;
                    const Icon = typeInfo?.icon;
                    
                    return (
                      <div key={expense.id} className="border border-gray-200 rounded-lg p-4 transition-shadow duration-200 hover:shadow-lg hover:border-blue-300">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{expense.vendor}</h3>
                              <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                {expense.category}
                              </span>
                              
                              {/* Source Badge */}
                              {source && (
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                                     style={{ 
                                       backgroundColor: `${source.color}20`, 
                                       borderColor: source.color,
                                       color: source.color
                                     }}>
                                  {Icon && <Icon size={12} />}
                                  {source.name}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1.5 font-mono font-medium text-green-700">
                                <DollarSign size={14} />
                                {formatIndianCurrency(expense.amount)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {expense.date}
                              </span>
                              {expense.description && (
                                <span className="flex items-center gap-1.5">
                                  <Building size={14} />
                                  {expense.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <button
                              onClick={() => editExpense(expense)}
                              className="p-2 text-blue-600 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-colors"
                              title="Edit expense"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 text-red-600 rounded-md hover:bg-red-100 hover:text-red-800 transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

// Helper function to get category icons
const getCategoryIcon = (category) => {
  const icons = {
    'Food & Drink': '🍽️',
    'Transportation': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Healthcare': '🏥',
    'Utilities': '⚡',
    'Travel': '✈️',
    'Education': '📚',
    'Business': '💼',
    'Other': '📋'
  };
  return icons[category] || '📋';
};

export default ExpenseTracker;

