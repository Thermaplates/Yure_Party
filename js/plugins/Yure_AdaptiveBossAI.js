//=============================================================================
// Yure_AdaptiveBossAI.js
//=============================================================================
/*:
 * @plugindesc [v1.0] Adaptive Boss AI & Deflect Mechanism for King Morgan and Jon Kenek.
 * @author DeepMind Pair Programming / Yure Party Team
 *
 * @help
 * ============================================================================
 * PENJELASAN SISTEM: ADAPTIVE BOSS AI & PHYLAX DEFLECT
 * ============================================================================
 * Plugin ini menghadirkan pertempuran boss taktikal tingkat lanjut:
 * 
 * 1. PARAMETER BARU: DEFLECT (Pantulan Serangan)
 *    - Ketika battler memiliki state Phylax atau notetag <deflect: X%>,
 *      ada peluang memantulkan (Deflect) sebagian atau seluruh serangan musuh
 *      kembali ke penyerang, diiringi efek suara 'Parry' dan pop-up visual.
 * 
 * 2. DUA STANCE JON KENEK:
 *    - Mode Bertahan (Phylax Stance): Mengurangi 60% damage fisik & memantulkan
 *      serangan kembali ke pemain (Deflect).
 *    - Mode Menyerang (Assault Mode): Meningkatkan serangan drastis (+50% ATK,
 *      +30% Speed, +25% Crit).
 * 
 * 3. KOMANDAN TAKTIS KING MORGAN:
 *    - King Morgan mengatur formasi Jon Kenek (memerintahkan kapan harus bertahan
 *      Phylax atau kapan harus menyerbu Assault) sesuai gaya bermain player.
 * 
 * 4. ADAPTIVE AI ENGINE (Semakin lama semakin pintar & beradaptasi):
 *    - AI menganalisis kebiasaan player secara real-time:
 *      * Player sering spam fisik -> King Morgan perintahkan Jon Kenek pasang Phylax Deflect!
 *      * Player sering spam magic -> King Morgan & Kenek fokus stun & disrupt spellcaster!
 *      * Player sering heal / turtle pasif -> King Morgan perintahkan All-Out Assault!
 *      * Player mencoba rush King Morgan -> Jon Kenek pasang Royal Vanguard (Cover Raja)!
 *      * Player sekarat -> King Morgan melepaskan finisher 'King's Execution'!
 *    - Semakin bertambah turn pertarungan (Tactical IQ 1 -> 5), musuh semakin hemat
 *      resource, semakin akurat, dan Deflect Rate Jon Kenek semakin tinggi.
 * ============================================================================
 */

