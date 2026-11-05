//=============================================================================
// Yure_BattleChainBuilder.js
//=============================================================================

/*:
 * @plugindesc [v3.0] Multi-Turn Pre-Queue Combo Prompt
 * @author Yure Party Team
 *
 * @help
 * Menampilkan window pilihan combo di giliran berikutnya apabila serangan
 * sebelumnya berhasil mengenai target. Memungkinkan pemain menyusun kombo 
 * sebelum eksekusi dimulai.
 */

(function() {

    // ============================================================================
    // Window_BattleChainPrompt (Cute Anime Action Selector Popup)
    // ============================================================================
    function Window_BattleChainPrompt() {
        this.initialize.apply(this, arguments);
    }
    Window_BattleChainPrompt.prototype = Object.create(Window_Command.prototype);
    Window_BattleChainPrompt.prototype.constructor = Window_BattleChainPrompt;

    Window_BattleChainPrompt.prototype.initialize = function() {
        this._actor = null;
        this._baseSkillId = 0;
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.opacity = 0;
        // Hilangkan frame bawaan RPG Maker, kita gambar sendiri
        this.backOpacity = 0;
        this.hide();
        this.deactivate();
    };

    Window_BattleChainPrompt.prototype.windowWidth = function() {
        return 260;
    };

    Window_BattleChainPrompt.prototype.windowHeight = function() {
        return 168;
    };

    Window_BattleChainPrompt.prototype.standardPadding = function() {
        return 10;
    };

    Window_BattleChainPrompt.prototype.setup = function(actor, baseSkillId) {
        this._actor = actor;
        this._baseSkillId = baseSkillId;

        var w = this.windowWidth();
        var h = this.windowHeight();

        // Skill slot window berada di y=527 (dari Pethogs_EngineCore)
        // Popup harus tepat DI ATAS slot window
        var slotWindowY = 527;
        var finalX = 224; // Rata kiri dengan slot window (x=224)
        var finalY = slotWindowY - h - 6;

        // Tidak pakai pivot
        this.pivot.x = 0;
        this.pivot.y = 0;
        this.scale.x = 1.0;
        this.scale.y = 1.0;
        this.x = finalX;
        this.y = slotWindowY; // Mulai dari batas atas slot (tepat bawah)
        this.alpha = 0;

        this.refresh();
        this.select(0);
        this.show();
        this.activate();

        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this);
            // Slide UP dari batas slot ke posisi di atasnya
            window.anime({
                targets: this,
                y: finalY,
                alpha: 1.0,
                duration: 340,
                easing: 'easeOutBack'
            });
        } else {
            this.x = finalX;
            this.y = finalY;
            this.alpha = 1.0;
        }
    };

    Window_BattleChainPrompt.prototype.makeCommandList = function() {
        this.addCommand("⚡ Gunakan Langsung", 'use');
        this.addCommand("🔗 Susun Combo Chain", 'combo');
    };

    Window_BattleChainPrompt.prototype.itemRect = function(index) {
        var rect = Window_Command.prototype.itemRect.call(this, index);
        rect.y += 28; // Ruang untuk header
        rect.height = 52;
        return rect;
    };

    // Override drawItem: gambar highlight cursor sendiri agar selalu terlihat
    Window_BattleChainPrompt.prototype.drawItem = function(index) {
        var rect = this.itemRect(index);
        var ctx = this.contents._context;
        var isSelected = (this.index() === index);

        ctx.save();
        if (isSelected) {
            // Highlight bar aktif — pink lembut
            ctx.fillStyle = 'rgba(244, 114, 182, 0.28)';
            var rr = 7;
            ctx.beginPath();
            ctx.moveTo(rect.x + rr, rect.y + 2);
            ctx.lineTo(rect.x + rect.width - rr, rect.y + 2);
            ctx.quadraticCurveTo(rect.x + rect.width, rect.y + 2, rect.x + rect.width, rect.y + 2 + rr);
            ctx.lineTo(rect.x + rect.width, rect.y + rect.height - 2 - rr);
            ctx.quadraticCurveTo(rect.x + rect.width, rect.y + rect.height - 2, rect.x + rect.width - rr, rect.y + rect.height - 2);
            ctx.lineTo(rect.x + rr, rect.y + rect.height - 2);
            ctx.quadraticCurveTo(rect.x, rect.y + rect.height - 2, rect.x, rect.y + rect.height - 2 - rr);
            ctx.lineTo(rect.x, rect.y + 2 + rr);
            ctx.quadraticCurveTo(rect.x, rect.y + 2, rect.x + rr, rect.y + 2);
            ctx.closePath();
            ctx.fill();
            // Border garis kiri tebal sebagai cursor indicator
            ctx.fillStyle = '#f472b6';
            ctx.fillRect(rect.x, rect.y + 6, 3, rect.height - 12);
            // Border outline tipis
            ctx.strokeStyle = 'rgba(244, 114, 182, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();

        // Teks command
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.contents.fontSize = 14;
        var textColor = isSelected ? '#ffffff' : 'rgba(220, 180, 240, 0.8)';
        this.changeTextColor(textColor);
        this.drawText(this.commandName(index), rect.x + 12, rect.y + 6, rect.width - 12, 'left');
        this.resetTextColor();
        this.changePaintOpacity(true);
    };

    // Update tiap frame: refresh item saat indeks berubah agar highlight update real-time
    Window_BattleChainPrompt.prototype._lastDrawnIndex = -1;

    Window_BattleChainPrompt.prototype.update = function() {
        Window_Command.prototype.update.call(this);
        // Redraw items kalau index berubah
        if (this.active && this.visible && this.index() !== this._lastDrawnIndex) {
            this._lastDrawnIndex = this.index();
            this._redrawItems();
        }
    };

    Window_BattleChainPrompt.prototype._redrawItems = function() {
        var ctx = this.contents._context;
        var w = this.contentsWidth();
        var h = this.contentsHeight();
        // Clear area item saja (di bawah header), lalu redraw
        ctx.save();
        ctx.clearRect(0, 28, w, h - 28);
        ctx.fillStyle = 'rgba(32, 16, 44, 0.97)';
        ctx.fillRect(0, 28, w, h - 28);
        ctx.restore();
        this.drawAllItems();
    };

    Window_BattleChainPrompt.prototype.refresh = function() {
        this._lastDrawnIndex = -1;
        this.clearCommandList();
        this.makeCommandList();
        this.createContents();

        var w = this.contentsWidth();
        var h = this.contentsHeight();
        var ctx = this.contents._context;

        // Warm Deep Purple Background (rounded)
        ctx.save();
        var r = 12;
        ctx.beginPath();
        ctx.moveTo(r, 0); ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r); ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h); ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r); ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();
        ctx.fillStyle = 'rgba(32, 16, 44, 0.97)';
        ctx.fill();

        // Pink outer border
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Gold inner border
        ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(4, 4, w - 8, h - 8);

        // Header Badge
        ctx.fillStyle = 'rgba(244, 114, 182, 0.18)';
        ctx.fillRect(8, 4, w - 16, 20);
        ctx.restore();

        // Header text
        this.contents.fontSize = 12;
        this.changeTextColor('#f472b6');
        this.drawText("✨ PILIH CARA AKSI ✨", 0, 5, w, 'center');
        this.resetTextColor();

        this.drawAllItems();
    };

    // ============================================================================
    // Window_BattleChainBuilder (Cute Anime Combo Queue Deck)
    // ============================================================================
    function Window_BattleChainBuilder() {
        this.initialize.apply(this, arguments);
    }
    Window_BattleChainBuilder.prototype = Object.create(Window_Selectable.prototype);
    Window_BattleChainBuilder.prototype.constructor = Window_BattleChainBuilder;

    Window_BattleChainBuilder.prototype.initialize = function() {
        var width = 290;
        var height = 270;
        Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
        this.opacity = 0;
        this._actor = null;
        this._baseSkill = null;
        this._pendingQueue = [];
        this._simulatedCp = 0;
        this._data = [];
        this.hide();
    };

    Window_BattleChainBuilder.prototype.standardPadding = function() {
        return 8;
    };

    Window_BattleChainBuilder.prototype.setup = function(actor, baseSkill) {
        this._actor = actor;
        this._baseSkill = baseSkill;
        this._pendingQueue = [];
        this._simulatedCp = typeof actor.getCP === 'function' ? actor.getCP() : 3;

        var w = this.width;
        var h = this.height;

        // Tepat di atas slot window (y=527)
        var slotWindowY = 527;
        var finalX = 224; // Rata kiri dengan slot window
        var finalY = slotWindowY - h - 6;

        this.pivot.x = 0;
        this.pivot.y = 0;
        this.scale.x = 1.0;
        this.scale.y = 1.0;
        this.x = finalX;
        this.y = slotWindowY; // Mulai dari batas atas slot
        this.alpha = 0;

        this.refresh();
        this.select(0);
        this.show();
        this.activate();

        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this);
            window.anime({
                targets: this,
                y: finalY,
                alpha: 1.0,
                duration: 370,
                easing: 'easeOutBack'
            });
        } else {
            this.x = finalX;
            this.y = finalY;
            this.alpha = 1.0;
        }
    };

    Window_BattleChainBuilder.prototype.maxItems = function() {
        return this._data ? this._data.length : 0;
    };

    Window_BattleChainBuilder.prototype.item = function() {
        return this._data && this.index() >= 0 ? this._data[this.index()] : null;
    };

    Window_BattleChainBuilder.prototype.itemRect = function(index) {
        var rect = Window_Selectable.prototype.itemRect.call(this, index);
        rect.y += 28; // Ruang untuk header
        rect.height = 34;
        return rect;
    };

    Window_BattleChainBuilder.prototype.makeItemList = function() {
        this._data = [];
        if (this._actor && this._actor.pethogsEquippedSkills) {
            var equipped = this._actor.pethogsEquippedSkills();
            for (var i = 0; i < equipped.length; i++) {
                var skillId = equipped[i];
                if (skillId > 0) {
                    var skill = $dataSkills[skillId];
                    if (skill) {
                        this._data.push(skill);
                    }
                }
            }
        }
        this._data.push({ name: "⚔️ Eksekusi Serangan Combo", isExecute: true });
    };

    Window_BattleChainBuilder.prototype.refresh = function() {
        this.makeItemList();
        this.createContents();
        
        var w = this.contentsWidth();
        var h = this.contentsHeight();
        var ctx = this.contents._context;

        // Warm Deep Purple / Maroon Background
        ctx.save();
        var r = 12;
        ctx.beginPath();
        ctx.moveTo(r, 0); ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r); ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h); ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r); ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();

        ctx.fillStyle = 'rgba(32, 16, 44, 0.97)';
        ctx.fill();

        // Cute Pink Rounded Outline
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Header Background
        ctx.fillStyle = 'rgba(244, 114, 182, 0.15)';
        ctx.fillRect(8, 4, w - 16, 22);
        ctx.restore();

        // Header Title
        this.contents.fontSize = 12;
        this.changeTextColor('#f472b6');
        this.drawText("✨ SUSUN COMBO SKILL ✨", 12, 4, w - 90, 'left');

        // CP Counter Badge
        this.changeTextColor('#ffd166');
        this.drawText("⚡ CP: " + this._simulatedCp, w - 80, 4, 70, 'right');
        this.resetTextColor();

        this.drawAllItems();
    };

    Window_BattleChainBuilder.prototype._lastBuilderIndex = -1;

    Window_BattleChainBuilder.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        if (this.active && this.visible && this.index() !== this._lastBuilderIndex) {
            this._lastBuilderIndex = this.index();
            this._redrawItems();
        }
    };

    Window_BattleChainBuilder.prototype._redrawItems = function() {
        var ctx = this.contents._context;
        var w = this.contentsWidth();
        var h = this.contentsHeight();
        ctx.save();
        ctx.clearRect(0, 28, w, h - 28);
        ctx.fillStyle = 'rgba(32, 16, 44, 0.97)';
        ctx.fillRect(0, 28, w, h - 28);
        ctx.restore();
        this.drawAllItems();
    };

    Window_BattleChainBuilder.prototype.drawItem = function(index) {
        var item = this._data[index];
        if (item) {
            var rect = this.itemRect(index);
            var ctx = this.contents._context;
            var isSelected = (this.index() === index);

            if (item.isExecute) {
                // Eksekusi button — minty green + cursor jika dipilih
                ctx.save();
                var bgColor = isSelected
                    ? 'rgba(52, 211, 153, 0.42)'
                    : 'rgba(52, 211, 153, 0.20)';
                ctx.fillStyle = bgColor;
                ctx.fillRect(rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 4);
                ctx.strokeStyle = isSelected ? '#34d399' : 'rgba(52, 211, 153, 0.5)';
                ctx.lineWidth = isSelected ? 2.5 : 1.5;
                ctx.strokeRect(rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 4);
                if (isSelected) {
                    ctx.fillStyle = '#34d399';
                    ctx.fillRect(rect.x + 2, rect.y + 6, 3, rect.height - 12);
                }
                ctx.restore();

                this.contents.fontSize = 13;
                this.changeTextColor(isSelected ? '#ffffff' : '#34d399');
                this.drawText(item.name, rect.x, rect.y + 4, rect.width, 'center');
                this.resetTextColor();
            } else {
                var skill = item;
                var lastSkill = this._pendingQueue.length > 0 ? this._pendingQueue[this._pendingQueue.length - 1] : this._baseSkill;
                var isValid = false;

                if (this._actor._constellationPaths && this._actor._constellationPaths[lastSkill.id]) {
                    var paths = this._actor._constellationPaths[lastSkill.id];
                    if (Array.isArray(paths) && paths.includes(skill.id)) {
                        isValid = true;
                    }
                }
                if (!isValid && lastSkill && lastSkill.note) {
                    var m = lastSkill.note.match(/<chain:\s*(\d+)>/i);
                    if (m && parseInt(m[1]) === skill.id) isValid = true;
                }
                if (!isValid && (!this._actor._constellationPaths || !this._actor._constellationPaths[lastSkill.id] || this._actor._constellationPaths[lastSkill.id].length === 0)) {
                    isValid = true;
                }

                var cpCost = 1;
                if (this._simulatedCp < cpCost) isValid = false;

                // Item card background — pink highlight jika dipilih
                ctx.save();
                if (isSelected && isValid) {
                    ctx.fillStyle = 'rgba(244, 114, 182, 0.22)';
                } else if (isValid) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                } else {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
                }
                ctx.fillRect(rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 4);

                ctx.strokeStyle = isSelected
                    ? 'rgba(244, 114, 182, 0.7)'
                    : (isValid ? 'rgba(244, 114, 182, 0.25)' : 'rgba(255, 255, 255, 0.06)');
                ctx.lineWidth = isSelected ? 1.5 : 1;
                ctx.strokeRect(rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 4);

                // Cursor bar kiri
                if (isSelected) {
                    ctx.fillStyle = '#f472b6';
                    ctx.fillRect(rect.x + 2, rect.y + 5, 3, rect.height - 10);
                }
                ctx.restore();

                this.changePaintOpacity(isValid);
                this.drawIcon(skill.iconIndex, rect.x + 8, rect.y + 1);

                this.contents.fontSize = 13;
                if (isSelected) {
                    this.changeTextColor(isValid ? '#ffffff' : '#94a3b8');
                } else {
                    this.changeTextColor(isValid ? 'rgba(230, 200, 240, 0.85)' : '#94a3b8');
                }
                this.drawText(skill.name, rect.x + 44, rect.y + 4, rect.width - 84, 'left');

                // Queue count badge
                var count = 0;
                for (var i = 0; i < this._pendingQueue.length; i++) {
                    if (this._pendingQueue[i].id === skill.id) count++;
                }
                if (count > 0) {
                    this.contents.fontSize = 12;
                    this.changeTextColor('#ffd166');
                    this.drawText("x" + count, rect.x, rect.y + 4, rect.width - 8, 'right');
                }

                this.changePaintOpacity(1);
            }
        }
    };

    Window_BattleChainBuilder.prototype.isCurrentItemEnabled = function() {
        var item = this.item();
        if (!item) return false;
        if (item.isExecute) return true;
        
        var lastSkill = this._pendingQueue.length > 0 ? this._pendingQueue[this._pendingQueue.length - 1] : this._baseSkill;
        var isValid = false;
        if (this._actor._constellationPaths && this._actor._constellationPaths[lastSkill.id]) {
            var paths = this._actor._constellationPaths[lastSkill.id];
            if (Array.isArray(paths) && paths.includes(item.id)) {
                isValid = true;
            }
        }
        if (!isValid && lastSkill && lastSkill.note) {
            var m = lastSkill.note.match(/<chain:\s*(\d+)>/i);
            if (m && parseInt(m[1]) === item.id) isValid = true;
        }
        if (!isValid && (!this._actor._constellationPaths || !this._actor._constellationPaths[lastSkill.id] || this._actor._constellationPaths[lastSkill.id].length === 0)) {
            isValid = true;
        }
        
        var cpCost = 1;
        if (this._simulatedCp < cpCost) return false;
        
        return isValid;
    };

    // ============================================================================
    // Scene_Battle Hooks
    // ============================================================================
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        
        // Window Prompt (Use / Combo)
        this._chainPromptWindow = new Window_BattleChainPrompt();
        this._chainPromptWindow.setHandler('use', this.onChainPromptUse.bind(this));
        this._chainPromptWindow.setHandler('combo', this.onChainPromptCombo.bind(this));
        this._chainPromptWindow.setHandler('cancel', this.onChainPromptCancel.bind(this));
        this.addWindow(this._chainPromptWindow);
        
        // Window Builder (Queue Skills)
        this._chainBuilderWindow = new Window_BattleChainBuilder();
        this._chainBuilderWindow.setHandler('ok', this.onChainBuilderOk.bind(this));
        this._chainBuilderWindow.setHandler('cancel', this.onChainBuilderCancel.bind(this));
        this.addWindow(this._chainBuilderWindow);
    };

    var _Scene_Battle_isAnyInputWindowActive_Chain = Scene_Battle.prototype.isAnyInputWindowActive;
    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        return _Scene_Battle_isAnyInputWindowActive_Chain.call(this) ||
               (this._chainPromptWindow && this._chainPromptWindow.active) ||
               (this._chainBuilderWindow && this._chainBuilderWindow.active);
    };

    // Override the slot OK behavior
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
        this._pethogsSkillSlots.deselect();
        this._pethogsSkillSlots.deactivate();
    } else {
        var skillId = actor.pethogsEquippedSkills()[index - 1];
        if (skillId > 0 && actor.canUse($dataSkills[skillId])) {
            var isUnlocked = (actor._unlockedChainSkills && actor._unlockedChainSkills.includes(skillId));
            
            var hasBranches = false;
            if (actor._constellationPaths && actor._constellationPaths[skillId]) {
                var p = actor._constellationPaths[skillId];
                if (Array.isArray(p)) hasBranches = p.some(function(id) { return id > 0; });
                else if (typeof p === 'object') hasBranches = Object.keys(p).length > 0;
            }
            if (!hasBranches && $dataSkills[skillId] && $dataSkills[skillId].note) {
                if ($dataSkills[skillId].note.match(/<chain/i)) hasBranches = true;
            }
            if (!hasBranches && actor.pethogsEquippedSkills) {
                var eq = actor.pethogsEquippedSkills();
                hasBranches = eq.some(function(id) { return id > 0 && id !== skillId; });
            }
            
            if (isUnlocked && hasBranches) {
                if (this._actorCommandWindow) {
                    this._actorCommandWindow.deactivate();
                }
                this._chainPromptWindow.setup(actor, skillId);
                this._pethogsSkillSlots.deactivate();
            } else {
                action.setSkill(skillId);
                if (action.needsSelection()) {
                    if (action.isForOpponent()) this.selectEnemySelection();
                    else this.selectActorSelection();
                } else {
                    this.selectNextCommand();
                }
                this._pethogsSkillSlots.deselect();
                this._pethogsSkillSlots.deactivate();
            }
        } else {
            SoundManager.playBuzzer(); 
            this._pethogsSkillSlots.activate(); 
            return;
        }
    }
};

