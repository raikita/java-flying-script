/*
 *  TODO: Projectile explode when hit enemy, fade when dying
 *  TODO: Animations
 *  TODO: Projectile Collision
 *  TODO: Point system
 *  
 */

var debug = false, showCollision = false;

var files;
var player;
var allPlatforms = [], inViewPlatforms = [], 
	allProjectiles = [], 
	allEnemies = [], inViewEnemies = [],dyingEnemies = [],
	allCloudPlatforms = [], inViewCloudPlatforms = [],
	allGold = [], inViewGold = [];
var levelLimitsx, levelLimitsy, playerStartx, playerStarty;
var keydown = false, flyKeydown = false, shootKeydown = false;
var flyingFrames = 0, jumpingFrames = 0, landingFrames = 0, ouchingFrames = 0, dyingFrames = 0;
var worldGravity = 5;
var winSpot = {x:0, y:0, w:0, h:0};
var playerImgs = [], bgImgs = [], uiImgs = [], enemyImgs = [], projectileImgs = [], itemImgs = [];

var playerImgIndex = {
		IDLE : 0,
		WALK : 1,
		FLY: 2,
		GLIDE: 3,
	};

var enemyImgIndex = {
		IDLE : 0
	};

var projectileImgIndex = {
		FIRE : 0
	};

var itemImgIndex = {
		GOLD : 0
}

var bgImgIndex = {
		LAYERMID : 0,
		LAYERFRONT: 1,
		LAYERBACK : 2,
	};

var playerState = {
		Falling:"falling",
		Idling:"idling",
		Running:"running",
		Flying:"flying",
		Gliding:"gliding",
		Jumping:"jumping",
		Landing:"landing",
		Ouching:"ouching",
		Dying:"dying"
};

var enemyState = {
		Idling:"idling",
		Attacking:"attacking",
		Walking:"walking",
		Jumping:"jumping",
		Ouching:"ouching",
		Dying:"dying"
};

var key = {
		enter: 13,
		up: 38,
		down: 40,
		right: 39,
		left: 37,
		a: 65,
		s: 83
};

var camera = {
		x1 : 0,
		y1 : 0,
		x2 : document.getElementById('canvas').clientWidth,
		y2 : document.getElementById('canvas').clientHeight,
		update : function() {
			camera.x1 = player.x - gameArea.canvas.clientWidth/2;
			camera.y1 = player.y - gameArea.canvas.clientHeight/2;
			if (camera.x1 < 0) camera.x1 = 0;
			if (camera.y1 < 0) camera.y1 = 0;
			if (camera.x1 > levelLimitsx - gameArea.canvas.clientWidth) {
				camera.x1 = levelLimitsx - gameArea.canvas.clientWidth;
			}
			if (camera.y1 > levelLimitsy - gameArea.canvas.clientHeight) {
				camera.y1 = levelLimitsy - gameArea.canvas.clientHeight;
			}
			camera.x2 = camera.x1 + gameArea.canvas.clientWidth;
			camera.y2 = camera.y1 + gameArea.canvas.clientHeight;
		}
};

var gameArea = {
		canvas : document.getElementById('canvas'),
	    keys : function() {
	    	 // keyboard controls
	        window.addEventListener('keydown', function (e) {
	            gameArea.keys = (gameArea.keys || []);
	            gameArea.keys[e.keyCode] = (e.type == 'keydown');
	            if (!keydown) {
	            	keydown = true;
	            }
	            if (e.repeat) {
	            	keydown = false;
	            }
	            if (!flyKeydown && e.keyCode == key.a && keydown) {
	            	flyKeydown = true;
	            }
	            if (!shootKeydown && e.keyCode == key.s && keydown) {
	            	shootKeydown = true;
	            }        
	        });
	        window.addEventListener('keyup', function (e) {
	        	if (gameArea.keys) gameArea.keys[e.keyCode] = (e.type == 'keydown');  
	            keydown = false;
	            flyKeydown = false;
	            shootKeydown = false;
	        });
	    },
	    mainMenu : function() {
	    	this.mainMenuLoop = requestAnimationFrame(mainMenu);
	    	this.selection = 0;
	    },
	    start : function() {
	        this.context = this.canvas.getContext("2d");
	        animatefps(60);
	    }
};

// *********************************************************************************** //
// ********************************* START LOAD GAME ********************************* //
// *********************************************************************************** //

function openGame() {
	loadingScreen();

	var loading = [];
	// DO IT IN THIS ORDER THE ORDER IS IMPORTANT
	loading.push(loadImages(uiImgs, "imgs/startscreen.png"));
	
	$.when.apply(null, loading).done(function() {
		gameArea.keys();
		gameArea.mainMenu();
	});	
}

function mainMenu() {
	var canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d");
		
	ctx.drawImage(uiImgs[0], camera.x1, camera.y1, canvas.width, canvas.height);

	ctx.font = "30px Arial";
	ctx.fillStyle = "#fff49f";
	ctx.fillText("Press Enter", camera.x1+250, camera.y1+262);
	
	// begin game
	if (gameArea.keys && gameArea.keys[key.enter]) {
		gameArea.keys = false;
		loadGame();
	}
	else {
		requestAnimationFrame(mainMenu);
	}
	
}

function loadGame() {
	//clearInterval(gameArea.mainMenuInterval);
	window.cancelAnimationFrame(gameArea.mainMenuLoop);
	gameArea.mainMenuLoop = undefined;
	loadingScreen();

	var loading = [];
	// DO IT IN THIS ORDER THE ORDER IS IMPORTANT
	// BACKGROUND
	loading.push(loadImages(bgImgs, "imgs/levels/level1-ground.png"));
	loading.push(loadImages(bgImgs, "imgs/levels/level1-clouds.png"));
	loading.push(loadImages(bgImgs, "imgs/levels/level1-bg-1.png"));
	
	// PLAYER SPRITES
	loading.push(loadImages(playerImgs, "imgs/player/idle.png"));
	loading.push(loadImages(playerImgs, "imgs/player/walk.png"));
	loading.push(loadImages(playerImgs, "imgs/player/fly.png"));
	loading.push(loadImages(playerImgs, "imgs/player/glide.png"));
	
	// ENEMY SPRITES
	loading.push(loadImages(enemyImgs, "imgs/enemies/pipo/idle.png"));
	
	// PROJECTILE SPRITES
	loading.push(loadImages(projectileImgs, "imgs/projectiles/fire.png"));
	
	// ITEM SPRITES
	loading.push(loadImages(itemImgs, "imgs/items/goldbar.png"));
	
	// HUD
	loading.push(loadImages(uiImgs, "imgs/hud.png"));
	loading.push(loadImages(uiImgs, "imgs/hud-heart.png"));
	loading.push(loadImages(uiImgs, "imgs/hud-flyRed.png"));
	loading.push(loadImages(uiImgs, "imgs/hud-flyGreen.png"));
	
	$.when.apply(null, loading).done(function() {
		startGame();
	});	
}

