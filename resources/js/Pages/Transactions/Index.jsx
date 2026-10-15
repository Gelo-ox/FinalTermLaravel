import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { PageHeading, Pagination, Empty, date, useCan } from '../../Components/UI';
export default function Index({ transactions, filters }) {
    const can = useCan();
    const [search, setSearch] = useState(filters.search ?? '');
    return (
        <AppLayout title="Stock movements">
            <PageHeading
                title="Stock movements"
                subtitle="Every receipt and release, with quantities kept in sync."
            >
                {can('transactions.create') && (
                    <Link href="/transactions/create" className="button">
                        + Record movement
                    </Link>
                )}
            </PageHeading>
            <form
                className="filter-bar"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.get('/transactions', { search }, { preserveState: true });
                }}
            >
                <input
                    placeholder="Search product or SKU…"
                    aria-label="Search stock movements"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="button secondary">Search</button>
            </form>
            <section className="panel">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Recorded by</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.length ? (
                                transactions.data.map((t) => (
                                    <tr key={t.id}>
                                        <td>
                                            <Link href={`/transactions/${t.id}`}>
                                                {date(t.created_at)}
                                            </Link>
                                        </td>
                                        <td>
                                            {t.product.product_name}
                                            <small>{t.product.sku}</small>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${t.transaction_type === 'IN' ? 'good' : 'warning'}`}
                                            >
                                                {t.transaction_type}
                                            </span>
                                        </td>
                                        <td>{t.quantity}</td>
                                        <td>{t.user?.name ?? 'Opening stock'}</td>
                                        <td>{t.remarks || '—'}</td>
                                        <td>
                                            {can('transactions.delete') && (
                                                <button
                                                    className="text-danger"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                'Delete this movement and reverse its stock effect?',
                                                            )
                                                        )
                                                            router.delete(`/transactions/${t.id}`);
                                                    }}
                                                >
                                                    Reverse & delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <Empty columns={7} />
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={transactions.links} />
            </section>
        </AppLayout>
    );
}
