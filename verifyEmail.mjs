const {
  SESClient,
  GetIdentityVerificationAttributesCommand,
  VerifyEmailIdentityCommand,
} = require('@aws-sdk/client-ses');

const sesClient = new SESClient({ region: 'us-east-1' });

const emailAddress = 'your email';
const params = {
  Identities: [emailAddress],
};

async function verifyEmailAddress() {
  try {
    const verification = await sesClient.send(
      new GetIdentityVerificationAttributesCommand(params)
    );
    const verificationStatus =
      verification.GetIdentityVerificationAttributesResponse[emailAddress]
        ?.VerificationStatus;

    if (verificationStatus !== 'Success') {
      const response = await sesClient.send(
        new VerifyEmailIdentityCommand({
          EmailAddress: emailAddress,
        })
      );
      console.log(`Verification email sent to ${emailAddress}.`);
    } else {
      console.log(`${emailAddress} is already verified.`);
    }
  } catch (error) {
    console.error(`Failed to verify ${emailAddress}:`, error);
  }
}

verifyEmailAddress();
