/**
 * SATB COMPOSER STUDIO
 * Aplikasi Web Profesional Pembuat Partitur Musik Empat Suara Otomatis
 * (Sopran, Alto, Tenor, Bass)
 */

import React, { useState, useEffect } from 'react';
import {
  Music,
  Plus,
  Wand2,
  ArrowRightLeft,
  ShieldCheck,
  Download,
  Upload,
  FolderOpen,
  Sliders,
  BookOpen,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Layers
} from 'lucide-react';

import { NotationViewMode, SATBScore, VocalRangeSettings, VoicePart } from './types/music';
import { SAMPLE_SCORES } from './engine/sampleScores';
import {
  getActiveScoreId,
  getAllSavedScores,
  saveScoreToStorage,
  setActiveScoreId
} from './engine/projectStorage';
import { audioPlayer } from './engine/audioEngine';

// Components
import { Navbar } from './components/Navbar';
import { NotAngkaViewer } from './components/NotAngkaViewer';
import { ScoreViewer } from './components/ScoreViewer';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { ScoreInspector } from './components/ScoreInspector';
import { TransposeModal } from './components/TransposeModal';
import { NewScoreModal } from './components/NewScoreModal';
import { ScoreValidatorModal } from './components/ScoreValidatorModal';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { AiArrangerModal } from './components/AiArrangerModal';
import { VocalRangeModal } from './components/VocalRangeModal';

