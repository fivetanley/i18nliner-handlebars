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
        c('{{t "key" "hello world!" i18n_inferred_key=true}}')
      );
    });

    it("transforms t block expressions with explicit keys", function(){
      assert.equal(
        p('{{#t "my_key"}}hello world!{{/t}}'),
        c('{{t "my_key" "hello world!"}}')
      );
    });

    it("removes extraneous whitespace from the default", function() {
      assert.equal(
        p('{{#t}} ohai!  lulz\t {{/t}}'),
        c('{{t "key" "ohai! lulz" i18n_inferred_key=true}}')
      );
    });

    it("doesn't transform other block expressions", function() {
      assert.equal(
        p('{{#if foo}}' +
          '  {{#t}}Your Name{{/t}}' +
          '  <input>' +
          '{{/if}}'),
        c('{{#if foo}}' +
          '  {{t "key" "Your Name" i18n_inferred_key=true}}' +
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
        c('{{t "key" "*bold*, or even **combos** get wrapper\'d" w0="<b>$1</b>" w1="<a href=\\"#\\"><i><img>$1</i></a>" i18n_inferred_key=true}}')
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
        c('{{t "key" "the wrappers for *these* *tags* are the same" w0="<b>$1</b>" i18n_inferred_key=true}}')
      );
    });

    it("generates placeholders for inline paths", function() {
      assert.equal(
        p('{{#t}}' +
          '  Hello, {{name}}' +
          '{{/t}}'),
        c('{{t "key" "Hello, %{name}" name=name i18n_inferred_key=true}}')
      );
    });

    it("generates placeholders for inline helpers", function() {
      assert.equal(
        p('{{#t}}' +
          '  Hello, {{pig-latin name}}' +
          '{{/t}}'),
        c('{{t "key" "Hello, %{pig_latin_name}" pig_latin_name=(pig-latin name) i18n_inferred_key=true}}')
      );
    });

    it("concatenates inline paths in wrappers", function() {
      assert.equal(
        p('{{#t}}' +
          '  Go to <a href="/asdf" title="{{name}}">your account</a>' +
          '{{/t}}'),
        c('{{t "key" "Go to *your account*" w0=(__i18nliner_concat "<a href=\\"/asdf\\" title=\\"" (__i18nliner_escape name) "\\">$1</a>") i18n_inferred_key=true}}')
      );
    });

    it("concatenates inline helpers in wrappers", function() {
      assert.equal(
        p('{{#t}}' +
          '  Go to <a href="/asdf" title="{{pig-latin name}}">your account</a>' +
          '{{/t}}'),
        c('{{t "key" "Go to *your account*" w0=(__i18nliner_concat "<a href=\\"/asdf\\" title=\\"" (__i18nliner_escape (pig-latin name)) "\\">$1</a>") i18n_inferred_key=true}}')
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
        c('{{t "key" "Go to *your account*" w0=(__i18nliner_concat "<a href=\\"/asdf\\" title=\\"" (__i18nliner_escape (t "key" "manage account stuffs, %{name}" name=name i18n_inferred_key=true)) "\\">$1</a>") i18n_inferred_key=true}}')
      );
    });

    it("generates placeholders for empty markup", function() {
      assert.equal(
        p('{{#t}}' +
          '  Create <input type="text" name="count"> groups' +
          '{{/t}}'),
        c('{{t "key" "Create %{input_type_text_name_count} groups" input_type_text_name_count=(__i18nliner_safe "<input type=\\"text\\" name=\\"count\\">") i18n_inferred_key=true}}')
      );
    });

    it("correctly flags safe expressions", function() {
      assert.equal(
        p('{{#t}}' +
          '  Create {{{num_input}}} groups' +
          '{{/t}}'),
        c('{{t "key" "Create %{num_input} groups" num_input=(__i18nliner_safe num_input) i18n_inferred_key=true}}')
      );
    });

    it("doesn't replace existing paths in the options hash", function() {
      assert.equal(
        p('{{#t type=../type}}Important {{type}} tip:{{/t}}'),
        c('{{t "key" "Important %{type} tip:" type=../type i18n_inferred_key=true}}')
      );
    });

    it("unescapes entities", function() {
      assert.equal(
        p('{{#t}}' +
          '  &copy; 2014 ACME Corp. All Rights Reserved. Our lawyers &gt; your lawyers' +
          '{{/t}}'),
        c('{{t "key" "© 2014 ACME Corp. All Rights Reserved. Our lawyers > your lawyers" i18n_inferred_key=true}}')
      );
    });

    if (Handlebars.VERSION < "2.") {
      it("moves the sub-expression to the front of the options hash", function() {
        assert.equal(
          p('{{#t}}' +
            '  Group {{group.name}} has {{{num_input}}} slots' +
            '{{/t}}'),
          c('{{t "key" "Group %{group_name} has %{num_input} slots" num_input=(__i18nliner_safe num_input) group_name=group.name i18n_inferred_key=true}}')
        );
      });

      it("returns an error if multiple sub-expressions are used", function() {
        // either explicit
        assert.throws(function() {
          p('{{#t}}it\'s due on {{boldify (format "date")}} on {{boldify (format "time")}}{{/t}}');
        }, Errors.MultipleSubExpressionsError);

        // or inferred from complicated wrappers
        assert.throws(function() {
          p('{{#t}}<a href="{{blueUrl}}">blue pill</a> or <a href="{{redUrl}}">red pill</a>?{{/t}}');
        }, Errors.MultipleSubExpressionsError);
      });
    }
  });
});
