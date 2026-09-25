import { UserProfile, UserRole } from '../types';

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  message?: string;
}

/**
 * Authenticate user with Email and Password
 */
export function authenticateUser(
  email: string,
  password: string,
  users: UserProfile[]
): AuthResult {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
  }

  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ' };
  }

  // Check password
  if (user.password && user.password !== cleanPassword) {
    return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' };
  }

  // Update last login
  const updatedUser: UserProfile = {
    ...user,
    lastLoginAt: new Date().toISOString()
  };

  return {
    success: true,
    user: updatedUser
  };
}

/**
 * Change own password
 */
export function changeUserPassword(
  uid: string,
  oldPassword: string,
  newPassword: string,
  users: UserProfile[]
): { success: boolean; message: string; updatedUsers?: UserProfile[] } {
  const user = users.find(u => u.uid === uid);
  if (!user) {
    return { success: false, message: 'ไม่พบผู้ใช้ในระบบ' };
  }

  if (user.password && user.password !== oldPassword) {
    return { success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' };
  }

  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
  }

  const updatedUsers = users.map(u => {
    if (u.uid === uid) {
      return { ...u, password: newPassword };
    }
    return u;
  });

  return {
    success: true,
    message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว',
    updatedUsers
  };
}

/**
 * Admin reset user password
 */
export function adminResetUserPassword(
  targetUid: string,
  newPassword: string,
  users: UserProfile[]
): { success: boolean; message: string; updatedUsers?: UserProfile[] } {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร' };
  }

  const user = users.find(u => u.uid === targetUid);
  if (!user) {
    return { success: false, message: 'ไม่พบผู้ใช้ที่ต้องการรีเซ็ตรหัสผ่าน' };
  }

  const updatedUsers = users.map(u => {
    if (u.uid === targetUid) {
      return { ...u, password: newPassword };
    }
    return u;
  });

  return {
    success: true,
    message: `รีเซ็ตรหัสผ่านสำหรับ ${user.displayName} สำเร็จแล้ว`,
    updatedUsers
  };
}

/**
 * Add a new user (Admin only)
 */
export function addNewUser(
  newUser: {
    email: string;
    displayName: string;
    role: UserRole;
    password: string;
  },
  users: UserProfile[]
): { success: boolean; message: string; updatedUsers?: UserProfile[]; createdUser?: UserProfile } {
  const cleanEmail = newUser.email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' };
  }

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'มีอีเมลนี้อยู่ในระบบแล้ว' };
  }

  if (!newUser.password || newUser.password.length < 4) {
    return { success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' };
  }

  const uid = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const user: UserProfile = {
    uid,
    email: cleanEmail,
    displayName: newUser.displayName.trim() || cleanEmail.split('@')[0],
    role: newUser.role,
    password: newUser.password,
    createdAt: new Date().toISOString()
  };

  const updatedUsers = [...users, user];

  return {
    success: true,
    message: `เพิ่มผู้ใช้ ${user.displayName} เรียบร้อยแล้ว`,
    updatedUsers,
    createdUser: user
  };
}

/**
 * Update user details (Name, Role)
 */
export function updateUserDetails(
  uid: string,
  details: { displayName: string; role: UserRole },
  users: UserProfile[],
  currentAdminUid: string
): { success: boolean; message: string; updatedUsers?: UserProfile[] } {
  const targetUser = users.find(u => u.uid === uid);
  if (!targetUser) {
    return { success: false, message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข' };
  }

  // Prevent demoting last Admin
  if (targetUser.role === 'Admin' && details.role !== 'Admin') {
    const adminCount = users.filter(u => u.role === 'Admin').length;
    if (adminCount <= 1) {
      return { success: false, message: 'ไม่สามารถเปลี่ยนสิทธิ์ผู้ดูแลระบบคนสุดท้ายได้ ระบบต้องมี Admin อย่างน้อย 1 คน' };
    }
  }

  const updatedUsers = users.map(u => {
    if (u.uid === uid) {
      return {
        ...u,
        displayName: details.displayName.trim() || u.displayName,
        role: details.role
      };
    }
    return u;
  });

  return {
    success: true,
    message: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว',
    updatedUsers
  };
}

/**
 * Delete a user
 */
export function removeUser(
  targetUid: string,
  users: UserProfile[],
  currentAdminUid: string
): { success: boolean; message: string; updatedUsers?: UserProfile[] } {
  if (targetUid === currentAdminUid) {
    return { success: false, message: 'คุณไม่สามารถลบบัญชีของตัวเองที่กำลังเข้าใช้งานอยู่ได้' };
  }

  const target = users.find(u => u.uid === targetUid);
  if (!target) {
    return { success: false, message: 'ไม่พบผู้ใช้นี้' };
  }

  if (target.role === 'Admin') {
    const adminCount = users.filter(u => u.role === 'Admin').length;
    if (adminCount <= 1) {
      return { success: false, message: 'ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้' };
    }
  }

  const updatedUsers = users.filter(u => u.uid !== targetUid);

  return {
    success: true,
    message: `ลบผู้ใช้ ${target.displayName} เรียบร้อยแล้ว`,
    updatedUsers
  };
}
