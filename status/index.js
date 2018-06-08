let tick = 0;
let ids = [];
x = d3.scaleLinear().range([0, 1200]);
y = d3.scaleLinear().range([500, 0]);
let svg = d3.select("body");
function ClientStatus(id,name,score) {
	this.id = id;
	this.name = name;
	this.score = score;
}

function Time(tick) {
	this.tick = tick;
	this.clients = []; // ClientStatus[]
}
var data = { // the same format as the ajax response object
	"time":0,
	"status":[] // Time[]
}
var update = function(){
	$.ajax( {
		url: 'http://deemo.space:1337/update',
		data: {
			"startTime":data.time,
			"tick":tick
		},
		type: 'POST',
		dataType:'json',
		success: function(items) {
			var d = items.status;
			if(data.time != items.time){
				tick = 0;
				data.time = items.time;
				data.status = [];
				ids = [];
				if(data.time != 0){
					console.log("Server restarted ...");
					svg = d3.select("body").append("svg")
						.attr("id","chart_" + items.time)
						.attr("width", "1200px")
						.attr("height", "500px")
						.style("padding-right","50px")
						.style("padding-left","10px")
						.style("padding-bottom","50px")
						.style("padding-top","10px");
					svg.append("g").attr("class","view");
					svg.append("g").attr("class","x").attr("stroke","white");
					svg.append("g").attr("class","y").attr("stroke","white");
				}
			}
			//console.log("Request sent, tick = " + tick);
			if(d.length != 0){
				//console.log(items.time + "\t" + JSON.stringify(d[d.length-1]));
				tick = d[d.length-1].tick;
				d.forEach(function(e){
					data.status.push(e);	
					e.clients.forEach(function(pl){if(!ids.includes(pl.id)){
						ids.push(pl.id);
						svg.select("g.view").append("path")
							.data([data.status])
							.attr("class", "line")
							.attr("id","line_"+pl.id)
							.attr("stroke","hsl("+((pl.id-1)*25)+", 100%, 65%)")
							.attr("fill","none");
						var newrow = d3.select("body>table>tbody")
							.append("tr").attr("id","tr_"+pl.id)
							.style("color","hsl("+((pl.id-1)*25)+", 100%, 65%)");
						newrow.append("td").attr("class","ID").text(pl.id);
						newrow.append("td").attr("class","name").text(pl.name);
						newrow.append("td").attr("class","score").text(pl.score).style("text-align","right");
					}});
				})
			}
			ids.forEach(function(e){
				if(ids.length>0){
					draw(data,e);
				}
			});
			updateBoard();
			drawAxis(data);
		}.bind(this)
	});
}
setInterval(update,1000);
function drawAxis(d){
	d3.select("body").select("svg#chart_" + d.time).select("g.x")
		.attr("transform", "translate(0,500)")
		.call(d3.axisBottom(x).ticks(16))
		.select("line,.domain")
			.attr("fill","none")
			.attr("stroke","#DDDDDD")
			.attr("stroke-width","2px");
		
	d3.select("body").select("svg#chart_" + d.time).select("g.y")
		.attr("transform", "translate(1200,0)")
		.call(d3.axisRight(y))
		.selectAll("line,.domain")
			.attr("fill","none")
			.attr("stroke","#DDDDDD")
			.attr("stroke-width","2px");
	d3.select("body").select("svg#chart_" + d.time)
		.selectAll("g.x,g.y").selectAll(".tick")
		.selectAll("text").attr("fill","#DDDDDD");
	d3.select("body").select("svg#chart_" + d.time)
		.selectAll("g.x,g.y").selectAll(".tick")
		.selectAll("line")
			.attr("fill","none")
			.attr("stroke", "#DDDDDD")
			.attr("stroke-width", "2px");
}
function findId(d,id){
	var t = d.clients[d.clients.findIndex(f => f.id == id)];
	return (t?t.score:0);
}
function drawline(id){// I copied this code from an eaelier project
	var valueline = d3.line()
		.x(function(d) {
			return x(d.tick/20); // x axis stands for the ticks passed
		})
		.y(function(d) {
			return y(findId(d,id));
			// y axis stands for the score of player #'id'
		}).curve(d3.curveStepAfter);	
	return valueline;
}

var draw = function(d,id){
	
	x.domain([0, tick/20]);
/*	y.domain([0,d3.max(d.status,function(t) {
		var temp = [];
		t.forEach(function(e){
			temp.push(d3.max(e.clients,function(u){return u.score;}))
		})
		return temp;
	})]);
*/
	y.domain([0,d3.max(d.status,function(t) {
		return d3.max(t.clients,function(u){return u.score;});
	})]);
	d3.select("body").select("svg#chart_" + d.time)
		.select("g.view").select("#line_"+id).attr("d", drawline(id));
}
var scoreFormat = d3.format(".2f");
function updateBoard(){
	ids.forEach(function(pl){
		d3.select("body>table>tbody").select("#tr_"+pl)
			.select("td.score")
			.text(scoreFormat(findId(data.status[data.status.length-1],pl)));
	});
	
}