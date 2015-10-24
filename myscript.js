var canvas, ctx;
var interval_1, interval_2;
// Keep all the bugs in here.
var bugArray = [];
var score = 0;
var highScore = 0;
var time = 60;
var level = 1;
var gamePaused = false;

var food = {
    width: 20,
    height: 20,
    color1: '#D6AC30',
    color2: '#D17519',
    color3: '#8F4700',
    positions: [],
    chips: [],
    initPositions: function () {
        this.positions = [];
        this.chips = [];
        "use strict";
        var i, j, randomX, randomY, xChip, yChip, coords, pos, holder;
        for (i = 0; i < 5; i = i + 1) {
            // Get a random height and width (follow 20% rule).
            // Top 20% of 600px is 120px, so valid y-coords: 121 to 580.
            // Valid x-coords: 0 to 380.
            randomX = Math.floor(Math.random() * 381) + 10;
            randomY = Math.floor(Math.random() * 460) + 121;
            
            coords = [randomX, randomY];
            this.positions.push(coords);
            holder = [];
            for (j = 0; j < 10; j = j + 1) {
                xChip = Math.floor(Math.random() * 10) - 5;
                yChip = Math.floor(Math.random() * 10) - 5;
                pos = [xChip, yChip];
                holder.push(pos);
            }
            this.chips.push(holder);
        }
    },
    draw: function () {
        "use strict";
        var i;
        var arrayLength = this.positions.length;
        for (i = 0; i < arrayLength; i = i + 1) {
            //ctx.fillRect(this.positions[i][0], this.positions[i][1], this.width, this.height);
            ctx.beginPath();
            ctx.arc(this.positions[i][0], this.positions[i][1], 10, 0, 2*Math.PI);
            var grd = ctx.createRadialGradient(this.positions[i][0], this.positions[i][1], 0, this.positions[i][0], this.positions[i][1], 10);
            grd.addColorStop(0, this.color1);
            grd.addColorStop(1, this.color2);
            ctx.fillStyle = grd;
            ctx.fill();
            // Draw chips.
            var j;
            for (j = 0; j < 10; j = j + 1) {
                ctx.beginPath();
                ctx.arc(this.positions[i][0] + this.chips[i][j][0], this.positions[i][1] + this.chips[i][j][1], 1.5, 0, 2*Math.PI);
                ctx.fillStyle = this.color3;
                ctx.fill();
            }
        }
    }
};

function eatFood(position, coords) {
    "use strict";
    var arrayLength = coords.length;
    var i;
    for (i = 0; i < arrayLength; i = i + 1) {
        if (position[0] === coords[i][0] && position[1] === coords[i][1]) {
            coords.splice(i, 1);
            food.chips.splice(i, 1);
            break;
        }
    }
}

