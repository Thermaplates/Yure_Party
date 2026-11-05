//-----------------------------------------------------------------------------
//  Galv's Message Busts (Modified: Auto-Posisi \N[id] + Y Offset + Scale)
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_MessageBusts.js
//-----------------------------------------------------------------------------
//  [MODIFIED] - Added Bust Y Offset parameter
//  [MODIFIED] - Added Bust Scale parameter
//  [MODIFIED] - Auto-detect \N[id] for Left/Right positioning
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_MessageBusts = true;

var Galv = Galv || {};        
Galv.pCmd = Galv.pCmd || {};  
Galv.MB = Galv.MB || {};      
Galv.Mstyle = Galv.Mstyle || {};  

//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.2.8 Mod) Bust image display.
 * Ditambah fitur Auto-Posisi kiri/kanan berdasarkan \N[id], Y Offset, & Scale.
 * 
 * @author Galv (Modded)
 *
 * @param Bust Priority
 * @desc Can be 0 or 1. 0 = behind message, 1 = in front
 * @default 0
 *
 * @param Bust Position
 * @desc 0 = above window, 1 = bottom of screen
 * @default 0
 *
 * @param Bust Y Offset
 * @desc Jarak piksel vertikal untuk menurunkan gambar. Bisa pakai minus.
 * @default 0
 * 
 * @param Bust Scale
 * @desc Ukuran gambar dalam persentase. 100 = asli, 50 = separuh.
 * @default 100
 *
 * @param Text X Offset
 * @desc Amount of pixels text is pushed to the right.
 * @default 390
 *
 * @param Fade Out Speed
 * @desc The speed in which busts fade out. 1-255
 * @default 32
 *
 * @param Filename Append
 * @desc Text to append to filename.
 * @default
 */

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {	

	Galv.MB.prio = Number(PluginManager.parameters('Galv_MessageBusts')["Bust Priority"]);
	Galv.MB.pos = Number(PluginManager.parameters('Galv_MessageBusts')["Bust Position"]);
    
	Galv.MB.yOffset = Number(PluginManager.parameters('Galv_MessageBusts')["Bust Y Offset"]) || 0; 
	Galv.MB.scale = (Number(PluginManager.parameters('Galv_MessageBusts')["Bust Scale"]) || 100) / 100; 
    
	Galv.MB.w = Number(PluginManager.parameters('Galv_MessageBusts')["Text X Offset"]);
	Galv.MB.f = PluginManager.parameters('Galv_MessageBusts')["Filename Append"];
	Galv.MB.fadeOutSpeed = Number(PluginManager.parameters('Galv_MessageBusts')["Fade Out Speed"]);
	
	Galv.MB.msgWindow = null;
	
if (Galv.MB.prio == 1 && Galv.MB.pos == 0) {
	Galv.MB.prio = 0;
};
	
if (!Galv.aliased) {
	var Galv_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		if (Galv.pCmd[command]) {
			Galv.pCmd[command](args);
			return;
		};
		Galv_Game_Interpreter_pluginCommand.call(this, command, args);
	};
	Galv.aliased = true; 
};

Galv.pCmd.BUST = function(arguments) {
	Galv.MB.bustPos(arguments);
};

Galv.MB.bustPos = function(pos) {
	if (pos[0] === "TRUE") {
		return $gameSystem.bustDisable = false;
	} else if (pos[0] === "FALSE") {
		return $gameSystem.bustDisable = true;
	};
	
	$gameSystem.bustPos = 0
	if (pos[0] === "LEFT") {
		$gameSystem.bustPos = 0;
	} else if (pos[0] === "RIGHT") {
		$gameSystem.bustPos = 1;
	};
	if (pos[1] === "TRUE") {
		$gameSystem.bustMirror = true;
	} else if (pos[1] === "FALSE") {
		$gameSystem.bustMirror = false;
	};
};

