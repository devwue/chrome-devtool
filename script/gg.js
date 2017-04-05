/**
 *  Javascript Simple library for devwue
 */

(function(undefined) {

    /**
     * string
     */
    if(String.prototype.trim === undefined)
        String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g, ''); };
    if(String.prototype.trimLeft === undefined)
        String.prototype.trimLeft = function(){ return this.replace(/^\s*/g, ''); };
    if(String.prototype.trimRight === undefined)
        String.prototype.trimRight = function(){ return this.replace(/\s*$/g, ''); };

    /*
     * array
     * from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
     */
    if(Array.prototype.reduce === undefined)
        Array.prototype.reduce = function(fun)
        {
            if(this === void 0 || this === null) throw new TypeError();
            var t = Object(this), len = t.length >>> 0, k = 0, accumulator;
            if(typeof fun !== 'function') throw new TypeError();
            if(len === 0 && arguments.length === 1) throw new TypeError();

            if(arguments.length >= 2) accumulator = arguments[1];
            else
                do{
                    if(k in t) {
                        accumulator = t[k++];
                        break
                    }
                    if(++k >= len) throw new TypeError()
                } while (true);

            while (k < len) if(k in t)
                accumulator = fun.call(undefined, accumulator, t[k], k++, t);

            return accumulator;
        };
    if(Array.prototype.indexOf === undefined)
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        };
    if( Array.prototype.unset === undefined)
        Array.prototype.unset = function(value) {
            if(this.indexOf(value) !== -1) {
                this.splice(this.indexOf(value), 1);
            }
        };
    /**
     * array unique
     */
    if( Array.prototype.unique === undefined )
        Array.prototype.unique = function() {
            var arr = [];
            o:for(var i = 0, n = this.length; i < n; i++) {
                for(var x = 0, y = arr.length; x < y; x++) {
                    if(arr[x]==this[i]) continue o;
                }
                arr[arr.length] = this[i];
            }
            return arr;
        };
// set variable like php list()
    if( Array.prototype.list === undefined )
        Array.prototype.list = function() {
            var limit = this.length
                , orphans = arguments.length - limit
                , scope = orphans > 0  && typeof(arguments[arguments.length-1]) != "string" ? arguments[arguments.length-1] : window
                ;

            while(limit--) scope[arguments[limit]] = this[limit];

            if(scope != window) orphans--;
            if(orphans > 0) {
                orphans += this.length;
                while(orphans-- > this.length) scope[arguments[orphans]] = null;
            }
        };
// array filter < ie9
    if( Array.prototype.filter === undefined )
        Array.prototype.filter = function(fun /*, thisp */) {
            "use strict";
            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== "function")
                throw new TypeError();

            var res = [];
            var thisp = arguments[1];
            for (var i = 0; i < len; i++)
                if (i in t) {
                    var val = t[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, t)) res.push(val);
                }
            return res;
        };

// array chunk
    if( Array.prototype.chunk === undefined )
        Array.prototype.chunk = function(chunkSize) {
            var array=this;
            return [].concat.apply([],
                array.map(function(elem,i) {
                    return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
                })
            );
        };

//refer > http://kangax.github.io/es5-compat-table/
    if ( Function.prototype.bind === undefined )
        Function.prototype.bind = function(oThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var aArgs   = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP    = function() {},
                fBound  = function() {
                    return fToBind.apply(this instanceof fNOP && oThis
                            ? this
                            : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };

})();
/*
 JSON
 */
(function(win){
    if(win.JSON === undefined) win.JSON = {};
    var JSON = win.JSON;

    function f(n) {
        return n < 10 ? "0" + n : n
    }
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + string + '"'
    }
    function str(key, holder) {
        var i, k, v, length, mind = gap,
            partial, value = holder[key];
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key)
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value)
        }
        switch (typeof value) {
            case "string":
                return quote(value);
            case "number":
                return isFinite(value) ? String(value) : "null";
            case "boolean":
            case "null":
                return String(value);
            case "object":
                if (!value) {
                    return "null"
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null"
                    }
                    v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v
                }
                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === "string") {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v)
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v)
                            }
                        }
                    }
                }
                v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
                gap = mind;
                return v
        }
    }

    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) {
            return this.valueOf()
        }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        }, rep;

    if (typeof JSON.stringify !== "function") {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " "
                }
            } else {
                if (typeof space === "string") {
                    indent = space
                }
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify")
            }
            return str("", {
                "": value
            })
        }
    }

    if (typeof JSON.parse !== "function") 	{
        JSON.parse = function (text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v
                            } else {
                                try{ delete value[k] }catch(e){}
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value)
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                })
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return typeof reviver === "function" ? walk({
                    "": j
                }, "") : j
            }
            throw new SyntaxError("JSON.parse")
        }
    }
})(window);

