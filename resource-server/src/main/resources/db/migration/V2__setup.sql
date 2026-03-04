
--- Trade Vault Authentication Model

CREATE TABLE IF NOT EXISTS identities (
      identity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      login_id VARCHAR UNIQUE NOT NULL, -- profile_id
      password_hash TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_login TIMESTAMP
);

--- Private Banking Model and extensions

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_id UUID UNIQUE NOT NULL REFERENCES identities(identity_id),
    profile_id VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR NOT NULL,
    authorities VARCHAR[] NOT NULL DEFAULT ARRAY['USER']::VARCHAR[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
       id SERIAL PRIMARY KEY,
       shipment_number VARCHAR REFERENCES shipments(shipment_number) ON DELETE CASCADE,
       investor_profile_id VARCHAR NOT NULL, -- PB profile_id
       investor_account_id VARCHAR REFERENCES account(account_id),

       amount NUMERIC(19,4) NOT NULL,
       status VARCHAR DEFAULT 'PENDING'
           CHECK (status IN ('PENDING','CONFIRMED','REJECTED','PAID_OUT')),

       created_at TIMESTAMP DEFAULT NOW()
);


--- CIB Model extension

CREATE TABLE IF NOT EXISTS companies (
     id SERIAL PRIMARY KEY,
     company_profile_id VARCHAR UNIQUE NOT NULL,
     company_name VARCHAR NOT NULL,
     company_owner VARCHAR NOT NULL,
     registration_number VARCHAR,
     tax_number VARCHAR,
     email_address VARCHAR,
     phone_number VARCHAR,
     created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_financials (
      id SERIAL PRIMARY KEY,
      company_id INTEGER UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
      current_balance NUMERIC(19,4) DEFAULT 0.0000,
      available_balance NUMERIC(19,4) DEFAULT 0.0000,
      last_updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_funding (
    id SERIAL PRIMARY KEY,

    shipment_number VARCHAR UNIQUE
        REFERENCES shipments(shipment_number) ON DELETE CASCADE,

    company_profile_id VARCHAR REFERENCES companies(company_profile_id),

    funding_required NUMERIC(19,4) DEFAULT 0.0000,
    funding_raised NUMERIC(19,4) DEFAULT 0.0000,

    funding_status VARCHAR DEFAULT 'NOT_REQUIRED'
        CHECK (funding_status IN ('NOT_REQUIRED','OPEN','FUNDED','CLOSED')),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);





