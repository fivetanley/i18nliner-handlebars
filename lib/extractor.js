import Handlebars from "handlebars";
import I18nKeyStore from "./i18n_key_store";
import I18nBlock from "./i18n_block";

function HandlebarsExtractor(options){
  options = options || {};
  this.helperKey = options.helperKey || 't';
  this.translations = {};
  this.source = options.source;
  this.scope = options.scope;
  this.store = new I18nKeyStore({scope: this.scope});
  this.Handlebars = options.Handlebars || Handlebars;
  this.extractKeys();
}

HandlebarsExtractor.prototype.extractKeys = function(){
  var Handlebars = this.Handlebars
    , AST = Handlebars.parse(this.source)
    , helperKey = this.helperKey
    , statements = AST.statements
    , statementsLen = statements.length
    , statement
    , i
    ;

  for (i = 0; i < statementsLen; i++) {
    statement = statements[i];
    if (statement.type !== 'block') continue;
    var block = new I18nBlock({node: statement, helperKey: helperKey});
    block.extract();
    this.addTranslations(block.translations);
  }
  this.translations = this.store.translations;
};

HandlebarsExtractor.prototype.addTranslations = function(translations){
  var self = this;
  Object.keys(translations).forEach(function(translationKey){
    self.addTranslation(translationKey, translations[translationKey]);
  });
};

HandlebarsExtractor.prototype.addTranslation = function(translationKey, value){
  this.store.set(translationKey, value);
};

export default HandlebarsExtractor;
