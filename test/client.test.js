const { zero } = require("../src/params");
const Client = require("../src/client");
const Tumbler = artifacts.require("Tumbler");

contract("Tumbler", async (accounts) => {
  let clients;
  let alice;

  it("should deployed", async () => {
    const tumbler = await Tumbler.deployed();
    clients = accounts.map((account) => new Client(web3, tumbler, account));
    alice = clients[0];
  });

  it("should print account", async () => {
    console.log(accounts);
    const gasPrice = await web3.eth.getGasPrice();
    console.log("gasPrice: ", gasPrice);
    var block = await web3.eth.getBlock("latest");
    console.log("gasLimit: ", block.gasLimit);
  });

  it("should print empty balance", async () => {
    const balance = await alice.getBalance();
    assert.isTrue(balance.eq(zero));
  });

  it("should add balance", async () => {
    for (let index = 0; index < clients.length; index++) {
      await clients[index].fund(100);
    }
    const balance = await alice.getBalance();
    const local = alice.getLocalBalance();
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
