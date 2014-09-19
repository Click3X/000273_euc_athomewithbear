// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license
 
(function(){var e=0;var t=["ms","moz","webkit","o"];for(var n=0;n<t.length&&!window.requestAnimationFrame;++n){window.requestAnimationFrame=window[t[n]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[t[n]+"CancelAnimationFrame"]||window[t[n]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame)window.requestAnimationFrame=function(t,n){var r=(new Date).getTime();var i=Math.max(0,16-(r-e));var s=window.setTimeout(function(){t(r+i)},i);e=r+i;return s};if(!window.cancelAnimationFrame)window.cancelAnimationFrame=function(e){clearTimeout(e)}})()

"use strict"; 
$( document ).ready( function() {
	Bear.init();
});

var Bear = Bear || {
	init:function(){
		Bear.isTouchDevice = 'ontouchstart' in document.documentElement;
		Bear.selectedSection = -1;
		Bear.loadData();
		Bear.initNav();
		Bear.clickModel = {0:[], 1:[], 2:[]};
		//Bear.autotriggerSweeps = true;
		Bear.sweepsUnlocked = false;
		Bear.canShownSweeps = [true, true, true];
	},
	loadData:function(url, callback){
		$.getJSON( "js/config.json", function( data ) {
			Bear.dataLoaded(data);
		});
	},
	initNav:function(){
		$("#nav li").each(function(index){
			if (index < 3)
			{
				$(this).click(function(){
					Bear.selectSection(index);
				});
			}
			else
			{
				$(this).click(function(){
					Bear.showSweeps(0);
				});
			}
			
		});
	},
	dataLoaded:function(data){
		Bear.config = data;
		Bear.selectSection(0);
	},
	selectSection:function(index){
		Bear.selectedSection = index;
		$("#nav li").removeClass("active");
		$("#nav li").eq(index).addClass("active");
		Bear.resetCurrentSection();
		Bear.hideThenShow();
	},
	resetCurrentSection:function()
	{
		Bear.clearHiddenAnimationTimeout();
		Sound.stopAll(true);
		delete Bear.hiddenAnimationIndex;
	},
	hideThenShow:function(){
		Bear.resetAnimation();
		if (Bear.trayWrapper)
		{
			$("#content").animate({opacity:0}, function(){
				$(this).empty();
				Bear.showSection();
			});
		}
		else
		{
			Bear.showSection();
		}
	},
	showSection:function(){
		var thisScene = Bear.config.scenes[Bear.selectedSection];
		if (typeof thisScene !== 'undefined')
		{
			var content = $("#content");
			Bear.trayWrapper = $("<div id='trayWrapper'></div>").appendTo(content);
			Bear.tray = $("<div id='tray'></div>").appendTo(trayWrapper);
			Bear.tray.css({'width':thisScene.width, 'background-image':'url('+thisScene.background+')'});
			content.fadeTo(0,0);
			content.animate({opacity:1}, 300);
			if (Bear.isTouchDevice)
			{
				// add touch to drag
				/*
				Bear.trayWrapper.kinetic({
					'cursor':'', 
					'y':'false', 
					'triggerHardware':false, 
					filterTarget: function(target, e){
						return !(/spot/i.test(target.className));
					}
				});*/
				Bear.trayWrapper.scrollLeft(thisScene.initialPosition);
			}
			else
			{
				//watch mouse
				Bear.trayWrapper.mousemove(function(e){
					Bear.mouseTargetX = e.pageX - 160;
					Bear.resetAnimation();
					Bear.animator = requestAnimationFrame(Bear.mouseAnimationStep);
				});
				Bear.trayWrapper.scrollLeft(thisScene.initialPosition);
			}
			
			var counter = $("<div id='counter'><span class='first'>0</span><span class='second'></span></div>").appendTo(content);

			Bear.drawSpots(tray);
			
		}
	},
	mouseAnimationStep: function(){
		var trayWidth = Bear.trayWrapper.width();
		var newX = (Bear.tray.width()-trayWidth) * Bear.mouseTargetX/trayWidth;
		var left = Bear.trayWrapper.scrollLeft();
		left += parseFloat((newX - left)/64);
		Bear.trayWrapper.scrollLeft(left);
		if (Math.round(Bear.trayWrapper.scrollLeft()) == Math.round(newX))
		{
			Bear.resetAnimation();
		}
		else
		{
			Bear.animator = requestAnimationFrame(Bear.mouseAnimationStep);
		}
	},
	resetAnimation:function(){
		if (Bear.animator) cancelAnimationFrame(Bear.animator);
		delete Bear.animator;
	},
	drawSpots:function(host){
		var thisScene = Bear.config.scenes[Bear.selectedSection];
		var spotWidth = 25;
		var arrowPadding = 8;
		var trayWrapper = $("#trayWrapper");
		var viewableWidth = $("#content").width();
		$.each(thisScene.spots, function(i,s){
            var spot = $("<div class='spot'></div>").appendTo(host);
            if (s.hidden)
            {
            	spot.addClass("hidden");
            	spot.addClass("quip");
            } 
            var x = s.x - Math.round(spotWidth/2);
            var y = s.y - Math.round(spotWidth/2);
            spot.css({left:x, top:y});
        	spot.animateSprite({
			    fps: 8,
			    animations: {
			        clickedPulse: [3, 4, 5, 3, 3, 3],
			        hiddenPulse: [9, 10, 11, 9, 9, 9],
			        tipPulse: [0, 1, 2, 0, 0, 0],
			        quipPulse: [6, 7, 8, 6, 6, 6]
			    },
			    loop: true,
			    autoplay: false
			});

        	if (!Bear.isTouchDevice)
        	{
        		spot.hover(function(){
        			if ($(this).hasClass("hidden"))
        			{
        				//Sound.play('audio/growl.mp3');
        			}
        			
        			if (s.title.length)
        			{
        				var xPos;
		            	var hover = $("<div class='tooltip'><div class='hover-title'><div class='text'>"+s.title+"</div></div></div>").hide().insertAfter($(this));
		            	var hoverWidth = hover.outerWidth();
		            	var hClass;
		            	if (x + hoverWidth + 2*arrowPadding + spotWidth > trayWrapper.scrollLeft()+viewableWidth)
		            	{
		            		hover.addClass('left');
		            		hClass = 'right';
		            		xPos = Bear.tray.width()  - x + arrowPadding;
		            	}
		            	else
		            	{
		            		hover.addClass('right');
		            		hClass = 'left';
		            		xPos = x + 25 + arrowPadding;
		            	}
		            	var title = hover.find(".hover-title");
		            	title.find(".text").width(hoverWidth);
		            	var cssProps = {'top':y + Math.round((spotWidth-hover.outerHeight())/2)};
		            	cssProps[hClass]=xPos;
		            	hover.css(cssProps).fadeIn(300);
		            	title.width(0);
		            	title.animate({'width':hoverWidth}, 300);
		            	$(this).data('hover', hover);
        			}
	            	
	            	var animation = 'tipPulse';
	            	if ($(this).hasClass("hidden") || $(this).hasClass("quip")) animation = 'quipPulse';
	            	if ($(this).hasClass("clicked")) animation = 'clickedPulse';
	            	$(this).animateSprite('play', animation) ;
	            	
	            }, function(){
	            	if ($(this).data('hover'))
	            	{
	            		$(this).data('hover').fadeOut(300, function(){ $(this).remove();  });
	            	}
	            	$(this).removeData('hover');
	            	$(this).animateSprite('stop');
	            	$(this).css({'background-position':''});
	            	//$(this).removeClass("hidden");
	            });
        	}
            

			spot.click(function(){
				$(this).removeClass("hidden");
				if (!Bear.isTouchDevice)
				{
	            	$(this).animateSprite('stop');
	            	$(this).css({'background-position':''});
    	        }
    	        if (s.hidden)
    	        {
    	        	Bear.countOverlayClick(i);
    	        	if (Bear.sweepsUnlocked && Bear.canShownSweeps[Bear.selectedSection])
					{
						Bear.showSweeps(500);
					}
					var thisScene = Bear.config.scenes[Bear.selectedSection];
					var thisSpot = thisScene.spots[i];
					if (thisSpot.sfx)
					{
						sound = Sound.play(thisSpot.sfx);
					}
    	        }
    	        else
    	        {
    	        	Bear.showOverlay('info', i);
    	        }
            	
            });
        });
		Bear.countOverlayClick();
		Bear.triggerHiddenAnimation();
	},
	triggerHiddenAnimation:function(){
		Bear.clearHiddenAnimationTimeout();
		if ($(".spot.quip.hidden").length == 0) return;
		if (typeof Bear.hiddenAnimationIndex === 'undefined')
		{
			Bear.hiddenAnimationIndex = -1;
		}
		Bear.hiddenAnimationTimeout = setTimeout(function(){
			var hiddenQuips = $(".spot.quip.hidden");
			if (hiddenQuips.length)
			{
				//var random = Math.floor(hiddenQuips.length*Math.random());
				//var selectedQuip = hiddenQuips.eq(random);
				Bear.hiddenAnimationIndex++;
				if (Bear.hiddenAnimationIndex >= hiddenQuips.length)
				{
					Bear.hiddenAnimationIndex = 0;
				}
				
				var selectedQuip = hiddenQuips.eq(Bear.hiddenAnimationIndex);
				selectedQuip.animateSprite('play', 'hiddenPulse');
				setTimeout(function(){
					selectedQuip.animateSprite('stop');
					selectedQuip.css({'background-position':''});
					Bear.triggerHiddenAnimation();
				}, 2*1000*.750);
			}
		}, 6*1000);
	},
	clearHiddenAnimationTimeout : function()
	{
		if (typeof Bear.hiddenAnimationTimeout !== undefined)
		{
			clearTimeout(Bear.hiddenAnimationTimeout);
			delete Bear.hiddenAnimationTimeout;
		}
	},
	showOverlay:function(type, index){
		Sound.stopAll(true);
		var overlayClass = 'overlay ' + type;
		if (!Bear.sweepsUnlocked && type == 'sweeps') overlayClass += " locked";
		var thisScene = Bear.config.scenes[Bear.selectedSection];
		if (type == 'info')
		{
			Bear.countOverlayClick(index);
			var thisSpot = thisScene.spots[index];
		}
		
		var overlayHTML = "<div id='overlaywrapper'><div class='close'></div><div class='"+overlayClass+"'>";
		if (type == 'info')
		{
			overlayHTML += "<h2>"+thisSpot.title+"</h2>";
			overlayHTML += "<div class='body'>"+thisSpot.body+"</div>";
			overlayHTML += "<div class='share'><span>PLEDGE TO STAY GOLDEN:</span><div class='facebook'></div><div class='twitter'></div></div>";
		}
		else if (type = 'sweeps')
		{
			if (Bear.sweepsUnlocked)
			{
				var url = thisScene.sweepsurl;
				overlayHTML += "<iframe id='overlayiframe'src='"+url+"'></iframe>";
			}
			else
			{
				overlayHTML += "<h2>KEEP EXPLORING to win!</h2>";
				overlayHTML += "<div class='body'>Keep looking for tips, find them all in one room and enter for a chance to win a $500 gift card.</div>";
			}
			
		}
		
		overlayHTML += "</div></div>";
		var overlay = $(overlayHTML).hide().insertAfter("#blurwrapper").fadeIn(300);
		var sound;
		if (type == 'info')
		{
			overlay.find('.facebook').click(function(){
				FB.ui({
				  method: 'feed',
				  link: Bear.config.siteurl,
				  caption: thisSpot.shareTitle,
				  description: thisSpot.shareBody,
				  picture: thisSpot.shareImage,
				}, function(response){});
							});
			overlay.find('.twitter').click(function(){
				var url = 'http://twitter.com/share?url='+encodeURIComponent(Bear.config.siteurl)+'&text='+encodeURIComponent(thisSpot.shareBody); //change back to thisSpot.twitterText
				window.open(url,'tweet','width=550,height=450,personalbar=0,toolbar=0,scrollbars=1,resizable=1');
			});

			if (thisSpot.sfx)
			{
				sound = Sound.play(thisSpot.sfx);
			}
		}

		overlay.find('.close').click(function(){
			Sound.stopAll(true);
			//if (sound) Sound.stop(sound, true);
			Bear.hideOverlay();
			if (type == 'info' && Bear.sweepsUnlocked && Bear.canShownSweeps[Bear.selectedSection])
			{
				Bear.showSweeps(500);
			}
		});
		
		$("#blurwrapper").addClass('active');
	},
	showSweeps:function(delay){
		setTimeout(function() { 
					Bear.showOverlay('sweeps', -1);
					Bear.canShownSweeps[Bear.selectedSection] = false; 
				}, delay);
	},
	countOverlayClick:function(index){
		var currentClicks = Bear.clickModel[Bear.selectedSection];
		var total = Bear.config.scenes[Bear.selectedSection].spots.length;
		if (typeof index !== 'undefined')
		{
			if (currentClicks.indexOf(index) == -1) currentClicks.push(index);
		}

		$(".spot").each(function(i){
			$(this).removeClass(".clicked");
			$(this).css({'background-position':''});
			if (currentClicks.indexOf(i) != -1)
			{
				$(this).addClass("clicked").removeClass("hidden");
			} 
		});
		

		
		$("#counter .first").text(currentClicks.length);
		$("#counter .second").text(total);
		if (currentClicks.length == total)
		{
			Bear.sweepsUnlocked = true;			
		}
	},
	hideOverlay:function(){
		$("#blurwrapper").removeClass('active');
		$('#overlaywrapper').fadeOut(300, function(){ $(this).remove(); });
	}
};

var Sound = Sound || {
	play:function(path){
		var name = "sound"+new Date().getTime();
		/* clear currently playing sound */
		if (typeof Sound.fadeTimeout !== 'undefined')
		{
			clearTimeout(Sound.fadeTimeout);
			delete Sound.fadeTimeout;
		}
		if ($(".sound-player").length > 0 )
		{
			Sound.stopAll(true);
			Sound.fadeTimeout = setTimeout(function(){
				Sound.play(path);	
			}, 400);
			return name;
		}
		/* end clear */
		var soundDiv = $("<div id='"+name+"' class='sound-player'></div>").appendTo($('body'));
		soundDiv.jPlayer({
	        ready: function() {
	          $(this).jPlayer("setMedia", {
	            mp3: path
	          }).jPlayer("play");
	        },
	        loop: false,
	        swfPath: "js",
	        volume:1,
	        ended: function() {
	        	Sound.stop(name, false)
	        }
	    });
	    return name;
	},
	stopAll:function(fade){
		if ($(".sound-player").length > 0 )
		{
			$(".sound-player").each(function(index){
				console.log($(this).attr("id"));
				Sound.stop($(this).attr("id"), fade);
			});
		}
	},
	stop:function(id, fade){
		var soundDiv = $("#"+id);
		if (soundDiv)
		{
			var cleanup = function(){
				soundDiv.jPlayer("destroy");
		    	soundDiv.remove();
			}

			if (fade)
			{
				soundDiv.jPlayerFade().to(300, 1, 0, function(){cleanup();});
			}
			else
			{
				cleanup();
			}
		}
	}
};