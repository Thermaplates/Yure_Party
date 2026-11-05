//=============================================================================
// RPG Maker MZ - CustomLogo
//=============================================================================

/*:
 * @target MV MZ
 * @plugindesc Shows RPG Maker and user logos at the start of the game.
 * @author nz_prism
 *
 * @help CustomLogo.js
 * ver. 1.0.0
 * 
 * [History]
 * 05/12/2023 1.0.0 Released
 * 
 * This plugin shows RPG Maker logo and other images at the start of the game,
 * such as user logos or notes. It can show up to 3 logos in turns. Logo
 * settings including image file and showing times can be configured through
 * plugin parameters.
 * Setting the plugin parameter "Logo n Skippable" to true enables players to
 * skip the logo by pressing OK or cancel button. Plus, setting the plugin
 * parameter "Allow Total Skip" to true enables players to skip all the logos
 * just by single button pressing. If there are any logos which aren't
 * skippable, it will proceed to the timing before the logo appears.
 * 
 * Note the default image for Logo 1 is an RPG Maker logo. Although you can
 * replace it with any image, you are recommended to use it to display your
 * game is made with RPG Maker.
 *
 * @param logo1
 * @text Logo 1 Settings
 * @desc The settings for the first logo.
 * 
 * @param logo1ImageName
 * @text Logo 1 Image Name
 * @desc The image file name for the first logo. If no image is specified, the next logo will be shown.
 * @parent logo1
 * @type file
 * @dir img/system
 * 
 * @param logo1Skippable
 * @text Logo 1 Skippable
 * @desc If true, players can skip the first logo.
 * @parent logo1
 * @type boolean
 * @default true
 * 
 * @param logo1Coordinate
 * @text Logo 1 Coordinate
 * @desc The coordinate settings for the first logo.
 * @parent logo1
 * 
 * @param logo1X
 * @text Logo 1 X
 * @desc The x for the first logo.
 * @parent logo1Coordinate
 * @type number
 * @default 408
 * 
 * @param logo1Y
 * @text Logo 1 Y
 * @desc The y for the first logo.
 * @parent logo1Coordinate
 * @type number
 * @default 312
 * 
 * @param logo1Origin
 * @text Logo 1 Origin
 * @desc THe origin for the first logo.
 * @parent logo1Coordinate
 * @default 0.5
 * @type select
 * @option Upper Left
 * @value 0
 * @option Center
 * @value 0.5
 * 
 * @param logo1Scale
 * @text Logo 1 Scale
 * @desc Skala ukuran logo 1 (contoh: 0.35 untuk foto 1600x1600 agar pas di layar, 1.0 untuk normal). 0 untuk Auto-Fit.
 * @parent logo1Coordinate
 * @default 0.35
 * 
 * @param logo1Time
 * @text Logo 1 Times
 * @desc The time settings for the first logo.
 * @parent logo1
 * 
 * @param logo1FadeinFrames
 * @text Logo 1 Fade-in Time
 * @desc The frames for the first logo to fade in.
 * @parent logo1Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo1FadeoutFrames
 * @text Logo 1 Fade-out Time
 * @desc The frames for the first logo to fade out.
 * @parent logo1Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo1DurationFrames
 * @text Logo 1 Shown Time
 * @desc The frames for the first logo to be shown.
 * @parent logo1Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param logo2
 * @text Logo 2 Settings
 * @desc The settings for the second logo.
 * 
 * @param logo2ImageName
 * @text Logo 2 Image Name
 * @desc The image file name for the second logo. If no image is specified, the next logo will be shown.
 * @parent logo2
 * @type file
 * @dir img/system
 * 
 * @param logo2Skippable
 * @text Logo 2 Skippable
 * @desc If true, players can skip the second logo.
 * @parent logo2
 * @type boolean
 * @default true
 * 
 * @param logo2Coordinate
 * @text Logo 2 Coordinate
 * @desc The coordinate settings for the second logo.
 * @parent logo2
 * 
 * @param logo2X
 * @text Logo 2 X
 * @desc The x for the second logo.
 * @parent logo2Coordinate
 * @type number
 * @default 408
 * 
 * @param logo2Y
 * @text Logo 2 Y
 * @desc The y for the second logo.
 * @parent logo2Coordinate
 * @type number
 * @default 312
 * 
 * @param logo2Origin
 * @text Logo 2 Origin
 * @desc THe origin for the second logo.
 * @parent logo2Coordinate
 * @default 0.5
 * @type select
 * @option Upper Left
 * @value 0
 * @option Center
 * @value 0.5
 * 
 * @param logo2Time
 * @text Logo 2 Times
 * @desc The time settings for the second logo.
 * @parent logo2
 * 
 * @param logo2FadeinFrames
 * @text Logo 2 Fade-in Time
 * @desc The frames for the second logo to fade in.
 * @parent logo2Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo2FadeoutFrames
 * @text Logo 2 Fade-out Time
 * @desc The frames for the second logo to fade out.
 * @parent logo2Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo2DurationFrames
 * @text Logo 2 Shown Time
 * @desc The frames for the second logo to be shown.
 * @parent logo2Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param logo3
 * @text Logo 3 Settings
 * @desc The settings for the third logo.
 * 
 * @param logo3ImageName
 * @text Logo 3 Image Name
 * @desc The image file name for the third logo. If no image is specified, it will proceed to the title scene.
 * @parent logo3
 * @type file
 * @dir img/system
 * 
 * @param logo3Skippable
 * @text Logo 3 Skippable
 * @desc If true, players can skip the third logo.
 * @parent logo3
 * @type boolean
 * @default true
 * 
 * @param logo3Coordinate
 * @text Logo 3 Coordinate
 * @desc The coordinate settings for the third logo.
 * @parent logo3
 * 
 * @param logo3X
 * @text Logo 3 X
 * @desc The x for the third logo.
 * @parent logo3Coordinate
 * @type number
 * @default 408
 * 
 * @param logo3Y
 * @text Logo 3 Y
 * @desc The y for the third logo.
 * @parent logo3Coordinate
 * @type number
 * @default 312
 * 
 * @param logo3Origin
 * @text Logo 3 Origin
 * @desc THe origin for the third logo.
 * @parent logo3Coordinate
 * @default 0.5
 * @type select
 * @option Upper Left
 * @value 0
 * @option Center
 * @value 0.5
 * 
 * @param logo3Time
 * @text Logo 3 Times
 * @desc The time settings for the third logo.
 * @parent logo3
 * 
 * @param logo3FadeinFrames
 * @text Logo 3 Fade-in Time
 * @desc The frames for the third logo to fade in.
 * @parent logo3Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo3FadeoutFrames
 * @text Logo 3 Fade-out Time
 * @desc The frames for the third logo to fade out.
 * @parent logo3Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo3DurationFrames
 * @text Logo 3 Shown Time
 * @desc The frames for the third logo to be shown.
 * @parent logo3Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param allowTotalSkip
 * @text Allow Total Skip
 * @desc If true, players can skip all the logos just by single button pressing.
 * @type boolean
 * @default true
 * 
 * @param --- Glitch Transition ---
 * @default
 *
 * @param enableGlitchTransition
 * @text Aktifkan Glitch Logo
 * @desc Mengaktifkan efek glitch dan suara static saat berganti dari Logo 1 ke Logo 2.
 * @parent --- Glitch Transition ---
 * @type boolean
 * @default true
 *
 * @param glitchDuration
 * @text Durasi Efek Glitch (Frame)
 * @desc Jumlah frame saat efek glitch dan noise terjadi (Default: 32 frame / ~0.5 detik).
 * @parent --- Glitch Transition ---
 * @type number
 * @min 10
 * @max 120
 * @default 32
 *
 * @param glitchSEName
 * @text Nama SE Glitch
 * @desc Nama file suara efek di audio/se/ (Default: Noise).
 * @parent --- Glitch Transition ---
 * @type file
 * @dir audio/se
 * @default Noise
 *
 * @param glitchSEVolume
 * @text Volume SE Glitch
 * @desc Volume suara glitch (0 - 100).
 * @parent --- Glitch Transition ---
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param glitchSEPitch
 * @text Pitch SE Glitch
 * @desc Pitch kecepatan nada suara glitch (50 - 150, default 115).
 * @parent --- Glitch Transition ---
 * @type number
 * @min 50
 * @max 150
 * @default 115
 * 
 */

