<?php



class Pektsekye_OptionDependent_Model_Convert_Parser_Options
    extends Mage_Eav_Model_Convert_Parser_Abstract
{
    const MULTI_DELIMITER = ' , ';
	
   public function unparse()
    {
		
		$od_option_row_ids = array();
		$options = Mage::getModel('optiondependent/option')->getCollection();
		foreach ($options as $option)
			$od_option_row_ids[$option->getOptionId()] = $option->getRowId();	
			
		$od_values = array();		
		$values = Mage::getModel('optiondependent/value')->getCollection();
		foreach ($values as $value)
			$od_values[$value->getOptionTypeId()] = array($value->getRowId(), $value->getChildren());

		$products = Mage::getModel('catalog/product')->getCollection()->addFieldToFilter('has_options', 1);	
		foreach ($products as $product){
			$row = array();
			$row['product_sku'] = $product->getSku();
			$options = Mage::getModel('catalog/product')->load($product->getId())->getOptions();
			foreach ($options as $option) {
				$row['option_title'] = $option->getTitle();
				$row['type'] = $option->getType();
				$row['is_require'] = $option->getIsRequire();
				$row['option_sort_order'] = $option->getSortOrder();
				$row['max_characters'] = $option->getMaxCharacters();
				$row['file_extension'] = $option->getFileExtension();
				$row['image_size_x'] = $option->getImageSizeX();
				$row['image_size_y'] = $option->getImageSizeY();
				
				 if ($option->getGroupByType() == Mage_Catalog_Model_Product_Option::OPTION_GROUP_SELECT) {
			
				  foreach ($option->getValues() as $value) {
						 $row['value_title'] = $value->getTitle();
						 $row['price'] =$value->getPrice();
						 $row['price_type'] = $value->getPriceType();
						 $row['sku'] = $value->getSku();
						 $row['value_sort_order'] = $value->getSortOrder();
						if (isset($od_values[$value->getOptionTypeId()])){ 
							$row['row_id'] = $od_values[$value->getOptionTypeId()][0];	
							$row['children'] = $od_values[$value->getOptionTypeId()][1];								
						}	else {								
							$row['row_id'] = '';
							$row['children'] = '';														
						}
							
						$batchExport = $this->getBatchExportModel()
							 ->setId(null)
							 ->setBatchId($this->getBatchModel()->getId())
							 ->setBatchData($row)
							 ->setStatus(1)
							 ->save();						
					}
					
				} else {

					$row['value_title'] = '';	
					$row['price'] = $option->getPrice();	
					$row['price_type'] = $option->getPriceType();	
					$row['sku'] = $option->getSku();		
					$row['value_sort_order'] = '';			
					if (isset($od_option_row_ids[$option->getOptionId()])){
						$row['row_id'] = $od_option_row_ids[$option->getOptionId()];
					} else {
						$row['row_id'] = '';
					}	
					$row['children'] = '';			
					
					$batchExport = $this->getBatchExportModel()
						 ->setId(null)
						 ->setBatchId($this->getBatchModel()->getId())
						 ->setBatchData($row)
						 ->setStatus(1)
						->save();						
				}	
			}
		}
		
        return $this;
	 }


    /**
     * Not use :(
     */
   public function parse()
    {

	}

}
