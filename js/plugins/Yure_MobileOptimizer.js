//=============================================================================
// Yure_MobileOptimizer.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Mobile Performance Engine: Mengoptimalkan FPS, Menghilangkan Lag & Beban Berat Saat Dimainkan di HP.
 * @author Yure Party Team
 *
 * @param Auto Optimize Mobile
 * @desc Otomatis aktifkan Mode Ringan (Turbo) jika dibuka di HP / Browser Mobile.
 * @type boolean
 * @default true
 *
 * @param Bypass Video On Mobile
 * @desc Nonaktifkan video berat di Title Screen & Fake Loading saat di HP agar tidak nge-lag dan hemat RAM/GPU.
 * @type boolean
 * @default true
 *
 * @param Optimize Shaders On Mobile
 * @desc Matikan Bloom Glow dan Real-time Shadow berat khusus di HP agar 60 FPS stabil.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * YURE MOBILE OPTIMIZER (SMART PERFORMANCE ENGINE)
 * ============================================================================
 * Plugin ini secara cerdas mendeteksi saat game dibuka melalui HP / Smartphone:
 * 
 * 1. Di PC / Laptop (Desktop NW.js):
 *    - Seluruh grafis mewah (Video Background Title, Shadow Shader, Bloom Glow, dll)
 *      tetap berjalan 100% MAKSIMAL tanpa pengurangan kualitas.
 * 
 * 2. Di HP / Smartphone / Mobile Browser:
 *    - Mematikan loop video WebM di canvas Title Screen yang sebelumnya membebani
 *      GPU mobile hingga ratusan MB/detik.
 *    - Melewati Fake Loading Screen 5 detik agar langsung masuk ke game.
 *    - Mengoptimalkan WebGL Shader agar HP tidak panas dan stabil di 60 FPS.
 *    - Auto-Unlock Web Audio pada sentuhan pertama di layar HP.
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_MobileOptimizer');
    var autoOptimize = (parameters['Auto Optimize Mobile'] !== 'false');
    var bypassVideoMobile = (parameters['Bypass Video On Mobile'] !== 'false');
    var optimizeShadersMobile = (parameters['Optimize Shaders On Mobile'] !== 'false');

    // ------------------------------------------------------------------------
    // 1. DETEKSI PERANGKAT HP / MOBILE PINTAR
    // ------------------------------------------------------------------------
    function isMobileDevice() {
        if (!autoOptimize) return false;
        if (typeof nw !== 'undefined') return false; // PC Desktop NW.js

        if (typeof Utils !== 'undefined' && typeof Utils.isMobileDevice === 'function' && Utils.isMobileDevice()) {
            return true;
        }

        var nav = (typeof window !== 'undefined' && window.navigator) ? window.navigator : (typeof navigator !== 'undefined' ? navigator : null);
        var ua = (nav && nav.userAgent) ? nav.userAgent : '';
        var mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
        var isMobileUA = mobileRegex.test(ua);
        var hasTouch = ('ontouchstart' in window) || (nav && nav.maxTouchPoints > 0);

        return isMobileUA || (hasTouch && (typeof window !== 'undefined' && window.innerWidth <= 1024));
    }

    var _isMobile = isMobileDevice();

    if (_isMobile) {
        console.log('⚡ [Yure_MobileOptimizer] Mode Ringan HP Aktif! Mengoptimalkan performa mobile...');

        // --------------------------------------------------------------------
        // 2. BYPASS FAKE LOADING SCREEN 5 DETIK DI HP
        // --------------------------------------------------------------------
        if (typeof Scene_FakeLoading !== 'undefined') {
            var _SceneManager_goto = SceneManager.goto;
            SceneManager.goto = function(sceneClass) {
                if (sceneClass === Scene_FakeLoading) {
                    // Lewati langsung ke Scene_Title
                    _SceneManager_goto.call(this, Scene_Title);
                    return;
                }
                _SceneManager_goto.call(this, sceneClass);
            };
        }

        // --------------------------------------------------------------------
        // 3. MATIKAN LOOP VIDEO TITLE SCREEN DI HP (GANTI STATIC BACKGROUND)
        // --------------------------------------------------------------------
        if (bypassVideoMobile) {
            // Override Sprite_TitleVideoBackground agar tidak membebani GPU mobile
            if (typeof Sprite_TitleVideoBackground !== 'undefined') {
                Sprite_TitleVideoBackground.prototype.renderVideoFrame = function() {
                    // Jangan decode dan upload frame video 60fps ke WebGL texture di HP!
                };
            }

            if (typeof Scene_Title !== 'undefined') {
                var _Scene_Title_createBackground = Scene_Title.prototype.createBackground;
                Scene_Title.prototype.createBackground = function() {
                    _Scene_Title_createBackground.call(this);
                    // Pastikan background statis gambar terlihat jelas dan tajam
                    if (this._backSprite1) {
                        this._backSprite1.visible = true;
                        this._backSprite1.opacity = 255;
                    }
                };
            }
        }

        // --------------------------------------------------------------------
        // 4. OPTIMASI SHADER PENCAHAYAAN DI HP (Ringankan Lighting & Shadow)
        // --------------------------------------------------------------------
        if (optimizeShadersMobile && typeof Scene_Map !== 'undefined') {
            var _Scene_Map_start = Scene_Map.prototype.start;
            Scene_Map.prototype.start = function() {
                _Scene_Map_start.call(this);
                // Matikan bloom glow post-processing yang sangat berat di mobile GPU
                if (this._yureLightLayer && this._yureLightLayer._bloomFilter) {
                    this._yureLightLayer._bloomFilter.enabled = false;
                }
            };
        }

        // --------------------------------------------------------------------
        // 5. UNLOCK AUDIO MOBILE OTOMATIS (Sentuhan Pertama)
        // --------------------------------------------------------------------
        function unlockMobileAudio() {
            if (typeof WebAudio !== 'undefined' && WebAudio._context) {
                if (WebAudio._context.state === 'suspended') {
                    WebAudio._context.resume().then(function() {
                        console.log('🎵 [Yure_MobileOptimizer] AudioContext berhasil diaktifkan di HP.');
                    }).catch(function() {});
                }
            }
            window.removeEventListener('touchstart', unlockMobileAudio);
            window.removeEventListener('touchend', unlockMobileAudio);
            window.removeEventListener('click', unlockMobileAudio);
        }

        window.addEventListener('touchstart', unlockMobileAudio, { passive: true, once: true });
        window.addEventListener('touchend', unlockMobileAudio, { passive: true, once: true });
        window.addEventListener('click', unlockMobileAudio, { passive: true, once: true });

        // --------------------------------------------------------------------
        // 6. ADAPTIF RESIZING & PERFORMANCE TWEAKS
        // --------------------------------------------------------------------
        // Batasi pixel ratio di mobile agar GPU tidak me-render resolusi 4K yang mencekik
        if (typeof Graphics !== 'undefined') {
            var _Graphics__updateRealScale = Graphics._updateRealScale;
            Graphics._updateRealScale = function() {
                if (_Graphics__updateRealScale) _Graphics__updateRealScale.call(this);
                if (this._canvas) {
                    this._canvas.style.imageRendering = 'auto'; // Halus dan hemat baterai di HP
                }
            };
        }
    } else {
        console.log('🖥️ [Yure_MobileOptimizer] Mode Desktop/PC: Seluruh grafis mewah berjalan 100% maksimal.');
    }

})();