export default function App() {
  // Score state
  const [scores, setScores] = useState<SATBScore[]>(() => getAllSavedScores());
  const [currentScore, setCurrentScore] = useState<SATBScore>(() => {
    const saved = getAllSavedScores();
    const activeId = getActiveScoreId();
    return saved.find(s => s.metadata.id === activeId) || saved[0] || SAMPLE_SCORES[0];
  });

  // Undo/Redo history stack
  const [history, setHistory] = useState<SATBScore[]>([currentScore]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Playback & view states
  const [currentMeasure, setCurrentMeasure] = useState(1);
  const [viewMode, setViewMode] = useState<NotationViewMode>('both');
  const [zoom, setZoom] = useState(1.0);
  const [activeTab, setActiveTab] = useState<'editor' | 'dashboard'>('editor');

  // Selected note / measure in editor
  const [selectedVoice, setSelectedVoice] = useState<VoicePart>('soprano');
  const [selectedMeasure, setSelectedMeasure] = useState<number>(1);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number>(0);

  // Modal open states
  const [isNewScoreOpen, setIsNewScoreOpen] = useState(false);
  const [isTransposeOpen, setIsTransposeOpen] = useState(false);
  const [isValidatorOpen, setIsValidatorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isAiArrangerOpen, setIsAiArrangerOpen] = useState(false);
  const [isVocalRangeOpen, setIsVocalRangeOpen] = useState(false);

  // Update score with undo history
  const handleScoreUpdate = (newScore: SATBScore, addToHistory = true) => {
    setCurrentScore(newScore);
    saveScoreToStorage(newScore);
    setScores(getAllSavedScores());

    if (addToHistory) {
      const newHist = history.slice(0, historyIndex + 1);
      newHist.push(newScore);
      setHistory(newHist);
      setHistoryIndex(newHist.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentScore(prev);
      saveScoreToStorage(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentScore(next);
      saveScoreToStorage(next);
    }
  };

  const handleSelectScoreFromCollection = (score: SATBScore) => {
    setCurrentScore(score);
    setActiveScoreId(score.metadata.id);
    setHistory([score]);
    setHistoryIndex(0);
    setCurrentMeasure(1);
    setActiveTab('editor');
  };

  const handleSelectNote = (voice: VoicePart, mNum: number, nIdx: number) => {
    setSelectedVoice(voice);
    setSelectedMeasure(mNum);
    setSelectedNoteIndex(nIdx);
  };

  const handleSelectMeasure = (mNum: number) => {
    setSelectedMeasure(mNum);
    setCurrentMeasure(mNum);
    setSelectedNoteIndex(0);
  };

  const handleSaveRanges = (ranges: VocalRangeSettings) => {
    const updated: SATBScore = {
      ...currentScore,
      vocalRanges: ranges,
    };
    handleScoreUpdate(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-28">
      {/* Top Navigation Bar */}
      <Navbar
        score={currentScore}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        onOpenNewScoreModal={() => setIsNewScoreOpen(true)}
        onOpenTransposeModal={() => setIsTransposeOpen(true)}
        onOpenValidatorModal={() => setIsValidatorOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenImportModal={() => setIsImportOpen(true)}
        onOpenProjectModal={() => setIsProjectOpen(true)}
        onOpenAiArrangerModal={() => setIsAiArrangerOpen(true)}
        onOpenVocalRangeModal={() => setIsVocalRangeOpen(true)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs between Editor & Dashboard */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold border border-slate-300">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'editor'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Editor Partitur SATB</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Panduan</span>
            </button>
          </div>

          {/* Quick Info Chip */}
          <div className="hidden md:flex items-center space-x-3 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Birama Aktif: {currentMeasure} / {currentScore.measures.length}</span>
            </span>
            <span>&bull;</span>
            <span className="font-semibold text-slate-700">
              Gaya: {currentScore.metadata.arrangementStyle.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* TAB 1: SCORE EDITOR */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left 3 cols: Score Viewers */}
            <div className="lg:col-span-3 space-y-6">
              {/* Not Angka View */}
              {(viewMode === 'not_angka' || viewMode === 'both') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span>Notasi Not Angka Paduan Suara 4 Suara</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Klik salah satu angka nada untuk memilih & mengedit
                    </span>
                  </div>
                  <NotAngkaViewer
                    score={currentScore}
                    currentMeasure={currentMeasure}
                    zoom={zoom}
                    onSelectMeasure={handleSelectMeasure}
                    onSelectNote={handleSelectNote}
                    selectedVoice={selectedVoice}
                    selectedMeasure={selectedMeasure}
                    selectedNoteIndex={selectedNoteIndex}
                  />
                </div>
              )}

              {/* Not Balok (Standard Staves) View */}
              {(viewMode === 'standard' || viewMode === 'both') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                      <span>Notasi Balok Standar (4 Paranada S, A, T, B)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      𝄞 Sopran & Alto &bull; 𝄞 Tenor (8va) &bull; 𝄢 Bass
                    </span>
                  </div>
                  <ScoreViewer
                    score={currentScore}
                    currentMeasure={currentMeasure}
                    zoom={zoom}
                    onSelectMeasure={handleSelectMeasure}
                    onSelectNote={handleSelectNote}
                    selectedVoice={selectedVoice}
                    selectedMeasure={selectedMeasure}
                    selectedNoteIndex={selectedNoteIndex}
                  />
                </div>
              )}
            </div>

            {/* Right col: Inspector & Quick Actions */}
            <div className="lg:col-span-1 space-y-4">
              <ScoreInspector
                score={currentScore}
                selectedVoice={selectedVoice}
                selectedMeasure={selectedMeasure}
                selectedNoteIndex={selectedNoteIndex}
                onUpdateScore={(newScore) => handleScoreUpdate(newScore, true)}
              />

              {/* Quick Voice Selector Chips */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase block">
                  Pilih Suara untuk Diedit
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {(['soprano', 'alto', 'tenor', 'bass'] as VoicePart[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setSelectedVoice(v)}
                      className={`py-2 px-2.5 rounded-lg border text-center transition-colors ${
                        selectedVoice === v
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Choral Arrangement Info Card */}
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-4 rounded-xl text-white shadow-sm space-y-2 text-xs">
                <div className="flex items-center space-x-2 font-bold text-teal-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Kaidah Harmoni SATB Aktif</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Algoritma deterministik SATB Studio menjaga jarak Sopran-Alto &lt; 1 oktaf, menghindari paralel kuint murni (parallel 5ths), dan memastikan resolusi nada penuntun (leading-tone).
                </p>
                <button
                  onClick={() => setIsValidatorOpen(true)}
                  className="w-full mt-2 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Buka Pemeriksaan Harmoni
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DASHBOARD & GUIDE */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Action Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  Paduan Suara Gereja & Komposisi Empat Suara
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
                  SATB COMPOSER STUDIO
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Susun partitur empat suara lengkap (Sopran, Alto, Tenor, Bass) secara otomatis, akurat, dan dapat dicetak langsung. Dilengkapi transposisi instan, konversi Not Angka & Not Balok, pemutaran suara paduan suara & organ gereja, serta ekspor PDF, MusicXML, dan MIDI.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setIsNewScoreOpen(true)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-transform active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Partitur Baru</span>
                  </button>
                  <button
                    onClick={() => setIsImportOpen(true)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-teal-400" />
                    <span>Impor Not Angka / MusicXML</span>
                  </button>
                  <button
                    onClick={() => setIsProjectOpen(true)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Koleksi Himne Gereja</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase">Total Partitur</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{scores.length} Lagu</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase">Partitur Aktif</span>
                <div className="text-base font-bold text-blue-900 mt-1 truncate">{currentScore.metadata.title}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase">Nada Dasar</span>
                <div className="text-2xl font-black text-teal-700 mt-1">Do = {currentScore.metadata.key}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase">Birama & Tempo</span>
                <div className="text-base font-bold text-slate-800 mt-1">
                  {currentScore.metadata.timeSignature.numerator}/{currentScore.metadata.timeSignature.denominator} • {currentScore.metadata.tempoBpm} BPM
                </div>
              </div>
            </div>

            {/* Recent Scores List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Daftar Partitur Tersimpan</h3>
                <button
                  onClick={() => setIsProjectOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Lihat Semua</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {scores.slice(0, 5).map(s => (
                  <div key={s.metadata.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{s.metadata.title}</h4>
                      <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>Cipt: {s.metadata.composer || 'Anonim'}</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-blue-700">Do = {s.metadata.key}</span>
                        <span>&bull;</span>
                        <span>{s.measures.length} Birama</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectScoreFromCollection(s)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-bold text-xs rounded-lg transition-colors"
                    >
                      Buka di Editor
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick User Guide for Choir Leaders & Music Teachers */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Panduan Singkat Penggunaan SATB Composer Studio</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">1. Memasukkan Melodi</div>
                  <p>
                    Ketik teks not angka (contoh: <code>1 1 5 5 | 6 6 5 .</code>), rekam vokal/siulan Anda, atau pilih opsi komposisi baru.
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">2. Transposisi & Latihan</div>
                  <p>
                    Ubah nada dasar (Do = G, D, Bb, dll.) seketika. Gunakan fitur solo/mute suara pada mixer untuk melatih bagian suara tertentu (S, A, T, atau B).
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">3. Ekspor & Siap Cetak</div>
                  <p>
                    Unduh file PDF beresolusi tinggi dengan Not Angka dan Not Balok siap cetak A4/Letter, MusicXML untuk MuseScore, atau MIDI empat suara.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Audio Transport Player Bar */}
      <AudioPlayerBar
        score={currentScore}
        currentMeasure={currentMeasure}
        onMeasureChange={setCurrentMeasure}
        onScoreUpdate={(s) => handleScoreUpdate(s, false)}
      />

      {/* MODALS */}
      <NewScoreModal
        isOpen={isNewScoreOpen}
        onClose={() => setIsNewScoreOpen(false)}
        onCreateScore={(newScore) => {
          handleScoreUpdate(newScore, true);
          setActiveTab('editor');
        }}
      />

      <TransposeModal
        score={currentScore}
        isOpen={isTransposeOpen}
        onClose={() => setIsTransposeOpen(false)}
        onApplyTranspose={(newScore) => handleScoreUpdate(newScore, true)}
      />

      <ScoreValidatorModal
        score={currentScore}
        isOpen={isValidatorOpen}
        onClose={() => setIsValidatorOpen(false)}
        onApplyFixedScore={(fixed) => handleScoreUpdate(fixed, true)}
      />

      <ExportModal
        score={currentScore}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportScore={(imported) => {
          handleScoreUpdate(imported, true);
          setActiveTab('editor');
        }}
      />

      <ProjectManagerModal
        currentScoreId={currentScore.metadata.id}
        isOpen={isProjectOpen}
        onClose={() => setIsProjectOpen(false)}
        onSelectScore={handleSelectScoreFromCollection}
      />

      <AiArrangerModal
        score={currentScore}
        isOpen={isAiArrangerOpen}
        onClose={() => setIsAiArrangerOpen(false)}
        onApplyNewArrangement={(newScore) => handleScoreUpdate(newScore, true)}
      />

      <VocalRangeModal
        score={currentScore}
        isOpen={isVocalRangeOpen}
        onClose={() => setIsVocalRangeOpen(false)}
        onSaveRanges={handleSaveRanges}
      />
    </div>
  );
}
