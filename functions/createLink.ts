const { getUserFromToken } = require('../lib/utils');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
const {
  verifyLink,
  returnExpirationDate,
  verifyExpireDate,
} = require('../lib/utils');
const db = require('../lib/db');
const srs = require('secure-random-string');

module.exports.handler = async function (event) {
  // get user from JWT
  const userObj = await getUserFromToken(event.headers.Authorization);
  // get link and expire date from body
  const body = JSON.parse(event.body);
  // check if user provided valid link and expire date
  const isValidExpireDate = verifyExpireDate(body.expiresIn);
  if (!body.link || !isValidExpireDate) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        msg: 'Please provide link and time of expiration',
      }),
    };
  }

  const isValidLink = verifyLink(body.link);
  if (!isValidLink) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        msg: 'Please provide valid link',
      }),
    };
  }
  // get expire date in an epoch timestamp format
  const expireDate = returnExpirationDate(body.expiresIn);
  // get unique ID for short link
  const urlId = srs({ length: 6 });
  // construct short link
  const shortUrl = `${process.env.BASE_URL}${urlId}`;
  // create link parameters according to date of expiration
  let linkParams;
  expireDate === 0
    ? (linkParams = {
        TableName: 'links-table',
        Item: marshall({
          pk: urlId,
          sk: 'Link',
          createdBy: userObj.email,
          ogUrl: body.link,
          timesVisited: 0,
          expiresIn: body.expiresIn,
        }),
      })
    : (linkParams = {
        TableName: 'links-table',
        Item: marshall({
          pk: urlId,
          sk: 'Link',
          createdBy: userObj.email,
          ogUrl: body.link,
          timesVisited: 0,
          expiresIn: body.expiresIn,
          ttl: expireDate,
        }),
      });

  await db.send(new PutItemCommand(linkParams));
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify({ shortUrl }),
  };
};
