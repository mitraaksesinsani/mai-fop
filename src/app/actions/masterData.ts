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
  ServerMandor,
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

        if (!supaError && supaData && Array.isArray(supaData)) {
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

export async function batchDeleteBowheersAction(ids: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true, count: 0 };
    const idSet = new Set(ids);
    const db = await readServerDb();
    const initialCount = (db.bowheers || []).length;
    db.bowheers = (db.bowheers || []).filter((item) => !idSet.has(item.id));
    const deletedCount = initialCount - db.bowheers.length;
    await writeServerDb(db);

    // Sync ke Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bowheers').delete().in('id', ids);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true, count: deletedCount };
  } catch (error: any) {
    console.error('Error in batchDeleteBowheersAction:', error);
    return { success: false, count: 0, error: error?.message || 'Failed to delete bowheers' };
  }
}

// =============================================================================
// 2. DESIGNATOR ACTIONS
// =============================================================================

export async function getDesignatorsAction(): Promise<{ success: boolean; data: ServerDesignator[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaData, error: supaError } = await supabase
          .from('designators')
          .select('*')
          .order('code', { ascending: true });

        if (!supaError && supaData && Array.isArray(supaData)) {
          const mapped: ServerDesignator[] = supaData.map((d: any) => ({
            id: d.id,
            code: d.code,
            description: d.description || '',
            type: d.type || '',
            unit: d.unit || '',
            createdAt: d.created_at || new Date().toISOString(),
          }));
          return { success: true, data: mapped };
        }
      } catch {
        // Fallback ke serverDb
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('designators').insert([
          {
            id: newRecord.id,
            code: newRecord.code,
            description: newRecord.description,
            type: newRecord.type,
            unit: newRecord.unit,
            created_at: newRecord.createdAt,
          },
        ]);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        const updateObj: any = { updated_at: new Date().toISOString() };
        if (payload.code !== undefined) updateObj.code = payload.code;
        if (payload.description !== undefined) updateObj.description = payload.description;
        if (payload.type !== undefined) updateObj.type = payload.type;
        if (payload.unit !== undefined) updateObj.unit = payload.unit;
        await supabase.from('designators').update(updateObj).eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('designators').delete().or(`id.eq.${id},code.eq.${id}`);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete designator' };
  }
}

export async function batchDeleteDesignatorsAction(ids: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true, count: 0 };
    const idSet = new Set(ids.map((x) => String(x).trim().toLowerCase()));
    const db = await readServerDb();
    const initialCount = (db.designators || []).length;
    db.designators = (db.designators || []).filter((item) => {
      const itemId = String(item.id || '').trim().toLowerCase();
      const itemCode = String(item.code || '').trim().toLowerCase();
      return !idSet.has(itemId) && !idSet.has(itemCode);
    });
    const deletedCount = initialCount - db.designators.length;
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('designators').delete().in('id', ids);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true, count: deletedCount };
  } catch (error: any) {
    return { success: false, count: 0, error: error?.message || 'Failed to delete designators' };
  }
}

// =============================================================================
// 3. ALAT KERJA ACTIONS
// =============================================================================

export async function getAlatKerjaAction(): Promise<{ success: boolean; data: ServerAlatKerja[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaData, error: supaError } = await supabase
          .from('alat_kerja')
          .select('*')
          .order('code', { ascending: true });

        if (!supaError && supaData && Array.isArray(supaData)) {
          const mapped: ServerAlatKerja[] = supaData.map((a: any) => ({
            id: a.id,
            code: a.code,
            name: a.name,
            category: a.category || '',
            createdAt: a.created_at || new Date().toISOString(),
          }));
          return { success: true, data: mapped };
        }
      } catch {
        // Fallback ke serverDb
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('alat_kerja').insert([
          {
            id: newRecord.id,
            code: newRecord.code,
            name: newRecord.name,
            category: newRecord.category,
            created_at: newRecord.createdAt,
          },
        ]);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        const updateObj: any = { updated_at: new Date().toISOString() };
        if (payload.code !== undefined) updateObj.code = payload.code;
        if (payload.name !== undefined) updateObj.name = payload.name;
        if (payload.category !== undefined) updateObj.category = payload.category;
        await supabase.from('alat_kerja').update(updateObj).eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('alat_kerja').delete().eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete alat kerja' };
  }
}

