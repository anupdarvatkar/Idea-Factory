import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between mt-8 py-3 px-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <Button onClick={handlePrevious} disabled={currentPage === 1} variant="secondary">
        Previous
      </Button>
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
        Page {currentPage} of {totalPages}
      </span>
      <Button onClick={handleNext} disabled={currentPage === totalPages} variant="secondary">
        Next
      </Button>
    </div>
  );
};