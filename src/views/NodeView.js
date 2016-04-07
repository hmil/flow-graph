import EventEmitter from '../EventEmitter.js';
import { createSVGNode } from './SVGUtils.js';
import * as Layout from './Layout.js';

export default class NodeView extends EventEmitter {

  constructor(graphView, node) {
    super();

    // properties
    this._node = node;
    this._graphView = graphView;
    this._dragging = false;
    this._dragStart = {x: 0, y: 0};
    this._dragAnchor = {x: 0, y: 0};

    // DOM
    this._el = createSVGNode('g', {
      'class': 'flow-node'
    });


    // Events

    // Handles node DnD and Edge creation
    this._mouseDownHandler = (evt) => {
      evt.preventDefault();
      this._dragStart.x = evt.pageX;
      this._dragStart.y = evt.pageY;
      // click on anchor
      if(evt.target.hasAttribute('data-flow-io')) {
        const isInput = evt.target.getAttribute('data-flow-io') === 'input';
        const endpoint = (isInput ? this._node._inputs : this._node._outputs)[evt.target.getAttribute('data-name')];
        this._graphView.startPreviewEdgeDrag(endpoint, this._dragStart);
      } else { // click elsewhere: start dragging
        this._dragging = true;
        this._dragAnchor.x = this._node.x;
        this._dragAnchor.y = this._node.y;
      }
    };

    // Clears all DnDs
    this._mouseUpHandler = (evt) => {
      evt.preventDefault();
      this._dragging = false;
    };

    // Updates DnD state
    this._mouseMoveHandler = (evt) => {
      if (this._dragging === true) {
        this._node.x = this._dragAnchor.x + evt.pageX - this._dragStart.x;
        this._node.y = this._dragAnchor.y + evt.pageY - this._dragStart.y;
      }
    };

    this._changeHandler = () => this.render();

    // Initialization
    this.render();
    this._bindEvents();
  }

  destroy() {
    this._unbindEvents();
  }

  _bindEvents() {
    this._node.on('change', this._changeHandler);
    this._el.addEventListener('mousedown', this._mouseDownHandler);
    window.addEventListener('mouseup', this._mouseUpHandler);
    window.addEventListener('mousemove', this._mouseMoveHandler);
  }

  _unbindEvents() {
    this._node.off('change', this._changeHandler);
    this._el.removeEventListener('mousedown', this._mouseDownHandler);
    window.removeEventListener('mouseup', this._mouseUpHandler);
    window.removeEventListener('mousemove', this._mouseMoveHandler);
  }

  render() {
    this.clear();

    this._el.setAttribute('transform', `translate(${this._node.x}, ${this._node.y})`);

    const body = createSVGNode('rect', {
      'class': 'flow-body',
      'width': Layout.BOX_WIDTH,
      'height': Layout.getBoxHeight(this._node)
    });
    this._el.appendChild(body);

    const icon = createSVGNode('text', {
      'class': 'flow-icon',
      'transform': 'translate(6, 19)'
    });
    icon.innerHTML = '&#xf0fc';
    this._el.appendChild(icon);


    const name = createSVGNode('text', {
        'class': 'flow-title',
        'transform': 'translate(28, 19)'
    });
    name.innerHTML = this._node.name;
    this._el.appendChild(name);

    let num_input = 0;
    for (let i in this._node.inputs) {
      const pos = Layout.getInputPos(num_input);
      const name = this._node.inputs[i].name;
      const endpoint = createSVGNode('g', {
        'class': 'flow-io',
        'transform': `translate(${pos.x}, ${pos.y})`
      });
      const title = createSVGNode('text', {
        'transform': `translate(${Layout.INPUT_TEXT_OFFSET.x}, ${Layout.INPUT_TEXT_OFFSET.y})`
      });
      title.innerHTML = name;
      endpoint.appendChild(title);
      const anchor = createSVGNode('circle', {
        'r': 4.5,
        'class': 'flow-anchor',
        'data-node': this._node.id,
        'data-name': name,
        'data-flow-io': 'input'
      });
      endpoint.appendChild(anchor);
      this._el.appendChild(endpoint);
      num_input++;
    }

    let num_output = 0;
    for (let i in this._node.outputs) {
      const pos = Layout.getOutputPos(num_output);
      const name = this._node.outputs[i].name;
      const endpoint = createSVGNode('g', {
        'class': 'flow-io',
        'transform': `translate(${pos.x}, ${pos.y})`
      });
      const title = createSVGNode('text', {
        'transform':  `translate(${Layout.OUTPUT_TEXT_OFFSET.x}, ${Layout.OUTPUT_TEXT_OFFSET.y})`,
        'text-anchor': 'end'
      });
      title.innerHTML = name;
      endpoint.appendChild(title);
      const anchor = createSVGNode('circle', {
        'r': 4.5,
        'class': 'flow-anchor',
        'data-node': this._node.id,
        'data-name': name,
        'data-flow-io': 'output'
      });
      endpoint.appendChild(anchor);
      this._el.appendChild(endpoint);
      num_output++;
    }
  }

  clear() {
    while (this._el.firstChild) {
      this._el.removeChild(this._el.firstChild);
    }
  }

  get el() {
    return this._el;
  }
}
