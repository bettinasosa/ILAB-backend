const Identity = require("@iota/identity-wasm/node")
const { CLIENT_CONFIG, EXPLORER_URL } = require('./config')

const {
  Document,
  KeyType,
} = Identity
async function createIdentity() {
    //Create a DID Document (an identity).
    const { doc, key } = new Document(KeyType.Ed25519)

    //Sign the DID Document with the generated key
    doc.sign(key);

    //Publish the Identity to the IOTA Network
    const messageId = await Identity.publish(doc.toJSON(), CLIENT_CONFIG);

    //Log the results
    console.log(`Identity Creation: ${EXPLORER_URL}/${messageId}`);

    //Return the results
    return {key, doc, messageId};
}
exports.createIdentity = createIdentity;