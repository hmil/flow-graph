
export const HEADER_HEIGHT = 32;
export const ROW_HEIGHT = 24;
export const BOX_WIDTH = 150;
export const INPUT_TEXT_OFFSET = {x: 7, y: 4};
export const OUTPUT_TEXT_OFFSET = {x: -7, y: 4};

export function getBoxHeight(node) {
  return HEADER_HEIGHT + ROW_HEIGHT * Math.max(node.n_outputs, node.n_inputs);
}

export function getInputPos(nb) {
  return {x: -1, y: HEADER_HEIGHT + ROW_HEIGHT * (1 / 2 + nb)};
}

export function getOutputPos(nb) {
  return {x: BOX_WIDTH - 1, y: HEADER_HEIGHT + ROW_HEIGHT * (1 / 2 + nb)};
}

export function getEdgePathDef(startX, startY, endX, endY) {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx*dx + dy*dy);

  const ctrl1X = startX + length / 2;
  const ctrl1Y = startY;

  const ctrl2X = endX - length / 2;
  const ctrl2Y = endY;

  return `M${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`;
}
