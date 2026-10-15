import React from 'react';
import { useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';
import { Field } from '../../Components/UI';
export default function ResetPassword({ token, email }) {
    const form = useForm({ token, email, password: '', password_confirmation: '' });
    return (
        <AuthLayout title="Choose a new password">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/reset-password', {
                        onFinish: () => form.reset('password', 'password_confirmation'),
                    });
                }}
            >
                <Field label="Email address" name="email" type="email" form={form} required />
                <Field
                    label="New password"
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
                    Reset password
                </button>
            </form>
        </AuthLayout>
    );
}
