---
layout: post
title: Simplifying Node with Koa
summary: |
  I really enjoy writing web applications in Node JS, but sometimes the
  asynchronous programming style makes my head hurt!  This code sample is from
  my current side project, commentator.  It retrieves comments stored as
  Markdown files from the local file system and returns them as a JSON array
---
I really enjoy writing web applications in Node JS, but sometimes the
asynchronous programming style makes my head hurt!  This code sample is from
my current side project, [commentator][1].  It retrieves comments stored as
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

  var comments = [];
  for (var i = 0; i < files.length; i++) {
    var file = path.join(folder, files[i]);
    fs.readFile(file, 'UTF-8', function (err, markdown) {
      if (err) throw err;

      var comment = parse(file, markdown);
      comments.push(comment);

      if (comments.length == files.length) {
        res.send(comments);
      }
    });
  }
});
```

Yuck! My original 10 lines of code have increased to 16; the maximum indentation
has gone up to 4 levels; and I've had to sprinkle the code with
`if (err) throw err;` statements to manually check for, and re-throw errors! 🙀

There's also complexity around when the response is ready to be sent.  The code
loops over the files and kicks off asynchronous `readFile` operations in
parallel.  The callbacks may come out of order, so I have added an `if`
statement into each one to check if all the comments have been added before
sending the response.

--------------------------------------------------------------------------------

Enter [Koa][2].  It's a new web framework from the team behind **Express**, so
it has some pedigree.  Koa allows you to write the following:

```javascript
app.use(function *() {

  var folder = path.join('data', this.request.url);
  var files  = yield fs.readdir(folder);

  var comments = [];
  for (var i = 0; i < files.length; i++) {
    var file     = path.join(folder, files[i]);
    var markdown = yield fs.readFile(file, 'UTF-8');

    var comment = parse(file, markdown);
    comments.push(comment);
  }

  this.body = comments;

});
```

This code is identical to the simple version except that it uses asynchronous
file system operations preceded by the `yield` keyword.  Koa cleverly
<del>abuses</del> uses a new feature of JavaScript called [generators][3] to
pause the code mid-flow, wait for the asynchronous operation to complete, then
continue executing.

There is one catch - you can only yield asynchronous operations that return a
[promise][4].  However, the file system operations in the code above use the
standard Node callback pattern, so I've added the following wrapper to convert
the callbacks to promises:

```javascript
var fs = require('fs'),
    q  = require('q');

module.exports.readdir  = q.denodeify(fs.readdir);
module.exports.readFile = q.denodeify(fs.readFile);
```

Hopefully I've convinced some of you to give [Koa][2] a try.  I'm excited about
how the code is shaping up in [commentator][1], and since Koa is developed by
the team who wrote Express - I have a feeling that it may be here to stay.

[1]: https://github.com/ColinOrr/commentator
[2]: http://koajs.com
[3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
[4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
