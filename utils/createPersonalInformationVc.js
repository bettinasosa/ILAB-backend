const { VerifiableCredential, checkCredential, Document, KeyPair } = require("@iota/identity-wasm/node")
const { CLIENT_CONFIG } = require('../config')
const Issuer = require("../Issuer.json")

/*
    This example shows how to create a Verifiable Credential and validate it.
    In this example, alice takes the role of the subject, while we also have an issuer.
    The issuer signs a UniversityDegreeCredential type verifiable credential with Alice's name and DID.
    This Verifiable Credential can be verified by anyone, allowing Alice to take control of it and share it with whoever they please.
    @param {{network: string, node: string}} clientConfig
*/

async function createVC(id, FirstName, LastName, size, shoeSize, Birth, gender,  address, city, state, postalCode, country) {

    // Prepare a credential subject indicating User information
    let personalInformation = {
        id: id,
        FirstName: FirstName,
        LastName: LastName,
        Birth: Birth,
        gender: gender,
        size: size,
        shoeSize: shoeSize,
        address: {
          street: address,
          city: city,
          state: state,
          postalCode: postalCode,
          country: country,
        }
    }

    const deserializedIssuer = Document.fromJSON(Issuer.doc)
    const deserializedKeyPar = KeyPair.fromJSON(testIssuer.key)

    // Create an unsigned `UniversityDegree` credential for Alice
    const unsignedVc = VerifiableCredential.extend({
        id: "http://example.edu/credentials/3732",
        type: "personalInformationCredential",
        issuer: deserializedIssuer.id.toString(),
        credentialSubject: personalInformation,
    })

    //Sign the credential with the Issuer's newKey
    const signedVc = deserializedIssuer.signCredential(unsignedVc, {
        method: Issuer.doc.id.toString()+"#newKey",
        public: Issuer.key.public,
        secret: Issuer.key.secret,
    })
     //console.log is it signed?
  console.log(signedVc)

    //Check if the credential is verifiable
    const result = await checkCredential(signedVc.toString(), CLIENT_CONFIG);
    console.log(result)

    return {result, signedVc};
}

exports.createVC = createVC;