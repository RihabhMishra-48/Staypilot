'use server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { roomTypeSchema, roomSchema, updateRoomStatusSchema } from '@/lib/validation/room';
import { ActionResponse, Room, RoomType, RoomInventoryMetrics, OperationalStatus } from '@/types';
import { revalidatePath } from 'next/cache';

// ==============================================================================
// 1. Room Type Server Actions
// ==============================================================================

export async function createRoomTypeAction(
  prevState: ActionResponse<RoomType> | null,
  formData: FormData
): Promise<ActionResponse<RoomType>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials not configured. Please configure .env.local to persist room types.',
    };
  }

  const amenitiesRaw = formData.get('amenities');
  let amenities: string[] = [];
  if (typeof amenitiesRaw === 'string' && amenitiesRaw.trim().length > 0) {
    try {
      amenities = JSON.parse(amenitiesRaw);
    } catch {
      amenities = amenitiesRaw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  const rawData = {
    property_id: formData.get('property_id') as string,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    max_adults: formData.get('max_adults'),
    max_children: formData.get('max_children') || 0,
    bed_configuration: (formData.get('bed_configuration') as string) || null,
    base_rate: formData.get('base_rate'),
    amenities,
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
  };

  const validation = roomTypeSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMap: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]?.toString() || 'form';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors: errorMap,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: 'Authentication required. Please sign in to create a room type.',
      };
    }

    const { data: created, error } = await supabase
      .from('room_types')
      .insert({
        property_id: validation.data.property_id,
        name: validation.data.name,
        description: validation.data.description,
        max_adults: validation.data.max_adults,
        max_children: validation.data.max_children,
        bed_configuration: validation.data.bed_configuration,
        base_rate: validation.data.base_rate,
        amenities: validation.data.amenities,
        is_active: validation.data.is_active,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          message: `A room type named "${validation.data.name}" already exists for this property.`,
          errors: { name: ['Room type name must be unique within the property'] },
        };
      }
      return {
        success: false,
        message: error.message || 'Failed to create room type in database.',
      };
    }

    revalidatePath('/dashboard/rooms');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Room type "${created.name}" created successfully.`,
      data: created as RoomType,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error during room type creation.';
    return { success: false, message: msg };
  }
}

export async function updateRoomTypeAction(
  roomTypeId: string,
  prevState: ActionResponse<RoomType> | null,
  formData: FormData
): Promise<ActionResponse<RoomType>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials not configured in environment.',
    };
  }

  const amenitiesRaw = formData.get('amenities');
  let amenities: string[] = [];
  if (typeof amenitiesRaw === 'string' && amenitiesRaw.trim().length > 0) {
    try {
      amenities = JSON.parse(amenitiesRaw);
    } catch {
      amenities = amenitiesRaw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  const rawData = {
    property_id: formData.get('property_id') as string,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    max_adults: formData.get('max_adults'),
    max_children: formData.get('max_children') || 0,
    bed_configuration: (formData.get('bed_configuration') as string) || null,
    base_rate: formData.get('base_rate'),
    amenities,
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
  };

  const validation = roomTypeSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMap: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]?.toString() || 'form';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed. Please correct the invalid inputs.',
      errors: errorMap,
    };
  }

  try {
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from('room_types')
      .update({
        name: validation.data.name,
        description: validation.data.description,
        max_adults: validation.data.max_adults,
        max_children: validation.data.max_children,
        bed_configuration: validation.data.bed_configuration,
        base_rate: validation.data.base_rate,
        amenities: validation.data.amenities,
        is_active: validation.data.is_active,
      })
      .eq('id', roomTypeId)
      .eq('property_id', validation.data.property_id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          message: `Another room type with the name "${validation.data.name}" already exists in this property.`,
          errors: { name: ['Room type name must be unique within the property'] },
        };
      }
      return {
        success: false,
        message: error.message || 'Failed to update room type in database.',
      };
    }

    revalidatePath('/dashboard/rooms');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Room type "${updated.name}" updated successfully.`,
      data: updated as RoomType,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error during update.';
    return { success: false, message: msg };
  }
}

