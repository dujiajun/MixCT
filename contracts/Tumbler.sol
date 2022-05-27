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

    EscrowStatement[] esc_pool;

    function queryPool() public view returns (EscrowStatement[] memory) {
        return esc_pool;
    }

    struct RedeemStatement {
        Utils.G1Point cred;
        //Verifier.SigmaProof proof;
    }

    RedeemStatement[] red_pool;

    function escrow(Utils.G1Point memory cesc, Utils.G1Point memory token)
        public
    {
        EscrowStatement memory statement;
        statement.cesc = cesc;
        statement.token = token;
        esc_pool.push(statement);
        acc[msg.sender] = acc[msg.sender].sub(cesc);
    }

    event Redeem(bool);
    event RedeemPoint(Utils.G1Point);
    event RedeemProgress(uint256);
    event RedeemPoints(Utils.G1Point[]);
    event RedeemProof(Verifier.SigmaProof);
    event RedeemAux(Verifier.SigmaAuxiliaries);

    function redeem(
        Utils.G1Point memory cred,
        Verifier.SigmaProof memory proof,
        Verifier.SigmaAuxiliaries memory aux
    ) public returns (bool) {
        emit RedeemProof(proof);
        emit RedeemAux(aux);
        emit RedeemPoint(cred);
        emit RedeemProgress(esc_pool.length);
        Utils.G1Point[] memory clist = new Utils.G1Point[](esc_pool.length);
        for (uint256 i = 0; i < esc_pool.length; i++) {
            clist[i] = cred.sub(esc_pool[i].cesc.add(esc_pool[i].token));
        }
        emit RedeemPoints(clist);

        emit RedeemProgress(1);
        if (Verifier.verifySigmaProof(clist, proof, aux)) {
            RedeemStatement memory statement;
            statement.cred = cred;
            //statement.proof = proof;
            red_pool.push(statement);
            acc[msg.sender] = acc[msg.sender].add(cred);
            emit Redeem(true);
            return true;
        }
        emit Redeem(false);
        return false;
    }

    event Fund(address);

    function fund(Utils.G1Point memory c_init) public returns (bool) {
        acc[msg.sender] = acc[msg.sender].add(c_init);
        emit Fund(msg.sender);
        return true;
    }

    event Burn(bool);

    function burn(uint256 value, uint256 randomness) public returns (bool) {
        Utils.G1Point memory c = Primitives.commit(
            Utils.g(),
            value,
            Utils.h(),
            randomness
        );
        if (acc[msg.sender].eq(c)) {
            emit Burn(true);
            acc[msg.sender] = Utils.zero();
            return true;
        } else {
            emit Burn(false);
            return false;
        }
    }

    function getAcc(address addr) public view returns (Utils.G1Point memory) {
        return acc[addr];
    }
}
