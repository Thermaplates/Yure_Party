//=============================================================================
// Yure_DevDebugMenu.js
//=============================================================================
/*:
 * @plugindesc [v1.0 DEV] In-Game Live Testing & Debug Panel (Sanity, Trauma, Syringe, HP/MP/Rage, Level, Gold)
 * @author Yure Party Dev Team
 *
 * @param Hotkey
 * @desc Tombol keyboard untuk membuka/menutup panel debug (F7, F10, atau ~).
 * @default F7
 *
 * @param Enable In Battle
 * @desc Izinkan membuka panel saat di tengah pertarungan? (true/false)
 * @default true
 *
 * @param Add Menu Command
 * @desc Tambahkan tombol [⚙️ Dev Debug] di Scene Menu utama? (true/false)
 * @default true
 *
 * @help
 * ============================================================================
 * YURE PARTY — LIVE TESTING & DEV DEBUG PANEL (v1.0)
 * ============================================================================
 * Panel pengujian instan (Sandbox) langsung di dalam game (Map & Battle)
 * untuk mempermudah QA & Balancing:
 *
 * FITUR UTAMA:
 *  1. PENGATURAN SANITY & TRAUMA:
 *     - Set Sanity langsung ke 0 (Trauma!), 15 (Critical), 40, 70, atau 100.
 *     - Tambah/Kurang Sanity (+/- 10, +/- 25).
 *     - Paksa Picu Trauma Manifestation (Nia / Saki / Sophia).
 *     - Sembuhkan Trauma & Pulihkan Mental.
 *
 *  2. ADRENALINE SYRINGE & TIME SANDBOX:
 *     - Minum Syringe (+25% Rage & catat penggunaan harian).
 *     - Tambahkan +10 Syringe ke tas item.
 *     - Simulasi Kemenangan Battle (uji kalkulasi penalti x1.5).
 *     - Reset Penalti Syringe Harian aktor.
 *     - Majukan 1 Hari (uji Daily Reset otomatis).
 *
 *  3. STATUS LENGKAP KARAKTER (VITALS):
 *     - Pemulihan Penuh (100% HP, MP, TP/Rage, Sanity).
 *     - Set HP = 1 (uji ambang kematian / Endurance), 50%, 100%.
 *     - Set MP = 0, 50%, 100%.
 *     - Set Rage (TP) = 0, 50%, 100%.
 *
 *  4. LEVEL & EXP:
 *     - Naikkan Level (+1, +5, Set Level 1, Set Level 99).
 *     - Tambah EXP (+1,000 EXP, +10,000 EXP).
 *
 *  5. EKONOMI (GOLD):
 *     - Tambah Uang (+1,000 GP, +10,000 GP, +999,999 GP, Kosongkan).
 *
 *  6. TARGET SELEKTOR:
 *     - Pilih Aktor 1 (Nia), Aktor 2 (Sophia), Aktor 3 (Saki), atau SELURUH PARTY.
 *
 * CARA PAKAI:
 *   - Tekan tombol F7 (atau ~ / backquote) kapan saja saat bermain (di Map atau Battle).
 *   - Atau klik menu [⚙️ Dev Debug] di Main Menu.
 *   - Tekan ESC atau klik tombol [✕] untuk menutup panel.
 */

var Imported = Imported || {};
Imported.Yure_DevDebugMenu = true;

