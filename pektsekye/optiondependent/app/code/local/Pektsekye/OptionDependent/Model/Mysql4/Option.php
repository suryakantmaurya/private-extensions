<?php

class Pektsekye_OptionDependent_Model_Mysql4_Option extends Mage_Core_Model_Mysql4_Abstract
{
    public function _construct()
    {    
        $this->_init('optiondependent/option', 'od_option_id');
    }
}