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
    title: 'Live Arbitrage Finder - Real-Time Guaranteed Profit Betting',
    description: 'Professional live arbitrage betting system with real-time bookmaker APIs, Kelly Criterion optimization, and guaranteed profits. Find risk-free betting opportunities with live market data.',
    keywords: 'live arbitrage betting, real-time odds, guaranteed profit, sports betting, Kelly Criterion, bookmaker APIs, risk-free betting, live market data',
};