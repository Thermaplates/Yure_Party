//=============================================================================
// Yure_DeathRevival.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Sistem Kematian Party Menjadi Jiwa Api Biru & Kebangkitan di Batu Nisan / Mbah Karso.
 * @author Lead Drain Production & Antigravity
 *
 * @help
 * ============================================================================
 * YURE DEATH & REVIVAL SYSTEM
 * ============================================================================
 * 1. JIWA API BIRU SAAT GUGUR:
 *    - Anggota party yang HP-nya 0 / berstatus Gugur (Death) otomatis berubah
 *      menjadi Api Biru melayang (!Flame.png index 5) yang mengikuti rombongan
 *      dari belakang dengan animasi kobaran mengambang.
 *    - Jika ketua party (leader) gugur, anggota yang masih hidup otomatis
 *      maju memimpin perjalanan, dan ketua yang gugur menjadi api biru pengikut.
 *
 * 2. KEBANGKITAN DI BATU NISAN (GRAVES):
 *    - Berinteraksi dengan makam / batu nisan kuno saat membawa sukma api biru
 *      memunculkan pilihan untuk memanjatkan doa suci.
 *    - Doa akan mengembalikan seluruh jiwa rekan yang gugur kembali ke raganya
 *      (memulihkan HP & MP 50% dan efek kilatan cahaya suci + SFX).
 *    - Pilihan simpan permainan (Save) tetap tersedia seperti biasa.
 *
 * 3. KEBANGKITAN OLEH MBAH KARSO:
 *    - Berinteraksi dengan Mbah Karso saat membawa roh api biru membuat Mbah Karso
 *      menyadari adanya sukma yang gentayangan dan menawarkan kidung sukmanya
 *      untuk membangkitkan kawan yang gugur.
 *
 * 4. PLUGIN COMMAND:
 *    - YureRevival        : Membangkitkan seluruh anggota party yang gugur.
 *    - ReviveDeadParty    : Sama seperti di atas.
 * ============================================================================
 */

