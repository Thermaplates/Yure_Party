/*:
 * @plugindesc [v1.0] Mengganti sistem TP bawaan menjadi sistem Rage yang permanen layaknya MP.
 * @author Pethogs
 *
 * @help
 * Plugin ini memodifikasi TP menjadi Rage System:
 * - TP dimulai dalam kondisi penuh (Max TP).
 * - TP dipertahankan antar pertarungan (Preserve TP selalu menyala).
 * - Menghapus mekanik penambahan TP saat menerima damage.
 * - Menghapus mekanik TP Charge Rate (TCR) dari penambahan TP skill.
 */

(function() {

    // 1. Mulai dengan TP penuh, bukan random
    Game_Battler.prototype.initTp = function() {
        this.setTp(this.maxTp());
    };

    // 2. TP selalu dijaga antar pertarungan (seperti MP)
    Game_BattlerBase.prototype.isPreserveTp = function() {
        return true;
    };

    // 3. Matikan penambahan TP saat menerima damage
    Game_Battler.prototype.chargeTpByDamage = function(damageRate) {
        // Kosongkan agar tidak ada TP yang bertambah
    };

    // 4. Matikan efek TCR pada item/skill TP Gain (dapatkan murni sesuai angka di database)
    Game_Action.prototype.applyItemUserEffect = function(target) {
        var value = Math.floor(this.item().tpGain);
        this.subject().gainSilentTp(value);
    };

    // 5. Jangan batasi TP maksimum di angka 100 secara hardcode jika ada plugin lain yang ubah
    // (Bawaan MV menggunakan 100, kita biarkan default)
    var _Game_BattlerBase_maxTp = Game_BattlerBase.prototype.maxTp;
    Game_BattlerBase.prototype.maxTp = function() {
        return _Game_BattlerBase_maxTp.call(this);
    };

    // 6. Saat recoverAll (misal saat istirahat di inn), pastikan TP juga penuh
    var _Game_BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
    Game_BattlerBase.prototype.recoverAll = function() {
        _Game_BattlerBase_recoverAll.call(this);
        this.setTp(this.maxTp());
    };

})();
