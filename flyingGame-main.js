
var player;
var allPlatforms = [];
var debug = true;
var offsetX;

function scrollWrapper(x, y) {
	var wrapper = document.getElementById('wrapper');
	wrapper.scrollTop = y;
	wrapper.scrollLeft = x;
}

// game area
function startGame() {
    gameArea.start();
    player = new component(30, 30, "tempPlayer.png", 100, 10, "image");
    gameLevel0();
}

var gameArea = {
    canvas : document.getElementById('canvas'),
    start : function() {
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 0.02);
                
        // keyboard controls
        window.addEventListener('keydown', function (e) {
            gameArea.keys = (gameArea.keys || []);
            gameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            gameArea.keys[e.keyCode] = (e.type == "keydown");            
        })
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
	}
}

function updateGameArea() {
	// update logic
	controls();
	player.updatePos();
	
	// render stuff
	camera.draw();
}

function insideCamera(x, y, width, height, p) {
	if (((p.x1 >= x && p.x1 <= x + width) && (p.y1 >= y && p.y1 <= y + height)) ||
		((p.x2 >= x && p.x2 <= x + width) && (p.y2 >= y && p.y2 <= y + height)) ||
		((p.x3 >= x && p.x3 <= x + width) && (p.y3 >= y && p.y3 <= y + height))) { 
		return true;
	} else {
		return false;
	}
}

function drawLevel(x, y, width, height) {
	ctx = gameArea.context;
	ctx.beginPath();

	for (i = 0; i < allPlatforms.length; ++i) {
		//if (collide(x, y, allPlatforms[i], width, height)) {	// if "collide".. if area in viewport
		if (true) {
			ctx.moveTo(allPlatforms[i].x1, allPlatforms[i].y1);
			ctx.lineTo(allPlatforms[i].x2, allPlatforms[i].y2);
			ctx.lineTo(allPlatforms[i].x3, allPlatforms[i].y3);
		}	
	}
	ctx.fill();
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

function component(width, height, colour, x, y, type) {
	this.type = type;
	if (type == "image") {
		this.image = new Image();
		this.image.src = colour;
	}
	
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;
	this.x = x;
	this.y = y;
	
	this.gravity = 0.1;
	this.gravitySpeed = 0;
	this.maxGravitySpeed = 5;
	this.maxFlySpeed = -3;
	
	this.accelInc = 0.05;
	this.accel = this.accelInc;
	this.maxAccel = 2;
	
	this.updatePos = function() {
		if (this.gravitySpeed + this.gravity <= this.maxGravitySpeed &&
			this.gravitySpeed + this.gravity >= this.maxFlySpeed) {
			this.gravitySpeed += this.gravity;
		}
		this.speedX += this.accel;			
		this.detectCollision();
		//this.hitEdge();
		this.y += this.gravitySpeed;
		this.x += this.speedX;

		this.hitBottom();	// TODO: Make hitting bottom = DEATH
	}
	
	this.draw = function () {
		ctx = gameArea.context;
		if (debug) {
			ctx = gameArea.context;
			ctx.font = "30px Arial";
			ctx.fillStyle = '#000000';
			ctx.fillText("height: " + (this.y), 10, 150);
		}
		
		if (type == "image") {
			ctx.drawImage(this.image, this.x - this.width/2, this.y - this.height/2, this.width, this.height);
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
		var slopeMax = 5;
		
		if (debug) {
			ctx = gameArea.context;
			ctx.font = "30px Arial";
		}
		
		// y collision
		for (i = 0; i < allPlatforms.length; ++i) {		
			// check just y collision
			if (collide(this.x, this.y + this.gravitySpeed, allPlatforms[i], this.width, this.height)) {
				if (debug) {
					ctx.fillStyle = '#000000';
					ctx.fillText("COLLISION DETECTED Y " + Math.floor(this.y), 10, 50);
				}
				
				// check if can slide down
				if (!collide(this.x - 0.5, this.y + this.gravitySpeed, allPlatforms[i], this.width, this.height)) {
					this.x -= 0.5;
				}
				else if (!collide(this.x + 0.5, this.y + this.gravitySpeed, allPlatforms[i], this.width, this.height)) {
					this.x += 0.5;
				}
				else				
					this.gravitySpeed = 0;
				break;
			}
		}
		
		// x collision
		for (i = 0; i < allPlatforms.length; ++i) {
			// check slope collision up
			for (j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, allPlatforms[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y - j, allPlatforms[i], this.width, this.height)) {
					this.y -= j;
					break;
				}
			}
			
			// check slope collision down
			for (j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, allPlatforms[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y + j, allPlatforms[i], this.width, this.height)) {
					this.y += j;
					break;
				}
			}
			
			// check just x collision
			if (collide(this.x + this.speedX, this.y, allPlatforms[i], this.width, this.height)) {
				if (debug) {
					ctx.fillStyle = '#000000';
					ctx.fillText("COLLISION DETECTED X " + Math.floor(this.x), 10, 100);
				}
				this.speedX = 0;
				this.accel = 0;
				break;
			}		
		}
	}
}

