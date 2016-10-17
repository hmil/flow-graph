
export namespace v1 {
  export interface Node {
    id: string;
    x: number;
    y: number;
    name: string;
    props: any;
  }

  export interface NodeRef {
    name: string;
    node: string;
  }

  export interface Edge {
    src: NodeRef;
    dest: NodeRef;
  }

  export interface NodeDef {
    n: string;
    p: Node;
  }

  export interface Graph {
    '@ioflow-version': number;
    nodes: Array<NodeDef>
    edges: Array<Edge>
  }
}
