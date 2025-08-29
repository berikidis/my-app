// ===========================================
// ARBITRAGE SYSTEM - TYPE DEFINITIONS
// ===========================================

export interface BookmakerOdds {
    bookmaker: string;
    home: number;
    draw?: number;
    away: number;
    lastUpdate: Date;
    market?: string;
}

export interface ArbitrageOpportunity {
    id: string;
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    competition: string;
    matchTime: Date;
    totalProfit: number;
    profitPercentage: number;
    impliedProbability: number;
    stakes: ArbitrageStake[];
    bestOdds: {
        home: { bookmaker: string; odds: number };
        draw?: { bookmaker: string; odds: number };
        away: { bookmaker: string; odds: number };
    };
    timeRemaining: number; // minutes until match
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    minBankroll: number;
    estimatedTime: number; // seconds to place all bets
    riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH';
    bookmakerCount: number;
}

export interface ArbitrageStake {
    outcome: '1' | 'X' | '2';
    outcomeName: string;
    bookmaker: string;
    odds: number;
    stake: number;
    profit: number;
    impliedProbability: number;
}

export interface ArbitrageStats {
    totalOpportunities: number;
    totalPotentialProfit: number;
    averageProfit: number;
    highConfidenceCount: number;
    bestProfitPercentage: number;
    averageTimeRemaining: number;
}