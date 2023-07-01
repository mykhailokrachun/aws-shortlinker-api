const jwt = require('jsonwebtoken');

async function signToken(user) {
  const secret = Buffer.from(process.env.JWT_SECRET, 'base64');

  return jwt.sign({ email: user.pk }, secret, {
    expiresIn: 86400, // expires in 24 hours
  });
}

function returnExpirationDate(number) {
  if (number === 0) {
    return 0;
  }
  if (number === 1) {
    return Math.floor(+new Date() / 1000) + 60 * 60 * 24;
  }
  if (number === 3) {
    return Math.floor(+new Date() / 1000) + 60 * 60 * 24 * 3;
  }
  if (number === 7) {
    return Math.floor(+new Date() / 1000) + 60 * 60 * 24 * 7;
  }
}

function verifyExpireDate(date) {
  const isValid = /^[0|1|3|7]{1}$/gm.test(date);
  return isValid;
}

function verifyEmail(email) {
  const isValid =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );
  return isValid;
}

function verifyLink(link) {
  const isValid =
    /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      link
    );
  return isValid;
}

async function getUserFromToken(token) {
  const secret = Buffer.from(process.env.JWT_SECRET, 'base64');

  const decoded = jwt.verify(token.replace('Bearer ', ''), secret);

  return decoded;
}

module.exports = {
  getUserFromToken,
  signToken,
  verifyEmail,
  verifyLink,
  verifyExpireDate,
  returnExpirationDate,
};
