-- database/init.sql
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    source VARCHAR(50), -- 'facebook' o 'mercadolibre'
    price NUMERIC(15, 2),
    currency VARCHAR(10) DEFAULT 'COP',
    location TEXT,
    title TEXT,
    main_image TEXT,
    
    -- Aquí guardaremos todo lo que Gemini extraiga (habitaciones, area, analisis, etc)
    ai_data JSONB DEFAULT '{}', 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas en el JSONB (útil a futuro)
CREATE INDEX idx_ai_data ON properties USING GIN (ai_data);