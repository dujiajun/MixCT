const crypto = require("crypto");
const BN = require("bn.js");
const params = require("./params");
const { representate } = require("./serialize");
const { ec } = params;

function toBN10(str) {
  return new BN(str, 10);
}

function commit(g, m, h, r) {
  return g.mul(m).add(h.mul(r));
}

function multiExponents(h, exp) {
  let tmp = params.zero;
  h.forEach((item, index) => {
    tmp = tmp.add(item.mul(exp[index]));
  });
  return tmp;
}

function commitBits(g, h, exp, r) {
  const tmp = multiExponents(h, exp);
  return g.mul(r).add(tmp);
}

function randomExponent() {
  const keyPair = ec.genKeyPair();
  return keyPair.getPrivate();
}

function randomGroupElement() {
  const keyPair = ec.genKeyPair();
  return keyPair.getPublic();
}

function generateChallenge(group_elements) {
  const sha256 = crypto.createHash("sha256");
  group_elements.forEach((item) => {
    sha256.update(representate(item));
  });
  const result_out = new BN(sha256.digest("hex"), "hex").toRed(params.p);
  return result_out;
}

function convertToSigma(num, n, m) {
  const out = new Array();
  var j = 0;
  for (j = 0; j < m; j++) {
    const rem = num % n;
    num = Math.floor(num / n);
    for (let i = 0; i < n; i++) {
      out.push(i == rem ? new BN(1) : new BN(0));
    }
  }
  return out;
}

function convertToNal(num, n, m) {
  const out = new Array();
  var j = 0;
  while (num != 0) {
    const rem = num % n;
    num = Math.floor(num / n);
    out.push(rem);
    j++;
  }
  if (out.length > m) return out.slice(0, m);
  if (out.length < m)
    out.splice(out.length, 0, ...new Array(m - out.length).fill(0));
  return out;
}

function newFactor(x, a, coefficients) {
  const degree = coefficients.length;
  coefficients.push(x.mul(coefficients[degree - 1]));
  for (let d = degree - 1; d >= 1; d--) {
    coefficients[d] = a.mul(coefficients[d]).add(x.mul(coefficients[d - 1]));
  }
  coefficients[0] = coefficients[0].mul(a);
}

module.exports = {
  toBN10,
  commit,
  multiExponents,
  commitBits,
  randomExponent,
  randomGroupElement,
  generateChallenge,
  newFactor,
  convertToNal,
  convertToSigma,
};
