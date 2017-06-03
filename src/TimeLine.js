// 載入 http 的模組
var http = require('http');
// 引用 File System 模組
var fs = require('fs');

// 設定 port 預設為 1337，若系統環境有設定則以系統環境設定為主
var port = process.env.PORT || 1337;

var url = require('url');
var path = require('path');
var express = require('express');
var CircularJSON = require('circular-json');
var bodyParser = require('body-parser');

function ClientStatus(id,name,score) {
	this.id = id;
	this.name = name;
	this.score = score;
}

function Time(tick) {
	this.tick = tick;
	this.clients = [];
}

function TimeLine(){
	this.startTime = 0;
	this.timeLine = [];
	this.data = express();
	this.server = http.createServer(this.data);
	this.data.use(bodyParser.json()); // for parsing application/json
	this.data.use(bodyParser.urlencoded({ extended: true }));
	this.data.post("/update",function (req, res) {
		// req 是 request 本地端請求的訊息
		// res 是 response 主機回傳到本地端的訊息
		var updated = [];
		try{var tick = req.body.tick;}
		catch(err){
			console.log("Invalid data format! Err: " + err.message);
			res.status(400).send("Invalid data format! Err: " + err.message);
			return;
		}
		var l = (this.timeLine == undefined?0:this.timeLine.length);
		var index = l-1;
		var curtick = 0;
		while(index >= 0){
			curtick = this.timeLine[index].tick;
			if(this.timeLine[index].tick <= tick)break;
			index--;
		}
		index ++;
		while(index<l){
			updated.push(this.timeLine[index]);
			index++;
		}
		res.send(JSON.stringify({"time":this.startTime,"status":updated}));
	}.bind(this));
	this.data.use('/', express.static('../'));
}
module.exports = TimeLine;

// 啟動並等待連接
TimeLine.prototype.startTimeLine = function(game){
	this.data.listen(port, function () {
		console.log('| [INFO] Timeline reporter listening at http://127.0.0.1:/' + port);
	});
	this.startTime = game.startTime;
}

TimeLine.prototype.updateData = function(game) {
	if(game.clients.length>0){
		var clients = game.clients.valueOf();
		var time = null;
		for(var i=0;i<game.clients.length;i++){
			var pid = clients[i].playerTracker.pID;
			var name = clients[i].playerTracker._name;
			var cell = clients[i].playerTracker.cells;
			var score = (cell.length?clients[i].playerTracker._score:0);
			if(name == '' || score == 0)continue;
			if(time == null)time = new Time(game.tickCounter);
			var clientStatus = new ClientStatus(pid,name,score);
			time.clients.push(clientStatus);
		}
		if(time != null){
			this.timeLine.push(time);
		}
	}
	/*fs.writeFile("log/timelinelog_" + this.startTime + ".json", JSON.stringify(this.timeLine), function(err){
		if(err){
			console.log("Cannot log timeline into file! Err: " + err.message);
		}
	})*/
}