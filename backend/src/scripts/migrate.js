import { pool, initializeDatabase } from "../config/db.js";

export async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log("Starting PostgreSQL schema migrations for JanSeva Connect...");
    await client.query("BEGIN");

    // 1. Departments table (shared across Member 1, 2, 3, 4)
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) UNIQUE,
        description TEXT,
        contact_email VARCHAR(255),
        website_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        eligibility TEXT,
        fees TEXT,
        application_steps JSONB DEFAULT '[]'::jsonb,
        documents JSONB DEFAULT '[]'::jsonb,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        category VARCHAR(100) NOT NULL,
        official_application_url VARCHAR(1000),
        official_source_url VARCHAR(1000),
        is_verified BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        current_version INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Service versions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_versions (
        id SERIAL PRIMARY KEY,
        service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        service_snapshot JSONB NOT NULL,
        source_url VARCHAR(1000),
        verified_at TIMESTAMP WITH TIME ZONE,
        updated_by VARCHAR(255) DEFAULT 'System Seed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Schemes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schemes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        objectives TEXT,
        benefits TEXT,
        category VARCHAR(100) NOT NULL,
        scheme_level VARCHAR(50) DEFAULT 'Central',
        state VARCHAR(100) DEFAULT 'All India',
        beneficiary_group VARCHAR(150),
        eligibility_description TEXT,
        documents JSONB DEFAULT '[]'::jsonb,
        application_steps JSONB DEFAULT '[]'::jsonb,
        responsible_department VARCHAR(255),
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        official_application_url VARCHAR(1000),
        source_url VARCHAR(1000),
        is_verified BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        last_verified_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Scheme eligibility rules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheme_eligibility_rules (
        id SERIAL PRIMARY KEY,
        scheme_id INTEGER NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
        rule_type VARCHAR(100) NOT NULL,
        operator VARCHAR(50) NOT NULL,
        expected_value JSONB NOT NULL,
        is_mandatory BOOLEAN DEFAULT true,
        description TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Contact messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'NEW',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
      CREATE INDEX IF NOT EXISTS idx_services_department_id ON services(department_id);
      CREATE INDEX IF NOT EXISTS idx_services_is_verified ON services(is_verified);
      CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

      CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
      CREATE INDEX IF NOT EXISTS idx_schemes_state ON schemes(state);
      CREATE INDEX IF NOT EXISTS idx_schemes_beneficiary_group ON schemes(beneficiary_group);
      CREATE INDEX IF NOT EXISTS idx_schemes_is_verified ON schemes(is_verified);
      CREATE INDEX IF NOT EXISTS idx_schemes_slug ON schemes(slug);
      CREATE INDEX IF NOT EXISTS idx_schemes_is_featured ON schemes(is_featured);

      CREATE INDEX IF NOT EXISTS idx_eligibility_rules_scheme_id ON scheme_eligibility_rules(scheme_id);
    `);

    await client.query("COMMIT");
    console.log("Migrations applied successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Allow direct CLI invocation
if (process.argv[1]?.endsWith("migrate.js")) {
  initializeDatabase()
    .then(() => runMigrations())
    .then(() => {
      console.log("Database migration complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration script error:", err);
      process.exit(1);
    });
}
