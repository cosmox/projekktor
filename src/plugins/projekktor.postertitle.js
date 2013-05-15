/*
 * Projekktor II Plugin: Poster Title
 * VERSION: 1.0
 * DESC: Adds a Title-Container to the Poster screen - 
 *
 * under GNU General Public License
 * http://www.projekktor.com/license/
 */
var projekktorPostertitle = function(){};
jQuery(function($) {
projekktorPostertitle.prototype = {
    
    tc: {},
        
    /*****************************************
     * INIT
     ****************************************/    
    initialize: function() {
        
        this.tc = $('<div/>')
            .addClass('postertitle')
            .addClass('inactive')
        
        this.applyToPlayer( $p.utils.blockSelection(this.tc) );
        
	this.pluginReady = true;
    },
    
    
    /*****************************************
     * EVENT HANDLERS
     ****************************************/
    itemHandler: function() {
        if (this.tc.html()=='')
            this.tc.html(this.getConfig('title'));
    },
    
    stateHandler: function(state) {
        switch(state) {
            case 'IDLE':
                this.setActive(this.tc, this._setVisible());
                break;
            case 'STARTING':
                this.setActive(this.tc, false);                
                break;                
                
        }

    },
    
    mouseleaveHandler: function(obj) {
        var ref = this;
        if (!this._setVisible()) return;
        this.tc.stop(true, true).fadeOut('slow', function() {
            ref.setActive(ref.tc, false);
        });
    },
    
    mouseenterHandler: function(obj) {
        var ref = this;
        if (!this._setVisible()) return;
        this.tc.stop(true, true).fadeIn('fast', function() {
            ref.setActive(ref.tc, true);
        });
    },
    
    _setVisible: function() {
        if (!this.pp.getState('IDLE')) return false;
        
        var rel = this.pp.getDC().find("."+this.getConfig('cssClassPrefix') + 'related');
        if (rel.hasClass('active')) return false;

        return true;
    }
    
    
    
    
}
});
