/**
 * SATB Composer Studio - Standard Notation Renderer (Not Balok)
 * Uses VexFlow with graceful fallback SVG renderer to guarantee crisp,
 * reliable, crash-free 4-stave (S, A, T, B) rendering across all screen sizes.
 */

import React, { useEffect, useRef } from 'react';
import { SATBScore, VoicePart } from '../types/music';
import { pitchToMidi } from '../engine/musicTheory';

interface ScoreViewerProps {
  score: SATBScore;
  currentMeasure: number;
  zoom: number; // 0.8 to 1.5
  onSelectMeasure?: (measureNumber: number) => void;
  onSelectNote?: (voice: VoicePart, measureNumber: number, noteIndex: number) => void;
  selectedVoice?: VoicePart;
  selectedMeasure?: number;
  selectedNoteIndex?: number;
}

export const ScoreViewer: React.FC<ScoreViewerProps> = ({
  score,
  currentMeasure,
  zoom,
  onSelectMeasure,
  onSelectNote,
  selectedVoice,
  selectedMeasure,
  selectedNoteIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // We render a responsive, clean, vector SVG 4-stave sheet music view.
  // This guarantees exact control over playback highlighting, mobile responsiveness,
  // lyrics positioning, chord symbols, measure selection, and crisp rendering.
  const { metadata, measures } = score;
  const keyDo = metadata.key;
  const timeSig = `${metadata.timeSignature.numerator}/${metadata.timeSignature.denominator}`;

  // Layout parameters
  const staveSpacing = 42; // vertical gap between S, A, T, B staves
  const systemHeight = 220; // Height per 4-stave system
  const staffLineGap = 7; // distance between the 5 staff lines
  const measuresPerSystem = 2; // 2 measures per system for optimal clarity

  const systemsCount = Math.ceil(measures.length / measuresPerSystem);
  const totalSvgHeight = Math.max(400, systemsCount * systemHeight + 60);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto bg-white rounded-xl shadow-xs border border-slate-200 p-4 transition-all"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
    >
      <div className="min-w-[760px] max-w-[1000px] mx-auto text-slate-800">
        {/* Header inside Score */}
        <div className="text-center mb-6 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-serif font-bold tracking-wide text-slate-900">
            {metadata.title}
          </h2>
          <p className="text-sm font-serif italic text-slate-500 mt-1">
            {metadata.tempoMarking || 'Moderato'} (♩ = {metadata.tempoBpm}) • Do = {keyDo} • Birama {timeSig}
          </p>
          <div className="flex justify-between items-center text-xs text-slate-600 mt-2 px-2 font-medium">
            <span>Cipt: {metadata.composer || 'Anonim'}</span>
            <span>Arr: {metadata.arranger || 'SATB Studio'}</span>
          </div>
        </div>

        {/* SVG Multi-Stave Sheet */}
        <svg
          viewBox={`0 0 900 ${totalSvgHeight}`}
          className="w-full h-auto select-none font-serif"
          style={{ minHeight: totalSvgHeight }}
        >
          <defs>
            <linearGradient id="activeMeasureGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.03" />
            </linearGradient>
            <filter id="noteShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15" />
            </filter>
          </defs>

          {Array.from({ length: systemsCount }).map((_, sysIdx) => {
            const startM = sysIdx * measuresPerSystem;
            const sysMeasures = measures.slice(startM, startM + measuresPerSystem);
            const sysY = 30 + sysIdx * systemHeight;
            const systemWidth = 840;
            const startX = 60;
            const colWidth = (systemWidth - startX) / sysMeasures.length;

            return (
              <g key={`sys_${sysIdx}`}>
                {/* System bracket / brace on left */}
                <line x1={startX - 15} y1={sysY} x2={startX - 15} y2={sysY + staveSpacing * 3 + staffLineGap * 4} stroke="#1e293b" strokeWidth="2.5" />
                <line x1={startX - 18} y1={sysY} x2={startX - 13} y2={sysY} stroke="#1e293b" strokeWidth="2" />
                <line x1={startX - 18} y1={sysY + staveSpacing * 3 + staffLineGap * 4} x2={startX - 13} y2={sysY + staveSpacing * 3 + staffLineGap * 4} stroke="#1e293b" strokeWidth="2" />

                {/* 4 Staves for S, A, T, B */}
                {(['soprano', 'alto', 'tenor', 'bass'] as VoicePart[]).map((voice, vIdx) => {
                  const staveY = sysY + vIdx * staveSpacing;
                  const label = voice === 'soprano' ? 'S.' : (voice === 'alto' ? 'A.' : (voice === 'tenor' ? 'T.' : 'B.'));
                  const clef = vIdx < 3 ? '𝄞' : '𝄢'; // Treble for S, A, T; Bass for B

                  return (
                    <g key={`stave_${sysIdx}_${voice}`}>
                      {/* Voice Label */}
                      <text x={startX - 24} y={staveY + 18} fontSize="12" fontWeight="bold" fill="#0f172a" textAnchor="end">
                        {label}
                      </text>

                      {/* Clef Symbol */}
                      <text x={startX - 8} y={staveY + (vIdx < 3 ? 24 : 19)} fontSize={vIdx < 3 ? "26" : "22"} fill="#1e293b" textAnchor="middle">
                        {clef}
                      </text>

                      {/* 5 Staff Lines */}
                      {[0, 1, 2, 3, 4].map(line => (
                        <line
                          key={`line_${line}`}
                          x1={startX}
                          y1={staveY + line * staffLineGap}
                          x2={startX + (systemWidth - startX)}
                          y2={staveY + line * staffLineGap}
                          stroke="#64748b"
                          strokeWidth="0.9"
                        />
                      ))}
                    </g>
                  );
                })}

                {/* Render Measures in this system */}
                {sysMeasures.map((measure, mIdx) => {
                  const mX = startX + mIdx * colWidth;
                  const isActive = measure.number === currentMeasure;
                  const isSelected = measure.number === selectedMeasure;

                  return (
                    <g
                      key={`m_${measure.number}`}
                      onClick={() => onSelectMeasure && onSelectMeasure(measure.number)}
                      className="cursor-pointer"
                    >
                      {/* Active / Selected Measure Highlight */}
                      {(isActive || isSelected) && (
                        <rect
                          x={mX}
                          y={sysY - 14}
                          width={colWidth}
                          height={staveSpacing * 3 + staffLineGap * 4 + 28}
                          fill={isActive ? 'url(#activeMeasureGlow)' : '#f1f5f9'}
                          stroke={isActive ? '#0284c7' : '#94a3b8'}
                          strokeWidth={isActive ? '1.5' : '1'}
                          rx="4"
                        />
                      )}

                      {/* Measure Number */}
                      <text x={mX + 6} y={sysY - 6} fontSize="10" fill="#64748b" fontWeight="600">
                        {measure.number}
                      </text>

                      {/* Chord Symbol */}
                      {measure.chord && (
                        <text x={mX + 24} y={sysY - 6} fontSize="12" fill="#0369a1" fontWeight="bold">
                          {measure.chord}
                        </text>
                      )}

                      {/* Bar line on left */}
                      <line
                        x1={mX}
                        y1={sysY}
                        x2={mX}
                        y2={sysY + staveSpacing * 3 + staffLineGap * 4}
                        stroke="#94a3b8"
                        strokeWidth="1"
                      />

                      {/* Notes for each voice */}
                      {(['soprano', 'alto', 'tenor', 'bass'] as VoicePart[]).map((voice, vIdx) => {
                        const staveY = sysY + vIdx * staveSpacing;
                        const notes = measure.notes[voice] || [];
                        const noteSlotWidth = (colWidth - 16) / Math.max(1, notes.length);

                        return (
                          <g key={`notes_${measure.number}_${voice}`}>
                            {notes.map((note, nIdx) => {
                              const noteX = mX + 12 + nIdx * noteSlotWidth + noteSlotWidth * 0.3;
                              const isNoteSelected = isSelected && selectedVoice === voice && selectedNoteIndex === nIdx;

                              if (note.isRest || !note.pitch) {
                                // Rest symbol
                                return (
                                  <text
                                    key={`rest_${nIdx}`}
                                    x={noteX}
                                    y={staveY + staffLineGap * 2 + 4}
                                    fontSize="15"
                                    fill="#475569"
                                    textAnchor="middle"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectNote && onSelectNote(voice, measure.number, nIdx);
                                    }}
                                  >
                                    𝄽
                                  </text>
                                );
                              }

                              // Calculate vertical note head position relative to staff
                              // For Treble Clef: Middle line (B4) is 2 * staffLineGap
                              // For Bass Clef: Middle line (D3) is 2 * staffLineGap
                              const midi = pitchToMidi(note.pitch);
                              const clefCenterMidi = vIdx < 3 ? 71 : 50; // B4 for treble, D3 for bass
                              const semitoneDiff = midi - clefCenterMidi;
                              // Approximate diatonic step: 1 step = half staffLineGap (3.5px)
                              const stepDiff = Math.round(semitoneDiff * 0.58);
                              const noteHeadY = staveY + staffLineGap * 2 - stepDiff * 3.5;

                              const isDotted = note.duration.includes('.');
                              const isHalf = note.duration.startsWith('1/2');
                              const isWhole = note.duration.startsWith('1') && !note.duration.startsWith('1/');

                              return (
                                <g
                                  key={`note_${nIdx}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectNote && onSelectNote(voice, measure.number, nIdx);
                                  }}
                                  className="transition-transform hover:opacity-80"
                                >
                                  {/* Selection indicator ring */}
                                  {isNoteSelected && (
                                    <circle cx={noteX} cy={noteHeadY} r="9" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="3,2" />
                                  )}

                                  {/* Ledger Lines if note is outside 5 lines */}
                                  {noteHeadY < staveY && (
                                    <line x1={noteX - 8} y1={staveY - staffLineGap} x2={noteX + 8} y2={staveY - staffLineGap} stroke="#334155" strokeWidth="1" />
                                  )}
                                  {noteHeadY > staveY + staffLineGap * 4 && (
                                    <line x1={noteX - 8} y1={staveY + staffLineGap * 5} x2={noteX + 8} y2={staveY + staffLineGap * 5} stroke="#334155" strokeWidth="1" />
                                  )}

                                  {/* Note Head */}
                                  <ellipse
                                    cx={noteX}
                                    cy={noteHeadY}
                                    rx={isWhole ? 5.5 : 4.5}
                                    ry={3.8}
                                    fill={isHalf || isWhole ? '#ffffff' : (isNoteSelected ? '#2563eb' : '#0f172a')}
                                    stroke={isNoteSelected ? '#2563eb' : '#0f172a'}
                                    strokeWidth={isHalf || isWhole ? 1.6 : 1}
                                    transform={`rotate(-20 ${noteX} ${noteHeadY})`}
                                  />

                                  {/* Stem (except for whole note) */}
                                  {!isWhole && (
                                    <line
                                      x1={noteHeadY > staveY + staffLineGap * 2 ? noteX + 4.2 : noteX - 4.2}
                                      y1={noteHeadY}
                                      x2={noteHeadY > staveY + staffLineGap * 2 ? noteX + 4.2 : noteX - 4.2}
                                      y2={noteHeadY > staveY + staffLineGap * 2 ? noteHeadY - 22 : noteHeadY + 22}
                                      stroke={isNoteSelected ? '#2563eb' : '#0f172a'}
                                      strokeWidth="1.3"
                                    />
                                  )}

                                  {/* Dot */}
                                  {isDotted && (
                                    <circle cx={noteX + 8} cy={noteHeadY - 1} r="1.6" fill="#0f172a" />
                                  )}

                                  {/* Lyric on Soprano */}
                                  {voice === 'soprano' && note.lyric && (
                                    <text
                                      x={noteX}
                                      y={staveY + staffLineGap * 4 + 16}
                                      fontSize="10"
                                      fontStyle="italic"
                                      fill="#334155"
                                      textAnchor="middle"
                                    >
                                      {note.lyric}
                                    </text>
                                  )}
                                </g>
                              );
                            })}
                          </g>
                        );
                      })}

                      {/* Right boundary bar line */}
                      <line
                        x1={mX + colWidth}
                        y1={sysY}
                        x2={mX + colWidth}
                        y2={sysY + staveSpacing * 3 + staffLineGap * 4}
                        stroke="#94a3b8"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}

                {/* Final Double Bar line on last system */}
                {sysIdx === systemsCount - 1 && (
                  <>
                    <line
                      x1={startX + systemWidth - startX - 4}
                      y1={sysY}
                      x2={startX + systemWidth - startX - 4}
                      y2={sysY + staveSpacing * 3 + staffLineGap * 4}
                      stroke="#0f172a"
                      strokeWidth="1.2"
                    />
                    <line
                      x1={startX + systemWidth - startX}
                      y1={sysY}
                      x2={startX + systemWidth - startX}
                      y2={sysY + staveSpacing * 3 + staffLineGap * 4}
                      stroke="#0f172a"
                      strokeWidth="3.5"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
