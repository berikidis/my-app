// ===========================================
// LIVE ARBITRAGE DETECTOR - OPPORTUNITY FINDER
// ===========================================

import { ArbitrageCalculator } from './calculator';
import { ArbitrageDataService } from './data-service';
import { TheOddsAPIService } from '../bookmaker-apis/the-odds-api';
import { ArbitrageOpportunity } from '@/types/arbitrage';

export class LiveArbitrageDetector {
    private oddsAPIService?: TheOddsAPIService;
    private updateInterval: number = 60000; // 1 minute
    private isRunning: boolean = false;
    private intervalId?: NodeJS.Timeout;

    constructor() {
        // Initialize API service if API key is available
        if (process.env.NEXT_PUBLIC_ODDS_API_KEY) {
            this.oddsAPIService = new TheOddsAPIService(process.env.NEXT_PUBLIC_ODDS_API_KEY);
        }
    }

    async scanForOpportunities(sport: string = 'soccer_epl'): Promise<ArbitrageOpportunity[]> {
        try {
            console.log('🔍 Scanning for arbitrage opportunities...');

            let combinedOdds: Map<string, any[]>;

            if (this.oddsAPIService) {
                // Use live API data
                combinedOdds = await this.getLiveOddsData(sport);
            } else {
                // Fallback to historical data for practice
                console.warn('No API key found, using historical data for practice');
                combinedOdds = ArbitrageDataService.generateHistoricalData();
            }

            const opportunities: ArbitrageOpportunity[] = [];

            // Calculate arbitrage for each match
            for (const [matchKey, bookmakerOdds] of combinedOdds.entries()) {
                if (bookmakerOdds.length < 2) continue; // Need at least 2 bookmakers

                const [homeTeam, awayTeam] = matchKey.split('_vs_').map(team => team.replace(/_/g, ' '));

                const arbitrage = ArbitrageCalculator.calculateArbitrage(
                    matchKey,
                    homeTeam,
                    awayTeam,
                    'Live Match',
                    new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now (estimated)
                    bookmakerOdds.filter(odds => odds.home && odds.away) // Filter valid odds
                );

                if (arbitrage && arbitrage.profitPercentage > 0.5) { // Minimum 0.5% profit
                    opportunities.push(arbitrage);
                }
            }

            console.log(`✅ Found ${opportunities.length} arbitrage opportunities`);

            return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);

        } catch (error) {
            console.error('❌ Error scanning for opportunities:', error);
            return [];
        }
    }

    private async getLiveOddsData(sport: string): Promise<Map<string, any[]>> {
        try {
            if (!this.oddsAPIService) {
                throw new Error('Odds API service not initialized');
            }

            const liveOddsResponse = await this.oddsAPIService.getLiveOdds(sport);

            if (!liveOddsResponse.success) {
                throw new Error('Failed to fetch live odds');
            }

            const matchOddsMap = new Map<string, any[]>();

            liveOddsResponse.data.forEach(match => {
                const matchKey = `${match.homeTeam}_vs_${match.awayTeam}`;

                if (!matchOddsMap.has(matchKey)) {
                    matchOddsMap.set(matchKey, []);
                }

                // Process bookmaker odds
                match.bookmakers.forEach(bookmaker => {
                    const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
                    if (h2hMarket && h2hMarket.outcomes.length >= 2) {
                        const homeOutcome = h2hMarket.outcomes.find(o =>
                            o.name === match.homeTeam || o.name.toLowerCase().includes('home')
                        );
                        const awayOutcome = h2hMarket.outcomes.find(o =>
                            o.name === match.awayTeam || o.name.toLowerCase().includes('away')
                        );
                        const drawOutcome = h2hMarket.outcomes.find(o =>
                            o.name.toLowerCase() === 'draw'
                        );

                        if (homeOutcome && awayOutcome) {
                            matchOddsMap.get(matchKey)!.push({
                                bookmaker: bookmaker.name,
                                home: homeOutcome.price,
                                draw: drawOutcome?.price,
                                away: awayOutcome.price,
                                lastUpdate: new Date(bookmaker.lastUpdate),
                                market: 'h2h'
                            });
                        }
                    }
                });
            });

            return matchOddsMap;
        } catch (error) {
            console.error('Error fetching live odds data:', error);
            // Fallback to historical data
            return ArbitrageDataService.generateHistoricalData();
        }
    }

    startLiveMonitoring(
        onOpportunityFound: (opportunities: ArbitrageOpportunity[]) => void,
        sport: string = 'soccer_epl'
    ) {
        if (this.isRunning) {
            console.log('⚠️ Live monitoring is already running');
            return;
        }

        console.log('🚀 Starting live arbitrage monitoring...');
        this.isRunning = true;

        // Initial scan
        this.scanForOpportunities(sport).then(onOpportunityFound);

        // Set up interval scanning
        this.intervalId = setInterval(async () => {
            if (!this.isRunning) return;

            const opportunities = await this.scanForOpportunities(sport);
            onOpportunityFound(opportunities);
        }, this.updateInterval);
    }

    stopLiveMonitoring() {
        console.log('⏹️ Stopping live arbitrage monitoring...');
        this.isRunning = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }

    setUpdateInterval(minutes: number) {
        this.updateInterval = minutes * 60 * 1000;

        if (this.isRunning) {
            this.stopLiveMonitoring();
            // Will need to restart with new interval
        }
    }

    getApiStatus() {
        const enabledAPIs = [];
        const rateLimits: any = {};

        if (this.oddsAPIService) {
            enabledAPIs.push({
                name: 'The Odds API',
                status: 'ACTIVE'
            });

            rateLimits['the-odds-api'] = this.oddsAPIService.getRateLimitStatus();
        } else {
            enabledAPIs.push({
                name: 'Historical Data',
                status: 'ACTIVE'
            });
        }

        return {
            enabledAPIs,
            rateLimits,
            isRunning: this.isRunning,
            updateInterval: this.updateInterval / 1000 / 60 // in minutes
        };
    }

    // Check if live data is available
    hasLiveDataAccess(): boolean {
        return !!this.oddsAPIService && !!process.env.NEXT_PUBLIC_ODDS_API_KEY;
    }

    // Get current rate limit status
    getCurrentRateLimits() {
        if (this.oddsAPIService) {
            return {
                'the-odds-api': this.oddsAPIService.getRateLimitStatus()
            };
        }
        return {};
    }
}