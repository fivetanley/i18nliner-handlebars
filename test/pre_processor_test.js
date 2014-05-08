import {assert} from "chai";
import sinon from "sinon";
import Handlebars from "handlebars";
import Errors from "../lib/errors";
import PreProcessor from "../lib/pre_processor";

describe("PreProcessor", function() {
  before(function() {
    var StringNode = Handlebars.AST.StringNode;
    this.inferKey = sinon.stub(PreProcessor, "inferKey", function() {
      return new StringNode("key");
    });
  });

  after(function() {
    this.inferKey.restore();
  });

  describe(".process", function() {
    function p(source) {
      var ast = Handlebars.parse(source);
      PreProcessor.process(ast);
      return Handlebars.precompile(ast);
    }

    function c(source) {
      return Handlebars.precompile(source);
    }

    it("transforms t block expressions", function() {
      assert.equal(
        p('{{#t}}hello world!{{/t}}'),
        c('{{t "key" "hello world!"}}')
      );
    });

    it("removes extraneous whitespace from the default", function() {
      assert.equal(
        p('{{#t}} ohai!  lulz\t {{/t}}'),
        c('{{t "key" "ohai! lulz"}}')
      )
    });

    it("doesn't transform other block expressions", function() {
      assert.equal(
        p('{{#if foo}}' +
          '  {{#t}}Your Name{{/t}}' +
          '  <input>' +
          '{{/if}}'),
        c('{{#if foo}}' +
          '  {{t "key" "Your Name"}}' +
          '  <input>' +
          '{{/if}}')
      )
    });

    it("rejects malformed hbs", function() {
      assert.throws(function() {
        p('{{#t}}')
      });
    });

    it("disallows nesting non-t block expressions in a t block expression", function() {
      assert.throws(function() {
        p('{{#t}}{{#s}}nope{{/s}}{{/t}}');
      }, Errors.TBlockNestingError);
    });

    it("creates wrappers for markup", function() {
      assert.equal(
        p('{{#t}}' +
          '  <b>bold</b>, or even <a href="#"><i><img>combos</i></a> get wrapper\'d' +
          '{{/t}}'),
        c('{{t "key" "*bold*, or even **combos** get wrapper\'d" w0="<b>$1</b>" w1="<a href=\\"#\\"><i><img />$1</i></a>"}}')
      )
    });

    it("doesn't create wrappers for markup with multiple text nodes", function() {
      assert.throws(function() {
        p("{{#t}}this is <b><i>too</i> complicated</b>{{/t}}")
      }, Errors.UnwrappableContentError);
    });

    it("reuses identical wrappers");

    it("generates placeholders for inline expressions");

    it("concatenates inline expressions in wrappers");

    // this is really the same as the one above, but it's good to have a
    // spec for this in case the underlying implementation changes
    // dramatically
    it("transforms nested t block expressions in wrappers");

    it("generates placeholders for empty markup");

    it("unescapes entities");
  });
});
