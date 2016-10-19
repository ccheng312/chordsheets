'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGODB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/chordsheets-dev',
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    fileLogger: {
      directoryPath: process.cwd(),
      fileName: 'app.log',
      maxsize: 10485760,
      maxFiles: 2,
      json: false
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    username: '@TWITTER_USERNAME',
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/github/callback'
  },
  paypal: {
    clientID: process.env.PAYPAL_ID || 'CLIENT_ID',
    clientSecret: process.env.PAYPAL_SECRET || 'CLIENT_SECRET',
    callbackURL: '/api/auth/paypal/callback',
    sandbox: true
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  livereload: true,
  seedDB: {
    seed: process.env.MONGO_SEED === 'true',
    options: {
      logResults: process.env.MONGO_SEED_LOG_RESULTS !== 'false',
      seedUser: {
        username: process.env.MONGO_SEED_USER_USERNAME || 'seeduser',
        provider: 'local',
        email: process.env.MONGO_SEED_USER_EMAIL || 'user@localhost.com',
        firstName: 'User',
        lastName: 'Local',
        displayName: 'User Local',
        roles: ['user']
      },
      seedAdmin: {
        username: process.env.MONGO_SEED_ADMIN_USERNAME || 'seedadmin',
        provider: 'local',
        email: process.env.MONGO_SEED_ADMIN_EMAIL || 'admin@localhost.com',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        roles: ['user', 'admin']
      },
      seedSong: {
        title: '10000 Reasons',
        artist: 'Matt Redman',
        defaultKey: 'G',
        bpm: 73,
        content: '{CHORUS}\n' +
          'Bless the [C]Lord, O my [G]soul, [D/F#]O my [Em]soul,\n' +
          '[C]Worship His ho[G]ly n[Dsus4]ame.    [D]\n' +
          'Sing like [C]never be[Em]fore, [C]O  [D]my [Em]soul.\n' +
          'I\'ll [C]worship Your ho[D]ly na[C/G]me.   [G]\n' +
          '\n' +
          '{VERSE 1}\n' +
          'The [C]sun comes [G]up, it\'s a [D]new day [Em]dawning;\n' +
          '[C] It\'s time to [G]sing Your song[D] ag[Em]ain.\n' +
          'What[C]ever may [G]pass, and what[D]ever lies be[Em]fore me,\n' +
          '[C2] Let me be [G]singing when the [Dsus4]eve[D]ning [G]comes.[Gsus4]    [G]\n' +
          '\n' +
          '{VERSE 2}\n' +
          'You\'re [C]rich in [G]love, and You\'re [D]slow to [Em]anger.\n' +
          'Your [C]name is [G]great, and Your [D]heart is [Em]kind.\n' +
          'For [C]all Your [G]goodness, I will [D]keep on [Em]singing;\n' +
          '[C2] Ten thousand [G]reasons for my [Dsus4]heart [D]to [G]find. [Gsus4]    [G]\n' +
          '\n' +
          '{VERSE 3}\n' +
          'And [C]on that [G]day when my [D]strength is [Em]failing,\n' +
          'The [C]end draws [G]near, and my [D]time has [Em]come;\n' +
          '[C]Still my [G]soul will sing Your [D]praise un[Em]ending:\n' +
          '[C2] Ten thousand [G]years and then for[Dsus4]e[D]ver[G]more! [Gsus4]    [G]\n' +
          '\n' +
          '{TAG}\n' +
          '[Em]  I\'ll [C]worship Your [D]holy [Em]name.\n' +
          'Yes, I\'ll [C]worship Your [D]holy [G]name.'
      }
    }
  }
};
