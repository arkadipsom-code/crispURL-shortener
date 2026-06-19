const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = ALPHABET.length;

function encodeToBase62(id) {
  if (id === 0) return ALPHABET[0];
  let shortstr = "";
  while (id > 0) {
    let remainder = id % BASE;
    shortstr = ALPHABET[remainder] + shortstr;
    id = Math.floor(id / BASE);
  }
  return shortstr;
}

function decodeFromBase62(shortstr) {
  let id = 0;
  for (let i = 0; i < shortstr.length; i++) {
    id = id * BASE + ALPHABET.indexOf(shortstr[i]);
  }
  return id;
}

module.exports = { encodeToBase62, decodeFromBase62 };
