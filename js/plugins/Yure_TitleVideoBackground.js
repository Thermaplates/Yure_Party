//=============================================================================
// Yure_TitleVideoBackground.js
//=============================================================================

/*:
 * @plugindesc [v2.1] Latar Belakang Video Multi-Resolusi Title Screen + Penghapus Siluet / Ghosting Saat Transisi Opsi & Menu.
 * @author Antigravity (for Yure Party)
 *
 * @param video_file
 * @text Nama File Video
 * @desc Nama file video di dalam folder movies/ (bisa dengan atau tanpa ekstensi .webm/.mp4). Contoh: titlevideo, Battle, bg.webm
 * @default titlevideo
 *
 * @param scaling_mode
 * @text Mode Skala Resolusi
 * @desc Cara video menyesuaikan layar 1280x720:
 * cover   = Penuh tanpa bilah hitam (potong tepi proporsional)
 * contain = Pertahankan rasio asli (dengan letterbox sinematik)
 * stretch = Rentangkan langsung ke batas layar
 * @type select
 * @option cover
 * @value cover
 * @option contain
 * @value contain
 * @option stretch
 * @value stretch
 * @default cover
 *
 * @param video_opacity
 * @text Opasitas Video (0-255)
 * @desc Tingkat transparansi video (255 = solid penuh, 180 = sedikit tembus pandang).
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @param dark_overlay_opacity
 * @text Kontras Gelap / Overlay (0-255)
 * @desc Lapisan hitam transparan di atas video agar teks tombol menu lebih kontras dan mudah dibaca (0 = tanpa overlay).
 * @type number
 * @min 0
 * @max 255
 * @default 30
 *
 * @param playback_rate
 * @text Kecepatan Putar
 * @desc Kecepatan putar video (1.0 = normal, 0.75 = gerak lambat sinematik / slow-motion, 1.25 = cepat).
 * @type number
 * @decimals 2
 * @min 0.25
 * @max 3.00
 * @default 1.00
 *
 * @param mute_audio
 * @text Bisukan Suara Video
 * @desc Jika true, suara video dimatikan agar musik BGM Title tetap bermain dominan tanpa benturan audio.
 * @type boolean
 * @on Bisukan (Rekomendasi)
 * @off Mainkan Suara Video
 * @default true
 *
 * @param video_volume
 * @text Volume Video (0-100)
 * @desc Tingkat kekerasan suara video jika opsi 'Bisukan Suara Video' disetel ke false.
 * @type number
 * @min 0
 * @max 100
 * @default 80
 *
 * @param loop_video
 * @text Putar Berulang (Loop)
 * @desc Mengulang video terus-menerus tanpa henti saat berada di Menu Utama.
 * @type boolean
 * @on Ya (Loop)
 * @off Tidak (Sekali Putar)
 * @default true
 *
 * @help
 * ============================================================================
 * YURE PARTY — ADAPTIVE TITLE VIDEO BACKGROUND ENGINE (v2.1)
 * ============================================================================
 * Fitur Utama Versi 2.1:
 * 1. HIGH-PERFORMANCE DIRECT BLIT RENDERING (60 FPS GPU Blit).
 * 2. MULTI-RESOLUTION AUTO-COVER (1024x576, 1080p, 4K, 4:3, 21:9).
 * 3. ZERO-GHOSTING & SILHOUETTE ELIMINATOR:
 *    - Menghilangkan siluet tombol/judul saat masuk ke menu Opsi/Galeri/Save.
 *    - Menghilangkan kedipan foto statis dan jeda hitam saat kembali ke Menu Utama.
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_TitleVideoBackground') || {};
    var rawVideoFile = String(parameters['video_file'] || 'titlevideo').trim();
    var scalingMode = String(parameters['scaling_mode'] || 'cover').trim().toLowerCase();
    var videoOpacity = Number(parameters['video_opacity'] !== undefined ? parameters['video_opacity'] : 255);
    var overlayOpacity = Number(parameters['dark_overlay_opacity'] !== undefined ? parameters['dark_overlay_opacity'] : 30);
    var playbackRate = parseFloat(parameters['playback_rate']) || 1.0;
    var muteAudio = String(parameters['mute_audio'] || 'true').toLowerCase() === 'true';
    var videoVolume = Number(parameters['video_volume'] !== undefined ? parameters['video_volume'] : 80);
    var loopVideo = String(parameters['loop_video'] || 'true').toLowerCase() === 'true';

    // Shared persistent video cache agar video tetap berputar tanpa jeda saat membuka sub-menu
    var _persistentVideoEl = null;
    var _persistentVideoSrc = null;

    function resolveVideoPath(filename) {
        if (!filename) return '';
        var baseDir = 'movies/';
        var clean = filename.replace(/^movies[\/\\]/, '').replace(/\.(webm|mp4|ogg)$/i, '').toLowerCase();

        try {
            if (typeof require === 'function') {
                var fs = require('fs');
                var path = require('path');
                var base = path.dirname(process.mainModule.filename);
                var moviesDir = path.join(base, 'movies');
                if (fs.existsSync(moviesDir)) {
                    var files = fs.readdirSync(moviesDir);
                    for (var i = 0; i < files.length; i++) {
                        var f = files[i];
                        var fClean = f.replace(/\.(webm|mp4|ogg)$/i, '').toLowerCase();
                        if (fClean === clean && f.toLowerCase().endsWith('.webm')) {
                            return 'movies/' + f;
                        }
                    }
                    for (var j = 0; j < files.length; j++) {
                        var f2 = files[j];
                        var f2Clean = f2.replace(/\.(webm|mp4|ogg)$/i, '').toLowerCase();
                        if (f2Clean === clean) {
                            return 'movies/' + f2;
                        }
                    }
                    if (fs.existsSync(path.join(moviesDir, 'Battle.webm'))) {
                        return 'movies/Battle.webm';
                    }
                }
            }
        } catch (e) {
            console.warn('[Yure_TitleVideo] resolve error:', e);
        }

        return baseDir + clean + '.webm';
    }

    function getOrCreateVideo(src) {
        if (_persistentVideoEl && _persistentVideoSrc === src) {
            if (_persistentVideoEl.paused) {
                _persistentVideoEl.play().catch(function() {});
            }
            return _persistentVideoEl;
        }

        if (_persistentVideoEl) {
            try {
                _persistentVideoEl.pause();
                _persistentVideoEl.removeAttribute('src');
                _persistentVideoEl.load();
                if (_persistentVideoEl.parentNode) {
                    _persistentVideoEl.parentNode.removeChild(_persistentVideoEl);
                }
            } catch (e) {}
            _persistentVideoEl = null;
        }

        var video = document.createElement('video');
        video.id = 'yureTitleBgVideo';
        video.src = src;
        video.loop = loopVideo;
        video.muted = muteAudio;
        if (!muteAudio) {
            video.volume = Math.max(0, Math.min(100, videoVolume)) / 100;
        }
        video.playbackRate = Math.max(0.25, Math.min(3.0, playbackRate));
        video.crossOrigin = 'anonymous';
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.preload = 'auto';

        // Taruh di DOM agar Chromium tidak menunda rendering frame
        video.style.position = 'fixed';
        video.style.left = '0px';
        video.style.top = '0px';
        video.style.width = '2px';
        video.style.height = '2px';
        video.style.opacity = '0.01';
        video.style.pointerEvents = 'none';
        video.style.zIndex = '-9999';
        document.body.appendChild(video);

        video.play().catch(function() {});

        _persistentVideoEl = video;
        _persistentVideoSrc = src;
        return video;
    }

    function disposePersistentVideo() {
        if (_persistentVideoEl) {
            try {
                _persistentVideoEl.pause();
                _persistentVideoEl.removeAttribute('src');
                _persistentVideoEl.load();
                if (_persistentVideoEl.parentNode) {
                    _persistentVideoEl.parentNode.removeChild(_persistentVideoEl);
                }
            } catch (e) {}
            _persistentVideoEl = null;
            _persistentVideoSrc = null;
        }
    }

    // ========================================================================
    // SPRITE_TITLEVIDEOBACKGROUND
    // ========================================================================
    function Sprite_TitleVideoBackground() {
        this.initialize.apply(this, arguments);
    }

    Sprite_TitleVideoBackground.prototype = Object.create(Sprite.prototype);
    Sprite_TitleVideoBackground.prototype.constructor = Sprite_TitleVideoBackground;

    Sprite_TitleVideoBackground.prototype.initialize = function(videoSrc) {
        Sprite.prototype.initialize.call(this);

        this._videoSrc = videoSrc;
        this._scalingMode = scalingMode;
        this._targetOpacity = Math.max(0, Math.min(255, videoOpacity));
        this._hasError = false;

        var screenW = Graphics.boxWidth || 1280;
        var screenH = Graphics.boxHeight || 720;
        this.bitmap = new Bitmap(screenW, screenH);
        this.opacity = this._targetOpacity;

        this._videoElement = getOrCreateVideo(this._videoSrc);

        // Jika video sudah memiliki frame, gambar langsung di frame 0 tanpa jeda
        this.renderVideoFrame();
    };

    Sprite_TitleVideoBackground.prototype.renderVideoFrame = function() {
        var video = this._videoElement;
        if (!video || !this.bitmap) return;

        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
            var ctx = this.bitmap._context;
            if (!ctx) return;

            var screenW = this.bitmap.width;
            var screenH = this.bitmap.height;
            var vw = video.videoWidth;
            var vh = video.videoHeight;

            var scaleX = screenW / vw;
            var scaleY = screenH / vh;

            if (this._scalingMode === 'cover') {
                var scale = Math.max(scaleX, scaleY);
                var drawW = vw * scale;
                var drawH = vh * scale;
                var drawX = (screenW - drawW) / 2;
                var drawY = (screenH - drawH) / 2;
                ctx.drawImage(video, drawX, drawY, drawW, drawH);
            } else if (this._scalingMode === 'contain') {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, screenW, screenH);
                var scale = Math.min(scaleX, scaleY);
                var drawW = vw * scale;
                var drawH = vh * scale;
                var drawX = (screenW - drawW) / 2;
                var drawY = (screenH - drawH) / 2;
                ctx.drawImage(video, drawX, drawY, drawW, drawH);
            } else {
                ctx.drawImage(video, 0, 0, screenW, screenH);
            }

            if (overlayOpacity > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, ' + (overlayOpacity / 255) + ')';
                ctx.fillRect(0, 0, screenW, screenH);
            }

            this.bitmap._setDirty();
        }
    };

    Sprite_TitleVideoBackground.prototype.update = function() {
        Sprite.prototype.update.call(this);

        if (this._hasError || !this._videoElement) return;

        var video = this._videoElement;
        if (video.paused && !video.ended) {
            video.play().catch(function() {});
        }

        this.renderVideoFrame();
    };

    // ========================================================================
    // 1. PENGHAPUS SILUET (CLEAN BACKGROUND SNAPSHOT)
    // ========================================================================
    // Saat membuka menu Opsi, Galeri, atau Save dari Title Screen,
    // sembunyikan tombol dan judul sebelum mengambil screenshot latar belakang
    // sehingga di dalam sub-menu TIDAK ADA siluet teks/tombol yang berbayang.
    var _SceneManager_snapForBackground = SceneManager.snapForBackground;
    SceneManager.snapForBackground = function() {
        if (this._scene instanceof Scene_Title) {
            var title = this._scene;
            var hiddenSprites = [];

            var candidates = [
                title._commandWindow,
                title._gameTitleSprite,
                title._titleWatermarkSprite,
                title._cursor,
                title._subPic,
                title._cartoonCircleSprite
            ];
            if (title._com_sprites && Array.isArray(title._com_sprites)) {
                candidates = candidates.concat(title._com_sprites);
            }

            candidates.forEach(function(spr) {
                if (spr && spr.visible) {
                    spr.visible = false;
                    hiddenSprites.push(spr);
                }
            });

            _SceneManager_snapForBackground.call(this);

            hiddenSprites.forEach(function(spr) {
                spr.visible = true;
            });
            return;
        }

        _SceneManager_snapForBackground.call(this);
    };

    // ========================================================================
    // 2. DETEKSI KEMBALI DARI SUBMENU & ZERO-FLICKER
    // ========================================================================
    var _isReturningFromSubmenu = false;

    var _SceneManager_goto = SceneManager.goto;
    SceneManager.goto = function(sceneClass) {
        if (sceneClass === Scene_Title && SceneManager._scene) {
            var prev = SceneManager._scene.constructor;
            var isSubmenu = (prev === Scene_Options || prev === Scene_File || 
                            (typeof Scene_MyGallery !== 'undefined' && prev === Scene_MyGallery));
            if (isSubmenu) {
                _isReturningFromSubmenu = true;
                // Bersihkan buffer background lama
                if (SceneManager._backgroundBitmap) {
                    SceneManager._backgroundBitmap = null;
                }
            }
        }
        _SceneManager_goto.call(this, sceneClass);
    };

    var _Scene_Title_createBackground = Scene_Title.prototype.createBackground;
    Scene_Title.prototype.createBackground = function() {
        _Scene_Title_createBackground.call(this);

        // HILANGKAN foto statis bawaan agar tidak berkedip sepersekian detik!
        if (this._backSprite1) {
            this._backSprite1.visible = false;
            this._backSprite1.opacity = 0;
        }
        if (this._backSprite2) {
            this._backSprite2.visible = false;
            this._backSprite2.opacity = 0;
        }

        var videoPath = resolveVideoPath(rawVideoFile);
        if (videoPath) {
            this._titleVideoBg = new Sprite_TitleVideoBackground(videoPath);
            this.addChild(this._titleVideoBg);
        }
    };

    var _Scene_Title_start = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        _Scene_Title_start.call(this);

        // Jika kembali dari Opsi/Galeri/Save:
        // Matikan fade-in hitam 30 frame RPG Maker yang menyebabkan jeda/siluet
        if (_isReturningFromSubmenu) {
            _isReturningFromSubmenu = false;
            if (this._fadeSprite) {
                this._fadeSprite.opacity = 0;
                this._fadeSprite.visible = false;
                this._fadeDuration = 0;
            }
        }
    };

    var _Scene_Title_terminate = Scene_Title.prototype.terminate;
    Scene_Title.prototype.terminate = function() {
        _Scene_Title_terminate.call(this);

        // Hanya hancurkan video jika pemain benar-benar masuk ke permainan (Scene_Map / New Game / Load)
        var next = SceneManager._nextScene ? SceneManager._nextScene.constructor : null;
        var isEnteringGame = (next === Scene_Map || next === Scene_Battle);
        if (isEnteringGame) {
            disposePersistentVideo();
        }

        if (this._titleVideoBg) {
            this._titleVideoBg = null;
        }
    };

    console.log('[Yure_TitleVideoBackground] Engine v2.1 (Anti-Silhouette & Seamless Submenu Transition) aktif.');

})();
