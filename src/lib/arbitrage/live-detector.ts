// ===========================================
// LIVE ARBITRAGE DETECTOR - LIVE MODE ONLY
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
        // Debug environment variable loading
        console.log('🔧 Environment check:', {
            hasApiKey: !!process.env.NEXT_PUBLIC_ODDS_API_KEY,
            keyLength: process.env.NEXT_PUBLIC_ODDS_API_KEY?.length || 0,
            keyPreview: process.env.NEXT_PUBLIC_ODDS_API_KEY?.substring(0, 8) + '...'
        });

        // Initialize API service - required for live data
        if (process.env.NEXT_PUBLIC_ODDS_API_KEY) {
            this.oddsAPIService = new TheOddsAPIService(process.env.NEXT_PUBLIC_ODDS_API_KEY);
            console.log('✅ Live API service initialized');
        } else {
            console.warn('❌ No NEXT_PUBLIC_ODDS_API_KEY found - API key required for live arbitrage data');
            console.warn('💡 Make sure to add NEXT_PUBLIC_ODDS_API_KEY=your_key to .env.local and restart the server');
        }
    }

    async scanForOpportunities(sport: string = 'soccer_epl'): Promise<ArbitrageOpportunity[]> {
        try {
            console.log('🔍 Scanning for live arbitrage opportunities...');
            console.log('🔧 API Key status:', {
                exists: !!process.env.NEXT_PUBLIC_ODDS_API_KEY,
                serviceInitialized: !!this.oddsAPIService,
                keyPreview: process.env.NEXT_PUBLIC_ODDS_API_KEY?.substring(0, 8) + '...'
            });

            if (!this.oddsAPIService || !process.env.NEXT_PUBLIC_ODDS_API_KEY) {
                console.log('❌ No API key configured - real data unavailable');
                console.log('💡 Current env vars:', Object.keys(process.env).filter(key => key.includes('ODDS')));
                return [];
            }

            // Use live API data only
            console.log('📡 Using live bookmaker APIs');
            const combinedOdds = await this.getLiveOddsData(sport);

            const opportunities: ArbitrageOpportunity[] = [];

            // Calculate arbitrage for each match
            for (const [matchKey, bookmakerOdds] of combinedOdds.entries()) {
                if (bookmakerOdds.length < 2) continue; // Need at least 2 bookmakers

                const [homeTeam, awayTeam] = matchKey.split('_vs_').map(team => team.replace(/_/g, ' '));

                console.log(`🔍 Analyzing ${homeTeam} vs ${awayTeam} with ${bookmakerOdds.length} bookmakers`);

                const arbitrage = ArbitrageCalculator.calculateArbitrage(
                    matchKey,
                    homeTeam,
                    awayTeam,
                    'Live Match',
                    new Date(Date.now() + 2 * 60 * 60 * 1000),
                    bookmakerOdds.filter(odds => odds.home && odds.away)
                );

                if (arbitrage) {
                    console.log(`💰 Arbitrage found: ${arbitrage.profitPercentage.toFixed(2)}% profit`);
                    if (arbitrage.profitPercentage > 0.5) { // Minimum 0.5% profit
                        opportunities.push(arbitrage);
                    }
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
            throw error; // Re-throw to be handled by caller
        }
    }

    private generateEnhancedMockData(): Map<string, any[]> {
        console.log('🔧 Generating enhanced simulation data...');

        // Enhanced simulation data that creates realistic arbitrage scenarios
        const liveMatches = [
            {
                key: 'Manchester_City_vs_Arsenal',
                home: 'Manchester City',
                away: 'Arsenal',
                competition: 'Premier League',
                time: new Date(Date.now() + 2 * 60 * 60 * 1000)
            },
            {
                key: 'Real_Madrid_vs_Barcelona',
                home: 'Real Madrid',
                away: 'Barcelona',
                competition: 'La Liga',
                time: new Date(Date.now() + 4 * 60 * 60 * 1000)
            },
            {
                key: 'Bayern_Munich_vs_Borussia_Dortmund',
                home: 'Bayern Munich',
                away: 'Borussia Dortmund',
                competition: 'Bundesliga',
                time: new Date(Date.now() + 6 * 60 * 60 * 1000)
            },
            {
                key: 'Liverpool_vs_Manchester_United',
                home: 'Liverpool',
                away: 'Manchester United',
                competition: 'Premier League',
                time: new Date(Date.now() + 3 * 60 * 60 * 1000)
            },
            {
                key: 'Chelsea_vs_Tottenham',
                home: 'Chelsea',
                away: 'Tottenham',
                competition: 'Premier League',
                time: new Date(Date.now() + 5 * 60 * 60 * 1000)
            },
            {
                key: 'PSG_vs_Olympique_Marseille',
                home: 'PSG',
                away: 'Olympique Marseille',
                competition: 'Ligue 1',
                time: new Date(Date.now() + 7 * 60 * 60 * 1000)
            }
        ];

        const bookmakerNames = ['Bet365', 'Pinnacle', 'Betfair', 'William Hill', 'Ladbrokes', 'Coral', 'Betway', 'Unibet'];
        const simulatedOddsMap = new Map<string, any[]>();

        liveMatches.forEach(match => {
            const odds: any[] = [];
            console.log(`🏟️ Creating odds for ${match.home} vs ${match.away}`);

            bookmakerNames.forEach((bookmaker, index) => {
                // Generate realistic odds with strategic arbitrage opportunities
                let homeOdds, awayOdds, drawOdds;

                // Create clear arbitrage by having each bookmaker favor different outcomes
                switch (index % 3) {
                    case 0: // Home favorite bookmaker
                        homeOdds = 1.8 + Math.random() * 0.4; // 1.8-2.2
                        awayOdds = 3.2 + Math.random() * 1.0; // 3.2-4.2
                        drawOdds = 3.8 + Math.random() * 0.8; // 3.8-4.6
                        break;
                    case 1: // Away favorite bookmaker
                        homeOdds = 3.0 + Math.random() * 1.0; // 3.0-4.0
                        awayOdds = 1.9 + Math.random() * 0.4; // 1.9-2.3
                        drawOdds = 3.6 + Math.random() * 0.8; // 3.6-4.4
                        break;
                    default: // Draw favorite bookmaker
                        homeOdds = 2.8 + Math.random() * 0.8; // 2.8-3.6
                        awayOdds = 2.9 + Math.random() * 0.8; // 2.9-3.7
                        drawOdds = 3.0 + Math.random() * 0.4; // 3.0-3.4
                        break;
                }

                // Ensure strong arbitrage opportunity
                const totalImplied = (1/homeOdds) + (1/awayOdds) + (1/drawOdds);
                const targetImplied = 0.88 + (Math.random() * 0.05); // 88-93% (7-12% profit margin)
                const adjustmentFactor = targetImplied / totalImplied;

                odds.push({
                    bookmaker,
                    home: parseFloat(homeOdds.toFixed(2)),
                    draw: parseFloat(drawOdds.toFixed(2)),
                    away: parseFloat(awayOdds.toFixed(2)),
                    lastUpdate: new Date(Date.now() - Math.random() * 180000), // Up to 3 minutes ago
                    market: 'h2h'
                });
            });

            simulatedOddsMap.set(match.key, odds);
        });

        return simulatedOddsMap;
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

        if (this.oddsAPIService && process.env.NEXT_PUBLIC_ODDS_API_KEY) {
            enabledAPIs.push({
                name: 'The Odds API',
                status: 'ACTIVE'
            });

            rateLimits['the-odds-api'] = this.oddsAPIService.getRateLimitStatus();
        } else {
            enabledAPIs.push({
                name: 'No API Key',
                status: 'INACTIVE'
            });
        }

        return {
            enabledAPIs,
            rateLimits,
            isRunning: this.isRunning,
            updateInterval: this.updateInterval / 1000 / 60, // in minutes
            hasLiveAccess: !!this.oddsAPIService && !!process.env.NEXT_PUBLIC_ODDS_API_KEY
        };
    }

    // Check if live data is available
    hasLiveDataAccess(): boolean {
        return !!this.oddsAPIService && !!process.env.NEXT_PUBLIC_ODDS_API_KEY;
    }

    // Get current rate limit status
    getCurrentRateLimits() {
        if (this.oddsAPIService && process.env.NEXT_PUBLIC_ODDS_API_KEY) {
            return {
                'the-odds-api': this.oddsAPIService.getRateLimitStatus()
            };
        }
        return {};
    }
}
