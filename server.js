var express         = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var md5 = require('MD5');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var nodemailer = require('nodemailer');
var app = express()
app.use(require('express-domain-middleware'));
var http = require('http').Server(app)
var config = require('./config') // get our config file
var pool = require('./dbpool').connect(config.database)

var host = process.env.OPENSHIFT_NODEJS_IP || config.host
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || config.port

app.set('dbpool', pool)
app.set('uses', require('./uses'))
app.set('jwt', jwt)
app.set('secret', config.secret)

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

app.use(express.static(__dirname))
app.use(express.static(__dirname + '/source'))
//cross domain.
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control,x-access-token");
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    } else {
        return next();
    }
});



app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html")
})



// process.on('uncaughtException', function(err) {
//  console.log('xuante')
//  console.log(err);
// })

config.routes.map(addApi) // inspect the config file for details

app.use(function (err, req, res, next) {
  console.error('xuanle',err.stack)
    var receiverEmail = config.errormail;
    var transporter = nodemailer.createTransport(config.servermail);
    var text = err.stack;
    var mailOptions = {
        from: 'xuan@rasia.info', // sender address
        to: receiverEmail, // list of receivers
        subject: 'Error from Photo Hub Page', // Subject line
        text: text //, // plaintext body
        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };
    transporter.sendMail(mailOptions, function(error, info){
  res.status(500).send('Something broke!')

    });
})

http.listen(port, function () {
  console.log('\n=====================================')
  console.log("App service started at %s:%s", host, port)
})

function addApi(node) {
  var url = '/api/' + node.url
  var apijs = './routes/' + node.file
  var route = require(apijs)(app)
  // require('./document')(url, route.stack)
  app.use(url, route)
}
