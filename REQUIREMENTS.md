# Final project requirements mapping

Source: Final Project.docx.pdf, ITELEC 4100, A.Y. 2026–2027. The document's project requirements were used to convert the existing InvenTrack inventory application.

| Requirement | Implementation |
| --- | --- |
| Application named FinalTermLaravel | Project folder, `.env`, `.env.example` |
| Laravel MVC | `app/Models`, `app/Http/Controllers`, `resources/js/Pages` |
| Database credentials in .env | Separate MySQL `final_term_laravel` database |
| Normalized migrations, PKs, FKs, timestamps | `database/migrations/2026_10_14_000001_create_inventory_tables.php` plus Laravel user/session/cache and Spatie migrations |
| cascadeOnDelete() | Category → products and product → stock_transactions constraints; application prevents deleting linked categories |
| Mass-assignment protection | Explicit `$fillable` on Category, Supplier, Product, StockTransaction, User |
| hasMany / belongsTo | Category/Supplier → products, Product → category/supplier/stockTransactions, StockTransaction → product/user |
| Resource CRUD methods | Category, Supplier, Product resource controllers: index, create, store, show, edit, update, destroy |
| Strict server validation | `$request->validate()` in each controller; SKU uniqueness, email validation, foreign key checks, integer quantities and price precision |
| Modular named routes / prefixes / groups | `routes/web.php`, `products.php`, `product-categories.php`, `suppliers.php`, `transactions.php`, `users.php`; authenticated group and `admin` prefix/name group |
| Inertia backend adapter | `inertiajs/inertia-laravel`, `HandleInertiaRequests` registered in `bootstrap/app.php` |
| React packages and Vite plugin | `package.json`, `package-lock.json`, `vite.config.js` |
| Root Blade directives | `resources/views/app.blade.php`: @viteReactRefresh, @vite, @inertiaHead, @inertia |
| createInertiaApp / resolvePageComponent | `resources/js/app.jsx` |
| Inertia::render controllers | Dashboard and all resource controllers |
| Reusable React components | AppLayout, AuthLayout, Field, PageHeading, Errors, Empty, Pagination |
| Fortify login / registration / password reset | `FortifyServiceProvider`, `app/Actions/Fortify`, `config/fortify.php`, `resources/js/Pages/Auth` |
| Spatie HasRoles and migrations | `app/Models/User.php`, `config/permission.php`, published permission tables migration |
| RolesAndPermissionsSeeder | Admin, Manager, User and granular view/manage/create/delete/team permissions |
| Backend authorization | `auth`, `permission:*` on resources; `role:Admin` and `permission:users.manage` on admin routes |
| Conditional React controls | `useCan()` permissions and shared role names; team navigation, edit/delete/create controls |
| CSRF protection | Laravel web CSRF middleware, root Blade csrf_token meta, Inertia same-origin XSRF cookie/header handling |
| Presentation-ready inventory workflows | Search/filter, pagination, record detail pages, stock history, low-stock dashboard, role management |

Stock transaction editing is intentionally unavailable: historical movements can be reversed by Admins or corrected with new movements. All standard CRUD methods are provided for products, categories, and suppliers.

The rubric's `@csrf` refers to Blade form tokens. This application submits React forms through Inertia, using Laravel's XSRF cookie/header mechanism instead; no Blade HTML forms submit inventory mutations.
