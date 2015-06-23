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
var folder = path.join('data', this.request.url);
var files  = fs.readdirSync(folder);

var comments = [];
for(var i = 0; i < files.length; i++) {
  var file     = path.join(folder, files[i]);
  var markdown = fs.readFileSync(file, 'UTF-8');

  var comment = parse(file, markdown);
  comments.push(comment);
}

this.body = comments;
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
var folder = path.join('data', this.request.url);
fs.readdir(folder, function(err, files) {
  if (err) throw err;

  var processed = 0;
  var comments = [];
  
  for(var i = 0; i < files.length; i++) {
    var file = path.join(folder, files[i]);
    fs.readFile(file, 'UTF-8', function(err, markdown) {
      if (err) throw err;

      var comment = parse(file, markdown);
      comments.push(comment);

      if (++processed == comments.length) {
        this.body = comments;
      }
    });
  }
});
```

## Asynchronous Version
## Koa Example
## What's going on?
