// http://jqueryui.com/widget/
// http://api.jqueryui.com/jQuery.widget/
// https://learn.jquery.com/jquery-ui/widget-factory/how-to-use-the-widget-factory/

(function($) {
  $.widget( "formula.formattedfield", {
    // default options
    options: {
      value: null,
      editable: true,

      formatter: null,
      deformatter: null,

      // callbacks
      change: null,
    },

    // the constructor
    _create: function() {
      this.element.addClass( "formatted-field" );

      this.value = this.options['value'];

      if (this.value == null) {
        // value was not set with an option
        if (this.element.attr('value') != undefined) {
//          this.value = this.element.attr('value');
          this.value = this.element.val();
//console.log(this.value);
          if (typeof this.options.deformatter == 'function') {
            this.value = this.options.deformatter(this.value);
          }
        }
      }
      
      if (this.options.editable) {
        var widget = this;
        this.element.on( "change", function() {
          widget.setValueFromFormattedValue($(this).val());
        });
      }
      else {
        this.element.attr( "readonly", "readonly" );
      }


      this._refresh();
    },

    /* Get the unformatted value */
    getValue: function() {
      return this.value;
    },

    /* Set value */
    setValueFromFormattedValue: function(value) {
      if (typeof this.options.deformatter == 'function') {
        this.value = this.options.deformatter(value);
      }
      else {
        this.value = value;
      }

      this._refresh();
  
    },


    // called when created, when changing options, and when formula changes
    _refresh: function() {
      if (this.options.formatter) {
        this.element.val(this.options.formatter(this.value));
      }
      else {
        this.element.val(this.value);
      }

      // trigger a callback/event ("formattedfieldchange")
      this._trigger( "change" );

    },


    // events bound via _on are removed automatically
    // revert other modifications here
    _destroy: function() {
      this.element.removeClass( "formatted-field" );
    },

    // _setOptions is called with a hash of all options that are changing
    // always refresh when changing options
    _setOptions: function() {
      // _super and _superApply handle keeping the right this-context
      this._superApply( arguments );
      this._refresh();
    },

    // _setOption is called for each individual option that is changing
    _setOption: function( key, value ) {
      this._super( key, value );
    }
  });
})(jQuery);

