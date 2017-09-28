var OptionDependent = {};

OptionDependent.Main = Class.create({

	oIds : [],
	oldV : [],	
	oldO : [],
	childrenVals : [],
	indByValue : [],
	valsByOption : [],
	optionByValue : [],
	univValsByOption : [],
	childOIdsByO : [],
	previousIds : [],
	childrenByOption : [],
	dependecyIsSet : false,
	
	initialize : function(){
	
		Object.extend(this, OptionDependent.Config);	
		
		this.load();
		
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
				
		this.dependecyIsSet = true;		
		
		if (this.inPreconfigured)
			this.selectPreConfigured();	
			
    var optionsContainer = $('product-options-wrapper');
    if (optionsContainer){
      optionsContainer.onclick = function(){}; // to make checkbox label tag work on iPhone 
    }				
	},	
	
	load : function(){
		var c = 0;
		$$('.product-custom-option').each(function(element){
			 var optionId = 0;
			 element.name.sub(/[0-9]+/, function(match){
				  optionId = parseInt(match[0]);
			 });
			 
			 if (!this.oldO[optionId]){
				this.oldO[optionId] = {};
				this.oldO[optionId].dd = element.up('dd');				
				this.oldO[optionId].visible = true; 
				this.valsByOption[optionId] = [];
				this.oIds.push(optionId);
				var c = 0;				
			}

			 if (element.type == 'radio' || element.type == 'checkbox') {	
			 
				element.checked = false;		
			
				if (c == 0) 
					this.oldO[optionId].firstelement = element;
					
				if (element.value != ''){
					var valueId = parseInt(element.value);					
					this.indByValue[valueId] = c;
					if (this.config[1][valueId]){
						if (this.config[1][valueId][0].length > 0){						
							if (!this.childOIdsByO[optionId])
								this.childOIdsByO[optionId] = [];
							this.childOIdsByO[optionId] = this.childOIdsByO[optionId].concat(this.config[1][valueId][0]);							
						}	
						if (this.config[1][valueId][1]){							
							this.childrenVals = this.childrenVals.concat(this.config[1][valueId][1]);								
							if (!this.childrenByOption[optionId])
								this.childrenByOption[optionId] = [];
							this.childrenByOption[optionId] = this.childrenByOption[optionId].concat(this.config[1][valueId][1]);
						}
					}	
					this.valsByOption[optionId].push(valueId);
					this.optionByValue[valueId] = optionId;
					this.oldV[valueId] = {};					
					this.oldV[valueId].element = element;
					this.oldV[valueId].visible= true;
				}
				
				if (element.type == 'radio'){
					element.observe('click', this.reloadChildrenTypeRadio.bind(this, optionId, element.value));		
				} else {
					element.observe('click', this.reloadChildrenTypeCheckbox.bind(this, optionId));	
				}	
			} else if(element.hasClassName('datetime-picker')) {
				if (!this.oldO[optionId].element)
					this.oldO[optionId].element = element;		
			} else if(element.type == 'select-one' || element.type == 'select-multiple') {	
			
				this.oldO[optionId].element = element;
				var options = $A(element.options);
				for (var i = 0, len = options.length; i < len; ++i){
				
					options[i].selected = false;				
				
					if (options[i].value != ''){
						var valueId = parseInt(options[i].value);						
						this.indByValue[valueId] = i;
						if (this.config[1][valueId]){
							if (this.config[1][valueId][0].length > 0){						
								if (!this.childOIdsByO[optionId])
									this.childOIdsByO[optionId] = [];
								this.childOIdsByO[optionId] = this.childOIdsByO[optionId].concat(this.config[1][valueId][0]);							
							}
							if (this.config[1][valueId][1]){							
								this.childrenVals = this.childrenVals.concat(this.config[1][valueId][1]);								
								if (!this.childrenByOption[optionId])
									this.childrenByOption[optionId] = [];
								this.childrenByOption[optionId] = this.childrenByOption[optionId].concat(this.config[1][valueId][1]);
							}
						}
						this.valsByOption[optionId].push(valueId);
						this.optionByValue[valueId] = optionId;						
						this.oldV[valueId] = {};
						this.oldV[valueId].visible = true;
						this.oldV[valueId].name = options[i].text;						
					}	
				}
				
				if	(element.type == 'select-one'){
					element.observe('change', this.reloadChildrenTypeSelectOne.bind(this, element, optionId));
				} else {
					element.observe('change', this.reloadChildrenTypeSelectMultiple.bind(this, element, optionId));					
				}
				
			} else {	
				this.oldO[optionId].element = element;			
			}
			
			c++;
		}.bind(this));
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
		  
		  this.oldO[id].visible = true;
		}  
	},
	
	hideOption : function(id){
		if (this.oldO[id].visible){
			
			if (this.dependecyIsSet){
				var element = this.oldO[id].element ? this.oldO[id].element : this.oldO[id].firstelement;
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
			
		  this.oldO[id].dd.hide();
		  this.oldO[id].dd.previous().hide();
		  this.oldO[id].visible = false;
		}  
	},
	
	showValue : function(id, valueId, element){
	  if (element){			  
			element.up('li').show();	
			this.showOption(id, element);				
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
			opConfig.reloadPrice();
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
			opConfig.reloadPrice();
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
			opConfig.reloadPrice();
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
			opConfig.reloadPrice();
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
