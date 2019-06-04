import { Graph, writeDot } from "../src";

describe("write", function() {
  it("can write subgraphs with attributes", function() {
    var g = new Graph({ compound: true, multigraph: true });
    g.setParent("n1", "root");
    g.setNode("root", { foo: "bar" });
    g.setEdge("n1", "n2", { foo: "baz" }, "another");
    var str = writeDot(g);
    expect(str).toMatchSnapshot();
  });

  it("can write subgraphs with attributes and intendation", function() {
    var g = new Graph({ compound: true, multigraph: true });
    g.setParent("n1", "root");
    g.setNode("root", { foo: "bar" });
    g.setEdge("n1", "n2", { foo: "baz" }, "another");
    var str = writeDot(g, "   ");
    expect(str).toMatchSnapshot();
  });
});
