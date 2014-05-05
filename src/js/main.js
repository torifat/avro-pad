'use strict';

$(function () {
  
  var KEY_CODE,
      avro,
      selectedIndex,
      toggleLanguage,
      $statusControl = $('#state'),
      isBN = true,
      selectedTpl = '<li class="cur" data-value="${name}">${name}</li>';

  KEY_CODE = {
    DOWN: 40,
    UP: 38,
    ESC: 27,
    TAB: 9,
    ENTER: 13,
    SPACE: 32,
    CTRL: 17,
    P: 80,
    N: 78
  };

  avro = new AvroPhonetic(
    function () {
      if (localStorage.AvroCandidateSelection) {
        return JSON.parse(localStorage.AvroCandidateSelection);
      } else {
        return {};
      }
    },
    function (cS) {
      localStorage.AvroCandidateSelection = JSON.stringify(cS);
    }
  );
  
  toggleLanguage = function () {
    isBN = !isBN;
    $statusControl.prop('checked', isBN);
  }
  
  $(document).on("keydown", function (e){
    if(e.ctrlKey && [190,110].indexOf(e.keyCode) !== -1) {
      e.preventDefault();
      toggleLanguage();
    }
  });
  
  $('textarea')
  .autosize()
  .prop('disabled', false)
  .atwho({
    at: '',
    data: {},
    tpl: '<li data-value="${name}">${name}</li>',
    start_with_space: false,
    limit: 11,
    highlight_first: false,
    callbacks: {
      //just match everything baby :3
      matcher: function (flag, subtext) {
        if (!isBN) return null; // always return null when user selects english
        var res = subtext.match(/\s?([^\s]+)$/);
        // console.log(subtext, res);
        if (res == null) return null;
        var bnregex = /[\u0980-\u09FF]+$/;
        if (bnregex.exec(res[1])) return null;
        return res[1];
      },
      // main work is done here
      filter: function (query, data, search_key) {
        // console.log(query, data, search_key);
        var bnarr = avro.suggest(query);

        bnarr.words = bnarr.words.slice(0,10);
        if (avro.candidate(query) === query) {
          bnarr.prevSelection = bnarr.words.length;
        }
        bnarr.words.push(query);
        
        selectedIndex = 0;
        return $.map(bnarr.words, function (value, i) {
          if (i === bnarr.prevSelection) selectedIndex = i;
          return {
            id: i,
            name: value
          };
        });
      },
      before_insert: function (value, li) {
        // save the selected value to user preferences;
        var qtxt = this.query.text;
        setTimeout(function () {
          avro.commit(qtxt, value);
        }, 500);
        return value;
      },
      sorter: function (query, items, search_key) {
        return items;
      },
      tpl_eval: function (tpl, map) {
        try {
          if(selectedIndex === map.id) tpl = selectedTpl;
          return tpl.replace(/\$\{([^\}]*)\}/g, function(tag, key, pos) {
            return map[key];
          });
        } catch (error) {
          return '';
        }
      }
    }
  })
  // Sorcery
  .data('atwho').on_keydown = function (e) {
    var view, _ref;
    view = (_ref = this.controller()) != null ? _ref.view : void 0;
    if (!(view && view.visible())) {
      return;
    }
    switch (e.keyCode) {
      case KEY_CODE.ESC:
        e.preventDefault();
        view.hide();
        break;
      case KEY_CODE.UP:
        e.preventDefault();
        view.prev();
        break;
      case KEY_CODE.DOWN:
        e.preventDefault();
        view.next();
        break;
      case KEY_CODE.P:
        if (!e.ctrlKey) {
          return;
        }
        e.preventDefault();
        view.prev();
        break;
      case KEY_CODE.N:
        if (!e.ctrlKey) {
          return;
        }
        e.preventDefault();
        view.next();
        break;
      case KEY_CODE.TAB:
      case KEY_CODE.ENTER:
      case KEY_CODE.SPACE:
        if (!view.visible()) {
          return;
        }
        e.preventDefault();
        view.choose();
        break;
      default:
        $.noop();
    }
  };

});
