const { f, h, g } = require("./params");
const { randomExponent, commit } = require("./primitives");
const { serialize } = require("./serialize");

class Client {
  constructor(web3, contract, account) {
    this.web3 = web3;
    this.contract = contract;
    this.account = account;
    this.value = 0; // confidential randomness
    this.randomness = 0; // confidential randomness
  }

  _generateSecret() {
    const secret = randomExponent();
    const info = f.mul(secret);
    return { info, secret };
  }

  escrow(value) {
    const r = randomExponent();
    const c = commit(g, value, h, r);
  }

  getConfidentialBalance() {
    return this.contract.getAcc();
  }

  fund(value) {
    const r = randomExponent();
    const c = commit(g, value, h, r);
    return this.contract.fund(serialize(c), { from: this.account });
  }

  burn() {}
}

module.exports = Client;
