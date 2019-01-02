/*
 *  TODO: Show off iridescence: enter lit area, scales shine
 */


var player;
var allPlatforms = [], inView = [], allProjectiles = [], allEnemies = [], inViewEnemies = [];
var debug = false, showCollision = false;
var keydown = false, flyKeydown = false, shootKeydown = false;
var offsetX, prevX = 0, prevY = 0;
var flyingFrames = 0, jumpingFrames = 0, landingFrames = 0;

var playerState = {
		Falling:"falling",
		Idling:"idling",
		Running:"running",
		Flying:"flying",
		Gliding:"gliding",
		Jumping:"jumping",
		Landing:"landing",
		Dying:"dying"
};

var key = {
		down: 40,
		right: 39,
		left: 37,
		a: 65,
		s: 83
};

var camera = {
		x1 : 0,
		y1 : 0,
		x2 : document.getElementById('wrapper').clientWidth,
		y2 : document.getElementById('wrapper').clientHeight,
		update : function() {
			camera.x1 = player.x - document.getElementById('wrapper').clientWidth/2;
			camera.y1 = player.y - document.getElementById('wrapper').clientHeight/2;
			if (camera.x1 < 0) camera.x1 = 0;
			if (camera.y1 < 0) camera.y1 = 0;
			if (camera.x1 > 10000 - 700) camera.x1 = 10000 - 700;
			if (camera.y1 > 2000 - 525) camera.y1 = 2000 - 525;
			camera.x2 = camera.x1 + document.getElementById('wrapper').clientWidth;
			camera.y2 = camera.y2 + document.getElementById('wrapper').clientHeight;
		},
		draw : function() {
			var ctx = gameArea.context;

			ctx.setTransform(1,0,0,1,0,0);
			ctx.clearRect(0,0, 700, 525);
			ctx.translate(-camera.x1, -camera.y1);
			
			drawLevel(player.x, player.y, camera.x2, camera.y2);
			player.draw();
			for (i = 0; i < allProjectiles.length; ++i) {
				allProjectiles[i].draw();
			}
		}
};

var gameArea = {
	    canvas : document.getElementById('canvas'),
	    start : function() {
	        this.context = this.canvas.getContext("2d");
	        this.interval = setInterval(updateGameArea, 0.02);
	                
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
	    }
};

function startGame() {
    gameArea.start();
    player = new player(75, 75, "imgs/player/stand.png", 250, 500, "image");
    gameLevel0();
    inCameraView();
}

function drawLevel(x, y, width, height) {
	var ctx = gameArea.context, background = new Image();
	
	if (debug) document.getElementById("test1").innerHTML = "Collision triangles: " + inView.length + "/" + allPlatforms.length;
	
	background.src = "imgs/levels/level0.png";

	ctx.drawImage(background, camera.x1, camera.y1, camera.x2, camera.y2, camera.x1, camera.y1, camera.x2, camera.y2);
	
	// just to see collisions
	if (showCollision) {
		ctx.beginPath()
		for (i = 0; i < inView.length; ++i) {
				ctx.moveTo(inView[i].x1, inView[i].y1);
				ctx.lineTo(inView[i].x2, inView[i].y2);
				ctx.lineTo(inView[i].x3, inView[i].y3);
		}
		ctx.stroke();
	}
}

var reader = new XMLHttpRequest() || new ActiveXObect('MSXML2.XMLHTTP');

function gameLevel0() {
    var background = new Image();
    
    loadFile();	// change name of file depending on level, later
    
    spawnEnemy(1, 500, 1220);
    spawnEnemy(1, 700, 1220);
    spawnEnemy(1, 350, 1220);
}

function loadFile() {
	reader.open('get', 'level0.txt', true);
	reader.onreadystatechange = displayContents;
	reader.send(null);
}

function displayContents() {
	var i, lines, l1, l2, l3, platform;
	if (reader.readyState == 4) {
		lines = reader.responseText.split("\n");
		for (i = 0; i < lines.length; i += 3) {
			if (lines.length < i + 1) break;
			l1 = lines[i].split(" ");
			l2 = lines[i+1].split(" ");
			l3 = lines[i+2].split(" ");

			platform = {x1:Number(l1[0]), y1:Number(l1[1]),
						x2:Number(l2[0]), y2:Number(l2[1]),
						x3:Number(l3[0]), y3:Number(l3[1])};
			
			allPlatforms.push(platform);	
		}
	}
}

