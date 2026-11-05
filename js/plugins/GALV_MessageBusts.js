//-----------------------------------------------------------------------------
//  Galv's Message Busts (V.N. DUAL BUST EDITION) - ABSOLUTE INDEX FIX
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_MessageBusts.js
//-----------------------------------------------------------------------------
//  [REWRITE] - Dual Bust System (Left & Right memory states)
//  [REWRITE] - Auto-Dimming for inactive speaker
//  [REWRITE] - Auto-detect \N[id] interceptor
//  [BUGFIX]  - Fixed memory wipe on first message
//  [RESTORED]- \BST[x] and \BUST[x] mid-text expression changer
//  [MODIFIED]- Absolute 0-based indexing (Index 0 = _0 file)
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_MessageBusts = true;

var Galv = Galv || {};        
Galv.MB = Galv.MB || {};      

/*:
 * @plugindesc (VN DUAL BUST MOD - ABSOLUTE INDEX) 2 karakter dengan efek Dimming.
 * @author Galv (Heavily Modded)
 *
 * @param Bust Y Offset
 * @desc Jarak piksel vertikal. Semakin besar semakin turun. Bisa pakai minus.
 * @default 0
 * 
 * @param Bust Scale
 * @desc Skala persentase gambar (100 = asli).
 * @default 100
 *
 * @param Text X Offset
 * @desc Jarak dorongan teks.
 * @default 390
 *
 * @param Fade Out Speed
 * @desc Kecepatan gambar memudar (1-255).
 * @default 32
 *
 * @param Dimming Tone
 * @desc Seberapa gelap karakter yang tidak bicara? (Nilai Minus).
 * @default -100
 */

(function() {	

	Galv.MB.yOffset = Number(PluginManager.parameters('Galv_MessageBusts')["Bust Y Offset"]) || 0; 
	Galv.MB.scale = (Number(PluginManager.parameters('Galv_MessageBusts')["Bust Scale"]) || 100) / 100; 
	Galv.MB.w = Number(PluginManager.parameters('Galv_MessageBusts')["Text X Offset"]);
	Galv.MB.fadeOutSpeed = Number(PluginManager.parameters('Galv_MessageBusts')["Fade Out Speed"]) || 32;
    Galv.MB.dimTone = Number(PluginManager.parameters('Galv_MessageBusts')["Dimming Tone"]) || -100;
	
	Galv.MB.msgWindow = null;
	
// --- [ MEMORY STATE ] ---
var _Game_Temp_initialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    _Game_Temp_initialize.call(this);
    this.vnBustL_Name = "";
    this.vnBustR_Name = "";
    this.vnActiveSide = ""; 
};

// --- [ INTERCEPTOR ] ---
var _Game_Message_add = Game_Message.prototype.add;
Game_Message.prototype.add = function(text) {
    _Game_Message_add.call(this, text);
    
    var currentFace = $gameMessage.faceName();
    var currentIndex = $gameMessage.faceIndex();
    var faceFile = "";
    
    if (currentFace) {
        // [MODIFIKASI ABSOLUTE]: Tidak ada lagi +1. Index 0 = file _0
        faceFile = currentFace + "_" + currentIndex;
    }

    if (text.match(/\\N\[(\d+)\]/i)) {
        var charId = Number(RegExp.$1);
        if (charId === 1) {
            $gameTemp.vnActiveSide = 'L';
            if (faceFile) $gameTemp.vnBustL_Name = faceFile;
        } else {
            $gameTemp.vnActiveSide = 'R';
            if (faceFile) $gameTemp.vnBustR_Name = faceFile;
        }
    } else {
        if (!$gameTemp.vnActiveSide) $gameTemp.vnActiveSide = 'L';
        if ($gameTemp.vnActiveSide === 'L' && faceFile) $gameTemp.vnBustL_Name = faceFile;
        if ($gameTemp.vnActiveSide === 'R' && faceFile) $gameTemp.vnBustR_Name = faceFile;
    }
};

Galv.MB.Window_Message_startMessage = Window_Message.prototype.startMessage;
Window_Message.prototype.startMessage = function() {
	Galv.MB.msgWindow = this;
	$gameMessage.bustOffset = Galv.MB.w;
	Galv.MB.Window_Message_startMessage.call(this);
};

Galv.MB.Window_Message_drawMessageFace = Window_Message.prototype.drawMessageFace;
Window_Message.prototype.drawMessageFace = function() {
	return; 
};

// --- [ RESTORED & UPGRADED: MID-TEXT EXPRESSION CHANGER (\BUST[x]) ] ---
Galv.MB.Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
Window_Message.prototype.processEscapeCharacter = function(code, textState) {
    var c = code.toUpperCase();
    if (c === 'BST' || c === 'BUST') {
        this.obtainGalvBustParam(textState);
    } else {
        Galv.MB.Window_Message_processEscapeCharacter.call(this, code, textState);
    }
};

Window_Message.prototype.obtainGalvBustParam = function(textState) {
    var arr = /^ ?\[(.*)]/.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        var txt = arr[1]; 
        var array = txt.split(",");
        
        // [MODIFIKASI ABSOLUTE]: Angka yang diketik = Angka yang dicari
        var newIndex = Number(array[0]); 
        var newFaceName = array[1] ? array[1].trim() : $gameMessage._faceName;
        
        $gameMessage.setFaceImage(newFaceName, newIndex);
        
        // Membentuk nama file persis seperti indeks yang diketik
        var faceFile = newFaceName + "_" + newIndex;
        if ($gameTemp.vnActiveSide === 'L') {
            $gameTemp.vnBustL_Name = faceFile;
        } else if ($gameTemp.vnActiveSide === 'R') {
            $gameTemp.vnBustR_Name = faceFile;
        }
    }
};
// ------------------------------------------------------------------------

