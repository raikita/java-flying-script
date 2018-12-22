
var player;
var allPlatforms = [];
var inView = [];
var debug = false;
var offsetX;
var showCollision = true;

function scrollWrapper(x, y) {
	var wrapper = document.getElementById('wrapper');
	wrapper.scrollTop = y;
	wrapper.scrollLeft = x;
}

// game area
function startGame() {
    gameArea.start();
    player = new component(30, 30, "tempPlayer.png", 250, 620, "image");
    gameLevel0();
}

var gameArea = {
    canvas : document.getElementById('canvas'),
    start : function() {
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(updateGameArea, 0.02);
        this.interval2 = setInterval(inCameraView, 1);
                
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
	//inCameraView();
	player.updatePos();
	
	// render stuff
	camera.draw();	
}

function onSegment(px, py, qx, qy, rx, ry) {
	if (qx <= Math.max(px, rx) && qx >= Math.min(px, rx) &&
	    qy <= Math.max(py, ry) && qy >= Math.min(py, ry)) {
		return true;
	}
	return false;		
}

function orientation(px, py, qx, qy, rx, ry) {
	var val = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);
	
	if (val == 0) {
		return 0;
	}
	
	return (val > 0) ? 1 : 2; // clockwise or counterclockwise
}

function intersectLine(p1x, p1y, q1x, q1y, p2x, p2y, q2x, q2y) {
	var o1, o2, o3, o4;
	
	o1 = orientation(p1x, p1y, q1x, q1y, p2x, p2y);
	o2 = orientation(p1x, p1y, q1x, q1y, q2x, q2y);
	o3 = orientation(p2x, p2y, q2x, q2y, p1x, p1y);
	o4 = orientation(p2x, p2y, q2x, q2y, q1x, q1y);
	
	if (o1 != o2 && o3 != o4) {
		return true;
	}
	
	if (o1 == 0 && onSegment(p1x, p1y, p2x, p2y, q1x, q1y)) return true;
	if (o2 == 0 && onSegment(p1x, p1y, q2x, q2y, q1x, q1y)) return true;
	if (o3 == 0 && onSegment(p2x, p2y, p1x, p1y, q2x, q2y)) return true;
	if (o4 == 0 && onSegment(p2x, p2y, q1x, q1y, q2x, q2y)) return true;
	
	return false;
}

function inCameraView() {	
	// x y = top left
	// cw y = top right
	// x ch = bottom left
	// cw ch = bottom right
	var x = player.x - document.getElementById('wrapper').clientWidth/2,
		y = player.y - document.getElementById('wrapper').clientHeight/2,
		cw = x + document.getElementById('wrapper').clientWidth,
		ch = y + document.getElementById('wrapper').clientHeight;	

	// camera boundaries
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
	
	for (i = 0; i < allPlatforms.length; ++i) {
		// check if point is in camera area in top half
		
		if (!inView.includes(allPlatforms[i]) && pointInTriangle(x, y, cw, y, x, ch, allPlatforms[i].x1, allPlatforms[i].y1)) {
			inView.push(allPlatforms[i]);
		}
		else if (!inView.includes(allPlatforms[i]) && pointInTriangle(x, y, cw, y, x, ch, allPlatforms[i].x2, allPlatforms[i].y2)) {
			inView.push(allPlatforms[i]);
		}
		else if (!inView.includes(allPlatforms[i]) && pointInTriangle(x, y, cw, y, x, ch, allPlatforms[i].x3, allPlatforms[i].y3)) {
			inView.push(allPlatforms[i]);
		}
		
		//check if point is in camera area in bottom half
		else if (!inView.includes(allPlatforms[i]) && pointInTriangle(cw, y, cw, ch, x, ch, allPlatforms[i].x1, allPlatforms[i].y1)) {
			inView.push(allPlatforms[i]);
		}
		else if (!inView.includes(allPlatforms[i]) && pointInTriangle(cw, y, cw, ch, x, ch, allPlatforms[i].x2, allPlatforms[i].y3)) {
			inView.push(allPlatforms[i]);
		}
		else if (!inView.includes(allPlatforms[i]) && pointInTriangle(cw, y, cw, ch, x, ch, allPlatforms[i].x3, allPlatforms[i].y3)) {
			inView.push(allPlatforms[i]);
		}
		/*
		// check if intersect lines
		else if (!inView.includes(allPlatforms[i]) && intersectLine(allPlatforms[i].x1, allPlatforms[i].y1, x, y,
				allPlatforms[i].x2, allPlatforms[i].y2, cw, ch)) {
			inView.push(allPlatforms[i]);
		}
		else if (!inView.includes(allPlatforms[i]) && intersectLine(allPlatforms[i].x1, allPlatforms[i].y1, x, y,
						  	   allPlatforms[i].x3, allPlatforms[i].y3, cw, ch)) {
			inView.push(allPlatforms[i]);
		}
		else if (!inView.includes(allPlatforms[i]) && intersectLine(allPlatforms[i].x2, allPlatforms[i].y2, x, y,
							   allPlatforms[i].x3, allPlatforms[i].y3, cw, ch)) {
			inView.push(allPlatforms[i]);
		}
		*/
		else {
			inView.splice(i, 1);
		}	
	}

}

