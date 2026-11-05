//=============================================================================
// Yure_AutoPlayBGM.js
//=============================================================================
/*:
 * @plugindesc (v1.4) Memutar BGM Title/Menu, Enforce Solo Party Tutorial, AI Monster Agresif, Audio Unmute Safeguard & Autoplay Policy Fix.
 * @author Yure
 *
 * @param overrideBgm
 * @text Override Title BGM
 * @desc Masukkan nama BGM (contoh: Dancing Dead) jika ingin mengunci lagu ini. Kosongkan untuk mengikuti Database -> System -> Title BGM.
 * @default 
 *
 * @help
 * Plugin inti untuk Title BGM, Solo Party Tutorial, dan AI Monster Agresif.
 * Fitur:
 * - Otomatis membaca Title BGM dari Database RPG Maker (System.json) jika parameter dikosongkan.
 * - Safeguard Unmute: Otomatis mengembalikan volume BGM ke 100 jika sebelumnya termute (0) di save/config.rpgsave.
 * - Aliasing dua arah cerdas antara 'Dancing Dead' dan 'Dancing Shadow'.
 * - Penanganan WebAudio Autoplay Policy & AudioContext Resume otomatis.
 */

(function() {
    var PLUGIN_NAME = 'Yure_AutoPlayBGM';
    var params = PluginManager.parameters(PLUGIN_NAME);
    var rawParam = String(params['overrideBgm'] || '').trim();
    // Jika kosong atau bernilai placeholder default, ikuti Database System
    var overrideBgmName = (rawParam && rawParam !== 'New_Project' && rawParam.toLowerCase() !== 'system' && rawParam.toLowerCase() !== 'default') ? rawParam : '';

    // ========================================================================
    // ========================================================================
    // 0. AUDIO CONTEXT & CONFIG INITIALIZATION (ALLOW VOLUME REDUCTION & 0%)
    // ========================================================================
    function ensureAudioResumed() {
        if (typeof WebAudio !== 'undefined' && WebAudio._context) {
            if (WebAudio._context.state === 'suspended' && typeof WebAudio._context.resume === 'function') {
                WebAudio._context.resume().catch(function() {});
            }
        }
    }

    function ensureUnmuted() {
        // Hanya inisialisasi jika nilai belum ada (undefined/NaN).
        // JANGAN pernah me-reset volume 0 ke 100 agar opsi mute / pengurangan volume berfungsi!
        if (typeof AudioManager !== 'undefined') {
            if (AudioManager.bgmVolume === undefined || isNaN(AudioManager.bgmVolume)) {
                AudioManager.bgmVolume = 100;
            }
        }
        if (typeof ConfigManager !== 'undefined') {
            if (ConfigManager.bgmVolume === undefined || isNaN(ConfigManager.bgmVolume)) {
                ConfigManager.bgmVolume = 100;
            }
        }
    }

    // Tangani interaksi user awal untuk membuka kunci WebAudio jika Chromium menahan audio
    if (typeof window !== 'undefined') {
        var _onUserInteract = function() {
            ensureAudioResumed();
            ensureUnmuted();
            window.removeEventListener('click', _onUserInteract);
            window.removeEventListener('keydown', _onUserInteract);
            window.removeEventListener('mousedown', _onUserInteract);
            window.removeEventListener('touchstart', _onUserInteract);
        };
        window.addEventListener('click', _onUserInteract);
        window.addEventListener('keydown', _onUserInteract);
        window.addEventListener('mousedown', _onUserInteract);
        window.addEventListener('touchstart', _onUserInteract);
    }

    // Pastikan konfigurasi volume valid tanpa memaksa volume 0 kembali ke 100
    if (typeof ConfigManager !== 'undefined') {
        var _ConfigManager_applyData = ConfigManager.applyData;
        ConfigManager.applyData = function(config) {
            _ConfigManager_applyData.call(this, config);
            if (this.bgmVolume === undefined || isNaN(this.bgmVolume)) {
                this.bgmVolume = 100;
            }
        };
    }

    // Pastikan updateBgmParameters selalu memperbarui volume buffer secara presisi
    if (typeof AudioManager !== 'undefined') {
        var _AudioManager_updateBgmParameters = AudioManager.updateBgmParameters;
        AudioManager.updateBgmParameters = function(bgm) {
            var current = bgm || this._currentBgm || { volume: 100, pitch: 100, pan: 0 };
            _AudioManager_updateBgmParameters.call(this, current);
        };
    }

    // ========================================================================
    // PERBAIKAN INTERAKSI OPSI VOLUME (KLIK MOUSE KIRI/KANAN & SCROLL WHEEL)
    // ========================================================================
    if (typeof Window_Options !== 'undefined') {
        // Tampilkan panah ◄ 80% ► agar pemain jelas melihat tombol/arah pengurangan
        Window_Options.prototype.volumeStatusText = function(value) {
            return '◄ ' + value + '% ►';
        };

        var _Window_Options_statusWidth = Window_Options.prototype.statusWidth;
        Window_Options.prototype.statusWidth = function() {
            return 140;
        };

        // Klik Mouse & Layar Sentuh cerdas:
        // Klik di sebelah kiri = kurangi volume
        // Klik di sebelah kanan = tambah volume
        var _Window_Options_onTouch = Window_Options.prototype.onTouch;
        Window_Options.prototype.onTouch = function(triggered) {
            var lastIndex = this.index();
            var x = this.canvasToLocalX(TouchInput.x);
            var y = this.canvasToLocalY(TouchInput.y);
            var hitIndex = this.hitTest(x, y);
            if (hitIndex >= 0 && triggered && this.isTouchOkEnabled()) {
                var symbol = this.commandSymbol(hitIndex);
                if (this.isVolumeSymbol(symbol)) {
                    this.select(hitIndex);
                    var rect = this.itemRect(hitIndex);
                    var statusWidth = this.statusWidth();
                    var titleWidth = rect.width - statusWidth;
                    var midX = rect.x + titleWidth + (statusWidth / 2);
                    if (x < midX) {
                        this.cursorLeft(true);
                    } else {
                        this.cursorRight(true);
                    }
                    if (this.index() !== lastIndex) {
                        SoundManager.playCursor();
                    }
                    return;
                }
            }
            _Window_Options_onTouch.call(this, triggered);
        };

        // Dukungan Scroll Wheel Mouse untuk semua opsi volume
        var _Window_Options_processWheel = Window_Options.prototype.processWheel;
        Window_Options.prototype.processWheel = function() {
            if (this.isOpenAndActive()) {
                var threshold = 20;
                var index = this.index();
                var symbol = this.commandSymbol(index);
                if (this.isVolumeSymbol(symbol)) {
                    if (TouchInput.wheelY >= threshold) {
                        this.cursorLeft(true);
                        return;
                    } else if (TouchInput.wheelY <= -threshold) {
                        this.cursorRight(true);
                        return;
                    }
                }
            }
            if (_Window_Options_processWheel) {
                _Window_Options_processWheel.call(this);
            } else {
                Window_Command.prototype.processWheel.call(this);
            }
        };
    }

    // ========================================================================
    // 1. RESOLUSI TITLE BGM
    // ========================================================================
    function resolveTitleBgm() {
        if (overrideBgmName) {
            return {
                name: overrideBgmName.replace(/\.(ogg|m4a)$/i, ''),
                volume: 100,
                pitch: 100,
                pan: 0
            };
        }
        if ($dataSystem && $dataSystem.titleBgm && $dataSystem.titleBgm.name) {
            return $dataSystem.titleBgm;
        }
        // Fallback langsung baca System.json via NW.js jika dipanggil saat $dataSystem belum siap
        try {
            if (typeof require === 'function') {
                var fs = require('fs');
                var path = require('path');
                var base = path.dirname(process.mainModule ? process.mainModule.filename : window.location.pathname);
                var sysPath = path.join(base, 'data/System.json');
                if (fs.existsSync(sysPath)) {
                    var sys = JSON.parse(fs.readFileSync(sysPath, 'utf8'));
                    if (sys && sys.titleBgm && sys.titleBgm.name) {
                        return sys.titleBgm;
                    }
                }
            }
        } catch (e) {
            // ignore
        }
        return null;
    }

    // ========================================================================
    // 2. ALIASING & FALLBACK AUDIO DUA ARAH (Dancing Dead <-> Dancing Shadow)
    // ========================================================================
    if (typeof AudioManager !== 'undefined') {
        var _AudioManager_createBuffer = AudioManager.createBuffer;
        AudioManager.createBuffer = function(folder, name) {
            if (folder === 'bgm') {
                var n = String(name || '').trim().replace(/\.(ogg|m4a)$/i, '');
                var nLower = n.toLowerCase();
                if (nLower === 'dancing dead' || nLower === 'dancing shadow') {
                    try {
                        if (typeof require === 'function') {
                            var fs = require('fs');
                            var path = require('path');
                            var base = path.dirname(process.mainModule ? process.mainModule.filename : window.location.pathname);
                            var ext = this.audioFileExt();
                            var target = path.join(base, 'audio/bgm', n + ext);
                            if (!fs.existsSync(target)) {
                                var alt = (nLower === 'dancing dead') ? 'Dancing Shadow' : 'Dancing Dead';
                                if (fs.existsSync(path.join(base, 'audio/bgm', alt + ext))) {
                                    name = alt;
                                }
                            } else {
                                name = n;
                            }
                        }
                    } catch (e) {
                        name = n;
                    }
                } else {
                    name = n;
                }
            }
            return _AudioManager_createBuffer.call(this, folder, name);
        };
    }

    // ========================================================================
    // 3. PEMUTARAN MUSIK TITLE DI AWAL BOOT & TITLE SCREEN
    // ========================================================================
    if (typeof Scene_Boot !== 'undefined') {
        var _Scene_Boot_start = Scene_Boot.prototype.start;
        Scene_Boot.prototype.start = function() {
            _Scene_Boot_start.call(this);
            if (!DataManager.isBattleTest() && !DataManager.isEventTest()) {
                ensureAudioResumed();
                ensureUnmuted();
                var bgm = resolveTitleBgm();
                if (bgm && bgm.name) {
                    AudioManager.playBgm(bgm);
                    AudioManager.stopBgs();
                    AudioManager.stopMe();
                }
            }
        };
    }

    if (typeof Scene_Title !== 'undefined') {
        var _Scene_Title_playTitleMusic = Scene_Title.prototype.playTitleMusic;
        Scene_Title.prototype.playTitleMusic = function() {
            ensureAudioResumed();
            ensureUnmuted();
            var bgm = resolveTitleBgm();
            if (bgm && bgm.name) {
                AudioManager.playBgm(bgm);
                AudioManager.stopBgs();
                AudioManager.stopMe();
            } else {
                _Scene_Title_playTitleMusic.call(this);
            }
        };
    }

    // ========================================================================
    // 4. ENFORCE SOLO PARTY (Hanya Nia / Actor 1), DEFAULT SKILLS, & WAKTU MALAM
    // ========================================================================
    if (typeof DataManager !== 'undefined') {
        var _DataManager_setupNewGame = DataManager.setupNewGame;
        DataManager.setupNewGame = function() {
            _DataManager_setupNewGame.call(this);
            if ($dataSystem && $dataSystem.startMapId === 5) {
                $gameParty._actors = [1];
                $gamePlayer.refresh();
            }
            var nia = $gameActors ? $gameActors.actor(1) : null;
            if (nia) {
                if (!nia.hasSkill(10)) nia.learnSkill(10); // Spark (ID 10)
                if (!nia.hasSkill(8)) nia.learnSkill(8);   // Heal (ID 8)
                if (typeof nia.equipPethogsSkill === 'function') {
                    nia.equipPethogsSkill(0, 10);
                    nia.equipPethogsSkill(1, 8);
                } else if (typeof nia.pethogsEquippedSkills === 'function') {
                    var eq = nia.pethogsEquippedSkills();
                    eq[0] = 10;
                    eq[1] = 8;
                }
            }
            if ($gameVariables) {
                $gameVariables.setValue(10, 22); // Variable 10 = Jam 22
            }
            if ($gameSwitches) {
                $gameSwitches.setValue(26, true); // Switch 26 = Night Switch
            }
            if ($gameSystem && $gameSystem._time_data) {
                $gameSystem._time_data[1] = 3; // Fase 3 = Malam
            }
        };

        // ========================================================================
        // 5. RUNTIME INJECTION: Pastikan Enemy 6 & Troop 5 selalu ada di memori
        // ========================================================================
        var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
        DataManager.isDatabaseLoaded = function() {
            if (!_DataManager_isDatabaseLoaded.call(this)) return false;

            if ($dataEnemies && !$dataEnemies[6]) {
                $dataEnemies[6] = {
                    id: 6,
                    actions: [{ conditionParam1: 0, conditionParam2: 0, conditionType: 0, rating: 5, skillId: 1 }],
                    battlerHue: 0,
                    battlerName: "Behemoth",
                    dropItems: [
                        { dataId: 1, denominator: 1, kind: 1 },
                        { dataId: 1, denominator: 1, kind: 0 },
                        { dataId: 1, denominator: 1, kind: 0 }
                    ],
                    exp: 120,
                    traits: [
                        { code: 22, dataId: 0, value: 0.95 },
                        { code: 22, dataId: 1, value: 0.05 },
                        { code: 31, dataId: 1, value: 0 }
                    ],
                    gold: 150,
                    name: "Shadow Beast",
                    note: "<boss_aura: smoke>\n<aura_color: #6600cc>",
                    params: [800, 100, 28, 8, 15, 12, 18, 15]
                };
            }

            if ($dataTroops && !$dataTroops[5]) {
                $dataTroops[5] = {
                    id: 5,
                    members: [{ enemyId: 6, x: 615, y: 444, hidden: false }],
                    name: "Tutorial",
                    pages: []
                };
            }
            return true;
        };
    }
})();
