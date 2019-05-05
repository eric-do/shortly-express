const parseCookies = (req, res, next) => {
  let cookieObject = {};
  if (req.headers.cookie) {
    let cookies = req.headers.cookie.split(';');
    cookies.forEach((cookie) => {
      let pair = cookie.split('=');
      cookieObject[pair[0].trim()] = pair[1];
    }); 
  }
  req.cookies = cookieObject;
  console.log('cookies parsed:', req.cookies);
  next();
};

module.exports = parseCookies;

