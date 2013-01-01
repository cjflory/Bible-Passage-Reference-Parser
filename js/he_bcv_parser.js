(function() {
  var bcv_parser, bcv_passage, bcv_utils, root,
    __hasProp = Object.prototype.hasOwnProperty;

  root = this;

  bcv_parser = (function() {

    bcv_parser.prototype.s = "";

    bcv_parser.prototype.entities = [];

    bcv_parser.prototype.passage = null;

    bcv_parser.prototype.regexps = {};

    bcv_parser.prototype.default_options = {};

    bcv_parser.prototype.options = {
      consecutive_combination_strategy: "combine",
      osis_compaction_strategy: "b",
      book_sequence_strategy: "ignore",
      invalid_sequence_strategy: "ignore",
      sequence_combination_strategy: "combine",
      invalid_passage_strategy: "ignore",
      zero_chapter_strategy: "error",
      zero_verse_strategy: "error",
      non_latin_digits_strategy: "ignore",
      book_alone_strategy: "ignore",
      captive_end_digits_strategy: "delete",
      end_range_digits_strategy: "verse",
      include_apocrypha: false,
      versification_system: "default"
    };

    function bcv_parser() {
      var key, val, _ref;
      this.options = {};
      _ref = bcv_parser.prototype.options;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        val = _ref[key];
        this.options[key] = val;
      }
      this.versification_system(this.options.versification_system);
    }

    bcv_parser.prototype.parse = function(s) {
      var accum, entities, entity, _i, _len, _ref;
      this.reset();
      this.s = s;
      s = this.replace_control_characters(s);
      _ref = this.match_books(s), s = _ref[0], this.passage.books = _ref[1];
      entities = this.match_passages(s);
      this.entities = [];
      for (_i = 0, _len = entities.length; _i < _len; _i++) {
        entity = entities[_i];
        accum = this.passage.handle_array([entity])[0];
        this.entities = this.entities.concat(accum);
      }
      return this;
    };

    bcv_parser.prototype.reset = function() {
      this.s = "";
      this.entities = [];
      if (this.passage) {
        this.passage.books = [];
        return this.passage.indices = {};
      } else {
        this.passage = new bcv_passage;
        this.passage.options = this.options;
        return this.passage.translations = this.translations;
      }
    };

    bcv_parser.prototype.set_options = function(options) {
      var key, val, _results;
      _results = [];
      for (key in options) {
        if (!__hasProp.call(options, key)) continue;
        val = options[key];
        if (key === "include_apocrypha" || key === "versification_system") {
          _results.push(this[key](val));
        } else {
          _results.push(this.options[key] = val);
        }
      }
      return _results;
    };

    bcv_parser.prototype.include_apocrypha = function(arg) {
      if (!((arg != null) && (arg === true || arg === false))) return this;
      this.options.include_apocrypha = arg;
      this.regexps.books = this.regexps.get_books(arg);
      if (arg === true) {
        this.translations["default"].chapters.Ps[150] = this.translations["default"].chapters.Ps151[0];
      } else if (arg === false) {
        if (this.translations["default"].chapters.Ps.length === 151) {
          this.translations["default"].chapters.Ps.pop();
        }
      }
      return this;
    };

    bcv_parser.prototype.versification_system = function(system) {
      var book, chapter_list, _base, _ref;
      if (!((system != null) && (this.translations.alternates[system] != null))) {
        return this;
      }
      this.options.versification_system = system;
      if ((_base = this.translations.alternates)["default"] == null) {
        _base["default"] = {
          order: null,
          chapters: {}
        };
      }
      if (this.translations.alternates[system].order != null) {
        if (this.translations.alternates["default"].order == null) {
          this.translations.alternates["default"].order = bcv_utils.shallow_clone(this.translations["default"].order);
        }
        this.translations["default"].order = bcv_utils.shallow_clone(this.translations.alternates[system].order);
      }
      if (this.translations.alternates[system].chapters != null) {
        _ref = this.translations.alternates[system].chapters;
        for (book in _ref) {
          if (!__hasProp.call(_ref, book)) continue;
          chapter_list = _ref[book];
          if (this.translations.alternates["default"].chapters[book] == null) {
            this.translations.alternates["default"].chapters[book] = bcv_utils.shallow_clone_array(this.translations["default"].chapters[book]);
          }
          this.translations["default"].chapters[book] = bcv_utils.shallow_clone_array(chapter_list);
        }
      }
      this.include_apocrypha(this.options.include_apocrypha);
      return this;
    };

    bcv_parser.prototype.replace_control_characters = function(s) {
      s = s.replace(this.regexps.control, " ");
      if (this.options.non_latin_digits_strategy === "replace") {
        s = s.replace(/[٠۰߀०০੦૦୦0౦೦൦๐໐༠၀႐០᠐᥆᧐᪀᪐᭐᮰᱀᱐꘠꣐꤀꧐꩐꯰０]/g, "0");
        s = s.replace(/[١۱߁१১੧૧୧௧౧೧൧๑໑༡၁႑១᠑᥇᧑᪁᪑᭑᮱᱁᱑꘡꣑꤁꧑꩑꯱１]/g, "1");
        s = s.replace(/[٢۲߂२২੨૨୨௨౨೨൨๒໒༢၂႒២᠒᥈᧒᪂᪒᭒᮲᱂᱒꘢꣒꤂꧒꩒꯲２]/g, "2");
        s = s.replace(/[٣۳߃३৩੩૩୩௩౩೩൩๓໓༣၃႓៣᠓᥉᧓᪃᪓᭓᮳᱃᱓꘣꣓꤃꧓꩓꯳３]/g, "3");
        s = s.replace(/[٤۴߄४৪੪૪୪௪౪೪൪๔໔༤၄႔៤᠔᥊᧔᪄᪔᭔᮴᱄᱔꘤꣔꤄꧔꩔꯴４]/g, "4");
        s = s.replace(/[٥۵߅५৫੫૫୫௫౫೫൫๕໕༥၅႕៥᠕᥋᧕᪅᪕᭕᮵᱅᱕꘥꣕꤅꧕꩕꯵５]/g, "5");
        s = s.replace(/[٦۶߆६৬੬૬୬௬౬೬൬๖໖༦၆႖៦᠖᥌᧖᪆᪖᭖᮶᱆᱖꘦꣖꤆꧖꩖꯶６]/g, "6");
        s = s.replace(/[٧۷߇७৭੭૭୭௭౭೭൭๗໗༧၇႗៧᠗᥍᧗᪇᪗᭗᮷᱇᱗꘧꣗꤇꧗꩗꯷７]/g, "7");
        s = s.replace(/[٨۸߈८৮੮૮୮௮౮೮൮๘໘༨၈႘៨᠘᥎᧘᪈᪘᭘᮸᱈᱘꘨꣘꤈꧘꩘꯸８]/g, "8");
        s = s.replace(/[٩۹߉९৯੯૯୯௯౯೯൯๙໙༩၉႙៩᠙᥏᧙᪉᪙᭙᮹᱉᱙꘩꣙꤉꧙꩙꯹９]/g, "9");
      }
      return s;
    };

    bcv_parser.prototype.match_books = function(s) {
      var book, books, _i, _len, _ref;
      books = [];
      _ref = this.regexps.books;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        book = _ref[_i];
        s = s.replace(book.regexp, function(full, prev, bk) {
          var extra;
          books.push({
            value: bk,
            parsed: book.osis
          });
          extra = book.extra != null ? "/" + book.extra : "";
          return "" + prev + "\x1f" + (books.length - 1) + extra + "\x1f";
        });
      }
      s = s.replace(this.regexps.translations, function(match) {
        books.push({
          value: match,
          parsed: match.toLowerCase()
        });
        return "\x1e" + (books.length - 1) + "\x1e";
      });
      return [s, this.get_book_indices(books, s)];
    };

    bcv_parser.prototype.get_book_indices = function(books, s) {
      var add_index, match, re;
      add_index = 0;
      re = /([\x1f\x1e])(\d+)(?:\/[a-z])?\1/g;
      while (match = re.exec(s)) {
        books[match[2]].start_index = match.index + add_index;
        add_index += books[match[2]].value.length - match[0].length;
      }
      return books;
    };

    bcv_parser.prototype.match_passages = function(s) {
      var book_id, full, match, next_char, part, passage, passages, re, start_index_adjust;
      passages = [];
      while (match = this.regexps.escaped_passage.exec(s)) {
        full = match[0], part = match[1], book_id = match[2];
        match.index += full.length - part.length;
        if (/\s[2-9]\d\d\s*$|\s\d{4,}\s*$/.test(part)) {
          re = /\s+\d+\s*$/;
          part = part.replace(re, "");
        }
        if (!/[\d\x1f\x1e)]$/.test(part)) part = this.replace_match_end(part);
        if (this.options.captive_end_digits_strategy === "delete") {
          next_char = match.index + part.length;
          if (s.length > next_char && /^\w/.test(s.substr(next_char, 1))) {
            part = part.replace(/[\s*]+\d+$/, "");
          }
          part = part.replace(/(\x1e[)\]]?)[\s*]*\d+$/, "$1");
        }
        part = part.replace(/[A-Z]+/g, function(capitals) {
          return capitals.toLowerCase();
        });
        start_index_adjust = part.substr(0, 1 === "\x1f") ? 0 : part.split("\x1f")[0].length;
        passage = {
          value: grammar.parse(part),
          type: "base",
          start_index: this.passage.books[book_id].start_index - start_index_adjust,
          match: part
        };
        if (this.options.book_alone_strategy === "full" && passage.value.length === 1 && passage.value[0].type === "b" && start_index_adjust === 0 && this.passage.books[book_id].parsed.length === 1 && /^[234]/.test(this.passage.books[book_id].parsed[0])) {
          this.create_book_range(s, passage, book_id);
        }
        passages.push(passage);
      }
      return passages;
    };

    bcv_parser.prototype.replace_match_end = function(part) {
      var match, remove;
      remove = part.length;
      while (match = this.regexps.match_end_split.exec(part)) {
        remove = match.index + match[0].length;
      }
      if (remove < part.length) part = part.substr(0, remove);
      return part;
    };

    bcv_parser.prototype.create_book_range = function(s, passage, book_id) {
      var cases, i, limit, prev, range_regexp;
      cases = [bcv_parser.prototype.regexps.first, bcv_parser.prototype.regexps.second, bcv_parser.prototype.regexps.third];
      limit = parseInt(this.passage.books[book_id].parsed[0].substr(0, 1), 10);
      for (i = 1; 1 <= limit ? i < limit : i > limit; 1 <= limit ? i++ : i--) {
        range_regexp = i === limit - 1 ? bcv_parser.prototype.regexps.range_and : bcv_parser.prototype.regexps.range_only;
        prev = s.match(RegExp("(?:^|\\W)(" + cases[i - 1] + "\\s*" + range_regexp + "\\s*)\\x1f" + book_id + "\\x1f", "i"));
        if (prev != null) return this.add_book_range_object(passage, prev, i);
      }
      return false;
    };

    bcv_parser.prototype.add_book_range_object = function(passage, prev, start_book_number) {
      var length;
      length = prev[1].length;
      passage.value[0] = {
        type: "b_range_pre",
        value: [
          {
            type: "b_pre",
            value: start_book_number.toString(),
            indices: [prev.index, prev.index + length]
          }, passage.value[0]
        ],
        indices: [0, passage.value[0].indices[1] + length]
      };
      passage.value[0].value[1].indices[0] += length;
      passage.value[0].value[1].indices[1] += length;
      passage.start_index -= length;
      return passage.match = prev[1] + passage.match;
    };

    bcv_parser.prototype.osis = function() {
      var osis, out, _i, _len, _ref;
      out = [];
      _ref = this.parsed_entities();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        osis = _ref[_i];
        if (osis.osis.length > 0) out.push(osis.osis);
      }
      return out.join(",");
    };

    bcv_parser.prototype.osis_and_translations = function() {
      var osis, out, _i, _len, _ref;
      out = [];
      _ref = this.parsed_entities();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        osis = _ref[_i];
        if (osis.osis.length > 0) {
          out.push([osis.osis, osis.translations.join(",")]);
        }
      }
      return out;
    };

    bcv_parser.prototype.osis_and_indices = function() {
      var osis, out, _i, _len, _ref;
      out = [];
      _ref = this.parsed_entities();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        osis = _ref[_i];
        if (osis.osis.length > 0) {
          out.push({
            osis: osis.osis,
            translations: osis.translations,
            indices: osis.indices
          });
        }
      }
      return out;
    };

    bcv_parser.prototype.parsed_entities = function() {
      var entity, entity_id, i, last_i, length, osis, osises, out, passage, strings, translation, translation_alias, translation_osis, translations, _i, _j, _len, _len2, _ref, _ref2, _ref3;
      out = [];
      for (entity_id = 0, _ref = this.entities.length; 0 <= _ref ? entity_id < _ref : entity_id > _ref; 0 <= _ref ? entity_id++ : entity_id--) {
        entity = this.entities[entity_id];
        if (entity.type && entity.type === "translation_sequence" && out.length > 0 && entity_id === out[out.length - 1].entity_id + 1) {
          out[out.length - 1].indices[1] = entity.absolute_indices[1];
        }
        if (entity.passages == null) continue;
        if ((entity.type === "b" || entity.type === "b_range") && this.options.book_alone_strategy === "ignore") {
          continue;
        }
        translations = [];
        translation_alias = null;
        if (entity.passages[0].translations != null) {
          _ref2 = entity.passages[0].translations;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            translation = _ref2[_i];
            translation_osis = ((_ref3 = translation.osis) != null ? _ref3.length : void 0) > 0 ? translation.osis : "";
            if (translation_alias == null) translation_alias = translation.alias;
            translations.push(translation_osis);
          }
        } else {
          translations = [""];
          translation_alias = "default";
        }
        osises = [];
        length = entity.passages.length;
        for (i = 0; 0 <= length ? i < length : i > length; 0 <= length ? i++ : i--) {
          passage = entity.passages[i];
          if (passage.type == null) passage.type = entity.type;
          if (passage.valid.valid === false) {
            if (this.options.invalid_sequence_strategy === "ignore" && entity.type === "sequence") {
              this.snap_sequence("ignore", entity, osises, i, length);
            }
            if (this.options.invalid_passage_strategy === "ignore") continue;
          }
          if ((passage.type === "b" || passage.type === "b_range") && this.options.book_sequence_strategy === "ignore" && entity.type === "sequence") {
            this.snap_sequence("book", entity, osises, i, length);
            continue;
          }
          if (passage.absolute_indices == null) {
            passage.absolute_indices = entity.absolute_indices;
          }
          osises.push({
            osis: passage.valid.valid ? this.to_osis(passage.start, passage.end, translation_alias) : "",
            type: passage.type,
            indices: passage.absolute_indices,
            translations: translations,
            start: passage.start,
            end: passage.end,
            enclosed_indices: passage.enclosed_absolute_indices,
            entity_id: entity_id,
            entities: [passage]
          });
        }
        if (osises.length === 0) continue;
        if (osises.length > 1 && this.options.consecutive_combination_strategy === "combine") {
          osises = this.combine_consecutive_passages(osises, translation_alias);
        }
        if (this.options.sequence_combination_strategy === "separate") {
          out = out.concat(osises);
        } else {
          strings = [];
          last_i = osises.length - 1;
          if ((osises[last_i].enclosed_indices != null) && osises[last_i].enclosed_indices[1] >= 0) {
            entity.absolute_indices[1] = osises[last_i].enclosed_indices[1];
          }
          for (_j = 0, _len2 = osises.length; _j < _len2; _j++) {
            osis = osises[_j];
            if (osis.osis.length > 0) strings.push(osis.osis);
          }
          out.push({
            osis: strings.join(","),
            indices: entity.absolute_indices,
            translations: translations,
            entity_id: entity_id,
            entities: osises
          });
        }
      }
      return out;
    };

    bcv_parser.prototype.to_osis = function(start, end, translation) {
      var osis;
      if (!(end.c != null) && !(end.v != null) && start.b === end.b && !(start.c != null) && !(start.v != null) && this.options.book_alone_strategy === "first_chapter") {
        end.c = 1;
      }
      osis = {
        start: "",
        end: ""
      };
      if (start.c == null) start.c = 1;
      if (start.v == null) start.v = 1;
      if (end.c == null) {
        end.c = this.passage.translations[translation].chapters[end.b].length;
      }
      if (end.v == null) {
        end.v = this.passage.translations[translation].chapters[end.b][end.c - 1];
      }
      if (this.options.osis_compaction_strategy === "b" && start.c === 1 && start.v === 1 && end.c === this.passage.translations[translation].chapters[end.b].length && end.v === this.passage.translations[translation].chapters[end.b][end.c - 1]) {
        osis.start = start.b;
        osis.end = end.b;
      } else if (this.options.osis_compaction_strategy.length <= 2 && start.v === 1 && end.v === this.passage.translations[translation].chapters[end.b][end.c - 1]) {
        osis.start = start.b + "." + start.c.toString();
        osis.end = end.b + "." + end.c.toString();
      } else {
        osis.start = start.b + "." + start.c.toString() + "." + start.v.toString();
        osis.end = end.b + "." + end.c.toString() + "." + end.v.toString();
      }
      if (osis.start === osis.end) return osis.start;
      return osis.start + "-" + osis.end;
    };

    bcv_parser.prototype.combine_consecutive_passages = function(osises, translation) {
      var enclosed_sequence_start, i, last_i, osis, out, prev, prev_i;
      out = [];
      prev = {};
      last_i = osises.length - 1;
      enclosed_sequence_start = -1;
      for (i = 0; 0 <= last_i ? i <= last_i : i >= last_i; 0 <= last_i ? i++ : i--) {
        osis = osises[i];
        if (osis.osis.length > 0) {
          prev_i = out.length - 1;
          osis.is_enclosed_first = false;
          osis.is_enclosed_last = false;
          if (osis.enclosed_indices[0] !== enclosed_sequence_start) {
            enclosed_sequence_start = osis.enclosed_indices[0];
            if (enclosed_sequence_start >= 0) osis.is_enclosed_first = true;
          }
          if (enclosed_sequence_start >= 0 && (i === last_i || osises[i + 1].enclosed_indices[0] !== osis.enclosed_indices[0])) {
            osis.is_enclosed_last = true;
          }
          if (this.is_verse_consecutive(prev, osis.start, translation)) {
            out[prev_i].end = osis.end;
            out[prev_i].is_enclosed_last = osis.is_enclosed_last;
            out[prev_i].indices[1] = osis.indices[1];
            out[prev_i].enclosed_indices[1] = osis.enclosed_indices[1];
            out[prev_i].osis = this.to_osis(out[prev_i].start, osis.end, translation);
          } else {
            out.push(osis);
          }
          prev = {
            b: osis.end.b,
            c: osis.end.c,
            v: osis.end.v
          };
        } else {
          out.push(osis);
          prev = {};
        }
      }
      return this.snap_enclosed_indices(out);
    };

    bcv_parser.prototype.snap_enclosed_indices = function(osises) {
      var osis, _i, _len;
      for (_i = 0, _len = osises.length; _i < _len; _i++) {
        osis = osises[_i];
        if (osis.enclosed_indices[0] < 0 && osis.is_enclosed_last) {
          osis.indices[1] = osis.enclosed_indices[1];
        }
        delete osis.is_enclosed_first;
        delete osis.is_enclosed_last;
      }
      return osises;
    };

    bcv_parser.prototype.is_verse_consecutive = function(prev, check, translation) {
      var translation_order;
      if (prev.b == null) return false;
      translation_order = this.passage.translations[translation].order != null ? this.passage.translations[translation].order : this.passage.translations["default"].order;
      if (prev.b === check.b) {
        if (prev.c === check.c) {
          if (prev.v === check.v - 1) return true;
        } else if (check.v === 1 && prev.c === check.c - 1) {
          if (prev.v === this.passage.translations[translation].chapters[prev.b][prev.c - 1]) {
            return true;
          }
        }
      } else if (check.c === 1 && check.v === 1 && translation_order[prev.b] === translation_order[check.b] - 1) {
        if (prev.c === this.passage.translations[translation].chapters[prev.b].length && prev.v === this.passage.translations[translation].chapters[prev.b][prev.c - 1]) {
          return true;
        }
      }
      return false;
    };

    bcv_parser.prototype.snap_sequence = function(type, entity, osises, i, length) {
      var passage;
      passage = entity.passages[i];
      if (passage.absolute_indices[0] === entity.absolute_indices[0] && i < length - 1 && this.get_snap_sequence_i(entity.passages, i, length) !== i) {
        entity.absolute_indices[0] = entity.passages[i + 1].absolute_indices[0];
        this.remove_absolute_indices(entity.passages, i + 1);
      } else if (passage.absolute_indices[1] === entity.absolute_indices[1] && i > 0) {
        entity.absolute_indices[1] = osises.length > 0 ? osises[osises.length - 1].indices[1] : entity.passages[i - 1].absolute_indices[1];
      } else if (type === "book" && i < length - 1 && !this.starts_with_book(entity.passages[i + 1])) {
        entity.passages[i + 1].absolute_indices[0] = passage.absolute_indices[0];
      }
      return entity;
    };

    bcv_parser.prototype.get_snap_sequence_i = function(passages, i, length) {
      var j, _ref;
      for (j = _ref = i + 1; _ref <= length ? j < length : j > length; _ref <= length ? j++ : j--) {
        if (this.starts_with_book(passages[j])) return j;
        if (passages[j].valid.valid) return i;
      }
      return i;
    };

    bcv_parser.prototype.starts_with_book = function(passage) {
      if (passage.type.substr(0, 1) === "b") return true;
      if ((passage.type === "range" || passage.type === "ff") && passage.start.type.substr(0, 1) === "b") {
        return true;
      }
      return false;
    };

    bcv_parser.prototype.remove_absolute_indices = function(passages, i) {
      var end, passage, start, _i, _len, _ref, _ref2;
      if (passages[i].enclosed_absolute_indices[0] < 0) return false;
      _ref = passages[i].enclosed_absolute_indices, start = _ref[0], end = _ref[1];
      _ref2 = passages.slice(i);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        passage = _ref2[_i];
        if (passage.enclosed_absolute_indices[0] === start && passage.enclosed_absolute_indices[1] === end) {
          passage.enclosed_absolute_indices = [-1, -1];
        } else {
          break;
        }
      }
      return true;
    };

    return bcv_parser;

  })();

  root.bcv_parser = bcv_parser;

  bcv_passage = (function() {

    function bcv_passage() {}

    bcv_passage.prototype.books = [];

    bcv_passage.prototype.indices = {};

    bcv_passage.prototype.options = {};

    bcv_passage.prototype.translations = {};

    bcv_passage.prototype.handle_array = function(passages, accum, context) {
      var passage, _i, _len, _ref;
      if (accum == null) accum = [];
      if (context == null) context = {};
      for (_i = 0, _len = passages.length; _i < _len; _i++) {
        passage = passages[_i];
        if (passage.type === "stop") break;
        _ref = this.handle_obj(passage, accum, context), accum = _ref[0], context = _ref[1];
      }
      return [accum, context];
    };

    bcv_passage.prototype.handle_obj = function(passage, accum, context) {
      if ((passage.type != null) && (this[passage.type] != null)) {
        return this[passage.type](passage, accum, context);
      } else {
        return [accum, context];
      }
    };

    bcv_passage.prototype.b = function(passage, accum, context) {
      var alternates, b, obj, valid, _i, _len, _ref;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      alternates = [];
      _ref = this.books[passage.value].parsed;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        b = _ref[_i];
        valid = this.validate_ref(passage.start_context.translations, {
          b: b
        });
        obj = {
          start: {
            b: b
          },
          end: {
            b: b
          },
          valid: valid
        };
        if (passage.passages.length === 0 && valid.valid) {
          passage.passages.push(obj);
        } else {
          alternates.push(obj);
        }
      }
      if (passage.passages.length === 0) passage.passages.push(alternates.shift());
      if (alternates.length > 0) passage.passages[0].alternates = alternates;
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      context = {
        b: passage.passages[0].start.b
      };
      if (passage.start_context.translations != null) {
        context.translations = passage.start_context.translations;
      }
      return [accum, context];
    };

    bcv_passage.prototype.b_range = function(passage, accum, context) {
      return this.range(passage, accum, context);
    };

    bcv_passage.prototype.b_range_pre = function(passage, accum, context) {
      var alternates, book, end, start_obj, _ref, _ref2;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      alternates = [];
      book = this.pluck("b", passage.value);
      _ref = this.b(book, [], context), (_ref2 = _ref[0], end = _ref2[0]), context = _ref[1];
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      start_obj = {
        b: passage.value[0].value + end.passages[0].start.b.substr(1),
        type: "b"
      };
      passage.passages = [
        {
          start: start_obj,
          end: end.passages[0].end,
          valid: end.passages[0].valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.base = function(passage, accum, context) {
      this.indices = this.calculate_indices(passage.match, passage.start_index);
      return this.handle_array(passage.value, accum, context);
    };

    bcv_passage.prototype.bc = function(passage, accum, context) {
      var alternates, b, c, context_key, obj, type, valid, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      _ref = ["b", "c", "v"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        delete context[type];
      }
      c = this.pluck("c", passage.value).value;
      alternates = [];
      _ref2 = this.books[this.pluck("b", passage.value).value].parsed;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        b = _ref2[_j];
        context_key = "c";
        valid = this.validate_ref(passage.start_context.translations, {
          b: b,
          c: c
        });
        obj = {
          start: {
            b: b
          },
          end: {
            b: b
          },
          valid: valid
        };
        if (valid.messages.start_chapter_not_exist_in_single_chapter_book) {
          obj.valid = this.validate_ref(passage.start_context.translations, {
            b: b,
            v: c
          });
          obj.start.c = 1;
          obj.end.c = 1;
          context_key = "v";
        }
        obj.start[context_key] = c;
        _ref3 = this.fix_start_zeroes(obj.valid, obj.start.c, obj.start.v), obj.start.c = _ref3[0], obj.start.v = _ref3[1];
        obj.end[context_key] = obj.start[context_key];
        if (passage.passages.length === 0 && obj.valid.valid) {
          passage.passages.push(obj);
        } else {
          alternates.push(obj);
        }
      }
      if (passage.passages.length === 0) passage.passages.push(alternates.shift());
      if (alternates.length > 0) passage.passages[0].alternates = alternates;
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      _ref4 = ["b", "c", "v"];
      for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
        type = _ref4[_k];
        if (passage.passages[0].start[type] != null) {
          context[type] = passage.passages[0].start[type];
        }
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.bc_title = function(passage, accum, context) {
      var bc, i, title, _ref, _ref2, _ref3;
      passage.start_context = bcv_utils.shallow_clone(context);
      _ref = this.bc(this.pluck("bc", passage.value), [], context), (_ref2 = _ref[0], bc = _ref2[0]), context = _ref[1];
      if (bc.passages[0].start.b !== "Ps" && (bc.passages[0].alternates != null)) {
        for (i = 0, _ref3 = bc.passages[0].alternates.length; 0 <= _ref3 ? i < _ref3 : i > _ref3; 0 <= _ref3 ? i++ : i--) {
          if (bc.passages[0].alternates[i].start.b !== "Ps") continue;
          bc.passages[0] = bc.passages[0].alternates[i];
          break;
        }
      }
      if (bc.passages[0].start.b !== "Ps") {
        accum.push(bc);
        return [accum, context];
      }
      this.books[this.pluck("b", bc.value).value].parsed = ["Ps"];
      title = this.pluck("title", passage.value);
      passage.value[1] = {
        type: "v",
        value: [
          {
            type: "integer",
            value: 1,
            indices: title.indices
          }
        ],
        indices: title.indices
      };
      passage.original_type = "bc_title";
      passage.type = "bcv";
      return this.bcv(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.bcv = function(passage, accum, context) {
      var alternates, b, bc, c, obj, type, v, valid, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      _ref = ["b", "c", "v"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        delete context[type];
      }
      bc = this.pluck("bc", passage.value);
      c = this.pluck("c", bc.value).value;
      v = this.pluck("v", passage.value).value;
      alternates = [];
      _ref2 = this.books[this.pluck("b", bc.value).value].parsed;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        b = _ref2[_j];
        valid = this.validate_ref(passage.start_context.translations, {
          b: b,
          c: c,
          v: v
        });
        _ref3 = this.fix_start_zeroes(valid, c, v), c = _ref3[0], v = _ref3[1];
        obj = {
          start: {
            b: b,
            c: c,
            v: v
          },
          end: {
            b: b,
            c: c,
            v: v
          },
          valid: valid
        };
        if (passage.passages.length === 0 && valid.valid) {
          passage.passages.push(obj);
        } else {
          alternates.push(obj);
        }
      }
      if (passage.passages.length === 0) passage.passages.push(alternates.shift());
      if (alternates.length > 0) passage.passages[0].alternates = alternates;
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      _ref4 = ["b", "c", "v"];
      for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
        type = _ref4[_k];
        if (passage.passages[0].start[type] != null) {
          context[type] = passage.passages[0].start[type];
        }
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.bv = function(passage, accum, context) {
      var b, bcv, v, _ref, _ref2, _ref3;
      passage.start_context = bcv_utils.shallow_clone(context);
      _ref = passage.value, b = _ref[0], v = _ref[1];
      bcv = {
        indices: passage.indices,
        value: [
          {
            type: "bc",
            value: [
              b, {
                type: "c",
                value: [
                  {
                    type: "integer",
                    value: 1
                  }
                ]
              }
            ]
          }, v
        ]
      };
      _ref2 = this.bcv(bcv, [], context), (_ref3 = _ref2[0], bcv = _ref3[0]), context = _ref2[1];
      passage.passages = bcv.passages;
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.c = function(passage, accum, context) {
      var c, valid;
      passage.start_context = bcv_utils.shallow_clone(context);
      c = passage.type === "integer" ? passage.value : this.pluck("integer", passage.value).value;
      valid = this.validate_ref(passage.start_context.translations, {
        b: context.b,
        c: c
      });
      if (!valid.valid && valid.messages.start_chapter_not_exist_in_single_chapter_book) {
        return this.v(passage, accum, context);
      }
      c = this.fix_start_zeroes(valid, c)[0];
      passage.passages = [
        {
          start: {
            b: context.b,
            c: c
          },
          end: {
            b: context.b,
            c: c
          },
          valid: valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      accum.push(passage);
      context.c = c;
      delete context.v;
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      return [accum, context];
    };

    bcv_passage.prototype.c_psalm = function(passage, accum, context) {
      var c;
      passage.original_type = passage.type;
      passage.original_value = passage.value;
      passage.type = "bc";
      c = this.books[passage.value].value.match(/^\d+/)[0];
      passage.value = [
        {
          type: "b",
          value: passage.original_value,
          indices: passage.indices
        }, {
          type: "c",
          value: [
            {
              type: "integer",
              value: c,
              indices: passage.indices
            }
          ],
          indices: passage.indices
        }
      ];
      return this.bc(passage, accum, context);
    };

    bcv_passage.prototype.c_title = function(passage, accum, context) {
      var title;
      passage.start_context = bcv_utils.shallow_clone(context);
      if (context.b !== "Ps") return this.c(passage.value[0], accum, context);
      title = this.pluck("title", passage.value);
      passage.value[1] = {
        type: "v",
        value: [
          {
            type: "integer",
            value: 1,
            indices: title.indices
          }
        ],
        indices: title.indices
      };
      passage.original_type = "c_title";
      passage.type = "cv";
      return this.cv(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.cv = function(passage, accum, context) {
      var c, v, valid, _ref;
      passage.start_context = bcv_utils.shallow_clone(context);
      c = this.pluck("c", passage.value).value;
      v = this.pluck("v", passage.value).value;
      valid = this.validate_ref(passage.start_context.translations, {
        b: context.b,
        c: c,
        v: v
      });
      _ref = this.fix_start_zeroes(valid, c, v), c = _ref[0], v = _ref[1];
      passage.passages = [
        {
          start: {
            b: context.b,
            c: c,
            v: v
          },
          end: {
            b: context.b,
            c: c,
            v: v
          },
          valid: valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      accum.push(passage);
      context.c = c;
      context.v = v;
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      return [accum, context];
    };

    bcv_passage.prototype.cb_range = function(passage, accum, context) {
      var b, end_c, start_c, _ref;
      passage.original_type = passage.type;
      passage.type = "range";
      _ref = passage.value, b = _ref[0], start_c = _ref[1], end_c = _ref[2];
      passage.original_value = [b, start_c, end_c];
      passage.value = [
        {
          type: "bc",
          value: [b, start_c],
          indices: passage.indices
        }, end_c
      ];
      end_c.indices[1] = passage.indices[1];
      return this.range(passage, accum, context);
    };

    bcv_passage.prototype.cv_psalm = function(passage, accum, context) {
      var bc, c_psalm, v, _ref;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.original_type = passage.type;
      passage.original_value = passage.value;
      _ref = passage.value, c_psalm = _ref[0], v = _ref[1];
      passage.type = "bcv";
      bc = this.c_psalm(c_psalm, [], passage.start_context)[0][0];
      passage.value = [bc, v];
      return this.bcv(passage, accum, context);
    };

    bcv_passage.prototype.ff = function(passage, accum, context) {
      var _ref, _ref2;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.value.push({
        type: "integer",
        indices: passage.indices,
        value: 999
      });
      _ref = this.range(passage, [], passage.start_context), (_ref2 = _ref[0], passage = _ref2[0]), context = _ref[1];
      passage.value.pop();
      if (passage.passages[0].valid.end_verse_not_exist != null) {
        delete passage.passages[0].valid.end_verse_not_exist;
      }
      if (passage.passages[0].valid.end_chapter_not_exist != null) {
        delete passage.passages[0].valid.end_chapter_not_exist;
      }
      if (passage.passages[0].end.original_c != null) {
        delete passage.passages[0].end.original_c;
      }
      accum.push(passage);
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      return [accum, context];
    };

    bcv_passage.prototype.integer_title = function(passage, accum, context) {
      var v_indices;
      passage.start_context = bcv_utils.shallow_clone(context);
      if (context.b !== "Ps") {
        return this.integer(passage.value[0], accum, context);
      }
      passage.value[0] = {
        type: "c",
        value: [passage.value[0]],
        indices: [passage.value[0].indices[0], passage.value[0].indices[1]]
      };
      v_indices = [passage.indices[1] - 5, passage.indices[1]];
      passage.value[1] = {
        type: "v",
        value: [
          {
            type: "integer",
            value: 1,
            indices: v_indices
          }
        ],
        indices: v_indices
      };
      passage.original_type = "integer_title";
      passage.type = "cv";
      return this.cv(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.integer = function(passage, accum, context) {
      if (context.v != null) return this.v(passage, accum, context);
      return this.c(passage, accum, context);
    };

    bcv_passage.prototype.sequence = function(passage, accum, context) {
      var obj, psg, sub_psg, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4;
      passage.start_context = bcv_utils.shallow_clone(context);
      passage.passages = [];
      _ref = passage.value;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        _ref2 = this.handle_array(obj, [], context), (_ref3 = _ref2[0], psg = _ref3[0]), context = _ref2[1];
        _ref4 = psg.passages;
        for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
          sub_psg = _ref4[_j];
          if (sub_psg.type == null) sub_psg.type = psg.type;
          if (sub_psg.absolute_indices == null) {
            sub_psg.absolute_indices = psg.absolute_indices;
          }
          if (psg.start_context.translations != null) {
            sub_psg.translations = psg.start_context.translations;
          }
          sub_psg.enclosed_absolute_indices = psg.type === "sequence_post_enclosed" ? psg.absolute_indices : [-1, -1];
          passage.passages.push(sub_psg);
        }
      }
      if (passage.absolute_indices == null) {
        if (passage.passages.length > 0 && passage.type === "sequence") {
          passage.absolute_indices = [passage.passages[0].absolute_indices[0], passage.passages[passage.passages.length - 1].absolute_indices[1]];
        } else {
          passage.absolute_indices = this.get_absolute_indices(passage.indices);
        }
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.sequence_post_enclosed = function(passage, accum, context) {
      return this.sequence(passage, accum, context);
    };

    bcv_passage.prototype.v = function(passage, accum, context) {
      var c, no_c, v, valid, _ref;
      v = passage.type === "integer" ? passage.value : this.pluck("integer", passage.value).value;
      passage.start_context = bcv_utils.shallow_clone(context);
      c = context.c != null ? context.c : 1;
      valid = this.validate_ref(passage.start_context.translations, {
        b: context.b,
        c: c,
        v: v
      });
      _ref = this.fix_start_zeroes(valid, 0, v), no_c = _ref[0], v = _ref[1];
      passage.passages = [
        {
          start: {
            b: context.b,
            c: c,
            v: v
          },
          end: {
            b: context.b,
            c: c,
            v: v
          },
          valid: valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      context.v = v;
      return [accum, context];
    };

    bcv_passage.prototype.range = function(passage, accum, context) {
      var end, end_obj, new_end, start, start_obj, temp_valid, temp_value, valid, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      passage.start_context = bcv_utils.shallow_clone(context);
      _ref = passage.value, start = _ref[0], end = _ref[1];
      if (end.type === "v" && (start.type === "bc" || start.type === "c") && this.options.end_range_digits_strategy === "verse") {
        return this.range_change_integer_end(passage, accum);
      }
      _ref2 = this.handle_obj(start, [], context), (_ref3 = _ref2[0], start = _ref3[0]), context = _ref2[1];
      _ref4 = this.handle_obj(end, [], context), (_ref5 = _ref4[0], end = _ref5[0]), context = _ref4[1];
      passage.value = [start, end];
      passage.indices = [start.indices[0], end.indices[1]];
      delete passage.absolute_indices;
      start_obj = {
        b: start.passages[0].start.b,
        c: start.passages[0].start.c,
        v: start.passages[0].start.v,
        type: start.type
      };
      end_obj = {
        b: end.passages[0].end.b,
        c: end.passages[0].end.c,
        v: end.passages[0].end.v,
        type: end.type
      };
      if (end.passages[0].valid.messages.start_chapter_is_zero) end_obj.c = 0;
      if (end.passages[0].valid.messages.start_verse_is_zero) end_obj.v = 0;
      valid = this.validate_ref(passage.start_context.translations, start_obj, end_obj);
      if (valid.valid) {
        if (valid.messages.end_chapter_not_exist && this.options.end_range_digits_strategy === "verse" && !(start_obj.v != null) && (end.type === "integer" || end.type === "v")) {
          temp_value = end.type === "v" ? this.pluck("integer", end.value) : end.value;
          temp_valid = this.validate_ref(passage.start_context.translations, {
            b: start_obj.b,
            c: start_obj.c,
            v: temp_value
          });
          if (temp_valid.valid) {
            return this.range_change_integer_end(passage, accum);
          }
        }
        if (valid.messages.end_chapter_not_exist && this.options.end_range_digits_strategy === "verse" && (start_obj.v != null) && end.type === "cv") {
          temp_valid = this.validate_ref(passage.start_context.translations, {
            b: end_obj.b,
            c: start_obj.c,
            v: end_obj.c
          });
          if (temp_valid.valid) {
            temp_valid = this.validate_ref(passage.start_context.translations, {
              b: end_obj.b,
              c: start_obj.c,
              v: end_obj.v
            });
          }
          if (temp_valid.valid) return this.range_change_cv_end(passage, accum);
        }
        this.range_validate(valid, start_obj, end_obj, passage);
      } else {
        if ((valid.messages.end_chapter_before_start || valid.messages.end_verse_before_start) && (end.type === "integer" || end.type === "v") || (valid.messages.end_chapter_before_start && end.type === "cv")) {
          new_end = this.range_check_new_end(passage.start_context.translations, start_obj, end_obj, valid);
          if (new_end > 0) return this.range_change_end(passage, accum, new_end);
        }
        if (this.options.end_range_digits_strategy === "verse" && start_obj.v === void 0 && (end.type === "integer" || end.type === "v")) {
          temp_value = end.type === "v" ? this.pluck("integer", end.value) : end.value;
          temp_valid = this.validate_ref(passage.start_context.translations, {
            b: start_obj.b,
            c: start_obj.c,
            v: temp_value
          });
          if (temp_valid.valid) {
            return this.range_change_integer_end(passage, accum);
          }
        }
        _ref6 = [passage.type, "sequence"], passage.original_type = _ref6[0], passage.type = _ref6[1];
        _ref7 = [[start, end], [[start], [end]]], passage.original_value = _ref7[0], passage.value = _ref7[1];
        return this.handle_obj(passage, accum, passage.start_context);
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      passage.passages = [
        {
          start: start_obj,
          end: end_obj,
          valid: valid
        }
      ];
      if (passage.start_context.translations != null) {
        passage.passages[0].translations = passage.start_context.translations;
      }
      accum.push(passage);
      return [accum, context];
    };

    bcv_passage.prototype.range_change_end = function(passage, accum, new_end) {
      var end, new_obj, start, _ref;
      _ref = passage.value, start = _ref[0], end = _ref[1];
      if (end.type === "integer") {
        end.original_value = end.value;
        end.value = new_end;
      } else if (end.type === "v") {
        new_obj = this.pluck("integer", end.value);
        new_obj.original_value = new_obj.value;
        new_obj.value = new_end;
      } else if (end.type === "cv") {
        new_obj = this.pluck("c", end.value);
        new_obj.original_value = new_obj.value;
        new_obj.value = new_end;
      }
      return this.handle_obj(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.range_change_integer_end = function(passage, accum) {
      var end, start, _ref;
      _ref = passage.value, start = _ref[0], end = _ref[1];
      passage.original_type = passage.type;
      passage.original_value = [start, end];
      passage.type = start.type === "integer" ? "cv" : start.type + "v";
      if (start.type === "integer") {
        passage.value[0] = {
          type: "c",
          value: [start],
          indices: start.indices
        };
      }
      if (end.type === "integer") {
        passage.value[1] = {
          type: "v",
          value: [end],
          indices: end.indices
        };
      }
      return this.handle_obj(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.range_change_cv_end = function(passage, accum) {
      var end, new_range_end, new_sequence_end, start, _ref, _ref2;
      _ref = passage.value, start = _ref[0], end = _ref[1];
      passage.original_type = passage.type;
      passage.original_value = [start, end];
      passage.type = "sequence";
      _ref2 = end.value, new_range_end = _ref2[0], new_sequence_end = _ref2[1];
      new_range_end = bcv_utils.shallow_clone(new_range_end);
      new_range_end.original_type = new_range_end.type;
      new_range_end.type = "v";
      passage.value = [
        [
          {
            type: "range",
            value: [start, new_range_end],
            indices: [start.indices[0], new_range_end.indices[1]]
          }
        ], [new_sequence_end]
      ];
      return this.sequence(passage, accum, passage.start_context);
    };

    bcv_passage.prototype.range_validate = function(valid, start_obj, end_obj, passage) {
      var _ref;
      if (valid.messages.end_chapter_not_exist) {
        end_obj.original_c = end_obj.c;
        end_obj.c = valid.messages.end_chapter_not_exist;
        if (end_obj.v != null) {
          end_obj.v = this.validate_ref(passage.start_context.translations, {
            b: end_obj.b,
            c: end_obj.c,
            v: 999
          }).messages.end_verse_not_exist;
        }
      } else if (valid.messages.end_verse_not_exist) {
        end_obj.original_v = end_obj.v;
        end_obj.v = valid.messages.end_verse_not_exist;
      }
      if (valid.messages.end_verse_is_zero && this.options.zero_verse_strategy !== "allow") {
        end_obj.v = valid.messages.end_verse_is_zero;
      }
      if (valid.messages.end_chapter_is_zero) {
        end_obj.c = valid.messages.end_chapter_is_zero;
      }
      _ref = this.fix_start_zeroes(valid, start_obj.c, start_obj.v), start_obj.c = _ref[0], start_obj.v = _ref[1];
      return true;
    };

    bcv_passage.prototype.fix_start_zeroes = function(valid, c, v) {
      if (valid.valid) {
        if (valid.messages.start_chapter_is_zero) {
          c = valid.messages.start_chapter_is_zero;
        }
        if (valid.messages.start_verse_is_zero && this.options.zero_verse_strategy !== "allow") {
          v = valid.messages.start_verse_is_zero;
        }
      }
      return [c, v];
    };

    bcv_passage.prototype.range_check_new_end = function(translations, start_obj, end_obj, valid) {
      var new_end, new_valid, obj_to_validate, type;
      new_end = 0;
      type = null;
      if (valid.messages.end_chapter_before_start) {
        type = "c";
      } else if (valid.messages.end_verse_before_start) {
        type = "v";
      }
      if (type != null) {
        new_end = this.range_get_new_end_value(start_obj, end_obj, valid, type);
      }
      if (new_end > 0) {
        obj_to_validate = {
          b: end_obj.b,
          c: end_obj.c,
          v: end_obj.v
        };
        obj_to_validate[type] = new_end;
        new_valid = this.validate_ref(translations, obj_to_validate);
        if (!new_valid.valid) new_end = 0;
      }
      return new_end;
    };

    bcv_passage.prototype.range_get_new_end_value = function(start_obj, end_obj, valid, key) {
      var new_end;
      new_end = 0;
      if ((key === "c" && valid.messages.end_chapter_is_zero) || (key === "v" && valid.messages.end_verse_is_zero)) {
        return new_end;
      }
      if (start_obj[key] >= 10 && end_obj[key] < 10 && start_obj[key] - 10 * Math.floor(start_obj[key] / 10) < end_obj[key]) {
        new_end = end_obj[key] + 10 * Math.floor(start_obj[key] / 10);
      } else if (start_obj[key] >= 100 && end_obj[key] < 100 && start_obj[key] - 100 < end_obj[key]) {
        new_end = end_obj[key] + 100;
      }
      return new_end;
    };

    bcv_passage.prototype.translation_sequence = function(passage, accum, context) {
      var i, new_accum, translation, translations, use_i, val, _i, _j, _len, _len2, _ref, _ref2, _ref3;
      translations = [];
      translations.push({
        translation: this.books[passage.value[0].value].parsed
      });
      _ref = passage.value[1];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        val = _ref[_i];
        val = this.books[this.pluck("translation", val).value].parsed;
        if (val != null) {
          translations.push({
            translation: val
          });
        }
      }
      for (_j = 0, _len2 = translations.length; _j < _len2; _j++) {
        translation = translations[_j];
        if (this.translations.aliases[translation.translation] != null) {
          translation.alias = this.translations.aliases[translation.translation].alias;
          translation.osis = this.translations.aliases[translation.translation].osis;
        } else {
          translation.alias = "default";
          translation.osis = translation.translation.toUpperCase();
        }
      }
      if (accum.length > 0) {
        use_i = 0;
        for (i = _ref2 = accum.length - 1; _ref2 <= 0 ? i <= 0 : i >= 0; _ref2 <= 0 ? i++ : i--) {
          if (accum[i].original_type != null) {
            accum[i].type = accum[i].original_type;
          }
          if (accum[i].original_value != null) {
            accum[i].value = accum[i].original_value;
          }
          if (accum[i].type !== "translation_sequence") continue;
          use_i = i + 1;
          break;
        }
        if (use_i < accum.length) {
          accum[use_i].start_context.translations = translations;
          _ref3 = this.handle_array(accum.slice(use_i), [], accum[use_i].start_context), new_accum = _ref3[0], context = _ref3[1];
        }
      }
      if (passage.absolute_indices == null) {
        passage.absolute_indices = this.get_absolute_indices(passage.indices);
      }
      accum.push(passage);
      delete context.translations;
      return [accum, context];
    };

    bcv_passage.prototype.pluck = function(type, passages) {
      var passage, _i, _len;
      for (_i = 0, _len = passages.length; _i < _len; _i++) {
        passage = passages[_i];
        if (!((passage.type != null) && passage.type === type)) continue;
        if (type === "c" || type === "v") {
          return this.pluck("integer", passage.value);
        }
        return passage;
      }
      return null;
    };

    bcv_passage.prototype.calculate_indices = function(match, adjust) {
      var character, end_index, indices, match_index, part, part_length, parts, switch_type, temp, _i, _j, _k, _len, _len2, _len3, _ref;
      switch_type = "book";
      indices = [];
      match_index = 0;
      adjust = parseInt(adjust, 10);
      parts = [match];
      _ref = ["\x1e", "\x1f"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        temp = [];
        for (_j = 0, _len2 = parts.length; _j < _len2; _j++) {
          part = parts[_j];
          temp = temp.concat(part.split(character));
        }
        parts = temp;
      }
      for (_k = 0, _len3 = parts.length; _k < _len3; _k++) {
        part = parts[_k];
        switch_type = switch_type === "book" ? "rest" : "book";
        part_length = part.length;
        if (part_length === 0) continue;
        if (switch_type === "book") {
          part = part.replace(/\/[a-z]$/, "");
          end_index = match_index + part_length;
          if (indices.length > 0 && indices[indices.length - 1].index === adjust) {
            indices[indices.length - 1].end = end_index;
          } else {
            indices.push({
              start: match_index,
              end: end_index,
              index: adjust
            });
          }
          match_index += part_length + 2;
          adjust = this.books[part].start_index + this.books[part].value.length - match_index;
          indices.push({
            start: end_index + 1,
            end: end_index + 1,
            index: adjust
          });
        } else {
          end_index = match_index + part_length - 1;
          if (indices.length > 0 && indices[indices.length - 1].index === adjust) {
            indices[indices.length - 1].end = end_index;
          } else {
            indices.push({
              start: match_index,
              end: end_index,
              index: adjust
            });
          }
          match_index += part_length;
        }
      }
      return indices;
    };

    bcv_passage.prototype.get_absolute_indices = function(_arg) {
      var end, end_out, index, start, start_out, _i, _len, _ref;
      start = _arg[0], end = _arg[1];
      start_out = null;
      end_out = null;
      _ref = this.indices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        index = _ref[_i];
        if (start_out === null && (index.start <= start && start <= index.end)) {
          start_out = start + index.index;
        }
        if ((index.start <= end && end <= index.end)) {
          end_out = end + index.index + 1;
          break;
        }
      }
      return [start_out, end_out];
    };

    bcv_passage.prototype.validate_ref = function(translations, start, end) {
      var messages, translation, valid, _ref, _ref2;
      translations || (translations = [
        {
          translation: "default",
          osis: "",
          alias: "default"
        }
      ]);
      translation = translations[0];
      if (translation == null) {
        return {
          valid: false,
          messages: {
            translation_invalid: true
          }
        };
      }
      valid = true;
      messages = {};
      if (translation.alias == null) translation.alias = "default";
      if (translation.alias == null) {
        return {
          valid: false,
          messages: {
            translation_invalid: true
          }
        };
      }
      if (this.translations.aliases[translation.alias] == null) {
        translation.alias = "default";
        messages.translation_unknown = true;
      }
      _ref = this.validate_start_ref(translation.alias, start, valid, messages), valid = _ref[0], messages = _ref[1];
      if (end) {
        _ref2 = this.validate_end_ref(translation.alias, start, end, valid, messages), valid = _ref2[0], messages = _ref2[1];
      }
      return {
        valid: valid,
        messages: messages
      };
    };

    bcv_passage.prototype.validate_start_ref = function(translation, start, valid, messages) {
      var translation_order, _ref, _ref2;
      if (translation !== "default" && !(((_ref = this.translations[translation]) != null ? _ref.chapters[start.b] : void 0) != null)) {
        this.promote_book_to_translation(start.b, translation);
      }
      translation_order = ((_ref2 = this.translations[translation]) != null ? _ref2.order : void 0) != null ? translation : "default";
      if (this.translations[translation_order].order[start.b] != null) {
        if (start.c == null) start.c = 1;
        start.c = parseInt(start.c, 10);
        if (isNaN(start.c)) {
          valid = false;
          messages.start_chapter_not_numeric = true;
          return [valid, messages];
        }
        if (start.c === 0) {
          messages.start_chapter_is_zero = 1;
          if (this.options.zero_chapter_strategy === "error") {
            valid = false;
          } else {
            start.c = 1;
          }
        }
        if (start.c > 0 && (this.translations[translation].chapters[start.b][start.c - 1] != null)) {
          if (start.v != null) {
            start.v = parseInt(start.v, 10);
            if (isNaN(start.v)) {
              valid = false;
              messages.start_verse_not_numeric = true;
            } else if (start.v === 0) {
              messages.start_verse_is_zero = 1;
              if (this.options.zero_verse_strategy === "error") {
                valid = false;
              } else if (this.options.zero_verse_strategy === "upgrade") {
                start.v = 1;
              }
            } else if (start.v > this.translations[translation].chapters[start.b][start.c - 1]) {
              valid = false;
              messages.start_verse_not_exist = this.translations[translation].chapters[start.b][start.c - 1];
            }
          }
        } else {
          valid = false;
          if (start.c !== 1 && this.translations[translation].chapters[start.b].length === 1) {
            messages.start_chapter_not_exist_in_single_chapter_book = 1;
          } else if (start.c > 0) {
            messages.start_chapter_not_exist = this.translations[translation].chapters[start.b].length;
          }
        }
      } else {
        valid = false;
        messages.start_book_not_exist = true;
      }
      return [valid, messages];
    };

    bcv_passage.prototype.validate_end_ref = function(translation, start, end, valid, messages) {
      var translation_order, _ref, _ref2;
      if (translation !== "default" && !(((_ref = this.translations[translation]) != null ? _ref.chapters[end.b] : void 0) != null)) {
        this.promote_book_to_translation(end.b, translation);
      }
      translation_order = ((_ref2 = this.translations[translation]) != null ? _ref2.order : void 0) != null ? translation : "default";
      if (end.c != null) end.c = parseInt(end.c, 10);
      if (end.v != null) end.v = parseInt(end.v, 10);
      if ((end.c != null) && !(isNaN(end.c)) && end.c === 0) {
        messages.end_chapter_is_zero = 1;
        if (this.options.zero_chapter_strategy === "error") {
          valid = false;
        } else {
          end.c = 1;
        }
      }
      if (this.translations[translation_order].order[end.b] != null) {
        if ((this.translations[translation_order].order[start.b] != null) && this.translations[translation_order].order[start.b] > this.translations[translation_order].order[end.b]) {
          valid = false;
          messages.end_book_before_start = true;
        }
        if (start.b === end.b && (end.c != null) && !isNaN(end.c)) {
          if (start.c == null) start.c = 1;
          if (!isNaN(parseInt(start.c, 10)) && start.c > end.c) {
            valid = false;
            messages.end_chapter_before_start = true;
          } else if (start.c === end.c && (end.v != null) && !isNaN(end.v)) {
            if (start.v == null) start.v = 1;
            if (!isNaN(parseInt(start.v, 10)) && start.v > end.v) {
              valid = false;
              messages.end_verse_before_start = true;
            }
          }
        }
        if ((end.c != null) && !isNaN(end.c)) {
          if (!(this.translations[translation].chapters[end.b][end.c - 1] != null)) {
            if (this.translations[translation].chapters[end.b].length === 1) {
              messages.end_chapter_not_exist_in_single_chapter_book = 1;
            } else if (end.c > 0) {
              messages.end_chapter_not_exist = this.translations[translation].chapters[end.b].length;
            }
          }
        }
        if ((end.v != null) && !isNaN(end.v)) {
          if (end.c == null) {
            end.c = this.translations[translation].chapters[end.b].length;
          }
          if (end.v > this.translations[translation].chapters[end.b][end.c - 1]) {
            messages.end_verse_not_exist = this.translations[translation].chapters[end.b][end.c - 1];
          } else if (end.v === 0) {
            messages.end_verse_is_zero = 1;
            if (this.options.zero_verse_strategy === "error") {
              valid = false;
            } else if (this.options.zero_verse_strategy === "upgrade") {
              end.v = 1;
            }
          }
        }
      } else {
        valid = false;
        messages.end_book_not_exist = true;
      }
      if ((end.c != null) && isNaN(end.c)) {
        valid = false;
        messages.end_chapter_not_numeric = true;
      }
      if ((end.v != null) && isNaN(end.v)) {
        valid = false;
        messages.end_verse_not_numeric = true;
      }
      return [valid, messages];
    };

    bcv_passage.prototype.promote_book_to_translation = function(book, translation) {
      var _base, _base2, _ref, _ref2;
      if ((_base = this.translations)[translation] == null) {
        _base[translation] = {};
      }
      if ((_base2 = this.translations[translation]).chapters == null) {
        _base2.chapters = {};
      }
      if (((_ref = this.translations.alternates[translation]) != null ? (_ref2 = _ref.chapters) != null ? _ref2[book] : void 0 : void 0) != null) {
        return this.translations[translation].chapters[book] = this.translations.alternates[translation].chapters[book];
      } else {
        return this.translations[translation].chapters[book] = bcv_utils.shallow_clone_array(this.translations["default"].chapters[book]);
      }
    };

    return bcv_passage;

  })();

  bcv_utils = {
    shallow_clone: function(obj) {
      var key, out, val;
      if (obj == null) return obj;
      out = {};
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        val = obj[key];
        out[key] = val;
      }
      return out;
    },
    shallow_clone_array: function(arr) {
      var i, out, _ref;
      if (arr == null) return arr;
      out = [];
      for (i = 0, _ref = arr.length; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        if (typeof arr[i] !== "undefined") out[i] = arr[i];
      }
      return out;
    }
  };

  bcv_parser.prototype.regexps.translations = /(?:WLC)\b/gi;

  bcv_parser.prototype.translations = {
    aliases: {
      wlc: {
        osis: "WLC",
        alias: "default"
      },
      "default": {
        osis: "",
        alias: "default"
      }
    },
    "default": {
      order: {
        "Gen": 1,
        "Exod": 2,
        "Lev": 3,
        "Num": 4,
        "Deut": 5,
        "Josh": 6,
        "Judg": 7,
        "Ruth": 8,
        "1Sam": 9,
        "2Sam": 10,
        "1Kgs": 11,
        "2Kgs": 12,
        "1Chr": 13,
        "2Chr": 14,
        "Ezra": 15,
        "Neh": 16,
        "Esth": 17,
        "Job": 18,
        "Ps": 19,
        "Prov": 20,
        "Eccl": 21,
        "Song": 22,
        "Isa": 23,
        "Jer": 24,
        "Lam": 25,
        "Ezek": 26,
        "Dan": 27,
        "Hos": 28,
        "Joel": 29,
        "Amos": 30,
        "Obad": 31,
        "Jonah": 32,
        "Mic": 33,
        "Nah": 34,
        "Hab": 35,
        "Zeph": 36,
        "Hag": 37,
        "Zech": 38,
        "Mal": 39,
        "Matt": 40,
        "Mark": 41,
        "Luke": 42,
        "John": 43,
        "Acts": 44,
        "Rom": 45,
        "1Cor": 46,
        "2Cor": 47,
        "Gal": 48,
        "Eph": 49,
        "Phil": 50,
        "Col": 51,
        "1Thess": 52,
        "2Thess": 53,
        "1Tim": 54,
        "2Tim": 55,
        "Titus": 56,
        "Phlm": 57,
        "Heb": 58,
        "Jas": 59,
        "1Pet": 60,
        "2Pet": 61,
        "1John": 62,
        "2John": 63,
        "3John": 64,
        "Jude": 65,
        "Rev": 66,
        "Tob": 67,
        "Jdt": 68,
        "GkEsth": 69,
        "Wis": 70,
        "Sir": 71,
        "Bar": 72,
        "PrAzar": 73,
        "Sus": 74,
        "Bel": 75,
        "SgThree": 76,
        "EpJer": 77,
        "1Macc": 78,
        "2Macc": 79,
        "3Macc": 80,
        "4Macc": 81,
        "1Esd": 82,
        "2Esd": 83,
        "PrMan": 84
      },
      chapters: {
        "Gen": [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
        "Exod": [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
        "Lev": [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
        "Num": [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13],
        "Deut": [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12],
        "Josh": [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
        "Judg": [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
        "Ruth": [22, 23, 18, 22],
        "1Sam": [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13],
        "2Sam": [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25],
        "1Kgs": [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53],
        "2Kgs": [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
        "1Chr": [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
        "2Chr": [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
        "Ezra": [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
        "Neh": [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
        "Esth": [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
        "Job": [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17],
        "Ps": [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6],
        "Prov": [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
        "Eccl": [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
        "Song": [17, 17, 11, 16, 16, 13, 13, 14],
        "Isa": [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24],
        "Jer": [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
        "Lam": [22, 22, 66, 22, 22],
        "Ezek": [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
        "Dan": [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
        "Hos": [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
        "Joel": [20, 32, 21],
        "Amos": [15, 16, 15, 13, 27, 14, 17, 14, 15],
        "Obad": [21],
        "Jonah": [17, 10, 10, 11],
        "Mic": [16, 13, 12, 13, 15, 16, 20],
        "Nah": [15, 13, 19],
        "Hab": [17, 20, 19],
        "Zeph": [18, 15, 20],
        "Hag": [15, 23],
        "Zech": [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
        "Mal": [14, 17, 18, 6],
        "Matt": [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20],
        "Mark": [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
        "Luke": [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53],
        "John": [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
        "Acts": [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31],
        "Rom": [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
        "1Cor": [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
        "2Cor": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
        "Gal": [24, 21, 29, 31, 26, 18],
        "Eph": [23, 22, 21, 32, 33, 24],
        "Phil": [30, 30, 21, 23],
        "Col": [29, 23, 25, 18],
        "1Thess": [10, 20, 13, 18, 28],
        "2Thess": [12, 17, 18],
        "1Tim": [20, 15, 16, 16, 25, 21],
        "2Tim": [18, 26, 17, 22],
        "Titus": [16, 15, 15],
        "Phlm": [25],
        "Heb": [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
        "Jas": [27, 26, 18, 17, 20],
        "1Pet": [25, 25, 22, 19, 14],
        "2Pet": [21, 22, 18],
        "1John": [10, 29, 24, 21, 21],
        "2John": [13],
        "3John": [15],
        "Jude": [25],
        "Rev": [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21],
        "Tob": [22, 14, 17, 21, 22, 18, 17, 21, 6, 14, 18, 22, 18, 15],
        "Jdt": [16, 28, 10, 15, 24, 21, 32, 36, 14, 23, 23, 20, 20, 19, 14, 25],
        "GkEsth": [22, 23, 15, 17, 14, 14, 10, 17, 32, 13, 12, 6, 18, 19, 16, 24],
        "Wis": [16, 24, 19, 20, 23, 25, 30, 21, 18, 21, 26, 27, 19, 31, 19, 29, 21, 25, 22],
        "Sir": [30, 17, 31, 31, 15, 37, 36, 19, 18, 31, 34, 18, 26, 27, 20, 30, 32, 33, 30, 31, 28, 27, 27, 34, 26, 29, 30, 26, 28, 25, 31, 24, 33, 31, 26, 31, 31, 34, 35, 30, 22, 25, 33, 23, 26, 20, 25, 25, 16, 29, 30],
        "Bar": [22, 35, 38, 37, 9, 72],
        "PrAzar": [68],
        "Sus": [64],
        "Bel": [42],
        "SgThree": [39],
        "EpJer": [72],
        "1Macc": [63, 70, 59, 61, 68, 63, 50, 32, 73, 89, 74, 53, 53, 49, 41, 24],
        "2Macc": [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 46, 26, 46, 39],
        "3Macc": [29, 33, 30, 21, 51, 41, 23],
        "4Macc": [35, 24, 21, 26, 38, 35, 23, 29, 32, 21, 27, 19, 27, 20, 32, 25, 24, 24],
        "1Esd": [58, 30, 24, 63, 73, 34, 15, 96, 55],
        "2Esd": [40, 48, 36, 52, 56, 59, 70, 63, 47, 59, 46, 51, 58, 48, 63, 78],
        "PrMan": [15],
        "Ps151": [7]
      }
    },
    alternates: {
      vulgate: {
        chapters: {
          "Ps": [6, 13, 9, 10, 13, 11, 18, 10, 39, 8, 9, 6, 7, 5, 10, 15, 51, 15, 10, 14, 32, 6, 10, 22, 12, 14, 9, 11, 13, 25, 11, 22, 23, 28, 13, 40, 23, 14, 18, 14, 12, 5, 26, 18, 12, 10, 15, 21, 23, 21, 11, 7, 9, 24, 13, 12, 12, 18, 14, 9, 13, 12, 11, 14, 20, 8, 36, 37, 6, 24, 20, 28, 23, 11, 13, 21, 72, 13, 20, 17, 8, 19, 13, 14, 17, 7, 19, 53, 17, 16, 16, 5, 23, 11, 13, 12, 9, 9, 5, 8, 29, 22, 35, 45, 48, 43, 14, 31, 7, 10, 10, 9, 26, 9, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 14, 10, 8, 12, 15, 21, 10, 11, 20, 14, 9, 7]
        }
      }
    }
  };

  bcv_parse_he.prototype.regexps.space = "[\\s\\xa0]";

  bcv_parse_he.prototype.regexps.escaped_passage = /(?:^|[^\x1f\x1e\dA-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(\x1f(\d+)(?:\/[a-z])?\x1f(?:|\/p\x1f|[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014]|פרקים|verse|פרק|and|ff|-|title(?![a-z])|[a-e](?!\w)|$)+)/gi;

  bcv_parse_he.prototype.regexps.match_end_split = /\d+\W*title|\d+\W*ff(?:[\s\xa0*]*\.)?|\d+[\s\xa0*]*[a-e](?!\w)|\x1e(?:[\s\xa0*]*[)\]\uff09])?|[\d\x1f]+/gi;

  bcv_parse_he.prototype.regexps.control = /[\x1e\x1f]/g;

  bcv_parse_he.prototype.regexps.pre_book = "[^A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ]";

  bcv_parse_he.prototype.regexps.first = "א[’']\\.?" + bcv_parse_he.prototype.regexps.space + "*";

  bcv_parse_he.prototype.regexps.second = "ב[’']\\.?" + bcv_parse_he.prototype.regexps.space + "*";

  bcv_parse_he.prototype.regexps.third = "ג[’']\\.?" + bcv_parse_he.prototype.regexps.space + "*";

  bcv_parse_he.prototype.regexps.range_and = "(?:[&\u2013\u2014-]|and|-)";

  bcv_parse_he.prototype.regexps.range_only = "(?:[\u2013\u2014-]|-)";

  bcv_parse_he.prototype.regexps.get_books = function(include_apocrypha) {
    var book, books, out, _i, _len;
    books = [
      {
        osis: ["Gen"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(בראשית|בריאה|Gen)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Exod"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(יציאת[\\s]*מצרים|יציאה|Exod|שמות)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Bel"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(בל[\\s]*והדרקון|התנין[\\s]*בבבל|Bel)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Lev"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(ספר[\\s]*הלוויים|ויקרא|Lev)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Num"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(ספירה|במדבר|מניין|Num)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Sir"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(משלי[\\s]*בן-?סירא|משלי[\\s]*בן[\\s]*סירא|ספר[\\s]*בן[\\s]*סירא|Sir)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Wis"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(חכמת[\\s]*שלמה|Wis)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Lam"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(קינות|איכה|Lam)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["EpJer"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(איגרת[\\s]*ירמיהו|EpJer)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Rev"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(חזון[\\s]*יוחנן|ההתגלות|התגלות|Rev)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["PrMan"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(תפילת[\\s]*מנשה|PrMan)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Deut"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(משנה[\\s]*תורה|דברים|Deut)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Josh"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(יהושע|Josh)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Judg"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(שופטים|Judg)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ruth"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(Ruth|רות)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(חזון[\s]*עזרא|1Esd)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Esd"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(עזרא[\s]*החיצוני|2Esd)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Isa"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(ישעיהו|ישעיה|ישעה|Isa)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(שמואל[\s]*ב[’']|שמואל[\s]*ב|2Sam)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Sam"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(שמואל[\s]*א[’']|שמואל[\s]*א|1Sam)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(מלכים[\s]*ב[’']|מלכים[\s]*ב|2Kgs)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Kgs"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(מלכים[\s]*א[’']|מלכים[\s]*א|1Kgs)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(דברי[\s]*הימים[\s]*ב[’']|דברי[\s]*הימים[\s]*ב|2Chr)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Chr"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(דברי[\s]*הימים[\s]*א[’']|דברי[\s]*הימים[\s]*א|1Chr)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Ezra"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(עזרא|Ezra)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Neh"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(נחמיה|Neh)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["GkEsth"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(תוספות[\\s]*למגילת[\\s]*אסתר|GkEsth)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Esth"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(אסתר,[\\s]*כולל[\\s]*פרקים[\\s]*גנוזים|אסתר|Esth)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Job"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(איוב|Job)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ps"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(מזמורים|תהילים|Ps)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["PrAzar"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(תפילת[\\s]*עזריה[\\s]*בתוך[\\s]*הכבשן|תפילת[\\s]*עזריה|PrAzar)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Prov"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(פתגמים|משלים|Prov|משלי)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Eccl"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(המקהיל|המרצה|Eccl|קהלת)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["SgThree"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(שירת[\\s]*שלושת[\\s]*הנערים[\\s]*בכבשן|SgThree)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Song"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(שיר[\\s]*השירים|שירי[\\s]*שלמה|Song)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jer"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(ירמיהו|ירמיה|Jer)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Ezek"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(יחזקאל|Ezek)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Dan"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(דניאל|Dan)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hos"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(הושע|Hos)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Joel"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(Joel|יואל)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Amos"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(עמוס|Amos)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Obad"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(עובדיה|עבדיה|Obad)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jonah"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(Jonah|יונה)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mic"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(מיכה|Mic)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Nah"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(נחום|Nah)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hab"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(חבקוק|Hab)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Zeph"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(Zeph|חגי)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Hag"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(צפניה|Hag)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Zech"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(זכריה|Zech)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mal"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(מלאכי|Mal)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Matt"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(הבשורה[\\s]*הקדושה[\\s]*על-?פי[\\s]*מתי|הבשורה[\\s]*על-?פי[\\s]*מתי|הבשורה[\\s]*על[\\s]*פי[\\s]*מתי|הבשורה[\\s]*לפי[\\s]*מתי|Matt)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Mark"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(הבשורה[\\s]*על-?פי[\\s]*מרקוס|הבשורה[\\s]*על[\\s]*פי[\\s]*מרקוס|Mark)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Luke"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(הבשורה[\\s]*על-?פי[\\s]*לוקאס|הבשורה[\\s]*על-?פי[\\s]*לוקס|הבשורה[\\s]*על[\\s]*פי[\\s]*לוקס|Luke)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["1John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(אגרתו[\s]*הראשונה[\s]*של[\s]*יוחנן[\s]*השלי|איגרת[\s]*יוחנן[\s]*הראשונה|1John)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(אגרתו[\s]*השנייה[\s]*של[\s]*יוחנן[\s]*השליח|איגרת[\s]*יוחנן[\s]*השנייה|2John)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["3John"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(אגרתו[\s]*השלישית[\s]*של[\s]*יוחנן[\s]*השלי|איגרת[\s]*יוחנן[\s]*השלישית|3John)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["John"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(הבשורה[\\s]*על[\\s]*פי[\\s]*יוחנן|הבשורה[\\s]*על-?פי[\\s]*יוחנן|John)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Acts"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(מעשי[\\s]*השליחים|Acts)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Rom"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(אגרת[\\s]*פולוס[\\s]*השליח[\\s]*אל-?הרומיים|האיגרת[\\s]*אל[\\s]*הרומאים|אל[\\s]*הרומאים|אל[\\s]*הרומים|Rom)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(אגרת[\s]*פולוס[\s]*השנייה[\s]*אל-?הקורינ|האיגרת[\s]*השנייה[\s]*אל[\s]*הקורינתים|השנייה[\s]*אל[\s]*הקורינתים|2Cor)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Cor"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(האיגרת[\s]*הראשונה[\s]*אל[\s]*הקורינתים|אגרת[\s]*פולוס[\s]*הראשונה[\s]*אל-?הקורי|הראשונה[\s]*אל[\s]*הקורינתים|1Cor)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Gal"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(אגרת[\\s]*פולוס[\\s]*השליח[\\s]*אל-?הגלטים|האיגרת[\\s]*אל[\\s]*הגלטים|אל[\\s]*הגלטים|Gal)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Eph"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(אגרת[\\s]*פולוס[\\s]*השליח[\\s]*אל-?האפסים|האיגרת[\\s]*אל[\\s]*האפסים|אל[\\s]*האפסים|Eph)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phil"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(אגרת[\\s]*פולוס[\\s]*השליח[\\s]*אל-?הפיליפי|האיגרת[\\s]*אל[\\s]*הפיליפים|אל[\\s]*הפיליפים|Phil)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Col"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(אגרת[\\s]*פולוס[\\s]*השליח[\\s]*אל-?הקולוסי|האיגרת[\\s]*אל[\\s]*הקולוסים|אל[\\s]*הקולוסים|Col)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(האיגרת[\s]*השנייה[\s]*אל[\s]*התסלוניקים|אגרת[\s]*פולוס[\s]*השנייה[\s]*אל-?התסלונ|השנייה[\s]*אל[\s]*התסלוניקים|2Thess)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Thess"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(האיגרת[\s]*הראשונה[\s]*אל[\s]*התסלוניקים|אגרת[\s]*פולוס[\s]*הראשונה[\s]*אל-?התסלו|הראשונה[\s]*אל[\s]*התסלוניקים|1Thess)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["2Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(אגרת[\s]*פולוס[\s]*השנייה[\s]*אל-?טימותי|האיגרת[\s]*השנייה[\s]*אל[\s]*טימותיוס|השנייה[\s]*אל[\s]*טימותיאוס|השנייה[\s]*אל[\s]*טימותיוס|2Tim)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Tim"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(אגרת[\s]*פולוס[\s]*הראשונה[\s]*אל-?טימות|האיגרת[\s]*הראשונה[\s]*אל[\s]*טימותיוס|הראשונה[\s]*אל[\s]*טימותיאוס|הראשונה[\s]*אל[\s]*טימותיוס|1Tim)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Titus"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(אגרת[\\s]*פולוס[\\s]*אל-?טיטוס|האיגרת[\\s]*אל[\\s]*טיטוס|אל[\\s]*טיטוס|Titus)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Phlm"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(אגרת[\\s]*פולוס[\\s]*אל-?פילימון|האיגרת[\\s]*אל[\\s]*פילימון|אל[\\s]*פילימון|Phlm)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Heb"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(האיגרת[\\s]*אל[\\s]*העברים|האגרת[\\s]*אל-?העברים|אל[\\s]*העברים|Heb)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jas"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(איגרת[\\s]*יעקב|אגרת[\\s]*יעקב|Jas)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(אגרתו[\s]*השנייה[\s]*של[\s]*פטרוס[\s]*השליח|איגרת[\s]*פטרוס[\s]*השנייה|2Pet)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Pet"],
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(אגרתו[\s]*הראשונה[\s]*של[\s]*פטרוס[\s]*השלי|איגרת[\s]*פטרוס[\s]*הראשונה|1Pet)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["Jude"],
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(איגרת[\\s]*יהודה|אגרת[\\s]*יהודה|Jude)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Tob"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(טוביה|Tob)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Jdt"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(יהודית|Jdt)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Bar"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(ספר[\\s]*ברוך|ברוך|Bar)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["Sus"],
        apocrypha: true,
        regexp: RegExp("(^|" + bcv_parse_he.prototype.regexps.pre_book + ")(שושנה|Sus)(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)（）\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)", "gi")
      }, {
        osis: ["2Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(ספר[\s]*מקבים[\s]*ב[’']|חשמונאים[\s]*ב[’']|מקבים[\s]*ב|2Macc)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["3Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(ספר[\s]*מקבים[\s]*ג[’']|חשמונאים[\s]*ג[’']|מקבים[\s]*ג|3Macc)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["4Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(ספר[\s]*מקבים[\s]*ד[’']|חשמונאים[\s]*ד[’']|מקבים[\s]*ד|4Macc)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }, {
        osis: ["1Macc"],
        apocrypha: true,
        regexp: /(^|[^0-9A-Za-zªµºÀ-ÖØ-öø-ɏ֑-ֽֿׁ-ׂׄ-ׇׅא-תװ-ײḀ-ỿⱠ-ⱿꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꟿ])(ספר[\s]*מקבים[\s]*א[’']|חשמונאים[\s]*א[’']|מקבים[\s]*א|1Macc)(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)（）\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      }
    ];
    if (include_apocrypha === true) return books;
    out = [];
    for (_i = 0, _len = books.length; _i < _len; _i++) {
      book = books[_i];
      if ((book.apocrypha != null) && book.apocrypha === true) continue;
      out.push(book);
    }
    return out;
  };

  bcv_parse_he.prototype.regexps.books = bcv_parse_he.prototype.regexps.get_books(false);
var grammar = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "sequence": parse_sequence,
        "sequence_post_enclosed": parse_sequence_post_enclosed,
        "sequence_post": parse_sequence_post,
        "range": parse_range,
        "b_range": parse_b_range,
        "bcv_hyphen_range": parse_bcv_hyphen_range,
        "b": parse_b,
        "bc": parse_bc,
        "bc_comma": parse_bc_comma,
        "bc_title": parse_bc_title,
        "bcv": parse_bcv,
        "bcv_weak": parse_bcv_weak,
        "bcv_comma": parse_bcv_comma,
        "bv": parse_bv,
        "cb": parse_cb,
        "cb_range": parse_cb_range,
        "cbv": parse_cbv,
        "cb_ordinal": parse_cb_ordinal,
        "cbv_ordinal": parse_cbv_ordinal,
        "c_psalm": parse_c_psalm,
        "cv_psalm": parse_cv_psalm,
        "c_title": parse_c_title,
        "cv": parse_cv,
        "cv_weak": parse_cv_weak,
        "c": parse_c,
        "integer_title": parse_integer_title,
        "v_letter": parse_v_letter,
        "v": parse_v,
        "ff": parse_ff,
        "c_explicit": parse_c_explicit,
        "v_explicit": parse_v_explicit,
        "cv_sep": parse_cv_sep,
        "cv_sep_weak": parse_cv_sep_weak,
        "sequence_sep": parse_sequence_sep,
        "range_sep": parse_range_sep,
        "title": parse_title,
        "in_book_of": parse_in_book_of,
        "abbrev": parse_abbrev,
        "translation_sequence_enclosed": parse_translation_sequence_enclosed,
        "translation_sequence": parse_translation_sequence,
        "translation": parse_translation,
        "integer": parse_integer,
        "en_integer": parse_en_integer,
        "he_integer": parse_he_integer,
        "he_any_int": parse_he_any_int,
        "he_int_parsed": parse_he_int_parsed,
        "he_zero": parse_he_zero,
        "any_integer": parse_any_integer,
        "word": parse_word,
        "word_parenthesis": parse_word_parenthesis,
        "sp": parse_sp,
        "space": parse_space
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var result0, result1;
        
        result1 = parse_bcv_hyphen_range();
        if (result1 === null) {
          result1 = parse_sequence();
          if (result1 === null) {
            result1 = parse_cb_range();
            if (result1 === null) {
              result1 = parse_range();
              if (result1 === null) {
                result1 = parse_ff();
                if (result1 === null) {
                  result1 = parse_bcv_comma();
                  if (result1 === null) {
                    result1 = parse_bc_title();
                    if (result1 === null) {
                      result1 = parse_bcv();
                      if (result1 === null) {
                        result1 = parse_bcv_weak();
                        if (result1 === null) {
                          result1 = parse_bc();
                          if (result1 === null) {
                            result1 = parse_cv_psalm();
                            if (result1 === null) {
                              result1 = parse_bv();
                              if (result1 === null) {
                                result1 = parse_b_range();
                                if (result1 === null) {
                                  result1 = parse_c_psalm();
                                  if (result1 === null) {
                                    result1 = parse_b();
                                    if (result1 === null) {
                                      result1 = parse_cbv();
                                      if (result1 === null) {
                                        result1 = parse_cbv_ordinal();
                                        if (result1 === null) {
                                          result1 = parse_cb();
                                          if (result1 === null) {
                                            result1 = parse_cb_ordinal();
                                            if (result1 === null) {
                                              result1 = parse_translation_sequence_enclosed();
                                              if (result1 === null) {
                                                result1 = parse_translation_sequence();
                                                if (result1 === null) {
                                                  result1 = parse_sequence_sep();
                                                  if (result1 === null) {
                                                    result1 = parse_c_title();
                                                    if (result1 === null) {
                                                      result1 = parse_integer_title();
                                                      if (result1 === null) {
                                                        result1 = parse_cv();
                                                        if (result1 === null) {
                                                          result1 = parse_cv_weak();
                                                          if (result1 === null) {
                                                            result1 = parse_v_letter();
                                                            if (result1 === null) {
                                                              result1 = parse_integer();
                                                              if (result1 === null) {
                                                                result1 = parse_c();
                                                                if (result1 === null) {
                                                                  result1 = parse_v();
                                                                  if (result1 === null) {
                                                                    result1 = parse_word();
                                                                    if (result1 === null) {
                                                                      result1 = parse_word_parenthesis();
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_bcv_hyphen_range();
            if (result1 === null) {
              result1 = parse_sequence();
              if (result1 === null) {
                result1 = parse_cb_range();
                if (result1 === null) {
                  result1 = parse_range();
                  if (result1 === null) {
                    result1 = parse_ff();
                    if (result1 === null) {
                      result1 = parse_bcv_comma();
                      if (result1 === null) {
                        result1 = parse_bc_title();
                        if (result1 === null) {
                          result1 = parse_bcv();
                          if (result1 === null) {
                            result1 = parse_bcv_weak();
                            if (result1 === null) {
                              result1 = parse_bc();
                              if (result1 === null) {
                                result1 = parse_cv_psalm();
                                if (result1 === null) {
                                  result1 = parse_bv();
                                  if (result1 === null) {
                                    result1 = parse_b_range();
                                    if (result1 === null) {
                                      result1 = parse_c_psalm();
                                      if (result1 === null) {
                                        result1 = parse_b();
                                        if (result1 === null) {
                                          result1 = parse_cbv();
                                          if (result1 === null) {
                                            result1 = parse_cbv_ordinal();
                                            if (result1 === null) {
                                              result1 = parse_cb();
                                              if (result1 === null) {
                                                result1 = parse_cb_ordinal();
                                                if (result1 === null) {
                                                  result1 = parse_translation_sequence_enclosed();
                                                  if (result1 === null) {
                                                    result1 = parse_translation_sequence();
                                                    if (result1 === null) {
                                                      result1 = parse_sequence_sep();
                                                      if (result1 === null) {
                                                        result1 = parse_c_title();
                                                        if (result1 === null) {
                                                          result1 = parse_integer_title();
                                                          if (result1 === null) {
                                                            result1 = parse_cv();
                                                            if (result1 === null) {
                                                              result1 = parse_cv_weak();
                                                              if (result1 === null) {
                                                                result1 = parse_v_letter();
                                                                if (result1 === null) {
                                                                  result1 = parse_integer();
                                                                  if (result1 === null) {
                                                                    result1 = parse_c();
                                                                    if (result1 === null) {
                                                                      result1 = parse_v();
                                                                      if (result1 === null) {
                                                                        result1 = parse_word();
                                                                        if (result1 === null) {
                                                                          result1 = parse_word_parenthesis();
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          result0 = null;
        }
        return result0;
      }
      
      function parse_sequence() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_cb_range();
        if (result0 === null) {
          result0 = parse_bcv_hyphen_range();
          if (result0 === null) {
            result0 = parse_range();
            if (result0 === null) {
              result0 = parse_ff();
              if (result0 === null) {
                result0 = parse_bcv_comma();
                if (result0 === null) {
                  result0 = parse_bc_title();
                  if (result0 === null) {
                    result0 = parse_bcv();
                    if (result0 === null) {
                      result0 = parse_bcv_weak();
                      if (result0 === null) {
                        result0 = parse_bc();
                        if (result0 === null) {
                          result0 = parse_cv_psalm();
                          if (result0 === null) {
                            result0 = parse_bv();
                            if (result0 === null) {
                              result0 = parse_b_range();
                              if (result0 === null) {
                                result0 = parse_c_psalm();
                                if (result0 === null) {
                                  result0 = parse_b();
                                  if (result0 === null) {
                                    result0 = parse_cbv();
                                    if (result0 === null) {
                                      result0 = parse_cbv_ordinal();
                                      if (result0 === null) {
                                        result0 = parse_cb();
                                        if (result0 === null) {
                                          result0 = parse_cb_ordinal();
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (result0 !== null) {
          pos2 = pos;
          result2 = parse_sequence_sep();
          result2 = result2 !== null ? result2 : "";
          if (result2 !== null) {
            result3 = parse_sequence_post();
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = pos2;
            }
          } else {
            result2 = null;
            pos = pos2;
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              pos2 = pos;
              result2 = parse_sequence_sep();
              result2 = result2 !== null ? result2 : "";
              if (result2 !== null) {
                result3 = parse_sequence_post();
                if (result3 !== null) {
                  result2 = [result2, result3];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { val_2.unshift([val_1]); return {"type": "sequence", "value": val_2, "indices": [offset, pos - 1]} })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_sequence_post_enclosed() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 40) {
          result0 = "(";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"(\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_sp();
          if (result1 !== null) {
            result2 = parse_sequence_sep();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = parse_sequence_post();
              if (result3 !== null) {
                result4 = [];
                pos2 = pos;
                result5 = parse_sequence_sep();
                result5 = result5 !== null ? result5 : "";
                if (result5 !== null) {
                  result6 = parse_sequence_post();
                  if (result6 !== null) {
                    result5 = [result5, result6];
                  } else {
                    result5 = null;
                    pos = pos2;
                  }
                } else {
                  result5 = null;
                  pos = pos2;
                }
                while (result5 !== null) {
                  result4.push(result5);
                  pos2 = pos;
                  result5 = parse_sequence_sep();
                  result5 = result5 !== null ? result5 : "";
                  if (result5 !== null) {
                    result6 = parse_sequence_post();
                    if (result6 !== null) {
                      result5 = [result5, result6];
                    } else {
                      result5 = null;
                      pos = pos2;
                    }
                  } else {
                    result5 = null;
                    pos = pos2;
                  }
                }
                if (result4 !== null) {
                  result5 = parse_sp();
                  if (result5 !== null) {
                    if (input.charCodeAt(pos) === 41) {
                      result6 = ")";
                      pos++;
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\")\"");
                      }
                    }
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { if (typeof(val_2) === "undefined") val_2 = []; val_2.unshift([val_1]); return {"type": "sequence_post_enclosed", "value": val_2, "indices": [offset, pos - 1]} })(pos0, result0[3], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_sequence_post() {
        var result0;
        
        result0 = parse_sequence_post_enclosed();
        if (result0 === null) {
          result0 = parse_cb_range();
          if (result0 === null) {
            result0 = parse_bcv_hyphen_range();
            if (result0 === null) {
              result0 = parse_range();
              if (result0 === null) {
                result0 = parse_ff();
                if (result0 === null) {
                  result0 = parse_bcv_comma();
                  if (result0 === null) {
                    result0 = parse_bc_title();
                    if (result0 === null) {
                      result0 = parse_bcv();
                      if (result0 === null) {
                        result0 = parse_bcv_weak();
                        if (result0 === null) {
                          result0 = parse_bc();
                          if (result0 === null) {
                            result0 = parse_cv_psalm();
                            if (result0 === null) {
                              result0 = parse_bv();
                              if (result0 === null) {
                                result0 = parse_b_range();
                                if (result0 === null) {
                                  result0 = parse_c_psalm();
                                  if (result0 === null) {
                                    result0 = parse_b();
                                    if (result0 === null) {
                                      result0 = parse_cbv();
                                      if (result0 === null) {
                                        result0 = parse_cbv_ordinal();
                                        if (result0 === null) {
                                          result0 = parse_cb();
                                          if (result0 === null) {
                                            result0 = parse_cb_ordinal();
                                            if (result0 === null) {
                                              result0 = parse_c_title();
                                              if (result0 === null) {
                                                result0 = parse_integer_title();
                                                if (result0 === null) {
                                                  result0 = parse_cv();
                                                  if (result0 === null) {
                                                    result0 = parse_cv_weak();
                                                    if (result0 === null) {
                                                      result0 = parse_v_letter();
                                                      if (result0 === null) {
                                                        result0 = parse_integer();
                                                        if (result0 === null) {
                                                          result0 = parse_c();
                                                          if (result0 === null) {
                                                            result0 = parse_v();
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_range() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_ff();
        if (result0 === null) {
          result0 = parse_bcv_comma();
          if (result0 === null) {
            result0 = parse_bc_title();
            if (result0 === null) {
              result0 = parse_bcv();
              if (result0 === null) {
                result0 = parse_bcv_weak();
                if (result0 === null) {
                  result0 = parse_bc();
                  if (result0 === null) {
                    result0 = parse_cv_psalm();
                    if (result0 === null) {
                      result0 = parse_bv();
                      if (result0 === null) {
                        result0 = parse_cbv();
                        if (result0 === null) {
                          result0 = parse_cbv_ordinal();
                          if (result0 === null) {
                            result0 = parse_c_psalm();
                            if (result0 === null) {
                              result0 = parse_cb();
                              if (result0 === null) {
                                result0 = parse_cb_ordinal();
                                if (result0 === null) {
                                  result0 = parse_c_title();
                                  if (result0 === null) {
                                    result0 = parse_integer_title();
                                    if (result0 === null) {
                                      result0 = parse_cv();
                                      if (result0 === null) {
                                        result0 = parse_cv_weak();
                                        if (result0 === null) {
                                          result0 = parse_v_letter();
                                          if (result0 === null) {
                                            result0 = parse_integer();
                                            if (result0 === null) {
                                              result0 = parse_c();
                                              if (result0 === null) {
                                                result0 = parse_v();
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (result0 !== null) {
          result1 = parse_range_sep();
          if (result1 !== null) {
            result2 = parse_ff();
            if (result2 === null) {
              result2 = parse_bcv_comma();
              if (result2 === null) {
                result2 = parse_bc_title();
                if (result2 === null) {
                  result2 = parse_bcv();
                  if (result2 === null) {
                    result2 = parse_bcv_weak();
                    if (result2 === null) {
                      result2 = parse_bc();
                      if (result2 === null) {
                        result2 = parse_cv_psalm();
                        if (result2 === null) {
                          result2 = parse_bv();
                          if (result2 === null) {
                            result2 = parse_cbv();
                            if (result2 === null) {
                              result2 = parse_cbv_ordinal();
                              if (result2 === null) {
                                result2 = parse_c_psalm();
                                if (result2 === null) {
                                  result2 = parse_cb();
                                  if (result2 === null) {
                                    result2 = parse_cb_ordinal();
                                    if (result2 === null) {
                                      result2 = parse_c_title();
                                      if (result2 === null) {
                                        result2 = parse_integer_title();
                                        if (result2 === null) {
                                          result2 = parse_cv();
                                          if (result2 === null) {
                                            result2 = parse_v_letter();
                                            if (result2 === null) {
                                              result2 = parse_integer();
                                              if (result2 === null) {
                                                result2 = parse_cv_weak();
                                                if (result2 === null) {
                                                  result2 = parse_c();
                                                  if (result2 === null) {
                                                    result2 = parse_v();
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "range", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_b_range() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_b();
        if (result0 !== null) {
          result1 = parse_range_sep();
          if (result1 !== null) {
            pos2 = pos;
            reportFailures++;
            result2 = parse_range();
            if (result2 === null) {
              result2 = parse_ff();
              if (result2 === null) {
                result2 = parse_bcv();
                if (result2 === null) {
                  result2 = parse_bcv_weak();
                  if (result2 === null) {
                    result2 = parse_bc();
                    if (result2 === null) {
                      result2 = parse_bv();
                    }
                  }
                }
              }
            }
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              result3 = parse_b();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "b_range", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_bcv_hyphen_range() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_b();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 45) {
            result1 = "-";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"-\"");
            }
          }
          if (result1 === null) {
            result1 = parse_space();
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_c();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 45) {
                result3 = "-";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"-\"");
                }
              }
              if (result3 !== null) {
                result4 = parse_v();
                if (result4 !== null) {
                  if (input.charCodeAt(pos) === 45) {
                    result5 = "-";
                    pos++;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"-\"");
                    }
                  }
                  if (result5 !== null) {
                    result6 = parse_v();
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2, val_3, val_4) { return {"type": "range", "value": [{"type": "bcv", "value": [{"type": "bc", "value": [val_1, val_2], "indices": [val_1.indices[0], val_2.indices[1]]}, val_3], "indices": [val_1.indices[0], val_3.indices[1]]}, val_4], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[2], result0[4], result0[6]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_b() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 31) {
          result0 = "\x1F";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\x1F\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_any_integer();
          if (result1 !== null) {
            pos2 = pos;
            if (input.charCodeAt(pos) === 47) {
              result2 = "/";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"/\"");
              }
            }
            if (result2 !== null) {
              if (/^[a-z]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[a-z]");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 31) {
                result3 = "\x1F";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\x1F\"");
                }
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "b", "value": val.value, "indices": [offset, pos - 1]} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_bc() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2, pos3, pos4;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_b();
        if (result0 !== null) {
          pos2 = pos;
          result1 = parse_v_explicit();
          if (result1 !== null) {
            pos3 = pos;
            reportFailures++;
            pos4 = pos;
            result2 = parse_c();
            if (result2 !== null) {
              result3 = parse_cv_sep();
              if (result3 !== null) {
                result4 = parse_v();
                if (result4 !== null) {
                  result2 = [result2, result3, result4];
                } else {
                  result2 = null;
                  pos = pos4;
                }
              } else {
                result2 = null;
                pos = pos4;
              }
            } else {
              result2 = null;
              pos = pos4;
            }
            reportFailures--;
            if (result2 !== null) {
              result2 = "";
              pos = pos3;
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              result1 = [result1, result2];
            } else {
              result1 = null;
              pos = pos2;
            }
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 === null) {
            result2 = parse_cv_sep();
            if (result2 !== null) {
              result1 = [];
              while (result2 !== null) {
                result1.push(result2);
                result2 = parse_cv_sep();
              }
            } else {
              result1 = null;
            }
            if (result1 === null) {
              result2 = parse_cv_sep_weak();
              if (result2 !== null) {
                result1 = [];
                while (result2 !== null) {
                  result1.push(result2);
                  result2 = parse_cv_sep_weak();
                }
              } else {
                result1 = null;
              }
              if (result1 === null) {
                result2 = parse_range_sep();
                if (result2 !== null) {
                  result1 = [];
                  while (result2 !== null) {
                    result1.push(result2);
                    result2 = parse_range_sep();
                  }
                } else {
                  result1 = null;
                }
                if (result1 === null) {
                  result1 = parse_sp();
                }
              }
            }
          }
          if (result1 !== null) {
            result2 = parse_c();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bc", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_bc_comma() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_b();
        if (result0 !== null) {
          result1 = parse_sp();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 44) {
              result2 = ",";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\",\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_sp();
              if (result3 !== null) {
                result4 = parse_c();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bc", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_bc_title() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_bc();
        if (result0 !== null) {
          result1 = parse_title();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bc_title", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_bcv() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_bc();
        if (result0 !== null) {
          pos2 = pos;
          reportFailures++;
          pos3 = pos;
          if (input.charCodeAt(pos) === 46) {
            result1 = ".";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_v_explicit();
            if (result2 !== null) {
              result3 = parse_v();
              if (result3 !== null) {
                result1 = [result1, result2, result3];
              } else {
                result1 = null;
                pos = pos3;
              }
            } else {
              result1 = null;
              pos = pos3;
            }
          } else {
            result1 = null;
            pos = pos3;
          }
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            pos2 = pos;
            result2 = parse_cv_sep();
            if (result2 === null) {
              result2 = parse_sequence_sep();
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = parse_v_explicit();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 === null) {
              result2 = parse_cv_sep();
            }
            if (result2 !== null) {
              result3 = parse_v_letter();
              if (result3 === null) {
                result3 = parse_v();
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_bcv_weak() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_bc();
        if (result0 !== null) {
          result1 = parse_cv_sep_weak();
          if (result1 !== null) {
            result2 = parse_v_letter();
            if (result2 === null) {
              result2 = parse_v();
            }
            if (result2 !== null) {
              pos2 = pos;
              reportFailures++;
              pos3 = pos;
              result3 = parse_cv_sep();
              if (result3 !== null) {
                result4 = parse_v();
                if (result4 !== null) {
                  result3 = [result3, result4];
                } else {
                  result3 = null;
                  pos = pos3;
                }
              } else {
                result3 = null;
                pos = pos3;
              }
              reportFailures--;
              if (result3 === null) {
                result3 = "";
              } else {
                result3 = null;
                pos = pos2;
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_bcv_comma() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_bc_comma();
        if (result0 !== null) {
          result1 = parse_sp();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 44) {
              result2 = ",";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\",\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_sp();
              if (result3 !== null) {
                result4 = parse_v_letter();
                if (result4 === null) {
                  result4 = parse_v();
                }
                if (result4 !== null) {
                  pos2 = pos;
                  reportFailures++;
                  pos3 = pos;
                  result5 = parse_cv_sep();
                  if (result5 !== null) {
                    result6 = parse_v();
                    if (result6 !== null) {
                      result5 = [result5, result6];
                    } else {
                      result5 = null;
                      pos = pos3;
                    }
                  } else {
                    result5 = null;
                    pos = pos3;
                  }
                  reportFailures--;
                  if (result5 === null) {
                    result5 = "";
                  } else {
                    result5 = null;
                    pos = pos2;
                  }
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_bv() {
        var result0, result1, result2;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_b();
        if (result0 !== null) {
          result2 = parse_cv_sep();
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_cv_sep();
            }
          } else {
            result1 = null;
          }
          if (result1 === null) {
            result2 = parse_cv_sep_weak();
            if (result2 !== null) {
              result1 = [];
              while (result2 !== null) {
                result1.push(result2);
                result2 = parse_cv_sep_weak();
              }
            } else {
              result1 = null;
            }
            if (result1 === null) {
              result2 = parse_range_sep();
              if (result2 !== null) {
                result1 = [];
                while (result2 !== null) {
                  result1.push(result2);
                  result2 = parse_range_sep();
                }
              } else {
                result1 = null;
              }
              if (result1 === null) {
                pos2 = pos;
                result2 = parse_sequence_sep();
                if (result2 !== null) {
                  result1 = [];
                  while (result2 !== null) {
                    result1.push(result2);
                    result2 = parse_sequence_sep();
                  }
                } else {
                  result1 = null;
                }
                if (result1 !== null) {
                  pos3 = pos;
                  reportFailures++;
                  result2 = parse_v_explicit();
                  reportFailures--;
                  if (result2 !== null) {
                    result2 = "";
                    pos = pos3;
                  } else {
                    result2 = null;
                  }
                  if (result2 !== null) {
                    result1 = [result1, result2];
                  } else {
                    result1 = null;
                    pos = pos2;
                  }
                } else {
                  result1 = null;
                  pos = pos2;
                }
                if (result1 === null) {
                  result1 = parse_sp();
                }
              }
            }
          }
          if (result1 !== null) {
            result2 = parse_v_letter();
            if (result2 === null) {
              result2 = parse_v();
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bv", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cb() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_c_explicit();
        if (result0 !== null) {
          result1 = parse_c();
          if (result1 !== null) {
            result2 = parse_in_book_of();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = parse_b();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bc", "value": [val_2, val_1], "indices": [offset, pos - 1]} })(pos0, result0[1], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cb_range() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_c_explicit();
        if (result0 !== null) {
          result1 = parse_c();
          if (result1 !== null) {
            result2 = parse_range_sep();
            if (result2 !== null) {
              result3 = parse_c();
              if (result3 !== null) {
                result4 = parse_in_book_of();
                result4 = result4 !== null ? result4 : "";
                if (result4 !== null) {
                  result5 = parse_b();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2, val_3) { return {"type": "cb_range", "value": [val_3, val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[1], result0[3], result0[5]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cbv() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_cb();
        if (result0 !== null) {
          result1 = parse_sequence_sep();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_v_explicit();
            if (result2 !== null) {
              result3 = parse_v();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cb_ordinal() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_c();
        if (result0 !== null) {
          if (input.substr(pos, 2) === "th") {
            result1 = "th";
            pos += 2;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"th\"");
            }
          }
          if (result1 === null) {
            if (input.substr(pos, 2) === "nd") {
              result1 = "nd";
              pos += 2;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"nd\"");
              }
            }
            if (result1 === null) {
              if (input.substr(pos, 2) === "st") {
                result1 = "st";
                pos += 2;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\"st\"");
                }
              }
            }
          }
          if (result1 !== null) {
            result2 = parse_c_explicit();
            if (result2 !== null) {
              result3 = parse_in_book_of();
              result3 = result3 !== null ? result3 : "";
              if (result3 !== null) {
                result4 = parse_b();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bc", "value": [val_2, val_1], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cbv_ordinal() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_cb_ordinal();
        if (result0 !== null) {
          result1 = parse_sequence_sep();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_v_explicit();
            if (result2 !== null) {
              result3 = parse_v();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "bcv", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_c_psalm() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 31) {
          result0 = "\x1F";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\x1F\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            if (input.substr(pos, 3) === "/p\x1F") {
              result2 = "/p\x1F";
              pos += 3;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"/p\\x1F\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "c_psalm", "value": val.value, "indices": [offset, pos - 1]} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cv_psalm() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_c_psalm();
        if (result0 !== null) {
          result1 = parse_sequence_sep();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_v_explicit();
            if (result2 !== null) {
              result3 = parse_v();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "cv_psalm", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_c_title() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_c_explicit();
        if (result0 !== null) {
          result1 = parse_c();
          if (result1 !== null) {
            result2 = parse_title();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "c_title", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cv() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_c();
        if (result0 !== null) {
          pos2 = pos;
          reportFailures++;
          pos3 = pos;
          if (input.charCodeAt(pos) === 46) {
            result1 = ".";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_v_explicit();
            if (result2 !== null) {
              result3 = parse_v();
              if (result3 !== null) {
                result1 = [result1, result2, result3];
              } else {
                result1 = null;
                pos = pos3;
              }
            } else {
              result1 = null;
              pos = pos3;
            }
          } else {
            result1 = null;
            pos = pos3;
          }
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            pos2 = pos;
            result2 = parse_cv_sep();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = parse_v_explicit();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 === null) {
              result2 = parse_cv_sep();
            }
            if (result2 !== null) {
              result3 = parse_v_letter();
              if (result3 === null) {
                result3 = parse_v();
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "cv", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cv_weak() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_c();
        if (result0 !== null) {
          result1 = parse_cv_sep_weak();
          if (result1 !== null) {
            result2 = parse_v_letter();
            if (result2 === null) {
              result2 = parse_v();
            }
            if (result2 !== null) {
              pos2 = pos;
              reportFailures++;
              pos3 = pos;
              result3 = parse_cv_sep();
              if (result3 !== null) {
                result4 = parse_v();
                if (result4 !== null) {
                  result3 = [result3, result4];
                } else {
                  result3 = null;
                  pos = pos3;
                }
              } else {
                result3 = null;
                pos = pos3;
              }
              reportFailures--;
              if (result3 === null) {
                result3 = "";
              } else {
                result3 = null;
                pos = pos2;
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1, val_2) { return {"type": "cv", "value": [val_1, val_2], "indices": [offset, pos - 1]} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_c() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_c_explicit();
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "c", "value": [val], "indices": [offset, pos - 1]} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_integer_title() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_integer();
        if (result0 !== null) {
          result1 = parse_cv_sep();
          if (result1 === null) {
            result1 = parse_sequence_sep();
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            if (input.substr(pos, 5) === "title") {
              result2 = "title";
              pos += 5;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"title\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1) { return {"type": "integer_title", "value": [val_1], "indices": [offset, pos - 1]} })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_v_letter() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_v_explicit();
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            result2 = parse_sp();
            if (result2 !== null) {
              pos2 = pos;
              reportFailures++;
              if (input.substr(pos, 2) === "ff") {
                result3 = "ff";
                pos += 2;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"ff\"");
                }
              }
              reportFailures--;
              if (result3 === null) {
                result3 = "";
              } else {
                result3 = null;
                pos = pos2;
              }
              if (result3 !== null) {
                if (/^[a-e]/.test(input.charAt(pos))) {
                  result4 = input.charAt(pos);
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("[a-e]");
                  }
                }
                if (result4 !== null) {
                  pos2 = pos;
                  reportFailures++;
                  if (/^[a-z]/.test(input.charAt(pos))) {
                    result5 = input.charAt(pos);
                    pos++;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("[a-z]");
                    }
                  }
                  reportFailures--;
                  if (result5 === null) {
                    result5 = "";
                  } else {
                    result5 = null;
                    pos = pos2;
                  }
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "v", "value": [val], "indices": [offset, pos - 1]} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_v() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_v_explicit();
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "v", "value": [val], "indices": [offset, pos - 1]} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_ff() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_bcv();
        if (result0 === null) {
          result0 = parse_bcv_weak();
          if (result0 === null) {
            result0 = parse_bc();
            if (result0 === null) {
              result0 = parse_cv();
              if (result0 === null) {
                result0 = parse_cv_weak();
                if (result0 === null) {
                  result0 = parse_integer();
                  if (result0 === null) {
                    result0 = parse_c();
                    if (result0 === null) {
                      result0 = parse_v();
                    }
                  }
                }
              }
            }
          }
        }
        if (result0 !== null) {
          result1 = parse_sp();
          if (result1 !== null) {
            if (input.substr(pos, 2) === "ff") {
              result2 = "ff";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"ff\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_abbrev();
              result3 = result3 !== null ? result3 : "";
              if (result3 !== null) {
                pos2 = pos;
                reportFailures++;
                if (/^[a-z]/.test(input.charAt(pos))) {
                  result4 = input.charAt(pos);
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("[a-z]");
                  }
                }
                reportFailures--;
                if (result4 === null) {
                  result4 = "";
                } else {
                  result4 = null;
                  pos = pos2;
                }
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val_1) { return {"type": "ff", "value": [val_1], "indices": [offset, pos - 1]} })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_c_explicit() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_sp();
        if (result0 !== null) {
          if (input.substr(pos, 5).toLowerCase() === "\u05E4\u05E8\u05E7\u05D9\u05DD") {
            result1 = input.substr(pos, 5);
            pos += 5;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\u05E4\\u05E8\\u05E7\\u05D9\\u05DD\"");
            }
          }
          if (result1 === null) {
            if (input.substr(pos, 3).toLowerCase() === "\u05E4\u05E8\u05E7") {
              result1 = input.substr(pos, 3);
              pos += 3;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\u05E4\\u05E8\\u05E7\"");
              }
            }
          }
          if (result1 !== null) {
            result2 = parse_sp();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return {"type": "c_explicit"} })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_v_explicit() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_sp();
        if (result0 !== null) {
          if (input.substr(pos, 5) === "verse") {
            result1 = "verse";
            pos += 5;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"verse\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_sp();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return {"type": "v_explicit"} })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cv_sep() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        result0 = parse_sp();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 58) {
            result2 = ":";
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("\":\"");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (input.charCodeAt(pos) === 58) {
                result2 = ":";
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\":\"");
                }
              }
            }
          } else {
            result1 = null;
          }
          if (result1 === null) {
            pos1 = pos;
            if (input.charCodeAt(pos) === 46) {
              result1 = ".";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\".\"");
              }
            }
            if (result1 !== null) {
              pos2 = pos;
              reportFailures++;
              pos3 = pos;
              result2 = parse_sp();
              if (result2 !== null) {
                if (input.charCodeAt(pos) === 46) {
                  result3 = ".";
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("\".\"");
                  }
                }
                if (result3 !== null) {
                  result4 = parse_sp();
                  if (result4 !== null) {
                    if (input.charCodeAt(pos) === 46) {
                      result5 = ".";
                      pos++;
                    } else {
                      result5 = null;
                      if (reportFailures === 0) {
                        matchFailed("\".\"");
                      }
                    }
                    if (result5 !== null) {
                      result2 = [result2, result3, result4, result5];
                    } else {
                      result2 = null;
                      pos = pos3;
                    }
                  } else {
                    result2 = null;
                    pos = pos3;
                  }
                } else {
                  result2 = null;
                  pos = pos3;
                }
              } else {
                result2 = null;
                pos = pos3;
              }
              reportFailures--;
              if (result2 === null) {
                result2 = "";
              } else {
                result2 = null;
                pos = pos2;
              }
              if (result2 !== null) {
                result1 = [result1, result2];
              } else {
                result1 = null;
                pos = pos1;
              }
            } else {
              result1 = null;
              pos = pos1;
            }
          }
          if (result1 !== null) {
            result2 = parse_sp();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_cv_sep_weak() {
        var result0, result1, result2;
        var pos0;
        
        pos0 = pos;
        result0 = parse_sp();
        if (result0 !== null) {
          if (/^["']/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[\"']");
            }
          }
          if (result1 !== null) {
            result2 = parse_sp();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_space();
        }
        return result0;
      }
      
      function parse_sequence_sep() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        if (/^[,;\/:&\-\u2013\u2014~]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[,;\\/:&\\-\\u2013\\u2014~]");
          }
        }
        if (result1 === null) {
          pos1 = pos;
          if (input.charCodeAt(pos) === 46) {
            result1 = ".";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result1 !== null) {
            pos2 = pos;
            reportFailures++;
            pos3 = pos;
            result2 = parse_sp();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 46) {
                result3 = ".";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\".\"");
                }
              }
              if (result3 !== null) {
                result4 = parse_sp();
                if (result4 !== null) {
                  if (input.charCodeAt(pos) === 46) {
                    result5 = ".";
                    pos++;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("\".\"");
                    }
                  }
                  if (result5 !== null) {
                    result2 = [result2, result3, result4, result5];
                  } else {
                    result2 = null;
                    pos = pos3;
                  }
                } else {
                  result2 = null;
                  pos = pos3;
                }
              } else {
                result2 = null;
                pos = pos3;
              }
            } else {
              result2 = null;
              pos = pos3;
            }
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              result1 = [result1, result2];
            } else {
              result1 = null;
              pos = pos1;
            }
          } else {
            result1 = null;
            pos = pos1;
          }
          if (result1 === null) {
            if (input.substr(pos, 3) === "and") {
              result1 = "and";
              pos += 3;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"and\"");
              }
            }
            if (result1 === null) {
              result1 = parse_space();
            }
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[,;\/:&\-\u2013\u2014~]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[,;\\/:&\\-\\u2013\\u2014~]");
              }
            }
            if (result1 === null) {
              pos1 = pos;
              if (input.charCodeAt(pos) === 46) {
                result1 = ".";
                pos++;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\".\"");
                }
              }
              if (result1 !== null) {
                pos2 = pos;
                reportFailures++;
                pos3 = pos;
                result2 = parse_sp();
                if (result2 !== null) {
                  if (input.charCodeAt(pos) === 46) {
                    result3 = ".";
                    pos++;
                  } else {
                    result3 = null;
                    if (reportFailures === 0) {
                      matchFailed("\".\"");
                    }
                  }
                  if (result3 !== null) {
                    result4 = parse_sp();
                    if (result4 !== null) {
                      if (input.charCodeAt(pos) === 46) {
                        result5 = ".";
                        pos++;
                      } else {
                        result5 = null;
                        if (reportFailures === 0) {
                          matchFailed("\".\"");
                        }
                      }
                      if (result5 !== null) {
                        result2 = [result2, result3, result4, result5];
                      } else {
                        result2 = null;
                        pos = pos3;
                      }
                    } else {
                      result2 = null;
                      pos = pos3;
                    }
                  } else {
                    result2 = null;
                    pos = pos3;
                  }
                } else {
                  result2 = null;
                  pos = pos3;
                }
                reportFailures--;
                if (result2 === null) {
                  result2 = "";
                } else {
                  result2 = null;
                  pos = pos2;
                }
                if (result2 !== null) {
                  result1 = [result1, result2];
                } else {
                  result1 = null;
                  pos = pos1;
                }
              } else {
                result1 = null;
                pos = pos1;
              }
              if (result1 === null) {
                if (input.substr(pos, 3) === "and") {
                  result1 = "and";
                  pos += 3;
                } else {
                  result1 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"and\"");
                  }
                }
                if (result1 === null) {
                  result1 = parse_space();
                }
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "" })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_range_sep() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        result0 = parse_sp();
        if (result0 !== null) {
          pos1 = pos;
          if (/^[\-\u2013\u2014]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[\\-\\u2013\\u2014]");
            }
          }
          if (result2 !== null) {
            result3 = parse_sp();
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = pos1;
            }
          } else {
            result2 = null;
            pos = pos1;
          }
          if (result2 === null) {
            pos1 = pos;
            if (input.charCodeAt(pos) === 45) {
              result2 = "-";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"-\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_sp();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos1;
              }
            } else {
              result2 = null;
              pos = pos1;
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              pos1 = pos;
              if (/^[\-\u2013\u2014]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[\\-\\u2013\\u2014]");
                }
              }
              if (result2 !== null) {
                result3 = parse_sp();
                if (result3 !== null) {
                  result2 = [result2, result3];
                } else {
                  result2 = null;
                  pos = pos1;
                }
              } else {
                result2 = null;
                pos = pos1;
              }
              if (result2 === null) {
                pos1 = pos;
                if (input.charCodeAt(pos) === 45) {
                  result2 = "-";
                  pos++;
                } else {
                  result2 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"-\"");
                  }
                }
                if (result2 !== null) {
                  result3 = parse_sp();
                  if (result3 !== null) {
                    result2 = [result2, result3];
                  } else {
                    result2 = null;
                    pos = pos1;
                  }
                } else {
                  result2 = null;
                  pos = pos1;
                }
              }
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_title() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_cv_sep();
        if (result0 === null) {
          result0 = parse_sequence_sep();
        }
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          if (input.substr(pos, 5) === "title") {
            result1 = "title";
            pos += 5;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"title\"");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {type:"title", value: [val], "indices": [offset, pos - 1]} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_in_book_of() {
        var result0, result1, result2, result3, result4, result5, result6, result7, result8;
        var pos0, pos1;
        
        pos0 = pos;
        result0 = parse_sp();
        if (result0 !== null) {
          if (input.substr(pos, 4) === "from") {
            result1 = "from";
            pos += 4;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"from\"");
            }
          }
          if (result1 === null) {
            if (input.substr(pos, 2) === "of") {
              result1 = "of";
              pos += 2;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"of\"");
              }
            }
            if (result1 === null) {
              if (input.substr(pos, 2) === "in") {
                result1 = "in";
                pos += 2;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\"in\"");
                }
              }
            }
          }
          if (result1 !== null) {
            result2 = parse_sp();
            if (result2 !== null) {
              pos1 = pos;
              if (input.substr(pos, 3) === "the") {
                result3 = "the";
                pos += 3;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"the\"");
                }
              }
              if (result3 !== null) {
                result4 = parse_sp();
                if (result4 !== null) {
                  if (input.substr(pos, 4) === "book") {
                    result5 = "book";
                    pos += 4;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"book\"");
                    }
                  }
                  if (result5 !== null) {
                    result6 = parse_sp();
                    if (result6 !== null) {
                      if (input.substr(pos, 2) === "of") {
                        result7 = "of";
                        pos += 2;
                      } else {
                        result7 = null;
                        if (reportFailures === 0) {
                          matchFailed("\"of\"");
                        }
                      }
                      if (result7 !== null) {
                        result8 = parse_sp();
                        if (result8 !== null) {
                          result3 = [result3, result4, result5, result6, result7, result8];
                        } else {
                          result3 = null;
                          pos = pos1;
                        }
                      } else {
                        result3 = null;
                        pos = pos1;
                      }
                    } else {
                      result3 = null;
                      pos = pos1;
                    }
                  } else {
                    result3 = null;
                    pos = pos1;
                  }
                } else {
                  result3 = null;
                  pos = pos1;
                }
              } else {
                result3 = null;
                pos = pos1;
              }
              result3 = result3 !== null ? result3 : "";
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos0;
              }
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_abbrev() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        result0 = parse_sp();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 46) {
            result1 = ".";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result1 !== null) {
            pos1 = pos;
            reportFailures++;
            pos2 = pos;
            result2 = parse_sp();
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 46) {
                result3 = ".";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\".\"");
                }
              }
              if (result3 !== null) {
                result4 = parse_sp();
                if (result4 !== null) {
                  if (input.charCodeAt(pos) === 46) {
                    result5 = ".";
                    pos++;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("\".\"");
                    }
                  }
                  if (result5 !== null) {
                    result2 = [result2, result3, result4, result5];
                  } else {
                    result2 = null;
                    pos = pos2;
                  }
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            reportFailures--;
            if (result2 === null) {
              result2 = "";
            } else {
              result2 = null;
              pos = pos1;
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_translation_sequence_enclosed() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_sp();
        if (result0 !== null) {
          if (/^[([]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[([]");
            }
          }
          if (result1 !== null) {
            result2 = parse_sp();
            if (result2 !== null) {
              pos2 = pos;
              result3 = parse_translation();
              if (result3 !== null) {
                result4 = [];
                pos3 = pos;
                result5 = parse_sequence_sep();
                if (result5 !== null) {
                  result6 = parse_translation();
                  if (result6 !== null) {
                    result5 = [result5, result6];
                  } else {
                    result5 = null;
                    pos = pos3;
                  }
                } else {
                  result5 = null;
                  pos = pos3;
                }
                while (result5 !== null) {
                  result4.push(result5);
                  pos3 = pos;
                  result5 = parse_sequence_sep();
                  if (result5 !== null) {
                    result6 = parse_translation();
                    if (result6 !== null) {
                      result5 = [result5, result6];
                    } else {
                      result5 = null;
                      pos = pos3;
                    }
                  } else {
                    result5 = null;
                    pos = pos3;
                  }
                }
                if (result4 !== null) {
                  result3 = [result3, result4];
                } else {
                  result3 = null;
                  pos = pos2;
                }
              } else {
                result3 = null;
                pos = pos2;
              }
              if (result3 !== null) {
                result4 = parse_sp();
                if (result4 !== null) {
                  if (/^[)\]]/.test(input.charAt(pos))) {
                    result5 = input.charAt(pos);
                    pos++;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("[)\\]]");
                    }
                  }
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "translation_sequence", "value": val, "indices": [offset, pos - 1]} })(pos0, result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_translation_sequence() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2, pos3;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_sp();
        if (result0 !== null) {
          pos2 = pos;
          if (input.charCodeAt(pos) === 44) {
            result1 = ",";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\",\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_sp();
            if (result2 !== null) {
              result1 = [result1, result2];
            } else {
              result1 = null;
              pos = pos2;
            }
          } else {
            result1 = null;
            pos = pos2;
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            pos2 = pos;
            result2 = parse_translation();
            if (result2 !== null) {
              result3 = [];
              pos3 = pos;
              result4 = parse_sequence_sep();
              if (result4 !== null) {
                result5 = parse_translation();
                if (result5 !== null) {
                  result4 = [result4, result5];
                } else {
                  result4 = null;
                  pos = pos3;
                }
              } else {
                result4 = null;
                pos = pos3;
              }
              while (result4 !== null) {
                result3.push(result4);
                pos3 = pos;
                result4 = parse_sequence_sep();
                if (result4 !== null) {
                  result5 = parse_translation();
                  if (result5 !== null) {
                    result4 = [result4, result5];
                  } else {
                    result4 = null;
                    pos = pos3;
                  }
                } else {
                  result4 = null;
                  pos = pos3;
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "translation_sequence", "value": val, "indices": [offset, pos - 1]} })(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_translation() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 30) {
          result0 = "\x1E";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\x1E\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_any_integer();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 30) {
              result2 = "\x1E";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\x1E\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "translation", "value": val.value, "indices": [offset, pos - 1]} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_integer() {
        var result0;
        
        result0 = parse_en_integer();
        if (result0 === null) {
          result0 = parse_he_integer();
        }
        return result0;
      }
      
      function parse_en_integer() {
        var result0, result1, result2;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        if (/^[0-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9]");
          }
        }
        if (result0 !== null) {
          if (/^[0-9]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9]");
            }
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            if (/^[0-9]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos2;
            }
          } else {
            result0 = null;
            pos = pos2;
          }
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          pos2 = pos;
          reportFailures++;
          if (/^[0-9]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9]");
            }
          }
          if (result1 === null) {
            if (input.substr(pos, 4) === ",000") {
              result1 = ",000";
              pos += 4;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\",000\"");
              }
            }
          }
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos2;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [offset, pos - 1]} })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_he_integer() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_he_any_int();
        if (result0 !== null) {
          result1 = parse_he_any_int();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_he_any_int();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return parseInt(val.join(""), 10); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_he_any_int() {
        var result0;
        
        result0 = parse_he_int_parsed();
        if (result0 === null) {
          result0 = parse_he_zero();
        }
        return result0;
      }
      
      function parse_he_int_parsed() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (/^[\u05D0-\u05D8]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\u05D0-\\u05D8]");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return val.charCodeAt(0) - 1487; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_he_zero() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (/^[\u05D9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\u05D9]");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return '0'; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_any_integer() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        if (/^[0-9]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[0-9]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "integer", "value": parseInt(val.join(""), 10), "indices": [offset, pos - 1]} })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_word() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        if (/^[^\x1F\x1E([]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[^\\x1F\\x1E([]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[^\x1F\x1E([]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[^\\x1F\\x1E([]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "word", "value": val.join(""), "indices": [offset, pos - 1]} })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_word_parenthesis() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (/^[([]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[([]");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, val) { return {"type": "stop", "value": val, "indices": [offset, pos - 1]} })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_sp() {
        var result0;
        
        result0 = parse_space();
        result0 = result0 !== null ? result0 : "";
        return result0;
      }
      
      function parse_space() {
        var result0, result1;
        
        if (/^[\s\xa0*]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[\\s\\xa0*]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[\s\xa0*]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[\\s\\xa0*]");
              }
            }
          }
        } else {
          result0 = null;
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();


}).call(this);
