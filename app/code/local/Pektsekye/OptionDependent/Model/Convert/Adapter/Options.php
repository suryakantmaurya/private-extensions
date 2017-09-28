<?php



class Pektsekye_OptionDependent_Model_Convert_Adapter_Options
    extends Mage_Eav_Model_Convert_Adapter_Entity
{
    const MULTI_DELIMITER = ' , ';

    protected $_productModel;  
	 protected $_optionModel; 

    /**
     * Retrieve product model cache
     *
     * @return Mage_Catalog_Model_Product
     */
    public function getProductModel()
    {
        if (is_null($this->_productModel)) {
            $productModel = Mage::getModel('catalog/product');
            $this->_productModel = Mage::objects()->save($productModel);
        }
        return Mage::objects()->load($this->_productModel);
    }
	     /**
     * Retrieve option model cache
     *
     * @return Mage_Catalog_Model_Product
     */
    public function getOptionModel()
    {
        if (is_null($this->_optionModel)) {
            $optionModel = Mage::getModel('catalog/product_option');
            $this->_optionModel = Mage::objects()->save($optionModel);
        }
        return Mage::objects()->load($this->_optionModel);
    }

    public function load()
    {
        return parent::load();
    }
    /**
     * Not use :(
     */
    public function parse()
    {

    }
    /*
     * saveRow function for saving each option data
     *
     * params args array
     * return array
     */
    public function saveRow(array $importData)
    {
			$batchId  = Mage::app()->getRequest()->getPost('batch_id');
			$rows  = Mage::app()->getRequest()->getPost('rows');			
			$session =	Mage::getSingleton('adminhtml/session');
			$importModel = Mage::getModel('optiondependent/import');
			if (!$session->getImporBatchtId() || $session->getImporBatchtId() != $batchId) {				
				$importModel->deleteCachedData();			
				$importIds = Mage::getModel('dataflow/batch')->load($batchId)
					->getBatchImportModel()
					->getIdCollection();
				$session->setImporBatchtId($batchId);	
				$session->setLastImportId(array_pop($importIds));		
			}
			
			if (empty($importData['product_sku'])) {
            $error = Mage::helper('optiondependent')->__('Skip import row, required field "%s" not defined', 'product_sku');
		   } else {
				$productmodel = $this->getProductModel();
				$products = $productmodel->getCollection()->addFieldToFilter('sku', $importData['product_sku']);
				
				if (count($products) == 0) {
					$error = Mage::helper('optiondependent')->__('Skip import row, the product with SKU "%s" does not exist', $importData['product_sku']);
				} else {				
					$importData['product_id'] = $products->getFirstItem()->getId();	
				
					if (empty($importData['option_title'])) {
						$error = Mage::helper('optiondependent')->__('Skip import row, required field "%s" not defined', 'option_title');
					} else {	
					
						if (empty($importData['type'])){
							$error = Mage::helper('optiondependent')->__('Skip import row, required field "%s" not defined', 'type');
						} else {			
							$types = array(Mage_Catalog_Model_Product_Option::OPTION_TYPE_FIELD,
									Mage_Catalog_Model_Product_Option::OPTION_TYPE_AREA,
									Mage_Catalog_Model_Product_Option::OPTION_TYPE_FILE,
									Mage_Catalog_Model_Product_Option::OPTION_TYPE_DROP_DOWN,
									Mage_Catalog_Model_Product_Option::OPTION_TYPE_RADIO,
									Mage_Catalog_Model_Product_Option::OPTION_TYPE_CHECKBOX,
									Mage_Catalog_Model_Product_Option::OPTION_TYPE_MULTIPLE,					
									Mage_Catalog_Model_Product_Option::OPTION_TYPE_DATE,
									Mage_Catalog_Model_Product_Option::OPTION_TYPE_DATE_TIME,
									Mage_Catalog_Model_Product_Option::OPTION_TYPE_TIME
								);
								
							if (!in_array($importData['type'], $types)) {	
								$error = Mage::helper('catalog')->__('Skip import row, value "%s" is not valid for field "%s". Valid values for the field "%s" are: %s.' , $importData['type'], 'type', 'type', implode(", ", $types));
							} else {	

								if (($importData['type'] == Mage_Catalog_Model_Product_Option::OPTION_TYPE_DROP_DOWN
										||	$importData['type'] == Mage_Catalog_Model_Product_Option::OPTION_TYPE_RADIO
										||	$importData['type'] == Mage_Catalog_Model_Product_Option::OPTION_TYPE_CHECKBOX
										||	$importData['type'] == Mage_Catalog_Model_Product_Option::OPTION_TYPE_MULTIPLE
									) && empty($importData['value_title'])) {
									$error = Mage::helper('optiondependent')->__('Skip import row, required field "%s" for option type "%s" is not defined', 'value_title', $importData['type']);
								}
							}
						}
					}
				}
			}
			
			if (!isset($error)){
				$importData['price_type'] = $importData['price_type'] == 'percent' ? 'percent' : 'fixed';
				$importModel->setData($importData)->save();
			}
			
			if ($rows[0] == $session->getLastImportId())
				$this->saveOptions(); 	
				
			if (isset($error))
				Mage::throwException($error);	
			
			return $this;
			
    }

    public function saveOptions()
    {	

			$optionModel = $this->getOptionModel();
			$importModel = Mage::getModel('optiondependent/import');
			$collection = $importModel->getCollection();
			$options = array();
			$hasRequired =  array();
			
			foreach ($collection as $importData){
				
				if ($importData['is_require'] == 1)
					$hasRequired[$importData['product_id']] = true;
					
				$option_ind = $importData['option_title'] . $importData['type'] . $importData['is_require'] . $importData['option_sort_order'];
				
				$options[$importData['product_id']][$option_ind]['title'] = $importData['option_title'];
				$options[$importData['product_id']][$option_ind]['type'] = $importData['type'];
				$options[$importData['product_id']][$option_ind]['is_require'] = $importData['is_require'];
				$options[$importData['product_id']][$option_ind]['sort_order'] = $importData['option_sort_order'];

				$group = $optionModel->getGroupByType($importData['type']);
		
				if ($group == Mage_Catalog_Model_Product_Option::OPTION_GROUP_SELECT){
					$options[$importData['product_id']][$option_ind]['values'][] = array(
							'title'=>$importData['value_title'],
							'price'=>$importData['price'],
							'price_type'=>$importData['price_type'],								
							'sku'=>$importData['sku'],
							'sort_order'=>$importData['value_sort_order'],
							'row_id'=>$importData['row_id'],
							'children'=>$importData['children']						
						);		
				} else {
					$options[$importData['product_id']][$option_ind]['price'] = $importData['price'];
					$options[$importData['product_id']][$option_ind]['price_type'] = $importData['price_type'];			
					$options[$importData['product_id']][$option_ind]['sku'] = $importData['sku'];
					$options[$importData['product_id']][$option_ind]['row_id'] = $importData['row_id'];		
					$options[$importData['product_id']][$option_ind]['children'] = $importData['children'];				
					if ($group == Mage_Catalog_Model_Product_Option::OPTION_GROUP_FILE){
						$options[$importData['product_id']][$option_ind]['file_extension'] = $importData['file_extension'];
						$options[$importData['product_id']][$option_ind]['image_size_x'] = $importData['image_size_x'];
						$options[$importData['product_id']][$option_ind]['image_size_y'] = $importData['image_size_y'];			
					} elseif ($group == Mage_Catalog_Model_Product_Option::OPTION_GROUP_TEXT){
						$options[$importData['product_id']][$option_ind]['max_characters'] = $importData['max_characters'];
					}						
				}	
			}

      $resource = Mage::getSingleton('core/resource'); 					
      $write = $resource->getConnection('core_write');
			$productModel = $this->getProductModel();
			$productModel->setStoreId(0);        
		  foreach ($options as $productId => $option_a) {	
		  	
        $write->query("DELETE FROM `{$resource->getTableName('catalog/product_option')}` WHERE `product_id` = {$productId}");	
        
			  $productModel->setId($productId);						
				$optionModel->setProduct($productModel)
					->setOptions(array_values($option_a))
					->saveOptions();

        $required = isset($hasRequired[$productId]) ? 1 : 0;
     		$write->query("UPDATE `{$resource->getTableName('catalog/product')}` SET `has_options`=1, `required_options`={$required} WHERE `entity_id` = {$productId}");	
			
			}
			
			$importModel->deleteCachedData();
		  
			return $this;		  
	}
	
}
