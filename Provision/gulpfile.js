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
    fs = require('fs'),
    rename = require('gulp-rename'),
    exec = require('child_process').exec,
    git = require('gulp-git'),
    gitWatch = require('gulp-git-watch'),
    format = require('string-format'),
    // = require('typings'),
    config = require("./gulpfile.config.json"),
    vpkg = require("./package.json"),
    debug = require("gulp-debug"),
    concat = require("gulp-concat"),
    insert = require("gulp-insert"),
    gxml = require('gulp-xml2js'),
    replace = require('gulp-replace');

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
            path.extname = path.extname.replace('.html', '.txt');
            if(path.dirname == 'ts' || path.dirname == 'less') {
                path.dirname = path.dirname.replace('less', 'css').replace('ts', 'js');
            }
        }))
        .pipe(gulp.dest(config.buildOutput.outputFolder));
});

gulp.task('ts-lint', ['copy'], function () {
    return gulp.src(config.buildOutput.tsFiles)
        .pipe(tslint({ formatter: 'prose' }))
        .pipe(tslint.report());
});

gulp.task('compile-typescript', ['copy'], function () {
    return gulp.src(config.buildOutput.tsFiles)
        .pipe(foreach(function (stream, file) {
            var outFile = file.path.replace(".ts", ".js");
            return stream
                .pipe(tsc({
                    "target": "es5",
                    "sourceMap": true,
                    "removeComments": true,
                    "outFile": outFile
                }))
                .pipe(gulp.dest('.'));
        }));
});

gulp.task('build-resources', function () {
    return gulp.src(config.buildOutput.resxFiles)
        .pipe(foreach(function (stream, file) {
            return stream
                //.pipe(debug())
                .pipe(replace('<root>', '<resource id="' + path.basename(file.path, path.extname(file.path)) + '">'))
                .pipe(replace('</root>', '</resource>'));
        }))
        .pipe(replace(/<xsd:schema.*?>[^]+?xsd:schema>/g, ''))
        .pipe(replace(/<resheader.*?>[^]+?resheader>/g, ''))
        .pipe(replace(/<\?xml.*?>/g, ''))
        .pipe(replace('xml:space="preserve"', ''))
        .pipe(concat('resources.js'))
        .pipe(insert.prepend("<resources>"))
        .pipe(insert.append("</resources>"))
        .pipe(gxml())
        .pipe(insert.prepend("window.pageResources = JSON.parse('"))
        .pipe(insert.append("');"))
        .pipe(gulp.dest(config.buildOutput.outputFolder + "/js"));
});

gulp.task('concatenate-resources', function () {
    return gulp.src(config.buildOutput.resourceJS)
        .pipe(concat('resources.js'))
        .pipe(gulp.dest(config.buildOutput.outputFolder + "/js"));
});

gulp.task('clean-typescript', function () {
    return gulp.src(config.buildOutput.outputFolder + '/**/*.ts', { read: false })
        .pipe(clean());
});

gulp.task('compile-less', ['copy'], function () {
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

gulp.task('version-hash', function () {
    currentversion(function (version) {
        console.log("Stamping current version to files: " + version);
        gulp.src(config.buildOutput.outputFolder + '/*/**/version.txt', { read: false }).pipe(
            foreach(function (stream, file) {
                console.log(file.path);
                fs.writeFile(file.path, version, function (err) {
                    if (err) throw err;
                });
                return stream;
            })
        );
    });
});

gulp.task("default", function () {
    runSequence("clean", "copy", "ts-lint", "compile-less", "compile-typescript", "clean-typescript", "clean-less", "build-resources", "concatenate-resources");
});

gulp.task('checkout-dev', function () {
    git.checkout('dev', function (err) {
        if (err) throw err;
    });
});

gulp.task('pull-dev', ['checkout-dev'], function () {
    git.pull('origin', 'dev', function (err) {
        if (err) throw err;
    });
});

gulp.task('git-watch', function () {
    gitWatch({ poll: config.watch.interval, initialPoll: config.watch.initial })
        .on('check', function () {
            console.log('Polled repo for change. 60s until next check');
        })
        .on('change', function (newHash, oldHash) {
            console.log('We got some changes.', oldHash, '->', newHash);
            runSequence("build-dev");
        });
});

gulp.task('powershell', function (callback) {
    exec("Powershell.exe  -executionpolicy remotesigned -File gulp.ps1", function (err, stdout, stderr) {
        console.log(stdout);
        callback(err)
    });
});

function currentversion(callback) {
    exec('git rev-parse --short=8 HEAD', function (err, stdout, stderr) {
        callback(config.version + '.' + stdout);
    });
}