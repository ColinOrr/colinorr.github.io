---
layout: post
title: Ruby on Rails, on Dokku!
summary: |
  TODO: Summary
---
In my [last post][1] I showed how to setup [Dokku][2] and deploy a simple "Hello
World" web application.  Now let's turn it up to 11 and build a fully-blown
[Ruby on Rails][3] application with its own database, taking a look at some of
Dokku's management features along the way.

The app will be **flicklog** - a journal of movies that you've seen recently at
the cinema with a short synopsis and a star rating.

Ready? Adequately caffeinated? Let's go.

## Create a Rails Application

To get started you'll need a development environment with Ruby, Rails 4 and
PostgreSQL.  Setting this up can be a little tricky, I would recommend that you
install [Vagrant][4] and use my lovingly crafted [Vagrantfile][5] to provision a
development VM.  That way we'll all be on the same page.

On your development VM, run the following commands to create a database and a
new Rails application, specifying that it should use PostgreSQL as the database:

```
createdb flicklog_development
rails new flicklog --database=postgresql
cd flicklog
```

Next, we have to add a couple of gems to the Gemfile:

```ruby
# Gemfile
gem 'therubyracer', platforms: :ruby
gem 'rails_12factor', group: :production
```

`therubyracer` provides Rails with a JavaScript runtime and the `rails_12factor`
gem is needed for the logging to work with Dokku.

We can now install the gems and run the web application:

```
bundle install
rails s -b 0.0.0.0
```

