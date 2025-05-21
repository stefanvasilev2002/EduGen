import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUserPlus, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { AuthService } from '../../services';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        phoneNumber: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (AuthService.isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const validateField = (name, value, allValues = formData) => {
        switch (name) {
            case 'username':
                if (!value) {
                    return 'Username is required';
                }
                if (value.length < 3) {
                    return 'Username must be at least 3 characters';
                }
                if (value.length > 20) {
                    return 'Username must be less than 20 characters';
                }
                if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    return 'Username can only contain letters, numbers, and underscores';
                }
                return '';

            case 'email':
                if (!value) {
                    return 'Email is required';
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Please enter a valid email address';
                }
                return '';

            case 'password':
                if (!value) {
                    return 'Password is required';
                }
                if (value.length < 8) {
                    return 'Password must be at least 8 characters';
                }
                if (!/(?=.*[a-z])/.test(value)) {
                    return 'Password must contain at least one lowercase letter';
                }
                if (!/(?=.*[A-Z])/.test(value)) {
                    return 'Password must contain at least one uppercase letter';
                }
                if (!/(?=.*\d)/.test(value)) {
                    return 'Password must contain at least one number';
                }
                if (!/(?=.*[@$!%*?&])/.test(value)) {
                    return 'Password must contain at least one special character (@$!%*?&)';
                }
                return '';

            case 'confirmPassword':
                if (!value) {
                    return 'Please confirm your password';
                }
                if (value !== allValues.password) {
                    return 'Passwords do not match';
                }
                return '';

            case 'dateOfBirth':
                if (!value) {
                    return 'Date of birth is required';
                }
                const date = new Date(value);
                const today = new Date();
                let age = today.getFullYear() - date.getFullYear();
                const monthDiff = today.getMonth() - date.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                    age--;
                }

                if (age > 120) {
                    return 'Please enter a valid date of birth';
                }
                return '';

            case 'phoneNumber':
                if (value && !/^\+?[\d\s()-]+$/.test(value)) {
                    return 'Please enter a valid phone number';
                }
                return '';

            default:
                return '';
        }
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key], formData);
            if (error) {
                newErrors[key] = error;
            }
        });
        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };
        setFormData(newFormData);

        if (touched[name]) {
            setErrors({
                ...errors,
                [name]: validateField(name, value, newFormData)
            });
        }

        if (name === 'password' && touched.confirmPassword) {
            setErrors({
                ...errors,
                [name]: validateField(name, value, newFormData),
                confirmPassword: validateField('confirmPassword', newFormData.confirmPassword, newFormData)
            });
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true
        });
        setErrors({
            ...errors,
            [name]: validateField(name, formData[name], formData)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                dateOfBirth: formData.dateOfBirth,
                phoneNumber: formData.phoneNumber
            };

            await AuthService.register(userData);
            setSuccess('Registration successful! You can now log in.');

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration error:', err);
            setError(
                err.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        const formErrors = validateForm();
        return Object.keys(formErrors).length === 0 &&
            formData.username &&
            formData.email &&
            formData.password &&
            formData.confirmPassword &&
            formData.dateOfBirth;
    };

    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;

        if (strength <= 2) return { text: 'Weak', color: 'red' };
        if (strength <= 4) return { text: 'Medium', color: 'yellow' };
        return { text: 'Strong', color: 'green' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                        <FiAlertCircle className="mr-2" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
                        <FiCheckCircle className="mr-2" />
                        <span>{success}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.username && touched.username ? 'border-red-300' : 'border-gray-300'
                                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                            />
                            {errors.username && touched.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                            />
                            {errors.email && touched.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className={`block w-full px-3 py-2 pr-10 border ${
                                        errors.password && touched.password ? 'border-red-300' : 'border-gray-300'
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <FiEyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <FiEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Password strength:</span>
                                        <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                                            style={{
                                                width: passwordStrength.text === 'Weak' ? '33%' :
                                                    passwordStrength.text === 'Medium' ? '66%' : '100%'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            {errors.password && touched.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className={`block w-full px-3 py-2 pr-10 border ${
                                        errors.confirmPassword && touched.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <FiEyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <FiEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && touched.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                Date of Birth
                            </label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.dateOfBirth && touched.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                            />
                            {errors.dateOfBirth && touched.dateOfBirth && (
                                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                Phone Number (Optional)
                            </label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                className={`mt-1 block w-full px-3 py-2 border ${
                                    errors.phoneNumber && touched.phoneNumber ? 'border-red-300' : 'border-gray-300'
                                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="+1 (555) 123-4567"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                            />
                            {errors.phoneNumber && touched.phoneNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid()}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <FiUserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                            </span>
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;