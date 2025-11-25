-- Sepet tablosu
CREATE TABLE IF NOT EXISTS `carts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL COMMENT 'Kayıtlı kullanıcı ID (null ise misafir)',
  `session_id` VARCHAR(255) NULL COMMENT 'Misafir kullanıcılar için session ID',
  `status` ENUM('active', 'completed', 'abandoned') DEFAULT 'active' COMMENT 'Sepet durumu',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sepet ürünleri tablosu
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cart_id` INT NOT NULL COMMENT 'Sepet ID',
  `product_id` INT NOT NULL COMMENT 'Ürün ID',
  `variant_id` INT NULL COMMENT 'Varyant ID (varsa)',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT 'Adet',
  `price` DECIMAL(10, 2) NOT NULL COMMENT 'Birim fiyat (snapshot)',
  `discount_price` DECIMAL(10, 2) NULL COMMENT 'İndirimli fiyat (snapshot)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cart_id` (`cart_id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_variant_id` (`variant_id`),
  FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_cart_product` (`cart_id`, `product_id`, `variant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


