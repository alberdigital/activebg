(function($) {
	
	function ActiveBg(element, userSettings) {
		var defaultSettings = {
			debug : {
				drawCrop: false,
				hideCropped: true
			},
			kenburns: {
				active: true,
				time: 10000,
				cropStart: [
				            	[0.2, 0.2],
				            	[0.8, 0.8]
				            ],
				cropEnd: [
				           		[0.0, 0.5], 
				           		[0.0, 0.5]
				          ]
			}
		};
		this.settings = $.extend(true, {}, defaultSettings, userSettings);
		this.element = element;
		this.wrapper = null;
		this.box = null;
	}
	
	ActiveBg.prototype.init = function() {
		this.wrapper = this.findWrapper();
		if (this.wrapper != null) {
			this.boxElement();
			var boxSize = this.measureBox(boxSize);
			this.element.addClass("activebg-element");
			
			//this.resizeElement(boxSize);
			var elementSize = {
				width: this.element.width(),
				height: this.element.height()
			};
			
			var elementCoordsStart = this.calcElementCoords(boxSize, elementSize)
			
			this.element.css(elementCoordsStart.styles);
			
			this.drawCrop(elementCoordsStart);
		}
		
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
	
	ActiveBg.prototype.calcElementCoords = function(boxSize, elementSize) {
		var cropCoords = this.settings.kenburns.cropStart;
		
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
		
		// Center image.
		var styles = {
			"width": elementScaledSize.width,
			"height": elementScaledSize.height,
			"left": (elementOffset.x + cropOffset.x) + "px",
			"top": (elementOffset.y + cropOffset.y) + "px"
		};
		
//		console.log("cropNormSize", cropNormSize);
//		console.log("cropAspect", cropAspect);
//		console.log("cropScaledSize", cropScaledSize);
//		console.log("boxSize", boxSize);
//		console.log("scale", scale);
//		console.log("cropOffset", cropOffset);
//		console.log("elementOffset", elementOffset);
//		console.log("elementScaledSize", elementScaledSize);
//		console.log("styles", styles);
		
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
		var activeBg = new ActiveBg($(this), userSettings);
		activeBg.init();
	}
	
})(jQuery);