//=============================================================================
// Yure_LightingShadowShader.js
//=============================================================================
/*:
 * @plugindesc [v3.0] Master WebGL Atmospheric Violet Night, Physical Inverse-Square Lighting & Smooth Building Shadow Engine.
 * @author Yure Party Team & Antigravity
 *
 * @param --- Pengaturan Pencahayaan Default ---
 * @default
 *
 * @param Default Ambient Darkness
 * @parent --- Pengaturan Pencahayaan Default ---
 * @desc Intensitas atmosfer malam (0.0 = Siang terang, 0.65 = Malam ungu atmosferik Guardian Tales).
 * @type number
 * @decimals 2
 * @default 0.65
 *
 * @param Default Ambient Color
 * @parent --- Pengaturan Pencahayaan Default ---
 * @desc Warna atmosfer malam ungu Guardian Tales (Hex: #381c54).
 * @default #381c54
 *
 * @param --- Pengaturan Senter / Lentera Player ---
 * @default
 *
 * @param Player Light Enabled
 * @parent --- Pengaturan Senter / Lentera Player ---
 * @desc Apakah lentera/senter pemain menyala saat game dimulai (default: false / perlu item lentera).
 * @type boolean
 * @default false
 *
 * @param Require Light Item
 * @parent --- Pengaturan Senter / Lentera Player ---
 * @desc Memerlukan item lentera/senter di inventori agar pemain bisa menyalakan cahaya (default: true).
 * @type boolean
 * @default true
 *
 * @param Lantern Item ID
 * @parent --- Pengaturan Senter / Lentera Player ---
 * @desc ID Item spesifik untuk lentera (0 = otomatis deteksi item bernama Lentera/Lantern atau ber-notetag <playerLight>).
 * @type number
 * @default 0
 *
 * @param Player Light Mode
 * @parent --- Pengaturan Senter / Lentera Player ---
 * @desc Tipe cahaya pemain: lantern (Cahaya 360 derajat) atau flashlight (Senter kerucut terarah).
 * @type select
 * @option lantern
 * @option flashlight
 * @default lantern
 *
 * @param Player Light Radius
 * @parent --- Pengaturan Senter / Lentera Player ---
 * @desc Jarak radius cahaya pemain dalam piksel.
 * @type number
 * @default 240
 *
 * @param Player Light Color
 * @parent --- Pengaturan Senter / Lentera Player ---
 * @desc Warna cahaya lentera pemain (Hex format).
 * @default #ffdd99
 *
 * @param Player Light Intensity
 * @parent --- Pengaturan Senter / Lentera Player ---
 * @desc Intensitas/kecerahan cahaya pemain (0.5 - 2.0).
 * @type number
 * @decimals 2
 * @default 1.25
 *
 * @param Player Light Toggle Key
 * @parent --- Pengaturan Senter / Lentera Player ---
 * @desc Tombol keyboard untuk mematikan/menyalakan lentera (F = 70).
 * @default 70
 *
 * @param --- Partikel Debu & Cahaya (Volumetric Light Motes) ---
 * @default
 *
 * @param Enable Light Motes
 * @parent --- Partikel Debu & Cahaya (Volumetric Light Motes) ---
 * @desc Partikel debu bercahaya yang tampak melayang saat terkena sinar/lampu.
 * @type boolean
 * @default true
 *
 * @param Light Motes Count
 * @parent --- Partikel Debu & Cahaya (Volumetric Light Motes) ---
 * @desc Jumlah partikel debu cahaya di layar.
 * @type number
 * @default 32
 *
 * @param --- Pengaturan Shader FX & Atmosfer ---
 * @default
 *
 * @param Enable Vignette Shader
 * @parent --- Pengaturan Shader FX & Atmosfer ---
 * @desc Aktifkan shader vignette sudut layar sinematik di peta.
 * @type boolean
 * @default true
 *
 * @param Enable Anti Banding Dither
 * @parent --- Pengaturan Shader FX & Atmosfer ---
 * @desc Mencegah color banding pada gradasi warna dengan dither triangular GPU.
 * @type boolean
 * @default true
 *
 * @param Enable Sanity Horror Distortion
 * @parent --- Pengaturan Shader FX & Atmosfer ---
 * @desc Efek distorsi chromatic aberration halus saat Sanity party leader rendah (<= 30).
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * YURE MASTER WEBGL ATMOSPHERIC LIGHTING SHADER (v2.7 - Guardian Tales Edition)
 * ============================================================================
 * Engine shader WebGL pencahayaan dan atmosfer malam tercanggih untuk RPG Maker MV.
 *
 * FITUR UTAMA:
 * 1. Guardian Tales Atmospheric Violet Night:
 *    - Nuansa malam ungu estetik dan misterius (#381c54).
 *    - Dinding bata, pilar batu, lantai catur, patung tetap terlihat jelas
 *      tanpa kegelapan void gulita.
 * 2. Radiant Golden Lighting Halo:
 *    - Obor dinding dan lentera karakter memancarkan kubah cahaya emas hangat
 *      yang menyinari lantai dan dinding secara fotorealistik.
 *    - Dual-Zone Physics: Inti terang (hot center) dan degradasi lembut (penumbra).
 * 3. Sistem Inventori Lentera (Lantern Item Requirement):
 *    - Karakter TIDAK memiliki cahaya di awal game.
 *    - Saat pemain menemukan/mendapatkan item "Lentera Kuno" (atau item dengan
 *      notetag <playerLight>), lentera otomatis aktif!
 *    - Pemain dapat menekan tombol [F] di keyboard kapan saja untuk mematikan
 *      atau menyalakan lentera sesuka hati.
 *
 * PLUGIN COMMANDS:
 *   YureLight player on       : Menyalakan lentera pemain secara paksa
 *   YureLight player off      : Mematikan lentera pemain
 *   YureLight player toggle   : Toggle nyala / mati lentera pemain
 *   YureLight player radius 250
 *   YureLight player color #ffaa44
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_LightingShadowShader');
    var defaultDarkness = Number(parameters['Default Ambient Darkness'] || 0.65);
    var defaultAmbientColor = String(parameters['Default Ambient Color'] || '#381c54');
    var defaultPlayerLight = String(parameters['Player Light Enabled'] || 'false') === 'true';
    var requireLightItem = String(parameters['Require Light Item'] || 'true') === 'true';
    var lanternItemId = Number(parameters['Lantern Item ID'] || 0);

    var defaultPlayerMode = String(parameters['Player Light Mode'] || 'lantern');
    var defaultPlayerRadius = Number(parameters['Player Light Radius'] || 240);
    var defaultPlayerColor = String(parameters['Player Light Color'] || '#ffdd99');
    var defaultPlayerIntensity = Number(parameters['Player Light Intensity'] || 1.25);
    var playerToggleKey = Number(parameters['Player Light Toggle Key'] || 70);

    var enableLightMotes = String(parameters['Enable Light Motes'] || 'true') === 'true';
    var lightMotesCount = Number(parameters['Light Motes Count'] || 32);

    var enableVignette = String(parameters['Enable Vignette Shader'] || 'true') === 'true';
    var enableDither = String(parameters['Enable Anti Banding Dither'] || 'true') === 'true';
    var enableSanityFX = String(parameters['Enable Sanity Horror Distortion'] || 'true') === 'true';

    // ------------------------------------------------------------------------
    // Helper: Hex Color to RGB Array [r, g, b] (0.0 to 1.0)
    // ------------------------------------------------------------------------
    function hexToRgb(hex) {
        if (!hex) return [1.0, 1.0, 1.0];
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var num = parseInt(hex, 16);
        if (isNaN(num)) return [1.0, 1.0, 1.0];
        return [
            ((num >> 16) & 255) / 255,
            ((num >> 8) & 255) / 255,
            (num & 255) / 255
        ];
    }

    // ------------------------------------------------------------------------
    // Register Hotkey (default: 70 = 'F')
    // ------------------------------------------------------------------------
    if (playerToggleKey > 0) {
        Input.keyMapper[playerToggleKey] = 'yureLightToggle';
    }

    // ========================================================================
    // Game_System Lighting State
    // ========================================================================
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._yureLightSystem = {
            playerLight: defaultPlayerLight,
            playerMode: defaultPlayerMode,
            playerRadius: defaultPlayerRadius,
            playerColor: defaultPlayerColor,
            playerIntensity: defaultPlayerIntensity,
            customDarkness: null,
            customAmbientColor: null,
            motesEnabled: enableLightMotes
        };
    };

    Game_System.prototype.yureLightSys = function() {
        if (!this._yureLightSystem) {
            this._yureLightSystem = {
                playerLight: defaultPlayerLight,
                playerMode: defaultPlayerMode,
                playerRadius: defaultPlayerRadius,
                playerColor: defaultPlayerColor,
                playerIntensity: defaultPlayerIntensity,
                customDarkness: null,
                customAmbientColor: null,
                motesEnabled: enableLightMotes
            };
        }
        return this._yureLightSystem;
    };

    // ========================================================================
    // Game_Party Lantern Detection & Acquisition
    // ========================================================================
    Game_Party.prototype.getLanternItem = function() {
        var items = this.items();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (!item) continue;
            if (lanternItemId > 0 && item.id === lanternItemId) return item;
            if (item.note) {
                if (item.note.match(/<playerLight(?:s*:s*([^>]+))?>/i) ||
                    item.note.match(/<lantern>/i) ||
                    item.note.match(/<flashlight>/i) ||
                    item.note.match(/<light>/i)) {
                    return item;
                }
            }
            if (item.name) {
                var lowerName = item.name.toLowerCase();
                if (lowerName.indexOf('lentera') !== -1 ||
                    lowerName.indexOf('lantern') !== -1 ||
                    lowerName.indexOf('senter') !== -1 ||
                    lowerName.indexOf('flashlight') !== -1 ||
                    lowerName.indexOf('obor') !== -1 ||
                    lowerName.indexOf('torch') !== -1) {
                    return item;
                }
            }
        }
        return null;
    };

    Game_Party.prototype.hasLanternItem = function() {
        if (!requireLightItem) return true;
        return this.getLanternItem() !== null;
    };

    Game_Party.prototype.applyLanternProperties = function(item) {
        if (!item || !item.note) return;
        var sys = $gameSystem.yureLightSys();
        var m = item.note.match(/<playerLights*:s*([^>]+)>/i);
        if (m) {
            var parts = m[1].split(/[, ]+/).map(function(s) { return s.trim(); }).filter(Boolean);
            if (parts[0]) sys.playerRadius = Number(parts[0]);
            if (parts[1]) sys.playerColor = parts[1];
            if (parts[2]) sys.playerIntensity = Number(parts[2]);
            if (parts[3]) sys.playerMode = parts[3].toLowerCase();
        }
    };

    // Auto-turn ON lantern upon first gaining a lantern item
    var _Game_Party_gainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        var hadLantern = this.hasLanternItem();
        _Game_Party_gainItem.call(this, item, amount, includeEquip);
        if (item && amount > 0 && !hadLantern && this.hasLanternItem()) {
            var sys = $gameSystem.yureLightSys();
            sys.playerLight = true;
            this.applyLanternProperties(item);
        }
    };

    // ========================================================================
    // Game_Player Input & Toggle (Key: 'F' = 70)
    // ========================================================================
    var _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);
        if (sceneActive && Input.isTriggered('yureLightToggle')) {
            if (typeof $gameParty !== 'undefined' && $gameParty.hasLanternItem()) {
                var sys = $gameSystem.yureLightSys();
                sys.playerLight = !sys.playerLight;
                SoundManager.playCursor();
            }
        }
    };

    // Toggle lantern if used directly from the Item menu
    var _Scene_ItemBase_useItem = Scene_ItemBase.prototype.useItem;
    Scene_ItemBase.prototype.useItem = function() {
        _Scene_ItemBase_useItem.call(this);
        var item = this.item();
        if (item && typeof $gameParty !== 'undefined') {
            var lantern = $gameParty.getLanternItem();
            if (lantern && lantern.id === item.id) {
                var sys = $gameSystem.yureLightSys();
                sys.playerLight = !sys.playerLight;
                SoundManager.playCursor();
            }
        }
    };

    // ========================================================================
    // Game_Interpreter Plugin Commands
    // ========================================================================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command && command.toLowerCase() === 'yurelight') {
            var sub = (args[0] || '').toLowerCase();
            var sys = $gameSystem.yureLightSys();
            if (sub === 'player') {
                var action = (args[1] || '').toLowerCase();
                if (action === 'on') sys.playerLight = true;
                else if (action === 'off') sys.playerLight = false;
                else if (action === 'toggle') sys.playerLight = !sys.playerLight;
                else if (action === 'radius') sys.playerRadius = Number(args[2] || 240);
                else if (action === 'color') sys.playerColor = String(args[2] || '#ffdd99');
                else if (action === 'mode') sys.playerMode = String(args[2] || 'lantern').toLowerCase();
                else if (action === 'intensity') sys.playerIntensity = Number(args[2] || 1.25);
            } else if (sub === 'ambient') {
                if (args[1] !== undefined) sys.customDarkness = Number(args[1]);
                if (args[2] !== undefined) sys.customAmbientColor = String(args[2]);
            } else if (sub === 'motes') {
                var mAct = (args[1] || '').toLowerCase();
                sys.motesEnabled = (mAct !== 'off');
            }
        }
    };

    // ========================================================================
    // Game_Event Light Setup from Comments & Notes
    // ========================================================================
    var _Game_Event_setupPage = Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage = function() {
        _Game_Event_setupPage.call(this);
        this.setupYureShaderLight();
    };

    var _Game_Event_refresh = Game_Event.prototype.refresh;
    Game_Event.prototype.refresh = function() {
        _Game_Event_refresh.call(this);
        this.setupYureShaderLight();
    };

    var _Game_Map_setupEvents = Game_Map.prototype.setupEvents;
    Game_Map.prototype.setupEvents = function() {
        _Game_Map_setupEvents.call(this);
        if (this._events) {
            for (var i = 0; i < this._events.length; i++) {
                if (this._events[i]) this._events[i].setupYureShaderLight();
            }
        }
    };

    Game_Event.prototype.setupYureShaderLight = function() {
        this._yureLightData = null;
        var sources = [];

        if (this.event() && this.event().note) {
            sources.push(this.event().note);
        }

        if (!this._erased && this.page() && this.list()) {
            this.list().forEach(function(cmd) {
                if (cmd.code === 108 || cmd.code === 408) {
                    sources.push(cmd.parameters[0]);
                }
            });
        }

        for (var s = 0; s < sources.length; s++) {
            var txt = sources[s];
            if (!txt) continue;

            var mLight = txt.match(/<light\s*[:\s]\s*([^>]+)>/i) || txt.match(/^(?:light|fire|torch)\s+([^\r\n]+)/i);
            if (mLight) {
                var parts = mLight[1].split(/[, ]+/).map(function(item) { return item.trim(); }).filter(Boolean);
                this._yureLightData = {
                    radius: Number(parts[0] || 220),
                    color: parts[1] || '#ffaa44',
                    intensity: Number(parts[2] || 1.30),
                    type: (parts[3] || 'torch').toLowerCase(),
                    isFlashlight: false,
                    coneAngle: 360
                };
                break;
            }

            var mFlash = txt.match(/<flashlight\s*[:\s]\s*([^>]+)>/i) || txt.match(/^flashlight\s+([^\r\n]+)/i);
            if (mFlash) {
                var pFlash = mFlash[1].split(/[, ]+/).map(function(item) { return item.trim(); }).filter(Boolean);
                this._yureLightData = {
                    radius: Number(pFlash[0] || 280),
                    color: pFlash[1] || '#ffffff',
                    intensity: Number(pFlash[2] || 1.25),
                    type: 'steady',
                    isFlashlight: true,
                    coneAngle: Number(pFlash[3] || 50)
                };
                break;
            }
        }

        // Fallback jika event memiliki gambar obor/api
        if (!this._yureLightData) {
            var imgName = this.characterName();
            if (imgName && (imgName.indexOf('Flame') !== -1 || imgName.indexOf('Torch') !== -1 || imgName.indexOf('Light') !== -1)) {
                this._yureLightData = {
                    radius: 220,
                    color: '#ffaa44',
                    intensity: 1.30,
                    type: 'torch',
                    isFlashlight: false,
                    coneAngle: 360
                };
            }
        }
    };

    // ========================================================================
    // 1. MASTER WEBGL ATMOSPHERIC PURPLE NIGHT & LIGHTING SHADER (GLSL)
    // ========================================================================
    function Yure_LightingFilter() {
        var vertexSrc = [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'uniform mat3 projectionMatrix;',
            'varying vec2 vTextureCoord;',
            'void main(void) {',
            '    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '    vTextureCoord = aTextureCoord;',
            '}'
        ].join('\n');

        var fragmentSrc = [
            'precision mediump float;',
            'varying vec2 vTextureCoord;',
            'uniform sampler2D uSampler;',
            'uniform vec4 filterArea;',
            'uniform vec2 uScreenResolution;',
            'uniform vec4 uAmbientColor;',
            'uniform int uLightCount;',
            'uniform vec4 uLightPosRadius[12];',
            'uniform vec4 uLightColorCone[12];',
            'uniform vec2 uLightDir[12];',
            'uniform float uTime;',
            'uniform float uVignette;',
            'uniform float uSanityAberration;',
            'uniform float uHeatShimmer;',
            '',
            'float hash(vec2 p) {',
            '    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
            '}',
            '',
            'void main(void) {',
            '    vec2 uv = vTextureCoord;',
            '    ',
            '    if (uHeatShimmer > 0.0) {',
            '        uv.x += sin(uv.y * 35.0 + uTime * 2.0) * (0.003 * uHeatShimmer);',
            '    }',
            '    ',
            '    vec4 baseColor;',
            '    if (uSanityAberration > 0.01) {',
            '        vec2 offset = (uv - 0.5) * (uSanityAberration * 0.025);',
            '        float rCh = texture2D(uSampler, uv + offset).r;',
            '        float gCh = texture2D(uSampler, uv).g;',
            '        float bCh = texture2D(uSampler, uv - offset).b;',
            '        float aCh = texture2D(uSampler, uv).a;',
            '        baseColor = vec4(rCh, gCh, bCh, aCh);',
            '    } else {',
            '        baseColor = texture2D(uSampler, uv);',
            '    }',
            '    ',
            '    vec2 pixelPos = filterArea.x > 0.0 ? ((vTextureCoord * filterArea.xy) + filterArea.zw) : (vTextureCoord * uScreenResolution);',
            '    vec3 lightAccum = vec3(0.0);',
            '    ',
            '    for (int i = 0; i < 12; i++) {',
            '        if (i >= uLightCount) break;',
            '        vec4 pr = uLightPosRadius[i];',
            '        float r = pr.z;',
            '        if (r <= 0.0) continue;',
            '        ',
            '        vec2 lPos = pr.xy;',
            '        float intens = pr.w;',
            '        vec4 cc = uLightColorCone[i];',
            '        vec3 lCol = cc.rgb;',
            '        float coneCutoff = cc.w;',
            '        ',
            '        vec2 diff = pixelPos - lPos;',
            '        float dist = length(diff);',
            '        float d = dist / r;',
            '        if (d < 1.0) {',
            '            // Smooth windowing to 0 at r (strictly prevents hard circle cutoff boundary!)',
            '            float win = clamp(1.0 - (d * d * d * d), 0.0, 1.0);',
            '            win = win * win;',
            '            // Physical inverse-square attenuation curve',
            '            float atten = (win / (1.0 + d * d * 7.5)) * intens;',
            '            ',
            '            if (coneCutoff > -0.99 && dist > 2.0) {',
            '                vec2 lDir = normalize(diff);',
            '                float spot = dot(lDir, uLightDir[i]);',
            '                if (spot < coneCutoff) {',
            '                    atten = 0.0;',
            '                } else {',
            '                    float coneFactor = clamp((spot - coneCutoff) / (1.0 - coneCutoff + 0.001), 0.0, 1.0);',
            '                    atten *= smoothstep(0.0, 1.0, coneFactor);',
            '                }',
            '            }',
            '            ',
            '            lightAccum += lCol * atten;',
            '        }',
            '    }',
            '    ',
            '    // Atmospheric Night Darkness (Guardian Tales Deep Violet Night)',
            '    float nightFactor = clamp(uAmbientColor.a, 0.0, 1.0);',
            '    vec3 nightColor = uAmbientColor.rgb;',
            '    ',
            '    vec3 ambLight = mix(vec3(1.0), nightColor, nightFactor);',
            '    vec3 minLift = nightColor * (0.05 * nightFactor);',
            '    vec3 unlitColor = baseColor.rgb * ambLight + minLift;',
            '    ',
            '    // Filmic Saturation-Preserving Color Blending',
            '    // Prevents washed-out chalky white bleaching when lights overlap!',
            '    vec3 warmBounce = baseColor.rgb * (ambLight + lightAccum * 1.35);',
            '    vec3 radianceHighlight = lightAccum * 0.28;',
            '    vec3 litColor = warmBounce + radianceHighlight * clamp(1.0 - baseColor.rgb * 0.40, 0.0, 1.0);',
            '    ',
            '    float lightStrength = clamp(length(lightAccum) * 0.88, 0.0, 1.0);',
            '    vec3 finalColor = mix(unlitColor, litColor, lightStrength);',
            '    ',
            '    if (uVignette > 0.0) {',
            '        vec2 vUv = uv - 0.5;',
            '        float vig = 1.0 - dot(vUv, vUv) * (uVignette * 0.50);',
            '        finalColor *= clamp(vig, 0.85, 1.0);',
            '    }',
            '    ',
            '    float ditherNoise = (hash(uv + fract(uTime)) - 0.5) * (1.0 / 255.0);',
            '    finalColor += ditherNoise;',
            '    ',
            '    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), baseColor.a);',
            '}'
        ].join('\n');

        PIXI.Filter.call(this, vertexSrc, fragmentSrc);

        this.padding = 0;
        this.uniforms.uScreenResolution = [Graphics.boxWidth || 816, Graphics.boxHeight || 624];
        this.uniforms.uAmbientColor = [0.22, 0.11, 0.33, 0.65];
        this.uniforms.uLightCount = 0;
        this.uniforms.uLightPosRadius = new Float32Array(48);
        this.uniforms.uLightColorCone = new Float32Array(48);
        this.uniforms.uLightDir = new Float32Array(24);
        this.uniforms.uTime = 0.0;
        this.uniforms.uVignette = enableVignette ? 0.80 : 0.0;
        this.uniforms.uSanityAberration = 0.0;
        this.uniforms.uHeatShimmer = 0.0;
    }
    Yure_LightingFilter.prototype = Object.create(PIXI.Filter.prototype);
    Yure_LightingFilter.prototype.constructor = Yure_LightingFilter;

    // ========================================================================
    // 2. VOLUMETRIC LIGHT MOTES (DUST PARTICLES IN LIGHT)
    // ========================================================================
    function Sprite_VolumetricLightMotes() {
        this.initialize.apply(this, arguments);
    }
    Sprite_VolumetricLightMotes.prototype = Object.create(Sprite.prototype);
    Sprite_VolumetricLightMotes.prototype.constructor = Sprite_VolumetricLightMotes;

    Sprite_VolumetricLightMotes.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this.z = 7;
        this.blendMode = 1; // PIXI.BLEND_MODES.ADD
        this._motes = [];
        this.initMotes();
    };

    Sprite_VolumetricLightMotes.prototype.initMotes = function() {
        var count = Math.max(12, Math.min(64, lightMotesCount));
        for (var i = 0; i < count; i++) {
            this._motes.push({
                x: Math.random() * Graphics.boxWidth,
                y: Math.random() * Graphics.boxHeight,
                size: 1.0 + Math.random() * 2.0,
                speedY: 0.2 + Math.random() * 0.5,
                speedX: (Math.random() - 0.5) * 0.35,
                phase: Math.random() * Math.PI * 2
            });
        }
    };

    Sprite_VolumetricLightMotes.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this.bitmap) return;

        var sys = $gameSystem.yureLightSys();
        if (!sys.motesEnabled) {
            this.visible = false;
            return;
        }

        this.visible = true;
        this.bitmap.clear();
        var ctx = this.bitmap.context;
        if (!ctx) return;

        var activeLights = Spriteset_Map._activeLightSources || [];
        if (activeLights.length === 0) return;

        for (var i = 0; i < this._motes.length; i++) {
            var m = this._motes[i];
            m.y -= m.speedY;
            m.phase += 0.04;
            m.x += Math.sin(m.phase) * 0.3 + m.speedX;

            if (m.y < -10) { m.y = Graphics.boxHeight + 10; m.x = Math.random() * Graphics.boxWidth; }
            if (m.x < -10) m.x = Graphics.boxWidth + 10;
            if (m.x > Graphics.boxWidth + 10) m.x = -10;

            var lightBrightness = 0;
            var lightColor = '#ffffff';

            for (var k = 0; k < activeLights.length; k++) {
                var l = activeLights[k];
                var dx = m.x - l.x;
                var dy = m.y - l.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d < l.radius) {
                    var b = (1.0 - (d / l.radius)) * l.intensity;
                    if (b > lightBrightness) {
                        lightBrightness = b;
                        lightColor = 'rgb(' + Math.floor(l.rgb[0] * 255) + ',' + Math.floor(l.rgb[1] * 255) + ',' + Math.floor(l.rgb[2] * 255) + ')';
                    }
                }
            }

            if (lightBrightness > 0.05) {
                var alpha = lightBrightness * (0.4 + Math.sin(m.phase * 2) * 0.3);
                ctx.save();
                ctx.globalAlpha = Math.min(0.85, alpha);
                ctx.fillStyle = lightColor;
                ctx.shadowColor = lightColor;
                ctx.shadowBlur = m.size * 2.5;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        this.bitmap._setDirty();
    };


    // ========================================================================
    // ========================================================================
    // UNREAL-STYLE DYNAMIC SOFT BUILDING & CLIFF SHADOW ENGINE
    // Triple-Pass Separable Gaussian Diffusion with Directional Penumbra
    // ========================================================================
    function Sprite_SmoothBuildingShadows() {
        this.initialize.apply(this, arguments);
    }
    Sprite_SmoothBuildingShadows.prototype = Object.create(Sprite.prototype);
    Sprite_SmoothBuildingShadows.prototype.constructor = Sprite_SmoothBuildingShadows;

    Sprite_SmoothBuildingShadows.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.z = 0.5;
        this._mapId = 0;
        this._tileWidth = 48;
        this._tileHeight = 48;
        this.refreshShadows();
    };

    Sprite_SmoothBuildingShadows.prototype.clear = function() {
        // Defensive no-op stub for Pixi tilemap container safety
    };

    Sprite_SmoothBuildingShadows.prototype.refreshShadows = function() {
        if (typeof $gameMap === 'undefined' || !$gameMap || typeof $dataMap === 'undefined' || !$dataMap) return;
        if ((typeof UltraMode7 !== 'undefined' && UltraMode7.isActive && UltraMode7.isActive()) || (typeof $gameMap.isLimboVoid === 'function' && $gameMap.isLimboVoid())) {
            this.visible = false;
            return;
        }

        var mapNote = $dataMap.note || '';
        if (mapNote.match(/<(?:noShadows?|shadows?:\s*none)>/i)) {
            this.visible = false;
            return;
        }

        this._mapId = $gameMap.mapId();
        var w = $gameMap.width();
        var h = $gameMap.height();
        var data = $dataMap.data;
        if (!data || w <= 0 || h <= 0) return;

        var tw = this._tileWidth = $gameMap.tileWidth() || 48;
        var th = this._tileHeight = $gameMap.tileHeight() || 48;
        var scale = 0.5; // Half-res for silky bilinear filtering
        var bw = Math.ceil(w * tw * scale);
        var bh = Math.ceil(h * th * scale);

        // Check if map contains any shadow bits
        var hasShadows = false;
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var bits = data[(4 * h + y) * w + x];
                if (bits & 0x0f) {
                    hasShadows = true;
                    break;
                }
            }
            if (hasShadows) break;
        }

        if (!hasShadows) {
            this.visible = false;
            return;
        }

        // Custom parameters from map notetag or defaults
        var maxOpacity = 0.48;
        var opacityMatch = mapNote.match(/<shadow(?:Opacity|Alpha):\s*([0-9.]+)\s*>/i);
        if (opacityMatch) maxOpacity = Math.max(0.1, Math.min(1.0, parseFloat(opacityMatch[1])));

        var blurRadius = 5; // ~10px in half-res = 20px world penumbra
        var softnessMatch = mapNote.match(/<shadow(?:Softness|Radius):\s*([0-9.]+)\s*>/i);
        if (softnessMatch) blurRadius = Math.max(1, Math.min(12, Math.round(parseFloat(softnessMatch[1]) * 0.35)));

        var castOffsetX = 2; // Directional sun angle: light from top-left, casting down-right
        var castOffsetY = 2;
        var offsetMatch = mapNote.match(/<shadowOffset:\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*>/i);
        if (offsetMatch) {
            castOffsetX = Math.round(parseFloat(offsetMatch[1]) * scale);
            castOffsetY = Math.round(parseFloat(offsetMatch[2]) * scale);
        }

        this.visible = true;
        this.bitmap = new Bitmap(bw, bh);
        this.scale.set(1 / scale, 1 / scale);
        if (this.bitmap.baseTexture) {
            this.bitmap.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        }

        var buffer = new Float32Array(bw * bh);

        // 1. Populate raw shadow bit coverage into buffer with directional cast offset
        for (var ty = 0; ty < h; ty++) {
            for (var tx = 0; tx < w; tx++) {
                var bits = data[(4 * h + ty) * w + tx] & 0x0f;
                if (bits === 0) continue;
                var qx = Math.round(tx * tw * scale) + castOffsetX;
                var qy = Math.round(ty * th * scale) + castOffsetY;
                var hw = Math.round(tw * 0.5 * scale);
                var hh = Math.round(th * 0.5 * scale);

                var fillQuad = function(x0, y0, w0, h0) {
                    var yEnd = Math.min(bh, y0 + h0);
                    var xEnd = Math.min(bw, x0 + w0);
                    for (var py = Math.max(0, y0); py < yEnd; py++) {
                        var row = py * bw;
                        for (var px = Math.max(0, x0); px < xEnd; px++) {
                            buffer[row + px] = 1.0;
                        }
                    }
                };

                if (bits & 1) fillQuad(qx, qy, hw, hh);
                if (bits & 2) fillQuad(qx + hw, qy, hw, hh);
                if (bits & 4) fillQuad(qx, qy + hh, hw, hh);
                if (bits & 8) fillQuad(qx + hw, qy + hh, hw, hh);
            }
        }

        // 2. High-performance separable Gaussian diffusion (3-pass box blur)
        function boxBlurH(scl, tcl, w, h, r) {
            var arr = 1 / (r + r + 1);
            for (var i = 0; i < h; i++) {
                var ti = i * w, li = ti, ri = ti + r;
                var fv = scl[ti], lv = scl[ti + w - 1];
                var val = (r + 1) * fv;
                for (var j = 0; j < r; j++) val += scl[ti + j];
                for (var j = 0; j <= r; j++) { val += scl[ri++] - fv; tcl[ti++] = val * arr; }
                for (var j = r + 1; j < w - r; j++) { val += scl[ri++] - scl[li++]; tcl[ti++] = val * arr; }
                for (var j = w - r; j < w; j++) { val += lv - scl[li++]; tcl[ti++] = val * arr; }
            }
        }

        function boxBlurT(scl, tcl, w, h, r) {
            var arr = 1 / (r + r + 1);
            for (var i = 0; i < w; i++) {
                var ti = i, li = ti, ri = ti + r * w;
                var fv = scl[ti], lv = scl[ti + w * (h - 1)];
                var val = (r + 1) * fv;
                for (var j = 0; j < r; j++) val += scl[ti + j * w];
                for (var j = 0; j <= r; j++) { val += scl[ri] - fv; tcl[ti] = val * arr; ri += w; ti += w; }
                for (var j = r + 1; j < h - r; j++) { val += scl[ri] - scl[li]; tcl[ti] = val * arr; li += w; ri += w; ti += w; }
                for (var j = h - r; j < h; j++) { val += lv - scl[li]; tcl[ti] = val * arr; li += w; ti += w; }
            }
        }

        var temp = new Float32Array(bw * bh);
        boxBlurH(buffer, temp, bw, bh, blurRadius);
        boxBlurT(temp, buffer, bw, bh, blurRadius);
        boxBlurH(buffer, temp, bw, bh, blurRadius);
        boxBlurT(temp, buffer, bw, bh, blurRadius);
        boxBlurH(buffer, temp, bw, bh, blurRadius);
        boxBlurT(temp, buffer, bw, bh, blurRadius);

        // 3. Unreal Engine S-Curve & Ambient Occlusion Tone Transfer
        function smoothstep(edge0, edge1, x) {
            var t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
            return t * t * (3 - 2 * t);
        }

        var ctx = this.bitmap.context;
        var imgData = ctx.createImageData(bw, bh);
        var rgba = imgData.data;
        var shadowR = 18;
        var shadowG = 12;
        var shadowB = 32;

        for (var i = 0; i < buffer.length; i++) {
            var rawVal = buffer[i];
            if (rawVal <= 0.04) continue;
            var curved = smoothstep(0.04, 0.95, rawVal);
            var a = Math.round(curved * maxOpacity * 255);
            if (a > 0) {
                var idx = i * 4;
                rgba[idx] = shadowR;
                rgba[idx + 1] = shadowG;
                rgba[idx + 2] = shadowB;
                rgba[idx + 3] = a;
            }
        }

        ctx.putImageData(imgData, 0, 0);
        this.bitmap._setDirty();
    };

    // ========================================================================
    // REAL-TIME SOLAR TRAJECTORY & 24-HOUR AMBIENT LIGHTING ENGINE
    // ========================================================================
    function lerpColor(hexA, hexB, t) {
        t = Math.max(0, Math.min(1, t));
        var parse = function(h) {
            h = h.replace('#', '');
            if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
            return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
        };
        var cA = parse(hexA);
        var cB = parse(hexB);
        var r = Math.round(cA[0] + (cB[0] - cA[0]) * t);
        var g = Math.round(cA[1] + (cB[1] - cA[1]) * t);
        var b = Math.round(cA[2] + (cB[2] - cA[2]) * t);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function getSolarLightingData() {
        var hour = 12;
        var min = 0;
        if (typeof $gameSystem !== 'undefined' && $gameSystem) {
            if (typeof $gameSystem.hour === 'function') hour = $gameSystem.hour();
            else if (typeof $gameVariables !== 'undefined') hour = $gameVariables.value(10) || 12;
            if (typeof $gameSystem.minute === 'function') min = $gameSystem.minute();
        }
        var t = hour + min / 60.0;
        var darkness = 0.0;
        var colorHex = '#ffffff';
        var shadowX = 0.0;
        var shadowY = 3.0;
        var shadowScale = 1.0;
        var streetlights = 0.0; // 0.0 = off, 1.0 = fully on

        // Solar schedule:
        // 00:00 - 04:30 : Deep Night (Guardian Tales violet-indigo)
        // 04:30 - 05:30 : Pre-dawn (purple fading, streetlights fading out)
        // 05:30 - 07:00 : Sunrise (golden dawn, sun rising on LEFT -> shadow to RIGHT)
        // 07:00 - 11:00 : Morning (sun climbing left to zenith)
        // 11:00 - 13:30 : Midday / Noon (zenith, short shadows straight down)
        // 13:30 - 16:30 : Afternoon (sun descending towards RIGHT -> shadow to LEFT)
        // 16:30 - 18:00 : Golden Sunset (sore, fiery amber, streetlights ignite)
        // 18:00 - 19:30 : Dusk / Twilight (sore menjelang malam, transition to violet)
        // 19:30 - 24:00 : Night

        if (t >= 0.0 && t < 4.5) {
            darkness = 0.65;
            colorHex = '#381c54';
            shadowX = 3.0;
            shadowY = 3.0;
            shadowScale = 0.85;
            streetlights = 1.0;
        } else if (t >= 4.5 && t < 5.5) {
            var p0 = (t - 4.5) / 1.0;
            darkness = 0.65 - p0 * 0.25;
            colorHex = lerpColor('#381c54', '#552865', p0);
            shadowX = 3.0 + p0 * 3.0;
            shadowY = 3.0 + p0 * 1.5;
            shadowScale = 0.85;
            streetlights = Math.max(0.0, 1.0 - p0);
        } else if (t >= 5.5 && t < 7.0) {
            var p1 = (t - 5.5) / 1.5;
            darkness = 0.40 - p1 * 0.30;
            colorHex = lerpColor('#e4783c', '#fff0d0', p1);
            shadowX = 18.0 - p1 * 8.0; // Cast far to the right (+X)
            shadowY = 5.0 - p1 * 1.5;
            shadowScale = 1.35 - p1 * 0.25;
            streetlights = 0.0;
        } else if (t >= 7.0 && t < 11.0) {
            var p2 = (t - 7.0) / 4.0;
            darkness = 0.10 - p2 * 0.10;
            colorHex = lerpColor('#fff0d0', '#ffffff', p2);
            shadowX = 10.0 - p2 * 9.0; // 10px -> 1px
            shadowY = 3.5 - p2 * 0.5;
            shadowScale = 1.10 - p2 * 0.10;
            streetlights = 0.0;
        } else if (t >= 11.0 && t < 13.5) {
            darkness = 0.00;
            colorHex = '#ffffff'; // Pure daylight
            shadowX = 0.0; // Directly beneath!
            shadowY = 3.0;
            shadowScale = 0.95;
            streetlights = 0.0;
        } else if (t >= 13.5 && t < 16.5) {
            var p3 = (t - 13.5) / 3.0;
            darkness = p3 * 0.15;
            colorHex = lerpColor('#ffffff', '#ffeed0', p3);
            shadowX = -(p3 * 10.0); // 0px -> -10px (cast to the LEFT!)
            shadowY = 3.0 + p3 * 1.0;
            shadowScale = 0.95 + p3 * 0.15;
            streetlights = 0.0;
        } else if (t >= 16.5 && t < 18.0) {
            var p4 = (t - 16.5) / 1.5;
            darkness = 0.15 + p4 * 0.25;
            colorHex = lerpColor('#ffeed0', '#e06030', p4); // Sore / Fiery Sunset
            shadowX = -10.0 - p4 * 10.0; // -10px -> -20px (long shadows to the LEFT!)
            shadowY = 4.0 + p4 * 2.0;
            shadowScale = 1.10 + p4 * 0.30;
            streetlights = (t >= 17.25) ? ((t - 17.25) / 0.75) : 0.0;
        } else if (t >= 18.0 && t < 19.5) {
            var p5 = (t - 18.0) / 1.5;
            darkness = 0.40 + p5 * 0.25;
            colorHex = lerpColor('#c44828', '#381c54', p5); // Sunset crimson -> Guardian Tales violet
            shadowX = -20.0 + p5 * 23.0; // Smoothly blends into night moonlight offset
            shadowY = 6.0 - p5 * 3.0;
            shadowScale = 1.40 - p5 * 0.55;
            streetlights = Math.min(1.0, 0.65 + p5 * 0.35);
        } else {
            darkness = 0.65;
            colorHex = '#381c54';
            shadowX = 3.0;
            shadowY = 3.0;
            shadowScale = 0.85;
            streetlights = 1.0;
        }

        return {
            time: t,
            darkness: darkness,
            colorHex: colorHex,
            shadowX: shadowX,
            shadowY: shadowY,
            shadowScale: shadowScale,
            streetlights: streetlights
        };
    }

    Sprite_SmoothBuildingShadows.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (typeof $gameMap === 'undefined' || !$gameMap) return;
        if (this._mapId !== $gameMap.mapId()) {
            this.refreshShadows();
        }
        var tw = this._tileWidth || 48;
        var th = this._tileHeight || 48;

        // Dynamic Real-Time Solar Shadow Drift
        var solar = getSolarLightingData();
        var solarShiftX = Math.round(solar.shadowX * 0.45);
        var solarShiftY = Math.round(solar.shadowY * 0.45);

        this.x = Math.round(-$gameMap.displayX() * tw) + solarShiftX;
        this.y = Math.round(-$gameMap.displayY() * th) + solarShiftY;
    };

    // ========================================================================
    // UNREAL-STYLE DYNAMIC CHARACTER & NPC CONTACT DROP SHADOWS
    // ========================================================================
    function Sprite_YureCharacterShadow() {
        this.initialize.apply(this, arguments);
    }
    Sprite_YureCharacterShadow.prototype = Object.create(Sprite.prototype);
    Sprite_YureCharacterShadow.prototype.constructor = Sprite_YureCharacterShadow;

    Sprite_YureCharacterShadow._sharedBitmap = null;
    Sprite_YureCharacterShadow.getSharedBitmap = function() {
        if (!Sprite_YureCharacterShadow._sharedBitmap) {
            var bw = 48;
            var bh = 24;
            var bm = new Bitmap(bw, bh);
            var ctx = bm.context;
            var cx = bw / 2;
            var cy = bh / 2;
            var rx = 18;
            var ry = 7;
            var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
            grad.addColorStop(0.0, 'rgba(16, 10, 26, 0.48)');
            grad.addColorStop(0.55, 'rgba(16, 10, 26, 0.28)');
            grad.addColorStop(1.0, 'rgba(16, 10, 26, 0.00)');
            ctx.fillStyle = grad;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1.0, ry / rx);
            ctx.beginPath();
            ctx.arc(0, 0, rx, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            bm._setDirty();
            Sprite_YureCharacterShadow._sharedBitmap = bm;
        }
        return Sprite_YureCharacterShadow._sharedBitmap;
    };

    Sprite_YureCharacterShadow.prototype.initialize = function(characterSprite) {
        Sprite.prototype.initialize.call(this);
        this.bitmap = Sprite_YureCharacterShadow.getSharedBitmap();
        this.anchor.set(0.5, 0.5);
        this._characterSprite = characterSprite;
        this.z = 0.8;
    };

    Sprite_YureCharacterShadow.prototype.update = function() {
        Sprite.prototype.update.call(this);
        var charSprite = this._characterSprite;
        if (!charSprite || !charSprite._character) {
            this.visible = false;
            return;
        }
        var character = charSprite._character;

        // Limbo / Void suppression or map disabled
        if (typeof $gameMap !== 'undefined' && $gameMap && typeof $gameMap.isLimboVoid === 'function' && $gameMap.isLimboVoid()) {
            this.visible = false;
            return;
        }
        if (typeof $dataMap !== 'undefined' && $dataMap && $dataMap.note && $dataMap.note.match(/<noCharacterShadows?>/i)) {
            this.visible = false;
            return;
        }

        // Invisible event / empty character check
        var charName = character.characterName ? character.characterName() : '';
        if (!charName || (character.isTransparent && character.isTransparent()) || charSprite.opacity <= 0 || !charSprite.visible) {
            this.visible = false;
            return;
        }

        // Check if event has <noShadow> in note or comments
        if (character instanceof Game_Event) {
            var evData = character.event();
            if (evData && evData.note && evData.note.match(/<noShadow>/i)) {
                this.visible = false;
                return;
            }
        }

        // Ensure parent is tilemap
        if (charSprite.parent && this.parent !== charSprite.parent) {
            charSprite.parent.addChild(this);
        }

        this.visible = true;

        // Real-Time Solar Sun-Tracking Shadow Vector
        var solar = getSolarLightingData();
        var jump = (typeof character.jumpHeight === 'function') ? character.jumpHeight() : 0;
        var charScale = Math.max(0.4, 1.0 - jump / 56);

        this.x = charSprite.x + (solar.shadowX * 0.38);
        this.y = charSprite.y - 2 + jump + (solar.shadowY * 0.38);

        var stretchX = charScale * (0.8 + solar.shadowScale * 0.25);
        this.scale.set(stretchX, charScale);
        this.rotation = -Math.atan2(solar.shadowX, 24) * 0.45; // Subtle solar tilt angle
        this.alpha = 0.45 * charScale * (charSprite.opacity / 255);
    };

    // ========================================================================
    // 2.5. AUTOMATIC HD CHARACTER SCALING & SMOOTH ANTI-BURIK FILTERING
    // ========================================================================
    var YURE_HD_REF_HEIGHT = 128; // Standard tall character height in Yure Party (Nia, Sophia, Saki = 128px)
    var YURE_HD_REF_WIDTH = 96;

    function getYureCustomScale(character) {
        if (!character) return null;
        if (typeof Game_Event !== 'undefined' && character instanceof Game_Event) {
            var ev = character.event();
            if (ev && ev.note) {
                var m = ev.note.match(/<(?:scale|char_scale):\s*([0-9.]+)(?:,\s*([0-9.]+))?>/i);
                if (m) {
                    var sx = parseFloat(m[1]);
                    var sy = m[2] ? parseFloat(m[2]) : sx;
                    if (!isNaN(sx) && sx > 0 && !isNaN(sy) && sy > 0) return { x: sx, y: sy };
                }
            }
            var page = character.page();
            if (page && page.list) {
                for (var i = 0; i < page.list.length; i++) {
                    var cmd = page.list[i];
                    if (cmd.code === 108 || cmd.code === 408) {
                        var cm = cmd.parameters[0].match(/<(?:scale|char_scale):\s*([0-9.]+)(?:,\s*([0-9.]+))?>/i);
                        if (cm) {
                            var csx = parseFloat(cm[1]);
                            var csy = cm[2] ? parseFloat(cm[2]) : csx;
                            if (!isNaN(csx) && csx > 0 && !isNaN(csy) && csy > 0) return { x: csx, y: csy };
                        }
                    }
                }
            }
        }
        var isPlayer = (typeof Game_Player !== 'undefined' && character instanceof Game_Player);
        var isFollower = (typeof Game_Follower !== 'undefined' && character instanceof Game_Follower);
        if (isPlayer || isFollower) {
            var actor = null;
            if (isPlayer && typeof $gameParty !== 'undefined' && $gameParty.leader) {
                actor = $gameParty.leader();
            } else if (character.actor) {
                actor = character.actor();
            }
            if (actor && actor.actor && actor.actor() && actor.actor().note) {
                var am = actor.actor().note.match(/<(?:scale|char_scale):\s*([0-9.]+)(?:,\s*([0-9.]+))?>/i);
                if (am) {
                    var asx = parseFloat(am[1]);
                    var asy = am[2] ? parseFloat(am[2]) : asx;
                    if (!isNaN(asx) && asx > 0 && !isNaN(asy) && asy > 0) return { x: asx, y: asy };
                }
            }
        }
        return null;
    }

    var _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
    Sprite_Character.prototype.initMembers = function() {
        _Sprite_Character_initMembers.call(this);
        this._yureShadowSprite = new Sprite_YureCharacterShadow(this);
        this._autoScaleX = 1.0;
        this._autoScaleY = 1.0;
        this._isHDCharacter = false;
        this._autoScaleApplied = false;
    };

    var _Sprite_Character_setCharacterBitmap = Sprite_Character.prototype.setCharacterBitmap;
    Sprite_Character.prototype.setCharacterBitmap = function() {
        _Sprite_Character_setCharacterBitmap.call(this);
        this._autoScaleApplied = false;
        if (this.bitmap) {
            if (this.bitmap.isReady()) {
                this.updateAutoCharacterScale();
            } else {
                this.bitmap.addLoadListener(this.updateAutoCharacterScale.bind(this));
            }
        }
    };

    Sprite_Character.prototype.updateAutoCharacterScale = function() {
        if (!this.bitmap || !this.bitmap.isReady()) return;

        var customScale = getYureCustomScale(this._character);
        if (customScale) {
            this._autoScaleX = customScale.x;
            this._autoScaleY = customScale.y;
            this._isHDCharacter = (this._autoScaleY < 1.0);
        } else if (this._isBigCharacter) {
            var ph = this.bitmap.height / 4;
            if (ph > YURE_HD_REF_HEIGHT) {
                var s = YURE_HD_REF_HEIGHT / ph;
                this._autoScaleX = s;
                this._autoScaleY = s;
                this._isHDCharacter = true;
            } else {
                this._autoScaleX = 1.0;
                this._autoScaleY = 1.0;
                this._isHDCharacter = false;
            }
        } else {
            this._autoScaleX = 1.0;
            this._autoScaleY = 1.0;
            this._isHDCharacter = false;
        }

        // Apply smooth bilinear filtering for HD sprites so they are never burik
        if (this._isHDCharacter) {
            this.bitmap.smooth = true;
            if (this.bitmap.baseTexture) {
                this.bitmap.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            }
        }

        // Set sprite scale on 2D maps
        if (!(typeof UltraMode7 !== 'undefined' && UltraMode7.isActive && UltraMode7.isActive())) {
            this.scale.set(this._autoScaleX, this._autoScaleY);
        }

        this._autoScaleApplied = true;
    };

    var _Sprite_Character_updateBitmap = Sprite_Character.prototype.updateBitmap;
    Sprite_Character.prototype.updateBitmap = function() {
        _Sprite_Character_updateBitmap.call(this);
        if (!this._autoScaleApplied && this.bitmap && this.bitmap.isReady()) {
            this.updateAutoCharacterScale();
        }
        if (this._isHDCharacter && this.bitmap) {
            if (!this.bitmap.smooth) {
                this.bitmap.smooth = true;
                if (this.bitmap.baseTexture) {
                    this.bitmap.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
                }
            }
        }
    };

    var _Sprite_Character_updateOther = Sprite_Character.prototype.updateOther;
    Sprite_Character.prototype.updateOther = function() {
        _Sprite_Character_updateOther.call(this);
        if (!(typeof UltraMode7 !== 'undefined' && UltraMode7.isActive && UltraMode7.isActive())) {
            if (this._autoScaleX !== undefined && this._autoScaleY !== undefined) {
                this.scale.x = this._autoScaleX;
                this.scale.y = this._autoScaleY;
            }
        }
    };

    var _Sprite_Character_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
    Sprite_Character.prototype.updateCharacterFrame = function() {
        if (this._isHDCharacter && this._autoScaleY < 1.0 && this._bushDepth > 0) {
            var pw = this.patternWidth();
            var ph = this.patternHeight();
            var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
            var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
            this.updateHalfBodySprites();
            var d = Math.round(this._bushDepth / this._autoScaleY);
            if (this._upperBody && this._lowerBody) {
                this._upperBody.setFrame(sx, sy, pw, ph - d);
                this._lowerBody.setFrame(sx, sy + ph - d, pw, d);
                this._upperBody.y = -d;
            }
            this.setFrame(sx, sy, 0, ph);
        } else {
            _Sprite_Character_updateCharacterFrame.call(this);
        }
    };

    // UltraMode7 3D Perspective Scaling Integration
    if (typeof Sprite_Character !== 'undefined' && Sprite_Character.prototype._ultraMode7PreUpdate) {
        var _Sprite_Character_ultraMode7PreUpdate = Sprite_Character.prototype._ultraMode7PreUpdate;
        Sprite_Character.prototype._ultraMode7PreUpdate = function() {
            _Sprite_Character_ultraMode7PreUpdate.call(this);
            this.scale.x = (this._autoScaleX !== undefined ? this._autoScaleX : 1.0);
            this.scale.y = (this._autoScaleY !== undefined ? this._autoScaleY : 1.0);
        };
    }

    // Window_Base.prototype.drawCharacter HD Scaling for menus/saves
    var _Window_Base_drawCharacter = Window_Base.prototype.drawCharacter;
    Window_Base.prototype.drawCharacter = function(characterName, characterIndex, x, y) {
        var bitmap = ImageManager.loadCharacter(characterName);
        var big = ImageManager.isBigCharacter(characterName);
        if (big && bitmap && bitmap.isReady()) {
            var ph = bitmap.height / 4;
            if (ph > YURE_HD_REF_HEIGHT) {
                var pw = bitmap.width / 3;
                var scale = YURE_HD_REF_HEIGHT / ph;
                var dw = Math.round(pw * scale);
                var dh = YURE_HD_REF_HEIGHT;
                var n = characterIndex;
                var sx = (n % 4 * 3 + 1) * pw;
                var sy = (Math.floor(n / 4) * 4) * ph;
                this.contents.blt(bitmap, sx, sy, pw, ph, Math.round(x - dw / 2), y - dh, dw, dh);
                return;
            }
        }
        _Window_Base_drawCharacter.call(this, characterName, characterIndex, x, y);
    };

    // Case-insensitive loadCharacter for $eina / $Eina
    var _ImageManager_loadCharacter = ImageManager.loadCharacter;
    ImageManager.loadCharacter = function(filename, hue) {
        if (filename && filename.toLowerCase() === '$eina') {
            filename = '$Eina';
        }
        return _ImageManager_loadCharacter.call(this, filename, hue);
    };

    // Suppress harsh blocky 24px tilemap shadow rects
    var _ShaderTilemap_createLayers = ShaderTilemap.prototype._createLayers;
    ShaderTilemap.prototype._createLayers = function() {
        _ShaderTilemap_createLayers.call(this);
        if (this.lowerLayer && this.lowerLayer.shadowColor && !(typeof UltraMode7 !== 'undefined' && UltraMode7.isActive && UltraMode7.isActive())) {
            this.lowerLayer.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.0]);
        }
    };

    var _ShaderTilemap_drawShadow = ShaderTilemap.prototype._drawShadow;
    ShaderTilemap.prototype._drawShadow = function(layer, shadowBits, dx, dy) {
        if (typeof UltraMode7 !== 'undefined' && UltraMode7.isActive && UltraMode7.isActive()) {
            if (_ShaderTilemap_drawShadow) {
                _ShaderTilemap_drawShadow.call(this, layer, shadowBits, dx, dy);
            }
            return;
        }
        // Suppressed on 2D maps: Smooth building shadows rendered by Sprite_SmoothBuildingShadows
    };
    Tilemap.prototype._drawShadow = function() {
        // Suppressed: Smooth building shadows rendered by Sprite_SmoothBuildingShadows
    };

    // Deactivate UltraMode7 on LIMBO/Void maps so it renders as a pure 2D black void abyss
    if (typeof UltraMode7 !== 'undefined' && UltraMode7.isActive) {
        var _UltraMode7_isActive = UltraMode7.isActive;
        UltraMode7.isActive = function() {
            if (typeof $gameMap !== 'undefined' && $gameMap && typeof $gameMap.isLimboVoid === 'function' && $gameMap.isLimboVoid()) {
                return false;
            }
            return _UltraMode7_isActive.call(this);
        };
    }

    // ========================================================================
    // 3. SPRITESET_MAP INTEGRATION & TONE CONTROL
    // ========================================================================
    Spriteset_Map.prototype.createYureShaderLighting = function() {
        if (!this._yureLightingFilter) {
            this._yureLightingFilter = new Yure_LightingFilter();
            this._yureLightingFilter.padding = 0;
        }
        if (this._baseSprite) {
            this._baseSprite.filterArea = new PIXI.Rectangle(0, 0, Graphics.boxWidth, Graphics.boxHeight);
            this._baseSprite.filters = [this._yureLightingFilter];
        }
        this._animFrameTimer = 0;
        console.log('[Yure_LightingShadowShader] Master WebGL atmospheric night shader filter attached to _baseSprite on Map ' + (typeof $gameMap !== 'undefined' && $gameMap ? $gameMap.mapId() : '?'));
    };

    var _Spriteset_Base_createWebGLToneChanger = Spriteset_Base.prototype.createWebGLToneChanger;
    Spriteset_Base.prototype.createWebGLToneChanger = function() {
        _Spriteset_Base_createWebGLToneChanger.call(this);
        if (this instanceof Spriteset_Map) {
            this.createYureShaderLighting();
        }
    };

    var _Spriteset_Map_createToneChanger = Spriteset_Map.prototype.createToneChanger;
    Spriteset_Map.prototype.createToneChanger = function() {
        _Spriteset_Map_createToneChanger.call(this);
        this.createYureShaderLighting();
    };

    var _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.call(this);
        this.createSmoothBuildingShadows();
        this.createYureShaderLighting();
        if (enableLightMotes) {
            this.createVolumetricMotes();
        }
    };

    Spriteset_Map.prototype.createSmoothBuildingShadows = function() {
        if (!this._smoothBuildingShadows) {
            this._smoothBuildingShadows = new Sprite_SmoothBuildingShadows();
            this._smoothBuildingShadows.z = 0.5;
            if (this._tilemap) {
                this._tilemap.addChild(this._smoothBuildingShadows);
            } else if (this._baseSprite) {
                this._baseSprite.addChild(this._smoothBuildingShadows);
            }
        }
    };

    Spriteset_Map.prototype.createVolumetricMotes = function() {
        this._volumetricMotes = new Sprite_VolumetricLightMotes();
        this._baseSprite.addChild(this._volumetricMotes);
    };

    // Keep toneFilter neutral when our master lighting shader is handling the atmospheric rendering
    var _Spriteset_Base_updateToneChanger = Spriteset_Base.prototype.updateToneChanger;
    Spriteset_Base.prototype.updateToneChanger = function() {
        if (this._yureLightingFilter) {
            if (this._toneFilter) this._toneFilter.reset();
            return;
        }
        _Spriteset_Base_updateToneChanger.call(this);
    };

    // Soften battle screen tone at night so battles are atmospheric but clearly visible (not pitch black)
    Spriteset_Battle.prototype.updateToneChanger = function() {
        var rawTone = $gameScreen.tone();
        var battleTone = rawTone.clone();
        
        // Soften negative darkness tones (capping darkness at -48 max instead of -128)
        for (var i = 0; i < 3; i++) {
            if (battleTone[i] < 0) {
                battleTone[i] = Math.round(Math.max(-48, battleTone[i] * 0.38));
            }
        }
        // Add a gentle moonlit blue/purple lift to keep character & monster silhouettes crisp
        if (rawTone[0] < -30 && rawTone[1] < -30) {
            battleTone[2] = Math.min(0, battleTone[2] + 12);
        }

        if (!this._tone.equals(battleTone)) {
            this._tone = battleTone.clone();
            this.updateWebGLToneChanger();
        }
    };

    var _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        if (!this._yureLightingFilter) {
            this.createYureShaderLighting();
        }
        if (this._smoothBuildingShadows) {
            this._smoothBuildingShadows.update();
        }
        // LIMBO / Void Abyss Mode: Suppress background, tilemap layers, and shadows so ONLY entities exist in pitch darkness!
        if (typeof $gameMap !== 'undefined' && $gameMap && typeof $gameMap.isLimboVoid === 'function' && $gameMap.isLimboVoid()) {
            if (this._parallax) {
                this._parallax.visible = false;
                this._parallax.opacity = 0;
            }
            if (this._tilemap) {
                if (this._tilemap.lowerZLayer) this._tilemap.lowerZLayer.visible = false;
                if (this._tilemap.upperZLayer) this._tilemap.upperZLayer.visible = false;
                if (this._tilemap.lowerLayer) this._tilemap.lowerLayer.visible = false;
                if (this._tilemap.upperLayer) this._tilemap.upperLayer.visible = false;
            }
            if (this._smoothBuildingShadows) {
                this._smoothBuildingShadows.visible = false;
            }
            if (this._shadowSprite) {
                this._shadowSprite.visible = false;
            }
        }
        if (this._baseSprite) {
            if (!this._baseSprite.filters || this._baseSprite.filters.indexOf(this._yureLightingFilter) === -1) {
                this._baseSprite.filterArea = new PIXI.Rectangle(0, 0, Graphics.boxWidth, Graphics.boxHeight);
                this._baseSprite.filters = [this._yureLightingFilter];
            }
        }
        this.updateYureShaderLights();
    };

    Spriteset_Map.prototype.getAmbientData = function() {
        var sys = $gameSystem.yureLightSys();
        var darkness = defaultDarkness;
        var colorHex = defaultAmbientColor;

        // 1. Continuous Solar Time System Integration
        var solar = getSolarLightingData();
        darkness = solar.darkness;
        colorHex = solar.colorHex;

        // 2. Map Notetag override (<ambient: #hex, darkness>)
        if (typeof $dataMap !== 'undefined' && $dataMap && $dataMap.note) {
            var match = $dataMap.note.match(/<ambient\s*:\s*([^,>]+)(?:,\s*([\d.]+))?>/i);
            if (match) {
                if (match[1]) colorHex = match[1].trim();
                if (match[2]) darkness = Number(match[2]);
            }
        }

        // 3. Khusus Map 5 (Mansion Tutorial): Prioritas tertinggi selalu atmosferik malam ungu Guardian Tales
        if (typeof $gameMap !== 'undefined' && $gameMap && $gameMap.mapId() === 5) {
            darkness = 0.65;
            colorHex = '#381c54';
        }

        // 4. Khusus LIMBO / Void Map: Void murni pitch-black (entitas tetap tampil tajam)
        if (typeof $gameMap !== 'undefined' && $gameMap && typeof $gameMap.isLimboVoid === 'function' && $gameMap.isLimboVoid()) {
            darkness = 0.0;
            colorHex = '#000000';
        }

        // 5. Custom Script/Command override
        if (sys.customDarkness !== null) darkness = sys.customDarkness;
        if (sys.customAmbientColor !== null) colorHex = sys.customAmbientColor;

        var rgb = hexToRgb(colorHex);
        return [rgb[0], rgb[1], rgb[2], darkness];
    };

    Spriteset_Map.prototype.updateYureShaderLights = function() {
        if (!this._yureLightingFilter) return;

        this._animFrameTimer++;
        var t = this._animFrameTimer * 0.05;

        var sys = $gameSystem.yureLightSys();
        var solar = getSolarLightingData();
        var activeLights = [];

        // Check if map is outdoor or indoor
        var isOutdoorMap = true;
        if (typeof $dataMap !== 'undefined' && $dataMap && $dataMap.note) {
            if ($dataMap.note.match(/<(?:indoor|interior|room)>/i)) isOutdoorMap = false;
        }

        // 1. Player Light Source (Requires lantern item if enabled, and sys.playerLight must be true!)
        var hasLantern = (typeof $gameParty !== 'undefined' && $gameParty && $gameParty.hasLanternItem());
        if (hasLantern && sys.playerLight && typeof $gamePlayer !== 'undefined' && $gamePlayer) {
            var lanternItem = $gameParty.getLanternItem();
            if (lanternItem) $gameParty.applyLanternProperties(lanternItem);

            var px = $gamePlayer.screenX();
            var py = $gamePlayer.screenY() - 20;
            var pRadius = sys.playerRadius;
            var pIntensity = sys.playerIntensity;

            // Organic breathing flicker for lantern
            pRadius += Math.sin(t * 1.5) * 4 + Math.sin(t * 4.2) * 2;
            var pRgb = hexToRgb(sys.playerColor);

            var pCutoff = -1.0; // 360 degree lantern
            var pDirVec = [0.0, 1.0];

            if (sys.playerMode === 'flashlight') {
                var pDir = $gamePlayer.direction();
                var angleDeg = 45;
                pCutoff = Math.cos(angleDeg * Math.PI / 180);
                if (pDir === 2) pDirVec = [0.0, 1.0];       // Down
                else if (pDir === 4) pDirVec = [-1.0, 0.0];  // Left
                else if (pDir === 6) pDirVec = [1.0, 0.0];   // Right
                else if (pDir === 8) pDirVec = [0.0, -1.0];  // Up
            }

            activeLights.push({
                x: px,
                y: py,
                radius: pRadius,
                rgb: pRgb,
                intensity: pIntensity,
                coneCutoff: pCutoff,
                dir: pDirVec
            });
        }

        // 2. Map Events Light Sources (Torches, streetlights, fires, crystals)
        var events = (typeof $gameMap !== 'undefined' && $gameMap) ? $gameMap.events() : [];
        for (var i = 0; i < events.length; i++) {
            var ev = events[i];
            if (!ev) continue;
            if (!ev._yureLightData) {
                ev.setupYureShaderLight();
            }
            if (ev._yureLightData && !ev._erased) {
                var ld = ev._yureLightData;
                var ex = ev.screenX();
                var ey = ev.screenY() - 20;

                // Off-screen culling (skip lights far outside visible screen)
                if (ex < -250 || ex > Graphics.boxWidth + 250 || ey < -250 || ey > Graphics.boxHeight + 250) {
                    continue;
                }

                var rad = ld.radius;
                var intens = ld.intensity;

                // Automated Streetlight / Evening Light scheduling (sore menjelang malam: 17:30 to 05:30)
                var evNote = (ev.event && ev.event().note) ? ev.event().note : '';
                var isAlwaysOn = (ld.isAlways || evNote.match(/<(?:always|indoor|interior)>/i));
                var isStreetlight = (ld.isStreetlight || evNote.match(/<(?:streetlight|streetlamp|nightlight|lampuJalan)>/i));

                // Outdoor lights without <always> automatically follow the evening schedule
                if (!isAlwaysOn && (isStreetlight || isOutdoorMap)) {
                    intens *= solar.streetlights;
                }

                // If light is turned off during daytime, skip rendering halo!
                if (intens <= 0.01) {
                    continue;
                }

                // Multi-Octave Organic Flame / Torch Flicker (Realistic Harmonic Turbulence)
                if (ld.type === 'torch' || ld.type === 'candle') {
                    var f1 = Math.sin(t * 3.1 + i * 2.3) * 3.8;
                    var f2 = Math.sin(t * 7.7 + i * 1.7) * 2.2;
                    var f3 = Math.sin(t * 14.3 + i * 3.1) * 1.1;
                    var f4 = (Math.random() - 0.5) * 1.4;
                    rad += f1 + f2 + f3 + f4;
                    intens += (Math.sin(t * 4.2 + i * 1.9) * 0.06 + Math.sin(t * 9.8 + i) * 0.03);
                } else if (ld.type === 'pulse') {
                    rad += Math.sin(t * 2.0 + i) * 15.0;
                    intens += Math.sin(t * 2.0 + i) * 0.20;
                }

                var eRgb = hexToRgb(ld.color);
                var eCutoff = -1.0;
                var eDirVec = [0.0, 1.0];

                if (ld.isFlashlight) {
                    var eDir = ev.direction();
                    eCutoff = Math.cos(ld.coneAngle * Math.PI / 180);
                    if (eDir === 2) eDirVec = [0.0, 1.0];
                    else if (eDir === 4) eDirVec = [-1.0, 0.0];
                    else if (eDir === 6) eDirVec = [1.0, 0.0];
                    else if (eDir === 8) eDirVec = [0.0, -1.0];
                }

                activeLights.push({
                    x: ex,
                    y: ey,
                    radius: Math.max(10, rad),
                    rgb: eRgb,
                    intensity: Math.max(0, intens),
                    coneCutoff: eCutoff,
                    dir: eDirVec
                });

                if (activeLights.length >= 12) break;
            }
        }

        Spriteset_Map._activeLightSources = activeLights;

        // 3. Update Shader Uniforms (Pack into vec4 arrays for 100% WebGL/PIXI reliability)
        var count = Math.min(12, activeLights.length);
        var uPosRad = new Float32Array(48);
        var uColCone = new Float32Array(48);
        var uDir = new Float32Array(24);

        for (var k = 0; k < count; k++) {
            var lObj = activeLights[k];
            var i4 = k * 4;
            uPosRad[i4] = lObj.x;
            uPosRad[i4 + 1] = lObj.y;
            uPosRad[i4 + 2] = lObj.radius;
            uPosRad[i4 + 3] = lObj.intensity;

            uColCone[i4] = lObj.rgb[0];
            uColCone[i4 + 1] = lObj.rgb[1];
            uColCone[i4 + 2] = lObj.rgb[2];
            uColCone[i4 + 3] = lObj.coneCutoff;

            var i2 = k * 2;
            uDir[i2] = lObj.dir ? lObj.dir[0] : 0.0;
            uDir[i2 + 1] = lObj.dir ? lObj.dir[1] : 1.0;
        }

        var ambientData = this.getAmbientData();

        // 4. Sanity horror chromatic aberration check
        var sanityAberration = 0.0;
        if (enableSanityFX && typeof $gameParty !== 'undefined' && $gameParty && typeof $gameParty.leader === 'function' && $gameParty.leader()) {
            var leader = $gameParty.leader();
            if (leader.sanity !== undefined && leader.sanity <= 30) {
                var severity = (30 - leader.sanity) / 30; // 0.0 to 1.0
                sanityAberration = severity * (0.6 + Math.sin(t * 2.5) * 0.4);
            }
        }

        // 5. Heat wave shimmer check from map note (<heatShimmer: true>)
        var heatShimmer = 0.0;
        if (typeof $dataMap !== 'undefined' && $dataMap && $dataMap.note && $dataMap.note.match(/<heatShimmer\s*:\s*true>/i)) {
            heatShimmer = 1.0;
        }

        this._yureLightingFilter.uniforms.uScreenResolution = [Graphics.boxWidth, Graphics.boxHeight];
        this._yureLightingFilter.uniforms.uAmbientColor = ambientData;
        this._yureLightingFilter.uniforms.uLightCount = count;
        this._yureLightingFilter.uniforms.uLightPosRadius = uPosRad;
        this._yureLightingFilter.uniforms.uLightColorCone = uColCone;
        this._yureLightingFilter.uniforms.uLightDir = uDir;
        this._yureLightingFilter.uniforms.uTime = t;
        this._yureLightingFilter.uniforms.uSanityAberration = sanityAberration;
        this._yureLightingFilter.uniforms.uHeatShimmer = heatShimmer;
    };

    // Disable MOG_TimeSystem tint screen for Map 5 (Mansion Tutorial) so master shader has 100% control
    if (typeof Game_Map !== 'undefined') {
        var _Game_Map_set_time_sys_map = Game_Map.prototype.set_time_sys_map;
        Game_Map.prototype.set_time_sys_map = function(mapId) {
            if (_Game_Map_set_time_sys_map) _Game_Map_set_time_sys_map.call(this, mapId);
            if (mapId === 5) {
                if (typeof $gameScreen !== 'undefined' && $gameScreen) $gameScreen.startTint([0, 0, 0, 0], 0);
                if (typeof $gameSystem !== 'undefined' && $gameSystem && $gameSystem._time_data) {
                    $gameSystem._time_data[4] = false;
                }
                this._timesys_tintscreen = false;
            }
        };
    }

    // Enforce malam hari (22:00 / Fase 3) setiap kali masuk ke Map 5 (Mansion Tutorial)
    var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        if (typeof $gameMap !== 'undefined' && $gameMap && $gameMap.mapId() === 5) {
            if (typeof $gameVariables !== 'undefined' && $gameVariables) $gameVariables.setValue(10, 22); // Jam 22:00
            if (typeof $gameSwitches !== 'undefined' && $gameSwitches) {
                $gameSwitches.setValue(26, true);  // Saklar Malam ON
                $gameSwitches.setValue(23, false); // Saklar Siang OFF
                $gameSwitches.setValue(27, false); // Shift Siang OFF
                $gameSwitches.setValue(28, true);  // Shift Malam ON
            }
            if (typeof $gameSystem !== 'undefined' && $gameSystem && $gameSystem._time_data) {
                $gameSystem._time_data[1] = 3; // Fase 3 = Malam
            }
        }
    };

})();
