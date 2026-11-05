/*:
 * @plugindesc (v1.0) Menambahkan Opsi Resolusi Layar & Fullscreen di Menu Options.
 * @author Yure
 *
 * @param Fullscreen Text
 * @desc Teks untuk opsi Fullscreen di menu.
 * @default Fullscreen
 *
 * @param Window Size Text
 * @desc Teks untuk opsi ukuran jendela di menu.
 * @default Ukuran Layar
 *
 * @help
 * Plugin ini menambahkan pengaturan Layar (Fullscreen & Ukuran Jendela)
 * ke dalam menu Options bawaan RPG Maker MV.
 *
 * Pastikan Anda memainkannya di mode Desktop (Windows/Mac) karena
 * opsi ukuran jendela membutuhkan environment NW.js.
 */

(function() {
    var parameters = PluginManager.parameters('Yure_ScreenOptions');
    var fullScreenText = String(parameters['Fullscreen Text'] || 'Fullscreen');
    var windowSizeText = String(parameters['Window Size Text'] || 'Ukuran Layar');

    // Default window sizes (You can customize these)
    var windowSizes = [
        { name: "Normal (1x)", scale: 1 },
        { name: "Besar (1.5x)", scale: 1.5 },
        { name: "Sangat Besar (2x)", scale: 2 }
    ];

    // Initialize ConfigManager
    ConfigManager.fullScreen = false;
    ConfigManager.windowScaleIndex = 0;

    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        var config = _ConfigManager_makeData.call(this);
        config.fullScreen = this.fullScreen;
        config.windowScaleIndex = this.windowScaleIndex;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this, config);
        this.fullScreen = this.readFlag(config, 'fullScreen');
        this.windowScaleIndex = config['windowScaleIndex'] || 0;
        this.applyWindowChanges();
    };

    ConfigManager.applyWindowChanges = function() {
        if (Utils.isNwjs()) {
            var gui = require('nw.gui');
            var win = gui.Window.get();
            
            if (this.fullScreen) {
                win.enterFullscreen();
            } else {
                win.leaveFullscreen();
                var scale = windowSizes[this.windowScaleIndex].scale;
                var baseW = SceneManager._screenWidth || 816;
                var baseH = SceneManager._screenHeight || 624;
                
                var newW = Math.floor(baseW * scale);
                var newH = Math.floor(baseH * scale);
                
                win.resizeTo(newW, newH);
                win.setPosition('center');
            }
        }
    };

    // Inject to Window_Options
    var _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
    Window_Options.prototype.addGeneralOptions = function() {
        _Window_Options_addGeneralOptions.call(this);
        this.addCommand(fullScreenText, 'fullScreen');
        this.addCommand(windowSizeText, 'windowScaleIndex');
    };

    var _Window_Options_statusText = Window_Options.prototype.statusText;
    Window_Options.prototype.statusText = function(index) {
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        
        if (symbol === 'windowScaleIndex') {
            return windowSizes[value].name;
        }
        return _Window_Options_statusText.call(this, index);
    };

    var _Window_Options_processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function() {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        
        if (symbol === 'windowScaleIndex') {
            value++;
            if (value >= windowSizes.length) {
                value = 0;
            }
            value = value.clamp(0, windowSizes.length - 1);
            this.changeValue(symbol, value);
            ConfigManager.applyWindowChanges();
        } else if (symbol === 'fullScreen') {
            this.changeValue(symbol, !value);
            ConfigManager.applyWindowChanges();
        } else {
            _Window_Options_processOk.call(this);
        }
    };

    var _Window_Options_cursorRight = Window_Options.prototype.cursorRight;
    Window_Options.prototype.cursorRight = function(wrap) {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        
        if (symbol === 'windowScaleIndex') {
            value++;
            if (value >= windowSizes.length) value = 0;
            this.changeValue(symbol, value);
            ConfigManager.applyWindowChanges();
        } else {
            _Window_Options_cursorRight.call(this, wrap);
        }
    };

    var _Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
    Window_Options.prototype.cursorLeft = function(wrap) {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        
        if (symbol === 'windowScaleIndex') {
            value--;
            if (value < 0) value = windowSizes.length - 1;
            this.changeValue(symbol, value);
            ConfigManager.applyWindowChanges();
        } else {
            _Window_Options_cursorLeft.call(this, wrap);
        }
    };

})();
