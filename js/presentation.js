$(document).ready(function() {
	
	var animating = false,
		start = true,
		end = false,
		slide_w = $('.pres_holder').width(),
		slide_h = $('.pres_holder').height(),
		step = slide_w + 100,
		live_coding = false;

	// constants
	const pres_holder = $('.pres_holder'),
		totalSlides = $('.slide').length,
		editors = [];

	window.preSlide = []; // bind function to execute before each slide
	window.current = 0;
	window.onReset = null;
		
	// check slide position
	var checkPosition = function() {
		start = false;
		end = false;

		$('.next-slide').removeClass('disabled');
		$('.prev-slide').removeClass('disabled');

		if (current === 0) {
			start = true;
			$('.prev-slide').addClass('disabled');
		}

		if (current === totalSlides - 1) {
			end = true;
			$('.next-slide').addClass('disabled');
		}
	};

	// reset slide
	var resetSlide = function(slide) {
    	$('.slide').eq(slide).find('.editor').animate({
			'top': '100%'
		}, 500);
		$('.code-size').find('i').removeClass('fa-minus').removeClass('fa-plus').addClass('fa-minus');
		$('.code-live').find('i').removeClass('fa-circle-o').removeClass('fa-dot-circle-o').addClass('fa-circle-o');
    	$('.slide').eq(slide).find('.editor').removeClass('half-size');
    	$('.toggle-code').find('i').removeClass('fa-times').addClass('fa-code');
    	$('.code-live').removeClass('blink');
    	live_coding = false;
    	if (typeof onReset == 'function') {
    		onReset();
    	}
    };

	// check if slide contain code
	var isContainCode = function(slide) {
		if (!slide)
			return;

		if (slide.find('.editor').length > 0) {
			$('.toggle-code').removeClass('disabled');
	    	$('.toggle-code').addClass('blink');
	    } else {
	    	$('.toggle-code').removeClass('blink');
	    	$('.toggle-code').addClass('disabled');
	    }
	    $('.code-size').addClass('disabled');
	    $('.code-live').addClass('disabled');
	};

	// slide animation - type 01
	var animateSlide = function(slide) {
		const current_slide = $('.slide').eq(slide);

		animating = true;

		$('.bottom_bar').animate({
			'margin-top': '8vh'
		}, 500);

		if (typeof preSlide[slide] == 'function') {
			preSlide[slide]();
		}

		$('.slide').each(function(){
			$(this).css({
				'transform': 'scale(0.9)'
			});	        
	    });

		setTimeout(function() {
			pres_holder.css({
				'margin-left': - slide * step + 'px'
			});
		}, 500);

		setTimeout(function() {
			$('.slide').each(function(){
				$(this).css({
					'transform': 'scale(1)'
				});	        
		    });

		    animating = false;
		    isContainCode(current_slide);
		    checkPosition();
		    $('.slide-name').html($('.modal_li').eq(current).html());
		    $('.bottom_bar').animate({
				'margin-top': '0px'
			}, 500);
		}, 1000);

		$('.slides-count').html(current + ' / ' + (totalSlides - 1) );
	};

	var slideStep = function(isForward) {
		if (current >= 0 && current < totalSlides) {
			resetSlide(current);
		}

		if (animating)
			return;
		if (isForward && end || !isForward && start) {
			return;
		}

		if (isForward) {
			current++;
		} else {
			current--;
		}

		animateSlide(current);
	}

	// next slide
	$('.next-slide').click(function() {
		slideStep(true);
	});

	// prev slide
	$('.prev-slide').click(function() {
		slideStep(false);
	});

	// bind keys
	$(document).keydown(function(e) {
	    switch(e.which) {
	        case 37: // left
	        	slideStep(false);
	        	break;
	        case 39: // right
	        	slideStep(true);
	        default: return; // exit this handler for other keys
	    }
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

	// slides menu
	$('.slides-menu').click(function() { $('.modal').fadeIn(); });
	$('.close_modal').click(function() { $('.modal').fadeOut(); });

	$('.modal_li').click(function() {
		current = $(this).index();

		$('.modal').fadeOut();
		animateSlide(current);
	});

	// CODE
	var runCode = function(editor) {
		var valid = true;
		var annot = editor.getSession().getAnnotations();

		for (var key in annot){
			if (annot.hasOwnProperty(key))
				console.log('error', key, annot);
				valid = false;
		}

		if (valid) {
			var js = editor.getValue();
	  		eval(js);
		}
	};

	// @TODO - beutify the code
	// $('.editor').html( $('.editor').html().replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm,"") );
	var editor;
	$('.editor').each(function( index ) {
		// map editors
		var pos = $(this).parent().index();
		editors[pos] = ace.edit(this);

		editors[pos].getSession().setMode('ace/mode/csharp');
		editors[pos].setTheme("ace/theme/monokai");
		editors[pos].getSession().setMode("ace/mode/javascript");
		editors[pos].session.setOptions({ 
			tabSize: 2, 
			useSoftTabs: true
		});
		editors[pos].setFontSize(50);
		editors[pos].setShowPrintMargin(false);

		editors[pos].getSession().on("changeAnnotation", function(){
			if (!live_coding)
				return;
			runCode(editors[pos]);
		});
	});

    $('.code-size').click(function() {
    	$('.code-size').find('i').toggleClass('fa-minus').toggleClass('fa-plus');
    	$('.slide').eq(current).find('.editor').toggleClass('half-size');
    	setTimeout(function() {
    		editors[current].resize();
    	}, 500);

    });

    $('.code-live').click(function() {
    	live_coding = !live_coding;

    	$('.code-live').find('i').toggleClass('fa-dot-circle-o').toggleClass('fa-circle-o');
    	$('.code-live').toggleClass('blink');

    	if (live_coding) {
    		eval(editors[current].getValue());
    	}
    });

    $('.toggle-code').click(function() {
    	$('.slide').eq(current).find('.editor').removeClass('half-size');

    	setTimeout(function() {
    		var pos = ($('.slide').eq(current).find('.editor').css('top') == '0px') ? '100%' : '0px';

	    	$('.slide').eq(current).find('.editor').animate({
				'top': pos
			}, 500);
    	}, 500);
    
		$('.toggle-code').toggleClass('blink');
		$('.code-size').toggleClass('disabled');
		$('.code-live').toggleClass('disabled');
		$('.toggle-code').find('i').toggleClass('fa-times').toggleClass('fa-code');
		$('.code-live').find('i').removeClass('fa-circle-o').removeClass('fa-dot-circle-o').addClass('fa-circle-o');
		$('.code-live').removeClass('blink');
		live_coding = false;
    });

    // handle resize
    $(window).on('resize', function() {
    	resetSlide(current);

    	setTimeout(function() {
    		slide_w = $('.pres_holder').width();
			slide_h = $('.pres_holder').height();
			step = slide_w + 100;
			current = 0;

			pres_holder.css({
				'margin-left': '0px'
			});
			init();
    	}, 500);
	});

    // init
    var init = function() {
    	// init slides holser
    	$('.pres_holder_inner').css('width', (totalSlides + 1) * (slide_w + 100) + 'px');

		// populate slides count
		$('.slides-count').html('0 / ' + (totalSlides - 1));

		// change bg color of video slides
		$('.slide').each(function() {
			if ($(this).find('video').length > 0) {
				$(this).css('background', '#000');
			}
		});

		// check first slide
		isContainCode($('.slide').eq(current));

		// populate first slide name
		$('.slide-name').html($('.modal_li').eq(0).html() || 'undefined name');
	};

	init();
});