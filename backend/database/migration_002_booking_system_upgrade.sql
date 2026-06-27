-- Migration 002: Booking System Upgrade
-- Late cancellation, strikes audit, notifications, in_progress status, pending_approval
-- Run this SQL in phpMyAdmin or MySQL CLI

SET NAMES utf8mb4;

-- --------------------------------------------------------
-- 1. Users table: add last_strike_at for 30-day decay tracking
-- --------------------------------------------------------
ALTER TABLE `users` ADD COLUMN `last_strike_at` TIMESTAMP NULL DEFAULT NULL
    AFTER `last_no_show_date`;

-- --------------------------------------------------------
-- 2. Bookings table: add new statuses + timestamp columns
-- --------------------------------------------------------
ALTER TABLE `bookings` MODIFY COLUMN `status` ENUM(
    'pending', 'confirmed', 'in_progress', 'completed',
    'cancelled', 'late_cancel', 'no_show', 'pending_approval'
) NOT NULL DEFAULT 'pending';

ALTER TABLE `bookings` ADD COLUMN `cancelled_at` TIMESTAMP NULL DEFAULT NULL
    AFTER `notes`;
ALTER TABLE `bookings` ADD COLUMN `completed_at` TIMESTAMP NULL DEFAULT NULL
    AFTER `cancelled_at`;

-- --------------------------------------------------------
-- 3. Strikes audit table — full history of all strikes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `strikes` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `booking_id` INT UNSIGNED NOT NULL,
    `strike_type` ENUM('no_show', 'late_cancel') NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `forgiven_at` TIMESTAMP NULL DEFAULT NULL,
    `forgiven_by` INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_strikes_user` (`user_id`),
    KEY `idx_strikes_booking` (`booking_id`),
    CONSTRAINT `fk_strikes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_strikes_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_strikes_forgiven_by` FOREIGN KEY (`forgiven_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Notifications table — admin alerts for new bookings etc.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type` ENUM('new_booking', 'cancellation', 'late_cancel', 'no_show') NOT NULL,
    `booking_id` INT UNSIGNED DEFAULT NULL,
    `message` VARCHAR(500) NOT NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notifications_read` (`is_read`),
    KEY `idx_notifications_created` (`created_at`),
    CONSTRAINT `fk_notifications_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
