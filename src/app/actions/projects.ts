'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function getProjects() {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase is not configured yet', data: [] };
    }

    // Try fetching with requirements, fallback to simple select if relation is missing
    let dbProjects: any[] = [];
    const { data: joinedData, error: joinError } = await supabase
      .from('projects')
      .select('*, project_requirements(*, material_masters(*))')
      .order('created_at', { ascending: false });

    if (joinError) {
      const { data: simpleData, error: simpleError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (simpleError) {
        console.warn('Supabase getProjects notice:', simpleError.message);
        return { success: false, error: simpleError.message, data: [] };
      }
      dbProjects = simpleData || [];
    } else {
      dbProjects = joinedData || [];
    }

    // Map database structure to Frontend interface
    const projects = (dbProjects || []).map((p: any) => ({
      id: p.id,
      name: p.project_name || '',
      customer: p.customer || '',
      type: p.project_type || '',
      location: p.region || '',
      contractNo: p.project_code || '',
      startDate: p.start_date ? p.start_date.split('T')[0] : undefined,
      targetDate: p.end_date ? p.end_date.split('T')[0] : undefined,
      manager: p.pic || '',
      status: p.status || '',

      // BOQ mapping
      boqItems: (p.project_requirements || []).map((req: any) => ({
        id: req.id,
        name: req.material_masters?.material_name || '',
        quantity: req.estimated_qty || 0,
        unit: req.material_masters?.unit || 'unit',
        price: Number(req.material_masters?.unit_price || 0)
      })),

      // Commercial defaults
      commercial: {
        capex: 0,
        opex: 0,
        revenue: 0
      }
    }));

    return { success: true, data: projects };
  } catch (error: any) {
    console.warn('Notice in getProjects:', error?.message || error);
    return { success: false, error: 'Failed to fetch projects', data: [] };
  }
}

import { readServerDb, writeServerDb } from '@/lib/serverDb';

export async function deleteProjectRecord(id: string) {
  try {
    // Sinkronkan ke local server database (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        db.projects = db.projects.filter((p: any) => p.id !== id && p.projectCode !== id);
        await writeServerDb(db);
      }
    } catch (dbErr) {
      console.warn('Notice syncing delete to serverDb:', dbErr);
    }

    if (!isSupabaseConfigured || !supabase) {
      return { success: true };
    }

    // Safely delete any child project requirements first in case ON DELETE CASCADE is not set in DB
    try {
      await supabase.from('project_requirements').delete().eq('project_id', id);
    } catch (e) {
      // Ignore if table or relationship doesn't exist
    }

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete project:', error);
    return { success: false, error: 'Failed to delete project' };
  }
}

export async function addProjectRecord(data: any) {
  try {
    // Sinkronkan ke local server database (data/db.json)
    try {
      const db = await readServerDb();
      if (!Array.isArray(db.projects)) {
        db.projects = [];
      }
      const existingIdx = db.projects.findIndex((p: any) => p.id === data.id || p.projectCode === data.contractNo);
      const newLocalEntry = {
        id: data.id,
        projectName: data.name,
        customer: data.customer,
        region: data.location,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
        endDate: data.targetDate ? new Date(data.targetDate).toISOString() : new Date().toISOString(),
        pic: data.manager,
        status: (data.status || 'PLANNING').toUpperCase(),
        projectType: data.type,
        projectCode: data.contractNo || data.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        db.projects[existingIdx] = { ...db.projects[existingIdx], ...newLocalEntry };
      } else {
        db.projects.unshift(newLocalEntry);
      }
      await writeServerDb(db);
    } catch (dbErr) {
      console.warn('Notice syncing add to serverDb:', dbErr);
    }

    if (!isSupabaseConfigured || !supabase) {
      return { success: true, data };
    }

    const newRecord = {
      id: data.id,
      project_name: data.name,
      customer: data.customer,
      region: data.location,
      start_date: data.startDate ? new Date(data.startDate).toISOString() : null,
      end_date: data.targetDate ? new Date(data.targetDate).toISOString() : null,
      pic: data.manager,
      status: data.status,
      project_type: data.type,
      project_code: data.contractNo
    };

    const { data: created, error } = await supabase
      .from('projects')
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: created };
  } catch (error: any) {
    console.error('Failed to create project:', error);
    return { success: false, error: 'Failed to create project' };
  }
}

export async function updateProjectRecord(id: string, data: any) {
  try {
    // Sinkronkan ke local server database (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === id || p.projectCode === id);
        if (idx >= 0) {
          db.projects[idx] = {
            ...db.projects[idx],
            ...(data.name && { projectName: data.name }),
            ...(data.customer && { customer: data.customer }),
            ...(data.location && { region: data.location }),
            ...(data.startDate && { startDate: new Date(data.startDate).toISOString() }),
            ...(data.targetDate && { endDate: new Date(data.targetDate).toISOString() }),
            ...(data.manager && { pic: data.manager }),
            ...(data.status && { status: String(data.status).toUpperCase() }),
            ...(data.type && { projectType: data.type }),
            ...(data.contractNo && { projectCode: data.contractNo }),
            updatedAt: new Date().toISOString(),
          };
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('Notice syncing update to serverDb:', dbErr);
    }

    if (!isSupabaseConfigured || !supabase) {
      return { success: true, data: { id, ...data } };
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.project_name = data.name;
    if (data.customer !== undefined) updateData.customer = data.customer;
    if (data.location !== undefined) updateData.region = data.location;
    if (data.startDate !== undefined)
      updateData.start_date = data.startDate ? new Date(data.startDate).toISOString() : null;
    if (data.targetDate !== undefined)
      updateData.end_date = data.targetDate ? new Date(data.targetDate).toISOString() : null;
    if (data.manager !== undefined) updateData.pic = data.manager;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.type !== undefined) updateData.project_type = data.type;
    if (data.contractNo !== undefined) updateData.project_code = data.contractNo;

    const { data: updated, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase update error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Failed to update project:', error);
    return { success: false, error: 'Failed to update project' };
  }
}

export async function getMaterials() {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true, data: [] };
    }

    const { data: materials, error } = await supabase
      .from('material_masters')
      .select('*')
      .order('material_name', { ascending: true });

    if (error) {
      return { success: false, error: error.message, data: [] };
    }
    return { success: true, data: materials || [] };
  } catch (error: any) {
    console.error('Failed to fetch materials:', error);
    return { success: false, error: 'Failed to fetch materials' };
  }
}