function loadImages(array, src) {
	var deferred = $.Deferred();
	var img = new Image();
	img.onload = function() {
		deferred.resolve();
	};
	img.src = src;
	array.push(img);
	return deferred.promise();
}

function loadingScreen() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var lin = ctx.createLinearGradient(0, 0, 1, 525);
	
	lin.addColorStop(0, "#efe2c0");
	lin.addColorStop(1, "#0b2834");
	
	ctx.fillStyle = lin;
	ctx.fillRect(0, 0, 700, 526);
	
	ctx.fillStyle = "black";
	ctx.font = "bold 50px Arial";
	ctx.fillText("LOADING....", (canvas.width / 2) - 150, (canvas.height / 2) + 25);
	
}

function loadFile() {
	var requests = new Array (files.length);
	for (let j = 0; j < files.length; ++j) {
		requests[j] = new XMLHttpRequest();
		requests[j].open('GET', files[j], true);
		
		var i, lines, l1, l2, l3, platform, platformType;
		
		requests[j].onload = function() {
			lines = requests[j].responseText.split("\n");
			for (var i = 0; i < lines.length; i += 3) {
				l1 = lines[i].split(" ");
				l2 = lines[i+1].split(" ");
				l3 = lines[i+2].split(" ");
				if (j == 0) platformType = "ground";
				if (j == 1) platformType = "cloud";
				platform = {x1:Number(l1[0]), y1:Number(l1[1]),
							x2:Number(l2[0]), y2:Number(l2[1]),
							x3:Number(l3[0]), y3:Number(l3[1]),
							type: platformType};
				allPlatforms.push(platform);
			}
		}
		requests[j].send(null);
	}
}

// *********************************************************************************** //
// ********************************** END LOAD GAME ********************************** //
// *********************************************************************************** //

// *********************************************************************************** //
// ***************************** START LEVEL GENERATION ****************************** //
// *********************************************************************************** //

function startGame() {
    gameLevel1();
    player = new playerSprite(80, 80, playerImgs[playerImgIndex.IDLE].src, playerStartx, playerStarty);
    inCameraView();
    gameArea.start();
}

function gameLevel1() {
    var background = new Image();
    levelLimitsx = 8192, levelLimitsy = 2048;
    playerStartx = 190, playerStarty = 362;
    
    files = ['level1-ground.txt',
    		 'level1-clouds.txt'];
  
    loadFile();
    
    spawnEnemy(1, 500, 1220);
    spawnEnemy(1, 700, 1220);
    spawnEnemy(1, 350, 1220);
    spawnEnemy(1, 5450, 880);
    spawnEnemy(1, 3430, 1630);
    spawnEnemy(1, 2688, 1500);
    spawnEnemy(1, 2550, 1830);
    spawnEnemy(1, 2270, 1835);
    spawnEnemy(1, 1990, 1830);
    spawnEnemy(1, 1705, 1830);
    spawnEnemy(1, 1325, 1700);
    spawnEnemy(1, 1300, 1595);
    spawnEnemy(1, 900, 1650);
    spawnEnemy(1, 580, 1830);
    spawnEnemy(1, 700, 1850);
    spawnEnemy(1, 300, 1680);
    spawnEnemy(1, 835, 690);
    spawnEnemy(1, 1030, 890);
    spawnEnemy(1, 2945, 610);
    spawnEnemy(1, 2955, 500);
    spawnEnemy(1, 4150, 710);
    spawnEnemy(1, 7185, 1870);
    spawnEnemy(1, 7110, 670);
    spawnEnemy(1, 7110, 850);
    spawnEnemy(1, 1980, 1590);
    spawnEnemy(1, 2090, 1590);
    spawnEnemy(1, 4590, 1860);   
    
    spawnGold(1625, 230);
    spawnGold(1900, 55);
    spawnGold(1625, 165);
    spawnGold(1540, 230);
    spawnGold(1540, 165);
    spawnGold(1305, 450);
    spawnGold(1235, 450);
    spawnGold(1165, 450);
    spawnGold(1670, 455);
    spawnGold(2730, 150);
    spawnGold(2830, 150);
    spawnGold(2930, 150);
    spawnGold(710, 1670);
    spawnGold(780, 1660);
    spawnGold(850, 1650);
    spawnGold(930, 1640);
    spawnGold(1585, 1210);
    spawnGold(1585, 1280);
    spawnGold(1585, 1350);
    spawnGold(1585, 1420);
    
    winSpot.x = 7530;
    winSpot.y = 1260;
    winSpot.w = 140;
    winSpot.h = 130;
}

function spawnEnemy(type, x, y) {
	// new enemy: imgsrc, width, height, x, y, hitpoints
	if (type == 1) {
		var e = new enemy("", 70, 70, "Orange", x, y, 5, type);
		allEnemies.push(e);
	}
}

function spawnGold(x, y) {
	var g = new gold(25, 25, "Gold", x, y)
	allGold.push(g);
}

// *********************************************************************************** //
// ****************************** END LEVEL GENERATION ******************************* //
// *********************************************************************************** //

// *********************************************************************************** //
// ******************************** START UPDATE GAME ******************************** //
// *********************************************************************************** //

var frameCount = 0;
var fpsInterval, startTime, now, then, elapsed;

var gameLoop = undefined;
var pauseLoop = undefined;

function pause() {
	if (gameArea.selection == 0 && gameArea.keys && gameArea.keys[key.enter] && keydown) {
		
		keydown = false;
		window.cancelAnimationFrame(pauseLoop);
		pauseLoop = undefined;
		gameLoop = requestAnimationFrame(updateGameArea);
	}
	else if (gameArea.selection == 1 && gameArea.keys && gameArea.keys[key.enter] && keydown) {
		window.cancelAnimationFrame(pauseLoop);
		pauseLoop = undefined;
		quitGame();		
	}
	else {
		renderPause();	
		requestAnimationFrame(pause);
	}
}

