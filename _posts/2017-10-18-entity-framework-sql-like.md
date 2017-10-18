---
layout: post
title: Using SQL LIKE with Entity Framework
summary: |
  I found out this week that using the `LIKE` operator in an Entity Framework
  query is maddeningly difficult 😳.  I reckon there are three options, each with
  different trade-offs and levels of difficulty.
---
I found out this week that using the `LIKE` operator in an Entity Framework
query is maddeningly difficult 😳.  I reckon there are three options, each with
different trade-offs and levels of difficulty.

## Option 1: Entity SQL

According to Microsoft the [Entity SQL Language][1] is a storage-independent
query language that is similar to SQL.  It allows you to write queries like this:

```c#
var query = context.PersonQuery.Where(
    "it.FirstName LIKE @pattern",
    new ObjectParameter("pattern", "Col%")
);
```

*where `it` represents the entity being queried.*

Unfortunately this won't work with your normal Entity Framework datasets,
instead you have to expose an additional `ObjectSet` for each type of entity you
wish to query:

```c#
public class DataContext : DbContext
{
    // Normal sets used in EF code-first
    public DbSet<Person> People { get; set; }

    // Special Entity SQL object sets
    public ObjectContext ObjectContext   => ((IObjectContextAdapter)this).ObjectContext;
    public ObjectSet<Person> PersonQuery => ObjectContext.CreateObjectSet<Person>();
}
```

Advantages:  
✔ Really easy to setup  
✔ Works with all databases supported by EF  

Disadvantages:  
𝘟 No in-memory version for unit testing  
𝘟 Cannot be mixed with standard LINQ to make more complex queries  
𝘟 Uses magic strings that won't survive a refactor and aren't type checked  
𝘟 Has a rather verbose syntax for passing parameters  

## Option 2: SQL Functions

Entity Framework ships with a set of [SQL Functions][2] that can be used in LINQ
queries.  When Entity Framework executes the query, it will use the database
function with the matching name.

As there's no `LIKE` function available, we have to use [PATINDEX][3] instead
which performs a pattern match and returns the position of the first occurrence:

```c#
var query =
    from person in context.People
    where SqlFunctions.PatIndex("C%", person.FirstName) > 0
    select person;
```

Advantages:  
✔ No setup required  
✔ Standard LINQ so it can be mixed into more complex queries  
✔ Strongly typed and refactor safe  

Disadvantages:  
𝘟 No in-memory version for unit testing, it throws a not supported exception  
𝘟 Only works with SQL Server  

## Option 3: Write a Custom SQL Function

Neither of the options above really float my boat.  The lack of support for
in-memory sequences makes it impossible to unit test complex queries without
using the database... I'd like to be able to write a query like this:

```c#
var query =
    from person in context.People
    where person.FirstName.Like("Col%")
    select person;
```

First we have to implement an in-memory version of the `Like` function to
support unit testing.  It's reasonably easy to do this using regular expressions:

```c#
public static class Functions
{
    [DbFunction("CodeFirstDatabaseSchema", "Like")]
    public static bool Like(this string target, string pattern)
    {
        // Escape all the special regex characters by default
        pattern = Regex.Escape(pattern);

        // Add regex equivalents for the various SQL LIKE characters
        pattern = pattern.Replace("%", ".+");
        pattern = pattern.Replace("_", ".");
        pattern = pattern.Replace(@"\[", "[");
        pattern = pattern.Replace(@"\]", "]");
        pattern = pattern.Replace(@"[\^", "[^");

        // Match against the entire string
        pattern = "^" + pattern + "$";

        return Regex.IsMatch(target, pattern, RegexOptions.IgnoreCase);
    }
}
```

The `[DbFunction]` attribute tells Entity Framework to map this method to a
database function called "Like" when transposed into a SQL query... so lets add
this function to the database:

```sql
CREATE FUNCTION [dbo].[Like]
(
    @target nvarchar(max),
    @pattern nvarchar(max)
)
RETURNS BIT
AS
BEGIN
    RETURN (SELECT CASE WHEN @target LIKE @pattern THEN 1 ELSE 0 END)
END
```

In an ideal world that would be it, however Entity Framework needs a bit more
metadata to map this SQL function to the C# one.  There are third party libraries
that can add this metadata automatically, like [this one][4] by moozzyk, but they
don't support extension methods.

Here's how to do it explicitly for our Like function (brace yourself):

```c#
public class FunctionsConvention : IStoreModelConvention<EdmModel>
{
    public void Apply(EdmModel item, DbModel model)
    {
        var payload = new EdmFunctionPayload
        {
            Schema = "dbo",
            StoreFunctionName = "Like",
            Parameters = new[]
            {
                FunctionParameter.Create("target" , getPrimitiveType(model, PrimitiveTypeKind.String), ParameterMode.In),
                FunctionParameter.Create("pattern", getPrimitiveType(model, PrimitiveTypeKind.String), ParameterMode.In),
            },
            ReturnParameters = new[]
            {
                FunctionParameter.Create("result", getPrimitiveType(model, PrimitiveTypeKind.Boolean), ParameterMode.ReturnValue)
            },
        };

        item.AddItem(EdmFunction.Create("Like", "CodeFirstDatabaseSchema", item.DataSpace, payload, null));
    }

    private static EdmType getPrimitiveType(DbModel model, PrimitiveTypeKind typeKind)
    {
        return model
            .ProviderManifest
            .GetStoreType(TypeUsage.CreateDefaultTypeUsage(PrimitiveType.GetEdmPrimitiveType(typeKind)))
            .EdmType;
    }
}
```

Finally this convention needs to be registered in your data context:

```c#
public class DataContext : DbContext
{
    public DbSet<Person> People { get; set; }

    protected override void OnModelCreating(DbModelBuilder modelBuilder)
    {
        modelBuilder.Conventions.Add(new FunctionsConvention());
    }
}
```

Advantages:  
✔ In-memory version for unit testing or filtering results after the query executes  
✔ Standard LINQ so it can be mixed into more complex queries  
✔ Strongly typed and refactor safe  
✔ Works with all databases supported by EF  

Disadvantages:  
𝘟 A large amount of up-front setup required  

## Conclusion

SQL Functions (option 2) is probably the quickest and easiest one to get up and
running, but if the lack of in-memory support is a deal breaker then writing a
custom SQL function may be worth the extra effort.

As a bonus, this approach could easily be adapted to unlock other SQL features
like soundex or geospatial queries.


[1]: https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/ef/language-reference/entity-sql-language
[2]: https://msdn.microsoft.com/en-us/library/system.data.objects.sqlclient.sqlfunctions(v=vs.110).aspx
[3]:https://msdn.microsoft.com/en-us/library/system.data.objects.sqlclient.sqlfunctions.patindex(v=vs.110).aspx
[4]:https://www.nuget.org/packages/EntityFramework.CodeFirstStoreFunctions/
