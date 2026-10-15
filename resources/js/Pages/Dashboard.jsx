import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import { PageHeading, Empty, money, date, useCan } from '../Components/UI';
export default function Dashboard({ stats, lowStock, recent }) {
    const can = useCan();
    return (
        <AppLayout title="Overview">
            <PageHeading
                title="Inventory overview"
                subtitle="A clear picture of your stock and latest activity."
            >
                {can('transactions.create') && (
                    <Link className="button" href="/transactions/create">
                        + Stock movement
                    </Link>
                )}
            </PageHeading>
            <div className="stats">
                {[
                    ['Products', stats.products, 'Active inventory'],
                    ['Categories', stats.categories, 'Organized collections'],
                    ['Suppliers', stats.suppliers, 'Supply partners'],
                    ['Inventory value', money(stats.value), 'Current stock × unit price'],
                ].map(([label, value, note]) => (
                    <div className="stat" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                        <small>{note}</small>
                    </div>
                ))}
            </div>
            <div className="dashboard-grid">
                <section className="panel">
                    <div className="panel-heading">
                        <div>
                            <h2>Needs attention</h2>
                            <p>Products at or below their reorder level</p>
                        </div>
                        <span className="badge warning">{lowStock.length} low stock</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>On hand</th>
                                    <th>Reorder at</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.length ? (
                                    lowStock.map((p) => (
                                        <tr key={p.id}>
                                            <td>
                                                <Link href={`/products/${p.id}`}>
                                                    {p.product_name}
                                                </Link>
                                                <small>
                                                    {p.sku} ·{' '}
                                                    {p.category?.category_name ?? 'Uncategorized'}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="badge warning">{p.quantity}</span>
                                            </td>
                                            <td>{p.reorder_level}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <Empty columns={3}>All stock levels are healthy.</Empty>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className="panel">
                    <div className="panel-heading">
                        <div>
                            <h2>Recent movements</h2>
                            <p>Your latest receiving and releasing activity</p>
                        </div>
                    </div>
                    <div className="activity">
                        {recent.length ? (
                            recent.map((t) => (
                                <Link
                                    href={`/transactions/${t.id}`}
                                    key={t.id}
                                    className="activity-row"
                                >
                                    <span
                                        className={`badge ${t.transaction_type === 'IN' ? 'good' : 'warning'}`}
                                    >
                                        {t.transaction_type}
                                    </span>
                                    <div>
                                        <strong>{t.product.product_name}</strong>
                                        <small>{date(t.created_at)}</small>
                                    </div>
                                    <b>
                                        {t.transaction_type === 'IN' ? '+' : '−'}
                                        {t.quantity}
                                    </b>
                                </Link>
                            ))
                        ) : (
                            <p className="empty">No stock movements yet.</p>
                        )}
                    </div>
                    <Link className="panel-link" href="/transactions">
                        View all movements →
                    </Link>
                </section>
            </div>
        </AppLayout>
    );
}