function quitGame() {
	// reset everything
	var canvas = document.getElementById("canvas");
	keydown = false;
	gameArea.keys = false;
	player = null;
	allPlatforms = [], inViewPlatforms = [], 
	allProjectiles = [], allEnemies = [], inViewEnemies = [], dyingEnemies = [],
	allCloudPlatforms = [], inViewCloudPlatforms = [],
	flyingFrames = 0, jumpingFrames = 0, landingFrames = 0, ouchingFrames = 0, dyingFrames = 0,
	gameArea.selection = 0;
	
	gameArea.mainMenuLoop = requestAnimationFrame(mainMenu);
}

function renderPause() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d"),
	x1 = camera.x1+225, y1 = camera.y1+248, x2 = 10, y2 = 10,
	selectors = ["Continue", "Quit"], MAX = 1;
	
	ctx.fillStyle = "black";
	ctx.fillRect(camera.x1+188, camera.y1 +100, 225, 300);
	
	ctx.fillStyle = "#fff49f";
	ctx.font = "bold 50px Arial";
	ctx.fillText("PAUSED", camera.x1+(canvas.width / 2) - 150, camera.y1+(canvas.height / 2) - 100);
	
	ctx.font = "30px Arial";
	
	ctx.fillText(selectors[0], camera.x1+250, camera.y1+262);
	ctx.fillText(selectors[1], camera.x1+250, camera.y1+312);
	
	// allow looping of selecting
	if (gameArea.keys && gameArea.keys[key.up]) {
		gameArea.keys = false;
		++gameArea.selection;
		if (gameArea.selection > MAX) {
			gameArea.selection = 0;
		}
	}
	if (gameArea.keys && gameArea.keys[key.down]) {
		gameArea.keys = false;
		--gameArea.selection;
		if (gameArea.selection < 0) {
			gameArea.selection = MAX;
		}
	}

	if (gameArea.selection == 0) {
		ctx.fillRect(x1, y1, x2, y2);
	}
	if (gameArea.selection == 1) {
		ctx.fillRect(x1, y1+50, x2, y2);
	}
}

var endType = "";
var endLoop = undefined;

function endScreen() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var endWords = "";
	
	if (endType === "win") {
		endWords = "YOU WIN!";
	}
	else {
		endWords = "YOU'RE DEAD!";
	}
	
	ctx.fillStyle = "black";
	ctx.fillRect(camera.x1, camera.y1, canvas.width, canvas.height);
	
	ctx.fillStyle = "#fff49f";
	ctx.font = "bold 50px Arial";
	ctx.fillText(endWords, camera.x1+(canvas.width / 2) - 150, camera.y1+(canvas.height / 2) - 100);
		
	ctx.font = "30px Arial";
	ctx.fillStyle = "#fff49f";
	ctx.fillText("Quit", camera.x1+250, camera.y1+262);
	
	// restart
	if (gameArea.keys && gameArea.keys[key.enter]) {
		gameArea.keys = false;
		window.cancelAnimationFrame(endLoop);
		endLoop = undefined;
		quitGame();
	}
	else {
		requestAnimationFrame(endScreen);
	}
}

function animatefps(fps) {
	fpsInterval = 1000/fps;
	then = Date.now();
	startTime = then;
	gameLoop = requestAnimationFrame(updateGameArea);
}

function updateGameArea() {
	now = Date.now();
	elapsed = now - then;
	
	// update camera's position
	camera.update();
	inCameraView();
	
	// update logic
	controls();
	player.updatePos();
	if (debug) document.getElementById("test10").innerHTML = "inViewEnemies: " + inViewEnemies.length;
		
	for (var i = 0; i < allProjectiles.length; ++i) {
		allProjectiles[i].updatePos();
		if (allProjectiles[i].shouldDie) {
			delete allProjectiles.splice(i, 1);
		}
	}
	
	for (var i = 0; i < inViewEnemies.length; ++i) {
		inViewEnemies[i].updatePos();
		if (inViewEnemies[i].state == enemyState.Dying) {
			dyingEnemies.push(inViewEnemies[i]);
			
			for (var j = 0; j < allEnemies.length; ++j) {
				if (inViewEnemies[i] === allEnemies[j]) {
					delete allEnemies.splice(j, 1);
					delete inViewEnemies.splice(i, 1);
					break;
				}
			}
		}
	}
		
	for (var i = 0; i < dyingEnemies.length; ++i) {
		dyingEnemies[i].updatePos();
		if (dyingEnemies[i].shouldDie) {
			delete dyingEnemies.splice(i, 1);
		}
	}
	
	for (var i = 0; i < inViewGold.length; ++i) {
		inViewGold[i].updatePos();
		if (inViewGold[i].shouldDie) {
			for (var j = 0; j < allGold.length; ++j) {
				if (inViewGold[i] === allGold[j]) {
					delete allGold.splice(j, 1);
					delete inViewGold.splice(i, 1);
					break;
				}
			}
		}
	}
	
	
	if (elapsed > fpsInterval) {
		then = now - (elapsed % fpsInterval);
		renderGameArea();
	}
	
	if (gameArea.keys && gameArea.keys[key.enter] && keydown) {
		keydown = false;
		window.cancelAnimationFrame(gameLoop);
		gameLoop = undefined;
		pauseLoop = requestAnimationFrame(pause);
	}
	else if (win()) {
		window.cancelAnimationFrame(gameLoop);
		gameLoop = undefined;
		endType = "win";
		endLoop = requestAnimationFrame(endScreen);		
	}
	else if (player.kill) {
		window.cancelAnimationFrame(gameLoop);
		gameLoop = undefined;
		endType = "lose";
		endLoop = requestAnimationFrame(endScreen);		
	}
	else {
		requestAnimationFrame(updateGameArea);
	}
}

function renderGameArea() {
	var ctx = gameArea.context;

	// render stuff
	ctx.setTransform(1,0,0,1,0,0);
	ctx.clearRect(0,0, gameArea.canvas.clientWidth, gameArea.canvas.clientHeight);
	ctx.translate(-camera.x1, -camera.y1);
	
	drawSky();
	drawLevel(player.x, player.y, camera.x2, camera.y2, "layerBack");
	drawLevel(player.x, player.y, camera.x2, camera.y2, "layerMid");
	
	for (var i = 0; i < inViewEnemies.length; ++i) {
		inViewEnemies[i].draw();
	}
	
	for (var i = 0; i < dyingEnemies.length; ++i) {
		dyingEnemies[i].draw();
	}
	
	for (var i = 0; i < allProjectiles.length; ++i) {
		allProjectiles[i].draw();
	}
	
	for (var i = 0; i < inViewGold.length; ++i) {
		inViewGold[i].draw();
	}
	
	player.draw();
	drawLevel(player.x, player.y, camera.x2, camera.y2, "layerFront");
	drawLevel(player.x, player.y, camera.x2, camera.y2, "ground-front");
	displayHUD();
}

