import { saveGame, loadGame, hasSaveGame, deleteSaveGame, getSaveTimestamp, formatSaveDate } from '../src/game/SaveLoad';
import { createGame } from '../src/game/Game';
import { GameState, GameScreen } from '../src/game/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('SaveLoad', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('saveGame', () => {
    it('should save game state to localStorage', () => {
      const state = createGame();
      const result = saveGame(state);
      
      expect(result).toBe(true);
      expect(localStorageMock.getItem('homestead_save')).not.toBeNull();
    });

    it('should include version and timestamp', () => {
      const state = createGame();
      saveGame(state);
      
      const saved = JSON.parse(localStorageMock.getItem('homestead_save')!);
      expect(saved.version).toBe('1.0.0');
      expect(saved.timestamp).toBeGreaterThan(0);
    });

    it('should preserve game state', () => {
      const state = createGame();
      state.player.gold = 999;
      state.time.day = 5;
      saveGame(state);
      
      const saved = JSON.parse(localStorageMock.getItem('homestead_save')!);
      expect(saved.state.player.gold).toBe(999);
      expect(saved.state.time.day).toBe(5);
    });
  });

  describe('loadGame', () => {
    it('should return null when no save exists', () => {
      const result = loadGame();
      expect(result).toBeNull();
    });

    it('should return saved game state', () => {
      const state = createGame();
      state.player.gold = 1234;
      saveGame(state);
      
      const loaded = loadGame();
      expect(loaded).not.toBeNull();
      expect(loaded!.player.gold).toBe(1234);
    });

    it('should return null for invalid save data', () => {
      localStorageMock.setItem('homestead_save', 'invalid json');
      const result = loadGame();
      expect(result).toBeNull();
    });

    it('should return null for save without version', () => {
      localStorageMock.setItem('homestead_save', JSON.stringify({ state: {} }));
      const result = loadGame();
      expect(result).toBeNull();
    });
  });

  describe('hasSaveGame', () => {
    it('should return false when no save exists', () => {
      expect(hasSaveGame()).toBe(false);
    });

    it('should return true when valid save exists', () => {
      const state = createGame();
      saveGame(state);
      expect(hasSaveGame()).toBe(true);
    });

    it('should return false for invalid save', () => {
      localStorageMock.setItem('homestead_save', 'not json');
      expect(hasSaveGame()).toBe(false);
    });
  });

  describe('deleteSaveGame', () => {
    it('should remove save from localStorage', () => {
      const state = createGame();
      saveGame(state);
      expect(hasSaveGame()).toBe(true);
      
      deleteSaveGame();
      expect(hasSaveGame()).toBe(false);
    });

    it('should return true on success', () => {
      expect(deleteSaveGame()).toBe(true);
    });
  });

  describe('getSaveTimestamp', () => {
    it('should return null when no save exists', () => {
      expect(getSaveTimestamp()).toBeNull();
    });

    it('should return timestamp when save exists', () => {
      const before = Date.now();
      const state = createGame();
      saveGame(state);
      const after = Date.now();
      
      const timestamp = getSaveTimestamp();
      expect(timestamp).not.toBeNull();
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('formatSaveDate', () => {
    it('should format timestamp as readable date', () => {
      const timestamp = new Date('2026-02-03T15:30:00').getTime();
      const formatted = formatSaveDate(timestamp);
      
      // Should contain date and time parts
      expect(formatted).toContain('2026');
      expect(formatted.length).toBeGreaterThan(10);
    });
  });
});
