module.exports = {
  FlowGraph: require('./core/FlowGraph.js').default,
  Node: require('./core/Node.js').default,
  GraphView: require('./views/vanilla/GraphView.js').default,
  styles: {
    'default': require('./styles/default.style.html')
  }
};
