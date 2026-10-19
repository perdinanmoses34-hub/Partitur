/**
 * SATB Composer Studio - Export & Download Modal
 * Real file downloads for print-ready PDF, standard MusicXML,
 * 4-track MIDI, and JSON project backup.
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  FileCode,
  Music,
  FileJson,
  Check,
  Printer
} from 'lucide-react';
import { SATBScore } from '../types/music';
import { downloadMidiFile } from '../engine/midiEngine';
import { exportToMusicXML } from '../engine/musicXml';
import { exportScoreToPdf, PdfExportOptions } from '../engine/pdfExport';
import { exportProjectToJson } from '../engine/projectStorage';

interface ExportModalProps {
  score: SATBScore;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  score,
  isOpen,
  onClose,
}) => {
  const [pdfOptions, setPdfOptions] = useState<PdfExportOptions>({
    paperSize: 'a4',
    orientation: 'portrait',
    includeChords: true,
    includeLyrics: true,
    scoreView: 'both',
  });

  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setDownloadSuccessMessage(msg);
    setTimeout(() => setDownloadSuccessMessage(''), 4000);
  };

  const handleExportPdf = () => {
    exportScoreToPdf(score, pdfOptions);
    showSuccess('Berkas PDF Partitur SATB siap cetak berhasil diunduh!');
  };

  const handleExportMusicXml = () => {
    const xml = exportToMusicXML(score);
    const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${score.metadata.title.replace(/\s+/g, '_')}_SATB.musicxml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Berkas MusicXML untuk MuseScore / Sibelius / Finale berhasil diunduh!');
  };

  const handleExportMidi = () => {
    downloadMidiFile(score);
    showSuccess('Berkas MIDI 4 Suara SATB berhasil diunduh!');
  };

  const handleExportJson = () => {
    exportProjectToJson(score);
    showSuccess('Cadangan Proyek SATB (.json) berhasil diunduh!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg">Ekspor & Unduh Partitur Musik</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {downloadSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}

          {/* PDF Section with Custom Configuration */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">PDF Partitur Siap Cetak</h4>
                  <p className="text-xs text-slate-500">Tata letak paduan suara SATB dengan Not Angka & Not Balok</p>
                </div>
              </div>
              <button
                onClick={handleExportPdf}
                className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </button>
            </div>

            {/* PDF Layout options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ukuran Kertas</label>
                <select
                  value={pdfOptions.paperSize}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, paperSize: e.target.value as any })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="a4">A4 (Standar)</option>
                  <option value="letter">Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Orientasi</label>
                <select
                  value={pdfOptions.orientation}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, orientation: e.target.value as any })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                >
                  <option value="portrait">Tegak (Portrait)</option>
                  <option value="landscape">Mendatar (Landscape)</option>
                </select>
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pdfOptions.includeChords}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, includeChords: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs text-slate-700 font-medium">Sertakan Akor</span>
                </label>
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pdfOptions.includeLyrics}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, includeLyrics: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs text-slate-700 font-medium">Sertakan Lirik</span>
                </label>
              </div>
            </div>
          </div>

          {/* MusicXML Export */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">MusicXML 4.0</h4>
                <p className="text-xs text-slate-500">Dapat diedit di MuseScore, Finale, Sibelius, & Dorico</p>
              </div>
            </div>
            <button
              onClick={handleExportMusicXml}
              className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh XML</span>
            </button>
          </div>

          {/* MIDI 4-Part Export */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">MIDI Standard (.mid)</h4>
                <p className="text-xs text-slate-500">4 Track diskret S, A, T, B untuk DAW & keyboard pengiring</p>
              </div>
            </div>
            <button
              onClick={handleExportMidi}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh MIDI</span>
            </button>
          </div>

          {/* JSON Project Backup */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Cadangan Proyek (.json)</h4>
                <p className="text-xs text-slate-500">Simpan seluruh data partitur, vokal, dan riwayat untuk dibuka kembali</p>
              </div>
            </div>
            <button
              onClick={handleExportJson}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh JSON</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
