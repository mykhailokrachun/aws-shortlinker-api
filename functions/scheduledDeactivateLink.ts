const { marshall } = require('@aws-sdk/util-dynamodb');
const db = require('../lib/db');
const sqs = require('../lib/sqs');
const { SendMessageCommand } = require('@aws-sdk/client-sqs');
const { DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

module.exports.handler = async function (event) {
  try {
    const queueParams = {
      MessageBody: JSON.stringify({
        email: event.email,
        message: `Link with ID ${event.urlId} has been deactivated`,
      }),
      QueueUrl: `https://sqs.us-east-1.amazonaws.com/${process.env.ACCOUNT_ID}/shortlinker-queue`,
    };
    await sqs.send(new SendMessageCommand(queueParams));
    // params for delete
    const deleteParams = {
      TableName: 'links-table',
      Key: marshall({ pk: event.urlId }),
    };
    await db.send(new DeleteItemCommand(deleteParams));
  } catch (error) {
    console.log(error);
  }
};
