'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'jasmine', 'browserify' ],

    files: [
      'test/**/*Spec.js'
    ],

    reporters: [ 'spec', 'dots' ],

    preprocessors: {
      'test/**/*Spec.js': [ 'browserify' ]
    },

    browsers: [ 'Chrome' ],

    logLevel: 'LOG_DEBUG',

    singleRun: false,
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
    }
  });
};
