//=============================================================================
// Yure_CustomCursor.js
//=============================================================================
/*:
 * @plugindesc [v1.0] High-Performance Hardware Custom Cursor System with Dynamic States (Default, Pointer, Click) & Retro Sparkle Feedback.
 * @author Lead Drain Production
 *
 * @param Default Cursor
 * @text Default Cursor Image
 * @desc Path to default cursor image relative to project root.
 * @default img/system/cursor.png
 *
 * @param Default Hotspot X
 * @text Default Hotspot X
 * @desc X coordinate of default cursor click point (hotspot).
 * @default 0
 *
 * @param Default Hotspot Y
 * @text Default Hotspot Y
 * @desc Y coordinate of default cursor click point (hotspot).
 * @default 0
 *
 * @param Pointer Cursor
 * @text Pointer Cursor Image
 * @desc Path to pointer/hover cursor image relative to project root.
 * @default img/system/cursor_pointer.png
 *
 * @param Pointer Hotspot X
 * @text Pointer Hotspot X
 * @desc X coordinate of pointer cursor click point (hotspot).
 * @default 5
 *
 * @param Pointer Hotspot Y
 * @text Pointer Hotspot Y
 * @desc Y coordinate of pointer cursor click point (hotspot).
 * @default 1
 *
 * @param Click Cursor
 * @text Click Cursor Image
 * @desc Path to pressed/click cursor image relative to project root.
 * @default img/system/cursor_click.png
 *
 * @param Click Hotspot X
 * @text Click Hotspot X
 * @desc X coordinate of click cursor click point (hotspot).
 * @default 1
 *
 * @param Click Hotspot Y
 * @text Click Hotspot Y
 * @desc Y coordinate of click cursor click point (hotspot).
 * @default 1
 *
 * @param Enable Click Sparkles
 * @text Enable Click Sparkles
 * @type boolean
 * @desc Show cute retro pixel sparkles bursting from cursor on click.
 * @default true
 *
 * @param Sparkle Color
 * @text Sparkle Color
 * @desc Primary color of click sparkles in hex.
 * @default #42f5e9
 *
 * @param Auto Hide Delay
 * @text Auto Hide Delay (sec)
 * @type number
 * @desc Seconds of inactivity before cursor hides (0 to disable).
 * @default 3
 *
 * @param Enable Window Hover
 * @text Enable Window Hover
 * @type boolean
 * @desc Change cursor to pointer when hovering over active selectable items & buttons.
 * @default true
 *
 * @help
 * ============================================================================
 * YURE PARTY - HIGH-PERFORMANCE HARDWARE CUSTOM CURSOR
 * ============================================================================
 * Plugin ini mengimplementasikan kursor kustom berbasis CSS Hardware Acceleration
 * (Zero-Lag / 0ms delay) yang mulus di 60Hz/144Hz+ monitor.
 *
 * Fitur Utama:
 * 1. ZERO-LAG HARDWARE CURSOR:
 *    Menggunakan kursor bawaan GPU/OS via CSS native, bebas dari jeda 1 frame
 *    render loop WebGL.
 *
 * 2. TIGA STATUS DINAMIS (DYNAMIC STATES):
 *    - Default (cursor.png): Panah retro obsidian & cream dengan spirit star.
 *    - Pointer (cursor_pointer.png): Sarung tangan putih retro bergelang cyan
 *      yang muncul saat hover di atas tombol, item menu, tab jurnal, dsb.
 *    - Click (cursor_click.png): Efek panah tertekan tactile instan.
 *
 * 3. RETRO PIXEL SPARKLE FEEDBACK:
 *    Percikan bintang retro piksel imut meletup saat pemain mengklik layar.
 *
 * 4. AUTO-HIDE ON INACTIVITY:
 *    Kursor otomatis hilang setelah 3 detik hening atau saat pemain menggunakan
 *    tombol keyboard/gamepad, dan langsung muncul kembali begitu mouse digerakkan.
 *
 * ============================================================================
 */

