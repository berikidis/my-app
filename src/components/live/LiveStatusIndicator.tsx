// ===========================================
// LIVE STATUS INDICATOR - CONNECTION STATUS (LIVE MODE ONLY)
// ===========================================

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Clock,
    Zap,
    Wifi,
    Target,
    Timer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTimeAgo } from '@/lib/utils';

interface LiveStatusIndicatorProps {
    isLive: boolean;
    lastUpdate: Date | null;
    nextUpdate: number; // seconds until next update
    opportunitiesFound: number;
}

export function LiveStatusIndicator({
                                        isLive = true, // Always live mode
                                        lastUpdate,
                                        nextUpdate,
                                        opportunitiesFound
                                    }: LiveStatusIndicatorProps) {

    const getNextUpdateText = (seconds: number) => {
        if (seconds <= 0) return 'Updating...';
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center gap-4 text-sm"
        >
            {/* Connection Status */}
            <motion.div
                className="flex items-center space-x-1 text-green-400"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                <div className="relative">
                    <Wifi className="w-4 h-4" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <Activity className="w-4 h-4" />
                <span className="font-medium">Live Monitoring</span>
            </motion.div>

            {/* Last Update */}
            {lastUpdate && (
                <div className="flex items-center space-x-1 text-green-200">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">
                        Last scan: {formatTimeAgo(lastUpdate)}
                    </span>
                </div>
            )}

            {/* Next Update Countdown */}
            {nextUpdate > 0 && (
                <motion.div
                    className="flex items-center space-x-1 text-blue-200"
                    key={nextUpdate} // Re-animate when countdown resets
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.1 }}
                >
                    <Timer className="w-3 h-3" />
                    <span className="text-xs font-mono">
                        Next scan: {getNextUpdateText(nextUpdate)}
                    </span>
                </motion.div>
            )}

            {/* Opportunities Count */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Badge
                    variant={opportunitiesFound > 0 ? 'default' : 'outline'}
                    className={`${
                        opportunitiesFound > 0
                            ? 'bg-green-500 text-white border-green-400'
                            : 'bg-white/20 text-white border-white/40'
                    } flex items-center space-x-1`}
                >
                    <Target className="w-3 h-3" />
                    <span>{opportunitiesFound} opportunities</span>
                </Badge>
            </motion.div>

            {/* High Opportunity Alert */}
            {opportunitiesFound >= 5 && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs"
                >
                    <Zap className="w-3 h-3" />
                    <span className="font-medium">High Activity</span>
                </motion.div>
            )}

            {/* Market Status */}
            <div className="flex items-center space-x-1 text-xs text-green-300">
                <div className={`w-2 h-2 rounded-full ${
                    opportunitiesFound > 0 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                }`} />
                <span>
                    {opportunitiesFound > 0 ? 'Active Market' : 'Scanning...'}
                </span>
            </div>

            {/* Auto-refresh Status */}
            {nextUpdate <= 0 && (
                <motion.div
                    animate={{
                        opacity: [1, 0.5, 1],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="flex items-center space-x-1 text-yellow-400"
                >
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="text-xs font-medium">Updating...</span>
                </motion.div>
            )}
        </motion.div>
    );
}