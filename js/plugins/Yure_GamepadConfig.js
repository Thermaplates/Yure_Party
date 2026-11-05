//=============================================================================
// Yure_GamepadConfig.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Gamepad Configuration System (Mendukung Custom Plugin Controls).
 * @author Yure Party Team
 *
 * @param ---General---
 * @default
 *
 * @param Command Name
 * @parent ---General---
 * @text Command Name
 * @desc Nama opsi yang tampil di menu Options.
 * @default Gamepad Config
 *
 * @param Controller Type
 * @parent ---General---
 * @text Controller Type
 * @type select
 * @option Xbox
 * @option PlayStation
 * @option Nintendo
 * @option Generic
 * @desc Tampilan nama/ikon tombol default (Xbox: A/B/X/Y, PS: X/O/□/△, Nintendo: B/A/Y/X).
 * @default Xbox
 *
 * @param ---Colors---
 * @default
 *
 * @param Action Color
 * @parent ---Colors---
 * @text Action Color
 * @type number
 * @min 0
 * @max 31
 * @desc Warna teks aksi yang terpasang (Window Skin Color ID).
 * @default 4
 *
 * @param Custom Action Color
 * @parent ---Colors---
 * @text Custom Action Color
 * @type number
 * @min 0
 * @max 31
 * @desc Warna teks aksi kustom plugin (Window Skin Color ID).
 * @default 6
 *
 * @param Button Color
 * @parent ---Colors---
 * @text Button Color
 * @type number
 * @min 0
 * @max 31
 * @desc Warna teks label tombol controller (Window Skin Color ID).
 * @default 14
 *
 * @param ---Vocabulary---
 * @default
 *
 * @param Reset Default Text
 * @parent ---Vocabulary---
 * @text Reset Default Text
 * @desc Teks tombol kembalikan ke pengaturan default.
 * @default Default Layout
 *
 * @param Finish Config Text
 * @parent ---Vocabulary---
 * @text Finish Config Text
 * @desc Teks tombol selesai konfigurasi.
 * @default Finish Configuration
 *
 * @param Clear Action Text
 * @parent ---Vocabulary---
 * @text Clear Action Text
 * @desc Teks untuk mengosongkan/menghapus aksi dari tombol.
 * @default [Clear / None]
 *
 * @param ---Help Texts---
 * @default
 *
 * @param Button Help Text
 * @parent ---Help Texts---
 * @desc Bantuan saat memilih tombol controller.
 * @default Tekan OK untuk mengubah fungsi tombol controller ini.
 *
 * @param Reset Help Text
 * @parent ---Help Texts---
 * @desc Bantuan untuk tombol reset default.
 * @default Mengembalikan seluruh pemetaan tombol gamepad ke pengaturan standar.
 *
 * @param Finish Help Text
 * @parent ---Help Texts---
 * @desc Bantuan untuk tombol selesai.
 * @default Simpan pengaturan gamepad dan kembali ke menu sebelumnya.
 *
 * @param Controller Switch Help
 * @parent ---Help Texts---
 * @desc Bantuan untuk tombol switch tipe controller.
 * @default Ganti gaya penamaan tombol (Xbox / PlayStation / Nintendo / Generic).
 *
 * @help
 * ============================================================================
 * YURE GAMEPAD CONFIGURATION SYSTEM
 * ============================================================================
 * Plugin ini menambahkan menu konfigurasi Gamepad / Controller yang lengkap 
 * di dalam menu Options (Pilihan).
 *
 * FITUR UTAMA:
 * 1. Mendukung Semua Controller Standar:
 *    - Xbox (A, B, X, Y, LB, RB, LT, RT, D-Pad, Start, Back, L3, R3)
 *    - PlayStation / DualShock / DualSense (Cross, Circle, Square, Triangle, L1, R1, L2, R2, dll)
 *    - Nintendo Switch Pro Controller (B, A, Y, X, L, R, ZL, ZR, Plus, Minus, dll)
 *    - Generic Controller (Button 0..15)
 *
 * 2. Mendukung Custom Controls dari Plugin Yure Party:
 *    - constellation : Buka Menu Rasi Bintang / Pohon Kombo (Yure_ConstellationMenu)
 *    - lanternToggle : Nyalakan / Matikan Lentera Penerangan (Yure_Atmosphere)
 *    - tab           : Sembunyikan / Tampilkan Actor HUD di Map (Yure_ToggleHUD)
 *    - yure_t        : Buka Info Detail Status Musuh di Battle (Yure_BattleStatus)
 *    - ok, cancel, shift, menu, pageup, pagedown, up, down, left, right, escape.
 *
 * 3. Navigasi Penuh:
 *    - Menu konfigurasi dapat dinavigasi dengan Keyboard, Mouse, maupun Gamepad langsung.
 *    - Pergantian Controller Type (Xbox / PS / Nintendo) dapat dilakukan 
 *      langsung di dalam menu dengan menekan tombol L/R (PageUp/PageDown) atau klik judulnya.
 *    - Pengaturan disimpan secara permanen di file save konfigurasi (config.rpgsave).
 * ============================================================================
 */

