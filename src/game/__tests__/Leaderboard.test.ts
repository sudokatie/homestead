/**
 * @jest-environment jsdom
 */

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard
} from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no entries', () => {
    expect(getLeaderboard()).toEqual([]);
  });

  it('should add an entry', () => {
    const entry = {
      name: 'Farmer',
      score: 6000,
      gold: 2500,
      cropsHarvested: 150,
      daysSurvived: 90,
      date: new Date().toISOString()
    };
    const entries = addEntry(entry);
    expect(entries[0].score).toBe(6000);
  });

  it('should sort by score descending', () => {
    addEntry({ name: 'Low', score: 2000, gold: 500, cropsHarvested: 30, daysSurvived: 20, date: '2026-01-01' });
    addEntry({ name: 'High', score: 12000, gold: 5000, cropsHarvested: 300, daysSurvived: 180, date: '2026-01-02' });
    addEntry({ name: 'Mid', score: 6000, gold: 2000, cropsHarvested: 120, daysSurvived: 80, date: '2026-01-03' });

    const top = getTop();
    expect(top[0].name).toBe('High');
    expect(top[1].name).toBe('Mid');
    expect(top[2].name).toBe('Low');
  });

  it('should limit to max entries', () => {
    for (let i = 0; i < 15; i++) {
      addEntry({ name: `F${i}`, score: i * 800, gold: i * 300, cropsHarvested: i * 20, daysSurvived: i * 10, date: '2026-01-01' });
    }
    expect(getTop().length).toBe(10);
  });

  it('should persist to localStorage', () => {
    addEntry({ name: 'Saved', score: 4000, gold: 1500, cropsHarvested: 80, daysSurvived: 50, date: '2026-01-01' });
    const stored = JSON.parse(localStorage.getItem('homestead-leaderboard')!);
    expect(stored[0].name).toBe('Saved');
  });

  it('should check if score would rank', () => {
    addEntry({ name: 'First', score: 8000, gold: 3000, cropsHarvested: 180, daysSurvived: 120, date: '2026-01-01' });
    expect(wouldRank(10000)).toBe(1);
    expect(wouldRank(4000)).toBe(2);
  });

  it('should get rank by score', () => {
    addEntry({ name: 'First', score: 8000, gold: 3000, cropsHarvested: 180, daysSurvived: 120, date: '2026-01-01' });
    addEntry({ name: 'Second', score: 5000, gold: 1800, cropsHarvested: 100, daysSurvived: 70, date: '2026-01-02' });
    expect(getRank(8000)).toBe(1);
    expect(getRank(5000)).toBe(2);
    expect(getRank(99999)).toBeNull();
  });

  it('should clear all data', () => {
    addEntry({ name: 'Gone', score: 2500, gold: 800, cropsHarvested: 50, daysSurvived: 30, date: '2026-01-01' });
    clearLeaderboard();
    expect(getLeaderboard().length).toBe(0);
  });

  it('should track farming stats', () => {
    addEntry({ name: 'Rancher', score: 7500, gold: 2800, cropsHarvested: 160, daysSurvived: 100, date: '2026-01-01' });
    const entry = getTop()[0];
    expect(entry.gold).toBe(2800);
    expect(entry.cropsHarvested).toBe(160);
    expect(entry.daysSurvived).toBe(100);
  });
});
