const path = require('path');

module.exports = {
  devServer: {
    compress: true,
    disableHostCheck: true,   // That solved it
  }
}