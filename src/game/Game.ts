import {
  GameState,
  GameScreen,
  MapId,
  Tile,
  Item,
} from './types';
import { createPlayer, movePlayer, resetPlayerForNewDay } from './Player';
import { createTime, advanceTime, isDayOver, startNewDay } from './Time';
import { createFarmGrid, createTownGrid, createBeachGrid } from './Grid';
import { clearWatered } from './Tile';
import { advanceCropDay } from './Crop';
import { createEmily, resetNPCDaily } from './NPC';
import { processShippingBin } from './Economy';
import { checkMapTransition, getEntryPosition } from './Maps';
import {
  FARM_WIDTH,
  FARM_HEIGHT,
  TOWN_WIDTH,
  TOWN_HEIGHT,
  BEACH_WIDTH,
  BEACH_HEIGHT,
  MINUTES_PER_TICK,
  PASSOUT_ENERGY,
} from './constants';

/**
 * Create initial game state.
 */
export function createGame(): GameState {
  return {
    screen: GameScreen.TITLE,
    player: createPlayer(),
    time: createTime(),
    farmGrid: createFarmGrid(),
    townGrid: createTownGrid(),
    beachGrid: createBeachGrid(),
    currentMap: MapId.FARM,
    npcs: [createEmily()],
    shippingBin: [],
    dialogText: null,
    dialogNPC: null,
    messages: [],
  };
}

/**
 * Start a new game from title screen.
 */
export function startGame(state: GameState): void {
  state.screen = GameScreen.PLAYING;
  addMessage(state, 'Welcome to Homestead Farm!');
}

/**
 * Get the current map grid.
 */
export function getCurrentGrid(state: GameState): Tile[][] {
  switch (state.currentMap) {
    case MapId.FARM:
      return state.farmGrid;
    case MapId.TOWN:
      return state.townGrid;
    case MapId.BEACH:
      return state.beachGrid;
    default:
      return state.farmGrid;
  }
}

/**
 * Get current map dimensions.
 */
export function getCurrentMapDimensions(state: GameState): { width: number; height: number } {
  switch (state.currentMap) {
    case MapId.FARM:
      return { width: FARM_WIDTH, height: FARM_HEIGHT };
    case MapId.TOWN:
      return { width: TOWN_WIDTH, height: TOWN_HEIGHT };
    case MapId.BEACH:
      return { width: BEACH_WIDTH, height: BEACH_HEIGHT };
    default:
      return { width: FARM_WIDTH, height: FARM_HEIGHT };
  }
}

/**
 * Main game update loop.
 */
export function updateGame(state: GameState, dt: number): void {
  if (state.screen !== GameScreen.PLAYING) {
    return;
  }

  // Advance time
  advanceTime(state.time, MINUTES_PER_TICK * dt);

  // Check for day end (2 AM)
  if (isDayOver(state.time)) {
    triggerSleep(state);
  }

  // Check for passout
  if (state.player.energy <= 0) {
    handlePassout(state);
  }
}

/**
 * Process a new day.
 */
export function processNewDay(state: GameState): void {
  // Advance crops on farm
  for (let y = 0; y < FARM_HEIGHT; y++) {
    for (let x = 0; x < FARM_WIDTH; x++) {
      const tile = state.farmGrid[y][x];
      if (tile.crop) {
        advanceCropDay(tile.crop);
      }
    }
  }

  // Clear watered status
  clearWatered(state.farmGrid);

  // Process shipping bin
  if (state.shippingBin.length > 0) {
    const result = processShippingBin(state.player, state.shippingBin);
    if (result.gold > 0) {
      addMessage(state, `Shipped crops! Earned ${result.gold}g`);
    }
    state.shippingBin = [];
  }

  // Reset player energy
  resetPlayerForNewDay(state.player);

  // Reset NPCs
  for (const npc of state.npcs) {
    resetNPCDaily(npc);
  }

  // Advance day
  startNewDay(state.time);

  // Check end condition
  if (checkEndCondition(state)) {
    state.screen = GameScreen.END;
    addMessage(state, 'Spring has ended. Time to see your progress!');
  }
}

/**
 * Handle player movement.
 */
