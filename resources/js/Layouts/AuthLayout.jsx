import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
export default function AuthLayout({ title, children }) {
    const { status } = usePage().props;
    return (
        <>
            <Head title={title} />
            <div className="auth-shell">
                <section className="auth-intro">
                    <Link href="/" className="brand">
                        <span className="brand-mark">▦</span> InvenTrack
                    </Link>
                    <div>
                        <span className="eyebrow">YOUR INVENTORY, IN VIEW</span>
                        <h1>
                            Keep every
                            <br />
                            movement
                            <br />
                            accounted for.
                        </h1>
                        <p>Products, suppliers, and stock activity in one organized workspace.</p>
                        <div className="auth-graphic">
                            <span>STOCK OVERVIEW</span>
                            <div className="bars">
                                {[40, 72, 50, 90, 65, 100, 80].map((height, i) => (
                                    <i key={i} style={{ height: `${height}%` }} />
                                ))}
                            </div>
                            <small>Clear records. Confident decisions.</small>
                        </div>
                    </div>
                    <small>FinalTermLaravel · ITELEC 4100</small>
                </section>
                <section className="auth-form">
                    <div>
                        <h2>{title}</h2>
                        {status && <div className="notice">{status}</div>}
                        {children}
                    </div>
                </section>
            </div>
        </>
    );
}
