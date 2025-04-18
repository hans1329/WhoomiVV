const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://corswudbikzvzprlznrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnN3dWRiaWt6dnpwcmx6bnJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDU0ODk0NSwiZXhwIjoyMDYwMTI0OTQ1fQ.xZ5glpCe09Oe1RqwGcUMR-FbjE9Pfnz_VCELJJWvp-g';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumnToProfiles() {
  console.log('Starting column addition to profiles table...');

  try {
    // First, check if we can access the profiles table
    console.log('Checking if profiles table exists...');
    const { data: tableData, error: tableError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Error accessing profiles table:', tableError);
      return;
    }

    console.log('Profiles table exists, proceeding with column addition');
    
    // Try the direct table approach by reading the structure
    console.log('Checking current table structure...');
    const { data: structure, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'profiles' })
      .select('*');

    if (structureError) {
      console.log('Could not get table structure via RPC:', structureError);
      console.log('Will attempt alternative methods...');
    } else {
      console.log('Current table structure:', structure);
    }

    // Method 1: Try to add a record with the level field
    console.log('Attempting to add a record with level field...');
    const tempId = 'temp_' + Date.now();
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{ 
        id: tempId,
        username: 'migration_temp',
        level: 1 
      }]);
    
    if (insertError) {
      console.log('Insert approach failed:', insertError);
      
      // Method 2: Try to update an existing record
      console.log('Attempting to update an existing record...');
      if (tableData && tableData.length > 0) {
        const existingId = tableData[0].id;
        console.log('Found existing profile with ID:', existingId);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ level: 1 })
          .eq('id', existingId);
        
        if (updateError) {
          console.log('Update approach failed:', updateError);
        } else {
          console.log('Successfully updated profile with level field!');
        }
      } else {
        console.log('No existing profiles found to update');
      }
      
      // Method 3: Use the PostgreSQL REST API directly
      console.log('Attempting to use PostgreSQL REST API directly...');
      const pgRestResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        }
      });
      
      const pgRestResult = await pgRestResponse.json();
      console.log('PostgreSQL REST API test response:', pgRestResult);
      
      if (pgRestResponse.ok) {
        console.log('PostgreSQL REST API is accessible. Will try to modify table structure...');
        
        // Use PATCH to modify a record which might create the column
        if (pgRestResult && pgRestResult.length > 0) {
          const patchResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${pgRestResult[0].id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ level: 1 })
          });
          
          if (patchResponse.ok) {
            console.log('Successfully patched record with level field!');
          } else {
            console.log('Patch failed:', await patchResponse.text());
          }
        }
      }
    } else {
      console.log('Successfully added record with level field!');
      
      // Clean up the temporary record
      console.log('Cleaning up temporary record...');
      await supabase
        .from('profiles')
        .delete()
        .eq('id', tempId);
      
      console.log('Temporary record cleaned up');
    }
    
    // Final verification step
    console.log('Verifying if level column now exists...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('id, level')
      .limit(1);
      
    if (verifyError) {
      console.error('Error verifying level column:', verifyError);
    } else {
      console.log('Verification successful! Level column exists:', verifyData);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Execute the script
addColumnToProfiles(); 