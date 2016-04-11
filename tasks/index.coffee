gulp = require 'gulp'
build = require './build'

gulp.task 'build', ['build-core', 'build-views', 'build-styles']
gulp.task 'watch', ['watch-core', 'watch-views', 'watch-styles']
gulp.task 'build-core', -> build.core(false)
gulp.task 'watch-core', -> build.core(true)
gulp.task 'build-views', -> build.views(false)
gulp.task 'watch-views', -> build.views(true)
gulp.task 'build-styles', -> build.styles(false)
gulp.task 'watch-styles', -> build.styles(true)
