---
layout: post
title: Continuous Delivery Tips
summary: |
  TODO: Summary
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

We use Ruby, more specifically [Rake](), for all of our scripting needs.  Now
choosing Rake for scripting .NET projects has raised a few eyebrows at the
office, but it actually works really well.  The [Albacore]() project extends
Rake to add tasks for building and testing .NET:

```ruby
# TODO: Albacore example
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

Continuous integration platforms like [TeamCity]() provide all sorts of fancy
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
(built using [Vagrant]()) as the TeamCity build agent.

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
# TODO: Annotated tag command
```

The `build` part of the version number is automatically generated based on the
number of commits since the last tag.  Git will tell you this when you use the
describe command:

```bash
# TODO: Git describe command
```

This approach allows you to trace a version back to the specific commit in
source control that it was built from. If you keep your code in [GitHub]() this
works with their [Releases]() feature as it also uses annotated tags in the same
manner.

## Tip #4: Quarantine flakey tests
## Tip #5: Speed is the key
## Tip #6: Read the book

[1]: http://martinfowler.com/bliki/DeploymentPipeline.html
