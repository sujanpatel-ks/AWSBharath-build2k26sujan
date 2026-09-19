import React from 'react';
import { FertilizerMapSection } from './FertilizerMapSection';
import { Language } from '../types';

interface SuppliersProps {
  onBack: () => void;
  language: Language;
  initialSearch?: string;
}

export const Suppliers: React.FC<SuppliersProps> = ({ onBack, language, initialSearch }) => {
  return (
    <FertilizerMapSection
      onBack={onBack}
      language={language}
      initialSearch={initialSearch}
    />
  );
};
