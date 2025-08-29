// ===========================================
// ARBITRAGE CARD - OPPORTUNITY DISPLAY
// ===========================================

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Clock,
    TrendingUp,
    Target,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Timer,
    Users
} from 'lucide-react';
import { ArbitrageOpportunity } from '@/types/arbitrage';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ArbitrageCardProps {
    opportunity: ArbitrageOpportunity;
    rank: number;
    onCalculateStake?: (opportunity: ArbitrageOpportunity) => void;
}

export function ArbitrageCard({ opportunity, rank, onCalculateStake }: ArbitrageCardProps) {
    const getConfidenceBadgeVariant = (confidence: string) => {
        switch (confidence) {
            case 'HIGH': return 'bg-green-100 text-green-800 border-green-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'VERY_LOW': return 'text-green-600';
            case 'LOW': return 'text-green-500';
            case 'MEDIUM': return 'text-yellow-500';
            case 'HIGH': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getProfitColor = (profit: number) => {
        if (profit >= 3) return 'text-green-600';
        if (profit >= 2) return 'text-green-500';
        if (profit >= 1) return 'text-yellow-600';
        return 'text-gray-600';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: rank * 0.1 }}
        >
            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                {rank}
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    {opportunity.homeTeam} vs {opportunity.awayTeam}
                                </CardTitle>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                      {opportunity.competition}
                  </span>
                                    <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                                        {opportunity.timeRemaining} min
                  </span>
                                    <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                                        {opportunity.bookmakerCount} bookmakers
                  </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right space-y-2">
                            <Badge className={`border ${getConfidenceBadgeVariant(opportunity.confidence)}`}>
                                {opportunity.confidence}
                            </Badge>
                            <div className={cn("text-2xl font-bold", getProfitColor(opportunity.profitPercentage))}>
                                {formatPercentage(opportunity.profitPercentage)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {formatCurrency(opportunity.totalProfit)} profit
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Profit Overview */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Guaranteed Profit Analysis
                            </h4>
                            <div className={cn("text-sm", getRiskColor(opportunity.riskLevel))}>
                                Risk: {opportunity.riskLevel.replace('_', ' ')}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                                <div className="font-bold text-green-600">{formatCurrency(opportunity.minBankroll)}</div>
                                <div className="text-muted-foreground">Min Investment</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-blue-600">{formatCurrency(opportunity.totalProfit)}</div>
                                <div className="text-muted-foreground">Total Profit</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-purple-600">{opportunity.estimatedTime}s</div>
                                <div className="text-muted-foreground">Est. Time</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-orange-600">{(opportunity.impliedProbability * 100).toFixed(1)}%</div>
                                <div className="text-muted-foreground">Implied Prob.</div>
                            </div>
                        </div>
                    </div>

                    {/* Betting Strategy */}
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Betting Strategy
                        </h4>

                        <div className="grid gap-3">
                            {opportunity.stakes.map((stake, index) => (
                                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className={cn(
                                                "w-3 h-3 rounded-full",
                                                stake.outcome === '1' ? 'bg-blue-500' :
                                                    stake.outcome === 'X' ? 'bg-gray-500' : 'bg-red-500'
                                            )} />
                                            <span className="font-medium">{stake.outcomeName}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {stake.bookmaker}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{formatCurrency(stake.stake)}</div>
                                            <div className="text-xs text-muted-foreground">@ {stake.odds.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="text-muted-foreground">
                                            Implied: {stake.impliedProbability.toFixed(1)}%
                                        </div>
                                        <div className="text-green-600 font-semibold">
                                            Profit: {formatCurrency(stake.profit)}
                                        </div>
                                    </div>

                                    <Progress
                                        value={stake.impliedProbability}
                                        className="mt-2 h-1.5"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Best Odds Comparison */}
                    <div className="border-t pt-4">
                        <h5 className="font-medium mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Best Available Odds
                        </h5>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="font-semibold text-gray-700">Home Win</div>
                                <div className="text-lg font-bold text-blue-600">{opportunity.bestOdds.home.odds.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">{opportunity.bestOdds.home.bookmaker}</div>
                            </div>
                            {opportunity.bestOdds.draw && (
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Draw</div>
                                    <div className="text-lg font-bold text-gray-600">{opportunity.bestOdds.draw.odds.toFixed(2)}</div>
                                    <div className="text-xs text-muted-foreground">{opportunity.bestOdds.draw.bookmaker}</div>
                                </div>
                            )}
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="font-semibold text-gray-700">Away Win</div>
                                <div className="text-lg font-bold text-red-600">{opportunity.bestOdds.away.odds.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">{opportunity.bestOdds.away.bookmaker}</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={() => onCalculateStake?.(opportunity)}
                            className="flex-1"
                            variant="default"
                        >
                            <Target className="w-4 h-4 mr-2" />
                            Calculate Stakes
                        </Button>
                        <Button variant="outline" className="flex-1">
                            <Timer className="w-4 h-4 mr-2" />
                            Set Alert
                        </Button>
                    </div>

                    {/* Warning */}
                    {(opportunity.riskLevel === 'HIGH' || opportunity.timeRemaining < 30) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                {opportunity.timeRemaining < 30 && "Match starts soon - act quickly! "}
                                {opportunity.riskLevel === 'HIGH' && "High risk opportunity - verify odds before betting."}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
