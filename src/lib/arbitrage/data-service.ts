// ===========================================
// ARBITRAGE DATA SERVICE - DATA PROVIDER
// ===========================================

import axios from 'axios';
import { BookmakerOdds } from '@/types/arbitrage';

export class ArbitrageDataService {
    private static readonly ODDS_API_KEY = process.env.NEXT_PUBLIC_ODDS_API_KEY;
    private static readonly BASE_URL = 'https://api.the-odds-api.com/v4';

    private static readonly BOOKMAKERS = [
        'bet365', 'pinnacle', 'betfair', 'williamhill',
        'ladbrokes', 'coral', 'betway', 'unibet',
        'betvictor', 'paddypower'
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

    static generateHistoricalData(): Map<string, BookmakerOdds[]> {
        // Historical data patterns for practice mode
        const historicalMatches = [
            {
                key: 'Manchester_City_vs_Arsenal',
                home: 'Manchester City',
                away: 'Arsenal',
                competition: 'Premier League',
                time: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
            },
            {
                key: 'Real_Madrid_vs_Barcelona',
                home: 'Real Madrid',
                away: 'Barcelona',
                competition: 'La Liga',
                time: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now
            },
            {
                key: 'Bayern_Munich_vs_Borussia_Dortmund',
                home: 'Bayern Munich',
                away: 'Borussia Dortmund',
                competition: 'Bundesliga',
                time: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours from now
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
            }
        ];

        const bookmakerNames = ['Bet365', 'Pinnacle', 'Betfair', 'William Hill', 'Ladbrokes', 'Coral', 'Betway'];
        const historicalOddsMap = new Map<string, BookmakerOdds[]>();

        historicalMatches.forEach(match => {
            const odds: BookmakerOdds[] = [];

            bookmakerNames.forEach(bookmaker => {
                // Generate realistic odds with slight variations to create arbitrage opportunities
                const baseHomeOdds = 1.8 + (Math.random() * 2.4); // 1.8 - 4.2
                const baseAwayOdds = 2.0 + (Math.random() * 2.8); // 2.0 - 4.8
                const baseDrawOdds = 3.0 + (Math.random() * 1.5); // 3.0 - 4.5

                // Introduce systematic arbitrage opportunities
                let homeOdds = baseHomeOdds;
                let awayOdds = baseAwayOdds;
                let drawOdds = baseDrawOdds;

                // Create arbitrage opportunities by having different bookmakers favor different outcomes
                if (bookmaker === 'Pinnacle') {
                    homeOdds += 0.15; // Pinnacle typically has better home odds
                } else if (bookmaker === 'Betfair') {
                    awayOdds += 0.2; // Betfair has better away odds
                } else if (bookmaker === 'Bet365') {
                    drawOdds += 0.25; // Bet365 has better draw odds
                }

                // Ensure we don't create impossible odds combinations
                const totalImplied = (1/homeOdds) + (1/awayOdds) + (1/drawOdds);
                if (totalImplied >= 0.99) { // Create arbitrage opportunity
                    const adjustment = 0.98 / totalImplied;
                    homeOdds /= adjustment;
                    awayOdds /= adjustment;
                    drawOdds /= adjustment;
                }

                odds.push({
                    bookmaker,
                    home: parseFloat(homeOdds.toFixed(2)),
                    draw: parseFloat(drawOdds.toFixed(2)),
                    away: parseFloat(awayOdds.toFixed(2)),
                    lastUpdate: new Date(Date.now() - Math.random() * 300000), // Up to 5 minutes ago
                    market: 'h2h'
                });
            });

            historicalOddsMap.set(match.key, odds);
        });

        return historicalOddsMap;
    }
}