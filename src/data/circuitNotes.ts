export interface CircuitNoteDetail {
  circuit_notes: string;
  setup_notes: {
    downforce: string;
    tyres: string;
    brakes: string;
    fuel: {
      stint_recommendation: string;
    };
  };
  key_corners: string[];
  acc_speed_category: string;
  acc_overtaking_difficulty: string;
  acc_wet_weather_risk: string;
  acc_best_car_types: string[];
}

export const CIRCUIT_NOTES: Record<string, CircuitNoteDetail> = {
  "Barcelona": {
    "circuit_notes": "A true setup compromise track — the long T1-T3 complex and final sector demand downforce, while the long main straight punishes cars running too much wing. Low-fuel qualifying and race setups often differ significantly here. Tyre wear is a key strategic factor, particularly on the rear-left due to the sustained load through T3 and T9. Overtaking is difficult outside of T1 braking zones; track position matters more than at most circuits.",
    "setup_notes": {
      "downforce": "Medium-high. You need enough wing to sustain pace through the second and final sectors, but T5 and the main straight will expose any excess drag. A balanced medium-downforce setup is the baseline; lean higher for wet.",
      "tyres": "Rear-left is the critical tyre. Monitor blanket pressures carefully — Barcelona can swing between cold mornings and hot afternoons, requiring different starting pressures for the same session.",
      "brakes": "T1 and T10 are the heaviest braking zones. T10 is particularly tricky as the car is light on fuel late in a stint — bias slightly rearward to avoid front lock under trail-braking.",
      "fuel": {
        "stint_recommendation": "Approximately 65–70 litres for a standard LFM sprint race. Fuel saving is rarely required but is possible by lifting early on the T5 approach and the back straight."
      }
    },
    "key_corners": [
      "T1 (Elf): Deep braking zone, main overtaking spot — get the rotation right or the whole sector suffers",
      "T3 (Repsol): High-speed right-hander that loads the rear — a key differentiator between car types",
      "T5 (Seat): Flat or near-flat for GT3, but rewards commitment — backing off costs half a second through the complex",
      "T9 (New Holland): Slow hairpin, last real overtaking opportunity before the final sector"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "low",
    "acc_best_car_types": ["Balanced downforce cars", "Strong rear-stability cars"]
  },
  "Brands Hatch": {
    "circuit_notes": "One of the most unforgiving circuits in ACC for mistakes — narrow with barriers close on both sides and dramatic elevation change through Paddock Hill and Druids. The Indy layout is short enough that traffic management in races is critical. Cars with strong front-end grip through medium-speed corners (Porsche, Ferrari) are naturally suited here. Overtaking is genuinely difficult; the main opportunities are Druids and Surtees, and both require a healthy risk appetite.",
    "setup_notes": {
      "downforce": "Medium-high. The lack of long straights means there's little drag penalty for running more wing, and the flowing sections demand front-end stability. Don't sacrifice mechanical grip for aero efficiency here.",
      "tyres": "Front-left takes heavy load through Paddock Hill Bend and the fast left-handers. Tyre wear is moderate for the lap length but the short lap means more total laps — check long-run degradation carefully.",
      "brakes": "Druids is a heavy, late braking zone that rewards confidence. Graham Hill Bend is deceivingly short — overbraking here kills the exit onto the pit straight. Bias slightly forward for initial stability.",
      "fuel": {
        "stint_recommendation": "Approximately 50–55 litres for sprint races. The short lap length means frequent crossings of the pit window — plan stops carefully."
      }
    },
    "key_corners": [
      "Paddock Hill Bend (T1): Blind entry over a crest, car goes light — don't brake too late or understeer will push you wide",
      "Druids (T3): Main overtaking zone, tight hairpin — try to take the inside line but don't dive blindly",
      "Surtees (T7): High-speed, slightly blind right-hander — one of the lap's defining commitment corners",
      "Clearways (T9): Last corner onto the pit straight — a good exit here makes or breaks the overtaking opportunity at T1"
    ],
    "acc_speed_category": "medium_speed",
    "acc_overtaking_difficulty": "hard",
    "acc_wet_weather_risk": "medium",
    "acc_best_car_types": ["Strong front-end cars", "Agile mid-engine platforms"]
  },
  "COTA": {
    "circuit_notes": "A technically demanding circuit with two very different halves. The sweeping first sector (T2–T9) is high-speed and aero-sensitive; the second half is slow and technical with heavy braking. The combination means setup compromise is unavoidable. Front-engine cars can struggle with the slow-speed changes of direction in the final sector. The long main straight makes DRS-style slipstreaming decisive, and overtaking into T1 is realistic with a big speed advantage.",
    "setup_notes": {
      "downforce": "Medium. The S1 sweeps demand downforce, but the back straight into T12 will expose drag. A medium wing setting works across both sectors; aggressive setups can go lower but at the cost of T3–T9 stability.",
      "tyres": "High-speed S1 loads the fronts, while the slow-speed S3 hammers the rears under traction. A balanced tyre temperature is hard to achieve — monitor both ends carefully across a stint.",
      "brakes": "T1 and T11 (the hairpin) are the heaviest zones. T1 is particularly risky in traffic at race start — go in hot and you'll punt someone. T11 is crucial for traction out of the final corner.",
      "fuel": {
        "stint_recommendation": "Approximately 65–70 litres. The mixed character of the lap makes fuel saving viable on the S2 approach and the back straight, particularly late in a stint."
      }
    },
    "key_corners": [
      "T1: Heavy braking after the long straight — a genuine overtaking spot but chaos at the start",
      "T2–T9 (The Esses): Flowing high-speed sweeps — set car to be stable here and accept some understeer in the slow stuff",
      "T11 (The Hairpin): Tight, slow hairpin — clean entry and early rotation is essential for the back straight",
      "T16–T18: Technical final sector — exit T18 well and the straight gives you DRS-zone speed advantage into T1"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "low",
    "acc_best_car_types": ["Balanced downforce cars", "Good rear traction cars"]
  },
  "Donington Park": {
    "circuit_notes": "Donington rewards cars with strong high-speed stability and good traction out of slow corners. The Craner Curves are the defining sequence — a flat or near-flat downhill right-left combination that separates confident setups from nervous ones. The Melbourne Hairpin and Goddards are the only real overtaking opportunities, both requiring heavy braking after fast approach speeds. A narrow circuit where position defence is relatively easy.",
    "setup_notes": {
      "downforce": "Medium-high. The Craner Curves demand rear stability — don't sacrifice wing angle chasing the Starkeys straight. A stable, planted car is faster over a lap here than a slippery one.",
      "tyres": "The Craner Curves load the rear axle significantly. Front-left also works hard through the Chicane and Old Hairpin complex. Balance tyre pressures to avoid graining on the front in cooler conditions.",
      "brakes": "Melbourne Hairpin is the key braking zone — heavy, late, and with a long approach from the Craner Curves exit. Old Hairpin and Goddards both reward a slightly early turn-in to maximise exit traction.",
      "fuel": {
        "stint_recommendation": "Approximately 55–60 litres. A relatively short lap with limited fuel-saving opportunities — the fast sections demand commitment."
      }
    },
    "key_corners": [
      "Craner Curves: Downhill right-left at high speed — requires car to be stable and planted; a nervous setup will snap here",
      "Melbourne Hairpin (T6): Main overtaking zone — commit to a late braking point or get passed on the outside",
      "Chicane (T8–T9): Tight sequence after the Old Hairpin approach — clean execution sets up the fast final sector",
      "Goddards (T12): Final hairpin onto the start-finish straight — traction here defines your speed into Melbourne"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "medium",
    "acc_best_car_types": ["Rear-stable cars", "Good traction cars"]
  },
  "Hungaroring": {
    "circuit_notes": "The most overtaking-resistant circuit in the ACC calendar. The Hungaroring is a twisty, low-speed track with minimal straight length — qualifying position is critical and defending on track is straightforward. Cars with strong mechanical grip and good slow-speed rotation (Porsche, McLaren) are significantly advantaged. Tyre management is paramount; the abrasive surface and high corner count punish aggressive driving styles in longer stints.",
    "setup_notes": {
      "downforce": "High. There is almost no meaningful straight on which drag matters — maximise downforce for the sustained slow and medium-speed corners. Don't compromise aero for top speed here.",
      "tyres": "One of the highest tyre-wear circuits in ACC. The sustained cornering on a rough surface degrades all four tyres faster than most tracks. Run slightly softer pressures and manage heat carefully — pushing hard in the middle of a stint will destroy your pace in the final laps.",
      "brakes": "T1 and T2 are the main braking zones, both requiring late, confident inputs. The stop-start nature of the lap means brake temperatures stay moderate — cooling is rarely an issue.",
      "fuel": {
        "stint_recommendation": "Approximately 60–65 litres. Fuel saving is possible on the exit of T4 and approaching T11, but the nature of the lap limits saving opportunities significantly."
      }
    },
    "key_corners": [
      "T1: Only viable overtaking spot — into a tight left after a short straight; defensive lines are extremely effective",
      "T4: Slow hairpin requiring patience — rushing the entry destroys exit speed through the following sequence",
      "T6–T8: Flowing mid-sector complex — a clean chain here is worth more than being fast in any single corner",
      "T11–T12: Final tight sequence — strong rotation and early throttle application defines the lap's closing sector"
    ],
    "acc_speed_category": "low_speed",
    "acc_overtaking_difficulty": "hard",
    "acc_wet_weather_risk": "low",
    "acc_best_car_types": ["High mechanical grip cars", "Strong rotation cars"]
  },
  "Imola": {
    "circuit_notes": "Imola is uncompromising — high entry speeds into braking zones with limited run-off means mistakes are expensive. The anti-clockwise layout puts unusual load on the right-side tyres over a lap. The Tamburello and Villeneuve chicanes are flat-out in GT3 but demand absolute commitment. Overtaking is genuinely difficult and mostly happens at Tosa or as a result of a safety car restart. Front-engine cars with good stability under trail-braking tend to suit the circuit well.",
    "setup_notes": {
      "downforce": "Medium. The Rivazza and Acque Minerali sections require grip, but the back straight is long enough that excess drag is punished. A balanced medium setting with focus on mechanical grip is the right starting point.",
      "tyres": "The anti-clockwise direction loads the right-front and right-rear more than usual. Monitor right-side tyre temperatures carefully — an imbalanced setup will cause the right-front to overheat and grain.",
      "brakes": "Tosa (T4) is the heaviest braking zone and the prime overtaking spot. Acque Minerali requires confidence — going in too deep destroys the Piratella exit. Brake bias slightly rearward to manage front fade on longer stints.",
      "fuel": {
        "stint_recommendation": "Approximately 60–65 litres. Some fuel saving is possible lifting into the Variante Alta chicane and on the Rivazza approach."
      }
    },
    "key_corners": [
      "Tamburello (T1–T2): Flat or near-flat chicane — any hesitation costs a significant chunk of time",
      "Tosa (T4): Main overtaking spot — heavy braking into a tight left hairpin; commit or get passed",
      "Piratella (T8): Blind, high-speed right-hander over a crest — one of the most committed corners in ACC",
      "Rivazza (T15–T16): Final double-left chicane — a clean exit here defines your speed onto the main straight"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "hard",
    "acc_wet_weather_risk": "medium",
    "acc_best_car_types": ["Stable front-end cars", "Good trail-braking platforms"]
  },
  "Indianapolis": {
    "circuit_notes": "Indianapolis is defined by its massive front straight — slipstreaming and DRS-style tow battles are decisive. The infield is a tight, technical section that rewards clean, consistent driving rather than outright pace. The transition from the oval banking into the infield creates an unusual entry characteristic that catches drivers out. Cars with strong straight-line speed and good braking stability under a tow (BMW, Mercedes) are naturally suited here.",
    "setup_notes": {
      "downforce": "Low-medium. The front straight is long enough to reward a slippery setup, but the infield has enough technical sections to punish going too low. Lean toward low downforce in dry conditions, add wing for the wet.",
      "tyres": "The oval banking section creates a unique loading pattern on the left-side tyres. Front-right works hard in the technical infield. Monitor both sides independently across a stint.",
      "brakes": "The braking zone from the oval into T1 of the infield is the most critical — extremely heavy, coming from high speed on banking. The infield chicanes are moderate but require precision to avoid penalty box violations.",
      "fuel": {
        "stint_recommendation": "Approximately 60–65 litres. Fuel saving is viable by lifting early onto the oval section and managing the infield approach zones."
      }
    },
    "key_corners": [
      "T1 (Oval to infield): Heavy braking from oval speed into the tight infield entry — a prime overtaking spot and crash hotspot",
      "T5–T7 (Infield chicane): Tight technical sequence — cleanliness matters more than attack; errors here cost 2–3 seconds",
      "T12: Final corner onto the front straight — good exit here makes or breaks overtaking attempts into T1",
      "Banking section: Unique in ACC — maintain consistent speed through the banking transition to optimise tow effect"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "easy",
    "acc_wet_weather_risk": "low",
    "acc_best_car_types": ["Low-drag GT3 cars", "Strong straight-line cars"]
  },
  "Kyalami": {
    "circuit_notes": "Kyalami is a high-altitude circuit (1,454m above sea level) which reduces aerodynamic efficiency and engine power — cars behave differently here than at sea level, and reference lap times don't translate from other circuits. The long front straight makes slipstreaming decisive, and the Clubhouse complex at the end of the back straight is the best overtaking spot. Mid-engine cars that generate strong mechanical grip suit the technical infield. Tyre degradation is moderate but consistent.",
    "setup_notes": {
      "downforce": "Medium. The altitude reduces the effective downforce generated by wings — you need more wing angle than you would at sea level to achieve the same grip levels. Don't copy Barcelona setups directly; add half a click of downforce as a starting point.",
      "tyres": "The high altitude and generally warm ambient temperatures combine to heat tyres faster than expected. Start on the lower end of your pressure range and expect them to climb quickly in Q and early race laps.",
      "brakes": "Clubhouse is the heaviest braking zone — long approach from high speed on the back straight. The altitude means engine braking is slightly reduced, so brake slightly earlier than instinct suggests on first visit.",
      "fuel": {
        "stint_recommendation": "Approximately 65–70 litres. Fuel saving is viable on the long straight approaches and within the infield."
      }
    },
    "key_corners": [
      "Clubhouse corner (T1): Main overtaking spot after the long back straight — heavy braking into a tight right",
      "Sunset Bend (T4): High-speed right-hander — a confidence corner that rewards commitment and punishes hesitation",
      "Crocodile (T9–T10): Technical tight sequence in the infield — patience and early throttle application is key",
      "Front straight chicane: Flat in GT3 but unsettles the car — smooth inputs preserve front-end stability"
    ],
    "acc_speed_category": "high_speed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "high",
    "acc_best_car_types": ["Mid-engine GT3 cars", "Mechanically grippy platforms"]
  },
  "Laguna Seca": {
    "circuit_notes": "Laguna Seca is defined entirely by the Corkscrew — but it's the approach and exit that matter as much as the corner itself. The blind crest entry and dramatic drop demand total commitment and precise reference points. The Andretti Hairpin is a key overtaking spot, but the narrow track and aggressive kerbs make it high-risk. Low-downforce options are limited; this is a high-grip, medium-downforce circuit that rewards mechanical balance. Tyre wear is significant on the front-left.",
    "setup_notes": {
      "downforce": "Medium-high. Laguna Seca's fast and medium-speed corners benefit from consistent downforce. The absence of a true long straight means there's little drag cost to running more wing.",
      "tyres": "Front-left takes heavy load through the Corkscrew and Turn 2. Monitor its temperature closely — it will deteriorate faster than the others in long stints. Starting pressures should be conservative.",
      "brakes": "Andretti Hairpin (T2) is the heaviest braking zone and a genuine overtaking spot. The Corkscrew has a moderate braking element but it's blind — reference points are critical. Don't lock the fronts on the downhill.",
      "fuel": {
        "stint_recommendation": "Approximately 55–60 litres. The short lap length limits total race distance — saving is rarely required."
      }
    },
    "key_corners": [
      "Andretti Hairpin (T2): Best overtaking opportunity — late braking on the inside, but wide exits get punished by the kerb",
      "The Corkscrew (T8–T9): Blind entry over a crest dropping 10 stories — pick a reference point and commit, every time",
      "Turn 5 (Rainey): Fast right-hander after the Corkscrew descent — don't be distracted by surviving T8–T9, carry speed through here",
      "Turn 11 (Moss Corner): Final corner onto the main straight — important traction zone, but watch the exit kerb which can launch the car"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "low",
    "acc_best_car_types": ["Mechanically balanced cars", "Strong front-end cars"]
  },
  "Misano": {
    "circuit_notes": "Misano is a short, punchy circuit where qualifying pace and T1 position are decisive. The track has a deceptively high apex speed throughout — mid-speed corners flow into each other, requiring a setup that is planted and consistent rather than spectacular in any single zone. Traction out of the final chicane onto the main straight is the single most important element of a fast lap. Front-engine cars with good stability and predictable balance (BMW, Mercedes) are well suited.",
    "setup_notes": {
      "downforce": "Medium. The circuit is not particularly high-speed but the flowing, connected corners benefit from consistent downforce. A balanced medium setup works well across conditions.",
      "tyres": "Rear-right is the most stressed tyre due to the clockwise direction and traction demands out of the final complex. Monitor rear temperatures carefully — a rear-heavy setup will cause premature degradation.",
      "brakes": "T1 is the main braking zone and overtaking spot. The final chicane requires confidence — a slight lift rather than heavy braking keeps the car planted for the crucial traction zone.",
      "fuel": {
        "stint_recommendation": "Approximately 55–60 litres. Fuel saving is viable with early lifts on the approach to T1 and into the final chicane."
      }
    },
    "key_corners": [
      "T1 (Rio): Heavy braking into a tight left — position here defines the opening laps of any race",
      "T4 (Tramonto): Medium-speed left that loads the rear — a crucial flowing corner that sets up the back section",
      "T10–T11 (Quercia): Slow right-left chicane — patience and early throttle here is the biggest single gain on this circuit",
      "T14–T15 (Final chicane): Last corner complex — nail the exit and the main straight is fast; get it wrong and you lose the tow"
    ],
    "acc_speed_category": "medium_speed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "low",
    "acc_best_car_types": ["Stable front-end cars", "Good traction cars"]
  },
  "Monza": {
    "circuit_notes": "Slipstream is decisive here — drafting can be worth 0.5s+ per lap. The three chicanes heavily punish kerb-hopping with mid-engine cars. Front-engine cars (Mercedes, BMW) handle Monza's chicane kerbs better. Low downforce means braking is critical and lateral grip is limited.",
    "setup_notes": {
      "downforce": "Minimum possible. Monza is the lowest-downforce circuit in the ACC calendar — run the least wing the car can handle without instability through the Lesmos and Parabolica.",
      "tyres": "Tyre stress is surprisingly high for a low-grip setup circuit — the heavy braking zones and kerb impacts at the chicanes spike temperatures. Monitor front temperatures; cold conditions can cause graining in the opening laps.",
      "brakes": "The hardest braking circuit in ACC. Both chicanes and the Parabolica are heavily loaded stops from very high speeds. Brake cooling is critical — run open ducts and check temperatures throughout qualifying.",
      "fuel": {
        "stint_recommendation": "Approximately 65–70 litres. Fuel saving is relatively easy by lifting early on the approaches to the chicanes — the long straights give plenty of coasting distance."
      }
    },
    "key_corners": [
      "Variante del Rettifilo (T1–T2): First chicane — the opening lap concertina makes this the highest-risk corner in the race",
      "Variante della Roggia (T3–T4): Second chicane — less chaotic than T1 but still a significant contact zone on lap 1",
      "Lesmo 1 & 2 (T6–T7): Medium-speed right-handers — define how fast you can carry into the back section; don't sacrifice these for chicane setup",
      "Parabolica (T11): Long right-hander onto the main straight — the most important corner for race pace; late apex and early throttle"
    ],
    "acc_speed_category": "high_speed",
    "acc_overtaking_difficulty": "easy",
    "acc_wet_weather_risk": "low",
    "acc_best_car_types": ["Low-drag GT3 cars", "Front-engine cars"]
  },
  "Mount Panorama": {
    "circuit_notes": "Mount Panorama is the most unforgiving circuit in ACC — the mountain section has no run-off and the walls are millimetres from the racing line. The downhill from McPhillamy Park to The Dipper is the critical sequence: mid-engine cars are more nervous here due to rear weight bias over the crests. The Chase is heavily loaded and the exit kerb can launch the car into the wall. In the wet, this circuit becomes genuinely dangerous — extreme caution is required through the mountain. Position is almost impossible to recover once lost here.",
    "setup_notes": {
      "downforce": "High. The mountain section demands maximum mechanical and aerodynamic stability. Running low downforce at Bathurst is a risk not worth taking — the wall doesn't move.",
      "tyres": "The extreme gradient changes create unusual loading patterns — the downhill section spikes front temperatures while the flat Conrod section loads the rears. Balance is challenging; start conservative and adjust after a long run.",
      "brakes": "Griffins Bend and The Chase are the heaviest braking zones. The downhill approach to The Dipper requires confidence under threshold braking — any locking will send you straight into the wall. Cooling is essential.",
      "fuel": {
        "stint_recommendation": "Approximately 75–80 litres for endurance stints. Fuel saving is viable on Conrod Straight and the approach to T1 — but don't compromise your mountain section pace to save fuel."
      }
    },
    "key_corners": [
      "Hell Corner (T1): Tight right into the mountain — congested at race start, high-risk for contact",
      "McPhillamy Park (T19): Fast right near the mountain top — defines your entire descent; get it wrong and the wall at The Dipper finds you",
      "The Dipper (T20): Blind, downhill, off-camber right — one of the most demanding single corners in sim racing; commit and trust your setup",
      "The Chase (T22–T23): Heavy braking chicane at the mountain base — exit speed here is critical for Conrod Straight"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "hard",
    "acc_wet_weather_risk": "very_high",
    "acc_best_car_types": ["Front-engine stable cars", "Predictable balance cars"]
  },
  "Nordschleife": {
    "circuit_notes": "The Nordschleife is in a category of its own — 170+ corners, 23km of track with massive elevation change, blind crests, and walls everywhere. It is less about setup optimisation and more about learning the circuit and building confidence over many laps. Mid-engine cars are more nervous over the dramatic blind crests; front-engine platforms feel more planted through Fuchsröhre and the Carousel. This is the only track in ACC where learning the circuit matters infinitely more than setup.",
    "setup_notes": {
      "downforce": "Medium-high. The variety of corner types across the lap means a compromise is inevitable. Lean toward stability — the consequence of instability at the Nordschleife is always a wall.",
      "tyres": "Tyre management across a 8+ minute lap is complex. Different sections of the track load different axles — the Nordschleife will reveal tyre imbalances that other tracks hide. Set pressures conservatively and monitor temperatures at sector points.",
      "brakes": "There are over 30 significant braking zones. Brake temperatures will vary enormously across the lap — the long high-speed sections allow cooling between the heavy zones. Don't run aggressive brake cooling that works at Spa; the Nordschleife's stop-start nature demands a different strategy.",
      "fuel": {
        "stint_recommendation": "Approximately 100–110 litres for endurance racing. Fuel saving is possible on the multiple flat-out sections by lifting slightly before the braking zones."
      }
    },
    "key_corners": [
      "Hatzenbach (T3–T8): Opening technical sequence — sets the rhythm for the early sector; be smooth",
      "Fuchsröhre (T20): High-speed downhill compression — one of the most impressive flat-out sections in sim racing",
      "Karussell (T67): Banked concrete carousel — drop into the banking for the correct line; running outside is slower and harder on tyres",
      "Galgenkopf (T97): Long, loaded right-hander late in the lap — front-left is critical here after 7 minutes of running"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "very_high",
    "acc_best_car_types": ["Front-engine stable cars", "High mechanical grip cars"]
  },
  "Nürburgring": {
    "circuit_notes": "The GP circuit is a very different challenge to the Nordschleife — compact, technical, and with genuine overtaking opportunities at the Mercedes Arena and Dunlop hairpin. The cascading second sector is the fastest and most rewarding part of the lap, where cars with good high-speed stability can carry significant speed. The bus-stop chicane before the final hairpin is the biggest single overtaking opportunity. Tyre wear is moderate but consistent braking cycles take a toll on fronts.",
    "setup_notes": {
      "downforce": "Medium. The technical first sector benefits from downforce, but the fast second sector is where the lap is made or lost. A balanced medium setup that doesn't compromise S2 speed is the right approach.",
      "tyres": "Front-left is the key tyre given the varied load through S1 and the heavy braking cycles. Moderate wear circuit overall — manageable in sprint races but requires monitoring in longer stints.",
      "brakes": "Mercedes Arena (T1) and the Dunlop hairpin (T11) are the primary zones. The bus-stop chicane is a secondary braking point but crucial for the final hairpin approach. Moderate brake cooling required.",
      "fuel": {
        "stint_recommendation": "Approximately 60–65 litres. Some saving possible with early lifts into T11 and on the approach to the final chicane."
      }
    },
    "key_corners": [
      "Mercedes Arena (T1–T2): Tight opening complex — main overtaking zone, especially under braking into T1",
      "Dunlop Kehre (T11): Heavy braking hairpin — second overtaking spot; clean entry is more important than being last on the brakes",
      "Schumacher S (T6–T8): Cascading fast corners in S2 — one of the most enjoyable sequences in ACC when nailed",
      "NGK Chicane (T12–T13): Bus-stop complex before the final hairpin — sacrifice speed here to maximise exit onto the straight"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "medium",
    "acc_best_car_types": ["Balanced downforce cars", "Good braking stability cars"]
  },
  "Oulton Park": {
    "circuit_notes": "Oulton Park is narrow, bumpy, and demanding — one of the most physical circuits in the ACC calendar. The track surface rewards smooth inputs heavily; aggressive drivers who attack kerbs will be punished more here than anywhere else. Knickerbrook and the Island Hairpin are the key sections that define lap time. Overtaking is very difficult given the circuit's width. Mid-engine cars on the edge of oversteer find Oulton particularly punishing — stable, planted setups are essential.",
    "setup_notes": {
      "downforce": "High. There are no significant straights to punish drag, and the bumpy, technical nature of the track demands maximum stability and mechanical grip.",
      "tyres": "The rough surface and high corner count create significant tyre stress. Running pressures slightly lower than usual helps compliance over the bumps and reduces thermal stress.",
      "brakes": "Island Hairpin and Druids are the main zones. The approach to Knickerbrook has a heavy braking element that catches drivers out due to the surface's bump profile. Be conservative with bias — the rear can lock unpredictably on bumps.",
      "fuel": {
        "stint_recommendation": "Approximately 55–60 litres. Limited fuel-saving opportunity given the stop-start nature of the lap."
      }
    },
    "key_corners": [
      "Old Hall (T1): Fast right-hander into the opening section — sets up the whole first sector; smooth entry, carry speed",
      "Knickerbrook (T5–T6): Blind, downhill chicane — one of the most challenging sequences in ACC; feel your way in until you have a reference",
      "Island Hairpin (T8): Tight hairpin — only significant overtaking zone, but the approach is fast so commitment is required",
      "Druids (T9): Long, tightening right-hander — the exit here defines your speed onto the longest straight on the circuit"
    ],
    "acc_speed_category": "medium_speed",
    "acc_overtaking_difficulty": "hard",
    "acc_wet_weather_risk": "high",
    "acc_best_car_types": ["Stable mechanical grip cars", "Smooth power delivery cars"]
  },
  "Paul Ricard": {
    "circuit_notes": "Paul Ricard looks straightforward on paper but is deceptive in practice — the blue and red tarmac run-off areas catch out drivers who misjudge the final turn or the Signes right-hander. The long Mistral straight makes slipstream relevant, and the chicane interrupting it is a key overtaking point. Downforce choice is a significant setup decision here. Cars with strong braking stability and good rear grip through the fast Signes benefit most.",
    "setup_notes": {
      "downforce": "Low-medium. The Mistral straight is long and punishes drag significantly. However Signes and the Beausset complex require grip. Lean slightly low on downforce in dry conditions.",
      "tyres": "The track surface is low-grip by ACC standards. Tyre heat builds slowly here — be careful not to push the fronts too hard in the early laps before they're up to temperature. Front-left is the key tyre through the Beausset complex.",
      "brakes": "The chicane on the Mistral straight (T8) is the heaviest braking zone and main overtaking spot. The final corner (T15) is a critical braking zone that catches drivers — turn in too early and the exit asphalt runs out.",
      "fuel": {
        "stint_recommendation": "Approximately 65–70 litres. The long straight makes fuel saving particularly effective — easy to lift and coast into the Mistral chicane."
      }
    },
    "key_corners": [
      "T1 (Sainte-Baume): Opening right-hander — the tarmac run-off invites late braking that usually causes wide exits; respect the track limits",
      "Mistral Chicane (T8): Main overtaking spot interrupting the long back straight — easy to be too ambitious here in traffic",
      "Signes (T10): Fast, long right-hander at the end of the back straight — one of the most speed-defining corners; flat in GT3 but demands commitment",
      "T15 (Final corner): Deceptive tight right leading to the pit straight — the run-off looks inviting but track limit penalties are common here"
    ],
    "acc_speed_category": "high_speed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "low",
    "acc_best_car_types": ["Low-drag GT3 cars", "Stable rear cars through high-speed corners"]
  },
  "Red Bull Ring": {
    "circuit_notes": "Red Bull Ring is short, punchy, and heavily biased toward power and braking stability. With only 9 corners and a lap under 70 seconds, small mistakes are magnified enormously. Turn 3 (the uphill right-hander) is the defining corner — cars that can carry more speed here are significantly faster across the lap. The track rewards front-engine cars with strong braking characteristics and good traction. Overtaking is possible but limited — T1 and T4 are the main spots.",
    "setup_notes": {
      "downforce": "Low-medium. The short lap has two long straights that punish drag. However T3 and T6 need stability — don't go too low or the circuit's fast, open corners become treacherous.",
      "tyres": "Extremely short lap means many laps in a stint and high overall tyre stress. The high-speed T3 loads the rear significantly. Tyre temperatures build fast — starting pressures should be on the lower end.",
      "brakes": "T1 and T4 are the heaviest braking zones and both are overtaking opportunities. The short lap means brakes rarely cool between stops — run adequate cooling for sustained race pace.",
      "fuel": {
        "stint_recommendation": "Approximately 45–50 litres. The short lap means careful pit window calculation — one stop races can require very controlled pace management."
      }
    },
    "key_corners": [
      "T1 (Castrol): Heavy braking into a tight right — main overtaking point and first-lap incident hotspot",
      "T3 (Remus): Uphill, fast right-hander — the fastest corner on the circuit and where GT3 cars separate; mid-engine cars can be nervous here",
      "T4 (Schlossgold): Hairpin after the back straight — second overtaking spot; securing the inside line here is all that matters",
      "T6 (Rindt): Final complex onto the main straight — an underrated corner that defines your exit speed and the straight-line battle into T1"
    ],
    "acc_speed_category": "high_speed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "medium",
    "acc_best_car_types": ["Front-engine cars", "Strong braking stability cars"]
  },
  "Silverstone": {
    "circuit_notes": "Silverstone is a high-speed, high-downforce circuit where aerodynamic efficiency and mechanical balance are both critical. The Maggots-Becketts-Chapel complex is the fastest sequence in ACC — cars with strong front-end and good aero stability are significantly faster through there. Copse and Stowe are the primary overtaking opportunities. Tyre wear is high due to sustained high-speed loading, making degradation management a key race strategy element.",
    "setup_notes": {
      "downforce": "High. Maggots-Becketts-Chapel simply cannot be negotiated at pace without strong downforce — the lateral g-loading is immense. Rear stability at high speed is the primary requirement.",
      "tyres": "One of the highest tyre-wear circuits in ACC. Rear-left takes significant load through the Maggots-Becketts complex. Managing degradation over long stints is critical — a worn rear-left will cost multiple seconds per lap by the end of a stint.",
      "brakes": "Copse and Stowe are the main zones. The approach to Village and The Loop requires moderate braking but good balance is essential — the car is unsettled at high speed and any instability under braking shows itself here.",
      "fuel": {
        "stint_recommendation": "Approximately 70–75 litres. Limited fuel saving due to the high-speed nature — opportunities exist approaching the Hangar Straight and Vale."
      }
    },
    "key_corners": [
      "Copse (T1): Fast right, main overtaking point — looks flat but requires commitment; backing off mid-corner is worse than carrying speed",
      "Maggots-Becketts-Chapel (T6–T8): The iconic fast complex — the single fastest sequence in ACC; front-engine cars shine here",
      "Stowe (T14): Long right-hander after the Hangar Straight — underrated overtaking opportunity, particularly late in a race",
      "Club (T17): Final corner onto the start-finish straight — a long right-hander where exit speed directly creates overtaking potential into Copse"
    ],
    "acc_speed_category": "high_speed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "high",
    "acc_best_car_types": ["High downforce stable cars", "Strong front-end cars"]
  },
  "Snetterton": {
    "circuit_notes": "Snetterton is a driver's circuit that rewards commitment and precision over raw speed. The Brundle and Nelson sequence in the mid-sector is technically demanding and poorly rewarded by half-measures. The Bomb Hole chicane is a track-limit trap. Low overtaking opportunities make qualifying crucial, but the relatively long Russell straight does provide some opportunity at the chicane into Coram. Front-engine cars with strong stability through the faster sections are well suited.",
    "setup_notes": {
      "downforce": "Medium. The Russell straight punishes excess drag, but the Brundle-Nelson complex and the faster sections need grip. A balanced medium setting is the correct compromise.",
      "tyres": "Front-left works hard through the sustained cornering in S2. Tyre wear is moderate — manageable in sprint races but will require monitoring in longer stints with high ambient temperatures.",
      "brakes": "The chicane into Coram (T9) is the heaviest braking zone and main overtaking spot. Brundle (T5) has a significant braking element despite its flowing nature — don't carry too much speed into the apex.",
      "fuel": {
        "stint_recommendation": "Approximately 60–65 litres. Some saving viable with early lifts on the Russell straight approach."
      }
    },
    "key_corners": [
      "Riches (T1): Opening right-hander — sets up the entire first sector; smooth entry avoids understeer into the following section",
      "Brundle (T5): Fast, flowing left — requires commitment to carry speed into Nelson; the two corners together define S2 pace",
      "Nelson (T6): Tight right after Brundle — delayed apex and early throttle is the right approach; patience here pays",
      "Coram (T9–T10): Main overtaking zone — the chicane approach allows late braking, but the run-off invites over-ambition"
    ],
    "acc_speed_category": "mixed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "medium",
    "acc_best_car_types": ["Stable balanced cars", "Strong front-end cars"]
  },
  "Spa": {
    "circuit_notes": "Spa is the benchmark circuit for ACC — long, fast, and technically diverse. Eau Rouge-Raidillon is taken flat in GT3 and is not where time is made; the Kemmel straight top speed, the Les Combes braking zone, and the Pouhon complex are. Cars with strong high-speed stability and efficient aerodynamics excel here. Weather is highly unpredictable — the full circuit can have dry conditions in S1 and a monsoon in S2 simultaneously. The long Kemmel straight makes slipstream battles decisive in race conditions.",
    "setup_notes": {
      "downforce": "Medium-low. The Kemmel straight is 1km long and braking from 270+ km/h — drag is costly. However Pouhon, Blanchimont, and the Bus Stop require stability. Don't go too low — the consequences of instability at Spa are severe.",
      "tyres": "Longest circuit in ACC means complex thermal management. Front-right loads heavily through the long left-handers (Pouhon, Eau Rouge). Rear-left takes load through Raidillon and the fast right-handers. Monitor all four independently.",
      "brakes": "Les Combes (T5–T6) and Stavelot (T13) are the heaviest braking zones. Braking from Kemmel straight speed requires total confidence — any instability at 265km/h is catastrophic. Cooling is very important given the heavy, sustained braking.",
      "fuel": {
        "stint_recommendation": "Approximately 80–85 litres. Significant fuel saving is viable with early lifts on the Kemmel approach and coasting into Stavelot."
      }
    },
    "key_corners": [
      "Eau Rouge-Raidillon (T3–T4): Flat in GT3 — do not lift; backing off mid-corner is more dangerous than committing fully",
      "Les Combes (T5–T6): Main overtaking zone after the Kemmel straight — very high speed approach, heavy braking; this is where races are won and lost",
      "Pouhon (T10): Fast double-left — one of the most impressive corners in GT3 at 190+ km/h; front-end stability is everything here",
      "Bus Stop Chicane (T18–T19): Final complex — respect the kerbs; the exit leads onto the main straight and directly into the next lap's Eau Rouge"
    ],
    "acc_speed_category": "high_speed",
    "acc_overtaking_difficulty": "easy",
    "acc_wet_weather_risk": "very_high",
    "acc_best_car_types": ["Efficient aero cars", "High-speed stable cars"]
  },
  "Suzuka": {
    "circuit_notes": "Suzuka is unique in ACC — the figure-of-eight layout creates a crossover bridge and unusual sector sequencing. The S-Curves in S1 are the technical centrepiece and reward smooth, flowing inputs. 130R is flat in GT3 and defines the car's high-speed stability credentials. The Degner Curves are a key overtaking spot along with the chicane. Mid-engine cars are often more nervous through the S-Curves and 130R than front-engine platforms.",
    "setup_notes": {
      "downforce": "Medium-high. The S-Curves, 130R, and Spoon Curve all require high-speed stability. The main straight and back section have enough speed to make drag relevant but not at the expense of the technical sections.",
      "tyres": "Front-right loads heavily through the left-hand S-Curves and Spoon. Rear stability is challenged through 130R. All four tyres work in different regimes across this unusual lap — a balanced setup is critical.",
      "brakes": "Degner 1 (T7) and the chicane (T15–T16) are the primary zones. The chicane is the main overtaking spot and requires a late braking approach to defend or attack. Brake cooling is important given the sustained high-speed sections.",
      "fuel": {
        "stint_recommendation": "Approximately 75–80 litres for endurance events. Fuel saving viable on the back straight and Degner approach."
      }
    },
    "key_corners": [
      "S-Curves (T3–T6): Flowing, high-speed right-left sequence — the defining technical zone of the lap; smooth is fast, rough is slow",
      "Degner 1 (T7): Main overtaking opportunity — heavy braking into a tight right with a good straight approach",
      "130R (T13): Near-flat fast left — commitment corner that defines high-speed stability; mid-engine cars need a stable setup here",
      "Chicane (T15–T16): Second overtaking spot before the final hairpin — late braking on the inside line is the move"
    ],
    "acc_speed_category": "high_speed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "high",
    "acc_best_car_types": ["Front-engine stable cars", "Smooth power delivery cars"]
  },
  "Valencia": {
    "circuit_notes": "Valencia is a technical, low-to-medium speed circuit where corner exit traction is the defining characteristic. The lap is highly stop-start with few flowing sections — cars that generate strong rear grip and good traction on exit (Porsche, Ferrari) are well-suited. The main straight provides an overtaking opportunity into T1 but the braking zone is short. Tyre wear is relatively modest but consistent, and strategy at this shorter circuit is about pit window timing rather than degradation management.",
    "setup_notes": {
      "downforce": "Medium-high. Valencia's stop-start nature and the lack of long high-speed sections mean drag is rarely costly. More downforce generally produces better lap times through the sustained slow cornering.",
      "tyres": "Rear tyres are the primary concern given the emphasis on traction. The front-left also loads significantly through the T10–T12 complex. Wear is manageable for sprint races.",
      "brakes": "T1 and T10 are the main zones. The approach to T10 is medium-speed and requires confident but measured braking — the corner opens up on exit which can lead to over-slowing. Moderate brake cooling needed.",
      "fuel": {
        "stint_recommendation": "Approximately 55–60 litres. Fuel saving is viable on the secondary straight sections between T5 and T9."
      }
    },
    "key_corners": [
      "T1: Main overtaking spot — moderate braking into a tight right; the short run from the grid makes lap 1 incidents common",
      "T4–T5: Technical double-right complex — smooth inputs through the sequence are worth more than individual corner heroics",
      "T10–T11: Medium-speed left complex — one of the more demanding sections given the entry speed; good rotation here is key",
      "T14 (Final corner): Slow right onto the straight — traction here directly determines your overtaking ability into T1"
    ],
    "acc_speed_category": "low_speed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "low",
    "acc_best_car_types": ["Strong traction cars", "Rear-grip platforms"]
  },
  "Watkins Glen": {
    "circuit_notes": "Watkins Glen is one of the most enjoyable circuits in ACC — flowing, fast, and with a distinctive American character. The long uphill straight after T1 rewards a good exit, and the chicane is both the main overtaking spot and the biggest incident zone. The Bus Stop and the Toe sections test car balance in different ways. Front-engine cars tend to shine on the flowing sections, while the technical final sector levels the field somewhat.",
    "setup_notes": {
      "downforce": "Medium. The long straight punishes drag, but the flowing middle sector and the technical final section need grip. A balanced medium-low downforce setup works well in dry conditions.",
      "tyres": "Front-left loads heavily through the sustained right-handers in S2. The high-speed character of the lap means heat builds gradually — pressures should be set slightly conservatively.",
      "brakes": "The chicane (T4–T5) is the heaviest braking zone and the main overtaking spot. The approach from the uphill straight adds speed — late braking is tempting and usually punished. Inner Loop also has a significant braking element.",
      "fuel": {
        "stint_recommendation": "Approximately 65–70 litres. Fuel saving viable with early lifts on the long straight and into the Inner Loop."
      }
    },
    "key_corners": [
      "T1 (Turn 1): Opening right after the start — sets up the entire uphill section; don't sacrifice T1 exit for qualifying position defence",
      "The Chicane (T4–T5): Main overtaking zone — the most common incident point on the circuit; late braking works but a lockup into the chicane is race-ending",
      "Inner Loop (T7–T8): Technical right-left — smooth sequential inputs reward; rushing the exit of T7 causes an ugly T8 entry",
      "Boot (T10–T11): Final complex onto the straight — one of the most satisfying corner combinations when nailed; sets up the run to the finish"
    ],
    "acc_speed_category": "high_speed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "medium",
    "acc_best_car_types": ["Balanced aero cars", "Good traction cars"]
  },
  "Zandvoort": {
    "circuit_notes": "Zandvoort's banked corners are unique in ACC — Hugenholtzbocht (T3) and Arie Luyendijkbocht (T11) are banked significantly, which generates more lateral grip than flat corners at the same speed. Cars that handle the banking transition smoothly carry significantly more speed. The Tarzan hairpin is the only true overtaking opportunity; the rest of the circuit is too narrow and the banking limits passing. Tyre wear is high on the rear-right due to the predominantly left-hand corner character and the high-speed banking.",
    "setup_notes": {
      "downforce": "Medium-high. The banking generates mechanical grip but the car still needs aerodynamic stability at the transition points. Zandvoort is not a track to run low downforce — the penalties for instability on the banks are severe.",
      "tyres": "Rear-right is the critical tyre — the predominantly left-turning circuit combined with high-speed banking puts sustained load on the outside rear. Monitor its temperature independently and manage its life carefully in longer stints.",
      "brakes": "Tarzan (T1) is the only heavy braking zone and main overtaking spot — heavy, late braking from high speed with the banking beginning on exit. The rest of the circuit uses relatively light braking loads given the banking-assisted grip.",
      "fuel": {
        "stint_recommendation": "Approximately 55–60 litres. Fuel saving is possible with careful management through the banking sections."
      }
    },
    "key_corners": [
      "Tarzan (T1): Only real overtaking spot — heavy braking into a tight right; the banking on exit helps stability but dive-bombing is common",
      "Hugenholtzbocht (T3): Banked high-speed right — drop into the banking, maintain throttle; cars that carry more speed here gain significantly",
      "Scheivlak (T7): Fast, flowing right — requires a committed, smooth entry; the car can feel nervous here in low-downforce setups",
      "Arie Luyendijkbocht (T11): Banked final corner onto the main straight — the banking is steep; use the full width and carry maximum speed"
    ],
    "acc_speed_category": "high_speed",
    "acc_overtaking_difficulty": "hard",
    "acc_wet_weather_risk": "medium",
    "acc_best_car_types": ["Stable high-speed cars", "Good rear-grip platforms"]
  },
  "Zolder": {
    "circuit_notes": "Zolder is a tight, bumpy, and deceptively technical circuit where smooth inputs are significantly rewarded. The Kleine Chicane and the Bus Stop are the most incident-prone corners. Overtaking is limited but possible at T1 and occasionally at T4 — defensive lines are effective at Zolder. The undulating surface causes the car to move around more than expected, particularly through the Bus Stop sequence. Cars with good mechanical compliance and stable mid-corner behaviour handle Zolder's imperfections better.",
    "setup_notes": {
      "downforce": "Medium-high. No long straights mean there is little cost to running more wing. Stability through the bumpy sections is more valuable than top speed here.",
      "tyres": "The bumpy surface causes tyre compliance issues — running slightly lower pressures than usual improves conformity and reduces peak thermal stress. Front-left loads through the sustained right-handers in S2.",
      "brakes": "T1 (Jochen Rindt) and T8 are the main zones. The Bus Stop chicane (T5–T6) has a moderate braking element that is frequently misjudged — don't be too ambitious there. Moderate cooling requirement.",
      "fuel": {
        "stint_recommendation": "Approximately 55–60 litres. Limited saving opportunity given the short, technical nature of the lap."
      }
    },
    "key_corners": [
      "Jochen Rindt (T1): Main overtaking spot — tight right into the first complex; the bumpy surface on entry makes late braking a gamble",
      "Kleine Chicane (T5–T6): Tight bus-stop complex — the most common incident zone; respect the sausage kerbs or face a puncture",
      "Terlamenbocht (T8): Medium-speed hairpin — patience here is required; early throttle out of T8 defines the pace through the final sector",
      "Bolderbergbocht (T11): Final right-hander onto the main straight — a crucial traction corner that directly determines your overtaking potential into T1"
    ],
    "acc_speed_category": "medium_speed",
    "acc_overtaking_difficulty": "medium",
    "acc_wet_weather_risk": "medium",
    "acc_best_car_types": ["Mechanically compliant cars", "Stable mid-corner cars"]
  }
};
