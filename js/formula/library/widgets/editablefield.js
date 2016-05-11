// http://jqueryui.com/widget/
// http://api.jqueryui.com/jQuery.widget/
// https://learn.jquery.com/jquery-ui/widget-factory/how-to-use-the-widget-factory/

(function($) {
  $.widget( "formula.editablefield", {
    // default options
    options: {
      formula: null,
      manualValue: null,
      editable: true,

      formatter: null,
      deformatter: null,

      // callbacks
      change: null,
    },

    // the constructor
    _create: function() {

      this.manualValue = this.options['manualValue'];
      
      if (this.options.formula == null) {
        if (this.element.attr('data-formula') !== undefined) {
          this.options.formula = this.element.attr('data-formula');
        }
        else {
          this.options.formula = '""';
        }
      }

      this._createFormulaObject();

      if (this.options['manualValue'] != null) {
        this.element.addClass('manually-edited');
      }
      else {
        this.formulaResult = this.formula.calc();
      }

      if (this.options.editable) {
        this.element.addClass( "editable-field" );

        var widget = this;
        this.ignoreNextChangeEvent = false;

        this.element.on( "change", function() {
          if (widget.ignoreNextChangeEvent) {
            widget.ignoreNextChangeEvent = false;
          }
          else {
            widget.setManualValue($(this).val());
          }
        });
      }
      else {
        this.element.attr( "readonly", "readonly" );
      }


      this._refresh();
    },

    /* Get result of formula, disregarding manually edit (unformatted) */
    getFormulaResult: function() {
      return this.formulaResult;
    },

    /* Get the unformatted value (be it a result of formula, or the manually edited value */
    getValue: function() {
      return this.value;
    },

    /* Set manual value */
    setManualValue: function(manualValue) {
      var changedState = false;

      this.manualValue = null;
      if (manualValue == '') {
        this.manualValue = null;
        this.formulaResult = this.formula.calc();

        if (this.element.hasClass('manually-edited')) {
          this.element.removeClass( "manually-edited" );
          changedState = true;
        }
      }
      else {
        if (!this.element.hasClass('manually-edited')) {
          this.element.addClass('manually-edited');
          changedState = true;
        }
        if (typeof this.options.deformatter == 'function') {
          this.manualValue = this.options.deformatter(manualValue);
        }
        else {
          this.manualValue = manualValue;
        }

      }
      this._refresh();
  
      if (changedState) {
        // trigger a callback/event ("editablefieldstatechange")
        this._trigger( "statechange" );
      }
//      this.element.trigger('change');
    },

    _createFormulaObject: function() {
      var widget = this;

      // If there is an existing formula, remove its event handlers
      if ((this.formula instanceof Formula) && (!this.formula.parseError())) {
        this.formula.formulaFragment.removeChangeHandlers();
      }

      this.formula = new Formula(this.options.formula, function() {
        var oldResult = widget.formulaResult;

        widget.formulaResult = widget.formula.calc();


        if ((oldResult != widget.formulaResult) && (widget.manualValue == null)) {

          // Refresh. This formats the value and triggers a "editablefieldchange" event
          widget._refresh();

          // Trigger a change event on the input element, in case another formula is listening
          // But prevent our own listener from reacting, because this change should not
          // cause the field to set its manual value
          widget.ignoreNextChangeEvent = true;
          widget.element.trigger('change');
        }

      });
      
    },

    // called when created, when changing options, and when formula changes
    _refresh: function() {
      this.value = ((this.manualValue == null) ? this.formulaResult : this.manualValue);
      if (this.options.formatter) {
        this.element.val(this.options.formatter(this.value));
      }
      else {
        this.element.val(this.value);
      }

      // trigger a callback/event ("editablefieldchange")
      this._trigger( "change" );

    },


    // events bound via _on are removed automatically
    // revert other modifications here
    _destroy: function() {
      this.element.removeClass( "calculated-field" )
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
      if (key == 'formula') {
        this.options.formula = value;
        this._createFormulaObject();
        this.value = this.formula.calc();
      }
      this._super( key, value );
    }
  });
})(jQuery);

