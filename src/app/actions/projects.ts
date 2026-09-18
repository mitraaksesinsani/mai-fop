'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { readServerDb, writeServerDb } from '@/lib/serverDb';

export async function getProjects() {
  try {
    let dbProjects: any[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        // Try fetching with requirements, fallback to simple select if relation is missing
        const { data: joinedData, error: joinError } = await supabase
          .from('projects')
          .select('*, project_requirements(*, material_masters(*))')
          .order('created_at', { ascending: false });

        if (joinError) {
          const { data: simpleData, error: simpleError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

          if (!simpleError && simpleData && simpleData.length > 0) {
            dbProjects = simpleData;
          }
        } else if (joinedData && joinedData.length > 0) {
          dbProjects = joinedData;
        }
      } catch (supaErr) {
        console.warn('Supabase getProjects notice:', supaErr);
      }
    }

    // Jika Supabase tidak ada data atau belum dikonfigurasi, baca dari local serverDb (data/db.json)
    if (dbProjects.length === 0) {
      try {
        const db = await readServerDb();
        if (Array.isArray(db.projects) && db.projects.length > 0) {
          const mapped = db.projects.map((p: any) => ({
            id: p.id,
            name: p.projectName || p.name || '',
            customer: p.customer || '',
            type: p.projectType || p.type || '',
            location: p.region || p.location || '',
            contractNo: p.projectCode || p.contractNo || '',
            projectCode: p.projectCode || p.contractNo || '',
            startDate: p.startDate ? p.startDate.split('T')[0] : undefined,
            targetDate: p.endDate ? p.endDate.split('T')[0] : (p.targetDate ? p.targetDate.split('T')[0] : undefined),
            manager: p.pic || p.manager || '',
            status: p.status || '',
            scope: p.scope || '',
            routeNotes: p.routeNotes || p.surveyRoute?.routeNotes || '',
            surveyRoute: p.surveyRoute || undefined,
            surveyValidation: p.surveyValidation || undefined,
            surveyKml: p.surveyKml || undefined,
            permits: p.permits || [],
            boqItems: p.boqItems || [],
            commercial: p.commercial || { capex: 0, opex: 0, revenue: 0 },
            designatorItems: p.designatorItems || [],
            dailyReports: p.dailyReports || {},
            evidences: p.evidences || [],
            issues: p.issues || [],
          }));
          return { success: true, data: mapped };
        }
      } catch (dbErr) {
        console.warn('serverDb readProjects notice:', dbErr);
      }
    }

    // Baca data lokal untuk fallback pengayaan survey & permits jika di Supabase masih kosong
    let localDbMap: Record<string, any> = {};
    try {
      const localDb = await readServerDb();
      if (Array.isArray(localDb.projects)) {
        for (const lp of localDb.projects) {
          if (lp.id) localDbMap[lp.id] = lp;
          if (lp.projectCode) localDbMap[lp.projectCode] = lp;
        }
      }
    } catch (e) {
      // ignore
    }

    // Map database structure to Frontend interface
    const projects = (dbProjects || []).map((p: any) => {
      const localP = localDbMap[p.id] || localDbMap[p.project_code] || {};
      return {
        id: p.id,
        name: p.project_name || localP.projectName || localP.name || '',
        customer: p.customer || localP.customer || '',
        type: p.project_type || localP.projectType || localP.type || '',
        location: p.region || localP.region || localP.location || '',
        contractNo: p.project_code || p.projectCode || localP.projectCode || localP.contractNo || '',
        projectCode: p.project_code || p.projectCode || localP.projectCode || localP.contractNo || '',
        startDate: p.start_date ? p.start_date.split('T')[0] : (localP.startDate ? localP.startDate.split('T')[0] : undefined),
        targetDate: p.end_date ? p.end_date.split('T')[0] : (localP.endDate ? localP.endDate.split('T')[0] : (localP.targetDate ? localP.targetDate.split('T')[0] : undefined)),
        manager: p.pic || localP.pic || localP.manager || '',
        status: p.status || localP.status || '',
        scope: p.scope || p.notes || p.route_notes || localP.scope || '',

        // BOQ mapping
        boqItems: (p.project_requirements && p.project_requirements.length > 0)
          ? (p.project_requirements || []).map((req: any) => ({
              id: req.id,
              name: req.material_masters?.material_name || '',
              quantity: req.estimated_qty || 0,
              unit: req.material_masters?.unit || 'unit',
              price: Number(req.material_masters?.unit_price || 0)
            }))
          : (localP.boqItems || []),

        // Commercial defaults
        commercial: p.commercial || localP.commercial || {
          capex: 0,
          opex: 0,
          revenue: 0
        },

        // DRM & Designator Items
        designatorItems: (Array.isArray(p.designator_items) && p.designator_items.length > 0)
          ? p.designator_items
          : (Array.isArray(p.designatorItems) && p.designatorItems.length > 0
              ? p.designatorItems
              : (localP.designatorItems || [])),
        surveyRoute: p.survey_route || p.surveyRoute || localP.surveyRoute || undefined,
        surveyValidation: p.survey_validation || p.surveyValidation || localP.surveyValidation || undefined,
        surveyKml: p.survey_kml || p.surveyKml || localP.surveyKml || undefined,
        permits: (Array.isArray(p.permits) && p.permits.length > 0)
          ? p.permits
          : (Array.isArray(localP.permits) && localP.permits.length > 0 ? localP.permits : []),
        dailyReports: p.daily_reports || p.dailyReports || localP.dailyReports || {},
        evidences: (Array.isArray(p.evidences) && p.evidences.length > 0)
          ? p.evidences
          : (Array.isArray(localP.evidences) && localP.evidences.length > 0 ? localP.evidences : []),
        issues: (Array.isArray(p.issues) && p.issues.length > 0)
          ? p.issues
          : (Array.isArray(localP.issues) && localP.issues.length > 0 ? localP.issues : []),
        otdrTests: (Array.isArray(p.otdr_tests) && p.otdr_tests.length > 0)
          ? p.otdr_tests
          : (Array.isArray(p.otdrTests) && p.otdrTests.length > 0
              ? p.otdrTests
              : (Array.isArray(localP.otdrTests) && localP.otdrTests.length > 0 ? localP.otdrTests : [])),
        defects: (Array.isArray(p.defects) && p.defects.length > 0)
          ? p.defects
          : (Array.isArray(localP.defects) && localP.defects.length > 0 ? localP.defects : []),
        bauts: (Array.isArray(p.bauts) && p.bauts.length > 0)
          ? p.bauts
          : (Array.isArray(localP.bauts) && localP.bauts.length > 0 ? localP.bauts : []),
        asBuiltDocs: (Array.isArray(p.as_built_docs) && p.as_built_docs.length > 0)
          ? p.as_built_docs
          : (Array.isArray(p.asBuiltDocs) && p.asBuiltDocs.length > 0
              ? p.asBuiltDocs
              : (Array.isArray(localP.asBuiltDocs) && localP.asBuiltDocs.length > 0 ? localP.asBuiltDocs : [])),
        assets: (Array.isArray(p.assets) && p.assets.length > 0)
          ? p.assets
          : (Array.isArray(localP.assets) && localP.assets.length > 0 ? localP.assets : []),
        profitability: p.profitability || localP.profitability || undefined,
      };
    });

    return { success: true, data: projects };
  } catch (error: any) {
    console.warn('Notice in getProjects:', error?.message || error);
    return { success: false, error: 'Failed to fetch projects', data: [] };
  }
}

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
        scope: data.scope || '',
        boqItems: data.boqItems || [],
        surveyRoute: data.surveyRoute || undefined,
        surveyValidation: data.surveyValidation || undefined,
        surveyKml: data.surveyKml || undefined,
        permits: data.permits || [],
        commercial: data.commercial || { capex: 0, opex: 0, revenue: 0 },
        designatorItems: data.designatorItems || [],
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
            ...(data.scope !== undefined && { scope: data.scope }),
            ...(data.routeNotes !== undefined && { routeNotes: data.routeNotes }),
            ...(data.surveyRoute !== undefined && { surveyRoute: data.surveyRoute }),
            ...(data.surveyValidation !== undefined && { surveyValidation: data.surveyValidation }),
            ...(data.surveyKml !== undefined && { surveyKml: data.surveyKml }),
            ...(data.permits !== undefined && { permits: data.permits }),
            ...(data.boqItems !== undefined && { boqItems: data.boqItems }),
            ...(data.commercial !== undefined && { commercial: data.commercial }),
            ...(data.designatorItems !== undefined && { designatorItems: data.designatorItems }),
            ...(data.evidences !== undefined && { evidences: data.evidences }),
            ...(data.issues !== undefined && { issues: data.issues }),
            ...(data.otdrTests !== undefined && { otdrTests: data.otdrTests }),
            ...(data.defects !== undefined && { defects: data.defects }),
            ...(data.bauts !== undefined && { bauts: data.bauts }),
            ...(data.asBuiltDocs !== undefined && { asBuiltDocs: data.asBuiltDocs }),
            ...(data.assets !== undefined && { assets: data.assets }),
            ...(data.profitability !== undefined && { profitability: data.profitability }),
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
    if (data.permits !== undefined) updateData.permits = data.permits;
    if (data.surveyRoute !== undefined) updateData.survey_route = data.surveyRoute;
    if (data.surveyValidation !== undefined) updateData.survey_validation = data.surveyValidation;
    if (data.surveyKml !== undefined) updateData.survey_kml = data.surveyKml;
    if (data.designatorItems !== undefined) updateData.designator_items = data.designatorItems;

    const { data: updated, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Supabase update notice (fallback to serverDb):', error.message);
      return { success: true, data: { id, ...data } };
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

// =============================================================================
// SERVER ACTIONS: PERMIT MANAGEMENT (REAL DATABASE & LOCAL JSON)
// =============================================================================

export interface ServerPermitItem {
  id: string;
  siteId: string;
  category: string;
  status: string;
  progressDetail: string;
  targetDate?: string;
  actualDate?: string;
  picName: string;
  cost: number;
  notes: string;
  checklist?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Mengambil seluruh data perizinan untuk project tertentu dari database real
 */
export async function getPermitsAction(projectId: string): Promise<{ success: boolean; data: ServerPermitItem[]; error?: string }> {
  try {
    let permits: ServerPermitItem[] = [];

    // 1. Coba ambil dari Supabase tabel project_permits jika ada
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbPermits, error: supaErr } = await supabase
          .from('project_permits')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (!supaErr && Array.isArray(dbPermits) && dbPermits.length > 0) {
          permits = dbPermits.map((item: any) => ({
            id: item.id,
            siteId: item.site_id || item.siteId || '',
            category: item.category || 'PU Kota / Kab',
            status: item.status || 'Perizinan',
            progressDetail: item.progress_detail || item.progressDetail || '',
            targetDate: item.target_date ? item.target_date.split('T')[0] : (item.targetDate || undefined),
            actualDate: item.actual_date ? item.actual_date.split('T')[0] : (item.actualDate || undefined),
            picName: item.pic_name || item.picName || '',
            cost: Number(item.cost || 0),
            notes: item.notes || '',
            checklist: item.checklist || {},
            createdAt: item.created_at || item.createdAt,
            updatedAt: item.updated_at || item.updatedAt,
          }));
          return { success: true, data: permits };
        }
      } catch (err) {
        console.warn('Supabase project_permits notice:', err);
      }
    }

    // 2. Fallback baca dari database lokal serverDb (data/db.json)
    try {
      const db = await readServerDb();
      // Cek di array project
      const proj = (db.projects || []).find((p: any) => p.id === projectId || p.projectCode === projectId);
      if (proj && Array.isArray(proj.permits) && proj.permits.length > 0) {
        return { success: true, data: proj.permits };
      }

      // Cek di tabel root db.permits jika ada
      if (Array.isArray(db.permits)) {
        const rootPermits = db.permits.filter((pmt: any) => pmt.projectId === projectId || pmt.project_id === projectId);
        if (rootPermits.length > 0) {
          return { success: true, data: rootPermits };
        }
      }
    } catch (dbErr) {
      console.warn('serverDb read permits notice:', dbErr);
    }

    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Failed to get permits action:', error);
    return { success: false, error: 'Gagal memuat data perizinan', data: [] };
  }
}

