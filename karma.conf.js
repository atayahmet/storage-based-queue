module.exports = function (karma) {
  karma.set({
    frameworks: ['browserify', 'jasmine'],

    files: ['src/**/*.js', 'test/**/*Spec.js'],

    reporters: ['spec', 'dots', 'coverage'],

    preprocessors: {
      'test/**/*Spec.js': ['browserify'],
      'src/**/*.js': ['browserify'],
    },

    browsers: ['ChromeHeadless'],

    // logLevel: 'LOG_DEBUG',

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [
        [
          'babelify',
          {
            presets: ["@babel/preset-env", '@babel/preset-flow'],
            plugins: ['istanbul'],
          },
        ],
        'brfs',
      ],
    },
    coverageReporter: {
      instrumenterOptions: {
        istanbul: { noCompact: true },
      },
      reporters: [
        {
          type: 'lcov',
          dir: 'coverage/html/',
          subdir(browser, platform) {
            // normalization process to keep a consistent browser name
            return browser.toLowerCase().split(' ')[0];
          },
        },
        { type: 'text-summary' },
      ],
    },
  });
};
