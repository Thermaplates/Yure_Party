//=============================================================================
// Yure_CustomIcon.js
//=============================================================================

/*:
 * @plugindesc [v2.2] Custom Skill & Item Icon System (Mendukung Sheet img/pictures/Skills/Skills.png 1500x1500, img/pictures/items/karso.png 900x1350, Basic.png, & Single Icon).
 * @author Antigravity
 *
 * @help
 * ============================================================================
 * YURE CUSTOM ICON SYSTEM (SPRITESHEET & SINGLE ICON)
 * ============================================================================
 * Plugin ini mendukung custom icon untuk Skill & Item:
 * 
 * 1. MENGGUNAKAN SPRITESHEET SKILL (img/pictures/Skills/Skills.png):
 *    Sheet berukuran 1500x1500px yang berisi 100 icon (grid 10x10, masing-masing 150x150px).
 *    Di kotak Note pada Skill/Item di Database, tulis:
 *    <Skill Icon: Index> atau <Skill Icon: Kolom, Baris>
 * 
 * 2. MENGGUNAKAN SPRITESHEET ITEM / KARSO (img/pictures/items/karso.png):
 *    Sheet berukuran 900x1350px yang berisi 150 icon (grid 10x15, masing-masing 90x90px).
 *    Di kotak Note pada Item/Weapon/Armor di Database, tulis:
 *    <Item Icon: Index> atau <Item Icon: Kolom, Baris>
 *    atau
 *    <Karso Icon: Index>
 * 
 *    Contoh:
 *    <Item Icon: 0>      -> Baris 0, Kolom 0 (Adrenaline syringe)
 *    <Item Icon: 1>      -> Baris 0, Kolom 1 (karso's powerful strength potion)
 *    <Item Icon: 14>     -> Baris 1, Kolom 4 (Semar mesem)
 *    <Item Icon: 16>     -> Baris 1, Kolom 6 (jenglot)
 *    <Item Icon: 20>     -> Baris 2, Kolom 0 (Common pomegranate akik)
 * 
 * 3. MENGGUNAKAN FILE GAMBAR TUNGGAL (img/pictures/Skills/ atau img/icons/):
 *    - Attack / Basic Attack Skill (ID 1) otomatis menggunakan img/pictures/Skills/Basic.png
 *    - Di kotak Note pada Skill/Item di Database, tulis:
 *      <Custom Icon: filename>
 * 
 * 4. MEKANIK KHUSUS ITEM:
 *    - Tag <adrenaline_syringe>: Pengurangan sanity otomatis meningkat x1.5 per penggunaan di hari yang sama.
 * ============================================================================
 */

