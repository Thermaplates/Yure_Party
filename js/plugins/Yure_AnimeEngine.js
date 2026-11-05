//=============================================================================
// Yure_AnimeEngine.js
//=============================================================================
/*:
 * @plugindesc [v1.0] Anime.js Universal Animation Engine & RPG Maker Motion Bridge.
 * @author Yure Party Team & Antigravity
 *
 * @param Auto Cleanup On Scene Change
 * @desc Otomatis hentikan animasi anime.js saat berganti scene agar aman dari memory leak.
 * @type boolean
 * @default true
 *
 * @param Enable Global Shortcut
 * @desc Mengekspos window.anime dan window.Yure.Anime secara global untuk seluruh plugin.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * ■ Yure Party - Anime.js Core Engine & RPG Maker Motion Bridge (v1.0)
 * ============================================================================
 * Plugin ini mengintegrasikan Anime.js (v3.2.2) ke dalam arsitektur RPG Maker MV.
 * Memberikan akses ke kurva easing modern (elastic, spring, cubic-bezier),
 * sistem staggering (delay berantai bergelombang), dan timeline animasi.
 *
 * ----------------------------------------------------------------------------
 * FITUR UTAMA:
 * ----------------------------------------------------------------------------
 * 1. Global Anime Engine:
 *    Fungsi anime() dapat dipanggil di mana saja (Plugin, Event Script Call, Console).
 *
 * 2. Helper Praktis Yure.Anime:
 *    - Yure.Anime.popIn(target, options)
 *    - Yure.Anime.popOut(target, options)
 *    - Yure.Anime.staggerSlideIn(targetsArray, options)
 *    - Yure.Anime.pulse(target, options)
 *    - Yure.Anime.float(target, options)
 *    - Yure.Anime.stop(target)
 *
 * 3. Safe Scene Lifecycle:
 *    Animasi aktif pada sprite/window scene otomatis dibersihkan saat scene ditutup
 *    sehingga bebas dari memory leak atau error texture yang sudah dibuang.
 * ============================================================================
 */

var Imported = Imported || {};
Imported.Yure_AnimeEngine = true;

var Yure = Yure || {};

