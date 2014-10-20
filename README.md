# I18nliner

[![Build Status](https://travis-ci.org/fivetanley/i18nliner-handlebars.png)](https://travis-ci.org/fivetanley/i18nliner-handlebars)

yay readme-driven development!

## TODO

 * grunt/broccoli/etc:
   1. preprocessor (generate templates w/ all block t calls converted to inline t calls)
   2. extractor (get all inline translation strings)
      * this should probably actually be implemented in i18nliner-js; we
        can just register ourselves with it somehow
 * basic handlebars helper
 * ember support
   * bound helper support
   * ability to nest link-to (and possibly others) in a block
     translation (like we do in i18nliner.rb)
 * bower

====

I18nliner is I18n made simple.

No .js / .json translation files. Easy inline defaults. Optional keys. Easy
pluralization. Wrappers and blocks, so your templates look template-y and
your translations stay HTML-free.

## TL;DR

I18nliner lets you do stuff like this:

```handlebars
{{t "Ohai %{user}, my default translation is right here" user=user}}
```

and even this:

```handlebars
{{#t}}
  Hey {{amigo}}!
  Although I am <a href="/">linking to something</a> and have some
  <strong>bold text</strong>, the translators will see <strong><em>
  absolutely no markup</em></strong> and will only have a single
  string to translate :o
{{/t}}
```

## Features

### No more .js/.json translation files

Instead of maintaining .js/.json files and doing stuff like this:

```javascript
I18n.t('account_page_title');
```

Forget the translation file or anything in your .js files, and just do
this in your handlebars:

```handlebars
{{t "account_page_title" "My Account"}}
```

Regular I18n options follow the (optional) default translation, so you can do
the usual stuff (placeholders, etc.).

#### Okay, but don't the translators need them?

Sure, but *you* don't need to write them. Just run:

```bash
i18nliner dump
```

This extracts all default translations from your codebase, merges them with any
other ones (from pre-existing translation files), and outputs them to
`locales/generated/translations.json` (or `.js` if using i18n.js)

**TODO** grunt/broccoli instructions/links

### It's okay to lose your keys

Why waste time coming up with keys that are less descriptive than the default
translation? I18nliner makes keys optional, so you can just do this:

```javascript
{{t "My Account"}}
```

I18nliner will create a unique key based on the translation (e.g.
`'my_account'`), so you don't have to. See `I18nliner.inferred_key_format` for
more information.

This can actually be a **good thing**, because when the `en` changes, the key
changes, which means you know you need to get it retranslated (instead of
letting a now-inaccurate translation hang out indefinitely). Whether you want
to show "[ missing translation ]" or the `en` value in the meantime is up to
you.

### Wrappers and Blocks

#### The Problem

Suppose you have something like this in your template:

```handlebars
<p>
  You can <a href="/new">lead</a> a new discussion or
  <a href="/search">join</a>
</p>
```

You probably don't want the HTML as part of the translation, because it
makes things brittle and potentially insecure. At the same time, you
probably want the translators to get the entire sentence with minimal
noise. So what do you do?

#### Wrappers

I18nliner lets you specify wrappers, so you can keep HTML out the
translations, while still just having a single string needing translation:

```handlebars
<p>
  {{t "You can *lead* a new discussion or **join** an existing one."
      w0="<a href=\"/new\">$1</a>"
      w1="<a href=\"/join\">$1</a>"
  }}
</p>
```

Delimiters are increasing numbers of asterisks.

#### Blocks

But wait, there's more!

Perhaps you want your templates to look like, well, templates. Try this:

```handlebars
<p>
  {{#t}}
    Welcome to the internets, {{user.name}}
  {{/t}}
</p>
```

Or even this:

```handlebars
<p>
  {{#t}}
    <b>Ohai {{user.name}},</b>
    you can <a href="/new" title="{{some helper}}">lead</a> a new discussion or
    <a href="/search">join</a> an existing one
  {{/t}}
</p>
```

In case you're curious about the man behind the curtain, I18nliner adds a
pre-processor that turns the second example into something like this
during Handlebars parsing:

```handlebars
<p>
  {{t "some_unique_key"
      "*Ohai %{user_name}*, you can **lead** a new discussion or ***join*** an existing one."
      user_name=(user.name)
      w0="<b>$1</b>"
      w1=(__i18nliner_concat "<a href=\"/new\" title=\""
                             (__i18nliner_escape (some helper))
                             "\">$1</a>")
      w2="<a href="/search>$1</a>"
  }}
</p>
```

In other words, it will infer wrappers from your (balanced) markup, and
will create placeholders for any other (inline) handlebars expressions.
Block helpers (e.g. `{{#if cond }}...`) are *not* supported within a
block translation. The only exception to this rule is nested translation
calls, e.g. this is totally fine:

```handlebars
{{#t}}
  Be sure to
  <a href="/account/" title="{{#t}}Account Settings{{/t}}">
    set up your account
  </a>.
{{/t}}
```

**TODO** grunt/broccoli instructions/links for enabling pre-processing

#### HTML Safety

I18nliner ensures translations, interpolated values, and wrappers all play
nicely (and safely) when it comes to HTML escaping. If any translation,
interpolated value, or wrapper is HTML-safe, everything else will be HTML-
escaped.

## Related Projects

* [i18nliner (ruby)](https://github.com/jenseng/i18nliner)
* [i18nliner-js](https://github.com/jenseng/i18nliner-js)

