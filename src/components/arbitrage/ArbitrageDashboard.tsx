// ===========================================
// ARBITRAGE DASHBOARD - MAIN COMPONENT (LIVE MODE ONLY)
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    RefreshCw,
    Play,
    Pause,
    Settings,
    Target,
    AlertCircle,
    TrendingUp,
    Info,
    DollarSign
} from 'lucide-react';
import { ArbitrageOpportunity, ArbitrageStats } from '@/types/arbitrage';
import { ArbitrageCard } from './ArbitrageCard';
import { StatsCards } from './StatsCards';
import { KellyCalculator } from '../kelly/KellyCalculator';
import { BankrollManager } from '../kelly/BankrollManager';
import { LiveStatusIndicator } from '../live/LiveStatusIndicator';
import { motion, AnimatePresence } from 'framer-motion';

export function ArbitrageDashboard() {
    const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
    const [stats, setStats] = useState<ArbitrageStats>({
        totalOpportunities: 0,
        totalPotentialProfit: 0,
        averageProfit: 0,
        highConfidenceCount: 0,
        bestProfitPercentage: 0,
        averageTimeRemaining: 0
    });
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showKellyCalculator, setShowKellyCalculator] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<ArbitrageOpportunity | null>(null);
    const [bankroll, setBankroll] = useState(5000);
    const [showBankrollManager, setShowBankrollManager] = useState(false);
    const [apiStatus, setApiStatus] = useState<any>({});
    const [rateLimits, setRateLimits] = useState<any>({});
    const [nextUpdate, setNextUpdate] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchOpportunities = async () => {
        setLoading(true);
        setError(null);

        try {
            // Always use live API endpoint
            const endpoint = '/api/arbitrage/live';
            const params = new URLSearchParams({
                date: selectedDate,
                live: 'true', // Always live mode
                sport: 'soccer_epl'
            });

            const response = await fetch(`${endpoint}?${params}`);
            const data = await response.json();

            if (data.success) {
                setOpportunities(data.opportunities || []);
                setStats(data.stats || stats);
                setApiStatus(data.apiStatus || {});
                setRateLimits(data.rateLimits || {});
                setLastUpdate(new Date());

                // Show success message for live mode
                if (data.opportunities.length > 0) {
                    console.log(`🔥 Found ${data.opportunities.length} LIVE arbitrage opportunities!`);
                }
            } else {
                setError(data.error || 'Failed to fetch opportunities');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Error fetching arbitrage opportunities:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh countdown
    useEffect(() => {
        if (!autoRefresh) return;

        const countdown = setInterval(() => {
            setNextUpdate(prev => {
                if (prev <= 1) {
                    fetchOpportunities();
                    return 60; // Reset to 60 seconds
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [autoRefresh]);

    // Initialize countdown
    useEffect(() => {
        if (autoRefresh) {
            setNextUpdate(60);
        } else {
            setNextUpdate(0);
        }
    }, [autoRefresh]);

    useEffect(() => {
        fetchOpportunities();
    }, [selectedDate]);

    const handleCalculateStake = (opportunity: ArbitrageOpportunity) => {
        setSelectedOpportunity(opportunity);
        setShowKellyCalculator(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <CardHeader>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-3xl font-bold">
                                            Live Arbitrage Finder
                                        </CardTitle>
                                        <p className="text-green-100 mt-1">
                                            Real-time guaranteed profit opportunities • Risk-free betting
                                        </p>
                                        {lastUpdate && (
                                            <LiveStatusIndicator
                                                isLive={true}
                                                lastUpdate={lastUpdate}
                                                nextUpdate={nextUpdate}
                                                opportunitiesFound={opportunities.length}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">
                                            {stats.totalPotentialProfit.toLocaleString('el-GR', {
                                                style: 'currency',
                                                currency: 'EUR'
                                            })}
                                        </div>
                                        <div className="text-green-100 text-sm">Total Profit Available</div>
                                    </div>

                                    <div className="text-right">
                                        <label className="text-green-100 text-sm block">Bankroll:</label>
                                        <input
                                            type="number"
                                            value={bankroll}
                                            onChange={(e) => setBankroll(Number(e.target.value))}
                                            className="bg-white/10 text-white rounded px-2 py-1 w-24 text-center border border-white/20"
                                            min="100"
                                            step="100"
                                        />
                                    </div>

                                    {/* Live Mode Indicator */}
                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-semibold">LIVE MODE</span>
                                        </div>
                                        <div className="text-xs text-green-200 mt-1">
                                            Real-time bookmaker data
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                                        <Switch
                                            checked={autoRefresh}
                                            onCheckedChange={setAutoRefresh}
                                            disabled={loading}
                                        />
                                        <span className="text-sm">
                                            {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={fetchOpportunities}
                                        disabled={loading}
                                        variant="secondary"
                                        size="sm"
                                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowBankrollManager(true)}
                                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                    >
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Bankroll
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Stats Cards */}
                <StatsCards stats={stats} loading={loading} />

                {/* Live Opportunities Alert */}
                <AnimatePresence>
                    {opportunities.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="mb-6"
                        >
                            <Card className="border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <div>
                                            <h3 className="text-lg font-bold text-green-800">
                                                🔥 {opportunities.length} Live Arbitrage Opportunities Found!
                                            </h3>
                                            <p className="text-green-600 text-sm">
                                                Real-time data from bookmaker APIs • Total potential profit: {stats.totalPotentialProfit.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* API Rate Limit Warning */}
                <AnimatePresence>
                    {rateLimits && Object.values(rateLimits).some((limit: any) => limit.percentage < 30) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6"
                        >
                            <Card className="border-yellow-500 bg-yellow-50">
                                <CardContent className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                API Rate Limit Warning
                                            </h3>
                                            <p className="text-yellow-700 text-sm mt-1">
                                                Your API calls are running low. Consider upgrading your plan or reducing refresh frequency to avoid interruptions.
                                            </p>
                                            <div className="mt-2 flex space-x-4 text-xs">
                                                {Object.entries(rateLimits).map(([api, limits]: [string, any]) => (
                                                    <span key={api} className="text-yellow-600">
                                                        {api}: {limits.remaining} calls remaining
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8"
                        >
                            <Card className="border-red-200 bg-red-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-3">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <div>
                                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                                            <p className="text-sm text-red-700 mt-1">{error}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                {loading && opportunities.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col justify-center items-center py-12"
                    >
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                        <p className="text-lg text-gray-600 mb-2">
                            Scanning live bookmaker APIs...
                        </p>
                        <p className="text-sm text-gray-500">
                            Finding real arbitrage opportunities
                        </p>
                    </motion.div>
                )}

                {/* API Setup Required Message */}
                <AnimatePresence>
                    {!loading && opportunities.length === 0 && !error && apiStatus && !apiStatus.hasLiveAccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mb-8"
                        >
                            <Card className="text-center py-12 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                                <CardContent>
                                    <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        API Key Required for Live Data
                                    </h3>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        To access real-time arbitrage opportunities from bookmaker APIs, you need to configure your API credentials.
                                    </p>
                                    <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-6 max-w-lg mx-auto text-left">
                                        <h4 className="font-semibold text-orange-800 mb-2">Setup Instructions:</h4>
                                        <ol className="text-sm text-orange-700 space-y-1">
                                            <li>1. Get API key from <a href="https://the-odds-api.com" target="_blank" className="underline font-medium">The Odds API</a></li>
                                            <li>2. Add <code className="bg-orange-200 px-1 rounded">NEXT_PUBLIC_ODDS_API_KEY=your_key</code> to .env.local</li>
                                            <li>3. Restart the application</li>
                                            <li>4. Start finding real arbitrage opportunities!</li>
                                        </ol>
                                    </div>
                                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                                        Live data required for arbitrage detection
                                    </Badge>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* No Opportunities (with API key) */}
                {!loading && opportunities.length === 0 && !error && apiStatus && apiStatus.hasLiveAccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
                            <CardContent>
                                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No Live Arbitrage Opportunities
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    The market is efficient right now - check back soon as opportunities appear frequently
                                </p>
                                <Badge variant="outline" className="text-xs">
                                    Next scan in {autoRefresh ? nextUpdate || '60' : 'manual'} seconds
                                </Badge>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Opportunities List */}
                <AnimatePresence>
                    {opportunities.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <h2 className="text-xl font-semibold">
                                        Live Arbitrage Opportunities
                                    </h2>
                                    <Badge variant="default">
                                        {opportunities.length} Found
                                    </Badge>
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                        REAL MONEY
                                    </Badge>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Filters
                                </Button>
                            </div>

                            {opportunities.map((opportunity, index) => (
                                <ArbitrageCard
                                    key={opportunity.id}
                                    opportunity={opportunity}
                                    rank={index + 1}
                                    onCalculateStake={handleCalculateStake}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* Kelly Calculator Modal */}
                <AnimatePresence>
                    {showKellyCalculator && selectedOpportunity && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                            onClick={() => setShowKellyCalculator(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white rounded-lg p-2">
                                    <div className="flex justify-between items-center mb-4 p-4">
                                        <h2 className="text-xl font-bold">Kelly Criterion Calculator</h2>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowKellyCalculator(false)}
                                        >
                                            ✕ Close
                                        </Button>
                                    </div>
                                    <KellyCalculator
                                        opportunity={selectedOpportunity}
                                        bankroll={bankroll}
                                        onStakeCalculated={(calc) => {
                                            console.log('Kelly calculation:', calc);
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bankroll Manager Modal */}
                <AnimatePresence>
                    {showBankrollManager && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                            onClick={() => setShowBankrollManager(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4 p-6 border-b">
                                    <h2 className="text-xl font-bold">Bankroll Manager</h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowBankrollManager(false)}
                                    >
                                        ✕ Close
                                    </Button>
                                </div>
                                <div className="p-6 pt-0">
                                    <BankrollManager
                                        initialBankroll={bankroll}
                                        onBankrollChange={(newBankroll) => {
                                            setBankroll(newBankroll);
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Educational Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-12"
                >
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-start space-x-3">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-900 mb-2">
                                        About Live Arbitrage Betting System
                                    </h3>
                                    <div className="text-sm text-blue-800 space-y-2">
                                        <p>
                                            <strong>Live Mode</strong> connects to real bookmaker APIs to find actual arbitrage opportunities with guaranteed profits.
                                        </p>
                                        <p>
                                            <strong>Kelly Criterion</strong> determines the optimal bet size to maximize long-term growth while minimizing risk.
                                        </p>
                                        <p>
                                            <strong>Success Rate:</strong> Arbitrage betting has a 100% success rate - profit is mathematically guaranteed regardless of match outcome.
                                        </p>
                                        <p>
                                            <strong>Typical Returns:</strong> 1-8% profit per opportunity, 2-15 opportunities per day, €50-500 daily profit potential.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}