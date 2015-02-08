---
layout: post
title: Setting up a Dokku Development PaaS
summary: |
  I have a bad case of multiple technology disorder.  At the last count I have
  six side projects on the go, and not one of them uses the same language or
  framework!  Don't worry - I'm sure the doctor will prescribe me some pills to
  sort this out, but until then I'd like somewhere to host these projects online
  to show them off to my friends and colleagues.
---
I have a bad case of multiple technology disorder.  At the last count I have
six side projects on the go, and not one of them uses the same language or
framework!  Don't worry - I'm sure the doctor will prescribe me some pills to
sort this out, but until then I'd like somewhere to host these projects online
to show them off to my friends and colleagues.

[Heroku][1] would be the ideal solution, it's a popular Platform as a Service
(PaaS) that allows you to deploy applications written Ruby, Node.js, Python and
PHP by pushing your source code to their servers using Git.  The issue with
Heroku is that it gets rather expensive when you want to do anything serious.
The web dyno that runs your site [has a habit of going to sleep][2] on the free
plan, which is a bit embarrassing during a demo... also you can't have SSL
without moving to a paid plan.

Enter [Dokku][3].  It's a mini version of Heroku that can run on your own Linux
machine.  It uses Heroku's open source build packs to configure a Docker
container to run your application.  So if your app works on Heroku, it'll work
on Dokku.

I'm running Ruby on Rails, Express, Laravel and static HTML sites all on the
same 512MB Ubuntu server for only $5 a month with [DigitalOcean][4]!  The rest
of this article explains how to set it up.  Although I'm using DigitalOcean,
the same instructions should apply to other cloud providers.

## Step 1: Create an Ubuntu VM

At the time of writing, Dokku is tested on Ubuntu 14.04 x64.  With DigitalOcean,
you just create a new $5 per month droplet for this version of Ubuntu.  Don't
forget to add your SSH key, although it's optional you'll need it later for
working with Dokku. If you don't have an SSH key, GitHub has a [good article][5]
explaining how to create one.

DigitalOcean will create your droplet in about 60s, just enough time to go and
register a new [.sexy domain name][6]...  personally I'm going to stick with
*colinthegeek.com* :-)  

DigitalOcean will report your static IP address on the **Droplets** page, in my
case it's 178.62.99.39.  Point your new domain to this IP address by adding two
alias "A" records in the DNS settings of your domain provider:

| Host Name          | IP Address   |
|--------------------|--------------|
| @                  | 178.62.99.39 |
| *.colinthegeek.com | 178.62.99.39 |

The first "@" entry points the top-level domain to your new server, the second
entry is for subdomains.  The subdomain configuration is important as this is
how Dokku will make your application available e.g. [chitter.colinthegeek.com][7].

Next, we have to connect onto the server and create some swap space.  For some
reason cloud providers don't configure this by default, and if you don't have
any you'll quickly run into memory issues.  My server has 512 MB of RAM, so I'm
going to give it an additional 512 MB of swap space.

Connect to the server using SSH:

    ssh root@colinthegeek.com

Create a 512MB swap file and enable it:

    sudo fallocate -l 512M /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile

Make the change permanent by modifying the `fstab` file:

    sudo nano /etc/fstab

Finally, add the following line to the bottom of the file and save it:

    /swapfile   none    swap    sw    0   0

This [DigitalOcean article][8] gives a detailed description of what just
happened.

## Step 2: Install Dokku

Dokku is installed using a single shell script.  Head over to
[Dokku's GitHub page][9] to find the the latest stable version of the
bootstrapper command.  Currently it's on v0.3.13.

Connect to your server and run the bootstrapper command:

    ssh root@colinthegeek.com
    wget -qO- https://raw.github.com/progrium/dokku/v0.3.13/bootstrap.sh | sudo DOKKU_TAG=v0.3.13 bash

This will install all Dokku dependencies and clone their repository to `~/dokku`
in your home directory.  You can use this repo to [upgrade Dokku][10] in the
future.  It also adds a user called **dokku**, and their home directory
`/home/dokku` is where your applications will be deployed.

The next step is to register your domain name with Dokku:

    echo colinthegeek.com > /home/dokku/VHOST

When it comes to deploying your application, you'll use a `git push` to upload
it to the **dokku** user.  This means you have to add your SSH public key as an
authorised key for the dokku user account.  Your public key will be on you local
machine in a `~/.ssh/id_rsa.pub` file by convention.

Exit your SSH session to get back to you local machine:

    exit

Copy the contents of your SSH public key file to the server and add it to the
**dokku** user's authorised keys:

    cat ~/.ssh/id_rsa.pub | ssh root@colinthegeek.com "sudo sshcommand acl-add dokku colinthegeek"

*Note:* don't forget to change the server name (colinthegeek.com) to your own
domain name.  The last argument "colinthegeek" is just a label to help
distinguish your key from others on the server, so it doesn't really matter what
you name it.

You can give your friends access to push to your server by running the command
above with their public keys.

## Step 3: Push a Sample Application

And now the moment you've all been waiting for... time to push an application
and see what breaks!

Clone Heroku's sample application for Node JS:

    git clone https://github.com/heroku/node-js-sample.git
    cd node-js-sample

Add a new remote repository that points to your Dokku server:

    git remote add geek dokku@colinthegeek.com:hello-world

...where *"geek"* is the name of the remote, *"dokku"* is the Git user name,
*"colinthegeek.com"* is the server, and *"hello-world"* is the name of the app.

Push the code to Dokku:

    git push geek

You'll see some log messages as Dokku deploys the application, all being well it
should end with:

    =====> Application deployed:
           http://hello-world.colinthegeek.com

Go ahead and visit your new "Hello World" app, show it off to your significant
other, receive a blank look from them as you marvel at your own feat of
engineering, then go and have well deserved cup of tea!  

In my next article I'll show you how to manage your Dokku applications, setup a
Postgres database and get a simple Rails website up and running.

[1]: https://www.heroku.com
[2]: https://devcenter.heroku.com/articles/dynos#dyno-sleeping
[3]: http://progrium.com/blog/2013/06/19/dokku-the-smallest-paas-implementation-youve-ever-seen
[4]: https://www.digitalocean.com
[5]: https://help.github.com/articles/generating-ssh-keys
[6]: https://www.123-reg.co.uk/gtlds/?kw=sexy
[7]: http://chitter.colinthegeek.com
[8]: https://www.digitalocean.com/community/tutorials/how-to-add-swap-on-ubuntu-14-04
[9]: https://github.com/progrium/dokku
[10]: http://progrium.viewdocs.io/dokku/upgrading
