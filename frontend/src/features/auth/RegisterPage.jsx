import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password);
            navigate('/');
        }
        catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join ServiceDesk Pro</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')}/>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required/>
          <Input label="Email" name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required/>
          <Input label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required/>
          <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required/>
          <Button type="submit" className="w-full" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>);
}
