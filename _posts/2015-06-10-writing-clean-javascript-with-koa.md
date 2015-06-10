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
they're likely to shake their head in disgust.  They'll point out that using
`fs.readdirSync` or `fs.readFileSync` in a web application will tie up our
single JavaScript thread with lengthy file system operations.

## Async Example
## Koa Example
## What's going on?
