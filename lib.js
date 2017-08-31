var BASE_URL;
var USER = localStorage.getItem("user") || "NOUSER";
var TOKEN = localStorage.getItem("token") || "NOTOKEN";
function make(x, className, innerHTML){
    var e = document.createElement(x);
    if(className)
	e.className = className;
    if(innerHTML)
	e.innerHTML = innerHTML;
    return e;
}

function copyInto(obj, other){
    for(var k in other)
	obj[k] = other[k];
}

function formatObj(obj, what){
    if(obj.constructor == String){
	if(obj == "%s")
	    return what.vals[what.i++];
	return obj;
    }
    var o = {params:obj.params, tag: obj.tag, children:new Array(obj.children.length)};
    for(var i = 0; i < obj.children.length; ++i){
	var n = formatObj(obj.children[i], what);
	o.children[i] = n;
    }

    return o;
}

function generate(obj){
    if(obj.constructor == String)
	return [document.createTextNode(obj), {}];
    var elem = obj.tag.length ? document.createElement(obj.tag) : document.createDocumentFragment();
    var ids = {};
    var id = obj.params.id;
    if(id)
	delete(obj.params.id)
    for(var p in obj.params){
	var atr = obj.params[p];
	elem.setAttribute(p, atr);
    }
    if(id)
	ids[id] = elem;
    for(var i = 0; i < obj.children.length; ++i){
	var n = generate(obj.children[i])
	copyInto(ids, n[1]);
	elem.appendChild(n[0]);
    }

    return [elem, ids];
}


function format(str, args){
    var argv = arguments, i = 0;
    return str.replace(/%s/g, function(){
	return argv[++i];
    });
}

function appendTo(p, e){
    var op = p;
    while(p.container) p = p.container;
    while(e.container) e = e.container;
    if(e.constructor == Array){
	for(var i = 0; i < e.length; ++i){
	    appendTo(p, e[i]);
	}
    }else{
	p.appendChild(e);
    }
    return op;
}

function removeFrom(p, e){
    var op = p;
    while(p.container) p = p.container;
    while(e.container) e = e.container;
    if(e.constructor == Array){
	for(var i = 0; i < e.length; ++i){
	    removeFrom(p, e[i]);
	}
    }else{
	p.removeChild(e);
    }
    return op;
}

function on(e, x, y){
    e.addEventListener(x, y);
}

function bindTo(e, what){
    if(what.constructor == Array){
	for(var i = 0; i < what.length; ++i){
	    bindTo(e, what[i]);
	}
    }else{
	e[what] = e[what].bind(e);
    }
    return e;
}

function httpJSON(callback, onfail){
    return function(e){
	var t = "";
	console.log(e.responseText)
	try {
	    t = JSON.parse(e.responseText);
	    if(!t[0])
		return onfail(t[1]);
	    t = t[1];
	}catch(e){
	    return onfail("NO_CONNECTION");
	}
	return callback(t);
    }
}

function setter(context, token, done){
    return function(value){
	context[token] = value;
	done();
    }
}

function printArg(x){
    console.log(x);
}

function Awaiter(callback){
    this.awaiting = 1;
    bindTo(this, "done");
    this.callback = callback;
}

Awaiter.prototype.task = function(){
    ++this.awaiting;
    return this.done;
};

Awaiter.prototype.done = function(){
    --this.awaiting;
    if(this.awaiting == 0){
	this.callback();
    }
};

function formDataFromObject(object){
    var data = new FormData();
    for(var key in object){
	var val = object[key];
	if(val.filename){
	    data.append(key, val.file, val.filename);
	}else{
	    data.append(key, val);
	}
    }
    return data;
}

function standardOnFail(reason){
    console.log(reason);
    if(!reason)
	return console.log("YER SERVER IS OFFLINE");
    if(reason == "NO_AUTH")
	return window.location.href = "../login";
}

function httpget(args, name, callback){
    httpmeth("GET", args, name, callback);
}

function httppost(args, name, callback){
    httpmeth("POST", args, name, callback);
}

function httpmeth(meth, args, name, callback){
    var http = new XMLHttpRequest();
    var url = BASE_URL + name;
    http.open(meth, url, true);

    http.onreadystatechange = function() {//Call a function when the state changes.
	if(http.readyState == 4 && http.status == 200) {
	    if(callback) callback(http);
	}

    }

    http.send(formDataFromObject(args));
}

function PostButton(elem, args, name, callback, customclick){
    this.args = args;
    this.name = name;
    this.container = elem;
    this.callback = callback;
    bindTo(this, "onclick");
    if(customclick){
	this.customclick = customclick;
	on(this.container, "click", this.customclick);
    }else{
	on(this.container, "click", this.onclick);
    }
}

PostButton.prototype.onclick = function(){
    httppost(this.args, this.name, this.callback);
};

function TD(what){
    this.container = make("td");
    this.contents = what;
    appendTo(this.container, this.contents);
}

function includeUserToken(object){
    object.user = USER;
    object.token = TOKEN;
    return object;
}

BASE_URL = format("%s//%s/", window.location.protocol, window.location.host);
