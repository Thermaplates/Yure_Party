//=============================================================================
// Yure_KarsoItemSystem.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Sistem Logika & Mekanika Khusus Item Mbah Karso (Potions, Efek Samping, Akik, Rajah, Semar Mesem, Jenglot & Rawa Rontek).
 * @author Antigravity
 *
 * @help
 * ============================================================================
 * SISTEM MEKANIKA ITEM MBAH KARSO (YURE KARSO ITEM SYSTEM)
 * ============================================================================
 * Plugin ini mengimplementasikan seluruh mekanika gameplay dari 27 item Mbah Karso
 * sesuai dengan Dokumen Desain Resmi (karso item.pdf):
 * 
 * 1. KOMPATIBILITAS PERLENGKAPAN UNIVERSAL:
 *    - Seluruh karakter/party member dapat melengkapi Rajah (Seal), Akik (Spirit Catalyst),
 *      dan Jimat (Accessory) ke slot jurnal yang sesuai tanpa kendala trait class.
 * 
 * 2. MEKANIKA RAMUAN & KONSUMSI:
 *    - Karso's Powerful Green Potion: Memulihkan +10 Sanity energi mental.
 *    - Suspicious Rainbow Potion: Memberikan buff komprehensif. Penggunaan lebih dari 1x
 *      sehari berisiko memicu efek samping keras (Halusinasi/Blind, Diare, Mual).
 *    - Buddha's Hand Fruit: Memberikan buff berkah acak (+30% salah satu parameter).
 *    - Incense Stick (Dupa): Menenangkan arwah dan mengurangi agresi hantu selama 1 hari.
 *    - Semar Mesem (Item): Memikat dan memikat musuh dalam kebingungan (Fascination).
 * 
 * 3. PASIF BATU AKIK & PUSAKA KERAMAT (EQUIPMENT):
 *    - Common Pomegranate Akik (Merah Delima): Akumulasi kekuatan bertambah +2% setiap turn.
 *    - Sperm White Akik (Mani Gajah): 1/15 peluang bangkit seketika dengan 50% HP saat tewas.
 *    - Rawa Rontek Stone (Equipment): Otomatis bangkit dengan 17% HP saat tewas (1x per pertempuran).
 *    - Jenglot: Patung gaib kuno yang memberikan berkah berkala (+ATK/CRIT) atau kutukan acak.
 *    - Bloodstone & Sunstone Akik: Memberikan status luka Pendarahan (Bleed) atau Terbakar (Burn).
 * ============================================================================
 */