export async function getRoomTypes(propertyId: string): Promise<{
  roomTypes: RoomType[];
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { roomTypes: [] };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });

    if (error) {
      return { roomTypes: [], error: error.message };
    }

    return { roomTypes: (data as RoomType[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve room types.';
    return { roomTypes: [], error: msg };
  }
}

// ==============================================================================
// 2. Physical Room Server Actions
// ==============================================================================

export async function createRoomAction(
  prevState: ActionResponse<Room> | null,
  formData: FormData
): Promise<ActionResponse<Room>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials not configured in environment.',
    };
  }

  const rawData = {
    property_id: formData.get('property_id') as string,
    room_type_id: formData.get('room_type_id') as string,
    room_number: formData.get('room_number') as string,
    floor: (formData.get('floor') as string) || null,
    operational_status: (formData.get('operational_status') as string) || 'available',
    notes: (formData.get('notes') as string) || null,
    is_archived: formData.get('is_archived') === 'true',
  };

  const validation = roomSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMap: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]?.toString() || 'form';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed. Please verify room parameters.',
      errors: errorMap,
    };
  }

  try {
    const supabase = await createClient();

    // Verify room_type belongs to this property
    const { data: validRoomType, error: typeCheckError } = await supabase
      .from('room_types')
      .select('id')
      .eq('id', validation.data.room_type_id)
      .eq('property_id', validation.data.property_id)
      .single();

    if (typeCheckError || !validRoomType) {
      return {
        success: false,
        message: 'The selected room type does not exist in this property.',
        errors: { room_type_id: ['Invalid room type selection for this property'] },
      };
    }

    const { data: created, error } = await supabase
      .from('rooms')
      .insert({
        property_id: validation.data.property_id,
        room_type_id: validation.data.room_type_id,
        room_number: validation.data.room_number,
        floor: validation.data.floor,
        operational_status: validation.data.operational_status,
        notes: validation.data.notes,
        is_archived: validation.data.is_archived,
      })
      .select('*, room_type:room_types(*)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          message: `Room "${validation.data.room_number}" already exists in this property.`,
          errors: { room_number: ['Room number must be unique within the property'] },
        };
      }
      return {
        success: false,
        message: error.message || 'Failed to create room in database.',
      };
    }

    revalidatePath('/dashboard/rooms');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Room "${created.room_number}" registered successfully.`,
      data: created as Room,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error during room creation.';
    return { success: false, message: msg };
  }
}

export async function updateRoomAction(
  roomId: string,
  prevState: ActionResponse<Room> | null,
  formData: FormData
): Promise<ActionResponse<Room>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials not configured in environment.',
    };
  }

  const rawData = {
    property_id: formData.get('property_id') as string,
    room_type_id: formData.get('room_type_id') as string,
    room_number: formData.get('room_number') as string,
    floor: (formData.get('floor') as string) || null,
    operational_status: (formData.get('operational_status') as string) || 'available',
    notes: (formData.get('notes') as string) || null,
    is_archived: formData.get('is_archived') === 'true',
  };

  const validation = roomSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMap: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]?.toString() || 'form';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed. Please correct the invalid fields.',
      errors: errorMap,
    };
  }

  try {
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from('rooms')
      .update({
        room_type_id: validation.data.room_type_id,
        room_number: validation.data.room_number,
        floor: validation.data.floor,
        operational_status: validation.data.operational_status,
        notes: validation.data.notes,
        is_archived: validation.data.is_archived,
      })
      .eq('id', roomId)
      .eq('property_id', validation.data.property_id)
      .select('*, room_type:room_types(*)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          message: `Another room with number "${validation.data.room_number}" already exists in this property.`,
          errors: { room_number: ['Room number must be unique within the property'] },
        };
      }
      return {
        success: false,
        message: error.message || 'Failed to update room in database.',
      };
    }

    revalidatePath('/dashboard/rooms');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: `Room "${updated.room_number}" updated successfully.`,
      data: updated as Room,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error during room update.';
    return { success: false, message: msg };
  }
}

export async function updateRoomStatusAction(
  prevState: ActionResponse<Room> | null,
  formData: FormData
): Promise<ActionResponse<Room>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials not configured in environment.',
    };
  }

  const rawData = {
    property_id: formData.get('property_id') as string,
    room_id: formData.get('room_id') as string,
    operational_status: formData.get('operational_status') as string,
    notes: (formData.get('notes') as string) || null,
  };

  const validation = updateRoomStatusSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: 'Invalid status update parameters.',
    };
  }

  try {
    const supabase = await createClient();

    const updatePayload: Record<string, unknown> = {
      operational_status: validation.data.operational_status,
    };
    if (validation.data.notes !== undefined) {
      updatePayload.notes = validation.data.notes;
    }

    const { data: updated, error } = await supabase
      .from('rooms')
      .update(updatePayload)
      .eq('id', validation.data.room_id)
      .eq('property_id', validation.data.property_id)
      .select('*, room_type:room_types(*)')
      .single();

    if (error) {
      return {
        success: false,
        message: error.message || 'Failed to update operational status in database.',
      };
    }

    revalidatePath('/dashboard/rooms');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard');

    // Log operational status change in audit logs
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      property_id: validation.data.property_id,
      user_id: user?.id || null,
      action: 'room.status_changed',
      entity_type: 'room',
      entity_id: validation.data.room_id,
      details: {
        new_status: validation.data.operational_status,
        notes: validation.data.notes,
        room_number: (updated as Room).room_number,
      },
    });

    return {
      success: true,
      message: `Room status changed to "${validation.data.operational_status}".`,
      data: updated as Room,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error during status update.';
    return { success: false, message: msg };
  }
}

export async function archiveRoomAction(
  roomId: string,
  propertyId: string,
  archiveState: boolean = true
): Promise<ActionResponse<Room>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials not configured.',
    };
  }

  try {
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from('rooms')
      .update({ is_archived: archiveState })
      .eq('id', roomId)
      .eq('property_id', propertyId)
      .select('*, room_type:room_types(*)')
      .single();

    if (error) {
      return {
        success: false,
        message: error.message || 'Failed to update room archive status.',
      };
    }

    revalidatePath('/dashboard/rooms');
    revalidatePath('/dashboard/calendar');
    revalidatePath('/dashboard');

    // Log archival event
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      property_id: propertyId,
      user_id: user?.id || null,
      action: archiveState ? 'room.archived' : 'room.restored',
      entity_type: 'room',
      entity_id: roomId,
      details: {
        room_number: (updated as Room).room_number,
        is_archived: archiveState,
      },
    });

    return {
      success: true,
      message: archiveState
        ? `Room "${updated.room_number}" archived from active inventory.`
        : `Room "${updated.room_number}" restored to active inventory.`,
      data: updated as Room,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error modifying room archive status.';
    return { success: false, message: msg };
  }
}

export async function getRooms(
  propertyId: string,
  filters?: {
    search?: string;
    roomTypeId?: string;
    status?: OperationalStatus | 'all';
    includeArchived?: boolean;
  }
): Promise<{
  rooms: Room[];
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { rooms: [] };
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from('rooms')
      .select(`
        *,
        room_type:room_types (*)
      `)
      .eq('property_id', propertyId);

    if (!filters?.includeArchived) {
      query = query.eq('is_archived', false);
    }

    if (filters?.roomTypeId && filters.roomTypeId !== 'all') {
      query = query.eq('room_type_id', filters.roomTypeId);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('operational_status', filters.status);
    }

    if (filters?.search && filters.search.trim().length > 0) {
      query = query.ilike('room_number', `%${filters.search.trim()}%`);
    }

    query = query.order('room_number', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return { rooms: [], error: error.message };
    }

    return { rooms: (data as Room[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve rooms from database.';
    return { rooms: [], error: msg };
  }
}

export async function getRoomInventoryMetrics(propertyId: string): Promise<RoomInventoryMetrics> {
  const fallback: RoomInventoryMetrics = {
    totalRooms: 0,
    availableRooms: 0,
    cleaningRooms: 0,
    dirtyRooms: 0,
    maintenanceRooms: 0,
    outOfServiceRooms: 0,
    totalRoomTypes: 0,
    activeRoomTypes: 0,
  };

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  try {
    const supabase = await createClient();

    // 1. Fetch physical rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('operational_status, is_archived')
      .eq('property_id', propertyId)
      .eq('is_archived', false);

    // 2. Fetch room types
    const { data: types, error: typesError } = await supabase
      .from('room_types')
      .select('is_active')
      .eq('property_id', propertyId);

    if (roomsError || typesError || !rooms || !types) {
      return fallback;
    }

    const available = rooms.filter((r) => r.operational_status === 'available').length;
    const cleaning = rooms.filter((r) => r.operational_status === 'cleaning').length;
    const dirty = rooms.filter((r) => r.operational_status === 'dirty').length;
    const maintenance = rooms.filter((r) => r.operational_status === 'maintenance').length;
    const outOfService = rooms.filter((r) => r.operational_status === 'out_of_service').length;

    const totalTypes = types.length;
    const activeTypes = types.filter((t) => t.is_active).length;

    return {
      totalRooms: rooms.length,
      availableRooms: available,
      cleaningRooms: cleaning,
      dirtyRooms: dirty,
      maintenanceRooms: maintenance,
      outOfServiceRooms: outOfService,
      totalRoomTypes: totalTypes,
      activeRoomTypes: activeTypes,
    };
  } catch {
    return fallback;
  }
}
