/*:
 * @plugindesc [DEV TOOL] Live Plugin Parameter Editor - Tekan F8 untuk membuka editor parameter plugin secara langsung.
 * @author Antigravity Dev Tool
 *
 * @help
 * ============================================================================
 * DEV PLUGIN EDITOR - Live Plugin Parameter Editor
 * ============================================================================
 * Plugin khusus developer untuk mengedit parameter plugin secara langsung
 * saat game sedang berjalan, TANPA perlu menutup RPG Maker MV.
 *
 * CARA PAKAI:
 *   F8  = Buka / Tutup panel editor parameter
 *   F5  = Simpan perubahan ke plugins.js DAN reload game
 *   Ctrl+S (di dalam panel) = Simpan tanpa reload
 *
 * FITUR:
 *   - Menampilkan semua plugin yang aktif beserta parameternya
 *   - Edit nilai secara langsung di text field
 *   - Perubahan berlaku INSTAN pada variabel runtime (Moghunter.xxx, dll)
 *   - Simpan permanen ke js/plugins.js menggunakan Node.js fs
 *   - Filter/cari parameter dengan search box
 *   - Klik nama plugin untuk expand/collapse grupnya
 *
 * CATATAN:
 *   Plugin ini HANYA untuk mode development (playtest dari RPG Maker MV).
 *   Jangan disertakan dalam build final game.
 *
 * ============================================================================
 */

