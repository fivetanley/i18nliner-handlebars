import I18nliner from "i18nliner";
var Errors = I18nliner.Errors;

Errors.register('TBlockNestingError');
Errors.register('UnwrappableContentError');
Errors.register('MultipleSubExpressionsError');

export default Errors;
