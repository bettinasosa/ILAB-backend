var express = require('express')
var cors = require('cors')
var app = express()

app.use(cors())

app.get('/products/:id', function (req, res, next) {
    res.json({msg: 'This is CORS-enabled for all origins!'})
  })
  
app.listen(80, function () {
    console.log('CORS-enabled web server listening on port 80')
  })

app.post('/testing', async (req, res) => {
    const user = await User.findOne({email: req.body.email})
  })

const userSchema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    }
  })

app.post('/signup', async(req, res) => {
    const { email, firstName } = req.body
    const user = new User({ email, firstName })
    const ret = await user.save()
    res.json(ret)
  })

fetch('/signup', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Zell'
    })
  })