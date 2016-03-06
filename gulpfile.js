var gulp = require('gulp'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade');

gulp.task('sass', function(){
   return gulp.src('./src/**/*.scss')
      .pipe(sass({ includePaths : ['src/**/'],
                   outputStyle: 'expanded'})
                   .on('error', sass.logError))
      .pipe(gulp.dest('./app'));
});

gulp.task('jade', function() {
    return gulp.src('./src/**/*.jade')
        .pipe(jade())
        .pipe(gulp.dest('./app'));
});

gulp.task('watch', function(){
   gulp.watch('./src/**/*.scss', ['sass']);
   gulp.watch('./src/**/*.jade', ['jade']);
});

gulp.task('default', ['sass', 'jade', 'watch']);