/**
 * Menyimpan data perizinan (Tambah Baru atau Update) ke database real
 */
export async function savePermitAction(
  projectId: string,
  permitData: ServerPermitItem
): Promise<{ success: boolean; data?: ServerPermitItem; error?: string }> {
  try {
    const timestamp = new Date().toISOString();
    const cleanPermit: ServerPermitItem = {
      id: permitData.id || `pmt-${Date.now()}`,
      siteId: permitData.siteId.trim(),
      category: permitData.category || 'PU Kota / Kab',
      status: permitData.status || 'Perizinan',
      progressDetail: permitData.progressDetail || '',
      targetDate: permitData.targetDate || undefined,
      actualDate: permitData.actualDate || undefined,
      picName: permitData.picName ? permitData.picName.trim() : '',
      cost: Number(permitData.cost || 0),
      notes: permitData.notes ? permitData.notes.trim() : '',
      checklist: permitData.checklist || {},
      createdAt: permitData.createdAt || timestamp,
      updatedAt: timestamp,
    };

    // 1. Simpan ke local serverDb (data/db.json)
    try {
      const db = await readServerDb();
      if (!Array.isArray(db.permits)) {
        db.permits = [];
      }

      // Update root db.permits
      const rootIdx = db.permits.findIndex((p: any) => p.id === cleanPermit.id);
      const rootItem = { ...cleanPermit, projectId };
      if (rootIdx >= 0) {
        db.permits[rootIdx] = rootItem;
      } else {
        db.permits.unshift(rootItem);
      }

      // Update di dalam db.projects[idx].permits
      if (Array.isArray(db.projects)) {
        const pIdx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (pIdx >= 0) {
          const pList: ServerPermitItem[] = Array.isArray(db.projects[pIdx].permits) ? db.projects[pIdx].permits : [];
          const itemIdx = pList.findIndex((item) => item.id === cleanPermit.id);
          if (itemIdx >= 0) {
            pList[itemIdx] = cleanPermit;
          } else {
            pList.unshift(cleanPermit);
          }
          db.projects[pIdx].permits = pList;
          db.projects[pIdx].updatedAt = timestamp;
        }
      }

      await writeServerDb(db);
    } catch (dbErr) {
      console.warn('Notice saving permit to serverDb:', dbErr);
    }

    // 2. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        // Coba simpan ke tabel project_permits
        await supabase.from('project_permits').upsert({
          id: cleanPermit.id,
          project_id: projectId,
          site_id: cleanPermit.siteId,
          category: cleanPermit.category,
          status: cleanPermit.status,
          progress_detail: cleanPermit.progressDetail,
          target_date: cleanPermit.targetDate || null,
          actual_date: cleanPermit.actualDate || null,
          pic_name: cleanPermit.picName,
          cost: cleanPermit.cost,
          notes: cleanPermit.notes,
          checklist: cleanPermit.checklist,
          updated_at: timestamp,
        });

        // Sinkronkan juga kolom jsonb permits pada tabel projects
        const { data: currentProj } = await supabase
          .from('projects')
          .select('permits')
          .eq('id', projectId)
          .single();

        let currentPermits: any[] = Array.isArray(currentProj?.permits) ? currentProj.permits : [];
        const existIdx = currentPermits.findIndex((item: any) => item.id === cleanPermit.id);
        if (existIdx >= 0) {
          currentPermits[existIdx] = cleanPermit;
        } else {
          currentPermits = [cleanPermit, ...currentPermits];
        }

        await supabase
          .from('projects')
          .update({ permits: currentPermits, updated_at: timestamp })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase save permit notice:', supaErr);
      }
    }

    return { success: true, data: cleanPermit };
  } catch (error: any) {
    console.error('Failed to save permit action:', error);
    return { success: false, error: 'Gagal menyimpan data perizinan ke database' };
  }
}

