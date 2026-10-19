/**
 * SATB Composer Studio - Score & Note Inspector Panel
 * Allows detailed editing of selected notes (pitch, octave, accidentals, duration, rests, lyrics)
 * and measure chords, with vocal range statistics.
 */

import React from 'react';
import {
  Edit3,
  Sliders,
  Type,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Hash
} from 'lucide-react';
import { NoteDuration, NotePitch, SATBScore, VoicePart } from '../types/music';
import { midiToNotAngka, pitchToMidi, pitchToString } from '../engine/musicTheory';

interface ScoreInspectorProps {
  score: SATBScore;
  selectedVoice?: VoicePart;
  selectedMeasure?: number;
  selectedNoteIndex?: number;
  onUpdateScore: (newScore: SATBScore) => void;
}

export const ScoreInspector: React.FC<ScoreInspectorProps> = ({
  score,
  selectedVoice = 'soprano',
  selectedMeasure = 1,
  selectedNoteIndex = 0,
  onUpdateScore,
}) => {
  const currentMeasureData = score.measures.find(m => m.number === selectedMeasure);
  const voiceNotes = currentMeasureData ? currentMeasureData.notes[selectedVoice] || [] : [];
  const selectedNote = voiceNotes[selectedNoteIndex];

  // Helper to update selected note
  const updateNote = (updater: (prev: typeof selectedNote) => typeof selectedNote) => {
    if (!currentMeasureData || !selectedNote) return;

    const newScore: SATBScore = JSON.parse(JSON.stringify(score));
    const targetM = newScore.measures.find(m => m.number === selectedMeasure);
    if (!targetM) return;

    const note = targetM.notes[selectedVoice][selectedNoteIndex];
    if (!note) return;

    const updated = updater(note);
    // Recalculate solfege
    if (!updated.isRest && updated.pitch) {
      const midi = pitchToMidi(updated.pitch);
      updated.solfege = midiToNotAngka(midi, score.metadata.key).display;
    }

    targetM.notes[selectedVoice][selectedNoteIndex] = updated;
    onUpdateScore(newScore);
  };

  const handlePitchStepChange = (step: NotePitch['step']) => {
    updateNote(n => ({
      ...n,
      isRest: false,
      pitch: {
        step,
        alter: n.pitch?.alter || 0,
        octave: n.pitch?.octave || 4,
      }
    }));
  };

  const handleAlterChange = (alter: number) => {
    updateNote(n => ({
      ...n,
      isRest: false,
      pitch: {
        step: n.pitch?.step || 'C',
        alter,
        octave: n.pitch?.octave || 4,
      }
    }));
  };

  const handleOctaveChange = (octave: number) => {
    updateNote(n => ({
      ...n,
      isRest: false,
      pitch: {
        step: n.pitch?.step || 'C',
        alter: n.pitch?.alter || 0,
        octave,
      }
    }));
  };

  const handleDurationChange = (duration: NoteDuration, durationBeats: number) => {
    updateNote(n => ({
      ...n,
      duration,
      durationBeats,
      isDotted: duration.includes('.'),
    }));
  };

  const handleToggleRest = () => {
    updateNote(n => ({
      ...n,
      isRest: !n.isRest,
      solfege: !n.isRest ? '0' : '1',
    }));
  };

  const handleLyricChange = (lyric: string) => {
    updateNote(n => ({
      ...n,
      lyric,
    }));
  };

  const handleChordChange = (chord: string) => {
    if (!currentMeasureData) return;
    const newScore: SATBScore = JSON.parse(JSON.stringify(score));
    const targetM = newScore.measures.find(m => m.number === selectedMeasure);
    if (targetM) {
      targetM.chord = chord.trim();
      onUpdateScore(newScore);
    }
  };

  const handleAddNoteToMeasure = () => {
    if (!currentMeasureData) return;
    const newScore: SATBScore = JSON.parse(JSON.stringify(score));
    const targetM = newScore.measures.find(m => m.number === selectedMeasure);
    if (targetM) {
      targetM.notes[selectedVoice].push({
        id: `${selectedVoice[0].toUpperCase()}_${selectedMeasure}_${targetM.notes[selectedVoice].length}`,
        isRest: false,
        pitch: { step: 'C', octave: selectedVoice === 'bass' ? 3 : 4 },
        duration: '1/4',
        durationBeats: 1,
        solfege: '1',
      });
      onUpdateScore(newScore);
    }
  };

  const handleDeleteSelectedNote = () => {
    if (!currentMeasureData || voiceNotes.length <= 1) return;
    const newScore: SATBScore = JSON.parse(JSON.stringify(score));
    const targetM = newScore.measures.find(m => m.number === selectedMeasure);
    if (targetM) {
      targetM.notes[selectedVoice].splice(selectedNoteIndex, 1);
      onUpdateScore(newScore);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-5 text-slate-800">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h4 className="font-bold text-sm text-slate-900">Inspektor & Editor Nada</h4>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md uppercase">
          {selectedVoice} • B.{selectedMeasure}
        </span>
      </div>

      {selectedNote ? (
        <div className="space-y-4">
          {/* Note Pitch & Solfege Badge */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Nada & Solfege</span>
              <div className="text-xl font-black font-mono text-slate-900">
                {selectedNote.isRest ? 'Istirahat (0)' : (selectedNote.pitch ? `${pitchToString(selectedNote.pitch)} (${selectedNote.solfege})` : '-')}
              </div>
            </div>
            <button
              onClick={handleToggleRest}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                selectedNote.isRest
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {selectedNote.isRest ? 'Bukan Rest' : 'Set Rest (0)'}
            </button>
          </div>

          {/* Pitch Editor Buttons */}
          {!selectedNote.isRest && selectedNote.pitch && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Pilih Nada (Step)
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {(['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NotePitch['step'][]).map(s => (
                    <button
                      key={s}
                      onClick={() => handlePitchStepChange(s)}
                      className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                        selectedNote.pitch?.step === s
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accidental & Octave */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Aksidental
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { val: -1, label: '♭ Mol' },
                      { val: 0, label: '♮ Pug' },
                      { val: 1, label: '♯ Kres' },
                    ].map(acc => (
                      <button
                        key={acc.label}
                        onClick={() => handleAlterChange(acc.val)}
                        className={`py-1 text-xs font-bold rounded border transition-colors ${
                          (selectedNote.pitch?.alter || 0) === acc.val
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Oktaf
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[2, 3, 4, 5].map(oct => (
                      <button
                        key={oct}
                        onClick={() => handleOctaveChange(oct)}
                        className={`py-1 text-xs font-bold rounded border transition-colors ${
                          selectedNote.pitch?.octave === oct
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {oct}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Duration Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Durasi Nada
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { dur: '1' as NoteDuration, beats: 4, label: '𝅝 Penuh (4)' },
                { dur: '1/2' as NoteDuration, beats: 2, label: '𝅗𝅥 ½ (2)' },
                { dur: '1/4' as NoteDuration, beats: 1, label: '𝅘𝅥 ¼ (1)' },
                { dur: '1/8' as NoteDuration, beats: 0.5, label: '𝅘𝅥𝅮 ⅛ (0.5)' },
                { dur: '1/2.' as NoteDuration, beats: 3, label: '𝅗𝅥. (3)' },
                { dur: '1/4.' as NoteDuration, beats: 1.5, label: '𝅘𝅥. (1.5)' },
              ].map(d => (
                <button
                  key={d.dur}
                  onClick={() => handleDurationChange(d.dur, d.beats)}
                  className={`py-1.5 px-1 text-[11px] font-bold rounded border text-center transition-colors ${
                    selectedNote.duration === d.dur
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lyric Syllable */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Suku Kata Lirik
            </label>
            <div className="flex space-x-1.5">
              <input
                type="text"
                placeholder="Contoh: Ma-, -lam, dll."
                value={selectedNote.lyric || ''}
                onChange={(e) => handleLyricChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Note Actions: Delete or Add */}
          <div className="flex space-x-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleAddNoteToMeasure}
              className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Nada</span>
            </button>
            <button
              onClick={handleDeleteSelectedNote}
              disabled={voiceNotes.length <= 1}
              className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Nada</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 text-xs">
          Klik salah satu nada pada partitur untuk mengeditnya.
        </div>
      )}

      {/* Measure Chord Editor */}
      {currentMeasureData && (
        <div className="pt-3 border-t border-slate-200">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Akor Birama {selectedMeasure}
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Contoh: G, C, Am, D7"
              value={currentMeasureData.chord || ''}
              onChange={(e) => handleChordChange(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};
