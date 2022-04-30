const EC = require("elliptic");
const BN = require("bn.js");
const { randomGroupElement } = require("./primitives");

const curve = new EC.ec("secp256k1").curve;
const p = BN.red(curve.p);
const q = BN.red(curve.n);
const zero = curve.g.mul(new BN(0));
const f = randomGroupElement();
const h = randomGroupElement();

module.exports = { curve, p, q, zero, f, h };
