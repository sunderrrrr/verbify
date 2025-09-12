CREATE TABLE plans (
                       id SERIAL PRIMARY KEY,
                       name TEXT NOT NULL UNIQUE,
                       essay_limit INT NOT NULL DEFAULT 0,
                       chat_limit INT NOT NULL DEFAULT 0,
                       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Примеры тарифов
INSERT INTO plans (name, essay_limit,   chat_limit)
VALUES
    ('free', 5, 10),
    ('pro', 10, 50),
    ('premium', 100, 500);

CREATE TABLE subscriptions (
                               id SERIAL PRIMARY KEY,
                               user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               plan_id INT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
                               payment_id TEXT, -- id платежа из Юкассы
                               status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'canceled')),
                               start_at TIMESTAMPTZ,
                               end_at TIMESTAMPTZ,
                               created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                               updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
