---
layout: post
title: 'JavaScript Gotcha: Loop Scope'
summary: |
  This JavaScript gotcha had me scratching my head for the best part of an hour.
  I was attempting to create a number of files on the file system using the
  following code:
---
This JavaScript gotcha had me scratching my head for the best part of an hour.
I was attempting to create a number of files on the file system using the
following code:

```javascript
var files = ['folder1/a.txt', 'folder1/b.txt', 'folder2/c.txt'];

for (var i = 0; i < files.length; i++) {
  var file = files[i];
  mkdirp(path.dirname(file), function () {       // Create the folder
    fs.writeFile(file, "Content", function () {  // Create the file
      console.log(file + " created");
    });
  });
}
```

Surprisingly this didn't work, instead I got the following output:

```
folder2/c.txt created
folder2/c.txt created
folder2/c.txt created
```

Why did it try to create the last file three times?  Because **JavaScript loops
don't have their own scope** like most other languages do... no seriously... I'm
not joking, try this out:

```javascript
for (var i = 0; i < 3; i++) {

}

console.log(i);  // outputs '3', OUTSIDE of the loop
```

So if the `for` loop contains asynchronous callbacks they will get the *final
value* of any variable set in the loop, not their current value.

You can fix this by using the `forEach` method of the array instead:

```javascript
files.forEach(function (file) {
  mkdirp(path.dirname(file), function () {       // Create the folder
    fs.writeFile(file, "Content", function () {  // Create the file
      console.log(file + " created");
    });
  });
});
```

Every day's a school day.
