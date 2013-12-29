import I18nKeyStore from "../lib/i18n_key_store";
import {assert} from "chai";

describe("I18nKeyStore", function(){

  describe('storing keys', function(){

    var store = new I18nKeyStore();

    it("doesn't allow using the same key with different values in the root", function(){

      store.set('hi', 'foo');

      assert.throws(function(){
        store.set('hi', 'bar');
      }, /cannot reuse key/);

    });

    it("doesn't throw errors when the same key is used with the same value in the root", function(){

      store.set('hi', 'foo');

      assert.doesNotThrow(function(){
        store.set('hi', 'foo');
      });
    });
  });
});