function distance(point1, point2) {
    var x1 = point1[0];
    var y1 = point1[1];
    var x2 = point2[0];
    var y2 = point2[1];
    
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function findNearest(position, coords) {
    var arrayLength = coords.length;
    var x1 = position[0];
    var y1 = position[1];
    var nearest = [200, 600];
    var dist = 1000000;
    
    for (var i = 0; i < arrayLength; i = i + 1) {
        var x2 = coords[i][0];
        var y2 = coords[i][1];
        
        var curr_distance = distance([x1, y1], [x2, y2]);
        
        if (curr_distance < dist) {
            nearest = coords[i];
            dist = curr_distance;
        }
    }
    
    return nearest;
}

function getNormalVector(point1, point2) {
    var x1 = point1[0];
    var y1 = point1[1];
    var x2 = point2[0];
    var y2 = point2[1];
    
    var magnitude = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    var vector = [((x2 - x1) / magnitude), ((y2 - y1) / magnitude)];
    
    return vector;
}

function checkAngle(point1, point2) {
    // This was originally negative.
    var angle = Math.atan2(point2[1] - point1[1], point2[0] - point1[0]) + Math.PI / 2;
    return angle;
}

function bug() {
    this.active = false;
    this.dead = false;
    this.fading = false;
    this.alpha = 1.0;
    this.rotation = 0;
    this.waiting = false;
    this.speedMultiplier = 1;
    this.width = 10;
    this.height = 40;
    this.color = 'blue';
    this.rgba = 'rgba(255, 0, 0, ' + this.alpha + ')';
    this.x = 0;
    this.y = 0;
    this.spawn = function() {
        this.x = Math.floor(Math.random() * 391);
        var type = Math.floor(Math.random() * 101);
        if (type <= 29) {
            this.color = 'black';
            if (level == 1) {
                this.speedMultiplier = 1.5;
            } else {
                this.speedMultiplier = 2;
            }
        } else if (type >= 61) {
            this.color = 'red';
            if (level == 1) {
                this.speedMultiplier = 0.75;
            } else {
                this.speedMultiplier = 1;
            }
        } else {
            this.color = 'orange';
            if (level == 1) {
                this.speedMultiplier = 0.6;
            } else {
                this.speedMultiplier = 0.8;
            }
        }
        this.active = true;
    };
    this.draw = function() {
        if (this.active == true) {
            var nearest = findNearest([this.x, this.y], food.positions);
            var normal = getNormalVector([this.x, this.y], nearest);
            var distCheck;
            var bugArrayLength = bugArray.length;
            for (var i = 0; i < bugArrayLength; i++) {
                distCheck = distance([this.x, this.y], [bugArray[i].x, bugArray[i].y]);
                if (this.color == 'orange') {
                    if ((bugArray[i].color == 'black' || bugArray[i].color == 'red') && distCheck < 75) {
                        this.waiting = true;
                    } else if (bugArray[i].color == 'orange' && this.x != bugArray[i].x && this.y != bugArray[i].y && distCheck < 75) {
                        this.waiting = true;
                    } else {    
                        this.waiting = false;   
                    }
                }
                if (this.color == 'red') {
                    if (bugArray[i].color == 'black' && distCheck < 75) {
                        this.waiting = true;
                    } else if (bugArray[i].color == 'red' && this.x != bugArray[i].x && this.y != bugArray[i].y && distCheck < 75) {
                        this.waiting = true;   
                    } else {
                        this.waiting = false;   
                    }
                }
                if (this.color == 'black'){
                    if (bugArray[i].color == 'black' && this.x != bugArray[i].x && this.y != bugArray[i].y && distCheck < 75) {
                        this.waiting = true;
                    } else {
                        this.waiting = false;   
                    }
                }
            }
        
            if (distance([this.x, this.y], nearest) < 30) {
                eatFood(nearest, food.positions);
            } else if (this.fading == true) {
                this.alpha = this.alpha - 0.005;
            } else if (this.waiting == true) {
                // Do nothing!
            } else {
                this.rotation = checkAngle([this.x, this.y], nearest);
                this.x += normal[0] * this.speedMultiplier;
                this.y += normal[1] * this.speedMultiplier;
            }

            if (this.color == 'orange') {
                this.rgba = 'rgba(204, 82, 0, ' + this.alpha + ')';
            } else if (this.color == 'red') {
                this.rgba = 'rgba(163, 0, 0, ' + this.alpha + ')';
            } else {
                this.rgba = 'rgba(0, 0, 0, ' + this.alpha + ')';
            }
            
            ctx.save();
            ctx.beginPath();
            //ctx.fillRect(- (this.width / 2), - (this.height / 2), this.width, this.height);
            // Body.
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(0.4, 1);
            ctx.arc(0, 0, 15, 0, 2*Math.PI);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Head.
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.translate(0, -15);
            ctx.arc(0, 0, 5, 0, 2*Math.PI);
            ctx.fillStyle = this.rgba;
            ctx.fill();
            ctx.closePath();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Start the arms.
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.lineWidth = 2;
            // Leg 1
            ctx.moveTo(0, -10);
            ctx.lineTo(-7.5, -7.5);
            ctx.moveTo(-7.5, -7.5);
            ctx.lineTo(-10, 5);
            // Leg 2
            ctx.moveTo(0, -10);
            ctx.lineTo(7.5, -7.5);
            ctx.moveTo(7.5, -7.5);
            ctx.lineTo(10, 5);
            // Leg 3
            ctx.moveTo(0, 0);
            ctx.lineTo(7.5, 2.5);
            ctx.moveTo(7.5, 2.5);
            ctx.lineTo(10, 15);
            // Leg 4
            ctx.moveTo(0, 0);
            ctx.lineTo(-7.5, 2.5);
            ctx.moveTo(-7.5, 2.5);
            ctx.lineTo(-10, 15);
            
            ctx.strokeStyle = this.rgba;
            ctx.stroke();
            ctx.closePath();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            ctx.restore();
            
            if (this.alpha < 0) {
                this.active = false;  
                this.dead = true;
            }
        }
    };
}

function exit() {
    var board = document.getElementById("myCanvas");
    var game = document.getElementById("game");
    var start = document.getElementById("start");
    var gameOver = document.getElementById("gameOver");
    
    document.getElementById("highScore").innerHTML = highScore;
    start.style.display = 'block';
    game.style.display = 'none';
    gameOver.style.display = 'none';
}

function gameOver() {
    var board = document.getElementById("myCanvas");
    var game = document.getElementById("game");
    var start = document.getElementById("start");
    var gameOver = document.getElementById("gameOver");
    
    if (highScore < score) {
        localStorage.hs = score;
        highScore = score;
    }
    
    clearInterval(interval_1);
    clearInterval(interval_2);
    clearInterval(interval_3); 
    
    board.style.display = 'none';
    gameOver.style.display = 'block';
    bugArray = [];
    time = 60;
    score = 0;  
}

function level2Start() {
    level = 2;
    alert("You made it to level 2!");
    bugArray = [];
    time = 60;
    food.initPositions();
}

function run() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    food.draw();
    var bugArrayLength = bugArray.length;
    for (var i = 0; i < bugArrayLength; i++) {
        bugArray[i].draw(); 
        if (bugArray[i].active == false && bugArray[i].dead == false) {
            bugArray[i].spawn();
        }
    };
    // Game is over situation;
    if (food.positions.length == 0) {
        document.getElementById("quote").innerHTML = "The bugs ate all the cookies!";
        gameOver();
    }
}

