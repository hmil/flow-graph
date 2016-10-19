import EdgeView from './EdgeView';
import NodeView from './NodeView';
import { createSVGNode } from './SVGUtils';
import defaultStyle from '../../styles/default.style.html';
import { styleManager } from '../../utils';
import FlowGraph from '../../core/FlowGraph';
import NodeEndpoint from '../../core/NodeEndpoint';
import NodeInput from '../../core/NodeInput';
import NodeOutput from '../../core/NodeOutput';
import Node from '../../core/Node';

export default class GraphView {

  private _graph: FlowGraph;
  private _edges: {[key: string]: EdgeView} = {};
  private _nodes: {[key: string]: NodeView} = {};
  private _dragStart: {x: number, y: number} = {x: 0, y: 0};
  private _previewEdgeEndpoint?: NodeEndpoint;
  private _previewEdgeDragFromInput: boolean = false;
  private _previewEdge: SVGElement;
  private _el: SVGElement;
  private _previewEdgeDragAnchor: {x: number, y: number};

  constructor(graph: FlowGraph, options) {
    this._graph = graph;

    if (!styleManager.hasStyle()) {
      styleManager.setStyle(defaultStyle);
    }
    this._previewEdge = createSVGNode('path', {
      'class': 'flow-edge'
    });
    this._el = createSVGNode('svg', {
      'class': 'flow-canvas',
      'xmlns': 'http://www.w3.org/2000/svg',
      'width': '100%',
      'height': '100%'
    });

    if (options.domNode) {
      this.attachTo(options.domNode);
    }

    this.render();
    this._bindEvents();
  }

  private _mouseMoveHandler = (evt: MouseEvent): void => {
    if (this._previewEdgeEndpoint != null) {
      this._updatePreviewEdge(
        this._previewEdgeDragAnchor.x + evt.pageX - this._dragStart.x,
        this._previewEdgeDragAnchor.y + evt.pageY - this._dragStart.y);
    }
  }

  private _mouseUpHandler = (evt: MouseEvent): void => {
    if (this._previewEdgeEndpoint != null) {
      this.stopPreviewEdgeDrag();
      if ((<Element>evt.target).hasAttribute('data-flow-io')) {
        var attr = (<Element>evt.target).getAttribute('data-node');
        var name = (<Element>evt.target).getAttribute('data-name');
        if (!attr || !name) throw new Error('Invalid DOM node');
        const node = <Node>this._graph.nodes[attr]; // TODO make private and use accessor instead (which throws on not found)
        const endpoint: NodeEndpoint = (this._previewEdgeDragFromInput === true ? node.outputs : node.inputs)[name];
        let src: NodeOutput;
        let dest: NodeInput;
        if (this._previewEdgeDragFromInput === true) {
          src = <NodeOutput>endpoint;
          dest = <NodeInput>this._previewEdgeEndpoint;
        } else {
          dest = <NodeInput>endpoint;
          src = <NodeOutput>this._previewEdgeEndpoint;
        }
        this._graph.link(src, dest);
      }
    }
  }

  private _changeHandler = (): void => {
    this.render();
  }

  _bindEvents(): void {
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

  removeEdge(edge: EdgeView) {
    delete this._edges[edge.edge.id];
    this._el.removeChild(edge.el);
    edge.destroy();
  }

  stopPreviewEdgeDrag() {
    this._el.removeChild(this._previewEdge);
    this._previewEdgeEndpoint = undefined;
    this._updateDropTargets();
  }

  startPreviewEdgeDrag(endpoint: NodeEndpoint, dragStart) {
    this._dragStart.x = dragStart.x;
    this._dragStart.y = dragStart.y;
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
      if (this._previewEdgeEndpoint != null) {
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
    var style = styleManager.style;
    if (style == null) throw new Error("Style is not set");
    return style;
  }
}
