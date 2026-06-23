import React, { useState } from "react";

export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div id="profile-dropdown" style={{ position: 'relative', display: 'inline-block',zIndex: 1000 }}>
      <button
        aria-label="Profile"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 44,
          height: 44,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 1,
          color: '#7dd3fc', // Light cyan accent
          background: '#10243a', // Deep blue to match navbar
          border: 'none',
          boxShadow: '0 2px 8px 0 rgba(0,170,255,0.10)',
          outline: 'none',
          transition: 'box-shadow 0.18s',
          borderRadius: '50%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(60,64,67,0.28)')}
        onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(60,64,67,0.18)')}
      >
        {user?.first_name?.[0]?.toUpperCase() || 'U'}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 10,
            minWidth: 200,
            background: 'rgba(18,24,40,0.98)',
            borderRadius: 16,
            boxShadow: '0 8px 32px 0 rgba(0,255,170,0.18)',
            color: '#e0e7ef',
            zIndex: 100,
            padding: '14px 0 8px 0',
            border: '1.5px solid #00ffaa44',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ padding: '10px 24px 6px 24px', fontWeight: 700, fontSize: 17, borderBottom: '1.5px solid #223', marginBottom: 8, letterSpacing: 0.2 }}>
            {user.first_name} {user.last_name}
          </div>
          {/* Show manufacture/manufacturer/user id if present */}
          {(user.user_id ) && (
            <div style={{ padding: '6px 24px 0 24px', fontSize: 13, color: '#38bdf8', fontWeight: 600 }}>
              {user.user_role} ID: {user.user_id }
            </div>
          )}
          <div style={{ padding: '6px 24px', fontSize: 14, color: '#7dd3fc' }}>{user.user_role}</div>
          <div style={{ padding: '6px 24px', fontSize: 14, color: '#a5b4fc', wordBreak: 'break-all' }}>{user.user_email}</div>
          <button
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#38bdf8', // sky-400
              fontWeight: 600,
              padding: '10px 0 2px 0',
              cursor: 'pointer',
              borderTop: '1.5px solid #223',
              fontSize: 16,
              letterSpacing: 0.2,
              transition: 'color 0.15s',
            }}
            onClick={() => { setOpen(false); alert('Change Profile Pic clicked!'); }}
            onMouseOver={e => (e.currentTarget.style.color = '#0ea5e9')}
            onMouseOut={e => (e.currentTarget.style.color = '#38bdf8')}
          >Change Profile Pic</button>
          <button
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#fbbf24', // amber-400
              fontWeight: 600,
              padding: '10px 0 2px 0',
              cursor: 'pointer',
              borderTop: '1.5px solid #223',
              fontSize: 16,
              letterSpacing: 0.2,
              transition: 'color 0.15s',
            }}
            onClick={() => { setOpen(false); alert('Reset Password clicked!'); }}
            onMouseOver={e => (e.currentTarget.style.color = '#f59e42')}
            onMouseOut={e => (e.currentTarget.style.color = '#fbbf24')}
          >Reset Password</button>
          <button
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#f87171',
              fontWeight: 600,
              padding: '10px 0 2px 0',
              cursor: 'pointer',
              borderTop: '1.5px solid #223',
              fontSize: 16,
              letterSpacing: 0.2,
              transition: 'color 0.15s',
            }}
            onClick={() => { setOpen(false); alert('Delete Account clicked!'); }}
            onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseOut={e => (e.currentTarget.style.color = '#f87171')}
          >Delete Account</button>
          <button
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#f87171',
              fontWeight: 600,
              padding: '12px 0 2px 0',
              cursor: 'pointer',
              borderTop: '1.5px solid #223',
              marginTop: 10,
              fontSize: 16,
              letterSpacing: 0.2,
              transition: 'color 0.15s',
            }}
            onClick={() => { setOpen(false); onLogout(); }}
            onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseOut={e => (e.currentTarget.style.color = '#f87171')}
          >Logout</button>
        </div>
      )}
    </div>
  );
}
