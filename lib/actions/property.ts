'use server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { propertySchema } from '@/lib/validation/property';
import { ActionResponse, Property } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createPropertyAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse<Property>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        'Database connection not configured. Supabase credentials (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are required to persist property records.',
    };
  }

  const rawData = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    country: (formData.get('country') as string) || 'India',
    timezone: (formData.get('timezone') as string) || 'Asia/Kolkata',
    currency: (formData.get('currency') as string) || 'INR',
    check_in_time: (formData.get('check_in_time') as string) || '14:00',
    check_out_time: (formData.get('check_out_time') as string) || '11:00',
    contact_email: formData.get('contact_email') as string,
    contact_phone: formData.get('contact_phone') as string,
  };

  const validation = propertySchema.safeParse(rawData);
  if (!validation.success) {
    const errorMap: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]?.toString() || 'form';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed. Please verify the property information.',
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
        message: 'Authentication required. Please sign in to create a property.',
      };
    }

    // Resolve or auto-link organization
    let organizationId = (formData.get('organization_id') as string) || null;
    if (!organizationId) {
      // Find user's existing organization or create default
      const { data: userOrgs } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1);

      if (userOrgs && userOrgs.length > 0) {
        organizationId = userOrgs[0].organization_id;
      } else {
        // Auto-provision default organization for this user
        const orgSlug = `${validation.data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
        const { data: newOrg } = await supabase
          .from('organizations')
          .insert({
            name: `${validation.data.name} Hospitality`,
            slug: orgSlug,
            billing_email: validation.data.contact_email || user.email,
            subscription_tier: 'starter',
          })
          .select()
          .single();

        if (newOrg) {
          organizationId = newOrg.id;
          await supabase.from('organization_members').insert({
            organization_id: newOrg.id,
            user_id: user.id,
            role: 'owner',
          });
        }
      }
    }

    // 1. Insert property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .insert({
        organization_id: organizationId,
        name: validation.data.name,
        address: validation.data.address,
        city: validation.data.city,
        state: validation.data.state,
        country: validation.data.country,
        timezone: validation.data.timezone,
        currency: validation.data.currency,
        check_in_time: validation.data.check_in_time,
        check_out_time: validation.data.check_out_time,
        contact_email: validation.data.contact_email,
        contact_phone: validation.data.contact_phone,
      })
      .select()
      .single();

    if (propError || !property) {
      return {
        success: false,
        message: propError?.message || 'Failed to insert property into the database.',
      };
    }

    // 2. Insert owner membership in property_members
    const { error: memberError } = await supabase
      .from('property_members')
      .insert({
        property_id: property.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) {
      // Clean up orphaned property if membership creation failed
      await supabase.from('properties').delete().eq('id', property.id);
      return {
        success: false,
        message: `Failed to register property owner membership: ${memberError.message}`,
      };
    }

    // 3. Record audit log event
    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      property_id: property.id,
      user_id: user.id,
      action: 'property.created',
      entity_type: 'property',
      entity_id: property.id,
      details: { name: property.name, city: property.city, currency: property.currency },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings/property');

    return {
      success: true,
      message: `Property "${property.name}" created successfully with Owner privileges.`,
      data: property as Property,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'An unexpected database error occurred.';
    return {
      success: false,
      message: errorMsg,
    };
  }
}

export async function updatePropertyAction(
  propertyId: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse<Property>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials are not configured.',
    };
  }

  const rawData = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    country: (formData.get('country') as string) || 'India',
    timezone: (formData.get('timezone') as string) || 'Asia/Kolkata',
    currency: (formData.get('currency') as string) || 'INR',
    check_in_time: (formData.get('check_in_time') as string) || '14:00',
    check_out_time: (formData.get('check_out_time') as string) || '11:00',
    contact_email: formData.get('contact_email') as string,
    contact_phone: formData.get('contact_phone') as string,
  };

  const validation = propertySchema.safeParse(rawData);
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
      .from('properties')
      .update({
        name: validation.data.name,
        address: validation.data.address,
        city: validation.data.city,
        state: validation.data.state,
        country: validation.data.country,
        timezone: validation.data.timezone,
        currency: validation.data.currency,
        check_in_time: validation.data.check_in_time,
        check_out_time: validation.data.check_out_time,
        contact_email: validation.data.contact_email,
        contact_phone: validation.data.contact_phone,
      })
      .eq('id', propertyId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: error.message || 'Failed to update property details in database.',
      };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings/property');

    return {
      success: true,
      message: 'Property details updated successfully.',
      data: updated as Property,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Database error during update.';
    return {
      success: false,
      message: errorMsg,
    };
  }
}

export async function getUserProperties(): Promise<{
  properties: (Property & { role?: string })[];
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      properties: [],
      error: 'Supabase credentials not configured in environment.',
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { properties: [] };
    }

    const { data, error } = await supabase
      .from('property_members')
      .select(`
        role,
        property:properties (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      return { properties: [], error: error.message };
    }

    interface MemberWithProperty {
      role: string;
      property: Property | null;
    }

    const memberRows = (data as unknown as MemberWithProperty[]) || [];
    const list = memberRows
      .map((item) => ({
        ...(item.property as Property),
        role: item.role,
      }))
      .filter((p) => p && p.id);

    return { properties: list };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch properties.';
    return { properties: [], error: errorMsg };
  }
}

export async function getPropertyById(propertyId: string): Promise<Property | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) return null;
    return data as Property;
  } catch {
    return null;
  }
}
