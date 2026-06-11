<?php

class Mailer
{
    private string $host;
    private int $port;
    private string $username;
    private string $password;
    private string $fromEmail;
    private string $fromName;

    public function __construct()
    {
        $this->host = getenv('SMTP_HOST') ?: '';
        $this->port = (int)(getenv('SMTP_PORT') ?: 25);
        $this->username = getenv('SMTP_USER') ?: '';
        $this->password = getenv('SMTP_PASS') ?: '';
        $this->fromEmail = getenv('SMTP_FROM_EMAIL') ?: 'noreply@manom-barbershop.com';
        $this->fromName = getenv('SMTP_FROM_NAME') ?: 'MANOM BarberShop';
    }

    public function send(string $toEmail, string $toName, string $subject, string $htmlBody): bool
    {
        $boundary = md5(uniqid(mt_rand(), true));

        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "From: {$this->fromName} <{$this->fromEmail}>\r\n";
        $headers .= "Reply-To: {$this->fromEmail}\r\n";
        $headers .= "X-Mailer: MANOM Mailer\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

        $message = $htmlBody;

        $socket = fsockopen($this->host, $this->port, $errno, $errstr, 5);
        if (!$socket) {
            error_log("Mailer: Failed to connect to {$this->host}:{$this->port} - $errstr ($errno)");
            return false;
        }
        stream_set_timeout($socket, 5);

        $this->smtpCommand($socket, null, 220);

        $this->smtpCommand($socket, "EHLO manom-barbershop.local", 250);

        if ($this->port !== 25) {
            $this->smtpCommand($socket, "STARTTLS", 220);
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $this->smtpCommand($socket, "EHLO manom-barbershop.local", 250);
        }

        $this->smtpCommand($socket, "AUTH LOGIN", 334);
        $this->smtpCommand($socket, base64_encode($this->username), 334);
        $this->smtpCommand($socket, base64_encode($this->password), 235);

        $this->smtpCommand($socket, "MAIL FROM:<{$this->fromEmail}>", 250);
        $this->smtpCommand($socket, "RCPT TO:<{$toEmail}>", 250);

        $this->smtpCommand($socket, "DATA", 354);
        $this->smtpCommand($socket, $headers . "\r\n" . $message . "\r\n.", 250);

        $this->smtpCommand($socket, "QUIT", 221);

        fclose($socket);
        return true;
    }

    private function smtpCommand($socket, ?string $command, int $expectedCode): void
    {
        if ($command !== null) {
            fwrite($socket, $command . "\r\n");
        }

        $response = '';
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }

        $code = (int)substr($response, 0, 3);
        if ($code !== $expectedCode) {
            error_log("Mailer SMTP error: Expected $expectedCode, got $code. Response: $response");
            throw new RuntimeException("SMTP error: $response");
        }
    }
}