function drawSky() {
	// can be based off of level
	var ctx = gameArea.context;
	
	var lin = ctx.createLinearGradient(0, camera.y1, 1, camera.y1+500);
	
	lin.addColorStop(0, "#efe2c0");
	lin.addColorStop(1, "#0b2834");
	
	ctx.fillStyle = lin;
	ctx.fillRect(camera.x1,camera.y1, camera.x2, camera.y2);
}

function drawLevel(x, y, width, height, type) {
	var ctx = gameArea.context, background = new Image();

	if (debug) document.getElementById("test1").innerHTML = "Collision triangles: " + inViewPlatforms.length + "/" + allPlatforms.length + 
	"<br>player.x: " + player.x + "<br>player.y: " + player.y;
	
	if (type == "layerMid") {background.src = bgImgs[bgImgIndex.LAYERMID].src;}
	if (type == "layerFront") {background.src = bgImgs[bgImgIndex.LAYERFRONT].src;}
	if (type == "layerBack") {
		background.src = bgImgs[bgImgIndex.LAYERBACK].src;
		ctx.drawImage(background, camera.x1>>3, (camera.y1>>2)-200, camera.x2, camera.y2, camera.x1, camera.y1, camera.x2, camera.y2);
		return;	
	}

	ctx.drawImage(background, camera.x1, camera.y1, camera.x2, camera.y2, camera.x1, camera.y1, camera.x2, camera.y2);
	
	// just to see collisions
	if (showCollision) {
		ctx.beginPath();
		for (i = 0; i < inViewPlatforms.length; ++i) {
			ctx.moveTo(inViewPlatforms[i].x1, inViewPlatforms[i].y1);
			ctx.lineTo(inViewPlatforms[i].x2, inViewPlatforms[i].y2);
			ctx.lineTo(inViewPlatforms[i].x3, inViewPlatforms[i].y3);	
		}
		ctx.fill();
	}
}

function displayHUD() {
	var ctx = gameArea.context;
	
	ctx.drawImage(uiImgs[2], 0, 40+(5-player.hitPoints)*5*2, 198*2, 201*2, camera.x1, camera.y1+20+(5-player.hitPoints)*5, 198, 201);	// heart's blood
	
	ctx.drawImage(uiImgs[3], 0, 0, 198*2, 201*2, camera.x1, camera.y1, 198, 201);	// fly red
	ctx.save();
	ctx.globalAlpha = (player.maxWingBeats - player.wingBeats)/5;
	ctx.drawImage(uiImgs[4], 0, 0, 198*2, 201*2, camera.x1, camera.y1, 198, 201);	// fly green
	ctx.restore();
	ctx.drawImage(uiImgs[1], 0, 0, 198*2, 201*2, camera.x1, camera.y1, 198, 201);	// hud	
	
	ctx.font = "Bold 20px Arial";
	ctx.fillStyle = "#f7e683";
	ctx.strokeStyle = "#000000";
	ctx.fillText("x" + player.collectedGold, camera.x1+135, camera.y1+20);
	ctx.strokeText("x" + player.collectedGold, camera.x1+135, camera.y1+20);
}

function win() {
	if (player.x >= winSpot.x && player.x <= winSpot.x + winSpot.w) {
		if (player.y >= winSpot.y && player.y <= winSpot.y + winSpot.h) {
			if (gameArea.keys && gameArea.keys[key.up]) {
				return true;
			}
		}
	}
	return false;
}

// *********************************************************************************** //
// ********************************** END UPDATE GAME ******************************** //
// *********************************************************************************** //

// *********************************************************************************** //
// ********************************** START SPRITE STUFF ***************************** //
// *********************************************************************************** //

