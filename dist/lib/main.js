"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var PreProcessor = _interopRequire(require("./pre_processor"));

var HbsProcessor = _interopRequire(require("./hbs_processor"));

var registerPlugin = function registerPlugin(i18nliner) {
  i18nliner.processors.HbsProcessor = HbsProcessor;
};
registerPlugin.PreProcessor = PreProcessor;

module.exports = registerPlugin;