(function() {
    'use strict';

    // Preload sprite karakter !Flame saat booting
    var _Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
    Scene_Boot.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        ImageManager.loadCharacter('!Flame');
    };

    // ------------------------------------------------------------------------
    // 1. REKREASI SPRITE FOLLOWER ANGGOTA MATI MENJADI API BIRU (!Flame Index 5)
    // ------------------------------------------------------------------------
    // Override refresh() agar dead actor langsung di-set !Flame via setImage
    // (default refresh() membaca actor.characterName() langsung, bypassing override kita)
    var _Game_Follower_refresh = Game_Follower.prototype.refresh;
    Game_Follower.prototype.refresh = function() {
        var actor = this.actor();
        if (actor && actor.isDead() && this.isVisible()) {
            this.setImage('!Flame', 5);
            return;
        }
        _Game_Follower_refresh.call(this);
    };

    var _Game_Follower_hasStepAnime = Game_Follower.prototype.hasStepAnime;
    Game_Follower.prototype.hasStepAnime = function() {
        var actor = this.actor();
        if (actor && actor.isDead()) return true; // Api terus berkobar walau diam di tempat
        return _Game_Follower_hasStepAnime ? _Game_Follower_hasStepAnime.call(this) : false;
    };

    // ------------------------------------------------------------------------
    // 2. ATURAN MUTLAK KEMATIAN NIA (PROTAGONIS) -> GAME OVER & ULANG
    // ------------------------------------------------------------------------
    function isNia(actor) {
        if (!actor) return false;
        return actor.actorId() === 1 || (actor.name && actor.name().toLowerCase() === 'nia');
    }

    function isNiaDead() {
        if (typeof $gameParty === 'undefined' || !$gameParty || typeof $gameParty.allMembers !== 'function') return false;
        var inParty = $gameParty.allMembers().some(function(a) { return isNia(a); });
        if (!inParty) return false;
        var nia = (typeof $gameActors !== 'undefined' && $gameActors) ? $gameActors.actor(1) : null;
        return !!(nia && nia.isDead());
    }

    function triggerNiaGameOver() {
        if (SceneManager.isNextScene(Scene_Gameover) || (SceneManager._scene && SceneManager._scene instanceof Scene_Gameover)) {
            return;
        }
        AudioManager.stopBgm();
        AudioManager.stopBgs();
        SceneManager.goto(Scene_Gameover);
    }

    // A. Hook Game_Party.isAllDead: Kematian Nia otomatis menganggap party telah gugur
    var _Game_Party_isAllDead = Game_Party.prototype.isAllDead;
    Game_Party.prototype.isAllDead = function() {
        if (isNiaDead()) return true;
        return _Game_Party_isAllDead.call(this);
    };

    // B. BattleManager: Hentikan pertarungan seketika saat Nia gugur
    var _BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
    BattleManager.checkBattleEnd = function() {
        if (this._phase) {
            if (this.checkAbort()) {
                return true;
            } else if (isNiaDead()) {
                this.processDefeat();
                return true;
            }
        }
        return _BattleManager_checkBattleEnd.call(this);
    };

    var _BattleManager_update = BattleManager.update;
    BattleManager.update = function() {
        if (this._phase && this._phase !== 'battleEnd' && isNiaDead()) {
            if (this.checkBattleEnd()) return;
        }
        _BattleManager_update.call(this);
    };

    var _BattleManager_updateTurn = BattleManager.updateTurn;
    BattleManager.updateTurn = function() {
        if (isNiaDead()) {
            this.checkBattleEnd();
            return;
        }
        _BattleManager_updateTurn.call(this);
    };

    // C. Battle End Handler: Kematian Nia langsung ke Scene_Gameover
    var _BattleManager_updateBattleEnd = BattleManager.updateBattleEnd;
    BattleManager.updateBattleEnd = function() {
        if (this.isBattleTest()) {
            AudioManager.stopBgm();
            SceneManager.exit();
            this._phase = null;
            return;
        }
        if (!this._escaped && isNiaDead()) {
            if (this._canLose) {
                $gameParty.reviveBattleMembers();
                SceneManager.pop();
            } else {
                triggerNiaGameOver();
            }
            this._phase = null;
            return;
        }
        _BattleManager_updateBattleEnd.call(this);
    };

    // D. Map Game Over Handler: Segera Game Over saat Nia gugur di Map
    var _Scene_Map_checkGameover = Scene_Map.prototype.checkGameover;
    Scene_Map.prototype.checkGameover = function() {
        if (isNiaDead()) {
            triggerNiaGameOver();
            return;
        }
        _Scene_Map_checkGameover.call(this);
    };

    // E. Leader Check: Jangan pernah menukar posisi Nia jika Nia gugur
    Game_Party.prototype.checkLeaderDeadStatus = function() {
        if (isNiaDead()) {
            triggerNiaGameOver();
            return;
        }
        if (this._actors.length <= 1) return;
        var leader = this.leader();
        // Hanya tukar jika leader yang gugur BUKAN Nia
        if (leader && leader.isDead() && !isNia(leader)) {
            for (var i = 1; i < this._actors.length; i++) {
                var actor = $gameActors.actor(this._actors[i]);
                if (actor && !actor.isDead()) {
                    var temp = this._actors[0];
                    this._actors[0] = this._actors[i];
                    this._actors[i] = temp;
                    if ($gamePlayer) $gamePlayer.refresh();
                    if ($gameMap) $gameMap.requestRefresh();
                    break;
                }
            }
        }
    };

    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        $gameParty.checkLeaderDeadStatus();
        _Scene_Map_start.call(this);
    };

    var _Game_Party_onBattleEnd = Game_Party.prototype.onBattleEnd;
    Game_Party.prototype.onBattleEnd = function() {
        _Game_Party_onBattleEnd.call(this);
        this.checkLeaderDeadStatus();
    };

    // ------------------------------------------------------------------------
    // 3. FUNGSI INTI PEMBANGKITAN PARTY (REVIVAL HELPER)
    // ------------------------------------------------------------------------
    window.YureRevival = {
        reviveAllDead: function() {
            var dead = $gameParty.allMembers().filter(function(a) { return a.isDead(); });
            if (dead.length === 0) return 0;

            dead.forEach(function(m) {
                m.revive();
                m.setHp(Math.max(1, Math.floor(m.mhp * 0.5))); // Pulihkan HP 50%
                m.setMp(Math.max(1, Math.floor(m.mmp * 0.5))); // Pulihkan MP 50%
            });

            // Efek Suara Lonceng Suci & Kilatan Cahaya
            AudioManager.playSe({ name: 'Saint1', volume: 90, pitch: 100, pan: 0 });
            if ($gameScreen) {
                $gameScreen.startFlash([140, 220, 255, 180], 60);
            }

            if ($gamePlayer) $gamePlayer.refresh();
            if ($gameMap) $gameMap.requestRefresh();

            return dead.length;
        }
    };

    // ------------------------------------------------------------------------
    // 4. INTERAKSI EVENT BATU NISAN & MBAH KARSO
    // ------------------------------------------------------------------------
    var _Game_Event_start = Game_Event.prototype.start;
    Game_Event.prototype.start = function() {
        var ev = this.event();
        var name = (ev && ev.name) ? ev.name.toLowerCase() : '';
        var note = (ev && ev.note) ? ev.note.toLowerCase() : '';

        var isGrave = name.includes('grave') || name.includes('nisan') || name.includes('makam') || name.includes('tomb') || note.includes('grave') || (this._mapId === 2 && this._eventId === 17);
        var isKarso = name.includes('karso') || note.includes('karso') || (this._mapId === 2 && this._eventId === 6);

        var deadMembers = $gameParty.allMembers().filter(function(a) { return a.isDead(); });

        // A. Interaksi di Batu Nisan
        if (isGrave && deadMembers.length > 0) {
            if ($gameMessage.isBusy()) return;
            var names = deadMembers.map(function(m) { return m.name(); }).join(', ');
            $gameMessage.add('\\C[14]Batu Nisan Kuno\\C[0]\nCahaya damai terpancar dari batu nisan kuno...\nJiwa api biru yang mengikutimu merasakan kedamaian.');
            $gameMessage.setChoices([
                '✨ Doa & Bangkitkan Jiwa (' + names + ')',
                '💾 Simpan Permainan (Save)',
                'Tutup'
            ], 0, 2);

            var self = this;
            $gameMessage.setChoiceCallback(function(choice) {
                if (choice === 0) {
                    YureRevival.reviveAllDead();
                    $gameMessage.add('\\C[14]Batu Nisan Kuno\\C[0]\nDoa tulusmu terjawab! Jiwa rekanmu kembali menyatu dengan raganya dan bangkit kembali.');
                } else if (choice === 1) {
                    SceneManager.push(Scene_Save);
                }
            });
            return;
        }

        // B. Interaksi dengan Mbah Karso
        if (isKarso && deadMembers.length > 0) {
            if ($gameMessage.isBusy()) return;
            var names = deadMembers.map(function(m) { return m.name(); }).join(', ');
            $gameMessage.setFaceImage('Karso', 0);
            $gameMessage.add('\\N[6] : Oalah le... Kok kowe mlaku-mlaku diterke geni biru ngono? Kancamu mati toh (' + names + ')?');
            $gameMessage.setChoices([
                '✨ Mbah, tolong bangkitkan kawan saya!',
                '🛒 Saya mau belanja barang Mbah Karso',
                'Batal'
            ], 0, 2);

            var self = this;
            $gameMessage.setChoiceCallback(function(choice) {
                if (choice === 0) {
                    YureRevival.reviveAllDead();
                    $gameMessage.setFaceImage('Karso', 0);
                    $gameMessage.add('\\N[6] : Wes, saiki sukmone wis tak balekke ning ragane. Tangi kabeh! Ojo nganti mati konyol maneh yo le!');
                } else if (choice === 1) {
                    _Game_Event_start.call(self);
                }
            });
            return;
        }

        _Game_Event_start.call(this);
    };

    // ------------------------------------------------------------------------
    // 5. PLUGIN COMMAND HANDLER
    // ------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command) {
            var cmd = command.toLowerCase();
            if (cmd === 'yurerevival' || cmd === 'revivedeadparty') {
                YureRevival.reviveAllDead();
            }
        }
    };

})();
