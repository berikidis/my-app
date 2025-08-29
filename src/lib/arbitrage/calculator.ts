
import { ArbitrageOpportunity, ArbitrageStake, BookmakerOdds } from '@/types/arbitrage';

export class ArbitrageCalculator {
    static calculateArbitrage(
        matchId: string,
        homeTeam: string,
        awayTeam: string,
        competition: string,
        matchTime: Date,
        bookmakerOdds: BookmakerOdds[]
    ): ArbitrageOpportunity | null {

        if (bookmakerOdds.length < 2) return null;

        // Find best odds for each outcome
        const bestHome = this.findBestOdds(bookmakerOdds, 'home');
        const bestAway = this.findBestOdds(bookmakerOdds, 'away');
        const bestDraw = this.findBestOdds(bookmakerOdds, 'draw');

        // Calculate implied probabilities
        const homeImplied = 1 / bestHome.odds;
        const awayImplied = 1 / bestAway.odds;
        const drawImplied = bestDraw ? 1 / bestDraw.odds : 0;

        const totalImpliedProbability = homeImplied + awayImplied + drawImplied;

        // No arbitrage opportunity if total implied probability >= 1
        if (totalImpliedProbability >= 1) return null;

        // Calculate stakes for €1000 investment
        const totalInvestment = 1000;
        const stakes: ArbitrageStake[] = [];

        // Home stake
        const homeStake = (totalInvestment * homeImplied) / totalImpliedProbability;
        stakes.push({
            outcome: '1',
            outcomeName: `${homeTeam} Win`,
            bookmaker: bestHome.bookmaker,
            odds: bestHome.odds,
            stake: homeStake,
            profit: (homeStake * bestHome.odds) - totalInvestment,
            impliedProbability: homeImplied * 100
        });

        // Away stake
        const awayStake = (totalInvestment * awayImplied) / totalImpliedProbability;
        stakes.push({
            outcome: '2',
            outcomeName: `${awayTeam} Win`,
            bookmaker: bestAway.bookmaker,
            odds: bestAway.odds,
            stake: awayStake,
            profit: (awayStake * bestAway.odds) - totalInvestment,
            impliedProbability: awayImplied * 100
        });

        // Draw stake (if available)
        if (bestDraw) {
            const drawStake = (totalInvestment * drawImplied) / totalImpliedProbability;
            stakes.push({
                outcome: 'X',
                outcomeName: 'Draw',
                bookmaker: bestDraw.bookmaker,
                odds: bestDraw.odds,
                stake: drawStake,
                profit: (drawStake * bestDraw.odds) - totalInvestment,
                impliedProbability: drawImplied * 100
            });
        }

        const actualInvestment = stakes.reduce((sum, stake) => sum + stake.stake, 0);
        const guaranteedReturn = stakes[0].stake * stakes[0].odds; // Same for all outcomes
        const totalProfit = guaranteedReturn - actualInvestment;
        const profitPercentage = (totalProfit / actualInvestment) * 100;

        // Calculate confidence based on various factors
        const confidence = this.calculateConfidence(
            profitPercentage,
            bookmakerOdds,
            stakes.length
        );

        // Calculate time remaining
        const timeRemaining = Math.max(
            Math.floor((matchTime.getTime() - Date.now()) / (1000 * 60)),
            0
        );

        // Calculate risk level
        const riskLevel = this.calculateRiskLevel(profitPercentage, stakes.length, timeRemaining);

        const opportunity: ArbitrageOpportunity = {
            id: `${matchId}-${Date.now()}`,
            matchId,
            homeTeam,
            awayTeam,
            competition,
            matchTime,
            totalProfit,
            profitPercentage,
            impliedProbability: totalImpliedProbability,
            stakes,
            bestOdds: {
                home: { bookmaker: bestHome.bookmaker, odds: bestHome.odds },
                draw: bestDraw ? { bookmaker: bestDraw.bookmaker, odds: bestDraw.odds } : undefined,
                away: { bookmaker: bestAway.bookmaker, odds: bestAway.odds }
            },
            timeRemaining,
            confidence,
            minBankroll: Math.ceil(actualInvestment / 100) * 100, // Round up to nearest 100
            estimatedTime: stakes.length * 30, // 30 seconds per bet
            riskLevel,
            bookmakerCount: new Set(stakes.map(s => s.bookmaker)).size
        };

        return opportunity;
    }

    private static findBestOdds(
        bookmakerOdds: BookmakerOdds[],
        outcome: 'home' | 'away' | 'draw'
    ) {
        return bookmakerOdds.reduce((best, current) => {
            const currentOdds = current[outcome];
            const bestOdds = best[outcome];

            if (!currentOdds) return best;
            if (!bestOdds) return current;

            return currentOdds > bestOdds ? current : best;
        });
    }

    private static calculateConfidence(
        profitPercentage: number,
        bookmakerOdds: BookmakerOdds[],
        outcomeCount: number
    ): 'HIGH' | 'MEDIUM' | 'LOW' {

        // Calculate average odds age
        const avgOddsAge = bookmakerOdds.reduce((sum, odds) =>
            sum + (Date.now() - odds.lastUpdate.getTime()), 0) / bookmakerOdds.length;

        const oddsAgeMinutes = avgOddsAge / (1000 * 60);

        // High confidence: High profit, recent odds, multiple outcomes
        if (profitPercentage > 3 && oddsAgeMinutes < 5 && outcomeCount >= 3) {
            return 'HIGH';
        }

        // Medium confidence: Decent profit, reasonably recent odds
        if (profitPercentage > 1.5 && oddsAgeMinutes < 15) {
            return 'MEDIUM';
        }

        return 'LOW';
    }

    private static calculateRiskLevel(
        profitPercentage: number,
        outcomeCount: number,
        timeRemaining: number
    ): 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' {

        let riskScore = 0;

        // Profit margin risk
        if (profitPercentage < 1) riskScore += 3;
        else if (profitPercentage < 2) riskScore += 1;

        // Time risk
        if (timeRemaining < 30) riskScore += 3;
        else if (timeRemaining < 60) riskScore += 2;
        else if (timeRemaining < 120) riskScore += 1;

        // Complexity risk
        if (outcomeCount < 3) riskScore += 1;

        if (riskScore === 0) return 'VERY_LOW';
        if (riskScore <= 2) return 'LOW';
        if (riskScore <= 4) return 'MEDIUM';
        return 'HIGH';
    }
}