function controls() {
	// player movement
	player.speedX = 0;
	player.speedY = 0;
	if (gameArea.keys && gameArea.keys[37]) {player.accel += -1; offsetX++;}
	if (gameArea.keys && gameArea.keys[39]) {player.accel += 1; offsetX--;}
	
	if (gameArea.keys && !(gameArea.keys[37] && gameArea.keys[39])) {
		if (player.accel < 0) {
			player.accel += player.accelInc;
		}
		if (player.accel > 0) {
			player.accel -= player.accelInc;
		}
		if (player.accel > -player.accelInc && player.accel < player.accelInc) {
			player.accel = 0;
		}
	}
	if (player.accel > player.maxAccel) {
		player.accel = player.maxAccel;
	}
	if (player.accel < -player.maxAccel) {
		player.accel = -player.maxAccel;
	}
	
	if (debug) {
		ctx = gameArea.context;
		ctx.font = "30px Arial";
		ctx.fillStyle = '#000000';
		ctx.fillText("X speed: " + (player.accel), 10, 150);
		ctx.fillText("X acceleration: " + (player.accel), 10, 175);
		ctx.fillText("X position: " + (player.x), 10, 200);
	}
	
	// jump/fly
	if (gameArea.keys && gameArea.keys[65]) {
		player.gravity = -0.2;
	} else {
		player.gravity = 0.1;
	}
}

function collide(x, y, platform, width, height) {
	// thanks https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
	var x1, x2, x3, y1, y2, y3, s, t, area, py, px;
	px = x;
	py = y;
	x1 = platform.x1;
	x2 = platform.x2;
	x3 = platform.x3;
	y1 = platform.y1;
	y2 = platform.y2;
	y3 = platform.y3;
	
	area = triangleArea(x1, x2, x3, y1, y2, y3);

	s =  y1 * x3 - x1 * y3 + (y3 - y1) * x + (x1 - x3) * y;
	t = x1 * y2 - y1 * x2 + (y1 - y2) * x + (x2 - x1) * y;
	
	document.getElementById("test1").innerHTML = s;
	document.getElementById("test2").innerHTML = t;
	
	if ((s < 0) != (t < 0)) {
		return false;
	}
	
	return (area < 0 ? (s <= 0 && s + t >= area) : (s >= 0 && s + t <= area));
	/*
	for (var i = -width/2; i <= width/2; i+=2) {
		document.getElementById("test1").innerHTML = x1 +" "+ y1;
		document.getElementById("test2").innerHTML = x2 +" "+ y2;
		document.getElementById("test3").innerHTML = x3 +" "+ y3;
		x = px + i;
		y = py - height/2;
		s = 1 / (2*area)*(y1 * x3 - x1 * y3 + (y3 - y1) * x + (x1 - x3) * y);
		t = 1 / (2*area)*(x1 * y2 - y1 * x2 + (y1 - y2) * x + (x2 - x1) * y);
		
		if (!(s < 0 || t < 0 || (1 - s - t) < 0))    var A = -p1.Y * p2.X + p0.Y * (p2.X - p1.X) + p0.X * (p1.Y - p2.Y) + p1.X * p2.Y;
			return true;
	}
	
	for (var i = -height/2; i <= height/2; i+=2) {
		x = px - width/2;
		y = py + i;
		s = 1 / (2*area)*(y1 * x3 - x1 * y3 + (y3 - y1) * x + (x1 - x3) * y);
		t = 1 / (2*area)*(x1 * y2 - y1 * x2 + (y1 - y2) * x + (x2 - x1) * y);
		
		if (!(s < 0 || t < 0 || (1 - s - t) < 0))
			return true;
	}
	
	for (var i = -width/2; i <= width/2; i+=2) {
		x = px + i;
		y = py + height/2;
		s = 1 / (2*area)*(y1 * x3 - x1 * y3 + (y3 - y1) * x + (x1 - x3) * y);
		t = 1 / (2*area)*(x1 * y2 - y1 * x2 + (y1 - y2) * x + (x2 - x1) * y);
		
		if (!(s < 0 || t < 0 || (1 - s - t) < 0))
			return true;
	}
	
	for (var i = -height/2; i <= height/2; i+=2) {
		x = px + width/2;
		y = py + i;
		s = 1 / (2*area)*(y1 * x3 - x1 * y3 + (y3 - y1) * x + (x1 - x3) * y);
		t = 1 / (2*area)*(x1 * y2 - y1 * x2 + (y1 - y2) * x + (x2 - x1) * y);
		
		if (!(s < 0 || t < 0 || (1 - s - t) < 0))
			return true;
	}
	*/

}

function triangleArea(x1, x2, x3, y1, y2, y3) {
	return -y2 * x3 + y1 * (x3 - x2) + x1 * (y2 - y3) + x2 * y3;
}

function distance(ax, bx, ay, by) {
	return Math.floor(Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2)));
}




















