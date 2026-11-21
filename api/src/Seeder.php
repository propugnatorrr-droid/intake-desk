<?php

declare(strict_types=1);

namespace IntakeDesk;

use PDO;

/** Fictional sample enquiries so the demo opens on a believable desk. */
final class Seeder
{
    public static function seedIfEmpty(PDO $pdo): void
    {
        if ((int) $pdo->query('SELECT COUNT(*) FROM intakes')->fetchColumn() > 0) {
            return;
        }

        // Take the write lock before checking again, so two first requests cannot both seed.
        $pdo->exec('BEGIN IMMEDIATE');
        if ((int) $pdo->query('SELECT COUNT(*) FROM intakes')->fetchColumn() > 0) {
            $pdo->exec('COMMIT');

            return;
        }

        $rows = [
            ['Marta Okafor', 'marta@harborpine.example', 'Harbor & Pine Outfitters', 'web-app', 'We need a booking portal for guided trips with deposits and a guide calendar.', 'quoted', '-2 days'],
            ['Daniel Reyes', 'daniel@lindenrowdental.example', 'Linden Row Dental', 'website', 'Our site is slow and patients cannot find opening hours on their phones.', 'contacted', '-3 days'],
            ['Priya Nair', 'priya@cobaltfreight.example', 'Cobalt Freight Co.', 'integration', 'Connect our dispatch system to the customer tracking page without manual exports.', 'new', '-5 hours'],
            ['Tomas Lindqvist', 'tomas@northwindjoinery.example', 'Northwind Joinery', 'website', 'A portfolio site with a quote request form that routes to the right workshop.', 'new', '-1 day'],
            ['Aisha Rahman', 'aisha@fernhillschool.example', 'Fernhill Music School', 'web-app', 'Student sign-ups, term invoices and a parent login for lesson notes.', 'won', '-9 days'],
            ['Ben Whitaker', 'ben@copperkettle.example', 'Copper Kettle Roasters', 'maintenance', 'Monthly care for our shop: updates, backups and small content changes.', 'contacted', '-4 days'],
            ['Lucia Fernandez', 'lucia@verdantlandscapes.example', 'Verdant Landscapes', 'website', 'We want to show seasonal projects and let clients book site visits.', 'lost', '-12 days'],
            ['Kwame Boateng', 'kwame@stonebridgeaccounts.example', 'Stonebridge Accounts', 'integration', 'Sync client documents from our portal into the practice management tool.', 'quoted', '-6 days'],
        ];

        $stmt = $pdo->prepare(
            'INSERT INTO intakes (client_name, email, company, service, message, status, created_at, updated_at)
             VALUES (:name, :email, :company, :service, :message, :status, :created, :created)'
        );

        foreach ($rows as [$name, $email, $company, $service, $message, $status, $offset]) {
            $created = gmdate('Y-m-d\TH:i:s\Z', strtotime($offset) ?: time());
            $stmt->execute([
                ':name' => $name,
                ':email' => $email,
                ':company' => $company,
                ':service' => $service,
                ':message' => $message,
                ':status' => $status,
                ':created' => $created,
            ]);
        }

        $pdo->exec('COMMIT');
    }
}