/**
 * simple library
 * devwue.net
 */
(function(win){
    win.console = win.console || { log:function(){}, debug:function(){} };

    var GG = function() {
        if ( GG.prototype.instance ) {
            return GG.prototype.instance;
        }
        GG.prototype.instance = this;
    };
    GG.prototype.toString = function(){ return "[object GG]" };

    var gg = win.gg || new GG
        ,isReady = false
        ,doc = win.document || doc.documentElement
        ;

    if( undefined === win.gg )
    {
        win.gg = gg;
        // amd support
        if( 'function' === typeof define && define.amd ) {
            define('gg', function(){
                return win.gg
            });
        }
    }
    else
        return false;

    // combined object
    function merge(a1, a2, a3) {
        var o = undefined !== a3 ? a3 : true
            ,f;
        for (f in a2)
            if (!a1[f] || o) a1[f] = a2[f];
        return a1
    }
    // core extention..
    function extend(o){
        try{
            var self = GG.prototype.instance;

            if( typeof o === "booleen" || (typeof o !== "object" && ! isFunction(o)) ) { o = {}; }
        }
        catch(e){}
        return self.merge(self,o, false);
    }
    // after do... a wait
    function ready(f) {
        var bReady = false;
        if( ! bReady )
        {
            var readyIn = setInterval(function(){
                if( 'complete' !== doc.readyState ) return;
                clearInterval(readyIn);
                bReady = true;
                if( f ) f();

            },50);
        }
    }
    // after do a seconds..
    function defer(f,n) {
        setTimeout(f, ++n >= 0 ? n : 1 );
    }
    gg.merge 	= merge;
    gg.extend 	= extend;

    gg.extend({
        version: '1.6'
        ,debug: false
        ,description : 'Javascript Simple library'
    });
    gg.extend({
        ready : ready
        ,defer: defer
    });

    var class2type = {}
        ,toString  = class2type.toString
        ;

    function type(obj)  		{ return obj === null ? String(obj) : class2type[toString.call(obj)] || 'object' }
    function isFunction(value) 	{ return type(value) === 'function' }
    function isWindow(obj)  	{ return obj !== null && obj == obj.window }
    function isDocument(obj) 	{ return obj !== null && obj.nodeType == obj.DOCUMENT_NODE }
    function isObject(obj)  	{ return type(obj) === 'object' }
    function isArray(value) 	{ return value instanceof Array }
    function isBoolean(value) 	{ return (/^(true|1)$/i).test(value) }

    // array
    function each(a,f)	{
        if(a) {
            var ret;
            if( isObject(a) && isArray(a) ) {
                for( var i=0; i<a.length; i++) {
                    if( undefined !== (ret = f(a[i],i)) ) break;
                }
            }
            else if( isObject(a) ) f(a,0);
            return ret;
        }
    }
    function contains(a,f) 	{ return -1 < a.indexOf(f) }
    function compact(a) 	{
        var c=[];
        for(var i=0;i<a.length;i++) {
            if( !( '' === a[i] || null === a[i] || undefined === a[i]) )
                c.push(a[i])
        }
        return c;
    }
    // find by attribute
    function findWhere(collection, attr) {
        var ret = [];
        each(collection, function(v){

            for( var key in attr ) {
                if( attr[key] === v[key] ) {
                    ret.push(v);
                }
            }
        });
        return ret;
    }

    gg.extend({
        each: each
        ,contains: contains
        ,compact: compact
        ,isBoolean: isBoolean
        ,findWhere: findWhere
    });

    // query string...
    function appendQuery(url, query) { 	return (url + '&' + query).replace(/[&?]{1,2}/, '?') }
    function parseUrl(str) {
        var s = str || '', e = {}, d= [], c
            ,b = s.substr( s.indexOf('?') +1 ).split('&');

        for (c = 0; c < b.length; c += 1)
        {
            d = b[c].split("=");
            e[d[0]] = d[1]
        }
        return e
    }
    function getParam(str) {
        return gg.urlParameter.hasOwnProperty(str) ? decodeURIComponent(gg.urlParameter[str]) : null;
    }
    function serialize (/* object */ o, key, str){
        var a = []
            ,str = str || '&'
            ;
        for(var p in o)
        {
            if( o.hasOwnProperty(p) )
            {
                var v = key ? (key + '['+p+']') : p;
                if( 'object' === typeof o[p] )
                    a.push(serialize(o[p], p));
                else
                    a.push(encodeURIComponent(v)+'='+encodeURIComponent(o[p]));
            }
        }
        return a.join(str);
    }
    var isHashIndex = doc.location.href.indexOf('#')
        ,localUrl	= 0 < isHashIndex ? doc.location.href.substr(0,isHashIndex) : doc.location.href
        ;

    // url string
    gg.extend({
        urlParameter: parseUrl(localUrl)
        ,parseUrl: parseUrl
        ,getParam: getParam
        ,appendQuery: appendQuery
        ,serialize: serialize
    });


    gg.randomArray =  function(/* array */ arr) {
        return arr.sort(function(a,b){ return 0.5 - Math.random(); });
    };
    gg.isBoolean = function(/* string */ s){
        return (/^(true|1)$/i).test(s);
    };
    gg.rand = function(xmin, xmax) {
        return Math.floor(Math.random() * (xmax + 1 - xmin) + xmin);
    };

    empty = function() {};

})(window,document)

    /*
     * Utility
     */
