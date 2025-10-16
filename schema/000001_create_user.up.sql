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