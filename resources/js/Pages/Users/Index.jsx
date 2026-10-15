import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { PageHeading } from '../../Components/UI';
function UserRow({ user, roles }) {
    const own = usePage().props.auth.user.id === user.id;
    const form = useForm({ role: user.roles[0]?.name ?? 'User' });
    return (
        <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
                <form
                    className="actions"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.put(`/admin/users/${user.id}`);
                    }}
                >
                    <select
                        aria-label={`Role for ${user.name}`}
                        value={form.data.role}
                        onChange={(e) => form.setData('role', e.target.value)}
                        disabled={own}
                    >
                        {roles.map((role) => (
                            <option key={role}>{role}</option>
                        ))}
                    </select>
                    <button className="button secondary" disabled={own || form.processing}>
                        Save role
                    </button>
                </form>
            </td>
        </tr>
    );
}
export default function Users({ users, roles }) {
    return (
        <AppLayout title="Team & access">
            <PageHeading
                title="Team & access"
                subtitle="Control who can view, manage, and administer inventory."
            />
            <div className="role-cards">
                <div className="panel">
                    <h3>Admin</h3>
                    <p>All inventory actions and team role management.</p>
                </div>
                <div className="panel">
                    <h3>Manager</h3>
                    <p>Manage products, categories, suppliers, and record stock movements.</p>
                </div>
                <div className="panel">
                    <h3>User</h3>
                    <p>View dashboard, inventory, and stock history.</p>
                </div>
            </div>
            <section className="panel">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <UserRow key={user.id} user={user} roles={roles} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </AppLayout>
    );
}
