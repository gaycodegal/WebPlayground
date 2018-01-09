/**
Copyright (C) 2017 Steph Oro.

Given a starting angle and an ending angle,
 find the shortest circular path to it.
*/
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");
var linew = 10;
ctx.lineWidth = linew;
ctx.lineCap = "round";

function Point(x, y, c) {
    this.x = x;
    this.y = y;
    this.color = c;
}

Point.prototype.set = function (p) {
    this.x = p.x;
    this.y = p.y;
}

Point.prototype.draw = function (ctx) {
    var r = (linew - 4) / 2;
    ctx.save();
    ctx.beginPath();
    if (this.color) {
        ctx.fillStyle = this.color;
    }
    ctx.arc(this.x, this.y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
};

function Line(origin, circ, color) {
    this.o = origin;
    this.c = circ;
    this.color = color || "red";
}

function fixAngle(a) {
    var p2 = Math.PI * 2;
    a = a % p2;
    if (a > Math.PI) {
        a -= p2;
    } else if (a < -Math.PI) {
        a += p2;
    }
    return a;
}

Line.prototype.fixAngle = function () {
    this.c.x = fixAngle(this.c.x);
};

Line.prototype.draw = function (ctx) {
    var cx = this.c.x;
    ctx.save();
    ctx.beginPath();
    if (this.color) {
        ctx.strokeStyle = this.color;
    }
    ctx.moveTo(this.o.x, this.o.y);
    ctx.lineTo(this.o.x + Math.cos(cx) * this.c.y, this.o.y + Math.sin(cx) * this.c.y);
    ctx.stroke();
    ctx.restore();
};

Line.prototype.endPoint = function () {
    var cx = this.c.x;
    return new Point(this.o.x + Math.cos(cx) * this.c.y, this.o.y + Math.sin(cx) * this.c.y, "orange");
};

Line.between = function (p1, p2, color) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    var c = new Point(Math.atan2(dy, dx) - Math.PI, d);
    return new Line(p1, c, color);
};

function origin() {
    return new Point(window.innerWidth/2,window.innerHeight/2, "yellow");
}

function AngleTween(start, end, dt){
    var st = fixAngle(start), et = fixAngle(end);
    this.size = 100;
    this.s = start;
    this.e = end;
    this.dx = et - st;
    this.dt = dt;
    this.ct = 0;

    this.start = new Line(origin(), new Point(start, this.size), "green");
    this.end = new Line(origin(), new Point(end, this.size), "red");

    this.line = new Line(origin(), new Point(start, this.size), "black");

}

AngleTween.prototype.draw = function(ctx){
    [this.start, this.end, this.line].map(x => x.draw(ctx));
};

AngleTween.prototype.step = function(time){
    var finished = false;
    this.ct += time;
    if(this.ct > this.dt){
	this.ct = this.dt;
	finished = true
    }
    this.line.c.x = this.s + (this.dx * this.ct)/this.dt;

    return finished;
};

ctx.clearRect(0, 0, canvas.width, canvas.height);

/**
   runs a series of asynchronous tests on a function.
   @param {function} fn The function under test
   @param {Array.<function>} generators Functions that
   generate the arguments to be passed into the `fn`.
   When the generator returns null, moves onto next function.
   These generator functions take one argument state,
   which has a trial number and generator number.
*/
function TestBattery(fn, generators){
    this.state = {generator:0, trial:-1};
    this.gs = generators;
    this.fn = fn;
    this.g = this.gs[this.state.generator];
}

TestBattery.prototype.next = function(){
    this.state.trial++;
    var args = this.g(this.state);
    if(!args){
	this.state.generator++;
	this.state.trial = -1;
	if(this.state.generator >= this.gs.length){
	    return;
	}
	this.g = this.gs[this.state.generator];
	this.next();
	return;
    }
    setTimeout((x=>this.fn.apply(null, args)), 100);
};

var battery;
function runTest(as, ae, at, color){
    var ang = new AngleTween(as, ae, at);
    var s = Date.now();
    ang.draw(ctx);
    var inter = setInterval(function(){
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	var e = Date.now();
	var done = ang.step(e - s);
	ang.draw(ctx);
	s = e;
	if(done){
	    clearInterval(inter);
	    battery.next();
	}
	    
    }, 10);
}

var testtime = 500, testruns = 20;
battery = new TestBattery(runTest, [
    function(state){
	//console.log(state);
	if(state.trial > testruns)
	    return;
	var delta = state.trial * Math.PI/10
	return [Math.PI - 0.5 + delta, delta, testtime, "blue"];
    },
    function(state){
	//console.log(state);
	if(state.trial > testruns)
	    return;
	var delta = state.trial * Math.PI/10
	return [Math.PI + 0.5 + delta, delta, testtime, "yellow"];
    }

]);
battery.next();

/*








*/
