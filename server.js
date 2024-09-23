const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(bodyParser.json());

// Your API key should be stored in the .env file
const MELISSA_API_KEY = process.env.MELISSA_API_KEY;

app.post('/api/submit', async (req, res) => {
  const inputData = req.body;

  for (const entry of inputData) {
    const { fullName, age, address, phoneNumber } = entry;

    const melissaApiUrl = `https://personator.melissadata.net/v3/WEB/ContactVerify/doContactV`;

    try {
      const response = await axios.get(melissaApiUrl, {
        params: {
          id: MELISSA_API_KEY,
          full: fullName,
          a: address,
          phone: phoneNumber
        }
      });

      console.log(`Melissa API Response for ${fullName}:`, response.data);
    } catch (error) {
      console.error(`Error for ${fullName}:`, error.message);
    }
  }

  res.status(200).send('Data processed successfully');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
