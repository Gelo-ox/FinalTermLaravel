# FinalTermLaravel — InvenTrack

Conversion of the original PHP/jQuery inventory system for the ITELEC 4100 final project. Built with Laravel 13, React 19, Inertia 3, Vite, Laravel Fortify, Spatie Laravel Permission, and MySQL.

The original application remains in the parent folder. This application uses its own database, `final_term_laravel`.

## Run this workspace

The dependencies, frontend assets, MySQL migrations, demo accounts, and imported inventory are already prepared.

Start MySQL in XAMPP. In PowerShell:

```powershell
cd C:\xampp\htdocs\inventory-system\FinalTermLaravel
php artisan serve --host=127.0.0.1 --port=8000
```

Open http://127.0.0.1:8000. Compiled assets are included locally; a Vite server is only necessary while editing frontend code.

| Role | Email | Local demo password |
| --- | --- | --- |
| Admin | admin@inventrack.test | Inventory123! |
| Manager | manager@inventrack.test | Inventory123! |
| User | user@inventrack.test | Inventory123! |

These accounts are seeded only in local/testing environments. Public registration always assigns the User role, regardless of any submitted role field.

## Requirements

- PHP 8.3+ with PDO MySQL, PDO SQLite (tests), mbstring, XML/DOM, ctype, fileinfo, tokenizer, curl, and OpenSSL.
- Composer.
- Node 22.12+ and npm (or Node 20.19+).
- MySQL/MariaDB.
- Use the PHP 8.3 CLI available on this machine. Older XAMPP PHP versions cannot run Laravel 13.

## Fresh installation

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
npm.cmd ci
npm.cmd run build
```

Create an empty MySQL database named `final_term_laravel` in phpMyAdmin and set matching DB credentials in `.env`.

For sample inventory:

```powershell
php artisan migrate --seed
php artisan serve
```

To import an existing original inventory database instead of sample inventory:

```powershell
php artisan migrate
php artisan db:seed --class=RolesAndPermissionsSeeder
php artisan db:seed --class=DemoUsersSeeder
php artisan inventory:import-legacy --database=inventory_system
```

Do not run InventorySeeder before importing: the importer requires empty target inventory tables and refuses to overwrite records. The source database is read through a consistent, read-only transaction with the MySQL credentials from `.env`. Original IDs are mapped to new foreign keys; original stock quantities and historical timestamps are preserved. Where current stock differs from transaction totals, explicitly labeled reconciliation entries bring the history into agreement with the current quantity.

This workspace imported 6 products and 8 historical movements, adding 4 reconciliation entries. The original database was not modified.

## Development and verification

```powershell
npm.cmd run dev
php artisan test
php vendor/bin/pint --test
npm.cmd run build
```

Run the Laravel server and Vite in separate terminals during frontend development. Tests use a separate SQLite in-memory database, not your MySQL inventory.

## Access rules

| Capability | Admin | Manager | User |
| --- | --- | --- | --- |
| View dashboard and all inventory records | Yes | Yes | Yes |
| Create/edit products, categories, suppliers | Yes | Yes | No |
| Delete unlinked categories/suppliers | Yes | Yes | No |
| Record stock IN/OUT | Yes | Yes | No |
| Delete products and their history | Yes | No | No |
| Reverse/delete stock movements | Yes | No | No |
| Assign team roles | Yes | No | No |

Backend routes enforce authentication and granular permissions. The Admin team routes also enforce `role:Admin`. React displays actions according to the permissions shared by Laravel. Administrators cannot change their own role.

## Stock consistency

- New products log nonzero opening quantities as stock IN movements.
- Product edits change catalog information only. Quantity changes use stock movements.
- Stock checks and adjustments occur inside database transactions with row locks.
- Stock OUT cannot exceed the current stock.
- Reversal of a stock IN entry is rejected if the items have already been spent.
- Historical stock transactions are immutable; record corrections as new movements.
- Category/product and product/transaction foreign keys use cascadeOnDelete. Category deletion is blocked by the application while it contains products. Supplier deletion is likewise blocked while linked to products.
- Product deletion explicitly removes its associated movement history.

## Password reset and deployment

Fortify provides registration, login, logout, password reset requests, and password reset completion through custom React pages. Login requests are rate limited.

Local mail uses `MAIL_MAILER=log`: reset links appear in `storage/logs/laravel.log`. Configure an SMTP mailer and MAIL_* credentials to deliver actual email. Set APP_URL to the real application URL.

For deployment, set APP_ENV=production and APP_DEBUG=false, provide a dedicated database account and real mail configuration, use HTTPS, and serve only the `public/` directory. Never expose `.env`, source folders, or storage through the web server. Demo users are not seeded in production; create an administrator using your deployment provisioning process.

The UI formats movement dates in Asia/Manila and currency in PHP. PHP/MySQL credentials are in `.env`, which is ignored by Git.

## Project layout

- `app/Models`: Eloquent models and relationships.
- `app/Http/Controllers`: validated resource operations and Inertia responses.
- `app/Services/InventoryService.php`: stock adjustment/reversal logic.
- `app/Http/Middleware/HandleInertiaRequests.php`: shared user, roles, permissions, flash messages.
- `app/Actions/Fortify`, `app/Providers/FortifyServiceProvider.php`: authentication.
- `app/Console/Commands/ImportLegacyInventory.php`: original database conversion.
- `routes/`: modular named routes and authorization.
- `database/migrations`, `database/seeders`: schema, roles, demo users, inventory.
- `resources/js/Pages`, `Layouts`, `Components`: React interface.
- `resources/views/app.blade.php`: Inertia root view.
- `tests/Feature/InventoryTest.php`: authentication, permissions, CRUD, and stock behavior tests.

See [REQUIREMENTS.md](REQUIREMENTS.md) for the assignment checklist.

Official integration references: [Laravel Fortify](https://laravel.com/docs/13.x/fortify), [Inertia](https://inertiajs.com/), [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission/v8/introduction).
