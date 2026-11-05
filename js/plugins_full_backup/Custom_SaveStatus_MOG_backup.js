//=============================================================================
// Custom_SaveStatus_MOG.js
//=============================================================================
/*:
 * @plugindesc Menggabungkan Yanfly Save Core (Kanan Status Window) dengan LayoutStatus Moghunter.
 * @author Custom Build
 * 
 * @param Card Alignment
 * @desc Penataan posisi horizontal kartu status di dalam window: left, center, atau right.
 * @type select
 * @option left
 * @option center
 * @option right
 * @default right
 * 
 * @param Spacing
 * @desc Jarak horizontal antar kartu karakter.
 * @default 240
 * 
 * @param Scale X
 * @desc Skala lebar (X) bust karakter.
 * @default 0.65
 * 
 * @param Scale Y
 * @desc Skala tinggi (Y) bust karakter.
 * @default 0.65
 * 
 * @param Bust Offset X
 * @desc Posisi horizontal (X) bust relatif terhadap kartu status.
 * @default 110
 * 
 * @param Bust Offset Y
 * @desc Posisi vertikal (Y) bust relatif terhadap kartu status.
 * @default 210
 * 
 * @param Card Height
 * @desc Tinggi kartu status (untuk penempatan layout).
 * @default 200
 * 
 * @param Card Bottom Offset
 * @desc Jarak kartu status dari batas bawah window.
 * @default 15
 * 
 * @param Card Right Offset
 * @desc Offset tambahan ke kanan untuk posisi kartu dari tepi kanan window (bisa positif/negatif).
 * @default 10
 * 
 * @param --- Layout Status ---
 * @default
 * 
 * @param Layout X Offset
 * @parent --- Layout Status ---
 * @desc Penyesuaian sumbu X untuk gambar LayoutStatus.png pada Save Scene.
 * @default 0
 * 
 * @param Layout Y Offset
 * @parent --- Layout Status ---
 * @desc Penyesuaian sumbu Y untuk gambar LayoutStatus.png pada Save Scene.
 * @default 0
 * 
 * @param Layout Scale X
 * @parent --- Layout Status ---
 * @desc Skala lebar (X) gambar LayoutStatus.png pada Save Scene.
 * @default 1.00
 * 
 * @param Layout Scale Y
 * @parent --- Layout Status ---
 * @desc Skala tinggi (Y) gambar LayoutStatus.png pada Save Scene.
 * @default 1.00
 * 
 * 
 * @param --- Meters ---
 * @default
 * 
 * @param HP Meter X
 * @parent --- Meters ---
 * @desc Posisi X bar HP relatif terhadap kartu karakter.
 * @default 17
 * 
 * @param HP Meter Y
 * @parent --- Meters ---
 * @desc Posisi Y bar HP relatif terhadap kartu karakter.
 * @default 93
 * 
 * @param HP Meter Scale X
 * @parent --- Meters ---
 * @desc Skala lebar bar HP.
 * @default 1.00
 * 
 * @param HP Meter Scale Y
 * @parent --- Meters ---
 * @desc Skala tinggi bar HP.
 * @default 1.00
 * 
 * @param MP Meter X
 * @parent --- Meters ---
 * @desc Posisi X bar MP relatif terhadap kartu karakter.
 * @default 17
 * 
 * @param MP Meter Y
 * @parent --- Meters ---
 * @desc Posisi Y bar MP relatif terhadap kartu karakter.
 * @default 144
 * 
 * @param MP Meter Scale X
 * @parent --- Meters ---
 * @desc Skala lebar bar MP.
 * @default 1.00
 * 
 * @param MP Meter Scale Y
 * @parent --- Meters ---
 * @desc Skala tinggi bar MP.
 * @default 1.00
 * 
 * @param SAN Meter X
 * @parent --- Meters ---
 * @desc Posisi X bar Sanity relatif terhadap kartu karakter.
 * @default 17
 * 
 * @param SAN Meter Y
 * @parent --- Meters ---
 * @desc Posisi Y bar Sanity relatif terhadap kartu karakter.
 * @default 195
 * 
 * @param SAN Meter Scale X
 * @parent --- Meters ---
 * @desc Skala lebar bar Sanity.
 * @default 1.00
 * 
 * @param SAN Meter Scale Y
 * @parent --- Meters ---
 * @desc Skala tinggi bar Sanity.
 * @default 1.00
 * 
 * 
 * @param --- Status Numbers ---
 * @default
 * 
 * @param HP Number X Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat X untuk angka HP. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param HP Number Y Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat Y untuk angka HP. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param HPMax Number X Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat X untuk angka Max HP. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param HPMax Number Y Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat Y untuk angka Max HP. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param MP Number X Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat X untuk angka MP. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param MP Number Y Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat Y untuk angka MP. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param MPMax Number X Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat X untuk angka Max MP. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param MPMax Number Y Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat Y untuk angka Max MP. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param LV Number X Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat X untuk angka Level. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param LV Number Y Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat Y untuk angka Level. Kosongkan untuk memakai setting Moghunter Menu.
 * @default
 * 
 * @param HP Number Scale X
 * @parent --- Status Numbers ---
 * @desc Skala lebar angka HP.
 * @default 1.0
 *
 * @param HP Number Scale Y
 * @parent --- Status Numbers ---
 * @desc Skala tinggi angka HP.
 * @default 1.0
 * 
 * @param MP Number Scale X
 * @parent --- Status Numbers ---
 * @desc Skala lebar angka MP.
 * @default 1.0
 *
 * @param MP Number Scale Y
 * @parent --- Status Numbers ---
 * @desc Skala tinggi angka MP.
 * @default 1.0
 * 
 * @param SAN Number X Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat X untuk angka Sanity. Kosongkan untuk default.
 * @default
 *
 * @param SAN Number Y Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat Y untuk angka Sanity. Kosongkan untuk default.
 * @default
 *
 * @param SANMax Number X Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat X untuk angka Max Sanity. Kosongkan untuk default.
 * @default
 *
 * @param SANMax Number Y Offset
 * @parent --- Status Numbers ---
 * @desc Koordinat Y untuk angka Max Sanity. Kosongkan untuk default.
 * @default
 * 
 * @param SAN Number Scale X
 * @parent --- Status Numbers ---
 * @desc Skala lebar angka Sanity.
 * @default 1.0
 *
 * @param SAN Number Scale Y
 * @parent --- Status Numbers ---
 * @desc Skala tinggi angka Sanity.
 * @default 1.0
 * 
 * @param LV Number Scale X
 * @parent --- Status Numbers ---
 * @desc Skala lebar angka Level.
 * @default 1.0
 *
 * @param LV Number Scale Y
 * @parent --- Status Numbers ---
 * @desc Skala tinggi angka Level.
 * @default 1.0
 * 
 * @param --- Name ---
 * @default
 * 
 * @param Name X Offset
 * @parent --- Name ---
 * @desc Koordinat X untuk Nama Karakter.
 * @default 20
 * 
 * @param Name Y Offset
 * @parent --- Name ---
 * @desc Koordinat Y untuk Nama Karakter.
 * @default 0
 * 
 * @param Name Scale X
 * @parent --- Name ---
 * @desc Skala lebar teks Nama Karakter.
 * @default 1.0
 * 
 * @param Name Scale Y
 * @parent --- Name ---
 * @desc Skala tinggi teks Nama Karakter.
 * @default 1.0
 * 
 * @help
 * Plugin ini menggantikan tampilan status di kanan layar Save/Load (Yanfly Save Core)
 * dengan kartu status bergaya Moghunter (menggunakan LayoutStatus.png, HPMeter.png, dll.).
 * 
 * Taruh plugin ini DI BAWAH YEP_SaveCore dan MOG_SceneMenu di Plugin Manager.
 */

