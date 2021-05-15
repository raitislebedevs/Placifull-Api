# Placifull server

## How to set up server
Create a `.env` file from `.env.example`

|Variable| Description |
|--|--|
|HOST  | Should be: `0.0.0.0` |
|POST| The port of your server, example: `8080` |
|CLIENT_URL| The endpoint of the frontend server, example: `localhost:3000` |
|DATABASE_CLIENT| `mongo` |
|DATABASE_NAME|(Manual) example: `your-db-name` |
|DATABASE_HOST|(Manual) example: `127.0.0.1` |
|DATABASE_PORT|(Manual) example: `270127` |
|DATABASE_USERNAME|(Manual)  example:  `admin` |
|DATABASE_PASSWORD| (Manual) example: `password` |
|DATABASE_SSL|(Manual)example: `true` or `false` |
|AUTHENTICATION_DATABASE|example: (Manual)`admin` |
|DATABASE_SRV|example: (SRV) example: `mongo://` |
|AWS_ACCESS_KEY_ID|Your aws S3 configuration |
|AWS_ACCESS_SECRET|Your aws S3 configuration|
|AWS_REGION| Your aws S3 configuration|
|AWS_BUCKET_NAME| Your aws S3 configuration|
|MAILGUN_API_KEY| Your Mailgun configuration |
|MAILGUN_DOMAIN| Your Mailgun configuration |
|MAILGUN_DEFAULT_FROM| Your Mailgun configuration |
|MAILGUN_DEFAULT_REPLY_TO| Your Mailgun configuration |

## How to run
To run development server in local:
```
npm run develop
```
To build and run production server:
```
npm run build
npm start
```
## How to set up AWS S3 configuration
- Go to your aws S3 dashboard
- Create a new bucket
- Uncheck "Block all public access"
- Go to that bucket -> Permissions -> CORS -> Edit -> Patse this
```JSON
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST",
            "DELETE",
            "GET"
        ],
        "AllowedOrigins": [
            "http://www.your-api-server.com"
        ],
        "ExposeHeaders": []
    },
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "http://www.your-front-end-client.com"
        ],
        "ExposeHeaders": []
    }
]
```
- Go to Identity and Access Management (IAM) -> Users -> Add User
- Give it a name and check on Programmatic access
- Create a group call s3-access and give it policy `AmazonS3FullAccess`
- Review and create user, receive Access key ID and Secret key ID
- Patse it into .env file

The Access Key ID and Secret Key Id is located under the IAM user. We connect to the AWS cloud via an IAM user, not using the core user, which is only a shell.

## How to set up Mailgun configuration
- Create a new Mailgun account
- In the sidebar -> Go to Sending -> Domains -> Add a new domain (Or use the sandbox one)
- Go to a domain -> Select API -> Select Nodejs
- Copy API key and patse to MAILGUN_API_KEY
- Copy API base URL and patse to MAILGUN_DOMAIN
- Define your own MAILGUN_DEFAULT_FROM and MAILGUN_DEFAULT_REPLY_TO

## How to contribute using CMS
Strapi has a CMS site that will auto make change and generate files.

To make change to the Schema, edit in Content-Type Builder

To make change to the data (i.e add user, remove user, ...), eidt in the Collection Types

To view the API Documentation, open Documentation tab

To upload file and manage upload file, go to Media Library

To manage user Roles, go to User & Permissions Plugins -> Roles -> Select a role -> Select the privilige of that role based on the content-types (i.e Get, Find, Update, Create,...)

**IMPORTANT**:After you make changes in the CMS, remember to commit, please don't commit public folder

## How to customize the code
Please read the customization guide from Strapi: https://strapi.io/documentation/developer-docs/latest/getting-started/introduction.html
