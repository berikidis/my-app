import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('el-GR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

export function formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatTimeAgo(date: Date | null): string {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

export function calculateImpliedProbability(odds: number): number {
    return (1 / odds) * 100;
}

export function generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}