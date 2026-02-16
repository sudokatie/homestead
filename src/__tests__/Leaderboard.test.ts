// Tests for Homestead leaderboard

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard,
  calculateScore,
  LeaderboardEntry,
} from '../game/Leaderboard';

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getLeaderboard', () => {
    it('returns empty array when no entries', () => {
      expect(getLeaderboard()).toEqual([]);
    });

    it('returns stored entries', () => {
      const entry: LeaderboardEntry = {
        name: 'Sunrise Farm',
        score: 15000,
        gold: 10000,
        cropsHarvested: 50,
        daysSurvived: 28,
        date: '2026-02-16',
      };
      addEntry(entry);
      expect(getLeaderboard()).toHaveLength(1);
      expect(getLeaderboard()[0].name).toBe('Sunrise Farm');
    });
  });

  describe('addEntry', () => {
    it('adds entry to leaderboard', () => {
      const entry: LeaderboardEntry = {
        name: 'Green Acres',
        score: 8000,
        gold: 5000,
        cropsHarvested: 30,
        daysSurvived: 14,
        date: '2026-02-16',
      };
      const result = addEntry(entry);
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(8000);
    });

    it('sorts entries by score descending', () => {
      addEntry({ name: 'Small', score: 3000, gold: 2000, cropsHarvested: 10, daysSurvived: 7, date: '2026-02-16' });
      addEntry({ name: 'Large', score: 20000, gold: 15000, cropsHarvested: 80, daysSurvived: 56, date: '2026-02-16' });
      addEntry({ name: 'Medium', score: 10000, gold: 7000, cropsHarvested: 40, daysSurvived: 28, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('Large');
      expect(entries[1].name).toBe('Medium');
      expect(entries[2].name).toBe('Small');
    });

    it('sorts by gold when scores equal', () => {
      addEntry({ name: 'PoorFarm', score: 10000, gold: 5000, cropsHarvested: 60, daysSurvived: 28, date: '2026-02-16' });
      addEntry({ name: 'RichFarm', score: 10000, gold: 8000, cropsHarvested: 30, daysSurvived: 28, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('RichFarm');
      expect(entries[1].name).toBe('PoorFarm');
    });

    it('limits to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        addEntry({
          name: `Farm${i}`,
          score: i * 1000,
          gold: i * 500,
          cropsHarvested: i * 5,
          daysSurvived: i * 7,
          date: '2026-02-16',
        });
      }
      expect(getLeaderboard()).toHaveLength(10);
    });
  });

  describe('getTop', () => {
    it('returns top N entries', () => {
      for (let i = 0; i < 5; i++) {
        addEntry({
          name: `Farm${i}`,
          score: (i + 1) * 2000,
          gold: (i + 1) * 1000,
          cropsHarvested: (i + 1) * 10,
          daysSurvived: (i + 1) * 7,
          date: '2026-02-16',
        });
      }
      const top3 = getTop(3);
      expect(top3).toHaveLength(3);
      expect(top3[0].score).toBe(10000);
    });
  });

  describe('wouldRank', () => {
    it('returns rank when board not full', () => {
      addEntry({ name: 'Test', score: 5000, gold: 3000, cropsHarvested: 20, daysSurvived: 14, date: '2026-02-16' });
      expect(wouldRank(8000)).toBe(1);
      expect(wouldRank(3000)).toBe(2);
    });

    it('returns null when would not rank on full board', () => {
      for (let i = 0; i < 10; i++) {
        addEntry({
          name: `Farm${i}`,
          score: (i + 1) * 1000,
          gold: (i + 1) * 500,
          cropsHarvested: (i + 1) * 5,
          daysSurvived: (i + 1) * 7,
          date: '2026-02-16',
        });
      }
      expect(wouldRank(500)).toBeNull();
    });
  });

  describe('getRank', () => {
    it('returns rank for existing score', () => {
      addEntry({ name: 'First', score: 15000, gold: 10000, cropsHarvested: 60, daysSurvived: 56, date: '2026-02-16' });
      addEntry({ name: 'Second', score: 8000, gold: 5000, cropsHarvested: 30, daysSurvived: 28, date: '2026-02-16' });
      const entries = getLeaderboard();
      expect(getRank(entries[0].score)).toBe(1);
      expect(getRank(entries[1].score)).toBe(2);
    });

    it('returns null for non-existent score', () => {
      addEntry({ name: 'Test', score: 5000, gold: 3000, cropsHarvested: 20, daysSurvived: 14, date: '2026-02-16' });
      expect(getRank(10000)).toBeNull();
    });
  });

  describe('clearLeaderboard', () => {
    it('removes all entries', () => {
      addEntry({ name: 'Test', score: 5000, gold: 3000, cropsHarvested: 20, daysSurvived: 14, date: '2026-02-16' });
      clearLeaderboard();
      expect(getLeaderboard()).toEqual([]);
    });
  });

  describe('calculateScore', () => {
    it('calculates score from farm stats', () => {
      // 5000 gold
      // 20 crops * 50 = 1000
      // 28 days * 5 = 140
      // 50 friendship * 10 = 500
      // Total = 6640
      const score = calculateScore(5000, 20, 28, 50);
      expect(score).toBe(6640);
    });

    it('handles new farm', () => {
      const score = calculateScore(500, 5, 7, 0);
      expect(score).toBe(500 + 250 + 35); // 785
    });

    it('handles prosperous farm', () => {
      const score = calculateScore(50000, 200, 112, 200);
      expect(score).toBe(50000 + 10000 + 560 + 2000); // 62560
    });
  });
});
