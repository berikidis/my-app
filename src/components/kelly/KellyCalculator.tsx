// ===========================================
// KELLY CRITERION CALCULATOR
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Calculator,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    Target,
    Settings,
    PieChart,
    Clock,
    Shield
} from 'lucide-react';
import { KellyCriterionCalculator, KellyCalculation, BankrollSettings } from '@/lib/kelly-criterion';
import { ArbitrageOpportunity } from '@/types/arbitrage';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface KellyCalculatorProps {
    opportunity: ArbitrageOpportunity;
    bankroll: number;
    onStakeCalculated?: (calculation: KellyCalculation) => void;
}

export function KellyCalculator({ opportunity, bankroll, onStakeCalculated }: KellyCalculatorProps) {
    const [settings, setSettings] = useState<BankrollSettings>({
        totalBankroll: bankroll,
        maxRiskPerBet: 5, // 5% max risk per bet
        riskTolerance: 'MEDIUM',
        reinvestProfits: true,
        emergencyFund: 10 // Keep 10% as emergency fund
    });

    const [calculation, setCalculation] = useState<KellyCalculation | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        calculateKelly();
    }, [opportunity, settings]);

    const calculateKelly = () => {
        // For arbitrage, we use the specialized arbitrage Kelly calculation
        const kellyResult = KellyCriterionCalculator.calculateArbitrageKelly(
            opportunity.stakes,
            opportunity.stakes.reduce((sum, stake) => sum + stake.stake, 0),
            opportunity.totalProfit,
            settings.totalBankroll,
            settings
        );

        setCalculation(kellyResult);
        onStakeCalculated?.(kellyResult);
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'CONSERVATIVE': return 'text-green-600 bg-green-50 border-green-200';
            case 'MODERATE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'AGGRESSIVE': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (!calculation) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                        Kelly Criterion Analysis
                        <Badge variant="outline" className="ml-2">
                            Optimal Sizing
                        </Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Main Calculation Results */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="flex items-center justify-center mb-2">
                                <Target className="w-4 h-4 text-green-600 mr-1" />
                                <span className="text-sm font-medium text-gray-600">Optimal Stake</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(calculation.optimalStake)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {calculation.kellyPercentage.toFixed(1)}% of bankroll
                            </div>
                        </div>

                        <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="flex items-center justify-center mb-2">
                                <DollarSign className="w-4 h-4 text-blue-600 mr-1" />
                                <span className="text-sm font-medium text-gray-600">Expected Profit</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(calculation.expectedValue)}
                            </div>
                            <div className="text-xs text-gray-500">
                                Guaranteed return
                            </div>
                        </div>

                        <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="flex items-center justify-center mb-2">
                                <Clock className="w-4 h-4 text-purple-600 mr-1" />
                                <span className="text-sm font-medium text-gray-600">Time to Double</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                                {calculation.timeToDouble === Infinity ? '∞' : `${calculation.timeToDouble}m`}
                            </div>
                            <div className="text-xs text-gray-500">
                                At this rate
                            </div>
                        </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-white rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold flex items-center">
                                <Shield className="w-4 h-4 mr-2" />
                                Risk Assessment
                            </h4>
                            <Badge className={`border ${getRiskColor(calculation.riskLevel)}`}>
                                {calculation.riskLevel}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Kelly Percentage</span>
                                    <span>{calculation.kellyPercentage.toFixed(2)}%</span>
                                </div>
                                <Progress
                                    value={Math.min(calculation.kellyPercentage, 10)}
                                    className="h-2"
                                />
                            </div>

                            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                <strong>Recommendation:</strong> {calculation.recommendation}
                            </div>
                        </div>
                    </div>

                    {/* Bankroll Breakdown */}
                    <div className="bg-white rounded-lg p-4 border">
                        <h4 className="font-semibold mb-3 flex items-center">
                            <PieChart className="w-4 h-4 mr-2" />
                            Bankroll Allocation
                        </h4>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Bankroll</span>
                                <span className="font-semibold">{formatCurrency(settings.totalBankroll)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Emergency Fund ({settings.emergencyFund}%)</span>
                                <span className="text-red-600">
                  -{formatCurrency(settings.totalBankroll * settings.emergencyFund / 100)}
                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Available for Betting</span>
                                <span className="font-semibold">
                  {formatCurrency(settings.totalBankroll * (1 - settings.emergencyFund / 100))}
                </span>
                            </div>

                            <div className="flex justify-between items-center border-t pt-2">
                                <span className="text-sm font-medium text-green-600">Optimal Investment</span>
                                <span className="font-bold text-green-600">
                  {formatCurrency(calculation.optimalStake)}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Scaled Stakes for Each Bookmaker */}
                    <div className="bg-white rounded-lg p-4 border">
                        <h4 className="font-semibold mb-3">Kelly-Optimized Stakes</h4>
                        <div className="space-y-2">
                            {opportunity.stakes.map((originalStake, index) => {
                                const scaleFactor = calculation.optimalStake / opportunity.stakes.reduce((sum, s) => sum + s.stake, 0);
                                const kellyStake = originalStake.stake * scaleFactor;
                                const kellyProfit = originalStake.profit * scaleFactor;

                                return (
                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <div className="flex items-center space-x-2">
                                            <div className={cn(
                                                "w-3 h-3 rounded-full",
                                                originalStake.outcome === '1' ? 'bg-blue-500' :
                                                    originalStake.outcome === 'X' ? 'bg-gray-500' : 'bg-red-500'
                                            )} />
                                            <span className="text-sm font-medium">{originalStake.outcomeName}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {originalStake.bookmaker}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600">
                                                {formatCurrency(kellyStake)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                @ {originalStake.odds.toFixed(2)} → {formatCurrency(kellyProfit)} profit
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Advanced Settings Toggle */}
                    <div className="border-t pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                        </Button>
                    </div>

                    {/* Advanced Settings */}
                    {showAdvanced && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 border-t pt-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Total Bankroll
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.totalBankroll}
                                        onChange={(e) => setSettings({...settings, totalBankroll: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min="100"
                                        step="100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Max Risk per Bet (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.maxRiskPerBet}
                                        onChange={(e) => setSettings({...settings, maxRiskPerBet: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min="1"
                                        max="25"
                                        step="0.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Risk Tolerance
                                    </label>
                                    <select
                                        value={settings.riskTolerance}
                                        onChange={(e) => setSettings({...settings, riskTolerance: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH'})}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="LOW">Conservative</option>
                                        <option value="MEDIUM">Moderate</option>
                                        <option value="HIGH">Aggressive</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Emergency Fund (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.emergencyFund}
                                        onChange={(e) => setSettings({...settings, emergencyFund: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min="5"
                                        max="30"
                                        step="5"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Warning for High Stakes */}
                    {calculation.optimalStake > settings.totalBankroll * 0.1 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <strong>High Stakes Warning:</strong> Kelly suggests investing {calculation.kellyPercentage.toFixed(1)}% of your bankroll.
                                Consider reducing your stake if you're uncomfortable with this level of exposure.
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}