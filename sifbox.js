var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;
    matches = [];substrRegex = new RegExp(q, 'i');
    jQuery.each(strs, function(i, str) {
      if (substrRegex.test(str.name)) matches.push(str);
      else if (substrRegex.test(str.name_translations.korean)) matches.push(str);
      else if (substrRegex.test(str.name_translations.english)) matches.push(str);
      else if (substrRegex.test(str.name_translations.chinese)) matches.push(str);
    });
    cb(matches);
  };
};
$.fn.settingbox = function(cb, template) {
  var u = this;
  $.get('https://gitcdn.xyz/repo/iebb/SIFMaps/master/maps.json', function(data) {
    $(u).typeahead({
      hint: true,
      highlight: true,
      minLength: 0
    },{
      limit: 200,
      name: 'data',
      source: substringMatcher(data),
      display: 'name',
      templates: {
        suggestion: Handlebars.compile(template)
      }
    }).on('typeahead:selected', function (obj, datum) {
      cb(datum);
    });
  })
};
