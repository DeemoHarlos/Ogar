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
	this.clients = [];
}
var data = {
	"time":0,
	"status":[]
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
			// do something with items here
			// You will likely want a template so you don't have to format the string by hand
			var d = items.status;
			if(data.time != items.time){
				tick = 0;
				data.time = items.time;
				ids = [];
				if(data.time != 0){
					console.log("Server restarted ...");
					svg = d3.select("body").append("svg")
						.attr("id","chart_" + items.time)
						.attr("width", "1200px")
						.attr("height", "500px");
				}
			}
			console.log("Request sent, tick = " + tick);
			if(d.length != 0){
				console.log(items.time + "\t" + JSON.stringify(d[d.length-1]));
				tick = d[d.length-1].tick;
				d.forEach(function(e){
					data.status.push(e);	
					e.clients.forEach(function(pl){if(!ids.includes(pl.id)){
						ids.push(pl.id);
						svg.append("path")
							.data([d.status])
							.attr("class", "line")
							.attr("id","line_"+pl.id)
							.style("stroke","hsl("+((pl.id-1)*25)+", 100%, 65%)")
							.style("fill","none")
							.style("stroke-width","0.75px");
					}});
				})
				ids.forEach(function(e){
					if(ids != undefined){
						draw(data,e);
					}
				});
			}
		}.bind(this)
	});
}
setInterval(update,1000);

function drawline(id){
	var valueline = d3.line()
		.x(function(d) {
			return x(d.status.map(e => e.tick));
		})
		.y(function(d) {
			return y(d.status.map(
				e => e.clients[e.clients.findIndex(f => f.id == id)].score)
			);
		});	
	return valueline;
}

var draw = function(d,id){
	
	x.domain([0, tick]);
/*	y.domain([0,d3.max(d.status,function(t) {
		var temp = [];
		t.forEach(function(e){
			temp.push(d3.max(e.clients,function(u){return u.score;}))
		})
		return temp;
	})]);
*/
	y.domain([0,d3.max(d.status,function(t) {
		return t.clients,function(u){return u.score;};
	})]);
	svg = d3.select("body").select("svg#chart_" + d.time)
		.select("#line_"+id).attr("d", drawline(id));
}
