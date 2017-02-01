---
layout: post
title: Generating Sample Data
summary: |
  Recently I've been thinking a lot about manual exploratory testing and
  performance testing, both of which require large sets of realistic test data.

  On most projects we can't use real user data for testing (due to data
  security rules) so instead I've come up with a few simple techniques to generate
  large sets of random, but realistic, sample data.
---
Recently I've been thinking a lot about manual exploratory testing and
performance testing, both of which require large sets of realistic test data.

On most projects we can't use real user data for testing (due to data security
rules) so instead I've come up with a few simple techniques to generate
large sets of random, but realistic, sample data.

## Selecting a random item from a sequence

The following extension method returns a random item from a sequence:

```c#
public static T Random<T>(this IEnumerable<T> source, int? seed = null)
{
    var random = new Random();
    if (seed != null) random = new Random(seed.Value * source.Count());
    return source.ElementAt(random.Next(source.Count()));
}
```

...and here's how it can be used in practice:

```c#
var names = new[] { "Homer", "Marge", "Bart", "Lisa", "Maggie" };

for (var i = 0; i < 5; i++)
{
    var name = names.Random(i);
}

// Generates: Lisa, Marge, Maggie, Bart, Homer
```

Notice that the method has an optional parameter for a `seed` - providing this
parameter makes the selection *pseudo-random*, i.e. it always picks the same
random item each time it's called (provided the underlying sequence isn't
changed).  This can be quite useful when generating test data as you'll get the
same sample data every time you tear down and rebuild the database.

Of course in the example above you would need a much larger pool of sample
names than our favourite cartoon family, how about names from the
[1990 US census][1]?  

A little multiline editing in your [favourite editor][2] and you end up with
this:

```c#
public static class SampleData
{
    public static string[] FemaleNames = new[]
    {
        "Mary",
        "Patricia",
        "Linda",
        "Barbara",
        "Elizabeth",
        "Jennifer",
        "Maria",
        ...
    }

    public static string[] Surnames = new[]
    {
        "Smith",
        "Johnson",
        "Williams",
        "Jones",
        "Brown",
        "Davis",
        "Miller",
        ...
    }
}
```

...with the usage:

```c#
var person = new Person
{
    FirstName = SampleData.FemaleNames.Random(i),
    LastName  = SampleData.Surnames.Random(i),
};
```

## Weighting values

Sometimes your random data can be a little too random and to make your data
realistic you need to make some values occur more frequently, that's where the
`Weight` extension comes in:

```c#
public static IEnumerable<T> Weight<T>(this IEnumerable<T> source, int weight)
{
    IEnumerable<T> result = new T[0];

    for (int i = 0; i < weight; i++)
    {
        result = result.Concat(source);
    }

    return result;
}
```

```c#
var titles =
    new[] { "Mrs", "Miss", "Ms" }.Weight(5)
    .Concat(new[] { "Dr", "Prof", "Rev" });

for (var i = 0; i < 5; i++)
{
    var title = titles.Random(i);
}

// Generates: Miss, Ms, Mrs, Prof, Mrs
```

So "Mrs", "Miss" and "Ms" are five times more likely to occur in the sample data
than the other professional titles.

## Ranges

Unlike Ruby, C# has no built in support for ranges of values.  So here's an
extension to add this support:

```c#
public static IEnumerable<int> To(this int start, int end)
{
    return Enumerable.Range(start, end - start);
}
```

This can be used in conjunction with the random method to generate numeric
data like phone numbers:

```c#
for (var i = 0; i < 5; i++)
{
    var phone = "028 9012 " + 1000.To(9999).Random(i);
}

// Generates:
//   028 9012 7535
//   028 9012 1284
//   028 9012 4033
//   028 9012 6781
//   028 9012 9529
```

Happy testing 👓

[1]: http://www2.census.gov/topics/genealogy/1990surnames/
[2]: https://atom.io/
