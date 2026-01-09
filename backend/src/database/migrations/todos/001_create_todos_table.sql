

CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255),
	priority VARCHAR(255) NOT NULL,
	completed BOOLEAN NOT NULL DEFAULT FALSE,
	user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

CREATE INDEX IF NOT EXISTS idx_todos ON todos(id);

