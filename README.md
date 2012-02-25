## Usage

Using `TouchManager` following this.

	btn = document.getElementById('btn')

	touch_manager = TouchManager(btn, 
	  end: ->
	    console.log 'tap'
	    return
	  hold: ->
	    console.log 'holding...'
	    return
	  holdout: ->
	    console.log 'hold out'
	    return
	)

	# disable touch
	touch_manager.disable()

	# enable touch
	touch_manager.enable()

	# destroy touch
	touch_manager.destroy()
