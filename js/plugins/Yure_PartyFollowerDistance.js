//=============================================================================
// Yure_PartyFollowerDistance.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Mengatur jarak / renggang antar karakter party (Followers) di map agar tidak saling menumpuk (anti-dempet).
 * @author Yure Party Team & Antigravity
 *
 * @param Follower Spacing
 * @text Jarak Antar Karakter (Tile)
 * @desc Jarak langkah antar karakter party di peta dalam satuan petak/tile (Default: 2 untuk sprite tinggi / tall sprites).
 * @type number
 * @min 1
 * @max 5
 * @default 2
 *
 * @help
 * ============================================================================
 * YURE PARTY FOLLOWER DISTANCE SYSTEM
 * ============================================================================
 * Plugin ini memperbaiki masalah karakter party (Followers) yang berjalan terlalu
 * dekat / dempet (tumpang tindih) di peta saat menggunakan sprite berbadan tinggi
 * (Tall Sprites seperti Saki & Sophia berukuran 96x128).
 *
 * FITUR:
 * 1. Path History Buffer:
 *    - Setiap pengikut mengikuti jejak petak (footsteps) yang persis dilalui oleh
 *      karakter di depannya dengan jarak petak yang dapat diatur (default: 2 tile).
 *    - Karakter tidak akan memotong sudut dinding (no corner cutting) dan tidak
 *      akan tersangkut atau menembus tembok.
 * 2. Menghindari Penumpukan Badan (Anti-Overlap):
 *    - Dengan jarak 2 tile (default), tubuh karakter yang tinggi tidak lagi
 *      saling bertumpuk saat berjalan maupun berhenti.
 * 3. Kompatibel Penuh:
 *    - Sinkron otomatis saat pindah map / teleport (performTransfer).
 *    - Mengikuti kecepatan lari (Dash) pemain secara mulus.
 *    - Kompatibel dengan fitur Gather Followers bawaan RPG Maker MV.
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_PartyFollowerDistance');
    var defaultSpacing = Number(parameters['Follower Spacing'] || 2);
    if (isNaN(defaultSpacing) || defaultSpacing < 1) defaultSpacing = 2;

    // ========================================================================
    // 1. GAME_PLAYER PATH TRACKING
    // ========================================================================
    var _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _Game_Player_initMembers.call(this);
        this.resetFollowerPath();
    };

    Game_Player.prototype.resetFollowerPath = function() {
        this._followerPath = [{ x: this.x, y: this.y }];
        if (this._followers && this._followers._data) {
            this._followers._data.forEach(function(f) {
                f._pathIndex = 0;
            });
        }
    };

    Game_Player.prototype.recordFollowerStep = function(nextX, nextY) {
        if (!this._followerPath) this.resetFollowerPath();
        var p = this._followerPath;
        // Check backtrack
        if (p.length >= 2 && p[p.length - 2].x === nextX && p[p.length - 2].y === nextY) {
            p.pop();
        } else {
            p.push({ x: nextX, y: nextY });
        }

        // Memory cleanup: hanya hitung follower HIDUP untuk minIdx (dead = jiwa bebas, tidak di-track)
        if (this._followers && this._followers._data) {
            var active = this._followers._data.filter(function(f) {
                if (!f.isVisible()) return false;
                var actor = f.actor();
                return actor && !actor.isDead(); // Hanya follower hidup
            });
            if (active.length > 0) {
                var minIdx = active.reduce(function(min, f) {
                    return Math.min(min, f._pathIndex || 0);
                }, active[0]._pathIndex || 0);
                if (minIdx > 20) {
                    p.splice(0, minIdx);
                    this._followers._data.forEach(function(f) {
                        f._pathIndex = Math.max(0, (f._pathIndex || 0) - minIdx);
                    });
                }
            }
        }
    };

    var _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
    Game_Player.prototype.moveStraight = function(d) {
        if (defaultSpacing > 1 && this.canPass(this.x, this.y, d)) {
            var nx = $gameMap.roundXWithDirection(this.x, d);
            var ny = $gameMap.roundYWithDirection(this.y, d);
            this.recordFollowerStep(nx, ny);
            if (this._followers) this._followers.updateMove();
            Game_Character.prototype.moveStraight.call(this, d);
        } else {
            _Game_Player_moveStraight.call(this, d);
        }
    };

    var _Game_Player_moveDiagonally = Game_Player.prototype.moveDiagonally;
    Game_Player.prototype.moveDiagonally = function(horz, vert) {
        if (defaultSpacing > 1 && this.canPassDiagonally(this.x, this.y, horz, vert)) {
            var nx = $gameMap.roundXWithDirection(this.x, horz);
            var ny = $gameMap.roundYWithDirection(this.y, vert);
            this.recordFollowerStep(nx, ny);
            if (this._followers) this._followers.updateMove();
            Game_Character.prototype.moveDiagonally.call(this, horz, vert);
        } else {
            _Game_Player_moveDiagonally.call(this, horz, vert);
        }
    };

    var _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        _Game_Player_performTransfer.call(this);
        this.resetFollowerPath();
    };

    // ========================================================================
    // 2. GAME_FOLLOWER ADVANCEMENT
    // ========================================================================
    var _Game_Follower_initMembers = Game_Follower.prototype.initMembers;
    Game_Follower.prototype.initMembers = function() {
        _Game_Follower_initMembers.call(this);
        this._pathIndex = 0;
    };

    Game_Follower.prototype.followPathStep = function(targetIdx, path) {
        if (this._pathIndex === undefined) this._pathIndex = 0;
        if (this._pathIndex < targetIdx && this._pathIndex + 1 < path.length) {
            this._pathIndex++;
            var target = path[this._pathIndex];
            if (target) {
                var sx = this.deltaXFrom(target.x);
                var sy = this.deltaYFrom(target.y);
                if (sx !== 0 && sy !== 0) {
                    this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
                } else if (sx !== 0) {
                    this.moveStraight(sx > 0 ? 4 : 6);
                } else if (sy !== 0) {
                    this.moveStraight(sy > 0 ? 8 : 2);
                }
            }
        }
        this.setMoveSpeed($gamePlayer.realMoveSpeed());
    };

    // ========================================================================
    // 3. GAME_FOLLOWERS UPDATE OVERRIDE
    // ========================================================================
    var _Game_Followers_updateMove = Game_Followers.prototype.updateMove;
    Game_Followers.prototype.updateMove = function() {
        if (this.areGathering() || defaultSpacing <= 1) {
            _Game_Followers_updateMove.call(this);
            return;
        }

        var path = $gamePlayer._followerPath;
        if (!path) return;
        var playerIdx = path.length - 1;

        // Pisahkan follower hidup dan follower mati
        // Follower HIDUP menggunakan path-spacing chain
        // Follower MATI (jiwa api) mengikuti follower hidup paling belakang tanpa spacing baku
        var lastLivingIdx = playerIdx; // Index path yang dipakai precedingChar terakhir yang hidup

        for (var i = 0; i < this._data.length; i++) {
            var follower = this._data[i];
            if (!follower || !follower.isVisible()) continue;

            var actor = follower.actor();
            var isDead = actor && actor.isDead();

            if (isDead) {
                // Jiwa api: chase langsung ke follower hidup di depannya atau ke player
                // Cari precedingCharacter yang hidup di depan
                var precedingChar = $gamePlayer;
                for (var j = i - 1; j >= 0; j--) {
                    var prev = this._data[j];
                    if (prev && prev.isVisible()) {
                        var prevActor = prev.actor();
                        if (prevActor && !prevActor.isDead()) {
                            precedingChar = prev;
                            break;
                        }
                    }
                }
                // Chase langsung (default MV behavior) - jiwa melayang bebas
                var sx = follower.deltaXFrom(precedingChar.x);
                var sy = follower.deltaYFrom(precedingChar.y);
                var dist = Math.abs(sx) + Math.abs(sy);
                if (dist > defaultSpacing) {
                    if (sx !== 0 && sy !== 0) {
                        follower.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
                    } else if (sx !== 0) {
                        follower.moveStraight(sx > 0 ? 4 : 6);
                    } else if (sy !== 0) {
                        follower.moveStraight(sy > 0 ? 8 : 2);
                    }
                }
                follower.setMoveSpeed($gamePlayer.realMoveSpeed());
                // Path index jiwa tidak digunakan untuk spacing — set ke belakang semua
                follower._pathIndex = Math.max(0, (lastLivingIdx - defaultSpacing * (this._data.length - i)));
                continue;
            }

            // Follower HIDUP: ikuti path-spacing chain
            var precedingIdx = playerIdx;
            for (var j = i - 1; j >= 0; j--) {
                if (this._data[j] && this._data[j].isVisible()) {
                    var prevActor2 = this._data[j].actor();
                    if (prevActor2 && !prevActor2.isDead()) {
                        precedingIdx = this._data[j]._pathIndex || 0;
                        break;
                    }
                }
            }

            var targetIdx = Math.max(0, precedingIdx - defaultSpacing);
            if (follower._pathIndex > precedingIdx) {
                follower._pathIndex = precedingIdx;
            }
            follower.followPathStep(targetIdx, path);
            lastLivingIdx = follower._pathIndex || 0;
        }
    };

    var _Game_Followers_synchronize = Game_Followers.prototype.synchronize;
    Game_Followers.prototype.synchronize = function(x, y, d) {
        _Game_Followers_synchronize.call(this, x, y, d);
        if ($gamePlayer) {
            $gamePlayer.resetFollowerPath();
        }
    };

})();
