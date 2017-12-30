'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'jasmine', 'browserify' ],

    files: [
      'test/**/*Spec.js',
    ],

    reporters: [ 'spec', 'dots', 'coverage' ],

    preprocessors: {
      'test/**/*Spec.js': [ 'browserify' ],
    },

    browsers: [ 'ChromeHeadless'],

    logLevel: 'LOG_DEBUG',

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [
        [
          'babelify',
          {
            presets: ["es2015"],
            plugins: ["transform-es2015-parameters", "transform-class-properties"]
          }
        ],
        'brfs'
      ]
    },
    coverageReporter: {
      dir: 'coverage',
      reporters: [
          { type: 'clover' },
          { type: 'html', subdir: 'html' },
          { type: 'json' }
      ]
    }
  });
};
