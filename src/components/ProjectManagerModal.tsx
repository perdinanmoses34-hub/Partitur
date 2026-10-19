/**
 * SATB Composer Studio - Project Manager Modal
 * Manage saved scores, search, duplicate, rename, delete with confirmation,
 * and explore the built-in sacred hymn collection.
 */

import React, { useState } from 'react';
import {
  X,
  FolderOpen,
  Search,
  Copy,
  Trash2,
  Calendar,
  Music,
  Download,
  Upload,
  BookOpen,
  Check
} from 'lucide-react';
import { SATBScore } from '../types/music';
import {
  deleteScoreFromStorage,
  duplicateScoreInStorage,
  exportProjectToJson,
  getAllSavedScores,
  importProjectFromJson,
  saveScoreToStorage
} from '../engine/projectStorage';
import { SAMPLE_SCORES } from '../engine/sampleScores';

interface ProjectManagerModalProps {
  currentScoreId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectScore: (score: SATBScore) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  currentScoreId,
  isOpen,
  onClose,
  onSelectScore,
}) => {
  const [scores, setScores] = useState<SATBScore[]>(() => getAllSavedScores());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my_scores' | 'templates'>('my_scores');
  const [scoreToDelete, setScoreToDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredScores = (activeTab === 'my_scores' ? scores : SAMPLE_SCORES).filter(s =>
    s.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.metadata.composer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpen = (score: SATBScore) => {
    onSelectScore(score);
    onClose();
  };

  const handleDuplicate = (score: SATBScore) => {
    const duplicated = duplicateScoreInStorage(score);
    setScores(getAllSavedScores());
    onSelectScore(duplicated);
  };

  const handleDeleteConfirm = (id: string) => {
    const updated = deleteScoreFromStorage(id);
    setScores(updated);
    setScoreToDelete(null);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importProjectFromJson(text);
        setScores(getAllSavedScores());
        onSelectScore(imported);
        onClose();
      } catch (err: any) {
        alert('Gagal mengimpor berkas JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg">Koleksi Partitur & Riwayat Proyek</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex space-x-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('my_scores')}
              className={`px-3.5 py-1.5 rounded-lg border transition-colors ${
                activeTab === 'my_scores'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
              }`}
            >
              Proyek Tersimpan ({scores.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3.5 py-1.5 rounded-lg border transition-colors ${
                activeTab === 'templates'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
              }`}
            >
              Koleksi Lagu Gereja & Himne
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari judul atau pencipta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-48 focus:w-60 transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center space-x-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Pulihkan JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Score List Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredScores.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Tidak ada partitur yang sesuai dengan pencarian Anda.
            </div>
          ) : (
            filteredScores.map((s) => {
              const isCurrent = s.metadata.id === currentScoreId;
              const dateStr = new Date(s.metadata.updatedAt || s.metadata.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={s.metadata.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-1 ring-blue-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-slate-900">{s.metadata.title}</h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                          Sedang Dibuka
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span>Cipt: {s.metadata.composer || 'Anonim'}</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-blue-700">Do = {s.metadata.key}</span>
                      <span>&bull;</span>
                      <span>{s.measures.length} Birama ({s.metadata.timeSignature.numerator}/{s.metadata.timeSignature.denominator})</span>
                      <span>&bull;</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpen(s)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                    >
                      Buka Partitur
                    </button>

                    <button
                      onClick={() => handleDuplicate(s)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Duplikat Partitur"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {activeTab === 'my_scores' && (
                      <button
                        onClick={() => setScoreToDelete(s.metadata.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Hapus Partitur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {scoreToDelete && (
          <div className="p-4 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs">
            <span className="text-rose-800 font-bold">
              Apakah Anda yakin ingin menghapus partitur ini secara permanen?
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setScoreToDelete(null)}
                className="px-3 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteConfirm(scoreToDelete)}
                className="px-3 py-1 bg-rose-600 text-white rounded font-bold hover:bg-rose-700"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
