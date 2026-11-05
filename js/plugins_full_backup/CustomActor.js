//=============================================================================
// Custom_LockFormation_MOG.js
//=============================================================================
/*:
 * @plugindesc Mengunci posisi Actor (Kompatibel 100% dengan Moghunter Menu).
 * @author Custom Build
 * 
 * @param Locked Actor IDs
 * @desc ID Actor yang posisinya akan dikunci. (Pisahkan spasi. Misal: 1 2)
 * @default 1
 * 
 * @help
 * PENTING: Taruh plugin ini di Plugin Manager tepat di BAWAH plugin Moghunter!
 */
(function() {
    // Membaca parameter dari nama plugin yang terdaftar di RPG Maker (CustomActor)
    var parameters = PluginManager.parameters('CustomActor');
    if (!parameters || Object.keys(parameters).length === 0) {
        parameters = PluginManager.parameters('Custom_LockFormation_MOG');
    }
    
    var lockedData = String(parameters['Locked Actor IDs'] || '').split(' ');
    var lockedActors = [];
    
    for (var i = 0; i < lockedData.length; i++) {
        var id = parseInt(lockedData[i].trim());
        if (!isNaN(id) && id > 0) {
            lockedActors.push(id);
        }
    }

    // 1. KUNCI ABSOLUT DI MEMORI ARRAY PARTY (Pertahanan Terakhir)
    // Jika Moghunter memaksa menukar, mesin inti akan langsung membatalkannya.
    var _Game_Party_swapOrder = Game_Party.prototype.swapOrder;
    Game_Party.prototype.swapOrder = function(index1, index2) {
        var id1 = this._actors[index1]; // Mengambil ID dari urutan array
        var id2 = this._actors[index2];
        
        if (lockedActors.indexOf(id1) !== -1 || lockedActors.indexOf(id2) !== -1) {
            return; // BLOKIR TOTAL!
        }
        _Game_Party_swapOrder.call(this, index1, index2);
    };

    // Fungsi Pembantu untuk mengecek kunci pembentukan formasi (Mencegah perpindahan)
    function checkFormationLock(sceneInstance) {
        if (!sceneInstance._statusWindow) return false;
        
        var index = sceneInstance._statusWindow.index();
        var pendingIndex = sceneInstance._statusWindow.pendingIndex();
        
        var actor = $gameParty.members()[index];
        var pendingActor = pendingIndex >= 0 ? $gameParty.members()[pendingIndex] : null;

        // Jika pemain mencoba mengeklik karakter yang dikunci
        if (actor && lockedActors.indexOf(actor.actorId()) !== -1) {
            SoundManager.playBuzzer(); // Bunyikan suara error (Tetot!)
            
            // Batalkan status pemilihan
            if (pendingIndex >= 0) {
                sceneInstance._statusWindow.setPendingIndex(-1);
                sceneInstance._statusWindow.redrawItem(index);
            }
            sceneInstance._statusWindow.activate();
            return true; // Terkunci
        }

        // Jika pemain sudah memilih karakter lain, lalu mencoba menaruhnya di slot karakter yang dikunci
        if (pendingActor && lockedActors.indexOf(pendingActor.actorId()) !== -1) {
            SoundManager.playBuzzer();
            sceneInstance._statusWindow.setPendingIndex(-1);
            sceneInstance._statusWindow.activate();
            return true; // Terkunci
        }

        return false; // Aman
    }

    // 2. KUNCI TOMBOL OK DI MENU STANDAR (Pertahanan Pertama)
    var _Scene_Menu_onFormationOk = Scene_Menu.prototype.onFormationOk;
    Scene_Menu.prototype.onFormationOk = function() {
        if (checkFormationLock(this)) return; // Hentikan script jika posisi terkunci!
        _Scene_Menu_onFormationOk.call(this);
    };

    // 3. KUNCI TOMBOL OK DI MENU MOGHUNTER (Scene_Party)
    // Karena Moghunter menggunakan Scene_Party dan bukan Scene_Menu untuk formasi
    window.addEventListener('load', function() {
        if (typeof Scene_Party !== 'undefined') {
            var _Scene_Party_onFormationOk = Scene_Party.prototype.onFormationOk;
            Scene_Party.prototype.onFormationOk = function() {
                if (checkFormationLock(this)) return; // Hentikan script jika posisi terkunci!
                _Scene_Party_onFormationOk.call(this);
            };
        }
    });

})();