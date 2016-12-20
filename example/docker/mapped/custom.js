function customise(config, q, intercept) {
  console.log('*** This is the custom function calling!');
}

module.exports = {
  run: customise,
  config: {
    serverName: 'Robs EWD Docker Server',
    poolSize: 2
  }
};