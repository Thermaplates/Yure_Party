//=============================================================================
// Yure_GhostFloat.js
//=============================================================================
/*:
 * @plugindesc [v1.0] Efek Animasi Melayang Naik-Turun (Ghost Floating) untuk Saki & Karakter Hantu.
 * @author Yure Party Team & Antigravity
 *
 * @param --- Pengaturan Karakter Hantu ---
 * @default
 *
 * @param Ghost Actor IDs
 * @parent --- Pengaturan Karakter Hantu ---
 * @desc Daftar Actor ID yang memiliki wujud hantu (pisahkan dengan koma). Saki = 3.
 * @default 3
 *
 * @param Auto Detect Saki Name
 * @parent --- Pengaturan Karakter Hantu ---
 * @desc Otomatis mengaktifkan efek melayang jika nama file sprite mengandung 'saki' atau 'ghost'.
 * @type boolean
 * @default true
 *
 * @param --- Pengaturan Fisika Melayang (Map) ---
 * @default
 *
 * @param Base Hover Elevation
 * @parent --- Pengaturan Fisika Melayang (Map) ---
 * @desc Ketinggian karakter terangkat di atas tanah (dalam pixel).
 * @type number
 * @default 8
 *
 * @param Float Bobbing Height
 * @parent --- Pengaturan Fisika Melayang (Map) ---
 * @desc Amplitudo ayunan naik-turun saat mengapung (dalam pixel).
 * @type number
 * @default 4
 *
 * @param Float Animation Speed
 * @parent --- Pengaturan Fisika Melayang (Map) ---
 * @desc Kecepatan ayunan naik-turun (0.03 = Lambat/Anggun, 0.05 = Standar).
 * @type number
 * @decimals 3
 * @default 0.048
 *
 * @param Enable Ghost Sway
 * @parent --- Pengaturan Fisika Melayang (Map) ---
 * @desc Efek meliuk/miring halus ke kiri-kanan saat mengapung di udara.
 * @type boolean
 * @default true
 *
 * @param Enable Opacity Pulse
 * @parent --- Pengaturan Fisika Melayang (Map) ---
 * @desc Denyut transparansi ghaib lembut pada tubuh hantu.
 * @type boolean
 * @default true
 *
 * @param Enable Phantom Trail
 * @parent --- Pengaturan Fisika Melayang (Map) ---
 * @desc Efek jejak bayangan ghaib (After-image trail) saat karakter bergerak.
 * @type boolean
 * @default true
 *
 * @param --- Pengaturan Pertarungan (Battle) ---
 * @default
 *
 * @param Enable Battle SV Float
 * @parent --- Pengaturan Pertarungan (Battle) ---
 * @desc Aktifkan animasi melayang pada SV Battler Saki di pertarungan.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * YURE GHOST FLOATING ANIMATION ENGINE (v1.0)
 * ============================================================================
 * Plugin ini memberikan efek melayang naik-turun dinamis (Ghost Float Effect)
 * untuk karakter yang berwujud hantu (seperti Saki - Actor ID 3).
 *
 * FITUR UTAMA:
 * 1. Elevasi Melayang di Map:
 *    - Karakter terangkat di atas permukaan tanah dan mengapung secara harmonis.
 *    - Meliuk lembut ke kiri-kanan dengan rotasi mikro alami layaknya arwah gentayangan.
 * 2. Denyut Transparansi & Jejak Ghaib:
 *    - Tubuh hantu memancarkan aura ghaib dan meninggalkan jejak bayangan halus.
 * 3. Otomatisasi Cerdas:
 *    - Otomatis aktif untuk Saki (Actor ID 3 / nama sprite '$Saki').
 *    - Berlaku baik saat Saki menjadi Pemimpin Party (Player Leader), Pengikut (Follower),
 *      maupun Event di peta.
 *
 * NOTETAGS:
 * - Pada Catatan (Note) Actor atau Event:
 *   <ghost>                 : Mengaktifkan efek melayang hantu.
 *   <float: height, speed>  : Mengatur tinggi dan kecepatan kustom.
 *
 * PLUGIN COMMANDS:
 *   GhostFloat enable [actorId]
 *   GhostFloat disable [actorId]
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_GhostFloat');
    var ghostActorIds = String(parameters['Ghost Actor IDs'] || '3')
        .split(',')
        .map(function(s) { return parseInt(s.trim(), 10); })
        .filter(function(n) { return !isNaN(n); });

    var autoDetectSaki = String(parameters['Auto Detect Saki Name'] || 'true') === 'true';
    var baseHover = Number(parameters['Base Hover Elevation'] || 8);
    var bobHeight = Number(parameters['Float Bobbing Height'] || 4);
    var floatSpeed = Number(parameters['Float Animation Speed'] || 0.048);
    var enableSway = String(parameters['Enable Ghost Sway'] || 'true') === 'true';
    var enableOpacityPulse = String(parameters['Enable Opacity Pulse'] || 'true') === 'true';
    var enableTrail = String(parameters['Enable Phantom Trail'] || 'true') === 'true';
    var enableBattleFloat = String(parameters['Enable Battle SV Float'] || 'true') === 'true';

    // ------------------------------------------------------------------------
    // Helper: Check if Character or Actor is a Ghost
    // ------------------------------------------------------------------------
    function isGhostCharacter(character) {
        if (!character) return false;

        // 1. Check if Player or Follower with Actor
        var actor = null;
        if (character instanceof Game_Player) {
            actor = $gameParty.leader();
        } else if (character instanceof Game_Follower) {
            actor = character.actor();
        }

        if (actor) {
            var aId = actor.actorId();
            if (ghostActorIds.indexOf(aId) !== -1) return true;
            if (actor.actor().note && actor.actor().note.match(/<ghost>/i)) return true;
        }

        // 2. Check Event Notetag / Comments
        if (character instanceof Game_Event) {
            if (character.event() && character.event().note && character.event().note.match(/<ghost>/i)) {
                return true;
            }
        }

        // 3. Auto-detect by character sprite name (Saki / Ghost)
        if (autoDetectSaki && character.characterName) {
            var cName = character.characterName().toLowerCase();
            if (cName.indexOf('saki') !== -1 || cName.indexOf('ghost') !== -1) {
                return true;
            }
        }

        return false;
    }

    // ========================================================================
    // 1. SPRITE_CHARACTER GHOST FLOAT ON MAP
    // ========================================================================
    var _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
    Sprite_Character.prototype.initMembers = function() {
        _Sprite_Character_initMembers.call(this);
        this._ghostTimer = Math.random() * Math.PI * 2;
        this._ghostTrails = [];
    };

    var _Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        _Sprite_Character_updatePosition.call(this);

        if (this._character && isGhostCharacter(this._character)) {
            this.updateGhostFloating();
        } else {
            this.rotation = 0;
        }
    };

    Sprite_Character.prototype.updateGhostFloating = function() {
        this._ghostTimer += floatSpeed;
        var t = this._ghostTimer;

        // 1. Vertical Levitation & Harmonic Bobbing
        var bob = Math.sin(t) * bobHeight;
        this.y -= (baseHover + bob);

        // 2. Horizontal Ethereal Sway & Micro Rotation
        if (enableSway) {
            this.x += Math.cos(t * 0.7) * 1.2;
            this.rotation = Math.sin(t * 0.7) * 0.025; // ~1.4 degrees smooth tilt
        }

        // 3. Phantom Opacity Pulse
        if (enableOpacityPulse && this._character.opacity() >= 255) {
            var pulse = Math.sin(t * 1.3) * 14;
            this.opacity = Math.floor(240 + pulse); // bobs between 226 and 254
        }

        // 4. Phantom After-Image Trail (Ghostly wake when moving/floating)
        if (enableTrail && this.parent && this.bitmap && this.bitmap.isReady()) {
            this.updateGhostTrail();
        }
    };

    Sprite_Character.prototype.updateGhostTrail = function() {
        if (!this._trailContainer && this.parent) {
            this._trailContainer = new Sprite();
            this.parent.addChildAt(this._trailContainer, Math.max(0, this.parent.getChildIndex(this) - 1));
        }

        // Spawn trail every 8 frames if moving or floating
        var isMoving = this._character.isMoving && this._character.isMoving();
        if (Graphics.frameCount % 8 === 0 && (isMoving || Math.random() < 0.35)) {
            if (this._ghostTrails.length < 4) {
                var tr = new Sprite(this.bitmap);
                tr.anchor.x = this.anchor.x;
                tr.anchor.y = this.anchor.y;
                tr.setFrame(this._frame.x, this._frame.y, this._frame.width, this._frame.height);
                tr.x = this.x;
                tr.y = this.y;
                tr.scale.x = this.scale.x;
                tr.scale.y = this.scale.y;
                tr.rotation = this.rotation;
                tr.opacity = 110;
                tr.tint = 0x99ddff; // Ethereal icy-cyan aura tint
                tr.blendMode = 1; // ADD
                this._ghostTrails.push(tr);
                if (this._trailContainer) this._trailContainer.addChild(tr);
            }
        }

        // Fade and clean up existing trails
        for (var i = this._ghostTrails.length - 1; i >= 0; i--) {
            var tSpr = this._ghostTrails[i];
            tSpr.opacity -= 6;
            tSpr.scale.x *= 1.008;
            tSpr.scale.y *= 1.008;
            tSpr.y -= 0.3;
            if (tSpr.opacity <= 0) {
                if (this._trailContainer) this._trailContainer.removeChild(tSpr);
                this._ghostTrails.splice(i, 1);
            }
        }
    };

    // ========================================================================
    // 2. SPRITE_ACTOR BATTLE SV FLOAT
    // ========================================================================
    if (enableBattleFloat) {
        var _Sprite_Actor_initMembers = Sprite_Actor.prototype.initMembers;
        Sprite_Actor.prototype.initMembers = function() {
            _Sprite_Actor_initMembers.call(this);
            this._actorGhostTimer = Math.random() * Math.PI * 2;
        };

        var _Sprite_Actor_updatePosition = Sprite_Actor.prototype.updatePosition;
        Sprite_Actor.prototype.updatePosition = function() {
            _Sprite_Actor_updatePosition.call(this);

            if (this._actor) {
                var aId = this._actor.actorId();
                var isGhost = ghostActorIds.indexOf(aId) !== -1 ||
                    (this._actor.actor().note && this._actor.actor().note.match(/<ghost>/i)) ||
                    (autoDetectSaki && this._actor.name && this._actor.name().toLowerCase().indexOf('saki') !== -1);

                if (isGhost) {
                    this._actorGhostTimer += floatSpeed;
                    var bY = Math.sin(this._actorGhostTimer) * (bobHeight + 2);
                    this.y -= (baseHover + bY);

                    if (enableSway) {
                        this.x += Math.cos(this._actorGhostTimer * 0.7) * 1.5;
                        this.rotation = Math.sin(this._actorGhostTimer * 0.7) * 0.02;
                    }
                } else {
                    this.rotation = 0;
                }
            }
        };
    }

    // ========================================================================
    // 3. PLUGIN COMMANDS
    // ========================================================================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command && command.toLowerCase() === 'ghostfloat') {
            var action = (args[0] || '').toLowerCase();
            var id = parseInt(args[1] || '3', 10);
            if (action === 'enable') {
                if (ghostActorIds.indexOf(id) === -1) ghostActorIds.push(id);
            } else if (action === 'disable') {
                var idx = ghostActorIds.indexOf(id);
                if (idx !== -1) ghostActorIds.splice(idx, 1);
            }
        }
    };

})();
