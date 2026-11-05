//=============================================================================
// MOG_SceneStatus.js
//=============================================================================

/*:
 * @plugindesc (v1.0) Modifica a cena de status.
 * @author Moghunter
 *
 * @param Bust X-Axis
 * @desc Definição X-Axis da imagem do personagem.
 * @default 600
 *
 * @param Bust Y-Axis
 * @desc Definição Y-Axis da imagem do personagem.
 * @default 0
 *
 * @param States X-Axis
 * @desc Definição X-Axis das condições.
 * @default 59
 *
 * @param States Y-Axis
 * @desc Definição Y-Axis das condições.
 * @default 120
 *
 * @param Name X-Axis
 * @desc Definição X-Axis do nome.
 * @default 190
 *
 * @param Name Y-Axis
 * @desc Definição Y-Axis do nome.
 * @default 103
 *
 * @param Level X-Axis
 * @desc Definição X-Axis do level.
 * @default 290
 *
 * @param Level Y-Axis
 * @desc Definição Y-Axis do level.
 * @default 6
 *
 * @param Exp X-Axis
 * @desc Definição X-Axis da experiência.
 * @default 440
 *
 * @param Exp Y-Axis
 * @desc Definição Y-Axis da experiência.
 * @default 6
 *
 * @param Next Exp X-Axis
 * @desc Definição X-Axis da experiência necessária.
 * @default 660
 *
 * @param Next Exp Y-Axis
 * @desc Definição Y-Axis da experiência necessária.
 * @default 6
 *
 * @param HP Number X-Axis
 * @desc Definição X-Axis do número de HP.
 * @default 50
 *
 * @param HP Number Y-Axis
 * @desc Definição Y-Axis do número de HP.
 * @default 155
 *
 * @param HP Meter X-Axis
 * @desc Definição X-Axis do medidor de HP.
 * @default 45
 *
 * @param HP Meter Y-Axis
 * @desc Definição Y-Axis do medidor de HP.
 * @default 210
 * 
 * @param MP Number X-Axis
 * @desc Definição X-Axis do número de MP.
 * @default 208
 *
 * @param MP Number Y-Axis
 * @desc Definição Y-Axis do número de HP.
 * @default 155
 *
 * @param MP Meter X-Axis
 * @desc Definição X-Axis do medidor de MP.
 * @default 203
 *
 * @param MP Meter Y-Axis
 * @desc Definição Y-Axis do medidor de MP.
 * @default 210
 * 
 * @param TP Number X-Axis
 * @desc Definição X-Axis do número de TP.
 * @default 366
 *
 * @param TP Number Y-Axis
 * @desc Definição Y-Axis do número de TP.
 * @default 155
 *
 * @param TP Meter X-Axis
 * @desc Definição X-Axis do medidor de TP.
 * @default 361
 *
 * @param TP Meter Y-Axis
 * @desc Definição Y-Axis do medidor de TP.
 * @default 210
 * 	
 * @param ATK Number X-Axis
 * @desc Definição X-Axis do número de ATK.
 * @default 50
 *
 * @param ATK Number Y-Axis
 * @desc Definição Y-Axis do número de ATK.
 * @default 211
 *
 * @param ATK Meter X-Axis
 * @desc Definição X-Axis do medidor de ATK.
 * @default 45
 *
 * @param ATK Meter Y-Axis
 * @desc Definição Y-Axis do medidor de ATK.
 * @default 266
 * 	
 * @param MAT Number X-Axis
 * @desc Definição X-Axis do número de MAT.
 * @default 208
 *
 * @param MAT Number Y-Axis
 * @desc Definição Y-Axis do número de MAT.
 * @default 211
 *
 * @param MAT Meter X-Axis
 * @desc Definição X-Axis do medidor de MAT.
 * @default 203
 *
 * @param MAT Meter Y-Axis
 * @desc Definição Y-Axis do medidor de MAT.
 * @default 266
 * 	
 * @param AGI Number X-Axis
 * @desc Definição X-Axis do número de AGI.
 * @default 366
 *
 * @param AGI Number Y-Axis
 * @desc Definição Y-Axis do número de AGI.
 * @default 211
 *
 * @param AGI Meter X-Axis
 * @desc Definição X-Axis do medidor de AGI.
 * @default 361
 *
 * @param AGI Meter Y-Axis
 * @desc Definição Y-Axis do medidor de AGI.
 * @default 266
 * 	
 * @param DEF Number X-Axis
 * @desc Definição X-Axis do número de DEF.
 * @default 50
 *
 * @param DEF Number Y-Axis
 * @desc Definição Y-Axis do número de DEF.
 * @default 267
 *
 * @param DEF Meter X-Axis
 * @desc Definição X-Axis do medidor de DEF.
 * @default 45
 *
 * @param DEF Meter Y-Axis
 * @desc Definição Y-Axis do medidor de AGI.
 * @default 322
 * 				
 * @param MDF Number X-Axis
 * @desc Definição X-Axis do número de MDF.
 * @default 208
 *
 * @param MDF Number Y-Axis
 * @desc Definição Y-Axis do número de MDF.
 * @default 267
 *
 * @param MDF Meter X-Axis
 * @desc Definição X-Axis do medidor de MDF.
 * @default 203
 *
 * @param MDF Meter Y-Axis
 * @desc Definição Y-Axis do medidor de MDF.
 * @default 322
 * 		
 * @param LUK Number X-Axis
 * @desc Definição X-Axis do número de LUK.
 * @default 368
 *
 * @param LUK Number Y-Axis
 * @desc Definição Y-Axis do número de LUK.
 * @default 267
 *
 * @param LUK Meter X-Axis
 * @desc Definição X-Axis do medidor de LUK.
 * @default 361
 *
 * @param LUK Meter Y-Axis
 * @desc Definição Y-Axis do medidor de LUK.
 * @default 322
 * 
 * @param Weapon X-Axis
 * @desc Definição X-Axis da arma.
 * @default 7
 *
 * @param Weapon Y-Axis
 * @desc Definição Y-Axis do arma.
 * @default 347
 *		
 * @param Shield X-Axis
 * @desc Definição X-Axis do escudo.
 * @default 7
 *
 * @param Shield Y-Axis
 * @desc Definição Y-Axis do escudo.
 * @default 398
 *		
 * @param Helmet X-Axis
 * @desc Definição X-Axis do capacete.
 * @default 7
 *
 * @param Helmet Y-Axis
 * @desc Definição Y-Axis do capacete.
 * @default 449
 *	
 * @param Armor X-Axis
 * @desc Definição X-Axis da armadura.
 * @default 261
 *
 * @param Armor Y-Axis
 * @desc Definição Y-Axis da armadura.
 * @default 376
 *	
 * @param Accessory X-Axis
 * @desc Definição X-Axis do acessório.
 * @default 261
 *
 * @param Accessory Y-Axis
 * @desc Definição Y-Axis do acessório.
 * @default 427
 *	
 * @param Class X-Axis
 * @desc Definição X-Axis da classe.
 * @default 260
 *
 * @param Class Y-Axis
 * @desc Definição Y-Axis da classe.
 * @default 320
 *	
 * @param Profile X-Axis
 * @desc Definição X-Axis do Profile.
 * @default 0
 *
 * @param Profile Y-Axis
 * @desc Definição Y-Axis do Profile.
 * @default 505
 *	
 * @param Soul X-Axis
 * @desc Definição X-Axis da gambar Soul.
 * @default 0
 *
 * @param Soul Y-Axis
 * @desc Definição Y-Axis da gambar Soul.
 * @default 0
 *
 * @param Bust Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param Layout Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param States Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param HP Meter Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param MP Meter Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param TP Meter Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param ATK Meter Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param MAT Meter Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param AGI Meter Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param DEF Meter Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param MDF Meter Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param LUK Meter Scale
 * @desc Skala (Ukuran) untuk gambar.
 * @default 1.00
 *
 * @param Name Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Level Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Exp Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Next Exp Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param HP Number Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param MP Number Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param TP Number Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param ATK Number Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param MAT Number Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param AGI Number Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param DEF Number Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param MDF Number Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param LUK Number Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Class Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Profile Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Weapon Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Shield Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Helmet Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Armor Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *
 * @param Accessory Font Size
 * @desc Font Size (Ukuran Huruf) untuk teks.
 * @default 22
 *

 * @help  
 * =============================================================================
 * +++ MOG - Scene Status (v1.0) +++
 * By Moghunter 
 * https://mogplugins.com
 * =============================================================================
 * Modifica a cena de status.
 *
 * =============================================================================
 * UTILIZAÇÃO
 * =============================================================================
 * As imagens do sistema deverão ser gravados na pasta.
 *
 * /img/menus/status/
 *
 * =============================================================================
 *
 * @param Bust Scale
 * @desc Skala untuk gambar Bust.
 * @default 1.00
 *
 * @param Soul X-Axis
 * @desc Koordinat X untuk gambar Soul.
 * @default 0
 *
 * @param Soul Y-Axis
 * @desc Koordinat Y untuk gambar Soul.
 * @default 0
 *
 * @param HP Meter Scale
 * @desc Skala untuk meteran HP.
 * @default 1.00
 *
 * @param MP Meter Scale
 * @desc Skala untuk meteran MP.
 * @default 1.00
 *
 * @param TP Meter Scale
 * @desc Skala untuk meteran TP.
 * @default 1.00
 *
 * @param ATK Meter Scale
 * @desc Skala untuk meteran ATK.
 * @default 1.00
 *
 * @param MAT Meter Scale
 * @desc Skala untuk meteran MAT.
 * @default 1.00
 *
 * @param AGI Meter Scale
 * @desc Skala untuk meteran AGI.
 * @default 1.00
 *
 * @param DEF Meter Scale
 * @desc Skala untuk meteran DEF.
 * @default 1.00
 *
 * @param MDF Meter Scale
 * @desc Skala untuk meteran MDF.
 * @default 1.00
 *
 * @param LUK Meter Scale
 * @desc Skala untuk meteran LUK.
 * @default 1.00
 *
 * @param Layout Scale
 * @desc Skala untuk layout menu status.
 * @default 1.00
 *
 * @param States Scale
 * @desc Skala untuk icon status.
 * @default 1.00
 *
 * @param Name Font Size
 * @desc Ukuran font untuk nama.
 * @default 24
 *
 * @param Level Font Size
 * @desc Ukuran font untuk level.
 * @default 24
 *
 * @param Exp Font Size
 * @desc Ukuran font untuk EXP.
 * @default 24
 *
 * @param Next Exp Font Size
 * @desc Ukuran font untuk Next EXP.
 * @default 24
 *
 * @param HP Number Font Size
 * @desc Ukuran font untuk angka HP.
 * @default 22
 *
 * @param MP Number Font Size
 * @desc Ukuran font untuk angka MP.
 * @default 22
 *
 * @param TP Number Font Size
 * @desc Ukuran font untuk angka TP.
 * @default 22
 *
 * @param ATK Number Font Size
 * @desc Ukuran font untuk angka ATK.
 * @default 22
 *
 * @param MAT Number Font Size
 * @desc Ukuran font untuk angka MAT.
 * @default 22
 *
 * @param AGI Number Font Size
 * @desc Ukuran font untuk angka AGI.
 * @default 22
 *
 * @param DEF Number Font Size
 * @desc Ukuran font untuk angka DEF.
 * @default 22
 *
 * @param MDF Number Font Size
 * @desc Ukuran font untuk angka MDF.
 * @default 22
 *
 * @param LUK Number Font Size
 * @desc Ukuran font untuk angka LUK.
 * @default 22
 *
 * @param Class Font Size
 * @desc Ukuran font untuk Class.
 * @default 22
 *
 * @param Profile Font Size
 * @desc Ukuran font untuk Profile.
 * @default 22
 *
 * @param Weapon Font Size
 * @desc Ukuran font untuk Weapon.
 * @default 22
 *
 * @param Shield Font Size
 * @desc Ukuran font untuk Shield.
 * @default 22
 *
 * @param Helmet Font Size
 * @desc Ukuran font untuk Helmet.
 * @default 22
 *
 * @param Armor Font Size
 * @desc Ukuran font untuk Armor.
 * @default 22
 *
 * @param Accessory Font Size
 * @desc Ukuran font untuk Accessory.
 * @default 22
 */

