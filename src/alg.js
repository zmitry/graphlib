export function components(g) {
  var visited = {};
  function dfs(v, cmpt) {
    if (!visited[v]) return;
    visited[v] = true;
    cmpt.push(v);
    g.neighbors(v).forEach((el) => dfs(el, cmpt));
  }

  const cmpts = g.nodes().reduce((acc, v) => {
    let cmpt = [];
    dfs(v, cmpt);
    if (cmpt.length) {
      acc.push(cmpt);
    }
    return acc;
  }, []);

  return cmpts;
}