;(function(win,a){
    a.ua = win.navigator.userAgent;
    a.extend({
        isHandset : function(){
            return /android|iphone|ipot|ipad/i.test(a.ua) ? true : false;
        }
        ,os: function() {
            var szPlatform = 'windows';

            if( /android/i.test(a.ua) )
            {
                szPlatform = 'android';
            }else if( /iphone|ipad|ipot/i.test(a.ua) )
            {
                szPlatform = 'ios';
            }
            return szPlatform;
        }()
        ,browser: function() {
            if( /msie/i.test(a.ua) || /(Trident)(?:.*rv:([\w.]+))?/i.test(a.ua) )
            {
                return 'IE';
            }else if( /firefox/i.test(a.ua) )
            {
                return 'FF';
            }else if( /opera/i.test(a.ua) )
            {
                return 'OP';
            }else if( /chrome/i.test(a.ua) )
            {
                return 'CR';
            }else if( /netscape/i.test(a.ua) )
            {
                return 'NC';
            }else if( /safari/i.test(a.ua) ){
                return 'SA';
            }else
                return 'Etc';
        }()
    });
    var doc = win.document || doc.documentElement
        ,Router = {
        routes:  []
        ,beforeHash: null
        ,nInterval: 500
        ,navigate: function() {
            var hash = Router.getHash();
            a.each(Router.routes, function(data){
                if( hash !== Router.beforeHash && hash === data.hash )
                {
                    data.callback();
                    return true;
                }
            });
            Router.beforeHash = hash;
        }
        ,bindEvent: function() {
            if (win.addEventListener ) {
                win.addEventListener('hashchange', function() {
                    Router.navigate();
                },false);
            } else if (window.attachEvent) {
                setInterval(function() {
                    if (Router.beforeHash === location.hash) return;
                    Router.navigate();
                }, Router.nInterval);
            }
        }
        ,getUrl: function() {
            var nIndex = doc.location.href.indexOf('#');
            return 0<nIndex ? doc.location.href.substr(0,nIndex) : doc.location.href;
        }
        ,getHash: function() {
            return win.location.hash.substring(1);
        }
    };
    a.extend({
        getUrl: Router.getUrl
        ,getHash: Router.getHash
        ,route: {
            // 등록
            register: function(key, def) {
                var result = a.each(Router.routes, function(item, idx){
                    if( key === item.hash ) return true;
                });

                if( !result )
                    Router.routes.push({ hash: key, run: false, callback: def || function(){} })
                return this;
            }
            // 삭제
            ,remove: function(key) {
                var index = a.each(Router.routes, function(item, idx){
                    if( key === item.hash )
                        return idx;
                });
                if( !isNaN(index) )
                    Router.routes.splice(index, 1);

                return this;
            }
            // 라우팅 시작
            ,ready: function() {
                Router.bindEvent();
                Router.navigate();
            }
            ,getAll: function() {
                return Router.routes;
            }
        }
    });


    // cookie
    function setCookie( name, value, domain, expiredays) {
        var tmToday = new Date(), nExpiredays = parseInt(expiredays) || 1 ;

        tmToday.setDate( tmToday.getDate() + nExpiredays );
        document.cookie = name + '=' + escape( value ) + '; '
            + "path=/; expires=" + tmToday.toGMTString() + '; '
            + "domain=" + domain +";" ;
    }
    function getCookie(name) {
        var array,sub,returnValue = null;

        if( document.cookie ) {
            array = document.cookie.split(';');
            a.each(array, function(d) {
                if( new RegExp('^('+escape(name)+'=)','g').test(d.trim()) )
                    returnValue = unescape(d.trim().split('=')[1])
            });
        }
        return returnValue;
    }
    function releaseCookie( name, domain) {
        var tmToday = new Date();

        tmToday.setDate(tmToday.getDate() - 1);
        document.cookie = name + "= " + "; expires=" + tmToday.toGMTString()
            + "; path=/; domain=" + domain +';';
    }

    a.extend({
        setCookie: setCookie
        ,getCookie: getCookie
        ,releaseCookie: releaseCookie
    });

    // 머니 포멧 1,444,000
    function toMoneyFormat(/* number */ szNumber,/* number */ nDec) {
        try{
            var num = new Number(szNumber), dec = nDec || 0 , reg ;

            reg = dec ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(\d{3})+$)/g;
        }catch(e){}

        return num.toFixed(dec).replace(reg, "$1,");
    }

    // 문자열 자리수에 맞게 자르기 & ... 붙이기
    function toByteCutter(/* string */ szMsg,/* number */ nMaxLen,/* string */ szReplace) {
        try{
            var nBytes = 0
                , str = szMsg.substring(0)
                , strReplace = undefined === szReplace ? '..' : szReplace
                ;

            if( str === null ) return 0;

            for(var i=0; i<str.length; i++)
            {
                var nAsc = str.charCodeAt(i);
                if ( (nAsc > 0)  && (nAsc < 256) && (nAsc !== '\r') )
                    nBytes += 1;
                else
                    nBytes += 2;

                if( nBytes > nMaxLen )
                {
                    str = str.substr(0,i) + strReplace;
                    break;
                }
            }
        }catch(e){}

        return str;
    }
    // byte length count
    function byteCount(s) {
        var e = 0,
            b, d;
        for (b = 0; b < s.length; b += 1) {
            d = escape(s.charAt(b)).length;
            if (d > 3) { e++ }
            e++
        }
        return e
    }
    // return unixtime
    function time(/* date */ date) {
        try{
            var tmDate = date || new Date();
        }catch(e){}

        return Math.round(tmDate.getTime()/1000);
    }
    // str to time like date in php
    function strtodate(/* string */ szFormat, /* date */ date) {
        try{
            var tmDate =  date || new Date()
                , pad='00'
                , format = szFormat || 'yy-mm-dd h:i:s'
                , o = {
                "m+" : tmDate.getMonth()+1
                ,"d+" : tmDate.getDate()
                ,"h+" : tmDate.getHours()
                ,"i+" : tmDate.getMinutes()
                ,"s+" : tmDate.getSeconds()
                ,"q+" : Math.floor((tmDate.getMonth()+3)/3)
                ,"S" : tmDate.getMilliseconds() //millisecond
            };

            if( /(y)+/i.test(format) )
            {
                szYear = 2 < RegExp.lastMatch.length ? tmDate.getFullYear() : (new Date().getFullYear()+'').substr(4-2);
                format = format.replace(RegExp.lastMatch, szYear);
            }
            for(var k in o)
            {
                if(new RegExp("("+ k +")").test(format)) {
                    format = format.replace(RegExp.$1, (2 > (''+o[k]).length) ? '0'+o[k] : o[k]);
                }
            }
        }
        catch(e){}

        return format;
    }
    // str to time
    function strtotime(/* string yy-mm-dd h:i:s */ szDate) {
        var szDateTmp = szDate || strtodate()
            ,ar = szDateTmp.match(/\d+/g)
            ,year = ar[0], month = ar[1], day = ar[2]
            ,hour = ar[3] || 0
            ,min = ar[4] || 0
            ,sec = ar[5] || 0
            ,oDate = new Date()
            ;
        year = 3 > year.length ? oDate.getFullYear().toString().substr(0,2)+year : year;
        return +new Date(year,month-1,day,hour,min,sec)/1000;
    }
    function str_repeat(a, b) {
        for (var c = []; b > 0; c[--b] = a);
        return c.join("")
    }
    // string replacement
    function sprintf() {
        for (var a, b, c, d, e, f = 0, g = arguments[f++], h = [], i = ""; g;) {
            if (b = /^[^\x25]+/.exec(g)) h.push(b[0]);
            else if (b = /^\x25{2}/.exec(g)) h.push("%");
            else {
                if (!(b = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(g))) throw "Huh ?!";
                if (null === (a = arguments[b[1] || f++]) || void 0 === a)
                {
                    console.log(arguments,arguments[0]); throw "Too few arguments.";
                }
                if (/[^s]/.test(b[7]) && "number" !== typeof a)
                {
                    throw "Expecting number but found " + typeof a;
                }
                switch (b[7]) {
                    case "b":
                        a = a.toString(2);
                        break;
                    case "c":
                        a = String.fromCharCode(a);
                        break;
                    case "d":
                        a = parseInt(a);
                        break;
                    case "s":
                        a = (a = String(a)) && b[6] ? a.substring(0, b[6]) : a;
                        break;
                    case "u":
                        a = Math.abs(a);
                        break;
                    case "x":
                        a = a.toString(16);
                        break;
                    case "X":
                        a = a.toString(16).toUpperCase()
                }
                a = /[def]/.test(b[7]) && b[2] && a >= 0 ? "+" + a : a, d = b[3] ? "0" === b[3] ? "0" : b[3].charAt(1) : " ", e = b[5] - String(a).length - i.length, c = b[5] ? str_repeat(d, e) : "", h.push(i + (b[4] ? a + c : c + a))
            }
            g = g.substring(b[0].length)
        }
        return h.join("");
    }

    a.extend({
        toMoneyFormat: toMoneyFormat
        ,toByteCutter: toByteCutter
        ,countByte: byteCount
        ,sprintf: sprintf
    });
    a.extend({
        // date object to unix timestamp
        getUnixTime : time
        // date sting to unix timestamp
        ,toTimestamp: strtotime
        // date string to date format ( yy-mm-dd h:i:s )
        ,toDateFormat: strtodate
    });

    // alias
    a.cutString = a.toByteCutter;

    a.insertIframe = function(option, bRemove) {
        try{
            var el = document.createElement('iframe')
                ,o = a.merge({
                    frameborder: 0
                    ,id: '_insertIframe'
                }, option)
                ,bRemove = bRemove || false
                ,dom = document.body || document.getElementsByTagName('body')[0]
                ;
            try
            {
                for(var p in o) {
                    if( el.hasOwnProperty(p) ) el.setAttribute(p, o[p]);
                }
            }catch (e)
            {
                el.id = o.id;
                el.frameborder = 0;
            }
            // ie bug
            el.src = o.src || '';

            if( bRemove )
            {
                el.style.height= 0;
                el.style.width=0;
                el.onload = function() {
                    setTimeout(function(){
                        try{
                            dom.removeChild(el);
                        }catch(f){}
                    },1000*10);
                }
            }
            dom.appendChild(el);
            return true;
        }catch(e){
            console.log(e);
            return false;
        }
    };
    a.newPopup = function(szUrl,szWindow, oOption)  {
        var
            o = {
                left: 10
                ,top: 10
                ,width: 1024
                ,height: 768
                ,marginwidth: 0
                ,marginheight: 0
                ,resizable: 1
                ,scrollbars: 'no'
            };

        o = a.merge(o, oOption || {} );

        return window.open(szUrl, szWindow, a.serialize(o,'',','));
    };

})(window,gg)
    /*
     *  loader
     */