export async function batchDeleteAlatKerjaAction(ids: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true, count: 0 };
    const idSet = new Set(ids);
    const db = await readServerDb();
    const initialCount = (db.alatKerja || []).length;
    db.alatKerja = (db.alatKerja || []).filter((item) => !idSet.has(item.id));
    const deletedCount = initialCount - db.alatKerja.length;
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('alat_kerja').delete().in('id', ids);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true, count: deletedCount };
  } catch (error: any) {
    return { success: false, count: 0, error: error?.message || 'Failed to delete alat kerja' };
  }
}

// =============================================================================
// 4. MATERIALS ACTIONS
// =============================================================================

export async function getMaterialsAction(): Promise<{ success: boolean; data: ServerMaterial[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaData, error: supaError } = await supabase
          .from('material_masters')
          .select('*')
          .order('material_name', { ascending: true });

        if (!supaError && supaData && Array.isArray(supaData)) {
          const mapped: ServerMaterial[] = supaData.map((m: any) => ({
            id: m.id,
            materialCode: m.material_code || m.code || '',
            materialName: m.material_name || m.name || '',
            category: m.category || 'OSP',
            specification: m.specification || '',
            unit: m.unit || 'unit',
            minimumStock: m.minimum_stock ?? 0,
            unitPrice: Number(m.unit_price || m.price || 0),
            price: Number(m.unit_price || m.price || 0),
            isActive: m.is_active ?? true,
            createdAt: m.created_at || new Date().toISOString(),
          }));
          return { success: true, data: mapped };
        }
      } catch {
        // Fallback ke serverDb jika Supabase tidak dapat diakses
      }
    }

    const db = await readServerDb();
    const sourceList = Array.isArray(db.materials) ? db.materials : [];

    const mapped: ServerMaterial[] = sourceList.map((m: any) => ({
      ...m,
      unitPrice: Number(m.unitPrice ?? m.price ?? 0),
      price: Number(m.price ?? m.unitPrice ?? 0),
    }));

    return { success: true, data: mapped };
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('material_masters').insert([
          {
            id: newRecord.id,
            material_code: newRecord.materialCode,
            material_name: newRecord.materialName,
            category: newRecord.category,
            specification: newRecord.specification || '',
            unit: newRecord.unit,
            unit_price: newRecord.unitPrice ?? newRecord.price ?? 0,
            minimum_stock: newRecord.minimumStock ?? 0,
            is_active: newRecord.isActive !== false,
            created_at: newRecord.createdAt,
          },
        ]);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        const updateObj: any = { updated_at: new Date().toISOString() };
        if (payload.materialCode !== undefined) updateObj.material_code = payload.materialCode;
        if (payload.materialName !== undefined) updateObj.material_name = payload.materialName;
        if (payload.category !== undefined) updateObj.category = payload.category;
        if (payload.specification !== undefined) updateObj.specification = payload.specification;
        if (payload.unit !== undefined) updateObj.unit = payload.unit;
        if (payload.unitPrice !== undefined || payload.price !== undefined) {
          updateObj.unit_price = payload.unitPrice ?? payload.price;
        }
        if (payload.minimumStock !== undefined) updateObj.minimum_stock = payload.minimumStock;
        if (payload.isActive !== undefined) updateObj.is_active = payload.isActive;
        await supabase.from('material_masters').update(updateObj).eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update material' };
  }
}

