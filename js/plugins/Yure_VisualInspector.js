//=============================================================================
// Yure_VisualInspector.js
//=============================================================================
/*:
 * @plugindesc [v2.0 DEV] Multi-Variant In-Game Visual Layout Inspector & Permanent Parameter Editor.
 * @author Yure & Antigravity
 *
 * @param Inspector Key
 * @text Tombol Pintasan Inspector
 * @desc Tombol keyboard untuk membuka visual inspector (F8).
 * @default F8
 *
 * @help
 * ============================================================================
 * YURE VISUAL INSPECTOR & LIVE EDITOR (v2.0)
 * ============================================================================
 * Plugin developer serbaguna untuk mengatur posisi tata letak visual (UI) secara
 * langsung di dalam game (In-Game) dengan mouse drag & drop atau keyboard nudge,
 * dan menyimpan perubahannya secara PERMANEN ke file game.
 *
 * FITUR MULTI-VARIAN (Scene Status & Menu Jurnal):
 * 1. Kategori "Status & Deskripsi" (Halaman Kiri):
 *    - Geser teks deskripsi/catatan: Seluruh blok teks, atau baris deskripsi (2-7),
 *      judul slot (Garis 0), nama item (Garis 1), petunjuk shift.
 *    - Geser 4 Bar Status (HP, Mana, Rage, Mental) dan atur lebarnya secara visual!
 *    - Geser Foto Polaroid Karakter.
 *
 * 2. Kategori "Perlengkapan & Jiwa" (Halaman Kanan):
 *    - Klik & Drag 7 Slot perlengkapan langsung dengan mouse!
 *    - Geser nyala jiwa Cyclops (Soul Eye) presisi ke pupil mata!
 *    - Geser posisi senjata Anchor!
 *
 * 3. Kategori "Pita Tab Navigasi":
 *    - Mengatur posisi Y dan X dari 8 pita menu scrapbook.
 *
 * PENYIMPANAN PERMANEN KEBALL RPG MAKER MV:
 * - Menulis langsung ke data/Yure_JournalConfig.json
 * - Menulis ke localStorage
 * - Melakukan direct-patch ke berkas js/plugins/Yure_StatusJournal.js
 *
 * CARA PAKAI:
 *   - Tekan F8 kapan saja saat game berjalan untuk membuka / menutup Inspector.
 * ============================================================================
 */

