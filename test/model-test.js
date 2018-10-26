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
  nock('https://www.strava.com/api/v3')
    .get('/segments/explore')
    .reply(200, require('./fixtures/input.json'))

  model.getData({}, (err, geojson) => {
    t.error(err)
    t.equal(geojson.type, 'FeatureCollection', 'creates a feature collection object')
    t.ok(geojson.features, 'has features')
    const feature = geojson.features[0]
    t.equal(feature.type, 'Feature', 'has proper type')
    t.equal(feature.geometry.type, 'LineString', 'creates line geometry')
    t.ok(feature.properties, 'creates attributes')
    t.end()
  })
})
