//=============================================================================
// MOG_TitlePictureCom.js
//=============================================================================

/*:
 * @plugindesc (v1.6 *) Adiciona comandos em imagens no lugar da janela.
 * @author Moghunter
 * 
 * @param -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 * 
 * @param Animation Mode
 * @desc Definição do tipo de animação.
 * 0 - None     1 - Pulse    2 - Shake
 * @default 2
 * @type select
 * @option None
 * @value 0
 * @option Pulse Effect
 * @value 1
 * @option Shake Effect
 * @value 2
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Left & Right Input
 * @desc Ativar a seleção de comandos com as teclas Right/Left.
 * @default true
 * @type boolean
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Com Fade-In Duration
 * @text Fade-In Duration 
 * @desc Faz os comandos aparecerem gradualmente.
 * @default 13
 * @type number
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Slide X-Axis
 * @desc Faz os comandos deslizarem na horizontal.
 * @default -100
 * @type number
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Slide Y-Axis
 * @desc Faz os comandos deslizarem na vertical.
 * @default 0
 * @type number
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Auto Command Layout
 * @desc Ativar o layout automático dos comandos em coluna.
 * @default true
 * @type boolean
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Command Base X-Axis
 * @desc Posição X inicial da coluna de comandos.
 * @default 24
 * @type number
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Command Base Y-Axis
 * @desc Posição Y inicial da coluna de comandos.
 * @default 150
 * @type number
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Command Space X
 * @desc Espaço horizontal entre comandos.
 * @default 0
 * @type number
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Command Space Y
 * @desc Espaço vertical entre comandos.
 * @default 95
 * @type number
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Hidden Command Indexes
 * @desc Índices dos comandos que não devem aparecer. Ex: 3 ou 3,4
 * @default
 * @type string
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Base Screen Width
 * @desc Largura base usada para escalar os comandos.
 * @default 816
 * @type number
 * @min 1
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Base Screen Height
 * @desc Altura base usada para escalar os comandos.
 * @default 624
 * @type number
 * @min 1
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Auto Scale To Screen
 * @desc Escala os comandos automaticamente para a resolução atual.
 * @default true
 * @type boolean
 * @parent -> Main <<<<<<<<<<<<<<<<<<<<<<<
 *   
 * @param
 * 
 * @param -> Smart Background  <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 * 
 * @param Smart Background
 * @text Visible
 * @desc Ativar a imagem de fundo baseado na seleção de comando.
 * @default false
 * @type boolean
 * @parent -> Smart Background  <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Background X-Axis
 * @text X-Axis 
 * @desc Definição X-Axis da imagem de fundo.
 * @default 0
 * @type number
 * @parent -> Smart Background  <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Background Y-Axis
 * @text Y-Axis  
 * @desc Definição Y-Axis da imagem de fundo.
 * @default 0
 * @type number
 * @parent -> Smart Background  <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Background Fade-In Duration
 * @text Fade-In Duration
 * @desc Definição do tempo para apresentar a imagem.
 * @default 90
 * @type number
 * @parent -> Smart Background  <<<<<<<<<<<<<<<<<<<<<<<
 *    
 * @param
 *  
 * @param -> Title Sprite <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 * 
 * @param Title Sprite
 * @text Visible
 * @desc Ativar o nome do título em sprite.
 * É necessário ter o arquivo Logo1.png na pasta img/titles2/
 * @default true
 * @type boolean
 * @parent -> Title Sprite <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Title Sprite X-Axis
 * @text X-Axis
 * @desc Definição X-axis.
 * @default 600
 * @parent -> Title Sprite <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Title Sprite Y-Axis
 * @text Y-Axis
 * @desc Definição Y-axis.
 * @default 150
 * @parent -> Title Sprite <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Fade-In Duration
 * @desc Define o tempo para fazer o título aparecer.
 * @default 40
 * @type number
 * @parent -> Title Sprite <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Zoom Effect
 * @desc Ativar o efeito de zoom.
 * @default true
 * @type boolean
 * @parent -> Title Sprite <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param Zoom Speed
 * @desc Definição do tempo de zoom.
 * @default 40
 * @type number
 * @parent -> Title Sprite <<<<<<<<<<<<<<<<<<<<<<<
 * 
 * @param
 * 
 * @param -> Cursor <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 * 
 * @param Cursor X-Axis
 * @text X-Axis
 * @desc Definição X-axis do cursor.
 * @default 0
 * @parent -> Cursor <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Cursor Y-Axis
 * @text Y-Axis
 * @desc Definição Y-axis do cursor.
 * @default 5
 * @parent -> Cursor <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Cursor Visible
 * @text Visible
 * @desc Ativar cursor.
 * @default true
 * @type boolean
 * @parent -> Cursor <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Cursor Wave Animation
 * @text Wave Animation
 * @desc Ativar animação de deslize.
 * @default true
 * @type boolean
 * @parent -> Cursor <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Cursor Rotation Animation
 * @text Rotation Animation
 * @desc Ativar animação de rotação.
 * @default true
 * @type boolean
 * @parent -> Cursor <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Cursor Rotation Speed
 * @text Rotation Speed
 * @desc Definição da velociade de rotação.
 * @default 0.05
 * @parent -> Cursor <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param
 * 
 * @param -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 * @desc
 * 
 * @param Command Pos 1
 * @desc Definição da posição do comando 1.
 * E.g -     32,32
 * @default 24,460
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Command Pos 2
 * @desc Definição da posição do comando 2.
 * E.g -     32,32
 * @default 24,490
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Command Pos 3
 * @desc Definição da posição do comando 3.
 * E.g -     32,32
 * @default 24,520
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Command Pos 4
 * @desc Definição da posição do comando 4.
 * E.g -     32,32
 * @default 24,550
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Command Pos 5
 * @desc Definição da posição do comando 5.
 * E.g -     32,32
 * @default 24,498
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<< 
 *
 * @param Command Pos 6
 * @desc Definição da posição do comando 6.
 * E.g -     32,32
 * @default 24,530
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Command Pos 7
 * @desc Definição da posição do comando 7.
 * E.g -     32,32
 * @default 24,192
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Command Pos 8
 * @desc Definição da posição do comando 8.
 * E.g -     32,32
 * @default 24,224
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Command Pos 9
 * @desc Definição da posição do comando 9.
 * E.g -     32,32
 * @default 24,256
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @param Command Pos 10
 * @desc Definição da posição do comando 10.
 * E.g -     32,32
 * @default 24,288
 * @parent -> Commands <<<<<<<<<<<<<<<<<<<<<<<
 *
 * @help  
 * =============================================================================
 * +++ MOG - Title Picture Commands (v1.6) +++
 * By Moghunter 
 * https://mogplugins.com
 * =============================================================================
 * Adiciona comandos em imagens no lugar da janela.
 * É necessário ter os arquivos:
 *
 * Command_0.png, Command_1.png, Command_2.png , Command_3.png ... 
 *
 * Grave as imagens na pasta:
 *
 * img/titles2/
 * ============================================================================= 
 * Será necessário também uma imagem representando o cursor.
 *
 * Cursor.png
 *
 * ============================================================================
 * - WHAT'S  NEW (version 1.6) 
 * ============================================================================
 * (BUG FIX) - Correção de alguns plugin parameters não funcionarem.
 *          
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
　　var Imported = Imported || {};
　　Imported.MOG_Picture_Command = true;
　　var Moghunter = Moghunter || {}; 

  　Moghunter.parameters = PluginManager.parameters('MOG_TitlePictureCom');
	Moghunter.title_autoScale = String(Moghunter.parameters['Auto Scale To Screen'] || "true");
	Moghunter.title_baseScreenWidth = Number(Moghunter.parameters['Base Screen Width'] || 816);
	Moghunter.title_baseScreenHeight = Number(Moghunter.parameters['Base Screen Height'] || 624);
	Moghunter.title_autoCommandLayout = String(Moghunter.parameters['Auto Command Layout'] || "true");
	Moghunter.title_commandBaseX = Number(Moghunter.parameters['Command Base X-Axis'] || 24);
	Moghunter.title_commandBaseY = Number(Moghunter.parameters['Command Base Y-Axis'] || 150);
	Moghunter.title_commandSpaceX = Number(Moghunter.parameters['Command Space X'] || 0);
	Moghunter.title_commandSpaceY = Number(Moghunter.parameters['Command Space Y'] || 95);
	Moghunter.title_hiddenCommands = String(Moghunter.parameters['Hidden Command Indexes'] || "");
	Moghunter.titleScaleX = function(value) {
		if (Moghunter.title_autoScale !== "true") {return value};
		return Math.round(value * (Graphics.boxWidth || Graphics.width || 816) / Moghunter.title_baseScreenWidth);
	};
	Moghunter.titleScaleY = function(value) {
		if (Moghunter.title_autoScale !== "true") {return value};
		return Math.round(value * (Graphics.boxHeight || Graphics.height || 624) / Moghunter.title_baseScreenHeight);
	};
	Moghunter.title_sprite = (Moghunter.parameters['Title Sprite'] || false);
	Moghunter.title_x = Number(Moghunter.parameters['Title Sprite X-Axis'] || 300);
	Moghunter.title_y = Number(Moghunter.parameters['Title Sprite Y-Axis'] || 150);
	Moghunter.title_zoomEffect = String(Moghunter.parameters['Zoom Effect'] || "true");
	Moghunter.title_zoomDuration = Number(Moghunter.parameters['Zoom Speed'] || 40); 
	Moghunter.title_FadeInDuration = Number(Moghunter.parameters['Fade-In Duration'] || 40);
	Moghunter.title_comMode = Number(Moghunter.parameters['Animation Mode'] || 2);
	Moghunter.title_ComFadeInDuration = Number(Moghunter.parameters['Com Fade-In Duration'] || 13);
	Moghunter.title_sideInput = String(Moghunter.parameters['Left & Right Input'] || "true");
	Moghunter.title_subPicture = String(Moghunter.parameters['Smart Background'] || "true");
	Moghunter.title_slideXaxis = Moghunter.titleScaleX(Number(Moghunter.parameters['Slide X-Axis'] || -100));
	Moghunter.title_slideYaxis = Moghunter.titleScaleY(Number(Moghunter.parameters['Slide Y-Axis'] || 0));
	Moghunter.title_subPictureX = Number(Moghunter.parameters['Background X-Axis'] || 0);
	Moghunter.title_subPictureY = Number(Moghunter.parameters['Background Y-Axis'] || 0);
	Moghunter.title_subFadeInDuration = Number(Moghunter.parameters['Background Fade-In Duration'] || 90); 
	Moghunter.title_cursorVisible = String(Moghunter.parameters['Cursor Visible'] || "true");
	Moghunter.title_cursorSlide = String(Moghunter.parameters['Cursor Wave Animation'] || "true");
	Moghunter.title_cursorX = Number(Moghunter.parameters['Cursor X-Axis'] || 8);
	Moghunter.title_cursorY = Number(Moghunter.parameters['Cursor Y-Axis'] || -10);	
	Moghunter.title_cursorRot = String(Moghunter.parameters['Cursor Rotation Animation'] || "true");
	Moghunter.title_cursorRotSpeed = Number(Moghunter.parameters['Cursor Rotation Speed'] || 0.05);
	Moghunter.title_com_pos = [];
	for (var i = 0; i < 10; i++) {
		Moghunter.title_com_pos[i] = (Moghunter.parameters['Command Pos ' + String(i + 1)] || null);
	};	
	
//=============================================================================
// ** Window_TitleCommand
//=============================================================================	

//==============================
// * updatePlacement
//==============================
var _alias_mog_title_picture_commands_updatePlacement = Scene_Title.prototype.updatePlacement;
Window_TitleCommand.prototype.updatePlacement = function() {
   this.x = -Graphics.boxWidth;
	this.y = -Graphics.boxHeight;
   this.visible = false;
};

//=============================================================================
// ** Scene Base
//=============================================================================

//==============================
// ** create Hud Field
//==============================
Scene_Base.prototype.createHudField = function() {
	this._hudField = new Sprite();
	this._hudField.z = 10;
	this.addChild(this._hudField);
};

//==============================
// ** sort MZ
//==============================
Scene_Base.prototype.sortMz = function() {
   this._hudField.children.sort(function(a, b){return a.mz-b.mz});
};


//=============================================================================
// ** Scene Title
//=============================================================================	

//==============================
// * Create
//==============================
var _mog_title_picture_commands_create = Scene_Title.prototype.create;
Scene_Title.prototype.create = function() {
    _mog_title_picture_commands_create.call(this);
	if (!this._hudField) {this.createHudField()};
	this._sideInput = String(Moghunter.title_sideInput) == "true" ? true : false;
	this._comSave = this._commandWindow.isContinueEnabled();
	this._comInitVis = true;
    this.createComSprites();
	this.sortMz();
};

//==============================
// * set tcp
//==============================
Scene_Title.prototype.set_tcp = function(value) {
	if (!value) {return null};
	var s = value.split(',');
	if (!s[0] || !s[1]) {return null};
	var commandX = Number(s[0]);
	if (commandX > 60) {commandX = 24};
	return  [Moghunter.titleScaleX(commandX),Moghunter.titleScaleY(Number(s[1]))];
};

//==============================
// * Hidden Command Index List
//==============================
Scene_Title.prototype.hiddenCommandIndexes = function() {
	if (!this._hiddenCommandIndexes) {
		this._hiddenCommandIndexes = [];
		var list = String(Moghunter.title_hiddenCommands || "").split(',');
		for (var i = 0; i < list.length; i++) {
			var text = String(list[i] || "").trim();
			if (!text) {continue};
			var index = Number(text);
			if (!isNaN(index)) {this._hiddenCommandIndexes.push(index)};
		}
	}
	return this._hiddenCommandIndexes;
};

//==============================
// * Is Hidden Command
//==============================
Scene_Title.prototype.isHiddenCommandIndex = function(index) {
	return this.hiddenCommandIndexes().indexOf(index) >= 0;
};

//==============================
// * Next Visible Command
//==============================
Scene_Title.prototype.nextVisibleCommandIndex = function(index, direction) {
	var maxIndex = this._commandWindow._list.length - 1;
	var nextIndex = index;
	for (var i = 0; i <= maxIndex; i++) {
		nextIndex += direction;
		if (nextIndex < 0) {nextIndex = maxIndex};
		if (nextIndex > maxIndex) {nextIndex = 0};
		if (!this.isHiddenCommandIndex(nextIndex)) {return nextIndex};
	}
	return index;
};

//==============================
// * create Com Sprites
//==============================
Scene_Title.prototype.createComSprites = function(value) {
    if (Moghunter.title_comMode == 1) {
		this._com_pulse = true;
		this._comshake = false;	
	} else if (Moghunter.title_comMode == 2) {
		this._com_pulse = false;
		this._comshake = true;		
	} else {
		this._com_pulse = false;
		this._comshake = false;
	};
    this.createPictureCommands();
	if (String(Moghunter.title_subPicture) == "true") {this.createSubPicture()};
	if (String(Moghunter.title_cursorVisible) == "true") {this.createCursorCommand()};
	if (String(Moghunter.title_sprite) == "true") {this.createTitleSprite();}
};

//==============================
// * Create Cursor Command
//==============================
Scene_Title.prototype.createCursorCommand = function() {
	this._cursorSlide = [0,0,0,false];
	if (String(Moghunter.title_cursorSlide) == "true") {this._cursorSlide[3] = true};
    this._cursor = new Sprite(ImageManager.loadTitle2("Cursor"));
	this._cursor.anchor.x = 0.5;
	this._cursor.anchor.y = 0.5;
	this._cursor.org = [Moghunter.titleScaleX(Moghunter.title_cursorX),Moghunter.titleScaleY(Moghunter.title_cursorY)]
	if (this._cursorSlide[3]) {this._cursor.org[0] -= 5}
	this._cursor.opacity = 0;
	this._cursor.mz = 500;
	this._cursor.rot = [true,0.05];
	this._cursor.rot[0] = String(Moghunter.title_cursorRot) == "true" ? true : false;
	this._cursor.rot[1] = Moghunter.title_cursorRotSpeed;
	this._hudField.addChild(this._cursor);
};

//==============================
// * Com Sprite
//==============================
Scene_Title.prototype.comSprite = function() {
    for (var i = 0; i < this._com_sprites.length; i++) {
		if (this._com_sprites[i].commandIndex === this._commandWindow._index) {return this._com_sprites[i]};
	}
	return this._com_sprites[0];
};

//==============================
// * update Cursor
//==============================
Scene_Title.prototype.updateCursor = function() {
	 if (!this._comInitVis) {return}; 
	 if (this._cursorSlide[3]) {this.updateCursorSlide()};
	 if (this._cursor.rot[0]) {this.updateCursorRotation()}; 
   	 this._cursor.opacity += 5;
 	 var nx = this.comSprite().x - (this.comSprite().bitmap.width / 2) - (this._cursor.width / 2) + this._cursorSlide[0] - this.comSprite().shake[0] + this._cursor.org[0]//+ (this._cursor.width / 2)  + this._cursorSlide[0];
	 var ny = this.comSprite().y - (this.comSprite().bitmap.height / 2) + (this._cursor.height / 2) + this._cursor.org[1];
     this._cursor.x = this.cursorMoveto(this._cursor.x , nx, 10);
	 this._cursor.y = this.cursorMoveto(this._cursor.y, ny, 10);
};

//==============================
// * Uodate Cursor Rotation
//==============================
Scene_Title.prototype.updateCursorRotation = function() {
    this._cursor.rotation += this._cursor.rot[1];
};

//==============================
// * update Cursor Slide
//==============================
Scene_Title.prototype.updateCursorSlide = function() {
     this._cursorSlide[1] ++
	 if (this._cursorSlide[1] < 3) {return};
	 this._cursorSlide[1] = 0
	 this._cursorSlide[2] ++
	 if (this._cursorSlide[2] < 15) {
		 this._cursorSlide[0] ++;
	 } else if (this._cursorSlide[2] < 30) {
		 this._cursorSlide[0] --;
	 } else {
		 this._cursorSlide[0] = 0;
		 this._cursorSlide[2] = 0;
	 };
};

//==============================
// * Sprite Move To
//==============================
Scene_Title.prototype.cursorMoveto = function(value,real_value,speed) {
	if (value == real_value) {return value};
	var dnspeed = 3 + (Math.abs(value - real_value) / speed);
	if (value > real_value) {value -= dnspeed;
	    if (value < real_value) {value = real_value};}
    else if (value < real_value) {value  += dnspeed;
    	if (value  > real_value) {value  = real_value};		
    };
	return Math.floor(value);
};

//==============================
// * Create Picture Commands
//==============================
Scene_Title.prototype.createPictureCommands = function() {
	this._com_position = [];
	this._com_indexMap = [];
	var visibleIndex = 0;
	if (Moghunter.title_autoCommandLayout === "true") {
		for (var i = 0; i < this._commandWindow._list.length; i++) {
			if (this.isHiddenCommandIndex(i)) {continue};
			this._com_position[visibleIndex] = [
				Moghunter.titleScaleX(Moghunter.title_commandBaseX + (Moghunter.title_commandSpaceX * visibleIndex)),
				Moghunter.titleScaleY(Moghunter.title_commandBaseY + (Moghunter.title_commandSpaceY * visibleIndex))
			];
			this._com_indexMap[visibleIndex] = i;
			visibleIndex++;
		};
	} else {
		for (var i = 0; i < 10; i++) {
			if (this.isHiddenCommandIndex(i)) {continue};
			this._com_position[visibleIndex] = this.set_tcp(Moghunter.title_com_pos[i]);
			this._com_indexMap[visibleIndex] = i;
			visibleIndex++;
		}
	};
	var _com_index_old = -2;
	if (this._subPic) {this.createSubPicture()};
	this._csel = false;
	this._com_int = true;
	this._com_pictures = [];
	this._com_sprites = [];	
	this._com_pictures_data = [];
	for (i = 0; i < this._com_indexMap.length; i++){
		var commandIndex = this._com_indexMap[i];
	    this._com_pictures[i] = ImageManager.loadTitle2("Command_" + commandIndex);
		this._com_sprites[i] = new Sprite(this._com_pictures[i]);
		this._com_sprites[i].org = [0,0];
		this._com_sprites[i].shake = [0,0,0];
		this._com_sprites[i].pulse = [0,0,0];
		this._com_sprites[i].mz = commandIndex + 200;
		this._com_sprites[i].wait = 0;
		this._com_sprites[i].enabled = true;
		this._com_sprites[i].anchor.x = 0.5;
		this._com_sprites[i].anchor.y = 0.5;
		this._com_sprites[i].size = [0,0];
		this._com_sprites[i].commandIndex = commandIndex;
		this._com_sprites[i].visibleIndex = i;
	    this._hudField.addChild(this._com_sprites[i]);	
	};
};

//==============================
// * Create Sub Picture
//==============================
Scene_Title.prototype.createSubPicture = function() {
    this._subPictures = [];
	for (i = 0; i < this._commandWindow._list.length; i++){
		this._subPictures[i] = ImageManager.loadTitle2("Sub_" + i);
	};
	this._subPic = new Sprite();
	this._subPic.x = Moghunter.titleScaleX(Moghunter.title_subPictureX);
	this._subPic.y = Moghunter.titleScaleY(Moghunter.title_subPictureY);
	this._subPic.mz = 130;
	this._subPic.index = -1;
	this._subPic.opacity = 0;
	this._subPic.wait = Moghunter.title_subFadeInDuration;
	this._hudField.addChild(this._subPic);		
};

//==============================
// * Refresh Com Sub Pic
//==============================
Scene_Title.prototype.refreshComSubPic = function() {
	this._subPic.index = this._commandWindow._index;
 	this._subPic.opacity = 0;
	this._subPic.bitmap = this._subPictures[this._subPic.index];
};

//==============================
// * update ComSubPic
//==============================
Scene_Title.prototype.updateComSubPic = function() {
   if (this._subPic.index != this._commandWindow._index) {this.refreshComSubPic()};
   if (this._subPic.wait > 0) {this._subPic.wait--;return};
   this._subPic.opacity += 2;  
};


//==============================
// * Refresh Picture Command
//==============================
Scene_Title.prototype.refresh_picture_command = function() {
	this._com_index_old = this._commandWindow._index;
	for (i = 0; i < this._com_sprites.length; i++){
		var commandIndex = this._com_sprites[i].commandIndex;
		if (this._commandWindow._index != commandIndex) {
           var chr = this._com_pictures[i].height / 2;
		   this._com_sprites[i].shake = [0,0,0];
		} else {
		   var chr = 0;
		   this._com_sprites[i].shake = [0,10,0];
      	}
		this.cpsx = [this._com_position[i][0],this._com_position[i][1]];
		if (this._commandWindow._list[commandIndex].symbol == 'continue' && !this._comSave) {this._com_sprites[i].enabled = false};
		var cw = this._com_sprites[i].bitmap.width / 2;
		var ch = this._com_sprites[i].bitmap.height / 2;
		this._com_sprites[i].size = [cw,ch]
		this._com_sprites[i].setFrame(0, chr, this._com_pictures[i].width, this._com_pictures[i].height / 2);
		this._com_sprites[i].x = this.cpsx[0] + cw;
		this._com_sprites[i].y = this.cpsx[1] + ch;
		this._com_sprites[i].org = [this._com_sprites[i].x,this._com_sprites[i].y];
		this._com_pictures_data[i] = [];
		this._com_pictures_data[i][0] = this._com_sprites[i].x - cw;
		this._com_pictures_data[i][1] = this._com_sprites[i].x + cw;
		this._com_pictures_data[i][2] = this._com_sprites[i].y - (ch / 2);
		this._com_pictures_data[i][3] = this._com_sprites[i].y + (ch / 2);
		this._com_sprites[i].pulse = [0,0,0];
		if (!this._comshake) {this._com_sprites[i].shake[1] = 0};
		if ( this._com_int) {
			this._com_sprites[i].x += Moghunter.title_slideXaxis;
			this._com_sprites[i].y += Moghunter.title_slideYaxis;
			this._com_sprites[i].shake[1] = 0
			this._com_sprites[i].wait = 10 + (Moghunter.title_ComFadeInDuration * i);
			this._com_sprites[i].opacity = 0;
		};
	}; 
	this._com_int = false;
};

//==============================
// * Update Com Input
//==============================
Scene_Title.prototype.updateComInput = function() {
	if (TouchInput.isTriggered()) {
		for (i = 0; i < this._com_sprites.length; i++){
			if (this.on_picture_com(i) && !this._csel ) {				
				this._commandWindow._index = this._com_sprites[i].commandIndex;	 this._commandWindow.processOk();
	            if (this._commandWindow.isCommandEnabled(this._commandWindow._index)) {this._csel = true};
		   };		
		};
	};
	if (this._sideInput) {this.updateComSideInput()};
};

//==============================
// * Update Com Side Inout
//==============================
Scene_Title.prototype.updateComSideInput = function() {
    if (Input.isRepeated('right')) {
		this.addTitleComIndex(1);
	} else if (Input.isRepeated('left')) {
		this.addTitleComIndex(-1);
	};
};

//==============================
// * add Title ComIndex
//==============================
Scene_Title.prototype.addTitleComIndex = function(value) {
    SoundManager.playCursor();
	var maxIndex = this._commandWindow._list.length - 1
	var nextIndex = this._commandWindow._index;
	do {
		nextIndex += value;
		if (nextIndex < 0) {nextIndex = maxIndex};
		if (nextIndex > maxIndex) {nextIndex = 0};
	} while (this.isHiddenCommandIndex(nextIndex));
	this._commandWindow._index = nextIndex;
};

//==============================
// * Update Com Shake
//==============================
Scene_Title.prototype.updateComShake = function(sprite) {
	sprite.shake[2]++;
	if (sprite.shake[2] < 2) {return};
	sprite.shake[2] = 0
    sprite.shake[1]--;
	sprite.shake[0] = - 2 + Math.randomInt(4);
	if (sprite.shake[1] == 0) {	sprite.shake[0] = 0};
};

//==============================
// * Update Com Pulse
//==============================
Scene_Title.prototype.updateComPulse = function(sprite,enable) {
   if (enable) {
	   if (sprite.pulse[0] == 0) {
		   sprite.scale.x += 0.01;
		   if (sprite.scale.x >= 1.25) {
			   sprite.scale.x = 1.25;
			   sprite.pulse[0] = 1;
		   };
	   } else {
		   sprite.scale.x -= 0.01;
		   if (sprite.scale.x <= 1.00) {
			   sprite.scale.x = 1.00;
			   sprite.pulse[0] = 0;
		   };	    
	   };
   } else {
	   if (sprite.scale.x > 1.00) {
		   sprite.scale.x -= 0.01;
	   };
   };
   sprite.scale.y = sprite.scale.x;
};

//==============================
// * Update Picture Commands
//==============================
Scene_Title.prototype.updateCommandsPic = function(sprite,enable) {
	if (sprite.wait > 0) {sprite.wait--;return};
	if (this._subPic) {this.updateComSubPic()};
	if (sprite.shake[1] > 0) {this.updateComShake(sprite)};
    if (this._com_pulse) {this.updateComPulse(sprite,enable)};	
	var nx = sprite.org[0] + sprite.shake[0];
	var ny = sprite.org[1];
    sprite.x = this.cursorMoveto(sprite.x , nx, 60);
	sprite.y = this.cursorMoveto(sprite.y, ny, 60);	
	sprite.opacity += 5;
	if (!sprite.enabled && sprite.opacity > 160) {sprite.opacity = 160};
};

//==============================
// * On Picture Com
//==============================
Scene_Title.prototype.on_picture_com = function(index) {
	 if (TouchInput.x < this._com_pictures_data[index][0]) { return false};
	 if (TouchInput.x > this._com_pictures_data[index][1]) { return false};
	 if (TouchInput.y < this._com_pictures_data[index][2]) { return false};
	 if (TouchInput.y > this._com_pictures_data[index][3]) { return false};
	 return true;	 
};

//==============================
// * Create Title Sprite
//==============================
Scene_Title.prototype.createTitleSprite = function() {
	if (this._gameTitleSprite) {this.removeChild(this._gameTitleSprite)};
    this._gameTitleSprite = new Sprite(ImageManager.loadTitle2("Logo1"));
    this._hudField.addChild(this._gameTitleSprite);
	this._gameTitleSprite.mz = 250;
	this._gameTitleSprite.x = Moghunter.titleScaleX(Moghunter.title_x);
	this._gameTitleSprite.y = Moghunter.titleScaleY(Moghunter.title_y);
	this._gameTitleSprite.anchor.x = 0.5;
	this._gameTitleSprite.anchor.y = 0.5;
	this._gameTitleSprite.wait = 30;
	this._gameTitleSprite.opacity = 0;
    this._gameTitleSprite.zoomEffect = Moghunter.title_zoomEffect == "true" ? true : false;
	this._gameTitleSprite.fadeInDuration = Moghunter.title_zoomDuration;
	this._gameTitleSprite.zoomSpd = 0.50 / this._gameTitleSprite.fadeInDuration;
	this._gameTitleSprite.opcSpd = 150 / this._gameTitleSprite.fadeInDuration;
	if (this._gameTitleSprite.zoomEffect) {
		this._gameTitleSprite.scale.x = 1.50
		this._gameTitleSprite.scale.y = this._gameTitleSprite.scale.x;
	};
};

//==============================
// * update Title Sprite
//==============================
Scene_Title.prototype.updateTitleSprite = function() {
	 if (this._gameTitleSprite.wait > 0) {this._gameTitleSprite.wait--;return};
	 this._gameTitleSprite.opacity += this._gameTitleSprite.opcSpd;
	 if (this._gameTitleSprite.scale.x > 1.00) {
		 this._gameTitleSprite.scale.x -= this._gameTitleSprite.zoomSpd  
		 if (this._gameTitleSprite.scale.x <= 1.00) {this._gameTitleSprite.scale.x = 1.00};
	 };
	 this._gameTitleSprite.scale.y = this._gameTitleSprite.scale.x;
};

//==============================
// * Update Picture Commands
//==============================
Scene_Title.prototype.updatePictureCommands = function() {
	this._comInitVis = true;
	for (i = 0; i < this._com_sprites.length; i++){
		var sprite = this._com_sprites[i];
		var enable = sprite.commandIndex == this._commandWindow._index ? true : false;
	    this.updateCommandsPic(sprite,enable);
	};	
	if (!this._comInitVis) {return};
	if (this._com_index_old != this._commandWindow._index) {this.refresh_picture_command()};
	this.updateComInput();
	this.updateTitleSprite();
	if (this._cursor) {this.updateCursor()};
};

//==============================
// * Update
//==============================
var _mog_title_picture_commands_update = Scene_Title.prototype.update;
Scene_Title.prototype.update = function() {
    _mog_title_picture_commands_update.call(this);
	this.updatePictureCommands();
};

//==============================
// * Rebuild Command Positions (called by DevPluginEditor for live-update)
//==============================
Scene_Title.prototype.rebuildCommandPositions = function() {
    if (!this._com_sprites || !this._com_position) return;
    var visibleIndex = 0;
    for (var i = 0; i < this._commandWindow._list.length; i++) {
        if (this.isHiddenCommandIndex(i)) continue;
        if (Moghunter.title_autoCommandLayout === 'true') {
            var nx = Moghunter.titleScaleX(Moghunter.title_commandBaseX + (Moghunter.title_commandSpaceX * visibleIndex));
            var ny = Moghunter.titleScaleY(Moghunter.title_commandBaseY + (Moghunter.title_commandSpaceY * visibleIndex));
            this._com_position[visibleIndex] = [nx, ny];
        }
        if (this._com_sprites[visibleIndex]) {
            var pos = this._com_position[visibleIndex];
            if (pos) {
                var cw = this._com_sprites[visibleIndex].size ? this._com_sprites[visibleIndex].size[0] : 0;
                var ch = this._com_sprites[visibleIndex].size ? this._com_sprites[visibleIndex].size[1] : 0;
                this._com_sprites[visibleIndex].org = [pos[0] + cw, pos[1] + ch];
                this._com_sprites[visibleIndex].x   = pos[0] + cw;
                this._com_sprites[visibleIndex].y   = pos[1] + ch;
            }
        }
        visibleIndex++;
    }
};