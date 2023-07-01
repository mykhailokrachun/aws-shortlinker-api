const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const db = require('../lib/db');
const bcrypt = require('bcryptjs');
const { signToken, verifyEmail } = require('../lib/utils');

module.exports.handler = async function signInUser(event) {
  try {
    const body = JSON.parse(event.body);
    // check if user provided valid email and password
    if (!body.email || !body.password) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          msg: 'Please provide email and password',
        }),
      };
    }
    const isValidEmail = verifyEmail(body.email);
    if (!isValidEmail) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          msg: 'Please provide valid email',
        }),
      };
    }
    const params = {
      TableName: 'users-table',
      Key: marshall({ pk: body.email, sk: 'User' }),
    };

    const { Item } = await db.send(new GetItemCommand(params));
    const user = unmarshall(Item);

    const isValidPassword = await bcrypt.compare(
      body.password,
      user.passwordHash
    );

    if (isValidPassword) {
      const token = await signToken(user);
      return {
        statusCode: 200,
        body: JSON.stringify({ auth: true, token: token, status: 'Success' }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({
          msg: 'Invalid credentials',
        }),
      };
    }
  } catch (err) {
    return {
      statusCode: err.statusCode,
      body: JSON.stringify({
        msg: 'Error ocurred',
      }),
    };
  }
};
