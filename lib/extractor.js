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
    this.extractFromBlockNode(statement);
  }
};


HandlebarsExtractor.prototype.extractFromBlockNode = function(node){
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
    this.parseBody(node.program.statements, false);
  }
};

HandlebarsExtractor.prototype.domFromHTML = function(html){
  var div = this.dom.createElement('div');
  div.innerHTML = html;
  return div.childNodes;
};


var WRAPPABLE_TAGS = [ 'A', 'B', 'BUTTON' ];

function wrappableTagsInclude(tagName){
  return WRAPPABLE_TAGS.indexOf(tagName) > -1;
}

function wrapperForTag(len) {
  var string = '*';
  for (var i = 1; i < len; i++) {
    string += '*';
  }
  return string;
}

HandlebarsExtractor.prototype.extractWrappers = function(nodes, body, len, lastEncounteredTag){
  var nodesLen = nodes.length
    , node
    , i
    , text
    , wrapper;

  len = len || 0;
  len++;

  for (i = 0; i < nodesLen; i++){
    node = nodes[i];
    if (node.childNodes && node.childNodes.length) {
      if (wrappableTagsInclude(node.nodeName) && this.lastEncounteredTag !== node.nodeName) {
        len++;
      }
      wrapper = wrapperForTag(len);
      body += wrapper + this.extractWrappers(node.childNodes, '', len, lastEncounteredTag) + wrapper;
      this.lastEncounteredTag = node.nodeName;
    } else {
      text = node.nodeValue;
      body += text || '';
    }
  }
  return body;
};

HandlebarsExtractor.prototype.parseBody = function(statements, insideTranslationCall) {
  var statementsLen = statements.length
    , statement
    , i
    , body = ''
    , html
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
    } else if (statement.type === 'block' && !insideTranslationCall) {
      this.extractFromBlockNode(statement);
    }
  }

  return body.replace(EXTRANEOUS_WHITESPACE, ' ').trim();
}

export default HandlebarsExtractor;
