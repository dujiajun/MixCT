const BN = require("bn.js");
const { f, h, g } = require("../src/params");
const {
  randomExponent,
  randomGroupElement,
  commit,
} = require("../src/primitives");
const { serialize, deserialize } = require("../src/serialize");
const { SigmaProver } = require("../src/prover");
const { SigmaVerifier } = require("../src/verifier");

const Tumbler = artifacts.require("Tumbler");

contract("Tumbler", async (accounts) => {
  let tumbler;

  before(async () => {
    tumbler = await Tumbler.deployed();
  });

  it("should print account", async () => {
    console.log(accounts);
  });

  it("should print empty balance", async () => {
    const account = accounts[0];
    //var alice = new Client(web3, tumbler, accounts[0]);
    const balance = await tumbler.getAcc(account);
    //console.log(balance);
    assert.equal(
      balance.x,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(
      balance.y,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
  });

  const r = randomExponent();
  const v = new BN(100);
  const c_esc = commit(g, v, h, r);

  const trapdoor = randomExponent();

  it("should add balance", async () => {
    const tmp = serialize(c_esc);
    //console.log(tmp);
    await tumbler.fund(tmp, { from: accounts[0] });
    //console.log(result);
    const balance = await tumbler.getAcc(accounts[0]);
    console.log("balance", balance);
    assert.equal(balance.x, tmp[0]);
    assert.equal(balance.y, tmp[1]);
  });

  it("should escrow", async () => {
    const token = f.mul(trapdoor);
    await tumbler.escrow(serialize(c_esc), serialize(token), {
      from: accounts[0],
    });
    const pool = await tumbler.queryPool();
    console.log("pool", pool);
    assert.equal(pool.length, 1);
    assert.equal(pool[0].cesc.x, serialize(c_esc)[0]);
    assert.equal(pool[0].token.y, serialize(token)[1]);
    const balance = await tumbler.getAcc(accounts[0]);
    console.log("balance", balance);
  });

  it("should escrow another", async () => {
    const cesc_another = commit(g, 200, h, randomExponent());
    const tmp = serialize(cesc_another);
    const another_trapdoor = randomExponent();
    const anonther_token = f.mul(another_trapdoor);
    await tumbler.fund(tmp, { from: accounts[1] });
    await tumbler.escrow(serialize(cesc_another), serialize(anonther_token), {
      from: accounts[1],
    });
  });

  it("should redeem", async () => {
    const c_red = c_esc.add(commit(g, 0, h, trapdoor));
    const pool = await tumbler.queryPool();
    var index = -1;

    const c_list = new Array(pool.length);

    for (let i = 0; i < pool.length; i++) {
      const c_i = deserialize(pool[i].cesc);
      const token_i = deserialize(pool[i].token);
      if (c_i.eq(c_esc)) index = i;
      c_list[i] = c_red.add(c_i.add(token_i).neg());
    }

    const n = 2;
    const m = 1; // make sure n*m = list.length
    const h_gens = new Array(n * m);
    h_gens[0] = h.add(f.neg());
    for (let i = 1; i < h_gens.length; i++) {
      h_gens[i] = randomGroupElement();
    }

    const prover = new SigmaProver(g, h_gens, n, m);
    const proof = prover.prove(c_list, index, trapdoor);
    const verifier = new SigmaVerifier(g, h_gens, n, m);
    assert.isTrue(verifier.verify(c_list, proof));
  });

  it("should remove balance", async () => {
    const balance = await tumbler.getAcc(accounts[0]);
    console.log("balance", balance);
    await tumbler.burn(v, r, { from: accounts[0] });
    const newbalance = await tumbler.getAcc(accounts[0]);
    console.log("newbalance", newbalance);
    const zero = serialize(commit(g, 0, h, 0));
    console.log("zero", zero);
    assert.equal(newbalance.x, zero[0]);
    assert.equal(newbalance.y, zero[1]);
  });
});
