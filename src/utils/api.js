// localStorage-based user store (no backend needed)

export async function registerUser(data) {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  if (users.find(u => u.user_email === data.user_email)) {
    throw new Error('Email already registered');
  }
  users.push({ ...data, created_at: new Date().toISOString() });
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  return { success: true, user_id: data.user_id };
}

export function getUsers() {
  return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
}

export function loginUser(email, password) {
  const users = getUsers();
  return users.find(u => u.user_email === email && u.user_password === password) || null;
}
