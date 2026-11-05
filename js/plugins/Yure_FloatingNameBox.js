//=============================================================================
// Yure_FloatingNameBox.js (Helltaker Cinematic Letterbox Dialogue Edition)
//=============================================================================
/*:
 * @plugindesc [v3.2] Sistem Dialog Cinematic Letterbox bergaya Helltaker dengan stripes hitam atas-bawah, animasi sliding cerdas, dan penutupan otomatis akurat.
 * @author Antigravity (for Yure Party)
 *
 * @help
 * ============================================================================
 * FITUR UTAMA (HELLTAKER CINEMATIC DIALOGUE SYSTEM):
 * ============================================================================
 * 1. STRIPES HITAM CINEMATIC (LETTERBOX BARS):
 *    - Bar atas selebar layar penuh (full-width) dengan hairline divider tipis.
 *    - Bar bawah (Window_Message) selebar layar penuh, solid obsidian (#0b0410).
 * 2. ANIMASI SLIDING CERDAS (SEAMLESS MULTI-DIALOGUE & CLOSING FIX):
 *    - Saat dialog pertama mulai: Bar atas dan bawah meluncur masuk secara mulus.
 *    - Saat menekan Enter untuk melanjutkan dialog berikutnya yang tersambung langsung:
 *      Kedua bar TETAP DI POSISINYA (TIDAK naik-turun / bouncing).
 *    - Saat rangkaian dialog selesai / berpindah ke aksi lain: Bar meluncur keluar
 *      layar secara sinkron dan MENUTUP SEMPURNA.
 * 3. BUST KARAKTER DENGAN LATAR BELAKANG INGAME:
 *    - Karakter bust berdiri di tengah viewport di atas latar belakang gameplay.
 *    - Tubuh bagian bawah terbingkai rapi di balik bar bawah, sementara kepala/rambut
 *      dapat sedikit tumpang tindih di depan bar atas (efek kedalaman 3D ala Helltaker).
 * 4. TATA LETAK HELLTAKER IDENTIK:
 *    - Nama pembicara terpusat di tengah dengan warna merah crimson: • Nama •
 *    - Seluruh baris teks percakapan terpusat secara horizontal di tengah layar.
 *    - Ikon pause (lanjut) berupa lambang mata crimson [ < o > ] berdenyut lembut
 *      di tengah bawah bar pesan saat menunggu tombol pemain.
 * 5. STABILITAS TINGGI & BEBAS CRASH:
 *    - Window_NameBox dinetralisir dengan aman tanpa error isClosing.
 * ============================================================================
 */

