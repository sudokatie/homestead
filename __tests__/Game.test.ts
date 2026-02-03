import {
  createGame,
  startGame,
  getCurrentGrid,
  getCurrentMapDimensions,
  updateGame,
  processNewDay,
  handlePlayerMove,
  handleMapTransition,
  triggerSleep,
  handlePassout,
  openDialog,
  closeDialog,
  openShop,
  closeShop,
  togglePause,
  toggleInventory,
  addMessage,
  checkEndCondition,
  calculateScore,
  addToShipping,
} from '../src/game/Game';
import { GameScreen, MapId, CropType, ItemType, CropStage } from '../src/game/types';
import { FARM_WIDTH, FARM_HEIGHT, TOWN_WIDTH, TOWN_HEIGHT, STARTING_GOLD, MAX_ENERGY } from '../src/game/constants';

describe('Game', () => {
  describe('createGame', () => {
    it('creates game with title screen', () => {
      const game = createGame();
      expect(game.screen).toBe(GameScreen.TITLE);
    });

    it('creates game with player', () => {
      const game = createGame();
      expect(game.player).toBeDefined();
      expect(game.player.gold).toBe(STARTING_GOLD);
    });

    it('creates game with time', () => {
      const game = createGame();
      expect(game.time).toBeDefined();
      expect(game.time.day).toBe(1);
    });

    it('creates game with farm grid', () => {
      const game = createGame();
      expect(game.farmGrid.length).toBe(FARM_HEIGHT);
      expect(game.farmGrid[0].length).toBe(FARM_WIDTH);
    });

    it('creates game with town and beach grids', () => {
      const game = createGame();
      expect(game.townGrid).toBeDefined();
      expect(game.beachGrid).toBeDefined();
    });

    it('creates game starting on farm', () => {
      const game = createGame();
      expect(game.currentMap).toBe(MapId.FARM);
    });

    it('creates game with Emily NPC', () => {
      const game = createGame();
      expect(game.npcs.length).toBe(1);
      expect(game.npcs[0].name).toBe('Emily');
    });

    it('creates game with empty shipping bin', () => {
      const game = createGame();
      expect(game.shippingBin).toEqual([]);
    });
  });

  describe('startGame', () => {
    it('changes screen to playing', () => {
      const game = createGame();
      startGame(game);
      expect(game.screen).toBe(GameScreen.PLAYING);
    });

    it('adds welcome message', () => {
      const game = createGame();
      startGame(game);
      expect(game.messages).toContain('Welcome to Homestead Farm!');
    });
  });

  describe('getCurrentGrid', () => {
    it('returns farm grid when on farm', () => {
      const game = createGame();
      game.currentMap = MapId.FARM;
      expect(getCurrentGrid(game)).toBe(game.farmGrid);
    });

    it('returns town grid when in town', () => {
      const game = createGame();
      game.currentMap = MapId.TOWN;
      expect(getCurrentGrid(game)).toBe(game.townGrid);
    });

    it('returns beach grid when at beach', () => {
      const game = createGame();
      game.currentMap = MapId.BEACH;
      expect(getCurrentGrid(game)).toBe(game.beachGrid);
    });
  });

  describe('getCurrentMapDimensions', () => {
    it('returns farm dimensions for farm', () => {
      const game = createGame();
      game.currentMap = MapId.FARM;
      const dims = getCurrentMapDimensions(game);
      expect(dims).toEqual({ width: FARM_WIDTH, height: FARM_HEIGHT });
    });

    it('returns town dimensions for town', () => {
      const game = createGame();
      game.currentMap = MapId.TOWN;
      const dims = getCurrentMapDimensions(game);
      expect(dims).toEqual({ width: TOWN_WIDTH, height: TOWN_HEIGHT });
    });
  });

  describe('updateGame', () => {
    it('does nothing when not playing', () => {
      const game = createGame();
      game.screen = GameScreen.TITLE;
      const oldTime = { ...game.time };
      updateGame(game, 1);
      expect(game.time.minute).toBe(oldTime.minute);
    });

    it('advances time when playing', () => {
      const game = createGame();
      game.screen = GameScreen.PLAYING;
      const oldMinute = game.time.minute;
      updateGame(game, 1);
      expect(game.time.minute).toBeGreaterThan(oldMinute);
    });
  });

  describe('processNewDay', () => {
    it('advances crops', () => {
      const game = createGame();
      game.farmGrid[10][10] = {
        type: game.farmGrid[10][10].type,
        watered: true,
        crop: {
          type: CropType.PARSNIP,
          stage: CropStage.SEED,
          daysGrown: 0,
          wateredToday: true,
        },
      };

      processNewDay(game);
      expect(game.farmGrid[10][10].crop?.daysGrown).toBe(1);
    });

    it('clears watered status', () => {
      const game = createGame();
      game.farmGrid[10][10].watered = true;
      processNewDay(game);
      expect(game.farmGrid[10][10].watered).toBe(false);
    });

    it('processes shipping bin', () => {
      const game = createGame();
      game.shippingBin = [
        { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 2 },
      ];
      const oldGold = game.player.gold;
      processNewDay(game);
      expect(game.player.gold).toBeGreaterThan(oldGold);
      expect(game.shippingBin).toEqual([]);
    });

    it('restores player energy', () => {
      const game = createGame();
      game.player.energy = 30;
      processNewDay(game);
      expect(game.player.energy).toBe(MAX_ENERGY);
    });

    it('resets NPC daily flags', () => {
      const game = createGame();
      game.npcs[0].talkedToday = true;
      processNewDay(game);
      expect(game.npcs[0].talkedToday).toBe(false);
    });

    it('advances day count', () => {
      const game = createGame();
      expect(game.time.day).toBe(1);
      processNewDay(game);
      expect(game.time.day).toBe(2);
    });
  });

  describe('handlePlayerMove', () => {
    it('moves player', () => {
      const game = createGame();
      game.screen = GameScreen.PLAYING;
      const startY = game.player.pos.y;
      handlePlayerMove(game, 0, 1);
      expect(game.player.pos.y).toBe(startY + 1);
    });
  });

  describe('handleMapTransition', () => {
    it('changes current map', () => {
      const game = createGame();
      handleMapTransition(game, MapId.TOWN);
      expect(game.currentMap).toBe(MapId.TOWN);
    });

    it('updates player position', () => {
      const game = createGame();
      handleMapTransition(game, MapId.TOWN);
      expect(game.player.pos).toBeDefined();
    });

    it('adds message', () => {
      const game = createGame();
      handleMapTransition(game, MapId.TOWN);
      expect(game.messages.some(m => m.includes('Town'))).toBe(true);
    });
  });

  describe('triggerSleep', () => {
    it('processes new day', () => {
      const game = createGame();
      const oldDay = game.time.day;
      triggerSleep(game);
      expect(game.time.day).toBe(oldDay + 1);
    });

    it('returns player to farm', () => {
      const game = createGame();
      game.currentMap = MapId.TOWN;
      triggerSleep(game);
      expect(game.currentMap).toBe(MapId.FARM);
    });
  });

  describe('handlePassout', () => {
    it('deducts gold', () => {
      const game = createGame();
      game.player.gold = 500;
      handlePassout(game);
      expect(game.player.gold).toBe(400);
    });

    it('restores partial energy', () => {
      const game = createGame();
      game.player.energy = 0;
      handlePassout(game);
      expect(game.player.energy).toBe(75);
    });
  });

  describe('openDialog / closeDialog', () => {
    it('opens dialog with text', () => {
      const game = createGame();
      openDialog(game, 'emily', 'Hello!');
      expect(game.screen).toBe(GameScreen.DIALOG);
      expect(game.dialogNPC).toBe('emily');
      expect(game.dialogText).toBe('Hello!');
    });

    it('closes dialog', () => {
      const game = createGame();
      openDialog(game, 'emily', 'Hello!');
      closeDialog(game);
      expect(game.screen).toBe(GameScreen.PLAYING);
      expect(game.dialogNPC).toBeNull();
    });
  });

  describe('openShop / closeShop', () => {
    it('opens shop screen', () => {
      const game = createGame();
      openShop(game);
      expect(game.screen).toBe(GameScreen.SHOP);
    });

    it('closes shop screen', () => {
      const game = createGame();
      openShop(game);
      closeShop(game);
      expect(game.screen).toBe(GameScreen.PLAYING);
    });
  });

  describe('togglePause', () => {
    it('pauses when playing', () => {
      const game = createGame();
      game.screen = GameScreen.PLAYING;
      togglePause(game);
      expect(game.screen).toBe(GameScreen.PAUSED);
    });

    it('unpauses when paused', () => {
      const game = createGame();
      game.screen = GameScreen.PAUSED;
      togglePause(game);
      expect(game.screen).toBe(GameScreen.PLAYING);
    });
  });

  describe('toggleInventory', () => {
    it('opens inventory when playing', () => {
      const game = createGame();
      game.screen = GameScreen.PLAYING;
      toggleInventory(game);
      expect(game.screen).toBe(GameScreen.INVENTORY);
    });

    it('closes inventory when open', () => {
      const game = createGame();
      game.screen = GameScreen.INVENTORY;
      toggleInventory(game);
      expect(game.screen).toBe(GameScreen.PLAYING);
    });
  });

  describe('addMessage', () => {
    it('adds message to list', () => {
      const game = createGame();
      addMessage(game, 'Test message');
      expect(game.messages).toContain('Test message');
    });

    it('keeps only last 5 messages', () => {
      const game = createGame();
      for (let i = 0; i < 10; i++) {
        addMessage(game, `Message ${i}`);
      }
      expect(game.messages.length).toBe(5);
      expect(game.messages).toContain('Message 9');
    });
  });

  describe('checkEndCondition', () => {
    it('returns false before day 28', () => {
      const game = createGame();
      game.time.day = 28;
      expect(checkEndCondition(game)).toBe(false);
    });

    it('returns true after day 28', () => {
      const game = createGame();
      game.time.day = 29;
      expect(checkEndCondition(game)).toBe(true);
    });
  });

  describe('calculateScore', () => {
    it('calculates score with gold', () => {
      const game = createGame();
      game.player.gold = 1000;
      const score = calculateScore(game);
      expect(score.gold).toBe(1000);
    });

    it('includes friendship in total', () => {
      const game = createGame();
      game.npcs[0].friendship = 200;
      const score = calculateScore(game);
      expect(score.friendship).toBe(200);
    });
  });

  describe('addToShipping', () => {
    it('adds item to shipping bin', () => {
      const game = createGame();
      const item = { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 5 };
      addToShipping(game, item);
      expect(game.shippingBin).toContainEqual(item);
    });

    it('adds message', () => {
      const game = createGame();
      const item = { type: ItemType.CROP, subType: CropType.PARSNIP, quantity: 5 };
      addToShipping(game, item);
      expect(game.messages.some(m => m.includes('shipping'))).toBe(true);
    });
  });
});
