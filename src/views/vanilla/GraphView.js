import EdgeView from './EdgeView.js';
import NodeView from './NodeView.js';
import { createSVGNode } from './SVGUtils.js';
import * as defaultStyle from '../../styles/default.style.html';
import { StyleManager } from '../../utils.js';

export default class GraphView {

  constructor(graph, options) {
    this._graph = graph;

    if (!StyleManager.hasStyle()) {
      StyleManager.setStyle(defaultStyle);
    }

    this._edges = {};
    this._nodes = {};

    this._dragStart = {x: 0, y: 0};
    this._previewEdgeDragging = false;
    this._previewEdgeEndpoint = null;
    this._previewEdgeDragFromInput = false;
    this._previewEdge = createSVGNode('path', {
      'class': 'flow-edge'
    });

    this._el = createSVGNode('svg', {
      'class': 'flow-canvas',
      'xmlns': 'http://www.w3.org/2000/svg',
      'width': '100%',
      'height': '100%'
    });

    this._mouseUpHandler = () => {
      if (this._previewEdgeDragging === true) {
        this._el.removeChild(this._previewEdge);
      }
    };

    this._mouseMoveHandler = (evt) => {
      if (this._previewEdgeDragging === true) {
        this._updatePreviewEdge(
          this._previewEdgeDragAnchor.x + evt.pageX - this._dragStart.x,
          this._previewEdgeDragAnchor.y + evt.pageY - this._dragStart.y);
      }
    };

    this._mouseUpHandler = (evt) => {
      if (this._previewEdgeDragging === true) {
        this.stopPreviewEdgeDrag();
        if (evt.target.hasAttribute('data-flow-io')) {
          const node = this._graph.nodes[evt.target.getAttribute('data-node')];
          const endpoint = (this._previewEdgeDragFromInput === true ? node.outputs : node.inputs)[evt.target.getAttribute('data-name')];
          let src = this._previewEdgeEndpoint;
          let dest = endpoint;
          if (this._previewEdgeDragFromInput === true) {
            src = endpoint;
            dest = this._previewEdgeEndpoint;
          }
          this._graph.link(src, dest);
        }
      }
    };

    this._changeHandler = () => this.render();

    if (options.domNode) {
      this.attachTo(options.domNode);
    }

    this.render();
    this._bindEvents();
  }

  _bindEvents() {
    this._graph.on('change', this._changeHandler);
    window.addEventListener('mousemove', this._mouseMoveHandler);
    window.addEventListener('mouseup', this._mouseUpHandler);
  }

  attachTo(domNode) {
    domNode.appendChild(this._el);
  }

  clear() {
    for (let i in this._edges) {
      this._edges[i].destroy();
    }
    this._edges = {};
    for (let i in this._nodes) {
      this._nodes[i].destroy();
    }
    this._nodes = {};
    while (this._el.firstChild) {
      this._el.removeChild(this._el.firstChild);
    }
  }

  removeEdge(edge) {
    delete this._edges[edge.edge.id];
    this._el.removeChild(edge._el);
    edge.destroy();
  }

  stopPreviewEdgeDrag() {
    this._el.removeChild(this._previewEdge);
    this._previewEdgeDragging = false;
    this._updateDropTargets();
  }

  startPreviewEdgeDrag(endpoint, dragStart) {
    this._dragStart.x = dragStart.x;
    this._dragStart.y = dragStart.y;
    this._previewEdgeDragging = true;
    this._previewEdgeEndpoint = endpoint;
    this._previewEdgeDragFromInput = (endpoint.isInput);
    this._previewEdgeDragAnchor = this._previewEdgeDragFromInput ?
      this.style.getInputPos(endpoint.node.getInputIndex(endpoint)) :
      this.style.getOutputPos(endpoint.node.getOutputIndex(endpoint));
    this._previewEdgeDragAnchor.x += endpoint.node.x;
    this._previewEdgeDragAnchor.y += endpoint.node.y;
    this._el.insertBefore(this._previewEdge, this._el.firstChild);
    this._updatePreviewEdge(this._previewEdgeDragAnchor.x, this._previewEdgeDragAnchor.y);
    this._updateDropTargets();
  }

  _updatePreviewEdge(cursorX, cursorY) {
    const cursor = {x: cursorX, y: cursorY};
    let src = this._previewEdgeDragAnchor;
    let dest = cursor;
    if (this._previewEdgeDragFromInput === true) {
      src = cursor;
      dest = this._previewEdgeDragAnchor;
    }
    this._previewEdge.setAttribute('d', this.style.getEdgePathDef(src.x, src.y, dest.x, dest.y));
  }

  _updateDropTargets() {
    for (let i in this._nodes) {
      if (this._previewEdgeDragging === true) {
        this._nodes[i].updateDropTargets(this._previewEdgeEndpoint);
      } else {
        this._nodes[i].updateDropTargets(null);
      }
    }
  }

  render() {

    this.clear();

    for (let edge of this._graph.edges) {
      const ev = this._edges[edge.id] = new EdgeView(this, edge);
      this._el.appendChild(ev.el);
    }

    for (let i in this._graph.nodes) {
      const nv = this._nodes[i] = new NodeView(this, this._graph.nodes[i]);
      this._el.appendChild(nv.el);
    }
  }

  get graph() {
    return this._graph;
  }

  get style() {
    return StyleManager.style;
  }
}
