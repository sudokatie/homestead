'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  GameState,
  GameScreen,
  MapId,
  Direction,
  CropType,
  ItemType,
  ToolType,
} from '../game/types';
import {
  createGame,
  startGame,
  updateGame,
  getCurrentGrid,
  getCurrentMapDimensions,
  handlePlayerMove,
  togglePause,
  toggleInventory,
  openShop,
  closeShop,
  closeDialog,
  openDialog,
  addMessage,
  calculateScore,
  addToShipping,
} from '../game/Game';
import { useTool as applyTool } from '../game/Tool';
import { selectTool, getSelectedTool, setFacing } from '../game/Player';
import { talkToNPC, getNPCPosition } from '../game/NPC';
import { buySeeds } from '../game/Economy';
import { removeItem } from '../game/Inventory';
import { isShopOpen } from '../game/Time';
import { renderGame } from './Renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '../game/constants';
import { saveGame, loadGame, hasSaveGame } from '../game/SaveLoad';

import TitleScreen from './TitleScreen';
import HUD from './HUD';
import InventoryPanel from './InventoryPanel';
import ShopPanel from './ShopPanel';
import DialogBox from './DialogBox';
import PauseMenu from './PauseMenu';
import EndScreen from './EndScreen';

// Helper function - get position player is facing
function getFacingPosition(game: GameState) {
  const { pos, facing } = game.player;
  switch (facing) {
    case Direction.UP: return { x: pos.x, y: pos.y - 1 };
    case Direction.DOWN: return { x: pos.x, y: pos.y + 1 };
    case Direction.LEFT: return { x: pos.x - 1, y: pos.y };
    case Direction.RIGHT: return { x: pos.x + 1, y: pos.y };
    default: return { x: pos.x, y: pos.y };
  }
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);

  const [screen, setScreen] = useState<GameScreen>(GameScreen.TITLE);
  const [energy, setEnergy] = useState(100);
  const [maxEnergy, setMaxEnergy] = useState(100);
  const [gold, setGold] = useState(500);
  const [day, setDay] = useState(1);
  const [season, setSeason] = useState('Spring');
  const [hour, setHour] = useState(6);
  const [minute, setMinute] = useState(0);
  const [dialogText, setDialogText] = useState<string | null>(null);
  const [dialogNPC, setDialogNPC] = useState<string | null>(null);
  const [inventory, setInventory] = useState<GameState['player']['inventory']>([]);
  const [selectedTool, setSelectedTool] = useState<ToolType>(ToolType.HOE);
  const [score, setScore] = useState({ gold: 0, cropsGrown: 0, friendship: 0, total: 0 });
  const [hasExistingSave, setHasExistingSave] = useState(false);

  // Sync React state from game state
  const syncState = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    setScreen(game.screen);
    setEnergy(game.player.energy);
    setMaxEnergy(game.player.maxEnergy);
    setGold(game.player.gold);
    setDay(game.time.day);
    setSeason(game.time.season);
    setHour(game.time.hour);
    setMinute(game.time.minute);
    setDialogText(game.dialogText);
    setDialogNPC(game.dialogNPC);
    setInventory([...game.player.inventory]);
    
    // Convert tool index to ToolType
    const tools = [ToolType.HOE, ToolType.WATERING_CAN, ToolType.SCYTHE, ToolType.AXE, ToolType.PICKAXE];
    setSelectedTool(tools[game.player.selectedToolIndex] || ToolType.HOE);

    if (game.screen === GameScreen.END) {
      setScore(calculateScore(game));
    }
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    const game = createGame();
    gameRef.current = game;
    setScreen(GameScreen.TITLE);
    setHasExistingSave(hasSaveGame());
  }, []);

  // Start game
  const handleStart = useCallback(() => {
    if (gameRef.current) {
      startGame(gameRef.current);
      syncState();
    }
  }, [syncState]);

  // Load saved game
  const handleLoad = useCallback(() => {
    const savedState = loadGame();
    if (savedState) {
      gameRef.current = savedState;
      // Make sure screen is set to PLAYING when loading
      savedState.screen = GameScreen.PLAYING;
      syncState();
    }
  }, [syncState]);

  // Save game
  const handleSave = useCallback(() => {
    const game = gameRef.current;
    if (game) {
      const success = saveGame(game);
      if (success) {
        addMessage(game, 'Game saved!');
      } else {
        addMessage(game, 'Failed to save game.');
      }
      syncState();
      setHasExistingSave(true);
    }
  }, [syncState]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!game || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate delta time
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Update game if playing
    if (game.screen === GameScreen.PLAYING) {
      updateGame(game, dt);
      syncState();
    }

    // Render
    renderGame(ctx, game);

    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [syncState]);

  // Handle interaction (E key)
  const handleInteract = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    // Check for nearby NPC
    const facingPos = getFacingPosition(game);
    
    for (const npc of game.npcs) {
      const npcPos = getNPCPosition(npc, game.time.hour);
      if (npcPos && npcPos.mapId === game.currentMap) {
        const dist = Math.abs(npcPos.pos.x - facingPos.x) + Math.abs(npcPos.pos.y - facingPos.y);
        if (dist <= 1) {
          const message = talkToNPC(npc);
          openDialog(game, npc.id, message);
          syncState();
          return;
        }
      }
    }

    // Check for shop (in town, at shop position)
    if (game.currentMap === MapId.TOWN && isShopOpen(game.time)) {
      // Shop is roughly at center of town
      const dist = Math.abs(12 - game.player.pos.x) + Math.abs(12 - game.player.pos.y);
      if (dist <= 2) {
        openShop(game);
        syncState();
        return;
      }
    }

    addMessage(game, 'Nothing to interact with here.');
    syncState();
  }, [syncState]);

  // Handle tool use (Space key)
  const handleToolUse = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    const facingPos = getFacingPosition(game);
    const grid = getCurrentGrid(game);
    const tool = getSelectedTool(game.player);
    
    const result = applyTool(tool, game.player, grid, facingPos.x, facingPos.y);
    if (result.message) {
      addMessage(game, result.message);
    }
    syncState();
  }, [syncState]);

  // Start/stop game loop
  useEffect(() => {
    if (screen === GameScreen.PLAYING || screen === GameScreen.PAUSED) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [screen, gameLoop]);

  // Initialize on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current;
      if (!game) return;

      // Movement keys (only when playing)
      if (game.screen === GameScreen.PLAYING) {
        let dx = 0, dy = 0;
        let moved = false;

        switch (e.key) {
          case 'w':
          case 'W':
          case 'ArrowUp':
            dy = -1;
            setFacing(game.player, Direction.UP);
            moved = true;
            break;
          case 's':
          case 'S':
          case 'ArrowDown':
            dy = 1;
            setFacing(game.player, Direction.DOWN);
            moved = true;
            break;
          case 'a':
          case 'A':
          case 'ArrowLeft':
            dx = -1;
            setFacing(game.player, Direction.LEFT);
            moved = true;
            break;
          case 'd':
          case 'D':
          case 'ArrowRight':
            dx = 1;
            setFacing(game.player, Direction.RIGHT);
            moved = true;
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
            selectTool(game.player, parseInt(e.key) - 1);
            syncState();
            break;
          case 'e':
          case 'E':
            handleInteract();
            break;
          case ' ':
            handleToolUse();
            break;
          case 'i':
          case 'I':
            toggleInventory(game);
            syncState();
            break;
          case 'Escape':
            togglePause(game);
            syncState();
            break;
        }

        if (moved) {
          handlePlayerMove(game, dx, dy);
          syncState();
        }
      } else if (game.screen === GameScreen.PAUSED) {
        if (e.key === 'Escape') {
          togglePause(game);
          syncState();
        }
      } else if (game.screen === GameScreen.INVENTORY) {
        if (e.key === 'Escape' || e.key === 'i' || e.key === 'I') {
          toggleInventory(game);
          syncState();
        }
      } else if (game.screen === GameScreen.DIALOG) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
          closeDialog(game);
          syncState();
        }
      } else if (game.screen === GameScreen.SHOP) {
        if (e.key === 'Escape') {
          closeShop(game);
          syncState();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [syncState, handleInteract, handleToolUse]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const game = gameRef.current;
    if (!game || game.screen !== GameScreen.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const { width, height } = getCurrentMapDimensions(game);

    // Calculate camera offset (same formula as Renderer)
    const cameraX = Math.max(
      0,
      Math.min(
        game.player.pos.x * TILE_SIZE - CANVAS_WIDTH / 2 + TILE_SIZE / 2,
        width * TILE_SIZE - CANVAS_WIDTH
      )
    );
    const cameraY = Math.max(
      0,
      Math.min(
        game.player.pos.y * TILE_SIZE - CANVAS_HEIGHT / 2 + TILE_SIZE / 2,
        height * TILE_SIZE - CANVAS_HEIGHT
      )
    );

    // Convert screen coordinates to world coordinates
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = Math.floor((screenX + cameraX) / TILE_SIZE);
    const worldY = Math.floor((screenY + cameraY) / TILE_SIZE);

    // Use tool at clicked position if adjacent
    const dist = Math.abs(worldX - game.player.pos.x) + Math.abs(worldY - game.player.pos.y);
    if (dist === 1) {
      const grid = getCurrentGrid(game);
      const tool = getSelectedTool(game.player);
      const result = applyTool(tool, game.player, grid, worldX, worldY);
      if (result.message) {
        addMessage(game, result.message);
      }
      syncState();
    }
  }, [syncState]);

  // Shop buy handler
  const handleBuy = useCallback((cropType: CropType, quantity: number) => {
    const game = gameRef.current;
    if (!game) return;

    const success = buySeeds(game.player, cropType, quantity);
    if (success) {
      addMessage(game, `Bought ${quantity} ${CropType[cropType]} seeds`);
    } else {
      addMessage(game, 'Not enough gold!');
    }
    syncState();
  }, [syncState]);

  // Close shop handler
  const handleCloseShop = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    closeShop(game);
    syncState();
  }, [syncState]);

  // Inventory ship handler
  const handleShip = useCallback((slotIndex: number) => {
    const game = gameRef.current;
    if (!game) return;

    const item = removeItem(game.player.inventory, slotIndex, 1);
    if (item && item.type === ItemType.CROP) {
      addToShipping(game, item);
    }
    syncState();
  }, [syncState]);

  // Render based on screen
  if (screen === GameScreen.TITLE) {
    return <TitleScreen onStart={handleStart} onLoad={handleLoad} hasExistingSave={hasExistingSave} />;
  }

  if (screen === GameScreen.END) {
    return (
      <EndScreen
        gold={score.gold}
        cropsGrown={score.cropsGrown}
        friendship={score.friendship}
        totalScore={score.total}
        onRestart={initGame}
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center bg-gray-900 min-h-screen">
      <HUD
        day={day}
        season={season}
        hour={hour}
        minute={minute}
        energy={energy}
        maxEnergy={maxEnergy}
        gold={gold}
        selectedTool={selectedTool}
      />

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        className="border-4 border-amber-800 cursor-pointer"
      />

      {screen === GameScreen.PAUSED && (
        <PauseMenu 
          onResume={() => {
            const game = gameRef.current;
            if (game) {
              togglePause(game);
              syncState();
            }
          }}
          onSave={handleSave}
          onQuit={() => {
            initGame();
          }}
        />
      )}

      {screen === GameScreen.INVENTORY && (
        <InventoryPanel
          slots={inventory}
          selectedIndex={0}
          onClose={() => {
            const game = gameRef.current;
            if (game) {
              toggleInventory(game);
              syncState();
            }
          }}
          onSelectSlot={(index) => {
            // For now, selecting an item could add it to shipping bin if it's a crop
            handleShip(index);
          }}
        />
      )}

      {screen === GameScreen.SHOP && (
        <ShopPanel
          gold={gold}
          onBuy={handleBuy}
          onClose={handleCloseShop}
        />
      )}

      {screen === GameScreen.DIALOG && dialogText && (
        <DialogBox
          npcName={dialogNPC || 'Unknown'}
          text={dialogText}
          onClose={() => {
            const game = gameRef.current;
            if (game) {
              closeDialog(game);
              syncState();
            }
          }}
        />
      )}
    </div>
  );
}
