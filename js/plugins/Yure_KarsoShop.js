//=============================================================================
// Yure_KarsoShop.js
//=============================================================================

/*:
 * @plugindesc [v1.1] Toko Mbah Karso: Suasana Lesehan Interaktif, Lampu Malam Berkedip, Item Berserakan Random, & Buku Inventori Jual-Beli dengan Animasi Slide Kanan-ke-Kiri.
 * @author Antigravity
 *
 * @help
 * ============================================================================
 * TOKO MBAH KARSO (INTERACTIVE SCATTERED SHOP & INVENTORY BOOK SYSTEM)
 * ============================================================================
 * 
 * Fitur Utama:
 * 1. Lingkungan Toko Lesehan (Overhead View):
 *    - Matras / kain biru (ground.png) dan sepasang kaki Mbah Karso (sikil.png).
 *    - Deteksi Siang / Malam:
 *      * Siang: Lampu mati, pencahayaan alami matras.
 *      * Malam: Lampu sorot gantung (lamp.png) menyala dengan efek kedipan lembut
 *        (organic gentle flickering physics).
 * 
 * 2. Item Dagangan Berserakan di Matras (Scattered Goods):
 *    - Barang dagangan tersebar secara alami di atas matras kain.
 *    - Stok otomatis di-refresh & di-random setiap malam tiba!
 *    - Navigasi Tombol Panah (Keyboard) & Kursor Mouse (Hover) secara murni di atas matras
 *      (tidak akan tertekan membuka inventori secara tidak sengaja).
 *    - Dilengkapi Reticle Emas berdenyut & Popup Tooltip Detail (gaya Constellation).
 * 
 * 3. Halaman Detail Pembelian (Left Page & Polaroid):
 *    - Menekan ENTER pada item berserakan akan membuka lembar kertas (Left page.png).
 *    - Menampilkan frame Polaroid_.png dengan foto/ikon item besar di kiri atas.
 *    - Teks nama, harga beli, gold pemain, jumlah dimiliki, statistik/efek, dan deskripsi lore.
 *    - Tombol konfirmasi beli langsung [ENTER] & batal [ESC].
 * 
 * 4. Buku Inventori Pemain untuk Jual Barang (Living Scrapbook):
 *    - Di sisi kanan layar toko terdapat pita bookmark "Item" yang menyembul lembut.
 *    - Membuka inventori dapat dilakukan dengan menekan [TAB] atau mengklik pita kanan.
 *    - Animasi Buku Meluncur Halus dari KANAN ke KIRI (Slide Right-to-Left) menutupi layar,
 *      dan meluncur kembali ke kanan saat ditutup.
 *    - Tata letak Buku Scrapbook Resmi (Pixel-Perfect):
 *      * Sisi Kiri: 1 Pita Bookmark "Item" terselip di bawah Left page.png.
 *      * Halaman Kiri: 24 Slot Grid Column_.png (4 kolom x 6 baris) dengan ikon, jumlah,
 *        reticle magenta, dan navigasi halaman (Q / W).
 *      * Halaman Kanan: Polaroid_.png miring (-8.5°), Nama Barang, Description_.png (kertas
 *        bergaris), Lore resmi, info harga jual, dan tombol aksi [ ENTER ] JUAL BARANG.
 * 
 * Plugin Command:
 *   KarsoShop open    -> Membuka Toko Mbah Karso langsung dari Event.
 * ============================================================================
 */

