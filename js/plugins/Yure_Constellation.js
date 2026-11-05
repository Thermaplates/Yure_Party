//=============================================================================
// Yure_ConstellationMenu.js
//=============================================================================

/*:
 * @plugindesc [v3.7] Constellation Menu System - Interactive Graphical Combo Tree
 * @author Yure Party Team & Antigravity
 *
 * @help
 * ============================================================================
 * CONSTELLATION COMBO SYSTEM - GRAPHICAL UI & MECHANICS
 * ============================================================================
 * Menambahkan Scene_Constellation yang dapat diakses dengan menekan tombol 'P' di map.
 * UI terintegrasi langsung dengan aset visual di img/pictures/UI/Constellation/:
 *   - List.png       : Kolom Kiri (Daftar Skill & Status Link)
 *   - Treeskill.png  : Kolom Tengah (Header Aktor & Pohon Kombo 7 Node)
 *   - deskripsi.png  : Kolom Kanan (Icon HD 189x189, Stat & Deskripsi Lengkap)
 *
 * DIMENSI & UKURAN IKON:
 * 1. Kolom Tengah (Treeskill):
 *    - Root Base Node (Atas): Ikon 136x136 px diposisikan di Y: 63 pas di dalam bingkai visual.
 *    - Cabang Node 1..6: Ikon 88x88 px pas di dalam kotak cabang samping.
 * 2. Kolom Kanan (Deskripsi):
 *    - Ikon Skill HD: 189x189 px diposisikan di (X: 16, Y: 18) pas di bingkai kotak ungu.
 *    - Stats Grid: Berada di sebelah kanan ikon (X: 222, Y: 20).
 *    - Kotak Deskripsi: Berada di bagian bawah (X: 28, Y: 248).
 * ============================================================================
 */

