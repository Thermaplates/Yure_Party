//=============================================================================
// Yure_BattleTutorialSpotlight.js
//=============================================================================
/*:
 * @plugindesc [v3.5] Comprehensive Tutorial & Navigation System: Battle Spotlight, Map LOS Trigger, Left Slide Log & Off-Screen Objective Marker.
 * @author Antigravity (for Yure Party)
 *
 * @help
 * ============================================================================
 * FITUR UTAMA SISTEM TUTORIAL & NAVIGASI:
 * ============================================================================
 * 1. OFF-SCREEN OBJECTIVE MARKER (Penunjuk Arah Layar Dinamis):
 *    - Ketika objektif misi berada di luar jangkauan layar (Off-Screen):
 *      Lencana futuristik menempel di tepi layar dengan panah penunjuk arah
 *      yang berputar dinamis menunjuk ke lokasi target disertai jarak (meter).
 *    - Ketika target berada di dalam layar (On-Screen):
 *      Berpindah menjadi penanda mengambang (floating waypoint) di atas target.
 *    - Otomatis di Map 5:
 *      * Sebelum monster kalah -> Menunjuk ke arah Monster Bayangan (Event 5).
 *      * Setelah monster kalah -> Menunjuk ke arah Lubang Dinding Timur (Event 7).
 *    - Otomatis bersembunyi saat dialog/cutscene berlangsung agar tidak mengganggu.
 *
 * 2. LINE OF SIGHT (LOS) TRIGGER (Map 5 - Shadow Beast):
 *    - Nia otomatis terhenti saat melihat monster tanpa rintangan (jarak s/d 6.5 petak),
 *      memunculkan balon tanda seru [!], raungan monster, dan dialog pertarungan.
 *
 * 3. WINDOW TUTORIAL PERTARUNGAN (Window_BattleTutorial):
 *    - Window ungu gelap elegan berisi 4 modul aksi pertarungan dengan tipografi
 *      yang telah diperbesar (16px/13.5px) agar nyaman dan sangat jelas dibaca.
 *
 * 4. NOTIFICATION SLIDE LOG DARI KIRI (Post-Battle Equip Skill Guide):
 *    - Banner tutorial berukuran lega (460x126) dengan font tebal & jelas (14-16px)
 *      meluncur dari sisi kiri layar saat monster kalah menjelaskan equip skill.
 * ============================================================================
 */

