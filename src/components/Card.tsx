import React from 'react';
import { cn } from '../lib/utils';

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn('bg-white border border-gray-100 rounded-brand shadow-[0_1px_3px_rgba(0,0,0,0.08)]', className)}>
    {children}
  </div>
);
