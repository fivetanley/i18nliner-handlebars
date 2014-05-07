import Handlebars from "handlebars";
import Errors from "./errors";

var AST = Handlebars.AST
  , StringNode = AST.StringNode;

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
    var defaultValue = this.inferDefault(node.program.statements);
    node = node.mustache;
    node.params.push(this.inferKey(defaultValue.string));
    node.params.push(defaultValue);
    node.isHelper = 1;
    node.sexpr.isHelper = 1;
    return node;
  },

  inferKey: function(defaultValue) {
    return new StringNode(defaultValue);
  },

  inferDefault: function(statements) {
    var string = ''
      , statementsLen = statements.length
      , statement
      , i;
    for (i = 0; i < statementsLen; i++) {
      statement = statements[i];
      if (statement.type === "block") throw new Errors.TBlockNestingError(statement.firstLine, "can't nest block expressions inside a t block");
      string += statement.string;
    }
    string = this.normalizeDefault(string);
    return new StringNode(string);
  },

  normalizeDefault: function(string) {
    return string.replace(/\s+/g, ' ').trim();
  }
}

export default PreProcessor;
