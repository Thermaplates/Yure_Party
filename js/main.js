//=============================================================================
// main.js
//=============================================================================

// Proteksi Kebal RPG Maker MV:
// 1. Buang DevPluginEditor agar RPG Maker MV tidak pernah crash mencari berkas ini
// 2. Pastikan Yure_StatusJournal & Yure_VisualInspector SELALU aktif meski plugins.js tertimpa
if (typeof $plugins !== 'undefined') {
    $plugins = $plugins.filter(function(p) { return p.name !== 'DevPluginEditor'; });

    var essentials = [
        { name: 'Yure_StatusJournal', parameters: { "Journal Key": "73" } },
        { name: 'Yure_VisualInspector', parameters: { "Inspector Key": "F8" } }
    ];
    essentials.forEach(function(item) {
        if (!$plugins.some(function(p) { return p.name === item.name && p.status; })) {
            $plugins.push({
                name: item.name,
                status: true,
                description: '[Yure Core Plugin]',
                parameters: item.parameters || {}
            });
        }
    });
}

PluginManager.setup($plugins);

window.onload = function() {
    SceneManager.run(Scene_Boot);
};
