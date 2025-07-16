let lastLocation = null;

module.exports = {
  setLocation: (data) => { lastLocation = data; },
  getLocation: () => lastLocation
};