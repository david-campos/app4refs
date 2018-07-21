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