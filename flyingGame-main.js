/*
 *  TODO: Show off iridescence: enter lit area, scales shine
 *  TODO: Level Design
 *  TODO: 2 more types of enemies: moving and shooting if seen, moving only
 *  TODO: Animations
 *  TODO: Start screen
 *  TODO: Cloud collision, slow movement slightly
 *  TODO: Sliding state: when x is moving but key not pressed
 *  
 */


var player;
var platformType = "";
var allPlatforms = [], inViewPlatforms = [], 
	allProjectiles = [], 
	allEnemies = [], inViewEnemies = [], 
	allCloudPlatforms = [], inViewCloudPlatforms = [];
var debug = false, showCollision = false;
var keydown = false, flyKeydown = false, shootKeydown = false;
var offsetX, prevX = 0, prevY = 0;
var flyingFrames = 0, jumpingFrames = 0, landingFrames = 0, ouchingFrames = 0;
var levelLimitsx, levelLimitsy, playerStartx, playerStarty;

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
		x2 : document.getElementById('canvas').clientWidth,
		y2 : document.getElementById('canvas').clientHeight,
		update : function() {
			camera.x1 = player.x - document.getElementById('canvas').clientWidth/2;
			camera.y1 = player.y - document.getElementById('canvas').clientHeight/2;
			if (camera.x1 < 0) camera.x1 = 0;
			if (camera.y1 < 0) camera.y1 = 0;
			if (camera.x1 > levelLimitsx - document.getElementById('canvas').clientWidth) {
				camera.x1 = levelLimitsx - document.getElementById('canvas').clientWidth;
			}
			if (camera.y1 > levelLimitsy - document.getElementById('canvas').clientHeight) {
				camera.y1 = levelLimitsy - document.getElementById('canvas').clientHeight;
			}
			camera.x2 = camera.x1 + document.getElementById('canvas').clientWidth;
			camera.y2 = camera.y2 + document.getElementById('canvas').clientHeight;
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
    gameLevel1();
    player = new player(75, 75, "imgs/player/stand.png", playerStartx, playerStarty, "image");
    inCameraView();
}

function drawLevel(x, y, width, height) {
	var ctx = gameArea.context, background = new Image();

	if (debug) document.getElementById("test1").innerHTML = "Collision triangles: " + inViewPlatforms.length + "/" + allPlatforms.length + 
	"<br>player.x: " + player.x + "<br>player.y: " + player.y;
	
	background.src = "imgs/levels/level1.png";

	ctx.drawImage(background, camera.x1, camera.y1, camera.x2, camera.y2, camera.x1, camera.y1, camera.x2, camera.y2);
	
	// just to see collisions
	if (showCollision) {
		ctx.beginPath()
		for (i = 0; i < inViewPlatforms.length; ++i) {
				ctx.moveTo(inViewPlatforms[i].x1, inViewPlatforms[i].y1);
				ctx.lineTo(inViewPlatforms[i].x2, inViewPlatforms[i].y2);
				ctx.lineTo(inViewPlatforms[i].x3, inViewPlatforms[i].y3);
		}
		ctx.fill();
	}
}


var files;

function gameLevel1() {
    var background = new Image();
    levelLimitsx = 8192, levelLimitsy = 2048;
    playerStartx = 190, playerStarty = 356;
    platformType = "ground";
    
    files = ['level1-ground.txt',
    		 'level1-clouds.txt'];
    
    loadFile();
    
    spawnEnemy(1, 500, 1220);
    spawnEnemy(1, 700, 1220);
    spawnEnemy(1, 350, 1220);
}

function loadFile() {
	var requests = new Array (files.length);
	for (let j = 0; j < files.length; ++j) {
		requests[j] = new XMLHttpRequest();
		requests[j].open('get', files[j], true);
		
		var i, lines, l1, l2, l3, platform;

		requests[j].onload = function() {
			lines = requests[j].responseText.split("\n");
			for (var i = 0; i < lines.length; i += 3) {
				l1 = lines[i].split(" ");
				l2 = lines[i+1].split(" ");
				l3 = lines[i+2].split(" ");

				platform = {x1:Number(l1[0]), y1:Number(l1[1]),
							x2:Number(l2[0]), y2:Number(l2[1]),
							x3:Number(l3[0]), y3:Number(l3[1])};
				if (j == 0) allPlatforms.push(platform);
				if (j == 1) allCloudPlatforms.push(platform);
			}
		}
		requests[j].send(null);
	}
}

