//=============================================================================
// Yure_SkillCutin.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Cinematic Ultimate Skill Cut-In System with Voice & Clink SFX.
 * @author Lead Drain Production
 *
 * @param Default Clink SE
 * @desc Nama file Sound Effect saat Cut-in muncul (suara ceklink/shine/parry).
 * @default Parry
 *
 * @param Clink Volume
 * @desc Volume suara ceklink (0 - 100).
 * @default 95
 *
 * @param Clink Pitch
 * @desc Pitch suara ceklink (50 - 150).
 * @default 115
 *
 * @param Voice Volume
 * @desc Volume default suara karakter saat Ultimate (0 - 100).
 * @default 100
 *
 * @param Cutin Duration
 * @desc Durasi total animasi cut-in dalam frame (60 frame ≈ 1 detik).
 * @default 80
 *
 * @param Letterbox Height
 * @desc Tinggi bilah hitam sinematik di atas dan bawah layar (pixel).
 * @default 60
 *
 * @help
 * ============================================================================
 * YURE SKILL CUT-IN SYSTEM (ULTIMATE SKILL)
 * ============================================================================
 * Plugin ini memunculkan animasi Cinematic Cut-In bergaya anime/fighting game
 * saat karakter melancarkan skill berstatus "Ultimate".
 *
 * Dilengkapi dengan:
 * - Efek Bilah Sinematik (Cinematic Letterbox Bars)
 * - Efek Suara "Ceklink" / Star Gleam (Eye Flash)
 * - Pemutaran Suara Karakter (Voice Line) secara bersamaan
 * - Banner Nama Skill yang Elegan & Slanted
 * - Kompatibel penuh dengan Yure_QTE_V2: Hanya memicu Cut-in jika QTE "PERFECT!"
 *
 * ============================================================================
 * CARA PENGGUNAAN NOTETAG
 * ============================================================================
 * Tambahkan tag berikut di kolom "Note" pada Database Skills (F9 -> Skills):
 *
 * 1. Menandai Skill sebagai Ultimate (Wajib):
 *    <ultimate>
 *
 * 2. Menentukan Gambar Cut-In (Opsional):
 *    <Cutin: Skillcut_Sophia>
 *    (Secara default akan mencari file 'img/ui/unique/Skillcut_[NamaKarakter].png')
 *
 * 3. Menentukan File Suara Karakter (Opsional):
 *    <Cutin Voice: Sophia_ewgf>
 *    (File ditaruh di folder 'audio/se/', tanpa ekstensi .ogg/.m4a)
 *
 * 4. Mengubah Suara Ceklink Khusus Skill Ini (Opsional):
 *    <Cutin SE: Parry>
 *
 * ============================================================================
 * LOKASI FILE ASET
 * ============================================================================
 * - Gambar Cut-In: img/ui/unique/
 *   Contoh: img/ui/unique/Skillcut_Sophia.png
 * - Suara Karakter / SE: audio/se/
 *   Contoh: audio/se/Sophia_ewgf.ogg dan audio/se/Parry.ogg
 */

var Imported = Imported || {};
Imported.Yure_SkillCutin = true;

var Yure = Yure || {};
Yure.SkillCutin = Yure.SkillCutin || {};