(function() {

    // Membaca parameter dari Plugin Manager
    var parameters = PluginManager.parameters('Custom_SaveStatus_MOG');
    var paramAlignment = (parameters['Card Alignment'] || 'right').trim().toLowerCase();
    var paramSpacing = Number(parameters['Spacing'] || 240);
    var paramScaleX = Number(parameters['Scale X'] || 0.65);
    var paramScaleY = Number(parameters['Scale Y'] || 0.65);
    var paramBustX = Number(parameters['Bust Offset X'] || 110);
    var paramBustY = Number(parameters['Bust Offset Y'] || 210);
    var paramCardHeight = Number(parameters['Card Height'] || 200);
    var paramCardBottomOffset = Number(parameters['Card Bottom Offset'] || 15);
    var paramCardRightOffset = Number(parameters['Card Right Offset'] || 10);

    Moghunter = Moghunter || {};
    Moghunter.CustomSave = Moghunter.CustomSave || {};

    Moghunter.CustomSave.reload = function() {
        var p = null;
        if (typeof $plugins !== 'undefined') {
            for (var i = 0; i < $plugins.length; i++) {
                if ($plugins[i].name === 'Custom_SaveStatus_MOG') {
                    p = $plugins[i].parameters;
                    break;
                }
            }
        }
        if (!p) p = PluginManager.parameters('Custom_SaveStatus_MOG');

        Moghunter.CustomSave.alignment = (p['Card Alignment'] || 'right').trim().toLowerCase();
        Moghunter.CustomSave.spacing = Number(p['Spacing'] || 240);
        Moghunter.CustomSave.scaleX = Number(p['Scale X'] || 0.65);
        Moghunter.CustomSave.scaleY = Number(p['Scale Y'] || 0.65);
        Moghunter.CustomSave.bustX = Number(p['Bust Offset X'] || 110);
        Moghunter.CustomSave.bustY = Number(p['Bust Offset Y'] || 210);
        Moghunter.CustomSave.cardHeight = Number(p['Card Height'] || 200);
        Moghunter.CustomSave.cardBottomOffset = Number(p['Card Bottom Offset'] || 15);
        Moghunter.CustomSave.cardRightOffset = Number(p['Card Right Offset'] || 10);

        Moghunter.CustomSave.layoutX = Number(p['Layout X Offset'] || 0);
        Moghunter.CustomSave.layoutY = Number(p['Layout Y Offset'] || 0);
        Moghunter.CustomSave.layoutSX = Number(p['Layout Scale X'] || 1.0);
        Moghunter.CustomSave.layoutSY = Number(p['Layout Scale Y'] || 1.0);

        Moghunter.CustomSave.hpX = Number(p['HP Meter X'] || 17);
        Moghunter.CustomSave.hpY = Number(p['HP Meter Y'] || 93);
        Moghunter.CustomSave.hpSX = Number(p['HP Meter Scale X'] || 1.0);
        Moghunter.CustomSave.hpSY = Number(p['HP Meter Scale Y'] || 1.0);

        Moghunter.CustomSave.mpX = Number(p['MP Meter X'] || 17);
        Moghunter.CustomSave.mpY = Number(p['MP Meter Y'] || 144);
        Moghunter.CustomSave.mpSX = Number(p['MP Meter Scale X'] || 1.0);
        Moghunter.CustomSave.mpSY = Number(p['MP Meter Scale Y'] || 1.0);

        Moghunter.CustomSave.sanX = Number(p['SAN Meter X'] || 17);
        Moghunter.CustomSave.sanY = Number(p['SAN Meter Y'] || 195);
        Moghunter.CustomSave.sanSX = Number(p['SAN Meter Scale X'] || 1.0);
        Moghunter.CustomSave.sanSY = Number(p['SAN Meter Scale Y'] || 1.0);

        var hN = function(paramName) {
            var v = p[paramName];
            return (v !== undefined && v !== null && v !== '') ? Number(v) : null;
        };

        Moghunter.CustomSave.hpNumX = hN('HP Number X Offset');
        Moghunter.CustomSave.hpNumY = hN('HP Number Y Offset');
        Moghunter.CustomSave.hpMaxX = hN('HPMax Number X Offset');
        Moghunter.CustomSave.hpMaxY = hN('HPMax Number Y Offset');
        Moghunter.CustomSave.hpNumSX = Number(p['HP Number Scale X'] || 1.0);
        Moghunter.CustomSave.hpNumSY = Number(p['HP Number Scale Y'] || 1.0);
        
        Moghunter.CustomSave.mpNumX = hN('MP Number X Offset');
        Moghunter.CustomSave.mpNumY = hN('MP Number Y Offset');
        Moghunter.CustomSave.mpMaxX = hN('MPMax Number X Offset');
        Moghunter.CustomSave.mpMaxY = hN('MPMax Number Y Offset');
        Moghunter.CustomSave.mpNumSX = Number(p['MP Number Scale X'] || 1.0);
        Moghunter.CustomSave.mpNumSY = Number(p['MP Number Scale Y'] || 1.0);
        
        Moghunter.CustomSave.sanNumX = hN('SAN Number X Offset');
        Moghunter.CustomSave.sanNumY = hN('SAN Number Y Offset');
        Moghunter.CustomSave.sanMaxX = hN('SANMax Number X Offset');
        Moghunter.CustomSave.sanMaxY = hN('SANMax Number Y Offset');
        Moghunter.CustomSave.sanNumSX = Number(p['SAN Number Scale X'] || 1.0);
        Moghunter.CustomSave.sanNumSY = Number(p['SAN Number Scale Y'] || 1.0);
        
        Moghunter.CustomSave.lvNumX = hN('LV Number X Offset');
        Moghunter.CustomSave.lvNumY = hN('LV Number Y Offset');
        Moghunter.CustomSave.lvNumSX = Number(p['LV Number Scale X'] || 1.0);
        Moghunter.CustomSave.lvNumSY = Number(p['LV Number Scale Y'] || 1.0);

        Moghunter.CustomSave.nameX = Number(p['Name X Offset'] || 20);
        Moghunter.CustomSave.nameY = Number(p['Name Y Offset'] || 0);
        Moghunter.CustomSave.nameSX = Number(p['Name Scale X'] || 1.0);
        Moghunter.CustomSave.nameSY = Number(p['Name Scale Y'] || 1.0);

        Moghunter.CustomSave._needsRefresh = true;
    };
    // Panggil saat awal load
    Moghunter.CustomSave.reload();


    // Simpan hook fungsi-fungsi Window_SaveInfo asli
    var _Window_SaveInfo_initialize = Window_SaveInfo.prototype.initialize;
    Window_SaveInfo.prototype.initialize = function(x, y, width, height, mode) {
        _Window_SaveInfo_initialize.call(this, x, y, width, height, mode);
        this._mogSprites = [];
        this._animatedMeters = [];
    };

    var _Window_SaveInfo_update = Window_SaveInfo.prototype.update;
    Window_SaveInfo.prototype.update = function() {
        if (Moghunter.CustomSave && Moghunter.CustomSave._needsRefresh) {
            Moghunter.CustomSave._needsRefresh = false;
            if (this.savefileId() > 0) {
                this.updateIndex();
                this._waitTime = 1; // Memaksa Yanfly Save Core redraw dalam 1 frame
            }
        }
        _Window_SaveInfo_update.call(this);
        this.updateAnimatedMeters();
    };

    var _Window_SaveInfo_updateIndex = Window_SaveInfo.prototype.updateIndex;
    Window_SaveInfo.prototype.updateIndex = function() {
        this.clearMoghunterSprites();
        _Window_SaveInfo_updateIndex.call(this);
    };

    Window_SaveInfo.prototype.clearMoghunterSprites = function() {
        if (this._mogSprites) {
            for (var i = 0; i < this._mogSprites.length; i++) {
                this.removeChild(this._mogSprites[i]);
            }
        }
        this._mogSprites = [];
        this._animatedMeters = [];
    };

    // Override fungsi drawContents bawaan Yanfly dengan proteksi tipe data
    Window_SaveInfo.prototype.drawContents = function(dy) {
        if (!this._saveContents) {
            return setTimeout(this.drawContents.bind(this, dy), 50);
        }
        
        // Proteksi: Hanya parse jika datanya masih berupa string (mencegah SyntaxError akibat double parse)
        if (typeof this._saveContents === 'string') {
            try {
                this._saveContents = JsonEx.parse(this._saveContents);
            } catch (e) {
                console.error("Gagal mengurai (parse) data save:", e);
                this._saveContents = null;
                return;
            }
        }
        
        // Proteksi: Pastikan objek save memiliki data party dan actor sebelum merender
        if (!this._saveContents || !this._saveContents.party || !this._saveContents.actors) {
            return;
        }
        
        this.clearMoghunterSprites();

        // 1. Gambar Data Kolom yang BERSIH (Tanpa Grid Gelap & Tanpa Variabel 0)
        this.drawColumnData(dy);
        
        // Garis Pembatas Horizontal di bawah GP
        var lineY = dy + (this.lineHeight() * 3) + 5;
        this.contents.paintOpacity = 100;
        this.contents.fillRect(0, lineY, this.contents.width, 2, this.normalColor());
        this.contents.paintOpacity = 255;
        
        // 2. Gambar Kartu Status Karakter Moghunter di bagian paling bawah window (untuk menghindari overlap)
        var startY = this.contentsHeight() - Moghunter.CustomSave.cardHeight - Moghunter.CustomSave.cardBottomOffset;
        this.drawMoghunterSaveInfo(startY);
    };

    // MODIFIKASI: Menghapus grid gelap dan membatasi data hanya yang penting (Playtime, Saves, Gold, Location)
    Window_SaveInfo.prototype.drawColumnData = function(dy) {
        var dw = Math.floor(this.contents.width / 2);
        
        // Kolom 1 (Kiri): Playtime, Total Saves, Gold
        this.drawCleanColumn(1, 0, dy, dw);
        
        // Kolom 2 (Kanan): Map Location
        this.drawCleanColumn(2, dw, dy, dw);
    };

    Window_SaveInfo.prototype.drawCleanColumn = function(type, dx, dy, dw) {
        if (!this._info || !this._saveContents) return;
        var tp = this.textPadding();
        this.resetFontSettings();
        this.contents.fontSize = Yanfly.Param.SaveInfoDataSz || 20;

        if (type === 1) {
            // Gambar Playtime
            var playtimeText = this._info.playtime || '00:00:00';
            this.changeTextColor(this.systemColor());
            this.drawText(Yanfly.Param.SaveVocabPlaytime, dx + tp, dy, dw - tp * 2, 'left');
            this.changeTextColor(this.normalColor());
            this.drawText(playtimeText, dx + tp, dy, dw - tp * 2, 'right');
            dy += this.lineHeight();

            // Gambar Total Saves (Dibaca langsung dari Save File)
            var savesVal = this._saveContents.system ? (this._saveContents.system._saveCount || 0) : 0;
            var savesText = Yanfly.Util.toGroup(savesVal);
            this.changeTextColor(this.systemColor());
            this.drawText(Yanfly.Param.SaveVocabSaveCount, dx + tp, dy, dw - tp * 2, 'left');
            this.changeTextColor(this.normalColor());
            this.drawText(savesText, dx + tp, dy, dw - tp * 2, 'right');
            dy += this.lineHeight();

            // Gambar Gold
            var goldVal = 0;
            if (this._saveContents.party && typeof this._saveContents.party.gold === 'function') {
                goldVal = this._saveContents.party.gold();
            } else if (this._saveContents.party) {
                goldVal = this._saveContents.party._gold || 0;
            }
            var goldText = Yanfly.Util.toGroup(goldVal) + ' ' + TextManager.currencyUnit;
            this.changeTextColor(this.systemColor());
            var fmt = Yanfly.Param.SaveVocabGold || "%1";
            var goldLabel = fmt.format(TextManager.currencyUnit);
            this.drawText(goldLabel, dx + tp, dy, dw - tp * 2, 'left');
            this.changeTextColor(this.normalColor());
            this.drawText(goldText, dx + tp, dy, dw - tp * 2, 'right');
        } else if (type === 2) {
            // Gambar Location (Map Display Name dibaca dinamis dari Save File)
            var mapId = this._saveContents.map ? this._saveContents.map._mapId : 0;
            var locText = '';
            if (this._saveContents.map && Yanfly.Param.SaveMapDisplayName) {
                locText = this._saveContents.map.locationDisplayName || '';
            }
            if (locText.length <= 0 && $dataMapInfos && $dataMapInfos[mapId]) {
                locText = $dataMapInfos[mapId].name;
            }
            
            this.changeTextColor(this.systemColor());
            this.drawText(Yanfly.Param.SaveVocabLocation || 'Location:', dx + tp, dy, dw - tp * 2, 'left');
            this.changeTextColor(this.normalColor());
            this.drawText(locText, dx + tp, dy, dw - tp * 2, 'right');
        }
    };

    Window_SaveInfo.prototype.drawMoghunterSaveInfo = function(startY) {
        if (typeof Moghunter === 'undefined') return;

        var maxMembers = this._saveContents.party.maxBattleMembers();
        var actors = [];
        for (var i = 0; i < maxMembers; i++) {
            var actorId = this._saveContents.party._actors[i];
            var actor = this._saveContents.actors._data[actorId];
            if (actor) {
                actors.push(actor);
            }
        }

        var spacing = Moghunter.CustomSave.spacing;
        var cardWidth = 220; // Lebar standar LayoutStatus.png
        var totalWidth = actors.length > 0 ? ((actors.length - 1) * spacing + cardWidth) : 0;
        
        // Menghitung startX berdasarkan perataan (Alignment) & Right Offset
        var startX = 20;
        if (Moghunter.CustomSave.alignment === 'center') {
            startX = Math.max(20, (this.contentsWidth() - totalWidth) / 2);
        } else if (Moghunter.CustomSave.alignment === 'right') {
            startX = Math.max(20, this.contentsWidth() - totalWidth + Moghunter.CustomSave.cardRightOffset);
        } else { // left
            startX = 20;
        }

        var layoutImg = ImageManager.loadMenusMain("LayoutStatus");
        var hpNumImg = ImageManager.loadMenusMain("HPNumber");
        var mpNumImg = ImageManager.loadMenusMain("MPNumber");
        var lvNumImg = ImageManager.loadMenusMain("LVNumber");

        for (var i = 0; i < actors.length; i++) {
            var actor = actors[i];
            var dx = startX + (i * spacing);
            var dy = startY;

            // Membuat container sprite untuk kartu karakter
            var card = new Sprite();
            this.addChild(card);
            this._mogSprites.push(card);

            // 1. Gambar Bust Karakter (faces3) - Ditempatkan di belakang layout
            var bustImg = ImageManager.loadMenusFaces3("Actor_" + actor.actorId());
            var bust = new Sprite(bustImg);
            bust.anchor.x = 0.5;
            bust.anchor.y = 1.0;
            bust.x = dx + Moghunter.CustomSave.bustX;
            bust.y = dy + Moghunter.CustomSave.bustY;
            bust.scale.x = Moghunter.CustomSave.scaleX;
            bust.scale.y = Moghunter.CustomSave.scaleY;
            card.addChild(bust);

            // 2. HP Meter & MP Meter & TP Meter - DITEMPATKAN DI BAWAH LAYOUT
            var hpMeter = new Sprite(ImageManager.loadMenusMain("HPMeter"));
            hpMeter.baseX = dx; hpMeter.baseY = dy;
            hpMeter.x = dx + Moghunter.CustomSave.hpX;
            hpMeter.y = dy + Moghunter.CustomSave.hpY;
            hpMeter.actor = actor;
            hpMeter.meterType = 'hp';
            hpMeter.scale.x = Moghunter.CustomSave.hpSX;
            hpMeter.scale.y = Moghunter.CustomSave.hpSY;
            card.addChild(hpMeter);
            this._animatedMeters.push(hpMeter);

            var mpMeter = new Sprite(ImageManager.loadMenusMain("MPMeter"));
            mpMeter.baseX = dx; mpMeter.baseY = dy;
            mpMeter.x = dx + Moghunter.CustomSave.mpX;
            mpMeter.y = dy + Moghunter.CustomSave.mpY;
            mpMeter.actor = actor;
            mpMeter.meterType = 'mp';
            mpMeter.scale.x = Moghunter.CustomSave.mpSX;
            mpMeter.scale.y = Moghunter.CustomSave.mpSY;
            card.addChild(mpMeter);
            this._animatedMeters.push(mpMeter);

            var tpMeter = new Sprite(ImageManager.loadMenusMain("SanityMeter"));
            tpMeter.baseX = dx; tpMeter.baseY = dy;
            tpMeter.x = dx + Moghunter.CustomSave.sanX;
            tpMeter.y = dy + Moghunter.CustomSave.sanY;
            tpMeter.actor = actor;
            tpMeter.meterType = 'tp';
            tpMeter.scale.x = Moghunter.CustomSave.sanSX;
            tpMeter.scale.y = Moghunter.CustomSave.sanSY;
            card.addChild(tpMeter);
            this._animatedMeters.push(tpMeter);

            // 3. Gambar Layout Kartu Status Moghunter - DITEMPATKAN DI ATAS METER
            var layout = new Sprite(layoutImg);
            layout.baseX = dx; layout.baseY = dy;
            layout.x = dx + Moghunter.CustomSave.layoutX;
            layout.y = dy + Moghunter.CustomSave.layoutY;
            layout.scale.x = Moghunter.CustomSave.layoutSX;
            layout.scale.y = Moghunter.CustomSave.layoutSY;
            layout.isLayout = true; // flag agar bisa diupdate
            card.addChild(layout);
            this._animatedMeters.push(layout); // kita ikut masukkan agar posisinya bisa dilacak setiap frame


            // 4. Nama Karakter (Top Bar)
            var nameSprite = new Sprite(new Bitmap(120, 32));
            nameSprite.x = dx + Moghunter.CustomSave.nameX;
            nameSprite.y = dy + Moghunter.CustomSave.nameY;
            nameSprite.scale.x = Moghunter.CustomSave.nameSX;
            nameSprite.scale.y = Moghunter.CustomSave.nameSY;
            nameSprite.bitmap.fontSize = Moghunter.scMenu_NameFontSize || 20;
            nameSprite.bitmap.textColor = '#ffffff';
            nameSprite.bitmap.drawText(actor.name() || '', 0, 0, 120, 32, "center");
            card.addChild(nameSprite);

            // Pengaturan Koordinat Angka (Membaca override Moghunter Save)
            var hpNumX = Moghunter.CustomSave.hpNumX !== null ? Moghunter.CustomSave.hpNumX : (Moghunter.scMenu_SaveHPNumX || 100);
            var hpNumY = Moghunter.CustomSave.hpNumY !== null ? Moghunter.CustomSave.hpNumY : (Moghunter.scMenu_SaveHPNumY || 73);
            var hpNum2X = Moghunter.CustomSave.hpMaxX !== null ? Moghunter.CustomSave.hpMaxX : (Moghunter.scMenu_SaveHPMaxNumX || 140);
            var hpNum2Y = Moghunter.CustomSave.hpMaxY !== null ? Moghunter.CustomSave.hpMaxY : (Moghunter.scMenu_SaveHPMaxNumY || 100);
            
            var mpNumX = Moghunter.CustomSave.mpNumX !== null ? Moghunter.CustomSave.mpNumX : (Moghunter.scMenu_SaveMPNumX || 100);
            var mpNumY = Moghunter.CustomSave.mpNumY !== null ? Moghunter.CustomSave.mpNumY : (Moghunter.scMenu_SaveMPNumY || 124);
            var mpNum2X = Moghunter.CustomSave.mpMaxX !== null ? Moghunter.CustomSave.mpMaxX : (Moghunter.scMenu_SaveMPMaxNumX || 140);
            var mpNum2Y = Moghunter.CustomSave.mpMaxY !== null ? Moghunter.CustomSave.mpMaxY : (Moghunter.scMenu_SaveMPMaxNumY || 151);

            // 5. HP & MP & TP Numbers
            var sanNumImg = ImageManager.loadMenusMain("SanityNumber");
            var hpSx = Moghunter.CustomSave.hpNumSX;
            var hpSy = Moghunter.CustomSave.hpNumSY;
            this.createSaveNumber(card, actor.hp, hpNumImg, dx + hpNumX, dy + hpNumY, 5, hpSx, hpSy);
            this.createSaveNumber(card, actor.mhp, hpNumImg, dx + hpNum2X, dy + hpNum2Y, 5, hpSx, hpSy);
            
            var mpSx = Moghunter.CustomSave.mpNumSX;
            var mpSy = Moghunter.CustomSave.mpNumSY;
            this.createSaveNumber(card, actor.mp, mpNumImg, dx + mpNumX, dy + mpNumY, 5, mpSx, mpSy);
            this.createSaveNumber(card, actor.mmp, mpNumImg, dx + mpNum2X, dy + mpNum2Y, 5, mpSx, mpSy);
            
            var tpNumX = Moghunter.CustomSave.sanNumX !== null ? Moghunter.CustomSave.sanNumX : (Moghunter.scMenu_SaveTPNumX || 100);
            var tpNumY = Moghunter.CustomSave.sanNumY !== null ? Moghunter.CustomSave.sanNumY : (Moghunter.scMenu_SaveTPNumY || 175);
            var tpNum2X = Moghunter.CustomSave.sanMaxX !== null ? Moghunter.CustomSave.sanMaxX : (Moghunter.scMenu_SaveTPMaxNumX || 140);
            var tpNum2Y = Moghunter.CustomSave.sanMaxY !== null ? Moghunter.CustomSave.sanMaxY : (Moghunter.scMenu_SaveTPMaxNumY || 202);
            var tpSx = Moghunter.CustomSave.sanNumSX;
            var tpSy = Moghunter.CustomSave.sanNumSY;
            this.createSaveNumber(card, actor.sanity || 0, sanNumImg, dx + tpNumX, dy + tpNumY, 5, tpSx, tpSy);
            this.createSaveNumber(card, actor.maxSanity ? actor.maxSanity() : 100, sanNumImg, dx + tpNum2X, dy + tpNum2Y, 5, tpSx, tpSy);

            // 6. Level Number
            var lvX = Moghunter.CustomSave.lvNumX !== null ? Moghunter.CustomSave.lvNumX : (Moghunter.scMenu_SaveLVNumX || 95);
            var lvY = Moghunter.CustomSave.lvNumY !== null ? Moghunter.CustomSave.lvNumY : (Moghunter.scMenu_SaveLVNumY || 33);
            var lvSx = Moghunter.CustomSave.lvNumSX;
            var lvSy = Moghunter.CustomSave.lvNumSY;
            this.createSaveNumber(card, actor.level, lvNumImg, dx + lvX, dy + lvY, 3, lvSx, lvSy);

            // 7. States Icon
            var stateIcon = new Sprite(ImageManager.loadSystem("IconSet"));
            stateIcon.x = dx + (Moghunter.scMenu_statesX || 111);
            stateIcon.y = dy + (Moghunter.scMenu_statesY || 30);
            
            // Mencari state icon pertama
            var stateIcons = [];
            if (actor._states) {
                for (var s = 0; s < actor._states.length; s++) {
                    var stateId = actor._states[s];
                    var state = $dataStates[stateId];
                    if (state && state.iconIndex > 0) {
                        stateIcons.push(state.iconIndex);
                    }
                }
            }
            if (stateIcons.length > 0) {
                var iconIndex = stateIcons[0];
                var sx = iconIndex % 16 * 32;
                var sy = Math.floor(iconIndex / 16) * 32;
                stateIcon.setFrame(sx, sy, 32, 32);
                stateIcon.visible = true;
            } else {
                stateIcon.visible = false;
            }
            card.addChild(stateIcon);
        }
    };

    Window_SaveInfo.prototype.createSaveNumber = function(card, value, bitmap, x, y, maxLength, scaleX, scaleY) {
        if (!bitmap || !bitmap.isReady()) {
            setTimeout(this.createSaveNumber.bind(this, card, value, bitmap, x, y, maxLength, scaleX, scaleY), 50);
            return;
        }
        var scX = scaleX || 1.0;
        var scY = scaleY || 1.0;
        var segmentWidth = bitmap.width / 10;
        var height = bitmap.height;
        var numbers = Math.abs(value).toString().split("");
        
        for (var i = 0; i < maxLength; i++) {
            var sprite = new Sprite(bitmap);
            sprite.y = y;
            sprite.scale.x = scX;
            sprite.scale.y = scY;
            sprite.opacity = 255;
            if (i < numbers.length) {
                var n = Number(numbers[i]);
                sprite.setFrame(n * segmentWidth, 0, segmentWidth, height);
                var nx = -((segmentWidth * scX) * i) + ((segmentWidth * scX) * numbers.length);
                sprite.x = x - nx;
                sprite.visible = true;
            } else {
                sprite.visible = false;
            }
            card.addChild(sprite);
        }
    };

    // Fungsi pemutaran/update aliran meter (HPMeter & MPMeter) secara dinamis
    Window_SaveInfo.prototype.updateAnimatedMeters = function() {
        if (!this._animatedMeters) return;
        for (var i = 0; i < this._animatedMeters.length; i++) {
            var sprite = this._animatedMeters[i];
            
            // --- LIVE UPDATE POSISI ---
            if (sprite.isLayout) {
                sprite.x = sprite.baseX + Moghunter.CustomSave.layoutX;
                sprite.y = sprite.baseY + Moghunter.CustomSave.layoutY;
                sprite.scale.x = Moghunter.CustomSave.layoutSX;
                sprite.scale.y = Moghunter.CustomSave.layoutSY;
                continue; // Layout tidak punya animasi meter
            }
            if (sprite.meterType === 'hp') {
                sprite.x = sprite.baseX + Moghunter.CustomSave.hpX;
                sprite.y = sprite.baseY + Moghunter.CustomSave.hpY;
                sprite.scale.x = Moghunter.CustomSave.hpSX;
                sprite.scale.y = Moghunter.CustomSave.hpSY;
            } else if (sprite.meterType === 'mp') {
                sprite.x = sprite.baseX + Moghunter.CustomSave.mpX;
                sprite.y = sprite.baseY + Moghunter.CustomSave.mpY;
                sprite.scale.x = Moghunter.CustomSave.mpSX;
                sprite.scale.y = Moghunter.CustomSave.mpSY;
            } else if (sprite.meterType === 'tp') {
                sprite.x = sprite.baseX + Moghunter.CustomSave.sanX;
                sprite.y = sprite.baseY + Moghunter.CustomSave.sanY;
                sprite.scale.x = Moghunter.CustomSave.sanSX;
                sprite.scale.y = Moghunter.CustomSave.sanSY;
            }

            if (!sprite.bitmap || !sprite.bitmap.isReady()) continue;
            
            if (!sprite._flowData) {
                var segmentWidth = sprite.bitmap.width / 3;
                sprite._flowData = [
                    segmentWidth,
                    sprite.bitmap.height,
                    segmentWidth * 2,
                    Math.randomInt(segmentWidth * 2)
                ];
            }
            
            sprite._flowData[3] += 1.5; // Kecepatan aliran meter
            if (sprite._flowData[3] > sprite._flowData[2]) {
                sprite._flowData[3] = 0;
            }
            
            var v1 = 0, v2 = 1;
            if (sprite.meterType === 'hp') {
                v1 = sprite.actor.hp; v2 = sprite.actor.mhp;
            } else if (sprite.meterType === 'mp') {
                v1 = sprite.actor.mp; v2 = sprite.actor.mmp;
            } else if (sprite.meterType === 'tp') {
                v1 = sprite.actor.sanity || 0; 
                v2 = sprite.actor.maxSanity ? sprite.actor.maxSanity() : 100;
            }
            var cw = sprite._flowData[0] * v1 / v2;
            
            sprite.setFrame(sprite._flowData[3], 0, cw, sprite._flowData[1]);
        }
    };

})();
