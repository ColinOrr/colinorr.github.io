---
layout: post
title: 'Introducing Penfold'
summary: |
  I've convinced myself that .NET needs a new behaviour driven development
  library.  Here are my simple demands:
---
I've convinced myself that .NET needs a new behaviour driven development
library.  Here are my simple demands:

  1. Specification statements that can be written with spaces, punctuation and,
     most importantly, emojis 😜.

  2. Nested contexts that can group assertions into logical collections and
     share variables, setup code and scope.

  3. Support for different styles of specification, or even the ability to roll
     your own specification DSL.

  4. The option to enhance the textual output of the specification with extra
     information and comments.

Now I know that RSpec, Jasmine and Mocha tick all of these boxes, but I haven't
found a satisfactory alternative for .NET.  So I've had a crack at writing one -
It's called [Penfold][1] and is available now on [Nuget][2].

```c#
[TestFixture]
public class CalculatorSpecification : Specification
{
    public CalculatorSpecification()
    {
        var calculator = new Calculator();

        before_each = () => calculator.Clear();

        describe["Addition"] = () =>
        {
            context["adding two and three"] = () =>
            {
                before = () => calculator.Key(2).Add(3);

                it["sets the total to five"] = () =>
                {
                    calculator.Total.ShouldEqual(5);
                };

                it["sets the equation history to:"] = () =>
                {
                    log(calculator.Equation.ShouldEqual("2 + 3"));
                };
            };

            context["adding two, three and four"] = () =>
            {
                before = () => calculator.Key(2).Add(3).Add(4);

                it["sets the total to nine"] = () =>
                {
                    calculator.Total.ShouldEqual(9);
                };

                it["sets the equation history to:"] = () =>
                {
                    log(calculator.Equation.ShouldEqual("2 + 3 + 4"));
                };
            };
        };
    }
}
```

which outputs the following to the console:

```
CalculatorSpecification
  Addition
    adding two and three
      sets the total to five
      sets the equation history to:
        2 + 3
    adding two, three and four
      sets the total to nine
      sets the equation history to:
        2 + 3 + 4
```

Note: if you check out my [calculator implementation][3], you'll see that I'm
not expecting to be head-hunted by Casio any time soon!

## The Basics

Penfold specifications inherit from a `Specification` base class and are
written in the default constructor.  Each specification must have at least one
assertion to be executed, so the bare minimum would be:

```c#
[TestFixture]
public class CalculatorSpecification : Specification
{
    public CalculatorSpecification()
    {
        it["can add two numbers together"] = () =>
        {
            new Calculator().Key(1).Add(2).Total.ShouldEqual(3);
        };
    }
}
```

You'll probably recognize the `[TestFixture]` annotation - that's because
Penfold is built on top of good old NUnit so in theory you can use any test
runner that supports NUnit<sup><a href="#1">\[1\]</a></sup>.

Penfold doesn't include an assertion library, all of the code in this article
uses my favourite - [Machine.Specifications.Should][4], but you can use any
assertion framework you like.

Assertions can be grouped together inside a context where they share variables
and setup code.  Contexts are defined by using the `describe` and `context`
keywords:

```c#
describe["Addition"] = () =>
{
    var calculator = new Calculator();

    context["adding two and three"] = () =>
    {
        before = () => calculator.Key(2).Add(3);

        it["sets the total to five"] = () =>
        {
            calculator.Total.ShouldEqual(5);
        };

        it["sets the equation history to '2 + 3'"] = () =>
        {
            calculator.Equation.ShouldEqual("2 + 3");
        };
    };

    context["adding two, three and four"] = () =>
    {
        ...
```

The calculator variable is scoped to the "Addition" context, it can be accessed
from within the nested test steps but is not available outside of the describe
block.

## Gherkin Syntax

Penfold also supports Gherkin syntax:

```c#
[TestFixture]
public class CalculatorFeature : Specification
{
    public CalculatorFeature()
    {
        var calculator = new Calculator();

        comment = @"
            as a math idiot
            I want to use a calculator
            so I don't make mistakes with simple arithmetic
        ";

        Scenario["Addition"] = () =>
        {
            Given["I have pressed clear"]    = () => calculator.Clear();
            When["I key in two"]             = () => calculator.Key(2);
            When["I add three"]              = () => calculator.Add(3);
            Then["the total is five"]        = () => calculator.Total.ShouldEqual(5);
            Then["the equation history is:"] = () => log(calculator.Equation.ShouldEqual("2 + 3"));
        };

        Scenario["Division"] = () =>
        {
            Given["I have pressed clear"]    = () => calculator.Clear();
            When["I key in twelve"]          = () => calculator.Key(12);
            When["I divide by four"]         = () => calculator.Divide(4);
            Then["the total is three"]       = () => calculator.Total.ShouldEqual(3);
            Then["the equation history is:"] = () => log(calculator.Equation.ShouldEqual("12 / 4"));
        };
    }
}
```

