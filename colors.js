/* In this file you can make changes and use different colors.
 * This part is independent from the syntax highlighter, it uses
 * css classes and in this file you can create your own color schemes.
 */

const class_prefix = "sin_"; // prefix for CSS-classes

const colors = {
    reserved: "#FC29FF",
    strings: "#E4D642",
    numbers: "#fe4e44",
    identifiers: "#4d9cee",
    special: "#ffb225",
    comment: "#777",
    ops: "#44A8B6"
};

function generate_css(cols, minify) {
    minify = minify | false;
    function structure_css(klass, val) {
        return minify ? `span.${class_prefix}${klass}{color:${val};}` : `span.${class_prefix}${klass} {color: ${val};}\n`;
    }

    var out = "";
    for (var k in cols) {
        out += structure_css(k, cols[k]);
    }
    return out;
}

module.exports = {
    colors: colors,
    generate_css: generate_css
}
