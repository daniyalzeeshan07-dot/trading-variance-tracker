'use client';

import React, { useState, useEffect } from 'react';

export default function TradingVarianceTracker() {
  const [trades, setTrades] = useState([]);
  const [view, setView] = useState('trades');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    symbol: '',
    strategy: '',
    tradeDate: new Date().toISOString().split('T')[0],
    expectedReturn: '',
    actualReturn: '',
    expectedPrice: '',
    actualPrice: '',
    quantity: '',
    notes: ''
  });

  // Load trades from localStorage on mount
  useEffect(() => {
    loadTrades();
  }, []);

  // Save trades to localStorage whenever they change
  useEffect(() => {
    if (trades.length > 0) {
      saveTrades();
    }
  }, [trades]);

  const loadTrades = async () => {
    try {
      const stored = localStorage.getItem('trading-trades-v2');
      if (stored) {
        setTrades(JSON.parse(stored));
      }
    } catch (error) {
      console.log('First load - no trades yet');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTrades = async () => {
    try {
      localStorage.setItem('trading-trades-v2', JSON.stringify(trades));
    } catch (error) {
      console.error('Failed to save trades:', error);
    }
  };

  const handleAddTrade = (e) => {
    e.preventDefault();
    if (!formData.symbol || (!formData.expectedReturn && !formData.expectedPrice)) {
      alert('Please fill in symbol and at least one expected value');
      return;
    }

    const newTrade = {
      id: Date.now(),
      ...formData,
      expectedReturn: formData.expectedReturn ? parseFloat(formData.expectedReturn) : null,
      actualReturn: formData.actualReturn ? parseFloat(formData.actualReturn) : null,
      expectedPrice: formData.expectedPrice ? parseFloat(formData.expectedPrice) : null,
      actualPrice: formData.actualPrice ? parseFloat(formData.actualPrice) : null,
      quantity: formData.quantity ? parseFloat(formData.quantity) : 1,
      variance: calculateVariance(formData)
    };

    setTrades([newTrade, ...trades]);
    setFormData({
      symbol: '',
      strategy: '',
      tradeDate: new Date().toISOString().split('T')[0],
      expectedReturn: '',
      actualReturn: '',
      expectedPrice: '',
      actualPrice: '',
      quantity: '',
      notes: ''
    });
  };

  const calculateVariance = (data) => {
    if (data.expectedReturn && data.actualReturn) {
      return parseFloat(data.actualReturn) - parseFloat(data.expectedReturn);
    }
    if (data.expectedPrice && data.actualPrice) {
      return parseFloat(data.actualPrice) - parseFloat(data.expectedPrice);
    }
    return 0;
  };

  const deleteTrade = (id) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  const getStrategyAnalysis = () => {
    const strategies = {};

    trades.forEach(trade => {
      const strat = trade.strategy || 'Unassigned';
      if (!strategies[strat]) {
        strategies[strat] = {
          name: strat,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          totalVariance: 0,
          maxVariance: -Infinity,
          minVariance: Infinity,
          profitableTrades: 0,
          totalProfit: 0
        };
      }

      strategies[strat].totalTrades++;
      strategies[strat].totalVariance += trade.variance || 0;
      strategies[strat].maxVariance = Math.max(strategies[strat].maxVariance, trade.variance || 0);
      strategies[strat].minVariance = Math.min(strategies[strat].minVariance, trade.variance || 0);

      if ((trade.variance || 0) > 0) {
        strategies[strat].winningTrades++;
        strategies[strat].profitableTrades++;
        strategies[strat].totalProfit += trade.variance || 0;
      } else if ((trade.variance || 0) < 0) {
        strategies[strat].losingTrades++;
        strategies[strat].totalProfit += trade.variance || 0;
      }
    });

    return Object.values(strategies).sort((a, b) => b.totalProfit - a.totalProfit);
  };

  const stats = {
    totalTrades: trades.length,
    avgVariance: trades.length > 0 ? Math.round(trades.reduce((sum, t) => sum + (t.variance || 0), 0) / trades.length * 100) / 100 : 0,
    positiveVariance: trades.filter(t => (t.variance || 0) > 0).length,
    negativeVariance: trades.filter(t => (t.variance || 0) < 0).length,
    totalProfit: trades.length > 0 ? Math.round(trades.reduce((sum, t) => sum + (t.variance || 0), 0) * 100) / 100 : 0,
    winRate: trades.length > 0 ? Math.round((trades.filter(t => (t.variance || 0) > 0).length / trades.length) * 100) : 0
  };

  const strategyData = getStrategyAnalysis();

  const exportData = () => {
    const csv = ['Symbol,Date,Strategy,Expected,Actual,Variance,Notes'];
    trades.forEach(trade => {
      const expected = trade.expectedReturn || trade.expectedPrice || '';
      const actual = trade.actualReturn || trade.actualPrice || '';
      csv.push(`${trade.symbol},${trade.tradeDate},${trade.strategy || 'Unassigned'},${expected},${actual},${trade.variance},${trade.notes}`);
    });
    const dataStr = csv.join('\n');
    const blob = new Blob([dataStr], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading-variance-export.csv';
    a.click();
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Trading Variance Tracker</h1>
          <p className="text-slate-600">Track your trades and analyze strategy profitability</p>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setView('trades')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              view === 'trades'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            Trade Log
          </button>
          <button
            onClick={() => setView('strategies')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              view === 'strategies'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            Strategy Analysis
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">Total Trades</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalTrades}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">Total P&L</p>
            <p className={`text-3xl font-bold ${stats.totalProfit > 0 ? 'text-green-600' : stats.totalProfit < 0 ? 'text-red-600' : 'text-slate-600'}`}>
              {stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">Win Rate</p>
            <p className="text-3xl font-bold text-blue-600">{stats.winRate}%</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <p className="text-slate-600 text-sm font-medium mb-2">Avg Variance</p>
            <p className={`text-3xl font-bold ${stats.avgVariance > 0 ? 'text-green-600' : stats.avgVariance < 0 ? 'text-red-600' : 'text-slate-600'}`}>
              {stats.avgVariance > 0 ? '+' : ''}{stats.avgVariance}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Log New Trade</h2>
          <form onSubmit={handleAddTrade}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Symbol *</label>
                <input
                  type="text"
                  placeholder="BTC, AAPL, etc"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Strategy</label>
                <input
                  type="text"
                  placeholder="e.g. Momentum"
                  value={formData.strategy}
                  onChange={(e) => setFormData({...formData, strategy: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.tradeDate}
                  onChange={(e) => setFormData({...formData, tradeDate: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expected Return (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5.5"
                  value={formData.expectedReturn}
                  onChange={(e) => setFormData({...formData, expectedReturn: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Actual Return (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="3.2"
                  value={formData.actualReturn}
                  onChange={(e) => setFormData({...formData, actualReturn: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expected Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="100.50"
                  value={formData.expectedPrice}
                  onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Actual Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="98.75"
                  value={formData.actualPrice}
                  onChange={(e) => setFormData({...formData, actualPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <input
                  type="text"
                  placeholder="Trade notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                Add Trade
              </button>
              {trades.length > 0 && (
                <button
                  type="button"
                  onClick={exportData}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all"
                >
                  Export CSV
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Trade Log View */}
        {view === 'trades' && trades.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 overflow-x-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Trade History</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Symbol</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Strategy</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Expected</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Actual</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Variance</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Notes</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(trade => (
                  <tr key={trade.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{trade.symbol}</td>
                    <td className="py-3 px-4 text-slate-600">{trade.strategy || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">{trade.tradeDate}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{trade.expectedReturn || trade.expectedPrice || '-'}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{trade.actualReturn || trade.actualPrice || '-'}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${(trade.variance || 0) > 0 ? 'text-green-600' : (trade.variance || 0) < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      {(trade.variance || 0) > 0 ? '+' : ''}{Math.round(trade.variance * 100) / 100}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{trade.notes}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteTrade(trade.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Strategy Analysis View */}
        {view === 'strategies' && trades.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Strategy Profitability</h2>
            <div className="grid grid-cols-1 gap-6">
              {strategyData.map((strategy) => (
                <div key={strategy.name} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{strategy.name}</h3>
                      <p className="text-slate-600 text-sm">{strategy.totalTrades} trade{strategy.totalTrades !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${strategy.totalProfit > 0 ? 'text-green-600' : strategy.totalProfit < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {strategy.totalProfit > 0 ? '+' : ''}{Math.round(strategy.totalProfit * 100) / 100}
                      </p>
                      <p className="text-slate-600 text-sm">Total P&L</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-600 text-xs font-medium mb-2">Win Rate</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {strategy.totalTrades > 0 ? Math.round((strategy.winningTrades / strategy.totalTrades) * 100) : 0}%
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-600 text-xs font-medium mb-2">Winning</p>
                      <p className="text-2xl font-bold text-green-600">{strategy.winningTrades}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-600 text-xs font-medium mb-2">Losing</p>
                      <p className="text-2xl font-bold text-red-600">{strategy.losingTrades}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-600 text-xs font-medium mb-2">Avg Variance</p>
                      <p className={`text-2xl font-bold ${(strategy.totalVariance / strategy.totalTrades) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.round((strategy.totalVariance / strategy.totalTrades) * 100) / 100 > 0 ? '+' : ''}{Math.round((strategy.totalVariance / strategy.totalTrades) * 100) / 100}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-600 text-xs font-medium mb-2">Best Trade</p>
                      <p className="text-2xl font-bold text-green-600">+{Math.round(strategy.maxVariance * 100) / 100}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-600 text-xs font-medium mb-2">Worst Trade</p>
                      <p className="text-2xl font-bold text-red-600">{Math.round(strategy.minVariance * 100) / 100}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {trades.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg">No trades logged yet. Add your first trade to start tracking variances.</p>
          </div>
        )}
      </div>
    </div>
  );
}