function playerSprite(width, height, img, x, y) {
	this.image = new Image();
	this.image.src = img;
	this.colAdj = 20;
	this.faceRight = true;
	this.state = playerState.Idling;
	this.width = width-this.colAdj;
	this.height = height-this.colAdj;
	this.speedX = 0;
	this.x = x;
	this.y = y;
	
	this.accelY = worldGravity;
	this.speedY = 0;
	this.maxGravitySpeed = 15;
	this.maxFlySpeed = -10;
	this.maxWingBeats = 5;
	this.wingBeats = 0;
	
	this.accelInc = 0.4;
	this.accelDec = 0.5;
	this.accel = 0;
	this.maxAccel = 10;
	
	this.hitGround = false;
	this.hitPoints = 5;
	this.invincible = 0;
	this.invincibleFrames = 90;
	this.kill = false;
	
	this.collectedGold = 0;
	
	this.notCollidingY = 0;
	
	this.shootProjectile = function() {
		if (allProjectiles.length >= 5) {
			return;
		}
		var col = "Red"
			var fireBall;
			if (this.faceRight) {
			    fireBall = new projectile(20, 20, col, this.x + this.width/2, this.y - 20, true, true, this.faceRight, this.accel);
			}
			else {
			    fireBall = new projectile(20, 20, col, this.x - this.width/2, this.y - 20, true, true, this.faceRight, this.accel);
			}
	    allProjectiles.push(fireBall);
	}
	
	this.updatePos = function() {
		if ((this.speedY + this.accelY <= this.maxGravitySpeed &&
			this.speedY + this.accelY >= this.maxFlySpeed) || this.state == playerState.Ouching) {
			this.speedY += this.accelY;			
		}
		
		if (this.invincible > 0) {
			this.invincible--;
		}
		
		this.speedX = this.accel;			
		
		this.hitEdge();
		this.detectCollision();
		
		this.x += this.speedX;
		
		if (debug) document.getElementById("test11").innerHTML = "wingbeats: " + this.wingBeats;
		if (debug) document.getElementById("test7").innerHTML = "speed: " + player.speedX + ",<br> accel:  " + player.accel;
		if (debug) document.getElementById("test5").innerHTML = "speedY: " + this.speedY + ",<br> accelY: " + this.accelY;
	}
	
	this.frameIndex = 0;		// current frame to be displayed
	this.tickCount = 0;			// number of updates since current frame was first displayed
	this.ticksPerFrame = 1;		// number of updates until next frame should be displayed, FPS
	this.maxFrames = 35;
	this.stateChange = false;
	
	this.draw = function () {
		if (this.stateChange) {
			this.frameIndex = 0;
			this.stateChange = false;
		}
		
		switch (this.state) {
		case playerState.Idling:
			this.image.src = playerImgs[playerImgIndex.IDLE].src;
			this.maxFrames = 35;
			break;
		case playerState.Running:
			this.image.src = playerImgs[playerImgIndex.WALK].src;
			this.maxFrames = 27;
			break;
		case playerState.Flying:
			this.image.src = playerImgs[playerImgIndex.FLY].src;
			this.maxFrames = 8;
			break;
		case playerState.Gliding:
			this.image.src = playerImgs[playerImgIndex.GLIDE].src;
			this.maxFrames = 1;
			break;
		case playerState.Falling:
			this.image.src = playerImgs[playerImgIndex.IDLE].src;
			this.maxFrames = 35;
			break;
		case playerState.Jumping:
			this.image.src = playerImgs[playerImgIndex.IDLE].src;
			this.maxFrames = 35;
			break;
		case playerState.Ouching:
			this.image.src = playerImgs[playerImgIndex.IDLE].src;
			this.maxFrames = 35;
			break;
		}
		if (this.invincible == 0 || (this.invincible % 10 >= 0 && this.invincible % 10 < 5)) {
			if (player.state == playerState.Flying) {
				drawSprite(this, this.image, 100, 200, this.width, 160, this.maxFrames);
			}
			else {
				drawSprite(this, this.image, 100, 100, this.width, this.height, this.maxFrames);
			}			
		}
	}
	
	this.hitEdge = function () {
		if (this.y + this.speedY > levelLimitsy) {
			changeState(this, playerState.Dying);
			return;
		}
		if (this.y + this.speedY < -200) {
			changeState(this, playerState.Falling);
		}
		if (this.x + this.speedX > levelLimitsx || this.x + this.speedX < 0) {
			this.speedX = 0;
		}
	}
	
	this.detectCollision = function() {
		var slopeMax = 12;

		if (debug) document.getElementById("test4").innerHTML = "..";
		if (debug) document.getElementById("test3").innerHTML = "..";
		if (debug) document.getElementById("test5").innerHTML = "..";
		
		// if hit by enemy
		if (this.state != playerState.Ouching && this.invincible <= 0) {
			for (var i = 0; i < inViewEnemies.length; ++i) {
				if (collideObject(this.x, this.y + this.speedY, inViewEnemies[i], this.width, this.height) || 
					collideObject(this.x + this.speedX, this.y, inViewEnemies[i], this.width, this.height)) {
					--this.hitPoints;
					if (this.hitPoints > 0) {
						changeState(this, playerState.Ouching);
					}
					else {
						changeState(this, playerState.Dying);
					}			
				}
			}
		}
		
		// y collision
		for (var i = 0; i < inViewPlatforms.length; ++i) {	
			
			// check just y collision
			if (collide(this.x, this.y + this.speedY, inViewPlatforms[i], this.width, this.height)) {
				// check if player hit the ground instead of ceiling
				if (player.state != playerState.Gliding && player.state != playerState.Jumping && player.state != playerState.Flying) {
					this.hitGround = true;
				}
				else {
					this.hitGround = false;
				}
				this.notCollidingY = 0;
				
				if (inViewPlatforms[i].type == "ground") {
					this.speedY = 0;
					if (this.state == playerState.Gliding) {
						changeState(this, playerState.Falling);
					}
					if (debug) document.getElementById("test4").innerHTML = "y Ground Collision ";
				}
				else if (inViewPlatforms[i].type == "cloud") {
					if (this.accelY > 0) {
						this.accelY *= 0.5;
						this.speedY *= 0.5;
					}
					this.wingBeats = 0;
					if (this.state == playerState.Gliding) {
						changeState(this, playerState.Falling); // making it a different type of falling animation
					}
					if (debug) document.getElementById("test4").innerHTML = "y Cloud Collision ";
				}
				break;
			}
			// stop from falling at the speed of too fast, quick hacking fix
			++this.notCollidingY;
			if (this.notCollidingY > 450) this.notCollidingY = 450;
		}
		this.y += this.speedY;
		
		// x collision
		var prevThisY = this.y;
		for (var i = 0; i < inViewPlatforms.length; ++i) {
			// check if can move up slopes
			if (inViewPlatforms[i].type == "ground") {
				// slope up
				for (var n = 0; n <= slopeMax; ++n) {
					if (debug) document.getElementById("test12").innerHTML = "n: " + n;
					if (collide(this.x + this.speedX, this.y - n, inViewPlatforms[i], this.width, this.height)) {
						continue;
					}
					else if (!collide(this.x + this.speedX, this.y - n, inViewPlatforms[i], this.width, this.height)) {
						this.y -= n;
						if (prevThisY-this.y > 10) {
							if (this.accel < -5) {
								this.accel = -5;
							}
							else if (this.accel > 5) {
								this.accel = 5;
							}
						}
						
						break;
					}
				}
			}
			
			// check just x collision
			if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height)) {
				if (inViewPlatforms[i].type == "ground") {
					this.speedX = 0;
					this.accel = 0;
					if (this.state == playerState.Gliding) {
						changeState(this, playerState.Falling);
					}
					if (debug) document.getElementById("test3").innerHTML = "x Ground Collision";
					
				}
				else if (inViewPlatforms[i].type == "cloud") {
					this.speedX *= 0.75;
					if (this.state == playerState.Gliding) {
						changeState(this, playerState.Falling);
					}
					if (debug) document.getElementById("test3").innerHTML = "x Cloud Collision";
				}
				break;
			}		
		}
	}
}

