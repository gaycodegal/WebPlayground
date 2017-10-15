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

Point.prototype.copy = function () {
    return new Point(this.x, this.y, this.color);
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
    return new Line(p1, c, color);
};

function Triangle(line, speed) {
    this.speed = speed || 1;
    this.line = line;
    this.lines = new Array(3);
    this.calculateDrop();
    this.min = this.getmin();
    this.max = this.getmax();
}

Triangle.prototype.calculateDrop = function () {
    var end = this.line.endPoint(),
        start = this.line.o;
    var min = start,
        max = end;
    if (start.y > end.y) {
        min = end;
        max = start;
    }
    this.points = [start, end, new Point(min.x, max.y, "white")];
    this.lines = [this.line, Line.between(min, this.points[2], "rgba(0,0,0,0)"), Line.between(max, this.points[2], "rgba(0,0,0,0)")];
};

Triangle.prototype.draw = function (ctx) {
    this.lines.map(function (x) {
        x.draw(ctx);
    });
    this.points.map(function (x) {
        x.draw(ctx);
    });
};

Triangle.prototype.getmin = function (amount) {
    var l2 = new Line(this.line.o, this.line.c.copy());
    l2.c.x = Math.PI;
    return l2.endPoint().x - this.line.o.x;
};

Triangle.prototype.getmax = function (amount) {
    var l2 = new Line(this.line.o, this.line.c.copy());
    l2.c.x = 0;
    return l2.endPoint().x - this.line.o.x;
};

Triangle.prototype.step = function () {
    if (this.right) {
        this.line.c.x += this.right;
        if (this.line.c.x >= this.desire) {
            this.line.c.x = this.desire;
            this.right = 0;
        }
        this.calculateDrop();
    } else if (this.left) {
        this.line.c.x += this.left;
        if (this.line.c.x <= this.desire) {
            this.line.c.x = this.desire;
            this.left = 0;
        }
        this.calculateDrop();
    }
};

/*
Triangle.prototype.give = function(x, d){
    var cur = this.points[1].x - this.points[0].x;
    var ret = false, amt = (cur + (x * d))/this.max;
    if(Math.abs(amt) > 1){
        amt = 1 * (d);
        ret = true;
    }
    this.line.c.x = Math.acos(amt);
    this.calculateDrop();
    return ret;
};
*/


Triangle.prototype.give = function (x, d) {
    this.line.fixAngle();
    var cur = this.points[1].x - this.points[0].x;
    var ret = false,
        amt = (cur + (x * d)) / this.max;
    if (Math.abs(amt) > 1) {
        amt = 1 * (d);
        ret = true;
    }
    this.desire = fixAngle(Math.acos(amt));
    this.queueDesire();
    return ret;
};

function sign(x) {
    return (x >= 0) ? 1 : -1;
}

Triangle.prototype.queueDesire = function () {
    if (this.desire >= 0 && this.line.c.x < 0 && (this.line.c.x - this.desire) > Math.PI) {
        this.line.c.x += Math.PI * 2;
    } else if (this.desire < 0 && this.line.c.x >= 0 && (this.line.c.x - this.desire) > Math.PI) {
        this.desire += Math.PI * 2;
    }
    if (this.desire > this.line.c.x) {
        this.right = this.speed;
        this.left = 0;
    } else {
        this.left = -this.speed;
        this.right = 0;
    }
};

Triangle.prototype.startSet = function (x) {
    //console.log(x);
    this.line.o = x;
    this.calculateDrop();
};

Triangle.prototype.set = function (x, d) {
    this.line.fixAngle();
    var cur = this.points[1].x - this.points[0].x;
    var amt = (x) / this.max;
    if (Math.abs(amt) > 1) {
        amt = sign(amt);
    }
    this.desire = fixAngle(d * Math.acos(amt));
    this.queueDesire();
    return amt;
};




var t = Math.min(window.innerWidth, window.innerHeight) / 2,
    d = 50;


ctx.clearRect(0, 0, canvas.width, canvas.height);
var tri = new Triangle(new Line(new Point(window.innerWidth / 2, window.innerHeight / 2, "yellow"), new Point(Math.PI / 4, 100), "blue"), Math.PI / 400);
tri.draw(ctx);
console.log(tri.min, tri.max);

var d = -1,
    x = 600;
if (tri.give(x, d)) {
    d = -d;
}

function Chain(length, angle, num) {
    this.tris = new Array(num);
    this.weights = new Array(num);
    this.sums = new Array(num + 1);
    this.sums[0] = 0;
    var n2 = num / 2 | 0;
    var sum = n2 * (n2 + 1);
    for (var i = 0; i < n2; ++i) {
        this.weights[i] = (i + 1) / sum;
    }
    for (var i = n2; i < num; ++i) {
        this.weights[i] = (num - i) / sum;
    }
    var lastOrig = new Point(window.innerWidth / 2, window.innerHeight / 2, "yellow");
    for (var i = 0; i < num; ++i) {
        var line = new Line(lastOrig, new Point(angle, length), "blue");
        this.tris[i] = new Triangle(line, Math.PI / 400);
        lastOrig = line.endPoint();
        //lastOrig.color = "yellow";
    }
}

Chain.prototype.set = function (len) {
    var n2 = this.tris.length / 2 | 0;
    for (var i = 0; i < n2; ++i) {
        this.sums[i + 1] = this.sums[i] + this.tris[i].set(this.weights[i] * len, 1);
    }
    for (var i = n2; i < this.tris.length; ++i) {
        this.sums[i + 1] = this.sums[i] + this.tris[i].set(this.weights[i] * len, -1);
    }
};

Chain.prototype.step = function () {
    for (var i = 0; i < this.tris.length; ++i) {
        this.tris[i].step();
    }
    for (var i = 1; i < this.tris.length; ++i) {
        this.tris[i].startSet(this.tris[i - 1].line.endPoint());
    }

};

Chain.prototype.draw = function (ctx) {
    for (var i = 0; i < this.tris.length; ++i) {
        this.tris[i].draw(ctx);
    }
};

var chain = new Chain(30, Math.PI / 4, 10);
chain.set(0);
setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    chain.step();
    chain.draw(ctx);
}, 10);


/*








*/