/*:ja
 * @target MV MZ
 * @plugindesc ゲーム起動時にRPG Makerおよびユーザーロゴを表示します。
 * @author nz_prism
 *
 * @help CustomLogo.js
 * ver. 1.0.0
 * 
 * [バージョン履歴]
 * 2023/05/12 1.0.0 リリース
 * 
 * RPG Makerロゴおよび各種ユーザーロゴや注意書きなどをゲーム起動時に表示するプ
 * ラグインです。最大3つまでのロゴを順番に表示できます。表示画像や表示時間はプ
 * ラグインパラメータにより細かく設定することが可能です。
 * プラグインパラメータ「ロゴnスキップ可能」をオンに設定すると、決定ボタンや
 * キャンセルボタンの押下によるそのロゴのスキップが可能になります。また、プラグ
 * インパラメータ「全スキップを許可」をオンにすると、一回のボタン押下により全て
 * のロゴがスキップされるようになります。スキップ不可のロゴが存在する場合、その
 * ロゴの前までのロゴがスキップされます。
 * 
 * なおロゴ1の画像としてデフォルトで設定されている画像はRPG Makerのロゴです。
 * 本ロゴについては、RPGMaker製ゲームであることを明示するために表示を推奨して
 * おります。
 *
 * @param logo1
 * @text ロゴ1設定
 * @desc 最初に表示するロゴの設定です。
 * 
 * @param logo1ImageName
 * @text ロゴ1画像名
 * @desc 最初に表示するロゴの画像ファイル名です。未設定の場合、次のロゴが表示されます。
 * @parent logo1
 * @type file
 * @dir img/system
 * 
 * @param logo1Skippable
 * @text ロゴ1スキップ可能
 * @desc オンにすると最初に表示するロゴをボタン押下によりスキップ可能になります。
 * @parent logo1
 * @type boolean
 * @default true
 * 
 * @param logo1Coordinate
 * @text ロゴ1座標
 * @desc 最初に表示するロゴの座標設定です。
 * @parent logo1
 * 
 * @param logo1X
 * @text ロゴ1X座標
 * @desc 最初に表示するロゴのX座標です。
 * @parent logo1Coordinate
 * @type number
 * @default 408
 * 
 * @param logo1Y
 * @text ロゴ1Y座標
 * @desc 最初に表示するロゴのY座標です。
 * @parent logo1Coordinate
 * @type number
 * @default 312
 * 
 * @param logo1Origin
 * @text ロゴ1原点
 * @desc 最初に表示するロゴの座標原点です。
 * @parent logo1Coordinate
 * @default 0.5
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 0.5
 * 
 * @param logo1Time
 * @text ロゴ1表示時間
 * @desc 最初に表示するロゴの表示時間設定です。
 * @parent logo1
 * 
 * @param logo1FadeinFrames
 * @text ロゴ1フェードイン時間
 * @desc 最初に表示するロゴのフェードインフレーム数です。
 * @parent logo1Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo1FadeoutFrames
 * @text ロゴ1フェードアウト時間
 * @desc 最初に表示するロゴのフェードアウトフレーム数です。
 * @parent logo1Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo1DurationFrames
 * @text ロゴ1表示時間
 * @desc 最初に表示するロゴの表示フレーム数です。
 * @parent logo1Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param logo2
 * @text ロゴ2設定
 * @desc 2番目に表示するロゴの設定です。
 * 
 * @param logo2ImageName
 * @text ロゴ2画像名
 * @desc 2番目に表示するロゴの画像ファイル名です。未設定の場合、次のロゴが表示されます。
 * @parent logo2
 * @type file
 * @dir img/system
 * 
 * @param logo2Skippable
 * @text ロゴ2スキップ可能
 * @desc オンにすると2番目に表示するロゴをボタン押下によりスキップ可能になります。
 * @parent logo2
 * @type boolean
 * @default true
 * 
 * @param logo2Coordinate
 * @text ロゴ2座標
 * @desc 2番目に表示するロゴの座標設定です。
 * @parent logo2
 * 
 * @param logo2X
 * @text ロゴ2X座標
 * @desc 2番目に表示するロゴのX座標です。
 * @parent logo2Coordinate
 * @type number
 * @default 408
 * 
 * @param logo2Y
 * @text ロゴ2Y座標
 * @desc 2番目に表示するロゴのY座標です。
 * @parent logo2Coordinate
 * @type number
 * @default 312
 * 
 * @param logo2Origin
 * @text ロゴ2原点
 * @desc 2番目に表示するロゴの座標原点です。
 * @parent logo2Coordinate
 * @default 0.5
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 0.5
 * 
 * @param logo2Time
 * @text ロゴ2表示時間
 * @desc 2番目に表示するロゴの表示時間設定です。
 * @parent logo2
 * 
 * @param logo2FadeinFrames
 * @text ロゴ2フェードイン時間
 * @desc 2番目に表示するロゴのフェードインフレーム数です。
 * @parent logo2Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo2FadeoutFrames
 * @text ロゴ2フェードアウト時間
 * @desc 2番目に表示するロゴのフェードアウトフレーム数です。
 * @parent logo2Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo2DurationFrames
 * @text ロゴ2表示時間
 * @desc 2番目に表示するロゴの表示フレーム数です。
 * @parent logo2Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param logo3
 * @text ロゴ3設定
 * @desc 3番目に表示するロゴの設定です。
 * 
 * @param logo3ImageName
 * @text ロゴ3画像名
 * @desc 3番目に表示するロゴの画像ファイル名です。未設定の場合、タイトル画面に移行します。
 * @parent logo3
 * @type file
 * @dir img/system
 * 
 * @param logo3Skippable
 * @text ロゴ3スキップ可能
 * @desc オンにすると3番目に表示するロゴをボタン押下によりスキップ可能になります。
 * @parent logo3
 * @type boolean
 * @default true
 * 
 * @param logo3Coordinate
 * @text ロゴ3座標
 * @desc 3番目に表示するロゴの座標設定です。
 * @parent logo3
 * 
 * @param logo3X
 * @text ロゴ3X座標
 * @desc 3番目に表示するロゴのX座標です。
 * @parent logo3Coordinate
 * @type number
 * @default 408
 * 
 * @param logo3Y
 * @text ロゴ3Y座標
 * @desc 3番目に表示するロゴのY座標です。
 * @parent logo3Coordinate
 * @type number
 * @default 312
 * 
 * @param logo3Origin
 * @text ロゴ3原点
 * @desc 3番目に表示するロゴの座標原点です。
 * @parent logo3Coordinate
 * @default 0.5
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 0.5
 * 
 * @param logo3Time
 * @text ロゴ3表示時間
 * @desc 3番目に表示するロゴの表示時間設定です。
 * @parent logo3
 * 
 * @param logo3FadeinFrames
 * @text ロゴ3フェードイン時間
 * @desc 3番目に表示するロゴのフェードインフレーム数です。
 * @parent logo3Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo3FadeoutFrames
 * @text ロゴ3フェードアウト時間
 * @desc 3番目に表示するロゴのフェードアウトフレーム数です。
 * @parent logo3Time
 * @type number
 * @default 12
 * @min 1
 * 
 * @param logo3DurationFrames
 * @text ロゴ3表示時間
 * @desc 3番目に表示するロゴの表示フレーム数です。
 * @parent logo3Time
 * @type number
 * @default 120
 * @min 1
 * 
 * @param allowTotalSkip
 * @text 全スキップを許可
 * @desc オンにすると一回のボタン押下によりすべてのロゴがスキップされます（スキップ可能なもののみ）。
 * @type boolean
 * @default true
 * 
 */


