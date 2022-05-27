const BN = require("bn.js");
const { zero, p, q, curve } = require("./params");
const {
  commit,
  commitBits,
  convertToNal,
  generateChallenge,
  multiExponents,
} = require("./primitives");
const { serialize, toBytes } = require("./serialize");

class R1Verifier {
  constructor(g, h, B, n, m) {
    this.g = g;
    this.h = h;
    this.B_commit = B;
    this.n = n;
    this.m = m;
  }

  verify(proof, skip_final_response = false) {
    const f = new Array();
    return this._verify(proof, f, skip_final_response);
  }

  _verify(proof, f_out, skip_final_response) {
    if (
      proof.A.isInfinity() ||
      proof.C.isInfinity() ||
      proof.D.isInfinity() ||
      this.B_commit.isInfinity()
    )
      return false;
    for (let i = 0; i < proof.f.length; i++) {
      if (proof.f[i].isZero()) return false;
    }
    if (proof.ZA.isZero() || proof.ZC.isZero()) return false;
    if (!skip_final_response) {
      const group_elements = [proof.A, this.B_commit, proof.C, proof.D];
      const x = generateChallenge(group_elements);
      return this.verify_final_response(proof, x, f_out);
    }
    return true;
  }

  verify_final_response(proof, challenge_x, f_out) {
    const f = proof.f;
    for (let j = 0; j < f.length; ++j) {
      if (f[j].eq(challenge_x)) return false;
    }

    f_out.splice(0);
    for (let j = 0; j < this.m; j++) {
      f_out.push(new BN(0));
      let tmp = new BN(0);
      const k = this.n - 1;
      for (let i = 0; i < k; i++) {
        tmp = tmp.add(f[j * k + i]);
        f_out.push(f[j * k + i]);
        console.log(tmp.toString(10), f_out.toString(10));
      }
      f_out[j * this.n] = challenge_x.sub(tmp).add(curve.n).mod(curve.n);
    }

    const one = commitBits(this.g, this.h, f_out, proof.ZA);

    if (!one.eq(this.B_commit.mul(challenge_x).add(proof.A))) {
      return false;
    }
    /*console.log(
      serialize(one),
      serialize(this.B_commit),
      serialize(this.B_commit.mul(challenge_x)),
      challenge_x.toString(10),
      serialize(proof.A)
    );*/
    const f_outprime = new Array(f_out.length);
    for (let i = 0; i < f_out.length; i++) {
      const exp = challenge_x.sub(f_out[i]).add(curve.n).mod(curve.n);
      f_outprime[i] = f_out[i].mul(exp).mod(curve.n);
    }
    console.log(
      "before R1 verify two",
      f_outprime.map((item) => item.toString(10))
    );
    const two = commitBits(this.g, this.h, f_outprime, proof.ZC);
    if (!two.eq(proof.C.mul(challenge_x).add(proof.D))) {
      return false;
    }

    return true;
  }
}

class SigmaVerifier {
  constructor(g, h_gens, n, m) {
    this.g = g;
    this.h = h_gens;
    this.n = n;
    this.m = m;
  }

  verify(commits, proof) {
    const r1verifier = new R1Verifier(this.g, this.h, proof.B, this.n, this.m);
    const r1proof = proof.r1Proof;
    if (!r1verifier.verify(r1proof, true)) return false;

    if (proof.B.isInfinity()) return false;

    const Gk = proof.Gk;
    for (let i = 0; i < Gk.length; i++) {
      if (Gk[i].isInfinity()) return false;
    }

    const group_elements = new Array(r1proof.A, proof.B, r1proof.C, r1proof.D);
    group_elements.splice(group_elements.length, 0, ...Gk);
    console.log(
      "group_elements",
      group_elements.map((item) => serialize(item))
    );
    const challenge_x = generateChallenge(group_elements);
    console.log("challenge_x", toBytes(challenge_x));
    const f = new Array();
    if (!r1verifier.verify_final_response(r1proof, challenge_x, f))
      return false;

    if (proof.z.isZero()) return false;
    if (commits.length == 0) return false;

    const N = commits.length;
    const f_i_ = new Array(N);
    for (let i = 0; i < N; i++) {
      const I = convertToNal(i, this.n, this.m);
      let f_i = new BN(1);
      for (let j = 0; j < this.m; j++) {
        f_i = f_i.mul(f[j * this.n + I[j]]);
      }
      f_i_[i] = f_i;
    }

    const t1 = multiExponents(commits, f_i_);
    let t2 = zero;
    let x_k = new BN(1);
    for (let k = 0; k < this.m; k++) {
      t2 = t2.add(Gk[k].mul(x_k.neg()));
      x_k = x_k.mul(challenge_x);
    }

    const left = t1.add(t2);
    if (!left.eq(commit(this.g, new BN(0), this.h[0], proof.z))) {
      return false;
    }
    return true;
  }
}

module.exports = { R1Verifier, SigmaVerifier };
