//Axios will handle HTTP requests to web service
const axios = require('axios');

let studentID = '/M00779169';

//URL where student data is available
let url = 'https://bmmkl4lj0d.execute-api.us-east-1.amazonaws.com/prod';

//Authentication details for Plotly
const PLOTLY_USERNAME = 'JanCiepiela';
const PLOTLY_KEY = 'EjzCDlE50HmzCa6BAUVU';

//Initialize Plotly with user details.
let plotly = require('plotly')(PLOTLY_USERNAME, PLOTLY_KEY);

exports.handler = async (event) => {
    try {
        //Get synthetic data
        let yValues = (await axios.get(url + studentID)).data.target;

        //Add basic X values for plot
        let xValues = [];
        for (let i = 0; i < yValues.length; ++i) {
            xValues.push(i);
        }

        //Call function to plot data
        let plotResult = await plotData(studentID, xValues, yValues);
        console.log("Plot for student '" + studentID + "' available at: " + plotResult.url);

        return {
            statusCode: 200,
            body: JSON.stringify({ url: JSON.parse(plotResult).url })
        };

    }
    catch (err) {
        console.log("ERROR: " + JSON.stringify(err));
        return {
            statusCode: 500,
            body: "Error plotting data for student ID: " + studentID
        };
    }
};

//Plots the specified data
async function plotData(studentID, xValues, yValues) {
    //Data structure
    let studentData = {
        x: xValues,
        y: yValues,
        type: "scatter",
        mode: 'line',
        name: studentID,
        marker: {
            color: 'rgb(219, 64, 82)',
            size: 12
        }
    };
    let data = [studentData];

    let layout = {
        title: "Synthetic Data for Student " + studentID,
        font: {
            size: 25
        },
        xaxis: {
            title: 'Time (hours)'
        },
        yaxis: {
            title: 'Value'
        }
    };
    let graphOptions = {
        layout: layout,
        filename: "date-axes",
        fileopt: "overwrite"
    };

    return new Promise((resolve, reject) => {
        plotly.plot(data, graphOptions, function(err, msg) {
            if (err)
                reject(err);
            else {
                resolve(JSON.stringify(msg)); // Return the plot as a JSON string
            }
        });
    });
};

exports.handler({});
