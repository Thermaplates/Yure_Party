//=============================================================================
// Yure_HideBattleLog.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Menyembunyikan teks nama skill / battle log di atas layar.
 * @author Yure Party Team
 *
 * @help
 * Plugin ini akan menghilangkan tulisan-tulisan seperti nama karakter
 * menyerang atau nama skill yang muncul di atas layar agar tidak menutupi UI.
 */

(function() {

    // Menyembunyikan background
    var _Window_BattleLog_initialize = Window_BattleLog.prototype.initialize;
    Window_BattleLog.prototype.initialize = function() {
        _Window_BattleLog_initialize.call(this);
        this.opacity = 0;
    };

    // Mencegah teks digambar ke layar, tapi antrean animasi (queue) tetap jalan
    Window_BattleLog.prototype.addText = function(text) {
        // Override agar tidak melakukan apa-apa, jadi teks tidak digambar
    };

    Window_BattleLog.prototype.drawLineText = function(index) {
        // Override agar teks tidak dirender
    };
    
    // Yanfly khusus untuk action text
    if (typeof Window_BattleLog.prototype.displayActionText !== 'undefined') {
        Window_BattleLog.prototype.displayActionText = function(subject, item) {
            // Hilangkan khusus untuk Yanfly
        };
    }

})();
