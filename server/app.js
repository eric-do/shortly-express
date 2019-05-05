const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const cookieParser = require('./middleware/cookieParser');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser);
app.use(Auth.createSession);
app.use(express.static(path.join(__dirname, '../public')));


app.get('/', 
  (req, res) => {
    res.cookie('session', req.session.hash);
    res.writeHead(200);
    res.render('index');
  });

app.get('/create', 
  (req, res) => {
    res.render('index');
  });

app.get('/links', 
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links', 
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

//  create response with cookie
//  create signup route for users who have no cookie or invalid one

app.post('/signup', (req, res, next) => {
  console.log('in signup', req.body);
  // check if user exists
  models.Users.get({username: req.body.username})
    .then(user => {
      if (!user) {
        models.Users.create({username: req.body.username, password: req.body.password})
          .then(() => {
            res.writeHead(201, {'location': '/'});
            res.end();
            next();
          }).catch(err => {
            console.log(err);
          });
      } else {
        res.writeHead(201, {'location': '/signup'});
        res.end();
        next();
      }
    }).catch(err => {
      console.log('err', err);
    });
  //  create new user creds

  //  user compare function returns true

  //  create session for valid user credentials
  // Auth.createSession(req, res, (hash) => {
  //   console.log(hash);
  // });

});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res, next) => {
  // Input: request, response, next (callback)
  // Return: nothing (async)
  // Get request body: user object with username/password
  // Get the user's row from user.get, passing in username as an option
  // Do a password compare, passing in attempted, hashed password, salt
  // If the compare is successful, call createSession, passing in req, res, next
  // Next should take the received hash, and set the user's cookie to the hash value 
  // i.e. Send a cookie with session hash
  // Then direct the user to the index page
  // If the compare is unsuccessful, reload login page
  console.log('posting to login', req.body);
  models.Users.get({username: req.body.username})
    .then(rowObj => {
      console.log('Query for user was successful');
      console.log(rowObj);
      if (rowObj && models.Users.compare(req.body.password, rowObj.password, rowObj.salt)) {
        Auth.createSession(req, res, (hash) => {
          console.log(hash);
          res.cookie('session', hash);
          res.writeHead(201, {'location': '/'});
          res.end();
        });
      } else {
        res.writeHead(201, {'location': '/login'});
        res.end();
      }
    })
    .catch(err => {
      console.log(err);
    });
});

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
