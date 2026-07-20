const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function incrementGrills() {
  const { data, error } = await supabase.rpc("increment_grills");

  if (error) {
    throw new Error(`Failed to increment grills: ${error.message}`);
  }

  return data;
}

async function getTotalGrills() {
  const { data, error } = await supabase
    .from("stats")
    .select("grills")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(`Failed to fetch total grills: ${error.message}`);
  }

  return data.grills;
}

module.exports = {
  incrementGrills,
  getTotalGrills,
};
