const BN = require("bn.js");
const { curve } = require("../src/params");

const { toBN10 } = require("../src/primitives");
const {
  deserialize,
  representate,
  serialize,
  toBytes,
} = require("../src/serialize");

it("toBytes", () => {
  const x = toBN10("10");
  assert.equal(
    toBytes(x),
    "0x000000000000000000000000000000000000000000000000000000000000000a"
  );

  const y = new BN("10", "hex");
  assert.equal(
    toBytes(y),
    "0x0000000000000000000000000000000000000000000000000000000000000010"
  );
});

it("serialize", () => {
  const point = curve.g;
  const serialization = serialize(point);
  const new_point = deserialize(serialization);
  assert.isTrue(point.eq(new_point));
});

it("representate", () => {
  const point = curve.g;
  const representation = representate(point);
  assert.equal(
    representation,
    "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
  );
});
