import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, ChevronDown, Check, Loader2, PlusCircle, TrendingUp } from 'lucide-react';
import { useAssets } from '../context/AssetContext';
import AssetScopeSelect from './AssetScopeSelect';
import { ASSET_SCOPE } from '../utils/assetScope';
import '../style/AssetChatBot.css';

// Asset type mappings with keywords and field definitions
const ASSET_CONFIG = {
  Cash: {
    keywords: ['cash', 'money', 'bank', 'saving', 'checking', 'account', 'deposit', 'usd', 'eur', 'gbp'],
    fields: { name: 'Account Name', amount: 'Amount', currency: 'Currency' },
    requiredFields: ['name', 'amount']
  },
  Stocks: {
    keywords: ['stock', 'stocks', 'share', 'shares', 'equity', 'ticker', 'apple', 'google', 'msft', 'aapl', 'nvda'],
    fields: { ticker: 'Ticker Symbol', quantity: 'Quantity', purchasePrice: 'Purchase Price', total: 'Total Value' },
    requiredFields: ['ticker', 'quantity', 'purchasePrice']
  },
  Crypto: {
    keywords: ['crypto', 'bitcoin', 'ethereum', 'btc', 'eth', 'sol', 'coin', 'token', 'blockchain', 'wallet'],
    fields: { name: 'Coin Name', symbol: 'Symbol', amount: 'Amount', purchasePrice: 'Purchase Price', total: 'Total Value' },
    requiredFields: ['name', 'amount', 'purchasePrice']
  },
  Property: {
    keywords: ['house', 'property', 'home', 'real estate', 'apartment', 'condo', 'land', 'building', 'mortgage'],
    fields: { address: 'Address', price: 'Value', bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', squareFeet: 'Square Feet' },
    requiredFields: ['address', 'price']
  },
  Auto: {
    keywords: ['car', 'auto', 'vehicle', 'tesla', 'toyota', 'bmw', 'mercedes', 'truck', 'motorcycle'],
    fields: { make: 'Make', model: 'Model', year: 'Year', value: 'Current Value', mileage: 'Mileage' },
    requiredFields: ['make', 'model', 'year', 'value']
  },
  Metals: {
    keywords: ['gold', 'silver', 'platinum', 'metal', 'bullion', 'bar', 'coin', 'oz', 'ounce'],
    fields: { type: 'Metal Type', weight: 'Weight (oz)', purchasePrice: 'Purchase Price', total: 'Total Value' },
    requiredFields: ['type', 'weight']
  },
  Loan: {
    keywords: ['loan', 'mortgage', 'debt', 'borrow', 'credit', 'owe', 'liability'],
    fields: { name: 'Loan Name', loanValue: 'Outstanding Balance', interestRate: 'Interest Rate', monthlyPayment: 'Monthly Payment' },
    requiredFields: ['name', 'loanValue']
  },
  Savings: {
    keywords: ['savings', 'emergency fund', 'cd', 'certificate', 'fixed deposit'],
    fields: { name: 'Account Name', currentBalance: 'Current Balance', interestRate: 'Interest Rate' },
    requiredFields: ['name', 'currentBalance']
  },
  Retirement: {
    keywords: ['retirement', '401k', 'ira', 'roth', 'pension', '403b'],
    fields: { name: 'Account Name', currentBalance: 'Current Balance', institution: 'Institution' },
    requiredFields: ['name', 'currentBalance']
  },
  LuxuryWatches: {
    keywords: ['watch', 'watches', 'luxury watch', 'rolex', 'patek', 'omega', 'timepiece', 'wristwatch'],
    fields: { brand: 'Brand', model: 'Model', year: 'Year', marketValue: 'Market Value', condition: 'Condition' },
    requiredFields: ['brand', 'model', 'marketValue']
  },
  CustomAsset: {
    keywords: ['asset', 'other', 'custom', 'misc', 'additional', 'anything', 'something'],
    fields: { name: 'Asset Name', totalValue: 'Value', description: 'Description' },
    requiredFields: ['name', 'totalValue']
  }
};

// Extract numbers from text
const extractNumbers = (text) => {
  const matches = text.match(/[\$€£]?\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\.\d+)?/g);
  return matches ? matches.map(m => parseFloat(m.replace(/[^0-9.]/g, ''))) : [];
};

// Extract asset type from message
const detectAssetType = (message) => {
  const lowerMessage = message.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  for (const [type, config] of Object.entries(ASSET_CONFIG)) {
    let score = 0;
    config.keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        score += keyword.length;
      }
    });
    if (score > highestScore) {
      highestScore = score;
      bestMatch = type;
    }
  }

  // If no asset type detected but there are numbers, fall back to CustomAsset
  if (!bestMatch && extractNumbers(message).length > 0) {
    return 'CustomAsset';
  }

  return bestMatch;
};

