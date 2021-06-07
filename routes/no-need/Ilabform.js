const fs = require("fs")
const express = require("express")
const { composeAPI } = require("@iota/core");
const { trytesToAscii, asciiToTrytes } = require("@iota/converter");
const { asTransactionObject } = require("@iota/transaction-converter");
const Identity = require("@iota/identity-wasm/node");
const ipfsClient = require("ipfs-http-client");
const { DateTime } = require("luxon");
const { SHA3 } = require("sha3");;
const { CreatePDF } = require("./CreatePDF");
const { CLIENT_CONFIG } = require("../../config");
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
  Method,
  VerifiableCredential,
  VerifiablePresentation,
} = Identity

const router = express.Router();

router.post("/create", async (req, res) => {
  const { personalData, shoeData, styleData, language } = req.body;
  try {
    let pdf
    let currentDate
    if(language === "en") {
      currentDate = DateTime.now()
      pdf = CreatePDF(personalData, shoeData, styleData)
    }

    const buffer = Buffer.from(pdf, "base64");

    const hash = new SHA3(256);
    hash.update(buffer);
    const hex = hash.digest("hex");

    const client = ipfsClient();

    const addResponse = await client.add(buffer);
    console.log(addResponse)
    const ipfsHash = uploadedFile.hashV0;
    const size = buffer.length;

    const iota = composeAPI({
      provider: CLIENT_CONFIG.node
    });

    const depth = 3;
    const minimumWeightMagnitude = 14;

    const address = "iota1qrcdludz9krldt4aa8tx0m4248zkqz4vwlnur494v8u9928xsnwaksxvs5y";
    const tanglePayload = {
      size: size,
      created: currentDate,
      hash: hex,
      publicFleekUrl: uploadedFile.publicUrl,
      ipfs: ipfsHash
    };

    const message = JSON.stringify(tanglePayload);
    const messageInTrytes = asciiToTrytes(message);

    const transfers = [
      {
          value: 0,
          address: address,
          message: messageInTrytes
      }
    ];

    const trytes = await iota.prepareTransfers("9".repeat(81), transfers)
    const bundle = await iota.sendTrytes(trytes, depth, minimumWeightMagnitude);

    fs.readFile("./routes/transactionData/transactionData.json", (err, transactionData) => {
      if (err) {
        return res
          .status(500)
          .json({
            error: err,
            message: "Error reading json file",
            success: false
          });
      }
      try {
        const transactionObj = JSON.parse(transactionData);
        const newTransactionData = {
          tangleHash: bundle[0].hash,
          size: size,
          fleekUrl: uploadedFile.publicUrl,
          created: currentDate,
          hash: hex,
          ipfs: ipfsHash
        }
        transactionObj.push(newTransactionData);
        fs.writeFile("./routes/transactionData/transactionData.json", JSON.stringify(transactionObj, null, 2), err =>{
          if (err) {
            return res
              .status(500)
              .json({
                error: err,
                message: "Error writing json file",
                success: false
              });
          }
          console.log("File successfully updated")
        })
      } catch (error) {
        return res
          .status(500)
          .json({
            error: err,
            message: "Error writing json file",
            success: false
          });
      }
    })

    return res
      .status(200)
      .json({
        tangleHash: bundle[0].hash,
        ipfsHash: ipfsHash,
        message: "ILAB identity is successfully created",
        success: true
      });
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({
        error: error,
        message: "There was a Problem with our Servers",
        success: false
      });
  }
})

router.post("/retrieve", async (req, res) => {
  const { hashes } = req.body;

  try {
    const iota = composeAPI({
      provider: CLIENT_CONFIG.node
    });

    let transactions = []

    for (let hash of hashes) {
      // Get the transaction trytes for the transaction with the specified hash
      const transaction = await iota.getTrytes([hash.tangleHash]);
      // Convert the transaction trytes to an object
      const txObject = asTransactionObject(transaction[0]);
      // Trim trailing 9s make sure it is even length
      let trimmed = txObject.signatureMessageFragment.replace(/\9+$/, "");
      if (trimmed.length % 2 === 1) {
        trimmed += "9";
      }
      // Get the message and convert it to ASCII characters
      const ascii = trytesToAscii(trimmed);
      // Parse the JSON message
      const payload = JSON.parse(ascii)
      transactions.push(payload)
    }
    return res
      .status(200)
      .json({
        transactions: transactions,
        success: true
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: error,
        success: false
      });
  }

});

module.exports = router