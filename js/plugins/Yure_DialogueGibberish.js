//=============================================================================
// Yure_DialogueGibberish.js (Cute Pixel Voice - Animal Crossing + Undertale)
//=============================================================================
/*:
 * @plugindesc [v1.1] Cute Pixel Dialogue Gibberish Voice System (Animal Crossing Vowel Modulation + Undertale 8-Bit Chiptune Blip).
 * @author Antigravity (for Yure Party)
 *
 * @param Default Voice
 * @desc Profil suara default ('cute', 'mid', 'deep', 'ghost', 'typewriter', 'none').
 * @default cute
 *
 * @param Default Interval
 * @desc Putar suara setiap berapa karakter (2 = sangat nyaman & dinamis).
 * @default 2
 *
 * @param Enable Vowel Modulation
 * @desc Modulasi nada vokal (A, I, U, E, O) ala Animal Crossing / Animalese.
 * @type boolean
 * @default true
 *
 * @param Enable Punctuation Pause
 * @desc Jeda nafas alami saat tanda baca (. , ! ? …).
 * @type boolean
 * @default true
 *
 * @param Punctuation Pause Frames
 * @desc Durasi frame jeda untuk tanda baca titik, seru, tanya (. ! ? …).
 * @default 8
 *
 * @param Comma Pause Frames
 * @desc Durasi frame jeda untuk tanda baca koma (, ; : -).
 * @default 4
 *
 * @param Master Volume Multiplier
 * @desc Pengali volume suara gibberish (0.0 s/d 2.0).
 * @default 1.0
 *
 * @help
 * ============================================================================
 * YURE PARTY - CUTE PIXEL DIALOGUE GIBBERISH VOICE SYSTEM
 * (Animal Crossing Vowel Morphing + Undertale 8-Bit Chiptune Blip)
 * ============================================================================
 * Fitur Utama:
 * 1. PURE PIXEL CUTE AUDIO SYNTH (Web Audio API Real-time Synthesis):
 *    - 100% OTOMATIS: Berjalan langsung pada perintah pesan standar (Show Text).
 *      Tidak perlu pasang kode atau script tambahan di event!
 *    - Suara disintesis langsung tanpa jeda loading file dan tanpa glitch.
 *    - Tekstur chiptune retro hangat (triangle/square) khas Undertale.
 *    - Modulasi vokal hidup (A, I, U, E, O) & bouncy micro-sweeps ala Animal Crossing.
 *
 * 2. DETEKSI OTOMATIS NAMA PEMBICARA (SPEAKER AUTO-DETECT):
 *    - "Saki", "Nia", "Modeus", cewek -> Profil 'cute' (High chirpy squeak ~780 Hz).
 *    - "Mbah Karso", monster, kakek   -> Profil 'deep' (8-bit grumble ~110 Hz).
 *    - "Pethogs", "Hero", MC          -> Profil 'mid' (Neutral blip ~320 Hz).
 *    - "Hantu", "Arwah", "Ghost"      -> Profil 'ghost' (Spectral sine ~440 Hz).
 *    - "Narator", "Sistem"            -> Profil 'typewriter' (Crisp tick).
 *
 * 3. TAG KONTROL DALAM TEKS PESAN (OPSIONAL):
 *    - \voice[cute] / \vce[cute]       : Ganti suara ke cute.
 *    - \voice[deep] / \vce[deep]       : Ganti suara ke berat (Mbah Karso).
 *    - \voice[mid]  / \vce[mid]        : Ganti suara ke netral.
 *    - \voice[ghost]/ \vce[ghost]      : Ganti suara ke mistis.
 *    - \voice[none] / \vce[none]       : Heningkan suara (bisikan).
 *    - \pitch[130]  / \vpitch[130]     : Ubah tinggi nada (130%).
 *    - \vspeed[1]   / \vint[1]         : Ubah interval bunyi (tiap 1 huruf).
 *
 * 4. PENGATURAN MENU OPTIONS:
 *    - Tersedia toggle "Suara Dialog" (ON / OFF) di menu Options.
 * ============================================================================
 */

