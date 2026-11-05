//=============================================================================
// Yure_SanityTraumaSystem.js
//=============================================================================
/*:
 * @plugindesc [v2.0] Yure Party - Advanced Sanity System, Revised Trauma Manifestation & Adrenaline Syringe
 * @author Yure Party Dev Team
 *
 * @param --- General Sanity ---
 * @default
 *
 * @param Default Max Sanity
 * @parent --- General Sanity ---
 * @desc Default Max Sanity jika tidak diatur di notetag aktor.
 * @default 100
 *
 * @param Base Victory Sanity Loss
 * @parent --- General Sanity ---
 * @desc Sanity yang berkurang untuk tiap aktor yang berpartisipasi SETELAH MENANG bertarung.
 * @default 10
 *
 * @param Escape Sanity Loss
 * @parent --- General Sanity ---
 * @desc Sanity yang berkurang jika party melarikan diri (Escape). (0 = tidak berkurang).
 * @default 0
 *
 * @param --- Sanity Thresholds (%) ---
 * @default
 *
 * @param Stable Threshold
 * @parent --- Sanity Thresholds (%) ---
 * @desc Batas minimal persentase kondisi Stabil (Default: 76%).
 * @default 76
 *
 * @param Uneasy Threshold
 * @parent --- Sanity Thresholds (%) ---
 * @desc Batas minimal persentase kondisi Gelisah / Uneasy (Default: 51%).
 * @default 51
 *
 * @param Disturbed Threshold
 * @parent --- Sanity Thresholds (%) ---
 * @desc Batas minimal persentase kondisi Terganggu / Disturbed (Default: 26%).
 * @default 26
 *
 * @param Critical Threshold
 * @parent --- Sanity Thresholds (%) ---
 * @desc Batas minimal persentase kondisi Kritis / Critical (Default: 1%).
 * @default 1
 *
 * @param --- Trauma Manifestation (0 Sanity) ---
 * @default
 *
 * @param Trauma State ID
 * @parent --- Trauma Manifestation (0 Sanity) ---
 * @desc ID State untuk Trauma Manifestation di Database (0 = hanya sistem internal).
 * @default 0
 *
 * @param Auto Recover On Sanity Gain
 * @parent --- Trauma Manifestation (0 Sanity) ---
 * @desc Otomatis menyembuhkan Trauma Manifestation jika Sanity naik di atas 0? (true/false)
 * @default true
 *
 * @param Trauma Distortion FX
 * @parent --- Trauma Manifestation (0 Sanity) ---
 * @desc Aktifkan efek visual flash/shake layar saat aktor dalam Trauma bertindak? (true/false)
 * @default true
 *
 * @param Trauma Battle Log Text
 * @parent --- Trauma Manifestation (0 Sanity) ---
 * @desc Format pesan pop-up log saat aktor trauma bertindak (%1 = nama karakter, %2 = trauma profile).
 * @default %1 mengalami gejolak trauma psikologis!
 *
 * @param --- Adrenaline Syringe System ---
 * @default
 *
 * @param InGame Day Variable ID
 * @parent --- Adrenaline Syringe System ---
 * @desc ID Game Variable penanda Hari dalam game (MOG_TimeSystem menggunakan Var 11).
 * @default 11
 *
 * @param Syringe Rage Gain Rate
 * @parent --- Adrenaline Syringe System ---
 * @desc Persentase Rage/TP yang didapat saat mengonsumsi Adrenaline Syringe (0.25 = 25%).
 * @default 0.25
 *
 * @param Syringe Base Penalty Rate
 * @parent --- Adrenaline Syringe System ---
 * @desc Persentase Max Sanity untuk penalti pertempuran pertama (0.10 = 10%).
 * @default 0.10
 *
 * @param Syringe Multiplier Factor
 * @parent --- Adrenaline Syringe System ---
 * @desc Pengali eksponensial per battle & per syringe tambahan (Default: 1.5).
 * @default 1.5
 *
 * @param --- Battle HUD Indicator ---
 * @default
 *
 * @param Show Battle Sanity Badge
 * @parent --- Battle HUD Indicator ---
 * @desc Tampilkan badge status Sanity/Trauma di atas nama/status aktor saat battle?
 * @default true
 *
 * @help
 * ============================================================================
 * YURE PARTY — REVISED SANITY & ADRENALINE SYRINGE SYSTEM (v2.0)
 * ============================================================================
 *
 * Sistem individual Sanity, Trauma Manifestation (0 Sanity) berbasis karakter,
 * dan kalkulasi eksponensial Adrenaline Syringe dari Toko Mbah Karso.
 *
 * ----------------------------------------------------------------------------
 * 1. INDIVIDUAL SANITY & THRESHOLDS
 * ----------------------------------------------------------------------------
 * Setiap karakter memiliki Sanity tersendiri (0 - Max Sanity).
 * Sanity menetap (persist) antar pertempuran dan tidak pulih otomatis.
 *
 * 5 Tingkatan Kondisi (Thresholds):
 *  - 76% – 100% : Stabil (Normal)
 *  - 51% – 75%  : Uneasy (Gelisah)
 *  - 26% – 50%  : Disturbed (Terganggu)
 *  - 1%  – 25%  : Critical (Kritis)
 *  - 0%         : Trauma Manifestation (Kehilangan Kontrol)
 *
 * ----------------------------------------------------------------------------
 * 2. TRAUMA MANIFESTATION DI 0 SANITY
 * ----------------------------------------------------------------------------
 * Ketika Sanity aktor mencapai 0, kepribadian dan trauma masa lalunya bermanifestasi.
 * Karakter kehilangan kendali pemain dan memilih aksinya sendiri (Auto-Action).
 *
 * Mendukung Friendly Fire (menyerang rekan setim secara aman tanpa merusak
 * database skill global).
 *
 * Profil Bawaan Karakter:
 *  - Nia (Actor 1) — Psychic Breakdown:
 *      * Ledakan kekuatan psikis tak terkendali.
 *      * Peluang Target: 50% Musuh, 35% Sekutu (Friendly Fire), 15% Ledakan Area.
 *      * Skill pilihan: Spark, Ghost Blast, Harming Curse, atau Serangan Fisik.
 *      * Dialog & Visual Flash khas Nia.
 *
 *  - Saki (Actor 3) — Survival Panic:
 *      * Respon bertahan hidup ekstrim, paranoia menganggap kawan sebagai ancaman.
 *      * Peluang Target: 45% Musuh, 35% Sekutu, 20% Bertahan (Guard).
 *      * Skill pilihan: Im Afraid, Attack, Guard.
 *
 *  - Sophia (Actor 2) — Violent Dissociation:
 *      * Amarah lepas kendali, pertarungan fisik agresif membabi buta.
 *      * Peluang Target: 60% Musuh, 35% Sekutu, 5% Frenzy Attack berulang.
 *      * Skill pilihan: Attack, Saint Anger, Wind Ghost Fist, Hellsweep.
 *      * Menonaktifkan QTE EWGF sempurna (beralih ke pukulan kasar).
 *
 *  - Karakter Lain:
 *      * Peluang Target bawaan: 60% Musuh, 30% Sekutu, 10% Bertahan.
 *
 * Proteksi Khusus Saat Trauma:
 *  - Tidak bisa memicu combo Chain Skill normal.
 *  - Tidak memicu infinite counter attack antar sesama anggota party.
 *  - Trauma menetap setelah pertarungan selesai sampai diobati.
 *
 * ----------------------------------------------------------------------------
 * 3. ADRENALINE SYRINGE DARI MBAH KARSO
 * ----------------------------------------------------------------------------
 * Jarum suntik khusus yang dijual oleh Mbah Karso.
 * Efek instan saat dipakai:
 *  - Mengisi +25% Rage/TP.
 *  - Mengaktifkan penalti Sanity post-battle harian untuk aktor penerima suntikan.
 *
 * Formula Akumulasi Penalti Post-Battle:
 *   extraLoss = maxSanity * 0.10 * Math.pow(1.5, affectedBattleCount + syringeCount - 2)
 *   totalLoss = baseBattleLoss + extraLoss
 *
 *  - Syringe pertama di hari itu: +10% Max Sanity loss pada battle pertama yang diikuti.
 *  - Setiap battle berikutnya di hari yang sama: penalti dikalikan x1.5.
 *  - Setiap pemakaian syringe tambahan di hari yang sama: pengali langsung melonjak x1.5.
 *  - Penalti dihitung secara INDEPENDEN untuk masing-masing aktor.
 *
 * Reset Harian:
 *  - Saat nilai Variable Hari berubah, jumlah syringe dan affected battle count
 *    setiap aktor otomatis di-reset ke 0.
 *  - Nilai Sanity saat ini dan status Trauma Manifestation TETAP DIPERTAHANKAN.
 *
 * ----------------------------------------------------------------------------
 * NOTETAGS
 * ----------------------------------------------------------------------------
 * Notetag Aktor (Actors):
 *   <MaxSanity: 120>            -> Mengubah Max Sanity aktor.
 *   <TraumaProfile: Nia>        -> Mengatur profil trauma ('Nia', 'Saki', 'Sophia').
 *   <TraumaEnemyRate: 60>       -> Persentase menyerang musuh (0-100).
 *   <TraumaAllyRate: 30>        -> Persentase menyerang kawan (0-100).
 *   <TraumaSpecialRate: 10>     -> Persentase aksi bertahan/spesial (0-100).
 *   <TraumaSkills: 1,9,11>      -> Daftar ID skill yang bisa dipakai saat trauma.
 *
 * Notetag Item / Skill (Items / Skills):
 *   <adrenaline_syringe>        -> Menandai item sebagai Adrenaline Syringe Karso.
 *   <karso syringe>             -> Kompatibel juga dengan tag lama Karso Shop.
 *   <calm_trauma>               -> Menyembuhkan Trauma Manifestation target.
 *   <trauma_recovery>           -> Sama dengan <calm_trauma>.
 *
 * Notetag Event Map:
 *   \san[-15]                   -> Kurangi Sanity leader sebanyak 15 saat event dijalankan.
 *   \san[20]                    -> Tambah Sanity leader sebanyak 20.
 *
 * ----------------------------------------------------------------------------
 * PLUGIN COMMANDS
 * ----------------------------------------------------------------------------
 *   GainSanity [ActorID] [Value]
 *   Contoh: GainSanity 1 -15          (Kurangi Sanity Nia sebanyak 15)
 *   Contoh: GainSanity 2 25           (Tambah Sanity Sophia sebanyak 25)
 *
 *   SetSanity [ActorID] [Value]
 *   Contoh: SetSanity 1 100           (Set Sanity Nia ke 100)
 *
 *   TriggerTrauma [ActorID]
 *   Contoh: TriggerTrauma 1           (Paksa Nia masuk kondisi Trauma Manifestation)
 *
 *   RecoverTrauma [ActorID]
 *   Contoh: RecoverTrauma 1           (Sembuhkan trauma Nia & pulihkan sedikit sanity)
 *
 *   RecoverAllTrauma                  (Sembuhkan trauma seluruh anggota party)
 *
 *   ResetDailyAdrenaline [ActorID]    (Reset penalti syringe aktor tertentu)
 *   ResetAllDailyAdrenaline           (Reset penalti syringe seluruh aktor)
 *
 * ----------------------------------------------------------------------------
 * SCRIPT CALLS UNTUK DEVELOPER
 * ----------------------------------------------------------------------------
 *   actor.sanity                      -> Mengambil Sanity saat ini (0 - maxSanity).
 *   actor.maxSanity()                 -> Mengambil Max Sanity aktor.
 *   actor.sanityRate()                -> Persentase sanity (0.0 - 1.0).
 *   actor.sanityTier()                -> 'stable' | 'uneasy' | 'disturbed' | 'critical' | 'trauma'
 *   actor.isTraumaManifested()        -> True jika dalam Trauma Manifestation.
 *   actor.gainSanity(value)           -> Tambah/kurangi Sanity.
 *   actor.recordSyringeUse()          -> Catat penggunaan syringe pada aktor.
 *   actor.dailySyringeCount()         -> Jumlah syringe yang diminum aktor hari ini.
 *   actor.affectedBattleCount()       -> Jumlah battle yang telah dilewati sejak minum syringe.
 */

