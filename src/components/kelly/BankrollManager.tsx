// ===========================================
// BANKROLL MANAGER - FINANCIAL TRACKING
// ===========================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    PieChart,
    TrendingUp,
    DollarSign,
    Shield,
    Target,
    AlertCircle,
    Plus,
    Minus
} from 'lucide-react';
import { BankrollTransaction } from '@/types/kelly';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BankrollManagerProps {
    initialBankroll: number;
    onBankrollChange: (newBankroll: number) => void;
}

export function BankrollManager({ initialBankroll, onBankrollChange }: BankrollManagerProps) {
    const [currentBankroll, setCurrentBankroll] = useState(initialBankroll);
    const [emergencyFund, setEmergencyFund] = useState(initialBankroll * 0.1);
    const [totalProfit, setTotalProfit] = useState(0);
    const [totalDeposits, setTotalDeposits] = useState(initialBankroll);
    const [transactions, setTransactions] = useState<BankrollTransaction[]>([
        {
            id: '1',
            type: 'DEPOSIT',
            amount: initialBankroll,
            description: 'Initial deposit',
            timestamp: new Date(),
            balance: initialBankroll
        }
    ]);

    const [newTransactionAmount, setNewTransactionAmount] = useState(100);
    const [newTransactionType, setNewTransactionType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');

    const availableBankroll = currentBankroll - emergencyFund;
    const roi = totalDeposits > 0 ? (totalProfit / totalDeposits) * 100 : 0;

    const addTransaction = () => {
        if (newTransactionAmount <= 0) return;
        if (newTransactionType === 'WITHDRAWAL' && newTransactionAmount > availableBankroll) return;

        const newBalance = newTransactionType === 'DEPOSIT'
            ? currentBankroll + newTransactionAmount
            : currentBankroll - newTransactionAmount;

        const transaction: BankrollTransaction = {
            id: Date.now().toString(),
            type: newTransactionType,
            amount: newTransactionAmount,
            description: newTransactionType === 'DEPOSIT' ? 'Manual deposit' : 'Manual withdrawal',
            timestamp: new Date(),
            balance: newBalance
        };

        setTransactions([transaction, ...transactions]);
        setCurrentBankroll(newBalance);

        if (newTransactionType === 'DEPOSIT') {
            setTotalDeposits(totalDeposits + newTransactionAmount);
        }

        setEmergencyFund(newBalance * 0.1); // Maintain 10% emergency fund
        onBankrollChange(newBalance);
        setNewTransactionAmount(100);
    };

    const recordArbitrageProfit = (profit: number, description: string) => {
        const newBalance = currentBankroll + profit;

        const transaction: BankrollTransaction = {
            id: Date.now().toString(),
            type: 'PROFIT',
            amount: profit,
            description,
            timestamp: new Date(),
            balance: newBalance
        };

        setTransactions([transaction, ...transactions]);
        setCurrentBankroll(newBalance);
        setTotalProfit(totalProfit + profit);
        setEmergencyFund(newBalance * 0.1);
        onBankrollChange(newBalance);
    };

    // Demo function to simulate arbitrage profit
    const simulateArbitrageProfit = () => {
        const profits = [15.50, 23.75, 31.25, 18.90, 27.35];
        const randomProfit = profits[Math.floor(Math.random() * profits.length)];
        recordArbitrageProfit(randomProfit, `Arbitrage profit - Demo trade`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Bankroll</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(currentBankroll)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(availableBankroll)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(totalProfit)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">ROI</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {formatPercentage(roi)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bankroll Allocation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <PieChart className="w-5 h-5 mr-2" />
                        Bankroll Allocation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Available for Betting</span>
                                <span>{formatCurrency(availableBankroll)} ({((availableBankroll / currentBankroll) * 100).toFixed(1)}%)</span>
                            </div>
                            <Progress value={(availableBankroll / currentBankroll) * 100} className="h-3 bg-green-100">
                                <div className="h-full bg-green-500 rounded-full transition-all" />
                            </Progress>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Emergency Fund</span>
                                <span>{formatCurrency(emergencyFund)} (10%)</span>
                            </div>
                            <Progress value={10} className="h-3 bg-red-100">
                                <div className="h-full bg-red-500 rounded-full transition-all" />
                            </Progress>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <strong>Emergency Fund:</strong> Always maintain 10% of your bankroll as emergency fund.
                            This protects against unexpected losses and ensures you can continue betting.
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Remove Funds */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage Bankroll</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Amount</label>
                            <input
                                type="number"
                                value={newTransactionAmount}
                                onChange={(e) => setNewTransactionAmount(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                step="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select
                                value={newTransactionType}
                                onChange={(e) => setNewTransactionType(e.target.value as 'DEPOSIT' | 'WITHDRAWAL')}
                                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="DEPOSIT">Deposit</option>
                                <option value="WITHDRAWAL">Withdrawal</option>
                            </select>
                        </div>

                        <div className="pt-6">
                            <Button onClick={addTransaction} className="flex items-center space-x-2">
                                {newTransactionType === 'DEPOSIT' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                <span>{newTransactionType === 'DEPOSIT' ? 'Add Funds' : 'Withdraw'}</span>
                            </Button>
                        </div>
                    </div>

                    {newTransactionType === 'WITHDRAWAL' && newTransactionAmount > availableBankroll && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <div className="text-sm text-red-800">
                                Insufficient funds. Available for withdrawal: {formatCurrency(availableBankroll)}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {transactions.map((transaction) => (
                            <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        transaction.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                                            transaction.type === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' :
                                                transaction.type === 'PROFIT' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-gray-100 text-gray-600'
                                    }`}>
                                        {transaction.type === 'DEPOSIT' ? <Plus className="w-4 h-4" /> :
                                            transaction.type === 'WITHDRAWAL' ? <Minus className="w-4 h-4" /> :
                                                transaction.type === 'PROFIT' ? <TrendingUp className="w-4 h-4" /> :
                                                    <AlertCircle className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{transaction.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {transaction.timestamp.toLocaleString('el-GR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${
                                        transaction.type === 'DEPOSIT' || transaction.type === 'PROFIT' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {transaction.type === 'DEPOSIT' || transaction.type === 'PROFIT' ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Balance: {formatCurrency(transaction.balance)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-800">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                                {transactions.filter(t => t.type === 'PROFIT').length}
                            </div>
                            <div className="text-blue-700">Profitable Trades</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                                {formatCurrency(totalProfit / Math.max(transactions.filter(t => t.type === 'PROFIT').length, 1))}
                            </div>
                            <div className="text-blue-700">Avg. Profit</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                                {totalProfit > 0 ? ((currentBankroll - initialBankroll + totalProfit) / initialBankroll * 100).toFixed(1) : '0.0'}%
                            </div>
                            <div className="text-blue-700">Growth Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                                {Math.max(0, Math.round((currentBankroll / 2000) * 30))} days
                            </div>
                            <div className="text-blue-700">Est. to Double</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}