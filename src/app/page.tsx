// ===========================================
// MAIN PAGE - LIVE ARBITRAGE SYSTEM
// ===========================================

import { ArbitrageDashboard } from '@/components/arbitrage/ArbitrageDashboard';

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <ArbitrageDashboard />
        </main>
    );
}

export const metadata = {
    title: 'Live Arbitrage Finder - Guaranteed Profit Betting System',
    description: 'Professional arbitrage betting system with real-time bookmaker APIs, Kelly Criterion optimization, and guaranteed profits. Find risk-free betting opportunities with our advanced algorithm.',
    keywords: 'arbitrage betting, guaranteed profit, sports betting, Kelly Criterion, bookmaker odds, risk-free betting',
};