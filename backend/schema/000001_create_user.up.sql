CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       pass_hash VARCHAR(255) NOT NULL,
                       fingerprint VARCHAR(255) NOT NULL,
                       ip VARCHAR(255) NOT NULL,
                       sub_level SMALLINT NOT NULL DEFAULT 0 CHECK (sub_level BETWEEN 0 AND 2),
                       user_type SMALLINT NOT NULL DEFAULT 0 CHECK (user_type BETWEEN 0 AND 2)

);
CREATE TABLE stats_raw (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    essay_avg_rate FLOAT[],
    problematic_themes TEXT[],
    theme1 INTEGER DEFAULT 0,
    theme2 INTEGER DEFAULT 0,
    theme3 INTEGER DEFAULT 0,
    theme4 INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stats_raw_user_id ON stats_raw(user_id);
CREATE INDEX idx_stats_raw_problematic_themes ON stats_raw USING GIN(problematic_themes);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stats_raw_updated_at
    BEFORE UPDATE ON stats_raw
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE stats_analysis (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    essay_avg_rate FLOAT NOT NULL DEFAULT 0.0,
    problematic_themes TEXT NOT NULL DEFAULT '',
    most_clickable_theme TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stats_analysis_user_id ON stats_analysis(user_id);
CREATE INDEX idx_stats_analysis_essay_rate ON stats_analysis(essay_avg_rate);
CREATE INDEX idx_stats_analysis_most_clickable ON stats_analysis(most_clickable_theme);

CREATE OR REPLACE FUNCTION update_stats_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stats_analysis_updated_at
    BEFORE UPDATE ON stats_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_analysis_updated_at();