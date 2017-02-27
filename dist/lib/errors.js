'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _errors = require('i18nliner/dist/lib/errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_errors2.default.register('TBlockNestingError');
_errors2.default.register('UnwrappableContentError');
_errors2.default.register('MultipleSubExpressionsError');

exports.default = _errors2.default;
