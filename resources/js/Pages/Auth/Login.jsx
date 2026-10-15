import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';
import { Field } from '../../Components/UI';
export default function Login() {
    const form = useForm({ email: '', password: '', remember: false });
    return (
        <AuthLayout title="Welcome back">
            <p className="muted">Sign in to your inventory workspace.</p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/login', { onFinish: () => form.reset('password') });
                }}
            >
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
                    autoComplete="current-password"
                />
                <div className="form-meta">
                    <label>
                        <input
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(e) => form.setData('remember', e.target.checked)}
                        />{' '}
                        Remember me
                    </label>
                    <Link href="/forgot-password">Forgot password?</Link>
                </div>
                <button className="button full" disabled={form.processing}>
                    Sign in
                </button>
            </form>
            <p className="auth-link">
                New here? <Link href="/register">Create an account</Link>
            </p>
        </AuthLayout>
    );
}
