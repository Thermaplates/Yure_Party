//=============================================================================
// Yure_DynamicMenuMotion.js
//=============================================================================
/*:
 * @plugindesc [v2.0] Dynamic Animated Menu Atmosphere: Ambient Particles, Aurora Waves, Card Breathing Float & Window Motion.
 * @author Yure Party Team & Antigravity
 *
 * @param --- Pengaturan Transisi Window ---
 * @default
 *
 * @param Enable Window Slide In
 * @parent --- Pengaturan Transisi Window ---
 * @desc Aktifkan animasi geser masuk yang halus untuk semua window di menu.
 * @type boolean
 * @default true
 *
 * @param Slide Duration
 * @parent --- Pengaturan Transisi Window ---
 * @desc Durasi transisi masuk window (dalam frame, 12-16 direkomendasikan).
 * @type number
 * @default 14
 *
 * @param Slide Distance
 * @parent --- Pengaturan Transisi Window ---
 * @desc Jarak piksel awal saat window meluncur masuk.
 * @type number
 * @default 40
 *
 * @param --- Pengaturan Partikel Atmosfer Menu ---
 * @default
 *
 * @param Enable Ambient Particles
 * @parent --- Pengaturan Partikel Atmosfer Menu ---
 * @desc Menambahkan partikel roh/motes bercahaya yang melayang di latar belakang menu.
 * @type boolean
 * @default true
 *
 * @param Particle Count
 * @parent --- Pengaturan Partikel Atmosfer Menu ---
 * @desc Jumlah partikel atmosfer yang melayang di latar belakang.
 * @type number
 * @default 32
 *
 * @param Particle Theme
 * @parent --- Pengaturan Partikel Atmosfer Menu ---
 * @desc Tema warna partikel (spirit = cyan/ungu/emas, fireflies = hijau/kuning, cyber = biru/magenta).
 * @type select
 * @option Spirit (Ethereal Cyan / Violet / Gold)
 * @value spirit
 * @option Fireflies (Warm Gold / Emerald)
 * @value fireflies
 * @option Cyber (Neon Blue / Magenta)
 * @value cyber
 * @default spirit
 *
 * @param --- Pengaturan Efek Visual & Aurora ---
 * @default
 *
 * @param Enable Aurora Wave
 * @parent --- Pengaturan Efek Visual & Aurora ---
 * @desc Menambahkan gelombang cahaya aurora magis yang bergerak lembut di latar belakang.
 * @type boolean
 * @default true
 *
 * @param Enable Backdrop Vignette
 * @parent --- Pengaturan Efek Visual & Aurora ---
 * @desc Menambahkan vignette gelap sinematik di latar belakang menu.
 * @type boolean
 * @default true
 *
 * @param Enable Cursor Pulse
 * @parent --- Pengaturan Efek Visual & Aurora ---
 * @desc Menambahkan efek breathing glow pada kursor seleksi menu.
 * @type boolean
 * @default true
 *
 * @param --- Pengaturan Karakter & Card Motion ---
 * @default
 *
 * @param Enable Card Breathing
 * @parent --- Pengaturan Karakter & Card Motion ---
 * @desc Karakter bust dan kartu status pada Main Menu akan bergerak naik-turun halus (breathing).
 * @type boolean
 * @default true
 *
 * @param Enable Saki Ghost Float
 * @parent --- Pengaturan Karakter & Card Motion ---
 * @desc Saki (hantu) memiliki animasi melayang lebih tinggi dengan efek transparan berdenyut di menu.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * YURE DYNAMIC MENU MOTION SYSTEM (v2.0)
 * ============================================================================
 * Plugin ini menghadirkan suasana visual yang hidup, dinamis, dan bernyawa ke
 * seluruh layar Menu game (Main Menu, Item, Skill, Equip, Status, Options, dsb).
 *
 * FITUR UTAMA:
 * 1. Ethereal Ambient Spirit Particles:
 *    Partikel roh/motes bercahaya yang melayang naik dengan gelombang sinusoidal,
 *    berdenyut terang-redup, dan memberikan kedalaman 2.5D pada backdrop menu.
 *
 * 2. Dynamic Ambient Aurora Waves:
 *    Pita gelombang cahaya etereal di bagian bawah/tengah layar yang mengalir
 *    secara halus dengan efek blending ADD.
 *
 * 3. Lively Character & Card Breathing:
 *    Bust karakter dan kartu status di Main Menu tidak kaku/statis, melainkan
 *    bergerak naik-turun lembut seolah bernapas. Karakter hantu (Saki) memiliki
 *    efek melayang spectral khusus dengan denyut transparansi mistis.
 *
 * 4. Active Command & Selection Glow:
 *    Ikon perintah aktif pada Magic Wheel dan kartu party memiliki efek glow
 *    dan pulse dinamis.
 *
 * 5. Window Cascade Entrance:
 *    Window meluncur masuk secara staggered dengan kurva Cubic Deceleration.
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_DynamicMenuMotion');
    var enableWindowSlide    = String(parameters['Enable Window Slide In'] || 'true') === 'true';
    var slideDuration        = Number(parameters['Slide Duration'] || 14);
    var slideDistance        = Number(parameters['Slide Distance'] || 40);
    var enableParticles      = String(parameters['Enable Ambient Particles'] || 'true') === 'true';
    var particleCount        = Number(parameters['Particle Count'] || 32);
    var particleTheme        = String(parameters['Particle Theme'] || 'spirit');
    var enableAurora         = String(parameters['Enable Aurora Wave'] || 'true') === 'true';
    var enableVignette       = String(parameters['Enable Backdrop Vignette'] || 'true') === 'true';
    var enableCursorPulse    = String(parameters['Enable Cursor Pulse'] || 'true') === 'true';
    var enableCardBreathing  = String(parameters['Enable Card Breathing'] || 'true') === 'true';
    var enableSakiGhostFloat = String(parameters['Enable Saki Ghost Float'] || 'true') === 'true';

    // ------------------------------------------------------------------------
    // Helper: Cubic Ease-Out
    // ------------------------------------------------------------------------
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // ========================================================================
    // 1. ETHEREAL AMBIENT PARTICLES ENGINE
    // ========================================================================
    function Sprite_MenuAmbientParticles() {
        this.initialize.apply(this, arguments);
    }
    Sprite_MenuAmbientParticles.prototype = Object.create(Sprite.prototype);
    Sprite_MenuAmbientParticles.prototype.constructor = Sprite_MenuAmbientParticles;

    Sprite_MenuAmbientParticles.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this.blendMode = PIXI.blendModes.ADD;
        this.opacity = 0;
        this._particles = [];
        this.initParticles();
    };

    Sprite_MenuAmbientParticles.prototype.initParticles = function() {
        var w = Graphics.boxWidth;
        var h = Graphics.boxHeight;
        var count = Math.max(12, Math.min(60, particleCount));

        // Color Palettes
        var palettes = {
            spirit: [
                { r: 120, g: 235, b: 220 }, // Ghost Cyan
                { r: 190, g: 140, b: 255 }, // Spectral Violet
                { r: 255, g: 215, b: 130 }, // Soft Amber Gold
                { r: 230, g: 245, b: 255 }  // Pure Starlight
            ],
            fireflies: [
                { r: 255, g: 220, b: 100 }, // Warm Gold
                { r: 150, g: 255, b: 130 }, // Emerald Glow
                { r: 255, g: 190, b: 80 }   // Amber Spark
            ],
            cyber: [
                { r: 60,  g: 200, b: 255 }, // Neon Blue
                { r: 255, g: 60,  b: 180 }, // Magenta
                { r: 120, g: 255, b: 200 }  // Cyan Mint
            ]
        };

        var colors = palettes[particleTheme] || palettes.spirit;

        for (var i = 0; i < count; i++) {
            var col = colors[Math.floor(Math.random() * colors.length)];
            this._particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                baseRadius: 1.2 + Math.random() * 2.8,
                speedY: 0.35 + Math.random() * 0.75,
                swayFreq: 0.015 + Math.random() * 0.025,
                swayAmp: 12 + Math.random() * 24,
                phase: Math.random() * Math.PI * 2,
                alphaSpeed: 0.02 + Math.random() * 0.035,
                baseAlpha: 0.35 + Math.random() * 0.50,
                color: col,
                isLargeOrb: (Math.random() < 0.20),
                timer: Math.floor(Math.random() * 1000)
            });
        }
    };

    Sprite_MenuAmbientParticles.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this.opacity < 255) {
            this.opacity = Math.min(255, this.opacity + 14);
        }

        var bmp = this.bitmap;
        bmp.clear();
        var ctx = bmp.context;
        if (!ctx) return;

        var w = Graphics.boxWidth;
        var h = Graphics.boxHeight;

        for (var i = 0; i < this._particles.length; i++) {
            var p = this._particles[i];
            p.timer++;

            // Upward drift
            p.y -= p.speedY;
            if (p.y < -30) {
                p.y = h + 20;
                p.x = Math.random() * w;
            }

            // Horizontal sine sway
            var curX = p.x + Math.sin(p.timer * p.swayFreq + p.phase) * p.swayAmp;
            if (curX < -20) curX += w + 40;
            if (curX > w + 20) curX -= w + 40;

            // Pulsating alpha & radius
            var pulse = Math.sin(p.timer * p.alphaSpeed + p.phase);
            var alpha = Math.max(0.05, p.baseAlpha + pulse * 0.25);
            var r = Math.max(0.8, p.baseRadius + pulse * 0.6);

            var c = p.color;

            if (p.isLargeOrb) {
                // Large soft glowing orb
                var grad = ctx.createRadialGradient(curX, p.y, 0, curX, p.y, r * 4.5);
                grad.addColorStop(0, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (alpha * 0.85) + ')');
                grad.addColorStop(0.5, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (alpha * 0.35) + ')');
                grad.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(curX, p.y, r * 4.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Bright spark mote with subtle core
                var grad = ctx.createRadialGradient(curX, p.y, 0, curX, p.y, r * 2.8);
                grad.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
                grad.addColorStop(0.4, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (alpha * 0.75) + ')');
                grad.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(curX, p.y, r * 2.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        bmp._setDirty();
    };

    // ========================================================================
    // 2. DYNAMIC AMBIENT AURORA WAVES
    // ========================================================================
    function Sprite_MenuAuroraWave() {
        this.initialize.apply(this, arguments);
    }
    Sprite_MenuAuroraWave.prototype = Object.create(Sprite.prototype);
    Sprite_MenuAuroraWave.prototype.constructor = Sprite_MenuAuroraWave;

    Sprite_MenuAuroraWave.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(Graphics.boxWidth, 240);
        this.y = Graphics.boxHeight - 220;
        this.blendMode = PIXI.blendModes.ADD;
        this.opacity = 0;
        this._timer = 0;
    };

    Sprite_MenuAuroraWave.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this.opacity < 160) {
            this.opacity = Math.min(160, this.opacity + 6);
        }
        this._timer += 0.025;

        // Render every 2 frames for top performance
        if (Graphics.frameCount % 2 !== 0) return;

        var bmp = this.bitmap;
        bmp.clear();
        var ctx = bmp.context;
        if (!ctx) return;

        var w = Graphics.boxWidth;
        var h = 240;

        // Layer 1: Ethereal Cyan Ribbon
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (var x = 0; x <= w; x += 24) {
            var yOffset = Math.sin(x * 0.005 + this._timer * 1.2) * 28 + Math.cos(x * 0.009 - this._timer * 0.8) * 16;
            ctx.lineTo(x, 70 + yOffset);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        var grad1 = ctx.createLinearGradient(0, 40, 0, h);
        grad1.addColorStop(0, 'rgba(60, 220, 210, 0.28)');
        grad1.addColorStop(0.5, 'rgba(80, 140, 240, 0.14)');
        grad1.addColorStop(1, 'rgba(10, 20, 60, 0)');
        ctx.fillStyle = grad1;
        ctx.fill();

        // Layer 2: Spectral Violet Ribbon
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (var x = 0; x <= w; x += 24) {
            var yOffset2 = Math.cos(x * 0.006 - this._timer * 1.0) * 24 + Math.sin(x * 0.008 + this._timer * 0.7) * 14;
            ctx.lineTo(x, 90 + yOffset2);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        var grad2 = ctx.createLinearGradient(0, 60, 0, h);
        grad2.addColorStop(0, 'rgba(180, 100, 255, 0.22)');
        grad2.addColorStop(0.6, 'rgba(120, 60, 200, 0.08)');
        grad2.addColorStop(1, 'rgba(5, 5, 30, 0)');
        ctx.fillStyle = grad2;
        ctx.fill();

        ctx.restore();
        bmp._setDirty();
    };

    // ========================================================================
    // 3. CINEMATIC BACKDROP VIGNETTE & ATMOSPHERE INJECTION
    // ========================================================================
    var _Scene_MenuBase_createBackground = Scene_MenuBase.prototype.createBackground;
    Scene_MenuBase.prototype.createBackground = function() {
        _Scene_MenuBase_createBackground.call(this);

        // 1. Dynamic Aurora Waves (Bottom Layer)
        if (enableAurora && !this._menuAuroraSprite) {
            this._menuAuroraSprite = new Sprite_MenuAuroraWave();
            this.addChild(this._menuAuroraSprite);
        }

        // 2. Ambient Particles (Middle Layer)
        if (enableParticles && !this._menuParticlesSprite) {
            this._menuParticlesSprite = new Sprite_MenuAmbientParticles();
            this.addChild(this._menuParticlesSprite);
        }

        // 3. Vignette Overlay (Top Ambient Layer)
        if (enableVignette && !this._menuVignetteSprite) {
            this.createMenuVignette();
        }
    };

    Scene_MenuBase.prototype.createMenuVignette = function() {
        if (this._menuVignetteSprite) return;

        var w = Graphics.boxWidth;
        var h = Graphics.boxHeight;
        var bmp = new Bitmap(w, h);
        var ctx = bmp.context;

        if (ctx) {
            var cx = w / 2;
            var cy = h / 2;
            var maxR = Math.sqrt(cx * cx + cy * cy);
            var grad = ctx.createRadialGradient(cx, cy, maxR * 0.22, cx, cy, maxR);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
            grad.addColorStop(0.65, 'rgba(5, 5, 15, 0.32)');
            grad.addColorStop(1, 'rgba(2, 2, 10, 0.78)');

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            bmp._setDirty();
        }

        this._menuVignetteSprite = new Sprite(bmp);
        this._menuVignetteSprite.alpha = 0;
        this.addChild(this._menuVignetteSprite);
    };

    var _Scene_MenuBase_start = Scene_MenuBase.prototype.start;
    Scene_MenuBase.prototype.start = function() {
        _Scene_MenuBase_start.call(this);
        if (enableWindowSlide) {
            this.initDynamicMenuMotion();
        }
    };

    Scene_MenuBase.prototype.initDynamicMenuMotion = function() {
        if (!this._windowLayer || !this._windowLayer.children) return;

        var windows = this._windowLayer.children.filter(function(child) {
            return child instanceof Window_Base && child.visible && !child._customMotionHandled;
        });

        var screenW = Graphics.boxWidth;
        var screenH = Graphics.boxHeight;

        for (var i = 0; i < windows.length; i++) {
            var win = windows[i];
            if (win._menuMotionInitialized) continue;

            win._menuMotionInitialized = true;
            win._targetX = win.x;
            win._targetY = win.y;
            win._targetAlpha = (win.alpha !== undefined) ? win.alpha : 1.0;
            win._motionProgress = 0;
            win._motionDuration = slideDuration;
            win._motionDelay = i * 2; // Staggered cascade

            var centerX = win.x + win.width / 2;

            if (win.width >= screenW * 0.8 && win.y < screenH * 0.3) {
                win._offsetX = 0;
                win._offsetY = -slideDistance;
            } else if (win.width >= screenW * 0.8 && win.y > screenH * 0.6) {
                win._offsetX = 0;
                win._offsetY = slideDistance;
            } else if (centerX < screenW * 0.45) {
                win._offsetX = -slideDistance;
                win._offsetY = 0;
            } else if (centerX > screenW * 0.55) {
                win._offsetX = slideDistance;
                win._offsetY = 0;
            } else {
                win._offsetX = 0;
                win._offsetY = 20;
            }

            win.x = win._targetX + win._offsetX;
            win.y = win._targetY + win._offsetY;
            win.alpha = 0;
        }
    };

    var _Scene_MenuBase_update = Scene_MenuBase.prototype.update;
    Scene_MenuBase.prototype.update = function() {
        _Scene_MenuBase_update.call(this);

        // Vignette fade-in
        if (this._menuVignetteSprite && this._menuVignetteSprite.alpha < 1.0) {
            this._menuVignetteSprite.alpha = Math.min(1.0, this._menuVignetteSprite.alpha + 0.08);
        }

        // Window cascade motion
        if (enableWindowSlide && this._windowLayer && this._windowLayer.children) {
            var children = this._windowLayer.children;
            for (var i = 0; i < children.length; i++) {
                var win = children[i];
                if (win instanceof Window_Base && win._motionDuration && win._motionProgress < (win._motionDuration + (win._motionDelay || 0))) {
                    win._motionProgress++;
                    if (win._motionProgress > (win._motionDelay || 0)) {
                        var t = (win._motionProgress - win._motionDelay) / win._motionDuration;
                        t = Math.min(1.0, t);
                        var ease = easeOutCubic(t);

                        win.x = win._targetX + (win._offsetX || 0) * (1 - ease);
                        win.y = win._targetY + (win._offsetY || 0) * (1 - ease);
                        win.alpha = (win._targetAlpha || 1.0) * ease;

                        if (t >= 1.0) {
                            win.x = win._targetX;
                            win.y = win._targetY;
                            win.alpha = win._targetAlpha || 1.0;
                        }
                    }
                }
            }
        }
    };

    // ========================================================================
    // 4. LIVELY SELECTION CURSOR GLOW & SPRING PUNCH
    // ========================================================================
    if (enableCursorPulse) {
        var _Window_Selectable_update = Window_Selectable.prototype.update;
        Window_Selectable.prototype.update = function() {
            _Window_Selectable_update.call(this);
            if (this.active && this._cursorSprite) {
                this._cursorAnimTimer = (this._cursorAnimTimer || 0) + 1;
                var pulse = Math.sin(this._cursorAnimTimer * 0.09) * 0.12;
                this._cursorSprite.alpha = 0.88 + pulse;
            }
        };

        var _Window_Selectable_select = Window_Selectable.prototype.select;
        Window_Selectable.prototype.select = function(index) {
            var prevIndex = this._index;
            _Window_Selectable_select.call(this, index);
            if (prevIndex !== index && this._cursorSprite && this.active) {
                this._cursorSprite.scale.x = 1.08;
                this._cursorSprite.scale.y = 1.08;
            }
        };

        var _Window_Selectable_updateCursor = Window_Selectable.prototype.updateCursor;
        Window_Selectable.prototype.updateCursor = function() {
            _Window_Selectable_updateCursor.call(this);
            if (this._cursorSprite) {
                if (this._cursorSprite.scale.x > 1.0) {
                    this._cursorSprite.scale.x = Math.max(1.0, this._cursorSprite.scale.x - 0.02);
                    this._cursorSprite.scale.y = Math.max(1.0, this._cursorSprite.scale.y - 0.02);
                }
            }
        };
    }

    // ========================================================================
    // 5. MAIN MENU (MOG_SceneMenu) DYNAMIC CARD & BUST BREATHING MOTION
    // ========================================================================
    var _MBustMenu_update = (typeof MBustMenu !== 'undefined') ? MBustMenu.prototype.update : null;
    if (_MBustMenu_update) {
        MBustMenu.prototype.update = function() {
            _MBustMenu_update.call(this);
            if (!enableCardBreathing) return;
            if (this._wait > 0) return;

            if (this._orgY === undefined && this._char) {
                this._orgY = this._char.y;
            }

            if (this._char && this._orgY !== undefined) {
                this._breatheTimer = (this._breatheTimer || 0) + 1;
                var isGhost = (this._actor && (this._actor._actorId === 3 || this._actor.name() === 'Saki'));

                if (isGhost && enableSakiGhostFloat) {
                    // Saki Ethereal Ghostly Float: bobbing higher + horizontal sway + opacity pulse
                    var bob = Math.sin(this._breatheTimer * 0.048 + this._index * 0.7) * 5.0;
                    var sway = Math.cos(this._breatheTimer * 0.028) * 2.0;
                    this._char.y = this._orgY + bob;
                    if (this._char.x >= this._orgX) {
                        this._char.x = this._orgX + sway;
                    }
                    var maxOpa = (typeof Moghunter !== 'undefined' && Moghunter.scMenu_CharOpacity) ? Number(Moghunter.scMenu_CharOpacity) : 255;
                    this._char.opacity = maxOpa * (0.88 + Math.sin(this._breatheTimer * 0.040) * 0.12);
                } else {
                    // Organic gentle breathing float for other party members
                    var bob = Math.sin(this._breatheTimer * 0.038 + this._index * 0.8) * 2.8;
                    this._char.y = this._orgY + bob;
                }
            }
        };
    }

    var _MCharStatus_update = (typeof MCharStatus !== 'undefined') ? MCharStatus.prototype.update : null;
    if (_MCharStatus_update) {
        MCharStatus.prototype.update = function() {
            _MCharStatus_update.call(this);
            if (!enableCardBreathing) return;
            if (!this._actor) return;

            this._breatheTimer = (this._breatheTimer || 0) + 1;
            var isGhost = (this._actor._actorId === 3 || this._actor.name() === 'Saki');
            var bobFreq = isGhost ? 0.048 : 0.038;
            var bobAmp = isGhost ? 3.0 : 2.0;

            // Synchronized gentle breathing float for entire status card
            this.y = Math.sin(this._breatheTimer * bobFreq + this._index * (isGhost ? 0.7 : 0.8)) * bobAmp;
        };
    }

    // ========================================================================
    // 6. MAIN MENU (MOG_SceneMenu) OCCULT SPIRIT EMBERS & DYNAMIC WHEEL BURST
    // ========================================================================
    function Sprite_MenuWheelEmbers() {
        this.initialize.apply(this, arguments);
    }
    Sprite_MenuWheelEmbers.prototype = Object.create(Sprite.prototype);
    Sprite_MenuWheelEmbers.prototype.constructor = Sprite_MenuWheelEmbers;

    Sprite_MenuWheelEmbers.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        var w = Graphics.boxWidth || 1280;
        var h = Graphics.boxHeight || 720;
        this.bitmap = new Bitmap(w, h);
        this.blendMode = Graphics.BLEND_ADD;
        this.opacity = 230;
        this._particles = [];
        this._maxParticles = 18;
        this.initAmbientParticles();
    };

    Sprite_MenuWheelEmbers.prototype.initAmbientParticles = function() {
        var colors = ['#38bdf8', '#c084fc', '#fbbf24', '#a855f7', '#67e8f9'];
        for (var i = 0; i < this._maxParticles; i++) {
            this._particles.push(this.createParticle(colors, true));
        }
    };

    Sprite_MenuWheelEmbers.prototype.createParticle = function(colors, randomizeAge) {
        colors = colors || ['#38bdf8', '#c084fc', '#fbbf24', '#a855f7', '#67e8f9'];
        var maxLife = 75 + Math.randomInt(50);
        var curLife = randomizeAge ? Math.randomInt(maxLife) : 0;
        return {
            x: 60 + Math.randomInt(200),
            y: 390 + Math.randomInt(260),
            vx: (Math.random() - 0.25) * 0.7,
            vy: -(0.6 + Math.random() * 0.9),
            size: 1.5 + Math.random() * 2.2,
            color: colors[Math.randomInt(colors.length)],
            life: curLife,
            maxLife: maxLife,
            isBurst: false
        };
    };

    Sprite_MenuWheelEmbers.prototype.burst = function(targetX, targetY) {
        var colors = ['#fbbf24', '#f59e0b', '#38bdf8', '#e0e7ff', '#c084fc'];
        var count = 8;
        for (var i = 0; i < count; i++) {
            var angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.4;
            var speed = 2.2 + Math.random() * 2.8;
            this._particles.push({
                x: targetX || 224,
                y: targetY || 544,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2.2 + Math.random() * 2.0,
                color: colors[Math.randomInt(colors.length)],
                life: 0,
                maxLife: 26 + Math.randomInt(14),
                isBurst: true
            });
        }
    };

    Sprite_MenuWheelEmbers.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this.bitmap) return;
        this.bitmap.clear();
        var ctx = this.bitmap._context;
        if (!ctx) return;

        for (var i = this._particles.length - 1; i >= 0; i--) {
            var p = this._particles[i];
            p.life++;
            p.x += p.vx;
            p.y += p.vy;

            var progress = p.life / p.maxLife;
            if (progress >= 1.0) {
                if (p.isBurst) {
                    this._particles.splice(i, 1);
                    continue;
                } else {
                    this._particles[i] = this.createParticle();
                    continue;
                }
            }

            var alpha = 1.0;
            if (p.isBurst) {
                alpha = 1.0 - progress;
                p.vx *= 0.93;
                p.vy *= 0.93;
            } else {
                alpha = Math.sin(progress * Math.PI);
                p.vx += Math.sin(p.life * 0.05) * 0.035;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.85));
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.size * 2.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.restore();
        }
        this.bitmap._setDirty();
    };

    var _Scene_Menu_updateCommands = (typeof Scene_Menu !== 'undefined') ? Scene_Menu.prototype.updateCommands : null;
    if (_Scene_Menu_updateCommands) {
        Scene_Menu.prototype.updateCommands = function() {
            _Scene_Menu_updateCommands.call(this);

            if (this._commands && this._commandWindow) {
                var activeIdx = this._commandWindow._index;
                if (this._lastActiveCommandIndex !== activeIdx) {
                    var prevIdx = this._lastActiveCommandIndex;
                    this._lastActiveCommandIndex = activeIdx;
                    if (prevIdx !== undefined && this._menuWheelEmbers && this._commands[activeIdx]) {
                        this._menuWheelEmbers.burst(this._commands[activeIdx].x, this._commands[activeIdx].y);
                    }
                }
            }
        };
    }

    // ========================================================================
    // 7. IN-GAME MENU HINT & GUIDE OVERLAY (Informative QoL Hints)
    // ========================================================================
    var _Scene_Menu_create_extras = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create_extras.call(this);
        this.createMenuWheelEmbers();
        this.createMenuGuideBar();
    };

    Scene_Menu.prototype.createMenuWheelEmbers = function() {
        this._menuWheelEmbers = new Sprite_MenuWheelEmbers();
        if (this._field) {
            this._field.addChild(this._menuWheelEmbers);
        } else {
            this.addChild(this._menuWheelEmbers);
        }
    };

    Scene_Menu.prototype.createMenuGuideBar = function() {
        var width = Graphics.boxWidth || 1280;
        var height = 34;
        var bmp = new Bitmap(width, height);
        bmp.fontSize = 15;
        bmp.textColor = '#ffffff';
        bmp.outlineColor = 'rgba(0, 0, 0, 0.85)';
        bmp.outlineWidth = 3;

        var text = "[P] Pohon Konstelasi   |   Equip Terintegrasi di Status & Skill   |   [ESC] Tutup";
        bmp.drawText(text, 0, 0, width - 30, height, 'right');

        this._menuGuideSprite = new Sprite(bmp);
        this._menuGuideSprite.x = 0;
        this._menuGuideSprite.y = (Graphics.boxHeight || 720) - height - 8;
        this._menuGuideSprite.opacity = 0;
        this.addChild(this._menuGuideSprite);
    };

    var _Scene_Menu_update_guide = Scene_Menu.prototype.update;
    Scene_Menu.prototype.update = function() {
        _Scene_Menu_update_guide.call(this);
        if (this._menuGuideSprite && this._menuGuideSprite.opacity < 215) {
            this._menuGuideSprite.opacity += 8;
        }
    };

})();
