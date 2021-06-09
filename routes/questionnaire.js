const express = require("express")
const Identity = require("@iota/identity-wasm/node");
const { createPatientQuestionnaireVc } = require("../utils/questions")
require("dotenv").config()
const { CLIENT_CONFIG } = require("../config")
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
  Method,
  VerifiableCredential,
  VerifiablePresentation,
} = Identity

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const {id, FirstName, LastName, size, shoeSize, Birth, gender,  address, city, state, postalCode, country} = req.body;
    
    const requestIsIncomplete = Object.values(req.body).find(value => !value);
    if (requestIsIncomplete) {
      return res
        .status(500)
        .json({
          message: "You are missing required information",
        });
    }

    const Questionnaire = await questions(CLIENT_CONFIG, id, FirstName, LastName, size, shoeSize, Birth, gender,  address, city, state, postalCode, country)

    return res
      .status(200)
      .json({
        Questionnaire: Questionnaire.signedVc,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: error,
        message: "There was a Problem with our Servers",
      });
  }
})

module.exports = router