const BN = require("bn.js");
const { f, h, g } = require("../src/params");
const { randomExponent, commit } = require("../src/primitives");
const { serialize, toBytes } = require("../src/serialize");

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
  const c = commit(g, v, h, r);

  const trapdoor = randomExponent();

  it("should add balance", async () => {
    const tmp = serialize(c);
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
    await tumbler.escrow(serialize(c), serialize(token), { from: accounts[0] });
    const pool = await tumbler.queryPool();
    console.log("pool", pool);
    assert.equal(pool.length, 1);
    assert.equal(pool[0].cesc.x, serialize(c)[0]);
    assert.equal(pool[0].token.y, serialize(token)[1]);
    const balance = await tumbler.getAcc(accounts[0]);
    console.log("balance", balance);
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
