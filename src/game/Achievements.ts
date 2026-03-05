/**
 * Achievement system for Homestead (Stardew Valley lite)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
}

export interface AchievementProgress { unlockedAt: number; }
export type AchievementStore = Record<string, AchievementProgress>;

export const ACHIEVEMENTS: Achievement[] = [
  // Skill
  { id: 'first_harvest', name: 'Farmer', description: 'Harvest your first crop', icon: '🌾', category: 'skill' },
  { id: 'first_animal', name: 'Rancher', description: 'Buy your first animal', icon: '🐔', category: 'skill' },
  { id: 'first_fish', name: 'Fisher', description: 'Catch your first fish', icon: '🐟', category: 'skill' },
  { id: 'first_craft', name: 'Crafter', description: 'Craft your first item', icon: '🔨', category: 'skill' },
  { id: 'first_gift', name: 'Friendly', description: 'Give a gift to a villager', icon: '🎁', category: 'skill' },
  { id: 'season_complete', name: 'Seasonal', description: 'Complete a full season', icon: '📅', category: 'skill' },

  // Exploration
  { id: 'mine_bottom', name: 'Deep Miner', description: 'Reach the bottom of the mine', icon: '⛏️', category: 'exploration' },
  { id: 'all_fish', name: 'Master Angler', description: 'Catch all fish types', icon: '🎣', category: 'exploration' },
  { id: 'all_crops', name: 'Botanist', description: 'Grow all crop types', icon: '🌻', category: 'exploration' },

  // Mastery
  { id: 'year_one', name: 'Year One', description: 'Complete your first year', icon: '🎉', category: 'mastery' },
  { id: 'profit_10000', name: 'Prosperous', description: 'Earn 10,000 gold', icon: '💰', category: 'mastery' },
  { id: 'profit_100000', name: 'Wealthy', description: 'Earn 100,000 gold', icon: '👑', category: 'mastery' },
  { id: 'full_hearts', name: 'Beloved', description: 'Max hearts with a villager', icon: '❤️', category: 'mastery' },
  { id: 'married', name: 'Married', description: 'Get married', icon: '💒', category: 'mastery' },
  { id: 'community', name: 'Community Hero', description: 'Complete the community center', icon: '🏛️', category: 'mastery' },

  // Daily
  { id: 'daily_complete', name: 'Daily Farmer', description: 'Complete a daily challenge', icon: '📅', category: 'daily' },
  { id: 'daily_top_10', name: 'Daily Contender', description: 'Top 10 in daily', icon: '🔟', category: 'daily' },
  { id: 'daily_top_3', name: 'Daily Champion', description: 'Top 3 in daily', icon: '🥉', category: 'daily' },
  { id: 'daily_first', name: 'Daily Legend', description: 'First place in daily', icon: '🥇', category: 'daily' },
  { id: 'daily_streak_3', name: 'Consistent', description: '3-day streak', icon: '🔥', category: 'daily' },
  { id: 'daily_streak_7', name: 'Dedicated', description: '7-day streak', icon: '💪', category: 'daily' },
];

const STORAGE_KEY = 'homestead_achievements';
const STREAK_KEY = 'homestead_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };
  constructor() { this.store = this.load(); this.dailyStreak = this.loadStreak(); }
  private load(): AchievementStore { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
  private save(): void { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store)); } catch {} }
  private loadStreak() { try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"lastDate":"","count":0}'); } catch { return { lastDate: '', count: 0 }; } }
  private saveStreak(): void { try { localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak)); } catch {} }
  isUnlocked(id: string): boolean { return id in this.store; }
  getProgress(): AchievementStore { return { ...this.store }; }
  getUnlockedCount(): number { return Object.keys(this.store).length; }
  getTotalCount(): number { return ACHIEVEMENTS.length; }
  getAchievement(id: string) { return ACHIEVEMENTS.find((a) => a.id === id); }
  getAllAchievements() { return ACHIEVEMENTS; }
  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) return null;
    const a = this.getAchievement(id); if (!a) return null;
    this.store[id] = { unlockedAt: Date.now() }; this.save(); return a;
  }
  checkAndUnlock(ids: string[]): Achievement[] {
    return ids.map((id) => this.unlock(id)).filter((a): a is Achievement => a !== null);
  }
  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];
    let a = this.unlock('daily_complete'); if (a) unlocked.push(a);
    if (rank <= 10) { a = this.unlock('daily_top_10'); if (a) unlocked.push(a); }
    if (rank <= 3) { a = this.unlock('daily_top_3'); if (a) unlocked.push(a); }
    if (rank === 1) { a = this.unlock('daily_first'); if (a) unlocked.push(a); }
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.dailyStreak.lastDate === yesterday) this.dailyStreak.count++;
    else if (this.dailyStreak.lastDate !== today) this.dailyStreak.count = 1;
    this.dailyStreak.lastDate = today; this.saveStreak();
    if (this.dailyStreak.count >= 3) { a = this.unlock('daily_streak_3'); if (a) unlocked.push(a); }
    if (this.dailyStreak.count >= 7) { a = this.unlock('daily_streak_7'); if (a) unlocked.push(a); }
    return unlocked;
  }
  reset(): void { this.store = {}; this.dailyStreak = { lastDate: '', count: 0 }; this.save(); this.saveStreak(); }
}

let instance: AchievementManager | null = null;
export function getAchievementManager(): AchievementManager { if (!instance) instance = new AchievementManager(); return instance; }
