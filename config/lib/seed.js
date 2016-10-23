'use strict';

var _ = require('lodash'),
  config = require('../config'),
  mongoose = require('mongoose'),
  chalk = require('chalk'),
  crypto = require('crypto');

// global seed options object
var seedOptions = {};

function removeUser (user) {
  return new Promise(function (resolve, reject) {
    var User = mongoose.model('User');
    User.find({ username: user.username }).remove(function (err) {
      if (err) {
        reject(new Error('Failed to remove local ' + user.username));
      }
      resolve();
    });
  });
}

function saveUser (user) {
  return function() {
    return new Promise(function (resolve, reject) {
      // Then save the user
      user.save(function (err, theuser) {
        if (err) {
          console.log(chalk.bold.red(err));
          reject(new Error('Failed to add local ' + user.username));
        } else {
          resolve(theuser);
        }
      });
    });
  };
}

function saveSongIfAbsent (song) {
  return function(isAbsent) {
    return new Promise(function (resolve, reject) {
      if (isAbsent) {
        song.save(function (err, thesong) {
          if (err) {
            reject(new Error('Failed to add song' + song.title));
          } else {
            resolve(thesong);
          }
        });
      } else {
        if (seedOptions.logResults) {
          console.log(chalk.bold.red('Database Seeding:\tSong already exists: ' + song.title));
        }
        resolve();
      }
    });
  };
}

function checkUserNotExists (user) {
  return new Promise(function (resolve, reject) {
    var User = mongoose.model('User');
    User.find({ username: user.username }, function (err, users) {
      if (err) {
        reject(new Error('Failed to find local account ' + user.username));
      }

      if (users.length === 0) {
        resolve();
      } else {
        reject(new Error('Failed due to local account already exists: ' + user.username));
      }
    });
  });
}

function checkSongNotExists (song) {
  return new Promise(function (resolve, reject) {
    var Song = mongoose.model('Song');
    Song.find({ title: song.title }, function (err, songs) {
      if (err) {
        reject(new Error('Failed to find song ' + song.title));
      }
      resolve(songs.length === 0);
    });
  });
}

function reportSuccess (password) {
  return function (user) {
    return new Promise(function (resolve, reject) {
      if (seedOptions.logResults) {
        console.log(chalk.bold.red('Database Seeding:\tLocal ' + user.username + ' added with password set to ' + password));
      }
      resolve();
    });
  };
}

// save the specified user with the password provided from the resolved promise
function seedTheUser (user) {
  return function (password) {
    return new Promise(function (resolve, reject) {
      // set the new password
      user.password = password;

      if (user.username === seedOptions.seedAdmin.username && process.env.NODE_ENV === 'production') {
        checkUserNotExists(user)
          .then(saveUser(user))
          .then(reportSuccess(password))
          .then(function () {
            resolve();
          })
          .catch(function (err) {
            reject(err);
          });
      } else {
        removeUser(user)
          .then(saveUser(user))
          .then(reportSuccess(password))
          .then(function () {
            resolve();
          })
          .catch(function (err) {
            reject(err);
          });
      }
    });
  };
}

// save the specified song if it doesn't already exist
function seedTheSong (song) {
  return new Promise(function (resolve, reject) {
    checkSongNotExists(song)
      .then(saveSongIfAbsent(song))
      .then(function (song) {
        if (song && seedOptions.logResults) {
          console.log(chalk.bold.red('Database Seeding:\tSong ' + song.title + ' added'));
        }
        resolve();
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

// report the error
function reportError (reject) {
  return function (err) {
    if (seedOptions.logResults) {
      console.log();
      console.log('Database Seeding:\t' + err);
      console.log();
    }
    reject(err);
  };
}

module.exports.start = function start(options) {
  // Initialize the default seed options
  seedOptions = _.clone(config.seedDB.options, true);

  // Check for provided options

  if (_.has(options, 'logResults')) {
    seedOptions.logResults = options.logResults;
  }

  if (_.has(options, 'seedUser')) {
    seedOptions.seedUser = options.seedUser;
  }

  if (_.has(options, 'seedAdmin')) {
    seedOptions.seedAdmin = options.seedAdmin;
  }

  if (_.has(options, 'seedSong')) {
    seedOptions.seedSong = options.seedSong;
  }

  var User = mongoose.model('User');
  var Song = mongoose.model('Song');
  return new Promise(function (resolve, reject) {

    var adminAccount = new User(seedOptions.seedAdmin);
    var userAccount = new User(seedOptions.seedUser);
    var song = new Song(seedOptions.seedSong);

    // If production only seed admin if it does not exist
    if (process.env.NODE_ENV === 'production') {
      User.generateRandomPassphrase()
        .then(seedTheUser(adminAccount))
        .then(function () {
          resolve();
        })
        .catch(reportError(reject));
    } else {
      // Add both Admin and User account

      User.generateRandomPassphrase()
        .then(seedTheUser(userAccount))
        .then(User.generateRandomPassphrase)
        .then(seedTheUser(adminAccount))
        .then(seedTheSong(song))
        .then(function () {
          resolve();
        })
        .catch(reportError(reject));
    }
  });
};