function enemy(image, width, height, colour, x, y, hitPoints, type) {
	this.image = new Image();
	this.image.src = "";
	this.type = type;
	
	this.width = width;
	this.height = height;
	this.faceRight = false;
	
	this.speedX = 0;
	this.accelY = worldGravity;
	this.speedY = 0;
	
	this.x = x;
	this.y = y;
	
	this.state = enemyState.Idling;
	this.shouldDie = false;
	
	this.hitPoints = hitPoints;
	
	this.updatePos = function() {
		this.facePlayer();
		enemyUpdateStates(this);
		
		if (this.state != enemyState.Dying) {
			this.speedY += this.accelY;
			this.detectCollision();
		}
	}
	
	this.frameIndex = 0;		// current frame to be displayed
	this.tickCount = 0;			// number of updates since current frame was first displayed
	this.ticksPerFrame = 1;		// number of updates until next frame should be displayed, FPS
	this.maxFrames = 35;
	this.stateChange = false;
	
	this.attackFrames = 0;
	this.attackFramesMax = 50;
	this.dyingFrames = 0;
	this.dyingFramesMax = 50;
	
	this.draw = function () {
		var ctx = gameArea.context;
		if (this.stateChange) {
			this.frameIndex = 0;
			this.stateChange = false;
		}
		
		switch (this.state) {
		case enemyState.Idling:
			this.image.src = enemyImgs[enemyImgIndex.IDLE].src;
			this.maxFrames = 23;
			break;
		case enemyState.Attacking:
			this.image.src = enemyImgs[enemyImgIndex.IDLE].src;
			this.maxFrames = 23;
			break;
		case enemyState.Dying:
			this.image.src = enemyImgs[enemyImgIndex.IDLE].src;
			this.maxFrames = 23;
			break;
		}
		
		// make fade away when dying for now
		if (this.dyingFrames > 0) {
			ctx.save();
			ctx.globalAlpha = 1 - (this.dyingFrames/50);
		}
		drawSprite(this, this.image, 100, 100, this.width, this.height, this.maxFrames);
		
		if (this.dyingFrames > 0) {
			ctx.restore();
		}
	}
	
	this.facePlayer = function() {
		if (player.y+200 >= this.y && player.y-200 <= this.y) {
			if (player.x > this.x) {
				this.faceRight = false;
			}
			if (player.x < this.x) {
				this.faceRight = true;
			}
		}
	}
	
	this.detectCollision = function() {
		// check if it hit player
		//if (x y object width height)
		if (collideObject(this.x, this.y, player, this.width*1.5, this.height*1.5)) {
			changeState(this, enemyState.Attacking);
		}
		
		// check if it got shot
		for (var i = 0; i < allProjectiles.length; ++i) {
			// if the owner is true then it belongs to the player
			if (allProjectiles[i].owner && collideObject(this.x, this.y, allProjectiles[i], this.width, this.height)) {
				this.hitPoints--;
				allProjectiles[i].shouldDie = true;
				if (this.hitPoints <= 0) {
					changeState(this, enemyState.Dying);
				}
				break;
			}
		}
	}	
}

function projectile(width, height, colour, x, y, owner, bounces, direction, startingSpeed) {
	this.image = new Image();
	this.image.src = "";
	
	this.width = width;
	this.height = height;
	
	this.startingSpeed = startingSpeed;
	this.direction = direction;
	this.speedX = direction ? 10 + this.startingSpeed : -10 + this.startingSpeed;
	this.accelY = 1;
	this.speedY = -5;
	this.owner = owner;		// true if player's, false if enemy's
	this.bounces = bounces; // if it bounces or not, dies after x amount of bounces
	this.x = x;
	this.y = y;
	
	this.numBounce = 0;
	this.lifeSpan = 90;	// lives for how many frames
	this.shouldDie = false;
	this.dying = false;
	this.dyingFrames = 20;
	
	this.frameIndex = 0;		// current frame to be displayed
	this.tickCount = 0;			// number of updates since current frame was first displayed
	this.ticksPerFrame = 1;		// number of updates until next frame should be displayed, FPS
	this.maxFrames = 6;
	
	this.updatePos = function() {
		this.lifeSpan--;
		if (this.lifeSpan <= 0) {
			this.shouldDie = true;
			return;
		}
		
		this.speedY += this.accelY;
		
		this.detectCollision();
		if (this.numBounce > 10) {
			this.shouldDie = true;
		}
		
		this.x += this.speedX;
		this.y += this.speedY;
	}
	
	this.draw = function () {
		this.image.src = projectileImgs[projectileImgIndex.FIRE].src;
		this.maxFrames = 5;

		drawSprite(this, this.image, 50, 50, this.width, this.height, this.maxFrames);
	}
	
	this.detectCollision = function() {
		var slopeMax = 20, slopeFall = 0.1;
		
		// y collision
		for (i = 0; i < inViewPlatforms.length; ++i) {
			// check just y collision
			if (collide(this.x, this.y + this.speedY, inViewPlatforms[i], this.width, this.height) && inViewPlatforms[i].type == "ground") {				
				this.speedY *= -0.9;
				if (this.bounces) {
					//this.numBounce++;
				}
				break;
			}
		}
		
		// x collision
		for (i = 0; i < inViewPlatforms.length; ++i) {
			// bounce up slopes (later)
			for (j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y - j, inViewPlatforms[i], this.width, this.height) && inViewPlatforms[i].type == "ground") {
					this.speedY *= -0.9;
					break;
				}
			}
			
			// check just x collision
			if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height) && inViewPlatforms[i].type == "ground") {
				this.speedX *= -0.9;
				//this.numBounce++;
				break;
			}	
		}
	}
}

function gold(width, height, colour, x, y) {
	this.image = new Image();
	this.image.src = "";
	
	this.width = width;
	this.height = height;
	this.faceRight = true;
	this.x = x;
	this.y = y;
	
	this.shouldDie = false;
	
	this.frameIndex = 0;		// current frame to be displayed
	this.tickCount = 0;			// number of updates since current frame was first displayed
	this.ticksPerFrame = 3;		// number of updates until next frame should be displayed, FPS
	this.maxFrames = 11;
	
	this.updatePos = function() {
		if (this.shouldDie) {
			return;
		}
		this.detectCollision();
	}
	
	this.draw = function () {
		this.image.src = itemImgs[itemImgIndex.GOLD].src;

		drawSprite(this, this.image, 50, 50, this.width, this.height, this.maxFrames);
	}
	
	this.detectCollision = function() {
		// check if collected
		if (collideObject(this.x, this.y, player, this.width, this.height)) {
			this.shouldDie = true;
			++player.collectedGold;
		}
	}
}

