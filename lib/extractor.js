import Handlebars from "handlebars";

var EXTRANEOUS_WHITESPACE = /\s+/g;
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
    , INVALID_KEY = /\s/
    , translationKey
    , statement
    , i
    ;

  for (i = 0; i < statementsLen; i++) {
    statement = statements[i];
    if (statement.type !== 'block') continue;
    if (statement.mustache.id.string !== helperKey) continue;
    translationKey = statement.mustache.params[0].string;

    if (!translationKey || INVALID_KEY.test(translationKey)){
      throw new Error("Invalid translation key! " + translationKey);
    }

    translations[translationKey] = parseBody(statement.program.statements);
  }
};

function parseBody(statements){
  var statementsLen = statements.length
    , statement
    , i
    , body = ''
    ;

  for (i = 0; i< statementsLen; i++){
    statement = statements[i];
    if (statement.type === 'content') {
      body += ' ' + statement.string;
    } else if (statement.type === 'mustache') {
      if (statement.eligibleHelper) {
        throw new Error("Helpers may not be used inside the translation block helper!");
      }
      // turn {{nested.value}} into %{nested.value}}
      body += ' %{' + statement.id.string + '}'
    }
  }

  return body.replace(EXTRANEOUS_WHITESPACE, ' ').trim();
}

export default HandlebarsExtractor;
