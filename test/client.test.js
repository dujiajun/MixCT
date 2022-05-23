const { f, h, g } = require("../src/params");
const { randomExponent, commit } = require("../src/primitives");
const { serialize } = require("../src/serialize");

const Tumbler = artifacts.require("Tumbler");

contract("Tumbler", async (accounts) => {
  let tumbler;

  before(async () => {
    tumbler = await Tumbler.new();
  });

  it("should print account", async () => {
    console.log(accounts);
  });

  it("should print empty balance", async () => {
    const account = accounts[0];
    //var alice = new Client(web3, tumbler, accounts[0]);
    const balance = await tumbler.getAcc(account);
    console.log(balance);
    assert.equal(
      balance.x,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(
      balance.y,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
  });

  it("should add balance", async () => {
    const r = randomExponent();
    const c = commit(g, 100, h, r);
    const tmp = serialize(c);
    console.log(tmp);
    await tumbler.fund(tmp, { from: accounts[0] });
    //console.log(result);
    const balance = await tumbler.getAcc(accounts[0]);
    console.log(balance);
  });
});
