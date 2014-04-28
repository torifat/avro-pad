'use strict';

console.log($.fn.jquery);

var res,
    langbn = true;

$(function () {
  $('textarea').atwho({
    at: '',
    data: {},
    tpl: "<li data-value='${name}' data-select='${selected}'>${name}</li>",
    start_with_space: false,
    limit: 11,
    callbacks: {
      //just match everything baby :3
      matcher: function (flag, subtext) {
        if (!langbn) return null; // always return null when user selects english
        res = subtext.match(/\s?([^\s]+)$/);
        console.log(subtext, res);
        if (res == null) return null;
        var bnregex = /[\u0980-\u09FF]+$/;
        if (bnregex.exec(res[1])) return null;
        return res[1];
      },
      //main work is done here
      filter: function (query, data, search_key) {
        console.log(query, data, search_key);
        var bndict = [];
        bndict.push({
          id: 0,
          name: 'test',
          selected: true
        });
        bndict.push({
          id: 1,
          name: 'test1',
          selected: false
        });
        bndict.push({
          id: 2,
          name: 'test2',
          selected: false
        });
        return bndict;
      },
      before_insert: function (value, li) {
        //save the selected value to user preferences;
        var qtxt = this.query.text;
        setTimeout(function () {
          megusta.commit(qtxt, value);
        }, 500);
        return /*" " +*/ value;
      },
      // Next two callback will mess up suggestion list if not overriden.
      sorter: function (query, items, search_key) {
        return items;
      },
      highlighter: function (li, query) {
        return li;
      },
      rendered: function (ul) {
        ul.find('.cur').removeClass('cur');
        return ul.find("li[data-select=true]").addClass("cur");
      }
    }
  })
});