var Imported = Imported || {};
Imported.Yure_SanityTraumaSystem = true;

var Yure = Yure || {};
Yure.Sanity = Yure.Sanity || {};

(function() {
    'use strict';

    // ========================================================================
    // PARAMETERS & INITIALIZATION
    // ========================================================================
    var params = PluginManager.parameters('Yure_SanityTraumaSystem');
    if (!params || Object.keys(params).length === 0) {
        params = PluginManager.parameters('Custom_SanitySystem') || {};
    }

    Yure.Sanity.defaultMaxSanity       = Number(params['Default Max Sanity'] || 100);
    Yure.Sanity.baseVictorySanityLoss  = Number(params['Base Victory Sanity Loss'] || 10);
    Yure.Sanity.escapeSanityLoss       = Number(params['Escape Sanity Loss'] || 0);

    Yure.Sanity.stableThreshold        = Number(params['Stable Threshold'] || 76);
    Yure.Sanity.uneasyThreshold        = Number(params['Uneasy Threshold'] || 51);
    Yure.Sanity.disturbedThreshold     = Number(params['Disturbed Threshold'] || 26);
    Yure.Sanity.criticalThreshold      = Number(params['Critical Threshold'] || 1);

    Yure.Sanity.traumaStateId          = Number(params['Trauma State ID'] || 0);
    Yure.Sanity.autoRecoverOnGain      = String(params['Auto Recover On Sanity Gain'] || 'true') === 'true';
    Yure.Sanity.traumaDistortionFX     = String(params['Trauma Distortion FX'] || 'true') === 'true';
    Yure.Sanity.traumaLogText          = String(params['Trauma Battle Log Text'] || '%1 mengalami gejolak trauma psikologis!');

    Yure.Sanity.dayVariableId          = Number(params['InGame Day Variable ID'] || 11);
    Yure.Sanity.syringeRageRate        = Number(params['Syringe Rage Gain Rate'] || 0.25);
    Yure.Sanity.syringeBasePenalty     = Number(params['Syringe Base Penalty Rate'] || 0.10);
    Yure.Sanity.syringeMultiplier      = Number(params['Syringe Multiplier Factor'] || 1.5);

    Yure.Sanity.showBattleBadge        = String(params['Show Battle Sanity Badge'] || 'true') === 'true';

    // ========================================================================
    // TRAUMA PROFILES PRESETS
    // ========================================================================
    Yure.Sanity.TraumaProfiles = {
        'nia': {
            name: 'Psychic Breakdown',
            enemyRate: 50,
            allyRate: 35,
            specialRate: 15,
            skills: [1, 10, 15, 16], // Attack, Spark, Ghost Blast, Harming Curse
            quotes: [
                "Kepalaku... suaranya terlalu keras!",
                "Pergi dari kepalaku!",
                "Berhenti melihatku seperti itu!",
                "Aku tidak bisa mengendalikannya lagi...!"
            ],
            flashColor: [160, 40, 255, 130],
            se: 'Collapse3'
        },
        'saki': {
            name: 'Survival Panic',
            enemyRate: 45,
            allyRate: 35,
            specialRate: 20, // Guard / Defend
            skills: [1, 13, 2], // Attack, Im Afraid, Guard
            quotes: [
                "Kalian mau menjebakku?!",
                "Jangan mendekat... JANGAN MENDEKAT!",
                "Aku harus bertahan hidup... dengan cara apapun!",
                "Siapapun dari kalian bisa berkhianat!"
            ],
            flashColor: [60, 180, 255, 120],
            se: 'Evasion2'
        },
        'sophia': {
            name: 'Violent Dissociation',
            enemyRate: 60,
            allyRate: 35,
            specialRate: 5, // Frenzy burst
            skills: [1, 9, 11, 14], // Attack, Saint Anger, Wind Ghost Fist, Hellsweep
            quotes: [
                "Hancur... SEMUANYA HARUS HANCUR!",
                "Jangan sentuh aku!",
                "Biar kuhabisi kalian semua sampai diam!",
                "Rasa sakit ini... tidak akan berhenti!"
            ],
            flashColor: [255, 40, 40, 140],
            se: 'Attack3'
        },
        'default': {
            name: 'Psychological Trauma',
            enemyRate: 60,
            allyRate: 30,
            specialRate: 10,
            skills: [1, 2],
            quotes: [
                "Pikiranku terasa hancur...!",
                "Siapa kalian?! Menjauh!",
                "Aku tidak bisa berpikir jernih lagi!"
            ],
            flashColor: [200, 50, 50, 120],
            se: 'Damage4'
        }
    };

    // ========================================================================
    // GAME_ACTOR — SANITY & TRAUMA IMPLEMENTATION
    // ========================================================================
    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        this.initSanity();
        this.initSyringeData();
    };

    Game_Actor.prototype.initSanity = function() {
        this._sanity = this.maxSanity();
        this._traumaManifested = false;
    };

    Game_Actor.prototype.initSyringeData = function() {
        this._dailySyringeCount = 0;
        this._affectedBattleCount = 0;
        this._lastSyringeDay = 0;
    };

    Game_Actor.prototype.maxSanity = function() {
        var actorData = $dataActors[this.actorId()];
        if (actorData && actorData.meta) {
            if (actorData.meta.MaxSanity) {
                return Number(actorData.meta.MaxSanity);
            }
            if (actorData.meta.maxSanity) {
                return Number(actorData.meta.maxSanity);
            }
        }
        return Yure.Sanity.defaultMaxSanity;
    };

    Object.defineProperty(Game_Actor.prototype, 'sanity', {
        get: function() {
            if (this._sanity === undefined) {
                this.initSanity();
            }
            return Math.max(0, Math.min(this.maxSanity(), this._sanity));
        },
        set: function(val) {
            var max = this.maxSanity();
            var prev = this._sanity !== undefined ? this._sanity : max;
            this._sanity = Math.max(0, Math.min(max, Math.round(val)));
            this.checkSanityTransitions(prev, this._sanity);
        },
        configurable: true
    });

    Game_Actor.prototype.sanityRate = function() {
        return this.maxSanity() > 0 ? (this.sanity / this.maxSanity()) : 0;
    };

    Game_Actor.prototype.sanityTier = function() {
        var rate = this.sanityRate() * 100;
        if (this.sanity <= 0 || this._traumaManifested) {
            return 'trauma';
        }
        if (rate >= Yure.Sanity.stableThreshold) {
            return 'stable';
        }
        if (rate >= Yure.Sanity.uneasyThreshold) {
            return 'uneasy';
        }
        if (rate >= Yure.Sanity.disturbedThreshold) {
            return 'disturbed';
        }
        return 'critical';
    };

    Game_Actor.prototype.isTraumaManifested = function() {
        if (this.sanity <= 0) {
            return true;
        }
        return !!this._traumaManifested;
    };

    Game_Actor.prototype.setTraumaManifested = function(enabled) {
        var changed = (this._traumaManifested !== enabled);
        this._traumaManifested = !!enabled;

        if (Yure.Sanity.traumaStateId > 0) {
            if (this._traumaManifested) {
                this.addNewState(Yure.Sanity.traumaStateId);
            } else {
                this.eraseState(Yure.Sanity.traumaStateId);
            }
        }

        if (changed && this._traumaManifested) {
            this.onTraumaManifested();
        }
    };

    Game_Actor.prototype.checkSanityTransitions = function(oldVal, newVal) {
        if (newVal <= 0) {
            if (!this._traumaManifested) {
                this.setTraumaManifested(true);
            }
        } else if (newVal > 0 && oldVal <= 0) {
            if (Yure.Sanity.autoRecoverOnGain && this._traumaManifested) {
                this.setTraumaManifested(false);
            }
        }
    };

    Game_Actor.prototype.onTraumaManifested = function() {
        // Visual / Audio cue saat trauma pertama kali aktif
        if (SceneManager._scene instanceof Scene_Battle) {
            if (Yure.Sanity.traumaDistortionFX) {
                $gameScreen.startFlash([220, 30, 30, 160], 35);
                $gameScreen.startShake(5, 5, 25);
            }
            SoundManager.playActorCollapse ? SoundManager.playActorCollapse() : SoundManager.playBuzzer();
        }
    };

    Game_Actor.prototype.gainSanity = function(value) {
        if (isNaN(value)) return;
        this.sanity += value;
    };

    // ========================================================================
    // ADRENALINE SYRINGE TRACKING & CALCULATIONS
    // ========================================================================
    Game_Actor.prototype.dailySyringeCount = function() {
        this.checkDailySyringeReset();
        return this._dailySyringeCount || 0;
    };

    Game_Actor.prototype.affectedBattleCount = function() {
        this.checkDailySyringeReset();
        return this._affectedBattleCount || 0;
    };

    Game_Actor.prototype.recordSyringeUse = function() {
        this.checkDailySyringeReset();
        this._dailySyringeCount = (this._dailySyringeCount || 0) + 1;
    };

    Game_Actor.prototype.recordAffectedBattle = function() {
        this.checkDailySyringeReset();
        if (this.dailySyringeCount() > 0) {
            this._affectedBattleCount = (this._affectedBattleCount || 0) + 1;
        }
    };

    Game_Actor.prototype.calculateSyringeSanityLoss = function() {
        this.checkDailySyringeReset();
        var syringeCount = this.dailySyringeCount();
        if (syringeCount <= 0) {
            return 0;
        }

        var affectedBattles = this.affectedBattleCount();
        // Formula dokumen:
        // extraSanityLoss = actor.maxSanity() * 0.10 * Math.pow(1.5, affectedBattleCount + syringeCount - 2)
        var exponent = Math.max(0, affectedBattles + syringeCount - 2);
        var extraSanityLoss = this.maxSanity() * Yure.Sanity.syringeBasePenalty * Math.pow(Yure.Sanity.syringeMultiplier, exponent);
        return Math.round(extraSanityLoss);
    };

    Game_Actor.prototype.checkDailySyringeReset = function() {
        var currentDay = 1;
        if (Yure.Sanity.dayVariableId > 0 && typeof $gameVariables !== 'undefined') {
            currentDay = $gameVariables.value(Yure.Sanity.dayVariableId);
        } else if (typeof $gameSystem !== 'undefined' && typeof $gameSystem.day === 'function') {
            currentDay = $gameSystem.day();
        }

        if (this._lastSyringeDay === undefined || this._lastSyringeDay !== currentDay) {
            this._lastSyringeDay = currentDay;
            this._dailySyringeCount = 0;
            this._affectedBattleCount = 0;
        }
    };

    Game_Actor.prototype.resetDailySyringeData = function() {
        this._dailySyringeCount = 0;
        this._affectedBattleCount = 0;
    };

    // ========================================================================
    // TRAUMA PROFILE GETTER
    // ========================================================================
    Game_Actor.prototype.getTraumaProfile = function() {
        var actorData = $dataActors[this.actorId()];
        var key = 'default';

        if (actorData && actorData.meta && actorData.meta.TraumaProfile) {
            key = String(actorData.meta.TraumaProfile).trim().toLowerCase();
        } else {
            var name = this.name().toLowerCase();
            if (name.includes('nia')) key = 'nia';
            else if (name.includes('saki')) key = 'saki';
            else if (name.includes('sophia')) key = 'sophia';
        }

        var base = Yure.Sanity.TraumaProfiles[key] || Yure.Sanity.TraumaProfiles['default'];
        var profile = Object.assign({}, base);

        // Notetag Overrides
        if (actorData && actorData.meta) {
            if (actorData.meta.TraumaEnemyRate) {
                profile.enemyRate = Number(actorData.meta.TraumaEnemyRate);
            }
            if (actorData.meta.TraumaAllyRate) {
                profile.allyRate = Number(actorData.meta.TraumaAllyRate);
            }
            if (actorData.meta.TraumaSpecialRate) {
                profile.specialRate = Number(actorData.meta.TraumaSpecialRate);
            }
            if (actorData.meta.TraumaSkills) {
                profile.skills = String(actorData.meta.TraumaSkills).split(',').map(function(s) {
                    return Number(s.trim());
                }).filter(function(n) { return n > 0; });
            }
        }

        return profile;
    };

    // ========================================================================
    // BATTLE CONTROL & AUTO ACTION UNDER TRAUMA
    // ========================================================================
    var _Game_Actor_canInput = Game_Actor.prototype.canInput;
    Game_Actor.prototype.canInput = function() {
        if (this.isTraumaManifested()) {
            return false; // Karakter kehilangan kontrol manual
        }
        return _Game_Actor_canInput.call(this);
    };

    var _Game_Actor_makeActions = Game_Actor.prototype.makeActions;
    Game_Actor.prototype.makeActions = function() {
        if (this.isTraumaManifested()) {
            this.makeTraumaActions();
            return;
        }
        _Game_Actor_makeActions.call(this);
    };

    Game_Actor.prototype.makeTraumaActions = function() {
        this.clearActions();
        var numActions = this.makeActionTimes();
        var profile = this.getTraumaProfile();

        for (var i = 0; i < numActions; i++) {
            var action = new Game_Action(this);
            var roll = Math.random() * 100;
            var enemyChance = profile.enemyRate || 60;
            var allyChance = profile.allyRate || 30;

            // Pilih skill yang kompatibel
            var selectedSkillId = this.selectTraumaSkill(profile, roll >= (enemyChance + allyChance));
            action.setSkill(selectedSkillId);

            // Tentukan Target
            if (roll < enemyChance) {
                // Target Musuh Acak
                var livingEnemies = $gameTroop.aliveMembers();
                if (livingEnemies.length > 0) {
                    var targetEnemy = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
                    action.setTarget(targetEnemy.index());
                } else {
                    action.setTarget(0);
                }
            } else if (roll < enemyChance + allyChance) {
                // Friendly Fire: Target Kawan Acak
                var livingAllies = $gameParty.aliveMembers();
                if (livingAllies.length > 0) {
                    var targetAlly = livingAllies[Math.floor(Math.random() * livingAllies.length)];
                    action.setTarget(targetAlly.index());
                    action._traumaFriendlyFire = true;
                } else {
                    action.setTarget(0);
                }
            } else {
                // Aksi Khusus / Defend / Burst
                if (profile.name === 'Survival Panic') {
                    action.setSkill(this.guardSkillId()); // Saki memilih bertahan
                } else {
                    // Serangan random ke musuh / kawan
                    var livingAll = $gameParty.aliveMembers().concat($gameTroop.aliveMembers());
                    var randomTarget = livingAll[Math.floor(Math.random() * livingAll.length)];
                    if (randomTarget.isActor()) {
                        action._traumaFriendlyFire = true;
                    }
                    action.setTarget(randomTarget.index());
                }
            }

            action._isTraumaAction = true;
            this._actions.push(action);
        }

        this.setActionState('waiting');
    };

    Game_Actor.prototype.selectTraumaSkill = function(profile, isSpecial) {
        var usableSkills = [];
        if (profile.skills && profile.skills.length > 0) {
            for (var i = 0; i < profile.skills.length; i++) {
                var sId = profile.skills[i];
                var skill = $dataSkills[sId];
                if (skill && (this.canUse(skill) || sId === this.attackSkillId() || sId === this.guardSkillId())) {
                    usableSkills.push(sId);
                }
            }
        }

        if (usableSkills.length === 0) {
            usableSkills.push(this.attackSkillId());
        }

        // Sophia violent dissociation: jangan izinkan EWGF normal QTE
        return usableSkills[Math.floor(Math.random() * usableSkills.length)];
    };

    // ========================================================================
    // FRIENDLY FIRE & TARGETING OVERRIDE (SAFE & NON-DESTRUCTIVE)
    // ========================================================================
    var _Game_Action_makeTargets = Game_Action.prototype.makeTargets;
    Game_Action.prototype.makeTargets = function() {
        if (this._traumaFriendlyFire) {
            var targets = [];
            if (!this._forcing && this.subject().isConfused()) {
                // default confusion fallback
            }
            var unit = this.subject().friendsUnit(); // Ganti unit target menjadi Friends (Party)
            if (this.isForOne()) {
                var target = unit.smoothTarget(this._targetIndex);
                if (target && target.isAlive()) {
                    targets.push(target);
                } else {
                    // Fallback ke rekan hidup acak
                    var alive = unit.aliveMembers();
                    if (alive.length > 0) {
                        targets.push(alive[Math.floor(Math.random() * alive.length)]);
                    }
                }
            } else if (this.isForAll()) {
                targets = unit.aliveMembers();
            } else {
                targets.push(unit.smoothTarget(this._targetIndex));
            }
            return this.repeatTargets(targets);
        }
        return _Game_Action_makeTargets.call(this);
    };

    // Cegah Counter-Attack rekursif antar sesama rekan party (Anti-Crash Loop)
    var _Game_Battler_meetsCounterConditions = Game_Battler.prototype.meetsCounterConditions;
    if (Game_Battler.prototype.meetsCounterConditions) {
        Game_Battler.prototype.meetsCounterConditions = function(action) {
            if (action && action._traumaFriendlyFire) {
                return false; // Jangan balas serang kawan sendiri yang sedang trauma
            }
            return _Game_Battler_meetsCounterConditions.call(this, action);
        };
    }

    // ========================================================================
    // EWGF QTE & CHAIN SKILL OVERRIDES SAAT TRAUMA
    // ========================================================================
    // 1. Matikan prompt Chain Skill jika aktor sedang trauma
    var _Scene_Battle_pethogsOnEquipOk = Scene_Battle.prototype.pethogsOnEquipOk;
    if (Scene_Battle.prototype.pethogsOnEquipOk) {
        Scene_Battle.prototype.pethogsOnEquipOk = function() {
            var actor = BattleManager.actor();
            if (actor && actor.isTraumaManifested()) {
                SoundManager.playBuzzer();
                return;
            }
            _Scene_Battle_pethogsOnEquipOk.call(this);
        };
    }

    // 2. Bypass QTE EWGF saat trauma (uncontrolled strike)
    var _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        var subject = this._subject;
        var action = subject ? subject.currentAction() : null;

        if (subject && subject.isActor() && subject.isTraumaManifested()) {
            if (action) {
                // Tandai bahwa QTE tidak boleh jalan secara manual
                action._yureQteHandled = true;
                action._yureQteSuccess = false; // Gagal QTE sempurna jika EWGF digunakan
                
                // Jika skill adalah EWGF (<QTE: 11>), ubah ke fail skill (WGF/Attack)
                var item = action.item();
                if (item && item.note) {
                    var match = item.note.match(/<QTE:\s*(\d+)>/i);
                    if (match) {
                        var fallbackSkillId = parseInt(match[1]);
                        if (fallbackSkillId > 0) {
                            action.setSkill(fallbackSkillId);
                        }
                    }
                }

                // Tampilkan efek visual dan kutipan trauma
                Yure.Sanity.displayTraumaActionFeedback(subject);
            }
        }
        _BattleManager_startAction.call(this);
    };

    Yure.Sanity.displayTraumaActionFeedback = function(actor) {
        var profile = actor.getTraumaProfile();
        if (Yure.Sanity.traumaDistortionFX) {
            var color = profile.flashColor || [200, 40, 40, 120];
            $gameScreen.startFlash(color, 24);
        }
        if (profile.se) {
            AudioManager.playSe({ name: profile.se, volume: 90, pitch: 100, pan: 0 });
        }

        // Tampilkan Kutipan Karakter di Battle Log
        if (profile.quotes && profile.quotes.length > 0 && BattleManager._logWindow) {
            var quote = profile.quotes[Math.floor(Math.random() * profile.quotes.length)];
            var header = Yure.Sanity.traumaLogText.format(actor.name(), profile.name);
            BattleManager._logWindow.addText("\\c[18]" + header);
            BattleManager._logWindow.addText("\\c[27]\"" + quote + "\"");
        }
    };

    // ========================================================================
    // POST-BATTLE SANITY DEDUCTION & SYRINGE PENALTY
    // ========================================================================
    var _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _BattleManager_endBattle.call(this, result);

        // Hanya pertarungan yang MENANG (result === 0) yang mengurangi Sanity & memicu Syringe
        if (result === 0) {
            $gameParty.battleMembers().forEach(function(actor) {
                if (actor) {
                    actor.recordAffectedBattle();
                    var extraLoss = actor.calculateSyringeSanityLoss();
                    var totalLoss = Yure.Sanity.baseVictorySanityLoss + extraLoss;
                    actor.gainSanity(-totalLoss);
                }
            });
        } else if (result === 1 && Yure.Sanity.escapeSanityLoss > 0) {
            // Melarikan diri (Escape)
            $gameParty.battleMembers().forEach(function(actor) {
                if (actor) {
                    actor.gainSanity(-Yure.Sanity.escapeSanityLoss);
                }
            });
        }
    };

    // ========================================================================
    // ITEM APPLIER (ADRENALINE SYRINGE & CALMING ITEMS)
    // ========================================================================
    var _Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
    Game_Action.prototype.applyItemUserEffect = function(target) {
        _Game_Action_applyItemUserEffect.call(this, target);
        var item = this.item();
        if (!item || !target || !target.isActor()) return;

        // 1. Deteksi Adrenaline Syringe
        var isSyringe = false;
        if (item.meta && (item.meta.adrenaline_syringe || item.meta.karso_syringe)) {
            isSyringe = true;
        } else if (item.name && item.name.toLowerCase().includes('adrenaline syringe')) {
            isSyringe = true;
        } else if (item.note && (item.note.match(/<karso syringe>/i) || item.note.match(/<adrenaline_syringe>/i))) {
            isSyringe = true;
        }

        if (isSyringe) {
            // Tambah +25% Rage/TP
            var rageBonus = Math.round(target.maxTp() * Yure.Sanity.syringeRageRate);
            target.gainTp(rageBonus);

            // Catat penggunaan syringe harian
            target.recordSyringeUse();

            // Efek suara injeksi & visual feedback
            SoundManager.playRecovery ? SoundManager.playRecovery() : SoundManager.playUseItem();
        }

        // 2. Deteksi Item / Skill Penenang Trauma
        var isCalm = false;
        if (item.meta && (item.meta.calm_trauma || item.meta.trauma_recovery)) {
            isCalm = true;
        } else if (item.note && (item.note.match(/<calm_trauma>/i) || item.note.match(/<trauma_recovery>/i))) {
            isCalm = true;
        }

        if (isCalm) {
            target.setTraumaManifested(false);
            if (target.sanity <= 0) {
                target.gainSanity(15); // Pemulihan dasar agar tidak langsung kambuh
            }
        }
    };

    // ========================================================================
    // IN-GAME DAY CHANGE DETECTOR (DAILY RESET)
    // ========================================================================
    var _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.call(this, sceneActive);
        if (sceneActive && Graphics.frameCount % 120 === 0) {
            // Periksa pergantian hari secara periodik
            $gameParty.members().forEach(function(actor) {
                if (actor) {
                    actor.checkDailySyringeReset();
                }
            });
        }
    };

    // Notetag Event Map \san[X]
    var _Game_Event_start = Game_Event.prototype.start;
    Game_Event.prototype.start = function() {
        _Game_Event_start.call(this);
        var ev = this.event();
        if (ev && ev.note) {
            var match = ev.note.match(/\\san\[(-?\d+)\]/i);
            if (match) {
                var value = Number(match[1]);
                var leader = $gameParty.leader();
                if (leader) {
                    leader.gainSanity(value);
                }
            }
        }
    };

    // ========================================================================
    // BATTLE STATUS WINDOW SANITY / TRAUMA BADGE
    // ========================================================================
    var _Window_BattleStatus_drawActorIcons = Window_BattleStatus.prototype.drawActorIcons;
    Window_BattleStatus.prototype.drawActorIcons = function(actor, x, y, width) {
        _Window_BattleStatus_drawActorIcons.call(this, actor, x, y, width);
        if (Yure.Sanity.showBattleBadge && actor) {
            this.drawActorSanityBadge(actor, x, y, width);
        }
    };

    Window_BattleStatus.prototype.drawActorSanityBadge = function(actor, x, y, width) {
        var tier = actor.sanityTier();
        var label = "SAN " + actor.sanity + "/" + actor.maxSanity();
        var color = "#34d399"; // Green

        if (tier === 'uneasy') {
            color = "#facc15"; // Yellow
        } else if (tier === 'disturbed') {
            color = "#fb923c"; // Orange
        } else if (tier === 'critical') {
            color = "#f87171"; // Red
        } else if (tier === 'trauma') {
            label = "⚠️ TRAUMA";
            color = "#c084fc"; // Purple
        }

        var saveSize = this.contents.fontSize;
        this.contents.fontSize = 12;
        this.changeTextColor(color);
        this.drawText(label, x, y - 22, width || 120, 'right');
        this.contents.fontSize = saveSize;
        this.resetTextColor();
    };

    // ========================================================================
    // PLUGIN COMMANDS
    // ========================================================================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        var cmd = command.toLowerCase();

        if (cmd === 'gainsanity' || cmd === 'changesanity') {
            var aId = Number(args[0]);
            var val = Number(args[1]);
            var a = $gameActors.actor(aId);
            if (a) a.gainSanity(val);
        } else if (cmd === 'setsanity') {
            var aId = Number(args[0]);
            var val = Number(args[1]);
            var a = $gameActors.actor(aId);
            if (a) a.sanity = val;
        } else if (cmd === 'triggertrauma') {
            var aId = Number(args[0]);
            var a = $gameActors.actor(aId);
            if (a) {
                a.sanity = 0;
                a.setTraumaManifested(true);
            }
        } else if (cmd === 'recovertrauma') {
            var aId = Number(args[0]);
            var a = $gameActors.actor(aId);
            if (a) {
                a.setTraumaManifested(false);
                if (a.sanity <= 0) a.gainSanity(25);
            }
        } else if (cmd === 'recoveralltrauma') {
            $gameParty.members().forEach(function(a) {
                if (a) {
                    a.setTraumaManifested(false);
                    if (a.sanity <= 0) a.gainSanity(25);
                }
            });
        } else if (cmd === 'resetdailyadrenaline') {
            var aId = Number(args[0]);
            var a = $gameActors.actor(aId);
            if (a) a.resetDailySyringeData();
        } else if (cmd === 'resetalldailyadrenaline') {
            $gameParty.members().forEach(function(a) {
                if (a) a.resetDailySyringeData();
            });
        }
    };

})();
