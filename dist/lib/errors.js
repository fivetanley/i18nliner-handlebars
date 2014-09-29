"use strict";
var Errors = {};
function addError(name) {
  Errors[name] = function(line, details) {
    this.line = line;
    this.details = details;
    this.name = name;
  };
}

addError('TBlockNestingError');
addError('UnwrappableContentError');

exports["default"] = Errors;