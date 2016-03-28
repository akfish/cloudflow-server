#< deps
GLOBAL.gulp = require('gulp')
GLOBAL.heap = require('gulp-heap')
GLOBAL.config = require('./gulpconfig.json')
#>
#< tasks
require('./gulp-task/cli')('default')
require('./gulp-task/clean')('default')
require('./gulp-task/es6')('default')
#>
#< contents
#>