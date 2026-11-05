/**
 * MusicEngine - Advanced Procedural Music Theory & AI Composition Engine (Suno v4.5 Architecture)
 * Features:
 * - Legendary Composer & Game DNA Presets (Nobuo Uematsu, Persona 5, Toby Fox, Ghibli, Genshin, NieR, Touhou, Mitsuda)
 * - Dynamic Macro-Structure (Intro -> Verse -> Pre-Chorus -> Chorus Drop -> Bridge -> Outro)
 * - Extended Harmonic Voicings (Maj9, m9, 13ths, Sus4 resolutions)
 * - MIDI Style Cloner & DNA Analysis
 * - Humanized phrasing with Antecedent & Consequent motifs
 */

class MusicEngine {
    constructor() {
        // Standard General MIDI Programs (0-127)
        this.GM = {
            AcousticGrandPiano: 0,
            BrightPiano: 1,
            ElectricPiano1: 4,      // Rhodes
            ElectricPiano2: 5,      // DX7
            Harpsichord: 6,
            Clavinet: 7,
            Celesta: 8,
            Glockenspiel: 9,
            MusicBox: 10,
            Vibraphone: 11,
            Marimba: 12,
            DrawbarOrgan: 16,
            ChurchOrgan: 19,        // Pipe Organ
            AcousticNylonGuitar: 24,// Bossa / Classical
            AcousticSteelGuitar: 25,
            ElectricJazzGuitar: 26,
            ElectricCleanGuitar: 27,
            OverdrivenGuitar: 29,
            DistortionGuitar: 30,
            AcousticBass: 32,       // Upright Bass
            ElectricBassFinger: 33,
            SlapBass: 36,
            SynthBass1: 38,
            Violin: 40,
            Cello: 42,
            PizzicatoStrings: 45,
            Harp: 46,               // Celtic Harp
            Timpani: 47,
            StringEnsemble1: 48,
            SynthStrings1: 50,
            Trumpet: 56,
            MutedTrumpet: 59,
            FrenchHorn: 60,
            BrassSection: 61,
            SopranoSax: 64,
            TenorSax: 66,
            Flute: 73,
            Recorder: 74,           // Medieval Recorder
            Shakuhachi: 77,         // Oriental Flute
            Lead1Square: 80,
            Lead2Sawtooth: 81,
            Pad1NewAge: 88,
            Pad2Warm: 89,
            Koto: 107,
            Shamisen: 106,
            TaikoDrum: 116
        };

        this.noteOffsets = {
            "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
            "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8,
            "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11
        };

        this.scales = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
            melodic_minor: [0, 2, 3, 5, 7, 9, 11],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            phrygian: [0, 1, 3, 5, 7, 8, 10],
            lydian: [0, 2, 4, 6, 7, 9, 11],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            pentatonic_major: [0, 2, 4, 7, 9],
            pentatonic_minor: [0, 3, 5, 7, 10],
            blues: [0, 3, 5, 6, 7, 10],
            insen: [0, 1, 5, 7, 10]
        };

