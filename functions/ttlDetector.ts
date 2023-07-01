const sqs = require('../lib/sqs');
const { SendMessageCommand } = require('@aws-sdk/client-sqs');

module.exports.handler = async function (event) {
  const eventName = event.Records[0].eventName;
  const id = event.Records[0].dynamodb.Keys.pk.S;
  // only notify user about the deactivation of link in case ttl expiration
  if (eventName === 'REMOVE' && event.Records[0].dynamodb.OldImage.ttl) {
    const time = Math.floor(+new Date() / 1000);
    if (time < Number(event.Records[0].dynamodb.OldImage.ttl.N)) {
      return;
    }
    const queueParams = {
      MessageBody: JSON.stringify({
        email: event.Records[0].dynamodb.OldImage.createdBy.S,
        message: `Link with ID ${id} has been deactivated`,
      }),
      QueueUrl: process.env.SQS_QUEUE_URL,
    };
    await sqs.send(new SendMessageCommand(queueParams));
  } else {
    console.log('Skipping execution');
  }
};
