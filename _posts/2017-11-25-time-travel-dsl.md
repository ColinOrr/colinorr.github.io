---
layout: post
title: Time Travel DSL
summary: |
  I've designed a little domain specific language in C# to manage changes to
  the system clock.  The objective was to simulate a sequence of transactions
  running against my domain model with realistic time intervals between each
  transaction.
---
I've designed a little [domain specific language][1] in C# to manage changes to
the system clock.  The objective was to simulate a sequence of transactions
running against my domain model with realistic time intervals between each
transaction.

An example use case would be building an order history:

```c#
using (TimeTravel.To(2.MonthsAgo()))
{
    var order = Order.Create();

    using (TimeTravel.Forward(45.To(60).Minutes()))
    {
        order.Submit();

        using (TimeTravel.Forward(4.To(6).Days() + 2.To(8).Hours()))
        {
            order.Dispatch();
        }
    }

    Console.WriteLine(order.ReportHistory());
}

// Outputs:
//   Created - 25/09/2017 11:33
//   Submitted - 25/09/2017 12:25
//   Dispatched - 30/09/2017 17:25
```

A well designed DSL should make the code easier to understand and reason
about.  Although C# isn't the most expressive language on the block, it still
has some nice features that can be used to design an internal DSL.

## Encapsulating DateTime.Now

The first step to achieve time travel (other than finding a flux capacitor) is
to encapsulate the standard .NET system clock so you can offset the current
time:

```c#
public static class SystemTime
{
    public static TimeSpan Offset;
    public static DateTime Now { get { return DateTime.Now + Offset; } }
    public static DateTime Today { get { return SystemTime.Now.Date; } }
}
```

[TimeSpan][2] is a standard .NET struct that represents a time interval in days,
hours, minutes and seconds.  They can be added or subtracted from a date and
time, I'm using one above to offset `DateTime.Now`.

Now you can refactor all of your domain logic to use `SystemTime.Now` and
`SystemTime.Today` instead of *DateTime.Now* and *DateTime.Today*.  During
normal operations the offset will be zero so these properties will return the
current date and time.

## TimeSpan extension methods

The next step is to use extension methods to build a succinct language for
expressing time spans:

```c#
// for example: 45.Minutes()
public static TimeSpan Minutes(this int value)
{
    return TimeSpan.FromMinutes(value);
}

// for example: 8.Hours()
public static TimeSpan Hours(this int value)
{
    return TimeSpan.FromHours(value);
}

// for example: 4.Days()
public static TimeSpan Days(this int value)
{
    return TimeSpan.FromDays(value);
}
```

The nice thing about time spans is that they can be added together to allow us
to compose more complex expressions using our DSL:

```c#
4.Days() + 6.Hours() + 45.Minutes()
```

In the order history example above, I use another extension to simulate
random, but realistic, time intervals like `45.To(60).Minutes()`:

```c#
public static int To(this int start, int end)
{
    var range  = Enumerable.Range(start, end - start);
    var random = new Random();
    return range.ElementAt(random.Next(range.Count()));
}
```

Chaining this with the TimeSpan extension methods makes our time interval
code read like a normal English sentence... if you ignore all the full stops and
brackets.

My [Generating Sample Data][3] article has more tips for generating random data.

## Scoping the time travel

We can make use of the `using` statement to provide a scope for our time travel,
ensuring we don't get stuck in the past.  Nesting the using statements provides
a convenient way do relative jumps through time:

```c#
// SystemTime.Now = 12:00

using (TimeTravel.Forward(5.Minutes))
{
    // SystemTime.Now = 12:05

    using (TimeTravel.Back(3.Minutes))
    {
        // SystemTime.Now = 12:02
    }

    // SystemTime.Now = 12:05
}

// SystemTime.Now = 12:00
```

The trick here is to write a class that implements [IDisposable][4].  The
constructor captures the current `SystemTime.Offset` before any changes are
made... then when the class is disposed (as it exits the using block) it
restores the original offset.

```c#
public class TimeTravel : IDisposable
{
    private readonly TimeSpan previousOffset;

    public TimeTravel()
    {
        previousOffset = SystemTime.Offset;
    }

    public void Dispose()
    {
        SystemTime.Offset = previousOffset;
    }
}
```

The last piece of the puzzle is a few static methods on our `TimeTravel` class
to adjust the offset:

```c#
// for example: TimeTravel.Forward(5.Minutes())
public static TimeTravel Forward(TimeSpan offset)
{
    var token = new TimeTravel();
    SystemTime.Offset += offset;
    return token;
}

// for example: TimeTravel.Back(5.Days())
public static TimeTravel Back(TimeSpan offset)
{
    var token = new TimeTravel();
    SystemTime.Offset -= offset;
    return token;
}
```

You can find a full copy of the code used in this article on [this gist][5].

[1]: https://martinfowler.com/books/dsl.html
[2]: https://docs.microsoft.com/en-us/dotnet/api/system.timespan
[3]: /2017/02/01/generating-sample-data
[4]: https://docs.microsoft.com/en-us/dotnet/api/system.idisposable
[5]: https://gist.github.com/ColinOrr/b28427d1a64abfade2ca9a75f8156d15
