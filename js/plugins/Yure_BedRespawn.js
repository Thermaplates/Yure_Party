//=============================================================================
// Yure_BedRespawn.js
//=============================================================================
/*:
 * @plugindesc [v1.0] Sistem Respawn ke Kasur / Checkpoint saat Karakter Mati (Pengganti Game Over).
 * @author Yure Party Team
 *
 * @param --- Default Respawn Point ---
 * @default
 *
 * @param Default Map ID
 * @parent --- Default Respawn Point ---
 * @desc ID Map default untuk titik respawn kasur jika belum ada kasur yang didaftarkan.
 * @type number
 * @default 2
 *
 * @param Default X
 * @parent --- Default Respawn Point ---
 * @desc Koordinat X default pada map respawn.
 * @type number
 * @default 2
 *
 * @param Default Y
 * @parent --- Default Respawn Point ---
 * @desc Koordinat Y default pada map respawn.
 * @type number
 * @default 7
 *
 * @param Default Direction
 * @parent --- Default Respawn Point ---
 * @desc Arah hadap karakter saat respawn (2: Bawah, 4: Kiri, 6: Kanan, 8: Atas).
 * @type select
 * @option Bawah (Down)
 * @value 2
 * @option Kiri (Left)
 * @value 4
 * @option Kanan (Right)
 * @value 6
 * @option Atas (Up)
 * @value 8
 * @default 2
 *
 * @param --- Pengaturan Respawn ---
 * @default
 *
 * @param Auto Register Bed Events
 * @parent --- Pengaturan Respawn ---
 * @desc Otomatis simpan titik respawn saat player berinteraksi dengan event bernama "Sleep", "Bed", "Kasur" atau notetag <bed>.
 * @type boolean
 * @default true
 *
 * @param Full Recover On Respawn
 * @parent --- Pengaturan Respawn ---
 * @desc Pulihkan 100% HP, MP, TP/Rage, dan Sanity saat respawn di kasur.
 * @type boolean
 * @default true
 *
 * @param Advance Day On Respawn
 * @parent --- Pengaturan Respawn ---
 * @desc Majukan hari dan set jam ke pagi hari (MOG_TimeSystem) saat respawn.
 * @type boolean
 * @default true
 *
 * @param Morning Hour
 * @parent --- Pengaturan Respawn ---
 * @desc Jam bangun tidur di pagi hari jika Advance Day aktif.
 * @type number
 * @default 6
 *
 * @param Wakeup Common Event
 * @parent --- Pengaturan Respawn ---
 * @desc ID Common Event yang otomatis dijalankan setelah bangun di kasur (0 = Tidak ada).
 * @type common_event
 * @default 0
 *
 * @param Wakeup ME
 * @parent --- Pengaturan Respawn ---
 * @desc Nama Music Effect (ME) yang diputar saat terbangun di kasur (Contoh: Inn).
 * @type file
 * @dir audio/me/
 * @default Inn
 *
 * @param Fade Duration
 * @parent --- Pengaturan Respawn ---
 * @desc Durasi transisi layar hitam (Fade In / Fade Out) dalam hitungan frame (60 frame = 1 detik).
 * @type number
 * @default 30
 *
 * @help
 * ============================================================================
 * PENJELASAN SISTEM RESPAWN KASUR (BED RESPAWN SYSTEM)
 * ============================================================================
 * 
 * Plugin ini menggantikan layar "Game Over" standar RPG Maker:
 * - Saat seluruh anggota party kalah dalam pertarungan (Battle Defeat) atau mati
 *   di Map, pemain tidak akan dilempar ke Title Screen.
 * - Pemain akan otomatis terbangun kembali di dekat kasur (Bed Respawn Point).
 * - Seluruh anggota tim dihidupkan kembali dengan HP/MP/TP/Sanity terpulihkan.
 *
 * ----------------------------------------------------------------------------
 * CARA MENGATUR TITIK KASUR / CHECKPOINT BARU
 * ----------------------------------------------------------------------------
 * 
 * 1. Otomatis Lewat Event Kasur:
 *    - Buat event kasur dengan nama "Sleep", "Bed", atau "Kasur".
 *    - Atau beri notetag <bed> / <respawn> pada kolom Catatan (Note) event.
 *    - Saat player berinteraksi / tidur di kasur tersebut, posisinya otomatis
 *      tersimpan sebagai titik respawn aktif!
 *
 * 2. Menggunakan Plugin Command di Event:
 *    - SetBed [MapID] [X] [Y] [Direction]
 *      Contoh: SetBed 2 2 7 2     -> Menyimpan Map 2, koordinat (2, 7), hadap Bawah.
 *
 *    - SetBedHere
 *      -> Otomatis menyimpan posisi map & koordinat player saat ini sebagai kasur.
 *
 *    - SetBedEvent [EventID]
 *      Contoh: SetBedEvent 9      -> Menyimpan posisi Event ID 9 di map saat ini.
 *
 *    - RespawnNow
 *      -> Memaksa player langsung respawn ke kasur saat ini juga.
 *
 * 3. Menggunakan Script Call (Javascript):
 *    - RespawnManager.setBed(mapId, x, y, direction);
 *    - RespawnManager.setBedEvent(eventId);
 *    - RespawnManager.setBedHere();
 *    - RespawnManager.respawn();
 *
 * Data kasur disimpan ke dalam Save File secara otomatis.
 */

