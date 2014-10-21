"use strict";
var I18nliner = require("i18nliner")["default"] || require("i18nliner");
var Errors = I18nliner.Errors;

Errors.register('TBlockNestingError');
Errors.register('UnwrappableContentError');
Errors.register('MultipleSubExpressionsError');

exports["default"] = Errors;