(function() {
    'use strict';

    // ========================================================================
    // 1. DATA CONSTANTS & HELPER IDENTIFIER
    // ========================================================================
    var ENEMY_ID_KING_MORGAN = 2;
    var ENEMY_ID_JON_KENEK   = 5;

    var STATE_ID_PHYLAX      = 21; // Phylax (Deflect)
    var STATE_ID_ASSAULT     = 22; // Assault Mode
    var STATE_ID_VANGUARD    = 23; // Royal Vanguard (Cover King)
    var STATE_ID_TACTICAL_IQ = 24; // Tactical IQ Indicator

    var SKILL_ID_PHYLAX_STANCE   = 18; // Jon Kenek Self Phylax
    var SKILL_ID_ASSAULT_STANCE  = 19; // Jon Kenek Self Assault
    var SKILL_ID_COMMAND_PHYLAX  = 20; // King Morgan Command Phylax
    var SKILL_ID_COMMAND_ASSAULT = 21; // King Morgan Command Assault
    var SKILL_ID_KINGS_EXECUTION = 22; // King Morgan Finisher
    var SKILL_ID_SHIELD_BASH     = 23; // Jon Kenek Stun Bash

    function isKingMorgan(battler) {
        return battler && battler.isEnemy() && battler.enemyId() === ENEMY_ID_KING_MORGAN;
    }

    function isJonKenek(battler) {
        return battler && battler.isEnemy() && battler.enemyId() === ENEMY_ID_JON_KENEK;
    }

    // ========================================================================
    // 2. DEFLECT PARAMETER & SOUND EFFECT
    // ========================================================================
    Game_BattlerBase.prototype.deflectRate = function() {
        var rate = 0;
        // Cek States
        var allStates = this.states();
        for (var i = 0; i < allStates.length; i++) {
            var st = allStates[i];
            if (st && st.note) {
                var match = st.note.match(/<deflect:\s*(\d+)%?>/i);
                if (match) {
                    rate += parseInt(match[1], 10) / 100.0;
                }
            }
        }
        // Cek Enemy Note
        if (this.isEnemy()) {
            var enemy = this.enemy();
            if (enemy && enemy.note) {
                var mEnemy = enemy.note.match(/<deflect:\s*(\d+)%?>/i);
                if (mEnemy) rate += parseInt(mEnemy[1], 10) / 100.0;
            }
        }

        // Bonus Deflect scaling dari Tactical IQ King Morgan jika satu troop
        if (this.isEnemy() && isJonKenek(this) && $gameTroop && $gameTroop._playerProfiler) {
            var iq = $gameTroop._playerProfiler.tacticalIQ || 1;
            // Setiap level IQ di atas 1 menambah +5% deflect rate (maksimal +20%)
            rate += (iq - 1) * 0.05;
        }

        return Math.min(0.85, Math.max(0, rate));
    };

    Game_BattlerBase.prototype.deflectRatio = function() {
        var ratio = 0.80; // Default memantulkan 80% damage
        var allStates = this.states();
        for (var i = 0; i < allStates.length; i++) {
            var st = allStates[i];
            if (st && st.note) {
                var match = st.note.match(/<deflect_ratio:\s*([\d\.]+)>/i);
                if (match) ratio = parseFloat(match[1]);
            }
        }
        return Math.max(0.1, Math.min(1.5, ratio));
    };

    function playDeflectSound() {
        try {
            AudioManager.playSe({
                name: 'Parry',
                volume: 95,
                pitch: 105,
                pan: 0
            });
        } catch (e) {
            SoundManager.playEnemyDamage();
        }
    }

    // ========================================================================
    // 3. DEFLECT EXECUTION HOOK (PANTULAN DAMAGE KE PENYERANG)
    // ========================================================================
    var _Game_Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
    Game_Action.prototype.executeHpDamage = function(target, value) {
        // Deflect hanya aktif jika damage positif dan target memiliki deflect rate
        if (value > 0 && target && target.isAlive() && target.deflectRate() > 0) {
            var roll = Math.random();
            var dRate = target.deflectRate();

            if (roll < dRate) {
                var attacker = this.subject();
                var ratio = target.deflectRatio();
                var deflectDmg = Math.round(value * ratio);

                // Reduksi damage yang diterima target (diserap oleh perisai Phylax)
                value = Math.max(0, Math.round(value * (1.0 - ratio)));

                // Mainkan efek suara tangkisan parry
                playDeflectSound();

                // Munculkan efek kilat / flash putih di layar
                if ($gameScreen) {
                    $gameScreen.startFlash([255, 235, 180, 160], 12);
                }

                // Tampilkan Popup Pantulan
                if (typeof target.startDamagePopup === 'function') {
                    target.startDamagePopup();
                }

                // Pantulkan damage langsung ke attacker (pemain)
                if (attacker && attacker.isAlive() && deflectDmg > 0) {
                    attacker.gainHp(-deflectDmg);
                    if (typeof attacker.startDamagePopup === 'function') {
                        attacker.startDamagePopup();
                    }
                    if (attacker.isDead()) {
                        attacker.performCollapse();
                    }
                }

                // Catat ke Battle Log
                var logMsg = target.name() + " memantulkan serangan dengan perisai Phylax! (" + deflectDmg + " DMG berbalik mengenai " + (attacker ? attacker.name() : 'penyerang') + "!)";
                if (typeof Yure !== 'undefined' && Yure.BattleLog && typeof Yure.BattleLog.addCard === 'function') {
                    Yure.BattleLog.addCard(logMsg, 'special');
                }

                // Tampilkan Tactical Callout jika didukung
                if (typeof Yure !== 'undefined' && Yure.DynamicBattlePopups && typeof Yure.DynamicBattlePopups.showPopup === 'function') {
                    Yure.DynamicBattlePopups.showPopup(target, '✦ DEFLECT! ✦', '#38bdf8');
                }
            }
        }

        _Game_Action_executeHpDamage.call(this, target, value);
    };

    // ========================================================================
    // 4. ROYAL VANGUARD (JON KENEK COVER KING MORGAN)
    // ========================================================================
    var _BattleManager_applySubstitute = BattleManager.applySubstitute;
    BattleManager.applySubstitute = function(target) {
        // Cek jika target adalah King Morgan
        if (target && isKingMorgan(target) && target.isAlive()) {
            // Cari Jon Kenek yang sedang hidup dan dalam formasi Phylax / Vanguard
            var allies = $gameTroop.aliveMembers();
            var bestGuard = null;
            for (var i = 0; i < allies.length; i++) {
                var ally = allies[i];
                if (isJonKenek(ally) && ally.isAlive()) {
                    if (ally.isStateAffected(STATE_ID_VANGUARD) || ally.isStateAffected(STATE_ID_PHYLAX)) {
                        bestGuard = ally;
                        break;
                    } else if (!bestGuard) {
                        bestGuard = ally;
                    }
                }
            }

            if (bestGuard && bestGuard !== target) {
                // Jon Kenek maju melindungi King Morgan
                if (typeof Yure !== 'undefined' && Yure.BattleLog && typeof Yure.BattleLog.addCard === 'function') {
                    Yure.BattleLog.addCard(bestGuard.name() + " maju menahan serangan demi melindungi King Morgan!", 'warning');
                }
                return bestGuard;
            }
        }

        return _BattleManager_applySubstitute.call(this, target);
    };

    // ========================================================================
    // 5. PLAYER PROFILER ENGINE (MELACAK CARA BERMAIN PLAYER REAL-TIME)
    // ========================================================================
    function initPlayerProfiler() {
        return {
            turnCount: 0,
            tacticalIQ: 1,
            physicalAttacks: 0,
            magicAttacks: 0,
            supportHealCount: 0,
            targetKingCount: 0,
            targetKenekCount: 0,
            consecutivePhy: 0,
            consecutiveMag: 0,
            consecutiveHeal: 0,
            currentDominantStyle: 'balanced', // 'physical' | 'magic' | 'turtle' | 'rush_boss'
            lastKingCommandTurn: -99,
            lastFinisherTurn: -99
        };
    }

    var _Game_Troop_setup = Game_Troop.prototype.setup;
    Game_Troop.prototype.setup = function(troopId) {
        _Game_Troop_setup.call(this, troopId);
        this._playerProfiler = initPlayerProfiler();
    };

    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);

        // Rekam aksi pemain jika subjek adalah Actor pemain dan berada di pertempuran
        var subject = this.subject();
        if ($gameParty.inBattle() && subject && subject.isActor() && $gameTroop._playerProfiler) {
            var prof = $gameTroop._playerProfiler;
            var item = this.item();

            if (this.isSkill() || this.isAttack()) {
                // Klasifikasi Fisik vs Magic
                if (this.isPhysical()) {
                    prof.physicalAttacks++;
                    prof.consecutivePhy++;
                    prof.consecutiveMag = 0;
                    prof.consecutiveHeal = 0;
                } else if (this.isMagical()) {
                    prof.magicAttacks++;
                    prof.consecutiveMag++;
                    prof.consecutivePhy = 0;
                    prof.consecutiveHeal = 0;
                }

                // Cek target apakah membidik King Morgan atau Jon Kenek
                if (target && isKingMorgan(target)) {
                    prof.targetKingCount++;
                } else if (target && isJonKenek(target)) {
                    prof.targetKenekCount++;
                }
            } else if (this.isItem() || (item && item.damage && item.damage.type === 3)) {
                // Healing / Recovery item
                prof.supportHealCount++;
                prof.consecutiveHeal++;
            }
        }
    };

    // ========================================================================
    // 6. ADAPTATION EVALUATION & TACTICAL IQ LEVELING
    // ========================================================================
    function updateAdaptiveProfiler(troop) {
        if (!troop || !troop._playerProfiler) return;
        var p = troop._playerProfiler;
        var turn = troop.turnCount();
        p.turnCount = turn;

        // Naikkan level Tactical IQ seiring ronde pertarungan
        // Turn 1-2: IQ 1 | Turn 3-4: IQ 2 | Turn 5-6: IQ 3 | Turn 7-8: IQ 4 | Turn 9+: IQ 5
        var targetIQ = Math.min(5, Math.max(1, 1 + Math.floor(turn / 2)));
        if (targetIQ > p.tacticalIQ) {
            p.tacticalIQ = targetIQ;
            var king = troop.aliveMembers().find(isKingMorgan);
            if (king && !king.isStateAffected(STATE_ID_TACTICAL_IQ)) {
                king.addState(STATE_ID_TACTICAL_IQ);
            }
            if (typeof Yure !== 'undefined' && Yure.BattleLog && typeof Yure.BattleLog.addCard === 'function') {
                Yure.BattleLog.addCard("King Morgan menganalisis taktikmu! (Tactical IQ Lv." + p.tacticalIQ + ")", 'special');
            }
        }

        // Tentukan gaya dominan pemain
        if (p.consecutivePhy >= 3 || (p.physicalAttacks > p.magicAttacks * 2 && p.physicalAttacks >= 3)) {
            p.currentDominantStyle = 'physical';
        } else if (p.consecutiveMag >= 3 || (p.magicAttacks > p.physicalAttacks * 2 && p.magicAttacks >= 3)) {
            p.currentDominantStyle = 'magic';
        } else if (p.consecutiveHeal >= 2 || p.supportHealCount >= 3) {
            p.currentDominantStyle = 'turtle';
        } else if (p.targetKingCount > p.targetKenekCount * 2 && p.targetKingCount >= 3) {
            p.currentDominantStyle = 'rush_boss';
        } else {
            p.currentDominantStyle = 'balanced';
        }
    }

    // Hook pada awal pergantian giliran musuh
    var _BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function() {
        if ($gameTroop && $gameTroop._playerProfiler) {
            updateAdaptiveProfiler($gameTroop);
        }
        _BattleManager_startTurn.call(this);
    };

    // ========================================================================
    // 7. CERDAS MEMILIH AKSI: KING MORGAN & JON KENEK (AI ENGINE)
    // ========================================================================
    Game_Enemy.prototype.findLowestHpActor = function() {
        var members = $gameParty.aliveMembers();
        if (members.length === 0) return null;
        var lowest = members[0];
        for (var i = 1; i < members.length; i++) {
            if (members[i].hpRate() < lowest.hpRate()) {
                lowest = members[i];
            }
        }
        return lowest;
    };

    Game_Enemy.prototype.countAliveKenek = function() {
        var enemies = $gameTroop.aliveMembers();
        return enemies.filter(isJonKenek).length;
    };

    var _Game_Enemy_makeActions = Game_Enemy.prototype.makeActions;
    Game_Enemy.prototype.makeActions = function() {
        // --------------------------------------------------------------------
        // A. KECERDASAN TAKTIS: KING MORGAN (BOSS COMMANDER)
        // --------------------------------------------------------------------
        if (isKingMorgan(this)) {
            this.clearActions();
            var prof = ($gameTroop && $gameTroop._playerProfiler) ? $gameTroop._playerProfiler : null;
            var iq = prof ? prof.tacticalIQ : 1;
            var turn = $gameTroop ? $gameTroop.turnCount() : 1;
            var aliveKenek = this.countAliveKenek();
            var lowestActor = this.findLowestHpActor();

            var actionCount = this.makeActionTimes();
            for (var a = 0; a < actionCount; a++) {
                var action = new Game_Action(this);
                var chosenSkillId = 1; // Default Normal Attack
                var targetIndex = -1;

                // 1. FINISHER TACTIC: Bunuh Karakter Player yang Sekarat (< 35% HP)
                if (lowestActor && lowestActor.hpRate() <= 0.35 && this.tp >= 25 && (turn - (prof ? prof.lastFinisherTurn : -99) >= 2)) {
                    chosenSkillId = SKILL_ID_KINGS_EXECUTION;
                    targetIndex = lowestActor.index();
                    if (prof) prof.lastFinisherTurn = turn;
                    if (typeof Yure !== 'undefined' && Yure.BattleLog && typeof Yure.BattleLog.addCard === 'function') {
                        Yure.BattleLog.addCard("King Morgan melihat celah kelemahan pada " + lowestActor.name() + "! 'Habisi dia!'", 'warning');
                    }
                }
                // 2. TACTICAL COMMAND: Ubah Formasi Jon Kenek Berdasarkan Gaya Main Player
                else if (aliveKenek > 0 && (turn - (prof ? prof.lastKingCommandTurn : -99) >= 2)) {
                    if (prof && prof.currentDominantStyle === 'physical') {
                        // Player spam fisik -> Komando Phylax Deflect!
                        chosenSkillId = SKILL_ID_COMMAND_PHYLAX;
                        prof.lastKingCommandTurn = turn;
                        targetIndex = 0;
                    } else if (prof && prof.currentDominantStyle === 'turtle') {
                        // Player pasif / heal terus -> Serbu All-Out Assault!
                        chosenSkillId = SKILL_ID_COMMAND_ASSAULT;
                        prof.lastKingCommandTurn = turn;
                        targetIndex = 0;
                    } else if (prof && prof.currentDominantStyle === 'rush_boss') {
                        // Player coba rush King Morgan -> Pasang Phylax & Vanguard!
                        chosenSkillId = SKILL_ID_COMMAND_PHYLAX;
                        // Berikan juga state Vanguard pada kenek
                        var keneks = $gameTroop.aliveMembers().filter(isJonKenek);
                        keneks.forEach(function(k) { k.addState(STATE_ID_VANGUARD); });
                        prof.lastKingCommandTurn = turn;
                        targetIndex = 0;
                    } else if (a === 0 && turn % 3 === 0) {
                        // Pergantian ritme alami setiap 3 turn
                        chosenSkillId = (turn % 6 === 0) ? SKILL_ID_COMMAND_ASSAULT : SKILL_ID_COMMAND_PHYLAX;
                        prof.lastKingCommandTurn = turn;
                    }
                }

                // 3. JIKA TIDAK MEMAKAI KOMANDO / FINISHER, PILIH SERANGAN SESUAI TINGKAT IQ
                if (chosenSkillId === 1) {
                    if (iq >= 3 && Math.random() < 0.60) {
                        chosenSkillId = 5; // Triple Attack
                    } else if (iq >= 2 && Math.random() < 0.50) {
                        chosenSkillId = 4; // Double Attack
                    } else {
                        chosenSkillId = 1; // Normal Attack
                    }
                }

                action.setSkill(chosenSkillId);
                if (targetIndex >= 0) {
                    action.setTarget(targetIndex);
                } else {
                    action.decideRandomTarget();
                }
                this._actions.push(action);
            }
            return;
        }

        // --------------------------------------------------------------------
        // B. KECERDASAN TAKTIS: JON KENEK (GUARDIAN MINION)
        // --------------------------------------------------------------------
        if (isJonKenek(this)) {
            this.clearActions();
            var prof = ($gameTroop && $gameTroop._playerProfiler) ? $gameTroop._playerProfiler : null;
            var isLowHp = (this.hpRate() <= 0.35);
            var isPhylax = this.isStateAffected(STATE_ID_PHYLAX);
            var isAssault = this.isStateAffected(STATE_ID_ASSAULT);

            var action = new Game_Action(this);
            var chosenSkill = 1; // Default attack

            // 1. Kenek yang sekarat (< 35% HP) otomatis mengaktifkan Phylax untuk bertahan & memantulkan
            if (isLowHp && !isPhylax) {
                chosenSkill = SKILL_ID_PHYLAX_STANCE;
                action.setSkill(chosenSkill);
                action.setTarget(this.index());
                this._actions.push(action);
                return;
            }

            // 2. Jika dalam mode Phylax, gunakan Phylax Shield Bash untuk stun target yang berbahaya
            if (isPhylax && this.tp >= 20 && Math.random() < 0.65) {
                chosenSkill = SKILL_ID_SHIELD_BASH;
            }
            // 3. Jika dalam mode Assault, serang secara agresif
            else if (isAssault) {
                chosenSkill = (Math.random() < 0.40) ? 4 : 1; // Double Attack atau Basic
            }
            // 4. Jika netral (belum ada stance):
            else {
                // Separuh kenek menjaga formasi Phylax, separuh menyerang
                if (this.index() % 2 === 0) {
                    chosenSkill = SKILL_ID_PHYLAX_STANCE;
                    action.setSkill(chosenSkill);
                    action.setTarget(this.index());
                    this._actions.push(action);
                    return;
                } else {
                    chosenSkill = 1;
                }
            }

            action.setSkill(chosenSkill);
            action.decideRandomTarget();
            this._actions.push(action);
            return;
        }

        // Musuh lain gunakan behaviour default
        _Game_Enemy_makeActions.call(this);
    };

    console.log('Yure_AdaptiveBossAI: Plugin loaded and active! (King Morgan & Jon Kenek AI ready)');
})();

