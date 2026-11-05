//=============================================================================
// Yure_TitlePolish.js
//=============================================================================
/*:
 * @plugindesc [v2.0] Redesigned Comic Style Title Menu (Nia Silhouette, Flame Blades, Dynamic Red Splash) + Live Layout Sync.
 * @author Yure Party Team & Antigravity
 *
 * @param --- Cartoon Circle Transition ---
 * @default
 *
 * @param Enable Circle Transition
 * @desc Aktifkan transisi lingkaran kartun (Iris-In) saat masuk ke Title Screen setelah loading.
 * @default true
 * @type boolean
 *
 * @param Circle Duration
 * @desc Durasi animasi lingkaran kartun terbuka (dalam frame, 60 fps).
 * @default 60
 * @type number
 *
 * @param Cartoon Ring Color
 * @desc Warna aksen ring kartun di sekeliling lingkaran (Hex color).
 * @default #ff0066
 *
 * @param Play Whoosh Sound
 * @desc Putar efek suara whoosh saat lingkaran kartun terbuka.
 * @default true
 * @type boolean
 *
 * @param Whoosh SE Name
 * @desc Nama file SE untuk efek whoosh di audio/se.
 * @default Wind4
 *
 * @param Whoosh SE Volume
 * @desc Volume suara whoosh (0 - 100).
 * @default 55
 * @type number
 *
 * @param --- Watermark & Details ---
 * @default
 *
 * @param Version Text
 * @desc Teks versi di pojok kiri bawah layar Title.
 * @default V0.04 - Lead Drain Production
 *
 * @param Shortcut Text
 * @desc Teks petunjuk tombol di pojok kanan bawah layar Title.
 * @default [ESC] Keluar  |  [F4] Layar Penuh  |  [F8] Live Edit
 *
 * @param Watermark Opacity
 * @desc Opasitas teks watermark (0 - 255).
 * @default 190
 * @type number
 *
 * @param --- Juicy UI Feedback ---
 * @default
 *
 * @param Enable Mouse Hover SE
 * @desc Otomatis sorot & mainkan suara saat cursor mouse melayang di atas tombol.
 * @default true
 * @type boolean
 *
 * @param Hover SE Name
 * @desc Nama file SE cursor saat hover/geser menu.
 * @default cardSelect
 *
 * @param Ignition SE Name
 * @desc Nama file SE saat tombol ditekan untuk membuka bilah api (Enter / Any Key).
 * @default Fire1
 *
 * @help
 * ============================================================================
 * YURE PARTY - REDESIGNED COMIC TITLE MENU SYSTEM (v2.0)
 * ============================================================================
 * Fitur & Alur Visual:
 * 1. FASE AWAL (Prompt Phase):
 *    - Kanvas putih bersih (#ffffff) dengan siluet Nia (Nia black.png) & Shadow.
 *    - Logo Yure Party merah (Logo red.png) di pojok kanan atas.
 *    - Watermark studio "ZeroBrain Studio©" di kiri bawah.
 *    - Prompt berdenyut halus: "PRESS ALL TO CONTINUE" (atau tombol apa saja).
 *
 * 2. FASE MASUK (Enter / Ignition):
 *    - Menekan Enter / Spasi / Any Key memicu efek suara api (Fire1).
 *    - Back shadow (Back shadow.png) muncul halus di belakang Nia.
 *    - 4 Bilah Opsi bergaya api komik (Load, Continue, Option, More) meluncur
 *      keluar dari punggung Nia secara elastis berurutan (Staggered Entrance).
 *
 * 3. FASE NAVIGASI & RED SPLASH (Dynamic Flare / Always Red / Blades Only):
 *    - Menggeser panah / mouse hover otomatis menyorot bilah dengan hit-test
 *      pixel-perfect (deteksi ketepatan piksel transparan).
 *    - Bilah aktif bergeser maju (+25px), membal halus (pulse scale), dan
 *      memancarkan aksen api (Red acc.png).
 *    - Red Splash (Red.png) dapat diatur dalam 3 Mode:
 *      * Dynamic Flare: Menyala memerah dramatis saat navigasi/pindah kursor,
 *        dan logo merah bertransisi mulus menjadi putih (Logo white.png).
 *      * Always Red: Tampilan merah penuh seperti di reference_end.jpg.
 *      * Blades Only: Tetap mempertahankan kanvas putih bersih (reference.jpg).
 *
 * 4. LIVE EDIT (F8 Inspector):
 *    - Tekan F8 kapan saja di Title Screen untuk membuka In-Game Live Editor.
 *    - Drag & drop posisi elemen langsung dengan mouse di layar!
 *    - Nudge 1px dengan tombol panah (Shift = 5px).
 *    - Tombol "Simpan Permanen" menulis langsung ke data/Yure_TitleConfig.json.
 * ============================================================================
 */

