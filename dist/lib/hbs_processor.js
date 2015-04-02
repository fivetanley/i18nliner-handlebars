"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var fs = _interopRequire(require("fs"));

var Handlebars = _interopRequire(require("handlebars"));

var AbstractProcessor = _interopRequire(require("i18nliner/dist/lib/processors/abstract_processor"));

var PreProcessor = _interopRequire(require("./pre_processor"));

var Extractor = _interopRequire(require("./extractor"));

var HbsProcessor = function HbsProcessor(translations, options) {
  AbstractProcessor.call(this, translations, options);
};

HbsProcessor.prototype = Object.create(AbstractProcessor.prototype);
HbsProcessor.prototype.constructor = HbsProcessor;

HbsProcessor.prototype.defaultPattern = "**/*.hbs";
HbsProcessor.prototype.Extractor = Extractor;

HbsProcessor.prototype.checkContents = function (source, path) {
  var extractor = new this.Extractor(this.preProcess(source), { path: path });
  extractor.forEach((function (key, value, context) {
    this.translations.set(key, value, context);
    this.translationCount++;
  }).bind(this));
};

HbsProcessor.prototype.sourceFor = function (file) {
  return fs.readFileSync(file);
};

HbsProcessor.prototype.preProcess = function (source) {
  var ast = Handlebars.parse(source.toString());
  PreProcessor.process(ast);
  return ast;
};

module.exports = HbsProcessor;