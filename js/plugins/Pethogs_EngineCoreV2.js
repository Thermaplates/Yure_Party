/*:
 * @plugindesc [v2.0] Pethogs Engine Core V2 - Action Combat & Chained Skill System
 * @author Pethogs
 *
 * @help
 * ============================================================================
 * COMBO POINT & CHAINED SKILL SYSTEM
 * ============================================================================
 * Menambahkan resource CP (Combo Point) dan fitur skill chain.
 * 
 * Notetags (Skill):
 * <chain: x> 
 * Mengatur skill selanjutnya dalam rantai combo adalah Skill ID x.
 *
 * <qte_refund_cp: true>
 * Jika QTE Perfect pada skill ini, kembalikan 1 CP.
 *
 * <chain_skill>
 * Tandai skill ini sebagai "Chain Skill" murni. Jika di-cast langsung 
 * dari menu, skill ini TIDAK AKAN bisa melanjutkan combo.
 * Skill starter (seperti Spark) tidak perlu tag ini agar bisa memulai combo.
 */

(function() {

    // ============================================================================
    // 1. GAME_ACTOR CP SYSTEM
    // ============================================================================
    var _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.call(this);
        this._comboPoints = 3;
        this._bonusCpTurnTimer = 0;
        this._savedReservedCp = 0;
        this._nextTurnAllInCp = 0;
    };

    var _Game_Actor_onBattleStart = Game_Actor.prototype.onBattleStart;
    Game_Actor.prototype.onBattleStart = function() {
        _Game_Actor_onBattleStart.call(this);
        this._comboPoints = 3;
        this._bonusCpTurnTimer = 0;
        this._savedReservedCp = 0;
        this._nextTurnAllInCp = 0;
    };
    
    var _Game_Actor_onTurnEnd = Game_Actor.prototype.onTurnEnd;
    Game_Actor.prototype.onTurnEnd = function() {
        _Game_Actor_onTurnEnd.call(this);
        // Kurangi timer bonus CP terlebih dahulu
        if (this._comboPoints > 3) {
            this._bonusCpTurnTimer--;
            if (this._bonusCpTurnTimer <= 0) {
                this._comboPoints = 3;
                this._bonusCpTurnTimer = 0;
            }
        } else {
            this._bonusCpTurnTimer = 0;
        }

        // Natural regen: +1 CP per turn, tetapi hanya bisa maksimal sampai 3
        if (this._comboPoints < 3) {
            this._comboPoints++;
        }
        
        // --- NEXT TURN ALL IN CP HOOK ---
        if (this._nextTurnAllInCp > 0) {
            this.gainCP(this._nextTurnAllInCp);
            this._nextTurnAllInCp = 0;
        }
    };

    Game_Actor.prototype.getCP = function() {
        return this._comboPoints !== undefined ? this._comboPoints : 3;
    };

    Game_Actor.prototype.gainCP = function(amount) {
        if (this._comboPoints === undefined) this._comboPoints = 3;
        var oldCp = this._comboPoints;
        this._comboPoints = Math.min(this._comboPoints + amount, 9);
        
        if (this._comboPoints > 3) {
            this._bonusCpTurnTimer = 2; // Refresh / set timer 2 turns
        }
    };

    Game_Actor.prototype.payCP = function(amount) {
        if (this._comboPoints === undefined) this._comboPoints = 3;
        this._comboPoints = Math.max(this._comboPoints - amount, 0);
        
        if (this._comboPoints <= 3) {
            this._bonusCpTurnTimer = 0;
        }
    };

    // ============================================================================
    // 2. CP WINDOW HUD (Right Center)
    // ============================================================================
    function Window_CP() {
        this.initialize.apply(this, arguments);
    }
    Window_CP.prototype = Object.create(Window_Base.prototype);
    Window_CP.prototype.constructor = Window_CP;

    Window_CP.prototype.initialize = function() {
        var width = 160;
        var height = 72;
        var x = Graphics.boxWidth - width;
        var y = (Graphics.boxHeight - height) / 2; // Right Center
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.opacity = 255;
        this._actor = null;
        this.refresh();
    };

    Window_CP.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
        }
    };

    Window_CP.prototype.refresh = function() {
        this.contents.clear();
        if (!this._actor) return;
        this.changeTextColor(this.systemColor());
        this.drawText("CP:", 0, 0, 60);
        this.changeTextColor(this.normalColor());
        var cp = this._actor.getCP();
        this.drawText(cp + " / 3", 60, 0, 60, 'right');
    };

    Window_CP.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        // Sync with active battler
        if (BattleManager.actor()) {
            this.setActor(BattleManager.actor());
        } else if (BattleManager._subject && BattleManager._subject.isActor()) {
            this.setActor(BattleManager._subject);
        }
        if (this._actor) this.refresh();
    };

    // ============================================================================
    // 3. CHAIN SELECTION WINDOW
    // ============================================================================
    function Window_ChainSelect() {
        this.initialize.apply(this, arguments);
    }
    Window_ChainSelect.prototype = Object.create(Window_Command.prototype);
    Window_ChainSelect.prototype.constructor = Window_ChainSelect;

    Window_ChainSelect.prototype.initialize = function() {
        this._skillId = 0;
        this._actor = null;
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.hide();
        this.deactivate();
    };

    Window_ChainSelect.prototype.windowWidth = function() { return 300; };

    Window_ChainSelect.prototype.setup = function(actor, nextSkillId) {
        this._actor = actor;
        this._skillId = nextSkillId;
        var w = this.windowWidth();
        var h = this.windowHeight();
        this.x = (Graphics.boxWidth - w) / 2;
        this.y = (Graphics.boxHeight - h) / 2;
        this.refresh();
        this.select(0);
        this.show();
        this.activate();
    };

    Window_ChainSelect.prototype.makeCommandList = function() {
        if (this._skillId > 0 && $dataSkills[this._skillId]) {
            var skillName = $dataSkills[this._skillId].name;
            var cost = (this._actor && this._actor.actorId() === 1) ? 0 : 1;
            var costText = cost > 0 ? " (Cost " + cost + " CP)" : " (Free)";
            this.addCommand(skillName + costText, 'chain');
        }
        this.addCommand("Stop Chain", 'cancel');
    };

    // Inject to Scene_Battle
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        
        // this._cpWindow = new Window_CP();
        // this.addWindow(this._cpWindow);
        
        this._comboChainWindow = new Window_ChainSelect();
        this._comboChainWindow.setHandler('chain', this.onChainOk.bind(this));
        this._comboChainWindow.setHandler('cancel', this.onChainCancel.bind(this));
        this.addWindow(this._comboChainWindow);
        
        BattleManager.setComboChainWindow(this._comboChainWindow);
    };
    
    Scene_Battle.prototype.onChainOk = function() {
        this._comboChainWindow.hide();
        this._comboChainWindow.deactivate();
        BattleManager.executeChainSkill(this._comboChainWindow._actor, this._comboChainWindow._skillId);
    };

    Scene_Battle.prototype.onChainCancel = function() {
        this._comboChainWindow.hide();
        this._comboChainWindow.deactivate();
        BattleManager.cancelChain();
    };

    // ============================================================================
    // 4. BATTLEMANAGER CHAIN LOGIC
    // ============================================================================
    BattleManager.setComboChainWindow = function(window) {
        this._comboChainWindow = window;
    };

    var _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        // Jika action baru dimulai (bukan dari chain), reset flag
        if (this._phase !== 'chain_action') {
            this._isChainContinuation = false;
            $gameTemp._chainElementBonus = 0;
            $gameTemp._chainLastElement = 0;
        }
        
        // Track the first skill's element if it's the start of a chain
        if (this._action && this._action.item() && !this._isChainContinuation) {
            var item = this._action.item();
            if (item.damage && item.damage.elementId > 0) {
                $gameTemp._chainLastElement = item.damage.elementId;
            }
        }
        
        _BattleManager_startAction.call(this);
    };



    BattleManager.executeChainSkill = function(actor, skillId) {
        var cpCost = 1;
        actor.payCP(cpCost);
        SoundManager.playUseSkill();
        
        var nextSkill = $dataSkills[skillId];
        if (nextSkill && nextSkill.damage && nextSkill.damage.elementId > 0) {
            if ($gameTemp._chainLastElement === nextSkill.damage.elementId) {
                $gameTemp._chainElementBonus = ($gameTemp._chainElementBonus || 0) + 0.02;
            }
            $gameTemp._chainLastElement = nextSkill.damage.elementId;
        }
        
        var action = new Game_Action(actor);
        action.setSkill(skillId);
        
        if (this._targets && this._targets.length > 0 && this._targets[0].isAlive()) {
            action.setTarget(this._targets[0].index());
        }
        
        this._action = action;
        this._isChainContinuation = true; // Tandai bahwa ini adalah chain continuation
        
        this._phase = 'chain_action';
        this._subject = actor;
        this._targets = [];
        
        // HARUS dimasukkan ke dalam _actions agar Yanfly Battle Engine membacanya!
        actor._actions.unshift(action);
        
        _BattleManager_startAction.call(this); // Pakai fungsi original agar tidak mereset flag
    };

    BattleManager.cancelChain = function() {
        this._isChainContinuation = false;
        _BattleManager_endAction.call(this);
    };

    var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        var value = _Game_Action_makeDamageValue.call(this, target, critical);
        if ($gameTemp._chainElementBonus && $gameTemp._chainElementBonus > 0) {
            value *= (1.0 + $gameTemp._chainElementBonus);
        }
        return Math.round(value);
    };

    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        var result = target.result();
        if (result.isHit() && result.hpDamage > 0) {
            this._yureActionHit = true;
            if (this.subject().isActor()) {
                if (!this.subject()._unlockedChainSkills) this.subject()._unlockedChainSkills = [];
                var item = this.item();
                if (item && !this.subject()._unlockedChainSkills.includes(item.id)) {
                    this.subject()._unlockedChainSkills.push(item.id);
                }
            }
        }
    };

    // ============================================================================
    // Sprite_Damage (Colored Popups based on Value)
    // ============================================================================
    var _Sprite_Damage_createDigits = Sprite_Damage.prototype.createDigits;
    Sprite_Damage.prototype.createDigits = function(baseRow, value) {
        _Sprite_Damage_createDigits.call(this, baseRow, value);
        
        // baseRow 0 is usually HP damage. Only tint HP damage, not MP or heals.
        if (baseRow === 0 && value > 0) {
            var tint = [0, 0, 0, 0];
            if (value > 1000) {
                tint = [255, -50, -50, 150]; // Red-ish tint
            } else if (value > 500) {
                tint = [150, -50, 255, 150]; // Purple-ish tint
            } else if (value > 100) {
                tint = [255, 100, -50, 150]; // Orange-ish tint
            }
            
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] instanceof Sprite && this.children[i].bitmap === this._damageBitmap) {
                    this.children[i].setBlendColor(tint);
                }
            }
        }
    };

})();