/**
 * Menghapus data perizinan dari database real
 */
export async function deletePermitAction(
  projectId: string,
  permitId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Hapus dari local serverDb (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.permits)) {
        db.permits = db.permits.filter((p: any) => p.id !== permitId);
      }

      if (Array.isArray(db.projects)) {
        const pIdx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (pIdx >= 0 && Array.isArray(db.projects[pIdx].permits)) {
          db.projects[pIdx].permits = db.projects[pIdx].permits.filter((p: any) => p.id !== permitId);
          db.projects[pIdx].updatedAt = new Date().toISOString();
        }
      }

      await writeServerDb(db);
    } catch (dbErr) {
      console.warn('Notice deleting permit from serverDb:', dbErr);
    }

    // 2. Hapus dari Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('project_permits').delete().eq('id', permitId);

        // Update kolom jsonb permits di tabel projects
        const { data: currentProj } = await supabase
          .from('projects')
          .select('permits')
          .eq('id', projectId)
          .single();

        if (Array.isArray(currentProj?.permits)) {
          const filtered = currentProj.permits.filter((item: any) => item.id !== permitId);
          await supabase
            .from('projects')
            .update({ permits: filtered, updated_at: new Date().toISOString() })
            .eq('id', projectId);
        }
      } catch (supaErr) {
        console.warn('Supabase delete permit notice:', supaErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete permit action:', error);
    return { success: false, error: 'Gagal menghapus data perizinan dari database' };
  }
}

// =============================================================================
// SERVER ACTIONS: SURVEY VALIDATION & KML (REAL DATABASE)
// =============================================================================

export interface ServerSurveyValidation {
  surveyDate: string;
  surveyorName: string;
  feasibility: string;
  poleCondition: string;
  rowPermitRisk: string;
  findings: string;
  recommendations: string;
  verifiedBy: string;
  updatedAt?: string;
}

export interface ServerSurveyKml {
  fileName: string;
  fileSize: string;
  uploadDate: string;
  verifiedBy: string;
  startCoord: string;
  endCoord: string;
  routeStatus: string;
  notes: string;
  updatedAt?: string;
}

/**
 * Menyimpan data hasil validasi survey fisik ke database real
 */
