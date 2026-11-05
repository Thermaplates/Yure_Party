//=============================================================================
// Custom_BattleEquip_YanflyPatch.js
//=============================================================================
/*:
 * @plugindesc Menu Equip di battle (Langsung ke daftar Item + Support Yanfly).
 * @author Custom Build
 *
 * @help
 * Plugin ini 100% kompatibel dengan YEP_EquipCore.
 * Menggunakan metode injeksi untuk melewati (bypass) command window
 * tanpa merusak tata letak (layout) UI buatan Yanfly.
 */

(function() {
    // 1. Tambah perintah "Equip" di dalam pertarungan
    var _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _Window_ActorCommand_makeCommandList.call(this);
        if (this._actor) {
            this.addCommand(TextManager.equip, 'equip'); 
        }
    };

    // 2. Hubungkan klik tombol ke fungsi pemanggil layar Equip asli
    var _Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.call(this);
        this._actorCommandWindow.setHandler('equip', this.commandEquip.bind(this));
    };

    Scene_Battle.prototype.commandEquip = function() {
        $gameParty.setMenuActor(BattleManager.actor());
        // Gunakan Scene_Equip bawaan agar Yanfly Equip Core bisa menggambar UI-nya
        SceneManager.push(Scene_Equip); 
    };

    // ========================================================================
    // INJEKSI LOGIKA BYPASS KE SCENE EQUIP (Kompatibel YEP)
    // ========================================================================
    
    // Membajak fungsi 'start' saat menu selesai dimuat
    var _Scene_Equip_start = Scene_Equip.prototype.start;
    Scene_Equip.prototype.start = function() {
        _Scene_Equip_start.call(this);
        
        // Jika sedang dalam pertarungan, sistem akan langsung mengeksekusi 
        // pilihan "Equip" secara otomatis sehingga pemain melompati kotak Optimize/Clear
        if ($gameParty.inBattle()) {
            this.commandEquip(); 
        }
    };

    // Membajak fungsi 'cancel' (ESC) saat berada di pemilihan slot senjata/armor
    var _Scene_Equip_onSlotCancel = Scene_Equip.prototype.onSlotCancel;
    Scene_Equip.prototype.onSlotCancel = function() {
        if ($gameParty.inBattle()) {
            // Langsung keluar ke arena pertarungan
            this.popScene();
        } else {
            // Jika sedang mengganti senjata di luar battle, jalankan fungsi normal
            _Scene_Equip_onSlotCancel.call(this);
        }
    };

})();