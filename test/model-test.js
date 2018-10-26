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
      [ -90.4445, 38.56079 ], [ -90.44356, 38.56086 ], [ -90.44324, 38.56089 ], [ -90.44284, 38.56097 ], [ -90.44244, 38.561099999999996 ], [ -90.44186, 38.56135 ], [ -90.44032, 38.56209 ], [ -90.44006, 38.56221 ], [ -90.4398, 38.5623 ], [ -90.43973000000001, 38.56235 ], [ -90.43957000000002, 38.56242 ], [ -90.43950000000002, 38.562540000000006 ], [ -90.43937000000003, 38.56268000000001 ], [ -90.43932000000002, 38.56271000000001 ], [ -90.43916000000003, 38.56267000000001 ], [ -90.43903000000003, 38.56267000000001 ], [ -90.43865000000002, 38.56274000000001 ], [ -90.43840000000003, 38.56281000000001 ], [ -90.43739000000004, 38.56316000000001 ], [ -90.43705000000004, 38.56325000000001 ], [ -90.43676000000004, 38.56337000000001 ], [ -90.43636000000004, 38.56350000000001 ], [ -90.43584000000004, 38.56368000000001 ], [ -90.43563000000005, 38.563780000000015 ], [ -90.43533000000005, 38.56386000000001 ], [ -90.43470000000005, 38.56408000000001 ], [ -90.43444000000005, 38.56415000000001 ], [ -90.43411000000005, 38.56428000000001 ], [ -90.43346000000005, 38.56461000000001 ], [ -90.43300000000005, 38.56493000000001 ], [ -90.43257000000006, 38.56527000000001 ]
    ], 'translates geometry correctly')
    t.ok(feature.properties, 'creates attributes')
    t.end()
  })
})
