'use server';

import {
  readServerDb,
  writeServerDb,
  ServerBowheer,
  ServerDesignator,
  ServerAlatKerja,
  ServerMaterial,
  ServerVendor,
  ServerWarehouse,
  ServerSystemUser,
} from '@/lib/serverDb';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// =============================================================================
// 1. BOWHEER ACTIONS
// =============================================================================

export async function getBowheersAction(): Promise<{ success: boolean; data: ServerBowheer[]; error?: string }> {
  try {
    // 1. Coba baca dari Supabase jika tabel bowheers sudah ada
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaData, error: supaError } = await supabase
          .from('bowheers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!supaError && supaData && Array.isArray(supaData) && supaData.length > 0) {
          const mapped: ServerBowheer[] = supaData.map((b: any) => ({
            id: b.id,
            code: b.code,
            name: b.name,
            alias: b.alias || '',
            category: b.category || 'Telekomunikasi',
            contactPerson: b.contact_person || '',
            email: b.email || '',
            phone: b.phone || '',
            address: b.address || '',
            status: b.status || 'ACTIVE',
            createdAt: b.created_at || new Date().toISOString(),
          }));
          return { success: true, data: mapped };
        }
      } catch {
        // Fallback ke serverDb
      }
    }

    // 2. Baca dari serverDb lokal
    const db = await readServerDb();
    return { success: true, data: db.bowheers || [] };
  } catch (error: any) {
    console.error('Error in getBowheersAction:', error);
    return { success: false, data: [], error: error?.message || 'Failed to fetch bowheers' };
  }
}

export async function addBowheerAction(
  payload: Omit<ServerBowheer, 'id' | 'createdAt'>
): Promise<{ success: boolean; data?: ServerBowheer; error?: string }> {
  try {
    const newRecord: ServerBowheer = {
      ...payload,
      id: `bwh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    // 1. Simpan di serverDb lokal
    const db = await readServerDb();
    db.bowheers = [newRecord, ...(db.bowheers || [])];
    await writeServerDb(db);

    // 2. Coba sync ke Supabase jika tabel tersedia
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bowheers').insert([
          {
            id: newRecord.id,
            code: newRecord.code,
            name: newRecord.name,
            alias: newRecord.alias,
            category: newRecord.category,
            contact_person: newRecord.contactPerson,
            email: newRecord.email,
            phone: newRecord.phone,
            address: newRecord.address,
            status: newRecord.status,
            created_at: newRecord.createdAt,
          },
        ]);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true, data: newRecord };
  } catch (error: any) {
    console.error('Error in addBowheerAction:', error);
    return { success: false, error: error?.message || 'Failed to add bowheer' };
  }
}

export async function updateBowheerAction(
  id: string,
  payload: Partial<Omit<ServerBowheer, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    let found = false;

    db.bowheers = (db.bowheers || []).map((item) => {
      if (item.id === id) {
        found = true;
        return {
          ...item,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    if (!found) {
      return { success: false, error: 'Bowheer not found' };
    }

    await writeServerDb(db);

    // Sync ke Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const updateObj: any = {};
        if (payload.code !== undefined) updateObj.code = payload.code;
        if (payload.name !== undefined) updateObj.name = payload.name;
        if (payload.alias !== undefined) updateObj.alias = payload.alias;
        if (payload.category !== undefined) updateObj.category = payload.category;
        if (payload.contactPerson !== undefined) updateObj.contact_person = payload.contactPerson;
        if (payload.email !== undefined) updateObj.email = payload.email;
        if (payload.phone !== undefined) updateObj.phone = payload.phone;
        if (payload.address !== undefined) updateObj.address = payload.address;
        if (payload.status !== undefined) updateObj.status = payload.status;
        updateObj.updated_at = new Date().toISOString();

        await supabase.from('bowheers').update(updateObj).eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in updateBowheerAction:', error);
    return { success: false, error: error?.message || 'Failed to update bowheer' };
  }
}

export async function deleteBowheerAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.bowheers = (db.bowheers || []).filter((item) => item.id !== id);
    await writeServerDb(db);

    // Sync ke Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bowheers').delete().eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteBowheerAction:', error);
    return { success: false, error: error?.message || 'Failed to delete bowheer' };
  }
}

// =============================================================================
// 2. DESIGNATOR ACTIONS
// =============================================================================

export async function getDesignatorsAction(): Promise<{ success: boolean; data: ServerDesignator[]; error?: string }> {
  try {
    const db = await readServerDb();
    return { success: true, data: db.designators || [] };
  } catch (error: any) {
    return { success: false, data: [], error: error?.message || 'Failed to fetch designators' };
  }
}

export async function addDesignatorAction(
  payload: Omit<ServerDesignator, 'id'>
): Promise<{ success: boolean; data?: ServerDesignator; error?: string }> {
  try {
    const newRecord: ServerDesignator = {
      ...payload,
      id: `dsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const db = await readServerDb();
    db.designators = [newRecord, ...(db.designators || [])];
    await writeServerDb(db);
    return { success: true, data: newRecord };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to add designator' };
  }
}

export async function updateDesignatorAction(
  id: string,
  payload: Partial<Omit<ServerDesignator, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.designators = (db.designators || []).map((item) =>
      item.id === id ? { ...item, ...payload } : item
    );
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update designator' };
  }
}

