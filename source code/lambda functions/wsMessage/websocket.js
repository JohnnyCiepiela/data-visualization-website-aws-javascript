let AWS = require("aws-sdk");

//Import functions for database
let db = require('./database');

//Create new DocumentClient
let documentClient = new AWS.DynamoDB.DocumentClient();

async function getDataFromSentimentResultsTable() {
    let params = {
        TableName: "SentimentResults"
    };

    try {
        let result = await documentClient.scan(params).promise();
        console.log("Successful get data from SentimentResults table: ");
        console.log(result.Items);
        return result.Items;
    } catch (err) {
        console.error("Get Error:", JSON.stringify(err))
    }
}

async function getDataFromPowerliftersTable() {
    let params = {
        TableName: "Powerlifters"
    };

    try {
        let result = await documentClient.scan(params).promise();
        console.log("Successful get data from Powerlifters table: ");
        console.log(result.Items);
        return result.Items;
    } catch (err) {
        console.error("Get Error:", JSON.stringify(err))
    }
}

async function getDataFromPredictionsSyntheticTable() {
    let params = {
        TableName: "PredictionsSynthetic"
    };

    try {
        let result = await documentClient.scan(params).promise();
        console.log("Successful get data from PredictionsSynthetic table: ");
        console.log("Predictions data: ");
        console.log(result.Items);
        return result.Items;
    } catch (err) {
        console.error("Get Error:", JSON.stringify(err))
    }
}

module.exports.getSendMessagePromises = async (clientID, domainName, stage, table) => {

    //Create API Gateway management class.
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        endpoint: domainName + '/' + stage
    });

        try{
            console.log("Sending message to: " + clientID);

            if(table === "SentimentResults") {

            //Create parameters for API Gateway
            let apiMsg = {
                ConnectionId: clientID,
                Data: JSON.stringify(await getDataFromSentimentResultsTable())
            };
            let result = await apigwManagementApi.postToConnection(apiMsg).promise();
            console.log("Message sent to: " + clientID + " result: " + JSON.stringify(result));
            
            }
            else if (table === "Powerlifters") {
            let apiMsg = {
                ConnectionId: clientID,
                Data: JSON.stringify(await getDataFromPowerliftersTable())
            };
            let result = await apigwManagementApi.postToConnection(apiMsg).promise();
            console.log("Message sent to: " + clientID + " result: " + JSON.stringify(result));
            }
            else if (table === "PredictionsSynthetic") {
            let apiMsg = {
                ConnectionId: clientID,
                Data: JSON.stringify(await getDataFromPredictionsSyntheticTable())
            };
            let result = await apigwManagementApi.postToConnection(apiMsg).promise();
            console.log("Message sent to: " + clientID + " result: " + JSON.stringify(result));
            }
            
        }
        catch(err){
            console.log("Error sending message to: " + clientID + " Error: " + JSON.stringify(err));
        }

};