export async function saveSurveyValidationAction(
  projectId: string,
  validationData: ServerSurveyValidation
): Promise<{ success: boolean; data?: ServerSurveyValidation; error?: string }> {
  try {
    const timestamp = new Date().toISOString();
    const cleanData: ServerSurveyValidation = {
      ...validationData,
      updatedAt: timestamp,
    };

    // 1. Simpan ke local serverDb (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const pIdx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (pIdx >= 0) {
          db.projects[pIdx].surveyValidation = cleanData;
          db.projects[pIdx].updatedAt = timestamp;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('Notice saving surveyValidation to serverDb:', dbErr);
    }

    // 2. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({
            survey_validation: cleanData,
            updated_at: timestamp,
          })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase save survey_validation notice:', supaErr);
      }
    }

    return { success: true, data: cleanData };
  } catch (error: any) {
    console.error('Failed to save survey validation action:', error);
    return { success: false, error: 'Gagal menyimpan hasil validasi survey ke database' };
  }
}

/**
 * Menyimpan / Unggah metadata data geospasial KML ke database real
 */
export async function saveSurveyKmlAction(
  projectId: string,
  kmlData: ServerSurveyKml
): Promise<{ success: boolean; data?: ServerSurveyKml; error?: string }> {
  try {
    const timestamp = new Date().toISOString();
    const cleanData: ServerSurveyKml = {
      ...kmlData,
      updatedAt: timestamp,
    };

    // 1. Simpan ke local serverDb (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const pIdx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (pIdx >= 0) {
          db.projects[pIdx].surveyKml = cleanData;
          db.projects[pIdx].updatedAt = timestamp;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('Notice saving surveyKml to serverDb:', dbErr);
    }

    // 2. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({
            survey_kml: cleanData,
            updated_at: timestamp,
          })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase save survey_kml notice:', supaErr);
      }
    }

    return { success: true, data: cleanData };
  } catch (error: any) {
    console.error('Failed to save survey KML action:', error);
    return { success: false, error: 'Gagal menyimpan data KML survey ke database' };
  }
}

/**
 * Mengambil data survey (Validation & KML) secara langsung dari database
 */
export async function getSurveyDataAction(projectId: string): Promise<{
  success: boolean;
  data?: {
    surveyValidation?: ServerSurveyValidation;
    surveyKml?: ServerSurveyKml;
    surveyRoute?: any;
  };
  error?: string;
}> {
  try {
    // 1. Coba baca dari Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('survey_validation, survey_kml, survey_route')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && (supaProject.survey_validation || supaProject.survey_kml)) {
          return {
            success: true,
            data: {
              surveyValidation: supaProject.survey_validation,
              surveyKml: supaProject.survey_kml,
              surveyRoute: supaProject.survey_route,
            },
          };
        }
      } catch (supaErr) {
        console.warn('Supabase getSurveyData notice:', supaErr);
      }
    }

    // 2. Fallback baca dari serverDb
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const proj = db.projects.find((p: any) => p.id === projectId || p.projectCode === projectId);
        if (proj) {
          return {
            success: true,
            data: {
              surveyValidation: proj.surveyValidation,
              surveyKml: proj.surveyKml,
              surveyRoute: proj.surveyRoute,
            },
          };
        }
      }
    } catch (dbErr) {
      console.warn('serverDb getSurveyData notice:', dbErr);
    }

    return { success: true, data: {} };
  } catch (error: any) {
    console.error('Failed to get survey data action:', error);
    return { success: false, error: 'Gagal memuat data survey dari database' };
  }
}

export async function saveDailyReportNoteAction(
  projectId: string,
  date: string,
  noteData: {
    tenagaKerja?: string;
    alatBerat?: string;
    cuaca?: string;
    kendala?: string;
    solusi?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    let updatedNote: any = null;
    let allReports: Record<string, any> = {};

    // 1. Simpan ke local server database (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const projectIndex = db.projects.findIndex(
          (p: any) => p.id === projectId || p.projectCode === projectId
        );

        if (projectIndex !== -1) {
          if (!db.projects[projectIndex].dailyReports) {
            db.projects[projectIndex].dailyReports = {};
          }
          const prev = db.projects[projectIndex].dailyReports[date] || {};
          updatedNote = {
            ...prev,
            ...noteData,
            updatedAt: nowIso,
          };
          db.projects[projectIndex].dailyReports[date] = updatedNote;
          allReports = db.projects[projectIndex].dailyReports;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveDailyReportNote notice:', dbErr);
    }

    // 2. Simpan juga ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({
            daily_reports: allReports,
            updated_at: nowIso,
          })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveDailyReportNote notice:', supaErr);
      }
    }

    return {
      success: true,
      data: updatedNote || { ...noteData, updatedAt: nowIso },
    };
  } catch (error: any) {
    console.error('Failed to save daily report note action:', error);
    return { success: false, error: 'Gagal menyimpan info lapangan ke database' };
  }
}

export async function getDailyReportsAction(
  projectId: string
): Promise<{ success: boolean; data?: Record<string, any>; error?: string }> {
  try {
    // 1. Coba baca dari Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('daily_reports')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && supaProject.daily_reports && Object.keys(supaProject.daily_reports).length > 0) {
          return {
            success: true,
            data: supaProject.daily_reports,
          };
        }
      } catch (supaErr) {
        console.warn('Supabase getDailyReports notice:', supaErr);
      }
    }

    // 2. Fallback baca dari serverDb (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const proj = db.projects.find(
          (p: any) => p.id === projectId || p.projectCode === projectId
        );
        if (proj && proj.dailyReports) {
          return {
            success: true,
            data: proj.dailyReports,
          };
        }
      }
    } catch (dbErr) {
      console.warn('serverDb getDailyReports notice:', dbErr);
    }

    return { success: true, data: {} };
  } catch (error: any) {
    console.error('Failed to get daily reports action:', error);
    return { success: false, error: 'Gagal memuat info lapangan dari database' };
  }
}

export async function saveDesignatorProgressAction(
  projectId: string,
  items: any[]
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const nowIso = new Date().toISOString();

    // 1. Simpan ke local server database (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const projectIndex = db.projects.findIndex(
          (p: any) => p.id === projectId || p.projectCode === projectId
        );

        if (projectIndex !== -1) {
          db.projects[projectIndex].designatorItems = items;
          db.projects[projectIndex].updatedAt = nowIso;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveDesignatorProgress notice:', dbErr);
    }

    // 2. Simpan juga ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({
            designator_items: items,
            updated_at: nowIso,
          })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveDesignatorProgress notice:', supaErr);
      }
    }

    return { success: true, data: items };
  } catch (error: any) {
    console.error('Failed to save designator progress action:', error);
    return { success: false, error: 'Gagal menyimpan progres DRM ke database' };
  }
}

