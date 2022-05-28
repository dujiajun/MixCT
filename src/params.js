const EC = require("elliptic");
const BN = require("bn.js");

const FIELD_MODULUS = new BN(
  "30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47",
  16
);
const GROUP_MODULUS = new BN(
  "30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001",
  16
);

const curve = new EC.curve.short({
  a: "0",
  b: "3",
  p: FIELD_MODULUS,
  n: GROUP_MODULUS,
  gRed: false,
  g: [
    "077da99d806abd13c9f15ece5398525119d11e11e9836b2ee7d23f6159ad87d4",
    "01485efa927f2ad41bff567eec88f32fb0a0f706588b4e41a8d587d008b7f875",
  ],
  // bizarre that g is set equal to one of the pedersen base elements. actually in theory not necessary (though the verifier would have to change also).
});

const p = BN.red(curve.p);
const q = BN.red(curve.n);
const zero = curve.g.mul(new BN(0));
const g = curve.g;
const f = curve.g.mul(new BN(11));
const h = curve.g.mul(new BN(7));

module.exports = { curve, g, p, q, zero, f, h };
