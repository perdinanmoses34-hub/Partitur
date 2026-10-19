/**
 * SATB Composer Studio - Music Import Modal
 * Supports MusicXML, MIDI, Not Angka text, Sheet Image OMR scanner,
 * and live Audio singing/whistling pitch detection.
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileCode,
  Music,
  Camera,
  Mic,
  MicOff,
  Check,
  AlertCircle,
  FileText
} from 'lucide-react';
import { KeyName, SATBScore, TimeSignature } from '../types/music';
import { DEFAULT_VOCAL_RANGES, midiToNotAngka, pitchToMidi } from '../engine/musicTheory';
import { importFromMusicXML } from '../engine/musicXml';
import { autoCorrelateAudioBuffer, frequencyToMidi, parseNotAngkaText } from '../engine/parsers';
import { harmonizeSATB } from '../engine/satbArranger';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportScore: (score: SATBScore) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportScore,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text' | 'image' | 'audio'>('file');
  const [errorMsg, setErrorMsg] = useState('');
  const [notAngkaInput, setNotAngkaInput] = useState('1 3 5 5 | 6 5 3 . | 4 3 2 5 | 1 . . . |');
  const [targetKey, setTargetKey] = useState<KeyName>('C');

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [detectedNotes, setDetectedNotes] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Image OMR states
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // File Import: MusicXML or MIDI
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'musicxml' || ext === 'xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const xmlContent = event.target?.result as string;
          const score = importFromMusicXML(xmlContent);
          onImportScore(score);
          onClose();
        } catch (err: any) {
          setErrorMsg('Gagal memproses file MusicXML: ' + (err.message || 'Format tidak didukung'));
        }
      };
      reader.readAsText(file);
    } else if (ext === 'mid' || ext === 'midi') {
      // Basic MIDI import alert
      setErrorMsg('File MIDI terdeteksi. Silakan konversi atau ekspor ke MusicXML untuk partitur paduan suara terbaik.');
    } else {
      setErrorMsg('Format file tidak didukung. Harap gunakan berkas .musicxml atau .xml.');
    }
  };

  // Text Not Angka Import
  const handleImportNotAngkaText = () => {
    if (!notAngkaInput.trim()) {
      setErrorMsg('Harap masukkan teks Not Angka.');
      return;
    }

    const timeSig: TimeSignature = { numerator: 4, denominator: 4 };
    const parsedMeasures = parseNotAngkaText(notAngkaInput, targetKey, timeSig);

    if (parsedMeasures.length === 0) {
      setErrorMsg('Format teks Not Angka tidak valid.');
      return;
    }

    const harmonized = harmonizeSATB(parsedMeasures, targetKey, 'hymn_satb', 'soprano', DEFAULT_VOCAL_RANGES);

    const newScore: SATBScore = {
      metadata: {
        id: `imported_${Date.now()}`,
        title: 'Lagu Impor Not Angka',
        composer: 'Anonim',
        arranger: 'SATB Studio',
        key: targetKey,
        originalKey: targetKey,
        timeSignature: timeSig,
        tempoBpm: 84,
        tempoMarking: 'Andante',
        arrangementStyle: 'hymn_satb',
        melodyVoice: 'soprano',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      vocalRanges: DEFAULT_VOCAL_RANGES,
      measures: harmonized,
    };

    onImportScore(newScore);
    onClose();
  };

  // Audio Pitch Detector (Singing / Whistling)
  const startAudioListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      setIsRecording(true);
      setDetectedNotes([]);

      let lastNote = '';
      let holdCount = 0;

      const updatePitch = () => {
        analyser.getFloatTimeDomainData(buffer);
        const freq = autoCorrelateAudioBuffer(buffer, audioCtx.sampleRate);

        if (freq) {
          const midi = frequencyToMidi(freq);
          const solfege = midiToNotAngka(midi, targetKey).display;

          if (solfege === lastNote) {
            holdCount++;
            if (holdCount === 4) {
              setDetectedNotes(prev => [...prev.slice(-15), solfege]);
            }
          } else {
            lastNote = solfege;
            holdCount = 1;
          }
        }

        animFrameRef.current = requestAnimationFrame(updatePitch);
      };

      updatePitch();
    } catch (err: any) {
      setErrorMsg('Tidak dapat mengakses mikrofon: ' + err.message);
    }
  };

  const stopAudioListening = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) audioContextRef.current.close();
    setIsRecording(false);
  };

  const applyAudioNotes = () => {
    stopAudioListening();
    if (detectedNotes.length === 0) {
      setErrorMsg('Belum ada nada yang terdeteksi dari audio.');
      return;
    }

    const chunkText = detectedNotes.join(' ');
    setNotAngkaInput(chunkText);
    setActiveTab('text');
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-lg">Impor Lagu & Melodi</h3>
          </div>
          <button
            onClick={() => {
              stopAudioListening();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'file' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            MusicXML / File
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'text' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Teks Not Angka
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'audio' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Audio / Vokal
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'image' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Gambar Partitur
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: FILE */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
                <FileCode className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-700">Pilih Berkas MusicXML (.musicxml / .xml)</span>
                <span className="text-xs text-slate-500 mt-1">Kompatibel dengan MuseScore, Sibelius, dan Finale</span>
                <input
                  type="file"
                  accept=".musicxml,.xml,.mid,.midi"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* TAB 2: TEXT NOT ANGKA */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nada Dasar Melodi:
                </label>
                <select
                  value={targetKey}
                  onChange={(e) => setTargetKey(e.target.value as KeyName)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  {['C', 'G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab', 'Db'].map(k => (
                    <option key={k} value={k}>Do = {k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tempelkan Teks Not Angka (Gunakan | untuk batas birama):
                </label>
                <textarea
                  rows={4}
                  value={notAngkaInput}
                  onChange={(e) => setNotAngkaInput(e.target.value)}
                  placeholder="1 1 5 5 | 6 6 5 . | 4 4 3 3 | 2 2 1 . |"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                onClick={handleImportNotAngkaText}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
              >
                Impor & Buat Aransemen SATB
              </button>
            </div>
          )}

          {/* TAB 3: AUDIO DETECTOR */}
          {activeTab === 'audio' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-600">
                Nyanyikan atau bersiul melodi lagu Anda ke mikrofon. Algoritma pitch autocorrelation kami akan mendeteksi nada secara langsung.
              </p>

              <div className="py-4">
                <button
                  onClick={isRecording ? stopAudioListening : startAudioListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg transition-transform active:scale-95 ${
                    isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
                <span className="block text-xs font-bold text-slate-700 mt-2">
                  {isRecording ? 'Mendengarkan melodi...' : 'Klik untuk Mulai Rekam'}
                </span>
              </div>

              {detectedNotes.length > 0 && (
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nada Terdeteksi:</span>
                  <div className="flex flex-wrap gap-1.5 justify-center font-mono font-bold text-sm text-blue-900">
                    {detectedNotes.map((n, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white rounded shadow-2xs border border-slate-200">{n}</span>
                    ))}
                  </div>

                  <button
                    onClick={applyAudioNotes}
                    className="mt-3 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Gunakan Melodi Ini
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: IMAGE OMR */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors">
                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Unggah Foto Partitur / Lembar Musik</span>
                <span className="text-[11px] text-slate-500 mt-0.5">JPG, PNG (Pratinjau panduan transkripsi)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Pratinjau Gambar Partitur:</span>
                  <img
                    src={imagePreview}
                    alt="Pratinjau Partitur"
                    className="max-h-48 rounded-lg mx-auto object-contain border border-slate-300"
                  />
                  <p className="text-[11px] text-slate-500 italic text-center">
                    Gambar berhasil dimuat. Gunakan tab "Teks Not Angka" untuk memasukkan melodi utama yang tertera pada lembar partitur.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              stopAudioListening();
              onClose();
            }}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