(function() {
    'use strict';

    var params = PluginManager.parameters('Yure_SkillCutin');
    var defaultClinkSE = String(params['Default Clink SE'] || 'Parry').trim();
    var clinkVolume = Number(params['Clink Volume'] || 95);
    var clinkPitch = Number(params['Clink Pitch'] || 115);
    var defaultVoiceVolume = Number(params['Voice Volume'] || 100);
    var cutinDuration = Number(params['Cutin Duration'] || 80);
    if (cutinDuration === 52) cutinDuration = 80; // Upgrade legacy default 52 to 80
    var letterboxH = Number(params['Letterbox Height'] || 60);

    //-------------------------------------------------------------------------
    // Helper: Parse Metadata
    //-------------------------------------------------------------------------
    Yure.SkillCutin.isUltimateSkill = function(item) {
        if (!item || !item.note) return false;
        return /<ultimate>/i.test(item.note);
    };

    Yure.SkillCutin.getCutinImage = function(actor, item) {
        if (item && item.note) {
            var match = item.note.match(/<Cutin:\s*([^>]+)>/i);
            if (match) return match[1].trim().replace(/\.png$/i, '');
        }
        if (actor && actor.actor && actor.actor().note) {
            var matchActor = actor.actor().note.match(/<Cutin:\s*([^>]+)>/i);
            if (matchActor) return matchActor[1].trim().replace(/\.png$/i, '');
        }
        var actorName = actor ? actor.name() : 'Actor';
        return 'Skillcut_' + actorName;
    };

    Yure.SkillCutin.getCutinVoice = function(actor, item) {
        if (item && item.note) {
            var match = item.note.match(/<Cutin\s*Voice:\s*([^>]+)>/i) || item.note.match(/<Voice:\s*([^>]+)>/i);
            if (match) return match[1].trim().replace(/\.(ogg|m4a|mp3)$/i, '');
        }
        if (actor && actor.actor && actor.actor().note) {
            var matchActor = actor.actor().note.match(/<Cutin\s*Voice:\s*([^>]+)>/i) || actor.actor().note.match(/<Voice:\s*([^>]+)>/i);
            if (matchActor) return matchActor[1].trim().replace(/\.(ogg|m4a|mp3)$/i, '');
        }
        // Auto-fallback: Contoh Sophia + EWGF -> Sophia_ewgf
        if (actor && item) {
            var aName = actor.name().toLowerCase();
            var sName = item.name.toLowerCase();
            if (aName === 'sophia' && /egwf|ewgf|wind/i.test(sName)) {
                return 'Sophia_ewgf';
            }
        }
        return '';
    };

    Yure.SkillCutin.getClinkSE = function(item) {
        if (item && item.note) {
            var match = item.note.match(/<Cutin\s*SE:\s*([^>]+)>/i);
            if (match) return match[1].trim().replace(/\.(ogg|m4a|mp3)$/i, '');
        }
        return defaultClinkSE;
    };

    // Helper: Mendeteksi Bounding Box gambar transparan agar Cut-in selalu pas & besar
    Yure.SkillCutin.getVisibleBounds = function(bitmap) {
        if (!bitmap || !bitmap.width || !bitmap.height) return null;
        var w = bitmap.width;
        var h = bitmap.height;
        try {
            var ctx = bitmap._context;
            if (!ctx && bitmap._canvas) {
                ctx = bitmap._canvas.getContext('2d');
            }
            if (!ctx) return null;
            var imgData = ctx.getImageData(0, 0, w, h);
            var data = imgData.data;
            var minX = w, maxX = 0, minY = h, maxY = 0;
            var hasPixels = false;
            var step = 4;
            for (var y = 0; y < h; y += step) {
                for (var x = 0; x < w; x += step) {
                    var alpha = data[((y * w) + x) * 4 + 3];
                    if (alpha > 25) {
                        hasPixels = true;
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (!hasPixels) return null;
            return {
                x: minX,
                y: minY,
                width: Math.max(1, maxX - minX),
                height: Math.max(1, maxY - minY)
            };
        } catch (e) {
            return null;
        }
    };

    //-------------------------------------------------------------------------
    // BattleManager Integration for Non-QTE Ultimate Skills
    //-------------------------------------------------------------------------
    var _BattleManager_update = BattleManager.update;
    BattleManager.update = function() {
        if ($gameTemp && $gameTemp._cutinActive) {
            return; // Pause battle system while cut-in is running
        }
        _BattleManager_update.call(this);
    };

    var _BattleManager_isBusy = BattleManager.isBusy;
    BattleManager.isBusy = function() {
        if ($gameTemp && $gameTemp._cutinActive) return true;
        return _BattleManager_isBusy.call(this);
    };

    var _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        var subject = this._subject;
        var action = subject ? subject.currentAction() : null;
        var item = action ? action.item() : null;

        // Jika skill memiliki tag <ultimate> dan BUKAN skill QTE (karena skill QTE ditangani oleh QTE)
        if (item && Yure.SkillCutin.isUltimateSkill(item) && (!item.note || !/<QTE/i.test(item.note))) {
            if (!action._cutinHandled) {
                action._cutinHandled = true;
                var scene = SceneManager._scene;
                if (scene && scene instanceof Scene_Battle && typeof scene.playSkillCutin === 'function') {
                    $gameTemp._cutinActive = true;
                    scene.playSkillCutin(subject, item, function() {
                        $gameTemp._cutinActive = false;
                    });
                }
            }
        }
        _BattleManager_startAction.call(this);
    };

    //-------------------------------------------------------------------------
    // Scene_Battle Integration
    //-------------------------------------------------------------------------
    Scene_Battle.prototype.playSkillCutin = function(subject, item, onFinish) {
        if (this._skillCutinSprite) {
            this.removeChild(this._skillCutinSprite);
            this._skillCutinSprite = null;
        }

        var cutinSprite = new Sprite_SkillCutin(subject, item, function() {
            if (this._skillCutinSprite) {
                this.removeChild(this._skillCutinSprite);
                this._skillCutinSprite = null;
            }
            if (typeof onFinish === 'function') {
                onFinish();
            }
        }.bind(this));

        this._skillCutinSprite = cutinSprite;
        this.addChild(cutinSprite);
    };

    //-------------------------------------------------------------------------
    // Sprite_SkillCutin: Cinematic Cut-In Display
    //-------------------------------------------------------------------------
    function Sprite_SkillCutin() {
        this.initialize.apply(this, arguments);
    }

    Sprite_SkillCutin.prototype = Object.create(Sprite.prototype);
    Sprite_SkillCutin.prototype.constructor = Sprite_SkillCutin;

    Sprite_SkillCutin.prototype.initialize = function(actor, item, callback) {
        Sprite.prototype.initialize.call(this);
        this._actor = actor;
        this._item = item;
        this._callback = callback;
        this._frame = 0;
        this._maxFrames = cutinDuration;
        this._impactFrame = 16; // 16 frames slide-in (~0.26s)
        this._clinkPlayed = false;
        this._isEyeSlash = false;
        this._bounds = null;
        this.z = 9999;

        this.createLayers();
    };

    Sprite_SkillCutin.prototype.createLayers = function() {
        var w = Graphics.boxWidth;
        var h = Graphics.boxHeight;

        // 1. Dark Backdrop Vignette
        this._bgDim = new Sprite(new Bitmap(w, h));
        var ctx = this._bgDim.bitmap.context;
        var grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.7);
        grad.addColorStop(0, 'rgba(10, 14, 28, 0.75)');
        grad.addColorStop(1, 'rgba(3, 4, 10, 0.94)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        this._bgDim.alpha = 0;
        this.addChild(this._bgDim);

        // 2. Animated Diagonal Speedlines Canvas
        this._speedlines = new Sprite(new Bitmap(w, h));
        this.drawSpeedlines(this._speedlines.bitmap);
        this._speedlines.alpha = 0;
        this.addChild(this._speedlines);

        // 3. Diagonal Accent Color Slash (Cyber/Energy Banner)
        this._slashBanner = new Sprite(new Bitmap(w * 1.6, 320));
        var bCtx = this._slashBanner.bitmap.context;
        var bGrad = bCtx.createLinearGradient(0, 0, w * 1.6, 0);
        bGrad.addColorStop(0, 'rgba(0, 180, 255, 0)');
        bGrad.addColorStop(0.2, 'rgba(0, 220, 255, 0.40)');
        bGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.60)');
        bGrad.addColorStop(0.8, 'rgba(0, 140, 255, 0.40)');
        bGrad.addColorStop(1, 'rgba(0, 140, 255, 0)');
        bCtx.fillStyle = bGrad;
        bCtx.fillRect(0, 30, w * 1.6, 260);
        this._slashBanner.anchor.x = 0.5;
        this._slashBanner.anchor.y = 0.5;
        this._slashBanner.x = w / 2;
        this._slashBanner.y = h * 0.46;
        this._slashBanner.rotation = -0.10; // -5.7 degrees slanted
        this._slashBanner.alpha = 0;
        this.addChild(this._slashBanner);

        // 4. Character Cut-In Sprite (Auto-Scaled & Centered based on Visible Art)
        var imgName = Yure.SkillCutin.getCutinImage(this._actor, this._item);
        this._charaSprite = new Sprite(ImageManager.loadBitmap('img/ui/unique/', imgName, 0, true));
        this._charaSprite.anchor.x = 0.5;
        this._charaSprite.anchor.y = 0.5;
        this._charaSprite.x = w + 450; // Start off-screen right
        this._charaSprite.y = h * 0.46;
        this._charaSprite.alpha = 0;
        this._targetScale = 1.0;
        this._baseScale = 1.0;

        this._charaSprite.bitmap.addLoadListener(function(bitmap) {
            if (bitmap.height > 0) {
                var bounds = Yure.SkillCutin.getVisibleBounds(bitmap);
                if (bounds && (bounds.width > bounds.height * 1.4)) {
                    // Horizontal Cut-In Strip / Eye Slash (seperti Skillcut_Sophia)
                    this._isEyeSlash = true;
                    this._bounds = bounds;
                    this._charaSprite.anchor.x = (bounds.x + bounds.width * 0.5) / bitmap.width;
                    this._charaSprite.anchor.y = (bounds.y + bounds.height * 0.5) / bitmap.height;
                    // Skala dramatis: visible height ~325px, lebar ~1050px
                    var targetH = Graphics.boxHeight * 0.45;
                    this._baseScale = targetH / bounds.height;
                } else if (bounds) {
                    // Full Bust Portrait
                    this._isEyeSlash = false;
                    this._bounds = bounds;
                    this._charaSprite.anchor.x = (bounds.x + bounds.width * 0.5) / bitmap.width;
                    this._charaSprite.anchor.y = (bounds.y + bounds.height * 0.5) / bitmap.height;
                    var targetH = Graphics.boxHeight * 1.45;
                    this._baseScale = targetH / bounds.height;
                } else {
                    // Fallback
                    var targetH = Graphics.boxHeight * 1.45;
                    this._baseScale = targetH / bitmap.height;
                    this._charaSprite.anchor.x = 0.5;
                    this._charaSprite.anchor.y = 0.5;
                }
                this._targetScale = this._baseScale;
                this._charaSprite.scale.x = this._baseScale * 1.25;
                this._charaSprite.scale.y = this._baseScale * 1.25;
            }
        }.bind(this));
        this.addChild(this._charaSprite);

        // 5. Star Gleam / Clink Flash Spark
        this._gleamSprite = new Sprite(new Bitmap(200, 200));
        this.drawStarGleam(this._gleamSprite.bitmap);
        this._gleamSprite.anchor.x = 0.5;
        this._gleamSprite.anchor.y = 0.5;
        this._gleamSprite.visible = false;
        this.addChild(this._gleamSprite);

        // 6. Expanding Shockwave Ring
        this._ringSprite = new Sprite(new Bitmap(240, 240));
        this.drawRing(this._ringSprite.bitmap);
        this._ringSprite.anchor.x = 0.5;
        this._ringSprite.anchor.y = 0.5;
        this._ringSprite.visible = false;
        this.addChild(this._ringSprite);

        // 7. Fullscreen White Impact Flash
        this._impactFlash = new Sprite(new Bitmap(w, h));
        this._impactFlash.bitmap.fillAll('#ffffff');
        this._impactFlash.alpha = 0;
        this.addChild(this._impactFlash);

        // 8. Skill Title & Ultimate Badge Banner
        this._titleContainer = new Sprite(new Bitmap(600, 160));
        this.drawTitleBanner(this._titleContainer.bitmap);
        this._titleContainer.x = -600; // Start off-screen left
        this._titleContainer.y = h - 220;
        this.addChild(this._titleContainer);

        // 9. Cinematic Letterbox Bars (Top & Bottom)
        this._letterboxTop = new Sprite(new Bitmap(w, letterboxH));
        this._letterboxTop.bitmap.fillAll('#000000');
        this._letterboxTop.y = -letterboxH;
        this.addChild(this._letterboxTop);

        this._letterboxBottom = new Sprite(new Bitmap(w, letterboxH));
        this._letterboxBottom.bitmap.fillAll('#000000');
        this._letterboxBottom.y = h;
        this.addChild(this._letterboxBottom);
    };

    Sprite_SkillCutin.prototype.drawSpeedlines = function(bitmap) {
        var w = bitmap.width;
        var h = bitmap.height;
        var ctx = bitmap.context;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        for (var i = 0; i < 35; i++) {
            var y = Math.random() * h;
            var len = 150 + Math.random() * 400;
            var x = Math.random() * (w - len);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + len, y);
            ctx.stroke();
        }
    };

    Sprite_SkillCutin.prototype.drawStarGleam = function(bitmap) {
        var cx = 100;
        var cy = 100;
        var ctx = bitmap.context;

        // Radial glow center
        var g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 60);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.3, 'rgba(180, 240, 255, 0.8)');
        g.addColorStop(1, 'rgba(0, 180, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 60, 0, Math.PI * 2);
        ctx.fill();

        // 4-point Diamond Rays
        ctx.fillStyle = '#ffffff';
        // Horizontal ray
        ctx.beginPath();
        ctx.moveTo(cx - 95, cy);
        ctx.quadraticCurveTo(cx, cy - 8, cx + 95, cy);
        ctx.quadraticCurveTo(cx, cy + 8, cx - 95, cy);
        ctx.fill();

        // Vertical ray
        ctx.beginPath();
        ctx.moveTo(cx, cy - 95);
        ctx.quadraticCurveTo(cx - 8, cy, cx, cy + 95);
        ctx.quadraticCurveTo(cx + 8, cy, cx, cy - 95);
        ctx.fill();
    };

    Sprite_SkillCutin.prototype.drawRing = function(bitmap) {
        var cx = 120;
        var cy = 120;
        var ctx = bitmap.context;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 55, 0, Math.PI * 2);
        ctx.stroke();
    };

    Sprite_SkillCutin.prototype.drawTitleBanner = function(bitmap) {
        var ctx = bitmap.context;
        var skillName = this._item ? this._item.name.toUpperCase() : 'ULTIMATE SKILL';
        var actorName = this._actor ? this._actor.name().toUpperCase() : '';

        // Clean name (e.g. "EGWF (PERFECT QTE)" -> "EGWF")
        skillName = skillName.replace(/\s*\(.*\)/, '').trim();

        // Slanted background ribbon
        ctx.save();
        ctx.transform(1, 0, -0.22, 1, 30, 0); // Slanted matrix
        var ribbonGrad = ctx.createLinearGradient(0, 0, 500, 0);
        ribbonGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        ribbonGrad.addColorStop(0.7, 'rgba(30, 58, 138, 0.85)');
        ribbonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ribbonGrad;
        ctx.fillRect(0, 30, 480, 90);

        // Gold border line on top of ribbon
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, 27, 460, 3);
        ctx.restore();

        // Small Subtitle: "★ ULTIMATE ART ★"
        ctx.font = 'bold 15px Montserrat, Arial Black, sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.fillText('★ ULTIMATE ART  •  ' + actorName, 55, 58);

        // Big Main Skill Name
        ctx.font = 'italic 900 38px Montserrat, "Arial Black", Impact, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00d2ff';
        ctx.shadowBlur = 12;
        ctx.fillText(skillName, 55, 102);
    };

    Sprite_SkillCutin.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this._frame++;

        var w = Graphics.boxWidth;
        var h = Graphics.boxHeight;
        var targetX = this._isEyeSlash ? (w * 0.52) : (w * 0.58);
        var targetY = this._isEyeSlash ? (h * 0.46) : (h * 0.52);

        // Phase 1: Entrance (Frames 1 to _impactFrame: 16 frames)
        if (this._frame <= this._impactFrame) {
            var p = this._frame / this._impactFrame;
            var ease = 1 - Math.pow(1 - p, 3); // Cubic ease out

            // Letterbox slide in
            this._letterboxTop.y = -letterboxH + letterboxH * ease;
            this._letterboxBottom.y = h - letterboxH * ease;

            // Background & Slash fade in
            this._bgDim.alpha = ease;
            this._speedlines.alpha = ease * 0.7;
            this._slashBanner.alpha = ease * 0.85;

            // Character slide in with scale overshoot
            var startX = w + 450;
            this._charaSprite.x = startX + (targetX - startX) * ease;
            this._charaSprite.y = targetY;
            this._charaSprite.alpha = ease;
            this._charaSprite.scale.x = (this._baseScale * 1.25) - (0.25 * this._baseScale * ease);
            this._charaSprite.scale.y = this._charaSprite.scale.x;

            // Title Banner slide in
            this._titleContainer.x = -600 + 640 * ease;
        }

        // Phase 2: Impact Moment (Frame == _impactFrame) -> Ceklink SFX + Voice Line + Star Gleam!
        if (this._frame === this._impactFrame && !this._clinkPlayed) {
            this._clinkPlayed = true;

            // 1. Play "Ceklink" SFX
            var clinkSE = Yure.SkillCutin.getClinkSE(this._item);
            if (clinkSE) {
                AudioManager.playSe({ name: clinkSE, volume: clinkVolume, pitch: clinkPitch, pan: 0 });
            }

            // 2. Play Character Voice simultaneously!
            var voiceSE = Yure.SkillCutin.getCutinVoice(this._actor, this._item);
            if (voiceSE) {
                AudioManager.playSe({ name: voiceSE, volume: defaultVoiceVolume, pitch: 100, pan: 0 });
            }

            // 3. Trigger Screen Impact Flash & Star Gleam on Character Eye
            this._impactFlash.alpha = 0.65;

            var gleamOffsetX = 0;
            var gleamOffsetY = 0;
            var aName = (this._actor ? this._actor.name().toLowerCase() : '');
            var imgName = Yure.SkillCutin.getCutinImage(this._actor, this._item);
            if (aName === 'sophia' || /sophia/i.test(imgName)) {
                // Sophia purple eye offset relative to cut-in art center
                gleamOffsetX = 114 * this._baseScale;
                gleamOffsetY = 5 * this._baseScale;
            } else if (this._bounds) {
                gleamOffsetX = (this._bounds.width * 0.15) * this._baseScale;
                gleamOffsetY = (-this._bounds.height * 0.05) * this._baseScale;
            }

            this._gleamSprite.visible = true;
            this._gleamSprite.x = this._charaSprite.x + gleamOffsetX;
            this._gleamSprite.y = this._charaSprite.y + gleamOffsetY;
            this._gleamSprite.scale.x = 0.2;
            this._gleamSprite.scale.y = 0.2;
            this._gleamSprite.alpha = 1.0;

            this._ringSprite.visible = true;
            this._ringSprite.x = this._gleamSprite.x;
            this._ringSprite.y = this._gleamSprite.y;
            this._ringSprite.scale.x = 0.3;
            this._ringSprite.scale.y = 0.3;
            this._ringSprite.alpha = 1.0;
        }

        // Star Gleam & Impact Flash Animation (Frames _impactFrame to _impactFrame + 18)
        if (this._frame >= this._impactFrame && this._frame < this._impactFrame + 18) {
            var gp = (this._frame - this._impactFrame) / 18;

            // Flash fade out
            this._impactFlash.alpha = Math.max(0, this._impactFlash.alpha - 0.06);

            // Star Gleam rotate, expand then fade
            if (this._gleamSprite.visible) {
                this._gleamSprite.rotation += 0.10;
                if (gp < 0.3) {
                    this._gleamSprite.scale.x = 0.2 + (1.3 * (gp / 0.3));
                    this._gleamSprite.scale.y = this._gleamSprite.scale.x;
                } else {
                    this._gleamSprite.alpha = 1.0 - ((gp - 0.3) / 0.7);
                }
            }

            // Expanding Shockwave Ring
            if (this._ringSprite.visible) {
                this._ringSprite.scale.x = 0.3 + 1.8 * gp;
                this._ringSprite.scale.y = this._ringSprite.scale.x;
                this._ringSprite.alpha = 1.0 - gp;
            }
        } else if (this._frame >= this._impactFrame + 18) {
            this._gleamSprite.visible = false;
            this._ringSprite.visible = false;
        }

        // Phase 3: Hold & Slow Cinematic Drift (Frames 17 to _maxFrames - 12)
        var exitStart = this._maxFrames - 12;
        if (this._frame > this._impactFrame && this._frame < exitStart) {
            // Slow cinematic drift & zoom (dramatic hold)
            this._charaSprite.x += 0.25;
            this._charaSprite.scale.x += 0.0006;
            this._charaSprite.scale.y = this._charaSprite.scale.x;

            // Speedlines scroll
            this._speedlines.x -= 7;
            if (this._speedlines.x < -80) this._speedlines.x = 0;
        }

        // Phase 4: Exit Slash (Last 12 Frames)
        if (this._frame >= exitStart && this._frame <= this._maxFrames) {
            var ep = (this._frame - exitStart) / 12;
            var exitEase = Math.pow(ep, 2); // Accelerate out

            // Character slashes off to the left
            this._charaSprite.x -= 100 * exitEase;
            this._charaSprite.alpha = 1.0 - ep;

            // Banner slashes left
            this._titleContainer.x -= 70 * exitEase;
            this._titleContainer.alpha = 1.0 - ep;

            // Letterbox retracts
            this._letterboxTop.y = -letterboxH * ep;
            this._letterboxBottom.y = h - letterboxH * (1.0 - ep);

            this._bgDim.alpha = 1.0 - ep;
            this._slashBanner.alpha = 1.0 - ep;
            this._speedlines.alpha = 1.0 - ep;
        }

        // Phase 5: Complete & Resume Battle Action
        if (this._frame >= this._maxFrames) {
            if (this._callback) {
                var cb = this._callback;
                this._callback = null;
                cb();
            }
        }
    };

})();
