"use strict";
var I18nliner = require("i18nliner")["default"] || require("i18nliner");
var TranslateCall = I18nliner.TranslateCall
  , CallHelpers   = I18nliner.CallHelpers;

/*
 * little wrapper around I18nliner.TranslateCall
 *
 * normalizes args/etc into literals that TranslateCall can deal with
 */
function TCall(sexpr) {
  var line = sexpr.firstLine
    , method = sexpr.string
    , args = this.processArguments(sexpr);
  this.translateCall = new TranslateCall(line, method, args);
}

TCall.prototype.UNSUPPORTED_EXPRESSION = CallHelpers.UNSUPPORTED_EXPRESSION;

TCall.prototype.processArguments = function(sexpr) {
  var args = sexpr.params
    , hash = sexpr.hash
    , result = [];
  for (var i = 0, len = args.length; i < len; i++) {
    result.push(this.evaluateExpression(args[i]));
  }
  if (hash) {
    result.push(this.processHash(hash.pairs));
  }
  return result;
};

TCall.prototype.evaluateExpression = function(node) {
  switch (node.type) {
    case 'STRING':
      return node.string;
  }
  return this.UNSUPPORTED_EXPRESSION;
};

TCall.prototype.processHash = function(pairs) {
  // we need to know about the keys so we can ensure all interpolation
  // placeholders will get a value
  var result = {}
    , len = pairs.length
    , i;
  for (i = 0; i < len; i++)
    result[pairs[i][0]] = this.UNSUPPORTED_EXPRESSION;
  return result;
};

TCall.prototype.translations = function() {
  return this.translateCall.translations();
};

exports["default"] = TCall;