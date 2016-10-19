import Node from './core/Node';

export default class Style {
  HEADER_HEIGHT: number;
  BOX_WIDTH: number;
  INPUT_TEXT_OFFSET: {x: number, y: number};
  OUTPUT_TEXT_OFFSET: {x: number, y: number};
  getBoxHeight: (node: Node) => number;
  getInputPos: (nb: Number) => {x: number, y: number};
  getOutputPos: (nb: Number) => {x: number, y: number};
  getEdgePathDef: (startX: number, startY: number, endX: number, endY: number) => string;
  css: string;
}