export async function deleteDesignatorAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    const target = String(id).trim().toLowerCase();
    db.designators = (db.designators || []).filter((item) => {
      const itemId = String(item.id || '').trim().toLowerCase();
      const itemCode = String(item.code || '').trim().toLowerCase();
      return itemId !== target && itemCode !== target;
    });
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete designator' };
  }
}

// =============================================================================
// 3. ALAT KERJA ACTIONS
// =============================================================================

export async function getAlatKerjaAction(): Promise<{ success: boolean; data: ServerAlatKerja[]; error?: string }> {
  try {
    const db = await readServerDb();
    return { success: true, data: db.alatKerja || [] };
  } catch (error: any) {
    return { success: false, data: [], error: error?.message || 'Failed to fetch alat kerja' };
  }
}

export async function addAlatKerjaAction(
  payload: Omit<ServerAlatKerja, 'id'>
): Promise<{ success: boolean; data?: ServerAlatKerja; error?: string }> {
  try {
    const newRecord: ServerAlatKerja = {
      ...payload,
      id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const db = await readServerDb();
    db.alatKerja = [newRecord, ...(db.alatKerja || [])];
    await writeServerDb(db);
    return { success: true, data: newRecord };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to add alat kerja' };
  }
}

export async function updateAlatKerjaAction(
  id: string,
  payload: Partial<Omit<ServerAlatKerja, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.alatKerja = (db.alatKerja || []).map((item) =>
      item.id === id ? { ...item, ...payload } : item
    );
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update alat kerja' };
  }
}

export async function deleteAlatKerjaAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.alatKerja = (db.alatKerja || []).filter((item) => item.id !== id);
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete alat kerja' };
  }
}

// =============================================================================
// 4. MATERIALS ACTIONS
// =============================================================================

export async function getMaterialsAction(): Promise<{ success: boolean; data: ServerMaterial[]; error?: string }> {
  try {
    const db = await readServerDb();
    return { success: true, data: db.materials || [] };
  } catch (error: any) {
    return { success: false, data: [], error: error?.message || 'Failed to fetch materials' };
  }
}

export async function addMaterialAction(
  payload: Omit<ServerMaterial, 'id'>
): Promise<{ success: boolean; data?: ServerMaterial; error?: string }> {
  try {
    const newRecord: ServerMaterial = {
      ...payload,
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const db = await readServerDb();
    db.materials = [newRecord, ...(db.materials || [])];
    await writeServerDb(db);
    return { success: true, data: newRecord };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to add material' };
  }
}

export async function updateMaterialAction(
  id: string,
  payload: Partial<Omit<ServerMaterial, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.materials = (db.materials || []).map((item) =>
      item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item
    );
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update material' };
  }
}

