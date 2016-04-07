import EventEmitter from '../EventEmitter.js';
import { createSVGNode } from './SVGUtils.js';
import * as Layout from './Layout.js';

export default class EdgeView extends EventEmitter {

  constructor(graphView, edge) {
    super();

    // properties
    this._edge = edge;
    this._graphView = graphView;

    // DOM
    this._el = createSVGNode('path', {
      'class': 'flow-edge'
    });

    // Events
    this._changeHandler = () => this.render();
    this._dblClickHandler = (evt) => {
      evt.preventDefault();
      this._edge.remove();
    };
    this._mouseDownHandler = (evt) => {
      evt.preventDefault();
      if (evt.button === 2) {
        this._edge.remove();
      }
    };
    this._edgeRemoveHandler = () => {
      this._graphView.removeEdge(this);
    };

    // Initialization
    this.render();
    this._bindEvents();
  }

  destroy() {
    this._unbindEvents();
  }

  _bindEvents() {
    this._edge.src.node.on('change', this._changeHandler);
    this._edge.dest.node.on('change', this._changeHandler);
    this._edge.on('remove', this._edgeRemoveHandler);
    this._el.addEventListener('dblclick', this._dblClickHandler);
    this._el.addEventListener('mousedown', this._mouseDownHandler);
  }

  _unbindEvents() {
    this._edge.src.node.off('change', this._changeHandler);
    this._edge.dest.node.off('change', this._changeHandler);
    this._edge.off('remove', this._edgeRemoveHandler);
    this._el.removeEventListener('dblclick', this._dblClickHandler);
    this._el.removeEventListener('mousedown', this._mouseDownHandler);
  }

  render() {
    const src = this._edge.src;
    const dest = this._edge.dest;

    const startRelative = Layout.getOutputPos(src.node.getOutputIndex(src));
    const startX = src.node.x + startRelative.x;
    const startY = src.node.y + startRelative.y;

    const endRelative = Layout.getInputPos(dest.node.getInputIndex(dest));
    const endX = dest.node.x + endRelative.x;
    const endY = dest.node.y + endRelative.y;

    this._el.setAttribute('d', Layout.getEdgePathDef(startX, startY, endX, endY));
  }

  get el() {
    return this._el;
  }

  get edge() {
    return this._edge;
  }
}
