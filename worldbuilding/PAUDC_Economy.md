# Economy, Shops & Vendors — Island Commerce Module

> **FICTIONAL VIDEO GAME CONTENT.** The economy module for the PAUDC/Jamaica island
> world. **Canon decision:** the brief referenced Alexandria VA and Silver Spring MD —
> this universe already has **Alexandria** (the tech school district) and **Silver
> Springs** (the Polytech terraces) as *island districts*, so those names resolve to
> our canon locations and the world stays one coherent island. All businesses and
> brands are fictional; the black market follows the package's no-glorification rule.

## 1. Regional economy profiles (one island)

| Region | Economic engine | Texture |
|---|---|---|
| **Kingston core** | commerce + docks + music | dense retail, market streets, studio economy |
| **Resort north coast** (Montego Bay, Ocho Rios, Negril) | tourism | resorts, gift shops, tour operators, beach rentals |
| **Rural parishes / south coast** | agriculture + fishing | farm-gate prices, fish markets, craft stalls |
| **Port Antonio / PAUDC** | the base economy (canon) | canteen credits (₡), Exchange, Fort Flavor food economy |
| **Silver Springs district** | tech campus | student economy, Chromelab Re-Render queue, repair shops |
| **Alexandria district** | trade school | parts, fabrication, off-hours tinkerer market |

## 2. Shop categories

- **Food & drink:** cookshops, jerk stands (smoke = signage), patty shops, bars,
  ital stalls, resort restaurants — all feed the **Well Fed** buff table (Culinary
  Academy doc).
- **Retail:** clothes (cosmetics), electronics (Quatrefold dealers), convenience,
  pharmacies, craft markets; **Green Cross** dispensaries (licensed medical, canon
  v0.14). **Live in the prototype (v0.39):** Anchor Row's Wardrobe is the first
  real clothes-shop interaction — three colorway unlocks at escalating clout
  cost, owned fits free to re-wear (`PAUDC_Housing_Interiors.md` §3). It's the
  game's first genuine clout *sink* — every other system to this point only
  ever paid clout out.
- **Services:** barbers/salons (style = clout multipliers), auto repair (damage
  spec), taxi stands, boat rental, fuel.
- **Tourism:** tour ops, dive shops, rafting, beach chairs — tourist NPCs pay
  premium and tip.
- **Black market** (fictional factions; risk-forward): fences for "found" goods,
  off-book mechanics, counterfeit Quatrefolds that brick dramatically, Gains Trade
  serums (already canon satire). **No real contraband depicted; weapons stay within
  the Field Kit's less-lethal canon.**

## 3. Vendor behavior

Opening hours keyed to the **day/night cycle** (v0.22) and the NPC-culture routine
tables; rain pulls stalls under cover in seconds (live behavior class); restock
mornings; personality modifiers (friendly / business / distrustful / opportunistic)
select dialogue pools and bargaining tolerance; threatened vendors call the **BII**
(wanted module) — robbing shops is a fast ★★★.

## 4. Pricing system (dynamic)

`price = base × region × time × weather × reputation × scarcity × season`
- Region: rural < urban < resort; Old-Town-class premium in heritage quarters.
- Time: nightlife markup after 22:00; dawn fish cheapest at the beach.
- Weather: storm warning → batteries/board/rope surge (satirized, capped).
- Reputation: **Protector** discount, **Troublemaker** markup (NPC-culture tags).
- Scarcity: SC-ladder supply shocks; Butcher doc's dynamic pricing generalizes.
- Season: tourist high season inflates resort zones, discounts rural.
- **Bargaining minigame** at markets (Jamaica canon): a short offer/counter loop;
  respectful, winnable, never a grind.

## 5. Inventory system

Per-shop stock with restock schedules, seasonal items, rare rotating stock
(collector pull), and event stock (festival foods). Supply chains are physical:
the delivery vans on the ring road *are* the restock — intercept a Barometer
hijack mission and the shop literally restocks.

## 6. Player money flow

- **In:** missions, side jobs (taxi fares, deliveries — Low & Slow generalizes),
  **Yaad Bird shift wages** (the honest-job loop, live in the prototype v0.59),
  fishing/butcher sales, YARDCLASH purses, OnWatch sponsorships at fame tiers,
  Re-Render payouts.

### 6a. Yaad Bird — the honest-job loop (live in the prototype, v0.59)

**Yaad Bird** is the island's fried-chicken quick-serve — an **original invented
brand** in the Fort Flavor tradition (no real chain, name, logo, or recipe is
depicted). It's the game's proof that PAUDC rewards *legit* work, not just
stunts. Walk up to the counter on foot and press **O** to clock in for a
**shift of order-tickets** (upgraded from a dwell bar in v0.61): five orders
come in one at a time — **2-Piece, Festival Combo, Big Bucket, Jerk Wrap** —
and you punch the matching item (**1–4**) before each ticket expires (~3s).
Every order served pays **+8**; a clean five-for-five shift is **+40**, plus a
one-time **+10** first-shift bonus, on a short cooldown so it's a steady grind,
not a clout faucet. Miss orders and you're paid only for what you served —
a real skill loop, not a timer. It sits right beside the OnWatch clout
economy as the deliberate opposite pole: fame is loud and spiky, wages are quiet
and reliable — courtesy-first honest hustle, and a clean early-game income floor
before the big mission payouts open up.
- **Out:** food/buffs, cosmetics, repairs, fuel, ferries, housing (module later),
  BII courtesy-stop fines, black-market risk premiums.
- Two currencies stay canon: **₡ canteen credits** (base) and **J$-style street
  cash** (island), exchanged at honest-ish rates by a vendor who narrates the fee.

## 7. Black-market logic (risk system)

Trust ladder per fence (intro → regular → inner price list); every transaction
rolls BII detection scaled by Watch Level and fame ("clout is a heat map" — §4
canon); getting burned costs reputation with *legit* vendors too. Missions, not
menus: the interesting contraband is always a story beat, never a shop item.

## 8. Tourism economy

Tourist NPC class spends big, tips, clusters at POIs, evaporates in storms
(evacuation behavior), returns in season. Player-run tour side-job: ferry
tourists to waterfall/reef POIs; ratings feed clout. High season = crowds +
prices + pickpocket missions; low season = discounts + quiet + smuggler beats.

## 9. Hooks

Vendor mission-givers (NPC-culture doc §6), festival economies (calendar), the
Weathermen's supply-shock schemes (campaign act 2), and the Exchange's weekly
cosmetics rotation as the live-ops lever (systems doc §8).

> All fictional. Commerce texture is reference-based and respectful; every
> business, brand, price, and currency is invented.
