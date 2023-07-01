const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const db = require('../lib/db');
const { getUserFromToken } = require('../lib/utils');
const sqs = require('../lib/sqs');
const { SendMessageCommand } = require('@aws-sdk/client-sqs');
const { QueryCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

module.exports.handler = async function (event) {
  try {
    const { email } = await getUserFromToken(event.headers.Authorization);
    // check if signed in user is the creator of the link it is trying to deactivate
    const queryParams = {
      TableName: 'links-table',
      KeyConditionExpression: 'pk = :value',
      ExpressionAttributeValues: marshall({
        ':value': event.pathParameters.urlId,
      }),
    };
    const { Items } = await db.send(new QueryCommand(queryParams));
    const result = unmarshall(Items[0]);
    if (result.createdBy !== email) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Current user cannot deactivate link with such id',
        }),
      };
    }
    // params for queue
    const queueParams = {
      MessageBody: JSON.stringify({
        email,
        message: `Link with ID ${event.pathParameters.urlId} has been deactivated`,
      }),
      QueueUrl: process.env.SQS_QUEUE_URL,
    };
    await sqs.send(new SendMessageCommand(queueParams));
    // params for delete
    const deleteParams = {
      TableName: 'links-table',
      Key: marshall({ pk: event.pathParameters.urlId, sk: 'Link' }),
    };
    await db.send(new DeleteItemCommand(deleteParams));
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({
        msg: `Link with ID ${event.pathParameters.urlId} successfully deactivated`,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to deactivate link',
        errorMsg: error.message,
        errorStack: error.stack,
      }),
    };
  }
};