export async function getDesignatorProgressAction(
  projectId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    // 1. Coba baca dari Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('designator_items')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && Array.isArray(supaProject.designator_items) && supaProject.designator_items.length > 0) {
          return {
            success: true,
            data: supaProject.designator_items,
          };
        }
      } catch (supaErr) {
        console.warn('Supabase getDesignatorProgress notice:', supaErr);
      }
    }

    // 2. Fallback baca dari serverDb (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const proj = db.projects.find(
          (p: any) => p.id === projectId || p.projectCode === projectId
        );
        if (proj && Array.isArray(proj.designatorItems) && proj.designatorItems.length > 0) {
          return {
            success: true,
            data: proj.designatorItems,
          };
        }
      }
    } catch (dbErr) {
      console.warn('serverDb getDesignatorProgress notice:', dbErr);
    }

    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Failed to get designator progress action:', error);
    return { success: false, error: 'Gagal memuat progres DRM dari database' };
  }
}

// =========================================================================
// EVIDENCE VAULT SERVER ACTIONS (REAL DATABASE)
// =========================================================================
export async function getProjectEvidencesAction(
  projectId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('evidences')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && Array.isArray(supaProject.evidences) && supaProject.evidences.length > 0) {
          return { success: true, data: supaProject.evidences };
        }
      } catch (supaErr) {
        console.warn('Supabase getProjectEvidences notice:', supaErr);
      }
    }

    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const proj = db.projects.find((p: any) => p.id === projectId || p.projectCode === projectId);
        if (proj && Array.isArray(proj.evidences)) {
          return { success: true, data: proj.evidences };
        }
      }
    } catch (dbErr) {
      console.warn('serverDb getProjectEvidences notice:', dbErr);
    }

    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Failed to get evidences action:', error);
    return { success: false, error: 'Gagal memuat dokumentasi dari database' };
  }
}

export async function saveProjectEvidenceAction(
  projectId: string,
  evidenceData: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const evidenceItem = {
      ...evidenceData,
      id: evidenceData.id || `evd-${Date.now()}`,
      createdAt: evidenceData.createdAt || nowIso,
    };

    let allEvidences: any[] = [];

    // 1. Simpan ke local server database (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1) {
          if (!Array.isArray(db.projects[idx].evidences)) {
            db.projects[idx].evidences = [];
          }

          const existingIndex = db.projects[idx].evidences.findIndex((e: any) => e.id === evidenceItem.id);
          if (existingIndex !== -1) {
            db.projects[idx].evidences[existingIndex] = evidenceItem;
          } else {
            db.projects[idx].evidences.unshift(evidenceItem);
          }

          allEvidences = db.projects[idx].evidences;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveProjectEvidence notice:', dbErr);
    }

    // 2. Simpan juga ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ evidences: allEvidences, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveProjectEvidence notice:', supaErr);
      }
    }

    return { success: true, data: evidenceItem };
  } catch (error: any) {
    console.error('Failed to save evidence action:', error);
    return { success: false, error: 'Gagal menyimpan dokumentasi ke database' };
  }
}

export async function deleteProjectEvidenceAction(
  projectId: string,
  evidenceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    let allEvidences: any[] = [];

    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1 && Array.isArray(db.projects[idx].evidences)) {
          db.projects[idx].evidences = db.projects[idx].evidences.filter((e: any) => e.id !== evidenceId);
          allEvidences = db.projects[idx].evidences;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb deleteProjectEvidence notice:', dbErr);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ evidences: allEvidences, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase deleteProjectEvidence notice:', supaErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete evidence action:', error);
    return { success: false, error: 'Gagal menghapus dokumentasi dari database' };
  }
}

// =========================================================================
// ISSUE & RISK CONTROL SERVER ACTIONS (REAL DATABASE)
// =========================================================================
export async function getProjectIssuesAction(
  projectId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('issues')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && Array.isArray(supaProject.issues) && supaProject.issues.length > 0) {
          return { success: true, data: supaProject.issues };
        }
      } catch (supaErr) {
        console.warn('Supabase getProjectIssues notice:', supaErr);
      }
    }

    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const proj = db.projects.find((p: any) => p.id === projectId || p.projectCode === projectId);
        if (proj && Array.isArray(proj.issues)) {
          return { success: true, data: proj.issues };
        }
      }
    } catch (dbErr) {
      console.warn('serverDb getProjectIssues notice:', dbErr);
    }

    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Failed to get issues action:', error);
    return { success: false, error: 'Gagal memuat isu & risiko dari database' };
  }
}

export async function saveProjectIssueAction(
  projectId: string,
  issueData: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const issueItem = {
      ...issueData,
      id: issueData.id || `iss-${Date.now()}`,
      createdAt: issueData.createdAt || nowIso,
      updatedAt: nowIso,
    };

    let allIssues: any[] = [];

    // 1. Simpan ke local server database (data/db.json)
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1) {
          if (!Array.isArray(db.projects[idx].issues)) {
            db.projects[idx].issues = [];
          }

          const existingIndex = db.projects[idx].issues.findIndex((i: any) => i.id === issueItem.id);
          if (existingIndex !== -1) {
            db.projects[idx].issues[existingIndex] = issueItem;
          } else {
            db.projects[idx].issues.unshift(issueItem);
          }

          allIssues = db.projects[idx].issues;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveProjectIssue notice:', dbErr);
    }

    // 2. Simpan juga ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ issues: allIssues, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveProjectIssue notice:', supaErr);
      }
    }

    return { success: true, data: issueItem };
  } catch (error: any) {
    console.error('Failed to save issue action:', error);
    return { success: false, error: 'Gagal menyimpan isu ke database' };
  }
}

export async function deleteProjectIssueAction(
  projectId: string,
  issueId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    let allIssues: any[] = [];

    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1 && Array.isArray(db.projects[idx].issues)) {
          db.projects[idx].issues = db.projects[idx].issues.filter((i: any) => i.id !== issueId);
          allIssues = db.projects[idx].issues;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb deleteProjectIssue notice:', dbErr);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ issues: allIssues, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase deleteProjectIssue notice:', supaErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete issue action:', error);
    return { success: false, error: 'Gagal menghapus isu dari database' };
  }
}

