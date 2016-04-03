---
layout: post
title: 'Regex Find & Replace'
summary: |
  I repeatedly forget and rediscover this powerful technique for finding and
  replacing  text.

  I wanted to change the name of a CSS class across a large codebase.  A simple
  approach would be to find and replace for all \*.html files:
---
I repeatedly forget and rediscover this powerful technique for finding and
replacing  text.

I wanted to change the name of a CSS class across a large codebase.  A simple
approach would be to find and replace for all \*.html files:

```
Find:    class="selected"
Replace: class="active"
```

But this doesn't cope with elements with multiple CSS classes:

```
class="selected"
class="btn selected"
class="selected link"
class="selected-item"    « this one needs to be left alone
class="item-selected"    « as does this one
```

The solution was to use regular expression find and replace (this feature is
available in most editors, usually enabled by toggling the `.*` button).  Regex
capture groups can be added to match the other CSS classes:

```
Find:    class="(.+\s)?selected(\s|")
Replace: class="$1active$2
```

Strings captured by the regular expressions be added back into the replacement
text by using the dollar - `$1` and `$2` in the example above.  If you want to
brush up on your regular expressions, check out the [Regex Crossword][1] it's
like Sudoku for uber geeks!

[1]: https://regexcrossword.com/
