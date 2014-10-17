import PreProcessor from './pre_processor';
import Extractor from './extractor';
import HbsProcessor from './hbs_processor';

import I18nliner from 'i18nliner';
I18nliner.Commands.Check.config.processors.push(HbsProcessor);

export {PreProcessor, Extractor};
