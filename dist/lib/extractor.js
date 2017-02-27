"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _t_call = require("./t_call");

var _t_call2 = _interopRequireDefault(_t_call);

var _visitor = require("./visitor");

var _visitor2 = _interopRequireDefault(_visitor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Extractor(ast, options) {
  options = options || {};
  this.ast = ast;
  this.helperKey = options.helperKey || 't';
}

Extractor.prototype = Object.create(_visitor2.default);

Extractor.prototype.forEach = function (handler) {
  this.handler = handler;
  this.process(this.ast);
};

Extractor.prototype.processSexpr = function (sexpr) {
  _visitor2.default.processSexpr.call(this, sexpr);
  if (sexpr.id.string === this.helperKey) {
    this.processTranslateCall(sexpr);
  }
};

Extractor.prototype.buildTranslateCall = function (sexpr) {
  return new _t_call2.default(sexpr);
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

exports.default = Extractor;
