import gulp from 'gulp';
import gulpif from 'gulp-if';
import runSequence from 'run-sequence';
import minifycss from 'gulp-minify-css';
import path from 'path';
import webpack from 'webpack';
import SplitByPathPlugin from 'webpack-split-by-path';
import webpackStream from 'webpack-stream';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer-core';
import del from 'del';

const DEBUG = process.env.ENVIRONMENT !== 'production';

const paths = {
  styles: 'src/*.css',
  src: path.resolve(__dirname, 'src'),
  build: path.resolve(__dirname, 'build'),
  node_modules: path.resolve(__dirname, 'node_modules'),
};

const webpackConfig = {
  resolve: {
    root: paths.src,
    extensions: ['', '.js', '.jsx'],
    alias: {
      app: 'scripts',
    },
  },
  externals: {
    primus: 'Primus',
  },
  entry: {
    app: 'app',
  },
  output: {
    path: paths.build,
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  plugins: [
    new SplitByPathPlugin([
      {
        path: paths.node_modules,
        name: 'vendor',
      },
    ]),
    new webpack.DefinePlugin({
      DEBUG: JSON.stringify(DEBUG),
      'process.env.NODE_ENV': JSON.stringify(process.env.ENVIRONMENT),
    }),
    !DEBUG && new webpack.optimize.DedupePlugin(),
    !DEBUG && new webpack.optimize.OccurenceOrderPlugin(),
    !DEBUG && new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ].filter(Boolean),
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel?stage=1',
        include: paths.src,
      },
    ],
  },
  devtool: DEBUG && 'inline-source-map',
};

gulp.task('clean', cb => {
  del(paths.build, cb);
});

function scriptsTask(watch) {
  return () => gulp.src([])
    .pipe(webpackStream({
      ...webpackConfig,
      colors: true,
      watch: watch,
    }))
    .pipe(gulp.dest(paths.build));
}

gulp.task('build:scripts', scriptsTask(false));
gulp.task('watch:scripts', scriptsTask(true));

gulp.task('build:styles', () => {
  return gulp.src(paths.styles)
    .pipe(gulpif(DEBUG, sourcemaps.init()))
    .pipe(postcss([
      autoprefixer({
        browsers: ['last 2 versions'],
      }),
    ]))
    .pipe(gulpif(!DEBUG, minifycss()))
    .pipe(gulpif(DEBUG, sourcemaps.write()))
    .pipe(gulp.dest(paths.build));
});

gulp.task('watch:styles', ['build:styles'], () => {
  gulp.watch(paths.styles, ['build:styles']);
});

gulp.task('build', ['build:scripts', 'build:styles']);
gulp.task('watch', ['watch:scripts', 'watch:styles']);
gulp.task('default', cb => runSequence('clean', 'build', cb));
