const express = require('express');
const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(express.json());  
function toHexString(uintValue) {
  return '0x' + parseInt(uintValue, 10).toString(16);
}


app.get('/get-transfers', async (req, res) => {
  try {
  
    const { fromBlockUint } = req.body;

    const fromBlockHex = toHexString(fromBlockUint);

    const data1 = JSON.stringify({
      "jsonrpc": "2.0",
      "id": 0,
      "method": "alchemy_getAssetTransfers",
      "params": [
        {
          "fromBlock": fromBlockHex,  
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

    const response = await axios(baseURL, requestOptions); 
    const transfers1 = response.data.result.transfers;
    const transfersLength = transfers1.length;

    res.json({
      jobRunID: req.body.id,
      data: transfersLength,
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


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






