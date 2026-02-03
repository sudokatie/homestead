import { getTileColor, getCropColor, getCropSizeFactor } from '../src/components/Renderer';
import { TileType, CropStage } from '../src/game/types';

describe('Renderer', () => {
  describe('getTileColor', () => {
    it('returns green for grass', () => {
      expect(getTileColor(TileType.GRASS)).toBe('#4a7c4a');
    });

    it('returns brown for dirt', () => {
      expect(getTileColor(TileType.DIRT)).toBe('#8b6914');
    });

    it('returns darker brown for tilled', () => {
      expect(getTileColor(TileType.TILLED)).toBe('#5a4a2a');
    });

    it('returns blue for water', () => {
      expect(getTileColor(TileType.WATER)).toBe('#3a8aaa');
    });

    it('returns gray for stone', () => {
      expect(getTileColor(TileType.STONE)).toBe('#6a6a6a');
    });

    it('returns dark green for tree', () => {
      expect(getTileColor(TileType.TREE)).toBe('#2a5a2a');
    });

    it('returns brown for building', () => {
      expect(getTileColor(TileType.BUILDING)).toBe('#6a4a3a');
    });
  });

  describe('getCropColor', () => {
    it('returns brown for seed', () => {
      expect(getCropColor(CropStage.SEED)).toBe('#5a4a3a');
    });

    it('returns light green for sprout', () => {
      expect(getCropColor(CropStage.SPROUT)).toBe('#7a9a5a');
    });

    it('returns green for growing', () => {
      expect(getCropColor(CropStage.GROWING)).toBe('#5a8a4a');
    });

    it('returns darker green for mature', () => {
      expect(getCropColor(CropStage.MATURE)).toBe('#4a7a3a');
    });

    it('returns orange for harvest', () => {
      expect(getCropColor(CropStage.HARVEST)).toBe('#ffa500');
    });
  });

  describe('getCropSizeFactor', () => {
    it('returns 0.3 for seed', () => {
      expect(getCropSizeFactor(CropStage.SEED)).toBe(0.3);
    });

    it('returns 0.5 for sprout', () => {
      expect(getCropSizeFactor(CropStage.SPROUT)).toBe(0.5);
    });

    it('returns 0.7 for growing', () => {
      expect(getCropSizeFactor(CropStage.GROWING)).toBe(0.7);
    });

    it('returns 0.9 for mature', () => {
      expect(getCropSizeFactor(CropStage.MATURE)).toBe(0.9);
    });

    it('returns 1.0 for harvest', () => {
      expect(getCropSizeFactor(CropStage.HARVEST)).toBe(1.0);
    });
  });
});
