import { supabase } from './supabase';
import { deletePhoto } from './photoStorage';

type HeightResult = {
  id: string;
  name: string;
  photoUri: string | null;
  heightCm: number | null;
  explanation: string | null;
  method: string | null;
  date: string;
};

type DatabaseRow = {
  id: string;
  name: string;
  photo_uri: string | null;
  height_cm: number | null;
  explanation: string | null;
  method: string | null;
  date: string;
};

export async function listResults(): Promise<HeightResult[]> {
  try {
    const { data, error } = await supabase
      .from('height_results')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase error in listResults:', error);
      // Return empty array instead of throwing to prevent app crash on server error
      return [];
    }
    if (!data) return [];

    return data.map((row: DatabaseRow) => ({
      id: row.id,
      name: row.name,
      photoUri: row.photo_uri,
      heightCm: row.height_cm,
      explanation: row.explanation,
      method: row.method,
      date: row.date,
    }));
  } catch (error) {
    console.error('Error in listResults:', error);
    return [];
  }
}

export async function insertPlaceholder({ name, photoUri }: { name: string; photoUri?: string }): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('height_results')
    .insert({
      name,
      photo_uri: photoUri ?? null,
      user_id: user?.id,
      height_cm: 0, // Use 0 as placeholder instead of null
      explanation: null,
      method: null,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to insert placeholder: ${error.message}`);
  return data.id;
}

export async function patchResult(id: string, patch: {
  heightCm?: number;
  explanation?: string;
  method?: string;
}): Promise<void> {
  const updateData: any = {};

  if (patch.heightCm !== undefined) updateData.height_cm = patch.heightCm;
  if (patch.explanation !== undefined) updateData.explanation = patch.explanation;
  if (patch.method !== undefined) updateData.method = patch.method;

  const { error } = await supabase
    .from('height_results')
    .update(updateData)
    .eq('id', id);

  if (error) throw new Error(`Failed to update result: ${error.message}`);
}

export async function updateName(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('height_results')
    .update({ name })
    .eq('id', id);

  if (error) throw new Error(`Failed to update name: ${error.message}`);
}

export async function deleteResult(id: string): Promise<void> {
  // First get the result to check if it has a photo
  const result = await getById(id);

  const { error } = await supabase
    .from('height_results')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete result: ${error.message}`);

  // Delete the photo if it exists
  if (result?.photoUri) {
    await deletePhoto(result.photoUri);
  }
}

export async function getById(id: string): Promise<HeightResult | null> {
  const { data, error } = await supabase
    .from('height_results')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch result: ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    photoUri: data.photo_uri,
    heightCm: data.height_cm,
    explanation: data.explanation,
    method: data.method,
    date: data.date,
  };
}