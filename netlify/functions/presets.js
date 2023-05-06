// eslint-disable-next-line no-undef
const axios = require('axios');

// eslint-disable-next-line no-undef, consistent-return
exports.handler = (event, context, callback) => {
  // Get env var values defined in our Netlify site UI
  // eslint-disable-next-line no-undef
  const KEY = process.env.VITE_AIRTABLE_KEY;
  // eslint-disable-next-line no-undef
  const APP = process.env.VITE_AIRTABLE_APP;
  // eslint-disable-next-line no-undef
  const TABLE = process.env.VITE_AIRTABLE_TABLE_PRESETS;
  const URL = `${APP}/${TABLE}`;

  const headers = {
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
  };

  // Here's a function we'll use to define how our response will look like when we call callback
  const pass = (code, body) => {
    // console.log(body)
    callback(null, {
      statusCode: code,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  };

  const getPresets = async () => {
    try {
      const response = await axios.get(URL, { headers });

      if (!response.data || !response.data.records) {
        return pass(404, { error: 'No data/records found' });
      }

      const sorted = response.data.records
        .filter((r) => r.fields.gradient_preset !== undefined)
        .sort((a, b) => {
          if (a.createdTime < b.createdTime) return -1;
          if (a.createdTime > b.createdTime) return 1;
          return 0;
        });

      const data = sorted.map((record) => ({
        ...JSON.parse(record.fields.gradient_preset),
        id: record.id,
      }));

      return pass(200, data);
    } catch (error) {
      return pass(500, { error: 'Unable to fetch data' });
    }
  };

  const createPreset = async () => {
    const { body } = event;
    const { preset } = JSON.parse(body);

    const newPreset = {
      fields: {
        gradient_preset: JSON.stringify(preset),
      },
    };

    try {
      const response = await axios.post(URL, newPreset, { headers });
      const data = JSON.parse(response.data.fields.gradient_preset);
      data.id = response.data.id;
      return pass(201, data);
    } catch (error) {
      return pass(500, { error: 'Something went wrong, saving preset failed' });
    }
  };

  const removePreset = async () => {
    const { body } = event;
    const { id } = JSON.parse(body);

    try {
      await axios.delete(`${URL}/${id}`, { headers });
      return pass(201, {});
    } catch (error) {
      return pass(500, { error: 'Something went wrong, saving preset failed' });
    }
  };

  if (event.httpMethod === 'GET') {
    getPresets();
  } else if (event.httpMethod === 'POST') {
    createPreset();
  } else if (event.httpMethod === 'DELETE') {
    removePreset();
  } else {
    return pass(500, { error: 'Invalid request' });
  }
};
