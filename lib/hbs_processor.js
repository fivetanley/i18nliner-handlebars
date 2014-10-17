import fs from "fs";
import Handlebars from "handlebars";
import AbstractProcessor from "i18nliner/dist/lib/processors/abstract_processor";

import PreProcessor from "./pre_processor";
import Extractor from "./extractor";

var HbsProcessor = function(translations, options) {
  AbstractProcessor.call(this, translations, options);
};

HbsProcessor.prototype = Object.create(AbstractProcessor.prototype);
HbsProcessor.prototype.constructor = HbsProcessor;

HbsProcessor.prototype.defaultPattern = "**/*.hbs";
HbsProcessor.prototype.Extractor = Extractor;

HbsProcessor.prototype.checkContents = function(source, path) {
  var extractor = new this.Extractor(this.preProcess(source), {path: path});
  extractor.forEach(function(key, value, context) {
    this.translations.set(key, value, context);
    this.translationCount++;
  }.bind(this));
};

HbsProcessor.prototype.sourceFor = function(file) {
  return fs.readFileSync(file);
};

HbsProcessor.prototype.preProcess = function(source) {
  var ast = Handlebars.parse(source.toString());
  PreProcessor.process(ast);
  return ast;
};

export default HbsProcessor;
