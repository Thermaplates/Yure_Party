//=============================================================================
// Yure_BattleLog.js
//=============================================================================

/*:
 * @plugindesc [v2.0] Dynamic Animated Battle Log (Top-Right Slide Notification).
 * @author Yure Party Team
 *
 * @param ---Position & Size---
 * @default
 *
 * @param Log Pos X Offset
 * @parent ---Position & Size---
 * @text Posisi X Offset Kanan
 * @desc Jarak dari tepi kanan layar (pixel).
 * @default 24
 *
 * @param Log Pos Y
 * @parent ---Position & Size---
 * @text Posisi Y Awal
 * @desc Jarak dari tepi atas layar (pixel).
 * @default 20
 *
 * @param Log Width
 * @parent ---Position & Size---
 * @text Lebar Kotak Log
 * @desc Lebar setiap kartu notifikasi log.
 * @default 350
 *
 * @param Log Height
 * @parent ---Position & Size---
 * @text Tinggi Kotak Log
 * @desc Tinggi setiap kartu notifikasi log.
 * @default 48
 *
 * @param Log Spacing
 * @parent ---Position & Size---
 * @text Jarak Antar Log
 * @desc Jarak vertikal antar kartu saat menumpuk.
 * @default 8
 *
 * @param Max Visible Logs
 * @parent ---Position & Size---
 * @text Maksimal Log Aktif
 * @desc Jumlah maksimal kartu log yang tampil bersamaan di layar.
 * @default 4
 *
 * @param ---Animation & Duration---
 * @default
 *
 * @param Card Duration
 * @parent ---Animation & Duration---
 * @text Durasi Tampil (Frames)
 * @desc Berapa lama kartu tampil sebelum menghilang (60 frame = 1 detik).
 * @default 110
 *
 * @param Slide Speed
 * @parent ---Animation & Duration---
 * @text Kecepatan Animasi Slide
 * @desc Kelancaran lerp pergeseran kanan ke kiri (0.1 - 0.3).
 * @default 0.18
 *
 * @param ---Colors & Themes---
 * @default
 *
 * @param Ally Accent Color
 * @parent ---Colors & Themes---
 * @text Warna Aksen Karakter (Party)
 * @desc Warna garis aksen & nama karakter pemain (Hex / CSS).
 * @default #38bdf8
 *
 * @param Enemy Accent Color
 * @parent ---Colors & Themes---
 * @text Warna Aksen Musuh
 * @desc Warna garis aksen & nama musuh (Hex / CSS).
 * @default #f87171
 *
 * @param Special Accent Color
 * @parent ---Colors & Themes---
 * @text Warna Aksen Spesial / Critical
 * @desc Warna aksen untuk Critical, Counter, atau State (Hex / CSS).
 * @default #fbbf24
 *
 * @param Background Color
 * @parent ---Colors & Themes---
 * @text Warna Background Kartu
 * @desc Warna latar belakang kartu log (RGBA format).
 * @default rgba(15, 18, 28, 0.88)
 *
 * @param ---Filter Toggles---
 * @default
 *
 * @param Show Action Logs
 * @parent ---Filter Toggles---
 * @text Tampilkan Log Skill/Item
 * @type boolean
 * @desc Menampilkan notifikasi saat karakter/musuh memakai skill atau item.
 * @default true
 *
 * @param Show Critical Logs
 * @parent ---Filter Toggles---
 * @text Tampilkan Log Critical
 * @type boolean
 * @desc Menampilkan notifikasi saat serangan menghasilkan Critical Hit.
 * @default true
 *
 * @param Show State Logs
 * @parent ---Filter Toggles---
 * @text Tampilkan Log State/Debuff
 * @type boolean
 * @desc Menampilkan notifikasi saat state (efek status) bertambah.
 * @default true
 *
 * @help
 * ============================================================================
 * YURE DYNAMIC BATTLE LOG (TOP-RIGHT SLIDE NOTIFICATION)
 * ============================================================================
 * Merombak Battle Log standar RPG Maker MV menjadi sistem notifikasi modern:
 * 
 * FITUR:
 * 1. Terletak di Kanan Atas (Top-Right):
 *    - Bersih dari UI Status Party di kiri dan tidak menutupi karakter.
 *
 * 2. Animasi Halus & Dinamis:
 *    - Setiap log masuk dengan animasi meluncur (slide) dari kanan ke kiri.
 *    - Menumpuk secara dinamis (kartu baru menggeser kartu lama ke bawah).
 *    - Fade-out dan slide keluar secara mulus saat durasi habis.
 *
 * 3. Tampilan Visual Premium:
 *    - Desain Glassmorphism gelap dengan garis aksen warna sesuai pihak (Teman/Musuh).
 *    - Menampilkan Icon Skill/Item (termasuk ikon resolusi tinggi dari Yure_CustomIcon).
 *    - Nama Subjek dan Nama Aksi ditampilkan secara jelas dan rapi.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.Yure_BattleLog = true;

(function() {
    'use strict';

    var parameters   = PluginManager.parameters('Yure_BattleLog') || {};
    var pRightOffset = Number(parameters['Log Pos X Offset'] || 24);
    var pPosY        = Number(parameters['Log Pos Y'] || 20);
    var pWidth       = Number(parameters['Log Width'] || 350);
    var pHeight      = Number(parameters['Log Height'] || 48);
    var pSpacing     = Number(parameters['Log Spacing'] || 8);
    var pMaxCards    = Number(parameters['Max Visible Logs'] || 4);
    var pDuration    = Number(parameters['Card Duration'] || 110);
    var pSlideSpeed  = Number(parameters['Slide Speed'] || 0.18);
    var pAllyColor   = String(parameters['Ally Accent Color'] || '#38bdf8');
    var pEnemyColor  = String(parameters['Enemy Accent Color'] || '#f87171');
    var pSpecColor   = String(parameters['Special Accent Color'] || '#fbbf24');
    var pBgColor     = String(parameters['Background Color'] || 'rgba(15, 18, 28, 0.88)');
    var pShowAction  = String(parameters['Show Action Logs'] || 'true') === 'true';
    var pShowCrit    = String(parameters['Show Critical Logs'] || 'true') === 'true';
    var pShowState   = String(parameters['Show State Logs'] || 'true') === 'true';

    // Matikan window default bawaan agar tidak menggambar bar hitam di atas
    var _Window_BattleLog_initialize = Window_BattleLog.prototype.initialize;
    Window_BattleLog.prototype.initialize = function() {
        _Window_BattleLog_initialize.call(this);
        this.opacity = 0;
        this.contentsOpacity = 0;
        this.visible = false;
    };

    Window_BattleLog.prototype.maxLines = function() {
        return 0; // Jangan gambar teks baris bawaan
    };

    Window_BattleLog.prototype.drawLineText = function(index) {
        // Abaikan render teks bawaan
    };

    // ============================================================================
    // Sprite_YureBattleLogCard (Satu Kartu Notifikasi Dinamis)
    // ============================================================================
    function Sprite_YureBattleLogCard() {
        this.initialize.apply(this, arguments);
    }
    Sprite_YureBattleLogCard.prototype = Object.create(Sprite.prototype);
    Sprite_YureBattleLogCard.prototype.constructor = Sprite_YureBattleLogCard;

    Sprite_YureBattleLogCard.prototype.initialize = function(data) {
        Sprite.prototype.initialize.call(this);
        this._data = data; // { subjectName, actionName, iconIndex, customIcon, accentColor, iconColor }
        this._duration = pDuration;
        this._targetX = Graphics.boxWidth - pWidth - pRightOffset;
        this._targetY = pPosY;
        
        // Spawn posisi awal: Di luar layar sebelah kanan (+ 120px)
        this.x = Graphics.boxWidth + 60;
        this.y = pPosY;
        this.opacity = 0;
        this._isFinished = false;

        this.createCardBitmap();
    };

    Sprite_YureBattleLogCard.prototype.setTargetY = function(y) {
        this._targetY = y;
    };

    Sprite_YureBattleLogCard.prototype.createCardBitmap = function() {
        var w = pWidth;
        var h = pHeight;
        this.bitmap = new Bitmap(w, h);
        var ctx = this.bitmap.context;

        // 1. Background Card (Rounded / Angled Glass Pill)
        ctx.save();
        ctx.fillStyle = pBgColor;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;

        // Gambar rounded rect
        var r = 6;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r);
        ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Left Accent Bar (Garis warna indikator di kiri)
        var barW = 5;
        ctx.fillStyle = this._data.accentColor || pAllyColor;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(barW, 0);
        ctx.lineTo(barW, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 3. Draw Icon (34x34)
        var iconSize = 34;
        var iconX = 14;
        var iconY = Math.floor((h - iconSize) / 2);
        var textStartX = iconX + iconSize + 10;
        var hasIcon = false;

        if (this._data.item && typeof ImageManager.drawSkillIcon === 'function') {
            // Universal custom icon support: Skills.png (150x150 grid), Basic.png, Custom Icon, and IconSet fallback
            var drawn = ImageManager.drawSkillIcon(this.bitmap, this._data.item, iconX, iconY, iconSize, iconSize, function() {
                this.createCardBitmap();
            }.bind(this));
            if (drawn) {
                hasIcon = true;
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 1;
                ctx.strokeRect(iconX, iconY, iconSize, iconSize);
                ctx.restore();
            }
        }

        if (!hasIcon) {
            if (this._data.customIcon) {
                var cBitmap = ImageManager.loadBitmap('img/pictures/Skills/', this._data.customIcon, 0, true);
                if (!cBitmap || (!cBitmap.isReady() && cBitmap._isLoading === false && cBitmap._hasError)) {
                    cBitmap = ImageManager.loadBitmap('img/icons/', this._data.customIcon, 0, true);
                }
                if (cBitmap && cBitmap.isReady()) {
                    this.bitmap.blt(cBitmap, 0, 0, cBitmap.width, cBitmap.height, iconX, iconY, iconSize, iconSize);
                    hasIcon = true;
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(iconX, iconY, iconSize, iconSize);
                    ctx.restore();
                } else if (cBitmap) {
                    cBitmap.addLoadListener(function() {
                        this.createCardBitmap();
                    }.bind(this));
                }
            } else if (this._data.iconIndex > 0) {
                var iconSet = ImageManager.loadSystem('IconSet');
                if (iconSet.isReady()) {
                    var pw = Window_Base._iconWidth || 32;
                    var ph = Window_Base._iconHeight || 32;
                    var sx = (this._data.iconIndex % 16) * pw;
                    var sy = Math.floor(this._data.iconIndex / 16) * ph;
                    this.bitmap.blt(iconSet, sx, sy, pw, ph, iconX, iconY, iconSize, iconSize);
                    hasIcon = true;
                } else {
                    iconSet.addLoadListener(function() {
                        this.createCardBitmap();
                    }.bind(this));
                }
            }
        }

        if (!hasIcon) {
            textStartX = 16; // Tanpa icon, teks lebih ke kiri
        }

        // 4. Draw Texts
        var maxTextW = w - textStartX - 10;
        
        // Subject Name (Atas)
        this.bitmap.fontSize = 15;
        this.bitmap.textColor = this._data.accentColor || pAllyColor;
        var sName = this._data.subjectName || '';
        this.bitmap.drawText(sName, textStartX, 4, maxTextW, 20, 'left');

        // Action Name (Bawah)
        this.bitmap.fontSize = 17;
        this.bitmap.textColor = '#ffffff';
        var aName = this._data.actionName || '';
        this.bitmap.drawText(aName, textStartX, 22, maxTextW, 22, 'left');
    };

    Sprite_YureBattleLogCard.prototype.update = function() {
        Sprite.prototype.update.call(this);

        // Slide X interpolation (dari kanan ke kiri)
        this.x += (this._targetX - this.x) * pSlideSpeed;
        
        // Smooth vertical Y adjustment
        this.y += (this._targetY - this.y) * 0.2;

        // Fade in
        if (this._duration > 20) {
            if (this.opacity < 255) {
                this.opacity += (255 - this.opacity) * 0.25;
            }
        } else {
            // Fade out saat durasi hampir habis
            this.opacity -= 15;
            this.x -= 2; // Geser sedikit ke kiri saat keluar
            if (this.opacity <= 0) {
                this._isFinished = true;
            }
        }

        this._duration--;
        if (this._duration <= 0) {
            this._isFinished = true;
        }
    };

    Sprite_YureBattleLogCard.prototype.isFinished = function() {
        return this._isFinished;
    };

    // ============================================================================
    // Sprite_YureBattleLogContainer (Manager Semua Kartu Log di Layar)
    // ============================================================================
    function Sprite_YureBattleLogContainer() {
        this.initialize.apply(this, arguments);
    }
    Sprite_YureBattleLogContainer.prototype = Object.create(Sprite.prototype);
    Sprite_YureBattleLogContainer.prototype.constructor = Sprite_YureBattleLogContainer;

    Sprite_YureBattleLogContainer.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._cards = [];
    };

    Sprite_YureBattleLogContainer.prototype.addLog = function(data) {
        // Buat kartu baru
        var card = new Sprite_YureBattleLogCard(data);
        this._cards.unshift(card); // Taruh di urutan teratas
        this.addChild(card);

        // Jika melebihi batas maksimal, langsung percepat fade out kartu paling bawah
        while (this._cards.length > pMaxCards) {
            var oldCard = this._cards.pop();
            oldCard._duration = Math.min(oldCard._duration, 10);
        }

        this.updateCardPositions();
    };

    Sprite_YureBattleLogContainer.prototype.updateCardPositions = function() {
        for (var i = 0; i < this._cards.length; i++) {
            var targetY = pPosY + (i * (pHeight + pSpacing));
            this._cards[i].setTargetY(targetY);
        }
    };

    Sprite_YureBattleLogContainer.prototype.update = function() {
        Sprite.prototype.update.call(this);

        for (var i = this._cards.length - 1; i >= 0; i--) {
            var card = this._cards[i];
            if (card.isFinished()) {
                this.removeChild(card);
                this._cards.splice(i, 1);
                this.updateCardPositions();
            }
        }
    };

    Sprite_YureBattleLogContainer.prototype.clearAll = function() {
        for (var i = 0; i < this._cards.length; i++) {
            this.removeChild(this._cards[i]);
        }
        this._cards = [];
    };

    // ============================================================================
    // Hook ke Scene_Battle
    // ============================================================================
    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);

        this._yureBattleLogContainer = new Sprite_YureBattleLogContainer();
        this.addChild(this._yureBattleLogContainer);

        if (this._logWindow) {
            this._logWindow._yureContainer = this._yureBattleLogContainer;
        }
    };

    // ============================================================================
    // Hook Log Events di Window_BattleLog
    // ============================================================================
    
    // 1. Action Notification (Skill & Item)
    var _Window_BattleLog_displayAction = Window_BattleLog.prototype.displayAction;
    Window_BattleLog.prototype.displayAction = function(subject, item) {
        _Window_BattleLog_displayAction.call(this, subject, item);

        if (!pShowAction || !item || !subject) return;
        if (!this._yureContainer) return;

        var isActor = subject.isActor();
        var sName = subject.name();
        var aName = item.name;
        var icon = item.iconIndex || 0;
        var customIcon = item.customIcon || null;
        var color = isActor ? pAllyColor : pEnemyColor;

        this._yureContainer.addLog({
            item: item,
            subjectName: sName,
            actionName: aName,
            iconIndex: icon,
            customIcon: customIcon,
            accentColor: color
        });
    };

    // 2. Critical Hit Notification
    var _Window_BattleLog_displayCritical = Window_BattleLog.prototype.displayCritical;
    Window_BattleLog.prototype.displayCritical = function(target) {
        _Window_BattleLog_displayCritical.call(this, target);

        if (!pShowCrit || !target) return;
        if (!this._yureContainer) return;

        // Ambil item (skill) yang sedang menyebabkan critical dari BattleManager
        var currentItem = null;
        if (BattleManager._action && typeof BattleManager._action.item === 'function') {
            currentItem = BattleManager._action.item();
        }
        // Fallback: cek subject dari BattleManager
        if (!currentItem && BattleManager._subject) {
            var action = BattleManager._subject.currentAction ? BattleManager._subject.currentAction() : null;
            if (action && typeof action.item === 'function') currentItem = action.item();
        }

        var data = {
            subjectName: target.name(),
            actionName: '\u26a1 CRITICAL HIT!',
            accentColor: pSpecColor
        };

        if (currentItem) {
            // Pakai icon dari skill yang sama seperti displayAction
            data.item       = currentItem;
            data.iconIndex  = currentItem.iconIndex || 0;
            data.customIcon = currentItem.customIcon || null;
            // Jika skill musuh tidak punya icon apapun, fallback ke icon \u26a1 lightning
            if (!data.customIcon
                && data.iconIndex === 0
                && currentItem.skillIconIndex === undefined
                && currentItem.itemIconIndex === undefined) {
                data.iconIndex = 76; // Lightning / Flash icon di IconSet standar MV
            }
        } else {
            // Fallback: icon lightning
            data.iconIndex  = 76;
            data.customIcon = null;
        }

        this._yureContainer.addLog(data);
    };

    // 3. State Added Notification
    var _Window_BattleLog_displayAddedStates = Window_BattleLog.prototype.displayAddedStates;
    Window_BattleLog.prototype.displayAddedStates = function(target) {
        _Window_BattleLog_displayAddedStates.call(this, target);

        if (!pShowState || !target) return;
        if (!this._yureContainer) return;

        var result = target.result();
        if (result && result.addedStateObjects) {
            var states = result.addedStateObjects();
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                if (state && state.name && state.iconIndex > 0) {
                    this._yureContainer.addLog({
                        subjectName: target.name(),
                        actionName: "+ " + state.name,
                        iconIndex: state.iconIndex,
                        customIcon: state.customIcon || null,
                        accentColor: '#c084fc' // Purple
                    });
                }
            }
        }
    };

    // 4. Counter & Reflection Notifications
    var _Window_BattleLog_displayCounter = Window_BattleLog.prototype.displayCounter;
    Window_BattleLog.prototype.displayCounter = function(target) {
        _Window_BattleLog_displayCounter.call(this, target);
        if (!this._yureContainer || !target) return;
        this._yureContainer.addLog({
            subjectName: target.name(),
            actionName: "Counter Attack!",
            iconIndex: 16,
            customIcon: null,
            accentColor: pSpecColor
        });
    };

    var _Window_BattleLog_displayReflection = Window_BattleLog.prototype.displayReflection;
    Window_BattleLog.prototype.displayReflection = function(target) {
        _Window_BattleLog_displayReflection.call(this, target);
        if (!this._yureContainer || !target) return;
        this._yureContainer.addLog({
            subjectName: target.name(),
            actionName: "Magic Reflected!",
            iconIndex: 42,
            customIcon: null,
            accentColor: pSpecColor
        });
    };

    // Bersihkan kartu saat battle selesai
    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _BattleManager_endBattle.call(this, result);
        if (SceneManager._scene && SceneManager._scene._yureBattleLogContainer) {
            SceneManager._scene._yureBattleLogContainer.clearAll();
        }
    };

})();
