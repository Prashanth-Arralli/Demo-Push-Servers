const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//var http = require('http') ;

var express = require('express') ;
//var gcm = require('node-gcm');
const bodyParser = require('body-parser');
var app = express() ;
const webpush = require('web-push');

var port = '3001' ;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  };
app.use(allowCrossDomain);
app.set('port', port);
//server = http.createServer(app).listen(3001);
// server.on('listening',()=>{
//     console.log("Server is listening on : ",server.address()) ;
    
// }) ;
const vapidKeys = { 
    publicKey: 'BPek-Y4u42n2wb0ks4dvPIoIwB3QGXovHSIToH4FK0yhziBa9m5QIGAQ7rOcABUFjxQvtE0X-LJc1ucqYlUbDmE',
    privateKey: 'CLP7PRSG9kTRDhJyN8953sUIOlaiRZ4KOuXFd_JswxM'
 }
console.log("Vapid Keys = ",vapidKeys) ;
webpush.setGCMAPIKey('AIzaSyCFCDOcqrtVUc0gTY-7IK4yri0bpxYO3gI');
webpush.setVapidDetails(
  'mailto:prashanth21992@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
var subscribers = [] ;
var subscriberSetIntervalMap = {} ;
app.post('/register', (req, res, next) => {
    let body = req.body;
    console.log("body = ",body) ;
    if (body) {
        var subscriberName = body.name ;
        var deviceSubscription = body.subscription ;
        var intervalId = setInterval(sendNotification, 3000,deviceSubscription) ;
        var storeJson = {
            name : subscriberName,
            intervalId : intervalId
        } ;
        console.log("DeviceSubscription = ", deviceSubscription) ;
        subscriberSetIntervalMap[JSON.stringify(deviceSubscription)] = storeJson ;
        subscribers.push(deviceSubscription) ;
        var invitationMessage = "Hi "+subscriberName + "!! You have successfully registered for break notifications." ;
        sendNotification(deviceSubscription,invitationMessage) ;
        console.log("subscribers = ", subscriberSetIntervalMap) ;
        res.sendStatus(200) ;
    }else{
        res.send(500) ;
    }
});

function sendNotification(subscription,message){
    if(!message){
        var subscriberName = subscriberSetIntervalMap[JSON.stringify(subscription)].name ;
        message = "Hey "+subscriberName+"!! It' time for a break." ;
    }
    webpush.sendNotification(subscription, message);
}
 
// function sendAndroid(devices) {
//     let message = new gcm.Message({
//         notification : {
//             title : 'Hello, World!'
//         }
//     });
 
//     let sender = new gcm.sender('AIzaSyCFCDOcqrtVUc0gTY-7IK4yri0bpxYO3gI');
 
//     sender.send(message, {
//         registrationTokens : devices
//     }, function(err, response) {
//         if (err) {
//             console.error(err);
//         } else {
//             console.log(response);
//         }
//     });
// }
app.post('/unregister',(req,res) => {
    var subscription = req.body.subscription ;
    var subscriptionStr = JSON.stringify(subscription) ;
    var subscriptionIndex = subscribers.indexOf(subscription) ;
    if(subscriptionIndex> 0)
        subscribers.splice(subscriptionIndex,1) ;
    console.log("subscription = ",subscription) ;

    var subscriptionDetails = subscriberSetIntervalMap[subscriptionStr] ;
    if(subscriptionDetails){
        clearInterval(subscriptionDetails.intervalId) ;
        delete subscriberSetIntervalMap[subscriptionStr] ;
    }
    res.send(200) ;
}) ;
app.get('/send', (req, res) => {
    var message = req.query.message ;
    subscribers.forEach((subcription)=>{
        webpush.sendNotification(subscription, message);
    }) ;
    res.send(200) ;
    // DeviceSchema.find( (err, devices) => {
    //     if (!err && devices) {
    //         let androidDevices = [];
    //         devices.forEach(device => {
    //                 androidDevices.push(device.deviceId);
    //         });
    //         sendAndroid(androidDevices);
    //         res.send(200);
    //     } else {
    //         res.send(500);
    //     }
    // });
});

const firebaseApp = functions.https.onRequest(app) ;

exports.firebaseApp = firebaseApp ;


