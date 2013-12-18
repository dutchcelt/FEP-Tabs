/*! ###########################################################################

 Source: https://github.com/dutchcelt/FEP-Tabs
 Version: 0.4.3
 
 Copyright (C) 2011 - 2013, C. Egor Kloos. All rights reserved.
 GNU General Public License, version 3 (GPL-3.0)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see http://www.opensource.org/licenses/gpl-3.0.html

 ########################################################################### */


(function( factory ){

	"use strict";

	if( typeof define === 'function' && define.amd ){
		// AMD. Register as an anonymous module.
		define( ['FEP-Tabs'], factory );
	} else {
		// Browser globals
		factory( window );
	}

})( function(){

	"use strict";

	//  Detect if the FEP namespace is available. (FEP = Front-end Patterns)
	window.FEP = window.FEP || {};
	FEP.supports = FEP.supports || {};
	
	FEP.supports.historyState = ( history.replaceState ) ? true : false;

	FEP.tabs = function( selector, settings ){
	
		var createCustomEvent = function( eventName, data ){
			var newEvent;
			try {
				newEvent = new CustomEvent( eventName, {
				    'bubbles'	: true,
				    'cancelable': true,
				    'detail'	: data
				});
			} catch (e) {
				newEvent = document.createEvent( 'CustomEvent' );
				newEvent.initCustomEvent( eventName, true, true, data);
			} finally {
				return newEvent;
			}
		};	
		
		var selectorArray = function( selector, domElem ){
			return Array.prototype.slice.call( ( domElem || document ).querySelectorAll( selector ) );
		};
		
		//	Regular expression function to help with HTML class attributes
		var classNameRegEx = function( classNameString ) {
			var newRegEx = new RegExp("(?:^|\\s)" + classNameString + "(?!\\S)","g");
			return newRegEx;
		};
		
		//	Invoke with call() to pass the DOM context via 'this'
		var stripClassName = function( classNameString ){
			selectorArray( "." + classNameString, this.elem ).forEach( function( domElem ){
				domElem.className = domElem.className.replace( classNameRegEx( classNameString ), '' );
			} );
		};	
		var addClassName = function( classNameString ){
			if( !classNameRegEx( classNameString ).test( this.className ) ) {
				this.className += " " + classNameString
			}
		};	
				
		//	Window related vars
		var scrollLocation;
		var hash = window.location.hash || "";
		
		//	Defaults for setting history state and the ability to customise HTML class attributes
		var defaults = {
			historyState: this.supports.historyState,
			tabClass : "tabs-tab",
			paneClass: "tabs-pane",
			linkClass: "tabs-tab-link",
			targetClass : "target",
			activeClass : "active"
		}
		var options = Object.create( defaults ); // Add 'defaults' to __proto__
		for (var key in settings) { options[key] = settings[key]; }
		
		//	Custom events
		var loadhash = createCustomEvent( "loadhash" );
		var loadTAB = createCustomEvent( "loadTAB" );
		
		
		var tabs = {

			tabEvent: function( event ){
							
				if( event.target.className.indexOf( options.linkClass ) < 0 ){
					return false;
				}
				scrollLocation = document.documentElement.scrollTop;
				hash = event.target.getAttribute( 'href' );

				if( event.type === "loadhash" ){
					this.hashEvent( event );
				} else if( !options.historyState ){
					window.location.hash = hash.substr( 1 );
				} else {
					if( event.type === "click" ){
						history.pushState( {}, document.title, hash );
					}
					if( event.type === "loadTAB" ){
						history.replaceState( {}, document.title, hash );
					}
					this.hashEvent();
				}

			},

			hashEvent: function(){
				hash = window.location.hash;
				if( this.elem.querySelectorAll( hash ).length === 0 ){ return false; };
				document.documentElement.scrollTop = scrollLocation
				this.setTab();
			},

			setTab: function(){

				stripClassName.call( this, options.targetClass );
				stripClassName.call( this, options.activeClass );
				
				if( hash ){
					addClassName.call( this.elem.querySelector( hash ), options.targetClass );
					addClassName.call( this.elem.querySelector( "." + options.linkClass + "[href='" + hash + "']" ).parentNode, options.activeClass );
				}
			},
			
			handleEvent: function( event ){
				
				event.preventDefault();
			
				switch(event.type) {
			    	case 'click':
			        	this.tabEvent( event );
						break;
					case 'loadhash':
			        	this.tabEvent( event );
						break;
			        case 'loadTAB':
			        	this.tabEvent( event );
						break;
					case 'hashchange':
						this.hashEvent( )
						break;
			    }
				
			},
			
			init: function(){

				this.elem.className += " loaded";

				//  Attach events
				this.elem.addEventListener( 'click', this, true );
				this.elem.addEventListener( 'loadhash', this, true );
				this.elem.addEventListener( 'loadTAB', this, true );

				window.addEventListener( 'hashchange', this, true );


				//  Load a tab!
				if( !window.location.hash ){
					this.elem.querySelector( "." + options.linkClass ).dispatchEvent( loadTAB )
				} else if( this.elem.querySelectorAll( window.location.hash ).length > 0 ){
					this.elem.querySelector( "." + options.linkClass + "[href='" + window.location.hash + "']" ).dispatchEvent( loadhash )
				} else if( this.elem.querySelectorAll( window.location.hash ).length === 0 ){
					this.elem.querySelector( "." + options.tabClass ).className +=  " " + options.activeClass;
					this.elem.querySelector( "." + options.paneClass ).className += " " + options.targetClass;
				}
			}

		};

		return (function(){

			selectorArray( selector ).forEach( function( domElem ){
				var newTabs = Object.create( tabs );
				newTabs.elem = domElem;
				newTabs.init();
			} );

		})();

	};

} );