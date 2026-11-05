//=============================================================================
// Yure_BattleStatus.js
//=============================================================================

/*:
 * @plugindesc [v3.0] Cyber-Anime Battle Inspection Modal (Press 'T' / L2 in Battle) with Anime.js, Dynamic Glitch FX & Glassmorphism.
 * @author Yure Party Team & Antigravity
 *
 * @param --- Theme Palette ---
 * @default
 *
 * @param Accent Color
 * @parent --- Theme Palette ---
 * @desc Warna aksen utama (Cyan/Aquamarine: hsl(175, 100%, 77%) atau #38bdf8).
 * @default hsl(175, 100%, 77%)
 *
 * @param Shadow Accent Color
 * @parent --- Theme Palette ---
 * @desc Warna aksen bayangan/danger (Coral/Crimson: hsl(10, 100%, 60%) atau #f87171).
 * @default hsl(10, 100%, 60%)
 *
 * @param Glitch Effect
 * @parent --- Theme Palette ---
 * @desc Aktifkan periodic cyber glitch & scanline flash saat modal terbuka.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * YURE BATTLE STATUS (CYBER-ANIME BATTLE INSPECTION MODAL V3.0)
 * ============================================================================
 * Modal status & inspeksi pertarungan modern bertenaga Anime.js:
 * 
 * 1. Visual Cyberpunk Glassmorphism:
 *    - Desain Dark Frosted Glass dengan dual neon glow border (--accent & --shadow).
 *    - Cybernetic corner brackets [ + ], scanlines halus, dan typography modern.
 *    - Periodic Micro-Glitch loop dinamis (efek slice kromatik horizontal).
 *
 * 2. Transisi Anime.js Ultra Smooth:
 *    - Elastic Spring Pop-In (easeOutElastic) & Fast Snap Pop-Out.
 *    - Staggered battler card entrance.
 *
 * 3. Navigasi & Kontrol Lengkap:
 *    - [T] (Keyboard) / [L2] (Gamepad): Buka / Tutup Layar Inspeksi.
 *    - [ESC] / [Cancel]: Tutup modal (Reject Sound).
 *    - [ENTER] / [OK]: Konfirmasi / Tutup modal (Accept Sound).
 *    - [TAB] / [Panah]: Navigasi fokus Party & Musuh.
 *
 * 4. Deskripsi Efek & State:
 *    Tambahkan tag pada Database -> States (Note):
 *    <desc: Penjelasan efek status di sini>
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_BattleStatus') || {};
    var accentColor = String(parameters['Accent Color'] || 'hsl(175, 100%, 77%)');
    var shadowColor = String(parameters['Shadow Accent Color'] || 'hsl(10, 100%, 60%)');
    var enableGlitch = String(parameters['Glitch Effect'] || 'true') === 'true';

    // Map Keyboard 'T' (Key code 84) dan Gamepad L2 (Button 6)
    Input.keyMapper[84] = 'yure_t';
    Input.gamepadMapper[6] = 'yure_t';
    if (Input.gamepadMapper[10] === 'yure_t') {
        Input.gamepadMapper[10] = 'lanternToggle';
    }

    // ============================================================================
    // SISTEM STRICT RISING-EDGE & COOLDOWN ANTI-SPAM
    // ============================================================================
    var _inspectCooldown = 0;
    var _buttonHeld = false;

    function isYureInspectTriggered() {
        if (_inspectCooldown > 0) return false;

        var isPressedNow = false;

        // 1. Keyboard 'T' Check
        if (Input.isPressed('yure_t')) {
            isPressedNow = true;
        }

        // 2. Hardware Gamepad Button 6 (L2) Check
        if (navigator.getGamepads) {
            var gamepads = navigator.getGamepads();
            if (gamepads) {
                for (var i = 0; i < gamepads.length; i++) {
                    var gp = gamepads[i];
                    if (gp && gp.buttons && gp.buttons[6]) {
                        if (gp.buttons[6].pressed || gp.buttons[6].value > 0.4) {
                            isPressedNow = true;
                        }
                    }
                }
            }
        }

        // Deteksi Transisi Rising Edge: Hanya trigger 1x saat tombol BARU ditekan
        if (isPressedNow) {
            if (!_buttonHeld) {
                _buttonHeld = true;
                _inspectCooldown = 20; // 20 frames cooldown (~330ms anti-spam)
                return true;
            }
        } else {
            _buttonHeld = false;
        }

        return false;
    }

    // ============================================================================
    // 1. WINDOW BATTLE INSPECT MODAL (ANIME.JS & CYBER GLITCH ENGINE)
    // ============================================================================
    function Window_YureBattleInspectModal() {
        this.initialize.apply(this, arguments);
    }
    Window_YureBattleInspectModal.prototype = Object.create(Window_Base.prototype);
    Window_YureBattleInspectModal.prototype.constructor = Window_YureBattleInspectModal;

    Window_YureBattleInspectModal.prototype.initialize = function() {
        var w = Math.min(1080, Graphics.boxWidth - 40);
        var h = Math.min(520, Graphics.boxHeight - 40);
        var x = (Graphics.boxWidth - w) / 2;
        var y = (Graphics.boxHeight - h) / 2;
        
        Window_Base.prototype.initialize.call(this, x, y, w, h);
        
        this.opacity = 0; // Transparan frame bawaan RPG Maker
        this._targetWidth = w;
        this._targetHeight = h;
        this._targetX = x;
        this._targetY = y;
        this._selectedIndex = 0;
        this._selectedSide = 0; // 0 = Party, 1 = Troop

        // Fullscreen Dimmer Backdrop (Smooth Fade)
        this._dimmerSprite = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
        this._dimmerSprite.bitmap.fillRect(0, 0, Graphics.boxWidth, Graphics.boxHeight, 'rgba(4, 7, 14, 0.86)');
        this._dimmerSprite.x = -x;
        this._dimmerSprite.y = -y;
        this._dimmerSprite.alpha = 0;
        this.addChildToBack(this._dimmerSprite);

        // Cyber Frosted Glass Backdrop Sprite
        this._bgSprite = new Sprite(new Bitmap(w, h));
        this.addChildToBack(this._bgSprite);

        // Glitch Overlay Layer Sprite
        this._glitchSprite = new Sprite(new Bitmap(w, h));
        this._glitchSprite.alpha = 0;
        this.addChild(this._glitchSprite);

        // State & Glitch Clock Control
        this._isOpenModal = false;
        this._isGlitching = false;
        this._glitchTimer = 0;
        this._glitchClock = null;
        this._animating = false;

        // Set Anchor / Pivot to Center for smooth Anime.js elastic scale
        this.pivot.x = w / 2;
        this.pivot.y = h / 2;
        this.x = x + w / 2;
        this.y = y + h / 2;
        this.scale.x = 0.82;
        this.scale.y = 0.82;
        this.alpha = 0;
        this.openness = 255;

        this.hide();
        this.deactivate();
    };

    Window_YureBattleInspectModal.prototype.standardPadding = function() {
        return 14;
    };

    /**
     * Periodic Micro-Glitch Engine (KickOff Loop)
     */
    Window_YureBattleInspectModal.prototype.kickOffGlitch = function() {
        if (!enableGlitch || !this._isOpenModal) return;
        var self = this;
        var nextDelay = (!this._hasGlitched) ? 1400 : (Math.random() * 6000 + 2500);

        if (this._glitchClock) clearTimeout(this._glitchClock);
        this._glitchClock = setTimeout(function() {
            if (!self._isOpenModal) return;
            self.triggerGlitchBurst();
        }, nextDelay);
    };

    Window_YureBattleInspectModal.prototype.triggerGlitchBurst = function() {
        if (!this._isOpenModal) return;
        this._hasGlitched = true;
        this._isGlitching = true;
        this._glitchTimer = 10; // Glitch selama 10 frames (~160ms)
        this.renderGlitchFX();
    };

    Window_YureBattleInspectModal.prototype.renderGlitchFX = function() {
        var bitmap = this._glitchSprite.bitmap;
        bitmap.clear();
        var w = this._targetWidth;
        var h = this._targetHeight;
        var ctx = bitmap._context;

        ctx.save();
        // 1. Horizontal Sliced Displacements
        var sliceCount = Math.floor(Math.random() * 4) + 3;
        for (var i = 0; i < sliceCount; i++) {
            var sy = Math.random() * (h - 30);
            var sh = Math.random() * 18 + 6;
            var offset = (Math.random() - 0.5) * 24;

            // Cyan & Red chromatic aberration slices
            ctx.fillStyle = (i % 2 === 0) ? 'rgba(78, 242, 210, 0.18)' : 'rgba(255, 87, 51, 0.20)';
            ctx.fillRect(offset > 0 ? offset : 0, sy, w - Math.abs(offset), sh);

            ctx.strokeStyle = (i % 2 === 0) ? accentColor : shadowColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(w, sy);
            ctx.stroke();
        }

        // 2. High-Tech Scanline Flash
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (var y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1.5);
        }
        ctx.restore();
        bitmap._setDirty();

        this._glitchSprite.alpha = 0.95;
    };

    /**
     * Open Modal with Anime.js Elastic Spring Pop-In
     */
    Window_YureBattleInspectModal.prototype.openModal = function() {
        this._isOpenModal = true;
        this._animating = true;
        this._hasGlitched = false;
        this.show();
        this.activate();
        this.refresh();

        // Audio Slide Cue
        SoundManager.playOk();

        // 1. Dimmer Backdrop Fade-In
        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this._dimmerSprite);
            window.anime({
                targets: this._dimmerSprite,
                alpha: 1.0,
                duration: 250,
                easing: 'easeOutQuad'
            });

            // 2. Elastic Pop-In for Main Modal
            window.anime.remove(this);
            window.anime.remove(this.scale);
            
            this.scale.x = 0.82;
            this.scale.y = 0.82;
            this.alpha = 0;

            var self = this;
            window.anime({
                targets: this.scale,
                x: 1.0,
                y: 1.0,
                duration: 650,
                easing: 'easeOutElastic(1, .75)',
                complete: function() {
                    self._animating = false;
                }
            });

            window.anime({
                targets: this,
                alpha: 1.0,
                duration: 220,
                easing: 'easeOutQuad'
            });
        } else {
            this.scale.x = 1.0;
            this.scale.y = 1.0;
            this.alpha = 1.0;
            this._dimmerSprite.alpha = 1.0;
            this._animating = false;
        }

        // Trigger Periodic Glitch Kickoff
        this.kickOffGlitch();
    };

    /**
     * Close Modal with Anime.js Pop-Out
     */
    Window_YureBattleInspectModal.prototype.closeModal = function(actionType) {
        if (!this._isOpenModal) return;
        this._isOpenModal = false;
        this.deactivate();

        if (this._glitchClock) {
            clearTimeout(this._glitchClock);
            this._glitchClock = null;
        }
        this._glitchSprite.alpha = 0;

        // Audio Cue: Accept / Proceed vs Cancel / Reject
        if (actionType === 'proceed' || actionType === 'ok') {
            SoundManager.playOk();
        } else {
            SoundManager.playCancel();
        }

        var self = this;
        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this._dimmerSprite);
            window.anime({
                targets: this._dimmerSprite,
                alpha: 0,
                duration: 180,
                easing: 'easeInQuad'
            });

            window.anime.remove(this);
            window.anime.remove(this.scale);

            window.anime({
                targets: this.scale,
                x: 0.86,
                y: 0.86,
                duration: 200,
                easing: 'easeInQuad'
            });

            window.anime({
                targets: this,
                alpha: 0,
                duration: 200,
                easing: 'easeInQuad',
                complete: function() {
                    self.hide();
                    self.scale.x = 0.82;
                    self.scale.y = 0.82;
                }
            });
        } else {
            this.alpha = 0;
            this._dimmerSprite.alpha = 0;
            this.hide();
        }
    };

    Window_YureBattleInspectModal.prototype.isOpenModal = function() {
        return this._isOpenModal;
    };

    Window_YureBattleInspectModal.prototype.getBattlerStateItems = function(battler) {
        var items = [];
        if (!battler) return items;

        // 1. States
        battler.states().forEach(function(state) {
            if (state && state.iconIndex > 0) {
                var desc = state.message1 || state.message2 || state.message4 || "Mempengaruhi kondisi bertarung.";
                if (state.note && state.note.match(/<desc:(.*?)>/i)) {
                    desc = RegExp.$1;
                }
                items.push({
                    id: state.id,
                    icon: state.iconIndex,
                    name: state.name,
                    desc: desc,
                    isBuff: false
                });
            }
        });
        
        // 2. Buffs & Debuffs
        for (var i = 0; i < battler._buffs.length; i++) {
            var level = battler._buffs[i];
            if (level !== 0) {
                var pName = TextManager.param(i);
                var isBuff = level > 0;
                var desc = isBuff ? ("Meningkatkan " + pName + " (+" + Math.abs(level * 25) + "%).") : ("Menurunkan " + pName + " (-" + Math.abs(level * 25) + "%).");
                items.push({
                    id: 0,
                    icon: battler.buffIconIndex(level, i),
                    name: (isBuff ? "▲ " : "▼ ") + pName,
                    desc: desc,
                    isBuff: isBuff
                });
            }
        }
        
        return items;
    };

    /**
     * Helper: Gambar Sudut Cyber Reticle [ + ]
     */
    Window_YureBattleInspectModal.prototype.drawCyberReticle = function(ctx, x, y, w, h, col, size) {
        var s = size || 10;
        ctx.save();
        ctx.strokeStyle = col || accentColor;
        ctx.lineWidth = 2;

        // Top-Left
        ctx.beginPath();
        ctx.moveTo(x, y + s);
        ctx.lineTo(x, y);
        ctx.lineTo(x + s, y);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(x + w - s, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + s);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(x, y + h - s);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + s, y + h);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(x + w - s, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w, y + h - s);
        ctx.stroke();

        ctx.restore();
    };

    /**
     * Refresh Modal Content & High-Tech HUD Elements
     */
    Window_YureBattleInspectModal.prototype.refresh = function() {
        this.contents.clear();
        if (!$gameParty || !$gameTroop) return;

        var w = this.contentsWidth();
        var h = this.contentsHeight();
        var fullW = this._targetWidth;
        var fullH = this._targetHeight;
        
        // ====================================================================
        // 1. Gambar Warm Deep Purple Card Background pada _bgSprite
        // ====================================================================
        this._bgSprite.bitmap.clear();
        var bgCtx = this._bgSprite.bitmap._context;
        bgCtx.save();

        var r = 16;
        bgCtx.beginPath();
        bgCtx.moveTo(r, 0); bgCtx.lineTo(fullW - r, 0);
        bgCtx.quadraticCurveTo(fullW, 0, fullW, r); bgCtx.lineTo(fullW, fullH - r);
        bgCtx.quadraticCurveTo(fullW, fullH, fullW - r, fullH); bgCtx.lineTo(r, fullH);
        bgCtx.quadraticCurveTo(0, fullH, 0, fullH - r); bgCtx.lineTo(0, r);
        bgCtx.quadraticCurveTo(0, 0, r, 0); bgCtx.closePath();

        bgCtx.fillStyle = 'rgba(32, 16, 44, 0.98)';
        bgCtx.fill();

        // Cute Pink/Gold Rounded Borders
        bgCtx.strokeStyle = '#f472b6';
        bgCtx.lineWidth = 3;
        bgCtx.stroke();

        bgCtx.strokeStyle = '#ffd166';
        bgCtx.lineWidth = 1;
        bgCtx.strokeRect(6, 6, fullW - 12, fullH - 12);

        bgCtx.restore();
        this._bgSprite.bitmap._setDirty();

        var party = $gameParty.battleMembers();
        var troop = $gameTroop.aliveMembers();
        var halfW = Math.floor(w / 2) - 14;
        var ctx = this.contents._context;

        // ====================================================================
        // 2. Header Title & Status Bar
        // ====================================================================
        // Central Header Title Badge
        var badgeW = 380;
        var badgeH = 26;
        var badgeX = (w - badgeW) / 2;
        ctx.save();
        ctx.fillStyle = 'rgba(244, 114, 182, 0.2)';
        ctx.fillRect(badgeX, 4, badgeW, badgeH);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(badgeX, 4, badgeW, badgeH);
        ctx.restore();

        this.contents.fontSize = 15;
        this.contents.fontBold = true;
        this.changeTextColor('#ffffff');
        this.drawText("⚔️ STATUS & EFEK PERTARUNGAN ⚔️", 0, 4, w, 'center');

        // Turn Counter Badge on Right
        var turnText = "TURN: " + ($gameTroop.turnCount ? $gameTroop.turnCount() + 1 : 1);
        this.contents.fontSize = 13;
        this.changeTextColor('#ffd166');
        this.drawText(turnText, w - 110, 4, 100, 'right');
        this.resetTextColor();

        var startY = 38;

        // ====================================================================
        // 3. KOLOM KIRI: PARTY MEMBERS
        // ====================================================================
        this.contents.fontSize = 14;
        this.contents.fontBold = true;
        this.changeTextColor('#f472b6');
        this.drawText("💖 ANGGOTA PARTY (" + party.length + ")", 10, startY, halfW, 'left');
        this.resetTextColor();
        
        var leftY = startY + 22;
        for (var m = 0; m < party.length; m++) {
            var p = party[m];
            var pStates = this.getBattlerStateItems(p);
            var isCardSelected = (this._selectedSide === 0 && this._selectedIndex === m);

            // Kotak Card Background per Karakter
            ctx.save();
            var cr = 8;
            ctx.fillStyle = isCardSelected ? 'rgba(74, 32, 92, 0.95)' : 'rgba(44, 20, 58, 0.85)';
            ctx.fillRect(10, leftY, halfW, 64);
            ctx.strokeStyle = isCardSelected ? '#ffd166' : 'rgba(244, 114, 182, 0.35)';
            ctx.lineWidth = isCardSelected ? 2 : 1;
            ctx.strokeRect(10, leftY, halfW, 64);
            
            // Accent marker di sisi kiri kartu
            ctx.fillStyle = isCardSelected ? '#ffd166' : '#f472b6';
            ctx.fillRect(10, leftY, 4, 64);
            ctx.restore();

            // Nama & Level
            this.contents.fontSize = 14;
            this.contents.fontBold = true;
            this.changeTextColor('#ffffff');
            this.drawText(p.name(), 20, leftY + 2, 130, 'left');
            
            this.contents.fontSize = 12;
            this.contents.fontBold = false;
            this.changeTextColor('#fbcfe8');
            this.drawText("Lv." + p.level, 150, leftY + 3, 50, 'left');

            // Mini HP / MP / TP Progress Bars
            this.drawMiniGauges(p, 205, leftY + 4, halfW - 215, ctx);

            // Efek & Status List (Icon + Badges)
            if (pStates.length > 0) {
                var sTextY = leftY + 26;
                for (var ps = 0; ps < pStates.length; ps++) {
                    if (ps >= 2) break;
                    var pItem = pStates[ps];
                    var itemX = 20 + (ps * Math.floor((halfW - 20) / 2));
                    
                    this.drawIcon(pItem.icon, itemX, sTextY + 2);
                    this.contents.fontSize = 12;
                    this.changeTextColor(pItem.isBuff ? '#86efac' : '#ffd166');
                    this.drawText(pItem.name, itemX + 36, sTextY, 80, 'left');
                    
                    this.contents.fontSize = 11;
                    this.changeTextColor('#f1f5f9');
                    this.drawText(pItem.desc, itemX + 36, sTextY + 16, Math.floor((halfW - 30) / 2) - 40, 'left');
                }
            } else {
                this.contents.fontSize = 12;
                this.changeTextColor('rgba(251, 207, 232, 0.7)');
                this.drawText("✔ Kondisi Prima (Tanpa Efek Negatif)", 22, leftY + 30, halfW - 30, 'left');
            }

            leftY += 70;
        }

        // ====================================================================
        // 4. KOLOM KANAN: MUSUH & BOSS
        // ====================================================================
        var rightX = halfW + 28;
        this.contents.fontSize = 14;
        this.contents.fontBold = true;
        this.changeTextColor('#f87171');
        this.drawText("💀 TARGET MUSUH (" + troop.length + ")", rightX, startY, halfW, 'left');
        this.resetTextColor();

        var rightY = startY + 22;
        for (var n = 0; n < troop.length; n++) {
            var t = troop[n];
            var tStates = this.getBattlerStateItems(t);
            var isEnemySelected = (this._selectedSide === 1 && this._selectedIndex === n);

            // Kotak Card Background per Musuh
            ctx.save();
            ctx.fillStyle = isEnemySelected ? 'rgba(74, 24, 38, 0.95)' : 'rgba(48, 18, 30, 0.85)';
            ctx.fillRect(rightX, rightY, halfW, 64);
            ctx.strokeStyle = isEnemySelected ? '#ffd166' : 'rgba(248, 113, 113, 0.35)';
            ctx.lineWidth = isEnemySelected ? 2 : 1;
            ctx.strokeRect(rightX, rightY, halfW, 64);

            // Danger accent marker di sisi kanan kartu
            ctx.fillStyle = isEnemySelected ? '#ffd166' : '#f87171';
            ctx.fillRect(rightX + halfW - 4, rightY, 4, 64);
            ctx.restore();

            // Nama Musuh
            this.contents.fontSize = 14;
            this.contents.fontBold = true;
            this.changeTextColor('#f87171');
            this.drawText(t.name(), rightX + 12, rightY + 2, 150, 'left');

            // Enemy HP Gauge Bar
            var hpRate = Math.max(0, Math.min(1, t.hp / t.mhp));
            var barW = halfW - 180;
            var barX = rightX + 165;
            var barY = rightY + 8;
            
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX, barY, barW, 10);
            
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(barX, barY, Math.floor(barW * hpRate), 10);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.strokeRect(barX, barY, barW, 10);
            ctx.restore();

            this.contents.fontSize = 12;
            this.changeTextColor('#ffffff');
            this.drawText(t.hp + " / " + t.mhp, barX, rightY + 16, barW, 'right');
            this.resetTextColor();

            // Efek & Status List Musuh
            if (tStates.length > 0) {
                var tsY = rightY + 26;
                for (var ts = 0; ts < tStates.length; ts++) {
                    if (ts >= 2) break;
                    var tItem = tStates[ts];
                    var tItemX = rightX + 12 + (ts * Math.floor((halfW - 20) / 2));

                    this.drawIcon(tItem.icon, tItemX, tsY + 2);
                    this.contents.fontSize = 12;
                    this.changeTextColor(tItem.isBuff ? '#86efac' : '#ffd166');
                    this.drawText(tItem.name, tItemX + 36, tsY, 80, 'left');

                    this.contents.fontSize = 11;
                    this.changeTextColor('#f1f5f9');
                    this.drawText(tItem.desc, tItemX + 36, tsY + 16, Math.floor((halfW - 30) / 2) - 40, 'left');
                }
            } else {
                this.contents.fontSize = 12;
                this.changeTextColor('rgba(251, 207, 232, 0.7)');
                this.drawText("✔ Tidak Ada Efek Status Aktif", rightX + 14, rightY + 30, halfW - 30, 'left');
            }

            rightY += 70;
        }

        // ====================================================================
        // 5. FOOTER CONTROLS & HOTKEY HINTS
        // ====================================================================
        var footY = h - 22;
        this.contents.fontSize = 12;
        this.changeTextColor('#fbcfe8');
        this.drawText("[T / L2] Tutup  •  [ESC / X] Batal  •  [ENTER / Z] Selesai  •  [TAB / ◄ ►] Ganti Fokus", 0, footY - 2, w, 'center');
        this.resetTextColor();
    };

    /**
     * Draw Mini Glowing HP / MP / TP Progress Bars for Party Members
     */
    Window_YureBattleInspectModal.prototype.drawMiniGauges = function(actor, x, y, width, ctx) {
        var w = Math.floor(width / 3) - 6;
        
        // 1. HP Bar
        var hpRate = Math.max(0, Math.min(1, actor.hp / actor.mhp));
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, w, 6);
        ctx.fillStyle = '#f87171';
        ctx.fillRect(x, y, Math.floor(w * hpRate), 6);
        ctx.restore();

        this.contents.fontSize = 10;
        this.changeTextColor('#f87171');
        this.drawText("HP " + actor.hp, x, y + 6, w, 'left');

        // 2. MP Bar
        var mpRate = actor.mmp > 0 ? Math.max(0, Math.min(1, actor.mp / actor.mmp)) : 0;
        var mpX = x + w + 6;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(mpX, y, w, 6);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(mpX, y, Math.floor(w * mpRate), 6);
        ctx.restore();

        this.contents.fontSize = 10;
        this.changeTextColor('#38bdf8');
        this.drawText("MP " + actor.mp, mpX, y + 6, w, 'left');

        // 3. TP Bar
        var tpRate = Math.max(0, Math.min(1, actor.tp / 100));
        var tpX = mpX + w + 6;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(tpX, y, w, 6);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(tpX, y, Math.floor(w * tpRate), 6);
        ctx.restore();

        this.contents.fontSize = 10;
        this.changeTextColor('#34d399');
        this.drawText("TP " + actor.tp, tpX, y + 6, w, 'left');
        this.resetTextColor();
    };

    /**
     * Per-Frame Update Loop
     */
    Window_YureBattleInspectModal.prototype.update = function() {
        Window_Base.prototype.update.call(this);

        // Update Glitch Timer
        if (this._isGlitching) {
            this._glitchTimer--;
            if (this._glitchTimer <= 0) {
                this._isGlitching = false;
                this._glitchSprite.alpha = 0;
                this._glitchSprite.bitmap.clear();
                this.kickOffGlitch();
            }
        }

        // Tab / Directional Navigation
        if (this._isOpenModal && !this._animating) {
            if (Input.isTriggered('tab') || Input.isTriggered('pageup') || Input.isTriggered('pagedown') || Input.isTriggered('left') || Input.isTriggered('right')) {
                SoundManager.playCursor();
                this._selectedSide = this._selectedSide === 0 ? 1 : 0;
                this._selectedIndex = 0;
                this.refresh();
            } else if (Input.isTriggered('down')) {
                SoundManager.playCursor();
                var maxIdx = (this._selectedSide === 0 ? $gameParty.battleMembers().length : $gameTroop.aliveMembers().length) - 1;
                this._selectedIndex = Math.min(maxIdx, this._selectedIndex + 1);
                this.refresh();
            } else if (Input.isTriggered('up')) {
                SoundManager.playCursor();
                this._selectedIndex = Math.max(0, this._selectedIndex - 1);
                this.refresh();
            }
        }
    };


    // ============================================================================
    // 2. HOOK KE SCENE_BATTLE (ISOLATED MODAL & COOLDOWN HANDLER)
    // ============================================================================
    var _Scene_Battle_createAllWindows_YureStatus = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows_YureStatus.call(this);

        this._yureBattleInspectModal = new Window_YureBattleInspectModal();
        this.addChild(this._yureBattleInspectModal);
    };

    Scene_Battle.prototype.openYureInspectModal = function() {
        if (!this._yureBattleInspectModal) return;
        
        // Sembunyikan seluruh window, custom background sprite & HUD di belakangnya
        if (this._bgBattleWindow) this._bgBattleWindow.visible = false;
        if (this._bgBattleSlots) this._bgBattleSlots.visible = false;
        if (this._pethogsSkillSlots) {
            this._pethogsSkillSlots.hide();
            this._pethogsSkillSlots.deactivate();
        }
        if (this._pethogsSkillPopup) this._pethogsSkillPopup.hide();
        if (this._actorCommandWindow) {
            this._actorCommandWindow.hide();
            this._actorCommandWindow.deactivate();
        }
        if (this._bossHPWindow) this._bossHPWindow.hide();
        if (this._pethogsBossHP) this._pethogsBossHP.hide();
        if (this._pethogsStatusWindow) this._pethogsStatusWindow.hide();
        if (this._pethogsStatusLeft) this._pethogsStatusLeft.hide();
        if (this._partyCommandWindow) this._partyCommandWindow.hide();

        this._yureBattleInspectModal.openModal();
    };

    Scene_Battle.prototype.closeYureInspectModal = function(actionType) {
        if (!this._yureBattleInspectModal) return;

        this._yureBattleInspectModal.closeModal(actionType);

        // Kembalikan seluruh window medan pertempuran
        if (this._bgBattleWindow) this._bgBattleWindow.visible = true;
        if (this._bgBattleSlots) this._bgBattleSlots.visible = true;
        if (this._pethogsBossHP) this._pethogsBossHP.show();
        if (this._pethogsStatusWindow) this._pethogsStatusWindow.show();
        if (this._bossHPWindow) this._bossHPWindow.show();
        if (this._pethogsStatusLeft) this._pethogsStatusLeft.show();
        
        // Pastikan menu Fight / Escape selalu tersembunyi
        if (this._partyCommandWindow) {
            this._partyCommandWindow.deactivate();
            this._partyCommandWindow.hide();
        }

        // Aktifkan kembali opsi aksi aktor & slot skill
        if (BattleManager.actor() && BattleManager.isInputting()) {
            if (this._actorCommandWindow) {
                this._actorCommandWindow.show();
                this._actorCommandWindow.activate();
            }
            if (this._pethogsSkillSlots) {
                this._pethogsSkillSlots.show();
            }
        }
    };

    var _Scene_Battle_update_YureStatus = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        // Update Cooldown Timer per frame
        if (_inspectCooldown > 0) {
            _inspectCooldown--;
        }

        // Jika modal sedang terbuka, tangani penutupan dengan anti-spam
        if (this._yureBattleInspectModal && this._yureBattleInspectModal.isOpenModal()) {
            this._yureBattleInspectModal.update();

            // Handle KeyPresses (Escape / Cancel = reject action; Enter / OK = proceed action)
            if (isYureInspectTriggered() || Input.isTriggered('escape') || Input.isTriggered('cancel') || TouchInput.isCancelled()) {
                Input.clear();
                TouchInput.clear();
                _inspectCooldown = 20;
                this.closeYureInspectModal('cancel');
                return;
            }

            if (Input.isTriggered('ok') || TouchInput.isTriggered()) {
                Input.clear();
                TouchInput.clear();
                _inspectCooldown = 20;
                this.closeYureInspectModal('proceed');
                return;
            }
            return;
        }

        _Scene_Battle_update_YureStatus.call(this);

        // Buka modal saat menekan 'T' (Keyboard) atau 'L2' (Gamepad) jika pertarungan sedang berlangsung
        if (this._yureBattleInspectModal && isYureInspectTriggered()) {
            if (BattleManager.isInputting() || BattleManager._phase === 'turn' || BattleManager._phase === 'action') {
                Input.clear();
                _inspectCooldown = 20;
                this.openYureInspectModal();
            }
        }
    };

    // ============================================================================
    // 3. SAKI REVIVE & ENDURANCE LOGIC (HARDCODED HOOK)
    // ============================================================================
    var _Game_Battler_addState = Game_Battler.prototype.addState;
    Game_Battler.prototype.addState = function(stateId) {
        if ($gameParty && $gameParty.inBattle() && stateId === this.deathStateId() && this.isActor() && this.actorId() === 3) {
            
            if (this._sakiNyawa === undefined) this._sakiNyawa = 3;
            
            if (this._sakiNyawa > 0) {
                this._sakiNyawa -= 1;
                this._hp = Math.floor(this.mhp * 0.15); 
                if (this._hp <= 0) this._hp = 1; 
                
                this.startAnimation(49); // Animasi heal/revive
                this.eraseState(this.deathStateId()); 
                
                return; // Batalkan penambahan Death
            } 
            else if (!this._sakiEnduranceUsed) {
                this._sakiEnduranceUsed = true;
                this._hp = 1; 
                this.startAnimation(53); // Animasi bertahan
                this.eraseState(this.deathStateId()); 
                
                return; // Batalkan penambahan Death
            }
        }
        if (_Game_Battler_addState) {
            _Game_Battler_addState.call(this, stateId);
        } else {
            Game_BattlerBase.prototype.addState.call(this, stateId);
        }
    };

    var _Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
    Game_Battler.prototype.onBattleStart = function() {
        _Game_Battler_onBattleStart.call(this);
        if (this.isActor() && this.actorId() === 3) {
            this._sakiNyawa = 3;
            this._sakiEnduranceUsed = false;
        }
    };

})();
