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

    event RedeemResult(bool);

    function redeem(
        Utils.G1Point memory cred,
        Verifier.SigmaProof memory proof_format,
        Verifier.SigmaAuxiliaries memory aux_format,
        Verifier.SigmaProof memory proof_redeem,
        Verifier.SigmaAuxiliaries memory aux_redeem
    ) public {
        Utils.G1Point[] memory clist = new Utils.G1Point[](esc_pool.length);

        for (uint256 i = 0; i < esc_pool.length; i++) {
            clist[i] = cred.sub(esc_pool[i].cesc);
        }
        if (!Verifier.verifySigmaProof(clist, proof_format, aux_format)) {
            emit RedeemResult(false);
            return;
        }

        for (uint256 i = 0; i < esc_pool.length; i++) {
            clist[i] = clist[i].sub(esc_pool[i].token);
        }

        if (!Verifier.verifySigmaProof(clist, proof_redeem, aux_redeem)) {
            emit RedeemResult(false);
            return;
        }
        RedeemStatement memory statement;
        statement.cred = cred;
        red_pool.push(statement);
        acc[msg.sender] = acc[msg.sender].add(cred);
        emit RedeemResult(true);
    }

    function fund(Utils.G1Point memory c_init) public {
        acc[msg.sender] = acc[msg.sender].add(c_init);
    }

    event BurnResult(bool);

    function burn(uint256 value, uint256 randomness) public {
        Utils.G1Point memory c = Primitives.commit(
            Utils.g(),
            value,
            Utils.h(),
            randomness
        );
        if (acc[msg.sender].eq(c)) {
            acc[msg.sender] = acc[msg.sender].sub(c);
            emit BurnResult(true);
        } else {
            emit BurnResult(false);
        }
    }

    function getAcc(address addr) public view returns (Utils.G1Point memory) {
        return acc[addr];
    }
}
