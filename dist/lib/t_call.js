"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _translate_call = require("i18nliner/dist/lib/extractors/translate_call");

var _translate_call2 = _interopRequireDefault(_translate_call);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * hbs-capable version of TranslateCall
 *
 * normalizes args/etc into literals that TranslateCall can deal with
 */
function TCall(sexpr) {
  var line = sexpr.firstLine,
      method = sexpr.string,
      args = this.processArguments(sexpr);

  _translate_call2.default.call(this, line, method, args);
}

TCall.prototype = Object.create(_translate_call2.default.prototype);
TCall.prototype.constructor = TCall;

TCall.prototype.processArguments = function (sexpr) {
  var args = sexpr.params,
      hash = sexpr.hash,
      result = [];
  for (var i = 0, len = args.length; i < len; i++) {
    result.push(this.evaluateExpression(args[i]));
  }
  if (hash) {
    result.push(this.processHash(hash.pairs));
  }
  return result;
};

TCall.prototype.evaluateExpression = function (node) {
  return node.type === 'STRING' ? node.string : this.UNSUPPORTED_EXPRESSION;
};

TCall.prototype.processHash = function (pairs) {
  // we need to know about the keys so we can ensure all interpolation
  // placeholders will get a value
  var result = {},
      len = pairs.length,
      i;
  for (i = 0; i < len; i++) {
    result[pairs[i][0]] = this.UNSUPPORTED_EXPRESSION;
  }return result;
};

exports.default = TCall;
