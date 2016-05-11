/*
The cell widget merges the functionality of calculatedfield and formattedfield into one widget

*/

$(function() {
  $.widget( "formula.cell", {
    // default options
    options: {
      // Options relevant when its a formula:
      formula: null,

      // Options relevant when its just a formatted field
      editable: true,     // Note: formulas will never be editable in this widget
      value: null,        
      deformatter: null,

      // Options relevant both for formulas and formatted fields:      
      formatter: null,

      // callbacks
      change: null,
    },

    // the constructor
    _create: function() {

      this.element.addClass( "cell" );

      // Formulas...
      if (this.options.formula == null) {
        if (this.element.attr('data-formula') !== undefined) {
          this.options.formula = this.element.attr('data-formula');
        }
      }
      if (this.options.formula != null) {
        this.element.attr( "readonly", "readonly" );
        this._createFormulaObject();
        this.value = this.formula.calc();
        this._refresh();
        return;
      }

      // Formatted fields...
      this.value = this.options['value'];
      if (this.value == null) {
        // value was not set with an option
        if (this.element.attr('value') != undefined) {
//          this.value = this.element.attr('value');

          // Not sure if its a good idea to initialize with the value...
          // This code may go away one day
          this.value = this.element.val();
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

    /* Returns 'unformatted' value */
    getValue: function() {
      return this.value;
    },

    _refresh: function() {
      if (this.options.formatter) {
        this.element.val(this.options.formatter(this.value));
      }
      else {
        this.element.val(this.value);
      }

      // trigger a callback/event ("cellchange")
      this._trigger( "change" );
    },


    _destroy: function() {
      this.element.removeClass( "cell" );
      this.unbindReferences();  // This is only relevant for formulas - but does not hurt formatted fields
    },

    _setOptions: function() {
      this._superApply( arguments );
      this._refresh();
    },

    _setOption: function( key, value ) {
      if (key == 'formula') {
        this.options.formula = value;
        this._createFormulaObject();
        this.value = this.formula.calc();
      }
      this._super( key, value );
    },

    hasFormula: function () {
      return (this.formula instanceof Formula);
    },

    /* Methods relevant for formulas only
       ----------------------------------  */ 

    isFormulaValid: function() {
      return ((this.formula instanceof Formula) && (!this.formula.parseError()));
    },

    unbindReferences: function() {
      if (this.isFormulaValid()) {
        this.formula.unbindReferences();
      }
    },

    bindReferences: function() {
      if (this.isFormulaValid()) {
        this.formula.bindReferences();
      }
    },

    calc: function() {
      if (this.isFormulaValid()) {
        this.value = this.formula.calc();
        this._refresh();
      }
    },

    _createFormulaObject: function() {
      var widget = this;

      // If there is an existing formula, remove its event handlers
      this.unbindReferences();

      this.formula = new Formula(this.options.formula, function() {
        var oldValue = widget.value;

        widget.value = widget.formula.calc();

        if (oldValue != widget.value) {

          // Refresh. This formats the value and triggers a "calculatedfieldchange" event
          widget._refresh();

          // Trigger a change event on the input element, in case another formula is listening
          widget.element.trigger('change');
        }
      }, this.element);

    },


    /* Methods relevant for calculated fields only
       -------------------------------------------  */ 

    setValueFromFormattedValue: function(value) {
      if (typeof this.options.deformatter == 'function') {
        this.value = this.options.deformatter(value);
      }
      else {
        this.value = value;
      }

      this._refresh();
    },

    /* Set the 'unformatted' value */
    setValue: function(value) {
      console.log(value)
      this.value = value;
      this._refresh();
    },

  });
});

