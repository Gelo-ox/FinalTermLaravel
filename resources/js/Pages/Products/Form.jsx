import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Field, PageHeading } from '../../Components/UI';
export default function ProductForm({ product, categories, suppliers }) {
    const form = useForm({
        product_name: product?.product_name ?? '',
        sku: product?.sku ?? '',
        category_id: product?.category_id ?? '',
        supplier_id: product?.supplier_id ?? '',
        ...(!product ? { quantity: 0 } : {}),
        unit_price: product?.unit_price ?? '0.00',
        reorder_level: product?.reorder_level ?? 10,
    });
    const title = product ? 'Edit product' : 'Add product';
    return (
        <AppLayout title={title}>
            <PageHeading title={title} subtitle="Keep your inventory catalog accurate." />
            <form
                className="panel form-panel"
                onSubmit={(e) => {
                    e.preventDefault();
                    product ? form.put(`/products/${product.id}`) : form.post('/products');
                }}
            >
                <div className="form-grid">
                    <Field
                        label="Product name"
                        name="product_name"
                        form={form}
                        required
                        maxLength={150}
                    />
                    <Field label="SKU" name="sku" form={form} required maxLength={50} />
                    <Field
                        label="Category"
                        name="category_id"
                        form={form}
                        options={[
                            { value: '', label: 'No category' },
                            ...categories.map((c) => ({ value: c.id, label: c.category_name })),
                        ]}
                    />
                    <Field
                        label="Supplier"
                        name="supplier_id"
                        form={form}
                        options={[
                            { value: '', label: 'No supplier' },
                            ...suppliers.map((s) => ({ value: s.id, label: s.supplier_name })),
                        ]}
                    />
                    {!product && (
                        <Field
                            label="Opening quantity"
                            name="quantity"
                            type="number"
                            min="0"
                            step="1"
                            form={form}
                            required
                        />
                    )}
                    <Field
                        label="Unit price (PHP)"
                        name="unit_price"
                        type="number"
                        min="0"
                        step="0.01"
                        form={form}
                        required
                    />
                    <Field
                        label="Reorder level"
                        name="reorder_level"
                        type="number"
                        min="0"
                        step="1"
                        form={form}
                        required
                    />
                </div>
                {product && (
                    <p className="notice">
                        Current stock: {product.quantity}. Record a stock movement to adjust this
                        quantity.
                    </p>
                )}
                <div className="form-footer">
                    <Link href="/products" className="button secondary">
                        Cancel
                    </Link>
                    <button className="button" disabled={form.processing}>
                        Save product
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
