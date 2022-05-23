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

    function testAdd() public{
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
}