export async function deleteMaterialAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const target = String(id).trim().toLowerCase();
    const db = await readServerDb();
    db.materials = (db.materials || []).filter((item) => {
      const itemId = String(item.id || '').trim().toLowerCase();
      const code = String(item.materialCode || '').trim().toLowerCase();
      return itemId !== target && code !== target;
    });
    if (db.materialMasters) {
      db.materialMasters = db.materialMasters.filter((item: any) => {
        const itemId = String(item.id || '').trim().toLowerCase();
        const code = String(item.materialCode || '').trim().toLowerCase();
        return itemId !== target && code !== target;
      });
    }
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: supaErr } = await supabase
          .from('material_masters')
          .delete()
          .or(`id.eq.${id},material_code.eq.${id}`);
        if (supaErr) {
          console.error('Supabase delete material error:', supaErr);
        }
      } catch (err) {
        console.error('Supabase delete material exception:', err);
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete material' };
  }
}

export async function batchDeleteMaterialsAction(ids: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true, count: 0 };
    const idSet = new Set(ids.map((x) => String(x).trim().toLowerCase()));
    const db = await readServerDb();
    const initialCount = (db.materials || []).length;
    db.materials = (db.materials || []).filter((item) => {
      const itemId = String(item.id || '').trim().toLowerCase();
      const code = String(item.materialCode || '').trim().toLowerCase();
      return !idSet.has(itemId) && !idSet.has(code);
    });
    if (db.materialMasters) {
      db.materialMasters = db.materialMasters.filter((item: any) => {
        const itemId = String(item.id || '').trim().toLowerCase();
        const code = String(item.materialCode || '').trim().toLowerCase();
        return !idSet.has(itemId) && !idSet.has(code);
      });
    }
    const deletedCount = initialCount - db.materials.length;
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: err1 } = await supabase.from('material_masters').delete().in('id', ids);
        const { error: err2 } = await supabase.from('material_masters').delete().in('material_code', ids);
        if (err1 || err2) {
          console.error('Supabase batch delete materials notice:', err1 || err2);
        }
      } catch (err) {
        console.error('Supabase batch delete materials exception:', err);
      }
    }

    return { success: true, count: deletedCount };
  } catch (error: any) {
    return { success: false, count: 0, error: error?.message || 'Failed to delete materials' };
  }
}

// =============================================================================
// 5. VENDORS ACTIONS
// =============================================================================

export async function getVendorsAction(): Promise<{ success: boolean; data: ServerVendor[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaData, error: supaError } = await supabase
          .from('vendors')
          .select('*')
          .order('name', { ascending: true });

        if (!supaError && supaData && Array.isArray(supaData)) {
          const mapped: ServerVendor[] = supaData.map((v: any) => ({
            id: v.id,
            code: v.code,
            name: v.name,
            category: v.category || '',
            contactPerson: v.contact_person || '',
            phone: v.phone || '',
            email: v.email || '',
            address: v.address || '',
            status: v.status || 'ACTIVE',
            createdAt: v.created_at || new Date().toISOString(),
          }));
          return { success: true, data: mapped };
        }
      } catch {
        // Fallback ke serverDb
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('vendors').insert([
          {
            id: newRecord.id,
            code: newRecord.code,
            name: newRecord.name,
            category: newRecord.category,
            contact_person: newRecord.contactPerson,
            phone: newRecord.phone,
            email: newRecord.email,
            address: newRecord.address,
            status: newRecord.status || 'ACTIVE',
            created_at: newRecord.createdAt,
          },
        ]);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        const updateObj: any = { updated_at: new Date().toISOString() };
        if (payload.code !== undefined) updateObj.code = payload.code;
        if (payload.name !== undefined) updateObj.name = payload.name;
        if (payload.category !== undefined) updateObj.category = payload.category;
        if (payload.contactPerson !== undefined) updateObj.contact_person = payload.contactPerson;
        if (payload.phone !== undefined) updateObj.phone = payload.phone;
        if (payload.email !== undefined) updateObj.email = payload.email;
        if (payload.address !== undefined) updateObj.address = payload.address;
        if (payload.status !== undefined) updateObj.status = payload.status;
        await supabase.from('vendors').update(updateObj).eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('vendors').delete().or(`id.eq.${id},code.eq.${id}`);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete vendor' };
  }
}

