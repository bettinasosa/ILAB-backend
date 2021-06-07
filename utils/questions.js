const { VerifiableCredential, checkCredential, Document, KeyPair } = require("@iota/identity-wasm/node")
const Issuer = require("../Issuer.json")

/*
    This example shows how to create a Verifiable Credential and validate it.
    In this example, alice takes the role of the subject, while we also have an issuer.
    The issuer signs a UniversityDegreeCredential type verifiable credential with Alice's name and DID.
    This Verifiable Credential can be verified by anyone, allowing Alice to take control of it and share it with whoever they please.
    @param {{network: string, node: string}} clientConfig
*/

async function questions(id, FirstName, LastName, size, shoeSize, Birth, gender,  address, city, state, postalCode, country)  {

  // Prepare a credential subject indicating the degree earned by Alice
  let questionnaireinfo = {
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
  const deserializedKeyPar = KeyPair.fromJSON(Issuer.key)

  const unsignedVc = VerifiableCredential.extend({
    id: "http://example.edu/credentials/3732",
    type: "QuestionnaireCredential",
    issuer: deserializedIssuer.id.toString(),
    credentialSubject: questionnaireinfo,
  })

  //sign credential with keyPair of Issuer
  const signedVc = deserializedIssuer.signCredential(unsignedVc, {
    method: deserializedIssuer.id.toString()+"#key",
    public: deserializedKeyPar.public,
    secret: deserializedKeyPar.secret,
  })

  //throws error
  //removing validation to work on app and have a working backend
  const result = await checkCredential(signedVc.toString(), clientConfig);
  //const result = ""
  console.log(result)

  return {result, signedVc};
}

exports.questions = questions;