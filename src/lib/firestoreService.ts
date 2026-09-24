import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { CarWashRecord, Branch, Employee, CarColor, CarBrand, UserProfile } from '../types';
import { storage } from './storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Subscribe to real-time records
export const subscribeToRecords = (
  onRecords: (records: CarWashRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const path = 'records';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const records: CarWashRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push({ id: docSnap.id, ...docSnap.data() } as CarWashRecord);
      });
      // Sort newest createdAt / date first
      records.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.date).getTime();
        const timeB = new Date(b.createdAt || b.date).getTime();
        return timeB - timeA;
      });
      onRecords(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
};

// Save or Update Record in Firestore
export const saveRecordToFirestore = async (record: CarWashRecord): Promise<void> => {
  const path = 'records';
  try {
    const docRef = doc(db, path, record.id);
    await setDoc(docRef, {
      ...record,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${record.id}`);
  }
};

// Delete Record from Firestore
export const deleteRecordFromFirestore = async (recordId: string): Promise<void> => {
  const path = 'records';
  try {
    const docRef = doc(db, path, recordId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${recordId}`);
  }
};

// Fetch records once (On-demand low-quota read)
export const fetchRecordsOnce = async (): Promise<CarWashRecord[]> => {
  const path = 'records';
  try {
    const snap = await getDocs(collection(db, path));
    const records: CarWashRecord[] = [];
    snap.forEach((docSnap) => {
      records.push({ id: docSnap.id, ...docSnap.data() } as CarWashRecord);
    });
    records.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date).getTime();
      const timeB = new Date(b.createdAt || b.date).getTime();
      return timeB - timeA;
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
};

// Batch seed records if Firestore collection is empty
export const seedRecordsToFirestoreIfEmpty = async (initialRecords: CarWashRecord[]): Promise<boolean> => {
  if (storage.isSeeded()) return false;
  // Mark seeded immediately to avoid duplicate attempts from rapid re-renders
  storage.setSeeded(true);
  const path = 'records';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty && initialRecords.length > 0) {
      const batch = writeBatch(db);
      initialRecords.forEach((rec) => {
        const docRef = doc(db, path, rec.id);
        batch.set(docRef, { ...rec, updatedAt: new Date().toISOString() });
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

// ================= MASTER BRANCHES =================
export const subscribeToBranches = (
  onBranches: (branches: Branch[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const path = 'master_branches';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Branch[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Branch);
      });
      if (list.length > 0) {
        onBranches(list);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
};

export const syncAllBranchesToFirestore = async (branches: Branch[]): Promise<void> => {
  const path = 'master_branches';
  try {
    const snap = await getDocs(collection(db, path));
    const currentDocIds = new Set(snap.docs.map(d => d.id));
    const newDocIds = new Set(branches.map(b => b.id));

    const batch = writeBatch(db);
    // Upsert all current branches
    branches.forEach(branch => {
      const docRef = doc(db, path, branch.id);
      batch.set(docRef, branch, { merge: true });
    });
    // Delete any branches that were removed
    currentDocIds.forEach(id => {
      if (!newDocIds.has(id)) {
        batch.delete(doc(db, path, id));
      }
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const seedBranchesToFirestoreIfEmpty = async (initialBranches: Branch[]): Promise<boolean> => {
  if (storage.isSeeded()) return false;
  const path = 'master_branches';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty && initialBranches.length > 0) {
      const batch = writeBatch(db);
      initialBranches.forEach((b) => {
        const docRef = doc(db, path, b.id);
        batch.set(docRef, b);
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

export const saveBranchToFirestore = async (branch: Branch): Promise<void> => {
  const path = 'master_branches';
  try {
    const docRef = doc(db, path, branch.id);
    await setDoc(docRef, branch, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${branch.id}`);
  }
};

export const deleteBranchFromFirestore = async (branchId: string): Promise<void> => {
  const path = 'master_branches';
  try {
    const docRef = doc(db, path, branchId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${branchId}`);
  }
};

// ================= MASTER STAFF =================
export const subscribeToStaff = (
  onStaff: (staff: Employee[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const path = 'master_staff';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Employee[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Employee);
      });
      if (list.length > 0) {
        onStaff(list);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
};

export const syncAllStaffToFirestore = async (staffList: Employee[]): Promise<void> => {
  const path = 'master_staff';
  try {
    const snap = await getDocs(collection(db, path));
    const currentDocIds = new Set(snap.docs.map(d => d.id));
    const newDocIds = new Set(staffList.map(s => s.id));

    const batch = writeBatch(db);
    staffList.forEach(staff => {
      const docRef = doc(db, path, staff.id);
      batch.set(docRef, staff, { merge: true });
    });
    currentDocIds.forEach(id => {
      if (!newDocIds.has(id)) {
        batch.delete(doc(db, path, id));
      }
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const seedStaffToFirestoreIfEmpty = async (initialStaff: Employee[]): Promise<boolean> => {
  if (storage.isSeeded()) return false;
  const path = 'master_staff';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty && initialStaff.length > 0) {
      const batch = writeBatch(db);
      initialStaff.forEach((s) => {
        const docRef = doc(db, path, s.id);
        batch.set(docRef, s);
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

export const saveStaffToFirestore = async (staffMember: Employee): Promise<void> => {
  const path = 'master_staff';
  try {
    const docRef = doc(db, path, staffMember.id);
    await setDoc(docRef, staffMember, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${staffMember.id}`);
  }
};

export const deleteStaffFromFirestore = async (staffId: string): Promise<void> => {
  const path = 'master_staff';
  try {
    const docRef = doc(db, path, staffId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${staffId}`);
  }
};

// ================= MASTER COLORS =================
export const subscribeToColors = (
  onColors: (colors: CarColor[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const path = 'master_colors';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: CarColor[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as CarColor);
      });
      if (list.length > 0) {
        onColors(list);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
};

export const syncAllColorsToFirestore = async (colors: CarColor[]): Promise<void> => {
  const path = 'master_colors';
  try {
    const snap = await getDocs(collection(db, path));
    const currentDocIds = new Set(snap.docs.map(d => d.id));
    const newDocIds = new Set(colors.map(c => c.id));

    const batch = writeBatch(db);
    colors.forEach(color => {
      const docRef = doc(db, path, color.id);
      batch.set(docRef, color, { merge: true });
    });
    currentDocIds.forEach(id => {
      if (!newDocIds.has(id)) {
        batch.delete(doc(db, path, id));
      }
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const seedColorsToFirestoreIfEmpty = async (initialColors: CarColor[]): Promise<boolean> => {
  if (storage.isSeeded()) return false;
  const path = 'master_colors';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty && initialColors.length > 0) {
      const batch = writeBatch(db);
      initialColors.forEach((c) => {
        const docRef = doc(db, path, c.id);
        batch.set(docRef, c);
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

// ================= MASTER BRANDS =================
export const subscribeToBrands = (
  onBrands: (brands: CarBrand[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const path = 'master_brands';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: CarBrand[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as CarBrand);
      });
      if (list.length > 0) {
        onBrands(list);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
};

export const syncAllBrandsToFirestore = async (brands: CarBrand[]): Promise<void> => {
  const path = 'master_brands';
  try {
    const snap = await getDocs(collection(db, path));
    const currentDocIds = new Set(snap.docs.map(d => d.id));
    const newDocIds = new Set(brands.map(b => b.id));

    const batch = writeBatch(db);
    brands.forEach(brand => {
      const docRef = doc(db, path, brand.id);
      batch.set(docRef, brand, { merge: true });
    });
    currentDocIds.forEach(id => {
      if (!newDocIds.has(id)) {
        batch.delete(doc(db, path, id));
      }
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const seedBrandsToFirestoreIfEmpty = async (initialBrands: CarBrand[]): Promise<boolean> => {
  if (storage.isSeeded()) return false;
  const path = 'master_brands';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty && initialBrands.length > 0) {
      const batch = writeBatch(db);
      initialBrands.forEach((b) => {
        const docRef = doc(db, path, b.id);
        batch.set(docRef, b);
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

// ================= MASTER USERS / ROLES =================
export const subscribeToUserProfiles = (
  onUsers: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const path = 'master_users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
      });
      if (list.length > 0) {
        onUsers(list);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
};

export const syncAllUsersToFirestore = async (users: UserProfile[]): Promise<void> => {
  const path = 'master_users';
  try {
    const batch = writeBatch(db);
    users.forEach(user => {
      const docId = user.uid || user.email.replace(/[@.]/g, '_');
      const docRef = doc(db, path, docId);
      batch.set(docRef, user, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const seedUsersToFirestoreIfEmpty = async (initialUsers: UserProfile[]): Promise<boolean> => {
  if (storage.isSeeded()) return false;
  const path = 'master_users';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty && initialUsers.length > 0) {
      const batch = writeBatch(db);
      initialUsers.forEach((u) => {
        const docId = u.uid || u.email.replace(/[@.]/g, '_');
        const docRef = doc(db, path, docId);
        batch.set(docRef, u);
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

// ================= SYSTEM CONFIG (SHARED GOOGLE SHEET) =================
export const subscribeToSharedSheetConfig = (
  onConfig: (config: any | null) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const path = 'system_config';
  return onSnapshot(
    doc(db, path, 'google_sheet'),
    (docSnap) => {
      if (docSnap.exists()) {
        onConfig(docSnap.data());
      } else {
        onConfig(null);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `${path}/google_sheet`);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
};

export const saveSharedSheetConfigToFirestore = async (sheetConfig: any): Promise<void> => {
  const path = 'system_config';
  try {
    const docRef = doc(db, path, 'google_sheet');
    await setDoc(docRef, {
      ...sheetConfig,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/google_sheet`);
  }
};

