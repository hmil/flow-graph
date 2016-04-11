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
        {test: /\.style\.html$/, exclude: /node_modules/, loader: 'tools/style-loader.js'}
      ]
    resolve:
      root: path.resolve './src'
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
  styles: (watch) -> dist('dist/styles/',
    gulp.src 'src/styles/*.style.html'
      .pipe named()
      .pipe webpack(extend(true, {}, webpackConfig, {
        watch: watch
      }))
  )
  views: (watch) -> dist('dist/views/',
    gulp.src 'src/views/**/index.js'
      .pipe named((file) ->
        [..., basename, _] = file.path.split '/'
        basename
      )
    .pipe webpack(extend(true, {}, webpackConfig, {
      watch: watch
      output:
        filename: '[name].js'
      externals:
        'ioflow': 'ioflow'
    }))
  )
  core: (watch) -> dist('dist/',
    gulp.src('src/core/index.js')
      .pipe webpack(extend(true, {}, webpackConfig, {
        watch: watch
        output:
          library: 'ioflow'
          filename: 'ioflow-core.js'
      }))
  )