//=============================================================================
// ** PLUGIN PARAMETERS
//=============================================================================
　　var Imported = Imported || {};
　　Imported.MOG_SceneStatus = true;
　　var Moghunter = Moghunter || {}; 

  　Moghunter.parameters = PluginManager.parameters('MOG_SceneStatus');  
	Moghunter.scStatus_BustX = Number(Moghunter.parameters['Bust X-Axis'] || 600);
	Moghunter.scStatus_BustY = Number(Moghunter.parameters['Bust Y-Axis'] || 0);
	Moghunter.scStatus_StatesX = Number(Moghunter.parameters['States X-Axis'] || 59);
	Moghunter.scStatus_StatesY = Number(Moghunter.parameters['States Y-Axis'] || 120);
	Moghunter.scStatus_ActorNameX = Number(Moghunter.parameters['Name X-Axis'] || 190);
	Moghunter.scStatus_ActorNameY = Number(Moghunter.parameters['Name Y-Axis'] || 103);
	Moghunter.scStatus_LevelX = Number(Moghunter.parameters['Level X-Axis'] || 290);
	Moghunter.scStatus_LevelY = Number(Moghunter.parameters['Level Y-Axis'] || 6);
	Moghunter.scStatus_ExpX = Number(Moghunter.parameters['Exp X-Axis'] || 440);
	Moghunter.scStatus_ExpY = Number(Moghunter.parameters['Exp Y-Axis'] || 6);
	Moghunter.scStatus_NExpX = Number(Moghunter.parameters['Next Exp X-Axis'] || 680);
	Moghunter.scStatus_NExpY = Number(Moghunter.parameters['Next Exp Y-Axis'] || 6);
	Moghunter.scStatus_HPNumberX = Number(Moghunter.parameters['HP Number X-Axis'] || 50);
	Moghunter.scStatus_HPNumberY = Number(Moghunter.parameters['HP Number Y-Axis'] || 155);
	Moghunter.scStatus_MeterHPX = Number(Moghunter.parameters['HP Meter X-Axis'] || 45);
	Moghunter.scStatus_MeterHPY = Number(Moghunter.parameters['HP Meter Y-Axis'] || 210);	
	Moghunter.scStatus_MPNumberX = Number(Moghunter.parameters['MP Number X-Axis'] || 208);
	Moghunter.scStatus_MPNumberY = Number(Moghunter.parameters['MP Number Y-Axis'] || 155);
	Moghunter.scStatus_MeterMPX = Number(Moghunter.parameters['MP Meter X-Axis'] || 203);
	Moghunter.scStatus_MeterMPY = Number(Moghunter.parameters['MP Meter Y-Axis'] || 210);	
	Moghunter.scStatus_TPNumberX = Number(Moghunter.parameters['TP Number X-Axis'] || 366);
	Moghunter.scStatus_TPNumberY = Number(Moghunter.parameters['TP Number Y-Axis'] || 155);
	Moghunter.scStatus_MeterTPX = Number(Moghunter.parameters['TP Meter X-Axis'] || 361);
	Moghunter.scStatus_MeterTPY = Number(Moghunter.parameters['TP Meter Y-Axis'] || 210);	
	Moghunter.scStatus_ATKNumberX = Number(Moghunter.parameters['ATK Number X-Axis'] || 50);
	Moghunter.scStatus_ATKNumberY = Number(Moghunter.parameters['ATK Number Y-Axis'] || 211);
	Moghunter.scStatus_MeterATKX = Number(Moghunter.parameters['ATK Meter X-Axis'] || 45);
	Moghunter.scStatus_MeterATKY = Number(Moghunter.parameters['ATK Meter Y-Axis'] || 266);	
	Moghunter.scStatus_MATNumberX = Number(Moghunter.parameters['MAT Number X-Axis'] || 208);
	Moghunter.scStatus_MATNumberY = Number(Moghunter.parameters['MAT Number Y-Axis'] || 211);
	Moghunter.scStatus_MeterMATX = Number(Moghunter.parameters['MAT Meter X-Axis'] || 203);
	Moghunter.scStatus_MeterMATY = Number(Moghunter.parameters['MAT Meter Y-Axis'] || 266);	
	Moghunter.scStatus_AGINumberX = Number(Moghunter.parameters['AGI Number X-Axis'] || 366);
	Moghunter.scStatus_AGINumberY = Number(Moghunter.parameters['AGI Number Y-Axis'] || 211);
	Moghunter.scStatus_MeterAGIX = Number(Moghunter.parameters['AGI Meter X-Axis'] || 361);
	Moghunter.scStatus_MeterAGIY = Number(Moghunter.parameters['AGI Meter Y-Axis'] || 266);				
	Moghunter.scStatus_DEFNumberX = Number(Moghunter.parameters['DEF Number X-Axis'] || 50);
	Moghunter.scStatus_DEFNumberY = Number(Moghunter.parameters['DEF Number Y-Axis'] || 267);
	Moghunter.scStatus_MeterDEFX = Number(Moghunter.parameters['DEF Meter X-Axis'] || 45);
	Moghunter.scStatus_MeterDEFY = Number(Moghunter.parameters['DEF Meter Y-Axis'] || 322);		
	Moghunter.scStatus_MDFNumberX = Number(Moghunter.parameters['MDF Number X-Axis'] || 208);
	Moghunter.scStatus_MDFNumberY = Number(Moghunter.parameters['MDF Number Y-Axis'] || 267);
	Moghunter.scStatus_MeterMDFX = Number(Moghunter.parameters['MDF Meter X-Axis'] || 203);
	Moghunter.scStatus_MeterMDFY = Number(Moghunter.parameters['MDF Meter Y-Axis'] || 322);		
	Moghunter.scStatus_LUKNumberX = Number(Moghunter.parameters['LUK Number X-Axis'] || 366);
	Moghunter.scStatus_LUKNumberY = Number(Moghunter.parameters['LUK Number Y-Axis'] || 267);
	Moghunter.scStatus_MeterLUKX = Number(Moghunter.parameters['LUK Meter X-Axis'] || 361);
	Moghunter.scStatus_MeterLUKY = Number(Moghunter.parameters['LUK Meter Y-Axis'] || 322);		
	Moghunter.scStatus_WeaponX = Number(Moghunter.parameters['Weapon X-Axis'] || 7);
	Moghunter.scStatus_WeaponY = Number(Moghunter.parameters['Weapon Y-Axis'] || 347);
	Moghunter.scStatus_ShieldX = Number(Moghunter.parameters['Shield X-Axis'] || 7);
	Moghunter.scStatus_ShieldY = Number(Moghunter.parameters['Shield Y-Axis'] || 398);	
	Moghunter.scStatus_HelmetX = Number(Moghunter.parameters['Helmet X-Axis'] || 7);
	Moghunter.scStatus_HelmetY = Number(Moghunter.parameters['Helmet Y-Axis'] || 449);	
	Moghunter.scStatus_ArmorX = Number(Moghunter.parameters['Armor X-Axis'] || 261);
	Moghunter.scStatus_ArmorY = Number(Moghunter.parameters['Armor Y-Axis'] || 376);	
	Moghunter.scStatus_AccX = Number(Moghunter.parameters['Accessory X-Axis'] || 261);
	Moghunter.scStatus_AccY = Number(Moghunter.parameters['Accessory Y-Axis'] || 427);
	Moghunter.scStatus_ClassX = Number(Moghunter.parameters['Class X-Axis'] || 260);
	Moghunter.scStatus_ClassY = Number(Moghunter.parameters['Class Y-Axis'] || 320);
	Moghunter.scStatus_ProfileX = Number(Moghunter.parameters['Profile X-Axis'] || 0);
	Moghunter.scStatus_ProfileY = Number(Moghunter.parameters['Profile Y-Axis'] || 505);
	Moghunter.scStatus_SoulX = Number(Moghunter.parameters['Soul X-Axis'] || 0);
	Moghunter.scStatus_SoulY = Number(Moghunter.parameters['Soul Y-Axis'] || 0);
	
