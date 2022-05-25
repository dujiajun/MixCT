const { SigmaVerifier } = require("./verifier");

class Tumbler {
  constructor() {
    this.esc_pool = [];
    this.red_pool = [];
  }

  escrow(c_esc, token) {
    this.esc_pool.push({ c_esc, token });
  }

  redeem(c_red, proof, aux) {
    const c_list = this.esc_pool.map((item) => {
      return c_red.add(item.c_esc.add(item.token).neg());
    });
    const verifier = new SigmaVerifier(aux.g, aux.h_gens, aux.n, aux.m);
    if (verifier.verify(c_list, proof)) {
      this.red_pool.push({ c_red, proof });
      return true;
    }
    return false;
  }
}

module.exports = Tumbler;