Scene_Battle.prototype.onChainPromptUse = function() {
        var skillId = this._chainPromptWindow._baseSkillId;
        var action = BattleManager.inputtingAction();
        var actor = this._chainPromptWindow._actor;
        
        this._chainPromptWindow.hide();
        this._chainPromptWindow.deactivate();
        
        action.setSkill(skillId);
        
        if (action.needsSelection()) {
            if (action.isForOpponent()) this.selectEnemySelection();
            else this.selectActorSelection();
        } else {
            this.selectNextCommand();
        }
        
        this._pethogsSkillSlots.deselect();
        this._pethogsSkillSlots.deactivate();
    };

    Scene_Battle.prototype.onChainPromptCombo = function() {
        var skillId = this._chainPromptWindow._baseSkillId;
        var actor = this._chainPromptWindow._actor;
        var skill = $dataSkills[skillId];
        
        this._chainPromptWindow.hide();
        this._chainPromptWindow.deactivate();
        if (this._actorCommandWindow) {
            this._actorCommandWindow.deactivate();
        }
        if (this._pethogsSkillSlots) {
            this._pethogsSkillSlots.deactivate();
        }
        
        // Open Builder
        this._chainBuilderWindow.setup(actor, skill);
    };

    Scene_Battle.prototype.onChainPromptCancel = function() {
        this._chainPromptWindow.hide();
        this._chainPromptWindow.deactivate();
        if (this._actorCommandWindow) {
            this._actorCommandWindow.deactivate();
        }
        this._pethogsSkillSlots.show();
        this._pethogsSkillSlots.activate();
    };

    Scene_Battle.prototype.onChainBuilderOk = function() {
        var item = this._chainBuilderWindow.item();
        if (item.isExecute) {
            // Save the queue to the actor and proceed
            var actor = BattleManager.actor();
            var baseSkill = this._chainBuilderWindow._baseSkill;
            
            actor._battleChainQueue = this._chainBuilderWindow._pendingQueue.slice();
            
            var action = BattleManager.inputtingAction();
            action.setSkill(baseSkill.id);
            actor.setLastBattleSkill(baseSkill);
            
            this._chainBuilderWindow.hide();
            this._chainBuilderWindow.deactivate();
            
            if (action.needsSelection()) {
                if (action.isForOpponent()) this.selectEnemySelection();
                else this.selectActorSelection();
            } else {
                this.selectNextCommand();
            }
            
            this._pethogsSkillSlots.deselect();
            this._pethogsSkillSlots.deactivate();
        } else {
            // Add to pending queue
            var cpCost = 1;
            this._chainBuilderWindow._simulatedCp -= cpCost;
            this._chainBuilderWindow._pendingQueue.push(item);
            SoundManager.playEquip();
            this._chainBuilderWindow.refresh();
            this._chainBuilderWindow.activate();
        }
    };

    Scene_Battle.prototype.onChainBuilderCancel = function() {
        if (this._chainBuilderWindow._pendingQueue.length > 0) {
            // Undo last chained skill
            var removed = this._chainBuilderWindow._pendingQueue.pop();
            var cpCost = 1;
            this._chainBuilderWindow._simulatedCp += cpCost;
            SoundManager.playCancel();
            this._chainBuilderWindow.refresh();
            this._chainBuilderWindow.activate();
        } else {
            // Cancel entirely back to Prompt
            this._chainBuilderWindow.hide();
            this._chainBuilderWindow.deactivate();
            if (this._actorCommandWindow) {
                this._actorCommandWindow.deactivate();
            }
            if (this._pethogsSkillSlots) {
                this._pethogsSkillSlots.deactivate();
            }
            
            var actor = this._chainBuilderWindow._actor;
            var skillId = this._chainBuilderWindow._baseSkill.id;
            this._chainPromptWindow.setup(actor, skillId, this._pethogsSkillSlots.x, this._pethogsSkillSlots.y);
        }
    };

    // Override the Cancel behavior when choosing enemy targets so it goes back to ChainBuilder if they queued skills
    var _Scene_Battle_onEnemyCancel = Scene_Battle.prototype.onEnemyCancel;
    Scene_Battle.prototype.onEnemyCancel = function() {
        _Scene_Battle_onEnemyCancel.call(this);
        if (this._actorCommandWindow && this._actorCommandWindow.currentSymbol() === 'pethogs_slot') {
            var actor = BattleManager.actor();
            if (actor && actor._battleChainQueue && actor._battleChainQueue.length > 0) {
                // Return to Builder if we were in combo mode
                if (this._pethogsSkillSlots) this._pethogsSkillSlots.deactivate();
                var action = BattleManager.inputtingAction();
                var skill = action && action.item() ? $dataSkills[action.item().id] : null;
                if (skill) {
                    this._chainBuilderWindow.setup(actor, skill, this._pethogsSkillSlots.x, this._pethogsSkillSlots.y);
                    this._chainBuilderWindow._pendingQueue = actor._battleChainQueue.slice(); // Restore queue
                    var cpUsed = actor._battleChainQueue.length;
                    this._chainBuilderWindow._simulatedCp = actor.getCP() - cpUsed;
                    actor._battleChainQueue = []; // Clear temporary queue
                    this._chainBuilderWindow.refresh();
                }
            } else {
                if (this._pethogsSkillSlots) {
                    this._pethogsSkillSlots.show();
                    this._pethogsSkillSlots.activate();
                }
            }
        }
    };

    var _Scene_Battle_onActorCancel = Scene_Battle.prototype.onActorCancel;
    Scene_Battle.prototype.onActorCancel = function() {
        _Scene_Battle_onActorCancel.call(this);
        if (this._actorCommandWindow && this._actorCommandWindow.currentSymbol() === 'pethogs_slot') {
            if (this._pethogsSkillSlots) {
                this._pethogsSkillSlots.show();
                this._pethogsSkillSlots.activate();
            }
        }
    };
    
    // Reset unlocked chain skills after battle
    var _Game_Actor_onBattleEnd = Game_Actor.prototype.onBattleEnd;
    Game_Actor.prototype.onBattleEnd = function() {
        _Game_Actor_onBattleEnd.call(this);
        this._unlockedChainSkills = [];
        this._battleChainQueue = [];
    };

    // ============================================================================
    // UNIFIED FULL ACTION CHAIN COMBO LOGIC
    // ============================================================================
    var _BattleManager_startAction_ChainBuilder = BattleManager.startAction;
    BattleManager.startAction = function() {
        if (this._subject && this._subject.isActor() && this._subject._battleChainQueue && this._subject._battleChainQueue.length > 0) {
            var actor = this._subject;
            var queue = actor._battleChainQueue.slice();
            actor._battleChainQueue = []; // Clear queue so endAction won't loop individual actions
            
            var action = this._subject.currentAction();
            if (action && action.item()) {
                var fullChain = [action.item()].concat(queue);
                action._chainComboSkills = fullChain;
                action._isFullChainAction = true;
                
                // Deduct CP cost for additional skills in the chain
                var cpCost = queue.length;
                actor.payCP(cpCost);
            }
        }
        _BattleManager_startAction_ChainBuilder.call(this);
    };

    var _Game_Action_makeDamageValue_ChainBuilder = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        var baseValue = _Game_Action_makeDamageValue_ChainBuilder.call(this, target, critical);
        if (this._chainComboSkills && this._chainComboSkills.length > 1) {
            var total = baseValue;
            for (var i = 1; i < this._chainComboSkills.length; i++) {
                var extraSkill = this._chainComboSkills[i];
                var subAction = new Game_Action(this.subject());
                subAction.setSkill(extraSkill.id);
                var subVal = _Game_Action_makeDamageValue_ChainBuilder.call(subAction, target, critical);
                // Combo bonus per chain link: +15% damage bonus
                var chainBonus = 1.0 + (i * 0.15);
                total += Math.round(subVal * chainBonus);
            }
            return Math.max(1, total);
        }
        return baseValue;
    };

    var _Game_Action_apply_ChainBuilder = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply_ChainBuilder.call(this, target);
        var result = target.result();
        
        // Track hit to unlock combo chain for actor on future turns
        if (result && (result.isHit() || result.hpDamage > 0 || (this.item() && this.item().scope >= 7))) {
            if (this.subject() && this.subject().isActor()) {
                var actor = this.subject();
                if (!actor._unlockedChainSkills) actor._unlockedChainSkills = [];
                var item = this.item();
                if (item && !actor._unlockedChainSkills.includes(item.id)) {
                    actor._unlockedChainSkills.push(item.id);
                }
            }
        }

        if (this._chainComboSkills && this._chainComboSkills.length > 1) {
            for (var i = 1; i < this._chainComboSkills.length; i++) {
                var extraSkill = this._chainComboSkills[i];
                if (extraSkill.effects && extraSkill.effects.length > 0) {
                    var subAction = new Game_Action(this.subject());
                    subAction.setSkill(extraSkill.id);
                    for (var e = 0; e < extraSkill.effects.length; e++) {
                        subAction.applyItemEffect(target, extraSkill.effects[e]);
                    }
                }
            }
        }
    };
    
    // Hook endAction AFTER CTB to ensure cleanup
    var _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        if (this._subject && this._subject.isActor() && this._action && this._action.item()) {
            var item = this._action.item();
            var actor = this._subject;
            
            // Only consume unlock if this was a full chain combo action executed!
            if (this._action._isFullChainAction && actor._unlockedChainSkills) {
                var idx = actor._unlockedChainSkills.indexOf(item.id);
                if (idx !== -1) actor._unlockedChainSkills.splice(idx, 1);
            }
            
            // --- QTE REFUND CP HOOK ---
            if (this._action._yureQteSuccess === true && item.note && item.note.match(/<qte_refund_cp:\s*true>/i)) {
                actor.gainCP(1);
                this._action._yureQteSuccess = null;
            }
            
            // --- ADD CP & RESERVE CP HOOK ---
            if (item.note) {
                var addCpMatch = item.note.match(/<add_cp:\s*(\d+)>/i);
                if (addCpMatch) {
                    var cpToAdd = parseInt(addCpMatch[1]);
                    if (cpToAdd > 0) actor.gainCP(cpToAdd);
                }
                
                var reserveCpMatch = item.note.match(/<reserve_cp:\s*([\w]+)>/i);
                if (reserveCpMatch) {
                    var mode = reserveCpMatch[1].toLowerCase();
                    if (!isNaN(mode)) {
                        var amountToReserve = parseInt(mode);
                        var currentCp = actor.getCP();
                        var actualTaken = Math.min(amountToReserve, currentCp);
                        if (actualTaken > 0) {
                            actor.payCP(actualTaken);
                            actor._nextTurnAllInCp = (actor._nextTurnAllInCp || 0) + actualTaken;
                        }
                    } else if (mode === 'allin_next_turn') {
                        var currentCp = actor.getCP();
                        if (currentCp > 0) {
                            actor.payCP(currentCp);
                            actor._nextTurnAllInCp = (actor._nextTurnAllInCp || 0) + currentCp;
                        }
                    } else if (mode === 'give_party') {
                        var currentCp = actor.getCP();
                        if (currentCp > 0) {
                            actor.payCP(currentCp);
                            var members = $gameParty.aliveMembers();
                            var others = members.filter(function(m) { return m !== actor; });
                            
                            if (others.length > 0) {
                                var cpPerMember = Math.max(1, Math.floor(currentCp / others.length));
                                for (var i = 0; i < others.length; i++) {
                                    if (typeof others[i].gainCP === 'function') {
                                        others[i].gainCP(cpPerMember);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // --- AUTO EXECUTE CHAIN BUILDER QUEUE (Fallback for legacy single actions) ---
            if (actor._battleChainQueue && actor._battleChainQueue.length > 0) {
                var nextItem = actor._battleChainQueue.shift();
                
                if (typeof BattleManager.executeChainSkill === 'function') {
                    BattleManager.executeChainSkill(actor, nextItem.id);
                    return;
                }
            }
        }
        
        // Reset chain flag saat giliran benar-benar berakhir
        this._isChainContinuation = false;
        BattleManager._isPromptingChain = false;
        
        // Lanjutkan ke fungsi asli (yang mengarah ke CTB endAction)
        _BattleManager_endAction.call(this);
    };
    
})();


