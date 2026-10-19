/**
 * SATB Composer Studio - MusicXML Engine
 * Generates and parses standard MusicXML 4.0 files for 4-part SATB scores.
 * Compatible with MuseScore, Sibelius, Finale, Dorico.
 */

import { KeyName, Measure, SATBScore, ScoreNote, TimeSignature, VoicePart } from '../types/music';
import { DEFAULT_VOCAL_RANGES, KEYS_INFO, midiToNotAngka, pitchToMidi } from './musicTheory';

/**
 * Generate standard MusicXML 4.0 string for SATB Score
 */
export function exportToMusicXML(score: SATBScore): string {
  const { metadata, measures } = score;
  const keyInfo = KEYS_INFO[metadata.key] || KEYS_INFO['C'];
  const fifths = keyInfo.fifths;
  const beats = metadata.timeSignature.numerator;
  const beatType = metadata.timeSignature.denominator;
  const divisions = 4; // 1 quarter note = 4 divisions (16th note = 1 division)

  const partsConfig: { id: string; name: string; abbr: string; voice: VoicePart; clefSign: string; clefLine: number; clefOctaveChange?: number }[] = [
    { id: 'P1', name: 'Soprano', abbr: 'S.', voice: 'soprano', clefSign: 'G', clefLine: 2 },
    { id: 'P2', name: 'Alto',    abbr: 'A.', voice: 'alto',    clefSign: 'G', clefLine: 2 },
    { id: 'P3', name: 'Tenor',   abbr: 'T.', voice: 'tenor',   clefSign: 'G', clefLine: 2, clefOctaveChange: -1 },
    { id: 'P4', name: 'Bass',    abbr: 'B.', voice: 'bass',    clefSign: 'F', clefLine: 4 },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${escapeXml(metadata.title)}</work-title>
  </work>
  <identification>
    <creator type="composer">${escapeXml(metadata.composer)}</creator>
    <creator type="arranger">${escapeXml(metadata.arranger)}</creator>
    <encoding>
      <software>SATB Composer Studio</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
`;

  partsConfig.forEach(p => {
    xml += `    <score-part id="${p.id}">
      <part-name>${p.name}</part-name>
      <part-abbreviation>${p.abbr}</part-abbreviation>
      <score-instrument id="${p.id}-I1">
        <instrument-name>${p.name} Voice</instrument-name>
      </score-instrument>
    </score-part>\n`;
  });

  xml += `  </part-list>\n`;

  // Render each part
  partsConfig.forEach(p => {
    xml += `  <part id="${p.id}">\n`;

    measures.forEach((measure, mIdx) => {
      xml += `    <measure number="${measure.number}">\n`;

      // Measure 1 attributes: key, time, divisions, clef, tempo
      if (mIdx === 0) {
        xml += `      <attributes>
        <divisions>${divisions}</divisions>
        <key>
          <fifths>${fifths}</fifths>
          <mode>${keyInfo.mode}</mode>
        </key>
        <time>
          <beats>${beats}</beats>
          <beat-type>${beatType}</beat-type>
        </time>
        <clef>
          <sign>${p.clefSign}</sign>
          <line>${p.clefLine}</line>${p.clefOctaveChange ? `\n          <clef-octave-change>${p.clefOctaveChange}</clef-octave-change>` : ''}
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${metadata.tempoBpm}</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="${metadata.tempoBpm}"/>
      </direction>\n`;
      }

      // Chord symbol on Soprano part
      if (p.voice === 'soprano' && measure.chord) {
        xml += `      <harmony>
        <root><root-step>${measure.chord[0]}</root-step></root>
        <kind>${measure.chord.includes('m') ? 'minor' : 'major'}</kind>
      </harmony>\n`;
      }

      const notes = measure.notes[p.voice] || [];
      notes.forEach((note) => {
        const durDivisions = Math.round(note.durationBeats * divisions);
        const typeStr = durationToXmlType(note.duration);

        xml += `      <note>\n`;
        if (note.isRest || !note.pitch) {
          xml += `        <rest/>\n`;
        } else {
          xml += `        <pitch>
          <step>${note.pitch.step}</step>
          ${note.pitch.alter ? `<alter>${note.pitch.alter}</alter>` : ''}
          <octave>${note.pitch.octave}</octave>
        </pitch>\n`;
        }

        xml += `        <duration>${durDivisions}</duration>
        <type>${typeStr}</type>${note.duration.includes('.') ? '\n        <dot/>' : ''}\n`;

        if (note.lyric) {
          xml += `        <lyric number="1">
          <text>${escapeXml(note.lyric)}</text>
        </lyric>\n`;
        }

        xml += `      </note>\n`;
      });

      xml += `    </measure>\n`;
    });

    xml += `  </part>\n`;
  });

  xml += `</score-partwise>\n`;
  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function durationToXmlType(duration: string): string {
  if (duration.startsWith('1/16')) return '16th';
  if (duration.startsWith('1/8')) return 'eighth';
  if (duration.startsWith('1/4')) return 'quarter';
  if (duration.startsWith('1/2')) return 'half';
  if (duration.startsWith('1')) return 'whole';
  return 'quarter';
}

/**
 * Import a MusicXML string into a SATBScore
 */
export function importFromMusicXML(xmlString: string): SATBScore {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  const title = xmlDoc.querySelector('work-title')?.textContent || 'Lagu Impor MusicXML';
  const composer = xmlDoc.querySelector('creator[type="composer"]')?.textContent || 'Anonim';
  const arranger = xmlDoc.querySelector('creator[type="arranger"]')?.textContent || 'SATB Studio';

  let fifths = 0;
  const fifthsEl = xmlDoc.querySelector('fifths');
  if (fifthsEl && fifthsEl.textContent) {
    fifths = parseInt(fifthsEl.textContent, 10);
  }

  // Derive key name from fifths
  const fifthsToKey: Record<number, KeyName> = {
    0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#',
    '-1': 'F', '-2': 'Bb', '-3': 'Eb', '-4': 'Ab', '-5': 'Db', '-6': 'Gb'
  };
  const key: KeyName = fifthsToKey[fifths] || 'C';

  let beats = 4;
  let beatType = 4;
  const beatsEl = xmlDoc.querySelector('time beats');
  const beatTypeEl = xmlDoc.querySelector('time beat-type');
  if (beatsEl && beatsEl.textContent) beats = parseInt(beatsEl.textContent, 10) || 4;
  if (beatTypeEl && beatTypeEl.textContent) beatType = parseInt(beatTypeEl.textContent, 10) || 4;

  let tempoBpm = 84;
  const soundEl = xmlDoc.querySelector('sound[tempo]');
  if (soundEl && soundEl.getAttribute('tempo')) {
    tempoBpm = parseInt(soundEl.getAttribute('tempo')!, 10) || 84;
  }

  const parts = xmlDoc.querySelectorAll('part');
  const measuresMap: Record<number, Measure> = {};

  const voiceKeys: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

  parts.forEach((part, partIdx) => {
    const voice = voiceKeys[partIdx] || 'soprano';
    const measureElements = part.querySelectorAll('measure');

    measureElements.forEach((mEl, mIdx) => {
      const mNum = parseInt(mEl.getAttribute('number') || `${mIdx + 1}`, 10);
      if (!measuresMap[mNum]) {
        measuresMap[mNum] = {
          number: mNum,
          chord: '',
          notes: { soprano: [], alto: [], tenor: [], bass: [] }
        };
      }

      const noteElements = mEl.querySelectorAll('note');
      noteElements.forEach((nEl, nIdx) => {
        const isRest = nEl.querySelector('rest') !== null;
        const step = nEl.querySelector('pitch step')?.textContent as any;
        const alter = parseInt(nEl.querySelector('pitch alter')?.textContent || '0', 10);
        const octave = parseInt(nEl.querySelector('pitch octave')?.textContent || '4', 10);
        const lyric = nEl.querySelector('lyric text')?.textContent || undefined;
        const durType = nEl.querySelector('type')?.textContent || 'quarter';
        const hasDot = nEl.querySelector('dot') !== null;

        let duration: any = '1/4';
        let beatsVal = 1;
        if (durType === 'whole') { duration = hasDot ? '1.' : '1'; beatsVal = hasDot ? 6 : 4; }
        else if (durType === 'half') { duration = hasDot ? '1/2.' : '1/2'; beatsVal = hasDot ? 3 : 2; }
        else if (durType === 'quarter') { duration = hasDot ? '1/4.' : '1/4'; beatsVal = hasDot ? 1.5 : 1; }
        else if (durType === 'eighth') { duration = '1/8'; beatsVal = 0.5; }
        else if (durType === '16th') { duration = '1/16'; beatsVal = 0.25; }

        let solfege = '0';
        if (!isRest && step) {
          const midi = pitchToMidi({ step, alter, octave });
          solfege = midiToNotAngka(midi, key).display;
        }

        measuresMap[mNum].notes[voice].push({
          id: `${voice.toUpperCase()[0]}_${mNum}_${nIdx}`,
          isRest,
          pitch: !isRest && step ? { step, alter, octave } : undefined,
          duration,
          durationBeats: beatsVal,
          solfege,
          lyric
        });
      });
    });
  });

  const sortedMeasures = Object.values(measuresMap).sort((a, b) => a.number - b.number);

  return {
    metadata: {
      id: `score_${Date.now()}`,
      title,
      composer,
      arranger,
      key,
      originalKey: key,
      timeSignature: { numerator: beats, denominator: beatType },
      tempoBpm,
      arrangementStyle: 'hymn_satb',
      melodyVoice: 'soprano',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    vocalRanges: DEFAULT_VOCAL_RANGES,
    measures: sortedMeasures.length > 0 ? sortedMeasures : [
      {
        number: 1,
        chord: 'C',
        notes: {
          soprano: [{ id: 'S_1_0', isRest: false, pitch: { step: 'C', octave: 5 }, duration: '1', durationBeats: 4, solfege: '1̇' }],
          alto: [{ id: 'A_1_0', isRest: false, pitch: { step: 'G', octave: 4 }, duration: '1', durationBeats: 4, solfege: '5' }],
          tenor: [{ id: 'T_1_0', isRest: false, pitch: { step: 'E', octave: 4 }, duration: '1', durationBeats: 4, solfege: '3' }],
          bass: [{ id: 'B_1_0', isRest: false, pitch: { step: 'C', octave: 3 }, duration: '1', durationBeats: 4, solfege: '1̣' }],
        }
      }
    ]
  };
}
