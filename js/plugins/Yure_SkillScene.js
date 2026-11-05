/*:
 * @plugindesc [v2.0] Custom Skill Scene with 5 Battle Slots Equipping & Visual HUD.
 * @author Lead Drain Production
 *
 * @help
 * ============================================================================
 * YURE SKILL SCENE V2.0 (5 BATTLE SLOTS EQUIP SYSTEM)
 * ============================================================================
 * Merombak Scene_Skill agar mendukung penuh sistem 5 Slot Skill Battle:
 * - Kiri Atas: Opsi (Skill Type) & Nama Karakter
 * - Kanan Atas: Skill Detail (Icon Besar, Nama, Stats Grid)
 * - Kanan Tengah: ⚔ BATTLE SKILL SLOTS BAR (Slot 1 s/d Slot 5)
 * - Kiri Bawah: Daftar Skill (dengan penanda badge [SLOT X] jika terpasang)
 * - Kanan Bawah: Deskripsi Skill
 *
 * FITUR UTAMA:
 * - Seluruh skill (termasuk skill battle seperti EWGF) BISA DIKLIK & DIPASANG.
 * - Memilih skill memunculkan popup: [Pasang ke Slot...], [Lepas], [Gunakan].
 * - Slot Battle terhubung 100% dengan HUD pertarungan Pethogs Core.
 */

