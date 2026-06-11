<?php

require_once __DIR__ . '/Mailer.php';

function send_booking_confirmation(int $bookingId, string $refCode, string $toEmail, string $toName, array $details): bool
{
    $subject = "Booking Confirmed - $refCode";
    $html = "
    <!DOCTYPE html>
    <html>
    <head><meta charset='UTF-8'></head>
    <body style='font-family: Arial, sans-serif; background: #fafafa; padding: 40px 20px;'>
        <div style='max-width: 480px; margin: 0 auto; background: white; padding: 40px;'>
            <h1 style='font-size: 24px; margin: 0 0 8px; color: #0a0a0a;'>MANOM</h1>
            <p style='color: #3c6057; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 24px;'>Booking Confirmed</p>
            <p style='color: #3d3d3d; font-size: 14px; line-height: 1.6;'>Hi <strong>$toName</strong>,</p>
            <p style='color: #3d3d3d; font-size: 14px; line-height: 1.6;'>Your appointment has been confirmed.</p>
            <div style='background: #f2efea; padding: 20px; margin: 20px 0;'>
                <p style='margin: 0 0 8px; font-size: 12px; color: #8a8a8a;'>REFERENCE CODE</p>
                <p style='margin: 0; font-size: 20px; font-weight: bold; color: #0a0a0a; letter-spacing: 2px;'>$refCode</p>
                <p style='margin: 4px 0 0; font-size: 11px; color: #8a8a8a;'>Booking ID: #$bookingId</p>
            </div>
            <table style='width: 100%; font-size: 14px; color: #3d3d3d;'>
                <tr><td style='padding: 6px 0; color: #8a8a8a;'>Service</td><td style='padding: 6px 0; text-align: right;'>{$details['service']}</td></tr>
                <tr><td style='padding: 6px 0; color: #8a8a8a;'>Barber</td><td style='padding: 6px 0; text-align: right;'>{$details['barber']}</td></tr>
                <tr><td style='padding: 6px 0; color: #8a8a8a;'>Date</td><td style='padding: 6px 0; text-align: right;'>{$details['date']}</td></tr>
                <tr><td style='padding: 6px 0; color: #8a8a8a;'>Time</td><td style='padding: 6px 0; text-align: right;'>{$details['time']}</td></tr>
                <tr><td style='padding: 6px 0; color: #8a8a8a;'>Duration</td><td style='padding: 6px 0; text-align: right;'>{$details['duration']} min</td></tr>
            </table>
            <p style='color: #8a8a8a; font-size: 12px; margin-top: 24px;'>You can cancel your booking in your dashboard. Cancellations must be made before the appointment time.</p>
            <p style='color: #3d3d3d; font-size: 12px; margin-top: 32px;'>MANOM BarberShop · Manom, France</p>
        </div>
    </body>
    </html>";

    try {
        $mailer = new Mailer();
        return $mailer->send($toEmail, $toName, $subject, $html);
    } catch (Exception $e) {
        error_log("Failed to send booking confirmation: " . $e->getMessage());
        return false;
    }
}

function send_password_reset(string $toEmail, string $toName, string $token): bool
{
    $resetLink = "http://localhost:3000/auth?reset_token=$token";
    $subject = "Reset Your MANOM Password";
    $html = "
    <!DOCTYPE html>
    <html>
    <head><meta charset='UTF-8'></head>
    <body style='font-family: Arial, sans-serif; background: #fafafa; padding: 40px 20px;'>
        <div style='max-width: 480px; margin: 0 auto; background: white; padding: 40px;'>
            <h1 style='font-size: 24px; margin: 0 0 8px; color: #0a0a0a;'>MANOM</h1>
            <p style='color: #3c6057; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 24px;'>Password Reset</p>
            <p style='color: #3d3d3d; font-size: 14px; line-height: 1.6;'>Hi <strong>$toName</strong>,</p>
            <p style='color: #3d3d3d; font-size: 14px; line-height: 1.6;'>Click the link below to reset your password. This link expires in 1 hour.</p>
            <a href='$resetLink' style='display: inline-block; background: #0a0a0a; color: white; padding: 14px 32px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 20px 0;'>Reset Password</a>
            <p style='color: #8a8a8a; font-size: 12px;'>Or copy this token: <code style='background: #f2efea; padding: 4px 8px; font-size: 11px;'>$token</code></p>
            <p style='color: #3d3d3d; font-size: 12px; margin-top: 32px;'>MANOM BarberShop · Manom, France</p>
        </div>
    </body>
    </html>";

    try {
        $mailer = new Mailer();
        return $mailer->send($toEmail, $toName, $subject, $html);
    } catch (Exception $e) {
        error_log("Failed to send password reset: " . $e->getMessage());
        return false;
    }
}
