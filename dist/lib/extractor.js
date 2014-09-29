"use strict";
var TCall = require("./t_call")["default"] || require("./t_call");
var Processor = require("./processor")["default"] || require("./processor");

function Extractor(ast, options){
  options = options || {};
  this.ast = ast;
  this.helperKey = options.helperKey || 't';
}

Extractor.prototype = Object.create(Processor);

Extractor.prototype.forEach = function(handler) {
  this.handler = handler;
  this.process(this.ast);
};

Extractor.prototype.processSexpr = function(sexpr) {
  Processor.processSexpr.call(this, sexpr);
  if (sexpr.id.string === this.helperKey) {
    this.processTranslateCall(sexpr);
  }
};

Extractor.prototype.processTranslateCall = function(sexpr) {
  var call = new TCall(sexpr)
    , translations = call.translations()
    , translation
    , i
    , len;
  for (i = 0, len = translations.length; i < len; i++) {
    translation = translations[i];
    this.handler(translation[0], translation[1]);
  }
};

exports["default"] = Extractor;