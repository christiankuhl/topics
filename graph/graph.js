$( function() {
  $( "input" ).checkboxradio({
    icon: false
  })
  .on("change", function(event, ui){console.log("Foo!")});
} );

d3.json("topics.json", function(json){
    var node_list = ["BCBS239", "BW Reporting", "Datenqualität"]
    json = filter(json, node_list)
    display_graph(json);
 });


 function filter(json, node_list){
     id_list = json.nodes.map(function(d,i){
        idx = node_list.indexOf(d.name)
        return idx==-1? -1 : i})
        .filter(function(d){return d!=-1})
     direct_links = json.links.filter(function(d){
       return id_list.indexOf(d.target) !== -1 || id_list.indexOf(d.source) !== -1
     })
     selected_nodes = direct_links.reduce(function(a, d){ return a.concat([d.source, d.target]) }, [])
     indirect_links = json.links.filter(function(d){
       return selected_nodes.indexOf(d.source) !== -1 && selected_nodes.indexOf(d.target) !== -1
               && direct_links.indexOf(d) === -1
     })
     json.links = direct_links.concat(indirect_links)
     tmp_nodes = json.nodes.filter(function(d, i){return selected_nodes.indexOf(i) !== -1})
     json.links.map(function(d){
       d_tmp = d
       d_tmp.source = tmp_nodes.indexOf(json.nodes[d.source])
       d_tmp.target = tmp_nodes.indexOf(json.nodes[d.target])
       return d_tmp})
     json.nodes = tmp_nodes
     return json
 }

function display_graph(json){
  var w = window.innerWidth, h = window.innerHeight,
      fill = d3.scale.category20()
			var labelDistance = 0;
			var vis = d3.select("body").append("svg:svg").attr("width", w).attr("height", h);
			var nodes = d3.values(json.nodes);
      var labelAnchors = [];
			var labelAnchorLinks = [];
			var links = json.links;

			for(var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
				labelAnchors.push({
					node : node
				});
				labelAnchors.push({
					node : node
				});
			};

			for(var i = 0; i < nodes.length; i++) {
				labelAnchorLinks.push({
					source : i * 2,
					target : i * 2 + 1,
					weight : 1
				});
			};

			var force = d3.layout.force()
          .size([w, h])
          .nodes(nodes)
          .links(links)
          .gravity(1)
          .linkDistance(50)
          .charge(-3000)
          .linkStrength(function(x) {	return 1	});
			force.start();

			var force2 = d3.layout.force()
          .nodes(labelAnchors)
          .links(labelAnchorLinks)
          .gravity(0)
          .linkDistance(0)
          .linkStrength(8)
          .charge(-100)
          .size([w, h]);
			force2.start();

			var link = vis.selectAll("line.link").data(links).enter().append("svg:line").attr("class", "link").style("stroke", "#CCC");
			var node = vis.selectAll("g.node").data(force.nodes()).enter().append("svg:g").attr("class", "node").on("mouseover", mouseover)
          .on("mouseout", mouseout);

      node.append("circle")
          .style("fill", function(d) { return fill(d.group); })
          .attr("r", function(d) { return d.is_tag? 16:8 });
      node.append("svg:title")
          .text(function(d) { return d.tooltip; });
			node.call(force.drag);

			var anchorLink = vis.selectAll("line.anchorLink").data(labelAnchorLinks)

			var anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes()).enter().append("svg:g").attr("class", "anchorNode");
			anchorNode.append("svg:circle").attr("r", 0).style("fill", "#FFF");
			anchorNode.append("svg:text")
        .style("font-size", function(d) { return d.node.is_tag ? "12px" : "9px"; })
        .style("font-weight", function(d) { return d.node.is_tag ? "bold" : ""; })
        .text(function(d, i) { return i % 2 == 0 ? "" : d.node.name; });

      anchorNode.append("text")
          .attr("x", function(d) { return d.is_tag ? 18 : 10 })
          .attr("dy", ".35em")
          .style("font-size", function(d) { return d.is_tag ? "12px" : "9px"; })
          .style("font-weight", function(d) { return d.is_tag ? "bold" : ""; })
          .text(function(d) { return d.name; });

			var updateLink = function() {
				this.attr("x1", function(d) {
					return d.source.x;
				}).attr("y1", function(d) {
					return d.source.y;
				}).attr("x2", function(d) {
					return d.target.x;
				}).attr("y2", function(d) {
					return d.target.y;
				});
			}

			var updateNode = function() {
				this.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});
			}

			force.on("tick", function() {
				force2.start();
				node.call(updateNode);
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
			})

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
    };
