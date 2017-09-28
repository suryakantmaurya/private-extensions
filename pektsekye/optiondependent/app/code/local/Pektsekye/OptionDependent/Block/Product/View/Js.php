<?php
class Pektsekye_OptionDependent_Block_Product_View_Js extends  Mage_Catalog_Block_Product_View_Abstract
{
	

    public function getConfig()
    { 
			$config = array(array(), array());		
			$children = array();
			$inPreConfigured = $this->getProduct()->hasPreconfiguredValues();		
			$product_id = $this->getProduct()->getId();	
			
			if ($inPreConfigured){
				foreach ($this->getProduct()->getOptions() as $option){
					$optionId = (int) $option->getOptionId();
					$config[0][$optionId] = array();					
					if ($option->getGroupByType() == Mage_Catalog_Model_Product_Option::OPTION_GROUP_SELECT){
						$configValue = $this->getProduct()->getPreconfiguredValues()->getData('options/' . $optionId);	
						if (!is_null($configValue)){
							if (is_array($configValue)){
								foreach($configValue as $valueId)
									$config[0][$optionId][] = (int) $valueId;								
							} else {
								$config[0][$optionId][] = (int) $configValue;							
							}
						}							
					}
				}
			}		
			
			$options = Mage::getModel('optiondependent/option')
			->getCollection()
			->addFieldToFilter('product_id', $product_id);		
			foreach ($options as $option)	
				$option_id_by_row_id[$option->getRowId()] = $option->getOptionId();	
			
			$values = Mage::getModel('optiondependent/value')
			->getCollection()
			->addFieldToFilter('product_id', $product_id);	
			foreach ($values as $value) {
				$valueId = $value->getOptionTypeId();
				$value_id_by_row_id[$value->getRowId()] = $valueId;
				if ($value->getChildren() != ''){	
					$config[1][$valueId] = array(array(), array());			
					$ids = preg_split('/\D+/', $value->getChildren(), -1, PREG_SPLIT_NO_EMPTY);
					$children[$valueId] = $ids;				
				}
			}	
			
			foreach ($children as $valueId => $value){
					foreach ($children[$valueId] as $v){
						if (isset($option_id_by_row_id[$v])){
							$config[1][$valueId][0][] = (int) $option_id_by_row_id[$v];
						} elseif(isset($value_id_by_row_id[$v])){			
							$config[1][$valueId][1][] = (int) $value_id_by_row_id[$v];						
						}	
					}
			}						
	
					return Zend_Json::encode($config);
    }


    public function getInPreconfigured()
    { 			
			return $this->getProduct()->hasPreconfiguredValues() ? 'true' : 'false';
	 	}	
	
}