Galv.MB.Game_Message_setFaceImage = Game_Message.prototype.setFaceImage;
Game_Message.prototype.setFaceImage = function(faceName, faceIndex) {
	switch (faceName) {
		case 'PartyLeader':
			var faceName = $gameParty.leader().faceName();
			break;
		case 'PartyMember':
			if ($gameParty.members()[faceIndex]) {
				var faceName = $gameParty.members()[faceIndex].faceName();
				var faceIndex = $gameParty.members()[faceIndex].faceIndex();
			} else {
				var faceName = "";
			};
			break;
	};
    Galv.MB.Game_Message_setFaceImage.call(this,faceName,faceIndex);
};

// --- [ BAGIAN YANG DIMODIFIKASI UNTUK AUTO-POSISI ] ---
Galv.MB.Window_Message_startMessage = Window_Message.prototype.startMessage;
Window_Message.prototype.startMessage = function() {
	Galv.MB.msgWindow = this;
    
    // Auto-detect \N[id] dari teks yang diketik
    var rawText = $gameMessage.allText();
    
    if (rawText.match(/\\N\[1\]/i)) {
        // Jika teks mengandung \N[1] (MC)
        $gameSystem.bustPos = 0;       // Set ke Kiri
        $gameSystem.bustMirror = false; // Tampil normal (tidak dibalik)
    } 
    else if (rawText.match(/\\N\[(\d+)\]/i)) {
        // Jika teks mengandung \N[angka selain 1] (NPC / Lawan Bicara)
        var charId = Number(RegExp.$1);
        if (charId !== 1) {
            $gameSystem.bustPos = 1;       // Set ke Kanan
            $gameSystem.bustMirror = true;  // TRUE: otomatis dibalik (mirror) agar menghadap MC.
                                            // Ubah ke 'false' jika gambar NPC Anda sudah menghadap ke kiri dari awal.
        }
    }
    // ------------------------------------------------------

	$gameSystem.bustPos = $gameSystem.bustPos || 0;
	$gameMessage.bustOffset = $gameMessage.bustOffset || Galv.MB.w;
	Galv.MB.Window_Message_startMessage.call(this);
	Galv.MB.msgWindow.tempPosType = this._positionType;
};

Galv.MB.Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
Window_Message.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
    case 'BST':
        this.obtainSpecialParam(textState);
        break;
    }
	Galv.MB.Window_Message_processEscapeCharacter.call(this, code, textState);
};

Window_Message.prototype.obtainSpecialParam = function(textState) {
    var arr = /^\[(.*)]/.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        var txt = arr[0].slice(1).slice(0, - 1);
		var array = txt.split(",");
		$gameMessage.setFaceImage(array[1] || $gameMessage._faceName,Number(array[0] - 1));
    } else {
        return '';
    }
};

Galv.MB.Window_Message_drawMessageFace = Window_Message.prototype.drawMessageFace;
Window_Message.prototype.drawMessageFace = function() {
	if (!$gameSystem.bustDisable) return;
	Galv.MB.Window_Message_drawMessageFace.call(this);
};

if (Galv.MB.prio == 0) {
	Galv.MB.Spriteset_Map_createUpperLayer = Spriteset_Base.prototype.createUpperLayer;
	Spriteset_Base.prototype.createUpperLayer = function() {
		Galv.MB.Spriteset_Map_createUpperLayer.call(this);
		this.createBusts();
	};
	
	Spriteset_Base.prototype.createBusts = function() {
		if (this._msgBustSprite) return;
		this._msgBustSprite = new Sprite_GalvBust();
		this.addChild(this._msgBustSprite);
	};
	
	Galv.MB.Window_Message_newLineX = Window_Message.prototype.newLineX;
	Window_Message.prototype.newLineX = function() {
		if ($gameSystem.bustDisable) {
			return Galv.MB.Window_Message_newLineX.call(this);
		} else {
			return 0;
		};
	};
	
} else {
	Galv.MB.Window_Message_createSubWindows = Window_Message.prototype.createSubWindows;
	Window_Message.prototype.createSubWindows = function() {
		Galv.MB.Window_Message_createSubWindows.call(this);
		if (this._msgBustSprite) return;
		this._msgBustSprite = new Sprite_GalvBust();
		this.addChild(this._msgBustSprite);
	};
	
	Galv.MB.Window_Message_newLineX = Window_Message.prototype.newLineX;
	Window_Message.prototype.newLineX = function() {
		if ($gameSystem.bustDisable) {
			return Galv.MB.Window_Message_newLineX.call(this);
		} else if ($gameMessage.faceName() && Galv.MB.prio == 1 && $gameMessage._positionType == 2 && $gameSystem.bustPos == 0) {
			return $gameMessage.bustOffset;
		} else {
			return 0;
		};
	};
};

})();

