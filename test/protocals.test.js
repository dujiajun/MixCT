const {
  commit,
  randomExponent,
  randomGroupElement,
} = require("../src/primitives");
const { R1Prover, SigmaProver } = require("../src/prover");
const BN = require("bn.js");
const { R1Verifier, SigmaVerifier } = require("../src/verifier");
const { R1Proof } = require("../src/types");

function itR1(g, h, b, n, m) {
  const r = randomExponent();
  const prover = new R1Prover(g, h, b, r, n, m);
  const proof = new R1Proof;

  prover.prove(proof);
  const r1verifier = new R1Verifier(g, h, prover.B_commit, n, m);

  return r1verifier.verify(proof);
}

it("it R1 relation", () => {
  const n = 4;
  const m = 2;
  const g = randomGroupElement();
  const h_ = new Array();
  const b = new Array();
  let h;
  for (let i = 0; i < m; i++) {
    h = randomGroupElement();
    h_.push(h);
    b.push(new BN(1));
    for (let j = 1; j < n; j++) {
      h = randomGroupElement();
      h_.push(h);
      b.push(new BN(0));
    }
  }
  assert.isTrue(itR1(g, h_, b, n, m));
});

it("it one-out-of-n", () => {
  const n = 4;
  const m = 2;
  const N = 16;
  const index = 5;
  const g = randomGroupElement();
  const h_gens = new Array(n * m);
  for (let i = 0; i < h_gens.length; i++) {
    h_gens[i] = randomGroupElement();
  }
  const r = randomExponent();

  const prover = new SigmaProver(g, h_gens, n, m);
  const commits = new Array();
  const zero = new BN(0);
  for (let i = 0; i < N; i++) {
    if (i == index) {
      const c = commit(g, zero, h_gens[0], r);
      commits.push(c);
    } else {
      commits.push(randomGroupElement());
    }
  }
  const proof = prover.prove(commits, index, r);
  const verifier = new SigmaVerifier(g, h_gens, n, m);
  assert.isTrue(verifier.verify(commits, proof));
});
