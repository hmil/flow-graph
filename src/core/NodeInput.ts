import NodeEndpoint from './NodeEndpoint';

// TODO make it an actual class
interface Event {
  nodeclass: string;
  node: string;
  endpoint: any;
}

export default class NodeInput extends NodeEndpoint {

  private _handle: (data: any, event: Event) => void;

  constructor(graph, node, props) {
    super(graph, node, props);
    this._handle = props.handle;
  }

  get isInput(): boolean {
    return true;
  }

  receive(data, sender): void {
    this._handle(data, {
      nodeclass: sender.node.classname,
      node: sender.node.name,
      endpoint: sender.node.endpoint
    });
  }
}
