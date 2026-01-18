import { createClient } from '@supabase/supabase-js';
import { IPOData } from '../types';

// Credentials provided for this specific project
const DEFAULT_SUPABASE_URL = 'https://uobndwcuytmrjwgmoydg.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_8SHT78tR2rCRUV9L-yH1Sw_x6Hr2OfZ';

const getEnvVar = (key: string, fallback: string) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // process is not defined
  }
  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', DEFAULT_SUPABASE_URL);
const supabaseKey = getEnvVar('VITE_SUPABASE_KEY', DEFAULT_SUPABASE_KEY);

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- IPO Persistence Logic ---

// Fetch all IPOs stored in the database
export const fetchSavedIPOs = async (): Promise<IPOData[]> => {
  const { data, error } = await supabase
    .from('ipos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved IPOs:', error);
    return [];
  }

  // Map DB columns to frontend IPOData interface
  return data.map((item: any) => ({
    companyName: item.company_name,
    sector: item.sector,
    shareType: item.share_type,
    units: item.units,
    price: item.price,
    openingDate: item.opening_date,
    closingDate: item.closing_date,
    status: item.status,
    description: item.description,
    minUnits: item.min_units,
    maxUnits: item.max_units,
    rating: item.rating,
    projectDescription: item.project_description,
    risks: item.risks,
    sourceUrl: item.source_url
  }));
};

// Save or Update IPOs to the database (Upsert)
// Returns true if any NEW IPO was inserted
export const saveIPOsToDb = async (ipos: IPOData[]): Promise<boolean> => {
  let hasNewIPO = false;

  for (const ipo of ipos) {
    // We use company_name + share_type as a composite unique key conceptually.
    // In Supabase, you should set a UNIQUE constraint on (company_name, share_type) or just company_name.
    
    // Check if exists first to determine if it's new (for alerting)
    const { data: existing } = await supabase
      .from('ipos')
      .select('id')
      .eq('company_name', ipo.companyName)
      .eq('share_type', ipo.shareType)
      .single();

    if (!existing) {
      hasNewIPO = true;
    }

    const { error } = await supabase
      .from('ipos')
      .upsert({
        company_name: ipo.companyName,
        sector: ipo.sector,
        share_type: ipo.shareType,
        units: ipo.units,
        price: ipo.price,
        opening_date: ipo.openingDate,
        closing_date: ipo.closingDate,
        status: ipo.status,
        description: ipo.description,
        min_units: ipo.minUnits,
        max_units: ipo.maxUnits,
        rating: ipo.rating,
        project_description: ipo.projectDescription,
        risks: ipo.risks,
        updated_at: new Date().toISOString()
      }, { onConflict: 'company_name, share_type' });

    if (error) {
      console.error('Error saving IPO:', ipo.companyName, error);
    }
  }

  return hasNewIPO;
};


// --- Subscriber Logic ---

export const subscribeEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert([{ email }]);

    if (insertError) {
      if (insertError.code === '23505') { // Unique violation
        return { success: false, message: "This email is already subscribed." };
      }
      return { success: false, message: insertError.message };
    }

    return { success: true, message: "Successfully subscribed to IPO alerts!" };
  } catch (error: any) {
    console.error("Subscription error:", error);
    return { success: false, message: error.message || "Could not subscribe at this time." };
  }
};