export function handlePlayerMove(state: GameState, dx: number, dy: number): boolean {
  const grid = getCurrentGrid(state);
  const { width, height } = getCurrentMapDimensions(state);
  
  const moved = movePlayer(state.player, dx, dy, grid, width, height);
  
  if (moved) {
    // Check for map transitions
    const transition = checkMapTransition(state.currentMap, state.player.pos.x, state.player.pos.y);
    if (transition) {
      handleMapTransition(state, transition);
    }
  }
  
  return moved;
}

/**
 * Handle map transition.
 */
export function handleMapTransition(state: GameState, toMap: MapId): void {
  const entry = getEntryPosition(toMap, state.currentMap);
  state.player.pos = entry;
  state.currentMap = toMap;
  
  const mapNames: Record<MapId, string> = {
    [MapId.FARM]: 'Farm',
    [MapId.TOWN]: 'Town',
    [MapId.BEACH]: 'Beach',
  };
  addMessage(state, `Entered ${mapNames[toMap]}`);
}

/**
 * Trigger sleep and new day.
 */
export function triggerSleep(state: GameState): void {
  state.screen = GameScreen.SLEEPING;
  processNewDay(state);
  
  // Return player to farmhouse
  state.player.pos = { x: 10, y: 12 };
  state.currentMap = MapId.FARM;
  
  state.screen = GameScreen.PLAYING;
}

/**
 * Handle passout from exhaustion.
 */
export function handlePassout(state: GameState): void {
  // Lose gold penalty
  const penalty = Math.min(100, state.player.gold);
  state.player.gold -= penalty;
  
  addMessage(state, `You passed out! Lost ${penalty}g`);
  
  // Force sleep (this restores full energy)
  triggerSleep(state);
  
  // Override with partial energy recovery (penalty for passing out)
  state.player.energy = PASSOUT_ENERGY;
}

/**
 * Open dialog with NPC.
 */
export function openDialog(state: GameState, npcId: string, text: string): void {
  state.screen = GameScreen.DIALOG;
  state.dialogNPC = npcId;
  state.dialogText = text;
}

/**
 * Close dialog.
 */
export function closeDialog(state: GameState): void {
  state.screen = GameScreen.PLAYING;
  state.dialogNPC = null;
  state.dialogText = null;
}

/**
 * Open shop.
 */
export function openShop(state: GameState): void {
  state.screen = GameScreen.SHOP;
}

/**
 * Close shop.
 */
export function closeShop(state: GameState): void {
  state.screen = GameScreen.PLAYING;
}

/**
 * Toggle pause.
 */
export function togglePause(state: GameState): void {
  if (state.screen === GameScreen.PLAYING) {
    state.screen = GameScreen.PAUSED;
  } else if (state.screen === GameScreen.PAUSED) {
    state.screen = GameScreen.PLAYING;
  }
}

/**
 * Toggle inventory.
 */
export function toggleInventory(state: GameState): void {
  if (state.screen === GameScreen.PLAYING) {
    state.screen = GameScreen.INVENTORY;
  } else if (state.screen === GameScreen.INVENTORY) {
    state.screen = GameScreen.PLAYING;
  }
}

/**
 * Add message to log.
 */
export function addMessage(state: GameState, message: string): void {
  state.messages.push(message);
  if (state.messages.length > 5) {
    state.messages.shift();
  }
}

/**
 * Check if game end condition is met (Spring 28).
 */
export function checkEndCondition(state: GameState): boolean {
  return state.time.day > 28;
}

/**
 * Calculate final score for end screen.
 */
export function calculateScore(state: GameState): {
  gold: number;
  cropsGrown: number;
  friendship: number;
  total: number;
} {
  const gold = state.player.gold;
  
  // Count mature crops
  let cropsGrown = 0;
  for (let y = 0; y < FARM_HEIGHT; y++) {
    for (let x = 0; x < FARM_WIDTH; x++) {
      const tile = state.farmGrid[y][x];
      if (tile.crop) {
        cropsGrown++;
      }
    }
  }
  
  // Total friendship
  const friendship = state.npcs.reduce((sum, npc) => sum + npc.friendship, 0);
  
  const total = gold + (cropsGrown * 50) + friendship;
  
  return { gold, cropsGrown, friendship, total };
}

/**
 * Add item to shipping bin.
 */
export function addToShipping(state: GameState, item: Item): void {
  state.shippingBin.push(item);
  addMessage(state, `Added ${item.quantity} item(s) to shipping bin`);
}
