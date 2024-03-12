//configuration node express 
const express = require('express');
const app = express();
const cors = require('cors');
const port = 4040;
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const axios = require('axios');
const https = require('https');




app.listen(port, () => console.log(`Server started on port ${port}`));

//middleware

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//configuration node express
//const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());

   
// routes 
app.get('/', async (req, res) => {
    const instance = axios.create({
        httpsAgent: new https.Agent({  
          rejectUnauthorized: false
        })
    });
    const url = 'https://www.bcv.org.ve/estadisticas/billetes-y-monedas';
    
    async function getExchangeRates() {
      try {
        const response = await instance.get(url);
        const html = response.data;
    
        // Load HTML content into cheerio
        const $ = cheerio.load(html);
    
        // Extract relevant elements
        const exchangeRates = {};
        const dateElement = $('.date-display-single');
        const date = dateElement.text().trim().split(' ')[1];
    
        $('.recuadrotsmc').each(function() {
            const currency = $(this).find('span').text().trim();
            let rateString = $(this).find('strong').text().trim();
          
            // Replace commas with dots
            rateString = rateString.replace(',', '.');
          
            const rate = parseFloat(rateString);
            exchangeRates[currency] = rate;
        });
    
        return {
          divisas: exchangeRates,
          fecha:  
          new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        };
      } catch (error) {
        console.error(error);
        return null;
      }
    }
    
    const data = await getExchangeRates();
    if (data) {
        console.log(data);
        return res.json(data);      
    }
});
