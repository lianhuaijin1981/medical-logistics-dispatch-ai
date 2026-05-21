import React from 'react';
import { cn } from '@med/shared-utils';

export interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  className,
  children,
  padded = true,
}) => {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padded ? 'p-6' : undefined}>{children}</div>
    </div>
  );
};
