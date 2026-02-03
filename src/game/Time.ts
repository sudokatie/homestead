import { TimeState } from './types';
import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  SHOP_OPEN_HOUR,
  SHOP_CLOSE_HOUR,
} from './constants';

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
const DAYS_PER_SEASON = 28;

export function createTime(): TimeState {
  return {
    day: 1,
    hour: DAY_START_HOUR,
    minute: 0,
    season: SEASONS[0],
  };
}

export function advanceTime(time: TimeState, minutes: number): void {
  time.minute += minutes;

  while (time.minute >= 60) {
    time.minute -= 60;
    time.hour++;
  }
}

export function getTimeString(time: TimeState): string {
  const hour24 = getHour24(time);
  const displayHour = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
  const ampm = hour24 >= 12 && hour24 < 24 ? 'PM' : 'AM';
  const minuteStr = time.minute.toString().padStart(2, '0');
  return `${displayHour}:${minuteStr} ${ampm}`;
}

export function isShopOpen(time: TimeState): boolean {
  const hour = getHour24(time);
  return hour >= SHOP_OPEN_HOUR && hour < SHOP_CLOSE_HOUR;
}

export function isDayOver(time: TimeState): boolean {
  return time.hour >= DAY_END_HOUR;
}

export function startNewDay(time: TimeState): void {
  time.day++;
  time.hour = DAY_START_HOUR;
  time.minute = 0;

  // Check for season change
  if (time.day > DAYS_PER_SEASON) {
    time.day = 1;
    const currentSeasonIndex = SEASONS.indexOf(time.season);
    const nextSeasonIndex = (currentSeasonIndex + 1) % SEASONS.length;
    time.season = SEASONS[nextSeasonIndex];
  }
}

export function getHour24(time: TimeState): number {
  // Hours past midnight are 24+
  if (time.hour >= 24) {
    return time.hour - 24;
  }
  return time.hour;
}

export function getDateString(time: TimeState): string {
  return `${time.season} ${time.day}`;
}

export function getSeasonIndex(time: TimeState): number {
  return SEASONS.indexOf(time.season);
}

export function isNightTime(time: TimeState): boolean {
  const hour = getHour24(time);
  return hour >= 20 || hour < 6;
}
