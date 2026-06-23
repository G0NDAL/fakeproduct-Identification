import React, { useState } from 'react';
import { registerUser } from '../utils/api';


function generateUserId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const RegistrationForm = () => {
  const [form, setForm] = useState({
    user_id: generateUserId(),
    first_name: '',
    last_name: '',
    user_role: '',
    user_email: '',
    user_password: '',
    user_address: '',
    user_phone: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.first_name) newErrors.first_name = 'First name is required';
    if (!form.last_name) newErrors.last_name = 'Last name is required';
    if (!form.user_email) {
      newErrors.user_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.user_email)) {
      newErrors.user_email = 'Invalid email format';
    } else if (!/^[^\s@]+@(gmail\.com|googlemail\.com|outlook\.com|icloud\.com)$/i.test(form.user_email)) {
      newErrors.user_email = 'Only Google, Outlook, or iCloud emails allowed';
    }
    if (!form.user_password) {
      newErrors.user_password = 'Password is required';
    } else if (form.user_password.length < 6) {
      newErrors.user_password = 'Password must be at least 6 characters';
    }
    if (!form.user_role) newErrors.user_role = 'User type is required';
    if (!form.user_address) newErrors.user_address = 'Address is required';
    if (!form.user_phone) {
      newErrors.user_phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(form.user_phone)) {
      newErrors.user_phone = 'Enter a valid phone number';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      try {
        await registerUser(form);
        setSuccess('Registration successful!');
        setForm({
          user_id: generateUserId(),
          first_name: '',
          last_name: '',
          user_role: '',
          user_email: '',
          user_password: '',
          user_address: '',
          user_phone: '',
        });
      } catch (err) {
        setSuccess('');
        setErrors({ api: err.message || 'Registration failed' });
      }
    } else {
      setSuccess('');
    }
  };

  return (
    <div className="register-form-glassy">
      <h2 className="register-form-title">Register</h2>
      <form onSubmit={handleSubmit} className="register-form-fields">
        <div className="register-form-group">
          <label className="register-form-label">User ID</label>
          <input
            type="text"
            name="user_id"
            value={form.user_id}
            className="register-form-input"
            readOnly
          />
        </div>
        <div className="register-form-group">
          <label className="register-form-label">First Name</label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="register-form-input"
            placeholder="Enter your first name"
          />
          {errors.first_name && <p className="register-form-error">{errors.first_name}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-form-label">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="register-form-input"
            placeholder="Enter your last name"
          />
          {errors.last_name && <p className="register-form-error">{errors.last_name}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-form-label">Email</label>
          <input
            type="email"
            name="user_email"
            value={form.user_email}
            onChange={handleChange}
            className="register-form-input"
            placeholder="Enter your email"
            autoComplete="email"
          />
          {errors.user_email && <p className="register-form-error">{errors.user_email}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-form-label">Password</label>
          <input
            type="password"
            name="user_password"
            value={form.user_password}
            onChange={handleChange}
            className="register-form-input"
            placeholder="Enter your password"
            autoComplete="new-password"
          />
          {errors.user_password && <p className="register-form-error">{errors.user_password}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-form-label">User Type</label>
          <select
            name="user_role"
            value={form.user_role}
            onChange={handleChange}
            className="register-form-input"
          >
            <option value="">Select type</option>
            <option value="consumer">Consumer</option>
            <option value="seller">Seller</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="admin">Admin</option>
          </select>
          {errors.user_role && <p className="register-form-error">{errors.user_role}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-form-label">Address</label>
          <input
            type="text"
            name="user_address"
            value={form.user_address}
            onChange={handleChange}
            className="register-form-input"
            placeholder="Enter your address"
          />
          {errors.user_address && <p className="register-form-error">{errors.user_address}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-form-label">Phone Number</label>
          <input
            type="text"
            name="user_phone"
            value={form.user_phone}
            onChange={handleChange}
            className="register-form-input"
            placeholder="Enter your phone number"
          />
          {errors.user_phone && <p className="register-form-error">{errors.user_phone}</p>}
        </div>
        <button
          type="submit"
          className="register-form-btn"
        >
          Register
        </button>
        {errors.api && <p className="register-form-error" style={{marginTop:8}}>{errors.api}</p>}
        {success && <p className="register-form-success">{success}</p>}
      </form>
    </div>
  );
};

export default RegistrationForm;
