// Usage: npm run hash-pin 123456
// Prints the SHA-256 hash to paste into the CLIENT_PINS environment variable.
import { createHash } from "node:crypto";

const pin = process.argv[2];
if (!pin || !/^[0-9]{6}$/.test(pin)) {
  console.error("Give a six digit pin code, for example: npm run hash-pin 481920");
  process.exit(1);
}
console.log(createHash("sha256").update(pin).digest("hex"));