export async function deleteMaterialAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.materials = (db.materials || []).filter((item) => item.id !== id);
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete material' };
  }
}

// =============================================================================
// 5. VENDORS ACTIONS
// =============================================================================

export async function getVendorsAction(): Promise<{ success: boolean; data: ServerVendor[]; error?: string }> {
  try {
    const db = await readServerDb();
    return { success: true, data: db.vendors || [] };
  } catch (error: any) {
    return { success: false, data: [], error: error?.message || 'Failed to fetch vendors' };
  }
}

export async function addVendorAction(
  payload: Omit<ServerVendor, 'id'>
): Promise<{ success: boolean; data?: ServerVendor; error?: string }> {
  try {
    const newRecord: ServerVendor = {
      ...payload,
      id: `vnd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const db = await readServerDb();
    db.vendors = [newRecord, ...(db.vendors || [])];
    await writeServerDb(db);
    return { success: true, data: newRecord };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to add vendor' };
  }
}

export async function updateVendorAction(
  id: string,
  payload: Partial<Omit<ServerVendor, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.vendors = (db.vendors || []).map((item) =>
      item.id === id ? { ...item, ...payload } : item
    );
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update vendor' };
  }
}

export async function deleteVendorAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.vendors = (db.vendors || []).filter((item) => item.id !== id);
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete vendor' };
  }
}

// =============================================================================
// 6. WAREHOUSES ACTIONS
// =============================================================================

export async function getWarehousesAction(): Promise<{ success: boolean; data: ServerWarehouse[]; error?: string }> {
  try {
    const db = await readServerDb();
    return { success: true, data: db.warehouses || [] };
  } catch (error: any) {
    return { success: false, data: [], error: error?.message || 'Failed to fetch warehouses' };
  }
}

export async function addWarehouseAction(
  payload: Omit<ServerWarehouse, 'id'>
): Promise<{ success: boolean; data?: ServerWarehouse; error?: string }> {
  try {
    const newRecord: ServerWarehouse = {
      ...payload,
      id: `wh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const db = await readServerDb();
    db.warehouses = [newRecord, ...(db.warehouses || [])];
    await writeServerDb(db);
    return { success: true, data: newRecord };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to add warehouse' };
  }
}

export async function updateWarehouseAction(
  id: string,
  payload: Partial<Omit<ServerWarehouse, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.warehouses = (db.warehouses || []).map((item) =>
      item.id === id ? { ...item, ...payload } : item
    );
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update warehouse' };
  }
}

export async function deleteWarehouseAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.warehouses = (db.warehouses || []).filter((item) => item.id !== id);
    await writeServerDb(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete warehouse' };
  }
}

// =============================================================================
// 7. SYSTEM USERS ACTIONS
// =============================================================================

