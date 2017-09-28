<?php

class Pektsekye_OptionDependent_Model_Observer extends Mage_Core_Model_Abstract
{
	public function productSaveAfter(Varien_Event_Observer $observer)
	{
		$product = $observer->getEvent()->getProduct();
		$import_sku = $product->getOdImportSku();
		
		if ($import_sku != ''){
			$newProductId = $product->getId();
			
			$products = Mage::getModel('catalog/product')
				->getCollection()
				->addFieldToFilter('sku', $import_sku);	
			if (count($products) > 0){
				$oldProduct = $products->getFirstItem();
				if ($oldProduct->getHasOptions()){
					Mage::getModel('catalog/product_option')->duplicate($oldProduct->getId(), $newProductId);						
					$resource = Mage::getSingleton('core/resource'); 					
					$table = $resource->getTableName('catalog/product');
					$required = $oldProduct->getRequiredOptions() ? '1' : '0';
				
					$sql = 'UPDATE `' . $table . '` ' . 'SET `has_options` = 1, `required_options` = ' . $required . ' WHERE `entity_id`=' . $newProductId;
				  $resource->getConnection('core_write')->query($sql);
				}
			}	else {
				Mage::getSingleton('adminhtml/session')->addError(Mage::helper('optiondependent')->__('Product SKU "%s" does not exist.', $import_sku));  				
			}
			
		}
		
	}
	
	public function optionSaveAfter(Varien_Event_Observer $observer)
	{
		$object = $observer->getEvent()->getObject();
		$resource_name = $object->getResourceName();
		
		if ($resource_name == 'catalog/product_option'){
			
        if (($object->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_FIELD
            || $object->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_AREA
            || $object->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_FILE
            || $object->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_DATE
            || $object->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_DATE_TIME
            || $object->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_TIME)
			&& $object->getRowId()) {
			  
				$model = Mage::getModel('optiondependent/option');
				$collection = $model->getCollection()->addFieldToFilter('option_id', $object->getId());
				if (count($collection) == 1){
					$item = $collection->getFirstItem();			
					$model->setId($item['od_option_id']);
				}	
				$model->setOptionId($object->getId());	
				$model->setProductId($object->getProductId());			
				$model->setRowId($object->getRowId());
				$model->save();
				
			}
			
		} elseif ($resource_name == 'catalog/product_option_value' && $object->getRowId()){
			
			$model = Mage::getModel('optiondependent/value');
			$collection = $model->getCollection()->addFieldToFilter('option_type_id', $object->getId());
			if (count($collection) == 1){
				$item = $collection->getFirstItem();			
				$model->setId($item['od_value_id']);
			}							
			$model->setOptionTypeId($object->getId());
			$model->setProductId($object->getProduct()->getId());			
			$model->setRowId($object->getRowId());
			$model->setChildren($object->getChildren());			
			$model->save();

		}
		
    }
	
	
	public function setSkipCheckRequired(Varien_Event_Observer $observer)
	{ 
		$observer->getEvent()->getProduct()->setSkipCheckRequiredOption(true);	
	}	
	
  public function setSkipCheckRequiredToCollection($observer)
  {
      $productCollection = $observer->getEvent()->getProductCollection();
      foreach ($productCollection as $product){
        foreach ($product->getOptions() as $option) 
				  $option->setIsRequire(false);
      }

  }
}