//=============================================================================
// ** ImageManager
//=============================================================================

//==============================
// * Status
//==============================
ImageManager.loadMenusstatus = function(filename) {
    return this.loadBitmap('img/menus/status/', filename, 0, true);
};

ImageManager.loadMenusStatusSouls = function(filename) {
    return this.loadBitmap('img/menus/main/status/Journal-souls/', filename, 0, true);
};

//=============================================================================
// ** Scene Status
//=============================================================================

//==============================
// * create Background
//==============================
var _mog_scStatus_createBackground = Scene_Status.prototype.createBackground;
Scene_Status.prototype.createBackground = function() {
	_mog_scStatus_createBackground.call(this);
	this._field = new Sprite();
	this.addChild(this._field);	
};

    Moghunter.scStatus_BustScale = Number(Moghunter.parameters['Bust Scale'] || 1.00);
    Moghunter.scStatus_LayoutScale = Number(Moghunter.parameters['Layout Scale'] || 1.00);
    Moghunter.scStatus_StatesScale = Number(Moghunter.parameters['States Scale'] || 1.00);
    Moghunter.scStatus_HPMeterScale = Number(Moghunter.parameters['HP Meter Scale'] || 1.00);
    Moghunter.scStatus_MPMeterScale = Number(Moghunter.parameters['MP Meter Scale'] || 1.00);
    Moghunter.scStatus_TPMeterScale = Number(Moghunter.parameters['TP Meter Scale'] || 1.00);
    Moghunter.scStatus_ATKMeterScale = Number(Moghunter.parameters['ATK Meter Scale'] || 1.00);
    Moghunter.scStatus_MATMeterScale = Number(Moghunter.parameters['MAT Meter Scale'] || 1.00);
    Moghunter.scStatus_AGIMeterScale = Number(Moghunter.parameters['AGI Meter Scale'] || 1.00);
    Moghunter.scStatus_DEFMeterScale = Number(Moghunter.parameters['DEF Meter Scale'] || 1.00);
    Moghunter.scStatus_MDFMeterScale = Number(Moghunter.parameters['MDF Meter Scale'] || 1.00);
    Moghunter.scStatus_LUKMeterScale = Number(Moghunter.parameters['LUK Meter Scale'] || 1.00);
    Moghunter.scStatus_NameFontSize = Number(Moghunter.parameters['Name Font Size'] || 24);
    Moghunter.scStatus_LevelFontSize = Number(Moghunter.parameters['Level Font Size'] || 24);
    Moghunter.scStatus_ExpFontSize = Number(Moghunter.parameters['Exp Font Size'] || 24);
    Moghunter.scStatus_NextExpFontSize = Number(Moghunter.parameters['Next Exp Font Size'] || 24);
    Moghunter.scStatus_HPNumberFontSize = Number(Moghunter.parameters['HP Number Font Size'] || 22);
    Moghunter.scStatus_MPNumberFontSize = Number(Moghunter.parameters['MP Number Font Size'] || 22);
    Moghunter.scStatus_TPNumberFontSize = Number(Moghunter.parameters['TP Number Font Size'] || 22);
    Moghunter.scStatus_ATKNumberFontSize = Number(Moghunter.parameters['ATK Number Font Size'] || 22);
    Moghunter.scStatus_MATNumberFontSize = Number(Moghunter.parameters['MAT Number Font Size'] || 22);
    Moghunter.scStatus_AGINumberFontSize = Number(Moghunter.parameters['AGI Number Font Size'] || 22);
    Moghunter.scStatus_DEFNumberFontSize = Number(Moghunter.parameters['DEF Number Font Size'] || 22);
    Moghunter.scStatus_MDFNumberFontSize = Number(Moghunter.parameters['MDF Number Font Size'] || 22);
    Moghunter.scStatus_LUKNumberFontSize = Number(Moghunter.parameters['LUK Number Font Size'] || 22);
    Moghunter.scStatus_ClassFontSize = Number(Moghunter.parameters['Class Font Size'] || 22);
    Moghunter.scStatus_ProfileFontSize = Number(Moghunter.parameters['Profile Font Size'] || 22);
    Moghunter.scStatus_WeaponFontSize = Number(Moghunter.parameters['Weapon Font Size'] || 22);
    Moghunter.scStatus_ShieldFontSize = Number(Moghunter.parameters['Shield Font Size'] || 22);
    Moghunter.scStatus_HelmetFontSize = Number(Moghunter.parameters['Helmet Font Size'] || 22);
    Moghunter.scStatus_ArmorFontSize = Number(Moghunter.parameters['Armor Font Size'] || 22);
    Moghunter.scStatus_AccessoryFontSize = Number(Moghunter.parameters['Accessory Font Size'] || 22);

