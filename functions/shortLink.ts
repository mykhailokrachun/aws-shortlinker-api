const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const {
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');
const db = require('../lib/db');
const sqs = require('../lib/sqs');
const { SendMessageCommand } = require('@aws-sdk/client-sqs');

module.exports.handler = async function (event) {
  const queryParams = {
    TableName: 'links-table',
    KeyConditionExpression: 'pk = :value',
    ExpressionAttributeValues: marshall({
      ':value': event.pathParameters.urlId,
    }),
  };

  //get link by id
  const { Items } = await db.send(new QueryCommand(queryParams));
  const result = unmarshall(Items[0]);

  // deactivate link after visit if expiresIn === 0 and send new queue to notify user after visit about link deactivation
  if (result.expiresIn === 0) {
    const queueParams = {
      MessageBody: JSON.stringify({
        email: result.createdBy,
        message: `Link with ID ${event.pathParameters.urlId} has been deactivated`,
      }),
      QueueUrl: `https://sqs.us-east-1.amazonaws.com/${process.env.ACCOUNT_ID}/shortlinker-queue`,
    };
    await sqs.send(new SendMessageCommand(queueParams));
    const deleteParams = {
      TableName: 'links-table',
      Key: marshall({ pk: event.pathParameters.urlId }),
    };
    await db.send(new DeleteItemCommand(deleteParams));
  } else {
    // increase the number of visits
    const updateParams = {
      TableName: 'links-table',
      Key: marshall({ pk: event.pathParameters.urlId }),
      UpdateExpression: 'set timesVisited = :value',
      ExpressionAttributeValues: marshall({
        ':value': result.timesVisited + 1,
      }),
    };
    await db.send(new UpdateItemCommand(updateParams));
  }

  return {
    statusCode: 301,
    headers: {
      Location: result.ogUrl,
    },
  };
};
