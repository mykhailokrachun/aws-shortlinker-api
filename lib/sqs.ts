const { SQSClient } = require('@aws-sdk/client-sqs');
const sqsClient = new SQSClient({});
module.exports = sqsClient;
