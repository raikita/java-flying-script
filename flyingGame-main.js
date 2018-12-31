
var player;
var allPlatforms = [];
var inView = [];
var debug = true;
var offsetX;
var showCollision = false;
var keydown = false;
var flyKeydown = false, shootKeydown = false;
var prevX = 0;
var prevY = 0;
var allProjectiles = [];

function scrollWrapper(x, y) {
	var wrapper = document.getElementById('wrapper');
	wrapper.scrollTop = y;
	wrapper.scrollLeft = x;
}

function startGame() {
    gameArea.start();
    player = new component(75, 75, "tempPlayer.png", 250, 600, "image");
    gameLevel0();
    inCameraView();
}

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
            gameArea.keys[e.keyCode] = (e.type == 'keydown');  
            keydown = false;
            flyKeydown = false;
            shootKeydown = false;
        });
    }
}

var camera = {
	draw : function() {
		var viewX = document.getElementById('wrapper').clientWidth;
		var viewY = document.getElementById('wrapper').clientHeight;
		var xPos = player.x;
		var yPos = player.y;
		ctx = gameArea.context;
		
		ctx.clearRect(xPos - viewX/2, yPos - viewY/2, viewX, viewY);

		scrollWrapper(xPos - viewX/2, yPos - viewY/2);
		drawLevel(xPos, yPos, viewX, viewY);
		
		player.draw();
		for (i = 0; i < allProjectiles.length; ++i) {
			allProjectiles[i].draw();
		}
	}
}

function updateGameArea() {
	var distance = 5;
	
	// update collision area
	if ((player.x > prevX + distance) || (player.x < prevX - distance) || 
			(player.y > prevY + distance) || (player.y < prevY - distance)) {
			prevX = player.x;
			prevY = player.y;
			inCameraView();
		}
	
	// update logic
	controls();
	player.updatePos();
	for (var i = 0; i < allProjectiles.length; ++i) {
		allProjectiles[i].updatePos();
		if (debug) document.getElementById("test10").innerHTML = "i: " + i;
		
	}
	
	// render stuff
	camera.draw();	
}

