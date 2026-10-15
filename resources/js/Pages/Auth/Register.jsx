import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';
import { Field } from '../../Components/UI';
export default function Register() {
    const form = useForm({ name: '', email: '', password: '', password_confirmation: '' });
    return (
        <AuthLayout title="Create your account">
            <p className="muted">
                New accounts receive read access. An administrator can update your role.
            </p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/register', {
                        onFinish: () => form.reset('password', 'password_confirmation'),
                    });
                }}
            >
                <Field label="Full name" name="name" form={form} required autoComplete="name" />
                <Field
                    label="Email address"
                    name="email"
                    type="email"
                    form={form}
                    required
                    autoComplete="username"
                />
                <Field
                    label="Password"
                    name="password"
                    type="password"
                    form={form}
                    required
                    minLength={8}
                    autoComplete="new-password"
                />
                <Field
                    label="Confirm password"
                    name="password_confirmation"
                    type="password"
                    form={form}
                    required
                    autoComplete="new-password"
                />
                <button className="button full" disabled={form.processing}>
                    Create account
                </button>
            </form>
            <p className="auth-link">
                Already registered? <Link href="/login">Sign in</Link>
            </p>
        </AuthLayout>
    );
}