function updateGameArea() {
	// first check if dead
	if (player.state == playerState.Dying) {
		// temporary death screen
		var ctx = gameArea.context;
		ctx.fillStyle = "Black";
		ctx.fillRect(camera.x1, camera.y1, camera.x2, camera.y2);
		return;
	}
	
	var distance = 0;	// how far player must go before updating what's in camera's view for collisions
	
	// update camera's position
	camera.update();
	inCameraView();
	
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
	var ctx = gameArea.context;

	ctx.setTransform(1,0,0,1,0,0);
	ctx.clearRect(0,0, document.getElementById('canvas').clientWidth, document.getElementById('canvas').clientHeight);
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
		for (i = 0; i < inViewPlatforms.length; ++i) {
			// check just y collision
			if (collide(this.x, this.y + this.gravitySpeed, inViewPlatforms[i], this.width, this.height)) {				
				this.gravitySpeed *= -0.9;
				if (this.bounces) {
					this.numBounce++;
				}
				break;
			}
		}
		
		// x collision
		for (i = 0; i < inViewPlatforms.length; ++i) {
			// bounce up slopes (later)
			for (j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y - j, inViewPlatforms[i], this.width, this.height)) {
					this.gravitySpeed *= -0.9;
					break;
				}
			}
			
			// check just x collision
			if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height)) {
				this.speedX *= -0.3;
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
	this.hitPoints = 20;
	this.invincible = 0;
	this.invincibleFrames = 180;
	
	this.slope = 0; // 0 = no slope, 1 = slope up, 2 = slope down
	this.slopeAngle = 0;
	
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
		
		if (this.invincible > 0) {
			this.invincible--;
		}
		
		this.speedX += this.accel;			
		
		this.hitEdge();
		this.detectCollision();
		//this.y += this.gravitySpeed;
		this.x += this.speedX;
		
		if (debug) document.getElementById("test7").innerHTML = "speed: " + player.speedX + ",<br> accel:  " + player.accel;
		if (debug) document.getElementById("test5").innerHTML = "gravitySpeed: " + this.gravitySpeed + ",<br> gravity: " + this.gravity;
	}
	
	this.draw = function () {
		var ctx = gameArea.context;
		if (this.slope > 0) {
			ctx.save();
			ctx.translate(this.x, this.y);
			if (this.slope == 1) ctx.rotate((this.faceRight ? -1 : 1) * this.slopeAngle * Math.PI / 180);
			if (this.slope == 2) ctx.rotate((this.faceRight ? 1 : -1) * this.slopeAngle * Math.PI / 180);
			ctx.translate(-this.x, -this.y)
		}
		
		if (type == "image") {
			if (this.invincible == 0 || (this.invincible % 10 >= 0 && this.invincible % 10 < 5)) {
				if (this.faceRight) {
					ctx.drawImage(this.image, this.x - this.width/2, this.y - this.height/2, this.width, this.height);
				} else {
					ctx.scale(-1, 1);
					ctx.drawImage(this.image, -this.x - this.width/2, this.y - this.height/2, this.width, this.height);
					ctx.setTransform(1, 0, 0, 1, 0, 0);
				}
			}
		} else {
			ctx.fillStyle = colour;
			ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
		}
		if (this.slope > 0) {
			ctx.restore();
		}
	}
	
	this.hitEdge = function () {
		if (this.y + this.gravitySpeed > levelLimitsy) {
			this.state = playerState.Dying;
			return;
		}
		if (this.y + this.gravitySpeed < 0) {
			this.gravitySpeed = 0;
		}
		if (this.x + this.speedX > levelLimitsx || this.x + this.speedX < 0) {
			this.speedX = 0;
		}
	}
	
	
	this.detectCollision = function() {
		var slopeMax = 5, slopeFall = 0.09;
		this.slopeAngle = 0;
		// slopeFall: The lower the number, the more steep cliff has to be to slide
		this.slope = 0;

		if (debug) document.getElementById("test4").innerHTML = "..";
		if (debug) document.getElementById("test3").innerHTML = "..";
		if (debug) document.getElementById("test5").innerHTML = "..";
		
		// if hit by enemy
		if (this.state != playerState.Ouching && this.invincible <= 0) {
			for (var i = 0; i < inViewEnemies.length; ++i) {
				if (collideObject(this.x, this.y + this.gravitySpeed, inViewEnemies[i], this.width, this.height) || 
					collideObject(this.x + this.speedX, this.y, inViewEnemies[i], this.width, this.height)) {
					--this.hitPoints;
					if (this.hitPoints > 0) {
						this.state = playerState.Ouching;
					}
					else {
						this.state = playerState.Dying;
					}
								
				}
			}
		}
		
		// y collision
		for (var i = 0; i < inViewPlatforms.length; ++i) {			
			// check just y collision
			if (collide(this.x, this.y + this.gravitySpeed, inViewPlatforms[i], this.width, this.height)) {
				
				// check if can slide down
				if (this.y + this.gravitySpeed > this.y) {
					if (!collide(this.x - slopeFall, this.y + this.gravitySpeed*2, inViewPlatforms[i], this.width, this.height)) {
						this.x -= slopeFall;
						this.y += this.gravitySpeed*2;
						break;
					}
					else if (!collide(this.x + slopeFall, this.y + this.gravitySpeed*2, inViewPlatforms[i], this.width, this.height)) {
						this.x += slopeFall;
						this.y += this.gravitySpeed*2;
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
		this.y += this.gravitySpeed;
		
		
		// x collision
		for (var i = 0; i < inViewPlatforms.length; ++i) {
			// check slope collision up
			if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height) &&
				collide(this.x + this.speedX, this.y - 1, inViewPlatforms[i], this.width, this.height)&&
				collide(this.x + this.speedX, this.y - 2, inViewPlatforms[i], this.width, this.height)&&
				collide(this.x + this.speedX, this.y - 3, inViewPlatforms[i], this.width, this.height)&&
				!collide(this.x + this.speedX, this.y - 4, inViewPlatforms[i], this.width, this.height)) {
				this.y -= 4;
				this.slope = 1;
				this.slopeAngle = 40;
				if (debug) document.getElementById("test3").innerHTML = "slope Up 3";
				if (this.state == playerState.Gliding) {
					this.state = playerState.Falling;
				}
			}
			else if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height) &&
				collide(this.x + this.speedX, this.y - 1, inViewPlatforms[i], this.width, this.height)&&
				collide(this.x + this.speedX, this.y - 2, inViewPlatforms[i], this.width, this.height)&&
				!collide(this.x + this.speedX, this.y - 3, inViewPlatforms[i], this.width, this.height)) {
				this.y -= 3;
				this.slope = 1;
				this.slopeAngle = 30;
				if (debug) document.getElementById("test3").innerHTML = "slope Up 3";
				if (this.state == playerState.Gliding) {
					this.state = playerState.Falling;
				}
			}
			else if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height) &&
				collide(this.x + this.speedX, this.y - 1, inViewPlatforms[i], this.width, this.height)&&
				!collide(this.x + this.speedX, this.y - 2, inViewPlatforms[i], this.width, this.height)) {
				this.y -= 2;
				this.slope = 1;
				this.slopeAngle = 20;
				if (debug) document.getElementById("test3").innerHTML = "slope Up 2";
				if (this.state == playerState.Gliding) {
					this.state = playerState.Falling;
				}
			}
			else if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height) &&
				!collide(this.x + this.speedX, this.y - 1, inViewPlatforms[i], this.width, this.height)) {
				--this.y;
				this.slope = 1;
				this.slopeAngle = 10;
				if (debug) document.getElementById("test3").innerHTML = "slope Up 1";
				if (this.state == playerState.Gliding) {
					this.state = playerState.Falling;
				}
			}
			
			// check just x collision
			if (collide(this.x + this.speedX, this.y, inViewPlatforms[i], this.width, this.height)) {
				this.speedX *= -1;
				this.accel = 0;
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
	
	// movement
	switch (player.state) {
	case playerState.Idling:
		idling();
		break;
	case playerState.Running:
		running();
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
	case playerState.Ouching:
		ouching();
		break;
	case playerState.Dying:
		// idk you ded
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

function idling() {
	if (gameArea.keys && gameArea.keys[key.a] && flyKeydown) {
		player.state = playerState.Jumping;
	}
	else if (gameArea.keys && (gameArea.keys[key.right] || gameArea.keys[key.left])) {
		player.state = playerState.Running;
	}
	else if (player.gravitySpeed >= 3) {
		player.state = playerState.Falling;
	}
}

function running() {
	if (player.gravitySpeed >= 3) {
		player.state = playerState.Falling;
	}
	if (gameArea.keys && gameArea.keys[key.a]) {
		player.state = playerState.Jumping;
	}
	if (gameArea.keys && !(gameArea.keys[key.right] || gameArea.keys[key.left])) {
		player.state = playerState.Idling;
	}
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

function ouching() {
	ouchingFrames++;
	player.speedX = 0;
	player.accel = 0;
	
	if (ouchingFrames == 1) {
		player.gravitySpeed = -3;
		player.gravity = 0.1;
		player.invincible = player.invincibleFrames;
	}
	if (ouchingFrames >= 100) {
		ouchingFrames = 0;
		player.state = playerState.Landing;
	}
	if (player.faceRight) {
		player.speedX--;
	} else {
		player.speedX++;
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
	// radius larger for enemies and objects
	var radiusSqr = (document.getElementById('canvas').clientWidth * document.getElementById('canvas').clientWidth) << 1;
	
	inViewPlatforms = [];
	for (var i = allPlatforms.length - 1; i >= 0; --i) {
		if (collide(player.x, player.y, allPlatforms[i], document.getElementById('canvas').clientWidth, document.getElementById('canvas').clientWidth)) {
			inViewPlatforms.push(allPlatforms[i]);
		}
	}

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


















