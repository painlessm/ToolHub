CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_usage (
    id SERIAL PRIMARY KEY,
    tool_slug VARCHAR(100) NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],
    logo_url VARCHAR(500),
    pricing VARCHAR(20) DEFAULT 'free',
    votes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_clicks (
    id SERIAL PRIMARY KEY,
    position VARCHAR(50),
    tool_slug VARCHAR(100),
    clicked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tool_usage_slug ON tool_usage(tool_slug);
CREATE INDEX idx_tool_usage_date ON tool_usage(used_at);
CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_featured ON ai_tools(is_featured);
