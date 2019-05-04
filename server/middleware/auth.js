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
    .then(session => {
      console.log(session);
      //  get session row id
      //  get userId from users table using username
      //  use request to update session row with userId
        models.Users.get({username: req.body.username})
          .then(userRow => {
            console.log('phase 1', userRow);
            models.Sessions.update({id: session.insertId}, {userId: userRow.id})
              .then(okPacket => {
                console.log('phase 2', okPacket);
                models.Sessions.get({id: session.insertId})
                  .then(sessionRow => {
                    console.log('phase 3', sessionRow);
                    // res.cookie('sessionId', sessionRow.hash);
                    next(sessionRow.hash);
                    // res.status(201);
                    // res.end();
                  })
              })
          })
        })
        .catch(err => {
          console.log(err);
        })
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

