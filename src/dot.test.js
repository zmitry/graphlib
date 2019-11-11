import { Graph } from "./graph";
import { writeDot } from "./dot";
test("dot", () => {
  const graph = new Graph({ compound: true });
  graph.setGraph({
    node: { color: "red" },
    edge: "test"
  });
  graph.setPath(["a", "b", "d"], { color: "red", shouldBeNumber: 1 });
  graph.setNode("b", { data: "red" });
  graph.setNode("a", { k: undefined });

  graph.setParent("a", "b");
  expect(writeDot(graph)).toMatchInlineSnapshot(`
    "strict digraph {
    \\"node\\"=\\"[object Object]\\";
    \\"edge\\"=\\"test\\";
    subgraph \\"b\\" {
    \\"data\\"=\\"red\\";
    \\"a\\" [\\"k\\"=1]
    }
    \\"d\\"
    \\"a\\" -> \\"b\\" [\\"color\\"=\\"red\\",\\"shouldBeNumber\\"=1]
    \\"b\\" -> \\"d\\" [\\"color\\"=\\"red\\",\\"shouldBeNumber\\"=1]
    }
    "
  `);
});