(function() {
    'use strict';

    // ========================================================================
    // 1. WINDOW_BATTLETUTORIAL (Window Resmi Pertarungan - Font Diperbesar)
    // ========================================================================
    // ========================================================================
    // 1. WINDOW_BATTLETUTORIAL (Persona / Anime Styled Tactical Briefing Modal)
    // ========================================================================
    // ========================================================================
    // 1. WINDOW_BATTLETUTORIAL (Cute Anime Battle Guide Modal)
    // ========================================================================
    function Window_BattleTutorial() {
        this.initialize.apply(this, arguments);
    }

    Window_BattleTutorial.prototype = Object.create(Window_Base.prototype);
    Window_BattleTutorial.prototype.constructor = Window_BattleTutorial;

    Window_BattleTutorial.prototype.initialize = function() {
        // Modal tutorial: ukuran proporsional, bukan flat/gepeng
        // Lebar 600px (tidak full-screen), tinggi 400px, centered horizontal
        var w = Math.min(600, Graphics.boxWidth - 40);
        var h = 400;
        var x = (Graphics.boxWidth - w) / 2;
        var y = 25; // Mulai dari y=25, di bawah turn tracker

        Window_Base.prototype.initialize.call(this, x, y, w, h);

        this.opacity = 0;
        this.openness = 255;
        this.pivot.x = 0;
        this.pivot.y = 0;
        this.x = x;
        this.y = -(h + 20); // Off-screen atas sebelum animasi
        this.scale.x = 1.0;
        this.scale.y = 1.0;
        this.alpha = 0;
        this.hide();
        this.deactivate();

        this._pulseTimer = 0;
        this._onCloseCallback = null;
        this._canClose = false;
        this._openTimer = 0;
        this._tutorialX = x;
        this._tutorialY = y;
    };

    Window_BattleTutorial.prototype.standardPadding = function() {
        return 10;
    };

    Window_BattleTutorial.prototype.showTutorial = function(onClose) {
        this._onCloseCallback = onClose;
        this._canClose = false;
        this._openTimer = 12;
        this.refresh();
        this.show();
        this.activate();
        SoundManager.playOk();

        // Pindah ke paling atas display list agar tidak tertutup sprite manapun
        if (this.parent) {
            var p = this.parent;
            p.removeChild(this);
            p.addChild(this);
        }

        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this);
            this.y = -(this.height + 20);
            this.alpha = 0;
            window.anime({
                targets: this,
                y: this._tutorialY,
                alpha: 1.0,
                duration: 480,
                easing: 'easeOutBack'
            });
        } else {
            this.x = this._tutorialX;
            this.y = this._tutorialY;
            this.alpha = 1.0;
        }
    };

    Window_BattleTutorial.prototype.refresh = function() {
        this.contents.clear();
        var w = this.contentsWidth();
        var h = this.contentsHeight();
        var ctx = this.contents._context;

        // 1. Warm Deep Purple / Maroon Card Background
        ctx.save();
        var r = 16;
        ctx.beginPath();
        ctx.moveTo(r, 0); ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r); ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h); ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r); ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();

        ctx.fillStyle = 'rgba(32, 16, 44, 0.98)';
        ctx.fill();

        // Cute Pink/Gold Rounded Outline
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1;
        ctx.strokeRect(6, 6, w - 12, h - 12);

        // 2. Cute Header Badge
        var badgeW = Math.min(480, w - 40);
        var badgeH = 34;
        var badgeX = (w - badgeW) / 2;
        var badgeY = 10;
        var br = 12;

        ctx.beginPath();
        ctx.moveTo(badgeX + br, badgeY);
        ctx.lineTo(badgeX + badgeW - br, badgeY);
        ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + br);
        ctx.lineTo(badgeX + badgeW, badgeY + badgeH - br);
        ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - br, badgeY + badgeH);
        ctx.lineTo(badgeX + br, badgeY + badgeH);
        ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - br);
        ctx.lineTo(badgeX, badgeY + br);
        ctx.quadraticCurveTo(badgeX, badgeY, badgeX + br, badgeY);
        ctx.closePath();

        ctx.fillStyle = 'rgba(244, 114, 182, 0.22)';
        ctx.fill();
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Header Title Text
        this.contents.fontSize = 16;
        this.contents.fontBold = true;
        this.changeTextColor('#ffffff');
        this.drawText('⚔️ PANDUAN BERTARUNG NIA ⚔️', badgeX, badgeY + 2, badgeW, 'center');

        // Subtitle
        this.contents.fontSize = 12.5;
        this.contents.fontBold = false;
        this.changeTextColor('#fbcfe8');
        this.drawText('Panduan dasar aksi bergilir untuk menaklukkan Monster Bayangan', 0, badgeY + 38, w, 'center');

        // 3. Konten 4 Modul Aksi
        var items = [
            {
                icon: '🗡️',
                title: 'PERINTAH ATTACK (FISIK)',
                color: '#67e8f9',
                accent: '#22d3ee',
                desc: 'Serangan tebasan fisik langsung tanpa konsumsi MP. Sangat hemat energi.'
            },
            {
                icon: '⚡',
                title: 'SIHIR SPARK (MAGIC)',
                color: '#fde047',
                accent: '#facc15',
                desc: 'Sihir petir dahsyat berkekuatan masif (memakai MP) untuk meremukkan musuh!'
            },
            {
                icon: '💚',
                title: 'SIHIR HEAL (RECOVERY)',
                color: '#86efac',
                accent: '#4ade80',
                desc: 'Memulihkan HP Nia saat terluka. Jangan biarkan HP habis agar tidak kalah!'
            },
            {
                icon: '⏱️',
                title: 'TURN-BASED STRATEGY',
                color: '#f472b6',
                accent: '#ec4899',
                desc: 'Pertarungan berjalan sesuai giliran. Tentukan strategi terbaikmu dengan tenang.'
            }
        ];

        var colW = Math.floor((w - 30) / 2);
        var rowH = 92;
        var startX = 10;
        var startY = 82;
        var spacingX = 10;
        var spacingY = 10;

        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var col = i % 2;
            var row = Math.floor(i / 2);
            var ix = startX + col * (colW + spacingX);
            var iy = startY + row * (rowH + spacingY);

            // Card background plate
            ctx.save();
            var cr = 8;
            ctx.beginPath();
            ctx.moveTo(ix + cr, iy); ctx.lineTo(ix + colW - cr, iy);
            ctx.quadraticCurveTo(ix + colW, iy, ix + colW, iy + cr);
            ctx.lineTo(ix + colW, iy + rowH - cr);
            ctx.quadraticCurveTo(ix + colW, iy + rowH, ix + colW - cr, iy + rowH);
            ctx.lineTo(ix + cr, iy + rowH);
            ctx.quadraticCurveTo(ix, iy + rowH, ix, iy + rowH - cr);
            ctx.lineTo(ix, iy + cr);
            ctx.quadraticCurveTo(ix, iy, ix + cr, iy);
            ctx.closePath();

            ctx.fillStyle = 'rgba(48, 24, 64, 0.75)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(244, 114, 182, 0.35)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Left accent indicator bar
            ctx.fillStyle = it.accent;
            ctx.fillRect(ix, iy + 4, 4, rowH - 8);
            ctx.restore();

            // Module Title
            this.contents.fontSize = 13.5;
            this.contents.fontBold = true;
            this.changeTextColor(it.color);
            this.drawText(it.icon + ' ' + it.title, ix + 12, iy + 4, colW - 20, 'left');

            // Module Description
            this.contents.fontSize = 12;
            this.contents.fontBold = false;
            this.changeTextColor('#f1f5f9');
            this.drawWrappedDesc(it.desc, ix + 12, iy + 28, colW - 22, 16);
        }

        // 4. Prompt Button at Bottom
        this.drawPromptButton(w, h);
    };

    Window_BattleTutorial.prototype.drawWrappedDesc = function(text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';
        var curY = y;
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var testWidth = this.textWidth(testLine);
            if (testWidth > maxWidth && n > 0) {
                this.drawText(line, x, curY, maxWidth, 'left');
                line = words[n] + ' ';
                curY += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.drawText(line, x, curY, maxWidth, 'left');
    };

    Window_BattleTutorial.prototype.drawPromptButton = function(w, h) {
        var bw = Math.min(460, w - 40);
        var bh = 32;
        var bx = (w - bw) / 2;
        var by = h - bh - 10;

        var ctx = this.contents._context;
        ctx.save();
        var r = 10;
        ctx.beginPath();
        ctx.moveTo(bx + r, by); ctx.lineTo(bx + bw - r, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
        ctx.lineTo(bx + bw, by + bh - r);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
        ctx.lineTo(bx + r, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();

        ctx.fillStyle = 'rgba(244, 114, 182, 0.25)';
        ctx.fill();

        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        this.contents.fontSize = 13;
        this.contents.fontBold = true;
        this.changeTextColor('#ffffff');
        this.drawText('[ KLIK DI MANA SAJA / TEKAN APA SAJA UNTUK MULAI ]', bx, by + 2, bw, 'center');
    };

    Window_BattleTutorial.prototype.isOpenAndActive = function() {
        return this.visible && this.active;
    };

    Window_BattleTutorial.prototype.update = function() {
        Window_Base.prototype.update.call(this);

        if (this._openTimer > 0) {
            this._openTimer--;
            if (this._openTimer === 0) {
                this._canClose = true;
            }
            return;
        }

        if (this.visible && this.active && this._canClose) {
            if (Input.isTriggered('ok') || Input.isTriggered('cancel') ||
                Input.isTriggered('menu') || TouchInput.isTriggered() ||
                TouchInput.isCancelled() || Input.isPressed('ok')) {
                
                SoundManager.playOk();
                this.closeTutorial();
            }
        }
    };

    Window_BattleTutorial.prototype.closeTutorial = function() {
        this.deactivate();
        var self = this;
        if (typeof window.anime !== 'undefined') {
            window.anime.remove(this);
            // Slide kembali ke atas layar (off-screen)
            window.anime({
                targets: this,
                y: -(this.height + 10),
                alpha: 0,
                duration: 300,
                easing: 'easeInBack',
                complete: function() {
                    self.hide();
                    self.y = -(self.height + 10);
                    if (typeof self._onCloseCallback === 'function') {
                        var cb = self._onCloseCallback;
                        self._onCloseCallback = null;
                        cb();
                    }
                }
            });
        } else {
            this.hide();
            if (typeof this._onCloseCallback === 'function') {
                var cb = this._onCloseCallback;
                this._onCloseCallback = null;
                cb();
            }
        }
    };

    // ========================================================================
    // INTEGRASI SCENE_BATTLE
    // ========================================================================
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        this.createBattleTutorialWindow();
    };

    Scene_Battle.prototype.createBattleTutorialWindow = function() {
        this._battleTutorialWindow = new Window_BattleTutorial();
        // Gunakan addChild (bukan addWindow) agar tutorial dirender di atas SEMUA sprite
        // termasuk turn tracker portraits yang ada di atas _windowLayer
        this.addChild(this._battleTutorialWindow);
    };

    var _Scene_Battle_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
    Scene_Battle.prototype.startPartyCommandSelection = function() {
        if ($gameTroop && ($gameTroop._troopId === 3 || $gameTroop._troopId === 5) && !$gameSystem._battleTutorialShown) {
            _Scene_Battle_startPartyCommandSelection.call(this);
            return;
        }
        _Scene_Battle_startPartyCommandSelection.call(this);
    };

    var _Scene_Battle_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        var self = this;
        if ($gameTroop && ($gameTroop._troopId === 3 || $gameTroop._troopId === 5) && !$gameSystem._battleTutorialShown) {
            if (this._messageWindow && (this._messageWindow.isOpening() || this._messageWindow.isOpen() || $gameMessage.isBusy())) {
                var checkInterval = setInterval(function() {
                    if (!self._messageWindow.isOpen() && !$gameMessage.isBusy()) {
                        clearInterval(checkInterval);
                        self.triggerSafeTutorialWindow();
                    }
                }, 100);
                return;
            } else {
                this.triggerSafeTutorialWindow();
                return;
            }
        }

        _Scene_Battle_startActorCommandSelection.call(this);
    };

    Scene_Battle.prototype.triggerSafeTutorialWindow = function() {
        var self = this;
        if (!this._battleTutorialWindow) return;

        $gameSystem._battleTutorialShown = true;
        if ($gameSwitches) $gameSwitches.setValue(25, true);

        if (this._actorCommandWindow) {
            this._actorCommandWindow.deactivate();
        }

        this._battleTutorialWindow.showTutorial(function() {
            if (self._actorCommandWindow) {
                self._actorCommandWindow.activate();
            }
        });
    };

    // ========================================================================
    // 2. HYBRID SENSOR & MAP 5 ENCOUNTER TRIGGER (Event 5 Shadow Beast)
    // ========================================================================
    // ARSITEKTUR HYBRID (Plugin + Native RPG Maker Event):
    // 1. Logika Sinematik (Nia monolog diam, Monster kaget & menoleh, Terjangan
    //    sprint kencang, Layar flash benturan, Battle scene, & Pasca-battle)
    //    berjalan 100% NATIVE di Map005.json (Event 5) via Game_Interpreter.
    // 2. Plugin ini bertindak sebagai:
    //    - Penjaga Arah: Memastikan monster tetap menghadap kiri (direction 4)
    //      dan diam di tempat sebelum cutscene dipicu.
    //    - Sensor Cerdas: Saat Nia melangkah ke jarak pantau (y >= 17, dist <= 6.5)
    //      dengan pandangan lurus tanpa rintangan (LOS), plugin memicu ev.start().
    // ========================================================================

    function isTileVisionBlocked(x, y, targetEventId) {
        if (!$gameMap || !$gameMap.isValid(x, y)) return true;
        var flags = $gameMap.tilesetFlags();
        var tiles = $gameMap.allTiles(x, y);
        for (var i = 0; i < tiles.length; i++) {
            var flag = flags[tiles[i]];
            if ((flag & 0x10) !== 0) continue;
            if ((flag & 0x0f) === 0x0f) return true;
        }
        var events = $gameMap.eventsXyNt(x, y);
        for (var j = 0; j < events.length; j++) {
            if (events[j].eventId() !== targetEventId && !events[j].isThrough() && events[j].isNormalPriority()) {
                return true;
            }
        }
        return false;
    }

    // Pastikan monster tetap diam dan menghadap kiri (unaware) sebelum event dimulai
    var _Game_Event_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
    Game_Event.prototype.updateSelfMovement = function() {
        if (this._mapId === 5 && this._eventId === 5 && this._pageIndex === 0) {
            var monsterDefeated = $gameSelfSwitches && $gameSelfSwitches.value([5, 5, 'A']);
            if (!monsterDefeated && !$gameMap.isEventRunning()) {
                if (!this.isDirectionFixed()) {
                    this.setDirectionFix(true);
                }
                this.setDirection(4);
                return;
            }
        }
        _Game_Event_updateSelfMovement.call(this);
    };

    var _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);
        if (sceneActive) {
            this.updateTutorialMonsterSensor();
        }
    };

    Game_Player.prototype.updateTutorialMonsterSensor = function() {
        if (!$gameMap || $gameMap.mapId() !== 5) return;
        if ($gameSelfSwitches && $gameSelfSwitches.value([5, 5, 'A'])) return;
        if ($gameMap.isEventRunning() || $gameMessage.isBusy()) return;
        if (this.isMoving()) return; // Tunggu langkah Nia menapak sempurna

        var ev = $gameMap.event(5);
        if (!ev || ev._erased || ev._pageIndex !== 0) return;
        if (ev.isStarting()) return; // Jangan picu dobel saat sedang proses start

        // Nia harus sudah berada di lorong masuk (y >= 17)
        if (this.y < 17) return;

        var dx = ev.x - this.x;
        var dy = ev.y - this.y;
        var dist = Math.hypot(dx, dy);

        // Jarak sensor pantau 5 s/d 6.5 petak
        if (dist > 6.5) return;
        if (isTileVisionBlocked(this.x, this.y, 5)) return;

        // Picu cutscene native Event 5!
        this.straighten();
        ev.start();
    };

    // ========================================================================
    // 3. SPRITE_TUTORIALSIDELOG (Banner Slide Kiri - Tipografi Diperbesar)
    // ========================================================================
    function Sprite_TutorialSideLog() {
        this.initialize.apply(this, arguments);
    }

    Sprite_TutorialSideLog.prototype = Object.create(Sprite_Base.prototype);
    Sprite_TutorialSideLog.prototype.constructor = Sprite_TutorialSideLog;

    Sprite_TutorialSideLog.prototype.initialize = function() {
        Sprite_Base.prototype.initialize.call(this);
        this._cardWidth = 460;
        this._cardHeight = 126;
        this.bitmap = new Bitmap(this._cardWidth, this._cardHeight);
        this._cachedBaseBitmap = new Bitmap(this._cardWidth, this._cardHeight);
        
        this.x = -this._cardWidth - 20;
        this.y = 110;
        this.visible = false;
        this._state = 'idle';
        this._targetX = 24;
        this._timer = 0;
        this._maxTimer = 480;
    };

    Sprite_TutorialSideLog.prototype.show = function(title, line1, line2, hint, duration) {
        this._maxTimer = duration || 480;
        this._timer = this._maxTimer;
        this._targetX = 24;
        this.x = -this._cardWidth - 20;
        this.visible = true;
        this._state = 'sliding_in';

        this.redrawContent(title, line1, line2, hint);
        AudioManager.playSe({ name: 'Bell1', volume: 65, pitch: 115, pan: 0 });
    };

    Sprite_TutorialSideLog.prototype.dismiss = function() {
        if (this._state === 'sliding_in' || this._state === 'displaying') {
            this._state = 'sliding_out';
            this._targetX = -this._cardWidth - 20;
        }
    };

    Sprite_TutorialSideLog.prototype.redrawContent = function(title, line1, line2, hint) {
        var bmp = this._cachedBaseBitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = this._cardWidth;
        var h = this._cardHeight;
        var rad = 10;

        ctx.save();
        ctx.shadowColor = 'rgba(192, 132, 252, 0.35)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        ctx.moveTo(rad, 0);
        ctx.lineTo(w - rad, 0);
        ctx.arcTo(w, 0, w, rad, rad);
        ctx.lineTo(w, h - rad);
        ctx.arcTo(w, h, w - rad, h, rad);
        ctx.lineTo(rad, h);
        ctx.arcTo(0, h, 0, h - rad, rad);
        ctx.lineTo(0, rad);
        ctx.arcTo(0, 0, rad, 0, rad);
        ctx.closePath();

        var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, 'rgba(20, 10, 36, 0.95)');
        bgGrad.addColorStop(1, 'rgba(10, 5, 18, 0.97)');
        ctx.fillStyle = bgGrad;
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.70)';
        ctx.stroke();

        var stripeGrad = ctx.createLinearGradient(0, 0, 0, h);
        stripeGrad.addColorStop(0, '#38bdf8');
        stripeGrad.addColorStop(0.5, '#a855f7');
        stripeGrad.addColorStop(1, '#c084fc');
        ctx.fillStyle = stripeGrad;

        ctx.beginPath();
        ctx.moveTo(rad, 0);
        ctx.lineTo(6, 0);
        ctx.lineTo(6, h);
        ctx.lineTo(rad, h);
        ctx.arcTo(0, h, 0, h - rad, rad);
        ctx.lineTo(0, rad);
        ctx.arcTo(0, 0, rad, 0, rad);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Judul Badge (Diperbesar ke 16px)
        bmp.fontSize = 16;
        bmp.fontBold = true;
        bmp.textColor = '#fbbf24';
        bmp.drawText(title || '⚡ [TUTORIAL : PERSIAPAN SKILL]', 18, 10, w - 30, 24, 'left');

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(18, 38);
        ctx.lineTo(w - 18, 38);
        ctx.stroke();
        ctx.restore();

        // Teks Utama (Diperbesar ke 14px bold)
        bmp.fontSize = 14;
        bmp.fontBold = true;
        bmp.textColor = '#ffffff';
        bmp.drawText(line1 || 'Sebelum memasuki pertempuran, selalu pasang (Equip) skill', 18, 44, w - 30, 22, 'left');
        bmp.drawText(line2 || 'di Menu [ESC / X] > SKILL agar siap digunakan bertarung!', 18, 68, w - 30, 22, 'left');

        // Hint Bawah (Diperbesar ke 12px)
        bmp.fontSize = 12;
        bmp.fontBold = false;
        bmp.textColor = '#cbd5e1';
        bmp.drawText(hint || '[ESC / X] Buka Menu Skill • Otomatis menutup', 18, 96, w - 30, 20, 'left');

        bmp._setDirty();

        this.bitmap.clear();
        this.bitmap.blt(bmp, 0, 0, w, h, 0, 0);
        this.bitmap._setDirty();
    };

    Sprite_TutorialSideLog.prototype.drawProgressBar = function(ratio) {
        var bmp = this.bitmap;
        if (!this._cachedBaseBitmap) return;

        var w = this._cardWidth;
        var h = this._cardHeight;

        bmp.clear();
        bmp.blt(this._cachedBaseBitmap, 0, 0, w, h, 0, 0);

        var barH = 3;
        var barY = h - barH - 3;
        var startX = 6;
        var totalW = w - startX - 8;
        var currentW = Math.max(0, totalW * ratio);

        var ctx = bmp._context;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(startX, barY, totalW, barH);

        if (currentW > 0) {
            var grad = ctx.createLinearGradient(startX, 0, startX + totalW, 0);
            grad.addColorStop(0, '#38bdf8');
            grad.addColorStop(1, '#c084fc');
            ctx.fillStyle = grad;
            ctx.fillRect(startX, barY, currentW, barH);
        }
        ctx.restore();

        bmp._setDirty();
    };

    Sprite_TutorialSideLog.prototype.update = function() {
        Sprite_Base.prototype.update.call(this);

        if (!this.visible || this._state === 'idle') return;

        if (TouchInput.isTriggered()) {
            var tx = TouchInput.x;
            var ty = TouchInput.y;
            if (tx >= this.x && tx <= this.x + this._cardWidth &&
                ty >= this.y && ty <= this.y + this._cardHeight) {
                this.dismiss();
            }
        }

        if (this._state === 'sliding_in') {
            this.x += (this._targetX - this.x) * 0.18;
            if (Math.abs(this.x - this._targetX) < 1) {
                this.x = this._targetX;
                this._state = 'displaying';
            }
        } else if (this._state === 'displaying') {
            this._timer--;
            var ratio = Math.max(0, this._timer / this._maxTimer);
            this.drawProgressBar(ratio);

            if (this._timer <= 0) {
                this.dismiss();
            }
        } else if (this._state === 'sliding_out') {
            this.x += (this._targetX - this.x) * 0.20;
            if (this.x <= this._targetX + 5) {
                this.x = this._targetX;
                this.visible = false;
                this._state = 'idle';
            }
        }
    };

    // ========================================================================
    // 4. SPRITE_OBJECTIVEMARKER (Kompas / Indikator Penunjuk Arah Dinamis)
    // ========================================================================
    function Sprite_ObjectiveMarker() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ObjectiveMarker.prototype = Object.create(Sprite_Base.prototype);
    Sprite_ObjectiveMarker.prototype.constructor = Sprite_ObjectiveMarker;

    Sprite_ObjectiveMarker.prototype.initialize = function() {
        Sprite_Base.prototype.initialize.call(this);
        this._markerW = 120;
        this._markerH = 46;
        this.bitmap = new Bitmap(this._markerW, this._markerH);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.visible = false;
        
        this._targetEventId = null;
        this._targetTileX = null;
        this._targetTileY = null;
        this._targetIcon = '🎯';
        this._targetLabel = 'OBJECTIVE';
        
        this._bounceTimer = 0;
        this._lastMode = null; // 'onscreen', 'offscreen'
        this._lastDist = -1;
        this._lastAngleDeg = -999;
    };

    Sprite_ObjectiveMarker.prototype.setTarget = function(eventId, icon, label) {
        this._targetEventId = eventId;
        this._targetTileX = null;
        this._targetTileY = null;
        this._targetIcon = icon || '🎯';
        this._targetLabel = label || 'OBJECTIVE';
        this.visible = true;
    };

    Sprite_ObjectiveMarker.prototype.setTileTarget = function(x, y, icon, label) {
        this._targetEventId = null;
        this._targetTileX = x;
        this._targetTileY = y;
        this._targetIcon = icon || '🎯';
        this._targetLabel = label || 'OBJECTIVE';
        this.visible = true;
    };

    Sprite_ObjectiveMarker.prototype.clearTarget = function() {
        this._targetEventId = null;
        this._targetTileX = null;
        this._targetTileY = null;
        this.visible = false;
    };

    Sprite_ObjectiveMarker.prototype.update = function() {
        Sprite_Base.prototype.update.call(this);

        this.updateAutoMap5Target();

        // Sembunyikan saat sedang cutscene atau dialog berlangsung
        if ($gameMap.isEventRunning() || $gameMessage.isBusy()) {
            this.visible = false;
            return;
        }

        var targetPos = this.getTargetPosition();
        if (!targetPos) {
            this.visible = false;
            return;
        }

        this.visible = true;
        this._bounceTimer++;

        var screenW = Graphics.boxWidth;
        var screenH = Graphics.boxHeight;
        var cx = screenW / 2;
        var cy = screenH / 2;

        var targetScreenX = Math.round($gameMap.adjustX(targetPos.x) * $gameMap.tileWidth() + $gameMap.tileWidth() / 2);
        var targetScreenY = Math.round($gameMap.adjustY(targetPos.y) * $gameMap.tileHeight() + $gameMap.tileHeight() / 2);

        // Batas aman on-screen margin
        var marginX = 64;
        var marginY = 56;
        var isOnScreen = (targetScreenX >= marginX && targetScreenX <= screenW - marginX &&
                          targetScreenY >= marginY && targetScreenY <= screenH - marginY);

        var playerDist = Math.hypot(targetPos.x - $gamePlayer.x, targetPos.y - $gamePlayer.y);
        var distMeters = Math.max(1, Math.round(playerDist * 2));

        if (isOnScreen) {
            // TARGET DI DALAM LAYAR (ON-SCREEN): Penanda melayang di atas kepala
            var bounce = Math.sin(this._bounceTimer * 0.08) * 5;
            this.x = targetScreenX;
            this.y = targetScreenY - 48 + bounce;
            this.rotation = 0;

            if (this._lastMode !== 'onscreen') {
                this._lastMode = 'onscreen';
                this.redrawOnScreenMarker();
            }
        } else {
            // TARGET DI LUAR LAYAR (OFF-SCREEN): Menempel di tepi layar dengan panah penunjuk
            var dx = targetScreenX - cx;
            var dy = targetScreenY - cy;
            var halfW = cx - marginX;
            var halfH = cy - marginY;

            var edgeX, edgeY;
            if (Math.abs(dx) * halfH > Math.abs(dy) * halfW) {
                edgeX = dx > 0 ? cx + halfW : cx - halfW;
                edgeY = cy + (halfW * dy) / Math.abs(dx);
            } else {
                edgeY = dy > 0 ? cy + halfH : cy - halfH;
                edgeX = cx + (halfH * dx) / Math.abs(dy);
            }

            var angleRad = Math.atan2(dy, dx);
            var angleDeg = Math.round(angleRad * 180 / Math.PI);

            this.x = Math.round(edgeX);
            this.y = Math.round(edgeY);
            this.rotation = 0; // Rotasi dikontrol di dalam gambar panah

            if (this._lastMode !== 'offscreen' || this._lastDist !== distMeters || Math.abs(this._lastAngleDeg - angleDeg) > 3) {
                this._lastMode = 'offscreen';
                this._lastDist = distMeters;
                this._lastAngleDeg = angleDeg;
                this.redrawOffScreenMarker(angleRad, distMeters);
            }
        }
    };

    Sprite_ObjectiveMarker.prototype.getTargetPosition = function() {
        if (this._targetEventId) {
            var ev = $gameMap.event(this._targetEventId);
            if (ev && !ev._erased) {
                return { x: ev.x, y: ev.y };
            }
            return null;
        }
        if (this._targetTileX !== null && this._targetTileY !== null) {
            return { x: this._targetTileX, y: this._targetTileY };
        }
        return null;
    };

    Sprite_ObjectiveMarker.prototype.updateAutoMap5Target = function() {
        if (!$gameMap || $gameMap.mapId() !== 5) return;

        // Cek apakah monster bayangan masih hidup
        var monsterDefeated = $gameSelfSwitches && $gameSelfSwitches.value([5, 5, 'A']);
        if (!monsterDefeated) {
            // Marker monster dinonaktifkan sesuai permintaan user
            if (this._targetEventId) {
                this.clearTarget();
            }
        } else {
            // Monster telah kalah -> Arahkan ke Lubang Retakan Dinding (Event 7 pada 20, 13)
            var playerDistToExit = Math.hypot(20 - $gamePlayer.x, 13 - $gamePlayer.y);
            if (playerDistToExit > 1.2) {
                if (this._targetEventId !== 7) {
                    this.setTarget(7, '🚪', 'KELUAR');
                }
            } else {
                // Pemain sudah sampai di lubang dinding
                this.clearTarget();
            }
        }
    };

    Sprite_ObjectiveMarker.prototype.redrawOnScreenMarker = function() {
        var bmp = this.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = this._markerW;
        var h = this._markerH;

        ctx.save();
        // Lencana Mengambang On-Screen
        var pillW = 84;
        var pillH = 26;
        var pillX = (w - pillW) / 2;
        var pillY = 6;
        var rad = 13;

        ctx.shadowColor = 'rgba(192, 132, 252, 0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pillX + rad, pillY + rad, rad, Math.PI / 2, Math.PI * 1.5);
        ctx.lineTo(pillX + pillW - rad, pillY);
        ctx.arc(pillX + pillW - rad, pillY + rad, rad, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(pillX + rad, pillY + pillH);
        ctx.closePath();

        ctx.fillStyle = 'rgba(20, 10, 36, 0.92)';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#c084fc';
        ctx.stroke();

        // Segitiga penunjuk ke bawah
        ctx.beginPath();
        ctx.moveTo(w / 2 - 6, pillY + pillH);
        ctx.lineTo(w / 2 + 6, pillY + pillH);
        ctx.lineTo(w / 2, pillY + pillH + 6);
        ctx.closePath();
        ctx.fillStyle = '#c084fc';
        ctx.fill();
        ctx.restore();

        bmp.fontSize = 13;
        bmp.fontBold = true;
        bmp.textColor = '#fbbf24';
        bmp.drawText(this._targetIcon + ' ' + this._targetLabel, pillX, pillY + 1, pillW, 24, 'center');
        bmp._setDirty();
    };

    Sprite_ObjectiveMarker.prototype.redrawOffScreenMarker = function(angleRad, distMeters) {
        var bmp = this.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = this._markerW;
        var h = this._markerH;

        ctx.save();
        // Lencana Persegi Panjang Membulat (Off-Screen Badge)
        var bw = 104;
        var bh = 34;
        var bx = (w - bw) / 2;
        var by = (h - bh) / 2;
        var rad = 17;

        ctx.shadowColor = 'rgba(192, 132, 252, 0.7)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(bx + rad, by + rad, rad, Math.PI / 2, Math.PI * 1.5);
        ctx.lineTo(bx + bw - rad, by);
        ctx.arc(bx + bw - rad, by + rad, rad, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(bx + rad, by + bh);
        ctx.closePath();

        var bgGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
        bgGrad.addColorStop(0, 'rgba(28, 12, 48, 0.94)');
        bgGrad.addColorStop(1, 'rgba(14, 6, 24, 0.96)');
        ctx.fillStyle = bgGrad;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#c084fc';
        ctx.stroke();
        ctx.restore();

        // Gambar Panah Berputar yang Menunjuk ke Arah Target
        ctx.save();
        var arrowCenterX = bx + 18;
        var arrowCenterY = by + bh / 2;
        ctx.translate(arrowCenterX, arrowCenterY);
        ctx.rotate(angleRad);

        // Bentuk panah tajam chevron
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-5, -6);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-5, 6);
        ctx.closePath();
        ctx.fillStyle = '#38bdf8'; // Cyan terang
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();

        // Teks Ikon + Jarak Meter
        bmp.fontSize = 13;
        bmp.fontBold = true;
        bmp.textColor = '#ffffff';
        var textStr = this._targetIcon + ' ' + distMeters + 'm';
        bmp.drawText(textStr, bx + 32, by + 5, bw - 36, 24, 'left');
        bmp._setDirty();
    };

    // ========================================================================
    // INTEGRASI SCENE_MAP
    // ========================================================================
    var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        this.createTutorialSideLog();
        this.createObjectiveMarker();
    };

    Scene_Map.prototype.createTutorialSideLog = function() {
        this._tutorialSideLog = new Sprite_TutorialSideLog();
        this.addChild(this._tutorialSideLog);
    };

    Scene_Map.prototype.createObjectiveMarker = function() {
        this._objectiveMarker = new Sprite_ObjectiveMarker();
        this.addChild(this._objectiveMarker);
    };

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        this.updateTutorialSideLogTrigger();
    };

    Scene_Map.prototype.updateTutorialSideLogTrigger = function() {
        if (!this._tutorialSideLog) return;

        if ($gameMap && $gameMap.mapId() === 5) {
            if ($gameSelfSwitches && $gameSelfSwitches.value([5, 5, 'A'])) {
                if (!$gameSystem._tutorialSkillLogShown && !$gameMap.isEventRunning() && !$gameMessage.isBusy()) {
                    $gameSystem._tutorialSkillLogShown = true;
                    this._tutorialSideLog.show(
                        '⚡ [TUTORIAL : PERSIAPAN SKILL]',
                        'Sebelum memasuki pertempuran, selalu pasang (Equip) skill',
                        'di Menu [ESC / X] > SKILL agar siap digunakan bertarung!',
                        '[ESC / X] Buka Menu Skill • Otomatis menutup',
                        480
                    );
                }
            }
        }
    };

    // Global Public API
    window.Yure = window.Yure || {};
    window.Yure.TutorialLog = {
        show: function(title, line1, line2, hint, duration) {
            if (SceneManager._scene && SceneManager._scene instanceof Scene_Map && SceneManager._scene._tutorialSideLog) {
                SceneManager._scene._tutorialSideLog.show(title, line1, line2, hint, duration);
            }
        }
    };

    window.Yure.ObjectiveMarker = {
        setTarget: function(eventId, icon, label) {
            if (SceneManager._scene && SceneManager._scene instanceof Scene_Map && SceneManager._scene._objectiveMarker) {
                SceneManager._scene._objectiveMarker.setTarget(eventId, icon, label);
            }
        },
        setTileTarget: function(x, y, icon, label) {
            if (SceneManager._scene && SceneManager._scene instanceof Scene_Map && SceneManager._scene._objectiveMarker) {
                SceneManager._scene._objectiveMarker.setTileTarget(x, y, icon, label);
            }
        },
        clearTarget: function() {
            if (SceneManager._scene && SceneManager._scene instanceof Scene_Map && SceneManager._scene._objectiveMarker) {
                SceneManager._scene._objectiveMarker.clearTarget();
            }
        }
    };

    console.log('[Yure_BattleTutorialSpotlight] Comprehensive Tutorial & Navigation System v3.5 initialized.');

})();

// ============================================================================
// PERMANENT FIX: ENSURE MOG EXP METER NEVER APPEARS
// ============================================================================
if (typeof Moghunter !== 'undefined') {
    Moghunter.ahud_exp_meter_visible = "false";
}
if (typeof Actor_Hud !== 'undefined') {
    Actor_Hud.prototype.create_exp_meter = function() {
        if (this._exp_meter) {
            this.removeChild(this._exp_meter);
            this._exp_meter = null;
        }
    };
}