export async function getUsersAction(): Promise<{ success: boolean; data: ServerSystemUser[]; error?: string }> {
  try {
    const db = await readServerDb();
    let usersList: ServerSystemUser[] = db.systemUsers || [];

    // Jika Supabase aktif, lakukan sinkronisasi dua arah
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaUsers, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && Array.isArray(supaUsers) && supaUsers.length > 0) {
          // Buat map user berdasarkan username
          const userMap = new Map<string, ServerSystemUser>();
          usersList.forEach((u) => userMap.set(u.username.toLowerCase(), u));

          for (const su of supaUsers) {
            const key = (su.username || '').toLowerCase();
            if (!key) continue;

            if (!userMap.has(key)) {
              // User ada di Supabase tapi belum di local db.json -> tambahkan
              const newUser: ServerSystemUser = {
                id: su.id,
                username: su.username,
                fullName: su.name || su.username,
                password: su.password || 'admin123',
                role: su.role || 'ADMIN',
                status: su.status || 'ACTIVE',
                email: su.email || `${su.username}@mai.co.id`,
                createdAt: su.created_at || new Date().toISOString(),
              };
              usersList.push(newUser);
              userMap.set(key, newUser);
            } else {
              // Sinkronkan password & nama dari Supabase jika ada
              const existing = userMap.get(key)!;
              if (su.password && su.password !== existing.password) {
                existing.password = su.password;
              }
              if (su.name && su.name !== existing.fullName) {
                existing.fullName = su.name;
              }
              if (su.role) existing.role = su.role;
              if (su.status) existing.status = su.status;
            }
          }

          db.systemUsers = usersList;
          await writeServerDb(db);
        }
      } catch (err) {
        console.warn('Supabase sync users notice:', err);
      }
    }

    return { success: true, data: usersList };
  } catch (error: any) {
    console.error('Error in getUsersAction:', error);
    return { success: false, data: [], error: error?.message || 'Failed to fetch users' };
  }
}

export async function saveUserAction(
  userPayload: Omit<ServerSystemUser, 'createdAt' | 'id'> & { id?: string; createdAt?: string }
): Promise<{ success: boolean; data?: ServerSystemUser; error?: string }> {
  try {
    const db = await readServerDb();
    let usersList = db.systemUsers || [];

    const cleanUsername = userPayload.username.trim().toLowerCase();
    const cleanFullName = userPayload.fullName.trim();
    const cleanPassword = userPayload.password.trim();

    // Cek duplikat username pada user lain
    const duplicate = usersList.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.id !== userPayload.id
    );
    if (duplicate) {
      return { success: false, error: `Username "${cleanUsername}" sudah digunakan oleh user lain.` };
    }

    let savedUser: ServerSystemUser;
    const existingIndex = usersList.findIndex((u) => u.id === userPayload.id || u.username.toLowerCase() === cleanUsername);

    if (existingIndex >= 0) {
      // Update
      savedUser = {
        ...usersList[existingIndex],
        ...userPayload,
        username: cleanUsername,
        fullName: cleanFullName,
        password: cleanPassword,
        email: userPayload.email || `${cleanUsername}@mai.co.id`,
        updatedAt: new Date().toISOString(),
      };
      usersList[existingIndex] = savedUser;
    } else {
      // Create
      savedUser = {
        id: userPayload.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        username: cleanUsername,
        fullName: cleanFullName,
        password: cleanPassword,
        role: userPayload.role,
        status: userPayload.status || 'ACTIVE',
        email: userPayload.email || `${cleanUsername}@mai.co.id`,
        createdAt: userPayload.createdAt || new Date().toISOString(),
      };
      usersList = [savedUser, ...usersList];
    }

    db.systemUsers = usersList;
    await writeServerDb(db);

    // Sync ke Supabase tabel users
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaMatch } = await supabase
          .from('users')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (supaMatch) {
          await supabase
            .from('users')
            .update({
              name: cleanFullName,
              password: cleanPassword,
              role: savedUser.role,
              status: savedUser.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', supaMatch.id);
        } else {
          await supabase.from('users').insert([
            {
              username: cleanUsername,
              name: cleanFullName,
              password: cleanPassword,
              role: savedUser.role,
              status: savedUser.status,
              created_at: savedUser.createdAt,
            },
          ]);
        }
      } catch (supaErr) {
        console.warn('Sync user to Supabase error:', supaErr);
      }
    }

    return { success: true, data: savedUser };
  } catch (error: any) {
    console.error('Error in saveUserAction:', error);
    return { success: false, error: error?.message || 'Failed to save user' };
  }
}

