import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { PageHeading, date } from '../../Components/UI';
export default function Show({ transaction: t }) {
    return (
        <AppLayout title="Movement details">
            <PageHeading
                title={`Stock ${t.transaction_type} · ${t.product.product_name}`}
                subtitle={date(t.created_at)}
            >
                <Link href="/transactions" className="button secondary">
                    Back to movements
                </Link>
            </PageHeading>
            <section className="panel form-panel">
                <dl className="details">
                    {[
                        ['SKU', t.product.sku],
                        ['Quantity', t.quantity],
                        ['Recorded by', t.user?.name ?? 'Opening stock'],
                        ['Remarks', t.remarks || '—'],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>
        </AppLayout>
    );
}
