# Homestead

A farming sim where you actually have to work for it. Plant crops, water them every day, sell the harvest, and maybe make a friend along the way.

## Why This Exists

Because sometimes you want to tend a virtual garden without installing a 50GB game. Homestead is a browser-based farming sim inspired by Harvest Moon and Stardew Valley, stripped down to the essentials: dirt, seeds, water, profit.

No dungeon crawling. No monster fighting. Just you, your hoe, and the eternal question of whether you remembered to water the cauliflower.

## Features

- **Actual farming** - Till soil, plant seeds, water daily, harvest when ready
- **Three crops** - Parsnips (fast), potatoes (medium), cauliflower (slow but lucrative)
- **Day/night cycle** - 6 AM to 2 AM, one real second per game minute
- **Energy system** - Use tools, get tired, pass out if you push it
- **Economy** - Buy seeds, sell crops, try not to go broke
- **One NPC** - Emily. She has a schedule. She likes gifts. She's the only social interaction you'll get.
- **Save/load** - Your progress persists in localStorage

## Controls

- **WASD / Arrow keys** - Move
- **1-5** - Select tool (hoe, watering can, scythe, axe, pickaxe)
- **Space** - Use selected tool
- **E** - Interact (talk to NPC, enter shop)
- **I** - Inventory
- **Escape** - Pause menu (save here)

## Farming Tips

1. Start with parsnips - 4 days to harvest, forgiving of mistakes
2. Water every single day or your crops won't grow
3. The shop is open 9 AM to 5 PM in town
4. Ship crops by selecting them in inventory
5. Shipped items sell overnight

## The Grind

You start with 500 gold and 15 parsnip seeds. Each parsnip sells for 35g, costs 20g. That's 15g profit per crop if you do everything right.

Spring has 28 days. Do the math. Or don't. Farming is about vibes, not spreadsheets.

(It's actually a lot about spreadsheets.)

## Development

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # 363 tests
npm run build  # Production build
```

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- HTML5 Canvas
- Jest

## Philosophy

1. Simple over feature-complete
2. One thing done well over ten things done poorly
3. If you can't explain the mechanic in one sentence, cut it

## License

MIT

## Author

Katie

---

*The cauliflower doesn't care about your excuses. Water it.*
