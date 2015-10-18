(function($) {
	
	function ActiveBg(element, userSettings) {
		var defaultSettings = {
			css3 : true,
			debug : {
				drawCrop: false,
				hideCropped: true
			},
			crop: [
			       		[0.2, 0.2],
			       		[0.8, 0.8]
			       ],
			kenburns: {
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
			this.boxElement();
			this.boxSize = this.measureBox();
			this.element.addClass("activebg-element");
			
			//this.resizeElement(boxSize);
			this.elementSize = {
				width: this.element.width(),
				height: this.element.height()
			};

			this.setElementStyles(this.settings.crop);

			if (this.settings.kenburns.active) {
				$({normalizedTime: 0}).animate({normalizedTime: 1}, {
					duration: self.settings.kenburns.duration,
					easing: self.settings.kenburns.easing,
					step: function(normalizedTime) {
						self.updateElementStyles(normalizedTime);
					}
				});
			}
		}
		
	};
	
	ActiveBg.prototype.updateElementStyles = function(normalizedTime) {
		var cropStart = this.settings.crop;
		var cropEnd = this.settings.kenburns.cropEnd;
		var cropStep = [
		                [cropStart[0][0] + normalizedTime * (cropEnd[0][0] - cropStart[0][0]), cropStart[0][1] + normalizedTime * (cropEnd[0][1] - cropStart[0][1])],
		                [cropStart[1][0] + normalizedTime * (cropEnd[1][0] - cropStart[1][0]), cropStart[1][1] + normalizedTime * (cropEnd[1][1] - cropStart[1][1])]
		                ];
		
		this.setElementStyles(cropStep);
	};

	ActiveBg.prototype.setElementStyles = function(crop) {
		var elementCoords = this.calcElementCoords(this.boxSize, this.elementSize, crop)
		this.element.css(elementCoords.styles);
		this.drawCrop(elementCoords);
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
	
	ActiveBg.prototype.boxElement = function() {
		this.box = $("<div />", { "class" : "activebg-box" });
		if (!this.settings.debug.hideCropped) {
			this.box.css("overflow", "visible");
		}
		this.element.remove();
		this.box.prepend(this.element);
		this.wrapper.prepend(this.box);
	};
	
	ActiveBg.prototype.calcElementCoords = function(boxSize, elementSize, crop) {
		var cropCoords = crop;
		
		var cropNormSize = {
			width: cropCoords[1][0] - cropCoords[0][0],
			height: cropCoords[1][1] - cropCoords[0][1]
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
			x : -cropCoords[0][0] * elementSize.width * scale,
			y : -cropCoords[0][1] * elementSize.height * scale,
		};
		
		var elementScaledSize = {
			width: elementSize.width * scale,
			height: elementSize.height * scale
		};
		

		var styles = this.settings.css3 ? 
			{
				"transform-origin": "0 0",
				"transform": "" 
					+ " translateX(" + (elementOffset.x + cropOffset.x) + "px)"
					+ " translateY(" + (elementOffset.y + cropOffset.y) + "px)"
					+ " scale(" + scale + ")"
			}
			:{
				
				"width": elementScaledSize.width,
				"height": elementScaledSize.height,
				"left": (elementOffset.x + cropOffset.x) + "px",
				"top": (elementOffset.y + cropOffset.y) + "px"
			};
		
		return {
			scale: scale,
			styles: styles,
			cropSize: cropSize,
			cropScaledSize: cropScaledSize,
			cropOffset: cropOffset
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
		this.element.remove();
		var boxSize = {
			width: this.box.outerWidth(),
			height: this.box.outerHeight()
		};
		this.box.prepend(this.element);
		return boxSize;
	};
	
	$.fn.activeBg = function(userSettings) {
		$(this).each(function() {
			var activeBg = new ActiveBg($(this), userSettings);
			activeBg.init();
		});			
	}
	
})(jQuery);