(function() {
    "use strict";

    var parameters = PluginManager.parameters('Yure_AnimeEngine');
    var autoCleanup = String(parameters['Auto Cleanup On Scene Change'] || 'true') === 'true';

    // Pastikan namespace Yure.Anime tersedia
    Yure.Anime = Yure.Anime || {};
    Yure.Anime.autoCleanup = autoCleanup;
    Yure.Anime.version = '1.0.0';

    // -------------------------------------------------------------------------
    // Fallback Loader (Jika file belum sempat dimuat di index.html)
    // -------------------------------------------------------------------------
    if (typeof window.anime === 'undefined') {
        if (typeof require === 'function') {
            try {
                var path = require('path');
                var fs = require('fs');
                var base = path.dirname(process.mainModule.filename);
                var libPath = path.join(base, 'js', 'libs', 'anime.min.js');
                if (fs.existsSync(libPath)) {
                    var code = fs.readFileSync(libPath, 'utf8');
                    var fn = new Function(code);
                    fn.call(window);
                }
            } catch (e) {
                console.warn('[Yure_AnimeEngine] Node require fallback failed:', e);
            }
        }
    }

    if (typeof window.anime !== 'undefined') {
        console.log('%c[Yure_AnimeEngine]%c Anime.js Engine Ready (v' + (window.anime.version || '3.x') + ')', 
            'background: #38bdf8; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 3px;', 
            'color: #38bdf8; font-weight: bold;');
    } else {
        console.warn('[Yure_AnimeEngine] Anime.js library is not yet loaded into window.');
    }

    // -------------------------------------------------------------------------
    // Helper Methods untuk RPG Maker Sprites / Windows
    // -------------------------------------------------------------------------

    /**
     * Menghentikan animasi anime.js yang sedang berjalan pada target
     * @param {Object|Array} targets 
     */
    Yure.Anime.stop = function(targets) {
        if (typeof window.anime !== 'undefined' && window.anime.remove) {
            window.anime.remove(targets);
        }
    };

    /**
     * Animasi Pop-In (Elastic/Spring Zoom Masuk)
     * Cocok untuk Window dialog, pop-up notifikasi, modal, atau kartu karakter.
     */
    Yure.Anime.popIn = function(target, options) {
        if (!target || typeof window.anime === 'undefined') return null;
        options = options || {};
        var duration = options.duration !== undefined ? options.duration : 650;
        var delay = options.delay || 0;
        var fromScale = options.fromScale !== undefined ? options.fromScale : 0.82;
        var easing = options.easing || 'easeOutElastic(1, .75)';

        if (target.scale) {
            target.scale.x = fromScale;
            target.scale.y = fromScale;
        }
        target.alpha = 0;
        target.visible = true;

        var animProps = {
            targets: target.scale ? [target, target.scale] : target,
            alpha: 1,
            duration: duration,
            delay: delay,
            easing: easing,
            complete: options.onComplete
        };

        if (target.scale) {
            return window.anime({
                targets: target,
                alpha: 1,
                duration: Math.min(duration, 300),
                delay: delay,
                easing: 'easeOutQuad'
            }), window.anime({
                targets: target.scale,
                x: 1.0,
                y: 1.0,
                duration: duration,
                delay: delay,
                easing: easing,
                complete: options.onComplete
            });
        }

        return window.anime(animProps);
    };

    /**
     * Animasi Pop-Out (Mengecil & Menghilang)
     */
    Yure.Anime.popOut = function(target, options) {
        if (!target || typeof window.anime === 'undefined') return null;
        options = options || {};
        var duration = options.duration !== undefined ? options.duration : 280;
        var toScale = options.toScale !== undefined ? options.toScale : 0.85;

        if (target.scale) {
            window.anime({
                targets: target.scale,
                x: toScale,
                y: toScale,
                duration: duration,
                easing: 'easeInQuad'
            });
        }

        return window.anime({
            targets: target,
            alpha: 0,
            duration: duration,
            easing: 'easeInQuad',
            complete: function() {
                target.visible = false;
                if (options.onComplete) options.onComplete();
            }
        });
    };

    /**
     * Animasi Staggered Slide In (Efek Berantai Berurutan)
     * Cocok untuk daftar tombol perintah menu, item inventory, atau list skill.
     * @param {Array} targetsArray Daftar sprite atau objek tombol
     */
    Yure.Anime.staggerSlideIn = function(targetsArray, options) {
        if (!targetsArray || targetsArray.length === 0 || typeof window.anime === 'undefined') return null;
        options = options || {};
        var distance = options.distance !== undefined ? options.distance : 40;
        var direction = options.direction || 'x'; // 'x' atau 'y'
        var duration = options.duration || 600;
        var staggerStep = options.stagger !== undefined ? options.stagger : 45;
        var easing = options.easing || 'easeOutElastic(1, .8)';

        targetsArray.forEach(function(item) {
            if (!item) return;
            item._animeOrigPos = item._animeOrigPos || { x: item.x, y: item.y };
            item[direction] = item._animeOrigPos[direction] + distance;
            item.alpha = 0;
            item.visible = true;
        });

        return window.anime({
            targets: targetsArray,
            [direction]: function(el) {
                return el._animeOrigPos ? el._animeOrigPos[direction] : el[direction];
            },
            alpha: 1,
            delay: window.anime.stagger(staggerStep, { start: options.startDelay || 0 }),
            duration: duration,
            easing: easing,
            complete: options.onComplete
        });
    };

    /**
     * Animasi Pulse / Rubber-Band
     * Efek empuk saat tombol dipilih atau kursor berpindah
     */
    Yure.Anime.pulse = function(target, options) {
        if (!target || !target.scale || typeof window.anime === 'undefined') return null;
        options = options || {};
        var maxScale = options.maxScale || 1.12;

        return window.anime({
            targets: target.scale,
            x: [
                { value: maxScale, duration: 140, easing: 'easeOutQuad' },
                { value: 1.0, duration: 260, easing: 'easeOutElastic(1, .6)' }
            ],
            y: [
                { value: maxScale, duration: 140, easing: 'easeOutQuad' },
                { value: 1.0, duration: 260, easing: 'easeOutElastic(1, .6)' }
            ]
        });
    };

    /**
     * Animasi Melayang Halus / Bernapas (Looping Smooth Float)
     */
    Yure.Anime.float = function(target, options) {
        if (!target || typeof window.anime === 'undefined') return null;
        options = options || {};
        var dist = options.distance || 8;
        var duration = options.duration || 2200;
        var startY = target.y;

        return window.anime({
            targets: target,
            y: [startY - dist, startY + dist],
            duration: duration,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });
    };

    // -------------------------------------------------------------------------
    // Otomatisasi Lifecycle Cleanup saat Scene Berpindah
    // -------------------------------------------------------------------------
    var _Scene_Base_terminate = Scene_Base.prototype.terminate;
    Scene_Base.prototype.terminate = function() {
        if (Yure.Anime.autoCleanup && typeof window.anime !== 'undefined' && window.anime.remove) {
            // Hentikan semua animasi aktif pada elemen scene
            if (this.children && Array.isArray(this.children)) {
                this.children.forEach(function(child) {
                    if (child) {
                        window.anime.remove(child);
                        if (child.scale) window.anime.remove(child.scale);
                        if (child.children && Array.isArray(child.children)) {
                            child.children.forEach(function(sub) {
                                if (sub) {
                                    window.anime.remove(sub);
                                    if (sub.scale) window.anime.remove(sub.scale);
                                }
                            });
                        }
                    }
                });
            }
        }
        _Scene_Base_terminate.call(this);
    };

})();
