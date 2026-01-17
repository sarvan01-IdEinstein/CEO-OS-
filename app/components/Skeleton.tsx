'use client';

import { ReactNode } from 'react';

interface SkeletonProps {
    className?: string;
}

// Base Skeleton with shimmer animation
export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%] rounded ${className}`}
        />
    );
}

// Card Skeleton
export function CardSkeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-full mb-3" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    );
}

// Stat Card Skeleton (for dashboard widgets)
export function StatCardSkeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
        </div>
    );
}

// OKR Widget Skeleton
export function OKRWidgetSkeleton() {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Daily Cycle Widget Skeleton
export function DailyCycleWidgetSkeleton() {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                </div>
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
        </div>
    );
}

// Review Card Skeleton
export function ReviewCardSkeleton() {
    return (
        <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-3/4" />
        </div>
    );
}

// Avatar Skeleton
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-16 w-16'
    };
    return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
}

// Text Line Skeleton
export function TextSkeleton({ lines = 1, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

// Table Row Skeleton
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
    return (
        <div className="flex items-center gap-4 py-4 border-b border-[var(--glass-border)]">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === 0 ? 'w-32' : 'flex-1'}`}
                />
            ))}
        </div>
    );
}

// Dashboard Skeleton (complete dashboard loading state)
export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <OKRWidgetSkeleton />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <DailyCycleWidgetSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        </div>
    );
}
