<?php
class Pektsekye_OptionDependent_Block_Adminhtml_Catalog_Product_Edit_Js extends Mage_Adminhtml_Block_Catalog_Product_Edit_Tab_Options_Option
{

    public function getOptionDependent()
    { 
			$config = array();
			$product_id = $this->getProduct()->getId();
			
			$options = Mage::getModel('optiondependent/option')
			->getCollection()
			->addFieldToFilter('product_id', $product_id);		
			foreach ($options as $option){			
				if ($option->getRowId() == 0)
					$config[0][$option->getOptionId()] = $option->getRowId();					
				else
					$config[0][$option->getOptionId()] = (int) $option->getRowId();			
			}
			
			$values = Mage::getModel('optiondependent/value')
			->getCollection()
			->addFieldToFilter('product_id', $product_id);		
			foreach ($values as $value) {		
				$config[1][$value->getOptionTypeId()][0] = (int) $value->getRowId();
				if($value->getChildren() != '')
					$config[1][$value->getOptionTypeId()][1] = $value->getChildren();
			}	
	
        return Zend_Json::encode($config);
    }
	
}