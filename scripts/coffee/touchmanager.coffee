###
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
###
support =
  touch: 'ontouchstart' of window
touch_start_event = if support.touch then 'touchstart' else 'mousedown'
touch_move_event = if support.touch then 'touchmove' else 'mousemove'
touch_end_event = if support.touch then 'touchend' else 'mouseup'

window.TouchManager = class TouchManager
  constructor: (elem, conf) ->
    if !(@ instanceof TouchManager)
      return new TouchManager(elem, conf)
    return @init(elem, conf)

  init: (elem, conf) ->
    @elem = elem

    @conf =
      init: null,
      start: null,
      move: null,
      end: null,
      hold: null,
      holdout: null

    for c of conf
      @conf[c] = conf[c]

    @touch_enabled = yes
    @current_x = 0
    @move_ready = no
    @timer = no
    @holding = no

    if typeof @conf.init is 'function'
      @conf.init.call(@)

    elem.addEventListener(touch_start_event, @, false)
    elem.addEventListener(touch_move_event, @, false)
    elem.addEventListener(touch_end_event, @, false)

    return 

  handleEvent: (ev) ->
    switch ev.type
      when touch_start_event
        @_touchStart(ev)
      when touch_move_event
        @_touchMove(ev)
      when touch_end_event
        @_touchEnd(ev)
      else
        @_click(ev)
    return

  _getPage: (ev, page) ->
    if support.touch
      ev.changedTouches[0][page]
    else
      ev[page]
  
  _touchStart: (ev) ->
    ev.preventDefault()
    if not @touch_enabled
      return
    if not support.touch
      ev.preventDefault()

    if typeof @conf.hold is 'function'
      @timer = setTimeout( =>
        @holding = yes
        @conf.hold.call(@)
        return
      500)

    @scrolling = yes
    @move_ready = no
    @start_page_x = @_getPage(ev, 'pageX')
    @start_page_y = @_getPage(ev, 'pageY')
    @base_page_x = @start_page_x
    @direction_x = 0
    @start_time = ev.timeStamp

    if typeof @conf.start is 'function'
      @conf.start.call(@)
    return

  _touchMove: (ev) ->
    if not @scrolling
      return

    if not @holding
      clearTimeout(@timer)
    else
      return

    page_x = @_getPage(ev, 'pageX')
    page_y = @_getPage(ev, 'pageY')

    if @move_ready
      ev.preventDefault()
      ev.stopPropagation()

      dist_x = page_x - @base_page_x
      new_x = @current_x + dist_x

      if new_x >= 0
        new_x = Math.round(@current_x + dist_x / 3)
      @current_x = new_x
      @direction_x = if dist_x > 0 then -1 else 1

      @conf.move.call(@, @current_x, @direction_x)
    else
      delta_x = Math.abs(page_x - @start_page_x)
      delta_y = Math.abs(page_y - @start_page_y)

      if delta_x > 5
        ev.preventDefault()
        ev.stopPropagation()

        @move_ready = yes
        @elem.addEventListener('click', @, true)
      else
        if delta_y > 5
          @scrolling = no

    @base_page_x = page_x
    return

  _touchEnd: (ev) ->
    if not @scrolling
      return

    if @timer
      clearTimeout(@timer)
    if @holding
      @holding = no
      if typeof @conf.holdout is 'function'
        @conf.holdout.call(@)
      return

    @scrolling = no
    @move_ready = no

    if typeof @conf.end is 'function'
      @conf.end.call(@)

    setTimeout =>
      @elem.removeEventListener('click', @, true)
      return
    return

  _click: (ev) ->
    ev.preventDefault()
    ev.stopPropagation()
    return

  enable: ->
    @touch_enabled = true
    return

  disable: ->
    @touch_enabled = false
    return

  destroy: ->
    elem.removeEventListener(touch_start_event, @, false)
    elem.removeEventListener(touch_move_event, @, false)
    elem.removeEventListener(touch_end_event, @, false)
    return

