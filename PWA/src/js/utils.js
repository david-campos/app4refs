/**
 * Escape the string to safely print it to html,
 * this function does exactly the same as the "escape"
 * function used by Underscore.
 * @link https://underscorejs.org/#escape
 * @returns {string}
 */
String.prototype.htmlEscape = function() {
    let escapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return this.replace(/[&<>"'\/]/g, (match)=>escapes[match]);
};

String.prototype.htmlUnescape = function() {
    let entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '],
        ['quot', '"']
    ];

    let text = this;

    for (let entity of entities) {
       text = text.replace(new RegExp('&' + entity[0] + ';', 'g'), entity[1]);
    }

    return text;
};

/**
 * Checks if both arrays have the same numbers
 * @param {Array} array - The other array
 * @returns {boolean}
 */
Array.prototype.hasSameNumbers = function(array) {
    let equal = (this.length === array.length);
    if(!equal) return false;
    let cloneA = this.splice().sort();
    let cloneB = array.splice().sort();
    for(let i=0; equal && i < cloneA.length; i++) {
        equal = (cloneA[i] === cloneB[i]);
    }
    return equal;
};

/**
 * Adds the number of specified hours to the current date
 * @param {number} h - Hours to add
 * @return {Date}
 */
Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
};

/**
 * Gets the module n of the number x
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
Math.mod = function(x, n) {
    return ((x%n)+n)%n;
};