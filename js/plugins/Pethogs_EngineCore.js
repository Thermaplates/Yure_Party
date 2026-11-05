//=============================================================================
// Pethogs_EngineCore.js
//=============================================================================

/*:
 * @plugindesc [v1.4.0] Battle Engine Core (Custom HUD & Equip Skill) khusus Yure Party.
 * Berjalan berdampingan dengan Yanfly Engine Plugins.
 * @author Pethogs (Yure Party Team)
 *
 * @param bg_slots
 * @text Skill Slots Background
 * @desc Gambar background untuk area Skill Slots di bawah.
 * @dir img/battlehud/
 * @type file
 * @default
 *
 * @param slots_x
 * @text Skill Slots X
 * @type number
 * @default 200
 *
 * @param slots_y
 * @text Skill Slots Y
 * @type number
 * @default 530
 *
 * @param slots_w
 * @text Skill Slots Width
 * @type number
 * @default 970
 *
 * @param slots_h
 * @text Skill Slots Height
 * @type number
 * @default 170
 *
 * @param boss_hp_x
 * @text Boss HP X
 * @type number
 * @default 158
 *
 * @param boss_hp_y
 * @text Boss HP Y
 * @type number
 * @default 392
 *
 * @param boss_hp_w
 * @text Boss HP Width
 * @type number
 * @default 500
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 * 
 * Pethogs_EngineCore adalah pondasi utama HUD pertarungan Yure Party.
 * 
 * Perubahan v1.4.0:
 * - Menambahkan Slot Pilihan ke-5 (Total 6 Slot termasuk Basic Attack).
 * - Dukungan penuh Asset Kustomisasi (Background HUD) via Parameter.
 * - Scene_Skill dirombak: Memilih skill akan memunculkan popup Use/Equip.
 * - Sistem Equip Skill dinamis untuk Slot 1 sampai 5.
 * - Opsi "Attack" dan "Skill" di kiri dihapus, diganti menjadi opsi "Command".
 * - Memilih "Command" memindahkan kursor ke Slot Statis di tengah.
 * - Slot tengah otomatis mengambil data skill yang di-equip dari Scene_Skill.
 */

var Imported = Imported || {};
Imported.Pethogs_EngineCore = true;

var Pethogs = Pethogs || {};
Pethogs.EngineCore = Pethogs.EngineCore || {};

// ============================================================================
// ImageManager - Path Asset Custom
// ============================================================================
ImageManager.loadBattleHud = function(filename, hue) {
    return this.loadBitmap('img/battlehud/', filename, hue, true);
};

ImageManager.loadBattleUI = function(filename, hue) {
    return this.loadBitmap('img/pictures/UI/Battle/', filename, hue, true);
};

