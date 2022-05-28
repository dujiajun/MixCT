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
    ) internal view returns (Utils.G1Point memory) {
        if (v == 0) return h.mul(r);
        if (r == 0) return g.mul(v);
        return g.mul(v).add(h.mul(r));
    }

    function multiExp(Utils.G1Point[] memory hs, uint256[] memory exps)
        internal
        view
        returns (Utils.G1Point memory)
    {
        Utils.G1Point memory res = Utils.zero();
        for (uint256 index = 0; index < hs.length; index++) {
            Utils.G1Point memory tmp = hs[index].mul(exps[index]);
            res = res.add(tmp);
        }
        return res;
    }

    function commitBits(
        Utils.G1Point memory g,
        Utils.G1Point[] memory hs,
        uint256[] memory exps,
        uint256 r
    ) internal view returns (Utils.G1Point memory) {
        Utils.G1Point memory tmp1 = multiExp(hs, exps);
        Utils.G1Point memory tmp2 = g.mul(r);
        Utils.G1Point memory res = tmp1.add(tmp2);
        return res;
    }

    function generateChallenge(Utils.G1Point[] memory group_elements)
        internal
        pure
        returns (uint256)
    {
        bytes memory encoding = abi.encode(group_elements);

        return uint256(sha256(encoding));
    }

    function convertToNal(
        uint256 num,
        uint256 n,
        uint256 m
    ) internal pure returns (uint256[] memory) {
        uint256[] memory out = new uint256[](m);
        uint256 j = 0;
        while (num != 0) {
            uint256 rem = num % n;
            num = num / n;
            out[j] = rem;
            j++;
        }
        return out;
    }
}
