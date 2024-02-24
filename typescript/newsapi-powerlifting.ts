// File responsible for looking up data about powerlifting and placing the data into the DynamoDB table
const AWS = require("aws-sdk");
const { DynamoDBClient, BatchWriteItemCommand } = require("@aws-sdk/client-dynamodb");
const axios = require('axios');

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com",
  credentials: new AWS.SharedIniFileCredentials({
    filename: "C:/Users/johnn/.aws/credentials"
  })
});

const dynamoDB = new DynamoDBClient({ region: "us-east-1" });

const NEWS_API_ENDPOINT = 'https://newsapi.org/v2/everything';

const API_KEY = '38cf9a355f254469a289add5886d7a07';
const searchParams = {
  q: 'powerlifting',
  language: 'en',
  sortBy: 'publishedAt',
  apiKey: API_KEY,
};

axios
  .get(NEWS_API_ENDPOINT, { params: searchParams })
  .then((response) => {
    const articles = response.data.articles;

    const writeRequests = articles.map((article) => ({
      PutRequest: {
        Item: {
          title: { S: article.title },
          description: { S: article.description },
          url: { S: article.url },
          source: { S: article.source.name },
          publishedAt: { S: article.publishedAt },
        },
      },
    }));

    const chunkSize = 25;
    const chunks = [];
    for (let i = 0; i < writeRequests.length; i += chunkSize) {
      chunks.push(writeRequests.slice(i, i + chunkSize));
    }

    const promises = chunks.map((chunk) => {
      const batchWriteParams = {
        RequestItems: {
          NewsAPI: chunk,
        },
      };
      return dynamoDB.send(new BatchWriteItemCommand(batchWriteParams)).then((data) => {
        console.log(`Wrote ${chunk.length} articles to DynamoDB`);
      }).catch((err) => {
        console.error(`Error writing to DynamoDB: ${err}`);
      });
    });

    Promise.all(promises).then(() => {
      console.log(`Wrote ${articles.length} articles to DynamoDB`);
    }).catch((err) => {
      console.error(`Error writing to DynamoDB: ${err}`);
    });
  })
  .catch((error) => {
    console.error(`Error fetching powerlifting news: ${error}`);
  });