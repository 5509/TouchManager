
/*
 * TouchManager.js
 *
 * @version      0.1
 * @author       nori (norimania@gmail.com)
 * @copyright    5509 (http://5509.me/)
 * @license      The MIT License
 * @link         https://github.com/5509/TouchManager
 *
 * Management touch actions, if do listen funcs
 *
 *     @param DOM element
 *     @param {}
 *     {
 *       init: ->
 *       start: ->
 *       move: (current_x, direction_x) ->
 *       end: ->
 *       hold: ->
 *       holdout: ->
 *     }
*/

(function() {
  var TouchManager, support, touch_end_event, touch_move_event, touch_start_event;

  support = {
    touch: 'ontouchstart' in window
  };

  touch_start_event = support.touch ? 'touchstart' : 'mousedown';

  touch_move_event = support.touch ? 'touchmove' : 'mousemove';

  touch_end_event = support.touch ? 'touchend' : 'mouseup';

  window.TouchManager = TouchManager = (function() {

    function TouchManager(elem, conf) {
      if (!(this instanceof TouchManager)) return new TouchManager(elem, conf);
      return this.init(elem, conf);
    }

    TouchManager.prototype.init = function(elem, conf) {
      var c;
      this.elem = elem;
      this.conf = {
        init: null,
        start: null,
        move: null,
        end: null,
        hold: null,
        holdout: null
      };
      for (c in conf) {
        this.conf[c] = conf[c];
      }
      this.touch_enabled = true;
      this.current_x = 0;
      this.move_ready = false;
      this.timer = false;
      this.holding = false;
      if (typeof this.conf.init === 'function') this.conf.init.call(this);
      elem.addEventListener(touch_start_event, this, false);
      elem.addEventListener(touch_move_event, this, false);
      elem.addEventListener(touch_end_event, this, false);
    };

    TouchManager.prototype.handleEvent = function(ev) {
      switch (ev.type) {
        case touch_start_event:
          this._touchStart(ev);
          break;
        case touch_move_event:
          this._touchMove(ev);
          break;
        case touch_end_event:
          this._touchEnd(ev);
          break;
        default:
          this._click(ev);
      }
    };

    TouchManager.prototype._getPage = function(ev, page) {
      if (support.touch) {
        return ev.changedTouches[0][page];
      } else {
        return ev[page];
      }
    };

    TouchManager.prototype._touchStart = function(ev) {
      var _this = this;
      ev.preventDefault();
      if (!this.touch_enabled) return;
      if (!support.touch) ev.preventDefault();
      if (typeof this.conf.hold === 'function') {
        this.timer = setTimeout(function() {
          _this.holding = true;
          _this.conf.hold.call(_this);
        }, 500);
      }
      this.scrolling = true;
      this.move_ready = false;
      this.start_page_x = this._getPage(ev, 'pageX');
      this.start_page_y = this._getPage(ev, 'pageY');
      this.base_page_x = this.start_page_x;
      this.direction_x = 0;
      this.start_time = ev.timeStamp;
      if (typeof this.conf.start === 'function') this.conf.start.call(this);
    };

    TouchManager.prototype._touchMove = function(ev) {
      var delta_x, delta_y, dist_x, new_x, page_x, page_y;
      if (!this.scrolling) return;
      if (!this.holding) {
        clearTimeout(this.timer);
      } else {
        return;
      }
      page_x = this._getPage(ev, 'pageX');
      page_y = this._getPage(ev, 'pageY');
      if (this.move_ready) {
        ev.preventDefault();
        ev.stopPropagation();
        dist_x = page_x - this.base_page_x;
        new_x = this.current_x + dist_x;
        if (new_x >= 0) new_x = Math.round(this.current_x + dist_x / 3);
        this.current_x = new_x;
        this.direction_x = dist_x > 0 ? -1 : 1;
        this.conf.move.call(this, this.current_x, this.direction_x);
      } else {
        delta_x = Math.abs(page_x - this.start_page_x);
        delta_y = Math.abs(page_y - this.start_page_y);
        if (delta_x > 5) {
          ev.preventDefault();
          ev.stopPropagation();
          this.move_ready = true;
          this.elem.addEventListener('click', this, true);
        } else {
          if (delta_y > 5) this.scrolling = false;
        }
      }
      this.base_page_x = page_x;
    };

    TouchManager.prototype._touchEnd = function(ev) {
      var _this = this;
      if (!this.scrolling) return;
      if (this.timer) clearTimeout(this.timer);
      if (this.holding) {
        this.holding = false;
        if (typeof this.conf.holdout === 'function') this.conf.holdout.call(this);
        return;
      }
      this.scrolling = false;
      this.move_ready = false;
      if (typeof this.conf.end === 'function') this.conf.end.call(this);
      setTimeout(function() {
        _this.elem.removeEventListener('click', _this, true);
      });
    };

    TouchManager.prototype._click = function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    };

    TouchManager.prototype.enable = function() {
      this.touch_enabled = true;
    };

    TouchManager.prototype.disable = function() {
      this.touch_enabled = false;
    };

    TouchManager.prototype.destroy = function() {
      elem.removeEventListener(touch_start_event, this, false);
      elem.removeEventListener(touch_move_event, this, false);
      elem.removeEventListener(touch_end_event, this, false);
    };

    return TouchManager;

  })();

}).call(this);
