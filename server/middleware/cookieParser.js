const parseCookies = (req, res, next) => {
  let cookieObject = {};
  if (req.headers.cookie) {
    let cookies = req.headers.cookie.split(';');
    cookies.forEach((cookie) => {
      let pair = cookie.split('=');
      cookieObject[pair[0]] = pair[1];
    });
    req.cookies = cookieObject;
  }
  next();
};


// name=fayola; city=San%20Francisco

module.exports = parseCookies;

