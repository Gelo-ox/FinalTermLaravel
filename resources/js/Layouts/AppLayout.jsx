import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Errors, useCan } from '../Components/UI';
export default function AppLayout({ title, children }) {
    const { auth, flash } = usePage().props;
    const can = useCan();
    const url = usePage().url;
    const nav = [
        ['/dashboard', 'Overview', 'dashboard.view'],
        ['/products', 'Products', 'products.view'],
        ['/categories', 'Categories', 'categories.view'],
        ['/suppliers', 'Suppliers', 'suppliers.view'],
        ['/transactions', 'Stock movements', 'transactions.view'],
        ['/admin/users', 'Team & access', 'users.manage'],
    ];
    return (
        <>
            <Head title={title} />
            <div className="app-shell">
                <aside className="sidebar">
                    <Link href="/dashboard" className="brand">
                        <span className="brand-mark">▦</span> InvenTrack
                    </Link>
                    <span className="sidebar-label">INVENTORY WORKSPACE</span>
                    <nav>
                        {nav
                            .filter((n) => can(n[2]))
                            .map(([href, label]) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={url.startsWith(href) ? 'selected' : ''}
                                >
                                    {label}
                                </Link>
                            ))}
                    </nav>
                    <div className="sidebar-bottom">
                        <span className="avatar">{auth.user.name[0].toUpperCase()}</span>
                        <div>
                            <strong>{auth.user.name}</strong>
                            <small>{auth.user.roles.join(', ')}</small>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="signout"
                            title="Sign out"
                        >
                            ↗
                        </Link>
                    </div>
                </aside>
                <main>
                    <header className="topbar">
                        <span>FinalTermLaravel / {title}</span>
                        <span className="pill">{auth.user.roles.join(', ')}</span>
                    </header>
                    <div className="content">
                        {flash?.success && (
                            <div className="notice" role="status">
                                {flash.success}
                            </div>
                        )}
                        <Errors />
                        {children}
                    </div>
                    <footer>InvenTrack · ITELEC 4100 Final Project</footer>
                </main>
            </div>
        </>
    );
}
