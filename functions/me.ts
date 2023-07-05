const { getUserFromToken, createResponse } = require('../lib/utils');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');
const db = require('../lib/db');

module.exports.handler = async function (event) {
  const userObj = await getUserFromToken(event.headers.Authorization);

  //search for links created by specific user
  const scanParams = {
    TableName: 'links-table',
    FilterExpression: 'createdBy = :value',
    ExpressionAttributeValues: marshall({
      ':value': userObj.email,
    }),
  };

  const { Items: links } = await db.send(new ScanCommand(scanParams));
  const allLinks = [];
  links.map((item) => {
    const normal = unmarshall(item);
    allLinks.push(normal);
  });

  const resultArray = allLinks.map((item) => {
    return {
      link: `${process.env.BASE_URL}${item.pk}`,
      timesVisited: item.timesVisited,
      ogUrl: item.ogUrl,
    };
  });

  return createResponse(200, {
    email: userObj.email,
    linksCreated: resultArray,
  });
};