        // Comprehensive Composer & Genre DNA Presets
        this.genrePresets = {
            // --- Iconic Composer & Game DNA (Suno v4.5 Style) ---
            "dna_uematsu": {
                name: "Nobuo Uematsu (Final Fantasy)",
                bpm: 146,
                key: "D",
                scale: "minor",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Fanfare Trumpet & Lead", program: this.GM.Trumpet, synthType: "brass" },
                    harmony: { name: "Orchestral Strings", program: this.GM.StringEnsemble1, synthType: "strings" },
                    bass: { name: "Heavy Battle Bass", program: this.GM.SynthBass1, synthType: "bass_synth" },
                    arp: { name: "Fast Spiccato Violin Runs", program: this.GM.PizzicatoStrings, synthType: "strings" },
                    drums: { name: "Epic Timpani & Military Snare", program: 0, drumStyle: "battle" }
                },
                progressions: [
                    ["i", "bVI", "bVII", "i"],
                    ["i", "iv", "bVI", "V7"],
                    ["i", "bII", "bVII", "i"]
                ],
                drumStyle: "battle",
                energy: "epic"
            },
            "dna_persona": {
                name: "Shoji Meguro (Persona 5 Acid Jazz)",
                bpm: 126,
                key: "E",
                scale: "dorian",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Bright Tenor Sax Solo", program: this.GM.TenorSax, synthType: "saxophone" },
                    harmony: { name: "Rhodes EP Chops (9th/13th)", program: this.GM.ElectricPiano1, synthType: "rhodes" },
                    bass: { name: "Infectious Slap Bass", program: this.GM.SlapBass, synthType: "slap_bass" },
                    arp: { name: "Funk Wah Guitar Pluck", program: this.GM.ElectricCleanGuitar, synthType: "nylon_guitar" },
                    drums: { name: "Acid Jazz Swung Funk Beat", program: 0, drumStyle: "disco" }
                },
                progressions: [
                    ["i7", "IV7", "i7", "IV7"],
                    ["i7", "bVII", "iv7", "v7"],
                    ["i7", "IV7", "bVII", "i7"]
                ],
                drumStyle: "disco",
                energy: "high"
            },
            "dna_tobyfox": {
                name: "Toby Fox (Undertale Battle)",
                bpm: 152,
                key: "D",
                scale: "minor",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Fast Overdrive / Chiptune Lead", program: this.GM.Lead1Square, synthType: "lead_synth" },
                    harmony: { name: "Pulse Power Chords", program: this.GM.OverdrivenGuitar, synthType: "overdrive_guitar" },
                    bass: { name: "Rapid 16th Driving Bass", program: this.GM.SynthBass1, synthType: "bass_synth" },
                    arp: { name: "Chiptune Arp Sweep", program: this.GM.Lead2Sawtooth, synthType: "lead_synth" },
                    drums: { name: "High-Octane Battle Rock Kit", program: 0, drumStyle: "metal" }
                },
                progressions: [
                    ["i", "bVII", "bVI", "bVII"],
                    ["i", "bVI", "bIII", "bVII"],
                    ["iv", "v", "bVI", "bVII"]
                ],
                drumStyle: "metal",
                energy: "very_high"
            },
            "dna_ghibli": {
                name: "Joe Hisaishi (Studio Ghibli)",
                bpm: 92,
                key: "F",
                scale: "major",
                timeSig: [3, 4],
                tracks: {
                    melody: { name: "Soaring Concert Flute", program: this.GM.Flute, synthType: "flute" },
                    harmony: { name: "Lush Acoustic Grand Piano", program: this.GM.AcousticGrandPiano, synthType: "piano" },
                    bass: { name: "Acoustic Warm Cello/Bass", program: this.GM.AcousticBass, synthType: "upright_bass" },
                    arp: { name: "Glockenspiel & Celesta", program: this.GM.Celesta, synthType: "celesta" },
                    drums: { name: "Gentle Orchestral Brushes", program: 0, drumStyle: "waltz" }
                },
                progressions: [
                    ["Imaj7", "vi7", "ii7", "V7"],
                    ["IVmaj7", "V7", "iii7", "vi7"],
                    ["I", "IV", "V", "I"]
                ],
                drumStyle: "waltz",
                energy: "emotional"
            },
            "dna_genshin": {
                name: "Yu-Peng Chen (Genshin Asian Fusion)",
                bpm: 104,
                key: "A",
                scale: "minor",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Shakuhachi & Erhu Solo", program: this.GM.Shakuhachi, synthType: "shakuhachi" },
                    harmony: { name: "Traditional Koto Chords", program: this.GM.Koto, synthType: "koto" },
                    bass: { name: "Cinematic Deep Sub Bass", program: this.GM.AcousticBass, synthType: "bass_synth" },
                    arp: { name: "Shamisen Rapid Pluck", program: this.GM.Shamisen, synthType: "koto" },
                    drums: { name: "Thunderous Taiko & Clackers", program: 0, drumStyle: "oriental" }
                },
                progressions: [
                    ["i", "iv", "v", "i"],
                    ["i", "bVII", "bVI", "v"],
                    ["i", "iv", "bVI", "i"]
                ],
                drumStyle: "oriental",
                energy: "mystic"
            },
            "dna_nier": {
                name: "Keiichi Okabe (NieR: Automata)",
                bpm: 114,
                key: "C",
                scale: "minor",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Ethereal Ambient Solo", program: this.GM.Violin, synthType: "strings" },
                    harmony: { name: "Haunting Acoustic Guitar", program: this.GM.AcousticNylonGuitar, synthType: "nylon_guitar" },
                    bass: { name: "Sub Resonance Bass", program: this.GM.SynthBass1, synthType: "bass_synth" },
                    arp: { name: "Crystal Celtic Harp", program: this.GM.Harp, synthType: "celtic_harp" },
                    drums: { name: "Deep Cinematic Taiko Pulses", program: 0, drumStyle: "ambient" }
                },
                progressions: [
                    ["i", "bVI", "iv", "v"],
                    ["i", "bVII", "bVI", "v"],
                    ["i", "bIII", "bVII", "iv"]
                ],
                drumStyle: "ambient",
                energy: "ethereal"
            },
            "dna_touhou": {
                name: "ZUN (Touhou Romantic Brass)",
                bpm: 164,
                key: "D",
                scale: "minor",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Fast Romantic Trumpet", program: this.GM.Trumpet, synthType: "brass" },
                    harmony: { name: "Cascading Piano Arpeggios", program: this.GM.BrightPiano, synthType: "piano" },
                    bass: { name: "Driving 16th Synth Bass", program: this.GM.SynthBass1, synthType: "bass_synth" },
                    arp: { name: "Sparkling Bell Flourish", program: this.GM.MusicBox, synthType: "celesta" },
                    drums: { name: "High-Speed Anime Drum Beat", program: 0, drumStyle: "anime" }
                },
                progressions: [
                    ["bVI", "bVII", "i", "i"],
                    ["iv", "v", "bVI", "bVII"],
                    ["i", "bVI", "bIII", "bVII"]
                ],
                drumStyle: "anime",
                energy: "very_high"
            },
            "dna_mitsuda": {
                name: "Yasunori Mitsuda (Chrono Celtic)",
                bpm: 120,
                key: "G",
                scale: "dorian",
                timeSig: [3, 4],
                tracks: {
                    melody: { name: "Celtic Wooden Pipe", program: this.GM.Recorder, synthType: "recorder" },
                    harmony: { name: "Renaissance Lute Chords", program: this.GM.AcousticNylonGuitar, synthType: "lute" },
                    bass: { name: "Acoustic Folk Bass", program: this.GM.AcousticBass, synthType: "upright_bass" },
                    arp: { name: "Irish Celtic Harp", program: this.GM.Harp, synthType: "celtic_harp" },
                    drums: { name: "Bodhran & Tambourine Jig", program: 0, drumStyle: "medieval" }
                },
                progressions: [
                    ["i", "bVII", "i", "v"],
                    ["i", "iv", "bVII", "i"],
                    ["i", "IV", "bVII", "i"]
                ],
                drumStyle: "medieval",
                energy: "folk"
            },

            // --- Standard High-Quality Genres ---
            "jazz_swing": {
                name: "Jazz Swing & Bebop",
                bpm: 132,
                key: "F",
                scale: "major",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Tenor Saxophone", program: this.GM.TenorSax, synthType: "saxophone" },
                    harmony: { name: "Jazz Piano (7th/9th)", program: this.GM.AcousticGrandPiano, synthType: "piano" },
                    bass: { name: "Walking Upright Bass", program: this.GM.AcousticBass, synthType: "upright_bass" },
                    arp: { name: "Vibraphone Chimes", program: this.GM.Vibraphone, synthType: "vibraphone" },
                    drums: { name: "Swung Brush & Ride", program: 0, drumStyle: "jazz_swing" }
                },
                progressions: [
                    ["ii7", "V7", "Imaj7", "vi7"],
                    ["Imaj7", "vi7", "ii7", "V7"],
                    ["ii7", "V7", "iii7", "vi7"]
                ],
                drumStyle: "jazz_swing",
                energy: "swing"
            },
            "bossanova": {
                name: "Bossa Nova Latin",
                bpm: 124,
                key: "D",
                scale: "major",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Mellow Flute", program: this.GM.Flute, synthType: "flute" },
                    harmony: { name: "Nylon Spanish Guitar", program: this.GM.AcousticNylonGuitar, synthType: "nylon_guitar" },
                    bass: { name: "Warm Acoustic Bass", program: this.GM.AcousticBass, synthType: "upright_bass" },
                    arp: { name: "Rhodes EP Sparkle", program: this.GM.ElectricPiano1, synthType: "rhodes" },
                    drums: { name: "Bossa Shaker & Clave", program: 0, drumStyle: "bossanova" }
                },
                progressions: [
                    ["Imaj7", "vi7", "ii7", "V7"],
                    ["Imaj7", "IVmaj7", "ii7", "V7"],
                    ["ii7", "V7", "iii7", "vi7"]
                ],
                drumStyle: "bossanova",
                energy: "chill"
            },
            "medieval": {
                name: "Medieval Tavern & Folk",
                bpm: 116,
                key: "D",
                scale: "dorian",
                timeSig: [3, 4],
                tracks: {
                    melody: { name: "Wooden Pipe / Recorder", program: this.GM.Recorder, synthType: "recorder" },
                    harmony: { name: "Renaissance Lute", program: this.GM.AcousticNylonGuitar, synthType: "lute" },
                    bass: { name: "Acoustic Folk Bass", program: this.GM.AcousticBass, synthType: "upright_bass" },
                    arp: { name: "Celtic Harp", program: this.GM.Harp, synthType: "celtic_harp" },
                    drums: { name: "Bodhran & Tambourine", program: 0, drumStyle: "medieval" }
                },
                progressions: [
                    ["i", "bVII", "i", "v"],
                    ["i", "iv", "bVII", "i"],
                    ["i", "IV", "bVII", "i"]
                ],
                drumStyle: "medieval",
                energy: "folk"
            },
            "gothic_organ": {
                name: "Gothic Cathedral Organ",
                bpm: 88,
                key: "D",
                scale: "harmonic_minor",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Cathedral Pipe Organ", program: this.GM.ChurchOrgan, synthType: "pipe_organ" },
                    harmony: { name: "Choir & Dark Strings", program: this.GM.StringEnsemble1, synthType: "strings" },
                    bass: { name: "Pedal Sub Organ", program: this.GM.ChurchOrgan, synthType: "bass_synth" },
                    arp: { name: "Harpsichord Flourish", program: this.GM.Harpsichord, synthType: "harpsichord" },
                    drums: { name: "Cathedral Timpani", program: 0, drumStyle: "gothic" }
                },
                progressions: [
                    ["i", "iv", "V", "i"],
                    ["i", "bVI", "iv", "V"],
                    ["i", "bII", "vii°", "i"]
                ],
                drumStyle: "gothic",
                energy: "epic"
            },
            "metal_rock": {
                name: "Heavy Battle Metal",
                bpm: 156,
                key: "E",
                scale: "phrygian",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Overdrive Solo Guitar", program: this.GM.OverdrivenGuitar, synthType: "overdrive_guitar" },
                    harmony: { name: "Distortion Power Riffs", program: this.GM.DistortionGuitar, synthType: "overdrive_guitar" },
                    bass: { name: "Heavy Distorted Bass", program: this.GM.ElectricBassFinger, synthType: "bass_synth" },
                    arp: { name: "Sweep Arp Guitar", program: this.GM.Lead2Sawtooth, synthType: "lead_synth" },
                    drums: { name: "Double Kick Metal Kit", program: 0, drumStyle: "metal" }
                },
                progressions: [
                    ["i", "bII", "i", "bVII"],
                    ["i", "bVI", "bVII", "i"],
                    ["i", "bII", "bVI", "bVII"]
                ],
                drumStyle: "metal",
                energy: "very_high"
            },
            "rpg_boss": {
                name: "RPG Boss Battle",
                bpm: 144,
                key: "D",
                scale: "minor",
                timeSig: [4, 4],
                tracks: {
                    melody: { name: "Violin & Synth Lead", program: this.GM.Lead2Sawtooth, synthType: "lead_synth" },
                    harmony: { name: "Power Brass Section", program: this.GM.BrassSection, synthType: "brass" },
                    bass: { name: "Driving Synth Bass", program: this.GM.SynthBass1, synthType: "bass_synth" },
                    arp: { name: "Fast String Runs", program: this.GM.StringEnsemble1, synthType: "strings" },
                    drums: { name: "Heavy Battle Drums", program: 0, drumStyle: "battle" }
                },
                progressions: [
                    ["i", "VI", "VII", "i"],
                    ["i", "iv", "v", "VI"],
                    ["i", "VII", "VI", "V"]
                ],
                drumStyle: "battle",
                energy: "high"
            }
        };

        // Dynamic Markov progression generator learned from internet songs
        this.useMarkov = true;
        this.learnedSongsMemory = [];
    }

    /**
     * Learn a new song's musical DNA into engine memory
     */
    learnSong(dna, songTitle = "Learned Web Song") {
        this.learnedSongsMemory.push({
            title: songTitle,
            bpm: dna.bpm,
            key: dna.key,
            scale: dna.scale,
            tracks: dna.tracks.length,
            instruments: dna.detectedInstruments || []
        });
    }

    /**
     * Generate a dynamic chord progression learned from internet probability matrices
     */
    generateLearnedProgression(scaleType = "minor", length = 4) {
        if (typeof InternetMusicKnowledge !== "undefined") {
            const isMinor = scaleType.includes("minor") || scaleType === "dorian" || scaleType === "phrygian";
            let current = isMinor ? "i" : "I";
            const prog = [current];

            for (let i = 1; i < length; i++) {
                current = InternetMusicKnowledge.sampleNextChord(current);
                prog.push(current);
            }
            return prog;
        }
        return ["i", "VI", "VII", "i"];
    }

    /**
     * Parse prompt and support Composer DNA tags
     */
    parsePrompt(promptText) {
        if (!promptText || typeof promptText !== "string") {
            return { presetKey: "dna_uematsu", ...this.genrePresets.dna_uematsu };
        }

        const lower = promptText.toLowerCase();

        let extractedBpm = null;
        const bpmMatch = lower.match(/(\d{2,3})\s*bpm/);
        if (bpmMatch) {
            extractedBpm = parseInt(bpmMatch[1], 10);
            if (extractedBpm < 50) extractedBpm = 50;
            if (extractedBpm > 220) extractedBpm = 220;
        }

        let extractedKey = null;
        let extractedScale = null;
        const keyMatch = lower.match(/\b([a-g][#b]?)\s*(major|minor|dorian|pentatonic|lydian|phrygian)/);
        if (keyMatch) {
            extractedKey = keyMatch[1].toUpperCase();
            extractedScale = keyMatch[2];
        }

        // Composer / Style Matching
        let matchedGenre = "rpg_boss";
        if (lower.includes("uematsu") || lower.includes("final fantasy") || lower.includes("chocobo")) {
            matchedGenre = "dna_uematsu";
        } else if (lower.includes("persona") || lower.includes("meguro") || lower.includes("acid jazz")) {
            matchedGenre = "dna_persona";
        } else if (lower.includes("toby fox") || lower.includes("undertale") || lower.includes("megalovania") || lower.includes("deltarune")) {
            matchedGenre = "dna_tobyfox";
        } else if (lower.includes("ghibli") || lower.includes("hisaishi") || lower.includes("totoro") || lower.includes("spirited")) {
            matchedGenre = "dna_ghibli";
        } else if (lower.includes("genshin") || lower.includes("yu-peng") || lower.includes("liyue") || lower.includes("inazuma")) {
            matchedGenre = "dna_genshin";
        } else if (lower.includes("nier") || lower.includes("okabe") || lower.includes("automata")) {
            matchedGenre = "dna_nier";
        } else if (lower.includes("touhou") || lower.includes("zun")) {
            matchedGenre = "dna_touhou";
        } else if (lower.includes("mitsuda") || lower.includes("chrono cross") || lower.includes("chrono trigger")) {
            matchedGenre = "dna_mitsuda";
        } else if (lower.includes("jazz") || lower.includes("swing") || lower.includes("sax")) {
            matchedGenre = "jazz_swing";
        } else if (lower.includes("bossa") || lower.includes("latin") || lower.includes("samba")) {
            matchedGenre = "bossanova";
        } else if (lower.includes("medieval") || lower.includes("tavern") || lower.includes("lute") || lower.includes("folk")) {
            matchedGenre = "medieval";
        } else if (lower.includes("gothic") || lower.includes("cathedral") || lower.includes("church")) {
            matchedGenre = "gothic_organ";
        } else if (lower.includes("metal") || lower.includes("rock") || lower.includes("distortion")) {
            matchedGenre = "metal_rock";
        }

        const preset = JSON.parse(JSON.stringify(this.genrePresets[matchedGenre] || this.genrePresets.dna_uematsu));
        if (extractedBpm) preset.bpm = extractedBpm;
        if (extractedKey) preset.key = extractedKey;
        if (extractedScale) preset.scale = extractedScale;

        preset.presetKey = matchedGenre;
        preset.originalPrompt = promptText;
        return preset;
    }

    getRootMidi(keyName, octave = 4) {
        const offset = this.noteOffsets[keyName] !== undefined ? this.noteOffsets[keyName] : 0;
        return (octave + 1) * 12 + offset;
    }

    getScaleNote(rootMidi, scaleType, degree, octaveOffset = 0) {
        const scale = this.scales[scaleType] || this.scales.major;
        const len = scale.length;
        const octaves = Math.floor(degree / len) + octaveOffset;
        const index = ((degree % len) + len) % len;
        return rootMidi + octaves * 12 + scale[index];
    }

    getScalePitchList(rootMidi, scaleType, minOctave = 3, maxOctave = 7) {
        const scale = this.scales[scaleType] || this.scales.major;
        const tonicBase = rootMidi % 12;
        const list = [];
        for (let oct = minOctave; oct <= maxOctave; oct++) {
            for (let i = 0; i < scale.length; i++) {
                list.push(oct * 12 + tonicBase + scale[i]);
            }
        }
        return [...new Set(list)].sort((a, b) => a - b);
    }

    /**
     * Build rich Suno v4.5 harmonic chords (Open Voicing: Root-5th-8ve-3rd, zero muddy clusters)
     */
    buildChord(roman, rootMidi, scaleType, baseOctave = 4) {
        const isMinorScale = (
            scaleType.includes("minor") ||
            scaleType === "dorian" ||
            scaleType === "phrygian" ||
            scaleType === "blues" ||
            scaleType === "insen"
        );

        const chordDefsMinor = {
            "i": { offset: 0, intervals: [0, 3, 7], isMinor: true },
            "i7": { offset: 0, intervals: [0, 3, 7, 10], isMinor: true },
            "bII": { offset: 1, intervals: [0, 4, 7], isMinor: false },
            "ii": { offset: 2, intervals: [0, 3, 6], isMinor: true, isDim: true },
            "ii°": { offset: 2, intervals: [0, 3, 6], isMinor: true, isDim: true },
            "ii7": { offset: 2, intervals: [0, 3, 6, 10], isMinor: true },
            "bIII": { offset: 3, intervals: [0, 4, 7], isMinor: false },
            "III": { offset: 3, intervals: [0, 4, 7], isMinor: false },
            "iv": { offset: 5, intervals: [0, 3, 7], isMinor: true },
            "iv7": { offset: 5, intervals: [0, 3, 7, 10], isMinor: true },
            "IV": { offset: 5, intervals: [0, 4, 7], isMinor: false },
            "IV7": { offset: 5, intervals: [0, 4, 7, 10], isMinor: false },
            "v": { offset: 7, intervals: [0, 3, 7], isMinor: true },
            "v7": { offset: 7, intervals: [0, 3, 7, 10], isMinor: true },
            "V": { offset: 7, intervals: [0, 4, 7], isMinor: false },
            "V7": { offset: 7, intervals: [0, 4, 7, 10], isMinor: false },
            "VI": { offset: 8, intervals: [0, 4, 7], isMinor: false },
            "bVI": { offset: 8, intervals: [0, 4, 7], isMinor: false },
            "bVImaj7": { offset: 8, intervals: [0, 4, 7, 11], isMinor: false },
            "vi": { offset: 9, intervals: [0, 3, 7], isMinor: true },
            "VII": { offset: 10, intervals: [0, 4, 7], isMinor: false },
            "bVII": { offset: 10, intervals: [0, 4, 7], isMinor: false },
            "vii°": { offset: 11, intervals: [0, 3, 6], isMinor: true, isDim: true }
        };

        const chordDefsMajor = {
            "I": { offset: 0, intervals: [0, 4, 7], isMinor: false },
            "Imaj7": { offset: 0, intervals: [0, 4, 7, 11], isMinor: false },
            "I7": { offset: 0, intervals: [0, 4, 7, 10], isMinor: false },
            "ii": { offset: 2, intervals: [0, 3, 7], isMinor: true },
            "ii7": { offset: 2, intervals: [0, 3, 7, 10], isMinor: true },
            "iii": { offset: 4, intervals: [0, 3, 7], isMinor: true },
            "iii7": { offset: 4, intervals: [0, 3, 7, 10], isMinor: true },
            "IV": { offset: 5, intervals: [0, 4, 7], isMinor: false },
            "IVmaj7": { offset: 5, intervals: [0, 4, 7, 11], isMinor: false },
            "IV7": { offset: 5, intervals: [0, 4, 7, 10], isMinor: false },
            "v": { offset: 7, intervals: [0, 3, 7], isMinor: true },
            "V": { offset: 7, intervals: [0, 4, 7], isMinor: false },
            "V7": { offset: 7, intervals: [0, 4, 7, 10], isMinor: false },
            "vi": { offset: 9, intervals: [0, 3, 7], isMinor: true },
            "vi7": { offset: 9, intervals: [0, 3, 7, 10], isMinor: true },
            "bVI": { offset: 8, intervals: [0, 4, 7], isMinor: false },
            "bVII": { offset: 10, intervals: [0, 4, 7], isMinor: false },
            "vii°": { offset: 11, intervals: [0, 3, 6], isMinor: true, isDim: true }
        };

        const def = (isMinorScale ? chordDefsMinor[roman] : chordDefsMajor[roman]) ||
                    chordDefsMinor[roman] ||
                    chordDefsMajor[roman] ||
                    { offset: 0, intervals: [0, 4, 7], isMinor: false };

        const tonicPitchClass = rootMidi % 12;
        const chordRootPitchClass = (tonicPitchClass + def.offset) % 12;

        // True chord root in octave 4 (MIDI 60-71)
        let rootNoteMidi = 60 + chordRootPitchClass;
        if (rootNoteMidi < 56) rootNoteMidi += 12;
        if (rootNoteMidi > 68) rootNoteMidi -= 12;

        // Bass root in octave 2 / 3 (MIDI 36-48)
        let bassPitch = rootNoteMidi - 24;
        while (bassPitch < 34) bassPitch += 12;
        while (bassPitch > 46) bassPitch -= 12;

        const thirdMidi = rootNoteMidi + def.intervals[1];
        const fifthMidi = rootNoteMidi + def.intervals[2];
        const seventhMidi = def.intervals[3] !== undefined ? rootNoteMidi + def.intervals[3] : null;

        // Rich Open Voicing for Harmony Track:
        // Voice 1: Root (octave 3, 48-60)
        // Voice 2: Fifth (octave 3/4)
        // Voice 3: Octave (Root + 12) or 7th
        // Voice 4: Third (octave 4/5)
        const lowRoot = rootNoteMidi - 12;
        const midFifth = fifthMidi - 12;
        const midRoot = rootNoteMidi;
        const highThird = thirdMidi;

        let voicedNotes = [lowRoot, midFifth, midRoot, highThird];
        if (seventhMidi !== null) {
            voicedNotes = [lowRoot, midFifth, seventhMidi - 12, highThird];
        }

        voicedNotes = [...new Set(voicedNotes)].sort((a, b) => a - b);

        return {
            name: roman,
            notes: voicedNotes,
            rootPitchClass: chordRootPitchClass,
            rootNote: rootNoteMidi,
            rootMidi: rootNoteMidi,
            bassPitch: bassPitch,
            thirdMidi: thirdMidi,
            fifthMidi: fifthMidi,
            seventhMidi: seventhMidi,
            isMinor: def.isMinor,
            isDim: !!def.isDim
        };
    }

    /**
     * Generate complete song arrangement with Suno v4.5 Macro-Structure Dynamics
     */
    generateSong(params = {}) {
        const prompt = params.prompt || "Nobuo Uematsu Epic Orchestral";
        const parsed = this.parsePrompt(prompt);

        const bpm = params.bpm || parsed.bpm || 120;
        const key = params.key || parsed.key || "C";
        const scale = params.scale || parsed.scale || "minor";
        const timeSig = params.timeSig || parsed.timeSig || [4, 4];
        const numBars = params.bars || 32;
        const isLoop = params.loop !== undefined ? params.loop : true;
        const ppq = 480;
        const beatsPerBar = timeSig[0];
        const barTicks = ppq * beatsPerBar;

        const rootMidi = this.getRootMidi(key, 4);

        let primaryProg = params.progression || (parsed.progressions ? parsed.progressions[0] : null);
        let secondaryProg = (parsed.progressions && parsed.progressions.length > 1) ? parsed.progressions[1] : null;

        if (!primaryProg) {
            primaryProg = this.generateLearnedProgression(scale, 4);
        }
        if (!secondaryProg) {
            secondaryProg = this.generateLearnedProgression(scale, 4);
        }

        const barChords = [];
        for (let b = 0; b < numBars; b++) {
            let chosenProg = primaryProg;
            if (b >= 12 && b < 28) chosenProg = secondaryProg;
            const chordRoman = chosenProg[b % chosenProg.length];
            barChords.push(this.buildChord(chordRoman, rootMidi, scale, 4));
        }

        // 5 Tracks initialization
        const melodyTrack = {
            name: params.melodyName || parsed.tracks.melody.name,
            channel: 0,
            program: params.melodyProgram !== undefined ? params.melodyProgram : parsed.tracks.melody.program,
            synthType: params.melodySynthType || parsed.tracks.melody.synthType || "lead_synth",
            notes: []
        };

        const harmonyTrack = {
            name: params.harmonyName || parsed.tracks.harmony.name,
            channel: 1,
            program: params.harmonyProgram !== undefined ? params.harmonyProgram : parsed.tracks.harmony.program,
            synthType: params.harmonySynthType || parsed.tracks.harmony.synthType || "piano",
            notes: []
        };

        const bassTrack = {
            name: params.bassName || parsed.tracks.bass.name,
            channel: 2,
            program: params.bassProgram !== undefined ? params.bassProgram : parsed.tracks.bass.program,
            synthType: params.bassSynthType || parsed.tracks.bass.synthType || "upright_bass",
            notes: []
        };

        const arpTrack = {
            name: params.arpName || parsed.tracks.arp.name,
            channel: 3,
            program: params.arpProgram !== undefined ? params.arpProgram : parsed.tracks.arp.program,
            synthType: params.arpSynthType || parsed.tracks.arp.synthType || "celtic_harp",
            notes: []
        };

        const drumTrack = {
            name: params.drumName || parsed.tracks.drums.name,
            channel: 9,
            program: 0,
            drumStyle: params.drumStyle || parsed.drumStyle || "battle",
            notes: []
        };

        const drumStyle = drumTrack.drumStyle;

        // Dynamic Macro-Structure:
        // Bars 0-3: Intro (Sparse atmospheric)
        // Bars 4-11: Verse (Groove entry, theme A)
        // Bars 12-15: Pre-Chorus (Tension build-up, snare crescendos)
        // Bars 16-23: Chorus Drop (Maximum energy, full polyphony, crash hits)
        // Bars 24-27: Bridge / Solo
        // Bars 28-31: Climax & Loop Turnaround
        for (let bar = 0; bar < numBars; bar++) {
            const barStartTick = bar * barTicks;
            const chord = barChords[bar];

            const isIntro = bar < 4;
            const isPreChorus = bar >= 12 && bar < 16;
            const isChorus = bar >= 16 && bar < 24;
            const isBridge = bar >= 24 && bar < 28;

            // 1. Harmony Chords
            this.generateHarmonyForBar(harmonyTrack, chord, barStartTick, barTicks, beatsPerBar, ppq, drumStyle, isChorus);

            // 2. Bassline
            if (!isIntro || bar >= 2) {
                this.generateBassForBar(bassTrack, chord, barStartTick, barTicks, beatsPerBar, ppq, drumStyle, isChorus || isPreChorus);
            }

            // 3. Arpeggio
            if (!isIntro || bar >= 2) {
                this.generateArpForBar(arpTrack, chord, barStartTick, barTicks, beatsPerBar, ppq, drumStyle, isChorus);
            }

            // 4. Melody (Motif Phrasing)
            this.generateMelodyForBar(melodyTrack, chord, rootMidi, scale, barStartTick, barTicks, beatsPerBar, ppq, bar, isChorus);

            // 5. Drums (Arrangement Dynamics)
            if (!isIntro) {
                this.generateDrumsForBar(drumTrack, barStartTick, barTicks, beatsPerBar, ppq, drumStyle, bar, numBars, isPreChorus, isChorus);
            }
        }

        const totalTicks = numBars * barTicks;
        const totalDurationSec = Math.round((totalTicks / (ppq * (bpm / 60))) * 100) / 100;
        const loopStartTick = isLoop ? (barTicks * 4) : 0;
        const loopLengthTicks = isLoop ? (barTicks * (numBars - 4)) : totalTicks;

        return {
            title: `MidiSuno - ${parsed.name} (${key} ${scale.toUpperCase()})`,
            genre: parsed.name,
            prompt: prompt,
            bpm: bpm,
            key: key,
            scale: scale,
            timeSignature: timeSig,
            totalBars: numBars,
            totalTicks: totalTicks,
            totalDurationSec: totalDurationSec,
            loop: isLoop,
            loopStartTick: loopStartTick,
            loopLengthTicks: loopLengthTicks,
            loopStartSec: Math.round((loopStartTick / (ppq * (bpm / 60))) * 100) / 100,
            loopLengthSec: Math.round((loopLengthTicks / (ppq * (bpm / 60))) * 100) / 100,
            lyrics: this.generateLyrics(parsed.name, prompt, key, scale),
            tracks: [melodyTrack, harmonyTrack, bassTrack, arpTrack, drumTrack]
        };
    }

    /**
     * Generate Harmony Chords with dynamic velocity and strumming
     */
    generateHarmonyForBar(track, chord, startTick, barTicks, beatsPerBar, ppq, style, isChorus) {
        const chordNotes = chord.notes;
        const baseVel = isChorus ? 92 : 78;

        if (style === "waltz" || style === "medieval") {
            for (let b = 1; b < beatsPerBar; b++) {
                const tick = startTick + b * ppq;
                chordNotes.forEach(pitch => {
                    track.notes.push({
                        pitch: pitch,
                        startTick: tick,
                        durationTicks: Math.round(ppq * 0.85),
                        velocity: baseVel + Math.floor(Math.random() * 8)
                    });
                });
            }
        } else if (style === "bossanova") {
            const syncHits = [0, ppq * 1.5, ppq * 2, ppq * 3.5];
            syncHits.forEach(offset => {
                chordNotes.forEach(pitch => {
                    track.notes.push({
                        pitch: pitch,
                        startTick: Math.round(startTick + offset),
                        durationTicks: Math.round(ppq * 0.45),
                        velocity: baseVel
                    });
                });
            });
        } else if (style === "jazz_swing" || style === "disco") {
            for (let b = 0; b < beatsPerBar; b++) {
                chordNotes.forEach(pitch => {
                    track.notes.push({
                        pitch: pitch,
                        startTick: startTick + b * ppq,
                        durationTicks: Math.round(ppq * 0.5),
                        velocity: (b === 1 || b === 3) ? baseVel + 8 : baseVel - 8
                    });
                });
            }
        } else {
            // Sustained lush pad / organ
            chordNotes.forEach((pitch, i) => {
                const microStrum = i * 15; // 15 tick organic strum
                track.notes.push({
                    pitch: pitch,
                    startTick: startTick + microStrum,
                    durationTicks: Math.round(barTicks * 0.95),
                    velocity: baseVel
                });
            });
        }
    }

    /**
     * Generate Bassline with pure harmonic roots and genre-authentic movement
     */
    generateBassForBar(track, chord, startTick, barTicks, beatsPerBar, ppq, style, isClimax) {
        const root = chord.bassPitch;
        const third = chord.thirdMidi ? chord.thirdMidi - 24 : (chord.isMinor ? root + 3 : root + 4);
        const fifth = chord.fifthMidi ? chord.fifthMidi - 24 : root + 7;
        const octave = root + 12;

        if (style === "jazz_swing") {
            const walking = [root, third, fifth, octave];
            for (let b = 0; b < beatsPerBar; b++) {
                track.notes.push({
                    pitch: walking[b % walking.length],
                    startTick: startTick + b * ppq,
                    durationTicks: Math.round(ppq * 0.88),
                    velocity: (b === 0 || b === 2) ? 102 : 90
                });
            }
        } else if (style === "disco") {
            for (let b = 0; b < beatsPerBar * 2; b++) {
                track.notes.push({
                    pitch: (b % 2 === 0) ? root : octave,
                    startTick: startTick + b * (ppq / 2),
                    durationTicks: Math.round((ppq / 2) * 0.8),
                    velocity: (b % 2 === 0) ? 106 : 94
                });
            }
        } else if (style === "metal" || style === "battle" || style === "anime") {
            const steps = isClimax ? 8 : 4;
            const stepTicks = barTicks / steps;
            for (let s = 0; s < steps; s++) {
                const pitch = (s % 2 === 0) ? root : ((s === 3 || s === 7) ? fifth : octave);
                track.notes.push({
                    pitch: pitch,
                    startTick: startTick + s * stepTicks,
                    durationTicks: Math.round(stepTicks * 0.82),
                    velocity: (s === 0 || s === 4) ? 112 : 95
                });
            }
        } else if (style === "bossanova") {
            track.notes.push({ pitch: root, startTick: startTick, durationTicks: Math.round(ppq * 1.4), velocity: 100 });
            track.notes.push({ pitch: fifth, startTick: startTick + Math.round(ppq * 1.5), durationTicks: Math.round(ppq * 0.9), velocity: 90 });
            track.notes.push({ pitch: root, startTick: startTick + Math.round(ppq * 2.5), durationTicks: Math.round(ppq * 1.4), velocity: 96 });
        } else if (style === "waltz") {
            track.notes.push({ pitch: root, startTick: startTick, durationTicks: Math.round(ppq * 1.8), velocity: 104 });
        } else {
            track.notes.push({ pitch: root, startTick: startTick, durationTicks: Math.round(ppq * 1.8), velocity: 98 });
            track.notes.push({ pitch: fifth, startTick: startTick + ppq * 2, durationTicks: Math.round(ppq * 1.8), velocity: 92 });
        }
    }

    /**
     * Generate Arpeggiator (Lush, sweet upper flourishes)
     */
    generateArpForBar(track, chord, startTick, barTicks, beatsPerBar, ppq, style, isChorus) {
        let baseNotes = chord.notes.map(n => {
            let p = n;
            while (p < 64) p += 12;
            while (p > 82) p -= 12;
            return p;
        });
        baseNotes = [...new Set(baseNotes)].sort((a, b) => a - b);
        if (baseNotes.length < 3) {
            baseNotes.push(baseNotes[0] + 12);
        }
        const chordPitches = [...baseNotes, baseNotes[0] + 12];
        const numNotes = isChorus ? 8 : (beatsPerBar === 3 ? 6 : 4);
        const stepTicks = barTicks / numNotes;

        for (let i = 0; i < numNotes; i++) {
            const noteIdx = (i % 4 < 3) ? (i % chordPitches.length) : (chordPitches.length - 2);
            const pitch = chordPitches[Math.abs(noteIdx) % chordPitches.length];

            track.notes.push({
                pitch: pitch,
                startTick: startTick + i * stepTicks,
                durationTicks: Math.round(stepTicks * 0.8),
                velocity: 70 + (i % 2 === 0 ? 14 : 0)
            });
        }
    }

    /**
     * Generate Melody with Phrasing & Motif (Antecedent & Consequent)
     * 100% scale and chord-tone derived, 0% chromatic dissonance
     */
    generateMelodyForBar(track, chord, rootMidi, scale, startTick, barTicks, beatsPerBar, ppq, barIndex, isChorus) {
        const scalePitches = this.getScalePitchList(rootMidi, scale, 4, 7);
        const phraseBar = barIndex % 4;

        // Chord pitch classes
        const chordPitchClasses = [
            chord.rootPitchClass !== undefined ? chord.rootPitchClass : (chord.rootNote % 12),
            chord.thirdMidi ? (chord.thirdMidi % 12) : ((chord.rootNote + (chord.isMinor ? 3 : 4)) % 12),
            chord.fifthMidi ? (chord.fifthMidi % 12) : ((chord.rootNote + 7) % 12)
        ];
        if (chord.seventhMidi) {
            chordPitchClasses.push(chord.seventhMidi % 12);
        }

        // Candidates in melodic register (MIDI 64 to 84)
        let melodyChordTones = scalePitches.filter(p => p >= 64 && p <= 84 && chordPitchClasses.includes(p % 12));
        if (melodyChordTones.length === 0) {
            melodyChordTones = [chord.rootNote + 12];
        }

        // Select starting chord tone
        let startTone;
        if (phraseBar === 0) {
            startTone = melodyChordTones.find(p => p % 12 === chordPitchClasses[0]) || melodyChordTones[0];
            if (isChorus && melodyChordTones.length > 2) startTone = melodyChordTones[melodyChordTones.length - 2];
        } else if (phraseBar === 1) {
            startTone = melodyChordTones[Math.min(melodyChordTones.length - 1, 1)] || melodyChordTones[0];
        } else if (phraseBar === 2) {
            startTone = melodyChordTones[melodyChordTones.length - 1] || melodyChordTones[0];
        } else {
            startTone = melodyChordTones.find(p => p % 12 === (rootMidi % 12)) || melodyChordTones[0];
        }

        let startIdx = scalePitches.indexOf(startTone);
        if (startIdx === -1) {
            startIdx = scalePitches.findIndex(p => p >= startTone);
            if (startIdx === -1) startIdx = Math.floor(scalePitches.length / 2);
        }

        const getPitchAtStep = (delta) => {
            const idx = Math.max(0, Math.min(scalePitches.length - 1, startIdx + delta));
            return scalePitches[idx];
        };

        let motif;
        if (beatsPerBar === 3) {
            // Waltz / 3/4 Time
            if (phraseBar === 0) {
                motif = [
                    { offset: 0, dur: 1.5, pitch: getPitchAtStep(0) },
                    { offset: 1.5, dur: 0.5, pitch: getPitchAtStep(1) },
                    { offset: 2.0, dur: 1.0, pitch: getPitchAtStep(2) }
                ];
            } else if (phraseBar === 1) {
                motif = [
                    { offset: 0, dur: 2.0, pitch: getPitchAtStep(3) },
                    { offset: 2.0, dur: 1.0, pitch: getPitchAtStep(2) }
                ];
            } else if (phraseBar === 2) {
                motif = [
                    { offset: 0, dur: 1.0, pitch: getPitchAtStep(4) },
                    { offset: 1.0, dur: 1.0, pitch: getPitchAtStep(2) },
                    { offset: 2.0, dur: 1.0, pitch: getPitchAtStep(1) }
                ];
            } else {
                motif = [
                    { offset: 0, dur: 2.8, pitch: getPitchAtStep(0) }
                ];
            }
        } else {
            // 4/4 Time Signature
            if (phraseBar === 0) {
                // Statement
                motif = [
                    { offset: 0, dur: 1.25, pitch: getPitchAtStep(0) },
                    { offset: 1.25, dur: 0.75, pitch: getPitchAtStep(1) },
                    { offset: 2.0, dur: 1.0, pitch: getPitchAtStep(2) },
                    { offset: 3.0, dur: 1.0, pitch: getPitchAtStep(3) }
                ];
            } else if (phraseBar === 1) {
                // Ascent to Peak
                motif = [
                    { offset: 0, dur: 1.0, pitch: getPitchAtStep(2) },
                    { offset: 1.0, dur: 1.0, pitch: getPitchAtStep(3) },
                    { offset: 2.0, dur: 1.5, pitch: getPitchAtStep(4) },
                    { offset: 3.5, dur: 0.5, pitch: getPitchAtStep(3) }
                ];
            } else if (phraseBar === 2) {
                // Response / High Turn
                motif = [
                    { offset: 0, dur: 1.0, pitch: getPitchAtStep(4) },
                    { offset: 1.0, dur: 1.0, pitch: getPitchAtStep(2) },
                    { offset: 2.0, dur: 1.0, pitch: getPitchAtStep(1) },
                    { offset: 3.0, dur: 1.0, pitch: getPitchAtStep(2) }
                ];
            } else {
                // Cadence Resolution onto Tonic
                motif = [
                    { offset: 0, dur: 1.0, pitch: getPitchAtStep(1) },
                    { offset: 1.0, dur: 2.8, pitch: getPitchAtStep(0) }
                ];
            }
        }

        motif.forEach(p => {
            if (p.offset < beatsPerBar) {
                let pitch = p.pitch;
                while (pitch < 58) pitch += 12;
                while (pitch > 88) pitch -= 12;

                const durTicks = Math.min(barTicks - (p.offset * ppq), p.dur * ppq);
                if (durTicks > 50) {
                    track.notes.push({
                        pitch: pitch,
                        startTick: Math.round(startTick + p.offset * ppq),
                        durationTicks: Math.round(durTicks * 0.92),
                        velocity: isChorus ? 108 : 94
                    });
                }
            }
        });
    }

    /**
     * Generate Drums with Dynamic Builds and Fills
     */
    generateDrumsForBar(track, startTick, barTicks, beatsPerBar, ppq, style, barIndex, totalBars, isPreChorus, isChorus) {
        const KICK = 36;
        const SNARE = 38;
        const CLOSED_HH = 42;
        const OPEN_HH = 46;
        const CRASH = 49;
        const RIDE = 51;
        const HIGH_TOM = 50;
        const MID_TOM = 47;
        const LOW_TOM = 45;

        // Crash on bar 0 or chorus entry
        if (barIndex === 0 || barIndex === 16 || barIndex % 8 === 0) {
            track.notes.push({ pitch: CRASH, startTick: startTick, durationTicks: ppq * 2, velocity: 110 });
        }

        // Snare Crescendo Build during Pre-Chorus (Bar 14-15)
        if (isPreChorus && (barIndex === 14 || barIndex === 15)) {
            for (let i = 0; i < 8; i++) {
                const tick = startTick + i * (ppq / 2);
                track.notes.push({
                    pitch: SNARE,
                    startTick: tick,
                    durationTicks: Math.round(ppq * 0.4),
                    velocity: 70 + (barIndex - 14) * 20 + i * 4
                });
            }
            return;
        }

        if (style === "jazz_swing") {
            for (let b = 0; b < beatsPerBar; b++) {
                track.notes.push({ pitch: RIDE, startTick: startTick + b * ppq, durationTicks: Math.round(ppq * 0.4), velocity: 85 });
                if (b === 1 || b === 3) {
                    track.notes.push({ pitch: RIDE, startTick: Math.round(startTick + b * ppq + ppq * 0.66), durationTicks: Math.round(ppq * 0.3), velocity: 74 });
                    track.notes.push({ pitch: CLOSED_HH, startTick: startTick + b * ppq, durationTicks: Math.round(ppq * 0.3), velocity: 80 });
                }
            }
            track.notes.push({ pitch: KICK, startTick: startTick, durationTicks: ppq, velocity: 82 });
            track.notes.push({ pitch: KICK, startTick: startTick + ppq * 2, durationTicks: ppq, velocity: 78 });
        } else if (style === "metal" || (isChorus && style === "battle")) {
            // Driving 16ths and double kick
            for (let i = 0; i < 8; i++) {
                track.notes.push({ pitch: KICK, startTick: startTick + i * (ppq / 2), durationTicks: Math.round(ppq * 0.4), velocity: (i % 2 === 0) ? 118 : 98 });
                track.notes.push({ pitch: CLOSED_HH, startTick: startTick + i * (ppq / 2), durationTicks: Math.round(ppq * 0.35), velocity: 95 });
            }
            track.notes.push({ pitch: SNARE, startTick: startTick + ppq, durationTicks: ppq, velocity: 118 });
            track.notes.push({ pitch: SNARE, startTick: startTick + ppq * 3, durationTicks: ppq, velocity: 120 });
        } else {
            // Standard Rock / Pop Groove
            track.notes.push({ pitch: KICK, startTick: startTick, durationTicks: ppq, velocity: 108 });
            track.notes.push({ pitch: KICK, startTick: startTick + ppq * 2, durationTicks: ppq, velocity: 102 });
            track.notes.push({ pitch: SNARE, startTick: startTick + ppq, durationTicks: ppq, velocity: 108 });
            track.notes.push({ pitch: SNARE, startTick: startTick + ppq * 3, durationTicks: ppq, velocity: 110 });
            for (let i = 0; i < 8; i++) {
                track.notes.push({ pitch: CLOSED_HH, startTick: startTick + i * (ppq / 2), durationTicks: Math.round(ppq * 0.35), velocity: 82 });
            }
        }
    }

    /**
     * Generate new song by Cloning Musical DNA from an uploaded MIDI file
     */
    generateFromMidiDNA(dna, userPrompt = "") {
        const bpm = dna.bpm || 120;
        const key = dna.key || "C";
        const scale = dna.scale || "minor";

        // Map detected programs to our synth engines
        let melodySynth = "lead_synth";
        let harmonySynth = "piano";
        let bassSynth = "upright_bass";

        if (dna.detectedInstruments && dna.detectedInstruments.length > 0) {
            const p0 = dna.detectedInstruments[0].program;
            if (p0 >= 56 && p0 <= 63) melodySynth = "brass";
            else if (p0 >= 64 && p0 <= 71) melodySynth = "saxophone";
            else if (p0 >= 72 && p0 <= 79) melodySynth = "flute";
            else if (p0 >= 40 && p0 <= 47) melodySynth = "strings";
            else if (p0 >= 24 && p0 <= 31) melodySynth = "overdrive_guitar";
        }

        return this.generateSong({
            prompt: userPrompt || `Original Composition inspired by imported MIDI in ${key} ${scale}`,
            bpm: bpm,
            key: key,
            scale: scale,
            melodySynthType: melodySynth,
            harmonySynthType: harmonySynth,
            bassSynthType: bassSynth,
            bars: 32,
            loop: true
        });
    }

    generateLyrics(genreName, prompt, key, scale) {
        return [
            `[Style DNA: ${genreName} | Key: ${key} ${scale.toUpperCase()}]`,
            `[Prompt: "${prompt}"]`,
            "",
            "[Intro - Ambient Motif]",
            "A distant echo calls through the silent night,",
            "",
            "[Verse 1 - Building Rhythm]",
            "Step into the legend, where shadows turn to light,",
            "Every chord and cadence carries all our might.",
            "",
            "[Chorus - Suno v4.5 Drop]",
            "Feel the soaring melody, rising to the sky!",
            "Through the storms and fire, our dreams will never die!",
            "",
            "[Loop Marker]",
            "Endless RPG harmony loops forever."
        ].join("\n");
    }
}

if (typeof window !== "undefined") {
    window.MusicEngine = MusicEngine;
}
if (typeof module !== "undefined") {
    module.exports = MusicEngine;
}
