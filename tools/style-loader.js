var parse_xml = require('xml-parser');
var less = require('less');
var babel = require('babel-core');

module.exports = function(content) {
  this.cacheable();
  var callback = this.async();
  if(!callback) throw new Error('Cannot load synchronously');
  buildStyle(content, callback);
};

function buildStyle(input, cb) {
  var xml = parse_xml(input);
  var style;
  try {
    style = extractStyle(xml);
  } catch(e) {
    cb('Malformed style.');
  }


  less.render(style.less, function (e, lessc) {
    if (e) cb (e);
    else {

      var es6code = 'export const css = "' +
        lessc.css.replace(/(\\|")/g, '\\$1').replace(/(\r?\n)/g, '" +\n "') +
        '";\n' +
        style.script;

      var output;
      try {
        output = babel.transform(es6code, {
          'presets': [
            'es2015'
          ]
        }).code;
      } catch (e) {
        cb(e);
        return;
      }

      cb(null, output);
    }
  });

}

function extractStyle(xml) {
  var less, script;
  var nodes = xml.root.children;
  for (var i in nodes) {
    if (nodes[i].name === 'style') {
      less = nodes[i].content;
    } else {
      script = nodes[i].content;
    }
  }
  return {
    less: less,
    script: script
  };
}
