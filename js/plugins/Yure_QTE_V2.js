//=============================================================================
// Yure_QTE_V2.js
//=============================================================================

/*:
 * @plugindesc Custom QTE System for Yure Party (V2).
 * @author Fauzi
 *
 * @param Success Multiplier
 * @desc Berapa kali lipat damage jika QTE berhasil? (Contoh: 2.0)
 * @default 2.0
 *
 * @param Fail Multiplier
 * @desc Berapa kali lipat damage jika QTE gagal? (Contoh: 1.0)
 * @default 1.0
 *
 * @param Stun State ID
 * @desc ID State Stun yang akan diberikan ke musuh jika QTE berhasil. (0 = mati)
 * @default 0
 *
 * @help
 * ============================================================================
 * YURE QTE PLUGIN V2
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
    var _Window_Selectable_isOpenAndActive = Window_Selectable.prototype.isOpenAndActive;
    Window_Selectable.prototype.isOpenAndActive = function() {
        if ($gameTemp && $gameTemp._qteActive && !(this instanceof Window_YureQTE)) {
            return false;
        }
        return _Window_Selectable_isOpenAndActive.call(this);
    };
    var parameters = PluginManager.parameters('Yure_QTE');
    var successMultiplier = Number(parameters['Success Multiplier'] || 2.0);
    var failMultiplier = Number(parameters['Fail Multiplier'] || 1.0);
    var stunStateId = Number(parameters['Stun State ID'] || 0);

    // Variables will be initialized during the hook instead of here to prevent null reference errors on boot.

    // --- QTE SYSTEM: EXECUTION PHASE INTERCEPT ---
    // Mencegah eksploitasi ESC dengan menampilkan QTE tepat sebelum aksi diproses!
    
    var _BattleManager_update = BattleManager.update;
    BattleManager.update = function() {
        if ($gameTemp._qteActive) {
            return; // Pause the entire battle system while QTE is running!
        }
        _BattleManager_update.call(this);
    };

    var _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        var subject = this._subject;
        var action = subject ? subject.currentAction() : null;
        
        // Sesuai permintaan user: Tunda QTE di pertarungan pertama/tutorial (Troop 5)
        if ($gameTroop && $gameTroop._troopId === 5) {
            _BattleManager_startAction.call(this);
            return;
        }

        if (action && action.item() && action.item().note && action.item().note.match(/<QTE/i)) {
            if (!action._yureQteHandled) {
                action._yureQteHandled = true; // Cegah infinite loop
                
                var scene = SceneManager._scene;
                if (scene && scene instanceof Scene_Battle) {
                    $gameTemp._qteActive = true;
                    
                    scene.startYureQTEExecution(action, function() {
                        $gameTemp._qteActive = false;
                    }.bind(this));
                }
            }
        }
        _BattleManager_startAction.call(this);
    };

    Scene_Battle.prototype.startYureQTEExecution = function(action, callback) {
        this._qteAction = action;
        this._qteCallback = callback;
        
        this._yureQteWindow = new Window_YureQTE();
        this._yureQteWindow.z = 9999;
        this.addWindow(this._yureQteWindow);
        SoundManager.playOk();
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        
        if (this._yureQteWindow) {
            if (this._yureQteWindow.isFinished()) {
                var success = this._yureQteWindow.isSuccess();
                this._qteAction._yureQteSuccess = success;
                
                // JIKA MISS, UBAH MENJADI SKILL LAIN (CONTOH: WGF)
                if (!success && this._qteAction.item().note) {
                    var match = this._qteAction.item().note.match(/<QTE:\s*(\d+)>/i);
                    if (match) {
                        var failId = parseInt(match[1]);
                        if (failId > 0) {
                            this._qteAction.setSkill(failId); // Ubah EGWF jadi WGF
                            this._qteAction._yureQteSuccess = null; // Hapus status gagal agar WGF jalan normal
                        }
                    }
                }
                
                this._windowLayer.removeChild(this._yureQteWindow);
                this._yureQteWindow = null;

                var text = success ? "PERFECT!" : "MISS";
                var color = success ? "#00FF00" : "#FF0000";
                var popup = new Sprite_QTEPopup(text, color);
                this.addChild(popup);

                // Lanjutkan eksekusi pertarungan (atau putar Ultimate Cut-in jika Perfect)
                var continueExecution = function() {
                    if (this._qteCallback) {
                        this._qteCallback();
                        this._qteCallback = null;
                    }
                }.bind(this);

                var item = this._qteAction ? this._qteAction.item() : null;
                if (success && item && item.note && /<ultimate>/i.test(item.note) && typeof this.playSkillCutin === 'function') {
                    var subject = this._qteAction.subject();
                    this.playSkillCutin(subject, item, continueExecution);
                } else {
                    continueExecution();
                }
            }
        }
    };

    var _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _BattleManager_initMembers.call(this);
        $gameTemp._qteActive = false;
    };

    var _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        $gameTemp._yureIgnoreDef = false;
        $gameTemp._qteActive = false;
    };

    // --- Damage & Stun Modifiers ---
    var _Game_Action_itemHit = Game_Action.prototype.itemHit;
    Game_Action.prototype.itemHit = function(target) {
        if (this._yureQteSuccess === false) {
            return 0; // 0% hit rate = Pasti Miss!
        }
        if (this._yureQteSuccess === true) {
            return 1; // 100% hit rate = Pasti Kena!
        }
        return _Game_Action_itemHit.call(this, target);
    };

    var _Game_Action_itemEva = Game_Action.prototype.itemEva;
    Game_Action.prototype.itemEva = function(target) {
        if (this._yureQteSuccess === true) {
            return 0; // 0% evasion = Musuh tidak bisa menghindar!
        }
        return _Game_Action_itemEva.call(this, target);
    };

    var _Game_BattlerBase_param = Game_BattlerBase.prototype.param;
    Game_BattlerBase.prototype.param = function(paramId) {
        if ($gameTemp._yureIgnoreDef && (paramId === 3 || paramId === 5)) {
            return 0;
        }
        return _Game_BattlerBase_param.call(this, paramId);
    };

    var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        if (this._yureQteSuccess === true) {
            $gameTemp._yureIgnoreDef = true; // Abaikan defense saat menghitung damage!
        }
        
        var value = _Game_Action_makeDamageValue.call(this, target, critical);
        
        if (this._yureQteSuccess === true) {
            $gameTemp._yureIgnoreDef = false; // Kembalikan defense seperti semula
            value *= successMultiplier;
        } else if (this._yureQteSuccess === false) {
            value = 0; // Jika QTE gagal, tidak masuk
        }
        return Math.round(value);
    };

    var _Game_Action_executeDamage = Game_Action.prototype.executeDamage;
    Game_Action.prototype.executeDamage = function(target, value) {
        _Game_Action_executeDamage.call(this, target, value);
        if (this._yureQteSuccess === true && target.isEnemy()) {
            if (stunStateId > 0) {
                target.addState(stunStateId);
                if (target.isStateAffected(stunStateId)) {
                    target._stateTurns[stunStateId] = 1;
                }
            }
        }
    };

    // --- QTE UI Window (CIRCULAR) ---
    function Window_YureQTE() {
        this.initialize.apply(this, arguments);
    }

    Window_YureQTE.prototype = Object.create(Window_Base.prototype);
    Window_YureQTE.prototype.constructor = Window_YureQTE;

    Window_YureQTE.prototype.initialize = function() {
        var width = 300;
        var height = 300;
        var x = (Graphics.boxWidth - width) / 2;
        var y = (Graphics.boxHeight - height) / 2;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        
        // 12 o'clock is -Math.PI / 2
        this._startAngle = -Math.PI / 2;
        this._currentAngle = this._startAngle;
        
        // Randomize Direction
        this._isClockwise = Math.random() < 0.5;
        
        // Konsisten dan Agak Lambat Sedikit (0.75 detik per putaran)
        var totalFrames = 45;
        this._speed = (Math.PI * 2) / totalFrames; 
        if (!this._isClockwise) this._speed *= -1;
        
        // Zona Hijau Kecil
        var targetArcSize = (Math.PI / 180) * (15 + Math.random() * 10); 
        
        // Posisi Zona Acak
        var offsetAngle = (Math.PI / 180) * (45 + Math.random() * 270);
        if (!this._isClockwise) offsetAngle *= -1; 
        
        this._targetMin = this._startAngle + offsetAngle;
        this._targetMax = this._targetMin + (this._isClockwise ? targetArcSize : -targetArcSize);
        
        if (this._targetMin > this._targetMax) {
            var temp = this._targetMin;
            this._targetMin = this._targetMax;
            this._targetMax = temp;
        }
        
        this._finished = false;
        this._success = false;
    };

    Window_YureQTE.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (this._finished) return;

        this._currentAngle += this._speed;
        
        // TIDAK ADA BATAS WAKTU (Looping terus menerus!)
        if (this._isClockwise && this._currentAngle > this._startAngle + (Math.PI * 2)) {
            this._currentAngle -= Math.PI * 2;
        }
        if (!this._isClockwise && this._currentAngle < this._startAngle - (Math.PI * 2)) {
            this._currentAngle += Math.PI * 2;
        }
        
        if (Input.isTriggered('ok') || Input.isTriggered('cancel') || TouchInput.isTriggered()) {
            this.finishQTE();
        }

        this.refresh();
    };

    Window_YureQTE.prototype.drawArc = function(x, y, radius, startAngle, endAngle, color, lineWidth) {
        var ctx = this.contents._context;
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle, false);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
        this.contents._setDirty();
    };

    Window_YureQTE.prototype.refresh = function() {
        this.contents.clear();
        
        var cx = this.contentsWidth() / 2;
        var cy = this.contentsHeight() / 2 + 10;
        var radius = 80;
        
        this.contents.fontSize = 24;
        this.contents.drawText("TEKAN [Z] / KLIK!", 0, 0, this.contentsWidth(), 'center');
        
        // Draw Background Ring (Grey)
        var endArc = this._startAngle + (Math.PI * 2);
        this.drawArc(cx, cy, radius, this._startAngle, endArc, '#444444', 20);
        
        // Draw Target Zone (Green)
        this.drawArc(cx, cy, radius, this._targetMin, this._targetMax, '#00FF00', 20);

        // Draw Cursor (Clock Hand)
        var ctx = this.contents._context;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        var cursorEndX = cx + Math.cos(this._currentAngle) * (radius + 15);
        var cursorEndY = cy + Math.sin(this._currentAngle) * (radius + 15);
        ctx.lineTo(cursorEndX, cursorEndY);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        this.contents._setDirty();
    };

    Window_YureQTE.prototype.finishQTE = function() {
        this._finished = true;
        
        // Normalize checking logic to handle multiple rotations
        // Karena loop menggunakan pengurangan/penambahan 2PI, 
        // pastikan perbandingan akurat!
        var checkAngle = this._currentAngle;
        while (checkAngle < this._startAngle) checkAngle += Math.PI * 2;
        while (checkAngle > this._startAngle + Math.PI * 2) checkAngle -= Math.PI * 2;
        
        var tMin = this._targetMin;
        var tMax = this._targetMax;
        while (tMin < this._startAngle) { tMin += Math.PI * 2; tMax += Math.PI * 2; }
        while (tMin > this._startAngle + Math.PI * 2) { tMin -= Math.PI * 2; tMax -= Math.PI * 2; }

        if (checkAngle >= tMin && checkAngle <= tMax) {
            this._success = true;
            SoundManager.playUseSkill();
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