// =========================================================================
// COMMISSIONING: OTDR TEST RESULTS SERVER ACTIONS (REAL DATABASE)
// =========================================================================
export async function getProjectOtdrTestsAction(
  projectId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('otdr_tests')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && Array.isArray(supaProject.otdr_tests) && supaProject.otdr_tests.length > 0) {
          return { success: true, data: supaProject.otdr_tests };
        }
      } catch (supaErr) {
        console.warn('Supabase getProjectOtdrTests notice:', supaErr);
      }
    }

    const db = await readServerDb();
    if (Array.isArray(db.projects)) {
      const p = db.projects.find((item: any) => item.id === projectId || item.projectCode === projectId);
      if (p && Array.isArray(p.otdrTests)) {
        return { success: true, data: p.otdrTests };
      }
    }

    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Failed to get OTDR tests action:', error);
    return { success: false, error: 'Gagal memuat hasil tes OTDR dari database', data: [] };
  }
}

export async function saveProjectOtdrTestAction(
  projectId: string,
  testData: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const testItem = {
      id: testData.id || `OTDR-${Date.now()}`,
      testId: testData.testId || `TEST-${Math.floor(100 + Math.random() * 900)}`,
      fiberCore: testData.fiberCore || 'Core 01 (SM)',
      direction: testData.direction || 'A -> B',
      distanceKm: Number(testData.distanceKm) || 0,
      totalLossDb: Number(testData.totalLossDb) || 0,
      eventLossDb: Number(testData.eventLossDb) || 0,
      result: (testData.result === 'FAIL' ? 'FAIL' : 'PASS') as 'PASS' | 'FAIL',
      wavelength: testData.wavelength || '1310 nm',
      testedBy: testData.testedBy || '',
      testDate: testData.testDate || nowIso.split('T')[0],
      notes: testData.notes || '',
      fileUrl: testData.fileUrl || '',
      fileName: testData.fileName || '',
      createdAt: testData.createdAt || nowIso,
      updatedAt: nowIso,
    };

    let allTests: any[] = [];

    // 1. Simpan ke local db.json
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1) {
          if (!Array.isArray(db.projects[idx].otdrTests)) {
            db.projects[idx].otdrTests = [];
          }
          const existingIdx = db.projects[idx].otdrTests.findIndex((t: any) => t.id === testItem.id);
          if (existingIdx !== -1) {
            db.projects[idx].otdrTests[existingIdx] = testItem;
          } else {
            db.projects[idx].otdrTests.unshift(testItem);
          }

          allTests = db.projects[idx].otdrTests;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveProjectOtdrTest notice:', dbErr);
    }

    // 2. Simpan juga ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ otdr_tests: allTests, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveProjectOtdrTest notice:', supaErr);
      }
    }

    return { success: true, data: testItem };
  } catch (error: any) {
    console.error('Failed to save OTDR test action:', error);
    return { success: false, error: 'Gagal menyimpan hasil test OTDR ke database' };
  }
}

export async function deleteProjectOtdrTestAction(
  projectId: string,
  testId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    let allTests: any[] = [];

    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1 && Array.isArray(db.projects[idx].otdrTests)) {
          db.projects[idx].otdrTests = db.projects[idx].otdrTests.filter((t: any) => t.id !== testId);
          allTests = db.projects[idx].otdrTests;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb deleteProjectOtdrTest notice:', dbErr);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ otdr_tests: allTests, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase deleteProjectOtdrTest notice:', supaErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete OTDR test action:', error);
    return { success: false, error: 'Gagal menghapus hasil test OTDR dari database' };
  }
}

// =========================================================================
// COMMISSIONING: DEFECT & PUNCH LIST SERVER ACTIONS (REAL DATABASE)
// =========================================================================
export async function getProjectDefectsAction(
  projectId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('defects')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && Array.isArray(supaProject.defects) && supaProject.defects.length > 0) {
          return { success: true, data: supaProject.defects };
        }
      } catch (supaErr) {
        console.warn('Supabase getProjectDefects notice:', supaErr);
      }
    }

    const db = await readServerDb();
    if (Array.isArray(db.projects)) {
      const p = db.projects.find((item: any) => item.id === projectId || item.projectCode === projectId);
      if (p && Array.isArray(p.defects)) {
        return { success: true, data: p.defects };
      }
    }

    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Failed to get defects action:', error);
    return { success: false, error: 'Gagal memuat daftar defect dari database', data: [] };
  }
}

export async function saveProjectDefectAction(
  projectId: string,
  defectData: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const defectItem = {
      id: defectData.id || `PUNCH-${Date.now()}`,
      punchId: defectData.punchId || `PUNCH-${Math.floor(10 + Math.random() * 90)}`,
      description: defectData.description || '',
      location: defectData.location || '',
      severity: (defectData.severity || 'Minor') as 'Minor' | 'Major' | 'Critical',
      pic: defectData.pic || '',
      reportDate: defectData.reportDate || nowIso.split('T')[0],
      dueDate: defectData.dueDate || '',
      status: (defectData.status || 'Open') as 'Open' | 'In Correction' | 'Closed',
      resolutionNotes: defectData.resolutionNotes || '',
      createdAt: defectData.createdAt || nowIso,
      updatedAt: nowIso,
    };

    let allDefects: any[] = [];

    // 1. Simpan ke local db.json
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1) {
          if (!Array.isArray(db.projects[idx].defects)) {
            db.projects[idx].defects = [];
          }
          const existingIdx = db.projects[idx].defects.findIndex((d: any) => d.id === defectItem.id);
          if (existingIdx !== -1) {
            db.projects[idx].defects[existingIdx] = defectItem;
          } else {
            db.projects[idx].defects.unshift(defectItem);
          }

          allDefects = db.projects[idx].defects;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveProjectDefect notice:', dbErr);
    }

    // 2. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ defects: allDefects, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveProjectDefect notice:', supaErr);
      }
    }

    return { success: true, data: defectItem };
  } catch (error: any) {
    console.error('Failed to save defect action:', error);
    return { success: false, error: 'Gagal menyimpan data defect ke database' };
  }
}

