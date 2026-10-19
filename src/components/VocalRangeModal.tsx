/**
 * SATB Composer Studio - Vocal Range Settings Modal
 * Customize min/max singable ranges for Soprano, Alto, Tenor, and Bass.
 */

import React, { useState } from 'react';
import { X, Mic2, RotateCcw, Check } from 'lucide-react';
import { SATBScore, VocalRangeSettings } from '../types/music';
import { DEFAULT_VOCAL_RANGES } from '../engine/musicTheory';

interface VocalRangeModalProps {
  score: SATBScore;
  isOpen: boolean;
  onClose: () => void;
  onSaveRanges: (ranges: VocalRangeSettings) => void;
}

export const VocalRangeModal: React.FC<VocalRangeModalProps> = ({
  score,
  isOpen,
  onClose,
  onSaveRanges,
}) => {
  const [ranges, setRanges] = useState<VocalRangeSettings>(score.vocalRanges || DEFAULT_VOCAL_RANGES);

  if (!isOpen) return null;

  const handleReset = () => {
    setRanges(DEFAULT_VOCAL_RANGES);
  };

  const handleSave = () => {
    onSaveRanges(ranges);
    onClose();
  };

  const voicesConfig: { key: keyof VocalRangeSettings; label: string; desc: string; defaultNote: string }[] = [
    { key: 'soprano', label: 'Sopran (S)', desc: 'Suara tinggi wanita / anak-anak', defaultNote: 'C4 s/d A5' },
    { key: 'alto',    label: 'Alto (A)',    desc: 'Suara rendah wanita', defaultNote: 'G3 s/d D5' },
    { key: 'tenor',   label: 'Tenor (T)',   desc: 'Suara tinggi pria', defaultNote: 'C3 s/d G4' },
    { key: 'bass',    label: 'Bass (B)',    desc: 'Suara rendah pria', defaultNote: 'E2 s/d C4' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Mic2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg">Pengaturan Rentang Vokal SATB</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Sesuaikan jangkauan nada nyaman paduan suara Anda. Sistem validator akan memberikan peringatan jika terdapat nada yang melampaui rentang ini.
          </p>

          <div className="space-y-3">
            {voicesConfig.map(({ key, label, desc, defaultNote }) => {
              const r = ranges[key];
              return (
                <div key={key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-slate-900">{label}</span>
                    <span className="text-xs font-mono text-blue-700 font-semibold">{r.minNote} — {r.maxNote}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{desc} (Standar: {defaultNote})</p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nada Terendah</label>
                      <input
                        type="text"
                        value={r.minNote}
                        onChange={(e) => setRanges({
                          ...ranges,
                          [key]: { ...r, minNote: e.target.value.toUpperCase() }
                        })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nada Tertinggi</label>
                      <input
                        type="text"
                        value={r.maxNote}
                        onChange={(e) => setRanges({
                          ...ranges,
                          [key]: { ...r, maxNote: e.target.value.toUpperCase() }
                        })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-mono"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standar</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
