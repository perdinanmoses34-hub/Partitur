/**
 * SATB Composer Studio - Transpose Modal
 * Choose target key or transpose by semitones (+/- 1, +/- 2),
 * choose all voices or individual voice, with instant real-time data model update.
 */

import React, { useState } from 'react';
import { X, ArrowRightLeft, Music2, Check, RefreshCw } from 'lucide-react';
import { KeyName, SATBScore, VoicePart } from '../types/music';
import { KEYS_INFO } from '../engine/musicTheory';
import {
  getSemitoneDistanceBetweenKeys,
  transposeBySemitones,
  transposeScore
} from '../engine/transposition';

interface TransposeModalProps {
  score: SATBScore;
  isOpen: boolean;
  onClose: () => void;
  onApplyTranspose: (newScore: SATBScore) => void;
}

export const TransposeModal: React.FC<TransposeModalProps> = ({
  score,
  isOpen,
  onClose,
  onApplyTranspose,
}) => {
  const currentKey = score.metadata.key;
  const originalKey = score.metadata.originalKey;

  const [selectedTargetKey, setSelectedTargetKey] = useState<KeyName>(currentKey);
  const [targetVoice, setTargetVoice] = useState<VoicePart | 'all'>('all');

  if (!isOpen) return null;

  const majorKeys: KeyName[] = [
    'C', 'G', 'D', 'A', 'E', 'B', 'F#',
    'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'
  ];

  const minorKeys: KeyName[] = [
    'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m',
    'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'
  ];

  const semitonesDiff = getSemitoneDistanceBetweenKeys(currentKey, selectedTargetKey);

  const handleApply = () => {
    const updated = transposeScore(score, selectedTargetKey, targetVoice);
    onApplyTranspose(updated);
    onClose();
  };

  const handleQuickStep = (delta: number) => {
    const updated = transposeBySemitones(score, delta, targetVoice);
    setSelectedTargetKey(updated.metadata.key);
    onApplyTranspose(updated);
  };

  const handleResetToOriginal = () => {
    const updated = transposeScore(score, originalKey, 'all');
    setSelectedTargetKey(originalKey);
    onApplyTranspose(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg">Transposisi Nada Dasar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current & Target Status Banner */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Nada Dasar Saat Ini</span>
              <div className="text-2xl font-black text-blue-950 font-serif">
                Do = {currentKey}
              </div>
            </div>

            <div className="text-center px-4">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full">
                {semitonesDiff > 0 ? `+${semitonesDiff} semiton` : `${semitonesDiff} semiton`}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Tujuan Transposisi</span>
              <div className="text-2xl font-black text-blue-950 font-serif">
                Do = {selectedTargetKey}
              </div>
            </div>
          </div>

          {/* Quick Semitone Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Langkah Cepat (Semiton & Nada)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleQuickStep(-2)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 transition-colors"
              >
                -1 Nada (-2)
              </button>
              <button
                onClick={() => handleQuickStep(-1)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 transition-colors"
              >
                -½ Nada (-1)
              </button>
              <button
                onClick={() => handleQuickStep(1)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 transition-colors"
              >
                +½ Nada (+1)
              </button>
              <button
                onClick={() => handleQuickStep(2)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 transition-colors"
              >
                +1 Nada (+2)
              </button>
            </div>
          </div>

          {/* Target Key Grid Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Pilih Tangga Nada Mayor:
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {majorKeys.map((k) => (
                <button
                  key={`key_${k}`}
                  onClick={() => setSelectedTargetKey(k)}
                  className={`py-2 text-sm font-bold rounded-lg border transition-all ${
                    selectedTargetKey === k
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <label className="block text-xs font-bold text-slate-700 uppercase mt-4 mb-2">
              Pilih Tangga Nada Minor:
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {minorKeys.map((k) => (
                <button
                  key={`key_m_${k}`}
                  onClick={() => setSelectedTargetKey(k)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    selectedTargetKey === k
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Target Voices Scope */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Cakupan Transposisi:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Seluruh Suara (SATB)' },
                { id: 'soprano', label: 'Sopran Saja' },
                { id: 'alto', label: 'Alto Saja' },
                { id: 'tenor', label: 'Tenor Saja' },
                { id: 'bass', label: 'Bass Saja' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTargetVoice(opt.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    targetVoice === opt.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handleResetToOriginal}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kembali ke Nada Asli ({originalKey})</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleApply}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md shadow-blue-600/30 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>TRANSPOSISI SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
