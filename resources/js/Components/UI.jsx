import React from 'react';
import { Link, usePage } from '@inertiajs/react';
export const money = (value) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value));
export const date = (value) => new Date(value).toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
export function useCan() {
    const user = usePage().props.auth?.user;
    return (permission) => user?.permissions?.includes(permission) ?? false;
}
export function Field({ label, name, form, type = 'text', options, ...props }) {
    return (
        <label className="field">
            <span>{label}</span>
            {options ? (
                <select
                    value={form.data[name] ?? ''}
                    onChange={(e) => form.setData(name, e.target.value)}
                    {...props}
                >
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={form.data[name] ?? ''}
                    onChange={(e) => form.setData(name, e.target.value)}
                    aria-invalid={!!form.errors[name]}
                    {...props}
                />
            )}
            {form.errors[name] && <small className="error">{form.errors[name]}</small>}
        </label>
    );
}
export function Pagination({ links }) {
    return (
        <nav className="pagination" aria-label="Pagination">
            {links.map((link, i) =>
                link.url ? (
                    <Link key={i} href={link.url} className={link.active ? 'active' : ''}>
                        {link.label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')}
                    </Link>
                ) : (
                    <span key={i}>
                        {link.label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')}
                    </span>
                ),
            )}
        </nav>
    );
}
export function Empty({ columns, children = 'No records found.' }) {
    return (
        <tr>
            <td colSpan={columns} className="empty">
                {children}
            </td>
        </tr>
    );
}
export function PageHeading({ title, subtitle, children }) {
    return (
        <div className="page-heading">
            <div>
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            <div className="actions">{children}</div>
        </div>
    );
}
export function Errors() {
    const errors = usePage().props.errors ?? {};
    return (
        Object.keys(errors).length > 0 && (
            <div className="notice danger" role="alert">
                {Object.values(errors).map((error, i) => (
                    <div key={i}>{error}</div>
                ))}
            </div>
        )
    );
}
