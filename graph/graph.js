window.onload = function() {
  get_data().done(function(){
  w = window.innerWidth, h = window.innerHeight,
  fill = d3.scale.category20()
  vis = d3.select("body").append("svg:svg").attr("width", w).attr("height", h);
  var all_tags = complete_graph.nodes.filter(function(d){ return d.is_tag }).map(function(d) { return d.name })
  var ul = document.getElementById('checkboxes')
  for (var i = 1; i < all_tags.length; i++){
    var li = document.createElement('li');
    var lbl = document.createElement('label')
    lbl.htmlFor = "checkbox-" + i
    lbl.innerHTML = all_tags[i]
    var checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.name = all_tags[i]
    checkbox.id = "checkbox-" + i
    li.appendChild(lbl)
    li.appendChild(checkbox)
    ul.appendChild(li)
  }
  $( function() {
    $( "input" ).checkboxradio({
      icon: false
    })
  .on("change", function(event){
      var node_list = get_filter()
      var json = filter(complete_graph, node_list)
      display_graph(json);
  });
  });
});
}

function get_data(){
  return $.getJSON("topics.json", function(data){ complete_graph = data })
}

function get_filter(){
  var selected = [];
  $('#checkboxes input:checked').each(function() {
    selected.push($(this).attr('name'));
  });
  return selected
}

 function filter(json, node_list){
     var json_out = JSON.parse(JSON.stringify(json))
     var id_list = json_out.nodes.map(function(d,i){
        var directly_selected = (node_list.indexOf(d.name) != -1)
        var tag_selected = (d.tags.map(function(t){return node_list.indexOf(t)}).filter(function(f){return f!=-1}).length > 0)
        return !(directly_selected || tag_selected) ? -1 : i})
        .filter(function(d){return d!=-1})
     var direct_links = json_out.links.filter(function(d){
       return id_list.indexOf(d.target) !== -1 || id_list.indexOf(d.source) !== -1
     })
     var selected_nodes = id_list.concat(direct_links.reduce(function(a, d){ return a.concat([d.source, d.target]) }, []))
     var indirect_links = json_out.links.filter(function(d){
       return selected_nodes.indexOf(d.source) !== -1 && selected_nodes.indexOf(d.target) !== -1
               && direct_links.indexOf(d) === -1
     })
     json_out.links = direct_links.concat(indirect_links)
     var tmp_nodes = json_out.nodes.filter(function(d, i){return selected_nodes.indexOf(i) !== -1 && (!d.is_tag || node_list.indexOf(d.name) != -1)})
     var tmp_node_names = tmp_nodes.map(function(t){return t.name})
     var tmp_links = json_out.links.filter(function(d){
              return tmp_node_names.indexOf(json.nodes[d.source].name) != -1
              && tmp_node_names.indexOf(json.nodes[d.target].name) != -1})
     json_out.links = tmp_links.map(function(d){
       d_tmp = d
       d_tmp.source = tmp_nodes.indexOf(json_out.nodes[d.source])
       d_tmp.target = tmp_nodes.indexOf(json_out.nodes[d.target])
       return d_tmp})
     json_out.nodes = tmp_nodes
     return json_out
 }

function display_graph(json){
			var labelDistance = 0;
			var nodes = d3.values(json.nodes);
      var labelAnchors = [];
			var labelAnchorLinks = [];
			var links = json.links;
      vis.selectAll("*").data([]).exit().remove()
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
            try {
						var b = this.childNodes[1].getBBox();
						var diffX = d.x - d.node.x;
						var diffY = d.y - d.node.y;
						var dist = Math.sqrt(diffX * diffX + diffY * diffY);
						var shiftX = b.width * (diffX - dist) / (dist * 2);
						shiftX = Math.max(-b.width, Math.min(0, shiftX));
						var shiftY = 5;
						this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
          }
          catch(err) {}
					}
				});
				anchorNode.call(updateNode);
				link.call(updateLink);
				anchorLink.call(updateLink);
			})
    };

    function mouseover() {
      d3.select(this).select("circle").transition()
          .attr("r", function(d) { return d.is_tag? 32:16 });
    }

    function mouseout() {
      d3.select(this).select("circle").transition()
          .attr("r", function(d) { return d.is_tag? 16:8 });
    }