(function($) {
    // ------------------------------------------------------------------------
    // Helper: Safe Canvas Context Outline Drawing
    // ------------------------------------------------------------------------
    function drawBorderRect(bitmap, x, y, w, h, color, lineWidth) {
        if (!bitmap || !bitmap.context) return;
        var ctx = bitmap.context;
        ctx.save();
        ctx.strokeStyle = color || '#ffffff';
        ctx.lineWidth = lineWidth || 1;
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
        bitmap._setDirty();
    }

    // ------------------------------------------------------------------------
    // Helper: Debounced Safe Redraw (Eliminates Async Load Infinite Loops)
    // ------------------------------------------------------------------------
    var _battleSlotRedrawTimer = null;
    function safeDebouncedSlotRedraw(targetWindow) {
        if (!targetWindow || !targetWindow.contents) return;
        if (!_battleSlotRedrawTimer) {
            _battleSlotRedrawTimer = setTimeout(function() {
                _battleSlotRedrawTimer = null;
                if (targetWindow && targetWindow.contents && targetWindow.refresh) {
                    targetWindow.refresh();
                }
            }, 40);
        }
    }

    var parameters = PluginManager.parameters('Pethogs_EngineCore');
    var bgSlotsImg = String(parameters['bg_slots'] || '');
    var uiSlotsX = Number(parameters['slots_x'] || 200);
    var uiSlotsY = Number(parameters['slots_y'] || 530);
    var uiSlotsW = Number(parameters['slots_w'] || 970);
    var uiSlotsH = Number(parameters['slots_h'] || 170);

    // ============================================================================
    // Game_Actor - Simpan Data Equip Skill
    // ============================================================================
    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        this.initPethogsEquippedSkills();
    };

    Game_Actor.prototype.initPethogsEquippedSkills = function() {
        if (!this._pethogsSkillSlots) {
            // [Slot 1, Slot 2, Slot 3, Slot 4, Slot 5] -> isi dengan ID Skill (0 = kosong)
            this._pethogsSkillSlots = [0, 0, 0, 0, 0];
        }
        if (this._actorId === 1 && !this._pethogsDefaultSkillsEquipped) {
            this._pethogsDefaultSkillsEquipped = true;
            if (this._pethogsSkillSlots[0] === 0 && this._pethogsSkillSlots[1] === 0) {
                this._pethogsSkillSlots[0] = 10; // Spark
                this._pethogsSkillSlots[1] = 8;  // Heal
            }
        }
    };

    Game_Actor.prototype.pethogsEquippedSkills = function() {
        if (!this._pethogsSkillSlots) this.initPethogsEquippedSkills();
        if (this._actorId === 1 && !this._pethogsDefaultSkillsEquipped) {
            this._pethogsDefaultSkillsEquipped = true;
            if (this._pethogsSkillSlots[0] === 0 && this._pethogsSkillSlots[1] === 0) {
                this._pethogsSkillSlots[0] = 10; // Spark
                this._pethogsSkillSlots[1] = 8;  // Heal
            }
        }
        return this._pethogsSkillSlots;
    };

    Game_Actor.prototype.equipPethogsSkill = function(slotIndex, skillId) {
        if (!this._pethogsSkillSlots) this.initPethogsEquippedSkills();
        // Cek jika skill ini sudah di equip di tempat lain, lepas dari sana
        var existingIndex = this._pethogsSkillSlots.indexOf(skillId);
        if (existingIndex >= 0) {
            this._pethogsSkillSlots[existingIndex] = 0;
        }
        this._pethogsSkillSlots[slotIndex] = skillId;
    };

    Game_Actor.prototype.unequipPethogsSkill = function(skillId) {
        if (!this._pethogsSkillSlots) this.initPethogsEquippedSkills();
        var existingIndex = this._pethogsSkillSlots.indexOf(skillId);
        if (existingIndex >= 0) {
            this._pethogsSkillSlots[existingIndex] = 0;
        }
    };


    // ============================================================================
    // 1. Pethogs_ActorCard (Kiri Layar) - Menggunakan Window Terpisah
    // ============================================================================

    // Menangkap saat actor menerima damage untuk efek getar & merah
    var _Game_Actor_performDamage = Game_Actor.prototype.performDamage;
    Game_Actor.prototype.performDamage = function() {
        _Game_Actor_performDamage.call(this);
        this._pethogsShakeFrames = 25; // 25 frame bergetar
        this._pethogsRedFrames = 25;
    };

        // --- Sprite untuk Panah ---
    function Sprite_PethogsTurnArrow() {
        this.initialize.apply(this, arguments);
    }
    Sprite_PethogsTurnArrow.prototype = Object.create(Sprite.prototype);
    Sprite_PethogsTurnArrow.prototype.constructor = Sprite_PethogsTurnArrow;
    Sprite_PethogsTurnArrow.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(40, 40);
        this.bitmap.textColor = '#ffff00'; // Kuning
        this.bitmap.fontSize = 32;
        this.bitmap.drawText('◄', 0, 0, 40, 40, 'center');
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.opacity = 0;
    };
    Sprite_PethogsTurnArrow.prototype.update = function() {
        Sprite.prototype.update.call(this);
        var actor = BattleManager.actor();
        if (actor && BattleManager.isInputting()) {
            this.opacity = 255;
            // Animasi maju-mundur (sine wave)
            var offset = Math.sin(Graphics.frameCount * 0.15) * 8;
            this.x = 280 + offset; 
            
            var index = $gameParty.battleMembers().indexOf(actor);
            this.y = 75 + (index * 155); 
        } else {
            this.opacity = 0;
        }
    };


    // --- Window untuk Kartu Karakter Custom (nia_cardB, saki_cardB, sophia_cardB) ---
    function Window_PethogsActorCard() {
        this.initialize.apply(this, arguments);
    }
    Window_PethogsActorCard.prototype = Object.create(Window_Base.prototype);
    Window_PethogsActorCard.prototype.constructor = Window_PethogsActorCard;

    Window_PethogsActorCard.prototype.cardImageName = function() {
        if (!this._actor) return 'nia_cardB';
        var id = this._actor.actorId();
        if (id === 1) return 'nia_cardB';
        if (id === 2) return 'sophia_cardB';
        if (id === 3) return 'saki_cardB';
        var name = (this._actor.name() || '').toLowerCase();
        if (name.includes('nia')) return 'nia_cardB';
        if (name.includes('sophia')) return 'sophia_cardB';
        if (name.includes('saki')) return 'saki_cardB';
        return 'nia_cardB';
    };

    Window_PethogsActorCard.prototype.initialize = function(actor, index) {
        this._actor = actor;
        var cardH = 150;
        var cardSpacing = 155;
        var y = 75 + (index * cardSpacing);
        Window_Base.prototype.initialize.call(this, 130, y, 250, cardH);
        this.opacity = 0; // Hilangkan frame & background window bawaan
        
        // Dynamic Gauge Interpolation values
        this._curHpRate = actor ? actor.hpRate() : 1.0;
        this._ghostHpRate = this._curHpRate;
        this._curMpRate = actor ? actor.mpRate() : 1.0;
        this._curTpRate = actor ? actor.tpRate() : 0.0;
        this._ghostDelay = 0;

        // Overlay merah (hanya seukuran kartu asli 250x150)
        this._redTint = new Sprite(new Bitmap(250, cardH));
        this._redTint.bitmap.fillRect(0, 0, 250, cardH, 'rgba(255, 0, 0, 0.4)');
        this._redTint.opacity = 0;
        this.addChild(this._redTint);

        // Overlay Pendaran Ungu Trauma (Sanity 0 Manifestation)
        this.initPurpleTraumaTint(cardH);

        // Pivot point di tengah untuk scale animasi
        this.pivot.x = 125;
        this.pivot.y = 75;
        this._baseX = 130;
        
        // Preload kartu & attach load listener
        this._cardBmp = ImageManager.loadBattleUI(this.cardImageName());
        if (!this._cardBmp.isReady()) {
            this._cardBmp.addLoadListener(this.refresh.bind(this));
        }

        this.refresh();
    };

    Window_PethogsActorCard.prototype.standardPadding = function() { return 0; };

    Window_PethogsActorCard.prototype.drawDynamicGauges = function() {
        if (!this._actor) return;

        // 1. HEALTH (HP) - Slot: X=116..236 (W=120, H=8)
        var hx = 116, hy = 63, hw = 120, hh = 8;
        var ghostW = Math.max(0, Math.floor(hw * this._ghostHpRate));
        if (ghostW > 0) {
            this.contents.fillRect(hx, hy, ghostW, hh, '#fbbf24');
        }
        var curHpW = Math.max(0, Math.floor(hw * this._curHpRate));
        if (curHpW > 0) {
            this.contents.gradientFillRect(hx, hy, curHpW, hh, '#ef4444', '#b91c1c');
        }

        // 2. MANA (MP) - Slot: X=114..236 (W=122, H=8)
        var mx = 114, my = 79, mw = 122, mh = 8;
        var curMpW = Math.max(0, Math.floor(mw * this._curMpRate));
        if (curMpW > 0) {
            this.contents.gradientFillRect(mx, my, curMpW, mh, '#3b82f6', '#1d4ed8');
        }

        // 3. RAGE / TP - Slot: X=131..236 (W=105, H=8)
        var tx = 131, ty = 97, tw = 105, th = 8;
        var curTpW = Math.max(0, Math.floor(tw * this._curTpRate));
        if (curTpW > 0) {
            this.contents.gradientFillRect(tx, ty, curTpW, th, '#f97316', '#ea580c');
        }
    };

    Window_PethogsActorCard.prototype.drawGaugeValues = function() {
        if (!this._actor) return;
        
        this.contents.fontSize = 11;
        this.contents.fontBold = true;
        this.contents.outlineWidth = 2.5;
        this.contents.outlineColor = 'rgba(0, 0, 0, 0.9)';

        // HP Value (Current / Max)
        this.changeTextColor('#ffffff');
        this.drawText(this._actor.hp + '/' + this._actor.mhp, 116, 59, 118, 'right');

        // MP Value (Current / Max)
        this.changeTextColor('#e0f2fe');
        this.drawText(this._actor.mp + '/' + this._actor.mmp, 114, 75, 120, 'right');

        // TP / Rage Value
        this.changeTextColor('#ffedd5');
        this.drawText(String(this._actor.tp), 131, 93, 103, 'right');
        
        this.resetFontSettings();
    };

    Window_PethogsActorCard.prototype.refresh = function() {
        this.contents.clear();
        if (!this._actor) return;
        
        var isTurn = (BattleManager.actor() === this._actor && BattleManager.isInputting());

        // A. Background gelap di dalam lubang cutout slot bar
        this.contents.fillRect(116, 63, 120, 8, 'rgba(25, 20, 30, 0.9)');
        this.contents.fillRect(114, 79, 122, 8, 'rgba(20, 25, 35, 0.9)');
        this.contents.fillRect(131, 97, 105, 8, 'rgba(30, 20, 20, 0.9)');

        // B. Gambar bar warna-warni yang mengisi lubang cutout
        this.drawDynamicGauges();

        // C. Gambar Kartu Karakter Kustom (nia_cardB, saki_cardB, sophia_cardB)
        var cardBmp = ImageManager.loadBattleUI(this.cardImageName());
        if (cardBmp && cardBmp.isReady()) {
            this.contents.blt(cardBmp, 0, 0, 250, 150, 0, 0, 250, 150);
        } else if (cardBmp) {
            cardBmp.addLoadListener(this.refresh.bind(this));
        }

        // D. Teks angka stat HP / MP / TP di atas bar
        this.drawGaugeValues();

        // E. Highlight Giliran Aktif (Glowing Border)
        if (isTurn) {
            var ctx = this.contents._context;
            ctx.save();
            ctx.strokeStyle = 'rgba(253, 224, 71, 0.95)';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, 248, 148);
            ctx.restore();
        }

        // F. Combo Points (CP) di Tab Merah Bawah (X: 18, Y: 135)
        if (typeof this._actor.getCP === 'function') {
            var cp = this._actor.getCP();
            var cpX = 18;
            var cpY = 135;
            var ctxC = this.contents._context;
            var maxDraw = Math.max(3, cp);
            for (var i = 0; i < maxDraw; i++) {
                var color;
                if (i < cp) {
                    color = i < 3 ? '#38bdf8' : '#4ade80';
                } else {
                    color = 'rgba(0, 0, 0, 0.45)';
                }
                var cx = cpX + (i * 15);
                var cy = cpY;
                
                ctxC.fillStyle = color;
                ctxC.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                ctxC.lineWidth = 1;
                ctxC.beginPath();
                ctxC.moveTo(cx, cy - 5);
                ctxC.lineTo(cx + 5, cy);
                ctxC.lineTo(cx, cy + 5);
                ctxC.lineTo(cx - 5, cy);
                ctxC.closePath();
                ctxC.fill();
                ctxC.stroke();

                if (i < cp) {
                    ctxC.fillStyle = '#ffffff';
                    ctxC.fillRect(cx - 1, cy - 2, 2, 2);
                }
            }
        }

        // G. Buff / Debuff Badges di Tab Merah Bawah (X: 85, Y: 126)
        var states = this._actor.states();
        var iconList = [];
        for (var s = 0; s < states.length; s++) {
            if (states[s] && states[s].iconIndex > 0) {
                iconList.push({ icon: states[s].iconIndex, stateId: states[s].id });
            }
        }
        for (var b = 0; b < this._actor._buffs.length; b++) {
            var bLevel = this._actor._buffs[b];
            if (bLevel !== 0) {
                iconList.push({ icon: this._actor.buffIconIndex(bLevel, b), stateId: 0 });
            }
        }
        
        var maxVisibleIcons = 3;
        var iconCount = Math.min(iconList.length, maxVisibleIcons);
        var badgeSize = 18;
        var startBadgeX = 85;
        var badgeY = 126;
        var ctxB = this.contents._context;
        
        for (var k = 0; k < iconCount; k++) {
            var bx = startBadgeX + (k * (badgeSize + 4));
            var by = badgeY;
            var entry = iconList[k];

            ctxB.save();
            ctxB.fillStyle = 'rgba(15, 18, 28, 0.85)';
            ctxB.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctxB.lineWidth = 1;
            ctxB.fillRect(bx, by, badgeSize, badgeSize);
            ctxB.strokeRect(bx, by, badgeSize, badgeSize);
            ctxB.restore();

            var iconSet = ImageManager.loadSystem('IconSet');
            if (iconSet.isReady()) {
                var pw = Window_Base._iconWidth;
                var ph = Window_Base._iconHeight;
                var sx = (entry.icon % 16) * pw;
                var sy = Math.floor(entry.icon / 16) * ph;
                this.contents.blt(iconSet, sx, sy, pw, ph, bx + 1, by + 1, badgeSize - 2, badgeSize - 2);
            }

            if (entry.stateId === 12 && this._actor.actorId() === 3) {
                var sakiNyawa = this._actor._sakiNyawa !== undefined ? this._actor._sakiNyawa : 3;
                var sakiEnd = this._actor._sakiEnduranceUsed ? 0 : 1;
                var countVal = String(sakiNyawa + sakiEnd);
                this.contents.fontSize = 10;
                this.contents.fontBold = true;
                this.contents.outlineWidth = 2;
                this.changeTextColor('#ffff00');
                this.drawText(countVal, bx, by + 6, badgeSize - 1, 'right');
                this.resetFontSettings();
            }
        }

        // H. K.O. Status Overlay
        if (this._actor.isDead()) {
            this.contents.fillRect(0, 0, 250, 150, 'rgba(0, 0, 0, 0.6)');
            this.contents.fontSize = 20;
            this.contents.fontBold = true;
            this.changeTextColor('#ef4444');
            this.drawText('K.O.', 0, 50, 250, 'center');
            this.resetFontSettings();
        }

        this.contents._setDirty();
    };

    Window_PethogsActorCard.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (!this._actor) return;
        
        var targetHp = this._actor.hpRate();
        var targetMp = this._actor.mpRate();
        var targetTp = this._actor.tpRate();
        var needsRedraw = false;

        // Smooth Lerp for HP Gauge
        if (Math.abs(this._curHpRate - targetHp) > 0.002) {
            if (targetHp < this._curHpRate) {
                this._curHpRate += (targetHp - this._curHpRate) * 0.2;
                this._ghostDelay = 20;
            } else {
                this._curHpRate += (targetHp - this._curHpRate) * 0.15;
                this._ghostHpRate = this._curHpRate;
            }
            needsRedraw = true;
        } else {
            this._curHpRate = targetHp;
        }

        // Ghost HP Bar catch-up
        if (this._ghostDelay > 0) {
            this._ghostDelay--;
        } else if (this._ghostHpRate > this._curHpRate) {
            this._ghostHpRate += (this._curHpRate - this._ghostHpRate) * 0.06;
            if (this._ghostHpRate - this._curHpRate < 0.002) this._ghostHpRate = this._curHpRate;
            needsRedraw = true;
        }

        // Smooth Lerp for MP
        if (Math.abs(this._curMpRate - targetMp) > 0.002) {
            this._curMpRate += (targetMp - this._curMpRate) * 0.2;
            needsRedraw = true;
        } else {
            this._curMpRate = targetMp;
        }

        // Smooth Lerp for TP
        if (Math.abs(this._curTpRate - targetTp) > 0.002) {
            this._curTpRate += (targetTp - this._curTpRate) * 0.2;
            needsRedraw = true;
        } else {
            this._curTpRate = targetTp;
        }

        if (this._lastHp !== this._actor.hp || this._lastMp !== this._actor.mp || this._lastTp !== this._actor.tp) {
            this._lastHp = this._actor.hp;
            this._lastMp = this._actor.mp;
            this._lastTp = this._actor.tp;
            needsRedraw = true;
        }

        if (needsRedraw) {
            this.refresh();
        }

        // Smooth Active Turn Slide & Scaling
        var isTurn = (BattleManager.actor() === this._actor && BattleManager.isInputting());
        var targetX = isTurn ? (this._baseX + 12) : this._baseX;
        var targetScale = isTurn ? 1.04 : 1.0;

        this.scale.x += (targetScale - this.scale.x) * 0.2;
        this.scale.y += (targetScale - this.scale.y) * 0.2;

        // Efek Getar Saat Damage vs Low HP Pulse
        if (this._actor._pethogsShakeFrames && this._actor._pethogsShakeFrames > 0) {
            this._actor._pethogsShakeFrames--;
            this.x = targetX + (Math.random() * 8 - 4);
            this._redTint.opacity = 255;
        } else {
            this.x += (targetX - this.x) * 0.2;
            if (this._actor.hpRate() < 0.25 && !this._actor.isDead()) {
                // Heartbeat pulse warning on low HP
                var pulse = Math.max(0, Math.floor(45 + 35 * Math.sin(Date.now() * 0.007)));
                this._redTint.opacity = pulse;
            } else {
                this._redTint.opacity = 0;
            }
        }

        // Animasi Pendaran Ungu Trauma (Sanity 0 Manifestation)
        if (this._purpleTraumaTint) {
            var isTrauma = this._actor && !this._actor.isDead() && (
                (typeof this._actor.sanity === 'function' ? this._actor.sanity() : this._actor._customSanity) <= 0 ||
                (typeof this._actor.isTraumaManifested === 'function' && this._actor.isTraumaManifested())
            );
            if (isTrauma) {
                var traumaPulse = Math.floor(155 + 75 * Math.sin(Date.now() * 0.0055));
                this._purpleTraumaTint.opacity = Math.max(0, Math.min(255, traumaPulse));
            } else {
                this._purpleTraumaTint.opacity = 0;
            }
        }
    };

    Window_PethogsActorCard.prototype.initPurpleTraumaTint = function(cardH) {
        this._purpleTraumaTint = new Sprite(new Bitmap(250, cardH));
        var bmp = this._purpleTraumaTint.bitmap;
        var ctx = bmp._context;

        ctx.save();
        // 1. Radial gradient di atas area potret karakter (sisi kiri kartu, x: 0..115)
        var grad = ctx.createRadialGradient(58, cardH / 2, 8, 58, cardH / 2, 85);
        grad.addColorStop(0, 'rgba(216, 180, 254, 0.20)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.45)');
        grad.addColorStop(1, 'rgba(88, 28, 135, 0.70)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 116, cardH);

        // 2. Garis batas neon ungu bernuansa gaib / trauma
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.9)';
        ctx.shadowBlur = 8;
        ctx.strokeRect(1, 1, 248, cardH - 2);

        // 3. Kabut ungu tipis di sisi kanan stat
        ctx.fillStyle = 'rgba(107, 33, 168, 0.18)';
        ctx.fillRect(116, 0, 134, cardH);
        ctx.restore();

        bmp._setDirty();
        this._purpleTraumaTint.opacity = 0;
        this.addChild(this._purpleTraumaTint);
    };


    // --- Container Window (Status Left) ---
    // Dipertahankan sebagai cangkang (manager) agar kompatibel dengan sistem MV
    function Window_PethogsStatusLeft() {
        this.initialize.apply(this, arguments);
    }
    Window_PethogsStatusLeft.prototype = Object.create(Window_Base.prototype);
    Window_PethogsStatusLeft.prototype.constructor = Window_PethogsStatusLeft;

    Window_PethogsStatusLeft.prototype.initialize = function() {
        // PERBAIKAN: Gunakan ukuran fullscreen agar WindowLayer tidak memotong animasi/kartu yang membesar
        Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, Graphics.boxHeight);
        this.opacity = 0; 
        
        this._cards = [];
        var members = $gameParty.battleMembers();
        for (var i = 0; i < members.length; i++) {
            var card = new Window_PethogsActorCard(members[i], i);
            this._cards.push(card);
            this.addChild(card);
        }
        
        this._turnArrow = new Sprite_PethogsTurnArrow();
        this.addChild(this._turnArrow);
    };

    Window_PethogsStatusLeft.prototype.refresh = function() {
        for (var i = 0; i < this._cards.length; i++) {
            this._cards[i].refresh();
        }
    };

    Window_PethogsStatusLeft.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if ($gameParty.isAllDead() || $gameTroop.isAllDead() || BattleManager._phase === 'battleEnd') {
            this.hide();
        } else {
            this.show();
        }
    };


    // ============================================================================
    // 2. Pethogs_Window_ActorCommand (Kiri Bawah - Pas di Frame Window.png)
    // ============================================================================
    var _Window_ActorCommand_initialize = Window_ActorCommand.prototype.initialize;
    Window_ActorCommand.prototype.initialize = function() {
        _Window_ActorCommand_initialize.call(this);
        // Posisi pas di dalam kotak kiri Window.png (X: 20..209, Y: 527..692)
        this.x = 20;
        this.y = 527;
        this.width = 190;
        this.height = 165;
        this.opacity = 0; // Transparan agar frame Window.png terlihat indah
        this.openness = 255;
        this.contentsOpacity = 255;
        this.createContents();
        this.refresh();
    };

    Window_ActorCommand.prototype.standardPadding = function() { return 6; };
    Window_ActorCommand.prototype.windowWidth = function() { return 190; };
    Window_ActorCommand.prototype.windowHeight = function() { return 165; };
    Window_ActorCommand.prototype.numVisibleRows = function() { return 4; };
    Window_ActorCommand.prototype.maxCols = function() { return 1; };

    Window_ActorCommand.prototype.itemRect = function(index) {
        var count = Math.max(this.maxItems(), 4);
        var totalHeight = this.contentsHeight();
        var h = Math.floor(totalHeight / count);
        var spacing = 2;
        var rect = new Rectangle();
        rect.x = 0;
        rect.y = index * h + spacing;
        rect.width = this.contentsWidth();
        rect.height = h - (spacing * 2);
        return rect;
    };

    Window_ActorCommand.prototype.itemRectForText = function(index) {
        return this.itemRect(index);
    };

    Window_ActorCommand.prototype.open = function() {
        this.openness = 255;
        this._opening = false;
    };

    Window_ActorCommand.prototype.close = function() {
        // Biarkan tetap terbuka (openness 255) agar teks opsi command tetap terlihat di background UI
        this._closing = false;
    };

    Window_ActorCommand.prototype.makeCommandList = function() {
        var actor = this._actor || BattleManager.actor();
        if (actor) {
            this.addCommand("Command", 'pethogs_slot');
            this.addCommand(TextManager.guard || "Guard", 'guard', actor.canGuard ? actor.canGuard() : true);
            this.addCommand(TextManager.item || "Item", 'item');
            this.addCommand(TextManager.escape || "Escape", 'escape', BattleManager.canEscape ? BattleManager.canEscape() : true);
        }
    };

    Window_ActorCommand.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0); // Hilangkan cursor windowskin biru bawaan MV
    };

    var _Window_ActorCommand_select = Window_ActorCommand.prototype.select;
    Window_ActorCommand.prototype.select = function(index) {
        _Window_ActorCommand_select.call(this, index);
        this.refresh();
    };

    var _Window_ActorCommand_setup = Window_ActorCommand.prototype.setup;
    Window_ActorCommand.prototype.setup = function(actor) {
        _Window_ActorCommand_setup.call(this, actor);
        this.openness = 255;
        this.show();
        this.refresh();
    };

    Window_ActorCommand.prototype.refresh = function() {
        this.clearCommandList();
        this.makeCommandList();
        if (this.contents) {
            this.contents.clear();
            for (var i = 0; i < this.maxItems(); i++) {
                this.drawItem(i);
            }
        }
    };

    Window_ActorCommand.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var isSelected = (this.index() === index && this.active);
        var isSkillSlotActive = (SceneManager._scene && SceneManager._scene._pethogsSkillSlots && SceneManager._scene._pethogsSkillSlots.active);
        var isCommandSelected = (index === 0 && isSkillSlotActive); // Command is highlighted while picking skill slots

        // Dynamic horizontal nudge if selected
        var slideX = (isSelected || isCommandSelected) ? 4 : 0;

        // Button background & borders
        if (isSelected) {
            var pulse = 0.75 + 0.25 * Math.sin(Date.now() * 0.008);
            this.contents.fillRect(rect.x + slideX, rect.y, rect.width - slideX, rect.height, 'rgba(140, 20, 70, 0.85)');
            drawBorderRect(this.contents, rect.x + slideX, rect.y, rect.width - slideX, rect.height, 'rgba(255, 102, 196, ' + pulse + ')', 2);
            drawBorderRect(this.contents, rect.x + 2 + slideX, rect.y + 2, rect.width - 4 - slideX, rect.height - 4, '#38bdf8', 1);
            this.changeTextColor('#ffffff');
        } else if (isCommandSelected) {
            this.contents.fillRect(rect.x + slideX, rect.y, rect.width - slideX, rect.height, 'rgba(100, 20, 60, 0.6)');
            drawBorderRect(this.contents, rect.x + slideX, rect.y, rect.width - slideX, rect.height, '#ff66c4', 1.5);
            this.changeTextColor('#ffffff');
        } else {
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, 'rgba(25, 10, 35, 0.55)');
            drawBorderRect(this.contents, rect.x, rect.y, rect.width, rect.height, 'rgba(255, 255, 255, 0.15)', 1);
            this.changeTextColor('rgba(255, 255, 255, 0.85)');
        }
        
        var name = this.commandName(index) || '';
        this.contents.fontSize = 16;
        var textY = rect.y + Math.floor((rect.height - this.contents.fontSize) / 2) - 2;
        this.contents.drawText(name, rect.x + slideX, textY, rect.width - slideX, this.contents.fontSize + 4, 'center');
        this.resetTextColor();
    };

    Window_ActorCommand.prototype.update = function() {
        Window_Command.prototype.update.call(this);
        if (this._actor !== BattleManager.actor()) {
            this._actor = BattleManager.actor();
            if (this._actor) {
                this.setup(this._actor);
            }
        }
    };

    Window_ActorCommand.prototype.processCancel = function() {
        // Kunci agar tidak bisa di-cancel/close keluar scene, tetap aktif di opsi umum
        this.activate();
    };


    // ============================================================================
    // 3. Pethogs_Window_SkillSlots (Tengah Bawah - Pas di Frame Slot.png)
    // ============================================================================
    function Window_PethogsSkillSlots() {
        this.initialize.apply(this, arguments);
    }
    Window_PethogsSkillSlots.prototype = Object.create(Window_Selectable.prototype);
    Window_PethogsSkillSlots.prototype.constructor = Window_PethogsSkillSlots;

    Window_PethogsSkillSlots.prototype.initialize = function() {
        // Koordinat tepat di kotak kanan Slot.png (X: 224, Y: 527, W: 1032, H: 166)
        Window_Selectable.prototype.initialize.call(this, 224, 527, 1032, 166);
        this.opacity = 0; // Transparan agar artwork Slot.png di layer belakang terlihat
        
        // Exact pixel boxes of the 6 slots relative to this window (X=224, Y=527)
        this._slotRects = [
            { x: 43,  y: 15, w: 147, h: 141 }, // Slot 0: Basic Attack (Absolute X=267, Y=542)
            { x: 206, y: 17, w: 145, h: 139 }, // Slot 1: Equip 1     (Absolute X=430, Y=544)
            { x: 370, y: 17, w: 145, h: 139 }, // Slot 2: Equip 2     (Absolute X=594, Y=544)
            { x: 535, y: 17, w: 145, h: 139 }, // Slot 3: Equip 3     (Absolute X=759, Y=544)
            { x: 699, y: 17, w: 145, h: 139 }, // Slot 4: Equip 4     (Absolute X=923, Y=544)
            { x: 863, y: 17, w: 145, h: 139 }  // Slot 5: Equip 5     (Absolute X=1087, Y=544)
        ];

        this.refresh();
        this.deselect(); 
        this.deactivate(); 
    };

    Window_PethogsSkillSlots.prototype.standardPadding = function() { return 0; };
    Window_PethogsSkillSlots.prototype.maxCols = function() { return 6; };
    Window_PethogsSkillSlots.prototype.maxItems = function() { return 6; };

    Window_PethogsSkillSlots.prototype.itemRect = function(index) {
        if (this._slotRects && this._slotRects[index]) {
            var r = this._slotRects[index];
            return { x: r.x, y: r.y, width: r.w, height: r.h };
        }
        return { x: 0, y: 0, width: 0, height: 0 };
    };

    Window_PethogsSkillSlots.prototype.drawItem = function(index) {
        var rect = this.itemRect(index);
        var isSelected = (this.index() === index && this.active);
        
        var skill = null;
        var actor = BattleManager.actor();
        if (index === 0) {
            var attackId = actor ? actor.attackSkillId() : 1;
            skill = $dataSkills[attackId];
        } else {
            if (actor) {
                var equippedSkillId = actor.pethogsEquippedSkills()[index - 1]; 
                if (equippedSkillId > 0) {
                    skill = $dataSkills[equippedSkillId];
                }
            }
        }

        var floatY = isSelected ? -4 : 0;

        if (skill) {
            var canUse = actor ? actor.canUse(skill) : true;
            this.changePaintOpacity(canUse);

            // Draw Skill Icon (160x160) perfectly fitted & centered inside the slot frame
            var iconSize = 160;
            var ix = rect.x + Math.floor((rect.width - iconSize) / 2);
            var iy = rect.y + Math.floor((rect.height - iconSize) / 2) + floatY;

            ImageManager.drawSkillIcon(this.contents, skill, ix, iy, iconSize, iconSize, function() {
                safeDebouncedSlotRedraw(this);
            }.bind(this));

            // Skill Cost Label at bottom (tanpa badge / direct text with crisp shadow outline)
            var costStr = "";
            if (skill.mpCost > 0) costStr = skill.mpCost + " MP";
            else if (skill.tpCost > 0) costStr = skill.tpCost + " TP";
            else if (index === 0) costStr = "Attack";

            if (costStr) {
                this.contents.fontSize = 13;
                var costColor = '#ffffff';
                if (skill.mpCost > 0) costColor = '#38bdf8'; // bright cyan
                else if (skill.tpCost > 0) costColor = '#facc15'; // bright gold/yellow for TP
                else if (index === 0) costColor = '#ffffff'; // clean white for Attack

                this.contents.outlineColor = 'rgba(0, 0, 0, 0.95)';
                this.contents.outlineWidth = 4;
                this.changeTextColor(costColor);
                this.drawText(costStr, rect.x, rect.y + rect.height - 18 + floatY, rect.width, 'center');
                this.resetTextColor();
            }

            this.changePaintOpacity(true);
        } else {
            this.changePaintOpacity(false);
            this.contents.fontSize = 13;
            this.contents.outlineColor = 'rgba(0, 0, 0, 0.85)';
            this.contents.outlineWidth = 3;
            this.changeTextColor('#94a3b8');
            this.drawText("+ Slot " + index, rect.x, rect.y + Math.floor(rect.height / 2) - 10 + floatY, rect.width, 'center');
            this.resetTextColor();
            this.changePaintOpacity(true);
        }

        // Glowing animated outline & subtle highlight frame if selected (drawn on top of the slot)
        if (isSelected) {
            var pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.008);
            this.contents.fillRect(rect.x + 2, rect.y + 2 + floatY, rect.width - 4, rect.height - 4, 'rgba(255, 102, 196, 0.12)');
            drawBorderRect(this.contents, rect.x + 1, rect.y + 1 + floatY, rect.width - 2, rect.height - 2, 'rgba(255, 102, 196, ' + pulse + ')', 3);
            drawBorderRect(this.contents, rect.x + 3, rect.y + 3 + floatY, rect.width - 6, rect.height - 6, '#38bdf8', 2);
        }
    };

    Window_PethogsSkillSlots.prototype.item = function() {
        var index = this.index();
        if (index < 0) return null;
        if (index === 0) {
            return BattleManager.actor() ? $dataSkills[BattleManager.actor().attackSkillId()] : null;
        } else {
            var actor = BattleManager.actor();
            if (actor) {
                var skillId = actor.pethogsEquippedSkills()[index - 1];
                if (skillId > 0) return $dataSkills[skillId];
            }
        }
        return null;
    };

    Window_PethogsSkillSlots.prototype.updateHelp = function() {
        this.setHelpWindowItem(this.item());
        if (this._popupWindow) {
            var item = this.item();
            if (item) {
                this._popupWindow.setItem(item);
                var rect = this.itemRect(this.index());
                this._popupWindow.x = this.x + rect.x + Math.floor(rect.width / 2) - Math.floor(this._popupWindow.width / 2);
                this._popupWindow.x = Math.max(10, Math.min(Graphics.boxWidth - this._popupWindow.width - 10, this._popupWindow.x));
                this._popupWindow._baseY = this.y + rect.y - this._popupWindow.height - 10;
                this._popupWindow.y = this._popupWindow._baseY;
                this._popupWindow.show();
            } else {
                this._popupWindow.hide();
            }
        }
    };

    Window_PethogsSkillSlots.prototype.setPopupWindow = function(popupWindow) {
        this._popupWindow = popupWindow;
    };

    Window_PethogsSkillSlots.prototype.select = function(index) {
        var prev = this.index();
        Window_Selectable.prototype.select.call(this, index);
        if (prev !== this.index()) {
            this.refresh();
        }
    };

    function isYureBattleInspectOpen(scene) {
        if (!scene) return false;
        if (scene._yureBattleInspectModal && (scene._yureBattleInspectModal.visible || (scene._yureBattleInspectModal.isOpenModal && scene._yureBattleInspectModal.isOpenModal()))) return true;
        if (scene._yureInspectModal && (scene._yureInspectModal.visible || (scene._yureInspectModal.isOpenModal && scene._yureInspectModal.isOpenModal()))) return true;
        return false;
    }

    Window_PethogsSkillSlots.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        // Otomatis refresh jika belum tergambar sempurna atau saat aktor berganti
        if (this._actor !== BattleManager.actor()) {
            this._actor = BattleManager.actor();
            this.refresh();
        }
        if (!this.active && this._popupWindow && this._popupWindow.visible) {
            this._popupWindow.hide();
        }
        
        // Hide if battle is ending or ended, or if item window / inspection modal is currently displayed
        var scene = SceneManager._scene;
        var isInspectActive = isYureBattleInspectOpen(scene);
        var isItemActive = (scene && scene._itemWindow && scene._itemWindow.visible);
        var isEnding = ($gameParty.isAllDead() || $gameTroop.isAllDead() || BattleManager._phase === 'battleEnd');

        if (isEnding || isInspectActive || isItemActive) {
            this.hide();
            if (this._popupWindow) this._popupWindow.hide();
        } else if (this.active || (!isItemActive && BattleManager.isInputting() && BattleManager.actor())) {
            this.show();
        }
    };

    // ============================================================================
    // 3.5. Pethogs_Window_SkillPopup (Tooltip Nama & Detail Skill - Anime.js)
    // ============================================================================
    function Window_PethogsSkillPopup() {
        this.initialize.apply(this, arguments);
    }
    Window_PethogsSkillPopup.prototype = Object.create(Window_Base.prototype);
    Window_PethogsSkillPopup.prototype.constructor = Window_PethogsSkillPopup;
    
    Window_PethogsSkillPopup.prototype.initialize = function() {
        Window_Base.prototype.initialize.call(this, 0, 0, 290, 74);
        this.opacity = 0; // Transparan dengan background glass card kustom
        this._baseY = 0;
        this._item = null;
        this.pivot.x = 145;
        this.pivot.y = 37;
        this.scale.x = 1.0;
        this.scale.y = 1.0;
        this.hide();
    };
    
    Window_PethogsSkillPopup.prototype.standardPadding = function() { return 6; };
    
    Window_PethogsSkillPopup.prototype.setItem = function(item) {
        if (this._item !== item) {
            this._item = item;
            this.refresh();
            this.popInAnime();
        }
    };

    Window_PethogsSkillPopup.prototype.setText = function(text) {
        this._text = text;
        this.refresh();
        this.popInAnime();
    };

    Window_PethogsSkillPopup.prototype.popInAnime = function() {
        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this);
            window.anime.remove(this.scale);
            this.scale.x = 0.84;
            this.scale.y = 0.84;
            this.alpha = 0;
            window.anime({
                targets: this.scale,
                x: 1.0,
                y: 1.0,
                duration: 480,
                easing: 'easeOutElastic(1, .8)'
            });
            window.anime({
                targets: this,
                alpha: 1.0,
                duration: 160,
                easing: 'easeOutQuad'
            });
        } else {
            this.scale.x = 1.0;
            this.scale.y = 1.0;
            this.alpha = 1.0;
        }
    };

    Window_PethogsSkillPopup.prototype.refresh = function() {
        this.contents.clear();
        var item = this._item;
        if (!item && !this._text) return;

        var name = item ? item.name : this._text;
        var desc = item && item.description ? item.description : "";
        var costText = "";
        if (item) {
            if (item.mpCost > 0) costText = item.mpCost + " MP";
            else if (item.tpCost > 0) costText = item.tpCost + " TP";
            else if (item.id === 1) costText = "Serangan";
        }

        var w = this.contentsWidth();
        var h = this.contentsHeight();
        var ctx = this.contents._context;

        // 1. Warm deep purple background
        ctx.save();
        ctx.beginPath();
        var r = 8;
        ctx.moveTo(r, 0); ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r);
        ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(32, 16, 44, 0.97)';
        ctx.fill();

        // Pink outer border
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Gold inner border
        ctx.beginPath();
        var ri = 5;
        ctx.moveTo(ri + 3, 3); ctx.lineTo(w - ri - 3, 3);
        ctx.quadraticCurveTo(w - 3, 3, w - 3, ri + 3);
        ctx.lineTo(w - 3, h - ri - 3);
        ctx.quadraticCurveTo(w - 3, h - 3, w - ri - 3, h - 3);
        ctx.lineTo(ri + 3, h - 3);
        ctx.quadraticCurveTo(3, h - 3, 3, h - ri - 3);
        ctx.lineTo(3, ri + 3);
        ctx.quadraticCurveTo(3, 3, ri + 3, 3);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 209, 102, 0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // 2. Skill Name (Left)
        this.contents.fontSize = 15;
        this.changeTextColor('#ffffff');
        this.drawText(name, 10, 2, w - 20, 'left');

        // 3. Cost Tag (Right)
        if (costText) {
            this.contents.fontSize = 12;
            var costCol = '#f472b6';
            if (item && item.tpCost > 0) costCol = '#ffd166';
            else if (item && item.id === 1) costCol = '#e2e8f0';
            this.changeTextColor(costCol);
            this.drawText(costText, 10, 2, w - 20, 'right');
        }

        // 4. Description snippet (Bottom)
        if (desc) {
            this.contents.fontSize = 11;
            this.changeTextColor('rgba(220, 180, 240, 0.85)');
            this.drawText(desc, 10, 26, w - 20, 'left');
        }
        this.resetTextColor();
    };

    Window_PethogsSkillPopup.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (this.visible && this._baseY) {
            // Smooth floating hover bobbing
            this.y = this._baseY + Math.sin(Date.now() * 0.006) * 3;
        }
    };

    // ============================================================================
    // 3.6. Enemy Sprite Scaling Feature
    // ============================================================================
    var _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);
        if (this._enemy) {
            var scaleVal = this._enemy.enemy().meta.scale || this._enemy.enemy().meta.Scale;
            if (scaleVal) {
                var s = Number(scaleVal) / 100;
                this.scale.x = s;
                this.scale.y = s;
            }
        }
    };


    // ============================================================================
    // 3.7. Parallax as Battleback Fallback (Gabungan)
    // ============================================================================
    var _Spriteset_Battle_battleback2Bitmap = Spriteset_Battle.prototype.battleback2Bitmap;
    Spriteset_Battle.prototype.battleback2Bitmap = function() {
        var name = this.battleback2Name();
        // Jika battleback2 (langit/dinding) kosong, gunakan parallax map sebagai gantinya
        if (!name && $gameMap && $gameMap.parallaxName()) {
            return ImageManager.loadParallax($gameMap.parallaxName());
        }
        return _Spriteset_Battle_battleback2Bitmap.call(this);
    };

    var _Spriteset_Battle_createBackground = Spriteset_Battle.prototype.createBackground;
    Spriteset_Battle.prototype.createBackground = function() {
        var name1 = this.battleback1Name();
        var name2 = this.battleback2Name();
        var hasParallax = ($gameMap && $gameMap.parallaxName());
        
        // Hilangkan background blur map jika kita menggunakan gambar apapun (battleback atau parallax)
        if (name1 || name2 || hasParallax) {
            this._backgroundSprite = new Sprite();
            this._backgroundSprite.bitmap = new Bitmap(1, 1);
            this._baseSprite.addChild(this._backgroundSprite);
        } else {
            _Spriteset_Battle_createBackground.call(this);
        }
    };

    // ============================================================================
    // 3.8. Boss HP Bar UI
    // ============================================================================
    function Window_BossHP() {
        this.initialize.apply(this, arguments);
    }
    
    Window_BossHP.prototype = Object.create(Window_Base.prototype);
    Window_BossHP.prototype.constructor = Window_BossHP;
    
    Window_BossHP.prototype.initialize = function() {
        var w = 500;
        var h = this.fittingHeight(2);
        var x = (Graphics.boxWidth - w) / 2; // 390 (Tengah)
        var y = Graphics.boxHeight - h - 160; // 488 (Tepat di atas kotak slot skill)
        Window_Base.prototype.initialize.call(this, x, y, w, h);
        this.opacity = 0; // Make background invisible for a cleaner look
        this._bossBattler = null;
        this._lastHp = -1;
        this._lastMaxHp = -1;
        this._curHpRate = 1.0;
        this._ghostHpRate = 1.0;
        this._ghostDelay = 0;
        this._shakeFrames = 0;
        this._baseX = x;
        this.visible = false;
    };
    
    Window_BossHP.prototype.setBoss = function(battler) {
        if (this._bossBattler !== battler) {
            this._bossBattler = battler;
            if (battler) {
                this._curHpRate = battler.hpRate();
                this._ghostHpRate = this._curHpRate;
            }
            this.refresh();
        }
    };
    
    Window_BossHP.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        
        if ($gameParty.isAllDead() || $gameTroop.isAllDead() || BattleManager._phase === 'battleEnd') {
            this.visible = false;
            return;
        }
        
        if (!this._bossBattler) return;
        
        if (this._bossBattler.isDead()) {
            this.visible = false;
            return;
        } else {
            this.visible = true;
        }

        // Damage Shake & Ghost Catch-up
        var targetRate = this._bossBattler.hpRate();
        var needsRedraw = false;

        if (targetRate < this._curHpRate) {
            this._curHpRate = targetRate;
            this._ghostDelay = 25;
            this._shakeFrames = 8;
            needsRedraw = true;
        } else if (targetRate > this._curHpRate) {
            this._curHpRate = targetRate;
            this._ghostHpRate = targetRate;
            needsRedraw = true;
        }

        if (this._shakeFrames > 0) {
            this._shakeFrames--;
            this.x = this._baseX + (Math.random() * 6 - 3);
        } else {
            this.x = this._baseX;
        }

        if (this._ghostDelay > 0) {
            this._ghostDelay--;
        } else if (this._ghostHpRate > this._curHpRate) {
            this._ghostHpRate += (this._curHpRate - this._ghostHpRate) * 0.05;
            if (this._ghostHpRate - this._curHpRate < 0.002) this._ghostHpRate = this._curHpRate;
            needsRedraw = true;
        }
        
        if (this._lastHp !== this._bossBattler.hp || this._lastMaxHp !== this._bossBattler.mhp || needsRedraw) {
            this.refresh();
        }
    };
    
    Window_BossHP.prototype.refresh = function() {
        this.contents.clear();
        if (!this._bossBattler) return;
        
        this._lastHp = this._bossBattler.hp;
        this._lastMaxHp = this._bossBattler.mhp;
        
        var w = this.contents.width;
        var ctx = this.contents._context;
        
        // Draw Boss Name
        this.changeTextColor(this.systemColor());
        this.contents.fontSize = 20;
        this.drawText(this._bossBattler.name(), 0, 0, w, 'center');
        
        var y = this.lineHeight();
        var gw = w;
        var gh = 14;
        var gx = 0;
        var gy = y - 8;

        // Track background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(gx, gy, gw, gh);

        // Ghost HP Bar (Yellow/Orange)
        var ghostW = Math.max(0, Math.floor(gw * this._ghostHpRate));
        if (ghostW > 0) {
            var gradGhost = ctx.createLinearGradient(gx, gy, gx + ghostW, gy);
            gradGhost.addColorStop(0, '#fbbf24');
            gradGhost.addColorStop(1, '#f97316');
            ctx.fillStyle = gradGhost;
            ctx.fillRect(gx, gy, ghostW, gh);
        }

        // Main Red HP Bar
        var curW = Math.max(0, Math.floor(gw * this._curHpRate));
        if (curW > 0) {
            var gradRed = ctx.createLinearGradient(gx, gy, gx + curW, gy);
            gradRed.addColorStop(0, '#ff4d4d');
            gradRed.addColorStop(1, '#990000');
            ctx.fillStyle = gradRed;
            ctx.fillRect(gx, gy, curW, gh);
        }
        
        // Draw HP Text
        this.changeTextColor(this.hpColor(this._bossBattler));
        this.contents.fontSize = 16;
        var hpText = this._bossBattler.hp + " / " + this._bossBattler.mhp;
        this.drawText(hpText, 0, gy - 2, w, 'center');

        // --- DRAW BOSS ACTIVE STATE & BUFF BADGES BESIDE HP METER (NOT ON FOREHEAD) ---
        var icons = this._bossBattler.allIcons();
        if (icons && icons.length > 0) {
            var iconSet = ImageManager.loadSystem('IconSet');
            var badgeSize = 22;
            var startX = w - (icons.length * (badgeSize + 4));
            if (startX < 340) startX = 340;
            var startY = 2;
            
            for (var k = 0; k < icons.length; k++) {
                if (k >= 4) break;
                var ix = startX + (k * (badgeSize + 4));
                var iy = startY;
                var iconIndex = icons[k];

                ctx.save();
                ctx.fillStyle = 'rgba(25, 12, 18, 0.85)';
                ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)';
                ctx.lineWidth = 1;
                ctx.fillRect(ix, iy, badgeSize, badgeSize);
                ctx.strokeRect(ix, iy, badgeSize, badgeSize);
                ctx.restore();

                if (iconSet && iconSet.isReady()) {
                    var pw = Window_Base._iconWidth;
                    var ph = Window_Base._iconHeight;
                    var sx = (iconIndex % 16) * pw;
                    var sy = Math.floor(iconIndex / 16) * ph;
                    this.contents.blt(iconSet, sx, sy, pw, ph, ix + 1, iy + 1, badgeSize - 2, badgeSize - 2);
                }
            }
        }
    };

    // ============================================================================
    // 4. Hook Scene_Battle (Menghubungkan Opsi ke Slot)
    // ============================================================================
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        
        // Tambahkan Battle UI Custom Background Sprites (Window.png & Slot.png)
        this._bgBattleWindow = new Sprite(ImageManager.loadBattleUI('Window'));
        this._bgBattleSlots = new Sprite(ImageManager.loadBattleUI('Slot'));

        // Tambahkan Pethogs Status Window
        this._pethogsStatusWindow = new Window_PethogsStatusLeft();
        
        // Tambahkan Boss HP Bar
        this._pethogsBossHP = new Window_BossHP();
        this.addChild(this._pethogsBossHP);

        // Pasang background dan status HUD di belakang layer window biasa
        var layerIndex = this.getChildIndex(this._windowLayer);
        this.addChildAt(this._bgBattleWindow, layerIndex);
        this.addChildAt(this._bgBattleSlots, layerIndex + 1);
        this.addChildAt(this._pethogsStatusWindow, layerIndex + 2);

        this._pethogsSkillSlots = new Window_PethogsSkillSlots();
        this._pethogsSkillSlots.setHandler('ok',     this.onPethogsSlotOk.bind(this));
        this._pethogsSkillSlots.setHandler('cancel', this.onPethogsSlotCancel.bind(this));
        this.addWindow(this._pethogsSkillSlots);

        this._pethogsSkillPopup = new Window_PethogsSkillPopup();
        this._pethogsSkillSlots.setPopupWindow(this._pethogsSkillPopup);
        this.addWindow(this._pethogsSkillPopup);

        if (this._statusWindow) {
            this._statusWindow.hide();
            this._statusWindow.x = -2000; 
        }

        // --- COMPLETELY HIDE BULKY HELP WINDOW IN BATTLE ---
        if (this._helpWindow) {
            this._helpWindow.visible = false;
            this._helpWindow.opacity = 0;
            this._helpWindow.contentsOpacity = 0;
            this._helpWindow.x = -2000;
            this._helpWindow.y = -2000;
        }

        if (this._itemWindow) {
            this._itemWindow.x = 224;
            this._itemWindow.y = 527;
            this._itemWindow.width = 1031;
            this._itemWindow.height = 166;
            this._itemWindow.createContents();
            this._itemWindow.hide();
            this._itemWindow.deactivate();
        }
    };

    // FIX: Cegah Yanfly memunculkan kembali Window_BattleStatus bawaan
    // Kita keluarkan sepenuhnya dari scene agar tidak dirender PixiJS
    var _Scene_Battle_createStatusWindow = Scene_Battle.prototype.createStatusWindow;
    Scene_Battle.prototype.createStatusWindow = function() {
        _Scene_Battle_createStatusWindow.call(this);
        // Hapus dari windowLayer
        if (this._windowLayer && this._statusWindow) {
            this._windowLayer.removeChild(this._statusWindow);
        }
        // Kunci property visible agar Yanfly tidak bisa memunculkannya lagi
        if (this._statusWindow) {
            Object.defineProperty(this._statusWindow, 'visible', {
                get: function() { return false; },
                set: function(value) { /* abaikan */ }
            });
            this._statusWindow.opacity = 0;
            this._statusWindow.contentsOpacity = 0;
            this._statusWindow.x = -2000;
        }
    };

    Window_BattleStatus.prototype.refresh = function() {
        if (this.contents) this.contents.clear();
    };

    var _Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.call(this);
        this._actorCommandWindow.setHandler('pethogs_slot', this.commandPethogsSlot.bind(this));
        this._actorCommandWindow.setHandler('escape', this.commandEscape.bind(this));
        this._actorCommandWindow.setHandler('cancel', function() {
            this._actorCommandWindow.activate();
        }.bind(this));
    };

    // Hilangkan menu Fight / Escape terpisah: Langsung mulai giliran aktor pertama
    Scene_Battle.prototype.startPartyCommandSelection = function() {
        if (this._partyCommandWindow) {
            this._partyCommandWindow.deactivate();
            this._partyCommandWindow.hide();
        }
        this.selectNextCommand();
    };

    Scene_Battle.prototype.selectPreviousCommand = function() {
        if (this._partyCommandWindow) {
            this._partyCommandWindow.deactivate();
            this._partyCommandWindow.hide();
        }
        if (this._actorCommandWindow && BattleManager.actor()) {
            this._actorCommandWindow.show();
            this._actorCommandWindow.activate();
        }
    };

    Scene_Battle.prototype.commandPethogsSlot = function() {
        if (!BattleManager.inputtingAction()) {
            if (this._actorCommandWindow) this._actorCommandWindow.deactivate();
            return;
        }
        this._actorCommandWindow.deactivate();
        this._actorCommandWindow.refresh();
        this._pethogsSkillSlots.show();
        this._pethogsSkillSlots.activate();
        this._pethogsSkillSlots.select(0); 
    };

    Scene_Battle.prototype.onPethogsSlotCancel = function() {
        this._pethogsSkillSlots.deselect();
        this._pethogsSkillSlots.deactivate();
        if (this._pethogsSkillPopup) this._pethogsSkillPopup.hide();
        this._actorCommandWindow.show();
        this._actorCommandWindow.activate();
        this._actorCommandWindow.select(0);
        this._actorCommandWindow.refresh();
    };

    Scene_Battle.prototype.onPethogsSlotOk = function() {
        var index = this._pethogsSkillSlots.index();
        var action = BattleManager.inputtingAction();
        var actor = BattleManager.actor();
        
        if (index === 0) {
            action.setAttack();
            if (action.needsSelection()) {
                if (action.isForOpponent()) this.selectEnemySelection();
                else this.selectActorSelection();
            } else {
                this.selectNextCommand();
            }
        } else {
            var skillId = actor.pethogsEquippedSkills()[index - 1];
            if (skillId > 0 && actor.canUse($dataSkills[skillId])) {
                action.setSkill(skillId);
                if (action.needsSelection()) {
                    if (action.isForOpponent()) this.selectEnemySelection();
                    else this.selectActorSelection();
                } else {
                    this.selectNextCommand();
                }
            } else {
                SoundManager.playBuzzer(); // Slot kosong atau tak bisa pakai
                this._pethogsSkillSlots.activate(); // Tetap di menu slot
                return;
            }
        }

        this._pethogsSkillSlots.deselect();
        this._pethogsSkillSlots.deactivate();
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        
        // Boss HP Logic
        if (this._pethogsBossHP && $gameTroop) {
            var boss = null;
            var members = $gameTroop.members();
            for (var i = 0; i < members.length; i++) {
                var enemy = members[i];
                if (enemy.isAlive() && enemy.enemy().note.match(/<boss>/i)) {
                    boss = enemy;
                    break;
                }
            }
            this._pethogsBossHP.setBoss(boss);
        }

        if (this._pethogsStatusWindow && BattleManager.isInputting()) {
            this._pethogsStatusWindow.refresh();
        }

        // Sinkronisasi visibilitas custom Battle UI background & HUD
        var isItemActive = (this._itemWindow && this._itemWindow.visible);
        var isInspectActive = isYureBattleInspectOpen(this);
        var isEnding = ($gameParty.isAllDead() || $gameTroop.isAllDead() || BattleManager._phase === 'battleEnd');
        var isInputting = (BattleManager.isInputting() && BattleManager.actor());
        
        var isChainActive = (this._chainPromptWindow && this._chainPromptWindow.active) || 
                            (this._chainBuilderWindow && this._chainBuilderWindow.active) || 
                            (this._comboChainWindow && this._comboChainWindow.active);
        var shouldShowUI = !isEnding && !isInspectActive && (isInputting || isItemActive || isChainActive || (this._pethogsSkillSlots && this._pethogsSkillSlots.active) || (this._actorCommandWindow && this._actorCommandWindow.active));

        if (this._bgBattleWindow) this._bgBattleWindow.visible = shouldShowUI;
        if (this._bgBattleSlots) this._bgBattleSlots.visible = shouldShowUI;
        if (this._pethogsSkillSlots) this._pethogsSkillSlots.visible = (shouldShowUI && !isItemActive);
        if (this._pethogsSkillPopup && !shouldShowUI) this._pethogsSkillPopup.hide();
        if (this._actorCommandWindow) {
            this._actorCommandWindow.visible = shouldShowUI;
            if (shouldShowUI) {
                this._actorCommandWindow.openness = 255;
            }
        }
    };

    // Mencegah game mengira tidak ada window yang aktif dan memaksa nyala kembali
    var _Scene_Battle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        return _Scene_Battle_isAnyInputWindowActive.call(this) || 
               (this._pethogsSkillSlots && this._pethogsSkillSlots.active) ||
               (this._chainPromptWindow && this._chainPromptWindow.active) ||
               (this._chainBuilderWindow && this._chainBuilderWindow.active) ||
               (this._comboChainWindow && this._comboChainWindow.active);
    };

    // ============================================================================
    // 5. Cursor Target Teman & Cancel Hook
    // ============================================================================
    
    // Matikan icon status bawaan yang melayang di dahi sprite (karena sekarang ada di kartu player & di samping meter boss)
    var _Sprite_StateIcon_update = Sprite_StateIcon.prototype.update;
    Sprite_StateIcon.prototype.update = function() {
        _Sprite_StateIcon_update.call(this);
        if (this._battler) {
            this.opacity = 0; 
        }
    };

    var _Window_BattleActor_initialize = Window_BattleActor.prototype.initialize;
    Window_BattleActor.prototype.initialize = function(x, y) {
        _Window_BattleActor_initialize.call(this, x, y);
        this.x = 0;
        this.y = 0; 
        this.width = 300;
        this.height = Graphics.boxHeight; 
        this.opacity = 0; 
        this.padding = 0;
    };

    Window_BattleActor.prototype.itemHeight = function() { return 140; };
    Window_BattleActor.prototype.maxCols = function() { return 1; };
    
    // Jangan gambar text apa-apa, biarkan kursor berkedip yang muncul di atas kartu!
    Window_BattleActor.prototype.drawItem = function(index) {
    };
    
    // Pas-kan ukuran kursor kotak agar sama persis memeluk kartu
    Window_BattleActor.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        rect.width = 260;
        rect.height = 130;
        rect.x = 0; 
        rect.y = index * 140;
        return rect;
    };

    // Hook Cancel dari Actor Target
    var _Scene_Battle_onActorCancel = Scene_Battle.prototype.onActorCancel;
    Scene_Battle.prototype.onActorCancel = function() {
        _Scene_Battle_onActorCancel.call(this);
        if (this._actorCommandWindow.currentSymbol() === 'pethogs_slot') {
            if (this._pethogsSkillSlots) {
                this._pethogsSkillSlots.show();
                this._pethogsSkillSlots.activate();
            }
        } else if (this._actorCommandWindow.currentSymbol() === 'item') {
            if (this._pethogsSkillSlots) this._pethogsSkillSlots.hide();
            if (this._itemWindow) {
                this._itemWindow.show();
                this._itemWindow.activate();
            }
        }
    };

    // Hook Cancel dari Enemy Target
    var _Scene_Battle_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
    Scene_Battle.prototype.onEnemyCancel = function() {
        _Scene_Battle_onEnemyCancel.call(this);
        if (this._actorCommandWindow.currentSymbol() === 'pethogs_slot') {
            if (this._pethogsSkillSlots) {
                this._pethogsSkillSlots.show();
                this._pethogsSkillSlots.activate();
            }
        } else if (this._actorCommandWindow.currentSymbol() === 'item') {
            if (this._pethogsSkillSlots) this._pethogsSkillSlots.hide();
            if (this._itemWindow) {
                this._itemWindow.show();
                this._itemWindow.activate();
            }
        }
    };


    // ============================================================================
    // 6. ROMBAK SCENE_SKILL & POPUP WINDOWS
    // ============================================================================

    // Ensure all windows across the game are solid / non-transparent
    Window_Base.prototype.standardBackOpacity = function() {
        return 255;
    };

    // --- Window_PethogsSkillAction (Anime.js Pop-In) ---
    function Window_PethogsSkillAction() {
        this.initialize.apply(this, arguments);
    }
    Window_PethogsSkillAction.prototype = Object.create(Window_Command.prototype);
    Window_PethogsSkillAction.prototype.constructor = Window_PethogsSkillAction;

    Window_PethogsSkillAction.prototype.initialize = function(x, y) {
        this._skill = null;
        this._actor = null;
        Window_Command.prototype.initialize.call(this, x, y);
        this.opacity = 255;
        this.backOpacity = 255;
        this.hide();
        this.deactivate();
    };

    Window_PethogsSkillAction.prototype.windowWidth = function() { return 170; };
    Window_PethogsSkillAction.prototype.numVisibleRows = function() { return 3; };
    Window_PethogsSkillAction.prototype.standardBackOpacity = function() { return 255; };

    Window_PethogsSkillAction.prototype.setup = function(actor, skill, rect) {
        this._actor = actor;
        this._skill = skill;
        this.clearCommandList();
        this.makeCommandList();
        
        // Letakkan popup di tengah layar atau melayang
        var w = this.windowWidth();
        var h = this.windowHeight();
        this.x = Graphics.boxWidth / 2 - w / 2;
        this.y = Graphics.boxHeight / 2 - h / 2;
        this.pivot.x = w / 2;
        this.pivot.y = h / 2;
        this.x = (Graphics.boxWidth / 2);
        this.y = (Graphics.boxHeight / 2);

        this.refresh();
        this.select(0);
        this.show();
        this.activate();

        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this);
            window.anime.remove(this.scale);
            this.scale.x = 0.82;
            this.scale.y = 0.82;
            this.alpha = 0;
            window.anime({
                targets: this.scale,
                x: 1.0,
                y: 1.0,
                duration: 500,
                easing: 'easeOutElastic(1, .75)'
            });
            window.anime({
                targets: this,
                alpha: 1.0,
                duration: 180,
                easing: 'easeOutQuad'
            });
        }
    };

    Window_PethogsSkillAction.prototype.makeCommandList = function() {
        if (!this._skill || !this._actor) return;
        var canUse = this._actor.canUse(this._skill);
        var isEquipped = this._actor.pethogsEquippedSkills().indexOf(this._skill.id) >= 0;

        this.addCommand("⚡ Gunakan", 'use', canUse);
        this.addCommand("✦ Pasang", 'equip', true);
        this.addCommand("✕ Lepas", 'unequip', isEquipped);
    };

    Window_PethogsSkillAction.prototype.refresh = function() {
        Window_Command.prototype.refresh.call(this);
        var bmp = this._windowBackSprite ? this._windowBackSprite.bitmap : null;
        if (!bmp) {
            // Try painting on the contents background sprite
            if (this._windowContentsSprite && this._windowContentsSprite.bitmap) {
                bmp = this._windowContentsSprite.bitmap;
            }
        }
        // Paint warm purple bg on the window's own backing bitmap
        if (this._windowBackSprite && this._windowBackSprite.bitmap) {
            var wb = this._windowBackSprite.bitmap;
            var ctx = wb._context;
            var w = wb.width; var h = wb.height;
            ctx.save();
            ctx.clearRect(0, 0, w, h);
            ctx.beginPath();
            var rr = 10;
            ctx.moveTo(rr, 0); ctx.lineTo(w - rr, 0);
            ctx.quadraticCurveTo(w, 0, w, rr);
            ctx.lineTo(w, h - rr);
            ctx.quadraticCurveTo(w, h, w - rr, h);
            ctx.lineTo(rr, h);
            ctx.quadraticCurveTo(0, h, 0, h - rr);
            ctx.lineTo(0, rr);
            ctx.quadraticCurveTo(0, 0, rr, 0);
            ctx.closePath();
            ctx.fillStyle = 'rgba(32, 16, 44, 0.97)';
            ctx.fill();
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 209, 102, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(5, 5, w - 10, h - 10);
            ctx.restore();
            wb._setDirty();
        }
    };

    // --- Window_PethogsSkillEquipSlot (Anime.js Pop-In) ---
    function Window_PethogsSkillEquipSlot() {
        this.initialize.apply(this, arguments);
    }
    Window_PethogsSkillEquipSlot.prototype = Object.create(Window_Command.prototype);
    Window_PethogsSkillEquipSlot.prototype.constructor = Window_PethogsSkillEquipSlot;

    Window_PethogsSkillEquipSlot.prototype.initialize = function(x, y) {
        this._actor = null;
        Window_Command.prototype.initialize.call(this, x, y);
        this.opacity = 255;
        this.backOpacity = 255;
        this.hide();
        this.deactivate();
    };

    Window_PethogsSkillEquipSlot.prototype.windowWidth = function() { return 210; };
    Window_PethogsSkillEquipSlot.prototype.numVisibleRows = function() { return 5; };
    Window_PethogsSkillEquipSlot.prototype.standardBackOpacity = function() { return 255; };

    Window_PethogsSkillEquipSlot.prototype.setup = function(actor, popupWindow) {
        this._actor = actor;
        this.clearCommandList();
        this.makeCommandList();
        
        // Posisikan di sebelah popup action
        var w = this.windowWidth();
        var h = this.windowHeight();
        this.pivot.x = w / 2;
        this.pivot.y = h / 2;
        this.x = popupWindow.x + (popupWindow.width / 2) + (w / 2) + 12;
        this.y = popupWindow.y;

        this.refresh();
        this.select(0);
        this.show();
        this.activate();

        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this);
            window.anime.remove(this.scale);
            this.scale.x = 0.82;
            this.scale.y = 0.82;
            this.alpha = 0;
            window.anime({
                targets: this.scale,
                x: 1.0,
                y: 1.0,
                duration: 500,
                easing: 'easeOutElastic(1, .75)'
            });
            window.anime({
                targets: this,
                alpha: 1.0,
                duration: 180,
                easing: 'easeOutQuad'
            });
        }
    };

    Window_PethogsSkillEquipSlot.prototype.makeCommandList = function() {
        if (!this._actor) return;
        var eq = this._actor.pethogsEquippedSkills();
        for (var i = 0; i < 5; i++) {
            var skillName = "Kosong";
            if (eq[i] > 0 && $dataSkills[eq[i]]) {
                skillName = $dataSkills[eq[i]].name;
            }
            this.addCommand("Slot " + (i+1) + ": " + skillName, 'slot', true, i);
        }
    };

    Window_PethogsSkillEquipSlot.prototype.refresh = function() {
        Window_Command.prototype.refresh.call(this);
        if (this._windowBackSprite && this._windowBackSprite.bitmap) {
            var wb = this._windowBackSprite.bitmap;
            var ctx = wb._context;
            var w = wb.width; var h = wb.height;
            ctx.save();
            ctx.clearRect(0, 0, w, h);
            ctx.beginPath();
            var rr = 10;
            ctx.moveTo(rr, 0); ctx.lineTo(w - rr, 0);
            ctx.quadraticCurveTo(w, 0, w, rr);
            ctx.lineTo(w, h - rr);
            ctx.quadraticCurveTo(w, h, w - rr, h);
            ctx.lineTo(rr, h);
            ctx.quadraticCurveTo(0, h, 0, h - rr);
            ctx.lineTo(0, rr);
            ctx.quadraticCurveTo(0, 0, rr, 0);
            ctx.closePath();
            ctx.fillStyle = 'rgba(32, 16, 44, 0.97)';
            ctx.fill();
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 209, 102, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(5, 5, w - 10, h - 10);
            ctx.restore();
            wb._setDirty();
        }
    };


    // --- Scene_Skill Hooking ---
    var _Scene_Skill_create = Scene_Skill.prototype.create;
    Scene_Skill.prototype.create = function() {
        _Scene_Skill_create.call(this);
        this.createPethogsSkillWindows();
    };

    Scene_Skill.prototype.createPethogsSkillWindows = function() {
        // Popup Pertama
        this._pethogsSkillActionWindow = new Window_PethogsSkillAction(0, 0);
        this._pethogsSkillActionWindow.setHandler('use', this.onPethogsSkillActionUse.bind(this));
        this._pethogsSkillActionWindow.setHandler('equip', this.onPethogsSkillActionEquip.bind(this));
        this._pethogsSkillActionWindow.setHandler('unequip', this.onPethogsSkillActionUnequip.bind(this));
        this._pethogsSkillActionWindow.setHandler('cancel', this.onPethogsSkillActionCancel.bind(this));
        this.addWindow(this._pethogsSkillActionWindow);

        // Popup Kedua
        this._pethogsSkillEquipSlotWindow = new Window_PethogsSkillEquipSlot(0, 0);
        this._pethogsSkillEquipSlotWindow.setHandler('slot', this.onPethogsSkillEquipConfirm.bind(this));
        this._pethogsSkillEquipSlotWindow.setHandler('cancel', this.onPethogsSkillEquipCancel.bind(this));
        this.addWindow(this._pethogsSkillEquipSlotWindow);
    };

    // Override eksekusi item window bawaan
    var _Scene_Skill_onItemOk = Scene_Skill.prototype.onItemOk;
    Scene_Skill.prototype.onItemOk = function() {
        var skill = this.item();
        if (skill) {
            // Jangan langsung 'use', tapi buka popup
            var rect = this._itemWindow.itemRect(this._itemWindow.index());
            this._pethogsSkillActionWindow.setup(this.actor(), skill, rect);
        } else {
            // Jika kosong (mungkin YEP core)
            SoundManager.playBuzzer();
            this._itemWindow.activate();
        }
    };

    // Handler: Cancel Popup Action
    Scene_Skill.prototype.onPethogsSkillActionCancel = function() {
        this._pethogsSkillActionWindow.hide();
        this._pethogsSkillActionWindow.deactivate();
        this._itemWindow.activate(); // Kembali ke list skill
        this._itemWindow.refresh();
    };

    // Handler: Use
    Scene_Skill.prototype.onPethogsSkillActionUse = function() {
        // Lanjutkan alur bawaan (termasuk efek ke actor dll)
        this._pethogsSkillActionWindow.hide();
        this._pethogsSkillActionWindow.deactivate();
        _Scene_Skill_onItemOk.call(this); // Panggil fungsi aslinya untuk use
    };

    // Handler: Equip
    Scene_Skill.prototype.onPethogsSkillActionEquip = function() {
        this._pethogsSkillActionWindow.deactivate(); // Tetap terlihat
        this._pethogsSkillEquipSlotWindow.setup(this.actor(), this._pethogsSkillActionWindow);
    };

    // Handler: Unequip
    Scene_Skill.prototype.onPethogsSkillActionUnequip = function() {
        var skill = this._itemWindow.item();
        this.actor().unequipPethogsSkill(skill.id);
        SoundManager.playEquip(); // SFX berhasil equip/unequip
        this.onPethogsSkillActionCancel();
    };

    // Handler: Cancel Popup Slot
    Scene_Skill.prototype.onPethogsSkillEquipCancel = function() {
        this._pethogsSkillEquipSlotWindow.hide();
        this._pethogsSkillEquipSlotWindow.deactivate();
        this._pethogsSkillActionWindow.activate();
    };

    // Handler: Confirm Equip ke Slot
    Scene_Skill.prototype.onPethogsSkillEquipConfirm = function() {
        var slotIndex = this._pethogsSkillEquipSlotWindow.currentExt(); // Mendapatkan 'i' dari 'slot' command
        var skill = this._itemWindow.item();
        
        this.actor().equipPethogsSkill(slotIndex, skill.id);
        SoundManager.playEquip();

        // Tutup semua
        this._pethogsSkillEquipSlotWindow.hide();
        this._pethogsSkillEquipSlotWindow.deactivate();
        this.onPethogsSkillActionCancel();
    };

    // Supaya skill (bahkan yang khusus battle) bisa di-klik untuk di-equip
    Window_SkillList.prototype.isEnabled = function(item) {
        return !!item; // Selama item ada, bisa diklik (Use button di popup yang akan mengecek canUse)
    };

    // Mengganti warna skill list jika di-equip (Bantuan Visual)
    var _Window_SkillList_drawItem = Window_SkillList.prototype.drawItem;
    Window_SkillList.prototype.drawItem = function(index) {
        var skill = this._data[index];
        if (skill && this._actor && this._actor.pethogsEquippedSkills().indexOf(skill.id) >= 0) {
            // Ubah text color menjadi kuning/hijau penanda equip (Color 17)
            this.changeTextColor(this.textColor(17));
        } else {
            this.resetTextColor();
        }
        _Window_SkillList_drawItem.call(this, index);
        this.resetTextColor();
    };

})(Pethogs.EngineCore);
var _Scene_Battle_startActorCommandSelection_YureFix = Scene_Battle.prototype.startActorCommandSelection;
Scene_Battle.prototype.startActorCommandSelection = function() {
    _Scene_Battle_startActorCommandSelection_YureFix.call(this);
    if (this._itemWindow) {
        this._itemWindow.hide();
        this._itemWindow.deactivate();
    }
    if (this._helpWindow) {
        this._helpWindow.hide();
    }
    if (this._pethogsSkillSlots) {
        this._pethogsSkillSlots.show();
        this._pethogsSkillSlots.deselect();
        this._pethogsSkillSlots.deactivate();
        this._pethogsSkillSlots.refresh();
    }
    if (this._actorCommandWindow) {
        this._actorCommandWindow.show();
        this._actorCommandWindow.openness = 255;
        this._actorCommandWindow.x = 20;
        this._actorCommandWindow.y = 527;
        this._actorCommandWindow.setup(BattleManager.actor());
        this._actorCommandWindow.activate();
        this._actorCommandWindow.select(0);
        this._actorCommandWindow.refresh();
    }
};