function bugSpawner() {
    clearInterval(interval_1);
    var spawnTime = Math.floor(Math.random() * (2000 + 1)) + 1000;
    interval_1 = setInterval(function() {
        bugArray.push(new bug());
        bugSpawner();
    }, spawnTime);
}

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
}

function handleClick(event) {
    var clickCoords = getMousePos(canvas, event);
    var bugArrayLength = bugArray.length;
    for (var i = 0; i < bugArrayLength; i++) {
        // Adjust bugCoords to middle of bug.
        var bugCoords = [bugArray[i].x + (bugArray[i].width / 2), bugArray[i].y + (bugArray[i].height / 2)];
        if (distance(clickCoords, bugCoords) <= 30 && bugArray[i].fading == false && gamePaused == false) {
            if (bugArray[i].color == 'red') {
                score += 3;
            } else if (bugArray[i].color == 'orange') {
                score += 1;
            } else {
                score += 5;
            }
            document.getElementById("score").innerHTML = "Score: " + String(score);
            bugArray[i].fading = true;
        }
    }
}

function timer() {
    var timer = document.getElementById("timer");
    time -= 1;
    timer.innerHTML = String(time) + " sec";
    if (time == 0) {
        if (level == 1) {
            level2Start();
        } else {
            document.getElementById("quote").innerHTML = "You beat the clock!";
            gameOver();
        }
    }
}

function pause() {
    gamePaused = true;
    var pause = document.getElementById("pause");
    var unpause = document.getElementById("unpause");
    unpause.style.display = 'inline';
    pause.style.display = 'none';
    
    clearInterval(interval_1);
    clearInterval(interval_2);
    clearInterval(interval_3); 
}

function unpause() {
    gamePaused = false;
    var pause = document.getElementById("pause");
    var unpause = document.getElementById("unpause");
    unpause.style.display = 'none';
    pause.style.display = 'inline';
    
    bugSpawner();
    
    interval_2 = setInterval(run, 10);
    interval_3 = setInterval(timer, 1000);
}

function startGame() {
    document.getElementById("gameOver").style.display = 'none';
    
    var board = document.getElementById("myCanvas");
    var game = document.getElementById("game");
    var start = document.getElementById("start");   
    
    document.getElementById("score").innerHTML = "Score: " + String(score);
    document.getElementById("timer").innerHTML = String(time) + " sec";
    
    start.style.display = 'none';
    game.style.display = 'block';
    board.style.display = 'block';
    
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    canvas.addEventListener("mousedown", handleClick, false);
    
    if(document.getElementById('level2').checked) {
        level2Start();
    } else {
        level = 1;
    }
    
    food.initPositions();
    bugSpawner();
    
    interval_2 = setInterval(run, 10);
    interval_3 = setInterval(timer, 1000);
}

window.onload = function () {
    "use strict";
    if (localStorage.hs) {
        highScore = localStorage.hs;
    }
    document.getElementById("highScore").innerHTML = highScore;
};