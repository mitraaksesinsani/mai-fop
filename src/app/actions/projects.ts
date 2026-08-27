'use server';

import prisma from '@/lib/db';

export async function getProjects() {
  try {
    const dbProjects = await prisma.projects.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        project_requirements: {
          include: {
            material_masters: true
          }
        }
      }
    });

    // Map database structure to Frontend interface
    const projects = dbProjects.map(p => ({
      id: p.id,
      name: p.project_name || '',
      customer: p.customer || '',
      type: p.project_type || '',
      location: p.region || '',
      contractNo: p.project_code || '',
      startDate: p.start_date ? p.start_date.toISOString().split('T')[0] : undefined,
      targetDate: p.end_date ? p.end_date.toISOString().split('T')[0] : undefined,
      manager: p.pic || '',
      status: p.status || '',
      
      // BOQ mapping
      boqItems: p.project_requirements.map(req => ({
        id: req.id,
        name: req.material_masters?.material_name || '',
        quantity: req.estimated_qty || 0,
        unit: req.material_masters?.unit || 'unit',
        price: Number(req.material_masters?.unit_price || 0)
      })),
      
      // Commercial defaults (since they don't exist in DB yet)
      commercial: {
        capex: 0,
        opex: 0,
        revenue: 0
      }
    }));

    return { success: true, data: projects };
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return { success: false, error: 'Failed to fetch projects' };
  }
}

export async function deleteProjectRecord(id: string) {
  try {
    await prisma.projects.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { success: false, error: 'Failed to delete project' };
  }
}

export async function addProjectRecord(data: any) {
  try {
    const newProject = await prisma.projects.create({
      data: {
        id: data.id,
        project_name: data.name,
        customer: data.customer,
        region: data.location,
        start_date: data.startDate ? new Date(data.startDate) : null,
        end_date: data.targetDate ? new Date(data.targetDate) : null,
        pic: data.manager,
        status: data.status,
        project_type: data.type,
        project_code: data.contractNo,
      }
    });

    return { success: true, data: newProject };
  } catch (error) {
    console.error('Failed to create project:', error);
    return { success: false, error: 'Failed to create project' };
  }
}

export async function updateProjectRecord(id: string, data: any) {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.project_name = data.name;
    if (data.customer !== undefined) updateData.customer = data.customer;
    if (data.location !== undefined) updateData.region = data.location;
    if (data.startDate !== undefined) updateData.start_date = data.startDate ? new Date(data.startDate) : null;
    if (data.targetDate !== undefined) updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    if (data.manager !== undefined) updateData.pic = data.manager;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.type !== undefined) updateData.project_type = data.type;
    if (data.contractNo !== undefined) updateData.project_code = data.contractNo;

    const updatedProject = await prisma.projects.update({
      where: { id },
      data: updateData
    });

    // Handle BOQ Items if provided
    if (data.boqItems !== undefined) {
      const { v4: uuidv4 } = require('uuid');
      
      // Delete existing requirements for this project
      await prisma.project_requirements.deleteMany({
        where: { project_id: id }
      });
      
      // Add new items
      for (const item of data.boqItems) {
        // Find existing material or create a new one to get the ID
        let material = await prisma.material_masters.findFirst({
          where: { material_name: item.name }
        });
        
        if (!material) {
          material = await prisma.material_masters.create({
            data: {
              id: uuidv4(),
              material_code: `MAT-${Math.floor(Math.random() * 90000) + 10000}`,
              material_name: item.name,
              category: 'OTHER',
              unit: item.unit,
              unit_price: item.price,
              is_active: true
            }
          });
        }
        
        // Add requirement
        await prisma.project_requirements.create({
          data: {
            id: uuidv4(),
            project_id: id,
            material_id: material.id,
            estimated_qty: item.quantity,
          }
        });
      }
    }

    return { success: true, data: updatedProject };
  } catch (error) {
    console.error('Failed to update project:', error);
    return { success: false, error: 'Failed to update project' };
  }
}

export async function getMaterials() {
  try {
    const materials = await prisma.material_masters.findMany({
      orderBy: { material_name: 'asc' }
    });
    return { success: true, data: materials };
  } catch (error) {
    console.error('Failed to fetch materials:', error);
    return { success: false, error: 'Failed to fetch materials' };
  }
}