(function() {
    'use strict';

    var params = PluginManager.parameters('Yure_DevDebugMenu') || {};
    var hotkeyParam = String(params['Hotkey'] || 'F7').trim().toUpperCase();
    var enableInBattle = String(params['Enable In Battle'] || 'true') === 'true';
    var addMenuCmd = String(params['Add Menu Command'] || 'true') === 'true';

    var _panelElement = null;
    var _isOpen = false;
    var _selectedActorIndex = -1; // -1 = All Party, 0 = Leader, 1 = Actor 2, etc.

    // ========================================================================
    // KEYBOARD LISTENER
    // ========================================================================
    window.addEventListener('keydown', function(event) {
        var key = event.key ? event.key.toUpperCase() : '';
        var code = event.keyCode;

        // F7 (118), F10 (121), Tilde (192)
        var isTrigger = false;
        if (hotkeyParam === 'F7' && (key === 'F7' || code === 118)) isTrigger = true;
        else if (hotkeyParam === 'F10' && (key === 'F10' || code === 121)) isTrigger = true;
        else if ((hotkeyParam === '~' || hotkeyParam === '`') && (key === '`' || key === '~' || code === 192)) isTrigger = true;
        else if (key === hotkeyParam) isTrigger = true;

        // Fallback cadangan: F7 selalu aktif
        if (key === 'F7' || code === 118) isTrigger = true;

        if (isTrigger) {
            event.preventDefault();
            toggleDebugPanel();
        } else if (_isOpen && (key === 'ESCAPE' || code === 27)) {
            event.preventDefault();
            closeDebugPanel();
        }
    });

    function toggleDebugPanel() {
        if (_isOpen) {
            closeDebugPanel();
        } else {
            openDebugPanel();
        }
    }

    function openDebugPanel() {
        if (!$gameParty) return;
        if (!enableInBattle && SceneManager._scene instanceof Scene_Battle) return;

        if (!_panelElement) {
            createPanelDOM();
        }

        refreshPanelContent();
        _panelElement.style.display = 'flex';
        _isOpen = true;
        SoundManager.playCursor ? SoundManager.playCursor() : null;
    }

    function closeDebugPanel() {
        if (_panelElement) {
            _panelElement.style.display = 'none';
        }
        _isOpen = false;
        SoundManager.playCancel ? SoundManager.playCancel() : null;
    }

    // ========================================================================
    // DOM UI CREATION (CYBERPUNK / SUPERNATURAL MODERN FLOATING PANEL)
    // ========================================================================
    function createPanelDOM() {
        var existing = document.getElementById('yure-dev-debug-panel');
        if (existing) existing.remove();

        var container = document.createElement('div');
        container.id = 'yure-dev-debug-panel';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.width = '480px';
        container.style.maxHeight = '92vh';
        container.style.backgroundColor = 'rgba(13, 15, 24, 0.96)';
        container.style.backdropFilter = 'blur(12px)';
        container.style.border = '1.5px solid rgba(168, 85, 247, 0.45)';
        container.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(168, 85, 247, 0.2)';
        container.style.borderRadius = '12px';
        container.style.color = '#e2e8f0';
        container.style.fontFamily = 'GameFont, "Segoe UI", Roboto, sans-serif';
        container.style.zIndex = '999999';
        container.style.display = 'none';
        container.style.flexDirection = 'column';
        container.style.overflow = 'hidden';
        container.style.userSelect = 'none';
        container.style.animation = 'yureDevFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)';

        // Inject CSS Styles
        var style = document.createElement('style');
        style.textContent = `
            @keyframes yureDevFadeIn {
                from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .yure-dev-btn {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 6px;
                color: #e2e8f0;
                padding: 6px 10px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.14s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-weight: 500;
            }
            .yure-dev-btn:hover {
                background: rgba(168, 85, 247, 0.3);
                border-color: #c084fc;
                color: #ffffff;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(168, 85, 247, 0.25);
            }
            .yure-dev-btn:active {
                transform: translateY(1px);
            }
            .yure-dev-btn.danger {
                background: rgba(239, 68, 68, 0.16);
                border-color: rgba(239, 68, 68, 0.35);
                color: #fca5a5;
            }
            .yure-dev-btn.danger:hover {
                background: rgba(239, 68, 68, 0.35);
                border-color: #ef4444;
                color: #ffffff;
            }
            .yure-dev-btn.success {
                background: rgba(52, 211, 153, 0.16);
                border-color: rgba(52, 211, 153, 0.35);
                color: #6ee7b7;
            }
            .yure-dev-btn.success:hover {
                background: rgba(52, 211, 153, 0.35);
                border-color: #34d399;
                color: #ffffff;
            }
            .yure-dev-btn.warning {
                background: rgba(251, 191, 36, 0.16);
                border-color: rgba(251, 191, 36, 0.35);
                color: #fde047;
            }
            .yure-dev-btn.warning:hover {
                background: rgba(251, 191, 36, 0.35);
                border-color: #fbbf24;
                color: #ffffff;
            }
            .yure-tab-btn {
                flex: 1;
                padding: 7px 4px;
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid rgba(255, 255, 255, 0.08);
                color: #94a3b8;
                font-size: 11px;
                cursor: pointer;
                border-radius: 5px;
                text-align: center;
                transition: all 0.15s ease;
            }
            .yure-tab-btn.active {
                background: rgba(168, 85, 247, 0.32);
                border-color: #a855f7;
                color: #ffffff;
                font-weight: bold;
                box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
            }
            .yure-dev-card {
                background: rgba(0, 0, 0, 0.22);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 8px;
            }
            .yure-dev-card-title {
                font-size: 11px;
                font-weight: bold;
                color: #cbd5e1;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 5px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .yure-dev-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 5px;
            }
            .yure-dev-scroll::-webkit-scrollbar {
                width: 6px;
            }
            .yure-dev-scroll::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
            }
            .yure-dev-scroll::-webkit-scrollbar-thumb {
                background: rgba(168, 85, 247, 0.4);
                border-radius: 3px;
            }
        `;
        document.head.appendChild(style);

        // Header Panel
        var header = document.createElement('div');
        header.style.padding = '12px 14px';
        header.style.background = 'linear-gradient(90deg, rgba(168, 85, 247, 0.25), rgba(56, 189, 248, 0.15))';
        header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';

        header.innerHTML = `
            <div>
                <div style="font-weight: 800; font-size: 13px; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                    <span style="color: #a855f7;">⚡</span> YURE PARTY DEV TESTING PANEL
                    <span style="font-size: 9px; padding: 2px 6px; background: #a855f7; border-radius: 4px; color: #fff;">F7</span>
                </div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Sanity, Trauma, Syringe, Vitals & Economy Sandbox</div>
            </div>
            <button id="yure-dev-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 16px; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: color 0.15s;">✕</button>
        `;
        container.appendChild(header);

        // Character Selector Bar
        var charBar = document.createElement('div');
        charBar.id = 'yure-dev-char-bar';
        charBar.style.padding = '8px 12px';
        charBar.style.display = 'flex';
        charBar.style.gap = '5px';
        charBar.style.background = 'rgba(0, 0, 0, 0.3)';
        charBar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.06)';
        container.appendChild(charBar);

        // Live Stats Summary Banner
        var statsBanner = document.createElement('div');
        statsBanner.id = 'yure-dev-stats-banner';
        statsBanner.style.padding = '8px 12px';
        statsBanner.style.background = 'rgba(168, 85, 247, 0.08)';
        statsBanner.style.borderBottom = '1px solid rgba(255, 255, 255, 0.06)';
        statsBanner.style.fontSize = '11px';
        statsBanner.style.lineHeight = '1.4';
        container.appendChild(statsBanner);

        // Scrollable Action Body
        var body = document.createElement('div');
        body.className = 'yure-dev-scroll';
        body.style.padding = '12px';
        body.style.overflowY = 'auto';
        body.style.flex = '1';

        // 1. Sanity & Trauma Card
        var sanityCard = document.createElement('div');
        sanityCard.className = 'yure-dev-card';
        sanityCard.innerHTML = `
            <div class="yure-dev-card-title">🧠 Kontrol Sanity & Trauma (0 Sanity)</div>
            <div class="yure-dev-grid" style="margin-bottom: 6px;">
                <button class="yure-dev-btn danger" data-action="set-san" data-val="0">⚡ 0 (Trauma!)</button>
                <button class="yure-dev-btn danger" data-action="set-san" data-val="15">🩸 15 (Critical)</button>
                <button class="yure-dev-btn warning" data-action="set-san" data-val="40">⚠️ 40 (Disturbed)</button>
                <button class="yure-dev-btn warning" data-action="set-san" data-val="70">💬 70 (Uneasy)</button>
                <button class="yure-dev-btn success" data-action="set-san" data-val="100">🌿 100 (Stabil)</button>
            </div>
            <div class="yure-dev-grid" style="margin-bottom: 6px;">
                <button class="yure-dev-btn" data-action="gain-san" data-val="-25">-25 Sanity</button>
                <button class="yure-dev-btn" data-action="gain-san" data-val="-10">-10 Sanity</button>
                <button class="yure-dev-btn" data-action="gain-san" data-val="10">+10 Sanity</button>
                <button class="yure-dev-btn" data-action="gain-san" data-val="25">+25 Sanity</button>
            </div>
            <div style="display: flex; gap: 5px;">
                <button class="yure-dev-btn danger" style="flex: 1;" data-action="trigger-trauma">🔥 Paksa Mode Trauma</button>
                <button class="yure-dev-btn success" style="flex: 1;" data-action="heal-trauma">✨ Sembuhkan Trauma</button>
            </div>
        `;
        body.appendChild(sanityCard);

        // 2. Adrenaline Syringe Card
        var syringeCard = document.createElement('div');
        syringeCard.className = 'yure-dev-card';
        syringeCard.innerHTML = `
            <div class="yure-dev-card-title">💉 Adrenaline Syringe Karso & Waktu</div>
            <div class="yure-dev-grid" style="margin-bottom: 6px;">
                <button class="yure-dev-btn warning" data-action="drink-syringe">💉 Minum Syringe (+25% Rage)</button>
                <button class="yure-dev-btn" data-action="give-syringes">📦 +10 Syringe ke Tas</button>
            </div>
            <div class="yure-dev-grid">
                <button class="yure-dev-btn" data-action="simulate-battle-victory">⚔️ Simulasi Win Battle (Loss x1.5)</button>
                <button class="yure-dev-btn" data-action="reset-daily-adrenaline">🔄 Reset Syringe Hari Ini</button>
                <button class="yure-dev-btn" data-action="advance-day">🌅 Maju 1 Hari (+1 Day)</button>
            </div>
        `;
        body.appendChild(syringeCard);

        // 3. Vitals (HP, MP, Rage) Card
        var vitalsCard = document.createElement('div');
        vitalsCard.className = 'yure-dev-card';
        vitalsCard.innerHTML = `
            <div class="yure-dev-card-title">❤️ Vitals & Tempur (HP, MP, Rage)</div>
            <div style="margin-bottom: 6px;">
                <button class="yure-dev-btn success" style="width: 100%;" data-action="full-heal">💖 Pulihkan Penuh (HP / MP / Rage / Sanity)</button>
            </div>
            <div class="yure-dev-grid" style="margin-bottom: 6px;">
                <button class="yure-dev-btn danger" data-action="set-hp-1">💀 HP = 1</button>
                <button class="yure-dev-btn" data-action="set-hp-half">HP = 50%</button>
                <button class="yure-dev-btn success" data-action="set-hp-max">HP = 100%</button>
            </div>
            <div class="yure-dev-grid" style="margin-bottom: 6px;">
                <button class="yure-dev-btn" data-action="set-mp-0">MP = 0</button>
                <button class="yure-dev-btn" data-action="set-mp-max">MP = 100%</button>
                <button class="yure-dev-btn warning" data-action="set-tp-0">Rage = 0</button>
                <button class="yure-dev-btn warning" data-action="set-tp-half">Rage = 50%</button>
                <button class="yure-dev-btn warning" data-action="set-tp-max">Rage = 100%</button>
            </div>
        `;
        body.appendChild(vitalsCard);

        // 4. Level & Gold Card
        var levelGoldCard = document.createElement('div');
        levelGoldCard.className = 'yure-dev-card';
        levelGoldCard.innerHTML = `
            <div class="yure-dev-card-title">⚔️ Level, EXP & 💰 Uang (Gold)</div>
            <div class="yure-dev-grid" style="margin-bottom: 6px;">
                <button class="yure-dev-btn" data-action="level-up-1">Level +1</button>
                <button class="yure-dev-btn" data-action="level-up-5">Level +5</button>
                <button class="yure-dev-btn" data-action="level-set-1">Level = 1</button>
                <button class="yure-dev-btn success" data-action="level-set-max">Level = 99</button>
                <button class="yure-dev-btn" data-action="add-exp">EXP +1,000</button>
            </div>
            <div class="yure-dev-grid">
                <button class="yure-dev-btn warning" data-action="add-gold-1k">+1,000 GP</button>
                <button class="yure-dev-btn warning" data-action="add-gold-10k">+10,000 GP</button>
                <button class="yure-dev-btn warning" data-action="add-gold-max">+999,999 GP</button>
                <button class="yure-dev-btn danger" data-action="empty-gold">Kosongkan GP</button>
            </div>
        `;
        body.appendChild(levelGoldCard);

        container.appendChild(body);

        // Toast Notification Bar
        var toast = document.createElement('div');
        toast.id = 'yure-dev-toast';
        toast.style.padding = '6px 12px';
        toast.style.background = 'rgba(0, 0, 0, 0.45)';
        toast.style.fontSize = '10px';
        toast.style.color = '#38bdf8';
        toast.style.textAlign = 'center';
        toast.style.borderTop = '1px solid rgba(255, 255, 255, 0.06)';
        toast.textContent = 'Ready: Pilih aksi untuk pengujian langsung.';
        container.appendChild(toast);

        document.body.appendChild(container);
        _panelElement = container;

        // Close button click
        document.getElementById('yure-dev-close-btn').addEventListener('click', closeDebugPanel);

        // Attach action click handler
        container.addEventListener('click', function(e) {
            var btn = e.target.closest('button[data-action]');
            if (btn) {
                var action = btn.getAttribute('data-action');
                var val = btn.getAttribute('data-val');
                executeDevAction(action, val);
            }
        });
    }

    // ========================================================================
    // REFRESH PANEL STATE & CONTENT
    // ========================================================================
    function refreshPanelContent() {
        if (!_panelElement || !$gameParty) return;

        // 1. Update Character Tabs
        var charBar = document.getElementById('yure-dev-char-bar');
        if (charBar) {
            charBar.innerHTML = '';
            var allBtn = document.createElement('button');
            allBtn.className = 'yure-tab-btn' + (_selectedActorIndex === -1 ? ' active' : '');
            allBtn.textContent = '👥 Seluruh Party';
            allBtn.onclick = function() {
                _selectedActorIndex = -1;
                refreshPanelContent();
            };
            charBar.appendChild(allBtn);

            var members = $gameParty.allMembers();
            members.forEach(function(actor, idx) {
                var btn = document.createElement('button');
                btn.className = 'yure-tab-btn' + (_selectedActorIndex === idx ? ' active' : '');
                btn.textContent = (idx + 1) + '. ' + actor.name();
                btn.onclick = function() {
                    _selectedActorIndex = idx;
                    refreshPanelContent();
                };
                charBar.appendChild(btn);
            });
        }

        // 2. Update Stats Banner
        var banner = document.getElementById('yure-dev-stats-banner');
        if (banner) {
            var targetActor = getSelectedActor();
            if (targetActor) {
                var san = (typeof targetActor.sanity !== 'undefined') ? targetActor.sanity : 100;
                var maxSan = (typeof targetActor.maxSanity === 'function') ? targetActor.maxSanity() : 100;
                var tier = (typeof targetActor.sanityTier === 'function') ? targetActor.sanityTier().toUpperCase() : 'STABIL';
                var isTrauma = (typeof targetActor.isTraumaManifested === 'function') && targetActor.isTraumaManifested();
                var syringes = (typeof targetActor.dailySyringeCount === 'function') ? targetActor.dailySyringeCount() : 0;
                var battles = (typeof targetActor.affectedBattleCount === 'function') ? targetActor.affectedBattleCount() : 0;
                var gold = $gameParty.gold();

                var tierColor = '#34d399';
                if (tier === 'UNEASY') tierColor = '#facc15';
                else if (tier === 'DISTURBED') tierColor = '#fb923c';
                else if (tier === 'CRITICAL') tierColor = '#f87171';
                else if (tier === 'TRAUMA' || isTrauma) { tierColor = '#c084fc'; tier = '⚠️ TRAUMA MANIFESTED'; }

                banner.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-weight: bold; color: #fff;">${targetActor.name()} (Lv.${targetActor.level})</span>
                        <span style="font-weight: bold; color: ${tierColor};">${tier}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; font-size: 10px; color: #cbd5e1;">
                        <div>HP: <b style="color: #34d399;">${targetActor.hp}/${targetActor.mhp}</b></div>
                        <div>MP: <b style="color: #60a5fa;">${targetActor.mp}/${targetActor.mmp}</b></div>
                        <div>Rage: <b style="color: #f59e0b;">${targetActor.tp}/${targetActor.maxTp()}</b></div>
                        <div>Sanity: <b style="color: ${tierColor};">${san}/${maxSan}</b></div>
                        <div>Syringes: <b style="color: #f472b6;">${syringes} (Bat: ${battles})</b></div>
                        <div>Gold: <b style="color: #fde047;">${gold} GP</b></div>
                    </div>
                `;
            } else {
                banner.innerHTML = `
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-weight: bold; color: #fff;">👥 Target: Seluruh Anggota Party</span>
                        <span style="color: #fde047; font-weight: bold;">${$gameParty.gold()} GP</span>
                    </div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Seluruh perubahan status akan diaplikasikan ke semua karakter dalam party.</div>
                `;
            }
        }
    }

    function getSelectedActor() {
        if (!_selectedActorIndex || _selectedActorIndex === -1) {
            return null; // All party
        }
        var members = $gameParty.allMembers();
        return members[_selectedActorIndex] || null;
    }

    function getTargetActors() {
        var a = getSelectedActor();
        return a ? [a] : $gameParty.allMembers();
    }

    function showToast(msg) {
        var toast = document.getElementById('yure-dev-toast');
        if (toast) {
            toast.textContent = msg;
            toast.style.color = '#38bdf8';
        }
    }

    // ========================================================================
    // DEV ACTIONS DISPATCHER
    // ========================================================================
    function executeDevAction(action, val) {
        var targets = getTargetActors();
        var actedName = getSelectedActor() ? getSelectedActor().name() : 'Seluruh Party';

        switch(action) {
            // --- SANITY ---
            case 'set-san':
                var targetSan = Number(val);
                targets.forEach(function(a) {
                    if (a) {
                        a.sanity = targetSan;
                        if (targetSan <= 0) {
                            if (typeof a.setTraumaManifested === 'function') a.setTraumaManifested(true);
                        }
                    }
                });
                showToast(actedName + " Sanity diatur ke " + targetSan);
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'gain-san':
                var gainVal = Number(val);
                targets.forEach(function(a) {
                    if (a && typeof a.gainSanity === 'function') {
                        a.gainSanity(gainVal);
                    }
                });
                showToast(actedName + " Sanity " + (gainVal > 0 ? "+" : "") + gainVal);
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'trigger-trauma':
                targets.forEach(function(a) {
                    if (a) {
                        a.sanity = 0;
                        if (typeof a.setTraumaManifested === 'function') {
                            a.setTraumaManifested(true);
                        }
                    }
                });
                showToast("🔥 " + actedName + " dipaksa masuk kondisi Trauma Manifestation!");
                SoundManager.playActorCollapse ? SoundManager.playActorCollapse() : null;
                break;

            case 'heal-trauma':
                targets.forEach(function(a) {
                    if (a) {
                        if (typeof a.setTraumaManifested === 'function') {
                            a.setTraumaManifested(false);
                        }
                        if (a.sanity <= 0) {
                            a.sanity = 35; // Pulihkan di atas batas kritis
                        }
                    }
                });
                showToast("✨ " + actedName + " sembuh dari Trauma!");
                SoundManager.playRecovery ? SoundManager.playRecovery() : null;
                break;

            // --- SYRINGE & TIME ---
            case 'drink-syringe':
                targets.forEach(function(a) {
                    if (a) {
                        var rageGain = Math.round(a.maxTp() * 0.25);
                        a.gainTp(rageGain);
                        if (typeof a.recordSyringeUse === 'function') {
                            a.recordSyringeUse();
                        }
                    }
                });
                showToast("💉 " + actedName + " meminum Adrenaline Syringe (+25% Rage)");
                SoundManager.playRecovery ? SoundManager.playRecovery() : null;
                break;

            case 'give-syringes':
                if ($dataItems && $gameParty) {
                    // Item 8 Adrenaline Syringe
                    var item = $dataItems[8];
                    if (item) {
                        $gameParty.gainItem(item, 10);
                        showToast("📦 +10 Adrenaline Syringe ditambahkan ke tas!");
                    } else {
                        showToast("⚠️ Item 8 tidak ditemukan di database.");
                    }
                }
                SoundManager.playUseItem ? SoundManager.playUseItem() : null;
                break;

            case 'simulate-battle-victory':
                targets.forEach(function(a) {
                    if (a) {
                        if (typeof a.recordAffectedBattle === 'function') {
                            a.recordAffectedBattle();
                        }
                        var extra = (typeof a.calculateSyringeSanityLoss === 'function') ? a.calculateSyringeSanityLoss() : 0;
                        var base = 10;
                        var totalLoss = base + extra;
                        a.gainSanity(-totalLoss);
                    }
                });
                showToast("⚔️ Simulasi Kemenangan Battle: Sanity terkuras (Loss x1.5)");
                SoundManager.playBattleStart ? SoundManager.playBattleStart() : null;
                break;

            case 'reset-daily-adrenaline':
                targets.forEach(function(a) {
                    if (a && typeof a.resetDailySyringeData === 'function') {
                        a.resetDailySyringeData();
                    }
                });
                showToast("🔄 Penalti Syringe harian untuk " + actedName + " di-reset!");
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'advance-day':
                var dayVarId = 11; // MOG_TimeSystem Variable ID
                if ($gameVariables) {
                    var curDay = $gameVariables.value(dayVarId) || 1;
                    $gameVariables.setValue(dayVarId, curDay + 1);
                    // Memicu reset harian seluruh aktor
                    $gameParty.members().forEach(function(a) {
                        if (a && typeof a.checkDailySyringeReset === 'function') {
                            a.checkDailySyringeReset();
                        }
                    });
                    showToast("🌅 Hari berganti ke Hari " + (curDay + 1) + " (Daily Reset aktif!)");
                }
                SoundManager.playSave ? SoundManager.playSave() : null;
                break;

            // --- VITALS ---
            case 'full-heal':
                targets.forEach(function(a) {
                    if (a) {
                        a.recoverAll();
                        if (typeof a.initSanity === 'function') a.initSanity();
                        else a.sanity = a.maxSanity();
                    }
                });
                showToast("💖 " + actedName + " dipulihkan penuh (HP, MP, Rage, Sanity)!");
                SoundManager.playRecovery ? SoundManager.playRecovery() : null;
                break;

            case 'set-hp-1':
                targets.forEach(function(a) { if (a) a.setHp(1); });
                showToast("💀 HP " + actedName + " diatur ke 1!");
                SoundManager.playDamage ? SoundManager.playDamage() : null;
                break;

            case 'set-hp-half':
                targets.forEach(function(a) { if (a) a.setHp(Math.round(a.mhp / 2)); });
                showToast("HP " + actedName + " diatur ke 50%");
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'set-hp-max':
                targets.forEach(function(a) { if (a) a.setHp(a.mhp); });
                showToast("HP " + actedName + " diatur ke 100%");
                SoundManager.playRecovery ? SoundManager.playRecovery() : null;
                break;

            case 'set-mp-0':
                targets.forEach(function(a) { if (a) a.setMp(0); });
                showToast("MP " + actedName + " diatur ke 0");
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'set-mp-max':
                targets.forEach(function(a) { if (a) a.setMp(a.mmp); });
                showToast("MP " + actedName + " diatur ke 100%");
                SoundManager.playRecovery ? SoundManager.playRecovery() : null;
                break;

            case 'set-tp-0':
                targets.forEach(function(a) { if (a) a.setTp(0); });
                showToast("Rage " + actedName + " diatur ke 0");
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'set-tp-half':
                targets.forEach(function(a) { if (a) a.setTp(Math.round(a.maxTp() / 2)); });
                showToast("Rage " + actedName + " diatur ke 50%");
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'set-tp-max':
                targets.forEach(function(a) { if (a) a.setTp(a.maxTp()); });
                showToast("Rage " + actedName + " diatur ke 100%");
                SoundManager.playRecovery ? SoundManager.playRecovery() : null;
                break;

            // --- LEVEL & GOLD ---
            case 'level-up-1':
                targets.forEach(function(a) { if (a) a.changeLevel(a.level + 1, false); });
                showToast(actedName + " Naik 1 Level!");
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'level-up-5':
                targets.forEach(function(a) { if (a) a.changeLevel(a.level + 5, false); });
                showToast(actedName + " Naik 5 Level!");
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'level-set-1':
                targets.forEach(function(a) { if (a) a.changeLevel(1, false); });
                showToast(actedName + " Level diatur ke 1");
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'level-set-max':
                targets.forEach(function(a) { if (a) a.changeLevel(a.maxLevel(), false); });
                showToast(actedName + " Level diatur ke MAX (" + (targets[0] ? targets[0].maxLevel() : 99) + ")!");
                SoundManager.playRecovery ? SoundManager.playRecovery() : null;
                break;

            case 'add-exp':
                targets.forEach(function(a) { if (a) a.gainExp(1000); });
                showToast(actedName + " +1,000 EXP");
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;

            case 'add-gold-1k':
                if ($gameParty) $gameParty.gainGold(1000);
                showToast("+1,000 GP ditambahkan!");
                SoundManager.playShop ? SoundManager.playShop() : null;
                break;

            case 'add-gold-10k':
                if ($gameParty) $gameParty.gainGold(10000);
                showToast("+10,000 GP ditambahkan!");
                SoundManager.playShop ? SoundManager.playShop() : null;
                break;

            case 'add-gold-max':
                if ($gameParty) $gameParty.gainGold(999999);
                showToast("+999,999 GP ditambahkan (Maksimal)!");
                SoundManager.playShop ? SoundManager.playShop() : null;
                break;

            case 'empty-gold':
                if ($gameParty) {
                    var cur = $gameParty.gold();
                    $gameParty.loseGold(cur);
                    showToast("Uang (Gold) dikosongkan.");
                }
                SoundManager.playOk ? SoundManager.playOk() : null;
                break;
        }

        // Live Refresh Scene
        refreshActiveScene();
        refreshPanelContent();
    }

    function refreshActiveScene() {
        try {
            var scene = SceneManager._scene;
            if (!scene) return;

            // In Battle: Refresh Status & HUD
            if (scene instanceof Scene_Battle) {
                if (scene._statusWindow) scene._statusWindow.refresh();
                if (BattleManager._logWindow) BattleManager._logWindow.refresh();
                if (scene._pethogsSkillSlots) scene._pethogsSkillSlots.refresh();
            }

            // In Map: Refresh HUD
            if (scene instanceof Scene_Map) {
                // MOG Actor HUD refresh if available
                if (scene._actorHud) {
                    if (Array.isArray(scene._actorHud)) {
                        scene._actorHud.forEach(function(hud) {
                            if (hud && typeof hud.refresh_all === 'function') hud.refresh_all();
                        });
                    } else {
                        if (typeof scene._actorHud.refresh_all === 'function') {
                            scene._actorHud.refresh_all();
                        } else if (typeof scene._actorHud.refresh_parameters === 'function') {
                            scene._actorHud.refresh_parameters();
                        }
                    }
                }
            }

            // In Menu: Refresh
            if (scene instanceof Scene_Menu) {
                if (scene._statusWindow) scene._statusWindow.refresh();
                if (scene._goldWindow) scene._goldWindow.refresh();
            }
        } catch(e) {
            console.warn('[Yure_DevDebugMenu] Refresh warning:', e);
        }
    }

    // ========================================================================
    // OPTIONAL SCENE_MENU COMMAND INTEGRATION
    // ========================================================================
    if (addMenuCmd) {
        var _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
        Window_MenuCommand.prototype.addOriginalCommands = function() {
            _Window_MenuCommand_addOriginalCommands.call(this);
            this.addCommand('⚙️ Dev Testing Panel', 'devDebug', true);
        };

        var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function() {
            _Scene_Menu_createCommandWindow.call(this);
            this._commandWindow.setHandler('devDebug', function() {
                this._commandWindow.activate();
                openDebugPanel();
            }.bind(this));
        };
    }

})();
