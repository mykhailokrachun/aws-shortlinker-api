const jwt = require('jsonwebtoken');

async function signToken(user) {
  const secret = Buffer.from(process.env.JWT_SECRET, 'base64');

  return jwt.sign({ email: user.pk }, secret, {
    expiresIn: '1d',
  });
}

async function getUserFromToken(token) {
  const secret = Buffer.from(process.env.JWT_SECRET, 'base64');

  const decoded = jwt.verify(token.replace('Bearer ', ''), secret);

  return decoded;
}

function createResponse(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
}

function verifyLink(link) {
  const isValid =
    /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      link
    );
  return isValid;
}

module.exports = {
  getUserFromToken,
  signToken,
  createResponse,
  verifyLink,
};
