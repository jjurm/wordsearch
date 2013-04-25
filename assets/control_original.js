var ws = new Worker("assets/ws.js");
ws.onmessage = function (e) {
    if (dnh(window.location.hostname) === false) {
        var x = "n", y = "r";
        console.error(["u"+x+String.fromCharCode(107)+x+"o"+String.fromCharCode(119)+"n", ["e", y, y, "o", y].join("")].join(" "));
        return;
    }
    var data = e.data;
    /*if (typeof(data) !== "object" || typeof(data.act) !== "string") {
        console.ole.error("WS: icorrect WebWorker message format");
        return false;
    };*/
    if (typeof(data) === "undefined") {
        return false;
    }
    function get_args(inp) {
        var args = [];
        switch (typeof(data.args)) {
            case "undefined":
                break;
            case "object":
                args = data.args;
                break;
            default:
            case "string":
            case "number":
            case "boolean":
                args = [data.args];
                break;
        }
        return args;
    }
    function process_object(data) {
        if (typeof(data.act) === "undefined") {
            //console.log(data.cont);
        } else {
            switch (data.act) {
                case "console":
                    //console[data.args](data.cont);
                    break;
                case "logp":
                    console.info(data.cont);
                    break;
                case "funct":
                    data.cont.apply(window, get_args(data.args));
                    break;
                case "get_host":
                    postmess("host", window.location.hostname);
                    break;
                case "get_state":
                    new_state(data.cont);
                    break;
                case "get_varval":
                    // Probably callback function will run
                    break;
                case "finish":
                    WordSearch.output = data.cont;
                    //console.debug(data.args); //- data.cont: returned object
                    //logp();
                    finished(data.cont);
                    break;
                default:
                    break;
            }
        }
    }
    switch (typeof(data)) {
        case "string":
        default:
            //console.log(data.toString());
            break;
        case "function":
            data.apply(window, []);
            break;
        case "object":
            if (data instanceof Array) {
                for (var i = 0; i < data.length; i++) {
                    process_object(data[i]);
                }
            } else {
                process_object(data);
            }
            break;
    }
    if (typeof(data.callback) === "function") {
        data.callback.call(null, data);
    } else if (typeof(data.callback) === "string") {
        eval(data.callback);
    }
};
function postmess(act, cont, args, callback) {
    var post = {
        "act": act || "",
        "cont": cont || "",
        "args": args || "",
        "callback": callback || undefined
    };
    ws.postMessage(post);
}
function dnh(m) { // Domain check
    var r = m.toLowerCase().split("."), o = 24;
    var ok = (r.length * o === "FHJ".charCodeAt(1) && r[0].length === 2 && r[1].length * 3 === o && r[2].length + o === Math.pow(3, 3) && ("-"+r[0][1]).charCodeAt(1) === 115 && r[0].charCodeAt(0) + 6 === Math.pow(5, 3) && r[1].charCodeAt(5) === Math.pow(10, 2) + 5 && (r[1].substr(0, 2) + r[1].substr(3, 2)) === ([String.fromCharCode(100), "aa"].join("") + "n") && r[1][2] === "t" && r[1][7].charCodeAt(0) === 115 && r[1].substr(-2) === (String.fromCharCode(117) + "s") && r[2][1].charCodeAt() === parseInt((31).toString(4),9) && r[2][2] === "m" && r[2][0].charCodeAt() === (90 + 9)) ? true : false;
    return ok;
}
function get_varval(variable, funct) {
    funct = funct || info;
    postmess("get_varval", "", variable, "("+funct+")(data.cont)");
}
function new_state(state) { //- not relevant couse of callback functions
    // New state retrieved from WordSearch WebWorker
}
var wlh = window.location.hostname;
var WordSearch = dnh(wlh) ? {
    "errors": function (funct) { // Funct as callback
        get_varval("errors", funct);
    },
    "settings": function (funct) { // Funct as callback
        get_varval("settings", funct);
    },
    "set": function (settings) {
        postmess("settings_apply", settings);
    },
    "start": function (settings) {
        postmess("start", settings);
    },
    "output": {}
} : {};

// ==================== Debug ====================
function logp() {
    postmess("logp");
}
function info(t) {
    //console.info(t);
}