const express = require('express');
const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(express.json());  // For parsing incoming JSON

// Helper function to convert uint to hex with '0x' prefix
function toHexString(uintValue) {
  return '0x' + parseInt(uintValue, 10).toString(16);
}

// External Adapter function that can be called via an API
app.post('/get-transfers', async (req, res) => {
  try {
    // Accept 'fromBlock' as a uint parameter from the request body
    const { fromBlockUint } = req.body;

    // Convert the uint 'fromBlock' to a hexadecimal string with '0x' prefix
    const fromBlockHex = toHexString(fromBlockUint);

    const data1 = JSON.stringify({
      "jsonrpc": "2.0",
      "id": 0,
      "method": "alchemy_getAssetTransfers",
      "params": [
        {
          "fromBlock": fromBlockHex,  // Use the converted hexadecimal block
          "toBlock": "latest",
          "fromAddress": "0xCC76244a2f9591D7868Cd1a71994d05A12e1DfA5",
          "toAddress": "0x2fb7F1d67576a542895C0CCb1C2EA0ae6368E784",
          "category": ["external","internal", "erc20"],
          "excludeZeroValue": true
        }
      ]
    });

    const requestOptions = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      data: data1,
    };

    const baseURL = process.env.ALCHEMY_API_KEY;

    // Perform the API request to Alchemy
    const response = await axios(baseURL, requestOptions);

    // Extract the relevant data
    const transfers = response.data.result.transfers.map(event => ({
      tokenTransfer: event.value,
      asset: event.asset
    }));

    // Return the response as JSON in the format Chainlink can parse
    res.json({
      jobRunID: req.body.id,
      data: transfers,
      status: 'success'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      jobRunID: req.body.id,
      status: 'errored',
      error: error.message
    });
  }
});

// Start the server on port 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
