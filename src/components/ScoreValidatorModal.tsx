/**
 * SATB Composer Studio - Score Validator & Quality Checker Modal
 * Analyzes voice ranges, parallel fifths/octaves, voice crossings, and rhythmic balance
 * with one-click Auto-Fix for safe adjustments.
 */

import React, { useMemo } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  Wand2,
  CheckCircle2
} from 'lucide-react';
import { SATBScore, ValidationIssue } from '../types/music';
import { autoFixScore, validateScore } from '../engine/scoreValidator';

interface ScoreValidatorModalProps {
  score: SATBScore;
  isOpen: boolean;
  onClose: () => void;
  onApplyFixedScore: (fixedScore: SATBScore) => void;
}

export const ScoreValidatorModal: React.FC<ScoreValidatorModalProps> = ({
  score,
  isOpen,
  onClose,
  onApplyFixedScore,
}) => {
  const issues = useMemo(() => validateScore(score), [score]);

  if (!isOpen) return null;

  const errors = issues.filter(i => i.category === 'error');
  const warnings = issues.filter(i => i.category === 'warning');
  const suggestions = issues.filter(i => i.category === 'suggestion');
  const infos = issues.filter(i => i.category === 'info');

  const hasAutoFixable = issues.some(i => i.autoFixable);

  const handleAutoFix = () => {
    const fixed = autoFixScore(score);
    onApplyFixedScore(fixed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg">Pemeriksaan & Validasi Harmoni Partitur</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Badges Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex space-x-3 text-xs font-bold">
            <span className="flex items-center space-x-1 text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-md">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.length} Kesalahan</span>
            </span>
            <span className="flex items-center space-x-1 text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warnings.length} Peringatan</span>
            </span>
            <span className="flex items-center space-x-1 text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-md">
              <Info className="w-3.5 h-3.5" />
              <span>{suggestions.length} Saran</span>
            </span>
          </div>

          {hasAutoFixable && (
            <button
              onClick={handleAutoFix}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Perbaiki Otomatis</span>
            </button>
          )}
        </div>

        {/* Scrollable Issue List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {issues.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">Partitur Sempurna!</h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Semua birama memiliki ritme yang konsisten, rentang vokal SATB berada dalam batas nyaman, dan tidak ditemukan kesalahan harmoni.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => {
                let badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                let Icon = Info;

                if (issue.category === 'error') {
                  badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
                  Icon = AlertCircle;
                } else if (issue.category === 'warning') {
                  badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                  Icon = AlertTriangle;
                }

                return (
                  <div
                    key={issue.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-start space-x-3 transition-colors hover:border-slate-300"
                  >
                    <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${
                      issue.category === 'error' ? 'text-rose-600' : (issue.category === 'warning' ? 'text-amber-600' : 'text-blue-600')
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-bold text-slate-900 truncate">
                          {issue.title}
                        </h5>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-colors"
          >
            Tutup Pemeriksaan
          </button>
        </div>
      </div>
    </div>
  );
};
