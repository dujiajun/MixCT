const BN = require("bn.js");
const { zero } = require("./params");

class R1Proof {
  constructor() {
    this.A = zero;
    this.C = zero;
    this.D = zero;
    this.f = [];
    this.ZA = new BN(0);
    this.ZC = new BN(0);
  }
}

class SigmaProof {
  constructor() {
    this.n = 0;
    this.m = 0;
    this.B = zero;
    this.r1Proof = new R1Proof();
    this.Gk = [];
    this.z = new BN(0);
  }
}

module.exports = { R1Proof, SigmaProof };