function updateGameArea() {
	var distance = 200;	// how far player must go before updating what's in camera's view for collisions
	
	// update camera's position
	camera.update();
	// update what's in or not in camera's view
	if ((player.x > prevX + distance) || (player.x < prevX - distance) || 
			(player.y > prevY + distance) || (player.y < prevY - distance)) {
			prevX = player.x;
			prevY = player.y;
			inCameraView();
	}
	
	// update logic
	controls();
	player.updatePos();
	if (debug) document.getElementById("test10").innerHTML = "projectile length: " + allProjectiles.length;
	for (var i = 0; i < allProjectiles.length; ++i) {
		allProjectiles[i].updatePos();
		if (allProjectiles[i].shouldDie) {
			delete allProjectiles.splice(i, 1);
		}
	}
	for (var i = 0; i < inViewEnemies.length; ++i) {
		inViewEnemies[i].updatePos();
		
		if (inViewEnemies[i].shouldDie) {
			for (var j = 0; j < allEnemies.length; ++j) {
				if (inViewEnemies[i] === allEnemies[j]) {
					delete allEnemies.splice(j, 1);
					delete inViewEnemies.splice(i, 1);
					break;
				}
			}
		}
	}
	
	// render stuff
	// camera.draw();
	ctx = gameArea.context;

	ctx.setTransform(1,0,0,1,0,0);
	ctx.clearRect(0,0, 700, 525);
	ctx.translate(-camera.x1, -camera.y1);
	
	drawLevel(player.x, player.y, camera.x2, camera.y2);
	
	for (var i = 0; i < inViewEnemies.length; ++i) {
		inViewEnemies[i].draw();
	}
	
	for (var i = 0; i < allProjectiles.length; ++i) {
		allProjectiles[i].draw();
	}
	player.draw();
	
}

function spawnEnemy(type, x, y) {
	if (type == 1) {
		var e = new enemy("", 70, 70, "Orange", x, y, 5);
		allEnemies.push(e);
	}
}

function enemy(image, width, height, colour, x, y, hitPoints) {
	this.image = new Image();
	this.image.src = "";
	
	this.width = width;
	this.height = height;
	
	this.speedX = 0;
	this.gravity = 0.1;
	this.gravitySpeed = 0;
	
	this.x = x;
	this.y = y;
	
	this.shouldDie = false;
	
	this.hitPoints = hitPoints;
	
	this.updatePos = function() {
		this.gravitySpeed += this.gravity;
		this.detectCollision();
	}
	
	this.draw = function () {
		var ctx = gameArea.context;
		ctx.fillStyle = colour;
		ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
	}
	
	this.detectCollision = function () {
		// check if it got shot
		for (var i = 0; i < allProjectiles.length; ++i) {
			// if the owner is true then it belongs to the player
			if (allProjectiles[i].owner && collideObject(this.x, this.y, allProjectiles[i], this.width, this.height)) {
				this.hitPoints--;
				allProjectiles[i].shouldDie = true;
				if (this.hitPoints <= 0) {
					this.shouldDie = true;
				}
				break;
			}
		}
	}
	
	// detect player?
	
	// shoot stuff?
	
}