//==============================
// * Create
//==============================
var _mog_scStatusM_create = Scene_Status.prototype.create;
Scene_Status.prototype.create = function() {
    // [LIVE DEV F8] Reload all parameters dynamically
    var p = PluginManager.parameters('MOG_SceneStatus');
    if (p && p['Bust X-Axis'] !== undefined) {
        Moghunter.scStatus_BustX = Number(p['Bust X-Axis'] || 600);
        Moghunter.scStatus_BustY = Number(p['Bust Y-Axis'] || 0);
        Moghunter.scStatus_StatesX = Number(p['States X-Axis'] || 59);
        Moghunter.scStatus_StatesY = Number(p['States Y-Axis'] || 120);
        Moghunter.scStatus_ActorNameX = Number(p['Name X-Axis'] || 190);
        Moghunter.scStatus_ActorNameY = Number(p['Name Y-Axis'] || 103);
        Moghunter.scStatus_LevelX = Number(p['Level X-Axis'] || 290);
        Moghunter.scStatus_LevelY = Number(p['Level Y-Axis'] || 6);
        Moghunter.scStatus_ExpX = Number(p['Exp X-Axis'] || 440);
        Moghunter.scStatus_ExpY = Number(p['Exp Y-Axis'] || 6);
        Moghunter.scStatus_NExpX = Number(p['Next Exp X-Axis'] || 680);
        Moghunter.scStatus_NExpY = Number(p['Next Exp Y-Axis'] || 6);
        Moghunter.scStatus_HPNumberX = Number(p['HP Number X-Axis'] || 50);
        Moghunter.scStatus_HPNumberY = Number(p['HP Number Y-Axis'] || 155);
        Moghunter.scStatus_MeterHPX = Number(p['HP Meter X-Axis'] || 45);
        Moghunter.scStatus_MeterHPY = Number(p['HP Meter Y-Axis'] || 210);	
        Moghunter.scStatus_MPNumberX = Number(p['MP Number X-Axis'] || 208);
        Moghunter.scStatus_MPNumberY = Number(p['MP Number Y-Axis'] || 155);
        Moghunter.scStatus_MeterMPX = Number(p['MP Meter X-Axis'] || 203);
        Moghunter.scStatus_MeterMPY = Number(p['MP Meter Y-Axis'] || 210);	
        Moghunter.scStatus_TPNumberX = Number(p['TP Number X-Axis'] || 366);
        Moghunter.scStatus_TPNumberY = Number(p['TP Number Y-Axis'] || 155);
        Moghunter.scStatus_MeterTPX = Number(p['TP Meter X-Axis'] || 361);
        Moghunter.scStatus_MeterTPY = Number(p['TP Meter Y-Axis'] || 210);	
        Moghunter.scStatus_ATKNumberX = Number(p['ATK Number X-Axis'] || 50);
        Moghunter.scStatus_ATKNumberY = Number(p['ATK Number Y-Axis'] || 211);
        Moghunter.scStatus_MeterATKX = Number(p['ATK Meter X-Axis'] || 45);
        Moghunter.scStatus_MeterATKY = Number(p['ATK Meter Y-Axis'] || 266);	
        Moghunter.scStatus_MATNumberX = Number(p['MAT Number X-Axis'] || 208);
        Moghunter.scStatus_MATNumberY = Number(p['MAT Number Y-Axis'] || 211);
        Moghunter.scStatus_MeterMATX = Number(p['MAT Meter X-Axis'] || 203);
        Moghunter.scStatus_MeterMATY = Number(p['MAT Meter Y-Axis'] || 266);	
        Moghunter.scStatus_AGINumberX = Number(p['AGI Number X-Axis'] || 366);
        Moghunter.scStatus_AGINumberY = Number(p['AGI Number Y-Axis'] || 211);
        Moghunter.scStatus_MeterAGIX = Number(p['AGI Meter X-Axis'] || 361);
        Moghunter.scStatus_MeterAGIY = Number(p['AGI Meter Y-Axis'] || 266);				
        Moghunter.scStatus_DEFNumberX = Number(p['DEF Number X-Axis'] || 50);
        Moghunter.scStatus_DEFNumberY = Number(p['DEF Number Y-Axis'] || 267);
        Moghunter.scStatus_MeterDEFX = Number(p['DEF Meter X-Axis'] || 45);
        Moghunter.scStatus_MeterDEFY = Number(p['DEF Meter Y-Axis'] || 322);		
        Moghunter.scStatus_MDFNumberX = Number(p['MDF Number X-Axis'] || 208);
        Moghunter.scStatus_MDFNumberY = Number(p['MDF Number Y-Axis'] || 267);
        Moghunter.scStatus_MeterMDFX = Number(p['MDF Meter X-Axis'] || 203);
        Moghunter.scStatus_MeterMDFY = Number(p['MDF Meter Y-Axis'] || 322);		
        Moghunter.scStatus_LUKNumberX = Number(p['LUK Number X-Axis'] || 366);
        Moghunter.scStatus_LUKNumberY = Number(p['LUK Number Y-Axis'] || 267);
        Moghunter.scStatus_MeterLUKX = Number(p['LUK Meter X-Axis'] || 361);
        Moghunter.scStatus_MeterLUKY = Number(p['LUK Meter Y-Axis'] || 322);		
        Moghunter.scStatus_WeaponX = Number(p['Weapon X-Axis'] || 7);
        Moghunter.scStatus_WeaponY = Number(p['Weapon Y-Axis'] || 347);
        Moghunter.scStatus_ShieldX = Number(p['Shield X-Axis'] || 7);
        Moghunter.scStatus_ShieldY = Number(p['Shield Y-Axis'] || 398);	
        Moghunter.scStatus_HelmetX = Number(p['Helmet X-Axis'] || 7);
        Moghunter.scStatus_HelmetY = Number(p['Helmet Y-Axis'] || 449);	
        Moghunter.scStatus_ArmorX = Number(p['Armor X-Axis'] || 261);
        Moghunter.scStatus_ArmorY = Number(p['Armor Y-Axis'] || 376);	
        Moghunter.scStatus_AccX = Number(p['Accessory X-Axis'] || 261);
        Moghunter.scStatus_AccY = Number(p['Accessory Y-Axis'] || 427);
        Moghunter.scStatus_ClassX = Number(p['Class X-Axis'] || 260);
        Moghunter.scStatus_ClassY = Number(p['Class Y-Axis'] || 320);
        Moghunter.scStatus_ProfileX = Number(p['Profile X-Axis'] || 0);
        Moghunter.scStatus_ProfileY = Number(p['Profile Y-Axis'] || 505);
        Moghunter.scStatus_SoulX = Number(p['Soul X-Axis'] || 0);
        Moghunter.scStatus_SoulY = Number(p['Soul Y-Axis'] || 0);
                Moghunter.scStatus_BustScale = Number(p['Bust Scale'] || 1.00);
                Moghunter.scStatus_LayoutScale = Number(p['Layout Scale'] || 1.00);
                Moghunter.scStatus_StatesScale = Number(p['States Scale'] || 1.00);
                Moghunter.scStatus_HPMeterScale = Number(p['HP Meter Scale'] || 1.00);
                Moghunter.scStatus_MPMeterScale = Number(p['MP Meter Scale'] || 1.00);
                Moghunter.scStatus_TPMeterScale = Number(p['TP Meter Scale'] || 1.00);
                Moghunter.scStatus_ATKMeterScale = Number(p['ATK Meter Scale'] || 1.00);
                Moghunter.scStatus_MATMeterScale = Number(p['MAT Meter Scale'] || 1.00);
                Moghunter.scStatus_AGIMeterScale = Number(p['AGI Meter Scale'] || 1.00);
                Moghunter.scStatus_DEFMeterScale = Number(p['DEF Meter Scale'] || 1.00);
                Moghunter.scStatus_MDFMeterScale = Number(p['MDF Meter Scale'] || 1.00);
                Moghunter.scStatus_LUKMeterScale = Number(p['LUK Meter Scale'] || 1.00);
                Moghunter.scStatus_NameFontSize = Number(p['Name Font Size'] || 24);
                Moghunter.scStatus_LevelFontSize = Number(p['Level Font Size'] || 24);
                Moghunter.scStatus_ExpFontSize = Number(p['Exp Font Size'] || 24);
                Moghunter.scStatus_NextExpFontSize = Number(p['Next Exp Font Size'] || 24);
                Moghunter.scStatus_HPNumberFontSize = Number(p['HP Number Font Size'] || 22);
                Moghunter.scStatus_MPNumberFontSize = Number(p['MP Number Font Size'] || 22);
                Moghunter.scStatus_TPNumberFontSize = Number(p['TP Number Font Size'] || 22);
                Moghunter.scStatus_ATKNumberFontSize = Number(p['ATK Number Font Size'] || 22);
                Moghunter.scStatus_MATNumberFontSize = Number(p['MAT Number Font Size'] || 22);
                Moghunter.scStatus_AGINumberFontSize = Number(p['AGI Number Font Size'] || 22);
                Moghunter.scStatus_DEFNumberFontSize = Number(p['DEF Number Font Size'] || 22);
                Moghunter.scStatus_MDFNumberFontSize = Number(p['MDF Number Font Size'] || 22);
                Moghunter.scStatus_LUKNumberFontSize = Number(p['LUK Number Font Size'] || 22);
                Moghunter.scStatus_ClassFontSize = Number(p['Class Font Size'] || 22);
                Moghunter.scStatus_ProfileFontSize = Number(p['Profile Font Size'] || 22);
                Moghunter.scStatus_WeaponFontSize = Number(p['Weapon Font Size'] || 22);
                Moghunter.scStatus_ShieldFontSize = Number(p['Shield Font Size'] || 22);
                Moghunter.scStatus_HelmetFontSize = Number(p['Helmet Font Size'] || 22);
                Moghunter.scStatus_ArmorFontSize = Number(p['Armor Font Size'] || 22);
                Moghunter.scStatus_AccessoryFontSize = Number(p['Accessory Font Size'] || 22);

    }
    
	_mog_scStatusM_create.call(this);
	this.createBust();
	this.createLayout();
    this.createSoul();
	this.createStates();
	this.createMeters();
	this.resetPosition();
	this.createEquipWindows(); // Added Custom Equip UI
};

//==============================
// * Create Meters
//==============================
Scene_Status.prototype.createMeters = function() {
    this._meters = new MetersStatusM(this._actor);
	this._field.addChild(this._meters);
};

//==============================
// * Create States
//==============================
Scene_Status.prototype.createStates = function() {
	this._states_data = [0,0,0];
	this._state_icon = new Sprite(ImageManager.loadSystem("IconSet"));
	this._state_icon.x = Moghunter.scStatus_StatesX;
	this._state_icon.y = Moghunter.scStatus_StatesY;
	this._state_icon.scale.x = Moghunter.scStatus_StatesScale;
	this._state_icon.scale.y = Moghunter.scStatus_StatesScale;
	this._state_iconOrg = [this._state_icon.x,this._state_icon.y];
	this._state_icon.visible = false;
	this.addChild(this._state_icon);
	this.refresh_states();	
};

