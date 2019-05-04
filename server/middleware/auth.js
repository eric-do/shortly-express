const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // Input: request object with a cookie property containing cookie object
  // Accessed parsed cookie
  // Create record with session hash in sessions table
  // Query user table for userid
  // Insert userId (using request data) into sessions table on row of session hash
  // Pass on session hash to return to browser in cookie
  models.Sessions.create()
    .then((a, b, c) => {
      console.log(a, b, c);
      return models.Users.get({username: req.body.username});
    })
    .then(userObj => {
      return models.Sessions.update({hash: sess.hash}, {userId: userObj.id});
    })
    .then(hashObj => {
      next(hashObj.hash);
    })
    .catch(err => {
      console.log(err);
    });
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