(function() {
    'use strict';

    // ========================================================================
    // 1. SPRITE STRIPE ATAS (SPRITE_CINEMATICTOPBAR)
    // ========================================================================
    function Sprite_CinematicTopBar() {
        this.initialize.apply(this, arguments);
    }
    Sprite_CinematicTopBar.prototype = Object.create(Sprite.prototype);
    Sprite_CinematicTopBar.prototype.constructor = Sprite_CinematicTopBar;

    Sprite_CinematicTopBar.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._barHeight = Math.round(Graphics.boxHeight * 0.125); // ~90px at 720p
        this.bitmap = new Bitmap(Graphics.boxWidth, this._barHeight);
        
        var ctx = this.bitmap._context;
        // Warna obsidian hitam solid pekat
        ctx.fillStyle = '#0b0410';
        ctx.fillRect(0, 0, Graphics.boxWidth, this._barHeight);
        
        // Hairline divider lembut di tepi bawah
        ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.fillRect(0, this._barHeight - 1, Graphics.boxWidth, 1);

        this.x = 0;
        this.y = -this._barHeight;
        this.visible = false;
        this.z = 1;
    };

    // ========================================================================
    // 2. NETRALISIR WINDOW_NAMEBOX BAWAAN YANFLY SECARA AMAN
    // ========================================================================
    if (typeof Window_NameBox !== 'undefined') {
        var _Window_NameBox_initialize = Window_NameBox.prototype.initialize;
        Window_NameBox.prototype.initialize = function(parentWindow) {
            this._parentWindow = parentWindow;
            _Window_NameBox_initialize.call(this, parentWindow);
            this.opacity = 0;
            this.backOpacity = 0;
            this.contentsOpacity = 0;
            this.visible = false;
            this._openness = 0;
            this._closeCounter = 0;
            this.hide();
            this.deactivate();
            this.close();
        };

        Window_NameBox.prototype.update = function() {
            if (this.visible) this.visible = false;
            if (this._openness > 0) this._openness = 0;
        };

        Window_NameBox.prototype.refresh = function(text, position) {
            if (text) {
                var clean = text.replace(/\\c\[\d+\]/gi, '').replace(/\x1b[A-Z]\[\d+\]/gi, '').trim();
                var targetWindow = this._parentWindow || (Yanfly.nameWindow && Yanfly.nameWindow._parentWindow);
                if (targetWindow) {
                    targetWindow._speakerName = clean;
                }
            }
            this.hide();
            this.deactivate();
            this._openness = 0;
            return '';
        };

        Window_NameBox.prototype.open = function() { this.hide(); this._openness = 0; };
        Window_NameBox.prototype.close = function() { this.hide(); this._openness = 0; };
        Window_NameBox.prototype.isOpen = function() { return false; };
        Window_NameBox.prototype.isOpening = function() { return false; };
        Window_NameBox.prototype.isClosing = function() { return false; };
        Window_NameBox.prototype.isClosed = function() { return true; };
        Window_NameBox.prototype.adjustPositionX = function() {};
        Window_NameBox.prototype.adjustPositionY = function() {};
        Window_NameBox.prototype.updatePlacement = function() {};
    }

    // ========================================================================
    // 3. WINDOW_MESSAGE: STRIPE BAWAH & SLIDING CONTROLLER
    // ========================================================================
    var _Window_Message_initialize = Window_Message.prototype.initialize;
    Window_Message.prototype.initialize = function() {
        _Window_Message_initialize.call(this);

        this._animState = 'closed'; // 'closed', 'sliding_in', 'open', 'sliding_out'
        this._animFrame = 0;
        this._speakerName = null;
        this._lineStartX = [];
        this._currentLineIndex = 0;

        // Posisi awal di luar layar bawah
        this.y = Graphics.boxHeight;
        this.visible = false;
        this._openness = 0;

        this.ensureCinematicBackground();
        this.ensureHelltakerPauseSign();
    };

    Window_Message.prototype.windowWidth = function() {
        return Graphics.boxWidth;
    };

    Window_Message.prototype.windowHeight = function() {
        return Math.round(Graphics.boxHeight * 0.27); // ~195px at 720p
    };

    Window_Message.prototype.adjustWindowSettings = function() {
        this.width = this.windowWidth();
        this.height = this.windowHeight();
        this.x = 0;
        this.createContents();
        this.ensureCinematicBackground();
    };

    Window_Message.prototype.updatePlacement = function() {
        this.x = 0;
        this.width = this.windowWidth();
        this.height = this.windowHeight();
        this.ensureCinematicBackground();
    };

    Window_Message.prototype.ensureCinematicBackground = function() {
        if (!this._cinematicBackSprite) {
            this._cinematicBackSprite = new Sprite();
            this.addChildToBack(this._cinematicBackSprite);
        }
        var bw = Graphics.boxWidth;
        var bh = this.height;
        if (!this._cinematicBackSprite.bitmap || this._cinematicBackSprite.bitmap.width !== bw || this._cinematicBackSprite.bitmap.height !== bh) {
            var bmp = new Bitmap(bw, bh);
            var ctx = bmp._context;
            // Obsidian solid background
            ctx.fillStyle = '#0b0410';
            ctx.fillRect(0, 0, bw, bh);
            // Hairline divider lembut di tepi atas
            ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
            ctx.fillRect(0, 0, bw, 1);
            this._cinematicBackSprite.bitmap = bmp;
        }
        this.opacity = 0;
        this.backOpacity = 0;
    };

    Window_Message.prototype.ensureTopBar = function() {
        var scene = SceneManager._scene;
        if (!scene) return;

        var targetParent = scene;
        var insertBefore = null;

        if (scene._spriteset && scene._spriteset._msgBustSpriteL) {
            targetParent = scene._spriteset;
            insertBefore = scene._spriteset._msgBustSpriteL;
        }

        if (!this._topBarSprite || this._topBarSprite.parent !== targetParent) {
            if (this._topBarSprite && this._topBarSprite.parent) {
                this._topBarSprite.parent.removeChild(this._topBarSprite);
            }
            this._topBarSprite = new Sprite_CinematicTopBar();
            if (targetParent === scene._spriteset && insertBefore) {
                var bustIndex = scene._spriteset.children.indexOf(insertBefore);
                if (bustIndex >= 0) {
                    scene._spriteset.addChildAt(this._topBarSprite, bustIndex);
                } else {
                    scene._spriteset.addChild(this._topBarSprite);
                }
            } else {
                var wlIndex = scene.children.indexOf(scene._windowLayer);
                if (wlIndex >= 0) {
                    scene.addChildAt(this._topBarSprite, wlIndex);
                } else {
                    scene.addChild(this._topBarSprite);
                }
            }
        }
    };

    Window_Message.prototype.ensureHelltakerPauseSign = function() {
        if (!this._helltakerPauseSprite) {
            this._helltakerPauseSprite = new Sprite();
            var bmp = new Bitmap(52, 26);
            var ctx = bmp._context;
            ctx.strokeStyle = '#ff4d6d'; // Crimson red
            ctx.lineWidth = 2;

            // Gambar siluet mata ala Helltaker: < o >
            ctx.beginPath();
            ctx.moveTo(6, 13);
            ctx.quadraticCurveTo(26, 2, 46, 13);
            ctx.quadraticCurveTo(26, 24, 6, 13);
            ctx.stroke();

            // Pupil mata merah
            ctx.fillStyle = '#ff4d6d';
            ctx.beginPath();
            ctx.arc(26, 13, 4, 0, Math.PI * 2);
            ctx.fill();

            this._helltakerPauseSprite.bitmap = bmp;
            this._helltakerPauseSprite.anchor.x = 0.5;
            this._helltakerPauseSprite.anchor.y = 0.5;
            this.addChild(this._helltakerPauseSprite);
        }

        this._helltakerPauseSprite.x = Graphics.boxWidth / 2;
        this._helltakerPauseSprite.y = this.height - 20;

        if (this._windowPauseSignSprite) {
            this._windowPauseSignSprite.visible = false;
            this._windowPauseSignSprite.alpha = 0;
        }

        if (this.pause) {
            this._helltakerPauseSprite.visible = true;
            this._helltakerPauseSprite.alpha = 0.65 + 0.35 * Math.abs(Math.sin(Date.now() / 250));
        } else {
            this._helltakerPauseSprite.visible = false;
        }
    };

    // ========================================================================
    // 4. DETEKSI AKURAT PERINTAH DIALOG BERIKUTNYA
    // ========================================================================
    Window_Message.prototype.isNextCommandDialogue = function() {
        var interpreter = null;
        if (typeof $gameParty !== 'undefined' && $gameParty && $gameParty.inBattle && $gameParty.inBattle()) {
            if (typeof $gameTroop !== 'undefined' && $gameTroop && $gameTroop._interpreter && $gameTroop._interpreter.isRunning()) {
                interpreter = $gameTroop._interpreter;
            }
        } else {
            if (typeof $gameMap !== 'undefined' && $gameMap && $gameMap._interpreter && $gameMap._interpreter.isRunning()) {
                interpreter = $gameMap._interpreter;
            }
        }

        if (!interpreter || !interpreter.isRunning()) return false;

        if (interpreter._childInterpreter && interpreter._childInterpreter.isRunning()) {
            interpreter = interpreter._childInterpreter;
        }

        var list = interpreter._list;
        if (!list) return false;
        var index = interpreter._index;

        // Pindai perintah dari index saat ini
        for (var i = index; i < list.length; i++) {
            var cmd = list[i];
            if (!cmd) continue;
            var code = cmd.code;

            // Abaikan komentar (108/408) dan label (118)
            if (code === 108 || code === 408 || code === 118) {
                continue;
            }

            // Jika perintah berikutnya langsung Show Text (101), Choices (102), Number (103), Item (104)
            if (code === 101 || code === 102 || code === 103 || code === 104) {
                return true;
            }

            // Perintah apa pun lainnya: battle, switch, self-switch, wait, audio, transfer, dsb.
            // menandakan dialog SELESAI, window HARUS MENUTUP!
            return false;
        }

        return false;
    };

    // ========================================================================
    // 5. ANIMASI SLIDING (OPEN, CLOSE, UPDATE)
    // ========================================================================
    Window_Message.prototype.open = function() {
        this.ensureTopBar();
        this.ensureCinematicBackground();
        this._openness = 255;
        this.visible = true;
        if (this._topBarSprite) this._topBarSprite.visible = true;

        if (this._animState === 'open') {
            // Sudah berada di posisi terbuka: TETAPKAN TANPA RESTART SLIDE
            this._animFrame = 14;
            this._opening = false;
            this._closing = false;
            this.y = Graphics.boxHeight - this.height;
            if (this._topBarSprite) this._topBarSprite.y = 0;
        } else {
            // Belum terbuka atau sedang sliding out: mulai animasi meluncur masuk
            this._animState = 'sliding_in';
            this._animFrame = 0;
            this._opening = true;
            this._closing = false;
        }
    };

    Window_Message.prototype.close = function() {
        this._animState = 'sliding_out';
        this._animFrame = 0;
        this._closing = true;
        this._opening = false;
    };

    Window_Message.prototype.isOpen = function() {
        return this._animState === 'open' || (this._animState === 'sliding_in' && this._animFrame >= 14);
    };

    Window_Message.prototype.isClosed = function() {
        return this._animState === 'closed';
    };

    Window_Message.prototype.isOpening = function() {
        return this._animState === 'sliding_in';
    };

    Window_Message.prototype.isClosing = function() {
        return this._animState === 'sliding_out';
    };

    var _Window_Message_doesContinue = Window_Message.prototype.doesContinue;
    Window_Message.prototype.doesContinue = function() {
        if (this.isNextCommandDialogue()) return true;
        return _Window_Message_doesContinue.call(this);
    };

    Window_Message.prototype.checkToNotClose = function() {
        if (this.isClosing()) {
            if (this.doesContinue() || this.isNextCommandDialogue()) {
                this._animState = 'open';
                this._animFrame = 14;
                this._closing = false;
                this._opening = false;
                this.y = Graphics.boxHeight - this.height;
                if (this._topBarSprite) this._topBarSprite.y = 0;
            }
        }
    };

    Window_Message.prototype.updateCinematicAnimation = function() {
        this.ensureTopBar();
        var topH = Math.round(Graphics.boxHeight * 0.125);
        var botH = this.height;
        var screenH = Graphics.boxHeight;

        if (this._animState === 'sliding_in') {
            this._animFrame++;
            var t = Math.min(1.0, this._animFrame / 14);
            var ease = 1 - Math.pow(1 - t, 3); // Ease-out cubic

            if (this._topBarSprite) {
                this._topBarSprite.visible = true;
                this._topBarSprite.y = Math.round(-topH * (1 - ease));
            }
            this.y = Math.round(screenH - botH * ease);
            this.visible = true;
            this._opening = true;

            if (t >= 1.0) {
                this._animState = 'open';
                this._opening = false;
                if (this._topBarSprite) this._topBarSprite.y = 0;
                this.y = screenH - botH;
            }
        } else if (this._animState === 'sliding_out') {
            this._animFrame++;
            var t = Math.min(1.0, this._animFrame / 12);
            var ease = Math.pow(1.0 - t, 3); // Ease-in cubic

            if (this._topBarSprite) {
                this._topBarSprite.y = Math.round(-topH * (1 - ease));
            }
            this.y = Math.round(screenH - botH * ease);
            this._closing = true;

            if (t >= 1.0) {
                this._animState = 'closed';
                this._closing = false;
                this.visible = false;
                this._openness = 0;
                if (this._topBarSprite) {
                    this._topBarSprite.visible = false;
                    this._topBarSprite.y = -topH;
                }
                this.y = screenH;
            }
        } else if (this._animState === 'open') {
            if (this._topBarSprite) {
                this._topBarSprite.visible = true;
                this._topBarSprite.y = 0;
            }
            this.y = screenH - botH;
            this.visible = true;
            this._opening = false;
            this._closing = false;
        } else if (this._animState === 'closed') {
            if (this._topBarSprite) {
                this._topBarSprite.visible = false;
                this._topBarSprite.y = -topH;
            }
            this.y = screenH;
            this.visible = false;
            this._opening = false;
            this._closing = false;
        }
    };

    var _Window_Message_update = Window_Message.prototype.update;
    Window_Message.prototype.update = function() {
        this.updateCinematicAnimation();
        this.ensureHelltakerPauseSign();
        _Window_Message_update.call(this);
    };

    // ========================================================================
    // 6. INTERSEPSI NAMA PEMBICARA & FORMATTING TEKS
    // ========================================================================
    var _Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function() {
        this._speakerName = null;
        this._lineStartX = [];
        this._currentLineIndex = 0;
        _Window_Message_startMessage.call(this);
    };

    var _Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function() {
        this._speakerName = null;
        this._lineStartX = [];
        this._currentLineIndex = 0;

        var willContinue = this.isNextCommandDialogue();

        if (willContinue) {
            // Masih ada dialog berikutnya: HANYA BERSIHKAN TEKS, BAR TETAP TERBUKA
            this.contents.clear();
            if (this._helltakerPauseSprite) {
                this._helltakerPauseSprite.visible = false;
            }
            $gameMessage.clear();
        } else {
            // Benar-benar tidak ada dialog lagi: TUTUP BAR SEGERA!
            _Window_Message_terminateMessage.call(this);
        }
    };

    var _Window_Message_convertEscapeCharacters = Window_Message.prototype.convertEscapeCharacters;
    Window_Message.prototype.convertEscapeCharacters = function(text) {
        // Deteksi tag nama Yanfly: \n<Nama> atau \N<Nama>
        var yanflyTagRegex = /(?:\\|\x1b)N\<(.*?)\>/i;
        var yMatch = text.match(yanflyTagRegex);
        if (yMatch) {
            this._speakerName = yMatch[1].trim();
            text = text.replace(yanflyTagRegex, '');
        }

        // Deteksi awalan nama: \N[id]: atau [Nama]: atau Nama:
        var speakerRegex = /^\s*(?:\\N\[(\d+)\]|\[([A-Za-z0-9_ -]+)\]|([A-Za-z0-9_]+))\s*:\s*/im;
        var match = text.match(speakerRegex);
        if (match) {
            var candidateName = '';
            if (match[1]) {
                var actorId = parseInt(match[1]);
                var actor = (typeof $gameActors !== 'undefined' && $gameActors) ? $gameActors.actor(actorId) : null;
                candidateName = actor ? actor.name() : ('Actor ' + actorId);
            } else if (match[2]) {
                candidateName = match[2].trim();
            } else if (match[3]) {
                var cand = match[3].trim();
                var ignored = ['C', 'V', 'G', 'N', 'P', 'I', 'IF', 'NOTE', 'HINT', 'WARNING'];
                if (ignored.indexOf(cand.toUpperCase()) === -1) {
                    candidateName = cand;
                }
            }

            if (candidateName) {
                this._speakerName = candidateName;
                text = text.replace(/^\s*(?:\\N\[\d+\]|\[[A-Za-z0-9_ -]+\]|[A-Za-z0-9_]+)\s*:\s*/gim, '');
            }
        }

        return _Window_Message_convertEscapeCharacters.call(this, text);
    };

    // ========================================================================
    // 7. LAYOUT HELLTAKER (NAMA & TEKS TERPUSAT DI TENGAH)
    // ========================================================================
    var _Window_Message_newPage = Window_Message.prototype.newPage;
    Window_Message.prototype.newPage = function(textState) {
        _Window_Message_newPage.call(this, textState);

        // 1. Gambar Nama Pembicara di Tengah (Crimson Red: • Modeus, the Lustful Demon •)
        if (this._speakerName) {
            this.resetFontSettings();
            this.contents.fontSize = 22;
            this.contents.fontBold = true;
            this.changeTextColor('#ff4d6d'); // Crimson Red khas Helltaker
            var displayName = '• ' + this._speakerName + ' •';
            this.drawText(displayName, 0, 12, this.contents.width, 'center');
            textState.y = 48; // Teks dialog mulai di bawah nama
        } else {
            textState.y = 36; // Tanpa pembicara, dialog mulai lebih atas
        }

        // 2. Pra-kalkulasi Posisi Horizontal Terpusat untuk Setiap Baris Dialog
        var lines = textState.text.split('\n');
        this._lineStartX = [];
        for (var i = 0; i < lines.length; i++) {
            var rawLine = lines[i];
            // Bersihkan escape code untuk pengukuran lebar teks yang presisi
            var cleanLine = rawLine.replace(/\x1b[A-Z]+(?:\[\d+\])?/gi, '')
                                   .replace(/\\c\[\d+\]/gi, '')
                                   .replace(/\\v\[\d+\]/gi, '')
                                   .trim();
            this.resetFontSettings();
            this.contents.fontSize = 22;
            var w = this.textWidth(cleanLine);
            var sx = Math.max(24, Math.floor((this.contents.width - w) / 2));
            this._lineStartX.push(sx);
        }

        this._currentLineIndex = 0;
        textState.x = this._lineStartX[0] || 24;
        textState.left = textState.x;

        // Reset warna teks dialog ke putih bersih
        this.resetFontSettings();
        this.contents.fontSize = 22;
        this.contents.fontBold = false;
        this.changeTextColor('#f8fafc');
    };

    Window_Message.prototype.processNewLine = function(textState) {
        this._currentLineIndex++;
        var nextX = (this._lineStartX && this._lineStartX[this._currentLineIndex] !== undefined)
            ? this._lineStartX[this._currentLineIndex]
            : 24;
        textState.x = nextX;
        textState.left = nextX;
        textState.y += textState.height;
        textState.height = this.calcTextHeight(textState, false);
        textState.index++;
    };

    console.log('[Yure_FloatingNameBox] Helltaker Cinematic Letterbox Dialogue System v3.2 initialized.');

})();
