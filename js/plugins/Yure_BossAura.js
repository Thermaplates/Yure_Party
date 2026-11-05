//=============================================================================
// Yure_BossAura.js
//=============================================================================
/*:
 * @plugindesc [v1.0] Efek Visual Asap, Aura, Bara Api, dan Mode Enrage/Awaken untuk Boss & Battler.
 * @author Yure Party Team
 *
 * @param --- Pengaturan Default ---
 * @default
 *
 * @param Default Rage Aura Type
 * @parent --- Pengaturan Default ---
 * @desc Tipe aura default saat Boss masuk mode Enrage (smoke, flame, dark, spark, glow).
 * @type select
 * @option Asap (Smoke)
 * @value smoke
 * @option Api / Bara (Flame)
 * @value flame
 * @option Kabut Gelap (Dark Mist)
 * @value dark
 * @option Percikan Listrik (Spark)
 * @value spark
 * @default smoke
 *
 * @param Default Rage Color
 * @parent --- Pengaturan Default ---
 * @desc Warna aura saat Rage dalam format HEX (Contoh: #ff2222 = Merah membara).
 * @type string
 * @default #ff2222
 *
 * @param Default Awaken Color
 * @parent --- Pengaturan Default ---
 * @desc Warna aura saat Awaken dalam format HEX (Contoh: #6a0dad = Ungu gelap).
 * @type string
 * @default #6a0dad
 *
 * @param Particle Density
 * @parent --- Pengaturan Default ---
 * @desc Kepadatan partikel asap/aura (0.5 = Sedikit, 1.0 = Normal, 2.0 = Lebat).
 * @type number
 * @decimals 2
 * @default 1.00
 *
 * @param Enable Glow Silhouette
 * @parent --- Pengaturan Default ---
 * @desc Nyalakan efek siluet cahaya berdenyut (Pulsing Glow) di belakang sprite Boss saat Enrage.
 * @type boolean
 * @default true
 *
 * @param --- Otomatis Enrage HP % ---
 * @default
 *
 * @param Auto Boss Enrage
 * @parent --- Otomatis Enrage HP % ---
 * @desc Otomatis memicu mode Enrage saat HP Boss turun di bawah ambang batas jika ada notetag <boss>.
 * @type boolean
 * @default true
 *
 * @param Default Rage HP Threshold
 * @parent --- Otomatis Enrage HP % ---
 * @desc Persentase HP (%) untuk memicu mode Enrage jika tidak ditentukan di notetag musuh.
 * @type number
 * @default 50
 *
 * @param Enrage SE
 * @parent --- Otomatis Enrage HP % ---
 * @desc Sound effect yang diputar saat Boss masuk mode Enrage/Awaken.
 * @type file
 * @dir audio/se/
 * @default Collapse1
 *
 * @param Enrage Flash Screen
 * @parent --- Otomatis Enrage HP % ---
 * @desc Efek kilatan layar saat Enrage (R, G, B, Alpha, Frame). Kosongkan jika tidak mau flash.
 * @type string
 * @default 255, 0, 0, 160, 30
 *
 * @param Enrage Screen Shake
 * @parent --- Otomatis Enrage HP % ---
 * @desc Efek getaran layar saat Enrage (Power, Speed, Duration). Kosongkan jika tidak mau shake.
 * @type string
 * @default 6, 6, 30
 *
 * @help
 * ============================================================================
 * SISTEM EFEK VISUAL ASAP & AURA BATTALER / BOSS (YURE BOSS AURA)
 * ============================================================================
 * 
 * Plugin ini menghadirkan sistem partikel visual real-time (PixiJS 60 FPS)
 * yang ringan dan tanpa membutuhkan file gambar tambahan (Zero-Asset).
 *
 * Tipe Efek yang Didukung:
 * - smoke : Asap mengepul ke atas (Cocok untuk Enrage / Kemarahan)
 * - flame : Bara api menyala melayang cepat
 * - dark  : Kabut kegelapan mistis (Cocok untuk Awaken / Phase 2)
 * - spark : Percikan kilat listrik
 * - holy  : Partikel cahaya suci berkilau
 *
 * ----------------------------------------------------------------------------
 * 1. MENGGUNAKAN NOTETAG DI STATE (DATABASE STATES)
 * ----------------------------------------------------------------------------
 * Berikan notetag berikut pada kolom Note di State tertentu:
 *
 *   <aura: smoke, #ff2222>
 *   -> Memunculkan asap merah mengepul saat battler terkena state ini.
 *
 *   <aura: dark, #440066>
 *   -> Memunculkan kabut ungu kehitaman (Awaken).
 *
 *   <aura: flame, #ff7700>
 *   -> Memunculkan bara api membara.
 *
 *   <aura: spark, #ffff00>
 *   -> Memunculkan percikan listrik kuning.
 *
 *   <aura_glow: #ff2222>
 *   -> Menambahkan siluet cahaya berdenyut di belakang sprite.
 *
 *   <aura_anim: 45>
 *   -> Memutar animasi database ID 45 secara berulang (loop) di atas sprite.
 *
 * ----------------------------------------------------------------------------
 * 2. MENGGUNAKAN NOTETAG PADA MUSUH / BOSS (DATABASE ENEMIES)
 * ----------------------------------------------------------------------------
 * Berikan notetag berikut pada Musuh/Boss:
 *
 *   <boss_aura: smoke, #ff2222>
 *   -> Musuh ini selalu diselimuti asap merah sejak awal pertarungan.
 *
 *   <rage_hp: 50%>
 *   <rage_aura: smoke, #ff1100>
 *   <rage_glow: #ff0000>
 *   <rage_state: 7>
 *   <rage_se: Roar>
 *   <rage_msg: AWAKEN! BOSS MEMASUKI FASE RAGE!>
 *   -> Saat HP Boss di bawah 50%, Boss otomatis memasuki fase Enrage:
 *      - Asap merah & siluet menyala muncul
 *      - State 7 (Rage) otomatis diberikan ke boss
 *      - Memutar suara SE Roar & efek layar bergetar / kilatan merah!
 *
 * ----------------------------------------------------------------------------
 * 3. PLUGIN COMMANDS
 * ----------------------------------------------------------------------------
 * - SetBattlerAura enemy [index] [type] [color]
 *   Contoh: SetBattlerAura enemy 1 smoke #ff0000
 *   Contoh: SetBattlerAura actor 1 flame #00ffff
 *
 * - ClearBattlerAura enemy [index]
 *   Contoh: ClearBattlerAura enemy 1
 *
 * - SetBattlerGlow enemy [index] [color]
 *   Contoh: SetBattlerGlow enemy 1 #ff2200
 *
 * - ClearBattlerGlow enemy [index]
 *   Contoh: ClearBattlerGlow enemy 1
 *
 * - SetBossRage enemy [index] [true/false]
 *   Contoh: SetBossRage enemy 1 true
 *
 * ----------------------------------------------------------------------------
 * 4. SCRIPT CALLS (JAVASCRIPT)
 * ----------------------------------------------------------------------------
 * - BattlerAuraManager.setAura(battler, 'smoke', '#ff2200');
 * - BattlerAuraManager.setGlow(battler, '#ff0000');
 * - BattlerAuraManager.clearAura(battler);
 * - BattlerAuraManager.triggerRage(enemy);
 */

