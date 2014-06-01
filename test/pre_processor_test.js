/* global describe, it, before, after */

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
      );
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
      );
    });

    it("rejects malformed hbs", function() {
      assert.throws(function() {
        p('{{#t}}');
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
      );
    });

    it("doesn't create wrappers for markup with multiple text nodes", function() {
      assert.throws(function() {
        p("{{#t}}this is <b><i>too</i> complicated</b>{{/t}}");
      }, Errors.UnwrappableContentError);
    });

    it("reuses identical wrappers", function() {
      assert.equal(
        p('{{#t}}' +
          '  the wrappers for' +
          '  <b>these</b> <b>tags</b> are the same' +
          '{{/t}}'),
        c('{{t "key" "the wrappers for *these* *tags* are the same" w0="<b>$1</b>"}}')
      );
    });

    it("generates placeholders for inline paths", function() {
      assert.equal(
        p('{{#t}}' +
          '  Hello, {{name}}' +
          '{{/t}}'),
        c('{{t "key" "Hello, %{name}" name=name}}')
      );
    });

    it("generates placeholders for inline helpers", function() {
      assert.equal(
        p('{{#t}}' +
          '  Hello, {{pig-latin name}}' +
          '{{/t}}'),
        c('{{t "key" "Hello, %{pig_latin_name}" pig_latin_name=(pig-latin name)}}')
      );
    });

    it("concatenates inline paths in wrappers", function() {
      assert.equal(
        p('{{#t}}' +
          '  Go to <a href="/asdf" title="{{name}}">your account</a>' +
          '{{/t}}'),
        c('{{t "key" "Go to *your account*" w0=(__i18nliner_concat "<a href=\\"/asdf\\" title=\\"" (__i18nliner_escape name) "\\">$1</a>")}}')
      );
    });

    it("concatenates inline helpers in wrappers", function() {
      assert.equal(
        p('{{#t}}' +
          '  Go to <a href="/asdf" title="{{pig-latin name}}">your account</a>' +
          '{{/t}}'),
        c('{{t "key" "Go to *your account*" w0=(__i18nliner_concat "<a href=\\"/asdf\\" title=\\"" (__i18nliner_escape (pig-latin name)) "\\">$1</a>")}}')
      );
    });

    // this is really the same as the one above, but it's good to have a
    // spec for this in case the underlying implementation changes
    // dramatically
    it("transforms nested t block expressions in wrappers", function() {
      assert.equal(
        p('{{#t}}' +
          '  Go to <a href="/asdf" title="{{#t}}manage account stuffs, {{name}}{{/t}}">your account</a>' +
          '{{/t}}'),
        c('{{t "key" "Go to *your account*" w0=(__i18nliner_concat "<a href=\\"/asdf\\" title=\\"" (__i18nliner_escape (t "key" "manage account stuffs, %{name}" name=name)) "\\">$1</a>")}}')
      );
    });

    it("generates placeholders for empty markup");

    it("unescapes entities", function() {
      assert.equal(
        p('{{#t}}' +
          '  &copy; 2014 ACME Corp. All Rights Reserved. Our lawyers &gt; your lawyers' +
          '{{/t}}'),
        c('{{t "key" "© 2014 ACME Corp. All Rights Reserved. Our lawyers > your lawyers"}}')
      );
    });
  });
});
