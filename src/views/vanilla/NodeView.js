import EventEmitter from '../../core/EventEmitter.js';
import { createSVGNode } from './SVGUtils.js';

export default class NodeView extends EventEmitter {

  constructor(graphView, node) {
    super();

    // properties
    this._node = node;
    this._graphView = graphView;
    this._dragging = false;
    this._dragStart = {x: 0, y: 0};
    this._dragAnchor = {x: 0, y: 0};
    // Endpoint currently being dragged. If the type is incompatible with endoints on this node,
    // display them with the appropriate class
    this._targetEndpoint = null;

    // DOM
    this._el = createSVGNode('g', {
      'class': 'flow-node'
    });


    // Events

    // Handles node DnD and Edge creation
    this._mouseDownHandler = (evt) => {
      evt.preventDefault();
      if (evt.button === 0) {
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

  updateDropTargets(endpoint) {
    this._targetEndpoint = endpoint;
    this.render();
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

  _getInputClassModifier(input) {
    if (this._targetEndpoint == null) return '';
    else if ((this._targetEndpoint.isOutput) && this._graphView.graph.typeCheck(this._targetEndpoint.type, input.type)) {
      return 'flow-valid';
    } else {
      return 'flow-invalid';
    }
  }

  _getOutputClassModifier(output) {
    if (this._targetEndpoint == null) return '';
    else if ((this._targetEndpoint.isInput) && this._graphView.graph.typeCheck(output.type, this._targetEndpoint.type)) {
      return 'flow-valid';
    } else {
      return 'flow-invalid';
    }
  }

  render() {
    this.clear();

    this._el.setAttribute('transform', `translate(${this._node.x}, ${this._node.y})`);

    const body = createSVGNode('rect', {
      'class': 'flow-body',
      'width': this.style.BOX_WIDTH,
      'height': this.style.getBoxHeight(this._node)
    });
    this._el.appendChild(body);

    const icon = createSVGNode('text', {
      'class': 'flow-icon',
      'transform': 'translate(6, 19)'
    });
    icon.innerHTML = this._node.icon || '';
    this._el.appendChild(icon);


    const name = createSVGNode('text', {
        'class': 'flow-title',
        'transform': 'translate(28, 19)'
    });
    name.innerHTML = this._node.name;
    this._el.appendChild(name);

    let num_input = 0;
    for (let i in this._node.inputs) {
      const pos = this.style.getInputPos(num_input);
      const input = this._node.inputs[i];
      const endpoint = createSVGNode('g', {
        'class': 'flow-io',
        'transform': `translate(${pos.x}, ${pos.y})`
      });
      const title = createSVGNode('text', {
        'transform': `translate(${this.style.INPUT_TEXT_OFFSET.x}, ${this.style.INPUT_TEXT_OFFSET.y})`
      });
      title.innerHTML = input.name;
      endpoint.appendChild(title);
      const anchor = createSVGNode('circle', {
        'r': 4.5,
        'class': `flow-anchor ${this._getInputClassModifier(input)}`,
        'data-node': this._node.id,
        'data-name': input.name,
        'data-flow-io': 'input'
      });
      endpoint.appendChild(anchor);
      this._el.appendChild(endpoint);
      num_input++;
    }

    let num_output = 0;
    for (let i in this._node.outputs) {
      const pos = this.style.getOutputPos(num_output);
      const output = this._node.outputs[i];
      const endpoint = createSVGNode('g', {
        'class': 'flow-io',
        'transform': `translate(${pos.x}, ${pos.y})`
      });
      const title = createSVGNode('text', {
        'transform':  `translate(${this.style.OUTPUT_TEXT_OFFSET.x}, ${this.style.OUTPUT_TEXT_OFFSET.y})`,
        'text-anchor': 'end'
      });
      title.innerHTML = output.name;
      endpoint.appendChild(title);
      const anchor = createSVGNode('circle', {
        'r': 4.5,
        'class': `flow-anchor ${this._getOutputClassModifier(output)}`,
        'data-node': this._node.id,
        'data-name': output.name,
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

  get style() {
    return this._graphView.style;
  }
}