// Bulletproof check to prevent crashes if command window is active during action execution
var _Scene_Battle_commandGuard_YureFix = Scene_Battle.prototype.commandGuard;
Scene_Battle.prototype.commandGuard = function() {
    if (!BattleManager.inputtingAction()) {
        if (this._actorCommandWindow) this._actorCommandWindow.deactivate();
        return;
    }
    if (this._pethogsSkillSlots) {
        this._pethogsSkillSlots.deselect();
        this._pethogsSkillSlots.deactivate();
        this._pethogsSkillSlots.hide();
    }
    if (this._pethogsSkillPopup) {
        this._pethogsSkillPopup.hide();
    }
    if (this._actorCommandWindow) {
        this._actorCommandWindow.deactivate();
        this._actorCommandWindow.hide();
    }
    _Scene_Battle_commandGuard_YureFix.call(this);
};

var _Scene_Battle_commandAttack_YureFix = Scene_Battle.prototype.commandAttack;
Scene_Battle.prototype.commandAttack = function() {
    if (!BattleManager.inputtingAction()) {
        if (this._actorCommandWindow) this._actorCommandWindow.deactivate();
        return;
    }
    if (this._pethogsSkillSlots) {
        this._pethogsSkillSlots.deselect();
        this._pethogsSkillSlots.deactivate();
        this._pethogsSkillSlots.hide();
    }
    if (this._pethogsSkillPopup) {
        this._pethogsSkillPopup.hide();
    }
    if (this._actorCommandWindow) {
        this._actorCommandWindow.deactivate();
        this._actorCommandWindow.hide();
    }
    _Scene_Battle_commandAttack_YureFix.call(this);
};

