// ===========================================
// LIVE MODE TOGGLE - API CONTROL
// ===========================================

'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Radio,
    Zap,
    Clock,
    AlertTriangle,
    Settings,
    Wifi,
    WifiOff
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LiveModeToggleProps {
    isLiveMode: boolean;
    onToggle: (enabled: boolean) => void;
    apiStatus: any;
    rateLimits: any;
}

export function LiveModeToggle({
                                   isLiveMode,
                                   onToggle,
                                   apiStatus,
                                   rateLimits
                               }: LiveModeToggleProps) {

    const getRateLimitColor = (percentage: number) => {
        if (percentage > 70) return 'text-green-600 bg-green-50 border-green-200';
        if (percentage > 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getApiStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500';
            case 'ERROR': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 min-w-[280px]"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 ${isLiveMode ? 'text-green-400' : 'text-gray-300'}`}>
                        {isLiveMode ? (
                            <div className="flex items-center">
                                <Wifi className="w-5 h-5" />
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1" />
                            </div>
                        ) : (
                            <WifiOff className="w-5 h-5" />
                        )}
                        <span className="font-semibold">
              {isLiveMode ? 'LIVE MODE' : 'PRACTICE MODE'}
            </span>
                    </div>
                    <Badge
                        variant={isLiveMode ? 'success' : 'outline'}
                        className={isLiveMode ? 'bg-green-500 text-white' : 'bg-white/20 text-white border-white/40'}
                    >
                        {isLiveMode ? 'Real Money' : 'Learning'}
                    </Badge>
                </div>

                <Switch
                    checked={isLiveMode}
                    onCheckedChange={onToggle}
                    className="data-[state=checked]:bg-green-500"
                />
            </div>

            <div className="text-sm text-green-100 space-y-2">
                <p>
                    <strong>{isLiveMode ? 'Live Data:' : 'Practice Data:'}</strong>{' '}
                    {isLiveMode
                        ? 'Real-time odds from bookmaker APIs'
                        : 'Historical data patterns for learning'
                    }
                </p>

                {isLiveMode && (
                    <div className="space-y-2">
                        {/* API Status */}
                        <div className="flex items-center justify-between text-xs">
                            <span>API Status:</span>
                            <div className="flex space-x-2">
                                {apiStatus?.enabledAPIs?.map((api: any, index: number) => (
                                    <div key={index} className="flex items-center space-x-1">
                                        <div className={`w-2 h-2 rounded-full ${getApiStatusColor(api.status)}`} />
                                        <Badge
                                            variant={api.status === 'ACTIVE' ? 'success' : 'destructive'}
                                            className="text-xs px-1 py-0"
                                        >
                                            {api.name}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rate Limits */}
                        {rateLimits && Object.keys(rateLimits).length > 0 && (
                            <div className="space-y-1">
                                <div className="text-xs font-medium">API Usage:</div>
                                {Object.entries(rateLimits).map(([apiName, limits]: [string, any]) => (
                                    <div key={apiName} className="flex items-center justify-between text-xs">
                                        <span className="capitalize">{apiName.replace('-', ' ')}:</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-16 bg-white/20 rounded-full h-1.5">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        limits.percentage > 70 ? 'bg-green-400' :
                                                            limits.percentage > 30 ? 'bg-yellow-400' : 'bg-red-400'
                                                    }`}
                                                    style={{ width: `${limits.percentage}%` }}
                                                />
                                            </div>
                                            <Badge className={`text-xs px-1 py-0 ${getRateLimitColor(limits.percentage)}`}>
                                                {limits.remaining}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Update Frequency */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/20">
                            <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Updates every 60s</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Zap className="w-3 h-3" />
                                <span>Auto-refresh ON</span>
                            </div>
                        </div>
                    </div>
                )}

                {!isLiveMode && (
                    <div className="mt-2 bg-blue-500/20 rounded px-3 py-2 text-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            <span>💡 Enable Live Mode when ready to find real arbitrage opportunities</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Warnings */}
            {isLiveMode && rateLimits && Object.values(rateLimits).some((limit: any) => limit.percentage < 20) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 bg-red-500/20 rounded px-2 py-1 text-xs flex items-center space-x-1 border border-red-400/30"
                >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Low API calls remaining - monitoring may be limited</span>
                </motion.div>
            )}

            {/* Cost Information */}
            <div className="mt-3 pt-2 border-t border-white/20 text-xs">
                <div className="flex items-center justify-between">
                    <span className="text-green-200">Cost:</span>
                    <span className="text-white">
            {isLiveMode ? '€0-50/month' : 'FREE'}
          </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-green-200">Opportunities:</span>
                    <span className="text-white">
            {isLiveMode ? '2-15/day' : 'Unlimited'}
          </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-green-200">Profit potential:</span>
                    <span className="text-white font-medium">
            {isLiveMode ? '€50-500/day' : 'Learning only'}
          </span>
                </div>
            </div>
        </motion.div>
    );
}