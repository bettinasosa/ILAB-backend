const Identity = require("@iota/identity-wasm/node")
const { createIdentity } = require("./utils/createDid")
const fs = require('fs');
const { CLIENT_CONFIG } = require("./config")
const {
  Digest,
  DID,
  Document,
  KeyCollection,
  KeyPair,
  KeyType,
  VerificationMethod,
  VerifiableCredential,
  VerifiablePresentation,
} = Identity

async function run() {
  // Generate a KeyPair, DID, and Document for user
  let { key, doc, messageId } = await createIdentity();

  //Add a new VerificationMethod with a new KeyPair
  const newKey = new KeyPair(KeyType.Ed25519);
  const method = VerificationMethod.fromDID(doc.id, newKey, "newKey");
  doc.insertMethod(method, "VerificationMethod");

  doc.sign(key)

  issuermessage = await Identity.publish(doc.toJSON(), CLIENT_CONFIG)

  const Issuer = {key, doc, messageId}

  const issuerString = JSON.stringify(Issuer)

  fs.writeFile("Issuer.json", issuerString, (err, issuer) => {
    if(err) console.log('error', err);
  });
}

run()