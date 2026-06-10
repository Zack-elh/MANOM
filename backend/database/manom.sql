-- MANOM BarberShop Database Schema
-- MySQL / XAMPP

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Users table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('client', 'admin') NOT NULL DEFAULT 'client',
    `phone` VARCHAR(20) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Services table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `duration` INT UNSIGNED NOT NULL COMMENT 'Duration in minutes',
    `price` DECIMAL(10,2) NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Barbers table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `barbers` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `specialty` VARCHAR(150) DEFAULT NULL,
    `image` VARCHAR(255) DEFAULT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Barber Availability table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `barber_availability` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `barber_id` INT UNSIGNED NOT NULL,
    `day_of_week` TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_availability` (`barber_id`, `day_of_week`, `start_time`),
    CONSTRAINT `fk_availability_barber` FOREIGN KEY (`barber_id`) REFERENCES `barbers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Bookings table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ref_code` VARCHAR(20) NOT NULL COMMENT 'Human-readable ref like MNM-004201',
    `user_id` INT UNSIGNED DEFAULT NULL COMMENT 'Nullable for admin-created bookings',
    `service_id` INT UNSIGNED NOT NULL,
    `barber_id` INT UNSIGNED NOT NULL,
    `booking_date` DATE NOT NULL,
    `booking_time` TIME NOT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_bookings_ref` (`ref_code`),
    KEY `idx_bookings_user` (`user_id`),
    KEY `idx_bookings_barber_date` (`barber_id`, `booking_date`, `booking_time`),
    KEY `idx_bookings_status` (`status`),
    KEY `idx_bookings_date` (`booking_date`),
    CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_bookings_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bookings_barber` FOREIGN KEY (`barber_id`) REFERENCES `barbers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Bookings Audit table (cancel trail)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings_audit` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `booking_id` INT UNSIGNED NOT NULL,
    `action` VARCHAR(50) NOT NULL COMMENT 'created, cancelled, status_changed',
    `old_status` VARCHAR(20) DEFAULT NULL,
    `new_status` VARCHAR(20) DEFAULT NULL,
    `performed_by` INT UNSIGNED DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_audit_booking` (`booking_id`),
    CONSTRAINT `fk_audit_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Password Reset Tokens table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_resets` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `used` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reset_token` (`token`),
    KEY `idx_reset_user` (`user_id`),
    KEY `idx_reset_expires` (`expires_at`),
    CONSTRAINT `fk_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Rate Limits table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rate_limits` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ip_address` VARCHAR(45) NOT NULL,
    `endpoint` VARCHAR(100) NOT NULL,
    `attempts` INT UNSIGNED NOT NULL DEFAULT 1,
    `first_attempt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_attempt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_rate_ip_endpoint` (`ip_address`, `endpoint`),
    KEY `idx_rate_cleanup` (`first_attempt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Sessions table (for PHP session handling)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
    `id` VARCHAR(128) NOT NULL,
    `user_id` INT UNSIGNED DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` TEXT DEFAULT NULL,
    `payload` LONGTEXT NOT NULL,
    `last_activity` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_sessions_user` (`user_id`),
    KEY `idx_sessions_last_activity` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Data: Services
-- --------------------------------------------------------
INSERT INTO `services` (`title`, `description`, `duration`, `price`) VALUES
('Signature Haircut', 'Precision cut tailored to your face shape and lifestyle.', 45, 45.00),
('Royal Beard Sculpt', 'Expert beard shaping with hot towel treatment.', 30, 35.00),
('The Full Works', 'Our complete grooming experience.', 90, 95.00),
('Hot Towel Shave', 'Traditional straight razor shave with premium products.', 40, 40.00),
('Scalp Treatment', 'Deep cleansing scalp therapy with essential oils.', 30, 30.00),
('Hair Design', 'Creative line work and patterns.', 60, 55.00);

-- --------------------------------------------------------
-- Seed Data: Barbers
-- --------------------------------------------------------
INSERT INTO `barbers` (`name`, `specialty`, `image`) VALUES
('Andrew', 'Master Barber', 'andrew.jpg'),
('Enrique', 'Style Director', 'enrique.jpg'),
('Jake', 'Beard Specialist', 'jack.jpg');

-- --------------------------------------------------------
-- Seed Data: Barber Availability (Tue-Sun, 9AM-8PM)
-- --------------------------------------------------------
INSERT INTO `barber_availability` (`barber_id`, `day_of_week`, `start_time`, `end_time`) VALUES
-- Andrew (barber 1)
(1, 2, '09:00:00', '20:00:00'), (1, 3, '09:00:00', '20:00:00'),
(1, 4, '09:00:00', '20:00:00'), (1, 5, '09:00:00', '20:00:00'),
(1, 6, '09:00:00', '20:00:00'), (1, 0, '09:00:00', '20:00:00'),
-- Enrique (barber 2)
(2, 2, '09:00:00', '20:00:00'), (2, 3, '09:00:00', '20:00:00'),
(2, 4, '09:00:00', '20:00:00'), (2, 5, '09:00:00', '20:00:00'),
(2, 6, '09:00:00', '20:00:00'), (2, 0, '09:00:00', '20:00:00'),
-- Jake (barber 3)
(3, 2, '09:00:00', '20:00:00'), (3, 3, '09:00:00', '20:00:00'),
(3, 4, '09:00:00', '20:00:00'), (3, 5, '09:00:00', '20:00:00'),
(3, 6, '09:00:00', '20:00:00'), (3, 0, '09:00:00', '20:00:00');

-- --------------------------------------------------------
-- Seed Data: Admin user (password: admin123)
-- --------------------------------------------------------
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Admin', 'admin@manom.com',
'$2y$10$sJk9rtBvh8ZrrIdPVJIfpeqsJTEz5F6qGS9h7iPKTxxeibSxFtacC', 'admin');

SET FOREIGN_KEY_CHECKS = 1;
