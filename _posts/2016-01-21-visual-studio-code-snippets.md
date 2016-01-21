---
layout: post
title: 'Visual Studio Code Snippets'
summary: |
  Over the years I've developed a number of snippets to help me write unit tests
  using the MSpec framework.  After numerous requests from envious co-workers
  (actually one request from a mildly curious co-worker), I've open sourced
  them on Github.
---
Over the years I've developed a number of snippets to help me write unit tests
using the [MSpec][1] framework.  After numerous requests from envious co-workers
*(actually one request from a mildly curious co-worker)*, I've finally open
sourced them on Github:

[https://github.com/ColinOrr/vstudio-snippets](https://github.com/ColinOrr/vstudio-snippets)

Installation
------------
Run the following commands to clone the snippets from my Github repository:

```bash
cd "Documents\Visual Studio 2013\Code Snippets\Visual C#"
git clone https://github.com/ColinOrr/vstudio-snippets "My Code Snippets"
```

Visual Studio watches this folder and automatically loads the snippets, so no
need for a restart!

test
----
<img alt="test demo" width="720" height="235" data-video="/public/images/visual-studio-code-snippets/test.gif" />

The built-in `test` snippet generates an MSTest method (yuck!).  Since we use
[MSpec][1], I've replaced this snippet with an MSpec test container.

lam
---
<img alt="lam demo" width="720" height="235" data-video="/public/images/visual-studio-code-snippets/lam.gif" />

MSpec uses lambdas to link specification statements with real code.  I find them
awkward to type, especially since Visual Studio formatting goes haywire and
messes up the indentation.  The `lam` snippet fixes the indentation and drops
you straight into the lambda body, ready to start writing test code.

argnull
-------
<img alt="argnull demo" width="720" height="235" data-video="/public/images/visual-studio-code-snippets/argnull.gif" />

For production code, you can use the `argnull` snippet to speed up your argument
guards.  This snippet uses the same parameter for both the guard and the error
message, so you only have to type the argument once.  You get an extra boost
since intellisense kicks in to auto-complete the argument name.

testnull
--------
<img alt="testnull demo" width="720" height="235" data-video="/public/images/visual-studio-code-snippets/testnull.gif" />

The ying to argnull's yang, `testnull` generates a test to exercise your
argument null check.

**Note:** this test inherits from a base class called `Context` which isn't
standard MSpec.  I always create a context class for each test file to share
context and setup between multiple tests.

guid
----
<img alt="guid demo" width="720" height="235" data-video="/public/images/visual-studio-code-snippets/guid.gif" />

It can be handy to seed well known GUIDs in order to test retrieval by ID.  The  
issue is that no one can remember how may digits are in the stupid things -
`guid` snippet to the rescue!

**Note:** you can provide two sample digits in case you make it all the way up
to 10.

any
---
<img alt="any demo" width="720" height="235" data-video="/public/images/visual-studio-code-snippets/any.gif" />

More finger-gymnastics are required when using [NSubstitute's][2] catch all
argument matcher.

Bonus Boxcar Script
-------------------
<img alt="boxcar demo" width="720" height="235" data-video="/public/images/visual-studio-code-snippets/boxcar.gif" />

MSpec expects your specification statements to\_be\_in\_boxcar\_case.  This is
tedious to type compared with using the space key.  I've included a
[AutoHotKey][3] script to convert anything surrounded in double quotes on the
current line into the correct format.

  1. Install [AutoHotKey][3]
  2. Double-click on **Boxcar.ahk** in your snippets folder
  3. Create a shortcut to this file into your startup folder

Once the script is running you can press `Right-Alt + Return` to format the
current line.

[1]: https://github.com/machine/machine.specifications
[2]: http://nsubstitute.github.io
[3]: https://autohotkey.com
