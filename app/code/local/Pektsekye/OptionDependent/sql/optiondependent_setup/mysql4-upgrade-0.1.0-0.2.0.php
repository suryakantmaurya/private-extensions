<?php
$this->startSetup();

$this->run("
 ALTER TABLE `{$this->getTable('optiondependent/option')}`
MODIFY `row_id` SMALLINT( 5 ) UNSIGNED NULL DEFAULT NULL;

 ALTER TABLE `{$this->getTable('optiondependent/value')}`
MODIFY `row_id` SMALLINT( 5 ) UNSIGNED NULL DEFAULT NULL;

 ALTER TABLE `{$this->getTable('optiondependent/import')}`
MODIFY `row_id` SMALLINT( 5 ) UNSIGNED NULL DEFAULT NULL;
    ");

$this->endSetup(); 