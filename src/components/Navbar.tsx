/**
 * SATB Composer Studio - Main Navigation & Top Toolbar
 */

import React from 'react';
import {
  Music,
  Plus,
  Wand2,
  ArrowRightLeft,
  ShieldCheck,
  Download,
  Upload,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Sparkles,
  Sliders,
  Settings
} from 'lucide-react';
import { NotationViewMode, SATBScore } from '../types/music';

interface NavbarProps {
  score: SATBScore;
  viewMode: NotationViewMode;
  onViewModeChange: (mode: NotationViewMode) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onOpenNewScoreModal: () => void;
  onOpenTransposeModal: () => void;
  onOpenValidatorModal: () => void;
  onOpenExportModal: () => void;
  onOpenImportModal: () => void;
  onOpenProjectModal: () => void;
  onOpenAiArrangerModal: () => void;
  onOpenVocalRangeModal: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  score,
  viewMode,
  onViewModeChange,
  zoom,
  onZoomChange,
  onOpenNewScoreModal,
  onOpenTransposeModal,
  onOpenValidatorModal,
  onOpenExportModal,
  onOpenImportModal,
  onOpenProjectModal,
  onOpenAiArrangerModal,
  onOpenVocalRangeModal,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onSave,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Upper Brand & Title Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center shadow-md shadow-blue-500/20 font-black text-xl text-white">
            𝄞
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white uppercase flex items-center space-x-1.5">
              <span>SATB</span>
              <span className="text-teal-400 font-medium">COMPOSER</span>
              <span className="text-xs px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800 font-mono">
                STUDIO
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Pembuat Partitur Empat Suara Otomatis • Not Balok & Not Angka
            </p>
          </div>
        </div>

        {/* Current Score Title & Key Badge */}
        <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-xs font-bold text-slate-200 truncate max-w-[160px] sm:max-w-xs">
            {score.metadata.title}
          </span>
          <button
            onClick={onOpenTransposeModal}
            className="px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-mono font-bold text-[11px] rounded border border-blue-500/30 transition-colors flex items-center space-x-1"
            title="Klik untuk Transposisi Nada Dasar"
          >
            <span>Do = {score.metadata.key}</span>
            <ArrowRightLeft className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenNewScoreModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-600/30 transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Partitur Baru</span>
          </button>

          <button
            onClick={onOpenProjectModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Koleksi</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-teal-600/30 transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Partitur</span>
          </button>
        </div>
      </div>

      {/* Secondary Functional Toolbar */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* View Mode Toggle: Not Angka / Not Balok / Keduanya */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onViewModeChange('not_angka')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                viewMode === 'not_angka'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Not Angka
            </button>
            <button
              onClick={() => onViewModeChange('standard')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                viewMode === 'standard'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Not Balok
            </button>
            <button
              onClick={() => onViewModeChange('both')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                viewMode === 'both'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Keduanya (Dual)
            </button>
          </div>

          {/* Quick Tools: Transpose, Validator, Revoice, Ranges */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenTransposeModal}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Transposisi</span>
            </button>

            <button
              onClick={onOpenValidatorModal}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pemeriksaan Harmoni</span>
            </button>

            <button
              onClick={onOpenAiArrangerModal}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Variasi SATB</span>
            </button>

            <button
              onClick={onOpenImportModal}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Impor Lagu</span>
            </button>

            <button
              onClick={onOpenVocalRangeModal}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
              title="Pengaturan Rentang Vokal"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom and Undo/Redo */}
          <div className="flex items-center space-x-2">
            {onUndo && (
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 text-slate-400 hover:text-white rounded disabled:opacity-30 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            {onRedo && (
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 text-slate-400 hover:text-white rounded disabled:opacity-30 transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              <button
                onClick={() => onZoomChange(Math.max(0.7, zoom - 0.1))}
                className="text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-300 w-8 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))}
                className="text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
