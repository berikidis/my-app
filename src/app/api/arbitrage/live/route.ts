// ===========================================
// LIVE ARBITRAGE API ENDPOINT (LIVE MODE ONLY)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { LiveArbitrageDetector } from '@/lib/arbitrage/live-detector';
import { ArbitrageOpportunity, ArbitrageStats } from '@/types/arbitrage';

const liveDetector = new LiveArbitrageDetector();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sport = searchParams.get('sport') || 'soccer_epl';

        console.log('🔴 LIVE MODE: Fetching real-time data from bookmaker APIs');
        const opportunities: ArbitrageOpportunity[] = await liveDetector.scanForOpportunities(sport);

        // Sort by profit percentage
        const sortedOpportunities = opportunities
            .sort((a, b) => b.profitPercentage - a.profitPercentage)
            .slice(0, 20); // Limit to top 20

        // Calculate stats
        const stats: ArbitrageStats = {
            totalOpportunities: opportunities.length,
            totalPotentialProfit: opportunities.reduce((sum, opp) => sum + opp.totalProfit, 0),
            averageProfit: opportunities.length > 0
                ? opportunities.reduce((sum, opp) => sum + opp.profitPercentage, 0) / opportunities.length
                : 0,
            highConfidenceCount: opportunities.filter(opp => opp.confidence === 'HIGH').length,
            bestProfitPercentage: opportunities.length > 0 ? opportunities[0].profitPercentage : 0,
            averageTimeRemaining: opportunities.length > 0
                ? opportunities.reduce((sum, opp) => sum + opp.timeRemaining, 0) / opportunities.length
                : 0
        };

        // Get API status
        const apiStatus = liveDetector.getApiStatus();

        return NextResponse.json({
            success: true,
            mode: 'LIVE',
            opportunities: sortedOpportunities,
            stats,
            apiStatus,
            timestamp: new Date().toISOString(),
            rateLimits: apiStatus.rateLimits
        });

    } catch (error) {
        console.error('❌ Error in live arbitrage API:', error);
        return NextResponse.json(
            {
                success: false,
                mode: 'ERROR',
                error: 'Failed to fetch live arbitrage opportunities',
                details: error instanceof Error ? error.message : 'Unknown error',
                opportunities: [],
                stats: {
                    totalOpportunities: 0,
                    totalPotentialProfit: 0,
                    averageProfit: 0,
                    highConfidenceCount: 0,
                    bestProfitPercentage: 0,
                    averageTimeRemaining: 0
                }
            },
            { status: 500 }
        );
    }
}