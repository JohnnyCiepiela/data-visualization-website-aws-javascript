//Import external library with websocket functions
let ws = require('websocket');

//Hard coded domain name and stage - use when pushing messages from server to client
let domainName = "wss://8pbhp2wbt7.execute-api.us-east-1.amazonaws.com";
let stage = "prod";

exports.handler = async (event) => {
    try {
        //Get connection id out of event
        const clientID = event.requestContext.connectionId;
        console.log("Connection ID: " + clientID);
        
        //Get Message from event
        const table = JSON.parse(event.body).table;
        console.log("Message: " + table);
        
        

        //Allocate domain name and stage dynamically
        domainName = event.requestContext.domainName;
        stage = event.requestContext.stage;
        console.log("Domain: " + domainName + " stage: " + stage);

        //Get promises to send messages to connected clients
        let sendMsgPromises = await ws.getSendMessagePromises(clientID, domainName, stage, table);

        //Execute promises
        await Promise.all(sendMsgPromises);
    }
    catch(err){
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    //Success
    return { statusCode: 200, body: "Data sent successfully." };
};
