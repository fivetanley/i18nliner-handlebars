import {assert} from "chai";
import PreProcessor from "../lib/pre_processor";

describe("PreProcessor", function() {
  describe(".process", function() {
    it("transforms t block expressions");

    it("removes extraneous whitespace from the default");

    it("doesn't transform other block expressions");

    it("rejects malformed hbs");

    it("disallows nesting non-t block expressions in a t block expression");

    it("creates wrappers for markup");

    it("doesn't create wrappers for markup with multiple text nodes");

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
