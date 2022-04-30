// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Utils.sol";
import "./Verifier.sol";

contract Tumbler {
    mapping(bytes32 => Utils.G1Point) acc;

    struct EscrowStatement {
        Utils.G1Point c;
        Utils.G1Point f;
    }

    EscrowStatement[] pool;

    function escrow(Utils.G1Point memory c, Utils.G1Point memory secret)
        public
    {}

    function redeem(Utils.G1Point memory c_masked, Utils.G1Point memory proof)
        public
    {}
}
