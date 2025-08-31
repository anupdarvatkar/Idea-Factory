import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cardClasses = `bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden ${className} ${onClick ? 'cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1' : ''}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};