;(function(a){
    var loadCompleted = {}
        ,loadId = 0
        ,empty = function() {}
        ,settings = {
            type: 'get'
            ,dataType: 'json'
            ,data: null
            ,accepts: {
                script	: 'text/javascript, application/javascript'
                ,json 	: 'text/html, application/json'
                ,jsonp 	: 'text/html, application/json'
                ,xml 	: 'text/xml, application/xml'
                ,text 	: 'text/plain'
            }
            //,xhrFields: {}
            ,complete : empty
            ,charset : 'utf-8'
            ,crossDomain: false
        }
        ,ieXdom = false
        ;

    // complete ajax
    // status: success, error, abort, timeout
    function doneback(result, xhr, settings, status) {
        settings.complete.call(null,result, xhr, status);
    }
    function createStandardXhr() {
        try{
            return new XMLHttpRequest();
        }
        catch(e){}
    }
    function createActiveXhr() {
        try { // normal
            return new XMLHttpRequest();
        }
        catch (e) {
            // ie8+
            try{
                ieXdom = true;
                return new XDomainRequest();
            }
                // ie6+
            catch(e){
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        }
    }

    // ajax wrapper
    function ajax(def) {
        var
            xhr
            ,opt = a.merge({}, def || {})
            ;

        for(k in settings )
            if( undefined === opt[k]) opt[k] = settings[k];

        opt.crossDomain = /^((?:f|ht)tp(?:s)?:)?\/\/([^/]+)/i.test( opt.url ) && RegExp.lastParen !== window.location.host;
        xhr = opt.crossDomain ? createActiveXhr() : createStandardXhr();

        var  dataType = opt.dataType.toLowerCase()
            ,mime = opt.accepts[dataType]
            ,oHeaders = { }
            ,abortTimeout = empty
            ,xhrSuccess
            ;

        if ( 'get' !== opt.type.toLowerCase() ) {
            oHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            if( opt.hasOwnProperty('charset') ) oHeaders['Content-Type'] += '; charset=' + opt.charset.toUpperCase();
        }

        if( 'overrideMimeType' in xhr) xhr.overrideMimeType(mime);

        loadCompleted[opt.url] = { load:false , data: null };
        xhrSuccess = function() {
            var result, error;
            clearTimeout(abortTimeout);
            try{
                result = xhr.responseText;
                switch(dataType){
                    case 'text':
                    case 'html':
                    case 'jsonp':
                    case 'script':	//eval(result);
                        break;
                    case 'xml':
                        result = xhr.responseXML;
                        break;
                    case 'json':
                        result = /^\s*$/.test(result) ? null : JSON.parse(result);
                        break;
                }

            } catch(e){
                try{
                    result = eval('('+xhr.responseText+')');
                }
                catch(e1){
                    error = e;
                    if( a.debug ) console.log(xhr.responseText);
                }
            }

            loadCompleted[opt.url] = { load:true , data: a.debug ? result : null };

            if( error )
            {
                doneback(error, xhr, opt
                    , {
                        ready: xhr.readyState || 0
                        , status: xhr.status || ''
                        , message: 'parse error'
                    });
            }
            else
            {
                doneback(result, xhr, opt, 'success' );
            }
        };
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                xhr.onreadystatechange = empty;

                if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 )   {
                    xhrSuccess();
                }
                else {
                    doneback(
                        {}, xhr, opt
                        , {
                            ready: xhr.readyState
                            , status: xhr.status
                            , message: 'error'
                        });
                }
            }
        };

        if( 0 < opt.timeout )
            abortTimeout = setTimeout(function(){
                xhr.abort();
            }, 1000 * opt.timeout);

        // xdomainrequest
        if( ieXdom ) {
            xhr.onload = xhrSuccess;
            xhr.ontimeout = function() {
                xhr.abort();
                doneback({}, xhr, opt
                    , {
                        ready: 0
                        ,status: ''
                        ,message: 'timeout'
                    });
            };
            xhr.onerror = function() {
                doneback({}, xhr, opt
                    , {
                        ready: 0
                        ,status: ''
                        ,message: 'error'
                    });
            };
            xhr.timeout = 1000 * opt.timeout;
        }

        if( false === opt.cache )
            opt.url = a.appendQuery(opt.url, '_='+Date.now()) ;

        xhr.open(opt.type, opt.url, opt.sync || true);

        try{
            for(k in oHeaders) {
                xhr.setRequestHeader(k, oHeaders[k]);
            }
        }catch(e){
            console.log(e, oHeaders);
        }

        if( opt.crossDomain && opt.xhrFields && ("withCredentials" in xhr) )
        {
            for(k in opt.xhrFields )
            {
                try{
                    xhr[k] = opt.xhrFields[k];
                }catch(e){
                    console.log('Err: xhr');
                }
            }
        }

        xhr.send(opt.data);

        return xhr;
    }

    /*
     * javascript loader
     * Usage: loadJs({
     url: 'http://afreeca.com/data/data.js?callback=?'
     ,complete: function(result){}
     ,charset: 'euc-kr'
     });
     */
    function loadJs(def) {
        var j, i
            ,d = document.getElementsByTagName("head")[0] || document.documentElement
            ,xhr ={

            }
            ,o
            ,hasCallback
            ,hasVar
            ,allow = [
                'charset', 'async'
            ]
            ;
        if( 'string' == typeof def )
            o = a.merge({}, { url: def });
        else
            o = a.merge({}, def || {} );

        hasCallback = /(callback=)+/i.test(o.url);
        if ( hasCallback && /(callback)+=\?(&|$)/.test(o.url)) {
            o.url = o.url.replace(/(callback)+=\?(&|$)/, "callback=" + ('_jsonp'+ ++loadId) + "$2");
        }
        hasVar = /(var=)+/i.test(o.url);

        for(k in settings )
            if( undefined === o[k]) o[k] = settings[k];

        if( 3 > o.url.length ) return false;

        loadCompleted[o.url] = { load:false , data: null };
        j = document.createElement("script");
        j.type = "text/javascript";
        j.src  = o.url;
        j.onerror = function() {
            settings.complete.call(null, {}, xhr, 'onerror');
        };
        for(var p in o) {
            if (a.contains(p, allow) && j.hasOwnProperty(p)) j.setAttribute(p, o[p]);
        }

        if( o.hasOwnProperty('charset') ) j.setAttribute('charset', o.charset);
        var f = a.parseUrl(o.url)['callback']
            ,donefb = function() {
                try{
                    if( 'function' !== typeof window[f] ) {
                        loadCompleted[o.url] = {load: true, data: a.debug ? window[f] : null};
                        doneback((hasCallback && 'object' == typeof window[f]) ? window[f] : {}, xhr, o, 'success');
                    }else
                    {
                        delete window[f];
                    }

                }catch(e) {
                    if( a.debug ) console.log('donefb', a.ua);
                }
            }
            ;

        if( hasCallback )
        {
            window[f] = function(data) {
                try{
                    loadCompleted[o.url] = { load:true , data: a.debug ? data : null };
                    if( j ) d.removeChild(j);
                }
                catch(e){}

                doneback(data, xhr, o, 'success');
            }
        }
        // IE9+
        if( j.readyState )
        {
            j.onreadystatechange = function() {
                if( /(loaded|complete)/.test(this.readyState) )
                {
                    donefb();
                }
            }
        }else
        {
            j.onload = donefb;
        }
        d.appendChild(j);
        return true;
    }

    a.extend({
        loadCompleted: loadCompleted
        ,loader: {
            ajax: ajax
            // post request
            ,post: function (def) {
                var opt = a.merge({ type: 'post' }, def || {});
                return ajax(opt);
            }
            ,loadJs: loadJs
        }
    });
    //alias
    a.loadJs = a.loader.loadJs;

    a.extend({
        evt: {
            fire: function(el, type) {
                if(document.createEventObject){
                    var evt = document.createEventObject();
                    return el.fireEvent('on'+type, evt)
                }else{
                    var evt = document.createEvent("HTMLEvents");
                    evt.initEvent(type, true, true);
                    return !el.dispatchEvent(evt);
                }
            }
        }
    });

})(gg)
    /*
     * base64 encode/decode
     * Base64 code from Tyler Akins -- http://rumkin.com
     */
;(function(a){

    var Base64Str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    function encode(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + Base64Str.charAt(enc1) + Base64Str.charAt(enc2) +
                Base64Str.charAt(enc3) + Base64Str.charAt(enc4);
        } while (i < input.length);

        return output;
    }
    function decode(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do {
            enc1 = Base64Str.indexOf(input.charAt(i++));
            enc2 = Base64Str.indexOf(input.charAt(i++));
            enc3 = Base64Str.indexOf(input.charAt(i++));
            enc4 = Base64Str.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        } while (i < input.length);
        return output;
    }

    a.extend({
        encodeBase64: encode
        ,decodeBase64: decode
    });
})(gg);
