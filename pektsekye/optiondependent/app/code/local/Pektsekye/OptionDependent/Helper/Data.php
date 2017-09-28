<?php

class Pektsekye_OptionDependent_Helper_Data extends Mage_Core_Helper_Abstract
{



    public function getHiddenRequiredOptions($product, $requestOptions)
    {					
			$children = array();		
			
			$options = Mage::getModel('optiondependent/option')
			  ->getCollection()
			  ->addFieldToFilter('product_id', $product->getId());		
			foreach ($options as $option)	
				$option_id_by_row_id[$option->getRowId()] = $option->getOptionId();	
			
			$values = Mage::getModel('optiondependent/value')
			  ->getCollection()
			  ->addFieldToFilter('product_id', $product->getId());	
			foreach ($values as $value) {
				$valueId = $value->getOptionTypeId();
				$value_id_by_row_id[$value->getRowId()] = $valueId;
				if ($value->getChildren() != ''){								
					$ids = preg_split('/\D+/', $value->getChildren(), -1, PREG_SPLIT_NO_EMPTY);
					$children[$valueId] = $ids;				
				}
				
			}	
			

      $oIdByVId = array();			
      foreach ($product->getOptions() as $option){
        if ($values = $option->getValues()){
          foreach ($values as $vId => $v)
            $oIdByVId[$vId] = $option->getId();
        }		  
      }
			
			$cOIdsByVId = array();	
			$cVIdsByVId = array();			
			$parentVIdByOId  = array();			
			foreach ($children as $valueId => $value){
        foreach ($value as $rId){
          if (isset($option_id_by_row_id[$rId])){
            $oId = (int) $option_id_by_row_id[$rId];
            $cOIdsByVId[$valueId][] = $oId;
            $parentVIdByOId[$oId] = $valueId;
          } elseif(isset($value_id_by_row_id[$rId])){
            $vId = (int) $value_id_by_row_id[$rId];		
            $cVIdsByVId[$valueId][] = $vId;
            $parentVIdByOId[$oIdByVId[$vId]] = $valueId;														
          }	
        }
			}						
	
      $visibleOIds = array();	
      foreach ($requestOptions as $v){
        $vIds = is_array($v) ? $v : array($v);
        foreach ($vIds as $vId){
          if (empty($vId))
            continue;
          if (isset($cOIdsByVId[$vId]))
            foreach ($cOIdsByVId[$vId] as $oId)          
              $visibleOIds[$oId] = 1;
          if (isset($cVIdsByVId[$vId]))
            foreach ($cVIdsByVId[$vId] as $id)
              $visibleOIds[$oIdByVId[$id]] = 1;                      
        }                 	  
      }
      	
      $hiddenOIds	= array();
      foreach ($product->getOptions() as $option){
        $oId = $option->getId();
        if ($option->getIsRequire() && isset($parentVIdByOId[$oId]) && !isset($visibleOIds[$oId])){
          $hiddenOIds[$oId]	= 1;
        }		  
      }	
	
			return $hiddenOIds;			
   
    }
    
    
}
