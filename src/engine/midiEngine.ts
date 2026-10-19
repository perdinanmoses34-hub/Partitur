/**
 * SATB Composer Studio - Standard MIDI File (SMF Format 1) Engine
 * Generates and imports multi-track Standard MIDI Files (.mid).
 * 4 discrete tracks: Soprano (ch 0), Alto (ch 1), Tenor (ch 2), Bass (ch 3).
 */

import { SATBScore, VoicePart } from '../types/music';
import { pitchToMidi } from './musicTheory';

/**
 * Write a 16-bit big endian integer
 */
function write16(arr: number[], value: number): void {
  arr.push((value >> 8) & 0xff);
  arr.push(value & 0xff);
}

/**
 * Write a 32-bit big endian integer
 */
function write32(arr: number[], value: number): void {
  arr.push((value >> 24) & 0xff);
  arr.push((value >> 16) & 0xff);
  arr.push((value >> 8) & 0xff);
  arr.push(value & 0xff);
}

/**
 * Write Variable-Length Quantity (VLQ) for MIDI delta times
 */
function writeVLQ(arr: number[], value: number): void {
  const buffer: number[] = [];
  buffer.push(value & 0x7f);
  while ((value >>= 7)) {
    buffer.push((value & 0x7f) | 0x80);
  }
  for (let i = buffer.length - 1; i >= 0; i--) {
    arr.push(buffer[i]);
  }
}

/**
 * Generate binary array of Standard MIDI File (Format 1)
 */
export function generateMidiBlob(score: SATBScore): Blob {
  const ppq = 480; // Pulses (ticks) per quarter note
  const tempoBpm = score.metadata.tempoBpm || 84;
  const microsecondsPerBeat = Math.round(60000000 / tempoBpm);

  const bytes: number[] = [];

  // 1. MThd Header Chunk
  // 'MThd'
  bytes.push(0x4d, 0x54, 0x68, 0x64);
  write32(bytes, 6); // Header length = 6
  write16(bytes, 1); // Format 1: Multi-track
  write16(bytes, 5); // 5 tracks: 1 Tempo/Conductor track + 4 Voice tracks
  write16(bytes, ppq); // Division: ticks per quarter note

  // 2. Track 0: Conductor / Tempo & Time Signature
  const condTrack: number[] = [];
  // Track name: "Conductor / SATB Studio"
  writeVLQ(condTrack, 0); // delta-time = 0
  condTrack.push(0xff, 0x03, 11);
  for (const c of 'SATB Studio') condTrack.push(c.charCodeAt(0));

  // Time Signature Event: FF 58 04 nn dd cc bb
  const tsNum = score.metadata.timeSignature.numerator || 4;
  const tsDen = score.metadata.timeSignature.denominator || 4;
  const denExp = Math.round(Math.log2(tsDen));
  writeVLQ(condTrack, 0);
  condTrack.push(0xff, 0x58, 0x04, tsNum, denExp, 24, 8);

  // Set Tempo Event: FF 51 03 tttttt
  writeVLQ(condTrack, 0);
  condTrack.push(0xff, 0x51, 0x03);
  condTrack.push((microsecondsPerBeat >> 16) & 0xff);
  condTrack.push((microsecondsPerBeat >> 8) & 0xff);
  condTrack.push(microsecondsPerBeat & 0xff);

  // End of Track Event: FF 2F 00
  writeVLQ(condTrack, 0);
  condTrack.push(0xff, 0x2f, 0x00);

  // Write conductor track chunk
  bytes.push(0x4d, 0x54, 0x72, 0x6b); // 'MTrk'
  write32(bytes, condTrack.length);
  bytes.push(...condTrack);

  // 3. Voice Tracks
  const voicesConfig: { voice: VoicePart; name: string; channel: number; program: number }[] = [
    { voice: 'soprano', name: 'Soprano', channel: 0, program: 52 }, // Choir Aahs
    { voice: 'alto',    name: 'Alto',    channel: 1, program: 52 },
    { voice: 'tenor',   name: 'Tenor',   channel: 2, program: 52 },
    { voice: 'bass',    name: 'Bass',    channel: 3, program: 52 },
  ];

  voicesConfig.forEach(({ voice, name, channel, program }) => {
    const trackBytes: number[] = [];

    // Track Name Meta Event
    writeVLQ(trackBytes, 0);
    trackBytes.push(0xff, 0x03, name.length);
    for (const c of name) trackBytes.push(c.charCodeAt(0));

    // Program Change: 0xC0 | channel, program
    writeVLQ(trackBytes, 0);
    trackBytes.push(0xc0 | channel, program);

    // Collect all note events
    let currentTick = 0;
    interface MidiEvent {
      tick: number;
      type: 'on' | 'off';
      note: number;
      velocity: number;
    }
    const events: MidiEvent[] = [];

    score.measures.forEach(measure => {
      const notes = measure.notes[voice] || [];
      notes.forEach(note => {
        const durationTicks = Math.round((note.durationBeats || 1) * ppq);

        if (!note.isRest && note.pitch) {
          const midiPitch = pitchToMidi(note.pitch);
          events.push({
            tick: currentTick,
            type: 'on',
            note: midiPitch,
            velocity: 96,
          });
          events.push({
            tick: currentTick + durationTicks,
            type: 'off',
            note: midiPitch,
            velocity: 64,
          });
        }

        currentTick += durationTicks;
      });
    });

    // Sort events by tick (Note-offs before Note-ons at same tick)
    events.sort((a, b) => {
      if (a.tick !== b.tick) return a.tick - b.tick;
      if (a.type === 'off' && b.type === 'on') return -1;
      if (a.type === 'on' && b.type === 'off') return 1;
      return 0;
    });

    let lastTick = 0;
    events.forEach(ev => {
      const delta = ev.tick - lastTick;
      writeVLQ(trackBytes, delta);
      if (ev.type === 'on') {
        trackBytes.push(0x90 | channel, ev.note, ev.velocity);
      } else {
        trackBytes.push(0x80 | channel, ev.note, 0);
      }
      lastTick = ev.tick;
    });

    // End of Track Event
    writeVLQ(trackBytes, 0);
    trackBytes.push(0xff, 0x2f, 0x00);

    // Write chunk header
    bytes.push(0x4d, 0x54, 0x72, 0x6b);
    write32(bytes, trackBytes.length);
    bytes.push(...trackBytes);
  });

  return new Blob([new Uint8Array(bytes)], { type: 'audio/midi' });
}

/**
 * Trigger download of generated MIDI file
 */
export function downloadMidiFile(score: SATBScore): void {
  const blob = generateMidiBlob(score);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${score.metadata.title.replace(/\s+/g, '_')}_SATB.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
