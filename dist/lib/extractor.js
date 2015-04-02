"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var TCall = _interopRequire(require("./t_call"));

var Visitor = _interopRequire(require("./visitor"));

function Extractor(ast, options) {
  options = options || {};
  this.ast = ast;
  this.helperKey = options.helperKey || "t";
}

Extractor.prototype = Object.create(Visitor);

Extractor.prototype.forEach = function (handler) {
  this.handler = handler;
  this.process(this.ast);
};

Extractor.prototype.processSexpr = function (sexpr) {
  Visitor.processSexpr.call(this, sexpr);
  if (sexpr.id.string === this.helperKey) {
    this.processTranslateCall(sexpr);
  }
};

Extractor.prototype.buildTranslateCall = function (sexpr) {
  return new TCall(sexpr);
};

Extractor.prototype.processTranslateCall = function (sexpr) {
  var call = this.buildTranslateCall(sexpr),
      translations = call.translations(),
      translation,
      i,
      len;
  for (i = 0, len = translations.length; i < len; i++) {
    translation = translations[i];
    this.handler(translation[0], translation[1], call);
  }
};

module.exports = Extractor;