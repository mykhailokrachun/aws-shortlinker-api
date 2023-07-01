const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const bcrypt = require('bcryptjs');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { signToken, verifyEmail } = require('../lib/utils');
const { marshall } = require('@aws-sdk/util-dynamodb');
const db = require('../lib/db');

module.exports.handler = async function registerUser(event) {
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
    // check if user with such email already registered
    const params = {
      TableName: 'users-table',
      Key: marshall({ pk: body.email, sk: 'User' }),
    };

    const { Item } = await db.send(new GetItemCommand(params));
    if (Item) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          msg: 'User with such email already registered',
        }),
      };
    }
    const passwordHash = await bcrypt.hash(body.password, 8);
    const marshallOptions = {
      convertEmptyValues: false,
      removeUndefinedValues: false,
      convertClassInstanceToMap: false,
    };

    const unmarshallOptions = {
      wrapNumbers: false,
    };
    const translateConfig = { marshallOptions, unmarshallOptions };
    const client = new DynamoDBClient({});
    const dynamoDb = DynamoDBDocument.from(client, translateConfig);
    const putParams = {
      TableName: 'users-table',
      Item: {
        pk: body.email,
        sk: 'User',
        passwordHash,
      },
    };
    await dynamoDb.put(putParams);
    const token = await signToken({ passwordHash, sk: 'User', pk: body.email });

    return {
      statusCode: 201,
      body: JSON.stringify({
        msg: `User with email ${body.email} was successfully created`,
        token,
      }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        msg: 'Error ocurred',
      }),
    };
  }
};
