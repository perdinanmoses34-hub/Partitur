/**
 * SATB Composer Studio - PDF Export Engine
 * Generates high-quality print-ready choral scores in A4 / Letter format.
 * Formats Title, Composer, Key (Do=...), Meter, Tempo, and 4-part SATB Not Angka / Notation.
 */

import { jsPDF } from 'jspdf';
import { SATBScore } from '../types/music';

export interface PdfExportOptions {
  paperSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  includeChords: boolean;
  includeLyrics: boolean;
  scoreView: 'not_angka' | 'standard' | 'both';
}

export function exportScoreToPdf(score: SATBScore, options: PdfExportOptions = {
  paperSize: 'a4',
  orientation: 'portrait',
  includeChords: true,
  includeLyrics: true,
  scoreView: 'both',
}): void {
  const doc = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: options.paperSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let y = 20;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(score.metadata.title.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 7;

  // Subtitle / Style
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  const styleLabels: Record<string, string> = {
    church_traditional: 'Aransemen Paduan Suara Gerejawi Tradisional (SATB)',
    hymn_satb: 'Aransemen Hymn Paduan Suara Empat Suara (SATB)',
    classical: 'Paduan Suara Klasik Empat Suara',
    modern_praise: 'Aransemen Paduan Suara Kontemporer / Pujian',
    simple_congregation: 'Aransemen Sederhana untuk Paduan Suara & Jemaat',
    advanced_choral: 'Aransemen Paduan Suara Tingkat Lanjut',
  };
  const styleText = styleLabels[score.metadata.arrangementStyle] || 'Paduan Suara Empat Suara (SATB)';
  doc.text(styleText, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Metadata row (Composer on left, Key/Meter on center, Arranger on right)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Left: Key & Meter & Tempo
  const keyDo = `Do = ${score.metadata.key}`;
  const meter = `${score.metadata.timeSignature.numerator}/${score.metadata.timeSignature.denominator}`;
  const tempo = `MM = ${score.metadata.tempoBpm} BPM`;
  doc.text(`${keyDo}  |  Birama: ${meter}  |  ${tempo}`, margin, y);

  // Right: Composer & Arranger
  const composerText = `Cipt: ${score.metadata.composer || 'Anonim'}`;
  const arrangerText = `Arr: ${score.metadata.arranger || 'SATB Studio'}`;
  doc.text(composerText, pageWidth - margin, y - 3, { align: 'right' });
  doc.text(arrangerText, pageWidth - margin, y + 2, { align: 'right' });
  y += 6;

  // Divider line
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Render Measures in Not Angka 4-part systems
  const measuresPerSystem = options.orientation === 'landscape' ? 4 : 2;
  const measures = score.measures;
  let pageNum = 1;

  for (let i = 0; i < measures.length; i += measuresPerSystem) {
    const chunk = measures.slice(i, i + measuresPerSystem);
    const systemHeight = 36;

    // Check if new page needed
    if (y + systemHeight > pageHeight - margin) {
      // Footer page number
      doc.setFontSize(8);
      doc.text(`SATB Composer Studio — Halaman ${pageNum}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      doc.addPage();
      pageNum++;
      y = margin + 10;
    }

    const colWidth = contentWidth / chunk.length;

    // Measure numbers & Chords above
    chunk.forEach((m, cIdx) => {
      const colX = margin + cIdx * colWidth;

      // Chord
      if (options.includeChords && m.chord) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 64, 175); // Royal blue
        doc.text(m.chord, colX + 10, y - 2);
      }

      // Measure number badge
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`[${m.number}]`, colX + 2, y - 2);
    });

    y += 2;

    // 4 Voices: S, A, T, B
    const voiceRows: { label: string; voice: 'soprano' | 'alto' | 'tenor' | 'bass' }[] = [
      { label: 'S', voice: 'soprano' },
      { label: 'A', voice: 'alto' },
      { label: 'T', voice: 'tenor' },
      { label: 'B', voice: 'bass' },
    ];

    voiceRows.forEach(({ label, voice }) => {
      // Voice label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(`${label}.`, margin - 5, y + 3, { align: 'right' });

      chunk.forEach((m, cIdx) => {
        const colX = margin + cIdx * colWidth;
        const notes = m.notes[voice] || [];

        // Left measure bar line
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.2);
        doc.line(colX, y - 1, colX, y + 4);

        // Notes Solfege
        doc.setFont('courier', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(10, 10, 10);

        const solfegeText = notes.map(n => n.solfege || (n.isRest ? '0' : '.')).join('   ');
        doc.text(solfegeText, colX + 6, y + 3);

        // Right measure bar line on last column
        if (cIdx === chunk.length - 1) {
          doc.line(margin + contentWidth, y - 1, margin + contentWidth, y + 4);
        }
      });

      y += 6;
    });

    // Optional Lyric row underneath system
    if (options.includeLyrics) {
      chunk.forEach((m, cIdx) => {
        const colX = margin + cIdx * colWidth;
        const sNotes = m.notes.soprano || [];
        const lyricsText = sNotes.map(n => n.lyric || '').filter(Boolean).join(' ');
        if (lyricsText) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          doc.text(lyricsText, colX + 6, y + 2);
        }
      });
      y += 5;
    }

    y += 6; // Spacing between systems
  }

  // Final measure double bar line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(margin + contentWidth, y - 8, margin + contentWidth, y - 3);

  // Footer page number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`SATB Composer Studio — Halaman ${pageNum}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Save PDF
  const filename = `${score.metadata.title.replace(/\s+/g, '_')}_Partitur_SATB.pdf`;
  doc.save(filename);
}
