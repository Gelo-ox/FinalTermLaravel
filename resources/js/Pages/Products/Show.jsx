import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { PageHeading, Empty, money, date, useCan } from '../../Components/UI';
export default function Show({ product: p }) {
    const can = useCan();
    return (
        <AppLayout title={p.product_name}>
            <PageHeading title={p.product_name} subtitle={p.sku}>
                <Link href="/products" className="button secondary">
                    Back to products
                </Link>
                {can('products.manage') && (
                    <Link href={`/products/${p.id}/edit`} className="button">
                        Edit product
                    </Link>
                )}
            </PageHeading>
            <section className="panel form-panel">
                <dl className="details">
                    {[
                        ['Category', p.category?.category_name ?? '—'],
                        ['Supplier', p.supplier?.supplier_name ?? '—'],
                        ['On hand', p.quantity],
                        ['Unit price', money(p.unit_price)],
                        ['Reorder level', p.reorder_level],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>
            <section className="panel">
                <div className="panel-heading">
                    <h2>Latest 50 stock movements</h2>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {p.stock_transactions.length ? (
                                p.stock_transactions.map((t) => (
                                    <tr key={t.id}>
                                        <td>{date(t.created_at)}</td>
                                        <td>{t.transaction_type}</td>
                                        <td>{t.quantity}</td>
                                        <td>{t.remarks ?? '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <Empty columns={4} />
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </AppLayout>
    );
}
