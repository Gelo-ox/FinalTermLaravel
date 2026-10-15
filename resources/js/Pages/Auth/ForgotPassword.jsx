import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';
import { Field } from '../../Components/UI';
export default function ForgotPassword() {
    const form = useForm({ email: '' });
    return (
        <AuthLayout title="Reset your password">
            <p className="muted">Enter your account email to request a password reset link.</p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/forgot-password');
                }}
            >
                <Field label="Email address" name="email" type="email" form={form} required />
                <button className="button full" disabled={form.processing}>
                    Send reset link
                </button>
            </form>
            <p className="auth-link">
                <Link href="/login">Back to sign in</Link>
            </p>
        </AuthLayout>
    );
}
