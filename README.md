# AWS Shortlinker API

Project showcases AWS-native link shortener service. User can register or log in and after that provide any link and expire date and receive shortened version of it that will expire according to request (after visit, in 1 day, in 3 days or in 7 days). After expiration of link, user, who created this link, will receive email notification (to test this both email of sender and email of receiver must be verified on AWS SES).

## Project structure

- [serverless.yaml](serverless.yaml) - The AWS Serverless template, a descriptor of an AWS Serverless application
- [authorize](functions/authorize.ts) - A Lambda authorizer that uses a bearer token authentication strategy
- [register](functions/register.ts) - The Lambda function which creates a new user
- [login](functions/login.ts) - The Lambda function which authenticate existing user
- [createLink](functions/createLink.ts) - The Lambda function which is protected by [authorizer](functions/authorize.ts) and creates shortened version of link with requested expiration date
- [me](functions/me.ts) - The Lambda function which is protected by [authorizer](functions/authorize.ts) and shows links that were created by current user
- [deactivateLink](functions/deactivateLink.ts) - The Lambda function which is protected by [authorizer](functions/authorize.ts) and deactivates shortened version of link by ID
- [shortLink](functions/shortLink.ts) - The Lambda function which navigates to original link and deactivate shortened link or increase times of visit
- [queueReceiver](functions/queueReceiver.ts) - The Lambda function which listens for specific queue and sends email notification to provided user about link deactivation
- [ttlDetector](functions/ttlDetector.ts) - The Lambda function which listens for events of DynamoDB and sends message to queue to notify user about link deactivation after ttl is expired
- [db](lib/db.ts) - Client for DynamoDB
- [sqs](lib/sqs.ts) - Client for SQS
- [utils](lib/utils.ts) - File with helper functions

## Environment Variables

Environment variables are stored in file secrets.json that the user needs to create in the root. BASE_URL link can be obtained in API Gateway after first deploy and SQS_URL can be obtained in AWS SQS dashboard also after first deploy. After receiving these links user have to redeploy project with new environment variables.

Example of file:\
secrets.json

```
{
  "AWS_ID": "id from aws",
  "AWS_SECRET_ACCESS_KEY": "secret key from aws",
  "JWT_SECRET": "secret key for jwt token",
  "SQS_QUEUE_URL": "url for sqs",
  "EMAIL_FROM": "email which will be used for sending notifications to users (must be verified on aws ses)",
  "BASE_URL": "link in format https://**********.execute-api.us-east-1.amazonaws.com/dev/"
}

```

## Setup

```
# Install serverless globally
npm install -g serverless

# Install dependencies
npm install

# Deploy to AWS
sls deploy
```

## Author

👤 **Mykhailo Krachun**

- GitHub: [@mykhailokrachun](https://github.com/mykhailokrachun)
- LinkedIn: [Mykhailo K](https://www.linkedin.com/in/mykhailo-krachun-98516025a/)