export async function deleteUserAction(
  id: string,
  username?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    const userToDelete = (db.systemUsers || []).find((u) => u.id === id || (username && u.username === username));
    const targetUsername = userToDelete?.username || username;

    db.systemUsers = (db.systemUsers || []).filter((u) => u.id !== id && (!targetUsername || u.username !== targetUsername));
    await writeServerDb(db);

    // Hapus dari Supabase jika ada
    if (isSupabaseConfigured && supabase && targetUsername) {
      try {
        await supabase.from('users').delete().eq('username', targetUsername);
      } catch (supaErr) {
        console.warn('Supabase delete user notice:', supaErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteUserAction:', error);
    return { success: false, error: error?.message || 'Failed to delete user' };
  }
}

export async function authenticateUserAction(
  identifier: string,
  passwordInput: string
): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    phone?: string;
  };
  error?: string;
}> {
  try {
    const cleanId = identifier.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    if (!cleanId || !trimmedPass) {
      return { success: false, error: 'Username/Email dan Password wajib diisi.' };
    }

    // 1. Cek di Server Database (db.json)
    const db = await readServerDb();
    const foundLocal = (db.systemUsers || []).find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        (u.email && u.email.toLowerCase() === cleanId) ||
        `${u.username.toLowerCase()}@mai.co.id` === cleanId
    );

    if (foundLocal) {
      if (foundLocal.status === 'INACTIVE') {
        return { success: false, error: 'Akun Anda dinonaktifkan. Silakan hubungi Administrator.' };
      }
      if (foundLocal.password === trimmedPass) {
        return {
          success: true,
          user: {
            id: foundLocal.id,
            email: foundLocal.email || `${foundLocal.username}@mai.co.id`,
            name: foundLocal.fullName,
            role: foundLocal.role,
            phone: foundLocal.phone,
            avatar: foundLocal.avatar,
          },
        };
      } else {
        return { success: false, error: 'Password yang dimasukkan salah.' };
      }
    }

    // 2. Cek di Supabase jika belum ketemu di local db
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaUser, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.ilike.${cleanId},email.ilike.${cleanId}`)
          .maybeSingle();

        if (!error && supaUser) {
          if (supaUser.status === 'INACTIVE') {
            return { success: false, error: 'Akun Anda dinonaktifkan. Silakan hubungi Administrator.' };
          }
          if (supaUser.password === trimmedPass) {
            // Simpan juga ke local db agar berikutnya cepat
            const syncUser: ServerSystemUser = {
              id: supaUser.id,
              username: supaUser.username,
              fullName: supaUser.name || supaUser.username,
              password: supaUser.password,
              role: supaUser.role || 'ADMIN',
              status: supaUser.status || 'ACTIVE',
              email: supaUser.email || `${supaUser.username}@mai.co.id`,
              createdAt: supaUser.created_at || new Date().toISOString(),
            };
            db.systemUsers = [syncUser, ...(db.systemUsers || [])];
            await writeServerDb(db);

            return {
              success: true,
              user: {
                id: supaUser.id,
                email: supaUser.email || `${supaUser.username}@mai.co.id`,
                name: supaUser.name || supaUser.username,
                role: supaUser.role || 'ADMIN',
                phone: supaUser.phone,
                avatar: supaUser.avatar,
              },
            };
          } else {
            return { success: false, error: 'Password yang dimasukkan salah.' };
          }
        }
      } catch (err) {
        console.warn('Supabase auth notice in server action:', err);
      }
    }

    return { success: false, error: 'Akun tidak ditemukan. Periksa kembali username/email Anda.' };
  } catch (error: any) {
    console.error('Error in authenticateUserAction:', error);
    return { success: false, error: error?.message || 'Gagal memverifikasi akun.' };
  }
}

// =============================================================================
// BATCH IMPORT ACTIONS
// =============================================================================

export async function batchAddDesignatorsAction(
  items: Omit<ServerDesignator, 'id'>[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!items || items.length === 0) return { success: true, count: 0 };
    const db = await readServerDb();
    const existing = db.designators || [];
    const newRecords: ServerDesignator[] = items.map((item, idx) => ({
      ...item,
      id: `dsg-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }));
    db.designators = [...newRecords, ...existing];
    await writeServerDb(db);
    return { success: true, count: newRecords.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed batch add designators' };
  }
}

