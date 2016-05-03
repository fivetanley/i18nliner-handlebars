/* global describe, it */

import {assert} from "chai";
import Handlebars from "handlebars";
import Extractor from "../lib/extractor";
import PreProcessor from "../lib/pre_processor";
import I18nliner from "i18nliner";

var Errors = I18nliner.Errors;
var TranslationHash = I18nliner.TranslationHash;

describe("Extractor", function() {
  function extract(source) {
    var ast = Handlebars.parse(source);
    PreProcessor.process(ast);
    var extractor = new Extractor(ast);
    var hash = new TranslationHash();
    extractor.forEach(function(key, value) {
      hash.set(key, value);
    });
    return hash.translations;
  }

  it("should ignore non-t calls", function() {
    assert.deepEqual(
      extract("{{foo 'Foo'}}"),
      {}
    );
  });

  it("should not extract t calls with no default", function() {
    assert.deepEqual(
      extract("{{t 'foo.foo'}}"),
      {}
    );
  });

  it("should extract valid t calls", function() {
    assert.deepEqual(
      extract("{{t 'Foo'}}"),
      {"foo_f44ad75d": "Foo"}
    );
    assert.deepEqual(
      extract("{{t 'bar' 'Baz'}}"),
      {bar: "Baz"}
    );
    assert.deepEqual(
      extract("{{t 'dog' count=count}}"),
      {"count_dogs_d378e7": {one: "1 dog", other: "%{count} dogs"}}
    );
    assert.deepEqual(
      extract("{{t 'hello %{user}' user=user.name}}"),
      {"hello_user_d1318063": "hello %{user}"}
    );
    assert.deepEqual(
      extract('{{#t}}ohai <b title="{{#t}}oh yeah{{/t}}">awesome {{user}}</b>{{/t}}'),
      {"oh_yeah_87683d6e": "oh yeah", "ohai_awesome_user_90158192": "ohai *awesome %{user}*"}
    );
  });

  it("should bail on invalid t calls", function() {
    assert.throws(function(){
      extract("{{t foo}}");
    }, Errors.InvalidSignature);
    assert.throws(function(){
      extract("{{t 'foo' foo}}");
    }, Errors.InvalidSignature);
    assert.throws(function(){
      extract("{{t 'foo' 'hello %{man}'}}");
    }, Errors.MissingInterpolationValue);
    assert.throws(function(){
      extract("{{t 'a' 'a' 'a'}}");
    });
  });
});