(function() {
    'use strict';

    // Global Preload & Cache untuk Sheet Skills.png, karso.png, & Basic.png
    ImageManager.loadSkillSheet = function() {
        var bitmap = this.loadBitmap('img/pictures/Skills/', 'Skills', 0, true);
        if (!bitmap || (!bitmap.isReady() && bitmap._isLoading === false && bitmap._hasError)) {
            bitmap = this.loadBitmap('img/ui/skills/', 'skills', 0, true);
        }
        return bitmap;
    };

    ImageManager.loadItemSheet = function() {
        var bitmap = this.loadBitmap('img/pictures/items/', 'karso', 0, true);
        if (!bitmap || (!bitmap.isReady() && bitmap._isLoading === false && bitmap._hasError)) {
            bitmap = this.loadBitmap('img/pictures/items/', 'Items', 0, true);
        }
        return bitmap;
    };

    ImageManager.loadBasicSkillIcon = function() {
        var bitmap = this.loadBitmap('img/pictures/Skills/', 'Basic', 0, true);
        if (!bitmap || (!bitmap.isReady() && bitmap._isLoading === false && bitmap._hasError)) {
            bitmap = this.loadBitmap('img/icons/', 'Basic', 0, true);
        }
        return bitmap;
    };

    // Preload icon sheet & Basic icon saat game start
    var _Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
    Scene_Boot.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        ImageManager.loadSkillSheet();
        ImageManager.loadItemSheet();
        ImageManager.loadBasicSkillIcon();
    };

    // Parse notetags saat database selesai dimuat
    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;
        if (!this._customIconsLoaded) {
            this.processCustomIconNotetags($dataSkills);
            this.processCustomIconNotetags($dataItems);
            this.processCustomIconNotetags($dataWeapons);
            this.processCustomIconNotetags($dataArmors);
            this._customIconsLoaded = true;
        }
        return true;
    };

    DataManager.processCustomIconNotetags = function(group) {
        if (!group) return;
        for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            if (!obj) continue;

            // Attack biasa otomatis memakai Basic.png jika belum diset
            if (group === $dataSkills && (obj.id === 1 || (obj.name && obj.name.trim().toLowerCase() === 'attack'))) {
                obj.customIcon = 'Basic';
            }

            if (!obj.note) continue;
            var notedata = obj.note.split(/[\r\n]+/);
            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];

                // 1. Cek notetag <Skill Icon: X> atau <Skill Icon: col, row>
                if (line.match(/<(?:SKILL ICON):[ ]*(\d+)(?:[ ]*,[ ]*(\d+))?>/i)) {
                    var arg1 = parseInt(RegExp.$1, 10);
                    var arg2 = RegExp.$2 !== undefined && RegExp.$2 !== "" ? parseInt(RegExp.$2, 10) : null;
                    if (arg2 !== null) {
                        obj.skillIconIndex = (arg2 * 10) + arg1; // col, row
                    } else {
                        obj.skillIconIndex = arg1; // direct index 0..99
                    }
                }
                // 2. Cek notetag <Item Icon: X> atau <Item Icon: col, row> atau <Karso Icon: X>
                else if (line.match(/<(?:ITEM ICON|KARSO ICON):[ ]*(\d+)(?:[ ]*,[ ]*(\d+))?>/i)) {
                    var iArg1 = parseInt(RegExp.$1, 10);
                    var iArg2 = RegExp.$2 !== undefined && RegExp.$2 !== "" ? parseInt(RegExp.$2, 10) : null;
                    if (iArg2 !== null) {
                        obj.itemIconIndex = (iArg2 * 10) + iArg1; // col, row
                    } else {
                        obj.itemIconIndex = iArg1; // direct index 0..149
                    }
                    if (obj.skillIconIndex === undefined) {
                        obj.skillIconIndex = obj.itemIconIndex;
                    }
                }
                // 3. Cek notetag <Custom Icon: X> (Bisa angka index atau nama file gambar)
                else if (line.match(/<(?:CUSTOM ICON):[ ]*(.*)>/i)) {
                    var val = String(RegExp.$1).trim();
                    if (/^\d+$/.test(val)) {
                        obj.skillIconIndex = parseInt(val, 10);
                    } else {
                        obj.customIcon = val;
                        ImageManager.loadBitmap('img/pictures/Skills/', obj.customIcon, 0, true);
                        ImageManager.loadBitmap('img/icons/', obj.customIcon, 0, true);
                    }
                }
                // 4. Auto-detection item Karso syringe
                else if (line.match(/<karso[ _]syringe>/i) || (obj.name && obj.name.toLowerCase().includes('adrenaline syringe'))) {
                    if (obj.itemIconIndex === undefined) {
                        obj.itemIconIndex = 0;
                        if (obj.skillIconIndex === undefined) obj.skillIconIndex = 0;
                    }
                }
            }
        }
    };

    // Helper aman untuk menggambar bitmap ke context target tanpa dependensi blt/canvas rapuh
    function getDrawableImage(bmp) {
        if (!bmp) return null;
        if (bmp._image && bmp._image.width > 0 && bmp._image.height > 0) return bmp._image;
        if (bmp.__canvas && bmp.__canvas.width > 1 && bmp.__canvas.height > 1) return bmp.__canvas;
        if (bmp.__baseTexture && bmp.__baseTexture.source) {
            var src = bmp.__baseTexture.source;
            if (src && ((src.width && src.width > 1) || src.naturalWidth > 0)) return src;
        }
        try { if (bmp._canvas && bmp._canvas.width > 1) return bmp._canvas; } catch(e) {}
        return null;
    }

    function safeDrawBmp(targetBmp, sourceBmp, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (!targetBmp || !sourceBmp) return false;
        var img = getDrawableImage(sourceBmp);
        if (!img) {
            if (typeof targetBmp.blt === 'function') {
                try { targetBmp.blt(sourceBmp, sx, sy, sw, sh, dx, dy, dw, dh); return true; } catch(e) { return false; }
            }
            return false;
        }
        if (targetBmp.__context || (targetBmp._context && targetBmp.__canvas)) {
            try {
                var ctx = targetBmp.__context || targetBmp._context;
                ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
                if (typeof targetBmp._setDirty === 'function') targetBmp._setDirty();
                return true;
            } catch(e) {
                console.warn('[Yure_CustomIcon] safeDrawBmp error:', e);
            }
        }
        if (typeof targetBmp.blt === 'function') {
            try { targetBmp.blt(sourceBmp, sx, sy, sw, sh, dx, dy, dw, dh); return true; } catch(e) { return false; }
        }
        return false;
    }

    function registerLoadListener(srcBmp, onReadyCallback, contents, item, dx, dy, dw, dh) {
        if (!srcBmp || typeof srcBmp.addLoadListener !== 'function') return;
        var cb = function() {
            if (typeof onReadyCallback === 'function') {
                try { onReadyCallback(); } catch(e) {}
            } else if (contents) {
                try { ImageManager.drawSkillIcon(contents, item, dx, dy, dw, dh); } catch(e) {}
            }
            if (contents && typeof contents._setDirty === 'function') {
                contents._setDirty();
            }
        };
        srcBmp.addLoadListener(cb);
    }

    // Universal Helper untuk menggambar icon (Item Sheet 90x90 / Skill Sheet 150x150 / Custom Icon / Standard IconSet)
    ImageManager.drawSkillIcon = function(contents, item, dx, dy, dw, dh, onReadyCallback) {
        if (!contents || !item) return false;
        dw = dw || 32;
        dh = dh || dw;

        // 1. Basic Attack icon check (Basic.png)
        if (item.customIcon === 'Basic' || item.customIcon === 'basic' || (item.id === 1 && item.skillIconIndex === undefined && item.itemIconIndex === undefined)) {
            var basicBmp = ImageManager.loadBasicSkillIcon();
            if (basicBmp && basicBmp.isReady()) {
                var bw = basicBmp.width || 150;
                var bh = basicBmp.height || 150;
                return safeDrawBmp(contents, basicBmp, 0, 0, bw, bh, dx, dy, dw, dh);
            } else if (basicBmp) {
                registerLoadListener(basicBmp, onReadyCallback, contents, item, dx, dy, dw, dh);
                return true;
            }
        }

        // 2. Sheet Item Icon (karso.png - 90x90 per cell, 10 kolom)
        if (item.itemIconIndex !== undefined && item.itemIconIndex >= 0) {
            var itemSheet = ImageManager.loadItemSheet();
            if (itemSheet && itemSheet.isReady()) {
                var cellW = 90;
                var cellH = 90;
                var cols = 10;
                var col = item.itemIconIndex % cols;
                var row = Math.floor(item.itemIconIndex / cols);
                var sx = col * cellW;
                var sy = row * cellH;

                return safeDrawBmp(contents, itemSheet, sx, sy, cellW, cellH, dx, dy, dw, dh);
            } else if (itemSheet) {
                registerLoadListener(itemSheet, onReadyCallback, contents, item, dx, dy, dw, dh);
                return true;
            }
        }

        // 3. Sheet Skill Icon (Skills.png - 150x150 per cell, 10 kolom)
        if (item.skillIconIndex !== undefined && item.skillIconIndex >= 0) {
            var sheet = ImageManager.loadSkillSheet();
            if (sheet && sheet.isReady()) {
                var cellW = 150;
                var cellH = 150;
                var cols = 10;
                var col = item.skillIconIndex % cols;
                var row = Math.floor(item.skillIconIndex / cols);
                var sx = col * cellW;
                var sy = row * cellH;

                return safeDrawBmp(contents, sheet, sx, sy, cellW, cellH, dx, dy, dw, dh);
            } else if (sheet) {
                registerLoadListener(sheet, onReadyCallback, contents, item, dx, dy, dw, dh);
                return true;
            }
        }

        // 4. Custom Single Icon (img/pictures/Skills/<filename>.png or img/icons/<filename>.png)
        if (item.customIcon) {
            var bitmap = ImageManager.loadBitmap('img/pictures/Skills/', item.customIcon, 0, true);
            if (!bitmap || (!bitmap.isReady() && bitmap._isLoading === false && bitmap._hasError)) {
                bitmap = ImageManager.loadBitmap('img/icons/', item.customIcon, 0, true);
            }
            if (bitmap && bitmap.isReady()) {
                var mw = bitmap.width || 150;
                var mh = bitmap.height || 150;
                return safeDrawBmp(contents, bitmap, 0, 0, mw, mh, dx, dy, dw, dh);
            } else if (bitmap) {
                registerLoadListener(bitmap, onReadyCallback, contents, item, dx, dy, dw, dh);
                return true;
            }
        }

        // 5. Fallback Standard IconSet
        if (item.iconIndex > 0) {
            var iconSet = ImageManager.loadSystem('IconSet');
            if (iconSet && iconSet.isReady()) {
                var pw = Window_Base._iconWidth || 32;
                var ph = Window_Base._iconHeight || 32;
                var sx = (item.iconIndex % 16) * pw;
                var sy = Math.floor(item.iconIndex / 16) * ph;
                return safeDrawBmp(contents, iconSet, sx, sy, pw, ph, dx, dy, dw, dh);
            } else if (iconSet) {
                registerLoadListener(iconSet, onReadyCallback, contents, item, dx, dy, dw, dh);
                return true;
            }
        }

        return false;
    };

    // Alias drawItemName to draw custom/sheet icons in lists
    var _Window_Base_drawItemName = Window_Base.prototype.drawItemName;
    Window_Base.prototype.drawItemName = function(item, x, y, width) {
        width = width || 312;
        if (item) {
            var iconBoxWidth = Window_Base._iconWidth + 4;
            this.resetTextColor();
            
            if (item.itemIconIndex !== undefined || item.skillIconIndex !== undefined || item.customIcon || (item.id === 1 && !item.iconIndex)) {
                var dw = Window_Base._iconWidth;
                var dh = Window_Base._iconHeight;
                var dx = x + 2;
                var dy = y + 2;
                ImageManager.drawSkillIcon(this.contents, item, dx, dy, dw, dh, this.refresh ? this.refresh.bind(this) : null);
                this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
            } else {
                _Window_Base_drawItemName.call(this, item, x, y, width);
            }
        }
    };

})();