(function() {
    'use strict';

    // ------------------------------------------------------------------------
    // POLYFILL & SAFE ROUNDED RECTANGLE (Cross-Platform NW.js / Chromium)
    // ------------------------------------------------------------------------
    function drawSafeRoundRect(ctx, x, y, w, h, r) {
        if (typeof r === 'undefined') r = 0;
        if (typeof r === 'number') {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        } else if (Array.isArray(r)) {
            var tl = r[0] || 0, tr = r[1] || 0, br = r[2] || 0, bl = r[3] || 0;
            ctx.beginPath();
            ctx.moveTo(x + tl, y);
            ctx.arcTo(x + w, y, x + w, y + h, tr);
            ctx.arcTo(x + w, y + h, x, y + h, br);
            ctx.arcTo(x, y + h, x, y, bl);
            ctx.arcTo(x, y, x + w, y, tl);
            ctx.closePath();
        }
    }

    if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            drawSafeRoundRect(this, x, y, w, h, r);
            return this;
        };
    }

    // ------------------------------------------------------------------------
    // HELPER PEMUAT ASET GAMBAR
    // ------------------------------------------------------------------------
    ImageManager.loadKarsoShop = function(filename) {
        return this.loadBitmap('img/menus/main/enviroment/shop/', filename, 0, true);
    };

    ImageManager.loadJournalMenu = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-menu/', filename, 0, true);
    };

    ImageManager.loadJournalItem = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-Item/', filename, 0, true);
    };

    // ------------------------------------------------------------------------
    // DETEKSI FASE SIANG / MALAM
    // ------------------------------------------------------------------------
    function isKarsoNightTime() {
        if (typeof $gameSystem !== 'undefined') {
            if (typeof $gameSystem.day_phase === 'function') {
                var phase = $gameSystem.day_phase();
                // Phase 2 = Dusk, Phase 3 = Night
                if (phase === 3 || phase === 2) return true;
            }
            if (typeof $gameSystem.hour === 'function') {
                var h = $gameSystem.hour();
                if (h >= 18 || h < 6) return true;
            }
        }
        if (typeof $gameSwitches !== 'undefined') {
            // MOG_TimeSystem Switch IDs: 26 = Night, 28 = Night Shift, 25 = Dusk
            if ($gameSwitches.value(26) || $gameSwitches.value(28) || $gameSwitches.value(25)) {
                return true;
            }
        }
        if (typeof $gameVariables !== 'undefined') {
            var hVar = $gameVariables.value(10); // Hour Variable
            if (hVar >= 18 || (hVar < 6 && hVar > 0)) return true;
        }
        return false;
    }

    // ------------------------------------------------------------------------
    // KOORDINAT PENYEBARAN ITEM DI ATAS KAIN MATRAS (12 NATURAL SCATTER SLOTS)
    // ------------------------------------------------------------------------
    var SCATTER_SLOTS = [
        { id: 0,  x: 340, y: 280, tilt: -0.06 }, // Baris Atas 1
        { id: 1,  x: 500, y: 260, tilt:  0.04 }, // Baris Atas 2
        { id: 2,  x: 670, y: 260, tilt: -0.03 }, // Baris Atas 3
        { id: 3,  x: 840, y: 300, tilt:  0.07 }, // Baris Atas 4
        { id: 4,  x: 370, y: 390, tilt:  0.05 }, // Baris Tengah 1
        { id: 5,  x: 540, y: 390, tilt: -0.04 }, // Baris Tengah 2 (Pusat Potion)
        { id: 6,  x: 710, y: 380, tilt:  0.06 }, // Baris Tengah 3 (Pusat Harta)
        { id: 7,  x: 880, y: 410, tilt: -0.08 }, // Baris Tengah 4
        { id: 8,  x: 410, y: 500, tilt: -0.05 }, // Baris Bawah 1
        { id: 9,  x: 580, y: 490, tilt:  0.03 }, // Baris Bawah 2
        { id: 10, x: 750, y: 500, tilt: -0.04 }, // Baris Bawah 3
        { id: 11, x: 910, y: 520, tilt:  0.08 }  // Baris Bawah 4
    ];

    // ------------------------------------------------------------------------
    // GENERATOR STOK MALAM HARIAN (NIGHTLY RANDOM REFRESH)
    // ------------------------------------------------------------------------
    function getKarsoStockNightKey() {
        var day = 1;
        var isNight = isKarsoNightTime();
        if (typeof $gameVariables !== 'undefined') {
            day = $gameVariables.value(11) || 1; // Variable 11 = Day
        }
        return 'Day_' + day + '_' + (isNight ? 'Night' : 'Day');
    }

    function karsoShopTagged(note) {
        if (!note) return false;
        return /<\s*karso\s+shop\s*>/i.test(note);
    }

    function generateKarsoGoods(baseGoods) {
        var list = [];
        if (baseGoods && baseGoods.length > 0) {
            for (var b = 0; b < baseGoods.length; b++) {
                var g = baseGoods[b];
                var itemObj = null;
                if (g[0] === 0) itemObj = $dataItems[g[1]];
                else if (g[0] === 1) itemObj = $dataWeapons[g[1]];
                else if (g[0] === 2) itemObj = $dataArmors[g[1]];
                if (itemObj) {
                    list.push({
                        type: g[0],
                        id: g[1],
                        price: (g[2] === 0 && itemObj) ? itemObj.price : g[3],
                        item: itemObj
                    });
                }
            }
        }

        // Jika barang bawaan sedikit, lengkapi dengan barang bertag <karso shop>
        if (list.length < 12) {
            var pool = [];
            if (typeof $dataItems !== 'undefined') {
                for (var i = 1; i < $dataItems.length; i++) {
                    var it = $dataItems[i];
                    if (it && it.name && it.name.trim() !== '' && it.price > 0 && it.itypeId !== 2 && karsoShopTagged(it.note)) {
                        pool.push({ type: 0, id: it.id, price: it.price, item: it });
                    }
                }
            }
            if (typeof $dataWeapons !== 'undefined') {
                for (var w = 1; w < $dataWeapons.length; w++) {
                    var wp = $dataWeapons[w];
                    if (wp && wp.name && wp.name.trim() !== '' && wp.price > 0 && karsoShopTagged(wp.note)) {
                        pool.push({ type: 1, id: wp.id, price: wp.price, item: wp });
                    }
                }
            }
            if (typeof $dataArmors !== 'undefined') {
                for (var a = 1; a < $dataArmors.length; a++) {
                    var ar = $dataArmors[a];
                    if (ar && ar.name && ar.name.trim() !== '' && ar.price > 0 && karsoShopTagged(ar.note)) {
                        pool.push({ type: 2, id: ar.id, price: ar.price, item: ar });
                    }
                }
            }

            // Shuffle pool
            for (var p = pool.length - 1; p > 0; p--) {
                var j = Math.floor(Math.random() * (p + 1));
                var temp = pool[p];
                pool[p] = pool[j];
                pool[j] = temp;
            }

            for (var k = 0; k < pool.length && list.length < 12; k++) {
                var candidate = pool[k];
                var exists = false;
                for (var e = 0; e < list.length; e++) {
                    if (list[e].type === candidate.type && list[e].id === candidate.id) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    list.push(candidate);
                }
            }
        }

        // Pasangkan item ke 12 slot penyebaran matras dengan stok acak
        var stockSlots = [];
        for (var s = 0; s < list.length && s < SCATTER_SLOTS.length; s++) {
            var slotCoord = SCATTER_SLOTS[s];
            var it = list[s].item;

            // Stok acak per item yang dijual Mbah Karso (1 hingga 4 buah)
            var randStock = 1;
            if (list[s].type === 0) { // Item konsumsi / bahan / rajah
                randStock = Math.floor(Math.random() * 4) + 1; // 1 - 4 buah
            } else if (list[s].type === 2) { // Armor / Akik / Aksesoris
                randStock = Math.floor(Math.random() * 3) + 1; // 1 - 3 buah
            } else { // Senjata
                randStock = Math.floor(Math.random() * 2) + 1; // 1 - 2 buah
            }

            stockSlots.push({
                slotIndex: s,
                x: slotCoord.x,
                y: slotCoord.y,
                tilt: slotCoord.tilt,
                type: list[s].type,
                id: list[s].id,
                item: list[s].item,
                price: list[s].price,
                stock: randStock,
                sold: false
            });
        }

        return stockSlots;
    }

    // ------------------------------------------------------------------------
    // SCENE_KARSOSHOP: KELAS UTAMA TOKO MBAH KARSO
    // ------------------------------------------------------------------------
    function Scene_KarsoShop() {
        this.initialize.apply(this, arguments);
    }

    Scene_KarsoShop.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_KarsoShop.prototype.constructor = Scene_KarsoShop;

    Scene_KarsoShop.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
        this._goods = [];
        this._purchaseOnly = false;
        this._scatterGoods = [];
        this._selectedSlot = 0;
        this._mode = 'mat'; // 'mat' | 'detail' | 'inventory'
        this._invSlideState = 'closed'; // 'closed' | 'opening' | 'open' | 'closing'
        this._pulseTimer = 0;
        this._lampTimer = 0;
        this._lampJitter = 0;
        this._ribbonHovered = false;
        this._toastTimer = 0;
        this._toastText = '';
        this._invSlotIndex = 0;
        this._invPageIndex = 0;
        this._lastHoverSlot = -1;
        this._entranceTransition = true;
        this._entranceTimer = 0;
        this._exitTransition = false;
        this._exitTimer = 0;
        this._exitTransitionDone = false;
        this._detailSlideState = 'closed'; // 'closed' | 'opening' | 'open' | 'closing'
        this._detailSlideProgress = 0;
    };

    Scene_KarsoShop.prototype.prepare = function(goods, purchaseOnly) {
        this._goods = goods || [];
        this._purchaseOnly = purchaseOnly || false;
    };

    Scene_KarsoShop.prototype.attachSafeLoadListener = function(bitmap, key, callback) {
        if (!bitmap || bitmap.isReady() || bitmap.isError() || typeof bitmap.addLoadListener !== 'function') return;
        if (!bitmap._karsoLoadListeners) {
            bitmap._karsoLoadListeners = {};
        }
        if (bitmap._karsoLoadListeners[key]) return;
        bitmap._karsoLoadListeners[key] = true;

        var self = this;
        bitmap.addLoadListener(function() {
            setTimeout(function() {
                if (SceneManager._scene === self) {
                    try { callback.call(self); } catch(e) {}
                }
            }, 0);
        });
    };

    Scene_KarsoShop.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.preloadAssets();
        this.setupStock();
        this.createLayers();

        var itemSheet = typeof ImageManager.loadItemSheet === 'function' ? ImageManager.loadItemSheet() : null;
        if (itemSheet && !itemSheet.isReady()) {
            this.attachSafeLoadListener(itemSheet, 'create_itemSheet', this.refreshAll);
        }
        var skillSheet = typeof ImageManager.loadSkillSheet === 'function' ? ImageManager.loadSkillSheet() : null;
        if (skillSheet && !skillSheet.isReady()) {
            this.attachSafeLoadListener(skillSheet, 'create_skillSheet', this.refreshAll);
        }
        var iconSet = ImageManager.loadSystem('IconSet');
        if (iconSet && !iconSet.isReady()) {
            this.attachSafeLoadListener(iconSet, 'create_iconSet', this.refreshAll);
        }

        this.refreshAll();
        this.startEntranceTransition();
    };

    Scene_KarsoShop.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
        this.startEntranceTransition();
    };

    Scene_KarsoShop.prototype.preloadAssets = function() {
        // Preload agar seluruh halaman jurnal langsung tampil mulus tanpa kedip
        ImageManager.loadKarsoShop('ground');
        ImageManager.loadKarsoShop('sikil');
        ImageManager.loadKarsoShop('lamp');
        ImageManager.loadJournalMenu('Whole book');
        ImageManager.loadJournalMenu('Left page');
        ImageManager.loadJournalMenu('Item');
        ImageManager.loadJournalItem('Column_');
        ImageManager.loadJournalItem('Polaroid_');
        ImageManager.loadJournalItem('Description_');
        ImageManager.loadSystem('IconSet');
        if (typeof ImageManager.loadItemSheet === 'function') ImageManager.loadItemSheet();
        if (typeof ImageManager.loadSkillSheet === 'function') ImageManager.loadSkillSheet();
        if (typeof ImageManager.loadBasicSkillIcon === 'function') ImageManager.loadBasicSkillIcon();
    };

    Scene_KarsoShop.prototype.setupStock = function() {
        if (!$gameSystem) return;
        var currentKey = getKarsoStockNightKey();
        if ($gameSystem._karsoShopStockKey !== currentKey || !$gameSystem._karsoShopStock) {
            $gameSystem._karsoShopStockKey = currentKey;
            $gameSystem._karsoShopStock = generateKarsoGoods(this._goods);
        }
        this._scatterGoods = $gameSystem._karsoShopStock;
        if (this._selectedSlot >= this._scatterGoods.length) {
            this._selectedSlot = 0;
        }
    };

    // ------------------------------------------------------------------------
    // PEMBUATAN LAPISAN VISUAL (LAYERS)
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.createLayers = function() {
        this._root = new Sprite();
        this.addChild(this._root);

        // 1. Layer Dasar: ground.png & sikil.png
        this.createBackgroundLayer();

        // 2. Layer Item Berserakan di Matras
        this.createMatItemsLayer();

        // 3. Layer Reticle Seleksi Item di Matras
        this.createMatReticle();

        // 4. Layer Tabir Kegelapan Masuk Toko (Darkness Overlay)
        this.createDarknessLayer();

        // 5. Layer Lampu Sorot Malam Berkedip (lamp.png)
        this.createLampLayer();

        // 6. Layer Partikel Debu Mengambang di Bawah Sorotan Lampu (Dust Motes)
        this.createDustMotesLayer();

        // 7. Layer Percikan Filamen / Starter Spark (Lampu Melonjong di Pojok Kanan Atas)
        this.createFilamentSparkLayer();

        // 8. Layer HUD & Panduan Bawah
        this.createHudLayer();

        // 9. Layer Popup Tooltip Detail (Gaya Constellation)
        this.createPopupTooltipLayer();

        // 10. Layer Pita Inventori (Item.png) di Kanan Layar
        this.createInventoryRibbon();

        // 11. Layer Modal Detail Item Kertas (Left page.png + Polaroid_.png + Slide Bawah)
        this.createDetailModal();

        // 12. Layer Modal Buku Inventori (Whole book.png + Slide Right-to-Left)
        this.createInventoryBookModal();

        // 13. Layer Toast Notifikasi
        this.createToastSprite();
    };

    // 1. Background Layer (ground.png & sikil.png)
    Scene_KarsoShop.prototype.createBackgroundLayer = function() {
        this._groundSprite = new Sprite();
        this._groundSprite.bitmap = ImageManager.loadKarsoShop('ground');
        this._root.addChild(this._groundSprite);

        this._feetSprite = new Sprite();
        this._feetSprite.bitmap = ImageManager.loadKarsoShop('sikil');
        this._root.addChild(this._feetSprite);
    };

    // 2. Scattered Items on Mat
    Scene_KarsoShop.prototype.createMatItemsLayer = function() {
        this._matContainer = new Sprite();
        this._root.addChild(this._matContainer);
        this._matItemSprites = [];

        for (var i = 0; i < SCATTER_SLOTS.length; i++) {
            var itemHolder = new Sprite();
            itemHolder.anchor.x = 0.5;
            itemHolder.anchor.y = 0.5;
            itemHolder.bitmap = new Bitmap(96, 96);
            this._matContainer.addChild(itemHolder);
            this._matItemSprites.push(itemHolder);
        }
    };

    // 3. Mat Selection Reticle
    Scene_KarsoShop.prototype.createMatReticle = function() {
        this._matReticleSprite = new Sprite();
        this._matReticleSprite.bitmap = new Bitmap(104, 104);
        this._matReticleSprite.anchor.x = 0.5;
        this._matReticleSprite.anchor.y = 0.5;
        this.drawReticleGraphic(this._matReticleSprite.bitmap, 104, 104, '#fbbf24');
        this._root.addChild(this._matReticleSprite);
    };

    // 4. Tabir Kegelapan Masuk Toko (Pitch Black Room Overlay)
    Scene_KarsoShop.prototype.createDarknessLayer = function() {
        this._darknessSprite = new Sprite();
        this._darknessSprite.bitmap = new Bitmap(1280, 720);
        var ctx = this._darknessSprite.bitmap._context;
        ctx.fillStyle = '#060408';
        ctx.fillRect(0, 0, 1280, 720);
        this._darknessSprite.bitmap._setDirty();
        this._darknessSprite.opacity = 255;
        this._root.addChild(this._darknessSprite);
    };

    // 5. Lamp Layer (lamp.png) - Berpusat di Lampu Melonjong Pojok Kanan Atas (x: 1145, y: 95)
    Scene_KarsoShop.prototype.createLampLayer = function() {
        this._lampSprite = new Sprite();
        this._lampSprite.bitmap = ImageManager.loadKarsoShop('lamp');
        this._lampSprite.anchor.x = 1145 / 1280;
        this._lampSprite.anchor.y = 95 / 720;
        this._lampSprite.x = 1145;
        this._lampSprite.y = 95;
        this._lampSprite.blendMode = (typeof PIXI !== 'undefined' && PIXI.BLEND_MODES) ? PIXI.BLEND_MODES.SCREEN : 0;
        this._lampSprite.opacity = 0;
        this._root.addChild(this._lampSprite);
    };

    // 6. Layer Partikel Debu Mengambang di Bawah Sorotan Lampu (Atmospheric Dust Motes)
    Scene_KarsoShop.prototype.createDustMotesLayer = function() {
        this._dustContainer = new Sprite();
        this._root.addChild(this._dustContainer);

        var dotBmp = new Bitmap(8, 8);
        var dCtx = dotBmp._context;
        if (dCtx && typeof dCtx.createRadialGradient === 'function') {
            var grad = dCtx.createRadialGradient(4, 4, 0, 4, 4, 4);
            grad.addColorStop(0, 'rgba(255, 255, 230, 0.9)');
            grad.addColorStop(0.5, 'rgba(251, 191, 36, 0.45)');
            grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
            dCtx.fillStyle = grad;
            dCtx.beginPath();
            dCtx.arc(4, 4, 4, 0, Math.PI * 2);
            dCtx.fill();
            dotBmp._setDirty();
        }

        this._dustParticles = [];
        for (var i = 0; i < 14; i++) {
            var sp = new Sprite(dotBmp);
            sp.anchor.x = 0.5;
            sp.anchor.y = 0.5;
            sp.blendMode = (typeof PIXI !== 'undefined' && PIXI.BLEND_MODES) ? PIXI.BLEND_MODES.ADD : 0;
            this.resetDustParticle(sp, true);
            this._dustContainer.addChild(sp);
            this._dustParticles.push(sp);
        }
    };

    Scene_KarsoShop.prototype.resetDustParticle = function(sp, randomizeY) {
        sp.x = 650 + Math.random() * 550;
        sp.y = randomizeY ? (80 + Math.random() * 520) : (580 + Math.random() * 40);
        sp.vx = (Math.random() - 0.5) * 0.25;
        sp.vy = 0.2 + Math.random() * 0.35;
        sp.phase = Math.random() * Math.PI * 2;
        sp.scale.x = sp.scale.y = 0.7 + Math.random() * 0.8;
        sp.maxOpacity = 70 + Math.random() * 110;
        sp.opacity = randomizeY ? (Math.random() * sp.maxOpacity) : 0;
        sp.fadeIn = true;
    };

    Scene_KarsoShop.prototype.updateDustMotes = function() {
        if (!this._dustParticles || !this._dustContainer) return;
        if (this._entranceTransition && this._entranceTimer < 60) {
            this._dustContainer.visible = false;
            return;
        }
        if (this._exitTransition && this._exitTimer > 5) {
            this._dustContainer.visible = false;
            return;
        }
        this._dustContainer.visible = true;

        for (var i = 0; i < this._dustParticles.length; i++) {
            var p = this._dustParticles[i];
            p.phase += 0.02;
            p.x += Math.sin(p.phase) * 0.3 + p.vx;
            p.y -= p.vy;

            if (p.fadeIn) {
                p.opacity += 2;
                if (p.opacity >= p.maxOpacity) p.fadeIn = false;
            } else {
                p.opacity -= 0.6;
                if (p.opacity <= 0 || p.y < 80 || p.x < 600 || p.x > 1240) {
                    this.resetDustParticle(p, false);
                }
            }
        }
    };

    // 7. Percikan Filamen / Starter Spark Layer (Lampu Melonjong di Pojok Kanan Atas)
    Scene_KarsoShop.prototype.createFilamentSparkLayer = function() {
        this._sparkSprite = new Sprite();
        var sw = 360;
        var sh = 260;
        this._sparkSprite.bitmap = new Bitmap(sw, sh);
        this._sparkSprite.anchor.x = 0.5;
        this._sparkSprite.anchor.y = 0.5;
        this._sparkSprite.x = 1145; // Tepat pada lampu melonjong di pojok kanan atas
        this._sparkSprite.y = 95;
        this._sparkSprite.blendMode = (typeof PIXI !== 'undefined' && PIXI.BLEND_MODES) ? PIXI.BLEND_MODES.ADD : 0;

        var ctx = this._sparkSprite.bitmap._context;
        ctx.save();
        if (typeof ctx.translate === 'function' && typeof ctx.scale === 'function') {
            ctx.translate(sw / 2, sh / 2);
            // Pendaran melonjong (oval) mengikuti fisik lampu gantung
            ctx.scale(1.35, 0.9);

            var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 110);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            grad.addColorStop(0.2, 'rgba(254, 240, 138, 0.95)');
            grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.45)');
            grad.addColorStop(1, 'rgba(217, 119, 6, 0.0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, 110, 0, Math.PI * 2);
            ctx.fill();
        } else {
            var grad = ctx.createRadialGradient(sw / 2, sh / 2, 0, sw / 2, sh / 2, 110);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            grad.addColorStop(0.2, 'rgba(254, 240, 138, 0.95)');
            grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.45)');
            grad.addColorStop(1, 'rgba(217, 119, 6, 0.0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(sw / 2, sh / 2, 110, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        this._sparkSprite.bitmap._setDirty();
        this._sparkSprite.opacity = 0;
        this._root.addChild(this._sparkSprite);
    };

    // 8. HUD Layer (Gold & Time Status & Footer)
    Scene_KarsoShop.prototype.createHudLayer = function() {
        // Gold Panel (Kiri Atas)
        this._goldSprite = new Sprite();
        this._goldSprite.x = 24;
        this._goldSprite.y = 20;
        this._goldSprite.bitmap = new Bitmap(320, 60);
        this._root.addChild(this._goldSprite);

        // Footer Navigation Guide (Bawah)
        this._footerSprite = new Sprite();
        this._footerSprite.y = 672;
        this._footerSprite.bitmap = new Bitmap(1280, 48);
        this._root.addChild(this._footerSprite);
    };

    // 9. Popup Tooltip (340x175)
    Scene_KarsoShop.prototype.createPopupTooltipLayer = function() {
        this._popupSprite = new Sprite();
        this._popupSprite.bitmap = new Bitmap(340, 175);
        this._popupSprite.visible = false;
        this._root.addChild(this._popupSprite);
    };

    // 10. Inventory Ribbon (Item.png) di Kanan Layar Matras
    Scene_KarsoShop.prototype.createInventoryRibbon = function() {
        this._ribbonContainer = new Sprite();
        this._ribbonContainer.x = 1220; // Default posisi peeking di tepi kanan
        this._ribbonContainer.y = 150;
        this._root.addChild(this._ribbonContainer);

        this._ribbonSprite = new Sprite();
        this._ribbonSprite.bitmap = ImageManager.loadJournalMenu('Item');
        this._ribbonContainer.addChild(this._ribbonSprite);

        // Label Tag di bawah pita
        this._ribbonTagSprite = new Sprite();
        this._ribbonTagSprite.bitmap = new Bitmap(140, 32);
        this._ribbonTagSprite.x = -80;
        this._ribbonTagSprite.y = 120;
        this._ribbonContainer.addChild(this._ribbonTagSprite);
        this.drawRibbonTag();
    };

    // 11. Detail Modal Pembelian (Left page.png + Polaroid_.png + Slide Bawah-ke-Atas)
    Scene_KarsoShop.prototype.createDetailModal = function() {
        this._detailModal = new Sprite();
        this._detailModal.visible = false;
        this._root.addChild(this._detailModal);

        // Dark dim backdrop
        this._detailBackdrop = new Sprite();
        this._detailBackdrop.bitmap = new Bitmap(1280, 720);
        var bCtx = this._detailBackdrop.bitmap._context;
        bCtx.fillStyle = 'rgba(10, 8, 14, 0.72)';
        bCtx.fillRect(0, 0, 1280, 720);
        this._detailBackdrop.bitmap._setDirty();
        this._detailBackdrop.opacity = 0;
        this._detailModal.addChild(this._detailBackdrop);

        // Kontainer Lembar Kertas yang Meluncur dari Bawah (y: 720 -> y: 26)
        this._detailSheetContainer = new Sprite();
        this._detailSheetContainer.x = 386;
        this._detailSheetContainer.y = 720;
        this._detailModal.addChild(this._detailSheetContainer);

        // Kertas Kiri Buku (508 x 668)
        this._detailPageSprite = new Sprite();
        this._detailPageSprite.bitmap = ImageManager.loadJournalMenu('Left page');
        this._detailPageSprite.x = 0;
        this._detailPageSprite.y = 0;
        this._detailSheetContainer.addChild(this._detailPageSprite);

        // Konten Halaman Detail Kertas
        this._detailContentSprite = new Sprite();
        this._detailContentSprite.x = 0;
        this._detailContentSprite.y = 0;
        this._detailContentSprite.bitmap = new Bitmap(508, 668);
        this._detailSheetContainer.addChild(this._detailContentSprite);
    };

    // 9. Inventory Book Modal (Whole book.png + Slide Kanan-ke-Kiri + Pixel-Perfect Journal Layout)
    Scene_KarsoShop.prototype.createInventoryBookModal = function() {
        this._invBookModal = new Sprite();
        this._invBookModal.visible = false;
        this._root.addChild(this._invBookModal);

        // Backdrop Gelap
        this._invBackdrop = new Sprite();
        this._invBackdrop.bitmap = new Bitmap(1280, 720);
        var bCtx = this._invBackdrop.bitmap._context;
        bCtx.fillStyle = 'rgba(10, 8, 14, 0.72)';
        bCtx.fillRect(0, 0, 1280, 720);
        this._invBackdrop.bitmap._setDirty();
        this._invBackdrop.opacity = 0;
        this._invBookModal.addChild(this._invBackdrop);

        // Kontainer Buku Penuh (1280 x 720) yang meluncur dari x=1280 ke x=0
        this._invBookContainer = new Sprite();
        this._invBookContainer.x = 1280; // Posisi awal offscreen di kanan
        this._invBookContainer.y = 0;
        this._invBookModal.addChild(this._invBookContainer);

        // Layer 2: Whole book.png base (1280 x 720)
        this._invWholeBook = new Sprite();
        this._invWholeBook.bitmap = ImageManager.loadJournalMenu('Whole book');
        this._invBookContainer.addChild(this._invWholeBook);

        // Layer 3: Satu-satunya Pita Bookmark: Item.png di sisi kiri buku (x: 15, y: 122)
        // Terselip di bawah Left page.png persis seperti Tab 1 di Scene_StatusJournal
        this._invSingleRibbon = new Sprite();
        this._invSingleRibbon.bitmap = ImageManager.loadJournalMenu('Item');
        this._invSingleRibbon.x = 15;
        this._invSingleRibbon.y = 122;
        this._invBookContainer.addChild(this._invSingleRibbon);

        // Layer 4: Left page.png solid pembatas di x: 239, y: 21 (508 x 668)
        this._invLeftPageBase = new Sprite();
        this._invLeftPageBase.bitmap = ImageManager.loadJournalMenu('Left page');
        this._invLeftPageBase.x = 239;
        this._invLeftPageBase.y = 21;
        this._invBookContainer.addChild(this._invLeftPageBase);

        // Layer 5: Konten Halaman Kiri (Grid 24 Slot Column_.png, Reticle, & Pagination)
        this._invLeftPageContainer = new Sprite();
        this._invLeftPageContainer.x = 239;
        this._invLeftPageContainer.y = 21;
        this._invBookContainer.addChild(this._invLeftPageContainer);

        this._invSlotsSprite = new Sprite();
        this._invSlotsSprite.bitmap = new Bitmap(508, 668);
        this._invLeftPageContainer.addChild(this._invSlotsSprite);

        // Reticle Kursor Magenta Slot Inventori (104 x 100)
        this._invReticleSprite = new Sprite();
        this._invReticleSprite.bitmap = new Bitmap(104, 100);
        this._invReticleSprite.anchor.x = 0.5;
        this._invReticleSprite.anchor.y = 0.5;
        this.drawReticleGraphic(this._invReticleSprite.bitmap, 104, 100, '#ec4899');
        this._invLeftPageContainer.addChild(this._invReticleSprite);

        // Indikator Navigasi Halaman (◄ Q  Halaman X / Y  W ▶)
        this._invPageNavSprite = new Sprite();
        this._invPageNavSprite.bitmap = new Bitmap(508, 32);
        this._invPageNavSprite.y = 626;
        this._invLeftPageContainer.addChild(this._invPageNavSprite);

        // Layer 6: Konten Halaman Kanan (Polaroid Miring, Lore & Info Jual Barang)
        this._invRightPageContainer = new Sprite();
        this._invRightPageContainer.x = 746;
        this._invRightPageContainer.y = 23;
        this._invBookContainer.addChild(this._invRightPageContainer);

        // Kontainer Polaroid Miring (-8.5°)
        this._invPolaroidContainer = new Sprite();
        this._invPolaroidContainer.x = 142;
        this._invPolaroidContainer.y = 127;
        this._invPolaroidContainer.rotation = -0.148;
        this._invRightPageContainer.addChild(this._invPolaroidContainer);

        this._invPolaroidSprite = new Sprite();
        this._invPolaroidSprite.bitmap = ImageManager.loadJournalItem('Polaroid_');
        this._invPolaroidSprite.anchor.x = 0.5;
        this._invPolaroidSprite.anchor.y = 0.5;
        this._invPolaroidContainer.addChild(this._invPolaroidSprite);

        this._invPolaroidArtSprite = new Sprite();
        this._invPolaroidArtSprite.bitmap = new Bitmap(233, 257);
        this._invPolaroidArtSprite.anchor.x = 0.5;
        this._invPolaroidArtSprite.anchor.y = 0.5;
        this._invPolaroidContainer.addChild(this._invPolaroidArtSprite);

        // Judul, Kategori & Subteks (Samping Polaroid)
        this._invTitleSprite = new Sprite();
        this._invTitleSprite.bitmap = new Bitmap(240, 200);
        this._invTitleSprite.x = 277;
        this._invTitleSprite.y = 0;
        this._invRightPageContainer.addChild(this._invTitleSprite);

        // Kertas Catatan Bergaris Description_.png (508 x 355) di x: 0, y: 214
        this._invDescPaperSprite = new Sprite();
        this._invDescPaperSprite.bitmap = ImageManager.loadJournalItem('Description_');
        this._invDescPaperSprite.x = 0;
        this._invDescPaperSprite.y = 214;
        this._invRightPageContainer.addChild(this._invDescPaperSprite);

        // Teks Deskripsi Lore & Tombol Jual
        this._invDescTextSprite = new Sprite();
        this._invDescTextSprite.bitmap = new Bitmap(508, 355);
        this._invDescTextSprite.x = 0;
        this._invDescTextSprite.y = 214;
        this._invRightPageContainer.addChild(this._invDescTextSprite);
    };

    // 10. Toast Notification
    Scene_KarsoShop.prototype.createToastSprite = function() {
        this._toastSprite = new Sprite();
        this._toastSprite.bitmap = new Bitmap(450, 48);
        this._toastSprite.anchor.x = 0.5;
        this._toastSprite.anchor.y = 0.5;
        this._toastSprite.x = 640;
        this._toastSprite.y = 70;
        this._toastSprite.opacity = 0;
        this._root.addChild(this._toastSprite);
    };

    // ------------------------------------------------------------------------
    // MENGGAMBAR ELEMEN RETICLE & GRAFIS
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.drawReticleGraphic = function(bitmap, w, h, color) {
        var ctx = bitmap._context;
        bitmap.clear();
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        var arm = 18;
        var pad = 4;

        // Kiri-Atas
        ctx.beginPath();
        ctx.moveTo(pad, pad + arm); ctx.lineTo(pad, pad); ctx.lineTo(pad + arm, pad);
        // Kanan-Atas
        ctx.moveTo(w - pad - arm, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + arm);
        // Kiri-Bawah
        ctx.moveTo(pad, h - pad - arm); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + arm, h - pad);
        // Kanan-Bawah
        ctx.moveTo(w - pad - arm, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad - arm);
        ctx.stroke();

        ctx.restore();
        bitmap._setDirty();
    };

    Scene_KarsoShop.prototype.drawRibbonTag = function() {
        var bmp = this._ribbonTagSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();
        ctx.fillStyle = 'rgba(20, 16, 22, 0.85)';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1;
        ctx.fillRect(0, 0, 140, 28);
        ctx.strokeRect(0.5, 0.5, 139, 27);

        ctx.font = 'bold 12px GameFont, sans-serif';
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'center';
        ctx.fillText('INVENTORY [TAB]', 70, 18);
        ctx.restore();
        bmp._setDirty();
    };

    // ------------------------------------------------------------------------
    // PENGGAMBARAN ELEMEN MATRAS, ITEM & HUD LENGKAP
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.refreshAll = function() {
        this.drawHud();
        this.drawMatItems();
        this.updateReticlePosition();
        this.updatePopupTooltip();
    };

    Scene_KarsoShop.prototype.drawHud = function() {
        // 1. Gold Box (Kiri Atas)
        var gBmp = this._goldSprite.bitmap;
        gBmp.clear();
        var gCtx = gBmp._context;
        gCtx.save();
        gCtx.fillStyle = 'rgba(24, 18, 22, 0.9)';
        gCtx.strokeStyle = '#d4af37';
        gCtx.lineWidth = 1.5;
        gCtx.fillRect(0, 0, 260, 48);
        gCtx.strokeRect(0.5, 0.5, 259, 47);

        var isNight = isKarsoNightTime();
        gCtx.font = 'bold 13px GameFont, sans-serif';
        gCtx.fillStyle = isNight ? '#a78bfa' : '#38bdf8';
        gCtx.textAlign = 'left';
        gCtx.fillText(isNight ? '🌙 Malam Hari (Toko Mbah Karso)' : '☀️ Siang Hari (Toko Mbah Karso)', 12, 18);

        gCtx.font = 'bold 18px GameFont, sans-serif';
        gCtx.fillStyle = '#fbbf24';
        gCtx.fillText('💰 Gold: ' + (typeof $gameParty !== 'undefined' ? $gameParty.gold() : 0) + ' G', 12, 40);
        gCtx.restore();
        gBmp._setDirty();

        // 2. Footer Guide (Bawah)
        var fBmp = this._footerSprite.bitmap;
        fBmp.clear();
        var fCtx = fBmp._context;
        fCtx.save();
        fCtx.fillStyle = 'rgba(15, 12, 18, 0.82)';
        fCtx.fillRect(0, 0, 1280, 48);
        fCtx.strokeStyle = 'rgba(217, 180, 130, 0.4)';
        fCtx.beginPath();
        fCtx.moveTo(0, 0); fCtx.lineTo(1280, 0);
        fCtx.stroke();

        fCtx.font = 'bold 14px GameFont, sans-serif';
        fCtx.fillStyle = '#fef3c7';
        fCtx.textAlign = 'center';
        if (this._mode === 'mat') {
            fCtx.fillText('◄▲▼► Pilih Item  |  [ENTER] Lihat Detail / Beli  |  [TAB] Buka Inventory / Jual  |  [ESC] Keluar Toko', 640, 28);
        } else if (this._mode === 'detail') {
            fCtx.fillText('[ENTER] Konfirmasi Beli Barang  |  [ESC] Kembali ke Matras', 640, 28);
        } else if (this._mode === 'inventory') {
            fCtx.fillText('◄▲▼► Pilih Barang  |  [Q / W] Halaman  |  [ENTER] Jual Barang  |  [ESC / TAB] Kembali ke Toko', 640, 28);
        }
        fCtx.restore();
        fBmp._setDirty();
    };

    Scene_KarsoShop.prototype.drawMatItems = function() {
        var iconSet = ImageManager.loadSystem('IconSet');
        var iconImg = iconSet ? (iconSet._canvas || iconSet._image) : null;
        if (iconSet && !iconSet.isReady()) {
            this.attachSafeLoadListener(iconSet, 'mat_iconSet', this.drawMatItems);
        }
        var itemSheet = typeof ImageManager.loadItemSheet === 'function' ? ImageManager.loadItemSheet() : null;
        if (itemSheet && !itemSheet.isReady()) {
            this.attachSafeLoadListener(itemSheet, 'mat_itemSheet', this.drawMatItems);
        }
        var skillSheet = typeof ImageManager.loadSkillSheet === 'function' ? ImageManager.loadSkillSheet() : null;
        if (skillSheet && !skillSheet.isReady()) {
            this.attachSafeLoadListener(skillSheet, 'mat_skillSheet', this.drawMatItems);
        }

        for (var i = 0; i < SCATTER_SLOTS.length; i++) {
            var holder = this._matItemSprites[i];
            if (!holder) continue;
            var g = this._scatterGoods[i];
            holder.x = SCATTER_SLOTS[i].x;
            holder.y = SCATTER_SLOTS[i].y;
            holder.rotation = SCATTER_SLOTS[i].tilt;

            var bmp = holder.bitmap;
            bmp.clear();
            var ctx = bmp._context;

            if (!g || g.sold || !g.item || (g.stock !== undefined && g.stock <= 0)) {
                holder.visible = false;
                continue;
            }

            holder.visible = true;
            ctx.save();

            // A. Bayangan Kontak Tanah / Matras (Soft Contact Shadow)
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            if (ctx.ellipse) {
                ctx.ellipse(48, 70, 32, 14, 0, 0, Math.PI * 2);
            } else {
                ctx.arc(48, 70, 24, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.restore();

            // B. Gambar Ikon Item (Ukuran 64x64 pixel-perfect)
            var it = g.item;
            var drawn = false;

            if (typeof ImageManager.drawSkillIcon === 'function' && (it.customIcon || it.skillIconIndex !== undefined || it.itemIconIndex !== undefined)) {
                drawn = ImageManager.drawSkillIcon(bmp, it, 16, 10, 64, 64, this.drawMatItems.bind(this));
            }

            if (!drawn && it.iconIndex > 0) {
                if (iconImg && iconSet && iconSet.isReady()) {
                    var sx = (it.iconIndex % 16) * 32;
                    var sy = Math.floor(it.iconIndex / 16) * 32;
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(iconImg, sx, sy, 32, 32, 16, 10, 64, 64);
                    drawn = true;
                } else if (iconSet && !iconSet.isReady()) {
                    this.attachSafeLoadListener(iconSet, 'mat_iconSet', this.drawMatItems);
                }
            }

            // C. Badge Parameter Jumlah Stok Item di Sisi Bawah Kiri Pojok Item (Acak & Berkurang saat Dibeli)
            var curStock = (g.stock !== undefined) ? g.stock : 1;
            if (curStock > 0) {
                ctx.save();
                var badgeX = 14;
                var badgeY = 56;
                var stockText = curStock > 99 ? '99+' : (curStock + 'x');
                ctx.font = 'bold 11px GameFont, sans-serif';
                var textW = ctx.measureText(stockText).width;
                var badgeW = Math.max(22, Math.round(textW + 8));
                var badgeH = 16;

                // Soft shadow badge
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 1;

                // Background pill gelap berbingkai emas
                ctx.fillStyle = 'rgba(24, 15, 8, 0.92)';
                ctx.beginPath();
                drawSafeRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 4);
                ctx.fill();

                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.shadowColor = 'transparent';
                // Teks jumlah stok
                ctx.textAlign = 'center';
                ctx.fillStyle = '#fef3c7';
                ctx.fillText(stockText, badgeX + badgeW / 2, badgeY + 12);
                ctx.restore();
            }

            // D. Label Harga Kecil di Bawah Ikon
            ctx.font = 'bold 12px GameFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000000';
            ctx.fillText(g.price + ' G', 48 + 1, 86 + 1);
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(g.price + ' G', 48, 86);

            ctx.restore();
            bmp._setDirty();
        }
    };

    Scene_KarsoShop.prototype.updateReticlePosition = function() {
        if (!this._matReticleSprite) return;
        if (this._mode !== 'mat') {
            this._matReticleSprite.visible = false;
            return;
        }

        var cur = this._scatterGoods[this._selectedSlot];
        if (cur && !cur.sold) {
            this._matReticleSprite.x = cur.x;
            var targetSp = (this._matItemSprites && this._matItemSprites[this._selectedSlot]) ? this._matItemSprites[this._selectedSlot] : null;
            this._matReticleSprite.y = targetSp ? targetSp.y : cur.y;
            this._matReticleSprite.visible = true;
        } else {
            this._matReticleSprite.visible = false;
        }
    };

    // ------------------------------------------------------------------------
    // POPUP TOOLTIP GAYA CONSTELLATION UNTUK ITEM BERSERAKAN
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.updatePopupTooltip = function() {
        if (!this._popupSprite) return;
        if (this._mode !== 'mat') {
            this._popupSprite.visible = false;
            return;
        }

        var cur = this._scatterGoods[this._selectedSlot];
        if (!cur || cur.sold || !cur.item) {
            this._popupSprite.visible = false;
            return;
        }

        var item = cur.item;
        var bmp = this._popupSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = bmp.width;
        var h = bmp.height;

        ctx.save();
        // 1. Card Background & Elegant Border
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(22, 17, 21, 0.96)';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;

        var r = 8;
        ctx.beginPath();
        ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
        ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h); ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(3, 3, w - 6, h - 6);

        // 2. Category Badge (Kanan Atas)
        var catName = 'Barang';
        var catColor = '#10b981';
        if (cur.type === 1) { catName = 'Senjata'; catColor = '#ef4444'; }
        else if (cur.type === 2) { catName = 'Armor'; catColor = '#3b82f6'; }
        else if (item.consumable) { catName = 'Konsumsi'; catColor = '#10b981'; }
        else if (item.itypeId === 2) { catName = 'Barang Penting'; catColor = '#f59e0b'; }

        ctx.font = 'bold 11px GameFont, sans-serif';
        var pillW = Math.max(68, ctx.measureText(catName).width + 16);
        var pillX = w - 14 - pillW;
        var pillY = 10;
        var pillH = 22;

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.strokeStyle = catColor;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(pillX, pillY, pillW, pillH);
        ctx.fillRect(pillX, pillY, pillW, pillH);

        ctx.fillStyle = catColor;
        ctx.textAlign = 'center';
        ctx.fillText(catName, pillX + pillW / 2, pillY + 15);

        // 3. Nama Item (Kiri Atas)
        ctx.font = 'bold 17px GameFont, sans-serif';
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'left';
        var maxNW = pillX - 24;
        var nText = item.name || 'Barang';
        if (ctx.measureText(nText).width > maxNW) {
            while (nText.length > 3 && ctx.measureText(nText + '...').width > maxNW) {
                nText = nText.slice(0, -1);
            }
            nText += '...';
        }
        ctx.fillText(nText, 14, 26);

        // 4. Harga & Kepemilikan (Baris 2)
        ctx.font = 'bold 13px GameFont, sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('Harga: ' + cur.price + ' Gold', 14, 48);

        var partyQty = typeof $gameParty !== 'undefined' ? $gameParty.numItems(item) : 0;
        var karsoStock = (cur.stock !== undefined) ? cur.stock : 1;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('•  Dimiliki: ' + partyQty + ' buah', 130, 48);
        ctx.fillStyle = '#fef08a';
        ctx.fillText('•  Stok Karso: ' + karsoStock + 'x', 248, 48);

        // Divider
        ctx.strokeStyle = 'rgba(217, 180, 130, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(14, 58); ctx.lineTo(w - 14, 58);
        ctx.stroke();

        // 5. Deskripsi Item (Word Wrap)
        ctx.font = '13px GameFont, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        var desc = (item.description || 'Barang dagangan khusus milik Mbah Karso.').trim();
        var words = desc.split(' ');
        var line = '';
        var lineY = 78;
        var lineH = 18;
        var maxLineW = w - 28;

        for (var wi = 0; wi < words.length; wi++) {
            var tLine = line + (line ? ' ' : '') + words[wi];
            if (ctx.measureText(tLine).width > maxLineW && line) {
                ctx.fillText(line, 14, lineY);
                line = words[wi];
                lineY += lineH;
                if (lineY > h - 35) break;
            } else {
                line = tLine;
            }
        }
        if (line && lineY <= h - 30) {
            ctx.fillText(line, 14, lineY);
        }

        // 6. Action Tip di Bawah
        ctx.font = 'bold 11px GameFont, sans-serif';
        ctx.fillStyle = '#93c5fd';
        ctx.fillText('Tekan [ENTER] untuk melihat detail & beli', 14, h - 14);

        ctx.restore();
        bmp._setDirty();

        // Penempatan Cerdas Dinamis: Di samping item agar tidak menutupi barang
        var popW = 340;
        var popH = 175;
        var targetX = 0;
        var targetY = cur.y - popH / 2;

        if (cur.x <= 640) {
            targetX = cur.x + 55;
        } else {
            targetX = cur.x - popW - 55;
        }

        targetX = Math.max(20, Math.min(1280 - popW - 20, targetX));
        targetY = Math.max(30, Math.min(660 - popH, targetY));

        this._popupSprite.x = targetX;
        this._popupSprite.y = targetY;
        this._popupSprite.visible = true;
    };

    // ------------------------------------------------------------------------
    // DETAIL MODAL (LEMBAR KERTAS PEMBELIAN BARANG & ANIMASI SLIDE DARI BAWAH)
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.openDetailModal = function() {
        var cur = this._scatterGoods[this._selectedSlot];
        if (!cur || cur.sold || !cur.item) return;

        // Suara kertas membuka / membalik lembaran
        this.playTransitionSe('Book1', 90, 105);

        this._mode = 'detail';
        this._detailSlideState = 'opening';
        this._detailModal.visible = true;
        this._popupSprite.visible = false;
        this._matReticleSprite.visible = false;
        this._buyQuantity = 1;

        // Mulai meluncur dari bawah layar (y: 720) dengan sedikit kemiringan kertas alami
        if (this._detailSheetContainer) {
            this._detailSheetContainer.y = 720;
            this._detailSheetContainer.rotation = -0.025;
        }
        if (this._detailBackdrop) this._detailBackdrop.opacity = 0;

        this.drawDetailSheet(cur);
        this.drawHud();
    };

    Scene_KarsoShop.prototype.closeDetailModal = function() {
        if (this._detailSlideState === 'closing' || this._detailSlideState === 'closed') return;
        // Suara kertas meluncur kembali / ditutup
        this.playTransitionSe('Book2', 80, 95);
        this._detailSlideState = 'closing';
    };

    Scene_KarsoShop.prototype.updateDetailSlide = function() {
        if (!this._detailModal || !this._detailModal.visible || !this._detailSheetContainer) return;

        var targetY = 26;
        var startY = 720;

        if (this._detailSlideState === 'opening') {
            var dy = targetY - this._detailSheetContainer.y;
            if (Math.abs(dy) > 2) {
                this._detailSheetContainer.y += dy * 0.24;
                this._detailSheetContainer.rotation += (0.0 - this._detailSheetContainer.rotation) * 0.24;
                var progress = 1 - (this._detailSheetContainer.y - targetY) / (startY - targetY);
                if (this._detailBackdrop) {
                    this._detailBackdrop.opacity = Math.max(0, Math.min(200, Math.round(progress * 200)));
                }
            } else {
                this._detailSheetContainer.y = targetY;
                this._detailSheetContainer.rotation = 0;
                if (this._detailBackdrop) this._detailBackdrop.opacity = 200;
                this._detailSlideState = 'open';
            }
        } else if (this._detailSlideState === 'closing') {
            var dy = startY - this._detailSheetContainer.y;
            if (Math.abs(dy) > 2.0 && this._detailSheetContainer.y < startY - 2) {
                var step = Math.max(16, dy * 0.24);
                this._detailSheetContainer.y += step;
                this._detailSheetContainer.rotation += (-0.025 - this._detailSheetContainer.rotation) * 0.2;
                var progress = 1 - (this._detailSheetContainer.y - targetY) / (startY - targetY);
                if (this._detailBackdrop) {
                    this._detailBackdrop.opacity = Math.max(0, Math.min(200, Math.round(progress * 200)));
                }
            } else {
                this._detailSheetContainer.y = startY;
                this._detailSheetContainer.rotation = 0;
                if (this._detailBackdrop) this._detailBackdrop.opacity = 0;
                this._detailSlideState = 'closed';
                this._detailModal.visible = false;
                this._mode = 'mat';

                // Jika slot saat ini sudah terbeli/terjual, alihkan ke item berikutnya yang tersedia
                if (this._scatterGoods && this._scatterGoods[this._selectedSlot] && this._scatterGoods[this._selectedSlot].sold) {
                    var nextIdx = -1;
                    for (var si = 0; si < this._scatterGoods.length; si++) {
                        if (this._scatterGoods[si] && !this._scatterGoods[si].sold && this._scatterGoods[si].item) {
                            nextIdx = si;
                            break;
                        }
                    }
                    if (nextIdx !== -1) {
                        this._selectedSlot = nextIdx;
                    }
                }

                this.drawHud();
                this.updateReticlePosition();
                this.updatePopupTooltip();
            }
        }
    };

    Scene_KarsoShop.prototype.drawDetailSheet = function(stockItem) {
        var item = stockItem.item;
        var bmp = this._detailContentSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();

        var polBmp = ImageManager.loadJournalItem('Polaroid_');
        var polImg = polBmp ? (polBmp._canvas || polBmp._image) : null;
        var iconSet = ImageManager.loadSystem('IconSet');
        var iconImg = iconSet ? (iconSet._canvas || iconSet._image) : null;

        // 1. Gambar Bingkai Polaroid_.png di Sudut Kiri Atas Kertas (x: 28, y: 32)
        var px = 28;
        var py = 32;
        var pw = 210;
        var ph = 232;

        if (polBmp && polBmp.isReady() && polImg) {
            ctx.drawImage(polImg, px, py, pw, ph);
        } else if (polBmp && !polBmp.isReady()) {
            polBmp.addLoadListener(function() {
                if (this._mode === 'detail') this.drawDetailSheet(stockItem);
            }.bind(this));
        }

        // Latar gelap foto Polaroid
        ctx.fillStyle = '#261b24';
        ctx.fillRect(px + 14, py + 11, 182, 168);

        // Gambar Foto / Ikon Besar Item di Tengah Polaroid (130x130)
        var iconSize = 130;
        var ix = px + 14 + Math.round((182 - iconSize) / 2);
        var iy = py + 11 + Math.round((168 - iconSize) / 2);

        var self = this;
        var onDetailReady = function() {
            if (self._mode === 'detail' && self._selectedSlot !== undefined) {
                self.drawDetailSheet(self._scatterGoods[self._selectedSlot]);
            }
        };

        var drawn = false;
        if (typeof ImageManager.drawSkillIcon === 'function' && (item.customIcon || item.skillIconIndex !== undefined || item.itemIconIndex !== undefined)) {
            drawn = ImageManager.drawSkillIcon(bmp, item, ix, iy, iconSize, iconSize, onDetailReady);
        }
        if (!drawn && item.iconIndex > 0 && item.iconIndex !== 1) {
            if (iconImg && iconSet && iconSet.isReady()) {
                var sx = (item.iconIndex % 16) * 32;
                var sy = Math.floor(item.iconIndex / 16) * 32;
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(iconImg, sx, sy, 32, 32, ix, iy, iconSize, iconSize);
            } else if (iconSet && !iconSet.isReady()) {
                this.attachSafeLoadListener(iconSet, 'detail_iconSet', onDetailReady);
            }
        }

        // Label di bawah foto di dalam Polaroid
        var catName = 'Barang Konsumsi';
        if (stockItem.type === 1) catName = 'Senjata Jiwa';
        else if (stockItem.type === 2) catName = 'Pelindung / Armor';
        else if (item.itypeId === 2) catName = 'Barang Misterius';

        ctx.font = 'bold 12px GameFont, sans-serif';
        ctx.fillStyle = '#4a2c1d';
        ctx.textAlign = 'center';
        ctx.fillText(catName, px + pw / 2, py + 210);

        // 2. Info Kanan Polaroid (Nama, Harga, Kepemilikan, Sisa Uang)
        var rx = 256;
        var ry = 50;

        ctx.textAlign = 'left';
        ctx.font = 'bold 22px GameFont, sans-serif';
        ctx.fillStyle = '#2c1810';
        ctx.fillText(item.name || 'Barang', rx, ry);

        ctx.font = 'bold 18px GameFont, sans-serif';
        ctx.fillStyle = '#b45309';
        var curStockInfo = (stockItem.stock !== undefined) ? stockItem.stock : 1;
        ctx.fillText('Harga: ' + stockItem.price + ' Gold   •   Tersedia: ' + curStockInfo + ' buah', rx, ry + 36);

        var partyGold = typeof $gameParty !== 'undefined' ? $gameParty.gold() : 0;
        ctx.font = '14px GameFont, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.fillText('Uang Anda: ' + partyGold + ' G', rx, ry + 66);

        var owned = 0;
        if (typeof $gameParty !== 'undefined' && item) {
            if (typeof $gameParty.numIndependentItems === 'function' && DataManager.isIndependent(item)) {
                owned = $gameParty.numIndependentItems(item);
            } else if (typeof $gameParty.numItems === 'function') {
                owned = $gameParty.numItems(item);
            }
        }
        ctx.fillText('Dimiliki: ' + owned + ' buah', rx, ry + 92);

        // 3. Catatan Lore & Statistik di Atas Garis Kertas (Lined Paper)
        var bodyY = 295;
        ctx.strokeStyle = 'rgba(74, 44, 29, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(35, bodyY); ctx.lineTo(470, bodyY);
        ctx.stroke();

        ctx.font = 'bold 15px GameFont, sans-serif';
        ctx.fillStyle = '#4a2c1d';
        ctx.fillText('— CATATAN & KHASIAT BARANG —', 35, bodyY + 24);

        var statY = bodyY + 50;
        if (stockItem.type === 1 || stockItem.type === 2) {
            var params = [];
            var paramNames = ['MHP', 'MMP', 'ATK', 'DEF', 'MAT', 'MDF', 'AGI', 'LUK'];
            for (var pi = 0; pi < 8; pi++) {
                if (item.params && item.params[pi] !== 0) {
                    params.push(paramNames[pi] + ' ' + (item.params[pi] > 0 ? '+' : '') + item.params[pi]);
                }
            }
            if (params.length > 0) {
                ctx.font = 'bold 14px GameFont, sans-serif';
                ctx.fillStyle = '#1e3a8a';
                ctx.fillText('Bonus Stat: ' + params.join('  •  '), 35, statY);
                statY += 26;
            }
        }

        ctx.font = '14px GameFont, sans-serif';
        ctx.fillStyle = '#1f2937';
        var desc = (item.description || 'Tidak ada catatan tertulis khusus untuk barang ini.').trim();
        var words = desc.split(' ');
        var line = '';
        var lineH = 22;
        var maxW = 430;

        for (var wi = 0; wi < words.length; wi++) {
            var tLine = line + (line ? ' ' : '') + words[wi];
            if (ctx.measureText(tLine).width > maxW && line) {
                ctx.fillText(line, 35, statY);
                line = words[wi];
                statY += lineH;
                if (statY > 520) break;
            } else {
                line = tLine;
            }
        }
        if (line && statY <= 520) {
            ctx.fillText(line, 35, statY);
        }

        // 4. Tombol Aksi Bawah: Beli Sekarang & Kembali + Selector Jumlah Beli Multi-Item
        var availableStock = (stockItem.stock !== undefined) ? stockItem.stock : 1;
        var maxAffordable = stockItem.price > 0 ? Math.floor(partyGold / stockItem.price) : availableStock;
        var maxQty = Math.max(1, Math.min(availableStock, Math.max(1, maxAffordable)));
        if (this._buyQuantity > availableStock) {
            this._buyQuantity = Math.max(1, availableStock);
        }
        var curQty = Math.min(this._buyQuantity || 1, availableStock);
        var totalCost = stockItem.price * curQty;
        var canAfford = partyGold >= totalCost && curQty <= availableStock;

        // Baris Pengatur Jumlah Beli (Quantity Selector)
        var qtyY = 510;
        ctx.fillStyle = 'rgba(254, 243, 199, 0.4)';
        drawSafeRoundRect(ctx, 35, qtyY, 438, 38, 6);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tombol ◄ & ►
        ctx.font = 'bold 16px GameFont, sans-serif';
        ctx.fillStyle = curQty > 1 ? '#b45309' : '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('◄  [ - ]', 78, qtyY + 25);

        ctx.font = 'bold 14px GameFont, sans-serif';
        ctx.fillStyle = '#4a2c1d';
        ctx.fillText('Jumlah: ' + curQty + ' buah  (Total: ' + totalCost + ' G)', 254, qtyY + 25);

        ctx.font = 'bold 16px GameFont, sans-serif';
        ctx.fillStyle = curQty < maxQty ? '#b45309' : '#9ca3af';
        ctx.fillText('[ + ]  ►', 430, qtyY + 25);

        var btnY = 560;
        ctx.fillStyle = canAfford ? 'rgba(34, 197, 94, 0.85)' : 'rgba(156, 163, 175, 0.7)';
        ctx.fillRect(35, btnY, 438, 44);
        ctx.strokeStyle = canAfford ? '#15803d' : '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(35.5, btnY + 0.5, 437, 43);

        ctx.font = 'bold 16px GameFont, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        if (canAfford) {
            ctx.fillText('[ ENTER ]  BELI ' + curQty + 'x ' + (item.name || 'BARANG') + ' ( ' + totalCost + ' G )', 254, btnY + 28);
        } else if (availableStock <= 0) {
            ctx.fillText('[ STOK HABIS ]', 254, btnY + 28);
        } else {
            ctx.fillText('[ UANG TIDAK CUKUP ]  ( Butuh ' + totalCost + ' G )', 254, btnY + 28);
        }

        ctx.font = '12px GameFont, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Gunakan [◄] [►] untuk atur jumlah  •  [ ESC ] Kembali', 254, btnY + 65);

        ctx.restore();
        bmp._setDirty();
    };

    Scene_KarsoShop.prototype.executePurchase = function() {
        try {
            var cur = this._scatterGoods[this._selectedSlot];
            if (!cur || cur.sold || !cur.item || (cur.stock !== undefined && cur.stock <= 0)) return;

            var availableStock = (cur.stock !== undefined) ? cur.stock : 1;
            var qty = Math.min(this._buyQuantity || 1, availableStock);
            var price = cur.price * qty;
            if ($gameParty.gold() < price) {
                SoundManager.playBuzzer();
                this.showToast('Uang Anda tidak mencukupi untuk ' + qty + 'x barang!');
                return;
            }

            SoundManager.playShop();
            $gameParty.loseGold(price);
            $gameParty.gainItem(cur.item, qty);

            // Kurangi stok barang yang dijual Karso
            cur.stock = availableStock - qty;

            // Jika stok habis (beli 1 saat stok 1, atau beli sejumlah sisa stok), langsung hilangkan dari matras
            if (cur.stock <= 0) {
                cur.stock = 0;
                cur.sold = true;
            }

            this.showToast('Membeli ' + qty + 'x ' + (cur.item.name || 'Barang') + ' (-' + price + ' G)!');

            // Reset selector jumlah dan tutup lembar detail otomatis
            this._buyQuantity = 1;
            this.closeDetailModal();

            // Jika barang sudah habis terjual, arahkan kursor ke barang berikutnya yang masih ada
            if (cur.sold) {
                var nextSlot = -1;
                for (var i = 0; i < this._scatterGoods.length; i++) {
                    if (this._scatterGoods[i] && !this._scatterGoods[i].sold && this._scatterGoods[i].item && (this._scatterGoods[i].stock > 0)) {
                        nextSlot = i;
                        break;
                    }
                }
                if (nextSlot !== -1) {
                    this._selectedSlot = nextSlot;
                }
            }

            this.drawHud();
            this.drawMatItems();
            this.updateReticlePosition();
        } catch (e) {
            console.error('Error in executePurchase:', e);
            if (typeof this.closeDetailModal === 'function') {
                this.closeDetailModal();
            }
        }
    };

    // ------------------------------------------------------------------------
    // INVENTORY BOOK MODAL (JUAL BARANG / SELL ITEM & SLIDE ANIMATION)
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.openInventoryBook = function() {
        SoundManager.playOk();
        this._mode = 'inventory';
        this._invBookModal.visible = true;
        this._invSlideState = 'opening';
        this._invBookContainer.x = 1280; // Mulai dari sisi paling kanan off-screen
        this._invBackdrop.opacity = 0;

        if (this._ribbonContainer) this._ribbonContainer.visible = false;
        if (this._popupSprite) this._popupSprite.visible = false;
        if (this._matReticleSprite) this._matReticleSprite.visible = false;

        this._invSlotIndex = 0;
        this._invPageIndex = 0;

        this.refreshInventoryBook();
        this.drawHud();
    };

    Scene_KarsoShop.prototype.closeInventoryBook = function() {
        SoundManager.playCancel();
        this._invSlideState = 'closing';
    };

    Scene_KarsoShop.prototype.updateInventorySlide = function() {
        if (!this._invBookModal || !this._invBookContainer) return;

        if (this._invSlideState === 'opening') {
            // Animasi meluncur dari kanan ke kiri (1280 -> 0)
            var targetX = 0;
            var diff = targetX - this._invBookContainer.x;
            if (Math.abs(diff) > 2) {
                this._invBookContainer.x += diff * 0.24;
                var progress = Math.max(0, Math.min(1.0, 1.0 - (this._invBookContainer.x / 1280)));
                this._invBackdrop.opacity = Math.round(progress * 200);
            } else {
                this._invBookContainer.x = 0;
                this._invBackdrop.opacity = 200;
                this._invSlideState = 'open';
            }
        } else if (this._invSlideState === 'closing') {
            // Animasi meluncur keluar kembali ke kanan (0 -> 1280)
            var targetX = 1280;
            var diff = targetX - this._invBookContainer.x;
            if (diff > 4) {
                var step = Math.max(16, diff * 0.24);
                this._invBookContainer.x += step;
                var progress = Math.max(0, Math.min(1.0, 1.0 - (this._invBookContainer.x / 1280)));
                this._invBackdrop.opacity = Math.round(progress * 200);
            } else {
                this._invBookContainer.x = 1280;
                this._invBackdrop.opacity = 0;
                this._invBookModal.visible = false;
                if (this._ribbonContainer) this._ribbonContainer.visible = true;
                this._invSlideState = 'closed';
                this._mode = 'mat';
                this.drawHud();
                this.updateReticlePosition();
                this.updatePopupTooltip();
            }
        }
    };

    Scene_KarsoShop.prototype.getPlayerInventoryList = function() {
        if (typeof $gameParty === 'undefined') return [];
        var items = [];
        var all = $gameParty.allItems ? $gameParty.allItems() : ($gameParty.items().concat($gameParty.weapons()).concat($gameParty.armors()));
        for (var i = 0; i < all.length; i++) {
            var it = all[i];
            if (it && $gameParty.numItems(it) > 0) {
                items.push(it);
            }
        }
        return items;
    };

    Scene_KarsoShop.prototype.refreshInventoryBook = function() {
        this.drawInventoryLeftGrid();
        this.drawInventoryRightDetails();
        this.updateInventoryReticle();
    };

    // Halaman Kiri Buku: Grid 24 Slot Column_.png (4 Kolom x 6 Baris)
    Scene_KarsoShop.prototype.drawInventoryLeftGrid = function() {
        if (!this._invSlotsSprite) return;
        var bmp = this._invSlotsSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();

        var colBmp = ImageManager.loadJournalItem('Column_');
        var colImg = colBmp ? (colBmp._canvas || colBmp._image) : null;
        if (colBmp && !colBmp.isReady()) {
            this.attachSafeLoadListener(colBmp, 'inv_colBmp', this.drawInventoryLeftGrid);
        }
        var iconSet = ImageManager.loadSystem('IconSet');
        var iconImg = iconSet ? (iconSet._canvas || iconSet._image) : null;
        if (iconSet && !iconSet.isReady()) {
            this.attachSafeLoadListener(iconSet, 'inv_iconSet', this.drawInventoryLeftGrid);
        }
        var itemSheet = typeof ImageManager.loadItemSheet === 'function' ? ImageManager.loadItemSheet() : null;
        if (itemSheet && !itemSheet.isReady()) {
            this.attachSafeLoadListener(itemSheet, 'inv_itemSheet', this.drawInventoryLeftGrid);
        }
        var skillSheet = typeof ImageManager.loadSkillSheet === 'function' ? ImageManager.loadSkillSheet() : null;
        if (skillSheet && !skillSheet.isReady()) {
            this.attachSafeLoadListener(skillSheet, 'inv_skillSheet', this.drawInventoryLeftGrid);
        }

        var items = this.getPlayerInventoryList();
        var startIdx = this._invPageIndex * 24;

        var cols = 4;
        var rows = 6;
        var startX = 52;
        var startY = 42;
        var spacingX = 100;
        var spacingY = 96;
        var slotW = 90;
        var slotH = 86;
        var iconSize = 58;

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var slotIdx = r * cols + c;
                var it = items[startIdx + slotIdx] || null;
                var x = startX + c * spacingX;
                var y = startY + r * spacingY;

                // 1. Bingkai Slot Column_.png (90 x 86)
                if (colBmp && colBmp.isReady() && colImg) {
                    ctx.drawImage(colImg, x, y, slotW, slotH);
                }

                // 2. Ikon Barang
                if (it) {
                    var drawn = false;
                    var ix = Math.round(x + (slotW - iconSize) / 2);
                    var iy = Math.round(y + (slotH - iconSize) / 2);

                    if (typeof ImageManager.drawSkillIcon === 'function' && (it.customIcon || it.skillIconIndex !== undefined || it.itemIconIndex !== undefined)) {
                        drawn = ImageManager.drawSkillIcon(bmp, it, ix, iy, iconSize, iconSize, this.drawInventoryLeftGrid.bind(this));
                    }
                    if (!drawn && it.iconIndex > 0 && it.iconIndex !== 1) {
                        if (iconImg && iconSet && iconSet.isReady()) {
                            var sx = (it.iconIndex % 16) * 32;
                            var sy = Math.floor(it.iconIndex / 16) * 32;
                            ctx.save();
                            ctx.imageSmoothingEnabled = false;
                            ctx.shadowColor = 'rgba(0,0,0,0.45)';
                            ctx.shadowBlur = 6;
                            ctx.drawImage(iconImg, sx, sy, 32, 32, ix, iy, iconSize, iconSize);
                            ctx.restore();
                        } else if (iconSet && !iconSet.isReady()) {
                            this.attachSafeLoadListener(iconSet, 'inv_iconSet', this.drawInventoryLeftGrid);
                        }
                    }

                    // Stack Count
                    var qty = $gameParty.numItems(it);
                    if (qty > 1) {
                        ctx.save();
                        ctx.font = 'bold 15px GameFont, sans-serif';
                        ctx.textAlign = 'right';
                        ctx.fillStyle = '#000000';
                        ctx.fillText(String(qty), x + slotW - 5 + 1, y + slotH - 6 + 1);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(String(qty), x + slotW - 5, y + slotH - 6);
                        ctx.restore();
                    }
                }
            }
        }

        ctx.restore();
        bmp._setDirty();

        // Paginasi Indikator Halaman
        if (this._invPageNavSprite) {
            var pBmp = this._invPageNavSprite.bitmap;
            pBmp.clear();
            var totalPages = Math.max(1, Math.ceil(items.length / 24));
            if (totalPages > 1) {
                var pCtx = pBmp._context;
                pCtx.save();
                pCtx.font = 'bold 14px GameFont, monospace';
                pCtx.textAlign = 'center';
                pCtx.fillStyle = '#451a03';
                pCtx.fillText('◄ Q   Halaman ' + (this._invPageIndex + 1) + ' / ' + totalPages + '   W ▶', 254, 20);
                pCtx.restore();
                pBmp._setDirty();
            }
        }
    };

    // Halaman Kanan Buku: Polaroid Miring, Nama, Description Paper & Panel Jual
    Scene_KarsoShop.prototype.drawInventoryRightDetails = function() {
        var items = this.getPlayerInventoryList();
        var curIdx = this._invPageIndex * 24 + this._invSlotIndex;
        var it = items[curIdx] || null;

        var iconSet = ImageManager.loadSystem('IconSet');
        var iconImg = iconSet ? (iconSet._canvas || iconSet._image) : null;
        var polBmp = ImageManager.loadJournalItem('Polaroid_');
        var descBmp = ImageManager.loadJournalItem('Description_');

        var self = this;
        var onInvRightReady = function() {
            if (self._mode === 'inventory') self.drawInventoryRightDetails();
        };

        if (polBmp && !polBmp.isReady()) {
            this.attachSafeLoadListener(polBmp, 'invRight_polBmp', onInvRightReady);
        }
        if (descBmp && !descBmp.isReady()) {
            this.attachSafeLoadListener(descBmp, 'invRight_descBmp', onInvRightReady);
        }
        if (iconSet && !iconSet.isReady()) {
            this.attachSafeLoadListener(iconSet, 'invRight_iconSet', onInvRightReady);
        }

        // 1. Polaroid Art di dalam Bingkai Polaroid Miring (-8.5°)
        if (this._invPolaroidArtSprite) {
            var artBmp = this._invPolaroidArtSprite.bitmap;
            artBmp.clear();
            var artCtx = artBmp._context;
            artCtx.save();
            artCtx.fillStyle = '#73335e';
            artCtx.fillRect(16, 12, 201, 186);

            if (it) {
                var photoCX = 118;
                var photoCY = 105;
                var drawSize = 100;
                var dx = Math.round(photoCX - drawSize / 2);
                var dy = Math.round(photoCY - drawSize / 2);

                var drawn = false;
                if (typeof ImageManager.drawSkillIcon === 'function' && (it.customIcon || it.skillIconIndex !== undefined || it.itemIconIndex !== undefined)) {
                    drawn = ImageManager.drawSkillIcon(artBmp, it, dx, dy, drawSize, drawSize, onInvRightReady);
                }
                if (!drawn && it.iconIndex > 0 && it.iconIndex !== 1) {
                    if (iconImg && iconSet && iconSet.isReady()) {
                        var sx = (it.iconIndex % 16) * 32;
                        var sy = Math.floor(it.iconIndex / 16) * 32;
                        artCtx.imageSmoothingEnabled = false;
                        artCtx.shadowColor = 'rgba(0,0,0,0.5)';
                        artCtx.shadowBlur = 8;
                        artCtx.drawImage(iconImg, sx, sy, 32, 32, dx, dy, drawSize, drawSize);
                    } else if (iconSet && !iconSet.isReady()) {
                        this.attachSafeLoadListener(iconSet, 'invRight_iconSet', onInvRightReady);
                    }
                }
            }
            artCtx.restore();
            artBmp._setDirty();
        }

        // 2. Judul & Kategori (Samping Polaroid)
        if (this._invTitleSprite) {
            var tBmp = this._invTitleSprite.bitmap;
            tBmp.clear();
            var tCtx = tBmp._context;
            tCtx.save();

            if (it) {
                tCtx.font = 'bold 22px GameFont, sans-serif';
                tCtx.fillStyle = '#2c1810';
                tCtx.textAlign = 'left';
                var nameText = it.name || 'Barang';
                tCtx.fillText(nameText, 0, 78);

                var catText = '*Consumable';
                if (DataManager.isItem(it)) {
                    if (it.itypeId === 2) catText = '*Key Item';
                    else if (it.consumable) catText = '*Consumable';
                    else catText = '*Item';
                } else if (DataManager.isWeapon(it)) {
                    catText = '*Weapon';
                } else if (DataManager.isArmor(it)) {
                    catText = '*Equipment';
                }
                tCtx.font = '16px GameFont, sans-serif';
                tCtx.fillStyle = '#374151';
                tCtx.fillText(catText, 0, 106);

                var subText = '*unidentified';
                if (it.note && it.note.match(/<type:\s*(.*)>/i)) {
                    subText = '*' + RegExp.$1;
                } else if (it.price > 0) {
                    subText = '*Value: ' + it.price + ' G';
                }
                tCtx.font = '16px GameFont, sans-serif';
                tCtx.fillStyle = '#4b5563';
                tCtx.fillText(subText, 0, 132);
            } else {
                tCtx.font = 'bold 20px GameFont, sans-serif';
                tCtx.fillStyle = '#9ca3af';
                tCtx.fillText('(Slot Kosong)', 0, 78);
            }
            tCtx.restore();
            tBmp._setDirty();
        }

        // 3. Teks Lore Deskripsi & Panel Jual di Kertas Catatan Bergaris
        if (this._invDescTextSprite) {
            var dTextBmp = this._invDescTextSprite.bitmap;
            dTextBmp.clear();
            var dCtx = dTextBmp._context;
            dCtx.save();

            var descText = '';
            if (it) {
                descText = it.description || 'Tidak ada catatan atau lore khusus untuk barang ini.';
            } else {
                descText = 'Slot ini sedang kosong. Kamu belum memiliki barang di slot inventaris ini.';
            }

            dCtx.font = '17px GameFont, sans-serif';
            dCtx.fillStyle = '#262626';
            dCtx.textAlign = 'left';

            var clean = descText.replace(/\r?\n/g, ' ');
            var words = clean.split(' ');
            var line = '';
            var lineIdx = 0;
            var maxLineWidth = 425;
            var startX = 40;
            var startY = 100;
            var lHeight = 28;
            var maxLines = 4;

            for (var w = 0; w < words.length; w++) {
                var testLine = line ? (line + ' ' + words[w]) : words[w];
                if (dCtx.measureText(testLine).width > maxLineWidth) {
                    if (lineIdx < maxLines) {
                        dCtx.fillText(line, startX, startY + lineIdx * lHeight);
                        lineIdx++;
                    }
                    line = words[w];
                } else {
                    line = testLine;
                }
            }
            if (line && lineIdx < maxLines) {
                dCtx.fillText(line, startX, startY + lineIdx * lHeight);
            }

            // Garis Pembatas Halus di Kertas
            var divY = 222;
            dCtx.strokeStyle = 'rgba(74, 44, 29, 0.35)';
            dCtx.lineWidth = 1;
            dCtx.beginPath();
            dCtx.moveTo(startX, divY);
            dCtx.lineTo(startX + 428, divY);
            dCtx.stroke();

            // Status Kepemilikan & Tombol Aksi Jual
            if (it) {
                var qty = $gameParty.numItems(it);
                var sellPrice = Math.floor((it.price || 0) / 2);
                if (sellPrice <= 0 && it.price > 0) sellPrice = 1;
                var canSell = (it.price > 0);

                dCtx.font = 'bold 15px GameFont, sans-serif';
                dCtx.fillStyle = canSell ? '#b45309' : '#6b7280';
                dCtx.fillText('Harga Jual: ' + (canSell ? (sellPrice + ' Gold') : 'Tidak Bisa Dijual'), startX, divY + 24);

                dCtx.font = '14px GameFont, sans-serif';
                dCtx.fillStyle = '#4b5563';
                dCtx.fillText('Dimiliki: ' + qty + ' buah', startX + 270, divY + 24);

                // Tombol Jual
                var btnY = divY + 36;
                dCtx.fillStyle = canSell ? 'rgba(234, 88, 12, 0.9)' : 'rgba(156, 163, 175, 0.65)';
                dCtx.fillRect(startX, btnY, 428, 40);
                dCtx.strokeStyle = canSell ? '#c2410c' : '#4b5563';
                dCtx.lineWidth = 1.5;
                dCtx.strokeRect(startX + 0.5, btnY + 0.5, 427, 39);

                dCtx.font = 'bold 16px GameFont, sans-serif';
                dCtx.fillStyle = '#ffffff';
                dCtx.textAlign = 'center';
                if (canSell) {
                    dCtx.fillText('[ ENTER ]  JUAL 1x ( +' + sellPrice + ' Gold )', startX + 214, btnY + 26);
                } else {
                    dCtx.fillText('[ BARANG INI TIDAK BISA DIJUAL ]', startX + 214, btnY + 26);
                }
            } else {
                var btnY = divY + 36;
                dCtx.fillStyle = 'rgba(156, 163, 175, 0.4)';
                dCtx.fillRect(startX, btnY, 428, 40);
                dCtx.font = 'bold 15px GameFont, sans-serif';
                dCtx.fillStyle = '#6b7280';
                dCtx.textAlign = 'center';
                dCtx.fillText('(Pilih barang dari halaman kiri)', startX + 214, btnY + 26);
            }

            // Footer Tips
            dCtx.font = '12px GameFont, sans-serif';
            dCtx.fillStyle = '#78716c';
            dCtx.textAlign = 'center';
            dCtx.fillText('Tekan [ ESC / TAB ] untuk kembali ke toko  •  [ Q / W ] Ganti Halaman', startX + 214, 324);

            dCtx.restore();
            dTextBmp._setDirty();
        }
    };

    Scene_KarsoShop.prototype.updateInventoryReticle = function() {
        if (!this._invReticleSprite) return;
        if (this._mode !== 'inventory') {
            this._invReticleSprite.visible = false;
            return;
        }

        var cols = 4;
        var startX = 52;
        var startY = 42;
        var spacingX = 100;
        var spacingY = 96;
        var slotW = 90;
        var slotH = 86;

        var col = this._invSlotIndex % cols;
        var row = Math.floor(this._invSlotIndex / cols);

        this._invReticleSprite.x = startX + col * spacingX + slotW / 2;
        this._invReticleSprite.y = startY + row * spacingY + slotH / 2;
        this._invReticleSprite.visible = true;
    };

    Scene_KarsoShop.prototype.executeSell = function() {
        var list = this.getPlayerInventoryList();
        var curIdx = this._invPageIndex * 24 + this._invSlotIndex;
        var it = list[curIdx] || null;
        if (!it) return;

        if (!it.price || it.price <= 0) {
            SoundManager.playBuzzer();
            this.showToast('Barang ini tidak dapat dijual!');
            return;
        }

        var sellPrice = Math.floor(it.price / 2);
        if (sellPrice <= 0) sellPrice = 1;

        SoundManager.playShop();
        $gameParty.gainGold(sellPrice);
        $gameParty.loseItem(it, 1);

        this.showToast('Menjual 1x ' + it.name + ' (+' + sellPrice + ' Gold)!');

        // Pastikan slot tidak out-of-bounds jika item habis
        var newList = this.getPlayerInventoryList();
        var maxPages = Math.max(1, Math.ceil(newList.length / 24));
        if (this._invPageIndex >= maxPages) {
            this._invPageIndex = maxPages - 1;
        }
        var curCount = Math.min(24, Math.max(0, newList.length - this._invPageIndex * 24));
        if (this._invSlotIndex >= curCount && this._invSlotIndex > 0) {
            this._invSlotIndex = Math.max(0, curCount - 1);
        }

        this.refreshInventoryBook();
        this.drawHud();
    };

    // ------------------------------------------------------------------------
    // TOAST NOTIFIKASI ELEGAN
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.showToast = function(text) {
        this._toastText = text;
        this._toastTimer = 110;
        var bmp = this._toastSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();
        ctx.fillStyle = 'rgba(20, 16, 22, 0.92)';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.fillRect(0, 0, 450, 48);
        ctx.strokeRect(0.5, 0.5, 449, 47);

        ctx.font = 'bold 15px GameFont, sans-serif';
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'center';
        ctx.fillText(text, 225, 30);
        ctx.restore();
        bmp._setDirty();
        this._toastSprite.opacity = 255;
    };

    // ------------------------------------------------------------------------
    // TRANSISI MASUK TOKO: KEGELAPAN & LAMPU TUA BERKEDIP SPUTTERING
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.startEntranceTransition = function() {
        this._entranceTransition = true;
        this._entranceTimer = 0;
        if (this._darknessSprite) {
            this._darknessSprite.opacity = 255;
            this._darknessSprite.visible = true;
        }
        if (this._lampSprite) {
            this._lampSprite.opacity = 0;
            this._lampSprite.visible = true;
            this._lampSprite.scale.x = 1.0;
            this._lampSprite.scale.y = 1.0;
            this._lampSprite.rotation = 0;
        }
        if (this._sparkSprite) {
            this._sparkSprite.opacity = 0;
            this._sparkSprite.visible = true;
            this._sparkSprite.rotation = 0;
        }
        if (this._goldSprite) this._goldSprite.opacity = 0;
        if (this._footerSprite) this._footerSprite.opacity = 0;
        if (this._ribbonContainer) this._ribbonContainer.x = 1280;
        if (this._matReticleSprite) this._matReticleSprite.visible = false;
        if (this._popupSprite) this._popupSprite.visible = false;
    };

    Scene_KarsoShop.prototype.finishEntranceTransition = function() {
        this._entranceTransition = false;
        this._entranceTimer = 999;
        if (this._darknessSprite) {
            this._darknessSprite.opacity = 0;
            this._darknessSprite.visible = false;
        }
        if (this._sparkSprite) {
            this._sparkSprite.opacity = 0;
            this._sparkSprite.visible = false;
        }
        if (this._lampSprite) {
            var isNight = isKarsoNightTime();
            this._lampSprite.opacity = isNight ? 230 : 190;
            this._lampSprite.visible = true;
            this._lampSprite.scale.x = 1.0;
            this._lampSprite.scale.y = 1.0;
        }
        if (this._goldSprite) this._goldSprite.opacity = 255;
        if (this._footerSprite) this._footerSprite.opacity = 255;
        if (this._ribbonContainer) this._ribbonContainer.x = 1220;
        this.updateReticlePosition();
        this.updatePopupTooltip();
    };

    Scene_KarsoShop.prototype.playTransitionSe = function(name, volume, pitch) {
        try {
            if (typeof AudioManager !== 'undefined' && AudioManager.playSe) {
                AudioManager.playSe({
                    name: name,
                    volume: volume || 70,
                    pitch: pitch || 100,
                    pan: 0
                });
            }
        } catch (e) {}
    };

    Scene_KarsoShop.prototype.updateEntranceTransition = function() {
        this._entranceTimer = (this._entranceTimer || 0) + 1;
        var t = this._entranceTimer;

        // Skip instan jika player menekan OK / Cancel / Touch setelah frame 5
        if (t > 5) {
            if (Input.isTriggered('ok') || Input.isTriggered('cancel') || (typeof TouchInput !== 'undefined' && TouchInput.isTriggered())) {
                this.finishEntranceTransition();
                return;
            }
        }

        if (!this._darknessSprite || !this._lampSprite) {
            this.finishEntranceTransition();
            return;
        }

        var lampAlpha = 0;
        var darknessAlpha = 255;
        var sparkAlpha = 0;

        // 1. Total Pitch Darkness (Frames 0 - 14)
        if (t < 15) {
            lampAlpha = 0;
            darknessAlpha = 255;
            sparkAlpha = 0;
        }
        // 2. Kontak Listrik Pertama & Klik Switch! (Frames 15 - 17)
        else if (t === 15) {
            this.playTransitionSe('Switch1', 80, 125);
            lampAlpha = 230;
            darknessAlpha = 40;
            sparkAlpha = 240;
        } else if (t === 16) {
            lampAlpha = 210;
            darknessAlpha = 70;
            sparkAlpha = 170;
        } else if (t === 17) {
            lampAlpha = 130;
            darknessAlpha = 140;
            sparkAlpha = 70;
        }
        // 3. Padam Mendadak (Mati total lagi - Frames 18 - 25)
        else if (t >= 18 && t <= 25) {
            lampAlpha = 0;
            darknessAlpha = 255;
            sparkAlpha = 0;
        }
        // 4. Starter Twitch Kembar (Frames 26 - 29)
        else if (t === 26) {
            this.playTransitionSe('click1', 65, 135);
            lampAlpha = 0;
            darknessAlpha = 255;
            sparkAlpha = 0;
        } else if (t === 27) {
            lampAlpha = 190;
            darknessAlpha = 80;
            sparkAlpha = 180;
        } else if (t === 28) {
            lampAlpha = 30;
            darknessAlpha = 220;
            sparkAlpha = 20;
        } else if (t === 29) {
            lampAlpha = 180;
            darknessAlpha = 90;
            sparkAlpha = 150;
        }
        // 5. Padam Sesaat (Frames 30 - 33)
        else if (t >= 30 && t <= 33) {
            lampAlpha = 0;
            darknessAlpha = 255;
            sparkAlpha = 0;
        }
        // 6. Dengungan & Rentetan Kedipan Lampu Tua Sputtering (Frames 34 - 43)
        else if (t === 34) {
            this.playTransitionSe('Switch1', 75, 105);
            lampAlpha = 230;
            darknessAlpha = 40;
            sparkAlpha = 220;
        } else if (t === 35) {
            lampAlpha = 70;
            darknessAlpha = 180;
            sparkAlpha = 40;
        } else if (t === 36) {
            lampAlpha = 240;
            darknessAlpha = 30;
            sparkAlpha = 210;
        } else if (t === 37) {
            lampAlpha = 50;
            darknessAlpha = 210;
            sparkAlpha = 30;
        } else if (t === 38) {
            lampAlpha = 210;
            darknessAlpha = 60;
            sparkAlpha = 160;
        } else if (t === 39) {
            lampAlpha = 255;
            darknessAlpha = 15;
            sparkAlpha = 240;
        } else if (t === 40) {
            lampAlpha = 95;
            darknessAlpha = 160;
            sparkAlpha = 70;
        } else if (t === 41) {
            lampAlpha = 30;
            darknessAlpha = 230;
            sparkAlpha = 20;
        } else if (t === 42) {
            lampAlpha = 220;
            darknessAlpha = 50;
            sparkAlpha = 170;
        } else if (t === 43) {
            lampAlpha = 80;
            darknessAlpha = 175;
            sparkAlpha = 50;
        }
        // 7. Pemanasan Filamen (Rapid micro vibration, Frames 44 - 52)
        else if (t >= 44 && t <= 52) {
            var stutter = Math.sin(t * 1.6) * 45;
            lampAlpha = Math.max(120, Math.min(240, Math.round(180 + stutter + (Math.random() * 30 - 15))));
            darknessAlpha = Math.max(20, Math.min(130, 255 - lampAlpha));
            sparkAlpha = Math.max(0, lampAlpha - 110);
        }
        // 8. Semburan Penyalaan Penuh (Ignition Surge! Frames 53 - 62)
        else if (t === 53) {
            this.playTransitionSe('Fire1', 45, 140);
            lampAlpha = 255;
            darknessAlpha = 0;
            sparkAlpha = 255;
            if (this._lampSprite) {
                this._lampSprite.scale.x = 1.03;
                this._lampSprite.scale.y = 1.03;
            }
        } else if (t > 53 && t <= 62) {
            var surgeDecay = (t - 53) / 9; // 0.0 -> 1.0
            lampAlpha = Math.round(255 - surgeDecay * 25);
            darknessAlpha = 0;
            sparkAlpha = Math.max(0, Math.round(255 * (1 - surgeDecay * 1.2)));
            if (this._lampSprite) {
                var sc = 1.03 - surgeDecay * 0.03;
                this._lampSprite.scale.x = sc;
                this._lampSprite.scale.y = sc;
            }
        }
        // 9. Penstabilan Cahaya & UI Bloom / Fade In (Frames 63 - 80)
        else if (t >= 63 && t <= 80) {
            lampAlpha = 230 + Math.round(Math.sin(t * 0.15) * 12);
            darknessAlpha = 0;
            sparkAlpha = 0;
            if (this._lampSprite) {
                this._lampSprite.scale.x = 1.0;
                this._lampSprite.scale.y = 1.0;
            }

            var bloom = (t - 63) / 17; // 0.0 -> 1.0
            if (this._goldSprite) this._goldSprite.opacity = Math.round(bloom * 255);
            if (this._footerSprite) this._footerSprite.opacity = Math.round(bloom * 255);
            if (this._ribbonContainer) {
                this._ribbonContainer.x = 1280 - Math.round(bloom * 60); // 1280 -> 1220
            }

            if (t >= 75) {
                this.updateReticlePosition();
                this.updatePopupTooltip();
            }
        }
        // Transisi Selesai
        else if (t > 80) {
            this.finishEntranceTransition();
            return;
        }

        this._lampSprite.opacity = lampAlpha;
        this._lampSprite.visible = (lampAlpha > 0);
        this._darknessSprite.opacity = darknessAlpha;
        this._darknessSprite.visible = (darknessAlpha > 0);
        if (this._sparkSprite) {
            this._sparkSprite.opacity = sparkAlpha;
            this._sparkSprite.visible = (sparkAlpha > 0);
        }
    };

    // ------------------------------------------------------------------------
    // TRANSISI KELUAR TOKO: EFEK LAMPU MATI & RUANGAN GELAP
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.startExitTransition = function() {
        if (this._exitTransition) return;
        this._exitTransition = true;
        this._exitTimer = 0;
        this._mode = 'exit';
        if (this._matReticleSprite) this._matReticleSprite.visible = false;
        if (this._popupSprite) this._popupSprite.visible = false;
        this.playTransitionSe('Switch1', 80, 95);
    };

    Scene_KarsoShop.prototype.finishExitTransition = function() {
        this._exitTransition = false;
        this._exitTransitionDone = true;
        if (this._darknessSprite) {
            this._darknessSprite.opacity = 255;
            this._darknessSprite.visible = true;
        }
        if (this._lampSprite) {
            this._lampSprite.opacity = 0;
            this._lampSprite.visible = false;
        }
        if (this._sparkSprite) {
            this._sparkSprite.opacity = 0;
            this._sparkSprite.visible = false;
        }
        this.popScene();
    };

    Scene_KarsoShop.prototype.popScene = function() {
        if (!this._exitTransitionDone) {
            this.startExitTransition();
        } else {
            Scene_MenuBase.prototype.popScene.call(this);
        }
    };

    Scene_KarsoShop.prototype.updateExitTransition = function() {
        this._exitTimer = (this._exitTimer || 0) + 1;
        var t = this._exitTimer;

        // Skip instan jika pemain menekan tombol atau klik layar setelah frame 2
        if (t > 2) {
            if (Input.isTriggered('ok') || Input.isTriggered('cancel') || (typeof TouchInput !== 'undefined' && TouchInput.isTriggered())) {
                this.finishExitTransition();
                return;
            }
        }

        var lampAlpha = 0;
        var darknessAlpha = 255;
        var sparkAlpha = 0;

        // 1. Sentakan Switch & Kilatan Pelepasan Daya (Frames 1 - 2)
        if (t === 1) {
            lampAlpha = 255;
            darknessAlpha = 0;
            sparkAlpha = 220;
            if (this._lampSprite) {
                this._lampSprite.scale.x = 1.02;
                this._lampSprite.scale.y = 1.02;
            }
        } else if (t === 2) {
            lampAlpha = 200;
            darknessAlpha = 50;
            sparkAlpha = 140;
        }
        // 2. Anjlok Mendadak & Sputter (Frames 3 - 5)
        else if (t === 3) {
            this.playTransitionSe('click1', 65, 110);
            lampAlpha = 60;
            darknessAlpha = 170;
            sparkAlpha = 30;
            if (this._lampSprite) {
                this._lampSprite.scale.x = 1.0;
                this._lampSprite.scale.y = 1.0;
            }
        } else if (t === 4) {
            lampAlpha = 120;
            darknessAlpha = 120;
            sparkAlpha = 70;
        } else if (t === 5) {
            lampAlpha = 20;
            darknessAlpha = 220;
            sparkAlpha = 10;
        }
        // 3. Bara Kawat Filamen Memudar (Frames 6 - 8)
        else if (t === 6) {
            lampAlpha = 70;
            darknessAlpha = 190;
            sparkAlpha = 40;
        } else if (t === 7) {
            lampAlpha = 25;
            darknessAlpha = 235;
            sparkAlpha = 10;
        } else if (t === 8) {
            lampAlpha = 0;
            darknessAlpha = 255;
            sparkAlpha = 0;
        }
        // 4. Gelap Total & Hening Sebelum Keluar Map (Frames 9 - 20)
        else if (t >= 9 && t < 20) {
            lampAlpha = 0;
            darknessAlpha = 255;
            sparkAlpha = 0;
            if (this._goldSprite) this._goldSprite.opacity = Math.max(0, 255 - (t - 8) * 35);
            if (this._footerSprite) this._footerSprite.opacity = Math.max(0, 255 - (t - 8) * 35);
            if (this._ribbonContainer) this._ribbonContainer.x = Math.min(1280, 1220 + (t - 8) * 8);
        }
        // 5. Transisi Keluar Selesai -> Pop Scene
        else if (t >= 20) {
            this.finishExitTransition();
            return;
        }

        if (this._lampSprite) {
            this._lampSprite.opacity = lampAlpha;
            this._lampSprite.visible = (lampAlpha > 0);
        }
        if (this._darknessSprite) {
            this._darknessSprite.opacity = darknessAlpha;
            this._darknessSprite.visible = (darknessAlpha > 0);
        }
        if (this._sparkSprite) {
            this._sparkSprite.opacity = sparkAlpha;
            this._sparkSprite.visible = (sparkAlpha > 0);
        }
    };

    // ------------------------------------------------------------------------
    // UPDATE LOOP UTAMA (FISIKA LAMPU KEDIP, PULSE RETICLE, TOAST & INPUT)
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);

        // 0a. Transisi Masuk Toko: Tabir Gelap & Kedipan Lampu Sputtering
        if (this._entranceTransition) {
            this.updateEntranceTransition();
            return;
        }

        // 0b. Transisi Keluar Toko: Efek Lampu Mati Sputtering & Ruangan Gelap
        if (this._exitTransition) {
            this.updateExitTransition();
            return;
        }

        this._pulseTimer = (this._pulseTimer || 0) + 1;

        // 1. Fisika Kedipan Lampu Malam (Organic Warm Lamp Flicker)
        this.updateLampFlicker();

        // 2. Animasi Denyut Reticle
        var pulseScale = 1.0 + Math.sin(this._pulseTimer * 0.12) * 0.035;
        if (this._matReticleSprite && this._matReticleSprite.visible) {
            this._matReticleSprite.scale.x = pulseScale;
            this._matReticleSprite.scale.y = pulseScale;
        }
        if (this._invReticleSprite && this._invReticleSprite.visible) {
            this._invReticleSprite.scale.x = pulseScale;
            this._invReticleSprite.scale.y = pulseScale;
        }

        // 3. Efek Hover / Peeking Pita Inventori Kanan
        this.updateRibbonPeeking();

        // 3b. Animasi Slide Buku Inventori (Kanan-ke-Kiri saat Buka, Kiri-ke-Kanan saat Tutup)
        this.updateInventorySlide();

        // 3c. Animasi Slide Lembar Kertas Detail (Bawah-ke-Atas saat Buka, Atas-ke-Bawah saat Tutup)
        this.updateDetailSlide();

        // 3d. Atmosfir Hidup Toko Mbah Karso (Nafas Mbah Karso, Ayunan Lampu, Item Hover Lift)
        this.updateShopAtmosphere();

        // 3e. Partikel Debu Halus Mengambang di Bawah Sorotan Lampu
        this.updateDustMotes();

        // 4. Toast Fade Out
        if (this._toastTimer > 0) {
            this._toastTimer--;
            if (this._toastTimer < 25) {
                this._toastSprite.opacity = Math.max(0, this._toastTimer * 10);
            }
        }

        // 5. Penanganan Masukan (Input) & Mouse Hover
        this.handleMouseHover();
        this.handleInput();
    };

    Scene_KarsoShop.prototype.updateLampFlicker = function() {
        if (!this._lampSprite) return;
        this._lampSprite.visible = true;
        this._lampTimer = (this._lampTimer || 0) + 1;

        var wave1 = Math.sin(this._lampTimer * 0.04);
        var wave2 = Math.sin(this._lampTimer * 0.11 + 1.5);
        var wave3 = Math.sin(this._lampTimer * 0.28);
        if (Math.random() < 0.04) {
            this._lampJitter = (Math.random() * 20 - 10);
        } else {
            this._lampJitter *= 0.85;
        }

        var isNight = isKarsoNightTime();
        var baseAlpha = isNight ? 225 : 190;
        var finalAlpha = Math.round(baseAlpha + wave1 * 18 + wave2 * 12 + wave3 * 6 + this._lampJitter);
        this._lampSprite.opacity = Math.max(140, Math.min(255, finalAlpha));

        var lampScale = 1.0 + Math.sin(this._lampTimer * 0.03) * 0.008;
        this._lampSprite.scale.x = lampScale;
        this._lampSprite.scale.y = lampScale;
    };

    Scene_KarsoShop.prototype.updateRibbonPeeking = function() {
        if (!this._ribbonContainer) return;
        if (this._mode !== 'mat') return; // Hanya intip saat di layar matras
        var targetX = this._ribbonHovered ? 1170 : 1220;
        var diff = targetX - this._ribbonContainer.x;
        if (Math.abs(diff) > 0.5) {
            this._ribbonContainer.x += diff * 0.25;
        } else {
            this._ribbonContainer.x = targetX;
        }
    };

    // ------------------------------------------------------------------------
    // ATMOSFIR TOKO MBAH KARSO (NAFAS MBAH KARSO, AYUNAN LAMPU, TACTILE HOVER)
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.updateShopAtmosphere = function() {
        // 1. Nafas halus Mbah Karso (idle breathing)
        if (this._feetSprite) {
            this._feetSprite.y = Math.sin(this._pulseTimer * 0.04) * 1.5;
        }

        // 2. Ayunan lembut lampu gantung (subtle pendulum breeze sway di bulb anchor)
        if (this._lampSprite && this._lampSprite.visible) {
            var sway = Math.sin(this._pulseTimer * 0.025) * 0.006;
            this._lampSprite.rotation = sway;
            if (this._sparkSprite && this._sparkSprite.visible) {
                this._sparkSprite.rotation = sway;
            }
        }

        // 3. Efek angkat taktil item yang sedang disorot di atas tikar (tactile hover lift)
        if (this._matItemSprites && this._scatterGoods) {
            for (var i = 0; i < this._scatterGoods.length && i < this._matItemSprites.length; i++) {
                var g = this._scatterGoods[i];
                var sp = this._matItemSprites[i];
                if (!g || !sp) continue;
                var baseY = (g.y !== undefined) ? g.y : (SCATTER_SLOTS[i] ? SCATTER_SLOTS[i].y : sp.y);
                var isSelected = (this._mode === 'mat' && i === this._selectedSlot && !g.sold);
                var targetLiftY = isSelected ? (baseY - 4) : baseY;
                var targetScale = isSelected ? 1.05 : 1.0;
                sp.y += (targetLiftY - sp.y) * 0.2;
                sp.scale.x += (targetScale - sp.scale.x) * 0.2;
                sp.scale.y += (targetScale - sp.scale.y) * 0.2;
            }
        }

        // Sinkronisasi posisi reticle dengan item yang sedang melayang
        if (this._mode === 'mat' && this._matReticleSprite && this._matReticleSprite.visible) {
            var activeSp = (this._matItemSprites && this._matItemSprites[this._selectedSlot]) ? this._matItemSprites[this._selectedSlot] : null;
            if (activeSp) {
                this._matReticleSprite.y = activeSp.y;
            }
        }
    };

    // ------------------------------------------------------------------------
    // MOUSE & TOUCH HOVER DETECTION
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.handleMouseHover = function() {
        if (typeof TouchInput === 'undefined') return;
        var mx = TouchInput.x;
        var my = TouchInput.y;

        if (this._mode === 'mat') {
            // Cek hover pita inventori kanan
            if (mx >= 1180 && my >= 130 && my <= 320) {
                this._ribbonHovered = true;
            } else {
                this._ribbonHovered = false;
            }

            // Cek hover slot item berserakan di matras
            var found = false;
            for (var i = 0; i < this._scatterGoods.length; i++) {
                var g = this._scatterGoods[i];
                if (!g || g.sold) continue;
                var dx = mx - g.x;
                var dy = my - g.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 45) {
                    if (this._selectedSlot !== i) {
                        this._selectedSlot = i;
                        SoundManager.playCursor();
                        this.updateReticlePosition();
                        this.updatePopupTooltip();
                    }
                    found = true;
                    break;
                }
            }

            if (!found && this._lastHoverSlot !== -1) {
                this._lastHoverSlot = -1;
            }
        }
    };

    // ------------------------------------------------------------------------
    // INPUT KEYBOARD & TOUCH CLICKS
    // ------------------------------------------------------------------------
    Scene_KarsoShop.prototype.handleInput = function() {
        if (this._mode === 'mat') {
            this.handleMatInput();
        } else if (this._mode === 'detail') {
            if (this._detailSlideState === 'open') {
                this.handleDetailInput();
            }
        } else if (this._mode === 'inventory') {
            if (this._invSlideState === 'open') {
                this.handleInventoryInput();
            }
        }
    };

    // Navigasi di Atas Matras
    Scene_KarsoShop.prototype.handleMatInput = function() {
        // Tab -> Buka Inventori
        if (Input.isTriggered('tab')) {
            this.openInventoryBook();
            return;
        }

        // Buka Inventori jika pita kanan diklik
        if (TouchInput.isTriggered() && TouchInput.x >= 1160 && TouchInput.y >= 130 && TouchInput.y <= 320) {
            this.openInventoryBook();
            return;
        }

        // Klik langsung pada item berserakan -> Buka Detail
        if (TouchInput.isTriggered()) {
            for (var i = 0; i < this._scatterGoods.length; i++) {
                var g = this._scatterGoods[i];
                if (!g || g.sold) continue;
                var dx = TouchInput.x - g.x;
                var dy = TouchInput.y - g.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 45) {
                    this._selectedSlot = i;
                    this.openDetailModal();
                    return;
                }
            }
        }

        // Navigasi Tombol Panah (Murni berpindah di item matras, tidak auto-open inventori!)
        if (Input.isRepeated('right')) {
            this.moveMatSelection('right');
        } else if (Input.isRepeated('left')) {
            this.moveMatSelection('left');
        } else if (Input.isRepeated('up')) {
            this.moveMatSelection('up');
        } else if (Input.isRepeated('down')) {
            this.moveMatSelection('down');
        }

        // ENTER -> Buka Detail Sheet
        if (Input.isTriggered('ok')) {
            this.openDetailModal();
            return;
        }

        // ESC -> Keluar Toko (dengan transisi lampu mati)
        if (Input.isTriggered('cancel')) {
            SoundManager.playCancel();
            this.startExitTransition();
            return;
        }
    };

    Scene_KarsoShop.prototype.moveMatSelection = function(dir) {
        var cur = this._scatterGoods[this._selectedSlot];
        if (!cur) return;

        var bestIdx = -1;
        var bestDist = 999999;

        for (var i = 0; i < this._scatterGoods.length; i++) {
            if (i === this._selectedSlot) continue;
            var target = this._scatterGoods[i];
            if (!target || target.sold) continue;

            var dx = target.x - cur.x;
            var dy = target.y - cur.y;

            var valid = false;
            if (dir === 'right' && dx > 20 && Math.abs(dy) < 140) valid = true;
            else if (dir === 'left' && dx < -20 && Math.abs(dy) < 140) valid = true;
            else if (dir === 'down' && dy > 20 && Math.abs(dx) < 180) valid = true;
            else if (dir === 'up' && dy < -20 && Math.abs(dx) < 180) valid = true;

            if (valid) {
                var dist = dx * dx + dy * dy;
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = i;
                }
            }
        }

        if (bestIdx !== -1) {
            SoundManager.playCursor();
            this._selectedSlot = bestIdx;
            this.updateReticlePosition();
            this.updatePopupTooltip();
        }
    };

    // Input di Lembar Kertas Detail (Pembelian Barang)
    Scene_KarsoShop.prototype.handleDetailInput = function() {
        if (this._detailSlideState !== 'open') return;
        var cur = this._scatterGoods[this._selectedSlot];
        if (!cur || !cur.item) return;

        var partyGold = typeof $gameParty !== 'undefined' ? $gameParty.gold() : 0;
        var availableStock = (cur.stock !== undefined) ? cur.stock : 1;
        var maxAffordable = cur.price > 0 ? Math.floor(partyGold / cur.price) : availableStock;
        var maxQty = Math.max(1, Math.min(availableStock, Math.max(1, maxAffordable)));
        this._buyQuantity = this._buyQuantity || 1;

        if (Input.isRepeated('right') || Input.isRepeated('up')) {
            if (this._buyQuantity < maxQty) {
                SoundManager.playCursor();
                this._buyQuantity++;
                this.drawDetailSheet(cur);
            } else {
                SoundManager.playBuzzer();
            }
            return;
        }
        if (Input.isRepeated('left') || Input.isRepeated('down')) {
            if (this._buyQuantity > 1) {
                SoundManager.playCursor();
                this._buyQuantity--;
                this.drawDetailSheet(cur);
            } else {
                SoundManager.playBuzzer();
            }
            return;
        }

        if (Input.isTriggered('ok')) {
            this.executePurchase();
            return;
        }
        if (Input.isTriggered('cancel')) {
            this.closeDetailModal();
            return;
        }

        // Klik tombol Beli / Kembali / Selector Jumlah ◄ & ►
        if (TouchInput.isTriggered()) {
            var mx = TouchInput.x;
            var my = TouchInput.y;
            var sheetY = this._detailSheetContainer ? this._detailSheetContainer.y : 26;

            // Area tombol kurangi jumlah ◄ (x: 386 + 35 s/d 386 + 120, y: sheetY + 510 s/d sheetY + 548)
            if (mx >= 386 + 35 && mx <= 386 + 125 && my >= sheetY + 508 && my <= sheetY + 550) {
                if (this._buyQuantity > 1) {
                    SoundManager.playCursor();
                    this._buyQuantity--;
                    this.drawDetailSheet(cur);
                } else {
                    SoundManager.playBuzzer();
                }
                return;
            }
            // Area tombol tambah jumlah ► (x: 386 + 380 s/d 386 + 473, y: sheetY + 510 s/d sheetY + 550)
            if (mx >= 386 + 380 && mx <= 386 + 473 && my >= sheetY + 508 && my <= sheetY + 550) {
                if (this._buyQuantity < maxQty) {
                    SoundManager.playCursor();
                    this._buyQuantity++;
                    this.drawDetailSheet(cur);
                } else {
                    SoundManager.playBuzzer();
                }
                return;
            }
            // Area tombol beli di kertas (y: sheetY + 560 s/d sheetY + 604)
            if (mx >= 386 + 35 && mx <= 386 + 473 && my >= sheetY + 560 && my <= sheetY + 604) {
                this.executePurchase();
            } else if (mx < 386 || mx > 386 + 508 || my < sheetY || my > sheetY + 668) {
                // Klik di luar kertas -> kembali
                this.closeDetailModal();
            }
        }
    };

    // Input di Modal Buku Inventori (Jual Barang)
    Scene_KarsoShop.prototype.handleInventoryInput = function() {
        var items = this.getPlayerInventoryList();
        var totalPages = Math.max(1, Math.ceil(items.length / 24));
        var curPageCount = Math.min(24, Math.max(0, items.length - this._invPageIndex * 24));

        if (Input.isRepeated('right')) {
            var col = this._invSlotIndex % 4;
            if (col < 3 && this._invSlotIndex + 1 < curPageCount) {
                SoundManager.playCursor();
                this._invSlotIndex++;
                this.refreshInventoryBook();
            } else if (this._invPageIndex + 1 < totalPages) {
                SoundManager.playCursor();
                this._invPageIndex++;
                this._invSlotIndex = Math.floor(this._invSlotIndex / 4) * 4;
                this.refreshInventoryBook();
            }
        } else if (Input.isRepeated('left')) {
            var col = this._invSlotIndex % 4;
            if (col > 0) {
                SoundManager.playCursor();
                this._invSlotIndex--;
                this.refreshInventoryBook();
            } else if (this._invPageIndex > 0) {
                SoundManager.playCursor();
                this._invPageIndex--;
                this._invSlotIndex = Math.floor(this._invSlotIndex / 4) * 4 + 3;
                var newPageCount = Math.min(24, items.length - this._invPageIndex * 24);
                if (this._invSlotIndex >= newPageCount) {
                    this._invSlotIndex = Math.max(0, newPageCount - 1);
                }
                this.refreshInventoryBook();
            }
        } else if (Input.isRepeated('down')) {
            if (this._invSlotIndex + 4 < curPageCount) {
                SoundManager.playCursor();
                this._invSlotIndex += 4;
                this.refreshInventoryBook();
            }
        } else if (Input.isRepeated('up')) {
            if (this._invSlotIndex - 4 >= 0) {
                SoundManager.playCursor();
                this._invSlotIndex -= 4;
                this.refreshInventoryBook();
            }
        } else if (Input.isTriggered('pageup') || Input.isTriggered('left_shoulder') || (typeof Input.isTriggered === 'function' && Input.isTriggered('q'))) {
            if (this._invPageIndex > 0) {
                SoundManager.playCursor();
                this._invPageIndex--;
                var newPageCount = Math.min(24, items.length - this._invPageIndex * 24);
                if (this._invSlotIndex >= newPageCount) {
                    this._invSlotIndex = Math.max(0, newPageCount - 1);
                }
                this.refreshInventoryBook();
            }
        } else if (Input.isTriggered('pagedown') || Input.isTriggered('right_shoulder') || (typeof Input.isTriggered === 'function' && Input.isTriggered('w'))) {
            if (this._invPageIndex + 1 < totalPages) {
                SoundManager.playCursor();
                this._invPageIndex++;
                var newPageCount = Math.min(24, items.length - this._invPageIndex * 24);
                if (this._invSlotIndex >= newPageCount) {
                    this._invSlotIndex = Math.max(0, newPageCount - 1);
                }
                this.refreshInventoryBook();
            }
        }

        if (Input.isTriggered('ok')) {
            this.executeSell();
            return;
        }

        if (Input.isTriggered('cancel') || Input.isTriggered('tab')) {
            this.closeInventoryBook();
            return;
        }

        // Mouse / Touch input
        if (TouchInput.isTriggered()) {
            var mx = TouchInput.x;
            var my = TouchInput.y;

            // Klik pita Item di sebelah kiri buku -> tutup
            if (mx >= this._invBookContainer.x + 15 && mx <= this._invBookContainer.x + 239 && my >= 122 && my <= 203) {
                this.closeInventoryBook();
                return;
            }

            // Klik di luar area buku -> tutup
            if (mx < this._invBookContainer.x || mx > this._invBookContainer.x + 1280 || my < 0 || my > 720) {
                this.closeInventoryBook();
                return;
            }

            // Klik slot inventori di halaman kiri
            var pageLeftX = this._invBookContainer.x + 239;
            var pageLeftY = 21;
            var lx = mx - pageLeftX;
            var ly = my - pageLeftY;

            if (lx >= 52 && lx <= 52 + 390 && ly >= 42 && ly <= 42 + 566) {
                for (var r = 0; r < 6; r++) {
                    for (var c = 0; c < 4; c++) {
                        var sx = 52 + c * 100;
                        var sy = 42 + r * 96;
                        if (lx >= sx && lx <= sx + 90 && ly >= sy && ly <= sy + 86) {
                            var slotIdx = r * 4 + c;
                            if (slotIdx < curPageCount) {
                                if (this._invSlotIndex !== slotIdx) {
                                    SoundManager.playCursor();
                                    this._invSlotIndex = slotIdx;
                                    this.refreshInventoryBook();
                                }
                            }
                            return;
                        }
                    }
                }
            }

            // Klik navigasi halaman di halaman kiri
            if (lx >= 52 && lx <= 52 + 390 && ly >= 615 && ly <= 655) {
                if (lx < 240 && this._invPageIndex > 0) {
                    SoundManager.playCursor();
                    this._invPageIndex--;
                    this._invSlotIndex = 0;
                    this.refreshInventoryBook();
                    return;
                } else if (lx >= 240 && this._invPageIndex + 1 < totalPages) {
                    SoundManager.playCursor();
                    this._invPageIndex++;
                    this._invSlotIndex = 0;
                    this.refreshInventoryBook();
                    return;
                }
            }

            // Klik tombol Jual di halaman kanan
            var pageRightX = this._invBookContainer.x + 746;
            var pageRightY = 23;
            var rx = mx - pageRightX;
            var ry = my - pageRightY;

            // Tombol jual berada di rx: 40 - 468, ry: 214 + 258 = 472 s/d 515
            if (rx >= 40 && rx <= 468 && ry >= 470 && ry <= 520) {
                this.executeSell();
                return;
            }
        }
    };

    // ------------------------------------------------------------------------
    // INTEGRASI SISTEM & PLUGIN COMMAND
    // ------------------------------------------------------------------------
    if (typeof window !== 'undefined') {
        window.Scene_KarsoShop = Scene_KarsoShop;
        window.Scene_Shop = Scene_KarsoShop;
    }

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command && command.toLowerCase() === 'karsoshop') {
            if (args[0] && args[0].toLowerCase() === 'open') {
                SceneManager.push(Scene_KarsoShop);
            }
        }
    };

})();
