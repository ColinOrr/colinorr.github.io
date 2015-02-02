---
layout: post
title: Hello World
summary: |
  Well it's January 2015 and the snow falling outside has given me a good excuse
  to avoid my primary New Year's resolution of a bi-weekly run!  So I've decided
  to start working on my fallback resolution and setup a blog.  Self-confessed
  geek that I am, I quite enjoyed evaluating the different blogging platforms out
  there.  I looked at WordPress, Ghost and Jekyll.
---
Well it's January 2015 and the snow falling outside has given me a good excuse
to avoid my primary New Year's resolution of a bi-weekly run!  So I've decided
to start working on my fallback resolution and setup a blog.  Self-confessed
geek that I am, I quite enjoyed evaluating the different blogging platforms out
there.  I looked at WordPress, Ghost and Jekyll.

I discounted [WordPress][1] fairly quickly.  It's a comprehensive one-stop-shop
for blogging and content management; but it was too heavy weight for my simple
blog and the user interface felt a bit bloated and clunky.

[Ghost][2] was a real contender.  It was easy to setup by simply
[downloading the code][3] and running `npm install`.  The user interface is
super slick with a simple split-screen [Markdown][4] editor that shows the
Markdown on the left and a preview on the right.  The way Ghost handles images
is particularly clever, you add a placeholder for the image in your Markdown,
and an upload panel appears in situ on the preview pane where you can
drag-and-drop your image.

I had a couple of niggles with Ghost.  I couldn't get spell check to work, even
though my browser has a built in spell checker.  Although the preview is
excellent, it doesn't show your post styled in your chosen theme... in order to
see the finished article you have to publish it, which seemed a little odd.

[Jekyll][5] also uses Markdown syntax, but unlike Ghost it generates static HTML
for your site upfront so you can host it pretty much anywhere.  Jekyll is a Ruby
Gem, you install it and scaffold a template site from the command line:

    gem install jekyll
    jekyll new colinthegeek
    cd colinthegeek
    jekyll serve

This will start your new site on port 4000.  As you edit your blog article or
theme, Jekyll will monitor your files and regenerate the site each time you
save. If you're a Ruby on Rails developer Jekyll will feel very familiar.

Jekyll requires that you to add metadata to your Markdown to help the theme
generate your site.  They call this [Front Matter][6] and takes the format of
YAML at the top of you Markdown file:

    ---
    layout: post
    title: Hello World
    ---
    Well it's January 2015...

This turns out to be a really flexible approach.  I added a new **summary**
property to my posts then edited the home page template to use the summary
rather than display the entire post.  I did this without needing to extend the
framework or register the new attribute, it just worked!

When it comes time to publish your blog, you run a `jekyll build` command to
compile your Markdown posts into a static HTML site that can be hosted on a
basic HTTP server.

But here's where it gets really cool, [GitHub Pages][7] will host your Jekyll
site, for free!  You simply push your Jekyll site to a GitHub repository called
`<your_username>.github.io`, and GitHub will compile the site and make it
available on `http://<your_username>.github.io`.  They even allow you to point a
custom domain name to your site.  Thanks GitHub!

If you're interested, you can view the source code of this blog on GitHub:

[https://github.com/ColinOrr/colinorr.github.io](https://github.com/ColinOrr/colinorr.github.io).

Jekyll won't be for everyone, it's very much a developer platform for writing a
blog and the blogger must be familiar with Markdown, GitHub and Ruby to get
started.  Ghost is also a great choice with a lower barrier to entry, however,
you'd need to find somewhere to host it and think about your backup strategy
which isn't an issue when using GitHub Pages.

[1]: https://wordpress.org/
[2]: https://ghost.org/
[3]: https://ghost.org/download/
[4]: http://daringfireball.net/projects/markdown/
[5]: http://jekyllrb.com/
[6]: http://jekyllrb.com/docs/frontmatter/
[7]: https://pages.github.com/
