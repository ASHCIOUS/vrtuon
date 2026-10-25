const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/get-image', async (req, res) => {
  const { url } = req.body;
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const $ = cheerio.load(data);

    let imgUrl = null;

    // Myntra
    if (url.includes('myntra.com')) {
      imgUrl = $('meta[property="og:image"]').attr('content');
      if (!imgUrl) imgUrl = $('img.img-responsive').first().attr('src');
      if (!imgUrl) imgUrl = $('img.pdp-image').first().attr('src');
      if (!imgUrl) imgUrl = $('img').first().attr('src');
    }
    // Flipkart
    else if (url.includes('flipkart.com')) {
      imgUrl = $('img._396cs4').first().attr('src');
      if (!imgUrl) imgUrl = $('img').first().attr('src');
    }
    // Amazon
    else if (url.includes('amazon')) {
      imgUrl = $('#landingImage').attr('src');
      if (!imgUrl) imgUrl = $('img').first().attr('src');
    }

    console.log("Extracted image URL:", imgUrl);

    if (imgUrl) {
      res.json({ imgUrl });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (err) {
    console.error("Error fetching image:", err.message);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});