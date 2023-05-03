const express = require("express");
const app = express();
const port = 1234;
const { google } = require("googleapis");
const request = require("request");
const cors = require("cors");
const urlParse = require("url-parse");
const queryParse = require("querystring");
const bodyParser = require("body-parser");
const axios = require("axios");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get("/getURLTing", (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
        // ClientID
        "188383298689-vf6gtvtt0gv4u4mr29s8ken0i121018k.apps.googleusercontent.com",
        // ClientSecret
        "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",
        // link to redirect to
        "http://localhost:1234/steps"
    );
    const scope = [ "https://www.googleapis.com/auth/fitness.activity.read profile email openid" ]

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scope,
        state: JSON.stringify({
            callbackUrl : req.body.callbackUrl,
            userID: req.body.userid
        })
    })

    request(url, (err, response, body)=> {
        console.log("error: ",err);
        console.log("statusCode: ", response && response.statusCode);
        res.send({ url });
    })
});

app.get("/steps", async (req, res) => {
    const queryURL = new urlParse(req.url);
    const code = queryParse.parse(queryURL.query).code;
    const oauth2Client = new google.auth.OAuth2(
        // ClientID
        "188383298689-vf6gtvtt0gv4u4mr29s8ken0i121018k.apps.googleusercontent.com",
        // ClientSecret
        "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",
        // link to redirect to
        "http://localhost:1234/steps"
    );

    const tokens = await oauth2Client.getToken(code);
    console.log(tokens);
    res.send("HELLO");

    let stepArray = [];

    try {
        const result = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer "+ tokens.tokens.access_token
            },
            "Content-Type": "application/json",
            url: `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
            data: {
                aggregateBy: [
                    {
                        dataTypeName: "com.google.step_count.delta",
                        dataSourceId: "derived:com.google.step_count.delta:com.google.andorid.gms:estimated_steps"
                    }
                ],
                bucketByTime: { durationMillis: 8640000 },
                startTimeMillis: 1585785599000,
                endTimeMillis: 1585958399000,
            }
        });
        console.log(result);
        // stepArray = result.data.bucket;
    } catch (e) {
        console.log(e);
    }

    // try {
    //     for(const dataset of stepArray){
    //         console.log(dataset);
    //     }
    // } catch (e) {
    //     console.log(e);
    // }

})

app.listen(port, () => console.log(`GOOGLE FIT IS LISTENING ON PORT ${port}`));