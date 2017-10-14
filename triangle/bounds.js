/**
Copyright (C) 2017 Steph Oro.
A basic triangle system.
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

function Triangle(line) {
    this.line = line;
    this.lines = new Array(3);
    this.calculateDrop();
}

Triangle.prototype.calculateDrop = function () {
    this.line.fixAngle();
    var end = this.line.endPoint(),
        start = this.line.o;
    var min = start,
        max = end;
    if (start.y > end.y) {
        min = end;
        max = start;
    }
    this.points = [start, end, new Point(min.x, max.y, "white")];
    this.lines = [this.line, Line.between(min, this.points[2], "green"), Line.between(max, this.points[2], "red")];
};

Triangle.prototype.draw = function (ctx) {
    this.lines.map(function (x) {
        x.draw(ctx);
    });
    this.points.map(function (x) {
        x.draw(ctx);
    });
};




var t = Math.min(window.innerWidth, window.innerHeight) / 2,
    d = 50;


ctx.clearRect(0, 0, canvas.width, canvas.height);
var tri = new Triangle(new Line(new Point(window.innerWidth/2,window.innerHeight/2, "yellow"), new Point(Math.PI/4, 100), "blue"))
tri.draw(ctx);

setInterval(function(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tri.line.c.x += 0.01;
    tri.calculateDrop();
    tri.draw(ctx);
    
}, 10);

/*








*/