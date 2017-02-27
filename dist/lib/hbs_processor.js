"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _handlebars = require("handlebars");

var _handlebars2 = _interopRequireDefault(_handlebars);

var _abstract_processor = require("i18nliner/dist/lib/processors/abstract_processor");

var _abstract_processor2 = _interopRequireDefault(_abstract_processor);

var _pre_processor = require("./pre_processor");

var _pre_processor2 = _interopRequireDefault(_pre_processor);

var _extractor = require("./extractor");

var _extractor2 = _interopRequireDefault(_extractor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HbsProcessor = function HbsProcessor(translations, options) {
  _abstract_processor2.default.call(this, translations, options);
};

HbsProcessor.prototype = Object.create(_abstract_processor2.default.prototype);
HbsProcessor.prototype.constructor = HbsProcessor;

HbsProcessor.prototype.defaultPattern = "**/*.hbs";
HbsProcessor.prototype.Extractor = _extractor2.default;

HbsProcessor.prototype.checkContents = function (source, path) {
  var extractor = new this.Extractor(this.preProcess(source), { path: path });
  extractor.forEach(function (key, value, context) {
    this.translations.set(key, value, context);
    this.translationCount++;
  }.bind(this));
};

HbsProcessor.prototype.sourceFor = function (file) {
  return _fs2.default.readFileSync(file);
};

HbsProcessor.prototype.preProcess = function (source) {
  var ast = _handlebars2.default.parse(source.toString());
  _pre_processor2.default.process(ast);
  return ast;
};

exports.default = HbsProcessor;
