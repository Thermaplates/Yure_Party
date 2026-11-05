/*:
 * @plugindesc (v1.1) Menekan ESC di Main Menu akan memunculkan konfirmasi keluar.
 * @author Yure
 *
 * @param Confirm Text
 * @desc Teks pertanyaan untuk konfirmasi keluar.
 * @default Apakah Anda ingin keluar dari game?
 *
 * @param Yes Text
 * @desc Teks untuk tombol Ya.
 * @default Ya
 *
 * @param No Text
 * @desc Teks untuk tombol Tidak.
 * @default Tidak
 *
 * @help
 * Plugin ini memunculkan jendela konfirmasi (Ya/Tidak) 
 * jika pemain menekan tombol ESC / Cancel saat berada di Title Screen.
 */

(function() {
    var parameters = PluginManager.parameters('Yure_TitleExitShortcut');
    var confirmText = String(parameters['Confirm Text'] || 'Apakah Anda ingin keluar dari game?');
    var yesText = String(parameters['Yes Text'] || 'Ya');
    var noText = String(parameters['No Text'] || 'Tidak');

    //-----------------------------------------------------------------------------
    // Window_TitleExitConfirm
    //
    function Window_TitleExitConfirm() {
        this.initialize.apply(this, arguments);
    }

    Window_TitleExitConfirm.prototype = Object.create(Window_Command.prototype);
    Window_TitleExitConfirm.prototype.constructor = Window_TitleExitConfirm;

    Window_TitleExitConfirm.prototype.initialize = function() {
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.updatePlacement();
        this.openness = 0;
        this.deactivate();
    };

    Window_TitleExitConfirm.prototype.windowWidth = function() {
        return 400;
    };

    Window_TitleExitConfirm.prototype.updatePlacement = function() {
        this.x = (Graphics.boxWidth - this.width) / 2;
        this.y = (Graphics.boxHeight - this.height) / 2;
    };

    Window_TitleExitConfirm.prototype.makeCommandList = function() {
        this.addCommand(yesText, 'yes');
        this.addCommand(noText, 'no');
    };

    Window_TitleExitConfirm.prototype.itemTextAlign = function() {
        return 'center';
    };

    // Gambarkan teks pertanyaan di atas opsi
    Window_TitleExitConfirm.prototype.windowHeight = function() {
        return this.fittingHeight(3); // 1 baris teks + 2 baris command
    };

    Window_TitleExitConfirm.prototype.itemRect = function(index) {
        var rect = Window_Command.prototype.itemRect.call(this, index);
        rect.y += this.lineHeight(); // Geser opsi ke bawah agar ada ruang untuk teks
        return rect;
    };

    Window_TitleExitConfirm.prototype.drawAllItems = function() {
        this.drawText(confirmText, 0, 0, this.contentsWidth(), 'center');
        Window_Command.prototype.drawAllItems.call(this);
    };

    //-----------------------------------------------------------------------------
    // Scene_Title
    //
    var _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        _Scene_Title_create.call(this);
        this.createExitConfirmWindow();
    };

    Scene_Title.prototype.createExitConfirmWindow = function() {
        this._exitConfirmWindow = new Window_TitleExitConfirm();
        this._exitConfirmWindow.setHandler('yes', this.commandExitYes.bind(this));
        this._exitConfirmWindow.setHandler('no',  this.commandExitNo.bind(this));
        this._exitConfirmWindow.setHandler('cancel', this.commandExitNo.bind(this));
        this.addWindow(this._exitConfirmWindow);
    };

    Scene_Title.prototype.commandExitYes = function() {
        this._exitConfirmWindow.close();
        SoundManager.playOk();
        SceneManager.exit();
    };

    Scene_Title.prototype.commandExitNo = function() {
        this._exitConfirmWindow.close();
        this._exitConfirmWindow.deactivate();
        this._commandWindow.activate();
    };

    var _Scene_Title_update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        _Scene_Title_update.call(this);
        
        // Mencegah trigger jika window konfirmasi sedang terbuka atau scene sibuk
        if (!this.isBusy() && this._commandWindow.active && !this._exitConfirmWindow.isOpen()) {
            if (Input.isTriggered('escape') || Input.isTriggered('cancel')) {
                SoundManager.playCursor();
                this._commandWindow.deactivate();
                this._exitConfirmWindow.open();
                this._exitConfirmWindow.activate();
                this._exitConfirmWindow.select(1); // Default ke "Tidak" agar lebih aman
            }
        }
    };

})();
