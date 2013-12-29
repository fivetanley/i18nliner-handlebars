import Handlebars from "handlebars";
import I18nBlock from "./i18n_block";

function HandlebarsExtractor(options){
  options = options || {};
  this.helperKey = options.helperKey || 't';
  this.source = options.source;
  this.scope = options.scope;
  this.Handlebars = options.Handlebars || Handlebars;
  this.extractKeys();
}

HandlebarsExtractor.prototype.extractKeys = function(){
  var Handlebars = this.Handlebars
    , AST = Handlebars.parse(this.source)
    , BlockNode = Handlebars.AST.BlockNode
    , translations = this.translations = {}
    , helperKey = this.helperKey
    , statements = AST.statements
    , statementsLen = statements.length
    , translationBody
    , statement
    , i
    ;

  for (i = 0; i < statementsLen; i++) {
    statement = statements[i];
    if (statement.type !== 'block') continue;
    // if (statement.mustache.id.string !== helperKey) continue;
    var block = new I18nBlock({node: statement, helperKey: helperKey});
    block.extract();
    this.translations = block.translations;
  }
};
export default HandlebarsExtractor;
