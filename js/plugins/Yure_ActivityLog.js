/*:
 * @plugindesc [v1.0] Yure Activity Log — Pencatat Aktivitas, Toast Notifikasi & Manajemen Unread Badge
 * @author Yure Party Dev
 *
 * @help
 * ========================================================================
 * YURE ACTIVITY LOG
 * ========================================================================
 * Plugin ini mencatat setiap aktivitas penting dalam petualangan:
 *   - Mendapatkan item/weapon/armor baru
 *   - Karakter naik level
 *   - Mempelajari skill baru
 *
 * Notifikasi pop-up (*toast*) elegan akan muncul langsung di layar
 * saat aktivitas terjadi, tanpa menghentikan gameplay.
 *
 * Status "belum dibaca" (unread) disimpan di $gameSystem dan otomatis
 * tersimpan ke dalam file save player.
 *
 * $gameSystem._activityLogs     — Riwayat log (Array)
 * $gameSystem._journalUnread    — Object { item, skill, status, archive }
 * ========================================================================
 */

(function() {
    'use strict';

    // ========================================================================
    // Inisialisasi data di $gameSystem
    // ========================================================================
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._activityLogs  = [
            { type: 'event', text: 'Memulai Petualangan di Dunia Yure Party', detail: 'Ekspedisi pertama dimulai. Catat setiap momen berharga dan perjumpaan di dalam buku jurnal ini.', time: 0, date: '00:00' },
            { type: 'item', text: 'Potion x3', detail: 'Memulihkan 500 HP karakter saat terluka dalam pertarungan sengit.', time: 10, date: '00:01' }
        ];
        this._journalUnread = { item: false, skill: false, status: false, archive: false };
    };

    // Support save file lama (tanpa field ini)
    var _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function() {
        if (_Game_System_onAfterLoad) _Game_System_onAfterLoad.call(this);
        if (!this._activityLogs)  this._activityLogs  = [];
        // Hapus dummy Sophia jika tersisa di save file
        this._activityLogs = this._activityLogs.filter(function(l) {
            return !(l && l.text && l.text.includes('Sophia: "Perjalanan kita'));
        });
        if (!this._journalUnread) this._journalUnread  = { item: false, skill: false, status: false, archive: false };
    };

    // ========================================================================
    // Core Logger — Tambahkan entry ke riwayat
    // ========================================================================
    Game_System.prototype.addActivityLog = function(type, text, icon, detail) {
        var entry = {
            type:   type,    // 'item' | 'skill' | 'status' | 'equip' | 'dialogue' | 'event'
            text:   text,
            detail: detail || '',
            icon:   icon || '',
            time:   $gameSystem.playtime ? $gameSystem.playtime() : 0,
            date:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this._activityLogs.unshift(entry);         // Terbaru di atas
        if (this._activityLogs.length > 80) {
            this._activityLogs.pop();
        }
        // Tandai unread
        if (type === 'item' || type === 'equip') this._journalUnread.item = true;
        if (type === 'skill')                     this._journalUnread.skill = true;
        if (type === 'status')                    this._journalUnread.status = true;
        this._journalUnread.archive = true;        // Archive selalu update
    };

    // ========================================================================
    
    // ========================================================================
    // HOOK: Game_Message.prototype.add — Percakapan / Dialog
    // ========================================================================
    var _Game_Message_add = Game_Message.prototype.add;
    Game_Message.prototype.add = function(text) {
        _Game_Message_add.call(this, text);
        if (text && typeof text === 'string' && text.trim().length > 0) {
            // Bersihkan format control code RPG Maker
            var cleanText = text.replace(/\\[A-Za-z]+\[\d+\]/g, '').replace(/\\./g, '').trim();
            if (cleanText.length > 2 && $gameSystem && $gameSystem.addActivityLog) {
                var lastLog = ($gameSystem._activityLogs && $gameSystem._activityLogs.length > 0) ? $gameSystem._activityLogs[0] : null;
                if (!lastLog || lastLog.text !== cleanText) {
                    $gameSystem.addActivityLog('dialogue', cleanText, '', text);
                }
            }
        }
    };

    // HOOK: Game_Party.prototype.gainItem — Item/Weapon/Armor baru
    // ========================================================================
    var _gainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        var before = this.numItems(item);
        _gainItem.call(this, item, amount, includeEquip);
        var after = this.numItems(item);

        if (item && amount > 0 && after > before) {
            var isEquip = (DataManager.isWeapon(item) || DataManager.isArmor(item));
            var type    = isEquip ? 'equip' : 'item';
            var text    = item.name + (amount > 1 ? ' x' + amount : '') + (isEquip ? ' (Equip)' : '');
            if ($gameSystem && $gameSystem.addActivityLog) {
                $gameSystem.addActivityLog(type, text, '');
            }
            if (typeof YureToastManager !== 'undefined') {
                YureToastManager.push(type, text, item.name, amount);
            }
        }
    };

    // ========================================================================
    // HOOK: Game_Actor.prototype.setup — Inisialisasi awal (agar skill default tidak spam)
    // ========================================================================
    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        this._isInitializing = true;
        _Game_Actor_setup.call(this, actorId);
        this._isInitializing = false;
    };

    // ========================================================================
    // HOOK: EXP RESTRICTION — Hanya anggota party aktif yang dapat menerima EXP
    // Actor di luar party (NPC / calon partner seperti Mbah Karso) tidak mendapat EXP
    // ========================================================================
    var _Game_Actor_gainExp = Game_Actor.prototype.gainExp;
    Game_Actor.prototype.gainExp = function(exp) {
        if (!$gameParty || !$gameParty.allMembers().contains(this)) {
            return;
        }
        _Game_Actor_gainExp.call(this, exp);
    };

    var _Game_Actor_finalExpRate = Game_Actor.prototype.finalExpRate;
    Game_Actor.prototype.finalExpRate = function() {
        if (!$gameParty || !$gameParty.allMembers().contains(this)) {
            return 0;
        }
        return _Game_Actor_finalExpRate.call(this);
    };

    // ========================================================================
    // HOOK: Game_Actor.prototype.levelUp — Level naik
    // ========================================================================
    var _levelUp = Game_Actor.prototype.levelUp;
    Game_Actor.prototype.levelUp = function() {
        _levelUp.call(this);
        if (this._isInitializing) return;
        if (!$gameParty || !$gameParty.allMembers().contains(this)) return;

        var text = this.name() + ' Level ' + this._level + '!';
        if ($gameSystem && $gameSystem.addActivityLog) {
            $gameSystem.addActivityLog('status', text, '');
        }
        if (typeof YureToastManager !== 'undefined') {
            YureToastManager.push('status', text);
        }
    };

    // ========================================================================
    // HOOK: Game_Actor.prototype.learnSkill — Skill baru
    // ========================================================================
    var _learnSkill = Game_Actor.prototype.learnSkill;
    Game_Actor.prototype.learnSkill = function(skillId) {
        var wasLearned = this.isLearnedSkill(skillId);
        _learnSkill.call(this, skillId);
        if (this._isInitializing) return;
        if (!$gameParty || !$gameParty.allMembers().contains(this)) return;

        if (!wasLearned && this.isLearnedSkill(skillId)) {
            var skill = $dataSkills[skillId];
            if (skill) {
                var text = this.name() + ': ' + skill.name;
                if ($gameSystem && $gameSystem.addActivityLog) {
                    $gameSystem.addActivityLog('skill', text, '');
                }
                if (typeof YureToastManager !== 'undefined') {
                    YureToastManager.push('skill', text);
                }
            }
        }
    };

    // ========================================================================
    // YURE TOAST MANAGER (v2.0) — SINGLE DYNAMIC ROLLING CAPSULE
    // Gaya: Zelda BOTW / Monster Hunter (Compact, 1 baris, Micro-Roll, Anti-Numpuk)
    // ========================================================================
    var YureToastManager = window.YureToastManager = {
        _queue:           [],
        _currentEntry:    null,
        _nextEntry:       null,
        _layer:           null,
        _capsuleSprite:   null,
        _state:           'idle', // 'idle', 'showing', 'rolling', 'fading_out'
        _stateTimer:      0,
        _rollRatio:       0.0,
        _currentWidth:    200,
        _targetWidth:     200,

        push: function(type, text, rawName, amount) {
            // Auto-Merge: Jika item yang sama masuk berdekatan, gabungkan jumlahnya!
            if (rawName && amount) {
                // Cek di antrian
                for (var i = this._queue.length - 1; i >= 0; i--) {
                    var q = this._queue[i];
                    if (q.rawName === rawName && q.type === type) {
                        q.amount += amount;
                        q.text = rawName + ' x' + q.amount + (type === 'equip' ? ' (Equip)' : '');
                        return;
                    }
                }
                // Cek dengan item yang sedang aktif tampil
                if (this._currentEntry && this._currentEntry.rawName === rawName && this._currentEntry.type === type && this._state === 'showing') {
                    this._currentEntry.amount += amount;
                    this._currentEntry.text = rawName + ' x' + this._currentEntry.amount + (type === 'equip' ? ' (Equip)' : '');
                    this._stateTimer = 0; // reset durasi tampilan agar terbaca
                    this._targetWidth = this._calcWidth(this._currentEntry.text);
                    this._playTickSE();
                    return;
                }
            }

            this._queue.push({
                type:    type,
                text:    text,
                rawName: rawName || text,
                amount:  amount || 1
            });
        },

        init: function(parent) {
            this._layer = parent;
            if (this._capsuleSprite && this._capsuleSprite.parent) {
                this._capsuleSprite.parent.removeChild(this._capsuleSprite);
            }
            var maxW = 420;
            var maxH = 40;
            this._capsuleSprite = new Sprite(new Bitmap(maxW, maxH));
            this._capsuleSprite.z = 200;
            this._capsuleSprite.visible = false;
            this._capsuleSprite.opacity = 0;
            this._layer.addChild(this._capsuleSprite);

            this._state = 'idle';
            this._currentEntry = null;
            this._nextEntry = null;
            this._stateTimer = 0;
            this._currentWidth = 200;
            this._targetWidth = 200;
        },

        _calcWidth: function(text) {
            if (!this._capsuleSprite || !this._capsuleSprite.bitmap) return 200;
            var bmp = this._capsuleSprite.bitmap;
            bmp.fontFace = 'GameFont, sans-serif';
            bmp.fontSize = 15;
            bmp.fontBold = true;
            var tw = bmp.measureTextWidth(String(text || ''));
            return Math.max(170, Math.min(390, Math.round(tw + 44)));
        },

        _playTickSE: function() {
            try {
                AudioManager.playSe({ name: 'Cursor1', volume: 38, pitch: 135, pan: 0 });
            } catch (e) {}
        },

        update: function() {
            if (!this._layer || !this._capsuleSprite) return;

            var sp = this._capsuleSprite;

            // Transisi State
            if (this._state === 'idle') {
                if (this._queue.length > 0) {
                    this._currentEntry = this._queue.shift();
                    this._targetWidth = this._calcWidth(this._currentEntry.text);
                    this._currentWidth = this._targetWidth;
                    this._state = 'showing';
                    this._stateTimer = 0;
                    sp.visible = true;
                    sp.opacity = 0;
                    sp.y = Graphics.boxHeight - 48;
                    sp.x = 18;
                    this._playTickSE();
                }
            } else if (this._state === 'showing') {
                if (sp.opacity < 255) {
                    sp.opacity = Math.min(255, sp.opacity + 38);
                }

                this._stateTimer++;

                // Jika ada antrian berikutnya, perpendek durasi tampilan agar cepat me-roll (hanya 42 frame = ~0.7 detik)
                // Jika tidak ada antrian, tahan selama 95 frame (~1.6 detik)
                var maxHold = (this._queue.length > 0) ? 42 : 95;

                if (this._stateTimer >= maxHold) {
                    if (this._queue.length > 0) {
                        // Lakukan micro-roll ke item selanjutnya!
                        this._nextEntry = this._queue.shift();
                        this._state = 'rolling';
                        this._stateTimer = 0;
                        this._targetWidth = this._calcWidth(this._nextEntry.text);
                        this._playTickSE();
                    } else {
                        // Selesai semua antrian -> Fade out
                        this._state = 'fading_out';
                        this._stateTimer = 0;
                    }
                }
            } else if (this._state === 'rolling') {
                // Micro-roll animasi (durasi 10 frame, sangat snappy & memuaskan)
                this._stateTimer++;
                var rollFrames = 10;
                this._rollRatio = Math.min(1.0, this._stateTimer / rollFrames);

                if (this._stateTimer >= rollFrames) {
                    this._currentEntry = this._nextEntry;
                    this._nextEntry = null;
                    this._state = 'showing';
                    this._stateTimer = 0;
                    this._rollRatio = 0.0;
                }
            } else if (this._state === 'fading_out') {
                sp.opacity = Math.max(0, sp.opacity - 18);
                sp.y += 0.4;
                if (sp.opacity <= 0) {
                    this._state = 'idle';
                    this._currentEntry = null;
                    sp.visible = false;
                }
            }

            // Lerp Lebar Kapsul
            this._currentWidth += (this._targetWidth - this._currentWidth) * 0.32;

            if (sp.visible) {
                this._renderCapsule();
            }
        },

        _renderCapsule: function() {
            var sp = this._capsuleSprite;
            var bmp = sp.bitmap;
            if (!bmp) return;
            bmp.clear();

            var ctx = bmp._context;
            if (!ctx) return;

            var W = Math.round(this._currentWidth);
            var H = 32;

            var accentColors = {
                item:   '#4ade80',   // Hijau mint segar
                equip:  '#fbbf24',   // Emas amber
                status: '#38bdf8',   // Biru langit cerah
                skill:  '#c084fc',   // Ungu lavender
                event:  '#94a3b8'    // Slate
            };

            var curColor = accentColors[this._currentEntry ? this._currentEntry.type : 'item'] || '#94a3b8';

            // 1. Background Kapsul Ramping (Matte Midnight Slate)
            ctx.save();
            ctx.fillStyle = 'rgba(12, 16, 26, 0.90)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.lineWidth = 1;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 2;

            // Capsule rounded rectangle
            this._drawRoundedRect(ctx, 0, 2, W, H, 6);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // 2. Accent Pill Dot di Sisi Kiri
            ctx.save();
            ctx.fillStyle = curColor;
            ctx.shadowColor = curColor;
            ctx.shadowBlur = 6;
            this._drawRoundedRect(ctx, 8, 9, 4, 18, 2);
            ctx.fill();
            ctx.restore();

            // 3. Teks Item dengan Animasi Micro-Roll Vertikal
            ctx.save();
            // Clip area di dalam kapsul agar teks yang me-roll tidak bocor keluar
            ctx.beginPath();
            this._drawRoundedRect(ctx, 16, 2, W - 20, H, 4);
            ctx.clip();

            bmp.fontFace = 'GameFont, sans-serif';
            bmp.fontSize = 15;
            bmp.fontBold = true;

            var textBaseY = Math.round(H / 2) - 8;

            if (this._state === 'rolling' && this._nextEntry) {
                // Teks lama meluncur naik dan memudar
                var outY = textBaseY - Math.round(this._rollRatio * 16);
                var outAlpha = Math.max(0, 1.0 - this._rollRatio);
                ctx.save();
                ctx.globalAlpha = outAlpha;
                bmp.textColor = '#d1d5db';
                bmp.drawText(this._currentEntry.text, 20, outY, W - 32, 22, 'left');
                ctx.restore();

                // Teks baru meluncur naik dari bawah ke tengah
                var inY = textBaseY + Math.round((1.0 - this._rollRatio) * 16);
                var inAlpha = this._rollRatio;
                ctx.save();
                ctx.globalAlpha = inAlpha;
                bmp.textColor = '#ffffff';
                bmp.drawText(this._nextEntry.text, 20, inY, W - 32, 22, 'left');
                ctx.restore();

            } else if (this._currentEntry) {
                // Teks normal diam di tengah
                bmp.textColor = '#f8fafc';
                bmp.drawText(this._currentEntry.text, 20, textBaseY, W - 32, 22, 'left');
            }

            ctx.restore(); // Tutup clip

            // 4. Mini Counter jika masih ada item menunggu di antrian (+N)
            if (this._queue.length > 0) {
                ctx.save();
                bmp.fontFace = 'GameFont, sans-serif';
                bmp.fontSize = 11;
                bmp.textColor = '#94a3b8';
                var badgeTxt = '+' + this._queue.length;
                bmp.drawText(badgeTxt, W - 36, textBaseY + 2, 30, 18, 'right');
                ctx.restore();
            }

            bmp._setDirty();
        },

        _drawRoundedRect: function(ctx, x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        }
    };

    // ========================================================================
    // Tambahkan layer toast ke Scene_Map
    // ========================================================================
    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        YureToastManager.init(this);
    };

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        YureToastManager.update();
    };

    // Tambahkan ke Scene_Battle juga
    var _Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        _Scene_Battle_start.call(this);
        YureToastManager.init(this);
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        YureToastManager.update();
    };

})();
