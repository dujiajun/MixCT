// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Utils.sol";
import "./Primitives.sol";

library Verifier {
    using Utils for Utils.G1Point;
    using Utils for uint256;

    struct R1Proof {
        Utils.G1Point A;
        Utils.G1Point C;
        Utils.G1Point D;
        uint256[] f;
        uint256 zA;
        uint256 zC;
    }

    struct R1Auxiliaries {
        uint256 n;
        uint256 m;
        Utils.G1Point B_commit;
        Utils.G1Point g;
        Utils.G1Point[] h;
    }

    struct SigmaProof {
        Utils.G1Point B;
        R1Proof r1Proof;
        Utils.G1Point[] Gk;
        uint256 z;
    }

    struct SigmaAuxiliaries {
        uint256 n;
        uint256 m;
        Utils.G1Point g;
        Utils.G1Point[] h;
    }

    function verifyR1Proof(
        R1Proof memory proof,
        R1Auxiliaries memory aux,
        bool skip_final
    ) internal view returns (bool) {
        if (!skip_final) {
            Utils.G1Point[] memory group_elements = new Utils.G1Point[](4);
            group_elements[0] = proof.A;
            group_elements[1] = aux.B_commit;
            group_elements[2] = proof.C;
            group_elements[3] = proof.D;
            uint256 challenge_x = Primitives.generateChallenge(group_elements);
            uint256[] memory f_out = new uint256[](aux.n * aux.m);
            return verifyR1Final(proof, aux, challenge_x, f_out);
        }
        return true;
    }

    function verifyR1Final(
        R1Proof memory proof,
        R1Auxiliaries memory aux,
        uint256 challenge_x,
        uint256[] memory f_out
    ) internal view returns (bool) {
        for (uint256 j = 0; j < proof.f.length; j++) {
            if (proof.f[j] == challenge_x) return false;
        }
        uint256 cnt = 0;
        for (uint256 j = 0; j < aux.m; j++) {
            f_out[cnt] = 0;
            cnt++;
            uint256 tmp = 0;
            uint256 k = aux.n - 1;
            for (uint256 i = 0; i < k; i++) {
                tmp = tmp.add(proof.f[j * k + i]);
                f_out[cnt] = proof.f[j * k + i];
                cnt++;
            }
            f_out[j * aux.n] = challenge_x.sub(tmp);
        }

        Utils.G1Point memory one = Primitives.commitBits(
            aux.g,
            aux.h,
            f_out,
            proof.zA
        );

        Utils.G1Point memory cmp = aux.B_commit.mul(challenge_x).add(proof.A);
        if (!one.eq(cmp)) return false;

        uint256[] memory f_outprime = new uint256[](f_out.length);
        for (uint256 i = 0; i < f_out.length; i++) {
            f_outprime[i] = f_out[i].mul(challenge_x.sub(f_out[i]));
        }
        Utils.G1Point memory two = Primitives.commitBits(
            aux.g,
            aux.h,
            f_outprime,
            proof.zC
        );

        cmp = proof.C.mul(challenge_x).add(proof.D);
        if (!two.eq(cmp)) return false;

        return true;
    }

    function verifySigmaProof(
        Utils.G1Point[] memory commits,
        SigmaProof memory proof,
        SigmaAuxiliaries memory aux
    ) internal view returns (bool) {
        uint256 challenge_x;
        uint256 N = commits.length;
        uint256[] memory f = new uint256[](N);
        {
            R1Auxiliaries memory r1aux;
            r1aux.n = aux.n;
            r1aux.m = aux.m;
            r1aux.B_commit = proof.B;
            r1aux.g = aux.g;
            r1aux.h = aux.h;
            if (!verifyR1Proof(proof.r1Proof, r1aux, true)) return false;

            Utils.G1Point[] memory group_elements = new Utils.G1Point[](
                proof.Gk.length + 4
            );
            group_elements[0] = proof.r1Proof.A;
            group_elements[1] = proof.B;
            group_elements[2] = proof.r1Proof.C;
            group_elements[3] = proof.r1Proof.D;
            for (uint256 i = 0; i < proof.Gk.length; i++) {
                group_elements[i + 4] = proof.Gk[i];
            }
            challenge_x = Primitives.generateChallenge(group_elements);
            if (!verifyR1Final(proof.r1Proof, r1aux, challenge_x, f))
                return false;
        }
        uint256[] memory f_i_ = new uint256[](N);
        {
            for (uint256 i = 0; i < N; i++) {
                uint256[] memory I = Primitives.convertToNal(i, aux.n, aux.m);
                uint256 f_i = 1;
                for (uint256 j = 0; j < aux.m; j++) {
                    f_i = f_i.mul(f[j * aux.n + I[j]]);
                }
                f_i_[i] = f_i;
            }
        }

        Utils.G1Point memory left;
        {
            Utils.G1Point memory t1 = Primitives.multiExp(commits, f_i_);
            Utils.G1Point memory t2 = Utils.zero();
            uint256 x_k = 1;
            for (uint256 k = 0; k < aux.m; k++) {
                t2 = t2.add(proof.Gk[k].mul(x_k.neg()));
                x_k = x_k.mul(challenge_x);
            }
            left = t1.add(t2);
        }

        Utils.G1Point memory cmp = Primitives.commit(
            aux.g,
            0,
            aux.h[0],
            proof.z
        );
        if (!left.eq(cmp)) return false;
        return true;
    }
}
