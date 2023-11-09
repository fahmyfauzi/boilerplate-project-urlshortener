require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const urlParser = require("url")
const dns = require("dns")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// schema link
const linkSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  list: Number
})

const Link = mongoose.model("Link", linkSchema)

// route short api url
app.post("/api/shorturl", (req, res) => {
  //ambil url dari body
  const url = req.body.url

  // Menggunakan function dns.lookup seperti yang disarankan oleh FreeCodeCamp
  dns.lookup(urlParser.parse(url).hostname, async (err, address, family) => {
    if (!address || !family) {
      return res.json({ error: "invalid url" })
    }

    link = await Link.findOne({
      address: url,
    }).exec()


    // Mengecekan apakah di database link nya sudah terdaftar
    if (link !== null) {
      return res.json({
        original_url: link.address,
        short_url: link.list
      })
    }

    // Menghitung data di database
    let count = await Link.find().countDocuments();

    // membuat data baru
    let newLink = new Link({
      address: url,
      list: count + 1
    })

    //simpan ke database
    newLink.save()

    return res.json({
      original_url: newLink.address,
      short_url: newLink.list
    })

  })


})


app.get("/api/shorturl/:shorturl", async (req, res) => {
  const shorturl = Number(req.params.shorturl)

  let link = await Link.findOne({
    list: shorturl
  }).exec()

  return res.redirect(link.address)
})

const MONGO_URI = "mongodb+srv://fahmyfauzii:alvianda@cluster0.yhlihxb.mongodb.net/freecodecamp?retryWrites=true&w=majority"
// Connect to MongoDB
mongoose.connect(MONGO_URI).then(() => console.log("connect database")).catch((err) => console.log(err.message))

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
