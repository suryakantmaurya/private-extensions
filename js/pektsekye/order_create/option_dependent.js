var OptionDependent = {};
var optionDependentInstanceId = 0;
var optionDependentInstances = [];

OptionDependent.Main = Class.create({


	
	initialize : function(){
	
		Object.extend(this, OptionDependent.Config);	

		this.oIds = [];
		this.oldV = [];	
		this.oldO = [];
		this.childrenVals = [];
		this.indByValue = [];
		this.valsByOption = [];
		this.optionByValue = [];
		this.univValsByOption = [];
		this.childOIdsByO = [];
		this.previousIds = [];
		this.childrenByOption = [];
		this.dependecyIsSet = false;
		
		this.load();
    this.reloadElements();        
    this.setDependency();	
    
		this.dependecyIsSet = true;	
		
		if (this.inPreconfigured)
			this.selectPreConfigured();			
	},	
	
	
	reloadElements : function(){
	
    var previousOptionId = -1;
    var isNewOption = true;
	
		$('product_composite_configure_form_fields').select('.product-custom-option').each(function(element){		
			 var optionId = 0;
			 element.name.sub(/[0-9]+/, function(match){
				  optionId = parseInt(match[0]);
			 });
			 
      if (optionId != previousOptionId)
        isNewOption = true;		        
		
	  	this.reloadElements_(element, optionId, isNewOption);	
	  	
			if (element.type == 'radio') {			
					element.observe('click', this.reloadChildrenTypeRadio.bind(this, optionId, element.value));								
			} else if(element.type == 'checkbox') {
					element.observe('click', this.reloadChildrenTypeCheckbox.bind(this, optionId));					
			} else if(element.type == 'select-one' && !Element.hasClassName(element,'datetime-picker')) {
					element.observe('change', this.reloadChildrenTypeSelectOne.bind(this, element, optionId));					
			} else if(element.type == 'select-multiple') {	
					element.observe('change', this.reloadChildrenTypeSelectMultiple.bind(this, element, optionId));		
			}	

		
	    previousOptionId = optionId;
	    isNewOption = false;
	  
		}.bind(this));		
	},
	
	
	reloadElements_ : function(element, optionId, isNewOption){
	
		if (isNewOption)
      this.oldO[optionId].dd = element.up('dd');
						
		if (element.type == 'radio' || element.type == 'checkbox') {
		
			if (isNewOption)
				this.oldO[optionId].firstelement = element;			

		  if (element.value){
			  var valueId = parseInt(element.value);					
				this.oldV[valueId].element = element;	
			}
			
		} else if(Element.hasClassName(element,'datetime-picker')) {
			
			if (isNewOption)
				this.oldO[optionId].element = element;		
				
		} else {	
		
			this.oldO[optionId].element = element;	
			
		}
	
	},
	
	
	load : function(){

		$('product_composite_configure_form_fields').select('.product-custom-option').each(function(element){
			 var optionId = 0;
			 element.name.sub(/[0-9]+/, function(match){
				  optionId = parseInt(match[0]);
			 });

			if (!this.oldO[optionId]){
				this.oldO[optionId] = {};		
				this.oldO[optionId].visible = true; 
				this.valsByOption[optionId] = [];
				this.oIds.push(optionId);	
				var c = 0;
			}
	
			if (element.type == 'radio' || element.type == 'checkbox') {
					
				this.setVars(optionId, element, c, null);					
				
			} else if(Element.hasClassName(element,'datetime-picker')) {
					
					
			} else if(element.type == 'select-one' || element.type == 'select-multiple') {	
			
				var options = $A(element.options);
				for (var i = 0, len = options.length; i < len; ++i){				
					this.setVars(optionId, element, i, options[i]);
				}		
					
			}
			c++;
		}.bind(this));
	},
	
	
	setVars : function(optionId, element, ind, option){
		
		var value = option ? option.value : element.value;
		if (value){
			var valueId = parseInt(value);					
			this.indByValue[valueId] = ind;
			this.valsByOption[optionId].push(valueId);
			this.optionByValue[valueId] = optionId;
			this.oldV[valueId] = {};
			this.oldV[valueId].visible = true;
			this.oldV[valueId].selected = false;			
			if (option)
				this.oldV[valueId].name = option.text;			

			if (this.config[1][valueId]){				
				if (this.config[1][valueId][0].length > 0){						
					if (!this.childOIdsByO[optionId])
						this.childOIdsByO[optionId] = [];
					this.childOIdsByO[optionId] = this.childOIdsByO[optionId].concat(this.config[1][valueId][0]);							
				}	
				if (this.config[1][valueId][1].length > 0){							
					this.childrenVals = this.childrenVals.concat(this.config[1][valueId][1]);								
					if (!this.childrenByOption[optionId])
						this.childrenByOption[optionId] = [];
					this.childrenByOption[optionId] = this.childrenByOption[optionId].concat(this.config[1][valueId][1]);
				}
			}
		}
	},
	
	setDependency : function(){
		var l = this.oIds.length;	
		for (var i=0;i<l;i++){
			var ll = this.valsByOption[this.oIds[i]].length;
			while (ll--){
				if (this.childrenVals.indexOf(this.valsByOption[this.oIds[i]][ll]) == -1){
					if (!this.univValsByOption[this.oIds[i]])
						this.univValsByOption[this.oIds[i]] = [];
					this.univValsByOption[this.oIds[i]].push(this.valsByOption[this.oIds[i]][ll]);
				}
			}
			var ids = this.getChildrenOptionIds(this.oIds[i]);
			if (ids.length > 0)
					this.childOIdsByO[this.oIds[i]] = ids;			
		}
		
		while (l--)	
			if (this.childOIdsByO[this.oIds[l]])
				this.reloadOptions(this.oIds[l], [], []);
	},
	
	getChildrenOptionIds : function(id){
		if (this.previousIds[id])
			return [];
		this.previousIds[id] = true;
		if (!this.childrenByOption[id] && !this.childOIdsByO[id])
			return [];		
		var optionIds = [];
		if (this.childOIdsByO[id]){
			this.childOIdsByO[id] = this.uniq(this.childOIdsByO[id]);
			optionIds = optionIds.concat(this.childOIdsByO[id]);
		}
		if (this.childrenByOption[id]){		
			var ids = this.uniq(this.childrenByOption[id]);		
			var l = ids.length;
			while (l--)
				if (optionIds.indexOf(this.optionByValue[ids[l]]) == -1)
					optionIds.push(this.optionByValue[ids[l]]);
		}
		var l = optionIds.length;
		while (l--){
			var ids = this.getChildrenOptionIds(optionIds[l]);
			if (ids.length > 0){
					this.childOIdsByO[optionIds[l]] = ids;
					optionIds = optionIds.concat(ids);
			}		
		}
		return optionIds;		
	},	
	
	showOption : function(id, element){
		if (!this.oldO[id].visible){
		  this.oldO[id].dd.show();
		  this.oldO[id].dd.previous().show();
		  
			if (element.type == 'file'){
				var disabled = false;
				
				if (this.inPreconfigured){
	        var inputBox = element.up('.input-box');
	        if (!inputBox.visible()){
						var inputFileAction = inputBox.select('input[name="options_'+ id +'_file_action"]')[0];
						inputFileAction.value = 'save_old';
						disabled = true;
					}	
				}
						
				element.disabled = disabled;				
			}		  
			
			if (element.hasClassName('was-required-entry')){				
        element.removeClassName('was-required-entry');
        element.addClassName('required-entry');		
			}			  
		  this.oldO[id].visible = true;
		}  
	},
	
	hideOption : function(id){
		if (this.oldO[id].visible){
			
			var element = this.oldO[id].element ? this.oldO[id].element : this.oldO[id].firstelement;
			
			if (this.dependecyIsSet){
				if (element.hasClassName('datetime-picker')){
					element.selectedIndex = 0; 
				} else if (element.type == 'text' || element.type == 'textarea') {				
					element.value = '';
				}	else if (element.type == 'file') {

	        if (this.inPreconfigured) {
	        	var inputBox = element.up('.input-box');
	        	if (!inputBox.visible()){
							var inputFileAction = inputBox.select('input[name="options_'+ id +'_file_action"]')[0];
							inputFileAction.value = '';															
						}	                
	        }
	        
					element.disabled = true;
				}
			}	
			
			if (element.hasClassName('required-entry')){				
        element.removeClassName('required-entry');
        element.addClassName('was-required-entry');		
			}			
			
		  this.oldO[id].dd.hide();
		  this.oldO[id].dd.previous().hide();
		  this.oldO[id].visible = false;
		}  
	},
	
	showValue : function(id, valueId, element){
	  if (element){			  
			element.up('li').show();	
			this.showOption(id, element);	
			if (element.hasClassName('was-validate-one-required-by-name')){				
        element.removeClassName('was-validate-one-required-by-name');
        element.addClassName('validate-one-required-by-name');		
			}			
		} else {
			var ind = this.oldO[id].element.options.length;
			this.oldO[id].element.options[ind] = new Option(this.oldV[valueId].name, valueId);
			this.indByValue[valueId] = ind;
			this.showOption(id, this.oldO[id].element);				
		}	
		this.oldV[valueId].visible = true;
	},
	
	resetValue : function(id, valueId, element){
	  if (element){
		   if (element.checked)	  
				element.checked = false;
		} else {
			var ind = this.indByValue[valueId];
			if (this.oldO[id].element.options[ind].selected){
				if (this.oldO[id].element.type == 'select-one')
					this.oldO[id].element.selectedIndex = 0;
				else 
					this.oldO[id].element.options[ind].selected = false;
			}
		}	
	},
	
	hideValue : function(id, valueId, element){
		
	  this.resetValue(id, valueId, element);
	  
	  if (element){		  
			element.up('li').hide();		
			if (element.hasClassName('validate-one-required-by-name')){				
        element.removeClassName('validate-one-required-by-name');
        element.addClassName('was-validate-one-required-by-name');		
			}					
		} else {
			var ind = this.indByValue[valueId];		
			this.oldO[id].element.options[ind] = null;
			this.indByValue[valueId] = null;
		}	
		
		this.oldV[valueId].visible = false;
	},	
	
  clearSelect : function(optionId){  
    var l = this.valsByOption[optionId].length;
    while (l--){      
      this.indByValue[this.valsByOption[optionId][l]] = null;
      this.oldV[this.valsByOption[optionId][l]].visible = false;					  
    }   			
    this.oldO[optionId].element.options.length = this.oldO[optionId].element.type == 'select-one' ? 1 : 0;                			        					       	   
  },		
  
	reloadValues : function(id, ids){
    var l = this.valsByOption[id].length;
    
    if (l == 0)
    	return;    
    
    if (this.oldO[id].element != undefined){
      this.clearSelect(id);        
      for (var i=0;i<l;i++) 	
	      if (ids.indexOf(this.valsByOption[id][i]) != -1)			
			      this.showValue(id, this.valsByOption[id][i]);			  			    		
    } else {
	    for (var i=0;i<l;i++){ 			
		    if (ids.indexOf(this.valsByOption[id][i]) != -1){		
			    if (!this.oldV[this.valsByOption[id][i]].visible)
				    this.showValue(id, this.valsByOption[id][i], this.oldV[this.valsByOption[id][i]].element);
			    else 
				    this.resetValue(id, this.valsByOption[id][i], this.oldV[this.valsByOption[id][i]].element);
		    } else if (ids.indexOf(this.valsByOption[id][i]) == -1 && this.oldV[this.valsByOption[id][i]].visible){	    
			    this.hideValue(id, this.valsByOption[id][i], this.oldV[this.valsByOption[id][i]].element);
		    }
	    }		
    }
	},
	
	reloadOptions : function(id, optionIds, valueIds){
	  var oId;
		var a = [];
		var l = valueIds.length;
		while (l--){
			oId = this.optionByValue[valueIds[l]];
			if (a[oId] == undefined)
				a[oId] = [];				
			a[oId].push(valueIds[l]);
		}

		l = this.childOIdsByO[id].length;
		while (l--){
		  oId = this.childOIdsByO[id][l];
			if (a[oId] != undefined){
				if (this.univValsByOption[oId])
					a[oId] = a[oId].concat(this.univValsByOption[oId]);			
				this.reloadValues(oId, a[oId]);					
			} else if (this.univValsByOption[oId] != undefined) {		
				this.reloadValues(oId, this.univValsByOption[oId]);
			} else if (optionIds.indexOf(oId) != -1){
				this.showOption(oId, this.oldO[oId].element);					
			} else {
        if (this.oldO[oId].element == undefined ||  this.oldO[oId].element.type == 'select-one' || this.oldO[oId].element.type == 'select-multiple')			
				  this.reloadValues(oId, []);	
				this.hideOption(oId);					
			}	
		}	
	}, 
	
	reloadChildrenTypeRadio : function(optionId, valueId){
		if (this.childOIdsByO[optionId]){		
			 if (!this.config[1][valueId]){
				this.reloadOptions(optionId, [], []);
			} else {	
				this.reloadOptions(optionId, this.config[1][valueId][0], this.config[1][valueId][1]);	
			}
		}
	},
	
	reloadChildrenTypeCheckbox : function(optionId){
		if (this.childOIdsByO[optionId]){		
			var optionIds = [];
			var valueIds = [];		
			var l = this.valsByOption[optionId].length;
			while (l--){	
				if (this.oldV[this.valsByOption[optionId][l]].element.checked && this.config[1][this.valsByOption[optionId][l]]){
					if (this.config[1][this.valsByOption[optionId][l]][0].length > 0)				
						optionIds = optionIds.concat(this.config[1][this.valsByOption[optionId][l]][0]);	
					if (this.config[1][this.valsByOption[optionId][l]][1].length > 0)
						valueIds = valueIds.concat(this.config[1][this.valsByOption[optionId][l]][1]);												
				}
			}				
			this.reloadOptions(optionId, this.uniq(optionIds), this.uniq(valueIds));
		}
	},
	
	reloadChildrenTypeSelectOne : function(element, optionId){
		var valueId = element.value;  		
		if (this.childOIdsByO[optionId]){		
			if (valueId == '' || !this.config[1][valueId]){
				this.reloadOptions(optionId, [], []);
			} else {	
				this.reloadOptions(optionId, this.config[1][valueId][0], this.config[1][valueId][1]);	
			}
		}
	},
	
	reloadChildrenTypeSelectMultiple : function(element, optionId){
		if (this.childOIdsByO[optionId]){
			var options = $A(element.options);
			var optionIds = [];
			var valueIds = [];			
			var l = options.length;
			while (l--){																			
				if (options[l].selected && this.config[1][options[l].value]){
					if (this.config[1][options[l].value][0].length > 0)				
						optionIds = optionIds.concat(this.config[1][options[l].value][0]);	
					if (this.config[1][options[l].value][1].length > 0)
						valueIds = valueIds.concat(this.config[1][options[l].value][1]);											
				}		
			}		
			this.reloadOptions(optionId, this.uniq(optionIds), this.uniq(valueIds));
		}
	},	
	
	uniq : function(a){
		var l=a.length,b=[],c=[];
		while (l--)
			if (c[a[l]] == undefined) b[b.length] = c[a[l]] = a[l];
		return b;
	},
	
	selectPreConfigured : function(){
  	var i,element,group,checkedIds,ids,ll;
		var l = this.oIds.length;	
		for (i=0;i<l;i++){
  		if (this.oldO[this.oIds[i]].visible){
			  if (this.oldO[this.oIds[i]].element){
			    element = this.oldO[this.oIds[i]].element;
			    group = 'select';				  
			  } else {
			    group = '';			  
			  }
		    checkedIds = this.config[0][this.oIds[i]];
		    ids = this.valsByOption[this.oIds[i]];
			  ll = ids.length;		
			  while (ll--){
				  if (this.oldV[ids[ll]].visible && checkedIds.indexOf(ids[ll]) != -1){
            if (group == 'select'){	
              if (element.type == 'select-one')
                element.selectedIndex = this.indByValue[ids[ll]];   
              else
                element.options[this.indByValue[ids[ll]]].selected = true;                       
            } else {
              element = this.oldV[ids[ll]].element;
              element.checked = true;
              if(element.type == 'radio')
               this.reloadChildrenTypeRadio(this.oIds[i], element.value);
              else 
               this.reloadChildrenTypeCheckbox(this.oIds[i]);                                
            }
				  }		
			  }	
        if (group == 'select'){
          if(element.type == 'select-one')
				    this.reloadChildrenTypeSelectOne(element, this.oIds[i]);		
				  else	  		
					  this.reloadChildrenTypeSelectMultiple(element, this.oIds[i]);        
        }			   
			}
		}		
	}
});
