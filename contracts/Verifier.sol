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
        uint256 n;
        uint256 m;
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
    ) internal pure returns (bool) {
        if (!skip_final) {
            Utils.G1Point[] memory group_elements;
            group_elements[0] = proof.A;
            group_elements[1] = aux.B_commit;
            group_elements[2] = proof.C;
            group_elements[3] = proof.D;
            uint256 challenge_x = Primitives.generateChallenge(group_elements);
            uint256[] memory f_out;
            return verifyR1Final(proof, aux, challenge_x, f_out);
        }
        return true;
    }

    function verifyR1Final(
        R1Proof memory proof,
        R1Auxiliaries memory aux,
        uint256 challenge_x,
        uint256[] memory f_out
    ) internal pure returns (bool) {
        for (uint256 j = 0; j < proof.f.length; j++) {
            if (proof.f[j] == challenge_x) return false;
        }

        for (uint256 j = 0; j < aux.m; j++) {
            f_out[f_out.length] = 0;
            uint256 tmp = 0;
            uint256 k = aux.n - 1;
            for (uint256 i = 0; i < k; i++) {
                tmp = tmp + proof.f[j * k + i];
                f_out[f_out.length] = proof.f[j * k + i];
            }
            f_out[j * aux.n] = challenge_x - tmp;
        }

        Utils.G1Point memory one = Primitives.commitBits(
            aux.g,
            aux.h,
            f_out,
            proof.zA
        );
        if (!one.eq((aux.B_commit.mul(challenge_x).add(proof.A)))) return false;

        uint256[] memory f_outprime;
        for (uint256 i = 0; i < f_out.length; i++) {
            f_outprime[f_outprime.length] = f_out[i] * (challenge_x - f_out[i]);
        }
        Utils.G1Point memory two = Primitives.commitBits(
            aux.g,
            aux.h,
            f_outprime,
            proof.zC
        );
        if (!two.eq(proof.C.mul(challenge_x).add(proof.D))) return false;
        return true;
    }

    function verifySigmaProof(
        Utils.G1Point[] memory commits,
        SigmaProof memory proof,
        SigmaAuxiliaries memory aux
    ) internal pure returns (bool) {
        uint256 challenge_x;
        uint256[] memory f;
        {
            R1Auxiliaries memory r1aux;
            r1aux.n = aux.n;
            r1aux.m = aux.m;
            r1aux.B_commit = proof.B;
            r1aux.g = aux.g;
            r1aux.h = aux.h;

            if (!verifyR1Proof(proof.r1Proof, r1aux, true)) return false;

            Utils.G1Point[] memory group_elements;
            group_elements[0] = proof.r1Proof.A;
            group_elements[1] = proof.B;
            group_elements[2] = proof.r1Proof.C;
            group_elements[3] = proof.r1Proof.D;

            for (uint256 i = 0; i < proof.Gk.length; i++) {
                group_elements[group_elements.length] = proof.Gk[i];
            }

            challenge_x = Primitives.generateChallenge(group_elements);

            if (!verifyR1Final(proof.r1Proof, r1aux, challenge_x, f))
                return false;
        }
        uint256 N = commits.length;
        uint256[] memory f_i_;
        {
            for (uint256 i = 0; i < N; i++) {
                uint256[] memory I = Primitives.convertToNal(i, aux.n, aux.m);
                uint256 f_i = 1;
                for (uint256 j = 0; j < aux.m; j++) {
                    f_i = f_i * f[j * aux.n + I[j]];
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
                x_k = x_k * challenge_x;
            }
            left = t1.add(t2);
        }
        if (!left.eq(Primitives.commit(aux.g, 0, aux.h[0], proof.z)))
            return false;
        return true;
    }
}
