import resolve from "rollup-plugin-node-resolve";

export default {
  input: "./src/index.js",
  output: [
    {
      file: "dist/graph.es.js",
      format: "es",
      compact: true
    },
    {
      file: "dist/graph.cjs.js",
      format: "cjs",
      compact: true
    }
  ],
  plugins: [resolve()],
  external: ["lodash"]
};
