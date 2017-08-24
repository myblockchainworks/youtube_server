var express = require('express'),
    cors = require('cors'),
    app = express();
//var router = express.Router();
var bodyParser = require('body-parser');
var Web3 = require('web3');

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//session configs
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it


app.use(cookieParser());

app.use(expressSession({
    secret: 'test_session',
    resave: false,
    saveUninitialized: true
}));


//For enabling CORS
app.use(cors());


var web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://10.0.0.14:8545"));
    console.log(web3.net.peerCount);
}

//web3.eth.defaultAccount = 0xaf148d7e9c5a1f6ee493f0a808fdc877953bf273;
web3.eth.defaultAccount=web3.eth.accounts[0];

var youtubeContractAddress = "0x52abb198b252cb1ecd31265a1a3dc6b6c129862f";

var youtubeContractABI = [ { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferToken", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "getChannel", "outputs": [ { "name": "", "type": "string" }, { "name": "", "type": "string" }, { "name": "", "type": "address" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "getChannelsCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_title", "type": "string" }, { "name": "_id", "type": "string" }, { "name": "_owner", "type": "address" }, { "name": "_subscribers", "type": "uint256" } ], "name": "addNewChannel", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "index", "type": "uint256" }, { "name": "_subscribers", "type": "uint256" } ], "name": "calculateAndTransferToken", "outputs": [], "payable": false, "type": "function" }, { "inputs": [ { "name": "coinName", "type": "string" }, { "name": "tokenSymbol", "type": "string" }, { "name": "initalToken", "type": "uint256" } ], "payable": false, "type": "constructor" } ];

//contract data

var youtubeContract = web3.eth.contract(youtubeContractABI).at(youtubeContractAddress);


app.get('/', function(req, res) {

    res.send("This is the API server developed for YouTube");
})

app.get('/getChannelsCount', function(req, res) {

    youtubeContract.getChannelsCount.call(function(err, result) {
        console.log(result);
        if (!err) {
            res.json({"channelsCount":result});
        } else
            res.status(401).json("Error" + err);
    });
});

app.post('/addNewChannel', function(req, res) {

     var title = req.body._title;
     var id = req.body._id;
     var owner = req.body._owner;
     var subscriberCount = req.body._subscribers;

     youtubeContract.addNewChannel.sendTransaction(title, id, owner, subscriberCount, {
        from: web3.eth.defaultAccount,gas:4712388
     }, function(err, result) {
        console.log(result);
        if (!err) {
            res.end(JSON.stringify(result));
        } else
            res.status(401).json("Error" + err);
    });

});

app.post('/calculateAndTransferToken', function(req, res) {

  var index = req.body._selectedIndex;
  var subscribers = req.body._subscribers;

  youtubeContract.calculateAndTransferToken.sendTransaction(index, subscribers, {
     from: web3.eth.defaultAccount, gas:4712388
  }, function(err, result) {
     console.log(result);
     if (!err) {
         res.end(JSON.stringify(result));
     } else
         res.status(401).json("Error" + err);
 });
});

app.post('/getChannel', function(req, res) {

    var currentIndex = req.body._currentIndex;

    youtubeContract.getChannel.call(currentIndex, function(err, result) {
        console.log(result);
        if (!err) {
            res.json({"Title":result[0],"Id":result[1],"Owner":result[2],"Subscribers":result[3],"LastPayoutDate":result[4], "Token":result[5]});
        } else
            res.status(401).json("Error" + err);
    });
});

app.listen(3001, function() {
    console.log('app running on port : 3001');
});
