const { f, h, curve } = require("./params");
const { randomExponent, commit } = require("./primitives");

class Client {
  constructor(web3) {
    this.web3 = web3;
    this.balance ;
  }

  _generateSecret() {
    const secret = randomExponent();
    const info = f.mul(secret);
    return { info, secret };
  }

  escrow(value) {
    const r = randomExponent();
    const c = commit(curve.g, value, h, r);
  }
}

module.exports = Client;
