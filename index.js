// comments based on W3C
//
// Holders of verifiable credentials can generate verifiable presentations -> then share these verifiable presentations with verifiers to prove their possesion of the credential
const express = require("express");
const Identity = require("@iota/identity-wasm/node")
const cors = require("cors");
const server = express();
const Issuer = require("./Issuer.json")
const { createIdentity } = require("./utils/createDid")
const { createVC } = require("./utils/createPersonalInformationVc")
const fetch = require("node-fetch")
const questionnaireinfo = require("./routes/questions")
const { CLIENT_CONFIG } = require("./config")
require("dotenv").config()
global.Headers = fetch.Headers
global.Request = fetch.Request
global.Response = fetch.Response
global.fetch = fetch

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

server.use(cors())
server.use(express.json({ limit: "10MB" }))

server.use("/questions", questionsRoute);

server.get("/test", (req, res) => {
  res.send("Test route")
})

server.post("/create", async (req, res) => {
  try {
    const {FirstName, LastName, size, shoeSize, Birth, gender, address, city, state, postalCode, country} = req.body;
  
    const requestIsIncomplete = Object.values(req.body).find(value => !value);
    if (requestIsIncomplete) {
      return res
        .status(500)
        .json({
          message: "You are missing personal information",
        });
    }

    const did = await createIdentity(CLIENT_CONFIG)

    const personalInfromationVc = await createVC(did.doc.id.toString(), FirstName, LastName, size, shoeSize, Birth, gender, address, city, state, postalCode, country)


    if (personalInfromationVc.result.verified) {
      return res
        .status(500)
        .json({
          message: "Your credential is not verified",
        });
    }

    return res
      .status(200)
      .json({
        did: did,
        credential: personalInfromationVc.signedVc,
        message: `You have successfully created your digital identity, ${FirstName}`,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: error,
        message: "There was a Problem with our Servers",
      });
  }
});

server.post("/update-personal-vc", async (req, res) => {
  try {
    const {id, FirstName, LastName, size, shoeSize, Birth, gender, address, city, state, postalCode, country} = req.body;

    const requestIsIncomplete = Object.values(req.body).find(value => !value);
    if (requestIsIncomplete) {
      return res
        .status(500)
        .json({
          message: "You are missing personal information",
        });
    }

    const personalInfromationVc = await createVC(id, FirstName, LastName, size, shoeSize, Birth, gender, address, city, state, postalCode, country)
    console.log(personalInfromationVc.signedVc);

    if (personalInfromationVc.result.verified) {
      return res
        .status(500)
        .json({
          message: "Your credential is not verified",
        });
    }

    return res
      .status(200)
      .json({
        credential: personalInfromationVc.signedVc,
        message: `You have successfully updated your digital identity, ${FirstName}`,
      });

  } catch (error) {
    return res
      .status(500)
      .json({
        error: error,
        message: "There was a Problem with our Servers",
      });
  }
});

server.post("/verify", async (req, res) => {
  try {
    const {id} = req.body;
    // reformat the id to fit the iota format

    if (!id) {
      return res
        .status(500)
        .json({
          message: "Identity not found",
        });
    }

    try {
      console.log(id)
      // resolve the document
      const doc = await Identity.resolve(id, CLIENT_CONFIG)
      // parse the document
      const document = Document.fromJSON(doc)
      if (document.verify()) {
        const documentJSON = document.toJSON();
        const date = documentJSON.created;
        return res
          .status(200)
          .json({
            message: `Identity is valid and created at ${date}`,
          });}

    } catch (error) {
      return res
      .status(500)
      .json({
        error: error,
        message: "Identity not found",
      });
      
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "There was a Problem",
      });
  }
})

server.post("/update-personal-credential", async (req, res) =>{
  const {id, FirstName, LastName, Birth, gender, size, shoeSize, streetNumber, city, state, postalCode, country} = req.body;

  try {
    const personalInformation = {
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
    const deserializedKeyCollection = KeyCollection.fromJSON(Issuer.keyKollection)

    const unsignedVc = VerifiableCredential.extend({
      id: "http://example.edu/credentials/3732",
      type: "personalInformationCredential",
      issuer: deserializedIssuer.id.toString(),
      credentialSubject: personalInformation,
    })

    // Sign the credential with Issuer"s Merkle Key Collection method
    const signedVc = deserializedIssuer.signCredential(unsignedVc, {
      method: Issuer.issuer.doc.verificationMethod[0].id,
      public: deserializedKeyCollection.public(0),
      secret: deserializedKeyCollection.secret(0),
      proof: deserializedKeyCollection.merkleProof(Digest.Sha256, 0),
    })

    if (!deserializedIssuer.verify(signedVc)) {
      return res
        .status(500)
        .json({
          message: "Your credential is not verified",
        });
    }

    return res
      .status(500)
      .json({
        credential: signedVc,
        message: `Your credential is updated.`,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "There was a Problem with our Servers",
      });
  }
})



server.listen(process.env.PORT || 3001, ()=>{
  console.log("***********************************");
  console.log("API server listening at localhost:3001");
  console.log("***********************************");
});