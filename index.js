const Twitter = require('twitter-lite')
const portway = require('./portway')

const { 
  PORTWAY_PROJECT_ID,
  PORTWAY_KEY,
  TWITTER_API_KEY,
  TWITTER_API_SECRET
} = process.env

let twitterApp

async function setupTwitterApp() {
  // Setup Tweet app and authenticate
  const user = new Twitter({
    consumer_key: TWITTER_API_KEY,
    consumer_secret: TWITTER_API_SECRET
  });

  const response = await user.getBearerToken();
  twitterApp = new Twitter({
    bearer_token: response.access_token
  });
}

function formatTweet(tweet) {
  const portwayTweet = {
    text: tweet.text,
    user: tweet.user.screen_name,
    id: tweet.id_str
  }

  if (tweet.entities.urls.length > 0) {
    portwayTweet.url = tweet.entities.urls[0].url
  }

  return portwayTweet
}

async function getTweet(tweetId) {
  const tweet = await twitterApp.get("statuses/show", {
    id: tweetId
  })

  return formatTweet(tweet)
}

async function findDocumentsToProcess() {
  const documents = await portway.getProjectDocuments(
    PORTWAY_PROJECT_ID,
    PORTWAY_KEY
  )
  const docs = await Promise.all(
    documents.map(async doc => {
      const docWithFields = await portway.getDocumentWithFields(
        doc.id,
        PORTWAY_KEY
      )
      return docWithFields
    })
  )

  return docs.filter((doc) => {
    if (doc.fields.length === 1 && doc.fields[0].type === 1 && doc.fields[0].name === 'tweet') {
      return true
    }
    return false
  })
}

async function addTweetFieldsToDoc(docId, portwayTweet) {
  const tweetIdBody = {
    type: 1,
    name: 'tweet-id',
    value: portwayTweet.id
  }
  const tweetTextBody = {
    type: 2,
    name: 'tweet-text',
    value: portwayTweet.text
  }
  const userBody = {
    type: 1,
    name: 'user',
    value: `@${portwayTweet.user}`
  }
  return Promise.all([
    portway.addField(docId, tweetIdBody, PORTWAY_KEY),
    portway.addField(docId, tweetTextBody, PORTWAY_KEY),
    portway.addField(docId, userBody, PORTWAY_KEY)
  ]);
  
}

async function findTweetReplies(portwayTweet) {
  const searchTweets = await twitterApp.get("search/tweets", {
    q: encodeURIComponent(`to:${portwayTweet.user}`),
    since_id: portwayTweet.id,
    count: 100,
    include_entities: true
  })
  const replies = searchTweets.statuses.filter(tweet => {
    return tweet.in_reply_to_status_id_str === portwayTweet.id
  });
  return replies.map(formatTweet)
}

async function addRepliesToDoc(docId, replies) {
  return Promise.all(replies.map((reply, index) => {
    const text = reply.text.replace(/\n/g, '\n>')
    const body = {
      type: 2,
      value: `> ${text}\n[@${reply.user}](https://twitter.com/${reply.user})`,
      name: `reply-${index}-${reply.user}`
    }
    return portway.addField(docId, body, PORTWAY_KEY)
  }))
}

async function publishDoc(docId) {
  await portway.publishDocument(docId, PORTWAY_KEY)
}

async function processDocs(docs) {
  return Promise.all(docs.map(async (doc) => {
    const tweetUrl = doc.fields[0].value
    const tweetParts = tweetUrl.split('/')
    const tweetId = tweetParts[tweetParts.length - 1]
    const tweet = await getTweet(tweetId)
    await addTweetFieldsToDoc(doc.id, tweet)
    const replies = await findTweetReplies(tweet)
    await addRepliesToDoc(doc.id, replies)
    await publishDoc(doc.id)
  }))
}

async function run() {
  await setupTwitterApp()
  const docs = await findDocumentsToProcess()
  console.log(`Found ${docs.length} to process`)
  await processDocs(docs)
}

setInterval(run, 15000)