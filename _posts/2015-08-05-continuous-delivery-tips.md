---
layout: post
title: Continuous Delivery Tips
summary: |
  I recently gave a friend some advice on setting up his first Continuous Delivery
  Pipeline.  We've been running pipelines on our .NET web projects for the last
  couple of years so I had a few tips that I'll document here for posterity.
---
I recently gave a friend some advice on setting up his first Continuous Delivery
Pipeline.  We've been running pipelines on our .NET web projects for the last
couple of years so I had a few tips that I'll document here for posterity.

A continuous delivery pipeline is the practice of breaking your automated build
and test process into a number of stages. Early stages build and unit test the
software, providing fast feedback on the basic correctness of the code. Later
stages perform lengthier tests like integration tests, performance tests and
manual exploratory testing.  Each stage provides increasing confidence, so when
a release candidate makes it to the end of the pipeline it can be deployed into
production.  For further information, check out [Martin Fowler's article][1].

## Tip #1: Use a decent scripting language

To set up a pipeline, you'll need to automate lots of tasks... and that means
writing a large number of scripts.  Currently we have scripts for:

- Building the code into binaries
- Running automated tests
- Generating documentation
- Publishing documentation
- Applying version numbers
- Changing configuration files
- Deploying web applications
- and much more...

Get used to the idea that these scripts will be first class citizens in your
codebase that need the same care and attention as your production code.

We use Ruby, more specifically [Rake][2], for all of our scripting needs.  Now
choosing Rake for scripting .NET projects has raised a few eyebrows at the
office, but it actually works really well.  The [Albacore][3] project extends
Rake to add tasks for building and testing .NET:

```ruby
build :rebuild do |b|
  b.sln    = 'MyProject.sln'
  b.target = ['Clean', 'Rebuild']

  b.prop 'Configuration', 'Release'
end
```

One of the advantages of using Rake is that you're actually writing Ruby code.
That means you can write custom tasks directly in the Rakefile using the full
power of Ruby with its clean and readable syntax.  Adding a Gemfile to your
project allows you to download third party libraries (Gems) for all kinds of
tasks such as XML manipulation, sending emails, making HTTP calls etc.

Finally, avoid declarative XML based task systems (I'm looking at you MSBuild).
Their syntax is verbose and horrible to read, especially if looping or branching
is required in your scripts. Custom tasks are generally farmed out to another
scripting language like PowerShell, or worse yet compiled into DLLs, so even the
simplest scripting task becomes a real chore.

## Tip #2: Don't marry your CI platform

Continuous integration platforms like [TeamCity][4] provide all sorts of fancy
features to entice you into a long term relationship. They can detect the type
of project in your source code and automatically build it, provide runners for
every testing framework known to mankind, even publish your libraries to package
managers and your websites to the cloud!

**Don't be tempted!**  The problem here is that the logic needed to build and
release your software gradually moves from your source controlled codebase into
your CI platform's configuration screens.

I worked on one project that totally relied on the CI server to build and
package the code.  No one knew how to do it manually if the build server was
offline - you couldn't even produce a custom build from your development
environment to use in a sales demo.

Here's the golden rule:

> Every task performed on the build server can also be done by a developer, from
the command line, on their local development environment

If you follow this rule then developers can write and test their scripts in
isolation, without interrupting the delivery pipeline.  It also makes it easier
to reproduce and debug issues with your scripts.

For us, this means that our TeamCity server simply runs a series of Rake tasks
at each stage of the delivery pipeline; and we use a clone of our development VM
(built using [Vagrant][5]) as the TeamCity build agent.

## Tip #3: Use traceable version numbers

All being well, your pipeline will be pumping out multiple release candidates
every day... one for each push that a developer makes to the repository.

Different releases will be deployed to your various test, demo and production
environments, so it's useful to have a numeric version number that can easily be
traced back to your source control.  This helps with questions such as:

> does this release include the fix for bug #99?

... and:

> is our demo server on the same version as production?

We use a fairly standard numeric version number like `v1.4.2.357` made up of
`major`.`minor`.`patch`.`build` parts.  The first three parts are set manually
by adding an annotated tag to the commit in our Git repository.

```bash
$ git tag -a v1.4.2 -m 'Tagging v1.4.2'
$ git push --tags
```

The `build` part of the version number is automatically generated based on the
number of commits since the last tag.  Git will tell you this when you use the
describe command:

```bash
$ git describe
v1.4.2-357-gec812be
```

This approach allows you to trace a version back to the specific commit in
source control that it was built from. If you keep your code in [GitHub][6] this
works with their [Releases][7] feature as it also uses annotated tags in the
same manner.

## Tip #4: Quarantine flakey tests

There's nothing worse than a non-deterministic test.  They never misbehave while
you're watching them, they can be very tricky to diagnose, and they always start
failing while you're trying to get a critical fix through the pipeline.

Setup a quarantine stage early in the project that runs after your main testing
stages, but doesn't block a release candidate from progressing through the rest
of the pipeline.  When a test starts failing intermittently, place it in the
quarantine until you have a chance to properly investigate and fix it.

There shouldn't be too many tests in the quarantine, you should be actively
working on improving their reliability, so that means the quarantine stage can
be re-run quickly, and repeatedly, until the tests go green.  If the tests
aren't passing, even after a few re-runs, then there's probably a real issue
with the functionality.

We prefer to use a quarantine instead of simply ignoring or removing the test.
There is still value in running your non-deterministic tests on a regular basis,
and it's much harder to forget about them when they are clearly visible as a
stage in your pipeline.

For further reading, check out [Eradicating Non-Determinism in Tests][8].

## Tip #5: Read the book

My final tip is to read [the book][9].  It's an excellent read that clearly
explains the practice of continuous delivery, and provides practical advice on
how to set it up.

You can also read the chapter on [deployment pipelines][10] as a free download -
what wonderful chaps!


[1]: http://martinfowler.com/bliki/DeploymentPipeline.html
[2]: http://docs.seattlerb.org/rake
[3]: https://github.com/Albacore/albacore/wiki
[4]: https://www.jetbrains.com/teamcity
[5]: https://www.vagrantup.com
[6]: https://github.com
[7]: https://github.com/blog/1547-release-your-software
[8]: http://martinfowler.com/articles/nonDeterminism.html
[9]: http://www.amazon.co.uk/dp/0321601912
[10]: http://www.informit.com/articles/article.aspx?p=1621865
