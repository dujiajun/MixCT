// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EllipticCurve.sol";

library Utils {
    uint256 constant PP =
        0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f;
    uint256 constant NN =
        0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141;
    uint256 constant AA = 0x0;
    uint256 constant BB = 0x7;

    struct G1Point {
        bytes32 x;
        bytes32 y;
    }

    function neg(uint256 x) internal pure returns (uint256) {
        return PP - x;
    }

    function g() public pure returns (G1Point memory) {
        return
            G1Point(
                0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798,
                0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8
            );
    }

    function h() public pure returns (G1Point memory) {
        return
            G1Point(
                0xd67dedde7f8861e5a99c0e30e06594997e85da6604ceffd429c69bf9d1d5b4d7,
                0x77f0f57c3757fc327265bf588cf1ddef2ca35b1445e9374e44ca710301bd9b61
            );
    }

    function f() public pure returns (G1Point memory) {
        return
            G1Point(
                0xc4abbb41fb87d293ae90fd755c1e62506b7c80d2fe84efa36970383e17ca274a,
                0xd730074791dbacb3bc866d4600b62d1da3bd1aacc2da289f20424036f10c1c06
            );
    }

    function isInfinity(G1Point memory p) internal pure returns (bool) {
        return EllipticCurve.isOnCurve(uint256(p.x), uint256(p.y), AA, BB, PP);
    }

    function add(G1Point memory p1, G1Point memory p2)
        internal
        pure
        returns (G1Point memory r)
    {
        (uint256 x, uint256 y) = EllipticCurve.ecAdd(
            uint256(p1.x),
            uint256(p1.y),
            uint256(p2.x),
            uint256(p2.y),
            AA,
            PP
        );
        return G1Point(bytes32(x), bytes32(y));
    }

    function sub(G1Point memory p1, G1Point memory p2)
        internal
        pure
        returns (G1Point memory r)
    {
        (uint256 x, uint256 y) = EllipticCurve.ecSub(
            uint256(p1.x),
            uint256(p1.y),
            uint256(p2.x),
            uint256(p2.y),
            AA,
            PP
        );
        return G1Point(bytes32(x), bytes32(y));
    }

    function mul(G1Point memory p, uint256 s)
        internal
        pure
        returns (G1Point memory r)
    {
        (uint256 x, uint256 y) = EllipticCurve.ecMul(
            s,
            uint256(p.x),
            uint256(p.y),
            AA,
            PP
        );
        return G1Point(bytes32(x), bytes32(y));
    }

    function neg(G1Point memory p) internal pure returns (G1Point memory) {
        (uint256 x, uint256 y) = EllipticCurve.ecInv(
            uint256(p.x),
            uint256(p.y),
            PP
        );
        return G1Point(bytes32(x), bytes32(y));
    }

    function eq(G1Point memory p1, G1Point memory p2)
        internal
        pure
        returns (bool)
    {
        return p1.x == p2.x && p1.y == p2.y;
    }

    function zero() internal pure returns (G1Point memory) {
        return G1Point(0, 0);
    }
}
