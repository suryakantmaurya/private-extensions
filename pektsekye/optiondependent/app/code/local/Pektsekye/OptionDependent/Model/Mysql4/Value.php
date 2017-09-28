<?php

class Pektsekye_OptionDependent_Model_Mysql4_Value extends Mage_Core_Model_Mysql4_Abstract
{
    public function _construct()
    {    
        $this->_init('optiondependent/value', 'od_value_id');
    }
	
	 public function duplicate($oldOptionId, $newOptionId, $newProductId)
    {
         $read   = $this->_getReadAdapter();			
         $write  = $this->_getWriteAdapter();
			$maintable = $this->getTable('catalog/product_option_type_value');
			$valuetable = $this->getTable('optiondependent/value');		
				  
			$select = $read->select()
				->from($maintable, 'option_type_id')
				->where('option_id=?', $oldOptionId);
			$oldTypeIds = $read->fetchCol($select);

			$select = $read->select()
				->from($maintable, 'option_type_id')
				->where('option_id=?', $newOptionId);
			$newTypeIds = $read->fetchCol($select);

			foreach ($oldTypeIds as $ind => $oldTypeId) {
				$sql = 'REPLACE INTO `' . $valuetable . '` '
					 . 'SELECT NULL, ' . $newTypeIds[$ind] . ', ' . $newProductId . ', `row_id`, `children`'
					 . 'FROM `' . $valuetable . '` WHERE `option_type_id`=' . $oldTypeId;
				$write->query($sql);			
			}
	 } 
	
}