// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Utils.sol";


library Primitives {

    using Utils for Utils.G1Point;
    using Utils for uint256;

    function commit(
        Utils.G1Point memory g,
        uint256 v,
        Utils.G1Point memory h,
        uint256 r
    ) internal pure returns (Utils.G1Point memory) {
        return g.mul(v).add(h.mul(r));
    }

    function multiExp(Utils.G1Point[] memory hs, uint256[] memory exps)
        internal
        pure
        returns (Utils.G1Point memory)
    {
        Utils.G1Point memory res = Utils.zero();
        for (uint256 index = 0; index < hs.length; index++) {
            res = res.add(hs[index].mul(exps[index]));
        }
        return res;
    }

    function commitBits(
        Utils.G1Point memory g,
        Utils.G1Point[] memory hs,
        uint256[] memory exps,
        uint256 r
    ) internal pure returns (Utils.G1Point memory) {
        return g.mul(r).add(multiExp(hs, exps));
    }

    function generateChallenge(Utils.G1Point[] memory group_elements)
        internal
        pure
        returns (uint256)
    {
        return uint256(sha256(abi.encode(group_elements)));
    }

    function convertToNal(
        uint256 num,
        uint256 n,
        uint256 m
    ) internal pure returns (uint256[] memory) {
        uint256[] memory out;
        uint256 j = 0;
        while (num != 0) {
            uint256 rem = num % n;
            num = num / n;
            out[j] = rem;
            j++;
        }
        //if (out.length > m) out.length = m;
        if (out.length < m) {
            for (uint256 index = out.length; index < m; index++) {
                out[index] = 0;
            }
        }
        return out;
    }
}