var Imported = Imported || {};
Imported.Yure_GamepadConfig = true;

var Yure = Yure || {};
Yure.GamepadConfig = Yure.GamepadConfig || {};
Yure.GamepadConfig.version = 1.0;

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_GamepadConfig');
    var pCommandName      = String(parameters['Command Name'] || 'Gamepad Config');
    var pControllerType   = String(parameters['Controller Type'] || 'Xbox');
    var pActionColor      = Number(parameters['Action Color'] || 4);
    var pCustomColor      = Number(parameters['Custom Action Color'] || 6);
    var pButtonColor      = Number(parameters['Button Color'] || 14);
    var pResetText        = String(parameters['Reset Default Text'] || 'Default Layout');
    var pFinishText       = String(parameters['Finish Config Text'] || 'Finish Configuration');
    var pClearText        = String(parameters['Clear Action Text'] || '[Clear / None]');
    var pBtnHelp          = String(parameters['Button Help Text'] || 'Tekan OK untuk mengubah fungsi tombol controller ini.');
    var pResetHelp        = String(parameters['Reset Help Text'] || 'Mengembalikan seluruh pemetaan tombol gamepad ke pengaturan standar.');
    var pFinishHelp       = String(parameters['Finish Help Text'] || 'Simpan pengaturan gamepad dan kembali ke menu sebelumnya.');
    var pSwitchHelp       = String(parameters['Controller Switch Help'] || 'Ganti gaya penamaan tombol (Xbox / PlayStation / Nintendo / Generic).');

    // ============================================================================
    // Button Definitions & Display Names per Controller Type
    // ============================================================================
    var CONTROLLER_TYPES = ['Xbox', 'PlayStation', 'Nintendo', 'Generic'];

    var BUTTON_NAMES = {
        'Xbox': {
            0: 'A Button (Bottom)',
            1: 'B Button (Right)',
            2: 'X Button (Left)',
            3: 'Y Button (Top)',
            4: 'LB (Left Bumper)',
            5: 'RB (Right Bumper)',
            6: 'LT (Left Trigger)',
            7: 'RT (Right Trigger)',
            8: 'Back / View',
            9: 'Start / Menu',
            10: 'LS Click (L3)',
            11: 'RS Click (R3)',
            12: 'D-Pad Up',
            13: 'D-Pad Down',
            14: 'D-Pad Left',
            15: 'D-Pad Right'
        },
        'PlayStation': {
            0: '✕ Cross (Bottom)',
            1: '○ Circle (Right)',
            2: '□ Square (Left)',
            3: '△ Triangle (Top)',
            4: 'L1 (Left Shoulder)',
            5: 'R1 (Right Shoulder)',
            6: 'L2 (Left Trigger)',
            7: 'R2 (Right Trigger)',
            8: 'Share / Select',
            9: 'Options / Start',
            10: 'L3 Click',
            11: 'R3 Click',
            12: 'D-Pad Up',
            13: 'D-Pad Down',
            14: 'D-Pad Left',
            15: 'D-Pad Right'
        },
        'Nintendo': {
            0: 'B Button (Bottom)',
            1: 'A Button (Right)',
            2: 'Y Button (Left)',
            3: 'X Button (Top)',
            4: 'L Button',
            5: 'R Button',
            6: 'ZL Trigger',
            7: 'ZR Trigger',
            8: '- Minus Button',
            9: '+ Plus Button',
            10: 'Left Stick Click',
            11: 'Right Stick Click',
            12: 'D-Pad Up',
            13: 'D-Pad Down',
            14: 'D-Pad Left',
            15: 'D-Pad Right'
        },
        'Generic': {
            0: 'Button 0 (Bottom)',
            1: 'Button 1 (Right)',
            2: 'Button 2 (Left)',
            3: 'Button 3 (Top)',
            4: 'Button 4 (L1/LB)',
            5: 'Button 5 (R1/RB)',
            6: 'Button 6 (L2/LT)',
            7: 'Button 7 (R2/RT)',
            8: 'Button 8 (Select)',
            9: 'Button 9 (Start)',
            10: 'Button 10 (L3)',
            11: 'Button 11 (R3)',
            12: 'D-Pad Up',
            13: 'D-Pad Down',
            14: 'D-Pad Left',
            15: 'D-Pad Right'
        }
    };

    // ============================================================================
    // Assignable Actions (Standard + Yure Party Plugins)
    // ============================================================================
    var ACTION_LIST = [
        { symbol: 'clear',         name: pClearText,                   desc: 'Kosongkan fungsi dari tombol ini.', isCustom: false },
        { symbol: 'ok',            name: 'OK / Interact / QTE',        desc: 'Interaksi, bicara, konfirmasi menu, dan tekan tombol saat QTE.', isCustom: false },
        { symbol: 'cancel',        name: 'Cancel / Back',              desc: 'Membatalkan pilihan atau kembali ke menu sebelumnya.', isCustom: false },
        { symbol: 'shift',         name: 'Dash / Run',                 desc: 'Berlari cepat di map atau fungsi khusus Shift.', isCustom: false },
        { symbol: 'menu',          name: 'Main Menu',                  desc: 'Membuka menu utama game.', isCustom: false },
        { symbol: 'pageup',        name: 'Page Up / Prev Character',   desc: 'Pindah ke karakter/halaman sebelumnya di menu.', isCustom: false },
        { symbol: 'pagedown',      name: 'Page Down / Next Character', desc: 'Pindah ke karakter/halaman berikutnya atau Fast-Forward.', isCustom: false },
        { symbol: 'up',            name: 'Move Up',                    desc: 'Bergerak ke atas.', isCustom: false },
        { symbol: 'down',          name: 'Move Down',                  desc: 'Bergerak ke bawah.', isCustom: false },
        { symbol: 'left',          name: 'Move Left',                  desc: 'Bergerak ke kiri.', isCustom: false },
        { symbol: 'right',         name: 'Move Right',                 desc: 'Bergerak ke kanan.', isCustom: false },
        { symbol: 'escape',        name: 'Exit / Escape',              desc: 'Keluar dari title / jalan pintas tombol Escape.', isCustom: false },
        
        // Plugin Controls khusus Yure Party:
        { symbol: 'constellation', name: '[Plugin] Constellation Tree', desc: 'Membuka menu Rasi Bintang & Pohon Kombo Skill (Yure_ConstellationMenu).', isCustom: true },
        { symbol: 'lanternToggle', name: '[Plugin] Toggle Lantern',     desc: 'Menyalakan atau mematikan Lentera / Lampu Penerangan (Yure_Atmosphere).', isCustom: true },
        { symbol: 'tab',           name: '[Plugin] Toggle HUD Map',     desc: 'Menyembunyikan / memunculkan tampilan HUD Aktor di Map (Yure_ToggleHUD).', isCustom: true },
        { symbol: 'yure_t',        name: '[Plugin] Enemy Battle Info',  desc: 'Membuka tampilan status & kelemahan musuh di pertarungan (Yure_BattleStatus).', isCustom: true }
    ];

    // Default Gamepad Mapping untuk Yure Party
    var DEFAULT_GAMEPAD_MAP = {
        0: 'ok',            // A / Cross
        1: 'cancel',        // B / Circle
        2: 'shift',         // X / Square (Dash)
        3: 'menu',          // Y / Triangle (Menu)
        4: 'pageup',        // LB / L1
        5: 'pagedown',      // RB / R1
        6: 'yure_t',        // LT / L2 (Buka Info Status & Detail di Battle)
        7: 'constellation', // RT / R2 (Buka Constellation Menu)
        8: 'tab',           // Back / Select (Toggle HUD Map)
        9: 'menu',          // Start / Options (Menu)
        10: 'lanternToggle', // L3 (Nyalakan Lentera di Map)
        11: 'escape',       // R3
        12: 'up',           // D-Pad Up
        13: 'down',         // D-Pad Down
        14: 'left',         // D-Pad Left
        15: 'right'         // D-Pad Right
    };

    // ============================================================================
    // ConfigManager (Save & Load Gamepad Settings)
    // ============================================================================
    ConfigManager.gamepadMapper = JSON.parse(JSON.stringify(DEFAULT_GAMEPAD_MAP));
    ConfigManager.gamepadControllerType = pControllerType;

    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        var config = _ConfigManager_makeData.call(this);
        config.gamepadMapper = this.gamepadMapper;
        config.gamepadControllerType = this.gamepadControllerType;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this, config);
        if (config.gamepadMapper !== undefined) {
            this.gamepadMapper = config.gamepadMapper;
            // Migrasi otomatis: jika tombol 10 masih yure_t, pindahkan ke tombol 6 (L2)
            if (this.gamepadMapper[10] === 'yure_t') {
                this.gamepadMapper[10] = 'lanternToggle';
            }
            this.gamepadMapper[6] = 'yure_t';
        } else {
            this.gamepadMapper = JSON.parse(JSON.stringify(DEFAULT_GAMEPAD_MAP));
        }
        if (config.gamepadControllerType !== undefined) {
            this.gamepadControllerType = config.gamepadControllerType;
        } else {
            this.gamepadControllerType = pControllerType;
        }
        this.applyGamepadConfig();
    };

    ConfigManager.applyGamepadConfig = function() {
        if (!Input.gamepadMapper) Input.gamepadMapper = {};
        // Bersihkan mapping lama
        for (var i = 0; i <= 15; i++) {
            delete Input.gamepadMapper[i];
        }
        // Pasang mapping baru
        for (var key in this.gamepadMapper) {
            var action = this.gamepadMapper[key];
            if (action && action !== 'clear') {
                Input.gamepadMapper[Number(key)] = action;
            }
        }
        Input.clear();
    };

    // Auto-apply saat startup
    ConfigManager.applyGamepadConfig();

    // ============================================================================
    // Hook Window_Options & Scene_Options
    // ============================================================================
    var _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
    Window_Options.prototype.addGeneralOptions = function() {
        _Window_Options_addGeneralOptions.call(this);
        this.addGamepadConfigCommand();
    };

    Window_Options.prototype.addGamepadConfigCommand = function() {
        this.addCommand(pCommandName, 'gamepadConfig', true);
    };

    var _Window_Options_drawItem = Window_Options.prototype.drawItem;
    Window_Options.prototype.drawItem = function(index) {
        if (this.commandSymbol(index) === 'gamepadConfig') {
            var rect = this.itemRectForText(index);
            var text = this.commandName(index);
            this.resetTextColor();
            this.changePaintOpacity(this.isCommandEnabled(index));
            this.drawText(text, rect.x, rect.y, rect.width, 'left');
        } else {
            _Window_Options_drawItem.call(this, index);
        }
    };

    var _Window_Options_processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function() {
        if (this.commandSymbol(this.index()) === 'gamepadConfig') {
            Window_Command.prototype.processOk.call(this);
        } else {
            _Window_Options_processOk.call(this);
        }
    };

    var _Scene_Options_createOptionsWindow = Scene_Options.prototype.createOptionsWindow;
    Scene_Options.prototype.createOptionsWindow = function() {
        _Scene_Options_createOptionsWindow.call(this);
        this._optionsWindow.setHandler('gamepadConfig', this.commandGamepadConfig.bind(this));
    };

    Scene_Options.prototype.commandGamepadConfig = function() {
        SceneManager.push(Scene_GamepadConfig);
    };

    // ============================================================================
    // Window_GamepadControllerType (Header Toggle Controller Style)
    // ============================================================================
    function Window_GamepadControllerType() {
        this.initialize.apply(this, arguments);
    }
    Window_GamepadControllerType.prototype = Object.create(Window_Base.prototype);
    Window_GamepadControllerType.prototype.constructor = Window_GamepadControllerType;

    Window_GamepadControllerType.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    };

    Window_GamepadControllerType.prototype.refresh = function() {
        this.contents.clear();
        var type = ConfigManager.gamepadControllerType || 'Xbox';
        this.contents.fontSize = 20;
        this.changeTextColor(this.systemColor());
        this.drawText("Controller Layout:", 10, 0, 180, 'left');
        this.changeTextColor(this.textColor(pButtonColor));
        this.drawText("◄ [ " + type + " ] ►  (LB/RB atau Klik untuk Ganti)", 200, 0, this.contentsWidth() - 210, 'left');
        this.resetTextColor();
    };

    // ============================================================================
    // Window_GamepadConfigList (Main Button List Window)
    // ============================================================================
    function Window_GamepadConfigList() {
        this.initialize.apply(this, arguments);
    }
    Window_GamepadConfigList.prototype = Object.create(Window_Command.prototype);
    Window_GamepadConfigList.prototype.constructor = Window_GamepadConfigList;

    Window_GamepadConfigList.prototype.initialize = function(x, y, width, height) {
        this._windowWidth = width;
        this._windowHeight = height;
        Window_Command.prototype.initialize.call(this, x, y);
    };

    Window_GamepadConfigList.prototype.windowWidth = function() {
        return this._windowWidth || Graphics.boxWidth;
    };

    Window_GamepadConfigList.prototype.windowHeight = function() {
        return this._windowHeight || (Graphics.boxHeight - 144);
    };

    Window_GamepadConfigList.prototype.numVisibleRows = function() {
        return Math.floor(this.height / this.itemHeight());
    };

    Window_GamepadConfigList.prototype.maxCols = function() {
        return 1;
    };

    Window_GamepadConfigList.prototype.makeCommandList = function() {
        var type = ConfigManager.gamepadControllerType || 'Xbox';
        var names = BUTTON_NAMES[type] || BUTTON_NAMES['Xbox'];

        // 16 Tombol Gamepad (0..15)
        for (var i = 0; i <= 15; i++) {
            var btnLabel = names[i] || ("Button " + i);
            this.addCommand(btnLabel, 'button', true, i);
        }

        // Bottom Commands
        this.addCommand(pResetText, 'default', true);
        this.addCommand(pFinishText, 'finish', true);
    };

    Window_GamepadConfigList.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var symbol = this.commandSymbol(index);

        if (symbol === 'button') {
            var buttonId = this.commandData(index);
            var btnName = this.commandName(index);
            var actionSymbol = ConfigManager.gamepadMapper[buttonId];
            
            // Cari detail action
            var actionObj = ACTION_LIST.find(function(a) { return a.symbol === actionSymbol; });
            var actionName = actionObj ? actionObj.name : (actionSymbol ? actionSymbol : pClearText);
            var isCustom = actionObj ? actionObj.isCustom : false;

            // Draw Button Name (Left)
            this.changeTextColor(this.textColor(pButtonColor));
            this.drawText(btnName, rect.x, rect.y, rect.width / 2, 'left');

            // Draw Assigned Action (Right)
            if (!actionSymbol || actionSymbol === 'clear') {
                this.changePaintOpacity(false);
                this.resetTextColor();
                this.drawText(pClearText, rect.x + rect.width / 2, rect.y, rect.width / 2, 'right');
                this.changePaintOpacity(true);
            } else {
                var col = isCustom ? pCustomColor : pActionColor;
                this.changeTextColor(this.textColor(col));
                this.drawText(actionName, rect.x + rect.width / 2, rect.y, rect.width / 2, 'right');
                this.resetTextColor();
            }
        } else {
            // Default & Finish Buttons
            this.resetTextColor();
            this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
        }
    };

    Window_GamepadConfigList.prototype.commandData = function(index) {
        return this._list[index] ? this._list[index].ext : null;
    };

    Window_GamepadConfigList.prototype.updateHelp = function() {
        var symbol = this.currentSymbol();
        if (symbol === 'button') {
            var buttonId = this.currentExt();
            var actionSymbol = ConfigManager.gamepadMapper[buttonId];
            var actionObj = ACTION_LIST.find(function(a) { return a.symbol === actionSymbol; });
            if (actionObj && actionObj.desc) {
                this._helpWindow.setText(actionObj.desc + "\n" + pBtnHelp);
            } else {
                this._helpWindow.setText(pBtnHelp);
            }
        } else if (symbol === 'default') {
            this._helpWindow.setText(pResetHelp);
        } else if (symbol === 'finish') {
            this._helpWindow.setText(pFinishHelp);
        }
    };

    // ============================================================================
    // Window_GamepadAction (Popup Window to Select Action)
    // ============================================================================
    function Window_GamepadAction() {
        this.initialize.apply(this, arguments);
    }
    Window_GamepadAction.prototype = Object.create(Window_Command.prototype);
    Window_GamepadAction.prototype.constructor = Window_GamepadAction;

    Window_GamepadAction.prototype.initialize = function(x, y, width, height) {
        this._windowWidth = width;
        this._windowHeight = height;
        Window_Command.prototype.initialize.call(this, x, y);
        this.hide();
        this.deactivate();
    };

    Window_GamepadAction.prototype.windowWidth = function() {
        return this._windowWidth || 480;
    };

    Window_GamepadAction.prototype.windowHeight = function() {
        return this._windowHeight || 380;
    };

    Window_GamepadAction.prototype.makeCommandList = function() {
        for (var i = 0; i < ACTION_LIST.length; i++) {
            var item = ACTION_LIST[i];
            this.addCommand(item.name, 'action', true, item);
        }
    };

    Window_GamepadAction.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var item = this.commandData(index);
        if (item) {
            if (item.symbol === 'clear') {
                this.changeTextColor(this.textColor(7)); // Gray
            } else if (item.isCustom) {
                this.changeTextColor(this.textColor(pCustomColor));
            } else {
                this.changeTextColor(this.textColor(pActionColor));
            }
            this.drawText(item.name, rect.x, rect.y, rect.width, 'left');
            this.resetTextColor();
        }
    };

    Window_GamepadAction.prototype.commandData = function(index) {
        return this._list[index] ? this._list[index].ext : null;
    };

    Window_GamepadAction.prototype.updateHelp = function() {
        var item = this.currentExt();
        if (item && item.desc && this._helpWindow) {
            this._helpWindow.setText(item.desc);
        }
    };

    // ============================================================================
    // Scene_GamepadConfig
    // ============================================================================
    function Scene_GamepadConfig() {
        this.initialize.apply(this, arguments);
    }
    Scene_GamepadConfig.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_GamepadConfig.prototype.constructor = Scene_GamepadConfig;

    Scene_GamepadConfig.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_GamepadConfig.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createControllerTypeWindow();
        this.createConfigListWindow();
        this.createActionWindow();
    };

    Scene_GamepadConfig.prototype.createControllerTypeWindow = function() {
        var wy = this._helpWindow.height;
        var wh = 54;
        this._typeWindow = new Window_GamepadControllerType(0, wy, Graphics.boxWidth, wh);
        this.addWindow(this._typeWindow);
    };

    Scene_GamepadConfig.prototype.createConfigListWindow = function() {
        var wy = this._helpWindow.height + this._typeWindow.height;
        var wh = Graphics.boxHeight - wy;
        this._configListWindow = new Window_GamepadConfigList(0, wy, Graphics.boxWidth, wh);
        this._configListWindow.setHelpWindow(this._helpWindow);
        this._configListWindow.setHandler('button',  this.onButtonOk.bind(this));
        this._configListWindow.setHandler('default', this.onDefaultOk.bind(this));
        this._configListWindow.setHandler('finish',  this.popScene.bind(this));
        this._configListWindow.setHandler('cancel',  this.popScene.bind(this));
        this._configListWindow.setHandler('pagedown', this.nextControllerType.bind(this));
        this._configListWindow.setHandler('pageup',   this.prevControllerType.bind(this));
        this.addWindow(this._configListWindow);
        this._configListWindow.activate();
        this._configListWindow.select(0);
    };

    Scene_GamepadConfig.prototype.createActionWindow = function() {
        var ww = Math.min(520, Graphics.boxWidth - 40);
        var wh = Math.min(420, Graphics.boxHeight - 120);
        var wx = (Graphics.boxWidth - ww) / 2;
        var wy = (Graphics.boxHeight - wh) / 2;
        this._actionWindow = new Window_GamepadAction(wx, wy, ww, wh);
        this._actionWindow.setHelpWindow(this._helpWindow);
        this._actionWindow.setHandler('action', this.onActionSelect.bind(this));
        this._actionWindow.setHandler('cancel', this.onActionCancel.bind(this));
        this.addWindow(this._actionWindow);
    };

    Scene_GamepadConfig.prototype.nextControllerType = function() {
        var cur = ConfigManager.gamepadControllerType || 'Xbox';
        var idx = CONTROLLER_TYPES.indexOf(cur);
        idx = (idx + 1) % CONTROLLER_TYPES.length;
        ConfigManager.gamepadControllerType = CONTROLLER_TYPES[idx];
        SoundManager.playCursor();
        this._typeWindow.refresh();
        this._configListWindow.refresh();
        this._configListWindow.activate();
    };

    Scene_GamepadConfig.prototype.prevControllerType = function() {
        var cur = ConfigManager.gamepadControllerType || 'Xbox';
        var idx = CONTROLLER_TYPES.indexOf(cur);
        idx = (idx - 1 + CONTROLLER_TYPES.length) % CONTROLLER_TYPES.length;
        ConfigManager.gamepadControllerType = CONTROLLER_TYPES[idx];
        SoundManager.playCursor();
        this._typeWindow.refresh();
        this._configListWindow.refresh();
        this._configListWindow.activate();
    };

    Scene_GamepadConfig.prototype.onButtonOk = function() {
        this._selectedButtonId = this._configListWindow.currentExt();
        this._actionWindow.show();
        this._actionWindow.activate();
        
        // Cari index aksi saat ini untuk auto-focus
        var curAction = ConfigManager.gamepadMapper[this._selectedButtonId];
        var actionIndex = 0;
        for (var i = 0; i < ACTION_LIST.length; i++) {
            if (ACTION_LIST[i].symbol === curAction) {
                actionIndex = i;
                break;
            }
        }
        this._actionWindow.select(actionIndex);
    };

    Scene_GamepadConfig.prototype.onActionSelect = function() {
        var item = this._actionWindow.currentExt();
        if (item && this._selectedButtonId !== undefined) {
            if (item.symbol === 'clear') {
                delete ConfigManager.gamepadMapper[this._selectedButtonId];
            } else {
                ConfigManager.gamepadMapper[this._selectedButtonId] = item.symbol;
            }
            SoundManager.playEquip();
            ConfigManager.applyGamepadConfig();
            ConfigManager.save();
        }
        this.onActionCancel();
    };

    Scene_GamepadConfig.prototype.onActionCancel = function() {
        this._actionWindow.hide();
        this._actionWindow.deactivate();
        this._configListWindow.refresh();
        this._configListWindow.activate();
    };

    Scene_GamepadConfig.prototype.onDefaultOk = function() {
        ConfigManager.gamepadMapper = JSON.parse(JSON.stringify(DEFAULT_GAMEPAD_MAP));
        ConfigManager.applyGamepadConfig();
        ConfigManager.save();
        SoundManager.playEquip();
        this._configListWindow.refresh();
        this._configListWindow.activate();
    };

    Scene_GamepadConfig.prototype.terminate = function() {
        Scene_MenuBase.prototype.terminate.call(this);
        ConfigManager.save();
    };

    // Controller Type Switch via Left/Right on header when clicking type window
    var _Scene_GamepadConfig_update = Scene_GamepadConfig.prototype.update;
    Scene_GamepadConfig.prototype.update = function() {
        _Scene_GamepadConfig_update.call(this);
        
        // Izinkan klik / touch pada TypeWindow untuk mengganti layout controller
        if (TouchInput.isTriggered() && this._typeWindow) {
            var tx = TouchInput.x;
            var ty = TouchInput.y;
            if (tx >= this._typeWindow.x && tx <= this._typeWindow.x + this._typeWindow.width &&
                ty >= this._typeWindow.y && ty <= this._typeWindow.y + this._typeWindow.height) {
                this.nextControllerType();
            }
        }
    };

})();
