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

        if (bookmakerOdds.length < 2) {
            console.log(`❌ Not enough bookmakers for ${homeTeam} vs ${awayTeam}: ${bookmakerOdds.length}`);
            return null;
        }

        // Find best odds for each outcome
        const bestHome = this.findBestOdds(bookmakerOdds, 'home');
        const bestAway = this.findBestOdds(bookmakerOdds, 'away');
        const bestDraw = this.findBestOdds(bookmakerOdds, 'draw');

        // Validate odds exist and are valid numbers
        if (!bestHome?.home || !bestAway?.away || bestHome.home <= 1 || bestAway.away <= 1) {
            console.log(`❌ Invalid odds for ${homeTeam} vs ${awayTeam}:`, {
                home: bestHome?.home,
                away: bestAway?.away,
                draw: bestDraw?.draw
            });
            return null;
        }

        // Calculate implied probabilities
        const homeImplied = 1 / bestHome.home;
        const awayImplied = 1 / bestAway.away;
        const drawImplied = bestDraw?.draw && bestDraw.draw > 1 ? 1 / bestDraw.draw : 0;

        // Validate implied probabilities
        if (!homeImplied || !awayImplied || homeImplied >= 1 || awayImplied >= 1) {
            console.log(`❌ Invalid implied probabilities for ${homeTeam} vs ${awayTeam}:`, {
                homeImplied,
                awayImplied,
                drawImplied
            });
            return null;
        }

        const totalImpliedProbability = homeImplied + awayImplied + drawImplied;

        console.log(`📊 ${homeTeam} vs ${awayTeam} odds analysis:`, {
            homeOdds: bestHome.home,
            awayOdds: bestAway.away,
            drawOdds: bestDraw?.draw,
            totalImplied: (totalImpliedProbability * 100).toFixed(2) + '%',
            arbitrageMargin: ((1 - totalImpliedProbability) * 100).toFixed(2) + '%'
        });

        // No arbitrage opportunity if total implied probability >= 1
        if (totalImpliedProbability >= 1) {
            console.log(`❌ No arbitrage for ${homeTeam} vs ${awayTeam}: Total implied = ${(totalImpliedProbability * 100).toFixed(2)}%`);
            return null;
        }

        // Calculate stakes for €1000 investment
        const totalInvestment = 1000;
        const stakes: ArbitrageStake[] = [];

        // Home stake
        const homeStake = (totalInvestment * homeImplied) / totalImpliedProbability;
        if (homeStake > 0 && isFinite(homeStake)) {
            stakes.push({
                outcome: '1',
                outcomeName: `${homeTeam} Win`,
                bookmaker: bestHome.bookmaker,
                odds: bestHome.home,
                stake: homeStake,
                profit: (homeStake * bestHome.home) - totalInvestment,
                impliedProbability: homeImplied * 100
            });
        }

        // Away stake
        const awayStake = (totalInvestment * awayImplied) / totalImpliedProbability;
        if (awayStake > 0 && isFinite(awayStake)) {
            stakes.push({
                outcome: '2',
                outcomeName: `${awayTeam} Win`,
                bookmaker: bestAway.bookmaker,
                odds: bestAway.away,
                stake: awayStake,
                profit: (awayStake * bestAway.away) - totalInvestment,
                impliedProbability: awayImplied * 100
            });
        }

        // Draw stake (if available)
        if (bestDraw?.draw && bestDraw.draw > 1 && drawImplied > 0) {
            const drawStake = (totalInvestment * drawImplied) / totalImpliedProbability;
            if (drawStake > 0 && isFinite(drawStake)) {
                stakes.push({
                    outcome: 'X',
                    outcomeName: 'Draw',
                    bookmaker: bestDraw.bookmaker,
                    odds: bestDraw.draw,
                    stake: drawStake,
                    profit: (drawStake * bestDraw.draw) - totalInvestment,
                    impliedProbability: drawImplied * 100
                });
            }
        }

        // Validate stakes
        if (stakes.length < 2) {
            console.log(`❌ Insufficient valid stakes for ${homeTeam} vs ${awayTeam}`);
            return null;
        }

        const actualInvestment = stakes.reduce((sum, stake) => sum + stake.stake, 0);
        const guaranteedReturn = stakes[0].stake * stakes[0].odds; // Same for all outcomes
        const totalProfit = guaranteedReturn - actualInvestment;
        const profitPercentage = (totalProfit / actualInvestment) * 100;

        // Validate final calculations
        if (!isFinite(profitPercentage) || profitPercentage <= 0) {
            console.log(`❌ Invalid profit calculation for ${homeTeam} vs ${awayTeam}:`, {
                actualInvestment,
                guaranteedReturn,
                totalProfit,
                profitPercentage
            });
            return null;
        }

        console.log(`✅ Valid arbitrage for ${homeTeam} vs ${awayTeam}: ${profitPercentage.toFixed(2)}% profit`);

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
                home: { bookmaker: bestHome.bookmaker, odds: bestHome.home },
                draw: bestDraw?.draw ? { bookmaker: bestDraw.bookmaker, odds: bestDraw.draw } : undefined,
                away: { bookmaker: bestAway.bookmaker, odds: bestAway.away }
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
    ): BookmakerOdds | null {
        let best: BookmakerOdds | null = null;

        for (const current of bookmakerOdds) {
            const currentOdds = current[outcome];
            if (!currentOdds || currentOdds <= 1 || !isFinite(currentOdds)) continue;

            if (!best || !best[outcome] || currentOdds > best[outcome]!) {
                best = current;
            }
        }

        return best;
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