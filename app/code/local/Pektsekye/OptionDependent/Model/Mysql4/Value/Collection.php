<?php

class Pektsekye_OptionDependent_Model_Mysql4_Value_Collection extends Mage_Core_Model_Mysql4_Collection_Abstract
{
    protected function _construct()
    {
			parent::_construct();
        $this->_init('optiondependent/value');
    }
}
