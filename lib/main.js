import PreProcessor from './pre_processor';
import HbsProcessor from './hbs_processor';

var registerPlugin = function(i18nliner) {
  i18nliner.processors.HbsProcessor = HbsProcessor;
}
registerPlugin.PreProcessor = PreProcessor;

export default registerPlugin;
