//=============================================================================
// Yure_LocationDiscovery.js
//=============================================================================
/*:
 * @plugindesc [v2.0] Urban Transit Signboard Flip - Location Discovery HUD (Persona / Anime Station Style + Montserrat Bold + SFX).
 * @author Yure Party Team
 *
 * @param --- Layout & Position ---
 * @default
 *
 * @param Position Y
 * @desc Posisi vertikal HUD di layar (piksel dari atas). Posisi default di tengah agak atas.
 * @default 125
 * @type number
 *
 * @param Font Family
 * @desc Nama font untuk teks nama lokasi. Montserrat otomatis dimuat via Google Fonts.
 * @default Montserrat, "Arial Black", Impact, GameFont, sans-serif
 *
 * @param Font Size
 * @desc Ukuran font nama lokasi (dalam piksel).
 * @default 30
 * @type number
 *
 * @param Subtitle Text
 * @desc Teks lencana di atas nama lokasi.
 * @default ✦ LOCATION DISCOVERED ✦
 *
 * @param Subtitle Font Size
 * @desc Ukuran font teks lencana kecil.
 * @default 12
 * @type number
 *
 * @param Subtitle Color
 * @desc Warna teks lencana kecil.
 * @default #f59e0b
 *
 * @param Text Color
 * @desc Warna teks utama nama lokasi (Off-White / Ivory elegan).
 * @default #f8fafc
 *
 * @param --- Signboard Style (Non-Futuristik) ---
 * @default
 *
 * @param Frame Style
 * @desc Gaya bingkai signboard: bracket (kurung sudut minimalis), capsule (papan stasiun bulat), minimal (garis aksen).
 * @type select
 * @option bracket
 * @value bracket
 * @option capsule
 * @value capsule
 * @option minimal
 * @value minimal
 * @default bracket
 *
 * @param Accent Color
 * @desc Warna aksen garis bingkai (Emas Hangat / Amber / Silver).
 * @default #e2e8f0
 *
 * @param Board Background Color
 * @desc Warna latar papan (Dark Charcoal Slate / Midnight).
 * @default rgba(15, 20, 30, 0.88)
 *
 * @param Border Color
 * @desc Warna garis tepi luar papan.
 * @default rgba(255, 255, 255, 0.18)
 *
 * @param Indicator Height
 * @desc Tinggi kotak papan nama (piksel).
 * @default 54
 * @type number
 *
 * @param Padding X
 * @desc Ruang renggang horizontal di kiri-kanan teks.
 * @default 38
 * @type number
 *
 * @param --- Transit Flip Mechanics ---
 * @default
 *
 * @param Flip Flap Steps
 * @desc Jumlah flip cepat sebelum mengunci nama map (2 - 4 flip cepat agar tidak alay).
 * @default 3
 * @type number
 *
 * @param Flip Speed
 * @desc Kecepatan setiap langkah flip (dalam frame). Nilai 8 = sangat cepat dan responsif.
 * @default 9
 * @type number
 *
 * @param Hold Duration
 * @desc Durasi nama tempat diam terpajang setelah terkunci (dalam frame, 60 frame = 1 detik).
 * @default 130
 * @type number
 *
 * @param Transit Precursor Words
 * @desc Kata transit pendahulu sebelum flip ke nama asli (pisahkan dengan koma).
 * @default TRANSIT, DESTINATION, ARRIVAL, DISTRICT, SECTOR
 *
 * @param --- Sound Effects (SFX) ---
 * @default
 *
 * @param Flap SE
 * @desc Suara mekanik flip / split-flap saat berganti kata (contoh: click1, cardSelect).
 * @default click1
 *
 * @param Flap Volume
 * @desc Volume suara flip (0 - 100).
 * @default 55
 * @type number
 *
 * @param Flap Pitch
 * @desc Pitch suara flip (50 - 150).
 * @default 125
 * @type number
 *
 * @param Lock Arrival SE
 * @desc Suara saat papan terkunci tepat di nama tempat (contoh: Bell2, Item1, Bell1).
 * @default Bell2
 *
 * @param Lock Arrival Volume
 * @desc Volume suara arrival chime (0 - 100).
 * @default 75
 * @type number
 *
 * @param Lock Arrival Pitch
 * @desc Pitch suara arrival chime.
 * @default 115
 * @type number
 *
 * @param --- Rules & Triggers ---
 * @default
 *
 * @param Discover Only Once
 * @desc Jika true, signboard hanya muncul saat pertama kali pemain mengunjungi map tersebut.
 * @default true
 * @type boolean
 *
 * @param Hide Default Map Name
 * @desc Sembunyikan teks nama map bawaan RPG Maker agar tidak bentrok.
 * @default true
 * @type boolean
 *
 * @help
 * ============================================================================
 * YURE PARTY - URBAN TRANSIT SIGNBOARD FLIP (v2.0)
 * ============================================================================
 * Terinspirasi dari papan split-flap jadwal stasiun kereta di Jepang & gaya
 * tipografi urban Persona:
 *
 * 1. ZERO-CRINGE / NON-ALAY:
 *    - BUKAN mesin judi / kasino yang muter belasan detik.
 *    - Hanya melakukan 2-3 flip mekanis super cepat (~0.5 detik), lalu SNAP!
 *      mengunci tepat pada nama map tujuan.
 *
 * 2. VISUAL SIGNBOARD ELEGAN & TIDAK FUTURISTIK:
 *    - Desain papan dark charcoal slate / matte slate dengan aksen warna
 *      hangat (Off-White, Ivory, Amber Gold).
 *    - Garis sudut rapi (corner brackets) atau pill capsule stasiun kereta.
 *    - Ada garis pisah split-flap mekanis halus di tengah teks.
 *
 * 3. LENCANA SUBTITLE TIDAK TERTUTUP:
 *    - Lencana "✦ LOCATION DISCOVERED ✦" digambar di atas papan dengan posisi
 *      dan layer yang bersih tanpa tertutup backdrop.
 *
 * ============================================================================
 * NOTETAG MAP (Masukkan di Database -> Map Properties -> Note):
 * ============================================================================
 * <NoDiscovery>
 *   Matikan signboard untuk map ini (misal: ruang sempit, cutscene).
 *
 * <DiscoveryName: Nama Tempat Keren>
 *   Mengganti nama lokasi yang tampil di signboard khusus map ini.
 *
 * <ForceDiscovery>
 *   Memaksa signboard selalu muncul setiap masuk map ini.
 *
 * ============================================================================
 * PLUGIN COMMAND:
 * ============================================================================
 * DiscoverLocation [Nama Tempat]
 *   Memicu flip signboard secara manual ke nama tempat tertentu.
 *   Contoh: DiscoverLocation Toko Mbah Karso
 *
 * DiscoverMap
 *   Memicu flip signboard untuk map saat ini.
 *
 * ResetDiscoveredLocations
 *   Mereset memori lokasi yang sudah pernah ditemukan.
 * ============================================================================
 */

