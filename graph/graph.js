
d3.json("topics.json", function(json){
    var width = 1024,
        height = 768;

fill = d3.scale.category20()

var force = d3.layout.force()
    .nodes(d3.values(json.nodes))
    .links(json.links)
    .size([width, height])
    .linkDistance(80)
    .charge(-300)
    .on("tick", tick)
    .start();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

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

node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });

function tick() {
  link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
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
