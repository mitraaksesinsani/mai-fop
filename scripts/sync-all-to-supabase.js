const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Kredensial Supabase tidak ditemukan di .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const dbPath = path.join(__dirname, '..', 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function syncAll() {
  console.log('=== MEMULAI SINKRONISASI LENGKAP KE SUPABASE ===\n');

  // 1. Bowheers
  if (Array.isArray(db.bowheers) && db.bowheers.length > 0) {
    console.log(`Menyinkronkan ${db.bowheers.length} Bowheers...`);
    const rows = db.bowheers.map(b => ({
      id: b.id,
      code: b.code,
      name: b.name,
      alias: b.alias || '',
      category: b.category || 'Telekomunikasi',
      contact_person: b.contactPerson || '',
      email: b.email || '',
      phone: b.phone || '',
      address: b.address || '',
      status: b.status || 'ACTIVE',
      created_at: b.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('bowheers').upsert(rows, { onConflict: 'code' });
    console.log(error ? `  [GAGAL] Bowheers: ${error.message}` : `  [OK] ${rows.length} Bowheers tersinkronisasi.`);
  }

  // 2. Designators
  if (Array.isArray(db.designators) && db.designators.length > 0) {
    console.log(`Menyinkronkan ${db.designators.length} Designators...`);
    const rows = db.designators.map(d => ({
      id: d.id,
      code: d.code,
      description: d.description || '',
      type: d.type || '',
      unit: d.unit || '',
      created_at: d.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('designators').upsert(rows, { onConflict: 'code' });
    console.log(error ? `  [GAGAL] Designators: ${error.message}` : `  [OK] ${rows.length} Designators tersinkronisasi.`);
  }

  // 3. Alat Kerja
  if (Array.isArray(db.alatKerja) && db.alatKerja.length > 0) {
    console.log(`Menyinkronkan ${db.alatKerja.length} Alat Kerja...`);
    const rows = db.alatKerja.map(a => ({
      id: a.id,
      code: a.code,
      name: a.name,
      category: a.category || '',
      created_at: a.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('alat_kerja').upsert(rows, { onConflict: 'code' });
    console.log(error ? `  [GAGAL] Alat Kerja: ${error.message}` : `  [OK] ${rows.length} Alat Kerja tersinkronisasi.`);
  }

  // 4. Materials
  const materials = Array.isArray(db.materials) ? db.materials : (Array.isArray(db.materialMasters) ? db.materialMasters : []);
  if (materials.length > 0) {
    console.log(`Menyinkronkan ${materials.length} Materials...`);
    const rows = materials.map(m => ({
      id: m.id,
      material_code: m.materialCode || m.code,
      material_name: m.materialName || m.name,
      category: m.category || 'OSP',
      specification: m.specification || '',
      unit: m.unit || 'unit',
      unit_price: Number(m.unitPrice || m.price || 0),
      minimum_stock: Number(m.minimumStock || 0),
      is_active: m.isActive !== false,
      created_at: m.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('material_masters').upsert(rows, { onConflict: 'material_code' });
    console.log(error ? `  [GAGAL] Material Masters: ${error.message}` : `  [OK] ${rows.length} Materials tersinkronisasi.`);
  }

  // 5. Vendors
  if (Array.isArray(db.vendors) && db.vendors.length > 0) {
    console.log(`Menyinkronkan ${db.vendors.length} Vendors...`);
    const rows = db.vendors.map(v => ({
      id: v.id,
      code: v.code,
      name: v.name,
      category: v.category || '',
      contact_person: v.contactPerson || '',
      phone: v.phone || '',
      email: v.email || '',
      address: v.address || '',
      status: v.status || 'ACTIVE',
      created_at: v.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('vendors').upsert(rows, { onConflict: 'code' });
    console.log(error ? `  [GAGAL] Vendors: ${error.message}` : `  [OK] ${rows.length} Vendors tersinkronisasi.`);
  }

  // 6. Warehouses
  if (Array.isArray(db.warehouses) && db.warehouses.length > 0) {
    console.log(`Menyinkronkan ${db.warehouses.length} Warehouses...`);
    const rows = db.warehouses.map(w => ({
      id: w.id,
      code: w.code,
      name: w.name,
      location: w.location || '',
      address: w.address || '',
      pic: w.pic || '',
      contact: w.contact || '',
      capacity: w.capacity ? Number(w.capacity) : null,
      type: w.type || '',
      status: w.status || 'ACTIVE',
      created_at: w.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('warehouses').upsert(rows, { onConflict: 'code' });
    console.log(error ? `  [GAGAL] Warehouses: ${error.message}` : `  [OK] ${rows.length} Warehouses tersinkronisasi.`);
  }

  // 7. Projects & Sub-items
  if (Array.isArray(db.projects) && db.projects.length > 0) {
    console.log(`Menyinkronkan ${db.projects.length} Projects...`);
    const projectRows = db.projects.map(p => ({
      id: p.id,
      project_name: p.projectName || p.name || '',
      customer: p.customer || '',
      project_type: p.projectType || p.type || '',
      region: p.region || p.location || '',
      project_code: p.projectCode || p.contractNo || '',
      start_date: p.startDate || null,
      end_date: p.endDate || p.targetDate || null,
      pic: p.pic || p.manager || '',
      status: p.status || 'PLANNING',
      scope: p.scope || '',
      route_notes: p.routeNotes || '',
      survey_route: p.surveyRoute || null,
      survey_validation: p.surveyValidation || null,
      survey_kml: p.surveyKml || null,
      permits: p.permits || [],
      boq_items: p.boqItems || [],
      commercial: p.commercial || { capex: 0, opex: 0, revenue: 0 },
      designator_items: p.designatorItems || [],
      daily_reports: p.dailyReports || {},
      evidences: p.evidences || [],
      issues: p.issues || [],
      created_at: p.createdAt || new Date().toISOString(),
    }));

    const { error: pErr } = await supabase.from('projects').upsert(projectRows, { onConflict: 'id' });
    console.log(pErr ? `  [GAGAL] Projects: ${pErr.message}` : `  [OK] ${projectRows.length} Projects tersinkronisasi.`);

    // Permits
    const allPermits = [];
    db.projects.forEach(p => {
      if (Array.isArray(p.permits)) {
        p.permits.forEach(pmt => {
          allPermits.push({
            id: pmt.id,
            project_id: p.id,
            site_id: pmt.siteId || 'SITE-01',
            category: pmt.category || 'PU Kota / Kab',
            status: pmt.status || 'Perizinan',
            progress_detail: pmt.progressDetail || '',
            target_date: pmt.targetDate ? pmt.targetDate.split('T')[0] : null,
            actual_date: pmt.actualDate ? pmt.actualDate.split('T')[0] : null,
            pic_name: pmt.picName || '',
            cost: Number(pmt.cost || 0),
            notes: pmt.notes || '',
            checklist: pmt.checklist || {},
          });
        });
      }
    });

    if (allPermits.length > 0) {
      const { error: pmtErr } = await supabase.from('project_permits').upsert(allPermits, { onConflict: 'id' });
      console.log(pmtErr ? `  [INFO] Project Permits: ${pmtErr.message}` : `  [OK] ${allPermits.length} Project Permits tersinkronisasi.`);
    }

    // Designator Items
    const allDesignators = [];
    db.projects.forEach(p => {
      if (Array.isArray(p.designatorItems)) {
        p.designatorItems.forEach(d => {
          allDesignators.push({
            id: d.id || `${p.id}-${d.idVolume || d.designator}`,
            project_id: p.id,
            id_volume: d.idVolume || 'VOL-01',
            kode_designator: d.kodeDesignator || d.designator || '',
            uraian_pekerjaan: d.uraianPekerjaan || d.namaDeskripsi || '',
            jenis: d.jenis || 'Galian',
            satuan: d.satuan || 'Meter',
            volume_target: Number(d.volumeTarget || 0),
            bobot_persen: Number(d.bobotPersen || 0),
            daily_volumes: d.dailyVolumes || {},
            daily_records: d.dailyRecords || {},
            change_history: d.changeHistory || [],
          });
        });
      }
    });

    if (allDesignators.length > 0) {
      const { error: dsgErr } = await supabase.from('project_designator_items').upsert(allDesignators, { onConflict: 'id' });
      console.log(dsgErr ? `  [INFO] Project Designator Items: ${dsgErr.message}` : `  [OK] ${allDesignators.length} Designator Items tersinkronisasi.`);
    }
  }

  console.log('\n=== SELESAI ===');
}

syncAll().catch(console.error);
