// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Utils {
    uint256 constant FIELD_ORDER =
        0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47;
    uint256 constant GROUP_ORDER =
        0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;
    uint256 constant AA = 0x0;
    uint256 constant BB = 0x3;

    struct G1Point {
        bytes32 x;
        bytes32 y;
    }

    function add(uint256 x, uint256 y) internal pure returns (uint256) {
        return addmod(x, y, GROUP_ORDER);
    }

    function mul(uint256 x, uint256 y) internal pure returns (uint256) {
        return mulmod(x, y, GROUP_ORDER);
    }

    function inv(uint256 x) internal view returns (uint256) {
        return exp(x, GROUP_ORDER - 2);
    }

    function mod(uint256 x) internal pure returns (uint256) {
        return x % GROUP_ORDER;
    }

    function sub(uint256 x, uint256 y) internal pure returns (uint256) {
        return x >= y ? x - y : GROUP_ORDER - y + x;
    }

    function neg(uint256 x) internal pure returns (uint256) {
        return GROUP_ORDER - x;
    }

    function exp(uint256 base, uint256 exponent)
        internal
        view
        returns (uint256 output)
    {
        uint256 order = GROUP_ORDER;
        assembly {
            let m := mload(0x40)
            mstore(m, 0x20)
            mstore(add(m, 0x20), 0x20)
            mstore(add(m, 0x40), 0x20)
            mstore(add(m, 0x60), base)
            mstore(add(m, 0x80), exponent)
            mstore(add(m, 0xa0), order)
            if iszero(staticcall(gas(), 0x05, m, 0xc0, m, 0x20)) {
                // staticcall or call?
                revert(0, 0)
            }
            output := mload(m)
        }
    }

    function fieldExp(uint256 base, uint256 exponent)
        internal
        view
        returns (uint256 output)
    {
        // warning: mod p, not q
        uint256 order = FIELD_ORDER;
        assembly {
            let m := mload(0x40)
            mstore(m, 0x20)
            mstore(add(m, 0x20), 0x20)
            mstore(add(m, 0x40), 0x20)
            mstore(add(m, 0x60), base)
            mstore(add(m, 0x80), exponent)
            mstore(add(m, 0xa0), order)
            if iszero(staticcall(gas(), 0x05, m, 0xc0, m, 0x20)) {
                // staticcall or call?
                revert(0, 0)
            }
            output := mload(m)
        }
    }

    function g() public pure returns (G1Point memory) {
        return
            G1Point(
                0x077da99d806abd13c9f15ece5398525119d11e11e9836b2ee7d23f6159ad87d4,
                0x01485efa927f2ad41bff567eec88f32fb0a0f706588b4e41a8d587d008b7f875
            );
    }

    function h() public pure returns (G1Point memory) {
        return
            G1Point(
                0x05dd80ae2d36802bbf1fabdcad13003835d8754db0126d2a3dfc07da0b42517c,
                0x2823e193977627175e515e35ce3a228a5f39b6f078d3b5bcbac0e6f1f40bba7e
            );
    }

    function f() public pure returns (G1Point memory) {
        return
            G1Point(
                0x2270a3f55fa19414d05f9403ce79df11ed35b82ad603881ad4caa5ffc44ec8ad,
                0x02584c75d9416dff4470cb1e49f8f7e0dbf693b023a7e3f75f26d1ebce502d23
            );
    }

    function add(G1Point memory p1, G1Point memory p2)
        internal
        view
        returns (G1Point memory r)
    {
        assembly {
            let m := mload(0x40)
            mstore(m, mload(p1))
            mstore(add(m, 0x20), mload(add(p1, 0x20)))
            mstore(add(m, 0x40), mload(p2))
            mstore(add(m, 0x60), mload(add(p2, 0x20)))
            if iszero(staticcall(gas(), 0x06, m, 0x80, r, 0x40)) {
                revert(0, 0)
            }
        }
    }

    function sub(G1Point memory p1, G1Point memory p2)
        internal
        view
        returns (G1Point memory r)
    {
        return add(p1, neg(p2));
    }

    function mul(G1Point memory p, uint256 s)
        internal
        view
        returns (G1Point memory r)
    {
        assembly {
            let m := mload(0x40)
            mstore(m, mload(p))
            mstore(add(m, 0x20), mload(add(p, 0x20)))
            mstore(add(m, 0x40), s)
            if iszero(staticcall(gas(), 0x07, m, 0x60, r, 0x40)) {
                revert(0, 0)
            }
        }
    }

    function neg(G1Point memory p) internal pure returns (G1Point memory) {
        return G1Point(p.x, bytes32(FIELD_ORDER - uint256(p.y)));
    }

    function eq(G1Point memory p1, G1Point memory p2)
        internal
        pure
        returns (bool)
    {
        return p1.x == p2.x && p1.y == p2.y;
    }

    // not a point on curve. but it can be homomorphicly added
    function zero() internal pure returns (G1Point memory) {
        return G1Point(0, 0);
    }
}