function drawSprite(sprite, spriteImg, imgWidth, imgHeight, width, height, numFrames) {
	// thanks http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/ for moving sprites
	
	var	ctx = gameArea.context,
		colAdj = 20,						// adjust size for collision (smaller than image)
		w = sprite.x - (width+colAdj)/2,	// looking right Width
		w2 = -sprite.x - (width+colAdj)/2,	// looking left Width
		sx = sprite.frameIndex * imgWidth, 		// source x
		sy = 0,								// source y
		sw = imgWidth,						// frame width	(source)
		sh = imgHeight,						// frame height	(source)
		dx = w,								// destination x
		dx2 = w2;							// destination x facing left
		dy = sprite.y - (height+colAdj)/2,	// destination y
		dw = width+colAdj, 					// frame width (destination)
		dh = height+colAdj;					// frame height (destination)
	
	var sinceStart = now - startTime;
	var currentFps = Math.round(1000 / (sinceStart/frameCount));
	
	if (debug) document.getElementById("test9").innerHTML = currentFps;
	++sprite.tickCount;
	if (sprite.tickCount > sprite.ticksPerFrame) {
		sprite.tickCount = 0;
		++sprite.frameIndex;
	}
	
	if (sprite.frameIndex >= numFrames) {
		sprite.frameIndex = 1;
	}

	if (sprite.faceRight) {
		ctx.drawImage(spriteImg, sx, sy, sw, sh, dx, dy, dw, dh);
	} else {
		ctx.save();
		ctx.scale(-1, 1);
		ctx.drawImage(spriteImg, sx, sy, sw, sh, dx2, dy, dw, dh);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.restore();
	}
}

function enemyUpdateStates(enemy) {
	switch (enemy.state) {
	case enemyState.Idling:
		// reset all frames
		enemy.attackFrames = 0;
		break;
	case enemyState.Attacking:
		++enemy.attackFrames;
		if (enemy.attackFrames >= enemy.attackFramesMax) {
			enemy.state = enemyState.Idling;
			//changeState(this, enemyState.Idling);	// this isn't working, i am confused
		}
		break;
	case enemyState.Dying:
		++enemy.dyingFrames;
		if (enemy.dyingFrames >= enemy.dyingFramesMax) {
			enemy.shouldDie = true;
		}
	}
}

// *********************************************************************************** //
// *********************************** END SPRITE STUFF ****************************** //
// *********************************************************************************** //

function controls() {	
	// move left
	if (gameArea.keys && gameArea.keys[key.left]) {
		if (player.accel > 0) {
			player.accel -= player.accelInc * 3;
			// state = turning
		}
		else {
			player.accel -= player.accelInc; 
		}
		player.faceRight = false;
	}
	
	// move right
	if (gameArea.keys && gameArea.keys[key.right]) {
		if (player.accel < 0) {
			player.accel += player.accelInc * 3;
			// state = turning
		}
		else {
			player.accel += player.accelInc;
		}
		player.faceRight = true;
	}
	
	if (gameArea.keys && gameArea.keys[key.s] && shootKeydown) {
		player.shootProjectile(); 
		shootKeydown = false;
	}
	
	// slow down if player stopped pressing key
	if (gameArea.keys && !(gameArea.keys[key.left] || gameArea.keys[key.right])) {
		player.speedX *= 0.5;
		if (player.accel < 0) {
			if (player.state == playerState.Gliding || player.state == playerState.Flying) {
				player.accel += player.accelDec*0.2;
			} else if (player.state == playerState.Falling){
				player.accel += player.accelDec*0.5;
			} else {
				player.accel += player.accelDec;
			}
		}
		if (player.accel > 0) {
			if (player.state == playerState.Gliding || player.state == playerState.Flying) {
				player.accel -= player.accelDec*0.2;
			} else if (player.state == playerState.Falling){
				player.accel -= player.accelDec*0.5;
			} else {
				player.accel -= player.accelDec;
			}
		}
		if (player.accel > -player.accelDec && player.accel < player.accelDec) {
			player.accel = 0;
		}
	}
	
	// prevent player moving too fast
	if (player.accel > player.maxAccel) {
		player.accel = player.maxAccel;
	}
	if (player.accel < -player.maxAccel) {
		player.accel = -player.maxAccel;
	}
	
	updatePlayerStates();
}

function updatePlayerStates() {
	switch (player.state) {
	case playerState.Idling:
		if (gameArea.keys && gameArea.keys[key.a] && flyKeydown) {
			changeState(player, playerState.Jumping);
		}
		else if (gameArea.keys && (gameArea.keys[key.right] || gameArea.keys[key.left])) {
			changeState(player, playerState.Running);
		}
		else if (player.speedY >= 3) {
			changeState(player, playerState.Falling);
		}
		idling();
		break;
	case playerState.Running:
		running();
		if (gameArea.keys && gameArea.keys[key.a]) {
			changeState(player, playerState.Jumping);
		}
		if (gameArea.keys && !(gameArea.keys[key.right] || gameArea.keys[key.left])) {
			changeState(player, playerState.Idling);
		}
		break;
	case playerState.Jumping:
		if (gameArea.keys && gameArea.keys[key.a] && flyKeydown && jumpingFrames > 10) {
			changeState(player, playerState.Flying);
			jumpingFrames = 0;
			break;
		}
		jumping();
		break;
	case playerState.Flying:
		flying();
		break;
	case playerState.Gliding:
		gliding();
		if (gameArea.keys && gameArea.keys[key.a] && flyKeydown && player.wingBeats < player.maxWingBeats) {
			changeState(player, playerState.Flying);
		}
		if (gameArea.keys && gameArea.keys[key.down]) {
			changeState(player, playerState.Falling);
		}
		break;
	case playerState.Falling:
		if (gameArea.keys && gameArea.keys[key.a] && flyKeydown && player.wingBeats < player.maxWingBeats) {
			changeState(player, playerState.Flying);
		}
		falling();
		break;
	case playerState.Landing:
		if (gameArea.keys && gameArea.keys[key.a] && flyKeydown) {
			landingFrames = 0;
			changeState(player, playerState.Jumping);
		}
		landing();
		break;
	case playerState.Ouching:
		ouching();
		break;
	case playerState.Dying:
		dying();
		break;
	}
	if (debug) document.getElementById("test2").innerHTML = player.state + "<br>JumpingFrames: " + jumpingFrames;
}

function hitGround() {
	if (player.speedY == 0 && player.hitGround) {
		player.hitGround = false;
		player.accelY = 2;
		return true;
	}
	return false;
}

function dying() {
	dyingFrames++;
	if (dyingFrames <= 100) {
		player.speedX = 0;
		player.speedY = 0;
	}
	if (dyingFrames > 100) {
		player.kill = true;
	}
}

function idling() {
	player.accelY = worldGravity;
	player.wingBeats = 0;
	
}

