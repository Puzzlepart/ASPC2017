"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

var gulp = require("gulp"),
    tslint = require("gulp-tslint"),
    clean = require('gulp-clean'),
    tsc = require("gulp-typescript"),
    path = require('path'),
    concat = require('gulp-concat'),
    foreach = require("gulp-foreach"),
    runSequence = require("run-sequence"),
    less = require('gulp-less'),
    tslint = require('gulp-tslint'),
    rename = require('gulp-rename'),
    format = require('string-format'),
    config = require("./gulpfile.config.json"),
    vpkg = require("./package.json");

//******************************************************************************
//* TASKS
//******************************************************************************

gulp.task('clean', function () {
    var directories = [];
    directories.push(config.buildOutput.outputFolder);
    return gulp.src(directories, { read: false })
        .pipe(clean());
});

gulp.task('copy', function () {
    return gulp.src([config.buildOutput.sourceFolder + "**/*"])
        .pipe(rename(function (path) {
            path.extname = path.extname.replace('.html', '.txt').replace('.json', '.txt');;
            path.dirname = path.dirname.replace('less', 'css').replace('ts', 'js');
        }))
        .pipe(gulp.dest(config.buildOutput.outputFolder));
});

gulp.task('ts-lint', function () {
    return gulp.src(config.buildOutput.tsFiles)
        .pipe(tslint({ formatter: 'prose' }))
        .pipe(tslint.report());
});

gulp.task('compile-typescript', function () {
    return gulp.src(config.buildOutput.tsFiles)
        .pipe(foreach(function (stream, file) {
            var outFile = file.path.replace(".ts", ".js");
            return stream
                .pipe(tsc({
                    "target": "es5",
                    "sourceMap": true,
                    "removeComments": true,
                    "out": outFile
                }
                ))
                .pipe(gulp.dest('.'));
        }));
});

gulp.task('clean-typescript', function () {
    return gulp.src(config.buildOutput.outputFolder + '/**/*.ts', { read: false })
        .pipe(clean());
});

gulp.task('compile-less', function () {
    return gulp.src(config.buildOutput.lessFiles)
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')],
            compress: false
        }))
        .pipe(gulp.dest(config.buildOutput.outputFolder + '/css/'));
});

gulp.task('clean-less', function () {
    return gulp.src(config.buildOutput.lessFiles, { read: false })
        .pipe(clean());
});

gulp.task("default", function () {
    runSequence("clean", "copy", "ts-lint", "compile-less", "compile-typescript", "clean-typescript", "clean-less");
});