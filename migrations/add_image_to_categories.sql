-- Kategori tablosuna resim alanı ekleme
ALTER TABLE `categories` 
ADD COLUMN `image_url` VARCHAR(500) NULL COMMENT 'Kategori görseli' AFTER `icon`;




