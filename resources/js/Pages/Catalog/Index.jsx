import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { PageHeading, Empty, useCan } from '../../Components/UI';
export default function Index({ kind, rows }) {
    const supplier = kind === 'suppliers';
    const title = supplier ? 'Suppliers' : 'Categories';
    const name = supplier ? 'supplier_name' : 'category_name';
    const can = useCan();
    const manage = can(`${kind}.manage`);
    const [search, setSearch] = useState('');
    const columns = supplier
        ? [
              ['supplier_name', 'Supplier'],
              ['contact_person', 'Contact'],
              ['phone', 'Phone'],
              ['email', 'Email'],
              ['address', 'Address'],
          ]
        : [
              ['category_name', 'Category'],
              ['description', 'Description'],
          ];
    const filtered = rows.filter((row) => row[name].toLowerCase().includes(search.toLowerCase()));
    return (
        <AppLayout title={title}>
            <PageHeading
                title={title}
                subtitle={
                    supplier
                        ? 'Your supply partners and contact details.'
                        : 'Organize products into clear collections.'
                }
            >
                {manage && (
                    <Link href={`/${kind}/create`} className="button">
                        + Add {supplier ? 'supplier' : 'category'}
                    </Link>
                )}
            </PageHeading>
            <div className="filter-bar">
                <input
                    aria-label={`Search ${title}`}
                    placeholder={`Search ${title.toLowerCase()}…`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <section className="panel">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                {columns.map(([key, label]) => (
                                    <th key={key}>{label}</th>
                                ))}
                                <th>Products</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length ? (
                                filtered.map((row) => (
                                    <tr key={row.id}>
                                        {columns.map(([key], i) => (
                                            <td key={key}>
                                                {i === 0 ? (
                                                    <Link href={`/${kind}/${row.id}`}>
                                                        {row[key]}
                                                    </Link>
                                                ) : (
                                                    row[key] || '—'
                                                )}
                                            </td>
                                        ))}
                                        <td>{row.products_count}</td>
                                        <td>
                                            {manage && (
                                                <div className="actions">
                                                    <Link href={`/${kind}/${row.id}/edit`}>
                                                        Edit
                                                    </Link>
                                                    <button
                                                        className="text-danger"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    `Delete ${row[name]}? Products linked to this record must be moved first.`,
                                                                )
                                                            )
                                                                router.delete(`/${kind}/${row.id}`);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <Empty columns={columns.length + 2} />
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </AppLayout>
    );
}
