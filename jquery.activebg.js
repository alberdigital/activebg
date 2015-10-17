(function($) {
	
	function ActiveBg(element, userSettings) {
		var defaultSettings = {
				
		};
		this.settings = $.extend({}, defaultSettings, userSettings);
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
		
		var elementSize = {
			width: this.element.width(),
			height: this.element.height()
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
		
		this.element.width(scale * elementSize.width);
		this.element.height("auto");
		
		// Set element aspect.
		this.element.css({
			"top" : ((boxSize.height - elementSize.height) / 2.0) + "px",
			"left" : ((boxSize.width - elementSize.width) / 2.0) + "px",
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