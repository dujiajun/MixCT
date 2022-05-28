const Tumbler = require("../src/tumbler");
const {
  commit,
  randomExponent,
  randomGroupElement,
} = require("../src/primitives");
const BN = require("bn.js");
const { g, h, f } = require("../src/params");
const { SigmaProver } = require("../src/prover");
const { serialize } = require("../src/serialize");

it("test tumbler", () => {
  //params
  const N = 4;
  const n = 2;
  const m = 2;

  console.log(serialize(g), serialize(h), serialize(f));

  //prepare escrow data
  const vs = new Array(N);
  const rs = new Array(N);
  const c_escs = new Array(N);
  const trapdoors = new Array(N);
  const tokens = new Array(N);
  for (let i = 0; i < N; i++) {
    vs[i] = new BN(i);
    rs[i] = randomExponent();
    c_escs[i] = commit(g, vs[i], h, rs[i]);
    trapdoors[i] = randomExponent();
    tokens[i] = f.mul(trapdoors[i]);
  }

  //escrow
  const tumbler = new Tumbler();
  c_escs.forEach((element, index) => {
    tumbler.escrow(element, tokens[index]);
  });

  //prepare redeem data

  const h_gens = new Array(N);
  h_gens[0] = h.add(f.neg());
  for (let i = 1; i < N; i++) {
    h_gens[i] = randomGroupElement();
  }
  const aux = { n, m, g, h_gens };
  const l = 1;
  const randomness = trapdoors[l];
  const commits = c_escs.map((item, index) => {
    const den = item.add(tokens[index]).neg();
    return c_escs[l].add(den);
  });

  const prover = new SigmaProver(aux.g, aux.h_gens, aux.n, aux.m);
  const proof = prover.prove(commits, l, randomness);

  // redeem
  const c_red = c_escs[l].add(h.mul(trapdoors[l]));

  const result = tumbler.redeem(c_red, proof, aux);
  assert.isTrue(result);
});
