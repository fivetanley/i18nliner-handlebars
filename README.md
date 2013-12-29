i18ninliner-handlebars
======================

[![Build Status](https://travis-ci.org/fivetanley/i18ninliner-handlebars.png)](https://travis-ci.org/fivetanley/i18ninliner-handlebars)

i18ninline, but for your handlebars templates

## What does it do?

`I18nHandlebarsExtractor` will go through a Handlebars template and extract
I18n keys for you. Here's the basic gist:

```handlebars
{{#t "foo"}}Foo{{/t}}
```

becomes something like this available on your extractor instance's
`translations` property...

```javascript
var extractor = new I18nHandlebarsExtractor({source: template});
extractor.translations; // => { foo: 'Foo' }
```

Basically, we want the same functionality that [I18nliner][i18nliner] has.

## TODO

* Throw errors on malformed markup
* Add useful line number information since it's now possible to get that
information from the Handlebars compiler([link](https://github.com/wycats/handlebars.js/pull/692)).
* Get wrappers working better. We need to be able to hang on to the original
HTML
* Moar tests


<!-- links -->
[i18nliner]: https://github.com/jenseng/i18nliner
