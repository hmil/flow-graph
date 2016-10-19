import EventEmitter from '../../core/EventEmitter';
import Edge from '../../core/Edge';
import { createSVGNode } from './SVGUtils';
import GraphView from './GraphView';

export default class EdgeView extends EventEmitter {

  private _edge: Edge;
  private _graphView: GraphView;
  private _el: SVGElement;

  constructor(graphView, edge) {
    super();

    // properties
    this._edge = edge;
    this._graphView = graphView;

    // DOM
    this._el = createSVGNode('path', {
      'class': 'flow-edge'
    });

    // Initialization
    this.render();
    this._bindEvents();
  }

  destroy() {
    this._unbindEvents();
  }

  private _changeHandler = () => {
    this.render();
  }

  private _dblClickHandler = (evt: MouseEvent): void => {
    evt.preventDefault();
    this._edge.remove();
  }
  private _mouseDownHandler = (evt: MouseEvent): void => {
    evt.preventDefault();
    if (evt.button === 2) {
      this._edge.remove();
    }
  };

  _bindEvents() {
    this._edge.src.node.on('change', this._changeHandler);
    this._edge.dest.node.on('change', this._changeHandler);
    this._el.addEventListener('dblclick', this._dblClickHandler);
    this._el.addEventListener('mousedown', this._mouseDownHandler);
  }

  _unbindEvents() {
    this._edge.src.node.off('change', this._changeHandler);
    this._edge.dest.node.off('change', this._changeHandler);
    this._el.removeEventListener('dblclick', this._dblClickHandler);
    this._el.removeEventListener('mousedown', this._mouseDownHandler);
  }

  render() {
    const src = this._edge.src;
    const dest = this._edge.dest;

    const startRelative = this.style.getOutputPos(src.node.getOutputIndex(src));
    const startX = src.node.x + startRelative.x;
    const startY = src.node.y + startRelative.y;

    const endRelative = this.style.getInputPos(dest.node.getInputIndex(dest));
    const endX = dest.node.x + endRelative.x;
    const endY = dest.node.y + endRelative.y;

    this._el.setAttribute('d', this.style.getEdgePathDef(startX, startY, endX, endY));
  }

  get el() {
    return this._el;
  }

  get edge() {
    return this._edge;
  }

  get style() {
    return this._graphView.style;
  }
}
