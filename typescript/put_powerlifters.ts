// File reponsible for parsing the csv files to retrieve data about athletes and placing the data into the DynamoDB table
import * as fs from 'fs';
import * as csv from 'csv-parser';

const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com",
  credentials: new AWS.SharedIniFileCredentials({
    filename: "C:/Users/johnn/.aws/credentials"
  })
});

const documentClient = new AWS.DynamoDB.DocumentClient();

const tableParams = {
  TableName: "Powerlifters"
};

const files = ['blakelehew.csv', 'chadpenson.csv', 'johnhaack.csv', 'yurybelkin.csv', 'zahirkhudayarov.csv'];

let currentId = 1;

files.forEach((file) => {
  fs.createReadStream(`athletes/${file}`)
    .pipe(csv())
    .on('data', (data) => {
      const unixTimestamp = new Date(data.Date).getTime() / 1000;
      console.log(`Name: ${data.Name}, Date: ${data.Date}, TotalKg: ${data.TotalKg}`);
      documentClient.put({
        TableName: tableParams.TableName,
        Item: {
          "id": currentId++,
          "name": data.Name,
          "date": unixTimestamp,
          "total": data.TotalKg
        }
      }, (error, result) => {
        if (error) {
          console.error("Error uploading data:", JSON.stringify(error));
        } else {
          console.log("Data uploaded successfully:", JSON.stringify(result));
        }
      });
    });
});