const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // Input: request object with a cookie property containing cookie object
  /**
   * check request for session in cookies
   * if cookie session present
   *    look up session in table
   *    assign session info to session property on request
   * if no cookie session present
   *    create session
   *    assign session info to session property on request
   * call next with request and response parameters
   */

  console.log('creating session');
  if (req.cookies.session) {
    // look up session
    //  check if existing session userId matches current visitor username
    models.Sessions.get({hash: req.cookies.session})
      .then(sessionRecord => {
        req.session = sessionRecord;
        res.cookie('shortlyid', req.session.hash);
        next();
      })
      .catch(err => {
        console.log(err);
        next();
      });
  } else {
    models.Sessions.create()
      .then(session => {
        console.log('created session');
        return models.Sessions.get({id: session.insertId});
      })
      .then(sessionRecord => {
        req.session = sessionRecord.hash;
        res.cookie('shortlyid', req.session.hash);
        next();
      })
      .catch(err => {
        console.log(err);
        next();
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

