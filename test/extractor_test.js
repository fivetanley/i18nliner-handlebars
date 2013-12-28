import {assert} from "chai";
import I18nHandlebarsExtractor from "../lib/extractor";

describe("I18nExtractor", function(){

  function extract(source, scope, options) {
    scope   = scope || 'asdf';
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

  describe('wrappers', function(){

    it('infers wrappers', function(){
      throw new Error('TODO!');
    });
  });
});
