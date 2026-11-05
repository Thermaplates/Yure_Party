//=============================================================================
// Yure_DigitalTimeHUD.js
//=============================================================================

/*:
 * @plugindesc [v2.6] HUD Jam Digital 7-Segment LCD (Pink, Turquoise Green Date, & White Year) dengan asset visual HD img/pictures/UI/Clock.png.
 * @author Antigravity
 *
 * @param HUD X
 * @desc Posisi X dari HUD Jam Digital. (Jika kosong, otomatis diletakkan di kanan atas)
 * @default 
 *
 * @param HUD Y
 * @desc Posisi Y dari HUD Jam Digital.
 * @default 16
 *
 * @param Frame Scale
 * @desc Skala pembesaran asset visual Clock.png (Default: 1.48).
 * @default 1.48
 *
 * @param Digit Width
 * @desc Lebar masing-masing digit 7-segment jam (pixel).
 * @default 18
 *
 * @param Digit Height
 * @desc Tinggi masing-masing digit 7-segment jam (pixel).
 * @default 32
 *
 * @param Time Color
 * @desc Warna aktif digit jam digital 7-segment (Hex / Youthful Pink).
 * @default #ff66c4
 *
 * @param Inactive Segment Color
 * @desc Warna segmen mati LCD di latar belakang (Hex / RGBA).
 * @default rgba(70, 20, 50, 0.45)
 *
 * @param Date Color
 * @desc Warna teks tanggal dan hari (Hex / Hijau Turquoise).
 * @default #2dd4bf
 *
 * @param Sub Color
 * @desc Warna teks musim/tahun (Hex / Putih).
 * @default #ffffff
 *
 * @help
 * ============================================================================
 * YURE DIGITAL TIME HUD (TURQUOISE DATE & WHITE YEAR EDITION)
 * ============================================================================
 * Plugin ini menampilkan HUD Jam Digital di pojok kanan atas:
 * 1. Angka jam: 7-Segment Digital Clock menyala warna Youthful Pink (#ff66c4).
 * 2. Hari & Tanggal: Digital Font warna Hijau Turquoise (#2dd4bf).
 * 3. Musim & Tahun: Digital Font warna Putih (#ffffff).
 * 4. Menggunakan asset visual HD: "img/pictures/UI/Clock.png" (150x150).
 * 5. Terintegrasi penuh dengan MOG_TimeSystem.
 * 6. Mendukung tombol TAB untuk sembunyikan/munculkan HUD (Yure_ToggleHUD).
 * 7. Otomatis disembunyikan saat kotak dialog percakapan/pesan aktif.
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_DigitalTimeHUD');
    var pX = String(parameters['HUD X'] || '');
    var pY = Number(parameters['HUD Y'] || 16);
    var pScale = Number(parameters['Frame Scale'] || 1.48);
    var pDigitW = Number(parameters['Digit Width'] || 18);
    var pDigitH = Number(parameters['Digit Height'] || 32);
    var pTimeColor = String(parameters['Time Color'] || '#ff66c4');
    var pInactiveColor = String(parameters['Inactive Segment Color'] || 'rgba(70, 20, 50, 0.45)');
    var pDateColor = String(parameters['Date Color'] || '#2dd4bf');
    var pSubColor = String(parameters['Sub Color'] || '#ffffff');

    // Mencegah MOG_TimeSystem menggambar Window teks bawaan di tengah layar
    var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        if (this._time_status_window) {
            this._time_status_window.visible = false;
            this._time_status_window.update = function() {};
        }
    };

    //=============================================================================
    // Sprite_YureDigitalClock
    //=============================================================================
    function Sprite_YureDigitalClock() {
        this.initialize.apply(this, arguments);
    }
    
    Sprite_YureDigitalClock.prototype = Object.create(Sprite.prototype);
    Sprite_YureDigitalClock.prototype.constructor = Sprite_YureDigitalClock;
    
    Sprite_YureDigitalClock.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._lastTimeStr = "";
        
        // Dimensi frame Clock.png HD 150x150 (crop region aktif 124 x 86 px)
        this._srcX = 13;
        this._srcY = 37;
        this._srcW = 124;
        this._srcH = 86;

        // Dimensi render target
        this._frameW = Math.round(this._srcW * pScale); // ~184px
        this._frameH = Math.round(this._srcH * pScale); // ~127px
        
        // Total canvas width/height
        this._hudW = this._frameW + 20;
        this._hudH = this._frameH + 16;
        
        if (pX !== '' && !isNaN(Number(pX))) {
            this.x = Number(pX);
        } else {
            this.x = Graphics.boxWidth - this._hudW - 16; // Posisi pojok kanan atas
        }
        this.y = pY;
        
        // Buat bitmap terlebih dahulu sebelum listener bitmap gambar dipasang
        this.createBitmap();

        // Load asset Clock.png dari img/pictures/UI/Clock.png
        this._clockBitmap = ImageManager.loadPicture('UI/Clock');
        this._clockBitmap.addLoadListener(function() {
            this._lastTimeStr = "";
            this.updateClock();
        }.bind(this));
        
        this.update();
    };
    
    Sprite_YureDigitalClock.prototype.createBitmap = function() {
        this.bitmap = new Bitmap(this._hudW, this._hudH);
    };
    
    Sprite_YureDigitalClock.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updateVisibility();
        if (this.visible) {
            this.updateClock();
        }
    };
    
    Sprite_YureDigitalClock.prototype.updateVisibility = function() {
        // Sembunyikan otomatis di Map 5 (Mansion Tutorial) atau jika ada tag <hide_clock>
        if (typeof $gameMap !== 'undefined' && ($gameMap.mapId() === 5 || ($dataMap && $dataMap.note && $dataMap.note.includes('<hide_clock>')))) {
            this.visible = false;
            return;
        }
        var isVisible = true;
        if (typeof $gameSystem !== 'undefined') {
            if ($gameSystem._time_window_visible !== undefined && !$gameSystem._time_window_visible) {
                isVisible = false;
            }
            // Mendukung Yure_ToggleHUD (Tombol TAB untuk hide/show HUD)
            if ($gameSystem._yureHudHidden !== undefined && $gameSystem._yureHudHidden) {
                isVisible = false;
            }
        }
        
        // Sembunyikan saat kotak dialog teks sedang aktif
        if (typeof $gameMessage !== 'undefined' && $gameMessage.isBusy()) {
            isVisible = false;
        }

        this.visible = isVisible;
    };
    
    Sprite_YureDigitalClock.prototype.updateClock = function() {
        var hourStr = "12";
        var minStr = "00";
        var apm = "";
        var dayStr = "";
        var yearStr = "";
        
        if (Imported.MOG_TimeSystem && typeof $gameSystem.hour === 'function') {
            var hour = $gameSystem.hour();
            var minute = $gameSystem.minute();
            
            hourStr = hour.padZero(2);
            minStr = minute.padZero(2);
            
            // Format AM/PM jika mode PM aktif
            var pmMode = (typeof Moghunter !== 'undefined' && String(Moghunter.display_pm_mode) === "true");
            if (pmMode) {
                apm = hour >= 12 ? "PM" : "AM";
                var pmH = $gameSystem.hour_pm();
                if (typeof pmH === 'number') hourStr = pmH.padZero(2);
                else hourStr = String(pmH).padZero(2);
            }
            
            var m_day = $gameSystem.day() || 1;
            var m_month = $gameSystem.month() || 1;
            // Format digital ringkas huruf kapital (misal: THU 01/01)
            var wName = ($gameSystem.day_week_name() || "DAY").substring(0, 3).toUpperCase();
            dayStr = wName + " " + m_day.padZero(2) + "/" + m_month.padZero(2);
            
            var sName = ($gameSystem.season_name() || "SEASON").toUpperCase();
            yearStr = sName + " Y" + $gameSystem.year();
        } else {
            hourStr = "--";
            minStr = "--";
        }
        
        var fullStr = hourStr + ":" + minStr + "|" + apm + "|" + dayStr + "|" + yearStr;
        if (this._lastTimeStr !== fullStr) {
            this._lastTimeStr = fullStr;
            this.redrawClock(hourStr, minStr, apm, dayStr, yearStr);
        }
    };

    // ============================================================================
    // 7-SEGMENT DIGITAL DISPLAY RENDERER
    // ============================================================================
    var SEGMENT_MAP = {
        '0': [1, 1, 1, 1, 1, 1, 0],
        '1': [0, 1, 1, 0, 0, 0, 0],
        '2': [1, 1, 0, 1, 1, 0, 1],
        '3': [1, 1, 1, 1, 0, 0, 1],
        '4': [0, 1, 1, 0, 0, 1, 1],
        '5': [1, 0, 1, 1, 0, 1, 1],
        '6': [1, 0, 1, 1, 1, 1, 1],
        '7': [1, 1, 1, 0, 0, 0, 0],
        '8': [1, 1, 1, 1, 1, 1, 1],
        '9': [1, 1, 1, 1, 0, 1, 1],
        '-': [0, 0, 0, 0, 0, 0, 1],
        ' ': [0, 0, 0, 0, 0, 0, 0]
    };

    Sprite_YureDigitalClock.prototype.draw7SegmentDigit = function(ctx, char, x, y, w, h, t) {
        var segs = SEGMENT_MAP[char] || SEGMENT_MAP[' '];
        var halfH = Math.floor(h / 2);
        var halfT = Math.floor(t / 2);
        var gap = 1.2;

        var segmentShapes = [
            // a: top horizontal
            function(active) {
                ctx.fillStyle = active ? pTimeColor : pInactiveColor;
                ctx.fillRect(x + t + gap, y, w - (2 * t) - (2 * gap), t);
            },
            // b: top-right vertical
            function(active) {
                ctx.fillStyle = active ? pTimeColor : pInactiveColor;
                ctx.fillRect(x + w - t, y + t + gap, t, halfH - t - (2 * gap));
            },
            // c: bottom-right vertical
            function(active) {
                ctx.fillStyle = active ? pTimeColor : pInactiveColor;
                ctx.fillRect(x + w - t, y + halfH + gap, t, halfH - t - (2 * gap));
            },
            // d: bottom horizontal
            function(active) {
                ctx.fillStyle = active ? pTimeColor : pInactiveColor;
                ctx.fillRect(x + t + gap, y + h - t, w - (2 * t) - (2 * gap), t);
            },
            // e: bottom-left vertical
            function(active) {
                ctx.fillStyle = active ? pTimeColor : pInactiveColor;
                ctx.fillRect(x, y + halfH + gap, t, halfH - t - (2 * gap));
            },
            // f: top-left vertical
            function(active) {
                ctx.fillStyle = active ? pTimeColor : pInactiveColor;
                ctx.fillRect(x, y + t + gap, t, halfH - t - (2 * gap));
            },
            // g: middle horizontal
            function(active) {
                ctx.fillStyle = active ? pTimeColor : pInactiveColor;
                ctx.fillRect(x + t + gap, y + halfH - halfT, w - (2 * t) - (2 * gap), t);
            }
        ];

        // 1. Gambar segmen tidak aktif (Ghost LCD background)
        for (var i = 0; i < 7; i++) {
            segmentShapes[i](false);
        }

        // 2. Gambar segmen aktif menyala (Youthful Pink Glow)
        ctx.save();
        ctx.shadowColor = pTimeColor;
        ctx.shadowBlur = 5;
        for (var j = 0; j < 7; j++) {
            if (segs[j]) {
                segmentShapes[j](true);
            }
        }
        ctx.restore();
    };

    Sprite_YureDigitalClock.prototype.redrawClock = function(hourStr, minStr, apm, dayStr, yearStr) {
        if (!this.bitmap) return;
        this.bitmap.clear();
        
        var fx = 0;
        var fy = 0;
        var fw = this._frameW;
        var fh = this._frameH;

        // 1. Render Frame Visual "Clock.png" HD
        if (this._clockBitmap && this._clockBitmap.isReady()) {
            this.bitmap.blt(this._clockBitmap, this._srcX, this._srcY, this._srcW, this._srcH, fx, fy, fw, fh);
        }

        var ctx = this.bitmap._context;

        // 2. Render 7-Segment Digital Clock (Jam & Menit - Youthful Pink)
        var dw = pDigitW;
        var dh = pDigitH;
        var dt = Math.max(3, Math.round(dw * 0.18));
        var digitSpacing = 5;
        var colonW = 8;
        var apmW = apm ? 24 : 0;

        var totalClockW = (dw * 4) + (digitSpacing * 3) + colonW + (apm ? (digitSpacing + apmW) : 0);
        var screenCenterX = fx + Math.round(fw / 2);
        var clockStartX = screenCenterX - Math.round(totalClockW / 2);
        var clockY = fy + Math.round(14 * (pScale / 1.48));

        var curX = clockStartX;

        // Digit Jam (H1, H2)
        this.draw7SegmentDigit(ctx, hourStr.charAt(0) || '0', curX, clockY, dw, dh, dt);
        curX += dw + digitSpacing;
        this.draw7SegmentDigit(ctx, hourStr.charAt(1) || '0', curX, clockY, dw, dh, dt);
        curX += dw + digitSpacing;

        // Titik Dua ":"
        ctx.save();
        ctx.fillStyle = pTimeColor;
        ctx.shadowColor = pTimeColor;
        ctx.shadowBlur = 5;
        var dotSize = Math.max(3, dt);
        var dotX = curX + Math.round((colonW - dotSize) / 2);
        ctx.fillRect(dotX, clockY + Math.round(dh * 0.28), dotSize, dotSize);
        ctx.fillRect(dotX, clockY + Math.round(dh * 0.68), dotSize, dotSize);
        ctx.restore();
        curX += colonW + digitSpacing;

        // Digit Menit (M1, M2)
        this.draw7SegmentDigit(ctx, minStr.charAt(0) || '0', curX, clockY, dw, dh, dt);
        curX += dw + digitSpacing;
        this.draw7SegmentDigit(ctx, minStr.charAt(1) || '0', curX, clockY, dw, dh, dt);
        curX += dw + (apm ? digitSpacing : 0);

        // AM / PM Indicator (Digital Monospace Font)
        if (apm) {
            this.bitmap.fontFace = '"Consolas", "Courier New", monospace, GameFont';
            this.bitmap.fontBold = true;
            this.bitmap.fontSize = 12;
            this.bitmap.textColor = pTimeColor;
            this.bitmap.outlineColor = 'rgba(25, 5, 20, 0.95)';
            this.bitmap.outlineWidth = 3;
            this.bitmap.drawText(apm, curX, clockY - 2, apmW, 14, 'left');
        }

        // 3. Render Info Tanggal & Hari (Warna Hijau Turquoise)
        var screenAreaW = Math.round(fw * 0.90);
        var screenAreaX = fx + Math.round((fw - screenAreaW) / 2);

        this.bitmap.fontFace = '"Consolas", "Courier New", monospace, GameFont';
        this.bitmap.fontBold = true;
        this.bitmap.outlineColor = 'rgba(5, 20, 15, 0.95)';
        this.bitmap.outlineWidth = 3;

        if (dayStr !== "") {
            this.bitmap.fontSize = 14;
            this.bitmap.textColor = pDateColor; // Hijau Turquoise (#2dd4bf)
            var dayY = clockY + dh + 6;
            this.bitmap.drawText(dayStr, screenAreaX, dayY, screenAreaW, 16, 'center');

            // 4. Render Info Musim / Tahun (Warna Putih Bersih)
            if (yearStr !== "") {
                this.bitmap.fontSize = 12;
                this.bitmap.textColor = pSubColor; // Putih (#ffffff)
                var yearY = dayY + 16;
                this.bitmap.drawText(yearStr, screenAreaX, yearY, screenAreaW, 14, 'center');
            }
        }
    };

    //=============================================================================
    // Scene_Map
    //=============================================================================
    var _Scene_Map_createSpriteset = Scene_Map.prototype.createSpriteset;
    Scene_Map.prototype.createSpriteset = function() {
        _Scene_Map_createSpriteset.call(this);
        this.createYureDigitalClock();
    };
    
    Scene_Map.prototype.createYureDigitalClock = function() {
        this._yureDigitalClock = new Sprite_YureDigitalClock();
        this._yureDigitalClock.mz = 130;
        
        if (!this._hudField) {
            if (typeof this.createHudField === 'function') {
                this.createHudField();
            } else {
                this._hudField = new Sprite();
                this._hudField.z = 10;
                this.addChild(this._hudField);
            }
        }
        this._hudField.addChild(this._yureDigitalClock);
    };

})();
