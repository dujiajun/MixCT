const Tumbler = artifacts.require("Tumbler");
const Utils = artifacts.require("Utils");

module.exports = function (deployer) {
  deployer.deploy(Utils);
  deployer.link(Utils, Tumbler);
  deployer.deploy(Tumbler);
};
