import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Field, PageHeading } from '../../Components/UI';
export default function CatalogForm({ kind, record }) {
    const supplier = kind === 'suppliers';
    const noun = supplier ? 'supplier' : 'category';
    const fields = supplier
        ? [
              ['supplier_name', 'Supplier name', 150],
              ['contact_person', 'Contact person', 100],
              ['phone', 'Phone', 50],
              ['email', 'Email', 100],
              ['address', 'Address', 255],
          ]
        : [
              ['category_name', 'Category name', 100],
              ['description', 'Description', 255],
          ];
    const form = useForm(Object.fromEntries(fields.map(([name]) => [name, record?.[name] ?? ''])));
    const title = `${record ? 'Edit' : 'Add'} ${noun}`;
    return (
        <AppLayout title={title}>
            <PageHeading title={title} />
            <form
                className="panel form-panel"
                onSubmit={(e) => {
                    e.preventDefault();
                    record ? form.put(`/${kind}/${record.id}`) : form.post(`/${kind}`);
                }}
            >
                <div className="form-grid">
                    {fields.map(([name, label, max], i) => (
                        <Field
                            key={name}
                            label={label}
                            name={name}
                            type={name === 'email' ? 'email' : 'text'}
                            form={form}
                            required={i === 0}
                            maxLength={max}
                        />
                    ))}
                </div>
                <div className="form-footer">
                    <Link href={`/${kind}`} className="button secondary">
                        Cancel
                    </Link>
                    <button className="button" disabled={form.processing}>
                        Save {noun}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
