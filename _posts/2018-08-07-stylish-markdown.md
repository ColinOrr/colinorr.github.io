---
layout: post
title: Stylish Markdown
summary: |
  I love Markdown... I mean, who doesn't?  I use it for everything: wiki pages, release notes, API documentation, deployment guides, to do lists for my wife.  Ok maybe not that last one, I'm usually *the recipient* of the to do lists!
---
I love Markdown... I mean, who doesn't?  I use it for everything: wiki pages, release notes, API documentation, deployment guides, to do lists for my wife.  Ok maybe not that last one, I'm usually *the recipient* of the to do lists!

When distributing documentation as part of a release, we tend to convert the Markdown into HTML with hyperlinks, logos, fonts and colour schemes; then use [wkhtmltopdf][1] to convert it into a PDF.

Recently I've been trialing a different approach - wrapping the Markdown inside a thin layer of HTML, then converting it into HTML on the fly using JavaScript.  The advantage is that the document remains *diff-able*, so the recipient can compare the current document with a previous version by using standard text-based differencing tools on the HTML source code (which is mainly Markdown).

This approach is really useful for things like API specifications, were every small change needs to be carefully scrutinised. With PDF documents you usually only have a few short entries in a version table (if you're lucky).

<p data-height="450" data-theme-id="dark" data-slug-hash="BPqQXm" data-default-tab="html,result" data-user="colinthegeek" data-pen-title="Stylish Markdown" class="codepen">See the Pen <a href="https://codepen.io/colinthegeek/pen/BPqQXm/">Stylish Markdown</a> by Colin The Geek (<a href="https://codepen.io/colinthegeek">@colinthegeek</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
<br />

The Markdown is nested inside a script tag with a custom `text/markdown` type.  Keeping it inside a script tag is important, it means the browser won't try to HTML encode any special characters in the Markdown.  The JavaScript is pretty simple, it finds all of the Markdown scripts, uses [Showdown][2] to convert them into HTML, then places them into the same location in the document.  I've added an `unindent` function that trims out any leading white space so the Markdown can be indented properly within the HTML.

Then you can apply your own CSS to give your document a bit of style!  In my example I'm using some [GitHub CSS][3] maintained by Sindre Sorhus, looks the part!

[1]: https://wkhtmltopdf.org/
[2]: https://github.com/showdownjs/showdown
[3]: https://github.com/sindresorhus/github-markdown-css
