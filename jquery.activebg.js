(function($) {
	
	var windowIsLoaded = false;
	
	function ActiveBg(element, userSettings) {
		var defaultSettings = {
			mode: "canvas", // css, css3, canvas
			debug: {
				drawCrop: false,
				hideCropped: true
			},
			crop: [
			       		[0.2, 0.2],
			       		[0.8, 0.8]
			       ],
			kenburns: {
				waitForLoad: true,
				active: false,
				duration: 10000,
				easing: "swing",
				cropEnd: [
				           		[0.0, 0.0], 
				           		[0.8, 0.8]
				          ]
			}
		};
		this.settings = $.extend(true, {}, defaultSettings, userSettings);
		this.element = element;
		this.wrapper = null;
		this.box = null;
	}
	
	ActiveBg.prototype.init = function() {
		var self = this;
		
		this.wrapper = this.findWrapper();
		
		if (this.wrapper != null) {
		
			this.element.addClass("activebg-element");
			this.boxElement();

			switch (self.settings.mode)
			{
			case "css":
			case "css3":
				
				break;
				
			case "canvas":
				this.createCanvas();
				break;
			}

			this.element.abOnImageAvailable(function() {
				
				// Calculate the size of the original element.
				self.elementSize = {
					width: self.element.width(),
					height: self.element.height()
				};
				
				self.boxSize = self.measureBox();
				
				// In canvas mode, we don't need the original image.
				if (self.settings.mode == "canvas") {
					self.element.remove();
				}
				
				// Do the crop.
				self.initCrop();
				
				// Re do the crop on window resize.
				$(window).on("resize", function(e) {
					self.initCrop();
				});
			});
			
		}
		
	};
	
	$.fn.abOnImageAvailable = function(callback) {
		if ($(this).width() == 0) {
			$(this).on("load", callback);
		} else {
			callback();
		}
	};
	
	/**
	 * If kenburns effect is off, just applies the crop. If kenburns is on, it also resets the animation.
	 */
	ActiveBg.prototype.initCrop = function() {
		this.applyCrop(this.settings.crop);
		this.startKenburns();
	};
	
	ActiveBg.prototype.startKenburns = function() {
		var self = this;
		
		if (this.settings.kenburns.active) {
			if (typeof(this.normTimeObject) != "undefined") {
				this.normTimeObject.stop();
			}
			this.normTimeObject = $({normalizedTime: 0});

			this.normTimeObject.animate({normalizedTime: 1}, {
				duration: self.settings.kenburns.duration,
				easing: self.settings.kenburns.easing,
				step: function(normalizedTime) {
					self.updateResize(normalizedTime);
				}
			});
		}
	};
	
	ActiveBg.prototype.updateResize = function(normalizedTime) {
		var cropStart = this.settings.crop;
		var cropEnd = this.settings.kenburns.cropEnd;
		var cropStep = [
		                [cropStart[0][0] + normalizedTime * (cropEnd[0][0] - cropStart[0][0]), cropStart[0][1] + normalizedTime * (cropEnd[0][1] - cropStart[0][1])],
		                [cropStart[1][0] + normalizedTime * (cropEnd[1][0] - cropStart[1][0]), cropStart[1][1] + normalizedTime * (cropEnd[1][1] - cropStart[1][1])]
		                ];
		
		this.applyCrop(cropStep);
	};

	
	ActiveBg.prototype.boxElement = function() {
		this.box = $("<div />", { "class" : "activebg-box" });
		if (!this.settings.debug.hideCropped) {
			this.box.css("overflow", "visible");
		}
		this.element.remove();
		this.box.prepend(this.element);
		this.wrapper.prepend(this.box);
	};
	
	ActiveBg.prototype.createCanvas = function() {
		this.canvas = $("<canvas />", { "class" : "activebg-canvas" });
		this.canvas.attr("width", this.box.width());
		this.canvas.attr("height", this.box.height());
		this.box.prepend(this.canvas);
	};
	
	ActiveBg.prototype.drawCrop = function(coords) {
		if (this.settings.debug.drawCrop) {
			var crop = $("<div />", { 
				"class": "activebg-crop",
			});
			this.box.append(crop);
			
			crop.css({
				"width": coords.cropScaledSize.width + "px",
				"height": coords.cropScaledSize.height + "px",
				"left": coords.cropOffset.x + "px",
				"top": coords.cropOffset.y + "px"
			});
		}
	};
	
	ActiveBg.prototype.applyCrop = function(crop) {
		var coords = this.calcElementCoords(this.boxSize, this.elementSize, crop)
		
		switch (this.settings.mode) {
		case "css":
			this.element.css({
				
				"width": coords.elementScaledSize.width,
				"height": coords.elementScaledSize.height,
				"left": (coords.elementOffset.x + coords.cropOffset.x) + "px",
				"top": (coords.elementOffset.y + coords.cropOffset.y) + "px"
			});

			break;
		
		case "css3":
			this.element.css({
				"transform-origin": "0 0",
				"webkit-transform": "" 
					+ " translateX(" + (coords.elementOffset.x + coords.cropOffset.x) + "px)"
					+ " translateY(" + (coords.elementOffset.y + coords.cropOffset.y) + "px)"
					+ " scale(" + coords.scale + ")",
					"transform": "" 
						+ " translateX(" + (coords.elementOffset.x + coords.cropOffset.x) + "px)"
						+ " translateY(" + (coords.elementOffset.y + coords.cropOffset.y) + "px)"
						+ " scale(" + coords.scale + ")"
			})
			break;
			
		case "canvas":
			var ctx = this.canvas.get(0).getContext("2d");
			ctx.drawImage(
				this.element.get(0),
				coords.cropCoords[0][0],
				coords.cropCoords[0][1],
				coords.cropSize.width,
				coords.cropSize.height,
				coords.cropOffset.x,
				coords.cropOffset.y,
				coords.cropScaledSize.width,
				coords.cropScaledSize.height
			);
			break;
		}
		
		this.drawCrop(coords);
	};
	
	ActiveBg.prototype.calcElementCoords = function(boxSize, elementSize, cropNormCoords) {
	
		var cropCoords = [
		                  [cropNormCoords[0][0] * elementSize.width, cropNormCoords[0][1] * elementSize.height],
		                  [cropNormCoords[1][0] * elementSize.width, cropNormCoords[1][1] * elementSize.heihgt]
		                  ];

		var cropNormSize = {
			width: cropNormCoords[1][0] - cropNormCoords[0][0],
			height: cropNormCoords[1][1] - cropNormCoords[0][1]
		}
		
		var cropSize = {
			width: cropNormSize.width * elementSize.width,
			height: cropNormSize.height * elementSize.height
		};
		
		var cropAspect = cropSize.width / cropSize.height;
		var boxAspect = boxSize.width / boxSize.height;
		
		var scale;
		if (cropAspect > boxAspect) {
			// Crop is more landscape than box: fix height.
			scale = boxSize.height / cropSize.height;
		} else {
			// Crop is less landscape than box: fix width.
			scale = boxSize.width / cropSize.width;
		}
		var cropScaledSize = {
			width: scale * cropSize.width,
			height: scale * cropSize.height
		};
		
		var cropOffset = {
			x : (boxSize.width - cropScaledSize.width) / 2.0,
			y : (boxSize.height - cropScaledSize.height) / 2.0
		};
		
		var elementOffset = {
			x : -cropNormCoords[0][0] * elementSize.width * scale,
			y : -cropNormCoords[0][1] * elementSize.height * scale,
		};
		
		var elementScaledSize = {
			width: elementSize.width * scale,
			height: elementSize.height * scale
		};
		
		
		return {
			scale: scale,
			elementSize: elementSize,
			cropNormSize: cropNormSize,
			cropSize: cropSize,
			cropScaledSize: cropScaledSize,
			cropCoords: cropCoords,
			cropNormCoords: cropNormCoords,
			cropCoords: cropCoords,
			cropOffset: cropOffset,
			elementScaledSize: elementScaledSize,
			elementOffset: elementOffset
		};
	};
	
	/**
	 * Find a first parent item that is relative positioned.
	 * @param element: The original element. 
	 */
	ActiveBg.prototype.findWrapper = function() {
		var wrapper = this.element.parent();
		do {
			if (wrapper.css("position") == "relative") {
				break;
			}
			wrapper = wrapper.parent();
		} while (!wrapper.is(document));
		
		if (wrapper.is(document)) {
			console.log("The element needs a relative positioned ancestor.")
			return null;
		}
		
		return wrapper;
	};
	
	ActiveBg.prototype.measureBox = function() {
//		this.element.remove();
		var boxSize = {
			width: this.box.outerWidth(),
			height: this.box.outerHeight()
		};
//		this.box.prepend(this.element);
		return boxSize;
	};
	
	
	$(window).load(function() {
	    windowIsLoaded = true;
	});
	
	$.fn.activeBg = function(userSettings) {
		$(this).each(function() {
			var activeBg = new ActiveBg($(this), userSettings);
			activeBg.init();
		});			
	}
	
})(jQuery);