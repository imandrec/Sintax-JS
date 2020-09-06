'use strict';

const Languages = require("./langs.js");
const Logic = require("./logic.js");
const Colors = require("./colors.js");

/*
 * @constructor
 * @param {string} language
 *
 */
class Sintax {
    constructor(language) {
        // language Should be a string of the name (e.g. js, ruby etc)
        //var l = language.toLowerCase() + "lang";
        this.shared = {
            out: "",
            cache: "",
            iterator: Iterator(""),
            spanOpen: false,
            quot: ""
        };
        var nulang = this.createLanguage(language.toLowerCase() + "_lang");
//		var st = new State(test);
        this.language = language;
        //console.log("language: ", language());
        this.dfa = new DFA(this.shared, nulang);
    }

    changeLanguage(language) {
        this.language = language;
        this.dfa.states = language.states;
    }

    createLanguage(name) {
        // get the configured language if exists
        var config;
        if ((config = Languages[name]) == null)
            return null;//throw Exception("Shit");
        // get the regexes
        var regexes = config.regex;
        // loop through the states, build array
        var states = [], curr, transitions;
        for (var i = 0; i < config.states.length; i++) {
            // loop through each transition of each state
            curr = config.states[i];
            transitions = [];
            for (var j = 0; j < curr.length; j++) {
                transitions.push(new Transition(curr[j], regexes));
            }
            states.push(new State(i, transitions));
        }
        return states;
    }

    highlight(text) {
        if (text == null) {
            console.log("You think I will colorize the void? Nope :)");
            return;
        }

        // passing input here
        this.shared.iterator = Iterator(text);
        while (this.shared.iterator.hasNext()) {
            this.dfa.move(this.shared.iterator.next());
            // DEBUG:
            //console.log(this.shared);
        }
        // do the last move with empty input
        this.dfa.move(this.shared.iterator.next());
        // close last span if any
        /*if (this.shared.spanOpen)
            this.shared.out += "</span>";*/

        // return the out Object
        var out = this.shared.out;

        // do some basic clean ups
        this.cleanUp();

        return out;
    }

    cleanUp() {
        //if (this.shared.cache !== "")

        // set shared values back to default
        this.shared.out = "";
        this.shared.cache = "";
        this.shared.spanOpen = false;
        this.shared.quot = "";
        this.dfa.current = 0;
    }
}

class State {
    constructor(id, transitions) {
        this.id = id;
        this.transitions = transitions;
    }

    tryMove(shared, input) {
        if (input == null)
            input = "";
        for (var i = 0; i < this.transitions.length; i++) {
            if (input != null && input.match(this.transitions[i].trigger)) {
                this.transitions[i].func(shared, input, this.transitions[i].params);
                // DEBUG:
                if (input == null)
                console.log("moved to other: ", this.transitions[i]);
                //console.log("triggered by: ", this.id, " and -> ", this.transitions[i]);
                return this.transitions[i].moveTo;
            }
        }
    }
}

class Transition {
    constructor(config, regex) {
        if (config == null)
            return null;
        //console.log(config.trigger, regex[config.trigger]);
        this.trigger = new RegExp(regex[config.trigger]);

        this.moveTo = config.moveTo;
        this.func = Logic[config.func];
        this.params = config.params || [];
    }
}

class DFA {
    constructor(shared, states) {
        this.shared = shared;
        this.states = states;
        this.current = 0;
    }

    move(input) {
//		this.shared.out += input;
        //console.log("this.current: " + this.current);
        this.current = this.states[this.current].tryMove(this.shared, input);
    }
}

// here goes the iterator
// process text
function Iterator(input) {
    var i = 0;

    function hasNext() {
        return input[i] != null ? true : false;
    }

    function next() {
        return input[i++];
    }

    function peek() {
        return input[i];
    }

    // sets the iterator to num || 0 again
    function resetTo(num) {
        if (num && num >= 0)
            i = num;
        else {
            i = 0;
        }
    }

    function swapInput(nu) {
        input = nu;
        i = 0;
    }

    // will probably used only when dealing with slash ambiguity, such as
    // is it a comment, division operator or regular expression (if exists).
    // in this case will need to go backwards and search for some context that
    // will tell us where we are.
    function isRegexp() {
        var curr = i-1,
            id = /[a-zA-Z0-9_]/;

        // skip whitespace
        for (; curr >= 0 && input[curr].match(/[\t \b]/); curr--) ;
        // if =, :, !, or ( -- return true
        if (curr === -1 || input[curr].match(/[\=\:\!\(\+]/))
            return true;
        else if (input[curr].match(id)) {
            // get the identifier itself and check if it === "return"
            var ident = input[curr];
            for (; input[curr] != null && curr > 0 && input[curr].match(id); curr--, ident += input[curr]) ;
            ident = ident.split("").reverse().join("");
            if (ident.match(/^return$/))
                return true;
        }
        return false;
    }

    return {
        next: next,
        hasNext: hasNext,
        peek: peek,
        isRegexp: isRegexp
    };
    //return r;
}

//var s = new Sintax("js");
//var out = s.highlight("a / b");
//console.log(out);
/*var out = s.highlight("`hello world`");
console.log(out);
out = s.highlight("'hello world'");
console.log(out);*/
/*console.log("State 7: ", s.dfa.states[7]);
s.dfa.move("a");
console.log(s.shared);
s.dfa.move("b");
console.log(s.shared);
s.dfa.move(" ");
console.log(s.shared);*/

/*var sin = new Sintax("js");
var ids = ["var a = 5;", "function c(a) {\n\treturn a;\n}", "// states should start with 0 and the initial should be 0\nfunction sintax(states) {\n    var saved = states;\n    var dfa = new DFA(states, 0);\n    //var out = \"\";\n\n    function colorize(text) {\n        out = \"\";\n        dfa = new DFA(saved, 0);\n        var iter = byChar(text);\n        while (iter.hasNext())\n            dfa.move(iter.next());\n        if (spanOpen)\n            out += \"</span>\";\n        console.log(out)\n        return out;\n    }\n\n    return {\n        dfa: dfa,\n        //out: out,\n        colorize: colorize\n    };\n}"];
for (var i = 0; i < ids.length; i++) {
    var n = ids[i];
    var res = sin.highlight(n);
    //test.string(res); // should be a string
    console.log(res);
    //console.log("match: " + res + res.match(/[0-9]+\.[0-9]+(E[\+\-][0-9]+)?(![\n\t ]+)/));
    //test.assert.notEqual(res.match(/\<span class=\'sin_strings\'\>.+\<\/span\>/), null);
}*/

/*var s1 = new Sintax(JSLang);
s1.dfa.move("new test");
//console.log(s1.shared);
// add another string
s1.dfa.move(" and other stuff");*/
//console.log(s1.shared);

module.exports = {
    Sintax: Sintax,
    Languages: Languages,
    Logic: Logic,
    Colors: Colors
}
