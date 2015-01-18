/* Heat-map for LikeLines "Light"; Must be included after lllight.js */
LLL.HEATMAP = {
	DEFAULT_WIDTH: LLL.DEFAULT_WIDTH,
	DEFAULT_HEIGHT: 20,

	CSS_CLASSES: ["lll-heatmap"],
};

(function (LLL, HEATMAP, $) {
	
	HEATMAP.injectHeatmapsIntoDOM = function () {
		var exec = function () {
			$('.lll-heatmap:not(canvas)').each(function() {
				var $heatmap_div = $(this);
				
				var lllplayer_exposed_name = $heatmap_div.data('for');
				var width = $heatmap_div.data('width');
				var height = $heatmap_div.data('height');
				
				var lllplayer = window[lllplayer_exposed_name];
				var exposed_name = $heatmap_div.data('name');
				
				var heatmap = new HEATMAP.Heatmap(this, lllplayer, width, height);
				
				if (exposed_name !== undefined) {
					window[exposed_name] = heatmap;
				}
			});
		};
		
		// NOTE: An lllplayer is created *after* the YouTube API has loaded.
		// Since heat-maps depend on an lllplayer, execution needs to be deferred as well.
		if (LLL._ytReady) {
			exec();
		}
		else {
			LLL._creationQueue.push(exec);
		}
	};
	
	HEATMAP.Heatmap = function(node, lllplayer, width, height) {
		this.node = node;
		this.canvas = document.createElement('canvas');
		this.lllplayer = lllplayer;
		this.timecode = document.createElement('span');
		
		this.width = width || HEATMAP.DEFAULT_WIDTH;
		this.height = height || HEATMAP.DEFAULT_HEIGHT;
		
		$(this.canvas).prop({
			width: this.width,
			height: this.height
		});
		$(node).append(this.canvas)
		       .append($(this.timecode).addClass('lll-timecode').html('00:00')
		);
		
		this._bindHandlers();
	};
	
	HEATMAP.Heatmap.prototype._eventToTimepoint = function (e, domNode) {
		var $node = $(domNode);
		
		var x = e.clientX + 
		        ((window.pageXOffset !== undefined) ? window.pageXOffset 
		                                            : (document.documentElement || document.body).scrollLeft) - 
		        $node.offset().left;
		var w = $node.outerWidth();
		var d = this.lllplayer.getDuration();
		
		if (x < 0) {
			x = 0;
		}
		else if (x >= w) {
			x = w-1;
		}
		
		return (d !== -1) ? x*d/w : -1;
	};
	
	HEATMAP.Heatmap.prototype._bindHandlers = function() {
		var self = this;
		
		var $canvas = $(this.canvas);
		var canvasOnClick = function(e) {
			var t = self._eventToTimepoint(e, this);
			self.lllplayer.seek(t);
		};
		$(this.canvas).click(canvasOnClick);
		
		var timecode = this.timecode;
		var updateTimeCode = function(e) {
			var x = (e.clientX + 20) + 'px';
			var y = (e.clientY + 0) + 'px';
			timecode.style.top = y;
			timecode.style.left = x;
			
			var t = self._eventToTimepoint(e, self.canvas);
			$(timecode).html(HEATMAP.timecodeToHHMMSS(t));
		};
		$(this.node).mousemove(updateTimeCode);
	};
	
	HEATMAP.timecodeToHHMMSS = function(t) {
		var hours = Math.floor(t / 3600);
		t -= hours*3600;
		var minutes = Math.floor(t / 60);
		t -= minutes*60;
		var seconds = Math.floor(t);
		
		var hh = (hours < 10)   ? ('0'+hours)   : hours;
		var mm = (minutes < 10) ? ('0'+minutes) : minutes;
		var ss = (seconds < 10) ? ('0'+seconds) : seconds;
		
		return ((hours > 0) ? (hh+':') : '') + mm+':'+ss; 
	};
	
})(LLL, LLL.HEATMAP, jQuery);


jQuery(document).ready(LLL.HEATMAP.injectHeatmapsIntoDOM);
