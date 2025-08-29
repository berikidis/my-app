// ===========================================
// BOOKMAKER APIs - TYPE DEFINITIONS
// ===========================================

export interface BookmakerAPI {
    name: string;
    baseUrl: string;
    apiKey?: string;
    rateLimit: number; // requests per minute
    regions: string[];
    markets: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
}

export interface LiveOddsResponse {
    success: boolean;
    data: LiveMatch[];
    timestamp: string;
    source: string;
    rateLimit: {
        remaining: number;
        resetTime: string;
    };
}

export interface LiveMatch {
    id: string;
    sport: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    startTime: string;
    status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
    bookmakers: LiveBookmaker[];
}

export interface LiveBookmaker {
    name: string;
    lastUpdate: string;
    markets: LiveMarket[];
}

export interface LiveMarket {
    key: string; // 'h2h', 'spreads', 'totals'
    outcomes: LiveOutcome[];
}

export interface LiveOutcome {
    name: string; // 'Home', 'Away', 'Draw'
    price: number;
    lastChanged: string;
}