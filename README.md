# grunt-hub

A Grunt task to watch and run tasks on multiple Grunt projects.

## Create a Grunt Hub

A Grunt Hub is just a folder with a [Gruntfile][getting_started] and this
grunt plugin installed. To create one do:

```
mkdir grunt-hub && cd grunt-hub
npm install grunt-hub
cp -R node_modules/grunt-hub/tasks/init/hub/* .
```

Then edit the grunt.js file to point to your other Grunt projects and run:
`grunt` or `grunt watch`.

### Integrate With an Existing Grunt Project

Install this grunt plugin next to your project's
[Gruntfile][getting_started] with: `npm install grunt-hub`

Then add this line to your project's Gruntfile:

```javascript
grunt.loadNpmTasks('grunt-hub');
```

## Watching Forever

The common use for grunt-hub is for a development server. Where you would
like to watch multiple projects and compile the SASS or concat/minify JS upon
every project as you edit.

Depending on your system, there are various ways to ensure the grunt-hub stays
alive. Such as with
[upstart and monit](http://howtonode.org/deploying-node-upstart-monit).

A simple way is to use `nohup` and create a `start.sh` script:

```sh
#!/bin/sh
DIR=`dirname $0`
/usr/bin/nohup /usr/local/bin/grunt --config $DIR/grunt.js --base $DIR watch &
echo "Grunt Hub Started"
```

and a `stop.sh` script:

```sh
#!/bin/sh
ps -ef | sed -n '/grunt/{/grep/!p;}' | awk '{print$2}' | xargs -i kill {}
echo "Grunt Hub Stopped"
```

Put these in your grunt-hub folder and run `./start.sh` to start and
`./stop.sh` to stop.

## Configuring

This plugin includes a `hub` task and overrides the `watch` task.

### `hub` task

The hub task is for running tasks on multiple projects. It would like to know
which Gruntfiles to use and which tasks to run on each Grunt project. For example
if I would like to `lint` and `test` on every Grunt project one folder up:

```javascript
grunt.initConfig({
  hub: {
    all: {
      files: ['../*/grunt.js'],
      tasks: ['lint', 'test']
    }
  }
});
```

### `watch` task

The watch task is for watching multiple Grunt projects and triggering tasks on
the respective Grunt project as files are edited. This watch task will read each
project's Gruntfile and use each `watch` config to determine which files to watch
and which tasks to run.

To specify which Gruntfiles this watch task should read use:

```javascript
grunt.initConfig({
  watch: '../*/grunt.js',
});
```
or if you're using the above `hub` config, simply:

```javascript
grunt.initConfig({
  watch: '<config:hub.all.files>',
});
```

## Contributing

Please open an issue or send a pull request. Thanks!

## Release History

* 0.1.1 add copyable template for a grunt hub
* 0.1.0 initial release

## License

Copyright (c) 2012 Kyle Robinson Young  
Licensed under the MIT license.


[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md