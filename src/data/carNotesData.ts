export interface CarNote {
  car_notes: string;
  engine_layout: string;
  driving_style: string[];
  strengths: string[];
  weaknesses: string[];
  setup_sensitivity: string;
  best_tracks: string[];
  difficulty: string;
  meta_note: string;
}

export interface TrackMapData {
  full_name: string;
  wikimedia_page: string;
  svg_url: string;
  license?: string;
  needs_manual_creation?: boolean;
  notes?: string;
  verified?: boolean;
  trackId?: string;
  trackName?: string;
  svgPath?: string;
  competitiveLaptimes?: {
    qualy?: number;
    p100?: number;
    p102?: number;
    reference_time?: number;
  };
}

export const CAR_NOTES_DATA: Record<string, CarNote> = {
  "Ford Mustang GT3 (2024)": {
    "car_notes": "The Mustang is one of the most approachable GT3 cars in ACC. Its front-engine layout provides natural stability through high-speed corners and under heavy braking, making it particularly forgiving for drivers still building confidence. The car rewards trail-braking into slow corners but requires patience on the throttle — applying power too early on exit will cause the rear to step out. A natural fit for Monza, Spa, and Silverstone where the front-engine weight bias is an advantage in the chicane and high-speed sections.",
    "engine_layout": "front",
    "driving_style": [
      "trail-braking",
      "stable entry",
      "patient throttle exit"
    ],
    "strengths": [
      "High-speed stability",
      "Chicane kerb absorption",
      "Consistent over long stints",
      "Strong braking stability"
    ],
    "weaknesses": [
      "Slow-speed rotation",
      "Tight technical circuits",
      "Requires patience on throttle application"
    ],
    "setup_sensitivity": "Rear ARB and differential preload are the primary balance tools. Small changes have a significant effect on exit oversteer — adjust conservatively.",
    "best_tracks": [
      "Monza",
      "Spa",
      "Silverstone",
      "Watkins Glen",
      "Paul Ricard"
    ],
    "difficulty": "Beginner friendly",
    "meta_note": "Strong LFM meta car when BoP favours front-engine platforms. Competitive at high-speed circuits year-round and a go-to recommendation for newer drivers."
  },
  "BMW M4 GT3 (2021)": {
    "car_notes": "The M4 GT3 is the benchmark front-engine GT3 in ACC — predictable, well-rounded, and competitive across nearly every circuit type. It handles Monza's chicane kerbs better than mid-engine cars and maintains exceptional stability under heavy braking. The M4 has a wider setup window than most cars, meaning a slightly imperfect setup still produces good lap times. Ideal for drivers who want a reliable, consistent platform that rarely punishes mistakes harshly.",
    "engine_layout": "front",
    "driving_style": [
      "consistent",
      "trail-braking",
      "smooth inputs"
    ],
    "strengths": [
      "Widest setup window in GT3 class",
      "Exceptional braking stability",
      "Competitive across all track types",
      "Forgiving of minor mistakes"
    ],
    "weaknesses": [
      "Not the outright fastest in any single discipline",
      "Can feel slightly dull compared to more reactive cars"
    ],
    "setup_sensitivity": "One of the least setup-sensitive cars in the class. The baseline setup works well at most circuits — focus changes on ride height and wing rather than mechanical grip adjustments.",
    "best_tracks": [
      "Monza",
      "Nürburgring",
      "Red Bull Ring",
      "Silverstone",
      "Brands Hatch"
    ],
    "difficulty": "Beginner friendly",
    "meta_note": "Consistently competitive across LFM seasons regardless of BoP changes. One of the most popular cars at all skill levels for good reason."
  },
  "Mercedes-AMG GT3 (2020)": {
    "car_notes": "The AMG GT3 Evo is a front-engine car with a distinctive character — it generates exceptional front-end grip and rewards aggressive trail-braking into slow corners more than almost any other GT3. The unique splitter-as-aerodynamic-device setup (adjustable from 1–11) gives it more aero flexibility than other front-engine cars. It can feel stiff and unforgiving over bumps at high ride heights. The AMG shines at technical circuits where its front-end bite translates directly into corner entry speed.",
    "engine_layout": "front",
    "driving_style": [
      "aggressive trail-braking",
      "front-end reliant",
      "high entry speed"
    ],
    "strengths": [
      "Outstanding front-end grip",
      "Aggressive splitter adjustment range",
      "Strong at technical circuits",
      "Good tyre longevity"
    ],
    "weaknesses": [
      "Stiff ride over bumps",
      "Needs careful rear balance management",
      "Splitter setup adds complexity"
    ],
    "setup_sensitivity": "Splitter setting is the most circuit-specific adjustment in the class — it must be dialled in per track. Rear wheel rates require careful attention to prevent oversteer on high-kerb circuits.",
    "best_tracks": [
      "Hungaroring",
      "Zolder",
      "Misano",
      "Barcelona",
      "Oulton Park"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A meta car in technical circuits and tight street-style layouts. Less dominant on high-speed circuits where drag from the splitter becomes a factor."
  },
  "Mercedes-AMG GT3 (2015)": {
    "car_notes": "The original AMG GT3 is the predecessor to the Evo and shares its front-engine character but with a narrower setup window and less aerodynamic flexibility. It remains competitive at technical circuits but the Evo has generally superseded it in the meta. Worth considering only for drivers specifically attracted to the car's character, as the Evo offers everything the original does and more.",
    "engine_layout": "front",
    "driving_style": [
      "trail-braking",
      "front-end reliant"
    ],
    "strengths": [
      "Strong front-end grip",
      "Technical circuit performer"
    ],
    "weaknesses": [
      "Outdated compared to Evo",
      "Narrower setup window",
      "Less aero flexibility"
    ],
    "setup_sensitivity": "Similar to the Evo but less tolerant of setup errors — requires more precise ride height and spring rate selection.",
    "best_tracks": [
      "Hungaroring",
      "Zolder",
      "Misano"
    ],
    "difficulty": "Intermediate",
    "meta_note": "Superseded by the Evo variant in competitive settings. Rarely the optimal choice unless specifically required by an event."
  },
  "Ferrari 296 GT3 (2023)": {
    "car_notes": "The 296 GT3 is Ferrari's most accomplished GT3 car in ACC and one of the most complete packages in the class. Its rear-mid engine layout gives it exceptional rotation through slow corners — it changes direction with an immediacy that rewards confident drivers. The 296 demands precise throttle control on exit; it will punish aggressive application but rewards those who work with its natural balance. A car that feels alive under the driver and suits those who enjoy a reactive, communicative platform.",
    "engine_layout": "mid-rear",
    "driving_style": [
      "precise throttle control",
      "natural rotation",
      "high corner entry speed"
    ],
    "strengths": [
      "Outstanding slow-corner rotation",
      "Excellent mechanical grip",
      "High peak performance ceiling",
      "Strong at all circuit types"
    ],
    "weaknesses": [
      "Punishes aggressive early throttle application",
      "Requires more precise setup than front-engine alternatives",
      "Less forgiving than BMW or Mustang"
    ],
    "setup_sensitivity": "Rear bumpstop range and rear ride height are critical adjustments — the 296 is sensitive to rear platform changes. Front-end requires less attention given the car's natural front grip.",
    "best_tracks": [
      "Valencia",
      "Hungaroring",
      "Barcelona",
      "Misano",
      "Spa"
    ],
    "difficulty": "Intermediate",
    "meta_note": "One of the strongest meta cars in the current ACC GT3 field. Regularly near the top of LFM competitive leaderboards across a wide range of circuits."
  },
  "Ferrari 488 GT3 Evo (2020)": {
    "car_notes": "The 488 GT3 Evo is a mid-engine Ferrari with a more forgiving character than the 296 it preceded. It requires commitment on corner entry but is more tolerant of throttle application errors on exit than the newer car. The 488 has an unusually wide caster range which provides significant setup flexibility for drivers who understand how to use it. A well-rounded car that remains competitive despite its age, particularly at flowing medium-speed circuits.",
    "engine_layout": "mid-rear",
    "driving_style": [
      "committed corner entry",
      "smooth throttle",
      "flowing circuits"
    ],
    "strengths": [
      "Wide caster range for setup flexibility",
      "Good medium-speed circuit performance",
      "More forgiving than 296 on exit",
      "Consistent tyre wear"
    ],
    "weaknesses": [
      "Older model, outpaced by 296 in outright performance",
      "Demands commitment on entry",
      "Less rotation than 296"
    ],
    "setup_sensitivity": "Caster is the most impactful adjustment for this car — explore a wider range than you would on other GT3s. Rear spring rates benefit from careful optimisation per circuit.",
    "best_tracks": [
      "Spa",
      "Silverstone",
      "Watkins Glen",
      "Misano"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A reliable mid-field option but largely superseded by the 296 in competitive settings. Still a good learning car for drivers transitioning from front-engine platforms."
  },
  "Ferrari 488 GT3 (2018)": {
    "car_notes": "The original 488 GT3 is the oldest Ferrari in the class and shares the fundamental mid-rear engine character of its successors. Setup options are more limited than the Evo, and the car is generally slower in a straight comparison with the current BoP. Best suited for drivers who enjoy the Ferrari driving character but are racing in historically-focused events or series that include this generation of car.",
    "engine_layout": "mid-rear",
    "driving_style": [
      "committed entry",
      "smooth throttle"
    ],
    "strengths": [
      "Natural mid-corner rotation",
      "Ferrari driving character"
    ],
    "weaknesses": [
      "Oldest Ferrari variant",
      "Limited setup options vs Evo",
      "Outpaced by current generation"
    ],
    "setup_sensitivity": "Similar to the Evo but with fewer adjustment options. Focus on ride height and wheel rates as the primary tuning tools.",
    "best_tracks": [
      "Spa",
      "Misano",
      "Silverstone"
    ],
    "difficulty": "Intermediate",
    "meta_note": "Rarely seen in competitive settings. Best used in specific historic series or as a stepping stone to the Evo and 296."
  },
  "Porsche 992 GT3 R (2023)": {
    "car_notes": "The 992 is Porsche's flagship GT3 entry and one of the most unique driving experiences in ACC. The rear-engine layout creates a different balance characteristic to every other car in the class — the rear weight bias provides exceptional traction on exit but demands total respect on entry, where the rear can snap if pushed too hard before the car is settled. Once understood, the 992 rewards a smooth, flowing driving style and is devastatingly quick at circuits with long, traction-heavy exits. Not recommended for drivers still building their ACC fundamentals.",
    "engine_layout": "rear",
    "driving_style": [
      "smooth and flowing",
      "early rotation",
      "patient entry",
      "aggressive exit"
    ],
    "strengths": [
      "Exceptional traction on corner exit",
      "Outstanding at traction-heavy circuits",
      "High reward ceiling for skilled drivers",
      "Strong in wet conditions"
    ],
    "weaknesses": [
      "Entry oversteer if pushed too hard",
      "Steep learning curve",
      "Demands setup precision"
    ],
    "setup_sensitivity": "Front ride height and front ARB are the primary balance tools. The rear-engine bias means front setup changes have a disproportionate effect on overall balance — adjust in small increments.",
    "best_tracks": [
      "Valencia",
      "Hungaroring",
      "Barcelona",
      "Zandvoort",
      "Misano"
    ],
    "difficulty": "Advanced",
    "meta_note": "A meta car in the right hands at traction-heavy circuits. Regularly produces top results on LFM when driven by experienced Porsche specialists."
  },
  "Porsche 991II GT3 R (2019)": {
    "car_notes": "The 991II shares the rear-engine character of the 992 but with slightly more forgiving entry characteristics and less outright peak performance. It is a better starting point for drivers curious about the Porsche rear-engine experience before committing to the more demanding 992. The traction advantage on exit is the defining feature — drivers who can manage the entry will find significant gains on corner exit compared to front-engine alternatives.",
    "engine_layout": "rear",
    "driving_style": [
      "smooth entry",
      "early rotation",
      "strong exit commitment"
    ],
    "strengths": [
      "Strong corner exit traction",
      "More forgiving than 992 on entry",
      "Good all-round pace"
    ],
    "weaknesses": [
      "Entry snap if pushed too hard",
      "Requires Porsche-specific driving technique",
      "Outpaced by 992 in pure performance"
    ],
    "setup_sensitivity": "Front spring rates and ride height are critical. The rear-engine layout amplifies any front setup imbalance — always check front geometry first when experiencing handling issues.",
    "best_tracks": [
      "Valencia",
      "Hungaroring",
      "Misano",
      "Zandvoort"
    ],
    "difficulty": "Advanced",
    "meta_note": "A solid competitive option but largely superseded by the 992 in current LFM settings. A useful bridge car for Porsche enthusiasts."
  },
  "Porsche 991 GT3 R (2018)": {
    "car_notes": "The original 991 GT3 R is the oldest Porsche in ACC and the most demanding of the three Porsche variants. The rear-engine character is present but the car has fewer modern setup tools to manage it. Primarily of interest to drivers racing in historically-specific series. The fundamental Porsche technique of patient entry and aggressive exit applies, but the margins for error are narrower than in the newer cars.",
    "engine_layout": "rear",
    "driving_style": [
      "patient entry",
      "smooth rotation",
      "aggressive exit"
    ],
    "strengths": [
      "Strong exit traction",
      "Porsche character"
    ],
    "weaknesses": [
      "Oldest Porsche variant",
      "Fewest setup options",
      "Narrowest margin for error"
    ],
    "setup_sensitivity": "Limited adjustment range means setup errors are harder to compensate for. Focus on getting ride height and tyre pressures correct before touching other parameters.",
    "best_tracks": [
      "Valencia",
      "Misano"
    ],
    "difficulty": "Advanced",
    "meta_note": "Outclassed by the 991II and 992 in modern competitive settings. Best reserved for period-correct or historic-class events."
  },
  "Lamborghini Huracan GT3 EVO 2 (2023)": {
    "car_notes": "The EVO 2 is Lamborghini's most developed GT3 car and one of the strongest all-round packages in the class. Its mid-engine layout gives it superb rotation through medium and slow-speed corners, while the wide rear wing range allows genuine downforce flexibility across very different circuit types. The EVO 2 rewards drivers who carry high corner speed — it is not a car that responds well to stop-start driving. At its best through flowing, high-commitment circuits like Spa and Silverstone.",
    "engine_layout": "mid",
    "driving_style": [
      "high corner speed",
      "flowing inputs",
      "momentum-based driving"
    ],
    "strengths": [
      "Excellent medium-speed corner performance",
      "Wide aero range",
      "Strong at flowing circuits",
      "Natural rotation"
    ],
    "weaknesses": [
      "Less effective at very slow-speed circuits",
      "Requires momentum — doesn't respond well to stop-start styles"
    ],
    "setup_sensitivity": "Rear wing setting is the most critical per-circuit adjustment. The car's wide wing range means significant time can be found or lost with incorrect downforce choice.",
    "best_tracks": [
      "Spa",
      "Silverstone",
      "Kyalami",
      "Watkins Glen",
      "Suzuka"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A consistent top-tier car in LFM. Particularly strong at Spa and Silverstone where its flowing corner speed advantage is most pronounced."
  },
  "Lamborghini Huracan GT3 Evo (2019)": {
    "car_notes": "The original Huracan GT3 Evo shares the mid-engine rotation strength of the EVO 2 but with slightly less outright pace and a narrower setup window. It remains a capable, enjoyable car that rewards flowing, committed driving. Drivers who master this car will find transitioning to the EVO 2 straightforward, as the fundamental character is very similar.",
    "engine_layout": "mid",
    "driving_style": [
      "flowing",
      "momentum-based",
      "high corner speed"
    ],
    "strengths": [
      "Good mid-corner rotation",
      "Flowing circuit performer"
    ],
    "weaknesses": [
      "Outpaced by EVO 2",
      "Narrower setup window"
    ],
    "setup_sensitivity": "Similar to EVO 2 but less adjustment headroom. Wing and ride height are the primary tools.",
    "best_tracks": [
      "Spa",
      "Silverstone",
      "Kyalami"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A solid mid-field option superseded by the EVO 2. Still competitive with the right setup and driver."
  },
  "Lamborghini Huracan GT3 (2015)": {
    "car_notes": "The original Huracan GT3 is the oldest Lamborghini in the class. The mid-engine rotation characteristic is present but with fewer modern refinements. Generally outclassed by both Evo variants but still driveable and competitive in period-correct series.",
    "engine_layout": "mid",
    "driving_style": [
      "flowing",
      "momentum-based"
    ],
    "strengths": [
      "Natural mid-corner rotation",
      "Lamborghini character"
    ],
    "weaknesses": [
      "Oldest Lamborghini variant",
      "Outpaced by newer versions",
      "Limited setup options"
    ],
    "setup_sensitivity": "Ride height and wing are the primary adjustments. Limited mechanical grip tools available.",
    "best_tracks": [
      "Spa",
      "Silverstone"
    ],
    "difficulty": "Intermediate",
    "meta_note": "Outclassed by current generation cars in competitive settings. Best used in historic or mixed-generation series."
  },
  "McLaren 720S GT3 Evo (2023)": {
    "car_notes": "The 720S GT3 Evo is a mid-engine car with a very distinctive character — it is the most aerodynamically efficient GT3 in ACC, generating high downforce while managing drag remarkably well. The car's unique strength is its ability to carry exceptional speed through medium and high-speed corners. It demands precise, smooth inputs — it does not forgive rough driving. The 720S Evo rewards experienced drivers who can extract its technical advantages but will expose poor technique very quickly.",
    "engine_layout": "mid",
    "driving_style": [
      "precise and smooth",
      "high corner speed",
      "aerodynamic efficiency"
    ],
    "strengths": [
      "Best aerodynamic efficiency in GT3 class",
      "Exceptional high-speed corner performance",
      "Strong all-circuit pace"
    ],
    "weaknesses": [
      "Unforgiving of rough inputs",
      "Requires experience to extract full performance",
      "Less effective at very slow circuits"
    ],
    "setup_sensitivity": "One of the most setup-sensitive cars in the class. Ride height changes have a significant effect on aero balance — adjust carefully. Front bumpstop window requires precise calibration.",
    "best_tracks": [
      "Spa",
      "Silverstone",
      "Suzuka",
      "Zandvoort",
      "Kyalami"
    ],
    "difficulty": "Advanced",
    "meta_note": "A top-tier car in experienced hands. Regularly features in LFM podium battles at flowing, high-speed circuits. Not recommended for drivers still developing consistency."
  },
  "McLaren 720S GT3 (2019)": {
    "car_notes": "The original 720S GT3 shares the aerodynamic efficiency and mid-engine character of the Evo but with a less developed rear setup. It remains fast at high-speed circuits but requires more mechanical grip compensation than the Evo. A good car for experienced drivers who want to learn the McLaren character before moving to the more capable Evo variant.",
    "engine_layout": "mid",
    "driving_style": [
      "precise",
      "high corner speed",
      "smooth inputs"
    ],
    "strengths": [
      "Strong aerodynamic efficiency",
      "High-speed circuit performer"
    ],
    "weaknesses": [
      "Less rear stability than Evo",
      "Outpaced by Evo in direct comparison"
    ],
    "setup_sensitivity": "Similar to Evo but rear setup requires more attention to compensate for less developed rear geometry.",
    "best_tracks": [
      "Spa",
      "Silverstone",
      "Suzuka"
    ],
    "difficulty": "Advanced",
    "meta_note": "Superseded by the Evo in modern competition but still capable. Good for learning the McLaren platform."
  },
  "McLaren 650S GT3 (2015)": {
    "car_notes": "The 650S GT3 is the oldest McLaren in ACC and represents a different era of GT3 engineering. It is less aerodynamically refined than the 720S variants and more mechanical in character. A challenging car that demands significant commitment and setup precision. Primarily of interest to drivers racing in older-generation series.",
    "engine_layout": "mid",
    "driving_style": [
      "committed",
      "mechanical grip focused"
    ],
    "strengths": [
      "Raw driving experience",
      "Unique character"
    ],
    "weaknesses": [
      "Significantly outpaced by 720S variants",
      "Less refined aerodynamics",
      "Narrowest setup window of the McLarens"
    ],
    "setup_sensitivity": "Mechanical grip is the primary focus — aero options are limited compared to newer McLarens. Spring rates and ride height are the main tools.",
    "best_tracks": [
      "Spa",
      "Silverstone"
    ],
    "difficulty": "Advanced",
    "meta_note": "Not competitive in modern mixed-generation racing. Best reserved for period-correct events."
  },
  "AMR V8 Vantage (2019)": {
    "car_notes": "The Aston Martin V8 Vantage GT3 is a front-engine car with strong braking stability and predictable corner entry behaviour. It has a wide wheel rate range which gives engineers significant setup flexibility. The car tends toward understeer in its default state but can be set up for a more neutral balance with careful spring and ARB tuning. A solid, trustworthy car that suits drivers who prefer a stable, planted front end and are willing to invest time in setup work to unlock its full potential.",
    "engine_layout": "front",
    "driving_style": [
      "stable braking",
      "technical setup work rewards"
    ],
    "strengths": [
      "Wide wheel rate range for setup flexibility",
      "Strong braking stability",
      "Predictable understeer-biased entry"
    ],
    "weaknesses": [
      "Default understeer can be a limitation",
      "Requires setup investment to be competitive",
      "Heavy feeling compared to newer cars"
    ],
    "setup_sensitivity": "The widest wheel rate range in the class offers significant flexibility but requires careful calibration. ARB changes have a pronounced effect on balance — take time to find the right combination per circuit.",
    "best_tracks": [
      "Brands Hatch",
      "Zolder",
      "Snetterton",
      "Donington Park"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A consistent mid-field performer with loyal following among drivers who invest in setup. Strong at British circuits where front-engine stability is advantageous."
  },
  "AMR V12 Vantage GT3 (2013)": {
    "car_notes": "The V12 Vantage is the oldest Aston Martin in ACC and a genuinely different driving experience. The larger, heavier V12 engine creates different weight distribution to the V8, making the car more demanding under braking and heavier to change direction. An authentic challenge for experienced drivers who want something different, but not competitive in modern mixed-generation racing.",
    "engine_layout": "front",
    "driving_style": [
      "measured braking",
      "smooth direction changes"
    ],
    "strengths": [
      "Unique V12 character",
      "Strong straight-line performance"
    ],
    "weaknesses": [
      "Heavy and slow to change direction",
      "Outclassed by V8 in modern competition",
      "Demanding under braking"
    ],
    "setup_sensitivity": "Brake bias requires careful attention given the weight distribution difference from the V8. Ride height is more sensitive than most due to the car's mass.",
    "best_tracks": [
      "Monza",
      "Spa",
      "Paul Ricard"
    ],
    "difficulty": "Advanced",
    "meta_note": "Not competitive in modern settings. A car for enthusiasts and historic events."
  },
  "Audi R8 LMS GT3 evo II (2022)": {
    "car_notes": "The R8 LMS Evo II is a mid-engine Audi with a very strong all-round character. Its wide wheel rate range gives it exceptional setup flexibility, and the mid-engine layout provides the natural rotation that suits flowing circuits. The Audi has a reputation for being particularly consistent over long stints — tyre wear is moderate and manageable. A car that rewards precise, smooth driving without demanding the same technical precision as the McLaren or Porsche.",
    "engine_layout": "mid",
    "driving_style": [
      "precise",
      "smooth",
      "long-run consistency"
    ],
    "strengths": [
      "Excellent setup flexibility",
      "Strong tyre longevity",
      "Consistent long-run pace",
      "Good at mixed circuit types"
    ],
    "weaknesses": [
      "Not the outright fastest in any specific discipline",
      "Requires setup investment for peak performance"
    ],
    "setup_sensitivity": "Wide wheel rate range means there is significant setup to explore. Spring rates and bumpstop windows are the primary long-run tuning tools.",
    "best_tracks": [
      "Barcelona",
      "Spa",
      "Silverstone",
      "Imola"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A reliable, well-rounded meta car. Consistently competitive at LFM across a wide range of tracks and conditions."
  },
  "Audi R8 LMS Evo (2019)": {
    "car_notes": "The R8 LMS Evo shares the mid-engine character and Audi consistency of the Evo II but with slightly less outright pace. It remains a solid, dependable choice particularly for drivers who prioritise consistency over peak lap time. Tyre wear characteristics are excellent. A good bridge car between the forgiving front-engine platform and the more demanding mid-engine options.",
    "engine_layout": "mid",
    "driving_style": [
      "smooth",
      "consistent",
      "tyre-preserving"
    ],
    "strengths": [
      "Strong tyre longevity",
      "Consistent long-run pace",
      "Dependable character"
    ],
    "weaknesses": [
      "Outpaced by Evo II",
      "Not the most exciting to drive"
    ],
    "setup_sensitivity": "Less setup-sensitive than Evo II. Focus on ride height and tyre pressures as primary adjustments.",
    "best_tracks": [
      "Barcelona",
      "Spa",
      "Silverstone"
    ],
    "difficulty": "Beginner friendly",
    "meta_note": "A reliable choice for LFM mid-pack drivers. Good stepping stone to the Evo II."
  },
  "Audi R8 LMS (2015)": {
    "car_notes": "The original R8 LMS is the oldest Audi in ACC. It shares the fundamental mid-engine character but with fewer modern refinements and a narrower setup range. Outclassed in current competition but still driveable and enjoyable for drivers interested in the earlier generation of GT3 cars.",
    "engine_layout": "mid",
    "driving_style": [
      "smooth",
      "consistent"
    ],
    "strengths": [
      "Reliable mid-engine character",
      "Manageable tyre wear"
    ],
    "weaknesses": [
      "Outclassed by Evo and Evo II",
      "Limited setup range",
      "Older aero package"
    ],
    "setup_sensitivity": "Limited adjustment range. Ride height and wing are the primary tools — don't over-complicate the setup.",
    "best_tracks": [
      "Spa",
      "Barcelona"
    ],
    "difficulty": "Intermediate",
    "meta_note": "Not competitive in modern mixed-generation racing. Best reserved for period-correct or historic series."
  },
  "Bentley Continental (2018)": {
    "car_notes": "The Bentley Continental GT3 is the heaviest front-engine car in ACC — its luxury GT heritage means the base vehicle is significantly heavier than purpose-built race cars, and this is felt in direction changes and under braking. However, the Bentley has an unusually large wheel rate selection (14 front, 20 rear options) giving it significant setup flexibility. In the right hands at the right circuits it is competitive, but it demands a driving style adapted to its weight and character.",
    "engine_layout": "front",
    "driving_style": [
      "measured braking",
      "smooth direction changes",
      "setup-reliant"
    ],
    "strengths": [
      "Exceptional wheel rate range",
      "Strong straight-line stability",
      "Unique character"
    ],
    "weaknesses": [
      "Heaviest car in GT3 class",
      "Slow to change direction",
      "Requires significant setup work to be competitive"
    ],
    "setup_sensitivity": "The broadest wheel rate range in the class — take time to explore spring rate combinations. Rear spring rates in particular have a significant effect on the car's direction-change ability.",
    "best_tracks": [
      "Monza",
      "Spa",
      "Paul Ricard",
      "Silverstone"
    ],
    "difficulty": "Advanced",
    "meta_note": "A challenging choice for competitive racing but rewarding for drivers who invest the time. Has a dedicated community of specialists who extract strong results."
  },
  "Bentley Continental (2015)": {
    "car_notes": "The older Bentley Continental shares the heavy, front-engine character of the 2018 model but with fewer setup tools and less developed aerodynamics. Even more demanding than its successor and further from competitive pace in modern racing.",
    "engine_layout": "front",
    "driving_style": [
      "measured braking",
      "smooth direction changes"
    ],
    "strengths": [
      "Distinctive character"
    ],
    "weaknesses": [
      "Heaviest car in class",
      "Outclassed by 2018 model",
      "Most demanding Bentley to drive competitively"
    ],
    "setup_sensitivity": "Focus on spring rates and ride height — other adjustments have limited effect given the car's fundamental weight limitation.",
    "best_tracks": [
      "Monza",
      "Spa"
    ],
    "difficulty": "Advanced",
    "meta_note": "Rarely competitive in modern mixed-generation racing. For enthusiasts only."
  },
  "BMW M6 GT3 (2017)": {
    "car_notes": "The M6 GT3 is a front-engine BMW with a very similar character to the M4 but with a slightly heavier feel and older aerodynamic package. It is a dependable, predictable car that is easy to drive consistently. A good choice for drivers who want the BMW front-engine stability but are racing in series that include this generation of car. The M4 is the stronger choice in modern mixed-generation racing.",
    "engine_layout": "front",
    "driving_style": [
      "stable",
      "consistent",
      "predictable"
    ],
    "strengths": [
      "Predictable front-engine stability",
      "Forgiving character",
      "Consistent tyre wear"
    ],
    "weaknesses": [
      "Outpaced by M4 GT3",
      "Older aero package",
      "Heavier feel"
    ],
    "setup_sensitivity": "Similar to M4 but slightly more sensitive to ride height changes. Front geometry setup is the primary performance differentiator.",
    "best_tracks": [
      "Monza",
      "Silverstone",
      "Nürburgring"
    ],
    "difficulty": "Beginner friendly",
    "meta_note": "A good starting car superseded by the M4 in modern competition. Strong for drivers in period-correct series."
  },
  "Honda NSX GT3 Evo (2019)": {
    "car_notes": "The NSX GT3 Evo is one of the most unique cars in ACC — it uses a hybrid drivetrain configuration that gives it a different weight distribution and handling characteristic to any other GT3. It produces exceptional traction coming out of corners and has a very wide wheel rate range that allows detailed setup customisation. The NSX demands patience and precision; it does not respond well to aggressive inputs but rewards drivers who work with its natural balance. A car with a passionate following of specialists who produce impressive results.",
    "engine_layout": "mid",
    "driving_style": [
      "patient throttle",
      "precise inputs",
      "traction focused"
    ],
    "strengths": [
      "Exceptional corner exit traction",
      "Widest front wheel rate range in class",
      "Unique and rewarding character"
    ],
    "weaknesses": [
      "Steep learning curve",
      "Complex setup due to unique drivetrain",
      "Less communicative than Ferrari or McLaren"
    ],
    "setup_sensitivity": "The most setup-complex car in the class. The unusually wide wheel rate range (17 front, 17 rear options) requires methodical exploration. Don't try to tune this car quickly — it rewards detailed work.",
    "best_tracks": [
      "Valencia",
      "Hungaroring",
      "Misano",
      "Zandvoort"
    ],
    "difficulty": "Advanced",
    "meta_note": "A specialist car with a dedicated community. Produces strong results in the right hands but not recommended for drivers still developing ACC fundamentals."
  },
  "Honda NSX GT3 (2017)": {
    "car_notes": "The original NSX GT3 shares the unique hybrid-influenced character of the Evo but with even fewer setup tools. A very challenging car that demands significant ACC experience to drive at its limit. The traction advantage on exit remains the car's defining strength.",
    "engine_layout": "mid",
    "driving_style": [
      "patient",
      "traction focused"
    ],
    "strengths": [
      "Strong exit traction",
      "Unique character"
    ],
    "weaknesses": [
      "Most demanding Honda variant",
      "Limited setup options",
      "Outpaced by Evo"
    ],
    "setup_sensitivity": "Limited setup headroom. Focus on ride height and tyre pressures as the primary adjustments.",
    "best_tracks": [
      "Valencia",
      "Hungaroring"
    ],
    "difficulty": "Advanced",
    "meta_note": "Outclassed by the Evo in modern competition. For dedicated Honda enthusiasts only."
  },
  "Lexus RC F GT3 (2016)": {
    "car_notes": "The Lexus RC F GT3 is a front-engine car with a distinctive character shaped by its V8 naturally aspirated engine — it has a broader power curve than the turbocharged competition, which rewards smooth throttle management. The car has a wide rear wheel rate range and produces good results at flowing, medium-speed circuits. Not the first choice for pure pace but a rewarding car for drivers who enjoy its individual character and invest time in setup.",
    "engine_layout": "front",
    "driving_style": [
      "smooth throttle management",
      "flowing circuits",
      "consistent"
    ],
    "strengths": [
      "Natural V8 power delivery",
      "Wide rear wheel rate range",
      "Good at medium-speed flowing circuits"
    ],
    "weaknesses": [
      "Older design outpaced by current generation",
      "Less aero sophistication",
      "Heavier feeling than modern GT3s"
    ],
    "setup_sensitivity": "Rear spring rates reward exploration — the wide range allows significant balance adjustment. Gear ratios benefit from track-specific tuning given the NA engine's power characteristics.",
    "best_tracks": [
      "Watkins Glen",
      "Spa",
      "Suzuka",
      "Kyalami"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A niche choice rarely seen in competitive LFM settings. Best for drivers who specifically enjoy the Lexus character or period-correct events."
  },
  "Nissan GT-R Nismo GT3 (2018)": {
    "car_notes": "The Nissan GT-R Nismo GT3 is the only AWD-influenced car in the ACC GT3 class, and it shows in its character. The car has exceptional braking stability and strong straight-line traction, but its direction-change ability is more limited than lighter alternatives. It suits high-speed circuits and smooth tracks better than tight, technical ones. An interesting choice that requires adaptation of technique — particularly in slow-speed corners where its weight and drivetrain characteristics require patience.",
    "engine_layout": "front-AWD",
    "driving_style": [
      "measured braking",
      "smooth direction changes",
      "straight-line focused"
    ],
    "strengths": [
      "Outstanding braking stability",
      "Strong straight-line traction",
      "Predictable high-speed behaviour"
    ],
    "weaknesses": [
      "Heavy and slow to change direction",
      "Less effective at technical circuits",
      "Requires adapted technique"
    ],
    "setup_sensitivity": "Brake bias is more important in this car than most — the AWD-influenced braking behaviour requires careful front/rear balance. Steer ratio also benefits from circuit-specific tuning.",
    "best_tracks": [
      "Monza",
      "Spa",
      "Paul Ricard",
      "Silverstone"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A niche choice with dedicated fans. Rarely competitive at technical circuits but can surprise at high-speed tracks."
  },
  "Nissan GT-R Nismo GT3 (2015)": {
    "car_notes": "The older GT-R Nismo shares the AWD-influenced character of the 2018 model but is even heavier and less refined. Further from competitive pace in modern racing but offers the same unique driving experience for enthusiasts.",
    "engine_layout": "front-AWD",
    "driving_style": [
      "measured braking",
      "smooth direction changes"
    ],
    "strengths": [
      "Braking stability",
      "Straight-line traction"
    ],
    "weaknesses": [
      "Heaviest GT-R variant",
      "Outclassed by 2018 model",
      "Very limited at technical circuits"
    ],
    "setup_sensitivity": "Brake bias is the primary adjustment. Limited setup headroom otherwise.",
    "best_tracks": [
      "Monza",
      "Spa"
    ],
    "difficulty": "Intermediate",
    "meta_note": "Outclassed in modern competition. For period-correct series only."
  },
  "Emil Frey Jaguar G3 (2012)": {
    "car_notes": "The Emil Frey Jaguar G3 is the oldest car in the ACC GT3 field and one of the most unusual. Its XJ12 heritage means a front-engine layout with very different aerodynamic and mechanical characteristics to any other car in the class. A genuine niche choice that demands significant setup work and adapted driving technique. Rarely competitive against modern GT3 machinery but offers a distinctive and historically interesting driving experience.",
    "engine_layout": "front",
    "driving_style": [
      "smooth",
      "measured",
      "classic GT technique"
    ],
    "strengths": [
      "Unique historical character",
      "Front-engine stability"
    ],
    "weaknesses": [
      "Oldest car in the class",
      "Significantly outpaced by modern GT3s",
      "Very limited setup options",
      "Unusual aerodynamic characteristics"
    ],
    "setup_sensitivity": "Very limited adjustment range. Focus on getting tyre pressures and brake bias correct — other parameters have minimal effect on this car's fundamental pace limitation.",
    "best_tracks": [
      "Monza",
      "Spa"
    ],
    "difficulty": "Advanced",
    "meta_note": "Not competitive in mixed-generation racing. Exclusively for enthusiasts and historically-focused events."
  },
  "Reiter Engineering R-EX GT3 (2017)": {
    "car_notes": "The Reiter Engineering R-EX GT3 is a rare and unusual entry in ACC — a Lamborghini V10-powered car built by a specialist constructor. It has an aggressive, raw character that rewards confident, committed drivers but is unforgiving of mistakes. A collectors car in the ACC sense — interesting and rewarding for those who seek it out but rarely a competitive choice in open racing.",
    "engine_layout": "mid",
    "driving_style": [
      "committed",
      "aggressive",
      "experienced inputs"
    ],
    "strengths": [
      "Distinctive V10 character",
      "Mid-engine rotation"
    ],
    "weaknesses": [
      "Very limited data and community knowledge",
      "Niche setup support",
      "Outpaced in competitive settings"
    ],
    "setup_sensitivity": "Limited community knowledge on optimal setup ranges. Approach with the same methodology as the Lamborghini Huracan as a starting point.",
    "best_tracks": [
      "Spa",
      "Silverstone"
    ],
    "difficulty": "Advanced",
    "meta_note": "Extremely niche choice. Only for drivers specifically seeking out rare cars."
  },
  "Porsche 718 Cayman GT4 Clubsport (2019)": {
    "car_notes": "The 718 Cayman GT4 Clubsport is the benchmark GT4 car in ACC — mid-engine, precise, and well-balanced. It lacks the ABS and TC of GT3 cars meaning it demands genuine mechanical sympathy and clean inputs. The car rewards drivers who trail-brake with confidence and manage tyre temperatures carefully. GT4 racing in ACC is closer and more dependent on driving consistency than GT3, making this car an excellent training ground for drivers developing their fundamentals.",
    "engine_layout": "mid",
    "driving_style": [
      "precise",
      "clean inputs",
      "mechanical sympathy",
      "tyre management"
    ],
    "strengths": [
      "Well-balanced GT4 package",
      "Strong rotation",
      "Excellent training tool",
      "Competitive across GT4 circuits"
    ],
    "weaknesses": [
      "No ABS or TC — demands clean inputs",
      "Slower pace than GT3 by design",
      "Tyre management critical"
    ],
    "setup_sensitivity": "Ride height and tyre pressures are the primary adjustments in GT4. The reduced setup complexity vs GT3 makes this a good car to learn setup fundamentals on.",
    "best_tracks": [
      "Barcelona",
      "Hungaroring",
      "Misano",
      "Zandvoort"
    ],
    "difficulty": "Intermediate",
    "meta_note": "The most popular GT4 car at LFM. A strong all-round package and the go-to recommendation for drivers entering the GT4 class."
  },
  "Maserat MC GT4 (2016)": {
    "car_notes": "The Maserati MC GT4 is the only car in all of ACC with no traction control or ABS — none, at any setting. This makes it the most demanding car in the entire game and requires complete mechanical sympathy on both braking and throttle inputs. It is an exceptional teaching tool for drivers wanting to develop pure car control, but is not the choice for competitive GT4 racing against more electronically assisted alternatives.",
    "engine_layout": "mid-rear",
    "driving_style": [
      "pure mechanical sympathy",
      "progressive braking",
      "delicate throttle"
    ],
    "strengths": [
      "Ultimate driving skills development tool",
      "Rewarding when driven well",
      "Unique pure mechanical experience"
    ],
    "weaknesses": [
      "No TC or ABS — the only car in ACC without both",
      "Demanding in wet conditions",
      "Not competitive against TC/ABS-equipped GT4 cars"
    ],
    "setup_sensitivity": "Brake bias is the single most critical adjustment given the absence of ABS. Spend significant time finding the right balance before exploring other parameters.",
    "best_tracks": [
      "Dry circuits only — Barcelona",
      "Misano",
      "Valencia"
    ],
    "difficulty": "Advanced",
    "meta_note": "Not a competitive choice for LFM GT4 racing. An exceptional training car for drivers who want to develop pure car control without electronic aids."
  },
  "Mercedes AMG GT4 (2016)": {
    "car_notes": "The AMG GT4 shares the front-engine stability of its GT3 sibling but in a GT4 package. It is one of the more forgiving GT4 cars and suits drivers transitioning from GT3 front-engine platforms. Strong under braking and predictable on entry, but requires commitment to get the most out of its corner exit.",
    "engine_layout": "front",
    "driving_style": [
      "stable entry",
      "trail-braking",
      "patient exit"
    ],
    "strengths": [
      "Forgiving front-engine character",
      "Strong braking stability",
      "Good for GT3-to-GT4 transitions"
    ],
    "weaknesses": [
      "Less rotation than mid-engine GT4 alternatives",
      "Requires commitment on exit"
    ],
    "setup_sensitivity": "Similar philosophy to AMG GT3 — splitter and ride height are the primary tools. Less complex than its GT3 counterpart.",
    "best_tracks": [
      "Barcelona",
      "Silverstone",
      "Zolder"
    ],
    "difficulty": "Beginner friendly",
    "meta_note": "A solid GT4 choice for drivers who prefer front-engine stability. Competitive at technical circuits."
  },
  "McLaren 570S GT4 (2016)": {
    "car_notes": "The 570S GT4 is a mid-engine McLaren that carries the aerodynamic efficiency philosophy of its GT3 siblings into the GT4 class. It is fast at flowing circuits and rewards smooth, precise inputs. Like all McLarens it does not forgive rough driving, but the GT4-level electronics make it more accessible than the 720S GT3 variants.",
    "engine_layout": "mid",
    "driving_style": [
      "precise",
      "smooth",
      "aerodynamic efficiency"
    ],
    "strengths": [
      "Strong at flowing high-speed circuits",
      "Aerodynamic efficiency",
      "Good GT4 pace"
    ],
    "weaknesses": [
      "Less forgiving than front-engine GT4 alternatives",
      "Requires smooth inputs"
    ],
    "setup_sensitivity": "Ride height and wing are the primary adjustments — similar philosophy to the 720S GT3 but in a simplified GT4 package.",
    "best_tracks": [
      "Spa",
      "Silverstone",
      "Kyalami"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A competitive GT4 option at flowing circuits. Strong for drivers with mid-engine experience."
  },
  "Ginetta G55 GT4 (2012)": {
    "car_notes": "The Ginetta G55 GT4 is a British-built car with a raw, mechanical character that rewards committed, physical driving. It is less electronically sophisticated than its GT4 peers and demands more from the driver in terms of car control. A car with a passionate following particularly among British sim racers who enjoy its unfiltered character.",
    "engine_layout": "front",
    "driving_style": [
      "committed",
      "mechanical grip focused",
      "physical"
    ],
    "strengths": [
      "Raw mechanical character",
      "Rewarding when pushed",
      "Strong at British circuits"
    ],
    "weaknesses": [
      "Less electronically sophisticated than competitors",
      "Demands more from driver",
      "Niche community knowledge"
    ],
    "setup_sensitivity": "Mechanical grip is the focus given limited aero options. Spring rates and ride height are the primary tools.",
    "best_tracks": [
      "Brands Hatch",
      "Oulton Park",
      "Snetterton",
      "Donington Park"
    ],
    "difficulty": "Intermediate",
    "meta_note": "A niche choice with a loyal following. Particularly popular in community events focused on British circuits."
  },
  "Alpine A110 GT4 (2018)": {
    "car_notes": "The Alpine A110 GT4 is the lightest and most agile GT4 car in ACC. Its mid-engine layout and low weight give it exceptional rotation and direction-change ability that no other GT4 can match. It is however the most demanding GT4 to drive — the light weight means less mechanical grip under braking and the car can feel nervous at high speed. A rewarding specialist choice for drivers who enjoy a reactive, agile platform.",
    "engine_layout": "mid-rear",
    "driving_style": [
      "agile",
      "reactive",
      "smooth braking",
      "technical"
    ],
    "strengths": [
      "Lightest GT4 — exceptional agility",
      "Outstanding rotation",
      "Best direction-change ability in class"
    ],
    "weaknesses": [
      "Less mechanical grip under braking",
      "Can feel nervous at high speed",
      "Demanding for inexperienced drivers"
    ],
    "setup_sensitivity": "The lightest car in GT4 means ride height and tyre pressure changes have a more pronounced effect than in heavier alternatives. Adjust in small increments.",
    "best_tracks": [
      "Hungaroring",
      "Zandvoort",
      "Barcelona",
      "Misano"
    ],
    "difficulty": "Advanced",
    "meta_note": "A specialist GT4 choice that can produce outstanding results in the right hands at technical circuits."
  },
  "Chevrolet Camaro GT4 (2017)": {
    "car_notes": "The Camaro GT4 is a front-engine American muscle car with a heavy, stable character. It excels at circuits with long straights and heavy braking zones where its mass and front-engine layout are advantages. It struggles at tight, technical circuits where its weight and limited rotation make it less effective. A characterful car that suits drivers who enjoy the American GT aesthetic and racing philosophy.",
    "engine_layout": "front",
    "driving_style": [
      "heavy braking",
      "stable entry",
      "straight-line speed"
    ],
    "strengths": [
      "Strong straight-line speed",
      "Heavy braking stability",
      "Characterful"
    ],
    "weaknesses": [
      "Heavy and slow to rotate",
      "Less effective at tight circuits",
      "Limited agility"
    ],
    "setup_sensitivity": "Brake bias is particularly important given the car's weight and braking style. Ride height affects the car's direction-change ability significantly.",
    "best_tracks": [
      "Monza",
      "Spa",
      "Watkins Glen",
      "Paul Ricard"
    ],
    "difficulty": "Beginner friendly",
    "meta_note": "A popular choice for American motorsport fans. Competitive at straight-line circuits but limited at technical venues."
  },
  "Aston Martin Vantage GT4 (2018)": {
    "car_notes": "The Vantage GT4 is a front-engine Aston Martin with strong braking stability and a predictable, trustworthy character. Similar in spirit to the V8 Vantage GT3 but in a more accessible GT4 package. It suits drivers who prefer a planted, consistent car over an agile, reactive one. Good at technical British circuits where its front-engine stability translates into consistent lap times.",
    "engine_layout": "front",
    "driving_style": [
      "stable",
      "consistent",
      "trail-braking"
    ],
    "strengths": [
      "Predictable braking stability",
      "Consistent long-run pace",
      "Trustworthy character"
    ],
    "weaknesses": [
      "Limited rotation compared to mid-engine alternatives",
      "Requires patience on throttle exit"
    ],
    "setup_sensitivity": "Similar setup philosophy to the V8 Vantage GT3. Wheel rates and ride height are the primary tools.",
    "best_tracks": [
      "Brands Hatch",
      "Zolder",
      "Donington Park",
      "Silverstone"
    ],
    "difficulty": "Beginner friendly",
    "meta_note": "A reliable GT4 choice well-suited to British circuits and technical venues."
  },
  "KTM X-Bow GT4 (2016)": {
    "car_notes": "The KTM X-Bow GT4 is a lightweight, open-top car with a unique visual and driving character. It has exceptional power-to-weight ratio for the GT4 class and demands precise, clean inputs. The lack of traditional bodywork means aerodynamic characteristics differ from conventional GT4 cars. A niche but rewarding choice for drivers attracted to its radical design.",
    "engine_layout": "mid",
    "driving_style": [
      "clean inputs",
      "precise",
      "lightweight management"
    ],
    "strengths": [
      "Excellent power-to-weight ratio",
      "Unique character",
      "Precise steering response"
    ],
    "weaknesses": [
      "Unusual aerodynamic characteristics",
      "Limited community knowledge",
      "Demanding in the wet"
    ],
    "setup_sensitivity": "Tyre pressures are particularly important given the car's lightweight and unusual aero profile. Setup knowledge is limited in the community — approach methodically.",
    "best_tracks": [
      "Barcelona",
      "Misano",
      "Silverstone"
    ],
    "difficulty": "Advanced",
    "meta_note": "A specialist choice for drivers attracted to its unique character. Limited competitive data available."
  },
  "BMW M4 GT4 (2018)": {
    "car_notes": "The BMW M4 GT4 is a front-engine car that carries the BMW philosophy of braking stability and predictable balance into the GT4 class. It is one of the most approachable GT4 cars in ACC and suits drivers making the step up from road car racing or those who are new to the GT4 class. The M4 GT4 is less demanding than the Porsche or Alpine alternatives and produces competitive lap times with a relatively straightforward setup.",
    "engine_layout": "front",
    "driving_style": [
      "stable",
      "consistent",
      "approachable"
    ],
    "strengths": [
      "Approachable for new GT4 drivers",
      "Braking stability",
      "Consistent character"
    ],
    "weaknesses": [
      "Less rotation than mid-engine alternatives",
      "Not the fastest GT4 in outright pace"
    ],
    "setup_sensitivity": "Straightforward setup — similar to the BMW M4 GT3 philosophy. Ride height and tyre pressures are the primary adjustments.",
    "best_tracks": [
      "Monza",
      "Silverstone",
      "Brands Hatch",
      "Nürburgring"
    ],
    "difficulty": "Beginner friendly",
    "meta_note": "A go-to recommendation for new GT4 drivers. Competitive and approachable across most circuit types."
  },
  "Audi R8 LMS GT4 (2018)": {
    "car_notes": "The Audi R8 LMS GT4 carries the mid-engine consistency and setup flexibility of the GT3 R8 variants into the GT4 class. It is well-rounded, reliable, and competitive at most circuit types. A strong choice for drivers who want a forgiving but capable GT4 car without the demands of the Porsche or Alpine.",
    "engine_layout": "mid",
    "driving_style": [
      "consistent",
      "smooth",
      "flexible"
    ],
    "strengths": [
      "Well-rounded GT4 package",
      "Good setup flexibility",
      "Consistent tyre wear"
    ],
    "weaknesses": [
      "Not outstanding in any specific area"
    ],
    "setup_sensitivity": "Similar philosophy to GT3 Audi. Spring rates and ride height are the primary tools. Less setup complexity than the GT3 equivalent.",
    "best_tracks": [
      "Barcelona",
      "Spa",
      "Silverstone",
      "Imola"
    ],
    "difficulty": "Beginner friendly",
    "meta_note": "A reliable, well-rounded GT4 choice. Competitive across most tracks and consistently mid-to-front of GT4 fields."
  },
  "Audi R8 LMS GT2 (2022)": {
    "car_notes": "The Audi R8 LMS GT2 is a mid-engine GT2 car that carries the reliability and setup flexibility of the GT3 R8 lineage into a significantly more powerful and aggressive package. GT2 cars produce considerably more downforce and power than GT3, and the R8 GT2 requires respect for this — particularly on corner exit where the power delivery demands precise throttle management. The mid-engine layout provides natural rotation and good stability at high speed, making it one of the more accessible GT2 cars for drivers stepping up from GT3. It suits flowing, high-speed circuits where its aerodynamic efficiency is most effective.",
    "engine_layout": "mid",
    "driving_style": [
      "precise throttle control",
      "flowing inputs",
      "aerodynamic efficiency"
    ],
    "strengths": [
      "Accessible GT2 entry point from GT3 Audi platform",
      "Strong aerodynamic stability",
      "Good setup flexibility",
      "Competitive at high-speed circuits"
    ],
    "weaknesses": [
      "GT2 power demands significant respect on exit",
      "Less dramatic than some GT2 rivals",
      "Requires ACC GT3 experience before attempting"
    ],
    "setup_sensitivity": "Similar setup philosophy to the GT3 R8 variants but with significantly more aerodynamic sensitivity — wing angle changes have a greater effect than in GT3. Tyre pressures are critical given the higher power and braking loads.",
    "best_tracks": [
      "Spa",
      "Monza",
      "Silverstone",
      "Kyalami",
      "Paul Ricard"
    ],
    "difficulty": "Advanced",
    "meta_note": "GT2 class is significantly faster and more demanding than GT3 across the board. This car is recommended only for experienced ACC drivers with strong GT3 foundations. Not available in standard LFM GT3 races — check for dedicated GT2 events."
  },
  "KTM X-BOW GT2 (2021)": {
    "car_notes": "The KTM X-BOW GT2 is the most radical car in the ACC GT2 class — an open-top, lightweight machine with an extreme power-to-weight ratio that makes it unlike anything else in the game. Its lack of traditional bodywork creates unusual aerodynamic characteristics, and the absence of a roof means the driving experience is raw and exposed. The X-BOW GT2 rewards drivers who can manage its aggressive power delivery and unconventional aero balance, producing sensational results in the right hands at flowing circuits. An uncompromising choice that demands the highest level of car control.",
    "engine_layout": "mid",
    "driving_style": [
      "car control mastery",
      "smooth power management",
      "commitment"
    ],
    "strengths": [
      "Extraordinary power-to-weight ratio",
      "Unique raw driving experience",
      "Rewarding when driven at the limit",
      "Agile direction changes"
    ],
    "weaknesses": [
      "Most demanding GT2 car to drive consistently",
      "Unusual aero characteristics without bodywork",
      "Very limited community setup knowledge",
      "Punishes any mistakes severely"
    ],
    "setup_sensitivity": "The most unusual setup target in ACC — conventional GT3/GT2 setup logic doesn't fully apply given the open-top bodywork. Tyre pressures and ride height require careful independent calibration. Approach setup from first principles rather than copying GT3 methodology.",
    "best_tracks": [
      "Barcelona",
      "Misano",
      "Zandvoort",
      "Silverstone"
    ],
    "difficulty": "Advanced",
    "meta_note": "The most niche GT2 choice with the highest skill ceiling in the class. Only for the most experienced ACC drivers seeking a unique and unfiltered challenge."
  },
  "Maserati GT2 (2023)": {
    "car_notes": "The Maserati MC20 GT2 is one of the newest and most technically sophisticated GT2 cars in ACC. Based on the MC20 supercar, it uses a mid-rear engine layout and produces exceptional aerodynamic downforce from its bodywork. The car has strong rotation through slow and medium-speed corners and benefits from Maserati's modern GT development programme. It is more approachable than the KTM but demands the same respect for GT2 power levels. A competitive, well-rounded GT2 package that rewards drivers who invest time in its unusual suspension geometry and bumpstop setup.",
    "engine_layout": "mid-rear",
    "driving_style": [
      "technical setup investment",
      "smooth rotation",
      "balanced inputs"
    ],
    "strengths": [
      "Modern aerodynamic package",
      "Strong rotation through medium-speed corners",
      "Competitive across circuit types",
      "Sophisticated suspension setup range"
    ],
    "weaknesses": [
      "Complex bumpstop and suspension setup requiring detailed calibration",
      "GT2 power demands respect at all times",
      "Limited community knowledge given car's recent introduction"
    ],
    "setup_sensitivity": "The bumpstop setup is the most critical and complex element of this car — the front and rear bumpstop rates and windows interact significantly. Invest time here before touching other parameters. Rear preload range is unusually wide (20–300 Nm) and benefits from track-specific tuning.",
    "best_tracks": [
      "Barcelona",
      "Imola",
      "Spa",
      "Valencia"
    ],
    "difficulty": "Advanced",
    "meta_note": "A strong all-round GT2 package with a high performance ceiling. One of the better GT2 choices for drivers with strong ACC GT3 foundations looking to step up."
  },
  "Mercedes AMG GT2 (2023)": {
    "car_notes": "The Mercedes AMG GT2 brings the front-engine stability and braking characteristics of its GT3 sibling to the GT2 class, amplified significantly by more power and downforce. It has the widest caster range of any GT2 car (41 positions) giving it exceptional front-end setup flexibility. The AMG GT2 excels at technical circuits where its front-engine weight bias and braking stability translate directly into corner entry confidence. Unlike the mid-engine GT2 cars, it is more forgiving on corner entry but demands more patience on exit given the front-heavy balance under acceleration.",
    "engine_layout": "front",
    "driving_style": [
      "aggressive trail-braking",
      "front-end reliant",
      "patient exit"
    ],
    "strengths": [
      "Widest caster range in GT2 class — exceptional front-end setup flexibility",
      "Outstanding braking stability",
      "More forgiving entry than mid-engine GT2 alternatives",
      "Strong at technical circuits"
    ],
    "weaknesses": [
      "Requires patience on exit — front-engine balance under GT2 power",
      "Less rotation than mid-engine GT2 cars",
      "Stiff ride over bumps at high wing levels"
    ],
    "setup_sensitivity": "Caster is the standout setup tool — 41 positions give more front-end adjustment than any other car in ACC. The unusually wide brake bias range (55–64.9%) also requires precise calibration. Rear wheel rates are the primary exit balance tool.",
    "best_tracks": [
      "Monza",
      "Hungaroring",
      "Barcelona",
      "Zolder",
      "Brands Hatch"
    ],
    "difficulty": "Advanced",
    "meta_note": "The GT2 equivalent of the AMG GT3 Evo — a technical circuit specialist with outstanding braking. A strong choice for drivers who already know the AMG GT3 and want to step up within the same manufacturer."
  },
  "Porsche 935 (2019)": {
    "car_notes": "The Porsche 935 is the most historically distinctive car in the ACC GT2 class — a modern interpretation of the legendary 935 racing car with a rear-engine layout and dramatic bodywork. It combines the Porsche rear-engine philosophy with GT2-level performance, creating a car that demands the same entry patience and exit aggression of the 992/991 GT3 R variants but with considerably more power. The 935 is a specialist choice that rewards drivers who have already mastered the Porsche rear-engine technique in GT3 before attempting GT2. Its caster range (0.1° step, 7.3–10.3°) is narrower than most GT2 cars, limiting front-end setup options.",
    "engine_layout": "rear",
    "driving_style": [
      "patient entry",
      "early rotation",
      "aggressive exit",
      "Porsche technique"
    ],
    "strengths": [
      "Exceptional corner exit traction from rear-engine layout",
      "Dramatic and rewarding to drive well",
      "Strong at traction-heavy circuits",
      "Distinctive character"
    ],
    "weaknesses": [
      "Unforgiving on entry — rear snap with too much commitment",
      "Narrow setup window given limited caster range",
      "Demands prior GT3 Porsche experience",
      "One of the steeper learning curves in all of ACC"
    ],
    "setup_sensitivity": "Front ride height and front spring rates are the critical balance tools — the rear-engine layout amplifies any front setup error significantly. The narrow caster range (3 positions) means there is less front-end adjustment headroom than other GT2 cars.",
    "best_tracks": [
      "Valencia",
      "Hungaroring",
      "Misano",
      "Barcelona"
    ],
    "difficulty": "Advanced",
    "meta_note": "A highly specialist choice for experienced Porsche GT3 drivers wanting a GT2 challenge. Not recommended without prior GT3 Porsche experience — the rear-engine GT2 combination is the most demanding in the class."
  },
  "Porsche 911 GT2 RS CS Evo (2023)": {
    "car_notes": "The Porsche 991II GT2 RS CS Evo is a road-car-derived GT2 machine based on the 911 GT2 RS, tuned for track use. Like the 935 it uses a rear-engine layout, but with a more modern aerodynamic package and a slightly wider setup range. It shares the Porsche rear-engine technique requirement — patient entry, early rotation, aggressive exit — but its modern development makes it marginally more consistent than the 935 over a long stint. The GT2 RS CS Evo rewards experienced Porsche specialists who understand how to manage the rear weight bias at GT2 power levels.",
    "engine_layout": "rear",
    "driving_style": [
      "patient entry",
      "early rotation",
      "strong exit commitment"
    ],
    "strengths": [
      "Modern aero package over the 935",
      "Strong traction advantage on exit",
      "More consistent long-run than 935",
      "Slightly wider setup range"
    ],
    "weaknesses": [
      "Rear-engine GT2 demands highest ACC skill level",
      "Entry snap remains a constant risk",
      "Requires mastery of GT3 Porsche technique first"
    ],
    "setup_sensitivity": "Similar to the 935 but with marginally more adjustment headroom in ride height. Front ride height remains the primary balance control. Rear preload is fixed at 0 — differential tuning is not available as a balance tool unlike most other GT2 cars.",
    "best_tracks": [
      "Valencia",
      "Hungaroring",
      "Misano",
      "Zandvoort"
    ],
    "difficulty": "Advanced",
    "meta_note": "Slightly more approachable than the 935 for experienced Porsche drivers. Still requires full GT3 Porsche mastery before attempting. A compelling GT2 choice for Porsche specialists."
  }
};

export const TRACKS_MAP_DATA: Record<string, TrackMapData> = {
  "Barcelona": {
    "full_name": "Circuit de Barcelona-Catalunya",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Formula1_Circuit_Catalunya_2021.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Formula1_Circuit_Catalunya_2021.svg",
    "verified": true,
    "trackId": "Barcelona",
    "trackName": "Circuit de Barcelona-Catalunya",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Formula1_Circuit_Catalunya_2021.svg"
  },
  "Brands Hatch": {
    "full_name": "Brands Hatch Indy Circuit",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Brands_Hatch.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Brands_Hatch.svg",
    "notes": "Confirm file shows Indy layout, not GP extension",
    "verified": true,
    "trackId": "Brands Hatch",
    "trackName": "Brands Hatch Indy Circuit",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Brands_Hatch.svg"
  },
  "COTA": {
    "full_name": "Circuit of the Americas",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Circuit_of_the_Americas_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Circuit_of_the_Americas_track_map.svg",
    "notes": "Filename unconfirmed — if 404, try File:2022_F1_CourseLayout_COTA.svg",
    "verified": false,
    "trackId": "COTA",
    "trackName": "Circuit of the Americas",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Circuit_of_the_Americas_track_map.svg"
  },
  "Donington Park": {
    "full_name": "Donington Park",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Donington_Park_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Donington_Park_track_map.svg",
    "notes": "Filename unconfirmed — check Commons category page if 404",
    "verified": false,
    "trackId": "Donington Park",
    "trackName": "Donington Park",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Donington_Park_track_map.svg"
  },
  "Hungaroring": {
    "full_name": "Hungaroring",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Hungaroring.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Hungaroring.svg",
    "verified": true,
    "trackId": "Hungaroring",
    "trackName": "Hungaroring",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Hungaroring.svg"
  },
  "Imola": {
    "full_name": "Autodromo Internazionale Enzo e Dino Ferrari",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Imola_2009.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Imola_2009.svg",
    "notes": "2009 layout matches current ACC version",
    "verified": true,
    "trackId": "Imola",
    "trackName": "Autodromo Internazionale Enzo e Dino Ferrari",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Imola_2009.svg"
  },
  "Indianapolis": {
    "full_name": "Indianapolis Motor Speedway — Road Course",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Indianapolis_Motor_Speedway_road_course.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Indianapolis_Motor_Speedway_road_course.svg",
    "notes": "Filename unconfirmed — must show infield road course, not oval",
    "verified": false,
    "trackId": "Indianapolis",
    "trackName": "Indianapolis Motor Speedway — Road Course",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Indianapolis_Motor_Speedway_road_course.svg"
  },
  "Kyalami": {
    "full_name": "Kyalami Grand Prix Circuit",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Kyalami_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Kyalami_track_map.svg",
    "notes": "Filename unconfirmed — ensure it is post-1992 layout used in ACC",
    "verified": false,
    "trackId": "Kyalami",
    "trackName": "Kyalami Grand Prix Circuit",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Kyalami_track_map.svg"
  },
  "Laguna Seca": {
    "full_name": "WeatherTech Raceway Laguna Seca",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Laguna_Seca_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Laguna_Seca_track_map.svg",
    "notes": "Filename unconfirmed — if 404, try WeatherTech_Raceway_Laguna_Seca_track_map.svg",
    "verified": false,
    "trackId": "Laguna Seca",
    "trackName": "WeatherTech Raceway Laguna Seca",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Laguna_Seca_track_map.svg"
  },
  "Misano": {
    "full_name": "Misano World Circuit Marco Simoncelli",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Misano_World_Circuit_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Misano_World_Circuit_track_map.svg",
    "notes": "Filename unconfirmed — ensure anti-clockwise current layout",
    "verified": false,
    "trackId": "Misano",
    "trackName": "Misano World Circuit Marco Simoncelli",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Misano_World_Circuit_track_map.svg"
  },
  "Monza": {
    "full_name": "Autodromo Nazionale Monza",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Monza_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Monza_track_map.svg",
    "verified": true,
    "trackId": "Monza",
    "trackName": "Autodromo Nazionale Monza",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Monza_track_map.svg"
  },
  "Mount Panorama": {
    "full_name": "Mount Panorama Circuit — Bathurst",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Mount_Panorama_Motor_Racing_Circuit_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Mount_Panorama_Motor_Racing_Circuit_track_map.svg",
    "notes": "Filename unconfirmed — if 404, try Mount_Panorama_circuit_map.svg",
    "verified": false,
    "trackId": "Mount Panorama",
    "trackName": "Mount Panorama Circuit — Bathurst",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Mount_Panorama_Motor_Racing_Circuit_track_map.svg"
  },
  "Nordschleife": {
    "full_name": "Nürburgring 24H — Combined Layout",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:N%C3%BCrburgring_Nordschleife.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/N%C3%BCrburgring_Nordschleife.svg",
    "notes": "ACC uses combined GP+Nordschleife layout. Filename unconfirmed — may need to try N%C3%BCrburgring_combined_circuit_map.svg",
    "verified": false,
    "trackId": "Nordschleife",
    "trackName": "Nürburgring 24H — Combined Layout",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/N%C3%BCrburgring_Nordschleife.svg"
  },
  "Nürburgring": {
    "full_name": "Nürburgring GP-Strecke",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:N%C3%BCrburgring_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/N%C3%BCrburgring_track_map.svg",
    "notes": "Filename unconfirmed — must show GP layout only, not Nordschleife",
    "verified": false,
    "trackId": "Nürburgring",
    "trackName": "Nürburgring GP-Strecke",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/N%C3%BCrburgring_track_map.svg"
  },
  "Oulton Park": {
    "full_name": "Oulton Park — International Circuit",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Oulton_Park_circuit_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Oulton_Park_circuit_map.svg",
    "notes": "Filename unconfirmed — must show International layout. Few Wikimedia SVGs exist for this circuit.",
    "verified": false,
    "trackId": "Oulton Park",
    "trackName": "Oulton Park — International Circuit",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Oulton_Park_circuit_map.svg"
  },
  "Paul Ricard": {
    "full_name": "Circuit Paul Ricard",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Paul_Ricard_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Paul_Ricard_track_map.svg",
    "notes": "Filename unconfirmed — if 404, try Circuit_Paul_Ricard_track_map.svg",
    "verified": false,
    "trackId": "Paul Ricard",
    "trackName": "Circuit Paul Ricard",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Paul_Ricard_track_map.svg"
  },
  "Red Bull Ring": {
    "full_name": "Red Bull Ring — Spielberg",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Spielberg_bare_map_numbers_contextless_2016_onwards.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Spielberg_bare_map_numbers_contextless_2016_onwards.svg",
    "verified": true,
    "trackId": "Red Bull Ring",
    "trackName": "Red Bull Ring — Spielberg",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Spielberg_bare_map_numbers_contextless_2016_onwards.svg"
  },
  "Silverstone": {
    "full_name": "Silverstone Circuit",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Silverstone_race_circuit.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Silverstone_race_circuit.svg",
    "verified": true,
    "trackId": "Silverstone",
    "trackName": "Silverstone Circuit",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Silverstone_race_circuit.svg"
  },
  "Snetterton": {
    "full_name": "Snetterton Circuit — 300 Layout",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Snetterton_Motor_Racing_Circuit_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Snetterton_Motor_Racing_Circuit_track_map.svg",
    "notes": "Confirm file shows 300 layout not shorter 200 layout",
    "verified": true,
    "trackId": "Snetterton",
    "trackName": "Snetterton Circuit — 300 Layout",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Snetterton_Motor_Racing_Circuit_track_map.svg"
  },
  "Spa": {
    "full_name": "Circuit de Spa-Francorchamps",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Spa-Francorchamps_of_Belgium.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Spa-Francorchamps_of_Belgium.svg",
    "verified": true,
    "trackId": "Spa",
    "trackName": "Circuit de Spa-Francorchamps",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Spa-Francorchamps_of_Belgium.svg"
  },
  "Suzuka": {
    "full_name": "Suzuka International Racing Course",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Suzuka_circuit_map--2005.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Suzuka_circuit_map--2005.svg",
    "notes": "2005 layout matches current ACC version — figure-of-eight crossover should be clearly visible",
    "verified": true,
    "trackId": "Suzuka",
    "trackName": "Suzuka International Racing Course",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Suzuka_circuit_map--2005.svg"
  },
  "Valencia": {
    "full_name": "Circuit Ricardo Tormo",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Valencia_(Ricardo_Tormo)_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Valencia_(Ricardo_Tormo)_track_map.svg",
    "notes": "Note: this is Circuit Ricardo Tormo, NOT the Valencia Street Circuit used in F1",
    "verified": true,
    "trackId": "Valencia",
    "trackName": "Circuit Ricardo Tormo",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Valencia_(Ricardo_Tormo)_track_map.svg"
  },
  "Watkins Glen": {
    "full_name": "Watkins Glen International",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Watkins_Glen_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Watkins_Glen_track_map.svg",
    "notes": "Filename unconfirmed — must show full GP layout including the Boot section",
    "verified": false,
    "trackId": "Watkins Glen",
    "trackName": "Watkins Glen International",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Watkins_Glen_track_map.svg"
  },
  "Zandvoort": {
    "full_name": "Circuit Zandvoort",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Zandvoort.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Zandvoort.svg",
    "notes": "ACC uses pre-F1 2020 layout — confirm this file shows that version",
    "verified": true,
    "trackId": "Zandvoort",
    "trackName": "Circuit Zandvoort",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Zandvoort.svg"
  },
  "Zolder": {
    "full_name": "Circuit Zolder",
    "wikimedia_page": "https://commons.wikimedia.org/wiki/File:Circuit_Zolder_track_map.svg",
    "svg_url": "https://commons.wikimedia.org/wiki/Special:FilePath/Circuit_Zolder_track_map.svg",
    "notes": "Filename unconfirmed — if 404, try Zolder_circuit_map.svg",
    "verified": false,
    "trackId": "Zolder",
    "trackName": "Circuit Zolder",
    "svgPath": "https://commons.wikimedia.org/wiki/Special:FilePath/Circuit_Zolder_track_map.svg"
  }
};
