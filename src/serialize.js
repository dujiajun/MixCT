const { curve, zero } = require("./params");
const BN = require("bn.js");
const EMPTY =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

function toBytes(x) {
  return "0x" + x.toString(16, 32);
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

function serializeR1Proof(proof) {
  const result = [];
  result.push(serialize(proof.A));
  result.push(serialize(proof.C));
  result.push(serialize(proof.D));
  result.push(proof.f.map((item) => toBytes(item)));
  result.push(toBytes(proof.ZA.mod(curve.n)));
  result.push(toBytes(proof.ZC.mod(curve.n)));
  return result;
}

function serializeSigmaProof(proof) {
  const result = [];
  result.push(serialize(proof.B));
  result.push(serializeR1Proof(proof.r1Proof));
  result.push(proof.Gk.map((item) => serialize(item)));
  result.push(toBytes(proof.z.mod(curve.n)));
  return result;
}

function serializeAux(aux) {
  const result = [];
  result.push(toBytes(new BN(aux.n)));
  result.push(toBytes(new BN(aux.m)));
  result.push(serialize(aux.g));
  result.push(aux.h_gens.map((item) => serialize(item)));
  return result;
}

module.exports = {
  toBytes,
  representate,
  serialize,
  deserialize,
  serializeSigmaProof,
  serializeAux,
};
