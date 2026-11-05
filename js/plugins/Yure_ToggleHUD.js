//=============================================================================
// Yure_ToggleHUD.js
//=============================================================================

/*:
 * @plugindesc Menyembunyikan MOG Actor HUD saat menekan tombol TAB dengan animasi geser.
 * @author Antigravity
 *
 * @param Slide Distance
 * @desc Jarak pergeseran HUD dalam pixel saat disembunyikan. (Negatif = ke kiri)
 * @default -400
 *
 * @param Slide Speed
 * @desc Kecepatan animasi geser (antara 0.01 sampai 1.0). Semakin besar semakin cepat.
 * @default 0.15
 *
 * @help
 * ============================================================================
 * YURE TOGGLE HUD
 * ============================================================================
 * Plugin ini memungkinkan pemain menekan tombol TAB untuk menyembunyikan 
 * atau menampilkan kembali HUD dari MOG_ActorHud.
 * 
 * Animasi geser secara default akan bergerak dari kanan ke kiri (menuju luar layar kiri).
 * Jika Anda ingin animasinya bergerak ke arah kanan layar, ubah parameter 
 * 'Slide Distance' menjadi angka positif (misalnya: 400).
 */

(function() {
    var parameters = PluginManager.parameters('Yure_ToggleHUD');
    var slideDistance = Number(parameters['Slide Distance'] || -400);
    var slideSpeed = Number(parameters['Slide Speed'] || 0.15);

    // Inisialisasi state hide HUD
    var _Scene_Map_initialize = Scene_Map.prototype.initialize;
    Scene_Map.prototype.initialize = function() {
        _Scene_Map_initialize.call(this);
        if ($gameSystem._yureHudHidden === undefined) {
            $gameSystem._yureHudHidden = false;
        }
    };

    // Deteksi tombol TAB saat di map
    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        // Membaca input tombol TAB (key code 9)
        if (Input.isTriggered('tab')) {
            $gameSystem._yureHudHidden = !$gameSystem._yureHudHidden;
        }
    };

    // Hook ke MOG Actor_Hud untuk menjalankan animasi
    if (typeof Actor_Hud !== 'undefined') {
        var _Actor_Hud_initialize = Actor_Hud.prototype.initialize;
        Actor_Hud.prototype.initialize = function(hud_id) {
            _Actor_Hud_initialize.call(this, hud_id);
            this._currentSlideX = 0;
            this.x = 0; // Posisi dasar Sprite adalah 0
        };

        var _Actor_Hud_update = Actor_Hud.prototype.update;
        Actor_Hud.prototype.update = function() {
            _Actor_Hud_update.call(this);
            
            // Tentukan target pergeseran berdasarkan status tombol
            var targetSlideX = $gameSystem._yureHudHidden ? slideDistance : 0;
            
            // Lakukan animasi pergeseran (Smooth Lerp)
            if (this._currentSlideX !== targetSlideX) {
                this._currentSlideX += (targetSlideX - this._currentSlideX) * slideSpeed;
                
                // Paskan posisi jika sudah sangat dekat dengan target
                if (Math.abs(this._currentSlideX - targetSlideX) < 1) {
                    this._currentSlideX = targetSlideX;
                }
                
                // Terapkan posisi X ke keseluruhan sprite Actor_Hud
                this.x = this._currentSlideX;
            }
        };
    }
})();
