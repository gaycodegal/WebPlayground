var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");
var linew = 10;
ctx.lineWidth = linew;
ctx.lineCap = "round";

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.set = function (p) {
    this.x = p.x;
    this.y = p.y;
}

Point.prototype.draw = function (ctx) {
    var r = (linew - 4) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
};

function Line(origin, circ) {
    this.o = origin;
    this.c = circ;
    this.a = 0;
}

Line.prototype.draw = function (ctx) {
    var cx = this.c.x + this.a;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(this.o.x, this.o.y);
    ctx.lineTo(this.o.x + Math.cos(cx) * this.c.y, this.o.y + Math.sin(cx) * this.c.y);
    ctx.stroke();
    ctx.restore();
};

Line.prototype.endPoint = function () {
    var cx = this.c.x + this.a;
    return new Point(this.o.x + Math.cos(cx) * this.c.y, this.o.y + Math.sin(cx) * this.c.y);
};

Line.between = function (p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    var d = Math.sqrt(dx * dx + dy * dy);
    var c = new Point(Math.atan2(dy, dx) - Math.PI, d);
    return new Line(p1, c);
};

function Chain(points) {
    this.d = 1;
    this.points = points;
    this.lines = new Array(points.length - 1);
    for (var i = 0, max = points.length - 1; i < max; ++i) {
        this.lines[i] = Line.between(points[i], points[i + 1]);
    }
    this.begin = Line.between(this.points[0], this.points[this.points.length - 1]);
}

Chain.prototype.draw = function (ctx) {
    this.lines.map(function (x) {
        x.draw(ctx);
    });
    this.points.map(function (x) {
        x.draw(ctx);
    });
};

Chain.prototype.bendTowards = function (pt, amount) {
    var d = this.d;

    for (var i = 0; i < this.lines.length; ++i) {
        this.lines[i].a += amount * (i) * d;
        this.points[i + 1].set(this.lines[i].endPoint());
    }
    var temp = Line.between(this.points[0], this.points[this.points.length - 1]);
    var total = 0;
    var delta = temp.c.x - this.begin.c.x;
    for (var i = 0; i < this.lines.length; ++i) {
        this.lines[i].c.x -= delta;
        //console.log(i, this.lines[i].a);
        if (i >= 1){
            var dif = Math.abs(this.lines[i].a - this.lines[i - 1].a, 2);
            //console.log("dif", dif);
            total += dif            
        }
        this.points[i + 1].set(this.lines[i].endPoint());
    }
    //2/3, 3/4, 4/5
    
    var l = this.lines.length,
        max = (Math.PI * 2 * (l-1)/(l));
    console.log(total/max, 1 - temp.c.y/(50*l));
    if (total >= max) {
        var div = (total - max)/(l*(l-1)/2) + amount/10;
        //console.log("fail", total, max);
        for (var i = 0; i < this.lines.length; ++i) {
            this.lines[i].c.x += delta;
            this.lines[i].a = (this.lines[i].a - div * (i) * d) % (Math.PI * 2);
            this.points[i + 1].set(this.lines[i].endPoint());
        }
        this.d = -d;
    }
};

var t = Math.min(window.innerWidth, window.innerHeight) / 2,
    d = 50;

var n = parseInt(prompt("n = ? (3 or more)"));
var a = new Array(n);
for (var i = 0; i < n; i++) {
    a[i] = i;
}

var theta = -parseInt(prompt("theta? [-360, 360]")) / 180 * Math.PI;
var dx = Math.cos(theta) * d;
var dy = Math.sin(theta) * d;

var l1 = new Chain(a.map(function (x) {
    return new Point(t + x * dx, t + x * dy)
}));
l1.draw(ctx);

//for (var i = 0; i < 50; ++i) {
    setInterval(function(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    l1.bendTowards(0, 0.06/n);
    l1.draw(ctx);
    }, 10);
//}