//==============================
// * Create States
//==============================
Scene_Status.prototype.refresh_states = function() {
	this._states_data[0] = 0;
	this._states_data[2] = 0;
	this._state_icon.visible = false;
	if (this._actor.allIcons().length == 0) {this._states_data[1] = 0;return};
       if (this._actor.allIcons()[this._states_data[1]]) {	
		this._states_data[0] = this._actor.allIcons()[this._states_data[1]];
		this._state_icon.visible = true;
		var sx = this._states_data[0] % 16 * 32;
		var sy = Math.floor(this._states_data[0] / 16) * 32;
		this._state_icon.setFrame(sx, sy, 32, 32);
	   };
	this._states_data[1] += 1;
	if (this._states_data[1] >= this._actor.allIcons().length) {
		this._states_data[1] = 0
	};
};

//==============================
// * Update States
//==============================
Scene_Status.prototype.update_states = function() {
	this._states_data[2] += 1;
	if (this.need_refresh_states()) {this.refresh_states();};
	this._state_icon.x = this._state_iconOrg[0] + this._statusWindow.x;
	this._state_icon.y = this._state_iconOrg[1] + this._statusWindow.y;
	this._state_icon.opacity = this._statusWindow.contentsOpacity;
};	

//==============================
// * Update Meters
//==============================
Scene_Status.prototype.updateMeters = function() {	
	this._meters.x = this._statusWindow.x;
	this._meters.y =  this._statusWindow.y;
	this._meters.opacity = this._statusWindow.contentsOpacity;	
};

//==============================
// * Need Refresh States
//==============================
Scene_Status.prototype.need_refresh_states = function() {
	if (this._states_data[2] > 60) {return true};
	return false;
};	

//==============================
// * On Actor Change
//==============================
var _mog_scsStatusM_onActorChange = Scene_Status.prototype.onActorChange;
Scene_Status.prototype.onActorChange = function() {
	_mog_scsStatusM_onActorChange.call(this);
    this.resetPosition();
    if (this._equipSlotWindow) this._equipSlotWindow.setActor(this._actor);
    if (this._equipItemWindow) this._equipItemWindow.setActor(this._actor, 0);
};

//==============================
// * reset Position
//==============================
Scene_Status.prototype.resetPosition = function() {
    this.refreshBust();
    this.refreshLayout();
    this.refreshSoul();
	this._statusWindow.contentsOpacity = 0;
	this._statusWindow.x = 100;
	this._layout.opacity = 0;
	this._layout.x = -100;
	this._meters.setActor(this._actor);
	this.refresh_states();
};

//==============================
// * Create Layout
//==============================
Scene_Status.prototype.createLayout = function() {
	this._layout = new Sprite();
	this._field.addChild(this._layout);
};

Scene_Status.prototype.refreshLayout = function() {
    this._layout.bitmap = ImageManager.loadMenusstatus("Layout" + this._actor.actorId());
    this._layout.scale.x = Moghunter.scStatus_LayoutScale;
    this._layout.scale.y = Moghunter.scStatus_LayoutScale;
};

//==============================
// * Create Bust
//==============================
Scene_Status.prototype.createBust = function() {
	this._bust = new Sprite();
	this._bust.anchor.x = 0.5;
	this._bust.x = Moghunter.scStatus_BustX;
	this._bust.y = Moghunter.scStatus_BustY;
	this._bust.org = [this._bust.x,this._bust.y];
	this._bust.scale.x = Moghunter.scStatus_BustScale;
	this._bust.scale.y = Moghunter.scStatus_BustScale;
	this._field.addChild(this._bust);
};

//==============================
// * Create Soul
//==============================
Scene_Status.prototype.createSoul = function() {
	this._soulSprite = new Sprite();
	this._soulSprite.x = Moghunter.scStatus_SoulX;
	this._soulSprite.y = Moghunter.scStatus_SoulY;
	this._soulSprite.org = [this._soulSprite.x, this._soulSprite.y];
	this._field.addChild(this._soulSprite);
};

//==============================
// * refresh Soul
//==============================
Scene_Status.prototype.refreshSoul = function() {
    this._soulSprite.bitmap = null;
    this._soulSprite.opacity = 0;
    var equips = this._actor.equips();
    for (var i = 0; i < equips.length; i++) {
        var eq = equips[i];
        if (eq) {
            var imgName = "";
            // 1. Cek Note Tag dulu (jika ada)
            if (eq.note) {
                var cleanNote = eq.note.replace(/[\r\n]+/g, " ");
                var match = cleanNote.match(/<soul_img\s*:\s*([^>]+)>/i);
                if (match && match[1]) {
                    imgName = match[1].trim();
                }
            }
            // 2. Jika tidak ada tag, cek NAMA senjata/armor (Sistem Kata Kunci)
            if (!imgName && eq.name) {
                var lowerName = eq.name.toLowerCase();
                // Jika namanya mengandung kata "soul" atau "souls"
                if (lowerName.indexOf("soul") >= 0) {
                    // Ambil kata kunci di luar kata "soul" (misal: "Energy Soul" -> "energy")
                    imgName = lowerName.replace("souls", "").replace("soul", "").trim();
                    // Spasi diganti dengan underscore (jaga-jaga)
                    imgName = imgName.replace(/\s+/g, "_"); 
                }
            }

            // Jika kata kunci gambar berhasil didapatkan, muat gambarnya
            if (imgName !== "") {
                this._soulSprite.bitmap = ImageManager.loadMenusStatusSouls(imgName);
                break;
            }
        }
    }
};

//==============================
// * refresh Bust
//==============================
Scene_Status.prototype.refreshBust = function() {
     this._bust.bitmap = ImageManager.loadMenusFaces4("Actor_" + this._actor._actorId);
	 this._bust.y = Graphics.boxHeight;
	 this._bust.opacity = 0;
};

//==============================
// * update Slide
//==============================
Scene_Status.prototype.updateSlide = function() {
	this._statusWindow.opacity = 0;
	this._statusWindow.contentsOpacity += 5;
	if (this._statusWindow.x > 0) {
		this._statusWindow.x -= 5;
		if (this._statusWindow.x <= 0) {this._statusWindow.x = 0};
	};
	this._layout.opacity += 5;
	if (this._layout.x < 0) {
		this._layout.x += 5;
		if (this._layout.x > 0) {this._layout.x = 0};
	};
	this._bust.x = this._bust.org[0]
	this._bust.opacity += 5;
	var by = (Graphics.boxHeight - this._bust.height) + this._bust.org[1];
	if (this._bust.y > by) {
		this._bust.y -= 20;
		if (this._bust.y < by) {this._bust.y = by};
	};
    if (this._soulSprite) {
        // [LIVE DEV F8 SUPPORT] Ambil parameter secara real-time
        var liveParams = PluginManager.parameters('MOG_SceneStatus');
        if (liveParams && liveParams['Soul X-Axis'] !== undefined) {
            this._soulSprite.org[0] = Number(liveParams['Soul X-Axis'] || 250);
            this._soulSprite.org[1] = Number(liveParams['Soul Y-Axis']);
        }
        
        // --- Animasi Berkedip (Pulsing Opacity) ---
        if (!this._soulSprite._pulseDir) {
            this._soulSprite._pulseDir = 1;
            this._soulSprite.opacity = 0; // Mulai dari menghilang
        }
        
        if (this._soulSprite._pulseDir === 1) {
            this._soulSprite.opacity += 4;
            if (this._soulSprite.opacity >= 255) {
                this._soulSprite._pulseDir = -1;
            }
        } else {
            this._soulSprite.opacity -= 4;
            if (this._soulSprite.opacity <= 100) { // Jangan sampai terlalu hilang
                this._soulSprite._pulseDir = 1;
            }
        }

        this._soulSprite.x = this._soulSprite.org[0];
        this._soulSprite.y = this._soulSprite.org[1];
    }
};

