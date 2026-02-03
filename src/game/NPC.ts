import { NPC, Item, ItemType, CropType, MapId, Position } from './types';
import {
  EMILY_SCHEDULE,
  TALK_FRIENDSHIP,
  LIKED_GIFT_FRIENDSHIP,
  LOVED_GIFT_FRIENDSHIP,
  DISLIKED_GIFT_FRIENDSHIP,
  POINTS_PER_HEART,
  MAX_HEARTS,
} from './constants';

// Emily's gift preferences
const EMILY_LOVED_GIFTS: CropType[] = [CropType.CAULIFLOWER];
const EMILY_LIKED_GIFTS: CropType[] = [CropType.PARSNIP, CropType.POTATO];

// Dialog lines
const EMILY_DIALOGS = [
  "Hi there! Beautiful day, isn't it?",
  "I love walking on the beach in the morning.",
  "Have you tried the crops from the local farm?",
  "The shop has some great seeds if you need any!",
  "I hope you're settling in well.",
];

const EMILY_DIALOGS_TALKED = [
  "We already talked today. See you tomorrow!",
  "Oh, hi again! I'm a bit busy right now.",
  "I'm glad you stopped by, but I need to get going.",
];

/**
 * Create Emily, the first NPC.
 */
export function createEmily(): NPC {
  return {
    id: 'emily',
    name: 'Emily',
    pos: { x: 18, y: 4 }, // Starting position (home)
    friendship: 0,
    schedule: EMILY_SCHEDULE,
    talkedToday: false,
  };
}

/**
 * Get NPC's scheduled position for a given hour.
 * Returns null if NPC is not visible (e.g., sleeping).
 */
export function getNPCPosition(
  npc: NPC,
  hour: number
): { mapId: MapId; pos: Position } | null {
  for (const sched of npc.schedule) {
    if (hour >= sched.startHour && hour < sched.endHour) {
      return { mapId: sched.mapId, pos: sched.pos };
    }
  }
  return null;
}

/**
 * Update NPC position based on current hour.
 */
export function updateNPCPosition(npc: NPC, hour: number): void {
  const location = getNPCPosition(npc, hour);
  if (location) {
    npc.pos = { ...location.pos };
  }
}

/**
 * Talk to an NPC. Returns dialog string.
 * Increases friendship if not already talked today.
 */
export function talkToNPC(npc: NPC): string {
  if (npc.talkedToday) {
    return EMILY_DIALOGS_TALKED[Math.floor(Math.random() * EMILY_DIALOGS_TALKED.length)];
  }

  npc.talkedToday = true;
  npc.friendship = Math.min(npc.friendship + TALK_FRIENDSHIP, MAX_HEARTS * POINTS_PER_HEART);

  return EMILY_DIALOGS[Math.floor(Math.random() * EMILY_DIALOGS.length)];
}

/**
 * Give a gift to an NPC.
 * Returns friendship change and reaction string.
 */
export function giveGift(
  npc: NPC,
  item: Item
): { change: number; reaction: string } {
  // Only crops can be gifted
  if (item.type !== ItemType.CROP) {
    return { change: 0, reaction: "I can't accept that..." };
  }

  const cropType = item.subType as CropType;
  let change = 0;
  let reaction = '';

  if (EMILY_LOVED_GIFTS.includes(cropType)) {
    change = LOVED_GIFT_FRIENDSHIP;
    reaction = "Oh my! This is my favorite! Thank you so much!";
  } else if (EMILY_LIKED_GIFTS.includes(cropType)) {
    change = LIKED_GIFT_FRIENDSHIP;
    reaction = "This is wonderful, thank you!";
  } else {
    change = DISLIKED_GIFT_FRIENDSHIP;
    reaction = "Oh... thanks, I guess.";
  }

  npc.friendship = Math.max(0, Math.min(npc.friendship + change, MAX_HEARTS * POINTS_PER_HEART));

  return { change, reaction };
}

/**
 * Get NPC's friendship level in hearts (0-10).
 */
export function getFriendshipHearts(npc: NPC): number {
  return Math.floor(npc.friendship / POINTS_PER_HEART);
}

/**
 * Get friendship progress within current heart (0-99).
 */
export function getFriendshipProgress(npc: NPC): number {
  return npc.friendship % POINTS_PER_HEART;
}

/**
 * Reset NPC's daily state (call at start of new day).
 */
export function resetNPCDaily(npc: NPC): void {
  npc.talkedToday = false;
}

/**
 * Check if player is adjacent to NPC.
 */
export function isAdjacentToNPC(npc: NPC, playerPos: Position): boolean {
  const dx = Math.abs(npc.pos.x - playerPos.x);
  const dy = Math.abs(npc.pos.y - playerPos.y);
  return dx + dy === 1;
}

/**
 * Check if NPC is on given map at given hour.
 */
export function isNPCOnMap(npc: NPC, mapId: MapId, hour: number): boolean {
  const location = getNPCPosition(npc, hour);
  return location !== null && location.mapId === mapId;
}

/**
 * Get all NPCs on a specific map at a given hour.
 */
export function getNPCsOnMap(npcs: NPC[], mapId: MapId, hour: number): NPC[] {
  return npcs.filter((npc) => isNPCOnMap(npc, mapId, hour));
}

/**
 * Create all game NPCs.
 */
export function createAllNPCs(): NPC[] {
  return [createEmily()];
}
