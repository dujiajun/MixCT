const EC = require("elliptic");
const BN = require("bn.js");

const ec = new EC.ec("secp256k1");
const curve = ec.curve;
const p = BN.red(curve.p);
const q = BN.red(curve.n);
const zero = curve.g.mul(new BN(0));
const g = curve.g;
const f = curve.point(
  "c4abbb41fb87d293ae90fd755c1e62506b7c80d2fe84efa36970383e17ca274a",
  "d730074791dbacb3bc866d4600b62d1da3bd1aacc2da289f20424036f10c1c06"
);
const h = curve.point(
  "d67dedde7f8861e5a99c0e30e06594997e85da6604ceffd429c69bf9d1d5b4d7",
  "77f0f57c3757fc327265bf588cf1ddef2ca35b1445e9374e44ca710301bd9b61"
);

module.exports = { ec, curve, g, p, q, zero, f, h };