(() => {
    'use strict';
    var PLUGIN_NAME = "CustomLogo";
    var pluginParams = PluginManager.parameters(PLUGIN_NAME);

    var LOGO1_IMAGE_NAME = pluginParams.logo1ImageName;
    var LOGO1_SKIPPABLE = pluginParams.logo1Skippable == "true";
    var LOGO1_X = Number(pluginParams.logo1X);
    var LOGO1_Y = Number(pluginParams.logo1Y);
    var LOGO1_ORIGN = Number(pluginParams.logo1Origin);
    var LOGO1_SCALE = (pluginParams.logo1Scale !== undefined && pluginParams.logo1Scale !== "") ? Number(pluginParams.logo1Scale) : 0.35;
    var LOGO1_FADEIN_FRAMES = Number(pluginParams.logo1FadeinFrames);
    var LOGO1_FADEOUT_FRAMES = Number(pluginParams.logo1FadeoutFrames);
    var LOGO1_DURATION_FRAMES = Number(pluginParams.logo1DurationFrames);

    var LOGO2_IMAGE_NAME = pluginParams.logo2ImageName;
    var LOGO2_SKIPPABLE = pluginParams.logo2Skippable == "true";
    var LOGO2_X = Number(pluginParams.logo2X);
    var LOGO2_Y = Number(pluginParams.logo2Y);
    var LOGO2_ORIGN = Number(pluginParams.logo2Origin);
    var LOGO2_SCALE = (pluginParams.logo2Scale !== undefined && pluginParams.logo2Scale !== "") ? Number(pluginParams.logo2Scale) : 1.0;
    var LOGO2_FADEIN_FRAMES = Number(pluginParams.logo2FadeinFrames);
    var LOGO2_FADEOUT_FRAMES = Number(pluginParams.logo2FadeoutFrames);
    var LOGO2_DURATION_FRAMES = Number(pluginParams.logo2DurationFrames);

    var LOGO3_IMAGE_NAME = pluginParams.logo3ImageName;
    var LOGO3_SKIPPABLE = pluginParams.logo3Skippable == "true";
    var LOGO3_X = Number(pluginParams.logo3X);
    var LOGO3_Y = Number(pluginParams.logo3Y);  
    var LOGO3_ORIGN = Number(pluginParams.logo3Origin);
    var LOGO3_SCALE = (pluginParams.logo3Scale !== undefined && pluginParams.logo3Scale !== "") ? Number(pluginParams.logo3Scale) : 1.0;
    var LOGO3_FADEIN_FRAMES = Number(pluginParams.logo3FadeinFrames);
    var LOGO3_FADEOUT_FRAMES = Number(pluginParams.logo3FadeoutFrames);
    var LOGO3_DURATION_FRAMES = Number(pluginParams.logo3DurationFrames);

    var ALLOW_TOTAL_SKIP = pluginParams.allowTotalSkip == "true";

    var ENABLE_GLITCH = (pluginParams.enableGlitchTransition !== undefined) ? (pluginParams.enableGlitchTransition == "true") : true;
    var GLITCH_DURATION = Number(pluginParams.glitchDuration || 32);
    var GLITCH_SE_NAME = pluginParams.glitchSEName || "Noise";
    var GLITCH_SE_VOLUME = Number(pluginParams.glitchSEVolume || 90);
    var GLITCH_SE_PITCH = Number(pluginParams.glitchSEPitch || 115);


    ImageManager.loadLogoImages = function() {
        this.loadSystem(LOGO1_IMAGE_NAME);
        this.loadSystem(LOGO2_IMAGE_NAME);
        this.loadSystem(LOGO3_IMAGE_NAME);
    };


    var _Scene_Boot_prototype_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_prototype_loadSystemImages.call(this);
        ImageManager.loadLogoImages();
    };

    if (Utils.RPGMAKER_NAME == "MZ") {
        Scene_Boot.prototype.startNormalGame = function() {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Logo);
            Window_TitleCommand.initCommandPosition();
        };
    } else {
        Scene_Boot.prototype.start = function() {
            Scene_Base.prototype.start.call(this);
            SoundManager.preloadImportantSounds();
            if (DataManager.isBattleTest()) {
                DataManager.setupBattleTest();
                SceneManager.goto(Scene_Battle);
            } else if (DataManager.isEventTest()) {
                DataManager.setupEventTest();
                SceneManager.goto(Scene_Map);
            } else {
                this.checkPlayerLocation();
                DataManager.setupNewGame();
                SceneManager.goto(Scene_Logo);
                Window_TitleCommand.initCommandPosition();
            }
            this.updateDocumentTitle();
        };
    }


    function Scene_Logo() {
        this.initialize(...arguments);
    }
    
    Scene_Logo.prototype = Object.create(Scene_Base.prototype);
    Scene_Logo.prototype.constructor = Scene_Logo;
    
    Scene_Logo.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._logoIndex = 0;
        this._phase = 0;
        this._duration = 0;
    };

    Scene_Logo.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createSprites();
    };
    
    Scene_Logo.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
    };
    
    Scene_Logo.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        this.updateInput();
        this.updatePhase();
    };
    
    Scene_Logo.prototype.updateInput = function() {
        if (
            Input.isTriggered("ok") ||
            Input.isTriggered("cancel") ||
            TouchInput.isTriggered() ||
            TouchInput.isCancelled()
        ) {
            var oldLogoIndex = this._logoIndex;
            switch (this._logoIndex) {
                case 0:
                    if (LOGO1_SKIPPABLE) {
                        this._logoIndex++;
                        this._logo1Sprite.opacity = 0;
                        if (ALLOW_TOTAL_SKIP) {
                            if (LOGO2_SKIPPABLE) {
                                this._logoIndex++;
                                if (LOGO3_SKIPPABLE) {
                                    this._logoIndex++;
                                }
                            }
                        }
                    }
                    break;
                case 1:
                    if (LOGO2_SKIPPABLE) {
                        this._logoIndex++;
                        this._logo2Sprite.opacity = 0;
                        if (ALLOW_TOTAL_SKIP && LOGO3_SKIPPABLE) {
                            this._logoIndex++;
                        }
                    }
                    break;
                case 2:
                    if (LOGO3_SKIPPABLE) this._logoIndex++;
                    break;
            }
            if (this._logoIndex != oldLogoIndex) {
                this.stopGlitchEffect();
                this._phase = 0;
                this._duration = 0;
            }
        }
    };
    
    Scene_Logo.prototype.increasingOpacityPerFrame = function() {
        switch (this._logoIndex) {
            case 0: return Math.ceil(255 / LOGO1_FADEIN_FRAMES);
            case 1: return Math.ceil(255 / LOGO2_FADEIN_FRAMES);
            case 2: return Math.ceil(255 / LOGO3_FADEIN_FRAMES);
            default: return 22;
        }
    };

    Scene_Logo.prototype.decreasingOpacityPerFrame = function() {
        switch (this._logoIndex) {
            case 0: return Math.ceil(255 / LOGO1_FADEOUT_FRAMES);
            case 1: return Math.ceil(255 / LOGO2_FADEOUT_FRAMES);
            case 2: return Math.ceil(255 / LOGO3_FADEOUT_FRAMES);
            default: return 22;
        }
    };

    Scene_Logo.prototype.updatePhase = function() {
        // Handle Glitch Transition between Logo 1 and Logo 2
        if (ENABLE_GLITCH && LOGO1_IMAGE_NAME && LOGO2_IMAGE_NAME && this._logoIndex === 0 && this._phase === 2) {
            this.updateGlitchPhase();
            return;
        }

        var sprite;
        var maxDuration;
        switch (this._logoIndex) {
            case 0:
                if (LOGO1_IMAGE_NAME) {
                    sprite = this._logo1Sprite;
                    switch (this._phase) {
                        case 0: maxDuration = LOGO1_FADEIN_FRAMES; break;
                        case 2: maxDuration = LOGO1_FADEOUT_FRAMES; break;
                        default: maxDuration = LOGO1_DURATION_FRAMES; break;
                    }
                } else {
                    this._logoIndex++;
                    return;
                }
                break;
            case 1:
                if (LOGO2_IMAGE_NAME) {
                    sprite = this._logo2Sprite;
                    switch (this._phase) {
                        case 0: maxDuration = LOGO2_FADEIN_FRAMES; break;
                        case 2: maxDuration = LOGO2_FADEOUT_FRAMES; break;
                        default: maxDuration = LOGO2_DURATION_FRAMES; break;
                    }
                } else {
                    this._logoIndex++;
                    return;
                }
                break;
            case 2:
                if (LOGO3_IMAGE_NAME) {
                    sprite = this._logo3Sprite;
                    switch (this._phase) {
                        case 0: maxDuration = LOGO3_FADEIN_FRAMES; break;
                        case 2: maxDuration = LOGO3_FADEOUT_FRAMES; break;
                        default: maxDuration = LOGO3_DURATION_FRAMES; break;
                    }
                } else {
                    this._logoIndex++;
                    return;
                }
                break;
            default:
                SceneManager.goto(Scene_Title);
                return;
        }
        if (this._duration < maxDuration) {
            this._duration++;
            switch (this._phase) {
                case 0:
                    sprite.opacity = Math.min(sprite.opacity + this.increasingOpacityPerFrame(), 255);
                    break;
                case 2:
                    if (this._logoIndex === 1 && this._whiteBg && this._blackFade) {
                        // For white-background modern Logo 2: fade the entire screen uniformly to black using the overlay
                        // This guarantees 0 seams, 0 borders, and 100% consistent color across center & edges!
                        var fadeProg = Math.min(1.0, this._duration / maxDuration);
                        this._blackFade.opacity = Math.floor(255 * fadeProg);
                        // Keep white background and logo solid underneath so no opacity mismatch occurs
                        this._whiteBg.opacity = 255;
                        sprite.opacity = 255;
                    } else {
                        sprite.opacity = Math.max(sprite.opacity - this.decreasingOpacityPerFrame(), 0);
                    }
                    break;
            }
        } else {
            this._duration = 0;
            this._phase++;
            if (this._phase == 3) {
                this._phase = 0;
                this._logoIndex++;
            }
        }
    };
    
    Scene_Logo.prototype.isBusy = function() {
        return false;
    };
    
    Scene_Logo.prototype.createSprites = function() {
        var logo1 = new Sprite();
        var logo2 = new Sprite();
        var logo3 = new Sprite();
        logo1.bitmap = ImageManager.loadSystem(LOGO1_IMAGE_NAME);
        logo2.bitmap = ImageManager.loadSystem(LOGO2_IMAGE_NAME);
        logo3.bitmap = ImageManager.loadSystem(LOGO3_IMAGE_NAME);
        logo1.anchor.x = LOGO1_ORIGN;
        logo1.anchor.y = LOGO1_ORIGN;
        logo2.anchor.x = LOGO2_ORIGN;
        logo2.anchor.y = LOGO2_ORIGN;
        logo3.anchor.x = LOGO3_ORIGN;
        logo3.anchor.y = LOGO3_ORIGN;

        // Auto-center precisely if Origin is Center (0.5)
        logo1.x = (LOGO1_ORIGN === 0.5) ? Graphics.boxWidth / 2 : LOGO1_X;
        logo1.y = (LOGO1_ORIGN === 0.5) ? Graphics.boxHeight / 2 : LOGO1_Y;
        logo2.x = (LOGO2_ORIGN === 0.5) ? Graphics.boxWidth / 2 : LOGO2_X;
        logo2.y = (LOGO2_ORIGN === 0.5) ? Graphics.boxHeight / 2 : LOGO2_Y;
        logo3.x = (LOGO3_ORIGN === 0.5) ? Graphics.boxWidth / 2 : LOGO3_X;
        logo3.y = (LOGO3_ORIGN === 0.5) ? Graphics.boxHeight / 2 : LOGO3_Y;

        this.applyLogoScale(logo1, LOGO1_SCALE);
        this.applyLogoScale(logo2, LOGO2_SCALE);
        this.applyLogoScale(logo3, LOGO3_SCALE);

        this._logo1Sprite = logo1;
        this._logo2Sprite = logo2;
        this._logo3Sprite = logo3;
        logo1.opacity = 0;
        logo2.opacity = 0;
        logo3.opacity = 0;

        // Ensure smooth scaling for high-res images
        if (logo1.bitmap) logo1.bitmap.smooth = true;
        if (logo2.bitmap) logo2.bitmap.smooth = true;
        if (logo3.bitmap) logo3.bitmap.smooth = true;

        // Fullscreen white background for modern Logo 2 (pethog 2)
        var whiteBg = new Sprite();
        whiteBg.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        whiteBg.bitmap.fillAll('#ffffff');
        whiteBg.opacity = 0;
        this._whiteBg = whiteBg;
        this.addChildAt(whiteBg, 0);

        this.addChild(logo1);
        this.addChild(logo2);
        this.addChild(logo3);

        this.createGlitchSprites();

        // Top-level black fade overlay for 100% seamless, uniform darkening without seam borders
        var blackFade = new Sprite();
        blackFade.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        blackFade.bitmap.fillAll('#000000');
        blackFade.opacity = 0;
        this._blackFade = blackFade;
        this.addChild(blackFade);
    };

    Scene_Logo.prototype.createGlitchSprites = function() {
        var red = new Sprite();
        red.anchor.x = 0.5;
        red.anchor.y = 0.5;
        red.tint = 0xff2266;
        red.blendMode = Graphics.BLEND_ADD;
        red.visible = false;
        this._glitchRed = red;
        this.addChild(red);

        var cyan = new Sprite();
        cyan.anchor.x = 0.5;
        cyan.anchor.y = 0.5;
        cyan.tint = 0x22ffff;
        cyan.blendMode = Graphics.BLEND_ADD;
        cyan.visible = false;
        this._glitchCyan = cyan;
        this.addChild(cyan);

        var bars = new PIXI.Graphics();
        bars.visible = false;
        this._glitchBars = bars;
        this.addChild(bars);
    };

    Scene_Logo.prototype.updateGlitchPhase = function() {
        this._duration++;
        var t = this._duration;
        var maxT = GLITCH_DURATION;
        var midT = Math.floor(maxT * 0.45);

        // 1. Play Glitch Sound FX
        if (t === 1 && GLITCH_SE_NAME) {
            AudioManager.playSe({
                name: GLITCH_SE_NAME,
                volume: GLITCH_SE_VOLUME,
                pitch: GLITCH_SE_PITCH,
                pan: 0
            });
        } else if (t === midT && GLITCH_SE_NAME) {
            AudioManager.playSe({
                name: GLITCH_SE_NAME,
                volume: Math.floor(GLITCH_SE_VOLUME * 0.85),
                pitch: Math.floor(GLITCH_SE_PITCH * 1.25),
                pan: 0
            });
        }

        // 2. Texture & Fullscreen Background Swap
        var currentActive = (t < midT) ? this._logo1Sprite : this._logo2Sprite;
        var hiddenSprite = (t < midT) ? this._logo2Sprite : this._logo1Sprite;

        hiddenSprite.opacity = 0;
        currentActive.opacity = 255;

        // Background transition: Black before midT -> Pure White after midT
        if (this._whiteBg) {
            if (t < midT) {
                this._whiteBg.opacity = 0;
            } else if (t === midT) {
                // Flash of full white
                this._whiteBg.opacity = 255;
            } else if (t === midT + 1 && Math.random() > 0.6) {
                // Micro-stutter flicker
                this._whiteBg.opacity = 0;
            } else {
                this._whiteBg.opacity = 255;
            }
        }

        // Smooth bell curve for glitch intensity
        var progress = t / maxT;
        var intensity = Math.sin(progress * Math.PI);
        var noisyIntensity = intensity * (0.6 + Math.random() * 0.7);

        // 3. Screen / Sprite Jitter
        var centerX = Graphics.boxWidth / 2;
        var centerY = Graphics.boxHeight / 2;
        var shakeX = (Math.random() - 0.5) * 26 * noisyIntensity;
        var shakeY = (Math.random() - 0.5) * 8 * noisyIntensity;

        currentActive.x = centerX + shakeX;
        currentActive.y = centerY + shakeY;

        // 4. Chromatic Aberration Ghosts (Only active on dark Logo 1 phase)
        if (this._glitchRed && this._glitchCyan && currentActive.bitmap) {
            if (t < midT) {
                this._glitchRed.visible = true;
                this._glitchCyan.visible = true;
                this._glitchRed.bitmap = currentActive.bitmap;
                this._glitchCyan.bitmap = currentActive.bitmap;
                this._glitchRed.scale.x = currentActive.scale.x;
                this._glitchRed.scale.y = currentActive.scale.y;
                this._glitchCyan.scale.x = currentActive.scale.x;
                this._glitchCyan.scale.y = currentActive.scale.y;

                var rgbOffset = 18 * noisyIntensity;
                this._glitchRed.x = centerX + shakeX + (Math.random() * 2 - 1) * rgbOffset;
                this._glitchRed.y = centerY + shakeY + (Math.random() * 2 - 1) * 6 * noisyIntensity;
                this._glitchRed.opacity = Math.floor(190 * noisyIntensity);

                this._glitchCyan.x = centerX + shakeX - (Math.random() * 2 - 1) * rgbOffset;
                this._glitchCyan.y = centerY + shakeY - (Math.random() * 2 - 1) * 6 * noisyIntensity;
                this._glitchCyan.opacity = Math.floor(190 * noisyIntensity);
            } else {
                this._glitchRed.visible = false;
                this._glitchCyan.visible = false;
            }
        }

        // 5. Digital Glitch Scanlines & Tear Bars
        // On black background (t < midT): neon cyan/red/white
        // On white background (t >= midT): black/dark glitch slices
        if (this._glitchBars) {
            this._glitchBars.clear();
            this._glitchBars.visible = true;
            var numBars = Math.floor(2 + Math.random() * 4);
            var isWhiteBg = (t >= midT);
            for (var b = 0; b < numBars; b++) {
                var barY = Math.random() * Graphics.boxHeight;
                var barH = 2 + Math.random() * 10;
                var barW = Graphics.boxWidth * (0.2 + Math.random() * 0.8);
                var barX = (Graphics.boxWidth - barW) * Math.random();
                var barColor;
                if (isWhiteBg) {
                    barColor = (Math.random() > 0.4) ? 0x000000 : (Math.random() > 0.5 ? 0x008888 : 0x880044);
                } else {
                    barColor = (Math.random() > 0.5) ? 0x22ffff : (Math.random() > 0.5 ? 0xff2266 : 0xffffff);
                }
                var barAlpha = 0.2 + Math.random() * 0.5 * noisyIntensity;
                this._glitchBars.beginFill(barColor, barAlpha);
                this._glitchBars.drawRect(barX, barY, barW, barH);
                this._glitchBars.endFill();
            }
        }

        // 6. Glitch Finished: transition cleanly into Logo 2 shown phase
        if (this._duration >= maxT) {
            this.stopGlitchEffect();
            this._logoIndex = 1;
            this._phase = 1;
            this._duration = 0;
            this._logo1Sprite.opacity = 0;
            this._logo2Sprite.opacity = 255;
            if (this._whiteBg) this._whiteBg.opacity = 255;
        }
    };

    Scene_Logo.prototype.stopGlitchEffect = function() {
        if (this._glitchRed) this._glitchRed.visible = false;
        if (this._glitchCyan) this._glitchCyan.visible = false;
        if (this._glitchBars) {
            this._glitchBars.clear();
            this._glitchBars.visible = false;
        }
        if (this._logo1Sprite) {
            this._logo1Sprite.x = Graphics.boxWidth / 2;
            this._logo1Sprite.y = Graphics.boxHeight / 2;
        }
        if (this._logo2Sprite) {
            this._logo2Sprite.x = Graphics.boxWidth / 2;
            this._logo2Sprite.y = Graphics.boxHeight / 2;
        }
        if (this._whiteBg) {
            // Keep white if on Logo 2, otherwise 0
            this._whiteBg.opacity = (this._logoIndex === 1) ? 255 : 0;
        }
        if (this._blackFade) {
            this._blackFade.opacity = 0;
        }
    };

    Scene_Logo.prototype.applyLogoScale = function(sprite, configuredScale) {
        function updateScale() {
            if (!sprite.bitmap) return;
            var finalScale = 1.0;
            if (configuredScale && configuredScale > 0) {
                finalScale = configuredScale;
            } else if (sprite.bitmap.width > 0 && sprite.bitmap.height > 0) {
                var maxW = Graphics.boxWidth * 0.70;
                var maxH = Graphics.boxHeight * 0.70;
                var sX = maxW / sprite.bitmap.width;
                var sY = maxH / sprite.bitmap.height;
                finalScale = Math.min(sX, sY, 1.0);
            }
            sprite.scale.x = finalScale;
            sprite.scale.y = finalScale;
        }

        if (configuredScale && configuredScale > 0) {
            sprite.scale.x = configuredScale;
            sprite.scale.y = configuredScale;
        }
        if (sprite.bitmap) {
            if (sprite.bitmap.isReady()) {
                updateScale();
            } else {
                sprite.bitmap.addLoadListener(updateScale);
            }
        }
    };


})();
