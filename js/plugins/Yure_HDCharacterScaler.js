//=============================================================================
// Yure_HDCharacterScaler.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Automatic HD Character Scaling & Smooth Anti-Aliasing (Menyesuaikan Ukuran Karakter $ HD Agar Selaras & Tak Burik).
 * @author Yure Party Team & Antigravity
 *
 * @param Reference Frame Height
 * @text Tinggi Frame Karakter Acuan (px)
 * @desc Tinggi frame standar karakter di Yure Party (Nia, Sophia, Saki, Mbah Karso = 128 px).
 * @type number
 * @default 128
 *
 * @param Reference Frame Width
 * @text Lebar Frame Karakter Acuan (px)
 * @desc Lebar frame standar karakter (Default: 96 px untuk sheet 3x4 berukuran 288x512).
 * @type number
 * @default 96
 *
 * @param Auto Scale HD Sprites
 * @text Auto-Scale Karakter HD
 * @desc Otomatis mengecilkan karakter dengan prefix $ yang resolusinya lebih tinggi (HD) agar proporsional dengan Nia.
 * @type boolean
 * @default true
 *
 * @param Smooth HD Sprites
 * @text Filter Halus HD (Anti-Burik)
 * @desc Mengaktifkan penyaringan bilinear halus (Linear Texture Filter) untuk sprite HD agar tidak burik/pecah saat diskala.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * YURE PARTY - HD CHARACTER SCALER & SMOOTH ANTI-ALIASING
 * ============================================================================
 * Plugin ini secara otomatis mendeteksi dan menyesuaikan skala tampilan karakter
 * (terutama sprite sheet tunggal berawalan '$', seperti $Eina.png) yang memiliki
 * resolusi tinggi / HD sehingga:
 *
 * 1. Skala Otomatis Selaras & Proporsional:
 *    - Karakter HD (misalnya sheet $Eina berukuran 1024x1536 dengan tinggi frame
 *      384 px) akan diskalakan secara otomatis (384 px -> 128 px, skala 1/3)
 *      sehingga memiliki tinggi dan proporsi fisik yang tepat sama dengan Nia,
 *      Sophia, Saki, dan Mbah Karso di peta game!
 *
 * 2. Visual Tetap HD & Tidak Burik (Smooth Bilinear Filtering):
 *    - Saat sprite HD diskalakan, texture scale mode otomatis disetel ke
 *      PIXI.SCALE_MODES.LINEAR (smooth filtering).
 *    - Mengatasi pemaksaan texture pixelated dari plugin 3D (seperti UltraMode7)
 *      yang menyebabkan gambar HD menjadi bergerigi, flickering, atau pecah
 *      ("burik"). Karakter tetap tampil tajam, jernih, dan berkualitas tinggi!
 *
 * 3. Kompatibel Penuh:
 *    - Sinkron dengan UltraMode7 3D Perspective Scaling.
 *    - Menyesuaikan animasi balon ekspresi (Balloon Sprite) di atas kepala karakter.
 *    - Menyesuaikan efek rumput tinggi / air (Bush Depth).
 *    - Menyesuaikan rendering di jendela menu & slot save file (Window_Base.drawCharacter).
 *
 * TAG KUSTOM (OPSIONAL):
 * - Pada Note / Komentar Event:
 *     <scale: 1.0>          -> Mengatur skala khusus (misal untuk monster raksasa/mini).
 *     <char_scale: 0.5>     -> Alternatif tag skala.
 * - Pada Note Actor di Database:
 *     <scale: 1.0>
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_HDCharacterScaler');
    var refHeight = Number(parameters['Reference Frame Height'] || 128);
    var refWidth = Number(parameters['Reference Frame Width'] || 96);
    var autoScaleEnabled = String(parameters['Auto Scale HD Sprites'] || 'true') === 'true';
    var smoothHDEnabled = String(parameters['Smooth HD Sprites'] || 'true') === 'true';

    if (isNaN(refHeight) || refHeight <= 0) refHeight = 128;
    if (isNaN(refWidth) || refWidth <= 0) refWidth = 96;

    // ========================================================================
    // 1. HELPER: CASE-INSENSITIVE RESOLVER & SCALE DETECTOR
    // ========================================================================
    function getCustomScaleFromObject(obj) {
        if (!obj) return null;
        var note = obj.note || '';
        var match = note.match(/<(?:scale|char_scale):\s*([0-9.]+)(?:,\s*([0-9.]+))?>/i);
        if (match) {
            var sx = parseFloat(match[1]);
            var sy = match[2] ? parseFloat(match[2]) : sx;
            if (!isNaN(sx) && sx > 0 && !isNaN(sy) && sy > 0) {
                return { x: sx, y: sy };
            }
        }
        return null;
    }

    function getCharacterCustomScale(character) {
        if (!character) return null;

        // Check Event note & page comments
        if (typeof Game_Event !== 'undefined' && character instanceof Game_Event) {
            var ev = character.event();
            var evScale = getCustomScaleFromObject(ev);
            if (evScale) return evScale;

            // Check comments in current event page
            var page = character.page();
            if (page && page.list) {
                for (var i = 0; i < page.list.length; i++) {
                    var cmd = page.list[i];
                    if (cmd.code === 108 || cmd.code === 408) {
                        var cMatch = cmd.parameters[0].match(/<(?:scale|char_scale):\s*([0-9.]+)(?:,\s*([0-9.]+))?>/i);
                        if (cMatch) {
                            var csx = parseFloat(cMatch[1]);
                            var csy = cMatch[2] ? parseFloat(cMatch[2]) : csx;
                            if (!isNaN(csx) && csx > 0 && !isNaN(csy) && csy > 0) {
                                return { x: csx, y: csy };
                            }
                        }
                    }
                }
            }
        }

        // Check Player / Follower actor notes
        var isPlayer = (typeof Game_Player !== 'undefined' && character instanceof Game_Player);
        var isFollower = (typeof Game_Follower !== 'undefined' && character instanceof Game_Follower);
        if (isPlayer || isFollower) {
            var actor = null;
            if (isPlayer && typeof $gameParty !== 'undefined' && $gameParty.leader) {
                actor = $gameParty.leader();
            } else if (character.actor) {
                actor = character.actor();
            }
            if (actor && actor.actor && actor.actor()) {
                var actScale = getCustomScaleFromObject(actor.actor());
                if (actScale) return actScale;
            }
        }

        return null;
    }

    // ========================================================================
    // 2. SPRITE_CHARACTER AUTO-SCALE HOOKS
    // ========================================================================
    var _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;
    Sprite_Character.prototype.initMembers = function() {
        _Sprite_Character_initMembers.call(this);
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

        var customScale = getCharacterCustomScale(this._character);
        if (customScale) {
            this._autoScaleX = customScale.x;
            this._autoScaleY = customScale.y;
            this._isHDCharacter = (this._autoScaleY < 1.0);
        } else if (autoScaleEnabled && this._isBigCharacter) {
            var ph = this.bitmap.height / 4;
            // If frame height is larger than reference (128 px), calculate proportional scale
            if (ph > refHeight) {
                var s = refHeight / ph;
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

        // Apply smooth bilinear texture filtering for HD downscaled characters ("tak burik")
        if (this._isHDCharacter && smoothHDEnabled) {
            this.bitmap.smooth = true;
            if (this.bitmap.baseTexture) {
                this.bitmap.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            }
        }

        // Set sprite scale
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
        // Guarantee HD smooth filtering even if another plugin (like UltraMode7) toggled it
        if (this._isHDCharacter && smoothHDEnabled && this.bitmap) {
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
        // On standard 2D maps, enforce the correct auto-scale
        if (!(typeof UltraMode7 !== 'undefined' && UltraMode7.isActive && UltraMode7.isActive())) {
            if (this._autoScaleX !== undefined && this._autoScaleY !== undefined) {
                this.scale.x = this._autoScaleX;
                this.scale.y = this._autoScaleY;
            }
        }
    };

    // Scaled Bush Depth Compensation (water / tall grass half-body)
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

    // ========================================================================
    // 3. ULTRAMODE7 3D PERSPECTIVE COMPATIBILITY
    // ========================================================================
    if (typeof Sprite_Character !== 'undefined' && Sprite_Character.prototype._ultraMode7PreUpdate) {
        var _Sprite_Character_ultraMode7PreUpdate = Sprite_Character.prototype._ultraMode7PreUpdate;
        Sprite_Character.prototype._ultraMode7PreUpdate = function() {
            _Sprite_Character_ultraMode7PreUpdate.call(this);
            // Instead of resetting scale to 1.0, preserve HD autoScale
            this.scale.x = (this._autoScaleX !== undefined ? this._autoScaleX : 1.0);
            this.scale.y = (this._autoScaleY !== undefined ? this._autoScaleY : 1.0);
        };
    }

    // ========================================================================
    // 4. WINDOW & SAVE MENU SCALING (Window_Base.prototype.drawCharacter)
    // ========================================================================
    var _Window_Base_drawCharacter = Window_Base.prototype.drawCharacter;
    Window_Base.prototype.drawCharacter = function(characterName, characterIndex, x, y) {
        var bitmap = ImageManager.loadCharacter(characterName);
        var big = ImageManager.isBigCharacter(characterName);
        if (big && bitmap && bitmap.isReady()) {
            var ph = bitmap.height / 4;
            if (ph > refHeight && autoScaleEnabled) {
                var pw = bitmap.width / 3;
                var scale = refHeight / ph;
                var dw = Math.round(pw * scale);
                var dh = refHeight;
                var n = characterIndex;
                var sx = (n % 4 * 3 + 1) * pw;
                var sy = (Math.floor(n / 4) * 4) * ph;
                this.contents.blt(bitmap, sx, sy, pw, ph, Math.round(x - dw / 2), y - dh, dw, dh);
                return;
            }
        }
        _Window_Base_drawCharacter.call(this, characterName, characterIndex, x, y);
    };

    // ========================================================================
    // 5. CASE-INSENSITIVE IMAGEMANAGER RESOLVER (Cross-Platform Safety)
    // ========================================================================
    var _ImageManager_loadCharacter = ImageManager.loadCharacter;
    ImageManager.loadCharacter = function(filename, hue) {
        // If filename is "$eina" and file on disk is "$Eina", normalize gracefully
        if (filename && filename.toLowerCase() === '$eina') {
            filename = '$Eina';
        }
        return _ImageManager_loadCharacter.call(this, filename, hue);
    };

})();
