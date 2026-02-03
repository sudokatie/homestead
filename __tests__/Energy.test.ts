import {
  useEnergy,
  restoreEnergy,
  hasEnergy,
  getEnergyPercent,
  handlePassout,
  isExhausted,
  getEnergyColor,
} from '../src/game/Energy';
import { Direction } from '../src/game/types';
import { MAX_ENERGY, INVENTORY_SIZE, PASSOUT_ENERGY } from '../src/game/constants';

function createTestPlayer() {
  return {
    pos: { x: 5, y: 5 },
    energy: MAX_ENERGY,
    maxEnergy: MAX_ENERGY,
    gold: 500,
    inventory: Array(INVENTORY_SIZE).fill(null).map(() => ({ item: null })),
    selectedToolIndex: 0,
    facing: Direction.DOWN,
  };
}

describe('Energy', () => {
  describe('useEnergy', () => {
    it('deducts energy when available', () => {
      const player = createTestPlayer();
      const result = useEnergy(player, 10);
      expect(result).toBe(true);
      expect(player.energy).toBe(MAX_ENERGY - 10);
    });

    it('returns false when not enough energy', () => {
      const player = createTestPlayer();
      player.energy = 5;
      const result = useEnergy(player, 10);
      expect(result).toBe(false);
      expect(player.energy).toBe(5);
    });

    it('allows using exact amount of energy', () => {
      const player = createTestPlayer();
      player.energy = 10;
      const result = useEnergy(player, 10);
      expect(result).toBe(true);
      expect(player.energy).toBe(0);
    });
  });

  describe('restoreEnergy', () => {
    it('restores energy to max', () => {
      const player = createTestPlayer();
      player.energy = 20;
      restoreEnergy(player);
      expect(player.energy).toBe(MAX_ENERGY);
    });
  });

  describe('hasEnergy', () => {
    it('returns true when enough energy', () => {
      const player = createTestPlayer();
      expect(hasEnergy(player, 50)).toBe(true);
    });

    it('returns false when not enough energy', () => {
      const player = createTestPlayer();
      player.energy = 5;
      expect(hasEnergy(player, 10)).toBe(false);
    });

    it('returns true when exact energy', () => {
      const player = createTestPlayer();
      player.energy = 10;
      expect(hasEnergy(player, 10)).toBe(true);
    });
  });

  describe('getEnergyPercent', () => {
    it('returns 100 at full energy', () => {
      const player = createTestPlayer();
      expect(getEnergyPercent(player)).toBe(100);
    });

    it('returns 50 at half energy', () => {
      const player = createTestPlayer();
      player.energy = MAX_ENERGY / 2;
      expect(getEnergyPercent(player)).toBe(50);
    });

    it('returns 0 at no energy', () => {
      const player = createTestPlayer();
      player.energy = 0;
      expect(getEnergyPercent(player)).toBe(0);
    });
  });

  describe('handlePassout', () => {
    it('reduces gold by passout penalty', () => {
      const player = createTestPlayer();
      player.gold = 200;
      const result = handlePassout(player);
      expect(result.goldLost).toBe(PASSOUT_ENERGY);
      expect(player.gold).toBe(200 - PASSOUT_ENERGY);
    });

    it('does not reduce gold below zero', () => {
      const player = createTestPlayer();
      player.gold = 30;
      const result = handlePassout(player);
      expect(result.goldLost).toBe(30);
      expect(player.gold).toBe(0);
    });

    it('restores energy to half', () => {
      const player = createTestPlayer();
      player.energy = 0;
      handlePassout(player);
      expect(player.energy).toBe(Math.floor(MAX_ENERGY * 0.5));
    });
  });

  describe('isExhausted', () => {
    it('returns true at zero energy', () => {
      const player = createTestPlayer();
      player.energy = 0;
      expect(isExhausted(player)).toBe(true);
    });

    it('returns false with energy remaining', () => {
      const player = createTestPlayer();
      player.energy = 10;
      expect(isExhausted(player)).toBe(false);
    });
  });

  describe('getEnergyColor', () => {
    it('returns green at high energy', () => {
      const player = createTestPlayer();
      player.energy = 80;
      expect(getEnergyColor(player)).toBe('#22c55e');
    });

    it('returns yellow at medium energy', () => {
      const player = createTestPlayer();
      player.energy = 50;
      expect(getEnergyColor(player)).toBe('#eab308');
    });

    it('returns red at low energy', () => {
      const player = createTestPlayer();
      player.energy = 20;
      expect(getEnergyColor(player)).toBe('#ef4444');
    });
  });
});
