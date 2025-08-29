// ===========================================
// STATS CARDS - OVERVIEW METRICS
// ===========================================

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp,
    Target,
    Clock,
    DollarSign,
    Activity,
    AlertCircle
} from 'lucide-react';
import { ArbitrageStats } from '@/types/arbitrage';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsCardsProps {
    stats: ArbitrageStats;
    loading?: boolean;
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Opportunities",
            value: stats.totalOpportunities.toString(),
            icon: Target,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        },
        {
            title: "High Confidence",
            value: stats.highConfidenceCount.toString(),
            icon: AlertCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200"
        },
        {
            title: "Total Potential",
            value: formatCurrency(stats.totalPotentialProfit),
            icon: DollarSign,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200"
        },
        {
            title: "Best Profit",
            value: formatPercentage(stats.bestProfitPercentage),
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200"
        },
        {
            title: "Avg. Profit",
            value: formatPercentage(stats.averageProfit),
            icon: Activity,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200"
        },
        {
            title: "Avg. Time Left",
            value: `${Math.round(stats.averageTimeRemaining)} min`,
            icon: Clock,
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <Card className={`hover:shadow-md transition-all duration-200 ${stat.borderColor} border-l-4`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                                <div className={`${stat.bgColor} p-1.5 rounded-md mr-2`}>
                                    <stat.icon className={`w-3 h-3 ${stat.color}`} />
                                </div>
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className={`text-2xl font-bold ${stat.color}`}>
                                {stat.value}
                            </div>

                            {/* Additional context based on stat type */}
                            {stat.title === "Total Opportunities" && stats.totalOpportunities > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    {stats.highConfidenceCount > 0 && `${stats.highConfidenceCount} high confidence`}
                                </div>
                            )}

                            {stat.title === "Total Potential" && stats.totalPotentialProfit > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Per €1,000 investment
                                </div>
                            )}

                            {stat.title === "Best Profit" && stats.bestProfitPercentage > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Top opportunity
                                </div>
                            )}

                            {stat.title === "Avg. Profit" && stats.averageProfit > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Across all opportunities
                                </div>
                            )}

                            {stat.title === "Avg. Time Left" && stats.averageTimeRemaining > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Until match start
                                </div>
                            )}

                            {stat.title === "High Confidence" && stats.highConfidenceCount > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Ready to bet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}