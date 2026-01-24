CREATE TABLE plans (
                       id SERIAL PRIMARY KEY,
                       name TEXT NOT NULL UNIQUE,
                       essay_limit INT NOT NULL DEFAULT 0,
                       chat_limit INT NOT NULL DEFAULT 0,
                       price INT DEFAULT 100,
                       created_at TIMESTAMPTZ DEFAULT now(),
                       updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO plans (name, essay_limit, chat_limit, price)
VALUES
    ('База', 1000, 20, 0),
    ('Продвинутый', 5, 30, 250),
    ('Босс ЕГЭ', 10, 50, 500);

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