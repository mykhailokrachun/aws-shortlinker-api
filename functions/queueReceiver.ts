const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

module.exports.handler = async function (event) {
  try {
    const { email, message } = JSON.parse(event.Records[0].body);
    const sesClient = new SESClient({ region: 'us-east-1' });
    const emailParams = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Text: {
            Data: message,
          },
        },
        Subject: {
          Data: 'Link deactivation alert',
        },
      },
      Source: process.env.EMAIL_FROM,
    };
    await sesClient.send(new SendEmailCommand(emailParams));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
