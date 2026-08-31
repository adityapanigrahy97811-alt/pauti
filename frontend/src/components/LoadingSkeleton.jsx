import React from 'react';

export function LoadingSkeleton({ count = 5, rows = 1 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 bg-mandal-card border border-gray-800/60 rounded-xl w-full" />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-mandal-card border border-gray-800 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-800 rounded w-24" />
        <div className="w-10 h-10 bg-gray-800 rounded-xl" />
      </div>
      <div className="h-8 bg-gray-800 rounded w-36" />
      <div className="h-3 bg-gray-800 rounded w-20" />
    </div>
  );
}
