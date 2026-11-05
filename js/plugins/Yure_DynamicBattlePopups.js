//=============================================================================
// Yure_DynamicBattlePopups.js
//=============================================================================
/*:
 * @plugindesc [v4.0] Tipografi Damage/Heal, HP Gauge Musuh Dinamis, Proyektil Icon Besar + Trail Komet, Sinkronisasi QTE, & Ledakan Bersih.
 * @author Yure Party Team
 *
 * @param --- Pengaturan Tipografi Popup ---
 * @default
 *
 * @param Popup Font Family
 * @parent --- Pengaturan Tipografi Popup ---
 * @desc Jenis font untuk angka damage/heal (GameFont, Impact, Arial Black, Trebuchet MS).
 * @default Impact, Arial Black, GameFont, sans-serif
 *
 * @param Damage Font Size
 * @parent --- Pengaturan Tipografi Popup ---
 * @desc Ukuran font angka damage normal (dalam pixel).
 * @type number
 * @default 36
 *
 * @param Critical Font Size
 * @parent --- Pengaturan Tipografi Popup ---
 * @desc Ukuran font angka saat Critical Hit.
 * @type number
 * @default 48
 *
 * @param Popup Duration
 * @parent --- Pengaturan Tipografi Popup ---
 * @desc Durasi angka melayang di layar (frame).
 * @type number
 * @default 85
 *
 * @param Elastic Bounce Scale
 * @parent --- Pengaturan Tipografi Popup ---
 * @desc Skala awal saat pop-in membal (1.6 = Membal sedang, 2.0 = Membal besar).
 * @type number
 * @decimals 2
 * @default 1.80
 *
 * @param --- Warna & Gradient Popup ---
 * @default
 *
 * @param Normal Damage Gradient
 * @parent --- Warna & Gradient Popup ---
 * @desc Gradient warna damage normal (TopColor, BottomColor, OutlineColor).
 * @default #ffffff, #f0f0f0, #111111
 *
 * @param Heavy Damage Gradient
 * @parent --- Warna & Gradient Popup ---
 * @desc Gradient warna damage berat > 500 (TopColor, BottomColor, GlowColor).
 * @default #fff466, #ff7700, #ff2200
 *
 * @param Critical Gradient
 * @parent --- Warna & Gradient Popup ---
 * @desc Gradient warna saat Critical Hit.
 * @default #ffffff, #ff1744, #ff0055
 *
 * @param Heal Gradient
 * @parent --- Warna & Gradient Popup ---
 * @desc Gradient warna saat pemulihan HP (Heal).
 * @default #e8fff0, #00e676, #007a3d
 *
 * @param MP Gain Gradient
 * @parent --- Warna & Gradient Popup ---
 * @desc Gradient warna saat pemulihan MP / TP / Rage.
 * @default #e1f5fe, #00b0ff, #005cb2
 *
 * @param Miss Text Color
 * @parent --- Warna & Gradient Popup ---
 * @desc Warna tulisan MISS / DODGE.
 * @default #b0bec5, #78909c, #263238
 *
 * @param --- HP Gauge Musuh Dinamis ---
 * @default
 *
 * @param Enable Enemy HP Gauge
 * @parent --- HP Gauge Musuh Dinamis ---
 * @desc Tampilkan gauge HP dinamis di atas setiap unit musuh di medan laga.
 * @type boolean
 * @default true
 *
 * @param --- Efek Proyektil Icon Skill (Aura Skill Tile & Komet Trail) ---
 * @default
 *
 * @param Enable Skill Tiles
 * @parent --- Efek Proyektil Icon Skill (Aura Skill Tile & Komet Trail) ---
 * @desc Aktifkan proyektil persegi icon skill ber-aura yang melesat ke target musuh/party.
 * @type boolean
 * @default true
 *
 * @param --- Efek Kamera & Impact Visual ---
 * @default
 *
 * @param Enable Impact Camera Punch
 * @parent --- Efek Kamera & Impact Visual ---
 * @desc Efek micro-zoom kamera pada medan tempur saat serangan mendarat (Impact Punch).
 * @type boolean
 * @default true
 *
 * @param Critical Screen Flash
 * @parent --- Efek Kamera & Impact Visual ---
 * @desc Kilatan layar putih sesaat saat Critical Hit mendarat.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * SISTEM POPUP DAMAGE & PROYEKTIL SKILL DINAMIS V4.0 (YURE DYNAMIC BATTLE POPUPS)
 * ============================================================================
 * 
 * Fitur & Pembaruan v4.0:
 * 1. PROYEKTIL PERSEGI BESAR (116x116) DENGAN ICON 88x88 & TRAIL KOMET MENYALA:
 *    - Ukuran diperbesar secara signifikan sehingga gambar skill/item terlihat
 *      sangat jelas, besar, dan memukau.
 *    - Dilengkapi 8 ghost afterimages + partikel percikan komet berpendar neon
 *      yang mengekor di belakang proyektil selama melesat.
 *
 * 2. HP GAUGE MUSUH DINAMIS DI ATAS KEPALA (DYNAMIC ENEMY HP GAUGE):
 *    - Setiap unit musuh di medan laga memiliki gauge HP melayang di atas kepalanya.
 *    - Dilengkapi nama musuh, bar ghost damage (lerp kuning/oranye halus),
 *      dan gradasi warna bar HP dinamis (Hijau Zamrud > 50%, Emas 25-50%, Merah < 25%).
 *    - Bergetar saat terkena serangan dan memudar halus saat kalah.
 *
 * 3. SINKRONISASI PENUH DENGAN SISTEM QTE (YURE_QTE_V2):
 *    - Skill dengan tag <QTE> TIDAK AKAN memunculkan proyektil sebelum/saat QTE berjalan.
 *    - Proyektil baru melesat SETELAH QTE selesai dievaluasi:
 *      * Jika PERFECT : Menampilkan icon & aura skill upgrade (Contoh: EGWF / Dorya!).
 *      * Jika MISS/FAIL: Menampilkan icon & aura skill alternatif (Contoh: Wind Ghost Fist!).
 *
 * 4. MULTI-TARGET BARRAGE KE SELURUH KARTU PARTY / MUSUH:
 *    - Serangan Musuh Tunggal: Melesat dari musuh ke kartu party target di sebelah kiri.
 *    - Serangan Musuh AoE: Meluncurkan 3 hingga 4 proyektil sekaligus ke setiap kartu party!
 *    - Serangan Aktor AoE: Meluncurkan proyektil sekaligus ke setiap musuh yang masih hidup.
 *
 * 5. LEDAKAN IMPACT BERSIH TANPA BEKAS (ZERO-RESIDUAL):
 *    - Saat tiba di target, seluruh proyektil & jejak seketika bersih 100%.
 *    - Menghasilkan ledakan shockwave & kilatan partikel radial sesuai tema warna skill.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.Yure_DynamicBattlePopups = true;

(function() {
    'use strict';

    var params = PluginManager.parameters('Yure_DynamicBattlePopups');
    var popupFontFamily = String(params['Popup Font Family'] || 'Impact, Arial Black, GameFont, sans-serif');
    var normalFontSize = Number(params['Damage Font Size'] || 36);
    var critFontSize = Number(params['Critical Font Size'] || 48);
    var popupDuration = Number(params['Popup Duration'] || 85);
    var elasticScale = Number(params['Elastic Bounce Scale'] || 1.80);

    var normalGrad = String(params['Normal Damage Gradient'] || '#ffffff, #f0f0f0, #111111').split(',').map(function(s){return s.trim();});
    var heavyGrad = String(params['Heavy Damage Gradient'] || '#fff466, #ff7700, #ff2200').split(',').map(function(s){return s.trim();});
    var critGrad = String(params['Critical Gradient'] || '#ffffff, #ff1744, #ff0055').split(',').map(function(s){return s.trim();});
    var healGrad = String(params['Heal Gradient'] || '#e8fff0, #00e676, #007a3d').split(',').map(function(s){return s.trim();});
    var mpGrad = String(params['MP Gain Gradient'] || '#e1f5fe, #00b0ff, #005cb2').split(',').map(function(s){return s.trim();});
    var missColors = String(params['Miss Text Color'] || '#b0bec5, #78909c, #263238').split(',').map(function(s){return s.trim();});

    var enableEnemyHp = (params['Enable Enemy HP Gauge'] !== 'false');
    var enableSkillTiles = (params['Enable Skill Tiles'] !== 'false');
    var enableImpactPunch = (params['Enable Impact Camera Punch'] !== 'false');
    var enableCritFlash = (params['Critical Screen Flash'] !== 'false');

    // ============================================================================
    // 1. HIGH-DPI VECTOR SPRITE_DAMAGE & ELASTIC BOUNCE
    // ============================================================================
    var _Sprite_Damage_initialize = Sprite_Damage.prototype.initialize;
    Sprite_Damage.prototype.initialize = function() {
        _Sprite_Damage_initialize.call(this);
        this._duration = popupDuration;
        this._animTick = 0;
        this._isCritical = false;
        this._isHeal = false;
        this._digitsSprite = null;
    };

    Sprite_Damage.prototype.setup = function(target) {
        var result = target.shiftDamagePopup ? target.shiftDamagePopup() : target.result();
        if (!result) return;

        this._result = result;
        this._isCritical = !!result.critical;
        this._isHeal = (result.hpDamage < 0 || (result.hpAffected && result.hpDamage === 0 && result.drain));

        if (result.missed || result.evaded) {
            this.createDynamicMissPopup();
        } else if (result.hpAffected) {
            this.createDynamicDamagePopup(result.hpDamage, 0, result.critical);
        } else if (target.isAlive() && result.mpDamage !== 0) {
            this.createDynamicDamagePopup(result.mpDamage, 2, result.critical);
        }

        if (enableImpactPunch && (result.hpDamage > 0 || result.critical)) {
            triggerBattleImpactPunch(result.critical);
        }
    };

    function triggerBattleImpactPunch(isCrit) {
        if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._battleField) {
            var bf = SceneManager._scene._spriteset._battleField;
            bf._impactPunchTime = isCrit ? 14 : 8;
            bf._impactPunchMax = isCrit ? 0.045 : 0.022;
        }
        if (isCrit && enableCritFlash && $gameScreen) {
            $gameScreen.startFlash([255, 255, 255, 150], 14);
            $gameScreen.startShake(5, 8, 16);
        }
    }

    Sprite_Damage.prototype.createDynamicDamagePopup = function(value, type, isCrit) {
        var isHeal = value < 0;
        var absVal = Math.abs(value);
        var text = (isHeal ? '+' : '') + String(absVal);
        
        var fontSize = isCrit ? critFontSize : (absVal > 1500 ? (normalFontSize + 6) : normalFontSize);
        var w = Math.max(180, text.length * (fontSize * 0.75) + 60);
        var h = fontSize + 44;

        var bmp = new Bitmap(w, h);
        var ctx = bmp.context;

        var topColor = normalGrad[0] || '#ffffff';
        var botColor = normalGrad[1] || '#e0e0e0';
        var outlineColor = normalGrad[2] || '#000000';

        if (isHeal) {
            topColor = healGrad[0] || '#e8fff0';
            botColor = healGrad[1] || '#00e676';
            outlineColor = healGrad[2] || '#007a3d';
        } else if (type === 2) {
            topColor = mpGrad[0] || '#e1f5fe';
            botColor = mpGrad[1] || '#00b0ff';
            outlineColor = mpGrad[2] || '#005cb2';
        } else if (isCrit) {
            topColor = critGrad[0] || '#ffffff';
            botColor = critGrad[1] || '#ff1744';
            outlineColor = critGrad[2] || '#ff0055';
        } else if (absVal > 500) {
            topColor = heavyGrad[0] || '#fff466';
            botColor = heavyGrad[1] || '#ff7700';
            outlineColor = heavyGrad[2] || '#ff2200';
        }

        ctx.save();
        ctx.font = 'italic 900 ' + fontSize + 'px ' + popupFontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var cx = w / 2;
        var cy = h / 2 + (isCrit ? 10 : 0);

        ctx.shadowColor = outlineColor;
        ctx.shadowBlur = isCrit ? 18 : 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = isCrit ? 8 : 6;
        ctx.strokeText(text, cx, cy);

        var grad = ctx.createLinearGradient(0, cy - fontSize / 2, 0, cy + fontSize / 2);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, botColor);
        ctx.fillStyle = grad;
        ctx.fillText(text, cx, cy);

        if (isCrit) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff2200';
            ctx.font = 'italic 900 16px ' + popupFontFamily;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.strokeText('★ CRITICAL ★', cx, cy - (fontSize * 0.65));
            ctx.fillStyle = '#ffea00';
            ctx.fillText('★ CRITICAL ★', cx, cy - (fontSize * 0.65));
        }

        ctx.restore();
        bmp._setDirty();

        var sprite = new Sprite(bmp);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = 0;
        sprite.y = 0;
        this._digitsSprite = sprite;
        this.addChild(sprite);
    };

    Sprite_Damage.prototype.createDynamicMissPopup = function() {
        var w = 180;
        var h = 60;
        var bmp = new Bitmap(w, h);
        var ctx = bmp.context;

        ctx.save();
        ctx.font = 'italic 900 32px ' + popupFontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.strokeText('MISS', w / 2, h / 2);

        var grad = ctx.createLinearGradient(0, 10, 0, 50);
        grad.addColorStop(0, missColors[0] || '#ffffff');
        grad.addColorStop(1, missColors[1] || '#90a4ae');
        ctx.fillStyle = grad;
        ctx.fillText('MISS', w / 2, h / 2);
        ctx.restore();
        bmp._setDirty();

        var sprite = new Sprite(bmp);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        this._digitsSprite = sprite;
        this.addChild(sprite);
    };

    Sprite_Damage.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._duration > 0) {
            this._duration--;
            this._animTick++;

            if (this._digitsSprite) {
                var tick = this._animTick;
                if (tick <= 14) {
                    var t = tick / 14;
                    var scale = 1.0 + Math.exp(-t * 5.5) * Math.cos(t * Math.PI * 3.5) * (elasticScale - 1.0);
                    this._digitsSprite.scale.x = Math.max(0.2, scale);
                    this._digitsSprite.scale.y = Math.max(0.2, scale);
                } else {
                    this._digitsSprite.scale.x = 1.0;
                    this._digitsSprite.scale.y = 1.0;
                    this._digitsSprite.y -= 0.55;
                }

                if (this._duration < 22) {
                    this.opacity = (this._duration / 22) * 255;
                }
            }
        } else if (this.parent) {
            this.parent.removeChild(this);
        }
    };

    // ============================================================================
    // 2. FIX POPUP DAMAGE / HEAL PADA PARTY CARD DI KIRI & MUSUH
    // ============================================================================
    var _Sprite_Battler_setupDamagePopup = Sprite_Battler.prototype.setupDamagePopup;
    Sprite_Battler.prototype.setupDamagePopup = function() {
        if (this._battler && this._battler.isActor()) {
            if (this._battler.isDamagePopupRequested()) {
                var sprite = new Sprite_Damage();
                var actorIndex = $gameParty.battleMembers().indexOf(this._battler);
                if (actorIndex < 0) actorIndex = this._battler.index();

                sprite.x = 295;
                sprite.y = 65 + (actorIndex * 140);
                sprite.setup(this._battler);

                if (SceneManager._scene && SceneManager._scene._spriteset) {
                    SceneManager._scene._spriteset.addChild(sprite);
                } else if (this.parent) {
                    this.parent.addChild(sprite);
                }
                this._battler.clearResult();
                this._battler.clearDamagePopup();
                return;
            }
        }
        _Sprite_Battler_setupDamagePopup.call(this);
    };

    Game_Actor.prototype.isDamagePopupRequested = function() {
        var res = this.result();
        return (res.hpAffected || res.mpDamage !== 0 || res.missed || res.evaded);
    };

    // ============================================================================
    // 3. PERBAIKAN KURSOR TARGET SELECTION PARTY (ALLY TARGET SELECTION)
    // ============================================================================
    var _Scene_Battle_createActorWindow = Scene_Battle.prototype.createActorWindow;
    Scene_Battle.prototype.createActorWindow = function() {
        _Scene_Battle_createActorWindow.call(this);
        if (this._actorWindow) {
            this._actorWindow.x = 0;
            this._actorWindow.y = 0;
            this._actorWindow.width = 280;
            this._actorWindow.height = Graphics.boxHeight;
            this._actorWindow.opacity = 0;
            this._actorWindow.padding = 0;
        }
    };

    Window_BattleActor.prototype.itemHeight = function() { return 140; };
    Window_BattleActor.prototype.maxCols = function() { return 1; };
    Window_BattleActor.prototype.drawItem = function(index) {};

    Window_BattleActor.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        rect.x = 0;
        rect.y = index * 140;
        rect.width = 260;
        rect.height = 130;
        return rect;
    };

    Window_BattleActor.prototype.updateCursor = function() {
        if (this._cursorAll) {
            var count = $gameParty.battleMembers().length;
            this.setCursorRect(0, 0, 260, count * 140);
        } else if (this.isCursorVisible()) {
            var rect = this.itemRect(this.index());
            this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
        } else {
            this.setCursorRect(0, 0, 0, 0);
        }
    };

    var _setupPethogsCardTargetGlow = function() {
        if (typeof Window_PethogsActorCard !== 'undefined' && !Window_PethogsActorCard.prototype._glowPatched) {
            Window_PethogsActorCard.prototype._glowPatched = true;
            var _Window_PethogsActorCard_update = Window_PethogsActorCard.prototype.update;
            Window_PethogsActorCard.prototype.update = function() {
                _Window_PethogsActorCard_update.call(this);
                
                var scene = SceneManager._scene;
                var isActorTargeting = (scene && scene._actorWindow && scene._actorWindow.active);
                if (isActorTargeting) {
                    var isSelected = (scene._actorWindow.index() === this._index || scene._actorWindow._cursorAll);
                    if (isSelected) {
                        if (!this._targetGlowSprite) {
                            this._targetGlowSprite = new Sprite(new Bitmap(260, 130));
                            this._targetGlowSprite.anchor.x = 0;
                            this._targetGlowSprite.anchor.y = 0;
                            this.addChild(this._targetGlowSprite);
                        }
                        this._targetGlowSprite.visible = true;
                        var pulse = (Math.sin(Graphics.frameCount * 0.15) + 1) / 2;
                        this._targetGlowSprite.bitmap.clear();
                        var ctx = this._targetGlowSprite.bitmap.context;
                        ctx.save();
                        ctx.strokeStyle = '#38bdf8';
                        ctx.lineWidth = 3 + pulse * 2;
                        ctx.shadowColor = '#00e5ff';
                        ctx.shadowBlur = 12 + pulse * 8;
                        ctx.strokeRect(2, 2, 256, 126);
                        ctx.restore();
                        this._targetGlowSprite.bitmap._setDirty();
                        return;
                    }
                }
                if (this._targetGlowSprite) {
                    this._targetGlowSprite.visible = false;
                }
            };
        }
    };

    var _Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        _Scene_Battle_start.call(this);
        _setupPethogsCardTargetGlow();
    };

    // ============================================================================
    // 4. DYNAMIC ENEMY HP GAUGE (ATTACHED TO ALL ENEMIES)
    // ============================================================================
    function Sprite_DynamicEnemyHpGauge() {
        this.initialize.apply(this, arguments);
    }
    Sprite_DynamicEnemyHpGauge.prototype = Object.create(Sprite.prototype);
    Sprite_DynamicEnemyHpGauge.prototype.constructor = Sprite_DynamicEnemyHpGauge;

    Sprite_DynamicEnemyHpGauge.prototype.initialize = function(enemySprite) {
        Sprite.prototype.initialize.call(this);
        this._enemySprite = enemySprite;
        this.anchor.x = 0.5;
        this.anchor.y = 1.0;
        this._gaugeWidth = 120;
        this._gaugeHeight = 28;
        this.bitmap = new Bitmap(this._gaugeWidth, this._gaugeHeight);
        this._curHpRate = 1.0;
        this._ghostHpRate = 1.0;
        this._ghostDelay = 0;
        this._shakeFrames = 0;
        this._lastHp = -1;
    };

    Sprite_DynamicEnemyHpGauge.prototype.update = function() {
        Sprite.prototype.update.call(this);
        var enemy = this._enemySprite ? this._enemySprite._enemy : null;
        if (!enableEnemyHp || !enemy || enemy.isDead() || !this._enemySprite.visible || this._enemySprite.opacity <= 0) {
            this.visible = false;
            return;
        }

        this.visible = true;

        // Position directly above enemy sprite head
        var sprH = (this._enemySprite.bitmap && this._enemySprite.bitmap.height > 0) ? this._enemySprite.bitmap.height : 80;
        this.x = this._enemySprite.x + (this._shakeFrames > 0 ? (Math.random() * 6 - 3) : 0);
        this.y = this._enemySprite.y - (sprH * this._enemySprite.anchor.y) - 10;

        if (this._shakeFrames > 0) this._shakeFrames--;

        var targetRate = enemy.hpRate();
        var needsRedraw = false;

        if (targetRate < this._curHpRate) {
            this._curHpRate = targetRate;
            this._ghostDelay = 22;
            this._shakeFrames = 6;
            needsRedraw = true;
        } else if (targetRate > this._curHpRate) {
            this._curHpRate = targetRate;
            this._ghostHpRate = targetRate;
            needsRedraw = true;
        }

        if (this._ghostDelay > 0) {
            this._ghostDelay--;
        } else if (this._ghostHpRate > this._curHpRate) {
            this._ghostHpRate += (this._curHpRate - this._ghostHpRate) * 0.08;
            if (this._ghostHpRate - this._curHpRate < 0.002) this._ghostHpRate = this._curHpRate;
            needsRedraw = true;
        }

        if (this._lastHp !== enemy.hp || needsRedraw) {
            this.refreshGauge(enemy);
        }
    };

    Sprite_DynamicEnemyHpGauge.prototype.refreshGauge = function(enemy) {
        this._lastHp = enemy.hp;
        var w = this._gaugeWidth;
        var h = this._gaugeHeight;
        this.bitmap.clear();
        var ctx = this.bitmap.context;

        ctx.save();

        // 1. Enemy Name (Centered)
        ctx.font = 'bold 12px ' + popupFontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#f1f5f9';
        ctx.fillText(enemy.name(), w / 2, 0);

        // 2. HP Bar Capsule Geometry
        var barW = w - 16;
        var barH = 7;
        var bx = 8;
        var by = 16;
        var r = 3.5;

        // Background Track
        ctx.beginPath();
        ctx.moveTo(bx + r, by); ctx.lineTo(bx + barW - r, by);
        ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + r);
        ctx.lineTo(bx + barW, by + barH - r);
        ctx.quadraticCurveTo(bx + barW, by + barH, bx + barW - r, by + barH);
        ctx.lineTo(bx + r, by + barH);
        ctx.quadraticCurveTo(bx, by + barH, bx, by + barH - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Ghost Catch-up Bar (Yellow/Orange)
        var ghostW = Math.max(0, Math.floor(barW * this._ghostHpRate));
        if (ghostW > 0) {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(bx + 1, by + 1, ghostW - 2, barH - 2);
        }

        // 4. Main HP Fill with Color Shift based on HP %
        var curW = Math.max(0, Math.floor(barW * this._curHpRate));
        if (curW > 0) {
            var cTop = '#00e676';
            var cBot = '#059669';
            if (this._curHpRate <= 0.25) {
                cTop = '#ff1744';
                cBot = '#b91c1c';
            } else if (this._curHpRate <= 0.50) {
                cTop = '#fbbf24';
                cBot = '#d97706';
            }

            var hpGrad = ctx.createLinearGradient(bx, by, bx + curW, by);
            hpGrad.addColorStop(0, cTop);
            hpGrad.addColorStop(1, cBot);
            ctx.fillStyle = hpGrad;
            ctx.fillRect(bx + 1, by + 1, curW - 2, barH - 2);
        }

        ctx.restore();
        this.bitmap._setDirty();
    };

    // Attach dynamic HP gauge to all Sprite_Enemy
    var _Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        _Sprite_Enemy_initMembers.call(this);
        this._dynamicHpGauge = null;
    };

    var _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);
        if (enableEnemyHp && this._enemy && !this._dynamicHpGauge && this.parent) {
            this._dynamicHpGauge = new Sprite_DynamicEnemyHpGauge(this);
            this.parent.addChild(this._dynamicHpGauge);
        }
    };

    // ============================================================================
    // 5. VISCERAL TARGET FLINCH & BATTLEFIELD FEEDBACK
    // ============================================================================
    var _Sprite_Battler_updatePosition = Sprite_Battler.prototype.updatePosition;
    Sprite_Battler.prototype.updatePosition = function() {
        _Sprite_Battler_updatePosition.call(this);
        if (this._flinchDuration && this._flinchDuration > 0) {
            this._flinchDuration--;
            var fProg = this._flinchDuration / 8;
            var offset = Math.sin(fProg * Math.PI);
            this.x += (this._flinchOffsetX || 0) * offset;
            this.y += (this._flinchOffsetY || 0) * offset;
            if (typeof this.setBlendColor === 'function') {
                if (this._flinchDuration > 0) {
                    var flashAlpha = Math.floor(180 * offset);
                    this.setBlendColor([255, 255, 255, flashAlpha]);
                } else {
                    this.setBlendColor([0, 0, 0, 0]);
                }
            }
        }
    };

    function applyTargetFlinch(target, dirX, dirY) {
        if (!target) return;
        var battlerSprite = null;
        if (SceneManager._scene && SceneManager._scene._spriteset) {
            var ss = SceneManager._scene._spriteset;
            if (typeof target.isEnemy === 'function' && target.isEnemy()) {
                var enemies = ss._enemySprites || [];
                for (var i = 0; i < enemies.length; i++) {
                    if (enemies[i] && enemies[i]._battler === target) { battlerSprite = enemies[i]; break; }
                }
            } else if (typeof target.isActor === 'function' && target.isActor()) {
                var actors = ss._actorSprites || [];
                for (var j = 0; j < actors.length; j++) {
                    if (actors[j] && actors[j]._battler === target) { battlerSprite = actors[j]; break; }
                }
            }
        }
        if (battlerSprite) {
            battlerSprite._flinchDuration = 8;
            battlerSprite._flinchOffsetX = (dirX !== undefined ? dirX : 1) * 14;
            battlerSprite._flinchOffsetY = (dirY !== undefined ? dirY : 0) * 8;
            if (typeof battlerSprite.startWhiten === 'function') {
                battlerSprite.startWhiten();
            } else if (typeof battlerSprite.setBlendColor === 'function') {
                battlerSprite.setBlendColor([255, 255, 255, 180]);
            }
        }
    }

    // ============================================================================
    // 6. HIGH-DEFINITION ELEMENTAL INTELLIGENCE & VFX CLASSIFIER
    // ============================================================================
    function getYureSkillVFXInfo(item, isActor, subject) {
        var info = {
            type: 'physical',
            c1: '#ff3d00',
            c2: '#ff9100',
            c3: '#ffffff',
            name: (item && item.name) ? item.name : '',
            elementId: 0,
            animationId: (item && item.animationId) ? item.animationId : 0
        };
        if (!item) return info;

        var isItem = DataManager.isItem(item);
        var isHeal = (item.damage && item.damage.type === 3) || (item.occasion === 2) || (item.name && item.name.match(/heal|cure|potion|life|revive|sanctuary/i));
        var isMagic = (item.hitType === 2);
        var isForFriend = (item.scope >= 7 && item.scope <= 11);

        var elementId = (item.damage && item.damage.elementId !== undefined) ? item.damage.elementId : 0;
        var note = item.note || '';
        var name = (item.name || '').toLowerCase();

        var elemMatch = note.match(/<(?:element|vfx):\s*([a-z0-9_]+)>/i);
        var tagElem = elemMatch ? elemMatch[1].toLowerCase() : '';

        if (isItem) {
            info.type = 'item';
            info.c1 = '#00e5ff';
            info.c2 = '#38bdf8';
            info.c3 = '#ffffff';
            info.elementId = 0;
            return info;
        }

        if (isHeal) {
            info.type = 'heal';
            info.c1 = '#00e676';
            info.c2 = '#69f0ae';
            info.c3 = '#ffffff';
            info.elementId = 0;
            return info;
        }

        if (elementId === 2 || tagElem === 'fire' || name.match(/fire|flame|pyro|burn|anger|ignite|blaze/)) {
            info.type = 'fire';
            info.c1 = '#ff2a00';
            info.c2 = '#ff6d00';
            info.c3 = '#fff59d';
        } else if (elementId === 3 || tagElem === 'ice' || name.match(/ice|frost|cryo|freeze|cold|glacier|blizzard/)) {
            info.type = 'ice';
            info.c1 = '#00e5ff';
            info.c2 = '#0284c7';
            info.c3 = '#ffffff';
        } else if (elementId === 4 || tagElem === 'thunder' || tagElem === 'lightning' || name.match(/thunder|lightning|spark|volt|electr|egwf|astraphobia/)) {
            info.type = 'thunder';
            info.c1 = '#ffd600';
            info.c2 = '#ff9100';
            info.c3 = '#00e5ff';
        } else if (elementId === 5 || tagElem === 'water' || name.match(/water|aqua|hydro|ocean|splash|wave/)) {
            info.type = 'water';
            info.c1 = '#0284c7';
            info.c2 = '#38bdf8';
            info.c3 = '#e0f2fe';
        } else if (elementId === 6 || tagElem === 'earth' || name.match(/earth|stone|rock|quake|seismic|claustro/)) {
            info.type = 'earth';
            info.c1 = '#d97706';
            info.c2 = '#b45309';
            info.c3 = '#fef3c7';
        } else if (elementId === 7 || tagElem === 'wind' || name.match(/wind|gale|storm|cyclone|ancrao|fist|breeze/)) {
            info.type = 'wind';
            info.c1 = '#00e676';
            info.c2 = '#059669';
            info.c3 = '#a7f3d0';
        } else if (elementId === 8 || tagElem === 'light' || name.match(/light|holy|divine|sacred|saint|foto|shine|sun/)) {
            info.type = 'light';
            info.c1 = '#fff59d';
            info.c2 = '#ffd700';
            info.c3 = '#ffffff';
        } else if (elementId === 9 || tagElem === 'dark' || tagElem === 'shadow' || name.match(/dark|shadow|curse|ghost|nycto|void|hell|blast|miasma|abyss/)) {
            info.type = 'dark';
            info.c1 = '#a855f7';
            info.c2 = '#7c3aed';
            info.c3 = '#ec4899';
        } else if (elementId === 10 || tagElem === 'big' || name.match(/megalo|big|colossal|gravity|meteor|crush/)) {
            info.type = 'big';
            info.c1 = '#f43f5e';
            info.c2 = '#9f1239';
            info.c3 = '#ffe4e6';
        } else if (isMagic) {
            info.type = 'dark';
            info.c1 = '#a855f7';
            info.c2 = '#e879f9';
            info.c3 = '#ffffff';
        } else if (isForFriend) {
            info.type = 'heal';
            info.c1 = '#ffd600';
            info.c2 = '#ffab00';
            info.c3 = '#ffffff';
        } else if (!isActor) {
            info.type = 'physical';
            info.c1 = '#ff1744';
            info.c2 = '#990000';
            info.c3 = '#ffffff';
        } else {
            info.type = 'physical';
            info.c1 = '#ff3d00';
            info.c2 = '#ff9100';
            info.c3 = '#ffffff';
        }

        info.elementId = elementId;
        return info;
    }

    function getYureThemeColors(item, isActor, subject) {
        return getYureSkillVFXInfo(item, isActor, subject);
    }

    // ============================================================================
    // 7. HIGH-DEFINITION PROCEDURAL ELEMENTAL IMPACT EXPLOSION ENGINE
    // ============================================================================
    function Sprite_SkillImpactExplosion() {
        this.initialize.apply(this, arguments);
    }
    Sprite_SkillImpactExplosion.prototype = Object.create(Sprite.prototype);
    Sprite_SkillImpactExplosion.prototype.constructor = Sprite_SkillImpactExplosion;

    Sprite_SkillImpactExplosion.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this._size = 260; // High-Definition 260x260 Canvas
        this.bitmap = new Bitmap(this._size, this._size);
        this.blendMode = PIXI.blendModes.ADD;
        this.visible = false;
        this._life = 0;
        this._maxLife = 18;
        this._vfxInfo = getYureSkillVFXInfo(null, true);
        this._seeds = [];
    };

    Sprite_SkillImpactExplosion.prototype.play = function(x, y, vfxInfo, optC2) {
        this.x = x;
        this.y = y;
        if (typeof vfxInfo === 'string') {
            this._vfxInfo = { type: 'physical', c1: vfxInfo, c2: optC2 || vfxInfo, c3: '#ffffff' };
        } else if (vfxInfo) {
            this._vfxInfo = vfxInfo;
        } else {
            this._vfxInfo = getYureSkillVFXInfo(null, true);
        }
        this._life = this._maxLife;
        this.scale.x = 0.5;
        this.scale.y = 0.5;
        this.opacity = 255;
        this.visible = true;

        // Generate deterministic seed arrays for smooth continuous simulation
        this._seeds = [];
        for (var i = 0; i < 20; i++) {
            this._seeds.push({
                ang: (i * Math.PI / 10) + (Math.sin(i * 13) * 0.2),
                len: 0.75 + ((i % 5) * 0.08),
                jitter: Math.sin(i * 7) * 0.4,
                scale: 0.6 + ((i % 4) * 0.25)
            });
        }
    };

    Sprite_SkillImpactExplosion.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this.visible) return;

        this._life--;
        if (this._life <= 0) {
            this.visible = false;
            this.opacity = 0;
            if (this.bitmap) this.bitmap.clear();
            return;
        }

        var progress = 1.0 - (this._life / this._maxLife);
        var size = this._size;
        var cx = size / 2;
        var cy = size / 2;

        this.bitmap.clear();
        var ctx = this.bitmap.context;
        ctx.save();

        var type = this._vfxInfo ? this._vfxInfo.type : 'physical';
        var c1 = (this._vfxInfo && this._vfxInfo.c1) ? this._vfxInfo.c1 : '#ff3d00';
        var c2 = (this._vfxInfo && this._vfxInfo.c2) ? this._vfxInfo.c2 : '#ff9100';
        var c3 = (this._vfxInfo && this._vfxInfo.c3) ? this._vfxInfo.c3 : '#ffffff';

        switch(type) {
            case 'fire':
                this.renderFireVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            case 'thunder':
                this.renderThunderVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            case 'ice':
                this.renderIceVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            case 'wind':
                this.renderWindVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            case 'water':
                this.renderWaterVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            case 'earth':
                this.renderEarthVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            case 'light':
                this.renderLightVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            case 'dark':
                this.renderDarkVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            case 'heal':
                this.renderHealVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            case 'big':
                this.renderBigVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
            default:
                this.renderPhysicalVFX(ctx, cx, cy, progress, c1, c2, c3);
                break;
        }

        ctx.restore();
        this.bitmap._setDirty();

        this.scale.x = 0.55 + progress * 0.95;
        this.scale.y = 0.55 + progress * 0.95;
        this.opacity = (1.0 - progress) * 255;
    };

    // 1. FIRE / INFERNO IMPACT VFX
    Sprite_SkillImpactExplosion.prototype.renderFireVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r = 16 + p * 92;
        // Outer Ragged Flame Ring
        ctx.beginPath();
        for (var i = 0; i <= 24; i++) {
            var ang = (i * Math.PI * 2) / 24;
            var jagged = r + Math.sin(ang * 6 + p * 12) * (8 * (1.0 - p));
            var x = cx + Math.cos(ang) * jagged;
            var y = cy + Math.sin(ang) * jagged;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(1.5, (1.0 - p) * 9);
        ctx.shadowColor = c2;
        ctx.shadowBlur = 24;
        ctx.stroke();

        // 8 Radiating Fire Tongues
        for (var f = 0; f < 8; f++) {
            var fAng = (f * Math.PI / 4) + (p * 0.2);
            var fDist = 20 + p * 98;
            var tx = cx + Math.cos(fAng) * fDist;
            var ty = cy + Math.sin(fAng) * fDist;
            ctx.beginPath();
            ctx.arc(tx, ty, Math.max(2, (1.0 - p) * 11), 0, Math.PI * 2);
            ctx.fillStyle = (f % 2 === 0) ? c2 : c3;
            ctx.fill();
        }

        // Center Solar Core Flash
        if (p < 0.5) {
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(4, (1.0 - p / 0.5) * 44), 0, Math.PI * 2);
            ctx.fillStyle = c3;
            ctx.shadowColor = c1;
            ctx.shadowBlur = 30;
            ctx.fill();
        }

        // 14 Rising Ember Sparks with Turbulence
        for (var e = 0; e < 14; e++) {
            var s = this._seeds[e] || { ang: e, len: 1 };
            var ex = cx + Math.cos(s.ang) * (p * 85 * s.len);
            var ey = cy + Math.sin(s.ang) * (p * 65 * s.len) - (p * 50); // Updraft
            ctx.beginPath();
            ctx.arc(ex, ey, Math.max(1, (1.0 - p) * 5), 0, Math.PI * 2);
            ctx.fillStyle = (e % 2 === 0) ? c2 : c3;
            ctx.fill();
        }
    };

    // 2. THUNDER / LIGHTNING IMPACT VFX (EGWF / SPARK)
    Sprite_SkillImpactExplosion.prototype.renderThunderVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r = 18 + p * 96;
        // Electric Ring Flash
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = (Math.sin(p * 24) > 0) ? c1 : c3;
        ctx.lineWidth = Math.max(1.5, (1.0 - p) * 7);
        ctx.shadowColor = c3;
        ctx.shadowBlur = 22;
        ctx.stroke();

        // 8 Multi-Segment Jagged Branching Lightning Forks
        for (var b = 0; b < 8; b++) {
            var bAng = (b * Math.PI / 4) + (this._seeds[b] ? this._seeds[b].jitter * 0.3 : 0);
            var segs = 4;
            var totalLen = 20 + p * 105;
            var curX = cx;
            var curY = cy;
            ctx.beginPath();
            ctx.moveTo(curX, curY);
            for (var s = 1; s <= segs; s++) {
                var segDist = (totalLen / segs) * s;
                var perpJitter = Math.sin(s * 8 + b * 5) * (12 * (1.0 - p));
                var px = cx + Math.cos(bAng) * segDist - Math.sin(bAng) * perpJitter;
                var py = cy + Math.sin(bAng) * segDist + Math.cos(bAng) * perpJitter;
                ctx.lineTo(px, py);
            }
            ctx.strokeStyle = (b % 2 === 0) ? c1 : c3;
            ctx.lineWidth = Math.max(1.5, (1.0 - p) * 5);
            ctx.shadowColor = c1;
            ctx.shadowBlur = 18;
            ctx.stroke();
        }

        // Central Electric Star Flash
        if (p < 0.45) {
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(4, (1.0 - p / 0.45) * 40), 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = c3;
            ctx.shadowBlur = 32;
            ctx.fill();
        }

        // 16 Jagged Static Sparks
        for (var k = 0; k < 16; k++) {
            var sData = this._seeds[k] || { ang: k * 0.4, len: 1 };
            var dist = p * 110 * sData.len;
            var sx = cx + Math.cos(sData.ang) * dist;
            var sy = cy + Math.sin(sData.ang) * dist;
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(1, (1.0 - p) * 4.5), 0, Math.PI * 2);
            ctx.fillStyle = (k % 3 === 0) ? c3 : c1;
            ctx.fill();
        }
    };

    // 3. ICE / FROST IMPACT VFX
    Sprite_SkillImpactExplosion.prototype.renderIceVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r = 16 + p * 88;
        // Hexagonal Frost Shockwave Ring
        ctx.beginPath();
        for (var h = 0; h < 6; h++) {
            var hAng = h * Math.PI / 3;
            var hx = cx + Math.cos(hAng) * r;
            var hy = cy + Math.sin(hAng) * r;
            if (h === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(1.5, (1.0 - p) * 7);
        ctx.shadowColor = c2;
        ctx.shadowBlur = 20;
        ctx.stroke();

        // 6 Geometric Diamond Ice Crystal Shards
        for (var c = 0; c < 6; c++) {
            var cAng = c * Math.PI / 3;
            var cDist = 24 + p * 94;
            var tipX = cx + Math.cos(cAng) * cDist;
            var tipY = cy + Math.sin(cAng) * cDist;
            var baseDist = cDist * 0.55;
            var perpX = Math.cos(cAng + Math.PI / 2) * (10 * (1.0 - p));
            var perpY = Math.sin(cAng + Math.PI / 2) * (10 * (1.0 - p));

            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(cx + Math.cos(cAng) * baseDist + perpX, cy + Math.sin(cAng) * baseDist + perpY);
            ctx.lineTo(cx + Math.cos(cAng) * (baseDist * 0.3), cy + Math.sin(cAng) * (baseDist * 0.3));
            ctx.lineTo(cx + Math.cos(cAng) * baseDist - perpX, cy + Math.sin(cAng) * baseDist - perpY);
            ctx.closePath();

            ctx.fillStyle = (c % 2 === 0) ? 'rgba(0, 229, 255, 0.85)' : 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = c3;
            ctx.lineWidth = 1.2;
            ctx.shadowColor = c1;
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.stroke();
        }

        // Center Frost Glint
        if (p < 0.4) {
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(3, (1.0 - p / 0.4) * 36), 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = c1;
            ctx.shadowBlur = 24;
            ctx.fill();
        }
    };

    // 4. WIND / CYCLONE IMPACT VFX (WIND GHOST FIST)
    Sprite_SkillImpactExplosion.prototype.renderWindVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        // Dual Spinning Emerald Cyclone Spiral Arcs
        var rotOffset = p * Math.PI * 2.2;
        for (var a = 0; a < 2; a++) {
            var aAng = a * Math.PI + rotOffset;
            ctx.beginPath();
            ctx.arc(cx, cy, 18 + p * 82, aAng, aAng + Math.PI * 0.85);
            ctx.strokeStyle = (a === 0) ? c1 : c3;
            ctx.lineWidth = Math.max(2, (1.0 - p) * 8);
            ctx.shadowColor = c2;
            ctx.shadowBlur = 22;
            ctx.stroke();
        }

        // 6 Curved Crescent Wind Cutter Blades
        for (var w = 0; w < 6; w++) {
            var wAng = (w * Math.PI / 3) + rotOffset;
            var wDist = 20 + p * 92;
            var wx = cx + Math.cos(wAng) * wDist;
            var wy = cy + Math.sin(wAng) * wDist;
            var wLen = 16 * (1.0 - p);

            ctx.beginPath();
            ctx.moveTo(wx - Math.sin(wAng) * wLen, wy + Math.cos(wAng) * wLen);
            ctx.quadraticCurveTo(wx + Math.cos(wAng) * 8, wy + Math.sin(wAng) * 8, wx + Math.sin(wAng) * wLen, wy - Math.cos(wAng) * wLen);
            ctx.strokeStyle = c3;
            ctx.lineWidth = Math.max(1.5, (1.0 - p) * 4);
            ctx.stroke();
        }

        // 14 Swirling Mint-Green Motes
        for (var m = 0; m < 14; m++) {
            var sM = this._seeds[m] || { ang: m, len: 1 };
            var mAng = sM.ang + (p * 3.0);
            var mDist = p * 95 * sM.len;
            var mx = cx + Math.cos(mAng) * mDist;
            var my = cy + Math.sin(mAng) * mDist;
            ctx.beginPath();
            ctx.arc(mx, my, Math.max(1, (1.0 - p) * 4.5), 0, Math.PI * 2);
            ctx.fillStyle = (m % 2 === 0) ? c1 : c3;
            ctx.fill();
        }
    };

    // 5. WATER / AQUA IMPACT VFX
    Sprite_SkillImpactExplosion.prototype.renderWaterVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r1 = 14 + p * 86;
        var r2 = 10 + p * 64;
        ctx.beginPath();
        ctx.arc(cx, cy, r1, 0, Math.PI * 2);
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(1.5, (1.0 - p) * 7);
        ctx.shadowColor = c2;
        ctx.shadowBlur = 18;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, r2, 0, Math.PI * 2);
        ctx.strokeStyle = c3;
        ctx.lineWidth = Math.max(1, (1.0 - p) * 4);
        ctx.stroke();

        // 12 Splashing Droplets
        for (var d = 0; d < 12; d++) {
            var sD = this._seeds[d] || { ang: d, len: 1 };
            var dDist = p * 90 * sD.len;
            var dx = cx + Math.cos(sD.ang) * dDist;
            var dy = cy + Math.sin(sD.ang) * dDist + (p * p * 30); // Gravity drop
            ctx.beginPath();
            ctx.arc(dx, dy, Math.max(1.5, (1.0 - p) * 6), 0, Math.PI * 2);
            ctx.fillStyle = (d % 2 === 0) ? c2 : c3;
            ctx.fill();
        }
    };

    // 6. EARTH / SEISMIC IMPACT VFX
    Sprite_SkillImpactExplosion.prototype.renderEarthVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r = 18 + p * 90;
        // Jagged Polygon Shockwave
        ctx.beginPath();
        for (var k = 0; k <= 12; k++) {
            var ang = (k * Math.PI * 2) / 12;
            var rad = r + ((k % 2 === 0) ? 8 : -8) * (1.0 - p);
            var x = cx + Math.cos(ang) * rad;
            var y = cy + Math.sin(ang) * rad;
            if (k === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(2, (1.0 - p) * 8);
        ctx.shadowColor = c2;
        ctx.shadowBlur = 20;
        ctx.stroke();

        // 8 Shattered Rock Debris
        for (var b = 0; b < 8; b++) {
            var sB = this._seeds[b] || { ang: b, len: 1 };
            var bDist = p * 88 * sB.len;
            var bx = cx + Math.cos(sB.ang) * bDist;
            var by = cy + Math.sin(sB.ang) * bDist;
            var sz = Math.max(2, (1.0 - p) * 7);
            ctx.fillStyle = (b % 2 === 0) ? c1 : c2;
            ctx.fillRect(bx - sz / 2, by - sz / 2, sz, sz);
        }
    };

    // 7. LIGHT / HOLY IMPACT VFX (SAINT ANGER / HEAVENLY RAYS)
    Sprite_SkillImpactExplosion.prototype.renderLightVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r = 16 + p * 90;
        // Double Golden Halo Ring
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = c2;
        ctx.lineWidth = Math.max(1.5, (1.0 - p) * 7);
        ctx.shadowColor = c1;
        ctx.shadowBlur = 24;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = c3;
        ctx.lineWidth = Math.max(1, (1.0 - p) * 4);
        ctx.stroke();

        // 8-Point Brilliant Celestial Starburst Rays
        var rayLen = 25 + p * 110;
        for (var s = 0; s < 8; s++) {
            var sAng = s * Math.PI / 4;
            var isPrimary = (s % 2 === 0);
            var curLen = isPrimary ? rayLen : rayLen * 0.7;
            var rx = cx + Math.cos(sAng) * curLen;
            var ry = cy + Math.sin(sAng) * curLen;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(rx, ry);
            ctx.strokeStyle = isPrimary ? c3 : c1;
            ctx.lineWidth = Math.max(1.5, (1.0 - p) * (isPrimary ? 6 : 3.5));
            ctx.shadowColor = c2;
            ctx.shadowBlur = 22;
            ctx.stroke();
        }

        // Center Divine Flash
        if (p < 0.5) {
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(5, (1.0 - p / 0.5) * 46), 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = c2;
            ctx.shadowBlur = 35;
            ctx.fill();
        }
    };

    // 8. DARKNESS / GHOST / CURSE IMPACT VFX (GHOST BLAST / HARMING CURSE)
    Sprite_SkillImpactExplosion.prototype.renderDarkVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r = 16 + p * 86;
        // Violet Singularity Vortex
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(2, (1.0 - p) * 8);
        ctx.shadowColor = c3;
        ctx.shadowBlur = 26;
        ctx.stroke();

        // 6 Curved Arcane Curse Tendrils
        var rotTendril = -p * Math.PI * 2.0;
        for (var t = 0; t < 6; t++) {
            var tAng = (t * Math.PI / 3) + rotTendril;
            var tDist = 20 + p * 94;
            var tx = cx + Math.cos(tAng) * tDist;
            var ty = cy + Math.sin(tAng) * tDist;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.quadraticCurveTo(cx + Math.cos(tAng + 0.6) * (tDist * 0.6), cy + Math.sin(tAng + 0.6) * (tDist * 0.6), tx, ty);
            ctx.strokeStyle = (t % 2 === 0) ? c2 : c3;
            ctx.lineWidth = Math.max(1.5, (1.0 - p) * 4.5);
            ctx.stroke();
        }

        // Center Void Core
        if (p < 0.45) {
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(4, (1.0 - p / 0.45) * 40), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(20, 10, 35, 0.95)';
            ctx.strokeStyle = c3;
            ctx.lineWidth = 3.0;
            ctx.shadowColor = c1;
            ctx.shadowBlur = 25;
            ctx.fill();
            ctx.stroke();
        }

        // 14 Magenta Phantom Sparks
        for (var g = 0; g < 14; g++) {
            var sG = this._seeds[g] || { ang: g, len: 1 };
            var gDist = p * 96 * sG.len;
            var gx = cx + Math.cos(sG.ang) * gDist;
            var gy = cy + Math.sin(sG.ang) * gDist;
            ctx.beginPath();
            ctx.arc(gx, gy, Math.max(1, (1.0 - p) * 5), 0, Math.PI * 2);
            ctx.fillStyle = (g % 2 === 0) ? c3 : c1;
            ctx.fill();
        }
    };

    // 9. HEAL / RECOVERY IMPACT VFX
    Sprite_SkillImpactExplosion.prototype.renderHealVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r = 14 + p * 80;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(1.5, (1.0 - p) * 6);
        ctx.shadowColor = c2;
        ctx.shadowBlur = 20;
        ctx.stroke();

        // 6 Rising Green Plus Healing Symbols
        for (var h = 0; h < 6; h++) {
            var sH = this._seeds[h] || { ang: h, len: 1 };
            var hx = cx + Math.cos(sH.ang) * (p * 65 * sH.len);
            var hy = cy + Math.sin(sH.ang) * (p * 50 * sH.len) - (p * 45);
            var arm = Math.max(2, (1.0 - p) * 6);
            ctx.strokeStyle = c3;
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(hx - arm, hy); ctx.lineTo(hx + arm, hy);
            ctx.moveTo(hx, hy - arm); ctx.lineTo(hx, hy + arm);
            ctx.stroke();
        }
    };

    // 10. BIG / COLOSSAL IMPACT VFX
    Sprite_SkillImpactExplosion.prototype.renderBigVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r = 24 + p * 105;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(3, (1.0 - p) * 11);
        ctx.shadowColor = c2;
        ctx.shadowBlur = 30;
        ctx.stroke();

        // 8 Colossal Seismic Rays
        for (var i = 0; i < 8; i++) {
            var a = i * Math.PI / 4;
            var len = 30 + p * 115;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
            ctx.strokeStyle = c3;
            ctx.lineWidth = Math.max(2, (1.0 - p) * 6);
            ctx.stroke();
        }
    };

    // 11. PHYSICAL / KINETIC IMPACT VFX (DEFAULT / MELEE)
    Sprite_SkillImpactExplosion.prototype.renderPhysicalVFX = function(ctx, cx, cy, p, c1, c2, c3) {
        var r = 16 + p * 88;
        // Heavy Shockwave Ring
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = c1;
        ctx.lineWidth = Math.max(2, (1.0 - p) * 8);
        ctx.shadowColor = c2;
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Dual Razor-Sharp Cross-Slash Blades (X)
        var slashLen = 22 + p * 96;
        for (var s = 0; s < 4; s++) {
            var sAng = (s * Math.PI / 2) + 0.38;
            var rx1 = cx + Math.cos(sAng) * (slashLen * 0.15);
            var ry1 = cy + Math.sin(sAng) * (slashLen * 0.15);
            var rx2 = cx + Math.cos(sAng) * slashLen;
            var ry2 = cy + Math.sin(sAng) * slashLen;
            ctx.beginPath();
            ctx.moveTo(rx1, ry1);
            ctx.lineTo(rx2, ry2);
            ctx.strokeStyle = c3;
            ctx.lineWidth = Math.max(1.8, (1.0 - p) * 5.5);
            ctx.shadowColor = c1;
            ctx.shadowBlur = 18;
            ctx.stroke();
        }

        // Center Flash
        if (p < 0.45) {
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(4, (1.0 - p / 0.45) * 40), 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = c1;
            ctx.shadowBlur = 28;
            ctx.fill();
        }

        // 14 Metal Friction Sparks
        for (var f = 0; f < 14; f++) {
            var sF = this._seeds[f] || { ang: f, len: 1 };
            var fDist = p * 96 * sF.len;
            var fx = cx + Math.cos(sF.ang) * fDist;
            var fy = cy + Math.sin(sF.ang) * fDist;
            ctx.beginPath();
            ctx.arc(fx, fy, Math.max(1, (1.0 - p) * 5.5), 0, Math.PI * 2);
            ctx.fillStyle = (f % 2 === 0) ? c3 : c2;
            ctx.fill();
        }
    };

    // ============================================================================
    // 8. PROYEKTIL PERSEGI (120x120) DENGAN HD ELEMENTAL DASH TRAIL & COMET SYSTEM
    // ============================================================================
    function Sprite_DynamicSkillTile() {
        this.initialize.apply(this, arguments);
    }
    Sprite_DynamicSkillTile.prototype = Object.create(Sprite.prototype);
    Sprite_DynamicSkillTile.prototype.constructor = Sprite_DynamicSkillTile;

    Sprite_DynamicSkillTile.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this._size = 120; // Ukuran kotak persegi HD (120x120)
        this.bitmap = new Bitmap(this._size, this._size);
        this.visible = false;
        this.opacity = 0;
        this._animFrame = 0;
        this._maxFrame = 11;
        this._delay = 0;
        this._active = false;
        this._vfxInfo = getYureSkillVFXInfo(null, true);
        this._targetBattler = null;

        // Dedicated Contrail Ribbon Sprite (Behind projectile)
        this._contrailSprite = new Sprite();
        this._contrailSprite.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this._contrailSprite.blendMode = PIXI.blendModes.ADD;
        this._contrailSprite.visible = false;

        // Trailing Particles Pool
        this._trailParticles = [];

        // 8 Dedicated Ghost Trail Sprites
        this._trailSprites = [];
        for (var i = 0; i < 8; i++) {
            var tr = new Sprite();
            tr.anchor.x = 0.5;
            tr.anchor.y = 0.5;
            tr.visible = false;
            tr.opacity = 0;
            tr.blendMode = PIXI.blendModes.ADD;
            this._trailSprites.push(tr);
        }
    };

    Sprite_DynamicSkillTile.prototype.setup = function(item, sx, sy, tx, ty, vfxInfo, delay, targetBattler) {
        this._item = item;
        this._startX = sx;
        this._startY = sy;
        this._targetX = tx;
        this._targetY = ty;
        this._vfxInfo = (typeof vfxInfo === 'object' && vfxInfo !== null) ? vfxInfo : getYureSkillVFXInfo(item, true);
        this._delay = delay || 0;
        this._animFrame = 0;
        this._maxFrame = 11; // Ultra-fast kinetic dash strike (11 frames)
        this._active = true;
        this._targetBattler = targetBattler || null;

        this._dashAngle = Math.atan2(ty - sy, tx - sx);

        this.x = sx;
        this.y = sy;
        this.rotation = this._dashAngle;
        this.scale.x = 0.4;
        this.scale.y = 0.4;
        this.opacity = 0;
        this.visible = false;

        this._historyPositions = [];
        this._trailParticles = [];

        // Render Square Tile with Rounded Corners & Heavy Aura
        this.renderTileBitmap(item, this._vfxInfo.c1, this._vfxInfo.c2, this._vfxInfo.c3);

        // Reset all trails immediately
        for (var i = 0; i < this._trailSprites.length; i++) {
            this._trailSprites[i].bitmap = this.bitmap;
            this._trailSprites[i].visible = false;
            this._trailSprites[i].opacity = 0;
            if (this.parent && !this._trailSprites[i].parent) {
                this.parent.addChildAt(this._trailSprites[i], this.parent.getChildIndex(this));
            }
        }

        if (this.parent && !this._contrailSprite.parent) {
            this.parent.addChildAt(this._contrailSprite, 0);
        }
    };

    Sprite_DynamicSkillTile.prototype.renderTileBitmap = function(item, c1, c2, c3) {
        var s = this._size;
        this.bitmap.clear();
        var ctx = this.bitmap.context;
        ctx.save();

        // 1. Large Rounded Square Tile with Thick Neon Aura
        var r = 16;
        var pad = 6;
        var w = s - (pad * 2);
        var h = s - (pad * 2);
        var x = pad;
        var y = pad;

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();

        // Dark gradient background
        var bgGrad = ctx.createLinearGradient(0, y, 0, y + h);
        bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.96)');
        bgGrad.addColorStop(1, 'rgba(8, 12, 22, 0.98)');
        ctx.fillStyle = bgGrad;
        ctx.fill();

        // Outer glowing border
        ctx.strokeStyle = c1;
        ctx.lineWidth = 4.0;
        ctx.shadowColor = c2;
        ctx.shadowBlur = 24;
        ctx.stroke();

        // Inner glowing rim
        ctx.strokeStyle = c3 || 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 2. Render Icon inside Square Tile (88x88 Large Icon)
        var iconSize = 88;
        var ix = Math.floor((s - iconSize) / 2);
        var iy = Math.floor((s - iconSize) / 2);

        var iconDrawn = false;
        if (typeof ImageManager.drawSkillIcon === 'function') {
            iconDrawn = ImageManager.drawSkillIcon(this.bitmap, item, ix, iy, iconSize, iconSize, function() {
                if (this._active) {
                    this.renderTileBitmap(item, c1, c2, c3);
                }
            }.bind(this));
        }

        if (!iconDrawn && item.iconIndex > 0) {
            var iconBitmap = ImageManager.loadSystem('IconSet');
            if (iconBitmap && iconBitmap.isReady()) {
                var pw = Window_Base._iconWidth || 32;
                var ph = Window_Base._iconHeight || 32;
                var sx = (item.iconIndex % 16) * pw;
                var sy = Math.floor(item.iconIndex / 16) * ph;
                ctx.drawImage(iconBitmap._canvas || iconBitmap._image, sx, sy, pw, ph, ix, iy, iconSize, iconSize);
            }
        }

        ctx.restore();
        this.bitmap._setDirty();
    };

    Sprite_DynamicSkillTile.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this._active) return;

        if (this._delay > 0) {
            this._delay--;
            return;
        }

        this.visible = true;
        this._animFrame++;
        var f = this._animFrame;
        var total = this._maxFrame;

        if (f <= total) {
            // High-Velocity Kinetic Dash (Quadratic Rocket Rush)
            var t = Math.min(1.0, f / total);
            var p = t * t; // Accelerating rush directly along the attack vector

            var nextX = this._startX + (this._targetX - this._startX) * p;
            var nextY = this._startY + (this._targetY - this._startY) * p;

            this.x = nextX;
            this.y = nextY;
            this.rotation = Math.atan2(this._targetY - this._startY, this._targetX - this._startX);

            // Kinetic Speed Stretch during dash
            var speedStretch = 1.0 + Math.sin(t * Math.PI) * 0.45;
            this.scale.x = 1.15 * speedStretch;
            this.scale.y = 1.15 * (1.8 - speedStretch) * 0.9;
            this.opacity = Math.min(255, 60 + f * 45);

            // Update trails & emit elemental particles
            this.updateTrail(f);
            this.emitElementalParticles(f);
        } else {
            // Tiba di Target -> Bersihkan Semua, Guncang Layar, & Ledakkan!
            this.finishAndExplode();
        }
    };

    Sprite_DynamicSkillTile.prototype.emitElementalParticles = function(f) {
        var vfx = this._vfxInfo || { type: 'physical', c1: '#ff3d00', c2: '#ff9100' };
        var ang = this.rotation + Math.PI; // Backward direction

        for (var i = 0; i < 2; i++) {
            var spread = (Math.random() - 0.5) * 0.8;
            var spd = 2 + Math.random() * 5;
            var pColor = (Math.random() < 0.5) ? vfx.c1 : (vfx.c3 || vfx.c2);
            this._trailParticles.push({
                x: this.x + (Math.random() - 0.5) * 16,
                y: this.y + (Math.random() - 0.5) * 16,
                vx: Math.cos(ang + spread) * spd,
                vy: Math.sin(ang + spread) * spd,
                size: 2.5 + Math.random() * 3.5,
                life: 10,
                maxLife: 10,
                color: pColor,
                type: vfx.type
            });
        }

        // Render Contrail Ribbon & Particles on _contrailSprite
        if (this._contrailSprite && this._contrailSprite.bitmap) {
            this._contrailSprite.visible = true;
            this._contrailSprite.bitmap.clear();
            var ctx = this._contrailSprite.bitmap.context;
            ctx.save();

            // 1. Glowing Speed Laser Contrail connecting to projectile
            var tailLen = 60;
            var tailX = this.x + Math.cos(ang) * tailLen;
            var tailY = this.y + Math.sin(ang) * tailLen;
            var grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
            grad.addColorStop(0, vfx.c1);
            grad.addColorStop(0.5, vfx.c2);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 6.0;
            ctx.shadowColor = vfx.c2;
            ctx.shadowBlur = 18;
            ctx.stroke();

            // 2. Trailing Elemental Particles update & draw
            for (var k = this._trailParticles.length - 1; k >= 0; k--) {
                var pt = this._trailParticles[k];
                pt.life--;
                if (pt.life <= 0) {
                    this._trailParticles.splice(k, 1);
                    continue;
                }
                pt.x += pt.vx;
                pt.y += pt.vy;
                var prog = 1.0 - (pt.life / pt.maxLife);
                var curSize = Math.max(1, pt.size * (1.0 - prog));
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, curSize, 0, Math.PI * 2);
                ctx.fillStyle = pt.color;
                ctx.shadowColor = vfx.c1;
                ctx.shadowBlur = 8;
                ctx.fill();
            }

            ctx.restore();
            this._contrailSprite.bitmap._setDirty();
        }
    };

    Sprite_DynamicSkillTile.prototype.updateTrail = function(f) {
        if (!this.parent) return;
        var trailIdx = (f % this._trailSprites.length);
        var tSprite = this._trailSprites[trailIdx];
        if (tSprite) {
            if (!tSprite.parent) this.parent.addChildAt(tSprite, this.parent.getChildIndex(this));
            tSprite.x = this.x;
            tSprite.y = this.y;
            tSprite.scale.x = this.scale.x * 0.92;
            tSprite.scale.y = this.scale.y * 0.92;
            tSprite.rotation = this.rotation;
            tSprite.opacity = 200;
            tSprite.visible = true;
        }

        for (var i = 0; i < this._trailSprites.length; i++) {
            var tr = this._trailSprites[i];
            if (tr.visible) {
                tr.opacity -= 32;
                if (tr.opacity <= 0) {
                    tr.visible = false;
                    tr.opacity = 0;
                }
            }
        }
    };

    Sprite_DynamicSkillTile.prototype.finishAndExplode = function() {
        this._active = false;
        this.visible = false;
        this.opacity = 0;

        // Bersihkan seluruh trail seketika tanpa sisa
        for (var i = 0; i < this._trailSprites.length; i++) {
            var tr = this._trailSprites[i];
            tr.visible = false;
            tr.opacity = 0;
        }
        if (this._contrailSprite && this._contrailSprite.bitmap) {
            this._contrailSprite.bitmap.clear();
            this._contrailSprite.visible = false;
        }
        this._trailParticles = [];

        // Apply Visceral Target Flinch
        applyTargetFlinch(this._targetBattler, Math.cos(this._dashAngle), Math.sin(this._dashAngle));

        // Heavy Kinetic Impact: Screen Shake & Camera Punch
        var type = this._vfxInfo ? this._vfxInfo.type : 'physical';
        var shakePower = (type === 'thunder' || type === 'earth' || type === 'big') ? 7 : 5;
        var shakeSpeed = (type === 'light' || type === 'ice') ? 8 : 6;
        var shakeDur = 14;

        $gameScreen.startShake(shakePower, shakeSpeed, shakeDur);

        if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._battleField) {
            var bf = SceneManager._scene._spriteset._battleField;
            bf._impactPunchTime = 14;
            bf._impactPunchMax = 0.032;
        }

        // Play Impact SE
        SoundManager.playEnemyDamage();

        // Picu ledakan impact visual HD sesuai elemen
        if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._actionProjectilesManager) {
            SceneManager._scene._spriteset._actionProjectilesManager.spawnExplosion(this._targetX, this._targetY, this._vfxInfo);
        }
    };

    // ============================================================================
    // 9. CINEMATIC CHAIN COMBO CARD (FOREGROUND SKILL TILE WITH GHOST TRAIL)
    // ============================================================================
    function Sprite_CinematicChainCard() {
        this.initialize.apply(this, arguments);
    }
    Sprite_CinematicChainCard.prototype = Object.create(Sprite.prototype);
    Sprite_CinematicChainCard.prototype.constructor = Sprite_CinematicChainCard;

    Sprite_CinematicChainCard.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this._size = 120;
        this._cardHeight = 150;
        this.bitmap = new Bitmap(this._size, this._cardHeight);
        this.visible = false;
        this.opacity = 0;
        this._skill = null;
        this._index = 0;
        this._total = 1;
        this._theme = { c1: '#ffd600', c2: '#ff9100' };
        this._vfxInfo = getYureSkillVFXInfo(null, true);
        this._startX = 0;
        this._startY = 0;
        this._orbitX = 0;
        this._orbitY = 0;
        this._targetX = 0;
        this._targetY = 0;
        this._targetBattler = null;
        this._state = 'IDLE'; // 'ENTER', 'HOVER', 'LAUNCH', 'DONE'
        this._launchFrame = 0;
        this._launchDuration = 10;
        this._onHitCallback = null;

        // 8 Dedicated Ghost Trail Sprites
        this._trailSprites = [];
        for (var i = 0; i < 8; i++) {
            var tr = new Sprite();
            tr.anchor.x = 0.5;
            tr.anchor.y = 0.5;
            tr.visible = false;
            tr.opacity = 0;
            tr.blendMode = PIXI.blendModes.ADD;
            this._trailSprites.push(tr);
        }
    };

    Sprite_CinematicChainCard.prototype.setup = function(skill, index, total, startX, startY, cx, cy, targetBattler) {
        this._skill = skill;
        this._index = index;
        this._total = total;
        this._vfxInfo = getYureSkillVFXInfo(skill, true);
        this._theme = this._vfxInfo;
        this._targetBattler = targetBattler || null;
        this._startX = startX || (cx + (index - (total - 1) / 2) * 120);
        this._startY = startY || (Graphics.boxHeight + 50);

        var radius = Math.min(220, Math.max(140, total * 42));
        var angleOffset = -Math.PI / 2;
        var angleStep = (Math.PI * 2) / Math.max(1, total);
        var cardAngle = angleOffset + (index * angleStep);

        this._orbitX = cx + Math.cos(cardAngle) * radius;
        this._orbitY = cy + Math.sin(cardAngle) * (radius * 0.72);

        this.x = this._startX;
        this.y = this._startY;
        this.scale.x = 0.3;
        this.scale.y = 0.3;
        this.opacity = 0;
        this.visible = true;
        this._state = 'ENTER';
        this._launchFrame = 0;
        this._onHitCallback = null;

        this.renderCard();

        for (var i = 0; i < this._trailSprites.length; i++) {
            this._trailSprites[i].bitmap = this.bitmap;
            this._trailSprites[i].visible = false;
            this._trailSprites[i].opacity = 0;
            if (this.parent && !this._trailSprites[i].parent) {
                this.parent.addChildAt(this._trailSprites[i], this.parent.getChildIndex(this));
            }
        }
    };

    Sprite_CinematicChainCard.prototype.renderCard = function() {
        var w = this._size;
        var h = this._cardHeight;
        this.bitmap.clear();
        var ctx = this.bitmap.context;
        ctx.save();

        var tileW = 108;
        var tileH = 108;
        var tx = (w - tileW) / 2;
        var ty = 6;
        var r = 16;

        // Rounded Box Background
        ctx.beginPath();
        ctx.moveTo(tx + r, ty);
        ctx.lineTo(tx + tileW - r, ty);
        ctx.quadraticCurveTo(tx + tileW, ty, tx + tileW, ty + r);
        ctx.lineTo(tx + tileW, ty + tileH - r);
        ctx.quadraticCurveTo(tx + tileW, ty + tileH, tx + tileW - r, ty + tileH);
        ctx.lineTo(tx + r, ty + tileH);
        ctx.quadraticCurveTo(tx, ty + tileH, tx, ty + tileH - r);
        ctx.lineTo(tx, ty + r);
        ctx.quadraticCurveTo(tx, ty, tx + r, ty);
        ctx.closePath();

        var bgGrad = ctx.createLinearGradient(0, ty, 0, ty + tileH);
        bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.96)');
        bgGrad.addColorStop(1, 'rgba(8, 12, 22, 0.98)');
        ctx.fillStyle = bgGrad;
        ctx.fill();

        ctx.strokeStyle = this._theme.c1;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = this._theme.c2;
        ctx.shadowBlur = 18;
        ctx.stroke();

        ctx.strokeStyle = this._theme.c3 || 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Icon (Large 78x78)
        var iconSize = 78;
        var ix = Math.floor((w - iconSize) / 2);
        var iy = Math.floor(ty + (tileH - iconSize) / 2) + 2;

        var iconDrawn = false;
        if (typeof ImageManager.drawSkillIcon === 'function') {
            iconDrawn = ImageManager.drawSkillIcon(this.bitmap, this._skill, ix, iy, iconSize, iconSize, function() {
                if (this.visible) this.renderCard();
            }.bind(this));
        }

        if (!iconDrawn && this._skill && this._skill.iconIndex > 0) {
            var iconBitmap = ImageManager.loadSystem('IconSet');
            if (iconBitmap && iconBitmap.isReady()) {
                var pw = Window_Base._iconWidth || 32;
                var ph = Window_Base._iconHeight || 32;
                var sx = (this._skill.iconIndex % 16) * pw;
                var sy = Math.floor(this._skill.iconIndex / 16) * ph;
                ctx.drawImage(iconBitmap._canvas || iconBitmap._image, sx, sy, pw, ph, ix, iy, iconSize, iconSize);
            }
        }

        // Top Chain Badge (CHAIN #1)
        var badgeW = 76;
        var badgeH = 18;
        var bx = (w - badgeW) / 2;
        var by = 0;
        var br = 9;

        ctx.beginPath();
        ctx.moveTo(bx + br, by);
        ctx.lineTo(bx + badgeW - br, by);
        ctx.quadraticCurveTo(bx + badgeW, by, bx + badgeW, by + br);
        ctx.lineTo(bx + badgeW, by + badgeH - br);
        ctx.quadraticCurveTo(bx + badgeW, by + badgeH, bx + badgeW - br, by + badgeH);
        ctx.lineTo(bx + br, by + badgeH);
        ctx.quadraticCurveTo(bx, by + badgeH, bx, by + badgeH - br);
        ctx.lineTo(bx, by + br);
        ctx.quadraticCurveTo(bx, by, bx + br, by);
        ctx.closePath();
        ctx.fillStyle = this._theme.c1;
        ctx.shadowColor = this._theme.c2;
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.font = 'bold 10px ' + popupFontFamily;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CHAIN #' + (this._index + 1), w / 2, by + badgeH / 2);

        // Skill Name Text below
        ctx.font = 'bold 12px ' + popupFontFamily;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        var sName = this._skill ? this._skill.name : '';
        ctx.fillText(sName, w / 2, ty + tileH + 4);

        ctx.restore();
        this.bitmap._setDirty();
    };

    Sprite_CinematicChainCard.prototype.launchTo = function(tx, ty, duration, onHitCallback) {
        this._state = 'LAUNCH';
        this._launchFrame = 0;
        this._launchDuration = duration || 10;
        this._launchStartX = this.x;
        this._launchStartY = this.y;
        this._targetX = tx;
        this._targetY = ty;
        this._onHitCallback = onHitCallback;

        this._dashAngle = Math.atan2(ty - this.y, tx - this.x);
        this.rotation = this._dashAngle;

        for (var i = 0; i < this._trailSprites.length; i++) {
            this._trailSprites[i].visible = false;
            this._trailSprites[i].opacity = 0;
            if (this.parent && !this._trailSprites[i].parent) {
                this.parent.addChildAt(this._trailSprites[i], this.parent.getChildIndex(this));
            }
        }
    };

    Sprite_CinematicChainCard.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this.visible || this._state === 'DONE') return;

        if (this._state === 'LAUNCH') {
            this._launchFrame++;
            var f = this._launchFrame;
            var total = this._launchDuration;
            var t = Math.min(1.0, f / total);
            var p = t * t; // Direct explosive rocket-rush dash

            var nextX = this._launchStartX + (this._targetX - this._launchStartX) * p;
            var nextY = this._launchStartY + (this._targetY - this._launchStartY) * p;

            this.x = nextX;
            this.y = nextY;
            this.rotation = Math.atan2(this._targetY - this._launchStartY, this._targetX - this._launchStartX);

            // Kinetic Speed Stretch during dash
            var speedStretch = 1.0 + Math.sin(t * Math.PI) * 0.4;
            this.scale.x = 1.15 * speedStretch;
            this.scale.y = 1.15 * (1.8 - speedStretch) * 0.9;
            this.opacity = 255;

            // Ghost Trail update along straight dash line
            var trIdx = (f % this._trailSprites.length);
            var tSpr = this._trailSprites[trIdx];
            if (tSpr) {
                tSpr.x = this.x;
                tSpr.y = this.y;
                tSpr.scale.x = this.scale.x * 0.92;
                tSpr.scale.y = this.scale.y * 0.92;
                tSpr.rotation = this.rotation;
                tSpr.opacity = 200;
                tSpr.visible = true;
            }

            for (var i = 0; i < this._trailSprites.length; i++) {
                var tr = this._trailSprites[i];
                if (tr.visible) {
                    tr.opacity -= 32;
                    if (tr.opacity <= 0) {
                        tr.visible = false;
                        tr.opacity = 0;
                    }
                }
            }

            if (f >= total) {
                this._state = 'DONE';
                this.visible = false;
                this.opacity = 0;
                for (var j = 0; j < this._trailSprites.length; j++) {
                    this._trailSprites[j].visible = false;
                    this._trailSprites[j].opacity = 0;
                }
                if (typeof this._onHitCallback === 'function') {
                    this._onHitCallback(this._targetX, this._targetY, this._vfxInfo, this._index, this._total, this._targetBattler);
                }
            }
        }
    };

    // ============================================================================
    // 10. CINEMATIC CHAIN COMBO CASCADING BARRAGE CONTROLLER
    // ============================================================================
    function Sprite_CinematicChainFusion() {
        this.initialize.apply(this, arguments);
    }
    Sprite_CinematicChainFusion.prototype = Object.create(Sprite.prototype);
    Sprite_CinematicChainFusion.prototype.constructor = Sprite_CinematicChainFusion;

    Sprite_CinematicChainFusion.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.visible = false;
        this._active = false;
        this._timer = 0;
        this._chainSkills = [];
        this._subject = null;
        this._targets = [];
        this._targetCoords = [];

        // 1. Dark Backdrop with Vignette
        this._darkBackdrop = new Sprite();
        this._darkBackdrop.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this._darkBackdrop.opacity = 0;
        this.addChild(this._darkBackdrop);

        // 2. Runic Magic Circle Sprite at Center
        this._magicCircle = new Sprite();
        this._magicCircle.anchor.x = 0.5;
        this._magicCircle.anchor.y = 0.5;
        this._magicCircle.bitmap = new Bitmap(320, 320);
        this._magicCircle.blendMode = PIXI.blendModes.ADD;
        this._magicCircle.visible = false;
        this.addChild(this._magicCircle);

        // 3. Lightning / Laser Linkage Canvas
        this._linksSprite = new Sprite();
        this._linksSprite.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this._linksSprite.blendMode = PIXI.blendModes.ADD;
        this._linksSprite.visible = false;
        this.addChild(this._linksSprite);

        // 4. Cards Pool
        this._cardSprites = [];
        for (var i = 0; i < 6; i++) {
            var cCard = new Sprite_CinematicChainCard();
            this._cardSprites.push(cCard);
            this.addChild(cCard);
        }

        // 5. Top Banner (COMBO CHAIN xN)
        this._topBanner = new Sprite();
        this._topBanner.anchor.x = 0.5;
        this._topBanner.anchor.y = 0.5;
        this._topBanner.bitmap = new Bitmap(450, 60);
        this._topBanner.visible = false;
        this.addChild(this._topBanner);
    };

    Sprite_CinematicChainFusion.prototype.launch = function(subject, chainSkills, targets) {
        if (!chainSkills || chainSkills.length === 0) return;
        this._active = true;
        this._timer = 0;
        this._subject = subject;
        this._chainSkills = chainSkills;
        this._targets = targets;
        this.visible = true;

        var cx = Graphics.boxWidth / 2;
        var cy = (Graphics.boxHeight / 2) - 20;
        this._cx = cx;
        this._cy = cy;

        // Resolve Target Coordinates
        this._targetCoords = [];
        var isForFriend = (chainSkills[0].scope >= 7 && chainSkills[0].scope <= 11);
        var isForAll = (chainSkills[0].scope === 2 || chainSkills[0].scope === 8 || chainSkills[0].scope === 10);

        if (isForFriend) {
            if (isForAll) {
                var pMembers = $gameParty.battleMembers();
                for (var p = 0; p < pMembers.length; p++) {
                    if (pMembers[p].isAlive()) this._targetCoords.push({ x: 130, y: 65 + (p * 140) });
                }
            } else {
                var pIdx = 0;
                if (targets && targets.length > 0 && targets[0].isActor) {
                    pIdx = Math.max(0, $gameParty.battleMembers().indexOf(targets[0]));
                }
                this._targetCoords.push({ x: 130, y: 65 + (pIdx * 140) });
            }
        } else {
            if (isForAll) {
                var enemies = $gameTroop.aliveMembers();
                for (var e = 0; e < enemies.length; e++) {
                    if (enemies[e]._screenX !== undefined) {
                        this._targetCoords.push({ x: enemies[e]._screenX, y: enemies[e]._screenY - 30 });
                    }
                }
            } else {
                if (targets && targets.length > 0 && targets[0]._screenX !== undefined) {
                    this._targetCoords.push({ x: targets[0]._screenX, y: targets[0]._screenY - 30 });
                } else {
                    this._targetCoords.push({ x: Graphics.boxWidth * 0.68, y: Graphics.boxHeight * 0.42 });
                }
            }
        }
        if (this._targetCoords.length === 0) {
            this._targetCoords.push({ x: Graphics.boxWidth * 0.68, y: Graphics.boxHeight * 0.42 });
        }

        // Render Static Visuals
        this.renderBackdrop();
        this.renderTopBanner(chainSkills.length);
        this.renderMagicCircle();

        // Position & Setup Cards
        for (var i = 0; i < this._cardSprites.length; i++) {
            if (i < chainSkills.length) {
                var tgtBattler = (targets && targets.length > 0) ? targets[Math.min(i, targets.length - 1)] : null;
                this._cardSprites[i].setup(chainSkills[i], i, chainSkills.length, cx, Graphics.boxHeight + 40, cx, cy, tgtBattler);
            } else {
                this._cardSprites[i].visible = false;
            }
        }

        // Reset positions
        this._topBanner.x = cx;
        this._topBanner.y = 45;
        this._topBanner.scale.x = 0.5;
        this._topBanner.scale.y = 0.5;
        this._topBanner.opacity = 0;
        this._topBanner.visible = true;

        this._magicCircle.x = cx;
        this._magicCircle.y = cy;
        this._magicCircle.scale.x = 0.3;
        this._magicCircle.scale.y = 0.3;
        this._magicCircle.rotation = 0;
        this._magicCircle.opacity = 0;
        this._magicCircle.visible = true;

        SoundManager.playUseSkill();
    };

    Sprite_CinematicChainFusion.prototype.renderBackdrop = function() {
        var w = Graphics.boxWidth;
        var h = Graphics.boxHeight;
        this._darkBackdrop.bitmap.clear();
        var ctx = this._darkBackdrop.bitmap.context;
        ctx.save();

        var rad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.75);
        rad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
        rad.addColorStop(0.7, 'rgba(6, 10, 20, 0.94)');
        rad.addColorStop(1, 'rgba(2, 4, 8, 0.98)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
        this._darkBackdrop.bitmap._setDirty();
    };

    Sprite_CinematicChainFusion.prototype.renderTopBanner = function(comboCount) {
        var w = 380;
        var h = 54;
        this._topBanner.bitmap.clear();
        var ctx = this._topBanner.bitmap.context;
        ctx.save();

        // Cute Rounded Capsule Banner
        var r = 16;
        ctx.beginPath();
        ctx.moveTo(r, 0); ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r); ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h); ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r); ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();

        // Dark Wine / Warm Purple Background
        ctx.fillStyle = 'rgba(28, 14, 38, 0.95)';
        ctx.fill();

        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Banner Text (Cute bold typography)
        ctx.font = 'bold 22px ' + popupFontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        var textGrad = ctx.createLinearGradient(0, 10, 0, 44);
        textGrad.addColorStop(0, '#ffffff');
        textGrad.addColorStop(1, '#ffd166');
        ctx.fillStyle = textGrad;
        ctx.fillText('✨ COMBO CHAIN x' + comboCount + ' ✨', w / 2, h / 2);

        ctx.restore();
        this._topBanner.bitmap._setDirty();
    };

    Sprite_CinematicChainFusion.prototype.renderMagicCircle = function() {
        // Disabled per user request (will be replaced with custom asset later)
        this._magicCircle.bitmap.clear();
        this._magicCircle.visible = false;
    };

    Sprite_CinematicChainFusion.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this._active) return;

        this._timer++;
        var t = this._timer;
        var count = this._chainSkills.length;
        var cx = this._cx;
        var cy = this._cy;

        if (t <= 20) {
            // PHASE 1: Screen Dim & Cards Fly In to Position
            var p1 = t / 20;
            this._darkBackdrop.opacity = p1 * 200;

            this._topBanner.opacity = p1 * 255;
            this._topBanner.scale.x = 0.6 + p1 * 0.4;
            this._topBanner.scale.y = 0.6 + p1 * 0.4;

            this._magicCircle.visible = false;

            for (var c = 0; c < count; c++) {
                var card = this._cardSprites[c];
                card.opacity = Math.min(255, p1 * 300);
                card.scale.x = 0.3 + p1 * 0.7;
                card.scale.y = 0.3 + p1 * 0.7;
                card.x = card._startX + (card._orbitX - card._startX) * p1;
                card.y = card._startY + (card._orbitY - card._startY) * p1;
            }
        } else {
            this._magicCircle.visible = false;
            this._linksSprite.visible = true;
            this._linksSprite.bitmap.clear();
            var ctx = this._linksSprite.bitmap.context;
            ctx.save();
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 3.0;
            ctx.shadowColor = '#ffd600';
            ctx.shadowBlur = 16;

            ctx.beginPath();
            var visibleCount = 0;
            for (var k = 0; k < count; k++) {
                var cCard = this._cardSprites[k];
                if (cCard.visible && cCard._state !== 'LAUNCH' && cCard._state !== 'DONE') {
                    var hoverY = cCard._orbitY + Math.sin(t * 0.15 + k) * 5;
                    cCard.y = hoverY;
                    if (visibleCount === 0) ctx.moveTo(cCard.x, cCard.y);
                    else ctx.lineTo(cCard.x, cCard.y);
                    visibleCount++;
                }
            }
            if (visibleCount > 2) ctx.closePath();
            ctx.stroke();
            ctx.restore();
            this._linksSprite.bitmap._setDirty();

            // PHASE 2: Sequential Cascading Barrage (One by One High-Speed Dash!)
            var interval = 14;
            for (var idx = 0; idx < count; idx++) {
                var launchFrame = 20 + (idx * interval);
                if (t === launchFrame) {
                    var launchCard = this._cardSprites[idx];
                    var targetCoord = this._targetCoords[Math.min(idx, this._targetCoords.length - 1)];
                    var self = this;
                    var skillObj = this._chainSkills[idx];
                    var targetObj = (self._targets && self._targets.length > 0) ? self._targets[Math.min(idx, self._targets.length - 1)] : null;

                    SoundManager.playUseSkill();

                    launchCard.launchTo(targetCoord.x, targetCoord.y, 10, function(tx, ty, vfxInfo, hitIdx, totalHits, tgtBattler) {
                        var effVfx = vfxInfo || getYureSkillVFXInfo(skillObj, true);

                        // Impact Explosion Visuals (HD Custom Elemental)
                        if (self.parent && self.parent.spawnExplosion) {
                            self.parent.spawnExplosion(tx, ty, effVfx);
                            if (hitIdx === totalHits - 1) {
                                self.parent.spawnExplosion(tx + 14, ty - 10, effVfx);
                            }
                        }

                        // Apply Target Flinch
                        applyTargetFlinch(tgtBattler || targetObj, 1, 0);

                        // Progressive Heavy Screen Shake & Camera Punch
                        var type = effVfx.type || 'physical';
                        var sPow = (type === 'thunder' || type === 'earth' || type === 'big') ? (6 + hitIdx * 2) : (5 + hitIdx * 2);
                        $gameScreen.startShake(sPow, 6 + hitIdx * 2, 14);

                        if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._battleField) {
                            var bf = SceneManager._scene._spriteset._battleField;
                            bf._impactPunchTime = 14 + hitIdx * 3;
                            bf._impactPunchMax = 0.032 + hitIdx * 0.012;
                        }

                        // Impact Sound & Finisher Flash
                        if (hitIdx === totalHits - 1) {
                            SoundManager.playEnemyCollapse();
                            $gameScreen.startFlash([255, 255, 255, 160], 14);
                        } else {
                            SoundManager.playEnemyDamage();
                        }

                        // Trigger Skill's RPG Maker Animation if present (RPG Maker MV Compatible)
                        if (skillObj && skillObj.animationId > 0 && self._targets) {
                            var animId = skillObj.animationId;
                            var targets = Array.isArray(self._targets) ? self._targets : [self._targets];
                            targets.forEach(function(target) {
                                if (target && typeof target.startAnimation === 'function') {
                                    target.startAnimation(animId, false, 0);
                                }
                            });
                        }
                    });
                }
            }

            // PHASE 3: Completion & Fadeout
            var finishFrame = 22 + (count * interval) + 24;
            if (t >= finishFrame) {
                var fadeProg = (t - finishFrame) / 14;
                this._darkBackdrop.opacity = (1.0 - fadeProg) * 220;
                this._topBanner.opacity = (1.0 - fadeProg) * 255;
                this._magicCircle.opacity = (1.0 - fadeProg) * 200;

                if (t >= finishFrame + 14) {
                    this.finishChainExplosion();
                }
            }
        }
    };

    Sprite_CinematicChainFusion.prototype.finishChainExplosion = function() {
        this._active = false;
        this.visible = false;

        // 100% Zero-Residual Cleanup
        this._darkBackdrop.opacity = 0;
        this._topBanner.visible = false;
        this._magicCircle.visible = false;
        this._linksSprite.visible = false;

        for (var c = 0; c < this._cardSprites.length; c++) {
            var cd = this._cardSprites[c];
            cd.visible = false;
            cd.opacity = 0;
            if (cd._trailSprites) {
                for (var tr = 0; tr < cd._trailSprites.length; tr++) {
                    cd._trailSprites[tr].visible = false;
                    cd._trailSprites[tr].opacity = 0;
                }
            }
        }
    };

    // ============================================================================
    // 11. ACTION PROJECTILES MANAGER (POOL OF TILES, EXPLOSIONS, & CINEMATIC FUSION)
    // ============================================================================
    function Sprite_ActionProjectilesManager() {
        this.initialize.apply(this, arguments);
    }
    Sprite_ActionProjectilesManager.prototype = Object.create(Sprite.prototype);
    Sprite_ActionProjectilesManager.prototype.constructor = Sprite_ActionProjectilesManager;

    Sprite_ActionProjectilesManager.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        
        // 1. Cinematic Chain Fusion Overlay
        this._cinematicChainFusion = new Sprite_CinematicChainFusion();
        this.addChild(this._cinematicChainFusion);

        // 2. Pool of Standard Action Tiles
        this._tilesPool = [];
        for (var i = 0; i < 8; i++) {
            var tile = new Sprite_DynamicSkillTile();
            this._tilesPool.push(tile);
            this.addChild(tile);
        }

        // 3. Pool of Explosions
        this._explosionsPool = [];
        for (var j = 0; j < 8; j++) {
            var exp = new Sprite_SkillImpactExplosion();
            this._explosionsPool.push(exp);
            this.addChild(exp);
        }
    };

    Sprite_ActionProjectilesManager.prototype.launchCinematicChainCombo = function(subject, chainSkills, targets) {
        if (!enableSkillTiles || !chainSkills || chainSkills.length === 0) return;
        this._cinematicChainFusion.launch(subject, chainSkills, targets);
    };

    Sprite_ActionProjectilesManager.prototype.launchAction = function(subject, item, targets) {
        if (!enableSkillTiles || !subject || !item) return;

        var isItem = DataManager.isItem(item);
        var isForFriend = (item.scope >= 7 && item.scope <= 11);
        var isForAll = (item.scope === 2 || item.scope === 8 || item.scope === 10);
        var isActor = subject.isActor && subject.isActor();

        var vfxInfo = getYureSkillVFXInfo(item, isActor, subject);

        // 1. Tentukan Titik Awal (Origin)
        var startX = 500;
        var startY = 612;

        if (isActor) {
            if (isItem) {
                startX = 550;
                startY = 600;
            } else {
                var slotCenters = [340, 502, 666, 831, 995, 1159];
                var slotIdx = 0;
                var attackSkillId = subject.attackSkillId ? subject.attackSkillId() : 1;
                if (item.id === attackSkillId || item.id === 1) {
                    slotIdx = 0;
                } else if (subject.pethogsEquippedSkills) {
                    var eq = subject.pethogsEquippedSkills();
                    var eqIdx = eq.indexOf(item.id);
                    if (eqIdx >= 0) {
                        slotIdx = eqIdx + 1;
                    } else if (SceneManager._scene && SceneManager._scene._pethogsSkillSlots && SceneManager._scene._pethogsSkillSlots.index() >= 0) {
                        slotIdx = SceneManager._scene._pethogsSkillSlots.index();
                    }
                }
                slotIdx = Math.max(0, Math.min(5, slotIdx));

                if (SceneManager._scene && SceneManager._scene._pethogsSkillSlots && SceneManager._scene._pethogsSkillSlots._slotRects) {
                    var sw = SceneManager._scene._pethogsSkillSlots;
                    var sr = sw._slotRects[slotIdx];
                    if (sr) {
                        startX = sw.x + sr.x + Math.floor(sr.w / 2);
                        startY = sw.y + sr.y + Math.floor(sr.h / 2);
                    } else {
                        startX = slotCenters[slotIdx] || 500;
                    }
                } else {
                    startX = slotCenters[slotIdx] || 500;
                }
            }
        } else {
            startX = (subject._screenX !== undefined ? subject._screenX : (Graphics.boxWidth * 0.7));
            startY = (subject._screenY !== undefined ? subject._screenY - 30 : (Graphics.boxHeight * 0.4));
        }

        // 2. Tentukan Daftar Titik Target
        var targetCoords = [];
        var targetBattlers = [];

        if (!isActor) {
            if (isForAll) {
                var members = $gameParty.battleMembers();
                for (var i = 0; i < members.length; i++) {
                    if (members[i].isAlive() || item.scope === 10) {
                        targetCoords.push({ x: 130, y: 65 + (i * 140) });
                        targetBattlers.push(members[i]);
                    }
                }
            } else {
                var targetIdx = 0;
                var tgtMember = (targets && targets.length > 0) ? targets[0] : null;
                if (tgtMember && tgtMember.isActor) {
                    targetIdx = Math.max(0, $gameParty.battleMembers().indexOf(tgtMember));
                }
                targetCoords.push({ x: 130, y: 65 + (targetIdx * 140) });
                targetBattlers.push(tgtMember);
            }
        } else {
            if (isForFriend) {
                if (isForAll) {
                    var partyMembers = $gameParty.battleMembers();
                    for (var p = 0; p < partyMembers.length; p++) {
                        if (partyMembers[p].isAlive() || item.scope === 10) {
                            targetCoords.push({ x: 130, y: 65 + (p * 140) });
                            targetBattlers.push(partyMembers[p]);
                        }
                    }
                } else {
                    var pIdx = 0;
                    var pTgt = (targets && targets.length > 0) ? targets[0] : null;
                    if (pTgt && pTgt.isActor) {
                        pIdx = Math.max(0, $gameParty.battleMembers().indexOf(pTgt));
                    }
                    targetCoords.push({ x: 130, y: 65 + (pIdx * 140) });
                    targetBattlers.push(pTgt);
                }
            } else {
                if (isForAll) {
                    var enemies = $gameTroop.aliveMembers();
                    for (var e = 0; e < enemies.length; e++) {
                        if (enemies[e]._screenX !== undefined) {
                            targetCoords.push({ x: enemies[e]._screenX, y: enemies[e]._screenY - 30 });
                            targetBattlers.push(enemies[e]);
                        }
                    }
                } else {
                    var enemyTgt = (targets && targets.length > 0) ? targets[0] : null;
                    if (enemyTgt && enemyTgt._screenX !== undefined) {
                        targetCoords.push({ x: enemyTgt._screenX, y: enemyTgt._screenY - 30 });
                        targetBattlers.push(enemyTgt);
                    } else {
                        targetCoords.push({ x: Graphics.boxWidth * 0.65, y: Graphics.boxHeight * 0.42 });
                        targetBattlers.push(null);
                    }
                }
            }
        }

        if (targetCoords.length === 0) {
            targetCoords.push({ x: Graphics.boxWidth * 0.65, y: Graphics.boxHeight * 0.42 });
            targetBattlers.push(null);
        }

        // 3. Luncurkan Proyektil Kotak Icon untuk setiap target
        for (var t = 0; t < targetCoords.length; t++) {
            var coord = targetCoords[t];
            var battler = targetBattlers[t];
            var tile = this.getAvailableTile();
            if (tile) {
                var delay = (targetCoords.length > 1) ? (t * 2) : 0;
                tile.setup(item, startX, startY, coord.x, coord.y, vfxInfo, delay, battler);
            }
        }
    };

    Sprite_ActionProjectilesManager.prototype.getAvailableTile = function() {
        for (var i = 0; i < this._tilesPool.length; i++) {
            if (!this._tilesPool[i]._active) {
                return this._tilesPool[i];
            }
        }
        var newTile = new Sprite_DynamicSkillTile();
        this._tilesPool.push(newTile);
        this.addChild(newTile);
        return newTile;
    };

    Sprite_ActionProjectilesManager.prototype.spawnExplosion = function(x, y, vfxInfo, optC2) {
        for (var i = 0; i < this._explosionsPool.length; i++) {
            var exp = this._explosionsPool[i];
            if (!exp.visible) {
                exp.play(x, y, vfxInfo, optC2);
                return;
            }
        }
        var newExp = new Sprite_SkillImpactExplosion();
        this._explosionsPool.push(newExp);
        this.addChild(newExp);
        newExp.play(x, y, vfxInfo, optC2);
    };

    // ============================================================================
    // 12. HOOK SCENE_BATTLE & SINKRONISASI AKSI / QTE / CHAIN COMBO
    // ============================================================================
    var _Spriteset_Battle_createUpperLayer = Spriteset_Battle.prototype.createUpperLayer;
    Spriteset_Battle.prototype.createUpperLayer = function() {
        _Spriteset_Battle_createUpperLayer.call(this);
        this.createActionProjectilesLayer();
    };

    Spriteset_Battle.prototype.createActionProjectilesLayer = function() {
        if (!enableSkillTiles) return;
        this._actionProjectilesManager = new Sprite_ActionProjectilesManager();
        this.addChild(this._actionProjectilesManager);
    };

    // SINKRONISASI DENGAN QTE: Hook Scene_Battle.prototype.startYureQTEExecution
    var _Scene_Battle_startYureQTEExecution = Scene_Battle.prototype.startYureQTEExecution;
    if (_Scene_Battle_startYureQTEExecution) {
        Scene_Battle.prototype.startYureQTEExecution = function(action, callback) {
            var wrappedCallback = function() {
                if (callback) callback();
                if (SceneManager._scene && SceneManager._scene._spriteset && SceneManager._scene._spriteset._actionProjectilesManager) {
                    var finalItem = action ? action.item() : null;
                    var subject = BattleManager._subject;
                    var targets = action ? action.makeTargets() : [];
                    var chainSkills = (action && action._chainComboSkills && action._chainComboSkills.length > 1) ? action._chainComboSkills : null;

                    if (subject && finalItem) {
                        if (chainSkills) {
                            chainSkills[0] = finalItem;
                            SceneManager._scene._spriteset._actionProjectilesManager.launchCinematicChainCombo(subject, chainSkills, targets);
                        } else {
                            SceneManager._scene._spriteset._actionProjectilesManager.launchAction(subject, finalItem, targets);
                        }
                    }
                }
            };
            _Scene_Battle_startYureQTEExecution.call(this, action, wrappedCallback);
        };
    }

    var _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        _BattleManager_startAction.call(this);
        var subject = this._subject;
        var action = subject ? subject.currentAction() : null;
        var item = action ? action.item() : null;
        var targets = action ? action.makeTargets() : [];
        var chainSkills = (action && action._chainComboSkills && action._chainComboSkills.length > 1) ? action._chainComboSkills : null;

        // Jika skill memiliki QTE, JANGAN luncurkan sekarang! Tunggu sampai QTE selesai dievaluasi!
        var hasQte = (item && item.note && item.note.match(/<QTE/i));
        if (!hasQte && subject && item && SceneManager._scene && SceneManager._scene._spriteset) {
            var ss = SceneManager._scene._spriteset;
            if (ss._actionProjectilesManager) {
                if (chainSkills) {
                    ss._actionProjectilesManager.launchCinematicChainCombo(subject, chainSkills, targets);
                } else {
                    ss._actionProjectilesManager.launchAction(subject, item, targets);
                }
            }
        }
    };

    // Center-Zoom Camera Impact Punch
    var _Spriteset_Battle_update = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        _Spriteset_Battle_update.call(this);
        if (this._battleField && this._battleField._impactPunchTime > 0) {
            this._battleField._impactPunchTime--;
            var t = this._battleField._impactPunchTime;
            var maxZoom = this._battleField._impactPunchMax || 0.025;
            var punchScale = 1.0 + Math.sin((t / 14) * Math.PI) * maxZoom;
            this._battleField.scale.x = punchScale;
            this._battleField.scale.y = punchScale;
        } else if (this._battleField && this._battleField.scale.x !== 1.0) {
            this._battleField.scale.x = 1.0;
            this._battleField.scale.y = 1.0;
        }
    };

})();
