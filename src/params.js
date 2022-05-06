const EC = require("elliptic");
const BN = require("bn.js");

const ec = new EC.ec("secp256k1");
const curve = ec.curve;
const p = BN.red(curve.p);
const q = BN.red(curve.n);
const zero = curve.g.mul(new BN(0));
const f = ec.genKeyPair().getPublic();
const h = ec.genKeyPair().getPublic();

module.exports = { ec, curve, p, q, zero, f, h };
