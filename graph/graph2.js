
d3.json("topics.json", function(json){
  var width = window.innerWidth, height = window.innerHeight,
      fill = d3.scale.category20()

var force = d3.layout.force()
    .nodes(d3.values(json.nodes))
    .links(json.links)
    .size([width, height])
    .linkDistance(100)
    .charge(-300)
    .on("tick", tick)
    .start();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
    // .attr("viewBox", "0 0 " + width + " " + height * .5)
    // .attr("preserveAspectRatio", "xMidYMid meet");

var link = svg.selectAll(".link")
    .data(force.links())
  .enter().append("line")
    .attr("class", "link");

var node = svg.selectAll(".node")
    .data(force.nodes())
  .enter().append("g")
    .attr("class", "node")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .call(force.drag);

node.append("circle")
    .style("fill", function(d) { return fill(d.group); })
    .attr("r", function(d) { return d.is_tag? 16:8 });

node.append("svg:title")
    .text(function(d) { return d.tooltip; });

var anchorNode = vis.selectAll(".node").data(force.nodes()).enter().append("svg:g").attr("class", "anchorNode");
anchorNode.append("svg:circle").attr("r", 0).style("fill", "#FFF");



anchorNode.append("text")
    .attr("x", function(d) { return d.is_tag ? 18 : 10 })
    .attr("dy", ".35em")
    .style("font-size", function(d) { return d.is_tag ? "12px" : "9px"; })
    .style("font-weight", function(d) { return d.is_tag ? "bold" : ""; })
    .text(function(d) { return d.name; });

function tick() {
  anchorNode.each(function(d, i) {
					if(i % 2 == 0) {
						d.x = d.node.x;
						d.y = d.node.y;
					} else {
						var b = this.childNodes[1].getBBox();

						var diffX = d.x - d.node.x;
						var diffY = d.y - d.node.y;

						var dist = Math.sqrt(diffX * diffX + diffY * diffY);

						var shiftX = b.width * (diffX - dist) / (dist * 2);
						shiftX = Math.max(-b.width, Math.min(0, shiftX));
						var shiftY = 5;
						this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
					}
				});


				anchorNode.call(updateNode);

				link.call(updateLink);
				anchorLink.call(updateLink);

  // link
  //     .attr("x1", function(d) { return d.source.x; })
  //     .attr("y1", function(d) { return d.source.y; })
  //     .attr("x2", function(d) { return d.target.x; })
  //     .attr("y2", function(d) { return d.target.y; });
  //
  // node
  //     .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function mouseover() {
  d3.select(this).select("circle").transition()
      .duration(750)
      .attr("r", function(d) { return d.is_tag? 32:16 });
}

function mouseout() {
  d3.select(this).select("circle").transition()
      .duration(750)
      .attr("r", function(d) { return d.is_tag? 16:8 });
}

});

function mouseover() {
   d3.select(this).select("circle").transition()
       .duration(750)
       .attr("r", 16);
  }

 function mouseout() {
   d3.select(this).select("circle").transition()
       .duration(750)
       .attr("r", 8);
 }
