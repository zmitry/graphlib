import { each, isObject, map, toString } from "lodash";

export function writeDot(g, intend = "", pickAttrs = (d) => d) {
  const ec = g.isDirected() ? "->" : "--";
  const writer = makeWriter(intend);

  if (!g.isMultigraph()) {
    writer.write("strict ");
  }

  writer.writeLine(`${g.isDirected() ? "digraph" : "graph"} {`);
  writer.indent();

  const graphAttrs = g.graph();
  if (isObject(graphAttrs)) {
    each(graphAttrs, (v, k) => {
      writer.writeLine(`${id(k)}=${id(v)};`);
    });
  }

  writeSubgraph(g, undefined, writer);

  g.edges().forEach((edge) => {
    writeEdge(g, edge, ec, writer);
  });

  writer.unindent();
  writer.writeLine("}");

  return writer.toString();

  function writeNode(g, v, writer) {
    writer.write(id(v));
    writeAttrs(g.node(v), writer);
    writer.writeLine();
  }

  function writeEdge(g, edge, ec, writer) {
    const v = edge.v;
    const w = edge.w;
    const attrs = g.edge(edge);

    writer.write(`${id(v)} ${ec} ${id(w)}`);
    writeAttrs(attrs, writer);
    writer.writeLine();
  }

  function writeAttrs(attrs, writer) {
    if (isObject(attrs)) {
      attrs = pickAttrs(attrs);

      const attrStrs = map(attrs, (val, key) => `${id(key)}=${id(val)}`);
      if (attrStrs.length) {
        writer.write(` [${attrStrs.join(",")}]`);
      }
    }
  }

  function writeSubgraph(g, v, writer) {
    const children = g.isCompound() ? g.children(v) : g.nodes();
    each(children, (w) => {
      if (!g.isCompound() || !g.children(w).length) {
        writeNode(g, w, writer);
      } else {
        writer.writeLine(`subgraph ${id(w)} {`);
        writer.indent();

        if (isObject(g.node(w))) {
          map(g.node(w), (val, key) => {
            writer.writeLine(`${id(key)}=${id(val)};`);
          });
        }

        writeSubgraph(g, w, writer);
        writer.unindent();
        writer.writeLine("}");
      }
    });
  }
}

function id(obj) {
  if (!obj) {
    return "1";
  }
  if (typeof obj === "number") {
    return obj;
  }

  return `"${toString(obj).replace(/"/g, '\\"')}"`;
}

function makeWriter(INDENT = "") {
  let indent = "";
  let content = "";
  let shouldIndent = true;
  const write = (str) => {
    if (shouldIndent) {
      shouldIndent = false;
      content += indent;
    }
    content += str;
  };
  return {
    indent() {
      indent += INDENT;
    },
    unindent() {
      indent = indent.slice(INDENT.length);
    },
    toString() {
      return content;
    },
    writeLine(line = "") {
      write(`${line}\n`);
      shouldIndent = true;
    },
    write: write
  };
}
