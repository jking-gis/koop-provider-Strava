/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/
const request = require('request').defaults({ gzip: true, json: true })
const config = require('config')

function Model (koop) {}

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// Config parameters (config/default.json)
// req.
//
// URL path parameters:
// req.params.host (if index.js:hosts true)
// req.params.id  (if index.js:disableIdParam false)
// req.params.layer
// req.params.method
Model.prototype.getData = function (req, callback) {
  const clientSecret = config.Strava.clientSecret
  const clientId = config.Strava.clientId
  const refreshToken = config.Strava.refreshToken

  request.post({
    url: 'https://www.strava.com/oauth/token',
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    }
  }, function (err, httpResponse, body) {
    if (err) {
      console.log('request failed: ' + err)
      return
    }

    var accessToken = body.access_token
    var requestOptions = {
      url: 'https://www.strava.com/api/v3/segments/explore',
      activity_type: req.query.activity_type ? req.query.activity_type : 'riding',
      min_cat: req.query.min_cat ? req.query.min_cat : 0,
      max_cat: req.query.max_cat ? req.query.max_cat : 5,
      bounds: req.query.bounds ? req.query.bounds : '38,-91,39,-90',
      access_token: accessToken
    }

    // Call the remote API with our developer key
    request(requestOptions, (err, res, body) => {
      if (err) return callback(err)

      /* for (var x = 0; x < body.segments.length; x++) {
        body.segments[x].points
      } */

      console.log(res)
      console.log(body)

      // translate the response into geojson
      const geojson = translate(body.segments[0])
      console.log(JSON.stringify(geojson))

      // Optional: cache data for 10 seconds at a time by setting the ttl or "Time to Live"
      // geojson.ttl = 10

      // Optional: Service metadata and geometry type
      // geojson.metadata = {
      //   title: 'Koop Sample Provider',
      //   description: `Generated from ${url}`,
      //   geometryType: 'Polygon' // Default is automatic detection in Koop
      // }

      // hand off the data to Koop
      callback(null, geojson)
    })
  })
}

function translate (input) {
  return {
    type: 'FeatureCollection',
    features: input.resultSet.vehicle.map(formatFeature)
  }
}

function formatFeature (inputFeature) {
  // Most of what we need to do here is extract the longitude and latitude
  const feature = {
    type: 'Feature',
    properties: inputFeature,
    geometry: {
      type: 'Point',
      coordinates: [inputFeature.start_latlng[0], inputFeature.start_latlng[1]]
    }
  }
  // But we also want to translate a few of the date fields so they are easier to use downstream
  /* const dateFields = ['expires', 'serviceDate', 'time']
  dateFields.forEach(field => {
    feature.properties[field] = new Date(feature.properties[field]).toISOString()
  }) */
  return feature
}

function decodePoly (encodedString) {
  var codeChunks = []
  var codeChunk = []
  var coord = []

  var i; var x = 0; var y = 0
  for (i = 0; i < encodedString.length; i++) {
    codeChunk[x] = encodedString.charCodeAt(i) - 63
    if ((codeChunk[x] & 0x20) === 0x0) {
      codeChunk = codeChunk.reverse()
      var j; var codeChunkString = ''

      var zerosToAdd = 8 - ((codeChunk.length * 5) % 8)
      for (j = 0; j < zerosToAdd; j++) {
        codeChunkString = codeChunkString + '0'
      }

      for (j = 0; j < codeChunk.length; j++) {
        codeChunk[j] = codeChunk[j].toString(2)
        codeChunk[j] = '00000'.substr(codeChunk[j].length) + codeChunk[j]
        codeChunkString = codeChunkString + codeChunk[j]
      }

      var codeChunkBin = parseInt(codeChunkString, 2)
      if (codeChunkBin & 0x1) {
        codeChunkBin = ~(codeChunkBin >> 1)
        codeChunkBin = codeChunkBin - 0x1
        codeChunkBin = ~(codeChunkBin >> 1)
        codeChunkBin = codeChunkBin * -1
        codeChunkBin = codeChunkBin << 1
      } else {
        codeChunkBin = codeChunkBin >> 1
      }

      codeChunkBin = codeChunkBin / 100000
      coord[y % 2] = codeChunkBin

      if ((y % 2) === 1) {
        codeChunks[Math.floor(y / 2)] = coord.reverse()
        if (y > 1) {
          codeChunks[Math.floor(y / 2)][0] = codeChunks[Math.floor(y / 2)][0] + codeChunks[Math.floor(y / 2) - 1][0]
          codeChunks[Math.floor(y / 2)][1] = codeChunks[Math.floor(y / 2)][1] + codeChunks[Math.floor(y / 2) - 1][1]
        }
        coord = []
      }

      y++
      x = 0
      codeChunk = []
    } else {
      codeChunk[x] = codeChunk[x] & 0x1F
      x++
    }
  }

  return codeChunks
}

module.exports = Model

/* Example provider API:
   - needs to be converted to GeoJSON Feature Collection
{
  "resultSet": {
  "queryTime": 1488465776220,
  "vehicle": [
    {
      "tripID": "7144393",
      "signMessage": "Red Line to Beaverton",
      "expires": 1488466246000,
      "serviceDate": 1488441600000,
      "time": 1488465767051,
      "latitude": 45.5873117,
      "longitude": -122.5927705,
    }
  ]
}

Converted to GeoJSON:

{
  "type": "FeatureCollection",
  "features": [
    "type": "Feature",
    "properties": {
      "tripID": "7144393",
      "signMessage": "Red Line to Beaverton",
      "expires": "2017-03-02T14:50:46.000Z",
      "serviceDate": "2017-03-02T08:00:00.000Z",
      "time": "2017-03-02T14:42:47.051Z",
    },
    "geometry": {
      "type": "Point",
      "coordinates": [-122.5927705, 45.5873117]
    }
  ]
}
*/
