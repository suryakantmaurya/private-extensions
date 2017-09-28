<?php

class Pektsekye_OptionDependent_Model_Mysql4_Import extends Mage_Core_Model_Mysql4_Abstract
{
    public function _construct()
    {    
        $this->_init('optiondependent/import', 'id');
    }
	 
		public function deleteCachedData()
    {
        $this->_getWriteAdapter()->delete($this->getMainTable());
        return $this;
    } 
	
}