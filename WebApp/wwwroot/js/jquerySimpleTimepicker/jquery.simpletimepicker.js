!(function (a) {
  "use strict";
  function b(b, d) {
    (this.element = b),
      (this.$element = a(b)),
      (this.name = c),
      (this.opts = a.extend(!0, {}, a.fn[c].defaults, d)),
      (this.$elements = { hour: null, minute: null, output: null }),
      this.init(b, d);
  }
  var c = "simpleTimePicker";
  (b.prototype = {
    _pad: function (a) {
      return (a += ""), a.length < 2 && (a = "0" + a), a;
    },
    init: function () {
      var b = this;
      if ("now" == b.opts.time.selected) {
        var d = new Date(),
          e = d.getHours(),
          f = d.getMinutes();
        if ((12 == b.opts.format && e > 11 && (e -= 12), 1 != b.opts.interval)) {
          for (var g = 0; 60 >= g && !(g + b.opts.interval > f); g += b.opts.interval);
          f = g;
        }
        b.opts.time.selected = b._pad(e) + ":" + b._pad(f);
      }
      null != b.opts.output && (b.$elements.output = a(b.opts.output)),
        (b.$elements.hour = a("<select />").attr("name", "hour")),
        (b.$elements.minute = a("<select />").attr("name", "minute")),
        null != b.opts.css && (b.$elements.hour.addClass(b.opts.css), b.$elements.minute.addClass(b.opts.css)),
        b.$elements.hour.on("change", function () {
          b._draw(), b.opts.onSelect.call(b, b, b._get()), b._output();
        }),
        b.$elements.minute.on("change", function () {
          b._draw(), b.opts.onSelect.call(b, b, b._get()), b._output();
        }),
        null != b.$elements.output &&
          (b.$elements.output.on("change." + c, function () {
            var c = a(this);
            b._set(c.val());
          }),
          b.$elements.output.trigger("change." + c)),
        b.$element.append(b.$elements.hour),
        b.$element.append(b.$elements.minute),
        b._draw(),
        null != b.opts.time.selected && (b._set(b.opts.time.selected), b._output()),
        b.opts.onLoad.call(b, b);
    },
    destroy: function () {
      this.$elements.hour.remove(),
        this.$elements.minute.remove(),
        this.$element.removeData("plugin_" + c),
        null != this.$elements.output && this.$elements.output.off("change." + c),
        this.opts.onDestroy.call(this);
    },
    _draw: function () {
      var b = this,
        c = null,
        d = null,
        e = null;
      if (null == b.opts.time.min) (b.opts.time.min = "00:00"), (g = 0), (h = 0);
      else
        var f = b.opts.time.min.split(":"),
          g = parseInt(f[0], 10),
          h = b.$elements.hour.val() == g ? parseInt(f[1], 10) : 0;
      if (null == b.opts.time.max) (b.opts.time.max = 24 == b.opts.format ? "24:00" : "12:00"), (j = b.opts.format - 1), (k = 59);
      else
        var i = b.opts.time.max.split(":"),
          j = parseInt(i[0], 10),
          k = b.$elements.hour.val() == j ? parseInt(i[1], 10) : 59;
      (c = b.$elements.hour.find("option:selected").val()),
        b.$elements.hour.find("option").remove(),
        null != b.opts.text.hour && ((e = a("<option/>").attr("value", "").text(b.opts.text.hour)), b.$elements.hour.append(e));
      for (var l = g; j >= l; l++) {
        var e = a("<option/>").attr("value", b._pad(l)).text(b._pad(l));
        b.$elements.hour.append(e);
      }
      (d = b.$elements.hour.find("option[value='" + c + "']")),
        d.length > 0 ? d.prop("selected", !0) : b.$elements.hour.find("option:first").prop("selected", !0),
        (c = b.$elements.minute.find("option:selected").val()),
        b.$elements.minute.find("option").remove(),
        null != b.opts.text.minute && ((e = a("<option/>").attr("value", "").text(b.opts.text.minute)), b.$elements.minute.append(e));
      for (var l = h; k >= l; l += b.opts.interval) {
        var e = a("<option/>").attr("value", b._pad(l)).text(b._pad(l));
        b.$elements.minute.append(e);
      }
      (d = b.$elements.minute.find("option[value='" + c + "']")),
        d.length > 0 ? d.prop("selected", !0) : b.$elements.minute.find("option:first").prop("selected", !0);
    },
    _get: function () {
      if ("" != this.$elements.hour.val() && "" != this.$elements.minute.val()) {
        var a = this.$elements.hour.val() + ":" + this.$elements.minute.val();
        return a;
      }
      return null;
    },
    _set: function (a) {
      if ("" != a) {
        var b = a.split(":");
        this.$elements.hour.val(b[0]), this.$elements.minute.val(b[1]);
      }
    },
    _output: function () {
      if (null != this.opts.output) {
        var a = this._get();
        a
          ? (this.$elements.output.val(a), this.$elements.output.change())
          : (this.$elements.output.val(""), this.$elements.output.change());
      }
    },
    setMin: function (a) {
      (this.opts.time.min = a), this._draw();
    },
    setMax: function (a) {
      (this.opts.time.max = a), this._draw();
    },
    setTime: function (a) {
      (this.opts.time.selected = a), this._set(this.opts.time.selected);
    },
    getTime: function () {
      var a = this._get();
      return a;
    },
    remove: function () {
      this.destroy();
    },
  }),
    (a.fn[c] = function (d) {
      if ("string" == typeof arguments[0]) {
        var e = Array.prototype.slice.call(arguments, 1);
        if (a.isFunction(b.prototype[d])) {
          var f;
          return (
            this.each(function () {
              f = a.data(this, "plugin_" + c)[d](e[0]);
            }),
            "undefined" != typeof f ? f : this
          );
        }
        a.error("Method " + d + " is not available");
      } else if ("object" == typeof d || !d)
        return this.each(function () {
          a.data(this, "plugin_" + c) || a.data(this, "plugin_" + c, new b(this, d));
        });
    }),
    (a.fn[c].defaults = {
      time: { selected: null, min: null, max: null },
      format: 24,
      interval: 1,
      text: { hour: null, minute: null },
      output: null,
      css: null,
      onSelect: function () {},
      onDestroy: function () {},
      onLoad: function () {},
    });
})(jQuery, window, document);
