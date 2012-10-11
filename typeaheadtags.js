!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEADTAGS PUBLIC CLASS DEFINITION
  * ================================= */

  var TypeaheadTags = function (element, options) {
    this.$element = $(element);
    this.$typeaheadElement = this.$element.find('.typeahead');
    this.options = $.extend({}, $.fn.typeaheadTags.defaults, options);

    this.$typeaheadElement.typeahead( {
        source: this.options.source
      , items: this.options.items || 8
      , matcher: this.options.matcher 
      , sorter: this.options.sorter
      , highlighter: this.options.highlighter
      , updater: this.options.updater
      , item: this.options.item
    });

    // extend a few functions that bootstrap doesn't expose
    // through the options.
    // i do it this way because i prefer not to modify bootstrap
    // to the extent it can be avoided.
    this.monkeyPatch();

    if(this.options.renderTag) 
      this.renderTag = this.options.renderTag;

    this.$tagCollection = this.options.$tagCollection || this.$element.find('.tag-collection')
    this.tags = {};
    this.tagCount = 0;

    this.listen();
  }

  TypeaheadTags.prototype = {

    constructor: TypeaheadTags

  , listen: function () {

      this.$typeaheadElement
        .on('keydown',            $.proxy(this.keydown, this))
        .on('typeaheadselect',    $.proxy(this.change, this))
    }

  , monkeyPatch: function() {
      var t = this.$typeaheadElement.data('typeahead');

      // We depend on the old 'select' boottrap method.
      // keep it around so that we can call it.
      t.bootstrapSelect = t.select;

      // Extend the typeahead's select method with a proper event.
      // Instead of trying to make the input 'change' event work
      // (which is difficult and bug-prone), lets just have the
      // typeahead *tell* the oustide world that something has 
      // been selected.
      t.select = function() {
        var val = this.$menu.find('.active').data('data-value')
        var e = $.Event('typeaheadselect', {val: val});

        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return this.hide();

        return this.bootstrapSelect();      
      }

      if(this.options.render) 
        t.render = this.options.render;
    }    
  , keydown: function (e) {
      if(e.keyCode != 8)
        this.unhilight();

      switch(e.keyCode) {
        case 8:   // backspace
          if(this.$typeaheadElement.val() == '') {
            var h = $('.badge-warning');

            if(h.length == 0)
              // it's not hilighted for deletion
              this.hilightPrevTag();
            else
              // it's already hilighted for deletion
              this.deletePrevTag();
          }
          break
        case 27:  // escape
          this.$typeaheadElement.val('');
          break;
        case 13: //enter
          e.stopPropagation();
          e.preventDefault();
          break
      }
    }

  , change: function (e) {

      var that = this
        ;

      this.tags[this.tagCount] = e.val;

      this.renderTag(e.val);

      // remember how many tags we've got
      this.tagCount++;

      e.preventDefault();

      // clear the input field, and focus back to it.
      setTimeout(function(){that.$typeaheadElement.val(''); that.$typeaheadElement.focus();}, 0)
    }            

  , renderTag: function(val) {
      var that = this
        , tag = $('<li class="tagitem"></li>')
        , closeButton = $('<button class="close">&times;</button>')
        , tagSpan = $('<span class="badge badge-info"></span>')

        // build out the tag element.
        tag.attr('data-tag-id', id);
        tag.data('data-value', val);
        tagSpan.text(val);      
        tagSpan.prepend(closeButton);
        tag.append(tagSpan);

        // put the tag right before the typeahead input field.
        this.$typeaheadElement.insertBefore(tag);// append(tag);

        var index = this.tagCount;
        // click the 'x', destroy the tag.
        closeButton.on('click', function() { that.deleteTag(index); });        
    }

  , hasTag: function(tag) {
      for (name in this.tags) {
        if (this.tags.hasOwnProperty(name) && this.tags[name] == tag) {
          return true;
        }
      }
      return false;
    }

  , deletePrevTag: function() {
      var prev = this.$tagCollection.children('.tagitem').last();
      if(!prev)
        return;

      this.deleteTag(prev.attr('data-tag-id'));
    }    

   , unhilight: function() {
      var h = $('.badge-warning');

      h.removeClass('badge-warning');
      h.addClass('badge-info');
    }    

  , hilightPrevTag: function() {
      var prev = this.$tagCollection.children('.tagitem').last();
      if(!prev)
        return;

      prev.children('span').removeClass('badge-info');
      prev.children('span').addClass('badge-warning');
    }    

  , deleteTag: function(tagId) {
      var val = $('.tagitem[data-tag-id=' + tagId + ']').data('data-value')

      var e = $.Event('typeaheaddelete', {val: val});
      this.$element.trigger(e)

      $('.tagitem[data-tag-id=' + tagId + ']').remove();
      delete this.tags[tagId];
    }
  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  $.fn.typeaheadTags = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeaheadtags')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeaheadtags', (data = new TypeaheadTags(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeaheadTags.defaults = {
  }

  $.fn.typeaheadTags.Constructor = TypeaheadTags


 /* TYPEAHEAD DATA-API
  * ================== */

  $(function () {
    $('body').on('focus.typeaheadtags.data-api', '[data-provide="typeaheadtags"]', function (e) {
      var $this = $(this)
      if ($this.data('typeaheadtags')) return
      e.preventDefault()
      $this.typeaheadTags($this.data())
    })
  })

}(window.jQuery);