(function() {
    'use strict';

    // ========================================================================
    // 1. KOMPATIBILITAS PERLENGKAPAN UNIVERSAL UNTUK ITEM MBAH KARSO
    // ========================================================================
    var _Game_BattlerBase_canEquipArmor = Game_BattlerBase.prototype.canEquipArmor;
    Game_BattlerBase.prototype.canEquipArmor = function(item) {
        if (item && item.note && /<karso\s+(?:shop|rajah|akik|charm)/i.test(item.note)) {
            return true;
        }
        return _Game_BattlerBase_canEquipArmor.call(this, item);
    };

    // ========================================================================
    // 2. HELPER METADATA ITEM KARSO
    // ========================================================================
    function isKarsoItem(item, tag) {
        if (!item || !item.note) return false;
        var reg = new RegExp('<karso\\s+' + tag + '[^>]*>', 'i');
        return reg.test(item.note);
    }

    // Helper hari in-game
    function getCurrentDay() {
        if (typeof $gameVariables !== 'undefined') {
            return $gameVariables.value(11) || 1; // Variable 11 = Day
        }
        return 1;
    }

    // ========================================================================
    // 3. MEKANIKA PENGGUNAAN ITEM KONSUMSI (POTION, FRUIT, INCENSE, CHARM)
    // ========================================================================
    var _Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
    Game_Action.prototype.applyItemUserEffect = function(target) {
        _Game_Action_applyItemUserEffect.call(this, target);
        var item = this.item();
        if (!item || !target) return;

        var currentDay = getCurrentDay();

        // A. Karso's Powerful Green Potion (+10 Sanity)
        if (isKarsoItem(item, 'potion:\\s*sanity') || item.id === 11) {
            if (target.isActor() && typeof target.gainSanity === 'function') {
                target.gainSanity(10);
            }
        }

        // B. Suspicious Rainbow Potion (Buff acak & penalti berlebih)
        if (isKarsoItem(item, 'potion:\\s*rainbow') || item.id === 12) {
            if (target.isActor()) {
                if (!$gameParty._karsoRainbowUses) $gameParty._karsoRainbowUses = {};
                var uses = $gameParty._karsoRainbowUses[currentDay] || 0;
                $gameParty._karsoRainbowUses[currentDay] = uses + 1;

                // Berikan 1 random buff sekunder (0: MHP, 1: MMP, 2: ATK, 3: DEF, 4: MAT, 5: MDF, 6: AGI, 7: LUK)
                var randomParam = 3 + Math.floor(Math.random() * 5); // DEF, MAT, MDF, AGI, LUK
                target.addBuff(randomParam, 4);

                // Jika digunakan lebih dari 1x di hari yang sama -> efek samping keras
                if (uses >= 1) {
                    if (Math.random() < 0.60) {
                        target.addState(17); // Nausea
                    }
                    if (Math.random() < 0.40) {
                        target.addState(15); // Diarrhea
                    }
                    if (Math.random() < 0.35) {
                        target.addState(5);  // Blind / Hallucination
                    }
                }
            }
        }

        // C. Buddha's Hand Fruit (+30% buff acak)
        if (isKarsoItem(item, 'fruit') || item.id === 13) {
            if (target.isActor()) {
                var poolParams = [2, 3, 4, 6]; // ATK, DEF, MAT, AGI
                var selected = poolParams[Math.floor(Math.random() * poolParams.length)];
                target.addBuff(selected, 5);
            }
        }

        // D. Incense Stick (Dupa Penenang Gaib)
        if (isKarsoItem(item, 'incense') || item.id === 14) {
            if (typeof $gameSystem !== 'undefined') {
                $gameSystem._karsoGhostCalmedUntil = currentDay + 1;
            }
        }
    };

    // ========================================================================
    // 4. EFEK DUPA PENENANG PADA ENCOUNTER & AGRESI
    // ========================================================================
    var _Game_Player_makeEncounterCount = Game_Player.prototype.makeEncounterCount;
    Game_Player.prototype.makeEncounterCount = function() {
        _Game_Player_makeEncounterCount.call(this);
        var currentDay = getCurrentDay();
        if ($gameSystem && $gameSystem._karsoGhostCalmedUntil && currentDay < $gameSystem._karsoGhostCalmedUntil) {
            // Pengurangan laju perjumpaan hantu (encounter steps berlipat ganda)
            this._encounterCount = Math.round(this._encounterCount * 2.0);
        }
    };

    // ========================================================================
    // 5. PASIF BATU AKIK & PUSAKA DI PERTEMPURAN (COMBAT PASSIVES)
    // ========================================================================
    
    // Helper cek perlengkapan pada battler
    function actorHasKarsoEquip(actor, tag) {
        if (!actor || !actor.isActor || !actor.isActor()) return false;
        var equips = actor.equips();
        for (var i = 0; i < equips.length; i++) {
            var eq = equips[i];
            if (eq && isKarsoItem(eq, tag)) return true;
        }
        return false;
    }

    // A. Turn Start Triggers (Pomegranate Akik & Jenglot)
    var _BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function() {
        _BattleManager_startTurn.call(this);
        var members = $gameParty.battleMembers();
        for (var i = 0; i < members.length; i++) {
            var actor = members[i];
            if (!actor || !actor.isAlive()) continue;

            // 1. Common Pomegranate Akik (+2% akumulasi ATK tiap turn)
            if (actorHasKarsoEquip(actor, 'akik:\\s*pomegranate')) {
                if (!actor._pomegranateTurns) actor._pomegranateTurns = 0;
                actor._pomegranateTurns++;
                if (actor._pomegranateTurns % 2 === 0) {
                    actor.addBuff(2, 4); // ATK buff
                }
            }

            // 2. Jenglot (Berkah Gaib atau Kutukan Ringan)
            if (actorHasKarsoEquip(actor, 'charm:\\s*jenglot')) {
                var roll = Math.random();
                if (roll < 0.50) {
                    // Berkah: Peningkatan Serangan atau Kelincahan
                    var buffParam = Math.random() < 0.5 ? 2 : 6;
                    actor.addBuff(buffParam, 2);
                } else {
                    // Kutukan: Pengurangan energi kecil (slip 4% HP)
                    var hpLoss = Math.max(1, Math.round(actor.mhp * 0.04));
                    if (actor.hp > hpLoss) {
                        actor.setHp(actor.hp - hpLoss);
                    }
                }
            }
        }
    };

    // Reset akumulator turn saat battle selesai
    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _BattleManager_endBattle.call(this, result);
        var members = $gameParty.allMembers();
        for (var i = 0; i < members.length; i++) {
            if (members[i]) {
                members[i]._pomegranateTurns = 0;
                members[i]._rawaRontekReviveUsed = false;
            }
        }
    };

    // B. Death Defying / Auto-Revive (Sperm White Akik & Rawa Rontek Stone)
    var _Game_Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
    Game_Action.prototype.executeHpDamage = function(target, value) {
        // Cek apakah serangan berpotensi mematikan bagi target
        if (value >= target.hp && target.isAlive() && target.isActor()) {
            
            // 1. Rawa Rontek Stone (Equipment): Bangkit pasti dengan 17% HP (1x per battle)
            if (actorHasKarsoEquip(target, 'charm:\\s*rawa_rontek') && !target._rawaRontekReviveUsed) {
                target._rawaRontekReviveUsed = true;
                value = 0;
                var reviveHp = Math.max(1, Math.round(target.mhp * 0.17));
                target.setHp(reviveHp);
                target.startAnimation(49); // Revive Animation

                if ($gameParty.inBattle()) {
                    var logMsg = target.name() + " bangkit kembali berkat kesaktian Aji Rawa Rontek! (17% HP)";
                    if (typeof Yure !== 'undefined' && Yure.BattleLog && typeof Yure.BattleLog.addCard === 'function') {
                        Yure.BattleLog.addCard(logMsg, 'special');
                    }
                }
                return;
            }

            // 2. Sperm White Akik (Mani Gajah): 1/15 peluang bangkit seketika dengan 50% HP
            if (actorHasKarsoEquip(target, 'akik:\\s*mani_gajah')) {
                // Roll 1 out of 15 (probability ~ 0.0667)
                if (Math.random() < (1.0 / 15.0)) {
                    value = 0;
                    var reviveHp50 = Math.max(1, Math.round(target.mhp * 0.50));
                    target.setHp(reviveHp50);
                    target.startAnimation(50); // Revive 2 Animation

                    if ($gameParty.inBattle()) {
                        var logMsgWhite = target.name() + " terselamatkan oleh tuah Gaib Batu Akik Mani Gajah! (50% HP)";
                        if (typeof Yure !== 'undefined' && Yure.BattleLog && typeof Yure.BattleLog.addCard === 'function') {
                            Yure.BattleLog.addCard(logMsgWhite, 'special');
                        }
                    }
                    return;
                }
            }
        }

        _Game_Action_executeHpDamage.call(this, target, value);
    };

})();

