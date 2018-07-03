/**
 * Escape the string to safely print it to html,
 * this function does exactly the same as the "escape"
 * function used by Underscore.
 * @link https://underscorejs.org/#escape
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