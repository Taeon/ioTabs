(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.iotabs = factory();
    }
}(
    this,
    function () {

		var iotabs = function( element, options ){

			this.element = $( element );
            this.current_tab_pos = 0;

			this.options = {
				tab_selector: '.tab',
				title_selector: 'h2'
            };

            // Overwrite options passed in on constructor
            if( typeof options !== 'undefined' ){
                for( var index in options ){
                    this.options[ index ] = options[ index ];
                }
            }

            // Grab any options from the element
            // https://stackoverflow.com/questions/36971998/can-i-get-all-attributes-that-begin-with-on-using-jquery
            [].slice.call(this.element[0].attributes).filter(function(attr) {
            	return attr && attr.name && attr.name.indexOf('data-iotabs-') === 0
            }).forEach(function(attr) {
            	this.options[attr.name.substr(14).replace( /\-/, '_' )] = attr.value;
            }.bind(this));
            this.options.search_min = parseInt( this.options.search_min );
            this.options.search = this.options.search && this.options.search !== '0';

			this.BuildTabs();
            $( window ).on( 'resize', $.proxy( this.onResize, this ) );
		}
		iotabs.prototype = {
            BuildTabs:function(){
				switch( typeof this.options.tab_selector ){
					case 'string':{
						this.tab_items = $( this.element ).find( this.options.tab_selector );
						break;
					}
					case 'function':{
						this.tab_items = this.options.tab_selector( this.element[ 0 ] );
						break;
					}
					default:{
						console.log( 'Invalid selector' );
						break;
					}
				}

				var tabs_html = '';
				for( var h = 0; h < this.tab_items.length; h++ ){
					var item = $( this.tab_items[ h ] );
					item.css( {left:'-'+(h * 100).toString() + '%'} );
                    item.addClass( 'iotab-item' );
					switch( typeof this.options.title_selector ){
						case 'string':{
							var title = item.find( this.options.title_selector )[ 0 ].innerHTML;
							break;
						}
						case 'function':{
							var title = this.options.title_selector( item[ 0 ] );
							break;
						}
						default:{
							console.log( 'ioTabs: Invalid selector' );
							break;
						}
					}

					tabs_html += '<li' + ((h == 0)?' class="current"':'') + '><span class="text">' + title + '</span></li>';
					item.addClass( 'iotabs-item' );
				}
				this.tabs = $( '<div class="iotabs-container"><a class="scroll left">Left</a><ul class="iotabs">' + tabs_html + '</ul><a class="scroll right">Right</a></div>' );
				$( this.element ).before( this.tabs );
				this.tabs.find( 'li' ).click( $.proxy( this.TabClicked, this ) );
                this.tabs.find( 'a.scroll' ).click( $.proxy( this.ScrollClicked, this ) );
                this.SelectTab( 0 );

                setTimeout(
                    $.proxy( this.onResize, this ),
                    0
                );

			},
            TabClicked:function( event ){
                // Add current class to clicked tab
				this.SelectTab( $(event.target).closest( 'li' ).index() );
            },
			SelectTab:function( index ){
                var tab = $( this.tabs.find( 'li' )[ index ] );
                // Clear class from all tabs
                this.tabs.find( 'li' ).removeClass( 'current' );
                // Add current class to clicked tab
				tab.addClass( 'current' );
                // Remove class from all tab items (content)
				this.tab_items.removeClass( 'iotabs-current' );
                // Add class to current item
				$( this.tab_items[ index ]).addClass( 'iotabs-current' );
			},
            onResize:function(){
                this.tabs.find( ' > ul' ).css( {left:0} );
                this.current_tab_pos = 0;
                this.tabs.find( 'a.scroll.left' ).removeClass( 'show' );
                if( this.tabs.width() < this.tabs.find( '>ul' ).width() ){
                    this.tabs.find( 'a.scroll.right' ).addClass( 'show' );
                } else {
                    this.tabs.find( 'a.scroll.right' ).removeClass( 'show' );
                }
            },
            ScrollClicked:function( event ){
                if( $( event.target ).closest( 'a' ).hasClass('right' )){
                    if( this.current_tab_pos < this.tabs.find( 'li' ).length - 1 ){
                        this.current_tab_pos++;
                        var left = $( this.tabs.find( 'li' ).get( this.current_tab_pos ) ).position().left;
                        this.tabs.find( 'a.scroll.left' ).addClass( 'show' );
                        left -= this.tabs.find( 'a.scroll.left' ).width();
                        if( this.tabs.width() + left > this.tabs.find( '> ul' ).width()) {
                            left = this.tabs.find( '> ul' ).width() - this.tabs.width();
                            this.tabs.find( 'a.scroll.right' ).removeClass( 'show' );
                        }
                        this.tabs.find( ' > ul' ).css( {left:-left} );
                    }
                } else {
                    if ( this.current_tab_pos > 0 ) {
                        this.current_tab_pos--;
                        var left = $( this.tabs.find( 'li' ).get( this.current_tab_pos ) ).position().left;
                        this.tabs.find( 'a.scroll.right' ).addClass( 'show' );
                        if ( this.current_tab_pos == 0 ) {
                            this.tabs.find( 'a.scroll.left' ).removeClass( 'show' );
                        } else {
                            left -= this.tabs.find( 'a.scroll.right' ).width();
                        }
                        this.tabs.find( ' > ul' ).css( {left:-left} );
                    }
                };
            }
		}

		return iotabs;
	}
)
);
