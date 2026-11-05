//=============================================================================
// Yure_Atmosphere.js
//=============================================================================
/*:
 * @plugindesc [v2.0] Master World Atmosphere Engine: Map-Notetag Driven Fireflies, Dust Motes, Embers, Spirits & Fog.
 * @author Lead Drain Production
 *
 * @param Default Atmosphere
 * @text Default Atmosphere
 * @desc Atmosfer default jika map tidak memiliki notetag (none, fireflies, dust, embers, spirits, leaves).
 * @default none
 *
 * @param Fireflies Count
 * @text Default Fireflies Count
 * @desc Jumlah kunang-kunang default pada map ber-notetag fireflies.
 * @type number
 * @default 36
 *
 * @param Fireflies Color
 * @text Default Fireflies Color
 * @desc Warna pendaran kunang-kunang dalam hex (#c8ff3b = bioluminescent lime, #44ffbb = cyan spirit).
 * @default #c8ff3b
 *
 * @param Fireflies Speed
 * @text Default Fireflies Speed
 * @desc Kecepatan melayang kunang-kunang (0.5 - 2.0).
 * @default 1.0
 *
 * @help
 * ============================================================================
 * YURE MASTER WORLD ATMOSPHERE ENGINE (v2.0)
 * ============================================================================
 * Plugin ini menghadirkan sistem partikel atmosferik dunia yang dinamis dan
 * dapat dikustomisasi per-map melalui Note (Notetag) pada Map Properties.
 *
 * CARA PENGGUNAAN (MAP NOTETAGS):
 * Cukup ketik salah satu tag berikut di kolom Note pada Pengaturan Peta (Map Properties):
 *
 * 1. KUNANG-KUNANG MALAM (FIREFLIES):
 *    <atmosphere: fireflies>
 *    atau shortcut:
 *    <fireflies>  atau  <kunang-kunang>
 *    
 *    Kustomisasi parameter lanjutan:
 *    <atmosphere: fireflies, 45, #aaff33, 1.2>
 *    (Format: tipe, jumlah partikel, warna hex, kecepatan)
 *
 * 2. DEBU MELAYANG (DUST MOTES):
 *    <atmosphere: dust>  atau  <dust>  atau  <debu>
 *    Cocok untuk: interior mansion tua, perpustakaan, kamar berdebu.
 *
 * 3. BARA API & ABU (EMBERS / SPARKS):
 *    <atmosphere: embers>  atau  <embers>  atau  <bara>
 *    Cocok untuk: reruntuhan terbakar, area vulkanik, perapian.
 *
 * 4. ARWAH GAIB (SPIRITS / WISPS):
 *    <atmosphere: spirits>  atau  <spirits>  atau  <arwah>
 *    Cocok untuk: kuburan malam, dimensi arwah, lorong berhantu.
 *
 * 5. KELOPAK BUNGA / DAUN GUGUR (LEAVES / PETALS):
 *    <atmosphere: leaves>  atau  <leaves>  atau  <daun>
 *
 * 6. MEMATIKAN ATMOSFER PADA MAP TERTENTU:
 *    <atmosphere: none>
 *
 * ============================================================================
 * PLUGIN COMMANDS:
 * ============================================================================
 *   YureAtmo set fireflies [count] [colorHex] [speed]
 *   YureAtmo set dust [count] [colorHex]
 *   YureAtmo set embers [count]
 *   YureAtmo set spirits [count]
 *   YureAtmo off                     : Mematikan partikel atmosfer sementara
 *   YureAtmo reset                   : Mengembalikan atmosfer sesuai notetag map
 *
 *   yure_fog [opacity] [speedX] [speedY] : Kontrol kabut (kompatibilitas lama)
 * ============================================================================
 */

var Imported = Imported || {};
Imported.Yure_Atmosphere = true;