function projectile(width, height, colour, x, y, owner, bounces, direction, startingSpeed) {
	this.image = new Image();
	this.image.src = "";
	
	this.width = width;
	this.height = height;
	
	this.startingSpeed = startingSpeed;
	this.direction = direction;
	this.speedX = direction ? 3 + this.startingSpeed : -3 + this.startingSpeed;
	this.gravity = 0.1;
	this.gravitySpeed = -2;
	this.owner = owner;		// true if player's, false if enemy's
	this.bounces = bounces; // if it bounces or not, dies after x amount of bounces
	this.x = x;
	this.y = y;
	
	this.numBounce = 0;
	this.lifeSpan = 180;	// lives for how many frames
	this.shouldDie = false;
	
	this.updatePos = function() {
		this.lifeSpan--;
		if (this.lifeSpan <= 0) {
			this.shouldDie = true;
			return;
		}
		
		this.gravitySpeed += this.gravity;
		
		this.detectCollision();
		if (this.numBounce > 10) {
			this.shouldDie = true;
		}
		
		this.x += this.speedX;
		this.y += this.gravitySpeed;
	}
	
	this.draw = function () {
		var ctx = gameArea.context;
		ctx.fillStyle = colour;
		ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
	}
	
	this.detectCollision = function() {
		var slopeMax = 5, slopeFall = 0.1;
		
		// y collision
		for (i = 0; i < inView.length; ++i) {
			// check just y collision
			if (collide(this.x, this.y + this.gravitySpeed, inView[i], this.width, this.height)) {				
				this.gravitySpeed *= -0.9;
				if (this.bounces) {
					this.numBounce++;
				}
				break;
			}
		}
		
		// x collision
		for (i = 0; i < inView.length; ++i) {
			// bounce up slopes (later)
			for (j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y - j, inView[i], this.width, this.height)) {
					this.gravitySpeed *= -0.9;
					break;
				}
			}
			
			// check just x collision
			if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height)) {
				this.speedX *= -0.7;
				this.numBounce++;
				break;
			}	
		}
	}
}

function player(width, height, colour, x, y, type) {
	this.type = type;
	if (type == "image") {
		this.image = new Image();
		this.image.src = colour;
	}
	
	this.faceRight = true;
	this.state = playerState.Idling;
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.x = x;
	this.y = y;
	
	this.gravity = 0.1;
	this.gravitySpeed = 0;
	this.maxGravitySpeed = 10;
	this.maxFlySpeed = -3;
	
	this.accelInc = 0.1;
	this.accelDec = 0.1;
	this.accel = 0;
	this.maxAccel = 6;
	
	this.hitGround = false;
	
	this.shootProjectile = function() {
		if (allProjectiles.length >= 5) {
			return;
		}
		var col = "Red"
	    var fireBall = new projectile(30, 30, col, this.x + this.width/2, this.y, true, true, this.faceRight, this.accel);
	    allProjectiles.push(fireBall);
	}
	
	this.updatePos = function() {
		if (this.gravitySpeed + this.gravity <= this.maxGravitySpeed &&
			this.gravitySpeed + this.gravity >= this.maxFlySpeed) {
			this.gravitySpeed += this.gravity;
		}
		this.speedX += this.accel;			
		this.detectCollision();
		this.hitEdge();
		this.y += this.gravitySpeed;
		this.x += this.speedX;
		
		if (debug) document.getElementById("test7").innerHTML = "speed: " + player.speedX + ",<br> accel:  " + player.accel;
		if (debug) document.getElementById("test5").innerHTML = "gravitySpeed: " + this.gravitySpeed + ",<br> gravity: " + this.gravity;
	}
	
	this.draw = function () {
		var ctx = gameArea.context;
		if (type == "image") {
			if (this.faceRight) {
				ctx.drawImage(this.image, this.x - this.width/2, this.y - this.height/2, this.width, this.height);
			} else {
				ctx.scale(-1, 1);
				ctx.drawImage(this.image, -this.x - this.width/2, this.y - this.height/2, this.width, this.height);
				ctx.setTransform(1, 0, 0, 1, 0, 0);
			}
		} else {
			ctx.fillStyle = colour;
			ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
		}
	}
	
	this.hitEdge = function () {
		if (this.y + this.gravitySpeed > 2000 || this.y + this.gravitySpeed < 0) {
			this.gravitySpeed = 0;
		}
		if (this.x + this.speedX > 10000 || this.x + this.speedX < 0) {
			this.speedX = 0;
		}
	}
	
	this.detectCollision = function() {
		var slopeMax = 5, slopeFall = 0.1;
		// slopeFall: The lower the number, the more steep cliff has to be to slide

		if (debug) document.getElementById("test4").innerHTML = "";
		if (debug) document.getElementById("test3").innerHTML = "";
		if (debug) document.getElementById("test5").innerHTML = "";
		
		// y collision
		
		for (var i = 0; i < inViewEnemies.length; ++i) {
			if (collideObject(this.x, this.y + this.gravitySpeed, inViewEnemies[i], this.width, this.height) || 
				collideObject(this.x + this.speedX, this.y, inViewEnemies[i], this.width, this.height)) {
				this.gravitySpeed = -1;
				this.speedX *= -1;
				this.accel *= -1;
				
			}
		}
		
		for (var i = 0; i < inView.length; ++i) {			
			// check just y collision
			if (collide(this.x, this.y + this.gravitySpeed, inView[i], this.width, this.height)) {
				// check if can slide down
				if (this.y + this.gravitySpeed > this.y) {
					if (!collide(this.x - slopeFall, this.y + this.gravitySpeed, inView[i], this.width, this.height)) {
						this.x -= slopeFall;
						break;
					}
					else if (!collide(this.x + slopeFall, this.y + this.gravitySpeed, inView[i], this.width, this.height)) {
						this.x += slopeFall;
						break;
					}
				}
				
				// check if player hit the ground instead of ceiling
				if (player.state != playerState.Gliding && player.state != playerState.Jumping && player.state != playerState.Flying) {
					this.hitGround = true;
				}
				else {
					this.hitGround = false;
				}
				
				if (this.state == playerState.Gliding) {
					this.state = playerState.Falling;
				}
				
				this.gravitySpeed = 0;
				if (debug) document.getElementById("test4").innerHTML = "y Collision ";
				break;
			}
		}
		// x collision
		for (var i = 0; i < inView.length; ++i) {
			// check slope collision up
			for (var j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y - j, inView[i], this.width, this.height)) {
					this.y -= j;
					if (debug) document.getElementById("test3").innerHTML = "slope Up ";
					if (this.state == playerState.Gliding) {
						this.state = playerState.Falling;
					}
					break;
				}
			}
			
			// check slope collision down
			for (var j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y + j, inView[i], this.width, this.height)) {
					this.y += j;
					if (debug) document.getElementById("test3").innerHTML = "slope Down ";
					if (this.state == playerState.Gliding) {
						this.state = playerState.Falling;
					}
					break;
				}
			}
			
			// check just x collision
			if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height)) {
				this.speedX *= -1;
				this.accel *= -0.1;
				if (this.state == playerState.Gliding) {
					this.state = playerState.Falling;
				}
				if (debug) document.getElementById("test3").innerHTML = "x Collision";
				break;
			}		
		}
	}
}



