//=============================================================================
// Yure_DynamicBattlefield.js
//=============================================================================
/*:
 * @plugindesc [v1.0] Efek Jiggle Musuh, Animasi Ghost Melayang, dan Atmosfer Battlefield Dinamis.
 * @author Yure Party Team
 *
 * @param --- Pengaturan Jiggle & Breathing ---
 * @default
 *
 * @param Enable Enemy Jiggle
 * @parent --- Pengaturan Jiggle & Breathing ---
 * @desc Aktifkan animasi nafas / jiggle halus untuk semua musuh di battle.
 * @type boolean
 * @default true
 *
 * @param Jiggle Speed
 * @parent --- Pengaturan Jiggle & Breathing ---
 * @desc Kecepatan animasi bernafas/jiggle musuh.
 * @type number
 * @decimals 3
 * @default 0.045
 *
 * @param Jiggle Strength
 * @parent --- Pengaturan Jiggle & Breathing ---
 * @desc Kekuatan squash & stretch (0.02 = Halus, 0.04 = Terasa, 0.08 = Elastis).
 * @type number
 * @decimals 3
 * @default 0.025
 *
 * @param Hit Reaction Spring
 * @parent --- Pengaturan Jiggle & Breathing ---
 * @desc Efek membal (Squash & Stretch Recoil) saat musuh terkena serangan / damage.
 * @type boolean
 * @default true
 *
 * @param --- Pengaturan Musuh Ghost / Melayang ---
 * @default
 *
 * @param Default Ghost Float Height
 * @parent --- Pengaturan Musuh Ghost / Melayang ---
 * @desc Tinggi melayang naik-turun musuh bertipe Ghost (dalam pixel).
 * @type number
 * @default 16
 *
 * @param Default Ghost Float Speed
 * @parent --- Pengaturan Musuh Ghost / Melayang ---
 * @desc Kecepatan melayang naik-turun musuh Ghost.
 * @type number
 * @decimals 3
 * @default 0.040
 *
 * @param Ghost Swaying
 * @parent --- Pengaturan Musuh Ghost / Melayang ---
 * @desc Efek meliuk/miring halus ke kiri-kanan saat melayang.
 * @type boolean
 * @default true
 *
 * @param Ghost Opacity Pulse
 * @parent --- Pengaturan Musuh Ghost / Melayang ---
 * @desc Efek denyut transparansi semi-ghaib pada musuh Ghost.
 * @type boolean
 * @default true
 *
 * @param Ghost Phantom Trail
 * @parent --- Pengaturan Musuh Ghost / Melayang ---
 * @desc Efek bayangan ghaib berjejak (After-Image / Trail) di belakang tubuh Ghost.
 * @type boolean
 * @default true
 *
 * @param --- Pengaturan Atmosfer Battlefield ---
 * @default
 *
 * @param Battle Ambient Particles
 * @parent --- Pengaturan Atmosfer Battlefield ---
 * @desc Partikel atmosfer di layar pertarungan (motes, dark_spores, embers, sparkles, none).
 * @type select
 * @option Motes / Debu Cahaya (Motes)
 * @value motes
 * @option Spora Kegelapan (Dark Spores)
 * @value dark_spores
 * @option Bara Api (Embers)
 * @value embers
 * @option Kilau Bintang (Sparkles)
 * @value sparkles
 * @option Matikan (None)
 * @value none
 * @default motes
 *
 * @param Ambient Particle Count
 * @parent --- Pengaturan Atmosfer Battlefield ---
 * @desc Jumlah partikel atmosfer yang melayang di battlefield.
 * @type number
 * @default 24
 *
 * @param Battlefield Camera Sway
 * @parent --- Pengaturan Atmosfer Battlefield ---
 * @desc Efek goyangan kamera sinematik ambient yang sangat halus pada medan tempur.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * SISTEM DINAMIS BATTLEFIELD & MUSUH (YURE DYNAMIC BATTLEFIELD)
 * ============================================================================
 * 
 * Plugin ini menambahkan berbagai efek dinamis agar suasana pertarungan
 * terasa hidup, interaktif, dan berkelas:
 * 
 * 1. EFEK JIGGLE & NAFAS PADA SEMUA MUSUH:
 *    - Setiap musuh memiliki animasi bernafas (Squash & Stretch) halus.
 *    - Saat terkena damage, musuh memiliki reaksi membal (Hit Reaction Spring)
 *      yang memuaskan.
 *
 * 2. EFEK MUSUH GHOST / MELAYANG (<ghost> / <float>):
 *    - Musuh melayang naik-turun secara mulus di udara.
 *    - Gerakan meliuk (swaying & tilt) layaknya arwah gentayangan.
 *    - Efek transparansi berkala (Ethereal Pulse).
 *    - Bayangan berjejak (Phantom After-Image Trail).
 *
 * 3. ATMOSFER MEDAN TEMPUR (AMBIENT PARTICLES & CAMERA SWAY):
 *    - Partikel debu cahaya (Motes), spora gelap, atau bara api melayang di
 *      medan pertarungan.
 *    - Goyangan kamera sinematik halus pada battlefield.
 *
 * ----------------------------------------------------------------------------
 * NOTETAG MUSUH (DATABASE ENEMIES)
 * ----------------------------------------------------------------------------
 * 
 *   <ghost>
 *   -> Mengaktifkan efek hantu melayang naik-turun, meliuk, denyut ghaib & trail.
 *
 *   <float: 24, 0.05>
 *   -> Mengatur tinggi melayang (24px) dan kecepatan melayang (0.05).
 *
 *   <ghost_opacity: 0.7>
 *   -> Mengatur tingkat transparansi dasar musuh ghost (0.0 - 1.0).
 *
 *   <ghost_trail: false>
 *   -> Mematikan efek jejak bayangan ghost pada musuh ini.
 *
 *   <jiggle: 0.06, 0.04>
 *   -> Mengatur kecepatan dan kekuatan jiggle khusus untuk musuh ini.
 *
 *   <no_jiggle>
 *   -> Mematikan animasi jiggle/nafas (cocok untuk benda mati/robot/menara).
 *
 * ----------------------------------------------------------------------------
 * NOTETAG STATE (DATABASE STATES)
 * ----------------------------------------------------------------------------
 *   <ghost>
 *   -> Siapapun yang terkena State ini akan melayang seperti hantu!
 *
 * ----------------------------------------------------------------------------
 * PLUGIN COMMANDS
 * ----------------------------------------------------------------------------
 * - SetBattleAmbience motes
 * - SetBattleAmbience embers
 * - SetBattleAmbience dark_spores
 * - SetBattleAmbience none
 */