var _Scene_Battle_commandSkill_YureFix = Scene_Battle.prototype.commandSkill;
Scene_Battle.prototype.commandSkill = function() {
    if (!BattleManager.inputtingAction()) {
        if (this._actorCommandWindow) this._actorCommandWindow.deactivate();
        return;
    }
    if (this._pethogsSkillSlots) {
        this._pethogsSkillSlots.deselect();
        this._pethogsSkillSlots.deactivate();
        this._pethogsSkillSlots.hide();
    }
    if (this._pethogsSkillPopup) {
        this._pethogsSkillPopup.hide();
    }
    if (this._actorCommandWindow) {
        this._actorCommandWindow.deactivate();
        this._actorCommandWindow.hide();
    }
    _Scene_Battle_commandSkill_YureFix.call(this);
};

// --- ITEM IN BATTLE HANDLING & VISUAL FIX ---
Window_BattleItem.prototype.maxCols = function() {
    return 2;
};

Window_BattleItem.prototype.standardPadding = function() {
    return 8;
};

Window_BattleItem.prototype.showHelpWindow = function() {
    // Keep bulky help window hidden in battle to prevent overlapping boss HP bar
};

Window_BattleItem.prototype.hideHelpWindow = function() {
};

Scene_Battle.prototype.commandItem = function() {
    if (!BattleManager.inputtingAction()) {
        if (this._actorCommandWindow) this._actorCommandWindow.deactivate();
        return;
    }
    if (this._pethogsSkillSlots) {
        this._pethogsSkillSlots.hide();
        this._pethogsSkillSlots.deactivate();
    }
    if (this._pethogsSkillPopup) {
        this._pethogsSkillPopup.hide();
    }
    if (this._actorCommandWindow) {
        this._actorCommandWindow.deactivate();
    }
    if (this._itemWindow) {
        this._itemWindow.refresh();
        this._itemWindow.show();
        this._itemWindow.activate();
        this._itemWindow.select(0);
    }
    if (this._helpWindow) {
        this._helpWindow.hide();
    }
};

