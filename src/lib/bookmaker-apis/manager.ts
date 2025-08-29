// ===========================================
// BOOKMAKER API MANAGER - MULTI-API COORDINATOR
// ===========================================

import { TheOddsAPIService } from './the-odds-api';
import { LiveOddsResponse, BookmakerAPI } from '@/types/bookmaker-apis';

export class BookmakerAPIManager {
    private theOddsAPI?: TheOddsAPIService;
    private enabledAPIs: BookmakerAPI[] = [];

    constructor() {
        // Initialize APIs with environment variables
        if (process.env.NEXT_PUBLIC_ODDS_API_KEY) {
            this.theOddsAPI = new TheOddsAPIService(process.env.NEXT_PUBLIC_ODDS_API_KEY);
            this.enabledAPIs.push({
                name: 'The Odds API',
                baseUrl: 'https://api.the-odds-api.com',
                apiKey: process.env.NEXT_PUBLIC_ODDS_API_KEY,
                rateLimit: 500,
                regions: ['uk', 'eu', 'us'],
                markets: ['h2h', 'spreads', 'totals'],
                status: 'ACTIVE'
            });
        }
    }

    async getAllLiveOdds(sport: string = 'soccer_epl'): Promise<LiveOddsResponse[]> {
        const promises: Promise<LiveOddsResponse>[] = [];

        if (this.theOddsAPI) {
            promises.push(this.theOddsAPI.getLiveOdds(sport));
        }

        try {
            const results = await Promise.allSettled(promises);

            return results
                .filter((result): result is PromiseFulfilledResult<LiveOddsResponse> =>
                    result.status === 'fulfilled'
                )
                .map(result => result.value)
                .filter(response => response.success);

        } catch (error) {
            console.error('Error fetching from multiple APIs:', error);
            return [];
        }
    }

    async getCombinedOdds(sport: string = 'soccer_epl'): Promise<Map<string, any[]>> {
        const allResponses = await this.getAllLiveOdds(sport);
        const combinedOdds = new Map<string, any[]>();

        allResponses.forEach(response => {
            response.data.forEach(match => {
                const matchKey = `${match.homeTeam}_vs_${match.awayTeam}`;

                if (!combinedOdds.has(matchKey)) {
                    combinedOdds.set(matchKey, []);
                }

                // Add bookmaker odds to the match
                match.bookmakers.forEach(bookmaker => {
                    const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
                    if (h2hMarket) {
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
                            combinedOdds.get(matchKey)?.push({
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
        });

        return combinedOdds;
    }

    getEnabledAPIs(): BookmakerAPI[] {
        return this.enabledAPIs;
    }

    getRateLimitStatus() {
        const status: any = {};

        if (this.theOddsAPI) {
            status['the-odds-api'] = this.theOddsAPI.getRateLimitStatus();
        }

        return status;
    }

    // Check if any live APIs are available
    hasLiveAccess(): boolean {
        return this.enabledAPIs.some(api => api.status === 'ACTIVE');
    }

    // Get status of all APIs
    getSystemStatus() {
        return {
            totalAPIs: this.enabledAPIs.length,
            activeAPIs: this.enabledAPIs.filter(api => api.status === 'ACTIVE').length,
            rateLimits: this.getRateLimitStatus(),
            hasLiveAccess: this.hasLiveAccess()
        };
    }
}