export async function batchAddBowheersAction(
  items: Omit<ServerBowheer, 'id' | 'createdAt'>[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!items || items.length === 0) return { success: true, count: 0 };
    const db = await readServerDb();
    const existing = db.bowheers || [];
    const newRecords: ServerBowheer[] = items.map((item, idx) => ({
      ...item,
      id: `bwh-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }));
    db.bowheers = [...newRecords, ...existing];
    await writeServerDb(db);
    return { success: true, count: newRecords.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed batch add bowheers' };
  }
}

export async function batchAddAlatKerjaAction(
  items: Omit<ServerAlatKerja, 'id'>[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!items || items.length === 0) return { success: true, count: 0 };
    const db = await readServerDb();
    const existing = db.alatKerja || [];
    const newRecords: ServerAlatKerja[] = items.map((item, idx) => ({
      ...item,
      id: `alt-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }));
    db.alatKerja = [...newRecords, ...existing];
    await writeServerDb(db);
    return { success: true, count: newRecords.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed batch add alat kerja' };
  }
}

export async function batchAddMaterialsAction(
  items: Omit<ServerMaterial, 'id'>[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!items || items.length === 0) return { success: true, count: 0 };
    const db = await readServerDb();
    const existing = db.materials || [];
    const newRecords: ServerMaterial[] = items.map((item, idx) => ({
      ...item,
      id: `mat-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }));
    db.materials = [...newRecords, ...existing];
    await writeServerDb(db);
    return { success: true, count: newRecords.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed batch add materials' };
  }
}

export async function batchAddVendorsAction(
  items: Omit<ServerVendor, 'id'>[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!items || items.length === 0) return { success: true, count: 0 };
    const db = await readServerDb();
    const existing = db.vendors || [];
    const newRecords: ServerVendor[] = items.map((item, idx) => ({
      ...item,
      id: `vnd-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }));
    db.vendors = [...newRecords, ...existing];
    await writeServerDb(db);
    return { success: true, count: newRecords.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed batch add vendors' };
  }
}

export async function batchAddWarehousesAction(
  items: Omit<ServerWarehouse, 'id'>[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!items || items.length === 0) return { success: true, count: 0 };
    const db = await readServerDb();
    const existing = db.warehouses || [];
    const newRecords: ServerWarehouse[] = items.map((item, idx) => ({
      ...item,
      id: `wh-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }));
    db.warehouses = [...newRecords, ...existing];
    await writeServerDb(db);
    return { success: true, count: newRecords.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed batch add warehouses' };
  }
}

export async function batchAddUsersAction(
  items: (Omit<ServerSystemUser, 'id' | 'createdAt'> & { id?: string })[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!items || items.length === 0) return { success: true, count: 0 };
    const db = await readServerDb();
    const existing = db.systemUsers || [];
    const newRecords: ServerSystemUser[] = [];

    for (let i = 0; i < items.length; i++) {
      const u = items[i];
      const username = (u.username || '').trim().toLowerCase();
      if (!username) continue;
      // Jangan timpa jika username sudah ada
      if (existing.some((e) => e.username.toLowerCase() === username)) continue;

      newRecords.push({
        id: u.id || `usr-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        username,
        fullName: u.fullName || username,
        password: u.password || 'admin123',
        role: u.role || 'GUEST',
        status: u.status || 'ACTIVE',
        email: u.email || `${username}@mai.co.id`,
        createdAt: new Date().toISOString(),
      });
    }

    db.systemUsers = [...newRecords, ...existing];
    await writeServerDb(db);
    return { success: true, count: newRecords.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed batch add users' };
  }
}


