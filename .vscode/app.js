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
server.post('/api/messages', connector.listen());
server.get('/', restify.plugins.serveStatic({ directory: __dirname, default: '/index.html'}));


// Add a global LUIS recognizer to the bot by using the endpoint URL of the LUIS app
var model = process.env.LUIS_MODEL;
//bot.recognizer(new builder.LuisRecognizer(model));
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

intents.matches('Greet', (session, args) => {
    session.send('Hello mate 111!');
})
.matches('None', (session, args) => {
    sendSMS(session.message.text);
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