import { resolve as resolvePath } from 'path';

export default function(config: any) {
  const firefoxFlags = ['-headless'];
  const chromeFlags = [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
  ];

  const selectedBrowser = process.env.BROWSER || 'chrome';
  const browsers = [];
  const customLaunchers = {} as any;
  if (selectedBrowser === 'chrome') {
    browsers.push('ChromeWebRTC');
    customLaunchers.ChromeWebRTC = {
      base: 'Chrome',
      flags: chromeFlags,
    };
  } else if (selectedBrowser === 'firefox') {
    browsers.push('FirefoxWebRTC');
    customLaunchers.FirefoxWebRTC = {
      base: 'Firefox',
      flags: firefoxFlags,
      prefs: {
        'media.autoplay.default': 0,
        'media.autoplay.enabled': true,
        'media.gstreamer.enabled': true,
        'media.navigator.permission.disabled': true,
        'media.navigator.streams.fake': true,
      },
    };
  }

  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'karma-typescript'],

    proxies: {
      '/images/': resolvePath('./tests/integration/images'),
      '/assets/': resolvePath('./assets'),
    },

    // list of files / patterns to load in the browser
    files: [
      './lib/**/*.ts',
      './tests/integration/**/*.ts',
      './tests/integration/**/*.js',
      './tests/integration/**/*.png',
      './tests/integration/**/*.jpg',
      {
        pattern: './assets/**/*',
        included: false,
        served: true,
        watched: false,
        nocache: true,
      }
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './lib/**/*.ts': 'karma-typescript',
      './tests/integration/**/*.ts': 'karma-typescript',
    },

    envPreprocessor: ['BROWSER'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'karma-typescript'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1,

    // options passed to the typescript compiler
    karmaTypescriptConfig: {
      coverageOptions: {
        exclude: /tests\/.*/,
      },
      include: [
        './lib/**/*.ts',
        './tests/integration/**/*.ts',
      ],
      tsconfig: './tsconfig.json',
      reports: {
        html: './coverage/integration',
        text: '',
      },
    },

    customLaunchers,
  });
}
