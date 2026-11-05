//=============================================================================
// Custom_MyGallery.js
//=============================================================================
/*:
 * @plugindesc Sistem Gallery Kustom buatan sendiri.
 * @author Custom Build
 *
 * @help
 * Simpan file CG di img/pictures dengan format CG_Nomor.png atau CG_Nomor.jpg.
 * Contoh: CG_1.png, CG_2.jpg, CG_10.png.
 */

(function() {

    var CUSTOM_GALLERY_FOLDER = 'pictures';
    var CUSTOM_GALLERY_PATTERN = /^CG_(\d+)\.(png|jpe?g)$/i;
    var CUSTOM_GALLERY_LIST_WIDTH = 320;
    var CUSTOM_GALLERY_MARGIN = 24;
    var CUSTOM_GALLERY_ZOOM_MIN = 0.2;
    var CUSTOM_GALLERY_ZOOM_MAX = 3.0;
    var CUSTOM_GALLERY_ZOOM_STEP = 0.1;

    var CustomGalleryManager = window.CustomGalleryManager || {};

    CustomGalleryManager.scan = function() {
        if (this._cache) {return this._cache};
        this._cache = this.readGalleryFiles();
        return this._cache;
    };

    CustomGalleryManager.readGalleryFiles = function() {
        if (!Utils.isNwjs()) {return []};
        var fs = null;
        var path = null;
        try {
            fs = require('fs');
            path = require('path');
        } catch (e) {
            return [];
        }
        var galleryDir = path.join(process.cwd(), 'img', CUSTOM_GALLERY_FOLDER);
        if (!fs.existsSync(galleryDir)) {return []};
        var files = fs.readdirSync(galleryDir);
        var byIndex = {};
        for (var i = 0; i < files.length; i++) {
            var filename = files[i];
            var match = filename.match(CUSTOM_GALLERY_PATTERN);
            if (!match) {continue};
            var index = Number(match[1]);
            var extension = String(match[2] || '').toLowerCase();
            var baseName = filename.replace(/\.[^\.]+$/, '');
            var candidate = {
                index: index,
                file: baseName,
                extension: extension,
                name: 'CG ' + index
            };
            var current = byIndex[index];
            if (!current || (current.extension !== 'png' && candidate.extension === 'png')) {
                byIndex[index] = candidate;
            }
        }

        var keys = Object.keys(byIndex).map(function(key) {
            return Number(key);
        }).sort(function(a, b) {
            return a - b;
        });

        var result = [];
        for (var j = 0; j < keys.length; j++) {
            result.push(byIndex[keys[j]]);
        }
        return result;
    };

    // ========================================================================
    // WINDOW
    // ========================================================================
    function Window_GalleryList() {
        this.initialize.apply(this, arguments);
    }

    Window_GalleryList.prototype = Object.create(Window_Command.prototype);
    Window_GalleryList.prototype.constructor = Window_GalleryList;

    Window_GalleryList.prototype.initialize = function(x, y) {
        Window_Command.prototype.initialize.call(this, x, y);
    };

    Window_GalleryList.prototype.windowWidth = function() {
        return CUSTOM_GALLERY_LIST_WIDTH;
    };

    Window_GalleryList.prototype.windowHeight = function() {
        return Graphics.boxHeight - (CUSTOM_GALLERY_MARGIN * 2);
    };

    Window_GalleryList.prototype.numVisibleRows = function() {
        return Math.max(6, Math.floor((this.windowHeight() - this.standardPadding() * 2) / this.lineHeight()));
    };

    Window_GalleryList.prototype.makeCommandList = function() {
        var galleryItems = CustomGalleryManager.scan();
        this._galleryItems = galleryItems;
        if (!galleryItems.length) {
            this.addCommand('Tidak ada CG', 'empty', false, null);
        } else {
            for (var i = 0; i < galleryItems.length; i++) {
                this.addCommand(galleryItems[i].name, 'gallery_item', true, galleryItems[i]);
            }
        }
        this.addCommand('Kembali', 'cancel');
    };

    // ========================================================================
    // SCENE
    // ========================================================================
    function Scene_MyGallery() {
        this.initialize.apply(this, arguments);
    }

    Scene_MyGallery.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_MyGallery.prototype.constructor = Scene_MyGallery;

    Scene_MyGallery.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_MyGallery.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this._galleryZoom = 1.0;
        this._currentGalleryItem = null;
        this._galleryViewMode = false;
        this._galleryBitmapKey = '';
        this.createGalleryWindow();
        this.createGalleryPreviewWindow();
        this.refreshGallerySelection();
    };

    Scene_MyGallery.prototype.createGalleryWindow = function() {
        this._galleryWindow = new Window_GalleryList(0, 0);
        this._galleryWindow.x = CUSTOM_GALLERY_MARGIN;
        this._galleryWindow.y = CUSTOM_GALLERY_MARGIN;
        this._galleryWindow.setHandler('ok', this.onGalleryOk.bind(this));
        this._galleryWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._galleryWindow);
        this._galleryWindow.select(0);
    };

    Scene_MyGallery.prototype.createGalleryPreviewWindow = function() {
        var previewX = this._galleryWindow.width + (CUSTOM_GALLERY_MARGIN * 2);
        var previewY = CUSTOM_GALLERY_MARGIN;
        var previewWidth = Graphics.boxWidth - previewX - CUSTOM_GALLERY_MARGIN;
        var previewHeight = Graphics.boxHeight - (CUSTOM_GALLERY_MARGIN * 2);
        if (previewWidth < 320) {previewWidth = 320};

        this._galleryPreviewWindow = new Window_Base(previewX, previewY, previewWidth, previewHeight);
        this._galleryPreviewWindow.opacity = 255;
        this._galleryPreviewWindow.contentsOpacity = 255;

        this._galleryPreviewSprite = new Sprite();
        this._galleryPreviewSprite.anchor.x = 0.5;
        this._galleryPreviewSprite.anchor.y = 0.5;
        this._galleryPreviewWindow.addChild(this._galleryPreviewSprite);

        this.addWindow(this._galleryPreviewWindow);
    };

    Scene_MyGallery.prototype.drawPreviewLabels = function(item) {
        this._galleryPreviewWindow.contents.clear();
        if (this._galleryViewMode) {
            return; // Jangan gambar label teks saat mode tampil penuh (full screen)
        }
        var w = this._galleryPreviewWindow.contentsWidth() || 1;
        var h = this._galleryPreviewWindow.contentsHeight() || 1;
        if (!item) {
            this._galleryPreviewWindow.drawText('Tidak ada file CG', 0, 0, w, 'center');
            return;
        }
        this._galleryPreviewWindow.drawText(item.name, 0, 0, w, 'center');
        this._galleryPreviewWindow.drawText('Zoom: ' + Math.floor(this._galleryZoom * 100) + '%', 0, 36, w, 'center');
        this._galleryPreviewWindow.drawText('PageUp / PageDown untuk zoom', 0, h - 36, w, 'center');
    };

    Scene_MyGallery.prototype.onGalleryOk = function() {
        var item = this._galleryWindow.currentExt();
        if (!item) {return};
        this._galleryViewMode = true;
        this._galleryWindow.deactivate();
        this._galleryWindow.hide();
        this._galleryZoom = 1.0;
        
        // Memperluas area preview menutupi seluruh layar (Full Screen)
        this._galleryPreviewWindow.move(0, 0, Graphics.boxWidth, Graphics.boxHeight);
        this._galleryPreviewWindow.opacity = 0; // Sembunyikan bingkai window
        
        this.refreshGalleryPreview(item);
    };

    Scene_MyGallery.prototype.refreshGallerySelection = function() {
        if (!this._galleryWindow) {return};
        var item = this._galleryWindow.currentExt();
        if (!item) {
            this._currentGalleryItem = null;
            this._galleryViewMode = false;
            this._galleryBitmapKey = '';
            this._galleryPreviewSprite.bitmap = null;
            this._galleryPreviewSprite.opacity = 0;
            this.drawPreviewLabels(null);
            return;
        }
        if (!this._currentGalleryItem || this._currentGalleryItem.file !== item.file) {
            this._galleryZoom = 1.0;
            this.refreshGalleryPreview(item);
        }
    };

    Scene_MyGallery.prototype.refreshGalleryPreview = function(item) {
        this._currentGalleryItem = item;
        this.drawPreviewLabels(item);
        if (this._galleryBitmapKey === item.file && this._galleryPreviewSprite.bitmap) {
            this.fitGalleryPreviewSprite();
            this._galleryPreviewSprite.opacity = 255;
            return;
        }
        this._galleryBitmapKey = item.file;
        this._galleryPreviewSprite.opacity = 0;
        this._galleryPreviewSprite.bitmap = ImageManager.loadPicture(item.file);
        this._galleryPreviewSprite.bitmap.addLoadListener(function() {
            this.fitGalleryPreviewSprite();
            this._galleryPreviewSprite.opacity = 255;
        }.bind(this));
    };

    Scene_MyGallery.prototype.fitGalleryPreviewSprite = function() {
        if (!this._currentGalleryItem || !this._galleryPreviewSprite.bitmap) {return};
        var bitmapWidth = this._galleryPreviewSprite.bitmap.width;
        var bitmapHeight = this._galleryPreviewSprite.bitmap.height;
        if (!bitmapWidth || !bitmapHeight) {return};
        
        var maxWidth, maxHeight;
        if (this._galleryViewMode) {
            maxWidth = Graphics.boxWidth;
            maxHeight = Graphics.boxHeight;
        } else {
            maxWidth = this._galleryPreviewWindow.width - 48;
            maxHeight = this._galleryPreviewWindow.height - 96;
        }
        
        // Pengecekan ketat untuk mencegah pembagian dengan NaN/0
        if (isNaN(maxWidth) || maxWidth <= 0) maxWidth = Graphics.boxWidth || 1280;
        if (isNaN(maxHeight) || maxHeight <= 0) maxHeight = Graphics.boxHeight || 720;
        
        var fitScale = Math.min(maxWidth / bitmapWidth, maxHeight / bitmapHeight, 1.0);
        var scale = fitScale * this._galleryZoom;
        if (isNaN(scale) || scale <= 0) scale = 1.0;
        
        this._galleryPreviewSprite.scale.x = scale;
        this._galleryPreviewSprite.scale.y = scale;
        
        // Menengahkan sprite CG di layar
        if (this._galleryViewMode) {
            this._galleryPreviewSprite.x = Math.floor(Graphics.boxWidth / 2);
            this._galleryPreviewSprite.y = Math.floor(Graphics.boxHeight / 2);
        } else {
            var w = this._galleryPreviewWindow.width || 320;
            var h = this._galleryPreviewWindow.height || 240;
            this._galleryPreviewSprite.x = Math.floor(w / 2);
            this._galleryPreviewSprite.y = Math.floor(h / 2) + 12;
        }
    };

    Scene_MyGallery.prototype.changeGalleryZoom = function(delta) {
        if (!this._currentGalleryItem) {return};
        this._galleryZoom += delta;
        if (this._galleryZoom < CUSTOM_GALLERY_ZOOM_MIN) {this._galleryZoom = CUSTOM_GALLERY_ZOOM_MIN};
        if (this._galleryZoom > CUSTOM_GALLERY_ZOOM_MAX) {this._galleryZoom = CUSTOM_GALLERY_ZOOM_MAX};
        this.fitGalleryPreviewSprite();
        this.drawPreviewLabels(this._currentGalleryItem);
    };

    Scene_MyGallery.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        if (!this._galleryWindow) {return};

        if (this._galleryViewMode) {
            if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
                this._galleryViewMode = false;
                this._galleryWindow.show();
                this._galleryWindow.activate();
                
                // Kembalikan ukuran dan posisi window preview ke tata letak normal
                var previewX = this._galleryWindow.width + (CUSTOM_GALLERY_MARGIN * 2);
                var previewY = CUSTOM_GALLERY_MARGIN;
                var previewWidth = Graphics.boxWidth - previewX - CUSTOM_GALLERY_MARGIN;
                var previewHeight = Graphics.boxHeight - (CUSTOM_GALLERY_MARGIN * 2);
                if (previewWidth < 320) {previewWidth = 320};
                
                this._galleryPreviewWindow.move(previewX, previewY, previewWidth, previewHeight);
                this._galleryPreviewWindow.opacity = 255;
                
                this.refreshGalleryPreview(this._currentGalleryItem);
            }
            if (Input.isTriggered('pageup')) {
                this.changeGalleryZoom(CUSTOM_GALLERY_ZOOM_STEP);
            } else if (Input.isTriggered('pagedown')) {
                this.changeGalleryZoom(-CUSTOM_GALLERY_ZOOM_STEP);
            }
            return;
        }

        if (Input.isTriggered('pageup')) {
            this.changeGalleryZoom(CUSTOM_GALLERY_ZOOM_STEP);
        } else if (Input.isTriggered('pagedown')) {
            this.changeGalleryZoom(-CUSTOM_GALLERY_ZOOM_STEP);
        }

        if (this._galleryWindow.active) {
            this.refreshGallerySelection();
        }
    };

    window.CustomGalleryManager = CustomGalleryManager;
    window.Scene_MyGallery = Scene_MyGallery;

})();
