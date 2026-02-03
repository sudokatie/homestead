import { Player } from './types';
import { PASSOUT_ENERGY } from './constants';

export function useEnergy(player: Player, amount: number): boolean {
  if (!hasEnergy(player, amount)) {
    return false;
  }
  player.energy -= amount;
  return true;
}

export function restoreEnergy(player: Player): void {
  player.energy = player.maxEnergy;
}

export function hasEnergy(player: Player, amount: number): boolean {
  return player.energy >= amount;
}

export function getEnergyPercent(player: Player): number {
  return Math.round((player.energy / player.maxEnergy) * 100);
}

export function handlePassout(player: Player): { goldLost: number } {
  // Lose some gold when passing out
  const goldLost = Math.min(player.gold, PASSOUT_ENERGY);
  player.gold -= goldLost;
  player.energy = Math.floor(player.maxEnergy * 0.5);
  return { goldLost };
}

export function isExhausted(player: Player): boolean {
  return player.energy <= 0;
}

export function getEnergyColor(player: Player): string {
  const percent = getEnergyPercent(player);
  if (percent > 60) return '#22c55e'; // green
  if (percent > 30) return '#eab308'; // yellow
  return '#ef4444'; // red
}