export async function deleteProjectDefectAction(
  projectId: string,
  defectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    let allDefects: any[] = [];

    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1 && Array.isArray(db.projects[idx].defects)) {
          db.projects[idx].defects = db.projects[idx].defects.filter((d: any) => d.id !== defectId);
          allDefects = db.projects[idx].defects;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb deleteProjectDefect notice:', dbErr);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ defects: allDefects, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase deleteProjectDefect notice:', supaErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete defect action:', error);
    return { success: false, error: 'Gagal menghapus defect dari database' };
  }
}

// =========================================================================
// COMMISSIONING: BA ACCEPTANCE (BA UT) SERVER ACTIONS (REAL DATABASE)
// =========================================================================
export async function getProjectBautsAction(
  projectId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('bauts')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && Array.isArray(supaProject.bauts) && supaProject.bauts.length > 0) {
          return { success: true, data: supaProject.bauts };
        }
      } catch (supaErr) {
        console.warn('Supabase getProjectBauts notice:', supaErr);
      }
    }

    const db = await readServerDb();
    if (Array.isArray(db.projects)) {
      const p = db.projects.find((item: any) => item.id === projectId || item.projectCode === projectId);
      if (p && Array.isArray(p.bauts)) {
        return { success: true, data: p.bauts };
      }
    }

    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Failed to get BAUT action:', error);
    return { success: false, error: 'Gagal memuat data BA UT dari database', data: [] };
  }
}

