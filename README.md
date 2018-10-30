[![Build Status](https://travis-ci.org/Jking-GIS/koop-provider-Strava.svg?branch=master)](https://travis-ci.org/koopjs/koop-provider-Strava) [![Greenkeeper badge](https://badges.greenkeeper.io/Jking-GIS/koop-provider-Strava.svg)](https://greenkeeper.io/)

# Koop Strava Provider

This is a provider that looks at Strava's api call to explore nearby segments [here](https://developers.strava.com/docs/reference/#api-Segments-exploreSegments). When put into a webmap, it will use your current extent to define where to search for the segments. You can also use it as a wrapper, and pass the same url parameters as you could in the Strava api call of https://www.strava.com/api/v3/segments/explore.

The parameters you can pass are bounds, activity_type, min_cat, and max_cat.

1. bounds (array[Float]): The latitude and longitude for two points describing a rectangular boundary for the search: [southwest corner latitutde, southwest corner longitude, northeast corner latitude, northeast corner longitude]

1. activity_type (String): Desired activity type. May take one of the following values: running, riding.

1. min_cat (integer): The minimum climbing category.

1. max_cat (integer): The maximum climbing category.

## Test it out
Run server:
- `npm install`
- `npm start`

Example API Query:
- `curl localhost:8080/Strava/FeatureServer/0/query?bounds=38,-91,39,-90`

Tests:

- `npm test`

Full documentation of the Strava api is provided [here](https://developers.strava.com/docs/reference).
