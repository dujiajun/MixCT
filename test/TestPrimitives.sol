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
            0x802966a5cadde5ad952bcfdf1769615ce01997a3514e9e29ac6d50c63ef9c429,
            0xba74f961f54a3d3f49561882742b48746a94f99c2b64fff2ee607a703e6d7ec2
        );

        Utils.G1Point memory t2 = Utils.G1Point(
            0x3d80e85b423514db3a3559db8b317509b1c30931379b45d28916dd089a437bb1,
            0x5a4be1291d39e226e00cf00b7849e793517f710f6e1b16c10eb8c6c7619840bb
        );

        Utils.G1Point memory t3 = Utils.G1Point(
            0xc39de498855d3c87da7ecec61b996bd230a0d1b8dfe949fdd594b7468a8e37f3,
            0xf4a86a30d38c12a04866a23237183946cc533ddc0f20244acee4e16285c24fdb
        );

        Utils.G1Point memory t4 = t1.add(t2);
        Assert.isTrue(t3.eq(t4), "add is ok");
    }

    function testCommitment() public {
        Utils.G1Point memory g = Utils.G1Point(
            0x14601b8cdf761d4ed94554865ef0ef5c451e275f3dfc0a667fea04fa5a833bed,
            0x4b23a3c385114c40cb4fbf02d1a52f731b4edf61c247372d038470eea90edffb
        );

        Utils.G1Point memory h = Utils.G1Point(
            0x6efee4d1ba231acfee2391dc5ded838cee89235af14b8a4f494e4734cb1323f5,
            0x9f182dfa64bd4e92d1e00fdf100c28a3361860fda763f03d5cffb652097f006e
        );

        uint256 x = 10;
        uint256 r = 20;

        Utils.G1Point memory expected = Utils.G1Point(
            0x88beb71b12893f92ace15836af060835e059333f18483915c533ca09aa455bcc,
            0xa482c8f3768f85b95d4e147663574598649fbdf5cedcbc38b034e5ad12bd06ca
        );

        Utils.G1Point memory c = Primitives.commit(g, x, h, r);

        Assert.isTrue(c.eq(expected), "commitment is ok");
    }

    function testCommitZero() public {
        Utils.G1Point memory g = Utils.g();
        Utils.G1Point memory h = Utils.h();

        uint256 x = 0;
        uint256 r = 10;

        Utils.G1Point memory expected = Utils.G1Point(
            0x8100a9faa9f51e69a58ff82fa73378f1753b828a9cbd2a96fc05d844b1acf06e,
            0x87fc78dcc5ba59dc92188887fa0ce3b8a13df5bfdd1e823bd393560e4ad18f4a
        );
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

    function testMultiExp() public {
        Utils.G1Point[] memory gs = new Utils.G1Point[](2);

        gs[0] = Utils.G1Point(
            0x14601b8cdf761d4ed94554865ef0ef5c451e275f3dfc0a667fea04fa5a833bed,
            0x4b23a3c385114c40cb4fbf02d1a52f731b4edf61c247372d038470eea90edffb
        );

        gs[1] = Utils.G1Point(
            0x6efee4d1ba231acfee2391dc5ded838cee89235af14b8a4f494e4734cb1323f5,
            0x9f182dfa64bd4e92d1e00fdf100c28a3361860fda763f03d5cffb652097f006e
        );

        uint256[] memory x = new uint256[](2);
        x[0] = 10;
        x[1] = 20;

        Utils.G1Point memory expected = Utils.G1Point(
            0x88beb71b12893f92ace15836af060835e059333f18483915c533ca09aa455bcc,
            0xa482c8f3768f85b95d4e147663574598649fbdf5cedcbc38b034e5ad12bd06ca
        );

        Utils.G1Point memory c = Primitives.multiExp(gs, x);

        Assert.isTrue(c.eq(expected), "multiExp is ok");
    }

    function testCommitBits() public {
        Utils.G1Point memory g = Utils.G1Point(
            0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798,
            0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8
        );

        Utils.G1Point[] memory hs = new Utils.G1Point[](2);
        hs[0] = Utils.G1Point(
            0xc4abbb41fb87d293ae90fd755c1e62506b7c80d2fe84efa36970383e17ca274a,
            0xd730074791dbacb3bc866d4600b62d1da3bd1aacc2da289f20424036f10c1c06
        );
        hs[1] = Utils.G1Point(
            0xd67dedde7f8861e5a99c0e30e06594997e85da6604ceffd429c69bf9d1d5b4d7,
            0x77f0f57c3757fc327265bf588cf1ddef2ca35b1445e9374e44ca710301bd9b61
        );

        uint256[] memory exps = new uint256[](2);
        exps[0] = 10;
        exps[1] = 20;
        uint256 r = 20;

        Utils.G1Point memory expected = Utils.G1Point(
            0xce3ee0219f20d53c1b45d8d3e8fb638af4b180c4a8b4467097ccb489a2d0d603,
            0xd54618af30dfe5a24f516a6b57809926c618fb0cb6fe6431176b732e4c1e1c0c
        );

        Utils.G1Point memory c = Primitives.commitBits(g, hs, exps, r);

        Assert.isTrue(c.eq(expected), "commitBits is ok");
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
