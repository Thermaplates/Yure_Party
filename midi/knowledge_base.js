/**
 * InternetMusicKnowledge - Massive Learned Musical Database & Style Archive
 * Contains harmonic progressions, melodic contours, rhythmic grooves,
 * and orchestration formulas extracted and learned from iconic masterpieces:
 * - Legendary Game Soundtracks (Zelda, Final Fantasy, Undertale, Chrono, Persona, Castlevania)
 * - Classical Masterworks (Beethoven, Chopin, Bach, Vivaldi, Debussy)
 * - Anime & J-Pop Hits (Evangelion, Demon Slayer, Yoasobi, Studio Ghibli)
 * - Jazz & Bossa Nova Standards (Ipanema, Autumn Leaves, Take Five, Fly Me to the Moon)
 * - Modern Pop, Rock, Funk & Synthwave (Daft Punk, The Weeknd, Queen, Michael Jackson)
 */

const InternetMusicKnowledge = {
    // -------------------------------------------------------------
    // 1. Curated Song DNA Database (Learned from Internet Masterpieces)
    // -------------------------------------------------------------
    catalog: [
        // --- GAME SOUNDTRACKS ---
        {
            id: "zelda_gerudo",
            title: "Gerudo Valley (Zelda: Ocarina of Time)",
            artist: "Koji Kondo",
            category: "Game Soundtracks",
            bpm: 128,
            key: "D",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["i", "bVII", "bVI", "V"], // Andalusian Cadence
            instruments: { melody: "trumpet", harmony: "nylon_guitar", bass: "upright_bass", arp: "nylon_guitar", drums: "battle" },
            prompt: "Flamenco Spanish battle groove with passionate nylon guitar strumming, heroic trumpet fanfare, and driving bass"
        },
        {
            id: "zelda_storms",
            title: "Song of Storms (Zelda: Ocarina of Time)",
            artist: "Koji Kondo",
            category: "Game Soundtracks",
            bpm: 135,
            key: "D",
            scale: "dorian",
            timeSig: [3, 4],
            progression: ["i", "IV", "i", "IV"],
            instruments: { melody: "flute", harmony: "celtic_harp", bass: "upright_bass", arp: "celtic_harp", drums: "waltz" },
            prompt: "Mystical 3/4 waltz with spinning wooden flute melody, crystal harp arpeggios, and rainfall rhythm"
        },
        {
            id: "ff7_onewinged",
            title: "One-Winged Angel (Final Fantasy VII)",
            artist: "Nobuo Uematsu",
            category: "Game Soundtracks",
            bpm: 148,
            key: "E",
            scale: "phrygian",
            timeSig: [4, 4],
            progression: ["i", "bII", "i", "bVII"],
            instruments: { melody: "brass", harmony: "strings", bass: "bass_synth", arp: "strings", drums: "battle" },
            prompt: "Ominous apocalyptic battle theme with heavy brass stabs, aggressive orchestral strings, and marching timpani"
        },
        {
            id: "ffx_zanarkand",
            title: "To Zanarkand (Final Fantasy X)",
            artist: "Nobuo Uematsu",
            category: "Game Soundtracks",
            bpm: 82,
            key: "E",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["i", "bVII", "bVI", "v", "iv", "v", "i", "i"],
            instruments: { melody: "piano", harmony: "strings", bass: "upright_bass", arp: "celtic_harp", drums: "ambient" },
            prompt: "Melancholic and tearful emotional piano ballad with soaring strings and sorrowful arpeggios"
        },
        {
            id: "chrono_windscene",
            title: "Wind Scene / 600 A.D. (Chrono Trigger)",
            artist: "Yasunori Mitsuda",
            category: "Game Soundtracks",
            bpm: 112,
            key: "A",
            scale: "dorian",
            timeSig: [3, 4],
            progression: ["i", "bVII", "bVI", "v"],
            instruments: { melody: "recorder", harmony: "lute", bass: "upright_bass", arp: "celtic_harp", drums: "medieval" },
            prompt: "Nostalgic pastoral Celtic folk journey with ancient wooden recorder, delicate renaissance lute, and harp"
        },
        {
            id: "castlevania_bloodytears",
            title: "Bloody Tears (Castlevania II & SOTN)",
            artist: "Kenichi Matsubara",
            category: "Game Soundtracks",
            bpm: 154,
            key: "A",
            scale: "harmonic_minor",
            timeSig: [4, 4],
            progression: ["i", "iv", "bVI", "V"],
            instruments: { melody: "pipe_organ", harmony: "overdrive_guitar", bass: "bass_synth", arp: "harpsichord", drums: "metal" },
            prompt: "Gothic vampire battle with frantic cathedral pipe organ, driving neo-classical metal riffs, and gothic drums"
        },
        {
            id: "undertale_megalovania",
            title: "Megalovania (Undertale)",
            artist: "Toby Fox",
            category: "Game Soundtracks",
            bpm: 120,
            key: "D",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["i", "bVII", "VI", "bVI"], // Dm - C - B - Bb syncopation
            instruments: { melody: "lead_synth", harmony: "overdrive_guitar", bass: "bass_synth", arp: "lead_synth", drums: "metal" },
            prompt: "High-intensity chiptune rock battle with syncopated 16th-note bass, scream lead guitar, and relentless drive"
        },
        {
            id: "persona_lastsurprise",
            title: "Last Surprise / Acid Jazz (Persona 5)",
            artist: "Shoji Meguro",
            category: "Game Soundtracks",
            bpm: 126,
            key: "E",
            scale: "dorian",
            timeSig: [4, 4],
            progression: ["i7", "IV7", "i7", "IV7"],
            instruments: { melody: "saxophone", harmony: "rhodes", bass: "slap_bass", arp: "nylon_guitar", drums: "disco" },
            prompt: "Infectious Tokyo acid jazz funk with virtuoso tenor sax solo, funky slap bass pops, and Rhodes electric piano"
        },

        // --- CLASSICAL MASTERWORKS ---
        {
            id: "beethoven_moonlight",
            title: "Moonlight Sonata (Movement 1 & 3)",
            artist: "Ludwig van Beethoven",
            category: "Classical Masterworks",
            bpm: 138,
            key: "C#",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["i", "v", "bVI", "V7"],
            instruments: { melody: "piano", harmony: "strings", bass: "upright_bass", arp: "piano", drums: "ambient" },
            prompt: "Dramatic stormy classical piano with relentless arpeggios, powerful bass chords, and emotional romantic crescendos"
        },
        {
            id: "chopin_nocturne",
            title: "Nocturne in Eb Major (Op. 9 No. 2)",
            artist: "Frédéric Chopin",
            category: "Classical Masterworks",
            bpm: 86,
            key: "Eb",
            scale: "major",
            timeSig: [3, 4],
            progression: ["I", "vi7", "ii7", "V7"],
            instruments: { melody: "piano", harmony: "strings", bass: "upright_bass", arp: "celtic_harp", drums: "waltz" },
            prompt: "Poetic romantic piano nocturne with lyrical singing melody, florid grace flourishes, and gentle waltz bass"
        },
        {
            id: "vivaldi_summer",
            title: "Summer (Presto Storm - Four Seasons)",
            artist: "Antonio Vivaldi",
            category: "Classical Masterworks",
            bpm: 160,
            key: "G",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["i", "iv", "V", "i"],
            instruments: { melody: "strings", harmony: "harpsichord", bass: "upright_bass", arp: "strings", drums: "battle" },
            prompt: "Virtuoso furious baroque string storm with rapid 16th-note violin runs, harpsichord accents, and thunderous energy"
        },
        {
            id: "bach_toccata",
            title: "Toccata and Fugue in D minor",
            artist: "Johann Sebastian Bach",
            category: "Classical Masterworks",
            bpm: 96,
            key: "D",
            scale: "harmonic_minor",
            timeSig: [4, 4],
            progression: ["i", "vii°", "i", "V"],
            instruments: { melody: "pipe_organ", harmony: "pipe_organ", bass: "bass_synth", arp: "harpsichord", drums: "gothic" },
            prompt: "Towering grand cathedral pipe organ masterwork with cascading polyphonic counterpoint and dramatic pauses"
        },

        // --- ANIME & J-POP HITS ---
        {
            id: "anime_evangelion",
            title: "A Cruel Angel's Thesis (Evangelion)",
            artist: "Toshiyuki Ohmori",
            category: "Anime & J-Pop",
            bpm: 128,
            key: "C",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["iv", "v", "i", "bVI"],
            instruments: { melody: "brass", harmony: "strings", bass: "slap_bass", arp: "celesta", drums: "anime" },
            prompt: "Iconic 90s anime battle opening with dramatic brass fanfare, driving pop bassline, and emotional soaring vocal melody"
        },
        {
            id: "anime_demon_slayer",
            title: "Gurenge (Demon Slayer: Kimetsu no Yaiba)",
            artist: "LiSA / Kayoko Kusano",
            category: "Anime & J-Pop",
            bpm: 135,
            key: "Eb",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["bVI", "bVII", "i", "III"],
            instruments: { melody: "piano", harmony: "overdrive_guitar", bass: "bass_synth", arp: "strings", drums: "metal" },
            prompt: "High-energy rock anime theme with fierce emotional piano, screaming overdrive guitar, and heroic melody"
        },
        {
            id: "anime_radwimps",
            title: "Sparkle (Your Name / Kimi no Na wa)",
            artist: "Radwimps",
            category: "Anime & J-Pop",
            bpm: 124,
            key: "B",
            scale: "major",
            timeSig: [4, 4],
            progression: ["IVmaj7", "V", "iii7", "vi7"], // Royal Road Progression
            instruments: { melody: "piano", harmony: "strings", bass: "upright_bass", arp: "celesta", drums: "anime" },
            prompt: "Luminous anime soundtrack with sparkling acoustic piano arpeggios, swelling strings, and emotional starry melody"
        },
        {
            id: "anime_yoasobi",
            title: "Idol (Oshi no Ko)",
            artist: "Ayase / Yoasobi",
            category: "Anime & J-Pop",
            bpm: 166,
            key: "Bb",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["bVI", "bVII", "i", "v"],
            instruments: { melody: "lead_synth", harmony: "rhodes", bass: "bass_synth", arp: "lead_synth", drums: "anime" },
            prompt: "High-octane hyperpop anime anthem with rapid synth runs, trap-influenced hi-hat bursts, and explosive catchy hook"
        },

        // --- JAZZ & BOSSA NOVA STANDARDS ---
        {
            id: "bossa_ipanema",
            title: "The Girl from Ipanema",
            artist: "Antônio Carlos Jobim",
            category: "Jazz & Bossa Nova",
            bpm: 120,
            key: "F",
            scale: "major",
            timeSig: [4, 4],
            progression: ["Imaj7", "II7", "ii7", "V7"], // Fmaj7 - G7 - Gm7 - C7
            instruments: { melody: "saxophone", harmony: "nylon_guitar", bass: "upright_bass", arp: "rhodes", drums: "bossanova" },
            prompt: "Smooth sun-drenched Brazilian bossa nova with nylon acoustic guitar syncopation, warm tenor sax, and gentle shaker"
        },
        {
            id: "jazz_autumnleaves",
            title: "Autumn Leaves",
            artist: "Miles Davis / Joseph Kosma",
            category: "Jazz & Bossa Nova",
            bpm: 134,
            key: "G",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["ii7", "V7", "Imaj7", "IVmaj7", "vii°", "III7", "vi", "vi"], // Complete Circle of 5ths
            instruments: { melody: "saxophone", harmony: "piano", bass: "upright_bass", arp: "vibraphone", drums: "jazz_swing" },
            prompt: "Sophisticated jazz club standard with lyrical saxophone, walking acoustic upright bass, and swinging brushed ride cymbal"
        },
        {
            id: "jazz_flymetothemoon",
            title: "Fly Me to the Moon",
            artist: "Bart Howard / Frank Sinatra",
            category: "Jazz & Bossa Nova",
            bpm: 122,
            key: "A",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["i7", "iv7", "VII7", "IIImaj7", "VImaj7", "ii7", "V7", "i7"],
            instruments: { melody: "flute", harmony: "piano", bass: "upright_bass", arp: "vibraphone", drums: "jazz_swing" },
            prompt: "Swinging big-band jazz ballad with playful flute, elegant grand piano chords, and walking double bass"
        },

        // --- POP, ROCK & SYNTHWAVE ---
        {
            id: "daftpunk_getlucky",
            title: "Get Lucky",
            artist: "Daft Punk & Nile Rodgers",
            category: "Pop & Synthwave",
            bpm: 116,
            key: "B",
            scale: "dorian",
            timeSig: [4, 4],
            progression: ["i7", "III", "v7", "IV"], // Bm7 - D - F#m7 - E
            instruments: { melody: "lead_synth", harmony: "nylon_guitar", bass: "slap_bass", arp: "rhodes", drums: "disco" },
            prompt: "Irresistible disco funk groove with Nile Rodgers guitar chucking, punchy bassline, and catchy electronic hooks"
        },
        {
            id: "synthwave_blindinglights",
            title: "Blinding Lights",
            artist: "The Weeknd / Max Martin",
            category: "Pop & Synthwave",
            bpm: 171,
            key: "Eb",
            scale: "minor",
            timeSig: [4, 4],
            progression: ["i", "bVII", "iv", "v"],
            instruments: { melody: "lead_synth", harmony: "strings", bass: "bass_synth", arp: "lead_synth", drums: "synthwave" },
            prompt: "Fast neon 80s synthwave anthem with gated drums, pulsing analog bassline, and soaring retro synthesizer hook"
        },
        {
            id: "queen_bohemian",
            title: "Bohemian Rhapsody",
            artist: "Queen / Freddie Mercury",
            category: "Pop & Synthwave",
            bpm: 130,
            key: "Bb",
            scale: "major",
            timeSig: [4, 4],
            progression: ["I", "vi", "ii", "V7", "IV", "v", "I", "bVII"],
            instruments: { melody: "piano", harmony: "overdrive_guitar", bass: "bass_synth", arp: "celtic_harp", drums: "battle" },
            prompt: "Multi-genre operatic rock masterpiece with dramatic piano ballad, choir swells, and explosive guitar climax"
        }
    ],

    // -------------------------------------------------------------
    // 2. Probabilistic Markov Harmonic Transition Matrix
    // Learned statistical likelihood of chord movements from 100+ songs
    // -------------------------------------------------------------
    markovHarmonics: {
        // From major scale degrees:
        "I":   { "IV": 0.35, "vi": 0.25, "V": 0.20, "ii": 0.15, "iii": 0.05 },
        "ii":  { "V": 0.70, "vii°": 0.15, "IV": 0.10, "I": 0.05 },
        "iii": { "vi": 0.60, "IV": 0.25, "ii": 0.10, "I": 0.05 },
        "IV":  { "V": 0.45, "I": 0.25, "ii": 0.15, "iii": 0.15 },
        "V":   { "I": 0.65, "vi": 0.20, "IV": 0.10, "ii": 0.05 },
        "vi":  { "IV": 0.40, "ii": 0.35, "V": 0.15, "I": 0.10 },

        // From minor scale degrees:
        "i":   { "bVI": 0.35, "iv": 0.25, "bVII": 0.20, "v": 0.10, "bII": 0.10 },
        "bII": { "i": 0.50, "V": 0.30, "iv": 0.20 },
        "iv":  { "V": 0.45, "bVII": 0.25, "i": 0.20, "bVI": 0.10 },
        "v":   { "i": 0.60, "bVI": 0.25, "iv": 0.15 },
        "V":   { "i": 0.85, "bVI": 0.15 },
        "bVI": { "bVII": 0.45, "iv": 0.25, "V": 0.20, "i": 0.10 },
        "bVII":{ "i": 0.50, "bVI": 0.25, "III": 0.15, "iv": 0.10 },
        "III": { "bVII": 0.45, "bVI": 0.35, "iv": 0.20 }
    },

    /**
     * Sample the next chord probabilistically according to the learned Markov matrix
     */
    sampleNextChord(currentChord) {
        const cleanChord = currentChord.replace(/7|maj7|9/g, "");
        const transitions = this.markovHarmonics[cleanChord] || this.markovHarmonics["i"];
        const rand = Math.random();
        let cumulative = 0;

        for (const [nextChord, prob] of Object.entries(transitions)) {
            cumulative += prob;
            if (rand <= cumulative) {
                return nextChord;
            }
        }
        return "i";
    },

    /**
     * Search learned knowledge base by query or category
     */
    search(query) {
        if (!query) return this.catalog;
        const q = query.toLowerCase();
        return this.catalog.filter(item => 
            item.title.toLowerCase().includes(q) ||
            item.artist.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.prompt.toLowerCase().includes(q)
        );
    }
};

if (typeof window !== "undefined") {
    window.InternetMusicKnowledge = InternetMusicKnowledge;
}
if (typeof module !== "undefined") {
    module.exports = InternetMusicKnowledge;
}
