'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pre_processor = require('./pre_processor');

var _pre_processor2 = _interopRequireDefault(_pre_processor);

var _hbs_processor = require('./hbs_processor');

var _hbs_processor2 = _interopRequireDefault(_hbs_processor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var registerPlugin = function registerPlugin(i18nliner) {
  i18nliner.processors.HbsProcessor = _hbs_processor2.default;
};
registerPlugin.PreProcessor = _pre_processor2.default;

exports.default = registerPlugin;