(function() {
    'use strict';

    var PLUGIN_NAME = 'Yure_TitlePolish';
    var params = PluginManager.parameters(PLUGIN_NAME);

    var CONF_ENABLE_CIRCLE     = String(params['Enable Circle Transition'] || 'true') === 'true';
    var CONF_CIRCLE_DURATION   = Number(params['Circle Duration'] || 60);
    var CONF_RING_COLOR        = String(params['Cartoon Ring Color'] || '#ff0066');
    var CONF_PLAY_WHOOSH       = String(params['Play Whoosh Sound'] || 'true') === 'true';
    var CONF_WHOOSH_SE         = String(params['Whoosh SE Name'] || 'Wind4');
    var CONF_WHOOSH_VOL        = Number(params['Whoosh SE Volume'] || 55);

    var CONF_VERSION_TEXT      = String(params['Version Text'] || 'V0.04 - Lead Drain Production');
    var CONF_SHORTCUT_TEXT     = String(params['Shortcut Text'] || '[ESC] Keluar  |  [F4] Layar Penuh  |  [F8] Live Edit');
    var CONF_WATERMARK_OPACITY = Number(params['Watermark Opacity'] || 190);

    var CONF_ENABLE_HOVER_SE   = String(params['Enable Mouse Hover SE'] || 'true') === 'true';
    var CONF_HOVER_SE          = String(params['Hover SE Name'] || 'cardSelect');
    var CONF_IGNITION_SE       = String(params['Ignition SE Name'] || 'Fire1');

    // =========================================================================
    // 1. DEFAULT CONFIG & DYNAMIC LOADER (data/Yure_TitleConfig.json)
    // =========================================================================
    var DEFAULT_TITLE_CONFIG = {
        canvasColor: '#ffffff',
        nia: { x: 0, y: 0, scale: 1.0, opacity: 255, mode: 'black' },
        shadow: { x: 0, y: 0, scale: 1.0, opacity: 255 },
        logoRed: { x: 0, y: 0, scale: 1.0, opacity: 255 },
        logoWhite: { x: 0, y: 0, scale: 1.0, opacity: 255 },
        backShadow: { x: 0, y: 0, scale: 1.0, opacity: 255 },
        redSplash: { x: 0, y: 0, scale: 1.0, opacity: 255, mode: 'dynamic' }, // 'dynamic' | 'always' | 'none'
        redAcc: { x: 0, y: 0, scale: 1.0, opacity: 255 },
        cursor: { x: 0, y: 0, scale: 1.0, rotation: 0 },
        prompt: {
            text: 'PRESS ALL TO CONTINUE',
            x: 640,
            y: 640,
            fontSize: 24,
            color: '#ff0066',
            fontFace: 'GameFont, Montserrat, Arial, sans-serif'
        },
        copyright: {
            text: 'ZeroBrain Studio©',
            x: 28,
            y: 692,
            fontSize: 15,
            color: '#888888'
        },
        commands: {
            load:     { x: 0, y: 0, scale: 1.0, shiftX: 25, action: 'newGame', label: 'Load / New Game' },
            continue: { x: 0, y: 0, scale: 1.0, shiftX: 25, action: 'continue', label: 'Continue' },
            option:   { x: 0, y: 0, scale: 1.0, shiftX: 25, action: 'options', label: 'Option' },
            more:     { x: 0, y: 0, scale: 1.0, shiftX: 25, action: 'gallery', label: 'More' }
        }
    };

    window.YURE_TITLE_CONFIG = JSON.parse(JSON.stringify(DEFAULT_TITLE_CONFIG));

    function loadSavedTitleConfig() {
        var cfg = null;
        try {
            if (typeof require !== 'undefined') {
                var fs = require('fs');
                var path = require('path');
                var cfgPath = path.join(process.cwd(), 'data', 'Yure_TitleConfig.json');
                if (fs.existsSync(cfgPath)) {
                    cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
                }
            }
            if (!cfg && typeof localStorage !== 'undefined') {
                var stored = localStorage.getItem('Yure_TitleConfig');
                if (stored) cfg = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('[Yure_TitlePolish] Config load error:', e);
        }

        if (cfg) {
            deepMerge(window.YURE_TITLE_CONFIG, cfg);
            console.log('[Yure_TitlePolish] Loaded saved title config.');
        }
    }

    function deepMerge(target, src) {
        for (var k in src) {
            if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) {
                if (!target[k]) target[k] = {};
                deepMerge(target[k], src[k]);
            } else {
                target[k] = src[k];
            }
        }
    }
    loadSavedTitleConfig();

    window.refreshTitleConfig = function() {
        loadSavedTitleConfig();
        if (SceneManager._scene instanceof Scene_Title) {
            SceneManager._scene.applyTitleConfigToSprites();
        }
    };

    // =========================================================================
    // 2. IMAGE LOADER HELPER (img/new_title/main/)
    // =========================================================================
    ImageManager.loadNewTitle = function(filename) {
        return this.loadBitmap('img/new_title/main/', filename, 0, true);
    };

    // Track previous scene to detect coming from loading / logo
    var _lastSceneClass = null;
    var _orig_SceneManager_goto = SceneManager.goto;
    SceneManager.goto = function(sceneClass) {
        if (SceneManager._scene) {
            _lastSceneClass = SceneManager._scene.constructor;
        }
        _orig_SceneManager_goto.call(this, sceneClass);
    };

    // Smooth, continuous cartoon easing function (Cubic Ease-Out)
    function cartoonEaseOut(p) {
        return 1 - Math.pow(1 - p, 3);
    }

    function cartoonElasticOut(t) {
        var p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }

    // =========================================================================
    // 3. SCENE_TITLE EXTENSION - REDESIGNED COMIC TITLE MENU
    // =========================================================================
    var _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        _Scene_Title_create.call(this);

        // Sembunyikan SEMUA elemen MOG & engine lain agar tidak menimpa layer kita
        if (this._hudField) this._hudField.visible = false;
        if (this._com_sprites && Array.isArray(this._com_sprites)) {
            this._com_sprites.forEach(function(spr) { if (spr) spr.visible = false; });
        }
        if (this._cursor) this._cursor.visible = false;
        if (this._subPic) this._subPic.visible = false;
        if (this._titleVideoBg) this._titleVideoBg.visible = false;
        if (this._gameTitleSprite) this._gameTitleSprite.visible = false;

        // Nonaktifkan Window_TitleCommand bawaan agar tidak memproses input / loncat ke Continue
        if (this._commandWindow) {
            this._commandWindow.deactivate();
            this._commandWindow.close();
            this._commandWindow.visible = false;
            this._commandWindow.opacity = 0;
            this._commandWindow.processHandling = function() {};
        }

        // Inisialisasi State Title
        this._titlePhase = 'prompt'; // 'prompt' | 'menu'
        this._promptTimer = 0;
        this._idleTimer = 0;
        this._navTimer = 0;
        this._menuEntranceProgress = 0;
        this._inputCooldown = 0;
        this._activeCommandIndex = 0;
        this._redSplashCurrentOpacity = 0;
        this._confirmPunchTimer = 0;

        this.createComicTitleLayers();
        this.createDevEditBadge();

        // Paksa _comicTitleContainer ke lapisan paling atas dari semua children scene
        if (this._comicTitleContainer && this.children) {
            var cidx = this.children.indexOf(this._comicTitleContainer);
            if (cidx >= 0) this.setChildIndex(this._comicTitleContainer, this.children.length - 1);
        }
        if (this._devEditBadge && this.children) {
            var didx = this.children.indexOf(this._devEditBadge);
            if (didx >= 0) this.setChildIndex(this._devEditBadge, this.children.length - 1);
        }
    };

    var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        if (this._commandWindow) {
            this._commandWindow.deactivate();
            this._commandWindow.close();
            this._commandWindow.visible = false;
            this._commandWindow.opacity = 0;
            this._commandWindow.processHandling = function() {};
        }
    };

    // Nonaktifkan fungsi update bawaan MOG Title Picture Commands agar tidak bentrok
    if (typeof Scene_Title.prototype.updatePictureCommands === 'function') {
        var _orig_MOG_updatePictureCommands = Scene_Title.prototype.updatePictureCommands;
        Scene_Title.prototype.updatePictureCommands = function() {
            // Ditangani secara eksklusif oleh Comic Title Engine
            return;
        };
    }

    Scene_Title.prototype.createComicTitleLayers = function() {
        var cfg = window.YURE_TITLE_CONFIG;
        var w = Graphics.boxWidth || 1280;
        var h = Graphics.boxHeight || 720;

        // Container Layer Utama
        this._comicTitleContainer = new Sprite();
        this.addChild(this._comicTitleContainer);

        // 1. Solid White Canvas Background
        var canvasBmp = new Bitmap(w, h);
        canvasBmp.fillAll(cfg.canvasColor || '#ffffff');
        this._titleWhiteCanvas = new Sprite(canvasBmp);
        this._comicTitleContainer.addChild(this._titleWhiteCanvas);

        // 2. Full Red Splash Background (Red.png)
        this._titleRedSplash = new Sprite(ImageManager.loadNewTitle('Red'));
        this._titleRedSplash.opacity = 0;
        this._comicTitleContainer.addChild(this._titleRedSplash);

        // 3. Nia Shadow di lantai (Shadow.png)
        this._titleShadow = new Sprite(ImageManager.loadNewTitle('Shadow'));
        this._comicTitleContainer.addChild(this._titleShadow);

        // 4. Nia Karakter (Nia black.png / Nia normal_.png)
        var niaFile = (cfg.nia.mode === 'normal') ? 'Nia normal_' : 'Nia black';
        this._titleNia = new Sprite(ImageManager.loadNewTitle(niaFile));
        this._comicTitleContainer.addChild(this._titleNia);

        // 5. Bilah Perintah / Command Flame Blades (Berada di atas Nia Black)
        this._titleCommands = [];
        this._commandDefs = [
            { id: 'load',     file: 'Load',       action: cfg.commands.load.action || 'newGame' },
            { id: 'continue', file: '2.Continue', action: cfg.commands.continue.action || 'continue' },
            { id: 'option',   file: '3. Option_', action: cfg.commands.option.action || 'options' },
            { id: 'more',     file: 'More',       action: cfg.commands.more.action || 'gallery' }
        ];

        for (var i = 0; i < this._commandDefs.length; i++) {
            var cDef = this._commandDefs[i];
            var spr = new Sprite(ImageManager.loadNewTitle(cDef.file));
            spr.opacity = 0;
            spr.visible = false;
            spr._cmdId = cDef.id;
            spr._cmdIndex = i;
            spr._slideOffsetX = -80;
            spr._selectShiftX = 0;
            spr._punchScale = 1.0;
            this._titleCommands.push(spr);
            this._comicTitleContainer.addChild(spr);
        }

        // Cursor tangan dari titles2 sebagai penunjuk opsi aktif.
        this._titleCursor = new Sprite(ImageManager.loadBitmap('img/titles2/', 'Cursor', 0, true));
        this._titleCursor.anchor.x = 0.5;
        this._titleCursor.anchor.y = 0.5;
        this._titleCursor.visible = false;
        this._comicTitleContainer.addChild(this._titleCursor);

        // 6. Back Shadow (Berada di atas tombol & Nia untuk shading pangkal api)
        this._titleBackShadow = new Sprite(ImageManager.loadNewTitle('Back shadow'));
        this._titleBackShadow.opacity = 0;
        this._comicTitleContainer.addChild(this._titleBackShadow);

        // 7. Red Accent Sparks (Red acc.png)
        this._titleRedAcc = new Sprite(ImageManager.loadNewTitle('Red acc'));
        this._titleRedAcc.opacity = 0;
        this._comicTitleContainer.addChild(this._titleRedAcc);

        // 8. Logo Red (untuk kanvas putih) & Logo White (untuk saat Red Splash menyala)
        this._titleLogoRed = new Sprite(ImageManager.loadNewTitle('Logo red'));
        this._comicTitleContainer.addChild(this._titleLogoRed);

        this._titleLogoWhite = new Sprite(ImageManager.loadNewTitle('Logo white'));
        this._titleLogoWhite.opacity = 0;
        this._comicTitleContainer.addChild(this._titleLogoWhite);

        // 9. Watermark Studio (ZeroBrain Studio©)
        this._titleCopyrightSprite = new Sprite(new Bitmap(350, 40));
        this._comicTitleContainer.addChild(this._titleCopyrightSprite);

        // 10. Prompt Text ("PRESS ALL TO CONTINUE")
        this._titlePromptSprite = new Sprite(new Bitmap(600, 60));
        this._comicTitleContainer.addChild(this._titlePromptSprite);

        this.applyTitleConfigToSprites();
        this.refreshPromptBitmap();
        this.refreshCopyrightBitmap();

        // ====== Paksa urutan layer yang benar di dalam container ======
        // Urutan dari bawah ke atas mengikuti reference.jpg:
        // canvas → redSplash → shadow → backShadow → redAcc → commands → nia → logo → teks
        var c = this._comicTitleContainer;
        var ordered = [
            this._titleWhiteCanvas,
            this._titleRedSplash,
            this._titleShadow,
            this._titleBackShadow,
            this._titleRedAcc
        ];
        // Command buttons berada di bawah Nia agar siluet menutupi pangkal opsi.
        for (var ci = 0; ci < this._titleCommands.length; ci++) {
            ordered.push(this._titleCommands[ci]);
        }
        ordered.push(this._titleNia);
            ordered.push(this._titleCursor);
        ordered.push(this._titleLogoRed);
        ordered.push(this._titleLogoWhite);
        ordered.push(this._titleCopyrightSprite);
        ordered.push(this._titlePromptSprite);

        for (var oi = 0; oi < ordered.length; oi++) {
            if (ordered[oi] && c.children.indexOf(ordered[oi]) >= 0) {
                c.setChildIndex(ordered[oi], oi);
            }
        }
    };

    Scene_Title.prototype.createDevEditBadge = function() {
        var badge = new Sprite(new Bitmap(160, 32));
        var bmp = badge.bitmap;
        bmp.fontSize = 12;
        bmp.fontFace = 'sans-serif';
        bmp.fillAll('rgba(0, 0, 0, 0.55)');
        bmp.textColor = '#fef08a';
        bmp.drawText('⚙ Edit Layout (F8)', 0, 0, 160, 32, 'center');
        badge.x = (Graphics.boxWidth || 1280) - 170;
        badge.y = 12;
        badge.opacity = 180;
        this._devEditBadge = badge;
        this.addChild(this._devEditBadge);
    };

    Scene_Title.prototype.applyTitleConfigToSprites = function() {
        var cfg = window.YURE_TITLE_CONFIG;
        if (!cfg) return;

        // Nia
        if (this._titleNia) {
            var niaFile = (cfg.nia.mode === 'normal') ? 'Nia normal_' : 'Nia black';
            this._titleNia.bitmap = ImageManager.loadNewTitle(niaFile);
            this._titleNia.x = cfg.nia.x || 0;
            this._titleNia.y = cfg.nia.y || 0;
            this._titleNia.scale.x = cfg.nia.scale || 1.0;
            this._titleNia.scale.y = cfg.nia.scale || 1.0;
        }

        // Shadow
        if (this._titleShadow) {
            this._titleShadow.x = cfg.shadow.x || 0;
            this._titleShadow.y = cfg.shadow.y || 0;
            this._titleShadow.scale.x = cfg.shadow.scale || 1.0;
            this._titleShadow.scale.y = cfg.shadow.scale || 1.0;
        }

        // Logo
        if (this._titleLogoRed) {
            this._titleLogoRed.x = cfg.logoRed.x || 0;
            this._titleLogoRed.y = cfg.logoRed.y || 0;
            this._titleLogoRed.scale.x = cfg.logoRed.scale || 1.0;
            this._titleLogoRed.scale.y = cfg.logoRed.scale || 1.0;
        }
        if (this._titleLogoWhite) {
            this._titleLogoWhite.x = cfg.logoWhite.x || 0;
            this._titleLogoWhite.y = cfg.logoWhite.y || 0;
            this._titleLogoWhite.scale.x = cfg.logoWhite.scale || 1.0;
            this._titleLogoWhite.scale.y = cfg.logoWhite.scale || 1.0;
        }

        // Back Shadow & Red Splash
        if (this._titleBackShadow) {
            this._titleBackShadow.x = cfg.backShadow.x || 0;
            this._titleBackShadow.y = cfg.backShadow.y || 0;
        }
        if (this._titleRedSplash) {
            this._titleRedSplash.x = cfg.redSplash.x || 0;
            this._titleRedSplash.y = cfg.redSplash.y || 0;
        }
        if (this._titleRedAcc) {
            this._titleRedAcc.x = cfg.redAcc.x || 0;
            this._titleRedAcc.y = cfg.redAcc.y || 0;
        }
        if (this._titleCursor) {
            var cursorCfg = cfg.cursor || { x: 0, y: 0, scale: 1.0, rotation: 0 };
            this._titleCursor.scale.x = cursorCfg.scale || 1.0;
            this._titleCursor.scale.y = cursorCfg.scale || 1.0;
            this._titleCursor.rotation = Number(cursorCfg.rotation !== undefined ? cursorCfg.rotation : 0) * Math.PI / 180;
        }

        // Bilah Perintah (Individual offsets)
        if (this._titleCommands) {
            for (var i = 0; i < this._titleCommands.length; i++) {
                var spr = this._titleCommands[i];
                var cCfg = cfg.commands[spr._cmdId] || { x: 0, y: 0, scale: 1.0 };
                spr._baseX = cCfg.x || 0;
                spr._baseY = cCfg.y || 0;
                spr._baseScale = cCfg.scale || 1.0;
                spr.scale.x = spr._baseScale;
                spr.scale.y = spr._baseScale;
            }
        }

        // Prompt & Copyright
        if (this._titlePromptSprite) {
            this._titlePromptSprite.x = (cfg.prompt.x !== undefined ? cfg.prompt.x : 640) - 300;
            this._titlePromptSprite.y = (cfg.prompt.y !== undefined ? cfg.prompt.y : 640) - 30;
        }
        if (this._titleCopyrightSprite) {
            this._titleCopyrightSprite.x = cfg.copyright.x !== undefined ? cfg.copyright.x : 28;
            this._titleCopyrightSprite.y = cfg.copyright.y !== undefined ? cfg.copyright.y : 692;
        }

        this.refreshPromptBitmap();
        this.refreshCopyrightBitmap();
    };

    Scene_Title.prototype.prepareTitleCommandBitmaps = function() {
        if (!this._titleCommands) return;

        for (var i = 0; i < this._titleCommands.length; i++) {
            var spr = this._titleCommands[i];
            if (spr._titleCropped || !spr.bitmap || !spr.bitmap.isReady()) continue;

            var source = spr.bitmap;
            var minX = source.width;
            var minY = source.height;
            var maxX = -1;
            var maxY = -1;
            for (var y = 0; y < source.height; y += 4) {
                for (var x = 0; x < source.width; x += 4) {
                    if (source.getAlphaPixel(x, y) > 30) {
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }
            if (maxX < 0) continue;

            minX = Math.max(0, minX - 4);
            minY = Math.max(0, minY - 4);
            maxX = Math.min(source.width - 1, maxX + 4);
            maxY = Math.min(source.height - 1, maxY + 4);

            var cropped = new Bitmap(maxX - minX + 1, maxY - minY + 1);
            cropped.blt(source, minX, minY, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
            cropped._setDirty();
            spr.bitmap = cropped;
            spr._cropOffsetX = minX;
            spr._cropOffsetY = minY;
            spr._titleCropped = true;
            spr._titleContentBounds = {
                minX: 0,
                minY: 0,
                maxX: cropped.width - 1,
                maxY: cropped.height - 1
            };
            spr._titleCursorAnchorY = cropped.height * 0.5;
            break;
        }
    };

    Scene_Title.prototype.refreshPromptBitmap = function() {
        if (!this._titlePromptSprite) return;
        var cfg = window.YURE_TITLE_CONFIG;
        var bmp = this._titlePromptSprite.bitmap;
        bmp.clear();
        bmp.fontSize = (cfg.prompt && cfg.prompt.fontSize) || 24;
        bmp.fontFace = (cfg.prompt && cfg.prompt.fontFace) || 'GameFont, Montserrat, Arial, sans-serif';
        bmp.textColor = (cfg.prompt && cfg.prompt.color) || '#ff0066';
        bmp.outlineColor = 'rgba(255, 255, 255, 0.9)';
        bmp.outlineWidth = 3;

        var txt = (cfg.prompt && cfg.prompt.text) || 'PRESS ALL TO CONTINUE';
        bmp.drawText(txt, 0, 0, bmp.width, bmp.height, 'center');
    };

    Scene_Title.prototype.refreshCopyrightBitmap = function() {
        if (!this._titleCopyrightSprite) return;
        var cfg = window.YURE_TITLE_CONFIG;
        var bmp = this._titleCopyrightSprite.bitmap;
        bmp.clear();
        bmp.fontSize = (cfg.copyright && cfg.copyright.fontSize) || 15;
        bmp.fontFace = 'sans-serif';
        bmp.textColor = (cfg.copyright && cfg.copyright.color) || '#888888';
        bmp.outlineColor = 'rgba(255, 255, 255, 0.8)';
        bmp.outlineWidth = 2;

        var txt = (cfg.copyright && cfg.copyright.text) || 'ZeroBrain Studio©';
        bmp.drawText(txt, 0, 0, bmp.width, bmp.height, 'left');
    };

    // =========================================================================
    // 4. TRANSISI & SIKLUS UPDATE
    // =========================================================================
    Scene_Title._hasPlayedCircleIntro = false;
    Scene_Title._hasEverBooted = false;

    function isSubmenuScene(sceneClass) {
        if (!sceneClass) return false;
        if (sceneClass === Scene_Options) return true;
        if (typeof Scene_Load !== 'undefined' && sceneClass === Scene_Load) return true;
        if (typeof Scene_File !== 'undefined' && (sceneClass === Scene_File || sceneClass.prototype instanceof Scene_File)) return true;
        if (typeof Scene_MyGallery !== 'undefined' && sceneClass === Scene_MyGallery) return true;
        if (typeof Scene_Gallery !== 'undefined' && sceneClass === Scene_Gallery) return true;
        return false;
    }

    function checkReturnToMenu() {
        if (SceneManager._yureReturnPhase === 'menu') return true;
        var prev = SceneManager._previousClass;
        if (isSubmenuScene(prev)) return true;
        if (Scene_Title._hasEverBooted && prev && prev !== Scene_Boot && prev !== Scene_Map && prev !== Scene_Gameover) {
            return true;
        }
        return false;
    }

    var _Scene_Title_start = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        var returningToMenu = checkReturnToMenu();
        SceneManager._yureReturnPhase = null;

        _Scene_Title_start.call(this); // clearStack, playTitleMusic, startFadeIn

        if (returningToMenu) {
            // Kembali dari Submenu (Setting / Options, Gallery / More, Load):
            // Bersihkan efek transisi wipe jika ada
            if (typeof window.anime !== 'undefined' && this._paintWipeProxy) {
                window.anime.remove(this._paintWipeProxy);
            }
            this._destroyRedWipeMask();
            if (this._titleRedSplash) this._titleRedSplash.mask = null;

            if (this._commandWindow) {
                this._commandWindow.deactivate();
                this._commandWindow.close();
                this._commandWindow.visible = false;
                this._commandWindow.opacity = 0;
            }

            // Langsung tampilkan menu title (opsi-opsi) tanpa intro/animasi berulang
            this._returnToMenuPhase();
        } else {
            // Fresh start / boot pertama kali: putar transisi lingkaran Looney Tunes HANYA SEKALI
            if (CONF_ENABLE_CIRCLE && !Scene_Title._hasPlayedCircleIntro) {
                Scene_Title._hasPlayedCircleIntro = true;
                this.startCartoonCircleTransition();
            }
        }

        Scene_Title._hasEverBooted = true;
    };

    // REVERSE RED WIPE: saat keluar dari Submenu (Setting, Gallery, Load),
    // cat merah menyusut kembali dari kanan ke kiri menyingkap menu title secara halus
    Scene_Title.prototype.startReverseRedWipe = function() {
        var red = this._titleRedSplash;
        if (!red) return;

        red.opacity = 255;
        red.scale.x = 1.0;
        red.scale.y = 1.0;
        var cfg = window.YURE_TITLE_CONFIG;
        red.x = (cfg.redSplash && cfg.redSplash.x != null) ? cfg.redSplash.x : 0;
        red.y = (cfg.redSplash && cfg.redSplash.y != null) ? cfg.redSplash.y : 0;

        if (this._titleLogoWhite) this._titleLogoWhite.opacity = 255;
        if (this._titleLogoRed)   this._titleLogoRed.opacity   = 0;

        this._destroyRedWipeMask();
        this._redWipeMask = new PIXI.Graphics();
        this._updateRedWipeMask(1.0); // mulai dari posisi penuh menutupi layar
        red.mask = this._redWipeMask;

        var self = this;
        this._reverseWipeProxy = { p: 1.0 };

        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this._reverseWipeProxy);
            window.anime({
                targets : self._reverseWipeProxy,
                p       : 0.0, // menyusut mundur dari 1.0 ke 0.0
                duration: 650,
                easing  : 'easeOutCubic',
                update  : function() {
                    var prog = self._reverseWipeProxy.p;
                    self._updateRedWipeMask(prog);
                    // Cross-fade logo kembali dari putih ke merah
                    if (self._titleLogoWhite) self._titleLogoWhite.opacity = Math.floor(prog * 255);
                    if (self._titleLogoRed)   self._titleLogoRed.opacity   = Math.floor((1 - prog) * 255);
                },
                complete: function() {
                    if (self._titleRedSplash) {
                        self._titleRedSplash.mask = null;
                        self._titleRedSplash.opacity = 0;
                    }
                    self._destroyRedWipeMask();
                }
            });
        } else {
            if (this._titleRedSplash) this._titleRedSplash.opacity = 0;
            if (this._titleLogoWhite) this._titleLogoWhite.opacity = 0;
            if (this._titleLogoRed)   this._titleLogoRed.opacity   = 255;
        }
    };

    // Kembalikan tampilan menu saat keluar dari Submenu (Setting, Gallery, Load)
    Scene_Title.prototype._returnToMenuPhase = function() {
        this._titlePhase            = 'menu';
        this._menuEntranceProgress  = 1.0;
        this._inputCooldown         = 20;
        this._confirmTransitionTimer = 0;
        this._navTimer              = 0;
        Input.clear();
        TouchInput.clear();

        // Pulihkan cursor index ke opsi yang dipilih sebelumnya (misal Setting, Gallery, Load)
        if (SceneManager._yureLastCommandIndex != null && 
            SceneManager._yureLastCommandIndex >= 0 && 
            this._titleCommands && 
            SceneManager._yureLastCommandIndex < this._titleCommands.length) {
            this._activeCommandIndex = SceneManager._yureLastCommandIndex;
        }
        if (this._commandWindow) {
            this._commandWindow._index = this._activeCommandIndex;
        }

        // Layer-layer menu tampil di belakang layer merah
        if (this._titleBackShadow) this._titleBackShadow.opacity = 255;
        if (this._titlePromptSprite) this._titlePromptSprite.visible = false;

        // Tampilkan semua command buttons di posisi aktifnya (solid & rapi)
        this.applyTitleConfigToSprites();
        var cfg = window.YURE_TITLE_CONFIG;
        if (this._titleCommands) {
            for (var i = 0; i < this._titleCommands.length; i++) {
                var spr = this._titleCommands[i];
                spr.visible = true;
                var isSel = (i === this._activeCommandIndex);
                var sX = isSel ? ((cfg.commands && cfg.commands[spr._cmdId] && cfg.commands[spr._cmdId].shiftX) || 25) : 0;
                spr._slideOffsetX = 0;
                spr._selectShiftX = sX;
                spr.x = spr._baseX + sX;
                spr.y = spr._baseY;
                spr.opacity = isSel ? 255 : 185;
                spr.scale.x = spr._baseScale;
                spr.scale.y = spr._baseScale;
            }

            // Posisikan Red Acc tepat di belakang tombol yang aktif
            if (this._titleRedAcc && this._titleCommands[this._activeCommandIndex]) {
                this._titleRedAcc.y = this._titleCommands[this._activeCommandIndex].y;
                this._titleRedAcc.opacity = 240;
                this._titleRedAcc.scale.x = 1.0;
                this._titleRedAcc.scale.y = 1.0;
            }
            this.positionTitleCursor(false);
        }

        // Putar animasi reverse red wipe menyingkap menu title
        this.startReverseRedWipe();
    };

    // Reset penuh ke tampilan awal (PRESS ALL TO CONTINUE)
    Scene_Title.prototype._fullResetToPrompt = function() {
        this._titlePhase            = 'prompt';
        this._promptTimer           = 0;
        this._inputCooldown         = 20;
        this._navTimer              = 0;
        this._menuEntranceProgress  = 0;
        this._redSplashCurrentOpacity = 0;
        this._pendingCommandIndex   = -1;
        this._confirmTransitionTimer = 0;

        if (this._titleRedSplash) {
            this._titleRedSplash.opacity = 0;
            this._titleRedSplash.scale.x = 1.0;
            this._titleRedSplash.scale.y = 1.0;
        }
        if (this._titleRedAcc)    this._titleRedAcc.opacity     = 0;
        if (this._titleLogoWhite) this._titleLogoWhite.opacity  = 0;
        if (this._titleLogoRed)   this._titleLogoRed.opacity    = 255;
        if (this._titlePromptSprite) this._titlePromptSprite.visible = true;
        if (this._titleCursor) this._titleCursor.visible = false;

        if (this._titleCommands) {
            for (var i = 0; i < this._titleCommands.length; i++) {
                var spr = this._titleCommands[i];
                spr.visible = false;
                spr.opacity = 0;
                spr._selectShiftX = 0;
                spr._slideOffsetX = -80;
            }
        }
    };

    var _Scene_Title_update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        // RPG Maker base update() memanggil this._commandWindow.open() setiap frame saat !isBusy()
        // Ini akan membuka window bawaan yang kita sembunyikan — kita blokir dengan override sementara
        // Hanya izinkan jika phase 'done' (scene sedang transisi keluar)
        if (this._titlePhase && this._titlePhase !== 'done') {
            // Patch sementara: jadikan isBusy = true agar update() tidak memanggil commandWindow.open()
            var origIsBusy = this.isBusy;
            this.isBusy = function() { return true; };
            _Scene_Title_update.call(this);
            this.isBusy = origIsBusy;
        } else {
            _Scene_Title_update.call(this);
        }

        this.updateCartoonCircleTransition();
        this.updateComicTitleEngine();
    };

    // Override isBusy agar commandWindow yang kita nonaktifkan tidak memblokir transisi scene
    var _Scene_Title_isBusy = Scene_Title.prototype.isBusy;
    Scene_Title.prototype.isBusy = function() {
        // Jika phase 'done', biarkan Scene_Base yang mengontrol (berdasarkan fade)
        if (this._titlePhase === 'done') {
            return Scene_Base.prototype.isBusy.call(this);
        }
        return _Scene_Title_isBusy.call(this);
    };

    Scene_Title.prototype.updateComicTitleEngine = function() {
        // Saat 'done', engine tidak melakukan apa-apa — scene sedang fade out menuju scene berikutnya
        if (this._titlePhase === 'done') return;

        var cfg = window.YURE_TITLE_CONFIG;

        // Penjaga ganda: pastikan MOG _hudField tidak terlihat dan updatePictureCommands tidak berjalan
        if (this._hudField && this._hudField.visible) this._hudField.visible = false;
        if (typeof this.updatePictureCommands === 'function' &&
            this.updatePictureCommands !== Scene_Title._yureNoop) {
            Scene_Title._yureNoop = function() { return; };
            this.updatePictureCommands = Scene_Title._yureNoop;
        }

        // 1. Nia tetap diam/statis sempurna (tanpa gerakan/napas)
        this._promptTimer++;

        // 2. State Logic
        if (this._titlePhase === 'prompt') {
            this.updatePromptPhase();
        } else if (this._titlePhase === 'menu') {
            this.updateMenuPhase();
        } else if (this._titlePhase === 'confirm_transition') {
            this.updateConfirmTransition();
        }
    };

    Scene_Title.prototype.updatePromptPhase = function() {
        if (this._titleCursor) this._titleCursor.visible = false;

        if (this._inputCooldown > 0) {
            this._inputCooldown--;
            return;
        }

        // Efek denyut teks prompt
        if (this._titlePromptSprite) {
            var pulseAlpha = 0.5 + 0.5 * Math.sin(this._promptTimer * 0.08);
            this._titlePromptSprite.opacity = Math.floor(100 + pulseAlpha * 155);
            this._titlePromptSprite.visible = true;
        }

        // Jika tekan Cancel (ESC) di fase Prompt -> Keluar dari Game!
        if (Input.isTriggered('cancel')) {
            SoundManager.playCancel();
            if (typeof nw !== 'undefined' && nw.App && nw.App.quit) {
                nw.App.quit();
            } else if (typeof window !== 'undefined' && window.close) {
                window.close();
            }
            SceneManager.exit();
            return;
        }

        // Deteksi Trigger untuk masuk ke Fase Menu (Hanya Enter, Spasi, Tombol Arah, atau Klik)
        var enterTriggered = Input.isTriggered('ok') || 
                             Input.isTriggered('space') ||
                             Input.isTriggered('up') ||
                             Input.isTriggered('down') ||
                             Input.isTriggered('left') ||
                             Input.isTriggered('right');

        var touchTriggered = TouchInput.isTriggered();

        // Jangan picu jika klik di tombol F8 Dev Edit
        if (touchTriggered && this._devEditBadge) {
            var tx = TouchInput.x;
            var ty = TouchInput.y;
            var bx = this._devEditBadge.x;
            var by = this._devEditBadge.y;
            if (tx >= bx && tx <= bx + 160 && ty >= by && ty <= by + 32) {
                return;
            }
        }

        if (enterTriggered || touchTriggered) {
            this.triggerEnterIgnition();
        }
    };

    Scene_Title.prototype.triggerEnterIgnition = function() {
        if (CONF_IGNITION_SE) {
            AudioManager.playSe({
                name: CONF_IGNITION_SE,
                volume: 85,
                pitch: 105,
                pan: 0
            });
        }

        this._titlePhase = 'menu';
        this._menuEntranceProgress = 1.0; // ditangani sepenuhnya oleh anime.js
        this._navTimer = 75;
        this._inputCooldown = 22;

        Input.clear();
        TouchInput.clear();

        this._activeCommandIndex = 0;
        this._menuEntranceFrame = 0;
        this._menuEntranceActive = true;
        if (this._commandWindow) {
            this._commandWindow._index = 0;
            this._commandWindow.deactivate();
        }

        // Sembunyikan prompt dengan fade out mulus
        if (this._titlePromptSprite) {
            if (typeof window.anime !== 'undefined') {
                window.anime({
                    targets: this._titlePromptSprite,
                    opacity: 0,
                    duration: 180,
                    easing: 'easeOutQuad',
                    complete: () => { if (this._titlePromptSprite) this._titlePromptSprite.visible = false; }
                });
            } else {
                this._titlePromptSprite.visible = false;
            }
        }

        // Back Shadow tetap menyala; jangan reset ke 0 agar spam ESC/Enter tidak berkedip.
        if (this._titleBackShadow) {
            if (typeof window.anime !== 'undefined') window.anime.remove(this._titleBackShadow);
            this._titleBackShadow.opacity = 255;
        }

        // Munculkan bilah perintah dengan Anime.js Stagger Elastic (fluid & dynamic)
        this.applyTitleConfigToSprites();
        var cfg = window.YURE_TITLE_CONFIG;

        if (this._titleCommands) {
            for (var i = 0; i < this._titleCommands.length; i++) {
                var spr = this._titleCommands[i];
                spr.visible = true;
                spr.x = spr._baseX - 35;
                spr.opacity = 255;
                spr.scale.x = spr._baseScale;
                spr.scale.y = spr._baseScale;
                spr._slideOffsetX = 0;
                spr._selectShiftX = 0;
            }

            this.positionTitleCursor(false);

            // Red Acc langsung tampil tanpa tween Anime.js di menu title.
            if (this._titleRedAcc && this._titleCommands[this._activeCommandIndex]) {
                this._titleRedAcc.y = this._titleCommands[this._activeCommandIndex].y;
                this._titleRedAcc.opacity = 240;
            }
        }
    };

    Scene_Title.prototype.updateTitleEntrance = function() {
        if (!this._menuEntranceActive || !this._titleCommands) return;

        this._menuEntranceFrame++;
        var finished = true;
        for (var i = 0; i < this._titleCommands.length; i++) {
            var spr = this._titleCommands[i];
            var progress = Math.max(0, Math.min(1, (this._menuEntranceFrame - i * 3) / 18));
            var eased = cartoonEaseOut(progress);
            spr.x = spr._baseX - 35 + 35 * eased;
            if (progress < 1) finished = false;
        }

        if (finished) {
            this._menuEntranceActive = false;
            this.positionTitleCursor(false);
        }
    };

    // Fungsi reaktif saat pilihan aktif berganti (Keyboard / Gamepad / Mouse Hover)
    Scene_Title.prototype.onActiveCommandChanged = function(newIdx, oldIdx) {
        var cfg = window.YURE_TITLE_CONFIG;

        if (!this._titleCommands) return;

        // Bilah opsi tetap solid; hanya cursor penunjuk yang bergerak halus.
        for (var i = 0; i < this._titleCommands.length; i++) {
            var spr = this._titleCommands[i];
            var targetX = spr._baseX;
            if (typeof window.anime !== 'undefined') window.anime.remove(spr);
            spr.x = targetX;
            spr.opacity = 255;
            spr.y = spr._baseY;
        }

        this.positionTitleCursor(true);

        if (this._titleRedAcc) {
            if (typeof window.anime !== 'undefined') window.anime.remove(this._titleRedAcc);
            this._titleRedAcc.x = cfg.redAcc.x || 0;
            this._titleRedAcc.y = cfg.redAcc.y || 0;
            this._titleRedAcc.opacity = 240;
        }
    };

    Scene_Title.prototype.getCommandAnchorPoint = function(command) {
        if (!command) return { x: 600, y: 300 };
        var cmdId = command._cmdId;
        // Titik presisi pojok kanan bawah dari masing-masing bilah opsi (mengikuti ukuran asli bilah):
        // Load: ujung kanan bawah bilah di x ≈ 640, y ≈ 215
        // Continue: bilah memanjang ke kanan sampai x ≈ 906, pojok kanan bawah di x ≈ 890, y ≈ 310
        // Option: ujung kanan bawah bilah di x ≈ 660, y ≈ 515
        // More: ujung kanan bawah bilah di x ≈ 522, y ≈ 598
        var ANCHORS = {
            'load':     { x: 640, y: 215 },
            'continue': { x: 890, y: 310 },
            'option':   { x: 660, y: 515 },
            'more':     { x: 522, y: 598 }
        };
        if (ANCHORS[cmdId]) return ANCHORS[cmdId];
        return { x: 600, y: 300 };
    };

    Scene_Title.prototype.positionTitleCursor = function(animate) {
        if (!this._titleCursor || !this._titleCommands) return;

        var command = this._titleCommands[this._activeCommandIndex];
        if (!command || !command.bitmap || !command.bitmap.isReady()) return;

        var anchor = this.getCommandAnchorPoint(command);
        var cfg = window.YURE_TITLE_CONFIG;
        var cursorCfg = (cfg && cfg.cursor) || { x: 0, y: 0, scale: 1.0, rotation: 0 };

        var isSel = (command._cmdIndex === this._activeCommandIndex);
        var sX = isSel ? ((cfg.commands && cfg.commands[command._cmdId] && cfg.commands[command._cmdId].shiftX) || 25) : 0;
        var cmdFinalX = command._baseX + sX;
        var cmdFinalY = command._baseY;

        // Posisikan kursor tepat di pojok kanan bawah bilah opsi
        var targetX = cmdFinalX + anchor.x + (cursorCfg.x || 0);
        var targetY = cmdFinalY + anchor.y + (cursorCfg.y || 0);

        this._cursorBaseTargetX = targetX;
        this._cursorBaseTargetY = targetY;

        this._titleCursor.visible = true;
        this._titleCursor.opacity = 255;
        this._titleCursor.scale.x = cursorCfg.scale || 1.0;
        this._titleCursor.scale.y = cursorCfg.scale || 1.0;
        this._titleCursor.rotation = Number(cursorCfg.rotation !== undefined ? cursorCfg.rotation : 0) * Math.PI / 180;

        if (animate && typeof window.anime !== 'undefined') {
            window.anime.remove(this._titleCursor);
            window.anime({
                targets: this._titleCursor,
                x: targetX,
                y: targetY,
                duration: 180,
                easing: 'easeOutCubic'
            });
        } else {
            this._titleCursor.x = targetX;
            this._titleCursor.y = targetY;
        }
    };

    Scene_Title.prototype.updateCursorIdleAnimation = function() {
        if (!this._titleCursor || !this._titleCursor.visible) return;
        this._cursorIdleTimer = (this._cursorIdleTimer || 0) + 1;
        var floatDist = Math.sin(this._cursorIdleTimer * 0.08) * 3.5;
        // Float halus ke arah diagonal kanan bawah (45 derajat)
        if (this._cursorBaseTargetX !== undefined && this._cursorBaseTargetY !== undefined) {
            this._titleCursor.x = this._cursorBaseTargetX + floatDist * 0.7;
            this._titleCursor.y = this._cursorBaseTargetY + floatDist * 0.7;
        }
    };

    Scene_Title.prototype.updateMenuPhase = function() {
        var cfg = window.YURE_TITLE_CONFIG;

        this.updateTitleEntrance();
        this.updateCursorIdleAnimation();

        // Coba lagi setelah bitmap opsi selesai dimuat.
        if (this._titleCursor && !this._titleCursor.visible) {
            this.positionTitleCursor(false);
        }

        // 1. Debounce Cooldown Input: Cegah Enter tembus & tunggu transisi awal
        if (this._inputCooldown > 0) {
            this._inputCooldown--;
            this.updateSelectionVisuals();
            return;
        }

        // 2. Input Navigasi Keyboard / Gamepad
        var prevIdx = this._activeCommandIndex;

        if (Input.isRepeated('down') || Input.isRepeated('right')) {
            this._activeCommandIndex = (this._activeCommandIndex + 1) % this._titleCommands.length;
            if (this._commandWindow) this._commandWindow._index = this._activeCommandIndex;
        } else if (Input.isRepeated('up') || Input.isRepeated('left')) {
            this._activeCommandIndex = (this._activeCommandIndex - 1 + this._titleCommands.length) % this._titleCommands.length;
            if (this._commandWindow) this._commandWindow._index = this._activeCommandIndex;
        }

        if (this._activeCommandIndex !== prevIdx) {
            this.playCursorSound();
            this._navTimer = 75;
            this.onActiveCommandChanged(this._activeCommandIndex, prevIdx);
        }

        // 3. Deteksi Mouse Hover Pixel-Perfect
        var mouseHoverIdx = this.checkMouseHoverCommand();
        if (mouseHoverIdx >= 0 && mouseHoverIdx !== this._activeCommandIndex) {
            var oldHoverIdx = this._activeCommandIndex;
            this._activeCommandIndex = mouseHoverIdx;
            if (this._commandWindow) this._commandWindow._index = mouseHoverIdx;
            this.playCursorSound();
            this._navTimer = 75;
            this.onActiveCommandChanged(this._activeCommandIndex, oldHoverIdx);
        }

        // 4. Deteksi Konfirmasi (OK / Click)
        if (Input.isTriggered('ok') || (TouchInput.isTriggered() && mouseHoverIdx >= 0)) {
            this.processCommandExecution(this._activeCommandIndex);
            return;
        }

        // 5. Deteksi Cancel (ESC) -> Kembali ke Tampilan Awal (Prompt)
        if (Input.isTriggered('cancel')) {
            SoundManager.playCancel();
            this.revertToPromptPhase();
            return;
        }

        // 6. Update Visual Tambahan (Red Splash fade out jika ada)
        this.updateSelectionVisuals();
    };

    Scene_Title.prototype.playCursorSound = function() {
        if (CONF_ENABLE_HOVER_SE && CONF_HOVER_SE) {
            AudioManager.playSe({
                name: CONF_HOVER_SE,
                volume: 75,
                pitch: 100,
                pan: 0
            });
        } else {
            SoundManager.playCursor();
        }
    };

    Scene_Title.prototype.checkMouseHoverCommand = function() {
        if (!TouchInput.x && !TouchInput.y) return -1;
        var mx = TouchInput.x;
        var my = TouchInput.y;

        for (var i = 0; i < this._titleCommands.length; i++) {
            var spr = this._titleCommands[i];
            if (!spr.visible || !spr.bitmap || !spr.bitmap.isReady()) continue;

            var sx = spr.scale ? spr.scale.x : 1.0;
            var sy = spr.scale ? spr.scale.y : 1.0;
            if (sx <= 0 || sy <= 0) continue;

            // Hitung koordinat lokal relatif ke sprite memperhitungkan skala
            var lx = Math.floor((mx - spr.x) / sx);
            var ly = Math.floor((my - spr.y) / sy);

            if (lx >= 0 && lx < spr.bitmap.width && ly >= 0 && ly < spr.bitmap.height) {
                var alpha = spr.bitmap.getAlphaPixel(lx, ly);
                if (alpha > 30) {
                    return i;
                }
            }
        }
        return -1;
    };

    Scene_Title.prototype.updateSelectionVisuals = function() {
        var cfg = window.YURE_TITLE_CONFIG;
        var curIdx = this._activeCommandIndex;

        // Red Splash hanya untuk transisi konfirmasi — tidak muncul saat navigasi biasa
        // (diatur oleh updateConfirmTransition saja)
        // Pastikan red splash kembali ke 0 saat di menu biasa
        if (this._titleRedSplash && this._titleRedSplash.opacity > 0 && this._titlePhase === 'menu') {
            this._titleRedSplash.opacity = Math.max(0, this._titleRedSplash.opacity - 8);
            var rFade = this._titleRedSplash.opacity;
            if (this._titleLogoWhite) this._titleLogoWhite.opacity = rFade;
            if (this._titleLogoRed) this._titleLogoRed.opacity = 255 - rFade;
        }

        // Efek Punch Bounce setelah klik konfirmasi
        if (this._confirmPunchTimer > 0) {
            this._confirmPunchTimer--;
        }

        // Update Bilah Perintah (Hanya manual lerp fallback jika anime.js tidak aktif)
        if (typeof window.anime === 'undefined' && this._titleCommands) {
            for (var i = 0; i < this._titleCommands.length; i++) {
                var spr = this._titleCommands[i];
                var isSel = (i === curIdx);

                var targetShiftX = 0;

                spr._selectShiftX += (targetShiftX - spr._selectShiftX) * 0.2;

                spr.x = spr._baseX + spr._slideOffsetX + spr._selectShiftX;
                spr.y = spr._baseY;

                if (isSel) {
                    var punchScale = this._confirmPunchTimer > 0 ? (1.0 + (this._confirmPunchTimer / 15) * 0.18) : 1.0;
                    spr.scale.x = spr._baseScale * punchScale;
                    spr.scale.y = spr.scale.x;
                    spr.opacity = 255;

                    if (this._titleRedAcc) {
                        this._titleRedAcc.opacity = Math.min(240, this._titleRedAcc.opacity + 20);
                    }
                } else {
                    spr.scale.x = spr._baseScale;
                    spr.scale.y = spr._baseScale;
                    spr.opacity = 255;
                }
            }
        }

        // Redup Red Acc jika tidak ada opsi yang dianggap "flash penuh"
        // (hanya meredup halus, tidak hilang total — bisa juga disesuaikan)
        if (this._titleRedAcc) {
            var hasSelected = this._titleCommands && this._titleCommands.length > 0;
            if (!hasSelected) {
                this._titleRedAcc.opacity = Math.max(0, this._titleRedAcc.opacity - 8);
            }
        }
    };

    // ──────────────────────────────────────────────────────────────────────────
    // RED.PNG MASK WIPE — slide Red.png masuk dari kiri ke kanan
    // Red.png tetap di posisi normal; PIXI.Graphics mask mengungkapnya bertahap
    // Area transparan Red.png tetap transparan (bentuk organik aslinya terjaga)
    // ──────────────────────────────────────────────────────────────────────────

    // Update shape mask berdasarkan progress (0→1)
    Scene_Title.prototype._updateRedWipeMask = function(progress) {
        var gfx = this._redWipeMask;
        if (!gfx) return;
        var w = Graphics.boxWidth  || 1280;
        var h = Graphics.boxHeight || 720;

        // Posisi ujung depan (sedikit lewat kanan agar penuh saat progress=1)
        var leadX = progress * (w + 40);
        // Gelombang organik di tepi depan: maks di tengah animasi, flat di awal/akhir
        var amp = 55 * Math.sin(progress * Math.PI);

        gfx.clear();
        if (progress <= 0.001) return;

        gfx.beginFill(0xffffff, 1);
        gfx.moveTo(0, 0);

        // Tepi atas menuju leading edge
        gfx.lineTo(leadX + amp * 0.4, 0);

        // Leading edge bergelombang (12 titik sepanjang tepi kanan mask)
        var steps = 14;
        for (var i = 1; i <= steps; i++) {
            var t  = i / steps;
            var y  = t * h;
            // Gabungan dua gelombang sine untuk textur organik alami
            var wave = amp * (
                Math.sin(t * Math.PI * 2.2 + progress * 1.8) * 0.65 +
                Math.sin(t * Math.PI * 1.1 + progress * 0.9) * 0.35
            );
            gfx.lineTo(leadX + wave, y);
        }

        // Tutup kembali ke pojok bawah kiri
        gfx.lineTo(0, h);
        gfx.endFill();
    };

    // Bersihkan mask dari Red.png dan hapus Graphics object
    Scene_Title.prototype._destroyRedWipeMask = function() {
        if (this._titleRedSplash && this._titleRedSplash.mask === this._redWipeMask) {
            this._titleRedSplash.mask = null;
        }
        if (this._redWipeMask) {
            this._redWipeMask.destroy();
        }
        this._redWipeMask  = null;
        this._paintWipeProxy = null;
    };

    // Saat tombol dikonfirmasi: slide Red.png masuk dengan mask
    Scene_Title.prototype.processCommandExecution = function(index) {
        var cmdDef = this._commandDefs[index];
        var action = cmdDef ? cmdDef.action : 'newGame';

        // Continue tanpa save: buzzer + guncang
        if (action === 'continue' && !DataManager.isAnySavefileExists()) {
            SoundManager.playBuzzer();
            var spr = this._titleCommands[index];
            if (spr) spr._slideOffsetX -= 18;
            return;
        }

        SoundManager.playOk();
        this._confirmPunchTimer   = 15;
        this._pendingCommandIndex = index;
        SceneManager._yureLastCommandIndex = index; // simpan pilihan aktif untuk dipulihkan saat kembali dari submenu
        this._confirmTransitionTimer = 52; // ~0.87 dtk @ 60fps (anime 700ms + buffer)
        this._titlePhase = 'confirm_transition';
        Input.clear();
        TouchInput.clear();

        // Siapkan Red.png: tampilkan penuh tapi sembunyikan dengan mask
        var red = this._titleRedSplash;
        if (red) {
            red.opacity    = 255;
            red.scale.x    = 1.0;
            red.scale.y    = 1.0;
            red.anchor.x   = 0;
            red.anchor.y   = 0;
            // Pastikan posisi dikembalikan ke default (0,0 atau dari config)
            var cfg = window.YURE_TITLE_CONFIG;
            red.x = (cfg.redSplash && cfg.redSplash.x != null) ? cfg.redSplash.x : 0;
            red.y = (cfg.redSplash && cfg.redSplash.y != null) ? cfg.redSplash.y : 0;
        }

        // Hapus mask lama jika masih ada
        this._destroyRedWipeMask();

        // Buat PIXI.Graphics sebagai mask baru
        this._redWipeMask = new PIXI.Graphics();
        this._updateRedWipeMask(0); // awal: tidak terlihat

        if (red) red.mask = this._redWipeMask;

        // anime.js: gerakkan mask dari progress 0 → 1
        var self = this;
        this._paintWipeProxy = { p: 0 };

        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this._paintWipeProxy);
            window.anime({
                targets : self._paintWipeProxy,
                p       : 1.0,
                duration: 700,
                easing  : 'easeInOutCubic',  // mulai pelan, cepat di tengah, melambat di akhir
                update  : function() {
                    var prog = self._paintWipeProxy.p;
                    self._updateRedWipeMask(prog);
                    // Cross-fade logo seiring Red.png muncul
                    if (self._titleLogoWhite) self._titleLogoWhite.opacity = Math.floor(prog * 255);
                    if (self._titleLogoRed)   self._titleLogoRed.opacity   = Math.floor((1 - prog) * 255);
                },
                complete: function() {
                    // Wipe selesai: hapus mask agar Red.png tampil penuh alami
                    if (self._titleRedSplash) self._titleRedSplash.mask = null;
                    self._destroyRedWipeMask();
                }
            });
        }
    };

    // Update confirm_transition: hitung timer, fallback manual jika tidak ada anime.js
    Scene_Title.prototype.updateConfirmTransition = function() {
        this._confirmTransitionTimer--;

        // Fallback manual jika anime.js tidak tersedia
        if (typeof window.anime === 'undefined') {
            var prog = Math.max(0, 1 - this._confirmTransitionTimer / 52);
            this._updateRedWipeMask(prog);
            if (this._titleLogoWhite) this._titleLogoWhite.opacity = Math.floor(prog * 255);
            if (this._titleLogoRed)   this._titleLogoRed.opacity   = Math.floor((1 - prog) * 255);
        }

        if (this._confirmPunchTimer > 0) this._confirmPunchTimer--;

        // Timer habis: set 'done' DULU baru eksekusi (anti infinite-loop)
        if (this._confirmTransitionTimer <= 0) {
            this._titlePhase = 'done';
            this.executeConfirmedCommand(this._pendingCommandIndex);
        }
    };

    // Eksekusi perintah yang sudah dipilih (dipanggil setelah animasi transisi selesai)
    Scene_Title.prototype.executeConfirmedCommand = function(index) {
        var cmdDef = this._commandDefs[index];
        var action = cmdDef ? cmdDef.action : 'newGame';

        // Pulihkan commandWindow ke kondisi aktif agar RPG Maker bisa memanggil
        // this._commandWindow.close() dan fadeOutAll() secara normal tanpa hang
        if (this._commandWindow) {
            this._commandWindow.visible = false;
            this._commandWindow.opacity = 0;
            this._commandWindow._opening = false;
            this._commandWindow._closing = false;
            this._commandWindow.openness = 255;
        }

        if (action === 'newGame') {
            SceneManager._yureReturnPhase = null;
            this.commandNewGame();
        } else if (action === 'continue') {
            // Load / Continue screen: saat di-ESC, kembali ke Menu Title
            SceneManager._yureReturnPhase = 'menu';
            this.commandContinue();
        } else if (action === 'options') {
            // Setting / Options screen: saat di-ESC, kembali ke Menu Title
            SceneManager._yureReturnPhase = 'menu';
            this.commandOptions();
        } else if (action === 'gallery') {
            // Gallery / More screen: saat di-ESC, kembali ke Menu Title
            SceneManager._yureReturnPhase = 'menu';
            if (typeof this.commandGallery === 'function') {
                this.commandGallery();
            } else if (typeof Scene_MyGallery !== 'undefined') {
                SceneManager.push(Scene_MyGallery);
            } else {
                this.commandOptions();
            }
        }
    };

    Scene_Title.prototype.revertToPromptPhase = function() {
        this._titlePhase = 'prompt';
        this._menuEntranceProgress = 0;
        this._inputCooldown = 25; // Debounce agar tombol ESC di menu tidak langsung tembus quit game
        Input.clear();
        TouchInput.clear();
        if (this._titleCursor) this._titleCursor.visible = false;

        // Bersihkan red wipe mask jika masih ada
        this._destroyRedWipeMask();

        if (this._titleBackShadow) this._titleBackShadow.opacity = 255;

        if (this._titleRedSplash) {
            this._titleRedSplash.mask    = null;
            this._titleRedSplash.opacity = 0;
            this._titleRedSplash.scale.x = 1.0;
            this._titleRedSplash.scale.y = 1.0;
        }
        if (this._titleRedAcc) {
            if (typeof window.anime !== 'undefined') {
                window.anime({
                    targets: this._titleRedAcc,
                    opacity: 0,
                    duration: 180,
                    easing: 'easeInQuad'
                });
            } else {
                this._titleRedAcc.opacity = 0;
            }
        }
        if (this._titleLogoWhite) this._titleLogoWhite.opacity = 0;
        if (this._titleLogoRed)   this._titleLogoRed.opacity   = 255;

        // Tombol meluncur keluar staggered dengan anime.js
        var self = this;
        if (this._titleCommands && typeof window.anime !== 'undefined') {
            window.anime.remove(this._titleCommands);
            window.anime({
                targets: this._titleCommands,
                x: function(spr) { return spr._baseX - 90; },
                opacity: 0,
                delay: window.anime.stagger(35, { direction: 'reverse' }),
                duration: 200,
                easing: 'easeInQuad',
                complete: function() {
                    for (var i = 0; i < self._titleCommands.length; i++) {
                        self._titleCommands[i].visible = false;
                    }
                }
            });
        } else if (this._titleCommands) {
            for (var i = 0; i < this._titleCommands.length; i++) {
                var spr = this._titleCommands[i];
                spr.visible = false;
                spr.opacity = 0;
            }
        }

        // Munculkan kembali teks prompt dengan fade in mulus
        if (this._titlePromptSprite) {
            this._titlePromptSprite.visible = true;
            if (typeof window.anime !== 'undefined') {
                this._titlePromptSprite.opacity = 0;
                window.anime({
                    targets: this._titlePromptSprite,
                    opacity: 255,
                    delay: 120,
                    duration: 320,
                    easing: 'easeOutQuad'
                });
            } else {
                this._titlePromptSprite.opacity = 255;
            }
        }

        if (this._commandWindow) {
            this._commandWindow.deactivate();
        }
    };

    // =========================================================================
    // 5. CARTOON CIRCLE IN/OUT TRANSITIONS (IRIS-IN / IRIS-OUT)
    // =========================================================================
    Scene_Title.prototype.startCartoonCircleTransition = function() {
        this._circleTransActive = true;
        this._circleTransTimer = 0;
        this._circleTransDuration = Math.max(15, CONF_CIRCLE_DURATION);

        var w = Graphics.boxWidth || 1280;
        var h = Graphics.boxHeight || 720;
        var cx = w / 2;
        var cy = h / 2;
        this._circleTransMaxR = Math.ceil(Math.sqrt(cx * cx + cy * cy)) + 90;

        if (!this._cartoonCircleSprite) {
            this._cartoonCircleSprite = new Sprite();
            this._cartoonCircleSprite._circleRenderScale = 0.5;
            this._cartoonCircleSprite.bitmap = new Bitmap(Math.ceil(w * 0.5), Math.ceil(h * 0.5));
            this._cartoonCircleSprite.scale.x = 2;
            this._cartoonCircleSprite.scale.y = 2;
            this._cartoonCircleSprite.z = 99999;
            this.addChild(this._cartoonCircleSprite);
        } else {
            this._cartoonCircleSprite.visible = true;
            this.addChild(this._cartoonCircleSprite);
        }

        this.renderCartoonCircleFrame(0);

        if (CONF_PLAY_WHOOSH && CONF_WHOOSH_SE) {
            AudioManager.playSe({
                name: CONF_WHOOSH_SE,
                volume: CONF_WHOOSH_VOL,
                pitch: 100,
                pan: 0
            });
        }
    };

    function renderCartoonCircle(sprite, p, cx, cy, maxR, ringColor) {
        if (!sprite || !sprite.bitmap) return;

        var bmp = sprite.bitmap;
        var ctx = bmp._context;
        var w = bmp.width;
        var h = bmp.height;
        var renderScale = sprite._circleRenderScale || 1;
        cx = (cx !== undefined) ? cx : (w / 2);
        cy = (cy !== undefined) ? cy : (h / 2);
        maxR = maxR || (Math.ceil(Math.sqrt(cx * cx + cy * cy)) + 90);
        cx *= renderScale;
        cy *= renderScale;
        maxR *= renderScale;
        ringColor = ringColor || CONF_RING_COLOR || '#ff0066';

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        if (p <= 0) {
            bmp._setDirty();
            return;
        }

        var curR = Math.max(0, p * maxR);

        if (curR > 0) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(cx, cy, curR, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalCompositeOperation = 'source-over';
            if (curR < maxR + 10) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 14 * renderScale;
                ctx.beginPath();
                ctx.arc(cx, cy, curR, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = ringColor;
                ctx.lineWidth = 6 * renderScale;
                ctx.beginPath();
                ctx.arc(cx, cy, curR, 0, Math.PI * 2);
                ctx.stroke();

                if (curR > 20) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.5 * renderScale;
                    ctx.beginPath();
                    ctx.arc(cx, cy, Math.max(1, curR - 6), 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }
        bmp._setDirty();
    }

    Scene_Title.prototype.renderCartoonCircleFrame = function(p) {
        if (!this._cartoonCircleSprite) return;
        var w = Graphics.boxWidth || 1280;
        var h = Graphics.boxHeight || 720;
        var eased = cartoonEaseOut(p);
        renderCartoonCircle(this._cartoonCircleSprite, eased, w / 2, h / 2, this._circleTransMaxR);
    };

    Scene_Title.prototype.updateCartoonCircleTransition = function() {
        if (!this._circleTransActive) return;
        this._circleTransTimer++;
        var progress = Math.min(1.0, this._circleTransTimer / this._circleTransDuration);
        this.renderCartoonCircleFrame(progress);

        if (progress >= 1.0) {
            this._circleTransActive = false;
            if (this._cartoonCircleSprite) {
                this.removeChild(this._cartoonCircleSprite);
                this._cartoonCircleSprite = null;
            }
        }
    };

    // Shared Circle-Out Transition for New Game / Load
    Scene_Base.prototype.startCartoonCircleOut = function(onComplete) {
        this._circleOutActive = true;
        this._circleOutTimer = 0;
        this._circleOutDuration = 32;
        this._circleOutCallback = onComplete;

        var w = Graphics.boxWidth || 1280;
        var h = Graphics.boxHeight || 720;

        if (!this._circleOutSprite) {
            this._circleOutSprite = new Sprite();
            this._circleOutSprite._circleRenderScale = 0.5;
            this._circleOutSprite.bitmap = new Bitmap(Math.ceil(w * 0.5), Math.ceil(h * 0.5));
            this._circleOutSprite.scale.x = 2;
            this._circleOutSprite.scale.y = 2;
            this._circleOutSprite.z = 999999;
            this.addChild(this._circleOutSprite);
        } else {
            this._circleOutSprite.visible = true;
            this.addChild(this._circleOutSprite);
        }

        if (CONF_PLAY_WHOOSH && CONF_WHOOSH_SE) {
            AudioManager.playSe({
                name: CONF_WHOOSH_SE,
                volume: CONF_WHOOSH_VOL,
                pitch: 90,
                pan: 0
            });
        }

        renderCartoonCircle(this._circleOutSprite, 1.0, w / 2, h / 2);
    };

    var _Scene_Base_update_circleOut = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function() {
        _Scene_Base_update_circleOut.call(this);

        if (this._circleOutActive) {
            this._circleOutTimer++;
            var prog = Math.min(1.0, this._circleOutTimer / this._circleOutDuration);
            var p = Math.pow(1 - prog, 2.2);
            var w = Graphics.boxWidth || 1280;
            var h = Graphics.boxHeight || 720;

            renderCartoonCircle(this._circleOutSprite, p, w / 2, h / 2);

            if (prog >= 1.0) {
                this._circleOutActive = false;
                if (this._circleOutCallback) {
                    var cb = this._circleOutCallback;
                    this._circleOutCallback = null;
                    cb();
                }
            }
        }
    };

    // A. Intercept New Game on Scene_Title
    var _Scene_Title_commandNewGame = Scene_Title.prototype.commandNewGame;
    Scene_Title.prototype.commandNewGame = function() {
        if (!CONF_ENABLE_CIRCLE) {
            _Scene_Title_commandNewGame.call(this);
            return;
        }
        this._commandWindow.close();
        this.startCartoonCircleOut(function() {
            DataManager.setupNewGame();
            if (typeof $gameTemp !== 'undefined') {
                $gameTemp._yureCircleInTransition = true;
            }
            SceneManager.goto(Scene_Map);
        });
    };

    // B. Intercept Continue (Save Load) on Scene_File
    var _Scene_File_onLoadSuccess = Scene_File.prototype.onLoadSuccess;
    Scene_File.prototype.onLoadSuccess = function() {
        if (!CONF_ENABLE_CIRCLE) {
            _Scene_File_onLoadSuccess.call(this);
            return;
        }
        SoundManager.playLoad();
        this.startCartoonCircleOut(function() {
            this.reloadMapIfUpdated();
            if (typeof $gameTemp !== 'undefined') {
                $gameTemp._yureCircleInTransition = true;
            }
            SceneManager.goto(Scene_Map);
            this._loadSuccess = true;
        }.bind(this));
    };

    // C. Circle-In Expansion on Scene_Map
    var _Scene_Map_start_circle = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start_circle.call(this);

        if ($gameTemp && $gameTemp._yureCircleInTransition) {
            $gameTemp._yureCircleInTransition = false;
            if (this._fadeSprite) {
                this._fadeSprite.opacity = 0;
                this._fadeDuration = 0;
                this._fadeSprite.visible = false;
            }
            this.startMapCircleInTransition();
        }
    };

    Scene_Map.prototype.startMapCircleInTransition = function() {
        this._mapCircleInActive = true;
        this._mapCircleInTimer = 0;
        this._mapCircleInDuration = 45;

        var w = Graphics.boxWidth || 1280;
        var h = Graphics.boxHeight || 720;
        var cx = (typeof $gamePlayer !== 'undefined' && $gamePlayer) ? $gamePlayer.screenX() : (w / 2);
        var cy = (typeof $gamePlayer !== 'undefined' && $gamePlayer) ? ($gamePlayer.screenY() - 24) : (h / 2);
        this._mapCircleCenter = { x: cx, y: cy };

        if (!this._mapCircleSprite) {
            this._mapCircleSprite = new Sprite();
            this._mapCircleSprite._circleRenderScale = 0.5;
            this._mapCircleSprite.bitmap = new Bitmap(Math.ceil(w * 0.5), Math.ceil(h * 0.5));
            this._mapCircleSprite.scale.x = 2;
            this._mapCircleSprite.scale.y = 2;
            this._mapCircleSprite.z = 999999;
            this.addChild(this._mapCircleSprite);
        } else {
            this._mapCircleSprite.visible = true;
            this.addChild(this._mapCircleSprite);
        }

        if (CONF_PLAY_WHOOSH && CONF_WHOOSH_SE) {
            AudioManager.playSe({
                name: CONF_WHOOSH_SE,
                volume: CONF_WHOOSH_VOL,
                pitch: 105,
                pan: 0
            });
        }

        renderCartoonCircle(this._mapCircleSprite, 0.0, cx, cy);
    };

    var _Scene_Map_update_circle = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update_circle.call(this);

        if (this._mapCircleInActive) {
            this._mapCircleInTimer++;
            var prog = Math.min(1.0, this._mapCircleInTimer / this._mapCircleInDuration);
            var p = cartoonEaseOut(prog);
            var cx = this._mapCircleCenter ? this._mapCircleCenter.x : (Graphics.boxWidth / 2);
            var cy = this._mapCircleCenter ? this._mapCircleCenter.y : (Graphics.boxHeight / 2);

            renderCartoonCircle(this._mapCircleSprite, p, cx, cy);

            if (prog >= 1.0) {
                this._mapCircleInActive = false;
                if (this._mapCircleSprite) {
                    this.removeChild(this._mapCircleSprite);
                    this._mapCircleSprite = null;
                }
            }
        }
    };

})();
