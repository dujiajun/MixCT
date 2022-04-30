const BN = require("bn.js");
const { curve } = require("../src/params");
const {
  commit,
  convertToNal,
  convertToSigma,
  randomExponent,
  randomGroupElement,
  toBN10,
} = require("../src/primitives");

const crypto = require("crypto");

it("pedersen commitment", () => {
  const g = curve.point(
    toBN10(
      "9216064434961179932092223867844635691966339998754536116709681652691785432045"
    ),
    toBN10(
      "33986433546870000256104618635743654523665060392313886665479090285075695067131"
    )
  );
  const h = curve.point(
    toBN10(
      "50204771751011461524623624559944050110546921468100198079190811223951215371253"
    ),
    toBN10(
      "71960464583475414858258501028406090652116947054627619400863446545880957517934"
    )
  );

  const x = new BN(10);
  const r = new BN(20);
  const expected = curve.point(
    toBN10(
      "61851512099084226466548221129323427278009818728918965264765669380819444390860"
    ),
    toBN10(
      "74410384199099167977559468576631224214387698148107087854255519197692763637450"
    )
  );
  const c = commit(g, x, h, r);

  assert.isTrue(c.eq(expected));
});

it("homomorphic", () => {
  const h = randomGroupElement();
  const g = randomGroupElement();

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