var Imported = Imported || {};
Imported.Yure_BedRespawn = true;

var RespawnManager = RespawnManager || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_BedRespawn');
    var defaultMapId = Number(parameters['Default Map ID'] || 2);
    var defaultX = Number(parameters['Default X'] || 2);
    var defaultY = Number(parameters['Default Y'] || 7);
    var defaultDirection = Number(parameters['Default Direction'] || 2);

    var autoRegisterBedEvents = (parameters['Auto Register Bed Events'] !== 'false');
    var fullRecoverOnRespawn = (parameters['Full Recover On Respawn'] !== 'false');
    var advanceDayOnRespawn = (parameters['Advance Day On Respawn'] !== 'false');
    var morningHour = Number(parameters['Morning Hour'] || 6);
    var wakeupCommonEvent = Number(parameters['Wakeup Common Event'] || 0);
    var wakeupME = String(parameters['Wakeup ME'] || 'Inn');
    var fadeDuration = Number(parameters['Fade Duration'] || 30);

    // ============================================================================
    // 1. DATA STORAGE & MANAGEMENT
    // ============================================================================

    RespawnManager.getBedLocation = function() {
        if ($gameSystem && $gameSystem._respawnBed) {
            return $gameSystem._respawnBed;
        }
        return {
            mapId: defaultMapId,
            x: defaultX,
            y: defaultY,
            direction: defaultDirection
        };
    };

    RespawnManager.setBed = function(mapId, x, y, direction) {
        if (!$gameSystem) return;
        $gameSystem._respawnBed = {
            mapId: Number(mapId) || defaultMapId,
            x: Number(x) || 0,
            y: Number(y) || 0,
            direction: Number(direction) || 2
        };
    };

    RespawnManager.setBedHere = function() {
        if ($gameMap && $gamePlayer) {
            RespawnManager.setBed(
                $gameMap.mapId(),
                $gamePlayer.x,
                $gamePlayer.y,
                $gamePlayer.direction()
            );
        }
    };

    RespawnManager.setBedEvent = function(eventId) {
        if (!$gameMap) return;
        var ev = $gameMap.event(eventId);
        if (ev) {
            var targetX = ev.x;
            var targetY = ev.y;
            var dir = 2;

            if ($gameMap.isPassable(targetX + 1, targetY, 4)) {
                targetX += 1;
                dir = 4;
            } else if ($gameMap.isPassable(targetX, targetY + 1, 8)) {
                targetY += 1;
                dir = 8;
            }

            RespawnManager.setBed($gameMap.mapId(), targetX, targetY, dir);
        }
    };

    // ============================================================================
    // 2. AUTO-REGISTER BED EVENTS
    // ============================================================================
    var _Game_Event_start_BedRespawn = Game_Event.prototype.start;
    Game_Event.prototype.start = function() {
        _Game_Event_start_BedRespawn.call(this);
        if (autoRegisterBedEvents) {
            var ev = this.event();
            if (ev) {
                var isBed = false;
                if (ev.name && (ev.name.match(/sleep/i) || ev.name.match(/bed/i) || ev.name.match(/kasur/i))) {
                    isBed = true;
                }
                if (ev.note && (ev.note.match(/<bed>/i) || ev.note.match(/<respawn>/i) || ev.note.match(/<bed_respawn>/i))) {
                    isBed = true;
                }
                if (isBed) {
                    var playerX = $gamePlayer.x;
                    var playerY = $gamePlayer.y;
                    var playerDir = $gamePlayer.direction();
                    // Simpan posisi berdiri player saat berinteraksi dengan kasur
                    RespawnManager.setBed($gameMap.mapId(), playerX, playerY, playerDir);
                }
            }
        }
    };

    // ============================================================================
    // 3. EXECUTE RESPAWN SEQUENCE
    // ============================================================================
    RespawnManager.executeRecovery = function() {
        if (!$gameParty) return;

        // Hidupkan kembali semua anggota party
        $gameParty.reviveBattleMembers();

        // Pulihkan HP, MP, TP & Sanity
        if (fullRecoverOnRespawn) {
            $gameParty.members().forEach(function(actor) {
                if (actor) {
                    actor.recoverAll();
                    // Pulihkan Sanity jika plugin Sanity aktif
                    if (typeof actor.initSanity === 'function') {
                        actor.initSanity();
                    }
                }
            });
        } else {
            $gameParty.members().forEach(function(actor) {
                if (actor && actor.isDead()) {
                    actor.revive();
                    actor.setHp(1);
                }
            });
        }

        // Majukan waktu ke pagi jika MOG_TimeSystem aktif
        if (advanceDayOnRespawn && $gameSystem && typeof $gameSystem.add_day === 'function') {
            $gameSystem.add_day(1);
            if (typeof $gameSystem.set_hour === 'function') $gameSystem.set_hour(morningHour);
            if (typeof $gameSystem.set_minute === 'function') $gameSystem.set_minute(0);
        }

        // Mainkan ME Bangun Tidur jika ada
        if (wakeupME && wakeupME.trim() !== '') {
            AudioManager.playMe({ name: wakeupME.trim(), volume: 90, pitch: 100, pan: 0 });
        }
    };

    RespawnManager.respawn = function() {
        var bed = RespawnManager.getBedLocation();
        RespawnManager.executeRecovery();

        if ($gamePlayer) {
            $gamePlayer.reserveTransfer(bed.mapId, bed.x, bed.y, bed.direction, 0);
        }

        if (wakeupCommonEvent > 0 && $gameTemp) {
            $gameTemp.reserveCommonEvent(wakeupCommonEvent);
        }

        if ($gameScreen) {
            $gameScreen.startFadeIn(fadeDuration);
        }
    };

    // ============================================================================
    // 4. OVERRIDE BATTLE DEFEAT (BATTLE -> BED RESPAWN)
    // ============================================================================
    var _BattleManager_updateBattleEnd = BattleManager.updateBattleEnd;
    BattleManager.updateBattleEnd = function() {
        if (this.isBattleTest()) {
            AudioManager.stopBgm();
            SceneManager.exit();
            this._phase = null;
            return;
        }

        // Jangan jalankan Bed Respawn jika Nia (protagonis) gugur! Kematian Nia harus Game Over & Ulang.
        var nia = (typeof $gameActors !== 'undefined' && $gameActors) ? $gameActors.actor(1) : null;
        var isNiaDead = nia && nia.isDead() && $gameParty.allMembers().some(function(a) { return a.actorId() === 1 || (a.name && a.name().toLowerCase() === 'nia'); });
        if (isNiaDead) {
            _BattleManager_updateBattleEnd.call(this);
            return;
        }

        if (!this._escaped && $gameParty.isAllDead()) {
            // Batalkan Game Over standar, arahkan ke Bed Respawn!
            var bed = RespawnManager.getBedLocation();
            RespawnManager.executeRecovery();

            $gamePlayer.reserveTransfer(bed.mapId, bed.x, bed.y, bed.direction, 0);

            if (wakeupCommonEvent > 0 && $gameTemp) {
                $gameTemp.reserveCommonEvent(wakeupCommonEvent);
            }

            $gameTemp._yureBedRespawnPendingFadeIn = true;

            // Layar hitam transisi dari Battle ke Map
            if ($gameScreen) {
                $gameScreen.startFadeOut(1);
            }

            SceneManager.pop();
            this._phase = null;
            return;
        }

        _BattleManager_updateBattleEnd.call(this);
    };

    // ============================================================================
    // 5. OVERRIDE MAP GAME OVER (MAP DEATH -> BED RESPAWN)
    // ============================================================================
    var _Scene_Map_checkGameover = Scene_Map.prototype.checkGameover;
    Scene_Map.prototype.checkGameover = function() {
        // Jangan jalankan Bed Respawn jika Nia (protagonis) gugur! Kematian Nia harus Game Over & Ulang.
        var nia = (typeof $gameActors !== 'undefined' && $gameActors) ? $gameActors.actor(1) : null;
        var isNiaDead = nia && nia.isDead() && $gameParty.allMembers().some(function(a) { return a.actorId() === 1 || (a.name && a.name().toLowerCase() === 'nia'); });
        if (isNiaDead) {
            _Scene_Map_checkGameover.call(this);
            return;
        }

        if ($gameParty.isAllDead()) {
            RespawnManager.respawn();
            return;
        }
        _Scene_Map_checkGameover.call(this);
    };

    // Tangani Fade In halus saat tiba di kamar tidur setelah respawn dari battle
    var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        if ($gameTemp && $gameTemp._yureBedRespawnPendingFadeIn) {
            $gameTemp._yureBedRespawnPendingFadeIn = false;
            if ($gameScreen) {
                $gameScreen.startFadeIn(fadeDuration);
            }
        }
    };

    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        if ($gameTemp && $gameTemp._yureBedRespawnPendingFadeIn) {
            $gameTemp._yureBedRespawnPendingFadeIn = false;
            if ($gameScreen) {
                $gameScreen.startFadeIn(fadeDuration);
            }
        }
    };

    // ============================================================================
    // 6. PLUGIN COMMANDS
    // ============================================================================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        var cmd = command.toLowerCase();
        if (cmd === 'setbed' || cmd === 'setrespawnbed') {
            var mapId = Number(args[0]) || ($gameMap ? $gameMap.mapId() : defaultMapId);
            var x = Number(args[1]) || 0;
            var y = Number(args[2]) || 0;
            var dir = Number(args[3]) || 2;
            RespawnManager.setBed(mapId, x, y, dir);
        } else if (cmd === 'setbedhere' || cmd === 'setrespawnhere') {
            RespawnManager.setBedHere();
        } else if (cmd === 'setbedevent' || cmd === 'setrespawnevent' || cmd === 'setbedeventid') {
            var eventId = Number(args[0]);
            if (eventId > 0) {
                RespawnManager.setBedEvent(eventId);
            }
        } else if (cmd === 'respawnnow' || cmd === 'respawn') {
            RespawnManager.respawn();
        }
    };

})();
