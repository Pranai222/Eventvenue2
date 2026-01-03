-- Run this SQL manually in MySQL Workbench or command line
-- mysql -u root -p eventvenue_db < add_stripe_tables.sql

USE eventvenue_db;

-- Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount_usd DECIMAL(10, 2),
    points_amount INT NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    stripe_payout_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_user_id (user_id),
    KEY idx_transaction_type (transaction_type),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
);

-- Credit Requests Table
CREATE TABLE IF NOT EXISTS credit_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    points_requested INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    admin_id BIGINT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    KEY idx_user_id (user_id),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
);

-- Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    points_amount INT NOT NULL,
    amount_usd DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    stripe_payout_id VARCHAR(255),
    admin_id BIGINT,
    admin_notes TEXT,
    requires_approval BOOLEAN DEFAULT FALSE,
    card_last4 VARCHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    KEY idx_user_id (user_id),
    KEY idx_status (status),
    KEY idx_requires_approval (requires_approval),
    KEY idx_created_at (created_at)
);

-- Update system_settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES 
('points_to_dollar_ratio', '0.01', 'Conversion ratio: 100 points = $1 (0.01 means divide points by 100)');

INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES 
('platform_commission_percentage', '5.0', 'Platform commission percentage on transactions');

SELECT 'Stripe tables created successfully!' AS status;