(function() {
    'use strict';

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
    var _redrawTimer = null;
    function safeDebouncedRedraw(targetWindow) {
        if (!targetWindow || !targetWindow.contents) return;
        if (!_redrawTimer) {
            _redrawTimer = setTimeout(function() {
                _redrawTimer = null;
                if (targetWindow && targetWindow.contents && targetWindow.refresh) {
                    targetWindow.refresh();
                }
            }, 40);
        }
    }

    // ------------------------------------------------------------------------
    // Preload UI Bitmaps
    // ------------------------------------------------------------------------
    ImageManager.loadConstellationUI = function(filename) {
        return this.loadBitmap('img/pictures/UI/Constellation/', filename, 0, true);
    };

    var _Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
    Scene_Boot.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        ImageManager.loadConstellationUI('List');
        ImageManager.loadConstellationUI('Treeskill');
        ImageManager.loadConstellationUI('deskripsi');
    };

    // ------------------------------------------------------------------------
    // Game_Actor Setup
    // ------------------------------------------------------------------------
    var _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.call(this);
        this._constellationPaths = {};
    };

    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        if (!this._constellationPaths) {
            this._constellationPaths = {};
        }
    };

    // ------------------------------------------------------------------------
    // Scene_Map Trigger (Hotkey 'P')
    // ------------------------------------------------------------------------
    var _Scene_Map_updateScene = Scene_Map.prototype.updateScene;
    Scene_Map.prototype.updateScene = function() {
        _Scene_Map_updateScene.call(this);
        if (!SceneManager.isSceneChanging() && Input.isTriggered('constellation') && !$gamePlayer.isMoving() && !$gameMessage.isBusy()) {
            SceneManager.push(Scene_Constellation);
        }
    };

    Input.keyMapper[80] = 'constellation'; // 80 = 'P'

    // ========================================================================
    // Scene_Constellation
    // ========================================================================
    function Scene_Constellation() {
        this.initialize.apply(this, arguments);
    }
    Scene_Constellation.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Constellation.prototype.constructor = Scene_Constellation;

    Scene_Constellation.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_Constellation.prototype.createBackground = function() {
        Scene_MenuBase.prototype.createBackground.call(this);

        // Tambahkan background visual SEBELUM window layer
        this._bgList = new Sprite(ImageManager.loadConstellationUI('List'));
        this.addChild(this._bgList);

        this._bgTree = new Sprite(ImageManager.loadConstellationUI('Treeskill'));
        this.addChild(this._bgTree);

        this._bgDesc = new Sprite(ImageManager.loadConstellationUI('deskripsi'));
        this.addChild(this._bgDesc);
    };

    Scene_Constellation.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createAllWindows();
        this.refreshActor();
    };

    Scene_Constellation.prototype.createAllWindows = function() {
        // 1. Left Skill List (X: 7, Y: 80, W: 319, H: 630)
        this._listWindow = new Window_ConstellationList(7, 80, 319, 630);
        this._listWindow.setHandler('cancel', this.popScene.bind(this));
        this._listWindow.setHandler('ok', this.onListOk.bind(this));
        this._listWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._listWindow.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(this._listWindow);

        // 2. Right Info Window (X: 809, Y: 17, W: 460, H: 700)
        this._infoWindow = new Window_ConstellationInfo(809, 17, 460, 700);
        this.addWindow(this._infoWindow);

        // 3. Middle Tree Window with Actor Header (X: 335, Y: 15, W: 464, H: 695)
        this._treeWindow = new Window_ConstellationTree(335, 15, 464, 695);
        this._treeWindow.setHandler('cancel', this.onTreeCancel.bind(this));
        this._treeWindow.setHandler('ok', this.onTreeOk.bind(this));
        this._treeWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._treeWindow.setHandler('pageup', this.previousActor.bind(this));
        this._treeWindow.setInfoWindow(this._infoWindow);
        this.addWindow(this._treeWindow);

        // Cross references
        this._listWindow.setTreeWindow(this._treeWindow);
        this._listWindow.setInfoWindow(this._infoWindow);

        // 4. Popup Selector Window (Modal)
        var selW = 440;
        var selH = 500;
        var selX = (Graphics.boxWidth - selW) / 2;
        var selY = (Graphics.boxHeight - selH) / 2;
        this._selectorWindow = new Window_ConstellationSelector(selX, selY, selW, selH);
        this._selectorWindow.setHandler('ok', this.onSelectorOk.bind(this));
        this._selectorWindow.setHandler('cancel', this.onSelectorCancel.bind(this));
        this._selectorWindow.setHandler('clear', this.onSelectorClear.bind(this));
        this.addWindow(this._selectorWindow);
    };

    Scene_Constellation.prototype.refreshActor = function() {
        var actor = this.actor();
        this._listWindow.setActor(actor);
        this._treeWindow.setActor(actor);
        this._selectorWindow.setActor(actor);

        var curSkill = this._listWindow.item();
        if (curSkill) {
            this._treeWindow.setBaseSkill(curSkill);
            this._infoWindow.setSkill(curSkill, "Root Skill");
        } else {
            this._treeWindow.setBaseSkill(null);
            this._infoWindow.setSkill(null, "");
        }

        this._treeWindow.refresh();
        this._listWindow.activate();
    };

    Scene_Constellation.prototype.onActorChange = function() {
        this.refreshActor();
    };

    Scene_Constellation.prototype.onListOk = function() {
        var skill = this._listWindow.item();
        if (skill) {
            this._treeWindow.setBaseSkill(skill);
            this._listWindow.deactivate();
            this._treeWindow.activate();
            this._treeWindow.select(1); // Langsung arahkan ke cabang kiri pertama (L1)
        } else {
            this._listWindow.activate();
        }
    };

    Scene_Constellation.prototype.onTreeCancel = function() {
        this._treeWindow.deselect();
        this._treeWindow.deactivate();
        this._listWindow.activate();
        this._listWindow.updateInfo();
    };

    Scene_Constellation.prototype.onTreeOk = function() {
        var nodeIndex = this._treeWindow.index();
        if (nodeIndex === 0) {
            SoundManager.playCursor();
            this._treeWindow.activate();
            return;
        }

        var baseForNode = this._treeWindow.getParentSkillForNode(nodeIndex);
        if (!baseForNode) {
            SoundManager.playBuzzer();
            this._treeWindow.activate();
            return;
        }

        // Buka modal selector
        SoundManager.playOk();
        this._treeWindow.deactivate();
        this._selectorWindow.setBaseSkill(baseForNode);
        this._selectorWindow.setNodeIndex(nodeIndex);
        this._selectorWindow.refresh();
        this._selectorWindow.select(0);
        this._selectorWindow.show();
        this._selectorWindow.activate();
    };

    Scene_Constellation.prototype.onSelectorCancel = function() {
        this._selectorWindow.hide();
        this._selectorWindow.deactivate();
        this._treeWindow.activate();
        this._treeWindow.updateInfo();
    };

    Scene_Constellation.prototype.onSelectorClear = function() {
        var nodeIndex = this._treeWindow.index();
        var baseForNode = this._treeWindow.getParentSkillForNode(nodeIndex);
        var actor = this.actor();

        if (baseForNode && actor._constellationPaths && actor._constellationPaths[baseForNode.id]) {
            var slotIndex = this._treeWindow.getSlotIndexForNode(nodeIndex);
            actor._constellationPaths[baseForNode.id][slotIndex] = 0;
            while (actor._constellationPaths[baseForNode.id].length > 0 && 
                   !actor._constellationPaths[baseForNode.id][actor._constellationPaths[baseForNode.id].length - 1]) {
                actor._constellationPaths[baseForNode.id].pop();
            }
        }

        SoundManager.playEquip();
        this._selectorWindow.hide();
        this._selectorWindow.deactivate();
        this._treeWindow.refresh();
        this._treeWindow.activate();
        this._treeWindow.updateInfo();
        this._listWindow.refresh();
    };

    Scene_Constellation.prototype.onSelectorOk = function() {
        var targetSkill = this._selectorWindow.item();
        var nodeIndex = this._treeWindow.index();
        var baseForNode = this._treeWindow.getParentSkillForNode(nodeIndex);
        var actor = this.actor();

        if (baseForNode && targetSkill) {
            if (!actor._constellationPaths) actor._constellationPaths = {};
            if (!actor._constellationPaths[baseForNode.id]) actor._constellationPaths[baseForNode.id] = [];

            var paths = actor._constellationPaths[baseForNode.id];
            var slotIndex = this._treeWindow.getSlotIndexForNode(nodeIndex);

            paths[slotIndex] = targetSkill.id;

            SoundManager.playEquip();
            this._selectorWindow.hide();
            this._selectorWindow.deactivate();
            this._treeWindow.refresh();
            this._treeWindow.activate();
            this._treeWindow.updateInfo();
            this._listWindow.refresh();
        } else {
            this._selectorWindow.activate();
        }
    };

    // ========================================================================
    // Window_ConstellationList (Left Column Skill List)
    // ========================================================================
    function Window_ConstellationList() {
        this.initialize.apply(this, arguments);
    }
    Window_ConstellationList.prototype = Object.create(Window_Selectable.prototype);
    Window_ConstellationList.prototype.constructor = Window_ConstellationList;

    Window_ConstellationList.prototype.initialize = function(x, y, w, h) {
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.opacity = 0;
        this._actor = null;
        this._data = [];
    };

    Window_ConstellationList.prototype.standardPadding = function() {
        return 0;
    };

    Window_ConstellationList.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
        this.select(0);
    };

    Window_ConstellationList.prototype.setTreeWindow = function(treeWindow) {
        this._treeWindow = treeWindow;
    };

    Window_ConstellationList.prototype.setInfoWindow = function(win) {
        this._infoWindow = win;
    };

    Window_ConstellationList.prototype.maxItems = function() {
        return this._data ? this._data.length : 0;
    };

    Window_ConstellationList.prototype.item = function() {
        return this._data && this.index() >= 0 ? this._data[this.index()] : null;
    };

    Window_ConstellationList.prototype.itemRect = function(index) {
        return {
            x: 14,
            y: 6 + index * 52,
            width: this.width - 28,
            height: 46
        };
    };

    Window_ConstellationList.prototype.refresh = function() {
        this._data = [];
        if (this._actor) {
            var skillPool = [];
            // 1. Equipped skills
            if (this._actor.pethogsEquippedSkills) {
                var equippedIds = this._actor.pethogsEquippedSkills();
                for (var i = 0; i < equippedIds.length; i++) {
                    if (equippedIds[i] > 0) {
                        var sk = $dataSkills[equippedIds[i]];
                        if (sk && !skillPool.includes(sk)) skillPool.push(sk);
                    }
                }
            }
            // 2. Learned skills
            var learnedSkills = this._actor.skills();
            for (var j = 0; j < learnedSkills.length; j++) {
                var lsk = learnedSkills[j];
                if (lsk && !skillPool.includes(lsk)) skillPool.push(lsk);
            }
            // 3. Fallback: all valid database skills (IDs >= 8)
            if (skillPool.length === 0) {
                for (var k = 8; k < $dataSkills.length; k++) {
                    if ($dataSkills[k] && $dataSkills[k].name && $dataSkills[k].name.trim().length > 0) {
                        skillPool.push($dataSkills[k]);
                    }
                }
            }
            this._data = skillPool;
        }

        this.createContents();
        this.drawAllItems();
    };

    Window_ConstellationList.prototype.drawItem = function(index) {
        var item = this._data[index];
        if (!item) return;

        var rect = this.itemRect(index);
        var isSelected = (this.active && this.index() === index);

        // Item slot backdrop
        this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, isSelected ? 'rgba(50, 25, 75, 0.92)' : 'rgba(18, 14, 28, 0.7)');
        drawBorderRect(this.contents, rect.x, rect.y, rect.width, rect.height, isSelected ? '#ff66c4' : 'rgba(147, 51, 234, 0.4)', isSelected ? 2 : 1);

        // Draw Icon (32x32)
        var iconSize = 32;
        var iconX = rect.x + 6;
        var iconY = rect.y + (rect.height - iconSize) / 2;
        ImageManager.drawSkillIcon(this.contents, item, iconX, iconY, iconSize, iconSize, function() {
            safeDebouncedRedraw(this);
        }.bind(this));

        // Calculate Link Count
        var chainCount = 0;
        if (this._actor && this._actor._constellationPaths && this._actor._constellationPaths[item.id]) {
            var paths = this._actor._constellationPaths[item.id];
            for (var p = 0; p < paths.length; p++) {
                if (paths[p] > 0) chainCount++;
            }
        }

        // Draw Chain Status Badge on Right side (aligned with Skill Name)
        var badgeW = 90;
        var badgeX = rect.x + rect.width - badgeW - 6;
        this.contents.fontSize = 12;
        this.changeTextColor(chainCount > 0 ? '#2dd4bf' : '#94a3b8');
        var subText = chainCount > 0 ? "✦ Linked (" + chainCount + ")" : "○ No link";
        this.drawText(subText, badgeX, rect.y + 6, badgeW, 'right');

        // Draw Skill Name (Left side of badge)
        this.resetTextColor();
        this.contents.fontSize = 16;
        var textX = iconX + iconSize + 8;
        var textW = badgeX - textX - 4;
        this.drawText(item.name, textX, rect.y + 5, textW, 'left');

        this.resetTextColor();
        this.contents.fontSize = this.standardFontSize();
    };

    Window_ConstellationList.prototype.select = function(index) {
        if (this._index !== index) {
            Window_Selectable.prototype.select.call(this, index);
            this.refresh();
            this.updateInfo();
        }
    };

    Window_ConstellationList.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        if (this.active && Input.isTriggered('right')) {
            if (this.item() && this._treeWindow) {
                SoundManager.playCursor();
                this.deactivate();
                this._treeWindow.activate();
                this._treeWindow.select(1);
            }
        }
    };

    Window_ConstellationList.prototype.updateInfo = function() {
        var item = this.item();
        if (item) {
            if (this._infoWindow) this._infoWindow.setSkill(item, 'Root Skill');
            if (this._treeWindow) this._treeWindow.setBaseSkill(item);
        }
    };

    Window_ConstellationList.prototype.callUpdateHelp = function() {
        if (this.active) {
            this.updateInfo();
        }
    };

    // ========================================================================
    // Window_ConstellationTree (Middle Column 7-Node Combo Graph + Actor Name)
    // ========================================================================
    function Window_ConstellationTree() {
        this.initialize.apply(this, arguments);
    }
    Window_ConstellationTree.prototype = Object.create(Window_Selectable.prototype);
    Window_ConstellationTree.prototype.constructor = Window_ConstellationTree;

    Window_ConstellationTree.prototype.initialize = function(x, y, w, h) {
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this.opacity = 0;
        this._actor = null;
        this._baseSkill = null;
        this._nodes = [];
        this.deselect();
    };

    Window_ConstellationTree.prototype.standardPadding = function() {
        return 0;
    };

    // Prevent vertical scrolling in fixed 2D graph
    Window_ConstellationTree.prototype.ensureCursorVisible = function() {};
    Window_ConstellationTree.prototype.topRow = function() { return 0; };
    Window_ConstellationTree.prototype.maxTopRow = function() { return 0; };
    Window_ConstellationTree.prototype.isCursorVisible = function() { return this.index() >= 0; };

    Window_ConstellationTree.prototype.setActor = function(actor) {
        this._actor = actor;
    };

    Window_ConstellationTree.prototype.setBaseSkill = function(skill) {
        if (this._baseSkill !== skill) {
            this._baseSkill = skill;
            this.refresh();
        }
    };

    Window_ConstellationTree.prototype.setInfoWindow = function(win) {
        this._infoWindow = win;
    };

    Window_ConstellationTree.prototype.maxItems = function() {
        return 7;
    };

    Window_ConstellationTree.prototype.itemRect = function(index) {
        if (!this._nodes || !this._nodes[index]) return {x: 0, y: 0, width: 0, height: 0};
        var n = this._nodes[index];
        return {x: n.x, y: n.y, width: n.w, height: n.h};
    };

    // Safe Navigation Mapping (No freeze on bottom or repeated inputs)
    Window_ConstellationTree.prototype.cursorDown = function(wrap) {
        var idx = this.index();
        if (idx === 0) this.select(1);
        else if (idx === 1) this.select(3);
        else if (idx === 2) this.select(4);
        else if (idx === 3) this.select(5);
        else if (idx === 4) this.select(6);
        else if (idx === 5 && wrap) this.select(0);
        else if (idx === 6 && wrap) this.select(0);
    };

    Window_ConstellationTree.prototype.cursorUp = function(wrap) {
        var idx = this.index();
        if (idx === 1 || idx === 2) this.select(0);
        else if (idx === 3) this.select(1);
        else if (idx === 4) this.select(2);
        else if (idx === 5) this.select(3);
        else if (idx === 6) this.select(4);
        else if (idx === 0 && wrap) this.select(5);
    };

    Window_ConstellationTree.prototype.cursorRight = function(wrap) {
        var idx = this.index();
        if (idx === 1) this.select(2);
        else if (idx === 3) this.select(4);
        else if (idx === 5) this.select(6);
        else if (idx === 0) this.select(2);
    };

    Window_ConstellationTree.prototype.cursorLeft = function(wrap) {
        var idx = this.index();
        if (idx === 2) this.select(1);
        else if (idx === 4) this.select(3);
        else if (idx === 6) this.select(5);
        else if (idx === 0 || idx === 1 || idx === 3 || idx === 5) {
            SoundManager.playCursor();
            this.deselect();
            this.deactivate();
            if (SceneManager._scene && SceneManager._scene._listWindow) {
                SceneManager._scene._listWindow.activate();
            }
        }
    };

    Window_ConstellationTree.prototype.select = function(index) {
        if (this._index !== index) {
            Window_Selectable.prototype.select.call(this, index);
            this.refresh();
            this.updateInfo();
        }
    };

    Window_ConstellationTree.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
    };

    Window_ConstellationTree.prototype.updateInfo = function() {
        if (this._infoWindow && this._nodes && this._nodes[this.index()]) {
            var n = this._nodes[this.index()];
            this._infoWindow.setSkill(n.skill, n.slotName);
        }
    };

    Window_ConstellationTree.prototype.getParentSkillForNode = function(index) {
        if (index === 0) return null;
        if (index === 1 || index === 2) return this._nodes[0] ? this._nodes[0].skill : null;
        if (index === 3) return this._nodes[1] ? this._nodes[1].skill : null;
        if (index === 4) return this._nodes[2] ? this._nodes[2].skill : null;
        if (index === 5) return this._nodes[3] ? this._nodes[3].skill : null;
        if (index === 6) return this._nodes[4] ? this._nodes[4].skill : null;
        return null;
    };

    Window_ConstellationTree.prototype.getSlotIndexForNode = function(index) {
        if (index === 1) return 0; // Base -> Left
        if (index === 2) return 1; // Base -> Right
        if (index === 3) return 0; // L1 -> L2
        if (index === 4) return 0; // R1 -> R2
        if (index === 5) return 0; // L2 -> L3
        if (index === 6) return 0; // R2 -> R3
        return 0;
    };

    Window_ConstellationTree.prototype.refresh = function() {
        this.contents.clear();
        this._nodes = [];

        // 1. Draw Actor Header directly above Root Base Node
        if (this._actor) {
            this.contents.fontSize = 20;
            this.changeTextColor('#ffffff');
            var nameText = "◄   " + this._actor.name() + "   ►";
            this.drawText(nameText, 0, 14, this.contentsWidth(), 'center');
            this.contents.fontSize = 12;
            this.changeTextColor('#ff66c4');
            this.drawText("[ Q / W ] Ganti Karakter", 0, 38, this.contentsWidth(), 'center');
            this.resetTextColor();
            this.contents.fontSize = this.standardFontSize();
        }

        var getChildSkill = function(parentSkill, slotIndex) {
            if (!this._actor || !parentSkill) return null;
            if (this._actor._constellationPaths && this._actor._constellationPaths[parentSkill.id]) {
                var cid = this._actor._constellationPaths[parentSkill.id][slotIndex];
                if (cid && cid > 0) return $dataSkills[cid];
            }
            return null;
        }.bind(this);

        // Fetch hierarchical skills
        var skill0 = this._baseSkill || null;
        var skill1 = getChildSkill(skill0, 0); // L1
        var skill2 = getChildSkill(skill0, 1); // R1
        var skill3 = getChildSkill(skill1, 0); // L2
        var skill4 = getChildSkill(skill2, 0); // R2
        var skill5 = getChildSkill(skill3, 0); // L3
        var skill6 = getChildSkill(skill4, 0); // R3

        // Exact Pixel-Aligned Coordinates: Node 0 at y:63 for 136x136, Side Nodes are 102..112x131
        this._nodes[0] = { x: 157, y: 63, w: 150, h: 140, skill: skill0, slotName: "Root Base", isBase: true, isAvailable: !!skill0 };
        this._nodes[1] = { x: 54, y: 215, w: 102, h: 131, skill: skill1, slotName: "Branch Left 1", isBase: false, isAvailable: !!skill0 };
        this._nodes[2] = { x: 295, y: 215, w: 112, h: 131, skill: skill2, slotName: "Branch Right 1", isBase: false, isAvailable: !!skill0 };
        this._nodes[3] = { x: 54, y: 345, w: 102, h: 131, skill: skill3, slotName: "Branch Left 2", isBase: false, isAvailable: !!skill1 };
        this._nodes[4] = { x: 295, y: 345, w: 112, h: 131, skill: skill4, slotName: "Branch Right 2", isBase: false, isAvailable: !!skill2 };
        this._nodes[5] = { x: 54, y: 475, w: 102, h: 129, skill: skill5, slotName: "Branch Left 3", isBase: false, isAvailable: !!skill3 };
        this._nodes[6] = { x: 295, y: 475, w: 112, h: 129, skill: skill6, slotName: "Branch Right 3", isBase: false, isAvailable: !!skill4 };

        // Draw node contents inside each visual frame
        for (var i = 0; i < 7; i++) {
            this.drawNodeContent(this._nodes[i], i);
        }
    };

    Window_ConstellationTree.prototype.drawNodeContent = function(node, index) {
        if (!node) return;

        var isSelected = (this.active && this.index() === index);

        // Highlight border if selected
        if (isSelected) {
            drawBorderRect(this.contents, node.x + 2, node.y + 2, node.w - 4, node.h - 4, '#38bdf8', 3);
            drawBorderRect(this.contents, node.x + 4, node.y + 4, node.w - 8, node.h - 8, '#ff66c4', 2);
        }

        if (node.skill) {
            // Node 0 Root Base is 136x136 at y: 63, Branch Nodes are 88x88
            var iconSize = node.isBase ? 136 : 88;
            var ix = node.x + Math.floor((node.w - iconSize) / 2);
            var iy = node.isBase ? 63 : (node.y + Math.floor((node.h - iconSize) / 2) - 6);

            ImageManager.drawSkillIcon(this.contents, node.skill, ix, iy, iconSize, iconSize, function() {
                safeDebouncedRedraw(this);
            }.bind(this));

            // Skill Name inside frame at bottom (for branch nodes)
            if (!node.isBase) {
                this.contents.fontSize = 12;
                this.resetTextColor();
                this.drawText(node.skill.name, node.x + 2, node.y + node.h - 22, node.w - 4, 'center');
                this.contents.fontSize = this.standardFontSize();
            }
        } else {
            // Empty / Vacant or Locked
            this.contents.fontSize = 13;
            if (node.isAvailable) {
                this.changeTextColor('#ff66c4');
                this.drawText("+ ADD", node.x, node.y + (node.h / 2) - 10, node.w, 'center');
            } else {
                this.changeTextColor('#64748b');
                this.drawText("LOCKED", node.x, node.y + (node.h / 2) - 10, node.w, 'center');
            }
            this.resetTextColor();
            this.contents.fontSize = this.standardFontSize();
        }
    };

    // ========================================================================
    // Window_ConstellationInfo (Right Column: 189x189 Icon, Stats & Desc)
    // ========================================================================
    function Window_ConstellationInfo() {
        this.initialize.apply(this, arguments);
    }
    Window_ConstellationInfo.prototype = Object.create(Window_Base.prototype);
    Window_ConstellationInfo.prototype.constructor = Window_ConstellationInfo;

    Window_ConstellationInfo.prototype.initialize = function(x, y, w, h) {
        Window_Base.prototype.initialize.call(this, x, y, w, h);
        this.opacity = 0;
        this._skill = null;
        this._slotName = "";
    };

    Window_ConstellationInfo.prototype.standardPadding = function() {
        return 0;
    };

    Window_ConstellationInfo.prototype.setSkill = function(skill, slotName) {
        if (this._skill !== skill || this._slotName !== slotName) {
            this._skill = skill;
            this._slotName = slotName || "";
            this.refresh();
        }
    };

    Window_ConstellationInfo.prototype.refresh = function() {
        this.contents.clear();
        if (!this._skill) {
            var title = this._slotName ? "SLOT: " + this._slotName.toUpperCase() : "INFO SKILL";
            this.contents.fontSize = 18;
            this.changeTextColor('#ff66c4');
            this.drawText(title, 0, 260, this.contentsWidth(), 'center');
            this.contents.fontSize = 14;
            this.changeTextColor('#94a3b8');
            this.drawText("Slot cabang ini masih kosong.", 0, 290, this.contentsWidth(), 'center');
            this.drawText("Tekan [OK] untuk memasang skill kombo.", 0, 315, this.contentsWidth(), 'center');
            this.resetTextColor();
            this.contents.fontSize = this.standardFontSize();
            return;
        }

        var skill = this._skill;

        // 1. Top-Left Box: 189x189 HD Icon (Shifted slightly right to X:16 and down to Y:18)
        var iconSize = 189;
        var iconX = 16;
        var iconY = 18;
        ImageManager.drawSkillIcon(this.contents, skill, iconX, iconY, iconSize, iconSize, function() {
            safeDebouncedRedraw(this);
        }.bind(this));

        // 2. Top-Right Box: Stats Grid (Positioned at X: 222, Y: 20)
        var statsX = 222;
        var statsY = 20;
        var statsW = this.contentsWidth() - statsX - 16;

        // Skill Name
        this.contents.fontSize = 20;
        this.changeTextColor('#ff66c4');
        this.drawText(skill.name, statsX, statsY, statsW, 'left');
        statsY += 28;

        // Slot Tier / Position
        this.contents.fontSize = 14;
        this.changeTextColor('#38bdf8');
        this.drawText("✦ " + (this._slotName || "Combo Skill"), statsX, statsY, statsW, 'left');
        statsY += 22;

        // Cost (MP / TP)
        this.resetTextColor();
        var costStr = "Cost: ";
        if (skill.mpCost > 0) costStr += skill.mpCost + " MP  ";
        if (skill.tpCost > 0) costStr += skill.tpCost + " TP  ";
        if (skill.mpCost === 0 && skill.tpCost === 0) costStr += "Free";
        this.drawText(costStr, statsX, statsY, statsW, 'left');
        statsY += 22;

        // Element / Type
        var typeStr = "Type: ";
        if (skill.damage && skill.damage.type > 0) {
            typeStr += (skill.damage.elementId > 0 && $dataSystem.elements[skill.damage.elementId]) 
                ? $dataSystem.elements[skill.damage.elementId] 
                : "Physical Attack";
        } else {
            typeStr += "Support / Utility";
        }
        this.drawText(typeStr, statsX, statsY, statsW, 'left');
        statsY += 22;

        // Target Scope
        var scopeStr = "Target: ";
        switch (skill.scope) {
            case 1: scopeStr += "One Enemy"; break;
            case 2: scopeStr += "All Enemies"; break;
            case 7: scopeStr += "One Ally"; break;
            case 8: scopeStr += "All Allies"; break;
            case 11: scopeStr += "The User"; break;
            default: scopeStr += "Special"; break;
        }
        this.drawText(scopeStr, statsX, statsY, statsW, 'left');

        // 3. Bottom Box: Skill Description Area (Positioned at X: 28, Y: 248)
        var descX = 28;
        var descY = 248;
        var descW = this.contentsWidth() - descX - 24;

        // Section Title
        this.contents.fontSize = 16;
        this.changeTextColor('#2dd4bf');
        this.drawText("— SKILL DESCRIPTION —", descX, descY, descW, 'center');
        this.resetTextColor();
        this.contents.fontSize = 15;
        descY += 34;

        // Description Body with escape codes & wrapping
        this.drawTextEx(skill.description, descX + 8, descY);
    };

    // ========================================================================
    // Window_ConstellationSelector (Popup Skill Chooser with Cursor Highlight)
    // ========================================================================
    function Window_ConstellationSelector() {
        this.initialize.apply(this, arguments);
    }
    Window_ConstellationSelector.prototype = Object.create(Window_Selectable.prototype);
    Window_ConstellationSelector.prototype.constructor = Window_ConstellationSelector;

    Window_ConstellationSelector.prototype.initialize = function(x, y, w, h) {
        Window_Selectable.prototype.initialize.call(this, x, y, w, h);
        this._actor = null;
        this._baseSkill = null;
        this._nodeIndex = 0;
        this._data = [];
        this.hide();
    };

    Window_ConstellationSelector.prototype.standardPadding = function() {
        return 12;
    };

    Window_ConstellationSelector.prototype.setActor = function(actor) {
        this._actor = actor;
    };

    Window_ConstellationSelector.prototype.setBaseSkill = function(skill) {
        this._baseSkill = skill;
    };

    Window_ConstellationSelector.prototype.setNodeIndex = function(idx) {
        this._nodeIndex = idx;
    };

    Window_ConstellationSelector.prototype.maxItems = function() {
        return this._data ? this._data.length : 0;
    };

    Window_ConstellationSelector.prototype.item = function() {
        return this._data && this.index() >= 0 ? this._data[this.index()] : null;
    };

    Window_ConstellationSelector.prototype.itemHeight = function() {
        return 46;
    };

    Window_ConstellationSelector.prototype.select = function(index) {
        if (this._index !== index) {
            Window_Selectable.prototype.select.call(this, index);
            this.refresh();
        }
    };

    Window_ConstellationSelector.prototype.processHandling = function() {
        Window_Selectable.prototype.processHandling.call(this);
        if (this.isOpenAndActive()) {
            if (Input.isTriggered('shift')) {
                this.playOkSound();
                this.updateInputData();
                this.callHandler('clear');
            }
        }
    };

    Window_ConstellationSelector.prototype.refresh = function() {
        this._data = [];
        if (this._actor) {
            var pool = [];
            if (this._actor.pethogsEquippedSkills) {
                var eq = this._actor.pethogsEquippedSkills();
                for (var e = 0; e < eq.length; e++) {
                    if (eq[e] > 0 && $dataSkills[eq[e]] && !pool.includes($dataSkills[eq[e]])) {
                        pool.push($dataSkills[eq[e]]);
                    }
                }
            }
            var learned = this._actor.skills();
            for (var l = 0; l < learned.length; l++) {
                if (learned[l] && !pool.includes(learned[l])) {
                    pool.push(learned[l]);
                }
            }
            if (pool.length === 0) {
                for (var d = 8; d < $dataSkills.length; d++) {
                    if ($dataSkills[d] && $dataSkills[d].name && $dataSkills[d].name.trim().length > 0) {
                        pool.push($dataSkills[d]);
                    }
                }
            }
            // Filter out direct self loop
            for (var i = 0; i < pool.length; i++) {
                var sk = pool[i];
                if (sk && (!this._baseSkill || sk.id !== this._baseSkill.id)) {
                    this._data.push(sk);
                }
            }
        }

        this.createContents();

        // Dark modal backdrop & stylish border
        this.contents.fillRect(0, 0, this.contentsWidth(), this.contentsHeight(), 'rgba(15, 12, 24, 0.95)');
        drawBorderRect(this.contents, 0, 0, this.contentsWidth(), this.contentsHeight(), '#ff66c4', 2);

        // Header Title & Key Guide
        this.contents.fontSize = 18;
        this.changeTextColor('#ff66c4');
        this.drawText("PILIH SKILL KOMBO", 0, 6, this.contentsWidth(), 'center');
        
        this.contents.fontSize = 12;
        this.changeTextColor('#94a3b8');
        this.drawText("[OK] Pasang  |  [SHIFT] Hapus Slot  |  [ESC] Batal", 0, this.contentsHeight() - 22, this.contentsWidth(), 'center');
        this.resetTextColor();
        this.contents.fontSize = this.standardFontSize();

        this.drawAllItems();
    };

    Window_ConstellationSelector.prototype.itemRect = function(index) {
        var rect = Window_Selectable.prototype.itemRect.call(this, index);
        rect.x += 4;
        rect.width -= 8;
        rect.y += 36; // Offset below header
        return rect;
    };

    Window_ConstellationSelector.prototype.drawItem = function(index) {
        var item = this._data[index];
        if (!item) return;

        var rect = this.itemRect(index);
        var isSelected = (this.active && this.index() === index);

        // Highlight selected item with bright glowing frame
        if (isSelected) {
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, 'rgba(80, 35, 105, 0.95)');
            drawBorderRect(this.contents, rect.x, rect.y, rect.width, rect.height, '#ff66c4', 2);
            drawBorderRect(this.contents, rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 4, '#38bdf8', 1);
        } else {
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, 'rgba(25, 20, 35, 0.7)');
            drawBorderRect(this.contents, rect.x, rect.y, rect.width, rect.height, 'rgba(147, 51, 234, 0.3)', 1);
        }

        // Icon (32x32)
        var iconSize = 32;
        var iconY = rect.y + (rect.height - iconSize) / 2;
        ImageManager.drawSkillIcon(this.contents, item, rect.x + 6, iconY, iconSize, iconSize, function() {
            safeDebouncedRedraw(this);
        }.bind(this));

        // Name
        this.resetTextColor();
        this.contents.fontSize = 16;
        if (isSelected) this.changeTextColor('#ffffff');
        this.drawText(item.name, rect.x + iconSize + 14, rect.y + 4, rect.width - iconSize - 95, 'left');

        // Cost
        this.contents.fontSize = 13;
        this.changeTextColor('#38bdf8');
        var cost = item.mpCost > 0 ? item.mpCost + " MP" : (item.tpCost > 0 ? item.tpCost + " TP" : "Free");
        this.drawText(cost, rect.x, rect.y + 6, rect.width - 12, 'right');
        this.resetTextColor();
        this.contents.fontSize = this.standardFontSize();
    };

    Window_ConstellationSelector.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
    };

})();