(function() {
    'use strict';

    // Hanya aktif jika berjalan di NW.js (mode development RPG Maker MV)
    var isNWjs = (typeof require !== 'undefined' && typeof process !== 'undefined');
    if (!isNWjs) return;

    var fs   = require('fs');
    var path = require('path');

    // Path menuju plugins.js
    var PLUGINS_JS_PATH = path.join(process.cwd(), 'js', 'plugins.js');

    // =========================================================================
    // State
    // =========================================================================
    var _panelOpen   = false;
    var _panelEl     = null;
    var _overlay     = null;
    var _collapsed   = {};   // { pluginName: true/false }
    var _isDragging  = false;
    var _dragOffsetX = 0;
    var _dragOffsetY = 0;

    // =========================================================================
    // Intercept F8 keydown
    // =========================================================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F8') {
            e.preventDefault();
            togglePanel();
        }
        // Ctrl+S untuk save tanpa reload
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && _panelOpen) {
            e.preventDefault();
            savePluginsJs(false);
        }
    });

    // =========================================================================
    // Toggle Panel
    // =========================================================================
    function togglePanel() {
        if (_panelOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }

    // =========================================================================
    // Open Panel
    // =========================================================================
    function openPanel() {
        if (_panelOpen) return;
        _panelOpen = true;

        // Overlay semi-transparan (bisa diklik tembus)
        _overlay = document.createElement('div');
        _overlay.id = 'dev-plugin-editor-overlay';
        _overlay.style.cssText = [
            'position:fixed', 'top:0', 'left:0', 'width:100vw', 'height:100vh',
            'z-index:99998', 'pointer-events:none'
        ].join(';');
        document.body.appendChild(_overlay);

        // Panel utama
        _panelEl = document.createElement('div');
        _panelEl.id = 'dev-plugin-editor-panel';
        _panelEl.style.cssText = [
            'position:fixed',
            'top:40px', 'right:20px',
            'width:420px',
            'max-height:80vh',
            'background:rgba(15,15,25,0.97)',
            'border:1px solid rgba(120,200,255,0.3)',
            'border-radius:10px',
            'box-shadow:0 8px 40px rgba(0,150,255,0.25), 0 0 0 1px rgba(255,255,255,0.05) inset',
            'font-family:Consolas,monospace',
            'font-size:12px',
            'color:#ddeeff',
            'z-index:99999',
            'display:flex',
            'flex-direction:column',
            'overflow:hidden',
            'pointer-events:all',
            'user-select:none',
        ].join(';');

        // ---- Header ----
        var header = document.createElement('div');
        header.style.cssText = [
            'background:linear-gradient(135deg, rgba(0,100,200,0.6), rgba(0,40,100,0.8))',
            'padding:10px 14px',
            'display:flex',
            'align-items:center',
            'gap:10px',
            'cursor:move',
            'border-bottom:1px solid rgba(120,200,255,0.2)',
            'flex-shrink:0',
        ].join(';');

        var title = document.createElement('span');
        title.textContent = '⚙ Plugin Parameter Editor';
        title.style.cssText = 'font-weight:bold;font-size:13px;color:#88ddff;flex:1;';

        var saveBtn = makeBtn('💾 Simpan', '#1a6030', function() { savePluginsJs(false); });
        var reloadBtn = makeBtn('🔄 Simpan+Reload', '#1a3060', function() { savePluginsJs(true); });
        var closeBtn = makeBtn('✕', '#501010', closePanel);
        closeBtn.title = 'Tutup Panel (F8)';

        header.appendChild(title);
        header.appendChild(saveBtn);
        header.appendChild(reloadBtn);
        header.appendChild(closeBtn);

        // Drag logic
        header.addEventListener('mousedown', function(e) {
            _isDragging  = true;
            _dragOffsetX = e.clientX - _panelEl.getBoundingClientRect().left;
            _dragOffsetY = e.clientY - _panelEl.getBoundingClientRect().top;
            e.preventDefault();
        });
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', function() { _isDragging = false; });

        // ---- Search bar ----
        var searchWrap = document.createElement('div');
        searchWrap.style.cssText = 'padding:8px 12px;flex-shrink:0;border-bottom:1px solid rgba(120,200,255,0.1);';
        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '🔍 Cari parameter...';
        searchInput.style.cssText = [
            'width:100%', 'box-sizing:border-box',
            'background:rgba(255,255,255,0.05)',
            'border:1px solid rgba(120,200,255,0.2)',
            'border-radius:6px',
            'color:#cceeff',
            'padding:5px 10px',
            'font-family:Consolas,monospace',
            'font-size:12px',
            'outline:none',
        ].join(';');
        searchInput.addEventListener('input', function() { filterRows(searchInput.value); });
        searchWrap.appendChild(searchInput);

        // ---- Scrollable body ----
        var body = document.createElement('div');
        body.id = 'dev-plugin-editor-body';
        body.style.cssText = 'overflow-y:auto;flex:1;padding:8px 4px;';

        // ---- Status bar ----
        var statusBar = document.createElement('div');
        statusBar.id = 'dev-plugin-editor-status';
        statusBar.style.cssText = [
            'padding:6px 14px',
            'font-size:11px',
            'color:rgba(150,200,255,0.6)',
            'border-top:1px solid rgba(120,200,255,0.1)',
            'flex-shrink:0',
        ].join(';');
        statusBar.textContent = 'F8 = Tutup | Ctrl+S = Simpan | F5 = Simpan+Reload';

        // Inject hint tentang F5 intercept
        var f5Hint = document.createElement('div');
        f5Hint.style.cssText = 'padding:4px 14px;font-size:10px;color:rgba(255,200,100,0.5);flex-shrink:0;';
        f5Hint.textContent = '⚠ F5 reload game — simpan dulu dengan tombol "Simpan" atau Ctrl+S!';

        _panelEl.appendChild(header);
        _panelEl.appendChild(searchWrap);
        _panelEl.appendChild(body);
        _panelEl.appendChild(f5Hint);
        _panelEl.appendChild(statusBar);

        document.body.appendChild(_panelEl);

        // Build konten plugin
        buildPluginList(body);
    }

    // =========================================================================
    // Build Plugin List
    // =========================================================================
    function buildPluginList(container) {
        container.innerHTML = '';
        var plugins = $plugins.filter(function(p) { return p.status && p.parameters; });

        plugins.forEach(function(plugin) {
            var paramKeys = Object.keys(plugin.parameters);
            if (paramKeys.length === 0) return;

            // --- Plugin Group Header ---
            var groupHeader = document.createElement('div');
            groupHeader.style.cssText = [
                'padding:7px 12px',
                'background:rgba(0,100,200,0.15)',
                'border-left:3px solid rgba(0,150,255,0.5)',
                'margin:2px 4px',
                'border-radius:4px',
                'cursor:pointer',
                'display:flex',
                'align-items:center',
                'gap:6px',
            ].join(';');

            var chevron = document.createElement('span');
            chevron.textContent = _collapsed[plugin.name] ? '▶' : '▼';
            chevron.style.cssText = 'font-size:10px;color:rgba(100,180,255,0.7);transition:transform 0.2s;';

            var pluginLabel = document.createElement('span');
            pluginLabel.textContent = plugin.name;
            pluginLabel.style.cssText = 'font-weight:bold;color:#88ccff;flex:1;font-size:12px;';

            var countLabel = document.createElement('span');
            countLabel.textContent = paramKeys.length + ' params';
            countLabel.style.cssText = 'font-size:10px;color:rgba(150,200,255,0.4);';

            groupHeader.appendChild(chevron);
            groupHeader.appendChild(pluginLabel);
            groupHeader.appendChild(countLabel);

            // --- Params container ---
            var paramsEl = document.createElement('div');
            paramsEl.className = 'dev-plugin-group';
            paramsEl.setAttribute('data-plugin', plugin.name);
            paramsEl.style.cssText = _collapsed[plugin.name] ? 'display:none;' : '';

            paramKeys.forEach(function(key) {
                if (key.startsWith('-') || key.startsWith('=') || key === '') return;
                var val = plugin.parameters[key];
                var row = buildParamRow(plugin, key, val);
                paramsEl.appendChild(row);
            });

            // Toggle collapse
            groupHeader.addEventListener('click', function() {
                _collapsed[plugin.name] = !_collapsed[plugin.name];
                chevron.textContent = _collapsed[plugin.name] ? '▶' : '▼';
                paramsEl.style.display = _collapsed[plugin.name] ? 'none' : '';
            });

            container.appendChild(groupHeader);
            container.appendChild(paramsEl);
        });
    }

    // =========================================================================
    // Build Param Row
    // =========================================================================
    function buildParamRow(plugin, key, val) {
        var row = document.createElement('div');
        row.className = 'dev-param-row';
        row.setAttribute('data-key', key.toLowerCase());
        row.style.cssText = [
            'display:flex', 'align-items:center', 'gap:8px',
            'padding:3px 12px 3px 20px',
            'border-bottom:1px solid rgba(255,255,255,0.03)',
        ].join(';');
        row.addEventListener('mouseenter', function() { row.style.background = 'rgba(0,100,200,0.1)'; });
        row.addEventListener('mouseleave', function() { row.style.background = ''; });

        var keyLabel = document.createElement('label');
        keyLabel.textContent = key;
        keyLabel.title = key;
        keyLabel.style.cssText = [
            'flex:1', 'min-width:0',
            'overflow:hidden', 'text-overflow:ellipsis', 'white-space:nowrap',
            'color:rgba(200,220,255,0.8)', 'font-size:11px', 'cursor:default',
        ].join(';');

        var input = document.createElement('input');
        input.type = 'text';
        input.value = val;
        input.style.cssText = [
            'width:130px', 'background:rgba(255,255,255,0.05)',
            'border:1px solid rgba(100,180,255,0.2)',
            'border-radius:4px', 'color:#fff',
            'padding:3px 7px',
            'font-family:Consolas,monospace', 'font-size:11px',
            'outline:none', 'transition:border-color 0.2s',
        ].join(';');
        input.addEventListener('focus', function() { input.style.borderColor = 'rgba(0,180,255,0.6)'; });
        input.addEventListener('blur',  function() { input.style.borderColor = 'rgba(100,180,255,0.2)'; });

        // Apply change on Enter or blur
        input.addEventListener('change', function() {
            applyParamChange(plugin, key, input.value, row);
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { input.blur(); }
            e.stopPropagation(); // Jangan sampai trigger RPG Maker keyboard handler
        });

        row.appendChild(keyLabel);
        row.appendChild(input);
        return row;
    }

    // =========================================================================
    // Apply Param Change (runtime) - UNIVERSAL
    // =========================================================================
    function applyParamChange(plugin, key, newValue, row) {
        // 1. Update $plugins data (persisted on next save)
        plugin.parameters[key] = newValue;

        // 2. Universal live-update: cari variabel global yang memakai parameter ini
        liveApplyParam(plugin.name, key, newValue);

        // 3. Flash feedback
        flashRow(row, 'rgba(0,200,100,0.3)');
    }

    // =========================================================================
    // Universal Live-Apply: Update semua variabel runtime yang terkait parameter
    // =========================================================================
    function liveApplyParam(pluginName, paramKey, newValue) {
        var numVal  = isNaN(Number(newValue)) ? newValue : Number(newValue);
        var strVal  = String(newValue);

        // --- A. MOG_SceneMenu: hanya update Moghunter.parameters jika plugin ini ---
        // Ini mencegah parameter dengan nama sama (e.g. 'Command Space Y') di plugin
        // lain (MOG_TitlePictureCom) mempengaruhi SceneMenu, atau sebaliknya.
        if (typeof Moghunter !== 'undefined' && pluginName === 'MOG_SceneMenu') {
            if (Moghunter.parameters) {
                Moghunter.parameters[paramKey] = newValue;
            }
            reparseAllMoghunterParams();
        }

        // --- B. MOG_TitlePictureCom / Title screen params ---
        if (typeof Moghunter !== 'undefined') {
            var titleMap = {
                'Command Space X':       'title_commandSpaceX',
                'Command Space Y':       'title_commandSpaceY',
                'Command Base X-Axis':   'title_commandBaseX',
                'Command Base Y-Axis':   'title_commandBaseY',
                'Auto Command Layout':   'title_autoCommandLayout',
                'Base Screen Width':     'title_baseScreenWidth',
                'Base Screen Height':    'title_baseScreenHeight',
                'Auto Scale To Screen':  'title_autoScale',
                'Slide X-Axis':          'title_slideX',
                'Slide Y-Axis':          'title_slideY',
                'Com Fade-In Duration':  'title_fadeIn',
                'Title Sprite X-Axis':   'title_titleX',
                'Title Sprite Y-Axis':   'title_titleY',
                'Cursor X-Axis':         'title_cursorX',
                'Cursor Y-Axis':         'title_cursorY',
                'Cursor Visible':        'title_cursorVisible',
                'Layout Start X':        'title_layoutStartX',
                'Layout Spacing':        'title_layoutSpacing',
                'Commands X-Axis':       'title_commandsX',
                'Commands Y-Axis':       'title_commandsY',
            };
            // Hanya apply title map jika plugin ini adalah MOG_TitlePictureCom
            if (pluginName === 'MOG_TitlePictureCom' && titleMap[paramKey] !== undefined) {
                Moghunter[titleMap[paramKey]] = isNaN(Number(newValue)) ? strVal : numVal;
                // Langsung rebuild posisi tombol jika scene Title sedang aktif
                try {
                    if (SceneManager._scene && SceneManager._scene.rebuildCommandPositions) {
                        SceneManager._scene.rebuildCommandPositions();
                    }
                } catch(e) {}
            }
        }
        
        if (pluginName === 'Custom_SaveStatus_MOG') {
            if (Moghunter && Moghunter.CustomSave && typeof Moghunter.CustomSave.reload === 'function') {
                Moghunter.CustomSave.reload();
            }
        }

        // --- C. YEP (Yanfly) plugins: YEP params biasanya dibaca via PluginManager.parameters ---
        // YEP menyimpan params di variabel lokal masing-masing plugin, tidak mudah diupdate runtime.
        // Yang bisa kita update adalah $gameSystem dan Graphics jika relevan.
        if (pluginName === 'YEP_CoreEngine') {
            if (paramKey === 'Screen Width')  { try { Graphics.boxWidth  = numVal; Graphics._updateCanvas(); } catch(e) {} }
            if (paramKey === 'Screen Height') { try { Graphics.boxHeight = numVal; Graphics._updateCanvas(); } catch(e) {} }
        }
        if (pluginName === 'Community_Basic') {
            if (paramKey === 'screenWidth')  { try { Graphics.boxWidth  = numVal; Graphics._updateCanvas(); } catch(e) {} }
            if (paramKey === 'screenHeight') { try { Graphics.boxHeight = numVal; Graphics._updateCanvas(); } catch(e) {} }
        }

        setStatus('✏ ' + pluginName + '.' + paramKey + ' = ' + newValue, '#aaffcc');
    }

    // =========================================================================
    // Re-parse Moghunter parameter variables (runtime hot-reload)
    // Membaca LANGSUNG dari $plugins['MOG_SceneMenu'].parameters
    // agar tidak bertabrakan dengan plugin lain yang punya param nama sama.
    // =========================================================================
    function reparseAllMoghunterParams() {
        if (typeof Moghunter === 'undefined') return;

        // Cari plugin MOG_SceneMenu spesifik dari $plugins
        var scMenuPlugin = null;
        for (var i = 0; i < $plugins.length; i++) {
            if ($plugins[i].name === 'MOG_SceneMenu') { scMenuPlugin = $plugins[i]; break; }
        }
        // Fallback ke Moghunter.parameters jika tidak ditemukan
        var p = scMenuPlugin ? scMenuPlugin.parameters : Moghunter.parameters;
        if (!p) return;

        // Re-assign semua variabel MOG_SceneMenu jika tersedia
        var props = {
            'scMenu_layoutStatusX':  ['Actor Hud X-Axis',     0],
            'scMenu_layoutStatusY':  ['Actor Hud Y-Axis',     0],
            'scMenu_CharX':          ['Char X-Axis',          20],
            'scMenu_CharY':          ['Char Y-Axis',          0],
            'scMenu_HPMeterX':       ['HP Meter X-Axis',      17],
            'scMenu_HPMeterY':       ['HP Meter Y-Axis',      101],
            'scMenu_MPMeterX':       ['MP Meter X-Axis',      17],
            'scMenu_MPMeterY':       ['MP Meter Y-Axis',      143],
            'scMenu_TPMeterX':       ['TP Meter X-Axis',      17],
            'scMenu_TPMeterY':       ['TP Meter Y-Axis',      187],
            'scMenu_HPMeterScaleX':  ['HP Meter Scale X',     1.0],
            'scMenu_HPMeterScaleY':  ['HP Meter Scale Y',     1.0],
            'scMenu_MPMeterScaleX':  ['MP Meter Scale X',     1.0],
            'scMenu_MPMeterScaleY':  ['MP Meter Scale Y',     1.0],
            'scMenu_TPMeterScaleX':  ['TP Meter Scale X',     1.0],
            'scMenu_TPMeterScaleY':  ['TP Meter Scale Y',     1.0],
            'scMenu_HPNumberX':      ['HP Number X-Axis',     100],
            'scMenu_HPNumberY':      ['HP Number Y-Axis',     73],
            'scMenu_HPNumber2X':     ['HPMax Number X-Axis',  140],
            'scMenu_HPNumber2Y':     ['HPMax Number Y-Axis',  100],
            'scMenu_HPNumberScaleX': ['HP Number Scale X',    1.0],
            'scMenu_HPNumberScaleY': ['HP Number Scale Y',    1.0],
            'scMenu_MPNumberX':      ['MP Number X-Axis',     100],
            'scMenu_MPNumberY':      ['MP Number Y-Axis',     124],
            'scMenu_MPNumber2X':     ['MPMax Number X-Axis',  140],
            'scMenu_MPNumber2Y':     ['MPMax Number Y-Axis',  151],
            'scMenu_MPNumberScaleX': ['MP Number Scale X',    1.0],
            'scMenu_MPNumberScaleY': ['MP Number Scale Y',    1.0],
            'scMenu_TPNumberX':      ['TP Number X-Axis',     100],
            'scMenu_TPNumberY':      ['TP Number Y-Axis',     175],
            'scMenu_TPNumber2X':     ['TPMax Number X-Axis',  140],
            'scMenu_TPNumber2Y':     ['TPMax Number Y-Axis',  210],
            'scMenu_TPNumberScaleX': ['TP Number Scale X',    1.0],
            'scMenu_TPNumberScaleY': ['TP Number Scale Y',    1.0],
            'scMenu_LVNumberX':      ['LV Number X-Axis',     95],
            'scMenu_LVNumberY':      ['LV Number Y-Axis',     33],
            'scMenu_LVNumberScaleX': ['LV Number Scale X',    1.0],
            'scMenu_LVNumberScaleY': ['LV Number Scale Y',    1.0],
            // --- SAVE MENU OVERRIDES ---
            'scMenu_SaveHPMeterX':       ['Save HP Meter X',       17],
            'scMenu_SaveHPMeterY':       ['Save HP Meter Y',       93],
            'scMenu_SaveHPMeterScaleX':  ['Save HP Meter Scale X', 1.0],
            'scMenu_SaveHPMeterScaleY':  ['Save HP Meter Scale Y', 1.0],
            'scMenu_SaveMPMeterX':       ['Save MP Meter X',       17],
            'scMenu_SaveMPMeterY':       ['Save MP Meter Y',       144],
            'scMenu_SaveMPMeterScaleX':  ['Save MP Meter Scale X', 1.0],
            'scMenu_SaveMPMeterScaleY':  ['Save MP Meter Scale Y', 1.0],
            'scMenu_SaveTPMeterX':       ['Save TP Meter X',       17],
            'scMenu_SaveTPMeterY':       ['Save TP Meter Y',       195],
            'scMenu_SaveTPMeterScaleX':  ['Save TP Meter Scale X', 1.0],
            'scMenu_SaveTPMeterScaleY':  ['Save TP Meter Scale Y', 1.0],
            'scMenu_SaveHPNumX':         ['Save HP Num X',         100],
            'scMenu_SaveHPNumY':         ['Save HP Num Y',         73],
            'scMenu_SaveHPMaxNumX':      ['Save HPMax Num X',      140],
            'scMenu_SaveHPMaxNumY':      ['Save HPMax Num Y',      100],
            'scMenu_SaveHPNumScaleX':    ['Save HP Num Scale X',   1.0],
            'scMenu_SaveHPNumScaleY':    ['Save HP Num Scale Y',   1.0],
            'scMenu_SaveMPNumX':         ['Save MP Num X',         100],
            'scMenu_SaveMPNumY':         ['Save MP Num Y',         124],
            'scMenu_SaveMPMaxNumX':      ['Save MPMax Num X',      140],
            'scMenu_SaveMPMaxNumY':      ['Save MPMax Num Y',      151],
            'scMenu_SaveMPNumScaleX':    ['Save MP Num Scale X',   1.0],
            'scMenu_SaveMPNumScaleY':    ['Save MP Num Scale Y',   1.0],
            'scMenu_SaveTPNumX':         ['Save TP Num X',         100],
            'scMenu_SaveTPNumY':         ['Save TP Num Y',         175],
            'scMenu_SaveTPMaxNumX':      ['Save TPMax Num X',      140],
            'scMenu_SaveTPMaxNumY':      ['Save TPMax Num Y',      202],
            'scMenu_SaveTPNumScaleX':    ['Save TP Num Scale X',   1.0],
            'scMenu_SaveTPNumScaleY':    ['Save TP Num Scale Y',   1.0],
            'scMenu_SaveLVNumX':         ['Save LV Num X',         95],
            'scMenu_SaveLVNumY':         ['Save LV Num Y',         33],
            'scMenu_SaveLVNumScaleX':    ['Save LV Num Scale X',   1.0],
            'scMenu_SaveLVNumScaleY':    ['Save LV Num Scale Y',   1.0],
            // --- GOLD, TIME, LOCATION ---
            'scMenu_GoldNumberX':        ['Gold X-Axis',          260],
            'scMenu_GoldNumberY':        ['Gold Y-Axis',          580],
            'scMenu_GoldScaleX':         ['Gold Scale X',         1.0],
            'scMenu_GoldScaleY':         ['Gold Scale Y',         1.0],
            'scMenu_playTimeNumberX':    ['Time X-Axis',          565],
            'scMenu_playTimeNumberY':    ['Time Y-Axis',          60],
            'scMenu_playTimeScaleX':     ['Time Scale X',         1.0],
            'scMenu_playTimeScaleY':     ['Time Scale Y',         1.0],
            'scMenu_playTimeNumberFontSize': ['Time FontSize',    24],
            'scMenu_locationX':          ['Location X-Axis',      450],
            'scMenu_locationY':          ['Location Y-Axis',      575],
            'scMenu_locationScaleX':     ['Location Scale X',     1.0],
            'scMenu_locationScaleY':     ['Location Scale Y',     1.0],
            'scMenu_locationFontSize':   ['Location FontSize',    26],
            'scMenu_EXPVisible':     ['EXP Visible',          'false'],
            'scMenu_EXPX':           ['EXP X-Axis',           20],
            'scMenu_EXPY':           ['EXP Y-Axis',           60],
            'scMenu_EXPFontSize':    ['EXP FontSize',         14],
            'scMenu_NameX':          ['Name X-Axis',          20],
            'scMenu_NameY':          ['Name Y-Axis',          0],
            'scMenu_NameFontSize':   ['Name FontSize',        20],
            'scMenu_NameWidth':      ['Name Width',           180],
            'scMenu_NameAlign':      ['Name Align',           'center'],
            'scMenu_NameColor':      ['Name Color',           '#ffffff'],
            'scMenu_NameBold':       ['Name Bold',            'false'],
            'scMenu_statesX':        ['States X-Axis',        111],
            'scMenu_statesY':        ['States Y-Axis',        30],
            'scMenu_ComSpaceX':      ['Command Space X',      0],
            'scMenu_ComSpaceY':      ['Command Space Y',      50],
            'scMenu_ComX':           ['Commands X-Axis',      180],
            'scMenu_ComY':           ['Commands Y-Axis',      50],
            'scMenu_layoutSpacing':  ['Layout Spacing',       0],
            'scMenu_layoutStartX':   ['Layout Start X',       0],
            'scMenu_LVNumberAlign':  ['LV Number Align',      'left'],
            'scMenu_layoutScaleX':   ['Layout Scale X',       1.0],
            'scMenu_layoutScaleY':   ['Layout Scale Y',       1.0],
            'scMenu_layoutOpacity':  ['Layout Opacity',       255],
            'scMenu_layoutAnchorX':  ['Layout Anchor X',      0.0],
            'scMenu_layoutAnchorY':  ['Layout Anchor Y',      0.0],
            'scMenu_CharScaleX':     ['Char Scale X',         1.0],
            'scMenu_CharScaleY':     ['Char Scale Y',         1.0],
            'scMenu_CharOpacity':    ['Char Opacity',         255],
            'scMenu_HPLabelVisible':  ['HP Label Visible',    'false'],
            'scMenu_HPLabelX':        ['HP Label X-Axis',     10],
            'scMenu_HPLabelY':        ['HP Label Y-Axis',     76],
            'scMenu_HPLabelFontSize': ['HP Label FontSize',   14],
            'scMenu_HPLabelColor':    ['HP Label Color',      '#ff8888'],
            'scMenu_MPLabelVisible':  ['MP Label Visible',    'false'],
            'scMenu_MPLabelX':        ['MP Label X-Axis',     10],
            'scMenu_MPLabelY':        ['MP Label Y-Axis',     118],
            'scMenu_MPLabelFontSize': ['MP Label FontSize',   14],
            'scMenu_MPLabelColor':    ['MP Label Color',      '#8888ff'],
            'scMenu_SANLabelVisible': ['SAN Label Visible',   'false'],
            'scMenu_SANLabelX':       ['SAN Label X-Axis',    10],
            'scMenu_SANLabelY':       ['SAN Label Y-Axis',    160],
            'scMenu_SANLabelFontSize':['SAN Label FontSize',  14],
            'scMenu_SANLabelColor':   ['SAN Label Color',     '#88ff88'],
            'scMenu_LVLabelVisible':  ['LV Label Visible',    'false'],
            'scMenu_LVLabelX':        ['LV Label X-Axis',     10],
            'scMenu_LVLabelY':        ['LV Label Y-Axis',     30],
            'scMenu_LVLabelFontSize': ['LV Label FontSize',   14],
            'scMenu_LVLabelColor':    ['LV Label Color',      '#ffdd88'],
            // --- Magic Wheel & Roulette ---
            'scMenu_MagicWheelX':        ['Magic Wheel X-Axis',  0],
            'scMenu_MagicWheelY':        ['Magic Wheel Y-Axis',  312],
            'scMenu_MagicWheelScaleX':   ['Magic Wheel Scale X', 1.0],
            'scMenu_MagicWheelScaleY':   ['Magic Wheel Scale Y', 1.0],
            'scMenu_RouletteRadius':     ['Roulette Radius',     220],
            'scMenu_RouletteSpacing':    ['Roulette Spacing',    0.4],
        };

        Object.keys(props).forEach(function(prop) {
            var paramKey = props[prop][0];
            var fallback = props[prop][1];
            if (p[paramKey] !== undefined) {
                var parsed = isNaN(Number(p[paramKey])) ? String(p[paramKey]) : Number(p[paramKey]);
                Moghunter[prop] = (p[paramKey] === '' || p[paramKey] === undefined) ? fallback : parsed;
            }
        });
    }

    // =========================================================================
    // Save plugins.js (Node.js fs write)
    // =========================================================================
    function savePluginsJs(andReload) {
        setStatus('Menyimpan...', '#ffdd88');
        try {
            // Baca isi plugins.js saat ini
            var raw = fs.readFileSync(PLUGINS_JS_PATH, 'utf8');

            var startIndex = raw.indexOf('var $plugins =');
            var endIndex = raw.lastIndexOf(']');

            if (startIndex === -1 || endIndex === -1) {
                setStatus('❌ Gagal: Format plugins.js tidak dikenali.', '#ff6666');
                return;
            }

            // Ambil komentar header (jika ada)
            var header = raw.substring(0, startIndex);

            // Rebuild array dari $plugins runtime yang sudah dimodifikasi
            // Format agar persis seperti bawaan RPG Maker MV (satu object per baris)
            var arrayStrings = [];
            for (var i = 0; i < $plugins.length; i++) {
                arrayStrings.push(JSON.stringify($plugins[i]));
            }
            var rebuilt = header + 'var $plugins =\n[\n' + arrayStrings.join(',\n') + '\n];\n';

            fs.writeFileSync(PLUGINS_JS_PATH, rebuilt, 'utf8');
            setStatus('✅ Disimpan ke plugins.js!', '#66ff99');

            if (andReload) {
                setTimeout(function() { location.reload(); }, 600);
            }
        } catch(err) {
            setStatus('❌ Error: ' + err.message, '#ff6666');
            console.error('[DevPluginEditor] Save error:', err);
        }
    }

    // =========================================================================
    // Filter Rows by search
    // =========================================================================
    function filterRows(query) {
        query = query.toLowerCase().trim();
        var groups = document.querySelectorAll('.dev-plugin-group');
        
        groups.forEach(function(group) {
            var pluginNameOrig = group.getAttribute('data-plugin') || '';
            var pluginName = pluginNameOrig.toLowerCase();
            var rows = group.querySelectorAll('.dev-param-row');
            
            // Jika query kosong, atau nama plugin mengandung query
            var pluginMatch = !query || pluginName.indexOf(query) !== -1;
            var hasVisibleRow = false;
            
            rows.forEach(function(row) {
                var key = (row.getAttribute('data-key') || '').toLowerCase();
                var rowMatch = !query || key.indexOf(query) !== -1;
                
                // Tampilkan row jika plugin name match ATAU parameter name match
                if (pluginMatch || rowMatch) {
                    row.style.display = '';
                    hasVisibleRow = true;
                } else {
                    row.style.display = 'none';
                }
            });
            
            var header = group.previousElementSibling;
            if (query) {
                // Saat mencari: expand group jika ada yang match (baik plugin maupun parameter)
                var showGroup = (pluginMatch || hasVisibleRow);
                group.style.display = showGroup ? '' : 'none';
                if (header) header.style.display = showGroup ? 'flex' : 'none';
            } else {
                // Saat tidak mencari: restore status collapse semula
                group.style.display = _collapsed[pluginNameOrig] ? 'none' : '';
                if (header) header.style.display = 'flex';
            }
        });
    }

    // =========================================================================
    // Close Panel
    // =========================================================================
    function closePanel() {
        if (_panelEl)  { document.body.removeChild(_panelEl);  _panelEl  = null; }
        if (_overlay)  { document.body.removeChild(_overlay);  _overlay  = null; }
        document.removeEventListener('mousemove', onMouseMove);
        _panelOpen = false;
    }

    // =========================================================================
    // Drag Handler
    // =========================================================================
    function onMouseMove(e) {
        if (!_isDragging || !_panelEl) return;
        _panelEl.style.left = (e.clientX - _dragOffsetX) + 'px';
        _panelEl.style.top  = (e.clientY - _dragOffsetY) + 'px';
        _panelEl.style.right = 'auto';
    }

    // =========================================================================
    // Helpers
    // =========================================================================
    function makeBtn(label, bgColor, onClick) {
        var btn = document.createElement('button');
        btn.textContent = label;
        btn.style.cssText = [
            'background:' + bgColor,
            'border:1px solid rgba(255,255,255,0.15)',
            'border-radius:5px',
            'color:#fff',
            'padding:3px 8px',
            'font-size:11px',
            'cursor:pointer',
            'font-family:Consolas,monospace',
        ].join(';');
        btn.addEventListener('mouseenter', function() { btn.style.opacity = '0.8'; });
        btn.addEventListener('mouseleave', function() { btn.style.opacity = '1'; });
        btn.addEventListener('click', onClick);
        return btn;
    }

    function flashRow(row, color) {
        row.style.background = color;
        setTimeout(function() { row.style.background = ''; }, 500);
    }

    function setStatus(msg, color) {
        var el = document.getElementById('dev-plugin-editor-status');
        if (el) {
            el.textContent = msg;
            el.style.color = color || 'rgba(150,200,255,0.6)';
            setTimeout(function() {
                if (el) {
                    el.textContent = 'F8 = Tutup | Ctrl+S = Simpan | F5 = Simpan+Reload';
                    el.style.color = 'rgba(150,200,255,0.6)';
                }
            }, 3000);
        }
    }

})();