This starts up the web application on port 3000, you can visit the site on
[http://localhost:3000](http://localhost:3000).  It will show the default
"Welcome aboard" page with getting started instructions.

Next, we want to create a movie entity that has a title, synopsis, release date
and star rating.  Rails provides a `scaffold` command that generates the code
for this automatically:

```
rails generate scaffold movie title synopsis:text released:date rating:integer
rake db:migrate
```

The scaffold command creates a model, view, controller and database migration
for our movie entity.  The migrate command applies the database migration to our
database, creating a new table to store our movies.

Finally, edit the default route to make the home page our list of movies:

```ruby
# config/routes.rb
root 'movies#index'
```

If you visit your local site now, you will see an empty table of movies and you
can start adding movies to your log.

![Flicklog](/public/images/ruby-on-rails-on-dokku/flicklog.png)

## Deploy to Dokku

Now that we've got our simple app working, it's time to deploy it to Dokku.  My
[previous post][1] explains how to setup a Dokku server, I'm going to push my
app to *flicklog.colinthegeek.com*.

Dokku uses Git to deploy your application, so your code has to be checked into a
Git repository before it can be deployed.  You may already use an online service
like GitHub or BitBucket to store your code, but for the purposes of this
article I'm going to add the code to a local repository on my development VM:

```
git init
git add .
git commit -m 'Initial Commit'
```

Now the code is in a repository, we add a remote that points to our Dokku
server, don't forget to substitute *colinthegeek.com* with your own server
address:

```
git remote add geek dokku@colinthegeek.com:flicklog
```

...where *"geek"* is the name of the remote, *"dokku"* is the Git user name,
*"colinthegeek.com"* is the server, and *"flicklog"* is the name of the app.

That's the configuration complete, lets push the code to Dokku and see what
happens:

```
git push geek master
```

The code should deploy successfully and return the URL at the bottom of the
deployment log:

```
=====> Application deployed:
       http://flicklog.colinthegeek.com
```

## Viewing the Logs

If you visit the site now, you'll be disappointed to see the following error
message:

![Error](/public/images/ruby-on-rails-on-dokku/error.png)

Something has gone wrong, and Rails won't tell us what because it's running in
production mode.  It does suggest that we check the logs, so lets try that.  SSH
onto your server and execute `dokku` to see the commands that are available:

```
> ssh root@colinthegeek.com
> dokku

Usage: dokku COMMAND <app> [command-specific-options]

apps:create <app>                               Create a new app
apps:destroy <app>                              Permanently destroy an app
apps                                            List your apps
backup:export [file]                            Export dokku configuration files
backup:import [file]                            Import dokku configuration files
config <app>                                    Display the config vars for an app
config:get <app> KEY                            Display a config value for an app
config:set <app> KEY1=VALUE1 [KEY2=VALUE2 ...]  Set one or more config vars
config:unset <app> KEY1 [KEY2 ...]              Unset one or more config vars
domains:add <app> DOMAIN                        Add a custom domain to app
domains <app>                                   List custom domains for app
domains:clear <app>                             Clear all custom domains for app
domains:remove <app> DOMAIN                     Remove a custom domain from app
help                                            Print the list of commands
logs <app> [-t]                                 Show the last logs for an application (-t follows)
nginx:build-config <app>                        (Re)builds nginx config for given app
nginx:import-ssl <app>                          Imports a tarball from stdin; should contain server.crt and server.key
plugins-install                                 Install active plugins
plugins                                         Print active plugins
plugins-update                                  Update active plugins
run <app> <cmd>                                 Run a command in the environment of an application
url <app>                                       Show the first URL for an application (compatibility)
urls <app>                                      Show all URLs for an application
version                                         Print dokku's version
```

The command that we are looking for is `dokku logs`:

```
> dokku logs flicklog

Started GET "/" for 82.132.212.222 at 2015-04-27 18:15:15 +0000

PG::ConnectionBad (could not connect to server: No such file or directory
	Is the server running locally and accepting
	connections on Unix domain socket "/var/run/postgresql/.s.PGSQL.5432"?
):
```

The logs tell us that our application cannot find the PostgreSQL server, that's
OK, we haven't created one yet.  We'll do that in the next section.

## PostgreSQL Plugin

Dokku doesn't have any support for databases, but it does have rich support for
plugins.  There are a number of [community plugins][6] for PostgreSQL, my
favourite one is by [kloadut][7].

Install the plugin by executing the following commands on your Dokku server:

```
cd /var/lib/dokku/plugins
git clone https://github.com/Kloadut/dokku-pg-plugin postgresql
dokku plugins-install
```

The plugin extends the available Dokku commands:

```
> dokku
...
postgresql:console <db>                        Open a PostgreSQL console
postgresql:create <db>                         Create a PostgreSQL container
postgresql:delete <db>                         Delete specified PostgreSQL container
postgresql:dump <db> > dump_file.sql           Dump database data
postgresql:info <db>                           Display database informations
postgresql:link <app> <db>                     Link an app to a PostgreSQL database
postgresql:list                                Display list of PostgreSQL containers
postgresql:logs <db>                           Display last logs from PostgreSQL container
postgresql:restore <db> < dump_file.sql        Restore database data from a previous dump
```

All we have to do is create a database and link it to our application:

```
dokku postgresql:create flicklog-db
dokku postgresql:link flicklog flicklog-db
```

Finally, lets run the migration to create our movies table:

```
dokku run flicklog rake db:migrate
```

Now you can visit the site and start logging flicks!

## Managing Data

The PostgreSQL plugin includes some handy commands for exporting and importing
data.  These commands use the `postgresql-client` behind the scenes, so you must
install it on your Dokku server before you use them:

```
sudo apt-get install postgresql-client
```

You can export the database with the `dump` command:

```
dokku postgresql:dump flicklog-db > ~/flicklog-db.sql
```

This creates a full backup of your database schema and data.  You can restore a
backup with the `restore` command:

```
dokku postgresql:restore flicklog-db < ~/flicklog-db.sql
```

Finally, the `console` command is useful if you want to run SQL queries against
your database.  The following commands open a console, selects all of the movies
and quits:

```
dokku postgresql:console flicklog-db
select * from movies;
\q
```

--------------------------------------------------------------------------------

Hopefully this was guide was helpful, I've been using Dokku to host side
projects for a while and I find it very useful.  You can find the source code
from in this article on my GitHub:
[https://github.com/ColinOrr/dokku-rails](https://github.com/ColinOrr/dokku-rails)

[1]: /2015/02/04/dokku-development-paas
[2]: http://progrium.com/blog/2013/06/19/dokku-the-smallest-paas-implementation-youve-ever-seen
[3]: http://rubyonrails.org
[4]: https://www.vagrantup.com
[5]: https://github.com/ColinOrr/dokku-rails/blob/master/Vagrantfile
[6]: http://progrium.viewdocs.io/dokku/plugins
[7]: https://github.com/Kloadut/dokku-pg-plugin
