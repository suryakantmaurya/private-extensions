<?php

class Pektsekye_OptionDependent_Model_Option extends Mage_Core_Model_Abstract
{	
    public function _construct()
    {
        parent::_construct();
        $this->_init('optiondependent/option');
    }
}