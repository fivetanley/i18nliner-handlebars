"use strict";
var PreProcessor = require("./pre_processor")["default"] || require("./pre_processor");
var Extractor = require("./extractor")["default"] || require("./extractor");
var HbsProcessor = require("./hbs_processor")["default"] || require("./hbs_processor");

var I18nliner = require("i18nliner")["default"] || require("i18nliner");
I18nliner.Commands.Check.config.processors.push(HbsProcessor);

exports.PreProcessor = PreProcessor;
exports.Extractor = Extractor;