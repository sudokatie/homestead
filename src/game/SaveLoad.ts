import { GameState } from './types';

const SAVE_KEY = 'homestead_save';

export interface SaveData {
  version: string;
  timestamp: number;
  state: GameState;
}

export function saveGame(state: GameState): boolean {
  try {
    const saveData: SaveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      state: state
    };
    
    const json = JSON.stringify(saveData);
    localStorage.setItem(SAVE_KEY, json);
    return true;
  } catch (e) {
    console.error('Failed to save game:', e);
    return false;
  }
}

export function loadGame(): GameState | null {
  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) {
      return null;
    }
    
    const saveData: SaveData = JSON.parse(json);
    
    // Version check for future migrations
    if (!saveData.version || !saveData.state) {
      return null;
    }
    
    return saveData.state;
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
}

export function hasSaveGame(): boolean {
  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) {
      return false;
    }
    
    const saveData = JSON.parse(json);
    return !!(saveData.version && saveData.state);
  } catch {
    return false;
  }
}

export function deleteSaveGame(): boolean {
  try {
    localStorage.removeItem(SAVE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to delete save:', e);
    return false;
  }
}

export function getSaveTimestamp(): number | null {
  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) {
      return null;
    }
    
    const saveData: SaveData = JSON.parse(json);
    return saveData.timestamp || null;
  } catch {
    return null;
  }
}

export function formatSaveDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}
