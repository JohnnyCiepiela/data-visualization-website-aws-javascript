const AWS = require('aws-sdk');
const comprehend = new AWS.Comprehend();
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  for (let record of event.Records) {
    if (record.eventName === 'INSERT') {
      const newItem = record.dynamodb.NewImage;
      const title = newItem.title ? newItem.title.S : '';
      const description = newItem.description ? newItem.description.S : '';
      const text = `${title} ${description}`;
      console.log('Text:', text);

      const sentimentParams = {
        LanguageCode: 'en',
        Text: text,
      };

      try {
        const sentimentResponse = await comprehend.detectSentiment(sentimentParams).promise();
        console.log('Sentiment response:', sentimentResponse);

        const putParams = {
          TableName: 'SentimentResults',
          Item: {
            title: newItem.title.S,
            sentiment: sentimentResponse.Sentiment,
            positive: sentimentResponse.SentimentScore.Positive,
            negative: sentimentResponse.SentimentScore.Negative,
            neutral: sentimentResponse.SentimentScore.Neutral,
            mixed: sentimentResponse.SentimentScore.Mixed,
          },
        };

        await docClient.put(putParams).promise();
        console.log('Stored sentiment results in DynamoDB');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }
};