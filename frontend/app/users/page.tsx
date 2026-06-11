'use client';

import { useEffect, useState } from 'react';
import { api, User } from '@/lib/api';
import UserCreateForm from '@/components/users/UserCreateForm';
import UserTable from '@/components/users/UserTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.users.list()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
        <p className="text-sm text-slate-500 mt-1">Create and manage platform users</p>
      </div>

      <UserCreateForm onCreated={(user) => setUsers((prev) => [user, ...prev])} />

      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">
          All Users ({users.length})
        </h2>
        {loading && <LoadingSpinner label="Loading users..." />}
        {error && <ErrorAlert message={error} />}
        {!loading && !error && <UserTable users={users} />}
      </div>
    </div>
  );
}
