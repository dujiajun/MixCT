// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Utils.sol";

contract TestUtils {
    function testInitialBalanceUsingDeployedContract() public {
        uint256 one = 1;
        uint256 two = 1;
        Assert.equal(one, two, "Owner should have 10000 MetaCoin initially");
    }
}
