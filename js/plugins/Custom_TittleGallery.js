//=============================================================================
// Custom_TitleGallery.js
//=============================================================================
/*:
 * @plugindesc Menambahkan tombol Gallery di Title Screen (Support Moghunter)
 * @author Custom Build
 * 
 * @help
 * Taruh plugin ini di bawah MOG_TitlePictureCom atau plugin Moghunter lainnya.
 */

(function() {
    var _Scene_Title_hiddenCommandIndexes = Scene_Title.prototype.hiddenCommandIndexes;
    Scene_Title.prototype.hiddenCommandIndexes = function() {
        var indexes = _Scene_Title_hiddenCommandIndexes.call(this).slice();
        var index3 = indexes.indexOf(3);
        if (index3 >= 0) {
            indexes.splice(index3, 1);
        }
        return indexes;
    };

    // 1. Menambahkan tombol "Gallery" ke dalam daftar perintah
    var _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _Window_TitleCommand_makeCommandList.call(this);
        // Menambahkan opsi baru di urutan paling bawah (Indeks 3)
        this.addCommand('Gallery', 'gallery'); 
    };

    // 2. Mendaftarkan fungsi saat tombol Gallery diklik
    var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        this._commandWindow.setHandler('gallery', this.commandGallery.bind(this));
    };

    // 3. Routing: Mengarahkan layar ke Menu Gallery
   Scene_Title.prototype.commandGallery = function() {
        this._commandWindow.close();
        SceneManager.push(Scene_MyGallery); // Memanggil Scene buatan sendiri!
    };
    
})();