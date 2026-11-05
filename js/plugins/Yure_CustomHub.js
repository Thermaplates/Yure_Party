//=============================================================================
// Yure_CustomHub.js
//=============================================================================
/*:
 * @plugindesc v1.4 Custom Hub Scene MVC - FORCE LAYOUT REFRESH & BUST FIX
 * @author Antigravity
 *
 * @param --- Images ---
 * @param bg_image
 * @text Background Image
 * @dir img/menus/status/
 * @type file
 * @default HubBackground
 *
 * @param eq_layout
 * @text Equip Layout Image
 * @dir img/menus/status/
 * @type file
 * @default layoutequip
 *
 * @param op_layout
 * @text Option Layout Image
 * @dir img/menus/status/
 * @type file
 * @default optionequip
 *
 * @param --- Help Window (Panel 1) ---
 * @param ui_help_x
 * @text Help X
 * @type number
 * @default 360 * @text Help Y
 * @type number
 * @default 10 * @text Help W
 * @type number
 * @default 300 * @text Help H
 * @type number
 * @default 700 * @param --- Status Window (Panel 2) ---
 * @param ui_status_x
 * @text Status X
 * @type number
 * @default 660 * @text Status Y
 * @type number
 * @default 0
 * @param ui_status_w
 * @text Status W
 * @type number
 * @default 320 * @text Status H
 * @type number
 * @default 710 * @param ui_name_x
 * @text Status Name X
 * @type number
 * @default 0 * @text Status Name Y
 * @type number
 * @default 60 * @text Status HP X
 * @type number
 * @default 0 * @text Status HP Y
 * @type number
 * @default 100 * @text Status MP X
 * @type number
 * @default 0 * @text Status MP Y
 * @type number
 * @default 140 * @text Status TP X
 * @type number
 * @default 0 * @text Status TP Y
 * @type number
 * @default 180 * @text Status Param Start X
 * @type number
 * @default 0 * @text Status Param Start Y
 * @type number
 * @default 250 * @text Status Param Y Spacing
 * @type number
 * @default 35 * @text Bust Image X
 * @type number
 * @default 950 * @text Bust Image Y
 * @type number
 * @default 0 * @param --- Skill Slots (Panel 3) ---
 * @param ui_skill_x
 * @text Skill X
 * @type number
 * @default 980 * @text Skill Y
 * @type number
 * @default 300
 * @param ui_skill_w
 * @text Skill W
 * @type number
 * @default 290 * @text Skill H
 * @type number
 * @default 350 * @param --- Equip List (Panel 3 Overlay) ---
 * @param ui_eqlist_x
 * @text Equip List X
 * @type number
 * @default 670 * @text Equip List Y
 * @type number
 * @default 10 * @text Equip List W
 * @type number
 * @default 310 * @text Equip List H
 * @type number
 * @default 700 * @param --- Equip Slots (Cyclops Area) ---
 * @param ui_eqslots_x
 * @text Equip Slots X
 * @type number
 * @default 0
 * @param ui_eqslots_y
 * @text Equip Slots Y
 * @type number
 * @default 0
 * @param ui_eqslots_w
 * @text Equip Slots W
 * @type number
 * @default 816
 * @param ui_eqslots_h
 * @text Equip Slots H
 * @type number
 * @default 624
 * 
 * @param ui_slot1_x
 * @text Slot 1 X
 * @type number
 * @default 40
 * @param ui_slot1_y
 * @text Slot 1 Y
 * @type number
 * @default 380
 * @param ui_slot1_w
 * @text Slot 1 W
 * @type number
 * @default 60
 * @param ui_slot1_h
 * @text Slot 1 H
 * @type number
 * @default 60
 *
 * @param ui_slot2_x
 * @text Slot 2 X
 * @type number
 * @default 20 * @param ui_slot2_y
 * @text Slot 2 Y
 * @type number
 * @default 20 * @param ui_slot2_w
 * @text Slot 2 W
 * @type number
 * @default 280 * @param ui_slot2_h
 * @text Slot 2 H
 * @type number
 * @default 60
 *
 * @param ui_slot3_x
 * @text Slot 3 X
 * @type number
 * @default 90
 * @param ui_slot3_y
 * @text Slot 3 Y
 * @type number
 * @default 440
 * @param ui_slot3_w
 * @text Slot 3 W
 * @type number
 * @default 60
 * @param ui_slot3_h
 * @text Slot 3 H
 * @type number
 * @default 60
 *
 * @param ui_slot4_x
 * @text Slot 4 X
 * @type number
 * @default 40
 * @param ui_slot4_y
 * @text Slot 4 Y
 * @type number
 * @default 500
 * @param ui_slot4_w
 * @text Slot 4 W
 * @type number
 * @default 60
 * @param ui_slot4_h
 * @text Slot 4 H
 * @type number
 * @default 60
 *
 * @param ui_slot5_x
 * @text Slot 5 X
 * @type number
 * @default 140
 * @param ui_slot5_y
 * @text Slot 5 Y
 * @type number
 * @default 500
 * @param ui_slot5_w
 * @text Slot 5 W
 * @type number
 * @default 60
 * @param ui_slot5_h
 * @text Slot 5 H
 * @type number
 * @default 60
 * @param ui_slot6_x
 * @text Slot 6 X
 * @type number
 * @default 225
 *
 * @param ui_slot6_y
 * @text Slot 6 Y
 * @type number
 * @default 600
 *
 * @param ui_slot6_w
 * @text Slot 6 W
 * @type number
 * @default 60
 *
 * @param ui_slot6_h
 * @text Slot 6 H
 * @type number
 * @default 60
 *
 * @param ui_slot7_x
 * @text Slot 7 X
 * @type number
 * @default 130
 *
 * @param ui_slot7_y
 * @text Slot 7 Y
 * @type number
 * @default 300
 *
 * @param ui_slot7_w
 * @text Slot 7 W
 * @type number
 * @default 60
 *
 * @param ui_slot7_h
 * @text Slot 7 H
 * @type number
 * @default 60
 *
 * @param ui_slot8_x
 * @text Slot 8 X
 * @type number
 * @default 130
 *
 * @param ui_slot8_y
 * @text Slot 8 Y
 * @type number
 * @default 300
 *
 * @param ui_slot8_w
 * @text Slot 8 W
 * @type number
 * @default 60
 *
 * @param ui_slot8_h
 * @text Slot 8 H
 * @type number
 * @default 60

 *
 * @help
 * ============================================================================
 * Yure Custom Hub - V1.4
 * ============================================================================
 * - Memaksa Layout Reset agar bug cache MV tidak menahan layout lama.
 * - Bust menggunakan Face bawaan aktor secara akurat.
 */

