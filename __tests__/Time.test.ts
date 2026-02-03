import {
  createTime,
  advanceTime,
  getTimeString,
  isShopOpen,
  isDayOver,
  startNewDay,
  getHour24,
  getDateString,
  getSeasonIndex,
  isNightTime,
} from '../src/game/Time';
import { DAY_START_HOUR, DAY_END_HOUR, SHOP_OPEN_HOUR, SHOP_CLOSE_HOUR } from '../src/game/constants';

describe('Time', () => {
  describe('createTime', () => {
    it('creates time at day 1', () => {
      const time = createTime();
      expect(time.day).toBe(1);
    });

    it('starts at 6 AM', () => {
      const time = createTime();
      expect(time.hour).toBe(DAY_START_HOUR);
      expect(time.minute).toBe(0);
    });

    it('starts in Spring', () => {
      const time = createTime();
      expect(time.season).toBe('Spring');
    });
  });

  describe('advanceTime', () => {
    it('advances minutes', () => {
      const time = createTime();
      advanceTime(time, 30);
      expect(time.minute).toBe(30);
    });

    it('rolls over to next hour', () => {
      const time = createTime();
      advanceTime(time, 70);
      expect(time.hour).toBe(DAY_START_HOUR + 1);
      expect(time.minute).toBe(10);
    });

    it('handles multiple hour rollover', () => {
      const time = createTime();
      advanceTime(time, 150); // 2.5 hours
      expect(time.hour).toBe(DAY_START_HOUR + 2);
      expect(time.minute).toBe(30);
    });
  });

  describe('getTimeString', () => {
    it('formats morning time', () => {
      const time = createTime();
      time.hour = 9;
      time.minute = 30;
      expect(getTimeString(time)).toBe('9:30 AM');
    });

    it('formats afternoon time', () => {
      const time = createTime();
      time.hour = 14;
      time.minute = 15;
      expect(getTimeString(time)).toBe('2:15 PM');
    });

    it('formats midnight', () => {
      const time = createTime();
      time.hour = 24; // midnight in 24+ hour format
      time.minute = 0;
      expect(getTimeString(time)).toBe('12:00 AM');
    });

    it('formats noon', () => {
      const time = createTime();
      time.hour = 12;
      time.minute = 0;
      expect(getTimeString(time)).toBe('12:00 PM');
    });

    it('pads minutes', () => {
      const time = createTime();
      time.hour = 6;
      time.minute = 5;
      expect(getTimeString(time)).toBe('6:05 AM');
    });
  });

  describe('isShopOpen', () => {
    it('returns true during shop hours', () => {
      const time = createTime();
      time.hour = 12;
      expect(isShopOpen(time)).toBe(true);
    });

    it('returns false before shop opens', () => {
      const time = createTime();
      time.hour = 7;
      expect(isShopOpen(time)).toBe(false);
    });

    it('returns false after shop closes', () => {
      const time = createTime();
      time.hour = 18;
      expect(isShopOpen(time)).toBe(false);
    });

    it('returns true at opening time', () => {
      const time = createTime();
      time.hour = SHOP_OPEN_HOUR;
      expect(isShopOpen(time)).toBe(true);
    });

    it('returns false at closing time', () => {
      const time = createTime();
      time.hour = SHOP_CLOSE_HOUR;
      expect(isShopOpen(time)).toBe(false);
    });
  });

  describe('isDayOver', () => {
    it('returns false during day', () => {
      const time = createTime();
      time.hour = 18;
      expect(isDayOver(time)).toBe(false);
    });

    it('returns true at end of day', () => {
      const time = createTime();
      time.hour = DAY_END_HOUR;
      expect(isDayOver(time)).toBe(true);
    });

    it('returns true past end of day', () => {
      const time = createTime();
      time.hour = DAY_END_HOUR + 1;
      expect(isDayOver(time)).toBe(true);
    });
  });

  describe('startNewDay', () => {
    it('increments day', () => {
      const time = createTime();
      startNewDay(time);
      expect(time.day).toBe(2);
    });

    it('resets to morning', () => {
      const time = createTime();
      time.hour = 25;
      time.minute = 30;
      startNewDay(time);
      expect(time.hour).toBe(DAY_START_HOUR);
      expect(time.minute).toBe(0);
    });

    it('changes season after day 28', () => {
      const time = createTime();
      time.day = 28;
      time.season = 'Spring';
      startNewDay(time);
      expect(time.day).toBe(1);
      expect(time.season).toBe('Summer');
    });

    it('cycles through all seasons', () => {
      const time = createTime();
      time.day = 28;
      time.season = 'Winter';
      startNewDay(time);
      expect(time.season).toBe('Spring');
    });
  });

  describe('getHour24', () => {
    it('returns hour for normal hours', () => {
      const time = createTime();
      time.hour = 14;
      expect(getHour24(time)).toBe(14);
    });

    it('handles hours past midnight', () => {
      const time = createTime();
      time.hour = 25; // 1 AM
      expect(getHour24(time)).toBe(1);
    });
  });

  describe('getDateString', () => {
    it('formats date correctly', () => {
      const time = createTime();
      time.day = 15;
      time.season = 'Summer';
      expect(getDateString(time)).toBe('Summer 15');
    });
  });

  describe('getSeasonIndex', () => {
    it('returns 0 for Spring', () => {
      const time = createTime();
      expect(getSeasonIndex(time)).toBe(0);
    });

    it('returns correct index for each season', () => {
      const time = createTime();
      time.season = 'Winter';
      expect(getSeasonIndex(time)).toBe(3);
    });
  });

  describe('isNightTime', () => {
    it('returns true at night', () => {
      const time = createTime();
      time.hour = 22;
      expect(isNightTime(time)).toBe(true);
    });

    it('returns true early morning', () => {
      const time = createTime();
      time.hour = 25; // 1 AM
      expect(isNightTime(time)).toBe(true);
    });

    it('returns false during day', () => {
      const time = createTime();
      time.hour = 12;
      expect(isNightTime(time)).toBe(false);
    });
  });
});
