var gulp = require('gulp'),
    sass = require('gulp-sass'),
    pug = require('gulp-pug');

gulp.task('sass', function(){
   return gulp.src('./src/**/*.scss')
      .pipe(sass({ includePaths : ['src/**/'],
                   outputStyle: 'expanded'})
                   .on('error', sass.logError))
      .pipe(gulp.dest('./app'));
});

gulp.task('pug', function() {
    return gulp.src('./src/**/*.jade')
        .pipe(pug())
        .pipe(gulp.dest('./app'));
});

gulp.task('watch', function(){
   gulp.watch('./src/**/*.scss', ['sass']);
   gulp.watch('./src/**/*.jade', ['pug']);
});

gulp.task('default', ['sass', 'pug', 'watch']);