// Extract potential field values from message
const extractFieldValues = (message, assetType) => {
  const values = {};
  const numbers = extractNumbers(message);
  const config = ASSET_CONFIG[assetType];
  
  // Extract name/description (anything not a number or common word)
  const cleanMessage = message.replace(/[\$€£\d,\.\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanMessage.length > 3 && config.fields.name) {
    values.name = cleanMessage;
  }

  // Assign numbers to likely fields
  if (numbers.length > 0) {
    const numberFields = Object.entries(config.fields)
      .filter(([key]) => key !== 'name' && key !== 'description' && key !== 'address')
      .map(([key]) => key);

    numbers.forEach((num, idx) => {
      if (numberFields[idx]) {
        values[numberFields[idx]] = num;
      }
    });
  }

  return values;
};

// Generate response based on user input
const generateResponse = (message, assetType, extractedValues) => {
  if (!assetType) {
    return {
      type: 'clarification',
      text: "I can help you add assets! Try mentioning what type of asset you'd like to add. For example:\n• \"I have $5000 cash in my checking account\"\n• \"Bought 10 shares of Apple at $180\"\n• \"My house is worth $450,000\"",
      suggestions: ['Add Cash', 'Add Stock', 'Add Property', 'Add Crypto']
    };
  }

  const config = ASSET_CONFIG[assetType];
  const missingFields = config.requiredFields.filter(field => !extractedValues[field]);

  if (missingFields.length === 0) {
    return {
      type: 'ready',
      text: `Perfect! I detected you want to add a **${assetType}** asset.\n\nHere's what I found:`,
      assetType,
      values: extractedValues,
      canAdd: true
    };
  }

  return {
    type: 'needs_info',
    text: `Looks like you want to add a **${assetType}**! I just need a bit more information:\n\nMissing: ${missingFields.map(f => config.fields[f]).join(', ')}`,
    assetType,
    values: extractedValues,
    missingFields
  };
};

const AssetChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAsset, setPendingAsset] = useState(null);
  const [pendingScope, setPendingScope] = useState(ASSET_SCOPE.PERSONAL);
  const messagesEndRef = useRef(null);
  const { addAsset } = useAssets();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('vaultknight-open-chatbot', handleOpen);
    return () => window.removeEventListener('vaultknight-open-chatbot', handleOpen);
  }, []);

  const processMessage = useCallback(async (userMessage) => {
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));

    const assetType = detectAssetType(userMessage);
    const extractedValues = assetType ? extractFieldValues(userMessage, assetType) : {};
    const response = generateResponse(userMessage, assetType, extractedValues);

    if (response.canAdd) {
      setPendingAsset({ type: assetType, data: extractedValues });
      setPendingScope(ASSET_SCOPE.PERSONAL);
    }

    setMessages(prev => [...prev, { role: 'assistant', ...response }]);
    setIsTyping(false);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    
    await processMessage(userMessage);
  };

  // Correct Firestore collection name mappings - ALL assets go to their native collections now
  const COLLECTION_MAPPINGS = {
    'Auto': 'Autos',
    'Property': 'Properties',
    'LuxuryWatches': 'LuxuryWatches',
    'CustomAsset': 'CustomAssets',
    'Savings': 'Savings',
    'Retirement': 'Retirement',
    'Bonds': 'Bonds',
    'Commodities': 'Commodities',
    'ArtCollectibles': 'ArtCollectibles',
    'PrivateEquity': 'PrivateEquity',
    'IntellectualProperty': 'IntellectualProperty'
  };

  const handleAddAsset = async () => {
    if (!pendingAsset) return;
    
    try {
      setIsTyping(true);
      const collectionName = COLLECTION_MAPPINGS[pendingAsset.type] || pendingAsset.type;
      await addAsset(collectionName, { ...pendingAsset.data, scope: pendingScope });
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        type: 'success',
        text: `✅ **Success!** Your ${pendingAsset.type.toLowerCase()} asset has been added to your portfolio.\n\nIt will now appear in your dashboard and calculations.`,
        icon: <Check className="success-icon" />
      }]);
      
      setPendingAsset(null);
      setPendingScope(ASSET_SCOPE.PERSONAL);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        type: 'error',
        text: `Sorry, there was an error adding your asset: ${error.message}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="chatbot-fab"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Bot size={24} />
        <Sparkles className="sparkle-icon" size={14} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <Bot size={22} />
                <div>
                  <h3>Asset Assistant</h3>
                  <span>AI-powered asset entry</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="chatbot-messages">
              {messages.length === 0 && (
                <motion.div 
                  className="welcome-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <TrendingUp size={40} className="welcome-icon" />
                  <h4>Welcome! 👋</h4>
                  <p>I'm your personal asset assistant. Just tell me about your assets in natural language and I'll add them automatically.</p>
                  <div className="example-suggestions">
                    <button onClick={() => handleSuggestion("I have $3500 in my savings account")}>
                      💵 Add Cash
                    </button>
                    <button onClick={() => handleSuggestion("Bought 15 shares of Tesla at $240")}>
                      📈 Add Stock
                    </button>
                    <button onClick={() => handleSuggestion("My house is valued at $525000")}>
                      🏠 Add Property
                    </button>
                  </div>
                </motion.div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`message ${msg.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  {msg.icon}
                  <div className="message-content">
                    <p>{msg.text}</p>
                    
                    {msg.values && (
                      <div className="extracted-values">
                        {Object.entries(msg.values).map(([key, value]) => (
                          <div key={key} className="value-tag">
                            <span className="value-label">{ASSET_CONFIG[msg.assetType]?.fields[key] || key}:</span>
                            <span className="value-data">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.suggestions && (
                      <div className="suggestion-buttons">
                        {msg.suggestions.map((sug, i) => (
                          <button key={i} onClick={() => handleSuggestion(sug)}>
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.canAdd && pendingAsset && (
                      <div className="chatbot-confirm-actions">
                        <AssetScopeSelect
                          value={pendingScope}
                          onChange={setPendingScope}
                          name="chat-scope"
                          id="chat-scope"
                        />
                        <motion.button
                          className="add-asset-btn"
                          onClick={handleAddAsset}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <PlusCircle size={18} />
                          Add This Asset
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="message assistant typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="chatbot-input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your asset..."
                className="chatbot-input"
              />
              <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
                {isTyping ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssetChatBot;