let tick = 0;
let ids = [];
let playing = [];
/*var leader = []
for(var i=0;i<20;i++) leader.push({"name":"000X","score":9999.99});
var comp = {"name":"000X","score":9999.99};
function insert(name,score){
	leader.unshift({"name":name,"score":score});
	for(var i=0;i<20;i++){
		if(leader[i].score>leader.score[i+1]){
			var t = leader[i+1].score;
			leader[i+1].score = leader[i].score;
			leader[i].score = t;
			var u = leader[i+1].name;
			leader[i+1].name = leader[i].name;
			leader[i].name = u;
		}
	}
	leader.shift();
}*/
var ymax = 100;
var scoreFormat = d3.format(".2f");
var h = $(window).height();
var w = $(window).width();
x = d3.scaleLinear().range([0, w-60]);
y = d3.scaleLinear().range([h-60, 0]);
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
		url: 'http://127.0.0.1:1337/update',
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
				playing = [];
				if(data.time != 0){
					console.log("Server restarted ...");
					svg = d3.select("body").append("svg")
						.attr("id","chart_" + items.time)
						.attr("width", w + "px")
						.attr("height", h + "px")
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
					e.clients.forEach(function(pl){
						if(!ids.includes(pl.id)){
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
							//insert(pl.name,pl.score)
						}
						if(!playing.includes(pl.id) && pl.score > 0.0){
							playing.push(pl.id);
							newrow.append("td").attr("class","ID").text(pl.id);
							newrow.append("td").attr("class","name").text(pl.name);
							newrow.append("td").attr("class","score").text(pl.score>0?scoreFormat(pl.score):"")
								.style("text-align","right");
						}
						else if(pl.score == 0.0){
							playing.splice(playing.indexOf(pl.id),1);
						}
						ymax = d3.max([ymax,pl.score]);
					});
				})
			}
			ids.forEach(function(e){
				draw(data,e);
			});
			updateBoard();
			drawAxis(data);
		}.bind(this)
	});
	setTimeout(update,d3.max([1000,tick*ids.length * 0.0006]));
}
update();
function drawAxis(d){
	d3.select("body").select("svg#chart_" + d.time).select("g.x")
		.attr("transform", "translate(0," + (h - 60) + ")")
		.call(d3.axisBottom(x).ticks(16))
		.select("line,.domain")
			.attr("fill","none")
			.attr("stroke","#DDDDDD")
			.attr("stroke-width","2px");
		
	d3.select("body").select("svg#chart_" + d.time).select("g.y")
		.attr("transform", "translate(" + (w - 60) + ",0)")
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
function findScore(d,id){
	var t = d.clients[d.clients.findIndex(f => f.id == id)];
	return (t?t.score:0);
}
function drawline(id){// I copied this code from an eaelier project
	var valueline = d3.line()
		.x(function(d) {
			return x(d.tick/20); // x axis stands for the ticks passed
		})
		.y(function(d) {
			return y(findScore(d,id));
			// y axis stands for the score of player #'id'
		}).curve(d3.curveStepAfter);	
	return valueline;
}

var draw = function(d,id){
	
	x.domain([d3.max([0,tick/20-2048])/*0*/, tick/20]);
/*	y.domain([0,d3.max(d.status,function(t) {
		var temp = [];
		t.forEach(function(e){
			temp.push(d3.max(e.clients,function(u){return u.score;}))
		})
		return temp;
	})]);
*/
	y.domain([0,ymax]);
	d3.select("body").select("svg#chart_" + d.time)
		.select("g.view").select("#line_"+id).attr("d", drawline(id));
}
function updateBoard(){
	playing.forEach(function(pl,i){
		var score = findScore(data.status[data.status.length-1],pl);
		if(score == 0.0){
			d3.select("body>table>tbody").select("#tr_"+pl).style("display","none");
			//ids.splice(i,1);
		}
		else {
			d3.select("body>table>tbody").select("#tr_"+pl).style("display","table-row")
				.select("td.score")
				.text(scoreFormat(score));
			//ids.push(pl);
		}
	});
	
}