Galv.MB.Spriteset_Map_createUpperLayer = Spriteset_Base.prototype.createUpperLayer;
Spriteset_Base.prototype.createUpperLayer = function() {
    Galv.MB.Spriteset_Map_createUpperLayer.call(this);
    
    if (!this._msgBustSpriteL) {
        this._msgBustSpriteL = new Sprite_VNBust('L');
        this.addChild(this._msgBustSpriteL);
    }
    if (!this._msgBustSpriteR) {
        this._msgBustSpriteR = new Sprite_VNBust('R');
        this.addChild(this._msgBustSpriteR);
    }
};
	
Galv.MB.Window_Message_newLineX = Window_Message.prototype.newLineX;
Window_Message.prototype.newLineX = function() {
    return 0; 
};

})();

// ============================================================================
//   SPRITE CLASS BARU
// ============================================================================
function Sprite_VNBust() {
    this.initialize.apply(this, arguments);
}
Sprite_VNBust.prototype = Object.create(Sprite.prototype);
Sprite_VNBust.prototype.constructor = Sprite_VNBust;

Sprite_VNBust.prototype.initialize = function(side) {
    Sprite.prototype.initialize.call(this);
    this._side = side; 
    this.name = "";
    this.opacity = 0;
    this.update();
};

Sprite_VNBust.prototype.update = function() {
    Sprite.prototype.update.call(this);
    if (Galv.MB.msgWindow) this.controlBitmap();
};

Sprite_VNBust.prototype.loadBitmap = function(filename) {
    var img = ImageManager.loadPicture(filename);
    if (img.isReady()) {
        this.bitmap = img;
        this.name = filename;
    }
};

Sprite_VNBust.prototype.controlBitmap = function() {
    var targetName = (this._side === 'L') ? $gameTemp.vnBustL_Name : $gameTemp.vnBustR_Name;

    if (targetName && this.name !== targetName) {
        this.loadBitmap(targetName);
    }

    if (Galv.MB.msgWindow.openness <= 0 && !$gameMessage.isBusy()) {
        if (this._side === 'L') $gameTemp.vnBustL_Name = "";
        if (this._side === 'R') $gameTemp.vnBustR_Name = "";
        $gameTemp.vnActiveSide = "";
    }

    if (Galv.MB.msgWindow.openness <= 0 || !targetName) {
        this.opacity -= Galv.MB.fadeOutSpeed;
        if (this.opacity <= 0) {
            this.name = ""; 
        }
        return; 
    } 

    if (this.name) {
        this.opacity += Galv.MB.fadeOutSpeed;
        if (this.opacity > 255) this.opacity = 255;
    }

    if ($gameTemp.vnActiveSide === this._side) {
        this.setColorTone([0, 0, 0, 0]); 
    } else {
        var d = Galv.MB.dimTone;
        this.setColorTone([d, d, d, 0]); 
    }

    if (!this.bitmap || !this.bitmap.isReady()) return;

    var maxW = 550;
    var maxH = 733;
    var scaleX = maxW / this.bitmap.width;
    var scaleY = maxH / this.bitmap.height;
    var autoScale = Math.min(scaleX, scaleY);

    var scale = autoScale * Galv.MB.scale;
    var sw = this.bitmap.width * scale;
    var sh = this.bitmap.height * scale;

    this.scale.x = scale;
    this.scale.y = scale; 

    this.y = Graphics.boxHeight - sh + Galv.MB.yOffset; 

    if (this._side === 'L') {
        if (!$gameTemp.vnBustR_Name) {
            this.x = (Graphics.boxWidth - sw) / 2;
        } else {
            this.x = 0; 
        }
    } else {
        if (!$gameTemp.vnBustL_Name) {
            this.x = (Graphics.boxWidth - sw) / 2;
        } else {
            this.x = Graphics.boxWidth - sw;
        }
    }
};