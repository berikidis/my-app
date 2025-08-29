// ===========================================
// KELLY CRITERION - TYPE DEFINITIONS
// ===========================================

export interface KellyCalculation {
    optimalStake: number;
    kellyPercentage: number;
    expectedValue: number;
    riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    recommendation: string;
    maxDrawdown: number;
    timeToDouble: number; // months
}

export interface BankrollSettings {
    totalBankroll: number;
    maxRiskPerBet: number; // percentage (1-10%)
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
    reinvestProfits: boolean;
    emergencyFund: number; // percentage to keep aside
}

export interface BankrollTransaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'PROFIT' | 'LOSS';
    amount: number;
    description: string;
    timestamp: Date;
    balance: number;
}