function running() {
	player.accelY = 2;
	player.wingBeats = 0;
	if (player.notCollidingY > 20) {
		//changeState(player, playerState.Falling);
		player.state = playerState.Falling;
		player.accelY = 0;
		player.notCollidingY = 20;
	}
}

function falling() {
	if (player.accelY < 0) {
		player.accelY = 0;
	}
	player.accelY += 0.6;
	
	if (player.speedY == 0) {
		if (hitGround()) {
			//changeState(player, playerState.Landing);
			player.state = playerState.Landing;
		}
	}
}

function ouching() {
	ouchingFrames++;
	var owX = 3;
	
	if (ouchingFrames < 2) {
		player.speedY = -0.5;
		player.invincible = player.invincibleFrames;
	}
	if (ouchingFrames > 8) {
		ouchingFrames = 0;
		changeState(player, playerState.Landing);
	}
	if (player.faceRight) {
		player.accel -= owX;
	} else {
		player.accel += owX;
	}
}

function landing() {
	player.wingBeats = 0;
	landingFrames++;
	if (landingFrames > 1) {
		landingFrames = 0;
		//changeState(player, playerState.Idling);
		if (gameArea.keys && !(gameArea.keys[key.right] || gameArea.keys[key.left])) {
			player.state = playerState.Idling;
		}
		else {
			player.state = playerState.Running;
		}
		
	}
}

function gliding() {	
	if (player.accelY < 0) {
		player.accelY = 0;
	}
	if (player.accelY < 1) {
		player.accelY += 0.05;
	}	
}

function jumping() {
	flyKeydown = false;
	if (jumpingFrames == 0 && player.accelY > 0) {
		player.accelY = 0;
	}
	
	jumpingFrames++;
	if (jumpingFrames >= 20 || (!gameArea.keys || !gameArea.keys[key.a] && jumpingFrames > 10)) {
		player.accelY = 1;
		if (player.speedY >= 0) {
		changeState(player, playerState.Falling);
		jumpingFrames = 0;
		}
	}
	else {
		player.accelY -= 1;
		if (player.accelY < -6) {
			player.accelY = -6;
		}
	}
}

function flying() {
	if (gameArea.keys && gameArea.keys[key.a] && flyKeydown && player.wingBeats < player.maxWingBeats) {
		flyingFrames = 0;
		++player.wingBeats;
	}
	
	flyKeydown = false;
	flyingFrames++;
	if (flyingFrames >= 20 || (!gameArea.keys || !gameArea.keys[key.a] && flyingFrames > 10)) {
		changeState(player, playerState.Gliding);
		flyingFrames = 0;
	}
	else {
		player.accelY -= 1;
		if (player.accelY < -4) {
			player.accelY = -4;
		}
	}
}

function changeState(sprite, newState) {
	sprite.stateChange = true;
	sprite.state = newState;
}

function inCameraView() {		
	// radius larger for enemies and objects
	var radiusSqr = (gameArea.canvas.clientWidth * gameArea.canvas.clientWidth);
	radiusSqr = 500;
	inViewPlatforms = [];
	for (var i = allPlatforms.length - 1; i >= 0; --i) {
		if (collide(player.x, player.y, allPlatforms[i], radiusSqr, radiusSqr)) {
			inViewPlatforms.push(allPlatforms[i]);
		}
	}

	radiusSqr = 450000;
	inViewEnemies = [];
	for (var i = allEnemies.length - 1; i >= 0; --i) {
		cx1 = player.x - allEnemies[i].x;
		cy1 = player.y - allEnemies[i].y;
		
		c1Sqr = cx1*cx1 + cy1*cy1 - radiusSqr;
		
		// check if triangle vertex in circle
		if (c1Sqr <= 0) {
			inViewEnemies.push(allEnemies[i]);
		}
	}
	
	inViewGold = [];
	for (var i = allGold.length - 1; i >= 0; --i) {
		cx1 = player.x - allGold[i].x;
		cy1 = player.y - allGold[i].y;
		
		c1Sqr = cx1*cx1 + cy1*cy1 - radiusSqr;
		
		// check if triangle vertex in circle
		if (c1Sqr <= 0) {
			inViewGold.push(allGold[i]);
		}
	}
}

// circle vs circle
function collideObject(x, y, object, width, height) {
	var radius1 = (width + height) >> 2,
		radius2 = (object.width + object.height) >> 2,
		radius = radius1 + radius2,
		distance = Math.sqrt(((x - object.x) * (x - object.x)) + ((y - object.y) * (y - object.y)));
	
	if (distance < radius) {
		return true;
	}
	
	return false;
}

// circle vs triangle
function collide(x, y, platform, width, height) {	
	// using this: http://www.phatcode.net/articles.php?id=459
	var x1 = platform.x1,
		x2 = platform.x2,
		x3 = platform.x3,
		y1 = platform.y1,
		y2 = platform.y2,
		y3 = platform.y3,
		
		radius = (width + height) >> 2,	// width and height should be the same but um yup
		radiusSqr = radius*radius,
		cx1 = x - x1,
		cy1 = y - y1,
		cx2 = x - x2,
		cy2 = y - y2,
		cx3 = x - x3,
		cy3 = y - y3,
	
		c1Sqr = cx1*cx1 + cy1*cy1 - radiusSqr,
		c2Sqr = cx2*cx2 + cy2*cy2 - radiusSqr,
		c3Sqr = cx3*cx3 + cy3*cy3 - radiusSqr;
		
	// check if triangle vertex in circle
	if (c1Sqr <= 0)
		return true;
	if (c2Sqr <= 0)
		return true;
	if (c3Sqr <= 0)
		return true;
	
	// check if triangle edges in circle
	var ex1 = x2 - x1,
		ey1 = y2 - y1,
		ex2 = x3 - x2,
		ey2 = y3 - y2,
		ex3 = x1 - x3,
		ey3 = y1 - y3,	
		k = cx1*ex1 + cy1*ey1,
		len;
	
	if (k > 0) {
		len = ex1*ex1 + ey1*ey1;
		if (k < len) {
			if (c1Sqr * len <= k*k)
				return true;
		}
	}
	
	k = cx2*ex2 + cy2*ey2;
	if (k > 0) {
		len = ex2*ex2 + ey2*ey2;
		if (k < len) {
			if (c2Sqr * len <= k*k)
				return true;
		}
	}
	
	k = cx3*ex3 + cy3*ey3;
	if (k > 0) {
		len = ex3*ex3 + ey3*ey3;
		if (k < len) {
			if (c3Sqr * len <= k*k)
				return true;
		}
	}
	return false;
}


