(function() {
    'use strict';

    var params = (typeof PluginManager !== 'undefined') ? PluginManager.parameters('Yure_DialogueGibberish') : {};
    var DEFAULT_VOICE = String(params['Default Voice'] || 'cute').toLowerCase().trim();
    var DEFAULT_INTERVAL = Math.max(1, parseInt(params['Default Interval'] || '2'));
    var ENABLE_VOWELS = String(params['Enable Vowel Modulation'] || 'true') !== 'false';
    var ENABLE_PUNC_PAUSE = String(params['Enable Punctuation Pause'] || 'true') !== 'false';
    var PUNC_PAUSE_FRAMES = parseInt(params['Punctuation Pause Frames'] || '8');
    var COMMA_PAUSE_FRAMES = parseInt(params['Comma Pause Frames'] || '4');
    var MASTER_VOL_MULT = parseFloat(params['Master Volume Multiplier'] || '1.0');

    // ========================================================================
    // 1. DATA VOKAL & SWEEP CURVE (ANIMAL CROSSING ANIMALESE MODULATION)
    // ========================================================================
    var VOWEL_FORMANTS = {
        'a': { shift: 1.10, sweep: -0.05 }, // Bright open vowel
        'i': { shift: 1.35, sweep: 0.14 },  // High cute chirpy squeak (upward sweep)
        'u': { shift: 0.88, sweep: -0.12 }, // Bubbly round pop / droplet drop
        'e': { shift: 1.22, sweep: 0.08 },  // Cheerful upward bounce
        'o': { shift: 0.95, sweep: -0.07 }  // Warm round bubble
    };

    // ========================================================================
    // 2. PROFIL SUARA KARAKTER (VOICE PROFILES)
    // ========================================================================
    var VOICE_PROFILES = {
        // 1. Cute / Saki / Nia / Modeus (Animal Crossing cute animalese chirp)
        cute: {
            name: 'cute',
            basePitch: 780,       // Hz (Sweet high cute pitch - G5)
            waveType: 'triangle', // Warm retro chiptune
            filterFreq: 4800,     // Lowpass cutoff preserving warmth & clarity
            glide: 0.93,          // Intonation glide
            duration: 0.042,      // 42ms snappy cute blip
            volume: 0.38,         // Clear, crisp, audible over BGM
            interval: 2
        },
        // 2. Mid / Protagonist / Hero / Neutral
        mid: {
            name: 'mid',
            basePitch: 320,       // Hz (Neutral adventure blip)
            waveType: 'triangle',
            filterFreq: 3200,
            glide: 0.95,
            duration: 0.045,
            volume: 0.32,
            interval: 2
        },
        // 3. Deep / Mbah Karso / Monster / Sans style
        deep: {
            name: 'deep',
            basePitch: 110,       // Hz (Deep comical grandpa grumble ala Sans/Karso)
            waveType: 'square',   // Chunky 8-bit grumble
            filterFreq: 900,
            glide: 0.98,
            duration: 0.055,
            volume: 0.36,
            interval: 2
        },
        // 4. Ghost / Spirit / Ethereal
        ghost: {
            name: 'ghost',
            basePitch: 440,       // Hz (Mysterious spectral hum)
            waveType: 'sine',
            filterFreq: 2400,
            glide: 1.08,          // Rising eerie inflection
            duration: 0.065,
            volume: 0.28,
            interval: 2
        },
        // 5. Typewriter / Robot / Click
        typewriter: {
            name: 'typewriter',
            basePitch: 620,
            waveType: 'square',
            filterFreq: 3500,
            glide: 0.5,
            duration: 0.022,
            volume: 0.20,
            interval: 2
        },
        // 6. None / Silent
        none: {
            name: 'none',
            silent: true
        },
        off: {
            name: 'off',
            silent: true
        }
    };

    function getProfileForSpeaker(name) {
        if (!name) return DEFAULT_VOICE;
        var n = name.toLowerCase().trim();
        if (n.indexOf('karso') >= 0 || n.indexOf('kakek') >= 0 || n.indexOf('monster') >= 0 || n.indexOf('demon') >= 0 || n.indexOf('buto') >= 0) {
            return 'deep';
        }
        if (n.indexOf('saki') >= 0 || n.indexOf('nia') >= 0 || n.indexOf('modeus') >= 0 || n.indexOf('yure') >= 0 || n.indexOf('girl') >= 0 || n.indexOf('imut') >= 0) {
            return 'cute';
        }
        if (n.indexOf('ghost') >= 0 || n.indexOf('hantu') >= 0 || n.indexOf('arwah') >= 0 || n.indexOf('kuntilanak') >= 0) {
            return 'ghost';
        }
        if (n.indexOf('narator') >= 0 || n.indexOf('sistem') >= 0 || n.indexOf('system') >= 0 || n.indexOf('catatan') >= 0) {
            return 'typewriter';
        }
        if (n.indexOf('pethogs') >= 0 || n.indexOf('mc') >= 0 || n.indexOf('protag') >= 0 || n.indexOf('hero') >= 0) {
            return 'mid';
        }
        return DEFAULT_VOICE;
    }

    // ========================================================================
    // 3. SYNTHESIS ENGINE (WEB AUDIO PROCEDURAL RETRO CHIRP)
    // ========================================================================
    function playGibberishChirp(char, profileKey, pitchMult, isFastForward) {
        if (typeof ConfigManager !== 'undefined' && ConfigManager.gibberishVoice === false) return;
        if (typeof $gameSystem !== 'undefined' && $gameSystem && $gameSystem._gibberishVoiceEnabled === false) return;
        if (typeof AudioManager !== 'undefined' && AudioManager.seVolume <= 0) return;

        var prof = VOICE_PROFILES[profileKey] || VOICE_PROFILES[DEFAULT_VOICE] || VOICE_PROFILES.cute;
        if (prof.silent) return;

        var audioCtx = null;
        if (typeof WebAudio !== 'undefined' && WebAudio._context) {
            audioCtx = WebAudio._context;
        } else if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
            window._yureGibberishCtx = window._yureGibberishCtx || new (window.AudioContext || window.webkitAudioContext)();
            audioCtx = window._yureGibberishCtx;
        }
        if (!audioCtx) return;

        if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
            audioCtx.resume();
        }

        var mult = (pitchMult || 1.0);
        var lowerChar = (char || '').toLowerCase();
        var vowel = ENABLE_VOWELS ? VOWEL_FORMANTS[lowerChar] : null;

        var freq = prof.basePitch * mult;
        var sweepRate = -0.04;

        if (vowel) {
            freq *= vowel.shift;
            sweepRate = vowel.sweep;
        } else {
            // Micro-detune (+-4%) untuk konsonan agar hidup, ceria, & melodic
            freq *= (1.0 + (Math.sin(char.charCodeAt(0) * 17.1) * 0.08 - 0.04));
        }

        if (isNaN(freq) || freq <= 20 || freq > 12000) freq = prof.basePitch;

        var now = audioCtx.currentTime;
        var duration = isFastForward ? (prof.duration * 0.7) : prof.duration;
        var osc = audioCtx.createOscillator();
        var filter = audioCtx.createBiquadFilter();
        var gain = audioCtx.createGain();

        osc.type = prof.waveType || 'triangle';

        // Dynamic pitch sweep (Animal Crossing bubbly intonation)
        var startFreq = freq * (1.0 + sweepRate);
        var endFreq = Math.max(30, freq * (prof.glide || 0.94));

        osc.frequency.setValueAtTime(startFreq, now);
        // Snappy initial micro-sweep in first 10ms, then slide to endFreq
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq), now + 0.010);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

        // Lowpass filter preserves retro warmth while eliminating harsh digital artifacts
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(prof.filterFreq || 4800, now);
        filter.Q.setValueAtTime(1.2, now);

        // Volume envelope
        var seVol = (typeof AudioManager !== 'undefined') ? (AudioManager.seVolume / 100) : 1.0;
        var targetVol = (prof.volume || 0.35) * seVol * MASTER_VOL_MULT;
        if (isFastForward) targetVol *= 0.5; // Redam volume saat fast-forward agar nyaman di telinga

        gain.gain.setValueAtTime(0.0001, now);
        if (typeof gain.gain.linearRampToValueAtTime === 'function') {
            gain.gain.linearRampToValueAtTime(Math.max(0.0001, targetVol), now + 0.003); // 3ms snappy attack
        } else {
            gain.gain.setValueAtTime(Math.max(0.0001, targetVol), now + 0.003);
        }
        if (typeof gain.gain.exponentialRampToValueAtTime === 'function') {
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // quick smooth release
        }

        osc.connect(filter);
        filter.connect(gain);

        if (typeof WebAudio !== 'undefined' && WebAudio._masterGainNode) {
            gain.connect(WebAudio._masterGainNode);
        } else {
            gain.connect(audioCtx.destination);
        }

        osc.start(now);
        osc.stop(now + duration + 0.01);
    }

    // ========================================================================
    // 4. HOOK WINDOW_MESSAGE UNTUK DIALOG & ESCAPE TAGS
    // ========================================================================
    var _Window_Message_initialize = Window_Message.prototype.initialize;
    Window_Message.prototype.initialize = function() {
        _Window_Message_initialize.call(this);
        this._gibberishCharCount = 0;
        this._currentGibberishVoice = null;
        this._currentGibberishPitch = 1.0;
        this._currentGibberishInterval = null;
        this._explicitVoiceTag = false;
    };

    var _Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function() {
        this._gibberishCharCount = 0;
        this._currentGibberishPitch = 1.0;
        this._currentGibberishInterval = null;
        this._explicitVoiceTag = false;

        // Jalankan startMessage asli (sehingga convertEscapeCharacters & floating name box terekstraksi)
        _Window_Message_startMessage.call(this);

        // Tentukan profil suara awal (jika tidak di-override oleh tag \voice[x] dalam teks dialog)
        if (!this._explicitVoiceTag) {
            var speaker = this._speakerName;
            if (!speaker && typeof $gameMessage !== 'undefined' && $gameMessage.faceName) {
                speaker = $gameMessage.faceName();
            }
            this._currentGibberishVoice = getProfileForSpeaker(speaker);
        }
    };

    var _Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function() {
        this._gibberishCharCount = 0;
        this._currentGibberishVoice = null;
        this._currentGibberishPitch = 1.0;
        this._currentGibberishInterval = null;
        this._explicitVoiceTag = false;
        _Window_Message_terminateMessage.call(this);
    };

    var _Window_Message_convertEscapeCharacters = Window_Message.prototype.convertEscapeCharacters;
    Window_Message.prototype.convertEscapeCharacters = function(text) {
        text = text.replace(/\\(?:VOICE|VCE)\[([A-Za-z0-9_]+)\]/gi, function(match, p1) {
            this._currentGibberishVoice = p1.toLowerCase().trim();
            this._explicitVoiceTag = true;
            return '';
        }.bind(this));

        text = text.replace(/\\(?:VPITCH|PITCH)\[(\d+)\]/gi, function(match, p1) {
            this._currentGibberishPitch = parseInt(p1) / 100;
            return '';
        }.bind(this));

        text = text.replace(/\\(?:VSPEED|VINT)\[(\d+)\]/gi, function(match, p1) {
            this._currentGibberishInterval = parseInt(p1);
            return '';
        }.bind(this));

        return _Window_Message_convertEscapeCharacters.call(this, text);
    };

    var _Window_Message_processNormalCharacter = Window_Message.prototype.processNormalCharacter;
    Window_Message.prototype.processNormalCharacter = function(textState) {
        var char = textState.text[textState.index];
        _Window_Message_processNormalCharacter.call(this, textState);
        this.processGibberishVoice(char);
    };

    Window_Message.prototype.processGibberishVoice = function(char) {
        if (!char) return;

        // 1. Spasi diabaikan
        if (/\s/.test(char)) return;

        // 2. Jeda nafas tanda baca (Punctuation pause ala Undertale / Celeste)
        if (/[.,!?:;…\-]/.test(char)) {
            if (ENABLE_PUNC_PAUSE && !this._showFast && !this._lineShowFast) {
                if (/[.!?…]/.test(char)) {
                    this.startWait(PUNC_PAUSE_FRAMES);
                } else if (/[,;:\-]/.test(char)) {
                    this.startWait(COMMA_PAUSE_FRAMES);
                }
            }
            return;
        }

        // 3. Penghitung karakter untuk interval
        this._gibberishCharCount = (this._gibberishCharCount || 0) + 1;

        var isFastForward = (this._showFast || this._lineShowFast);
        var activeVoice = this._currentGibberishVoice || DEFAULT_VOICE;
        var prof = VOICE_PROFILES[activeVoice] || VOICE_PROFILES[DEFAULT_VOICE] || VOICE_PROFILES.cute;
        var interval = this._currentGibberishInterval || prof.interval || DEFAULT_INTERVAL;

        // Saat fast-forward, longgarkan interval menjadi 4 agar tidak bising
        if (isFastForward) {
            interval = Math.max(4, interval * 2);
        }

        if (this._gibberishCharCount % interval === 0) {
            playGibberishChirp(char, activeVoice, this._currentGibberishPitch, isFastForward);
        }
    };

    // ========================================================================
    // 5. INTEGRASI MENU OPTIONS (TOGGLE SUARA GIBBERISH)
    // ========================================================================
    if (typeof ConfigManager !== 'undefined') {
        ConfigManager.gibberishVoice = true;

        var _ConfigManager_makeData = ConfigManager.makeData;
        ConfigManager.makeData = function() {
            var config = _ConfigManager_makeData.call(this);
            config.gibberishVoice = this.gibberishVoice;
            return config;
        };

        var _ConfigManager_applyData = ConfigManager.applyData;
        ConfigManager.applyData = function(config) {
            _ConfigManager_applyData.call(this, config);
            this.gibberishVoice = (config['gibberishVoice'] !== undefined) ? config['gibberishVoice'] : true;
        };
    }

    if (typeof Window_Options !== 'undefined') {
        var _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
        Window_Options.prototype.addGeneralOptions = function() {
            _Window_Options_addGeneralOptions.call(this);
            this.addCommand('Suara Dialog', 'gibberishVoice');
        };
    }

    // ========================================================================
    // 6. PLUGIN COMMAND (GIBBERISHVOICE)
    // ========================================================================
    if (typeof Game_Interpreter !== 'undefined') {
        var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
        Game_Interpreter.prototype.pluginCommand = function(command, args) {
            _Game_Interpreter_pluginCommand.call(this, command, args);
            if (command === 'GibberishVoice') {
                var sub = (args[0] || '').toLowerCase();
                if (sub === 'on') {
                    $gameSystem._gibberishVoiceEnabled = true;
                } else if (sub === 'off') {
                    $gameSystem._gibberishVoiceEnabled = false;
                } else if (sub === 'default' && args[1]) {
                    DEFAULT_VOICE = args[1].toLowerCase().trim();
                }
            }
        };
    }

    console.log('[Yure_DialogueGibberish] Cute Pixel Voice System (Animal Crossing + Undertale) initialized.');

})();