//==============================
// * Update
//==============================
var _mog_scStatatusM_update = Scene_Status.prototype.update;
Scene_Status.prototype.update = function() {
    if (Graphics.frameCount % 60 === 0) console.log('Scene_Status is updating normally.');
	_mog_scStatatusM_update.call(this);
    
    // [LIVE DEV F8] Auto-Update for ALL parameters
    var p = PluginManager.parameters('MOG_SceneStatus');
    if (p) {
        var hash = JSON.stringify(p);
        if (this._lastParamHash !== hash) {
            this._lastParamHash = hash;
            if (p['Bust X-Axis'] !== undefined) {
                Moghunter.scStatus_BustX = Number(p['Bust X-Axis']);
                Moghunter.scStatus_BustY = Number(p['Bust Y-Axis']);
                Moghunter.scStatus_StatesX = Number(p['States X-Axis']);
                Moghunter.scStatus_StatesY = Number(p['States Y-Axis']);
                Moghunter.scStatus_ActorNameX = Number(p['Name X-Axis']);
                Moghunter.scStatus_ActorNameY = Number(p['Name Y-Axis']);
                Moghunter.scStatus_LevelX = Number(p['Level X-Axis']);
                Moghunter.scStatus_LevelY = Number(p['Level Y-Axis']);
                Moghunter.scStatus_ExpX = Number(p['Exp X-Axis']);
                Moghunter.scStatus_ExpY = Number(p['Exp Y-Axis']);
                Moghunter.scStatus_NExpX = Number(p['Next Exp X-Axis']);
                Moghunter.scStatus_NExpY = Number(p['Next Exp Y-Axis']);
                Moghunter.scStatus_HPNumberX = Number(p['HP Number X-Axis']);
                Moghunter.scStatus_HPNumberY = Number(p['HP Number Y-Axis']);
                Moghunter.scStatus_MeterHPX = Number(p['HP Meter X-Axis']);
                Moghunter.scStatus_MeterHPY = Number(p['HP Meter Y-Axis']);	
                Moghunter.scStatus_MPNumberX = Number(p['MP Number X-Axis']);
                Moghunter.scStatus_MPNumberY = Number(p['MP Number Y-Axis']);
                Moghunter.scStatus_MeterMPX = Number(p['MP Meter X-Axis']);
                Moghunter.scStatus_MeterMPY = Number(p['MP Meter Y-Axis']);	
                Moghunter.scStatus_TPNumberX = Number(p['TP Number X-Axis']);
                Moghunter.scStatus_TPNumberY = Number(p['TP Number Y-Axis']);
                Moghunter.scStatus_MeterTPX = Number(p['TP Meter X-Axis']);
                Moghunter.scStatus_MeterTPY = Number(p['TP Meter Y-Axis']);	
                Moghunter.scStatus_ATKNumberX = Number(p['ATK Number X-Axis']);
                Moghunter.scStatus_ATKNumberY = Number(p['ATK Number Y-Axis']);
                Moghunter.scStatus_MeterATKX = Number(p['ATK Meter X-Axis']);
                Moghunter.scStatus_MeterATKY = Number(p['ATK Meter Y-Axis']);	
                Moghunter.scStatus_MATNumberX = Number(p['MAT Number X-Axis']);
                Moghunter.scStatus_MATNumberY = Number(p['MAT Number Y-Axis']);
                Moghunter.scStatus_MeterMATX = Number(p['MAT Meter X-Axis']);
                Moghunter.scStatus_MeterMATY = Number(p['MAT Meter Y-Axis']);	
                Moghunter.scStatus_AGINumberX = Number(p['AGI Number X-Axis']);
                Moghunter.scStatus_AGINumberY = Number(p['AGI Number Y-Axis']);
                Moghunter.scStatus_MeterAGIX = Number(p['AGI Meter X-Axis']);
                Moghunter.scStatus_MeterAGIY = Number(p['AGI Meter Y-Axis']);				
                Moghunter.scStatus_DEFNumberX = Number(p['DEF Number X-Axis']);
                Moghunter.scStatus_DEFNumberY = Number(p['DEF Number Y-Axis']);
                Moghunter.scStatus_MeterDEFX = Number(p['DEF Meter X-Axis']);
                Moghunter.scStatus_MeterDEFY = Number(p['DEF Meter Y-Axis']);		
                Moghunter.scStatus_MDFNumberX = Number(p['MDF Number X-Axis']);
                Moghunter.scStatus_MDFNumberY = Number(p['MDF Number Y-Axis']);
                Moghunter.scStatus_MeterMDFX = Number(p['MDF Meter X-Axis']);
                Moghunter.scStatus_MeterMDFY = Number(p['MDF Meter Y-Axis']);		
                Moghunter.scStatus_LUKNumberX = Number(p['LUK Number X-Axis']);
                Moghunter.scStatus_LUKNumberY = Number(p['LUK Number Y-Axis']);
                Moghunter.scStatus_MeterLUKX = Number(p['LUK Meter X-Axis']);
                Moghunter.scStatus_MeterLUKY = Number(p['LUK Meter Y-Axis']);		
                Moghunter.scStatus_WeaponX = Number(p['Weapon X-Axis']);
                Moghunter.scStatus_WeaponY = Number(p['Weapon Y-Axis']);
                Moghunter.scStatus_ShieldX = Number(p['Shield X-Axis']);
                Moghunter.scStatus_ShieldY = Number(p['Shield Y-Axis']);	
                Moghunter.scStatus_HelmetX = Number(p['Helmet X-Axis']);
                Moghunter.scStatus_HelmetY = Number(p['Helmet Y-Axis']);	
                Moghunter.scStatus_ArmorX = Number(p['Armor X-Axis']);
                Moghunter.scStatus_ArmorY = Number(p['Armor Y-Axis']);	
                Moghunter.scStatus_AccX = Number(p['Accessory X-Axis']);
                Moghunter.scStatus_AccY = Number(p['Accessory Y-Axis']);
                Moghunter.scStatus_ClassX = Number(p['Class X-Axis']);
                Moghunter.scStatus_ClassY = Number(p['Class Y-Axis']);
                Moghunter.scStatus_ProfileX = Number(p['Profile X-Axis']);
                Moghunter.scStatus_ProfileY = Number(p['Profile Y-Axis']);
                Moghunter.scStatus_SoulX = Number(p['Soul X-Axis'] || 250);
                Moghunter.scStatus_SoulY = Number(p['Soul Y-Axis'] || 0);
                Moghunter.scStatus_BustScale = Number(p['Bust Scale'] || 1.00);
                Moghunter.scStatus_LayoutScale = Number(p['Layout Scale'] || 1.00);
                Moghunter.scStatus_StatesScale = Number(p['States Scale'] || 1.00);
                Moghunter.scStatus_HPMeterScale = Number(p['HP Meter Scale'] || 1.00);
                Moghunter.scStatus_MPMeterScale = Number(p['MP Meter Scale'] || 1.00);
                Moghunter.scStatus_TPMeterScale = Number(p['TP Meter Scale'] || 1.00);
                Moghunter.scStatus_ATKMeterScale = Number(p['ATK Meter Scale'] || 1.00);
                Moghunter.scStatus_MATMeterScale = Number(p['MAT Meter Scale'] || 1.00);
                Moghunter.scStatus_AGIMeterScale = Number(p['AGI Meter Scale'] || 1.00);
                Moghunter.scStatus_DEFMeterScale = Number(p['DEF Meter Scale'] || 1.00);
                Moghunter.scStatus_MDFMeterScale = Number(p['MDF Meter Scale'] || 1.00);
                Moghunter.scStatus_LUKMeterScale = Number(p['LUK Meter Scale'] || 1.00);
                Moghunter.scStatus_NameFontSize = Number(p['Name Font Size'] || 24);
                Moghunter.scStatus_LevelFontSize = Number(p['Level Font Size'] || 24);
                Moghunter.scStatus_ExpFontSize = Number(p['Exp Font Size'] || 24);
                Moghunter.scStatus_NextExpFontSize = Number(p['Next Exp Font Size'] || 24);
                Moghunter.scStatus_HPNumberFontSize = Number(p['HP Number Font Size'] || 22);
                Moghunter.scStatus_MPNumberFontSize = Number(p['MP Number Font Size'] || 22);
                Moghunter.scStatus_TPNumberFontSize = Number(p['TP Number Font Size'] || 22);
                Moghunter.scStatus_ATKNumberFontSize = Number(p['ATK Number Font Size'] || 22);
                Moghunter.scStatus_MATNumberFontSize = Number(p['MAT Number Font Size'] || 22);
                Moghunter.scStatus_AGINumberFontSize = Number(p['AGI Number Font Size'] || 22);
                Moghunter.scStatus_DEFNumberFontSize = Number(p['DEF Number Font Size'] || 22);
                Moghunter.scStatus_MDFNumberFontSize = Number(p['MDF Number Font Size'] || 22);
                Moghunter.scStatus_LUKNumberFontSize = Number(p['LUK Number Font Size'] || 22);
                Moghunter.scStatus_ClassFontSize = Number(p['Class Font Size'] || 22);
                Moghunter.scStatus_ProfileFontSize = Number(p['Profile Font Size'] || 22);
                Moghunter.scStatus_WeaponFontSize = Number(p['Weapon Font Size'] || 22);
                Moghunter.scStatus_ShieldFontSize = Number(p['Shield Font Size'] || 22);
                Moghunter.scStatus_HelmetFontSize = Number(p['Helmet Font Size'] || 22);
                Moghunter.scStatus_ArmorFontSize = Number(p['Armor Font Size'] || 22);
                Moghunter.scStatus_AccessoryFontSize = Number(p['Accessory Font Size'] || 22);


                // Update posisi Base (Org) untuk gambar yang digeser slide
                if (this._bust) {
                    this._bust.org[0] = Moghunter.scStatus_BustX;
                    this._bust.org[1] = Moghunter.scStatus_BustY;
                    this._bust.scale.x = Moghunter.scStatus_BustScale;
                    this._bust.scale.y = Moghunter.scStatus_BustScale;
                }
                if (this._soulSprite) {
                    this._soulSprite.org[0] = Moghunter.scStatus_SoulX;
                    this._soulSprite.org[1] = Moghunter.scStatus_SoulY;
                }

                // Segarkan Layar
                if (this._statusWindow) this._statusWindow.refresh();
            }
        }
    }

    this.updateSlide();
    this.updateEquipInput();
	if (this._state_icon) {this.update_states()};
	if (this._meters) {this.updateMeters()};
};


