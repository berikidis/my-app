// ===========================================
// THE ODDS API SERVICE
// ===========================================

import axios, { AxiosInstance } from 'axios';
import { LiveOddsResponse, LiveMatch } from '@/types/bookmaker-apis';

export class TheOddsAPIService {
    private apiKey: string;
    private baseUrl: string = 'https://api.the-odds-api.com/v4';
    private axiosInstance: AxiosInstance;
    private rateLimitRemaining: number = 500;
    private rateLimitReset: Date = new Date();

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add response interceptor to track rate limits
        this.axiosInstance.interceptors.response.use(
            (response) => {
                this.rateLimitRemaining = parseInt(response.headers['x-requests-remaining'] || '500');
                this.rateLimitReset = new Date(response.headers['x-requests-reset'] || Date.now());
                return response;
            },
            (error) => {
                console.error('Odds API Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    async getSports(): Promise<any[]> {
        try {
            const response = await this.axiosInstance.get('/sports', {
                params: {
                    apiKey: this.apiKey
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching sports:', error);
            return [];
        }
    }

    async getLiveOdds(sport: string = 'soccer_epl'): Promise<LiveOddsResponse> {
        try {
            if (this.rateLimitRemaining <= 5) {
                throw new Error(`Rate limit almost exceeded. Remaining: ${this.rateLimitRemaining}`);
            }

            const response = await this.axiosInstance.get(`/sports/${sport}/odds`, {
                params: {
                    apiKey: this.apiKey,
                    regions: 'uk,eu,us',
                    markets: 'h2h',
                    oddsFormat: 'decimal',
                    dateFormat: 'iso',
                    bookmakers: [
                        'bet365',
                        'pinnacle',
                        'betfair',
                        'williamhill',
                        'ladbrokes',
                        'coral',
                        'betway',
                        'unibet',
                        'betvictor',
                        'paddypower',
                        'skybet',
                        'betfred'
                    ].join(',')
                }
            });

            const liveMatches: LiveMatch[] = response.data.map((match: any) => ({
                id: match.id,
                sport: match.sport_title,
                league: match.sport_title,
                homeTeam: match.home_team,
                awayTeam: match.away_team,
                startTime: match.commence_time,
                status: this.getMatchStatus(new Date(match.commence_time)),
                bookmakers: match.bookmakers?.map((bookmaker: any) => ({
                    name: bookmaker.title,
                    lastUpdate: bookmaker.last_update,
                    markets: bookmaker.markets?.map((market: any) => ({
                        key: market.key,
                        outcomes: market.outcomes?.map((outcome: any) => ({
                            name: outcome.name,
                            price: outcome.price,
                            lastChanged: bookmaker.last_update
                        })) || []
                    })) || []
                })) || []
            }));

            return {
                success: true,
                data: liveMatches,
                timestamp: new Date().toISOString(),
                source: 'the-odds-api',
                rateLimit: {
                    remaining: this.rateLimitRemaining,
                    resetTime: this.rateLimitReset.toISOString()
                }
            };

        } catch (error: any) {
            console.error('Error fetching live odds:', error);
            return {
                success: false,
                data: [],
                timestamp: new Date().toISOString(),
                source: 'the-odds-api',
                rateLimit: {
                    remaining: this.rateLimitRemaining,
                    resetTime: this.rateLimitReset.toISOString()
                }
            };
        }
    }

    private getMatchStatus(startTime: Date): 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' {
        const now = new Date();
        const matchStart = new Date(startTime);
        const timeDiff = matchStart.getTime() - now.getTime();
        const minutesUntilStart = timeDiff / (1000 * 60);

        if (minutesUntilStart > 0) return 'SCHEDULED';
        if (minutesUntilStart > -120) return 'LIVE'; // Consider live for 2 hours
        return 'FINISHED';
    }

    getRateLimitStatus() {
        return {
            remaining: this.rateLimitRemaining,
            resetTime: this.rateLimitReset,
            percentage: (this.rateLimitRemaining / 500) * 100
        };
    }
}