const BN = require("bn.js");
const { curve, zero } = require("../src/params");

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
  const point = zero;
  const representation = representate(point);
  assert.equal(
    representation,
    "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
  );
});