(function() {
    'use strict';

    var PLUGIN_NAME = 'Yure_CustomCursor';
    var rawParams = PluginManager.parameters(PLUGIN_NAME) || {};

    var Config = {
        defaultCursor: String(rawParams['Default Cursor'] || 'img/system/cursor.png'),
        defaultHotspotX: Number(rawParams['Default Hotspot X'] !== undefined ? rawParams['Default Hotspot X'] : 0),
        defaultHotspotY: Number(rawParams['Default Hotspot Y'] !== undefined ? rawParams['Default Hotspot Y'] : 0),

        pointerCursor: String(rawParams['Pointer Cursor'] || 'img/system/cursor_pointer.png'),
        pointerHotspotX: Number(rawParams['Pointer Hotspot X'] !== undefined ? rawParams['Pointer Hotspot X'] : 5),
        pointerHotspotY: Number(rawParams['Pointer Hotspot Y'] !== undefined ? rawParams['Pointer Hotspot Y'] : 1),

        clickCursor: String(rawParams['Click Cursor'] || 'img/system/cursor_click.png'),
        clickHotspotX: Number(rawParams['Click Hotspot X'] !== undefined ? rawParams['Click Hotspot X'] : 1),
        clickHotspotY: Number(rawParams['Click Hotspot Y'] !== undefined ? rawParams['Click Hotspot Y'] : 1),

        enableSparkles: String(rawParams['Enable Click Sparkles'] || 'true') === 'true',
        sparkleColor: String(rawParams['Sparkle Color'] || '#42f5e9'),
        autoHideDelay: Number(rawParams['Auto Hide Delay'] !== undefined ? rawParams['Auto Hide Delay'] : 3),
        enableWindowHover: String(rawParams['Enable Window Hover'] || 'true') === 'true'
    };

    //=============================================================================
    // CSS Hardware Cursor Injection
    //=============================================================================
    function injectCursorStyles() {
        if (document.getElementById('yure-custom-cursor-style')) return;

        var style = document.createElement('style');
        style.id = 'yure-custom-cursor-style';

        var defUrl = Config.defaultCursor;
        var defHX  = Config.defaultHotspotX;
        var defHY  = Config.defaultHotspotY;

        var ptrUrl = Config.pointerCursor;
        var ptrHX  = Config.pointerHotspotX;
        var ptrHY  = Config.pointerHotspotY;

        var clkUrl = Config.clickCursor;
        var clkHX  = Config.clickHotspotX;
        var clkHY  = Config.clickHotspotY;

        style.innerHTML = [
            '/* Default Custom Hardware Cursor */',
            'html, body, canvas, #GameCanvas, #UpperCanvas, div, img {',
            '    cursor: url("' + defUrl + '") ' + defHX + ' ' + defHY + ', auto !important;',
            '}',
            '',
            '/* Pointer / Hover State */',
            'body.yure-cursor-pointer,',
            'body.yure-cursor-pointer canvas,',
            'body.yure-cursor-pointer #GameCanvas,',
            'body.yure-cursor-pointer #UpperCanvas,',
            'body.yure-cursor-pointer div,',
            'body.yure-cursor-pointer button,',
            'body.yure-cursor-pointer a {',
            '    cursor: url("' + ptrUrl + '") ' + ptrHX + ' ' + ptrHY + ', pointer !important;',
            '}',
            '',
            '/* Click / Pressed State */',
            'body.yure-cursor-click,',
            'body.yure-cursor-click canvas,',
            'body.yure-cursor-click #GameCanvas,',
            'body.yure-cursor-click #UpperCanvas,',
            'body.yure-cursor-click div,',
            'body.yure-cursor-click button,',
            'body.yure-cursor-click a {',
            '    cursor: url("' + clkUrl + '") ' + clkHX + ' ' + clkHY + ', auto !important;',
            '}',
            '',
            '/* Inactivity / Controller Auto-Hide */',
            'body.yure-cursor-hidden,',
            'body.yure-cursor-hidden * {',
            '    cursor: none !important;',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCursorStyles);
    } else {
        injectCursorStyles();
    }

    //=============================================================================
    // Live Mouse Coordinates Tracker
    //=============================================================================
    var _liveMouseX = -9999;
    var _liveMouseY = -9999;
    var _mouseInWindow = false;

    //=============================================================================
    // YureCursor State Manager
    //=============================================================================
    window.YureCursor = {
        _currentState: 'default',
        _pointerRequested: false,
        _isMouseDown: false,
        _isHidden: false,
        _lastMoveTime: Date.now(),

        get liveX() { return _liveMouseX; },
        get liveY() { return _liveMouseY; },
        get isMouseInWindow() { return _mouseInWindow; },

        requestPointer: function() {
            this._pointerRequested = true;
        },

        onMouseMove: function() {
            this._lastMoveTime = Date.now();
            if (this._isHidden) {
                this._isHidden = false;
                document.body.classList.remove('yure-cursor-hidden');
            }
        },

        onMouseDown: function() {
            this._isMouseDown = true;
            this.onMouseMove();
            this.updateDOM();
        },

        onMouseUp: function() {
            this._isMouseDown = false;
            this.updateDOM();
        },

        update: function() {
            // Check Auto-Hide Timer on inactivity
            if (Config.autoHideDelay > 0 && !this._isHidden) {
                var elapsed = (Date.now() - this._lastMoveTime) / 1000;
                if (elapsed >= Config.autoHideDelay) {
                    this._isHidden = true;
                    document.body.classList.add('yure-cursor-hidden');
                }
            }

            // Auto-hide when player uses keyboard / gamepad
            if (Input._latestButton && !this._isHidden) {
                var btn = Input._latestButton;
                if (btn === 'ok' || btn === 'cancel' || btn === 'up' || btn === 'down' || btn === 'left' || btn === 'right') {
                    if (Date.now() - this._lastMoveTime > 600) {
                        this._isHidden = true;
                        document.body.classList.add('yure-cursor-hidden');
                    }
                }
            }

            this.updateDOM();
            this._pointerRequested = false;
        },

        updateDOM: function() {
            var desiredState = 'default';
            if (this._isMouseDown) {
                desiredState = 'click';
            } else if (this._pointerRequested) {
                desiredState = 'pointer';
            }

            if (this._currentState !== desiredState) {
                this._currentState = desiredState;
                if (desiredState === 'click') {
                    document.body.classList.remove('yure-cursor-pointer');
                    document.body.classList.add('yure-cursor-click');
                } else if (desiredState === 'pointer') {
                    document.body.classList.remove('yure-cursor-click');
                    document.body.classList.add('yure-cursor-pointer');
                } else {
                    document.body.classList.remove('yure-cursor-pointer');
                    document.body.classList.remove('yure-cursor-click');
                }
            }
        }
    };

    // Global Window Event Listeners
    window.addEventListener('mousemove', function(e) {
        _mouseInWindow = true;
        if (Graphics && Graphics.pageToCanvasX) {
            _liveMouseX = Graphics.pageToCanvasX(e.pageX);
            _liveMouseY = Graphics.pageToCanvasY(e.pageY);
        } else {
            _liveMouseX = e.clientX;
            _liveMouseY = e.clientY;
        }
        YureCursor.onMouseMove();
    }, { passive: true });

    window.addEventListener('mouseleave', function() {
        _mouseInWindow = false;
        _liveMouseX = -9999;
        _liveMouseY = -9999;
        YureCursor._isMouseDown = false;
        YureCursor.updateDOM();
    });

    window.addEventListener('mousedown', function(e) {
        if (e.button === 0) {
            YureCursor.onMouseDown();
        }
    }, { passive: true });

    window.addEventListener('mouseup', function(e) {
        if (e.button === 0) {
            YureCursor.onMouseUp();
        }
    }, { passive: true });

    window.addEventListener('blur', function() {
        _mouseInWindow = false;
        YureCursor._isMouseDown = false;
        YureCursor.updateDOM();
    });

    //=============================================================================
    // Retro Sparkle Particle Feedback Layer
    //=============================================================================
    function Particle(x, y, color) {
        this.x = x;
        this.y = y;
        var angle = Math.random() * Math.PI * 2;
        var speed = 1.2 + Math.random() * 2.8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 0;
        this.maxLife = 12 + Math.floor(Math.random() * 6);
        this.size = 2 + Math.floor(Math.random() * 3);
        this.color = (Math.random() < 0.35) ? '#ffffff' : color;
    }

    function CursorSparkleLayer() {
        this.particles = [];
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'YureCursorSparkles';
        this.canvas.style.position = 'fixed';
        this.canvas.style.left = '0px';
        this.canvas.style.top = '0px';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999999';
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        var self = this;
        window.addEventListener('resize', function() {
            self.resize();
        });

        document.body.appendChild(this.canvas);
    }

    CursorSparkleLayer.prototype.resize = function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    };

    CursorSparkleLayer.prototype.spawnBurst = function(screenX, screenY) {
        var count = 6 + Math.floor(Math.random() * 4);
        for (var i = 0; i < count; i++) {
            this.particles.push(new Particle(screenX, screenY, Config.sparkleColor));
        }
    };

    CursorSparkleLayer.prototype.update = function() {
        if (this.particles.length === 0) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var i = this.particles.length - 1; i >= 0; i--) {
            var p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life++;

            var progress = p.life / p.maxLife;
            var alpha = 1.0 - progress;
            var curSize = Math.max(1, p.size * (1.0 - progress * 0.4));

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;

            // Draw crisp retro pixel plus / diamond sparkle
            var h = curSize;
            this.ctx.fillRect(Math.round(p.x - h), Math.round(p.y), h * 2 + 1, 1);
            this.ctx.fillRect(Math.round(p.x), Math.round(p.y - h), 1, h * 2 + 1);

            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1);
            }
        }
        this.ctx.globalAlpha = 1.0;
    };

    var sparkleLayer = null;
    if (Config.enableSparkles) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                sparkleLayer = new CursorSparkleLayer();
            });
        } else {
            sparkleLayer = new CursorSparkleLayer();
        }

        window.addEventListener('mousedown', function(e) {
            if (sparkleLayer && e.button === 0) {
                sparkleLayer.spawnBurst(e.clientX, e.clientY);
            }
        }, { passive: true });
    }

    //=============================================================================
    // Engine Main Loop Hook
    //=============================================================================
    var _SceneManager_updateMain = SceneManager.updateMain;
    SceneManager.updateMain = function() {
        _SceneManager_updateMain.call(this);
        YureCursor.update();
        if (sparkleLayer) {
            sparkleLayer.update();
        }
    };

    //=============================================================================
    // Hover Interactivity Hooks
    //=============================================================================
    if (Config.enableWindowHover) {
        // Window_Selectable: Hover detection over active selectable items
        var _Window_Selectable_update = Window_Selectable.prototype.update;
        Window_Selectable.prototype.update = function() {
            _Window_Selectable_update.call(this);
            if (this.isOpenAndActive && this.isOpenAndActive() && this.visible) {
                if (_liveMouseX >= 0 && _liveMouseY >= 0) {
                    var lx = this.canvasToLocalX(_liveMouseX);
                    var ly = this.canvasToLocalY(_liveMouseY);
                    if (lx >= 0 && ly >= 0 && lx < this.width && ly < this.height) {
                        if (typeof this.hitTest === 'function' && this.hitTest(lx, ly) >= 0) {
                            YureCursor.requestPointer();
                        }
                    }
                }
            }
        };

        // Sprite_Button: Hover detection over clickable buttons
        if (typeof Sprite_Button !== 'undefined') {
            var _Sprite_Button_update = Sprite_Button.prototype.update;
            Sprite_Button.prototype.update = function() {
                _Sprite_Button_update.call(this);
                if (this.visible && this.worldVisible && _liveMouseX >= 0 && _liveMouseY >= 0) {
                    var x = this.canvasToLocalX ? this.canvasToLocalX(_liveMouseX) : (_liveMouseX - this.x);
                    var y = this.canvasToLocalY ? this.canvasToLocalY(_liveMouseY) : (_liveMouseY - this.y);
                    var w = this.width;
                    var h = this.height;
                    var ax = this.anchor ? this.anchor.x : 0;
                    var ay = this.anchor ? this.anchor.y : 0;
                    if (x >= -ax * w && x < (1 - ax) * w && y >= -ay * h && y < (1 - ay) * h) {
                        YureCursor.requestPointer();
                    }
                }
            };
        }

        // Dynamic Scene Integrations (Scene_StatusJournal & Scene_KarsoShop)
        var _checkCurrentSceneHover = function() {
            if (!SceneManager._scene) return;
            var scene = SceneManager._scene;
            // Journal tabs/ribbons hover
            if (scene._journalTabHoverIndex !== undefined && scene._journalTabHoverIndex >= 0) {
                YureCursor.requestPointer();
            }
            // KarsoShop hanging lantern hover
            if (scene.constructor && scene.constructor.name === 'Scene_KarsoShop') {
                if (_liveMouseX >= 1160 && _liveMouseY >= 130 && _liveMouseY <= 320) {
                    YureCursor.requestPointer();
                }
            }
        };

        var _oldUpdate = YureCursor.update;
        YureCursor.update = function() {
            _checkCurrentSceneHover();
            _oldUpdate.call(this);
        };
    }

})();