(function() {
    'use strict';

    var SKILL_LEFT_WIDTH = 460;

    // ============================================================================
    // 1. SCENE SKILL OVERRIDES (LAYOUT & DYNAMIC ENTRANCE)
    // ============================================================================
    var _Scene_Skill_create = Scene_Skill.prototype.create;
    Scene_Skill.prototype.create = function() {
        Scene_ItemBase.prototype.create.call(this);

        // Custom Window Creation Flow
        this.createSkillTypeWindow();
        this.createStatusWindow();        // Detail Kanan Atas (y: 0, h: 220)
        this.createBattleSlotsWindow();   // 5 Slot Battle Kanan Tengah (y: 220, h: 140)
        this.createItemWindow();          // List Skill Kiri Bawah (w: 460)
        this.createHelpWindowCustom();    // Deskripsi Kanan Bawah (y: 360)
        this.createActionPopup();         // Popup Aksi [Equip, Unequip, Use]
        this.createSlotPopup();           // Popup Pilihan [Slot 1 - 5]
        this.createActorWindow();

        this._introProgress = 0;
        this._introDuration = 14;
        this.setupIntroPositions();
    };

    Scene_Skill.prototype.setupIntroPositions = function() {
        this._introProgress = 0;
        if (this._skillActorNameWindow) {
            this._skillActorNameWindow._baseY = this._skillActorNameWindow.y;
            this._skillActorNameWindow.y = this._skillActorNameWindow._baseY - 30;
            this._skillActorNameWindow.alpha = 0;
        }
        if (this._skillTypeWindow) {
            this._skillTypeWindow._baseY = this._skillTypeWindow.y;
            this._skillTypeWindow.y = this._skillTypeWindow._baseY - 30;
            this._skillTypeWindow.alpha = 0;
        }
        if (this._statusWindow) {
            this._statusWindow._baseY = this._statusWindow.y;
            this._statusWindow.y = this._statusWindow._baseY - 30;
            this._statusWindow.alpha = 0;
        }
        if (this._battleSlotsWindow) {
            this._battleSlotsWindow._baseY = this._battleSlotsWindow.y;
            this._battleSlotsWindow.y = this._battleSlotsWindow._baseY - 30;
            this._battleSlotsWindow.alpha = 0;
        }
        if (this._itemWindow) {
            this._itemWindow._baseX = this._itemWindow.x;
            this._itemWindow.x = this._itemWindow._baseX - 40;
            this._itemWindow.alpha = 0;
        }
        if (this._helpWindow) {
            this._helpWindow._baseX = this._helpWindow.x;
            this._helpWindow.x = this._helpWindow._baseX + 40;
            this._helpWindow.alpha = 0;
        }
    };

    var _Scene_Skill_update = Scene_Skill.prototype.update;
    Scene_Skill.prototype.update = function() {
        _Scene_Skill_update.call(this);
        if (this._introProgress < this._introDuration) {
            this._introProgress++;
            var t = this._introProgress / this._introDuration;
            var ease = 1 - Math.pow(1 - t, 3);

            if (this._skillActorNameWindow && this._skillActorNameWindow._baseY !== undefined) {
                this._skillActorNameWindow.y = this._skillActorNameWindow._baseY - 30 * (1 - ease);
                this._skillActorNameWindow.alpha = ease;
            }
            if (this._skillTypeWindow && this._skillTypeWindow._baseY !== undefined) {
                this._skillTypeWindow.y = this._skillTypeWindow._baseY - 30 * (1 - ease);
                this._skillTypeWindow.alpha = ease;
            }
            if (this._statusWindow && this._statusWindow._baseY !== undefined) {
                this._statusWindow.y = this._statusWindow._baseY - 30 * (1 - ease);
                this._statusWindow.alpha = ease;
            }
            if (this._battleSlotsWindow && this._battleSlotsWindow._baseY !== undefined) {
                this._battleSlotsWindow.y = this._battleSlotsWindow._baseY - 30 * (1 - ease);
                this._battleSlotsWindow.alpha = ease;
            }
            if (this._itemWindow && this._itemWindow._baseX !== undefined) {
                this._itemWindow.x = this._itemWindow._baseX - 40 * (1 - ease);
                this._itemWindow.alpha = ease;
            }
            if (this._helpWindow && this._helpWindow._baseX !== undefined) {
                this._helpWindow.x = this._helpWindow._baseX + 40 * (1 - ease);
                this._helpWindow.alpha = ease;
            }
        }
    };

    Scene_Skill.prototype.createSkillTypeWindow = function() {
        var lw = SKILL_LEFT_WIDTH;
        // Jendela Nama Karakter
        this._skillActorNameWindow = new Window_Base(0, 0, lw, 64);
        this._skillActorNameWindow._customMotionHandled = true;
        this.addWindow(this._skillActorNameWindow);

        // Jendela Opsi (Skill Type)
        this._skillTypeWindow = new Window_SkillType(0, 64);
        this._skillTypeWindow._customMotionHandled = true;
        this._skillTypeWindow.move(0, 64, lw, 106);
        this._skillTypeWindow.setHandler('skill',    this.commandSkill.bind(this));
        this._skillTypeWindow.setHandler('cancel',   this.popScene.bind(this));
        this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._skillTypeWindow.setHandler('pageup',   this.previousActor.bind(this));
        this.addWindow(this._skillTypeWindow);
    };

    var _Window_SkillType_maxCols = Window_SkillType.prototype.maxCols;
    Window_SkillType.prototype.maxCols = function() {
        if (SceneManager._scene instanceof Scene_Skill) {
            return 2;
        }
        return _Window_SkillType_maxCols ? _Window_SkillType_maxCols.call(this) : 1;
    };

    Scene_Skill.prototype.createStatusWindow = function() {
        var wx = SKILL_LEFT_WIDTH;
        var wy = 0;
        var ww = Graphics.boxWidth - wx;
        var wh = 220;
        this._statusWindow = new Window_YureSkillDetail(wx, wy, ww, wh);
        this._statusWindow._customMotionHandled = true;
        this.addWindow(this._statusWindow);
    };

    // ⚔ WINDOW 5 SLOT BATTLE (KANAN TENGAH)
    Scene_Skill.prototype.createBattleSlotsWindow = function() {
        var wx = SKILL_LEFT_WIDTH;
        var wy = 220;
        var ww = Graphics.boxWidth - wx;
        var wh = 140;
        this._battleSlotsWindow = new Window_YureBattleSlots(wx, wy, ww, wh);
        this._battleSlotsWindow._customMotionHandled = true;
        this._battleSlotsWindow.setHandler('ok', this.onBattleSlotOk.bind(this));
        this.addWindow(this._battleSlotsWindow);
    };

    Scene_Skill.prototype.createItemWindow = function() {
        var wx = 0;
        var wy = 170;
        var ww = SKILL_LEFT_WIDTH;
        var wh = Graphics.boxHeight - wy;
        this._itemWindow = new Window_SkillList(wx, wy, ww, wh);
        this._itemWindow._customMotionHandled = true;
        this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this._itemWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._itemWindow.setHandler('pageup',   this.previousActor.bind(this));
        this._skillTypeWindow.setSkillWindow(this._itemWindow);
        this.addWindow(this._itemWindow);
    };

    Scene_Skill.prototype.createHelpWindowCustom = function() {
        var wx = SKILL_LEFT_WIDTH;
        var wy = 360;
        var ww = Graphics.boxWidth - wx;
        var wh = Graphics.boxHeight - wy;
        this._helpWindow = new Window_YureSkillHelp(wx, wy, ww, wh);
        this._helpWindow._customMotionHandled = true;
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._statusWindow.setHelpWindow(this._helpWindow);
        this.addWindow(this._helpWindow);
    };

    Scene_Skill.prototype.createActionPopup = function() {
        this._actionPopup = new Window_SkillActionPopup();
        this._actionPopup._customMotionHandled = true;
        this._actionPopup.setHandler('equip', this.onActionEquip.bind(this));
        this._actionPopup.setHandler('unequip', this.onActionUnequip.bind(this));
        this._actionPopup.setHandler('use', this.onActionUse.bind(this));
        this._actionPopup.setHandler('cancel', this.onActionCancel.bind(this));
        this.addWindow(this._actionPopup);
    };

    Scene_Skill.prototype.createSlotPopup = function() {
        this._slotPopup = new Window_SkillSlotPopup();
        this._slotPopup._customMotionHandled = true;
        this._slotPopup.setHandler('ok', this.onSlotOk.bind(this));
        this._slotPopup.setHandler('cancel', this.onSlotCancel.bind(this));
        this.addWindow(this._slotPopup);
    };

    // --- Interaction Hooks ---
    Scene_Skill.prototype.onItemOk = function() {
        var skill = this.item();
        if (skill) {
            this.actor().setLastMenuSkill(skill);
            this._actionPopup.setSkill(skill, this.actor());
            
            this._actionPopup.x = (Graphics.boxWidth - this._actionPopup.width) / 2;
            this._actionPopup.y = (Graphics.boxHeight - this._actionPopup.height) / 2;
            
            this._actionPopup.openWithMotion();
            this._actionPopup.activate();
            this._actionPopup.select(0);
        } else {
            this._itemWindow.activate();
        }
    };

    Scene_Skill.prototype.onActionUse = function() {
        this._actionPopup.closeWithMotion(function() {
            this.determineItem(); // Uses standard RPG Maker logic
        }.bind(this));
    };

    Scene_Skill.prototype.onActionEquip = function() {
        this._actionPopup.deactivate();
        this._slotPopup.setActor(this.actor());
        
        this._slotPopup.x = (Graphics.boxWidth - this._slotPopup.width) / 2;
        this._slotPopup.y = (Graphics.boxHeight - this._slotPopup.height) / 2;
        
        this._slotPopup.openWithMotion();
        this._slotPopup.activate();
        this._slotPopup.select(0);
    };

    Scene_Skill.prototype.onActionUnequip = function() {
        var skill = this.item();
        var actor = this.actor();
        if (actor && actor.pethogsEquippedSkills) {
            var equipped = actor.pethogsEquippedSkills();
            var index = equipped.indexOf(skill.id);
            if (index !== -1) {
                equipped[index] = 0;
                SoundManager.playEquip();
            } else {
                SoundManager.playBuzzer();
            }
        }
        this.onActionCancel();
        this.refreshActor();
    };

    Scene_Skill.prototype.onActionCancel = function() {
        this._actionPopup.closeWithMotion(function() {
            this._itemWindow.activate();
            this._itemWindow.refresh();
        }.bind(this));
    };

    Scene_Skill.prototype.onSlotOk = function() {
        var skill = this.item();
        var actor = this.actor();
        var slotIndex = this._slotPopup.index(); // 0 to 4
        
        if (actor && actor.pethogsEquippedSkills) {
            var equipped = actor.pethogsEquippedSkills();
            // Lepas skill jika sudah terpasang di slot lain agar tidak ganda
            for (var i = 0; i < equipped.length; i++) {
                if (equipped[i] === skill.id) equipped[i] = 0;
            }
            equipped[slotIndex] = skill.id;
            SoundManager.playEquip();
        }
        
        this._slotPopup.closeWithMotion(function() {
            this.onActionCancel();
            this.refreshActor();
        }.bind(this));
    };

    Scene_Skill.prototype.onSlotCancel = function() {
        this._slotPopup.closeWithMotion(function() {
            this._actionPopup.activate();
        }.bind(this));
    };

    // Handler klik langsung pada kotak Battle Slot
    Scene_Skill.prototype.onBattleSlotOk = function() {
        var slotIndex = this._battleSlotsWindow.index();
        var actor = this.actor();
        if (actor && actor.pethogsEquippedSkills) {
            var equipped = actor.pethogsEquippedSkills();
            var skillId = equipped[slotIndex];
            if (skillId > 0) {
                equipped[slotIndex] = 0; // Lepas skill
                SoundManager.playEquip();
                this.refreshActor();
            } else {
                SoundManager.playBuzzer();
            }
        }
        this._battleSlotsWindow.activate();
    };

    // Override refreshActor
    var _Scene_Skill_refreshActor = Scene_Skill.prototype.refreshActor;
    Scene_Skill.prototype.refreshActor = function() {
        _Scene_Skill_refreshActor.call(this);
        if (this._statusWindow) {
            this._statusWindow.setActor(this.actor());
        }
        if (this._battleSlotsWindow) {
            this._battleSlotsWindow.setActor(this.actor());
        }
        if (this._itemWindow) {
            this._itemWindow.refresh();
        }
        if (this._skillActorNameWindow && this.actor()) {
            this._skillActorNameWindow.contents.clear();
            this._skillActorNameWindow.contents.fontSize = 22;
            this._skillActorNameWindow.changeTextColor('#f8fafc');
            this._skillActorNameWindow.drawText(this.actor().name().toUpperCase(), 0, 4, this._skillActorNameWindow.contentsWidth(), 'center');
            this._skillActorNameWindow.resetTextColor();
        }
    };


    // ============================================================================
    // 2. CUSTOM WINDOWS
    // ============================================================================

    // --- 2.1 Window_SkillList (Enable Semua Skill & Beri Badge Slot) ---
    // PENTING: Mengaktifkan klik pada seluruh skill (termasuk battle only seperti EWGF)
    Window_SkillList.prototype.isEnabled = function(item) {
        return !!item;
    };

    Window_SkillList.prototype.drawItem = function(index) {
        var skill = this._data[index];
        if (skill) {
            var rect = this.itemRect(index);
            rect.width -= this.textPadding();

            // Cek apakah skill ini terpasang di salah satu dari 5 slot battle
            var slotIdx = -1;
            if (this._actor && this._actor.pethogsEquippedSkills) {
                slotIdx = this._actor.pethogsEquippedSkills().indexOf(skill.id);
            }

            var costWidth = this.costWidth();
            var badgeW = slotIdx !== -1 ? 66 : 0;
            var nameWidth = rect.width - costWidth - badgeW;

            this.changePaintOpacity(true);

            // Jika skill di-equip, beri warna emas
            if (slotIdx !== -1) {
                this.changeTextColor('#facc15');
            } else {
                this.resetTextColor();
            }
            this.drawText(skill.name, rect.x, rect.y, nameWidth);
            this.resetTextColor();

            // Gambar badge Slot penanda equip
            if (slotIdx !== -1) {
                var bx = rect.x + nameWidth + 2;
                var by = rect.y + 4;
                var bw = badgeW - 6;
                var bh = rect.height - 8;
                this.contents.fillRect(bx, by, bw, bh, 'rgba(56, 189, 248, 0.25)');
                this.contents.fontSize = 11;
                this.changeTextColor('#38bdf8');
                this.drawText('SLOT ' + (slotIdx + 1), bx, rect.y, bw, 'center');
                this.resetTextColor();
                this.contents.fontSize = this.standardFontSize();
            }

            this.drawSkillCost(skill, rect.x, rect.y, rect.width);
        }
    };

    Window_SkillList.prototype.maxCols = function() {
        if (SceneManager._scene instanceof Scene_Skill) {
            return 1;
        }
        return 1;
    };

    var _Window_SkillList_updateHelp = Window_SkillList.prototype.updateHelp;
    Window_SkillList.prototype.updateHelp = function() {
        _Window_SkillList_updateHelp.call(this);
        if (this._helpWindow && this._helpWindow._statusDetail) {
            this._helpWindow._statusDetail.setItem(this.item());
        }
    };


    // --- 2.2 Window_YureBattleSlots: Tampilan 5 Slot Battle Real-Time ---
    function Window_YureBattleSlots() {
        this.initialize.apply(this, arguments);
    }
    Window_YureBattleSlots.prototype = Object.create(Window_Selectable.prototype);
    Window_YureBattleSlots.prototype.constructor = Window_YureBattleSlots;

    Window_YureBattleSlots.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this.refresh();
        this.deselect();
        this.deactivate();
    };

    Window_YureBattleSlots.prototype.maxCols = function() { return 5; };
    Window_YureBattleSlots.prototype.maxItems = function() { return 5; };

    Window_YureBattleSlots.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
    };

    Window_YureBattleSlots.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var maxCols = this.maxCols();
        var headerH = 30;
        var padding = this.textPadding();
        var availW = this.contentsWidth() - padding * 2;
        var spacing = 12;
        var slotW = Math.floor((availW - (spacing * (maxCols - 1))) / maxCols);
        var slotH = this.contentsHeight() - headerH - 6;

        rect.x = padding + index * (slotW + spacing);
        rect.y = headerH + 2;
        rect.width = slotW;
        rect.height = slotH;
        return rect;
    };

    Window_YureBattleSlots.prototype.refresh = function() {
        this.contents.clear();

        // 1. Header Title
        this.contents.fontSize = 15;
        this.changeTextColor('#38bdf8');
        this.drawText('⚔ BATTLE SKILL SLOTS (EQUIPPED)', 6, 2, this.contentsWidth() - 12, 'left');

        this.contents.fontSize = 12;
        this.changeTextColor('#94a3b8');
        this.drawText('[Klik skill di kiri untuk pasang ke slot 1-5]', 0, 4, this.contentsWidth() - 8, 'right');
        this.resetTextColor();

        // 2. Render 5 Slot Cards
        var topIndex = this.topIndex();
        for (var i = 0; i < this.maxPageItems(); i++) {
            var index = topIndex + i;
            if (index < this.maxItems()) {
                this.drawSlotItem(index);
            }
        }
    };

    Window_YureBattleSlots.prototype.drawSlotItem = function(index) {
        var rect = this.itemRect(index);
        var actor = this._actor;
        var skillId = 0;
        if (actor && actor.pethogsEquippedSkills) {
            skillId = actor.pethogsEquippedSkills()[index] || 0;
        }
        var skill = skillId > 0 ? $dataSkills[skillId] : null;

        // Box Card Background
        var isSelected = (this.index() === index && this.active);
        var ctx = this.contents.context;
        var bgGrad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height);
        if (isSelected) {
            bgGrad.addColorStop(0, 'rgba(56, 189, 248, 0.40)');
            bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
        } else if (skill) {
            bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0.88)');
            bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
        } else {
            bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.50)');
            bgGrad.addColorStop(1, 'rgba(10, 15, 26, 0.70)');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

        // Border Outline
        ctx.strokeStyle = isSelected ? '#38bdf8' : (skill ? '#64748b' : 'rgba(255, 255, 255, 0.12)');
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);

        // Slot Label: "SLOT 1"
        this.contents.fontSize = 11;
        this.changeTextColor(skill ? '#38bdf8' : '#64748b');
        this.drawText('SLOT ' + (index + 1), rect.x, rect.y + 2, rect.width, 'center');
        this.resetTextColor();

        // Skill Icon (42x42)
        var iconSize = 42;
        var ix = rect.x + Math.floor((rect.width - iconSize) / 2);
        var iy = rect.y + 18;

        if (skill) {
            if (typeof ImageManager.drawSkillIcon === 'function') {
                ImageManager.drawSkillIcon(this.contents, skill, ix, iy, iconSize, iconSize, this.refresh.bind(this));
            } else {
                this.drawIcon(skill.iconIndex, ix, iy);
            }

            // Skill Name
            this.contents.fontSize = 11;
            this.changeTextColor('#ffffff');
            var sName = skill.name.replace(/\s*\(.*\)/, '').trim();
            this.drawText(sName, rect.x + 2, rect.y + rect.height - 20, rect.width - 4, 'center');
            this.resetTextColor();
        } else {
            // Placeholder Kosong
            this.contents.fontSize = 11;
            this.changeTextColor('#475569');
            this.drawText('(Kosong)', rect.x, rect.y + 36, rect.width, 'center');
            this.resetTextColor();
        }
    };


    // --- 2.3 Window_YureSkillHelp (Deskripsi Skill) ---
    function Window_YureSkillHelp() {
        this.initialize.apply(this, arguments);
    }
    Window_YureSkillHelp.prototype = Object.create(Window_Base.prototype);
    Window_YureSkillHelp.prototype.constructor = Window_YureSkillHelp;

    Window_YureSkillHelp.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._text = '';
        this._statusDetail = null; 
    };

    Window_YureSkillHelp.prototype.setItem = function(item) {
        this.setText(item ? item.description : '');
    };

    Window_YureSkillHelp.prototype.setText = function(text) {
        if (this._text !== text) {
            this._text = text;
            this.refresh();
        }
    };

    Window_YureSkillHelp.prototype.clear = function() {
        this.setText('');
    };

    Window_YureSkillHelp.prototype.refresh = function() {
        this.contents.clear();
        this.changeTextColor(this.systemColor());
        this.contents.fontSize = 14;
        this.drawText("DESKRIPSI SKILL", 0, 0, this.contentsWidth());
        this.resetTextColor();

        // Garis pemisah
        this.contents.paintOpacity = 100;
        this.contents.fillRect(0, 26, this.contentsWidth(), 2, this.normalColor());
        this.contents.paintOpacity = 255;

        // Auto wrap text
        this.drawTextEx(this._text, 0, 34);
    };

    
    // --- 2.4 Window_YureSkillDetail (Icon Besar, Nama, Stats Grid) ---
    function Window_YureSkillDetail() {
        this.initialize.apply(this, arguments);
    }
    Window_YureSkillDetail.prototype = Object.create(Window_Base.prototype);
    Window_YureSkillDetail.prototype.constructor = Window_YureSkillDetail;

    Window_YureSkillDetail.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._item = null;
        this._actor = null;
    };

    Window_YureSkillDetail.prototype.setHelpWindow = function(helpWindow) {
        helpWindow._statusDetail = this;
    };

    Window_YureSkillDetail.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
    };

    Window_YureSkillDetail.prototype.setItem = function(item) {
        if (this._item !== item) {
            this._item = item;
            this.refresh();
        }
    };

    Window_YureSkillDetail.prototype.refresh = function() {
        this.contents.clear();
        if (!this._item) return;

        // 1. Gambar Kotak Icon Kiri (Maks 150x150)
        var iconSize = 150;
        var paddingY = (this.contentsHeight() - iconSize) / 2;
        var ix = 10;
        var iy = paddingY > 0 ? paddingY : 0;
        
        this.contents.fillRect(ix, iy, iconSize, iconSize, 'rgba(0, 0, 0, 0.4)');
        
        if (typeof ImageManager.drawSkillIcon === 'function' && (this._item.skillIconIndex !== undefined || this._item.customIcon)) {
            var dw = iconSize - 8;
            var dh = dw;
            var dx = ix + 4;
            var dy = iy + 4;
            ImageManager.drawSkillIcon(this.contents, this._item, dx, dy, dw, dh, this.refresh.bind(this));
        } else {
            var iconIndex = this._item.iconIndex;
            var bitmap = ImageManager.loadSystem('IconSet');
            if (bitmap && bitmap.isReady()) {
                var pw = Window_Base._iconWidth;
                var ph = Window_Base._iconHeight;
                var sx = iconIndex % 16 * pw;
                var sy = Math.floor(iconIndex / 16) * ph;
                var dw = 64;
                var dh = 64;
                this.contents.blt(bitmap, sx, sy, pw, ph, ix + (iconSize-dw)/2, iy + (iconSize-dh)/2, dw, dh);
            } else if (bitmap) {
                bitmap.addLoadListener(this.refresh.bind(this));
            }
        }

        // 2. Nama Skill (Kanan Icon)
        var textX = ix + iconSize + 20;
        var textY = iy;
        this.contents.fontSize = 26;
        this.changeTextColor(this.systemColor());
        this.drawText(this._item.name, textX, textY, this.contentsWidth() - textX);
        this.resetTextColor();

        // 3. Status Grid (Bawah Nama Skill)
        this.contents.fontSize = 18;
        var gridY = textY + 40;
        var colW = Math.floor((this.contentsWidth() - textX) / 3);
        
        // Row 1
        this.drawDetailParam("Tipe", $dataSystem.skillTypes[this._item.stypeId] || 'Skill', textX, gridY, colW);
        this.drawDetailParam("Elemen", this.elementName(this._item.damage.elementId), textX + colW, gridY, colW);
        var costText = this._item.mpCost > 0 ? this._item.mpCost + " MP" : (this._item.tpCost > 0 ? this._item.tpCost + " TP" : "0");
        this.drawDetailParam("Biaya", costText, textX + colW * 2, gridY, colW);

        // Row 2
        var scopeText = this.scopeName(this._item.scope);
        this.drawDetailParam("Target", scopeText, textX, gridY + 32, colW);
        var hitText = this._item.hitType === 0 ? "Pasti Kena" : (this._item.hitType === 1 ? "Fisik" : "Magis");
        this.drawDetailParam("Jenis Serang", hitText, textX + colW, gridY + 32, colW);
        var speedText = this._item.speed >= 0 ? "+" + this._item.speed : this._item.speed;
        this.drawDetailParam("Kecepatan", speedText, textX + colW * 2, gridY + 32, colW);
    };

    Window_YureSkillDetail.prototype.drawDetailParam = function(label, value, x, y, width) {
        this.changeTextColor(this.systemColor());
        this.drawText(label + ":", x, y, width / 2);
        this.resetTextColor();
        this.drawText(value, x + width / 2, y, width / 2, 'left');
    };

    Window_YureSkillDetail.prototype.elementName = function(elementId) {
        if (elementId < 0) return "Senjata";
        if (elementId === 0) return "Tidak Ada";
        return $dataSystem.elements[elementId] || "Normal";
    };

    Window_YureSkillDetail.prototype.scopeName = function(scope) {
        switch (scope) {
            case 1: return "1 Musuh";
            case 2: return "Semua Musuh";
            case 7: return "1 Teman";
            case 8: return "Semua Teman";
            case 11: return "Diri Sendiri";
            default: return "Khusus";
        }
    };


    // --- 2.5 Window_SkillActionPopup (Pasang ke Slot, Lepas, Gunakan) ---
    function Window_SkillActionPopup() {
        this.initialize.apply(this, arguments);
    }
    Window_SkillActionPopup.prototype = Object.create(Window_Command.prototype);
    Window_SkillActionPopup.prototype.constructor = Window_SkillActionPopup;

    Window_SkillActionPopup.prototype.initialize = function() {
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.hide();
        this.deactivate();
        this._skill = null;
        this._actor = null;
        this._motionState = 'closed';
        this._motionTimer = 0;
        this._closeCallback = null;
    };

    Window_SkillActionPopup.prototype.windowWidth = function() { return 210; };
    Window_SkillActionPopup.prototype.windowHeight = function() { return this.fittingHeight(3); };

    Window_SkillActionPopup.prototype.setSkill = function(skill, actor) {
        this._skill = skill;
        this._actor = actor;
        this.refresh();
        this.height = this.windowHeight();
    };

    Window_SkillActionPopup.prototype.openWithMotion = function() {
        this._motionState = 'opening';
        this._motionTimer = 0;
        this.show();
        this.alpha = 0;
        this.scale.x = 0.8;
        this.scale.y = 0.8;
    };

    Window_SkillActionPopup.prototype.closeWithMotion = function(callback) {
        this._motionState = 'closing';
        this._motionTimer = 0;
        this._closeCallback = callback || null;
        this.deactivate();
    };

    Window_SkillActionPopup.prototype.update = function() {
        Window_Command.prototype.update.call(this);
        if (this._motionState === 'opening') {
            this._motionTimer++;
            var t = Math.min(this._motionTimer / 8, 1.0);
            var s = 0.8 + 0.2 * (Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1);
            if (t >= 1.0) s = 1.0;
            this.scale.x = s;
            this.scale.y = s;
            this.alpha = t;
            if (t >= 1.0) {
                this._motionState = 'open';
                this.scale.x = 1.0;
                this.scale.y = 1.0;
                this.alpha = 1.0;
            }
        } else if (this._motionState === 'closing') {
            this._motionTimer++;
            var t = Math.min(this._motionTimer / 6, 1.0);
            var s = 1.0 - 0.15 * t;
            this.scale.x = s;
            this.scale.y = s;
            this.alpha = 1.0 - t;
            if (t >= 1.0) {
                this._motionState = 'closed';
                this.hide();
                if (this._closeCallback) {
                    var cb = this._closeCallback;
                    this._closeCallback = null;
                    cb();
                }
            }
        }
    };

    Window_SkillActionPopup.prototype.makeCommandList = function() {
        if (!this._skill || !this._actor) return;
        
        // Pilihan 1: Pasang ke Slot Battle (Selalu aktif!)
        this.addCommand("Pasang ke Slot...", 'equip', true);
        
        // Pilihan 2: Lepas dari Slot (Hanya aktif jika sudah terpasang)
        var isEquipped = false;
        if (this._actor.pethogsEquippedSkills) {
            isEquipped = this._actor.pethogsEquippedSkills().indexOf(this._skill.id) !== -1;
        }
        this.addCommand("Lepas dari Slot", 'unequip', isEquipped);

        // Pilihan 3: Gunakan di Menu (Hanya aktif jika skill bisa digunakan di luar pertempuran seperti Heal)
        var isUsable = this._actor.canUse(this._skill);
        this.addCommand("Gunakan di Menu", 'use', isUsable);
    };


    // --- 2.6 Window_SkillSlotPopup (Pilih Slot 1 s/d Slot 5) ---
    function Window_SkillSlotPopup() {
        this.initialize.apply(this, arguments);
    }
    Window_SkillSlotPopup.prototype = Object.create(Window_Command.prototype);
    Window_SkillSlotPopup.prototype.constructor = Window_SkillSlotPopup;

    Window_SkillSlotPopup.prototype.initialize = function() {
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.hide();
        this.deactivate();
        this._motionState = 'closed';
        this._motionTimer = 0;
        this._closeCallback = null;
    };

    Window_SkillSlotPopup.prototype.windowWidth = function() { return 380; };
    Window_SkillSlotPopup.prototype.windowHeight = function() { return this.fittingHeight(5); };
    
    Window_SkillSlotPopup.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
        this.height = this.windowHeight();
    };

    Window_SkillSlotPopup.prototype.openWithMotion = function() {
        this._motionState = 'opening';
        this._motionTimer = 0;
        this.show();
        this.alpha = 0;
        this.scale.x = 0.8;
        this.scale.y = 0.8;
    };

    Window_SkillSlotPopup.prototype.closeWithMotion = function(callback) {
        this._motionState = 'closing';
        this._motionTimer = 0;
        this._closeCallback = callback || null;
        this.deactivate();
    };

    Window_SkillSlotPopup.prototype.update = function() {
        Window_Command.prototype.update.call(this);
        if (this._motionState === 'opening') {
            this._motionTimer++;
            var t = Math.min(this._motionTimer / 8, 1.0);
            var s = 0.8 + 0.2 * (Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1);
            if (t >= 1.0) s = 1.0;
            this.scale.x = s;
            this.scale.y = s;
            this.alpha = t;
            if (t >= 1.0) {
                this._motionState = 'open';
                this.scale.x = 1.0;
                this.scale.y = 1.0;
                this.alpha = 1.0;
            }
        } else if (this._motionState === 'closing') {
            this._motionTimer++;
            var t = Math.min(this._motionTimer / 6, 1.0);
            var s = 1.0 - 0.15 * t;
            this.scale.x = s;
            this.scale.y = s;
            this.alpha = 1.0 - t;
            if (t >= 1.0) {
                this._motionState = 'closed';
                this.hide();
                if (this._closeCallback) {
                    var cb = this._closeCallback;
                    this._closeCallback = null;
                    cb();
                }
            }
        }
    };

    Window_SkillSlotPopup.prototype.makeCommandList = function() {
        if (!this._actor || !this._actor.pethogsEquippedSkills) return;
        
        var equipped = this._actor.pethogsEquippedSkills(); // array length 5
        for (var i = 0; i < 5; i++) {
            var skillId = equipped[i];
            var name = "Slot " + (i + 1) + ": ";
            if (skillId > 0) {
                var skill = $dataSkills[skillId];
                if (skill) {
                    name += skill.name;
                } else {
                    name += "Skill #" + skillId;
                }
            } else {
                name += "(Kosong)";
            }
            this.addCommand(name, 'ok');
        }
    };

})();