(function() {
    'use strict';

    var PLUGIN_NAME = 'Yure_LocationDiscovery';
    var params = PluginManager.parameters(PLUGIN_NAME) || {};

    // Layout
    var CONF_POS_Y             = Number(params['Position Y'] || 125);
    var CONF_FONT_FAMILY       = String(params['Font Family'] || 'Montserrat, "Arial Black", Impact, GameFont, sans-serif');
    var CONF_FONT_SIZE         = Number(params['Font Size'] || 30);
    var CONF_SUBTITLE_TEXT     = String(params['Subtitle Text'] || '✦ LOCATION DISCOVERED ✦');
    var CONF_SUBTITLE_SIZE     = Number(params['Subtitle Font Size'] || 12);
    var CONF_SUBTITLE_COLOR    = String(params['Subtitle Color'] || '#f59e0b');
    var CONF_TEXT_COLOR        = String(params['Text Color'] || '#f8fafc');

    // Style
    var CONF_FRAME_STYLE       = String(params['Frame Style'] || 'bracket').toLowerCase();
    var CONF_ACCENT_COLOR      = String(params['Accent Color'] || '#e2e8f0');
    var CONF_BOARD_BG          = String(params['Board Background Color'] || 'rgba(15, 20, 30, 0.90)');
    var CONF_BORDER_COLOR      = String(params['Border Color'] || 'rgba(255, 255, 255, 0.20)');
    var CONF_IND_HEIGHT        = Number(params['Indicator Height'] || 54);
    var CONF_PAD_X             = Number(params['Padding X'] || 38);

    // Flip Mechanics
    var CONF_FLIP_STEPS        = Math.max(1, Math.min(6, Number(params['Flip Flap Steps'] || 3)));
    var CONF_FLIP_SPEED        = Math.max(4, Number(params['Flip Speed'] || 9));
    var CONF_HOLD_DURATION     = Math.max(40, Number(params['Hold Duration'] || 130));
    var CONF_PRECURSORS_RAW    = String(params['Transit Precursor Words'] || 'TRANSIT, DESTINATION, ARRIVAL, DISTRICT');

    // SFX
    var CONF_FLAP_SE           = String(params['Flap SE'] || 'click1').trim();
    var CONF_FLAP_VOL          = Number(params['Flap Volume'] || 55);
    var CONF_FLAP_PITCH        = Number(params['Flap Pitch'] || 125);
    var CONF_LOCK_SE           = String(params['Lock Arrival SE'] || 'Bell2').trim();
    var CONF_LOCK_VOL          = Number(params['Lock Arrival Volume'] || 75);
    var CONF_LOCK_PITCH        = Number(params['Lock Arrival Pitch'] || 115);

    // Rules
    var CONF_DISCOVER_ONCE     = String(params['Discover Only Once'] || 'true') === 'true';
    var CONF_HIDE_DEFAULT_MAP  = String(params['Hide Default Map Name'] || 'true') === 'true';

    var PRECURSOR_WORDS = CONF_PRECURSORS_RAW.split(',').map(function(s) { return s.trim().toUpperCase(); }).filter(function(s) { return s.length > 0; });
    if (PRECURSOR_WORDS.length === 0) {
        PRECURSOR_WORDS = ['TRANSIT', 'DESTINATION', 'ARRIVAL'];
    }

    // ========================================================================
    // 0. GOOGLE FONT MONTSERRAT INJECTION
    // ========================================================================
    (function injectMontserrat() {
        if (typeof document !== 'undefined' && !document.getElementById('font-montserrat-google')) {
            try {
                var link = document.createElement('link');
                link.id = 'font-montserrat-google';
                link.rel = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap';
                document.head.appendChild(link);
            } catch (e) {}
        }
    })();

    // ========================================================================
    // 1. SPRITE LOCATION DISCOVERY (TRANSIT SIGNBOARD FLIP)
    // ========================================================================
    function Sprite_LocationDiscovery() {
        this.initialize.apply(this, arguments);
    }

    Sprite_LocationDiscovery.prototype = Object.create(Sprite.prototype);
    Sprite_LocationDiscovery.prototype.constructor = Sprite_LocationDiscovery;

    Sprite_LocationDiscovery.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.x = Graphics.boxWidth / 2;
        this.y = CONF_POS_Y;

        var fullW = Math.min(Graphics.boxWidth, 900);
        var fullH = 200;
        this.bitmap = new Bitmap(fullW, fullH);

        this._state = 'idle'; // 'idle', 'flipping', 'holding', 'fading_out'
        this._targetLocation = '';
        this._currentWord = '';
        this._flipIndex = 0;
        this._flipTimer = 0;
        this._flipPhaseRatio = 0.0; // 0.0 s/d 1.0 (rasio animasi 1x flip)
        this._holdTimer = 0;

        this._currentWidth = 240;
        this._targetWidth = 240;
        this._punchScale = 1.0;
        this._lockShineAlpha = 0;

        this.visible = false;
        this.opacity = 0;
    };

    Sprite_LocationDiscovery.prototype.measureWordWidth = function(text) {
        if (!this.bitmap) return 200;
        this.bitmap.fontFace = CONF_FONT_FAMILY;
        this.bitmap.fontSize = CONF_FONT_SIZE;
        this.bitmap.fontBold = true;
        return this.bitmap.measureTextWidth(String(text || '').toUpperCase());
    };

    Sprite_LocationDiscovery.prototype.startDiscovery = function(locationName) {
        if (!locationName) return;

        this._targetLocation = String(locationName).trim().toUpperCase();

        // Buat daftar kata transit singkat (hanya 2-3 kata)
        this._flipQueue = [];
        var shuffled = PRECURSOR_WORDS.slice().sort(function() { return 0.5 - Math.random(); });
        for (var i = 0; i < CONF_FLIP_STEPS - 1; i++) {
            var w = shuffled[i % shuffled.length];
            if (w !== this._targetLocation) {
                this._flipQueue.push(w);
            }
        }
        // Masukkan kata tujuan di akhir
        this._flipQueue.push(this._targetLocation);

        this._flipIndex = 0;
        this._currentWord = this._flipQueue[0];
        this._flipTimer = 0;
        this._flipPhaseRatio = 0.0;
        this._holdTimer = 0;
        this._state = 'flipping';
        this._lockShineAlpha = 0;
        this._punchScale = 1.0;

        var startW = this.measureWordWidth(this._currentWord) + CONF_PAD_X * 2;
        this._currentWidth = startW;
        this._targetWidth = startW;

        this.visible = true;
        this.opacity = 0;
        this.scale.x = 1.0;
        this.scale.y = 1.0;

        this.playFlapSE();
    };

    Sprite_LocationDiscovery.prototype.playFlapSE = function() {
        if (!CONF_FLAP_SE) return;
        var p = CONF_FLAP_PITCH + (this._flipIndex * 5);
        AudioManager.playSe({
            name: CONF_FLAP_SE,
            volume: CONF_FLAP_VOL,
            pitch: p,
            pan: 0
        });
    };

    Sprite_LocationDiscovery.prototype.playLockSE = function() {
        if (!CONF_LOCK_SE) return;
        AudioManager.playSe({
            name: CONF_LOCK_SE,
            volume: CONF_LOCK_VOL,
            pitch: CONF_LOCK_PITCH,
            pan: 0
        });
    };

    Sprite_LocationDiscovery.prototype.update = function() {
        Sprite.prototype.update.call(this);

        if (this._state === 'idle') return;

        if (this._state === 'flipping') {
            this.updateFlipping();
        } else if (this._state === 'holding') {
            this.updateHolding();
        } else if (this._state === 'fading_out') {
            this.updateFadingOut();
        }

        // Smooth Lerp lebar signboard
        this._currentWidth += (this._targetWidth - this._currentWidth) * 0.28;

        // Punch spring recovery
        if (this._punchScale > 1.0) {
            this._punchScale += (1.0 - this._punchScale) * 0.18;
        }
        if (this._lockShineAlpha > 0) {
            this._lockShineAlpha -= 0.035;
            if (this._lockShineAlpha < 0) this._lockShineAlpha = 0;
        }

        this.scale.x = this._punchScale;
        this.scale.y = this._punchScale;

        this.renderSignboard();
    };

    Sprite_LocationDiscovery.prototype.updateFlipping = function() {
        if (this.opacity < 255) {
            this.opacity = Math.min(255, this.opacity + 45);
        }

        this._flipTimer++;
        var stepFrames = CONF_FLIP_SPEED;
        this._flipPhaseRatio = Math.min(1.0, this._flipTimer / stepFrames);

        // Jika 1 langkah flip selesai
        if (this._flipTimer >= stepFrames) {
            this._flipTimer = 0;
            this._flipIndex++;

            if (this._flipIndex < this._flipQueue.length) {
                this._currentWord = this._flipQueue[this._flipIndex];
                this._targetWidth = this.measureWordWidth(this._currentWord) + CONF_PAD_X * 2;
                this.playFlapSE();
            } else {
                // Selesai! Mengunci tepat pada nama lokasi tujuan
                this._state = 'holding';
                this._holdTimer = 0;
                this._currentWord = this._targetLocation;
                this._targetWidth = this.measureWordWidth(this._currentWord) + CONF_PAD_X * 2;
                this._punchScale = 1.08; // Punch subtle & memuaskan
                this._lockShineAlpha = 0.85;
                this.playLockSE();
            }
        }
    };

    Sprite_LocationDiscovery.prototype.updateHolding = function() {
        this._holdTimer++;
        if (this._holdTimer >= CONF_HOLD_DURATION) {
            this._state = 'fading_out';
        }
    };

    Sprite_LocationDiscovery.prototype.updateFadingOut = function() {
        this.opacity = Math.max(0, this.opacity - 14);
        this.y -= 0.7; // Meluncur naik sedikit saat menghilang

        if (this.opacity <= 0) {
            this._state = 'idle';
            this.visible = false;
            this.y = CONF_POS_Y;
        }
    };

    // ========================================================================
    // 2. RENDER SIGNBOARD (SPLIT-FLAP TRANSIT AESTHETIC)
    // ========================================================================
    Sprite_LocationDiscovery.prototype.renderSignboard = function() {
        var bmp = this.bitmap;
        if (!bmp) return;

        bmp.clear();

        var ctx = bmp._context;
        if (!ctx) return;

        var centerX = bmp.width / 2;
        var boardW = Math.max(180, Math.round(this._currentWidth));
        var boardH = CONF_IND_HEIGHT;
        var boardX = Math.round(centerX - boardW / 2);
        var boardY = 60; // Diberi ruang vertikal lega agar lencana TIDAK tertutup!

        // --------------------------------------------------------------------
        // A. LAYER 1: SUBTITLE BADGE (DI ATAS PAPAN, TIDAK TERTUTUP APAPUN)
        // --------------------------------------------------------------------
        if (CONF_SUBTITLE_TEXT) {
            var subH = CONF_SUBTITLE_SIZE + 4;
            var subY = boardY - subH - 6;

            // Pill tag kecil di atas papan
            bmp.fontFace = CONF_FONT_FAMILY;
            bmp.fontSize = CONF_SUBTITLE_SIZE;
            bmp.fontBold = true;
            var subW = bmp.measureTextWidth(CONF_SUBTITLE_TEXT) + 16;
            var subX = Math.round(centerX - subW / 2);

            ctx.save();
            ctx.fillStyle = 'rgba(20, 26, 38, 0.95)';
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 1;

            // Gambar rounded tag kecil
            this.drawRoundedRect(ctx, subX, subY, subW, subH, 4);
            ctx.fill();
            ctx.stroke();

            bmp.textColor = CONF_SUBTITLE_COLOR;
            bmp.drawText(CONF_SUBTITLE_TEXT, 0, subY - 1, bmp.width, subH, 'center');
            ctx.restore();
        }

        // --------------------------------------------------------------------
        // B. LAYER 2: PAPAN SIGNBOARD UTAMA (MATTE CHARCOAL / DARK SLATE)
        // --------------------------------------------------------------------
        ctx.save();
        ctx.fillStyle = CONF_BOARD_BG;
        ctx.strokeStyle = CONF_BORDER_COLOR;
        ctx.lineWidth = 1.5;

        // Shadow lembut elegan di bawah papan
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        if (CONF_FRAME_STYLE === 'capsule') {
            this.drawRoundedRect(ctx, boardX, boardY, boardW, boardH, boardH / 2);
            ctx.fill();
            ctx.stroke();
        } else {
            this.drawRoundedRect(ctx, boardX, boardY, boardW, boardH, 6);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();

        // --------------------------------------------------------------------
        // C. LAYER 3: FRAME CORNER BRACKET (JIKA GAYA BRACKET)
        // --------------------------------------------------------------------
        if (CONF_FRAME_STYLE === 'bracket') {
            ctx.save();
            ctx.strokeStyle = CONF_ACCENT_COLOR;
            ctx.lineWidth = 2.5;
            var c = 12; // Panjang siku

            ctx.beginPath();
            // Top-Left
            ctx.moveTo(boardX, boardY + c);
            ctx.lineTo(boardX, boardY);
            ctx.lineTo(boardX + c, boardY);
            // Top-Right
            ctx.moveTo(boardX + boardW - c, boardY);
            ctx.lineTo(boardX + boardW, boardY);
            ctx.lineTo(boardX + boardW, boardY + c);
            // Bottom-Right
            ctx.moveTo(boardX + boardW, boardY + boardH - c);
            ctx.lineTo(boardX + boardW, boardY + boardH);
            ctx.lineTo(boardX + boardW - c, boardY + boardH);
            // Bottom-Left
            ctx.moveTo(boardX + c, boardY + boardH);
            ctx.lineTo(boardX, boardY + boardH);
            ctx.lineTo(boardX, boardY + boardH - c);
            ctx.stroke();
            ctx.restore();
        }

        // --------------------------------------------------------------------
        // D. LAYER 4: TEKS SIGNBOARD (DENGAN EFEK MECHANICAL FLIP)
        // --------------------------------------------------------------------
        ctx.save();
        // Clip area tepat di dalam kotak papan nama
        ctx.beginPath();
        this.drawRoundedRect(ctx, boardX + 2, boardY + 2, boardW - 4, boardH - 4, 4);
        ctx.clip();

        bmp.fontFace = CONF_FONT_FAMILY;
        bmp.fontSize = CONF_FONT_SIZE;
        bmp.textColor = CONF_TEXT_COLOR;
        bmp.fontBold = true;

        var textY = boardY + Math.round((boardH - CONF_FONT_SIZE) / 2) - 2;

        // Jika sedang fase flipping, ada sedikit getaran vertikal split-flap
        var flipYOffset = 0;
        if (this._state === 'flipping') {
            // Animasi flip mikro (teks bergeser cepat naik seolah terbalik)
            flipYOffset = Math.sin(this._flipPhaseRatio * Math.PI) * -6;
        }

        // Gambar teks utama
        bmp.drawText(this._currentWord, 0, textY + flipYOffset, bmp.width, CONF_FONT_SIZE + 4, 'center');

        // --------------------------------------------------------------------
        // E. LAYER 5: GARIS BELAH MEKANIS SPLIT-FLAP (CIRI KHAS PAPAN STASIUN)
        // --------------------------------------------------------------------
        var midY = boardY + Math.round(boardH / 2);
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boardX + 6, midY);
        ctx.lineTo(boardX + boardW - 6, midY);
        ctx.stroke();

        // Highlight tipis di bawah garis belah
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(boardX + 6, midY + 1);
        ctx.lineTo(boardX + boardW - 6, midY + 1);
        ctx.stroke();
        ctx.restore();

        // --------------------------------------------------------------------
        // F. LAYER 6: LOCK ARRIVAL SHINE (FLASH LEMBUT SAAT TERKUNCI)
        // --------------------------------------------------------------------
        if (this._lockShineAlpha > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (this._lockShineAlpha * 0.28) + ')';
            ctx.fillRect(boardX, boardY, boardW, boardH);
            ctx.restore();
        }

        ctx.restore(); // Tutup clip

        bmp._setDirty();
    };

    Sprite_LocationDiscovery.prototype.drawRoundedRect = function(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    };

    // ========================================================================
    // 3. HOOK SCENE_MAP & AUTOMATIC DISCOVERY
    // ========================================================================
    var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createLocationDiscoverySprite();
    };

    Scene_Map.prototype.createLocationDiscoverySprite = function() {
        this._locationDiscoverySprite = new Sprite_LocationDiscovery();
        this.addChild(this._locationDiscoverySprite);
    };

    var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        this.checkLocationDiscoveryTrigger();
    };

    Scene_Map.prototype.checkLocationDiscoveryTrigger = function() {
        if (!$dataMap || !$gameMap) return;

        var note = String($dataMap.note || '');
        if (note.match(/<NoDiscovery>/i)) return;

        var customMatch = note.match(/<DiscoveryName:\s*([^>]+)>/i);
        var locationName = customMatch ? customMatch[1].trim() : $gameMap.displayName();

        if (!locationName) return;

        var isForced = !!note.match(/<ForceDiscovery>/i);
        var mapId = $gameMap.mapId();

        if (!$gameSystem._discoveredLocations) {
            $gameSystem._discoveredLocations = {};
        }

        if (CONF_DISCOVER_ONCE && !isForced) {
            if ($gameSystem._discoveredLocations[mapId] || $gameSystem._discoveredLocations[locationName.toUpperCase()]) {
                return;
            }
        }

        $gameSystem._discoveredLocations[mapId] = true;
        $gameSystem._discoveredLocations[locationName.toUpperCase()] = true;

        var self = this;
        setTimeout(function() {
            if (self._locationDiscoverySprite && SceneManager._scene === self) {
                self._locationDiscoverySprite.startDiscovery(locationName);
            }
        }, 300);
    };

    // Sembunyikan window map name default
    if (CONF_HIDE_DEFAULT_MAP) {
        var _Window_MapName_open = Window_MapName.prototype.open;
        Window_MapName.prototype.open = function() {
            this._showCount = 0;
            this.contentsOpacity = 0;
        };
    }

    // ========================================================================
    // 4. PLUGIN COMMANDS
    // ========================================================================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'DiscoverLocation') {
            var name = args.join(' ');
            if (name && SceneManager._scene instanceof Scene_Map) {
                var spr = SceneManager._scene._locationDiscoverySprite;
                if (spr) spr.startDiscovery(name);
            }
        } else if (command === 'DiscoverMap') {
            if (SceneManager._scene instanceof Scene_Map) {
                var curName = $gameMap.displayName();
                var spr2 = SceneManager._scene._locationDiscoverySprite;
                if (spr2 && curName) spr2.startDiscovery(curName);
            }
        } else if (command === 'ResetDiscoveredLocations') {
            if ($gameSystem) {
                $gameSystem._discoveredLocations = {};
            }
        }
    };

    console.log('[Yure_LocationDiscovery] Urban Transit Signboard Flip v2.0 aktif.');

})();
