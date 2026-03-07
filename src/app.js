    /* ══════════════════════════════════════════════════════════
       FATEWEAVER — Frontend JS
       All AI calls proxied through Lambda (never direct to API)
    ══════════════════════════════════════════════════════════ */

    // ─── LAMBDA URL ──────────────────────────────────────────
    const LAMBDA_PLACEHOLDER = 'YOUR_LAMBDA_URL_HERE';
    // Configure this via APP_CONFIG.gaMeasurementId (or googleAnalyticsId).
    const GA_MEASUREMENT_ID = (() => {
      const fromConfig = window.APP_CONFIG?.gaMeasurementId || window.APP_CONFIG?.googleAnalyticsId || '';
      if (fromConfig) return String(fromConfig).trim();
      try {
        return (localStorage.getItem('visualnovel_ga_measurement_id') || '').trim();
      } catch {
        return '';
      }
    })();

    // ─── DATA ────────────────────────────────────────────────
    const GENRES = [
      // Tier 1 — mainstream / highest demand
      'High Fantasy', 'Romantic Drama', 'Superhero Saga', 'Cyberpunk',
      'Space Opera', 'Detective Thriller', 'Historical Drama', 'Survival Horror',
      // Tier 2 — popular genre staples
      'Noir Mystery', 'Urban Fantasy', 'Gothic Horror', 'Heist',
      'Espionage Thriller', 'Post-Apocalyptic', 'Dark Fantasy', 'Forbidden Romance',
      // Tier 3 — niche but well-loved
      'Supernatural Mystery', 'Time Travel Adventure', 'Steampunk Intrigue', 'Mythic Adventure',
      'Political Thriller', 'Samurai Epic', 'Western Frontier', 'Military Sci-Fi',
      // Tier 4 — specialist / long-tail
      'Occult Mystery', 'Resistance', 'Monster Hunter Adventure', 'Court Intrigue',
      'Lost Civilization Adventure', 'School Drama',
    ];
    const ERAS = [
      'Ancient World (1200–500 BCE)', 'Classical Antiquity (500 BCE–300 CE)', 'Early Medieval (900–1200)',
      'High Medieval (1300s)', 'Feudal Japan (1600s)', 'Age of Sail (1700s)',
      'Industrial Revolution (1840s)', 'Victorian Era (1880s)', 'Belle Époque (1900s)',
      'World War Era (1940s)', 'Postwar Boom (1950s)', 'Cold War (1980s)',
      'Early Internet Age (1990s)', 'Contemporary (2020s)', 'Near Future (2080–2100)',
      'Deep Future (3000+)',
    ];
    const ARCHETYPES = [
      // Tier 1 — iconic bestseller protagonists (Harry Potter, Katniss, Aragorn…)
      'The Hero',      'The Rebel',      'The Outlaw',
      'The Explorer',  'The Survivor',   'The Everyman',
      // Tier 2 — beloved leads & romance staples
      'The Lover',     'The Caregiver',  'The Ruler',
      'The Sage',      'The Magician',   'The Detective',
      // Tier 3 — strong fantasy / genre archetypes
      'The Huntress',  'The Sorceress',  'The Oracle',
      'The Strategist','The Soldier',    'The Ronin',
      // Tier 4 — popular but more niche
      'The Queen',     'The Empress',    'The Valkyrie',
      'The Priestess', 'The Creator',    'The Hacker',
      // Tier 5 — specialist / long-tail
      'The Innocent',  'The Jester',     'The Drifter',
      'The Artist',    'The Aristocrat', 'The Pilot',
    ];
    const BEAT_NAMES = ['You', 'Need', 'Go', 'Search', 'Find', 'Pay', 'Return', 'Change'];
    const BEAT_ICONS = ['◎', '✦', '➤', '⌕', '◇', '✕', '↺', '✧'];
    const LOADING_ARCHETYPE_OPENERS = {
      'The Detective': 'The case file is being stitched',
      'The Aristocrat': 'The courtly web is being spun',
      'The Pilot': 'The flight path through destiny is being charted',
      'The Ronin': 'The path of steel is being forged',
      'The Hacker': 'The fate stack is being compiled',
      'The Artist': 'The final brushstrokes are being layered',
      'The Queen': 'The crown and kingdom are being weighed',
      'The Sorceress': 'The spell circle is being sealed',
      'The Huntress': 'The hidden trail is being tracked',
      'The Priestess': 'The omens are being interpreted',
      'The Empress': 'The empire of choices is being arranged',
      'The Valkyrie': 'The saga of valor is being carved',
      'The Drifter': 'The wandering path is being mapped',
      'The Strategist': 'The decisive gambit is being calculated',
      'The Oracle': 'The threads of fate are being revealed',
      // Jung's 12 archetypes
      'The Innocent':  'A world of pure possibility is being unveiled',
      'The Everyman':  'The long road back to belonging is being traced',
      'The Hero':      'The trial that forges greatness is being summoned',
      'The Caregiver': 'The burden of compassion is being measured',
      'The Explorer':  'The uncharted horizon is being drawn',
      'The Outlaw':    'The rules that must be broken are being found',
      'The Lover':     'The heart\'s deepest longing is being written',
      'The Creator':   'The vision that reshapes the world is being cast',
      'The Jester':    'The laugh that cracks the mask of fate is being prepared',
      'The Sage':      'The hidden truth beneath all illusions is being uncovered',
      'The Magician':  'The transformation at the edge of the possible is being woven',
      'The Ruler':     'The kingdom that hangs in the balance is being arranged',
      'The Soldier':   'The order that holds the line is being tested',
      'The Survivor':  'The last thread of will that refuses to break is being pulled',
      'The Rebel':     'The fire that burns the old world down is being lit',
    };
    const ENDING_COPY = {
      default: {
        good:    { badge: 'DAWN ASCENDANT',            sub: 'Through trial and sacrifice, you stepped into a brighter fate.' },
        neutral: { badge: 'TWILIGHT ACCORD',           sub: 'Not all wounds healed, yet the world held together by a fragile grace.' },
        bad:     { badge: 'NIGHTFALL DESCENT',         sub: 'What you could not save became the lesson carved into the dark.' },
      },
      'Noir Mystery': {
        good:    { badge: 'THE CASE OF MORNING LIGHT', sub: 'In rain-lit streets, the truth finally chose your name.' },
        neutral: { badge: 'THE VERDICT OF SMOKE',      sub: 'Some debts were paid in silence, and some remained in shadow.' },
        bad:     { badge: 'THE FILE MARKED MIDNIGHT',  sub: 'The city kept its secrets, and you became one of them.' },
      },
      'Gothic Horror': {
        good:    { badge: 'CANDLE AGAINST THE ABYSS',  sub: 'Though the night was endless, your flame refused to kneel.' },
        neutral: { badge: 'CHAPEL OF DUSK',            sub: 'The bells fell quiet, and mercy shared a pew with dread.' },
        bad:     { badge: 'THE CRYPT REMEMBERS',       sub: 'The old hunger sang your name beneath the stones.' },
      },
      'Space Opera': {
        good:    { badge: 'STARS BOW TO DAWN',         sub: 'Across the void, your courage redrew the map of hope.' },
        neutral: { badge: 'ORBIT OF MERCY',            sub: 'The war cooled to embers, while old gravity kept its pull.' },
        bad:     { badge: 'A CONSTELLATION UNMADE',    sub: 'The heavens dimmed where your last signal disappeared.' },
      },
      'Samurai Epic': {
        good:    { badge: 'PETALS UPON THE BLADE',     sub: 'Honor survived the storm, and peace answered your steel.' },
        neutral: { badge: 'THE QUIET SCABBARD',        sub: 'The sword slept, but the vow remained between breaths.' },
        bad:     { badge: 'SNOW ON A BROKEN SWORD',    sub: 'Duty stood alone in the field where your banner fell.' },
      },
      'Cyberpunk': {
        good:    { badge: 'NEON REBIRTH PROTOCOL',     sub: 'In a city of static gods, you rewrote tomorrow in living code.' },
        neutral: { badge: 'TRUCE IN STATIC',           sub: 'The system glitched into balance, unstable yet breathing.' },
        bad:     { badge: 'BLACKOUT CASCADE',          sub: 'The grid went dark, and your name dissolved into noise.' },
      },
      'Romantic Drama': {
        good:    { badge: 'WALTZ OF RETURNING HEARTS', sub: 'After all the distance, love found you in the final refrain.' },
        neutral: { badge: 'LETTERS NEVER SENT',        sub: 'You kept each other in memory, if not in your hands.' },
        bad:     { badge: 'THE LAST DANCE ALONE',      sub: 'The music lingered after the room forgot your footsteps.' },
      },
      'Dark Fantasy': {
        good:    { badge: 'THE CROWN OF EMBERS',       sub: 'From ruin and omen, you forged a dawn that answered back.' },
        neutral: { badge: 'THE CIRCLE UNBROKEN',       sub: 'The curse loosened, but never fully left the bloodline.' },
        bad:     { badge: 'THRONE OF SHADOW ROOTS',    sub: 'The old dark took root, and the realm bent with it.' },
      },
      'Mythic Adventure': {
        good:    { badge: 'LAUREL OF THE SUN ROAD',    sub: 'The gods bore witness as your name entered legend.' },
        neutral: { badge: 'THE CROSSROADS OATH',       sub: 'You spared the world its worst fate, at the cost of certainty.' },
        bad:     { badge: 'THE ORACLE FALLS SILENT',   sub: 'Prophecy broke in your hands, and night answered first.' },
      },
      'Post-Apocalyptic': {
        good:    { badge: 'SEEDS IN ASH',              sub: 'Against all endings, you planted a reason to begin again.' },
        neutral: { badge: 'FIRE KEPT LOW',             sub: 'You survived the long dark, but dawn stayed far away.' },
        bad:     { badge: 'THE HORIZON GOES DARK',     sub: 'The wasteland took one more story and left no trace.' },
      },
      'Steampunk Intrigue': {
        good:    { badge: 'THE CLOCKWORK DAWN',        sub: 'Gears aligned with grace, and progress wore a human face.' },
        neutral: { badge: 'THE PENDULUM STILLS',       sub: 'The machine kept time, though no one called it victory.' },
        bad:     { badge: 'THE BOILER BURSTS',         sub: 'Pressure found the weakest seam, and the city paid the price.' },
      },
      'Political Thriller': {
        good:    { badge: 'MANDATE OF LIGHT',          sub: 'Truth held the floor long enough to change the nation.' },
        neutral: { badge: 'ARMISTICE OF WHISPERS',     sub: 'Peace was signed in pencil, always one erasure away.' },
        bad:     { badge: 'COUP AT MIDNIGHT',          sub: 'Power changed hands before sunrise, and justice missed the call.' },
      },
      'Supernatural Mystery': {
        good:    { badge: 'THE VEIL OPENS GENTLY',     sub: 'What haunted the threshold finally named itself and passed.' },
        neutral: { badge: 'THE THRESHOLD HOLDS',       sub: 'The door stayed shut, though something still listened behind it.' },
        bad:     { badge: 'THE DOOR LEFT OPEN',        sub: 'You solved the riddle, but invited the answer inside.' },
      },
      'Western Frontier': {
        good:    { badge: 'THE HORIZON RIDES WITH YOU', sub: 'Across dust and distance, your courage gave the frontier a future.' },
        neutral: { badge: 'DUSK OVER THE BADLANDS',     sub: 'The score was settled, but peace stayed wary at the edge of town.' },
        bad:     { badge: 'GUNSMOKE AT SUNSET',         sub: 'The trail ended in silence where your name once carried weight.' },
      },
      'Superhero Saga': {
        good:    { badge: 'SKYLINE OF TOMORROW',        sub: 'You rose above the ruin and gave the city a reason to believe.' },
        neutral: { badge: 'THE COST OF CAPES',          sub: 'You held the line, though victory came with difficult scars.' },
        bad:     { badge: 'THE FALL OF THE GUARDIAN',   sub: 'When hope looked up, the sky answered with silence.' },
      },
      'Historical Drama': {
        good:    { badge: 'THE ARCHIVE REMEMBERS',      sub: 'In an age of turmoil, your choices bent history toward mercy.' },
        neutral: { badge: 'THE COMPROMISE OF CROWNS',   sub: 'The era endured, though truth survived only in fragments.' },
        bad:     { badge: 'THE ANNALS OF RUIN',         sub: 'Posterity kept your story, but only as a warning.' },
      },
      'High Fantasy': {
        good:    { badge: 'THE AGE OF LIGHT RETURNS',   sub: 'Darkness was named and unmade — the realm breathes free again.' },
        neutral: { badge: 'THE PACT OF DUST AND FIRE',  sub: 'The prophecy bent but did not break; the world survives, changed.' },
        bad:     { badge: 'THE SHADOW TAKES THE THRONE',sub: 'The last light fell, and legend became a warning carved in stone.' },
      },
      'Urban Fantasy': {
        good:    { badge: 'THE CITY WAKES BELIEVING',   sub: 'Magic surfaced where it was needed most, and the street held.' },
        neutral: { badge: 'THE GLAMOUR HOLDS',          sub: 'The hidden world stays hidden — precarious, but intact.' },
        bad:     { badge: 'THE VEIL TEARS OPEN',        sub: 'What lived beneath the city finally came up, and the city changed forever.' },
      },
      'Time Travel Adventure': {
        good:    { badge: 'THE TIMELINE RESTORED',      sub: 'You returned the future to what it was always meant to be.' },
        neutral: { badge: 'THE PARADOX ENDURES',        sub: 'History bent around your presence — close enough to truth to hold.' },
        bad:     { badge: 'THE LOOP DOES NOT CLOSE',    sub: 'Somewhere in the sequence, you became the thing that broke it.' },
      },
      'Detective Thriller': {
        good:    { badge: 'THE CASE CLOSES CLEAN',      sub: 'Every thread led somewhere — and the truth stood up in the end.' },
        neutral: { badge: 'THE VERDICT OF MAYBES',      sub: 'Justice arrived half-dressed, enough to satisfy but not to rest.' },
        bad:     { badge: 'EVIDENCE BURNS AT DAWN',     sub: 'The killer walked, and your name stayed in the file marked unsolved.' },
      },
      'Survival Horror': {
        good:    { badge: 'DAYBREAK AFTER THE DARK',    sub: 'You outlasted every horror and carried the living back to light.' },
        neutral: { badge: 'BARELY BREATHING',           sub: 'You made it out — but something followed you all the way home.' },
        bad:     { badge: 'NO ONE COMES LOOKING',       sub: 'The dark kept what it claimed, and the silence said your name last.' },
      },
      'Military Sci-Fi': {
        good:    { badge: 'ARMISTICE OF THE STARS',     sub: 'The war ended with your name on the right side of history.' },
        neutral: { badge: 'CEASEFIRE IN THE RUBBLE',    sub: 'Neither side won — but the dying stopped, and that was enough.' },
        bad:     { badge: 'LAST SIGNAL LOST',           sub: 'Command received no reply. The front moved on without you.' },
      },
      'Court Intrigue': {
        good:    { badge: 'THE CROWN FINDS ITS HEAD',   sub: 'Every whisper you planted blossomed into the rightful outcome.' },
        neutral: { badge: 'THE COURTLY STALEMATE',      sub: 'Power balanced on the edge of a word — yours kept it from falling.' },
        bad:     { badge: 'EXILED BEFORE DAWN',         sub: 'The court remembered your name only long enough to erase it.' },
      },
      'Monster Hunter Adventure': {
        good:    { badge: 'THE BEAST FALLS SILENT',     sub: 'The hunt ends here — and the village lights its fires again.' },
        neutral: { badge: 'PREY AND HUNTER WITHDRAW',   sub: 'The creature retreated. You count your wounds and call it a draw.' },
        bad:     { badge: 'THE HUNTER BECOMES PREY',    sub: 'Something ancient looked back — and you blinked first.' },
      },
      'School Drama': {
        good:    { badge: 'GRADUATION WITH GRACE',      sub: 'You learned what mattered before the year was done — and it showed.' },
        neutral: { badge: 'PASSING MARKS AND SCARS',    sub: 'You made it through, complicated and changed, but still yourself.' },
        bad:     { badge: 'THE SEMESTER THAT BROKE YOU',sub: 'Some lessons cost more than a grade — this one cost everything.' },
      },
      'Forbidden Romance': {
        good:    { badge: 'LOVE FINDS ITS PASSAGE',     sub: 'Against every wall built to keep you apart, you found a door.' },
        neutral: { badge: 'THE SECRET KEPT BETWEEN YOU',sub: 'You could not have each other openly — but neither could you let go.' },
        bad:     { badge: 'PARTED BY THE WORLD\'S DESIGN',sub: 'The love was real. The world simply would not allow it to survive.' },
      },
      'Heist': {
        good:    { badge: 'THE SCORE LANDS CLEAN',      sub: 'Every contingency held, and the vault gave up exactly what you came for.' },
        neutral: { badge: 'PARTIAL TAKE, FULL ESCAPE',  sub: 'You walked away lighter than planned — but you walked away.' },
        bad:     { badge: 'CUFFED BEFORE SUNRISE',      sub: 'The last piece of the plan was the one you didn\'t account for.' },
      },
      'Espionage Thriller': {
        good:    { badge: 'MISSION DECLASSIFIED',       sub: 'The operation succeeded, and your name will never appear in the report.' },
        neutral: { badge: 'BURNED BUT BREATHING',       sub: 'The asset was compromised, but the worst outcome was narrowly averted.' },
        bad:     { badge: 'COVER BLOWN, FILE CLOSED',   sub: 'The agency disavowed you before the ink dried on the mission brief.' },
      },
      'Lost Civilization Adventure': {
        good:    { badge: 'THE DISCOVERY ENDURES',      sub: 'What was buried for millennia now belongs to the world — and to you.' },
        neutral: { badge: 'RUINS RECLAIMED BY TIME',    sub: 'You found the truth, but could not bring it back across the threshold.' },
        bad:     { badge: 'SEALED WITH THE DEAD',       sub: 'The civilization kept its final secret, and you kept it with them.' },
      },
      'Occult Mystery': {
        good:    { badge: 'THE RITUAL CLOSES',          sub: 'The forbidden circle was completed correctly, and what was opened was sealed.' },
        neutral: { badge: 'THE BARGAIN HOLDS — FOR NOW',sub: 'The entity withdrew, though the terms of its absence remain unclear.' },
        bad:     { badge: 'CONSUMED BY THE WORKING',    sub: 'The knowledge you sought was real. So was the price written into it.' },
      },
      'Resistance': {
        good:    { badge: 'THE REGIME FALLS',           sub: 'Every small act of defiance added up, and the wall finally came down.' },
        neutral: { badge: 'EMBERS IN THE UNDERGROUND',  sub: 'The movement survived — fragmented, scattered, but not extinguished.' },
        bad:     { badge: 'THE LAST CELL GOES DARK',    sub: 'They found you. The cause outlives you, but barely, and quietly.' },
      },
    };

    const GENRE_CFG = {
      'Noir Mystery':   { key: 'noir',      font: "'Playfair Display', Georgia, serif",    fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
      'Gothic Horror':  { key: 'gothic',    font: "'IM Fell English', Georgia, serif",      fontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap' },
      'Space Opera':    { key: 'space',     font: "'Orbitron', monospace",                  fontUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap' },
      'Samurai Epic':   { key: 'samurai',   font: "'Noto Serif JP', serif",                 fontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap' },
      'Cyberpunk':      { key: 'cyberpunk', font: "'Share Tech Mono', monospace",           fontUrl: 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap' },
      'Romantic Drama': { key: 'romantic',  font: "'Cormorant Garamond', Georgia, serif",   fontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap' },
      'Dark Fantasy':         { key: 'gothic',    font: "'IM Fell English', Georgia, serif",    fontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap' },
      'Mythic Adventure':     { key: 'samurai',   font: "'Noto Serif JP', serif",               fontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap' },
      'Post-Apocalyptic':     { key: 'cyberpunk', font: "'Share Tech Mono', monospace",         fontUrl: 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap' },
      'Steampunk Intrigue':   { key: 'noir',      font: "'Playfair Display', Georgia, serif",   fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
      'Political Thriller':   { key: 'noir',      font: "'Playfair Display', Georgia, serif",   fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
      'Supernatural Mystery': { key: 'gothic',    font: "'IM Fell English', Georgia, serif",    fontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap' },
      'Western Frontier':     { key: 'noir',      font: "'Playfair Display', Georgia, serif",   fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
      'Superhero Saga':       { key: 'cyberpunk', font: "'Share Tech Mono', monospace",         fontUrl: 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap' },
      'Historical Drama':     { key: 'romantic',  font: "'Cormorant Garamond', Georgia, serif", fontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap' },
      'High Fantasy':         { key: 'samurai',   font: "'Cinzel', Georgia, serif",              fontUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap' },
      'Urban Fantasy':        { key: 'gothic',    font: "'IM Fell English', Georgia, serif",    fontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap' },
      'Time Travel Adventure':{ key: 'space',     font: "'Orbitron', monospace",                fontUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap' },
      'Detective Thriller':   { key: 'noir',      font: "'Playfair Display', Georgia, serif",   fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
      'Survival Horror':      { key: 'gothic',    font: "'IM Fell English', Georgia, serif",    fontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap' },
      'Military Sci-Fi':      { key: 'cyberpunk', font: "'Share Tech Mono', monospace",         fontUrl: 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap' },
      'Court Intrigue':       { key: 'romantic',  font: "'Cormorant Garamond', Georgia, serif", fontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap' },
      'Monster Hunter Adventure': { key: 'samurai', font: "'Noto Serif JP', serif",             fontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap' },
      'School Drama':         { key: 'romantic',  font: "'Cormorant Garamond', Georgia, serif", fontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap' },
      'Forbidden Romance':    { key: 'romantic',  font: "'Cormorant Garamond', Georgia, serif", fontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap' },
      'Heist':                { key: 'noir',      font: "'Playfair Display', Georgia, serif",   fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
      'Espionage Thriller':   { key: 'noir',      font: "'Playfair Display', Georgia, serif",   fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
      'Lost Civilization Adventure': { key: 'samurai', font: "'Noto Serif JP', serif",         fontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap' },
      'Occult Mystery':       { key: 'gothic',    font: "'IM Fell English', Georgia, serif",    fontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap' },
      'Resistance':           { key: 'cyberpunk', font: "'Share Tech Mono', monospace",         fontUrl: 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap' },
    };

    // ─── STATE ───────────────────────────────────────────────
    const S = {
      lambdaUrl:     null,
      genre:         null,
      era:           null,
      archetype:     null,
      story:         null,   // { pages: { page_1: {...}, ... } }
      currentPageId: 'page_1',
      choicesMade:   [],
      imageCache:    {},     // in-memory
      imageMode:     'lambda', // 'lambda' | 'terrain'
    };

    // ─── ANALYTICS (Google Analytics 4) ───────────────────────
    const GA_ID_RE = /^G-[A-Z0-9]+$/;
    const A = {
      enabled: false,
      lastScreen: null,
      sessionId: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      storyStartedAt: 0,
    };

    function gaSafe(value, maxLen = 120) {
      if (value === null || value === undefined) return '';
      return String(value).slice(0, maxLen);
    }

    function gaErrorCode(err) {
      const msg = gaSafe(err?.message || err).toLowerCase();
      if (msg.includes('timed out')) return 'timeout';
      if (msg.includes('http')) return 'http_error';
      if (msg.includes('no internet')) return 'offline';
      if (msg.includes('lambda')) return 'lambda_error';
      return 'unknown';
    }

    function gaPageMeta(pageId) {
      const id = pageId || '';
      const m = id.match(/^page_(\d+)/);
      return {
        beat: m ? Number(m[1]) : 0,
        path: id.includes('neutral') ? 'neutral' : id.includes('bad') ? 'bad' : 'good',
      };
    }

    function gaStoryParams(extra = {}) {
      return {
        genre: gaSafe(S.genre || 'none', 48),
        era: gaSafe(S.era || 'none', 48),
        archetype: gaSafe(S.archetype || 'none', 48),
        image_mode: gaSafe(S.imageMode || 'none', 16),
        ...extra,
      };
    }

    function trackEvent(name, params = {}) {
      if (!A.enabled || typeof window.gtag !== 'function') return;
      window.gtag('event', name, { session_id: A.sessionId, ...params });
    }

    function initAnalytics() {
      if (!GA_ID_RE.test(GA_MEASUREMENT_ID)) return;
      if (document.getElementById('ga-gtag')) { A.enabled = true; return; }

      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };

      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false, anonymize_ip: true });

      const script = document.createElement('script');
      script.id = 'ga-gtag';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
      script.onerror = () => { A.enabled = false; };
      document.head.appendChild(script);

      A.enabled = true;
      trackEvent('app_loaded', {
        lambda_configured: Number(Boolean(S.lambdaUrl && S.lambdaUrl !== LAMBDA_PLACEHOLDER)),
        image_mode: gaSafe(S.imageMode || 'none', 16),
      });
    }

    /* ─── COLOUR UTILITY (mirrors `color` npm API) ──────────── */
    class Col {
      constructor(hex) {
        const r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
        const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
        this._l=(max+min)/2;
        this._s=max===min?0:(this._l>0.5?d/(2-max-min):d/(max+min));
        if(max===min)this._h=0;
        else if(max===r)this._h=((g-b)/d+(g<b?6:0))/6*360;
        else if(max===g)this._h=((b-r)/d+2)/6*360;
        else this._h=((r-g)/d+4)/6*360;
      }
      _c(){const n=Object.create(Col.prototype);n._h=this._h;n._s=this._s;n._l=this._l;return n;}
      rotate(d){const c=this._c();c._h=((this._h+d)%360+360)%360;return c;}
      saturate(r){const c=this._c();c._s=Math.min(1,this._s*(1+r));return c;}
      desaturate(r){const c=this._c();c._s=Math.max(0,this._s*(1-r));return c;}
      lighten(r){const c=this._c();c._l=Math.min(1,this._l*(1+r));return c;}
      darken(r){const c=this._c();c._l=Math.max(0,this._l*(1-r));return c;}
      string(){return `hsl(${this._h.toFixed(1)},${(this._s*100).toFixed(1)}%,${(this._l*100).toFixed(1)}%)`;}
    }

    /* ─── TERRAIN GENERATOR ─────────────────────────────────── */
    const TERRAIN_BASE_COLORS = {
      noir:      '#3d4a5c',
      gothic:    '#4a2d5e',
      space:     '#1a2060',
      samurai:   '#7a3020',
      cyberpunk: '#00b4d8',
      romantic:  '#c0607a',
    };

    function _seedStr(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (((h << 5) - h) + str.charCodeAt(i)) | 0;
      return h >>> 0;
    }
    function _mkRng(seed) {
      let s = seed || 1;
      return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
    }

    function generateTerrainSvg(genre, imagePrompt) {
      const themeKey = (GENRE_CFG[genre] || {}).key || 'noir';
      const baseColor = new Col(TERRAIN_BASE_COLORS[themeKey] || '#457cd6');
      const rng = _mkRng(_seedStr(imagePrompt || genre || 'terrain'));

      const W = 600, H = 300, offsetY = 200, layerH = 150, layers = 5;
      const sunX = rng() * 0.5 + 0.25;
      const sunY = rng() * 0.1 + 0.1;
      const defs = [], paths = [];

      for (let layer = 1; layer <= layers; layer++) {
        const anchorY = layer * (layerH / layers) + offsetY + (rng() * (layerH / layers));
        const amp   = (rng() * (layerH / layers)) + (layerH / layer / layers);
        const freq1 = (rng() * 0.02 * layer / layers) + 0.005;
        const freq2 = rng() * 0.01 + 0.005;
        const ph1   = rng() * 500;
        const ph2   = ph1 + rng() * 250;

        let coord = `M 0 ${anchorY} `;
        for (let i = 0; i <= W; i++) {
          const y = (Math.sin(freq1 * (i + ph1)) * amp)
                  + (Math.sin(freq2 * (i + ph2)) * amp / 2)
                  + (Math.sin(i * layer / 5) * Math.log(layer) / 4)
                  + (Math.sin(i * layer / 3) * Math.log(layer * 2) / 2)
                  + (Math.sin(i * layer / 2) * (Math.log2(layer) * 1.5))
                  + (anchorY - layerH);
          coord += `H ${i} V ${y.toFixed(2)} `;
        }
        coord += `V ${anchorY} L 0 ${anchorY}`;

        const cx = sunX, cy = (sunY / 2) - ((layer - 1) / Math.pow(layers, 2));
        defs.push(`<radialGradient id="tf${layer}" cx="${cx}" cy="${cy}">
        <stop offset="0%" stop-color="${baseColor.rotate(120).saturate(.3).lighten(.3).desaturate(.1*layer).darken(.1*layer).string()}"/>
        <stop offset="${20/layer}%" stop-color="${baseColor.saturate(.3).desaturate((layer/layers)/4).darken((layer/layers)/2).rotate(120-45*(layer/layers)).string()}"/>
        <stop offset="100%" stop-color="${baseColor.saturate((layer/layers)/2.5).darken(layer/layers).string()}"/>
      </radialGradient>`);
        paths.push(`<path d="${coord}" fill="url(#tf${layer})"/>`);
      }

      const fog = Math.max(0, 1 - sunY * 3);
      return `<svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="tfBg" cx="${sunX}" cy="${sunY}">
      <stop offset="0" stop-color="${baseColor.rotate(240).desaturate(1).lighten(1).string()}"/>
      <stop offset="5%" stop-color="${baseColor.rotate(240).lighten(.7).string()}"/>
      <stop offset="20%" stop-color="${baseColor.rotate(120).desaturate(.5).lighten(.4).string()}"/>
      <stop offset="60%" stop-color="${baseColor.desaturate(.5).lighten(.2).string()}"/>
      <stop offset="90%" stop-color="${baseColor.desaturate(.5).darken(.1).string()}"/>
      <stop offset="100%" stop-color="${baseColor.desaturate(.5).darken(.2).string()}"/>
    </radialGradient>
    ${defs.join('\n    ')}
    <filter id="tfNoise">
      <feTurbulence type="fractalNoise" baseFrequency="30" result="noisy"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" in2="noisy" mode="multiply"/>
    </filter>
    <linearGradient id="tfFog" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="${fog}"/>
      <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect filter="url(#tfNoise)" x="0" y="0" width="100%" height="${H}" fill="url(#tfBg)"/>
  <circle cx="${(sunX*W).toFixed(1)}" cy="${(sunY*H).toFixed(1)}" r="20" fill="${baseColor.rotate(180).desaturate(.8).lighten(.8).string()}"/>
  ${paths.slice(0,3).join('\n  ')}
  <rect x="0" y="0" width="100%" height="${H}" fill="url(#tfFog)"/>
  ${paths.slice(3).join('\n  ')}
</svg>`;
    }
    let timerInterval = null;
    let verbInterval  = null;
    let verbIdx       = 0;
    const LOADING_VERBS = [
      'Weaving', 'Spinning', 'Conjuring', 'Shaping', 'Forging',
      'Summoning', 'Unfolding', 'Scribing', 'Threading', 'Binding',
      'Casting', 'Dreaming', 'Charting', 'Braiding', 'Kindling',
    ];
    const pending = new Set(); // pages with in-flight image requests

    /* ─── STORAGE HELPERS ──────────────────────────────────── */
    const slug = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');

    function storyKey()    { return `visualnovel_story_${slug(S.genre)}_${slug(S.era)}_${slug(S.archetype)}`; }
    function progressKey() { return `visualnovel_progress_${slug(S.genre)}_${slug(S.era)}_${slug(S.archetype)}`; }

    function lsGet(k)   { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
    function lsSet(k,v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
    }

    function saveStory(storyObj) {
      // Strip inline image data before saving (images are in-memory only, not persisted)
      const pages = {};
      for (const [id, page] of Object.entries(storyObj.pages || {})) {
        const { image, ...rest } = page;
        pages[id] = rest;
      }
      lsSet(storyKey(), { meta: { genre: S.genre, era: S.era, archetype: S.archetype, generatedAt: Date.now() }, pages });
    }
    function loadStoredStory() { return lsGet(storyKey()); }

    function saveProgress() {
      lsSet(progressKey(), { currentPage: S.currentPageId, choicesMade: S.choicesMade, startedAt: Date.now() });
    }
    function loadProgress() { return lsGet(progressKey()); }

    // Images are cached in-memory only (S.imageCache) — never persisted to localStorage
    function cacheImage(pageId, data) { S.imageCache[pageId] = data; }
    function getCachedImage(pageId)   { return S.imageCache[pageId] || null; }

    /* ─── LAMBDA FETCH ─────────────────────────────────────── */
    async function callLambda(body, ms = 90000) {
      if (!S.lambdaUrl || S.lambdaUrl === LAMBDA_PLACEHOLDER) throw new Error('Lambda URL not configured — click ⚙ to set it.');

      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), ms);
      try {
        const res = await fetch(S.lambdaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return await res.json();
      } catch(e) {
        if (e.name === 'AbortError') throw new Error('Request timed out (90s). Lambda may be cold-starting — try again.');
        if (!navigator.onLine)       throw new Error('No internet connection.');
        throw new Error(e.message || 'Lambda URL may be incorrect or inactive.');
      } finally {
        clearTimeout(tid);
      }
    }

    /* ─── SCREEN SWITCHING ─────────────────────────────────── */
    function showScreen(name) {
      document.querySelectorAll('.screen').forEach(s => {
        s.id === `screen-${name}` ? s.classList.remove('hidden') : s.classList.add('hidden');
      });
      if (A.lastScreen !== name) {
        A.lastScreen = name;
        trackEvent('screen_view', gaStoryParams({ screen_name: gaSafe(name, 24) }));
      }
    }

    /* ─── SETTINGS / LAMBDA URL ────────────────────────────── */
    function lambdaHost(url) {
      try { return gaSafe(new URL(url).host, 80); } catch { return ''; }
    }

    function initLambdaUrl() {
      const configured = window.APP_CONFIG?.lambdaUrl;
      const stored = localStorage.getItem('visualnovel_lambda_url');
      const url = (configured && configured !== LAMBDA_PLACEHOLDER) ? configured
                : (stored     && stored     !== LAMBDA_PLACEHOLDER) ? stored
                : null;
      if (url) {
        S.lambdaUrl = url;
        document.getElementById('lambda-url-input').value = url;
      } else {
        S.lambdaUrl = LAMBDA_PLACEHOLDER;
        setTimeout(() => document.getElementById('settings-overlay').classList.remove('hidden'), 500);
      }
    }
    function toggleSettings() {
      const overlay = document.getElementById('settings-overlay');
      overlay.classList.toggle('hidden');
      trackEvent('settings_toggled', gaStoryParams({
        state: overlay.classList.contains('hidden') ? 'closed' : 'open',
      }));
    }
    function closeSettings()  {
      const overlay = document.getElementById('settings-overlay');
      const wasOpen = !overlay.classList.contains('hidden');
      overlay.classList.add('hidden');
      if (wasOpen) trackEvent('settings_toggled', gaStoryParams({ state: 'closed' }));
    }
    function saveLambdaUrl() {
      const v = document.getElementById('lambda-url-input').value.trim();
      if (!v.startsWith('http')) {
        trackEvent('lambda_url_save_failed', { reason: 'invalid_url' });
        alert('Please enter a valid URL starting with https://');
        return;
      }
      S.lambdaUrl = v;
      localStorage.setItem('visualnovel_lambda_url', v);
      trackEvent('lambda_url_saved', {
        lambda_host: lambdaHost(v),
        lambda_https: Number(v.startsWith('https://')),
      });
      closeSettings();
    }

    function toggleInfo() {
      const overlay = document.getElementById('info-overlay');
      overlay.classList.toggle('hidden');
      trackEvent('info_toggled', {
        state: overlay.classList.contains('hidden') ? 'closed' : 'open',
      });
    }
    function closeInfo()  {
      const overlay = document.getElementById('info-overlay');
      const wasOpen = !overlay.classList.contains('hidden');
      overlay.classList.add('hidden');
      if (wasOpen) trackEvent('info_toggled', { state: 'closed' });
    }

    /* ─── SETUP SCREEN ─────────────────────────────────────── */
    function buildGrid(containerId, items, stateKey, limit = null) {
      const grid = document.getElementById(containerId);
      grid.innerHTML = '';
      const visible = limit ? items.slice(0, limit) : items;
      const hidden  = limit ? items.slice(limit) : [];

      const renderBtn = label => {
        const btn = document.createElement('button');
        btn.className = 'opt';
        btn.textContent = label;
        btn.onclick = () => {
          grid.querySelectorAll('.opt').forEach(b => b.classList.remove('sel'));
          btn.classList.add('sel');
          S[stateKey] = label;
          trackEvent('selection_changed', gaStoryParams({
            field: gaSafe(stateKey, 16),
            value: gaSafe(label, 64),
          }));
          // Update the summary shown in the collapsed header
          const chosenEl = document.getElementById(`${stateKey}-chosen`);
          if (chosenEl) chosenEl.textContent = label;
          checkReady();
          if (stateKey === 'genre') {
            previewTheme(label);
            collapseSection('genre-section');
            openSection('era-section');
          } else if (stateKey === 'era') {
            collapseSection('era-section');
            openSection('archetype-section');
          } else if (stateKey === 'archetype') {
            collapseSection('archetype-section');
            // Only reveal begin button the first time; subsequent re-selections leave it visible
            const beginEl = document.getElementById('begin-btn-wrap');
            if (beginEl && beginEl.classList.contains('locked')) {
              beginEl.classList.remove('locked');
            }
            setTimeout(() => document.getElementById('begin-btn-wrap')
              ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
          }
        };
        return btn;
      };

      visible.forEach(label => grid.appendChild(renderBtn(label)));

      if (hidden.length) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'opt opt-more';
        moreBtn.textContent = `+${hidden.length} more`;
        moreBtn.onclick = () => {
          trackEvent('selection_more_opened', {
            field: gaSafe(stateKey, 16),
            hidden_count: hidden.length,
          });
          moreBtn.remove();
          hidden.forEach(label => grid.appendChild(renderBtn(label)));
        };
        grid.appendChild(moreBtn);
      }
    }

    function checkReady() {
      document.getElementById('begin-btn').disabled = !(S.genre && S.era && S.archetype);
    }

    /* Collapse an open accordion section */
    function collapseSection(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('accordion-closed');
    }

    /* Open a section: removes locked (first reveal) and accordion-closed (re-open),
       then closes whichever other section is currently expanded */
    function openSection(id) {
      const el = document.getElementById(id);
      if (!el) return;
      // Collapse the currently expanded section (if any) so only one is open
      document.querySelectorAll('.setup-section:not(.locked):not(.accordion-closed)')
        .forEach(s => { if (s.id !== id) s.classList.add('accordion-closed'); });
      el.classList.remove('locked', 'accordion-closed');
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    }

    /* Re-lock era / archetype / begin so the setup screen resets cleanly */
    function resetSetupReveal() {
      ['era-section', 'archetype-section', 'begin-btn-wrap'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.classList.add('locked'); el.classList.remove('accordion-closed'); }
      });
      // Re-open genre section
      const genreEl = document.getElementById('genre-section');
      if (genreEl) genreEl.classList.remove('accordion-closed');
      // Clear all chosen summaries
      ['genre', 'era', 'archetype'].forEach(k => {
        const el = document.getElementById(`${k}-chosen`);
        if (el) el.textContent = '';
      });
      const setupEl = document.getElementById('screen-setup');
      if (setupEl) setupEl.scrollTop = 0;
    }

    /* ─── SETUP / LOADING SCREEN PATTERNS ──────────────────── */
    // Each fn(pid) returns a full SVG string using pid as the unique pattern id.

    function _spNoir(pid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="${pid}" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="56" y2="56" stroke="rgba(201,164,81,0.14)" stroke-width="0.8"/>
            <line x1="56" y1="0" x2="0" y2="56" stroke="rgba(201,164,81,0.14)" stroke-width="0.8"/>
            <line x1="28" y1="-4" x2="28" y2="60" stroke="rgba(201,164,81,0.07)" stroke-width="0.5"/>
            <line x1="-4" y1="28" x2="60" y2="28" stroke="rgba(201,164,81,0.07)" stroke-width="0.5"/>
            <circle cx="28" cy="28" r="2.5" fill="rgba(201,164,81,0.24)"/>
            <circle cx="0" cy="0" r="1.6" fill="rgba(201,164,81,0.2)"/>
            <circle cx="56" cy="0" r="1.6" fill="rgba(201,164,81,0.2)"/>
            <circle cx="0" cy="56" r="1.6" fill="rgba(201,164,81,0.2)"/>
            <circle cx="56" cy="56" r="1.6" fill="rgba(201,164,81,0.2)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#${pid})"/>
      </svg>`;
    }

    function _spGothic(pid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="${pid}" x="0" y="0" width="80" height="96" patternUnits="userSpaceOnUse">
            <path d="M40 90 L8 46 Q8 6 40 8 Q72 6 72 46 Z" fill="none" stroke="rgba(150,70,240,0.2)" stroke-width="0.9"/>
            <circle cx="40" cy="36" r="17" fill="none" stroke="rgba(150,70,240,0.16)" stroke-width="0.9"/>
            <line x1="40" y1="19" x2="40" y2="53" stroke="rgba(150,70,240,0.1)" stroke-width="0.6"/>
            <line x1="23" y1="36" x2="57" y2="36" stroke="rgba(150,70,240,0.1)" stroke-width="0.6"/>
            <line x1="29" y1="24" x2="51" y2="48" stroke="rgba(150,70,240,0.07)" stroke-width="0.5"/>
            <line x1="51" y1="24" x2="29" y2="48" stroke="rgba(150,70,240,0.07)" stroke-width="0.5"/>
            <circle cx="0" cy="0" r="2" fill="rgba(150,70,240,0.22)"/>
            <circle cx="80" cy="0" r="2" fill="rgba(150,70,240,0.22)"/>
            <circle cx="0" cy="96" r="2" fill="rgba(150,70,240,0.22)"/>
            <circle cx="80" cy="96" r="2" fill="rgba(150,70,240,0.22)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#${pid})"/>
      </svg>`;
    }

    function _spSpace(pid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="${pid}" x="0" y="0" width="70" height="80" patternUnits="userSpaceOnUse">
            <path d="M35 4 L66 22 L66 58 L35 76 L4 58 L4 22 Z" fill="none" stroke="rgba(80,140,255,0.2)" stroke-width="0.9"/>
            <circle cx="35" cy="40" r="3"   fill="rgba(120,180,255,0.4)"/>
            <circle cx="19" cy="17" r="1.3" fill="rgba(200,220,255,0.45)"/>
            <circle cx="53" cy="63" r="1.0" fill="rgba(200,220,255,0.35)"/>
            <circle cx="59" cy="26" r="1.6" fill="rgba(200,220,255,0.5)"/>
            <circle cx="11" cy="56" r="1.0" fill="rgba(200,220,255,0.38)"/>
            <circle cx="35" cy="4"  r="1.2" fill="rgba(80,140,255,0.35)"/>
            <circle cx="35" cy="76" r="1.2" fill="rgba(80,140,255,0.35)"/>
            <circle cx="4" cy="40"  r="1.2" fill="rgba(80,140,255,0.3)"/>
            <circle cx="66" cy="40" r="1.2" fill="rgba(80,140,255,0.3)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#${pid})"/>
      </svg>`;
    }

    function _spSamurai(pid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="${pid}" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M32 0 L64 32 L32 64 L0 32 Z" fill="none" stroke="rgba(130,90,30,0.22)" stroke-width="0.9"/>
            <path d="M32 16 L48 32 L32 48 L16 32 Z" fill="none" stroke="rgba(130,90,30,0.13)" stroke-width="0.6"/>
            <circle cx="32" cy="32" r="2.5" fill="rgba(130,90,30,0.22)"/>
            <circle cx="0" cy="32" r="2"   fill="rgba(130,90,30,0.2)"/>
            <circle cx="64" cy="32" r="2"  fill="rgba(130,90,30,0.2)"/>
            <circle cx="32" cy="0" r="2"   fill="rgba(130,90,30,0.2)"/>
            <circle cx="32" cy="64" r="2"  fill="rgba(130,90,30,0.2)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#${pid})"/>
      </svg>`;
    }

    function _spCyberpunk(pid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="${pid}" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <line x1="0" y1="40" x2="80" y2="40" stroke="rgba(0,255,140,0.09)" stroke-width="0.5"/>
            <line x1="40" y1="0" x2="40" y2="80" stroke="rgba(0,255,140,0.09)" stroke-width="0.5"/>
            <path d="M0 20 L20 20 L20 40" fill="none" stroke="rgba(0,255,140,0.22)" stroke-width="1.1"/>
            <path d="M80 60 L60 60 L60 40" fill="none" stroke="rgba(0,255,140,0.22)" stroke-width="1.1"/>
            <path d="M40 0 L40 20 L60 20 L60 40" fill="none" stroke="rgba(0,200,255,0.18)" stroke-width="0.9"/>
            <path d="M40 80 L40 60 L20 60 L20 40" fill="none" stroke="rgba(0,200,255,0.18)" stroke-width="0.9"/>
            <circle cx="20" cy="40" r="3.2" fill="rgba(0,255,140,0.32)"/>
            <circle cx="60" cy="40" r="3.2" fill="rgba(0,255,140,0.32)"/>
            <circle cx="40" cy="20" r="2.6" fill="rgba(0,200,255,0.28)"/>
            <circle cx="40" cy="60" r="2.6" fill="rgba(0,200,255,0.28)"/>
            <rect x="-3" y="-3" width="7" height="7" rx="1" fill="rgba(0,255,140,0.2)"/>
            <rect x="76" y="-3" width="7" height="7" rx="1" fill="rgba(0,255,140,0.2)"/>
            <rect x="-3" y="76" width="7" height="7" rx="1" fill="rgba(0,255,140,0.2)"/>
            <rect x="76" y="76" width="7" height="7" rx="1" fill="rgba(0,255,140,0.2)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#${pid})"/>
      </svg>`;
    }

    function _spRomantic(pid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="${pid}" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
            <path d="M0 35 Q17 17 35 35 Q52 52 70 35" fill="none" stroke="rgba(180,60,80,0.16)" stroke-width="0.9"/>
            <path d="M35 0 Q52 17 35 35 Q18 52 35 70" fill="none" stroke="rgba(180,60,80,0.16)" stroke-width="0.9"/>
            <ellipse cx="35" cy="22" rx="6"  ry="11" fill="rgba(210,80,100,0.2)"/>
            <ellipse cx="35" cy="48" rx="6"  ry="11" fill="rgba(210,80,100,0.2)"/>
            <ellipse cx="22" cy="35" rx="11" ry="6"  fill="rgba(210,80,100,0.2)"/>
            <ellipse cx="48" cy="35" rx="11" ry="6"  fill="rgba(210,80,100,0.2)"/>
            <circle cx="35" cy="35" r="5" fill="rgba(195,55,75,0.26)"/>
            <circle cx="0"  cy="0"  r="6" fill="rgba(210,80,100,0.1)"/>
            <circle cx="70" cy="0"  r="6" fill="rgba(210,80,100,0.1)"/>
            <circle cx="0"  cy="70" r="6" fill="rgba(210,80,100,0.1)"/>
            <circle cx="70" cy="70" r="6" fill="rgba(210,80,100,0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#${pid})"/>
      </svg>`;
    }

    const SCREEN_PATTERN_FNS = {
      noir: _spNoir, gothic: _spGothic, space: _spSpace,
      samurai: _spSamurai, cyberpunk: _spCyberpunk, romantic: _spRomantic,
    };

    function applyScreenTexture(key) {
      const fn = SCREEN_PATTERN_FNS[key];
      if (!fn) return;
      [['setup-bg', 's'], ['loading-bg', 'l']].forEach(([id, suffix]) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = fn(`${key}${suffix}`);
      });
    }

    function previewTheme(genre) {
      const cfg = GENRE_CFG[genre];
      if (!cfg) return;
      document.body.className = `genre-${cfg.key}`;
      applyScreenTexture(cfg.key);
    }

    function applyTheme(genre) {
      const cfg = GENRE_CFG[genre];
      if (!cfg) return;
      document.body.className = `genre-${cfg.key}`;
      document.documentElement.style.setProperty('--font-body', cfg.font);
      // Load font
      let link = document.getElementById('genre-font-link');
      if (!link) { link = document.createElement('link'); link.id = 'genre-font-link'; link.rel = 'stylesheet'; document.head.appendChild(link); }
      link.href = cfg.fontUrl;
    }

    /* ─── BACKGROUND MUSIC ─────────────────────────────────── */
    const MUS = {
      ctx:       null,   // AudioContext
      gain:      null,   // master GainNode → destination (volume + mute)
      buffers:   [],     // decoded AudioBuffers (grows 1 → 3 as extras arrive)
      loopTimer: null,   // setTimeout handle for next crossfade iteration
      muted:     false,
      loading:   false,
      ready:     false,
    };
    const MUSIC_VOL   = 0.22; // ambient volume — low enough not to overpower story text
    const MUSIC_XFADE = 1.5;  // crossfade duration in seconds

    function initAudioCtx() {
      if (!MUS.ctx) MUS.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (MUS.ctx.state === 'suspended') MUS.ctx.resume().catch(() => {});
    }

    function setMusicBtn(state) {
      const btn = document.getElementById('music-btn');
      if (!btn) return;
      btn.classList.remove('mus-hidden', 'mus-loading', 'mus-on', 'mus-off');
      if (state === 'loading') {
        btn.textContent = '♩';
        btn.classList.add('mus-loading');
        btn.title = 'Composing music…';
      } else if (state === 'on') {
        btn.textContent = '♫';
        btn.classList.add('mus-on');
        btn.title = 'Mute music';
      } else if (state === 'off') {
        btn.textContent = '♫';
        btn.classList.add('mus-off');
        btn.title = 'Unmute music';
      } else {
        btn.classList.add('mus-hidden'); // 'hidden' state
      }
    }

    // Schedule one crossfade iteration. bufIdx selects which clip to play.
    // nextBufIdx is resolved at fire-time so newly arrived clips are picked up.
    function scheduleLoopIteration(bufIdx, startAt) {
      if (!MUS.ready || !MUS.gain || !MUS.buffers.length) return;

      const buffer   = MUS.buffers[bufIdx % MUS.buffers.length];
      const dur      = buffer.duration;
      const loopDur  = dur - MUSIC_XFADE; // crossfade starts here

      const src      = MUS.ctx.createBufferSource();
      src.buffer     = buffer;

      // Per-source gain for crossfading (independent of master volume)
      const fadeGain = MUS.ctx.createGain();
      fadeGain.connect(MUS.gain);
      src.connect(fadeGain);

      // Fade in at start, fade out near end
      fadeGain.gain.setValueAtTime(0, startAt);
      fadeGain.gain.linearRampToValueAtTime(1, startAt + MUSIC_XFADE);
      fadeGain.gain.setValueAtTime(1, startAt + loopDur);
      fadeGain.gain.linearRampToValueAtTime(0, startAt + dur);

      src.start(startAt);
      src.stop(startAt + dur);

      // Resolve nextBufIdx at callback time so newly decoded clips are included
      const nextStartAt = startAt + loopDur;
      const fireIn      = Math.max(0, (nextStartAt - MUS.ctx.currentTime - 0.5) * 1000);
      MUS.loopTimer = setTimeout(() => {
        const nextIdx = (bufIdx + 1) % MUS.buffers.length; // cycle through all available
        scheduleLoopIteration(nextIdx, nextStartAt);
      }, fireIn);
    }

    function stopMusic() {
      if (MUS.loopTimer) { clearTimeout(MUS.loopTimer); MUS.loopTimer = null; }
      if (MUS.gain)      { MUS.gain.disconnect(); MUS.gain = null; }
      MUS.buffers = [];
      MUS.ready   = false;
      MUS.loading = false;
    }

    function toggleMusicMute() {
      initAudioCtx();
      MUS.muted = !MUS.muted;
      if (MUS.gain) {
        MUS.gain.gain.setTargetAtTime(MUS.muted ? 0 : MUSIC_VOL, MUS.ctx.currentTime, 0.6);
      }
      if (MUS.ready) setMusicBtn(MUS.muted ? 'off' : 'on');
      trackEvent('music_toggled', {
        muted: Number(MUS.muted),
        music_ready: Number(MUS.ready),
      });
    }

    // Fetch + decode one music clip from Lambda
    async function fetchMusicClip() {
      const result = await callLambda(
        { action: 'generateMusic', genre: S.genre, era: S.era, archetype: S.archetype },
        60000 // 60 s — Lyria buffers 18 s of audio
      );
      if (!result.success || !result.audio) throw new Error(result.error || 'No audio');
      const bin  = atob(result.audio);
      const ab   = new ArrayBuffer(bin.length);
      const view = new Uint8Array(ab);
      for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
      return MUS.ctx.decodeAudioData(ab);
    }

    // Fire-and-forget: fetch 2 more clips in parallel, append as they arrive
    function fetchExtraClips() {
      for (let i = 0; i < 2; i++) {
        fetchMusicClip()
          .then(buf => { if (MUS.ready) MUS.buffers.push(buf); })
          .catch(e  => console.warn('Extra music clip failed:', e.message));
      }
    }

    async function startBackgroundMusic() {
      if (MUS.loading) return;
      stopMusic();
      MUS.loading = true;
      setMusicBtn('loading');
      trackEvent('music_generation_started', gaStoryParams());

      try {
        const firstBuf = await fetchMusicClip();

        // Master gain: constant volume; per-source fadeGains handle crossfades
        MUS.gain = MUS.ctx.createGain();
        MUS.gain.gain.setValueAtTime(MUS.muted ? 0 : MUSIC_VOL, MUS.ctx.currentTime);
        MUS.gain.connect(MUS.ctx.destination);

        MUS.buffers = [firstBuf];
        MUS.ready   = true;
        MUS.loading = false;
        setMusicBtn(MUS.muted ? 'off' : 'on');

        // Start looping — first iteration's fade-in handles the initial ramp-up
        scheduleLoopIteration(0, MUS.ctx.currentTime);
        trackEvent('music_generation_succeeded', gaStoryParams({ clips_loaded: 1 }));

        // Fetch 2 more clips in parallel; they slot into rotation as they arrive
        fetchExtraClips();
      } catch (err) {
        console.warn('Background music unavailable:', err.message);
        MUS.loading = false;
        setMusicBtn('hidden');
        trackEvent('music_generation_failed', gaStoryParams({
          error_code: gaErrorCode(err),
          error_message: gaSafe(err?.message || err),
        }));
      }
    }

    /* ─── STORY GENERATION ─────────────────────────────────── */
    async function beginStory() {
      trackEvent('begin_story_clicked', gaStoryParams());
      if (!S.lambdaUrl || S.lambdaUrl === LAMBDA_PLACEHOLDER) {
        document.getElementById('settings-overlay').classList.remove('hidden');
        trackEvent('begin_story_blocked', { reason: 'lambda_missing' });
        return;
      }
      applyTheme(S.genre);

      // Prime AudioContext within this user-gesture call
      initAudioCtx();
      new Audio('sfx/knock.mp3').play().catch(() => {});

      // Check for existing saved story
      const existing = loadStoredStory();
      if (existing?.pages) {
        const shouldResume = confirm('A saved story exists for this combination.\n\nContinue where you left off?');
        trackEvent('story_resume_prompted', gaStoryParams({
          resumed: Number(shouldResume),
        }));
        if (shouldResume) {
          S.story = { pages: existing.pages };
          const prog = loadProgress();
          S.currentPageId = prog?.currentPage || 'page_1';
          S.choicesMade   = prog?.choicesMade  || [];
          showScreen('game');
          renderPage(S.currentPageId);
          startBackgroundMusic(); // fire-and-forget
          trackEvent('story_resumed', gaStoryParams({
            page_id: gaSafe(S.currentPageId, 24),
            prior_choices: S.choicesMade.length,
          }));
          return;
        } else {
          localStorage.removeItem(storyKey());
          localStorage.removeItem(progressKey());
          S.imageCache = {};
          trackEvent('saved_story_discarded', gaStoryParams());
        }
      }

      showScreen('loading');
      resetLoading();
      startTimer();

      // Kick off music in parallel with story generation
      startBackgroundMusic(); // fire-and-forget

      try {
        A.storyStartedAt = performance.now();
        trackEvent('story_generation_started', gaStoryParams());
        const result = await callLambda({ action: 'generateStory', genre: S.genre, era: S.era, archetype: S.archetype });
        stopTimer();
        if (!result.success) throw new Error(result.error || 'Story generation failed.');
        S.story         = result.story;
        S.currentPageId = 'page_1';
        S.choicesMade   = [];
        saveStory(result.story); // saves story without image data
        showScreen('game');
        renderPage('page_1');
        trackEvent('story_generation_succeeded', gaStoryParams({
          duration_ms: Math.round(performance.now() - A.storyStartedAt),
          page_count: Object.keys(result.story?.pages || {}).length,
        }));
      } catch(err) {
        stopTimer();
        showLoadError(err.message);
        trackEvent('story_generation_failed', gaStoryParams({
          duration_ms: A.storyStartedAt ? Math.round(performance.now() - A.storyStartedAt) : 0,
          error_code: gaErrorCode(err),
          error_message: gaSafe(err?.message || err),
        }));
      }
    }

    function resetLoading() {
      const sub = loadingSubtitleForArchetype(S.archetype);
      document.getElementById('loading-wrap').innerHTML = `
        <div class="loading-sigil">✦</div>
        <h2 class="loading-headline"><span id="loading-verb">Weaving</span> your fate…</h2>
        <p class="loading-sub">${esc(sub)}</p>
        <div class="loading-bar-wrap"><div class="loading-bar-fill"></div></div>
        <div class="loading-timer" id="loading-timer">0s</div>
      `;
    }
    function loadingSubtitleForArchetype(archetype) {
      const opener = LOADING_ARCHETYPE_OPENERS[archetype] || 'Your story is being woven';
      return `${opener} across 8 beats. This may take 60 seconds... or else.`;
    }
    function showLoadError(msg) {
      document.getElementById('loading-wrap').innerHTML = `
        <div class="error-wrap">
          <p class="error-msg">⚠ ${esc(msg)}</p>
          <button class="btn-primary" onclick="showScreen('setup')">Back to Setup</button>
        </div>
      `;
      trackEvent('loading_error_shown', { error_message: gaSafe(msg) });
    }
    function startTimer() {
      let s = 0;
      timerInterval = setInterval(() => { s++; const el = document.getElementById('loading-timer'); if (el) el.textContent = `${s}s`; }, 1000);
      // Verb cycling: fade out → swap → fade in
      verbIdx = 0;
      verbInterval = setInterval(() => {
        const el = document.getElementById('loading-verb');
        if (!el) return;
        el.classList.add('verb-fade');
        setTimeout(() => {
          verbIdx = (verbIdx + 1) % LOADING_VERBS.length;
          el.textContent = LOADING_VERBS[verbIdx];
          el.classList.remove('verb-fade');
        }, 350);
      }, 2200);
    }
    function stopTimer() {
      clearInterval(timerInterval); timerInterval = null;
      clearInterval(verbInterval);  verbInterval  = null;
    }

    /* ─── GAME: RENDER PAGE ────────────────────────────────── */
    function renderPage(pageId) {
      const page = S.story?.pages?.[pageId];
      if (!page) { console.error('Page not found:', pageId); return; }
      S.currentPageId = pageId;
      saveProgress();
      const meta = gaPageMeta(pageId);
      trackEvent('story_page_viewed', gaStoryParams({
        page_id: gaSafe(pageId, 24),
        beat: meta.beat,
        path: meta.path,
        choice_count: (page.choices || []).length,
      }));

      // Story text (fade transition)
      const textEl = document.getElementById('story-text');
      textEl.style.opacity = '0';
      setTimeout(() => { textEl.textContent = page.text; textEl.style.opacity = '1'; }, 160);

      // Choices
      renderChoices(page);

      // Image panel reset
      document.getElementById('ph-prompt').textContent = page.imagePrompt || 'Generating scene…';
      document.getElementById('img-placeholder').classList.remove('hidden');
      document.getElementById('game-img').classList.add('hidden');
      document.getElementById('game-img').classList.remove('cinematic-in');
      document.getElementById('game-svg').classList.add('hidden');
      document.getElementById('game-svg').classList.remove('cinematic-in');

      // Show image if cached in memory; otherwise generate as part of this page render
      const cached = getCachedImage(pageId);
      if (cached) {
        trackEvent('image_cache_hit', gaStoryParams({ page_id: gaSafe(pageId, 24) }));
        displayImage(cached, pageId, 'cache');
      } else {
        loadImage(pageId, page, 'current').catch(() => {});
      }

      // While the user reads this page, generate images for the next pages in the background
      (page.choices || []).forEach(c => {
        if (c.nextPage && !getCachedImage(c.nextPage) && !pending.has(c.nextPage)) {
          const nextPage = S.story?.pages?.[c.nextPage];
          if (nextPage) loadImage(c.nextPage, nextPage, 'prefetch').catch(() => {});
        }
      });
    }

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function renderChoices(page) {
      const container = document.getElementById('choices');
      container.innerHTML = '';
      if (page.choices && page.choices.length > 0) {
        shuffle(page.choices).forEach(c => {
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.innerHTML = `<span class="choice-label">${esc(c.label)}</span><span class="choice-arrow">→</span>`;
          btn.onclick   = () => makeChoice(c.nextPage, c.outcome);
          container.appendChild(btn);
        });
      } else {
        // Final page — show "See Fate" button
        const btn = document.createElement('button');
        btn.className = 'choice-btn ending-btn';
        btn.innerHTML = `<span class="choice-label">✦ See Your Fate ✦</span>`;
        btn.onclick   = () => showEnding(determineEnding(state_currentId()));
        container.appendChild(btn);
      }
    }

    function state_currentId() { return S.currentPageId; }

    function makeChoice(nextPageId, outcome) {
      if (!nextPageId) return;
      trackEvent('story_choice_made', gaStoryParams({
        from_page: gaSafe(S.currentPageId, 24),
        to_page: gaSafe(nextPageId, 24),
        outcome: gaSafe(outcome || 'unknown', 24),
        choice_depth: S.choicesMade.length + 1,
      }));
      S.choicesMade.push({ from: S.currentPageId, to: nextPageId, outcome });
      renderPage(nextPageId);
    }

    function determineEnding(pageId) {
      if (pageId.includes('neutral')) return 'neutral';
      if (pageId.includes('bad'))     return 'bad';
      return 'good';
    }

    function endingCopyFor(type) {
      const genreCopy = ENDING_COPY[S.genre] || ENDING_COPY.default;
      return genreCopy[type] || ENDING_COPY.default[type] || ENDING_COPY.default.good;
    }

    /* ─── STORY CIRCLE ─────────────────────────────────────── */
    function renderCircle(currentBeat) {
      const el = document.getElementById('story-circle');
      el.innerHTML = BEAT_NAMES.map((name, i) => {
        const b   = i + 1;
        const icon = BEAT_ICONS[i] || '•';
        const cls = b < currentBeat ? 'bs done' : b === currentBeat ? 'bs active' : 'bs';
        return `<div class="${cls}" title="Beat ${b}: ${name}"><div class="bs-bar"></div><div class="bs-name">${icon}</div></div>`;
      }).join('');
    }

    /* ─── IMAGE MODE ────────────────────────────────────────── */
    function initImageMode() {
      const stored = localStorage.getItem('visualnovel_image_mode');
      S.imageMode = (stored === 'terrain') ? 'terrain' : 'lambda';
      document.querySelectorAll('input[name="image-mode"]').forEach(r => { r.checked = r.value === S.imageMode; });
    }
    function setImageMode(mode) {
      const prev = S.imageMode;
      S.imageMode = mode;
      localStorage.setItem('visualnovel_image_mode', mode);
      if (prev !== mode) {
        trackEvent('image_mode_changed', {
          from_mode: gaSafe(prev, 16),
          to_mode: gaSafe(mode, 16),
        });
      }
    }

    /* ─── IMAGE LOADING ────────────────────────────────────── */
    async function loadImage(pageId, page, source = 'current') {
      if (!page?.imagePrompt || pending.has(pageId) || getCachedImage(pageId)) return;
      pending.add(pageId);
      trackEvent('image_request_started', gaStoryParams({
        page_id: gaSafe(pageId, 24),
        source: gaSafe(source, 16),
      }));
      try {
        let data;
        let provider = S.imageMode === 'terrain' ? 'terrain' : 'lambda';
        let fallbackUsed = 0;
        if (S.imageMode === 'terrain') {
          data = { type: 'svg', data: generateTerrainSvg(S.genre, page.imagePrompt) };
        } else {
          try {
            const result = await callLambda({ action: 'generateImage', prompt: page.imagePrompt, genre: S.genre });
            if (result.success) {
              data = { type: result.type, data: result.data, mimeType: result.mimeType };
            } else {
              console.warn('Image gen failed, using terrain fallback:', result.error);
              data = { type: 'svg', data: generateTerrainSvg(S.genre, page.imagePrompt) };
              provider = 'terrain';
              fallbackUsed = 1;
              trackEvent('image_request_fallback', gaStoryParams({
                page_id: gaSafe(pageId, 24),
                source: gaSafe(source, 16),
                reason: gaSafe(result.error || 'lambda_unsuccessful'),
              }));
            }
          } catch (lambdaErr) {
            console.warn('Image gen failed, using terrain fallback:', lambdaErr.message);
            data = { type: 'svg', data: generateTerrainSvg(S.genre, page.imagePrompt) };
            provider = 'terrain';
            fallbackUsed = 1;
            trackEvent('image_request_fallback', gaStoryParams({
              page_id: gaSafe(pageId, 24),
              source: gaSafe(source, 16),
              reason: gaErrorCode(lambdaErr),
            }));
          }
        }
        cacheImage(pageId, data);
        trackEvent('image_request_completed', gaStoryParams({
          page_id: gaSafe(pageId, 24),
          source: gaSafe(source, 16),
          image_type: gaSafe(data?.type || 'unknown', 16),
          provider: gaSafe(provider, 16),
          fallback_used: fallbackUsed,
        }));
        if (S.currentPageId === pageId) displayImage(data, pageId, source);
      } catch(e) {
        console.warn('Image gen failed:', pageId, e.message);
        trackEvent('image_request_failed', gaStoryParams({
          page_id: gaSafe(pageId, 24),
          source: gaSafe(source, 16),
          error_code: gaErrorCode(e),
          error_message: gaSafe(e?.message || e),
        }));
      } finally {
        pending.delete(pageId);
      }
    }

    function displayImage(imgData, pageId = S.currentPageId, source = 'current') {
      if (!imgData) return;
      const ph  = document.getElementById('img-placeholder');
      const img = document.getElementById('game-img');
      const svg = document.getElementById('game-svg');

      if (imgData.type === 'image') {
        let revealed = false;
        const reveal = () => {
          if (revealed) return;
          revealed = true;
          ph.classList.add('hidden');
          img.classList.remove('hidden');
          img.classList.remove('cinematic-in');
          void img.offsetWidth; // restart animation class reliably
          img.classList.add('cinematic-in');
          trackEvent('image_displayed', gaStoryParams({
            page_id: gaSafe(pageId, 24),
            source: gaSafe(source, 16),
            image_type: 'image',
          }));
        };
        img.onload = reveal;
        img.src = `data:${imgData.mimeType};base64,${imgData.data}`;
        if (img.complete) reveal();
      } else if (imgData.type === 'svg') {
        svg.innerHTML = imgData.data;
        const svgEl = svg.querySelector('svg');
        if (svgEl) {
          svgEl.removeAttribute('width');
          svgEl.removeAttribute('height');
          svgEl.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        }
        ph.classList.add('hidden');
        svg.classList.remove('hidden');
        svg.classList.remove('cinematic-in');
        void svg.offsetWidth; // restart animation class reliably
        svg.classList.add('cinematic-in');
        trackEvent('image_displayed', gaStoryParams({
          page_id: gaSafe(pageId, 24),
          source: gaSafe(source, 16),
          image_type: 'svg',
        }));
      }
    }

    /* ─── ENDING SCREEN ────────────────────────────────────── */
    function showEnding(type) {
      const sigil = document.getElementById('ending-face');
      const badge = document.getElementById('ending-badge');
      const sub   = document.getElementById('ending-sub');
      sigil.className = 'ending-sigil';
      badge.className = 'ending-badge';
      const copy = endingCopyFor(type);
      badge.textContent = copy.badge;
      sub.textContent   = copy.sub;
      if (type === 'neutral') {
        sigil.textContent = '◎';
        sigil.classList.add('neutral');
        badge.classList.add('neutral');
      } else if (type === 'bad') {
        sigil.textContent = '✕';
        sigil.classList.add('bad');
        badge.classList.add('bad');
      } else {
        sigil.textContent = '✦';
      }
      showScreen('ending');
      trackEvent('ending_viewed', gaStoryParams({
        ending_type: gaSafe(type, 16),
        total_choices: S.choicesMade.length,
        final_page: gaSafe(S.currentPageId, 24),
      }));
    }

    function playAgain() {
      // Keep the story and music, reset progress to page_1
      localStorage.removeItem(progressKey());
      S.currentPageId = 'page_1';
      S.choicesMade   = [];
      showScreen('game');
      renderPage('page_1');
      // Restart music if it stopped or wasn't ready
      if (!MUS.ready && !MUS.loading) startBackgroundMusic();
      trackEvent('play_again_clicked', gaStoryParams());
    }

    function newStory() {
      trackEvent('new_story_clicked', gaStoryParams({
        prior_choices: S.choicesMade.length,
      }));
      // Fade out music first, then clear all data and go to setup
      const FADE_MS = 800;
      if (MUS.gain && MUS.ctx) {
        MUS.gain.gain.setTargetAtTime(0, MUS.ctx.currentTime, FADE_MS / 3000);
      }
      setTimeout(() => {
        stopMusic();
        setMusicBtn('hidden');
        localStorage.removeItem(storyKey());
        localStorage.removeItem(progressKey());
        S.story = null; S.imageCache = {};
        S.currentPageId = 'page_1'; S.choicesMade = [];
        S.genre = null; S.era = null; S.archetype = null;
        document.querySelectorAll('.opt').forEach(b => b.classList.remove('sel'));
        document.getElementById('begin-btn').disabled = true;
        // Reset body class and font to noir default
        document.body.className = 'genre-noir';
        document.documentElement.style.setProperty('--font-body', "'Lora', Georgia, serif");
        // Re-lock sequential setup sections
        resetSetupReveal();
        showScreen('setup');
        // Ensure setup/home screen starts at the top when starting fresh
        const setupScreen = document.getElementById('screen-setup');
        if (setupScreen) setupScreen.scrollTop = 0;
        window.scrollTo(0, 0);
      }, FADE_MS);
    }

    /* ─── UTILITY ──────────────────────────────────────────── */
    function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

    /* ─── INIT ─────────────────────────────────────────────── */
    function init() {
      buildGrid('genre-grid',     GENRES,     'genre', 14);
      buildGrid('era-grid',       ERAS,       'era');
      buildGrid('archetype-grid', ARCHETYPES, 'archetype', 14);

      // Accordion header click — lets the user re-open any completed section to change selection
      ['genre-section', 'era-section', 'archetype-section'].forEach(sectionId => {
        const header = document.querySelector(`#${sectionId} .step-header`);
        if (!header) return;
        header.addEventListener('click', () => {
          const section = document.getElementById(sectionId);
          if (section.classList.contains('accordion-closed')) {
            openSection(sectionId);
          }
        });
      });

      initLambdaUrl();
      initImageMode();
      initAnalytics();
      applyScreenTexture('noir'); // default theme
      showScreen('setup');

      trackEvent('app_ready', {
        lambda_configured: Number(Boolean(S.lambdaUrl && S.lambdaUrl !== LAMBDA_PLACEHOLDER)),
      });

      window.addEventListener('error', evt => {
        trackEvent('client_error', {
          message: gaSafe(evt?.message || 'unknown'),
          file: gaSafe(evt?.filename || ''),
          line: Number(evt?.lineno || 0),
        });
      });
      window.addEventListener('unhandledrejection', evt => {
        const reason = evt?.reason?.message || evt?.reason || 'unknown';
        trackEvent('unhandled_rejection', { message: gaSafe(reason) });
      });
    }

    init();
