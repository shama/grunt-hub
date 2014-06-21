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
`grunt hub`.

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
/usr/bin/nohup /usr/local/bin/grunt --base $DIR hub --no-color &
echo "Grunt Hub Started"
```

and a `stop.sh` script:

```sh
#!/bin/sh
ps -ef | sed -n '/grunt/{/grep/!p;}' | awk '{print$2}' | xargs -I kill {}
echo "Grunt Hub Stopped"
```

Put these in your grunt-hub folder and run `./start.sh` to start and
`./stop.sh` to stop.

### Using [forever](https://npmjs.org/package/forever)

`forever` is a another great way to watch multiple grunt projects forever.

* Install `npm install forever grunt grunt-cli grunt-hub --save-dev`
* Add a start script to your `package.json`:

```json
{
  "name": "my-grunt-hub",
  "version": "0.1.0",
  "scripts": {
    "start": "forever ./node_modules/.bin/grunt hub"
  }
}
```

* Now you can start your hub with `npm start`.

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
      tasks: ['jshint', 'nodeunit'],
    },
  },
});
```

If `tasks` were omitted, it will run the `default` tasks.

You can override tasks on the cli with args: `grunt hub:all:watch` will run the `watch` task on all projects instead of `jshint, nodeunit`.

#### options

##### `concurrent`
Default: `3`

Set to the number of concurrent task runs to spawn.

##### `allowSelf`
Default: `false`

By default, hub will skip its own Gruntfile. Set to `true` to allow hub to
include itself.

**Note:** Only set this for tasks which are not part of the `default`
task of their respective Gruntfile, or an infinite loop will occur.

```
hub: {
  all: {
    options: {
      allowSelf: true
    },
    src: ['./Gruntfile.js', '../client1/Gruntfile.js', '../client2/Gruntfile.js'],
  },
},
```

## Where did the `watch` task go?

It isn't necessary. Just `npm install grunt-contrib-watch --save-dev` into your project folders. Then either add the `watch` task to your tasks list in your hub task config. Or run with `grunt hub:target:watch`.

## Contributing

Please open an issue or send a pull request. Thanks!

## Release History

* 0.7.0 Update async to ~0.9.0, warn when files not found and finish task when idle. Thanks @dylancwood!
* 0.6.2 Fix syntax error. Thanks @eugeneiiim!
* 0.6.1 Fix path.resolve must be strings for ownGruntfile. Thanks @terribleplan!
* 0.6.0 Removed unneeded watch task. Fix issue with Gruntfiles not named Gruntfile. Removed deprecated grunt.util libs. Ability to override tasks via the cli.
* 0.5.0 Run hub tasks in parallel. Add concurrent option to hub. Better error handling/printing. Thanks @plestik!
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

Copyright (c) 2013 Kyle Robinson Young  
Licensed under the MIT license.


[grunt]: https://github.com/gruntjs/grunt
[getting_started]: http://gruntjs.com/getting-started