var Imported = Imported || {};
Imported.Yure_BossAura = true;

var BattlerAuraManager = BattlerAuraManager || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_BossAura');
    var defaultRageType = String(parameters['Default Rage Aura Type'] || 'smoke');
    var defaultRageColor = String(parameters['Default Rage Color'] || '#ff2222');
    var defaultAwakenColor = String(parameters['Default Awaken Color'] || '#6a0dad');
    var globalParticleDensity = Number(parameters['Particle Density'] || 1.0);
    var enableGlowSilhouette = (parameters['Enable Glow Silhouette'] !== 'false');

    var autoBossEnrage = (parameters['Auto Boss Enrage'] !== 'false');
    var defaultRageHpThreshold = Number(parameters['Default Rage HP Threshold'] || 50);
    var enrageSE = String(parameters['Enrage SE'] || 'Collapse1');
    var enrageFlashParam = String(parameters['Enrage Flash Screen'] || '255, 0, 0, 160, 30');
    var enrageShakeParam = String(parameters['Enrage Screen Shake'] || '6, 6, 30');

    // ============================================================================
    // 1. PROCEDURAL BITMAP GENERATOR (ZERO ASSETS)
    // ============================================================================
    var _bitmapCache = {};

    BattlerAuraManager.colorToHex = function(colorStr) {
        if (!colorStr) return 0xffffff;
        var c = colorStr.trim().toLowerCase();
        if (c === 'red') return 0xff2222;
        if (c === 'dark' || c === 'purple') return 0x7700aa;
        if (c === 'blue' || c === 'cyan') return 0x00c8ff;
        if (c === 'flame' || c === 'orange') return 0xff6600;
        if (c === 'gold' || c === 'yellow') return 0xffd700;
        if (c === 'green') return 0x22ff55;
        if (c === 'black') return 0x111111;
        if (c === 'white') return 0xffffff;
        if (c.indexOf('#') === 0) {
            return parseInt(c.slice(1), 16);
        }
        return 0xffffff;
    };

    BattlerAuraManager.getSmokeBitmap = function() {
        if (_bitmapCache.smoke) return _bitmapCache.smoke;
        var bmp = new Bitmap(64, 64);
        var ctx = bmp.context;
        var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.55)');
        grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.18)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
        bmp._setDirty();
        _bitmapCache.smoke = bmp;
        return _bitmapCache.smoke;
    };

    BattlerAuraManager.getFlameBitmap = function() {
        if (_bitmapCache.flame) return _bitmapCache.flame;
        var bmp = new Bitmap(48, 64);
        var ctx = bmp.context;
        var grad = ctx.createRadialGradient(24, 38, 2, 24, 34, 28);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.65)');
        grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.2)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(24, 34, 18, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        bmp._setDirty();
        _bitmapCache.flame = bmp;
        return _bitmapCache.flame;
    };

    BattlerAuraManager.getSparkBitmap = function() {
        if (_bitmapCache.spark) return _bitmapCache.spark;
        var bmp = new Bitmap(32, 32);
        var ctx = bmp.context;
        var grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();
        // Cross rays
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(16, 2); ctx.lineTo(16, 30);
        ctx.moveTo(2, 16); ctx.lineTo(30, 16);
        ctx.stroke();
        bmp._setDirty();
        _bitmapCache.spark = bmp;
        return _bitmapCache.spark;
    };

    BattlerAuraManager.getDarkBitmap = function() {
        if (_bitmapCache.dark) return _bitmapCache.dark;
        var bmp = new Bitmap(64, 64);
        var ctx = bmp.context;
        var grad = ctx.createRadialGradient(32, 32, 6, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.5)');
        grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
        bmp._setDirty();
        _bitmapCache.dark = bmp;
        return _bitmapCache.dark;
    };

    BattlerAuraManager.getGlowBitmap = function() {
        if (_bitmapCache.glow) return _bitmapCache.glow;
        var bmp = new Bitmap(128, 128);
        var ctx = bmp.context;
        var grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
        grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.08)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.fill();
        bmp._setDirty();
        _bitmapCache.glow = bmp;
        return _bitmapCache.glow;
    };

    BattlerAuraManager.getStarBitmap = function() {
        if (_bitmapCache.star) return _bitmapCache.star;
        var bmp = new Bitmap(32, 32);
        var ctx = bmp.context;
        var cx = 16, cy = 16, outerRadius = 12, innerRadius = 5.5;
        var rot = Math.PI / 2 * 3;
        var step = Math.PI / 5;

        // Glow halo
        var grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 240, 100, 0.8)');
        grad.addColorStop(0.5, 'rgba(255, 200, 30, 0.35)');
        grad.addColorStop(1, 'rgba(255, 180, 0, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();

        // 5-Point Star
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (var i = 0; i < 5; i++) {
            var x = cx + Math.cos(rot) * outerRadius;
            var y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = '#fff466';
        ctx.fill();
        ctx.strokeStyle = '#ffae00';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        bmp._setDirty();
        _bitmapCache.star = bmp;
        return _bitmapCache.star;
    };

    // ============================================================================
    // 2. BATTLER AURA / PARTICLE SPRITE COMPONENT
    // ============================================================================
    function Sprite_BattlerAura() {
        this.initialize.apply(this, arguments);
    }

    Sprite_BattlerAura.prototype = Object.create(Sprite.prototype);
    Sprite_BattlerAura.prototype.constructor = Sprite_BattlerAura;

    Sprite_BattlerAura.prototype.initialize = function(parentBattlerSprite) {
        Sprite.prototype.initialize.call(this);
        this._parentSprite = parentBattlerSprite;
        this._particles = [];
        this._maxParticles = 35;
        this._tickCount = 0;
        this._animTimer = 0;

        // Container partikel
        this._particleContainer = new Sprite();
        this.addChild(this._particleContainer);

        // Background Glow Sprite (Pulsing silhouette)
        this._glowSprite = new Sprite(BattlerAuraManager.getGlowBitmap());
        this._glowSprite.anchor.x = 0.5;
        this._glowSprite.anchor.y = 0.5;
        this._glowSprite.visible = false;
        this._glowSprite.blendMode = PIXI.blendModes.ADD;
        this.addChildAt(this._glowSprite, 0);

        // Container Bintang Stun (Dizzy Stars)
        this._starContainer = new Sprite();
        this._starContainer.visible = false;
        this._starSprites = [];
        for (var s = 0; s < 4; s++) {
            var star = new Sprite(BattlerAuraManager.getStarBitmap());
            star.anchor.x = 0.5;
            star.anchor.y = 0.5;
            star.blendMode = PIXI.blendModes.ADD;
            this._starSprites.push(star);
            this._starContainer.addChild(star);
        }
        this.addChild(this._starContainer);

        this.createParticlePool();
    };

    Sprite_BattlerAura.prototype.createParticlePool = function() {
        for (var i = 0; i < this._maxParticles; i++) {
            var p = new Sprite(BattlerAuraManager.getSmokeBitmap());
            p.anchor.x = 0.5;
            p.anchor.y = 0.5;
            p.visible = false;
            p.active = false;
            p.life = 0;
            p.maxLife = 60;
            p.vx = 0;
            p.vy = 0;
            p.scaleSpeed = 0;
            p.rotSpeed = 0;
            p.maxAlpha = 0.5;
            this._particles.push(p);
            this._particleContainer.addChild(p);
        }
    };

    Sprite_BattlerAura.prototype.getBattler = function() {
        return this._parentSprite ? this._parentSprite._battler : null;
    };

    Sprite_BattlerAura.prototype.update = function() {
        Sprite.prototype.update.call(this);
        var battler = this.getBattler();
        if (!battler || battler.isDead() || !this._parentSprite.visible || this._parentSprite.opacity <= 0) {
            this.clearAll();
            return;
        }

        this._tickCount++;
        var auraData = this.resolveAuraData(battler);

        if (auraData.active) {
            this.updateGlow(auraData);
            this.updateSpawn(auraData);
            this.updateAnimationLoop(battler, auraData);
        } else {
            this._glowSprite.visible = false;
        }

        this.updateActiveParticles();
        this.updateStunStars(battler);
    };

    Sprite_BattlerAura.prototype.resolveAuraData = function(battler) {
        var data = {
            active: false,
            type: 'smoke',
            color: defaultRageColor,
            glowColor: null,
            blend: 'add',
            density: globalParticleDensity,
            animId: 0
        };

        // 1. Cek Manual Overrides (via Script/Plugin Command)
        if (battler._customAura) {
            data.active = true;
            data.type = battler._customAura.type || 'smoke';
            data.color = battler._customAura.color || defaultRageColor;
            data.blend = battler._customAura.blend || 'add';
            data.density = battler._customAura.density || globalParticleDensity;
        }
        if (battler._customGlow) {
            data.glowColor = battler._customGlow;
        }

        // 2. Cek Active States pada Battler
        var states = battler.states();
        for (var i = 0; i < states.length; i++) {
            var st = states[i];
            if (!st) continue;
            var note = st.note;
            if (note) {
                // <aura: type, color, blend, density>
                var matchAura = note.match(/<aura:[ ]*([^,>]+)(?:,[ ]*([^,>]+))?(?:,[ ]*([^,>]+))?(?:,[ ]*([^,>]+))?>/i);
                if (matchAura) {
                    data.active = true;
                    data.type = matchAura[1].trim().toLowerCase();
                    if (matchAura[2]) data.color = matchAura[2].trim();
                    if (matchAura[3]) data.blend = matchAura[3].trim().toLowerCase();
                    if (matchAura[4]) data.density = Number(matchAura[4]) || 1.0;
                }
                var matchGlow = note.match(/<aura_glow:[ ]*([^>]+)>/i);
                if (matchGlow) {
                    data.glowColor = matchGlow[1].trim();
                }
                var matchAnim = note.match(/<aura_anim:[ ]*(\d+)>/i);
                if (matchAnim) {
                    data.animId = Number(matchAnim[1]);
                }
            }
        }

        // 3. Cek Enrage / Boss Data pada Enemy
        if (battler.isEnemy()) {
            var enemy = battler.enemy();
            if (enemy && enemy.note) {
                // Static Boss Aura (misal untuk Boss Fase 2)
                var matchBossAura = enemy.note.match(/<boss_aura:[ ]*([^,>]+)(?:,[ ]*([^,>]+))?>/i);
                if (matchBossAura) {
                    data.active = true;
                    data.type = matchBossAura[1].trim().toLowerCase();
                    if (matchBossAura[2]) data.color = matchBossAura[2].trim();
                }
                var matchBossGlow = enemy.note.match(/<boss_glow:[ ]*([^>]+)>/i);
                if (matchBossGlow) {
                    data.glowColor = matchBossGlow[1].trim();
                } else if (enableGlowSilhouette && matchBossAura && !data.glowColor) {
                    data.glowColor = data.color;
                }

                // Enraged State Aura
                if (battler._isEnraged) {
                    data.active = true;
                    var matchRageAura = enemy.note.match(/<rage_aura:[ ]*([^,>]+)(?:,[ ]*([^,>]+))?>/i);
                    if (matchRageAura) {
                        data.type = matchRageAura[1].trim().toLowerCase();
                        if (matchRageAura[2]) data.color = matchRageAura[2].trim();
                    } else if (!matchBossAura) {
                        data.type = defaultRageType;
                        data.color = defaultRageColor;
                    }
                    var matchRageGlow = enemy.note.match(/<rage_glow:[ ]*([^>]+)>/i);
                    if (matchRageGlow) {
                        data.glowColor = matchRageGlow[1].trim();
                    } else if (enableGlowSilhouette && !data.glowColor) {
                        data.glowColor = data.color;
                    }
                }
            }
        }

        return data;
    };

    Sprite_BattlerAura.prototype.updateGlow = function(auraData) {
        if (!enableGlowSilhouette || !auraData.glowColor) {
            this._glowSprite.visible = false;
            return;
        }

        this._glowSprite.visible = true;
        this._glowSprite.tint = BattlerAuraManager.colorToHex(auraData.glowColor);

        var bounds = this.getBattlerDimensions();
        var pulse = Math.sin(this._tickCount * 0.08) * 0.08;
        var scaleX = (bounds.width / 100) * 1.5 + pulse;
        var scaleY = (bounds.height / 100) * 1.5 + pulse;

        this._glowSprite.scale.x = scaleX;
        this._glowSprite.scale.y = scaleY;
        this._glowSprite.x = bounds.centerX;
        this._glowSprite.y = bounds.centerY;
        this._glowSprite.alpha = 0.35 + Math.sin(this._tickCount * 0.08) * 0.15;
    };

    Sprite_BattlerAura.prototype.getBattlerDimensions = function() {
        var w = 120;
        var h = 140;
        var anchorX = 0.5;
        var anchorY = 1.0;

        if (this._parentSprite) {
            if (this._parentSprite.bitmap && this._parentSprite.bitmap.width > 0) {
                w = this._parentSprite.bitmap.width;
                h = this._parentSprite.bitmap.height;
            } else if (this._parentSprite.width > 0) {
                w = this._parentSprite.width;
                h = this._parentSprite.height;
            }
            if (this._parentSprite.anchor) {
                anchorX = this._parentSprite.anchor.x;
                anchorY = this._parentSprite.anchor.y;
            }
        }

        var feetY = (1.0 - anchorY) * h;
        var topY = -anchorY * h;
        var centerY = topY + (h * 0.5);
        var centerX = (0.5 - anchorX) * w;

        return {
            width: w,
            height: h,
            feetY: feetY,
            topY: topY,
            centerX: centerX,
            centerY: centerY
        };
    };

    Sprite_BattlerAura.prototype.updateSpawn = function(auraData) {
        var spawnRate = Math.max(1, Math.round(3 / (auraData.density || 1.0)));
        if (this._tickCount % spawnRate !== 0) return;

        var p = this.getFreeParticle();
        if (!p) return;

        var bounds = this.getBattlerDimensions();
        var type = auraData.type;
        var hexColor = BattlerAuraManager.colorToHex(auraData.color);

        // Pilih bitmap sesuai tipe
        if (type === 'flame') {
            p.bitmap = BattlerAuraManager.getFlameBitmap();
            p.blendMode = PIXI.blendModes.ADD;
            p.maxLife = 30 + Math.random() * 20;
            p.vy = -(2.5 + Math.random() * 2.0);
            p.vx = (Math.random() - 0.5) * 1.2;
            p.scaleSpeed = -(0.01 + Math.random() * 0.01);
            p.initialScale = 0.7 + Math.random() * 0.5;
            p.maxAlpha = 0.7 + Math.random() * 0.3;
        } else if (type === 'dark') {
            p.bitmap = BattlerAuraManager.getDarkBitmap();
            p.blendMode = (auraData.blend === 'normal') ? PIXI.blendModes.NORMAL : PIXI.blendModes.ADD;
            p.maxLife = 50 + Math.random() * 30;
            p.vy = -(1.0 + Math.random() * 1.2);
            p.vx = (Math.random() - 0.5) * 1.5;
            p.scaleSpeed = 0.015 + Math.random() * 0.01;
            p.initialScale = 0.6 + Math.random() * 0.6;
            p.maxAlpha = 0.6 + Math.random() * 0.3;
        } else if (type === 'spark') {
            p.bitmap = BattlerAuraManager.getSparkBitmap();
            p.blendMode = PIXI.blendModes.ADD;
            p.maxLife = 20 + Math.random() * 15;
            p.vy = -(1.5 + Math.random() * 3.0);
            p.vx = (Math.random() - 0.5) * 3.0;
            p.scaleSpeed = -0.02;
            p.initialScale = 0.6 + Math.random() * 0.8;
            p.maxAlpha = 0.9;
        } else {
            // Default: Smoke / Asap
            p.bitmap = BattlerAuraManager.getSmokeBitmap();
            p.blendMode = (auraData.blend === 'normal') ? PIXI.blendModes.NORMAL : PIXI.blendModes.ADD;
            p.maxLife = 55 + Math.random() * 25;
            p.vy = -(1.2 + Math.random() * 1.5);
            p.vx = (Math.random() - 0.5) * 1.2;
            p.scaleSpeed = 0.02 + Math.random() * 0.015;
            p.initialScale = 0.4 + Math.random() * 0.4;
            p.maxAlpha = 0.55 + Math.random() * 0.25;
        }

        // Posisi spawn di sekitar badan/bawah battler
        var spawnSpreadX = bounds.width * 0.45;
        p.x = bounds.centerX + (Math.random() - 0.5) * (spawnSpreadX * 2);
        p.y = bounds.feetY - (Math.random() * (bounds.height * 0.3));
        p.scale.x = p.initialScale;
        p.scale.y = p.initialScale;
        p.rotation = Math.random() * Math.PI * 2;
        p.rotSpeed = (Math.random() - 0.5) * 0.04;
        p.tint = hexColor;
        p.alpha = 0;
        p.life = p.maxLife;
        p.active = true;
        p.visible = true;
    };

    Sprite_BattlerAura.prototype.getFreeParticle = function() {
        for (var i = 0; i < this._particles.length; i++) {
            if (!this._particles[i].active) {
                return this._particles[i];
            }
        }
        return null;
    };

    Sprite_BattlerAura.prototype.updateActiveParticles = function() {
        for (var i = 0; i < this._particles.length; i++) {
            var p = this._particles[i];
            if (!p.active) continue;

            p.life--;
            if (p.life <= 0) {
                p.active = false;
                p.visible = false;
                continue;
            }

            p.x += p.vx + Math.sin(p.life * 0.15) * 0.3;
            p.y += p.vy;
            p.scale.x = Math.max(0.01, p.scale.x + p.scaleSpeed);
            p.scale.y = p.scale.x;
            p.rotation += p.rotSpeed;

            // Fade In & Fade Out curve
            var progress = 1.0 - (p.life / p.maxLife);
            if (progress < 0.2) {
                p.alpha = (progress / 0.2) * p.maxAlpha;
            } else {
                p.alpha = (1.0 - progress) / 0.8 * p.maxAlpha;
            }
        }
    };

    Sprite_BattlerAura.prototype.updateAnimationLoop = function(battler, auraData) {
        if (!auraData.animId || auraData.animId <= 0) return;
        this._animTimer++;
        if (this._animTimer >= 55) {
            this._animTimer = 0;
            if (battler && !battler.isAnimationPlaying()) {
                battler.startAnimation(auraData.animId, false, 0);
            }
        }
    };

    Sprite_BattlerAura.prototype.isBattlerStunned = function(battler) {
        if (!battler) return false;
        // Cek ID State 11 atau State 10 atau State Stun
        if (battler.isStateAffected(11) || battler.isStateAffected(10)) return true;
        var states = battler.states();
        for (var i = 0; i < states.length; i++) {
            var st = states[i];
            if (!st) continue;
            if (st.name && st.name.match(/stun/i)) return true;
            if (st.note && st.note.match(/<(?:stun_stars|stars|aura:[ ]*stars?)>/i)) return true;
        }
        return false;
    };

    Sprite_BattlerAura.prototype.updateStunStars = function(battler) {
        if (!this._starContainer) return;
        var isStunned = this.isBattlerStunned(battler);

        if (!isStunned) {
            this._starContainer.visible = false;
            return;
        }

        this._starContainer.visible = true;
        var bounds = this.getBattlerDimensions();
        var rx = Math.max(24, bounds.width * 0.35);
        var ry = Math.max(8, rx * 0.32);
        var headY = bounds.topY - 14;

        for (var i = 0; i < this._starSprites.length; i++) {
            var star = this._starSprites[i];
            star.visible = true;
            var angle = (this._tickCount * 0.055) + (i * (Math.PI * 2 / this._starSprites.length));
            star.x = bounds.centerX + Math.cos(angle) * rx;
            star.y = headY + Math.sin(angle) * ry;

            // 3D Depth scaling & transparency
            var depth = (Math.sin(angle) + 1.0) * 0.5;
            star.scale.x = 0.55 + depth * 0.35;
            star.scale.y = star.scale.x;
            star.alpha = 0.45 + depth * 0.55;
            star.rotation += 0.08;
        }
    };

    Sprite_BattlerAura.prototype.clearAll = function() {
        if (this._glowSprite) this._glowSprite.visible = false;
        if (this._starContainer) this._starContainer.visible = false;
        for (var i = 0; i < this._particles.length; i++) {
            this._particles[i].active = false;
            this._particles[i].visible = false;
        }
    };

    // ============================================================================
    // 3. HOOK SPRITE_BATTLER & SPRITE_ENEMY
    // ============================================================================
    var _Sprite_Battler_initMembers = Sprite_Battler.prototype.initMembers;
    Sprite_Battler.prototype.initMembers = function() {
        _Sprite_Battler_initMembers.call(this);
        this.createAuraComponent();
    };

    Sprite_Battler.prototype.createAuraComponent = function() {
        if (!this._battlerAura) {
            this._battlerAura = new Sprite_BattlerAura(this);
            this.addChildAt(this._battlerAura, 0);
        }
    };

    var _Sprite_Battler_update = Sprite_Battler.prototype.update;
    Sprite_Battler.prototype.update = function() {
        _Sprite_Battler_update.call(this);
        if (!this._battlerAura) {
            this.createAuraComponent();
        }
    };

    // ============================================================================
    // 4. AUTO ENRAGE & AWAKEN LOGIC
    // ============================================================================
    BattlerAuraManager.triggerRage = function(enemy) {
        if (!enemy || enemy._isEnraged || enemy._rageTriggered) return;
        enemy._isEnraged = true;
        enemy._rageTriggered = true; // Kunci agar animasi flash, SE, dan shake hanya muncul 1x seumur hidup

        var note = enemy.enemy() ? enemy.enemy().note : '';

        // Play SE
        var matchSe = note.match(/<rage_se:[ ]*([^,>]+)(?:,[ ]*(\d+))?(?:,[ ]*(\d+))?>/i);
        var seName = matchSe ? matchSe[1].trim() : enrageSE;
        var seVol = matchSe && matchSe[2] ? Number(matchSe[2]) : 100;
        var sePitch = matchSe && matchSe[3] ? Number(matchSe[3]) : 100;
        if (seName && seName.trim() !== '') {
            AudioManager.playSe({ name: seName.trim(), volume: seVol, pitch: sePitch, pan: 0 });
        }

        // Screen Flash
        var flashStr = enrageFlashParam;
        var matchFlash = note.match(/<rage_flash:[ ]*([^>]+)>/i);
        if (matchFlash) flashStr = matchFlash[1];
        if (flashStr && flashStr.trim() !== '' && $gameScreen) {
            var fArr = flashStr.split(',').map(function(s) { return Number(s.trim()); });
            if (fArr.length >= 4) {
                var r = fArr[0], g = fArr[1], b = fArr[2], a = fArr[3], d = fArr[4] || 30;
                $gameScreen.startFlash([r, g, b, a], d);
            }
        }

        // Screen Shake
        var shakeStr = enrageShakeParam;
        var matchShake = note.match(/<rage_shake:[ ]*([^>]+)>/i);
        if (matchShake) shakeStr = matchShake[1];
        if (shakeStr && shakeStr.trim() !== '' && $gameScreen) {
            var sArr = shakeStr.split(',').map(function(s) { return Number(s.trim()); });
            if (sArr.length >= 2) {
                var p = sArr[0], sp = sArr[1], dur = sArr[2] || 30;
                $gameScreen.startShake(p, sp, dur);
            }
        }

        // Apply State
        var matchState = note.match(/<rage_state:[ ]*(\d+)>/i);
        if (matchState) {
            var stateId = Number(matchState[1]);
            if (stateId > 0 && typeof enemy.addState === 'function') {
                enemy.addState(stateId);
            }
        }

        // Show Log Notification if Yure_BattleLog is active
        var matchMsg = note.match(/<rage_msg:[ ]*([^>]+)>/i);
        var msgText = matchMsg ? matchMsg[1].trim() : (enemy.name() + ' telah memasuki mode RAGE / AWAKEN!');
        if (typeof BattleLogNotifier !== 'undefined' && BattleLogNotifier.pushSpecial) {
            BattleLogNotifier.pushSpecial('AWAKEN', msgText, '#ff2222');
        }
    };

    BattlerAuraManager.checkEnemyRage = function(enemy) {
        if (!autoBossEnrage || !enemy || enemy.isDead() || enemy._isEnraged || enemy._rageTriggered) return;
        var rawEnemy = enemy.enemy();
        if (!rawEnemy || !rawEnemy.note) return;

        var note = rawEnemy.note;
        var isBoss = note.match(/<boss>/i);
        var matchHp = note.match(/<(?:rage_hp|awaken_hp):[ ]*(\d+)%?>/i);

        if (matchHp || isBoss) {
            var threshold = matchHp ? Number(matchHp[1]) : defaultRageHpThreshold;
            var currentHpRate = (enemy.hp / enemy.mhp) * 100;
            if (currentHpRate <= threshold) {
                BattlerAuraManager.triggerRage(enemy);
            }
        }
    };

    // Check Enrage whenever enemy takes damage or recovers
    var _Game_Enemy_refresh = Game_Enemy.prototype.refresh;
    Game_Enemy.prototype.refresh = function() {
        _Game_Enemy_refresh.call(this);
        BattlerAuraManager.checkEnemyRage(this);
    };

    var _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);
        this._isEnraged = false;
        this._rageTriggered = false;
        this._customAura = null;
        this._customGlow = null;
    };

    // Saat boss bertransformasi ke wujud/sprite Fase 2 (Enemy Transform)
    var _Game_Enemy_transform = Game_Enemy.prototype.transform;
    Game_Enemy.prototype.transform = function(enemyId) {
        _Game_Enemy_transform.call(this, enemyId);
        BattlerAuraManager.checkEnemyRage(this);
    };

    // Saat boss baru muncul di tengah pertarungan (Enemy Appear)
    var _Game_Enemy_appear = Game_Enemy.prototype.appear;
    Game_Enemy.prototype.appear = function() {
        _Game_Enemy_appear.call(this);
        BattlerAuraManager.checkEnemyRage(this);
    };

    // Reset aura on battle start / end
    var _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
    Game_BattlerBase.prototype.initMembers = function() {
        _Game_BattlerBase_initMembers.call(this);
        this._isEnraged = false;
        this._rageTriggered = false;
        this._customAura = null;
        this._customGlow = null;
    };

    // ============================================================================
    // 5. PUBLIC API & PLUGIN COMMANDS
    // ============================================================================
    BattlerAuraManager.setAura = function(battler, type, color, blend, density) {
        if (!battler) return;
        battler._customAura = {
            type: type || 'smoke',
            color: color || defaultRageColor,
            blend: blend || 'add',
            density: density || globalParticleDensity
        };
    };

    BattlerAuraManager.setGlow = function(battler, color) {
        if (!battler) return;
        battler._customGlow = color || defaultRageColor;
    };

    BattlerAuraManager.clearAura = function(battler) {
        if (!battler) return;
        battler._customAura = null;
        battler._customGlow = null;
    };

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        var cmd = command.toLowerCase();
        if (cmd === 'setbattleraura') {
            var targetType = String(args[0] || 'enemy').toLowerCase();
            var targetIndex = Number(args[1] || 1) - 1;
            var auraType = String(args[2] || 'smoke');
            var auraColor = String(args[3] || defaultRageColor);
            var blend = String(args[4] || 'add');

            var battler = null;
            if (targetType === 'enemy' && $gameTroop) {
                battler = $gameTroop.members()[targetIndex];
            } else if (targetType === 'actor' && $gameParty) {
                battler = $gameParty.members()[targetIndex];
            }

            if (battler) {
                BattlerAuraManager.setAura(battler, auraType, auraColor, blend);
            }
        } else if (cmd === 'clearbattleraura') {
            var targetType = String(args[0] || 'enemy').toLowerCase();
            var targetIndex = Number(args[1] || 1) - 1;
            var battler = (targetType === 'enemy' && $gameTroop) ? $gameTroop.members()[targetIndex] : ($gameParty ? $gameParty.members()[targetIndex] : null);
            if (battler) BattlerAuraManager.clearAura(battler);
        } else if (cmd === 'setbattlerglow') {
            var targetType = String(args[0] || 'enemy').toLowerCase();
            var targetIndex = Number(args[1] || 1) - 1;
            var glowColor = String(args[2] || defaultRageColor);
            var battler = (targetType === 'enemy' && $gameTroop) ? $gameTroop.members()[targetIndex] : ($gameParty ? $gameParty.members()[targetIndex] : null);
            if (battler) BattlerAuraManager.setGlow(battler, glowColor);
        } else if (cmd === 'clearbattlerglow') {
            var targetType = String(args[0] || 'enemy').toLowerCase();
            var targetIndex = Number(args[1] || 1) - 1;
            var battler = (targetType === 'enemy' && $gameTroop) ? $gameTroop.members()[targetIndex] : ($gameParty ? $gameParty.members()[targetIndex] : null);
            if (battler) battler._customGlow = null;
        } else if (cmd === 'setbossrage') {
            var targetIndex = Number(args[0] || 1) - 1;
            var state = (args[1] !== 'false');
            if ($gameTroop && $gameTroop.members()[targetIndex]) {
                var enemy = $gameTroop.members()[targetIndex];
                if (state) {
                    BattlerAuraManager.triggerRage(enemy);
                } else {
                    enemy._isEnraged = false;
                }
            }
        }
    };

})();