//=============================================================================
// ** INTEGRATED EQUIP SYSTEM
//=============================================================================

//==============================
// * Create Equip Windows
//==============================
Scene_Status.prototype.createEquipWindows = function() {
    // Custom transparent Slot Window that maps to the 5 boxes
    this._equipSlotWindow = new Window_StatusEquipSlot(0, 0, Graphics.boxWidth, Graphics.boxHeight);
    this._equipSlotWindow.setActor(this._actor);
    this._equipSlotWindow.setHandler('ok', this.onEquipSlotOk.bind(this));
    this._equipSlotWindow.setHandler('cancel', this.onEquipSlotCancel.bind(this));
    // this._equipSlotWindow.hide(); // Always show to draw icons
    this._equipSlotWindow.deactivate();
    this._equipSlotWindow.deselect();
    this.addChild(this._equipSlotWindow);

    // Window untuk memilih item (List di kanan)
    this._equipItemWindow = new Window_EquipItem(this._actor, 0);
    // Posisi di kanan yang kosong
    this._equipItemWindow.x = Graphics.boxWidth - this._equipItemWindow.width;
    this._equipItemWindow.y = 100; // di bawah label location dll
    this._equipItemWindow.setActor(this._actor, 0);
    this._equipItemWindow.setHandler('ok', this.onEquipItemOk.bind(this));
    this._equipItemWindow.setHandler('cancel', this.onEquipItemCancel.bind(this));
    this._equipItemWindow.hide();
    this._equipItemWindow.deactivate();
    this.addChild(this._equipItemWindow);

    // Link slot window dengan item window
    this._equipSlotWindow.setItemWindow(this._equipItemWindow);

    // Border selector (persegi) untuk slot
    this._equipMode = false;
};

//==============================
// * On Equip Enter
//==============================
Scene_Status.prototype.onEquipEnter = function() {
    if (!this._equipMode) {
        this._equipMode = true;
        SoundManager.playOk();
        this._equipSlotWindow.setActor(this._actor);
        this._equipSlotWindow.select(0);
        this._equipSlotWindow.activate();
        console.log('EQUIP ENTERED! maxItems:', this._equipSlotWindow.maxItems());
        var rect = this._equipSlotWindow.itemRect(0);
        console.log('Cursor Rect 0:', rect);
        console.log('Cursor Sprite visible:', this._equipSlotWindow._windowCursorSprite.visible);
        console.log('Cursor Sprite alpha:', this._equipSlotWindow._windowCursorSprite.alpha);
        // this._equipSlotWindow.show();
        this._equipItemWindow.show();
        this._equipItemWindow.refresh();
    }
};

//==============================
// * On Equip Slot OK
//==============================
Scene_Status.prototype.onEquipSlotOk = function() {
    this._equipItemWindow.setSlotId(this._equipSlotWindow.index());
    this._equipItemWindow.select(0);
    this._equipItemWindow.activate();
};

//==============================
// * On Equip Slot Cancel
//==============================
Scene_Status.prototype.onEquipSlotCancel = function() {
    this._equipMode = false;
    SoundManager.playCancel();
    // this._equipSlotWindow.hide(); // Always show to draw icons
    this._equipSlotWindow.deactivate();
    this._equipItemWindow.hide();
    this._equipItemWindow.deactivate();
    // Refresh soul setelah tutup equip
    this.refreshSoul();
    if (this._statusWindow) this._statusWindow.refresh();
};

//==============================
// * On Equip Item OK
//==============================
Scene_Status.prototype.onEquipItemOk = function() {
    SoundManager.playEquip();
    this._actor.changeEquip(this._equipSlotWindow.index(), this._equipItemWindow.item());
    this._equipSlotWindow.activate();
    this._equipSlotWindow.refresh();
    this._equipItemWindow.setSlotId(this._equipSlotWindow.index());
    this._equipItemWindow.refresh();
    if (this._statusWindow) this._statusWindow.refresh();
    // Refresh soul setelah equip berubah
    this.refreshSoul();
};

//==============================
// * On Equip Item Cancel
//==============================
Scene_Status.prototype.onEquipItemCancel = function() {
    this._equipSlotWindow.activate();
    this._equipItemWindow.deactivate();
};

//==============================
// * Update Equip Input
//==============================
Scene_Status.prototype.updateEquipInput = function() {
    if (this._equipMode) return; // Sudah di equip mode, biarkan window handle
    // Tekan Enter saat di layar status untuk masuk equip
    if (Input.isTriggered('ok')) {
        this.onEquipEnter();
    }
};

//=============================================================================
// ** Window Status
//=============================================================================

//==============================
// * refresh
//==============================
Window_Status.prototype.refresh = function() {
    this.contents.clear();
    if (this._actor) {
		
        this.contents.fontSize = Moghunter.scStatus_NameFontSize;
        this.drawText(this._actor.name(), Moghunter.scStatus_ActorNameX, Moghunter.scStatus_ActorNameY,120,"center");
		this.contents.fontSize = Moghunter.scStatus_LevelFontSize;
		this.drawText(this._actor.level, Moghunter.scStatus_LevelX, Moghunter.scStatus_LevelY,100,"center");	
		this.contents.fontSize = Moghunter.scStatus_ExpFontSize;
		this.drawText(this._actor.currentExp(), Moghunter.scStatus_ExpX, Moghunter.scStatus_ExpY,100,"center");
	    var nexp = this._actor.nextRequiredExp();
        if (this._actor.isMaxLevel()) {nexp = '-------'};	
		this.contents.fontSize = Moghunter.scStatus_NextExpFontSize;
		this.drawText(nexp, Moghunter.scStatus_NExpX, Moghunter.scStatus_NExpY,100,"center");	
		
		this.contents.fontSize = Moghunter.scStatus_HPNumberFontSize;
		this.drawText(this._actor.hp + " / " + this._actor.mhp, Moghunter.scStatus_HPNumberX, Moghunter.scStatus_HPNumberY,100,"right");
		this.contents.fontSize = Moghunter.scStatus_MPNumberFontSize;
		this.drawText(this._actor.mp + " / " + this._actor.mmp, Moghunter.scStatus_MPNumberX , Moghunter.scStatus_MPNumberY,100,"right");
		this.contents.fontSize = Moghunter.scStatus_TPNumberFontSize;
		this.drawText(this._actor.tp, Moghunter.scStatus_TPNumberX, Moghunter.scStatus_TPNumberY,100,"right");
		this.contents.fontSize = Moghunter.scStatus_ATKNumberFontSize;
		this.drawText(this._actor.atk, Moghunter.scStatus_ATKNumberX, Moghunter.scStatus_ATKNumberY,100,"right");
		this.contents.fontSize = Moghunter.scStatus_MATNumberFontSize;
		this.drawText(this._actor.mat, Moghunter.scStatus_MATNumberX, Moghunter.scStatus_MATNumberY,100,"right");
		this.contents.fontSize = Moghunter.scStatus_AGINumberFontSize;
		this.drawText(this._actor.agi, Moghunter.scStatus_AGINumberX, Moghunter.scStatus_AGINumberY,100,"right");
		this.contents.fontSize = Moghunter.scStatus_DEFNumberFontSize;
		this.drawText(this._actor.def, Moghunter.scStatus_DEFNumberX, Moghunter.scStatus_DEFNumberY,100,"right");
		this.contents.fontSize = Moghunter.scStatus_MDFNumberFontSize;
		this.drawText(this._actor.mdf, Moghunter.scStatus_MDFNumberX, Moghunter.scStatus_MDFNumberY,100,"right");
		this.contents.fontSize = Moghunter.scStatus_LUKNumberFontSize;
		this.drawText(this._actor.luk, Moghunter.scStatus_LUKNumberX, Moghunter.scStatus_LUKNumberY,100,"right");		
		this.contents.fontSize = Moghunter.scStatus_WeaponFontSize;
		this.drawItemName(this._actor.equips()[0], Moghunter.scStatus_WeaponX , Moghunter.scStatus_WeaponY);
		this.contents.fontSize = Moghunter.scStatus_ShieldFontSize;
		this.drawItemName(this._actor.equips()[1], Moghunter.scStatus_ShieldX, Moghunter.scStatus_ShieldY);
		this.contents.fontSize = Moghunter.scStatus_HelmetFontSize;
		this.drawItemName(this._actor.equips()[2], Moghunter.scStatus_HelmetX, Moghunter.scStatus_HelmetY);
		this.contents.fontSize = Moghunter.scStatus_ArmorFontSize;
		this.drawItemName(this._actor.equips()[3], Moghunter.scStatus_ArmorX, Moghunter.scStatus_ArmorY);
		this.contents.fontSize = Moghunter.scStatus_AccessoryFontSize;
		this.drawItemName(this._actor.equips()[4], Moghunter.scStatus_AccX, Moghunter.scStatus_AccY);
		this.contents.fontSize = Moghunter.scStatus_ClassFontSize;
		this.drawActorClass(this._actor, Moghunter.scStatus_ClassX, Moghunter.scStatus_ClassY);
		this.contents.fontSize = Moghunter.scStatus_ProfileFontSize;
		this.drawTextEx(this._actor.profile(), Moghunter.scStatus_ProfileX, Moghunter.scStatus_ProfileY);	
    };
};

