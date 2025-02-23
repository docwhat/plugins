import fs from "fs";
import path from "path";
import { customLinterCheckTest, customLinterFmtTest } from "tests";
import { TrunkDriver } from "tests/driver";
import { TEST_DATA } from "tests/utils";

// Test data taken from https://github.com/shssoichiro/oxipng/tree/master
customLinterCheckTest({
  linterName: "oxipng",
  testName: "malformed",
  args: path.join(TEST_DATA, "bad.png"),
});

// Snapshots cannot handle png files well, so just test for successful run and inequality
const preCheck = (driver: TrunkDriver) => {
  driver.copyFile(path.join(TEST_DATA, "good.png"), path.join(TEST_DATA, "good.png.bak"));
};

const postCheck = (driver: TrunkDriver) => {
  const originalSize = fs.statSync(
    // trunk-ignore(semgrep): paths used here are safe
    path.resolve(driver.getSandbox(), TEST_DATA, "good.png.bak")
  ).size;
  // trunk-ignore(semgrep): paths used here are safe
  const compressedSize = fs.statSync(path.resolve(driver.getSandbox(), TEST_DATA, "good.png")).size;
  expect(compressedSize).toBeLessThan(originalSize);
};

customLinterFmtTest({
  linterName: "oxipng",
  testName: "basic",
  args: path.join(TEST_DATA, "good.png"),
  preCheck,
  postCheck, // Assert that the file was compressed
  pathsToSnapshot: [path.join(TEST_DATA, "empty.txt")], // The version the test runs on depends on there being at least one snapshot
});
