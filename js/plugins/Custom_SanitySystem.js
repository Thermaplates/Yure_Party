//=============================================================================
// Custom_SanitySystem.js
//=============================================================================
/*:
 * @plugindesc Sistem Sanity (Energi) Aktor kustom yang berkurang setelah battle/event.
 * @author Custom Build
 *
 * @param Default Max Sanity
 * @desc Batas maksimum Sanity bawaan jika tidak diatur lewat notetag aktor.
 * @default 100
 *
 * @param Battle Sanity Loss
 * @desc Jumlah Sanity yang berkurang untuk setiap anggota party setelah battle selesai.
 * @default 5
 *
 * @param Low Sanity Threshold
 * @desc Batas nilai Sanity dianggap "rendah" (Low) untuk memicu event.
 * @default 30
 *
 * @param Low Sanity Common Event
 * @desc ID Common Event yang dipicu secara otomatis ketika Sanity aktor turun di bawah batas rendah.
 * @default 0
 *
 * @param Low Sanity Switch
 * @desc ID Switch yang otomatis aktif (ON) jika ada aktor dalam party yang Sanity-nya rendah.
 * @default 0
 *
 * @help
 * --- NOTETAG AKTOR ---
 * Masukkan notetag berikut pada kolom Catatan (Note) Aktor di Database:
 *   <MaxSanity: 120>   -> Mengatur batas maksimum Sanity aktor tersebut.
 *
 * --- NOTETAG EVENT MAP ---
 * Tuliskan notetag berikut di kotak Catatan (Note) Event di Map:
 *   \san[-15]         -> Otomatis mengurangi Sanity Leader sebanyak 15 saat event dijalankan.
 *   \san[10]          -> Menambah Sanity Leader sebanyak 10 saat event dijalankan.
 *
 * --- PLUGIN COMMAND ---
 * Gunakan command berikut di dalam Event Commands:
 *   GainSanity [ActorID] [Value]
 *   Contoh: GainSanity 1 -15   -> Mengurangi Sanity Nia (Actor 1) sebanyak 15 poin.
 *   Contoh: GainSanity 2 20    -> Menambah Sanity Sophia (Actor 2) sebanyak 20 poin.
 *
 * --- SCRIPT CALLS ---
 * Anda juga bisa menggunakan kode javascript berikut:
 *   $gameActors.actor(actorId).sanity       -> Mengambil Sanity saat ini.
 *   $gameActors.actor(actorId).maxSanity()  -> Mengambil Max Sanity.
 *   $gameActors.actor(actorId).gainSanity(v) -> Menambah/mengurangi Sanity.
 */

(function() {
    if (typeof Imported !== 'undefined' && Imported.Yure_SanityTraumaSystem) {
        return; // Handled by Yure_SanityTraumaSystem
    }
    var parameters = PluginManager.parameters('Custom_SanitySystem');
    var defaultMaxSanity = Number(parameters['Default Max Sanity'] || 100);
    var battleSanityLoss = Number(parameters['Battle Sanity Loss'] || 5);
    var lowSanityThreshold = Number(parameters['Low Sanity Threshold'] || 30);
    var lowSanityCommonEvent = Number(parameters['Low Sanity Common Event'] || 0);
    var lowSanitySwitch = Number(parameters['Low Sanity Switch'] || 0);

    // Inisialisasi Sanity pada Game_Actor
    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        this.initSanity();
    };

    Game_Actor.prototype.initSanity = function() {
        this._sanity = this.maxSanity();
    };

    Game_Actor.prototype.maxSanity = function() {
        var actor = $dataActors[this.actorId()];
        if (actor && actor.meta && actor.meta.MaxSanity) {
            return Number(actor.meta.MaxSanity);
        }
        return defaultMaxSanity;
    };

    // Getter & Setter Sanity
    Object.defineProperty(Game_Actor.prototype, 'sanity', {
        get: function() {
            if (this._sanity === undefined) {
                this.initSanity();
            }
            return Math.max(0, Math.min(this.maxSanity(), this._sanity));
        },
        set: function(value) {
            this._sanity = Math.max(0, Math.min(this.maxSanity(), value));
        },
        configurable: true
    });

    Game_Actor.prototype.gainSanity = function(value) {
        var oldSanity = this.sanity;
        this.sanity += value;
        
        // Pemicu common event saat Sanity turun ke batas rendah
        if (this.sanity < oldSanity && this.sanity <= lowSanityThreshold && oldSanity > lowSanityThreshold) {
            if (lowSanityCommonEvent > 0) {
                $gameTemp.reserveCommonEvent(lowSanityCommonEvent);
            }
        }
        
        this.checkPartyLowSanitySwitch();
    };

    Game_Actor.prototype.checkPartyLowSanitySwitch = function() {
        if (lowSanitySwitch > 0) {
            var anyLow = $gameParty.members().some(function(actor) {
                return actor.sanity <= lowSanityThreshold;
            });
            $gameSwitches.setValue(lowSanitySwitch, anyLow);
        }
    };

    // Pengurangan Sanity setelah Pertarungan selesai
    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _BattleManager_endBattle.call(this, result);
        // Kurangi Sanity semua anggota party yang ikut bertarung jika pertarungan selesai normal (menang/melarikan diri)
        if (result === 0 || result === 1) { 
            $gameParty.battleMembers().forEach(function(actor) {
                actor.gainSanity(-battleSanityLoss);
            });
        }
    };

    // Otomatis mengurangi Sanity Leader saat berinteraksi dengan Event yang memiliki notetag \san[X]
    var _Game_Event_start = Game_Event.prototype.start;
    Game_Event.prototype.start = function() {
        _Game_Event_start.call(this);
        var ev = this.event();
        if (ev && ev.note) {
            var match = ev.note.match(/\\san\[(-?\d+)\]/i);
            if (match) {
                var value = Number(match[1]);
                var leader = $gameParty.leader();
                if (leader) {
                    leader.gainSanity(value);
                }
            }
        }
    };

    // Pengecekan Switch secara periodik di Map
    var _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.call(this, sceneActive);
        if (sceneActive && lowSanitySwitch > 0 && Graphics.frameCount % 60 === 0) {
            var anyLow = $gameParty.members().some(function(actor) {
                return actor.sanity <= lowSanityThreshold;
            });
            if ($gameSwitches.value(lowSanitySwitch) !== anyLow) {
                $gameSwitches.setValue(lowSanitySwitch, anyLow);
            }
        }
    };

    // Plugin Commands
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'GainSanity' || command === 'ChangeSanity') {
            var actorId = Number(args[0]);
            var value = Number(args[1]);
            var actor = $gameActors.actor(actorId);
            if (actor) {
                actor.gainSanity(value);
            }
        }
    };

})();