var _Scene_Battle_onItemCancel_YureFix = Scene_Battle.prototype.onItemCancel;
Scene_Battle.prototype.onItemCancel = function() {
    _Scene_Battle_onItemCancel_YureFix.call(this);
    if (this._helpWindow) {
        this._helpWindow.hide();
    }
    if (this._itemWindow) {
        this._itemWindow.hide();
        this._itemWindow.deactivate();
    }
    if (this._pethogsSkillSlots) {
        this._pethogsSkillSlots.show();
    }
    if (this._actorCommandWindow) {
        this._actorCommandWindow.activate();
    }
};

var _Scene_Battle_onItemOk_YureFix = Scene_Battle.prototype.onItemOk;
Scene_Battle.prototype.onItemOk = function() {
    var item = this._itemWindow ? this._itemWindow.item() : null;
    var action = BattleManager.inputtingAction();
    if (action && item) {
        action.setItem(item.id);
        if (action.needsSelection()) {
            if (this._itemWindow) this._itemWindow.hide();
            if (this._helpWindow) this._helpWindow.hide();
            if (action.isForOpponent()) {
                this.selectEnemySelection();
            } else {
                this.selectActorSelection();
            }
        } else {
            if (this._itemWindow) this._itemWindow.hide();
            if (this._helpWindow) this._helpWindow.hide();
            if (this._pethogsSkillSlots) this._pethogsSkillSlots.show();
            this.selectNextCommand();
        }
    } else {
        _Scene_Battle_onItemOk_YureFix.call(this);
    }
};

// ============================================================================
// DYNAMIC VISUAL POLISH: CTB TURN ORDER ACTIVE PULSE
// ============================================================================
if (typeof Window_CTBIcon !== 'undefined') {
    var _Window_CTBIcon_update = Window_CTBIcon.prototype.update;
    Window_CTBIcon.prototype.update = function() {
        _Window_CTBIcon_update.call(this);
        if (this._battler) {
            var isCurrent = (BattleManager.actor() === this._battler || BattleManager._subject === this._battler);
            if (isCurrent) {
                var pulse = 1.0 + 0.08 * Math.sin(Graphics.frameCount * 0.12);
                this.scale.x = pulse;
                this.scale.y = pulse;
            } else {
                this.scale.x = 1.0;
                this.scale.y = 1.0;
            }
        }
    };
}
