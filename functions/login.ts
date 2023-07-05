const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const db = require('../lib/db');
const bcrypt = require('bcryptjs');
const { signToken, createResponse } = require('../lib/utils');

module.exports.handler = async function signInUser(event) {
  try {
    const body = JSON.parse(event.body);
    const params = {
      TableName: 'users-table',
      Key: marshall({ pk: body.email }),
    };

    const { Item } = await db.send(new GetItemCommand(params));
    const user = unmarshall(Item);

    const isValidPassword = await bcrypt.compare(
      body.password,
      user.passwordHash
    );

    if (isValidPassword) {
      const token = await signToken(user);
      return createResponse(200, {
        auth: true,
        token: token,
      });
    } else {
      return createResponse(401, {
        msg: 'Invalid credentials',
      });
    }
  } catch (error) {
    return createResponse(error.statusCode, {
      msg: 'Error ocurred',
    });
  }
};
