---
layout: post
title: Writing clean JavaScript with Koa
summary: |
  TODO: Write summary
---
I really enjoy writing web applications in Node JS, but sometimes the
asynchronous programming style just makes my head hurt!  This code sample is
from my current side project, [commentator]().  It retrieves comments stored as
Markdown files from the local file system and returns them as a JSON array:

```javascript
var folder = path.join('data', req.url);
var files  = fs.readdirSync(folder);

var comments = [];
for (var i = 0; i < files.length; i++) {
  var file     = path.join(folder, files[i]);
  var markdown = fs.readFileSync(file, 'UTF-8');

  var comment = parse(file, markdown);
  comments.push(comment);
}

res.send(comments);
```

Dead simple, right?  It looks for files in the requested folder, loops through
each file and reads the contents, then parses the contents into a comment and
adds it to an array.

But show this simple, readable code to an experienced Node programmer and
they'll laugh you out of the room.  They'll point out that using
`fs.readdirSync` or `fs.readFileSync` in a web application will tie up your
single JavaScript thread with lengthy file system operations.  The application
won't be able to serve requests from multiple users while it's reading from the
file system leading to a very slow website when placed under load.

To allow this code to scale we need to use the *asynchronous* version of the
file system methods... but what does that look like?

```javascript
var folder = path.join('data', req.url);
fs.readdir(folder, function (err, files) {
  if (err) throw err;

  var processed = 0;
  var comments = [];

  for (var i = 0; i < files.length; i++) {
    var file = path.join(folder, files[i]);
    fs.readFile(file, 'UTF-8', function (err, markdown) {
      if (err) throw err;

      var comment = parse(file, markdown);
      comments.push(comment);

      if (++processed == files.length) {
        res.send(comments);
      }
    });
  }
});
```

So my original 10 lines of code have increased to 17; the maximum indentation
has gone up to 4 levels; and I've had to sprinkle the code with
`if (err) throw err;` statements to manually check for, and re-throw errors! 🙀

I've added a rather confusing `processed` counter to deal with the fact it's
looping over the files and starting multiple asynchronous reads in parallel.  
Once all of the files have been processed it finally sends the full array of
comments.

## Koa Example
## What's going on?
