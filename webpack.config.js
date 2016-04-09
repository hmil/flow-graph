module.exports = {
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.style\.html$/, exclude: /node_modules/, loader: '../tools/style-loader.js' }
    ]
  }
};