(function() {
    'use strict';

    var PLUGIN_NAME = 'Yure_Atmosphere';
    var rawParams = PluginManager.parameters(PLUGIN_NAME) || {};

    var Config = {
        defaultAtmo: String(rawParams['Default Atmosphere'] || 'none').toLowerCase(),
        firefliesCount: Number(rawParams['Fireflies Count'] || 36),
        firefliesColor: String(rawParams['Fireflies Color'] || '#c8ff3b'),
        firefliesSpeed: Number(rawParams['Fireflies Speed'] || 1.0)
    };

    // Helper: Hex Color to RGB components
    function hexToRgb(hex) {
        if (!hex) return [200, 255, 60];
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var num = parseInt(hex, 16);
        if (isNaN(num)) return [200, 255, 60];
        return [
            (num >> 16) & 255,
            (num >> 8) & 255,
            num & 255
        ];
    }

    // ========================================================================
    // Map Notetag Parser
    // ========================================================================
    function parseMapAtmosphere(note) {
        if (!note) return null;

        // 1. <atmosphere: type, count, color, speed>
        var match = note.match(/<atmosphere\s*:\s*([^,>]+)(?:,\s*(\d+))?(?:,\s*([^,>]+))?(?:,\s*([\d.]+))?>/i);
        if (match) {
            return {
                type: match[1].trim().toLowerCase(),
                count: match[2] ? parseInt(match[2], 10) : null,
                color: match[3] ? match[3].trim() : null,
                speed: match[4] ? parseFloat(match[4]) : 1.0
            };
        }

        // 2. Shortcuts
        if (note.match(/<(?:fireflies|kunang-kunang)>/i)) {
            return { type: 'fireflies', count: null, color: null, speed: 1.0 };
        }
        if (note.match(/<(?:limbo|void|the_void)>/i) || note.match(/<atmosphere\s*:\s*(?:limbo|void)>/i)) {
            return { type: 'void', count: 14, color: '#8855ff', speed: 0.6 };
        }
        if (note.match(/<(?:dust|motes|debu)>/i)) {
            return { type: 'dust', count: null, color: null, speed: 1.0 };
        }
        if (note.match(/<(?:embers|sparks|bara)>/i)) {
            return { type: 'embers', count: null, color: null, speed: 1.0 };
        }
        if (note.match(/<(?:spirits|wisps|arwah)>/i)) {
            return { type: 'spirits', count: null, color: null, speed: 1.0 };
        }
        if (note.match(/<(?:leaves|petals|daun)>/i)) {
            return { type: 'leaves', count: null, color: null, speed: 1.0 };
        }
        if (note.match(/<atmosphere\s*:\s*none>/i)) {
            return { type: 'none', count: 0, color: null, speed: 1.0 };
        }

        return null;
    }

    Game_Map.prototype.isLimboVoid = function() {
        if (!this.mapId()) return false;
        if (this.mapId() === 1) return true;
        if (typeof $dataMap !== 'undefined' && $dataMap && $dataMap.note) {
            if ($dataMap.note.match(/<(?:limbo|void|the_void)>/i)) return true;
            if ($dataMap.note.match(/<atmosphere\s*:\s*(?:limbo|void)>/i)) return true;
        }
        if (typeof $dataMapInfos !== 'undefined' && $dataMapInfos && $dataMapInfos[this.mapId()]) {
            var name = $dataMapInfos[this.mapId()].name || '';
            if (name.match(/limbo|void/i)) return true;
        }
        return false;
    };

    // ========================================================================
    // Game_System Atmosphere State
    // ========================================================================
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._yureAtmosphere = {
            currentType: Config.defaultAtmo,
            count: null,
            color: null,
            speed: 1.0,
            override: false
        };
        this._yureFog = { active: false, opacity: 0, sx: 0, sy: 0, targetOpacity: 0 };
    };

    Game_System.prototype.yureAtmo = function() {
        if (!this._yureAtmosphere) {
            this._yureAtmosphere = {
                currentType: Config.defaultAtmo,
                count: null,
                color: null,
                speed: 1.0,
                override: false
            };
        }
        return this._yureAtmosphere;
    };

    // ========================================================================
    // Procedural Particle Texture Cache (Zero File Load / Fast WebGL)
    // ========================================================================
    var TextureCache = {};

    function getGlowTexture(type, colorHex) {
        var key = type + '_' + (colorHex || 'def');
        if (TextureCache[key]) return TextureCache[key];

        var size = (type === 'spirits') ? 32 : 16;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        var half = size / 2;

        var rgb = hexToRgb(colorHex);
        var r = rgb[0], g = rgb[1], b = rgb[2];

        if (type === 'fireflies') {
            // Delicate tiny fairy speck + soft airy halo
            var grad = ctx.createRadialGradient(half, half, 0.5, half, half, half);
            grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
            grad.addColorStop(0.20, 'rgba(' + r + ',' + g + ',' + b + ', 0.65)');
            grad.addColorStop(0.55, 'rgba(' + Math.round(r * 0.8) + ',' + Math.round(g * 0.9) + ',' + Math.round(b * 0.5) + ', 0.15)');
            grad.addColorStop(1.0, 'rgba(' + r + ',' + g + ',' + b + ', 0.0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);
        } else if (type === 'void' || type === 'limbo') {
            // Ethereal subtle violet-cyan soul wisp
            var grad = ctx.createRadialGradient(half, half, 0.5, half, half, half);
            grad.addColorStop(0.0, 'rgba(220, 190, 255, 0.85)');
            grad.addColorStop(0.35, 'rgba(' + r + ',' + g + ',' + b + ', 0.45)');
            grad.addColorStop(0.80, 'rgba(40, 200, 255, 0.12)');
            grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);
        } else if (type === 'embers') {
            // Fiery spark diamond
            var grad = ctx.createRadialGradient(half, half, 1, half, half, half);
            grad.addColorStop(0.0, 'rgba(255, 240, 180, 1.0)');
            grad.addColorStop(0.3, 'rgba(' + r + ',' + g + ',' + b + ', 0.9)');
            grad.addColorStop(0.8, 'rgba(' + Math.round(r * 0.8) + ', 40, 10, 0.3)');
            grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);
        } else if (type === 'spirits') {
            // Ethereal wisp halo
            var grad = ctx.createRadialGradient(half, half, 1, half, half, half);
            grad.addColorStop(0.0, 'rgba(230, 255, 255, 0.95)');
            grad.addColorStop(0.35, 'rgba(' + r + ',' + g + ',' + b + ', 0.7)');
            grad.addColorStop(0.8, 'rgba(' + Math.round(r * 0.5) + ',' + Math.round(g * 0.5) + ', 255, 0.25)');
            grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);
        } else {
            // Dust motes / soft circular glow
            var grad = ctx.createRadialGradient(half, half, 0.5, half, half, half);
            grad.addColorStop(0.0, 'rgba(255, 250, 230, 0.85)');
            grad.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ', 0.4)');
            grad.addColorStop(1.0, 'rgba(' + r + ',' + g + ',' + b + ', 0.0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);
        }

        var tex = PIXI.Texture.from(canvas);
        TextureCache[key] = tex;
        return tex;
    }

    // ========================================================================
    // Sprite_WorldAtmosphere (Atmospheric Particle Layer)
    // ========================================================================
    function Sprite_WorldAtmosphere() {
        this.initialize.apply(this, arguments);
    }
    Sprite_WorldAtmosphere.prototype = Object.create(Sprite.prototype);
    Sprite_WorldAtmosphere.prototype.constructor = Sprite_WorldAtmosphere;

    Sprite_WorldAtmosphere.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.z = 7; // Above lower ground, below weather and message windows
        this._particles = [];
        this._currentAtmoType = 'none';
        this._lastDisplayX = $gameMap ? $gameMap.displayX() : 0;
        this._lastDisplayY = $gameMap ? $gameMap.displayY() : 0;
        this.setupAtmosphere();
    };

    Sprite_WorldAtmosphere.prototype.setupAtmosphere = function() {
        // Clear old particles
        while (this.children.length > 0) {
            this.removeChild(this.children[0]);
        }
        this._particles = [];

        var sys = $gameSystem.yureAtmo();
        var type = sys.currentType || 'none';
        if (type === 'none' || !type) {
            if (typeof $gameMap !== 'undefined' && $gameMap && $gameMap.isLimboVoid && $gameMap.isLimboVoid()) {
                type = 'void';
            }
        }
        this._currentAtmoType = type;

        if (type === 'none' || type === 'off') {
            this.visible = false;
            return;
        }

        this.visible = true;

        var count = sys.count;
        var colorHex = sys.color;
        var speed = sys.speed || 1.0;

        if (!count) {
            if (type === 'fireflies') count = Config.firefliesCount;
            else if (type === 'void' || type === 'limbo') count = 14;
            else if (type === 'dust') count = 32;
            else if (type === 'embers') count = 30;
            else if (type === 'spirits') count = 24;
            else if (type === 'leaves') count = 28;
            else count = 20;
        }

        if (!colorHex) {
            if (type === 'fireflies') colorHex = Config.firefliesColor;
            else if (type === 'void' || type === 'limbo') colorHex = '#8855ff';
            else if (type === 'dust') colorHex = '#e8dfc8';
            else if (type === 'embers') colorHex = '#ff7722';
            else if (type === 'spirits') colorHex = '#33f0ff';
            else if (type === 'leaves') colorHex = '#ff99bb';
            else colorHex = '#ffffff';
        }

        var tex = getGlowTexture(type, colorHex);

        for (var i = 0; i < count; i++) {
            var spr = new PIXI.Sprite(tex);
            spr.anchor.set(0.5, 0.5);

            if (type === 'fireflies' || type === 'embers' || type === 'spirits' || type === 'void' || type === 'limbo') {
                spr.blendMode = PIXI.BLEND_MODES.ADD;
            } else {
                spr.blendMode = PIXI.BLEND_MODES.NORMAL;
            }

            var p = {
                sprite: spr,
                type: type,
                x: Math.random() * Graphics.boxWidth,
                y: Math.random() * Graphics.boxHeight,
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.025 + Math.random() * 0.045,
                driftSpeedX: (Math.random() - 0.5) * 0.4 * speed,
                driftSpeedY: (type === 'fireflies') ? (-0.12 - Math.random() * 0.25) * speed :
                             (type === 'void' || type === 'limbo') ? (-0.08 - Math.random() * 0.16) * speed :
                             (type === 'embers') ? (-0.6 - Math.random() * 0.9) * speed :
                             (type === 'leaves') ? (0.6 + Math.random() * 0.7) * speed :
                             (Math.random() - 0.5) * 0.25 * speed,
                baseScale: (type === 'fireflies') ? (0.32 + Math.random() * 0.28) :
                           (type === 'void' || type === 'limbo') ? (0.35 + Math.random() * 0.35) :
                           (type === 'spirits') ? (0.8 + Math.random() * 0.6) :
                           (0.4 + Math.random() * 0.5),
                baseAlpha: (type === 'fireflies') ? 0.65 :
                           (type === 'void' || type === 'limbo') ? 0.38 :
                           (0.4 + Math.random() * 0.4)
            };

            spr.x = p.x;
            spr.y = p.y;
            spr.scale.set(p.baseScale);
            this.addChild(spr);
            this._particles.push(p);
        }
    };

    Sprite_WorldAtmosphere.prototype.update = function() {
        Sprite.prototype.update.call(this);

        var sys = $gameSystem.yureAtmo();
        if (sys.currentType !== this._currentAtmoType) {
            this.setupAtmosphere();
        }

        if (!this.visible || this._particles.length === 0) return;

        // Calculate map scrolling delta to track world camera movement
        var curDispX = $gameMap ? $gameMap.displayX() : 0;
        var curDispY = $gameMap ? $gameMap.displayY() : 0;
        var tw = $gameMap ? $gameMap.tileWidth() : 48;
        var th = $gameMap ? $gameMap.tileHeight() : 48;
        var deltaCamX = (curDispX - this._lastDisplayX) * tw;
        var deltaCamY = (curDispY - this._lastDisplayY) * th;
        this._lastDisplayX = curDispX;
        this._lastDisplayY = curDispY;

        var screenW = Graphics.boxWidth;
        var screenH = Graphics.boxHeight;
        var margin = 40;

        for (var i = 0; i < this._particles.length; i++) {
            var p = this._particles[i];

            // 1. Shift position with camera scroll (world locking)
            p.x -= deltaCamX;
            p.y -= deltaCamY;

            // 2. Individual physics by atmosphere type
            if (p.type === 'fireflies') {
                p.phaseX += 0.022;
                p.phaseY += 0.016;
                p.pulsePhase += p.pulseSpeed;

                // Organic air drift & wander
                p.x += Math.sin(p.phaseX) * 0.55 + p.driftSpeedX;
                p.y += Math.cos(p.phaseY) * 0.35 + p.driftSpeedY;

                // Bioluminescent breathing glow cycle (gentle delicate fairy glimmer)
                var glow = Math.pow(Math.sin(p.pulsePhase) * 0.5 + 0.5, 2.5);
                p.sprite.alpha = 0.06 + 0.58 * glow;
                var curScale = p.baseScale * (0.80 + 0.28 * glow);
                p.sprite.scale.set(curScale);
            } else if (p.type === 'void' || p.type === 'limbo') {
                p.phaseX += 0.012;
                p.phaseY += 0.009;
                p.pulsePhase += p.pulseSpeed * 0.6;

                p.x += Math.sin(p.phaseX) * 0.35 + p.driftSpeedX;
                p.y += p.driftSpeedY;

                var glow = Math.sin(p.pulsePhase) * 0.5 + 0.5;
                p.sprite.alpha = 0.04 + 0.36 * glow;
                var curScale = p.baseScale * (0.85 + 0.25 * glow);
                p.sprite.scale.set(curScale);
            } else if (p.type === 'embers') {
                p.phaseX += 0.04;
                p.pulsePhase += 0.06;
                p.x += Math.sin(p.phaseX) * 0.8 + p.driftSpeedX;
                p.y += p.driftSpeedY;

                var glow = Math.sin(p.pulsePhase) * 0.3 + 0.7;
                p.sprite.alpha = p.baseAlpha * glow;
            } else if (p.type === 'spirits') {
                p.phaseX += 0.02;
                p.phaseY += 0.015;
                p.pulsePhase += 0.03;
                p.x += Math.sin(p.phaseX) * 0.5 + p.driftSpeedX;
                p.y += Math.cos(p.phaseY) * 0.5 + p.driftSpeedY;

                var glow = Math.sin(p.pulsePhase) * 0.4 + 0.6;
                p.sprite.alpha = p.baseAlpha * glow;
            } else if (p.type === 'leaves') {
                p.phaseX += 0.03;
                p.x += Math.sin(p.phaseX) * 1.2 + 0.5;
                p.y += p.driftSpeedY;
                p.sprite.rotation += 0.02;
                p.sprite.alpha = p.baseAlpha;
            } else {
                // Dust motes
                p.phaseX += 0.015;
                p.x += Math.sin(p.phaseX) * 0.3 + p.driftSpeedX;
                p.y += p.driftSpeedY;
                p.sprite.alpha = p.baseAlpha * (Math.sin(p.phaseX * 2) * 0.3 + 0.7);
            }

            // Screen boundary wrapping
            if (p.x < -margin) p.x = screenW + margin;
            if (p.x > screenW + margin) p.x = -margin;
            if (p.y < -margin) p.y = screenH + margin;
            if (p.y > screenH + margin) p.y = -margin;

            p.sprite.x = Math.round(p.x);
            p.sprite.y = Math.round(p.y);
        }
    };

    // ========================================================================
    // Map Loading Integration (Auto Detect Map Notetag)
    // ========================================================================
    var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);

        var sys = $gameSystem.yureAtmo();
        if (!sys.override && typeof $dataMap !== 'undefined' && $dataMap && $dataMap.note) {
            var atmoData = parseMapAtmosphere($dataMap.note);
            if (atmoData) {
                sys.currentType = atmoData.type;
                sys.count = atmoData.count;
                sys.color = atmoData.color;
                sys.speed = atmoData.speed;
            } else {
                sys.currentType = Config.defaultAtmo;
                sys.count = null;
                sys.color = null;
                sys.speed = 1.0;
            }
        }
    };

    // ========================================================================
    // Spriteset_Map Layer Hooks
    // ========================================================================
    var _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.call(this);
        this.createYureAtmosphereLayer();
        this.createYureFogLayer();
    };

    Spriteset_Map.prototype.createYureAtmosphereLayer = function() {
        if (!this._yureAtmosphereSprite) {
            this._yureAtmosphereSprite = new Sprite_WorldAtmosphere();
            this._baseSprite.addChild(this._yureAtmosphereSprite);
        }
    };

    Spriteset_Map.prototype.createYureFogLayer = function() {
        if (this._yureFogSprite) return;
        this._yureFogSprite = new TilingSprite();
        this._yureFogSprite.bitmap = ImageManager.loadSystem('yure_fog');
        this._yureFogSprite.move(0, 0, Graphics.width, Graphics.height);
        this._yureFogSprite.blendMode = 1; // PIXI.BLEND_MODES.ADD
        
        if (!$gameSystem._yureFog) {
            $gameSystem._yureFog = { active: false, opacity: 0, sx: 0, sy: 0, targetOpacity: 0 };
        }
        
        this._yureFogSprite.opacity = $gameSystem._yureFog.opacity || 0;
        this._yureFogSprite.z = 8;
        this._baseSprite.addChild(this._yureFogSprite);
    };

    var _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        this.updateYureFog();
    };

    Spriteset_Map.prototype.updateYureFog = function() {
        if (this._yureFogSprite) {
            var fogSys = $gameSystem._yureFog;
            if (fogSys) {
                if (this._yureFogSprite.opacity < fogSys.targetOpacity) {
                    this._yureFogSprite.opacity += 1.5;
                } else if (this._yureFogSprite.opacity > fogSys.targetOpacity) {
                    this._yureFogSprite.opacity -= 1.5;
                }
                fogSys.opacity = this._yureFogSprite.opacity;
                
                if (this._yureFogSprite.opacity > 0) {
                    this._yureFogSprite.origin.x += fogSys.sx;
                    this._yureFogSprite.origin.y += fogSys.sy;
                }
            }
        }
    };

    // ========================================================================
    // Game_Interpreter Plugin Commands
    // ========================================================================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        var cmd = command.toLowerCase();
        if (cmd === 'yureatmo' || cmd === 'atmosphere') {
            var sub = (args[0] || '').toLowerCase();
            var sys = $gameSystem.yureAtmo();

            if (sub === 'set') {
                var type = (args[1] || 'none').toLowerCase();
                sys.override = true;
                sys.currentType = type;
                sys.count = args[2] ? parseInt(args[2], 10) : null;
                sys.color = args[3] || null;
                sys.speed = args[4] ? parseFloat(args[4]) : 1.0;
            } else if (sub === 'off' || sub === 'none') {
                sys.override = true;
                sys.currentType = 'none';
            } else if (sub === 'reset') {
                sys.override = false;
                if (typeof $dataMap !== 'undefined' && $dataMap && $dataMap.note) {
                    var atmoData = parseMapAtmosphere($dataMap.note);
                    sys.currentType = atmoData ? atmoData.type : Config.defaultAtmo;
                    sys.count = atmoData ? atmoData.count : null;
                    sys.color = atmoData ? atmoData.color : null;
                    sys.speed = atmoData ? atmoData.speed : 1.0;
                } else {
                    sys.currentType = Config.defaultAtmo;
                }
            }
        } else if (cmd === 'yure_fog') {
            var op = Number(args[0] || 0);
            if (!$gameSystem._yureFog) {
                $gameSystem._yureFog = { active: false, opacity: 0, sx: 0, sy: 0, targetOpacity: 0 };
            }
            $gameSystem._yureFog.targetOpacity = op;
            if (op > 0) {
                $gameSystem._yureFog.active = true;
                $gameSystem._yureFog.sx = Number(args[1] || 1);
                $gameSystem._yureFog.sy = Number(args[2] || 1);
            }
        }
    };

})();