function Sprite_GalvBust() {
    this.initialize.apply(this, arguments);
}
Sprite_GalvBust.prototype = Object.create(Sprite.prototype);
Sprite_GalvBust.prototype.constructor = Sprite_GalvBust;

Sprite_GalvBust.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
	this.name = "";
	this.opacity = 0;
    this.update();
};

Sprite_GalvBust.prototype.update = function() {
    Sprite.prototype.update.call(this);
    if (Galv.MB.msgWindow) this.controlBitmap();
};

Sprite_GalvBust.prototype.loadBitmap = function() {
	var name = $gameMessage.faceName() + "_" + ($gameMessage.faceIndex() + 1);
	if ($gameSystem.bustDisable) {
		var img = ImageManager.loadPicture('');
	} else {
		var img = ImageManager.loadPicture(name + Galv.MB.f);
	};
	if (img.isReady()) {
		if (this.bitmap) { this.bitmap = null; }
		this.bitmap = img;
		this.name = name;
		this.hasBust = true;
	};
};

Sprite_GalvBust.prototype.controlBitmap = function() {
	if ($gameMessage.faceName() && this.name !== $gameMessage.faceName() + "_" + ($gameMessage.faceIndex() + 1)) {
    	this.loadBitmap(); 
	};
	
	if (Galv.MB.msgWindow.openness <= 0 || !this.hasBust || $gameSystem.bustDisable) {
		this.opacity = 0;
		this.name = "";
		this.hasBust = false;
		return;
	};

    var scale = Galv.MB.scale;
    var sw = this.bitmap.width * scale;
    var sh = this.bitmap.height * scale;

	if ($gameSystem.bustMirror) {
		this.scale.x = -scale;
		var offset = sw; 
	} else {
		this.scale.x = scale;
		var offset = 0;
	};
    
    this.scale.y = scale; 

	this.opacity = $gameMessage.faceName() ? Galv.MB.msgWindow._openness : this.opacity - Galv.MB.fadeOutSpeed;
	
	switch (Galv.MB.msgWindow.tempPosType) {
	case 0:
		this.y = this.baseY();
		break;
	case 1:
		this.y =  this.baseY() - Galv.MB.msgWindow.y;
		break;
	case 2:
		if (Galv.MB.prio == 1) {
			this.y = Galv.MB.msgWindow.height - sh;
		} else if (Galv.MB.pos === 1) {
			this.y = this.baseY();
		} else {
			this.y = this.baseY() - Galv.MB.msgWindow.height;
		};
		break;
	};
	
    this.y += Galv.MB.yOffset; 
    
	if ($gameSystem.bustPos == 1) {
		if (Galv.MB.prio == 1) {
			this.x = Galv.MB.msgWindow.width - sw + offset;
		} else {
			this.x = Galv.MB.msgWindow.x + Galv.MB.msgWindow.width - sw + offset;
		};
	} else {
		if (Galv.MB.prio == 1) {
			this.x = 0 + offset;
		} else {
			this.x = Galv.MB.msgWindow.x + offset;
		};
	};
};

Sprite_GalvBust.prototype.baseY = function() {
    var scale = Galv.MB.scale;
    var sh = this.bitmap.height * scale;
	if (Galv.Mstyle && Galv.Mstyle.target) {
		return Galv.MB.msgWindow.y + Galv.MB.msgWindow.height - sh;
	} else {
		return Graphics.boxHeight - sh;
	};
};