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

Point.copy = function(x){
    return new Point(x.x, x.y, x.c);
};

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
    return new Line(Point.copy(p1), c, color);
};

function angleBetween(p1, p2){
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return Math.atan2(dy, dx);
}

function origin() {
    return new Point(window.innerWidth/2,window.innerHeight/2, "yellow");
}

function AngleTween(start, end, dt){
    var st = fixAngle(start), et = fixAngle(end);
    this.size = 100;
    this.s = st;
    this.e = et;
    this.dx = fixAngle(et - st);
    this.dt = dt;
    this.ct = 0;

    this.start = new Line(origin(), new Point(st, this.size), "green");
    this.end = new Line(origin(), new Point(et, this.size), "red");

    this.line = new Line(origin(), new Point(st, this.size), "black");
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

function AngleBro(line, next, factor1){
    this.line = line;
    this.next = next;
    this.f1 = factor1;
}

AngleBro.prototype.stepTowards = function(pt){
    var st = fixAngle(this.line.c.x),
	et = fixAngle(angleBetween(this.line.o, pt) - Math.PI);
    var delta = fixAngle(et - st);
    this.line.c.x += delta / this.f1;
    if(this.next)
	this.next.setOrigin(this.line.endPoint());
};

AngleBro.prototype.draw = function(ctx){
    this.line.draw(ctx);
};

AngleBro.prototype.setOrigin = function(o){
    this.line.o.set(o);
};

AngleBro.prototype.updateOrigin = function(o){
    this.line.o.set(o);
    if(this.next)
	this.next.updateOrigin(this.line.endPoint());
};

/**
Stolen from user Quentin
https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
*/
function parse_query_string(query) {
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
	var pair = vars[i].split("=");
	// If first entry with this name
	if (typeof query_string[pair[0]] === "undefined") {
	    query_string[pair[0]] = decodeURIComponent(pair[1]);
	    // If second entry with this name
	} else if (typeof query_string[pair[0]] === "string") {
	    var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
	    query_string[pair[0]] = arr;
	    // If third or later entry with this name
	} else {
	    query_string[pair[0]].push(decodeURIComponent(pair[1]));
	}
    }
    return query_string;
}

var args = parse_query_string(location.href.split("?")[1] || "");
console.log(args);
var pt = new Point(0, 0, "black");
var n = parseInt(args.n) || 10,
    l = parseFloat(args.length) || 30,
    factor1 = parseFloat(args.factor) || 100;

function factor2(i){
    var N = (n - 1);
    return (N - i)/N;
}

var bros = new Array(n);
var cx = window.innerWidth/2, cy = window.innerHeight/2;
for(var i = n - 1; i >= 0; --i){
    bros[i] = new AngleBro(
	Line.between({x:0, y:0},
		     {x:l, y:0}),
	bros[i + 1],
	factor1 * factor2(i) + 1);
    console.log(factor2(i));
}

bros[0].updateOrigin({x:cx, y:cy});

function cycle(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(Line.between(bros[n - 1].line.o, pt).c.y >= l){
	for(var j = 0; j < 3; ++j){
	    for(var i = 0; i < n; ++i){
		bros[i].stepTowards(pt);
	    }
	}
	//bros[0].updateOrigin({x:cx, y:cy});
    }
    for(var i = n - 1; i >= 0; --i){
	bros[i].draw(ctx);
    }
    pt.draw(ctx);
    requestAnimationFrame(cycle);
}
cycle();

function ptupdate(e){
    pt.set(new Point(e.pageX, e.pageY));
    //cycle();
}

on(window, "click", ptupdate);
on(window, "mousemove", ptupdate);

/*








*/