function inCameraView() {		
	var x = player.x, y = player.y, radius = 500, radiusSqr = radius*radius;
	
	inView = [];
	for (i = allPlatforms.length - 1; i >= 0; --i) {
		cx1 = x - allPlatforms[i].x1;
		cy1 = y - allPlatforms[i].y1;
		cx2 = x - allPlatforms[i].x2;
		cy2 = y - allPlatforms[i].y2;
		cx3 = x - allPlatforms[i].x3;
		cy3 = y - allPlatforms[i].y3;
		
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
}

function drawLevel(x, y, width, height) {
	ctx = gameArea.context;

	if (debug) document.getElementById("test1").innerHTML = inView.length + "/" + allPlatforms.length;
	// x y = top left
	// cw y = top right
	// x ch = bottom left
	// cw ch = bottom right
	var x = player.x - document.getElementById('wrapper').clientWidth/2,
		y = player.y - document.getElementById('wrapper').clientHeight/2,
		cw = x + document.getElementById('wrapper').clientWidth,
		ch = y + document.getElementById('wrapper').clientHeight;	
	
	if (y < 0) {
		y = 0;
	}
	if (y > document.getElementById('canvas').clientHeight - document.getElementById('wrapper').clientHeight) {
		y = document.getElementById('canvas').clientHeight - document.getElementById('wrapper').clientHeight;
	}
	if (ch < document.getElementById('wrapper').clientHeight) {
		ch = document.getElementById('wrapper').clientHeight;
	}
	if (ch > document.getElementById('canvas').clientHeight) {
		ch = document.getElementById('canvas').clientHeight;
	}
	if (x < 0) {
		x = 0;
	}
	if (cw < document.getElementById('wrapper').clientWidth) {
		cw = document.getElementById('wrapper').clientWidth;
	}
	if (x > document.getElementById('canvas').clientWidth - document.getElementById('wrapper').clientWidth) {
		x = document.getElementById('canvas').clientWidth - document.getElementById('wrapper').clientWidth;
	}
	if (cw > document.getElementById('canvas').clientWidth) {
		cw = document.getElementById('canvas').clientWidth;
	}

	var background = new Image();
	background.src = "level0Design.png";
	ctx.drawImage(background, x, y, cw, ch, x, y, cw, ch);
	
	// temporary, just to see collisions
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
    var background = new Image(),
    	lines,
    	platform, l1, l2, l3,
    	textFile,
    	allText;
    
    // temporary background for drawing level0
    background.src = "level0Design.png";
    background.onload = function() {
    	ctx = gameArea.context;
    	ctx.drawImage(background,0,0);
    }
    
    loadFile();	// change name of file depending on level, later	
}

function loadFile() {
	reader.open('get', 'level0.txt', true);
	reader.onreadystatechange = displayContents;
	reader.send(null);
}

function displayContents() {
	var i, lines, l1, l2, l3, platform;
	if (reader.readyState==4) {
		lines = reader.responseText.split("\n");
		for (i = 0; i < lines.length; i += 3) {
			l1 = lines[i].split(" ");
			l2 = lines[i+1].split(" ");
			l3 = lines[i+2].split(" ");

			platform = {x1:l1[0], y1:l1[1],
						x2:l2[0], y2:l2[1],
						x3:l3[0], y3:l3[1]};
			
			allPlatforms.push(platform);	
		}
	}
}

var playerState = {
	Falling:"falling",
	Idling:"idling",
	Running:"running",
	Flying:"flying",
	Gliding:"gliding",
	Jumping:"jumping",
	Landing:"landing",
	Dying:"dying"
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
	
	this.updatePos = function() {
		this.gravitySpeed += this.gravity;
		this.detectCollision();
		this.x += this.speedX;
		this.y += this.gravitySpeed;
	}
	
	this.draw = function () {
		ctx = gameArea.context;
		ctx.fillStyle = colour;
		ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
		if (debug) document.getElementById("test10").innerHTML = "direction: " + direction;
	}
	
	this.detectCollision = function() {
		var slopeMax = 5, slopeFall = 0.1;
		
		// y collision
		for (i = 0; i < inView.length; ++i) {
			// check just y collision
			if (collide(this.x, this.y + this.gravitySpeed, inView[i], this.width, this.height)) {				
				this.gravitySpeed *= -0.9;
				if (this.bounces) this.numBounce++;
				break;
			}
		}
		
		// x collision
		/*
		for (i = 0; i < inView.length; ++i) {
			// bounce up slopes (later)
			/*
			for (j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y - j, inView[i], this.width, this.height)) {
					break;
				}
			}
			*/
			
			// check just x collision
			/*
			if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height)) {
				// die on hit?
			}	
		}
		*/
	}
}

function component(width, height, colour, x, y, type) {
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
	this.maxGravitySpeed = 5;
	this.maxFlySpeed = -3;
	
	this.accelInc = 0.1;
	this.accelDec = 0.1;
	this.accel = 0;
	this.maxAccel = 6;
	
	this.hitGround = false;
	
	this.shootProjectile = function() {
		if (allProjectiles.length > 20) {
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

		//this.hitBottom();	// TODO: Make hitting bottom = DEATH
	}
	
	this.draw = function () {
		ctx = gameArea.context;
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
	
	this.hitBottom = function() {
		var bottom = gameArea.canvas.height - this.height;
		if (this.y > bottom) {
			this.y = bottom;
			this.gravitySpeed = 0;
		}
	}
	
	this.hitEdge = function () {
		if (this.y + this.gravitySpeed > gameArea.canvas.height || this.y + this.gravitySpeed < 0) {
			this.gravitySpeed = 0;
		}
		if (this.x + this.speedX > gameArea.canvas.width || this.x + this.speedX < 0) {
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
		for (i = 0; i < inView.length; ++i) {
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
		if (debug) document.getElementById("test5").innerHTML = "gravitySpeed: " + this.gravitySpeed + ", gravity: " + this.gravity;
		// x collision
		for (i = 0; i < inView.length; ++i) {
			// check slope collision up
			for (j = 1; j < slopeMax; ++j) {
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
			for (j = 1; j < slopeMax; ++j) {
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

var key = {
		down: 40,
		right: 39,
		left: 37,
		a: 65,
		s: 83
};


function controls() {
	// player movement
	player.speedX = 0;
	if (gameArea.keys && gameArea.keys[key.left]) {player.accel += -0.2; offsetX++; player.faceRight = false;}
	if (gameArea.keys && gameArea.keys[key.right]) {player.accel += 0.2; offsetX--; player.faceRight = true;}
	
	if (debug) document.getElementById("test8").innerHTML = "";
	if (gameArea.keys && gameArea.keys[key.s] && shootKeydown) {
		player.shootProjectile(); 
		shootKeydown = false;
		if (debug) document.getElementById("test8").innerHTML = "shot projectile #" + allProjectiles.length;
		
	}
	
	// slow down if player stopped pressing key
	if (gameArea.keys && !(gameArea.keys[key.left] && gameArea.keys[key.right])) {
		if (player.accel < 0) {
			player.accel += player.accelDec;
		}
		if (player.accel > 0) {
			player.accel -= player.accelDec;
		}
		if (player.accel > -player.accelDec && player.accel < player.accelDec) {
			player.accel = 0;
		}
	}
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
		if (!(gameArea.keys[key.right] || gameArea.keys[key.left])) {
			player.state = playerState.Idling;
		}

		break;
	case playerState.Jumping:
		jumping();
		break;
	case playerState.Flying:
		if (gameArea.keys[key.a] && flyKeydown) {
			flyingFrames = 0;
		}
		flying();
		break;
	case playerState.Gliding:
		gliding();
		if (gameArea.keys[key.a] && flyKeydown) {
			player.state = playerState.Flying;
		}
		if (gameArea.keys[key.down]) {
			player.state = playerState.Falling;
		}
		break;
	case playerState.Falling:
		player.gravity = 0.1;
		
		if (debug) document.getElementById("test6").innerHTML = "";
		if (gameArea.keys[key.a] && flyKeydown) {
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
		break;
	case playerState.Landing:
		landing();
		break;
	}
	if (debug) document.getElementById("test2").innerHTML = player.state;
	if (debug) document.getElementById("test7").innerHTML = "speed: " + player.speedX + ", accel: " + player.accel;
}

var flyingFrames = 0;
var jumpingFrames = 0;
var landingFrames = 0;

function hitGround() {
	if (player.gravitySpeed == 0 && player.hitGround) {
		player.hitGround = false;
		return true;
	}
	return false;
}

function landing() {
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
	flyKeydown = false;
	flyingFrames++;
	if (flyingFrames > 15) {
		player.state = playerState.Gliding;
		flyingFrames = 0;
	}
	else {
		player.gravity = -0.1;
		player.gravitySpeed = -1;
	}
}

function collide(x, y, platform, width, height) {	
	// using this: http://www.phatcode.net/articles.php?id=459
	x1 = platform.x1;
	x2 = platform.x2;
	x3 = platform.x3;
	y1 = platform.y1;
	y2 = platform.y2;
	y3 = platform.y3;
	
	radius = (width + height) / 4;	// width and height should be the same but um yup
	radiusSqr = radius*radius;
	cx1 = x - x1;
	cy1 = y - y1;
	cx2 = x - x2;
	cy2 = y - y2;
	cx3 = x - x3;
	cy3 = y - y3;
	
	c1Sqr = cx1*cx1 + cy1*cy1 - radiusSqr;
	c2Sqr = cx2*cx2 + cy2*cy2 - radiusSqr;
	c3Sqr = cx3*cx3 + cy3*cy3 - radiusSqr;
	
	// check if triangle vertex in circle
	if (c1Sqr <= 0)
		return true;
	if (c2Sqr <= 0)
		return true;
	if (c3Sqr <= 0)
		return true;
	
	// check if triangle edges in circle
	ex1 = x2 - x1;
	ey1 = y2 - y1;
	ex2 = x3 - x2;
	ey2 = y3 - y2;
	ex3 = x1 - x3;
	ey3 = y1 - y3;
	
	k = cx1*ex1 + cy1*ey1;
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


















