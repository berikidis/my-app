// ===========================================
// KELLY CRITERION CALCULATOR
// ===========================================

import { KellyCalculation, BankrollSettings } from '@/types/kelly';

export class KellyCriterionCalculator {

    /**
     * Calculate Kelly Criterion for arbitrage betting
     * Kelly = (bp - q) / b
     * where: b = odds-1, p = probability of winning, q = probability of losing
     */
    static calculateKellyStake(
        trueOdds: number,
        bookmakerOdds: number,
        bankroll: number,
        settings: BankrollSettings
    ): KellyCalculation {

        // Convert odds to probability
        const trueProbability = 1 / trueOdds;
        const impliedProbability = 1 / bookmakerOdds;

        // Kelly formula variables
        const b = bookmakerOdds - 1; // Net odds
        const p = trueProbability; // Probability of winning
        const q = 1 - p; // Probability of losing

        // Calculate Kelly percentage
        const kellyPercentage = (b * p - q) / b;

        // Apply safety constraints
        const maxRisk = settings.maxRiskPerBet / 100;
        const safeKelly = Math.min(kellyPercentage, maxRisk);

        // Calculate optimal stake
        const availableBankroll = bankroll * (1 - settings.emergencyFund / 100);
        const optimalStake = availableBankroll * Math.max(safeKelly, 0);

        // Expected value calculation
        const expectedValue = (p * (bookmakerOdds - 1) - q) * optimalStake;

        // Risk assessment
        const riskLevel = this.assessRiskLevel(kellyPercentage, settings.riskTolerance);

        // Generate recommendation
        const recommendation = this.generateRecommendation(
            kellyPercentage,
            expectedValue,
            riskLevel,
            settings
        );

        // Calculate potential outcomes
        const maxDrawdown = this.calculateMaxDrawdown(kellyPercentage, settings);
        const timeToDouble = this.calculateTimeToDouble(kellyPercentage, expectedValue, bankroll);

        return {
            optimalStake: Math.round(optimalStake * 100) / 100,
            kellyPercentage: Math.round(kellyPercentage * 10000) / 100,
            expectedValue: Math.round(expectedValue * 100) / 100,
            riskLevel,
            recommendation,
            maxDrawdown,
            timeToDouble
        };
    }

    /**
     * Calculate Kelly for arbitrage opportunities (guaranteed profit)
     */
    static calculateArbitrageKelly(
        stakes: Array<{ stake: number; odds: number; outcome: string }>,
        totalInvestment: number,
        guaranteedProfit: number,
        bankroll: number,
        settings: BankrollSettings
    ): KellyCalculation {

        // For arbitrage, probability of profit is 100%
        const profitPercentage = guaranteedProfit / totalInvestment;

        // Modified Kelly for guaranteed profit scenarios
        const kellyPercentage = Math.min(profitPercentage * 2, settings.maxRiskPerBet / 100);

        // Calculate optimal scale factor for the entire arbitrage
        const availableBankroll = bankroll * (1 - settings.emergencyFund / 100);
        const maxInvestment = availableBankroll * kellyPercentage;

        const scaleFactor = maxInvestment / totalInvestment;
        const optimalStake = totalInvestment * scaleFactor;

        // Guaranteed expected value
        const expectedValue = guaranteedProfit * scaleFactor;

        const riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' = 'CONSERVATIVE'; // Arbitrage is always low risk

        const recommendation = `Invest ${(kellyPercentage * 100).toFixed(1)}% of bankroll (€${optimalStake.toFixed(2)}) for guaranteed €${expectedValue.toFixed(2)} profit`;

        return {
            optimalStake: Math.round(optimalStake * 100) / 100,
            kellyPercentage: Math.round(kellyPercentage * 10000) / 100,
            expectedValue: Math.round(expectedValue * 100) / 100,
            riskLevel,
            recommendation,
            maxDrawdown: 0, // No drawdown risk in arbitrage
            timeToDouble: this.calculateTimeToDouble(kellyPercentage, expectedValue, bankroll)
        };
    }

    private static assessRiskLevel(
        kellyPercentage: number,
        riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH'
    ): 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' {

        const thresholds = {
            'LOW': { conservative: 0.02, moderate: 0.05 },
            'MEDIUM': { conservative: 0.05, moderate: 0.10 },
            'HIGH': { conservative: 0.10, moderate: 0.20 }
        };

        const { conservative, moderate } = thresholds[riskTolerance];

        if (kellyPercentage <= conservative) return 'CONSERVATIVE';
        if (kellyPercentage <= moderate) return 'MODERATE';
        return 'AGGRESSIVE';
    }

    private static generateRecommendation(
        kellyPercentage: number,
        expectedValue: number,
        riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE',
        settings: BankrollSettings
    ): string {

        if (kellyPercentage <= 0) {
            return "❌ Not profitable - avoid this bet";
        }

        if (kellyPercentage < 0.01) {
            return "⚠️ Very small edge - consider skipping";
        }

        if (expectedValue < 5) {
            return "💡 Small profit expected - good for practice";
        }

        const riskMessages = {
            'CONSERVATIVE': "✅ Low risk - excellent opportunity",
            'MODERATE': "⚖️ Moderate risk - good value bet",
            'AGGRESSIVE': "⚠️ High risk - bet carefully"
        };

        return riskMessages[riskLevel];
    }

    private static calculateMaxDrawdown(
        kellyPercentage: number,
        settings: BankrollSettings
    ): number {
        // Simplified drawdown calculation
        // For arbitrage, this would be minimal
        return Math.round(kellyPercentage * 100 * 2); // Rough estimate
    }

    private static calculateTimeToDouble(
        kellyPercentage: number,
        expectedValue: number,
        bankroll: number
    ): number {
        if (expectedValue <= 0) return Infinity;

        // Compound growth calculation
        const monthlyReturn = (expectedValue / bankroll) * 30; // Assuming 30 bets per month
        const monthsToDouble = Math.log(2) / Math.log(1 + monthlyReturn);

        return Math.round(monthsToDouble * 10) / 10;
    }
}