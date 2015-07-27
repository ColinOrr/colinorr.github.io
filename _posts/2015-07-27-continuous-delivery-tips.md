---
layout: post
title: Continuous Delivery Tips
summary: |
  TODO: Summary
---
Recently I gave a friend some advice on setting up his first Continuous Delivery
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

[1]: http://martinfowler.com/bliki/DeploymentPipeline.html
