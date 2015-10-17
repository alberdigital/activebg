(function($) {
	
	function ActiveBg(element, userSettings) {
		var defaultSettings = {
			kenburns: {
				active: true,
				time: 10000,
				scaleStart: 1.2,
				scaleEnd: 0.9
			}
		};
		this.settings = $.extend(true, {}, defaultSettings, userSettings);
		this.element = element;
		this.box = null;
		this.wrapper = null;
	}
	
	ActiveBg.prototype.init = function() {
		this.box = this.findBox();
		var boxSize = this.measureBox(boxSize);
		this.wrapElement();
		this.element.addClass("activebg-element");
		this.resizeElement(boxSize);
		
		console.log("BoxSize", boxSize);
		
	};
	
	ActiveBg.prototype.wrapElement = function() {
		this.wrapper = $("<div />", { "class" : "activebg-wrapper" });
		this.element.remove();
		this.wrapper.prepend(this.element);
		this.box.prepend(this.wrapper);
	};
	
	ActiveBg.prototype.resizeElement = function(boxSize) {
		
		
		var kenburnsScale = 1;
		if (this.settings.kenburns.active) {
			var kenburnsScale = Math.max(this.settings.kenburns.scaleStart, this.settings.kenburns.scaleEnd);
		}
		
		var elementSize = {
			width: this.element.width() * kenburnsScale,
			height: this.element.height() * kenburnsScale
		}
		
		var elementAspect = elementSize.width / elementSize.height;
		var boxAspect = boxSize.width / boxSize.height;

		var scale;
		if (elementAspect > boxAspect) {
			// Element more landscape than box: fix height.
			scale = boxSize.height / elementSize.height;
		} else {
			// Element less landscape than box: fix width.
			scale = boxSize.width / elementSize.width;
		}
		
		var elementScaledSize = {
			width: scale * elementSize.width,
			height: scale * elementSize.height
		};
		
		this.element.width(elementScaledSize.width);
		this.element.height(elementScaledSize.height);
		
		// Center image.
		this.element.css({
			"top" : ((boxSize.height - elementScaledSize.height) / 2.0) + "px",
			"left" : ((boxSize.width - elementScaledSize.width) / 2.0) + "px",
		});
		
	};
	
	/**
	 * Find a first parent item that is relative positioned.
	 * @param element: The original element. 
	 */
	ActiveBg.prototype.findBox = function() {
		var box = this.element;
		do {
			box = box.parent();
			console.log("box", box);
			if (box.css("position") == "relative") {
				break;
			}
		} while (!box.is(document));
		
		return box;
	};
	
	ActiveBg.prototype.measureBox = function() {
		this.element.remove();
		var boxSize = {
			width: this.box.width(),
			height: this.box.height()
		};
		this.box.prepend(this.element);
		return boxSize;
	};
	
	$.fn.activeBg = function(userSettings) {
		var activeBg = new ActiveBg($(this), userSettings);
		activeBg.init();
	}
	
})(jQuery);