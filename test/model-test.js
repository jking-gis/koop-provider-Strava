/*
  model-test.js

  This file is optional, but is strongly recommended. It tests the `getData` function to ensure its translating
  correctly.
*/

const test = require('tape')
const Model = require('../Strava')
const model = new Model()
const nock = require('nock')

test('should properly fetch from the API and translate features', t => {
  nock('https://www.strava.com')
    .post('/oauth/token')
    .reply(200, require('./fixtures/auth.json'))

  nock('https://www.strava.com')
    .get('/api/v3/segments/explore')
    .reply(200, require('./fixtures/input.json'))

  model.getData({}, (err, geojson) => {
    t.error(err)
    t.equal(geojson.type, 'FeatureCollection', 'creates a feature collection object')
    t.ok(geojson.features, 'has features')
    const feature = geojson.features[0]
    t.equal(feature.type, 'Feature', 'has proper type')
    t.equal(feature.geometry.type, 'LineString', 'creates line geometry')
    t.deepEqual(feature.geometry.coordinates, [
      [-90.4445, 38.56079], [-90.44356, 38.56086], [-90.44324, 38.56089]
    ], 'translates geometry correctly')
    t.ok(feature.properties, 'creates attributes')
    t.end()
  })
})
