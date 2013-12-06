/*! ###########################################################################

 Source: https://github.com/dutchcelt/FEP-Tabs
 Version: 0.4.1
 
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
	if( window.FEP === void 0 ){
		window.FEP = { 'supports': {} };
	}

	FEP.supports.historyState = ( history.replaceState ) ? true : false;
	
	///////////////////////////////////////////////////////////////////////
	//	Little script to create custom events. 
	//	IE doesn't support the constructor technique 
	//	added the createEvent() as a fallback
	FEP.createCustomEvent = function( eventName, data ){
		var newEvent;
		try {
			newEvent = new CustomEvent( eventName, {
			    'bubbles'	: true,
			    'cancelable': true,
			    'detail'	: data
			});
		} catch (e) {
			newEvent = document.createEvent( 'Event' );
			newEvent.initEvent( eventName, true, true );
		} finally {
			return newEvent;
		}
	};
	///////////////////////////////////////////////////////////////////////
	
	
	FEP.tabs = function( selector, settings ){
		
		//	Put all nodelist elements from 'selector' in to an array
		var tabBlocks = Array.prototype.slice.call( document.querySelectorAll( selector ) );
		
		//	Window related vars
		var scrollLocation;
		var hash = window.location.hash || "";
		
		//	Defaults for setting history state and the ability to customise HTML class attributes
		var defaults = {
			historyState: this.supports.historyState,
			tab : "tabs-tab",
			pane: "tabs-pane",
			link: "tabs-tab-link",
			target : "target",
			active : "active"
		}
		var options = Object.create( defaults ); // Add 'defaults' to __proto__
		for (var key in settings) { options[key] = settings[key]; }
		
		//	Custom events
		var loadhash = this.createCustomEvent( "loadhash" );
		var loadTAB = this.createCustomEvent( "loadTAB" );
		
		//	Regular expressions to strip out HTML class attributes
		var regExpTarget = new RegExp("(?:^|\\s)" + options.target + "(?!\\S)","g");
		var regExpActive = new RegExp("(?:^|\\s)" + options.active + "(?!\\S)","g");

		
		var fn = {

			tabEvent: function( event ){
			
				event.preventDefault();
				
				if( event.target.className.indexOf( options.link ) < 0 ){
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
					this.hashEvent( event );
				}

			},

			hashEvent: function( event ){
				event.preventDefault();
				hash = window.location.hash;
				if( this.elem.querySelectorAll( hash ).length === 0 ){ return false; };
				document.documentElement.scrollTop = scrollLocation
				this.setTab();
			},

			setTab: function(){

				var target = this.elem.querySelector( "." + options.target );
				var active = this.elem.querySelector( "." + options.active );
				if( target ){
					target.className = target.className.replace( regExpTarget, '' );
				}
				if( active ){
					active.className = active.className.replace( regExpActive, '' );
				}
				
				if( hash ){
					this.elem.querySelector( hash ).className += " " + options.target;
					this.elem.querySelector( "." + options.link + "[href='" + hash + "']" ).parentNode.className += " " + options.active;
				}
			},

			init: function(){

				this.elem.className += " loaded";

				//  Attach events
				this.elem.addEventListener( 'click', this.tabEvent.bind( this ), false );
				this.elem.addEventListener( 'loadhash', this.tabEvent.bind( this ), false );
				this.elem.addEventListener( 'loadTAB', this.tabEvent.bind( this ), false );

				window.addEventListener( 'hashchange', this.hashEvent.bind( this ), false );


				//  Load a tab!
				if( !window.location.hash ){
					this.elem.querySelector( "." + options.link ).dispatchEvent( loadTAB )
				} else if( this.elem.querySelectorAll( window.location.hash ).length > 0 ){
					this.elem.querySelector( "." + options.link + "[href='" + window.location.hash + "']" ).dispatchEvent( loadhash )
				} else if( this.elem.querySelectorAll( window.location.hash ).length === 0 ){
					this.elem.querySelector( "." + options.tab ).className +=  " " + options.active;
					this.elem.querySelector( "." + options.pane ).className += " " + options.target;
				}
			}

		};

		return (function(){

			tabBlocks.forEach( function( tabsElem ){
				var newFn = Object.create( fn );
				newFn.elem = tabsElem;
				newFn.init();
			} );

		})();

	};

} );