/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
goog.module('_..index');
var module = module || { id: '' };
var Color = /** @class */ (function () {
    /** internal */
    function Color(rgb) {
        if (rgb.length === 3) {
            rgb.push(1);
        }
        this._rgb = /** @type {!Array<?>} */ (rgb);
    }
    return Color
}());
if (false) {
    /** @type {!Array<?>} */
    Color.prototype._rgb;
}
/**
 * @param {...?} args
 * @return {?}
 */
function chroma() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args[0] instanceof Color) {
        return args[0];
    }
}
exports.chroma = chroma
exports.x = new Color([0, 1, 1, 1])