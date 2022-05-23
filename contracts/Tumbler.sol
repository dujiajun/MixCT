// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Utils.sol";
import "./Verifier.sol";

contract Tumbler {
    using Utils for Utils.G1Point;

    mapping(address => Utils.G1Point) acc;

    struct EscrowStatement {
        Utils.G1Point cesc;
        Utils.G1Point token;
    }

    EscrowStatement[] pool;

    constructor() {}

    function escrow(Utils.G1Point memory cesc, Utils.G1Point memory token)
        public
    {
        EscrowStatement memory statement;
        statement.cesc = cesc;
        statement.token = token;
        pool.push(statement);
        acc[msg.sender] = acc[msg.sender].sub(cesc);
    }

    function redeem(Utils.G1Point memory cred, Utils.G1Point memory proof)
        public
    {
        //Utils.G1Point[] memory clist = new Utils.G1Point[];
    }

    event Fund(Utils.G1Point);

    function fund(Utils.G1Point memory c_init) public returns (bool) {
        acc[msg.sender] = acc[msg.sender].add(c_init);
        emit Fund(acc[msg.sender]);
        return true;
    }

    function burn(uint256 value, uint256 randomness) public {
        Utils.G1Point memory c = Primitives.commit(
            Utils.g(),
            value,
            Utils.h(),
            randomness
        );
        if (acc[msg.sender].eq(c)) {
            acc[msg.sender] = Primitives.commit(Utils.g(), 0, Utils.h(), 0);
        }
    }

    function getAcc(address addr) public view returns (Utils.G1Point memory) {
        return acc[addr];
    }
}
