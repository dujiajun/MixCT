const { zero } = require("../src/params");
const Client = require("../src/client");
const { serialize } = require("../src/serialize");

const Tumbler = artifacts.require("Tumbler");

contract("Tumbler", async (accounts) => {
  let tumbler;
  let clients;
  let alice;

  before(async () => {
    tumbler = await Tumbler.deployed();
    clients = accounts.map((account) => new Client(web3, tumbler, account));
    alice = clients[0];
  });

  it("should print account", async () => {
    console.log(accounts);
  });

  it("should print empty balance", async () => {
    const balance = await alice.getBalance();
    console.log("zero", serialize(zero));
    assert.isTrue(balance.eq(zero));
  });

  it("should add balance", async () => {
    for (let index = 0; index < clients.length; index++) {
      await clients[index].fund(100);
    }
    const balance = await alice.getBalance();
    const local = alice.getLocalBalance();
    console.log("should add balance", serialize(balance), serialize(local));
    assert.isTrue(local.eq(balance));
  });

  const N = 4;

  it("should escrow", async () => {
    for (let index = 0; index < N; index++) {
      await clients[index].escrow(100);
    }

    const balance = await alice.getBalance();
    const local = alice.getLocalBalance();
    assert.isTrue(balance.eq(local));
  });

  it("should redeem", async () => {
    const result = await alice.redeem(0);
    assert.isTrue(result);
  });

  it("should remove balance", async () => {
    await alice.burn();
    const balance = await alice.getBalance();
    assert.isTrue(balance.eq(zero));
  });
});
