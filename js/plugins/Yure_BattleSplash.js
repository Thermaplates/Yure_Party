//=============================================================================
// Yure_BattleSplash.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Menampilkan Splash Screen beranimasi di awal pertempuran.
 * @author Yure Party Team
 *
 * @param splash_image
 * @text Splash Image
 * @desc Gambar yang akan ditampilkan (Simpan di img/pictures/). Biarkan kosong jika tidak ingin.
 * @dir img/pictures/
 * @type file
 * @default
 *
 * @param splash_video
 * @text Splash Video
 * @desc Nama file video (tanpa ekstensi .webm). Simpan di folder movies/. (Prioritas di atas Splash Image).
 * @default
 *
 * @param anim_style
 * @text Animation Style
 * @desc Gaya animasi gambar splash. (0: Fade In/Out, 1: Slide Kiri ke Kanan, 2: Zoom In Ledakan)
 * @type select
 * @option Fade In/Out
 * @value 0
 * @option Slide L-R
 * @value 1
 * @option Zoom In
 * @value 2
 * @default 1
 *
 * @param duration
 * @text Duration (Frames)
 * @desc Lama splash screen bertahan di layar (60 frames = 1 detik).
 * @type number
 * @default 90
 *
 * @help
 * ============================================================================
 * Yure Battle Splash Screen
 * ============================================================================
 * Plugin ini mem-pause pertarungan sejenak di awal untuk menampilkan
 * animasi Splash Screen (Misalnya "BATTLE START!" atau gambar lainnya).
 * Sangat cocok untuk memberikan nuansa premium sebelum UI muncul.
 * 
 * Pengaturan Animasi:
 * 0: Fade - Gambar muncul dari transparan ke solid, lalu hilang.
 * 1: Slide - Gambar meluncur cepat dari kiri, diam sejenak, lalu meluncur ke kanan.
 * 2: Zoom - Gambar membesar dari kecil, lalu menghilang ke depan layar.
 */

(function() {
    var parameters = PluginManager.parameters('Yure_BattleSplash');
    var splashImage = String(parameters['splash_image'] || '');
    var splashVideo = String(parameters['splash_video'] || '');
    var animStyle = Number(parameters['anim_style'] || 1);
    var splashDuration = Number(parameters['duration'] || 90);

    //=============================================================================
    // Sprite_BattleSplash
    //=============================================================================
    function Sprite_BattleSplash() {
        this.initialize.apply(this, arguments);
    }
    
    Sprite_BattleSplash.prototype = Object.create(Sprite.prototype);
    Sprite_BattleSplash.prototype.constructor = Sprite_BattleSplash;
    
    Sprite_BattleSplash.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = splashImage ? ImageManager.loadPicture(splashImage) : new Bitmap(1,1);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.x = Graphics.boxWidth / 2;
        this.y = Graphics.boxHeight / 2;
        this.z = 100;
        this.opacity = 0;
        this._timer = 0;
        this._maxTimer = splashDuration;
        this._style = animStyle;
    };
    
    Sprite_BattleSplash.prototype.start = function() {
        this._timer = this._maxTimer;
        // Setup initial position based on style
        if (this._style === 1) { // Slide
            this.x = -Graphics.boxWidth / 2;
            this.opacity = 255;
        } else if (this._style === 2) { // Zoom
            this.scale.x = 0.1;
            this.scale.y = 0.1;
            this.opacity = 0;
        } else { // Fade
            this.opacity = 0;
        }
    };
    
    Sprite_BattleSplash.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._timer > 0) {
            this._timer--;
            var progress = 1 - (this._timer / this._maxTimer);
            
            // Animasi masuk (1/3 durasi awal)
            if (progress < 0.3) {
                var inProg = progress / 0.3;
                if (this._style === 1) { // Slide In
                    this.x = -Graphics.boxWidth/2 + (Graphics.boxWidth * inProg);
                } else if (this._style === 2) { // Zoom In
                    this.scale.x = 0.1 + (0.9 * inProg);
                    this.scale.y = 0.1 + (0.9 * inProg);
                    this.opacity = 255 * inProg;
                } else { // Fade In
                    this.opacity = 255 * inProg;
                }
            }
            // Animasi diam (Di tengah)
            else if (progress >= 0.3 && progress < 0.8) {
                if (this._style === 1) {
                    this.x = Graphics.boxWidth / 2;
                }
                this.opacity = 255;
            }
            // Animasi keluar (Akhir durasi)
            else {
                var outProg = (progress - 0.8) / 0.2;
                if (this._style === 1) { // Slide Out
                    this.x = Graphics.boxWidth/2 + (Graphics.boxWidth * outProg);
                } else if (this._style === 2) { // Zoom Out (Membesar & Hilang)
                    this.scale.x = 1.0 + (1.0 * outProg);
                    this.scale.y = 1.0 + (1.0 * outProg);
                    this.opacity = 255 - (255 * outProg);
                } else { // Fade Out
                    this.opacity = 255 - (255 * outProg);
                }
            }
        }
    };

    Sprite_BattleSplash.prototype.isPlaying = function() {
        return this._timer > 0;
    };

    //=============================================================================
    // Scene_Battle
    //=============================================================================
    var _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
    Scene_Battle.prototype.createDisplayObjects = function() {
        _Scene_Battle_createDisplayObjects.call(this);
        
        // Buat sprite splash dan taruh paling atas
        this._yureSplashSprite = new Sprite_BattleSplash();
        this.addChild(this._yureSplashSprite);
    };

    var _Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        _Scene_Battle_start.call(this);
        if (splashVideo) {
            Graphics.playVideo('movies/' + splashVideo + '.webm');
            this._yureVideoSplashActive = true;
            this.hideYureHud();
        }
        else if (splashImage) {
            this._yureSplashSprite.start();
            this._yureSplashActive = true;
            this.hideYureHud();
        }
    };

    Scene_Battle.prototype.hideYureHud = function() {
        if (this._windowLayer) this._windowLayer.visible = false;
        if (this._pethogsStatusWindow) this._pethogsStatusWindow.visible = false;
        if (this._pethogsSkillSlots) this._pethogsSkillSlots.visible = false;
    };

    Scene_Battle.prototype.showYureHud = function() {
        if (this._windowLayer) this._windowLayer.visible = true;
        if (this._pethogsStatusWindow) this._pethogsStatusWindow.visible = true;
        if (this._pethogsSkillSlots) this._pethogsSkillSlots.visible = true;
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        // Blokir jika video splash sedang diputar
        if (this._yureVideoSplashActive) {
            if (!Graphics.isVideoPlaying()) {
                this._yureVideoSplashActive = false;
                this.showYureHud();
            } else {
                return; // BLOCKED! Tunggu video selesai
            }
        }

        // Jika animasi splash gambar masih berjalan, HENTIKAN proses battle utama
        if (this._yureSplashActive) {
            var active = this.isActive();
            $gameScreen.update();
            this._yureSplashSprite.update();
            Scene_Base.prototype.update.call(this);
            
            // Jika timer habis, kembalikan HUD dan biarkan battle dimulai
            if (!this._yureSplashSprite.isPlaying()) {
                this._yureSplashActive = false;
                this.showYureHud();
            }
            return; // BLOCKED!
        }
        
        _Scene_Battle_update.call(this);
    };

})();
