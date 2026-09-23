import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Alert } from '../../components/common/Alert';

const JOB_LEVEL_OPTIONS = [
    { value: 'entry_level', label: 'Entry Level / Junior' },
    { value: 'individual_contributor', label: 'Individual Contributor' },
    { value: 'senior_lead', label: 'Senior / Lead' },
    { value: 'manager', label: 'Manager' },
    { value: 'senior_manager', label: 'Senior Manager' },
    { value: 'director', label: 'Director' },
    { value: 'senior_director', label: 'Senior Director' },
    { value: 'vp_svp', label: 'VP / SVP' },
    { value: 'c_level', label: 'C-Level' },
];

export function RegisterPage() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        departmentName: '',
        jobFunction: '',
        jobLevel: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim() || formData.name.trim().length < 2) {
            newErrors.name = 'Full name must be at least 2 characters';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please provide a valid email address';
        }
        if (!formData.departmentName.trim() || formData.departmentName.trim().length < 2) {
            newErrors.departmentName = 'Department must be at least 2 characters';
        }
        if (!formData.jobFunction.trim() || formData.jobFunction.trim().length < 2) {
            newErrors.jobFunction = 'Job function must be at least 2 characters';
        }
        if (!formData.jobLevel) {
            newErrors.jobLevel = 'Please select a job level';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setSuccessMessage('');
        if (!validate()) return;
        setLoading(true);
        try {
            const result = await register({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                departmentName: formData.departmentName.trim(),
                jobFunction: formData.jobFunction.trim(),
                jobLevel: formData.jobLevel,
            });
            setSuccessMessage(result?.message || 'Registration successful! Please check your email to verify your account.');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join ServiceDesk Pro</p>
                </div>

                {serverError && <Alert type="error" message={serverError} onClose={() => setServerError('')} />}

                {successMessage ? (
                    <div className="text-center py-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <p className="text-green-700 font-medium text-lg mb-2">Registration Successful!</p>
                        <p className="text-gray-600 mb-6">{successMessage}</p>
                        <Link to="/login" className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            Go to Login
                        </Link>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <Input
                        label="Full Name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                    />

                    {/* Email */}
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />

                    {/* Department & Job Function — side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Department"
                            name="departmentName"
                            placeholder="e.g. Engineering"
                            value={formData.departmentName}
                            onChange={handleChange}
                            error={errors.departmentName}
                            required
                        />
                        <Input
                            label="Job Function"
                            name="jobFunction"
                            placeholder="e.g. Software Development"
                            value={formData.jobFunction}
                            onChange={handleChange}
                            error={errors.jobFunction}
                            required
                        />
                    </div>

                    {/* Job Level */}
                    <Select
                        label="Job Level"
                        name="jobLevel"
                        value={formData.jobLevel}
                        onChange={handleChange}
                        placeholder="Select your job level"
                        options={JOB_LEVEL_OPTIONS}
                        error={errors.jobLevel}
                        required
                    />

                    {/* Password fields — side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Create Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" isLoading={loading}>
                        Create Account
                    </Button>
                </form>
                )}

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
