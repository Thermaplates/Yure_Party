/*:
 * @plugindesc Custom QTE System for Yure Party.
 * @author Yure (Custom)
 *
 * @param Success Multiplier
 * @desc Damage multiplier on QTE success (e.g. 2.0)
 * @default 2.0
 *
 * @param Fail Multiplier
 * @desc Damage multiplier on QTE fail (e.g. 1.0)
 * @default 1.0
 * 
 * @param Stun State ID
 * @desc State ID to apply to target on QTE success (0 to disable). Example: 10 (Sleep)
 * @default 0
 *
 * @help
 * ============================================================================
 * YURE QTE PLUGIN
 * ============================================================================
 * Tambahkan tag <QTE> pada kotak "Note" di bagian Skills (Database).
 * Saat skill tersebut digunakan, sebuah meteran bar akan muncul di layar.
 * Pemain harus menekan Z (Atau klik layar) saat kursor berada di zona hijau!
 * 
 * Jika berhasil, damage akan berlipat ganda!
 * Jika gagal, damage akan normal atau berkurang sesuai parameter.
 */

var Imported = Imported || {};
Imported.Yure_QTE = true;

var Yure = Yure || {};
Yure.QTE = Yure.QTE || {};

(function() {
    var parameters = PluginManager.parameters('Yure_QTE');
    var successMultiplier = Number(parameters['Success Multiplier'] || 2.0);
    var failMultiplier = Number(parameters['Fail Multiplier'] || 1.0);
    var stunStateId = Number(parameters['Stun State ID'] || 0);

    // Store QTE result globally
    $gameTemp._qteResult = null;

    // --- UNIVERSAL MENU-PHASE INTERCEPT ---
    // This intercepts the player's menu selection before the action is even submitted to the BattleManager!
    
    Scene_Battle.prototype.startYureQTEMenu = function(action, callback) {
        this._qteAction = action;
        this._qteCallback = callback;
        
        this._yureQteWindow = new Window_YureQTE();
        this._yureQteWindow.z = 9999;
        this.addWindow(this._yureQteWindow);
        SoundManager.playOk();
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        if (this._yureQteWindow) {
            this._yureQteWindow.update();
            if (this._yureQteWindow.isFinished()) {
                var success = this._yureQteWindow.isSuccess();
                this._qteAction._yureQteSuccess = success; // Bind result to the action itself!
                
                this._windowLayer.removeChild(this._yureQteWindow);
                this._yureQteWindow = null;

                var text = success ? "PERFECT!" : "MISS";
                var color = success ? "#00FF00" : "#FF0000";
                var popup = new Sprite_QTEPopup(text, color);
                this.addChild(popup);

                // Execute the delayed selection callback!
                if (this._qteCallback) {
                    this._qteCallback();
                    this._qteCallback = null;
                }
            }
            return; // Freeze the rest of the menu updates while QTE is playing
        }
        _Scene_Battle_update.call(this);
    };

    var _Scene_Battle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
    Scene_Battle.prototype.onEnemyOk = function() {
        var action = BattleManager.inputtingAction();
        if (action && action.item() && action.item().note && action.item().note.match(/<QTE>/i)) {
            this.startYureQTEMenu(action, function() {
                _Scene_Battle_onEnemyOk.call(this);
            }.bind(this));
            return;
        }
        _Scene_Battle_onEnemyOk.call(this);
    };

    var _Scene_Battle_onActorOk = Scene_Battle.prototype.onActorOk;
    Scene_Battle.prototype.onActorOk = function() {
        var action = BattleManager.inputtingAction();
        if (action && action.item() && action.item().note && action.item().note.match(/<QTE>/i)) {
            this.startYureQTEMenu(action, function() {
                _Scene_Battle_onActorOk.call(this);
            }.bind(this));
            return;
        }
        _Scene_Battle_onActorOk.call(this);
    };

    var _Scene_Battle_onSelectAction = Scene_Battle.prototype.onSelectAction;
    Scene_Battle.prototype.onSelectAction = function() {
        var action = BattleManager.inputtingAction();
        if (action && action.item() && action.item().note && action.item().note.match(/<QTE>/i) && !action.needsSelection()) {
            this.startYureQTEMenu(action, function() {
                _Scene_Battle_onSelectAction.call(this);
            }.bind(this));
            return;
        }
        _Scene_Battle_onSelectAction.call(this);
    };

    // --- Damage & Stun Modifiers ---
    var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        var value = _Game_Action_makeDamageValue.call(this, target, critical);
        return value;
    };

    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        
        // If QTE was successful, the target took a hit, and Stun State ID is configured
        if ($gameTemp._qteResult === true && target.result().isHit() && stunStateId > 0) {
            target.addState(stunStateId);
            // Optionally force it to last exactly 1 turn if they want strict "1 turn" regardless of state settings:
            if (target.isStateAffected(stunStateId)) {
                target._stateTurns[stunStateId] = 1;
            }
        }
    };

    // --- QTE UI Window ---
    function Window_YureQTE() {
        this.initialize.apply(this, arguments);
    }

    Window_YureQTE.prototype = Object.create(Window_Base.prototype);
    Window_YureQTE.prototype.constructor = Window_YureQTE;

    Window_YureQTE.prototype.initialize = function() {
        var width = 500;
        var height = 150;
        var x = (Graphics.boxWidth - width) / 2;
        var y = Graphics.boxHeight / 2 - height;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._progress = 0;
        
        // Randomize speed a bit to make it unpredictable (between 4 and 8 pixels per frame)
        this._speed = 4 + Math.random() * 4; 
        
        // Target Zone
        var maxW = this.contentsWidth();
        var targetWidth = 60; // Size of green zone
        this._targetMin = (maxW / 2) - (targetWidth / 2) + (Math.random() * 60 - 30); // Random offset
        this._targetMax = this._targetMin + targetWidth;
        
        this._finished = false;
        this._success = false;
        this._cursorX = 0;
    };

    Window_YureQTE.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (this._finished) return;

        this._progress += this._speed;
        this._cursorX = this._progress;
        
        var maxW = this.contentsWidth();
        
        if (Input.isTriggered('ok') || Input.isTriggered('cancel') || TouchInput.isTriggered()) {
            this.finishQTE();
        } else if (this._progress > maxW) {
            this.finishQTE(); // Auto fail if time runs out
        }

        this.refresh();
    };

    Window_YureQTE.prototype.refresh = function() {
        this.contents.clear();
        
        var maxW = this.contentsWidth();
        var h = this.contentsHeight();
        var barY = h / 2;
        var barH = 24;
        
        // Draw Instructions
        this.contents.fontSize = 24;
        this.contents.drawText("TEKAN [Z] ATAU KLIK!", 0, 0, maxW, 'center');
        
        // Draw Background Bar
        this.contents.fillRect(0, barY, maxW, barH, '#222222');
        this.contents.fillRect(2, barY + 2, maxW - 4, barH - 4, '#555555');
        
        // Draw Target Zone (Green)
        var targetW = this._targetMax - this._targetMin;
        this.contents.fillRect(this._targetMin, barY, targetW, barH, '#00AA00');
        this.contents.fillRect(this._targetMin + 2, barY + 2, targetW - 4, barH - 4, '#00FF00');

        // Draw Cursor (White Line)
        this.contents.fillRect(this._cursorX - 4, barY - 10, 8, barH + 20, '#000000');
        this.contents.fillRect(this._cursorX - 2, barY - 8, 4, barH + 16, '#FFFFFF');
    };

    Window_YureQTE.prototype.finishQTE = function() {
        this._finished = true;
        if (this._cursorX >= this._targetMin && this._cursorX <= this._targetMax) {
            this._success = true;
            SoundManager.playUseSkill(); // Or maybe play a custom success SE
        } else {
            this._success = false;
            SoundManager.playBuzzer();
        }
    };

    Window_YureQTE.prototype.isFinished = function() {
        return this._finished;
    };

    Window_YureQTE.prototype.isSuccess = function() {
        return this._success;
    };


    // --- Popup Sprite ---
    function Sprite_QTEPopup() {
        this.initialize.apply(this, arguments);
    }
    Sprite_QTEPopup.prototype = Object.create(Sprite.prototype);
    Sprite_QTEPopup.prototype.constructor = Sprite_QTEPopup;

    Sprite_QTEPopup.prototype.initialize = function(text, color) {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(400, 100);
        
        // Text Outline
        this.bitmap.outlineColor = 'black';
        this.bitmap.outlineWidth = 6;
        
        this.bitmap.textColor = color;
        this.bitmap.fontSize = 64;
        this.bitmap.fontItalic = true;
        this.bitmap.drawText(text, 0, 0, 400, 100, 'center');
        
        this.x = Graphics.boxWidth / 2 - 200;
        this.y = Graphics.boxHeight / 2 - 180;
        this._duration = 60;
    };

    Sprite_QTEPopup.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this._duration--;
        this.y -= 1; // Float upwards
        
        if (this._duration < 20) {
            this.opacity = (this._duration / 20) * 255;
        }
        
        if (this._duration <= 0) {
            if (this.parent) this.parent.removeChild(this);
        }
    };

})();
