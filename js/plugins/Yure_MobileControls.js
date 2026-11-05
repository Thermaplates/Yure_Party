//=============================================================================
// Yure_MobileControls.js
//=============================================================================

/*:
 * @plugindesc [v1.0] Kontroler Virtual Mobile Otomatis (D-Pad & Tombol Aksi) dengan Deteksi Perangkat HP / PC Pintar.
 * @author Yure Party Team
 *
 * @param Auto Detect Device
 * @desc Otomatis hanya tampil jika dibuka di HP / Layar Sentuh Mobile (di PC otomatis tersembunyi).
 * @type boolean
 * @default true
 *
 * @param Button Opacity
 * @desc Tingkat transparansi tombol di layar HP (0.1 - 1.0).
 * @type number
 * @decimals 2
 * @min 0.1
 * @max 1.0
 * @default 0.75
 *
 * @param Enable Haptic
 * @desc Aktifkan getaran halus (Haptic Feedback) saat tombol disentuh di HP.
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * YURE MOBILE CONTROLS (SMART DEVICE-AWARE VIRTUAL GAMEPAD)
 * ============================================================================
 * Plugin ini secara otomatis mendeteksi perangkat pemain:
 * 1. Di PC / Laptop:
 *    - Tombol virtual 100% tidak ditampilkan, layar game bersih total.
 * 2. Di HP / Smartphone / Tablet:
 *    - Tombol virtual otomatis muncul di layar:
 *      * Sisi Kiri: D-Pad 4-Arah halus (Mendukung Tap & Slide pergerakan).
 *      * Sisi Kanan: Tombol A (OK/Aksi), B (Batal/Lari), X (Menu/Jurnal),
 *        RUN (Dash), F (Lentera), dan TAB (Jual Mbah Karso).
 *      * Pojok Atas: Tombol toggle [🎮] untuk menyembunyikan/menampilkan tombol.
 * ============================================================================
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Yure_MobileControls');
    var autoDetect = (parameters['Auto Detect Device'] !== 'false');
    var defaultOpacity = Number(parameters['Button Opacity'] || 0.75);
    var enableHaptic = (parameters['Enable Haptic'] !== 'false');

    // ------------------------------------------------------------------------
    // 1. DETEKSI PERANGKAT PINTAR (Mobile vs Desktop)
    // ------------------------------------------------------------------------
    function isMobileDevice() {
        if (!autoDetect) return true;
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

    // ------------------------------------------------------------------------
    // 2. PEMBUATAN UI VIRTUAL CONTROLLER
    // ------------------------------------------------------------------------
    var MobileController = {
        _container: null,
        _dpad: null,
        _actionGroup: null,
        _activeDir: null,
        _visible: true,

        init: function() {
            if (!isMobileDevice()) {
                console.log('[Yure_MobileControls] Perangkat terdeteksi: PC / Desktop. Tombol virtual mobile dinonaktifkan.');
                return;
            }

            console.log('[Yure_MobileControls] Perangkat terdeteksi: HP / Mobile. Mengaktifkan tombol virtual sentuh.');
            this.createStyle();
            this.createElements();
            this.bindEvents();
        },

        createStyle: function() {
            var css = `
                #yure-mobile-layer {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 9999;
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-select: none;
                    -webkit-touch-callout: none;
                    font-family: GameFont, sans-serif, system-ui;
                    transition: opacity 0.25s ease;
                }
                .yure-touch-btn {
                    position: absolute;
                    pointer-events: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    box-sizing: border-box;
                    font-weight: bold;
                    color: #ffffff;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                    transform: scale(1.0);
                    transition: transform 0.08s ease, filter 0.08s ease, background-color 0.08s ease;
                    touch-action: none;
                }
                .yure-touch-btn:active, .yure-touch-btn.active {
                    transform: scale(0.90) !important;
                    filter: brightness(1.35) !important;
                }

                /* D-PAD STYLING */
                #yure-dpad-box {
                    position: absolute;
                    bottom: 24px;
                    left: 24px;
                    width: 170px;
                    height: 170px;
                    pointer-events: auto;
                    touch-action: none;
                }
                .yure-dpad-center {
                    position: absolute;
                    top: 55px; left: 55px; width: 60px; height: 60px;
                    background: rgba(22, 26, 38, ${defaultOpacity});
                    border-radius: 12px;
                    border: 2px solid rgba(217, 180, 130, 0.4);
                }
                .yure-dpad-arrow {
                    position: absolute;
                    background: rgba(30, 36, 52, ${defaultOpacity});
                    border: 2px solid rgba(217, 180, 130, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fef3c7;
                    font-size: 20px;
                    font-weight: bold;
                    touch-action: none;
                    transition: background 0.08s, transform 0.08s;
                }
                .yure-dpad-arrow.active {
                    background: rgba(217, 119, 6, 0.85) !important;
                    color: #ffffff !important;
                    transform: scale(0.94);
                }
                #yure-btn-up {
                    top: 0; left: 55px; width: 60px; height: 58px;
                    border-radius: 16px 16px 4px 4px;
                }
                #yure-btn-down {
                    bottom: 0; left: 55px; width: 60px; height: 58px;
                    border-radius: 4px 4px 16px 16px;
                }
                #yure-btn-left {
                    top: 55px; left: 0; width: 58px; height: 60px;
                    border-radius: 16px 4px 4px 16px;
                }
                #yure-btn-right {
                    top: 55px; right: 0; width: 58px; height: 60px;
                    border-radius: 4px 16px 16px 4px;
                }

                /* ACTION BUTTONS STYLING */
                #yure-action-box {
                    position: absolute;
                    bottom: 24px;
                    right: 24px;
                    width: 200px;
                    height: 200px;
                    pointer-events: none;
                }
                #yure-btn-a {
                    right: 20px; bottom: 65px; width: 68px; height: 68px;
                    background: rgba(16, 185, 129, ${defaultOpacity});
                    border: 2px solid #34d399;
                    font-size: 22px;
                }
                #yure-btn-b {
                    right: 95px; bottom: 15px; width: 64px; height: 64px;
                    background: rgba(239, 68, 68, ${defaultOpacity});
                    border: 2px solid #f87171;
                    font-size: 20px;
                }
                #yure-btn-x {
                    right: 95px; bottom: 115px; width: 58px; height: 58px;
                    background: rgba(245, 158, 11, ${defaultOpacity});
                    border: 2px solid #fbbf24;
                    font-size: 18px;
                }
                #yure-btn-shift {
                    right: 15px; bottom: 145px; width: 52px; height: 52px;
                    background: rgba(99, 102, 241, ${defaultOpacity});
                    border: 2px solid #818cf8;
                    font-size: 14px;
                }
                #yure-btn-f {
                    right: 165px; bottom: 65px; width: 50px; height: 50px;
                    background: rgba(217, 119, 6, ${defaultOpacity});
                    border: 2px solid #f59e0b;
                    font-size: 15px;
                }

                /* TOGGLE VISIBILITY BUTTON */
                #yure-btn-toggle {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 40px;
                    height: 40px;
                    background: rgba(30, 41, 59, 0.7);
                    border: 1.5px solid rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                    font-size: 18px;
                    color: #e2e8f0;
                }
            `;
            var styleEl = document.createElement('style');
            styleEl.innerHTML = css;
            document.head.appendChild(styleEl);
        },

        createElements: function() {
            var layer = document.createElement('div');
            layer.id = 'yure-mobile-layer';

            // D-Pad
            layer.innerHTML = `
                <div id="yure-dpad-box">
                    <div class="yure-dpad-center"></div>
                    <div id="yure-btn-up" class="yure-dpad-arrow">▲</div>
                    <div id="yure-btn-down" class="yure-dpad-arrow">▼</div>
                    <div id="yure-btn-left" class="yure-dpad-arrow">◄</div>
                    <div id="yure-btn-right" class="yure-dpad-arrow">►</div>
                </div>

                <div id="yure-action-box">
                    <div id="yure-btn-a" class="yure-touch-btn" data-key="ok">A</div>
                    <div id="yure-btn-b" class="yure-touch-btn" data-key="cancel">B</div>
                    <div id="yure-btn-x" class="yure-touch-btn" data-key="menu">MENU</div>
                    <div id="yure-btn-shift" class="yure-touch-btn" data-key="shift">RUN</div>
                    <div id="yure-btn-f" class="yure-touch-btn" data-key="yureLightToggle">🏮</div>
                </div>

                <div id="yure-btn-toggle" class="yure-touch-btn" title="Toggle Tombol Virtual">🎮</div>
            `;

            document.body.appendChild(layer);
            this._container = layer;
            this._dpad = document.getElementById('yure-dpad-box');
            this._actionGroup = document.getElementById('yure-action-box');
        },

        vibrate: function() {
            if (enableHaptic && navigator.vibrate) {
                try { navigator.vibrate(12); } catch (e) {}
            }
        },

        pressKey: function(keyName) {
            if (typeof Input !== 'undefined') {
                Input._currentState[keyName] = true;
            }
        },

        releaseKey: function(keyName) {
            if (typeof Input !== 'undefined') {
                Input._currentState[keyName] = false;
            }
        },

        bindEvents: function() {
            var self = this;

            // 1. D-PAD Touch / Slide Tracking
            var arrows = {
                up: document.getElementById('yure-btn-up'),
                down: document.getElementById('yure-btn-down'),
                left: document.getElementById('yure-btn-left'),
                right: document.getElementById('yure-btn-right')
            };

            function handleDpadTouch(e) {
                e.preventDefault();
                var touch = e.targetTouches[0];
                if (!touch) return;

                var rect = self._dpad.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;

                var dx = touch.clientX - cx;
                var dy = touch.clientY - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);

                // Deadzone di tengah agar bisa diam
                if (dist < 18) {
                    self.clearDpad();
                    return;
                }

                var angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 s/d 180
                var newDir = null;

                if (angle >= -45 && angle <= 45) {
                    newDir = 'right';
                } else if (angle > 45 && angle < 135) {
                    newDir = 'down';
                } else if (angle >= 135 || angle <= -135) {
                    newDir = 'left';
                } else if (angle >= -135 && angle < -45) {
                    newDir = 'up';
                }

                if (self._activeDir !== newDir) {
                    self.clearDpad();
                    if (newDir) {
                        self._activeDir = newDir;
                        self.pressKey(newDir);
                        if (arrows[newDir]) arrows[newDir].classList.add('active');
                        self.vibrate();
                    }
                }
            }

            this._dpad.addEventListener('touchstart', handleDpadTouch, { passive: false });
            this._dpad.addEventListener('touchmove', handleDpadTouch, { passive: false });
            this._dpad.addEventListener('touchend', function(e) {
                e.preventDefault();
                self.clearDpad();
            }, { passive: false });
            this._dpad.addEventListener('touchcancel', function(e) {
                e.preventDefault();
                self.clearDpad();
            }, { passive: false });

            // 2. Action Buttons Touch Tracking
            var actionButtons = document.querySelectorAll('.yure-touch-btn[data-key]');
            actionButtons.forEach(function(btn) {
                var key = btn.getAttribute('data-key');

                btn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    btn.classList.add('active');
                    self.pressKey(key);
                    self.vibrate();
                }, { passive: false });

                btn.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    btn.classList.remove('active');
                    self.releaseKey(key);
                }, { passive: false });

                btn.addEventListener('touchcancel', function(e) {
                    e.preventDefault();
                    btn.classList.remove('active');
                    self.releaseKey(key);
                }, { passive: false });
            });

            // 3. Toggle Visibility Button
            var toggleBtn = document.getElementById('yure-btn-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    self._visible = !self._visible;
                    self._dpad.style.display = self._visible ? 'block' : 'none';
                    self._actionGroup.style.display = self._visible ? 'block' : 'none';
                    toggleBtn.style.opacity = self._visible ? '0.7' : '0.35';
                    self.vibrate();
                });
            }
        },

        clearDpad: function() {
            ['up', 'down', 'left', 'right'].forEach(function(d) {
                this.releaseKey(d);
                var el = document.getElementById('yure-btn-' + d);
                if (el) el.classList.remove('active');
            }.bind(this));
            this._activeDir = null;
        }
    };

    // Jalankan setelah seluruh DOM dan scene siap
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        MobileController.init();
    };

})();

