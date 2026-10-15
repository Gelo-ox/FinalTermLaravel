import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { PageHeading, Empty, Pagination, money, useCan } from '../../Components/UI';
export default function Index({ products, categories, filters }) {
    const can = useCan();
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category_id ?? '');
    return (
        <AppLayout title="Products">
            <PageHeading
                title="Products"
                subtitle="Manage your catalog, pricing, and reorder levels."
            >
                {can('products.manage') && (
                    <Link className="button" href="/products/create">
                        + Add product
                    </Link>
                )}
            </PageHeading>
            <form
                className="filter-bar"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.get(
                        '/products',
                        { search, category_id: category },
                        { preserveState: true },
                    );
                }}
            >
                <input
                    aria-label="Search products"
                    placeholder="Search product name or SKU…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    aria-label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.category_name}
                        </option>
                    ))}
                </select>
                <button className="button secondary">Search</button>
                <Link
                    href="/products"
                    onClick={() => {
                        setSearch('');
                        setCategory('');
                    }}
                >
                    Reset
                </Link>
            </form>
            <section className="panel">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Product / SKU</th>
                                <th>Category</th>
                                <th>Supplier</th>
                                <th>On hand</th>
                                <th>Unit price</th>
                                <th>Reorder</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.length ? (
                                products.data.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <Link href={`/products/${p.id}`}>{p.product_name}</Link>
                                            <small>{p.sku}</small>
                                        </td>
                                        <td>{p.category?.category_name ?? '—'}</td>
                                        <td>{p.supplier?.supplier_name ?? '—'}</td>
                                        <td>
                                            <span
                                                className={`badge ${p.quantity <= p.reorder_level ? 'warning' : 'good'}`}
                                            >
                                                {p.quantity}
                                            </span>
                                        </td>
                                        <td>{money(p.unit_price)}</td>
                                        <td>{p.reorder_level}</td>
                                        <td>
                                            <div className="actions">
                                                {can('products.manage') && (
                                                    <Link href={`/products/${p.id}/edit`}>
                                                        Edit
                                                    </Link>
                                                )}
                                                {can('products.delete') && (
                                                    <button
                                                        className="text-danger"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    `Delete ${p.product_name} and its entire stock history?`,
                                                                )
                                                            )
                                                                router.delete(`/products/${p.id}`);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <Empty columns={7} />
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={products.links} />
            </section>
        </AppLayout>
    );
}
