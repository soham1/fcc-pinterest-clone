'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pin = new Schema({
   userId: {type: Schema.Types.ObjectId, ref: 'User'},
   userName: String,
   title: String,
   pinUrl: String,
   createdDate: Date
});

module.exports = mongoose.model('Pin', Pin);
