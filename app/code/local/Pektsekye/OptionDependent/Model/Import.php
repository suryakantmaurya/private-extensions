<?php

class Pektsekye_OptionDependent_Model_Import extends Mage_Core_Model_Abstract
{	
    public function _construct()
    {
        parent::_construct();
        $this->_init('optiondependent/import');
    }

		public function deleteCachedData()
    {
        $this->getResource()->deleteCachedData();
        return $this;
    } 

}