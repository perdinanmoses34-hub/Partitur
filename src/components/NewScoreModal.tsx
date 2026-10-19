/**
 * SATB Composer Studio - New Score & SATB Generator Modal
 * Form for creating new choral scores from Not Angka text, melody note names,
 * or automatic generation from scratch with style and key presets.
 */

import React, { useState } from 'react';
import { X, Sparkles, Wand2, Music, Check, Info } from 'lucide-react';
import {
  ArrangementStyle,
  KeyName,
  SATBScore,
  TimeSignature
} from '../types/music';
import { DEFAULT_VOCAL_RANGES } from '../engine/musicTheory';
import { parseNotAngkaText, parseNoteNamesText } from '../engine/parsers';
import { generateNewSATBComposition, harmonizeSATB } from '../engine/satbArranger';

interface NewScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateScore: (score: SATBScore) => void;
}

export const NewScoreModal: React.FC<NewScoreModalProps> = ({
  isOpen,
  onClose,
  onCreateScore,
}) => {
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [arranger, setArranger] = useState('');
  const [key, setKey] = useState<KeyName>('G');
  const [meter, setMeter] = useState<string>('4/4');
  const [tempoBpm, setTempoBpm] = useState<number>(84);
  const [tempoMarking, setTempoMarking] = useState<string>('Andante');
  const [arrangementStyle, setArrangementStyle] = useState<ArrangementStyle>('hymn_satb');
  
  // Melody source
  const [sourceType, setSourceType] = useState<'not_angka' | 'composition' | 'note_names'>('not_angka');
  const [melodyText, setMelodyText] = useState('1 1 5 5 | 6 6 5 . | 4 4 3 3 | 2 2 1 . |');
  const [chordsText, setChordsText] = useState('G | G | C | G |');
  const [lyricsText, setLyricsText] = useState('Di mu-ka Tu-han ku ber-su-jud');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const tempoPresets = [
    { label: 'Largo', bpm: 52 },
    { label: 'Adagio', bpm: 64 },
    { label: 'Andante', bpm: 78 },
    { label: 'Moderato', bpm: 96 },
    { label: 'Allegro', bpm: 120 },
    { label: 'Vivace', bpm: 140 },
  ];

  const handleTempoPreset = (preset: { label: string; bpm: number }) => {
    setTempoBpm(preset.bpm);
    setTempoMarking(preset.label);
  };

  const parseTimeSignature = (str: string): TimeSignature => {
    const parts = str.split('/');
    return {
      numerator: parseInt(parts[0], 10) || 4,
      denominator: parseInt(parts[1], 10) || 4,
    };
  };

  const handleGenerate = () => {
    setErrorMessage('');
    const scoreTitle = title.trim() || (sourceType === 'composition' ? 'Komposisi Rohani Baru' : 'Partitur SATB Baru');
    const scoreComposer = composer.trim() || (sourceType === 'composition' ? 'Komposisi Baru' : 'Anonim');
    const scoreArranger = arranger.trim() || 'SATB Studio';
    const timeSig = parseTimeSignature(meter);

    let generatedMeasures = [];

    if (sourceType === 'composition') {
      // Automatic 8-measure hymn composition
      generatedMeasures = generateNewSATBComposition(
        key,
        timeSig,
        arrangementStyle,
        tempoBpm,
        8
      );
    } else {
      if (!melodyText.trim()) {
        setErrorMessage('Silakan masukkan melodi Not Angka atau pilih "Buat Komposisi SATB Baru".');
        return;
      }

      // Parse user melody input
      const parsedMeasures = sourceType === 'not_angka'
        ? parseNotAngkaText(melodyText, key, timeSig)
        : parseNoteNamesText(melodyText, key, timeSig);

      if (parsedMeasures.length === 0) {
        setErrorMessage('Melodi yang dimasukkan tidak dapat dikenali. Periksa format Not Angka Anda.');
        return;
      }

      // Assign user chords if provided
      if (chordsText.trim()) {
        const chordTokens = chordsText.split('|').map(c => c.trim()).filter(Boolean);
        parsedMeasures.forEach((m, idx) => {
          if (chordTokens[idx]) {
            m.chord = chordTokens[idx];
          }
        });
      }

      // Assign lyrics if provided
      if (lyricsText.trim()) {
        const lyricWords = lyricsText.split(/[\s-]+/).filter(Boolean);
        let wordIdx = 0;
        parsedMeasures.forEach(m => {
          m.notes.soprano.forEach(note => {
            if (!note.isRest && wordIdx < lyricWords.length) {
              note.lyric = lyricWords[wordIdx++];
            }
          });
        });
      }

      // Generate 4-part SATB harmony
      generatedMeasures = harmonizeSATB(
        parsedMeasures,
        key,
        arrangementStyle,
        'soprano',
        DEFAULT_VOCAL_RANGES
      );
    }

    const newScore: SATBScore = {
      metadata: {
        id: `score_${Date.now()}`,
        title: scoreTitle,
        composer: scoreComposer,
        arranger: scoreArranger,
        key,
        originalKey: key,
        timeSignature: timeSig,
        tempoBpm,
        tempoMarking,
        arrangementStyle,
        melodyVoice: 'soprano',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      vocalRanges: DEFAULT_VOCAL_RANGES,
      measures: generatedMeasures,
    };

    onCreateScore(newScore);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-lg">Buat Partitur Paduan Suara SATB Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-slate-800">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Judul Lagu *
              </label>
              <input
                type="text"
                placeholder="Contoh: Kutahu Siapa Yang Kupegang"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pencipta Lagu
              </label>
              <input
                type="text"
                placeholder="Nama Komponis"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Arranger (Pengaransemen)
              </label>
              <input
                type="text"
                placeholder="Nama Arranger"
                value={arranger}
                onChange={(e) => setArranger(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nada Dasar (Do = )
              </label>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value as KeyName)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {['C', 'G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'F#', 'Am', 'Em', 'Dm'].map(k => (
                  <option key={k} value={k}>{k} {k.endsWith('m') ? 'Minor' : 'Mayor'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Meter, Tempo & Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Birama (Time Signature)
              </label>
              <select
                value={meter}
                onChange={(e) => setMeter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              >
                <option value="4/4">4/4 (Common Time)</option>
                <option value="3/4">3/4 (Waltz / Andante)</option>
                <option value="2/4">2/4 (Mars / Hymn)</option>
                <option value="6/8">6/8 (Compound Duple)</option>
                <option value="9/8">9/8</option>
                <option value="12/8">12/8</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tempo (BPM: {tempoBpm})
              </label>
              <div className="flex space-x-1 mb-1.5">
                {tempoPresets.slice(0, 4).map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleTempoPreset(p)}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-semibold border ${
                      tempoMarking === p.label ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="50"
                max="160"
                value={tempoBpm}
                onChange={(e) => setTempoBpm(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Gaya Aransemen SATB
              </label>
              <select
                value={arrangementStyle}
                onChange={(e) => setArrangementStyle(e.target.value as ArrangementStyle)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="church_traditional">Paduan Suara Gerejawi Tradisional</option>
                <option value="hymn_satb">Hymn SATB (Bach/Hymnal)</option>
                <option value="classical">Paduan Suara Klasik</option>
                <option value="modern_praise">Paduan Suara Modern / Pujian</option>
                <option value="simple_congregation">Aransemen Sederhana untuk Jemaat</option>
                <option value="advanced_choral">Aransemen Tingkat Lanjut</option>
              </select>
            </div>
          </div>

          {/* Melody Source Selection */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Sumber Melodi:
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSourceType('not_angka')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border flex flex-col items-center justify-center transition-all ${
                  sourceType === 'not_angka'
                    ? 'bg-blue-50 text-blue-900 border-blue-500 ring-2 ring-blue-200'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>Input Not Angka</span>
                <span className="text-[10px] font-normal text-slate-500">Ketik angka 1 2 3 ...</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('composition')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border flex flex-col items-center justify-center transition-all ${
                  sourceType === 'composition'
                    ? 'bg-blue-50 text-blue-900 border-blue-500 ring-2 ring-blue-200'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>Komposisi SATB Baru</span>
                <span className="text-[10px] font-normal text-slate-500">Otomatis dari Nada Dasar</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('note_names')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border flex flex-col items-center justify-center transition-all ${
                  sourceType === 'note_names'
                    ? 'bg-blue-50 text-blue-900 border-blue-500 ring-2 ring-blue-200'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>Nama Nada</span>
                <span className="text-[10px] font-normal text-slate-500">C4 D4 E4 G4 ...</span>
              </button>
            </div>

            {sourceType !== 'composition' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-700">
                      {sourceType === 'not_angka' ? 'Teks Not Angka (Gunakan tanda | untuk batas birama):' : 'Nama Nada (Contoh: C4 D4 E4 G4 | C5 .):'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">1=Do, 0=Rest, .=Panjang</span>
                  </div>
                  <textarea
                    rows={3}
                    value={melodyText}
                    onChange={(e) => setMelodyText(e.target.value)}
                    placeholder="1 1 5 5 | 6 6 5 . | 4 4 3 3 | 2 2 1 . |"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Progresi Akor (Opsional, pisahkan dengan |):
                    </label>
                    <input
                      type="text"
                      placeholder="G | G | C | G |"
                      value={chordsText}
                      onChange={(e) => setChordsText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lirik Lagu (Opsional, pisahkan suku kata):
                    </label>
                    <input
                      type="text"
                      placeholder="Di mu-ka Tu-han ku ber-su-jud"
                      value={lyricsText}
                      onChange={(e) => setLyricsText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {sourceType === 'composition' && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-start space-x-2 text-teal-900 text-xs">
                <Info className="w-4 h-4 shrink-0 text-teal-700 mt-0.5" />
                <p>
                  Aplikasi akan merancang komposisi paduan suara empat suara (Sopran, Alto, Tenor, Bass) baru sepanjang 8 birama secara harmonis sesuai tangga nada {key} {key.endsWith('m') ? 'Minor' : 'Mayor'} dan birama {meter}.
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-transform active:scale-95"
            >
              <Wand2 className="w-4 h-4" />
              <span>BUAT PARTITUR SATB</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
