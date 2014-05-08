/* global window */

import Handlebars from "handlebars";
import {jsdom} from "jsdom";
import Errors from "./errors";

var dom = (function(){
  if (typeof window !== 'undefined') {
    return window.document;
  } else {
    return jsdom().parentWindow.document;
  }
})();

var AST = Handlebars.AST
  , StringNode = AST.StringNode
  , HashNode = AST.HashNode
  , slice = [].slice;

var PreProcessor = {
  process: function(ast) {
    var statements = ast.statements
      , statementsLen = statements.length
      , statement
      , i;
    for (i = 0; i < statementsLen; i++) {
      statement = statements[i];
      if (statement.type !== 'block') continue;
      if (statement.mustache.id.string === "t") {
        statements[i] = this.transform(statement);
      } else {
        this.process(statement.program);
        if (statement.inverse)
          this.process(statement.inverse);
      }
    }
  },

  transform: function(node) {
    var parts = this.inferParts(node.program.statements),
        defaultValue = parts.defaultValue,
        wrappers = parts.wrappers,
        pairs;
    node = node.mustache;
    node.params.push(this.inferKey(defaultValue));
    node.params.push(new StringNode(defaultValue));
    node.isHelper = 1;
    node.sexpr.isHelper = 1;
    if (wrappers.length) {
      if (!node.hash)
        node.hash = node.sexpr.hash = new HashNode([]);
      pairs = node.hash.pairs;
      node.hash.pairs = pairs.concat(wrappers);
    }
    return node;
  },

  inferKey: function(defaultValue) {
    return new StringNode(defaultValue);
  },

  inferParts: function(statements) {
    var defaultValue = ''
      , wrappers = []
      , statementsLen = statements.length
      , statement
      , i;
    for (i = 0; i < statementsLen; i++) {
      statement = statements[i];
      if (statement.type === "block") throw new Errors.TBlockNestingError(statement.firstLine, "can't nest block expressions inside a t block");
      defaultValue += statement.string;
    }
    defaultValue = this.extractWrappers(defaultValue, wrappers, statements[0]);
    defaultValue = this.normalizeDefault(defaultValue);
    return {defaultValue: defaultValue, wrappers: wrappers};
  },

  normalizeDefault: function(string) {
    return string.replace(/\s+/g, ' ').trim();
  },

  nodesFor: function(html) {
    var div = dom.createElement('div');
    div.innerHTML = html;
    return div.childNodes;
  },

  extractWrappers: function(source, wrappers, context) {
    var result = ''
      , nodes = this.nodesFor(source)
      , nodesLen = nodes.length
      , node
      , wrapper
      , wrappedText
      , i;
    for (i = 0; i < nodesLen; i++) {
      node = nodes[i];
      if (node.nodeName === '#text' && node.nodeValue.trim()) {
        result += node.nodeValue;
      } else if ((wrappedText = this.extractText(node, context))) {
        wrapper = node.outerHTML.replace(wrappedText, "$1");
        wrappers.push(["w" + wrappers.length, new StringNode(wrapper)]);
        result += this.wrap(wrappedText, wrappers.length);
      }
    }
    return result;
  },

  extractText: function(rootNode, context) {
    var text = ''
      , nodes = slice.call(rootNode.childNodes)
      , node;
    while ((node = nodes.shift())) {
      if (node.nodeName === '#text' && node.nodeValue.trim()) {
        if (text) // there can be only one
          throw new Errors.UnwrappableContentError(context.firstLine, "multiple text nodes in html markup");
        text = node.nodeValue;
      } else if (node.childNodes.length) {
        nodes = nodes.concat(slice.call(node.childNodes));
      }
    }
    return text;
  },

  wrap: function(text, index) {
    var delimiter = new Array(index + 1).join("*");
    return delimiter + text + delimiter;
  }
};

export default PreProcessor;
