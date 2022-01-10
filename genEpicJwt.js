/**
 * Sample code to generate a JWT to connect to Epic
 *
 * Note: It can take up to 24 hours for an uploaded Public key to be accepted.
 * If you think you've done every step right and are still getting unhelpful
 * error messages from Epic, wait a couple hours and try again.
 */
const crypto = require("crypto");
const { Buffer } = require("buffer");
const fs = require("fs");

const header = {
  alg: "RS384",
  typ: "JWT",
};

// Your Epic Client ID goes here
const clientId = "";
if (!clientId) {
  throw new Error("Client ID is missing - specify this value from Epic's App configuration page");
}
const curTime = Math.floor(new Date().getTime() / 1000);
const expTime = curTime + 60 * 5; // 5 mins from now
const claims = {
  iss: clientId,
  sub: clientId,
  jti: new Date().getTime() + "-12345", // unique-ish value
  aud: "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
  exp: expTime,
  iat: curTime,
  nbf: curTime,
};

const headerBuffer = Buffer.from(JSON.stringify(header));
let headerString = headerBuffer.toString("base64");
headerString = headerString.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");

const claimsBuffer = Buffer.from(JSON.stringify(claims));
let claimsString = claimsBuffer.toString("base64");
claimsString = claimsString.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");

// The path to your private key goes here
const pem = fs.readFileSync("");
if (!pem) {
  throw new Error(
    "You need to generate a public/private key pair, upload the public key to Epic's app configuration, and specify the path to the private key here."
  );
}
const key = pem.toString("ascii");

const sign = crypto.createSign("RSA-SHA384");

sign.update(headerString + "." + claimsString);
let signature = sign.sign(key, "base64");
signature = signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");

console.log(headerString + "." + claimsString + "." + signature);