(function() {
    'use strict';

    if (typeof window !== 'undefined') {
        if (window._yureVisualInspectorInitialized) return;
        window._yureVisualInspectorInitialized = true;
    }

    var isNWjs = (typeof require !== 'undefined' && typeof process !== 'undefined');
    if (!isNWjs) return;

    var fs   = require('fs');
    var path = require('path');

    var ROOT_DIR = process.cwd();
    var DATA_DIR = path.join(ROOT_DIR, 'data');
    var JOURNAL_CFG_PATH = path.join(DATA_DIR, 'Yure_JournalConfig.json');
    var TITLE_CFG_PATH      = path.join(DATA_DIR, 'Yure_TitleConfig.json');
    var OVERRIDES_PATH   = path.join(DATA_DIR, 'DevPluginOverrides.json');
    var JOURNAL_PLUGIN_PATH = path.join(ROOT_DIR, 'js', 'plugins', 'Yure_StatusJournal.js');

    var ALT_DIR_1 = 'C:\\Users\\Apri Laksono\\Documents\\Games\\Yure Party\\Yure Party';
    var ALT_DIR_2 = 'C:\\Users\\Apri Laksono\\Documents\\Games\\Yure Party #3\\Yure Party';
    var SYNC_WORKSPACE_PATH = ROOT_DIR.toLowerCase().indexOf('#3') >= 0 ? ALT_DIR_1 : ALT_DIR_2;
    var SYNC_DATA_DIR = path.join(SYNC_WORKSPACE_PATH, 'data');
    var SYNC_JOURNAL_CFG_PATH = path.join(SYNC_DATA_DIR, 'Yure_JournalConfig.json');
    var SYNC_TITLE_CFG_PATH   = path.join(SYNC_DATA_DIR, 'Yure_TitleConfig.json');
    var SYNC_OVERRIDES_PATH   = path.join(SYNC_DATA_DIR, 'DevPluginOverrides.json');
    var SYNC_JOURNAL_PLUGIN_PATH = path.join(SYNC_WORKSPACE_PATH, 'js', 'plugins', 'Yure_StatusJournal.js');

    // =========================================================================
    // 1. AUTO LOAD OVERRIDES SAAT GAME BOOT
    // =========================================================================
    function applySavedPluginOverrides() {
        try {
            if (fs.existsSync(OVERRIDES_PATH)) {
                var overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'));
                if (overrides && typeof overrides === 'object') {
                    for (var pluginName in overrides) {
                        var pEntry = $plugins.find(function(p) { return p.name === pluginName; });
                        if (pEntry && pEntry.parameters) {
                            var pData = overrides[pluginName];
                            for (var k in pData) {
                                pEntry.parameters[k] = pData[k];
                            }
                        }
                    }
                    console.log('[VisualInspector] Custom plugin overrides re-applied.');
                }
            }
        } catch(e) {
            console.warn('[VisualInspector] Overrides load error:', e);
        }
    }
    applySavedPluginOverrides();

    // =========================================================================
    // 2. HELPER MASTER CONFIG
    // =========================================================================
    function getJournalMasterConfig() {
        if (typeof window !== 'undefined' && window.STATUS_JOURNAL_CONFIG) {
            return window.STATUS_JOURNAL_CONFIG;
        }
        return null;
    }

    // =========================================================================
    // 3. STATE & UI ELEMENTS
    // =========================================================================
    var _isOpen = false;
    var _panel = null;
    var _activeCategory = 'status'; // 'status' | 'equip' | 'ribbon'
    var _activeTarget = 'note_lines';
    var _isDraggingElement = false;
    var _dragStartMouse = { x: 0, y: 0 };
    var _dragStartCoord = { x: 0, y: 0 };

    var TARGET_DEFINITIONS = {
        title: [
            { id: 'title_nia',        label: '👤 Posisi Nia (Silhouette / Karakter)', type: 'title_nia' },
            { id: 'title_shadow',     label: '👥 Bayangan Lantai Nia (Shadow)', type: 'title_shadow' },
            { id: 'title_logo',       label: '👑 Logo Game Yure Party', type: 'title_logo' },
            { id: 'title_backShadow', label: '🌑 Back Shadow (Belakang Nia)', type: 'title_backShadow' },
            { id: 'title_cmd_load',   label: '⚔️ Bilah 1: Load / New Game', type: 'title_cmd', cmdKey: 'load' },
            { id: 'title_cmd_continue', label: '⚔️ Bilah 2: Continue', type: 'title_cmd', cmdKey: 'continue' },
            { id: 'title_cmd_option', label: '⚔️ Bilah 3: Option', type: 'title_cmd', cmdKey: 'option' },
            { id: 'title_cmd_more',   label: '⚔️ Bilah 4: More / Gallery', type: 'title_cmd', cmdKey: 'more' },
            { id: 'title_cursor',     label: '☝ Cursor Penunjuk Opsi', type: 'title_cursor' },
            { id: 'title_redSplash',  label: '🔴 Background Red Splash (Red.png)', type: 'title_redSplash' },
            { id: 'title_prompt',     label: '💬 Teks Prompt ("PRESS ALL TO CONTINUE")', type: 'title_prompt' },
            { id: 'title_copyright',  label: '🏷 Watermark Studio ("ZeroBrain Studio©")', type: 'title_copyright' }
        ],
        status: [
            { id: 'actor_name',   label: '🏷 Posisi Nama Karakter / Aktor', type: 'actor_name' },
            { id: 'note_all',     label: '📝 Seluruh Teks Deskripsi (Geser X & Y Serentak)', type: 'note' },
            { id: 'note_lines',   label: '📜 Baris Deskripsi & Stat (Garis 2 s/d 7)', type: 'note' },
            { id: 'note_title',   label: '✎ Teks Judul Slot (Garis 0)', type: 'note' },
            { id: 'note_item',    label: '🏷 Teks Nama Item (Garis 1)', type: 'note' },
            { id: 'note_hint',    label: '💡 Teks Petunjuk [SHIFT]', type: 'note' },
            { id: 'bar_hp',       label: '🔴 Bar Status: HP', type: 'bar', barKey: 'hp' },
            { id: 'bar_mana',     label: '🔵 Bar Status: Mana / MP', type: 'bar', barKey: 'mana' },
            { id: 'bar_rage',     label: '🟠 Bar Status: Rage / TP', type: 'bar', barKey: 'rage' },
            { id: 'bar_mental',   label: '🟢 Bar Status: Mental / Sanity', type: 'bar', barKey: 'mental' },
            { id: 'polaroid',     label: '🖼 Foto Polaroid Karakter', type: 'polaroid' }
        ],
        equip: [
            { id: 'equip_icon_size', label: '🔘 Ukuran Ikon Slot Perlengkapan (Icon Size)', type: 'equip_icon_size' },
            { id: 'souls',        label: '⚓ Slot: Souls (Tengah)', type: 'slot' },
            { id: 'acc1',         label: '💍 Slot: Accessory I (Kiri)', type: 'slot' },
            { id: 'acc2',         label: '💍 Slot: Accessory II (Kanan)', type: 'slot' },
            { id: 'seal1',        label: '📜 Slot: Seal I (Kiri)', type: 'slot' },
            { id: 'seal2',        label: '📜 Slot: Seal II (Kanan)', type: 'slot' },
            { id: 'cat1',         label: '🧪 Slot: Catalyst I (Kiri)', type: 'slot' },
            { id: 'cat2',         label: '🧪 Slot: Catalyst II (Kanan)', type: 'slot' },
            { id: 'soulFlame',    label: '🔥 Posisi Nyala Jiwa / Souls (Anchor)', type: 'soulEye' },
            { id: 'anchorWeapon', label: '🔱 Posisi Senjata Anchor', type: 'anchor' }
        ],
        item: [
            { id: 'item_icon_size',          label: '🔍 Ukuran Ikon Grid 24 Slot (Icon Size)', type: 'item_icon_size' },
            { id: 'item_polaroid_icon_size', label: '🖼 Ukuran Ikon Polaroid (Photo Icon Size)', type: 'item_polaroid_icon_size' },
            { id: 'item_grid',        label: '📦 Posisi Grid 24 Slot (Halaman Kiri)', type: 'item_grid' },
            { id: 'item_spacing',     label: '📐 Jarak Antar Slot (X & Y Spacing)', type: 'item_spacing' },
            { id: 'item_polaroid',    label: '🖼 Bingkai Polaroid (Halaman Kanan)', type: 'item_polaroid' },
            { id: 'item_title',       label: '🏷 Judul & Kategori Item (Samping Foto)', type: 'item_title' },
            { id: 'item_desc',        label: '📝 Kertas Catatan Lore (Description_)', type: 'item_desc' },
            { id: 'item_textOffset',  label: '✎ Posisi Teks Lore (Offset Garis)', type: 'item_textOffset' },
            { id: 'item_lineHeight',  label: '📏 Jarak Garis Lore (Line Height)', type: 'item_lineHeight' }
        ],
        skill: [
            { id: 'skill_ribbon',            label: '🎀 Pita Bookmark Skill (Pojok Kiri Atas)', type: 'skill_ribbon' },
            { id: 'skill_icon_size',         label: '🔍 Ukuran Ikon Grid 24 Slot (Icon Size)', type: 'skill_icon_size' },
            { id: 'skill_polaroid_icon_size',label: '🖼 Ukuran Ikon Polaroid (Photo Icon Size)', type: 'skill_polaroid_icon_size' },
            { id: 'skill_grid',              label: '📦 Posisi Grid 24 Slot (Halaman Kiri)', type: 'skill_grid' },
            { id: 'skill_spacing',           label: '📐 Jarak Antar Slot (X & Y Spacing)', type: 'skill_spacing' },
            { id: 'skill_polaroid',          label: '🖼 Bingkai Polaroid (Halaman Kanan)', type: 'skill_polaroid' },
            { id: 'skill_title',             label: '🏷 Judul & Kategori Skill (Samping Foto)', type: 'skill_title' },
            { id: 'skill_desc',              label: '📝 Kertas Catatan Lore (Description_)', type: 'skill_desc' },
            { id: 'skill_textOffset',        label: '✎ Posisi Teks Lore (Offset Garis)', type: 'skill_textOffset' },
            { id: 'skill_lineHeight',        label: '📏 Jarak Garis Lore (Line Height)', type: 'skill_lineHeight' }
        ],
        constellation: [
            { id: 'const_tree',         label: '🌳 Posisi Pohon Konstelasi (Halaman Kiri)', type: 'const_tree' },
            { id: 'const_node_0',       label: '🔘 Node 0: Root Base (Kiri Atas)', type: 'const_node', nodeIdx: 0 },
            { id: 'const_node_1',       label: '🔘 Node 1: Cabang 1 (Kanan Atas)', type: 'const_node', nodeIdx: 1 },
            { id: 'const_node_2',       label: '🔘 Node 2: Cabang 2 (Kiri Tengah)', type: 'const_node', nodeIdx: 2 },
            { id: 'const_node_3',       label: '🔘 Node 3: Cabang 3 (Kanan Tengah)', type: 'const_node', nodeIdx: 3 },
            { id: 'const_node_4',       label: '🔘 Node 4: Cabang 4 (Kiri Bawah)', type: 'const_node', nodeIdx: 4 },
            { id: 'const_romans',       label: '🎀 Tiga Pita Preset Romawi (Bawah Kiri)', type: 'const_romans' },
            { id: 'const_card',         label: '🪪 ID Card Karakter (Halaman Kanan)', type: 'const_card' },
            { id: 'const_cat_ribbons',  label: '🎀 Tiga Pita Kategori (Kanan Atas)', type: 'const_cat_ribbons' },
            { id: 'const_grid',         label: '📦 Posisi Grid 20 Slot (Halaman Kanan)', type: 'const_grid' },
            { id: 'const_spacing',      label: '📐 Jarak Antar Slot Grid (Spacing X & Y)', type: 'const_spacing' },
            { id: 'const_icon_size',    label: '🔍 Ukuran Ikon Grid (Icon Size)', type: 'const_icon_size' }
        ],
        archive: [
            { id: 'arch_hub_memories', label: '📸 Hub Memories (Halaman Kiri)', type: 'arch_hub_memories' },
            { id: 'arch_hub_notes',    label: '📜 Hub Catatan Review (Halaman Kanan)', type: 'arch_hub_notes' },
            { id: 'arch_gal_left',     label: '🖼️ Galeri CG Slot Kiri (Halaman Kiri)', type: 'arch_gal_left' },
            { id: 'arch_gal_right',    label: '🖼️ Galeri CG Slot Kanan (Halaman Kanan)', type: 'arch_gal_right' },
            { id: 'arch_logs_list',    label: '📜 List Log Petualangan (Halaman Kiri)', type: 'arch_logs_list' },
            { id: 'arch_logs_detail',  label: '📖 Detail Log Petualangan (Halaman Kanan)', type: 'arch_logs_detail' }
        ],
        ribbon: [
            { id: 'ribbon_on_0',  label: '🎀 [ON] Status - Posisi Terbuka (Muncul)', type: 'ribbon_on', index: 0 },
            { id: 'ribbon_off_0', label: '🎀 [OFF] Status - Posisi Sembunyi (Icon)', type: 'ribbon_off', index: 0 },
            { id: 'ribbon_on_1',  label: '🎀 [ON] Item - Posisi Terbuka (Muncul)', type: 'ribbon_on', index: 1 },
            { id: 'ribbon_off_1', label: '🎀 [OFF] Item - Posisi Sembunyi (Icon)', type: 'ribbon_off', index: 1 },
            { id: 'ribbon_on_2',  label: '🎀 [ON] Party - Posisi Terbuka (Muncul)', type: 'ribbon_on', index: 2 },
            { id: 'ribbon_off_2', label: '🎀 [OFF] Party - Posisi Sembunyi (Icon)', type: 'ribbon_off', index: 2 },
            { id: 'ribbon_on_3',  label: '🎀 [ON] Skills - Posisi Terbuka (Muncul)', type: 'ribbon_on', index: 3 },
            { id: 'ribbon_off_3', label: '🎀 [OFF] Skills - Posisi Sembunyi (Icon)', type: 'ribbon_off', index: 3 },
            { id: 'ribbon_on_4',  label: '🎀 [ON] Constellation - Posisi Terbuka (Muncul)', type: 'ribbon_on', index: 4 },
            { id: 'ribbon_off_4', label: '🎀 [OFF] Constellation - Posisi Sembunyi (Icon)', type: 'ribbon_off', index: 4 },
            { id: 'ribbon_on_5',  label: '🎀 [ON] Archive - Posisi Terbuka (Muncul)', type: 'ribbon_on', index: 5 },
            { id: 'ribbon_off_5', label: '🎀 [OFF] Archive - Posisi Sembunyi (Icon)', type: 'ribbon_off', index: 5 },
            { id: 'ribbon_on_6',  label: '🎀 [ON] Settings - Posisi Terbuka (Muncul)', type: 'ribbon_on', index: 6 },
            { id: 'ribbon_off_6', label: '🎀 [OFF] Settings - Posisi Sembunyi (Icon)', type: 'ribbon_off', index: 6 },
            { id: 'ribbon_on_7',  label: '🎀 [ON] Exit - Posisi Terbuka (Muncul)', type: 'ribbon_on', index: 7 },
            { id: 'ribbon_off_7', label: '🎀 [OFF] Exit - Posisi Sembunyi (Icon)', type: 'ribbon_off', index: 7 }
        ]
    };

    // =========================================================================
    // 4. EVENT LISTENER F8 & KEYBOARD NUDGE
    // =========================================================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F8') {
            e.preventDefault();
            toggleInspector();
        }
        if (_isOpen && (isJournalActive() || isTitleMenuActive())) {
            var step = e.shiftKey ? 5 : 1;
            if (e.key === 'ArrowLeft')  { e.preventDefault(); nudgeTarget(-step, 0); }
            if (e.key === 'ArrowRight') { e.preventDefault(); nudgeTarget(step, 0); }
            if (e.key === 'ArrowUp')    { e.preventDefault(); nudgeTarget(0, -step); }
            if (e.key === 'ArrowDown')  { e.preventDefault(); nudgeTarget(0, step); }
        }
    });

    function isTitleMenuActive() {
        if (!SceneManager._scene || !SceneManager._scene.constructor) return false;
        return SceneManager._scene.constructor.name === 'Scene_Title';
    }

    function isStatusJournalActive() {
        if (!SceneManager._scene || !SceneManager._scene.constructor) return false;
        var name = SceneManager._scene.constructor.name;
        if (name === 'Scene_StatusJournal') {
            return (SceneManager._scene._activeJournalTab === 0 || SceneManager._scene._activeJournalTab === undefined);
        }
        return false;
    }

    function isConstellationJournalActive() {
        if (!SceneManager._scene || !SceneManager._scene.constructor) return false;
        var name = SceneManager._scene.constructor.name;
        if (name === 'Scene_StatusJournal') {
            return (SceneManager._scene._activeJournalTab === 4);
        }
        return false;
    }

    function isArchiveJournalActive() {
        if (!SceneManager._scene || !SceneManager._scene.constructor) return false;
        var name = SceneManager._scene.constructor.name;
        if (name === 'Scene_StatusJournal') {
            return (SceneManager._scene._activeJournalTab === 5);
        }
        return false;
    }

    function isSkillJournalActive() {
        if (!SceneManager._scene || !SceneManager._scene.constructor) return false;
        var name = SceneManager._scene.constructor.name;
        if (name === 'Scene_SkillJournal') return true;
        if (name === 'Scene_StatusJournal') {
            return (SceneManager._scene._activeJournalTab === 3);
        }
        return false;
    }

    function isItemJournalActive() {
        if (!SceneManager._scene || !SceneManager._scene.constructor) return false;
        var name = SceneManager._scene.constructor.name;
        if (name === 'Scene_ItemJournal') return true;
        if (name === 'Scene_StatusJournal') {
            return (SceneManager._scene._activeJournalTab === 1);
        }
        return false;
    }

    function isJournalActive() {
        if (!SceneManager._scene || !SceneManager._scene.constructor) return false;
        var name = SceneManager._scene.constructor.name;
        return name === 'Scene_StatusJournal' || name === 'Scene_ItemJournal' || name === 'Scene_SkillJournal';
    }

    function toggleInspector() {
        if (_isOpen) closeInspector();
        else openInspector();
    }

    function openInspector() {
        if (_isOpen) return;
        _isOpen = true;

        if (isTitleMenuActive()) {
            _activeCategory = 'title';
            _activeTarget = 'title_nia';
        } else if (isSkillJournalActive()) {
            if (_activeCategory !== 'skill' && _activeCategory !== 'ribbon') {
                _activeCategory = 'skill';
                _activeTarget = 'skill_ribbon';
            }
        } else if (isItemJournalActive()) {
            if (_activeCategory !== 'item' && _activeCategory !== 'ribbon') {
                _activeCategory = 'item';
                _activeTarget = 'item_grid';
            }
        } else if (isStatusJournalActive()) {
            if (_activeCategory !== 'status' && _activeCategory !== 'equip' && _activeCategory !== 'ribbon') {
                _activeCategory = 'status';
                _activeTarget = 'note_lines';
            }
        }

        _panel = document.createElement('div');
        _panel.id = 'yure-visual-inspector';
        _panel.style.cssText = [
            'position:fixed',
            'top:20px',
            'right:20px',
            'width:410px',
            'background:rgba(15, 13, 23, 0.97)',
            'border:1.5px solid #ec4899',
            'border-radius:12px',
            'box-shadow:0 12px 40px rgba(0,0,0,0.85), 0 0 25px rgba(236,72,153,0.35)',
            'font-family:Consolas, monospace',
            'color:#f1f5f9',
            'z-index:999999',
            'display:flex',
            'flex-direction:column',
            'overflow:hidden',
            'user-select:none',
            'animation:fadeIn 0.2s ease-out'
        ].join(';');

        buildPanelContent();
        document.body.appendChild(_panel);

        if (isJournalActive() || isTitleMenuActive()) {
            attachCanvasInteractiveLayer();
        }
    }

    function closeInspector() {
        if (_panel && _panel.parentNode) {
            _panel.parentNode.removeChild(_panel);
        }
        _panel = null;
        _isOpen = false;
        detachCanvasInteractiveLayer();
    }

    window._yureVisualInspectorRefresh = function() {
        if (_isOpen && _panel) {
            if (isSkillJournalActive()) {
                if (_activeCategory === 'status' || _activeCategory === 'equip' || _activeCategory === 'item') {
                    _activeCategory = 'skill';
                    var targets = TARGET_DEFINITIONS['skill'];
                    _activeTarget = (targets && targets.length > 0) ? targets[0].id : 'skill_ribbon';
                }
            } else if (isItemJournalActive()) {
                if (_activeCategory === 'status' || _activeCategory === 'equip' || _activeCategory === 'skill') {
                    _activeCategory = 'item';
                    var targets = TARGET_DEFINITIONS['item'];
                    _activeTarget = (targets && targets.length > 0) ? targets[0].id : 'item_grid';
                }
            } else if (isStatusJournalActive()) {
                if (_activeCategory === 'item' || _activeCategory === 'skill') {
                    _activeCategory = 'status';
                    var targets = TARGET_DEFINITIONS['status'];
                    _activeTarget = (targets && targets.length > 0) ? targets[0].id : 'note_lines';
                }
            }
            buildPanelContent();
        }
    };

    // =========================================================================
    // 5. BANGUN KONTEN PANEL DENGAN SISTEM TABS MULTI-VARIAN
    // =========================================================================
    function buildPanelContent() {
        if (!_panel) return;
        _panel.innerHTML = '';

        var isJournal = isJournalActive();

        // --- HEADER ---
        var header = document.createElement('div');
        header.style.cssText = 'background:linear-gradient(135deg, #be185d, #831843);padding:10px 14px;display:flex;align-items:center;gap:8px;cursor:move;';
        
        var title = document.createElement('span');
        title.style.cssText = 'font-weight:bold;font-size:13px;color:#fdf2f8;flex:1;';
        title.textContent = isTitleMenuActive() ? '🔥 Title Menu Inspector & Live Editor' :
                           isStatusJournalActive() ? '🎯 Jurnal Status Inspector (v2.0)' :
                           isItemJournalActive() ? '📦 Jurnal Item Inspector (v2.0)' :
                           '⚙ Dev Plugin Parameter Editor';

        var closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'background:rgba(0,0,0,0.3);border:none;color:#fff;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:12px;';
        closeBtn.onclick = closeInspector;

        header.appendChild(title);
        header.appendChild(closeBtn);
        _panel.appendChild(header);

        // Header Drag logic
        var isDraggingHeader = false;
        var startX = 0, startY = 0;
        header.addEventListener('mousedown', function(e) {
            isDraggingHeader = true;
            startX = e.clientX - _panel.offsetLeft;
            startY = e.clientY - _panel.offsetTop;
            e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
            if (isDraggingHeader && _panel) {
                _panel.style.left = (e.clientX - startX) + 'px';
                _panel.style.top  = (e.clientY - startY) + 'px';
                _panel.style.right = 'auto';
            }
        });
        document.addEventListener('mouseup', function() { isDraggingHeader = false; });

        // --- BODY ---
        var body = document.createElement('div');
        body.style.cssText = 'padding:14px;display:flex;flex-direction:column;gap:12px;max-height:78vh;overflow-y:auto;';

        if (isTitleMenuActive()) {
            buildTitleInspectorBody(body);
        } else if (isJournal) {
            buildJournalInspectorBody(body);
        } else {
            buildGeneralPluginEditorBody(body);
        }

        _panel.appendChild(body);
    }

    // =========================================================================
    // 5.5. BUILDER TITLE MENU INSPECTOR (v2.0)
    // =========================================================================
    function buildTitleInspectorBody(container) {
        var tcfg = window.YURE_TITLE_CONFIG;
        if (!tcfg) return;
        var scene = SceneManager._scene;

        var tip = document.createElement('div');
        tip.style.cssText = 'font-size:11px;color:#cbd5e1;background:rgba(255,255,255,0.05);padding:8px 10px;border-radius:6px;line-height:1.4;';
        tip.innerHTML = '🔥 <b>Title Menu Live Layout Inspector:</b><br>• Klik & drag posisi elemen langsung di layar game!<br>• Panah keyboard untuk nudge 1px (Shift=5px).<br>• Simpan permanen ke data/Yure_TitleConfig.json.';
        container.appendChild(tip);

        var selectWrap = document.createElement('div');
        selectWrap.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
        var selectLabel = document.createElement('label');
        selectLabel.textContent = 'Pilih Elemen Title yang Diedit:';
        selectLabel.style.cssText = 'font-size:11px;color:#fda4af;font-weight:bold;';

        var select = document.createElement('select');
        select.id = 'yure-target-select';
        select.style.cssText = 'background:#1e293b;color:#fff;border:1px solid #475569;border-radius:6px;padding:6px;font-size:12px;outline:none;cursor:pointer;';

        var targets = TARGET_DEFINITIONS.title || [];
        targets.forEach(function(t) {
            var opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.label;
            if (t.id === _activeTarget) opt.selected = true;
            select.appendChild(opt);
        });

        select.onchange = function() {
            _activeTarget = select.value;
            buildPanelContent();
        };

        selectWrap.appendChild(selectLabel);
        selectWrap.appendChild(select);
        container.appendChild(selectWrap);

        var coordRow = document.createElement('div');
        coordRow.id = 'yure-coord-row';
        coordRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;';

        var xWrap = document.createElement('div');
        xWrap.innerHTML = '<span style="font-size:11px;color:#94a3b8;">Koordinat X:</span>';
        var inputX = document.createElement('input');
        inputX.id = 'yure-input-x';
        inputX.type = 'number';
        inputX.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #334155;color:#38bdf8;padding:6px;border-radius:6px;font-weight:bold;';
        inputX.oninput = function() { applyAbsoluteCoord(Number(inputX.value), null, null); };
        xWrap.appendChild(inputX);

        var yWrap = document.createElement('div');
        yWrap.innerHTML = '<span style="font-size:11px;color:#94a3b8;">Koordinat Y:</span>';
        var inputY = document.createElement('input');
        inputY.id = 'yure-input-y';
        inputY.type = 'number';
        inputY.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #334155;color:#38bdf8;padding:6px;border-radius:6px;font-weight:bold;';
        inputY.oninput = function() { applyAbsoluteCoord(null, Number(inputY.value), null); };
        yWrap.appendChild(inputY);

        var scaleWrap = document.createElement('div');
        scaleWrap.innerHTML = '<span style="font-size:11px;color:#94a3b8;">Skala (Scale):</span>';
        var inputScale = document.createElement('input');
        inputScale.id = 'yure-input-scale';
        inputScale.type = 'number';
        inputScale.step = '0.05';
        inputScale.min = '0.2';
        inputScale.max = '3.0';
        inputScale.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #334155;color:#38bdf8;padding:6px;border-radius:6px;font-weight:bold;';
        inputScale.oninput = function() { applyAbsoluteCoord(null, null, Number(inputScale.value)); };
        scaleWrap.appendChild(inputScale);

        coordRow.appendChild(xWrap);
        coordRow.appendChild(yWrap);
        coordRow.appendChild(scaleWrap);
        container.appendChild(coordRow);

        if (_activeTarget === 'title_nia') {
            var modeWrap = document.createElement('div');
            modeWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.03);padding:10px;border-radius:6px;';
            modeWrap.innerHTML = '<span style="font-size:11px;color:#fda4af;font-weight:bold;">Tampilan Nia:</span>';

            var btnRow = document.createElement('div');
            btnRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';

            var curMode = (tcfg.nia && tcfg.nia.mode) || 'black';

            var btnBlack = document.createElement('button');
            btnBlack.textContent = '👤 Siluet Hitam (Nia Black)';
            btnBlack.style.cssText = 'padding:8px;font-size:11px;border-radius:6px;cursor:pointer;border:none;' + 
                (curMode === 'black' ? 'background:#ec4899;color:#fff;font-weight:bold;' : 'background:#1e293b;color:#94a3b8;');
            btnBlack.onclick = function() {
                tcfg.nia.mode = 'black';
                if (scene && scene.applyTitleConfigToSprites) scene.applyTitleConfigToSprites();
                buildPanelContent();
            };

            var btnNormal = document.createElement('button');
            btnNormal.textContent = '🎨 Berwarna (Nia Normal)';
            btnNormal.style.cssText = 'padding:8px;font-size:11px;border-radius:6px;cursor:pointer;border:none;' + 
                (curMode === 'normal' ? 'background:#ec4899;color:#fff;font-weight:bold;' : 'background:#1e293b;color:#94a3b8;');
            btnNormal.onclick = function() {
                tcfg.nia.mode = 'normal';
                if (scene && scene.applyTitleConfigToSprites) scene.applyTitleConfigToSprites();
                buildPanelContent();
            };

            btnRow.appendChild(btnBlack);
            btnRow.appendChild(btnNormal);
            modeWrap.appendChild(btnRow);
            container.appendChild(modeWrap);
        } else if (_activeTarget === 'title_redSplash') {
            var redWrap = document.createElement('div');
            redWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.03);padding:10px;border-radius:6px;';
            redWrap.innerHTML = '<span style="font-size:11px;color:#fda4af;font-weight:bold;">Mode Transisi Red Splash (Red.png):</span>';

            var redSelect = document.createElement('select');
            redSelect.style.cssText = 'background:#1e293b;color:#fff;border:1px solid #475569;border-radius:6px;padding:6px;font-size:12px;outline:none;cursor:pointer;';
            var redModes = [
                { id: 'dynamic', label: '🔥 Dynamic Flare (Menyala saat navigasi kursor)' },
                { id: 'always',  label: '🔴 Always Red (Selalu merah seperti reference_end)' },
                { id: 'none',    label: '⚪ Blades Only (Hanya bilah di kanvas putih)' }
            ];
            var curRedMode = (tcfg.redSplash && tcfg.redSplash.mode) || 'dynamic';
            redModes.forEach(function(rm) {
                var o = document.createElement('option');
                o.value = rm.id;
                o.textContent = rm.label;
                if (rm.id === curRedMode) o.selected = true;
                redSelect.appendChild(o);
            });
            redSelect.onchange = function() {
                tcfg.redSplash.mode = redSelect.value;
                if (scene && scene.applyTitleConfigToSprites) scene.applyTitleConfigToSprites();
            };
            redWrap.appendChild(redSelect);
            container.appendChild(redWrap);
        } else if (_activeTarget === 'title_prompt') {
            var promptWrap = document.createElement('div');
            promptWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.03);padding:10px;border-radius:6px;';
            promptWrap.innerHTML = '<span style="font-size:11px;color:#fda4af;font-weight:bold;">Teks Prompt Awal:</span>';

            var promptInput = document.createElement('input');
            promptInput.type = 'text';
            promptInput.value = (tcfg.prompt && tcfg.prompt.text) || 'PRESS ALL TO CONTINUE';
            promptInput.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #334155;color:#f472b6;padding:6px;border-radius:6px;font-weight:bold;';
            promptInput.oninput = function() {
                tcfg.prompt.text = promptInput.value;
                if (scene && scene.refreshPromptBitmap) scene.refreshPromptBitmap();
            };
            promptWrap.appendChild(promptInput);
            container.appendChild(promptWrap);
        } else if (_activeTarget === 'title_copyright') {
            var copyWrap = document.createElement('div');
            copyWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.03);padding:10px;border-radius:6px;';
            copyWrap.innerHTML = '<span style="font-size:11px;color:#fda4af;font-weight:bold;">Teks Watermark Studio:</span>';

            var copyInput = document.createElement('input');
            copyInput.type = 'text';
            copyInput.value = (tcfg.copyright && tcfg.copyright.text) || 'ZeroBrain Studio©';
            copyInput.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #334155;color:#cbd5e1;padding:6px;border-radius:6px;font-weight:bold;';
            copyInput.oninput = function() {
                tcfg.copyright.text = copyInput.value;
                if (scene && scene.refreshCopyrightBitmap) scene.refreshCopyrightBitmap();
            };
            copyWrap.appendChild(copyInput);
            container.appendChild(copyWrap);
        }

        var btnWrap = document.createElement('div');
        btnWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:6px;';

        var saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 Simpan Permanen ke Game';
        saveBtn.style.cssText = 'background:linear-gradient(135deg, #059669, #047857);color:#fff;border:none;border-radius:6px;padding:9px;font-weight:bold;cursor:pointer;font-size:12px;box-shadow:0 4px 12px rgba(5,150,105,0.4);';
        saveBtn.onclick = saveTitleConfigPermanently;

        var resetBtn = document.createElement('button');
        resetBtn.textContent = '↺ Reset ke Koordinat Bawaan (0, 0)';
        resetBtn.style.cssText = 'background:#334155;color:#cbd5e1;border:none;border-radius:6px;padding:7px;cursor:pointer;font-size:11px;';
        resetBtn.onclick = function() {
            applyAbsoluteCoord(0, 0, 1.0);
            updateCoordinateInputs();
        };

        var statusEl = document.createElement('div');
        statusEl.id = 'yure-inspector-status';
        statusEl.style.cssText = 'font-size:11px;color:#34d399;text-align:center;min-height:16px;';

        btnWrap.appendChild(saveBtn);
        btnWrap.appendChild(resetBtn);
        btnWrap.appendChild(statusEl);
        container.appendChild(btnWrap);

        updateCoordinateInputs();
    }

    // =========================================================================
    // 6. BUILDER JURNAL STATUS MULTI-VARIAN
    // =========================================================================
    function buildJournalInspectorBody(container) {
        var cfg = getJournalMasterConfig();

        // TAB SELECTOR
        var tabRow = document.createElement('div');
        tabRow.style.cssText = 'display:grid;gap:4px;background:#0f172a;padding:4px;border-radius:8px;';

        function makeTabBtn(id, label, targetJournalTab) {
            var btn = document.createElement('button');
            btn.textContent = label;
            var active = (_activeCategory === id);
            btn.style.cssText = [
                'padding:6px 4px',
                'font-size:11px',
                'font-weight:bold',
                'border-radius:6px',
                'border:none',
                'cursor:pointer',
                active ? 'background:#ec4899;color:#fff;' : 'background:transparent;color:#94a3b8;'
            ].join(';');
            btn.onclick = function() {
                var scene = SceneManager._scene;
                if (targetJournalTab !== undefined && scene && typeof scene.turnToTab === 'function') {
                    if (scene._activeJournalTab !== targetJournalTab) {
                        var dir = targetJournalTab > (scene._activeJournalTab || 0) ? 1 : -1;
                        scene.turnToTab(targetJournalTab, dir);
                    }
                }
                _activeCategory = id;
                var targets = TARGET_DEFINITIONS[id];
                if (targets && targets.length > 0) {
                    _activeTarget = targets[0].id;
                }
                buildPanelContent();
            };
            return btn;
        }

        tabRow.style.gridTemplateColumns = 'repeat(7, 1fr)';
        tabRow.appendChild(makeTabBtn('status', '📊 Status', 0));
        tabRow.appendChild(makeTabBtn('equip',  '⚔️ Equip', 0));
        tabRow.appendChild(makeTabBtn('item',   '📦 Item', 1));
        tabRow.appendChild(makeTabBtn('skill',  '✨ Skill', 3));
        tabRow.appendChild(makeTabBtn('constellation', '🌌 Const', 4));
        tabRow.appendChild(makeTabBtn('archive', '📁 Arch', 5));
        tabRow.appendChild(makeTabBtn('ribbon', '🎀 Pita'));
        container.appendChild(tabRow);

        // Tip bantuan
        var tip = document.createElement('div');
        tip.style.cssText = 'font-size:11px;color:#cbd5e1;background:rgba(255,255,255,0.05);padding:8px 10px;border-radius:6px;line-height:1.4;';
        if (_activeCategory === 'status') {
            tip.innerHTML = '💡 <b>Edit Scene Status (Halaman Kiri):</b><br>• Klik & drag posisi teks catatan atau bar HP/MP/TP langsung di layar!<br>• Panah keyboard untuk nudge 1px (Shift=5px).';
        } else if (_activeCategory === 'equip') {
            tip.innerHTML = '💡 <b>Edit Perlengkapan (Halaman Kanan):</b><br>• Klik & drag 7 slot perlengkapan, nyala jiwa Cyclops, atau senjata anchor!';
        } else if (_activeCategory === 'item') {
            tip.innerHTML = '💡 <b>Edit Jurnal Item:</b><br>• Klik & drag grid 24 slot, Polaroid art, judul & kategori item, serta kertas catatan lore!<br>• Panah keyboard untuk nudge 1px (Shift=5px).';
        } else if (_activeCategory === 'skill') {
            tip.innerHTML = '💡 <b>Edit Jurnal Skill:</b><br>• Klik & drag pita bookmark pojok kiri atas, grid 24 slot, Polaroid art, judul skill, dan catatan lore!<br>• Panah keyboard untuk nudge 1px (Shift=5px).';
        } else if (_activeCategory === 'constellation') {
            tip.innerHTML = '💡 <b>Edit Jurnal Constellation:</b><br>• Geser pohon konstelasi, node 0..4, 3 pita Romawi preset, ID card aktor, 3 pita kategori, dan grid 20 slot secara real time!';
        } else if (_activeCategory === 'archive') {
            tip.innerHTML = '💡 <b>Edit Jurnal Archive:</b><br>• Geser kartu Memories & Review petualangan, slot galeri polaroid, serta daftar & detail log petualangan!';
        } else {
            tip.innerHTML = '💡 <b>Edit Pita Tab Menu:</b><br>• Geser posisi Y dan X dari 8 pita menu di sisi kiri buku.';
        }
        container.appendChild(tip);

        // Target Select Dropdown
        var selectWrap = document.createElement('div');
        selectWrap.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
        var selectLabel = document.createElement('label');
        selectLabel.textContent = 'Pilih Elemen yang Diedit:';
        selectLabel.style.cssText = 'font-size:11px;color:#fda4af;font-weight:bold;';
        
        var select = document.createElement('select');
        select.id = 'yure-target-select';
        select.style.cssText = 'background:#1e293b;color:#fff;border:1px solid #475569;border-radius:6px;padding:6px;font-size:12px;outline:none;cursor:pointer;';
        
        var currentTargets = TARGET_DEFINITIONS[_activeCategory] || [];
        currentTargets.forEach(function(t) {
            var opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.label;
            if (t.id === _activeTarget) opt.selected = true;
            select.appendChild(opt);
        });

        select.onchange = function() {
            _activeTarget = select.value;
            updateCoordinateInputs();
            highlightTargetInGame();
        };

        selectWrap.appendChild(selectLabel);
        selectWrap.appendChild(select);
        container.appendChild(selectWrap);

        // Input Koordinat Row (X & Y, plus W untuk bar)
        var coordRow = document.createElement('div');
        coordRow.id = 'yure-coord-row';
        coordRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;';

        var xLabel = 'Koordinat X:';
        var yLabel = 'Koordinat Y:';
        if (_activeTarget === 'item_spacing' || _activeTarget === 'skill_spacing') {
            xLabel = 'Jarak Kolom X:';
            yLabel = 'Jarak Baris Y:';
        } else if (_activeTarget === 'item_lineHeight' || _activeTarget === 'skill_lineHeight') {
            xLabel = '(Tidak terpakai)';
            yLabel = 'Jarak Baris Lore:';
        } else if (_activeTarget.endsWith('_icon_size')) {
            xLabel = '(Tidak terpakai)';
            yLabel = 'Ukuran Ikon (px):';
        }

        var xWrap = document.createElement('div');
        xWrap.innerHTML = '<span style="font-size:11px;color:#94a3b8;">' + xLabel + '</span>';
        var inputX = document.createElement('input');
        inputX.id = 'yure-input-x';
        inputX.type = 'number';
        inputX.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #334155;color:#38bdf8;padding:6px;border-radius:6px;font-weight:bold;';
        if (_activeTarget === 'item_lineHeight' || _activeTarget === 'skill_lineHeight' || _activeTarget.endsWith('_icon_size')) inputX.disabled = true;
        inputX.oninput = function() {
            applyAbsoluteCoord(Number(inputX.value), null, null);
        };
        xWrap.appendChild(inputX);

        var yWrap = document.createElement('div');
        yWrap.innerHTML = '<span style="font-size:11px;color:#94a3b8;">' + yLabel + '</span>';
        var inputY = document.createElement('input');
        inputY.id = 'yure-input-y';
        inputY.type = 'number';
        inputY.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #334155;color:#38bdf8;padding:6px;border-radius:6px;font-weight:bold;';
        inputY.oninput = function() {
            applyAbsoluteCoord(null, Number(inputY.value), null);
        };
        yWrap.appendChild(inputY);

        coordRow.appendChild(xWrap);
        coordRow.appendChild(yWrap);

        // Jika Bar: tambahkan input Width
        if (_activeTarget.startsWith('bar_')) {
            coordRow.style.gridTemplateColumns = '1fr 1fr 1fr';
            var wWrap = document.createElement('div');
            wWrap.innerHTML = '<span style="font-size:11px;color:#94a3b8;">Lebar Bar:</span>';
            var inputW = document.createElement('input');
            inputW.id = 'yure-input-w';
            inputW.type = 'number';
            inputW.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #334155;color:#38bdf8;padding:6px;border-radius:6px;font-weight:bold;';
            inputW.oninput = function() {
                applyAbsoluteCoord(null, null, Number(inputW.value));
            };
            wWrap.appendChild(inputW);
            coordRow.appendChild(wWrap);
        }

        container.appendChild(coordRow);

        // Quick Category Switcher untuk Pita Bookmark Skill
        if (_activeTarget === 'skill_ribbon') {
            var catWrap = document.createElement('div');
            catWrap.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
            catWrap.innerHTML = '<span style="font-size:11px;color:#fda4af;font-weight:bold;">Ubah Kategori Pita Skill:</span>';
            var catRow = document.createElement('div');
            catRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;';
            var catList = [
                { idx: 0, label: '⚔️ Attack' },
                { idx: 1, label: '🛡️ Defends' },
                { idx: 2, label: '⭐ Special' }
            ];
            var scene = SceneManager._scene;
            catList.forEach(function(c) {
                var cBtn = document.createElement('button');
                cBtn.textContent = c.label;
                var isCur = (scene && scene._skillRibbonIndex === c.idx);
                cBtn.style.cssText = 'padding:6px;font-size:11px;font-weight:bold;border-radius:6px;border:none;cursor:pointer;' +
                    (isCur ? 'background:#ec4899;color:#fff;' : 'background:#1e293b;color:#94a3b8;border:1px solid #334155;');
                cBtn.onclick = function() {
                    if (scene && typeof scene.setSkillRibbon === 'function') {
                        scene.setSkillRibbon(c.idx);
                        buildPanelContent();
                    }
                };
                catRow.appendChild(cBtn);
            });
            catWrap.appendChild(catRow);
            container.appendChild(catWrap);
        }

        // Tombol Nudge Mini (+ / -)
        var nudgeRow = document.createElement('div');
        nudgeRow.style.cssText = 'display:flex;justify-content:center;gap:6px;';

        function makeNudgeBtn(lbl, dx, dy) {
            var b = document.createElement('button');
            b.textContent = lbl;
            b.style.cssText = 'background:#334155;color:#fff;border:none;border-radius:4px;padding:6px 12px;cursor:pointer;font-weight:bold;';
            b.onclick = function() { nudgeTarget(dx, dy); };
            return b;
        }

        nudgeRow.appendChild(makeNudgeBtn('◄ 1px', -1, 0));
        nudgeRow.appendChild(makeNudgeBtn('▲ 1px', 0, -1));
        nudgeRow.appendChild(makeNudgeBtn('▼ 1px', 0, 1));
        nudgeRow.appendChild(makeNudgeBtn('► 1px', 1, 0));
        container.appendChild(nudgeRow);

        // Action Buttons
        var btnWrap = document.createElement('div');
        btnWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:6px;';

        var saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 Simpan Permanen ke Game';
        saveBtn.style.cssText = 'background:linear-gradient(135deg, #059669, #047857);color:#fff;border:none;border-radius:6px;padding:9px;font-weight:bold;cursor:pointer;font-size:12px;box-shadow:0 4px 12px rgba(5,150,105,0.4);';
        saveBtn.onclick = saveJournalConfigPermanently;

        var copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 Salin Konfigurasi JSON';
        copyBtn.style.cssText = 'background:#1e293b;color:#cbd5e1;border:1px solid #475569;border-radius:6px;padding:7px;cursor:pointer;font-size:11px;';
        copyBtn.onclick = copyJournalConfigToClipboard;

        btnWrap.appendChild(saveBtn);
        btnWrap.appendChild(copyBtn);
        container.appendChild(btnWrap);

        // Status Feedback
        var status = document.createElement('div');
        status.id = 'yure-inspector-status';
        status.style.cssText = 'font-size:11px;color:#10b981;text-align:center;min-height:16px;';
        container.appendChild(status);

        updateCoordinateInputs();
        highlightTargetInGame();
    }

    // =========================================================================
    // 7. GET / SET TARGET KOORDINAT
    // =========================================================================
    function getTargetCoord(targetId) {
        if (isTitleMenuActive()) {
            var tcfg = window.YURE_TITLE_CONFIG;
            if (!tcfg) return { x: 0, y: 0 };
            if (targetId === 'title_nia')        return { x: tcfg.nia.x, y: tcfg.nia.y };
            if (targetId === 'title_shadow')     return { x: tcfg.shadow.x, y: tcfg.shadow.y };
            if (targetId === 'title_logo')       return { x: tcfg.logoRed.x, y: tcfg.logoRed.y };
            if (targetId === 'title_backShadow') return { x: tcfg.backShadow.x, y: tcfg.backShadow.y };
            if (targetId === 'title_cursor') {
                var cursorCfg = tcfg.cursor || { x: 0, y: 0 };
                return { x: cursorCfg.x || 0, y: cursorCfg.y || 0 };
            }
            if (targetId === 'title_redSplash')  return { x: tcfg.redSplash.x, y: tcfg.redSplash.y };
            if (targetId.startsWith('title_cmd_')) {
                var cKey = targetId.replace('title_cmd_', '');
                if (tcfg.commands[cKey]) return { x: tcfg.commands[cKey].x, y: tcfg.commands[cKey].y };
            }
            if (targetId === 'title_prompt')     return { x: tcfg.prompt.x, y: tcfg.prompt.y };
            if (targetId === 'title_copyright')  return { x: tcfg.copyright.x, y: tcfg.copyright.y };
            return { x: 0, y: 0 };
        }

        var cfg = getJournalMasterConfig();
        if (!cfg) return { x: 0, y: 0 };

        if (!cfg.itemJournal) {
            cfg.itemJournal = {
                grid: { startX: 37, startY: 27, spacingX: 110, spacingY: 104, cols: 4, rows: 6, slotW: 100, slotH: 96 },
                polaroid: { x: 53, y: 38, photoCX: 118, photoCY: 105, photoScale: 2.5 },
                title: { x: 300, nameY: 60, catY: 90, subY: 118 },
                description: { x: -2, y: 338, w: 508, h: 355, textX: 36, textY: 54, lineHeight: 29, maxLines: 8 }
            };
        }
        var ij = cfg.itemJournal;

        // Equip Icon Size
        if (targetId === 'equip_icon_size') return { x: 0, y: cfg.equipIconSize || 32 };

        // Item Journal Targets
        if (targetId === 'item_icon_size')          return { x: 0, y: ij.grid.iconSize || 56 };
        if (targetId === 'item_polaroid_icon_size') return { x: 0, y: ij.polaroid.iconSize || 100 };
        if (targetId === 'item_grid')       return { x: ij.grid.startX, y: ij.grid.startY };
        if (targetId === 'item_spacing')    return { x: ij.grid.spacingX, y: ij.grid.spacingY };
        if (targetId === 'item_polaroid')   return { x: ij.polaroid.x, y: ij.polaroid.y };
        if (targetId === 'item_title')      return { x: ij.title.x, y: ij.title.nameY };
        if (targetId === 'item_desc')       return { x: ij.description.x, y: ij.description.y };
        if (targetId === 'item_textOffset') return { x: ij.description.textX, y: ij.description.textY };
        if (targetId === 'item_lineHeight') return { x: 0, y: ij.description.lineHeight };

        if (!cfg.skillJournal) {
            cfg.skillJournal = {
                grid: { startX: 52, startY: 44, spacingX: 100, spacingY: 96, cols: 4, rows: 6, slotW: 90, slotH: 86, iconSize: 74 },
                polaroid: { x: 155, y: 135, rotation: -0.148, photoCX: 118, photoCY: 105, photoScale: 2.5, iconSize: 144 },
                title: { x: 277, nameY: 78, catY: 106, subY: 132 },
                description: { x: 35, y: 194, w: 508, h: 355, textX: 40, textY: 115, lineHeight: 34, maxLines: 7 },
                ribbons: { x: 268, y: 12 }
            };
        }
        var sj = cfg.skillJournal;

        // Skill Journal Targets
        if (targetId === 'skill_ribbon')            return { x: (sj.ribbons ? (sj.ribbons.x !== undefined ? sj.ribbons.x : 268) : 268), y: (sj.ribbons ? sj.ribbons.y : 12) };
        if (targetId === 'skill_icon_size')         return { x: 0, y: (sj.grid && sj.grid.iconSize) || 74 };
        if (targetId === 'skill_polaroid_icon_size')return { x: 0, y: (sj.polaroid && sj.polaroid.iconSize) || 144 };
        if (targetId === 'skill_grid')       return { x: sj.grid.startX, y: sj.grid.startY };
        if (targetId === 'skill_spacing')    return { x: sj.grid.spacingX, y: sj.grid.spacingY };
        if (targetId === 'skill_polaroid')   return { x: sj.polaroid.x, y: sj.polaroid.y };
        if (targetId === 'skill_title')      return { x: sj.title.x, y: sj.title.nameY };
        if (targetId === 'skill_desc')       return { x: sj.description.x, y: sj.description.y };
        if (targetId === 'skill_textOffset') return { x: sj.description.textX, y: sj.description.textY };
        if (targetId === 'skill_lineHeight') return { x: 0, y: sj.description.lineHeight };

        // Constellation Targets
        if (!cfg.constellationJournal) {
            cfg.constellationJournal = {
                tree: { x: 43, y: 18, w: 422, h: 613 },
                treeNodes: [
                    { id: 0, x: 74, y: 69, w: 143, h: 143, iconSize: 135 },
                    { id: 1, x: 245, y: 154, w: 143, h: 143, iconSize: 135 },
                    { id: 2, x: 75, y: 258, w: 143, h: 143, iconSize: 135 },
                    { id: 3, x: 244, y: 364, w: 143, h: 143, iconSize: 135 },
                    { id: 4, x: 74, y: 449, w: 143, h: 143, iconSize: 135 }
                ],
                romanRibbons: { x: 236, y: 510, w: 229, h: 205 },
                actorCard: { x: 14, y: 8, w: 250, h: 150 },
                categoryRibbons: { startX: 295, y: 4, spacing: 70, w: 49, h: 157 },
                grid: { startX: 12, startY: 146, cols: 4, rows: 5, spacingX: 122, spacingY: 98, slotW: 108, slotH: 92, iconSize: 76 }
            };
        }
        var cj = cfg.constellationJournal;
        if (targetId === 'const_tree') return { x: cj.tree.x, y: cj.tree.y };
        if (targetId.startsWith('const_node_')) {
            var nIdx = Number(targetId.replace('const_node_', ''));
            if (cj.treeNodes && cj.treeNodes[nIdx]) return { x: cj.treeNodes[nIdx].x, y: cj.treeNodes[nIdx].y };
        }
        if (targetId === 'const_romans') return { x: cj.romanRibbons.x, y: cj.romanRibbons.y };
        if (targetId === 'const_card') return { x: cj.actorCard.x, y: cj.actorCard.y };
        if (targetId === 'const_cat_ribbons') return { x: cj.categoryRibbons.startX, y: cj.categoryRibbons.y };
        if (targetId === 'const_grid') return { x: cj.grid.startX, y: cj.grid.startY };
        if (targetId === 'const_spacing') return { x: cj.grid.spacingX, y: cj.grid.spacingY };
        if (targetId === 'const_icon_size') return { x: 0, y: cj.grid.iconSize || 76 };

        if (!cfg.archiveJournal) {
            cfg.archiveJournal = {
                hub: { memories: { x: 25, y: 25, w: 458, h: 618 }, notes: { x: 25, y: 25, w: 458, h: 618 } },
                gallery: {
                    leftSlots: [
                        { x: 30, y: 45, w: 215, h: 265 }, { x: 260, y: 45, w: 215, h: 265 },
                        { x: 30, y: 340, w: 215, h: 265 }, { x: 260, y: 340, w: 215, h: 265 }
                    ],
                    rightSlots: [
                        { x: 30, y: 45, w: 215, h: 265 }, { x: 260, y: 45, w: 215, h: 265 },
                        { x: 30, y: 340, w: 215, h: 265 }, { x: 260, y: 340, w: 215, h: 265 }
                    ]
                },
                logs: {
                    list: { x: 20, y: 40, w: 468, rowH: 68, visibleRows: 7 },
                    detail: { x: 20, y: 40, w: 468, h: 580 }
                }
            };
        }
        var aj = cfg.archiveJournal;
        if (targetId === 'arch_hub_memories') return { x: aj.hub.memories.x, y: aj.hub.memories.y };
        if (targetId === 'arch_hub_notes') return { x: aj.hub.notes.x, y: aj.hub.notes.y };
        if (targetId === 'arch_gal_left') return { x: aj.gallery.leftSlots[0].x, y: aj.gallery.leftSlots[0].y };
        if (targetId === 'arch_gal_right') return { x: aj.gallery.rightSlots[0].x, y: aj.gallery.rightSlots[0].y };
        if (targetId === 'arch_logs_list') return { x: aj.logs.list.x, y: aj.logs.list.y };
        if (targetId === 'arch_logs_detail') return { x: aj.logs.detail.x, y: aj.logs.detail.y };

        // 0. Actor Name
        if (targetId === 'actor_name') {
            if (!cfg.actorName) cfg.actorName = { x: 240, y: 12 };
            return { x: cfg.actorName.x, y: cfg.actorName.y };
        }

        // 1. Note / Deskripsi
        if (targetId === 'note_all') {
            return { x: cfg.note.textX, y: cfg.note.titleY };
        }
        if (targetId === 'note_lines') {
            return { x: cfg.note.textX, y: cfg.note.lineYs[0] };
        }
        if (targetId === 'note_title') {
            return { x: cfg.note.textX, y: cfg.note.titleY };
        }
        if (targetId === 'note_item') {
            return { x: cfg.note.textX, y: cfg.note.itemY };
        }
        if (targetId === 'note_hint') {
            return { x: cfg.note.textX, y: cfg.note.hintY };
        }

        // 2. Bar Status
        if (targetId.startsWith('bar_')) {
            var bKey = targetId.replace('bar_', '');
            if (cfg.bars && cfg.bars[bKey]) {
                var b = cfg.bars[bKey];
                return { x: b.x, y: b.y, w: b.w };
            }
        }

        // 3. Polaroid
        if (targetId === 'polaroid') {
            return { x: cfg.polaroid.x, y: cfg.polaroid.y };
        }

        // 4. Slots
        var slot = cfg.slots.find(function(s) { return s.id === targetId; });
        if (slot) return { x: slot.x, y: slot.y };

        // 5. Soul Eye Flame
        if (targetId === 'soulFlame') {
            return { x: cfg.soulEye.x, y: cfg.soulEye.y };
        }

        // 6. Anchor Weapon
        if (targetId === 'anchorWeapon') {
            return { x: cfg.anchorWeapon.x, y: cfg.anchorWeapon.y };
        }

        // 7. Ribbons (ON vs OFF)
        if (targetId.startsWith('ribbon_off_')) {
            var rIdx = Number(targetId.replace('ribbon_off_', ''));
            if (cfg.ribbons && cfg.ribbons[rIdx]) {
                return { x: cfg.ribbons[rIdx].unselectedX !== undefined ? cfg.ribbons[rIdx].unselectedX : 185, y: cfg.ribbons[rIdx].y };
            }
        }
        if (targetId.startsWith('ribbon_on_') || targetId.startsWith('ribbon_')) {
            var rIdx = Number(targetId.replace('ribbon_on_', '').replace('ribbon_', ''));
            if (cfg.ribbons && cfg.ribbons[rIdx]) {
                return { x: cfg.ribbons[rIdx].selectedX !== undefined ? cfg.ribbons[rIdx].selectedX : 15, y: cfg.ribbons[rIdx].y };
            }
        }

        return { x: 0, y: 0 };
    }

    function nudgeTarget(dx, dy) {
        if (isTitleMenuActive()) {
            var tcfg = window.YURE_TITLE_CONFIG;
            var scene = SceneManager._scene;
            if (!tcfg || !scene) return;

            if (_activeTarget === 'title_nia') {
                tcfg.nia.x += dx;
                tcfg.nia.y += dy;
            } else if (_activeTarget === 'title_shadow') {
                tcfg.shadow.x += dx;
                tcfg.shadow.y += dy;
            } else if (_activeTarget === 'title_logo') {
                tcfg.logoRed.x += dx;
                tcfg.logoRed.y += dy;
                tcfg.logoWhite.x += dx;
                tcfg.logoWhite.y += dy;
            } else if (_activeTarget === 'title_backShadow') {
                tcfg.backShadow.x += dx;
                tcfg.backShadow.y += dy;
            } else if (_activeTarget === 'title_cursor') {
                if (!tcfg.cursor) tcfg.cursor = { x: 0, y: 0, scale: 1.0, rotation: 180 };
                tcfg.cursor.x += dx;
                tcfg.cursor.y += dy;
            } else if (_activeTarget === 'title_redSplash') {
                tcfg.redSplash.x += dx;
                tcfg.redSplash.y += dy;
            } else if (_activeTarget.startsWith('title_cmd_')) {
                var cKey = _activeTarget.replace('title_cmd_', '');
                if (tcfg.commands[cKey]) {
                    tcfg.commands[cKey].x += dx;
                    tcfg.commands[cKey].y += dy;
                }
            } else if (_activeTarget === 'title_prompt') {
                tcfg.prompt.x += dx;
                tcfg.prompt.y += dy;
            } else if (_activeTarget === 'title_copyright') {
                tcfg.copyright.x += dx;
                tcfg.copyright.y += dy;
            }
            if (scene.applyTitleConfigToSprites) scene.applyTitleConfigToSprites();
            updateCoordinateInputs();
            return;
        }

        var cfg = getJournalMasterConfig();
        var scene = SceneManager._scene;
        if (!cfg || !scene) return;

        // 0. Actor Name
        if (_activeTarget === 'actor_name') {
            if (!cfg.actorName) cfg.actorName = { x: 240, y: 12 };
            cfg.actorName.x += dx;
            cfg.actorName.y += dy;
            if (scene._statusActorNameSprite) {
                scene._statusActorNameSprite.x = cfg.actorName.x;
                scene._statusActorNameSprite.y = cfg.actorName.y;
            }
            if (scene.refreshStatusPage) scene.refreshStatusPage();
        } else if (_activeTarget === 'note_all') {
            cfg.note.textX += dx;
            cfg.note.statValX += dx;
            cfg.note.statBonusX += dx;
            cfg.note.titleY += dy;
            cfg.note.itemY += dy;
            for (var i = 0; i < cfg.note.lineYs.length; i++) {
                cfg.note.lineYs[i] += dy;
            }
            cfg.note.hintY += dy;
            if (scene.refreshLeftPage) scene.refreshLeftPage();
        } else if (_activeTarget === 'note_lines') {
            cfg.note.textX += dx;
            cfg.note.statValX += dx;
            cfg.note.statBonusX += dx;
            for (var i = 0; i < cfg.note.lineYs.length; i++) {
                cfg.note.lineYs[i] += dy;
            }
            if (scene.refreshLeftPage) scene.refreshLeftPage();
        } else if (_activeTarget === 'note_title') {
            cfg.note.textX += dx;
            cfg.note.titleY += dy;
            if (scene.refreshLeftPage) scene.refreshLeftPage();
        } else if (_activeTarget === 'note_item') {
            cfg.note.textX += dx;
            cfg.note.itemY += dy;
            if (scene.refreshLeftPage) scene.refreshLeftPage();
        } else if (_activeTarget === 'note_hint') {
            cfg.note.textX += dx;
            cfg.note.hintY += dy;
            if (scene.refreshLeftPage) scene.refreshLeftPage();
        } else if (_activeTarget.startsWith('bar_')) {
            var bKey = _activeTarget.replace('bar_', '');
            if (cfg.bars && cfg.bars[bKey]) {
                cfg.bars[bKey].x += dx;
                cfg.bars[bKey].y += dy;
                if (scene.refreshLeftPage) scene.refreshLeftPage();
            }
        } else if (_activeTarget === 'polaroid') {
            cfg.polaroid.x += dx;
            cfg.polaroid.y += dy;
            if (scene.refreshLeftPage) scene.refreshLeftPage();
        } else if (_activeTarget === 'soulFlame') {
            cfg.soulEye.x += dx;
            cfg.soulEye.y += dy;
            if (scene._soulEyeSprite) {
                scene._soulEyeSprite.x = cfg.soulEye.x;
                scene._soulEyeSprite.y = cfg.soulEye.y;
            }
            if (scene._soulAuraSprite) {
                scene._soulAuraSprite.x = cfg.soulEye.x;
                scene._soulAuraSprite.y = cfg.soulEye.y;
            }
            if (scene.refreshRightPage) scene.refreshRightPage();
        } else if (_activeTarget === 'anchorWeapon') {
            cfg.anchorWeapon.x += dx;
            cfg.anchorWeapon.y += dy;
            if (scene._anchorSprite) {
                scene._anchorSprite.x = cfg.anchorWeapon.x;
                scene._anchorSprite.y = cfg.anchorWeapon.y;
            }
            if (scene.refreshRightPage) scene.refreshRightPage();
        } else if (_activeTarget.startsWith('ribbon_off_')) {
            var rIdx = Number(_activeTarget.replace('ribbon_off_', ''));
            if (cfg.ribbons && cfg.ribbons[rIdx]) {
                cfg.ribbons[rIdx].unselectedX = Math.max(-50, Math.min(300, (cfg.ribbons[rIdx].unselectedX !== undefined ? cfg.ribbons[rIdx].unselectedX : 185) + dx));
                cfg.ribbons[rIdx].y += dy;
                if (scene.updateRibbonTargets) scene.updateRibbonTargets();
            }
        } else if (_activeTarget.startsWith('ribbon_on_') || _activeTarget.startsWith('ribbon_')) {
            var rIdx = Number(_activeTarget.replace('ribbon_on_', '').replace('ribbon_', ''));
            if (cfg.ribbons && cfg.ribbons[rIdx]) {
                cfg.ribbons[rIdx].selectedX = Math.max(-50, Math.min(300, (cfg.ribbons[rIdx].selectedX !== undefined ? cfg.ribbons[rIdx].selectedX : 15) + dx));
                cfg.ribbons[rIdx].peekX = cfg.ribbons[rIdx].selectedX;
                cfg.ribbons[rIdx].y += dy;
                if (scene.updateRibbonTargets) scene.updateRibbonTargets();
            }
        } else if (_activeTarget === 'equip_icon_size') {
            cfg.equipIconSize = Math.max(16, Math.min(96, (cfg.equipIconSize || 32) + dy));
            if (scene.refreshRightPage) scene.refreshRightPage();
        } else if (_activeTarget.startsWith('item_')) {
            var ij = cfg.itemJournal;
            if (ij) {
                if (_activeTarget === 'item_icon_size') {
                    if (!ij.grid) ij.grid = {};
                    ij.grid.iconSize = Math.max(16, Math.min(96, (ij.grid.iconSize || 56) + dy));
                    if (scene.refreshItemPage) scene.refreshItemPage();
                    else if (scene.refreshAll) scene.refreshAll();
                } else if (_activeTarget === 'item_polaroid_icon_size') {
                    if (!ij.polaroid) ij.polaroid = {};
                    ij.polaroid.iconSize = Math.max(32, Math.min(220, (ij.polaroid.iconSize || 100) + dy));
                    if (scene.refreshItemPage) scene.refreshItemPage();
                    else if (scene.refreshAll) scene.refreshAll();
                } else if (_activeTarget === 'item_grid') {
                    ij.grid.startX += dx;
                    ij.grid.startY += dy;
                    if (scene.refreshAll) scene.refreshAll();
                } else if (_activeTarget === 'item_spacing') {
                    ij.grid.spacingX += dx;
                    ij.grid.spacingY += dy;
                    if (scene.refreshAll) scene.refreshAll();
                } else if (_activeTarget === 'item_polaroid') {
                    ij.polaroid.x += dx;
                    ij.polaroid.y += dy;
                    if (scene.refreshAll) scene.refreshAll();
                } else if (_activeTarget === 'item_title') {
                    ij.title.x += dx;
                    ij.title.nameY += dy;
                    ij.title.catY += dy;
                    ij.title.subY += dy;
                    if (scene.refreshAll) scene.refreshAll();
                } else if (_activeTarget === 'item_desc') {
                    ij.description.x += dx;
                    ij.description.y += dy;
                    if (scene.refreshAll) scene.refreshAll();
                } else if (_activeTarget === 'item_textOffset') {
                    ij.description.textX += dx;
                    ij.description.textY += dy;
                    if (scene.refreshAll) scene.refreshAll();
                } else if (_activeTarget === 'item_lineHeight') {
                    ij.description.lineHeight = Math.max(10, ij.description.lineHeight + dy);
                    if (scene.refreshAll) scene.refreshAll();
                }
            }
        } else if (_activeTarget.startsWith('skill_')) {
            var sj = cfg.skillJournal;
            if (sj) {
                if (_activeTarget === 'skill_ribbon') {
                    if (!sj.ribbons) sj.ribbons = { x: 268, y: 12 };
                    sj.ribbons.x = Math.max(10, Math.min(1200, (sj.ribbons.x !== undefined ? sj.ribbons.x : 268) + dx));
                    sj.ribbons.y = Math.max(-50, Math.min(600, sj.ribbons.y + dy));
                    if (scene._skillSingleRibbonSprite) {
                        scene._skillSingleRibbonSprite.x = sj.ribbons.x;
                        scene._skillSingleRibbonSprite.y = sj.ribbons.y;
                        scene._skillSingleRibbonSprite.visible = true;
                        scene._skillSingleRibbonSprite.opacity = 255;
                    }
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                } else if (_activeTarget === 'skill_icon_size') {
                    if (!sj.grid) sj.grid = {};
                    sj.grid.iconSize = Math.max(16, Math.min(96, (sj.grid.iconSize || 74) + dy));
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                } else if (_activeTarget === 'skill_polaroid_icon_size') {
                    if (!sj.polaroid) sj.polaroid = {};
                    sj.polaroid.iconSize = Math.max(32, Math.min(220, (sj.polaroid.iconSize || 144) + dy));
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                } else if (_activeTarget === 'skill_grid') {
                    sj.grid.startX += dx;
                    sj.grid.startY += dy;
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                } else if (_activeTarget === 'skill_spacing') {
                    sj.grid.spacingX += dx;
                    sj.grid.spacingY += dy;
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                } else if (_activeTarget === 'skill_polaroid') {
                    sj.polaroid.x += dx;
                    sj.polaroid.y += dy;
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                } else if (_activeTarget === 'skill_title') {
                    sj.title.x += dx;
                    sj.title.nameY += dy;
                    sj.title.catY += dy;
                    sj.title.subY += dy;
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                } else if (_activeTarget === 'skill_desc') {
                    sj.description.x += dx;
                    sj.description.y += dy;
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                } else if (_activeTarget === 'skill_textOffset') {
                    sj.description.textX += dx;
                    sj.description.textY += dy;
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                } else if (_activeTarget === 'skill_lineHeight') {
                    sj.description.lineHeight = Math.max(10, sj.description.lineHeight + dy);
                    if (scene.refreshSkillPage) scene.refreshSkillPage();
                }
            }
        } else if (_activeTarget.startsWith('arch_')) {
            var aj = cfg.archiveJournal;
            if (aj) {
                if (_activeTarget === 'arch_hub_memories') {
                    aj.hub.memories.x += dx; aj.hub.memories.y += dy;
                } else if (_activeTarget === 'arch_hub_notes') {
                    aj.hub.notes.x += dx; aj.hub.notes.y += dy;
                } else if (_activeTarget === 'arch_gal_left') {
                    aj.gallery.leftSlots.forEach(function(s) { s.x += dx; s.y += dy; });
                } else if (_activeTarget === 'arch_gal_right') {
                    aj.gallery.rightSlots.forEach(function(s) { s.x += dx; s.y += dy; });
                } else if (_activeTarget === 'arch_logs_list') {
                    aj.logs.list.x += dx; aj.logs.list.y += dy;
                } else if (_activeTarget === 'arch_logs_detail') {
                    aj.logs.detail.x += dx; aj.logs.detail.y += dy;
                }
                if (scene && typeof scene.refreshArchivePage === 'function') {
                    scene.refreshArchivePage();
                }
            }
        } else if (_activeTarget.startsWith('const_')) {
            var cj = cfg.constellationJournal;
            if (cj) {
                if (_activeTarget === 'const_tree') {
                    cj.tree.x += dx; cj.tree.y += dy;
                } else if (_activeTarget.startsWith('const_node_')) {
                    var nIdx = Number(_activeTarget.replace('const_node_', ''));
                    if (cj.treeNodes && cj.treeNodes[nIdx]) {
                        cj.treeNodes[nIdx].x += dx; cj.treeNodes[nIdx].y += dy;
                    }
                } else if (_activeTarget === 'const_romans') {
                    cj.romanRibbons.x += dx; cj.romanRibbons.y += dy;
                } else if (_activeTarget === 'const_card') {
                    cj.actorCard.x += dx; cj.actorCard.y += dy;
                } else if (_activeTarget === 'const_cat_ribbons') {
                    cj.categoryRibbons.startX += dx; cj.categoryRibbons.y += dy;
                } else if (_activeTarget === 'const_grid') {
                    cj.grid.startX += dx; cj.grid.startY += dy;
                } else if (_activeTarget === 'const_spacing') {
                    cj.grid.spacingX += dx; cj.grid.spacingY += dy;
                } else if (_activeTarget === 'const_icon_size') {
                    cj.grid.iconSize = Math.max(16, Math.min(120, (cj.grid.iconSize || 76) + dy));
                }
                if (scene && typeof scene.refreshConstellationPage === 'function') {
                    scene.refreshConstellationPage();
                }
            }
        } else {
            // Slot
            var s = cfg.slots.find(function(item) { return item.id === _activeTarget; });
            if (s) {
                s.x += dx;
                s.y += dy;
                if (scene.refreshRightPage) scene.refreshRightPage();
            }
        }

        updateCoordinateInputs();
        highlightTargetInGame();
    }

    function applyAbsoluteCoord(newX, newY, newW) {
        var cur = getTargetCoord(_activeTarget);
        var dx = (newX !== null && !isNaN(newX)) ? (newX - cur.x) : 0;
        var dy = (newY !== null && !isNaN(newY)) ? (newY - cur.y) : 0;

        if (isTitleMenuActive() && newW !== null && !isNaN(newW)) {
            var tcfg = window.YURE_TITLE_CONFIG;
            if (tcfg) {
                if (_activeTarget === 'title_nia') tcfg.nia.scale = newW;
                else if (_activeTarget === 'title_shadow') tcfg.shadow.scale = newW;
                else if (_activeTarget === 'title_logo') { tcfg.logoRed.scale = newW; tcfg.logoWhite.scale = newW; }
                else if (_activeTarget === 'title_cursor') {
                    if (!tcfg.cursor) tcfg.cursor = { x: 0, y: 0, scale: 1.0, rotation: 180 };
                    tcfg.cursor.scale = newW;
                }
                else if (_activeTarget.startsWith('title_cmd_')) {
                    var cKey = _activeTarget.replace('title_cmd_', '');
                    if (tcfg.commands[cKey]) tcfg.commands[cKey].scale = newW;
                }
                if (SceneManager._scene && SceneManager._scene.applyTitleConfigToSprites) {
                    SceneManager._scene.applyTitleConfigToSprites();
                }
            }
        }

        if (_activeTarget.startsWith('bar_') && newW !== null && !isNaN(newW)) {
            var cfg = getJournalMasterConfig();
            var bKey = _activeTarget.replace('bar_', '');
            if (cfg && cfg.bars && cfg.bars[bKey]) {
                cfg.bars[bKey].w = newW;
            }
        }

        nudgeTarget(dx, dy);
    }

    function updateCoordinateInputs() {
        var cur = getTargetCoord(_activeTarget);
        var inX = document.getElementById('yure-input-x');
        var inY = document.getElementById('yure-input-y');
        var inW = document.getElementById('yure-input-w');
        var inScale = document.getElementById('yure-input-scale');

        if (inX) inX.value = cur.x;
        if (inY) inY.value = cur.y;
        if (inW && cur.w != null) inW.value = cur.w;

        if (isTitleMenuActive() && inScale) {
            var tcfg = window.YURE_TITLE_CONFIG;
            if (tcfg) {
                var sc = 1.0;
                if (_activeTarget === 'title_nia') sc = tcfg.nia.scale;
                else if (_activeTarget === 'title_shadow') sc = tcfg.shadow.scale;
                else if (_activeTarget === 'title_logo') sc = tcfg.logoRed.scale;
                else if (_activeTarget === 'title_cursor') sc = (tcfg.cursor && tcfg.cursor.scale) || 1.0;
                else if (_activeTarget.startsWith('title_cmd_')) {
                    var cKey = _activeTarget.replace('title_cmd_', '');
                    if (tcfg.commands[cKey]) sc = tcfg.commands[cKey].scale;
                }
                inScale.value = sc || 1.0;
            }
        }
    }

    function highlightTargetInGame() {
        var scene = SceneManager._scene;
        if (!scene || !isJournalActive()) return;

        var cfg = getJournalMasterConfig();
        if (!cfg) return;

        if (isStatusJournalActive()) {
            // Jika slot dipilih, arahkan kursor reticle ke slot tersebut
            var slotIdx = cfg.slots.findIndex(function(s) { return s.id === _activeTarget; });
            if (slotIdx >= 0) {
                scene._selectedSlotIndex = slotIdx;
                if (scene._slotReticleSprite) {
                    scene._slotReticleSprite.visible = true;
                }
            }
        } else if (isItemJournalActive()) {
            if (_activeTarget === 'item_grid') {
                scene._focusMode = 'slots';
                if (scene.refreshAll) scene.refreshAll();
            } else if (_activeTarget.startsWith('ribbon_')) {
                var rIdx = Number(_activeTarget.replace('ribbon_', ''));
                scene._selectedRibbonIndex = rIdx;
                scene._focusMode = 'ribbon';
                if (scene.drawRibbonTabs) scene.drawRibbonTabs();
            }
        }
    }

    // =========================================================================
    // 8. INTERACTIVE CANVAS LAYER (DRAG & DROP SEMUA ELEMEN)
    // =========================================================================
    var _canvasOverlay = null;

    function attachCanvasInteractiveLayer() {
        if (_canvasOverlay) return;
        var canvas = Graphics._canvas;
        if (!canvas) return;

        _canvasOverlay = document.createElement('div');
        _canvasOverlay.id = 'yure-canvas-drag-layer';
        _canvasOverlay.style.cssText = [
            'position:fixed',
            'top:' + canvas.offsetTop + 'px',
            'left:' + canvas.offsetLeft + 'px',
            'width:' + canvas.offsetWidth + 'px',
            'height:' + canvas.offsetHeight + 'px',
            'z-index:999990',
            'cursor:crosshair'
        ].join(';');

        _canvasOverlay.addEventListener('mousedown', onCanvasMouseDown);
        window.addEventListener('mousemove', onCanvasMouseMove);
        window.addEventListener('mouseup', onCanvasMouseUp);

        document.body.appendChild(_canvasOverlay);
    }

    function detachCanvasInteractiveLayer() {
        if (_canvasOverlay && _canvasOverlay.parentNode) {
            _canvasOverlay.parentNode.removeChild(_canvasOverlay);
        }
        _canvasOverlay = null;
        window.removeEventListener('mousemove', onCanvasMouseMove);
        window.removeEventListener('mouseup', onCanvasMouseUp);
    }

    function onCanvasMouseDown(e) {
        if (!isJournalActive() && !isTitleMenuActive()) return;
        var scene = SceneManager._scene;
        if (!scene) return;

        var canvasRect = Graphics._canvas.getBoundingClientRect();
        var clientX = e.clientX - canvasRect.left;
        var clientY = e.clientY - canvasRect.top;

        if (isTitleMenuActive()) {
            _isDraggingElement = true;
            _dragStartMouse = { x: clientX, y: clientY };
            var inX = document.getElementById('yure-input-x');
            var inY = document.getElementById('yure-input-y');
            _dragStartCoord = {
                x: inX ? Number(inX.value) : 0,
                y: inY ? Number(inY.value) : 0
            };
            return;
        }

        var scale = scene._journalScale || 1;
        var root = scene._journalRoot || { x: 0, y: 0 };

        var mx = (clientX - root.x) / scale;
        var my = (clientY - root.y) / scale;

        var cfg = getJournalMasterConfig();
        if (!cfg) return;

        // --- INTERAKSI MOUSE PADA SCENE ITEM JOURNAL ---
        if (isItemJournalActive()) {
            var ij = cfg.itemJournal;
            if (!ij) return;

            // 1. Klik Halaman Kiri (Grid Slot Column_.png)
            if (mx >= 239 && mx < 740) {
                var lx = mx - 239;
                var ly = my - 21;
                if (lx >= 0 && lx <= 508 && ly >= 0 && ly <= 668) {
                    var col = Math.floor((lx - ij.grid.startX) / ij.grid.spacingX);
                    var row = Math.floor((ly - ij.grid.startY) / ij.grid.spacingY);
                    if (col >= 0 && col < ij.grid.cols && row >= 0 && row < ij.grid.rows) {
                        var clickedSlot = row * ij.grid.cols + col;
                        scene._selectedSlotIndex = clickedSlot;
                        scene._focusMode = 'slots';
                        scene.refreshAll();
                    }
                    switchActiveElement('item', 'item_grid', lx, ly);
                    return;
                }
            }

            // 2. Klik Halaman Kanan (Polaroid, Judul, Kertas Catatan)
            if (mx >= 746) {
                var rx = mx - 746;
                var ry = my - 23;

                // Polaroid
                if (rx >= ij.polaroid.x && rx <= ij.polaroid.x + 233 && ry >= ij.polaroid.y && ry <= ij.polaroid.y + 257) {
                    switchActiveElement('item', 'item_polaroid', rx, ry);
                    return;
                }
                // Judul & Kategori
                if (rx >= ij.title.x && ry >= 20 && ry <= 220) {
                    switchActiveElement('item', 'item_title', rx, ry);
                    return;
                }
                // Kertas Catatan Lore
                if (ry >= ij.description.y - 15) {
                    switchActiveElement('item', 'item_desc', rx, ry);
                    return;
                }
            }

            // 3. Ribbon Tabs
            if (mx < 239) {
                for (var r = 0; r < cfg.ribbons.length; r++) {
                    var rb = cfg.ribbons[r];
                    if (Math.abs(my - (rb.y + 40)) <= 28) {
                        switchActiveElement('ribbon', 'ribbon_' + r, mx, my);
                        return;
                    }
                }
            }
            return;
        }

        // --- INTERAKSI MOUSE PADA SCENE SKILL JOURNAL ---
        if (isSkillJournalActive()) {
            var sj = cfg.skillJournal;
            if (!sj) return;

            // 1. Klik Pita Skill di Pojok Kiri Atas
            var ribCfg = sj.ribbons || { x: 268, y: 12 };
            if (mx >= ribCfg.x - 20 && mx <= ribCfg.x + 160 && my >= ribCfg.y - 10 && my <= ribCfg.y + 120) {
                switchActiveElement('skill', 'skill_ribbon', mx, my);
                return;
            }

            // 2. Klik Halaman Kiri (Grid Slot Skill)
            if (mx >= 239 && mx < 740) {
                var lx = mx - 239;
                var ly = my - 21;
                if (lx >= 0 && lx <= 508 && ly >= 0 && ly <= 668) {
                    var col = Math.floor((lx - sj.grid.startX) / sj.grid.spacingX);
                    var row = Math.floor((ly - sj.grid.startY) / sj.grid.spacingY);
                    if (col >= 0 && col < sj.grid.cols && row >= 0 && row < sj.grid.rows) {
                        var clickedSlot = row * sj.grid.cols + col;
                        var sList = scene.getSkillList ? scene.getSkillList() : [];
                        if (clickedSlot < sList.length) {
                            scene._skillSlotIndex = clickedSlot;
                            scene._focusMode = 'slots';
                            scene.refreshSkillPage();
                        }
                    }
                    switchActiveElement('skill', 'skill_grid', lx, ly);
                    return;
                }
            }

            // 3. Klik Halaman Kanan (Polaroid, Judul, Kertas Catatan)
            if (mx >= 746) {
                var rx = mx - 746;
                var ry = my - 23;

                // Polaroid
                if (rx >= sj.polaroid.x && rx <= sj.polaroid.x + 233 && ry >= sj.polaroid.y && ry <= sj.polaroid.y + 257) {
                    if (_activeTarget === 'skill_polaroid_icon_size') {
                        _isDraggingElement = true;
                        _dragStartMouse = { x: rx, y: ry };
                        _dragStartCoord = getTargetCoord('skill_polaroid_icon_size');
                    } else {
                        switchActiveElement('skill', 'skill_polaroid', rx, ry);
                    }
                    return;
                }
                // Judul & Kategori
                if (rx >= sj.title.x && ry >= 20 && ry <= 220) {
                    switchActiveElement('skill', 'skill_title', rx, ry);
                    return;
                }
                // Kertas Catatan Lore
                if (ry >= sj.description.y - 15) {
                    switchActiveElement('skill', 'skill_desc', rx, ry);
                    return;
                }
            }

            // 4. Ribbon Tabs (Samping Kiri Layar)
            if (mx < 239) {
                for (var r = 0; r < cfg.ribbons.length; r++) {
                    var rb = cfg.ribbons[r];
                    if (Math.abs(my - (rb.y + 40)) <= 28) {
                        switchActiveElement('ribbon', 'ribbon_' + r, mx, my);
                        return;
                    }
                }
            }
            return;
        }

        // 1. KLIK PADA HALAMAN KIRI (Status, Gauges, Note)
        if (mx >= 239 && mx < 740) {
            var lx = mx - 239;
            var ly = my - 21;

            // Deteksi Nama Karakter (Actor Name Badge)
            var nX = (cfg.actorName && cfg.actorName.x !== undefined) ? cfg.actorName.x : 240;
            var nY = (cfg.actorName && cfg.actorName.y !== undefined) ? cfg.actorName.y : 12;
            if (lx >= nX && lx <= nX + 240 && ly >= nY && ly <= nY + 90) {
                switchActiveElement('status', 'actor_name', lx, ly);
                return;
            }

            // Deteksi Polaroid
            if (lx >= 70 && lx <= 290 && ly >= 10 && ly <= 215) {
                switchActiveElement('status', 'polaroid', lx, ly);
                return;
            }

            // Deteksi 4 Bar Status
            if (lx >= 290 && lx <= 485 && ly >= 90 && ly <= 270) {
                if (ly <= 125)      switchActiveElement('status', 'bar_hp', lx, ly);
                else if (ly <= 168) switchActiveElement('status', 'bar_mana', lx, ly);
                else if (ly <= 215) switchActiveElement('status', 'bar_rage', lx, ly);
                else                switchActiveElement('status', 'bar_mental', lx, ly);
                return;
            }

            // Deteksi Teks Catatan / Deskripsi
            if (ly >= 320) {
                if (ly <= 360)      switchActiveElement('status', 'note_title', lx, ly);
                else if (ly <= 395) switchActiveElement('status', 'note_item', lx, ly);
                else if (ly <= 605) switchActiveElement('status', 'note_lines', lx, ly);
                else                switchActiveElement('status', 'note_hint', lx, ly);
                return;
            }
        }

        // 2. KLIK PADA HALAMAN KANAN (Slots, Soul Flame, Anchor)
        if (mx >= 746) {
            var rx = mx - 746;
            var ry = my - 23;

            // Deteksi Soul Eye
            var eyeDist = Math.hypot(rx - cfg.soulEye.x, ry - cfg.soulEye.y);
            if (eyeDist <= 70) {
                switchActiveElement('equip', 'soulFlame', rx, ry);
                return;
            }

            // Deteksi 7 Slots
            for (var i = 0; i < cfg.slots.length; i++) {
                var s = cfg.slots[i];
                var sDist = Math.hypot(rx - s.x, ry - s.y);
                if (sDist <= 48) {
                    switchActiveElement('equip', s.id, rx, ry);
                    return;
                }
            }
        }

        // 3. KLIK PADA RIBBON TABS
        if (mx < 239) {
            for (var r = 0; r < cfg.ribbons.length; r++) {
                var rb = cfg.ribbons[r];
                if (Math.abs(my - (rb.y + 40)) <= 28) {
                    switchActiveElement('ribbon', 'ribbon_' + r, mx, my);
                    return;
                }
            }
        }
    }

    function switchActiveElement(catId, targetId, mouseX, mouseY) {
        _activeCategory = catId;
        _activeTarget = targetId;
        _isDraggingElement = true;
        _dragStartMouse = { x: mouseX, y: mouseY };
        _dragStartCoord = getTargetCoord(targetId);

        buildPanelContent();
    }

    function onCanvasMouseMove(e) {
        if (!_isDraggingElement) return;
        var scene = SceneManager._scene;
        if (!scene) return;

        var canvasRect = Graphics._canvas.getBoundingClientRect();
        var clientX = e.clientX - canvasRect.left;
        var clientY = e.clientY - canvasRect.top;

        if (isTitleMenuActive()) {
            var deltaX = Math.round(clientX - _dragStartMouse.x);
            var deltaY = Math.round(clientY - _dragStartMouse.y);
            applyAbsoluteCoord(_dragStartCoord.x + deltaX, _dragStartCoord.y + deltaY, null);
            var inX = document.getElementById('yure-input-x');
            var inY = document.getElementById('yure-input-y');
            if (inX) inX.value = _dragStartCoord.x + deltaX;
            if (inY) inY.value = _dragStartCoord.y + deltaY;
            return;
        }

        if (!isJournalActive()) return;

        var scale = scene._journalScale || 1;
        var root = scene._journalRoot || { x: 0, y: 0 };

        var mx = (clientX - root.x) / scale;
        var my = (clientY - root.y) / scale;

        var curMouse = { x: 0, y: 0 };
        if (_activeTarget === 'skill_ribbon') {
            // Pita skill di pojok kiri atas menggunakan koordinat layar mutlak (screen coordinates)
            curMouse.x = mx;
            curMouse.y = my;
        } else if (mx >= 746) {
            curMouse.x = mx - 746;
            curMouse.y = my - 23;
        } else if (mx >= 239) {
            curMouse.x = mx - 239;
            curMouse.y = my - 21;
        } else {
            curMouse.x = mx;
            curMouse.y = my;
        }

        var deltaX = Math.round(curMouse.x - _dragStartMouse.x);
        var deltaY = Math.round(curMouse.y - _dragStartMouse.y);

        var targetNewX = _dragStartCoord.x + deltaX;
        var targetNewY = _dragStartCoord.y + deltaY;

        applyAbsoluteCoord(targetNewX, targetNewY, null);
    }

    function onCanvasMouseUp() {
        _isDraggingElement = false;
    }

    // =========================================================================
    // 9. PENYIMPANAN PERMANEN (DUAL-PERSISTENCE + DIRECT CODE PATCHING)
    // =========================================================================
    function saveJournalConfigPermanently() {
        var statusEl = document.getElementById('yure-inspector-status');
        if (statusEl) statusEl.textContent = 'Menyimpan permanen...';

        try {
            var cfg = getJournalMasterConfig();
            if (!cfg) throw new Error('Konfigurasi tidak ditemukan');

            // 1. Simpan ke data/Yure_JournalConfig.json (Primary)
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(JOURNAL_CFG_PATH, JSON.stringify(cfg, null, 2), 'utf8');

            // 2. Simpan ke data/ di workspace #3 (Secondary Sync)
            try {
                if (fs.existsSync(SYNC_WORKSPACE_PATH)) {
                    if (!fs.existsSync(SYNC_DATA_DIR)) fs.mkdirSync(SYNC_DATA_DIR, { recursive: true });
                    fs.writeFileSync(SYNC_JOURNAL_CFG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
                }
            } catch(e) {}

            // 3. Simpan juga ke localStorage
            try {
                localStorage.setItem('Yure_JournalConfig', JSON.stringify(cfg));
            } catch(e) {}

            // 4. Patch langsung ke berkas kode sumber js/plugins/Yure_StatusJournal.js
            patchPluginSourceCode(cfg);

            if (statusEl) {
                statusEl.textContent = '✅ Berhasil disimpan permanen!';
                setTimeout(function() { if (statusEl) statusEl.textContent = ''; }, 3500);
            }
        } catch(err) {
            console.error('[VisualInspector] Save error:', err);
            if (statusEl) statusEl.textContent = '❌ Gagal: ' + err.message;
        }
    }

    function saveTitleConfigPermanently() {
        var statusEl = document.getElementById('yure-inspector-status');
        if (statusEl) statusEl.textContent = 'Menyimpan konfigurasi Title...';

        try {
            var cfg = window.YURE_TITLE_CONFIG;
            if (!cfg) throw new Error('Konfigurasi Title tidak ditemukan');

            // 1. Simpan ke data/Yure_TitleConfig.json (Primary)
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(TITLE_CFG_PATH, JSON.stringify(cfg, null, 2), 'utf8');

            // 2. Simpan ke workspace #3 (Secondary Sync)
            try {
                if (fs.existsSync(SYNC_WORKSPACE_PATH)) {
                    if (!fs.existsSync(SYNC_DATA_DIR)) fs.mkdirSync(SYNC_DATA_DIR, { recursive: true });
                    fs.writeFileSync(SYNC_TITLE_CFG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
                }
            } catch(e) {}

            // 3. Simpan juga ke localStorage
            try {
                localStorage.setItem('Yure_TitleConfig', JSON.stringify(cfg));
            } catch(e) {}

            if (statusEl) {
                statusEl.textContent = '✅ Berhasil disimpan permanen!';
                setTimeout(function() { if (statusEl) statusEl.textContent = ''; }, 3500);
            }
        } catch(err) {
            console.error('[VisualInspector] Save title error:', err);
            if (statusEl) statusEl.textContent = '❌ Gagal: ' + err.message;
        }
    }

    function patchPluginSourceCode(cfg) {
        [JOURNAL_PLUGIN_PATH, SYNC_JOURNAL_PLUGIN_PATH].forEach(function(filePath) {
            try {
                if (fs.existsSync(filePath)) {
                    var code = fs.readFileSync(filePath, 'utf8');

                    var reg = new RegExp('var STATUS_JOURNAL_CONFIG = \\{[\\s\\S]*?\\};[\\r\\n\\s]*var JOURNAL_SLOTS = STATUS_JOURNAL_CONFIG\\.slots;');
                    code = code.replace(
                        reg,
                        'var STATUS_JOURNAL_CONFIG = ' + JSON.stringify(cfg, null, 8) + ';\n    var JOURNAL_SLOTS = STATUS_JOURNAL_CONFIG.slots;'
                    );

                    fs.writeFileSync(filePath, code, 'utf8');
                    console.log('[VisualInspector] Source patched:', filePath);
                }
            } catch(e) {
                console.warn('[VisualInspector] Could not patch', filePath, e);
            }
        });
    }

    function copyJournalConfigToClipboard() {
        var statusEl = document.getElementById('yure-inspector-status');
        try {
            var cfg = getJournalMasterConfig();
            var text = JSON.stringify(cfg, null, 2);
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
                if (statusEl) statusEl.textContent = '📋 JSON berhasil disalin!';
            }
        } catch(e) {}
    }

    // =========================================================================
    // 10. GENERAL PLUGIN EDITOR
    // =========================================================================
    function buildGeneralPluginEditorBody(container) {
        var tip = document.createElement('div');
        tip.style.cssText = 'font-size:11px;color:#94a3b8;background:rgba(255,255,255,0.05);padding:8px;border-radius:6px;';
        tip.textContent = 'Pilih plugin dan sesuaikan parameter. Disimpan ke data/DevPluginOverrides.json agar kebal dari save RPG Maker MV.';
        container.appendChild(tip);

        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '🔍 Cari nama plugin / parameter...';
        searchInput.style.cssText = 'width:100%;box-sizing:border-box;background:#0f172a;border:1px solid #334155;color:#f8fafc;padding:6px 10px;border-radius:6px;font-size:12px;outline:none;';
        container.appendChild(searchInput);

        var listContainer = document.createElement('div');
        listContainer.style.cssText = 'display:flex;flex-direction:column;gap:8px;max-height:45vh;overflow-y:auto;';
        container.appendChild(listContainer);

        function renderList(query) {
            listContainer.innerHTML = '';
            var plugins = $plugins.filter(function(p) { return p.status && p.parameters; });

            plugins.forEach(function(p) {
                var pKeys = Object.keys(p.parameters);
                if (pKeys.length === 0) return;

                if (query && p.name.toLowerCase().indexOf(query) === -1) {
                    var matchAny = pKeys.some(function(k) { return k.toLowerCase().indexOf(query) !== -1; });
                    if (!matchAny) return;
                }

                var group = document.createElement('details');
                group.style.cssText = 'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:6px;';
                var summary = document.createElement('summary');
                summary.style.cssText = 'font-weight:bold;color:#38bdf8;cursor:pointer;font-size:12px;';
                summary.textContent = p.name + ' (' + pKeys.length + ')';
                group.appendChild(summary);

                pKeys.forEach(function(k) {
                    if (query && k.toLowerCase().indexOf(query) === -1 && p.name.toLowerCase().indexOf(query) === -1) return;

                    var row = document.createElement('div');
                    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);';

                    var kLabel = document.createElement('span');
                    kLabel.style.cssText = 'font-size:11px;color:#94a3b8;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
                    kLabel.textContent = k;

                    var vInput = document.createElement('input');
                    vInput.type = 'text';
                    vInput.value = p.parameters[k];
                    vInput.style.cssText = 'width:120px;background:#0f172a;border:1px solid #334155;color:#f8fafc;padding:3px 6px;border-radius:4px;font-size:11px;';
                    vInput.onchange = function() {
                        p.parameters[k] = vInput.value;
                        saveGeneralPluginOverride(p.name, k, vInput.value);
                    };

                    row.appendChild(kLabel);
                    row.appendChild(vInput);
                    group.appendChild(row);
                });

                listContainer.appendChild(group);
            });
        }

        searchInput.oninput = function() {
            renderList(searchInput.value.toLowerCase().trim());
        };
        renderList('');
    }

    function saveGeneralPluginOverride(pluginName, paramKey, val) {
        try {
            var overrides = {};
            if (fs.existsSync(OVERRIDES_PATH)) {
                overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')) || {};
            }
            if (!overrides[pluginName]) overrides[pluginName] = {};
            overrides[pluginName][paramKey] = val;

            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2), 'utf8');

            try {
                if (fs.existsSync(SYNC_WORKSPACE_PATH)) {
                    if (!fs.existsSync(SYNC_DATA_DIR)) fs.mkdirSync(SYNC_DATA_DIR, { recursive: true });
                    fs.writeFileSync(SYNC_OVERRIDES_PATH, JSON.stringify(overrides, null, 2), 'utf8');
                }
            } catch(e) {}

            console.log('[VisualInspector] Override saved for:', pluginName, paramKey, val);
        } catch(e) {
            console.warn('[VisualInspector] Failed to save override:', e);
        }
    }

})();