//=============================================================================
// * Meters Status M
//=============================================================================
function MetersStatusM() {
    this.initialize.apply(this, arguments);
};

MetersStatusM.prototype = Object.create(Sprite.prototype);
MetersStatusM.prototype.constructor = MetersStatusM;

//==============================
// * Initialize
//==============================
MetersStatusM.prototype.initialize = function(actor) {
    Sprite.prototype.initialize.call(this);	
	this.loadBitmaps();
    this._actor = actor;	
};

//==============================
// * Set Actor
//==============================
MetersStatusM.prototype.setActor = function(actor) {
    this._actor = actor;
	this.update();
};


//==============================
// * Load Bitmaps
//==============================
MetersStatusM.prototype.loadBitmaps = function() {
    this._meterImg1 = ImageManager.loadMenusstatus("Meter1");
	this._meterImg2 = ImageManager.loadMenusstatus("Meter2");
};

//==============================
// * create Meters
//==============================
MetersStatusM.prototype.createMeters = function() {
    this._meters = [];
	this._metersAni = [];
	for (var i = 0; i < 9; i++) {
		 if (i < 3) {
		    this._meters[i] = new Sprite(this._meterImg1);
	     } else {
		    this._meters[i] = new Sprite(this._meterImg2);
	     };
		 this._metersAni[i] = 0;
		 this.addChild(this._meters[i]);
	};
};

//==============================
// * update Meters
//==============================
MetersStatusM.prototype.updateMeters = function() {
	for (var i = 0; i < this._meters.length; i++) {
		 var par1 = this._actor.hp;
		 var par2 = this._actor.mhp;
		 if (i === 0) {
		    var x = Moghunter.scStatus_MeterHPX;
			var y = Moghunter.scStatus_MeterHPY;
		    par1 = this._actor.hp;
		    par2 = this._actor.mhp;			
		 } else if (i === 1) {
		    var x = Moghunter.scStatus_MeterMPX;
			var y = Moghunter.scStatus_MeterMPY;
		    par1 = this._actor.mp;
		    par2 = this._actor.mmp;					
		 } else if (i === 2) {
		    var x = Moghunter.scStatus_MeterTPX;
			var y = Moghunter.scStatus_MeterTPY;
		    par1 = this._actor.tp;
		    par2 = 100;					
		 } else if (i === 3) {
		    var x = Moghunter.scStatus_MeterATKX;
			var y = Moghunter.scStatus_MeterATKY;
		    par1 = this._actor.atk;
		    par2 = this._actor.paramMax();				
		 } else if (i === 4) {
		    var x = Moghunter.scStatus_MeterMATX;
			var y = Moghunter.scStatus_MeterMATY;
		    par1 = this._actor.mat;
		    par2 = this._actor.paramMax();			
		 } else if (i === 5) {
		    var x = Moghunter.scStatus_MeterAGIX;
			var y = Moghunter.scStatus_MeterAGIY;
		    par1 = this._actor.agi;
		    par2 = this._actor.paramMax();				
		 } else if (i === 6) {
		    var x = Moghunter.scStatus_MeterDEFX;
			var y = Moghunter.scStatus_MeterDEFY;
		    par1 = this._actor.def;
		    par2 = this._actor.paramMax();				
		 } else if (i === 7) {
		    var x = Moghunter.scStatus_MeterMDFX;
			var y = Moghunter.scStatus_MeterMDFY;	
		    par1 = this._actor.mdf;
		    par2 = this._actor.paramMax();				
		 } else  {
		    var x = Moghunter.scStatus_MeterLUKX;
			var y = Moghunter.scStatus_MeterLUKY;
		    par1 = this._actor.luk;
		    par2 = this._actor.paramMax();				
		 };			 
		 this._meters[i].x = x;
		 this._meters[i].y = y;		 
		 this.updateFlow(this._meters[i],par1,par2,i);
	};
};

//==============================
// * update Flow
//==============================
MetersStatusM.prototype.updateFlow = function(sprite,par1,par2,i) {
    var cw = sprite.bitmap.width / 3;
	var ch = sprite.bitmap.height;
	var cw2 = cw * 2;
	var wd = cw * par1 / par2;
	sprite.setFrame(this._metersAni[i],0,wd,ch);
	this._metersAni[i] += 4;
	if (this._metersAni[i] > cw2) {this._metersAni[i] = 0};
};

//==============================
// * Update
//==============================
MetersStatusM.prototype.update = function() {
    Sprite.prototype.update.call(this);	
    if (!this._meters && this._meterImg1.isReady()) {this.createMeters()};
    if (this._meters && this._actor) {this.updateMeters()};
};
//=============================================================================
// ** Window_StatusEquipSlot (Custom Invisible Window for the 5 Boxes)
//=============================================================================
function Window_StatusEquipSlot() {
    this.initialize.apply(this, arguments);
}

Window_StatusEquipSlot.prototype = Object.create(Window_EquipSlot.prototype);
Window_StatusEquipSlot.prototype.constructor = Window_StatusEquipSlot;

Window_StatusEquipSlot.prototype.initialize = function(x, y, width, height) {
    Window_EquipSlot.prototype.initialize.call(this, x, y, width, height);
    this._windowBackSprite.alpha = 0; // Transparan background
    this._windowFrameSprite.alpha = 0; // Transparan frame
    this.contentsOpacity = 255;
};

Window_StatusEquipSlot.prototype.standardPadding = function() {
    return 0; // Padding 0 agar koordinat sama persis dengan layar (absolute)
};

// Item Rect determines cursor position and click area
Window_StatusEquipSlot.prototype.itemRect = function(index) {
    var rect = new Rectangle();
    var boxSize = 48; // Ukuran kotak pink (bisa disesuaikan)
    
    // Mapped ke parameter X/Y bawaan MOG_SceneStatus
    if (index === 0) { // Weapon
        rect.x = Moghunter.scStatus_WeaponX;
        rect.y = Moghunter.scStatus_WeaponY;
    } else if (index === 1) { // Shield
        rect.x = Moghunter.scStatus_ShieldX;
        rect.y = Moghunter.scStatus_ShieldY;
    } else if (index === 2) { // Helmet
        rect.x = Moghunter.scStatus_HelmetX;
        rect.y = Moghunter.scStatus_HelmetY;
    } else if (index === 3) { // Armor
        rect.x = Moghunter.scStatus_ArmorX;
        rect.y = Moghunter.scStatus_ArmorY;
    } else if (index === 4) { // Accessory
        rect.x = Moghunter.scStatus_AccessoryX;
        rect.y = Moghunter.scStatus_AccessoryY;
    } else {
        rect.x = -100;
        rect.y = -100;
    }
    
    // Penyesuaian kursor agar pas di dalam/luar kotak
    // Default kotak pink di gambar sepertinya lebih besar sedikit dari 32x32 icon
    rect.width = boxSize;
    rect.height = boxSize;
    // Offset sedikit ke kiri/atas agar kursor kotak nge-pas
    rect.x -= 8;
    rect.y -= 8;
    
    return rect;
};

// Hanya gambar Icon-nya saja (tanpa text)
Window_StatusEquipSlot.prototype.drawItem = function(index) {
    if (this._actor) {
        var rect = this.itemRectForText(index);
        var item = this._actor.equips()[index];
        if (item) {
            // Gambar icon tepat di tengah kotak
            // rect ditarik dari itemRect, kita offset balik +8 agar pas ke koordinat awal
            this.drawIcon(item.iconIndex, rect.x + 8, rect.y + 8);
        }
    }
};

Window_StatusEquipSlot.prototype.maxCols = function() {
    return 1;
};

// Pastikan background tidak di-draw ulang (hide completely)
Window_StatusEquipSlot.prototype._refreshAllParts = function() {
    Window_Selectable.prototype._refreshAllParts.call(this);
    this._windowBackSprite.visible = false;
    this._windowFrameSprite.visible = false;
};

