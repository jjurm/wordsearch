/*******************************
**  WordSearch Generator      **
**    by Juraj Micko          **
**                            **
**         (C) Datanius 2013  **
*******************************/

// This script must be run as WebWorker from control.js

function WordSearch() {
    'use strict';

    //======================================== USER OPTIONS ========================================
    var user_settings = {
        "size": [10, 10],
        "words": [],
        "words_count": 1,
        "lcase": 1,
        "prevent_full_overlay": true,
        "allowed_directions": [0, 1, 2, 3, 4, 5, 6, 7],
        "clue": [false, ""],
        "custom_word": [false, "", [0, 1, 2, 3, 4, 5, 6, 7]],
        "custom_chars": [" "],
        "rand_gen": [true, 100],
        "treshold_level": Math.pow(10, 6) * 2
    };

    //======================================== DEBUG ========================================
    function cl(t) {
        var post = {
            "act": "console",
            "args": "log",
            "cont": t
        };
        postMessage(post);
    }
    function logp() {
        var t = "";
        for (var i = 0; i < settings.size[1]; i++) {
            t += i;
            for (var y = 0; y < ((settings.size[1] - 1).toString().length + 1) - i.toString().length; y++) {
                t += ".";
            }
            t += " ";
            for (var i2 = 0; i2 < settings.size[0]; i2++) {
                t += " [" + (g.p[i2][i] ? g.p[i2][i] : " ") + "]";
            }
            //- t += "\n";
            t += ((i + 1) < settings.size[1]) ? "\n" : "";
        }
        var post = {
            "act": "logp",
            "args": "info",
            "cont": t
        };
        postMessage(post);
    }
    //=                                        _________
    //========================================/ PROGRAM \========================================
    //=                                       ***********

    //======================================== VARIABLES ========================================
    var ws = this;
    var default_settings = {
        "size": [10, 10],
        "words": ["CrossWords", "Datanius", "MyWord", "Power", "WordSearch"],
        "words_count": 1,
        "lcase": 1,
        "prevent_full_overlay": true,
        "allowed_directions": [0, 1, 2, 3, 4, 5, 6, 7],
        "clue": [true, "MyClue"],
        "custom_word": [false, "CustomWord", [0, 1, 2, 3, 4, 5, 6, 7]],
        "custom_chars": [" "],
        "rand_gen": [true, 100],
        "treshold_level": Math.pow(10, 6) * 2
    };
    var errors = [];
    var error_messages = {
        0: "no error",
        1: "incorrect error code",
        2: "debug error",
        3: "unknown error",
        5: "icorrect WebWorker message format",
        10: "incorrect option in settings",
        11: "option in setting out of limit",
        12: "incorrect input",
        13: "no more items in list to check",
        14: "bad letter at position queued in list"
    };
    var g = {
        "w": {
            "letters": {},
            "diff": {},
            "ordered_diff": {},
            "used": [],
            "uu": [] //- UnUsed
        },
        "p": [],
        "fields": {
            "filled": [],
            "free": []
        },
        "geni": 0,
        "l": {
            "loop": false,
            "i": false,
            "list": [],
            "level": false
        },
        "sol": [],
        "time": {
            "load": time(),
            "gen": [],
            "gen_proto": {
                "start": 0,
                "stop": 0,
                "done": false,
                /*get gen() {
                    return (false && this.done === false) ? "???" : ((this.stop - this.start) / 1).toFixed(1);
                },*/
                "gen": function () {
                    return ((this.stop - this.start) / 1000).toFixed(1);
                }
            }
        },
        "stats": {
            "arr": [],
            "sttc": {
                "words": null,
                "fields": null
            },
            "max": {
                "i": 0,
                "level": 0,
                "fields": 0,
                "words": 0,
                "g": {}
            },
            construct: function () {
                this.sttc.words = settings.words.length;
                this.sttc.fields = (settings.size[0] * settings.size[1]);
                return this.sttc;
            },
            obtain: function (full) {
                var data;
                if (full) {
                    data = {
                        "i": g.l.i,
                        "level": g.l.level,
                        "time": time(),
                        "words": g.w.used.length,
                        "fields": g.fields.filled.length
                    };
                } else {
                    data = {
                        "i": g.l.i,
                        "level": g.l.level,
                        "fields": g.fields.filled.length
                    };
                }
                this.arr.push(data);
                return data;
            },
            getmax: function () {
                var m = this.max;
                m.i = g.l.i;
                m.level = g.l.level;
                m.fields = g.fields.filled.length;
                m.words = g.w.used.length;

                var clone = "w,p,fields,geni,sol".split(",");
                for (var i in clone) {
                    m.g[clone[i]] = object_clone(g[clone[i]]);
                }
                return m;
            }
        }
    };
    var restrictions = {
        "size": [{min: 1, max: 300}, {min: 1, max: 300}],
        "words": {count: {min: 0, max: 2000}, chars: {min: 1, max: 300}},
        "words_count": {min: 1, max: 100},
        "lcase": [-2, -1, 0, 1, 2],
        "allowed_directions": [0, 1, 2, 3, 4, 5, 6, 7],
        "clue": {min: 1, max: 1000},
        "custom_word": [null, {min: 1, max: 300}, [0, 1, 2, 3, 4, 5, 6, 7]],
        "treshold_level": {min: 10, max: Math.pow(10, 14)}
    };
    var settings = {};
    var dmnok = null;

    //======================================== FUNCTIONS ========================================
    function allowed_chars(str) {
        return str.replace(/[\-\,\.\|\/\\\+\-\*\:\"\!\(\)\ˇ\%\~\°\ \_\?<>\¤\÷\×\¨\¸\˝\´\˙\`\˛\°\˘\^\[\]\{\}\$]/gi, "");
    }
    function array_compare(ar0, ar1) {
        if (ar0.length !== ar1.length) {
            return false;
        }
        ar0.sort(sort_numeric_asc);
        ar1.sort(sort_numeric_asc);
        for (var i = 0; i < ar0.length; i++) {
            if (ar0[i] !== ar1[i]) {
                return false;
            }
        }
        return true;
    }
    function array_from_range(a, b) {
        if (arguments.length === 1) {
            b = a;
            a = 0;
        }
        var arr = [];
        for (var i = 0; i < b; i++) {
            arr.push(a + i);
        }
        return arr;
    }
    function array_rand(arr) {
        return arr[Math.floor(rand()*arr.length)];
    }
    function array_remove_duplicates(arr) {
        var res = [];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (res.indexOf(item) === -1) {
                res.push(item);
            }
        }
        return res;
    }
    function array_remove_instances(arr, instances) {
        for (var i = 0; i < instances.length; i++) {
            var pos = arr.indexOf(instances[i]);
            if (pos >= 0) {
                arr.splice(pos, 1);
            }
        }
        return arr;
    }
    function direction_next(x, y, dir) {
        x = parseInt(x, 10);
        y = parseInt(y, 10);
        dir = parseInt(dir, 10);
        if (dir >= 5) {
            x--;
        } else if (dir <=3 && dir >= 1) {
            x++;
        }
        if (dir === 7 || dir <= 1) {
            y--;
        } else if (dir <= 5 && dir >= 3) {
            y++;
        }
        return [x, y];
    }
    function dmnchck(h) { // Domain check
        var s = h.toLowerCase().split(".");
        var ok = (s.length === 3 && s[0].length === 2 && s[1].length === 8 && s[2].length === 3 && s[0][1].charCodeAt(0) === 115 && s[0].charCodeAt(0) === 119 && s[1].charCodeAt(5) === 105 && s[1][2].charCodeAt(0) === 116 && (s[1].substr(0, 2) + s[1].substr(3, 2)) === ([String.fromCharCode(100), "aa"].join("") + "n") && s[1][7] === "s" && s[1].substr(6, 1) === "u" && s[2][1].charCodeAt() === 111 && s[2][2] === "m" && s[2][0].charCodeAt() === (90 + 9)) ? true : false;
        return ok;
    }
    function error_get(error) { // Error message or index in this.errors
        function error_info(err) {
            if (typeof(err) === "undefined" || typeof(err.code) === "undefined" || typeof(err.cont) === "undefined") {
                return "WS: Incorrect error object!";
            }
            var t = "WS: ERROR CODE: " + err.code;
            t += ", TEXT: " + error_messages[err.code] || "??";
            t += ", CONTINUE: " + err.cont;
            t += ", FUNCTION: " + (err.funct ? err.funct : "?");
            t += ", TIME: " + (err.time ? err.time : "?");
            t += err.params ? (", PARAMS: " + err.params) : "";
            return t;
        }
        switch (typeof(error)) {
            case "undefined":
                return false;
            case "object":
                return error_info(error);
            case "number":
                return error_info(errors[error]);
            default:
        }
    }
    function error_new(code, cont, params) {
        //var funct = error_new.caller.name || "?"; // Not available in strict mode
        var funct = "?";
        code = parseInt(code, 10);
        if (typeof(error_messages[code]) !== "string") {
            code = 1;
        }
        cont = cont ? 1 : 0;
        params = params.toString();
        var error = {
            code: code,
            cont: cont,
            funct: funct,
            time: time(),
            params: params
        };
        errors.push(error);
        var text = error_get(error);
        if (cont) {
            postMessage({"act": "console", "args": "warn", "cont": text});
        } else {
            postMessage({"act": "console", "args": "error", "cont": text});
        }
    }
    function generate() {
        function post_state(i, fin, prevent_end) {
            if (!prevent_end) {
                postMessage({"act":"console", "args": "groupEnd"});
            }
            postMessage({"act":"console", "cont": "Loop "+parseInt(i, 10)+"/"+(maxx)+",  words "+g.w.used.length+"/"+postp.words+",  fields "+g.fields.free.length+"/"+postp.fields+" ("+(g.fields.filled.length * 100 / postp.fields).toFixed(1)+"% filled)", "args": (fin ? "log" : "groupCollapsed")});
        }
        var maxx = Math.pow(10, 10);
        //var nasobok = Math.pow(10, 5);

        if (!dmnok) {
            error_new(3, 0, "");
            return false;
        }
        var ltime = g.time.gen[g.geni] = object_clone(g.time.gen_proto);
        ltime.start = time();

        var center_pos = [Math.ceil(settings.size[0] / 2) - 1, Math.ceil(settings.size[1] / 2) - 1];
        var l = g.l;
        l.loop = true; //- loop while true
        l.i = 0; //- index of loops
        l.level = 0; //- level (level/5 = words filled)
        l.list[0] = {
            "items": [center_pos.join("-")]
        };
        l.mode = 0;

        g.stats.construct();

        var pos = [], pos_letter, word, lp, dirs, dir, params, items = [], item, res;
        var postp = {
            "max": maxx,
            "words": settings.words.length,
            "fields": (settings.size[0]*settings.size[1])
        };
        //====================
        postMessage({"act":"console", "cont": "Generating", "args": "group"});
        cl("*** Phase 1 ***");
        post_state(0, false, true);
        l.mode++;
        while (l.loop) {
            l.i++;
            if (l.i > maxx) {
                post_state(l.i, true);
                cl("*** Phase 3 - Maximum reached ***");
                l.loop = false;
                break;
            }
            if (g.fields.free.length <= settings.clue[1].length) {
                if (g.fields.free.length < settings.clue[1].length) {
                   error_new(2, 1, "too much filled fields");
                }
                post_state(l.i, true);
                cl("*** Phase 3 - Enough filled fields ***");
                l.loop = false;
                //postMessage({"act": "console", "cont": "Nechavam miesto pre tajnicku..", "args": "debug"});
                break;
            }
            if (l.level % 5 === 0) {
                if (g.stats.max.fields < g.fields.filled.length) {
                    g.stats.getmax();
                } else {
                    /*-switch (l.mode) {
                        case 1:
                            if ((g.stats.max.i + settings.treshold_level) < l.i && g.fields.filled.length <= g.stats.max.i) {
                                post_state(l.i, true);
                                l.mode++;
                                cl("*** Phase "+l.mode+" ***");
                                l.level = 0;
                                l.list = [{"items": object_clone(g.fields.free)}];
                                g.stats.getmax();
                            }
                            break;
                        case 2:
                            if ((g.stats.max.i + ))
                    }*/
                    if ((g.stats.max.i + settings.treshold_level) < l.i && g.fields.filled.length <= g.stats.max.i) {
                        for (var i in g.stats.max.g) {
                            var it = g.stats.max.g[i];
                            g[i] = it;
                        }
                        post_state(l.i, true);
                        l.mode++;
                        cl("*** Phase "+l.mode+" - treshold_level exceeded ***");
                        if (l.mode > 2) {
                            l.loop = false;
                            break;
                        }
                        l.level = 0;
                        l.list = [{"items": object_clone(g.fields.free)}];
                        g.stats.getmax();
                        post_state(l.i, false, true);
                    }
                }
            }
            /*if (l.i % nasobok === 0) { //- Console logging
                post_state(l.i);
            }*/
            if (l.list[l.level].items.length === 0) {
                if (l.level <= 0) {
                    //-error_new(13, 1, ("index: " + l.i + " (ALL ways explored)"));
                    var it;
                    for (var i in g.stats.max.g) {
                        it = g.stats.max.g[i];
                        g[i] = it;
                    }
                    post_state(l.i, true);
                    l.mode++;
                    cl("*** Phase "+l.mode+" - All ways explored ***");
                    if (l.mode > 2) {
                        l.loop = false;
                        break;
                    }
                    l.level = 0;
                    l.list = [{"items": object_clone(g.fields.free)}];
                    g.stats.getmax();
                    post_state(l.i, false, true);
                } else {
                    if (l.level % 5 === 0) {
                        var data = l.list[l.level];
                        word_revert(data.changes, data.word, data.sol_i);
                    }
                    l.level--;
                }
                continue;
            }
            switch (l.level % 5) {
                case 0: //- loop pozicii ( "x-y" ) - zaradenie slov s danym pismenom
                    pos = l.list[l.level].items.splice(0, 1)[0].split("-");
                    pos_letter = g.p[pos[0]][pos[1]].toLowerCase();
                    //-pos_letter = to_case(pos_letter);
                    if (pos_letter === "") {
                        if (l.mode === 1 && l.level !== 0) {
                            error_new(14, 1, ("g.p["+pos[0]+"]["+pos[1]+"] is empty and queued in list (probably positions wrongly queued)"));
                        }
                        if (l.mode === 1 && l.level === 0 && settings.custom_word[0] === true) {
                            items = [settings.custom_word[1]];
                        } else {
                            items = object_clone(g.w.uu);
                        }
                    } else if (typeof(g.w.letters[pos_letter]) === "undefined") {
                        //-error_new(14, 1, ("g.p["+pos[0]+"]["+pos[1]+"] ('"+pos_letter+"') don't used in any unused word (pos queued in list)"));
                        items = [];
                    } else {
                        items = object_clone(g.w.letters[pos_letter]);
                    }
                    items.sort(sort_words_diff_rand_desc);
                    l.list[++l.level] = {"items": items};
                    continue;
                case 1: //- loop slova ( "slovo" ) - zoznam pozicii pismena v slove
                    word = l.list[l.level].items.splice(0, 1)[0];
                    if (pos_letter === "") {
                        switch (l.mode) {
                            case 1:
                                items = [Math.ceil(word.length / 2) - 1];
                                break;
                            default:
                            case 2:
                                items = array_from_range(word.length);
                                break;
                        }
                    } else {
                        items = search_in_string(pos_letter, word);
                    }
                    if (settings.rand_gen[0] === true) {
                        items.sort(sort_random);
                    }
                    l.list[++l.level] = {"items": items};
                    continue;
                case 2: //- loop lp ( n ) - zaradenie smerov
                    lp = l.list[l.level].items.splice(0, 1)[0];
                    if (l.level === 2 && settings.custom_word[0] === true) {
                        items = object_clone(settings.custom_word[2]);
                    } else {
                        items = new_dirs();
                    }
                    if (settings.rand_gen[0] === true) {
                        items.sort(sort_random);
                    }
                    l.list[++l.level] = {"items": items};
                    continue;
                case 3: //- loop smery ( d ) - kompletizacia moznosti (8)
                    dirs = l.list[l.level].items;
                    items = [];
                    l.level++;
                    while (dirs.length > 0) {
                        dir = dirs.splice(0, 1)[0];
                        item = [pos[0], pos[1], dir, word, lp].join("$");
                        items.push(item);
                    }
                    if (settings.rand_gen[0] === true) {
                        items.sort(sort_random);
                    }
                    l.list[l.level] = {"items": items};
                    continue;
                case 4: //- kontrola moznosti ( "x$y$d$slovo$n" ) - ak sedi, zaradenie pozicii
                    params = l.list[l.level].items.splice(0,1)[0].split("$");
                    params.push(g.fields.free.length - settings.clue[1].length);
                    params.push(false, l.list[l.level - 2].items.join(",")); //- debug
                    res = word_fill.apply(null, params);
                    if (res[0] === true) {
                        word_used(res[1]);
                        items = object_clone(g.fields.filled);
                        if (settings.rand_gen[0] === true) {
                            items.sort(sort_random);
                        }
                        l.list[++l.level] = {"items": items, "changes": res[3], "word": res[1], "sol_i": res[4]};
                    } else {
                        continue;
                    }
            }
        }
        l.mode = 3;
        //-cl("*** Phase 3 ***"); //- Filling field with clue
        var free = g.fields.free, clue = to_case(settings.clue[1]), lett;
        if (free.length < clue.length) {
            error_new(2, 1, "free.length < clue.length");
        }
        free.sort(sort_pos_asc);
        var cluef = [], odd = [];
        for (var i = 0; i < free.length; i++) {
            if (clue.length > i) {
                lett = clue[i];
                cluef.push(free[i]);
            } else {
                lett = array_rand(settings.custom_chars);
                odd.push(free[i]);
            }
            pos = free[i].split("-");
            g.p[pos[0]][pos[1]] = lett;
        }

        //postMessage({"act":"console", "args": "groupEnd"});
        post_state(l.i, true, true);
        ltime.stop = time();
        ltime.done = true;

        var used = g.w.used, chars = 0;
        chars += clue.length;
        for (var i = 0; i < used.length; i++) {
            chars += used[i].length;
        }
        var output = {
            "words": {
                "orig": object_clone(settings.words),
                "used": object_clone(g.w.used),
                "unused": object_clone(g.w.uu)
            },
            "fields": {
                "count": g.stats.sttc.fields,
                "filled": object_clone(g.fields.filled),
                "free": object_clone(g.fields.free),
                "odd": odd
            },
            "clue": {
                "use": settings.clue[0],
                "clue": settings.clue[1],
                "perc": (cluef.length * 100 / g.stats.sttc.fields).toFixed(2),
                "fields": cluef
            },
            "size": object_clone(settings.size),
            "p": object_clone(g.p),
            "stats": {
                "time": ltime.gen(),
                "avgfu": (chars / g.stats.sttc.fields).toFixed(2)
            },
            "sol": object_clone(g.sol)
        };
        var post = {
            "act": "finish",
            "cont": output,
            "args": [
                "Generating completed!",
                "         Time: "+output.stats.time+" seconds",
                "        Words: "+output.words.used.length+"/"+output.words.orig.length+" ("+(output.words.used.length*100/output.words.orig.length).toFixed(1)+"%)",
                "       Fields: total: "+output.fields.count+", filled: "+output.fields.filled.length+", clue: "+output.clue.fields.length+", FREE: "+output.fields.odd.length,
                "         Clue: "+output.clue.clue.length+" ("+output.clue.perc+"%)",
                "Avg field use: "+output.stats.avgfu
            ].join("\n  ")
        };
        postMessage(post);
        g.geni++;
        return true;
    }
    function initialize() {
        self.onmessage = function (e) {
            var data = e.data;
            if (typeof(data) !== "object" || typeof(data.act) !== "string" || typeof(data.cont) === "undefined") {
                error_new(5, 0, "message from browser side: "+data.toString());
                return;
            }
            function get_args(inp) {
                var args = [];
                switch (typeof(inp)) {
                    case "undefined":
                        break;
                    default:
                    case "string":
                    case "number":
                    case "boolean":
                    case "object":
                        args = [inp];
                        break;
                }
                return args;
            }
            function gen_state(level) {
                level = parseInt(level, 10);
                var data = {}, ext = {};
                for (var i = 0; i <= level; i++) {
                    switch (i) {
                        default:
                        case 0:
                            ext = {
                                "level": g.l.level,
                                "i": g.l.i
                            };
                            break;
                        case 1:
                            ext = {
                                "wordsl": {
                                    "used": g.w.used.length,
                                    "uu": g.w.uu.length,
                                    "total": settings.words.length
                                }
                            };
                            break;
                        case 2:
                            ext = {
                                "p": g.p
                            };
                            break;
                        case 3:
                            ext = {
                                "words": {
                                    "used": g.w.used,
                                    "uu": g.w.uu,
                                    "total": settings.words
                                }
                            };
                            break;
                    }
                    object_extend(data, ext);
                }
                return data;
            }
            function process_object(data) {
                var post;
                switch (data.act) {
                    case "settings_apply":
                        settings_apply.apply(self, get_args(object_extend({}, data.cont, data.args)));
                        break;
                    case "start":
                        start.apply(self, get_args(object_extend({}, data.cont, data.args)));
                        break;
                    case "get_state":
                        post = {
                            "act": "get_state",
                            "cont": gen_state(data.args),
                            "callback": data.callback
                        };
                        postMessage(post);
                        break;
                    case "get_varval":
                        var obj = eval(data.args);
                        post = {
                            "act": "get_varval",
                            "cont": obj,
                            "callback": data.callback
                        };
                        postMessage(post);
                        break;
                    case "host":
                        var host = data.cont;
                        dmnok = dmnchck(host);
                        break;
                    case "logp": //- debug
                        logp();
                        break;
                    case "funct":
                        data.cont.apply(self, get_args(data.args));
                        break;
                    default:
                        break;
                }
            }
            switch (typeof(data)) {
                case "string":
                    eval(data.toString());
                    break;
                case "function":
                    data.apply(self, []);
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
                default:
                    break;
            }
        };
        var t = (new Date()).getTime();
        settings_apply(user_settings);
        var post = [{
            "act": "console",
            "args": "debug",
            "cont": "Initialized in "+((new Date()).getTime() - t) + " ms"
        }];
        postMessage(post);
        postMessage({"act": "get_host"});
    }
    function new_dirs() {
        return object_clone(settings.allowed_directions);
    }
    function object_extend() { // object_extend(a, b, ...)
        var args = arguments;
        var main = args[0] || {};
        for (var i = 1; i < args.length; i++) {
            for (var key in args[i]) {
                main[key] = args[i][key];
            }
        }
        return main;
    }
    function object_clone(obj) {
        var new_obj = (obj instanceof Array) ? [] : {};
        for (var i in obj) {
            if (obj[i] && typeof(obj[i]) === "object") {
                new_obj[i] = object_clone(obj[i]);
            } else {
                new_obj[i] = obj[i];
            }
        }
        return new_obj;
    }
    function rand() {
        return Math.random();
    }
    function rand_ab(a, b) {
        a = parseInt(a, 10);
        b = parseInt(b, 10);
        if (isNaN(b)) {
            b = isNaN(a) ? 1 : a;
            a = 0;
        } else if (isNaN(a)) {
            a = 0;
        }
        return (Math.random() * (b - a)) + a;
    }
    function rand_tf() {
        return (Math.random() > 0.5) ? true : false;
    }
    function search_in_array(a, b, c) { //- search positions A in B; C - true to case-sensitive
        if (typeof(a) === "undefined" || typeof(b) !== "object") {
            return false;
        }
        a = a.toString();
        b = object_clone(b);
        for (var i = 0; i < b.length; i++) {
            b.splice(i, 1, b[i].toString());
        }
        var start = 0, result = [];
        if (!c) {
            a = a.toLowerCase();
            for (var i = 0; i < b.length; i++) {
                b.splice(i, 1, b[i].toLowerCase());
            }
        }
        while ((i = b.indexOf(a, start)) > -1) {
            result.push(i);
            start = i + 1;
        }
        return result;
    }
    function search_in_string(a, b, c) { //- search positions A in B; C - true to case-sensitive
        var i, result = [], start = 0, alen = (a.length === 0 ? 1 : a.length), blen = b.length;
        if (!c) {
            a = a.toLowerCase();
            b = b.toLowerCase();
        }
        while ((i = b.indexOf(a, start)) > -1 && (start + alen) <= blen) {
            result.push(i);
            start = i + alen;
        }
        return result;
    }
    function settings_apply(object) {
        function apply_size() {
            if (typeof(p) === "object" && p instanceof Array) {
                if (p.length >= 1) {
                    var s0 = parseInt(p[0], 10);
                    var s1 = parseInt(p[1], 10);
                    var s0o = (s0 >= restrictions.size[0].min && s0 <= restrictions.size[0].max);
                    var s1o = (s1 >= restrictions.size[1].min && s1 <= restrictions.size[1].max);
                    settings.size = [
                        s0o ? s0 : use_settings.size[0],
                        s1o ? s1 : (s0o ? s0 : use_settings.size[1])
                    ];
                    if (!s0o || !s1o) {
                        error_new(11, 1, "size");
                    }
                } else {
                    error_new(10, 1, "size");
                    settings.size = use_settings.size;
                }
            } else {
                error_new(10, 1, "size");
                settings.size = use_settings.size;
            }
            g.p = [];
            g.fields.free = [];
            g.fields.filled = [];
            for (var i = 0; i < settings.size[0]; i++) {
                g.p.push([]);
                for (var i2 = 0; i2 < settings.size[1]; i2++) {
                    g.p[i].push("");
                    g.fields.free.push(i + "-" + i2);
                }
            }
        }
        function apply_words(inp) {
            var arr = [];
            switch (typeof(inp)) {
                case "string":
                    arr = inp.split("\n");
                    break;
                case "object":
                    if (inp instanceof Array) {
                        arr = inp;
                        break;
                    }
                    break;
                default:
                    error_new(10, 1, "words");
                    settings.words = use_settings.words;
                    return;
            }
            var words_count_option = options.indexOf("words_count");
            if (words_count_option >= opt) {
                apply_words_count(object[options.splice(words_count_option, 1)[0]]);
            }
            var custom_word_option = options.indexOf("custom_word");
            if (custom_word_option >= opt) {
                apply_custom_word(object[options.splice(custom_word_option, 1)[0]]);
            }
            var lcase_option = options.indexOf("lcase");
            if (lcase_option >= opt) {
                apply_lcase(object[options.splice(lcase_option, 1)[0]]);
            }
            var count = settings.words_count ? settings.words_count : use_settings.words_count;
            var words = [], w, c;
            for (var i = 0; i < arr.length; i++) {
                w = arr[i].toString();
                w = to_case(allowed_chars(w), true);
                if (!(w.length >= restrictions.words.chars.min && w.length <= restrictions.words.chars.max && w.length >= 1)) {
                    continue;
                }
                c = search_in_array(w, words, false);
                for (var i2 = 0; i2 < (count - c.length); i2++) {
                    words.push(w);
                }
            }
            if (settings.custom_word[0] === true && settings.custom_word[1]) {
                w = settings.custom_word[1];
                c = search_in_array(w, words, false);
                if (c.length < 1) {
                    words.push(w);
                }
            }
            if (!(arr.length >= restrictions.words.count.min && arr.length <= restrictions.words.count.max)) {
                error_new(11, 1, "words");
                settings.words = use_settings.words;
                return;
            }
            words.sort(); //- Final sorting words
            settings.words = object_clone(words);
            g.w.uu = object_clone(words);
            g.w.letters = {};
            for (var i = 0; i < settings.words.length; i++) {
                w = settings.words[i];
                for (var i2 = 0; i2 < w.length; i2++) {
                    var letter = w[i2].toLowerCase();
                    if (typeof(g.w.letters[letter]) === "undefined") {
                        g.w.letters[letter] = [];
                    }
                    c = search_in_array(w, g.w.letters[letter], false);
                    for (var i3 = 0; i3 < (count - c.length); i3++) {
                        g.w.letters[letter].push(w);
                    }
                }
            }
            g.w.diff = {};
            for (var i = 0; i < settings.words.length; i++) {
                w = settings.words[i];
                if (typeof(g.w.diff[w]) !== "undefined") {
                    continue;
                }
                var diff = 0;
                for (var i2 = 0; i2 < w.length; i2++) {
                    diff += 1 * settings.words.length / Math.pow(g.w.letters[w[i2].toLowerCase()].length, 0.3);
                }
                diff += 2 * w.length;
                diff = Math.round(diff * 10) / 10;
                g.w.diff[w] = diff;
            }
            var words_diff = [];
            for (i in settings.words) {
                var word = settings.words[i];
                words_diff.push([word, g.w.diff[word]]);
            }
            words_diff.sort(function (a,b){ return b[1] - a[1]; });
            g.w.ordered_diff = words_diff.map(function (a){ return a[0]; });
        }
        function apply_words_count(count) {
            count = parseInt(count, 10);
            if (isNaN(count)) {
                error_new(10, 1, "words_count");
                settings.words_count = use_settings.words_count;
                return;
            }
            if (!(count >= restrictions.words_count.min && count <= restrictions.words_count.max && count >= 1)) {
                error_new(11, 1, "words_count");
                settings.words_count = use_settings.words_count;
                return;
            }
            settings.words_count = count;
        }
        function apply_lcase(lcase) {
            if (typeof(lcase) === "undefined" || isNaN(lcase)) {
                error_new(10, 1, "lcase");
                settings.lcase = use_settings.lcase;
                return;
            }
            lcase = parseInt(lcase, 10);
            var allowed = restrictions.lcase;
            if (allowed.indexOf(lcase) === -1) {
                error_new(11, 1, "lcase");
                settings.lcase = use_settings.lcase;
                return;
            }
            settings.lcase = lcase;
        }
        function apply_prevent_full_overlay(val) {
            if (typeof(val) === "undefined") {
                error_new(10, 1, "prevent_full_overlay");
                settings.prevent_full_overlay = use_settings.prevent_full_overlay;
                return;
            }
            val = val ? true : false;
            settings.prevent_full_overlay = val;
        }
        function apply_allowed_directions(dirs) {
            if (typeof(dirs) !== "object" || !(dirs instanceof Array)) {
                error_new(10, 1, "allowed_directions");
                settings.allowed_directions = use_settings.allowed_directions;
                return;
            }
            if (dirs.length < 1) {
                error_new(10, 1, "allowed_directions");
                settings.allowed_directions = use_settings.allowed_directions;
                return;
            }
            var dirs_ok = [];
            for (var i = 0; i < dirs.length; i++) {
                var dir = parseInt(dirs[i], 10);
                if (restrictions.allowed_directions.indexOf(dir) >= 0 && dirs_ok.indexOf(dir) === -1) {
                    dirs_ok.push(dir);
                }
            }
            if (dirs_ok.length < 1) {
                error_new(11, 1, "allowed_directions");
                settings.allowed_directions = use_settings.allowed_directions;
                return;
            }
            dirs_ok.sort(sort_numeric_asc);
            settings.allowed_directions = dirs_ok;
        }
        function apply_clue(clue) {
            if (typeof(clue) === "object" && clue instanceof Array) {
                if (clue[0]) {
                    if (clue.length >= 2) {
                        var str = allowed_chars(clue[1].toString());
                        if (str.length >= restrictions.clue.min && str.length <= restrictions.clue.max && str.length >= 1) {
                            settings.clue = [true, str];
                        } else {
                            /*if (clue[1] !== "-") {
                                error_new(11, 1, "clue");
                            }
                            settings.clue = [true, use_settings.clue[1]];*/
                            settings.clue = [false, ""];
                        }
                    } else {
                        error_new(10, 1, "clue");
                        settings.clue = [true, use_settings.clue[1]];
                    }
                } else {
                    settings.clue = [false, ""];
                }
            } else {
                error_new(10, 1, "clue");
                settings.clue = use_settings.clue;
            }
        }
        function apply_custom_word(cw) {
            if (typeof(cw) !== "object" || !(cw instanceof Array)) {
                error_new(10, 1, "custom_word");
                settings.custom_word = use_settings.custom_word;
                return;
            }
            if (cw.length < 3) {
                error_new(10, 1, "custom_word");
                settings.custom_word = use_settings.custom_word;
                return;
            }
            var use_cw = cw[0] ? true : false;
            var word = to_case(allowed_chars(cw[1].toString()), true);
            if (!(word.length >= restrictions.custom_word[1].min && word.length <= restrictions.custom_word[1].max && word.length >= 1)) {
                error_new(11, 1, "custom_word[1]");
                word = use_settings.custom_word[1];
            }
            var directions = cw[2];
            var directions_ok = [];
            if (typeof(directions) !== "object" || !(directions instanceof Array)) {
                error_new(10, 1, "custom_word[2]");
                directions = use_settings.custom_word[2];
            } else {
                for (var i = 0; i < directions.length; i++) {
                    var dir = parseInt(directions[i], 10);
                    if (restrictions.custom_word[2].indexOf(dir) >= 0 && directions_ok.indexOf(dir) === -1) {
                        directions_ok.push(dir);
                    }
                }
            }
            if (directions_ok.length < 1) {
                error_new(11, 1, "custom_word[2]");
                directions_ok = use_settings.custom_word[2];
            }
            directions_ok.sort(sort_numeric_asc);
            settings.custom_word = [use_cw, word, directions_ok];
        }
        function apply_custom_chars(chars) {
            if (typeof(chars) !== "object" || !(chars instanceof Array)) {
                error_new(10, 1, "custom_chars");
                settings.custom_chars = use_settings.custom_chars;
                return;
            }
            if (chars.length < 1) {
                error_new(10, 1, "custom chars");
                return;
            }
            for (var i = 0; i < chars.length; i++) {
                chars[i] = chars[i].toString();
            }
            settings.custom_chars = chars;
        }
        function apply_rand_gen(val) {
         if (typeof(val) !== "object" || !(val instanceof Array)) {
                error_new(10, 1, "rand_gen");
                settings.rand_gen = use_settings.rand_gen;
                return;
            }
            if (val.length < 2) {
                error_new(10, 1, "rand_gen");
                settings.rand_gen = use_settings.rand_gen;
                return;
            }
            var rand = val[0] ? true : false;
            var value = parseInt(val[1], 10);
            if (isNaN(value)) {
                value = use_settings.rand_gen[1];
            }
            settings.rand_gen = [rand, value];
        }
        function apply_treshold_level(val) {
            if (typeof(val) === "undefined" || isNaN(val = parseInt(val, 10))) {
                error_new(10, 1, "treshold_level");
                settings.treshold_level = use_settings.treshold_level;
                return;
            }
            if (val < restrictions.treshold_level.min || val > restrictions) {
                error_new(11, 1, "treshold_level");
                settings.treshold_level = use_settings.treshold_level;
                return;
            }
            settings.treshold_level = val;
        }
        var use_settings = object_clone(user_settings);
        if (typeof(object) !== "object") {
            error_new(12, 0, "type: " + typeof(object));
            return false;
        }
        object = object_clone(object);
        var options = [], option;
        for (option in object) {
            if (typeof(use_settings[option]) !== "undefined") {
                options.push(option);
            }
        }
        for (var opt in options) {
            option = options[opt];
            var p = object[option];
            switch (option) {
                case "size":
                    apply_size();
                    break;
                case "words":
                    switch (typeof(p)) {
                        case "string":
                            p = p.split(";");
                        case "object":
                            apply_words(p);
                            break;
                        default:
                            error_new(10, 1, "words - unknown type");
                            settings.words = use_settings.words;
                    }
                    break;
                case "words_count":
                    apply_words_count(p);
                    break;
                case "lcase":
                    apply_lcase(p);
                    break;
                case "prevent_full_overlay":
                    apply_prevent_full_overlay(p);
                    break;
                case "allowed_directions":
                    apply_allowed_directions(p);
                    break;
                case "clue":
                    apply_clue(p);
                    break;
                case "custom_word":
                    apply_custom_word(p);
                    break;
                case "custom_chars":
                    apply_custom_chars(p);
                    break;
                case "rand_gen":
                    apply_rand_gen(p);
                    break;
                case "treshold_level":
                    apply_treshold_level(p);
                    break;
                /*case "size":
                case "words_count":
                case "lcase":
                case "prevent_full_overlay":
                case "allowed_directions":
                case "clue":
                case "custom_word":
                case "custom_chars":
                case "rand_gen":
                case "treshold_level":
                    //-(new Function("apply_" + option + ".call()"))();
                    eval("apply_" + option).call(null, p);
                    break;*/
                default:
                    break;
            }
        }
        ws.g_b = object_clone(g);
        return settings;
    }
    function sort_numeric_asc(a, b) {
        return (a - b);
    }
    function sort_numeric_desc(a, b) {
        return (b - a);
    }
    function sort_pos_asc(a, b) {
        a = a.split("-");
        b = b.split("-");
        a = parseInt(a[1], 10) * settings.size[0] + parseInt(a[0], 10);
        b = parseInt(b[1], 10) * settings.size[0] + parseInt(b[0], 10);
        return a - b;
    }
    function sort_random() {
        return 0.5 - Math.random();
    }
    function sort_words_diff_rand_desc(a, b) {
        if (settings.rand_gen[0]) {
            if (settings.rand_gen[1] === -1) {
                return rand_tf();
            } else {
                return (g.w.diff[b] + rand_ab(settings.rand_gen[1]) - (settings.rand_gen[1] / 2)) - g.w.diff[a];
            }
        } else {
            return g.w.diff[b] - g.w.diff[a];
        }
    }
    function start(settings) {
        if (typeof(ws.g_b) !== "undefined") {
            g = object_clone(ws.g_b);
        }
        if (typeof(settings) === "object") {
            settings_apply(settings);
        }
        var result = generate();
    }
    function string_remove_duplicates(str) {
        var res = "";
        for (var i = 0; i < str.length; i++) {
            var letter = str[i];
            if (res.indexOf(letter) === -1) {
                res += letter;
            }
        }
        return res;
    }
    function time() {
        var d = new Date();
        return d.getTime();
    }
    function to_case(input, orig) {
        input = input.toString();
        switch (settings.lcase) {
            case -2:
                return input.toLowerCase();
            case -1:
                return orig ? input : input.toLowerCase();
            case 0:
                return input;
            default:
            case 1:
                return orig ? input : input.toUpperCase();
            case 2:
                return input.toUpperCase();
        }
    }
    function word_fill(xo, yo, dir, wordo, lpo, maxco, prevent_write, info) {
        var x = parseInt(xo, 10);
        var y = parseInt(yo, 10);
        var word = wordo ? to_case(wordo.toString()) : "";
        var lp = lpo ? parseInt(lpo, 10) : 0;
        var maxc = maxco ? parseInt(maxco, 10) : false;
        if (isNaN(x) || isNaN(y) || word.length < 1 || isNaN(lp) || lp < 0) {
            error_new(2, 0, ("incorrect params. x: " + xo + ", y: " + yo + " ("+g.p[x][y]+"), word: " + wordo + ", lp: " + lpo + ", Info: " + info.toString()));
            return false;
        }
        if (lp >= word.length) {
            return false;
        }
        var write = !prevent_write;
        var inv_dir = dir < 4 ? dir + 4 : dir - 4;
        var pos;
        for (var i = 0; i < lp; i++) {
            pos = direction_next(x, y, inv_dir);
            x = pos[0]; y = pos[1];
        }
        var xs = x, ys = y;
        var xd = x, yd = y;
        var ok = true;
        var count = 0;
        for (var i = 0; i < word.length; i++) {
            var t = xd + "-" + yd;
            if (xd < 0 || xd >= settings.size[0] || yd < 0 || yd >= settings.size[1] || !(g.fields.free.indexOf(t) >= 0 || to_case(g.p[xd][yd]) === word[i])) {
                ok = false;
                break;
            } else {
                if (g.fields.free.indexOf(t) >= 0) {
                    count++;
                }
            }
            if (maxc !== false && count > maxc) {
                ok = false;
                break;
            }
            pos = direction_next(xd, yd, dir);
            xd = pos[0]; yd = pos[1];
        }
        var changes = [], n = false;
        if (settings.prevent_full_overlay === true) {
            ok = ok && (count >= 1);
        }
        if (ok) {
            var t;
            for (var i = 0; i < word.length; i++) {
                t = xs + "-" + ys;
                changes.push([xs, ys, (g.fields.filled.indexOf(t) >= 0), g.p[xs][ys]]);
                g.p[xs][ys] = word[i];
                var ind = g.fields.free.indexOf(t);
                if (ind >= 0) {
                    g.fields.free.splice(ind, 1);
                    g.fields.filled.push(t);
                }
                pos = direction_next(xs, ys, dir);
                xs = pos[0]; ys = pos[1];
            }
            if (write) {
                n = g.sol.length;
                g.sol[n] = [x, y, dir, word];
            }
            cl("==================== +++ ==  "+wordo+"  =====");
        }
        return [ok, wordo, count, changes, n];
    }
    function word_revert(changes, word, sol_i) { //- changes generated by "word_fill(..)[3]"; solutions index generated by "word_fill(..)[4]"
        if (typeof changes !== "object" || !(changes instanceof Array)) {
            error_new(2, 0, "incorrect input[0] ("+changes.toString()+")");
            return false;
        }
        if (typeof sol_i !== "undefined") {
            var n = parseInt(sol_i, 10);
            if (isNaN(n)) {
                error_new(2, 1, "solutions index (input[2]) not integer ("+sol_i+")");
            } else {
                g.sol.splice(n, 1);
            }
        }
        for (var i = 0; i < changes.length; i++) {
            var c = changes[i];
            var t = c[0] + "-" + c[1];
            g.p[c[0]][c[1]] = c[3];
            if (c[2]) {
                var ind = g.fields.free.indexOf(t);
                if (ind >= 0) {
                    g.fields.free.splice(ind, 1);
                }
                if (g.fields.filled.indexOf(t) === -1) {
                    g.fields.filled.push(t);
                }
            } else {
                if (g.fields.free.indexOf(t) === -1) {
                    g.fields.free.push(t);
                }
                var ind = g.fields.filled.indexOf(t);
                if (ind >= 0) {
                    g.fields.filled.splice(ind, 1);
                }
            }
        }
        word_unused(word);
        cl("==================== --- ==  "+word+"  =====");
        return true;
    }
    function word_unused(word) {
        if (typeof word === "undefined" || word.toString().length === 0) {
            error_new(2, 0, "incorrect input[0] ("+word+")");
            return false;
        }
        word = word.toString();
        var letters = string_remove_duplicates(word);
        for (var i = 0; i < letters.length; i++) {
            var lett = letters[i].toLowerCase();
            g.w.letters[lett].push(word);
        }
        g.w.uu.push(word);
        //- Ordered diff
        g.w.used.splice(g.w.used.indexOf(word), 1);
    }
    function word_used(word) {
        if (typeof(word) === "undefined" || word.toString().length === 0) {
            error_new(2, 0, "incorrect input[0] ("+word+")");
            return false;
        }
        word = word.toString();
        var letters = string_remove_duplicates(word);
        for (var i = 0; i < letters.length; i++) {
            var lett = letters[i].toLowerCase();
            g.w.letters[lett].splice(g.w.letters[lett].indexOf(word), 1);
        }
        g.w.uu.splice(g.w.uu.indexOf(word), 1);
        g.w.ordered_diff.splice(g.w.ordered_diff.indexOf(word), 1);
        g.w.used.push(word);
    }
    //======================================== PUBLIC VARIABLES ========================================
    this.errors = errors;
    this.settings = settings;

    //======================================== PUBLIC FUNCTIONS ========================================
    this.error_get = error_get;
    this.initialize = initialize; //- debug
    this.settings_apply = settings_apply;
    this.start = start;

    //======================================== ADDITIONS ========================================

    //======================================== INITIALIZING ========================================
    initialize();
}

var w = new WordSearch();
