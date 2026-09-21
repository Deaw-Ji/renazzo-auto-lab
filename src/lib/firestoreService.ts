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
import { CarWashRecord, Branch, Employee } from '../types';

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

// Batch seed records if Firestore collection is empty
export const seedRecordsToFirestoreIfEmpty = async (initialRecords: CarWashRecord[]): Promise<boolean> => {
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

// Subscribe to Master Branches
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

// Save Branch
export const saveBranchToFirestore = async (branch: Branch): Promise<void> => {
  const path = 'master_branches';
  try {
    const docRef = doc(db, path, branch.id);
    await setDoc(docRef, branch, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${branch.id}`);
  }
};

// Delete Branch
export const deleteBranchFromFirestore = async (branchId: string): Promise<void> => {
  const path = 'master_branches';
  try {
    const docRef = doc(db, path, branchId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${branchId}`);
  }
};

// Subscribe to Master Staff
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

// Save Staff
export const saveStaffToFirestore = async (staffMember: Employee): Promise<void> => {
  const path = 'master_staff';
  try {
    const docRef = doc(db, path, staffMember.id);
    await setDoc(docRef, staffMember, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${staffMember.id}`);
  }
};

// Delete Staff
export const deleteStaffFromFirestore = async (staffId: string): Promise<void> => {
  const path = 'master_staff';
  try {
    const docRef = doc(db, path, staffId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${staffId}`);
  }
};

// Subscribe to Shared Google Sheet Config
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

// Save Shared Google Sheet Config
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

