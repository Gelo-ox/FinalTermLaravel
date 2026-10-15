import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { PageHeading, Empty, money, useCan } from '../../Components/UI';
export default function Show({ kind, record }) {
    const supplier = kind === 'suppliers';
    const title = record[supplier ? 'supplier_name' : 'category_name'];
    const can = useCan();
    return (
        <AppLayout title={title}>
            <PageHeading
                title={title}
                subtitle={supplier ? record.contact_person : record.description}
            >
                <Link href={`/${kind}`} className="button secondary">
                    Back
                </Link>
                {can(`${kind}.manage`) && (
                    <Link href={`/${kind}/${record.id}/edit`} className="button">
                        Edit
                    </Link>
                )}
            </PageHeading>
            {supplier && (
                <section className="panel form-panel">
                    <dl className="details">
                        {['phone', 'email', 'address'].map((key) => (
                            <div key={key}>
                                <dt>{key}</dt>
                                <dd>{record[key] || '—'}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}
            <section className="panel">
                <div className="panel-heading">
                    <h2>Linked products</h2>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>On hand</th>
                                <th>Unit price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {record.products.length ? (
                                record.products.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <Link href={`/products/${p.id}`}>{p.product_name}</Link>
                                        </td>
                                        <td>{p.sku}</td>
                                        <td>{p.quantity}</td>
                                        <td>{money(p.unit_price)}</td>
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
