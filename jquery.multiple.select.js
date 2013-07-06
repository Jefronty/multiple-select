/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @version 0.0.1
 * @blog http://wenzhixin.net.cn
 * 
 * edited by Jefronty
 * added onClose variable [function] to be run once options are hidden
 * added label variable [string] to display in ms-choice div when no options are selected
 * changed click event handler
 */

(function($) {

	'use strict';

	function MultipleSelect($el, options) {
		var that = this;
		this.$el = $el.hide();
		this.options = options;

		this.$parent = $('<div class="ms-parent"></div>');
		this.$choice = $('<div class="ms-choice"><span>'+this.options.label+'</span><div></div></div>');
		this.$drop = $('<div class="ms-drop"></div>');
		this.$el.after(this.$parent);
		this.$parent.append(this.$choice);
		this.$parent.append(this.$drop);

		if (this.$el.attr('disabled')) {
			this.$choice.addClass('disabled');
		}
		this.$choice.css('width', $el.width() + 'px')
			.find('span').css('width', ($el.width() - 20) + 'px');
		this.$drop.css({
			width: $el.width() + 'px'
		});
		$('body').click(function(e) {
			//console.log(e.target.tagName);
			//console.log($(e.target).parents());
			if ($(e.target)[0] === that.$choice[0] || $(e.target).parents('.ms-choice')[0] === that.$choice[0]) {
				return;
			}
			if (($(e.target)[0] !== that.$drop[0] && $(e.target)[0].name !== 'selectItem' && e.target.tagName !== 'LABEL' && e.target.tagName !== 'LI') && $('.ms-drop').css('display')=='block'){
				that.close();
			}
		});
		if (this.options.isopen) {
			this.open();
		}
	}

	MultipleSelect.prototype = {
		constructor : MultipleSelect,

		init: function() {
			var html = ['<ul>'],
				multiple = this.options.multiple;
			if (this.options.selectAll) {
				html.push(
					'<li>',
						'<label>',
						'<input type="checkbox" name="selectAll" /> ',
						'[' + this.options.selectAllText + ']',
						'</label>',
					'</li>'
				);
			}
			this.$el.find('option').each(function() {
				var value = $(this).attr('value'),
					text = $(this).text();
				html.push(
					'<li' + (multiple ? ' class="multiple"' : '') + '>',
						'<label>',
						'<input type="checkbox" name="selectItem" value="' + value + '" /> ',
						text,
						'</label>',
					'</li>'
				);
			});
			html.push('</ul>');
			this.$drop.html(html.join(''));
			this.$drop.find('.multiple').css('width', this.options.multipleWidth + 'px');
			this.events();
		},

		events: function() {
			var that = this;
			this.$choice.off('click').click(function() {
				that[that.isopen ? 'close' : 'open']();
			});
			this.$drop.find('input[name="selectAll"]').off('click').click(function() {
				var checked = $(this).attr('checked') ? true : false;
				that.$drop.find('input[name="selectItem"]').attr('checked', checked);
			});
		},

		open: function() {
			if (this.$choice.hasClass('disabled')) {
				return;
			}
			this.isopen = true;
			this.$choice.find('>div').addClass('open');
			this.$drop.show();
		},

		close: function() {
			this.isopen = false;
			this.$choice.find('>div').removeClass('open');
			this.$drop.hide();
			this.$choice.find('>span').text(this.getSelects('text').join(', '));
			this.options.onClose();
		},

		//value or text, default: 'value'
		getSelects: function(type) {
			var values = [];
			this.$drop.find('input[name="selectItem"]:checked').each(function() {
				values.push(type === 'text' ? $(this).parent().text() : $(this).val());
			});
			if(values.length == 0)
				values.push(this.options.label);
			return values;
		},

		setSelects: function(values) {
			var that = this;
			this.$drop.find('input[name="selectItem"]').attr('checked', false);
			$.each(values, function(i, value) {
				that.$drop
					.find('input[name="selectItem"][value="' + value + '"]')
					.attr('checked', true);
			});
		},

		enable: function() {
			this.$choice.removeClass('disabled');
		},

		disable: function() {
			this.$choice.addClass('disabled');
		}
	};

	$.fn.multipleSelect = function() {
		var option = arguments[0], 
			args = arguments,

			value, 
			allowedMethods = ['getSelects', 'setSelects', 'enable', 'disable'];

		this.each(function() {
			var $this = $(this), 
				data = $this.data('multipleSelect'), 
				options = $.extend({}, $.fn.multipleSelect.defaults, typeof option === 'object' && option);

			if (!data) {
				data = new MultipleSelect($this, options);
				$this.data('multipleSelect', data);
			}

			if (typeof option === 'string') {
				if ($.inArray(option, allowedMethods) < 0) {
					throw "Unknown method: " + option;
				}
				value = data[option](args[1]);
			} else {
				data.init();
			}
		});

		return value ? value : this;
	};

	$.fn.multipleSelect.defaults = {
		isopen: false,
		selectAll: true,
		selectAllText: 'Select all',
		multiple: false,
		label: '',
		onClose: function(){},
		multipleWidth: 80
	};
})(jQuery);
