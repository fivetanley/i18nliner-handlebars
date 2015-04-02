/*
 * simple handlebars AST traverser
 *
 * doesn't do anything in and of itself. add it to your object and override
 * things as needed to make it useful (e.g. override processSexpr if you
 * want to know when particular helpers are called)
 */

"use strict";

var Visitor = {
  process: function process(ast) {
    var statements = ast.statements,
        statementsLen = statements.length,
        i;
    for (i = 0; i < statementsLen; i++) {
      this.processExpression(statements[i]);
    }
  },

  processExpression: function processExpression(statement) {
    switch (statement.type) {
      case "block":
        this.process(statement.program);
        if (statement.inverse) this.process(statement.inverse);
        break;
      case "mustache":
        this.processSexpr(statement.sexpr);
        break;
      case "sexpr":
        this.processSexpr(statement);
        break;
    }
  },

  processSexpr: function processSexpr(sexpr) {
    var i, len, items;
    if (sexpr.type === "sexpr") {
      this.processExpression(sexpr.id);
      items = sexpr.params;
      for (i = 0, len = items.length; i < len; i++) {
        this.processExpression(items[i]);
      }
      if (sexpr.hash) {
        items = sexpr.hash.pairs;
        for (i = 0, len = items.length; i < len; i++) {
          this.processExpression(items[i][1]);
        }
      }
    }
  }
};

module.exports = Visitor;