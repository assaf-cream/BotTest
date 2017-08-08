// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder'); 

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

var appId = process.env.MY_APP_ID;
var appPassword = process.env.MY_APP_PASSWORD;

// Create chat bot
var connector = new builder.ChatConnector
({ appId: appId, appPassword: appPassword }); 
var bot = new builder.UniversalBot(connector);

const restifyBodyParser = require('restify-plugins').bodyParser;
server.use(restifyBodyParser({ mapParams: true }));
server.post('/sftest', function(req, res) {
    var fs = require('fs');
    fs.appendFile("sf.log", JSON.stringify(req.body) + '\r\n*********************************\r\n', function(err) {
        if(err) {
            res.send({err: err});
        }
        console.log("The file was saved!");
        res.send({result:0});
    }); 
});

server.post('/api/messages', connector.listen());
server.get('/', restify.plugins.serveStatic({ directory: __dirname, default: '/index.html'}));


// Add a global LUIS recognizer to the bot by using the endpoint URL of the LUIS app
var model = process.env.LUIS_MODEL;
//bot.recognizer(new builder.LuisRecognizer(model));
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

intents.matches('Greet', (session, args) => {
    session.send('Hi!');
})
.matches('PurchaseSomething', (session, args) => {
    //sendSMSPlivo(session.message.text);
    session.send("Purchase?");  
})
.matches('None', (session, args) => {
    //sendSMSPlivo(session.message.text);
    session.send("Hrm.. I didn't understand that. Can you say it differently");  
})
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});


// intents.matches('Greet', [
//     function (session, args, next) {
//         session.send("Helllllooooo");
//         next();
//         },
//     function (session, results) {
//         if (results.response) {
//     // ... save task
//         session.send("Ok... '%s' task.", results.response);
//         } else {
//         session.send("Ok");
//             }
//     }]);
            
// intents.matches('None', [
//         function (session, args, next) {
//             session.send("I didnt understand");
//             next();
//            },
//       function (session, results) {
//          if (results.response) {
//         // ... save task
//            session.send("Ok... '%s' task.", results.response);
//            } else {
//          session.send("Ok");
//                }
//             }]);

// intents.onDefault((session) => {
//     session.send('Sorry, I did not understand \'%s\'.', session.message.text);
// });

bot.dialog('/', intents);


// Create bot dialogs
// bot.dialog('/', function (session) {
//     session.send("You said - yes you said: %s", session.message.text);
// });




function sendSMS(msg) {
    var twilio = require('twilio');
    var accountSid = process.env.TWILIO_ACCOUNT;
    var authToken = process.env.TWILIO_TOKEN;

    var twilio = require('twilio');
    var client = new twilio(accountSid, authToken);

    client.messages.create({
        body: msg,
        to: process.env.TWILIO_TO_NUMBER, 
        from: process.env.TWILIO_FROM_NUMBER, 
    }, function(err, message) { 
        console.log(message.sid); 
    });
}

function sendSMSPlivo() {
    var plivo = require('plivo');
    var p = plivo.RestAPI({
    authId: process.env.PLIVO_ID,
    authToken: process.env.PLIVO_TOKEN
    });

    var params = {
        'src': process.env.PLIVO_FROM, // Sender's phone number with country code
        'dst' : process.env.PLIVO_TO, // Receiver's phone Number with country code
        'text' : "Hi, message from Plivo", // Your SMS Text Message - English
        'url' : "http://ynet.co.il/", // The URL to which with the status of the message is sent
        'method' : "GET" // The method used to call the url
    };

    // Prints the complete response
    p.send_message(params, function (status, response) {
        console.log('Status: ', status);
        console.log('API Response:\n', response);
    });
}