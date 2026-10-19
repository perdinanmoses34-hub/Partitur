/**
 * SATB Composer Studio - Project Storage Engine
 * Manages score persistence in localStorage with backup JSON import/export,
 * duplication, and template loading.
 */

import { SATBScore } from '../types/music';
import { SAMPLE_SCORES } from './sampleScores';

const STORAGE_KEY = 'satb_composer_scores_v1';
const ACTIVE_SCORE_KEY = 'satb_composer_active_id';

export function getAllSavedScores(): SATBScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time initialization: populate with sample scores
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_SCORES));
      return SAMPLE_SCORES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_SCORES;
  } catch (e) {
    console.error('Error loading scores from localStorage:', e);
    return SAMPLE_SCORES;
  }
}

export function saveScoreToStorage(score: SATBScore): void {
  try {
    const scores = getAllSavedScores();
    const updatedScore = {
      ...score,
      metadata: {
        ...score.metadata,
        updatedAt: Date.now(),
      }
    };

    const index = scores.findIndex(s => s.metadata.id === updatedScore.metadata.id);
    if (index >= 0) {
      scores[index] = updatedScore;
    } else {
      scores.unshift(updatedScore);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    localStorage.setItem(ACTIVE_SCORE_KEY, updatedScore.metadata.id);
  } catch (e) {
    console.error('Error saving score to localStorage:', e);
  }
}

export function deleteScoreFromStorage(scoreId: string): SATBScore[] {
  try {
    let scores = getAllSavedScores();
    scores = scores.filter(s => s.metadata.id !== scoreId);
    if (scores.length === 0) {
      scores = [...SAMPLE_SCORES];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return scores;
  } catch (e) {
    console.error('Error deleting score from storage:', e);
    return getAllSavedScores();
  }
}

export function duplicateScoreInStorage(score: SATBScore): SATBScore {
  const newId = `score_${Date.now()}`;
  const duplicated: SATBScore = JSON.parse(JSON.stringify(score));
  duplicated.metadata.id = newId;
  duplicated.metadata.title = `${score.metadata.title} (Salinan)`;
  duplicated.metadata.createdAt = Date.now();
  duplicated.metadata.updatedAt = Date.now();

  saveScoreToStorage(duplicated);
  return duplicated;
}

export function getActiveScoreId(): string {
  return localStorage.getItem(ACTIVE_SCORE_KEY) || SAMPLE_SCORES[0].metadata.id;
}

export function setActiveScoreId(id: string): void {
  localStorage.setItem(ACTIVE_SCORE_KEY, id);
}

export function exportProjectToJson(score: SATBScore): void {
  const jsonStr = JSON.stringify(score, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${score.metadata.title.replace(/\s+/g, '_')}_SATB_Project.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProjectFromJson(jsonString: string): SATBScore {
  const parsed = JSON.parse(jsonString) as SATBScore;
  if (!parsed.metadata || !parsed.measures) {
    throw new Error('Format berkas proyek SATB tidak valid.');
  }
  parsed.metadata.id = `imported_${Date.now()}`;
  parsed.metadata.updatedAt = Date.now();
  saveScoreToStorage(parsed);
  return parsed;
}
