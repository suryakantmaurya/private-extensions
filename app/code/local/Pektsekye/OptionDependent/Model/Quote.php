<?php

class Pektsekye_OptionDependent_Model_Quote extends Mage_Sales_Model_Quote
{
    
   
    public function addProductAdvanced(Mage_Catalog_Model_Product $product, $request = null, $processMode = null)
    {
		  if ($product->getRequiredOptions() && $request != null && isset($request['options'])){
		  		  		
        $hiddenOIds = Mage::helper('optiondependent')->getHiddenRequiredOptions($product, $request['options']);  	
        foreach ($product->getOptions() as $option){
          if (isset($hiddenOIds[$option->getId()])) 
            $option->setIsRequire(false);		  
        } 
		  }
		  
		  return parent::addProductAdvanced($product, $request, $processMode);    
    }
}
