const BN = require("bn.js");
const { curve, g, h } = require("../src/params");
const { serialize } = require("../src/serialize");
const {
  commit,
  convertToNal,
  convertToSigma,
  randomExponent,
} = require("../src/primitives");

const crypto = require("crypto");

it("homomorphic", () => {
  const x1 = randomExponent();
  const r1 = randomExponent();

  const x2 = randomExponent();
  const r2 = randomExponent();

  const t1 = commit(g, x1, h, r1);
  const t2 = commit(g, x2, h, r2);
  const t3 = commit(g, x1.add(x2), h, r1.add(r2));

  assert.isTrue(t3.eq(t1.add(t2)));
});

it("convertToSigma", () => {
  const l = 0,
    n = 4,
    m = 2;
  const sigma = convertToSigma(l, n, m);
  assert.deepEqual(
    sigma.map((item) => item.toNumber()),
    [1, 0, 0, 0, 1, 0, 0, 0]
  );
});

it("convertToNal", () => {
  const n = 4,
    m = 2;
  for (let i = 0; i < n ** m; i++) {
    const I = convertToNal(i, n, m);
    assert.equal(I[0] + I[1] * n, i);
  }
});

it("hash", () => {
  const hash1 = crypto.createHash("sha256");
  const hash2 = crypto.createHash("sha256");
  const msgs = ["11", "22", "33"];
  const msg = msgs.join("");
  msgs.forEach((item) => {
    hash1.update(item);
  });
  hash2.update(msg);
  assert.equal(hash1.digest("hex"), hash2.digest("hex"));
});
