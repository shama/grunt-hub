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

Then edit the Gruntfile file to point to your other Grunt projects and run:
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
/usr/bin/nohup /usr/local/bin/grunt --base $DIR watch --no-color &
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
      src: ['../*/Gruntfile.js'],
      tasks: ['jshint', 'nodeunit']
    }
  }
});
```

If `tasks` were omitted, it will run the `default` tasks.

### `watch` task

The watch task is for watching multiple Grunt projects and triggering tasks on
the respective Grunt project as files are edited. This watch task will read each
project's Gruntfile. If you specify `tasks` it will run only those tasks
otherwise if no `tasks` are specified it will run all and each of the project's
watch targets.

To specify which Gruntfiles this watch task should read use:

```javascript
grunt.initConfig({
  watch: {
    all: {
      files: ['../*/Gruntfile.js'],
      tasks: ['jshint', 'nodeunit']
    }
  }
});
```
or if you're using the above `hub` config and would like to run all the watch
targets of the projects, use:

```javascript
grunt.initConfig({
  watch: {
    files: '<%= hub.all.src %>'
  }
});
```

## Contributing

Please open an issue or send a pull request. Thanks!

## Release History

* 0.4.0 Support for Grunt v0.4.
* 0.3.6 Propagate exit codes. Thanks @wachunga!
* 0.3.5 Update for latest grunt. Thanks @akinofftz!
* 0.3.4 Allow watch task to be renamed.
* 0.3.3 Fix issue with grunt-hub passing it's own tasks. Minor refactoring.
* 0.3.2 Fix dep to `grunt-lib-contrib`. Include options in verbose output. Better spawn grunt in hub task.
* 0.3.1 Update to gaze@0.2.0. Only spawn one at a time. Add `interrupt` option. Allow `tasks` to be undefined. Update to run on Grunt v0.4.
* 0.3.0 Use [gaze](https://github.com/shama/gaze) for watching, Grunt v0.4 compatibility
* 0.2.0 refactor: make easier to upgrade to Grunt v0.4, windows support, fix issue with mutliple watch targets
* 0.1.1 add copyable template for a grunt hub
* 0.1.0 initial release

## License

Copyright (c) 2012 Kyle Robinson Young
Licensed under the MIT license.


[grunt]: https://github.com/gruntjs/grunt
[getting_started]: http://gruntjs.com/getting-started
