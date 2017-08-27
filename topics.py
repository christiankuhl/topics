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

    def from_csv(filename):
        with open(filename, "r", encoding='latin_1') as f:
            csv.register_dialect('mine', delimiter=";")
            reader = csv.DictReader(f, dialect="mine")
            topic_list = [line for line in reader]
        return TopicNetwork.from_list(topic_list)

    def from_list(topic_list):
        complex_beast = nx.DiGraph()
        all_tags = set()
        for line in topic_list:
            tags = [line["Tag" + str(tag)] for tag in range(1,5)
                                        if line["Tag" + str(tag)]]
            line['tags'] = tags
            line['is_tag'] = False
            line['group'] = 2
            complex_beast.add_node(line['Topic'], line)
            all_tags = all_tags.union(tags)
        for tag in all_tags:
            tag_dict = {}
            tag_dict['name'] = tag
            tag_dict['is_tag'] = True
            tag_dict['group'] = 1
            tag_dict['related'] = 0
            tag_dict['tags'] = []
            complex_beast.add_node(tag, tag_dict)
        for line in topic_list:
            item = line["Topic"]
            dependencies = {line["Dep" + str(dep)] for dep in range(1, 5)
                                                if line["Dep" + str(dep)]}
            dependants = {line[str(dep) + "Dep"] for dep in range(1, 5)
                                                if line[str(dep) + "Dep"]}
            for dep in dependencies:
                complex_beast.add_edge(dep, item)
            for dep in dependants:
                complex_beast.add_edge(item, dep)
            for tag in line['tags']:
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

    def render(self, server="flask"):
        input_text = "\n".join(["""<li>
        <label for="checkbox-{0}">{1}</label>
        <input type="checkbox" name="{1}" id="checkbox-{0}"></li>
        """.format(*item) for item in enumerate(self.tags)])
        copyfile(app_root + "/graph/graph_template.html",
                        app_root + "/graph/graph.html")
        with fileinput.FileInput(app_root + "/graph/graph.html", inplace=True) as file:
            for line in file:
                print(line.replace("#INPUTS#", input_text), end='')
        getattr(self, "render_" + server)()

    def render_flask(self):
        d = json_graph.node_link_data(self.beast)
        json.dump(d, open(app_root + '/graph/topics.json', 'w'))
        app = flask.Flask(__name__, static_folder = "graph")
        @app.route('/<path:path>')
        def static_proxy(path):
            return app.send_static_file(path)
        app.run(port=8000)

if __name__ == "__main__":
    g = TopicNetwork.from_csv(db_root + "/topics.csv")
    g.render()
