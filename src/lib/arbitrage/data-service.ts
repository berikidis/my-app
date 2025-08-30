// ===========================================
// ARBITRAGE DATA SERVICE - LIVE DATA PROVIDER
// ===========================================

import axios from 'axios';
import { BookmakerOdds } from '@/types/arbitrage';

export class ArbitrageDataService {
    private static readonly ODDS_API_KEY = process.env.NEXT_PUBLIC_ODDS_API_KEY;
    private static readonly BASE_URL = 'https://api.the-odds-api.com/v4';

    private static readonly BOOKMAKERS = [
        'bet365', 'pinnacle', 'betfair', 'williamhill',
        'ladbrokes', 'coral', 'betway', 'unibet',
        'betvictor', 'paddypower', 'skybet', 'betfred'
    ];

    static async fetchAllOdds(sport: string = 'soccer_epl'): Promise<any[]> {
        try {
            const response = await axios.get(`${this.BASE_URL}/sports/${sport}/odds`, {
                params: {
                    apiKey: this.ODDS_API_KEY,
                    regions: 'uk,eu,us',
                    markets: 'h2h',
                    oddsFormat: 'decimal',
                    dateFormat: 'iso',
                    bookmakers: this.BOOKMAKERS.join(',')
                }
            });

            return response.data || [];
        } catch (error) {
            console.error('Error fetching odds data:', error);
            return [];
        }
    }

    static async fetchLiveOdds(): Promise<Map<string, BookmakerOdds[]>> {
        const oddsData = await this.fetchAllOdds();
        const matchOddsMap = new Map<string, BookmakerOdds[]>();

        oddsData.forEach(match => {
            const matchKey = `${match.home_team}_vs_${match.away_team}`;

            if (!matchOddsMap.has(matchKey)) {
                matchOddsMap.set(matchKey, []);
            }

            match.bookmakers?.forEach((bookmaker: any) => {
                const h2hMarket = bookmaker.markets?.find((m: any) => m.key === 'h2h');
                if (h2hMarket) {
                    const homeOdds = h2hMarket.outcomes.find((o: any) => o.name === match.home_team);
                    const awayOdds = h2hMarket.outcomes.find((o: any) => o.name === match.away_team);
                    const drawOdds = h2hMarket.outcomes.find((o: any) => o.name === 'Draw');

                    if (homeOdds && awayOdds) {
                        const odds: BookmakerOdds = {
                            bookmaker: bookmaker.title,
                            home: homeOdds.price,
                            draw: drawOdds?.price,
                            away: awayOdds.price,
                            lastUpdate: new Date(bookmaker.last_update),
                            market: 'h2h'
                        };
                        matchOddsMap.get(matchKey)!.push(odds);
                    }
                }
            });
        });

        return matchOddsMap;
    }

    // Removed simulation methods - only real API data supported
}