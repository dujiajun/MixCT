const { curve, zero } = require("./params");

const EMPTY =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

function toBytes(x) {
  return "0x" + x.toString(16, 64);
}

function representate(point) {
  if (point.x == null && point.y == null) return EMPTY + EMPTY.slice(2);
  return toBytes(point.getX()) + toBytes(point.getY()).slice(2);
}

function serialize(point) {
  if (point.x == null && point.y == null) return [EMPTY, EMPTY];
  return [toBytes(point.getX()), toBytes(point.getY())];
}

function deserialize(serialization) {
  if (serialization[0] == EMPTY && serialization[1] == EMPTY) return zero;
  return curve.point(serialization[0].slice(2), serialization[1].slice(2));
}

module.exports = { toBytes, representate, serialize, deserialize };
