import Handlebars from "handlebars";

var EXTRANEOUS_WHITESPACE = /\s+/g;
var INVALID_KEY = /\s/;

var dom = require('jsdom').jsdom().parentWindow.document;

function HandlebarsExtractor(options){
  options = options || {};
  this.helperKey = options.helperKey || 't';
  this.source = options.source;
  this.scope = options.scope;
  this.Handlebars = options.Handlebars || Handlebars;
  this.dom = dom;
  this.extractKeys();
}

function I18nBlock(options){
  options = options || {};
  this.node = options.node;
  this.helperKey = options.helperKey;
  this.wrappers = {};
  this.translations = {};
}

I18nBlock.prototype.extract = function i18nBlock_extract(){
  var node = this.node;
  var translationKey = node.mustache.params[0].string;

  if (!translationKey || INVALID_KEY.test(translationKey)){
    throw new Error("Invalid translation key! " + translationKey);
  }

  if (node.mustache.id.string === this.helperKey) {
    var body = this.parseBody(node.program.statements, true);
    var nodes = this.domFromHTML(body);
    body = this.extractWrappers(nodes, '');
    this.translations[translationKey] = body;
  } else {
    this.parseBody();
  }
};

I18nBlock.prototype.domFromHTML = function i18nBlock_domFromHTML(html){
  var div = dom.createElement('div');
  div.innerHTML = html;
  return div.childNodes;
};

I18nBlock.prototype.extractWrappers = function i18nBlock_extractWrappers(nodes){
  var nodesLen = nodes.length
    , node
    , i
    , text
    , wrapper
    , body = '';

  for (i = 0; i < nodesLen; i++){
    node = nodes[i];
    if (node.childNodes && node.childNodes.length) {
      wrapper = this.wrappers[node.nodeName];
      if (!wrapper) {
        wrapper = this.wrappers[node.nodeName] = wrapperForTag(Object.keys(this.wrappers).length + 1);
      }
      body += wrapper + this.extractWrappers(node.childNodes) + wrapper;
    } else {
      text = node.nodeValue;
      body += text || '';
    }
  }
  return body;

};

I18nBlock.prototype.parseBody = function i18nBlock_parseBody(){
  var statements = this.node.program.statements
    , statementsLen = statements.length
    , statement
    , i
    , body = ''
    ;

  for (i = 0; i< statementsLen; i++){
    statement = statements[i];
    if (statement.type === 'content') {
      body += statement.string;
    } else if (statement.type === 'mustache') {
      if (statement.eligibleHelper && statement.params && statement.params.length) {
        throw new Error("Helpers may not be used inside the translation block helper!");
      }
      // turn {{nested.value}} into %{nested.value}
      body += ' %{' + statement.id.string + '}'
    } else if (statement.type === 'block') {
      var block = new I18nBlock({node: statement, helperKey: this.helperKey});
      block.extract();
      Object.keys(block.translations).forEach(function(key){
        this.translations[key] = block.translations[key];
      }.bind(this));
    }
  }

  return body.replace(EXTRANEOUS_WHITESPACE, ' ').trim();
  
};

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

function wrapperForTag(len) {
  var string = '*';
  for (var i = 1; i < len; i++) {
    string += '*';
  }
  return string;
}

export default HandlebarsExtractor;
