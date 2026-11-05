//=============================================================================
// Custom_VideoLoading.js
//=============================================================================
/*:
 * @plugindesc Menampilkan Fake Loading Screen dengan Video WebM di kanan bawah setelah Splash Screen.
 * @author Custom Build
 * 
 * @help
 * Syarat:
 * 1. Letakkan video bernama "Loading.webm" di dalam folder "movies/"
 * 2. Aktifkan plugin ini di Plugin Manager.
 * 
 * Alur Kerja:
 * Game Boot -> Splash Screen (CustomLogo/MadeWithMv) -> Fake Loading Screen (5 detik) -> Title Screen.
 */

function Scene_FakeLoading() {
    this.initialize.apply(this, arguments);
}

(function() {
    
    // ========================================================================
    // REDIREKSI KE FAKE LOADING
    // ========================================================================
    var _SceneManager_goto = SceneManager.goto;
    var hasRunFakeLoading = false;

    // Membajak SceneManager untuk mengarahkan ke Fake Loading sebelum masuk Title Screen pertama kali
    SceneManager.goto = function(sceneClass) {
        if (sceneClass === Scene_Title && !hasRunFakeLoading) {
            hasRunFakeLoading = true;
            _SceneManager_goto.call(this, Scene_FakeLoading);
            return;
        }
        _SceneManager_goto.call(this, sceneClass);
    };

    // ========================================================================
    // SCENE FAKE LOADING
    // ========================================================================
    Scene_FakeLoading.prototype = Object.create(Scene_Base.prototype);
    Scene_FakeLoading.prototype.constructor = Scene_FakeLoading;

    Scene_FakeLoading.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._duration = 300; // 5 detik pada 60 fps
    };

    Scene_FakeLoading.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createVideo();
    };

    Scene_FakeLoading.prototype.createBackground = function() {
        // Membuat latar belakang hitam pekat
        this._background = new Sprite();
        this._background.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this._background.bitmap.fillAll('black');
        this.addChild(this._background);
    };

    Scene_FakeLoading.prototype.createVideo = function() {
        this._videoEl = document.createElement('video');
        this._videoEl.id = 'fakeLoadingVideo';
        this._videoEl.src = 'movies/Loading.webm';
        this._videoEl.loop = true;
        this._videoEl.muted = true; // Wajib muted agar autoplay diizinkan browser
        this._videoEl.setAttribute('playsinline', '');
        this._videoEl.setAttribute('webkit-playsinline', '');
        this._videoEl.preload = 'auto';

        // CSS Styling untuk menaruh video di sudut kanan bawah
        this._videoEl.style.position = 'absolute';
        this._videoEl.style.bottom = '30px';
        this._videoEl.style.right = '30px';
        this._videoEl.style.width = '200px'; // Lebar video loading kustom
        this._videoEl.style.height = 'auto';
        this._videoEl.style.zIndex = '9999';
        this._videoEl.style.pointerEvents = 'none';
        this._videoEl.style.opacity = '0';
        this._videoEl.style.transition = 'opacity 0.4s ease';

        document.body.appendChild(this._videoEl);
    };

    Scene_FakeLoading.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.startFadeIn(this.fadeSpeed(), false);
        if (this._videoEl) {
            // Animasi fade-in video sesaat setelah scene dimulai
            setTimeout(function() {
                if (this._videoEl) this._videoEl.style.opacity = '1';
            }.bind(this), 100);
            
            this._videoEl.play().catch(function(e) {
                console.log("Autoplay video tertahan oleh browser/sistem operasi:", e);
            });
        }
    };

    Scene_FakeLoading.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        if (this._duration > 0) {
            this._duration--;
            
            // Animasi fade-out video 24 frame sebelum durasi habis
            if (this._duration === 24) {
                if (this._videoEl) this._videoEl.style.opacity = '0';
            }
            
            if (this._duration === 0) {
                this.gotoTitle();
            }
        }
    };

    Scene_FakeLoading.prototype.gotoTitle = function() {
        if (this._videoEl) {
            this._videoEl.pause();
        }
        Scene_Title._fromFakeLoading = true;
        SceneManager.goto(Scene_Title);
    };

    Scene_FakeLoading.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        // Hapus elemen video dari DOM agar tidak memakan memori di scene berikutnya
        if (this._videoEl) {
            if (this._videoEl.parentNode) {
                this._videoEl.parentNode.removeChild(this._videoEl);
            }
            this._videoEl = null;
        }
    };

})();
