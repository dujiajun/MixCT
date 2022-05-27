const { f, h, g } = require("./params");
const { randomExponent, randomGroupElement, commit } = require("./primitives");
const {
  serialize,
  deserialize,
  serializeSigmaProof,
  serializeAux,
  toBytes,
} = require("./serialize");
const { SigmaProver } = require("./prover");
const { SigmaVerifier } = require("./verifier");
const BN = require("bn.js");

class Client {
  constructor(web3, contract, account) {
    this.web3 = web3;
    this.contract = contract;
    this.account = account;
    this.value = new BN(0); // confidential randomness, client need to maintain by itself
    this.randomness = new BN(0); // confidential randomness, client need to maintain by itself

    this.vs = [];
    this.cs = []; // my escrowed in pool
    this.rs = [];
    this.trapdoors = [];
    this.tokens = [];
  }

  _generateToken() {
    const trapdoor = randomExponent();
    const token = f.mul(trapdoor);
    return { token, trapdoor };
  }

  _commit(value, randomness = null) {
    const r = randomness ? randomness : randomExponent();
    const c = commit(g, value, h, r);
    return { r, c };
  }

  async escrow(value) {
    if (!BN.isBN(value)) value = new BN(value);
    if (value.gt(this.value)) return false;
    const { r, c } = this._commit(value);
    const { trapdoor, token } = this._generateToken();
    await this.contract.escrow(serialize(c), serialize(token), {
      from: this.account,
    });
    this.cs.push(c);
    this.rs.push(r);
    this.vs.push(value);
    this.trapdoors.push(trapdoor);
    this.tokens.push(token);
    this.value = this.value.sub(value);
    this.randomness = this.randomness.sub(r);
    return true;
  }

  async readPool() {
    const pool = await this.contract.queryPool();
    return pool;
  }

  async getBalance() {
    const balance_raw = await this.contract.getAcc(this.account);
    const balance = deserialize(balance_raw);
    return balance;
  }

  getLocalBalance() {
    const { c } = this._commit(this.value, this.randomness);
    return c;
  }

  async fund(value) {
    if (!BN.isBN(value)) value = new BN(value);
    const { r, c } = this._commit(value);
    await this.contract.fund(serialize(c), { from: this.account });
    this.value = this.value.add(value);
    this.randomness = this.randomness.add(r);
  }

  async burn() {
    await this.contract.burn(toBytes(this.value), toBytes(this.randomness), {
      from: this.account,
    });
    this.value = new BN(0);
    this.randomness = new BN(0);
  }

  _generateProof(pool, c_esc, c_red, trapdoor) {
    let index = 0; // index in pool;
    const c_list = new Array(pool.length); // used to generate proof
    for (let i = 0; i < pool.length; i++) {
      const c_i = deserialize(pool[i].cesc);
      const token_i = deserialize(pool[i].token);
      if (c_i.eq(c_esc)) index = i;
      c_list[i] = c_red.add(c_i.add(token_i).neg());
    }

    const N = pool.length;
    const n = 2; // fixed argument, can be adjust according to BCC+15 paper
    const m = Math.log2(N); // require n**m == N

    const h_gens = new Array(n * m);
    h_gens[0] = h.add(f.neg());
    for (let i = 1; i < h_gens.length; i++) {
      h_gens[i] = randomGroupElement();
    }

    // g is the same with g in commit, h_gens[0] should be the h/f in paper
    const aux = { n, m, g, h_gens };
    const prover = new SigmaProver(g, h_gens, n, m);
    const proof = prover.prove(c_list, index, trapdoor);
    return { proof, aux };
  }

  async redeem(l) {
    // l is the index in our storage, not in contract
    if (l >= this.cs.length) return;
    const c_esc = this.cs[l];

    const { c: c_mask } = this._commit(0, this.trapdoors[l]);
    const c_red = c_esc.add(c_mask);

    const pool = await this.readPool();
    //console.log(pool);
    const trapdoor = this.trapdoors[l];
    const { proof, aux } = this._generateProof(pool, c_esc, c_red, trapdoor);

    //console.log("proof ", proof, serializeSigmaProof(proof));
    //console.log("aux ", aux, serializeAux(aux));
    /*console.log(
      "Redeem",
      serialize(c_red),
      serializeSigmaProof(proof),
      serializeAux(aux)
    );*/
    const c_list = pool.map((item) => {
      const c_i = deserialize(item.cesc);
      console.log(item);
      const token = deserialize(item.token);
      return c_red.add(c_i.add(token).neg());
    });
    console.log(
      "c_list",
      c_list.map((item) => serialize(item))
    );
    const verifier = new SigmaVerifier(aux.g, aux.h_gens, aux.n, aux.m);
    console.log("verify result", verifier.verify(c_list, proof));

    const result = await this.contract.redeem(
      serialize(c_red),
      serializeSigmaProof(proof),
      serializeAux(aux),
      {
        from: this.account,
      }
    );

    if (result) {
      this.value = this.value.add(this.vs[l]);
      this.randomness = this.randomness.add(this.rs[l]);
    }
    return result;
  }
}

module.exports = Client;