(function() {
    var parameters = PluginManager.parameters('Yure_CustomHub');

function getHubParam(id, label, def) {
    if (parameters[id] !== undefined && parameters[id] !== '') return Number(parameters[id]);
    if (parameters[label] !== undefined && parameters[label] !== '') return Number(parameters[label]);
    return def;
}
    
    // Membaca parameter baru (menggunakan nama internal baru agar cache MV ter-reset)
    var bgImage = String(parameters['bg_image'] || '');
    var equipLayoutImg = String(parameters['eq_layout'] || '');
    var optionLayoutImg = String(parameters['op_layout'] || '');

    ImageManager.loadYureStatus = function(filename) {
        return this.loadBitmap('img/menus/status/', filename, 0, true);
    };
    ImageManager.loadYureFaces = function(filename) {
        return this.loadBitmap('img/menus/faces/faces3/', filename, 0, true);
    };
    ImageManager.loadYureSouls = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-souls/', filename, 0, true);
    };

    Window_Base.prototype.makeTransparentHub = function() {
        // [DEBUG MODE] Garis tepi dan background dinyalakan sementara untuk diatur posisinya
        this.opacity = 255;
        this.backOpacity = 150;
        if (this._windowFrameSprite) this._windowFrameSprite.visible = true;
        if (this._windowBackSprite) this._windowBackSprite.visible = true;
        if (this._downArrowSprite) this._downArrowSprite.visible = false;
        if (this._upArrowSprite) this._upArrowSprite.visible = false;
    };

    // ============================================================================
    // Window_HubCommand
    // ============================================================================
    function Window_HubCommand() {
        this.initialize.apply(this, arguments);
    }
    Window_HubCommand.prototype = Object.create(Window_HorzCommand.prototype);
    Window_HubCommand.prototype.constructor = Window_HubCommand;

    Window_HubCommand.prototype.initialize = function(x, y) {
        Window_HorzCommand.prototype.initialize.call(this, x, y);
        this.makeTransparentHub();
        this.hide(); 
    };

    Window_HubCommand.prototype.windowWidth = function() {
        return 400;
    };

    Window_HubCommand.prototype.maxCols = function() {
        return 2;
    };

    Window_HubCommand.prototype.select = function(index) {
        Window_HorzCommand.prototype.select.call(this, index);
        if (typeof SceneManager !== 'undefined' && SceneManager._scene && SceneManager._scene instanceof Scene_CustomHub) {
            SceneManager._scene.updateCommandSelection();
        }
    };

    Window_HubCommand.prototype.makeCommandList = function() {
        this.addCommand("Equip", 'equip');
        this.addCommand("Skill", 'skill');
    };

    // ============================================================================
    // Window_FlexHelp
    // ============================================================================
    function Window_FlexHelp() {
        this.initialize.apply(this, arguments);
    }
    Window_FlexHelp.prototype = Object.create(Window_Help.prototype);
    Window_FlexHelp.prototype.constructor = Window_FlexHelp;

    Window_FlexHelp.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._text = '';
        this.makeTransparentHub();
    };

    Window_FlexHelp.prototype.setItem = function(item) {
        this._item = item;
        this.refresh();
    };

    Window_FlexHelp.prototype.refresh = function() {
        this.contents.clear();
        var item = this._item;
        if (!item) return;

        // Logo & Name
        this.drawIcon(item.iconIndex, 0, 0);
        this.resetTextColor();
        
        // Auto scale name text if it's too long
        this.contents.fontSize = 24;
        var nameW = this.textWidth(item.name);
        var maxNameW = this.contentsWidth() - 40;
        if (nameW > maxNameW && maxNameW > 0) {
            this.contents.fontSize = Math.floor(24 * (maxNameW / nameW));
            if (this.contents.fontSize < 14) this.contents.fontSize = 14;
        }
        this.drawText(item.name, 40, 0, maxNameW);

        // Description with word wrap
        this.contents.fontSize = 20;
        var desc = item.description || '';
        var words = desc.split(' ');
        var line = '';
        var currentY = 36;
        for (var w = 0; w < words.length; w++) {
            var testLine = line + (line ? ' ' : '') + words[w];
            // Simple check without control chars
            var cleanLine = testLine.replace(/\\x1bC\\[\\d+\\]/gi, '');
            if (this.textWidth(cleanLine) > this.contentsWidth() && line !== '') {
                this.drawTextEx(line, 0, currentY);
                line = words[w];
                currentY += this.lineHeight();
            } else {
                line = testLine;
            }
        }
        if (line) {
            this.drawTextEx(line, 0, currentY);
            currentY += this.lineHeight();
        }

        // Stats
        var y = currentY + 8;
        this.contents.fontSize = 18;
        
        if (DataManager.isWeapon(item) || DataManager.isArmor(item) || item.isEmptySlot) {
            var paramNames = [TextManager.param(0), TextManager.param(1), TextManager.param(2), TextManager.param(3), TextManager.param(4), TextManager.param(5), TextManager.param(6), TextManager.param(7)];
            
            // If window is very narrow, use 1 column instead of 2
            var cols = this.contentsWidth() < 250 ? 1 : 2;
            var colWidth = this.contentsWidth() / cols;
            var drawIdx = 0;
            
            for (var i = 0; i < 8; i++) {
                if (item.params[i] !== 0) {
                    var px = (drawIdx % cols) * colWidth;
                    var py = y + Math.floor(drawIdx / cols) * 24;
                    this.changeTextColor(this.systemColor());
                    this.drawText(paramNames[i], px, py, colWidth/2);
                    this.resetTextColor();
                    var sign = item.params[i] > 0 ? '+' : '';
                    this.drawText(sign + item.params[i], px + colWidth/2, py, colWidth/2 - 10, 'right');
                    drawIdx++;
                }
            }
        } else if (DataManager.isSkill(item) || (DataManager.isItem(item) && !item.isEmptySlot)) {
            // Draw MP Cost, TP Cost, etc for skills
            if (item.mpCost > 0) {
                this.changeTextColor(this.mpCostColor());
                this.drawText(TextManager.mpA + " Cost: " + item.mpCost, 0, y, this.contentsWidth());
                y += 24;
            }
            if (item.tpCost > 0) {
                this.changeTextColor(this.tpCostColor());
                this.drawText(TextManager.tpA + " Cost: " + item.tpCost, 0, y, this.contentsWidth());
                y += 24;
            }
        }
        
        this.contents.fontSize = this.standardFontSize();
    };

    // ============================================================================
    // Window_StatusParam
    // ============================================================================
    function Window_StatusParam() {
        this.initialize.apply(this, arguments);
    }
    Window_StatusParam.prototype = Object.create(Window_Base.prototype);
    Window_StatusParam.prototype.constructor = Window_StatusParam;

    Window_StatusParam.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.makeTransparentHub();
        this._actor = null;
    };

    Window_StatusParam.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
    };

    Window_StatusParam.prototype.refresh = function() {
        this.contents.clear();
        if (!this._actor) return;
        
        var nx = getHubParam('ui_name_x', 'Status Name X', 30);
        var ny = getHubParam('ui_name_y', 'Status Name Y', 60);
        
        var hx = getHubParam('ui_hp_x', 'Status HP X', 30);
        var hy = getHubParam('ui_hp_y', 'Status HP Y', 100);
        
        var mx = getHubParam('ui_mp_x', 'Status MP X', 30);
        var my = getHubParam('ui_mp_y', 'Status MP Y', 140);
        
        var tx = getHubParam('ui_tp_x', 'Status TP X', 30);
        var ty = getHubParam('ui_tp_y', 'Status TP Y', 180);
        
        var px = getHubParam('ui_param_x', 'Status Param Start X', 30);
        var py = getHubParam('ui_param_y', 'Status Param Start Y', 250);
        var pSpacing = getHubParam('ui_param_space', 'Status Param Y Spacing', 35);
        
        var bx = getHubParam('ui_bust_x', 'Bust Image X', 180);
        var by = getHubParam('ui_bust_y', 'Bust Image Y', 60);
        
        this.drawActorName(this._actor, nx, ny);
        this.drawActorHp(this._actor, hx, hy, 160);
        this.drawActorMp(this._actor, mx, my, 160);
        this.drawActorTp(this._actor, tx, ty, 160);
        
        for (var i = 0; i < 6; i++) {
            var paramId = i + 2; 
            var y = py + (i * pSpacing);
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.param(paramId), px, y, 90);
            this.resetTextColor();
            this.drawText(this._actor.param(paramId), px + 90, y, 50, 'right');
        }

        // this.drawFace(this._actor.faceName(), this._actor.faceIndex(), bx, by); // Digantikan oleh _bustSprite di Scene
    };

    // ============================================================================
    // Window_LeftSlots
    // ============================================================================
    function Window_LeftSlots() {
        this.initialize.apply(this, arguments);
    }
    Window_LeftSlots.prototype = Object.create(Window_Selectable.prototype);
    Window_LeftSlots.prototype.constructor = Window_LeftSlots;

    Window_LeftSlots.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.makeTransparentHub();
        this.opacity = 0;
        this.backOpacity = 0;
        this._actor = null;
    };

    Window_LeftSlots.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
    };

    Window_LeftSlots.prototype.maxItems = function() {
        return this._actor ? Math.min(this._actor.equipSlots().length, 8) : 0;
    };

    Window_LeftSlots.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var i = index + 1;
        
        // Defaults for up to 8 slots
        // Index 0: Souls / Weapon (Top Header Wide Slot)
        // Index 1: Anchor (Below Monster Head)
        // Index 2: Seal (Top-Left)
        // Index 3: Spirit Catalyst (Top-Right)
        // Index 4: Accessory (Bottom-Left)
        // Index 5: Accessory (Bottom-Right)
        var defaultX = [20, 40, 35, 225, 35, 225, 130, 130];
        var defaultY = [20, 380, 420, 420, 600, 600, 300, 300];
        var defaultW = [280, 60, 60, 60, 60, 60, 60, 60];
        
        var defX = defaultX[index] !== undefined ? defaultX[index] : 0;
        var defY = defaultY[index] !== undefined ? defaultY[index] : 0;
        var defW = defaultW[index] !== undefined ? defaultW[index] : 60;
        
        rect.x = getHubParam('ui_slot' + i + '_x', 'Slot ' + i + ' X', defX);
        rect.y = getHubParam('ui_slot' + i + '_y', 'Slot ' + i + ' Y', defY);
        rect.width = getHubParam('ui_slot' + i + '_w', 'Slot ' + i + ' W', defW);
        rect.height = getHubParam('ui_slot' + i + '_h', 'Slot ' + i + ' H', 60);
        return rect;
    };

    Window_LeftSlots.prototype.drawItem = function(index) {
        if (!this._actor) return;
        var item = this._actor.equips()[index];
        var rect = this.itemRect(index);
        
        if (item) {
            // Center icon vertically
            var iy = rect.y + (rect.height - Window_Base._iconHeight) / 2;
            
            if (rect.width > 100) {
                // Wide slot: Icon on left, name on right
                var ix = rect.x + 14; 
                this.drawIcon(item.iconIndex, ix, iy);
                
                this.resetTextColor();
                // Draw text starting at +64 from rect.x
                this.drawText(item.name, rect.x + 64, rect.y + (rect.height - this.lineHeight())/2, rect.width - 70, 'left');
            } else {
                // Normal square slot: Center icon horizontally
                var ix = rect.x + (rect.width - Window_Base._iconWidth) / 2;
                this.drawIcon(item.iconIndex, ix, iy);
            }
        } else if (rect.width > 100) {
            this.changeTextColor(this.systemColor());
            this.drawText("(Tidak Ada Senjata)", rect.x + 64, rect.y + (rect.height - this.lineHeight())/2, rect.width - 70, 'left');
            this.resetTextColor();
        }
    };

    Window_LeftSlots.prototype.item = function() {
        return this._actor ? this._actor.equips()[this.index()] : null;
    };

    Window_LeftSlots.prototype.updateHelp = function() {
        this.setHelpWindowItem(this.item());
    };

    // ============================================================================
    // Window_SkillSlots
    // ============================================================================
    function Window_SkillSlots() {
        this.initialize.apply(this, arguments);
    }
    Window_SkillSlots.prototype = Object.create(Window_Selectable.prototype);
    Window_SkillSlots.prototype.constructor = Window_SkillSlots;

    Window_SkillSlots.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.makeTransparentHub();
        this._actor = null;
        this._skills = [];
    };

    Window_SkillSlots.prototype.setActor = function(actor) {
        this._actor = actor;
        this.makeItemList();
        this.refresh();
    };

    Window_SkillSlots.prototype.makeItemList = function() {
        this._skills = [];
        if (this._actor) {
            var allSkills = this._actor.skills();
            for (var i = 0; i < 5; i++) {
                if (allSkills[i]) {
                    this._skills.push(allSkills[i]);
                } else {
                    this._skills.push(null);
                }
            }
        }
    };

    Window_SkillSlots.prototype.maxItems = function() {
        return 5;
    };

    Window_SkillSlots.prototype.itemHeight = function() {
        return 48; 
    };

    Window_SkillSlots.prototype.drawItem = function(index) {
        var skill = this._skills[index];
        var rect = this.itemRectForText(index);
        if (skill) {
            this.drawIcon(skill.iconIndex, rect.x, rect.y + 8);
            this.drawText(skill.name, rect.x + Window_Base._iconWidth + 10, rect.y + 4, rect.width - Window_Base._iconWidth - 10);
        } else {
            this.drawText("-", rect.x + 40, rect.y + 4, rect.width);
        }
    };

    Window_SkillSlots.prototype.item = function() {
        return this._skills[this.index()];
    };

    Window_SkillSlots.prototype.updateHelp = function() {
        this.setHelpWindowItem(this.item());
    };

    // ============================================================================
    // Window_HubEquipList
    // ============================================================================
    function Window_HubEquipList() {
        this.initialize.apply(this, arguments);
    }
    Window_HubEquipList.prototype = Object.create(Window_ItemList.prototype);
    Window_HubEquipList.prototype.constructor = Window_HubEquipList;

    Window_HubEquipList.prototype.initialize = function(x, y, width, height) {
        Window_ItemList.prototype.initialize.call(this, x, y, width, height);
        this.makeTransparentHub();
        this._actor = null;
        this._slotId = 0;
        this.hide(); 
    };

    Window_HubEquipList.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
            this.resetScroll();
        }
    };

    Window_HubEquipList.prototype.setSlotId = function(slotId) {
        if (this._slotId !== slotId) {
            this._slotId = slotId;
            this.refresh();
            this.resetScroll();
        }
    };

    Window_HubEquipList.prototype.includes = function(item) {
        if (item === null) {
            return true;
        }
        if (this._slotId < 0 || item.etypeId !== this._actor.equipSlots()[this._slotId]) {
            return false;
        }
        return this._actor.canEquip(item);
    };

    Window_HubEquipList.prototype.isEnabled = function(item) {
        return true;
    };

    Window_HubEquipList.prototype.makeItemList = function() {
        this._data = $gameParty.equipItems().filter(function(item) {
            return this.includes(item);
        }, this);
        if (this.includes(null)) {
            this._data.push(null);
        }
    };

    Window_HubEquipList.prototype.maxCols = function() {
        return 1; 
    };

    // ============================================================================
    // Scene_CustomHub
    // ============================================================================
    function Scene_CustomHub() {
        this.initialize.apply(this, arguments);
    }
    Scene_CustomHub.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_CustomHub.prototype.constructor = Scene_CustomHub;

    Scene_CustomHub.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
        this._introProgress = 0;
        this._introDuration = 16;
        this._animTimer = 0;
    };

    Scene_CustomHub.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        
        if (typeof $gameSystem !== 'undefined') {
            this._yurePreviousHud = $gameSystem._yureHudHidden;
            $gameSystem._yureHudHidden = true;
        }
        
        var hX = getHubParam('ui_help_x', 'Help X', 360);
        var hY = getHubParam('ui_help_y', 'Help Y', 10);
        var hW = Math.min(Math.max(getHubParam('ui_help_w', 'Help W', 300), 10), 4000);
        var hH = Math.min(Math.max(getHubParam('ui_help_h', 'Help H', 700), 10), 4000);
        
        var stX = getHubParam('ui_status_x', 'Status X', 0);
        var stY = getHubParam('ui_status_y', 'Status Y', 0);
        var stW = Math.min(Math.max(getHubParam('ui_status_w', 'Status W', 816), 10), 4000);
        var stH = Math.min(Math.max(getHubParam('ui_status_h', 'Status H', 624), 10), 4000);
        
        var skX = getHubParam('ui_skill_x', 'Skill X', 580);
        var skY = getHubParam('ui_skill_y', 'Skill Y', 300);
        var skW = Math.min(Math.max(getHubParam('ui_skill_w', 'Skill W', 220), 10), 4000);
        var skH = Math.min(Math.max(getHubParam('ui_skill_h', 'Skill H', 300), 10), 4000);
        
        var eqLX = getHubParam('ui_eqlist_x', 'Equip List X', 250);
        var eqLY = getHubParam('ui_eqlist_y', 'Equip List Y', 150);
        var eqLW = Math.min(Math.max(getHubParam('ui_eqlist_w', 'Equip List W', 330), 10), 4000);
        var eqLH = Math.min(Math.max(getHubParam('ui_eqlist_h', 'Equip List H', 450), 10), 4000);
        
        var esX = getHubParam('ui_eqslots_x', 'Equip Slots X', 0);
        var esY = getHubParam('ui_eqslots_y', 'Equip Slots Y', 0);
        var esW = Math.min(Math.max(getHubParam('ui_eqslots_w', 'Equip Slots W', 816), 10), 4000);
        var esH = Math.min(Math.max(getHubParam('ui_eqslots_h', 'Equip Slots H', 624), 10), 4000);

        this.createHubCommandWindow();
        this.createLeftSlotsWindow(esX, esY, esW, esH);
        this.createStatusParamWindow(stX, stY, stW, stH);
        this.createSkillSlotsWindow(skX, skY, skW, skH);
        this.createEquipListWindow(eqLX, eqLY, eqLW, eqLH);
        this.createFlexHelpWindow(hX, hY, hW, hH);
        this.createHubGuideBar();
        
        if (this._leftSlots && this._helpWindow) this._leftSlots.setHelpWindow(this._helpWindow);
        if (this._skillSlots && this._helpWindow) this._skillSlots.setHelpWindow(this._helpWindow);
        if (this._equipList && this._helpWindow) this._equipList.setHelpWindow(this._helpWindow);
        
        this.refreshActor();
        this.startPhase0();
        this.setupIntroPositions();
    };

    Scene_CustomHub.prototype.setupIntroPositions = function() {
        this._introProgress = 0;
        this._baseBustX = getHubParam('ui_bust_x', 'Bust Image X', 180);
        this._baseBustY = getHubParam('ui_bust_y', 'Bust Image Y', 60);

        if (this._bustSprite) {
            this._bustSprite.x = this._baseBustX + 60;
            this._bustSprite.alpha = 0;
        }
        if (this._leftSlots) {
            this._leftSlots._baseX = this._leftSlots.x;
            this._leftSlots.x = this._leftSlots._baseX - 40;
            this._leftSlots.alpha = 0;
        }
        if (this._statusWindow) {
            this._statusWindow._baseX = this._statusWindow.x;
            this._statusWindow.x = this._statusWindow._baseX + 40;
            this._statusWindow.alpha = 0;
        }
        if (this._skillSlots) {
            this._skillSlots._baseY = this._skillSlots.y;
            this._skillSlots.y = this._skillSlots._baseY + 30;
            this._skillSlots.alpha = 0;
        }
        if (this._helpWindow) {
            this._helpWindow.alpha = 0;
        }
    };

    Scene_CustomHub.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        this._animTimer++;
        this.updateIntroMotion();
        this.updateAmbientSprites();
    };

    Scene_CustomHub.prototype.updateIntroMotion = function() {
        if (this._introProgress < this._introDuration) {
            this._introProgress++;
            var t = this._introProgress / this._introDuration;
            var ease = 1 - Math.pow(1 - t, 3);

            if (this._bustSprite) {
                this._bustSprite.x = this._baseBustX + 60 * (1 - ease);
                this._bustSprite.alpha = ease;
            }
            if (this._leftSlots && this._leftSlots._baseX !== undefined) {
                this._leftSlots.x = this._leftSlots._baseX - 40 * (1 - ease);
                this._leftSlots.alpha = ease;
            }
            if (this._statusWindow && this._statusWindow._baseX !== undefined) {
                this._statusWindow.x = this._statusWindow._baseX + 40 * (1 - ease);
                this._statusWindow.alpha = ease;
            }
            if (this._skillSlots && this._skillSlots._baseY !== undefined) {
                this._skillSlots.y = this._skillSlots._baseY + 30 * (1 - ease);
                this._skillSlots.alpha = ease;
            }
            if (this._helpWindow) {
                this._helpWindow.alpha = ease;
            }
        }
    };

    Scene_CustomHub.prototype.updateAmbientSprites = function() {
        // Idle organic breathing for character bust
        if (this._bustSprite && this._introProgress >= this._introDuration) {
            var breath = Math.sin(this._animTimer * 0.04) * 3;
            this._bustSprite.y = this._baseBustY + breath;
        }
        // Floating hover and subtle glow pulse for Soul orb
        if (this._soulSprite) {
            var floatY = Math.sin(this._animTimer * 0.05) * 4;
            this._soulSprite.y = floatY;
            var pulse = 1.0 + Math.sin(this._animTimer * 0.08) * 0.025;
            this._soulSprite.scale.x = pulse;
            this._soulSprite.scale.y = pulse;
        }
    };

    Scene_CustomHub.prototype.terminate = function() {
        Scene_MenuBase.prototype.terminate.call(this);
        if (typeof $gameSystem !== 'undefined') {
            $gameSystem._yureHudHidden = this._yurePreviousHud;
        }
    };

    Scene_CustomHub.prototype.createBackground = function() {
        Scene_MenuBase.prototype.createBackground.call(this);
        
        this._bgSprite = new Sprite();
        this.addChild(this._bgSprite);
        
        this._soulSprite = new Sprite();
        this._soulSprite.x = 0; 
        this._soulSprite.y = 0;
        this.addChild(this._soulSprite);
        
        this._baseBustX = getHubParam('ui_bust_x', 'Bust Image X', 180);
        this._baseBustY = getHubParam('ui_bust_y', 'Bust Image Y', 60);

        this._bustSprite = new Sprite();
        this._bustSprite.x = this._baseBustX;
        this._bustSprite.y = this._baseBustY;
        this.addChild(this._bustSprite);

        this._optionLayoutSprite = new Sprite();
        var opt = optionLayoutImg || "Optionequip";
        this._optionLayoutSprite.bitmap = ImageManager.loadYureStatus(opt);
        this.addChild(this._optionLayoutSprite);

        this._equipLayoutSprite = new Sprite();
        var eqp = equipLayoutImg || "Layoutequip";
        this._equipLayoutSprite.bitmap = ImageManager.loadYureStatus(eqp);
        this._equipLayoutSprite.x = getHubParam('ui_eqlayout_x', 'Equip Layout X', 670);
        this._equipLayoutSprite.y = getHubParam('ui_eqlayout_y', 'Equip Layout Y', 0);
        this._equipLayoutSprite.visible = false; 
        this.addChild(this._equipLayoutSprite);
    };

    Scene_CustomHub.prototype.createHubCommandWindow = function() {
        this._commandWindow = new Window_HubCommand(0, 0);
        this._commandWindow.setHandler('equip', this.commandEquip.bind(this));
        this._commandWindow.setHandler('skill', this.commandSkill.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this._commandWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._commandWindow.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(this._commandWindow);
    };

    Scene_CustomHub.prototype.createFlexHelpWindow = function(x, y, w, h) {
        this._helpWindow = new Window_FlexHelp(x, y, w, h);
        this.addWindow(this._helpWindow);
    };

    Scene_CustomHub.prototype.createStatusParamWindow = function(x, y, w, h) {
        this._statusWindow = new Window_StatusParam(x, y, w, h);
        this.addWindow(this._statusWindow);
    };

    Scene_CustomHub.prototype.createLeftSlotsWindow = function(x, y, w, h) {
        this._leftSlots = new Window_LeftSlots(x, y, w, h);
        // setHelpWindow akan dipanggil setelah _helpWindow dibuat
        this._leftSlots.setHandler('ok',     this.onLeftSlotOk.bind(this));
        this._leftSlots.setHandler('cancel', this.onLeftSlotCancel.bind(this));
        this._leftSlots.setHandler('pagedown', this.nextActor.bind(this));
        this._leftSlots.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(this._leftSlots);
    };

    Scene_CustomHub.prototype.createSkillSlotsWindow = function(x, y, w, h) {
        this._skillSlots = new Window_SkillSlots(x, y, w, h);
        // setHelpWindow dipanggil setelah _helpWindow dibuat
        this._skillSlots.setHandler('cancel', this.onSkillSlotCancel.bind(this));
        this._skillSlots.setHandler('pagedown', this.nextActor.bind(this));
        this._skillSlots.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(this._skillSlots);
    };

    Scene_CustomHub.prototype.createEquipListWindow = function(x, y, w, h) {
        this._equipList = new Window_HubEquipList(x, y, w, h);
        // setHelpWindow dipanggil setelah _helpWindow dibuat
        this._equipList.setHandler('ok',     this.onEquipItemOk.bind(this));
        this._equipList.setHandler('cancel', this.onEquipItemCancel.bind(this));
        this.addWindow(this._equipList);
    };

    Scene_CustomHub.prototype.createHubGuideBar = function() {
        var width = Graphics.boxWidth || 1280;
        var height = 30;
        var bmp = new Bitmap(width, height);
        bmp.fontSize = 15;
        bmp.textColor = '#ffffff';
        bmp.outlineColor = 'rgba(0, 0, 0, 0.85)';
        bmp.outlineWidth = 3;

        var text = "[Q / W] Ganti Karakter   |   [ENTER / Z] Pilih   |   [ESC / X] Kembali";
        bmp.drawText(text, 24, 0, width - 48, height, 'left');

        this._hubGuideSprite = new Sprite(bmp);
        this._hubGuideSprite.x = 0;
        this._hubGuideSprite.y = (Graphics.boxHeight || 720) - height - 6;
        this._hubGuideSprite.opacity = 215;
        this.addChild(this._hubGuideSprite);
    };

    Scene_CustomHub.prototype.onActorChange = function() {
        this.refreshActor();
        this.startPhase0();
    };

    Scene_CustomHub.prototype.refreshActor = function() {
        var actor = this.actor();
        this._statusWindow.setActor(actor);
        this._leftSlots.setActor(actor);
        this._skillSlots.setActor(actor);
        this._equipList.setActor(actor);
        
        // 1. DYNAMIC BACKGROUND (Layout1.png, Layout2.png, dll)
        if (this._bgSprite) {
            this._bgSprite.bitmap = ImageManager.loadYureStatus("Layout" + actor.actorId());
        }
        
        // 2. DYNAMIC BUST (Actor_1.png, Actor_2.png, dll dari faces/faces3/)
        if (this._bustSprite) {
            this._bustSprite.bitmap = ImageManager.loadYureFaces("Actor_" + actor.actorId());
        }
        
        // 3. DYNAMIC SOUL (energy.png, lust.png, dll berdasarkan Equip)
        if (this._soulSprite) {
            this._soulSprite.bitmap = null;
            var equips = actor.equips();
            for (var i = 0; i < equips.length; i++) {
                var eq = equips[i];
                if (eq) {
                    var imgName = "";
                    if (eq.note) {
                        var cleanNote = eq.note.replace(/[\r\n]+/g, " ");
                        var match = cleanNote.match(/<soul_img\s*:\s*([^>]+)>/i);
                        if (match && match[1]) imgName = match[1].trim();
                    }
                    if (!imgName && eq.name) {
                        var lowerName = eq.name.toLowerCase();
                        if (lowerName.indexOf("soul") >= 0) {
                            imgName = lowerName.replace("souls", "").replace("soul", "").trim();
                            imgName = imgName.replace(/\s+/g, "_"); 
                        }
                    }
                    if (imgName !== "") {
                        this._soulSprite.bitmap = ImageManager.loadYureSouls(imgName);
                        break;
                    }
                }
            }
        }
    };

    // --- State Machine ---

    Scene_CustomHub.prototype.startPhase0 = function() {
        this._commandWindow.activate();
        this._leftSlots.deactivate();
        this._skillSlots.deactivate();
        this._equipList.hide();
        this._equipList.deactivate();
        
        this._statusWindow.show();
        this._helpWindow.setText("");
        
        if (this._optionLayoutSprite) this._optionLayoutSprite.visible = true;
        if (this._equipLayoutSprite) this._equipLayoutSprite.visible = false;
        
        this.updateCommandSelection();
    };

    Scene_CustomHub.prototype.updateCommandSelection = function() {
        if (this._commandWindow && this._commandWindow.active) {
            if (this._commandWindow.currentSymbol() === 'equip') {
                if (this._leftSlots) this._leftSlots.select(0);
                if (this._skillSlots) this._skillSlots.deselect();
            } else if (this._commandWindow.currentSymbol() === 'skill') {
                if (this._skillSlots) this._skillSlots.select(0);
                if (this._leftSlots) this._leftSlots.deselect();
            }
        }
    };

    Scene_CustomHub.prototype.commandEquip = function() {
        this._commandWindow.deactivate();
        this._leftSlots.activate();
        this._leftSlots.select(0);
    };

    Scene_CustomHub.prototype.commandSkill = function() {
        this._commandWindow.deactivate();
        this._skillSlots.activate();
        this._skillSlots.select(0);
    };

    Scene_CustomHub.prototype.onSkillCancel = function() {
        this._skillSlots.deselect();
        this._skillSlots.deactivate();
        this.startPhase0();
    };

    // ============================================================================
    // DEV TOOL INTEGRATION (Live Reload)
    // ============================================================================
    Scene_CustomHub.prototype.rebuildUI = function() {
        var hX = getHubParam('ui_help_x', 'Help X', 360);
        var hY = getHubParam('ui_help_y', 'Help Y', 10);
        var hW = Math.min(Math.max(getHubParam('ui_help_w', 'Help W', 300), 10), 4000);
        var hH = Math.min(Math.max(getHubParam('ui_help_h', 'Help H', 700), 10), 4000);
        
        var stX = getHubParam('ui_status_x', 'Status X', 0);
        var stY = getHubParam('ui_status_y', 'Status Y', 0);
        var stW = Math.min(Math.max(getHubParam('ui_status_w', 'Status W', 816), 10), 4000);
        var stH = Math.min(Math.max(getHubParam('ui_status_h', 'Status H', 624), 10), 4000);
        
        var skX = getHubParam('ui_skill_x', 'Skill X', 580);
        var skY = getHubParam('ui_skill_y', 'Skill Y', 300);
        var skW = Math.min(Math.max(getHubParam('ui_skill_w', 'Skill W', 220), 10), 4000);
        var skH = Math.min(Math.max(getHubParam('ui_skill_h', 'Skill H', 300), 10), 4000);
        
        var eqLX = getHubParam('ui_eqlist_x', 'Equip List X', 250);
        var eqLY = getHubParam('ui_eqlist_y', 'Equip List Y', 150);
        var eqLW = Math.min(Math.max(getHubParam('ui_eqlist_w', 'Equip List W', 330), 10), 4000);
        var eqLH = Math.min(Math.max(getHubParam('ui_eqlist_h', 'Equip List H', 450), 10), 4000);
        
        var esX = getHubParam('ui_eqslots_x', 'Equip Slots X', 0);
        var esY = getHubParam('ui_eqslots_y', 'Equip Slots Y', 0);
        var esW = Math.min(Math.max(getHubParam('ui_eqslots_w', 'Equip Slots W', 816), 10), 4000);
        var esH = Math.min(Math.max(getHubParam('ui_eqslots_h', 'Equip Slots H', 624), 10), 4000);
        
        if (this._helpWindow) {
            this._helpWindow.x = hX; this._helpWindow.y = hY;
            if (this._helpWindow.width !== hW || this._helpWindow.height !== hH) {
                this._helpWindow.width = hW; this._helpWindow.height = hH;
                this._helpWindow.createContents();
            }
        }
        if (this._statusWindow) {
            this._statusWindow.x = stX; this._statusWindow.y = stY;
            if (this._statusWindow.width !== stW || this._statusWindow.height !== stH) {
                this._statusWindow.width = stW; this._statusWindow.height = stH;
                this._statusWindow.createContents();
            }
            this._statusWindow.refresh();
        }
        if (this._skillSlots) {
            this._skillSlots.x = skX; this._skillSlots.y = skY;
            if (this._skillSlots.width !== skW || this._skillSlots.height !== skH) {
                this._skillSlots.width = skW; this._skillSlots.height = skH;
                this._skillSlots.createContents();
            }
            this._skillSlots.refresh();
        }
        if (this._equipList) {
            this._equipList.x = eqLX; this._equipList.y = eqLY;
            if (this._equipList.width !== eqLW || this._equipList.height !== eqLH) {
                this._equipList.width = eqLW; this._equipList.height = eqLH;
                this._equipList.createContents();
            }
            this._equipList.refresh();
        }
        if (this._leftSlots) {
            this._leftSlots.x = esX; this._leftSlots.y = esY;
            if (this._leftSlots.width !== esW || this._leftSlots.height !== esH) {
                this._leftSlots.width = esW; this._leftSlots.height = esH;
                this._leftSlots.createContents();
            }
            this._leftSlots.refresh();
        }
        if (this._bustSprite) {
            this._bustSprite.x = getHubParam('ui_bust_x', 'Bust Image X', 180);
            this._bustSprite.y = getHubParam('ui_bust_y', 'Bust Image Y', 60);
        }
    };

    Scene_CustomHub.prototype.onLeftSlotCancel = function() {
        this.startPhase0();
    };

    Scene_CustomHub.prototype.onSkillSlotCancel = function() {
        this.startPhase0();
    };

    Scene_CustomHub.prototype.onLeftSlotOk = function() {
        this._statusWindow.hide(); 
        this._equipList.show();    
        this._equipList.activate();
        this._equipList.setSlotId(this._leftSlots.index());
        this._equipList.select(0);
        
        if (this._optionLayoutSprite) this._optionLayoutSprite.visible = false;
        if (this._equipLayoutSprite) this._equipLayoutSprite.visible = true;
    };

    Scene_CustomHub.prototype.onEquipItemCancel = function() {
        this._equipList.hide();
        this._equipList.deselect();
        this._statusWindow.show();
        this._leftSlots.activate();
        
        if (this._optionLayoutSprite) this._optionLayoutSprite.visible = true;
        if (this._equipLayoutSprite) this._equipLayoutSprite.visible = false;
    };

    Scene_CustomHub.prototype.onEquipItemOk = function() {
        SoundManager.playEquip();
        this.actor().changeEquip(this._leftSlots.index(), this._equipList.item());
        this._leftSlots.refresh();
        this._statusWindow.refresh();
        this._equipList.refresh();
        
        this.onEquipItemCancel();
    };
    
    window.Scene_CustomHub = Scene_CustomHub;

    // ============================================================================
    // MENU HOOK (Mengganti tombol Status bawaan)
    // ============================================================================
    var _Scene_Menu_commandPersonal = Scene_Menu.prototype.commandPersonal;
    Scene_Menu.prototype.commandPersonal = function() {
        _Scene_Menu_commandPersonal.call(this);
    };
    
    var _Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
    Scene_Menu.prototype.onPersonalOk = function() {
        if (this._commandWindow.currentSymbol() === 'status') {
            SceneManager.push(Scene_CustomHub);
        } else {
            _Scene_Menu_onPersonalOk.call(this);
        }
    };

})();
