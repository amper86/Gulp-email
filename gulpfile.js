const gulp = require('gulp');
const browserSync = require('browser-sync').create();

//scss
const sass = require('gulp-sass');

//pug
const pug = require('gulp-pug');

//вспомогательные плагины
const debug = require('gulp-debug'), //отслеживание работы тасков в терминале
    del = require('del'), //удаление папок и файлов
    inlineCss = require('gulp-inline-css'), //создание инлайн-стилей
    plumber = require('gulp-plumber'); //обработка ошибок


//пути app - разработка, dist - готовая сборка
const paths = {
    app: './app/',
    dist: './dist/'
};

//browser-sync
gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: paths.app,
            index: 'email.html'
        },
        port: 8086,
        open: true
    });
    gulp.watch([paths.app + '**/*.pug', paths.app + '**/*.scss'], gulp.series('build'));
    browserSync.watch(paths.app + '**/*.html').on('change', browserSync.reload);
});

//html
gulp.task('html', function () {
    return gulp.src(paths.app + 'pug/email.pug')
        .pipe(plumber())
        .pipe(debug({title: 'Pug source'}))
        .pipe(pug({
            pretty: true, //в документации написано что устарела
            doctype: 'HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"'
        }))
        .pipe(debug({title: 'Pug'}))
        .pipe(gulp.dest(paths.app))
        .pipe(debug({title: 'Pug dest'}))
        .pipe(browserSync.stream());
});

//scss
gulp.task('scss', function() {
    return gulp.src(paths.app + 'scss/main.scss')
        .pipe(plumber())
        .pipe(debug({title: 'Sass source'}))
        .pipe(sass())
        .pipe(debug({title: 'Sass'}))
        .pipe(gulp.dest(paths.app + 'css/'))
        .pipe(debug({title: 'Sass dest'}))
        .pipe(browserSync.stream());
});

//удаление перед сборкой проекта
gulp.task('clean', function() {
    return del(paths.dist);
});

// Таск для формирования инлайн-стилей из внешнего файла
gulp.task('inline', function() {
    return gulp.src(paths.app + 'email.html') // Исходник для таска inline (inline task source)
        .pipe(plumber())
        .pipe(debug({title: 'Inline CSS sourse'}))
        .pipe(inlineCss({ // Преобразование стилей из внешнего файла inline.css в инлайн-стили (conversion components in inline components)
            preserveMediaQueries: true, // Сохранение медиа-запросов в тегах style HTML-шаблона (saving of media queries)
            applyTableAttributes: true // Преобразование табличных стилей в атрибуты (conversion of table components in attributes)
        }))
        .pipe(debug({title: 'Main CSS'}))
        .pipe(gulp.dest(paths.dist))
        .pipe(debug({title: 'Main CSS dest'}));
});

//Сборка
gulp.task('build', gulp.series('html', 'scss', 'clean', 'inline'));

//Разработка
gulp.task('default', gulp.series('build', 'serve'));