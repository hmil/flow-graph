gulp = require 'gulp'
webpack = require 'webpack-stream'
extend = require 'extend'
named = require 'vinyl-named'
path = require 'path'
uglify = require 'gulp-uglifyjs'
gulpIgnore = require 'gulp-ignore'
rename = require 'gulp-rename'

webpackConfig =
    module:
      loaders: [
        {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
        {test: /\.ts$/, exclude: /node_modules/, loader: 'ts-loader' },
        {test: /\.style\.html$/, exclude: /node_modules/, loader: 'tools/style-loader.js'}
      ]
    resolve:
      root: path.resolve './src'
      extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    resolveLoader:
      root: path.resolve '.'
    output:
      libraryTarget: 'umd'
    devtool: 'source-map'

dist = (dest, stream) ->
  stream
    .pipe gulp.dest(dest)
    .pipe gulpIgnore.exclude('*.js.map')
    .pipe rename (path) -> path.basename += "-min"
    .pipe uglify(
      outSourceMap: true
    )
    .pipe gulp.dest(dest)

module.exports =
  styles: (watch) ->
    stream = gulp.src 'src/styles/*.style.html'
      .pipe named()
      .pipe webpack extend(true, {}, webpackConfig,
        watch: watch
      )
    dist 'dist/styles/', stream

  views: (watch) ->
    stream = gulp.src 'src/views/**/index.js'
      .pipe named((file) ->
        [..., basename, _] = file.path.split '/'
        basename
      )
    .pipe webpack extend(true, {}, webpackConfig,
      watch: watch
      output:
        library: 'GraphView'
        filename: '[name].js'
      externals:
        'ioflow': 'ioflow'
    )
    dist 'dist/views/', stream

  core: (watch) ->
    stream = gulp.src('src/core/index.js')
      .pipe webpack extend(true, {}, webpackConfig,
        watch: watch
        output:
          library: 'ioflow'
          filename: 'ioflow-core.js'
      )
    dist 'dist/', stream