export async function batchDeleteVendorsAction(ids: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true, count: 0 };
    const idSet = new Set(ids.map((x) => String(x).trim().toLowerCase()));
    const db = await readServerDb();
    const initialCount = (db.vendors || []).length;
    db.vendors = (db.vendors || []).filter((item) => {
      const itemId = String(item.id || '').trim().toLowerCase();
      const code = String(item.code || '').trim().toLowerCase();
      return !idSet.has(itemId) && !idSet.has(code);
    });
    const deletedCount = initialCount - db.vendors.length;
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('vendors').delete().in('id', ids);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true, count: deletedCount };
  } catch (error: any) {
    return { success: false, count: 0, error: error?.message || 'Failed to delete vendors' };
  }
}

// =============================================================================
// 6. WAREHOUSES ACTIONS
// =============================================================================

export async function getWarehousesAction(): Promise<{ success: boolean; data: ServerWarehouse[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaData, error: supaError } = await supabase
          .from('warehouses')
          .select('*')
          .order('name', { ascending: true });

        if (!supaError && supaData && Array.isArray(supaData)) {
          const mapped: ServerWarehouse[] = supaData.map((w: any) => ({
            id: w.id,
            code: w.code,
            name: w.name,
            location: w.location || '',
            address: w.address || '',
            pic: w.pic || '',
            contact: w.contact || '',
            capacity: w.capacity ? Number(w.capacity) : undefined,
            type: w.type || '',
            status: w.status || 'ACTIVE',
            createdAt: w.created_at || new Date().toISOString(),
          }));
          return { success: true, data: mapped };
        }
      } catch {
        // Fallback ke serverDb
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('warehouses').insert([
          {
            id: newRecord.id,
            code: newRecord.code,
            name: newRecord.name,
            location: newRecord.location,
            address: newRecord.address,
            pic: newRecord.pic,
            contact: newRecord.contact,
            capacity: newRecord.capacity ? Number(newRecord.capacity) : null,
            type: newRecord.type,
            status: newRecord.status || 'ACTIVE',
            created_at: newRecord.createdAt,
          },
        ]);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        const updateObj: any = { updated_at: new Date().toISOString() };
        if (payload.code !== undefined) updateObj.code = payload.code;
        if (payload.name !== undefined) updateObj.name = payload.name;
        if (payload.location !== undefined) updateObj.location = payload.location;
        if (payload.address !== undefined) updateObj.address = payload.address;
        if (payload.pic !== undefined) updateObj.pic = payload.pic;
        if (payload.contact !== undefined) updateObj.contact = payload.contact;
        if (payload.capacity !== undefined) updateObj.capacity = payload.capacity ? Number(payload.capacity) : null;
        if (payload.type !== undefined) updateObj.type = payload.type;
        if (payload.status !== undefined) updateObj.status = payload.status;
        await supabase.from('warehouses').update(updateObj).eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('warehouses').delete().or(`id.eq.${id},code.eq.${id}`);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete warehouse' };
  }
}

export async function batchDeleteWarehousesAction(ids: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true, count: 0 };
    const idSet = new Set(ids.map((x) => String(x).trim().toLowerCase()));
    const db = await readServerDb();
    const initialCount = (db.warehouses || []).length;
    db.warehouses = (db.warehouses || []).filter((item) => {
      const itemId = String(item.id || '').trim().toLowerCase();
      const code = String(item.code || '').trim().toLowerCase();
      return !idSet.has(itemId) && !idSet.has(code);
    });
    const deletedCount = initialCount - db.warehouses.length;
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('warehouses').delete().in('id', ids);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true, count: deletedCount };
  } catch (error: any) {
    return { success: false, count: 0, error: error?.message || 'Failed to delete warehouses' };
  }
}

