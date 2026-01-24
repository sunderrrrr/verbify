-- Создаем таблицу чатов
CREATE TABLE chats (
                       user_id     INTEGER NOT NULL,
                       task_id     INTEGER NOT NULL,
                       created_at  TIMESTAMP DEFAULT NOW(),

    -- Составной первичный ключ
                       PRIMARY KEY (user_id, task_id)
);

-- Создаем таблицу сообщений
CREATE TABLE messages (
                          id          SERIAL PRIMARY KEY,
                          user_id     INTEGER NOT NULL,
                          task_id     INTEGER NOT NULL,
                          role        VARCHAR(20) NOT NULL,  -- 'user' или 'assistant'
                          content     TEXT NOT NULL,
                          created_at  TIMESTAMP DEFAULT NOW(),

    -- Внешний ключ ссылается на составной ключ в chats
                          FOREIGN KEY (user_id, task_id)
                              REFERENCES chats(user_id, task_id)
                              ON DELETE CASCADE
);

-- Индексы для ускорения поиска
CREATE INDEX idx_chat_composite ON chats(user_id, task_id);
CREATE INDEX idx_messages_composite ON messages(user_id, task_id);
CREATE INDEX idx_messages_created ON messages(created_at);