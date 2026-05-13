CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  `order` INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'siswa', 'pengajar') NOT NULL DEFAULT 'siswa',
  tier ENUM('free', 'lite', 'premium') NOT NULL DEFAULT 'free',
  email_verified_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profiles_role (role),
  INDEX idx_profiles_tier (tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE profiles
  MODIFY role ENUM('user', 'admin', 'siswa', 'pengajar') NOT NULL DEFAULT 'siswa';
-- NOTE: kolom `status` (ENUM active|suspended) ditangani via ensureColumn() di scripts/migrate.cjs
-- karena MySQL versi tertentu nggak dukung ADD COLUMN IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS user_credentials (
  user_id VARCHAR(64) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_credentials_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS aksara (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  `char` VARCHAR(20) NOT NULL,
  latin VARCHAR(255) NULL,
  category VARCHAR(100) NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  svg_url TEXT NULL,
  image_url TEXT NULL,
  target_stroke_count INT NOT NULL DEFAULT 0,
  audio_url TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_aksara_category (category),
  INDEX idx_aksara_order (`order`),
  CONSTRAINT fk_aksara_category FOREIGN KEY (category) REFERENCES categories(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS progress (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  aksara_id VARCHAR(64) NULL,
  lesson_id VARCHAR(100) NULL,
  activity_type VARCHAR(50) NULL,
  score INT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_progress_user_id (user_id),
  INDEX idx_progress_aksara_id (aksara_id),
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_aksara FOREIGN KEY (aksara_id) REFERENCES aksara(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stroke_attempts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  aksara_id VARCHAR(64) NULL,
  mode ENUM('practice', 'test', 'nyurat') NOT NULL DEFAULT 'practice',
  score INT NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  mistakes INT NOT NULL DEFAULT 0,
  duration_seconds INT NOT NULL DEFAULT 0,
  stroke_count INT NOT NULL DEFAULT 0,
  metrics JSON NULL,
  raw_strokes JSON NULL,
  normalized_strokes JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stroke_attempts_user (user_id),
  INDEX idx_stroke_attempts_aksara (aksara_id),
  INDEX idx_stroke_attempts_created (created_at),
  CONSTRAINT fk_stroke_attempts_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_stroke_attempts_aksara FOREIGN KEY (aksara_id) REFERENCES aksara(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  duration_seconds INT NOT NULL DEFAULT 0,
  answers JSON NULL,
  result JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_quiz_attempts_user (user_id),
  INDEX idx_quiz_attempts_mode (mode),
  INDEX idx_quiz_attempts_created (created_at),
  CONSTRAINT fk_quiz_attempts_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  plan ENUM('lite', 'pro') NOT NULL,
  status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  start_date DATETIME NOT NULL,
  end_date DATETIME NULL,
  source_order_id VARCHAR(191) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subscriptions_status (status),
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  order_id VARCHAR(191) NOT NULL UNIQUE,
  amount DECIMAL(12, 2) NOT NULL,
  plan ENUM('lite', 'pro') NULL,
  status ENUM('pending', 'success', 'failed', 'expired') NOT NULL DEFAULT 'pending',
  payment_type VARCHAR(100) NULL,
  transaction_time DATETIME NULL,
  midtrans_response JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payment_user_id (user_id),
  INDEX idx_payment_status (status),
  CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  event_name VARCHAR(120) NOT NULL,
  event_payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_analytics_user_id (user_id),
  INDEX idx_analytics_event_name (event_name),
  CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_sessions (
  id VARCHAR(64) PRIMARY KEY,
  pin VARCHAR(12) NOT NULL UNIQUE,
  host_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status ENUM('lobby', 'live', 'finished', 'expired') NOT NULL DEFAULT 'lobby',
  question_count INT NOT NULL DEFAULT 0,
  seconds_per_question INT NOT NULL DEFAULT 20,
  current_question_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_game_sessions_pin (pin),
  INDEX idx_game_sessions_host (host_id),
  CONSTRAINT fk_game_sessions_host FOREIGN KEY (host_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE game_sessions
  MODIFY status ENUM('lobby', 'live', 'finished', 'expired') NOT NULL DEFAULT 'lobby';

CREATE TABLE IF NOT EXISTS game_players (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NULL,
  display_name VARCHAR(255) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_game_player_user (session_id, user_id),
  INDEX idx_game_players_session (session_id),
  CONSTRAINT fk_game_players_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_game_players_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_questions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  question_index INT NOT NULL,
  prompt VARCHAR(255) NOT NULL,
  glyph VARCHAR(20) NOT NULL,
  options JSON NOT NULL,
  correct_option VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_game_question (session_id, question_index),
  INDEX idx_game_questions_session (session_id),
  CONSTRAINT fk_game_questions_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_answers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  question_id BIGINT NOT NULL,
  user_id VARCHAR(64) NULL,
  player_id BIGINT NULL,
  answer VARCHAR(255) NOT NULL,
  correct BOOLEAN NOT NULL DEFAULT FALSE,
  score_delta INT NOT NULL DEFAULT 0,
  elapsed_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_game_answer_user (session_id, question_id, user_id),
  INDEX idx_game_answers_session (session_id),
  INDEX idx_game_answers_question (question_id),
  CONSTRAINT fk_game_answers_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_game_answers_question FOREIGN KEY (question_id) REFERENCES game_questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_game_answers_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT fk_game_answers_player FOREIGN KEY (player_id) REFERENCES game_players(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_by VARCHAR(64) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO app_settings (setting_key, setting_value) VALUES
  ('site_mode', 'live'),
  ('launch_at', '2026-06-30T00:00:00Z')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

INSERT INTO categories (id, name, description, `order`)
VALUES
  ('wrehasta', 'Wrehastra', 'Aksara dasar untuk latihan stroke awal.', 1),
  ('swara', 'Pangangge Suara', 'Sandangan vokal: ulu, suku, taleng, pepet, tedung, taleng tedung.', 20)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), `order` = VALUES(`order`);

-- Pangangge Suara di-seed via script terpisah:
--   npm run db:seed-pangangge
-- Script baca kode Unicode dari config + construct char via String.fromCodePoint,
-- jadi tidak ada literal karakter aksara di SQL atau JS.

INSERT INTO aksara (id, name, `char`, latin, category, `order`, is_premium, svg_url, image_url, target_stroke_count, notes)
VALUES (
  'gabungan-vokal-ki-1B13-1B36',
  'Ki',
  CONVERT(UNHEX('E1AC93E1ACB6') USING utf8mb4),
  'ki',
  'gabungan-vokal',
  1,
  FALSE,
  '/aksara/strokes/gabungan-vokal/ki-1B13-1B36.svg',
  '/aksara/cards/gabungan-vokal/ki-1B13-1B36.noto.png',
  2,
  'Materi Ki. Ulu memakai U+1B36, sehingga bacaan yang benar adalah ki.'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  `char` = VALUES(`char`),
  latin = VALUES(latin),
  category = VALUES(category),
  `order` = VALUES(`order`),
  svg_url = VALUES(svg_url),
  image_url = VALUES(image_url),
  target_stroke_count = VALUES(target_stroke_count),
  notes = VALUES(notes);
