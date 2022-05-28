// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Utils.sol";
import "../contracts/Primitives.sol";

contract TestPrimitives {
    using Utils for Utils.G1Point;

    function testBasic() public {
        Assert.isTrue(1 + 1 == 2, "basic test");
    }

    function testAdd() public {
        Utils.G1Point memory t1 = Utils.G1Point(
            0x26188fd54859b41eca9bec68596695b7c5c90e4db90e6eff65d6c79b6a6c978c,
            0x0e3205cdbd68dc3da0283e90335a395005821386bed58ae5857b2073c11d455c
        );

        Utils.G1Point memory t2 = Utils.G1Point(
            0x27826851e738145d1f1068689322aafe13bc9702a94ffb4c021ff02d07ff1d44,
            0x119f5c1f7a736b80c0bf387cd7b83ded0fae4aabb3fae0425b61f9fd7e1e6881
        );

        Utils.G1Point memory t3 = Utils.G1Point(
            0x0182eef748fc38e5068e82ce5f38681130dff450ef89af861b240501f9c775eb,
            0x18c37c74fcc74a13b95e6b35fa2bfc311c67a69b19aaf57546fa678fa8e2d225
        );

        Utils.G1Point memory t4 = t1.add(t2);
        Assert.isTrue(t3.eq(t4), "add is ok");
    }

    function testCommitment() public {
        Utils.G1Point memory expected = Utils.G1Point(
            0x1ed0ea4054f9193f235499d1412cc49db8263bba2e4929bec1a1b5cbbac30235,
            0x0ad9391706de57fc3f8da7bd0186d828a044ae9701676256dcc881c341830b40
        );

        Utils.G1Point memory c = Primitives.commit(
            Utils.g(),
            10,
            Utils.h(),
            20
        );

        Assert.isTrue(c.eq(expected), "commitment is ok");
    }

    function testCommitZero() public {
        Utils.G1Point memory g = Utils.g();
        Utils.G1Point memory h = Utils.h();

        uint256 x = 0;
        uint256 r = 10;

        Utils.G1Point memory expected = h.mul(10);
        Utils.G1Point memory c = Primitives.commit(g, x, h, r);

        Assert.isTrue(c.eq(expected), "commit zero is ok");
    }

    function testSubToZero() public {
        Utils.G1Point memory g = Utils.g();
        Utils.G1Point memory h = Utils.h();

        Utils.G1Point memory c = Primitives.commit(g, 1, h, 1);
        Utils.G1Point memory expected = Utils.G1Point(0, 0);
        Assert.isTrue(expected.eq(c.sub(c)), "commit sub to zero is ok");
    }

    function testHomomorphic() public {
        Utils.G1Point memory g = Utils.g();
        Utils.G1Point memory h = Utils.h();

        uint256 x1 = 1;
        uint256 r1 = 1;

        uint256 x2 = 2;
        uint256 r2 = 2;

        Utils.G1Point memory c1 = Primitives.commit(g, x1, h, r1);
        Utils.G1Point memory c2 = Primitives.commit(g, x2, h, r2);
        Utils.G1Point memory c3 = Primitives.commit(g, x1 + x2, h, r1 + r2);
        Utils.G1Point memory c4 = c1.add(c2);

        Assert.isTrue(c4.eq(c3), "Homomorphic is ok");
    }

    function testConvertToNal() public {
        uint256 n = 4;
        uint256 m = 2;
        for (uint256 index = 0; index < n**m; index++) {
            uint256[] memory I = Primitives.convertToNal(index, n, m);
            Assert.equal(I[0] + I[1] * n, index, "convertToNal OK");
        }
    }
}