var Imported = Imported || {};
Imported.Yure_DynamicBattlefield = true;

(function() {
    'use strict';

    var params = PluginManager.parameters('Yure_DynamicBattlefield');
    var enableJiggle = (params['Enable Enemy Jiggle'] !== 'false');
    var defaultJiggleSpeed = Number(params['Jiggle Speed'] || 0.045);
    var defaultJiggleStrength = Number(params['Jiggle Strength'] || 0.025);
    var enableHitSpring = (params['Hit Reaction Spring'] !== 'false');

    var defaultGhostFloatHeight = Number(params['Default Ghost Float Height'] || 16);
    var defaultGhostFloatSpeed = Number(params['Default Ghost Float Speed'] || 0.040);
    var enableGhostSway = (params['Ghost Swaying'] !== 'false');
    var enableGhostOpacity = (params['Ghost Opacity Pulse'] !== 'false');
    var enableGhostTrail = (params['Ghost Phantom Trail'] !== 'false');

    var ambientType = String(params['Battle Ambient Particles'] || 'motes');
    var ambientCount = Number(params['Ambient Particle Count'] || 24);
    var enableCameraSway = (params['Battlefield Camera Sway'] !== 'false');

    // ============================================================================
    // 1. PROCEDURAL BITMAPS FOR AMBIENT PARTICLES
    // ============================================================================
    var _ambientBitmaps = {};

    function getMoteBitmap() {
        if (_ambientBitmaps.mote) return _ambientBitmaps.mote;
        var bmp = new Bitmap(32, 32);
        var ctx = bmp.context;
        var grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 255, 240, 0.9)');
        grad.addColorStop(0.3, 'rgba(255, 240, 180, 0.5)');
        grad.addColorStop(0.7, 'rgba(255, 220, 120, 0.15)');
        grad.addColorStop(1, 'rgba(255, 200, 100, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();
        bmp._setDirty();
        _ambientBitmaps.mote = bmp;
        return _ambientBitmaps.mote;
    }

    function getDarkSporeBitmap() {
        if (_ambientBitmaps.spore) return _ambientBitmaps.spore;
        var bmp = new Bitmap(32, 32);
        var ctx = bmp.context;
        var grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(180, 100, 255, 0.85)');
        grad.addColorStop(0.4, 'rgba(120, 40, 220, 0.45)');
        grad.addColorStop(0.8, 'rgba(60, 10, 140, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();
        bmp._setDirty();
        _ambientBitmaps.spore = bmp;
        return _ambientBitmaps.spore;
    }

    function getEmberBitmap() {
        if (_ambientBitmaps.ember) return _ambientBitmaps.ember;
        var bmp = new Bitmap(24, 24);
        var ctx = bmp.context;
        var grad = ctx.createRadialGradient(12, 12, 0, 12, 12, 12);
        grad.addColorStop(0, 'rgba(255, 255, 200, 1.0)');
        grad.addColorStop(0.35, 'rgba(255, 140, 40, 0.7)');
        grad.addColorStop(0.75, 'rgba(255, 40, 10, 0.2)');
        grad.addColorStop(1, 'rgba(200, 0, 0, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(12, 12, 12, 0, Math.PI * 2);
        ctx.fill();
        bmp._setDirty();
        _ambientBitmaps.ember = bmp;
        return _ambientBitmaps.ember;
    }

    // ============================================================================
    // 2. ENEMY SPRITE JIGGLE & GHOST FLOATING ANIMATION
    // ============================================================================
    var _Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        _Sprite_Enemy_initMembers.call(this);
        this._dynamicTick = Math.floor(Math.random() * 1000);
        this._hitSpringTime = 0;
        this._hitSpringIntensity = 0;
        this._ghostTrails = [];
    };

    Sprite_Enemy.prototype.setupGhostTrails = function() {
        if (this._ghostTrailsCreated || !this.parent) return;
        this._ghostTrailsCreated = true;
        this._trailContainer = new Sprite();
        // Sisipkan sebelum sprite musuh agar jejak ada di belakang
        var idx = 0;
        try {
            if (this.parent) idx = this.parent.getChildIndex(this);
        } catch (e) {
            idx = 0;
        }
        if (this.parent) {
            this.parent.addChildAt(this._trailContainer, Math.max(0, idx));
        }

        for (var i = 0; i < 4; i++) {
            var t = new Sprite();
            t.anchor.x = 0.5;
            t.anchor.y = 1.0;
            t.visible = false;
            t.alpha = 0;
            t.blendMode = PIXI.blendModes.ADD;
            this._ghostTrails.push(t);
            this._trailContainer.addChild(t);
        }
    };

    var _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);
        if (!this._enemy || this._enemy.isDead() || !this.visible || this.opacity <= 0) {
            if (this._trailContainer) this._trailContainer.visible = false;
            return;
        }

        this._dynamicTick++;
        this.updateDynamicMotion();
    };

    Sprite_Enemy.prototype.updateDynamicMotion = function() {
        var enemy = this._enemy;
        var rawEnemy = enemy.enemy();
        var note = rawEnemy ? (rawEnemy.note || '') : '';

        // Cek apakah musuh ini bertipe Ghost (via enemy notetag atau active state)
        var isGhost = !!note.match(/<(?:ghost|float|levitate)>/i);
        if (!isGhost) {
            var states = enemy.states();
            for (var s = 0; s < states.length; s++) {
                if (states[s] && states[s].note && states[s].note.match(/<(?:ghost|float|levitate)>/i)) {
                    isGhost = true;
                    break;
                }
            }
        }

        // Base Scales
        var baseScaleX = this._baseScaleX || 1.0;
        var baseScaleY = this._baseScaleY || 1.0;
        if (note.match(/<scale:[ ]*(\d+)%?>/i)) {
            var sc = Number(RegExp.$1) / 100;
            baseScaleX = sc;
            baseScaleY = sc;
        }

        // 1. HIT REACTION SPRING (Membal saat terkena serangan)
        var springScaleX = 0;
        var springScaleY = 0;
        if (this._hitSpringTime > 0) {
            this._hitSpringTime--;
            var progress = this._hitSpringTime / 18;
            var oscillation = Math.sin((18 - this._hitSpringTime) * 0.6) * progress;
            springScaleX = oscillation * (this._hitSpringIntensity * 0.18);
            springScaleY = -oscillation * (this._hitSpringIntensity * 0.22);
        }

        // 2. IDLE BREATHING / JIGGLE (Squash & Stretch)
        var noJiggle = !!note.match(/<no_jiggle>/i);
        var jiggleScaleX = 0;
        var jiggleScaleY = 0;

        if (enableJiggle && !noJiggle) {
            var jSpeed = defaultJiggleSpeed;
            var jStrength = defaultJiggleStrength;
            if (note.match(/<jiggle:[ ]*([0-9.]+)(?:,[ ]*([0-9.]+))?>/i)) {
                jSpeed = Number(RegExp.$1) || defaultJiggleSpeed;
                if (RegExp.$2) jStrength = Number(RegExp.$2) || defaultJiggleStrength;
            }

            var wave = Math.sin(this._dynamicTick * jSpeed);
            jiggleScaleY = wave * jStrength;
            jiggleScaleX = -wave * (jStrength * 0.6); // Kompensasi volume
        }

        // Terapkan ke Skala Sprite
        this.scale.x = (baseScaleX + jiggleScaleX + springScaleX) * (this.scale.x < 0 ? -1 : 1);
        this.scale.y = (baseScaleY + jiggleScaleY + springScaleY);

        // 3. GHOST FLOATING & ETHEREAL FX
        if (isGhost) {
            var fHeight = defaultGhostFloatHeight;
            var fSpeed = defaultGhostFloatSpeed;
            if (note.match(/<float:[ ]*(\d+)(?:,[ ]*([0-9.]+))?>/i)) {
                fHeight = Number(RegExp.$1) || defaultGhostFloatHeight;
                if (RegExp.$2) fSpeed = Number(RegExp.$2) || defaultGhostFloatSpeed;
            }

            var floatWave = Math.sin(this._dynamicTick * fSpeed);
            var floatOffsetY = floatWave * fHeight;

            // Naik-turun posisi
            if (this._baseY === undefined) {
                this._baseY = this.y;
                this._baseX = this.x;
            }
            this.y = this._baseY - (fHeight * 0.6) + floatOffsetY;

            // Meliuk ke kiri-kanan & sedikit miring (tilt)
            if (enableGhostSway) {
                var swayWave = Math.cos(this._dynamicTick * (fSpeed * 0.7));
                this.x = this._baseX + (swayWave * 5);
                this.rotation = Math.sin(this._dynamicTick * fSpeed) * 0.035;
            }

            // Denyut Transparansi Ghaib (Ethereal Opacity Pulse)
            if (enableGhostOpacity) {
                var baseOp = 240;
                if (note.match(/<ghost_opacity:[ ]*([0-9.]+)>/i)) {
                    baseOp = Math.round(Number(RegExp.$1) * 255);
                }
                var opPulse = Math.sin(this._dynamicTick * 0.05) * 25;
                this.opacity = Math.max(120, Math.min(255, baseOp + opPulse));
            }

            // Jejak Bayangan Ghaib (Phantom Trail)
            if (enableGhostTrail && !note.match(/<ghost_trail:[ ]*false>/i)) {
                this.updateGhostTrailEffect();
            }
        } else {
            if (this._baseY !== undefined) {
                this.y = this._baseY;
                this.x = this._baseX;
                this.rotation = 0;
            }
        }
    };

    Sprite_Enemy.prototype.updateGhostTrailEffect = function() {
        if (!this._ghostTrailsCreated) {
            this.setupGhostTrails();
        }
        if (!this._trailContainer) return;

        this._trailContainer.visible = this.visible && this.opacity > 0;

        // Spawn jejak setiap 8 frame
        if (this._dynamicTick % 8 === 0 && this.bitmap && this.bitmap.isReady()) {
            for (var i = 0; i < this._ghostTrails.length; i++) {
                var t = this._ghostTrails[i];
                if (!t.active) {
                    t.bitmap = this.bitmap;
                    t.anchor.x = this.anchor.x;
                    t.anchor.y = this.anchor.y;
                    t.x = this.x;
                    t.y = this.y;
                    t.scale.x = this.scale.x;
                    t.scale.y = this.scale.y;
                    t.rotation = this.rotation;
                    t.tint = 0x99bbff; // Biru/cyan arwah
                    t.alpha = 0.45;
                    t.active = true;
                    t.visible = true;
                    break;
                }
            }
        }

        // Update active trails
        for (var j = 0; j < this._ghostTrails.length; j++) {
            var tr = this._ghostTrails[j];
            if (tr.active) {
                tr.alpha -= 0.025;
                tr.scale.x += 0.005;
                tr.scale.y += 0.005;
                if (tr.alpha <= 0) {
                    tr.active = false;
                    tr.visible = false;
                }
            }
        }
    };

    // Trigger Hit Reaction saat menerima damage
    var _Game_Enemy_performDamage = Game_Enemy.prototype.performDamage;
    Game_Enemy.prototype.performDamage = function() {
        _Game_Enemy_performDamage.call(this);
        if (enableHitSpring && SceneManager._scene && SceneManager._scene._spriteset) {
            var enemySprites = SceneManager._scene._spriteset._enemySprites;
            if (enemySprites) {
                for (var i = 0; i < enemySprites.length; i++) {
                    if (enemySprites[i]._enemy === this) {
                        enemySprites[i]._hitSpringTime = 18;
                        enemySprites[i]._hitSpringIntensity = 1.0;
                        break;
                    }
                }
            }
        }
    };

    // ============================================================================
    // 3. DYNAMIC BATTLEFIELD ATMOSPHERE (PARTICLES & CAMERA SWAY)
    // ============================================================================
    var _Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
    Spriteset_Battle.prototype.createLowerLayer = function() {
        _Spriteset_Battle_createLowerLayer.call(this);
        this.createAmbientParticleLayer();
    };

    Spriteset_Battle.prototype.createAmbientParticleLayer = function() {
        if (ambientType === 'none') return;
        this._ambientParticles = [];
        this._ambientContainer = new Sprite();

        // Tambahkan container partikel di dalam _battleField (di atas battleback)
        if (this._battleField) {
            var targetIdx = Math.min(2, this._battleField.children.length);
            this._battleField.addChildAt(this._ambientContainer, targetIdx);
        } else if (this._baseSprite) {
            this._baseSprite.addChild(this._ambientContainer);
        } else {
            this.addChild(this._ambientContainer);
        }

        var bmp = getMoteBitmap();
        var blend = PIXI.blendModes.ADD;
        if (ambientType === 'dark_spores') {
            bmp = getDarkSporeBitmap();
        } else if (ambientType === 'embers') {
            bmp = getEmberBitmap();
        }

        for (var i = 0; i < ambientCount; i++) {
            var p = new Sprite(bmp);
            p.anchor.x = 0.5;
            p.anchor.y = 0.5;
            p.blendMode = blend;
            this.resetAmbientParticle(p, true);
            this._ambientParticles.push(p);
            this._ambientContainer.addChild(p);
        }
    };

    Spriteset_Battle.prototype.resetAmbientParticle = function(p, randomInitial) {
        var w = Graphics.boxWidth || 1280;
        var h = Graphics.boxHeight || 720;
        p.x = Math.random() * w;
        p.y = randomInitial ? (Math.random() * h) : (h + 20);
        p.vx = (Math.random() - 0.5) * 0.8;
        p.vy = -(0.5 + Math.random() * 1.2);
        p.scaleVal = 0.35 + Math.random() * 0.65;
        p.scale.x = p.scaleVal;
        p.scale.y = p.scaleVal;
        p.maxAlpha = 0.25 + Math.random() * 0.45;
        p.alpha = randomInitial ? (Math.random() * p.maxAlpha) : 0;
        p.life = 0;
        p.maxLife = 200 + Math.random() * 200;
        p.wobbleSpeed = 0.02 + Math.random() * 0.03;
    };

    var _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        _Spriteset_Battle_update.call(this);
        this.updateAmbientParticles();
        this.updateBattlefieldCameraSway();
    };

    Spriteset_Battle.prototype.updateAmbientParticles = function() {
        if (!this._ambientParticles) return;
        var w = Graphics.boxWidth || 1280;
        var h = Graphics.boxHeight || 720;

        for (var i = 0; i < this._ambientParticles.length; i++) {
            var p = this._ambientParticles[i];
            p.life++;
            p.y += p.vy;
            p.x += p.vx + Math.sin(p.life * p.wobbleSpeed) * 0.4;

            // Fade in & Fade out
            var prog = p.life / p.maxLife;
            if (prog < 0.2) {
                p.alpha = (prog / 0.2) * p.maxAlpha;
            } else if (prog > 0.8) {
                p.alpha = ((1.0 - prog) / 0.2) * p.maxAlpha;
            }

            if (p.y < -30 || p.x < -30 || p.x > w + 30 || p.life >= p.maxLife) {
                this.resetAmbientParticle(p, false);
            }
        }
    };

    Spriteset_Battle.prototype.updateBattlefieldCameraSway = function() {
        if (!enableCameraSway || !this._battleField) return;
        var t = Graphics.frameCount;
        // Sangat halus (hanya 2-3 pixel) untuk memberi kesan dunia 3D/hidup
        var swayX = Math.sin(t * 0.012) * 2.0;
        var swayY = Math.cos(t * 0.016) * 1.5;
        this._battleField.x = swayX;
        this._battleField.y = swayY;
    };

    // ============================================================================
    // 4. PLUGIN COMMANDS
    // ============================================================================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        var cmd = command.toLowerCase();
        if (cmd === 'setbattleambience') {
            var type = String(args[0] || 'motes').toLowerCase();
            ambientType = type;
            if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._ambientContainer) {
                var ss = SceneManager._scene._spriteset;
                ss._ambientContainer.parent.removeChild(ss._ambientContainer);
                ss.createAmbientParticleLayer();
            }
        }
    };

})();
