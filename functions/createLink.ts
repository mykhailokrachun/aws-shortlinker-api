const { marshall } = require('@aws-sdk/util-dynamodb');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
const db = require('../lib/db');
const {
  createResponse,
  verifyLink,
  getUserFromToken,
} = require('../lib/utils');
const {
  SchedulerClient,
  CreateScheduleCommand,
} = require('@aws-sdk/client-scheduler');
const moment = require('moment');
const crypto = require('crypto');

module.exports.handler = async function (event) {
  // get user from JWT
  const userObj = await getUserFromToken(event.headers.Authorization);
  // get link and expire date from body
  const body = JSON.parse(event.body);
  //check if link valid
  const isValidLink = verifyLink(body.link);
  if (!isValidLink) {
    return createResponse(502, {
      msg: 'Please provide valid link',
    });
  }
  // get unique ID for short link
  const urlId = crypto.randomBytes(3).toString('hex');
  // construct short link
  const shortUrl = `${process.env.BASE_URL}${urlId}`;
  // create link parameters according to date of expiration
  const linkParams = {
    TableName: 'links-table',
    Item: marshall({
      pk: urlId,
      createdBy: userObj.email,
      ogUrl: body.link,
      timesVisited: 0,
      expiresIn: body.expiresIn,
    }),
  };
  if (body.expiresIn !== 0) {
    //scheduler
    const scheduler = new SchedulerClient({});
    const schedulerParams = {
      FlexibleTimeWindow: {
        Mode: 'OFF',
      },
      Name: crypto.randomBytes(3).toString('hex'),
      ScheduleExpression: `at(${moment()
        .add(body.expiresIn, 'days')
        .format('YYYY-MM-DDTHH:mm:ss')})`,
      Target: {
        Arn: `arn:aws:lambda:us-east-1:${process.env.ACCOUNT_ID}:function:sls-test-task-api-dev-scheduled-deactivate-link`,
        RoleArn: `arn:aws:iam::${process.env.ACCOUNT_ID}:role/event-bridger-role`,
        Input: JSON.stringify({ urlId, email: userObj.email }),
      },
      State: 'ENABLED',
    };

    await scheduler.send(new CreateScheduleCommand(schedulerParams));
  }

  await db.send(new PutItemCommand(linkParams));

  return createResponse(201, { shortUrl });
};
