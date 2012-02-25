## Usage

Using `TouchManager` following this.

	btn = document.getElementById('btn')

	TouchManager(btn, 
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
