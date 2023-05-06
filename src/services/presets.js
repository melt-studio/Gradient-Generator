import axios from 'axios';

const baseUrl = '/.netlify/functions/presets';

const getPresets = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const createPreset = async (preset) => {
  const response = await axios.post(baseUrl, { preset });
  return response.data;
};

const removePreset = async (id) => {
  // axios delete requires the data payload prefix else event.body will be undefined
  const response = await axios.delete(baseUrl, { data: { id } });
  return response.data;
};

const presetService = { getPresets, createPreset, removePreset };

export default presetService;
