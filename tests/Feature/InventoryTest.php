<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function user(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function product(int $qty = 10): Product
    {
        return Product::create(['product_name' => 'Mouse', 'sku' => 'M-1', 'quantity' => $qty, 'unit_price' => 100, 'reorder_level' => 5]);
    }

    public function test_guests_cannot_access_inventory(): void
    {
        foreach (['dashboard', 'products', 'categories', 'suppliers', 'transactions', 'admin/users'] as $path) {
            $this->get('/'.$path)->assertRedirect('/login');
        }
    }

    public function test_registration_assigns_only_user_role(): void
    {
        $this->post('/register', ['name' => 'Student', 'email' => 'student@example.test', 'password' => 'Inventory123!', 'password_confirmation' => 'Inventory123!', 'role' => 'Admin'])->assertRedirect('/dashboard');
        $user = User::where('email', 'student@example.test')->firstOrFail();
        $this->assertTrue($user->hasRole('User'));
        $this->assertFalse($user->hasRole('Admin'));
    }

    public function test_login_and_logout(): void
    {
        $user = $this->user('User');
        $user->update(['password' => 'Inventory123!']);
        $this->post('/login', ['email' => $user->email, 'password' => 'wrong'])->assertSessionHasErrors('email');
        $this->post('/login', ['email' => $user->email, 'password' => 'Inventory123!'])->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_password_reset_flow(): void
    {
        Notification::fake();
        $user = $this->user('User');
        $this->post('/forgot-password', ['email' => $user->email])->assertSessionHas('status');
        Notification::assertSentTo($user, ResetPassword::class);
        $token = Password::createToken($user);
        $this->post('/reset-password', ['email' => $user->email, 'token' => $token, 'password' => 'NewInventory123!', 'password_confirmation' => 'NewInventory123!'])->assertRedirect('/login');
        $this->assertTrue(Hash::check('NewInventory123!', $user->fresh()->password));
    }

    public function test_authentication_pages_render_inertia(): void
    {
        foreach (['login' => 'Auth/Login', 'register' => 'Auth/Register', 'forgot-password' => 'Auth/ForgotPassword'] as $path => $component) {
            $this->get('/'.$path)->assertOk()->assertInertia(fn (Assert $page) => $page->component($component));
        }
    }

    public function test_user_can_read_but_cannot_mutate(): void
    {
        $this->actingAs($this->user('User'));
        $p = $this->product();
        $this->get('/products')->assertOk();
        $this->post('/products', [])->assertForbidden();
        $this->put('/products/'.$p->id, [])->assertForbidden();
        $this->delete('/products/'.$p->id)->assertForbidden();
        $this->get('/transactions/create')->assertForbidden();
        $this->get('/admin/users')->assertForbidden();
    }

    public function test_manager_permissions_and_admin_role_guard(): void
    {
        $this->actingAs($this->user('Manager'));
        $p = $this->product();
        $this->get('/products/create')->assertOk();
        $this->get('/transactions/create')->assertOk();
        $this->delete('/products/'.$p->id)->assertForbidden();
        $this->get('/admin/users')->assertForbidden();
    }

    public function test_stock_out_is_atomic_and_cannot_exceed_stock(): void
    {
        $this->actingAs($this->user('Manager'));
        $p = $this->product(10);
        $this->post('/transactions', ['product_id' => $p->id, 'transaction_type' => 'OUT', 'quantity' => 7])->assertRedirect('/transactions');
        $this->assertSame(3, $p->fresh()->quantity);
        $this->post('/transactions', ['product_id' => $p->id, 'transaction_type' => 'OUT', 'quantity' => 4])->assertSessionHasErrors('quantity');
        $this->assertSame(3, $p->fresh()->quantity);
        $this->assertSame(1, StockTransaction::count());
    }

    public function test_incoming_movement_cannot_be_reversed_after_stock_is_spent(): void
    {
        $this->actingAs($this->user('Admin'));
        $p = $this->product(0);
        $this->post('/transactions', ['product_id' => $p->id, 'transaction_type' => 'IN', 'quantity' => 10]);
        $incoming = StockTransaction::firstOrFail();
        $this->post('/transactions', ['product_id' => $p->id, 'transaction_type' => 'OUT', 'quantity' => 8]);
        $this->delete('/transactions/'.$incoming->id)->assertSessionHasErrors('transaction');
        $this->assertSame(2, $p->fresh()->quantity);
        $this->assertSame(2, StockTransaction::count());
    }

    public function test_outgoing_movement_reversal_restores_stock(): void
    {
        $this->actingAs($this->user('Admin'));
        $p = $this->product(10);
        $this->post('/transactions', ['product_id' => $p->id, 'transaction_type' => 'OUT', 'quantity' => 4]);
        $this->delete('/transactions/'.StockTransaction::firstOrFail()->id)->assertRedirect();
        $this->assertSame(10, $p->fresh()->quantity);
        $this->assertSame(0, StockTransaction::count());
    }

    public function test_product_creation_records_opening_stock_and_validates_input(): void
    {
        $this->actingAs($this->user('Manager'));
        $data = ['product_name' => 'Mouse', 'sku' => 'M-1', 'quantity' => 12, 'unit_price' => '120.50', 'reorder_level' => 5];
        $this->post('/products', $data)->assertRedirect('/products');
        $p = Product::firstOrFail();
        $this->assertSame(12, $p->quantity);
        $this->assertDatabaseHas('stock_transactions', ['product_id' => $p->id, 'quantity' => 12, 'transaction_type' => 'IN']);
        $this->post('/products', [...$data, 'sku' => 'M-2', 'quantity' => 'abc', 'reorder_level' => -1])->assertSessionHasErrors(['quantity', 'reorder_level']);
        $this->post('/products', $data)->assertSessionHasErrors('sku');
    }

    public function test_product_edit_cannot_overwrite_stock(): void
    {
        $this->actingAs($this->user('Manager'));
        $p = $this->product();
        $data = ['product_name' => 'Updated', 'sku' => $p->sku, 'unit_price' => 101, 'reorder_level' => 5];
        $this->put('/products/'.$p->id, [...$data, 'quantity' => 99])->assertSessionHasErrors('quantity');
        $this->assertSame(10, $p->fresh()->quantity);
        $this->put('/products/'.$p->id, $data)->assertRedirect('/products');
        $this->assertSame('Updated', $p->fresh()->product_name);
    }

    public function test_linked_category_deletion_is_blocked(): void
    {
        $this->actingAs($this->user('Admin'));
        $c = Category::create(['category_name' => 'Electronics']);
        $this->product()->update(['category_id' => $c->id]);
        $this->delete('/categories/'.$c->id)->assertSessionHasErrors('delete');
        $this->assertDatabaseHas('categories', ['id' => $c->id]);
    }

    public function test_admin_can_assign_roles_but_cannot_demote_self(): void
    {
        $admin = $this->user('Admin');
        $other = $this->user('User');
        $this->actingAs($admin);
        $this->put('/admin/users/'.$other->id, ['role' => 'Manager'])->assertRedirect();
        $this->assertTrue($other->fresh()->hasRole('Manager'));
        $this->put('/admin/users/'.$admin->id, ['role' => 'User'])->assertSessionHasErrors('role');
        $this->assertTrue($admin->fresh()->hasRole('Admin'));
    }

    public function test_dashboard_and_resource_pages_render(): void
    {
        $this->actingAs($this->user('Admin'));
        $p = $this->product();
        $this->get('/dashboard')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Dashboard')->where('stats.value', 1000));
        foreach (['/products/'.$p->id, '/products/'.$p->id.'/edit', '/categories', '/categories/create', '/suppliers', '/suppliers/create', '/transactions', '/transactions/create', '/admin/users'] as $path) {
            $this->get($path)->assertOk();
        }
    }
}
