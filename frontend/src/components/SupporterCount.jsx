import React from 'react';
import { Users, Heart } from 'lucide-react';

export const SupporterCount = ({ count = 0, hasJoined = false, size = 'md' }) => {
  const isLarge = size === 'lg';

  return (
    <div
      className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs md:text-sm font-medium transition ${
        hasJoined
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-slate-100 text-slate-700 border border-slate-200'
      }`}
      title={hasJoined ? 'You are supporting this community complaint' : `${count} citizens supporting`}
    >
      {hasJoined ? (
        <Heart className={`${isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-emerald-600 fill-emerald-600`} />
      ) : (
        <Users className={`${isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-slate-500`} />
      )}
      <span>{count}</span>
      <span className="hidden sm:inline text-xs text-slate-500">
        {count === 1 ? 'supporter' : 'supporters'}
      </span>
    </div>
  );
};

export default SupporterCount;

