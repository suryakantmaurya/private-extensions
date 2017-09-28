<?php

class Pektsekye_OptionDependent_Model_Resource_Eav_Mysql4_Product_Option extends Mage_Catalog_Model_Resource_Eav_Mysql4_Product_Option
{
    /**
     * Duplicate custom options for product
     *
     * @param Mage_Catalog_Model_Product_Option $object
     * @param int $oldProductId
     * @param int $newProductId
     * @return Mage_Catalog_Model_Product_Option
     */
    public function duplicate(Mage_Catalog_Model_Product_Option $object, $oldProductId, $newProductId)
    {
		
        $result = parent::duplicate($object, $oldProductId, $newProductId);	
		  
		
        $write  = $this->_getWriteAdapter();
        $read   = $this->_getReadAdapter();
		  $table = $this->getTable('optiondependent/option');
		  $od_value_resource = Mage::getModel('optiondependent/value')->getResource();
		  
        // read and prepare original product options
        $select = $read->select()
            ->from($this->getTable('catalog/product_option'), 'option_id')
            ->where('product_id=?', $oldProductId);
        $oldOptionIds = $read->fetchCol($select);

        $select = $read->select()
            ->from($this->getTable('catalog/product_option'), 'option_id')
            ->where('product_id=?', $newProductId);
        $newOptionIds = $read->fetchCol($select);
		  
        foreach ($oldOptionIds as $ind => $oldOptionId) {				
            $sql = 'REPLACE INTO `' . $table . '` '
                . 'SELECT NULL, ' . $newOptionIds[$ind] . ',  ' . $newProductId . ', `row_id`'
                . 'FROM `' . $table . '` WHERE `option_id`=' . $oldOptionId;
            $this->_getWriteAdapter()->query($sql);
				
            $od_value_resource->duplicate($oldOptionId, $newOptionIds[$ind], $newProductId);
        }

        return $result;
    }

}
