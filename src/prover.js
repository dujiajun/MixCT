const {
  commit,
  commitBits,
  convertToNal,
  convertToSigma,
  generateChallenge,
  multiExponents,
  newFactor,
  randomExponent,
} = require("./primitives");
const BN = require("bn.js");
const { SigmaProof } = require("./types");

class R1Prover {
  constructor(g, h, b, r, n, m) {
    this.g = g;
    this.h = h;
    this.b = b;
    this.r = r;
    this.n = n;
    this.m = m;
    this.B_commit = commitBits(g, h, b, r);
    this.rA = new BN(0);
    this.rC = new BN(0);
    this.rD = new BN(0);
  }

  prove(proof_out, skip_final_response = false) {
    const a_out = new Array(this.n * this.m);
    a_out.fill(new BN(0));
    for (let j = 0; j < this.m; j++) {
      for (let i = 1; i < this.n; i++) {
        a_out[j * this.n + i] = randomExponent();
        a_out[j * this.n] = a_out[j * this.n].sub(a_out[j * this.n + i]);
      }
    }
    //console.log("after computing a_out");

    this.rA = randomExponent();
    const A = commitBits(this.g, this.h, a_out, this.rA);
    proof_out.A = A;
    //console.log("after computing A");
    const c = new Array(this.n * this.m);
    for (let i = 0; i < c.length; i++) {
      c[i] = a_out[i].mul(new BN(1).sub(this.b[i].mul(new BN(2))));
    }

    this.rC = randomExponent();
    const C = commitBits(this.g, this.h, c, this.rC);
    proof_out.C = C;
    //console.log("after computing C");
    const d = new Array(this.n * this.m);
    for (let i = 0; i < d.length; i++) {
      d[i] = a_out[i].sqr().neg();
    }

    this.rD = randomExponent();
    const D = commitBits(this.g, this.h, d, this.rD);
    proof_out.D = D;
    //console.log("after computing D");
    if (!skip_final_response) {
      const group_elements = new Array(A, this.B_commit, C, D);
      const x = generateChallenge(group_elements);
      this.generateFinalResponse(a_out, x, proof_out);
    }
    return a_out;
  }

  generateFinalResponse(a, challenge_x, proof_out) {
    proof_out.f.splice(0);
    for (let j = 0; j < this.m; j++) {
      for (let i = 1; i < this.n; i++) {
        proof_out.f.push(
          this.b[j * this.n + i].mul(challenge_x).add(a[j * this.n + i])
        );
      }
    }
    proof_out.ZA = this.r.mul(challenge_x).add(this.rA);
    proof_out.ZC = this.rC.mul(challenge_x).add(this.rD);
    //console.log("after generateFinalResponse");
  }
}

class SigmaProver {
  constructor(g, h, n, m) {
    this.g = g;
    this.h = h;
    this.n = n;
    this.m = m;
  }

  prove(commits, l, r) {
    const proof_out = new SigmaProof();
    const setSize = commits.length;

    const rB = randomExponent();
    const sigma = convertToSigma(l, this.n, this.m);

    const Pk = new Array(this.m);
    for (let k = 0; k < Pk.length; k++) {
      Pk[k] = randomExponent();
    }

    const r1prover = new R1Prover(this.g, this.h, sigma, rB, this.n, this.m);
    proof_out.B = r1prover.B_commit;
    const a = r1prover.prove(proof_out.r1Proof, true);
    const N = setSize;
    const P_i_k = new Array(N);
    for (let i = 0; i < N; i++) P_i_k[i] = new Array();
    for (let i = 0; i < N; i++) {
      const coefficients = P_i_k[i];
      const I = convertToNal(i, this.n, this.m);
      coefficients.push(a[I[0]]);
      coefficients.push(sigma[I[0]]);
      for (let j = 1; j < this.m; j++) {
        newFactor(sigma[j * this.n + I[j]], a[j * this.n + I[j]], coefficients);
      }
    }
    const Gk = new Array(this.m);
    for (let k = 0; k < this.m; k++) {
      const P_i = new Array(N);
      for (let i = 0; i < N; i++) {
        P_i[i] = P_i_k[i][k];
      }
      const c_k = multiExponents(commits, P_i).add(
        commit(this.g, new BN(0), this.h[0], Pk[k])
      );
      Gk[k] = c_k;
    }
    proof_out.Gk = Gk;
    const group_elements = [
      proof_out.r1Proof.A,
      proof_out.B,
      proof_out.r1Proof.C,
      proof_out.r1Proof.D,
    ];
    group_elements.splice(group_elements.length, 0, ...Gk);

    const x = generateChallenge(group_elements);
    r1prover.generateFinalResponse(a, x, proof_out.r1Proof);
    let z = r.mul(x.pow(new BN(this.m)));
    let sum = new BN(0),
      x_k = new BN(1);
    for (let k = 0; k < this.m; k++) {
      sum = sum.add(Pk[k].mul(x_k));
      x_k = x_k.mul(x);
    }
    z = z.sub(sum);
    proof_out.z = z;
    return proof_out;
  }
}

module.exports = { R1Prover, SigmaProver };