function pointInTriangle(x1, y1, x2, y2, x3, y3, x, y) {
	var area, s, t;
	
	area = triangleArea(x1, x2, x3, y1, y2, y3);

	s = y1 * x3 - x1 * y3 + (y3 - y1) * x + (x1 - x3) * y;
	t = x1 * y2 - y1 * x2 + (y1 - y2) * x + (x2 - x1) * y;
	
	if ((s < 0) != (t < 0)) {
		return false;
	}
	
	return (area < 0 ? (s <= 0 && s + t >= area) : (s >= 0 && s + t <= area));
}

function drawLevel(x, y, width, height) {
	ctx = gameArea.context;

	if (!debug)	document.getElementById("test1").innerHTML = inView.length + "/" + allPlatforms.length;
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
		this.hitEdge();
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
		for (i = 0; i < inView.length; ++i) {
			// check just y collision
			if (collide(this.x, this.y + this.gravitySpeed, inView[i], this.width, this.height)) {
				if (debug) {
					ctx.fillStyle = '#000000';
					ctx.fillText("COLLISION DETECTED Y " + Math.floor(this.y), 10, 50);
				}
				
				// check if can slide down
				if (!collide(this.x - 1, this.y + this.gravitySpeed, inView[i], this.width, this.height)) {
					this.x -= 0.5;
				}
				else if (!collide(this.x + 1, this.y + this.gravitySpeed, inView[i], this.width, this.height)) {
					this.x += 0.5;
				}
				else				
					this.gravitySpeed = 0;
				break;
			}
		}
		
		// x collision
		for (i = 0; i < inView.length; ++i) {
			// check slope collision up
			for (j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y - j, inView[i], this.width, this.height)) {
					this.y -= j;
					break;
				}
			}
			
			// check slope collision down
			for (j = 1; j < slopeMax; ++j) {
				if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height) &&
					!collide(this.x + this.speedX, this.y + j, inView[i], this.width, this.height)) {
					this.y += j;
					break;
				}
			}
			
			// check just x collision
			if (collide(this.x + this.speedX, this.y, inView[i], this.width, this.height)) {
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
	
	// using this: http://www.phatcode.net/articles.php?id=459
	x1 = platform.x1;
	x2 = platform.x2;
	x3 = platform.x3;
	y1 = platform.y1;
	y2 = platform.y2;
	y3 = platform.y3;
	
	radius = 17;
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

function triangleArea(x1, x2, x3, y1, y2, y3) {
	return -y2 * x3 + y1 * (x3 - x2) + x1 * (y2 - y3) + x2 * y3;
}

function distance(ax, bx, ay, by) {
	return Math.floor(Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2)));
}




















