import {assert} from "chai";
import I18nHandlebarsExtractor from "../lib/extractor";

describe("I18nExtractor", function(){

  function extract(source, scope, options) {
    options = options || {};

    var extractor = new I18nHandlebarsExtractor({
      source: source,
      scope: scope
    });

    return extractor.translations;
  }

  describe("keys", function(){
    it('allows valid string keys', function(){
      assert.deepEqual(extract('{{#t "foo"}}Foo{{/t}}'), { foo: 'Foo' });
    });

    it("raises an error if string key has spaces", function(){
      assert.throws(function(){
        extract('{{#t "foo bar"}}Foo{{/t}}');
      });
    });
  });

  describe("well-formed-ness", function(){

    it("raises an error if t calls aren't closed", function(){

      assert.throws(function(){
        extract('{{#t "foo"}}Foo{{/t}}{{#t "bar"}}whoops');
      });
    });
  });

  describe("values", function(){

    it('strips extraneous whitespace', function(){
      var value = extract('{{#t "foo"}}\t Foo\n foo\r\n\ffoo!!! {{/t}}');

      assert.deepEqual(value, { foo: 'Foo foo foo!!!' });
    });
  });

  describe("placeholders", function(){

    it('allows simple placeholders', function(){
      assert.deepEqual(extract('{{#t "foo"}}Hello {{user.name}}{{/t}}'),
                       { foo: 'Hello %{user.name}' });
    });

    it('disallows helpers', function(){
      assert.throws(function(){
        extract('{{#t "foo"}}{{call a helper}}{{/t}}');
      });
    });
  });

  describe('t calls inside block helpers', function(){

    it('still extracts keys', function(){
      assert.deepEqual(extract('{{#each foo}}{{#t "foo"}}Foo{{/t}}{{/each}}'),
                       {foo: 'Foo'});
    });
  });

  describe('wrappers', function(){

    it('infers wrappers', function(){
      var value = extract('{{#t "foo"}}Be sure to <a href="{{url}}">log in</a>. <b>Don\'t</b> you <b>dare</b> forget!!!{{/t}}');

      assert.deepEqual(value, {foo: "Be sure to *log in*. **Don't** you **dare** forget!!!"});
    });

    it('allows empty tags on either side of the wrapper', function(){
      var result = extract('{{#t "bar"}}you can <button><i class="icon-email"></i>send an email</button>{{/t}}');

      assert.deepEqual(result, {bar: 'you can *send an email*'});

      result = extract('{{#t "baz"}}this is <b>so cool!<img /></b>{{/t}}');

      assert.deepEqual(result, { baz: 'this is *so cool!*'});
    });
  });

  describe('scoping', function(){

    it('auto-scopes relative to the current scope', function(){
      assert.deepEqual(extract('{{#t "foo"}}Foo{{/t}}', 'asdf'),
                       { asdf: { foo: 'Foo' } });
    });

    it("does not auto-scope absolute keys", function(){
      var keys = extract('{{#t "#foo"}}Foo{{/t}}', 'asdf');

      assert.deepEqual(keys, { foo: 'Foo' });
    });
  });

  describe('collisions', function(){

    it('does not let you reuse a key', function(){
      assert.throws(function(){
        extract('{{#t "foo"}}Foo{{/t}}{{#t "foo"}}bar{{/t}}');
      }, /cannot reuse key/);
    });

    it('does not let you use a scope as key', function(){
      assert.throws(function(){
        extract('{{#t "foo.bar"}}bar{{/t}}{{#t "foo"}}foo{{/t}}')
      }, /used as both scope and a key/);
    });

    it('does not let you use a key as a scope', function(){
      assert.throws(function(){
        extract('{{#t "foo"}}foo{{/t}}{{#t "foo.bar"}}bar{{/t}}');
      }, /used as both scope and a key/);
    });
  });
});
