## Projekktor

This is a fork of the [Projekktor](http://www.projekktor.com) project.

Tracking https://projekktorxl.svn.beanstalkapp.com/core/trunk

Current revision: 242


How to build your own Projekktor
----------------------------

First, clone a copy of the main Projekktor git repo by running:

```bash
git clone git://github.com/fastcompany/projekktor.git
```

Install the grunt-cli package so that you will have the correct version of grunt available from any project that needs it. This should be done as a global install:

```bash
npm install -g grunt-cli
```

Enter the projekktor directory and install the Node dependencies, this time *without* specifying a global install:

```bash
cd projekktor && npm install
```

Make sure you have `grunt` installed by testing:

```bash
grunt -version
```

Then, to get a complete, minified (w/ Uglify.js), linted (w/ JSHint - coming soon) version of Projekktor, type the following:

```bash
grunt
```

The built version of Projekktor will be put in the `dist/` subdirectory, along with the minified copy and associated map file.


### Modules

Special builds can be created that exclude subsets of Projekktor functionality.

See the documentation here: (http://www.projekktor.com/docs/build)

- **playlist**: Playlist functionality.
- **jwflash**: Default uses Flash audio / video support featuring Jarisplayer, use this flag for JWPlayer instead.
- **youtube**: Youtube API support.
- **html**:  Displays images and HTML pages as regular content.

User plugins (download from (http://shop.projekktorxl.com/)) and place in a ./plugins directory:

```bash
mkdir plugins
```

- **plugins/ima**:  VAST IMA ads.
- **plugins/logo**:  Display a logo watermark.
- **plugins/share**:  Sharing overlay options.
- **plugins/tracking**:  Tracking plugin.
- **plugins/tracks**:  Synchronized captions and subtitles.
- **plugins/postertitle**:  Display title of current idling media item.
- **plugins/audioslideshow**:  Time-index controlled image slideshows.

To create a custom build of the latest stable version, first check out the version:

```bash
git pull; git checkout $(git describe --abbrev=0 --tags)
```

Then, make sure all Node dependencies are installed and all Git submodules are checked out:

```bash
npm install && grunt
```

Create the custom build, use the `grunt custom` option, listing the modules to be excluded. Examples:

Exclude all **playlist** functionality:

```bash
grunt custom:-playlist
```