// =============================================================================
// 7. SYSTEM USERS ACTIONS
// =============================================================================

export async function getUsersAction(): Promise<{ success: boolean; data: ServerSystemUser[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaUsers, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && Array.isArray(supaUsers)) {
          const mappedUsers: ServerSystemUser[] = supaUsers.map((su) => ({
            id: su.id,
            username: su.username,
            fullName: su.name || su.username,
            password: su.password || 'admin123',
            role: su.role || 'ADMIN',
            status: su.status || 'ACTIVE',
            email: su.email || `${su.username}@mai.co.id`,
            createdAt: su.created_at || new Date().toISOString(),
          }));
          return { success: true, data: mappedUsers };
        }
      } catch (err) {
        console.warn('Supabase fetch users notice, falling back to local db:', err);
      }
    }

    const db = await readServerDb();
    const usersList: ServerSystemUser[] = db.systemUsers || [];
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

export async function batchDeleteUsersAction(
  usersToDelete: Array<{ id: string; username?: string }>
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!usersToDelete || usersToDelete.length === 0) return { success: true, count: 0 };
    const idSet = new Set(usersToDelete.map((u) => u.id));
    const usernameSet = new Set(
      usersToDelete
        .map((u) => (u.username || '').toLowerCase())
        .filter(Boolean)
    );

    const db = await readServerDb();
    const initialCount = (db.systemUsers || []).length;
    db.systemUsers = (db.systemUsers || []).filter((u) => {
      const matchId = idSet.has(u.id);
      const matchUsername = u.username && usernameSet.has(u.username.toLowerCase());
      return !matchId && !matchUsername;
    });
    const deletedCount = initialCount - db.systemUsers.length;
    await writeServerDb(db);

    // Hapus dari Supabase jika ada
    if (isSupabaseConfigured && supabase && usernameSet.size > 0) {
      try {
        await supabase.from('users').delete().in('username', Array.from(usernameSet));
      } catch (supaErr) {
        console.warn('Supabase batch delete user notice:', supaErr);
      }
    }

    return { success: true, count: deletedCount };
  } catch (error: any) {
    console.error('Error in batchDeleteUsersAction:', error);
    return { success: false, count: 0, error: error?.message || 'Failed to delete users' };
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

// =============================================================================
// 8. MANDOR (TENAGA KERJA) ACTIONS
// =============================================================================

export async function getMandorsAction(): Promise<{ success: boolean; data: ServerMandor[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaData, error: supaError } = await supabase
          .from('mandors')
          .select('*')
          .order('code', { ascending: true });

        if (!supaError && supaData && Array.isArray(supaData) && supaData.length > 0) {
          const mapped: ServerMandor[] = supaData.map((m: any) => ({
            id: m.id,
            code: m.code,
            name: m.name,
            phone: m.phone || '',
            specialization: m.specialization || '',
            teamSize: m.team_size !== undefined ? Number(m.team_size) : 8,
            status: m.status || 'ACTIVE',
            notes: m.notes || '',
            createdAt: m.created_at || new Date().toISOString(),
            updatedAt: m.updated_at,
          }));
          return { success: true, data: mapped };
        }
      } catch {
        // Fallback ke serverDb
      }
    }

    const db = await readServerDb();
    return { success: true, data: db.mandors || [] };
  } catch (error: any) {
    console.error('Error in getMandorsAction:', error);
    return { success: false, data: [], error: error?.message || 'Failed to fetch mandors' };
  }
}

