import networkx as nx
import matplotlib.pyplot as plt
import csv
from itertools import combinations
import json
from networkx.readwrite import json_graph
import flask
import fileinput
from shutil import copyfile
from config import *

class TopicNetwork(object):
    def __init__(self, beast):
        self.beast = beast
        self.tags = [self.beast.node[tag]["name"] for tag in self.beast if self.beast.node[tag]["is_tag"]]
        input_text = "\n".join(["""
        <label for="checkbox-{0}">{1}</label>
        <input type="checkbox" name="checkbox-{0}" id="checkbox-{0}">
        """.format(*item) for item in enumerate(self.tags)])
        copyfile(app_root + "/graph/graph_template.html",
                        app_root + "/graph/graph.html")
        with fileinput.FileInput(app_root + "/graph/graph.html", inplace=True) as file:
            for line in file:
                print(line.replace("#INPUTS#", input_text), end='')

    def from_csv(filename):
        with open(filename, "r") as f:
            csv.register_dialect('mine', delimiter=";")
            reader = csv.DictReader(f, dialect="mine")
            topic_list = [line for line in reader]
        return TopicNetwork.from_list(topic_list)

    def from_list(topic_list)
        for line in topic_list:
            topic_fields = {line["Tag" + str(tag)] for tag in range(1,5)}
            for e in combinations(topic_fields, 2):
                field_graph.add_edge(e[0], e[1])
        complex_beast = nx.DiGraph()
        all_tags = set()
        for line in topic_list:
            complex_beast.add_node(line['Topic'], line)
            complex_beast.node[line['Topic']]['is_tag'] = False
            complex_beast.node[line['Topic']]['group'] = 2
            all_tags = all_tags.union({line["Tag" + str(n)] for n in range(1, 5)
                                                if line["Tag" + str(n)]})
        for tag in all_tags:
            complex_beast.add_node(tag)
            complex_beast.node[tag]['name'] = tag
            complex_beast.node[tag]['is_tag'] = True
            complex_beast.node[tag]['group'] = 1
            complex_beast.node[tag]['related'] = 0
        for line in topic_list:
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

        for node in complex_beast:
            node_dict = complex_beast.node[node]
            if node_dict['is_tag']:
                tooltip = (node_dict['name'] + "\n" +
                           "{} related tasks".format(node_dict["related"]))
            else:
                tooltip = (node_dict['Topic'] + "\n" +
                    "\n".join(["{}: {}".format(k, l) for k, l in node_dict.items()
                                if k in ["Horizon", "Impact", "Criticality",
                                            "Status"]]))
                node_dict['name'] = node_dict['Topic']
            node_dict["tooltip"] = tooltip
        return TopicNetwork(complex_beast)

if __name__ == "__main__":
    g = TopicNetwork.from_csv(db_root + "/topics.csv")
    d = json_graph.node_link_data(g.beast)
    json.dump(d, open(app_root + '/graph/topics.json', 'w'))
    app = flask.Flask(__name__, static_folder = "graph")
    @app.route('/<path:path>')
    def static_proxy(path):
        return app.send_static_file(path)
    app.run(port=8000)
