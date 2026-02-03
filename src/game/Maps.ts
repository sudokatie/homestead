import { MapId, Position } from './types';
import {
  FARM_WIDTH,
  FARM_HEIGHT,
  TOWN_WIDTH,
  TOWN_HEIGHT,
  BEACH_WIDTH,
  BEACH_HEIGHT,
  FARM_TO_TOWN_EXIT,
  TOWN_TO_FARM_ENTRY,
  TOWN_TO_BEACH_EXIT,
  BEACH_TO_TOWN_ENTRY,
} from './constants';

export function getMapDimensions(mapId: MapId): { width: number; height: number } {
  switch (mapId) {
    case MapId.FARM:
      return { width: FARM_WIDTH, height: FARM_HEIGHT };
    case MapId.TOWN:
      return { width: TOWN_WIDTH, height: TOWN_HEIGHT };
    case MapId.BEACH:
      return { width: BEACH_WIDTH, height: BEACH_HEIGHT };
  }
}

export function getExitPosition(fromMap: MapId, toMap: MapId): Position | null {
  if (fromMap === MapId.FARM && toMap === MapId.TOWN) {
    return FARM_TO_TOWN_EXIT;
  }
  if (fromMap === MapId.TOWN && toMap === MapId.BEACH) {
    return TOWN_TO_BEACH_EXIT;
  }
  return null;
}

export function getEntryPosition(toMap: MapId, fromMap: MapId): Position {
  if (toMap === MapId.TOWN && fromMap === MapId.FARM) {
    return TOWN_TO_FARM_ENTRY;
  }
  if (toMap === MapId.BEACH && fromMap === MapId.TOWN) {
    return BEACH_TO_TOWN_ENTRY;
  }
  if (toMap === MapId.TOWN && fromMap === MapId.BEACH) {
    return { x: 12, y: TOWN_HEIGHT - 2 };
  }
  if (toMap === MapId.FARM && fromMap === MapId.TOWN) {
    return { x: FARM_WIDTH - 2, y: 12 };
  }
  // Default fallback
  return { x: 1, y: 1 };
}

export function checkMapTransition(
  currentMap: MapId,
  x: number,
  y: number
): MapId | null {
  const dims = getMapDimensions(currentMap);

  if (currentMap === MapId.FARM) {
    // Exit to town on right edge
    if (x >= dims.width - 1 && y >= 11 && y <= 13) {
      return MapId.TOWN;
    }
  } else if (currentMap === MapId.TOWN) {
    // Exit to farm on left edge
    if (x <= 0 && y >= 11 && y <= 13) {
      return MapId.FARM;
    }
    // Exit to beach on bottom edge
    if (y >= dims.height - 1 && x >= 11 && x <= 13) {
      return MapId.BEACH;
    }
  } else if (currentMap === MapId.BEACH) {
    // Exit to town on top edge
    if (y <= 0 && x >= 11 && x <= 13) {
      return MapId.TOWN;
    }
  }

  return null;
}
