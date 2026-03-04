ALTER DATABASE trade_vault OWNER TO sgaxamabhande;

CREATE TABLE IF NOT EXISTS account(
    id SERIAL PRIMARY KEY,
    account_id VARCHAR UNIQUE NOT NULL,
    account_number VARCHAR,
    account_name VARCHAR,
    reference_name VARCHAR,
    product_name VARCHAR,
    kyc_compliant BOOLEAN,
    profile_id VARCHAR NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS  account_information(
    id SERIAL PRIMARY KEY,
    account_id VARCHAR references account(account_id) ON DELETE CASCADE UNIQUE ,
    current_balance NUMERIC(19,4) DEFAULT 0.0000,
    available_balance NUMERIC(19,4) DEFAULT 0.0000,
    currency VARCHAR(3),
    last_updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions(
    id SERIAL PRIMARY KEY,
    account_id VARCHAR references account(account_id) ON DELETE CASCADE,
    type VARCHAR,
    transaction_type VARCHAR,
    status VARCHAR,
    description VARCHAR,
    card_number VARCHAR,
    posting_date DATE,
    value_date DATE,
    action_date DATE,
    transaction_date DATE,
    amount NUMERIC(19,4) DEFAULT 0.0000,
    running_balance NUMERIC(19,4) DEFAULT 0.0000,
    uuid VARCHAR
);



CREATE TABLE IF NOT EXISTS beneficiary (
    id SERIAL PRIMARY KEY,
    beneficiary_id VARCHAR UNIQUE,
    account_number VARCHAR,
    code VARCHAR,
    bank VARCHAR,
    beneficiary_name VARCHAR,
    last_payment_amount NUMERIC(19,4),
    last_payment_date DATE,
    cell_no VARCHAR,
    email_address VARCHAR,
    name VARCHAR,
    reference_account_number VARCHAR,
    reference_name VARCHAR,
    category_id VARCHAR,
    profile_id VARCHAR NOT NULL,
    faster_payment_allowed BOOLEAN,
    created_at TIMESTAMP
);


CREATE TABLE IF NOT EXISTS shipments (
     id SERIAL PRIMARY KEY,
     shipment_number VARCHAR UNIQUE NOT NULL,
     indent_number VARCHAR,
     ifb_reference VARCHAR,
     customer_name VARCHAR,
     buyer_full_name VARCHAR,
     supplier_name VARCHAR,
     port_of_load VARCHAR,
     port_of_discharge VARCHAR,
     delivery_address VARCHAR,
     ship_on_board TIMESTAMP,
     eta TIMESTAMP,
     delivery_date TIMESTAMP,
     mv_start_date TIMESTAMP,
     mv_end_date TIMESTAMP,
     currency_code VARCHAR(3),
     order_value NUMERIC(19,4) DEFAULT 0.0000,
     shipped_value NUMERIC(19,4) DEFAULT 0.0000,
     paid_amount NUMERIC(19,4) DEFAULT 0.0000,
     unit_price NUMERIC(19,4) DEFAULT 0.0000,
     estimated_landed_cost NUMERIC(19,4) DEFAULT 0.0000,
     incoterm VARCHAR,
     status VARCHAR,
     movement_type VARCHAR,
     shipment_mode VARCHAR,
     vessel_name VARCHAR,
     container_number VARCHAR,
     container_count INTEGER DEFAULT 1,
     container_type VARCHAR,
     load_type VARCHAR,
     pallets INTEGER DEFAULT 0,
     cartons INTEGER DEFAULT 0,
     item_reference VARCHAR,
     quantity INTEGER DEFAULT 0,
     description TEXT,
     delivery_contact VARCHAR,
     delivery_month VARCHAR,
     delivery_year VARCHAR,
     created_at TIMESTAMP
);

