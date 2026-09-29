'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { adminApi } from '@/lib/api';
import { Lock, Mail, Loader2 } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await adminApi.login(email, password);

      if (data && data.user) {
        if (!['admin', 'super_admin'].includes(data.user.role)) {
          await adminApi.logout();
          throw new Error('Access denied. Administrator privileges required.');
        }
        router.push('/');
      } else {
        throw new Error('Login failed: invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image src="/nature-farming-official-v2.png" alt="Nature Farming" width={60} height={60} className="object-contain mb-4" />
            <span>Nature Farming</span>
          </div>
          <h1>Admin Portal</h1>
          <p>Please sign in to manage your ecosystem</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                id="email"
                type="email"
                placeholder="admin@nfplantation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.loginBtn}>
            {loading ? (
              <>
                <Loader2 className={styles.spinner} size={20} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          &copy; {new Date().getFullYear()} Nature Farming (Pvt) Ltd.
        </div>
      </div>
      <div className={styles.backgroundDecoration} />
    </div>
  );
}