export async function addMandorAction(
  payload: Omit<ServerMandor, 'id' | 'createdAt'>
): Promise<{ success: boolean; data?: ServerMandor; error?: string }> {
  try {
    const newRecord: ServerMandor = {
      ...payload,
      id: `mdr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const db = await readServerDb();
    db.mandors = [newRecord, ...(db.mandors || [])];
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('mandors').insert([
          {
            id: newRecord.id,
            code: newRecord.code,
            name: newRecord.name,
            phone: newRecord.phone,
            specialization: newRecord.specialization,
            team_size: newRecord.teamSize,
            status: newRecord.status,
            notes: newRecord.notes,
            created_at: newRecord.createdAt,
          },
        ]);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true, data: newRecord };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to add mandor' };
  }
}

export async function updateMandorAction(
  id: string,
  payload: Partial<Omit<ServerMandor, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.mandors = (db.mandors || []).map((item) =>
      item.id === id ? { ...item, ...payload, updatedAt: new Date().toISOString() } : item
    );
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        const updateObj: any = { updated_at: new Date().toISOString() };
        if (payload.code !== undefined) updateObj.code = payload.code;
        if (payload.name !== undefined) updateObj.name = payload.name;
        if (payload.phone !== undefined) updateObj.phone = payload.phone;
        if (payload.specialization !== undefined) updateObj.specialization = payload.specialization;
        if (payload.teamSize !== undefined) updateObj.team_size = payload.teamSize;
        if (payload.status !== undefined) updateObj.status = payload.status;
        if (payload.notes !== undefined) updateObj.notes = payload.notes;
        await supabase.from('mandors').update(updateObj).eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update mandor' };
  }
}

export async function deleteMandorAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await readServerDb();
    db.mandors = (db.mandors || []).filter((item) => item.id !== id);
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('mandors').delete().eq('id', id);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete mandor' };
  }
}

export async function batchDeleteMandorsAction(
  ids: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!ids || ids.length === 0) return { success: true, count: 0 };
    const idSet = new Set(ids);
    const db = await readServerDb();
    const initialCount = (db.mandors || []).length;
    db.mandors = (db.mandors || []).filter((item) => !idSet.has(item.id));
    const deletedCount = initialCount - db.mandors.length;
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('mandors').delete().in('id', ids);
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true, count: deletedCount };
  } catch (error: any) {
    return { success: false, count: 0, error: error?.message || 'Failed to batch delete mandors' };
  }
}

export async function batchAddMandorsAction(
  items: (Omit<ServerMandor, 'id' | 'createdAt'> & { id?: string })[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!items || items.length === 0) return { success: true, count: 0 };
    const db = await readServerDb();
    const existing = db.mandors || [];
    const newRecords: ServerMandor[] = [];

    for (let i = 0; i < items.length; i++) {
      const m = items[i];
      const code = (m.code || '').trim().toUpperCase();
      const name = (m.name || '').trim();
      if (!name) continue;

      const finalCode = code || `MDR-${String(existing.length + newRecords.length + 1).padStart(3, '0')}`;
      if (existing.some((e) => e.code.toUpperCase() === finalCode)) continue;

      newRecords.push({
        id: m.id || `mdr-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        code: finalCode,
        name,
        phone: m.phone || '',
        specialization: m.specialization || 'General OSP',
        teamSize: m.teamSize ? Number(m.teamSize) : 8,
        status: m.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        notes: m.notes || '',
        createdAt: new Date().toISOString(),
      });
    }

    db.mandors = [...newRecords, ...existing];
    await writeServerDb(db);

    if (isSupabaseConfigured && supabase && newRecords.length > 0) {
      try {
        await supabase.from('mandors').insert(
          newRecords.map((r) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            phone: r.phone,
            specialization: r.specialization,
            team_size: r.teamSize,
            status: r.status,
            notes: r.notes,
            created_at: r.createdAt,
          }))
        );
      } catch {
        // Abaikan jika tabel supabase belum siap
      }
    }

    return { success: true, count: newRecords.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed batch add mandors' };
  }
}


