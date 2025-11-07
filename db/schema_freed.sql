-- SQL completo para red social de creadores (TheFreed)
-- Incluye users, profiles, contents, follows, likes, views y media

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Perfil extendido
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de contenido
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  media_url TEXT,
  content_type VARCHAR(10) CHECK (content_type IN ('VIDEO','AUDIO','IMAGE','TEXT','LIVESTREAM')),
  category VARCHAR(50),
  is_premium BOOLEAN DEFAULT FALSE,
  price NUMERIC(10,2) DEFAULT 0,
  visibility VARCHAR(10) DEFAULT 'public',
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de follows (seguimientos)
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES users(id),
  followed_id UUID REFERENCES users(id),
  followed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id)
);

-- Tabla de likes
CREATE TABLE IF NOT EXISTS likes (
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES contents(id),
  liked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, content_id)
);

-- Tabla de views (visualizaciones)
CREATE TABLE IF NOT EXISTS views (
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES contents(id),
  viewed_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, content_id)
);

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id),
  user_id UUID REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Media (storage - indexada)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES contents(id),
  url TEXT,
  media_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
