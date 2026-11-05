//=============================================================================
// Yure_StatusJournal.js
//=============================================================================
/*:
 * @plugindesc [v2.4] Menu Jurnal Status & Perlengkapan Kustom Scrapbook dengan Aset Resmi & Efek Jiwa Anchor.
 * @author Yure & Antigravity
 *
 * @param Journal Key
 * @text Tombol Pintasan Jurnal
 * @desc Kode tombol keyboard untuk membuka/menutup jurnal (73 = 'I').
 * @default 73
 *
 * @help
 * ============================================================================
 * PENJELASAN PLUGIN (v2.4)
 * ============================================================================
 * Plugin ini membangun Menu Jurnal Status & Perlengkapan Kustom berbasis Scrapbook
 * menggunakan aset visual resmi di folder:
 * img/menus/main/status/Journal-menu/
 * dan efek jiwa di folder:
 * img/menus/main/status/Journal-souls/
 *
 * PEMBARUAN & PERBAIKAN v2.4:
 * 1. Nyala Jiwa Cyclops Lebih ke Kiri (X=248): Inti bola mata jiwa kini 100% tepat
 *    di tengah pupil mata Cyclops dan seimbang antara kiri dan kanan.
 * 2. Posisi 7 Slot Sesuai Arahan Pengguna:
 *    - Souls (258, 344) & Acc 1 (156, 344) & Acc 2 (358, 344) sejajar rapi.
 *    - Seal 1 (185, 432) & Seal 2 (325, 432) pas di tengah gulungan kertas.
 *    - Catalyst 1 (150, 526) & Catalyst 2 (360, 526) pas di tengah botol ramuan.
 * 3. Penataan Teks Catatan 8 Baris Lengkap:
 *    - Garis 0 (Y=346): Judul Slot
 *    - Garis 1 (Y=376): Nama Item
 *    - Garis 2 s/d 7 (Y=412, 444, 480, 516, 548, 580): ATK, DEF, MAT, MDF, AGI,
 *      dan LUK berada di garis paling bawah buku catatan.
 * ============================================================================
 */

(function() {
    'use strict';

    // Polyfill roundRect untuk Chromium / NW.js versi lama
    if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            if (typeof r === 'undefined') r = 0;
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        };
    }

    var parameters = PluginManager.parameters('Yure_StatusJournal');
    var journalKey = Number(parameters['Journal Key'] || 73); // 73 = 'I'

    // ========================================================================
    // NULL-GUARD: Game_Party.battleMembers (mencegah crash saat actor null/undefined)
    // rpg_objects.js tidak punya guard terhadap actor null dari ID invalid
    // ========================================================================
    var _Game_Party_battleMembers = Game_Party.prototype.battleMembers;
    Game_Party.prototype.battleMembers = function() {
        return this.allMembers().slice(0, this.maxBattleMembers()).filter(function(actor) {
            return actor != null && actor.isAppeared();
        });
    };

    // ========================================================================
    // HELPER PEMUAT ASET RESMI
    // ========================================================================
    ImageManager.loadJournal = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-menu/', filename, 0, true);
    };

    ImageManager.loadJournalItem = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-Item/', filename, 0, true);
    };

    ImageManager.loadJournalSkill = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-skills/', filename, 0, true);
    };

    ImageManager.loadJournalSouls = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-souls/', filename, 0, true);
    };

    ImageManager.loadJournalConstellation = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-constellation/', filename, 0, true);
    };

    ImageManager.loadJournalArchive = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-archive/', filename, 0, true);
    };

    ImageManager.loadJournalParty = function(filename) {
        return this.loadBitmap('img/menus/main/status/Journal-party/', filename, 0, true);
    };

    // ========================================================================
    // MAPPING INPUT & PROTEKSI ANTI-SPAM (DEBOUNCE COOLDOWN)
    // ========================================================================
    function ensureJournalKeyMapped() {
        Input.keyMapper[journalKey] = 'statusJournal';
        Input.keyMapper[9]  = 'tab';       // 9 = Tab key
        Input.keyMapper[81] = 'pageup';    // 81 = Q key (Actor Prev)
        Input.keyMapper[87] = 'pagedown';  // 87 = W key (Actor Next)
        Input.keyMapper[49] = 'actor_1';   // 1 = Karakter 1
        Input.keyMapper[50] = 'actor_2';   // 2 = Karakter 2
        Input.keyMapper[51] = 'actor_3';   // 3 = Karakter 3
        Input.keyMapper[52] = 'actor_4';   // 4 = Karakter 4
        if (typeof ConfigManager !== 'undefined') {
            if (ConfigManager.keyMapper) {
                ConfigManager.keyMapper[journalKey] = 'statusJournal';
                ConfigManager.keyMapper[9]  = 'tab';
                ConfigManager.keyMapper[81] = 'pageup';
                ConfigManager.keyMapper[87] = 'pagedown';
            }
            if (ConfigManager.defaultMap) {
                ConfigManager.defaultMap[journalKey] = 'statusJournal';
                ConfigManager.defaultMap[9]  = 'tab';
                ConfigManager.defaultMap[81] = 'pageup';
                ConfigManager.defaultMap[87] = 'pagedown';
            }
        }
    }
    ensureJournalKeyMapped();

    var _journalCooldown = 0;

    var _Scene_Base_update = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function() {
        _Scene_Base_update.call(this);
        if (_journalCooldown > 0) {
            _journalCooldown--;
        }
    };

    var _Scene_Map_updateScene = Scene_Map.prototype.updateScene;
    Scene_Map.prototype.updateScene = function() {
        _Scene_Map_updateScene.call(this);
        if (!SceneManager.isSceneChanging() && _journalCooldown <= 0 && (!$gameSystem || $gameSystem.isMenuEnabled())) {
            if (Input.isTriggered('statusJournal')) {
                _journalCooldown = 20;
                SoundManager.playOk();
                SceneManager.push(Scene_StatusJournal);
            }
        }
    };

    //=============================================================================
    // DIRECT JOURNAL SHORTCUT (ESC / Cancel / Touch Cancel -> Scene_StatusJournal)
    //=============================================================================
    Scene_Map.prototype.callMenu = function() {
        if (_journalCooldown > 0) return;
        SoundManager.playOk();
        _journalCooldown = 20;
        SceneManager.push(Scene_StatusJournal);
        $gameTemp.clearDestination();
        this._mapNameWindow.hide();
        this._waitCount = 2;
    };

    // Redirect Event Command 351 (Open Menu Screen) to Scene_StatusJournal
    Game_Interpreter.prototype.command351 = function() {
        if (!$gameParty.inBattle()) {
            SceneManager.push(Scene_StatusJournal);
        }
        return true;
    };

    // Fallback: If Scene_Menu is ever created, redirect directly to Scene_StatusJournal
    var _Scene_Menu_create_redirect = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create_redirect.call(this);
        SceneManager.goto(Scene_StatusJournal);
    };

    var _Scene_Menu_commandPersonal = Scene_Menu.prototype.commandPersonal;
    Scene_Menu.prototype.commandPersonal = function() {
        if (this._commandWindow && this._commandWindow.currentSymbol() === 'status') {
            SoundManager.playOk();
            SceneManager.push(Scene_StatusJournal);
            return;
        }
        _Scene_Menu_commandPersonal.call(this);
    };

    var _Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
    Scene_Menu.prototype.onPersonalOk = function() {
        if (this._commandWindow) {
            var sym = this._commandWindow.currentSymbol();
            if (sym === 'status') {
                SoundManager.playOk();
                SceneManager.push(Scene_StatusJournal);
                return;
            } else if (sym === 'skill') {
                SoundManager.playOk();
                SceneManager.push(Scene_SkillJournal);
                return;
            }
        }
        _Scene_Menu_onPersonalOk.call(this);
    };

    var _Scene_Menu_commandItem = Scene_Menu.prototype.commandItem;
    Scene_Menu.prototype.commandItem = function() {
        SoundManager.playOk();
        SceneManager.push(Scene_ItemJournal);
    };

    var _Scene_Menu_commandSkill = Scene_Menu.prototype.commandSkill;
    Scene_Menu.prototype.commandSkill = function() {
        SoundManager.playOk();
        SceneManager.push(Scene_SkillJournal);
    };

        // ========================================================================
    // KONFIGURASI MASTER TATA LETAK JURNAL STATUS (v2.5)
    // ========================================================================
    var STATUS_JOURNAL_CONFIG = {
        "equipIconSize": 56,
        "slots": [
                {
                        "id": "acc1",
                        "name": "Accessory I",
                        "etypeId": 5,
                        "slotIndex": 4,
                        "gridX": 0,
                        "gridY": 0,
                        "iconType": "ring",
                        "x": 155,
                        "y": 338
                },
                {
                        "id": "souls",
                        "name": "Souls",
                        "etypeId": 1,
                        "slotIndex": 0,
                        "gridX": 1,
                        "gridY": 0,
                        "iconType": "flame",
                        "x": 257,
                        "y": 337
                },
                {
                        "id": "acc2",
                        "name": "Accessory II",
                        "etypeId": 5,
                        "slotIndex": 5,
                        "gridX": 2,
                        "gridY": 0,
                        "iconType": "ring",
                        "x": 364,
                        "y": 339
                },
                {
                        "id": "seal1",
                        "name": "Seal I",
                        "etypeId": 3,
                        "slotIndex": 2,
                        "gridX": 0,
                        "gridY": 1,
                        "iconType": "scroll",
                        "x": 189,
                        "y": 430
                },
                {
                        "id": "seal2",
                        "name": "Seal II",
                        "etypeId": 3,
                        "slotIndex": 6,
                        "gridX": 2,
                        "gridY": 1,
                        "iconType": "scroll",
                        "x": 328,
                        "y": 429
                },
                {
                        "id": "cat1",
                        "name": "Spirit Catalyst I",
                        "etypeId": 4,
                        "slotIndex": 3,
                        "gridX": 0,
                        "gridY": 2,
                        "iconType": "flask",
                        "x": 155,
                        "y": 522
                },
                {
                        "id": "cat2",
                        "name": "Spirit Catalyst II",
                        "etypeId": 4,
                        "slotIndex": 7,
                        "gridX": 2,
                        "gridY": 2,
                        "iconType": "flask",
                        "x": 365,
                        "y": 524
                }
        ],
        "soulEye": {
                "x": 252,
                "y": 159
        },
        "soulEyeByActor": {
                "Nia":    { "x": 252, "y": 159 },
                "Sophia": { "x": 252, "y": 159 },
                "Saki":   { "x": 252, "y": 159 }
        },
        "anchorWeapon": {
                "x": 0,
                "y": 0
        },
        "note": {
                "textX": 69,
                "titleY": 366,
                "itemY": 399,
                "lineYs": [
                        432,
                        464,
                        500,
                        536,
                        568,
                        600
                ],
                "statValX": 129,
                "statBonusX": 189,
                "hintY": 634
        },
        "octagram": {
                "x": 372,
                "y": 498,
                "rotation": -0.040,
                "w": 184,
                "h": 196
        },
        "bars": {
                "hp": {
                        "x": 300,
                        "y": 101,
                        "w": 172,
                        "h": 20
                },
                "mana": {
                        "x": 303,
                        "y": 143,
                        "w": 169,
                        "h": 22
                },
                "rage": {
                        "x": 306,
                        "y": 193,
                        "w": 166,
                        "h": 22
                },
                "mental": {
                        "x": 306,
                        "y": 237,
                        "w": 166,
                        "h": 23
                }
        },
        "polaroid": {
                "x": 69,
                "y": 8
        },
        "actorName": {
                "x": 268,
                "y": -4
        },
        "ribbons": [
                {
                        "label": "Status",
                        "file": "Status",
                        "y": 37,
                        "unselectedX": 157,
                        "selectedX": 15,
                        "peekX": 15
                },
                {
                        "label": "Item",
                        "file": "Item",
                        "y": 122,
                        "unselectedX": 180,
                        "selectedX": 15,
                        "peekX": 15
                },
                {
                        "label": "Party",
                        "file": "Party",
                        "y": 205,
                        "unselectedX": 173,
                        "selectedX": 15,
                        "peekX": 15
                },
                {
                        "label": "Skills",
                        "file": "Skills_",
                        "y": 287,
                        "unselectedX": 178,
                        "selectedX": 15,
                        "peekX": 15
                },
                {
                        "label": "Constellation",
                        "file": "Constellation_",
                        "y": 364,
                        "unselectedX": 170,
                        "selectedX": 15,
                        "peekX": 15
                },
                {
                        "label": "Archive",
                        "file": "Archive_",
                        "y": 442,
                        "unselectedX": 159,
                        "selectedX": 15,
                        "peekX": 15
                },
                {
                        "label": "Settings",
                        "file": "settings",
                        "y": 524,
                        "unselectedX": 172,
                        "selectedX": 15,
                        "peekX": 15
                },
                {
                        "label": "Exit",
                        "file": "Exit",
                        "y": 602,
                        "unselectedX": 153,
                        "selectedX": 15,
                        "peekX": 15
                }
        ],
        "itemJournal": {
                "grid": {
                        "startX": 52,
                        "startY": 42,
                        "spacingX": 100,
                        "spacingY": 96,
                        "cols": 4,
                        "rows": 6,
                        "slotW": 90,
                        "slotH": 86,
                        "iconSize": 58
                },
                "polaroid": {
                        "x": 142,
                        "y": 127,
                        "rotation": -0.148,
                        "photoCX": 118,
                        "photoCY": 105,
                        "photoScale": 2.5,
                        "iconSize": 100
                },
                "title": {
                        "x": 277,
                        "nameY": 78,
                        "catY": 106,
                        "subY": 132
                },
                "description": {
                        "x": 0,
                        "y": 214,
                        "w": 508,
                        "h": 355,
                        "textX": 40,
                        "textY": 115,
                        "lineHeight": 34,
                        "maxLines": 7
                }
        },
        "skillJournal": {
                "grid": {
                        "startX": 52,
                        "startY": 44,
                        "spacingX": 100,
                        "spacingY": 96,
                        "cols": 4,
                        "rows": 6,
                        "slotW": 90,
                        "slotH": 86,
                        "iconSize": 87
                },
                "polaroid": {
                        "x": 142,
                        "y": 127,
                        "rotation": -0.148,
                        "photoCX": 118,
                        "photoCY": 105,
                        "photoScale": 2.5,
                        "iconSize": 205
                },
                "title": {
                        "x": 277,
                        "nameY": 78,
                        "catY": 106,
                        "subY": 132
                },
                "description": {
                        "x": 1,
                        "y": 213,
                        "w": 508,
                        "h": 355,
                        "textX": 44,
                        "textY": 115,
                        "lineHeight": 34,
                        "maxLines": 7
                },
                "ribbons": {
                        "x": 268,
                        "restingY": 12,
                        "pullY": -35,
                        "y": 21
                }
        },
        "constellationJournal": {
                "tree": {
                        "x": 43,
                        "y": 18,
                        "w": 422,
                        "h": 613,
                        "file": "Untitled478_20260923104430"
                },
                "treeNodes": [
                        {
                                "id": 0,
                                "name": "Root Base",
                                "x": 74,
                                "y": 69,
                                "w": 143,
                                "h": 143,
                                "iconSize": 135
                        },
                        {
                                "id": 1,
                                "name": "Branch 1",
                                "x": 245,
                                "y": 154,
                                "w": 143,
                                "h": 143,
                                "iconSize": 135
                        },
                        {
                                "id": 2,
                                "name": "Branch 2",
                                "x": 75,
                                "y": 258,
                                "w": 143,
                                "h": 143,
                                "iconSize": 135
                        },
                        {
                                "id": 3,
                                "name": "Branch 3",
                                "x": 244,
                                "y": 364,
                                "w": 143,
                                "h": 143,
                                "iconSize": 135
                        },
                        {
                                "id": 4,
                                "name": "Branch 4",
                                "x": 74,
                                "y": 449,
                                "w": 143,
                                "h": 143,
                                "iconSize": 135
                        }
                ],
                "romanRibbons": {
                        "x": 236,
                        "y": 520,
                        "w": 229,
                        "h": 205,
                        "files": [
                                "Untitled478_20260923104449",
                                "Untitled478_20260923104447",
                                "Untitled478_20260923104445"
                        ]
                },
                "actorCard": {
                        "x": 14,
                        "y": 8,
                        "w": 250,
                        "h": 150
                },
                "categoryRibbons": {
                        "startX": 295,
                        "y": 4,
                        "spacing": 70,
                        "w": 49,
                        "h": 157,
                        "files": [
                                "Attack",
                                "Defends",
                                "Special"
                        ]
                },
                "grid": {
                        "startX": 12,
                        "startY": 146,
                        "cols": 4,
                        "rows": 5,
                        "spacingX": 122,
                        "spacingY": 98,
                        "slotW": 108,
                        "slotH": 92,
                        "iconSize": 76
                }
        },
        "archiveJournal": {
                "hub": {
                        "memories": {
                                "x": 25,
                                "y": 25,
                                "w": 458,
                                "h": 618
                        },
                        "notes": {
                                "x": 25,
                                "y": 25,
                                "w": 458,
                                "h": 618
                        }
                },
                "gallery": {
                        "leftSlots": [
                                {
                                        "x": 30,
                                        "y": 45,
                                        "w": 215,
                                        "h": 265
                                },
                                {
                                        "x": 260,
                                        "y": 45,
                                        "w": 215,
                                        "h": 265
                                },
                                {
                                        "x": 30,
                                        "y": 340,
                                        "w": 215,
                                        "h": 265
                                },
                                {
                                        "x": 260,
                                        "y": 340,
                                        "w": 215,
                                        "h": 265
                                }
                        ],
                        "rightSlots": [
                                {
                                        "x": 30,
                                        "y": 45,
                                        "w": 215,
                                        "h": 265
                                },
                                {
                                        "x": 260,
                                        "y": 45,
                                        "w": 215,
                                        "h": 265
                                },
                                {
                                        "x": 30,
                                        "y": 340,
                                        "w": 215,
                                        "h": 265
                                },
                                {
                                        "x": 260,
                                        "y": 340,
                                        "w": 215,
                                        "h": 265
                                }
                        ]
                },
                "logs": {
                        "list": {
                                "x": 20,
                                "y": 40,
                                "w": 468,
                                "rowH": 68,
                                "visibleRows": 7
                        },
                        "detail": {
                                "x": 20,
                                "y": 40,
                                "w": 468,
                                "h": 580
                        }
                }
        }
};
    var JOURNAL_SLOTS = STATUS_JOURNAL_CONFIG.slots;
    var SOUL_EYE_COORD = STATUS_JOURNAL_CONFIG.soulEye;
    var RIBBON_TABS = STATUS_JOURNAL_CONFIG.ribbons;

    // Data Karakter Resmi Scrapbook Party & Status Name Badge
    var PARTY_CHARACTERS = {
        1: {
            id: 1,
            name: 'Nia',
            icon: 'Nia icon',
            nameBadge: 'Nia name',
            nameBBox: { sx: 46, sy: 87, sw: 94, sh: 43 },
            color: '#e11d48',
            tagColor: '#fda4af',
            profile: 'Gadis ceria penjaga kedai yang terjebak dalam anomali misterius. Mengendalikan jiwa Cyclops dengan keberanian dan tekad tinggi demi melindungi teman-temannya.'
        },
        2: {
            id: 2,
            name: 'Sophia',
            icon: 'Sophia icon',
            nameBadge: 'Sophia name',
            nameBBox: { sx: 36, sy: 72, sw: 118, sh: 43 },
            color: '#0284c7',
            tagColor: '#7dd3fc',
            profile: 'Ilmuwan alkimia dan ahli taktik berdarah dingin. Mengurai fenomena misterius dengan ramuan spiritual dan logika analitis yang tajam.'
        },
        3: {
            id: 3,
            name: 'Saki',
            icon: 'Saki icon_',
            nameBadge: 'Saki name',
            nameBBox: { sx: 60, sy: 80, sw: 79, sh: 36 },
            color: '#0d9488',
            tagColor: '#5eead4',
            profile: 'Gadis pelindung bertameng mistis yang pendiam. Menyimpan tekad teguh dan kekuatan batin luar biasa untuk menjadi perisai bagi kelompok.'
        }
    };

    // Auto-load konfigurasi kalibrasi tersimpan dari data/Yure_JournalConfig.json / localStorage
    (function loadSavedJournalConfig() {
        try {
            var cfg = null;
            if (typeof require !== 'undefined') {
                var fs = require('fs');
                var path = require('path');
                var cfgPath = path.join(process.cwd(), 'data', 'Yure_JournalConfig.json');
                if (fs.existsSync(cfgPath)) {
                    cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
                }
            }
            if (!cfg && typeof localStorage !== 'undefined') {
                var stored = localStorage.getItem('Yure_JournalConfig');
                if (stored) cfg = JSON.parse(stored);
            }
            if (cfg) {
                if (cfg.slots && Array.isArray(cfg.slots)) {
                    for (var i = 0; i < cfg.slots.length; i++) {
                        var s = cfg.slots[i];
                        var target = STATUS_JOURNAL_CONFIG.slots.find(function(item) { return item.id === s.id; });
                        if (target) {
                            target.x = s.x;
                            target.y = s.y;
                        }
                    }
                }
                if (cfg.soulEye) {
                    STATUS_JOURNAL_CONFIG.soulEye.x = cfg.soulEye.x;
                    STATUS_JOURNAL_CONFIG.soulEye.y = cfg.soulEye.y;
                }
                if (cfg.anchorWeapon) {
                    STATUS_JOURNAL_CONFIG.anchorWeapon.x = cfg.anchorWeapon.x;
                    STATUS_JOURNAL_CONFIG.anchorWeapon.y = cfg.anchorWeapon.y;
                }
                if (cfg.note) {
                    for (var k in cfg.note) {
                        STATUS_JOURNAL_CONFIG.note[k] = cfg.note[k];
                    }
                }
                if (cfg.bars) {
                    for (var b in cfg.bars) {
                        STATUS_JOURNAL_CONFIG.bars[b] = cfg.bars[b];
                    }
                }
                if (cfg.polaroid) {
                    STATUS_JOURNAL_CONFIG.polaroid.x = cfg.polaroid.x;
                    STATUS_JOURNAL_CONFIG.polaroid.y = cfg.polaroid.y;
                }
                if (cfg.actorName) {
                    STATUS_JOURNAL_CONFIG.actorName = {
                        x: cfg.actorName.x !== undefined ? cfg.actorName.x : 240,
                        y: cfg.actorName.y !== undefined ? cfg.actorName.y : 12
                    };
                }
                if (cfg.ribbons && Array.isArray(cfg.ribbons)) {
                    for (var r = 0; r < cfg.ribbons.length; r++) {
                        var rb = cfg.ribbons[r];
                        if (STATUS_JOURNAL_CONFIG.ribbons[r]) {
                            if (rb.y != null) STATUS_JOURNAL_CONFIG.ribbons[r].y = rb.y;
                            if (rb.unselectedX != null) STATUS_JOURNAL_CONFIG.ribbons[r].unselectedX = rb.unselectedX;
                            if (rb.selectedX != null) STATUS_JOURNAL_CONFIG.ribbons[r].selectedX = rb.selectedX;
                            if (rb.peekX != null) STATUS_JOURNAL_CONFIG.ribbons[r].peekX = rb.peekX;
                        }
                    }
                }
                if (cfg.itemJournal) {
                    STATUS_JOURNAL_CONFIG.itemJournal = cfg.itemJournal;
                }
                if (cfg.skillJournal) {
                    STATUS_JOURNAL_CONFIG.skillJournal = cfg.skillJournal;
                }
                if (cfg.constellationJournal) {
                    STATUS_JOURNAL_CONFIG.constellationJournal = cfg.constellationJournal;
                }
            }
        } catch(e) {
            console.warn('[Yure_StatusJournal] Failed to load saved config:', e);
        }
    })();

    if (typeof window !== 'undefined') {
        window.STATUS_JOURNAL_CONFIG = STATUS_JOURNAL_CONFIG;
        window.JOURNAL_SLOTS = STATUS_JOURNAL_CONFIG.slots;
        window.SOUL_EYE_COORD = STATUS_JOURNAL_CONFIG.soulEye;
    }

    // ========================================================================
    // SISTEM KOMPATIBILITAS SLOT PERLENGKAPAN KUSTOM
    // ========================================================================
    function isSlotEtypeCompatible(slotEtype, itemEtype) {
        if (!slotEtype || !itemEtype) return false;
        if (slotEtype === itemEtype) return true;
        // Seal: etype 3 dan 7 saling kompatibel
        if ((slotEtype === 3 || slotEtype === 7) && (itemEtype === 3 || itemEtype === 7)) return true;
        // Spirit Catalyst: etype 4 dan 8 saling kompatibel
        if ((slotEtype === 4 || slotEtype === 8) && (itemEtype === 4 || itemEtype === 8)) return true;
        // Accessory: etype 5 dan 6 saling kompatibel
        if ((slotEtype === 5 || slotEtype === 6) && (itemEtype === 5 || itemEtype === 6)) return true;
        return false;
    }

    // Izinkan pemasangan perlengkapan kustom di slot jurnal tanpa diblokir trait class RPG Maker
    var _Game_Actor_canEquip = Game_Actor.prototype.canEquip;
    Game_Actor.prototype.canEquip = function(item) {
        if (!item) return false;
        var e = item.etypeId;
        // Souls (1), Anchor (2), Seal (3, 7), Spirit Catalyst (4, 8), Accessory (5, 6)
        if (e >= 1 && e <= 8) {
            return true;
        }
        return _Game_Actor_canEquip ? _Game_Actor_canEquip.call(this, item) : true;
    };

    var _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function(slotId, item) {
        if (!this._equips[slotId]) this._equips[slotId] = new Game_Item();
        var curSlots = this.equipSlots();
        var slotEtype = curSlots[slotId];

        // Jika item sedang dipakai di slot lain pada karakter ini, lepaskan dulu dari slot lama
        if (item && !$gameParty.hasItem(item)) {
            var otherSlot = this.equips().indexOf(item);
            if (otherSlot >= 0 && otherSlot !== slotId) {
                this._equips[otherSlot].setObject(null);
                $gameParty.gainItem(item, 1);
            }
        }

        if (this.tradeItemWithParty(item, this.equips()[slotId]) &&
            (!item || isSlotEtypeCompatible(slotEtype, item.etypeId))) {
            this._equips[slotId].setObject(item);
            this.refresh();
        }
    };

    var _Game_Actor_releaseUnequippableItems = Game_Actor.prototype.releaseUnequippableItems;
    Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
        for (;;) {
            var slots = this.equipSlots();
            var equips = this.equips();
            var changed = false;
            for (var i = 0; i < equips.length; i++) {
                var item = equips[i];
                if (item && (!this.canEquip(item) || !isSlotEtypeCompatible(slots[i], item.etypeId))) {
                    if (!forcing) {
                        this.tradeItemWithParty(null, item);
                    }
                    this._equips[i].setObject(null);
                    changed = true;
                }
            }
            if (!changed) {
                break;
            }
        }
    };

    // ========================================================================
    // SCENE_STATUSJOURNAL (v2.4 Master 1280x720)
    // ========================================================================
        // ========================================================================
    // SCENE_STATUSJOURNAL (Master 1280x720 Scrapbook Menu)
    // ========================================================================
        // ========================================================================
    // LIVE MOUSE HOVER TRACKER (Aman & Akurat untuk Menu Jurnal)
    // TouchInput bawaan RPG Maker MV hanya update saat mouse diklik, sehingga
    // koordinat lama tersimpan permanen dan membuat pita (seperti Party) 'nyangkut' aktif terus.
    // Tracker ini membaca koordinat kursor mouse asli secara real-time.
    // ========================================================================
    var _journalRealMouseX = -9999;
    var _journalRealMouseY = -9999;
    var _journalMouseInWindow = false;

    if (typeof document !== 'undefined') {
        document.addEventListener('mousemove', function(e) {
            if (!Graphics || !Graphics._canvas) return;
            var rect = Graphics._canvas.getBoundingClientRect();
            var clientX = e.clientX - rect.left;
            var clientY = e.clientY - rect.top;
            if (clientX >= 0 && clientX <= rect.width && clientY >= 0 && clientY <= rect.height) {
                _journalMouseInWindow = true;
                _journalRealMouseX = Graphics.pageToCanvasX ? Graphics.pageToCanvasX(e.pageX) : (clientX * (Graphics.boxWidth / rect.width));
                _journalRealMouseY = Graphics.pageToCanvasY ? Graphics.pageToCanvasY(e.pageY) : (clientY * (Graphics.boxHeight / rect.height));
            } else {
                _journalMouseInWindow = false;
                _journalRealMouseX = -9999;
                _journalRealMouseY = -9999;
            }
        });

        document.addEventListener('mouseleave', function() {
            _journalMouseInWindow = false;
            _journalRealMouseX = -9999;
            _journalRealMouseY = -9999;
        });
    }

    function Scene_StatusJournal() {
        this.initialize.apply(this, arguments);
    }

    Scene_StatusJournal.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_StatusJournal.prototype.constructor = Scene_StatusJournal;

    Scene_StatusJournal.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
        this._activeJournalTab = (this._initialTab !== undefined) ? this._initialTab : 0; // 0=Status, 1=Item
        this._selectedRibbonIndex = this._activeJournalTab;
        this._selectedSlotIndex = 0;       // Untuk Status (0..6)
        this._itemSlotIndex = 0;           // Untuk Item (0..23)
        this._itemPageIndex = 0;           // Paginasi Item (> 24)
        this._skillSlotIndex = 0;          // Untuk Skill (0..23)
        this._skillRibbonIndex = 0;        // 0=Attack, 1=Defends, 2=Special
        this._skillRibbonSprites = [];
        this._skillSingleRibbonSprite = null;
        this._focusMode = 'ribbon';        // Mulai di Pita agar navigasi atas/bawah langsung aktif!
        this._shiftActive = false;
        this._drawerActive = false;
        this._drawerIndex = 0;
        this._drawerScrollX = 0;
        this._drawerTargetScrollX = 0;
        this._drawerItems = [];
        this._isFlippingPage = false;
        this._flipProgress = 0;
        this._flipDirection = 1;           // 1 = Forward (Status->Item), -1 = Backward (Item->Status)
        this._previousJournalTab = 0;
        this._pulseTimer = 0;
        this._soulFlickerTimer = 0;
        this._toastTimer = 0;
        this._toastMessage = '';
        this._ribbonBadgeSprites = [];
        this._badgePulseTimer = 0;
        this._constellationNodeIndex = 0;   // 0..4 (5 Node Pohon Konstelasi)
        this._constellationGridIndex = 0;   // 0..19 (20 Slot Grid Skill)
        this._constellationRomanIndex = 0;  // 0=I, 1=II, 2=III (Preset Kombo)
        this._constellationCatIndex = 0;    // 0=Attack, 1=Defends, 2=Special
        this._constellationFocus = 'tree';  // 'tree' | 'grid' | 'category'
        this._constellationSlotEntered = false;
        // Status Navigasi Tab 5: Archive
        this._archiveSubMode = 'hub';        // 'hub' | 'gallery' | 'logs' | 'viewer'
        this._archiveHubFocus = 'memories';  // 'memories' | 'logs'
        this._archiveGalleryIndex = 0;       // 0..7 (8 slot Polaroid)
        this._archiveGalleryPage = 0;        // Halaman galeri
        this._archiveLogIndex = 0;          // Index entri log aktif
        this._archiveLogFilter = 'all';      // 'all' | 'dialogue' | 'item' | 'status'
        this._archiveViewerItem = null;      // CG item fullscreen
        this._archiveViewerZoom = 1.0; // true jika sudah menekan Enter masuk ke dalam slot kombo
        this._isOpening = false;
        this._openProgress = 0;
        this._isClosing = false;
        this._closeProgress = 0;
        this._currentSoulDrawn = null;
        this._targetActorIndex = 0;
        this._selectedPartyRow = 1;        // 0=Nia (Leader), 1=Slot 2, 2=Slot 3
        this._partySubMode = 'slots';      // 'slots' (left) or 'picker' (right)
        this._partyPickerIndex = 0;        // 0=Sophia, 1=Saki, 2=Kosong
        this._partyNoteMode = 'stats';     // 'stats' or 'profile'
    };

    Scene_StatusJournal.prototype.popScene = function() {
        if (this._isClosing) return;
        if (this._isOpening) return;
        if (SceneManager.isSceneChanging()) return;

        this._isClosing = true;
        this._closeProgress = 0;
        _journalCooldown = 25;
        Input.clear();

        // Audio: Tutup buku tebal yang mantap
        AudioManager.playSe({ name: 'Book2', volume: 90, pitch: 100, pan: 0 });

        // Sembunyikan kursor visual dan modal saat menutup
        if (this._ribbonCursorSprite) this._ribbonCursorSprite.visible = false;
        if (this._slotReticleSprite) this._slotReticleSprite.visible = false;
        if (this._itemReticleSprite) this._itemReticleSprite.visible = false;
        if (this._drawerSprite) this._drawerSprite.visible = false;
        if (this._itemTargetModal) this._itemTargetModal.visible = false;
        if (this._skillEquipModal) this._skillEquipModal.visible = false;
        if (this._skillActionModal) this._skillActionModal.visible = false;
        if (this._partyReticleSprite) this._partyReticleSprite.visible = false;
        if (this._partyPickerReticleSprite) this._partyPickerReticleSprite.visible = false;
        if (this._footerGuideSprite) this._footerGuideSprite.opacity = 0;
    };

    Scene_StatusJournal.prototype.attachSafeLoadListener = function(bitmap, key, callback) {
        if (!bitmap || bitmap.isReady() || bitmap.isError()) return;
        if (!bitmap._journalLoadListeners) {
            bitmap._journalLoadListeners = {};
        }
        if (bitmap._journalLoadListeners[key]) return;
        bitmap._journalLoadListeners[key] = true;

        var self = this;
        bitmap.addLoadListener(function() {
            setTimeout(function() {
                if (SceneManager._scene === self) {
                    callback.call(self);
                }
            }, 0);
        });
    };

    // Helper: Ambil HTMLImageElement atau Canvas dari objek Bitmap RPG Maker MV secara aman
    // Menggunakan __canvas dan _image (private) untuk menghindari getter _canvas yang bisa membuat 1x1 canvas kosong
    Scene_StatusJournal.prototype.getRawImage = function(bmp) {
        if (!bmp) return null;
        // Prioritas: _image (raw HTMLImageElement) - paling andal, langsung dari file
        if (bmp._image && bmp._image.width > 0 && bmp._image.height > 0) return bmp._image;
        // __canvas - direct private field (sudah ada dan sudah di-draw dari _image)
        if (bmp.__canvas && bmp.__canvas.width > 1 && bmp.__canvas.height > 1) return bmp.__canvas;
        // _baseTexture.source - canvas PIXI
        if (bmp.__baseTexture && bmp.__baseTexture.source) {
            var src = bmp.__baseTexture.source;
            if (src && (src.width > 1 || src.naturalWidth > 0)) return src;
        }
        // Last resort aman: cek _canvas tapi jangan trigger lazy-create jika bmp._image null
        if (bmp.__canvas) return bmp.__canvas;
        return null;
    };

    Scene_StatusJournal.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createDeskBackdrop();            // Layer 1: Meja kayu di belakang buku
        this.createJournalRoot();             // Master container untuk buku (zoom & fade)
        this.createBookBase();                // Layer 2: Whole book.png
        this.createRibbonContainers();        // Layer 3: Pita di bawah halaman kiri (tucked under page)
        this.createLeftPageBase();            // Layer 4: Left page.png (kertas solid pembatas)
        
        // Halaman Konten (Status, Item & Party)
        this.createStatusPageContents();      // Halaman Status (Gauges, Polaroid, 7 Slots, Jiwa, Anchor)
        this.createItemPageContents();        // Halaman Item (24 Grid Slots, Polaroid Miring, Catatan Lore)
        this.createPartyPageContents();       // Halaman Party (3 Rows, Polaroids + blank.png notes, Darkroom Hanging Picker)
        this.createSkillPageContents();       // Halaman Skills (24 Slots, Polaroid Miring, Catatan Lore, 3 Bookmark Ribbons)
        this.createConstellationPageContents(); // Halaman Constellation (Pohon 5 Node, ID Card, 3 Kategori, 20 Slot)
        this.createArchivePageContents();       // Halaman Archive (Tumpukan Polaroid, Album Galeri CG 8-Slot, Log Petualangan)
        this.createPageFlipOverlay();         // Overlay Animasi Membalik Halaman Buku Realistis
        
        this.createDrawerContainer();         // Laci Drawer Perlengkapan
        this.createItemTargetModal();         // Modal Target Penggunaan Item
        this.createFooterGuide();             // Petunjuk Navigasi Bawah

        var iconSet = ImageManager.loadSystem('IconSet');
        if (iconSet && !iconSet.isReady()) {
            this.attachSafeLoadListener(iconSet, 'create_refreshAll', this.refreshAll);
        }
        var skillSheet = typeof ImageManager.loadSkillSheet === 'function' ? ImageManager.loadSkillSheet() : null;
        if (skillSheet && !skillSheet.isReady()) {
            this.attachSafeLoadListener(skillSheet, 'create_skillSheet', this.refreshAll);
        }
        var itemSheet = typeof ImageManager.loadItemSheet === 'function' ? ImageManager.loadItemSheet() : null;
        if (itemSheet && !itemSheet.isReady()) {
            this.attachSafeLoadListener(itemSheet, 'create_itemSheet', this.refreshAll);
        }
        var basicBmp = typeof ImageManager.loadBasicSkillIcon === 'function' ? ImageManager.loadBasicSkillIcon() : null;
        if (basicBmp && !basicBmp.isReady()) {
            this.attachSafeLoadListener(basicBmp, 'create_basicBmp', this.refreshAll);
        }

        this.updateTabVisibility();
        this.refreshAll();
    };

    Scene_StatusJournal.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
        this._openKeyCooldown = 20;
        this.updateTabVisibility();
        this.refreshAll();
        this.startOpenAnimation();
    };

    // ------------------------------------------------------------------------
    // SISTEM ANIMASI MEMBUKA & MENUTUP BUKU JURNAL (LIVING SCRAPBOOK)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.startOpenAnimation = function() {
        this._isOpening = true;
        this._openProgress = 0;
        this._isClosing = false;
        this._closeProgress = 0;

        // Audio: Lembaran buku tebal dibuka
        AudioManager.playSe({ name: 'Book1', volume: 90, pitch: 100, pan: 0 });

        if (this._deskSprite) {
            this._deskSprite.opacity = 0;
        }

        var baseS = this._journalScale || 1.0;
        var startS = baseS * 0.90;
        var sw = Graphics.boxWidth || 1280;
        var sh = Graphics.boxHeight || 720;
        if (this._journalRoot) {
            this._journalRoot.scale.x = startS;
            this._journalRoot.scale.y = startS;
            this._journalRoot.opacity = 0;
            this._journalRoot.x = Math.round(sw / 2 - 640 * startS);
            this._journalRoot.y = Math.round(sh / 2 - 360 * startS + 18);
        }

        if (this._ribbonSprites) {
            for (var i = 0; i < this._ribbonSprites.length; i++) {
                this._ribbonSprites[i].x = 75;
                this._ribbonSprites[i]._targetX = 75;
            }
        }

        if (this._ribbonCursorSprite) this._ribbonCursorSprite.visible = false;
        if (this._slotReticleSprite) this._slotReticleSprite.visible = false;
        if (this._itemReticleSprite) this._itemReticleSprite.visible = false;
        if (this._partyReticleSprite) this._partyReticleSprite.visible = false;
        if (this._partyPickerReticleSprite) this._partyPickerReticleSprite.visible = false;
        if (this._footerGuideSprite) this._footerGuideSprite.opacity = 0;
    };

    Scene_StatusJournal.prototype.updateOpenAnimation = function() {
        this._openProgress += 0.056; // ~18 frame = ~0.30 detik
        var p = Math.min(1.0, this._openProgress);

        // Easing: easeOutCubic
        var t = 1 - Math.pow(1 - p, 3);

        var baseS = this._journalScale || 1.0;
        var curS = baseS * (0.90 + 0.10 * t);
        var sw = Graphics.boxWidth || 1280;
        var sh = Graphics.boxHeight || 720;

        if (this._deskSprite) {
            this._deskSprite.opacity = Math.min(255, Math.round(p * 2.2 * 255));
        }

        if (this._journalRoot) {
            this._journalRoot.scale.x = curS;
            this._journalRoot.scale.y = curS;
            this._journalRoot.opacity = Math.min(255, Math.round(p * 2.5 * 255));
            this._journalRoot.x = Math.round(sw / 2 - 640 * curS);
            this._journalRoot.y = Math.round(sh / 2 - 360 * curS + (1 - t) * 18);
        }

        // Animasi pita menyembul keluar saat buku hampir terbuka
        if (p > 0.25 && this._ribbonSprites) {
            var subP = (p - 0.25) / 0.75;
            var ribbonEase = Math.sin(subP * Math.PI * 0.5);
            for (var i = 0; i < this._ribbonSprites.length; i++) {
                var def = RIBBON_TABS[i];
                var isSel = (i === this._selectedRibbonIndex);
                var targetX = isSel ? (def.selectedX !== undefined ? def.selectedX : 15) : (def.unselectedX !== undefined ? def.unselectedX : 185);
                this._ribbonSprites[i].x = 75 - (75 - targetX) * ribbonEase;
                this._ribbonSprites[i]._targetX = targetX;
            }
        }

        // Efek bayangan sibakan halaman kanan membuka dari spine ke tepi luar
        if (this._pageFlipSprite) {
            var bmp = this._pageFlipSprite.bitmap;
            bmp.clear();
            var ctx = bmp._context;
            var spineX = 746;
            var curlX = spineX + t * 508;
            var shadowW = Math.max(0, 42 * (1 - t));

            if (shadowW > 2 && curlX < 1250) {
                ctx.save();
                var shadowGrad = ctx.createLinearGradient(curlX - 10, 0, curlX + shadowW, 0);
                shadowGrad.addColorStop(0, 'rgba(15, 10, 5, 0.45)');
                shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = shadowGrad;
                ctx.fillRect(curlX - 10, 20, shadowW + 20, 660);
                ctx.restore();
                bmp._setDirty();
            }
        }

        if (p >= 1.0) {
            this._isOpening = false;
            if (this._pageFlipSprite) {
                this._pageFlipSprite.bitmap.clear();
                this._pageFlipSprite.bitmap._setDirty();
            }
            if (this._deskSprite) this._deskSprite.opacity = 255;
            if (this._journalRoot) {
                this._journalRoot.scale.x = baseS;
                this._journalRoot.scale.y = baseS;
                this._journalRoot.x = this._journalBaseX;
                this._journalRoot.y = this._journalBaseY;
                this._journalRoot.opacity = 255;
            }
            if (this._footerGuideSprite) this._footerGuideSprite.opacity = 255;
            this.updateRibbonTargets();
            if (this._focusMode === 'ribbon') {
                if (this._ribbonCursorSprite) this._ribbonCursorSprite.visible = true;
            } else if (this._focusMode === 'slots') {
                if (this._activeJournalTab === 0 && this._slotReticleSprite) this._slotReticleSprite.visible = true;
                if (this._activeJournalTab === 1 && this._itemReticleSprite) this._itemReticleSprite.visible = true;
                if (this._activeJournalTab === 2 && this._partyReticleSprite) this._partyReticleSprite.visible = true;
                if (this._activeJournalTab === 3 && this._skillReticleSprite) this._skillReticleSprite.visible = true;
                if (this._activeJournalTab === 4) this.updateConstellationReticles();
                if (this._activeJournalTab === 5) this.updateArchiveReticle();
            }
            this.drawFooterGuide();
        }
    };

    Scene_StatusJournal.prototype.updateCloseAnimation = function() {
        this._closeProgress += 0.067; // ~15 frame = ~0.25 detik
        var p = Math.min(1.0, this._closeProgress);

        // Easing: easeInQuad (berakselerasi menutup mantap)
        var t = p * p;

        var baseS = this._journalScale || 1.0;
        var curS = baseS * (1.0 - 0.08 * t);
        var sw = Graphics.boxWidth || 1280;
        var sh = Graphics.boxHeight || 720;

        if (this._deskSprite) {
            this._deskSprite.opacity = Math.max(0, Math.round((1 - p) * 255));
        }

        if (this._journalRoot) {
            this._journalRoot.scale.x = curS;
            this._journalRoot.scale.y = curS;
            this._journalRoot.opacity = Math.max(0, Math.round((1 - p) * 255));
            this._journalRoot.x = Math.round(sw / 2 - 640 * curS);
            this._journalRoot.y = Math.round(sh / 2 - 360 * curS + t * 15);
        }

        // Pita menyusup cepat kembali ke dalam balik kertas kiri
        if (this._ribbonSprites) {
            for (var i = 0; i < this._ribbonSprites.length; i++) {
                var sp = this._ribbonSprites[i];
                sp.x += (75 - sp.x) * 0.35;
            }
        }

        // Efek bayangan lembaran halaman kanan melipat menutup ke arah spine
        if (this._pageFlipSprite) {
            var bmp = this._pageFlipSprite.bitmap;
            bmp.clear();
            var ctx = bmp._context;
            var spineX = 746;
            var curlX = 1254 - t * (1254 - spineX);
            var shadowW = 35 + t * 25;

            ctx.save();
            var shadowGrad = ctx.createLinearGradient(curlX - shadowW, 0, curlX + 10, 0);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            shadowGrad.addColorStop(0.7, 'rgba(15, 10, 5, 0.55)');
            shadowGrad.addColorStop(1, 'rgba(15, 10, 5, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.fillRect(curlX - shadowW, 20, shadowW + 20, 660);

            var foldGrad = ctx.createLinearGradient(curlX - 10, 0, curlX + 25, 0);
            foldGrad.addColorStop(0, 'rgba(255, 245, 220, 0.35)');
            foldGrad.addColorStop(0.5, 'rgba(230, 215, 185, 0.6)');
            foldGrad.addColorStop(1, 'rgba(100, 70, 40, 0.25)');
            ctx.fillStyle = foldGrad;
            ctx.fillRect(curlX - 10, 20, 35, 660);
            ctx.restore();
            bmp._setDirty();
        }

        if (p >= 1.0) {
            this._isClosing = false;
            SoundManager.playCancel();
            Scene_MenuBase.prototype.popScene.call(this);
        }
    };

    // ------------------------------------------------------------------------
    // Kontainer Master 1280 x 720 dengan Penskalaan Otomatis
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.createJournalRoot = function() {
        this._journalRoot = new Sprite();
        var sw = Graphics.boxWidth || 1280;
        var sh = Graphics.boxHeight || 720;
        var scale = Math.min(sw / 1280, sh / 720);
        this._journalScale = scale;
        this._journalBaseX = Math.round((sw - 1280 * scale) / 2);
        this._journalBaseY = Math.round((sh - 720 * scale) / 2);
        this._journalRoot.scale.x = scale;
        this._journalRoot.scale.y = scale;
        this._journalRoot.x = this._journalBaseX;
        this._journalRoot.y = this._journalBaseY;
        this.addChild(this._journalRoot);
    };

    Scene_StatusJournal.prototype.createDeskBackdrop = function() {
        var sw = Math.max(1280, Graphics.boxWidth || 1280);
        var sh = Math.max(720, Graphics.boxHeight || 720);
        this._deskSprite = new Sprite();
        this._deskSprite.bitmap = new Bitmap(sw, sh);
        var ctx = this._deskSprite.bitmap._context;

        var woodGrad = ctx.createLinearGradient(0, 0, sw, sh);
        woodGrad.addColorStop(0, '#1a100a');
        woodGrad.addColorStop(0.5, '#0f0a06');
        woodGrad.addColorStop(1, '#080503');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, 0, sw, sh);

        var vig = ctx.createRadialGradient(sw / 2, sh / 2, 250, sw / 2, sh / 2, 700);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, sw, sh);

        this._deskSprite.bitmap._setDirty();
        this.addChild(this._deskSprite);
    };

    Scene_StatusJournal.prototype.createBookBase = function() {
        this._bookSprite = new Sprite();
        this._bookSprite.bitmap = ImageManager.loadJournal('Whole book');
        this._bookSprite.x = 0;
        this._bookSprite.y = 0;
        this._journalRoot.addChild(this._bookSprite);
    };

    // ------------------------------------------------------------------------
    // Layer 3: Kontainer Pita Bookmark (Menonjol ke Kiri, Terselip di Bawah Kertas)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.createRibbonContainers = function() {
        this._unselectedRibbonContainer = new Sprite();
        this._journalRoot.addChild(this._unselectedRibbonContainer);

        this._ribbonSprites = [];
        for (var i = 0; i < RIBBON_TABS.length; i++) {
            var def = RIBBON_TABS[i];
            var sp = new Sprite();
            sp.bitmap = ImageManager.loadJournal(def.file);
            var isSel = (i === this._selectedRibbonIndex);
            sp.x = isSel ? (def.selectedX || 15) : (def.unselectedX !== undefined ? def.unselectedX : 185);
            sp._targetX = sp.x;
            sp._peekHover = false;
            sp.y = def.y;
            this._unselectedRibbonContainer.addChild(sp);
            this._ribbonSprites.push(sp);
        }

        // Indikator Notifikasi Piksel (Pixel Badge) per Pita
        this._ribbonBadgeSprites = [];
        for (var bi = 0; bi < RIBBON_TABS.length; bi++) {
            var bdef = RIBBON_TABS[bi];
            var bsp  = new Sprite(new Bitmap(10, 10));
            // Pojok kiri-atas area ribbon saat OFF: x dekat unselectedX, y dekat atas ribbon
            bsp.anchor.x = 0;
            bsp.anchor.y = 0;
            bsp._badgeUnselX = (bdef.unselectedX !== undefined ? bdef.unselectedX : 180);
            bsp.x = bsp._badgeUnselX + 3;
            bsp.y = bdef.y + 4;
            bsp.visible = false;
            this._drawBadgeDot(bsp.bitmap);
            this._unselectedRibbonContainer.addChild(bsp);
            this._ribbonBadgeSprites.push(bsp);
        }

        // Pointer Kursor Bookmark Pita Emas (Selalu Jelas Menunjuk Pita Aktif)
        this._ribbonCursorSprite = new Sprite();
        this._ribbonCursorSprite.bitmap = new Bitmap(36, 36);
        this._ribbonCursorSprite.anchor.x = 0.5;
        this._ribbonCursorSprite.anchor.y = 0.5;
        this.drawRibbonCursorGraphic();
        this._unselectedRibbonContainer.addChild(this._ribbonCursorSprite);
    };

    Scene_StatusJournal.prototype.drawRibbonCursorGraphic = function() {
        if (!this._ribbonCursorSprite || !this._ribbonCursorSprite.bitmap) return;
        var bmp = this._ribbonCursorSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;

        ctx.save();
        ctx.fillStyle = '#fef08a';   // Kuning keemasan cerah
        ctx.strokeStyle = '#b45309'; // Garis tepi amber gelap
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
        ctx.shadowBlur = 8;

        // Panah elegan menunjuk ke kanan: ▶
        ctx.beginPath();
        ctx.moveTo(8, 6);
        ctx.lineTo(28, 18);
        ctx.lineTo(8, 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        bmp._setDirty();
    };

    // Gambar indikator piksel notifikasi (pixel badge)
    Scene_StatusJournal.prototype._drawBadgeDot = function(bitmap) {
        var ctx = bitmap._context;
        bitmap.clear();
        ctx.save();
        // Matikan anti-aliasing untuk tampilan pixel art
        ctx.imageSmoothingEnabled = false;
        // Outline gelap (1px border di luar kotak 6x6)
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(1, 1, 8, 8);
        // Kotak utama amber/gold (6x6, offset 2,2)
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(2, 2, 6, 6);
        // Highlight kiri-atas (1 pixel terang)
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(2, 2, 2, 2);
        ctx.restore();
        bitmap._setDirty();
    };

        Scene_StatusJournal.prototype.createLeftPageBase = function() {
        this._leftPageBaseSprite = new Sprite();
        this._leftPageBaseSprite.bitmap = ImageManager.loadJournal('Left page');
        this._leftPageBaseSprite.x = 239;
        this._leftPageBaseSprite.y = 21;
        this._journalRoot.addChild(this._leftPageBaseSprite);
    };

    // ------------------------------------------------------------------------
    // Layer 6: Konten Halaman Status
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.createStatusPageContents = function() {
        this._statusPageContainer = new Sprite();
        this._journalRoot.addChild(this._statusPageContainer);

        // --- HALAMAN KIRI STATUS ---
        this._leftPageContainer = new Sprite();
        this._leftPageContainer.x = 239;
        this._leftPageContainer.y = 21;
        this._statusPageContainer.addChild(this._leftPageContainer);

        // 1. Potret Karakter Dinamis (Di dalam bingkai polaroid)
        this._polaroidSprite = new Sprite();
        this._polaroidSprite.x = STATUS_JOURNAL_CONFIG.polaroid.x;
        this._polaroidSprite.y = STATUS_JOURNAL_CONFIG.polaroid.y;
        this._polaroidSprite.bitmap = new Bitmap(208, 194);
        this._leftPageContainer.addChild(this._polaroidSprite);

        // 2. Bingkai Halaman Status Resmi (Status page.png)
        this._statusPageBaseSprite = new Sprite();
        this._statusPageBaseSprite.bitmap = ImageManager.loadJournal('Status page');
        this._leftPageContainer.addChild(this._statusPageBaseSprite);

        // 3. Overlay Polaroid Kontrol (Tombol Panah [◀ Q] [W ▶] & Scrapbook Party Tabs)
        this._polaroidControlSprite = new Sprite();
        this._polaroidControlSprite.bitmap = new Bitmap(508, 668);
        this._leftPageContainer.addChild(this._polaroidControlSprite);

        // 3b. Overlay Pendaran Ungu Trauma Polaroid (Sanity 0 Manifestation)
        this._polaroidTraumaGlowSprite = new Sprite(new Bitmap(208, 194));
        this._polaroidTraumaGlowSprite.x = STATUS_JOURNAL_CONFIG.polaroid.x;
        this._polaroidTraumaGlowSprite.y = STATUS_JOURNAL_CONFIG.polaroid.y;
        this._polaroidTraumaGlowSprite.visible = false;
        this.initPolaroidTraumaGlowGraphic();
        this._leftPageContainer.addChild(this._polaroidTraumaGlowSprite);

        // 4. 4 Bar Status Real-time (HP, Mana, Rage, Mental)
        this._statusGaugesSprite = new Sprite();
        this._statusGaugesSprite.bitmap = new Bitmap(508, 668);
        this._leftPageContainer.addChild(this._statusGaugesSprite);

        // 4b. Badge Nama Karakter Resmi (Nia name.png / Sophia name.png / Saki name.png) di Atas Gauges (media_1789729322506.png)
        this._statusActorNameSprite = new Sprite();
        this._statusActorNameSprite.bitmap = new Bitmap(240, 90);
        this._statusActorNameSprite.x = (STATUS_JOURNAL_CONFIG.actorName && STATUS_JOURNAL_CONFIG.actorName.x !== undefined) ? STATUS_JOURNAL_CONFIG.actorName.x : 240;
        this._statusActorNameSprite.y = (STATUS_JOURNAL_CONFIG.actorName && STATUS_JOURNAL_CONFIG.actorName.y !== undefined) ? STATUS_JOURNAL_CONFIG.actorName.y : 12;
        this._leftPageContainer.addChild(this._statusActorNameSprite);

        // 5. Teks Dinamis Kertas Catatan Bergaris
        this._linedNoteSprite = new Sprite();
        this._linedNoteSprite.bitmap = new Bitmap(508, 668);
        this._leftPageContainer.addChild(this._linedNoteSprite);

        // 5b. Octagram Morphing Status Radar & Kotak Ground Kertas Miring
        this.createOctagramStatusRadar();

        // --- HALAMAN KANAN STATUS ---
        this._rightPageContainer = new Sprite();
        this._rightPageContainer.x = 746;
        this._rightPageContainer.y = 23;
        this._statusPageContainer.addChild(this._rightPageContainer);

        // 6. Senjata Anchor Resmi Karakter (Nia_anchor, Sophia anchor, Saki anchor_)
        this._anchorSprite = new Sprite();
        this._anchorSprite.x = STATUS_JOURNAL_CONFIG.anchorWeapon.x;
        this._anchorSprite.y = STATUS_JOURNAL_CONFIG.anchorWeapon.y;
        this._rightPageContainer.addChild(this._anchorSprite);

        // 7. Efek Jiwa Menyala di Kepala & Mata Cyclops Anchor
        this._soulEyeSprite = new Sprite();
        this._soulEyeSprite.anchor.x = 0.5;
        this._soulEyeSprite.anchor.y = 0.5;
        this._soulEyeSprite.x = SOUL_EYE_COORD.x;
        this._soulEyeSprite.y = SOUL_EYE_COORD.y;
        this._soulEyeSprite.bitmap = new Bitmap(360, 360);
        this._soulEyeSprite.visible = false;
        this._soulFlameState = 'off';
        this._soulFlameAnimTimer = 0;
        this._soulFlameActive = false;
        this._rightPageContainer.addChild(this._soulEyeSprite);

        // 8. Ikon Perlengkapan Terpasang pada 7 Slot
        this._equippedIconsSprite = new Sprite();
        this._equippedIconsSprite.bitmap = new Bitmap(508, 668);
        this._rightPageContainer.addChild(this._equippedIconsSprite);

        // 9. Kursor Reticle Slot Denyut
        this._slotReticleSprite = new Sprite();
        this._slotReticleSprite.bitmap = new Bitmap(92, 92);
        this._slotReticleSprite.anchor.x = 0.5;
        this._slotReticleSprite.anchor.y = 0.5;
        this.drawReticleGraphic();
        this._rightPageContainer.addChild(this._slotReticleSprite);
    };

    // ------------------------------------------------------------------------
    // Layer 7: Konten Halaman Item (Pixel-Perfect Mockup ex.jpeg)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.createItemPageContents = function() {
        this._itemPageContainer = new Sprite();
        this._itemPageContainer.visible = false;
        this._journalRoot.addChild(this._itemPageContainer);

        var cfg = STATUS_JOURNAL_CONFIG.itemJournal;

        // Kiri: Grid 24 Slot Column_.png & Reticle Siku Magenta
        this._itemLeftPageContainer = new Sprite();
        this._itemLeftPageContainer.x = 239;
        this._itemLeftPageContainer.y = 21;
        this._itemPageContainer.addChild(this._itemLeftPageContainer);

        this._itemSlotsSprite = new Sprite();
        this._itemSlotsSprite.bitmap = new Bitmap(508, 668);
        this._itemLeftPageContainer.addChild(this._itemSlotsSprite);

        var rW = cfg.grid.slotW + 14;
        var rH = cfg.grid.slotH + 14;
        this._itemReticleSprite = new Sprite();
        this._itemReticleSprite.bitmap = new Bitmap(rW, rH);
        this._itemReticleSprite.anchor.x = 0.5;
        this._itemReticleSprite.anchor.y = 0.5;
        this.drawItemReticleGraphic();
        this._itemLeftPageContainer.addChild(this._itemReticleSprite);

        this._itemPageNavSprite = new Sprite();
        this._itemPageNavSprite.bitmap = new Bitmap(508, 32);
        this._itemPageNavSprite.y = 636;
        this._itemLeftPageContainer.addChild(this._itemPageNavSprite);

        // Kanan: Polaroid Miring (-8.5°), Judul GameFont, Description Paper & Lore
        this._itemRightPageContainer = new Sprite();
        this._itemRightPageContainer.x = 746;
        this._itemRightPageContainer.y = 23;
        this._itemPageContainer.addChild(this._itemRightPageContainer);

        // Kontainer Polaroid dengan Rotasi Alami ex.jpeg (-8.5°)
        this._itemPolaroidContainer = new Sprite();
        this._itemPolaroidContainer.x = cfg.polaroid.x;
        this._itemPolaroidContainer.y = cfg.polaroid.y;
        this._itemPolaroidContainer.rotation = cfg.polaroid.rotation || -0.148;
        this._itemRightPageContainer.addChild(this._itemPolaroidContainer);

        this._itemPolaroidSprite = new Sprite();
        this._itemPolaroidSprite.bitmap = ImageManager.loadJournalItem('Polaroid_');
        this._itemPolaroidSprite.anchor.x = 0.5;
        this._itemPolaroidSprite.anchor.y = 0.5;
        this._itemPolaroidContainer.addChild(this._itemPolaroidSprite);

        this._itemPolaroidArtSprite = new Sprite();
        this._itemPolaroidArtSprite.bitmap = new Bitmap(233, 257);
        this._itemPolaroidArtSprite.anchor.x = 0.5;
        this._itemPolaroidArtSprite.anchor.y = 0.5;
        this._itemPolaroidContainer.addChild(this._itemPolaroidArtSprite);

        // Teks Judul & Kategori (Samping Polaroid)
        this._itemTitleSprite = new Sprite();
        this._itemTitleSprite.bitmap = new Bitmap(240, 200);
        this._itemTitleSprite.x = cfg.title.x;
        this._itemTitleSprite.y = 0;
        this._itemRightPageContainer.addChild(this._itemTitleSprite);

        // Kertas Catatan Bergaris (Description_.png)
        // Diletakkan setelah Polaroid agar lakban di pojok kiri atas menempel di atas Polaroid!
        this._itemDescPaperSprite = new Sprite();
        this._itemDescPaperSprite.bitmap = ImageManager.loadJournalItem('Description_');
        this._itemDescPaperSprite.x = cfg.description.x;
        this._itemDescPaperSprite.y = cfg.description.y;
        this._itemRightPageContainer.addChild(this._itemDescPaperSprite);

        this._itemDescTextSprite = new Sprite();
        this._itemDescTextSprite.bitmap = new Bitmap(508, 355);
        this._itemDescTextSprite.x = cfg.description.x;
        this._itemDescTextSprite.y = cfg.description.y;
        this._itemRightPageContainer.addChild(this._itemDescTextSprite);
    };


    // ------------------------------------------------------------------------
    // Layer 7c: Konten Halaman Skills (24 Slots Grid, Polaroid Miring, Lore & Ribbons)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.createSkillPageContents = function() {
        this._skillPageContainer = new Sprite();
        this._skillPageContainer.visible = false;
        this._journalRoot.addChild(this._skillPageContainer);

        var cfg = STATUS_JOURNAL_CONFIG.skillJournal;

        // Kiri: Grid 24 Slot Column_.png & Reticle Siku Magenta
        this._skillLeftPageContainer = new Sprite();
        this._skillLeftPageContainer.x = 239;
        this._skillLeftPageContainer.y = 21;
        this._skillPageContainer.addChild(this._skillLeftPageContainer);

        // Header Karakter di Atas Grid
        this._skillActorHeaderSprite = new Sprite();
        this._skillActorHeaderSprite.bitmap = new Bitmap(508, 32);
        this._skillActorHeaderSprite.y = 8;
        this._skillLeftPageContainer.addChild(this._skillActorHeaderSprite);

        this._skillSlotsSprite = new Sprite();
        this._skillSlotsSprite.bitmap = new Bitmap(508, 668);
        this._skillLeftPageContainer.addChild(this._skillSlotsSprite);

        var rW = cfg.grid.slotW + 14;
        var rH = cfg.grid.slotH + 14;
        this._skillReticleSprite = new Sprite();
        this._skillReticleSprite.bitmap = new Bitmap(rW, rH);
        this._skillReticleSprite.anchor.x = 0.5;
        this._skillReticleSprite.anchor.y = 0.5;
        this.drawSkillReticleGraphic();
        this._skillLeftPageContainer.addChild(this._skillReticleSprite);

        this._skillPageNavSprite = new Sprite();
        this._skillPageNavSprite.bitmap = new Bitmap(508, 32);
        this._skillPageNavSprite.y = 636;
        this._skillLeftPageContainer.addChild(this._skillPageNavSprite);

        // Kanan: Polaroid Miring (-8.5°), Judul GameFont, Description Paper & Lore
        this._skillRightPageContainer = new Sprite();
        this._skillRightPageContainer.x = 746;
        this._skillRightPageContainer.y = 23;
        this._skillPageContainer.addChild(this._skillRightPageContainer);

        // Kontainer Polaroid
        this._skillPolaroidContainer = new Sprite();
        this._skillPolaroidContainer.x = cfg.polaroid.x;
        this._skillPolaroidContainer.y = cfg.polaroid.y;
        this._skillPolaroidContainer.rotation = cfg.polaroid.rotation || -0.148;
        this._skillRightPageContainer.addChild(this._skillPolaroidContainer);

        this._skillPolaroidSprite = new Sprite();
        this._skillPolaroidSprite.bitmap = ImageManager.loadJournalSkill('Polaroid_');
        this._skillPolaroidSprite.anchor.x = 0.5;
        this._skillPolaroidSprite.anchor.y = 0.5;
        this._skillPolaroidContainer.addChild(this._skillPolaroidSprite);

        this._skillPolaroidArtSprite = new Sprite();
        this._skillPolaroidArtSprite.bitmap = new Bitmap(233, 257);
        this._skillPolaroidArtSprite.anchor.x = 0.5;
        this._skillPolaroidArtSprite.anchor.y = 0.5;
        this._skillPolaroidContainer.addChild(this._skillPolaroidArtSprite);

        // Teks Judul & Kategori (Samping Polaroid)
        this._skillTitleSprite = new Sprite();
        this._skillTitleSprite.bitmap = new Bitmap(240, 200);
        this._skillTitleSprite.x = cfg.title.x;
        this._skillTitleSprite.y = 0;
        this._skillRightPageContainer.addChild(this._skillTitleSprite);

        // Kertas Catatan Bergaris (Description_.png)
        this._skillDescPaperSprite = new Sprite();
        this._skillDescPaperSprite.bitmap = ImageManager.loadJournalSkill('Description_');
        this._skillDescPaperSprite.x = cfg.description.x;
        this._skillDescPaperSprite.y = cfg.description.y;
        this._skillRightPageContainer.addChild(this._skillDescPaperSprite);

        this._skillDescTextSprite = new Sprite();
        this._skillDescTextSprite.bitmap = new Bitmap(508, 355);
        this._skillDescTextSprite.x = cfg.description.x;
        this._skillDescTextSprite.y = cfg.description.y;
        this._skillRightPageContainer.addChild(this._skillDescTextSprite);

        // Kontainer 3 Pita Bookmark (Attack, Defends, Special)
        // Ditempatkan di atas halaman sehingga menggantung alami
        this._skillRibbonContainer = new Sprite();
        this._skillPageContainer.addChild(this._skillRibbonContainer);

        // Pita Bookmark Skill Tunggal di Pojok Kiri Atas Halaman (Attack, Defends, Special)
        ImageManager.loadJournalSkill('Attack');
        ImageManager.loadJournalSkill('Defends');
        ImageManager.loadJournalSkill('Special');
        var ribbonFiles = ['Attack', 'Defends', 'Special'];
        var initCat = ribbonFiles[this._skillRibbonIndex || 0] || 'Attack';
        var ribCfg = (cfg.ribbons) || { x: 268, y: 12 };
        this._skillSingleRibbonSprite = new Sprite();
        this._skillSingleRibbonSprite.bitmap = ImageManager.loadJournalSkill(initCat);
        this._skillSingleRibbonSprite.anchor.x = 0.5;
        this._skillSingleRibbonSprite.anchor.y = 0;
        this._skillSingleRibbonSprite.x = ribCfg.x !== undefined ? ribCfg.x : 268;
        this._skillSingleRibbonSprite.y = ribCfg.y !== undefined ? ribCfg.y : 12;
        this._skillSingleRibbonSprite.opacity = 255;
        this._skillRibbonContainer.addChild(this._skillSingleRibbonSprite);
        this._skillRibbonSprites = [this._skillSingleRibbonSprite];
        this.updateSkillRibbonTargets();
        this.createSkillEquipModal();
        this.createSkillActionModal();
    };

    // ------------------------------------------------------------------------
    // Layer 7b: Konten Halaman Party Scrapbook (3 Rows + Darkroom Hanging Picker)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.createPartyPageContents = function() {
        this._partyPageContainer = new Sprite();
        this._partyPageContainer.visible = false;
        this._journalRoot.addChild(this._partyPageContainer);

        // --- HALAMAN KIRI: 3 BARIS REKAN (POLAROID + BLANK NOTE PAPER) ---
        this._partyLeftContainer = new Sprite();
        this._partyLeftContainer.x = 239;
        this._partyLeftContainer.y = 21;
        this._partyPageContainer.addChild(this._partyLeftContainer);

        this._partySlotsSprite = new Sprite();
        this._partySlotsSprite.bitmap = new Bitmap(508, 668);
        this._partyLeftContainer.addChild(this._partySlotsSprite);

        // Overlay Pendaran Ungu Trauma pada Baris Rekan (Halaman Kiri)
        this._partyTraumaGlowSprite = new Sprite(new Bitmap(508, 668));
        this._partyTraumaGlowSprite.visible = false;
        this._partyLeftContainer.addChild(this._partyTraumaGlowSprite);

        this._partyReticleSprite = new Sprite();
        this._partyReticleSprite.bitmap = new Bitmap(490, 210);
        this._partyReticleSprite.anchor.x = 0;
        this._partyReticleSprite.anchor.y = 0;
        this.drawPartyReticleGraphic();
        this._partyLeftContainer.addChild(this._partyReticleSprite);

        // --- HALAMAN KANAN: JEMURAN FOTO POLAROID CUCI GELAP (DARKROOM PICKER) ---
        this._partyRightContainer = new Sprite();
        this._partyRightContainer.x = 746;
        this._partyRightContainer.y = 23;
        this._partyPageContainer.addChild(this._partyRightContainer);

        this._partyPickerSprite = new Sprite();
        this._partyPickerSprite.bitmap = new Bitmap(508, 668);
        this._partyRightContainer.addChild(this._partyPickerSprite);

        // Overlay Pendaran Ungu Trauma pada Jemuran Kandidat (Halaman Kanan)
        this._partyRightTraumaGlowSprite = new Sprite(new Bitmap(508, 668));
        this._partyRightTraumaGlowSprite.visible = false;
        this._partyRightContainer.addChild(this._partyRightTraumaGlowSprite);

        this._partyPickerReticleSprite = new Sprite();
        this._partyPickerReticleSprite.bitmap = new Bitmap(210, 228);
        this._partyPickerReticleSprite.anchor.x = 0.5;
        this._partyPickerReticleSprite.anchor.y = 0.5;
        this.drawPartyPickerReticleGraphic();
        this._partyRightContainer.addChild(this._partyPickerReticleSprite);
    };

    Scene_StatusJournal.prototype.drawPartyReticleGraphic = function() {
        if (!this._partyReticleSprite || !this._partyReticleSprite.bitmap) return;
        var bmp = this._partyReticleSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();

        var w = 490;
        var h = 210;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';

        ctx.beginPath();
        ctx.roundRect(2, 2, w - 4, h - 4, 8);
        ctx.fill();
        ctx.stroke();

        var s = 14;
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 4;
        // Top-left
        ctx.beginPath(); ctx.moveTo(2, 2 + s); ctx.lineTo(2, 2); ctx.lineTo(2 + s, 2); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(w - 2 - s, 2); ctx.lineTo(w - 2, 2); ctx.lineTo(w - 2, 2 + s); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(2, h - 2 - s); ctx.lineTo(2, h - 2); ctx.lineTo(2 + s, h - 2); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(w - 2 - s, h - 2); ctx.lineTo(w - 2, h - 2); ctx.lineTo(w - 2, h - 2 - s); ctx.stroke();

        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawPartyPickerReticleGraphic = function() {
        if (!this._partyPickerReticleSprite || !this._partyPickerReticleSprite.bitmap) return;
        var bmp = this._partyPickerReticleSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();

        var w = 202;
        var h = 220;
        var ox = 4;
        var oy = 4;

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.85)';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.roundRect(ox, oy, w, h, 6);
        ctx.stroke();

        ctx.restore();
        bmp._setDirty();
    };

    // ------------------------------------------------------------------------
    // Layer 8: Overlay Animasi Membalik Lembaran Kertas Buku Realistis
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.createPageFlipOverlay = function() {
        this._pageFlipSprite = new Sprite();
        this._pageFlipSprite.bitmap = new Bitmap(1280, 720);
        this._journalRoot.addChild(this._pageFlipSprite);
    };

    Scene_StatusJournal.prototype.createDrawerContainer = function() {
        this._drawerSprite = new Sprite();
        this._drawerSprite.bitmap = new Bitmap(490, 84);
        this._drawerSprite.x = 746;
        this._drawerSprite.y = 23 + 248;
        this._drawerSprite.visible = false;
        this._drawerSprite.opacity = 0;
        this._journalRoot.addChild(this._drawerSprite);
    };

    Scene_StatusJournal.prototype.createItemTargetModal = function() {
        this._itemTargetModal = new Sprite();
        this._itemTargetModal.bitmap = new Bitmap(380, 260);
        this._itemTargetModal.x = 239 + Math.round((508 - 380) / 2);
        this._itemTargetModal.y = 21 + Math.round((668 - 260) / 2);
        this._itemTargetModal.visible = false;
        this._journalRoot.addChild(this._itemTargetModal);
    };

    Scene_StatusJournal.prototype.createFooterGuide = function() {
        this._footerGuideSprite = new Sprite();
        this._footerGuideSprite.bitmap = new Bitmap(1280, 36);
        this._footerGuideSprite.y = 684;
        this._journalRoot.addChild(this._footerGuideSprite);
        this.drawFooterGuide();
    };

    Scene_StatusJournal.prototype.drawFooterGuide = function() {
        if (!this._footerGuideSprite) return;
        var bmp = this._footerGuideSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
        ctx.fillRect(0, 0, 1280, 36);

        ctx.font = 'bold 13px GameFont, monospace';
        ctx.textAlign = 'center';

        var text = '';
        if (this._focusMode === 'ribbon') {
            text = '🎀 [▲ / ▼] Pilih Menu Pita  •  📖 [ENTER / ►] Masuk ke Halaman  •  ■ [ESC / I] Tutup';
        } else if (this._activeJournalTab === 0) {
            text = '🎯 [ARROWS] Pilih Slot  •  ⚓ [ENTER] Pasang Slot  •  ◄ / [ESC] Menu Pita  •  👥 [Q / W] Karakter  •  ■ [I] Tutup';
        } else if (this._activeJournalTab === 1) {
            text = '🎯 [ARROWS] Pilih Barang  •  ✨ [ENTER] Gunakan  •  ◄ / [ESC] Menu Pita  •  📄 [Q / W] Halaman  •  ■ [I] Tutup';
        } else if (this._activeJournalTab === 2) {
            if (this._partySubMode === 'picker') {
                text = '🧺 [◄ / ►] Pilih Foto Rekan  •  ✨ [ENTER] Pasang / Lepas  •  ■ [ESC] Batal';
            } else {
                text = '👥 [▲ / ▼] Pilih Slot  •  🔄 [ENTER] Ubah Rekan  •  📜 [SHIFT] Bio / Stats  •  ◄ / [ESC] Menu Pita  •  ■ [I] Tutup';
            }
        } else if (this._activeJournalTab === 3) {
            text = '🎯 [ARROWS] Pilih Skill  •  ⚔ [ENTER] Pasang ke Slot Battle  •  🔖 [Q / W] Tipe  •  👥 [SHIFT] Karakter  •  ■ [I] Tutup';
        }
        ctx.fillStyle = '#fef08a';
        ctx.fillText(text, 640, 23);
        ctx.restore();
        bmp._setDirty();
    };

    // ------------------------------------------------------------------------
    // SISTEM PITA NAVIGASI: ANIMASI HALUS MENONJOL KE KIRI
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.updateRibbonTargets = function() {
        if (!this._ribbonSprites) return;
        for (var i = 0; i < RIBBON_TABS.length; i++) {
            var sp = this._ribbonSprites[i];
            var def = RIBBON_TABS[i];
            var isSelected = (i === this._selectedRibbonIndex);
            var isFocused = (this._focusMode === 'ribbon' && isSelected);

            if (isSelected) {
                sp._targetX = def.selectedX !== undefined ? def.selectedX : 15; // Menonjol jauh ke KIRI saat ON
                sp.tone = isFocused ? [45, 40, 15, 0] : [15, 10, 0, 0];
            } else {
                sp._targetX = def.unselectedX !== undefined ? def.unselectedX : 185; // Retracted saat OFF: hanya icon terlihat
                sp.tone = [-25, -25, -25, 0];
            }
        }

        if (this._ribbonCursorSprite) {
            var curDef = RIBBON_TABS[this._selectedRibbonIndex];
            var curSp = this._ribbonSprites[this._selectedRibbonIndex];
            if (curDef && curSp) {
                this._ribbonCursorSprite._targetY = curDef.y + 40;
                this._ribbonCursorSprite._targetX = (curDef.selectedX !== undefined ? curDef.selectedX : 15) + 24;
            }
        }
    };

    Scene_StatusJournal.prototype.drawRibbonTabs = function() {
        this.updateRibbonTargets();
    };

    Scene_StatusJournal.prototype.onRibbonCursorChanged = function() {
        this.updateRibbonTargets();
        this.drawFooterGuide();
        // Live Page Turn saat kursor bergerak antara Status (0), Item (1), Party (2), dan Skills (3)
        if (this._selectedRibbonIndex <= 5 && this._selectedRibbonIndex !== this._activeJournalTab) {
            var dir = this._selectedRibbonIndex > this._activeJournalTab ? 1 : -1;
            this.turnToTab(this._selectedRibbonIndex, dir);
        }
    };

    Scene_StatusJournal.prototype.focusRibbons = function() {
        SoundManager.playCancel();
        this._focusMode = 'ribbon';
        this._selectedRibbonIndex = this._activeJournalTab;
        this.updateRibbonTargets();
        this.drawFooterGuide();
        if (this._ribbonCursorSprite) this._ribbonCursorSprite.visible = true;
        if (this._slotReticleSprite) this._slotReticleSprite.visible = false;
        if (this._itemReticleSprite) this._itemReticleSprite.visible = false;
        if (this._partyReticleSprite) this._partyReticleSprite.visible = false;
        if (this._partyPickerReticleSprite) this._partyPickerReticleSprite.visible = false;
        if (this._skillReticleSprite) this._skillReticleSprite.visible = false;
        if (this._constellationTreeReticleSprite) this._constellationTreeReticleSprite.visible = false;
        if (this._constellationGridReticleSprite) this._constellationGridReticleSprite.visible = false;
        if (this._archiveReticleSprite) this._archiveReticleSprite.visible = false;
        if (this._constellationSkillPopupSprite) this._constellationSkillPopupSprite.visible = false;
    };

    Scene_StatusJournal.prototype.focusPageSlots = function() {
        SoundManager.playOk();
        this._focusMode = 'slots';
        this.updateRibbonTargets();
        this.drawFooterGuide();
        if (this._ribbonCursorSprite) this._ribbonCursorSprite.visible = false;
        if (this._activeJournalTab === 0) {
            if (this._slotReticleSprite) {
                var cur = JOURNAL_SLOTS[this._selectedSlotIndex];
                if (cur) {
                    this._slotReticleSprite.x = cur.x;
                    this._slotReticleSprite.y = cur.y;
                }
                this._slotReticleSprite.visible = true;
            }
            if (this._itemReticleSprite) this._itemReticleSprite.visible = false;
        } else if (this._activeJournalTab === 1) {
            if (this._slotReticleSprite) this._slotReticleSprite.visible = false;
            if (this._partyReticleSprite) this._partyReticleSprite.visible = false;
            if (this._itemReticleSprite) {
                this.updateItemReticlePosition();
                this._itemReticleSprite.visible = true;
            }
        } else if (this._activeJournalTab === 2) {
            if (this._slotReticleSprite) this._slotReticleSprite.visible = false;
            if (this._itemReticleSprite) this._itemReticleSprite.visible = false;
            if (this._skillReticleSprite) this._skillReticleSprite.visible = false;
            this.updatePartyReticlePosition();
        } else if (this._activeJournalTab === 3) {
            if (this._slotReticleSprite) this._slotReticleSprite.visible = false;
            if (this._itemReticleSprite) this._itemReticleSprite.visible = false;
            if (this._partyReticleSprite) this._partyReticleSprite.visible = false;
            if (this._skillReticleSprite) {
                this.updateSkillReticlePosition();
                this._skillReticleSprite.visible = true;
            }
        } else if (this._activeJournalTab === 4) {
            if (this._slotReticleSprite) this._slotReticleSprite.visible = false;
            if (this._itemReticleSprite) this._itemReticleSprite.visible = false;
            if (this._partyReticleSprite) this._partyReticleSprite.visible = false;
            if (this._skillReticleSprite) this._skillReticleSprite.visible = false;
            this._constellationFocus = 'tree';
            this._constellationMouseOff = false;
            this.updateConstellationReticles();
            this.updateConstellationSkillPopup();
        } else if (this._activeJournalTab === 5) {
            if (this._constellationSkillPopupSprite) this._constellationSkillPopupSprite.visible = false;
            if (this._slotReticleSprite) this._slotReticleSprite.visible = false;
            if (this._itemReticleSprite) this._itemReticleSprite.visible = false;
            if (this._partyReticleSprite) this._partyReticleSprite.visible = false;
            if (this._skillReticleSprite) this._skillReticleSprite.visible = false;
            if (this._constellationTreeReticleSprite) this._constellationTreeReticleSprite.visible = false;
            if (this._constellationGridReticleSprite) this._constellationGridReticleSprite.visible = false;
            this.refreshArchivePage();
        }
    };

    // ------------------------------------------------------------------------
    // SISTEM PAGE TURN ANIMATION SEPERTI BUKU ASLI
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.turnToTab = function(newTab, direction) {
        if (this._activeJournalTab === newTab && !this._isFlippingPage) return;
        // Bersihkan badge unread saat tab dibuka
        this._clearUnreadBadge(newTab);

        AudioManager.playSe({ name: 'Book1', volume: 90, pitch: 100, pan: 0 });

        this._isFlippingPage = true;
        this._flipProgress = 0;
        this._flipDirection = direction || (newTab > this._activeJournalTab ? 1 : -1);
        this._previousJournalTab = this._activeJournalTab;
        this._activeJournalTab = newTab;
        this._selectedRibbonIndex = newTab;

        this.updateRibbonTargets();
        this.drawFooterGuide();

        if (newTab === 0) {
            this.refreshStatusPage();
        } else if (newTab === 1) {
            this.refreshItemPage();
        } else if (newTab === 2) {
            this.refreshPartyPage();
        } else if (newTab === 3) {
            this.refreshSkillPage();
        } else if (newTab === 4) {
            this.refreshConstellationPage();
        } else if (newTab === 5) {
            this.refreshArchivePage();
        }

        if (typeof window !== 'undefined' && window._yureVisualInspectorRefresh) {
            window._yureVisualInspectorRefresh();
        }
    };

    Scene_StatusJournal.prototype.getPageContainerForTab = function(tab) {
        if (tab === 0) return this._statusPageContainer;
        if (tab === 1) return this._itemPageContainer;
        if (tab === 2) return this._partyPageContainer;
        if (tab === 3) return this._skillPageContainer;
        if (tab === 4) return this._constellationPageContainer;
        if (tab === 5) return this._archivePageContainer;
        return null;
    };

    Scene_StatusJournal.prototype.updatePageFlipAnimation = function() {
        this._flipProgress += 0.085;
        var t = Math.min(1.0, this._flipProgress);
        var bmp = this._pageFlipSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;

        var spineX = 746;
        var prevCont = this.getPageContainerForTab(this._previousJournalTab);
        var activeCont = this.getPageContainerForTab(this._activeJournalTab);

        if (t < 0.5) {
            var subT = t / 0.5; // 0..1
            var curlX = 1236 - subT * (1236 - spineX);
            var shadowW = 40 + subT * 30;

            ctx.save();
            var shadowGrad = ctx.createLinearGradient(curlX - shadowW, 0, curlX + 10, 0);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            shadowGrad.addColorStop(0.7, 'rgba(15, 10, 5, 0.45)');
            shadowGrad.addColorStop(1, 'rgba(15, 10, 5, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.fillRect(curlX - shadowW, 20, shadowW + 20, 660);

            var foldGrad = ctx.createLinearGradient(curlX - 10, 0, curlX + 25, 0);
            foldGrad.addColorStop(0, 'rgba(255, 245, 220, 0.35)');
            foldGrad.addColorStop(0.5, 'rgba(230, 215, 185, 0.6)');
            foldGrad.addColorStop(1, 'rgba(100, 70, 40, 0.25)');
            ctx.fillStyle = foldGrad;
            ctx.fillRect(curlX - 10, 20, 35, 660);
            ctx.restore();

            if (prevCont) {
                prevCont.visible = true;
                prevCont.opacity = Math.round((1 - subT) * 255);
            }
            if (activeCont && activeCont !== prevCont) activeCont.visible = false;
        } else {
            var subT = (t - 0.5) / 0.5; // 0..1
            var curlX = spineX - subT * (spineX - 250);
            var shadowW = 50 * (1 - subT);

            ctx.save();
            if (shadowW > 2) {
                var shadowGrad = ctx.createLinearGradient(curlX, 0, curlX + shadowW, 0);
                shadowGrad.addColorStop(0, 'rgba(15, 10, 5, 0.35)');
                shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = shadowGrad;
                ctx.fillRect(curlX, 20, shadowW, 660);
            }
            ctx.restore();

            if (activeCont) {
                activeCont.visible = true;
                activeCont.opacity = Math.round(subT * 255);
            }
            if (prevCont && prevCont !== activeCont) prevCont.visible = false;
        }

        if (t >= 1.0) {
            this._isFlippingPage = false;
            bmp.clear();
            bmp._setDirty();
            this.updateTabVisibility();
            if (this._activeJournalTab === 0) this.refreshStatusPage();
            else if (this._activeJournalTab === 1) this.refreshItemPage();
            else if (this._activeJournalTab === 2) this.refreshPartyPage();
            else if (this._activeJournalTab === 3) this.refreshSkillPage();
            else if (this._activeJournalTab === 4) this.refreshConstellationPage();
            else if (this._activeJournalTab === 5) this.refreshArchivePage();

            if (this._focusMode === 'slots') {
                if (this._activeJournalTab === 0 && this._slotReticleSprite) this._slotReticleSprite.visible = true;
                if (this._activeJournalTab === 1 && this._itemReticleSprite) this.updateItemReticlePosition();
                if (this._activeJournalTab === 2 && this._partyReticleSprite) this.updatePartyReticlePosition();
                if (this._activeJournalTab === 3 && this._skillReticleSprite) this.updateSkillReticlePosition();
                if (this._activeJournalTab === 4) this.updateConstellationReticles();
                if (this._activeJournalTab === 5) this.updateArchiveReticle();
            } else {
                if (this._slotReticleSprite) this._slotReticleSprite.visible = false;
                if (this._itemReticleSprite) this._itemReticleSprite.visible = false;
                if (this._partyReticleSprite) this._partyReticleSprite.visible = false;
                if (this._partyPickerReticleSprite) this._partyPickerReticleSprite.visible = false;
                if (this._skillReticleSprite) this._skillReticleSprite.visible = false;
                if (this._constellationTreeReticleSprite) this._constellationTreeReticleSprite.visible = false;
                if (this._constellationGridReticleSprite) this._constellationGridReticleSprite.visible = false;
                if (this._archiveReticleSprite) this._archiveReticleSprite.visible = false;
            }

            if (typeof window !== 'undefined' && window._yureVisualInspectorRefresh) {
                window._yureVisualInspectorRefresh();
            }
        }
    };

    Scene_StatusJournal.prototype.updateTabVisibility = function() {
        if (this._statusPageContainer) {
            this._statusPageContainer.visible = (this._activeJournalTab === 0);
            this._statusPageContainer.opacity = 255;
        }
        if (this._itemPageContainer) {
            this._itemPageContainer.visible = (this._activeJournalTab === 1);
            this._itemPageContainer.opacity = 255;
        }
        if (this._partyPageContainer) {
            this._partyPageContainer.visible = (this._activeJournalTab === 2);
            this._partyPageContainer.opacity = 255;
        }
        if (this._skillPageContainer) {
            this._skillPageContainer.visible = (this._activeJournalTab === 3);
            this._skillPageContainer.opacity = 255;
            if (this._skillEquipModal && this._activeJournalTab !== 3) {
                this._skillEquipModal.visible = false;
                if (this._focusMode === 'skillEquipModal') this._focusMode = 'slots';
            }
        }
        if (this._constellationPageContainer) {
            this._constellationPageContainer.visible = (this._activeJournalTab === 4);
            this._constellationPageContainer.opacity = 255;
        }
        if (this._archivePageContainer) {
            this._archivePageContainer.visible = (this._activeJournalTab === 5);
            this._archivePageContainer.opacity = 255;
        }
    };

    Scene_StatusJournal.prototype.activateRibbonTab = function(idx) {
        var tab = RIBBON_TABS[idx];
        if (!tab) return;

        switch (tab.label) {
            case 'Status':
                SoundManager.playOk();
                if (this._activeJournalTab !== 0) this.turnToTab(0, -1);
                this.focusPageSlots();
                break;
            case 'Item':
                SoundManager.playOk();
                if (this._activeJournalTab !== 1) this.turnToTab(1, 1);
                this.focusPageSlots();
                break;
            case 'Party':
                SoundManager.playOk();
                if (this._activeJournalTab !== 2) this.turnToTab(2, 1);
                this.focusPageSlots();
                break;
            case 'Skills':
                SoundManager.playOk();
                if (this._activeJournalTab !== 3) this.turnToTab(3, 1);
                this.focusPageSlots();
                break;
            case 'Constellation':
                SoundManager.playOk();
                if (this._activeJournalTab !== 4) this.turnToTab(4, 1);
                this.focusPageSlots();
                break;
            case 'Archive':
                this._clearUnreadBadge(5);
                SoundManager.playOk();
                if (this._activeJournalTab !== 5) this.turnToTab(5, 1);
                this.focusPageSlots();
                break;
            case 'Settings':
                SoundManager.playOk();
                SceneManager.push(Scene_Options);
                break;
            case 'Exit':
                SoundManager.playOk();
                this.fadeOutAll();
                SceneManager.goto(Scene_Title);
                break;
        }
    };

    // Bersihkan status unread sesuai tab yang dibuka
    Scene_StatusJournal.prototype._clearUnreadBadge = function(tabIndex) {
        if (typeof $gameSystem === 'undefined' || !$gameSystem._journalUnread) return;
        var map = { 0: 'status', 1: 'item', 3: 'skill', 5: 'archive' };
        var key = map[tabIndex];
        if (key) $gameSystem._journalUnread[key] = false;
        // Sembunyikan badge sprite langsung
        if (this._ribbonBadgeSprites && this._ribbonBadgeSprites[tabIndex]) {
            this._ribbonBadgeSprites[tabIndex].visible = false;
        }
    };

    // Tampilkan halaman log aktivitas di panel kiri buku (tab Archive / pilih Archive di luar Scene_MyGallery)
    Scene_StatusJournal.prototype.showArchiveLog = function() {
        this._showingArchiveLog = true;
        this._clearUnreadBadge(5);
        this._drawArchiveLogPage();
    };

    Scene_StatusJournal.prototype._drawArchiveLogPage = function() {
        if (!this._linedNoteSprite) return;
        var bmp = this._linedNoteSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var logs = ($gameSystem && $gameSystem._activityLogs) ? $gameSystem._activityLogs : [];

        ctx.save();

        // Header catatan
        ctx.font = 'bold 15px GameFont, sans-serif';
        ctx.fillStyle = '#451a03';
        ctx.textAlign = 'left';
        ctx.fillText('✎ Catatan Ekspedisi', 14, 28);

        // Garis bawah header
        ctx.strokeStyle = '#c4a47a';
        ctx.lineWidth   = 1.2;
        ctx.beginPath();
        ctx.moveTo(14, 38);
        ctx.lineTo(490, 38);
        ctx.stroke();

        if (logs.length === 0) {
            ctx.font      = 'italic 13px GameFont, sans-serif';
            ctx.fillStyle = '#78716c';
            ctx.fillText('— Belum ada catatan aktivitas —', 14, 70);
        } else {
            // Warna per tipe
            var typeColors = {
                item:   '#15803d',
                equip:  '#b45309',
                status: '#b45309',
                skill:  '#4338ca'
            };
            var lh = 42;   // tinggi per baris
            var startY = 55;
            var maxEntries = Math.floor((668 - startY - 30) / lh); // ~14 baris

            for (var i = 0; i < Math.min(logs.length, maxEntries); i++) {
                var entry = logs[i];
                var y = startY + i * lh;
                var col = typeColors[entry.type] || '#292524';

                // Garis pemisah ringan
                if (i > 0) {
                    ctx.strokeStyle = '#e7dcc5';
                    ctx.lineWidth   = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(14, y - 6);
                    ctx.lineTo(490, y - 6);
                    ctx.stroke();
                }

                // Dot warna kecil di kiri
                ctx.fillStyle = col;
                ctx.beginPath();
                ctx.arc(20, y + 8, 5, 0, Math.PI * 2);
                ctx.fill();

                // Teks aktivitas
                ctx.font      = 'bold 13px GameFont, sans-serif';
                ctx.fillStyle = col;
                ctx.textAlign = 'left';
                var txt = entry.text || '';
                if (ctx.measureText(txt).width > 455) {
                    txt = txt.substring(0, 35) + '…';
                }
                ctx.fillText(txt, 32, y + 12);

                // Waktu bermain (playtime)
                if (entry.time > 0) {
                    var sec   = Math.floor(entry.time);
                    var hh    = Math.floor(sec / 3600);
                    var mm    = Math.floor((sec % 3600) / 60);
                    var timeStr = (hh > 0 ? hh + 'j ' : '') + mm + 'm';
                    ctx.font      = 'italic 11px GameFont, sans-serif';
                    ctx.fillStyle = '#a8a29e';
                    ctx.textAlign = 'right';
                    ctx.fillText(timeStr, 490, y + 12);
                    ctx.textAlign = 'left';
                }
            }

            // Footer
            if (logs.length > maxEntries) {
                ctx.font      = 'italic 11px GameFont, sans-serif';
                ctx.fillStyle = '#78716c';
                ctx.textAlign = 'center';
                ctx.fillText('... dan ' + (logs.length - maxEntries) + ' catatan sebelumnya', 252, startY + maxEntries * lh + 8);
                ctx.textAlign = 'left';
            }
        }

        ctx.restore();
        bmp._setDirty();
    };

        Scene_StatusJournal.prototype.showArchiveToast = function() {
        this._toastMessage = '📖 Arsip & Galeri Kenangan akan terbuka di chapter berikutnya!';
        this._toastTimer = 180;
        if (this._activeJournalTab === 0) this.drawLinedNote();
        else this.drawItemDetails();
    };

    // ------------------------------------------------------------------------
    // PENGGAMBARAN HALAMAN STATUS
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.refreshStatusPage = function() {
        if (this._polaroidSprite) {
            this._polaroidSprite.x = STATUS_JOURNAL_CONFIG.polaroid.x;
            this._polaroidSprite.y = STATUS_JOURNAL_CONFIG.polaroid.y;
        }
        if (this._polaroidTraumaGlowSprite) {
            this._polaroidTraumaGlowSprite.x = STATUS_JOURNAL_CONFIG.polaroid.x;
            this._polaroidTraumaGlowSprite.y = STATUS_JOURNAL_CONFIG.polaroid.y;
        }
        if (this._statusActorNameSprite && STATUS_JOURNAL_CONFIG.actorName) {
            this._statusActorNameSprite.x = STATUS_JOURNAL_CONFIG.actorName.x;
            this._statusActorNameSprite.y = STATUS_JOURNAL_CONFIG.actorName.y;
        }
        this.drawPolaroidPhoto();
        this.drawStatusActorName();
        this.drawPolaroidControls();
        this.drawStatusGauges();
        this.drawLinedNote();
        this.refreshRightPage();
    };

    Scene_StatusJournal.prototype.refreshLeftPage = function() {
        this.refreshStatusPage();
    };

    Scene_StatusJournal.prototype.refreshRightPage = function() {
        this.drawAnchorWeapon();
        this.drawEquipmentSlots();
    };

    Scene_StatusJournal.prototype.drawReticleGraphic = function() {
        if (!this._slotReticleSprite || !this._slotReticleSprite.bitmap) return;
        var bmp = this._slotReticleSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var size = 86;
        var offset = 3;

        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(244, 63, 94, 0.9)';
        ctx.shadowBlur = 10;

        var arm = 18;
        // Top-Left
        ctx.beginPath();
        ctx.moveTo(offset, offset + arm);
        ctx.lineTo(offset, offset);
        ctx.lineTo(offset + arm, offset);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(size - offset - arm, offset);
        ctx.lineTo(size - offset, offset);
        ctx.lineTo(size - offset, offset + arm);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(offset, size - offset - arm);
        ctx.lineTo(offset, size - offset);
        ctx.lineTo(offset + arm, size - offset);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(size - offset - arm, size - offset);
        ctx.lineTo(size - offset, size - offset);
        ctx.lineTo(size - offset, size - offset - arm);
        ctx.stroke();

        // Titik Pusat
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawAnchorWeapon = function(isInitial) {
        if (!this._anchorSprite) return;
        var actor = this._actor || $gameParty.menuActor();
        var actorName = actor ? actor.name() : 'Nia';
        var filename = 'Nia_anchor';
        if (actorName === 'Sophia') filename = 'Sophia anchor';
        else if (actorName === 'Saki') filename = 'Saki anchor_';

        this._anchorSprite.bitmap = ImageManager.loadJournal(filename);
        this._currentSoulDrawn = null;

        // Update posisi soulEye sesuai anchor karakter aktif
        if (this._soulEyeSprite) {
            var byActor = STATUS_JOURNAL_CONFIG.soulEyeByActor || {};
            var coord = byActor[actorName] || STATUS_JOURNAL_CONFIG.soulEye || { x: 252, y: 159 };
            this._soulEyeSprite.x = coord.x;
            this._soulEyeSprite.y = coord.y;
        }

        this.updateSoulEyeEffect(isInitial);
    };

    // Update animasi denyut badge dan sync state dengan $gameSystem._journalUnread
    Scene_StatusJournal.prototype.updateRibbonBadges = function() {
        if (!this._ribbonBadgeSprites || !this._ribbonBadgeSprites.length) return;
        if (typeof $gameSystem === 'undefined' || !$gameSystem._journalUnread) return;

        this._badgePulseTimer = (this._badgePulseTimer || 0) + 1;
        var t = this._badgePulseTimer;

        // Map tab/ribbon ke kategori unread
        // Index ribbon: 0=Status, 1=Item, 2=Party, 3=Skills, 4=Constellation, 5=Archive, 6=Settings, 7=Exit
        var unreadMap = {
            0: $gameSystem._journalUnread.status,
            1: $gameSystem._journalUnread.item,
            3: $gameSystem._journalUnread.skill,
            5: $gameSystem._journalUnread.archive
        };

        for (var i = 0; i < this._ribbonBadgeSprites.length; i++) {
            var bsp = this._ribbonBadgeSprites[i];
            var hasUnread = !!unreadMap[i];

            if (!hasUnread) {
                if (bsp.visible) {
                    bsp.visible = false;
                }
                continue;
            }

            bsp.visible = true;
            if (this._ribbonSprites && this._ribbonSprites[i]) {
                bsp.x = this._ribbonSprites[i].x + 3;
                bsp.y = this._ribbonSprites[i].y + 4;
            }
            // Kedip lambat sederhana: muncul 45f, redup 15f, ulang
            var cycle = t % 60;
            if (cycle < 45) {
                bsp.opacity = 255;
            } else {
                // Redup cepat lalu balik
                var fp = (cycle - 45) / 15;
                bsp.opacity = Math.round(255 * (1 - fp * 0.7));
            }
            bsp.scale.x = 1;
            bsp.scale.y = 1;
        }
    };

        Scene_StatusJournal.prototype.updateSoulEyeEffect = function(isInitial) {
        if (!this._soulEyeSprite) return;

        var actor = this._actor || $gameParty.menuActor();
        // Souls = Weapon (Rage Soul / Energy Soul / Lust Soul ada di Weapons.json, bukan Armors)
        // actor.equips() hanya mengembalikan armor → gunakan actor.weapons()[0]
        var weapons = actor ? actor.weapons() : [];
        var soulItem = (weapons && weapons.length > 0) ? weapons[0] : null; // Slot Weapon = Soul

        var soulType = null;
        if (soulItem && soulItem.name) {
            var n = soulItem.name.toLowerCase();
            if (n.indexOf('energy') >= 0) soulType = 'energy';
            else if (n.indexOf('lust') >= 0) soulType = 'lust';
            else if (n.indexOf('rage') >= 0) soulType = 'rage';
            else soulType = 'energy'; // fallback
        }

        // KASUS 1: Tidak ada jiwa terpasang / bukan Nia
        if (!soulType) {
            if (this._soulFlameActive) {
                // Berkedut mati (extinguish animation)
                this._soulFlameActive = false;
                this._soulFlameState = 'extinguishing';
                this._soulFlameAnimTimer = 0;
            } else if (this._soulFlameState !== 'extinguishing') {
                this._soulEyeSprite.visible = false;
                this._soulFlameState = 'off';
                this._currentSoulDrawn = null;
            }
            return;
        }

        // KASUS 2: Jiwa terpasang
        var wasActive = this._soulFlameActive;
        this._soulFlameActive = true;
        this._soulEyeSprite.visible = true;

        if (!wasActive) {
            // Baru dinyalakan: jika initial load langsung burning, jika runtime nyala -> berkedut hidup
            this._soulFlameState = isInitial ? 'burning' : 'igniting';
            this._soulFlameAnimTimer = 0;
        } else if (this._currentSoulDrawn !== soulType) {
            // Ganti tipe jiwa: flare igniting baru
            this._soulFlameState = 'igniting';
            this._soulFlameAnimTimer = 0;
        }

        if (this._currentSoulDrawn !== soulType) {
            var bmp = this._soulEyeSprite.bitmap;
            bmp.clear();
            var ctx = bmp._context;
            var srcBmp = ImageManager.loadJournalSouls(soulType);

            if (srcBmp && srcBmp.isReady()) {
                var configs = {
                    energy: { sx: 79, sy: 98, sw: 184, sh: 201, dw: 184, dh: 201, dx: 180 - 91, dy: 180 - 100 - 38 },
                    lust:   { sx: 24, sy: 95, sw: 249, sh: 264, dw: 249, dh: 264, dx: 180 - 124, dy: 180 - 120 - 30 },
                    rage:   { sx: 30, sy: 96, sw: 308, sh: 294, dw: 308, dh: 294, dx: 180 - 154, dy: 180 - 135 - 38 }
                };
                var cfg = configs[soulType] || configs.energy;
                var rawImg = (typeof this.getRawImage === 'function' ? this.getRawImage(srcBmp) : null) || srcBmp._canvas || srcBmp._image;

                if (rawImg) {
                    ctx.save();
                    var glowRad = ctx.createRadialGradient(180, 170 - 38, 10, 180, 170 - 38, cfg.dw * 0.45);
                    if (soulType === 'energy') {
                        glowRad.addColorStop(0, 'rgba(52, 211, 153, 0.45)');
                        glowRad.addColorStop(0.5, 'rgba(16, 185, 129, 0.2)');
                        glowRad.addColorStop(1, 'rgba(5, 150, 105, 0)');
                    } else if (soulType === 'lust') {
                        glowRad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
                        glowRad.addColorStop(0.5, 'rgba(14, 165, 233, 0.2)');
                        glowRad.addColorStop(1, 'rgba(2, 132, 199, 0)');
                    } else {
                        glowRad.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
                        glowRad.addColorStop(0.5, 'rgba(225, 29, 72, 0.2)');
                        glowRad.addColorStop(1, 'rgba(190, 18, 60, 0)');
                    }
                    ctx.fillStyle = glowRad;
                    ctx.beginPath();
                    ctx.arc(180, 170 - 38, cfg.dw * 0.45, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.drawImage(rawImg, cfg.sx, cfg.sy, cfg.sw, cfg.sh, cfg.dx, cfg.dy, cfg.dw, cfg.dh);
                    ctx.restore();

                    this._soulEyeSprite.bitmap._setDirty();
                    this._currentSoulDrawn = soulType;
                }
            } else if (srcBmp && !srcBmp.isReady() && !srcBmp.isError()) {
                var self = this;
                this.attachSafeLoadListener(srcBmp, 'soulEye_' + soulType, function() {
                    self._currentSoulDrawn = null;
                    self.updateSoulEyeEffect(isInitial);
                });
            }
        }
    };

    // Dedicated Flame Physics Engine: Animasi Api Alami + Efek Berkedut Hidup & Mati
    Scene_StatusJournal.prototype.updateSoulFlameAnimation = function() {
        if (this._activeJournalTab !== 0 || !this._soulEyeSprite) return;
        if (!this._soulEyeSprite.visible && this._soulFlameState === 'off') return;

        var cfgCoord = STATUS_JOURNAL_CONFIG.soulEye || { x: 252, y: 159 };
        var baseX = cfgCoord.x;
        var baseY = cfgCoord.y;

        // -------------------------------------------------------------
        // KONDISI A: IGNITING (Berkedut Hidup / Api Dinyalakan)
        // -------------------------------------------------------------
        if (this._soulFlameState === 'igniting') {
            this._soulFlameAnimTimer++;
            var frame = this._soulFlameAnimTimer;
            this._soulFlickerTimer += 2;

            if (frame <= 8) {
                // Phase 1: Percikan awal / Ember lahir (micro-twitch kecil cepat)
                var p1 = frame / 8;
                var sparkScale = 0.25 + p1 * 0.35;
                var jitter = ((frame % 2 === 0) ? 0.08 : -0.06);
                this._soulEyeSprite.scale.x = Math.max(0.1, sparkScale + jitter);
                this._soulEyeSprite.scale.y = Math.max(0.1, sparkScale * 1.3 - jitter);
                this._soulEyeSprite.opacity = (frame % 2 === 0) ? 255 : 130;
                this._soulEyeSprite.rotation = (frame % 2 === 0 ? 0.05 : -0.05);
                this._soulEyeSprite.x = baseX;
                this._soulEyeSprite.y = baseY;
            } else if (frame <= 18) {
                // Phase 2: Ignition Flare! Api menyembur membubung tinggi
                var p2 = (frame - 8) / 10;
                var surgeY = 0.6 + Math.sin(p2 * Math.PI * 0.5) * 0.75; // 0.6 -> 1.35
                var surgeX = 0.6 + Math.sin(p2 * Math.PI * 0.5) * 0.50; // 0.6 -> 1.10
                var microFlutter = Math.sin(frame * 1.5) * 0.04;
                this._soulEyeSprite.scale.y = surgeY + microFlutter;
                this._soulEyeSprite.scale.x = surgeX - microFlutter * 0.5;
                this._soulEyeSprite.opacity = 255;
                this._soulEyeSprite.rotation = Math.sin(frame * 0.4) * 0.04;
                this._soulEyeSprite.x = baseX;
                this._soulEyeSprite.y = baseY - (surgeY - 1.0) * 16;
            } else if (frame <= 28) {
                // Phase 3: Redam getaran menuju burning stabil
                var p3 = (frame - 18) / 10;
                var damp = Math.cos(p3 * Math.PI * 1.5) * (1 - p3) * 0.25;
                var targetScaleY = 1.0 + damp;
                var targetScaleX = 1.0 - damp * 0.4;
                this._soulEyeSprite.scale.y = targetScaleY;
                this._soulEyeSprite.scale.x = targetScaleX;
                this._soulEyeSprite.opacity = Math.round(220 + (1 - p3) * 35);
                this._soulEyeSprite.rotation = Math.sin(frame * 0.25) * 0.03;
                this._soulEyeSprite.x = baseX;
                this._soulEyeSprite.y = baseY - (targetScaleY - 1.0) * 16;
            } else {
                // Selesai menyala -> masuk ke kondisi api membara stabil
                this._soulFlameState = 'burning';
                this._soulFlameAnimTimer = 0;
            }
            return;
        }

        // -------------------------------------------------------------
        // KONDISI B: EXTINGUISHING (Berkedut Mati / Api Dimatikan)
        // -------------------------------------------------------------
        if (this._soulFlameState === 'extinguishing') {
            this._soulFlameAnimTimer++;
            var frame = this._soulFlameAnimTimer;

            if (frame <= 10) {
                // Phase 1: Api megap-megap kehabisan bahan bakar (berkedut sekarat)
                var sputterAlpha = [240, 60, 210, 40, 180, 50, 160, 30, 130, 20];
                var aIdx = Math.min(frame - 1, sputterAlpha.length - 1);
                this._soulEyeSprite.opacity = sputterAlpha[aIdx];
                var twitchScale = 0.95 - (frame / 10) * 0.35 + ((frame % 2 === 0) ? 0.12 : -0.10);
                this._soulEyeSprite.scale.x = Math.max(0.1, twitchScale * 0.9);
                this._soulEyeSprite.scale.y = Math.max(0.1, twitchScale * 1.25);
                this._soulEyeSprite.rotation = (frame % 2 === 0 ? 0.07 : -0.07);
                this._soulEyeSprite.x = baseX + (frame % 2 === 0 ? 2 : -2);
                this._soulEyeSprite.y = baseY - (twitchScale - 1.0) * 12;
            } else if (frame <= 22) {
                // Phase 2: Menciut tipis dan menguap lenyap seperti asap mati
                var pExp = (frame - 10) / 12;
                var shrink = (1 - pExp);
                this._soulEyeSprite.scale.x = Math.max(0.02, shrink * 0.5);
                this._soulEyeSprite.scale.y = Math.max(0.05, shrink * 0.8 + (1 - pExp) * 0.1);
                this._soulEyeSprite.opacity = Math.round(shrink * 110);
                this._soulEyeSprite.rotation = (Math.sin(frame * 0.5) * 0.05);
                this._soulEyeSprite.x = baseX;
                this._soulEyeSprite.y = baseY - (1 - shrink) * 10;
            } else {
                // Padam total
                this._soulEyeSprite.visible = false;
                this._soulFlameState = 'off';
                this._soulFlameAnimTimer = 0;
                this._currentSoulDrawn = null;
                this._soulEyeSprite.opacity = 255;
                this._soulEyeSprite.scale.x = 1.0;
                this._soulEyeSprite.scale.y = 1.0;
                this._soulEyeSprite.rotation = 0;
                if (this._soulEyeSprite.skew) this._soulEyeSprite.skew.x = 0;
                this._soulEyeSprite.x = baseX;
                this._soulEyeSprite.y = baseY;
            }
            return;
        }

        // -------------------------------------------------------------
        // KONDISI C: BURNING (Nyala Api Organik Alami - Tidak Mendat-Mendut)
        // -------------------------------------------------------------
        if (this._soulFlameState === 'burning' || (this._soulEyeSprite.visible && this._soulFlameState !== 'off')) {
            this._soulFlickerTimer++;
            var t = this._soulFlickerTimer;

            // 1. Gerak lidah api vertikal (stretch Y): kombinasi multi-frekuensi asimetris
            var lick = Math.sin(t * 0.21) * 0.055 
                     + Math.sin(t * 0.38) * 0.032 
                     + Math.sin(t * 0.73) * 0.018;
            var microFlutter = (Math.sin(t * 1.47) > 0.82) ? 0.025 : 0.0;
            var scaleY = 1.0 + lick + microFlutter;

            // 2. Pinggang api horizontal (konservasi volume: lidah memanjang -> pinggang menyempit)
            var waist = - (lick + microFlutter) * 0.42 + Math.sin(t * 0.16) * 0.022;
            var scaleX = 1.0 + waist;

            this._soulEyeSprite.scale.x = scaleX;
            this._soulEyeSprite.scale.y = scaleY;

            // 3. Pangkal api tetap tertambat di mata Cyclops, lidah api menjilat naik ke atas
            this._soulEyeSprite.y = baseY - (scaleY - 1.0) * 16;

            // 4. Liukan api kiri-kanan alami (rotasi & skew asimetris)
            var sway = Math.sin(t * 0.09) * 0.035 + Math.sin(t * 0.23) * 0.018;
            this._soulEyeSprite.rotation = sway;
            if (this._soulEyeSprite.skew) {
                this._soulEyeSprite.skew.x = Math.sin(t * 0.14) * 0.038;
            }
            this._soulEyeSprite.x = baseX + Math.sin(t * 0.12) * 1.5;

            // 5. Kedipan pendar cahaya api (luminance flutter)
            var glow = Math.sin(t * 0.28) * 15 + Math.sin(t * 0.61) * 10 + Math.sin(t * 1.18) * 6;
            this._soulEyeSprite.opacity = Math.round(Math.max(185, Math.min(255, 225 + glow)));
        }
    };

    Scene_StatusJournal.prototype.drawEquipmentSlots = function() {
        if (!this._equippedIconsSprite) return;
        var bmp = this._equippedIconsSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var actor = this._actor || $gameParty.menuActor();
        var equips = actor ? actor.equips() : [];
        var iconSet = ImageManager.loadSystem('IconSet');

        var iconSize = STATUS_JOURNAL_CONFIG.equipIconSize || 56;
        var half = Math.round(iconSize / 2);

        for (var i = 0; i < JOURNAL_SLOTS.length; i++) {
            var s = JOURNAL_SLOTS[i];
            var it = equips[s.slotIndex];
            if (it) {
                var drawn = false;
                var ix = s.x - half;
                var iy = s.y - half;

                if (typeof ImageManager.drawSkillIcon === 'function' && (it.customIcon || it.skillIconIndex !== undefined || it.itemIconIndex !== undefined)) {
                    ctx.save();
                    ctx.shadowColor = 'rgba(251, 191, 36, 0.7)';
                    ctx.shadowBlur = 8;
                    drawn = ImageManager.drawSkillIcon(bmp, it, ix, iy, iconSize, iconSize, this.drawEquipmentSlots.bind(this));
                    ctx.restore();
                }

                if (!drawn && it.iconIndex > 0) {
                    if (iconSet && iconSet.isReady()) {
                        var sx = (it.iconIndex % 16) * 32;
                        var sy = Math.floor(it.iconIndex / 16) * 32;

                        ctx.save();
                        ctx.shadowColor = 'rgba(251, 191, 36, 0.7)';
                        ctx.shadowBlur = 8;
                        ctx.drawImage(iconSet._canvas || iconSet._image, sx, sy, 32, 32, ix, iy, iconSize, iconSize);
                        ctx.restore();
                    } else if (iconSet && !iconSet.isReady() && !iconSet.isError()) {
                        this.attachSafeLoadListener(iconSet, 'equipSlots', this.drawEquipmentSlots);
                    }
                }
            }
        }

        bmp._setDirty();
        if (this._selectedSlotIndex >= 0 && this._selectedSlotIndex < JOURNAL_SLOTS.length) {
            var cur = JOURNAL_SLOTS[this._selectedSlotIndex];
            if (this._slotReticleSprite) {
                this._slotReticleSprite.x = cur.x;
                this._slotReticleSprite.y = cur.y;
                this._slotReticleSprite.visible = (this._focusMode === 'slots' && this._activeJournalTab === 0);
            }
        }
    };

    Scene_StatusJournal.prototype.drawPolaroidPhoto = function() {
        if (!this._polaroidSprite) return;
        var bmp = this._polaroidSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = 208;
        var h = 194;
        var actor = this._actor || $gameParty.menuActor();
        var actorName = actor ? actor.name() : 'Nia';

        var portraitBmp = ImageManager.loadPicture(actorName + '_0');
        if (portraitBmp && portraitBmp.isReady()) {
            var srcW = portraitBmp.width;
            var srcH = Math.round(srcW * (h / w));
            ctx.drawImage(portraitBmp._canvas || portraitBmp._image, 0, 0, srcW, srcH, 0, 0, w, h);
        } else if (portraitBmp && !portraitBmp.isReady() && !portraitBmp.isError()) {
            this.attachSafeLoadListener(portraitBmp, 'polaroidPhoto_' + actorName, this.drawPolaroidPhoto);
        } else {
            ctx.fillStyle = '#831843';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#f472b6';
            ctx.font = 'bold 26px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(actorName, w / 2, h / 2 + 10);
        }
        var isTrauma = actor && !actor.isDead() && (
            (typeof actor.sanity === 'function' ? actor.sanity() : actor._customSanity) <= 0 ||
            (typeof actor.isTraumaManifested === 'function' && actor.isTraumaManifested())
        );
        if (isTrauma) {
            ctx.save();
            var grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 110);
            grad.addColorStop(0, 'rgba(147, 51, 234, 0.10)');
            grad.addColorStop(0.7, 'rgba(107, 33, 168, 0.35)');
            grad.addColorStop(1, 'rgba(88, 28, 135, 0.65)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, w - 2, h - 2);
            ctx.restore();
        }
        bmp._setDirty();
        this.initPolaroidTraumaGlowGraphic();
    };

    // Ekstraksi deskripsi karakter dari notetag <Desc> / <Desc: ...> di Database > Actors
    Scene_StatusJournal.prototype.getActorDescNote = function(actor) {
        if (!actor) return '';
        var aId = (typeof actor.actorId === 'function') ? actor.actorId() : (actor._actorId || 0);
        var data = ($dataActors && $dataActors[aId]) ? $dataActors[aId] : null;
        var note = data ? (data.note || '') : '';
        if (!note) return '';
        var m = note.match(/<Desc>([\s\S]*?)<\/Desc>/i);
        if (m && m[1]) return m[1].replace(/\r\n/g, '\n').trim();
        m = note.match(/<Desc[ \t]*:[ \t]*([^>]*)>/i);
        if (m && m[1]) return m[1].trim();
        return '';
    };

    // PENGGAMBARAN BADGE NAMA RESMI PADA STATUS MENU (media_1789729322506.png)
        Scene_StatusJournal.prototype.getCharacterDef = function(actor) {
        if (!actor) return null;
        var aId = (typeof actor.actorId === 'function') ? actor.actorId() : (actor._actorId || 0);
        if (aId && PARTY_CHARACTERS[aId]) return PARTY_CHARACTERS[aId];
        var aName = (typeof actor.name === 'function') ? actor.name() : (actor._name || '');
        for (var k in PARTY_CHARACTERS) {
            if (PARTY_CHARACTERS[k].name.toLowerCase() === aName.toLowerCase()) {
                return PARTY_CHARACTERS[k];
            }
        }
        return null;
    };

    Scene_StatusJournal.prototype.drawStatusActorName = function() {
        if (this._drawingStatusActorName) return;
        this._drawingStatusActorName = true;
        try {
            if (!this._statusActorNameSprite) return;
            var bmp = this._statusActorNameSprite.bitmap;
            bmp.clear();
            var ctx = bmp._context;
            var actor = this._actor || $gameParty.menuActor();
            if (!actor) return;

            var charDef = this.getCharacterDef(actor);
            if (charDef && charDef.nameBadge) {
                var nameBmp = ImageManager.loadJournalParty(charDef.nameBadge);
                if (nameBmp && nameBmp.isReady()) {
                    var bbox = charDef.nameBBox || { sx: 0, sy: 0, sw: nameBmp.width, sh: nameBmp.height };
                    var scale = 1.35;
                    var dw = Math.round(bbox.sw * scale);
                    var dh = Math.round(bbox.sh * scale);
                    var dx = 35;
                    var dy = Math.round((90 - dh) / 2);
                    ctx.drawImage(nameBmp._canvas || nameBmp._image, bbox.sx, bbox.sy, bbox.sw, bbox.sh, dx, dy, dw, dh);
                    bmp._setDirty();
                } else if (nameBmp && !nameBmp.isReady() && !nameBmp.isError()) {
                    var aId = (typeof actor.actorId === 'function') ? actor.actorId() : (actor._actorId || 0);
                    this.attachSafeLoadListener(nameBmp, 'statusActorName_' + aId, this.drawStatusActorName);
                }
            } else {
                ctx.save();
                ctx.font = 'bold 24px GameFont, sans-serif';
                ctx.fillStyle = '#e11d48';
                ctx.textAlign = 'left';
                ctx.fillText(actor.name().toUpperCase(), 35, 52);
                ctx.restore();
                bmp._setDirty();
            }
        } finally {
            this._drawingStatusActorName = false;
        }
    };

    Scene_StatusJournal.prototype.drawPolaroidControls = function() {
        if (!this._polaroidControlSprite) return;
        var bmp = this._polaroidControlSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var members = $gameParty.members();
        var curActor = this._actor || $gameParty.menuActor();
        var curIdx = members.indexOf(curActor);
        if (curIdx < 0) curIdx = 0;

        ctx.save();
        if (members.length > 1) {
            var tabW = Math.min(64, Math.floor((208 - (members.length - 1) * 4) / members.length));
            for (var i = 0; i < members.length; i++) {
                var m = members[i];
                var isCur = (m === curActor);
                var tx = 75 + i * (tabW + 4);
                var ty = 0;

                var isMemTrauma = !m.isDead() && (
                    (typeof m.sanity === 'function' ? m.sanity() : m._customSanity) <= 0 ||
                    (typeof m.isTraumaManifested === 'function' && m.isTraumaManifested())
                );
                ctx.fillStyle = isMemTrauma ? (isCur ? '#9333ea' : '#581c87') : (isCur ? '#be185d' : '#4b5563');
                ctx.beginPath();
                ctx.roundRect(tx, ty, tabW, 16, [4, 4, 0, 0]);
                ctx.fill();
                if (isMemTrauma) {
                    ctx.strokeStyle = '#c084fc';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText((i + 1) + '.' + m.name().slice(0, 3), tx + tabW / 2, ty + 12);
            }

            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.beginPath();
            ctx.roundRect(75, 218, 48, 18, 4);
            ctx.fill();
            ctx.fillStyle = '#fbcfe8';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('◀ Q', 99, 231);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.beginPath();
            ctx.roundRect(235, 218, 48, 18, 4);
            ctx.fill();
            ctx.fillStyle = '#fbcfe8';
            ctx.fillText('W ▶', 259, 231);
        }
        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawStatusGauges = function() {
        var sprite = this._statusGaugesSprite || this._gaugesSprite;
        if (!sprite) return;
        var bmp = sprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var actor = this._actor || $gameParty.menuActor();
        if (!actor) return;

        var bars = STATUS_JOURNAL_CONFIG.bars;
        var barKeys = ['hp', 'mana', 'rage', 'mental'];
        var colors = {
            hp:     { start: '#ef4444', end: '#dc2626', glow: 'rgba(239, 68, 68, 0.4)' },
            mana:   { start: '#3b82f6', end: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
            rage:   { start: '#f97316', end: '#ea580c', glow: 'rgba(249, 115, 22, 0.4)' },
            mental: { start: '#10b981', end: '#059669', glow: 'rgba(16, 185, 129, 0.4)' }
        };

        var curSanity = (typeof actor.sanity === 'function') ? actor.sanity() : ((actor._customSanity !== undefined) ? actor._customSanity : 100);
        var maxSanity = (typeof actor.maxSanity === 'function') ? actor.maxSanity() : 100;

        var curVals = {
            hp: actor.hp,
            mana: actor.mp,
            rage: actor.tp,
            mental: curSanity
        };
        var maxVals = {
            hp: actor.mhp,
            mana: actor.mmp,
            rage: actor.maxTp ? actor.maxTp() : 100,
            mental: maxSanity
        };

        for (var k = 0; k < barKeys.length; k++) {
            var key = barKeys[k];
            var b = bars[key];
            if (!b) continue;

            var cur = Math.max(0, curVals[key]);
            var max = Math.max(1, maxVals[key]);
            var rate = Math.min(1.0, cur / max);

            var fillW = Math.round(b.w * rate);
            var col = colors[key];

            ctx.save();
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(b.x, b.y, b.w, b.h);

            if (fillW > 0) {
                var grad = ctx.createLinearGradient(b.x, b.y, b.x + fillW, b.y);
                grad.addColorStop(0, col.start);
                grad.addColorStop(1, col.end);
                ctx.fillStyle = grad;
                ctx.fillRect(b.x, b.y, fillW, b.h);
            }

            ctx.font = 'bold 13px GameFont, monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(cur + '/' + max, b.x + b.w - 4, b.y + b.h - 6);
            ctx.restore();
        }
    };

    Scene_StatusJournal.prototype.drawLinedNote = function() {
        var bmp = this._linedNoteSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var actor = this._actor || $gameParty.menuActor();
        if (!actor) return;

        var slot = JOURNAL_SLOTS[this._selectedSlotIndex];
        var curEquip = slot ? actor.equips()[slot.slotIndex] : null;
        var isDrawer = (this._focusMode === 'drawer' && this._drawerActive);
        var previewActor = (isDrawer && this.getPreviewActor) ? (this.getPreviewActor() || actor) : actor;
        var previewItem = (isDrawer && this._drawerItems) ? this._drawerItems[this._drawerIndex] : curEquip;
        var note = STATUS_JOURNAL_CONFIG.note;

        ctx.save();
        ctx.font = 'bold 15px GameFont, sans-serif';
        ctx.fillStyle = '#451a03';
        ctx.textAlign = 'left';
        ctx.fillText('✎ ' + (slot ? slot.name : 'Equipment'), note.textX, note.titleY);

        ctx.font = 'bold 14px GameFont, sans-serif';
        if (isDrawer) {
            if (previewItem) {
                ctx.fillStyle = '#1e3a8a';
                ctx.fillText('▶ ' + previewItem.name, note.textX, note.itemY);
            } else {
                ctx.fillStyle = '#dc2626';
                ctx.fillText('▶ (Lepas Perlengkapan)', note.textX, note.itemY);
            }
        } else {
            ctx.fillStyle = curEquip ? '#1e3a8a' : '#78350f';
            ctx.fillText(curEquip ? ('▶ ' + curEquip.name) : '(Slot Kosong)', note.textX, note.itemY);
        }

        ctx.font = '13.5px GameFont, sans-serif';
        ctx.fillStyle = '#292524';

        if (!this._shiftActive) {
            var params = ['MHP', 'MMP', 'ATK', 'DEF', 'MAT', 'MDF', 'AGI', 'LUK'];
            for (var p = 0; p < Math.min(6, note.lineYs.length); p++) {
                var y = note.lineYs[p];
                var pName = params[p];
                var baseVal = actor.paramBase(p);
                var curVal = previewActor.param(p);
                var diff = curVal - baseVal;

                ctx.fillText(pName, note.textX, y);
                ctx.fillText(String(curVal), note.statValX, y);
                if (diff !== 0) {
                    ctx.fillStyle = (diff > 0) ? '#15803d' : '#b91c1c';
                    ctx.fillText((diff > 0 ? '+' : '') + diff, note.statBonusX, y);
                    ctx.fillStyle = '#292524';
                }
            }
        } else {
            var displayItem = isDrawer ? previewItem : curEquip;
            var desc = displayItem ? displayItem.description : (isDrawer ? 'Lepas perlengkapan yang saat ini terpasang pada slot ini.' : 'Tekan [ENTER] untuk memilih perlengkapan dari laci.');
            var lines = desc.match(/.{1,36}/g) || [desc];
            for (var l = 0; l < Math.min(lines.length, note.lineYs.length); l++) {
                ctx.fillText(lines[l], note.textX, note.lineYs[l]);
            }
        }

        ctx.font = 'italic 11px GameFont, sans-serif';
        ctx.fillStyle = '#78716c';
        ctx.fillText('[SHIFT] Tahan untuk melihat catatan lore', note.textX, note.hintY);
        ctx.restore();

        // Realtime morph trigger untuk Octagram Status saat actor / equip berubah
        if (this.triggerOctagramMorph) {
            this.triggerOctagramMorph(false);
        }
    };

    //=============================================================================
    // OCTAGRAM STAT RADAR (SVG MORPHTO & TILTED GROUND CARD)
    //=============================================================================

    var OCTA_STAT_MAX_REFS = [
        3000, // 0: MHP
        900,  // 1: MMP
        250,  // 2: ATK
        250,  // 3: DEF
        350,  // 4: MAT
        250,  // 5: MDF
        200,  // 6: AGI
        200   // 7: LUK
    ];

    Scene_StatusJournal.prototype.createOctagramStatusRadar = function() {
        if (this._octagramContainer) return;

        var cfg = (STATUS_JOURNAL_CONFIG && STATUS_JOURNAL_CONFIG.octagram) ? STATUS_JOURNAL_CONFIG.octagram : {};
        var posX = cfg.x !== undefined ? cfg.x : 372;
        var posY = cfg.y !== undefined ? cfg.y : 498;
        var rot  = cfg.rotation !== undefined ? cfg.rotation : -0.040;
        var cardW = cfg.w || 184;
        var cardH = cfg.h || 196;

        this._octagramContainer = new Sprite();
        this._octagramContainer.x = posX;
        this._octagramContainer.y = posY;
        this._octagramContainer.rotation = rot;
        this._leftPageContainer.addChild(this._octagramContainer);

        this._octagramSprite = new Sprite();
        this._octagramSprite.anchor.x = 0.5;
        this._octagramSprite.anchor.y = 0.5;
        this._octagramSprite.bitmap = new Bitmap(cardW, cardH);
        this._octagramContainer.addChild(this._octagramSprite);

        // Objek state interpolasi titik morphing untuk Anime.js
        this._octaMorph = {
            b0: 0.20, b1: 0.20, b2: 0.20, b3: 0.20,
            b4: 0.20, b5: 0.20, b6: 0.20, b7: 0.20,
            t0: 0.20, t1: 0.20, t2: 0.20, t3: 0.20,
            t4: 0.20, t5: 0.20, t6: 0.20, t7: 0.20
        };
        this._octaTargetBase = null;
        this._octaTargetTotal = null;
        this._octaBreathTimer = 0;
        this._octaIsMorphing = false;

        this.triggerOctagramMorph(true);
    };

    
    // Helper untuk kalkulasi status preview secara realtime saat item disorot di drawer carousel
    Scene_StatusJournal.prototype.getPreviewActor = function() {
        var actor = this._actor || $gameParty.menuActor();
        if (!actor) return null;
        if (this._focusMode === 'drawer' && this._drawerActive && this._drawerItems) {
            var slot = JOURNAL_SLOTS[this._selectedSlotIndex];
            if (slot) {
                var item = this._drawerItems[this._drawerIndex] || null;
                var key = actor.actorId() + '_' + slot.slotIndex + '_' + (item ? ('item_' + item.id) : 'null');
                if (this._cachedPreviewKey === key && this._cachedPreviewActor) {
                    return this._cachedPreviewActor;
                }
                try {
                    var tempActor = JsonEx.makeDeepCopy(actor);
                    tempActor.forceChangeEquip(slot.slotIndex, item);
                    this._cachedPreviewKey = key;
                    this._cachedPreviewActor = tempActor;
                    return tempActor;
                } catch (e) {
                    return actor;
                }
            }
        }
        return actor;
    };

    Scene_StatusJournal.prototype.getActorStatRatios = function(actor) {
        if (!actor) {
            return {
                base:  [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
                total: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]
            };
        }
        // Realtime preview dari item yang sedang dipilih di carousel drawer jika aktif
        var targetActor = (this._focusMode === 'drawer' && this._drawerActive && this.getPreviewActor) ? (this.getPreviewActor() || actor) : actor;
        var base = [];
        var total = [];
        for (var i = 0; i < 8; i++) {
            var bVal = actor.paramBase(i);
            var tVal = targetActor.param(i);
            var ref  = OCTA_STAT_MAX_REFS[i] || 250;

            // Normalisasi dinamis antara 0.18 (minimum octagram ring) hingga 0.98
            var bRatio = Math.max(0.18, Math.min(0.98, 0.18 + (bVal / ref) * 0.78));
            var tRatio = Math.max(bRatio, Math.min(1.00, 0.18 + (tVal / ref) * 0.78));

            base.push(bRatio);
            total.push(tRatio);
        }
        return { base: base, total: total };
    };

    Scene_StatusJournal.prototype.triggerOctagramMorph = function(instant) {
        var actor = $gameParty.menuActor();
        if (!actor || !this._octaMorph) return;

        var ratios = this.getActorStatRatios(actor);
        var changed = false;

        if (!this._octaTargetBase || !this._octaTargetTotal) {
            changed = true;
        } else {
            for (var i = 0; i < 8; i++) {
                if (Math.abs(this._octaTargetBase[i] - ratios.base[i]) > 0.005 ||
                    Math.abs(this._octaTargetTotal[i] - ratios.total[i]) > 0.005) {
                    changed = true;
                    break;
                }
            }
        }

        if (!changed && !instant) return;

        this._octaTargetBase = ratios.base;
        this._octaTargetTotal = ratios.total;
        var self = this;

        if (instant || typeof anime === 'undefined') {
            for (var j = 0; j < 8; j++) {
                this._octaMorph['b' + j] = ratios.base[j];
                this._octaMorph['t' + j] = ratios.total[j];
            }
            this.renderOctagramRadar();
            return;
        }

        this._octaIsMorphing = true;
        anime.remove(this._octaMorph);
        var isDrawerActive = (this._focusMode === 'drawer' && this._drawerActive);
        var animDuration = isDrawerActive ? 260 : 720;
        var animEasing = isDrawerActive ? 'easeOutCubic' : 'easeOutElastic(1, .75)';
        anime({
            targets: this._octaMorph,
            b0: ratios.base[0], b1: ratios.base[1], b2: ratios.base[2], b3: ratios.base[3],
            b4: ratios.base[4], b5: ratios.base[5], b6: ratios.base[6], b7: ratios.base[7],
            t0: ratios.total[0], t1: ratios.total[1], t2: ratios.total[2], t3: ratios.total[3],
            t4: ratios.total[4], t5: ratios.total[5], t6: ratios.total[6], t7: ratios.total[7],
            duration: animDuration,
            easing: animEasing,
            update: function() {
                self.renderOctagramRadar();
            },
            complete: function() {
                self._octaIsMorphing = false;
                self.renderOctagramRadar();
            }
        });
    };

    Scene_StatusJournal.prototype.renderOctagramRadar = function() {
        if (!this._octagramSprite || !this._octagramSprite.bitmap) return;
        var bmp = this._octagramSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        if (!ctx) return;

        var w = bmp.width;
        var h = bmp.height;
        var cx = Math.floor(w / 2);
        var cy = Math.floor(h / 2) - 3;
        var R_MAX = 52;

        ctx.save();

        // 1. KOTAK PUTIH KOSONGAN (GROUND CARD SCRAPBOOK DENGAN SHADOW & WASHI TAPE)
        ctx.shadowColor = 'rgba(28, 20, 16, 0.16)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = '#faf8f5';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(5, 5, w - 10, h - 10, 4);
        } else {
            ctx.rect(5, 5, w - 10, h - 10);
        }
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Garis tepi kartu kertas
        ctx.strokeStyle = '#e7e2db';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Faint blueprint grid lines pada kartu
        ctx.strokeStyle = 'rgba(180, 165, 150, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var gy = 26; gy < h - 22; gy += 18) {
            ctx.moveTo(10, gy);
            ctx.lineTo(w - 10, gy);
        }
        for (var gx = 22; gx < w - 10; gx += 20) {
            ctx.moveTo(gx, 24);
            ctx.lineTo(gx, h - 22);
        }
        ctx.stroke();

        // Washi tape di sudut atas (Masking Tape Scrapbook)
        ctx.save();
        ctx.fillStyle = 'rgba(230, 218, 185, 0.78)';
        ctx.translate(28, 5);
        ctx.rotate(-0.06);
        ctx.fillRect(-16, -4, 34, 11);
        ctx.strokeStyle = 'rgba(205, 190, 155, 0.55)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-16, -4, 34, 11);
        ctx.restore();

        // Header cap kecil
        ctx.font = 'bold 9px GameFont, sans-serif';
        ctx.fillStyle = '#8c7b6f';
        ctx.textAlign = 'center';
        ctx.fillText('✦ STAT OCTAGRAM ✦', cx, 20);

        // 2. GRID RADAR OCTAGRAM (8 SUMBU & 3 CINCIN KONSENTRIS OKTAGON)
        var rings = [0.35, 0.68, 1.00];
        for (var r = 0; r < rings.length; r++) {
            var curR = R_MAX * rings[r];
            ctx.beginPath();
            for (var i = 0; i < 8; i++) {
                var ang = i * (Math.PI * 2 / 8) - (Math.PI / 2);
                var px = cx + Math.cos(ang) * curR;
                var py = cy + Math.sin(ang) * curR;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = (r === 2) ? 'rgba(150, 130, 115, 0.40)' : 'rgba(180, 165, 150, 0.22)';
            ctx.lineWidth = (r === 2) ? 1.4 : 1.0;
            ctx.stroke();
        }

        // 8 Garis Jari-jari Sumbu
        ctx.beginPath();
        for (var s = 0; s < 8; s++) {
            var sAng = s * (Math.PI * 2 / 8) - (Math.PI / 2);
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(sAng) * R_MAX, cy + Math.sin(sAng) * R_MAX);
        }
        ctx.strokeStyle = 'rgba(180, 165, 150, 0.28)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label 8 Nama Stat di Ujung Octagram
        var statLabels = ['HP', 'MP', 'ATK', 'DEF', 'MAT', 'MDF', 'AGI', 'LUK'];
        ctx.font = 'bold 8.5px GameFont, sans-serif';
        ctx.fillStyle = '#6b5a4d';
        ctx.textAlign = 'center';
        for (var l = 0; l < 8; l++) {
            var lAng = l * (Math.PI * 2 / 8) - (Math.PI / 2);
            var distLabel = R_MAX + 10;
            var lx = cx + Math.cos(lAng) * distLabel;
            var ly = cy + Math.sin(lAng) * distLabel + 3;
            ctx.fillText(statLabels[l], lx, ly);
        }

        var breath = (!this._octaIsMorphing) ? Math.sin(this._octaBreathTimer || 0) * 0.8 : 0;

        // 3. LAYER 2: STAT TOTAL DENGAN TAMBAHAN EQUIPMENT (CYAN / EMERALD)
        var totalPoints = [];
        for (var t = 0; t < 8; t++) {
            var tAng = t * (Math.PI * 2 / 8) - (Math.PI / 2);
            var tRatio = Math.max(0.18, Math.min(1.0, (this._octaMorph['t' + t] || 0.2) + (breath * 0.008)));
            var tr = R_MAX * tRatio;
            totalPoints.push({ x: cx + Math.cos(tAng) * tr, y: cy + Math.sin(tAng) * tr });
        }

        ctx.beginPath();
        for (var tp = 0; tp < 8; tp++) {
            if (tp === 0) ctx.moveTo(totalPoints[tp].x, totalPoints[tp].y);
            else ctx.lineTo(totalPoints[tp].x, totalPoints[tp].y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.30)'; // Luminous cyan
        ctx.fill();
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Titik simpul Layer 2
        for (var td = 0; td < 8; td++) {
            ctx.beginPath();
            ctx.arc(totalPoints[td].x, totalPoints[td].y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
        }

        // 4. LAYER 1: STAT ASLI KARAKTER (WARNA PINK)
        var basePoints = [];
        for (var b = 0; b < 8; b++) {
            var bAng = b * (Math.PI * 2 / 8) - (Math.PI / 2);
            var bRatio = Math.max(0.18, Math.min(1.0, (this._octaMorph['b' + b] || 0.2) + (breath * 0.008)));
            var br = R_MAX * bRatio;
            basePoints.push({ x: cx + Math.cos(bAng) * br, y: cy + Math.sin(bAng) * br });
        }

        ctx.beginPath();
        for (var bp = 0; bp < 8; bp++) {
            if (bp === 0) ctx.moveTo(basePoints[bp].x, basePoints[bp].y);
            else ctx.lineTo(basePoints[bp].x, basePoints[bp].y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 77, 148, 0.42)'; // Occult vibrant pink
        ctx.fill();
        ctx.strokeStyle = '#ff4d94';
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Titik simpul Layer 1 (Pink dengan inti putih bercahaya)
        for (var bd = 0; bd < 8; bd++) {
            ctx.beginPath();
            ctx.arc(basePoints[bd].x, basePoints[bd].y, 2.7, 0, Math.PI * 2);
            ctx.fillStyle = '#ff4d94';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(basePoints[bd].x, basePoints[bd].y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        // 5. MINI KETERANGAN / LEGENDA DI BAWAH KARTU
        var legY = h - 16;
        // Badge Pink (Base Stat)
        ctx.fillStyle = '#ff4d94';
        ctx.fillRect(cx - 52, legY - 7, 7, 7);
        ctx.font = 'bold 8.5px GameFont, sans-serif';
        ctx.fillStyle = '#be185d';
        ctx.textAlign = 'left';
        ctx.fillText('Base', cx - 41, legY);

        // Badge Cyan (Equip Stat)
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(cx + 8, legY - 7, 7, 7);
        ctx.fillStyle = '#0369a1';
        ctx.fillText('Equip', cx + 19, legY);

        bmp._setDirty();
        ctx.restore();
    };

    Scene_StatusJournal.prototype.updateOctagramIdleBreathing = function() {
        if (!this._octaMorph || this._octaIsMorphing) return;
        this._octaBreathTimer = (this._octaBreathTimer || 0) + 0.045;
        // Gambar ulang subtle breathing setiap 3 frame agar super hemat daya
        if (Graphics.frameCount % 3 === 0) {
            this.renderOctagramRadar();
        }
    };

    // ------------------------------------------------------------------------
    // PENGGAMBARAN HALAMAN ITEM (PIXEL-PERFECT EX.JPEG)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.refreshItemPage = function() {
        var cfg = STATUS_JOURNAL_CONFIG.itemJournal;
        if (this._itemPolaroidContainer) {
            this._itemPolaroidContainer.x = cfg.polaroid.x;
            this._itemPolaroidContainer.y = cfg.polaroid.y;
            this._itemPolaroidContainer.rotation = cfg.polaroid.rotation || -0.148;
        }
        if (this._itemTitleSprite) {
            this._itemTitleSprite.x = cfg.title.x;
        }
        if (this._itemDescPaperSprite) {
            this._itemDescPaperSprite.x = cfg.description.x;
            this._itemDescPaperSprite.y = cfg.description.y;
        }
        if (this._itemDescTextSprite) {
            this._itemDescTextSprite.x = cfg.description.x;
            this._itemDescTextSprite.y = cfg.description.y;
        }

        this.drawItemGrid();
        this.drawItemDetails();
    };

    Scene_StatusJournal.prototype.drawItemGrid = function() {
        if (!this._itemSlotsSprite) return;
        var bmp = this._itemSlotsSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var cfg = STATUS_JOURNAL_CONFIG.itemJournal.grid;
        var colBmp = ImageManager.loadJournalItem('Column_');
        var colImg = colBmp ? (colBmp._canvas || colBmp._image) : null;
        if (colBmp && !colBmp.isReady()) {
            this.attachSafeLoadListener(colBmp, 'itemGrid_col', this.drawItemGrid);
        }
        var iconSet = ImageManager.loadSystem('IconSet');
        var iconImg = iconSet ? (iconSet._canvas || iconSet._image) : null;
        if (iconSet && !iconSet.isReady()) {
            this.attachSafeLoadListener(iconSet, 'itemGrid_iconSet', this.drawItemGrid);
        }
        var itemSheet = typeof ImageManager.loadItemSheet === 'function' ? ImageManager.loadItemSheet() : null;
        if (itemSheet && !itemSheet.isReady()) {
            this.attachSafeLoadListener(itemSheet, 'itemGrid_itemSheet', this.drawItemGrid);
        }
        var skillSheet = typeof ImageManager.loadSkillSheet === 'function' ? ImageManager.loadSkillSheet() : null;
        if (skillSheet && !skillSheet.isReady()) {
            this.attachSafeLoadListener(skillSheet, 'itemGrid_skillSheet', this.drawItemGrid);
        }

        var items = this.getItemList();
        var startIdx = this._itemPageIndex * 24;

        for (var r = 0; r < cfg.rows; r++) {
            for (var c = 0; c < cfg.cols; c++) {
                var slotIdx = r * cfg.cols + c;
                var it = items[startIdx + slotIdx] || null;
                var x = cfg.startX + c * cfg.spacingX;
                var y = cfg.startY + r * cfg.spacingY;

                // 1. Bingkai Slot Column_.png (90 x 86)
                if (colBmp && colBmp.isReady() && colImg) {
                    ctx.drawImage(colImg, x, y, cfg.slotW, cfg.slotH);
                }

                // 2. Ikon Item Diperbesar & Di-Center (56x56 px)
                if (it) {
                    var iconSize = cfg.iconSize || 56;
                    var ix = Math.round(x + (cfg.slotW - iconSize) / 2);
                    var iy = Math.round(y + (cfg.slotH - iconSize) / 2);

                    ctx.save();
                    ctx.imageSmoothingEnabled = false;
                    ctx.shadowColor = 'rgba(0,0,0,0.45)';
                    ctx.shadowBlur = 6;

                    var drawn = false;

                    // A. Item Sheet (karso.png 90x90 per cell, 10 cols)
                    if (!drawn && it.itemIconIndex !== undefined && it.itemIconIndex >= 0) {
                        if (itemSheet && itemSheet.isReady()) {
                            var rawItemSheet = this.getRawImage(itemSheet);
                            if (rawItemSheet) {
                                var kCol = it.itemIconIndex % 10;
                                var kRow = Math.floor(it.itemIconIndex / 10);
                                try { ctx.drawImage(rawItemSheet, kCol * 90, kRow * 90, 90, 90, ix, iy, iconSize, iconSize); drawn = true; } catch(e) {}
                            }
                        }
                    }

                    // B. Skill Sheet (Skills.png 150x150 per cell, 10 cols)
                    if (!drawn && it.skillIconIndex !== undefined && it.skillIconIndex >= 0) {
                        if (skillSheet && skillSheet.isReady()) {
                            var rawSkillSheet = this.getRawImage(skillSheet);
                            if (rawSkillSheet) {
                                var sCol = it.skillIconIndex % 10;
                                var sRow = Math.floor(it.skillIconIndex / 10);
                                try { ctx.drawImage(rawSkillSheet, sCol * 150, sRow * 150, 150, 150, ix, iy, iconSize, iconSize); drawn = true; } catch(e) {}
                            }
                        }
                    }

                    // C. Custom PNG
                    if (!drawn && it.customIcon) {
                        var cBmp = ImageManager.loadBitmap('img/pictures/Skills/', it.customIcon, 0, true);
                        if (!cBmp || !cBmp.isReady()) cBmp = ImageManager.loadBitmap('img/icons/', it.customIcon, 0, true);
                        if (cBmp && cBmp.isReady()) {
                            var rawC = this.getRawImage(cBmp);
                            if (rawC) {
                                var cW = cBmp._image ? cBmp._image.width : (cBmp.__canvas ? cBmp.__canvas.width : 150);
                                var cH = cBmp._image ? cBmp._image.height : (cBmp.__canvas ? cBmp.__canvas.height : 150);
                                try { ctx.drawImage(rawC, 0, 0, cW, cH, ix, iy, iconSize, iconSize); drawn = true; } catch(e) {}
                            }
                        } else if (cBmp && !cBmp.isReady() && !cBmp.isError()) {
                            this.attachSafeLoadListener(cBmp, 'itemGrid_custom_' + (it.id || it.name), this.drawItemGrid);
                        }
                    }

                    // D. Standard IconSet
                    if (!drawn && it.iconIndex > 0 && iconImg && iconSet && iconSet.isReady()) {
                        var sx = (it.iconIndex % 16) * 32;
                        var sy = Math.floor(it.iconIndex / 16) * 32;
                        try { ctx.drawImage(iconImg, sx, sy, 32, 32, ix, iy, iconSize, iconSize); drawn = true; } catch(e) {}
                    }
                    ctx.restore();

                    // Jumlah Barang (Stack Count) di Pojok Kanan Bawah
                    var qty = $gameParty.numItems(it);
                    if (qty > 1) {
                        ctx.save();
                        ctx.font = 'bold 15px GameFont, sans-serif';
                        ctx.textAlign = 'right';
                        ctx.fillStyle = '#000000';
                        ctx.fillText(String(qty), x + cfg.slotW - 5 + 1, y + cfg.slotH - 6 + 1);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(String(qty), x + cfg.slotW - 5, y + cfg.slotH - 6);
                        ctx.restore();
                    }
                }
            }
        }

        bmp._setDirty();

        // Paginasi Indikator Halaman
        var totalPages = Math.max(1, Math.ceil(items.length / 24));
        var pBmp = this._itemPageNavSprite.bitmap;
        pBmp.clear();
        if (totalPages > 1) {
            var pCtx = pBmp._context;
            pCtx.save();
            pCtx.font = 'bold 14px GameFont, monospace';
            pCtx.textAlign = 'center';
            pCtx.fillStyle = '#451a03';
            pCtx.fillText('◄ Q   Halaman ' + (this._itemPageIndex + 1) + ' / ' + totalPages + '   W ▶', 254, 20);
            pCtx.restore();
            pBmp._setDirty();
        }

        this.updateItemReticlePosition();
    };

    Scene_StatusJournal.prototype.drawItemReticleGraphic = function() {
        if (!this._itemReticleSprite || !this._itemReticleSprite.bitmap) return;
        var bmp = this._itemReticleSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = bmp.width;
        var h = bmp.height;
        var offset = 3;
        var arm = 18;

        ctx.save();
        ctx.strokeStyle = '#ec4899'; // Magenta cerah persis referensi ex.jpeg
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(236, 72, 153, 0.9)';
        ctx.shadowBlur = 8;
        ctx.lineCap = 'square';

        // Top-Left
        ctx.beginPath();
        ctx.moveTo(offset, offset + arm);
        ctx.lineTo(offset, offset);
        ctx.lineTo(offset + arm, offset);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(w - offset - arm, offset);
        ctx.lineTo(w - offset, offset);
        ctx.lineTo(w - offset, offset + arm);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(offset, h - offset - arm);
        ctx.lineTo(offset, h - offset);
        ctx.lineTo(offset + arm, h - offset);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(w - offset - arm, h - offset);
        ctx.lineTo(w - offset, h - offset);
        ctx.lineTo(w - offset, h - offset - arm);
        ctx.stroke();

        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.updateItemReticlePosition = function() {
        if (!this._itemReticleSprite) return;
        var cfg = STATUS_JOURNAL_CONFIG.itemJournal.grid;
        var r = Math.floor(this._itemSlotIndex / cfg.cols);
        var c = this._itemSlotIndex % cfg.cols;
        this._itemReticleSprite.x = cfg.startX + c * cfg.spacingX + cfg.slotW / 2;
        this._itemReticleSprite.y = cfg.startY + r * cfg.spacingY + cfg.slotH / 2;
        this._itemReticleSprite.visible = (this._focusMode === 'slots' && this._activeJournalTab === 1);
    };

    Scene_StatusJournal.prototype.drawItemDetails = function() {
        var it = this.getCurrentItem();
        var cfg = STATUS_JOURNAL_CONFIG.itemJournal;

        // 1. Polaroid Art di dalam Frame Polaroid Miring
        var artBmp = this._itemPolaroidArtSprite.bitmap;
        artBmp.clear();
        var artCtx = artBmp._context;

        // Area foto gelap magenta Polaroid_.png
        artCtx.save();
        artCtx.fillStyle = '#73335e';
        artCtx.fillRect(16, 12, 201, 186);

        if (it) {
            var drawSize = cfg.polaroid.iconSize || (cfg.polaroid.photoScale ? Math.round(32 * cfg.polaroid.photoScale) : 100);
            var drawW = drawSize;
            var drawH = drawSize;
            var dx = Math.round(cfg.polaroid.photoCX - drawW / 2);
            var dy = Math.round(cfg.polaroid.photoCY - drawH / 2);

            artCtx.imageSmoothingEnabled = false;
            artCtx.shadowColor = 'rgba(0,0,0,0.5)';
            artCtx.shadowBlur = 8;

            var drawn = false;

            // 1. Item Sheet (karso.png 90x90 per cell, 10 cols)
            if (!drawn && it.itemIconIndex !== undefined && it.itemIconIndex >= 0) {
                var itemSheet = typeof ImageManager.loadItemSheet === 'function'
                    ? ImageManager.loadItemSheet()
                    : ImageManager.loadBitmap('img/pictures/items/', 'karso', 0, true);
                if (itemSheet && itemSheet.isReady()) {
                    var rawItemSheet = this.getRawImage(itemSheet);
                    if (rawItemSheet) {
                        var kCol = it.itemIconIndex % 10;
                        var kRow = Math.floor(it.itemIconIndex / 10);
                        try {
                            artCtx.drawImage(rawItemSheet, kCol * 90, kRow * 90, 90, 90, dx, dy, drawW, drawH);
                            drawn = true;
                        } catch(e) {}
                    }
                } else if (itemSheet && !itemSheet.isReady() && !itemSheet.isError()) {
                    this.attachSafeLoadListener(itemSheet, 'itemDetails_itemSheet', this.drawItemDetails);
                }
            }

            // 2. Skill Sheet (Skills.png 150x150 per cell, 10 cols)
            if (!drawn && it.skillIconIndex !== undefined && it.skillIconIndex >= 0) {
                var skillSheet = typeof ImageManager.loadSkillSheet === 'function'
                    ? ImageManager.loadSkillSheet()
                    : ImageManager.loadBitmap('img/pictures/Skills/', 'Skills', 0, true);
                if (skillSheet && skillSheet.isReady()) {
                    var rawSkillSheet = this.getRawImage(skillSheet);
                    if (rawSkillSheet) {
                        var sCol = it.skillIconIndex % 10;
                        var sRow = Math.floor(it.skillIconIndex / 10);
                        try {
                            artCtx.drawImage(rawSkillSheet, sCol * 150, sRow * 150, 150, 150, dx, dy, drawW, drawH);
                            drawn = true;
                        } catch(e) {}
                    }
                } else if (skillSheet && !skillSheet.isReady() && !skillSheet.isError()) {
                    this.attachSafeLoadListener(skillSheet, 'itemDetails_skillSheet', this.drawItemDetails);
                }
            }

            // 3. Custom PNG
            if (!drawn && it.customIcon) {
                var customBmp = ImageManager.loadBitmap('img/pictures/Skills/', it.customIcon, 0, true);
                if (!customBmp || !customBmp.isReady()) customBmp = ImageManager.loadBitmap('img/icons/', it.customIcon, 0, true);
                if (customBmp && customBmp.isReady()) {
                    var rawCustom = this.getRawImage(customBmp);
                    if (rawCustom) {
                        var cW = customBmp._image ? customBmp._image.width : (customBmp.__canvas ? customBmp.__canvas.width : 150);
                        var cH = customBmp._image ? customBmp._image.height : (customBmp.__canvas ? customBmp.__canvas.height : 150);
                        try {
                            artCtx.drawImage(rawCustom, 0, 0, cW, cH, dx, dy, drawW, drawH);
                            drawn = true;
                        } catch(e) {}
                    }
                } else if (customBmp && !customBmp.isReady() && !customBmp.isError()) {
                    this.attachSafeLoadListener(customBmp, 'itemDetails_custom', this.drawItemDetails);
                }
            }

            // 4. Standard IconSet
            if (!drawn && it.iconIndex > 0) {
                var iconSet = ImageManager.loadSystem('IconSet');
                if (iconSet && iconSet.isReady()) {
                    var iconImg = iconSet._canvas || iconSet._image;
                    var sx = (it.iconIndex % 16) * 32;
                    var sy = Math.floor(it.iconIndex / 16) * 32;
                    try {
                        artCtx.drawImage(iconImg, sx, sy, 32, 32, dx, dy, drawW, drawH);
                        drawn = true;
                    } catch(e) {}
                } else if (iconSet && !iconSet.isReady() && !iconSet.isError()) {
                    this.attachSafeLoadListener(iconSet, 'itemDetails_iconSet', this.drawItemDetails);
                }
            }
        }
        artCtx.restore();

        // 2. Judul & Subteks (Font GameFont Kiwi Soda)
        var tBmp = this._itemTitleSprite.bitmap;
        tBmp.clear();
        var tCtx = tBmp._context;
        tCtx.save();

        if (it) {
            tCtx.font = 'bold 22px GameFont, sans-serif';
            tCtx.fillStyle = '#2c1810';
            tCtx.textAlign = 'left';
            tCtx.fillText(it.name, 0, cfg.title.nameY);

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
            tCtx.fillText(catText, 0, cfg.title.catY);

            var subText = '*unidentified';
            if (it.note && it.note.match(/<type:\s*(.*)>/i)) {
                subText = '*' + RegExp.$1;
            } else if (it.price > 0) {
                subText = '*Value: ' + it.price + ' G';
            }
            tCtx.font = '16px GameFont, sans-serif';
            tCtx.fillStyle = '#4b5563';
            tCtx.fillText(subText, 0, cfg.title.subY);
        } else {
            tCtx.font = 'bold 20px GameFont, sans-serif';
            tCtx.fillStyle = '#9ca3af';
            tCtx.fillText('(Slot Kosong)', 0, cfg.title.nameY);
        }
        tCtx.restore();

        // 3. Teks Catatan Lore (Tersusun di Atas Garis Kertas)
        var dTextBmp = this._itemDescTextSprite.bitmap;
        dTextBmp.clear();
        var dCtx = dTextBmp._context;
        dCtx.save();

        var descText = '';
        if (it) {
            if (it.name && it.name.toLowerCase().includes('white') && it.name.toLowerCase().includes('sticky') && !it.description) {
                descText = 'Seperti nya dikeluarkan oleh seorang pria berkulit gelap, dia mengerang seperti orang kesakitan, semoga dia baik-baik saja...';
            } else {
                descText = it.description || 'Tidak ada catatan atau lore khusus untuk barang ini.';
            }
        } else {
            descText = 'Slot ini sedang kosong. Kamu belum memiliki barang di slot inventaris ini.';
        }

        dCtx.font = '18px GameFont, sans-serif';
        dCtx.fillStyle = '#262626';
        dCtx.textAlign = 'left';

        var clean = descText.replace(/\r?\n/g, ' ');
        var words = clean.split(' ');
        var line = '';
        var lineIdx = 0;
        var maxLineWidth = 415;
        var startX = cfg.description.textX;
        var startY = cfg.description.textY;
        var lHeight = cfg.description.lineHeight || 34;
        var maxLines = cfg.description.maxLines || 7;

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

        // Toast notifikasi
        if (this._toastTimer > 0 && this._toastMessage) {
            dCtx.fillStyle = '#be123c';
            dCtx.font = 'bold 15px GameFont, sans-serif';
            dCtx.fillText('⚠️ ' + this._toastMessage, startX, startY + 6 * lHeight);
        }

        dCtx.restore();
    };

    Scene_StatusJournal.prototype.getItemList = function() {
        var items = [];
        var partyItems = $gameParty.allItems();
        for (var i = 0; i < partyItems.length; i++) {
            var it = partyItems[i];
            if (it && $gameParty.numItems(it) > 0) {
                items.push(it);
            }
        }
        return items;
    };

    Scene_StatusJournal.prototype.getCurrentItem = function() {
        var list = this.getItemList();
        var idx = this._itemPageIndex * 24 + this._itemSlotIndex;
        return (idx >= 0 && idx < list.length) ? list[idx] : null;
    };


    // ========================================================================
    // METODE & LOGIKA HALAMAN PARTY SCRAPBOOK (TAB 2)
    // ========================================================================
    Scene_StatusJournal.prototype.refreshPartyPage = function() {
        this.drawPartyLeftPage();
        this.drawPartyRightPage();
        this.updatePartyReticlePosition();
    };

    Scene_StatusJournal.prototype.getPartyCandidates = function() {
        return [
            { id: 2, name: 'Sophia', col: 0, row: 0, wireY: 95, x: 42, y: 85, w: 187, h: 205 },
            { id: 3, name: 'Saki',   col: 1, row: 0, wireY: 95, x: 268, y: 85, w: 187, h: 205 },
            { id: 0, name: 'Kosong', col: 0, row: 1, wireY: 360, x: 155, y: 350, w: 187, h: 205 }
        ];
    };

    Scene_StatusJournal.prototype.drawTextWrapped = function(ctx, text, x, y, maxW, lineH, maxLines) {
        var words = text.split(' ');
        var line = '';
        var lineCount = 0;
        for (var i = 0; i < words.length; i++) {
            var testLine = line ? (line + ' ' + words[i]) : words[i];
            if (ctx.measureText(testLine).width > maxW && line) {
                ctx.fillText(line, x, y + lineCount * lineH);
                line = words[i];
                lineCount++;
                if (lineCount >= maxLines) break;
            } else {
                line = testLine;
            }
        }
        if (line && lineCount < maxLines) {
            ctx.fillText(line, x, y + lineCount * lineH);
        }
    };

    Scene_StatusJournal.prototype.drawPartyLeftPage = function() {
        if (this._drawingPartyLeft) return;
        this._drawingPartyLeft = true;
        try {
            if (!this._partySlotsSprite) return;
            var bmp = this._partySlotsSprite.bitmap;
            bmp.clear();
            var ctx = bmp._context;

            var polBmp = ImageManager.loadJournalParty('Polaroid sd');
            var blankBmp = ImageManager.loadJournalParty('blank');
            if (!polBmp || !polBmp.isReady() || !blankBmp || !blankBmp.isReady()) {
                this.attachSafeLoadListener(polBmp, 'partyLeft_pol', this.drawPartyLeftPage);
                this.attachSafeLoadListener(blankBmp, 'partyLeft_blank', this.drawPartyLeftPage);
                return;
            }

            var curParty = $gameParty.members();
            var rowYs = [12, 230, 448];
            var polW = 185;
            var polH = 203;
            var polX = 14;
            var noteX = 208;
            var noteW = 286;
            var noteH = 204;

            for (var r = 0; r < 3; r++) {
                var ry = rowYs[r];
                var actor = curParty[r];

                // A. SISI KIRI: POLAROID KARAKTER
                ctx.drawImage(polBmp._canvas || polBmp._image, 0, 0, polBmp.width, polBmp.height, polX, ry + 2, polW, polH);

                if (actor) {
                    var aId = (typeof actor.actorId === 'function') ? actor.actorId() : (actor._actorId || (r + 1));
                    var charDef = this.getCharacterDef(actor) || {
                        name: actor.name(),
                        icon: null,
                        nameBadge: null,
                        color: '#1f2937'
                    };

                    if (charDef.icon) {
                        var iconBmp = ImageManager.loadJournalParty(charDef.icon);
                        if (iconBmp && iconBmp.isReady()) {
                            ctx.drawImage(iconBmp._canvas || iconBmp._image, 0, 0, iconBmp.width, iconBmp.height, polX, ry + 2, polW, polH);
                        } else if (iconBmp && !iconBmp.isReady() && !iconBmp.isError()) {
                            this.attachSafeLoadListener(iconBmp, 'partyLeft_icon_' + aId, this.drawPartyLeftPage);
                        }
                    }

                    if (charDef.nameBadge) {
                        var nameBmp = ImageManager.loadJournalParty(charDef.nameBadge);
                        if (nameBmp && nameBmp.isReady()) {
                            var bbox = charDef.nameBBox || { sx: 0, sy: 0, sw: nameBmp.width, sh: nameBmp.height };
                            var scale = 0.88;
                            var bw = Math.round(bbox.sw * scale);
                            var bh = Math.round(bbox.sh * scale);
                            var bx = Math.round(polX + (polW - bw) / 2);
                            var by = Math.round(ry + 2 + 158 + (42 - bh) / 2);
                            ctx.drawImage(nameBmp._canvas || nameBmp._image, bbox.sx, bbox.sy, bbox.sw, bbox.sh, bx, by, bw, bh);
                        } else if (nameBmp && !nameBmp.isReady() && !nameBmp.isError()) {
                            this.attachSafeLoadListener(nameBmp, 'partyLeft_name_' + aId, this.drawPartyLeftPage);
                        }
                    }

                    if (actor.isDead()) {
                        ctx.save();
                        ctx.fillStyle = 'rgba(2, 132, 199, 0.75)';
                        ctx.beginPath();
                        ctx.roundRect(polX + 6, ry + 8, polW - 12, 22, 3);
                        ctx.fill();
                        ctx.font = 'bold 10px GameFont, sans-serif';
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.fillText('🔥 JIWA GUGUR', polX + polW / 2, ry + 23);
                        ctx.restore();
                    } else {
                        var isTrauma = (
                            (typeof actor.sanity === 'function' ? actor.sanity() : actor._customSanity) <= 0 ||
                            (typeof actor.isTraumaManifested === 'function' && actor.isTraumaManifested())
                        );
                        if (isTrauma) {
                            ctx.save();
                            ctx.fillStyle = 'rgba(126, 34, 206, 0.85)';
                            ctx.beginPath();
                            ctx.roundRect(polX + 6, ry + 8, polW - 12, 22, 3);
                            ctx.fill();
                            ctx.strokeStyle = '#e9d5ff';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                            ctx.font = 'bold 10px GameFont, sans-serif';
                            ctx.fillStyle = '#ffffff';
                            ctx.textAlign = 'center';
                            ctx.fillText('⚡ TRAUMA MANIFEST', polX + polW / 2, ry + 23);
                            ctx.restore();
                        }
                    }
                } else {
                    ctx.save();
                    ctx.font = 'bold 11px GameFont, monospace';
                    ctx.fillStyle = '#6b7280';
                    ctx.textAlign = 'center';
                    ctx.fillText('— KOSONG —', polX + polW / 2, ry + 2 + polH - 14);
                    ctx.restore();
                }

                // B. SISI KANAN: KERTAS CATATAN BLANK (BLANK.PNG)
                ctx.save();
                if (this._partyNoteMode === 'profile') {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    ctx.fillRect(noteX + 4, ry + 6, noteW, noteH);
                    ctx.drawImage(blankBmp._canvas || blankBmp._image, 0, 0, blankBmp.width, blankBmp.height, noteX - 2, ry, noteW, noteH);
                }
                ctx.drawImage(blankBmp._canvas || blankBmp._image, 0, 0, blankBmp.width, blankBmp.height, noteX, ry + 2, noteW, noteH);
                ctx.restore();

                if (actor && actor.isDead()) {
                    // MODE ANGGOTA GUGUR (JIWA API BIRU)
                    ctx.save();
                    ctx.font = 'bold 13px GameFont, sans-serif';
                    ctx.fillStyle = '#0284c7';
                    ctx.textAlign = 'left';
                    ctx.fillText('🔥 ' + actor.name().toUpperCase() + ' (JIWA API BIRU)', noteX + 16, ry + 26);

                    ctx.strokeStyle = 'rgba(2, 132, 199, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(noteX + 14, ry + 36);
                    ctx.lineTo(noteX + noteW - 14, ry + 36);
                    ctx.stroke();

                    ctx.font = '11px GameFont, sans-serif';
                    ctx.fillStyle = '#475569';
                    ctx.fillText('Karakter ini telah gugur dalam petualangan.', noteX + 16, ry + 60);
                    ctx.fillText('Ruhnya kini berupa api biru yang melayang', noteX + 16, ry + 82);
                    ctx.fillText('mengikuti rombongan party dari belakang.', noteX + 16, ry + 104);

                    ctx.font = 'bold 11px GameFont, sans-serif';
                    ctx.fillStyle = '#d97706';
                    ctx.fillText('➜ Bawa ke Batu Nisan atau Mbah Karso', noteX + 16, ry + 140);
                    ctx.fillText('   untuk membangkitkannya kembali!', noteX + 16, ry + 160);
                    ctx.restore();
                } else if (actor) {
                    var charDef = this.getCharacterDef(actor) || {
                        name: actor.name(),
                        icon: null,
                        nameBadge: null,
                        color: '#1f2937'
                    };

                    if (this._partyNoteMode === 'stats') {
                        // MODE STATISTIK
                        ctx.save();
                        ctx.font = 'bold 14px GameFont, sans-serif';
                        ctx.fillStyle = charDef.color || '#1f2937';
                        ctx.textAlign = 'left';
                        ctx.fillText(actor.name().toUpperCase(), noteX + 16, ry + 26);

                        ctx.font = 'bold 10px GameFont, sans-serif';
                        ctx.fillStyle = '#475569';
                        var classText = (actor.currentClass ? actor.currentClass().name : 'Petualang') + ' | Lv ' + actor.level;
                        ctx.fillText(classText, noteX + 16, ry + 42);

                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(noteX + 14, ry + 48);
                        ctx.lineTo(noteX + noteW - 14, ry + 48);
                        ctx.stroke();

                        ctx.font = '10px GameFont, sans-serif';
                        ctx.fillStyle = '#334155';
                        var params = [
                            { name: 'HP', val: actor.hp + ' / ' + actor.mhp },
                            { name: 'MP', val: actor.mp + ' / ' + actor.mmp },
                            { name: 'RAGE', val: (actor.tp !== undefined ? actor.tp : 0) + ' / ' + (actor.maxTp ? actor.maxTp() : 100) },
                            { name: 'ATK', val: actor.atk },
                            { name: 'DEF', val: actor.def },
                            { name: 'MAT', val: actor.mat },
                            { name: 'MDF', val: actor.mdf },
                            { name: 'AGI', val: actor.agi },
                            { name: 'LUK', val: actor.luk }
                        ];

                        for (var pi = 0; pi < params.length; pi++) {
                            var col = pi % 2;
                            var row = Math.floor(pi / 2);
                            var px = noteX + 16 + col * 132;
                            var py = ry + 64 + row * 19;
                            ctx.fillStyle = '#64748b';
                            ctx.fillText(params[pi].name, px, py);
                            ctx.fillStyle = '#0f172a';
                            ctx.fillText(String(params[pi].val), px + 55, py);
                        }

                        ctx.font = 'italic 10px GameFont, sans-serif';
                        ctx.fillStyle = 'rgba(55, 65, 81, 0.7)';
                        ctx.textAlign = 'center';
                        ctx.fillText('✎ Tekan [SHIFT] untuk Beralih ke Profil Karakter ➜', noteX + noteW / 2, ry + 185);
                        ctx.restore();
                    } else {
                        // MODE PROFIL
                        ctx.save();
                        ctx.font = 'bold 13px GameFont, sans-serif';
                        ctx.fillStyle = charDef.color || '#1f2937';
                        ctx.textAlign = 'left';
                        ctx.fillText('PROFIL & CATATAN: ' + actor.name().toUpperCase(), noteX + 16, ry + 26);

                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(noteX + 14, ry + 36);
                        ctx.lineTo(noteX + noteW - 14, ry + 36);
                        ctx.stroke();

                        var lore = this.getActorDescNote(actor) ||
                                   (charDef && charDef.profile) ||
                                   actor.profile() || 'Rekan petualang setia.';
                        ctx.font = '11px GameFont, sans-serif';
                        ctx.fillStyle = '#334155';
                        ctx.textAlign = 'left';
                        this.drawTextWrapped(ctx, lore, noteX + 16, ry + 60, noteW - 32, 22, 5);

                        ctx.font = 'italic 10px GameFont, sans-serif';
                        ctx.fillStyle = 'rgba(55, 65, 81, 0.7)';
                        ctx.textAlign = 'center';
                        ctx.fillText('✎ Tekan [SHIFT] untuk Kembali ke Status Karakter ➜', noteX + noteW / 2, ry + 185);
                        ctx.restore();
                    }
                } else {
                    ctx.save();
                    ctx.font = 'bold 13px GameFont, sans-serif';
                    ctx.fillStyle = '#64748b';
                    ctx.textAlign = 'left';
                    ctx.fillText('SLOT REKAN ' + (r === 1 ? 'I' : 'II') + ' (KOSONG)', noteX + 16, ry + 30);

                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(noteX + 14, ry + 38);
                    ctx.lineTo(noteX + noteW - 14, ry + 38);
                    ctx.stroke();

                    ctx.font = '11px GameFont, sans-serif';
                    ctx.fillStyle = '#475569';
                    ctx.fillText('Tidak ada rekan pada slot ini.', noteX + 16, ry + 68);
                    ctx.fillText('Tekan [ENTER] untuk memilih rekan', noteX + 16, ry + 94);
                    ctx.fillText('dari jemuran foto di halaman kanan.', noteX + 16, ry + 118);

                    ctx.font = 'bold 11px GameFont, sans-serif';
                    ctx.fillStyle = '#0284c7';
                    ctx.fillText('➜ [ENTER] Pasang Rekan', noteX + 16, ry + 160);
                    ctx.restore();
                }
            }

            bmp._setDirty();
            this.drawPartyTraumaGlow();
        } finally {
            this._drawingPartyLeft = false;
        }
    };

    Scene_StatusJournal.prototype.drawClothespin = function(ctx, cx, cy, isSelected) {
        ctx.save();
        ctx.fillStyle = isSelected ? '#f59e0b' : '#b45309';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(cx - 7, cy - 18, 6, 26, 2);
        ctx.roundRect(cx + 1, cy - 18, 6, 26, 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 5, cy - 8, 10, 4);

        ctx.restore();
    };

    Scene_StatusJournal.prototype.drawDarkroomPanel = function(ctx, cands, targetSlot) {
        ctx.save();
        var boxX = 20;
        var boxY = 575;
        var boxW = 468;
        var boxH = 82;

        ctx.fillStyle = 'rgba(254, 243, 199, 0.9)';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        var cand = cands[this._partyPickerIndex];
        ctx.font = 'bold 12px GameFont, sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.textAlign = 'left';
        ctx.fillText('🧺 KAMAR CUCI FOTO: PENGATURAN REKAN PARTY', boxX + 14, boxY + 22);

        ctx.font = '11px GameFont, sans-serif';
        ctx.fillStyle = '#1e293b';

        var curSlotName = (targetSlot === 1) ? 'Slot 2 (Rekan I)' : 'Slot 3 (Rekan II)';
        if (this._partySubMode === 'picker' && cand) {
            if (cand.id > 0) {
                ctx.fillText('➜ Tekan [ENTER] untuk menugaskan ' + cand.name + ' ke ' + curSlotName + '.', boxX + 14, boxY + 44);
                ctx.font = 'italic 10px GameFont, sans-serif';
                ctx.fillStyle = '#64748b';
                ctx.fillText('(Jika sudah ada di slot lain, posisi rekan akan otomatis saling bertukar).', boxX + 14, boxY + 64);
            } else {
                ctx.fillText('➜ Tekan [ENTER] untuk mengosongkan ' + curSlotName + '.', boxX + 14, boxY + 44);
                ctx.font = 'italic 10px GameFont, sans-serif';
                ctx.fillStyle = '#64748b';
                ctx.fillText('(Nia akan bertualang tanpa rekan pada slot ini, follower peta ikut dilepas).', boxX + 14, boxY + 64);
            }
        } else {
            ctx.fillText('Pilih Slot 2 atau Slot 3 di halaman kiri, lalu tekan [ENTER]', boxX + 14, boxY + 44);
            ctx.fillText('untuk memilih rekan dari jemuran foto atau mengosongkan slot.', boxX + 14, boxY + 64);
        }

        ctx.restore();
    };

    Scene_StatusJournal.prototype.drawPartyRightPage = function() {
        if (this._drawingPartyRight) return;
        this._drawingPartyRight = true;
        try {
            if (!this._partyPickerSprite) return;
            var bmp = this._partyPickerSprite.bitmap;
            bmp.clear();
            var ctx = bmp._context;
            ctx.save();

            // 1. Tali Jemuran Ruang Gelap
            ctx.strokeStyle = '#3b2514';
            ctx.lineWidth = 3;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 4;

            ctx.beginPath();
            ctx.moveTo(15, 95);
            ctx.quadraticCurveTo(254, 106, 493, 95);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(15, 360);
            ctx.quadraticCurveTo(254, 370, 493, 360);
            ctx.stroke();

            ctx.restore();

            // 2. Kandidat Foto Polaroid yang Menggantung
            var cands = this.getPartyCandidates();
            var polBmp = ImageManager.loadJournalParty('Polaroid sd');
            if (!polBmp || !polBmp.isReady()) {
                this.attachSafeLoadListener(polBmp, 'partyRight_pol', this.drawPartyRightPage);
                return;
            }

            var curParty = $gameParty.members();
            var targetSlot = this._selectedPartyRow;

            for (var i = 0; i < cands.length; i++) {
                var cand = cands[i];
                var isSelected = (this._partySubMode === 'picker' && this._partyPickerIndex === i);

                ctx.save();
                if (isSelected) {
                    ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
                    ctx.shadowBlur = 12;
                }
                ctx.drawImage(polBmp._canvas || polBmp._image, 0, 0, polBmp.width, polBmp.height, cand.x, cand.y, cand.w, cand.h);
                ctx.restore();

                if (cand.id > 0) {
                    var charDef = PARTY_CHARACTERS[cand.id];
                    if (charDef) {
                        if (charDef.icon) {
                            var iconBmp = ImageManager.loadJournalParty(charDef.icon);
                            if (iconBmp && iconBmp.isReady()) {
                                ctx.drawImage(iconBmp._canvas || iconBmp._image, 0, 0, iconBmp.width, iconBmp.height, cand.x, cand.y, cand.w, cand.h);
                            } else if (iconBmp && !iconBmp.isReady() && !iconBmp.isError()) {
                                this.attachSafeLoadListener(iconBmp, 'partyRight_icon_' + cand.id, this.drawPartyRightPage);
                            }
                        }

                        if (charDef.nameBadge) {
                            var nameBmp = ImageManager.loadJournalParty(charDef.nameBadge);
                            if (nameBmp && nameBmp.isReady()) {
                                var bbox = charDef.nameBBox || { sx: 0, sy: 0, sw: nameBmp.width, sh: nameBmp.height };
                                var scale = 0.88;
                                var bw = Math.round(bbox.sw * scale);
                                var bh = Math.round(bbox.sh * scale);
                                var bx = Math.round(cand.x + (cand.w - bw) / 2);
                                var by = Math.round(cand.y + 158 + (42 - bh) / 2);
                                ctx.drawImage(nameBmp._canvas || nameBmp._image, bbox.sx, bbox.sy, bbox.sw, bbox.sh, bx, by, bw, bh);
                            } else if (nameBmp && !nameBmp.isReady() && !nameBmp.isError()) {
                                this.attachSafeLoadListener(nameBmp, 'partyRight_name_' + cand.id, this.drawPartyRightPage);
                            }
                        }

                        var partyIdx = -1;
                        for (var p = 0; p < curParty.length; p++) {
                            var pId = (typeof curParty[p].actorId === 'function') ? curParty[p].actorId() : (curParty[p]._actorId || 0);
                            if (pId === cand.id) {
                                partyIdx = p;
                                break;
                            }
                        }

                        if (partyIdx >= 0) {
                            ctx.save();
                            var tagColor = (partyIdx === targetSlot) ? '#16a34a' : '#0284c7';
                            ctx.fillStyle = tagColor;
                            ctx.beginPath();
                            ctx.roundRect(cand.x + 8, cand.y + 12, cand.w - 16, 20, 3);
                            ctx.fill();
                            ctx.fillStyle = '#ffffff';
                            ctx.font = 'bold 10px GameFont, sans-serif';
                            ctx.textAlign = 'center';
                            var slotText = (partyIdx === 1) ? 'SLOT 2 (REKAN I)' : 'SLOT 3 (REKAN II)';
                            ctx.fillText('✓ AKTIF DI ' + slotText, cand.x + cand.w / 2, cand.y + 26);
                            ctx.restore();
                        }
                    }
                } else {
                    ctx.save();
                    ctx.font = 'bold 12px GameFont, sans-serif';
                    ctx.fillStyle = '#9ca3af';
                    ctx.textAlign = 'center';
                    ctx.fillText('— KOSONGKAN SLOT —', cand.x + cand.w / 2, cand.y + cand.h * 0.88);
                    ctx.restore();

                    if (!curParty[targetSlot]) {
                        ctx.save();
                        ctx.fillStyle = 'rgba(75, 85, 99, 0.85)';
                        ctx.beginPath();
                        ctx.roundRect(cand.x + 8, cand.y + 12, cand.w - 16, 20, 3);
                        ctx.fill();
                        ctx.fillStyle = '#e5e7eb';
                        ctx.font = 'bold 10px GameFont, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('SUDAH KOSONG', cand.x + cand.w / 2, cand.y + 26);
                        ctx.restore();
                    }
                }

                this.drawClothespin(ctx, cand.x + cand.w / 2, cand.y + 5, isSelected);
            }

            this.drawDarkroomPanel(ctx, cands, targetSlot);
            bmp._setDirty();
            this.drawPartyRightTraumaGlow();
        } finally {
            this._drawingPartyRight = false;
        }
    };

    Scene_StatusJournal.prototype.updatePartyReticlePosition = function() {
        if (!this._partyReticleSprite || !this._partyPickerReticleSprite) return;

        var rowYs = [12, 230, 448];
        if (this._partySubMode === 'slots') {
            this._partyReticleSprite.visible = (this._focusMode === 'slots' && this._activeJournalTab === 2);
            this._partyReticleSprite.x = 8;
            this._partyReticleSprite.y = rowYs[this._selectedPartyRow] || 12;
            this._partyPickerReticleSprite.visible = false;
        } else if (this._partySubMode === 'picker') {
            this._partyReticleSprite.visible = true;
            this._partyReticleSprite.x = 8;
            this._partyReticleSprite.y = rowYs[this._selectedPartyRow] || 12;

            var cands = this.getPartyCandidates();
            var curCand = cands[this._partyPickerIndex] || cands[0];
            if (curCand) {
                this._partyPickerReticleSprite.visible = true;
                this._partyPickerReticleSprite.x = curCand.x + Math.round(curCand.w / 2);
                this._partyPickerReticleSprite.y = curCand.y + Math.round(curCand.h / 2);
            }
        }
    };

    Scene_StatusJournal.prototype.handlePartyInput = function() {
        if (this._partySubMode === 'slots') {
            if (Input.isRepeated('down')) {
                SoundManager.playCursor();
                this._selectedPartyRow = (this._selectedPartyRow + 1) % 3;
                this.updatePartyReticlePosition();
                this.drawFooterGuide();
            } else if (Input.isRepeated('up')) {
                SoundManager.playCursor();
                this._selectedPartyRow = (this._selectedPartyRow + 2) % 3;
                this.updatePartyReticlePosition();
                this.drawFooterGuide();
            } else if (Input.isRepeated('left')) {
                this.focusRibbons();
                return;
            } else if (Input.isTriggered('shift')) {
                SoundManager.playCursor();
                this._partyNoteMode = (this._partyNoteMode === 'stats' ? 'profile' : 'stats');
                this.drawPartyLeftPage();
            } else if (Input.isTriggered('ok')) {
                if (this._selectedPartyRow === 0) {
                    SoundManager.playBuzzer();
                    this._toastMessage = '🔒 Nia adalah ketua party tetap dan tidak dapat diganti.';
                    this._toastTimer = 90;
                } else {
                    SoundManager.playOk();
                    this._partySubMode = 'picker';
                    this._partyPickerIndex = 0;
                    this.updatePartyReticlePosition();
                    this.drawPartyRightPage();
                    this.drawFooterGuide();
                }
            }
        } else if (this._partySubMode === 'picker') {
            var cands = this.getPartyCandidates();
            if (Input.isRepeated('right')) {
                SoundManager.playCursor();
                this._partyPickerIndex = (this._partyPickerIndex + 1) % cands.length;
                this.updatePartyReticlePosition();
                this.drawPartyRightPage();
            } else if (Input.isRepeated('left')) {
                SoundManager.playCursor();
                this._partyPickerIndex = (this._partyPickerIndex + cands.length - 1) % cands.length;
                this.updatePartyReticlePosition();
                this.drawPartyRightPage();
            } else if (Input.isRepeated('down')) {
                SoundManager.playCursor();
                if (this._partyPickerIndex < 2) {
                    this._partyPickerIndex = 2;
                } else {
                    this._partyPickerIndex = 0;
                }
                this.updatePartyReticlePosition();
                this.drawPartyRightPage();
            } else if (Input.isRepeated('up')) {
                SoundManager.playCursor();
                if (this._partyPickerIndex === 2) {
                    this._partyPickerIndex = 0;
                } else {
                    this._partyPickerIndex = 2;
                }
                this.updatePartyReticlePosition();
                this.drawPartyRightPage();
            } else if (Input.isTriggered('cancel')) {
                SoundManager.playCancel();
                this._partySubMode = 'slots';
                this.updatePartyReticlePosition();
                this.drawPartyRightPage();
                this.drawFooterGuide();
            } else if (Input.isTriggered('ok')) {
                this.applyPartySelection();
            }
        }
    };

    Scene_StatusJournal.prototype.applyPartySelection = function() {
        var cands = this.getPartyCandidates();
        var cand = cands[this._partyPickerIndex];
        if (!cand) return;

        var targetSlot = this._selectedPartyRow;
        var curMembers = $gameParty.members();
        var curActorInSlot = curMembers[targetSlot] || null;

        // Guard: targetSlot harus dalam batas array _actors
        if (targetSlot < 0) return;

        if (cand.id === 0) {
            // Mode Keluarkan Anggota
            if (!curActorInSlot) {
                SoundManager.playBuzzer();
                return;
            }
            var curId = (typeof curActorInSlot.actorId === 'function') ? curActorInSlot.actorId() : (curActorInSlot._actorId || 0);
            if (!curId) { SoundManager.playBuzzer(); return; }
            $gameParty.removeActor(curId);
            if (typeof $gamePlayer !== 'undefined' && $gamePlayer.refresh) $gamePlayer.refresh();
            if (typeof $gameMap !== 'undefined' && $gameMap.requestRefresh) $gameMap.requestRefresh();
            SoundManager.playEquip();
        } else {
            var curId = curActorInSlot ? ((typeof curActorInSlot.actorId === 'function') ? curActorInSlot.actorId() : (curActorInSlot._actorId || 0)) : 0;
            if (curId === cand.id) {
                SoundManager.playBuzzer();
                return;
            }

            // Cari apakah cand sudah ada di dalam party
            var existingIdx = -1;
            for (var i = 0; i < curMembers.length; i++) {
                if (!curMembers[i]) continue;
                var mId = (typeof curMembers[i].actorId === 'function') ? curMembers[i].actorId() : (curMembers[i]._actorId || 0);
                if (mId === cand.id) {
                    existingIdx = i;
                    break;
                }
            }

            if (existingIdx >= 0) {
                // Swap: validasi kedua index dalam batas _actors
                var actorsLen = $gameParty._actors.length;
                if (targetSlot < actorsLen && existingIdx < actorsLen) {
                    $gameParty.swapOrder(targetSlot, existingIdx);
                } else {
                    SoundManager.playBuzzer();
                    return;
                }
            } else {
                if (curActorInSlot && targetSlot < $gameParty._actors.length) {
                    // Ganti actor di slot yang ada
                    var actors = $gameParty._actors.slice();
                    actors[targetSlot] = cand.id;
                    // Bersihkan: hapus null/undefined/0, pastikan tidak duplikat
                    $gameParty._actors = actors.filter(function(id) { return id && typeof id === 'number'; });
                } else {
                    // Tambah actor baru ke party
                    $gameParty.addActor(cand.id);
                }
            }
            if (typeof $gamePlayer !== 'undefined' && $gamePlayer.refresh) $gamePlayer.refresh();
            if (typeof $gameMap !== 'undefined' && $gameMap.requestRefresh) $gameMap.requestRefresh();
            SoundManager.playEquip();
        }

        this._partySubMode = 'slots';
        this.refreshPartyPage();
        this.updatePartyReticlePosition();
        this.drawFooterGuide();
    };

    // ========================================================================
    // LOGIKA PENDARAN UNGU TRAUMA PADA STATUS & PARTY MENU (SANITY 0)
    // ========================================================================
    Scene_StatusJournal.prototype.initPolaroidTraumaGlowGraphic = function() {
        if (!this._polaroidTraumaGlowSprite || !this._polaroidTraumaGlowSprite.bitmap) return;
        var bmp = this._polaroidTraumaGlowSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = 208, h = 194;

        ctx.save();
        // 1. Radial violet/purple vignette
        var grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 110);
        grad.addColorStop(0, 'rgba(216, 180, 254, 0.15)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.45)');
        grad.addColorStop(1, 'rgba(88, 28, 135, 0.80)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. Glowing purple border
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(192, 132, 252, 0.9)';
        ctx.shadowBlur = 10;
        ctx.strokeRect(2, 2, w - 4, h - 4);

        // 3. Trauma warning badge
        ctx.fillStyle = 'rgba(88, 28, 135, 0.88)';
        ctx.beginPath();
        ctx.roundRect(14, h - 28, w - 28, 22, 4);
        ctx.fill();
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = 'bold 11px GameFont, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText('⚡ TRAUMA MANIFEST ⚡', w / 2, h - 13);
        ctx.restore();

        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawPartyTraumaGlow = function() {
        if (!this._partyTraumaGlowSprite || !this._partyTraumaGlowSprite.bitmap) return;
        var bmp = this._partyTraumaGlowSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var curParty = $gameParty.members();
        var rowYs = [12, 230, 448];
        var polW = 185;
        var polH = 203;
        var polX = 14;

        this._partyHasTraumaMember = false;

        for (var r = 0; r < Math.min(3, curParty.length); r++) {
            var actor = curParty[r];
            if (!actor || actor.isDead()) continue;
            var isTrauma = (
                (typeof actor.sanity === 'function' ? actor.sanity() : actor._customSanity) <= 0 ||
                (typeof actor.isTraumaManifested === 'function' && actor.isTraumaManifested())
            );
            if (!isTrauma) continue;

            this._partyHasTraumaMember = true;
            var ry = rowYs[r];

            ctx.save();
            var cx = polX + polW / 2;
            var cy = ry + 2 + (polH - 42) / 2;
            var grad = ctx.createRadialGradient(cx, cy, 15, cx, cy, 95);
            grad.addColorStop(0, 'rgba(216, 180, 254, 0.15)');
            grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.45)');
            grad.addColorStop(1, 'rgba(88, 28, 135, 0.80)');
            ctx.fillStyle = grad;
            ctx.fillRect(polX + 4, ry + 6, polW - 8, polH - 46);

            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 3;
            ctx.shadowColor = 'rgba(168, 85, 247, 0.9)';
            ctx.shadowBlur = 10;
            ctx.strokeRect(polX + 2, ry + 4, polW - 4, polH - 4);
            ctx.restore();
        }
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawPartyRightTraumaGlow = function() {
        if (!this._partyRightTraumaGlowSprite || !this._partyRightTraumaGlowSprite.bitmap) return;
        var bmp = this._partyRightTraumaGlowSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var cands = this.getPartyCandidates();

        this._partyRightHasTraumaMember = false;

        for (var i = 0; i < cands.length; i++) {
            var cand = cands[i];
            if (!cand || cand.id <= 0) continue;
            var actor = $gameActors.actor(cand.id);
            if (!actor || actor.isDead()) continue;
            var isTrauma = (
                (typeof actor.sanity === 'function' ? actor.sanity() : actor._customSanity) <= 0 ||
                (typeof actor.isTraumaManifested === 'function' && actor.isTraumaManifested())
            );
            if (!isTrauma) continue;

            this._partyRightHasTraumaMember = true;

            ctx.save();
            var cx = cand.x + cand.w / 2;
            var cy = cand.y + (cand.h - 40) / 2;
            var grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 85);
            grad.addColorStop(0, 'rgba(216, 180, 254, 0.15)');
            grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.45)');
            grad.addColorStop(1, 'rgba(88, 28, 135, 0.80)');
            ctx.fillStyle = grad;
            ctx.fillRect(cand.x + 4, cand.y + 6, cand.w - 8, cand.h - 44);

            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 3;
            ctx.shadowColor = 'rgba(168, 85, 247, 0.9)';
            ctx.shadowBlur = 10;
            ctx.strokeRect(cand.x + 2, cand.y + 2, cand.w - 4, cand.h - 4);
            ctx.restore();
        }
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.updateTraumaGlowAnimations = function() {
        var pulse = Math.floor(165 + 75 * Math.sin(Date.now() * 0.0055));
        var traumaAlpha = Math.max(0, Math.min(255, pulse));

        // 1. Polaroid Foto di Tab Status
        if (this._polaroidTraumaGlowSprite) {
            var actor = this._actor || $gameParty.menuActor();
            var isTrauma = actor && !actor.isDead() && (
                (typeof actor.sanity === 'function' ? actor.sanity() : actor._customSanity) <= 0 ||
                (typeof actor.isTraumaManifested === 'function' && actor.isTraumaManifested())
            );
            if (isTrauma && this._activeJournalTab === 0) {
                this._polaroidTraumaGlowSprite.visible = true;
                this._polaroidTraumaGlowSprite.opacity = traumaAlpha;
            } else {
                this._polaroidTraumaGlowSprite.visible = false;
            }
        }

        // 2. Party Member Polaroids di Tab Party (Left)
        if (this._partyTraumaGlowSprite) {
            if (this._activeJournalTab === 2 && this._partyHasTraumaMember) {
                this._partyTraumaGlowSprite.visible = true;
                this._partyTraumaGlowSprite.opacity = traumaAlpha;
            } else {
                this._partyTraumaGlowSprite.visible = false;
            }
        }

        // 3. Darkroom Candidate Polaroids di Tab Party (Right)
        if (this._partyRightTraumaGlowSprite) {
            if (this._activeJournalTab === 2 && this._partyRightHasTraumaMember) {
                this._partyRightTraumaGlowSprite.visible = true;
                this._partyRightTraumaGlowSprite.opacity = traumaAlpha;
            } else {
                this._partyRightTraumaGlowSprite.visible = false;
            }
        }
    };

    // ========================================================================
    // LOGIKA & METODE HALAMAN SKILL JOURNAL (v2.5)
    // ========================================================================
    Scene_StatusJournal.prototype.classifySkill = function(skill) {
        if (!skill) return null;
        var note = skill.note || '';

        // 0. Explicit developer tag overrides
        if (/<skill_type:\s*special>/i.test(note) || /<type:\s*special>/i.test(note)) return 'special';
        if (/<skill_type:\s*defend>/i.test(note) || /<type:\s*defend>/i.test(note) || /<skill_type:\s*defense>/i.test(note)) return 'defends';
        if (/<skill_type:\s*attack>/i.test(note) || /<type:\s*attack>/i.test(note)) return 'attack';

        // 1. Special check
        // Skill unik/khusus yang hanya dimiliki beberapa aktor atau ada syarat tertentu
        if (/<unique_skill>/i.test(note) || /<unique>/i.test(note) || /<special>/i.test(note) || skill.stypeId === 2) {
            return 'special';
        }

        // 2. Defends check
        // Bertahan (Guard #2, Escape), Heal/Recover, Buff, Cure/Remove State, atau target rekan
        var isRecovery = skill.damage && (skill.damage.type === 3 || skill.damage.type === 4);
        var targetsAlly = [7, 8, 9, 10, 11].indexOf(skill.scope) >= 0;
        var hasBuff = (skill.effects || []).some(function(e) {
            return e.code === 31 || (e.code === 11 && e.value1 > 0) || (e.code === 12 && e.value1 > 0);
        });
        var hasCure = (skill.effects || []).some(function(e) { return e.code === 22; });
        if (isRecovery || targetsAlly || hasBuff || hasCure || skill.id === 2) {
            return 'defends';
        }

        // 3. Attack check (default untuk skill serangan & debuff)
        return 'attack';
    };

    Scene_StatusJournal.prototype.getSkillList = function(ribbonIndex) {
        var actor = this._actor || $gameParty.menuActor();
        if (!actor) return [];
        var allSkills = actor.skills();
        var categories = ['attack', 'defends', 'special'];
        var targetCat = categories[ribbonIndex !== undefined ? ribbonIndex : this._skillRibbonIndex];

        var self = this;
        return allSkills.filter(function(skill) {
            return self.classifySkill(skill) === targetCat;
        });
    };

    Scene_StatusJournal.prototype.getCurrentSkill = function() {
        var list = this.getSkillList();
        return list[this._skillSlotIndex] || null;
    };

    Scene_StatusJournal.prototype.refreshSkillPage = function() {
        var cfg = STATUS_JOURNAL_CONFIG.skillJournal;
        if (this._skillPolaroidContainer) {
            this._skillPolaroidContainer.x = cfg.polaroid.x;
            this._skillPolaroidContainer.y = cfg.polaroid.y;
            this._skillPolaroidContainer.rotation = cfg.polaroid.rotation || -0.148;
        }
        if (this._skillTitleSprite) {
            this._skillTitleSprite.x = cfg.title.x;
        }
        if (this._skillDescPaperSprite) {
            this._skillDescPaperSprite.x = cfg.description.x;
            this._skillDescPaperSprite.y = cfg.description.y;
        }
        if (this._skillDescTextSprite) {
            this._skillDescTextSprite.x = cfg.description.x;
            this._skillDescTextSprite.y = cfg.description.y;
        }
        if (this._skillSingleRibbonSprite && cfg.ribbons) {
            this._skillSingleRibbonSprite.x = cfg.ribbons.x !== undefined ? cfg.ribbons.x : 268;
            this._skillSingleRibbonSprite.y = cfg.ribbons.y !== undefined ? cfg.ribbons.y : 12;
        }

        this.drawSkillGrid();
        this.drawSkillActorHeader();
        this.drawSkillPageNav();
        this.drawSkillDetails();
        this.updateSkillReticlePosition();
        this.updateSkillRibbonTargets();
    };

    Scene_StatusJournal.prototype.drawSkillGrid = function() {
        if (!this._skillSlotsSprite) return;
        var bmp = this._skillSlotsSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var cfg = STATUS_JOURNAL_CONFIG.skillJournal.grid;
        var colBmp = ImageManager.loadJournalSkill('Column_');
        var colImg = colBmp._canvas || colBmp._image;
        var iconSet = ImageManager.loadSystem('IconSet');
        var iconImg = iconSet ? (iconSet._canvas || iconSet._image) : null;

        var skills = this.getSkillList();

        for (var r = 0; r < cfg.rows; r++) {
            for (var c = 0; c < cfg.cols; c++) {
                var slotIdx = r * cfg.cols + c;
                var sk = skills[slotIdx] || null;
                var x = cfg.startX + c * cfg.spacingX;
                var y = cfg.startY + r * cfg.spacingY;

                // 1. Bingkai Slot Column_.png (90 x 86)
                if (colBmp && colBmp.isReady()) {
                    ctx.drawImage(colImg, x, y, cfg.slotW, cfg.slotH);
                } else if (colBmp && !colBmp.isReady()) {
                    this.attachSafeLoadListener(colBmp, 'skill_col', this.drawSkillGrid);
                }

                // 2. Ikon Skill (Custom Icon / Skills.png Sheet / IconSet) - Ikon Dapat Diatur Live
                if (sk) {
                    var iconSize = cfg.iconSize || 74;
                    var ix = Math.round(x + (cfg.slotW - iconSize) / 2);
                    var iy = Math.round(y + (cfg.slotH - iconSize) / 2);

                    ctx.save();
                    ctx.imageSmoothingEnabled = false;
                    ctx.shadowColor = 'rgba(0,0,0,0.45)';
                    ctx.shadowBlur = 6;

                    // Direct draw menggunakan getRawImage - aman dari bug _canvas 1x1
                    var drawn = false;

                    // 1. Basic.png
                    if (!drawn && (sk.customIcon === 'Basic' || sk.customIcon === 'basic' || (sk.id === 1 && sk.skillIconIndex === undefined))) {
                        var basicBmp = typeof ImageManager.loadBasicSkillIcon === 'function'
                            ? ImageManager.loadBasicSkillIcon()
                            : ImageManager.loadBitmap('img/pictures/Skills/', 'Basic', 0, true);
                        if (basicBmp && basicBmp.isReady()) {
                            var rawBasic = this.getRawImage(basicBmp);
                            if (rawBasic) {
                                try { ctx.drawImage(rawBasic, 0, 0, basicBmp._image ? basicBmp._image.width : (basicBmp.__canvas ? basicBmp.__canvas.width : 150), basicBmp._image ? basicBmp._image.height : (basicBmp.__canvas ? basicBmp.__canvas.height : 150), ix, iy, iconSize, iconSize); drawn = true; } catch(e) {}
                            }
                        } else if (basicBmp && !basicBmp.isReady() && !basicBmp.isError()) {
                            this.attachSafeLoadListener(basicBmp, 'skillGrid_basic', this.drawSkillGrid);
                        }
                    }

                    // 2. Item Sheet (karso.png 90x90 per cell, 10 cols)
                    if (!drawn && sk.itemIconIndex !== undefined && sk.itemIconIndex >= 0) {
                        var itemSheet = typeof ImageManager.loadItemSheet === 'function'
                            ? ImageManager.loadItemSheet()
                            : ImageManager.loadBitmap('img/pictures/items/', 'karso', 0, true);
                        if (itemSheet && itemSheet.isReady()) {
                            var rawItemSheet = this.getRawImage(itemSheet);
                            if (rawItemSheet) {
                                var kCol = sk.itemIconIndex % 10;
                                var kRow = Math.floor(sk.itemIconIndex / 10);
                                try { ctx.drawImage(rawItemSheet, kCol * 90, kRow * 90, 90, 90, ix, iy, iconSize, iconSize); drawn = true; } catch(e) {}
                            }
                        } else if (itemSheet && !itemSheet.isReady() && !itemSheet.isError()) {
                            this.attachSafeLoadListener(itemSheet, 'skillGrid_itemSheet', this.drawSkillGrid);
                        }
                    }

                    // 3. Skill Sheet (Skills.png 150x150 per cell, 10 cols)
                    if (!drawn && sk.skillIconIndex !== undefined && sk.skillIconIndex >= 0) {
                        var sheet = typeof ImageManager.loadSkillSheet === 'function'
                            ? ImageManager.loadSkillSheet()
                            : ImageManager.loadBitmap('img/pictures/Skills/', 'Skills', 0, true);
                        if (sheet && sheet.isReady()) {
                            var rawSheet = this.getRawImage(sheet);
                            if (rawSheet) {
                                var gCol = sk.skillIconIndex % 10;
                                var gRow = Math.floor(sk.skillIconIndex / 10);
                                try { ctx.drawImage(rawSheet, gCol * 150, gRow * 150, 150, 150, ix, iy, iconSize, iconSize); drawn = true; } catch(e) {}
                            }
                        } else if (sheet && !sheet.isReady() && !sheet.isError()) {
                            this.attachSafeLoadListener(sheet, 'skillGrid_sheet', this.drawSkillGrid);
                        }
                    }

                    // 4. Custom PNG
                    if (!drawn && sk.customIcon) {
                        var cBmp = ImageManager.loadBitmap('img/pictures/Skills/', sk.customIcon, 0, true);
                        if (!cBmp || !cBmp.isReady()) cBmp = ImageManager.loadBitmap('img/icons/', sk.customIcon, 0, true);
                        if (cBmp && cBmp.isReady()) {
                            var rawC = this.getRawImage(cBmp);
                            if (rawC) {
                                var cW = cBmp._image ? cBmp._image.width : (cBmp.__canvas ? cBmp.__canvas.width : 150);
                                var cH = cBmp._image ? cBmp._image.height : (cBmp.__canvas ? cBmp.__canvas.height : 150);
                                try { ctx.drawImage(rawC, 0, 0, cW, cH, ix, iy, iconSize, iconSize); drawn = true; } catch(e) {}
                            }
                        } else if (cBmp && !cBmp.isReady() && !cBmp.isError()) {
                            this.attachSafeLoadListener(cBmp, 'skillGrid_custom_' + sk.id, this.drawSkillGrid);
                        }
                    }

                    // 5. Standard IconSet fallback
                    if (!drawn && sk.iconIndex > 0) {
                        if (iconImg && iconSet && iconSet.isReady()) {
                            var isx = (sk.iconIndex % 16) * 32;
                            var isy = Math.floor(sk.iconIndex / 16) * 32;
                            try { ctx.drawImage(iconImg, isx, isy, 32, 32, ix, iy, iconSize, iconSize); drawn = true; } catch(e) {}
                        } else if (iconSet && !iconSet.isReady() && !iconSet.isError()) {
                            this.attachSafeLoadListener(iconSet, 'skillGrid_iconSet', this.drawSkillGrid);
                        }
                    }
                    ctx.restore();

                    // 3. Label Biaya MP / TP di Pojok Kanan Bawah
                    if (sk.mpCost > 0 || sk.tpCost > 0) {
                        ctx.save();
                        ctx.font = 'bold 12px GameFont, sans-serif';
                        ctx.textAlign = 'right';
                        ctx.shadowColor = 'rgba(0,0,0,0.85)';
                        ctx.shadowBlur = 4;
                        if (sk.mpCost > 0) {
                            ctx.fillStyle = '#60a5fa'; // Blue MP
                            ctx.fillText(sk.mpCost + 'm', x + cfg.slotW - 6, y + cfg.slotH - 6);
                        } else if (sk.tpCost > 0) {
                            ctx.fillStyle = '#fbbf24'; // Yellow TP
                            ctx.fillText(sk.tpCost + 't', x + cfg.slotW - 6, y + cfg.slotH - 6);
                        }
                        ctx.restore();
                    }

                    // 4. Badge Penanda Slot Battle (SLOT 1 - 5)
                    var actor = this._actor || $gameParty.menuActor();
                    if (actor && actor.pethogsEquippedSkills) {
                        var eqIndex = actor.pethogsEquippedSkills().indexOf(sk.id);
                        if (eqIndex >= 0) {
                            ctx.save();
                            ctx.fillStyle = '#0284c7';
                            ctx.beginPath();
                            ctx.roundRect(x + 4, y + 4, 46, 17, 3);
                            ctx.fill();
                            ctx.strokeStyle = '#38bdf8';
                            ctx.lineWidth = 1;
                            ctx.stroke();

                            ctx.font = 'bold 10px GameFont, sans-serif';
                            ctx.textAlign = 'center';
                            ctx.fillStyle = '#ffffff';
                            ctx.fillText('SLOT ' + (eqIndex + 1), x + 27, y + 16);
                            ctx.restore();
                        }
                    }
                }
            }
        }
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawSkillActorHeader = function() {
        if (!this._skillActorHeaderSprite) return;
        var aBmp = this._skillActorHeaderSprite.bitmap;
        aBmp.clear();
        var aCtx = aBmp._context;
        var actor = this._actor || $gameParty.menuActor();
        if (!actor) return;

        aCtx.save();
        aCtx.font = 'bold 16px GameFont, sans-serif';
        aCtx.textAlign = 'center';
        aCtx.fillStyle = '#4a2c1d';
        aCtx.shadowColor = 'rgba(255,255,255,0.7)';
        aCtx.shadowBlur = 3;
        aCtx.fillText('◄  [ ' + actor.name() + ' ]  ►  (Tekan Shift / Klik untuk ganti)', 254, 20);
        aCtx.restore();
        aBmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawSkillPageNav = function() {
        if (!this._skillPageNavSprite) return;
        var pBmp = this._skillPageNavSprite.bitmap;
        pBmp.clear();
        var pCtx = pBmp._context;
        pCtx.save();
        pCtx.font = '18px GameFont, sans-serif';
        pCtx.textAlign = 'center';
        pCtx.fillStyle = '#2c1810';
        pCtx.shadowColor = 'rgba(255,255,255,0.7)';
        pCtx.shadowBlur = 3;

        var catNames = ['Attack', 'Defends', 'Special'];
        var curName = catNames[this._skillRibbonIndex] || 'Attack';
        pCtx.fillText('◄ Q   ' + curName + '   W ▶', 254, 20);
        pCtx.restore();
        pBmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawSkillReticleGraphic = function() {
        if (!this._skillReticleSprite || !this._skillReticleSprite.bitmap) return;
        var bmp = this._skillReticleSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = bmp.width;
        var h = bmp.height;
        var arm = 14;
        var lw = 3;

        ctx.save();
        ctx.strokeStyle = '#d946ef'; // Magenta terang
        ctx.lineWidth = lw;
        ctx.lineCap = 'square';
        ctx.shadowColor = '#f0abfc';
        ctx.shadowBlur = 6;

        // Pojok Kiri-Atas
        ctx.beginPath();
        ctx.moveTo(0, arm); ctx.lineTo(0, 0); ctx.lineTo(arm, 0);
        ctx.stroke();

        // Pojok Kanan-Atas
        ctx.beginPath();
        ctx.moveTo(w - arm, 0); ctx.lineTo(w, 0); ctx.lineTo(w, arm);
        ctx.stroke();

        // Pojok Kiri-Bawah
        ctx.beginPath();
        ctx.moveTo(0, h - arm); ctx.lineTo(0, h); ctx.lineTo(arm, h);
        ctx.stroke();

        // Pojok Kanan-Bawah
        ctx.beginPath();
        ctx.moveTo(w - arm, h); ctx.lineTo(w, h); ctx.lineTo(w, h - arm);
        ctx.stroke();

        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.updateSkillReticlePosition = function() {
        if (!this._skillReticleSprite) return;
        var cfg = STATUS_JOURNAL_CONFIG.skillJournal.grid;
        var r = Math.floor(this._skillSlotIndex / cfg.cols);
        var c = this._skillSlotIndex % cfg.cols;
        this._skillReticleSprite.x = cfg.startX + c * cfg.spacingX + cfg.slotW / 2;
        this._skillReticleSprite.y = cfg.startY + r * cfg.spacingY + cfg.slotH / 2;
        this._skillReticleSprite.visible = (this._focusMode === 'slots' && this._activeJournalTab === 3);
    };

    Scene_StatusJournal.prototype.drawSkillDetails = function() {
        var sk = this.getCurrentSkill();
        var cfg = STATUS_JOURNAL_CONFIG.skillJournal;

        // 1. Polaroid Art di dalam Frame Polaroid Miring
        var artBmp = this._skillPolaroidArtSprite.bitmap;
        artBmp.clear();
        var artCtx = artBmp._context;

        // Area foto gelap magenta Polaroid_.png
        artCtx.save();
        artCtx.fillStyle = '#73335e';
        artCtx.fillRect(16, 12, 201, 186);

        if (sk) {
            var drawSize = (cfg.polaroid && cfg.polaroid.iconSize) || 144;
            var dx = Math.round(cfg.polaroid.photoCX - drawSize / 2);
            var dy = Math.round(cfg.polaroid.photoCY - drawSize / 2);

            artCtx.imageSmoothingEnabled = false;
            artCtx.shadowColor = 'rgba(0,0,0,0.6)';
            artCtx.shadowBlur = 10;

            // ================================================================
            // DIRECT DRAW: Gambar icon skill langsung via artCtx.drawImage
            // TIDAK menggunakan drawSkillIcon/blt agar aman dari crash _canvas 1x1
            // Urutan prioritas: Custom PNG -> Skill Sheet -> Basic.png -> IconSet
            // getRawImage() prioritaskan _image (raw HTMLImg) > __canvas > _baseTexture.source
            // ================================================================
            var drawn = false;

            // 1. Basic Attack (Basic.png)
            if (!drawn && (sk.customIcon === 'Basic' || sk.customIcon === 'basic' || (sk.id === 1 && sk.skillIconIndex === undefined))) {
                var basicBmp = typeof ImageManager.loadBasicSkillIcon === 'function'
                    ? ImageManager.loadBasicSkillIcon()
                    : ImageManager.loadBitmap('img/pictures/Skills/', 'Basic', 0, true);
                if (basicBmp && basicBmp.isReady()) {
                    var rawBasic = this.getRawImage(basicBmp);
                    if (rawBasic) {
                        try {
                            artCtx.drawImage(rawBasic, 0, 0, basicBmp._image ? basicBmp._image.width : (basicBmp.__canvas ? basicBmp.__canvas.width : 150), basicBmp._image ? basicBmp._image.height : (basicBmp.__canvas ? basicBmp.__canvas.height : 150), dx, dy, drawSize, drawSize);
                            drawn = true;
                        } catch(e) { console.warn('[drawSkillDetails] Basic draw error:', e); }
                    }
                } else if (basicBmp && !basicBmp.isReady() && !basicBmp.isError()) {
                    this.attachSafeLoadListener(basicBmp, 'skillDetailsBasic', this.drawSkillDetails);
                }
            }

            // 2. Item Sheet (karso.png - 90x90 per cell, 10 cols)
            if (!drawn && sk.itemIconIndex !== undefined && sk.itemIconIndex >= 0) {
                var itemSheet = typeof ImageManager.loadItemSheet === 'function'
                    ? ImageManager.loadItemSheet()
                    : ImageManager.loadBitmap('img/pictures/items/', 'karso', 0, true);
                if (itemSheet && itemSheet.isReady()) {
                    var rawItemSheet = this.getRawImage(itemSheet);
                    if (rawItemSheet) {
                        var kCol = sk.itemIconIndex % 10;
                        var kRow = Math.floor(sk.itemIconIndex / 10);
                        try {
                            artCtx.drawImage(rawItemSheet, kCol * 90, kRow * 90, 90, 90, dx, dy, drawSize, drawSize);
                            drawn = true;
                        } catch(e) { console.warn('[drawSkillDetails] Item sheet draw error:', e); }
                    }
                } else if (itemSheet && !itemSheet.isReady() && !itemSheet.isError()) {
                    this.attachSafeLoadListener(itemSheet, 'skillDetailsItemSheet', this.drawSkillDetails);
                }
            }

            // 3. Skill Sheet (Skills.png - 150x150 per cell)
            if (!drawn && sk.skillIconIndex !== undefined && sk.skillIconIndex >= 0) {
                var sheet = typeof ImageManager.loadSkillSheet === 'function'
                    ? ImageManager.loadSkillSheet()
                    : ImageManager.loadBitmap('img/pictures/Skills/', 'Skills', 0, true);
                if (sheet && sheet.isReady()) {
                    var rawSheet = this.getRawImage(sheet);
                    if (rawSheet) {
                        var sCol = sk.skillIconIndex % 10;
                        var sRow = Math.floor(sk.skillIconIndex / 10);
                        try {
                            artCtx.drawImage(rawSheet, sCol * 150, sRow * 150, 150, 150, dx, dy, drawSize, drawSize);
                            drawn = true;
                        } catch(e) { console.warn('[drawSkillDetails] Sheet draw error:', e); }
                    }
                } else if (sheet && !sheet.isReady() && !sheet.isError()) {
                    this.attachSafeLoadListener(sheet, 'skillDetailsSheet', this.drawSkillDetails);
                }
            }

            // 3. Custom Single PNG (img/pictures/Skills/ atau img/icons/)
            if (!drawn && sk.customIcon) {
                var customBmp = ImageManager.loadBitmap('img/pictures/Skills/', sk.customIcon, 0, true);
                if (!customBmp || !customBmp.isReady()) {
                    customBmp = ImageManager.loadBitmap('img/icons/', sk.customIcon, 0, true);
                }
                if (customBmp && customBmp.isReady()) {
                    var rawCustom = this.getRawImage(customBmp);
                    if (rawCustom) {
                        var cW = customBmp._image ? customBmp._image.width : (customBmp.__canvas ? customBmp.__canvas.width : 150);
                        var cH = customBmp._image ? customBmp._image.height : (customBmp.__canvas ? customBmp.__canvas.height : 150);
                        try {
                            artCtx.drawImage(rawCustom, 0, 0, cW, cH, dx, dy, drawSize, drawSize);
                            drawn = true;
                        } catch(e) { console.warn('[drawSkillDetails] Custom draw error:', e); }
                    }
                } else if (customBmp && !customBmp.isReady() && !customBmp.isError()) {
                    this.attachSafeLoadListener(customBmp, 'skillDetailsCustom', this.drawSkillDetails);
                }
            }

            // 4. Fallback: Standard IconSet (RPG Maker icon grid 32x32)
            if (!drawn && sk.iconIndex > 0) {
                var iconSet = ImageManager.loadSystem('IconSet');
                if (iconSet && iconSet.isReady()) {
                    var rawIcon = this.getRawImage(iconSet);
                    if (rawIcon) {
                        var iSx = (sk.iconIndex % 16) * 32;
                        var iSy = Math.floor(sk.iconIndex / 16) * 32;
                        try {
                            artCtx.drawImage(rawIcon, iSx, iSy, 32, 32, dx, dy, drawSize, drawSize);
                            drawn = true;
                        } catch(e) { console.warn('[drawSkillDetails] IconSet draw error:', e); }
                    }
                } else if (iconSet && !iconSet.isReady() && !iconSet.isError()) {
                    this.attachSafeLoadListener(iconSet, 'skillDetailsIconSet', this.drawSkillDetails);
                }
            }
        }
        artCtx.restore();
        artBmp._setDirty();

        // 2. Judul & Subteks (Font GameFont)
        var tBmp = this._skillTitleSprite.bitmap;
        tBmp.clear();
        var tCtx = tBmp._context;
        tCtx.save();

        if (sk) {
            tCtx.font = 'bold 22px GameFont, sans-serif';
            tCtx.fillStyle = '#2c1810';
            tCtx.textAlign = 'left';
            tCtx.fillText(sk.name, 0, cfg.title.nameY);

            // Kategori Badge
            var cat = this.classifySkill(sk);
            var catText = '*Attack Skill';
            var catColor = '#a82020';
            if (cat === 'defends') {
                catText = '*Defense / Support';
                catColor = '#1d4ed8';
            } else if (cat === 'special') {
                catText = '*Special / Unique';
                catColor = '#b45309';
            }
            tCtx.font = '16px GameFont, sans-serif';
            tCtx.fillStyle = catColor;
            tCtx.fillText(catText, 0, cfg.title.catY);

            // Biaya & Target
            var costParts = [];
            if (sk.mpCost > 0) costParts.push(sk.mpCost + ' MP');
            if (sk.tpCost > 0) costParts.push(sk.tpCost + ' TP');
            var costStr = costParts.length > 0 ? costParts.join(' / ') : 'Tanpa Biaya';

            var scopeStr = '1 Target';
            if (sk.scope === 1) scopeStr = '1 Musuh';
            else if (sk.scope === 2) scopeStr = 'Semua Musuh';
            else if (sk.scope === 7) scopeStr = '1 Rekan';
            else if (sk.scope === 8) scopeStr = 'Semua Rekan';
            else if (sk.scope === 11) scopeStr = 'Diri Sendiri';

            tCtx.font = '15px GameFont, sans-serif';
            tCtx.fillStyle = '#374151';
            tCtx.fillText('*' + costStr + ' | ' + scopeStr, 0, cfg.title.subY);

            // Status Equip Skill & Menu Usability
            var actor = this._actor || $gameParty.menuActor();
            var eqSlot = -1;
            if (actor && actor.pethogsEquippedSkills) {
                eqSlot = actor.pethogsEquippedSkills().indexOf(sk.id);
            }
            var canUseOutside = (sk.occasion === 0 || sk.occasion === 2);
            if (canUseOutside) {
                tCtx.font = 'bold 12px GameFont, sans-serif';
                tCtx.fillStyle = '#d97706';
                tCtx.fillText('✨ [ENTER] Gunakan / Pasang Skill', 0, cfg.title.subY + 22);
            } else if (eqSlot >= 0) {
                tCtx.font = 'bold 13px GameFont, sans-serif';
                tCtx.fillStyle = '#0284c7';
                tCtx.fillText('★ Terpasang di Slot ' + (eqSlot + 1) + ' ★', 0, cfg.title.subY + 22);
            } else {
                tCtx.font = '12px GameFont, sans-serif';
                tCtx.fillStyle = '#059669';
                tCtx.fillText('⚔ [ENTER] Pasang ke Slot Battle', 0, cfg.title.subY + 22);
            }
        } else {
            tCtx.font = 'bold 20px GameFont, sans-serif';
            tCtx.fillStyle = '#9ca3af';
            tCtx.fillText('(Slot Kosong)', 0, cfg.title.nameY);
        }
        tCtx.restore();
        tBmp._setDirty();

        // 3. Teks Catatan Lore (Tersusun di Atas Garis Kertas)
        var dTextBmp = this._skillDescTextSprite.bitmap;
        dTextBmp.clear();
        var dCtx = dTextBmp._context;
        dCtx.save();

        var descText = '';
        if (sk) {
            descText = sk.description || 'Tidak ada catatan atau keterangan khusus untuk skill ini.';
        } else {
            descText = 'Slot ini sedang kosong. Karakter ini belum mempelajari skill untuk slot ini.';
        }

        dCtx.font = '18px GameFont, sans-serif';
        dCtx.fillStyle = '#262626';
        dCtx.textAlign = 'left';

        var maxW = cfg.description.w - cfg.description.textX - 35;
        var words = descText.split(' ');
        var line = '';
        var lines = [];
        for (var w = 0; w < words.length; w++) {
            var testLine = line + words[w] + ' ';
            var metrics = dCtx.measureText(testLine);
            if (metrics.width > maxW && w > 0) {
                lines.push(line.trim());
                line = words[w] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        var startY = cfg.description.textY;
        var lh = cfg.description.lineHeight || 34;
        var maxL = cfg.description.maxLines || 7;
        for (var l = 0; l < Math.min(lines.length, maxL); l++) {
            dCtx.fillText(lines[l], cfg.description.textX, startY + l * lh);
        }

        // 4. Baris Status 5 Slot Battle di bagian bawah kertas deskripsi (Interaktif Live)
        var actor = this._actor || $gameParty.menuActor();
        if (actor && actor.pethogsEquippedSkills) {
            var eq = actor.pethogsEquippedSkills();
            dCtx.save();
            dCtx.font = 'bold 12px GameFont, sans-serif';
            dCtx.fillStyle = '#1e3a8a';
            dCtx.fillText('⚔ 5 SLOT BATTLE TERPASANG (Klik / Tekan [1-5] untuk Atur):', cfg.description.textX, startY + 5 * lh + 6);

            for (var si = 0; si < 5; si++) {
                var sId = eq[si];
                var sObj = sId > 0 ? $dataSkills[sId] : null;
                var slotColX = cfg.description.textX + (si % 3) * 142;
                var slotRowY = startY + 5 * lh + 18 + Math.floor(si / 3) * 25;

                // Card background
                var isCurEquipped = sk && sId === sk.id;
                dCtx.fillStyle = isCurEquipped ? 'rgba(56, 189, 248, 0.25)' : (sObj ? 'rgba(240, 253, 244, 0.9)' : 'rgba(241, 245, 249, 0.8)');
                dCtx.beginPath();
                dCtx.roundRect(slotColX, slotRowY, 136, 21, 4);
                dCtx.fill();
                dCtx.strokeStyle = isCurEquipped ? '#0284c7' : (sObj ? '#86efac' : '#cbd5e1');
                dCtx.lineWidth = isCurEquipped ? 2 : 1;
                dCtx.stroke();

                // Slot tag
                dCtx.font = 'bold 10px GameFont, sans-serif';
                dCtx.fillStyle = isCurEquipped ? '#0369a1' : (sObj ? '#15803d' : '#64748b');
                dCtx.fillText('S' + (si + 1) + ':', slotColX + 5, slotRowY + 15);

                // Skill name
                dCtx.font = '11px GameFont, sans-serif';
                var sName = sObj ? sObj.name.replace(/\s*\(.*\)/, '').trim() : '(Kosong)';
                if (sName.length > 12) sName = sName.substring(0, 11) + '…';
                dCtx.fillStyle = isCurEquipped ? '#0369a1' : (sObj ? '#0f172a' : '#94a3b8');
                dCtx.fillText(sName, slotColX + 26, slotRowY + 15);
            }
            dCtx.restore();
        }
        dCtx.restore();
        dTextBmp._setDirty();
    };

    Scene_StatusJournal.prototype.updateSkillRibbonTargets = function() {
        if (!this._skillSingleRibbonSprite) return;
        var cfg = STATUS_JOURNAL_CONFIG.skillJournal;
        var ribCfg = (cfg && cfg.ribbons) || { x: 268, y: 12 };
        var ribbonFiles = ['Attack', 'Defends', 'Special'];
        var catName = ribbonFiles[this._skillRibbonIndex] || 'Attack';
        this._skillSingleRibbonSprite.bitmap = ImageManager.loadJournalSkill(catName);
        this._skillSingleRibbonSprite.x = ribCfg.x !== undefined ? ribCfg.x : 268;
        this._skillSingleRibbonSprite.y = ribCfg.y !== undefined ? ribCfg.y : 12;
        this._skillSingleRibbonSprite.opacity = 255;
    };

    Scene_StatusJournal.prototype.setSkillRibbon = function(idx) {
        if (idx < 0 || idx > 2) return;
        this._skillRibbonIndex = idx;
        this._skillSlotIndex = 0;
        AudioManager.playSe({ name: 'Book1', volume: 90, pitch: 105, pan: 0 });

        if (this._skillSingleRibbonSprite) {
            var cfg = STATUS_JOURNAL_CONFIG.skillJournal;
            var ribCfg = (cfg && cfg.ribbons) || { x: 268, y: 12 };
            var ribbonFiles = ['Attack', 'Defends', 'Special'];
            var catName = ribbonFiles[idx] || 'Attack';
            this._skillSingleRibbonSprite.bitmap = ImageManager.loadJournalSkill(catName);
            // Posisi tetap tenang dan stabil di tempatnya (tanpa animasi)
            this._skillSingleRibbonSprite.x = ribCfg.x !== undefined ? ribCfg.x : 268;
            this._skillSingleRibbonSprite.y = ribCfg.y !== undefined ? ribCfg.y : 12;
            this._skillSingleRibbonSprite.opacity = 255;
            this._skillSingleRibbonSprite.visible = true;
        }

        this.refreshSkillPage();
    };

    Scene_StatusJournal.prototype.previousSkillRibbon = function() {
        var next = (this._skillRibbonIndex + 3 - 1) % 3;
        this.setSkillRibbon(next);
    };

    Scene_StatusJournal.prototype.nextSkillRibbon = function() {
        var next = (this._skillRibbonIndex + 1) % 3;
        this.setSkillRibbon(next);
    };

    Scene_StatusJournal.prototype.refreshAll = function() {
        this.drawRibbonTabs();
        this.refreshStatusPage();
        this.refreshItemPage();
        this.refreshPartyPage();
        this.refreshSkillPage();
    };

    Scene_StatusJournal.prototype.refreshActivePage = function() {
        if (this._activeJournalTab === 0) {
            this.refreshStatusPage();
        } else if (this._activeJournalTab === 1) {
            this.refreshItemPage();
        } else if (this._activeJournalTab === 2) {
            this.refreshPartyPage();
        } else if (this._activeJournalTab === 3) {
            this.refreshSkillPage();
        } else if (this._activeJournalTab === 4) {
            this.refreshConstellationPage();
        } else if (this._activeJournalTab === 5) {
            this.refreshArchivePage();
        }
    };

    // ------------------------------------------------------------------------
    // SISTEM PENGGUNAAN ITEM (CONSUMABLE & TARGET MODAL)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.tryUseCurrentItem = function() {
        var it = this.getCurrentItem();
        if (!it) {
            SoundManager.playBuzzer();
            return;
        }

        if (DataManager.isItem(it) && it.occasion <= 2) {
            if (it.scope === 1 || it.scope === 7) {
                this.openItemTargetModal();
                return;
            } else if (it.scope === 2 || it.scope === 8) {
                this.applyCurrentItemToAll();
                return;
            } else if (it.scope === 0) {
                this.applyCurrentItemNoTarget();
                return;
            }
        }

        SoundManager.playBuzzer();
        this._toastMessage = 'Barang ini tidak dapat digunakan di menu!';
        this._toastTimer = 120;
        this.drawItemDetails();
    };

    Scene_StatusJournal.prototype.openItemTargetModal = function() {
        this._focusMode = 'targetSelect';
        this._targetActorIndex = 0;
        this._itemTargetModal.visible = true;
        this.drawItemTargetModal();
        SoundManager.playOk();
    };

    Scene_StatusJournal.prototype.closeItemTargetModal = function() {
        this._focusMode = 'slots';
        this._itemTargetModal.visible = false;
        this.updateItemReticlePosition();
    };

    Scene_StatusJournal.prototype.drawItemTargetModal = function() {
        var bmp = this._itemTargetModal.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var members = $gameParty.members();

        ctx.save();
        ctx.fillStyle = '#1e1008';
        ctx.beginPath();
        ctx.roundRect(0, 0, 380, 260, 10);
        ctx.fill();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 15px GameFont, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('Gunakan pada siapa?', 190, 28);

        for (var i = 0; i < members.length; i++) {
            var mem = members[i];
            var isSel = (i === this._targetActorIndex);
            var itemY = 48 + i * 46;

            ctx.fillStyle = isSel ? '#312e81' : '#111827';
            ctx.beginPath();
            ctx.roundRect(20, itemY, 340, 38, 6);
            ctx.fill();
            ctx.strokeStyle = isSel ? '#a5b4fc' : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.font = 'bold 14px GameFont, sans-serif';
            ctx.fillStyle = isSel ? '#ffffff' : '#e2e8f0';
            ctx.textAlign = 'left';
            ctx.fillText((i + 1) + '. ' + mem.name(), 32, itemY + 24);

            ctx.font = '13px GameFont, monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#86efac';
            ctx.fillText('HP ' + mem.hp + '/' + mem.mhp + '  MP ' + mem.mp + '/' + mem.mmp, 348, itemY + 24);
        }

        ctx.font = 'italic 12px GameFont, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('[ENTER] Konfirmasi  •  [ESC] Batal', 190, 245);
        ctx.restore();
    };

    Scene_StatusJournal.prototype.applyCurrentItemToTarget = function() {
        var it = this.getCurrentItem();
        var members = $gameParty.members();
        var target = members[this._targetActorIndex];
        if (!it || !target) return;

        var action = new Game_Action($gameParty.leader());
        action.setItemObject(it);
        action.apply(target);
        action.applyGlobal();
        if (it.consumable) $gameParty.consumeItem(it);

        SoundManager.playUseItem();
        this.closeItemTargetModal();
        this.refreshActivePage();
    };

    Scene_StatusJournal.prototype.applyCurrentItemToAll = function() {
        var it = this.getCurrentItem();
        if (!it) return;

        var members = $gameParty.members();
        var action = new Game_Action($gameParty.leader());
        action.setItemObject(it);
        for (var i = 0; i < members.length; i++) {
            action.apply(members[i]);
        }
        action.applyGlobal();
        if (it.consumable) $gameParty.consumeItem(it);

        SoundManager.playUseItem();
        this.refreshActivePage();
    };

    Scene_StatusJournal.prototype.applyCurrentItemNoTarget = function() {
        var it = this.getCurrentItem();
        if (!it) return;

        var action = new Game_Action($gameParty.leader());
        action.setItemObject(it);
        action.applyGlobal();
        if (it.consumable) $gameParty.consumeItem(it);

        SoundManager.playUseItem();
        this.refreshActivePage();
    };

    // ------------------------------------------------------------------------
    // SISTEM MODAL EQUIP SKILL BATTLE (SLOT 1 - 5)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.createSkillEquipModal = function() {
        this._skillEquipModal = new Sprite();
        this._skillEquipModal.bitmap = new Bitmap(440, 360);
        this._skillEquipModal.x = 239 + Math.round((508 - 440) / 2);
        this._skillEquipModal.y = 21 + Math.round((668 - 360) / 2);
        this._skillEquipModal.visible = false;
        this._skillEquipIndex = 0;
        this._journalRoot.addChild(this._skillEquipModal);
    };

    Scene_StatusJournal.prototype.tryEquipCurrentSkill = function() {
        var sk = this.getCurrentSkill();
        if (!sk) {
            SoundManager.playBuzzer();
            return;
        }
        this._focusMode = 'skillEquipModal';
        this._skillEquipIndex = 0;
        this._skillEquipModal.visible = true;
        this.drawSkillEquipModal();
        SoundManager.playOk();
    };

    Scene_StatusJournal.prototype.closeSkillEquipModal = function() {
        this._focusMode = 'slots';
        this._skillEquipModal.visible = false;
        this.updateSkillReticlePosition();
    };

    Scene_StatusJournal.prototype.drawSkillEquipModal = function() {
        var bmp = this._skillEquipModal.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var actor = this._actor || $gameParty.menuActor();
        var currentSkill = this.getCurrentSkill();
        var equipped = (actor && actor.pethogsEquippedSkills) ? actor.pethogsEquippedSkills() : [0,0,0,0,0];

        var isAlreadyEquipped = currentSkill && equipped.indexOf(currentSkill.id) !== -1;
        var totalOptions = isAlreadyEquipped ? 6 : 5;

        ctx.save();
        ctx.fillStyle = '#1e1008';
        ctx.beginPath();
        ctx.roundRect(0, 0, 440, 360, 10);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = 'bold 15px GameFont, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('PASANG KE SLOT BATTLE (1 - 5)', 220, 28);

        ctx.font = '12px GameFont, sans-serif';
        ctx.fillStyle = '#94a3b8';
        var skillName = currentSkill ? currentSkill.name : '';
        ctx.fillText('Skill: ' + skillName, 220, 48);

        for (var i = 0; i < totalOptions; i++) {
            var isSel = (i === this._skillEquipIndex);
            var itemY = 60 + i * 44;

            ctx.fillStyle = isSel ? '#0284c7' : '#111827';
            ctx.beginPath();
            ctx.roundRect(18, itemY, 404, 38, 6);
            ctx.fill();
            ctx.strokeStyle = isSel ? '#7dd3fc' : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.textAlign = 'left';
            if (i < 5) {
                var eqId = equipped[i];
                var eqSkill = eqId > 0 ? $dataSkills[eqId] : null;

                ctx.font = 'bold 13px GameFont, sans-serif';
                ctx.fillStyle = isSel ? '#ffffff' : (eqSkill ? '#facc15' : '#94a3b8');
                ctx.fillText('SLOT ' + (i + 1) + ':', 28, itemY + 24);

                ctx.font = '13px GameFont, sans-serif';
                ctx.fillStyle = isSel ? '#ffffff' : (eqSkill ? '#f1f5f9' : '#64748b');
                var eqName = eqSkill ? eqSkill.name : '(Kosong / Empty)';
                ctx.fillText(eqName, 94, itemY + 24);
            } else {
                ctx.font = 'bold 13px GameFont, sans-serif';
                ctx.fillStyle = isSel ? '#ffffff' : '#ef4444';
                ctx.fillText('✖ LEPAS DARI SLOT (UNEQUIP)', 28, itemY + 24);
            }
        }

        ctx.font = 'italic 11px GameFont, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('[ENTER] Pilih Slot  •  [ESC] Batal', 220, 344);
        ctx.restore();
    };

    Scene_StatusJournal.prototype.confirmSkillEquipModal = function() {
        var actor = this._actor || $gameParty.menuActor();
        var currentSkill = this.getCurrentSkill();
        if (!actor || !currentSkill) return;

        if (this._skillEquipIndex < 5) {
            if (actor.equipPethogsSkill) {
                actor.equipPethogsSkill(this._skillEquipIndex, currentSkill.id);
            } else if (actor.pethogsEquippedSkills) {
                var eq = actor.pethogsEquippedSkills();
                for (var i = 0; i < eq.length; i++) {
                    if (eq[i] === currentSkill.id) eq[i] = 0;
                }
                eq[this._skillEquipIndex] = currentSkill.id;
            }
            SoundManager.playEquip();
            this._toastMessage = currentSkill.name + ' dipasang ke Slot ' + (this._skillEquipIndex + 1) + '!';
            this._toastTimer = 120;
        } else {
            if (actor.unequipPethogsSkill) {
                actor.unequipPethogsSkill(currentSkill.id);
            } else if (actor.pethogsEquippedSkills) {
                var eq = actor.pethogsEquippedSkills();
                var idx = eq.indexOf(currentSkill.id);
                if (idx !== -1) eq[idx] = 0;
            }
            SoundManager.playEquip();
            this._toastMessage = currentSkill.name + ' dilepas dari slot battle!';
            this._toastTimer = 120;
        }

        this.closeSkillEquipModal();
        this.refreshSkillPage();
    };

    // ------------------------------------------------------------------------
    // SISTEM PENGGUNAAN SKILL DI LUAR PERTEMPURAN & AKSI LIVE SLOT BATTLE
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.onSkillSlotOk = function() {
        var sk = this.getCurrentSkill();
        if (!sk) {
            SoundManager.playBuzzer();
            return;
        }
        var canUseOutside = (sk.occasion === 0 || sk.occasion === 2);
        if (canUseOutside) {
            this.openSkillActionModal();
        } else {
            this.tryEquipCurrentSkill();
        }
    };

    Scene_StatusJournal.prototype.createSkillActionModal = function() {
        this._skillActionModal = new Sprite();
        this._skillActionModal.bitmap = new Bitmap(420, 240);
        this._skillActionModal.x = 239 + Math.round((508 - 420) / 2);
        this._skillActionModal.y = 21 + Math.round((668 - 240) / 2);
        this._skillActionModal.visible = false;
        this._skillActionIndex = 0;
        this._journalRoot.addChild(this._skillActionModal);
    };

    Scene_StatusJournal.prototype.openSkillActionModal = function() {
        this._focusMode = 'skillActionModal';
        this._skillActionIndex = 0;
        this._skillActionModal.visible = true;
        this.drawSkillActionModal();
        SoundManager.playOk();
    };

    Scene_StatusJournal.prototype.closeSkillActionModal = function() {
        this._focusMode = 'slots';
        this._skillActionModal.visible = false;
        this.updateSkillReticlePosition();
    };

    Scene_StatusJournal.prototype.drawSkillActionModal = function() {
        var bmp = this._skillActionModal.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var sk = this.getCurrentSkill();
        if (!sk) return;

        var costText = '';
        if (sk.mpCost > 0) costText = sk.mpCost + ' MP';
        if (sk.tpCost > 0) costText += (costText ? ' / ' : '') + sk.tpCost + ' TP';
        if (!costText) costText = 'Gratis';

        ctx.save();
        ctx.fillStyle = '#1e1008';
        ctx.beginPath();
        ctx.roundRect(0, 0, 420, 240, 10);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = 'bold 15px GameFont, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('PILIHAN AKSI SKILL', 210, 28);

        ctx.font = '12px GameFont, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Skill: ' + sk.name + ' (' + costText + ')', 210, 48);

        var options = [
            { label: '✨ Gunakan Skill Sekarang', sub: 'Terapkan khasiat skill langsung di menu' },
            { label: '⚔ Pasang ke Slot Battle (1 - 5)', sub: 'Atur penempatan skill pada formasi 5 slot pertempuran' },
            { label: '✖ Batal', sub: 'Kembali ke penjelajahan buku skill' }
        ];

        for (var i = 0; i < options.length; i++) {
            var isSel = (i === this._skillActionIndex);
            var itemY = 60 + i * 48;

            ctx.fillStyle = isSel ? '#0284c7' : '#111827';
            ctx.beginPath();
            ctx.roundRect(18, itemY, 384, 42, 6);
            ctx.fill();
            ctx.strokeStyle = isSel ? '#7dd3fc' : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.textAlign = 'left';
            ctx.font = 'bold 13px GameFont, sans-serif';
            ctx.fillStyle = isSel ? '#ffffff' : (i === 2 ? '#ef4444' : '#facc15');
            ctx.fillText(options[i].label, 28, itemY + 20);

            ctx.font = '11px GameFont, sans-serif';
            ctx.fillStyle = isSel ? '#e0f2fe' : '#94a3b8';
            ctx.fillText(options[i].sub, 28, itemY + 35);
        }

        ctx.font = 'italic 11px GameFont, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('[ENTER] Pilih Aksi  •  [ESC] Batal', 210, 226);
        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.confirmSkillActionModal = function() {
        if (this._skillActionIndex === 0) {
            this.closeSkillActionModal();
            this.tryUseCurrentSkill();
        } else if (this._skillActionIndex === 1) {
            this.closeSkillActionModal();
            this.tryEquipCurrentSkill();
        } else {
            this.closeSkillActionModal();
        }
    };

    Scene_StatusJournal.prototype.tryUseCurrentSkill = function() {
        var sk = this.getCurrentSkill();
        var actor = this._actor || $gameParty.menuActor();
        if (!sk || !actor) {
            SoundManager.playBuzzer();
            return;
        }

        if (sk.occasion !== 0 && sk.occasion !== 2) {
            SoundManager.playBuzzer();
            this._toastMessage = 'Skill ini hanya dapat digunakan saat pertempuran!';
            this._toastTimer = 120;
            this.drawSkillDetails();
            return;
        }

        if (!actor.canPaySkillCost(sk)) {
            SoundManager.playBuzzer();
            this._toastMessage = 'MP / TP tidak mencukupi!';
            this._toastTimer = 120;
            this.drawSkillDetails();
            return;
        }

        if (sk.scope === 1 || sk.scope === 7 || sk.scope === 11) {
            this.openSkillTargetModal();
        } else if (sk.scope === 2 || sk.scope === 8) {
            this.applyCurrentSkillToAll();
        } else {
            this.applyCurrentSkillNoTarget();
        }
    };

    Scene_StatusJournal.prototype.openSkillTargetModal = function() {
        this._focusMode = 'skillTargetSelect';
        this._targetActorIndex = 0;
        this._itemTargetModal.visible = true;
        this.drawSkillTargetModal();
        SoundManager.playOk();
    };

    Scene_StatusJournal.prototype.closeSkillTargetModal = function() {
        this._focusMode = 'slots';
        this._itemTargetModal.visible = false;
        this.updateSkillReticlePosition();
    };

    Scene_StatusJournal.prototype.drawSkillTargetModal = function() {
        var bmp = this._itemTargetModal.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var members = $gameParty.members();
        var sk = this.getCurrentSkill();

        ctx.save();
        ctx.fillStyle = '#1e1008';
        ctx.beginPath();
        ctx.roundRect(0, 0, 380, 260, 10);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 15px GameFont, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('Gunakan ' + (sk ? sk.name : 'Skill') + ' pada siapa?', 190, 28);

        for (var i = 0; i < members.length; i++) {
            var mem = members[i];
            var isSel = (i === this._targetActorIndex);
            var itemY = 48 + i * 46;

            ctx.fillStyle = isSel ? '#0284c7' : '#111827';
            ctx.beginPath();
            ctx.roundRect(20, itemY, 340, 38, 6);
            ctx.fill();
            ctx.strokeStyle = isSel ? '#7dd3fc' : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.font = 'bold 14px GameFont, sans-serif';
            ctx.fillStyle = isSel ? '#ffffff' : '#e2e8f0';
            ctx.textAlign = 'left';
            ctx.fillText((i + 1) + '. ' + mem.name(), 32, itemY + 24);

            ctx.font = '13px GameFont, monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#86efac';
            ctx.fillText('HP ' + mem.hp + '/' + mem.mhp + '  MP ' + mem.mp + '/' + mem.mmp, 348, itemY + 24);
        }

        ctx.font = 'italic 12px GameFont, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('[ENTER] Konfirmasi  •  [ESC] Batal', 190, 245);
        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.applyCurrentSkillToTarget = function() {
        var sk = this.getCurrentSkill();
        var members = $gameParty.members();
        var target = members[this._targetActorIndex];
        var actor = this._actor || $gameParty.menuActor();
        if (!sk || !target || !actor) return;

        if (!actor.canPaySkillCost(sk)) {
            SoundManager.playBuzzer();
            this._toastMessage = 'MP / TP tidak mencukupi!';
            this._toastTimer = 120;
            this.closeSkillTargetModal();
            return;
        }

        actor.useItem(sk);
        var action = new Game_Action(actor);
        action.setItemObject(sk);
        action.apply(target);
        action.applyGlobal();

        SoundManager.playUseSkill();
        this._toastMessage = actor.name() + ' menggunakan ' + sk.name + ' pada ' + target.name() + '!';
        this._toastTimer = 120;
        this.closeSkillTargetModal();
        this.refreshActivePage();
    };

    Scene_StatusJournal.prototype.applyCurrentSkillToAll = function() {
        var sk = this.getCurrentSkill();
        var actor = this._actor || $gameParty.menuActor();
        if (!sk || !actor) return;

        if (!actor.canPaySkillCost(sk)) {
            SoundManager.playBuzzer();
            this._toastMessage = 'MP / TP tidak mencukupi!';
            this._toastTimer = 120;
            return;
        }

        actor.useItem(sk);
        var action = new Game_Action(actor);
        action.setItemObject(sk);
        var members = $gameParty.members();
        for (var i = 0; i < members.length; i++) {
            action.apply(members[i]);
        }
        action.applyGlobal();

        SoundManager.playUseSkill();
        this._toastMessage = actor.name() + ' menggunakan ' + sk.name + ' untuk seluruh rekan!';
        this._toastTimer = 120;
        this.refreshActivePage();
    };

    Scene_StatusJournal.prototype.applyCurrentSkillNoTarget = function() {
        var sk = this.getCurrentSkill();
        var actor = this._actor || $gameParty.menuActor();
        if (!sk || !actor) return;

        if (!actor.canPaySkillCost(sk)) {
            SoundManager.playBuzzer();
            this._toastMessage = 'MP / TP tidak mencukupi!';
            this._toastTimer = 120;
            return;
        }

        actor.useItem(sk);
        var action = new Game_Action(actor);
        action.setItemObject(sk);
        action.applyGlobal();

        SoundManager.playUseSkill();
        this._toastMessage = actor.name() + ' menggunakan ' + sk.name + '!';
        this._toastTimer = 120;
        this.refreshActivePage();
    };

    Scene_StatusJournal.prototype.interactBattleSlot = function(si) {
        var actor = this._actor || $gameParty.menuActor();
        if (!actor || !actor.pethogsEquippedSkills) return;
        var eq = actor.pethogsEquippedSkills();
        var curSkill = this.getCurrentSkill();
        var inSlot = eq[si];

        if (curSkill) {
            if (inSlot === curSkill.id) {
                // Lepas skill dari slot ini
                if (actor.unequipPethogsSkill) {
                    actor.unequipPethogsSkill(curSkill.id);
                } else {
                    eq[si] = 0;
                }
                SoundManager.playEquip();
                this._toastMessage = curSkill.name + ' dilepas dari Slot ' + (si + 1) + '!';
            } else {
                // Pasang skill ke slot ini
                if (actor.equipPethogsSkill) {
                    actor.equipPethogsSkill(si, curSkill.id);
                } else {
                    for (var k = 0; k < eq.length; k++) {
                        if (eq[k] === curSkill.id) eq[k] = 0;
                    }
                    eq[si] = curSkill.id;
                }
                SoundManager.playEquip();
                this._toastMessage = curSkill.name + ' dipasang ke Slot ' + (si + 1) + '!';
            }
        } else if (inSlot > 0) {
            var oldSk = $dataSkills[inSlot];
            if (actor.unequipPethogsSkill) {
                actor.unequipPethogsSkill(inSlot);
            } else {
                eq[si] = 0;
            }
            SoundManager.playEquip();
            this._toastMessage = (oldSk ? oldSk.name : 'Skill') + ' dilepas dari Slot ' + (si + 1) + '!';
        } else {
            SoundManager.playBuzzer();
            this._toastMessage = 'Pilih skill dari kisi grid terlebih dahulu!';
        }
        this._toastTimer = 120;
        this.refreshSkillPage();
    };

    // ------------------------------------------------------------------------
    // SISTEM DRAWER PERLENGKAPAN STATUS
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.openDrawer = function() {
        var actor = $gameParty.menuActor();
        if (!actor) return;
        var slot = JOURNAL_SLOTS[this._selectedSlotIndex];
        if (!slot) return;

        this._drawerItems = [null]; // null = [Lepas Perlengkapan]
        var allEquips = $gameParty.equipItems();
        for (var i = 0; i < allEquips.length; i++) {
            var item = allEquips[i];
            if (item && (item.etypeId === slot.etypeId || isSlotEtypeCompatible(slot.etypeId, item.etypeId)) && actor.canEquip(item)) {
                this._drawerItems.push(item);
            }
        }

        var curEquip = actor.equips()[slot.slotIndex];
        var initIdx = 0;
        if (curEquip) {
            for (var j = 1; j < this._drawerItems.length; j++) {
                if (this._drawerItems[j].id === curEquip.id) {
                    initIdx = j;
                    break;
                }
            }
        }

        this._drawerIndex = initIdx;
        this._drawerActive = true;
        this._focusMode = 'drawer';
        this._drawerTargetScrollX = this._drawerIndex * 64;
        this._drawerScrollX = this._drawerTargetScrollX;
        this._cachedPreviewKey = null;
        this._cachedPreviewActor = null;

        SoundManager.playEquip();
        this._drawerSprite.visible = true;
        this.drawDrawerContent();
        this.drawLinedNote();
        if (this.triggerOctagramMorph) {
            this.triggerOctagramMorph(false);
        }
    };

    Scene_StatusJournal.prototype.closeDrawer = function(quiet) {
        this._drawerActive = false;
        this._focusMode = 'slots';
        this._drawerSprite.visible = false;
        this._drawerSprite.opacity = 0;
        this._cachedPreviewKey = null;
        this._cachedPreviewActor = null;
        if (!quiet) SoundManager.playCancel();
        this.refreshRightPage();
        this.drawStatusGauges();
        this.drawLinedNote();
        if (this.triggerOctagramMorph) {
            this.triggerOctagramMorph(false);
        }
    };

    Scene_StatusJournal.prototype.drawDrawerContent = function() {
        var bmp = this._drawerSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = bmp.width;
        var h = bmp.height;
        var cx = 258;

        ctx.save();
        ctx.fillStyle = '#1e1008';
        ctx.beginPath();
        ctx.roundRect(10, 8, w - 20, h - 16, 8);
        ctx.fill();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(253, 230, 138, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(20, h / 2);
        ctx.lineTo(w - 20, h / 2);
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(cx - 26, h / 2 - 26, 52, 52, 8);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 16px GameFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('◀', cx - 38, h / 2 + 6);
        ctx.fillText('▶', cx + 38, h / 2 + 6);
        ctx.restore();

        var itemSpacing = 64;
        var iconSet = ImageManager.loadSystem('IconSet');

        var dIconSize = 44;
        var dHalf = 22;
        for (var i = 0; i < this._drawerItems.length; i++) {
            var it = this._drawerItems[i];
            var itemX = cx + (i * itemSpacing) - this._drawerScrollX;

            if (itemX >= -30 && itemX <= w + 30) {
                if (it === null) {
                    ctx.save();
                    ctx.fillStyle = '#ef4444';
                    ctx.font = 'bold 28px GameFont, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('✕', itemX, h / 2 + 9);
                    ctx.restore();
                } else if (it) {
                    var drawn = false;
                    if (typeof ImageManager.drawSkillIcon === 'function' && (it.customIcon || it.skillIconIndex !== undefined || it.itemIconIndex !== undefined)) {
                        drawn = ImageManager.drawSkillIcon(bmp, it, itemX - dHalf, h / 2 - dHalf, dIconSize, dIconSize, this.drawDrawerContent.bind(this));
                    }
                    if (!drawn && it.iconIndex > 0) {
                        if (iconSet && iconSet.isReady()) {
                            var iconImg = iconSet._canvas || iconSet._image;
                            var sx = (it.iconIndex % 16) * 32;
                            var sy = Math.floor(it.iconIndex / 16) * 32;
                            ctx.drawImage(iconImg, sx, sy, 32, 32, itemX - dHalf, h / 2 - dHalf, dIconSize, dIconSize);
                        } else if (iconSet && !iconSet.isReady() && !iconSet.isError()) {
                            this.attachSafeLoadListener(iconSet, 'drawer_iconSet', this.drawDrawerContent);
                        }
                    }
                }
            }
        }
    };

    Scene_StatusJournal.prototype.applyDrawerEquip = function() {
        var actor = $gameParty.menuActor();
        if (!actor) return;
        var slot = JOURNAL_SLOTS[this._selectedSlotIndex];
        var item = this._drawerItems[this._drawerIndex];

        SoundManager.playEquip();
        actor.changeEquip(slot.slotIndex, item);
        this.closeDrawer(true);
        this.drawEquipmentSlots();
    };

    // ------------------------------------------------------------------------
    // UPDATE SCENE & KONTROL INPUT DINAMIS
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        if (_journalCooldown > 0) _journalCooldown--;
        if (this._openKeyCooldown > 0) this._openKeyCooldown--;
        this._pulseTimer++;
        this.updateTraumaGlowAnimations();

        // Animasi Membuka Buku Jurnal
        if (this._isOpening) {
            this.updateOpenAnimation();
            return;
        }

        // Animasi Menutup Buku Jurnal
        if (this._isClosing) {
            this.updateCloseAnimation();
            return;
        }

        // 1. Lerp Animasi Halus Pita Navigasi (Menonjol ke Kiri)
        //    + Peek-on-Hover: hanya aktif saat kursor mouse REAL sedang berada di atas pita
        if (this._ribbonSprites) {
            var scale = this._journalScale || 1;
            var root  = this._journalRoot || { x: 0, y: 0 };

            // Menggunakan koordinat mouse live (bukan TouchInput yang beku di klik terakhir)
            var hasLiveMouse = _journalMouseInWindow && _journalRealMouseX >= 0 && _journalRealMouseY >= 0;
            var hmx = hasLiveMouse ? ((_journalRealMouseX - root.x) / scale) : -9999;
            var hmy = hasLiveMouse ? ((_journalRealMouseY - root.y) / scale) : -9999;

            for (var i = 0; i < this._ribbonSprites.length; i++) {
                var sp  = this._ribbonSprites[i];
                var def = RIBBON_TABS[i];
                if (!def || sp._targetX === undefined) continue;

                // Posisi ON (muncul penuh ke kiri) dan OFF (tersembunyi hanya icon)
                var onX  = def.selectedX !== undefined ? def.selectedX : (def.peekX !== undefined ? def.peekX : 15);
                var offX = def.unselectedX !== undefined ? def.unselectedX : 185;

                // Hitbox hover: HANYA jika mouse live ada di sisi kiri buku (x: 0..239)
                // dan tepat di rentang vertikal pita ini (def.y sampai def.y + 70)
                var isSelected = (i === this._selectedRibbonIndex);
                var hovering = false;
                if (!isSelected && hasLiveMouse) {
                    hovering = (hmx >= 0 && hmx <= 239 && hmy >= def.y && hmy <= def.y + 72);
                }

                if (isSelected) {
                    sp.tone = (this._focusMode === 'ribbon') ? [45, 40, 15, 0] : [15, 10, 0, 0];
                } else if (hovering) {
                    sp.tone = [15, 15, 15, 0]; // Sedikit lebih terang saat di-hover
                } else {
                    sp.tone = [-25, -25, -25, 0];
                }

                // Jika sedang dipilih ATAU sedang di-hover: geser ke posisi ON
                // Jika tidak dipilih dan tidak di-hover: kembali ke posisi OFF (retracted)
                var targetX = (isSelected || hovering) ? onX : offX;
                sp.x += (targetX - sp.x) * 0.22;
            }
        }

        // 1c. Animasi Denyut Titik Merah Notifikasi (Red Dot Badges)
        this.updateRibbonBadges();

        // 1b. Animasi Kursor Bookmark Pita Emas
        if (this._ribbonCursorSprite) {
            if (this._focusMode === 'ribbon') {
                this._ribbonCursorSprite.visible = true;
                if (this._ribbonCursorSprite._targetY !== undefined) {
                    this._ribbonCursorSprite.y += (this._ribbonCursorSprite._targetY - this._ribbonCursorSprite.y) * 0.28;
                }
                if (this._ribbonCursorSprite._targetX !== undefined) {
                    var bob = Math.sin(this._pulseTimer * 0.15) * 3;
                    this._ribbonCursorSprite.x += (this._ribbonCursorSprite._targetX + bob - this._ribbonCursorSprite.x) * 0.28;
                }
            } else {
                this._ribbonCursorSprite.visible = false;
            }
        }

        // 2. Animasi Membalik Halaman Buku Realistis
        if (this._isFlippingPage) {
            this.updatePageFlipAnimation();
        }

        // 2b. Animasi Idle Breathing Octagram Stat Radar
        if (this._activeJournalTab === 0 && this._octagramSprite) {
            this.updateOctagramIdleBreathing();
        }

        // 3. Animasi Kursor Reticle
        if (this._activeJournalTab === 0 && this._slotReticleSprite && this._focusMode === 'slots') {
            var pulseScale = 1.0 + Math.sin(this._pulseTimer * 0.12) * 0.04;
            this._slotReticleSprite.scale.x = pulseScale;
            this._slotReticleSprite.scale.y = pulseScale;
        } else if (this._activeJournalTab === 1 && this._itemReticleSprite && this._focusMode === 'slots') {
            var pulseScale = 1.0 + Math.sin(this._pulseTimer * 0.12) * 0.035;
            this._itemReticleSprite.scale.x = pulseScale;
            this._itemReticleSprite.scale.y = pulseScale;
        } else if (this._activeJournalTab === 2 && this._partyReticleSprite && this._focusMode === 'slots') {
            var pulseScale = 1.0 + Math.sin(this._pulseTimer * 0.12) * 0.025;
            this._partyReticleSprite.scale.x = pulseScale;
            this._partyReticleSprite.scale.y = pulseScale;
        } else if (this._activeJournalTab === 3 && this._skillReticleSprite && this._focusMode === 'slots') {
            var pulseScale = 1.0 + Math.sin(this._pulseTimer * 0.12) * 0.035;
            this._skillReticleSprite.scale.x = pulseScale;
            this._skillReticleSprite.scale.y = pulseScale;
        } else if (this._activeJournalTab === 4 && this._focusMode === 'slots') {
            var pulseScale = 1.0 + Math.sin(this._pulseTimer * 0.12) * 0.035;
            if (this._constellationTreeReticleSprite && this._constellationTreeReticleSprite.visible) {
                this._constellationTreeReticleSprite.scale.x = pulseScale;
                this._constellationTreeReticleSprite.scale.y = pulseScale;
            }
            if (this._constellationFocus === 'grid' && this._constellationGridReticleSprite) {
                this._constellationGridReticleSprite.scale.x = pulseScale;
                this._constellationGridReticleSprite.scale.y = pulseScale;
            }
            this.updateConstellationCatRibbons();
        } else if (this._activeJournalTab === 5 && this._focusMode === 'slots') {
            var pulseScale = 1.0 + Math.sin(this._pulseTimer * 0.12) * 0.035;
            if (this._archiveReticleSprite && this._archiveReticleSprite.visible) {
                this._archiveReticleSprite.scale.x = pulseScale;
                this._archiveReticleSprite.scale.y = pulseScale;
            }
        }

        // Posisi Pita Bookmark Skill Tunggal Tetap Stabil (Tanpa Animasi)
        if (this._skillSingleRibbonSprite && this._activeJournalTab === 3) {
            var cfg = STATUS_JOURNAL_CONFIG.skillJournal;
            var ribCfg = (cfg && cfg.ribbons) || { x: 268, y: 12 };
            this._skillSingleRibbonSprite.x = ribCfg.x !== undefined ? ribCfg.x : 268;
            this._skillSingleRibbonSprite.y = ribCfg.y !== undefined ? ribCfg.y : 12;
        }

        // Live Mouse Hover pada Constellation (Tab 4)
        if (this._activeJournalTab === 4 && hasLiveMouse && this._focusMode === 'slots') {
            var clx = hmx - 239;
            var cly = hmy - 21;
            var crx = hmx - 746;
            var cry = hmy - 23;
            var cCfg = STATUS_JOURNAL_CONFIG.constellationJournal || {};

            // Hover di pohon 5 node (Halaman Kiri)
            var cTreeCfg = cCfg.tree || { x: 43, y: 18 };
            var cNodes = cCfg.treeNodes || [];
            var foundHover = false;
            for (var ni = 0; ni < cNodes.length; ni++) {
                var nd = cNodes[ni];
                var nLeft = cTreeCfg.x + nd.x;
                var nTop = cTreeCfg.y + nd.y;
                if (clx >= nLeft && clx <= nLeft + nd.w && cly >= nTop && cly <= nTop + nd.h) {
                    if (this._constellationFocus !== 'tree' || this._constellationNodeIndex !== ni) {
                        this._constellationFocus = 'tree';
                        this._constellationNodeIndex = ni;
                        this.updateConstellationReticles();
                    }
                    foundHover = true;
                    break;
                }
            }

            // Hover di 3 pita kategori (Halaman Kanan)
            if (!foundHover && this._constellationCatRibbonSprites) {
                var cRibCfg = cCfg.categoryRibbons || { startX: 295, spacing: 70 };
                var rStartX = cRibCfg.startX || 295;
                var rSpacing = cRibCfg.spacing || 70;
                for (var ri = 0; ri < 3; ri++) {
                    var rx = rStartX + ri * rSpacing;
                    if (crx >= rx - 25 && crx <= rx + 25 && cry >= 0 && cry <= 155) {
                        if (this._constellationCatIndex !== ri) {
                            this._constellationCatIndex = ri;
                            this.drawConstellationGrid();
                        }
                        foundHover = true;
                        break;
                    }
                }
            }

            // Hover di grid 20 slot (Halaman Kanan)
            if (!foundHover) {
                var cgCfg = cCfg.grid || { startX: 12, startY: 146, cols: 4, rows: 5, spacingX: 122, spacingY: 98, slotW: 108, slotH: 92 };
                for (var gr = 0; gr < cgCfg.rows; gr++) {
                    for (var gc = 0; gc < cgCfg.cols; gc++) {
                        var sX = cgCfg.startX + gc * cgCfg.spacingX;
                        var sY = cgCfg.startY + gr * cgCfg.spacingY;
                        if (crx >= sX && crx <= sX + cgCfg.slotW && cry >= sY && cry <= sY + cgCfg.slotH) {
                            var slotI = gr * cgCfg.cols + gc;
                            if (this._constellationFocus !== 'grid' || this._constellationGridIndex !== slotI) {
                                this._constellationFocus = 'grid';
                                this._constellationGridIndex = slotI;
                                this.updateConstellationReticles();
                            }
                            foundHover = true;
                            break;
                        }
                    }
                    if (foundHover) break;
                }
            }

            // Deteksi jika mouse berpindah ke ruang kosong di luar slot
            if (this._lastTrackMouseX !== _journalRealMouseX || this._lastTrackMouseY !== _journalRealMouseY) {
                this._lastTrackMouseX = _journalRealMouseX;
                this._lastTrackMouseY = _journalRealMouseY;
                if (!foundHover && hasLiveMouse) {
                    this._constellationMouseOff = true;
                } else if (foundHover) {
                    this._constellationMouseOff = false;
                }
            }
        }

        // Live Popup Tooltip Detail Skill Constellation (Tab 4)
        if (this._activeJournalTab === 4) {
            this.updateConstellationSkillPopup();
        } else if (this._constellationSkillPopupSprite && this._constellationSkillPopupSprite.visible) {
            this._constellationSkillPopupSprite.visible = false;
            this._lastConstellationPopupSkillId = null;
        }

        // 4. Efek Api Nyala Jiwa Cyclops (Fisika Lidah Api Alami & Berkedut Hidup/Mati)
        this.updateSoulFlameAnimation();

        // 5. Drawer Lerp Scroll
        if (this._drawerActive && this._drawerSprite) {
            if (this._drawerSprite.opacity < 255) {
                this._drawerSprite.opacity = Math.min(255, this._drawerSprite.opacity + 35);
            }
            var diff = this._drawerTargetScrollX - this._drawerScrollX;
            if (Math.abs(diff) > 0.5) {
                this._drawerScrollX += diff * 0.28;
                this.drawDrawerContent();
            } else {
                this._drawerScrollX = this._drawerTargetScrollX;
            }
        }

        // 6. Toast Timer
        if (this._toastTimer > 0) {
            this._toastTimer--;
            if (this._toastTimer === 0) {
                if (this._activeJournalTab === 0) this.drawLinedNote();
                else this.drawItemDetails();
            }
        }

        this.handleTouchInput();
        this.handleKeyboardInput();
    };

    Scene_StatusJournal.prototype.handleTouchInput = function() {
        if (this._isClosing) return;
        if (this._isOpening) {
            if (TouchInput.isTriggered()) {
                this._openProgress = 1.0;
                this.updateOpenAnimation();
            } else {
                return;
            }
        }
        if (!TouchInput.isTriggered()) return;
        var scale = this._journalScale || 1;
        var root = this._journalRoot || { x: 0, y: 0 };
        var mx = (TouchInput.x - root.x) / scale;
        var my = (TouchInput.y - root.y) / scale;

        // Klik pada Pita Menu di Sisi Kiri
        if (mx < 239) {
            for (var r = 0; r < RIBBON_TABS.length; r++) {
                var rb = RIBBON_TABS[r];
                if (Math.abs(my - (rb.y + 40)) <= 32) {
                    SoundManager.playOk();
                    this._selectedRibbonIndex = r;
                    this.onRibbonCursorChanged();
                    this.activateRibbonTab(r);
                    return;
                }
            }
        }

        // Klik di Modal Target Item
        if (this._focusMode === 'targetSelect') {
            var modalX = this._itemTargetModal.x;
            var modalY = this._itemTargetModal.y;
            var members = $gameParty.members();
            for (var m = 0; m < members.length; m++) {
                var itemY = modalY + 48 + m * 46;
                if (mx >= modalX + 20 && mx <= modalX + 360 && my >= itemY && my <= itemY + 38) {
                    this._targetActorIndex = m;
                    this.applyCurrentItemToTarget();
                    return;
                }
            }
            this.closeItemTargetModal();
            return;
        }

        // Klik di Modal Equip Skill Battle
        if (this._focusMode === 'skillEquipModal') {
            var modalX = this._skillEquipModal.x;
            var modalY = this._skillEquipModal.y;
            var actor = this._actor || $gameParty.menuActor();
            var currentSkill = this.getCurrentSkill();
            var equipped = (actor && actor.pethogsEquippedSkills) ? actor.pethogsEquippedSkills() : [0,0,0,0,0];
            var isAlreadyEquipped = currentSkill && equipped.indexOf(currentSkill.id) !== -1;
            var totalOptions = isAlreadyEquipped ? 6 : 5;

            for (var o = 0; o < totalOptions; o++) {
                var itemY = modalY + 60 + o * 44;
                if (mx >= modalX + 18 && mx <= modalX + 422 && my >= itemY && my <= itemY + 38) {
                    this._skillEquipIndex = o;
                    this.confirmSkillEquipModal();
                    return;
                }
            }
            this.closeSkillEquipModal();
            return;
        }

        // Klik di Modal Pilihan Aksi Skill (Gunakan / Pasang)
        if (this._focusMode === 'skillActionModal') {
            var modalX = this._skillActionModal.x;
            var modalY = this._skillActionModal.y;
            for (var a = 0; a < 3; a++) {
                var itemY = modalY + 60 + a * 48;
                if (mx >= modalX + 18 && mx <= modalX + 402 && my >= itemY && my <= itemY + 42) {
                    this._skillActionIndex = a;
                    this.confirmSkillActionModal();
                    return;
                }
            }
            this.closeSkillActionModal();
            return;
        }

        // Klik di Modal Pemilihan Target Skill
        if (this._focusMode === 'skillTargetSelect') {
            var modalX = this._itemTargetModal.x;
            var modalY = this._itemTargetModal.y;
            var members = $gameParty.members();
            for (var m = 0; m < members.length; m++) {
                var itemY = modalY + 48 + m * 46;
                if (mx >= modalX + 20 && mx <= modalX + 360 && my >= itemY && my <= itemY + 38) {
                    this._targetActorIndex = m;
                    this.applyCurrentSkillToTarget();
                    return;
                }
            }
            this.closeSkillTargetModal();
            return;
        }

        // Klik di Halaman Constellation (Tab 4)
        if (this._activeJournalTab === 4) {
            this.handleConstellationTouch(mx, my);
            return;
        }

        // Klik di Halaman Archive (Tab 5)
        if (this._activeJournalTab === 5) {
            this.handleArchiveTouch(mx, my);
            return;
        }

        // Klik di Halaman Item
        if (this._activeJournalTab === 1) {
            var cfg = STATUS_JOURNAL_CONFIG.itemJournal.grid;
            var lx = mx - 239;
            var ly = my - 21;
            if (lx >= cfg.startX && ly >= cfg.startY) {
                var col = Math.floor((lx - cfg.startX) / cfg.spacingX);
                var row = Math.floor((ly - cfg.startY) / cfg.spacingY);
                if (col >= 0 && col < cfg.cols && row >= 0 && row < cfg.rows) {
                    var clickedSlot = row * cfg.cols + col;
                    if (this._itemSlotIndex === clickedSlot && this._focusMode === 'slots') {
                        this.tryUseCurrentItem();
                    } else {
                        SoundManager.playCursor();
                        this._itemSlotIndex = clickedSlot;
                        this._focusMode = 'slots';
                        this.drawItemGrid();
                        this.drawItemDetails();
                        this.updateRibbonTargets();
                    }
                    return;
                }
            }
        }

        // Klik di Halaman Skills
        if (this._activeJournalTab === 3) {
            // 1. Klik pada Pita Bookmark Skill Tunggal di Pojok Kiri Atas (Ganti Kategori Skill)
            if (this._skillSingleRibbonSprite && this._skillSingleRibbonSprite.visible) {
                var cfg = STATUS_JOURNAL_CONFIG.skillJournal;
                var ribCfg = (cfg && cfg.ribbons) || { x: 268, y: 12 };
                var rx = ribCfg.x !== undefined ? ribCfg.x : 268;
                var ry = ribCfg.y !== undefined ? ribCfg.y : 12;
                // Hitbox ribbon di pojok kiri atas (lebar 49px: rx - 25 sampai rx + 25, y dari ry sampai ry + 160)
                if (mx >= rx - 25 && mx <= rx + 25 && my >= Math.max(0, ry) && my <= ry + 160) {
                    this.nextSkillRibbon();
                    return;
                }
            }

            // 2. Klik pada Header Karakter (Ganti Aktor)
            if (mx >= 239 && mx <= 747 && my >= 21 && my <= 53) {
                this.nextActor();
                return;
            }

            // 3. Klik pada Nav Bar Bawah (◄ Q  /  W ▶)
            if (my >= 645 && my <= 685) {
                if (mx >= 239 + 170 && mx <= 239 + 230) {
                    this.previousSkillRibbon();
                    return;
                } else if (mx >= 239 + 280 && mx <= 239 + 345) {
                    this.nextSkillRibbon();
                    return;
                }
            }

            // 4. Klik pada Grid 24 Slot Skill
            var cfg = STATUS_JOURNAL_CONFIG.skillJournal.grid;
            var lx = mx - 239;
            var ly = my - 21;
            if (lx >= cfg.startX && ly >= cfg.startY) {
                var col = Math.floor((lx - cfg.startX) / cfg.spacingX);
                var row = Math.floor((ly - cfg.startY) / cfg.spacingY);
                if (col >= 0 && col < cfg.cols && row >= 0 && row < cfg.rows) {
                    var clickedSlot = row * cfg.cols + col;
                    if (this._skillSlotIndex === clickedSlot) {
                        this.onSkillSlotOk();
                        return;
                    }
                    SoundManager.playCursor();
                    this._skillSlotIndex = clickedSlot;
                    this._focusMode = 'slots';
                    this.drawSkillGrid();
                    this.drawSkillDetails();
                    this.updateSkillReticlePosition();
                    return;
                }
            }

            // 5. Klik pada 5 Slot Battle Terpasang di Bagian Bawah Kertas Deskripsi
            var descCfg = STATUS_JOURNAL_CONFIG.skillJournal.description;
            var paperX = 746 + descCfg.x;
            var paperY = 23 + descCfg.y;
            var startY = descCfg.textY;
            var lh = descCfg.lineHeight || 34;

            for (var si = 0; si < 5; si++) {
                var slotColX = paperX + descCfg.textX + (si % 3) * 142;
                var slotRowY = paperY + startY + 5 * lh + 18 + Math.floor(si / 3) * 25;
                if (mx >= slotColX && mx <= slotColX + 138 && my >= slotRowY && my <= slotRowY + 22) {
                    this.interactBattleSlot(si);
                    return;
                }
            }
        }

        // Klik di Halaman Party
        if (this._activeJournalTab === 2) {
            var lx = mx - 239;
            var ly = my - 21;
            var rowYs = [12, 230, 448];
            for (var r = 0; r < 3; r++) {
                var ry = rowYs[r];
                if (lx >= 10 && lx <= 500 && ly >= ry && ly <= ry + 210) {
                    if (this._partySubMode === 'picker') {
                        this._partySubMode = 'slots';
                    }
                    if (this._selectedPartyRow === r) {
                        if (lx >= 208) {
                            SoundManager.playCursor();
                            this._partyNoteMode = (this._partyNoteMode === 'stats' ? 'profile' : 'stats');
                            this.drawPartyLeftPage();
                        } else if (r > 0) {
                            SoundManager.playOk();
                            this._partySubMode = 'picker';
                            this._partyPickerIndex = 0;
                            this.updatePartyReticlePosition();
                            this.drawPartyRightPage();
                            this.drawFooterGuide();
                        } else {
                            SoundManager.playBuzzer();
                        }
                    } else {
                        SoundManager.playCursor();
                        this._selectedPartyRow = r;
                        this._focusMode = 'slots';
                        this.updatePartyReticlePosition();
                        this.drawFooterGuide();
                    }
                    return;
                }
            }

            if (this._partySubMode === 'picker') {
                var rx = mx - 746;
                var ry = my - 23;
                var cands = this.getPartyCandidates();
                for (var c = 0; c < cands.length; c++) {
                    var cand = cands[c];
                    if (rx >= cand.x && rx <= cand.x + 187 && ry >= cand.y && ry <= cand.y + 205) {
                        if (this._partyPickerIndex === c) {
                            this.applyPartySelection();
                        } else {
                            SoundManager.playCursor();
                            this._partyPickerIndex = c;
                            this.updatePartyReticlePosition();
                            this.drawPartyRightPage();
                        }
                        return;
                    }
                }
            }
        }

        // Klik di Halaman Status
        if (this._activeJournalTab === 0) {
            var rx = mx - 746;
            var ry = my - 23;

            // Penanganan Touch / Click langsung pada Drawer Perlengkapan (Carousel Slider)
            if (this._focusMode === 'drawer' && this._drawerActive) {
                var dwX = 0;
                var dwY = 248;
                var dwW = 490;
                var dwH = 84;
                if (rx >= dwX && rx <= dwX + dwW && ry >= dwY && ry <= dwY + dwH) {
                    var localX = rx - dwX;
                    var cx = 258;
                    // Klik panah ◀ (mundur 1 item)
                    if (localX >= cx - 55 && localX <= cx - 26) {
                        if (this._drawerIndex > 0) {
                            SoundManager.playCursor();
                            this._drawerIndex--;
                            this._drawerTargetScrollX = this._drawerIndex * 64;
                            this._cachedPreviewKey = null;
                            this._cachedPreviewActor = null;
                            this.drawLinedNote();
                            this.drawDrawerContent();
                        }
                        return;
                    }
                    // Klik panah ▶ (maju 1 item)
                    if (localX >= cx + 26 && localX <= cx + 55) {
                        if (this._drawerIndex < this._drawerItems.length - 1) {
                            SoundManager.playCursor();
                            this._drawerIndex++;
                            this._drawerTargetScrollX = this._drawerIndex * 64;
                            this._cachedPreviewKey = null;
                            this._cachedPreviewActor = null;
                            this.drawLinedNote();
                            this.drawDrawerContent();
                        }
                        return;
                    }
                    // Klik langsung pada item di baris slider
                    var clickedIdx = Math.round((localX - cx + this._drawerScrollX) / 64);
                    if (clickedIdx >= 0 && clickedIdx < this._drawerItems.length) {
                        if (clickedIdx === this._drawerIndex) {
                            // Tap item yang sedang terpilih = Konfirmasi Equip
                            this.applyDrawerEquip();
                        } else {
                            SoundManager.playCursor();
                            this._drawerIndex = clickedIdx;
                            this._drawerTargetScrollX = this._drawerIndex * 64;
                            this._cachedPreviewKey = null;
                            this._cachedPreviewActor = null;
                            this.drawLinedNote();
                            this.drawDrawerContent();
                        }
                        return;
                    }
                    return;
                } else {
                    // Tap di luar area drawer saat drawer aktif = Tutup drawer
                    this.closeDrawer();
                    return;
                }
            }

            // Klik langsung pada Api Jiwa Cyclops (Soul Flame) -> fokus ke Slot Souls
            var eyeCoord = STATUS_JOURNAL_CONFIG.soulEye || { x: 252, y: 159 };
            if (Math.hypot(rx - eyeCoord.x, ry - eyeCoord.y) <= 45) {
                SoundManager.playCursor();
                this._selectedSlotIndex = 0; // Slot Souls
                this._focusMode = 'slots';
                this.refreshRightPage();
                this.drawLinedNote();
                this.updateRibbonTargets();
                return;
            }
            for (var s = 0; s < JOURNAL_SLOTS.length; s++) {
                var slot = JOURNAL_SLOTS[s];
                var dist = Math.hypot(rx - slot.x, ry - slot.y);
                if (dist <= 30) {
                    if (this._selectedSlotIndex === s && this._focusMode === 'slots') {
                        this.openDrawer();
                    } else {
                        SoundManager.playCursor();
                        this._selectedSlotIndex = s;
                        this._focusMode = 'slots';
                        this.refreshRightPage();
                        this.drawLinedNote();
                        this.updateRibbonTargets();
                    }
                    return;
                }
            }
        }
    };

    Scene_StatusJournal.prototype.handleKeyboardInput = function() {
        if (this._isClosing) return;
        if (this._isOpening) {
            if (Input.isTriggered('down') || Input.isTriggered('up') || Input.isTriggered('left') || Input.isTriggered('right') || Input.isTriggered('ok') || Input.isTriggered('cancel') || Input.isTriggered('tab')) {
                this._openProgress = 1.0;
                this.updateOpenAnimation();
            } else {
                return;
            }
        }

        // Shift key preview note
        var shiftPressed = Input.isPressed('shift');
        if (shiftPressed !== this._shiftActive) {
            this._shiftActive = shiftPressed;
            if (this._activeJournalTab === 0) this.drawLinedNote();
        }

        // Mode 1: Modal Pemilihan Target Item
        if (this._focusMode === 'targetSelect') {
            var members = $gameParty.members();
            if (Input.isRepeated('down')) {
                SoundManager.playCursor();
                this._targetActorIndex = (this._targetActorIndex + 1) % members.length;
                this.drawItemTargetModal();
            } else if (Input.isRepeated('up')) {
                SoundManager.playCursor();
                this._targetActorIndex = (this._targetActorIndex + members.length - 1) % members.length;
                this.drawItemTargetModal();
            } else if (Input.isTriggered('ok')) {
                this.applyCurrentItemToTarget();
            } else if (Input.isTriggered('cancel')) {
                SoundManager.playCancel();
                this.closeItemTargetModal();
            }
            return;
        }

        // Mode 1b: Modal Pemilihan Slot Equip Skill Battle (1 - 5)
        if (this._focusMode === 'skillEquipModal') {
            var actor = this._actor || $gameParty.menuActor();
            var currentSkill = this.getCurrentSkill();
            var equipped = (actor && actor.pethogsEquippedSkills) ? actor.pethogsEquippedSkills() : [0,0,0,0,0];
            var isAlreadyEquipped = currentSkill && equipped.indexOf(currentSkill.id) !== -1;
            var totalOptions = isAlreadyEquipped ? 6 : 5;

            if (Input.isRepeated('down')) {
                SoundManager.playCursor();
                this._skillEquipIndex = (this._skillEquipIndex + 1) % totalOptions;
                this.drawSkillEquipModal();
            } else if (Input.isRepeated('up')) {
                SoundManager.playCursor();
                this._skillEquipIndex = (this._skillEquipIndex + totalOptions - 1) % totalOptions;
                this.drawSkillEquipModal();
            } else if (Input.isTriggered('ok')) {
                this.confirmSkillEquipModal();
            } else if (Input.isTriggered('cancel')) {
                SoundManager.playCancel();
                this.closeSkillEquipModal();
            }
            return;
        }

        // Mode 1c: Modal Pilihan Aksi Skill (Gunakan / Pasang)
        if (this._focusMode === 'skillActionModal') {
            if (Input.isRepeated('down')) {
                SoundManager.playCursor();
                this._skillActionIndex = (this._skillActionIndex + 1) % 3;
                this.drawSkillActionModal();
            } else if (Input.isRepeated('up')) {
                SoundManager.playCursor();
                this._skillActionIndex = (this._skillActionIndex + 2) % 3;
                this.drawSkillActionModal();
            } else if (Input.isTriggered('ok')) {
                this.confirmSkillActionModal();
            } else if (Input.isTriggered('cancel')) {
                SoundManager.playCancel();
                this.closeSkillActionModal();
            }
            return;
        }

        // Mode 1d: Modal Target Penggunaan Skill pada Karakter
        if (this._focusMode === 'skillTargetSelect') {
            var members = $gameParty.members();
            if (Input.isRepeated('down')) {
                SoundManager.playCursor();
                this._targetActorIndex = (this._targetActorIndex + 1) % members.length;
                this.drawSkillTargetModal();
            } else if (Input.isRepeated('up')) {
                SoundManager.playCursor();
                this._targetActorIndex = (this._targetActorIndex + members.length - 1) % members.length;
                this.drawSkillTargetModal();
            } else if (Input.isTriggered('ok')) {
                this.applyCurrentSkillToTarget();
            } else if (Input.isTriggered('cancel')) {
                SoundManager.playCancel();
                this.closeSkillTargetModal();
            }
            return;
        }

        // Mode 2: Drawer Perlengkapan Status
        if (this._focusMode === 'drawer') {
            if (Input.isRepeated('right')) {
                if (this._drawerIndex < this._drawerItems.length - 1) {
                    SoundManager.playCursor();
                    this._drawerIndex++;
                    this._drawerTargetScrollX = this._drawerIndex * 64;
                    this._cachedPreviewKey = null;
                    this._cachedPreviewActor = null;
                    this.drawLinedNote();
                    this.drawDrawerContent();
                }
            } else if (Input.isRepeated('left')) {
                if (this._drawerIndex > 0) {
                    SoundManager.playCursor();
                    this._drawerIndex--;
                    this._drawerTargetScrollX = this._drawerIndex * 64;
                    this._cachedPreviewKey = null;
                    this._cachedPreviewActor = null;
                    this.drawLinedNote();
                    this.drawDrawerContent();
                }
            } else if (Input.isTriggered('ok')) {
                this.applyDrawerEquip();
            } else if (Input.isTriggered('cancel')) {
                this.closeDrawer();
            }
            return;
        }

        // Mode 3: Navigasi Pita Menu Kiri (Live Page-Turn)
        if (this._focusMode === 'ribbon') {
            if (Input.isRepeated('down')) {
                SoundManager.playCursor();
                this._selectedRibbonIndex = (this._selectedRibbonIndex + 1) % RIBBON_TABS.length;
                this.onRibbonCursorChanged();
            } else if (Input.isRepeated('up')) {
                SoundManager.playCursor();
                this._selectedRibbonIndex = (this._selectedRibbonIndex + RIBBON_TABS.length - 1) % RIBBON_TABS.length;
                this.onRibbonCursorChanged();
            } else if (Input.isTriggered('ok') || Input.isRepeated('right') || Input.isTriggered('right')) {
                if (this._selectedRibbonIndex <= 5) {
                    if (this._activeJournalTab !== this._selectedRibbonIndex) {
                        var dir = this._selectedRibbonIndex > this._activeJournalTab ? 1 : -1;
                        this.turnToTab(this._selectedRibbonIndex, dir);
                    }
                    this.focusPageSlots();
                } else {
                    this.activateRibbonTab(this._selectedRibbonIndex);
                }
            } else if (Input.isTriggered('cancel') || (Input.isTriggered('statusJournal') && (!this._openKeyCooldown || this._openKeyCooldown <= 0))) {
                this.popScene();
            }
            return;
        }

        // Mode 4: Navigasi Isi Halaman (Slots)
        if (this._focusMode === 'slots') {
            // Kembali ke menu pita dengan tombol TAB atau ESC/Cancel (kecuali saat di party picker mode, constellation, atau archive)
            var shouldInterceptCancel = (this._activeJournalTab !== 2 || this._partySubMode !== 'picker')
                && this._activeJournalTab !== 4
                && this._activeJournalTab !== 5;
            if (Input.isTriggered('tab') || (Input.isTriggered('cancel') && shouldInterceptCancel)) {
                this.focusRibbons();
                return;
            }

            // Tombol I langsung menutup jurnal dari mana saja
            if (Input.isTriggered('statusJournal') && (!this._openKeyCooldown || this._openKeyCooldown <= 0)) {
                this.popScene();
                return;
            }

            // Ganti karakter dengan Q / W / 1-4 (pada status) atau ganti halaman (pada item)
            if (this._activeJournalTab === 0) {
                if (Input.isTriggered('pageup')) {
                    this.previousActor();
                } else if (Input.isTriggered('pagedown')) {
                    this.nextActor();
                } else if (Input.isTriggered('actor_1')) {
                    this.changeToActorIndex(0);
                } else if (Input.isTriggered('actor_2')) {
                    this.changeToActorIndex(1);
                } else if (Input.isTriggered('actor_3')) {
                    this.changeToActorIndex(2);
                } else if (Input.isTriggered('actor_4')) {
                    this.changeToActorIndex(3);
                }
            } else if (this._activeJournalTab === 1) {
                if (Input.isTriggered('pageup')) {
                    this.previousItemPage();
                } else if (Input.isTriggered('pagedown')) {
                    this.nextItemPage();
                }
            }

            // Navigasi Slot pada Status (Akurat 100% dengan Adjacency Graph Deterministik)
            if (this._activeJournalTab === 0) {
                if (Input.isRepeated('left')) {
                    this.navigateStatusSlot('left');
                } else if (Input.isRepeated('right')) {
                    this.navigateStatusSlot('right');
                } else if (Input.isRepeated('up')) {
                    this.navigateStatusSlot('up');
                } else if (Input.isRepeated('down')) {
                    this.navigateStatusSlot('down');
                } else if (Input.isTriggered('ok')) {
                    this.openDrawer();
                }
            }

            // Navigasi Halaman Party
            if (this._activeJournalTab === 2) {
                this.handlePartyInput();
            }

            // Navigasi Halaman Constellation (Tab 4)
            if (this._activeJournalTab === 4) {
                this.handleConstellationInput();
            }

            // Navigasi Halaman Archive (Tab 5)
            if (this._activeJournalTab === 5) {
                this.handleArchiveInput();
            }

            // Navigasi Halaman Skills (Q / W Ganti Kategori Pita, Shift Ganti Aktor, Panah Navigasi Grid)
            if (this._activeJournalTab === 3) {
                if (Input.isTriggered('pageup')) {
                    this.previousSkillRibbon();
                } else if (Input.isTriggered('pagedown')) {
                    this.nextSkillRibbon();
                } else if (Input.isTriggered('shift') || Input.isTriggered('tab')) {
                    this.nextActor();
                } else if (Input.isTriggered('actor_1')) {
                    this.changeToActorIndex(0);
                } else if (Input.isTriggered('actor_2')) {
                    this.changeToActorIndex(1);
                } else if (Input.isTriggered('actor_3')) {
                    this.changeToActorIndex(2);
                } else if (Input.isTriggered('actor_4')) {
                    this.changeToActorIndex(3);
                }

                var cfg = STATUS_JOURNAL_CONFIG.skillJournal.grid;
                var col = this._skillSlotIndex % cfg.cols;
                var row = Math.floor(this._skillSlotIndex / cfg.cols);

                if (Input.isRepeated('left')) {
                    if (col === 0) {
                        this.focusRibbons();
                        return;
                    }
                    SoundManager.playCursor();
                    this._skillSlotIndex--;
                    this.updateSkillReticlePosition();
                    this.drawSkillDetails();
                } else if (Input.isRepeated('right')) {
                    if (col < cfg.cols - 1 && this._skillSlotIndex + 1 < 24) {
                        SoundManager.playCursor();
                        this._skillSlotIndex++;
                        this.updateSkillReticlePosition();
                        this.drawSkillDetails();
                    }
                } else if (Input.isRepeated('up')) {
                    if (row > 0) {
                        SoundManager.playCursor();
                        this._skillSlotIndex -= cfg.cols;
                        this.updateSkillReticlePosition();
                        this.drawSkillDetails();
                    }
                } else if (Input.isRepeated('down')) {
                    if (row < cfg.rows - 1 && this._skillSlotIndex + cfg.cols < 24) {
                        SoundManager.playCursor();
                        this._skillSlotIndex += cfg.cols;
                        this.updateSkillReticlePosition();
                        this.drawSkillDetails();
                    }
                } else if (Input.isTriggered('ok')) {
                    this.onSkillSlotOk();
                }
            }

            // Navigasi Slot pada Item (Grid 4 Kolom x 6 Baris = 24 Slot)
            if (this._activeJournalTab === 1) {
                var cfg = STATUS_JOURNAL_CONFIG.itemJournal.grid;
                var col = this._itemSlotIndex % cfg.cols;
                var row = Math.floor(this._itemSlotIndex / cfg.cols);

                if (Input.isRepeated('left')) {
                    if (col === 0) {
                        this.focusRibbons(); // Geser ke pita jika di kolom paling kiri!
                        return;
                    }
                    SoundManager.playCursor();
                    this._itemSlotIndex--;
                    this.updateItemReticlePosition();
                    this.drawItemDetails();
                } else if (Input.isRepeated('right')) {
                    if (col < cfg.cols - 1 && this._itemSlotIndex + 1 < 24) {
                        SoundManager.playCursor();
                        this._itemSlotIndex++;
                        this.updateItemReticlePosition();
                        this.drawItemDetails();
                    }
                } else if (Input.isRepeated('up')) {
                    if (row > 0) {
                        SoundManager.playCursor();
                        this._itemSlotIndex -= cfg.cols;
                        this.updateItemReticlePosition();
                        this.drawItemDetails();
                    }
                } else if (Input.isRepeated('down')) {
                    if (row < cfg.rows - 1 && this._itemSlotIndex + cfg.cols < 24) {
                        SoundManager.playCursor();
                        this._itemSlotIndex += cfg.cols;
                        this.updateItemReticlePosition();
                        this.drawItemDetails();
                    }
                } else if (Input.isTriggered('ok')) {
                    this.tryUseCurrentItem();
                }
            }
        }
    };

    // Peta Tetangga Slot Status (0=Acc1, 1=Souls, 2=Acc2, 3=Seal1, 4=Seal2, 5=Cat1, 6=Cat2)
    var STATUS_SLOT_GRAPH = {
        0: { right: 1, down: 3, up: 5, left: 'ribbon' },
        1: { left: 0, right: 2, down: 3, up: null },
        2: { left: 1, down: 4, up: 6, right: null },
        3: { up: 0, right: 4, down: 5, left: 'ribbon' },
        4: { up: 2, left: 3, down: 6, right: null },
        5: { up: 3, right: 6, down: 0, left: 'ribbon' },
        6: { up: 4, left: 5, down: 2, right: null }
    };

    Scene_StatusJournal.prototype.navigateStatusSlot = function(dir) {
        var map = STATUS_SLOT_GRAPH[this._selectedSlotIndex];
        if (!map) return;
        var next = map[dir];
        if (next === 'ribbon') {
            this.focusRibbons();
            return;
        }
        if (next !== null && next !== undefined && next >= 0 && next < JOURNAL_SLOTS.length) {
            SoundManager.playCursor();
            this._selectedSlotIndex = next;
            var cur = JOURNAL_SLOTS[next];
            if (this._slotReticleSprite && cur) {
                this._slotReticleSprite.x = cur.x;
                this._slotReticleSprite.y = cur.y;
                this._slotReticleSprite.visible = true;
            }
            this.refreshRightPage();
            this.drawLinedNote();
        }
    };

    Scene_StatusJournal.prototype.previousItemPage = function() {
        var items = this.getItemList();
        var totalPages = Math.max(1, Math.ceil(items.length / 24));
        if (totalPages > 1) {
            SoundManager.playCursor();
            this._itemPageIndex = (this._itemPageIndex + totalPages - 1) % totalPages;
            this.drawItemGrid();
            this.drawItemDetails();
            this.updateItemReticlePosition();
        }
    };

    Scene_StatusJournal.prototype.nextItemPage = function() {
        var items = this.getItemList();
        var totalPages = Math.max(1, Math.ceil(items.length / 24));
        if (totalPages > 1) {
            SoundManager.playCursor();
            this._itemPageIndex = (this._itemPageIndex + 1) % totalPages;
            this.drawItemGrid();
            this.drawItemDetails();
            this.updateItemReticlePosition();
        }
    };

    Scene_StatusJournal.prototype.previousActor = function() {
        $gameParty.makeMenuActorPrevious();
        this.updateActor();
        this.onActorChange();
    };

    Scene_StatusJournal.prototype.nextActor = function() {
        $gameParty.makeMenuActorNext();
        this.updateActor();
        this.onActorChange();
    };

    Scene_StatusJournal.prototype.changeToActorIndex = function(idx) {
        var members = $gameParty.members();
        if (idx >= 0 && idx < members.length) {
            $gameParty.setMenuActor(members[idx]);
            this.updateActor();
            this.onActorChange();
        }
    };

    Scene_StatusJournal.prototype.onActorChange = function() {
        SoundManager.playCursor();
        this.refreshStatusPage();
        this.refreshSkillPage();
        if (typeof this.refreshConstellationPage === 'function') {
            this.refreshConstellationPage();
        }
    };

    // ========================================================================
    // SCENE_ITEMJOURNAL (Subclass yang Membuka Jurnal Langsung pada Tab Item)
    // ========================================================================
    function Scene_ItemJournal() {
        this.initialize.apply(this, arguments);
    }

    Scene_ItemJournal.prototype = Object.create(Scene_StatusJournal.prototype);
    Scene_ItemJournal.prototype.constructor = Scene_ItemJournal;

    Scene_ItemJournal.prototype.initialize = function() {
        this._initialTab = 1; // Mulai langsung di Tab Item (1)
        Scene_StatusJournal.prototype.initialize.call(this);
    };

    // ========================================================================
    // GLOBAL EXPORTS
    // ========================================================================
    // ========================================================================
    // SCENE_PARTYJOURNAL (Subclass yang Membuka Jurnal Langsung pada Tab Party)
    // ========================================================================
    function Scene_PartyJournal() {
        this.initialize.apply(this, arguments);
    }

    Scene_PartyJournal.prototype = Object.create(Scene_StatusJournal.prototype);
    Scene_PartyJournal.prototype.constructor = Scene_PartyJournal;

    Scene_PartyJournal.prototype.initialize = function() {
        this._initialTab = 2; // Mulai langsung di Tab Party (2)
        Scene_StatusJournal.prototype.initialize.call(this);
    };

    // ========================================================================
    // SCENE_SKILLJOURNAL (Subclass yang Membuka Jurnal Langsung pada Tab Skills)
    // ========================================================================
    function Scene_SkillJournal() {
        this.initialize.apply(this, arguments);
    }

    Scene_SkillJournal.prototype = Object.create(Scene_StatusJournal.prototype);
    Scene_SkillJournal.prototype.constructor = Scene_SkillJournal;

    Scene_SkillJournal.prototype.initialize = function() {
        this._initialTab = 3; // Mulai langsung di Tab Skills (3)
        Scene_StatusJournal.prototype.initialize.call(this);
    };

    if (typeof window !== 'undefined') {
        window.Scene_StatusJournal = Scene_StatusJournal;
        window.Scene_ItemJournal = Scene_ItemJournal;
        window.Scene_PartyJournal = Scene_PartyJournal;
        window.Scene_SkillJournal = Scene_SkillJournal;
    }

})();



    // ========================================================================
    // LAYER 7D: KONTEN HALAMAN CONSTELLATION (PIXEL-PERFECT MOCKUP)
    // ========================================================================
    Scene_StatusJournal.prototype.createConstellationPageContents = function() {
        this._constellationPageContainer = new Sprite();
        this._constellationPageContainer.visible = false;
        this._journalRoot.addChild(this._constellationPageContainer);

        var cfg = STATUS_JOURNAL_CONFIG.constellationJournal || {};

        // --- HALAMAN KIRI: POHON 5 NODE + 3 PITA PRESET (I, II, III) ---
        this._constellationLeftContainer = new Sprite();
        this._constellationLeftContainer.x = 239;
        this._constellationLeftContainer.y = 21;
        this._constellationPageContainer.addChild(this._constellationLeftContainer);

        // 1. Gambar Dasar Pohon Etsa Kuno (Untitled478_20260923104430.png)
        var treeCfg = cfg.tree || { x: 43, y: 18, w: 422, h: 613 };
        this._constellationTreeSprite = new Sprite();
        this._constellationTreeSprite.x = treeCfg.x;
        this._constellationTreeSprite.y = treeCfg.y;
        this._constellationLeftContainer.addChild(this._constellationTreeSprite);

        // 2. Layer Gambar Ikon 5 Node Slot Pohon
        this._constellationNodesSprite = new Sprite();
        this._constellationNodesSprite.x = treeCfg.x;
        this._constellationNodesSprite.y = treeCfg.y;
        this._constellationNodesSprite.bitmap = new Bitmap(422, 613);
        this._constellationLeftContainer.addChild(this._constellationNodesSprite);

        // 3. Reticle Sorotan Node Pohon (Sudut Emas Terang Berdenyut)
        this._constellationTreeReticleSprite = new Sprite();
        this._constellationTreeReticleSprite.bitmap = new Bitmap(155, 155);
        this._constellationTreeReticleSprite.anchor.x = 0.5;
        this._constellationTreeReticleSprite.anchor.y = 0.5;
        this.drawConstellationTreeReticleGraphic(false);
        this._constellationLeftContainer.addChild(this._constellationTreeReticleSprite);

        // 4. Layer 3 Pita Romawi (I, II, III) di Bagian Bawah Halaman Kiri
        var romCfg = cfg.romanRibbons || { x: 236, y: 510, w: 229, h: 205 };
        this._constellationRomanRibbonsSprite = new Sprite();
        this._constellationRomanRibbonsSprite.x = romCfg.x;
        this._constellationRomanRibbonsSprite.y = romCfg.y;
        this._constellationRomanRibbonsSprite.bitmap = new Bitmap(romCfg.w, romCfg.h);
        this._constellationLeftContainer.addChild(this._constellationRomanRibbonsSprite);

        // --- HALAMAN KANAN: ID CARD AKTOR + 3 PITA KATEGORI + 20 GRID SLOT ---
        this._constellationRightContainer = new Sprite();
        this._constellationRightContainer.x = 746;
        this._constellationRightContainer.y = 23;
        this._constellationPageContainer.addChild(this._constellationRightContainer);

        // 5. Kartu Identitas Aktor (ID Card Battle nia_cardB / sophia_cardB / saki_cardB)
        var cardCfg = cfg.actorCard || { x: 14, y: 8, w: 250, h: 150 };
        this._constellationActorCardSprite = new Sprite();
        this._constellationActorCardSprite.x = cardCfg.x;
        this._constellationActorCardSprite.y = cardCfg.y;
        this._constellationActorCardSprite.bitmap = new Bitmap(250, 150);
        this._constellationRightContainer.addChild(this._constellationActorCardSprite);

        // 6. Tiga Pita Kategori Skill (Attack, Defends, Special) di Kanan Atas
        // Posisi tetap di baseline (posisi on), badan pita diam, hanya ujung bergerak lembut
        this._constellationCatRibbonSprites = [];
        var catCfg = cfg.categoryRibbons || { startX: 295, y: 4, spacing: 70 };
        var catFiles = ['Attack', 'Defends', 'Special'];
        var baseY = catCfg.y !== undefined ? catCfg.y : 4;
        for (var ci = 0; ci < catFiles.length; ci++) {
            var ribSp = new Sprite();
            ribSp.anchor.x = 0.5;
            ribSp.anchor.y = 0.0;
            ribSp.x = (catCfg.startX || 295) + ci * (catCfg.spacing || 70);
            ribSp.y = baseY;
            ribSp.scale.x = 1.0;
            ribSp.scale.y = 1.0;
            ribSp.opacity = (ci === 0) ? 255 : 175;
            ribSp.bitmap = ImageManager.loadJournalSkill(catFiles[ci]);
            this._constellationCatRibbonSprites.push(ribSp);
            this._constellationRightContainer.addChild(ribSp);
        }

        // 7. Grid 20 Slot Skill (4 Kolom x 5 Baris Column_.png)
        this._constellationGridSprite = new Sprite();
        this._constellationGridSprite.x = 0;
        this._constellationGridSprite.y = 0;
        this._constellationGridSprite.bitmap = new Bitmap(508, 668);
        this._constellationRightContainer.addChild(this._constellationGridSprite);

        // 8. Reticle Sorotan Grid Skill
        this._constellationGridReticleSprite = new Sprite();
        var gSlotW = (cfg.grid && cfg.grid.slotW) || 108;
        var gSlotH = (cfg.grid && cfg.grid.slotH) || 92;
        this._constellationGridReticleSprite.bitmap = new Bitmap(gSlotW + 14, gSlotH + 14);
        this._constellationGridReticleSprite.anchor.x = 0.5;
        this._constellationGridReticleSprite.anchor.y = 0.5;
        this.drawSkillReticleGraphicCustom(this._constellationGridReticleSprite.bitmap, gSlotW + 14, gSlotH + 14);
        this._constellationRightContainer.addChild(this._constellationGridReticleSprite);

        // 9. Popup Tooltip Detail Skill (Hover Mouse & Arrow Cursor)
        this._constellationSkillPopupSprite = new Sprite();
        this._constellationSkillPopupSprite.bitmap = new Bitmap(350, 185);
        this._constellationSkillPopupSprite.visible = false;
        this._lastConstellationPopupSkillId = null;
        this._constellationMouseOff = false;
        this._constellationPageContainer.addChild(this._constellationSkillPopupSprite);
    };

    Scene_StatusJournal.prototype.drawConstellationTreeReticleGraphic = function(isEntered) {
        if (!this._constellationTreeReticleSprite || !this._constellationTreeReticleSprite.bitmap) return;
        var bmp = this._constellationTreeReticleSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var w = bmp.width;
        var h = bmp.height;
        ctx.save();

        // Sudut reticle emas terang (selalu jelas & kontras di atas node etsa & border merah)
        ctx.strokeStyle = isEntered ? '#38bdf8' : '#fbbf24';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = isEntered ? 'rgba(56, 189, 248, 0.95)' : 'rgba(251, 191, 36, 0.95)';
        ctx.shadowBlur = 12;

        var cLen = 26;
        var pad = 4;
        ctx.beginPath();
        // Kiri-Atas
        ctx.moveTo(pad, pad + cLen); ctx.lineTo(pad, pad); ctx.lineTo(pad + cLen, pad);
        // Kanan-Atas
        ctx.moveTo(w - pad - cLen, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + cLen);
        // Kiri-Bawah
        ctx.moveTo(pad, h - pad - cLen); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + cLen, h - pad);
        // Kanan-Bawah
        ctx.moveTo(w - pad - cLen, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad - cLen);
        ctx.stroke();

        // Garis tepi halus
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isEntered ? 'rgba(255, 255, 255, 0.85)' : 'rgba(251, 191, 36, 0.4)';
        ctx.strokeRect(pad + 4, pad + 4, w - (pad + 4) * 2, h - (pad + 4) * 2);

        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawSkillReticleGraphicCustom = function(bitmap, w, h) {
        var ctx = bitmap._context;
        bitmap.clear();
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
        ctx.shadowBlur = 8;
        var cLen = 14;
        ctx.beginPath();
        // Kiri-Atas
        ctx.moveTo(4, 4 + cLen); ctx.lineTo(4, 4); ctx.lineTo(4 + cLen, 4);
        // Kanan-Atas
        ctx.moveTo(w - 4 - cLen, 4); ctx.lineTo(w - 4, 4); ctx.lineTo(w - 4, 4 + cLen);
        // Kiri-Bawah
        ctx.moveTo(4, h - 4 - cLen); ctx.lineTo(4, h - 4); ctx.lineTo(4 + cLen, h - 4);
        // Kanan-Bawah
        ctx.moveTo(w - 4 - cLen, h - 4); ctx.lineTo(w - 4, h - 4); ctx.lineTo(w - 4, h - 4 - cLen);
        ctx.stroke();
        ctx.restore();
        bitmap._setDirty();
    };

    // ------------------------------------------------------------------------
    // REFRESH HALAMAN CONSTELLATION LENGKAP
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.refreshConstellationPage = function() {
        this.ensureConstellationActorData();

        var cfg = STATUS_JOURNAL_CONFIG.constellationJournal || {};
        var treeCfg = cfg.tree || { x: 43, y: 18 };
        if (this._constellationTreeSprite) {
            this._constellationTreeSprite.x = treeCfg.x;
            this._constellationTreeSprite.y = treeCfg.y;
        }
        if (this._constellationNodesSprite) {
            this._constellationNodesSprite.x = treeCfg.x;
            this._constellationNodesSprite.y = treeCfg.y;
        }
        var romCfg = cfg.romanRibbons || { x: 236, y: 510 };
        if (this._constellationRomanRibbonsSprite) {
            this._constellationRomanRibbonsSprite.x = romCfg.x;
            this._constellationRomanRibbonsSprite.y = romCfg.y;
        }
        var cardCfg = cfg.actorCard || { x: 14, y: 8 };
        if (this._constellationActorCardSprite) {
            this._constellationActorCardSprite.x = cardCfg.x;
            this._constellationActorCardSprite.y = cardCfg.y;
        }
        this.drawConstellationTree();
        this.drawConstellationNodes();
        this.drawConstellationRomanRibbons();
        this.drawConstellationActorCard();
        this.drawConstellationCategoryRibbons();
        this.drawConstellationGrid();
        this.updateConstellationReticles();
        this._lastConstellationPopupSkillId = null;
        this.updateConstellationSkillPopup();
    };

    Scene_StatusJournal.prototype.ensureConstellationActorData = function() {
        var actor = $gameParty.menuActor();
        if (!actor) return;

        if (actor._constellationActivePreset === undefined) {
            actor._constellationActivePreset = 0; // Default Preset I
        }
        this._constellationRomanIndex = actor._constellationActivePreset;

        if (!actor._constellationPresets) {
            var defaultBaseId = 0;
            var skills = actor.skills ? actor.skills() : [];

            // Cari skill unik / signature karakter
            for (var s = 0; s < skills.length; s++) {
                var sk = skills[s];
                if (sk && (sk.id === 12 || sk.id === 11 || sk.id === 14 || (sk.note && /<unique_skill>/i.test(sk.note)))) {
                    defaultBaseId = sk.id;
                    break;
                }
            }
            if (!defaultBaseId && skills.length > 0) {
                defaultBaseId = skills[0].id;
            }

            actor._constellationBaseSkillId = defaultBaseId;
            actor._constellationPresets = [
                [defaultBaseId, 0, 0, 0, 0], // Preset I
                [defaultBaseId, 0, 0, 0, 0], // Preset II
                [defaultBaseId, 0, 0, 0, 0]  // Preset III
            ];
        } else {
            if (actor._constellationBaseSkillId) {
                actor._constellationPresets[0][0] = actor._constellationBaseSkillId;
                actor._constellationPresets[1][0] = actor._constellationBaseSkillId;
                actor._constellationPresets[2][0] = actor._constellationBaseSkillId;
            }
        }

        if (!actor._constellationPaths) {
            actor._constellationPaths = {};
        }
        this.syncConstellationPaths(actor);
    };

    Scene_StatusJournal.prototype.syncConstellationPaths = function(actor) {
        if (!actor || !actor._constellationPresets) return;
        var pIdx = (actor._constellationActivePreset !== undefined) ? actor._constellationActivePreset : (this._constellationRomanIndex || 0);
        var preset = actor._constellationPresets[pIdx] || [0, 0, 0, 0, 0];
        
        // Bentuk rantai kombo aktif: Node 0 -> Node 1 -> Node 2 -> Node 3 -> Node 4
        actor._constellationPaths = {};
        for (var i = 0; i < 4; i++) {
            var currId = preset[i];
            var nextId = preset[i + 1];
            if (currId && currId > 0 && nextId && nextId > 0) {
                actor._constellationPaths[currId] = [nextId];
            }
        }
    };

    // 1. Gambar Latar Belakang Pohon Etsa
    Scene_StatusJournal.prototype.drawConstellationTree = function() {
        if (!this._constellationTreeSprite) return;
        var treeBmp = ImageManager.loadJournalConstellation('Untitled478_20260923104430');
        if (treeBmp && treeBmp.isReady()) {
            this._constellationTreeSprite.bitmap = treeBmp;
        } else if (treeBmp && !treeBmp.isReady()) {
            this.attachSafeLoadListener(treeBmp, 'const_tree', this.drawConstellationTree);
        }
    };

    // 2. Gambar Ikon Skill pada 5 Node Pohon
    Scene_StatusJournal.prototype.drawConstellationNodes = function() {
        if (!this._constellationNodesSprite) return;
        var bmp = this._constellationNodesSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var actor = $gameParty.menuActor();
        if (!actor) return;

        var cfg = STATUS_JOURNAL_CONFIG.constellationJournal || {};
        var nodes = cfg.treeNodes || [
            { id: 0, x: 74, y: 69, w: 143, h: 143 },
            { id: 1, x: 245, y: 154, w: 143, h: 143 },
            { id: 2, x: 75, y: 258, w: 143, h: 143 },
            { id: 3, x: 244, y: 364, w: 143, h: 143 },
            { id: 4, x: 74, y: 449, w: 143, h: 143 }
        ];

        var pIdx = this._constellationRomanIndex || 0;
        var preset = (actor._constellationPresets && actor._constellationPresets[pIdx]) || [0, 0, 0, 0, 0];

        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            var skillId = preset[i];
            var skill = skillId > 0 ? $dataSkills[skillId] : null;

            if (skill) {
                var size = (n.iconSize || 135);
                var ix = Math.round(n.x + (n.w - size) / 2);
                var iy = Math.round(n.y + (n.h - size) / 2);

                this.drawSingleSkillIconDirect(ctx, skill, ix, iy, size, size);

                // Highlight bingkai magenta tebal pada Node 0 (Root Base)
                if (i === 0) {
                    ctx.save();
                    ctx.strokeStyle = '#e11d48';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    var r = 12;
                    ctx.moveTo(ix + r, iy);
                    ctx.lineTo(ix + size - r, iy);
                    ctx.quadraticCurveTo(ix + size, iy, ix + size, iy + r);
                    ctx.lineTo(ix + size, iy + size - r);
                    ctx.quadraticCurveTo(ix + size, iy + size, ix + size - r, iy + size);
                    ctx.lineTo(ix + r, iy + size);
                    ctx.quadraticCurveTo(ix, iy + size, ix, iy + size - r);
                    ctx.lineTo(ix, iy + r);
                    ctx.quadraticCurveTo(ix, iy, ix + r, iy);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawSingleSkillIconDirect = function(ctx, sk, ix, iy, w, h) {
        if (!sk) return;
        var drawn = false;

        var cIcon = sk.customIcon || (sk.meta ? sk.meta.customIcon : null);
        if (cIcon) {
            var customBmp = ImageManager.loadBitmap('img/pictures/Skills/', cIcon, 0, true);
            if (customBmp && customBmp.isReady()) {
                var raw = this.getRawImage(customBmp);
                if (raw) {
                    try { ctx.drawImage(raw, 0, 0, customBmp.width, customBmp.height, ix, iy, w, h); drawn = true; } catch(e) {}
                }
            } else if (customBmp && !customBmp.isReady() && !customBmp.isError()) {
                this.attachSafeLoadListener(customBmp, 'const_custom_' + sk.id, this.drawConstellationNodes);
            }
        }

        if (!drawn && (sk.customIcon === 'Basic' || sk.id === 1)) {
            var basicBmp = ImageManager.loadBitmap('img/pictures/Skills/', 'Basic', 0, true);
            if (basicBmp && basicBmp.isReady()) {
                var rawBasic = this.getRawImage(basicBmp);
                if (rawBasic) {
                    try { ctx.drawImage(rawBasic, 0, 0, basicBmp.width, basicBmp.height, ix, iy, w, h); drawn = true; } catch(e) {}
                }
            }
        }

        if (!drawn && sk.skillIconIndex !== undefined && sk.skillIconIndex >= 0) {
            var sheet = ImageManager.loadBitmap('img/pictures/Skills/', 'Skills', 0, true);
            if (sheet && sheet.isReady()) {
                var rawSheet = this.getRawImage(sheet);
                if (rawSheet) {
                    var gCol = sk.skillIconIndex % 10;
                    var gRow = Math.floor(sk.skillIconIndex / 10);
                    try { ctx.drawImage(rawSheet, gCol * 150, gRow * 150, 150, 150, ix, iy, w, h); drawn = true; } catch(e) {}
                }
            }
        }

        if (!drawn && sk.iconIndex > 0) {
            var iconSet = ImageManager.loadSystem('IconSet');
            if (iconSet && iconSet.isReady()) {
                var iconImg = this.getRawImage(iconSet);
                if (iconImg) {
                    var pw = Window_Base._iconWidth || 32;
                    var ph = Window_Base._iconHeight || 32;
                    var sx = (sk.iconIndex % 16) * pw;
                    var sy = Math.floor(sk.iconIndex / 16) * ph;
                    try { ctx.drawImage(iconImg, sx, sy, pw, ph, ix, iy, w, h); drawn = true; } catch(e) {}
                }
            }
        }
    };

    // 3. Gambar 3 Pita Romawi (I, II, III) di Bawah Halaman Kiri
    Scene_StatusJournal.prototype.drawConstellationRomanRibbons = function() {
        if (!this._constellationRomanRibbonsSprite) return;
        var bmp = this._constellationRomanRibbonsSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var actor = $gameParty.menuActor();
        var curP = (actor && actor._constellationActivePreset !== undefined) ? actor._constellationActivePreset : (this._constellationRomanIndex || 0);

        var files = [
            'Untitled478_20260923104449',
            'Untitled478_20260923104447',
            'Untitled478_20260923104445'
        ];

        for (var i = 0; i < files.length; i++) {
            var rBmp = ImageManager.loadJournalConstellation(files[i]);
            if (rBmp && rBmp.isReady()) {
                var raw = this.getRawImage(rBmp);
                if (raw) {
                    var isActive = (i === curP);
                    var yOffset = isActive ? -12 : 0;

                    ctx.save();
                    if (isActive) {
                        ctx.shadowColor = 'rgba(251, 191, 36, 0.95)';
                        ctx.shadowBlur = 12;
                    } else {
                        ctx.globalAlpha = 0.82;
                    }
                    ctx.drawImage(raw, 0, yOffset);
                    ctx.restore();
                }
            } else if (rBmp && !rBmp.isReady()) {
                this.attachSafeLoadListener(rBmp, 'const_ribbon_' + i, this.drawConstellationRomanRibbons);
            }
        }

        ctx.save();
        ctx.font = 'bold 11px GameFont, sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.textAlign = 'center';
        var romanLabels = ['PRESET I', 'PRESET II', 'PRESET III'];
        ctx.fillText('◄ ' + romanLabels[curP] + ' ►', 110, 58);
        ctx.restore();

        bmp._setDirty();
    };

    // Helper: Nama file kartu karakter battle asli
    Scene_StatusJournal.prototype.constellationActorCardName = function(actor) {
        if (!actor) return 'nia_cardB';
        var id = actor.actorId();
        if (id === 1) return 'nia_cardB';
        if (id === 2) return 'sophia_cardB';
        if (id === 3) return 'saki_cardB';
        var name = (actor.name() || '').toLowerCase();
        if (name.includes('nia')) return 'nia_cardB';
        if (name.includes('sophia')) return 'sophia_cardB';
        if (name.includes('saki')) return 'saki_cardB';
        return 'nia_cardB';
    };

    // 4. Gambar Kartu Karakter Battle Asli (Battle HUD Card)
    Scene_StatusJournal.prototype.drawConstellationActorCard = function() {
        if (!this._constellationActorCardSprite) return;
        var bmp = this._constellationActorCardSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var actor = $gameParty.menuActor();
        if (!actor) return;

        var cardName = this.constellationActorCardName(actor);
        var cardBmp = ImageManager.loadBitmap('img/pictures/UI/Battle/', cardName, 0, true);
        if (!cardBmp || !cardBmp.isReady()) {
            if (cardBmp) {
                this.attachSafeLoadListener(cardBmp, 'const_card_' + cardName, this.drawConstellationActorCard);
            }
            return;
        }

        ctx.save();

        // Cutout background
        ctx.fillStyle = 'rgba(25, 20, 30, 0.95)';
        ctx.fillRect(116, 63, 120, 8);
        ctx.fillStyle = 'rgba(20, 25, 35, 0.95)';
        ctx.fillRect(114, 79, 122, 8);
        ctx.fillStyle = 'rgba(30, 20, 20, 0.95)';
        ctx.fillRect(131, 97, 105, 8);

        // Bars
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(116, 63, 85, 8);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(201, 63, 35, 8);

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(114, 79, 87, 8);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(201, 79, 35, 8);

        ctx.fillStyle = '#f97316';
        ctx.fillRect(131, 97, 70, 8);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(201, 97, 35, 8);

        // Battle Card PNG
        var rawCard = this.getRawImage(cardBmp);
        if (rawCard) {
            ctx.drawImage(rawCard, 0, 0, 250, 150, 0, 0, 250, 150);
        }

        // Stat numbers
        ctx.font = 'italic bold 10px GameFont, sans-serif';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.textAlign = 'right';

        var hpBonus = '+' + (666 + actor.mhp);
        ctx.fillStyle = '#ffffff';
        ctx.strokeText(hpBonus, 234, 70);
        ctx.fillText(hpBonus, 234, 70);

        var mpBonus = '+' + (777 + actor.mmp);
        ctx.fillStyle = '#e0f2fe';
        ctx.strokeText(mpBonus, 234, 86);
        ctx.fillText(mpBonus, 234, 86);

        var atkBonus = '+' + (888 + actor.atk);
        ctx.fillStyle = '#ffedd5';
        ctx.strokeText(atkBonus, 234, 104);
        ctx.fillText(atkBonus, 234, 104);

        ctx.restore();
        bmp._setDirty();
    };

    // 5. Gambar Tiga Pita Kategori Skill Dinamis
    Scene_StatusJournal.prototype.drawConstellationCategoryRibbons = function() {
        if (!this._constellationCatRibbonSprites) return;
        var catFiles = ['Attack', 'Defends', 'Special'];
        for (var i = 0; i < this._constellationCatRibbonSprites.length; i++) {
            var sp = this._constellationCatRibbonSprites[i];
            if (sp && (!sp.bitmap || !sp.bitmap.isReady())) {
                sp.bitmap = ImageManager.loadJournalSkill(catFiles[i]);
            }
        }
    };

    // Fisika & Animasi Pita Kategori: Posisi tetap (on position), badan diam, ujung bergetar halus
    Scene_StatusJournal.prototype.updateConstellationCatRibbons = function() {
        if (!this._constellationCatRibbonSprites || this._activeJournalTab !== 4) return;
        var curCat = this._constellationCatIndex || 0;
        var cfg = (STATUS_JOURNAL_CONFIG.constellationJournal && STATUS_JOURNAL_CONFIG.constellationJournal.categoryRibbons) || {
            startX: 295, y: 4, spacing: 70
        };
        var startX = cfg.startX || 295;
        var spacing = cfg.spacing || 70;
        var baseY = cfg.y !== undefined ? cfg.y : 4;
        var t = Graphics.frameCount || 0;

        for (var i = 0; i < this._constellationCatRibbonSprites.length; i++) {
            var sp = this._constellationCatRibbonSprites[i];
            if (!sp) continue;
            var isActive = (i === curCat);

            // Posisi tetap di baseline (posisi on, tidak bergerak naik-turun)
            sp.x = startX + i * spacing;
            sp.y = baseY;

            // Badan pita tetap lurus (NO rotation, NO skewing agar tidak wobbly)
            sp.rotation = 0;
            sp.skew.x = 0;

            if (isActive) {
                // Pita ON: terang penuh, ujung bergerak lembut seperti kain
                var targetOpacity = 255;
                sp.opacity += (targetOpacity - sp.opacity) * 0.15;
                // Getaran ujung kain lembut (nafas elastis halus 1.8% di ujung)
                var clothFlutter = Math.sin(t * 0.07) * 0.018;
                sp.scale.y = 1.03 + clothFlutter;
                sp.scale.x = 1.0;
            } else {
                // Pita OFF: sedikit redup, diam stabil
                var targetOpacity = 175;
                sp.opacity += (targetOpacity - sp.opacity) * 0.15;
                sp.scale.y = 1.0;
                sp.scale.x = 1.0;
            }
        }
    };

    // 6. Gambar Grid 20 Slot Skill (4 Kolom x 5 Baris Column_.png)
    Scene_StatusJournal.prototype.drawConstellationGrid = function() {
        if (!this._constellationGridSprite) return;
        var bmp = this._constellationGridSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        var actor = $gameParty.menuActor();
        if (!actor) return;

        var cfg = (STATUS_JOURNAL_CONFIG.constellationJournal && STATUS_JOURNAL_CONFIG.constellationJournal.grid) || {
            startX: 12, startY: 146, cols: 4, rows: 5, spacingX: 122, spacingY: 98, slotW: 108, slotH: 92, iconSize: 76
        };

        var colBmp = ImageManager.loadJournalSkill('Column_');
        var skills = this.getConstellationSkillList();

        for (var r = 0; r < cfg.rows; r++) {
            for (var c = 0; c < cfg.cols; c++) {
                var idx = r * cfg.cols + c;
                var x = cfg.startX + c * cfg.spacingX;
                var y = cfg.startY + r * cfg.spacingY;
                var sk = skills[idx] || null;

                // A. Bingkai Slot Column_.png
                if (colBmp && colBmp.isReady()) {
                    var rawCol = this.getRawImage(colBmp);
                    if (rawCol) {
                        ctx.drawImage(rawCol, 0, 0, colBmp.width, colBmp.height, x, y, cfg.slotW, cfg.slotH);
                    }
                } else if (colBmp && !colBmp.isReady()) {
                    this.attachSafeLoadListener(colBmp, 'const_grid_col', this.drawConstellationGrid);
                }

                // B. Ikon Skill
                if (sk) {
                    var iconSize = cfg.iconSize || 76;
                    var ix = Math.round(x + (cfg.slotW - iconSize) / 2);
                    var iy = Math.round(y + (cfg.slotH - iconSize) / 2);
                    this.drawSingleSkillIconDirect(ctx, sk, ix, iy, iconSize, iconSize);
                }
            }
        }
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.getConstellationSkillList = function() {
        var actor = $gameParty.menuActor();
        if (!actor) return [];
        var allSkills = actor.skills ? actor.skills() : [];
        var cat = this._constellationCatIndex || 0; // 0=Attack, 1=Defends, 2=Special
        var targetCat = (cat === 0 ? 'attack' : (cat === 1 ? 'defends' : 'special'));

        return allSkills.filter(function(sk) {
            if (!sk) return false;
            return this.classifySkill(sk) === targetCat;
        }.bind(this));
    };

    // 7. Update Reticle Sorotan (Tree vs Grid)
    Scene_StatusJournal.prototype.updateConstellationReticles = function() {
        var cfg = STATUS_JOURNAL_CONFIG.constellationJournal || {};
        var isTree = (this._constellationFocus === 'tree');
        var isGrid = (this._constellationFocus === 'grid');

        if (this._constellationTreeReticleSprite) {
            // Reticle node konstelasi SELALU tampak saat Tab 4 aktif (terang saat di tree, sedikit redup saat di grid)
            this._constellationTreeReticleSprite.visible = (isTree || isGrid);
            var nodes = cfg.treeNodes || [
                { id: 0, x: 74, y: 69, w: 143, h: 143 },
                { id: 1, x: 245, y: 154, w: 143, h: 143 },
                { id: 2, x: 75, y: 258, w: 143, h: 143 },
                { id: 3, x: 244, y: 364, w: 143, h: 143 },
                { id: 4, x: 74, y: 449, w: 143, h: 143 }
            ];
            var n = nodes[this._constellationNodeIndex || 0] || nodes[0];
            var treeX = (cfg.tree && cfg.tree.x) || 43;
            var treeY = (cfg.tree && cfg.tree.y) || 18;
            this._constellationTreeReticleSprite.x = treeX + n.x + n.w / 2;
            this._constellationTreeReticleSprite.y = treeY + n.y + n.h / 2;
            this._constellationTreeReticleSprite.opacity = isTree ? 255 : 150;

            this.drawConstellationTreeReticleGraphic(isGrid);
        }

        if (this._constellationGridReticleSprite) {
            // Reticle grid hanya tampil saat pemain sedang memilih skill di deck
            this._constellationGridReticleSprite.visible = isGrid;
            if (isGrid) {
                var gCfg = cfg.grid || { startX: 12, startY: 146, cols: 4, rows: 5, spacingX: 122, spacingY: 98, slotW: 108, slotH: 92 };
                var gIdx = this._constellationGridIndex || 0;
                var col = gIdx % gCfg.cols;
                var row = Math.floor(gIdx / gCfg.cols);
                this._constellationGridReticleSprite.x = gCfg.startX + col * gCfg.spacingX + gCfg.slotW / 2;
                this._constellationGridReticleSprite.y = gCfg.startY + row * gCfg.spacingY + gCfg.slotH / 2;
            }
        }
        this.updateConstellationSkillPopup();
    };

    // ------------------------------------------------------------------------
    // SISTEM INPUT & INTERAKSI HALAMAN CONSTELLATION
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.handleConstellationInput = function() {
        // Reset flag mouse off saat navigasi keyboard aktif
        if (Input.isTriggered('up') || Input.isTriggered('down') || Input.isTriggered('left') || Input.isTriggered('right') ||
            Input.isRepeated('up') || Input.isRepeated('down') || Input.isRepeated('left') || Input.isRepeated('right') ||
            Input.isTriggered('ok') || Input.isTriggered('shift') || Input.isTriggered('tab') ||
            Input.isTriggered('pageup') || Input.isTriggered('pagedown')) {
            this._constellationMouseOff = false;
        }

        // Ganti Preset Kombo (I, II, III) dengan Shift / Tab
        if (Input.isTriggered('shift') || Input.isTriggered('tab')) {
            SoundManager.playCursor();
            var actor = $gameParty.menuActor();
            if (actor) {
                actor._constellationActivePreset = ((actor._constellationActivePreset || 0) + 1) % 3;
                this._constellationRomanIndex = actor._constellationActivePreset;
                this.syncConstellationPaths(actor);
            }
            this.drawConstellationNodes();
            this.drawConstellationRomanRibbons();
            this.drawConstellationActorCard();
            return;
        }

        // (Catatan: Q / W kini dipisah secara kontekstual di bawah sesuai lokasi kursor: pohon vs grid)

        // Ganti Karakter dengan Tombol 1 - 3
        if (Input.isTriggered('actor_1')) {
            this.changeToActorIndex(0);
            this.refreshConstellationPage();
            return;
        } else if (Input.isTriggered('actor_2')) {
            this.changeToActorIndex(1);
            this.refreshConstellationPage();
            return;
        } else if (Input.isTriggered('actor_3')) {
            this.changeToActorIndex(2);
            this.refreshConstellationPage();
            return;
        }

        if (this._constellationFocus === 'tree') {
            // ================================================================
            // FOKUS POHON 5 NODE (HALAMAN KIRI - PEMILIHAN SLOT COMBO)
            // ================================================================
            // Saat di pemilihan slot combo: Q / W untuk memilih karakter!
            if (Input.isTriggered('pageup')) {
                this.previousActor();
                return;
            } else if (Input.isTriggered('pagedown')) {
                this.nextActor();
                return;
            }
            if (Input.isRepeated('left')) {
                if (this._constellationNodeIndex === 1) {
                    SoundManager.playCursor();
                    this._constellationNodeIndex = 0;
                    this.updateConstellationReticles();
                } else if (this._constellationNodeIndex === 3) {
                    SoundManager.playCursor();
                    this._constellationNodeIndex = 2;
                    this.updateConstellationReticles();
                } else {
                    // Node kiri (0, 2, 4) jika ditekan kiri -> fokus ke bilah pita utama jurnal
                    this.focusRibbons();
                }
            } else if (Input.isRepeated('right')) {
                if (this._constellationNodeIndex === 0) {
                    SoundManager.playCursor();
                    this._constellationNodeIndex = 1;
                    this.updateConstellationReticles();
                } else if (this._constellationNodeIndex === 2) {
                    SoundManager.playCursor();
                    this._constellationNodeIndex = 3;
                    this.updateConstellationReticles();
                } else {
                    // Node kanan (1, 3, 4) jika ditekan kanan -> langsung masuk ke deck skill
                    SoundManager.playCursor();
                    this._constellationFocus = 'grid';
                    this.updateConstellationReticles();
                }
            } else if (Input.isRepeated('up')) {
                if (this._constellationNodeIndex > 0) {
                    SoundManager.playCursor();
                    this._constellationNodeIndex--;
                    this.updateConstellationReticles();
                }
            } else if (Input.isRepeated('down')) {
                if (this._constellationNodeIndex < 4) {
                    SoundManager.playCursor();
                    this._constellationNodeIndex++;
                    this.updateConstellationReticles();
                }
            } else if (Input.isTriggered('ok')) {
                // Enter pada node -> langsung masuk ke deck skill untuk memilih skill
                SoundManager.playOk();
                this._constellationFocus = 'grid';
                this.updateConstellationReticles();
            } else if (Input.isTriggered('cancel') || Input.isTriggered('escape')) {
                // Kosongkan node jika ada skill; jika kosong, kembali ke ribbons
                var actor = $gameParty.menuActor();
                var pIdx = this._constellationRomanIndex || 0;
                if (actor && actor._constellationPresets && actor._constellationPresets[pIdx][this._constellationNodeIndex] > 0) {
                    SoundManager.playEquip();
                    actor._constellationPresets[pIdx][this._constellationNodeIndex] = 0;
                    this.syncConstellationPaths(actor);
                    this.drawConstellationNodes();
                    this.drawConstellationActorCard();
                } else {
                    this.focusRibbons();
                }
            }

        } else if (this._constellationFocus === 'grid') {
            // ================================================================
            // FOKUS DECK SKILL (GRID 20 SLOT DI HALAMAN KANAN - SLOT SKILL TERSEDIA)
            // ================================================================
            // Saat di dalam slot skill tersedia: Q / W untuk memilih jenis skill (Attack ↔ Defends ↔ Special)!
            if (Input.isTriggered('pageup')) {
                SoundManager.playCursor();
                this._constellationCatIndex = (this._constellationCatIndex + 2) % 3;
                this.drawConstellationGrid();
                return;
            } else if (Input.isTriggered('pagedown')) {
                SoundManager.playCursor();
                this._constellationCatIndex = (this._constellationCatIndex + 1) % 3;
                this.drawConstellationGrid();
                return;
            }

            var gCfg = (STATUS_JOURNAL_CONFIG.constellationJournal && STATUS_JOURNAL_CONFIG.constellationJournal.grid) || { cols: 4, rows: 5 };
            var col = this._constellationGridIndex % gCfg.cols;
            var row = Math.floor(this._constellationGridIndex / gCfg.cols);

            if (Input.isRepeated('left')) {
                if (col === 0) {
                    // Mentok kiri -> kembali ke slot pohon kombo di kiri
                    SoundManager.playCursor();
                    this._constellationFocus = 'tree';
                    this.updateConstellationReticles();
                } else {
                    SoundManager.playCursor();
                    this._constellationGridIndex--;
                    this.updateConstellationReticles();
                }
            } else if (Input.isRepeated('right')) {
                // Di dalam deck skill: navigasi ke kanan, BERHENTI di kolom terakhir (TIDAK melompat keluar ke pita!)
                if (col < gCfg.cols - 1 && this._constellationGridIndex + 1 < 20) {
                    SoundManager.playCursor();
                    this._constellationGridIndex++;
                    this.updateConstellationReticles();
                }
            } else if (Input.isRepeated('up')) {
                if (row > 0) {
                    SoundManager.playCursor();
                    this._constellationGridIndex -= gCfg.cols;
                    this.updateConstellationReticles();
                }
                // Jika di row 0: berhenti di row 0 (TIDAK melompat ke atas)
            } else if (Input.isRepeated('down')) {
                if (row < gCfg.rows - 1 && this._constellationGridIndex + gCfg.cols < 20) {
                    SoundManager.playCursor();
                    this._constellationGridIndex += gCfg.cols;
                    this.updateConstellationReticles();
                }
            } else if (Input.isTriggered('ok')) {
                var skills = this.getConstellationSkillList();
                var sk = skills[this._constellationGridIndex];
                var actor = $gameParty.menuActor();
                var pIdx = (actor && actor._constellationActivePreset !== undefined) ? actor._constellationActivePreset : (this._constellationRomanIndex || 0);

                if (sk && actor && actor._constellationPresets) {
                    SoundManager.playEquip();
                    if (this._constellationNodeIndex === 0) {
                        actor._constellationBaseSkillId = sk.id;
                        actor._constellationPresets[0][0] = sk.id;
                        actor._constellationPresets[1][0] = sk.id;
                        actor._constellationPresets[2][0] = sk.id;
                    } else {
                        actor._constellationPresets[pIdx][this._constellationNodeIndex] = sk.id;
                    }
                    this.syncConstellationPaths(actor);
                    this.drawConstellationNodes();
                    this.drawConstellationActorCard();
                    this._constellationFocus = 'tree';
                    this.updateConstellationReticles();
                } else {
                    SoundManager.playBuzzer();
                }
            } else if (Input.isTriggered('cancel') || Input.isTriggered('escape')) {
                SoundManager.playCancel();
                this._constellationFocus = 'tree';
                this.updateConstellationReticles();
            }
        }
    };

    // Interaksi Mouse / Layar Sentuh Halaman Constellation
    Scene_StatusJournal.prototype.handleConstellationTouch = function(realX, realY) {
        var cfg = STATUS_JOURNAL_CONFIG.constellationJournal || {};
        var leftX = 239, leftY = 21;
        var rightX = 746, rightY = 23;

        // 0. Cek Klik pada ID Card Karakter (Halaman Kanan) -> Ganti Karakter
        var cardCfg = cfg.actorCard || { x: 14, y: 8, w: 250, h: 150 };
        var cx = rightX + cardCfg.x;
        var cy = rightY + cardCfg.y;
        var cw = cardCfg.w || 250;
        var ch = cardCfg.h || 150;
        if (realX >= cx && realX <= cx + cw && realY >= cy && realY <= cy + ch) {
            this.nextActor();
            return;
        }

        // 1. Cek Klik pada 3 Pita Romawi (I, II, III) di Halaman Kiri
        var romCfg = cfg.romanRibbons || { x: 236, y: 510, w: 229, h: 205 };
        var rx = leftX + romCfg.x;
        var ry = leftY + romCfg.y;
        if (realX >= rx && realX <= rx + romCfg.w && realY >= ry && realY <= ry + romCfg.h) {
            var localX = realX - rx;
            var targetP = 0;
            if (localX < 80) targetP = 0;
            else if (localX < 130) targetP = 1;
            else targetP = 2;
            var actor = $gameParty.menuActor();
            if (actor) {
                actor._constellationActivePreset = targetP;
                this._constellationRomanIndex = targetP;
                this.syncConstellationPaths(actor);
            }
            SoundManager.playOk();
            this.drawConstellationNodes();
            this.drawConstellationRomanRibbons();
            this.drawConstellationActorCard();
            return;
        }

        // 2. Cek Klik pada 5 Node Pohon di Halaman Kiri
        var treeCfg = cfg.tree || { x: 43, y: 18 };
        var nodes = cfg.treeNodes || [
            { id: 0, x: 74, y: 69, w: 143, h: 143 },
            { id: 1, x: 245, y: 154, w: 143, h: 143 },
            { id: 2, x: 75, y: 258, w: 143, h: 143 },
            { id: 3, x: 244, y: 364, w: 143, h: 143 },
            { id: 4, x: 74, y: 449, w: 143, h: 143 }
        ];

        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            var nx = leftX + treeCfg.x + n.x;
            var ny = leftY + treeCfg.y + n.y;
            if (realX >= nx && realX <= nx + n.w && realY >= ny && realY <= ny + n.h) {
                SoundManager.playOk();
                this._constellationNodeIndex = i;
                this._constellationFocus = 'tree';
                this.updateConstellationReticles();
                return;
            }
        }

        // 3. Cek Klik pada 3 Pita Kategori (Attack, Defends, Special) di Kanan Atas
        var catCfg = cfg.categoryRibbons || { startX: 295, y: 4, spacing: 70 };
        var catStartX = rightX + (catCfg.startX || 295);
        var catSpacing = catCfg.spacing || 70;
        var ribY = rightY + (catCfg.y !== undefined ? catCfg.y : 4);
        for (var ci = 0; ci < 3; ci++) {
            var ribX = catStartX + ci * catSpacing;
            if (realX >= ribX - 25 && realX <= ribX + 25 && realY >= ribY && realY <= ribY + 155) {
                SoundManager.playCursor();
                this._constellationCatIndex = ci;
                this.drawConstellationGrid();
                return;
            }
        }

        // 4. Cek Klik pada Grid 20 Slot Skill di Halaman Kanan
        var gCfg = cfg.grid || { startX: 12, startY: 146, cols: 4, rows: 5, spacingX: 122, spacingY: 98, slotW: 108, slotH: 92 };
        for (var gr = 0; gr < gCfg.rows; gr++) {
            for (var gc = 0; gc < gCfg.cols; gc++) {
                var slotX = rightX + gCfg.startX + gc * gCfg.spacingX;
                var slotY = rightY + gCfg.startY + gr * gCfg.spacingY;
                if (realX >= slotX && realX <= slotX + gCfg.slotW && realY >= slotY && realY <= slotY + gCfg.slotH) {
                    var sIdx = gr * gCfg.cols + gc;
                    this._constellationGridIndex = sIdx;
                    this._constellationFocus = 'grid';
                    this.updateConstellationReticles();

                    // Pasang skill ke node aktif
                    var skills = this.getConstellationSkillList();
                    var sk = skills[sIdx];
                    var actor = $gameParty.menuActor();
                    var pIdx = (actor && actor._constellationActivePreset !== undefined) ? actor._constellationActivePreset : (this._constellationRomanIndex || 0);
                    if (sk && actor && actor._constellationPresets) {
                        SoundManager.playEquip();
                        if (this._constellationNodeIndex === 0) {
                            actor._constellationBaseSkillId = sk.id;
                            actor._constellationPresets[0][0] = sk.id;
                            actor._constellationPresets[1][0] = sk.id;
                            actor._constellationPresets[2][0] = sk.id;
                        } else {
                            actor._constellationPresets[pIdx][this._constellationNodeIndex] = sk.id;
                        }
                        this.syncConstellationPaths(actor);
                        this.drawConstellationNodes();
                        this.drawConstellationActorCard();
                        this._constellationFocus = 'tree';
                        this.updateConstellationReticles();
                    }
                    return;
                }
            }
        }
    };



    // ========================================================================
    // LAYER 7E: KONTEN HALAMAN ARCHIVE (MEMORIES POLAROID & ADVENTURE LOGS)
    // ========================================================================
    Scene_StatusJournal.prototype.createArchivePageContents = function() {
        this._archivePageContainer = new Sprite();
        this._archivePageContainer.visible = false;
        this._journalRoot.addChild(this._archivePageContainer);

        // 1. Kontainer Hub Utama (Landing Page: Memories di Kiri, Review of Adventure di Kanan)
        this._archiveHubContainer = new Sprite();
        this._archivePageContainer.addChild(this._archiveHubContainer);

        // Hub Kiri: Kolase Tumpukan 6 Polaroid Artistik ("MEMORIES")
        this._archiveHubLeftSprite = new Sprite();
        this._archiveHubLeftSprite.x = 239;
        this._archiveHubLeftSprite.y = 21;
        this._archiveHubLeftSprite.bitmap = new Bitmap(508, 668);
        this._archiveHubContainer.addChild(this._archiveHubLeftSprite);

        // Hub Kanan: Lembar Catatan Ekspedisi ("REVIEW OF THE ADVENTURE")
        this._archiveHubRightSprite = new Sprite();
        this._archiveHubRightSprite.x = 746;
        this._archiveHubRightSprite.y = 23;
        this._archiveHubRightSprite.bitmap = new Bitmap(508, 668);
        this._archiveHubContainer.addChild(this._archiveHubRightSprite);

        // 2. Kontainer Sub-View 1: Album Galeri CG (Scrapbook 8 Polaroid Bertape Washi)
        this._archiveGalleryContainer = new Sprite();
        this._archiveGalleryContainer.visible = false;
        this._archivePageContainer.addChild(this._archiveGalleryContainer);

        this._archiveGalleryLeftSprite = new Sprite();
        this._archiveGalleryLeftSprite.x = 239;
        this._archiveGalleryLeftSprite.y = 21;
        this._archiveGalleryLeftSprite.bitmap = new Bitmap(508, 668);
        this._archiveGalleryContainer.addChild(this._archiveGalleryLeftSprite);

        this._archiveGalleryRightSprite = new Sprite();
        this._archiveGalleryRightSprite.x = 746;
        this._archiveGalleryRightSprite.y = 23;
        this._archiveGalleryRightSprite.bitmap = new Bitmap(508, 668);
        this._archiveGalleryContainer.addChild(this._archiveGalleryRightSprite);

        // 3. Kontainer Sub-View 2: Log Petualangan & Percakapan (Dua Kolom)
        this._archiveLogsContainer = new Sprite();
        this._archiveLogsContainer.visible = false;
        this._archivePageContainer.addChild(this._archiveLogsContainer);

        this._archiveLogsLeftSprite = new Sprite();
        this._archiveLogsLeftSprite.x = 239;
        this._archiveLogsLeftSprite.y = 21;
        this._archiveLogsLeftSprite.bitmap = new Bitmap(508, 668);
        this._archiveLogsContainer.addChild(this._archiveLogsLeftSprite);

        this._archiveLogsRightSprite = new Sprite();
        this._archiveLogsRightSprite.x = 746;
        this._archiveLogsRightSprite.y = 23;
        this._archiveLogsRightSprite.bitmap = new Bitmap(508, 668);
        this._archiveLogsContainer.addChild(this._archiveLogsRightSprite);

        // 4. Reticle Sorotan Seleksi Archive
        this._archiveReticleSprite = new Sprite();
        this._archiveReticleSprite.bitmap = new Bitmap(470, 310);
        this._archiveReticleSprite.anchor.x = 0.5;
        this._archiveReticleSprite.anchor.y = 0.5;
        this._archiveReticleSprite.visible = false;
        this._archivePageContainer.addChild(this._archiveReticleSprite);

        // 5. Fullscreen CG Viewer Sprite (Overlay Paling Atas)
        this._archiveViewerContainer = new Sprite();
        this._archiveViewerContainer.visible = false;
        this.addChild(this._archiveViewerContainer);

        this._archiveViewerBg = new Sprite();
        this._archiveViewerBg.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this._archiveViewerBg.bitmap.fillRect(0, 0, Graphics.boxWidth, Graphics.boxHeight, 'rgba(0, 0, 0, 0.94)');
        this._archiveViewerContainer.addChild(this._archiveViewerBg);

        this._archiveViewerImageSprite = new Sprite();
        this._archiveViewerImageSprite.anchor.x = 0.5;
        this._archiveViewerImageSprite.anchor.y = 0.5;
        this._archiveViewerImageSprite.x = Graphics.boxWidth / 2;
        this._archiveViewerImageSprite.y = Graphics.boxHeight / 2;
        this._archiveViewerContainer.addChild(this._archiveViewerImageSprite);

        this._archiveViewerPromptSprite = new Sprite();
        this._archiveViewerPromptSprite.bitmap = new Bitmap(Graphics.boxWidth, 60);
        this._archiveViewerPromptSprite.y = Graphics.boxHeight - 60;
        this._archiveViewerContainer.addChild(this._archiveViewerPromptSprite);
    };

    Scene_StatusJournal.prototype.refreshArchivePage = function() {
        if (!this._archiveSubMode) this._archiveSubMode = 'hub';

        // Kelola visibilitas kontainer sub-mode
        if (this._archiveHubContainer) this._archiveHubContainer.visible = (this._archiveSubMode === 'hub');
        if (this._archiveGalleryContainer) this._archiveGalleryContainer.visible = (this._archiveSubMode === 'gallery');
        if (this._archiveLogsContainer) this._archiveLogsContainer.visible = (this._archiveSubMode === 'logs');
        if (this._archiveViewerContainer) this._archiveViewerContainer.visible = (this._archiveSubMode === 'viewer');

        if (this._archiveSubMode === 'hub') {
            this.drawArchiveHubLeft();
            this.drawArchiveHubRight();
        } else if (this._archiveSubMode === 'gallery') {
            this.drawArchiveGalleryAlbum();
        } else if (this._archiveSubMode === 'logs') {
            this.drawArchiveLogsList();
            this.drawArchiveLogDetail();
        }
        this.updateArchiveReticle();
    };

    // ------------------------------------------------------------------------
    // A. HUB UTAMA: MEMORIES (KOLASE POLAROID) & REVIEW OF ADVENTURE (CATATAN)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.drawArchiveHubLeft = function() {
        if (!this._archiveHubLeftSprite) return;
        var bmp = this._archiveHubLeftSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();

        // 1. Header Artistik "MEMORIES"
        ctx.font = 'bold 26px GameFont, sans-serif';
        ctx.fillStyle = '#451a03';
        ctx.textAlign = 'center';
        ctx.fillText('M E M O R I E S', 254, 52);

        ctx.font = 'italic 12px GameFont, sans-serif';
        ctx.fillStyle = '#854d0e';
        ctx.fillText('Album Foto & Kenangan Perjalanan', 254, 76);

        // 2. Kolase Tumpukan 6 Polaroid Sesuai Contoh Gambar 1
        var polBmp = ImageManager.loadJournalArchive('Polaroid_');
        var cgItems = (typeof CustomGalleryManager !== 'undefined') ? CustomGalleryManager.scan() : [];
        var cgSample = (cgItems && cgItems.length > 0) ? ImageManager.loadPicture(cgItems[0].file) : null;

        var collage = [
            { x: 75,  y: 110, rot: -0.07, w: 145, h: 165 },
            { x: 195, y: 92,  rot: 0.02,  w: 155, h: 175 },
            { x: 315, y: 108, rot: 0.08,  w: 145, h: 165 },
            { x: 65,  y: 265, rot: 0.06,  w: 150, h: 170 },
            { x: 320, y: 255, rot: -0.06, w: 150, h: 170 },
            { x: 190, y: 335, rot: -0.02, w: 165, h: 185 }
        ];

        for (var i = 0; i < collage.length; i++) {
            var c = collage[i];
            ctx.save();
            ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
            ctx.rotate(c.rot);

            // Bayangan polaroid
            ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 4;

            // Frame Polaroid
            if (polBmp && polBmp.isReady()) {
                var rawPol = this.getRawImage(polBmp);
                if (rawPol) ctx.drawImage(rawPol, -c.w / 2, -c.h / 2, c.w, c.h);
            } else {
                ctx.fillStyle = '#faf8f5';
                ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
            }

            // Thumbnail CG di dalam jendela foto polaroid
            var padX = c.w * 0.1;
            var padY = c.h * 0.08;
            var photoW = c.w - padX * 2;
            var photoH = c.h * 0.65;

            ctx.shadowColor = 'transparent';
            if (cgSample && cgSample.isReady()) {
                var rawCg = this.getRawImage(cgSample);
                if (rawCg) {
                    ctx.drawImage(rawCg, 0, 0, cgSample.width, cgSample.height, -c.w / 2 + padX, -c.h / 2 + padY, photoW, photoH);
                }
            } else {
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(-c.w / 2 + padX, -c.h / 2 + padY, photoW, photoH);
                ctx.font = 'bold 12px GameFont, sans-serif';
                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                ctx.fillText('MEMORY #' + (i + 1), 0, -c.h / 2 + padY + photoH / 2 + 4);
            }

            // Washi tape di pojok atas
            ctx.fillStyle = (i % 2 === 0) ? 'rgba(251, 191, 36, 0.75)' : 'rgba(244, 114, 182, 0.75)';
            ctx.fillRect(-c.w * 0.25, -c.h / 2 - 4, c.w * 0.5, 10);

            ctx.restore();
        }

        // 3. Tombol Kartu Seleksi Kiri ("BUKA GALERI CG")
        var isMemFocus = (this._archiveHubFocus === 'memories');
        var btnY = 540;
        ctx.fillStyle = isMemFocus ? '#78350f' : '#fef3c7';
        ctx.strokeStyle = isMemFocus ? '#fbbf24' : '#b45309';
        ctx.lineWidth = 2.5;

        // Rounded button
        this.fillRoundedRect(ctx, 44, btnY, 420, 72, 14);
        ctx.stroke();

        ctx.font = 'bold 16px GameFont, sans-serif';
        ctx.fillStyle = isMemFocus ? '#ffffff' : '#78350f';
        ctx.textAlign = 'center';
        ctx.fillText('BUKA ALBUM GALERI CG', 254, btnY + 32);

        ctx.font = 'italic 12px GameFont, sans-serif';
        ctx.fillStyle = isMemFocus ? '#fef08a' : '#92400e';
        ctx.fillText('[ ENTER / Klik ] Buka Album', 254, btnY + 54);

        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawArchiveHubRight = function() {
        if (!this._archiveHubRightSprite) return;
        var bmp = this._archiveHubRightSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();

        // 1. Pita Header "REVIEW OF THE ADVENTURE" Bersih & Rapi
        var bannerY = 48;
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(35, bannerY); ctx.lineTo(130, bannerY);
        ctx.moveTo(378, bannerY); ctx.lineTo(473, bannerY);
        ctx.moveTo(35, bannerY + 28); ctx.lineTo(130, bannerY + 28);
        ctx.moveTo(378, bannerY + 28); ctx.lineTo(473, bannerY + 28);
        ctx.stroke();

        ctx.fillStyle = '#451a03';
        ctx.font = 'bold 14px GameFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('REVIEW OF THE ADVENTURE', 254, bannerY + 19);

        // 2. Lembar Kertas Catatan Ekspedisi Lined Parchment
        var cardY = 100;
        var cardW = 430;
        var cardH = 415;
        ctx.fillStyle = '#fffdf9';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        this.fillRoundedRect(ctx, 39, cardY, cardW, cardH, 12);
        ctx.stroke();

        // Header Catatan
        ctx.font = 'bold 16px GameFont, sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.textAlign = 'left';
        ctx.fillText('Rangkuman Ekspedisi', 58, cardY + 36);

        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(58, cardY + 46); ctx.lineTo(430, cardY + 46);
        ctx.stroke();

        // Statistik Progres
        var cgItems = (typeof CustomGalleryManager !== 'undefined') ? CustomGalleryManager.scan() : [];
        var totalLogs = ($gameSystem && $gameSystem._activityLogs) ? $gameSystem._activityLogs.length : 0;
        var playTime = ($gameSystem && $gameSystem.playtimeText) ? $gameSystem.playtimeText() : '00:00:00';

        var stats = [
            { label: 'Koleksi CG Terbuka', val: Math.min(cgItems.length, 1) + ' / ' + Math.max(cgItems.length, 1) },
            { label: 'Catatan Kejadian', val: totalLogs + ' Entri' },
            { label: 'Waktu Petualangan', val: playTime },
            { label: 'Status Ekspedisi', val: 'Aktif Menjelajah' }
        ];

        for (var s = 0; s < stats.length; s++) {
            var sy = cardY + 80 + s * 34;
            ctx.font = 'bold 13px GameFont, sans-serif';
            ctx.fillStyle = '#451a03';
            ctx.textAlign = 'left';
            ctx.fillText('•  ' + stats[s].label, 58, sy);
            ctx.fillStyle = '#b45309';
            ctx.textAlign = 'right';
            ctx.fillText(stats[s].val, 428, sy);
        }

        // Cuplikan 3 Catatan Terakhir
        ctx.strokeStyle = '#fde68a';
        ctx.beginPath();
        ctx.moveTo(58, cardY + 230); ctx.lineTo(430, cardY + 230);
        ctx.stroke();

        ctx.font = 'bold 13px GameFont, sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.fillText('Aktivitas Terakhir:', 58, cardY + 252);

        var logs = ($gameSystem && $gameSystem._activityLogs) ? $gameSystem._activityLogs : [];
        for (var l = 0; l < 3; l++) {
            var ly = cardY + 282 + l * 38;
            var log = logs[l];
            if (log) {
                var tag = log.type === 'item' ? '[Item]' : (log.type === 'dialogue' ? '[Dialog]' : '[Catatan]');
                ctx.font = 'bold 11px GameFont, sans-serif';
                ctx.fillStyle = '#b45309';
                ctx.textAlign = 'left';
                ctx.fillText(tag, 58, ly);

                ctx.font = '12px GameFont, sans-serif';
                ctx.fillStyle = '#1e293b';
                var truncText = log.text.length > 34 ? log.text.substring(0, 34) + '...' : log.text;
                ctx.fillText(truncText, 114, ly);
            } else {
                ctx.font = 'italic 12px GameFont, sans-serif';
                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'left';
                ctx.fillText('- Belum ada catatan tambahan -', 58, ly);
            }
        }

        // 3. Tombol Kartu Seleksi Kanan ("BUKA LOG PETUALANGAN")
        var isLogFocus = (this._archiveHubFocus === 'logs');
        var btnY = 540;
        ctx.fillStyle = isLogFocus ? '#78350f' : '#fef3c7';
        ctx.strokeStyle = isLogFocus ? '#fbbf24' : '#b45309';
        ctx.lineWidth = 2.5;

        this.fillRoundedRect(ctx, 44, btnY, 420, 72, 14);
        ctx.stroke();

        ctx.font = 'bold 16px GameFont, sans-serif';
        ctx.fillStyle = isLogFocus ? '#ffffff' : '#78350f';
        ctx.textAlign = 'center';
        ctx.fillText('BUKA RIWAYAT CATATAN', 254, btnY + 32);

        ctx.font = 'italic 12px GameFont, sans-serif';
        ctx.fillStyle = isLogFocus ? '#fef08a' : '#92400e';
        ctx.fillText('[ ENTER / Klik ] Buka Riwayat', 254, btnY + 54);

        ctx.restore();
        bmp._setDirty();
    };

    // ------------------------------------------------------------------------
    // B. SUB-VIEW 1: ALBUM GALERI CG (SCRAPBOOK 8 POLAROID SESUAI GAMBAR 2)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.drawArchiveGalleryAlbum = function() {
        if (!this._archiveGalleryLeftSprite || !this._archiveGalleryRightSprite) return;
        var bmpL = this._archiveGalleryLeftSprite.bitmap;
        var bmpR = this._archiveGalleryRightSprite.bitmap;
        bmpL.clear();
        bmpR.clear();

        var cgItems = (typeof CustomGalleryManager !== 'undefined') ? CustomGalleryManager.scan() : [];
        var polBmp = ImageManager.loadJournalArchive('Polaroid_');
        var curIdx = this._archiveGalleryIndex || 0;

        // Judul CG dari konfigurasi atau otomatis
        var cfg = typeof STATUS_JOURNAL_CONFIG !== 'undefined' ? STATUS_JOURNAL_CONFIG : {};
        var configuredTitles = (cfg.archiveJournal && cfg.archiveJournal.cgTitles) || [];

        var slotsCfg = [
            // Halaman Kiri (Slot 0..3)
            { page: 'left',  x: 35,  y: 45,  w: 205, h: 260 },
            { page: 'left',  x: 265, y: 45,  w: 205, h: 260 },
            { page: 'left',  x: 35,  y: 345, w: 205, h: 260 },
            { page: 'left',  x: 265, y: 345, w: 205, h: 260 },
            // Halaman Kanan (Slot 4..7)
            { page: 'right', x: 35,  y: 45,  w: 205, h: 260 },
            { page: 'right', x: 265, y: 45,  w: 205, h: 260 },
            { page: 'right', x: 35,  y: 345, w: 205, h: 260 },
            { page: 'right', x: 265, y: 345, w: 205, h: 260 }
        ];

        for (var s = 0; s < 8; s++) {
            var sl = slotsCfg[s];
            var isLeft = (sl.page === 'left');
            var ctx = isLeft ? bmpL._context : bmpR._context;
            var isSel = (s === curIdx);
            var cgItem = cgItems[s];

            ctx.save();

            // Bayangan polaroid
            ctx.shadowColor = isSel ? 'rgba(251, 191, 36, 0.95)' : 'rgba(0, 0, 0, 0.22)';
            ctx.shadowBlur = isSel ? 16 : 8;
            ctx.shadowOffsetX = isSel ? 0 : 3;
            ctx.shadowOffsetY = isSel ? 0 : 3;

            // Frame Polaroid Asli
            if (polBmp && polBmp.isReady()) {
                var rawPol = this.getRawImage(polBmp);
                if (rawPol) ctx.drawImage(rawPol, sl.x, sl.y, sl.w, sl.h);
            } else {
                ctx.fillStyle = '#faf8f5';
                ctx.fillRect(sl.x, sl.y, sl.w, sl.h);
            }

            ctx.shadowColor = 'transparent';

            // Area Foto Polaroid (Window)
            var padX = 20;
            var padY = 16;
            var photoW = sl.w - padX * 2;
            var photoH = sl.h * 0.68;
            var px = sl.x + padX;
            var py = sl.y + padY;

            if (cgItem) {
                // CG Terbuka: Tampilkan thumbnail
                var cgBmp = ImageManager.loadPicture(cgItem.file);
                if (cgBmp && cgBmp.isReady()) {
                    var rawCg = this.getRawImage(cgBmp);
                    if (rawCg) ctx.drawImage(rawCg, 0, 0, cgBmp.width, cgBmp.height, px, py, photoW, photoH);
                } else if (cgBmp) {
                    this.attachSafeLoadListener(cgBmp, 'gal_cg_' + s, this.drawArchiveGalleryAlbum);
                }
            } else {
                // CG Terkunci: Tampilan bersih minimalis
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(px, py, photoW, photoH);
                ctx.font = '13px GameFont, sans-serif';
                ctx.fillStyle = '#64748b';
                ctx.textAlign = 'center';
                ctx.fillText('— Terkunci —', px + photoW / 2, py + photoH / 2 + 5);
            }

            // Outline halus emas jika slot sedang dipilih
            if (isSel) {
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(sl.x, sl.y, sl.w, sl.h);
            }

            // Teks Label Bawah Polaroid Sesuai Judul CG
            var cgTitle = '';
            if (cgItem) {
                cgTitle = configuredTitles[s] || cgItem.name || ('CG ' + (s + 1));
            } else {
                cgTitle = '???';
            }

            ctx.font = 'bold 14px GameFont, sans-serif';
            ctx.fillStyle = isSel ? '#b45309' : (cgItem ? '#1e293b' : '#64748b');
            ctx.textAlign = 'center';
            ctx.fillText(cgTitle, sl.x + sl.w / 2, sl.y + sl.h - 18);

            // Washi Tape di Sudut / Atas Polaroid Sesuai Contoh Gambar 2
            ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
            ctx.lineWidth = 1;
            if (s % 3 === 0) {
                // Tape pojok kiri atas
                ctx.save();
                ctx.translate(sl.x + 8, sl.y + 6);
                ctx.rotate(-0.35);
                ctx.fillRect(-18, -6, 36, 12);
                ctx.strokeRect(-18, -6, 36, 12);
                ctx.restore();
            } else if (s % 3 === 1) {
                // Tape lurus tengah atas
                ctx.fillRect(sl.x + sl.w / 2 - 22, sl.y - 6, 44, 12);
                ctx.strokeRect(sl.x + sl.w / 2 - 22, sl.y - 6, 44, 12);
            } else {
                // Tape pojok kanan atas
                ctx.save();
                ctx.translate(sl.x + sl.w - 8, sl.y + 6);
                ctx.rotate(0.35);
                ctx.fillRect(-18, -6, 36, 12);
                ctx.strokeRect(-18, -6, 36, 12);
                ctx.restore();
            }

            ctx.restore();
        }

        // Breadcrumb panduan navigasi di kiri bawah
        ctx = bmpL._context;
        ctx.save();
        ctx.font = 'bold 13px GameFont, sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.textAlign = 'left';
        ctx.fillText('[ESC] Kembali ke Menu Archive', 35, 638);
        ctx.restore();

        bmpL._setDirty();
        bmpR._setDirty();
    };

    // ------------------------------------------------------------------------
    // C. SUB-VIEW 2: ADVENTURE LOG PAGE (DAFTAR LOG KIRI, DETAIL KANAN)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.drawArchiveLogsList = function() {
        if (!this._archiveLogsLeftSprite) return;
        var bmp = this._archiveLogsLeftSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();

        // 1. Header Halaman Kiri
        ctx.font = 'bold 22px GameFont, sans-serif';
        ctx.fillStyle = '#451a03';
        ctx.textAlign = 'left';
        ctx.fillText('Catatan Petualangan', 32, 48);

        // 2. Filter Kategori Tab di Atas List: [ SEMUA ]  [ 💬 DIALOG ]  [ 🎁 ITEM ]  [ ⚔️ STATUS ]
        var filters = [
            { key: 'all',      label: 'Semua' },
            { key: 'dialogue', label: 'Dialog' },
            { key: 'item',     label: 'Item' },
            { key: 'status',   label: 'Status' }
        ];

        var fx = 32;
        for (var f = 0; f < filters.length; f++) {
            var isFilterActive = (this._archiveLogFilter === filters[f].key);
            ctx.fillStyle = isFilterActive ? '#78350f' : '#fef3c7';
            ctx.strokeStyle = isFilterActive ? '#fbbf24' : '#d97706';
            ctx.lineWidth = 1.5;
            this.fillRoundedRect(ctx, fx, 66, 102, 28, 6);
            ctx.stroke();

            ctx.font = 'bold 11px GameFont, sans-serif';
            ctx.fillStyle = isFilterActive ? '#ffffff' : '#78350f';
            ctx.textAlign = 'center';
            ctx.fillText(filters[f].label, fx + 51, 85);
            fx += 114;
        }

        // 3. Ambil Daftar Log Terfilter
        var allLogs = ($gameSystem && $gameSystem._activityLogs) ? $gameSystem._activityLogs : [];
        var activeFilter = this._archiveLogFilter || 'all';
        var filteredLogs = allLogs.filter(function(l) {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'dialogue') return l.type === 'dialogue';
            if (activeFilter === 'item') return (l.type === 'item' || l.type === 'equip');
            if (activeFilter === 'status') return (l.type === 'status' || l.type === 'skill');
            return true;
        });

        // 4. Render 7 Baris Entri Log Menurun
        var curLogIdx = this._archiveLogIndex || 0;
        var startY = 112;
        var rowH = 68;

        for (var i = 0; i < 7; i++) {
            var log = filteredLogs[i];
            var ry = startY + i * (rowH + 6);
            var isSel = (i === curLogIdx);

            ctx.save();

            // Background Baris Kartu Log
            ctx.fillStyle = isSel ? '#fef3c7' : 'rgba(255, 255, 255, 0.72)';
            ctx.strokeStyle = isSel ? '#f59e0b' : '#e2e8f0';
            ctx.lineWidth = isSel ? 2.5 : 1.2;
            if (isSel) {
                ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
                ctx.shadowBlur = 8;
            }
            this.fillRoundedRect(ctx, 32, ry, 444, rowH, 8);
            ctx.stroke();
            ctx.shadowColor = 'transparent';

            if (log) {
                // Tag Kategori Teks Bersih
                var tag = log.type === 'dialogue' ? 'Dialog' : (log.type === 'item' ? 'Item' : (log.type === 'skill' ? 'Skill' : 'Catatan'));
                ctx.font = 'bold 11px GameFont, sans-serif';
                ctx.fillStyle = isSel ? '#92400e' : '#64748b';
                ctx.textAlign = 'left';
                ctx.fillText('[' + tag + ']', 46, ry + 28);

                // Judul Singkat
                ctx.font = 'bold 13px GameFont, sans-serif';
                ctx.fillStyle = isSel ? '#78350f' : '#1e293b';
                var shortText = log.text.length > 34 ? log.text.substring(0, 34) + '...' : log.text;
                ctx.fillText(shortText, 102, ry + 28);

                // Tanggal / Waktu Bermain
                ctx.font = '11px GameFont, sans-serif';
                ctx.fillStyle = isSel ? '#b45309' : '#94a3b8';
                var timeStr = log.date ? ('Waktu: ' + log.date) : ('Waktu: ' + log.time);
                ctx.fillText(timeStr, 46, ry + 48);

                // Indikator panah pada item aktif
                if (isSel) {
                    ctx.font = 'bold 16px sans-serif';
                    ctx.fillStyle = '#d97706';
                    ctx.textAlign = 'right';
                    ctx.fillText('›', 464, ry + 40);
                }
            } else {
                ctx.font = 'italic 12px GameFont, sans-serif';
                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                ctx.fillText('- Kosong -', 254, ry + 40);
            }

            ctx.restore();
        }

        // Panduan navigasi bawah
        ctx.font = 'bold 12px GameFont, sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.textAlign = 'left';
        ctx.fillText('[ESC] Kembali  •  [▲/▼] Pilih  •  [Q/W] Filter', 32, 642);

        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.drawArchiveLogDetail = function() {
        if (!this._archiveLogsRightSprite) return;
        var bmp = this._archiveLogsRightSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();

        // Ambil entri log yang sedang disorot di sebelah kiri
        var allLogs = ($gameSystem && $gameSystem._activityLogs) ? $gameSystem._activityLogs : [];
        var activeFilter = this._archiveLogFilter || 'all';
        var filteredLogs = allLogs.filter(function(l) {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'dialogue') return l.type === 'dialogue';
            if (activeFilter === 'item') return (l.type === 'item' || l.type === 'equip');
            if (activeFilter === 'status') return (l.type === 'status' || l.type === 'skill');
            return true;
        });

        var curLog = filteredLogs[this._archiveLogIndex || 0];

        // 1. Lembar Kertas Catatan Detail (Parchment Besar dengan Lakban)
        var cardX = 35;
        var cardY = 40;
        var cardW = 438;
        var cardH = 585;

        ctx.fillStyle = '#fffdf9';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        this.fillRoundedRect(ctx, cardX, cardY, cardW, cardH, 14);
        ctx.stroke();
        ctx.shadowColor = 'transparent';

        // Lakban di atas kertas catatan
        ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.fillRect(cardX + cardW / 2 - 35, cardY - 8, 70, 16);

        if (!curLog) {
            ctx.font = 'italic 14px GameFont, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText('Pilih catatan di sebelah kiri untuk melihat rincian.', cardX + cardW / 2, cardY + cardH / 2);
            ctx.restore();
            bmp._setDirty();
            return;
        }

        // 2. Header Kategori & Judul Log (Bersih & Elegan)
        var categoryName = curLog.type === 'item' ? 'Perolehan Item' : (curLog.type === 'dialogue' ? 'Percakapan Rekan' : (curLog.type === 'skill' ? 'Keahlian Baru' : 'Catatan Peristiwa'));

        ctx.font = 'bold 18px GameFont, sans-serif';
        ctx.fillStyle = '#451a03';
        ctx.textAlign = 'left';
        ctx.fillText(categoryName, cardX + 28, cardY + 44);

        ctx.font = '12px GameFont, sans-serif';
        ctx.fillStyle = '#854d0e';
        ctx.fillText('Waktu Kejadian: ' + (curLog.date || 'Petualangan #' + curLog.time), cardX + 28, cardY + 64);

        // Garis Pembatas
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cardX + 24, cardY + 76); ctx.lineTo(cardX + cardW - 24, cardY + 76);
        ctx.stroke();

        // 3. Tampilan Konten Khusus Berdasarkan Tipe Log
        if (curLog.type === 'dialogue') {
            // Tampilan Dialog: Speech Bubble Elegan
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1.5;
            this.fillRoundedRect(ctx, cardX + 24, cardY + 98, cardW - 48, 220, 12);
            ctx.stroke();

            ctx.font = 'bold 15px GameFont, sans-serif';
            ctx.fillStyle = '#0f172a';
            ctx.textAlign = 'left';
            ctx.fillText('Kutipan Percakapan:', cardX + 42, cardY + 128);

            // Isi Percakapan Berbalut Kata
            ctx.font = '14px GameFont, sans-serif';
            ctx.fillStyle = '#334155';
            var dWords = (curLog.detail || curLog.text).split(' ');
            var dLine = '';
            var dLineY = cardY + 160;
            for (var w = 0; w < dWords.length; w++) {
                var testLine = dLine + dWords[w] + ' ';
                if (ctx.measureText(testLine).width > (cardW - 88) && w > 0) {
                    ctx.fillText(dLine, cardX + 42, dLineY);
                    dLine = dWords[w] + ' ';
                    dLineY += 26;
                } else {
                    dLine = testLine;
                }
            }
            ctx.fillText(dLine, cardX + 42, dLineY);

        } else if (curLog.type === 'item' || curLog.type === 'equip') {
            // Tampilan Item: Kartu Item Lengkap
            ctx.fillStyle = '#fef3c7';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            this.fillRoundedRect(ctx, cardX + 24, cardY + 98, cardW - 48, 140, 12);
            ctx.stroke();

            ctx.font = 'bold 17px GameFont, sans-serif';
            ctx.fillStyle = '#78350f';
            ctx.textAlign = 'left';
            ctx.fillText(curLog.text, cardX + 42, cardY + 138);

            ctx.font = 'italic 13px GameFont, sans-serif';
            ctx.fillStyle = '#92400e';
            ctx.fillText('Telah tersimpan di dalam tas perbekalan petualang.', cardX + 42, cardY + 168);

            if (curLog.detail) {
                ctx.font = '13px GameFont, sans-serif';
                ctx.fillStyle = '#451a03';
                ctx.fillText('Catatan: ' + curLog.detail, cardX + 42, cardY + 200);
            }

        } else {
            // Tampilan Umum / Event
            ctx.fillStyle = '#eff6ff';
            ctx.strokeStyle = '#93c5fd';
            ctx.lineWidth = 1.5;
            this.fillRoundedRect(ctx, cardX + 24, cardY + 98, cardW - 48, 160, 12);
            ctx.stroke();

            ctx.font = 'bold 16px GameFont, sans-serif';
            ctx.fillStyle = '#1e3a8a';
            ctx.textAlign = 'left';
            ctx.fillText(curLog.text, cardX + 42, cardY + 138);

            ctx.font = '13px GameFont, sans-serif';
            ctx.fillStyle = '#1e40af';
            var evDetail = curLog.detail || 'Peristiwa penting yang berhasil dituntaskan dalam perjalanan.';
            ctx.fillText(evDetail, cardX + 42, cardY + 172);
        }

        ctx.restore();
        bmp._setDirty();
    };

    // ------------------------------------------------------------------------
    // D. UPDATE RETICLE SELEKSI ARCHIVE
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.updateArchiveReticle = function() {
        if (!this._archiveReticleSprite) return;

        if (this._archiveSubMode === 'hub') {
            this._archiveReticleSprite.visible = true;
            if (this._archiveHubFocus === 'memories') {
                // Tepat di tengah tombol "BUKA GALERI CG" pada halaman kiri
                // Left page: x: 239, y: 21. Tombol: x: 44, y: 540, w: 420, h: 72
                this._archiveReticleSprite.x = 239 + 44 + 420 / 2; // 493
                this._archiveReticleSprite.y = 21 + 540 + 72 / 2;  // 597
                this.drawArchiveReticleGraphic(426, 76);
            } else {
                // Tepat di tengah tombol "BUKA LOG PERCAKAPAN" pada halaman kanan
                // Right page: x: 746, y: 23. Tombol: x: 44, y: 540, w: 420, h: 72
                this._archiveReticleSprite.x = 746 + 44 + 420 / 2; // 1000
                this._archiveReticleSprite.y = 23 + 540 + 72 / 2;  // 599
                this.drawArchiveReticleGraphic(426, 76);
            }
        } else {
            this._archiveReticleSprite.visible = false;
        }
    };

    Scene_StatusJournal.prototype.drawArchiveReticleGraphic = function(w, h) {
        var bmp = this._archiveReticleSprite.bitmap;
        bmp.clear();
        var ctx = bmp._context;
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.95)';
        ctx.shadowBlur = 12;

        // Gambar kotak rounded yang tepat berpusat di tengah bitmap (anchor 0.5, 0.5)
        var cx = bmp.width / 2;
        var cy = bmp.height / 2;
        var bx = cx - w / 2;
        var by = cy - h / 2;
        var r = 14;

        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + w - r, by);
        ctx.quadraticCurveTo(bx + w, by, bx + w, by + r);
        ctx.lineTo(bx + w, by + h - r);
        ctx.quadraticCurveTo(bx + w, by + h, bx + w - r, by + h);
        ctx.lineTo(bx + r, by + h);
        ctx.quadraticCurveTo(bx, by + h, bx, by + h - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
        bmp._setDirty();
    };

    // ------------------------------------------------------------------------
    // E. SISTEM INPUT HALAMAN ARCHIVE
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.handleArchiveInput = function() {
        // Helper deteksi tombol konfirmasi: Enter, Space, Z, C (pageup), D
        var isConfirm = Input.isTriggered('ok') || (Input._currentState && (Input._currentState[67] || Input._currentState[68]));
        // Helper deteksi tombol batal/kembali: Esc, Cancel, X
        var isCancel = Input.isTriggered('cancel') || Input.isTriggered('escape');

        // 1. INPUT DI FULLSCREEN CG VIEWER
        if (this._archiveSubMode === 'viewer') {
            if (isCancel || isConfirm || TouchInput.isTriggered()) {
                SoundManager.playCancel();
                this._archiveSubMode = 'gallery';
                this.refreshArchivePage();
                this.drawFooterGuide();
            }
            return;
        }

        // 2. INPUT DI HUB UTAMA (MEMORIES vs LOGS)
        if (this._archiveSubMode === 'hub') {
            if (Input.isRepeated('left')) {
                if (this._archiveHubFocus === 'logs') {
                    SoundManager.playCursor();
                    this._archiveHubFocus = 'memories';
                    this.refreshArchivePage();
                } else {
                    this.focusRibbons();
                }
            } else if (Input.isRepeated('right')) {
                if (this._archiveHubFocus === 'memories') {
                    SoundManager.playCursor();
                    this._archiveHubFocus = 'logs';
                    this.refreshArchivePage();
                }
            } else if (isConfirm) {
                SoundManager.playOk();
                if (this._archiveHubFocus === 'memories') {
                    this._archiveSubMode = 'gallery';
                    this._archiveGalleryIndex = 0;
                } else {
                    this._archiveSubMode = 'logs';
                    this._archiveLogIndex = 0;
                }
                this.refreshArchivePage();
                this.drawFooterGuide();
            } else if (isCancel) {
                this.focusRibbons();
            }
            return;
        }

        // 3. INPUT DI ALBUM GALERI CG (SCRAPBOOK 8 POLAROID)
        if (this._archiveSubMode === 'gallery') {
            var cur = this._archiveGalleryIndex || 0;
            if (Input.isRepeated('left')) {
                if (cur % 2 === 1) {
                    SoundManager.playCursor();
                    this._archiveGalleryIndex--;
                    this.drawArchiveGalleryAlbum();
                } else if (cur >= 4) {
                    SoundManager.playCursor();
                    this._archiveGalleryIndex -= 3;
                    this.drawArchiveGalleryAlbum();
                }
            } else if (Input.isRepeated('right')) {
                if (cur % 2 === 0) {
                    SoundManager.playCursor();
                    this._archiveGalleryIndex++;
                    this.drawArchiveGalleryAlbum();
                } else if (cur < 4) {
                    SoundManager.playCursor();
                    this._archiveGalleryIndex += 3;
                    this.drawArchiveGalleryAlbum();
                }
            } else if (Input.isRepeated('up')) {
                if (cur >= 2) {
                    SoundManager.playCursor();
                    this._archiveGalleryIndex -= 2;
                    this.drawArchiveGalleryAlbum();
                }
            } else if (Input.isRepeated('down')) {
                if (cur < 6) {
                    SoundManager.playCursor();
                    this._archiveGalleryIndex += 2;
                    this.drawArchiveGalleryAlbum();
                }
            } else if (isConfirm) {
                var cgItems = (typeof CustomGalleryManager !== 'undefined') ? CustomGalleryManager.scan() : [];
                var item = cgItems[this._archiveGalleryIndex];
                if (item) {
                    SoundManager.playOk();
                    this.openArchiveFullscreenViewer(item);
                    this.drawFooterGuide();
                } else {
                    SoundManager.playBuzzer();
                }
            } else if (isCancel) {
                SoundManager.playCancel();
                this._archiveSubMode = 'hub';
                this.refreshArchivePage();
                this.drawFooterGuide();
            }
            return;
        }

        // 4. INPUT DI ADVENTURE LOG PAGE (DAFTAR LOG & DETAIL)
        if (this._archiveSubMode === 'logs') {
            var allLogs = ($gameSystem && $gameSystem._activityLogs) ? $gameSystem._activityLogs : [];
            var activeFilter = this._archiveLogFilter || 'all';
            var filteredLogs = allLogs.filter(function(l) {
                if (activeFilter === 'all') return true;
                if (activeFilter === 'dialogue') return l.type === 'dialogue';
                if (activeFilter === 'item') return (l.type === 'item' || l.type === 'equip');
                if (activeFilter === 'status') return (l.type === 'status' || l.type === 'skill');
                return true;
            });

            var maxIndex = Math.min(6, filteredLogs.length - 1);

            if (Input.isRepeated('up')) {
                if (this._archiveLogIndex > 0) {
                    SoundManager.playCursor();
                    this._archiveLogIndex--;
                    this.drawArchiveLogsList();
                    this.drawArchiveLogDetail();
                }
            } else if (Input.isRepeated('down')) {
                if (this._archiveLogIndex < maxIndex) {
                    SoundManager.playCursor();
                    this._archiveLogIndex++;
                    this.drawArchiveLogsList();
                    this.drawArchiveLogDetail();
                }
            } else if (Input.isTriggered('pageup') || Input.isRepeated('left')) {
                SoundManager.playCursor();
                var filters = ['all', 'dialogue', 'item', 'status'];
                var fIdx = filters.indexOf(this._archiveLogFilter);
                this._archiveLogFilter = filters[(fIdx + 3) % 4];
                this._archiveLogIndex = 0;
                this.drawArchiveLogsList();
                this.drawArchiveLogDetail();
            } else if (Input.isTriggered('pagedown') || Input.isRepeated('right')) {
                SoundManager.playCursor();
                var filters = ['all', 'dialogue', 'item', 'status'];
                var fIdx = filters.indexOf(this._archiveLogFilter);
                this._archiveLogFilter = filters[(fIdx + 1) % 4];
                this._archiveLogIndex = 0;
                this.drawArchiveLogsList();
                this.drawArchiveLogDetail();
            } else if (isCancel) {
                SoundManager.playCancel();
                this._archiveSubMode = 'hub';
                this.refreshArchivePage();
                this.drawFooterGuide();
            }
        }
    };

    // Buka Tampilan Fullscreen CG Viewer
    Scene_StatusJournal.prototype.openArchiveFullscreenViewer = function(item) {
        if (!item || !this._archiveViewerContainer) return;
        this._archiveSubMode = 'viewer';
        this._archiveViewerContainer.visible = true;

        var cgBmp = ImageManager.loadPicture(item.file);
        this._archiveViewerImageSprite.bitmap = cgBmp;

        // Prompt teks
        var pBmp = this._archiveViewerPromptSprite.bitmap;
        pBmp.clear();
        var ctx = pBmp._context;
        ctx.font = 'bold 14px GameFont, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 6;
        ctx.fillText('[ESC] atau [ENTER] untuk Kembali ke Album', Graphics.boxWidth / 2, 38);
        pBmp._setDirty();
    };

    // Helper: Rounded Rectangle Fill
    Scene_StatusJournal.prototype.fillRoundedRect = function(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    };

    // ------------------------------------------------------------------------
    // MOUSE TOUCH HANDLER HALAMAN ARCHIVE (TAB 5)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.handleArchiveTouch = function(mx, my) {
        if (this._archiveSubMode === 'viewer') {
            SoundManager.playCancel();
            this._archiveSubMode = 'gallery';
            this.refreshArchivePage();
            this.drawFooterGuide();
            return;
        }

        // SubMode: HUB UTAMA
        if (this._archiveSubMode === 'hub') {
            // Halaman Kiri: Memories (x: 239..747, y: 21..689)
            if (mx >= 239 && mx <= 747 && my >= 21 && my <= 689) {
                if (this._archiveHubFocus === 'memories') {
                    SoundManager.playOk();
                    this._archiveSubMode = 'gallery';
                    this._archiveGalleryIndex = 0;
                    this.refreshArchivePage();
                    this.drawFooterGuide();
                } else {
                    SoundManager.playCursor();
                    this._archiveHubFocus = 'memories';
                    this.refreshArchivePage();
                }
                return;
            }
            // Halaman Kanan: Adventure Logs (x: 748..1254, y: 21..689)
            if (mx >= 748 && mx <= 1254 && my >= 21 && my <= 689) {
                if (this._archiveHubFocus === 'logs') {
                    SoundManager.playOk();
                    this._archiveSubMode = 'logs';
                    this._archiveLogIndex = 0;
                    this.refreshArchivePage();
                    this.drawFooterGuide();
                } else {
                    SoundManager.playCursor();
                    this._archiveHubFocus = 'logs';
                    this.refreshArchivePage();
                }
                return;
            }
            return;
        }

        // SubMode: GALLERY (Scrapbook 8 Polaroid)
        if (this._archiveSubMode === 'gallery') {
            // Tombol Kembali di kiri bawah
            if (mx >= 250 && mx <= 460 && my >= 630 && my <= 680) {
                SoundManager.playCancel();
                this._archiveSubMode = 'hub';
                this.refreshArchivePage();
                this.drawFooterGuide();
                return;
            }

            var slotsCfg = [
                { base: 239, baseY: 21, x: 35,  y: 45,  w: 205, h: 260 },
                { base: 239, baseY: 21, x: 265, y: 45,  w: 205, h: 260 },
                { base: 239, baseY: 21, x: 35,  y: 345, w: 205, h: 260 },
                { base: 239, baseY: 21, x: 265, y: 345, w: 205, h: 260 },
                { base: 746, baseY: 23, x: 35,  y: 45,  w: 205, h: 260 },
                { base: 746, baseY: 23, x: 265, y: 45,  w: 205, h: 260 },
                { base: 746, baseY: 23, x: 35,  y: 345, w: 205, h: 260 },
                { base: 746, baseY: 23, x: 265, y: 345, w: 205, h: 260 }
            ];

            for (var s = 0; s < slotsCfg.length; s++) {
                var sl = slotsCfg[s];
                var sx = sl.base + sl.x;
                var sy = sl.baseY + sl.y;
                if (mx >= sx && mx <= sx + sl.w && my >= sy && my <= sy + sl.h) {
                    this._archiveGalleryIndex = s;
                    var cgItems = (typeof CustomGalleryManager !== 'undefined') ? CustomGalleryManager.scan() : [];
                    var item = cgItems[s];
                    if (item) {
                        SoundManager.playOk();
                        this.openArchiveFullscreenViewer(item);
                        this.drawFooterGuide();
                    } else {
                        SoundManager.playBuzzer();
                        this.drawArchiveGalleryAlbum();
                    }
                    return;
                }
            }
            return;
        }

        // SubMode: LOGS (Dua Kolom: List di Kiri, Detail di Kanan)
        if (this._archiveSubMode === 'logs') {
            // Tombol Kembali di kiri bawah
            if (mx >= 250 && mx <= 460 && my >= 640 && my <= 680) {
                SoundManager.playCancel();
                this._archiveSubMode = 'hub';
                this.refreshArchivePage();
                this.drawFooterGuide();
                return;
            }

            // Filter Tabs di Kiri Atas (baseX = 239, baseY = 21)
            var filters = ['all', 'dialogue', 'item', 'status'];
            for (var f = 0; f < filters.length; f++) {
                var fx = 239 + 32 + f * 114;
                var fy = 21 + 66;
                if (mx >= fx && mx <= fx + 102 && my >= fy && my <= fy + 28) {
                    SoundManager.playCursor();
                    this._archiveLogFilter = filters[f];
                    this._archiveLogIndex = 0;
                    this.drawArchiveLogsList();
                    this.drawArchiveLogDetail();
                    return;
                }
            }

            // List Baris Log di Halaman Kiri (0..6)
            var allLogs = ($gameSystem && $gameSystem._activityLogs) ? $gameSystem._activityLogs : [];
            var activeFilter = this._archiveLogFilter || 'all';
            var filteredLogs = allLogs.filter(function(l) {
                if (activeFilter === 'all') return true;
                if (activeFilter === 'dialogue') return l.type === 'dialogue';
                if (activeFilter === 'item') return (l.type === 'item' || l.type === 'equip');
                if (activeFilter === 'status') return (l.type === 'status' || l.type === 'skill');
                return true;
            });

            for (var i = 0; i < 7; i++) {
                var rx = 239 + 32;
                var ry = 21 + 112 + i * 74;
                if (mx >= rx && mx <= rx + 444 && my >= ry && my <= ry + 68) {
                    if (filteredLogs[i]) {
                        SoundManager.playCursor();
                        this._archiveLogIndex = i;
                        this.drawArchiveLogsList();
                        this.drawArchiveLogDetail();
                    }
                    return;
                }
            }
            return;
        }
    };

    // ------------------------------------------------------------------------
    // SISTEM POPUP / TOOLTIP DETAIL SKILL CONSTELLATION (HOVER & KEYBOARD)
    // ------------------------------------------------------------------------
    Scene_StatusJournal.prototype.getSkillElementInfo = function(skill) {
        if (!skill) return { name: 'Non-Elemen', color: '#9ca3af' };
        var elemId = (skill.damage) ? skill.damage.elementId : 0;
        var elemName = '';
        var note = skill.note || '';
        var match = note.match(/<element:\s*([^>]+)>/i);

        if (match) {
            elemName = match[1].trim();
        } else if (elemId === -1) {
            elemName = 'Normal / Fisik';
        } else if (elemId > 0 && typeof $dataSystem !== 'undefined' && $dataSystem.elements && $dataSystem.elements[elemId]) {
            elemName = $dataSystem.elements[elemId].replace(/\s*\(/g, ' (');
        } else if (skill.id === 1) {
            elemName = 'Normal / Fisik';
        } else if (skill.damage && skill.damage.type === 1) {
            elemName = (elemId === 1) ? 'Physical' : 'Non-Elemen';
        } else if (skill.damage && (skill.damage.type === 3 || skill.damage.type === 4)) {
            elemName = 'Pemulihan';
        } else if (skill.damage && skill.damage.type === 0) {
            elemName = 'Support / Buff';
        } else {
            elemName = 'Non-Elemen';
        }

        var lower = elemName.toLowerCase();
        var color = '#9ca3af';
        if (lower.indexOf('fire') >= 0 || lower.indexOf('pyro') >= 0 || lower.indexOf('api') >= 0) {
            color = '#ef4444';
        } else if (lower.indexOf('ice') >= 0 || lower.indexOf('cryo') >= 0 || /\bes\b/i.test(lower)) {
            color = '#06b6d4';
        } else if (lower.indexOf('thunder') >= 0 || lower.indexOf('astra') >= 0 || lower.indexOf('petir') >= 0 || lower.indexOf('listrik') >= 0) {
            color = '#eab308';
        } else if (lower.indexOf('water') >= 0 || lower.indexOf('aqua') >= 0 || lower.indexOf('air') >= 0) {
            color = '#3b82f6';
        } else if (lower.indexOf('earth') >= 0 || lower.indexOf('claustro') >= 0 || lower.indexOf('tanah') >= 0) {
            color = '#84cc16';
        } else if (lower.indexOf('wind') >= 0 || lower.indexOf('ancrao') >= 0 || lower.indexOf('angin') >= 0) {
            color = '#10b981';
        } else if (lower.indexOf('light') >= 0 || lower.indexOf('foto') >= 0 || lower.indexOf('cahaya') >= 0 || lower.indexOf('suci') >= 0) {
            color = '#f59e0b';
        } else if (lower.indexOf('dark') >= 0 || lower.indexOf('nycto') >= 0 || lower.indexOf('kegelapan') >= 0) {
            color = '#a855f7';
        } else if (lower.indexOf('physical') >= 0 || lower.indexOf('fisik') >= 0) {
            color = '#f97316';
        }

        return { name: elemName, color: color };
    };

    Scene_StatusJournal.prototype.drawConstellationSkillPopup = function(skill) {
        if (!this._constellationSkillPopupSprite || !this._constellationSkillPopupSprite.bitmap) return;
        var bmp = this._constellationSkillPopupSprite.bitmap;
        bmp.clear();
        if (!skill) return;

        var ctx = bmp._context;
        var w = bmp.width;
        var h = bmp.height;
        ctx.save();

        // 1. Latar Belakang Kartu Vintage & Bingkai Ganda Elegan
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = 'rgba(24, 19, 23, 0.96)';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;

        // Gambar Kotak Berpenjuru Halus
        var r = 8;
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

        // Garis batas dalam tipis
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(3.5, 3.5, w - 7, h - 7);

        // 2. Elemen Badge (Kanan Atas)
        var elem = this.getSkillElementInfo(skill);
        var elemText = elem.name;
        ctx.font = 'bold 11px GameFont, sans-serif';
        var pillW = Math.max(68, ctx.measureText(elemText).width + 16);
        var pillX = w - 14 - pillW;
        var pillY = 10;
        var pillH = 22;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.strokeStyle = elem.color;
        ctx.lineWidth = 1.2;
        var pr = 4;
        ctx.beginPath();
        ctx.moveTo(pillX + pr, pillY);
        ctx.lineTo(pillX + pillW - pr, pillY);
        ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + pr);
        ctx.lineTo(pillX + pillW, pillY + pillH - pr);
        ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - pr, pillY + pillH);
        ctx.lineTo(pillX + pr, pillY + pillH);
        ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - pr);
        ctx.lineTo(pillX, pillY + pr);
        ctx.quadraticCurveTo(pillX, pillY, pillX + pr, pillY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = elem.color;
        ctx.textAlign = 'center';
        ctx.fillText(elemText, pillX + pillW / 2, pillY + 15);
        ctx.restore();

        // 3. Nama Skill (Kiri Atas)
        ctx.save();
        ctx.font = 'bold 17px GameFont, sans-serif';
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'left';
        var maxNameW = pillX - 14 - 10;
        var sName = skill.name || 'Skill';
        if (ctx.measureText(sName).width > maxNameW) {
            while (sName.length > 3 && ctx.measureText(sName + '...').width > maxNameW) {
                sName = sName.slice(0, -1);
            }
            sName += '...';
        }
        ctx.fillText(sName, 14, 26);
        ctx.restore();

        // 4. Kategori & Rangkuman Statistik Skill (Baris 2)
        var cat = this.classifySkill(skill);
        var catTag = '[Attack]';
        var catColor = '#f87171';
        if (cat === 'defends') { catTag = '[Defense]'; catColor = '#60a5fa'; }
        else if (cat === 'special') { catTag = '[Special]'; catColor = '#fbbf24'; }

        var statParts = [];
        if (skill.mpCost > 0 && skill.tpCost > 0) statParts.push(skill.mpCost + ' MP / ' + skill.tpCost + ' TP');
        else if (skill.mpCost > 0) statParts.push(skill.mpCost + ' MP');
        else if (skill.tpCost > 0) statParts.push(skill.tpCost + ' TP');
        else statParts.push('0 MP');

        var scopes = {
            1: '1 Musuh', 2: 'Semua Musuh', 3: '1 Acak', 4: '2 Acak',
            5: '3 Acak', 6: '4 Acak', 7: '1 Rekan', 8: 'Semua Rekan',
            9: '1 Gugur', 10: 'Semua Gugur', 11: 'Diri Sendiri'
        };
        if (scopes[skill.scope]) statParts.push(scopes[skill.scope]);

        if (skill.damage) {
            if (skill.damage.type === 1) statParts.push('HP Dmg');
            else if (skill.damage.type === 2) statParts.push('MP Dmg');
            else if (skill.damage.type === 3) statParts.push('HP Heal');
            else if (skill.damage.type === 4) statParts.push('MP Heal');
            else if (skill.damage.type === 5) statParts.push('HP Drain');
            else if (skill.damage.type === 6) statParts.push('MP Drain');
        }
        if (skill.repeats > 1) statParts.push(skill.repeats + 'x Hit');
        if (skill.speed > 0) statParts.push('Spd +' + skill.speed);
        else if (skill.speed < 0) statParts.push('Spd ' + skill.speed);

        ctx.save();
        ctx.font = '12px GameFont, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = catColor;
        ctx.fillText(catTag, 14, 48);

        var catWidth = ctx.measureText(catTag + '  •  ').width;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('•  ' + statParts.join('  •  '), 14 + catWidth - 8, 48);
        ctx.restore();

        // 5. Garis Pembatas Emas Vintage
        ctx.strokeStyle = 'rgba(217, 180, 130, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(14, 58);
        ctx.lineTo(w - 14, 58);
        ctx.stroke();

        // 6. Deskripsi Skill (Word Wrap Rapih)
        ctx.save();
        ctx.font = '13px GameFont, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'left';

        var desc = (skill.description || '').trim();
        if (!desc) {
            if (skill.id === 1) desc = 'Menyerang musuh secara langsung menggunakan senjata.';
            else if (skill.id === 2) desc = 'Mengambil posisi bertahan untuk mengurangi damage serangan lawan.';
            else if (cat === 'defends') desc = 'Mendukung rekan tim atau memulihkan kondisi pertempuran.';
            else if (cat === 'special') desc = 'Mengeksekusi kemampuan khusus berkekuatan tinggi.';
            else desc = 'Melancarkan serangan terfokus untuk menghantam musuh.';
        }

        var words = desc.split(' ');
        var line = '';
        var lineY = 76;
        var lineH = 18;
        var maxLineW = w - 28;

        for (var i = 0; i < words.length; i++) {
            var testLine = line + (line ? ' ' : '') + words[i];
            if (ctx.measureText(testLine).width > maxLineW && line) {
                ctx.fillText(line, 14, lineY);
                line = words[i];
                lineY += lineH;
                if (lineY > h - 30) break;
            } else {
                line = testLine;
            }
        }
        if (line && lineY <= h - 26) {
            ctx.fillText(line, 14, lineY);
        }
        ctx.restore();

        // 7. Indikator Spesial (QTE / Unique Tag di Kiri Bawah)
        var note = skill.note || '';
        var badgeX = 14;
        var badgeY = h - 24;

        if (/<qte:/i.test(note)) {
            ctx.save();
            ctx.font = 'bold 10px GameFont, sans-serif';
            var qteText = 'QTE ACTION';
            var qteW = ctx.measureText(qteText).width + 12;
            ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1;
            ctx.strokeRect(badgeX, badgeY, qteW, 16);
            ctx.fillRect(badgeX, badgeY, qteW, 16);
            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'left';
            ctx.fillText(qteText, badgeX + 6, badgeY + 12);
            badgeX += qteW + 8;
            ctx.restore();
        }

        if (/<unique_skill>/i.test(note) || /<unique>/i.test(note)) {
            ctx.save();
            ctx.font = 'bold 10px GameFont, sans-serif';
            var uText = 'UNIQUE SKILL';
            var uW = ctx.measureText(uText).width + 12;
            ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 1;
            ctx.strokeRect(badgeX, badgeY, uW, 16);
            ctx.fillRect(badgeX, badgeY, uW, 16);
            ctx.fillStyle = '#f472b6';
            ctx.textAlign = 'left';
            ctx.fillText(uText, badgeX + 6, badgeY + 12);
            ctx.restore();
        }

        ctx.restore();
        bmp._setDirty();
    };

    Scene_StatusJournal.prototype.updateConstellationSkillPopup = function() {
        if (!this._constellationSkillPopupSprite) return;
        if (this._activeJournalTab !== 4 || this._focusMode !== 'slots' || this._constellationMouseOff) {
            this._constellationSkillPopupSprite.visible = false;
            this._lastConstellationPopupSkillId = null;
            return;
        }

        var actor = $gameParty.menuActor();
        if (!actor) {
            this._constellationSkillPopupSprite.visible = false;
            return;
        }

        var skill = null;
        var cfg = STATUS_JOURNAL_CONFIG.constellationJournal || {};
        var popW = 350;
        var popH = 185;
        var targetX = 0;
        var targetY = 0;

        if (this._constellationFocus === 'tree') {
            var pIdx = (actor._constellationActivePreset !== undefined) ? actor._constellationActivePreset : (this._constellationRomanIndex || 0);
            var preset = (actor._constellationPresets && actor._constellationPresets[pIdx]) || [0, 0, 0, 0, 0];
            var nodeIdx = this._constellationNodeIndex || 0;
            var skillId = preset[nodeIdx];
            skill = (skillId > 0 && typeof $dataSkills !== 'undefined') ? $dataSkills[skillId] : null;

            if (skill) {
                var nodes = cfg.treeNodes || [
                    { id: 0, x: 74, y: 69, w: 143, h: 143 },
                    { id: 1, x: 245, y: 154, w: 143, h: 143 },
                    { id: 2, x: 75, y: 258, w: 143, h: 143 },
                    { id: 3, x: 244, y: 364, w: 143, h: 143 },
                    { id: 4, x: 74, y: 449, w: 143, h: 143 }
                ];
                var n = nodes[nodeIdx] || nodes[0];
                var treeX = (cfg.tree && cfg.tree.x) || 43;
                var treeY = (cfg.tree && cfg.tree.y) || 18;
                var nAbsX = 239 + treeX + n.x;
                var nAbsY = 21 + treeY + n.y;

                // Selalu tempatkan popup di sebelah kanan node (tidak menutupi slot pohon aktif)
                targetX = nAbsX + n.w + 14;
                targetY = nAbsY + (n.h - popH) / 2;
            }
        } else if (this._constellationFocus === 'grid') {
            var skills = this.getConstellationSkillList();
            var gIdx = this._constellationGridIndex || 0;
            skill = skills[gIdx] || null;

            if (skill) {
                var gCfg = cfg.grid || { startX: 12, startY: 146, cols: 4, rows: 5, spacingX: 122, spacingY: 98, slotW: 108, slotH: 92 };
                var col = gIdx % gCfg.cols;
                var row = Math.floor(gIdx / gCfg.cols);
                var sAbsX = 746 + gCfg.startX + col * gCfg.spacingX;
                var sAbsY = 23 + gCfg.startY + row * gCfg.spacingY;

                // Jika kolom >= 2 (kanan), tampilkan popup di sebelah kiri slot agar tidak terpotong
                if (col >= 2) {
                    targetX = sAbsX - popW - 12;
                } else {
                    targetX = sAbsX + gCfg.slotW + 12;
                }
                targetY = sAbsY + (gCfg.slotH - popH) / 2;
            }
        }

        if (!skill) {
            this._constellationSkillPopupSprite.visible = false;
            this._lastConstellationPopupSkillId = null;
            return;
        }

        // Batasi koordinat agar selalu berada di dalam area buku jurnal
        targetX = Math.max(248, Math.min(targetX, 1245 - popW));
        targetY = Math.max(25, Math.min(targetY, 685 - popH));

        this._constellationSkillPopupSprite.x = targetX;
        this._constellationSkillPopupSprite.y = targetY;
        this._constellationSkillPopupSprite.visible = true;

        if (this._lastConstellationPopupSkillId !== skill.id) {
            this._lastConstellationPopupSkillId = skill.id;
            this.drawConstellationSkillPopup(skill);
        }
    };
