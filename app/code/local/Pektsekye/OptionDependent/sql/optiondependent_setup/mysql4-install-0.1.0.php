<?php

$installer = $this;

$installer->startSetup();

$installer->run("

    DROP TABLE IF EXISTS `{$this->getTable('optiondependent/option')}`;
    CREATE TABLE `{$this->getTable('optiondependent/option')}` (
      `od_option_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      `option_id` int unsigned NOT NULL,
      `product_id` int unsigned NOT NULL,
      `row_id` smallint unsigned NOT NULL,
      UNIQUE `OPTIONDEPENDENT_OPTION_ID` (`option_id`),
      KEY (`product_id`),
      CONSTRAINT `FK_OPTIONDEPENDENT_OPTION_ID` FOREIGN KEY (`option_id`) REFERENCES `{$this->getTable('catalog/product_option')}` (`option_id`) ON DELETE CASCADE ON UPDATE CASCADE
    )ENGINE=InnoDB;

    DROP TABLE IF EXISTS `{$this->getTable('optiondependent/value')}`;
    CREATE TABLE `{$this->getTable('optiondependent/value')}` (
      `od_value_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      `option_type_id` int unsigned NOT NULL,
      `product_id` int unsigned NOT NULL,
      `row_id` smallint unsigned NOT NULL,
      `children` TEXT NOT NULL default '',
      UNIQUE `OPTIONDEPENDENT_OPTION_TYPE_ID` (`option_type_id`),
      KEY (`product_id`),
      CONSTRAINT `FK_OPTIONDEPENDENT_OPTION_TYPE_ID` FOREIGN KEY (`option_type_id`) REFERENCES `{$this->getTable('catalog/product_option_type_value')}` (`option_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
    )ENGINE=InnoDB;

    DROP TABLE IF EXISTS `{$this->getTable('optiondependent/import')}`;
    CREATE TABLE `{$this->getTable('optiondependent/import')}` (
      `id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      `product_id` int unsigned NOT NULL default 0,
      `option_title` varchar(255) NOT NULL default '',
      `type` varchar(50) NOT NULL default '',
      `is_require` tinyint(1) NOT NULL default 1,
      `option_sort_order` int unsigned NOT NULL default 0,
      `max_characters` int unsigned NOT NULL default 0,
      `file_extension` varchar(50) NOT NULL default '',
      `image_size_x` smallint(5) NOT NULL default 0,
      `image_size_y` smallint(5) NOT NULL default 0,
      `value_title` varchar(255) NOT NULL default '',
      `price` decimal(12,4) NOT NULL default '0.0000',
      `price_type` enum('fixed','percent') NOT NULL default 'fixed',
      `sku` varchar(64) NOT NULL default '',
      `value_sort_order` int unsigned NOT NULL default 0,
      `row_id` int unsigned NOT NULL default 0,
      `children` TEXT NOT NULL default ''
    )ENGINE=MyISAM;

");

$installer->endSetup(); 