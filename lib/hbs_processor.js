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

HbsProcessor.prototype.checkContents = function(source) {
  var extractor = new Extractor(this.preProcess(source));
  extractor.forEach(function(key, value) {
    this.translations.set(key, value);
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
