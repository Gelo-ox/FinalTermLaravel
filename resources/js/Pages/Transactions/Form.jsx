import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Field, PageHeading } from '../../Components/UI';
export default function TransactionForm({ products }) {
    const form = useForm({ product_id: '', transaction_type: 'IN', quantity: '', remarks: '' });
    const selected = products.find((p) => String(p.id) === String(form.data.product_id));
    return (
        <AppLayout title="Record movement">
            <PageHeading
                title="Record stock movement"
                subtitle="Receive stock or release items from your inventory."
            />
            <form
                className="panel form-panel"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/transactions');
                }}
            >
                <Field
                    label="Product"
                    name="product_id"
                    form={form}
                    required
                    options={[
                        { value: '', label: 'Select a product' },
                        ...products.map((p) => ({
                            value: p.id,
                            label: `${p.product_name} (${p.sku})`,
                        })),
                    ]}
                />
                {selected && (
                    <p className="notice">
                        Current stock on hand: <strong>{selected.quantity}</strong>
                    </p>
                )}
                <div className="form-grid">
                    <Field
                        label="Movement type"
                        name="transaction_type"
                        form={form}
                        options={[
                            { value: 'IN', label: 'Stock IN — receiving' },
                            { value: 'OUT', label: 'Stock OUT — releasing' },
                        ]}
                    />
                    <Field
                        label="Quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        step="1"
                        form={form}
                        required
                    />
                </div>
                <Field
                    label="Remarks"
                    name="remarks"
                    form={form}
                    maxLength={255}
                    placeholder="e.g. Restock from supplier"
                />
                <div className="form-footer">
                    <Link href="/transactions" className="button secondary">
                        Cancel
                    </Link>
                    <button className="button" disabled={form.processing}>
                        Record movement
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
