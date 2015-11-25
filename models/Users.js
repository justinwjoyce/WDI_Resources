var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  hash: String,
  salt: String
});

//Methods ==============
//accepts a password then generates a salt and associated password hash.
UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');//The pbkdf2Sync() function takes four parameters: password, salt, iterations, and key length. Make sure the iterations and key length in our setPassword() method match the ones in our validPassword() method
};
// accepts a password and compares it to the hash stored, returning a boolean.
UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),//specifies when token expires(this is hardcoded in but in the future I should use an enviroment variable for referencing the secret and keep it out of codebase)
  }, 'SECRET');
};

mongoose.model('User', UserSchema);