import React, { useState, useEffect } from 'react';
import { EvaluationCriteria } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface SettingsProps {
  criteria: EvaluationCriteria;
  onSaveCriteria: (newCriteria: EvaluationCriteria) => void;
}

const CriteriaInput: React.FC<{
  label: string;
  name: keyof EvaluationCriteria;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  description: string;
}> = ({ label, name, value, onChange, description }) => (
  <div>
    <label htmlFor={name} className="block text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">{label}</label>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{description}</p>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
    />
  </div>
);

export const Settings: React.FC<SettingsProps> = ({ criteria, onSaveCriteria }) => {
  const [criteriaState, setCriteriaState] = useState<EvaluationCriteria>(criteria);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCriteriaState(criteria);
  }, [criteria]);
  
  const handleCriteriaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCriteriaState(prev => ({ ...prev, [name]: value as string }));
  };

  const handleSave = () => {
    setIsSaving(true);
    onSaveCriteria(criteriaState);
    
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
        <h2 className="text-3xl font-bold mb-6">Settings</h2>
        <Card>
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold mb-4">AI Evaluation Criteria</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        Customize the criteria Gemini uses to evaluate ideas. Your instructions here will guide the AI to provide feedback that's most relevant to your goals.
                    </p>
                </div>

                <CriteriaInput
                    label="Desirability"
                    name="desirability"
                    value={criteriaState.desirability}
                    onChange={handleCriteriaChange}
                    description="What makes an idea desirable? Guide the AI on how to assess user need and market appeal."
                />
                <CriteriaInput
                    label="Feasibility"
                    name="feasibility"
                    value={criteriaState.feasibility}
                    onChange={handleCriteriaChange}
                    description="What are the key technical considerations? Tell the AI what to look for regarding implementation challenges."
                />
                <CriteriaInput
                    label="Viability"
                    name="viability"
                    value={criteriaState.viability}
                    onChange={handleCriteriaChange}
                    description="How should the AI assess the business potential? Define what makes an idea commercially or operationally viable."
                />
                 <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {isSaved && <span className="text-green-600 dark:text-green-400 animate-fade-in">Settings saved!</span>}
                    <Button onClick={handleSave} variant="success" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                 </div>
            </div>
        </Card>
    </div>
  );
};