# Portway Tweet Logger

This example application will monitor a Portway project for documents with a "tweet" field and then use the Twitter API to insert information and responses to that tweet.

## Requirements
1. Sign up for a [Twitter Developer Account](https://developer.twitter.com/en.html)
1. Create a Portway project and create an API key with contributor-level access

## Setup
1. `npm install`
1. `cp example.env .env`
1. Add the appropriate .env file values

## Running the app
`npm start`

The app will poll the Portway API for documents with tweet fields.

## Details

- For the tweet logger to find a tweet document in the Portway project, the following must be true:
  - the document is published
  - the published document contains only **one** string field, and the field name _must be_ `tweet`
- The Portway Tweet Logger will then pull information from the Twitter API about the found tweet. Any replies that can be found will also be added, but note due to limitations of the Twitter API replies may not be found. Replies are most likely to be found on an account with fewer @ mentions, and the tweet must be from the last 7 days.
- This app can be run locally

