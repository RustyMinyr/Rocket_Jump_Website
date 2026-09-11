# Drifter launch review - 11 September 2026

## Result

All 35 explorable planets passed automated browser playthroughs on desktop (1365 x 900) and phone emulation (390 x 844). Every journey visited all five stages and collected all ship parts, signals and exclusive gear. Both intentional traps and save reload passed on both layouts. No browser runtime errors were recorded.

The ice-world checkpoint recovery could repeat a fall from an overlapping platform. Recovery now starts above the highest solid checkpoint surface with a full bounce. The failing world and both complete progression runs passed after the fix.

36 focused automated tests passed across movement, combat, save isolation, owner authorization, leaderboard privacy, ratings, telemetry and offline/opt-out behavior. Production build, TypeScript and scoped lint passed. Local browser tests verified owner invitation, dashboard data, pause-aware activity, ratings, public callsigns, leaving the board, mobile layout and logout.

Browser automation covers selected routes and inputs, not every possible action, physical phone or browser engine. These results are not a guarantee of zero bugs. QA analytics and accounts were isolated from production. Owner dashboard activation awaits the confirmed owner email.

## Every destination

| Planet | Desktop | Phone | Stages |
|---|---|---|---|
| Moo-1 | Pass | Pass | 5 / 5 |
| Swiss Miss | Pass | Pass | 5 / 5 |
| Wobbleton | Pass | Pass | 5 / 5 |
| Atlant-ish | Pass | Pass | 5 / 5 |
| Slippery When Planet | Pass | Pass | 5 / 5 |
| Jurassic Parking | Pass | Pass | 5 / 5 |
| Flint Eastwood | Pass | Pass | 5 / 5 |
| Mushroom For Improvement | Pass | Pass | 5 / 5 |
| Neon Nine | Pass | Pass | 5 / 5 |
| The Lost & Foundry | Pass | Pass | 5 / 5 |
| Moon With A View | Pass | Pass | 5 / 5 |
| Prism Break | Pass | Pass | 5 / 5 |
| Quartz of Appeal | Pass | Pass | 5 / 5 |
| Mirrorball Minor | Pass | Pass | 5 / 5 |
| Plunderball | Pass | Pass | 5 / 5 |
| Barnacle Boulevard | Pass | Pass | 5 / 5 |
| Captainâ€™s Last Resort | Pass | Pass | 5 / 5 |
| Toastopia | Pass | Pass | 5 / 5 |
| Wyvern & Dine | Pass | Pass | 5 / 5 |
| Smoulder Shoulder | Pass | Pass | 5 / 5 |
| Tick Tock Rock | Pass | Pass | 5 / 5 |
| Yesterday Again | Pass | Pass | 5 / 5 |
| Tomorrow Was Cancelled | Pass | Pass | 5 / 5 |
| Velvet Hollow | Pass | Pass | 5 / 5 |
| Echo, Echo | Pass | Pass | 5 / 5 |
| Mantle Piece | Pass | Pass | 5 / 5 |
| The Floaters | Pass | Pass | 5 / 5 |
| Zephyr Gardens | Pass | Pass | 5 / 5 |
| Weather or Not | Pass | Pass | 5 / 5 |
| Seleneâ€™s Silence | Pass | Pass | 5 / 5 |
| Last Call Station | Pass | Pass | 5 / 5 |
| Departure, Eventually | Pass | Pass | 5 / 5 |
| Lost Property Moon | Pass | Pass | 5 / 5 |
| Pink Noise | Pass | Pass | 5 / 5 |
| The Unfinished Ring | Pass | Pass | 5 / 5 |
| angler | Pass | Pass | Intentional trap |
| asteroid-system | Pass | Pass | Intentional trap |
