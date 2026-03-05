import { useState } from 'react';
import {
  useCreateDemoRequest,
  useHealth,
  useLogin,
  useUpdateTeamMember,
} from '../hooks/useApi';

export function ApiDemo() {
  const LOGIN_STORAGE_KEY = 'api-demo-login-state';
  const roleOptions = ['', 'analyst'];
  const statusOptions = ['', 'active'];

  const loadStoredLoginState = (): { memberId: string; email: string } => {
    const empty = { memberId: '', email: '' };
    if (typeof window === 'undefined') return empty;

    const raw = localStorage.getItem(LOGIN_STORAGE_KEY);
    if (!raw) return empty;

    try {
      const parsed = JSON.parse(raw) as { memberId?: string; email?: string };
      return {
        memberId: typeof parsed.memberId === 'string' ? parsed.memberId : '',
        email: typeof parsed.email === 'string' ? parsed.email : '',
      };
    } catch {
      localStorage.removeItem(LOGIN_STORAGE_KEY);
      return empty;
    }
  };

  const storedLoginState = loadStoredLoginState();

  const [demoName, setDemoName] = useState('Jordan Smith');
  const [demoCompanyName, setDemoCompanyName] = useState('Acme Brands');
  const [demoEmail, setDemoEmail] = useState('jordan.smith@example.com');
  const [demoWebsite, setDemoWebsite] = useState('https://www.acme.com');
  const [demoMonthlyVisitors, setDemoMonthlyVisitors] = useState('10k-50k');
  const [demoVertical, setDemoVertical] = useState('E-commerce');
  const [demoContactNumber, setDemoContactNumber] = useState('+1-555-0102');
  const [demoBusinessDescription, setDemoBusinessDescription] = useState(
    'We operate a multi-brand online retail marketplace focused on sustainable products.'
  );
  const [loginEmail, setLoginEmail] = useState(storedLoginState.email);
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [memberIdFromLogin, setMemberIdFromLogin] = useState(storedLoginState.memberId);
  const [healthHint, setHealthHint] = useState('');
  const [healthHintType, setHealthHintType] = useState<'success' | 'error'>('success');
  const [loginHint, setLoginHint] = useState('');
  const [loginHintType, setLoginHintType] = useState<'success' | 'error'>('success');
  const [demoHint, setDemoHint] = useState('');
  const [demoHintType, setDemoHintType] = useState<'success' | 'error'>('success');
  const [updateRole, setUpdateRole] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateHint, setUpdateHint] = useState('');
  const [updateHintType, setUpdateHintType] = useState<'success' | 'error'>('success');

  const health = useHealth();
  const createDemoRequest = useCreateDemoRequest();
  const login = useLogin();
  const updateMember = useUpdateTeamMember();

  const extractMemberIdFromLogin = (payload: unknown): string => {
    if (!payload || typeof payload !== 'object') return '';
    const record = payload as Record<string, unknown>;

    const direct = record.member_id;
    if (typeof direct === 'string' && direct.trim()) return direct.trim();

    const directCamel = record.memberId;
    if (typeof directCamel === 'string' && directCamel.trim()) return directCamel.trim();

    const directId = record.id;
    if (typeof directId === 'string' && directId.trim()) return directId.trim();

    const data = record.data;
    if (data && typeof data === 'object') {
      const dataRecord = data as Record<string, unknown>;

      const nestedDirect = dataRecord.member_id;
      if (typeof nestedDirect === 'string' && nestedDirect.trim()) return nestedDirect.trim();

      const nestedCamel = dataRecord.memberId;
      if (typeof nestedCamel === 'string' && nestedCamel.trim()) return nestedCamel.trim();

      const nestedId = dataRecord.id;
      if (typeof nestedId === 'string' && nestedId.trim()) return nestedId.trim();

      const memberObj = dataRecord.member;
      if (memberObj && typeof memberObj === 'object') {
        const memberRecord = memberObj as Record<string, unknown>;
        const memberId = memberRecord.id;
        if (typeof memberId === 'string' && memberId.trim()) return memberId.trim();
      }

      const userObj = dataRecord.user;
      if (userObj && typeof userObj === 'object') {
        const userRecord = userObj as Record<string, unknown>;
        const userMemberId = userRecord.member_id;
        if (typeof userMemberId === 'string' && userMemberId.trim()) return userMemberId.trim();

        const userMemberIdCamel = userRecord.memberId;
        if (typeof userMemberIdCamel === 'string' && userMemberIdCamel.trim()) return userMemberIdCamel.trim();

        const userId = userRecord.id;
        if (typeof userId === 'string' && userId.trim()) return userId.trim();
      }
    }

    return '';
  };

  const pickResponseMessage = (payload: unknown, fallback: string): string => {
    if (!payload || typeof payload !== 'object') return fallback;
    const record = payload as Record<string, unknown>;

    const directMessage = record.message;
    if (typeof directMessage === 'string' && directMessage.trim()) return directMessage.trim();

    const detail = record.detail;
    if (typeof detail === 'string' && detail.trim()) return detail.trim();

    const error = record.error;
    if (typeof error === 'string' && error.trim()) return error.trim();
    if (error && typeof error === 'object') {
      const errorRecord = error as Record<string, unknown>;
      for (const value of Object.values(errorRecord)) {
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
    }

    const data = record.data;
    if (data && typeof data === 'object') {
      const dataRecord = data as Record<string, unknown>;
      const dataMessage = dataRecord.message;
      if (typeof dataMessage === 'string' && dataMessage.trim()) return dataMessage.trim();
    }

    return fallback;
  };

  const handleHealthCheck = async () => {
    const result = await health.refetch();
    if (result.data) {
      setHealthHintType('success');
      setHealthHint(pickResponseMessage(result.data, 'Health check succeeded.'));
      return;
    }
    if (result.error) {
      setHealthHintType('error');
      setHealthHint(result.error instanceof Error ? result.error.message : 'Health check failed.');
    }
  };

  const handleLogin = () => {
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    setLoginHint('');
    setLoginHintType('success');
    login.mutate({
      email: loginEmail.trim(),
      password: loginPassword,
      remember_me: rememberMe,
      device_label: 'task-frontend',
    }, {
      onSuccess: (res) => {
        const foundMemberId = extractMemberIdFromLogin(res);
        setMemberIdFromLogin(foundMemberId);
        const responseMessage = pickResponseMessage(res, 'Login succeeded.');
        setLoginHintType('success');
        setLoginHint(responseMessage);
        localStorage.setItem(
          LOGIN_STORAGE_KEY,
          JSON.stringify({
            loggedIn: true,
            memberId: foundMemberId,
            email: loginEmail.trim(),
          })
        );
        setUpdateHint('');
      },
      onError: (err) => {
        setLoginHintType('error');
        setLoginHint(err instanceof Error ? err.message : 'Login failed.');
      },
    });
  };

  const handleCreateDemoRequest = () => {
    if (!demoName.trim() || !demoCompanyName.trim() || !demoEmail.trim()) return;
    setDemoHint('');
    setDemoHintType('success');
    createDemoRequest.mutate({
      name: demoName.trim(),
      company_name: demoCompanyName.trim(),
      email: demoEmail.trim(),
      website: demoWebsite.trim() || null,
      monthly_visitors: demoMonthlyVisitors.trim() || null,
      vertical: demoVertical.trim() || null,
      contact_number: demoContactNumber.trim() || null,
      business_description: demoBusinessDescription.trim() || null,
    }, {
      onSuccess: (res) => {
        setDemoHintType('success');
        setDemoHint(pickResponseMessage(res, 'Demo request submitted successfully.'));
      },
      onError: (err) => {
        setDemoHintType('error');
        setDemoHint(err instanceof Error ? err.message : 'Demo request failed.');
      },
    });
  };

  const handleUpdateMember = () => {
    if (!memberIdFromLogin.trim()) {
      setUpdateHintType('error');
      setUpdateHint('No member_id available. Please login first.');
      return;
    }
    if (!updateRole.trim() && !updateStatus.trim()) {
      setUpdateHintType('error');
      setUpdateHint('Please enter role or status before updating.');
      return;
    }
    updateMember.mutate({
      memberId: memberIdFromLogin.trim(),
      body: {
        role: updateRole.trim() || null,
        status: updateStatus.trim() || null,
      },
    }, {
      onSuccess: (res) => {
        setUpdateHintType('success');
        setUpdateHint(pickResponseMessage(res, 'Member updated successfully.'));
      },
      onError: (err) => {
        setUpdateHintType('error');
        setUpdateHint(err instanceof Error ? err.message : 'Update member failed.');
      },
    });
  };

  return (
    <div>
      <h1>Teams API Demo</h1>
      <p>
        API prefix in this page: <code>/api/v1</code>
      </p>
      <p>
        Set <code>VITE_API_BASE_URL=https://api.larevela.com</code> and auth header in{' '}
        <code>VITE_API_TOKEN</code> if needed.
      </p>

      <div style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
        <h3>Public GET: /health</h3>
        <button type="button" onClick={handleHealthCheck} disabled={health.isFetching}>
          {health.isFetching ? 'Checking…' : 'Check Health'}
        </button>
        {healthHint && (
          <p style={{ color: healthHintType === 'success' ? 'green' : '#b91c1c', marginTop: '0.5rem', marginBottom: 0 }}>
            {healthHint}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
        <h3>POST: /api/v1/auth/login</h3>
        <input
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="email"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '240px' }}
        />
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="password"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '240px' }}
        />
        <label style={{ marginRight: '0.75rem' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ marginRight: '0.35rem' }}
          />
          remember_me
        </label>
        <button
          type="button"
          onClick={handleLogin}
          disabled={login.isPending || !loginEmail.trim() || !loginPassword.trim()}
        >
          {login.isPending ? 'Signing in…' : 'Login'}
        </button>
        {loginHint && (
          <p style={{ color: loginHintType === 'success' ? 'green' : '#b91c1c', marginTop: '0.5rem', marginBottom: 0 }}>
            {loginHint}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
        <h3>PUT: /api/v1/teams/members/{'{member_id}'}</h3>
        <select
          value={updateRole}
          onChange={(e) => setUpdateRole(e.target.value)}
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '220px' }}
        >
          {roleOptions.map((option) => (
            <option key={option || 'empty-role'} value={option}>
              {option || 'role (optional)'}
            </option>
          ))}
        </select>
        <select
          value={updateStatus}
          onChange={(e) => setUpdateStatus(e.target.value)}
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '220px' }}
        >
          {statusOptions.map((option) => (
            <option key={option || 'empty-status'} value={option}>
              {option || 'status (optional)'}
            </option>
          ))}
        </select>
        <button type="button" onClick={handleUpdateMember} disabled={updateMember.isPending}>
          {updateMember.isPending ? 'Updating…' : 'Update Member'}
        </button>
        {updateHint && (
          <p style={{ color: updateHintType === 'success' ? 'green' : '#b91c1c', marginTop: '0.5rem', marginBottom: 0 }}>
            {updateHint}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
        <h3>Public POST: /api/v1/demo-requests</h3>
        <input
          type="text"
          value={demoName}
          onChange={(e) => setDemoName(e.target.value)}
          placeholder="name"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '240px' }}
        />
        <input
          type="text"
          value={demoCompanyName}
          onChange={(e) => setDemoCompanyName(e.target.value)}
          placeholder="company_name"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '240px' }}
        />
        <input
          type="email"
          value={demoEmail}
          onChange={(e) => setDemoEmail(e.target.value)}
          placeholder="email"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '240px' }}
        />
        <input
          type="text"
          value={demoWebsite}
          onChange={(e) => setDemoWebsite(e.target.value)}
          placeholder="website"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '240px' }}
        />
        <input
          type="text"
          value={demoMonthlyVisitors}
          onChange={(e) => setDemoMonthlyVisitors(e.target.value)}
          placeholder="monthly_visitors"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '240px' }}
        />
        <input
          type="text"
          value={demoVertical}
          onChange={(e) => setDemoVertical(e.target.value)}
          placeholder="vertical"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '240px' }}
        />
        <input
          type="text"
          value={demoContactNumber}
          onChange={(e) => setDemoContactNumber(e.target.value)}
          placeholder="contact_number"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '240px' }}
        />
        <input
          type="text"
          value={demoBusinessDescription}
          onChange={(e) => setDemoBusinessDescription(e.target.value)}
          placeholder="business_description"
          style={{ marginRight: '0.5rem', padding: '0.5rem', marginBottom: '0.5rem', width: '490px' }}
        />
        <div>
          <button
            type="button"
            onClick={handleCreateDemoRequest}
            disabled={createDemoRequest.isPending || !demoName.trim() || !demoCompanyName.trim() || !demoEmail.trim()}
          >
            {createDemoRequest.isPending ? 'Submitting…' : 'Submit Demo Request'}
          </button>
        </div>
      </div>

      {demoHint && <p style={{ color: demoHintType === 'success' ? 'green' : '#b91c1c' }}>{demoHint}</p>}
    </div>
  );
}
