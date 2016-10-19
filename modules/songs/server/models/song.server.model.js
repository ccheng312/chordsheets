'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Song Schema
 */
var SongSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    trim: true,
    unique: true,
    required: 'Title cannot be blank'
  },
  artist: {
    type: String,
    default: '',
    trim: true
  },
  defaultKey: {
    type: String,
    trim: true,
    match: /^[A-G][b#]?m?$/,
    required: 'Default key cannot be blank'
  },
  bpm: Number,
  tags: {
    type: [String],
    lowercase: true
  },
  content: {
    type: String,
    trim: true,
    required: 'Content cannot be blank'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Song', SongSchema);