function controls() {
	// player movement
	player.speedX = 0;
	if (gameArea.keys && gameArea.keys[key.left]) {player.accel += -0.2; offsetX++; player.faceRight = false;}
	if (gameArea.keys && gameArea.keys[key.right]) {player.accel += 0.2; offsetX--; player.faceRight = true;}
	
	if (gameArea.keys && gameArea.keys[key.s] && shootKeydown) {
		player.shootProjectile(); 
		shootKeydown = false;
	}
	
	// slow down if player stopped pressing key
	if (gameArea.keys && !(gameArea.keys[key.left] && gameArea.keys[key.right])) {
		if (player.accel < 0) {
			if (player.state == playerState.Gliding || player.state == playerState.Flying) {
				player.accel += player.accelDec*0.1;
			} else if (player.state == playerState.Falling){
				player.accel += player.accelDec*0.5;
			} else {
				player.accel += player.accelDec;
			}
		}
		if (player.accel > 0) {
			
			if (player.state == playerState.Gliding || player.state == playerState.Flying) {
				player.accel -= player.accelDec*0.1;
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
	
	// movement
	switch (player.state) {
	case playerState.Idling:
		if (gameArea.keys && gameArea.keys[key.a] && flyKeydown) {
			player.state = playerState.Jumping;
		}
		else if (gameArea.keys && (gameArea.keys[key.right] || gameArea.keys[key.left])) {
			player.state = playerState.Running;
		}
		else if (player.gravitySpeed >= 3) {
			player.state = playerState.Falling;
		}
		break;
	case playerState.Running:
		if (player.gravitySpeed >= 3) {
			player.state = playerState.Falling;
		}
		if (gameArea.keys && gameArea.keys[key.a]) {
			player.state = playerState.Jumping;
		}
		if (gameArea.keys && !(gameArea.keys[key.right] || gameArea.keys[key.left])) {
			player.state = playerState.Idling;
		}

		break;
	case playerState.Jumping:
		jumping();
		break;
	case playerState.Flying:
		flying();
		break;
	case playerState.Gliding:
		gliding();
		break;
	case playerState.Falling:
		falling();
		break;
	case playerState.Landing:
		landing();
		break;
	}
	if (debug) document.getElementById("test2").innerHTML = player.state;	
}

function hitGround() {
	if (player.gravitySpeed == 0 && player.hitGround) {
		player.hitGround = false;
		return true;
	}
	return false;
}

function falling() {
	player.gravity = 0.1;
	if (debug) document.getElementById("test6").innerHTML = "";
	if (gameArea.keys && gameArea.keys[key.a] && flyKeydown) {
		player.state = playerState.Flying;
	}
	if (player.gravitySpeed == 0) {
		if (hitGround()) {
			if (debug) document.getElementById("test6").innerHTML = "GROUND WAS HIT";
			player.state = playerState.Landing;
		}
		else {
			player.state = playerState.Idling;
		}
	}
}

function landing() {
	if (gameArea.keys && gameArea.keys[key.a] && flyKeydown) {
		landingFrames = 0;
		player.state = playerState.Jumping;
	}
	landingFrames++;
	if (landingFrames > 30) {
		landingFrames = 0;
		player.state = playerState.Idling;
	}
}

function gliding() {
	if (player.gravity < 0.1) {
		player.gravity += 0.01;
	}
	if (player.gravitySpeed > 1) {
		player.gravitySpeed -= 0.1;
	}
	if (player.gravitySpeed < 1) {
		player.gravitySpeed += 0.1;
	}
	if (gameArea.keys && gameArea.keys[key.a] && flyKeydown) {
		player.state = playerState.Flying;
	}
	if (gameArea.keys && gameArea.keys[key.down]) {
		player.state = playerState.Falling;
	}
}

function jumping() {
	flyKeydown = false;
	jumpingFrames++;
	if (jumpingFrames > 30) {
		player.state = playerState.Falling;
		jumpingFrames = 0;
	}
	else {
		player.gravity = -0.1;
		player.gravitySpeed = -3;
	}
}

function flying() {
	if (gameArea.keys && gameArea.keys[key.a] && flyKeydown) {
		flyingFrames = 0;
	}
	
	flyKeydown = false;
	flyingFrames++;
	if (flyingFrames > 30) {
		player.state = playerState.Gliding;
		flyingFrames = 0;
	}
	else {
		player.gravity = -0.1;
		player.gravitySpeed = -2;
	}
}

function inCameraView() {		
	var radiusSqr = 500 * 500;
	
	inView = [];	// clear array, splicing doesn't seem to work very well? 
	for (var i = allPlatforms.length - 1; i >= 0; --i) {
		cx1 = player.x - allPlatforms[i].x1;
		cy1 = player.y - allPlatforms[i].y1;
		cx2 = player.x - allPlatforms[i].x2;
		cy2 = player.y - allPlatforms[i].y2;
		cx3 = player.x - allPlatforms[i].x3;
		cy3 = player.y - allPlatforms[i].y3;
		
		c1Sqr = cx1*cx1 + cy1*cy1 - radiusSqr;
		c2Sqr = cx2*cx2 + cy2*cy2 - radiusSqr;
		c3Sqr = cx3*cx3 + cy3*cy3 - radiusSqr;
		
		// check if triangle vertex in circle
		if (c1Sqr <= 0) {
			inView.push(allPlatforms[i]);
		}
		else if (c2Sqr <= 0) {
			inView.push(allPlatforms[i]);
		}
		else if (c3Sqr <= 0){
			inView.push(allPlatforms[i]);
		}
	}
	
	radiusSqr = 700 * 700;
	inViewEnemies = [];	// clear array, splicing doesn't seem to work very well? 
	for (var i = allEnemies.length - 1; i >= 0; --i) {
		cx1 = player.x - allEnemies[i].x;
		cy1 = player.y - allEnemies[i].y;
		
		c1Sqr = cx1*cx1 + cy1*cy1 - radiusSqr;
		
		// check if triangle vertex in circle
		if (c1Sqr <= 0) {
			inViewEnemies.push(allEnemies[i]);
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


