export async function saveProjectBautAction(
  projectId: string,
  bautData: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const bautItem = {
      id: bautData.id || `BAUT-${Date.now()}`,
      bautNumber: bautData.bautNumber || `BAUT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: bautData.title || 'Berita Acara Uji Terima (BA UT)',
      clientName: bautData.clientName || '',
      date: bautData.date || nowIso.split('T')[0],
      status: (bautData.status || 'Draft') as 'Draft' | 'Under Review' | 'Ready for Sign-off' | 'Signed & Approved',
      signatoryVendor: bautData.signatoryVendor || '',
      signatoryClient: bautData.signatoryClient || '',
      scopeCovered: bautData.scopeCovered || '',
      notes: bautData.notes || '',
      documentUrl: bautData.documentUrl || '',
      documentName: bautData.documentName || '',
      createdAt: bautData.createdAt || nowIso,
      updatedAt: nowIso,
    };

    let allBauts: any[] = [];

    // 1. Simpan ke local db.json
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1) {
          if (!Array.isArray(db.projects[idx].bauts)) {
            db.projects[idx].bauts = [];
          }
          const existingIdx = db.projects[idx].bauts.findIndex((b: any) => b.id === bautItem.id);
          if (existingIdx !== -1) {
            db.projects[idx].bauts[existingIdx] = bautItem;
          } else {
            db.projects[idx].bauts.unshift(bautItem);
          }

          allBauts = db.projects[idx].bauts;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveProjectBaut notice:', dbErr);
    }

    // 2. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ bauts: allBauts, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveProjectBaut notice:', supaErr);
      }
    }

    return { success: true, data: bautItem };
  } catch (error: any) {
    console.error('Failed to save BAUT action:', error);
    return { success: false, error: 'Gagal menyimpan draft BA UT ke database' };
  }
}

export async function deleteProjectBautAction(
  projectId: string,
  bautId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    let allBauts: any[] = [];

    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1 && Array.isArray(db.projects[idx].bauts)) {
          db.projects[idx].bauts = db.projects[idx].bauts.filter((b: any) => b.id !== bautId);
          allBauts = db.projects[idx].bauts;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb deleteProjectBaut notice:', dbErr);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ bauts: allBauts, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase deleteProjectBaut notice:', supaErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete BAUT action:', error);
    return { success: false, error: 'Gagal menghapus draft BA UT dari database' };
  }
}

// =========================================================================
// CLOSING: AS-BUILT DOCUMENTATION (ABD) SERVER ACTIONS (REAL DATABASE)
// =========================================================================
export async function getProjectAsBuiltDocsAction(
  projectId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('as_built_docs')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && Array.isArray(supaProject.as_built_docs) && supaProject.as_built_docs.length > 0) {
          return { success: true, data: supaProject.as_built_docs };
        }
      } catch (supaErr) {
        console.warn('Supabase getProjectAsBuiltDocs notice:', supaErr);
      }
    }

    const db = await readServerDb();
    if (Array.isArray(db.projects)) {
      const p = db.projects.find((item: any) => item.id === projectId || item.projectCode === projectId);
      if (p && Array.isArray(p.asBuiltDocs)) {
        return { success: true, data: p.asBuiltDocs };
      }
    }

    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Failed to get as built docs action:', error);
    return { success: false, error: 'Gagal memuat dokumen as-built dari database', data: [] };
  }
}

export async function saveProjectAsBuiltDocAction(
  projectId: string,
  docData: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const docItem = {
      id: docData.id || `ABD-${Date.now()}`,
      name: docData.name || 'Dokumen As-Built Proyek.pdf',
      category: docData.category || 'Engineering',
      size: docData.size || '3.5 MB',
      date: docData.date || nowIso.split('T')[0],
      status: docData.status || 'Final Verified',
      notes: docData.notes || '',
      fileUrl: docData.fileUrl || '',
      createdAt: docData.createdAt || nowIso,
      updatedAt: nowIso,
    };

    let allDocs: any[] = [];

    // 1. Simpan ke local db.json
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1) {
          if (!Array.isArray(db.projects[idx].asBuiltDocs)) {
            db.projects[idx].asBuiltDocs = [];
          }
          const existingIdx = db.projects[idx].asBuiltDocs.findIndex((d: any) => d.id === docItem.id);
          if (existingIdx !== -1) {
            db.projects[idx].asBuiltDocs[existingIdx] = docItem;
          } else {
            db.projects[idx].asBuiltDocs.unshift(docItem);
          }

          allDocs = db.projects[idx].asBuiltDocs;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveProjectAsBuiltDoc notice:', dbErr);
    }

    // 2. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ as_built_docs: allDocs, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveProjectAsBuiltDoc notice:', supaErr);
      }
    }

    return { success: true, data: docItem };
  } catch (error: any) {
    console.error('Failed to save as built doc action:', error);
    return { success: false, error: 'Gagal menyimpan dokumen as-built ke database' };
  }
}

export async function deleteProjectAsBuiltDocAction(
  projectId: string,
  docId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    let allDocs: any[] = [];

    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1 && Array.isArray(db.projects[idx].asBuiltDocs)) {
          db.projects[idx].asBuiltDocs = db.projects[idx].asBuiltDocs.filter((d: any) => d.id !== docId);
          allDocs = db.projects[idx].asBuiltDocs;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb deleteProjectAsBuiltDoc notice:', dbErr);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ as_built_docs: allDocs, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase deleteProjectAsBuiltDoc notice:', supaErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete as built doc action:', error);
    return { success: false, error: 'Gagal menghapus dokumen as-built dari database' };
  }
}

// =========================================================================
// CLOSING: ASSET INVENTORY RECORD SERVER ACTIONS (REAL DATABASE)
// =========================================================================
export async function getProjectAssetsAction(
  projectId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('assets')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && Array.isArray(supaProject.assets) && supaProject.assets.length > 0) {
          return { success: true, data: supaProject.assets };
        }
      } catch (supaErr) {
        console.warn('Supabase getProjectAssets notice:', supaErr);
      }
    }

    const db = await readServerDb();
    if (Array.isArray(db.projects)) {
      const p = db.projects.find((item: any) => item.id === projectId || item.projectCode === projectId);
      if (p && Array.isArray(p.assets)) {
        return { success: true, data: p.assets };
      }
    }

    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Failed to get assets action:', error);
    return { success: false, error: 'Gagal memuat inventaris aset dari database', data: [] };
  }
}

export async function saveProjectAssetAction(
  projectId: string,
  assetData: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const assetItem = {
      id: assetData.id || `AST-${Date.now()}`,
      assetId: assetData.assetId || `AST-${Math.floor(100 + Math.random() * 900)}`,
      type: assetData.type || 'Cable Asset',
      specification: assetData.specification || '',
      location: assetData.location || '',
      warranty: assetData.warranty || '12 Bulan Garansi',
      vendor: assetData.vendor || '',
      status: assetData.status || 'Active / Transferred',
      notes: assetData.notes || '',
      createdAt: assetData.createdAt || nowIso,
      updatedAt: nowIso,
    };

    let allAssets: any[] = [];

    // 1. Simpan ke local db.json
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1) {
          if (!Array.isArray(db.projects[idx].assets)) {
            db.projects[idx].assets = [];
          }
          const existingIdx = db.projects[idx].assets.findIndex((a: any) => a.id === assetItem.id);
          if (existingIdx !== -1) {
            db.projects[idx].assets[existingIdx] = assetItem;
          } else {
            db.projects[idx].assets.unshift(assetItem);
          }

          allAssets = db.projects[idx].assets;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveProjectAsset notice:', dbErr);
    }

    // 2. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ assets: allAssets, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveProjectAsset notice:', supaErr);
      }
    }

    return { success: true, data: assetItem };
  } catch (error: any) {
    console.error('Failed to save asset action:', error);
    return { success: false, error: 'Gagal menyimpan data aset ke database' };
  }
}

export async function deleteProjectAssetAction(
  projectId: string,
  assetId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    let allAssets: any[] = [];

    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1 && Array.isArray(db.projects[idx].assets)) {
          db.projects[idx].assets = db.projects[idx].assets.filter((a: any) => a.id !== assetId);
          allAssets = db.projects[idx].assets;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb deleteProjectAsset notice:', dbErr);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ assets: allAssets, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase deleteProjectAsset notice:', supaErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete asset action:', error);
    return { success: false, error: 'Gagal menghapus aset dari database' };
  }
}

// =========================================================================
// CLOSING: FINAL PROFITABILITY REPORT SERVER ACTIONS (REAL DATABASE)
// =========================================================================
export async function getProjectProfitabilityAction(
  projectId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: supaProject, error: supaErr } = await supabase
          .from('projects')
          .select('profitability')
          .eq('id', projectId)
          .single();

        if (!supaErr && supaProject && supaProject.profitability) {
          return { success: true, data: supaProject.profitability };
        }
      } catch (supaErr) {
        console.warn('Supabase getProjectProfitability notice:', supaErr);
      }
    }

    const db = await readServerDb();
    if (Array.isArray(db.projects)) {
      const p = db.projects.find((item: any) => item.id === projectId || item.projectCode === projectId);
      if (p && p.profitability) {
        return { success: true, data: p.profitability };
      }
    }

    return { success: true, data: null };
  } catch (error: any) {
    console.error('Failed to get profitability action:', error);
    return { success: false, error: 'Gagal memuat laporan profitabilitas dari database' };
  }
}

export async function saveProjectProfitabilityAction(
  projectId: string,
  profData: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const profItem = {
      contractValue: Number(profData.contractValue) || 0,
      actualCapex: Number(profData.actualCapex) || 0,
      actualOpex: Number(profData.actualOpex) || 0,
      rabBudget: Number(profData.rabBudget) || 0,
      notes: profData.notes || '',
      rootCauses: Array.isArray(profData.rootCauses) ? profData.rootCauses : [],
      updatedAt: nowIso,
    };

    // 1. Simpan ke local db.json
    try {
      const db = await readServerDb();
      if (Array.isArray(db.projects)) {
        const idx = db.projects.findIndex((p: any) => p.id === projectId || p.projectCode === projectId);
        if (idx !== -1) {
          db.projects[idx].profitability = profItem;
          await writeServerDb(db);
        }
      }
    } catch (dbErr) {
      console.warn('serverDb saveProjectProfitability notice:', dbErr);
    }

    // 2. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('projects')
          .update({ profitability: profItem, updated_at: nowIso })
          .eq('id', projectId);
      } catch (supaErr) {
        console.warn('Supabase saveProjectProfitability notice:', supaErr);
      }
    }

    return { success: true, data: profItem };
  } catch (error: any) {
    console.error('Failed to save profitability action:', error);
    return { success: false, error: 'Gagal menyimpan laporan profitabilitas ke database' };
  }
}



