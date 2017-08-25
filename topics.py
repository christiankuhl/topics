import networkx as nx
import matplotlib.pyplot as plt
import csv
from itertools import combinations
import json
from networkx.readwrite import json_graph
import flask

class TopicNetwork(object):
    def from_csv(filename):
        with open(filename, "r") as f:
            csv.register_dialect('mine', delimiter=";")
            reader = csv.DictReader(f, dialect="mine")
            lines = [line for line in reader]
        field_graph = nx.Graph()
        for line in lines:
            topic_fields = {line["Tag" + str(tag)] for tag in range(1,5)}
            for e in combinations(topic_fields, 2):
                field_graph.add_edge(e[0], e[1])
        complex_beast = nx.DiGraph()
        all_tags = set()
        for line in lines:
            complex_beast.add_node(line['Topic'], line)
            complex_beast.node[line['Topic']]['is_tag'] = False
            complex_beast.node[line['Topic']]['group'] = 2
            all_tags = all_tags.union({line["Tag" + str(n)] for n in range(1, 5)
                                                if line["Tag" + str(n)]})
        print(all_tags)
        for tag in all_tags:
            complex_beast.add_node(tag)
            complex_beast.node[tag]['name'] = tag
            complex_beast.node[tag]['is_tag'] = True
            complex_beast.node[tag]['group'] = 1
            complex_beast.node[tag]['related'] = 0
        for line in lines:
            item = line["Topic"]
            dependencies = {line["Dep" + str(dep)] for dep in range(1, 5)
                                                if line["Dep" + str(dep)]}
            dependants = {line[str(dep) + "Dep"] for dep in range(1, 5)
                                                if line[str(dep) + "Dep"]}
            for dep in dependencies:
                complex_beast.add_edge(dep, item)
            tags = {line["Tag" + str(tag)] for tag in range(1,5)
                                            if line["Tag" + str(tag)]}
            for tag in tags:
                if not dependants or not dependencies:
                    complex_beast.add_edge(item, tag)
                r = complex_beast.node[tag]["related"]
                complex_beast.node[tag]["related"] = r + 1
                # complex_beast[tag]['related'] = complex_beast[tag]['related'] + 1

        for node in complex_beast:
            node_dict = complex_beast.node[node]
            if node_dict['is_tag']:
                tooltip = (node_dict['name'] + "\n" +
                           "{} related tasks".format(node_dict["related"]))
            else:
                tooltip = (node_dict['Topic'] + "\n" +
                    "\n".join(["{}: {}".format(k, l) for k, l in node_dict.items()
                                if k in ["Horizon", "Impact", "Criticality"]]))
            node_dict["tooltip"] = tooltip

        return complex_beast

if __name__ == "__main__":
    g = TopicNetwork.from_csv("topics.csv")
    d = json_graph.node_link_data(g)
    json.dump(d, open('graph/topics.json', 'w'))
    app = flask.Flask(__name__, static_folder = "graph")
    @app.route('/<path:path>')
    def static_proxy(path):
        return app.send_static_file(path)
    app.run(port=8000)
