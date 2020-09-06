// here we simply create the logic. The rules by
// what this logic is applied are different for
// different languages, but the actions are still the same

module.exports = {

    checkRE: function(shared, input, params) {
        console.log("iterator: ", shared.iterator.peek())
        console.log(shared.iterator.isRegexp());
    },
    addChar: function(shared, input, params) {
        shared.out += input;
        //console.log("fs2_2: " + input;
    },

    preEnd: function(shared, input, params) {
        shared.out += input + "</span>";
        shared.spanOpen = false;
    },

    /* Handling strings here */
    startString: function(shared, input, params) {
        shared.quot = input;
        shared.out += "<span class='sin_strings'>" + input;
        shared.spanOpen = true;
    },

    endString: function(shared, input, params) {
        // even if input should be null, it's "safely"
        // converted to ""
        if (input !== shared.quot && input != "") {
            // DEBUG:
            //console.log("input is: ", input);
            shared.cache += input;
            return;
        }
        // DEBUG:
        //console.log("called endString");

        shared.out += shared.cache + input + "</span>";
        shared.cache = "";
    },

    endSpan: function(shared, input, params) {
        shared.out += "</span>" + input;
        shared.spanOpen = false;
        //console.log("fs2_3: " + input + "</span>");
    },

    addSpan: function(shared, input, params) {
        // assume that params is always !null
        shared.out += "<span class='sin_" + params[0] + "'>" + input;
        shared.spanOpen = true;
        //console.log("fs3_4: </span>");
    },

    uncache: function(shared, input, params) {
        shared.out += shared.cache + input;
        shared.cache = "";
    },

    cacheClean: function(shared, input, params) {
        shared.cache = input;
    },

    cache: function(shared, input, params) {
        shared.cache += input;
    },

    endSpan_uncache: function(shared, input, params) {
        // endSpan("");
        shared.out += "</span>" + input;
        shared.spanOpen = false;
        //uncache(c);
        shared.out += shared.cache + input;
        shared.cache = "";
    },

    decideId: function(shared, input, params) {
        // now decide whether we got a special keyword
        var reg = params[0] || "^$";
        // DEBUG:
        //console.log("========= REG: " + reg);
        if (shared.cache.match(new RegExp(reg))) {
            // is reserved
            shared.out += "<span class='sin_reserved'>";
        } else if (input === "(") {
            shared.out += "<span class='sin_identifiers'>";
        } else {
            shared.out += shared.cache + input;
            shared.cache = "";
            return;
        }

        // add the rest to shared.shared.out and empty shared.cache
        shared.out += shared.cache + "</span>" + input;
        shared.cache = "";
    }
}