which outputs the following to the console:

```
CalculatorFeature
  as a math idiot
  I want to use a calculator
  so I don't make mistakes with simple arithmetic
  Scenario: Addition
    Given I have pressed clear
    When I key in two
    When I add three
    Then the total is five
    Then the equation history is:
      2 + 3
  Scenario: Division
    Given I have pressed clear
    When I key in twelve
    When I divide by four
    Then the total is three
    Then the equation history is:
      12 / 4
```

In the example above I've used inline lambdas for the step definitions to aid
readability, but you can still use block lambdas for multiple lines of code.

Penfold actually makes it really easy to specify your own keywords, but that's a
blog for a different day.  If you're interested, checkout the [Specification.cs][5]
source code to see how the standard keywords are defined.

## Logging

Sometimes you end up repeating yourself between the specification statement and
the code.  For example:

```c#
it["sets the equation history to '2 + 3'"] = () =>
{
    calculator.Equation.ShouldEqual("2 + 3");
};
```

The `log` method allows you to enrich the specification output from within the
code, so the example above could be rewritten as:

```c#
it["sets the equation history to:"] = () =>
{
    var expected = "2 + 3";
    log(expected);
    calculator.Equation.ShouldEqual(expected);
};
```

which results in the following output:

```
sets the equation history to:
  2 + 3
```

One of the cool features of Machine.Specifications.Should is that the
`ShouldEqual` extension returns the expected string, so we can rewrite this as a
one-liner:

```c#
it["sets the equation history to:"] = () =>
{
    log(calculator.Equation.ShouldEqual("2 + 3"));
};
```

## Ignored, Pending & Categorization

You can ignore a step by using the `x` or `@ignore` keywords.  Individual steps
can be ignored, or you can ignore an entire context.

```c#
x = it["I'm being ignored"] = () =>
{
    ...
};

@ignore = it["so am I!"] = () =>
{
    ...
};
```

Steps which haven't been implemented can be marked as pending by setting their
action to null:

```c#
it["I'm not implemented yet"] = null;
```

This flags the step as inconclusive to the test runner and outputs:

```
I'm not implemented yet [PENDING]
```

Finally, categories can be added by using the following syntax:

```c#
@_["Category A"] =
@_["Category B"] =
it["does something"] = () =>
{
    ...
};
```

Categories can be applied to individual assertions, or to an entire context.

## Expecting Exceptions

You can use the `Catch` method as an easy way to catch an exception and return
it:

```c#
context["dividing by zero"] = () =>
{
    it["explodes 💣💥☠️"] = () =>
    {
        Catch(() => calculator.Key(2).Divide(0))
            .ShouldBeOfExactType<DivideByZeroException>();
    };
};
```

I told you there'd be emojis!

## Summary

This started out as a bit of an experiment, but I'm quite happy with the result.
I plan to try it on a couple of side projects and see how it goes.

One minor niggle is that Visual Studio doesn't support code folding on the
lambda expressions.  Once a specification gets long enough, it's useful to be
able to fold away certain contexts that you aren't interested in.  I've found
the [C# outline extension][6] which sorts this out.

If you decide to use Penfold on your own project, please give the repo a star on
[GitHub][1] so that I know it's being used.

Oh and why call it Penfold?  Because unlike Danger Mouse, he needs specs!

--------------------------------------------------------------------------------

<sup id="1">\[1\]</sup> I've had some difficulty with TestDriven.net, it can't
identify the tests because they are specified inside the class constructor. I've
developed an [adapter][7] that allows the specification to be executed, but it
can only execute the whole specification and not individual assertions or
contexts.

[1]: https://github.com/ColinOrr/penfold
[2]: https://www.nuget.org/packages/penfold
[3]: https://github.com/ColinOrr/penfold/blob/master/Tests/Examples/Calculator.cs
[4]: https://www.nuget.org/packages/Machine.Specifications.Should
[5]: https://github.com/ColinOrr/penfold/blob/master/Penfold/Specification.cs
[6]: https://visualstudiogallery.msdn.microsoft.com/4d7e74d7-3d71-4ee5-9ac8-04b76e411ea8
[7]: https://www.nuget.org/packages/Penfold.TestDriven
