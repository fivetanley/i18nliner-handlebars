"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Errors = _interopRequire(require("i18nliner/dist/lib/errors"));

Errors.register("TBlockNestingError");
Errors.register("UnwrappableContentError");
Errors.register("MultipleSubExpressionsError");

module.exports = Errors;