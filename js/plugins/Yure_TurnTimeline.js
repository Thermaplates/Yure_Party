//=============================================================================
// Yure_TurnTimeline.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Turn Order Timeline UI (Honkai Star Rail Style)
 * @author Yure Party Team
 *
 * @param timeline_x
 * @text Timeline X
 * @type number
 * @default 0
 *
 * @param timeline_y
 * @text Timeline Y
 * @type number
 * @default 0
 *
 * @param timeline_w
 * @text Timeline Width
 * @type number
 * @default 816
 *
 * @param timeline_h
 * @text Timeline Height
 * @type number
 * @default 100
 *
 * @param icon_size
 * @text Icon Size
 * @type number
 * @default 40
 *
 * @param icon_spacing
 * @text Icon Spacing
 * @type number
 * @default 70
 *
 * @help
 * Menambahkan antarmuka (UI) Timeline di sisi kiri layar pertarungan
 * untuk melihat urutan giliran menyerang.
 *
 * Pada fase memilih perintah (Input Phase), urutan ini adalah PREDIKSI
 * berdasarkan status AGI (Agility).
 * Pada fase eksekusi, urutan ini akan bergeser turun layaknya sistem ATB/CTB.
 */

(function() {

    // ============================================================================
    // 1. Window_TurnTimeline
    // ============================================================================
    function Window_TurnTimeline() {
        this.initialize.apply(this, arguments);
    }

    Window_TurnTimeline.prototype = Object.create(Window_Base.prototype);
    Window_TurnTimeline.prototype.constructor = Window_TurnTimeline;

    Window_TurnTimeline.prototype.initialize = function() {
        var p = PluginManager.parameters('Yure_TurnTimeline');
        var width = p['timeline_w'] !== undefined ? Number(p['timeline_w']) : Graphics.boxWidth;
        var height = p['timeline_h'] !== undefined ? Number(p['timeline_h']) : 100;
        var x = p['timeline_x'] !== undefined ? Number(p['timeline_x']) : 0;
        var y = p['timeline_y'] !== undefined ? Number(p['timeline_y']) : 0;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.opacity = 0; // Make background invisible for floating icons
        this._battlers = [];
        this._lastUpdateCount = 0;
        this._lastParamHash = JSON.stringify(p);
        this.refresh();
    };

    Window_TurnTimeline.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        
        var p = PluginManager.parameters('Yure_TurnTimeline');
        if (p) {
            var hash = JSON.stringify(p);
            if (this._lastParamHash !== hash) {
                this._lastParamHash = hash;
                this.width = p['timeline_w'] !== undefined ? Number(p['timeline_w']) : Graphics.boxWidth;
                this.height = p['timeline_h'] !== undefined ? Number(p['timeline_h']) : 100;
                this.x = p['timeline_x'] !== undefined ? Number(p['timeline_x']) : 0;
                this.y = p['timeline_y'] !== undefined ? Number(p['timeline_y']) : 0;
                this.refresh();
            }
        }
        
        // Refresh every 30 frames or if battler state changes
        this._lastUpdateCount++;
        if (this._lastUpdateCount >= 15) {
            this._lastUpdateCount = 0;
            this.refresh();
        }
    };

    Window_TurnTimeline.prototype.getTimelineBattlers = function() {
        var battlers = [];
        
        // If Yanfly CTB is active, use their exact real-time turn order!
        if (typeof BattleManager.ctbTurnOrder !== 'undefined') {
            var ctbOrder = BattleManager.ctbTurnOrder();
            if (ctbOrder && ctbOrder.length > 0) {
                // Return exactly the order CTB calculated
                return ctbOrder.filter(function(b) { return b && b.isAlive(); });
            }
        }
        
        // Fallback for standard Turn-Based (DTB)
        var actors = $gameParty.aliveMembers();
        var enemies = $gameTroop.aliveMembers();
        var allAlive = actors.concat(enemies);

        if (BattleManager.isInputting() || BattleManager._phase === 'start') {
            // Predictive Mode (Based solely on AGI)
            battlers = allAlive.slice().sort(function(a, b) {
                return b.agi - a.agi;
            });
        } else {
            // Execution Mode (Real order)
            if (BattleManager._subject && BattleManager._subject.isAlive()) {
                battlers.push(BattleManager._subject);
            }
            if (BattleManager._actionBattlers) {
                for (var i = 0; i < BattleManager._actionBattlers.length; i++) {
                    var b = BattleManager._actionBattlers[i];
                    if (b && b.isAlive() && battlers.indexOf(b) < 0) {
                        battlers.push(b);
                    }
                }
            }
            var remaining = allAlive.filter(function(b) {
                return battlers.indexOf(b) < 0;
            }).sort(function(a, b) {
                return b.agi - a.agi;
            });
            battlers = battlers.concat(remaining);
        }
        
        return battlers;
    };

    Window_TurnTimeline.prototype.refresh = function() {
        this.contents.clear();
        this._battlers = this.getTimelineBattlers();
        
        var p = PluginManager.parameters('Yure_TurnTimeline');
        var iconSize = p['icon_size'] !== undefined ? Number(p['icon_size']) : 40;
        var spacing = p['icon_spacing'] !== undefined ? Number(p['icon_spacing']) : 70;
        
        var totalWidth = this._battlers.length * spacing;
        var startX = (this.width - totalWidth) / 2; // Center horizontally
        if (startX < 10) startX = 10;
        
        for (var i = 0; i < this._battlers.length; i++) {
            var battler = this._battlers[i];
            var x = startX + (i * spacing);
            var y = 10;
            
            if (x + 60 > this.width) break; // Limit to prevent falling off screen
            
            // Draw background gauge/box
            this.contents.fillRect(x, y, 60, iconSize, 'rgba(0,0,0,0.6)');
            
            // Draw Icon or Name
            if (battler.isActor()) {
                // Actor: Draw blue tint box and face/icon
                this.contents.fillRect(x, y + iconSize - 5, 60, 5, '#4488ff');
                this.contents.fontSize = 14;
                this.changeTextColor('#4488ff');
                var name = battler.name().substring(0, 5);
                this.drawText(name, x + 4, y, 52, 'center');
            } else {
                // Enemy: Draw red tint box
                this.contents.fillRect(x, y + iconSize - 5, 60, 5, '#ff4444');
                this.contents.fontSize = 14;
                this.changeTextColor('#ff4444');
                var ename = battler.name().substring(0, 5);
                this.drawText(ename, x + 4, y, 52, 'center');
            }
            this.resetTextColor();
            
            // Draw AGI as the "Gauge Value" to show why they are there
            this.contents.fontSize = 12;
            this.changeTextColor(this.systemColor());
            this.drawText("SPD " + battler.agi, x, y + 20, 60, 'center');
            this.resetTextColor();
            
            // Draw active arrow if it's their turn
            if (i === 0 && (BattleManager._phase === 'action' || BattleManager._phase === 'turn')) {
                this.changeTextColor(this.textColor(3));
                this.contents.fontSize = 20;
                this.drawText("▲", x, y + iconSize + 20, 60, 'center');
                this.resetTextColor();
            }
        }
    };

    // ============================================================================
    // Hook into Scene_Battle
    // ============================================================================
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        // this._turnTimelineWindow = new Window_TurnTimeline();
        // this.addWindow(this._turnTimelineWindow);
    };

    // Matikan UI Bawaan Yanfly CTB agar tidak dobel/tumpang tindih
    // (DINONAKTIFKAN KARENA SEKARANG MENGGUNAKAN UI YANFLY)
    /*
    if (typeof Scene_Battle.prototype.createCTBWindow !== 'undefined') {
        Scene_Battle.prototype.createCTBWindow = function() {
            // override with nothing
        };
    }
    */

})();
