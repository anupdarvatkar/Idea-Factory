import React from 'react';
import { Button } from './ui/Button';

interface HeaderProps {
  onAddNew: () => void;
  onGoToList: () => void;
  onGoToDashboard: () => void;
  onGoToSettings: () => void;
  currentView: 'list' | 'detail' | 'dashboard' | 'settings';
}

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 12H12V2.252z" />
    </svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ onAddNew, onGoToList, onGoToDashboard, onGoToSettings, currentView }) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md sticky top-0 z-10 p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent cursor-pointer" onClick={onGoToDashboard}>
          Idea Factory
        </h1>
        <div className="flex items-center space-x-2">
            {currentView !== 'dashboard' && (
                <Button onClick={onGoToDashboard} variant="secondary">
                     <DashboardIcon /> Dashboard
                </Button>
            )}
            {currentView !== 'list' && ['dashboard', 'detail', 'settings'].includes(currentView) && (
                 <Button onClick={onGoToList} variant="secondary">
                     <ListIcon /> All Ideas
                </Button>
            )}
            <Button onClick={onAddNew}>
                <PlusIcon /> Add Idea
            </Button>
             <button onClick={onGoToSettings} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Settings">
                <SettingsIcon />
            </button>
        </div>
      </div>
    </header>
  );
};